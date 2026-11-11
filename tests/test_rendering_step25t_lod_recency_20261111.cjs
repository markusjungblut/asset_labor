'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const runtime=fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8');
const policy=fs.readFileSync(path.join(root,'frozen-map-view-policy.js'),'utf8');
const game=fs.readFileSync(path.join(root,'frozen-map-game.js'),'utf8');
const html=fs.readFileSync(path.join(root,'frozen-map-game.html'),'utf8');
const SCENE='v1-12345678';
function fixture({lodRecency=true,maxDecodedPixels=5000000}={}){
 const w={};vm.runInNewContext(policy,{window:w});
 const drawings=[],closed=[];
 const ctx=()=>({setTransform(){},save(){},restore(){},beginPath(){},
  moveTo(){},lineTo(){},closePath(){},clip(){},clearRect(){},
  fillRect(){},fill(){},drawImage(image){
   if(image?.id)drawings.push(image.id);
  }});
 const canvas={width:0,height:0,getContext:ctx,
  getBoundingClientRect:()=>({width:640,height:420})};
 const document={createElement:()=>({getContext:ctx})};
 let time=0;
 vm.runInNewContext(runtime,{window:w,document,console,
  performance:{now:()=>++time},requestAnimationFrame:()=>{}});
 const records=new Map(),reads=[];
 for(let x=-5;x<=5;x++)for(let y=-4;y<=4;y++){
  const key=SCENE+'|near|'+x+','+y;
  records.set(key,{key,sceneKey:SCENE,level:'near',
   tile:{id:x+','+y,x:x*512,y:y*512,size:512},
   layers:[{layer:'ground'},{layer:'scenery'}]});
 }
 const storage={
  keys:async prefix=>[...records.keys()].filter(k=>k.startsWith(prefix)),
  getVariant:async (key,variant)=>{
   reads.push({key,variant});
   const rec=records.get(key);
   if(!rec)return null;
   return {...rec,layers:rec.layers.map((l,i)=>({...l,
    png:{id:l.layer+':'+rec.tile.id+':'+variant,
     width:variant==='1x'?256:512,
     height:variant==='1x'?256:512}}))};
  }
 };
 const player=w.VedrasFrozenMap.create({canvas,storage,overview1x:true,
  maxDecodedPixels,lodRecency,directionalPrefetch:true,prefetchGuard:true,
  useLayerCache:false,decode:async image=>({...image,close(){
   closed.push(image.id);
  }})});
 return {player,reads,drawings,closed};
}
const ZOOM_ROUTE=[.5,.85,.5,.85,.5,.85].map(zoom=>({zoom}));
const MIXED_ROUTE=[{zoom:.5},{zoom:.85,panX:-550},
 {zoom:.5,panX:-550},{zoom:.85,panX:0},
 {zoom:.5,panX:0},{zoom:.85,panX:-550},
 {zoom:.5,panX:0},{zoom:.85,panX:0}];
const PAN_ROUTE=[{panX:-550},{panX:-1100},
 {panX:-550},{panX:0},{panX:-550},{panX:-1100},{panX:0}];
async function trace(options,route,draws=10){
 const f=fixture(options);
 const player=f.player;
 await player.load(SCENE,'near',
  {zoom:.85,panX:0,panY:0,dpr:1.25,projectY:.85},
  [{q:0,r:0,x:0,y:0,radius:145,visibility:'visible'}]);
 const paint=async()=>{player.draw();for(let k=0;k<12;k++)await Promise.resolve();};
 for(let j=0;j<draws;j++)await paint();
 for(const pose of route){
  player.setPose(pose);
  for(let j=0;j<draws;j++)await paint();
 }
 const report=player.report();
 player.stop();
 assert.equal(f.closed.length,report.loads*2,
  'stop must release all bitmap layers, including evicted entries');
 return report;
}
test('25T recently visible 2x/1x bitmaps survive repeated zoom reversals',async()=>{
 const opt={maxDecodedPixels:5000000};
 const baseline=await trace({...opt,lodRecency:false},ZOOM_ROUTE);
 const improved=await trace({...opt,lodRecency:true},ZOOM_ROUTE);
 assert.equal(baseline.lodRecency,false);
 assert.equal(improved.lodRecency,true);
 assert.equal(baseline.failures,0);assert.equal(improved.failures,0);
 assert.ok(baseline.decodeRepeats>=20,'must exercise real cache thrashing');
 assert.ok(improved.decodeRepeats<baseline.decodeRepeats*.3,
  'recency eviction must remove most repeat 1x/2x decodes');
 assert.ok(improved.evictions<baseline.evictions*.5,
  'keep recently visible images rather than evict on LOD label alone');
 assert.ok(improved.visibleReadStarts<baseline.visibleReadStarts);
 assert.ok(improved.lodRecencyEvictions>0,
  'must use the recency-based choice rather than just legacy fallback');
 assert.equal(baseline.lodRecencyEvictions,0);
 assert.equal(improved.maxDecodedPixels,baseline.maxDecodedPixels);
 assert.ok(improved.decodedPixels<=improved.maxDecodedPixels);
 assert.ok(baseline.decodedPixels<=baseline.maxDecodedPixels);
});
test('25T benefit extends to mixed pan and zoom without extra storage writes',async()=>{
 const opt={maxDecodedPixels:5000000};
 const old=await trace({...opt,lodRecency:false},MIXED_ROUTE);
 const trial=await trace({...opt,lodRecency:true},MIXED_ROUTE);
 assert.ok(trial.decodeRepeats<old.decodeRepeats);
 assert.ok(trial.visibleReadStarts<old.visibleReadStarts);
 assert.ok(trial.evictions<old.evictions);
 assert.equal(trial.prefetchReadStarts,old.prefetchReadStarts);
 assert.equal(trial.failures,0);
});
test('25T unchanged results for panning without any zoom/LOD transition',async()=>{
 const opt={maxDecodedPixels:5000000};
 const old=await trace({...opt,lodRecency:false},PAN_ROUTE);
 const trial=await trace({...opt,lodRecency:true},PAN_ROUTE);
 for(const k of ['decodeRepeats','visibleReadStarts','evictions',
  'loads','prefetchReadStarts','failures'])
  assert.equal(trial[k],old[k],k+' on same-LOD camera reversal');
 assert.equal(trial.lodRecencyEvictions,0);
});
test('25T fully warm 1x+2x cache requires no extra IO in either mode',async()=>{
 const opt={maxDecodedPixels:9500000};
 const old=await trace({...opt,lodRecency:false},ZOOM_ROUTE);
 const trial=await trace({...opt,lodRecency:true},ZOOM_ROUTE);
 for(const r of [old,trial]){
  assert.equal(r.decodeRepeats,0);
  assert.equal(r.evictions,0);
  assert.equal(r.failures,0);
 }
 assert.equal(old.visibleReadStarts,trial.visibleReadStarts);
});
test('25T extremely low RAM may trade one decode for fewer evictions',async()=>{
 const opt={maxDecodedPixels:3000000};
 const old=await trace({...opt,lodRecency:false},MIXED_ROUTE);
 const trial=await trace({...opt,lodRecency:true},MIXED_ROUTE);
 assert.ok(trial.decodeRepeats<=old.decodeRepeats+1,
  'do not hide the tight-budget negative control');
 assert.ok(trial.evictions<=old.evictions);
 assert.ok(trial.decodedPixels<=trial.maxDecodedPixels);
});
test('25T opt-out and static archive security semantics remain available',()=>{
 assert.match(game,/params\.get\('lodRecency'\)!=='0'/);
 assert.match(runtime,/lodRecency=true/);
 assert.match(runtime,/lastVisibleFrame/);
 assert.match(html,/frozen-map-runtime\.js\?v=/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 for(const s of [runtime,game])assert.doesNotThrow(()=>new Function(s));
});

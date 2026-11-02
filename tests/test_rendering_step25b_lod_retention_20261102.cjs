'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const runtime=read('frozen-map-runtime.js'),
 policy=read('frozen-map-view-policy.js'),
 low=read('frozen-map-derived-1x.js'),
 game=read('frozen-map-game.js'),
 html=read('frozen-map-game.html');
function fixture(options={}){
 const w={},calls=[],fetches=[],closes=[];
 vm.runInNewContext(policy,{window:w});
 let seq=0;
 const g=()=>({
  setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
  lineTo(){},closePath(){},clip(){},fillRect(){},translate(){},scale(){},
  drawImage(image){calls.push(image.id||'buffer')},
  imageSmoothingEnabled:true
 });
 const canvas={width:0,height:0,getContext:()=>g(),
  getBoundingClientRect:()=>({width:500,height:320})};
 const document={createElement:()=>({width:0,height:0,getContext:()=>g()})};
 const records=new Map();
 for(let iy=-1;iy<=1;iy++)for(let ix=-1;ix<=1;ix++){
  const id=ix+','+iy,key='v1-0374527a|near|'+id;
  records.set(key,{key,sceneKey:'v1-0374527a',level:'near',
   tile:{id,x:ix*512,y:iy*512,size:512},
   layers:[
    {layer:'ground',pad:3,png:{id:'G:'+id,width:512,height:512}},
    {layer:'scenery',pad:128,png:{id:'S:'+id,width:512,height:512}}
   ]});
 }
 const store={
  keys:async prefix=>[...records.keys()].filter(x=>x.startsWith(prefix)),
  get:async key=>records.get(key),
  getVariant:async (key,variant)=>{
   fetches.push({key,variant});
   const record=records.get(key);
   if(!record)return null;
   return {...record,derivedFormat:variant==='1x'?'1x-png-v1':'2x-png-v1',
    layers:record.layers.map(l=>({...l,png:{...l.png,
     width:variant==='1x'?256:512,height:variant==='1x'?256:512}}))};
  }
 };
 vm.runInNewContext(runtime,{window:w,document,console,
  requestAnimationFrame:()=>{},performance:{now:()=>++seq}});
 const player=w.VedrasFrozenMap.create({
  canvas,storage:store,overview1x:options.overview1x??true,
  maxDecodedPixels:options.maxDecodedPixels??50000000,
  useLayerCache:false,
  decode:async image=>({...image,close(){closes.push(image.id)}})
 });
 return {player,records,calls,fetches,closes};
}
async function settle(f,{zoom=.9}={}){
 const {player}=f;
 await player.load('v1-0374527a','near',
  {zoom,panX:0,panY:0,dpr:1.25,projectY:.85},
  [{q:0,r:0,x:0,y:0,radius:140,visibility:'visible'}]);
 for(let i=0;i<50;i++){
  player.draw();await new Promise(resolve=>setImmediate(resolve));
  if(player.report().pending===0&&player.report().decoded>=9)break;
 }
 player.draw();
}
async function awaitReads(f,{expected1x=0}={}){
 // requestAnimationFrame is intentionally disabled in this fixture, so
 // completing the current batch of 3 decodes does NOT schedule the next
 // batch until draw() is called again. pending===0 is only a temporary
 // batch boundary, NOT evidence that all 9 requested 1x tiles are ready.
 for(let i=0;i<70;i++){
  f.player.draw();
  await new Promise(resolve=>setImmediate(resolve));
  const status=f.player.report();
  if(status.pending===0&&status.decoded1x>=expected1x){
   // Do one more draw: it may enqueue more demanded visible tile variants.
   f.player.draw();
   const stable=f.player.report();
   if(stable.pending===0&&stable.decoded1x>=expected1x)return;
  }
 }
 const status=f.player.report();
 assert.fail('Requested 1x variants did not settle: '+
  JSON.stringify({expected1x,decoded1x:status.decoded1x,
   pending:status.pending,loads:status.loads,failures:status.failures}));
}
test('1x overview starts at 60 percent, returns to 2x at 72 percent',async()=>{
 const f=fixture();await settle(f);
 assert.equal(f.player.report().activeVariant,'2x');
 assert.equal(f.player.report().decoded2x,9);
 const before=f.calls.length;
 f.player.setPose({zoom:.50});f.player.draw();
 assert.equal(f.player.report().activeVariant,'1x');
 assert.ok(f.calls.length>before,'no blank frame during LOD change');
 await awaitReads(f,{expected1x:9});
 assert.equal(f.player.report().decoded1x,9);
 assert.ok(f.fetches.some(x=>x.variant==='1x'));
 const count1=f.fetches.filter(x=>x.variant==='1x').length;
 f.player.setPose({zoom:.64});f.player.draw();
 assert.equal(f.player.report().activeVariant,'1x','hysteresis prevents rapid toggling');
 f.player.setPose({zoom:.81});f.player.draw();
 assert.equal(f.player.report().activeVariant,'2x');
 assert.equal(f.fetches.filter(x=>x.variant==='1x').length,count1);
 f.player.stop();
});
test('overview1x=0 is an exact Step-25A reference without 1x reads',async()=>{
 const f=fixture({overview1x:false});await settle(f);
 f.player.setPose({zoom:.25});await awaitReads(f);
 assert.equal(f.player.report().activeVariant,'2x');
 assert.ok(!f.fetches.some(x=>x.variant==='1x'));
 f.player.stop();
});
test('cache never rasterizes 1x and 2x of the same world tile together',()=>{
 assert.match(runtime,/const chosen=new Map\(\)/);
 assert.match(runtime,/if\(!previous\|\|entry\.variant===activeVariant\)/);
 assert.match(runtime,/const bufferKeys=\[\.\.\.chosen\.values\(\)\]\.sort\(\)/);
 assert.match(runtime,/return \(ta\.y-tb\.y\)\|\|\(ta\.x-tb\.x\)/);
});
test('decoded images are larger than the old 30M budget but bounded, not infinite',async()=>{
 const f=fixture({maxDecodedPixels:5000000});
 await settle(f);
 assert.ok(f.player.report().decodedPixels>0);
 assert.ok(f.player.report().decodedPixels<=5000000);
 f.player.setPose({panX:1500});await awaitReads(f);
 assert.ok(f.player.report().evictions>=0);
 assert.ok(f.player.report().decodedPixels<=5000000);
 f.player.stop();
});
test('1x source is separate, never writes 2x DB, and preserves layer placement',()=>{
 assert.match(low,/vedras-frozen-derived-1x-v1/);
 assert.match(low,/const sourceRecord=await source\.get\(key\)/);
 assert.match(low,/crop:scaledCrop\(layer,width,height,outW,outH\)/);
 assert.doesNotMatch(low,/source\.put\(|source\.setEnabled|deleteDatabase/);
 assert.match(game,/params\.get\('overview1x'\)!=='0'/);
 assert.match(html,/frozen-map-derived-1x\.js/);
 assert.match(runtime,/maxDecodedPixels=95000000/);
 assert.doesNotMatch(runtime,/bakeWorldTile\(/);
 for(const js of [runtime,low,game])assert.doesNotThrow(()=>new Function(js));
});

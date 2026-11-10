'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),source=n=>
 fs.readFileSync(path.join(root,n),'utf8');
const helper=source('frozen-map-world-blit.js'),
 runtime=source('frozen-map-runtime.js'),
 policy=source('frozen-map-view-policy.js'),
 game=source('frozen-map-game.js'),html=source('frozen-map-game.html');
function api(){
 const w={};vm.runInNewContext(helper,{window:w,Float64Array});
 return w.VedrasFrozenWorldBlit;
}
function largeCells(){
 const cells=[];
 for(let y=-50;y<50;y++)for(let x=-75;x<75;x++)
  cells.push({q:x,r:y,x:x*360,y:y*320,radius:140+(x+75)%7,
   visibility:(x+y)%11===0?'hidden':(x+y)%5===0?'explored':'visible'});
 return cells;
}
test('15k authorized hexes: spatial subset is conservative and blit rects are identical',()=>{
 const {plan,createIndex}=api(),cells=largeCells(),index=createIndex(cells);
 assert.ok(index&&index.entries>13000);
 let oldCandidates=0,newCandidates=0;
 for(const dpr of [1,1.37,2]){
  for(const zoom of [.3,.85,1.8]){
   for(const [panX,panY] of [[0,0],[-430,225],[6000,-2450],
     [-8000,4200],[27000,16000],[95000,-55000]]){
    const view={width:1600,height:920,zoom,panX,panY,projectY:.85};
    const filtered=index.query(view,dpr);
    assert.ok(Array.isArray(filtered));
    oldCandidates+=cells.length;newCandidates+=filtered.length;
    assert.equal(JSON.stringify(plan(view,filtered,dpr)),
     JSON.stringify(plan(view,cells,dpr)),
     'identical device-pixel rectangles under pan/zoom/DPR');
   }
  }
 }
 assert.ok(newCandidates<oldCandidates*.1,
  'broad-world tests should inspect >90% fewer input hex cells');
});
test('index retains oversized and fractional-radius clip coverage at edge',()=>{
 const a=api(),cells=largeCells();
 cells.push({q:999,r:999,x:30000,y:12000,radius:950,
  visibility:'explored'});
 const index=a.createIndex(cells);
 for(const panX of [-25000,-25500,-26300]){
  const view={width:1200,height:800,zoom:.85,panX,
   panY:-10000,projectY:.85};
  assert.equal(JSON.stringify(a.plan(view,index.query(view,1.33),1.33)),
   JSON.stringify(a.plan(view,cells,1.33)));
 }
});
test('malformed geometry and small scenes keep unchanged full-scan fallback',()=>{
 const a=api(),small=largeCells().slice(0,120);
 assert.equal(a.createIndex(small),null);
 assert.equal(a.createIndex(small,{minimumCells:256}),null);
 const compact397=largeCells().slice(0,397);
 assert.equal(a.createIndex(compact397),null);
 assert.equal(a.createIndex(compact397,{minimumCells:256}).entries,
  compact397.filter(cell=>cell.visibility!=='hidden').length);
 const bad=[...largeCells(),{x:0,y:0,radius:NaN,visibility:'visible'}];
 assert.equal(a.createIndex(bad),null);
 const index=a.createIndex(largeCells());
 assert.equal(index.query({width:100,height:100,zoom:0,panX:0,panY:0},1),null);
 assert.equal(index.query({width:100,height:100,zoom:1,panX:0,panY:0},0),null);
 const withoutAuth=Array.from({length:400},(_,i)=>({x:i,y:i,radius:70,visibility:'hidden'}));
 assert.equal(a.createIndex(withoutAuth).entries,0);
});
test('runtime binds index to load/stop lifecycle and preserves opt-out',async()=>{
 const a=api(),w={VedrasFrozenWorldBlit:a};
 vm.runInNewContext(policy,{window:w});
 const mainOps=[],ctx=(k)=>({setTransform(){},save(){},restore(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},rect(){},
  translate(){},scale(){},clearRect(){},fillRect(){},fill(){},
  drawImage(...v){if(k==='main')mainOps.push(v)}});
 const canvas={width:0,height:0,getContext:()=>ctx('main'),
  getBoundingClientRect:()=>({width:1200,height:800})};
 const document={createElement:()=>({width:0,height:0,getContext:()=>ctx('off')})};
 const scene='v1-0374527a',key=scene+'|near|0,0',
  png={width:80,height:80,close(){}},storage={
  keys:async()=>[key],
  get:async()=>({key,sceneKey:scene,level:'near',
   tile:{id:'0,0',x:0,y:0,size:512},layers:[
    {layer:'ground',pad:0,png},{layer:'scenery',pad:0,png}]})
 };
 let t=0;vm.runInNewContext(runtime,{window:w,document,console,
  performance:{now:()=>++t},requestAnimationFrame:()=>{}});
 const make=enabled=>w.VedrasFrozenMap.create({canvas,storage,
  sparseWorldBlit:true,indexedWorldBands:enabled,overview1x:false,
  decode:async()=>png});
 const indexed=make(true),legacy=make(false),cells=largeCells(),
  pose={zoom:.85,panX:0,panY:0,dpr:1.25,projectY:.85};
 await indexed.load(scene,'near',pose,cells);
 for(let i=0;i<3;i++){indexed.draw();await new Promise(r=>setImmediate(r));}
 const r=indexed.report();
 assert.equal(r.worldBandIndexActive,true);
 assert.ok(r.worldBandIndexEntries>13000);
 assert.ok(r.worldBandIndexQueries>=1);
 assert.ok(r.worldBandIndexCandidateCells<r.worldBandIndexQueries*150);
 indexed.stop();assert.equal(indexed.report().worldBandIndexActive,false);
 await legacy.load(scene,'near',pose,cells);
 for(let i=0;i<3;i++){legacy.draw();await new Promise(r=>setImmediate(r));}
 const old=legacy.report();
 assert.equal(old.worldBandIndexActive,false);
 assert.ok(old.worldBandLegacyCandidateCells>=15000);
 assert.equal(r.worldBlitLastFraction,old.worldBlitLastFraction);
 indexed.stop();legacy.stop();
});
test('separate visible switch and original atlas are preserved',()=>{
 assert.match(game,/params\.get\('bandIndex'\)!=='0'/);
 assert.match(game,/profileRequested&&params\.get\('bandIndexMin'\)==='256'/);
 assert.match(runtime,/minimumCells:worldBandIndexMinCells===256\?256:400/);
 assert.ok(html.includes('id="optWorldBandIndex"'));
 assert.match(game,/'optWorldBandIndex','bandIndex',indexedWorldBands/);
 assert.match(runtime,/worldBandIndex\.query\(view,dpr\)/);
 assert.match(runtime,/worldBandIndex=null/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 for(const s of [helper,runtime,policy,game])assert.doesNotThrow(()=>new Function(s));
});

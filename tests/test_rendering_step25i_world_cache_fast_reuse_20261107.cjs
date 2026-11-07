'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const runtime=read('frozen-map-runtime.js');
const policy=read('frozen-map-view-policy.js');
const profilerSource=read('frozen-map-profiler.js');
const game=read('frozen-map-game.js');
const scene='v1-0374527a';
const key=id=>scene+'|near|'+id;

function fixture(worldCacheFastReuse=true){
 const window={},worldOps=[],mainOps=[];
 vm.runInNewContext(policy,{window});
 vm.runInNewContext(profilerSource,{window,performance:{now:()=>0}});
 const ctx=kind=>({
  setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
  lineTo(){},closePath(){},clip(){},translate(){},scale(){},
  rect(){},clearRect(){},fillRect(){},
  drawImage(image,...args){
   const op={source:image?.id||'raster',args:[...args]};
   (kind==='main'?mainOps:worldOps).push(op);
  }
 });
 const canvas={width:0,height:0,getContext:()=>ctx('main'),
  getBoundingClientRect:()=>({width:500,height:320})};
 const document={createElement:()=>({width:0,height:0,getContext:()=>ctx('world')})};
 const records=new Map();
 for(const id of ['0,0','1,0']){
  const x=Number(id.split(',')[0])*512;
  records.set(key(id),{key:key(id),sceneKey:scene,level:'near',
   tile:{id,x,y:0,size:512},revision:'r1',layers:[
    {layer:'ground',pad:3,png:{id:'G:'+id,width:512,height:512}},
    {layer:'scenery',pad:128,png:{id:'S:'+id,width:768,height:768}}
   ]});
 }
 let deliverSecond;
 const deferred=new Promise(resolve=>{
  deliverSecond=()=>resolve(records.get(key('1,0')));
 });
 const storage={
  async keys(prefix){return [...records.keys()].filter(k=>k.startsWith(prefix));},
  async getVariant(k){return k===key('1,0')?deferred:records.get(k);}
 };
 window.VedrasCloudArtwork={create:()=>({
  setSeed(){},setAssets(){},stats:()=>({bases:0}),
  drawBase(){},drawUnready(){},drawTransitions(){}
 })};
 let now=0;
 vm.runInNewContext(runtime,{window,document,console,
  performance:{now:()=>++now},requestAnimationFrame:()=>{}});
 const profiler=window.VedrasFrozenProfiler.create({now:()=>++now});
 const player=window.VedrasFrozenMap.create({canvas,storage,profiler,
  worldCacheFastReuse,streamingWorldCache:true,
  maxDecodedPixels:10000000,overview1x:false,
  decode:async png=>({...png,close(){}})});
 return {player,profiler,mainOps,worldOps,deliverSecond};
}
async function tick(f,n=1){
 for(let i=0;i<n;i++){
  f.player.draw();
  await new Promise(resolve=>setImmediate(resolve));
 }
}
async function start(f){
 await f.player.load(scene,'near',
  {zoom:.8,panX:-250,panY:0,dpr:1.25,projectY:.85},
  [{q:0,r:0,x:256,y:256,radius:80,visibility:'visible'},
   {q:1,r:0,x:620,y:256,radius:80,visibility:'visible'}]);
 await tick(f,4);
 assert.equal(f.player.report().decoded,1);
 assert.ok(f.player.report().overviewRasterBuilds>=1);
 assert.equal(f.player.report().pending,1);
}
test('world-fast reuse skips every decoded-map recheck during stable pan and partial streaming',async()=>{
 const f=fixture(true);await start(f);
 const before=f.player.report();
 await tick(f,7);
 const after=f.player.report();
 assert.equal(after.worldCacheFastReuse,true);
 assert.equal(after.overviewRechecks,before.overviewRechecks,
  'warm cache hits must not scan and sort all decoded tiles');
 assert.ok(after.overviewFastHits>=before.overviewFastHits+7);
 assert.equal(after.overviewRasterBuilds,before.overviewRasterBuilds);
 assert.equal(after.worldCacheFallbackFrames,before.worldCacheFallbackFrames);
 assert.ok(after.overviewStreamingHits>=before.overviewStreamingHits+7);
 assert.ok(f.mainOps.some(x=>x.source==='raster'),
  'fast reuse must still composite the panorama to the display canvas');
 const profile=f.profiler.report();
 assert.ok(profile.phasesMs.worldPrepareMs.count>0);
 assert.ok(profile.phasesMs.worldBlitMs.count>0);
 assert.equal(profile.frames.at(-1).worldCacheFastHits,after.overviewFastHits);
 f.deliverSecond();await tick(f,5);f.player.stop();
});
test('arriving decoded PNG invalidates fast hit and retains dirty patch and Fog safety',async()=>{
 const f=fixture(true);await start(f);
 await tick(f,3);
 const before=f.player.report();
 f.deliverSecond();await tick(f,5);
 const after=f.player.report();
 assert.equal(after.decoded,2);
 assert.equal(after.failures,0);
 assert.ok(after.overviewRechecks>before.overviewRechecks,
  'new decoded content must run the full tile signature validation');
 assert.ok(after.overviewPatchBuilds>0,
  'new decoded tile must patch the existing raster instead of stale reuse');
 assert.equal(after.overviewRasterBuilds,before.overviewRasterBuilds);
 assert.ok(f.worldOps.some(x=>x.source==='G:1,0'));
 assert.ok(f.worldOps.some(x=>x.source==='S:1,0'));
 const warm=after.overviewRechecks;
 await tick(f,4);
 assert.equal(f.player.report().overviewRechecks,warm,
  'after patch, stable scenes resume fast reuse');
 f.player.stop();
});
test('worldFast=0 forces original signature scan without disabling world raster reuse',async()=>{
 const f=fixture(false);await start(f);
 const first=f.player.report();
 await tick(f,7);
 const after=f.player.report();
 assert.equal(after.worldCacheFastReuse,false);
 assert.equal(after.overviewFastHits,0);
 assert.ok(after.overviewRechecks>=first.overviewRechecks+7);
 assert.ok(after.overviewRasterHits>=first.overviewRasterHits+7);
 assert.equal(after.overviewRasterBuilds,first.overviewRasterBuilds);
 assert.ok(f.mainOps.filter(x=>x.source==='raster').length>=7);
 f.deliverSecond();await tick(f,5);f.player.stop();
});
test('moving beyond raster padding or changing camera projection revalidates world geometry',async()=>{
 const f=fixture(true);await start(f);
 f.deliverSecond();await tick(f,5);
 await tick(f,3);
 const first=f.player.report();
 f.player.setPose({panX:400});
 await tick(f,2);
 const afterPan=f.player.report();
 assert.ok(afterPan.overviewRechecks>first.overviewRechecks,
  'large pan outside buffered image must invalidate the fast path');
 const beforeProj=f.player.report().overviewRechecks;
 f.player.setPose({projectY:.92});
 await tick(f,1);
 assert.ok(f.player.report().overviewRechecks>beforeProj,
  'projection changes must not silently reuse the old raster');
 f.player.stop();
});
test('standalone read-only A/B toggle and independent world phases remain instrumented',()=>{
 assert.match(game,/params\.get\('worldFast'\)!=='0'/);
 assert.match(runtime,/decodedRevision\+\+/);
 assert.match(runtime,/overviewRaster\.decodedRevision===decodedRevision/);
 assert.match(runtime,/profileFrame\.worldBlitMs\+=clock\(\)-blitStart/);
 assert.match(runtime,/old\.decodedRevision=decodedRevision/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 assert.match(runtime,/const reusable=worldCacheFastReuse&&overviewRaster/);
 for(const code of [runtime,policy,game,profilerSource])
  assert.doesNotThrow(()=>new Function(code));
});

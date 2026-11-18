'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','frozen-map-runtime.js'),'utf8');
// Test-only access to the existing closure; no extra export in production.
const needle='  return {capture,captureScenery,load,stop,draw,report,getPose,setPose,setClouds,';
assert.equal(source.split(needle).length,2,'Runtime test probe anchor changed');
const instrumented=source.replace(needle,`  return {__probe:{
   seed(entries,pins){
    decoded.clear();decodedPixels=0;
    protectedKeys=new Set(pins);
    for(const entry of entries){
     decoded.set(entry.id,{
      variant:entry.variant,pixels:entry.pixels,
      origin:'visible',lastVisibleFrame:0,images:[{close(){}}]
     });
     decodedPixels+=entry.pixels;
    }
   },
   has:id=>decoded.has(id),enforce:keepWithinBudget,
   read,warmFallback
  },capture,captureScenery,load,stop,draw,report,getPose,setPose,setClouds,`);
const scene='v1-0374527a';
const keys=Array.from({length:3},(_,i)=>scene+'|near|'+i+',0');
const wait=()=>new Promise(resolve=>setTimeout(resolve,0));
function setup(enabled,maxDecodedPixels=55000){
 const sandbox={window:{},performance:{now:()=>Date.now()}};
 vm.createContext(sandbox);
 vm.runInContext(instrumented,sandbox,{timeout:4000});
 const storage={
  keys:async()=>keys,
  getVariant:async(key,variant)=>({
   key,sceneKey:scene,level:'near',tile:{id:key.slice(key.lastIndexOf('|')+1)},
   derivedFormat:variant==='1x'?'1x-png-v1':'2x-png-v1',
   layers:[{layer:'ground',png:{size:4000}}]
  })
 };
 const player=sandbox.window.VedrasFrozenMap.create({
  canvas:{getContext:()=>({})},storage,
  decode:async()=>({width:100,height:100,close(){}}),
  fallbackAtlas:enabled,overview1x:true,lodRecency:false,
  directionalPrefetch:false,visibleBorrow:false,
  parallelLayerDecode:false,maxDecodedPixels,
  onStatus:()=>{}
 });
 return player;
}
test('hard bitmap RAM limit protects visible and compact 1x over offscreen 2x',()=>{
 const entries=[
  {id:'a~1x',variant:'1x',pixels:10000},
  {id:'b~1x',variant:'1x',pixels:10000},
  {id:'c~2x',variant:'2x',pixels:25000},
  {id:'d~2x',variant:'2x',pixels:25000}
 ];
 const experiment=setup(true);
 experiment.__probe.seed(entries,['d~2x']);
 experiment.__probe.enforce();
 assert.equal(experiment.__probe.has('a~1x'),true);
 assert.equal(experiment.__probe.has('b~1x'),true);
 assert.equal(experiment.__probe.has('c~2x'),true);
 assert.equal(experiment.__probe.has('d~2x'),true);
 assert.ok(experiment.report().decodedPixels<=experiment.report().effectiveDecodedBudget);
 assert.ok(experiment.report().fallbackMemoryAllowance>0);
 const control=setup(false);
 control.__probe.seed(entries,['d~2x']);
 control.__probe.enforce();
 assert.equal(control.__probe.has('a~1x'),false);
 assert.equal(control.__probe.has('b~1x'),false);
 assert.equal(control.__probe.has('c~2x'),true);
 assert.ok(control.report().decodedPixels<=55000);
});
test('1x safety bitmaps cannot be evicted under fully pinned 4x pressure',()=>{
 const t=setup(true);
 t.__probe.seed([
  {id:'s1~1x',variant:'1x',pixels:12000},
  {id:'s2~1x',variant:'1x',pixels:12000},
  {id:'s3~1x',variant:'1x',pixels:12000},
  {id:'a~2x',variant:'2x',pixels:42000},
  {id:'b~2x',variant:'2x',pixels:42000}
 ],['a~2x','b~2x']);
 const before=t.report().decodedPixels;
 t.__probe.enforce();
 for(const id of ['s1~1x','s2~1x','s3~1x','a~2x','b~2x'])
  assert.equal(t.__probe.has(id),true,id);
 assert.equal(t.report().decodedPixels,before);
 assert.equal(t.report().evictions,0);
 assert.equal(t.report().fallbackSafetyPressure,1);
 assert.ok(t.report().effectiveDecodedBudget<before,
  'soft budget exceed is observable, never hidden');
 t.stop();
});
test('warmup decodes 1x through read-only storage without writing',async()=>{
 const player=setup(true);
 await player.load(scene,'near',{zoom:.46,dpr:1.25,panX:0,panY:0},[]);
 for(let i=0;i<12;i++){player.__probe.warmFallback();await wait();}
 const stats=player.report();
 assert.equal(stats.fallbackAtlasEnabled,true);
 assert.equal(stats.fallbackWarmTarget,3);
 assert.equal(stats.fallbackWarmResident,3);
 assert.equal(stats.fallbackWarmFinished,true);
 assert.equal(stats.fallbackWarmStarts,3);
 assert.ok(stats.fallbackResidentPixels<=55000);
 player.stop();
});
test('obsolete full-resolution load is skipped only with opt-in enabled',async()=>{
 for(const enabled of [true,false]){
  const player=setup(enabled);
  await player.load(scene,'near',{zoom:.90,dpr:2,panX:0,panY:0},[]);
  player.__probe.read(keys[0],'2x','visible');
  await wait();await wait();
  const stats=player.report();
  assert.equal(stats.fallbackStaleStorageSkips,enabled?1:0);
  if(!enabled)assert.ok(stats.decoded>=1);
  player.stop();
 }
});

test('profile-11 scale: 120 compact safety images never get evicted by moving 4x Ground',()=>{
 const player=setup(true,128000000);
 const scene='v1-0374527a';
 const oneX=Array.from({length:120},(_,i)=>({
  id:scene+'|near|'+i+',0~1x',variant:'1x',pixels:360000
 }));
 const hi=Array.from({length:70},(_,i)=>({
  id:scene+'|near|'+i+',0~2x',variant:'2x',pixels:2600000
 }));
 const pins=hi.slice(0,28).map(x=>x.id);
 player.__probe.seed([...oneX,...hi],pins);
 player.__probe.enforce();
 const stats=player.report();
 assert.equal(stats.decoded1x,120);
 assert.equal(stats.fallbackMemoryAllowance,43200000);
 assert.ok(stats.evictions>0,'offscreen high detail may be evicted');
 assert.ok(stats.decoded2x>=28,'all visible 4x tiles remain');
 assert.ok(stats.decodedPixels<=stats.effectiveDecodedBudget);
 for(const x of oneX)assert.equal(player.__probe.has(x.id),true);
 for(const key of pins)assert.equal(player.__probe.has(key),true);
 player.__probe.enforce();
 assert.equal(player.report().evictions,stats.evictions,
  'a second budget pass cannot recycle already warm fallback tiles');
 player.stop();
});

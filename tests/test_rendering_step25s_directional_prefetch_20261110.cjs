'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.join(__dirname,'..');
const runtime=fs.readFileSync(path.join(base,'frozen-map-runtime.js'),'utf8');
const policy=fs.readFileSync(path.join(base,'frozen-map-view-policy.js'),'utf8');
const SCENE='v1-12345678';
function fixture(directionalPrefetch){
 const window={};vm.runInNewContext(policy,{window});
 const ctx=()=>({setTransform(){},save(){},restore(){},beginPath(){},
  moveTo(){},lineTo(){},closePath(){},clip(){},clearRect(){},
  fillRect(){},fill(){},drawImage(){}});
 const canvas={width:0,height:0,getContext:ctx,
  getBoundingClientRect:()=>({width:600,height:340})};
 let n=0;
 vm.runInNewContext(runtime,{window,document:{createElement:()=>
  ({getContext:ctx})},console,
  performance:{now:()=>++n},requestAnimationFrame:()=>{}});
 const records=new Map();
 // 55 immutable pre-exported tiles. Synthetic decoded packet size is
 // deliberately smaller than the 95M default to exercise a tight budget.
 for(let x=-5;x<=5;x++)for(let y=-2;y<=2;y++){
  const key=SCENE+'|near|'+x+','+y,png={width:512,height:512};
  records.set(key,{key,sceneKey:SCENE,level:'near',
   tile:{id:x+','+y,x:x*512,y:y*512,size:512},
   layers:[{layer:'ground',png},{layer:'scenery',png}]});
 }
 const storage={keys:async prefix=>[...records.keys()].filter(k=>
  k.startsWith(prefix)),get:async key=>records.get(key)};
 const player=window.VedrasFrozenMap.create({canvas,storage,
  directionalPrefetch,prefetchGuard:true,useLayerCache:false,
  maxDecodedPixels:6500000,decode:async png=>({...png,close(){}})});
 return {player,storage};
}
async function trace(directionalPrefetch){
 const {player}=fixture(directionalPrefetch);
 await player.load(SCENE,'near',
  {zoom:.8,panX:0,panY:0,dpr:1.25,projectY:.85},
  [{q:0,r:0,x:0,y:0,radius:145,visibility:'visible'}]);
 const paint=async()=>{
  player.draw();
  for(let i=0;i<15;i++)await Promise.resolve();
 };
 // Same cold start in both modes; only two initial frames to avoid
 // pre-warming the whole trajectory and hiding speculative differences.
 await paint();await paint();
 const baseline=player.report();
 for(const panX of [-70,-140,-210,-280,-350,-420,-490,-560,
  -630,-700,-770,-840,-910,-980,-1050]){
  player.setPose({panX});await paint();
 }
 const result=player.report();player.stop();
 return {baseline,result};
}
test('25S directional prefetch avoids one foreground read and eviction on controlled pan',async()=>{
 const on=await trace(true),off=await trace(false);
 assert.equal(on.baseline.visibleReadStarts,off.baseline.visibleReadStarts);
 assert.equal(on.baseline.prefetchReadStarts,off.baseline.prefetchReadStarts);
 assert.equal(on.result.saved,55);assert.equal(off.result.saved,55);
 assert.equal(on.result.activeVariant,off.result.activeVariant);
 assert.equal(on.result.failures,0);assert.equal(off.result.failures,0);
 assert.ok(on.result.directionalPrefetchFrames>=10);
 assert.ok(on.result.prefetchTrailingSkipped>0);
 assert.ok(on.result.visibleReadStarts<off.result.visibleReadStarts,
  'forward prefetch must reduce visible misses on this fixed trajectory');
 assert.ok(on.result.evictions<off.result.evictions,
  'the spare speculative slot must avoid a redundant cache eviction');
 assert.ok(on.result.prefetchReadStarts<=off.result.prefetchReadStarts,
  'do not merely add new background traffic to hide visible reads');
 assert.ok(on.result.decodedPixels<=on.result.maxDecodedPixels);
 assert.ok(off.result.decodedPixels<=off.result.maxDecodedPixels);
});
test('25S opt-out uses original distance-based selection and original RAM cap',async()=>{
 const on=await trace(true),off=await trace(false);
 assert.equal(on.result.directionalPrefetch,true);
 assert.equal(off.result.directionalPrefetch,false);
 assert.equal(off.result.prefetchTrailingSkipped,0);
 assert.equal(off.result.directionalPrefetchFrames,0);
 assert.equal(on.result.maxDecodedPixels,off.result.maxDecodedPixels);
 assert.equal(on.result.pending,0);
 assert.equal(off.result.pending,0);
});

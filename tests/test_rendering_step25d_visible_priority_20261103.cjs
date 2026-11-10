'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const runtime=read('frozen-map-runtime.js'),policy=read('frozen-map-view-policy.js'),
 profilerSource=read('frozen-map-profiler.js'),
 game=read('frozen-map-game.js'),html=read('frozen-map-game.html');
function fixture({prefetchGuard=true,maxDecodedPixels=4500000,profiler=null,
 overview1x=false,directionalPrefetch=true}={}){
 const window={},sourceGets=[],drawn=[],closed=[];
 vm.runInNewContext(policy,{window});
 let ticks=0;
 const ctx=()=>({
  setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
  lineTo(){},closePath(){},clip(){},fillRect(){},translate(){},scale(){},
  drawImage(im){drawn.push(im?.id||'cache')},imageSmoothingEnabled:true
 });
 const canvas={width:0,height:0,getContext:()=>ctx(),
  getBoundingClientRect:()=>({width:400,height:240})};
 const document={createElement:()=>({width:0,height:0,getContext:()=>ctx()})};
 const records=new Map();
 for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++){
  const id=x+','+y,key='v1-0374527a|near|'+id;
  records.set(key,{key,sceneKey:'v1-0374527a',level:'near',
   tile:{id,x:x*512,y:y*512,size:512},
   layers:[
    {layer:'ground',pad:3,png:{id:'G:'+id,width:512,height:512,size:500}},
    {layer:'scenery',pad:128,png:{id:'S:'+id,width:512,height:512,size:500}}
   ]});
 }
 const storage={
  keys:async prefix=>[...records.keys()].filter(k=>k.startsWith(prefix)),
  get:async key=>{sourceGets.push({key,variant:'2x'});return records.get(key)},
  getVariant:async (key,variant)=>{
   sourceGets.push({key,variant});const record=records.get(key);
   if(!record)return null;
   return {...record,derivedFormat:variant+'-png-v1',
    layers:record.layers.map(l=>({...l,png:{...l.png,
     width:variant==='1x'?256:512,height:variant==='1x'?256:512}}))};
  }
 };
 vm.runInNewContext(runtime,{window,document,performance:{now:()=>++ticks},
  requestAnimationFrame:()=>{},console});
 const player=window.VedrasFrozenMap.create({
  canvas,storage,prefetchGuard,directionalPrefetch,
  maxDecodedPixels,profiler,overview1x,
  useLayerCache:false,
  decode:async blob=>({...blob,close(){closed.push(blob.id)}})
 });
 return {player,sourceGets,drawn,closed,records};
}
async function mount(f){
 await f.player.load('v1-0374527a','near',
  {zoom:.85,panX:0,panY:0,dpr:1.25,projectY:.85},
  [{q:0,r:0,x:0,y:0,radius:145,visibility:'visible'}]);
}
async function settle(f,draws=8){
 for(let i=0;i<draws;i++){
  f.player.draw();
  await new Promise(resolve=>setImmediate(resolve));
 }
}
async function runRoute(prefetchGuard){
 const f=fixture({prefetchGuard});await mount(f);
 for(const panX of [0,0,0,-550,-550,-550,-1100,-1100,-1100,
  -550,-550,-550,0,0,0]){
  f.player.setPose({panX});
  await settle(f);
 }
 const stats=f.player.report();
 f.player.stop();
 return stats;
}
test('on-screen bitmaps start before any speculative work',async()=>{
 const f=fixture({maxDecodedPixels:12000000});await mount(f);
 f.player.draw();
 const first=f.player.report();
 assert.ok(first.visibleReadStarts>0,'visible requests must start immediately');
 assert.equal(first.prefetchReadStarts,0,
  'no offscreen decode until all displayed variants are in memory');
 assert.ok(first.prefetchSkippedVisible>0);
 assert.ok(first.pending<=3);
 await settle(f,15);
 const warm=f.player.report();
 assert.ok(warm.prefetchReadStarts>0,
  'the spare cache permits bounded background prefetch after warmup');
 assert.ok(warm.activePrefetch<=1);
 assert.equal(warm.failures,0);
 f.player.stop();
});
test('bounded speculative admission prevents decode / eviction thrash',async()=>{
 const guarded=await runRoute(true),baseline=await runRoute(false);
 assert.ok(guarded.prefetchSkippedBudget>0);
 assert.ok(guarded.loads<baseline.loads,
  'prefetch must not churn existing image bitmaps at tight RAM');
 assert.ok(guarded.evictions<baseline.evictions,
  'decoded visible tiles should survive repeated camera reversals');
 assert.ok(guarded.decodeRepeats<baseline.decodeRepeats);
 assert.ok(guarded.prefetchReadStarts<baseline.prefetchReadStarts);
 assert.equal(guarded.failures,0);
 assert.equal(baseline.failures,0);
 assert.ok(guarded.decodedPixels<=guarded.maxDecodedPixels);
});
test('one zoom-density tile remains visible while second variant decodes',async()=>{
 const f=fixture({overview1x:true,maxDecodedPixels:50000000});
 await mount(f);await settle(f,18);
 const before=f.drawn.length;
 f.player.setPose({zoom:.5});f.player.draw();
 assert.equal(f.player.report().activeVariant,'1x');
 assert.ok(f.drawn.length>before,'2x fallback was painted on first zoom frame');
 await settle(f,35);
 const ready=f.player.report();
 assert.ok(ready.decoded1x>0);
 assert.equal(ready.failures,0);
 f.player.setPose({zoom:.85});f.player.draw();
 assert.equal(f.player.report().activeVariant,'2x');
 f.player.stop();
});
test('profile data identifies tile, variant, request purpose and repeat decode',async()=>{
 const window={};vm.runInNewContext(profilerSource,{window});
 const profiler=window.VedrasFrozenProfiler.create();
 const f=fixture({prefetchGuard:false,profiler});await mount(f);
 for(let i=0;i<8;i++){f.player.draw();await new Promise(r=>setImmediate(r))}
 f.player.setPose({panX:-800});
 for(let i=0;i<8;i++){f.player.draw();await new Promise(r=>setImmediate(r))}
 f.player.setPose({panX:0});
 for(let i=0;i<8;i++){f.player.draw();await new Promise(r=>setImmediate(r))}
 const report=profiler.report({scene:'v1-0374527a'});
 assert.ok(report.tileReads.length>0);
 assert.ok(report.tileReads.some(x=>x.tileId&&x.variant==='2x'));
 assert.ok(report.tileReads.some(x=>x.purpose==='visible'));
 assert.ok(report.tileReads.some(x=>x.purpose==='prefetch'));
 assert.ok(report.frames.some(x=>typeof x.prefetchReadStarts==='number'));
 assert.equal(report.tiles.counts.loaded,report.tileReads.filter(x=>x.kind==='loaded').length);
 assert.ok(report.tiles.topRepeated.length<=12);
 f.player.stop();
});
test('25D never touches stored assets or global Sprite/Fog geometry',()=>{
 assert.match(game,/params\.get\('prefetchGuard'\)!=='0'/);
 assert.match(html,/frozen-map-runtime\.js\?v=/);
 assert.match(runtime,/MAX_SPECULATIVE=1/);
 assert.match(runtime,/visibleMissing=visible\.some/);
 assert.match(runtime,/if\(prefetchGuard\)for\(const \[key,entry\] of decoded\)/);
 assert.match(runtime,/list=\[\.\.\.list\]\.sort/);
 assert.doesNotMatch(runtime,/bakeWorldTile\(/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|\.clearPrefix\(/);
 for(const source of [runtime,policy,profilerSource,game])
  assert.doesNotThrow(()=>new Function(source));
});

test('25S directional background prefetch ignores trailing side while camera pans',async()=>{
 const on=fixture({maxDecodedPixels:16000000,directionalPrefetch:true});
 const off=fixture({maxDecodedPixels:16000000,directionalPrefetch:false});
 await mount(on);await mount(off);
 await settle(on,7);await settle(off,7);
 for(const x of [-80,-160,-240,-320,-400]){
  on.player.setPose({panX:x});off.player.setPose({panX:x});
  await settle(on,1);await settle(off,1);
 }
 const a=on.player.report(),b=off.player.report();
 assert.ok(a.directionalPrefetchFrames>=3);
 assert.ok(a.prefetchTrailingSkipped>0,
  'moving camera must reject offscreen tiles behind its direction');
 assert.equal(b.prefetchTrailingSkipped,0);
 assert.equal(b.directionalPrefetchFrames,0);
 assert.equal(a.failures,0);assert.equal(b.failures,0);
 assert.equal(a.saved,b.saved);
 assert.equal(a.activeVariant,b.activeVariant);
 assert.equal(a.maxDecodedPixels,b.maxDecodedPixels);
 assert.ok(a.pending<=3&&b.pending<=3);
 on.player.stop();off.player.stop();
});
test('25S zoom transition resets motion direction, stop clears counters',async()=>{
 const f=fixture({maxDecodedPixels:12000000});await mount(f);
 await settle(f,9);
 f.player.setPose({panX:-85});await settle(f,1);
 assert.ok(f.player.report().directionalPrefetchFrames>0);
 const prior=f.player.report().directionalPrefetchFrames;
 f.player.setPose({zoom:1.1});await settle(f,1);
 assert.equal(f.player.report().directionalPrefetchFrames,prior,
  'zoom cannot extrapolate stale pan motion');
 f.player.stop();
 assert.equal(f.player.report().prefetchTrailingSkipped,0);
 assert.equal(f.player.report().directionalPrefetchFrames,0);
});

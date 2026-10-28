'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const root=join(__dirname,'..');

test('recently loaded images stay resident briefly; older unprotected images are evicted',async()=>{
 const src=readFileSync(join(root,'asset-image-pool.js'),'utf8');
 let current=10000;
 const clock={now:()=>current};
 class MockImage{
  constructor(){this.naturalWidth=0;this.naturalHeight=0;}
  set src(_url){queueMicrotask(()=>{
   this.naturalWidth=1024;this.naturalHeight=1024;this.onload?.();
  });}
 }
 const context={window:{},Image:MockImage,performance:clock,Date,Promise};
 vm.runInNewContext(src,context);
 const pool=context.window.VedrasImagePool.create({
  maxBytes:8*1048576,parallel:2,protectMs:24000
 });
 const images=Array.from({length:6},(_,i)=>({path:'test_'+i,url:'mock://'+i,category:'nature'}));
 pool.protect(['test_0']);
 await Promise.all(images.map(a=>pool.ensure(a)));
 assert.equal(pool.report().evicted,0,'hot image must not be evicted immediately');
 current+=2600;
 pool.prune();
 assert.ok(pool.report().evicted>=4);
 assert.equal(pool.report().overLimitBytes,0);
 assert.ok(images[0].img,'pinned image survives');
});
test('atlas page eviction temporarily uses individual sprite fallback',async()=>{
 const src=readFileSync(join(root,'sprite-atlas-runtime.js'),'utf8');
 class MockImage{
  constructor(){this.naturalWidth=0;this.naturalHeight=0;}
  set src(_url){queueMicrotask(()=>{
   this.naturalWidth=64;this.naturalHeight=64;this.onload?.();
  });}
 }
 const entry=page=>({page,trim:[0,0,32,32],
  rect:[0,0,32,32],source:[32,32]});
 const manifest={schemaVersion:1,tiers:{desktop:{
  pages:[{file:'page_000.png'},{file:'page_001.png'}],
  sprites:{a:entry(0),b:entry(1)}
 }}};
 const context={window:{},Image:MockImage,Date,Promise,
  fetch:async()=>({ok:true,json:async()=>manifest})};
 vm.runInNewContext(src,context);
 const atlas=context.window.VedrasSpriteAtlas.create({limitPages:1});
 assert.equal(await atlas.open(),true);
 const draw=(key)=>atlas.draw({drawImage(){}},key,
  {sx:0,sy:0,sw:32,sh:32},{x:0,y:0,w:32,h:32});
 atlas.beginFrame();draw('a');atlas.endFrame();await Promise.resolve();
 atlas.beginFrame();draw('b');atlas.endFrame();await Promise.resolve();
 atlas.beginFrame();draw('a');atlas.endFrame();
 const info=atlas.info();
 assert.equal(info.pageLoads,2,'cooldown should avoid immediate third GET');
 assert.equal(info.pageEvictions,1);
 assert.ok(info.cooldownFallbacks>0);
});

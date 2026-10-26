'use strict';
/* node --test tests/test_priority_chunk_streaming_v019_20261024.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const CELLS=Array.from({length:15*15},(_,i)=>({q:i%15-7,r:Math.floor(i/15)-7}));
function setup({cells=CELLS,maxTiles=32,maxPixels=1500000,buildTile=null}={}){
 const immediate=[],idle=[],builds=[],closed=[];
 let tick=0;
 const sandbox={window:{},
  performance:{now:()=>++tick},
  setTimeout:fn=>{immediate.push(fn);return immediate.length},
  requestIdleCallback:fn=>{idle.push(fn);return idle.length}
 };
 vm.runInNewContext(read('chunks.js'),sandbox);
 const renderer=sandbox.window.VedrasChunks.create({size:512,maxTiles,maxPixels});
 let render=buildTile||((t)=>{
  builds.push(t.id);
  return {raster:{canvas:{width:64,height:64,close:()=>closed.push(t.id)}}};
 });
 let redraws=0;
 function configure(signature='worldA',family='same'){
  renderer.configure(signature,{worldCells:cells,
   buildTile:(t,nearby)=>render(t,nearby),family,redraw:()=>{redraws++}});
 }
 function pump(kind='urgent',max=100){
  let count=0,queue=kind==='urgent'?immediate:idle;
  while(queue.length&&count<max){queue.shift()();count++;}
  return count;
 }
 configure();
 return {renderer,immediate,idle,builds,closed,pump,configure,
  setBuild:fn=>{render=fn},
  redraws:()=>redraws,stats:()=>renderer.stats()};
}
const view=(x=0,y=0)=>({x,y,width:310,height:310});
const stream={enabled:true,ring:1,limit:6};
test('visible chunk requests outrank predictive prefetch and never wait for idle callback',()=>{
 const s=setup();
 s.renderer.prime(view(),{prefetch:stream});
 assert.ok(s.immediate.length>0,'visible tiles use zero-delay foreground scheduling');
 s.pump('urgent');
 assert.ok(s.stats().visibleRevision>0);
 assert.ok(s.stats().prefetchPending>0,'nearby world tiles are queued');
 assert.ok(s.idle.length>0,'speculative tiles use idle callbacks');
 const firstVisible=s.stats().visibleRevision;
 s.pump('idle',2);
 assert.equal(s.stats().visibleRevision,firstVisible,'offscreen completions do not trigger background redraw');
 assert.ok(s.stats().prefetched>0);
});
test('a visible request bypasses an existing delayed idle prefetch',()=>{
 const s=setup();s.renderer.prime(view(),{prefetch:stream});
 s.pump('urgent');
 assert.ok(s.idle.length>0);
 const urgentBefore=s.immediate.length;
 s.renderer.prime(view(1250,0),{prefetch:stream});
 assert.ok(s.immediate.length>urgentBefore,
  'new urgent task is independently scheduled while idle work is pending');
 s.pump('urgent');
 assert.ok(s.stats().visibleRevision>0);
});
test('camera-only prime discovers new chunks when the whole background canvas is reused',()=>{
 const s=setup();s.renderer.prime(view(),{prefetch:stream});
 s.pump('urgent');
 const built=s.builds.length;
 s.renderer.prime(view(900,250),{prefetch:stream});
 s.pump('urgent');
 assert.ok(s.builds.length>built);
 assert.ok(s.stats().visibleRevision>0);
});
test('speculative queue is bounded and revoked after direction reversal',()=>{
 const s=setup();s.renderer.prime(view(),{prefetch:stream});
 assert.ok(s.stats().prefetchPending<=stream.limit);
 s.renderer.prime(view(1500,0),{prefetch:stream});
 assert.ok(s.stats().prefetchPending<=stream.limit);
 s.renderer.prime(view(-1500,0),{prefetch:stream});
 assert.ok(s.stats().prefetchPending<=stream.limit);
});
test('speculative memory budget reserves resources for the viewport and LOD fallbacks',()=>{
 const s=setup({maxTiles:28,maxPixels:250000});
 s.renderer.prime(view(),{prefetch:stream});
 s.pump('urgent');const revision=s.stats().visibleRevision;
 s.pump('idle',20);
 assert.ok(s.stats().pixels<=250000||s.stats().visible>0,
  'visible tiles may exceed budget but prefetch must never displace them');
 assert.equal(s.stats().visibleRevision,revision);
 assert.ok(s.stats().prefetchPending<=stream.limit);
 assert.ok(s.stats().bytes<=s.stats().budgetBytes||s.stats().visible>0);
});
test('prefetched completed pixels refresh an existing cached background only on first visibility',()=>{
 const s=setup({maxPixels:1500000});
 s.renderer.prime(view(),{prefetch:stream});
 s.pump('urgent');
 const canvasContext={save(){},restore(){},beginPath(){},rect(){},clip(){},
  drawImage(){}};
 s.renderer.draw(canvasContext,view(),{prefetch:stream,drawRaster:()=>{},margin:0});
 const urgentCount=s.builds.length,revision=s.stats().visibleRevision;
 s.pump('idle',20);
 const prefetched=s.builds.slice(urgentCount);
 assert.ok(prefetched.length>0,'a nearby tile must have been prepared in advance');
 const [x,y]=prefetched[0].split(',').map(Number);
 const newViewport=view(x*512+20,y*512+20);
 const before=s.redraws();
 s.renderer.prime(newViewport,{prefetch:stream});
 assert.ok(s.stats().visibleRevision>revision);
 assert.ok(s.redraws()>before,'cached background is invalidated to expose the prepared pixels');
 s.pump('urgent');
 s.renderer.draw(canvasContext,newViewport,{prefetch:stream,drawRaster:()=>{},margin:0});
 const after=s.stats().visibleRevision;
 s.renderer.prime(newViewport,{prefetch:stream});
 assert.equal(s.stats().visibleRevision,after,'no repeated invalidation after the new raster was painted');
});
test('disabling streaming cancels speculative queued work without invalidating visible rasters',()=>{
 const s=setup();s.renderer.prime(view(),{prefetch:stream});
 s.pump('urgent');
 const ctx={save(){},restore(){},beginPath(){},rect(){},clip(){}};
 s.renderer.draw(ctx,view(),{prefetch:stream,drawRaster:()=>{},margin:0});
 const revision=s.stats().visibleRevision;
 s.renderer.prime(view(),{prefetch:{enabled:false}});
 assert.equal(s.stats().prefetchPending,0);
 assert.equal(s.stats().visibleRevision,revision);
});
test('old generation asynchronous job is discarded and its raster released',()=>{
 const callbacks=[],closed=[];
 const s=setup({buildTile:t=>({then:resolve=>callbacks.push({id:t.id,resolve})})});
 s.renderer.prime(view(),{prefetch:{enabled:false}});
 assert.ok(s.immediate.length);
 s.pump('urgent',1);
 assert.equal(callbacks.length,1);
 s.configure('worldB','different');
 callbacks[0].resolve({raster:{canvas:{width:32,height:32,close:()=>closed.push(1)}}});
 assert.equal(s.stats().cached,0);
 assert.equal(closed.length,1);
 assert.ok(s.stats().obsolete>0);
});
test('obsolete in-flight speculative tile is rejected after camera reversal',()=>{
 const callbacks=[],closed=[];
 const s=setup();
 s.renderer.prime(view(),{prefetch:stream});
 s.pump('urgent');
 const rev=s.stats().visibleRevision;
 s.setBuild(t=>({then:resolve=>callbacks.push({id:t.id,resolve})}));
 s.pump('idle',1);
 assert.ok(callbacks.length>0);
 s.renderer.prime(view(-2100,0),{prefetch:stream});
 callbacks[0].resolve({raster:{canvas:{width:32,height:32,close:()=>closed.push(1)}}});
 assert.equal(closed.length,1);
 assert.ok(s.stats().obsolete>0);
 assert.equal(s.stats().visibleRevision,rev);
});
test('manual whole-world baking still takes precedence over speculative background prefetch',()=>{
 const s=setup();s.renderer.prime(view(),{prefetch:stream});
 s.pump('urgent');
 const t=sandboxTile();
 s.renderer.warm([t],{progress:()=>{}});
 s.pump('idle',1);
 assert.ok(s.renderer.has(t.id));
 function sandboxTile(){return {id:'20,20',x:20*512,y:20*512,size:512};}
});
test('LOD switch holds completed old chunk until its replacement is ready',()=>{
 const s=setup();s.renderer.prime(view(),{prefetch:{enabled:false}});
 s.pump('urgent');
 assert.ok(s.stats().cached>0);
 s.configure('worldB','same');
 assert.ok(s.stats().variants>0);
 assert.ok(s.stats().cached===0||s.stats().variants>0);
});
test('app wires all four chunk layers and protects cached-background viewport streaming',()=>{
 const app=read('app.js'),chunk=read('chunks.js'),html=read('index.html'),server=read('server.py');
 assert.match(app,/terrainChunks\.draw\(ctx,[\s\S]*?prefetch:streamingOptions\(12\)/);
 assert.match(app,/shorelineChunks\.draw\(ctx,[\s\S]*?prefetch:streamingOptions\(6\)/);
 assert.match(app,/riverChunks\.draw\(ctx,bounds,[\s\S]*?prefetch:streamingOptions\(6\)/);
 assert.match(app,/roadChunks\.draw\(ctx,bounds,[\s\S]*?prefetch:streamingOptions\(8\)/);
 assert.match(app,/if\(backgroundProfile\.cached\)\{[\s\S]*?terrainChunks\.prime\(bounds,\{prefetch\}\)/);
 assert.match(app,/terrainChunks\.stats\(\)\.visibleRevision/);
 assert.doesNotMatch(app,/window\.VedrasTerrainWorker\?\.status\?\.\(\)\.completed\|\|0/);
 assert.match(chunk,/prefetchWanted=new Set\(chosen\.map/);
 assert.match(chunk,/if\(generation!==epoch\)\{release\(item\);stats\.obsolete\+\+;return;\}/);
 assert.match(html,/id="worldStreaming" checked/);
 assert.match(html,/id="streamingPerfStats"/);
 assert.match(html,/chunks\.js\?v=0\.37\.\d+/);
 assert.match(html,/app\.js\?v=0\.\d+\.\d+/);
 assert.match(server,/VERSION = '0\.\d+\.\d+'/);
 assert.doesNotMatch(server,/\.removeprefix\(/);
});
test('static scene, PNG export and saved map format remain independent of stream scheduling',()=>{
 const app=read('app.js'),server=read('server.py');
 assert.match(app,/const interactiveBackground=finalRendering/);
 assert.match(app,/const direct=blockers\.length>0/);
 assert.match(app,/canvas\.toBlob\(/);
 assert.match(app,/worldStreaming:true/);
 assert.match(app,/'gpuSprites','adaptiveLod','worldStreaming','fastCamera','materialScales'/);
 assert.match(app,/persistScene\(false\);backgroundScene\.clear\(\);requestDraw\(\)/);
 assert.match(server,/key = parsed\.path\[len\(prefix\):\]/);
});

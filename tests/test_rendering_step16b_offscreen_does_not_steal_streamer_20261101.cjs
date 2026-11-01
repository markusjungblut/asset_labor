'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../chunks.js'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function make(){
 const w={},pending=[],started=[];
 vm.runInNewContext(source,{window:w,console,Promise,
  setTimeout,clearTimeout,performance:{now:()=>Date.now()}});
 const chunks=w.VedrasChunks.create({size:512,maxTiles:30,maxPixels:5000000});
 const cells=Array.from({length:25},(_,i)=>({q:i-12,r:0}));
 chunks.configure('test-current-scene',{worldCells:cells,
  stampTile:t=>'unchanged-'+t.id,requireRaster:true,timeoutMs:0,
  buildTile:t=>new Promise(resolve=>{
   started.push(t.id);pending.push({id:t.id,resolve});
  }),redraw:()=>{}});
 const g={save(){},restore(){},beginPath(){},rect(){},clip(){},
  drawImage(){},getTransform(){return null;}};
 const camera={x:-1200,y:-200,width:2000,height:550};
 const offscreen={x:1900,y:-200,width:650,height:550};
 const draw=(bounds,renderOnly=true)=>chunks.draw(g,bounds,{
  renderOnly,margin:0,prefetch:{enabled:false},
  drawRaster:(ctx,r)=>ctx.drawImage(r.canvas,r.x,r.y,r.width,r.height)});
 const settle=async()=>{await sleep(35);};
 const cleanup=()=>{chunks.clear();for(const job of pending)
  job.resolve({raster:{canvas:{width:10,height:10},x:0,y:0,width:512,height:512}});};
 return {chunks,started,pending,camera,offscreen,draw,settle,cleanup};
}
test('offscreen draw preserves real camera wanted set, queue and diagnostics',async()=>{
 const f=make();
 try{
  f.chunks.prime(f.camera,{prefetch:{enabled:false}});
  await f.settle();
  const before=f.chunks.diagnostics({limit:100});
  assert.ok(before.queuedVisible>0);
  const queued=before.queuedVisible,visible=before.visible;
  const activeId=before.foreground?.id;
  const starts=f.started.length;
  f.draw(f.offscreen,true);
  const after=f.chunks.diagnostics({limit:100});
  assert.equal(after.queuedVisible,queued);
  assert.equal(after.visible,visible);
  assert.equal(after.foreground?.id,activeId);
  assert.equal(f.started.length,starts);
  assert.equal(f.chunks.stats().visible,visible);
 }finally{f.cleanup();}
});
test('offscreen does not mark an editor snapshot as painted',async()=>{
 const f=make();
 try{
  f.chunks.prime(f.camera,{prefetch:{enabled:false}});
  await f.settle();
  assert.ok(f.started.length);
  const first=f.pending[0];
  first.resolve({raster:{canvas:{width:16,height:16},x:0,y:0,
   width:512,height:512}});
  await f.settle();
  assert.equal(f.chunks.paintedVersions().size,0);
  f.draw(f.camera,true);
  assert.equal(f.chunks.paintedVersions().size,0);
  assert.equal(f.chunks.stats().painted,0);
  // The ordinary editor draw is the ONLY one that publishes painted stamps.
  f.draw(f.camera,false);
  assert.ok(f.chunks.paintedVersions().size>0);
 }finally{f.cleanup();}
});
test('nested bake with other viewport never removes queued camera work',async()=>{
 const f=make();
 try{
  f.chunks.prime(f.camera,{prefetch:{enabled:false}});
  await f.settle();
  const prev=f.chunks.diagnostics({limit:100});
  const cameraQueued=prev.tiles.filter(x=>x.state==='queued-visible')
   .map(x=>x.id);
  assert.ok(cameraQueued.length>=2);
  f.draw(f.offscreen,true);
  const after=f.chunks.diagnostics({limit:100});
  for(const id of cameraQueued)assert.equal(
   after.tiles.find(t=>t.id===id)?.state,'queued-visible',
   'nested image bake must not discard camera source '+id);
 }finally{f.cleanup();}
});
test('production offscreen packet passes renderOnly to all four chunk layers',()=>{
 for(const expr of [
  /terrainChunks\.draw\([\s\S]{0,400}renderOnly:step15PaintContext\.origin==='world-tile-fallback'/,
  /shorelineChunks\.draw\([\s\S]{0,350}renderOnly:step15PaintContext\.origin==='world-tile-fallback'/,
  /roadChunks\.draw\([\s\S]{0,220}renderOnly:step15PaintContext\.origin==='world-tile-fallback'/,
  /riverChunks\.draw\([\s\S]{0,220}renderOnly:step15PaintContext\.origin==='world-tile-fallback'/
 ])assert.match(app,expr);
 assert.equal((app.match(/renderOnly:step15PaintContext\.origin==='world-tile-fallback'/g)||[]).length,4);
 assert.match(source,/if\(!renderOnly\)\s*\{\s*diagnosticTiles=tiles/);
 assert.match(source,/if\(!renderOnly\)paintedVersions\.set/);
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const chunksCode=fs.readFileSync(path.join(root,'chunks.js'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const tileStreamer=fs.readFileSync(path.join(root,'world-tile-streamer.js'),'utf8');
// chunks.js schedules foreground work through setTimeout(0). Repeated
// setImmediate() calls can finish before the timer phase, especially on
// Windows/Node 22. Poll actual raster readiness, never arbitrary event-loop
// turns, and fail with the current chunk diagnostics if it never arrives.
const waitForReady=async(chunk,{sourceKeys=false}={})=>{
 const deadline=Date.now()+1500;
 do{
  const ready=chunk.readyTiles(bounds,{limit:12,sourceKeys});
  if(ready.length)return ready;
  await new Promise(resolve=>setTimeout(resolve,10));
 }while(Date.now()<deadline);
 return [];
};
const bounds={x:0,y:0,width:511,height:511};
const cells=[{q:0,r:0}];
function chunkHarness(){
 const window={},ctx={window,console,Date,Promise,performance,
  setTimeout,clearTimeout};
 vm.runInNewContext(chunksCode,ctx);
 let stamp='road-edge-a',configuration='relief:geography|road-density:1.5',builds=0;
 const create=()=>window.VedrasChunks.create({size:512,maxTiles:12,maxPixels:10000000});
 const chunk=create();
 function configure(){
  chunk.configure(configuration,{
   worldCells:cells,stampTile:()=>stamp,
   buildTile:()=>{builds++;return {raster:{canvas:{width:256,height:256}}}},
   redraw:()=>{},family:'road-family'
  });
 }
 async function build(){
  configure();
  chunk.prime(bounds,{prefetch:{enabled:false},notifyReady:false});
  const ready=await waitForReady(chunk,{sourceKeys:true});
  assert.equal(ready.length,1,
   'expected one real cached raster from chunks.js: '+JSON.stringify(chunk.diagnostics({limit:4})) );
  return ready[0].artwork;
 }
 return {chunk,build,clear:()=>chunk.clear(),
  setStamp:v=>{stamp=v},setConfiguration:v=>{configuration=v},
  get builds(){return builds}};
}
test('build counters change after eviction, stable source revision does not',async()=>{
 const h=chunkHarness();
 const a=await h.build();
 assert.ok(Number.isInteger(a.version));
 assert.match(a.sourceRevision,/^src-[0-9a-z]+-[0-9a-f]{32}$/);
 h.clear();
 const b=await h.build();
 assert.notEqual(b.version,a.version,'construction counter must remain independent');
 assert.equal(b.sourceRevision,a.sourceRevision,'same content must remain semantically stable');
 assert.equal(h.builds,2);
});
test('road-edge edits are a real source revision even without configuration change',async()=>{
 const h=chunkHarness();
 const a=await h.build();
 h.setStamp('road-edge-a|new-crossing');
 const b=await h.build();
 assert.notEqual(a.sourceRevision,b.sourceRevision);
});
test('render settings and LOD density invalidate otherwise identical raster stamp',async()=>{
 const h=chunkHarness();
 const a=await h.build();
 h.setConfiguration('relief:geography|road-density:2.5');
 const b=await h.build();
 assert.notEqual(a.sourceRevision,b.sourceRevision);
});
test('river bank source changes react to altered content signature, not build count',async()=>{
 const h=chunkHarness();
 h.setConfiguration('river-banks|width:34|density:1.5');
 const a=await h.build();
 h.clear();
 const b=await h.build();
 assert.equal(a.sourceRevision,b.sourceRevision);
 h.setConfiguration('river-banks|width:38|density:1.5');
 const c=await h.build();
 assert.notEqual(c.sourceRevision,b.sourceRevision);
});
test('stable source key distinguishes configuration boundary, not concatenation ambiguity',async()=>{
 const h=chunkHarness();
 h.setConfiguration('ab');h.setStamp('c');
 const a=await h.build();
 h.setConfiguration('a');h.setStamp('bc');
 const b=await h.build();
 assert.notEqual(a.sourceRevision,b.sourceRevision);
});
test('fast camera and direct source getter both use stable road/river tokens',()=>{
 assert.match(app,/const prepared=\(chunks,stableSource=false\)=>new Map\(/);
 assert.match(app,/road:state\.roadShown\?prepared\(roadChunks,true\):null/);
 assert.match(app,/prepared\(riverChunks,true\):null/);
 assert.match(app,/const road=state\.roadShown\?versionFor\(roadChunks,readyMaps\?\.road,true\):'off'/);
 assert.match(app,/versionFor\(riverChunks,readyMaps\?\.river,true\):'off'/);
});
test('world tile reconciliation ignores newer build counter when source content token matches',()=>{
 const window={},context={window,console,Date,Promise,performance,setTimeout,clearTimeout,AbortController};
 vm.runInNewContext(tileStreamer,context);
 const canvasContext={setTransform(){},clearRect(){},fillRect(){},save(){},restore(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},fill(){},drawImage(){}};
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:1,height:1,getContext:()=>canvasContext},
  source:async()=>null,sourceTimeoutMs:0,requireScenery:true,lodSelector:()=> 'mid'
 });
 const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 const rev=(road,river)=>JSON.stringify(['terrain-1','shore-1',road,river]);
 const packet={complete:true,revision:rev('src-abc','src-river'),
  layers:[{layer:'ground',image:{width:32,height:32}},
   {layer:'scenery',image:{width:32,height:32}}]};
 assert.equal(renderer.seed(tile,'mid',packet),true);
 const previous=renderer.stats().selectiveInvalidations;
 assert.equal(renderer.reconcileGroundRevisions(new Map([[tile.id,
  rev('src-abc','src-river')]])),0);
 assert.equal(renderer.stats().selectiveInvalidations,previous);
 const changed=renderer.reconcileGroundRevisions(new Map([[tile.id,
  rev('src-real-edit','src-river')]]));
 assert.ok(changed>=1,'a true changed source must still invalidate its cached tile');
});
test('pending source transitions still differ from stable prepared source tokens',()=>{
 const rev=(road,river)=>JSON.stringify(['t','shore',road,river]);
 assert.notEqual(rev('pending','pending'),rev('src-new','pending'));
 assert.notEqual(rev('src-old','src-river'),rev('src-new','src-river'));
});

test('ordinary terrain/shore chunk access does not compute unused semantic fingerprints',async()=>{
 const h=chunkHarness();
 const road=await h.build();
 assert.ok(road.sourceRevision);
 const ordinary=h.chunk.readyTiles(bounds,{limit:12});
 assert.equal(ordinary.length,1);
 const raw=ordinary[0].artwork;
 assert.equal(raw.sourceRevision,road.sourceRevision,'same cached entry');
 h.clear();
 h.chunk.configure('terrain-settings',{worldCells:cells,stampTile:()=>'grass',
  buildTile:()=>({raster:{canvas:{width:128,height:128}}}),redraw:()=>{}});
 h.chunk.prime(bounds,{prefetch:{enabled:false},notifyReady:false});
 const terrain=await waitForReady(h.chunk);
 assert.equal(terrain.length,1,
  'terrain raster should be available: '+JSON.stringify(h.chunk.diagnostics({limit:4})));
 assert.equal(terrain[0].artwork.sourceRevision,undefined,'terrain never requests semantic source key');
});

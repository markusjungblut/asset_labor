'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const frozenSource=fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8');
const worldSource=fs.readFileSync(path.join(root,'world-tile-streamer.js'),'utf8');
const appSource=fs.readFileSync(path.join(root,'app.js'),'utf8');
const packageSource=fs.readFileSync(path.join(root,'frozen-map-package.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const makeWorldTile=(name='tile')=>({
 tile:{id:'0,0',x:0,y:0,size:512,visibility:'visible'},
 level:'mid',revision:'scene-fixed-v1',dirty:false,preview:false,complete:true,
 layers:[
  {layer:'ground',image:{id:name+'-ground',width:32,height:32},pad:3},
  {layer:'scenery',image:{id:name+'-scene',width:32,height:32},pad:128,
   crop:{x:1,y:1,fullWidth:35,fullHeight:35}}
 ]
});
const now=()=>new Promise(resolve=>setImmediate(resolve));
function harness(store=null){
 const window={};const drawings=[],paths=[];
 const scope={window,console,Date,Promise,performance,setTimeout,clearTimeout,
  requestAnimationFrame:()=>0};
 vm.runInNewContext(frozenSource,scope);
 const frozen=window.VedrasFrozenMap;
 const storage=store||frozen.memoryStore();
 const ctx={setTransform(){},fillRect(){},save(){},restore(){},
  beginPath(){paths.push('begin')},moveTo(){paths.push('move')},
  lineTo(){},closePath(){},clip(){paths.push('clip')},
  drawImage(img,...args){drawings.push({id:img.id,args})}};
 const canvas={width:0,height:0,
  getContext:()=>ctx,getBoundingClientRect:()=>({width:680,height:420})};
 const getImage=async blob=>({width:blob.width,height:blob.height,
  id:blob.id,close(){}});
 const encode=async image=>({id:image.id,width:image.width,height:image.height});
 const view=frozen.create({canvas,storage,decode:getImage,encode,onStatus:()=>{}});
 const cells=[{q:0,r:0,x:0,y:0,radius:147.8,visibility:'visible'}];
 return {frozen,view,storage,ctx,drawings,paths,cells};
}
test('only exact complete tiles with scenery and terrain can be frozen',()=>{
 const h=harness(),packet=makeWorldTile();
 assert.equal(h.frozen.valid(packet),true);
 assert.equal(h.frozen.valid({...packet,preview:true}),false);
 assert.equal(h.frozen.valid({...packet,dirty:true}),false);
 assert.equal(h.frozen.valid({...packet,complete:false}),false);
 assert.equal(h.frozen.valid({...packet,layers:packet.layers.slice(0,1)}),false);
 assert.equal(h.frozen.valid({...packet,revision:null}),false);
});
test('one-time capture persists exact PNG packets and does not save previews',async()=>{
 const h=harness();

 const r=await h.view.capture('v1-1234abcd',[makeWorldTile(),
   {...makeWorldTile('unknown'),preview:true}]);
  assert.equal(r.saved,1);assert.equal(r.rejected,1);
  const keys=await h.storage.keys('v1-1234abcd|mid|');
  assert.deepEqual(keys,['v1-1234abcd|mid|0,0']);
  const saved=await h.storage.get(keys[0]);
  assert.equal(saved.layers.length,2);
  assert.equal(saved.layers[0].pad,3);
  assert.deepEqual(saved.layers[1].crop,
   {x:1,y:1,fullWidth:35,fullHeight:35});
 
});
test('capturing identical prebuilt tile twice never re-encodes or replaces it',async()=>{
 const h=harness();
 assert.equal((await h.view.capture('v1-1234abcd',[makeWorldTile()])).saved,1);
  const r=await h.view.capture('v1-1234abcd',[makeWorldTile()]);
  assert.equal(r.saved,0);assert.equal(r.skipped,1);
 
});
test('game-mode player reopens an archived scene with ZERO terrain source builds',async()=>{
 const h=harness();
 await h.view.capture('v1-1234abcd',[makeWorldTile()]);
  await h.view.load('v1-1234abcd','mid',{
   zoom:.81,panX:0,panY:0,dpr:1,projectY:.85},h.cells);
  h.view.draw();await now();await now();h.view.draw();
  assert.ok(h.view.report().loads>=1);
  assert.ok(h.drawings.some(d=>d.id==='tile-ground'));
  assert.ok(h.drawings.some(d=>d.id==='tile-scene'));
  assert.equal(h.view.report().saved,1);
  assert.equal(/VedrasTerrainWorker|autotile\.build|worldTiles\.request|bakeWorldTile/.test(frozenSource),false,
   'shipped-map viewer must never enter pixel/worker build pathway');
 
});
test('panning and zooming a frozen image never writes or launches terrain jobs',async()=>{
 const h=harness();
 await h.view.capture('v1-1234abcd',[makeWorldTile()]);
  await h.view.load('v1-1234abcd','mid',{
   zoom:.81,panX:0,panY:0,dpr:1,projectY:.85},h.cells);
  await now();h.view.draw();await now();h.view.draw();
  const first=h.view.report().loads;
  h.view.setPose({zoom:1.35,panX:40,panY:-30});
  h.view.draw();
  assert.equal(h.view.report().loads,first,'image already decoded once');
  assert.equal(h.view.getPose().zoom,1.35);
  assert.equal(h.view.report().active,true);
 
});
test('separate authored map fingerprints cannot access each others frozen tiles',async()=>{
 const h=harness();
 await h.view.capture('v1-1234abcd',[makeWorldTile()]);
  const s=await h.view.load('v1-deadbeef','mid',{
   zoom:.81,panX:0,panY:0,dpr:1,projectY:.85},h.cells);
  assert.equal(s.saved,0);
  assert.equal(h.view.draw().saved,0);
  assert.equal(h.drawings.length,0);
 
});
test('frozen player uses visible authorized Hex clip instead of rectangular leak',async()=>{
 const h=harness();
 await h.view.capture('v1-1234abcd',[makeWorldTile()]);
  await h.view.load('v1-1234abcd','mid',{
   zoom:.81,panX:0,panY:0,dpr:1,projectY:.85},
  [{...h.cells[0],visibility:'unknown'}]);
  h.view.draw();await now();h.view.draw();
  assert.equal(h.paths.filter(p=>p==='move').length,0,
   'unknown hexes cannot add authorized geometry to image clip');
  assert.ok(h.paths.includes('clip'));
 
});
test('real WorldTile emitter exports only current complete non-dirty exact source',()=>{
 const window={};
 vm.runInNewContext(worldSource,{window,console,Date,Promise,performance,
  setTimeout,clearTimeout,AbortController});
 const gfx={setTransform(){},clearRect(){},fillRect(){},save(){},
  restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},
  clip(){},fill(){},drawImage(){}};
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>gfx},source:()=>null,
  sourceTimeoutMs:0,requireScenery:true,lodSelector:()=> 'mid'
 });
 const p=makeWorldTile(),tile=p.tile;
 renderer.request({width:680,height:420,zoom:.81,dpr:1,
  panX:0,panY:0,projectY:.85},[tile]);
 assert.equal(renderer.exportExactPackets().length,0);
 assert.equal(renderer.seed(tile,'mid',{revision:p.revision,complete:true,
  layers:p.layers}),true);
 assert.equal(renderer.exportExactPackets().length,1);
 renderer.invalidateTiles([tile.id],'image-ready-ground-selective');
 assert.equal(renderer.exportExactPackets().length,0,
  'retained dirty fallback is not eligible for finished-game capture');
 renderer.request({width:680,height:420,zoom:.81,dpr:1,
  panX:0,panY:0,projectY:.85},[{...tile,visibility:'unknown'}]);
 assert.equal(renderer.exportExactPackets().length,0);
});
test('finished-game playback pauses the WorldTile source queue without deleting exact tile content',async()=>{
 const window={};
 vm.runInNewContext(worldSource,{window,console,Date,Promise,performance,
  setTimeout,clearTimeout,AbortController});
 const gfx={setTransform(){},clearRect(){},fillRect(){},save(){},
  restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},
  clip(){},fill(){},drawImage(){}};
 let started=0;
 const packet=makeWorldTile();
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>gfx},
  source:()=>{started++;return {complete:true,revision:packet.revision,
   layers:packet.layers}},sourceTimeoutMs:0,
  requireScenery:true,lodSelector:()=> 'mid'
 });
 const view={width:680,height:420,zoom:.81,dpr:1,panX:0,panY:0,projectY:.85};
 renderer.setPlaybackPaused(true);
 renderer.request(view,[packet.tile]);
 await now();
 assert.equal(started,0);
 assert.equal(renderer.stats().playbackPaused,true);
 assert.ok(renderer.stats().pending>=1);
 renderer.setPlaybackPaused(false);
 await now();await now();await now();
 assert.equal(started,1);
 assert.equal(renderer.exportExactPackets().length,1);
});
test('finished-game playback suspends terrain scheduling and resumes normal editor without cache reset',async()=>{
 const chunksCode=fs.readFileSync(path.join(root,'chunks.js'),'utf8');
 const window={};
 vm.runInNewContext(chunksCode,{window,console,Date,Promise,performance,setTimeout,clearTimeout});
 const chunk=window.VedrasChunks.create({size:512,maxTiles:12,maxPixels:5000000});
 let built=0;
 chunk.configure('fixed-map-test',{worldCells:[{q:0,r:0}],
  stampTile:()=> 'stable-ground',requireRaster:true,
  redraw:()=>{},buildTile:()=>{built++;return {
   raster:{canvas:{width:32,height:32}}};}});
 chunk.setPlaybackPaused(true);
 chunk.prime({x:0,y:0,width:511,height:511},{prefetch:{enabled:false}});
 await new Promise(resolve=>setTimeout(resolve,20));
 assert.equal(built,0);
 assert.equal(chunk.stats().playbackPaused,true);
 chunk.setPlaybackPaused(false);
 await new Promise(resolve=>setTimeout(resolve,30));
 assert.equal(built,1);
 assert.equal(chunk.readyTiles({x:0,y:0,width:511,height:511}).length,1);
});
test('portable frozen game ZIP uses standard PK signatures and correct CRC32',async()=>{
 const window={};
 vm.runInNewContext(packageSource,{window,Blob,TextEncoder,Uint8Array,DataView,Set});
 const api=window.VedrasFrozenMapPackage;
 assert.equal(api.crc32(new TextEncoder().encode('123456789')),0xcbf43926);
 const zip=await api.zipEntries([
  {name:'manifest.json',blob:new Blob(['{"test":true}'])},
  {name:'tiles/mid/0_0.0.png',blob:new Blob(['png-bytes'])}
 ]);
 const bytes=new Uint8Array(await zip.arrayBuffer()),dv=new DataView(bytes.buffer);
 assert.equal(dv.getUint32(0,true),0x04034b50);
 assert.equal(dv.getUint32(bytes.length-22,true),0x06054b50);
 assert.equal(dv.getUint16(bytes.length-12,true),2);
 const center=dv.getUint32(bytes.length-6,true);
 assert.equal(dv.getUint32(center,true),0x02014b50);
});
test('incomplete whole-map archive is explicitly partial and includes named PNG files',async()=>{
 const window={};
 vm.runInNewContext(packageSource,{window,Blob,TextEncoder,Uint8Array,DataView,Set});
 const storage=harness().frozen.memoryStore();
 const scene='v1-1234abcd',level='mid';
 await storage.put({key:scene+'|mid|0,0',sceneKey:scene,level,
  tile:{id:'0,0',x:0,y:0,size:512},revision:'scene-a',
  layers:[{layer:'ground',pad:3,png:new Blob(['ground'])},
   {layer:'scenery',pad:128,png:new Blob(['scenery'])}]});
 const result=await window.VedrasFrozenMapPackage.exportMap(
  storage,scene,level,{totalExpected:24});
 assert.equal(result.manifest.complete,false);
 assert.equal(result.manifest.exportedTiles,1);
 assert.equal(result.manifest.expectedTiles,24);
 assert.equal(result.manifest.tiles[0].layers[0].file,'tiles/mid/0_0.0.png');
 assert.equal(result.manifest.tiles[0].layers[1].file,'tiles/mid/0_0.1.png');
 assert.ok(result.blob.size>100);
});
test('UI has explicit whole-map offline preparation, cancel and separate read-only canvas',()=>{
 for(const id of ['frozenCaptureAll','frozenCancel','frozenCapture',
  'frozenPlay','frozenExit','frozenExport','frozenGameCanvas','frozenStatus'])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(appSource,/if\(frozenMapMode\)return; \/\/ Frozen game test/);
 assert.match(appSource,/if\(frozenMapMode\)return; \/\/ A pending editor rAF/);
 assert.match(appSource,/frozenTour\.cancel/);
 assert.match(appSource,/frozenMap\.capture\(scene,ready\)/);
 assert.match(appSource,/worldTiles\?\.exportExactPackets/);
 assert.match(appSource,/window\.VedrasAssetLabor=\{frozenMapTest:/);
});

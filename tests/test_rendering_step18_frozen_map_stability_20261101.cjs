'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8');
const standalone=fs.readFileSync(path.join(root,'frozen-map-game.js'),'utf8');
const page=fs.readFileSync(path.join(root,'frozen-map-game.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function packet(i){
 return {tile:{id:i+',0',x:i*512,y:0,size:512},
  level:'mid',revision:'exact',complete:true,dirty:false,preview:false,
  layers:[{layer:'ground',pad:3,image:{id:'ground-'+i,width:32,height:32}},
   {layer:'scenery',pad:128,image:{id:'scenery-'+i,width:32,height:32}}]};
}
function fixture({width=4000,budget=100}={}){
 const stats={clouds:0,unready:0,edges:0,assets:[],seed:null};
 const window={VedrasCloudArtwork:{create:({onReady})=>({
  setSeed(seed){stats.seed=seed;onReady();},
  setAssets(entries){stats.assets=entries;onReady();},
  drawBase(){stats.clouds++;},
  drawUnready(){stats.unready++;},
  drawTransitions(_g,_v,edges){stats.edges+=edges.length;},
  stats(){return {bases:4,pending:0};}
 })}};
 vm.runInNewContext(source,{window,Date,Promise,console,performance,
  requestAnimationFrame:fn=>setImmediate(fn)});
 const draws=[];
 const ctx={setTransform(){},fillRect(){},save(){},restore(){},beginPath(){},
  moveTo(){},lineTo(){},closePath(){},clip(){},
  drawImage(img,...args){draws.push({id:img.id,args});}};
 const canvas={width:0,height:0,getContext:()=>ctx,
  getBoundingClientRect:()=>({width,height:900})};
 const store=window.VedrasFrozenMap.memoryStore();
 const view=window.VedrasFrozenMap.create({canvas,storage:store,
  maxDecodedPixels:budget,encode:async i=>i,
  decode:async i=>({...i,close(){}})});
 const cells=[{q:0,r:0,x:0,y:0,radius:147.8,visibility:'visible'}];
 const pose={zoom:1,panX:-1200,panY:0,dpr:4,projectY:.85};
 return {view,store,canvas,draws,stats,cells,pose};
}
async function drain(view){
 for(let i=0;i<16;i++){view.draw();await tick();}
}
test('visible decoded packets stay resident even if they exceed nominal LRU budget',async()=>{
 const h=fixture(),scene='v1-12345678';
 await h.view.capture(scene,Array.from({length:7},(_,i)=>packet(i)));
 await h.view.load(scene,'mid',h.pose,h.cells);
 await drain(h.view);
 const first=h.view.report();
 assert.equal(first.decoded,7);
 assert.equal(first.loads,7);
 assert.ok(first.decodedPixels>100,'visible set can exceed background LRU budget');
 await drain(h.view);
 const after=h.view.report();
 assert.equal(after.decoded,7);
 assert.equal(after.loads,first.loads,'no repeated decode/evict/flicker cycle');
 assert.equal(h.canvas.width,16000,'4x author-selected backing resolution');
 h.view.stop();
});
test('ground seams use real baked gutter and screen-pixel overdraw',async()=>{
 const h=fixture(),scene='v1-12345678';
 await h.view.capture(scene,[packet(0)]);
 await h.view.load(scene,'mid',h.pose,h.cells);
 await drain(h.view);
 const g=h.draws.find(d=>d.id==='ground-0');
 assert.ok(g,'finished ground is painted');
 assert.equal(g.args.length,8,'sampled image rectangle mapped into destination');
 assert.ok(g.args[0]>0,'source begins inside the real padded PNG');
 assert.ok(g.args[4]<800,'destination expands slightly over the snapped core edge');
 assert.ok(g.args[6]>512,'adjacent source gutters overlap at subpixel seams');
});
test('the standalone viewer draws authored cloud textures without terrain workers',async()=>{
 const h=fixture(),scene='v1-12345678';
 const m=await h.view.saveManifest(scene,{cells:h.cells,levels:['mid'],
  pose:h.pose,expectedTiles:10,
  clouds:{seed:'vedras-cloud-test',assets:[{path:'assets/clouds/1.png'}]}});
 assert.equal(m.expectedTiles,10);
 assert.equal(m.clouds.assets[0].path,'assets/clouds/1.png');
 h.view.setClouds(m.clouds);
 await h.view.load(scene,'mid',h.pose,h.cells);
 h.view.draw();
 assert.ok(h.stats.clouds>0&&h.stats.unready>0&&h.stats.edges>0);
 assert.equal(h.stats.seed,'vedras-cloud-test');
 assert.equal(h.stats.assets.length,1);
 assert.match(page,/cloud-artwork\.js/);
 assert.match(standalone,/player\.setClouds\(manifest\.clouds/);
 assert.match(standalone,/Math\.min\(4,/);
 assert.doesNotMatch(standalone,/VedrasTerrainWorker|bakeWorldTile|worldTiles\.request/);
 assert.doesNotMatch(page,/(?:src=")(?:app|world-tile-streamer|autotile|terrain-worker)\.js/);
 assert.match(app,/clouds:frozenCloudSettings\(\)/);
});

test('4x atlas capture uses a distinct fingerprint and its own near-tier raster bake',()=>{
 assert.match(app,/atlas-4x/);
 assert.match(app,/game-map-export-renderer-v3-stable-authored/);
 assert.match(app,/scale=offline4x\?4:/);
 assert.match(app,/sceneryScale=offline4x\?4:/);
 assert.match(app,/bakeWorldTile\(tile,'near'\)/);
 assert.match(app,/WORLD_TILE_GUTTER\)\*4-\.5/);
 assert.match(app,/expectedTiles:all\.length/);
 assert.match(app,/manifest\.levels\.includes\('near'\)/);
});

test('4x scene fingerprint ignores runtime PNG redecodes while preserving authored revisions',()=>{
 const key=app.slice(app.indexOf('function frozenSceneKey()'),
  app.indexOf('function frozenCloudSettings()'));
 assert.match(key,/assets\.map\(a=>\[a\.path,a\.mtime\]\)/);
 assert.doesNotMatch(key,/assets\.map\(a=>\[a\.path,a\.mtime,a\.imageRevision/);
 assert.match(key,/state\.natureInstances/);
 assert.match(key,/state\.hexTerrain/);
});
test('image decoding and sprite-cache layout never trigger a global semantic invalidation',()=>{
 const semantic=app.slice(app.indexOf('function tileSemanticSignature()'),
  app.indexOf('let gpuFrame=',app.indexOf('function tileSemanticSignature()')));
 assert.doesNotMatch(semantic,/frameMemo\.stats\(\)\.revision/);
 assert.doesNotMatch(semantic,/objectLayoutCache\.stats\(\)\.revision/);
 assert.match(semantic,/catalogRevision,state\.quality/);
});
test('4x whole-map exporter freezes editor mutations and primes source chunks without camera movement',()=>{
 assert.match(app,/function lockFrozenTourEditor\(lock\)/);
 assert.match(app,/lockFrozenTourEditor\(true\)/);
 assert.match(app,/lockFrozenTourEditor\(false\)/);
 assert.match(app,/if\(frozenTour\?\.offlineOnly\)return/);
 assert.match(app,/frozen-offline-source-setup/);
 assert.match(app,/terrainChunks\.prime\(bounds,opts\)/);
 assert.match(app,/shorelineChunks\.prime\(bounds,opts\)/);
 assert.match(app,/riverChunks\.prime\(bounds,opts\)/);
 assert.match(app,/roadChunks\.prime\(bounds,opts\)/);
 assert.match(app,/if\(!quality4\)\{\s*state\.panX=/);
});

test('archive ID stays unchanged after 4x decode promotions but changes on real authored content changes',()=>{
 const block=app.slice(app.indexOf('function frozenSceneKey()'),
  app.indexOf('function frozenCloudSettings()'));
 const keyFor=new Function('worldCells','state','catalog','assets',
  block+';return frozenSceneKey();');
 const worldCells=[{q:0,r:0,biome:'plains',terrainTypeId:'grassland'}];
 const state={quality:'4',hexTerrain:{},natureInstances:[],forest:{seed:12},
  materialScales:{},visualPolish:{},relief:{},shoreline:{},roadEdges:[]};
 const catalog={assets:[],terrainTypes:[],categories:[]},
  assets=[{path:'forest.png',mtime:10,imageRevision:1}];
 const base=keyFor(worldCells,state,catalog,assets);
 assets[0].imageRevision=100;
 assert.equal(keyFor(worldCells,state,catalog,assets),base,
  'image decoding/promoting the same source is not an authored map edit');
 assets[0].mtime=11;
 assert.notEqual(keyFor(worldCells,state,catalog,assets),base);
 const afterMtime=keyFor(worldCells,state,catalog,assets);
 state.hexTerrain['0,0']='changed-source.png';
 assert.notEqual(keyFor(worldCells,state,catalog,assets),afterMtime);
});
test('4x offscreen source queue configuration preserves the visible editor camera',()=>{
 const block=app.slice(app.indexOf('function frozenPrepare4xSourceQueues(tile){'),
  app.indexOf('const frozenTourLockedEvents='));
 const simulate=new Function('state','document','tile',`
  let ctx={original:true},W=1200,H=800,gpuFrame=true,
   step15PaintContext={origin:'editor'};
  const originalCtx=ctx,PROJECT_Y=.85;
  let terrain=0,road=0;
  function drawGround(){terrain++;}
  function drawRoads(){road++;}
  ${block}
  frozenPrepare4xSourceQueues(tile);
  return {terrain,road,restored:ctx===originalCtx&&W===1200&&H===800&&
   gpuFrame===true&&step15PaintContext.origin==='editor'};`);
 const state={zoom:1.1,panX:40,panY:-20,dpr:4},
  canvas={createElement:()=>({getContext:()=>({})})};
 const result=simulate(state,canvas,{id:'1,2',x:512,y:1024,size:512});
 assert.deepEqual(result,{terrain:1,road:1,restored:true});
 assert.equal(state.panX,40);
 assert.equal(state.panY,-20);
});

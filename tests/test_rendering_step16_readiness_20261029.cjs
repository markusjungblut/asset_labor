'use strict';
// node --test tests/test_rendering_step16_readiness_20261029.cjs
const test=require('node:test'),assert=require('node:assert/strict');
const vm=require('node:vm'),{readFileSync}=require('node:fs');
const {join}=require('node:path');
const root=join(__dirname,'..'),read=path=>readFileSync(join(root,path),'utf8');
function tileHarness({sourceRevision,source,maxAttempts=1}){
 const g={save(){},restore(){},setTransform(){},clearRect(){},
  drawImage(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},
  closePath(){},clip(){},fill(){}};
 const window={};
 vm.runInNewContext(read('world-tile-streamer.js'),{window,performance:{now:()=>1000},
  setTimeout,clearTimeout,AbortController,console,Date});
 const world=window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>g},
  requireScenery:true,maxAttempts,sourceRevision,source
 });
 const t={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 const view={width:800,height:600,zoom:.7,dpr:1,
  panX:0,panY:0,projectY:.85};
 const packet={complete:true,revision:'prepared-v1',layers:[
  {layer:'ground',image:{width:64,height:64}},
  {layer:'scenery',image:{width:64,height:64}}
 ]};
 return {world,t,view,packet};
}
async function flush(){for(let i=0;i<35;i++)await Promise.resolve();}

test('exhausted source-null waits for new source revision, then exact tile recovers',async()=>{
 let version='pending',count=0,packet;
 const h=tileHarness({
  sourceRevision:()=>version,
  source:()=>{count++;return version==='pending'?null:packet;}
 });
 packet=h.packet;
 h.world.request(h.view,[h.t]);await flush();
 assert.equal(count,1);
 assert.equal(h.world.stats().retryExhausted,1);
 for(let i=0;i<12;i++)assert.equal(h.world.terrainReady(h.t.id,'pending'),0);
 await flush();assert.equal(count,1,'same source revision never thrashes');
 version='prepared-v1';
 assert.equal(h.world.terrainReady(h.t.id,version),1);
 await flush();
 assert.equal(count,2);
 assert.equal(h.world.stats().retryExhausted,0);
 assert.equal(h.world.stats().tiles,1);
 assert.equal(h.world.stats().failed,0);
 assert.equal(h.world.diagnostics().tiles[0].state,'ready');
});

test('source revision finishing during in-flight bake re-arms after job is removed',async()=>{
 let version='pending',resolveFirst,count=0,packet;
 const h=tileHarness({sourceRevision:()=>version,source:()=>{
  count++;
  if(count===1)return new Promise(resolve=>{resolveFirst=resolve;});
  return packet;
 }});
 packet=h.packet;
 h.world.request(h.view,[h.t]);await flush();
 version='prepared-v1';
 assert.equal(h.world.terrainReady(h.t.id,version),0,
  'in-flight job cannot be restarted concurrently');
 resolveFirst(null);await flush();
 assert.equal(count,2,'finished source with changed revision requeues once');
 assert.equal(h.world.stats().tiles,1);
 assert.equal(h.world.stats().retryExhausted,0);
});

test('prepared offscreen terrain core can finish exact without prior staging paint',async()=>{
 const app=read('app.js');
 const start=app.indexOf('async function bakeWorldTile(');
 const end=app.indexOf('\nlet fastInteracting=',start);
 assert.ok(start>=0&&end>start);
 let ground=0,roads=0,scenery=0;
 const window={
  VedrasBenchmarkProfiler:{record(){},count(){}},
  VedrasStep15Trace:{enabled:()=>false},
  VedrasSpriteShadows:{beginFrame(){}}
 };
 const g={save(){},restore(){},setTransform(){},drawImage(){}};
 const values={
  window,performance:{now:()=>100},state:{
   mode:'normal',view:'map',zoom:.7,dpr:1,panX:0,panY:0
  },terrainLod:'mid',PROJECT_Y:.85,WORLD_TILE_GUTTER:3,
  // The editor-sized staging raster does NOT contain this offscreen tile.
  tileArtworkReady:()=>false,
  tileArtworkStatus:(_tile,_details,allowPrepared)=>allowPrepared===true,
  groundSourceRevision:()=> 'prepared-v1',
  backgroundScene:{snapshot:()=>({})},
  staticScenery:{snapshot:()=>({})},
  worldTileSnapshotsSharp:()=>false,
  worldTileSnapshotDensity:()=>0,
  groundTileContentKey:()=> 'core-v1',
  groundTileReuse:{get:()=>null,put(){}},
  requestIdleCallback:callback=>callback(),
  document:{createElement:()=>({width:0,height:0,getContext:()=>g})},
  drawGround:()=>{ground++;},drawRoads:()=>{roads++;},
  drawMapObjects:()=>{scenery++;},
  spriteAtlas:{beginFrame(){},endFrame(){}},
  ctx:g,W:512,H:435,gpuFrame:false,step15PaintContext:null,tileBakes:0
 };
 const bake=new Function(...Object.keys(values),
  app.slice(start,end)+'\nreturn bakeWorldTile;')(...Object.values(values));
 const packet=await bake({id:'0,0',x:0,y:0,size:512},'mid');
 assert.equal(packet.complete,true);
 assert.equal(packet.revision,'prepared-v1');
 assert.equal(ground,1);assert.equal(roads,1);assert.equal(scenery,1);
});

test('authored ocean is authoritative over grass texture while land overrides remain intact',()=>{
 const app=read('app.js'),start=app.indexOf('function baseBiomeOf(c){'),
  end=app.indexOf('\nfunction typeOfCell(c)',start);
 assert.ok(start>=0&&end>start);
 const catalog={terrainTypes:[{id:'ocean',materialClass:'water'},
  {id:'grassland',materialClass:'ground'}]};
 const grass={path:'grass.png'},state={
  hexTerrain:{'-4,5':'grass.png','0,0':'grass.png'},
  biomeTerrain:{},baseBiomeByHex:{}
 };
 const deps={
  key:(q,r)=>q+','+r,state,catalog,
  useAsset:path=>path==='grass.png'?grass:null,
  typeOfAsset:a=>a?'grassland':null,
  demoTypes:{plains:'grassland'},
  window:{VedrasCatalog:{terrainType:(cat,id)=>
   cat.terrainTypes.find(t=>t.id===id)||null}}
 };
 const base=new Function(...Object.keys(deps),
  app.slice(start,end)+'\nreturn baseBiomeOf;')(...Object.values(deps));
 assert.equal(base({q:-4,r:5,terrainTypeId:'ocean',biome:'ocean',sceneWaterTerrain:true}),'ocean');
 assert.equal(base({q:-4,r:5,terrainTypeId:'ocean',biome:'ocean'}),'grassland',
  'unrelated user-editable water cells retain prior material override semantics');
 assert.equal(base({q:0,r:0,terrainTypeId:'grassland',biome:'plains'}),'grassland');
 assert.match(app,/scene\.terrainTypeByHex\[key\(cell\.q,cell\.r\)\]/);
 assert.match(app,/cell\.sceneWaterTerrain=true/);
});


test('one ground asset burst does not cause duplicate global scenery flush',()=>{
 const app=read('app.js');
 assert.match(app,/if\(groundChanged\)worldTiles\?\.invalidate\('image-ready-ground'\)/);
 assert.match(app,/invalidateSpriteLayout\(groundChanged\?new Set\(\):worldTilesForAssetPaths\(paths\)\)/);
 assert.match(app,/lastTileSnapshotSignature=tileSemanticSignature\(\)/);
 assert.match(app,/const semanticKey=tileSemanticSignature\(\)/);
 assert.match(app,/worldTiles\.invalidate\('semantic-content-changed'\)/,
  'independent genuine scene changes remain fully invalidating');
});

test('non-coastal tile has a stable absent shoreline revision',()=>{
 const app=read('app.js'),a=app.indexOf('function groundSourceRevision('),
  b=app.indexOf('\nfunction groundTileContentKey(',a);
 assert.ok(a>=0&&b>a);
 const values={
  state:{shoreline:{enabled:true},roadShown:false,river:false},
  shorelineCache:{segments:[]},
  shorelineChunks:{readyTiles:()=>{throw Error('no coast should be queried');}},
  roadChunks:{readyTiles:()=>[]},
  riverChunks:{readyTiles:()=>[]},
  currentTerrainCore:()=>({artwork:{version:'terrain-v1'}})
 };
 const revision=new Function(...Object.keys(values),
  app.slice(a,b)+'\nreturn groundSourceRevision;')(...Object.values(values));
 const tile={id:'0,0',x:0,y:0,size:512};
 const result=JSON.parse(revision(tile));
 assert.deepEqual(result,['terrain-v1','no-coast','off','off']);
});

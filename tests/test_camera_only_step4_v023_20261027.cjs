'use strict';
/* Step 4: camera-only composition, preserving the old editor path for edits.
 * Run: node --test tests/test_camera_only_step4_v023_20261027.cjs
 */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
function cameraHarness({tiles=1,terrain=0,fastAllowed=true,mode='normal',
 fastCamera=true}={}){
 const app=read('app.js'),start=app.indexOf('// Step 4: camera-only navigation'),
  end=app.indexOf('function beginFastCamera(){',start);
 assert.ok(start>0&&end>start,'camera route should be integrated into app.js');
 const zoomStart=app.indexOf('function applyZoom('),
  zoomEnd=app.indexOf('function setView(',zoomStart);
 assert.ok(zoomStart>0&&zoomEnd>zoomStart);
 let draws=0,fastFrames=0,fog=0,stops=0,invalidations=0;
 const state={mode,view:'map',zoom:1,panX:0,panY:0,fastCamera};
 const worldTiles={stats:()=>({tiles}),invalidate:()=>{invalidations++}};
 const terrainChunks={stats:()=>({cached:terrain})};
 const controls={'zoomSlider':{value:100},'zoomText':{textContent:''}};
 const env={state,worldTiles,terrainChunks,fastInteracting:false,
  tileModeActive:false,finalRendering:false,
  fastAllowed:()=>fastAllowed&&state.fastCamera!==false,
  fastRender:()=>{fastFrames++;},tileFog:()=>{fog++;},
  ZMIN:.25,ZMAX:4,W:1000,H:800,PROJECT_Y:.85,
  clamp:(n,a,b)=>Math.min(b,Math.max(a,n)),
  fromScreen:(x,y)=>({x:(x-500-state.panX)/state.zoom,
   y:(y-400-state.panY)/(state.zoom*.85)}),
  updateTerrainLod:()=>{},stopFastCameraForStrategy:()=>{stops++;},
  $:id=>controls[id],syncStrategicControls:()=>{},
  requestDraw:()=>{draws++;},updateDiagnostics:()=>{}};
 vm.runInNewContext(app.slice(start,end)+'\n'+app.slice(zoomStart,zoomEnd)+
  '\nfunction cameraActive(){return tileModeActive;}',env);
 return {env,state,zoom:value=>env.applyZoom(value),
  measurements:()=>({draws,fastFrames,fog,stops,invalidations,
   active:env.cameraActive()})};
}
test('programmatic zoom uses prepared tiles without issuing legacy scene draw',()=>{
 const h=cameraHarness();h.zoom(1.02);
 const a=h.measurements();
 assert.equal(a.draws,0,'no expensive mapCanvas draw for camera-only zoom');
 assert.equal(a.fastFrames,1);
 assert.equal(a.fog,1,'authorization mask initialized on compositor switch');
 assert.equal(a.active,true);
 assert.equal(h.state.zoom,1.02);
 h.zoom(1.04);
 const b=h.measurements();
 assert.equal(b.fastFrames,2);
 assert.equal(b.draws,0);
 assert.equal(b.fog,1,'do not rebuild Fog each zoom');
});
test('first frame without prepared tiles still uses normal renderer for bootstrap',()=>{
 const h=cameraHarness({tiles:0,terrain:0});
 h.zoom(1.02);
 const s=h.measurements();
 assert.equal(s.fastFrames,0);
 assert.equal(s.draws,1);
 assert.equal(s.fog,0);
 assert.equal(s.active,false);
});
test('prepared terrain chunks can initiate compositor while world tiles load',()=>{
 const h=cameraHarness({tiles:0,terrain:2});
 h.zoom(1.04);const s=h.measurements();
 assert.equal(s.fastFrames,1);
 assert.equal(s.draws,0);
 assert.equal(s.active,true);
});
test('editor-safe fallback applies when fast camera is disabled or unavailable',()=>{
 for(const opts of [{fastAllowed:false},{fastCamera:false}]){
  const h=cameraHarness(opts);h.zoom(1.07);
  const s=h.measurements();
  assert.equal(s.draws,1);assert.equal(s.fastFrames,0);
 }
});
test('no-op zoom does not schedule an unnecessary camera composition',()=>{
 const h=cameraHarness();h.zoom(1);
 const s=h.measurements();
 assert.equal(s.fastFrames,0);
 assert.equal(s.draws,1);
});
test('existing strategy mode transition cannot expose stale world tiles',()=>{
 const h=cameraHarness();
 h.zoom(.20);
 const s=h.measurements();
 assert.equal(h.state.mode,'far');
 assert.equal(s.stops,1);
 assert.equal(s.fastFrames,0);
 assert.equal(s.draws,1);
});
test('fast camera switch can leave retained compositor without clearing landscape',()=>{
 const app=read('app.js');
 assert.match(app,/if\(!state\.fastCamera\)endFastCamera\(false\)/);
 assert.match(app,/if\(!repair&&tileModeActive\)\{tileModeActive=false;realtimeMap\.hide\(\);\}/);
 assert.match(app,/cameraStats:\(\)=>\(/);
});
test('cached world tiles translate during pan and zoom without source rebuild',async()=>{
 const calls=[],images=[];
 const g={setTransform(){},clearRect(){},save(){},restore(){},
  beginPath(){},rect(){},clip(){},ellipse(){},
  fillRect(){},drawImage:(...args)=>images.push(args)};
 const c={width:0,height:0,getContext:()=>g};
 const sandbox={window:{},performance:{now:()=>2000}};
 vm.runInNewContext(read('world-tile-streamer.js'),sandbox);
 const world=sandbox.window.VedrasWorldTiles.create({
  canvas:c,requireScenery:true,
  source:(tile,lod)=>{calls.push([tile.id,lod]);return {complete:true,layers:[
   {layer:'ground',image:{width:128,height:128}},
   {layer:'scenery',image:{width:128,height:128}}
  ]};}});
 const t={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 const view={width:700,height:500,zoom:1,dpr:1,panX:0,panY:0};
 world.request(view,[t]);await flush();
 assert.equal(calls.length,1);
 const a=world.render(view);
 const first=images[0]?.slice(-4);
 images.length=0;
 const shifted={...view,zoom:1.04,panX:-140,panY:50};
 world.request(shifted,[t]);
 const b=world.render(shifted);
 const second=images[0]?.slice(-4);
 assert.equal(calls.length,1,'pan and zoom inside same LOD must not rebake tiles');
 assert.equal(world.stats().tiles,1);
 assert.equal(a.loaded,1);assert.equal(b.loaded,1);
 assert.ok(first&&second);
 assert.notEqual(first[0],second[0],'cached image must actually move on screen');
 assert.notEqual(first[2],second[2],'cached image scales with zoom');
});
test('normal renderer still handles overlays and final export',()=>{
 const app=read('app.js');
 const before=app.indexOf('function draw(){'),
  after=app.indexOf('function renderBackground(',before);
 const direct=app.slice(before,after);
 assert.match(direct,/if\(\(fastInteracting\|\|tileModeActive\)&&!finalRendering\)/);
 assert.match(app,/const interactiveBackground=finalRendering\|\|state\.view!=='map'/);
 assert.match(app,/if\(finalRendering\)blockers\.push\('Final-PNG-Export'\)/);
});

test('pointerup retains cached compositor instead of scheduling a full editor draw',()=>{
 const app=read('app.js'),start=app.indexOf('function endFastCamera(repair=true){'),
  end=app.indexOf('\nlet ctx=canvas.getContext(',start);
 assert.ok(start>=0&&end>start);
 let renders=0,legacy=0,hidden=0,released=0,removed=0;
 const env={state:{mode:'normal',view:'map'},fastInteracting:true,
  tileModeActive:true,fastWheelTimer:8,worldTiles:{},points:new Map(),
  clearTimeout:()=>{removed++},terrainChunks:{setInteractive:()=>released++},
  shorelineChunks:{setInteractive:()=>released++},
  riverChunks:{setInteractive:()=>released++},
  roadChunks:{setInteractive:()=>released++},
  realtimeMap:{hide:()=>hidden++},fastRender:()=>renders++,
  requestDraw:()=>legacy++,stopFastCameraForStrategy:()=>{}};
 vm.runInNewContext(app.slice(start,end)+
  '\nfunction cameraState(){return {fastInteracting,tileModeActive};}',env);
 env.endFastCamera(true);
 assert.equal(env.cameraState().fastInteracting,false);
 assert.equal(env.cameraState().tileModeActive,true);
 assert.equal(renders,1);
 assert.equal(legacy,0);
 assert.equal(released,4);
 assert.equal(removed,1);
 env.endFastCamera(false);
 assert.equal(env.cameraState().tileModeActive,false,'turning fast mode off hides retained compositor');
 assert.equal(hidden,1);
});

test('home pan at unchanged zoom stays within prepared world compositor',()=>{
 const h=cameraHarness();
 h.env.applyZoom(1,500,400,true);
 const result=h.measurements();
 assert.equal(result.fastFrames,1);
 assert.equal(result.draws,0);
 assert.equal(result.active,true);
 assert.match(read('app.js'),/applyZoom\(suggestedSceneZoom\(state\.sceneSize\),W\/2,H\/2,true\)/);
});

'use strict';
/* node --test tests/test_strategy_transition_v0221_20261026.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');

function overview(){
 const history=[];
 const canvas={
  save(){history.push('save')},restore(){history.push('restore')},
  setTransform(){history.push('transform')},
  clearRect(x,y,w,h){history.push(['clear',w,h])},
  fillRect(){history.push('background')},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},
  fill(){},stroke(){},arc(){},roundRect(){},
  measureText(s){return {width:String(s).length*6}},
  fillText(s){history.push(['label',String(s)])}
 };
 const sandbox={window:{}};
 vm.runInNewContext(read('strategic-view.js'),sandbox);
 const draw=sandbox.window.VedrasStrategic.draw;
 const cells=[
  {q:0,r:0,biome:'tundra'}, {q:1,r:0,biome:'tundra'},
  {q:0,r:1,biome:'pasture'}, {q:1,r:1,biome:'pasture'},
  {q:2,r:0,biome:'pasture'}, {q:2,r:-1,biome:'tundra'}
 ];
 const opts={cells,dimensions:{width:900,height:500},zoom:.25,
  panX:0,panY:0,dpr:1,hexWidth:256,projectY:.85,
  typeFor:c=>c.biome,nameFor:t=>t.toUpperCase(),
  centers:[],overlay:'both',selected:'0,0'};
 return {canvas,draw,opts,history};
}

test('a strategic frame clears the complete canvas before drawing labels',()=>{
 const h=overview();
 h.draw(h.canvas,h.opts);
 const firstLabels=h.history.filter(x=>Array.isArray(x)&&x[0]==='label').length;
 assert.ok(firstLabels>0);
 h.draw(h.canvas,{...h.opts,panX:45,zoom:.3,overlay:'centers'});
 const clears=h.history.filter(x=>Array.isArray(x)&&x[0]==='clear');
 assert.equal(clears.length,2,'zoomed strategic view must fully clear prior labels');
 assert.deepEqual(clears.map(x=>x.slice(1)),[[900,500],[900,500]]);
 assert.equal(h.history.filter(x=>Array.isArray(x)&&x[0]==='label').length,firstLabels,
  'centers-only pass must not redraw old biome labels');
});

test('strategy mode revokes the fast compositor before any full editor frame',()=>{
 const app=read('app.js');
 assert.match(app,/function stopFastCameraForStrategy\(\)/);
 assert.match(app,/fastInteracting=false;tileModeActive=false;/);
 assert.match(app,/worldTiles\?\.invalidate\(\)/);
 assert.match(app,/realtimeMap\.hide\(\);/);
 assert.match(app,/function requestDraw\(\)\{\s*if\(state\.mode==='far'&&\(fastInteracting\|\|tileModeActive\)\)\s*stopFastCameraForStrategy\(\);/);
 assert.match(app,/function draw\(\)\{\s*if\(state\.mode==='far'\)stopFastCameraForStrategy\(\);/);
 assert.match(app,/function fastRender\(\)\{\s*if\(state\.mode==='far'\|\|state\.view!=='map'\)/);
 assert.match(app,/if\(\(!fastInteracting&&!tileModeActive\)\|\|state\.mode==='far'\|\|/);
});

test('changing far/detail mode invalidates stale rasterized strategy labels',()=>{
 const app=read('app.js');
 assert.match(app,/if\(previousMode!==state\.mode\)\{[\s\S]*?stopFastCameraForStrategy\(\)/);
 assert.match(app,/if\(state\.mode==='normal'\)worldTiles\?\.invalidate\(\)/);
 assert.match(app,/if\(signal\?\.aborted\|\|state\.mode==='far'\|\|state\.view!=='map'\)return null;/);
});

test('only terrain chunks painted in the current revision can seed a world tile',()=>{
 const app=read('app.js');
 assert.match(app,/function currentTerrainCore\(t\)\{/);
 assert.match(app,/terrainChunks\.readyTiles\(/);
 assert.match(app,/terrainChunks\.paintedVersions\(\)\.get\(t\.id\)===entry\.artwork\.version/);
 assert.match(app,/if\(units\|\|!tileArtworkReady\(t\)\)continue/);
 assert.match(app,/if\(a&&b&&tileArtworkReady\(t\)\)/);
 assert.match(app,/if\(signal\?\.aborted\|\|!tileArtworkReady\(t\)\)return null/);
});

test('executing far-mode cleanup hides canvas and aborts obsolete tile snapshots',()=>{
 const app=read('app.js'),start=app.indexOf('function stopFastCameraForStrategy(){'),
  end=app.indexOf('\nfunction fastRender(){',start);
 assert.ok(start>=0&&end>start);
 const executed=[];
 const env={clearTimeout:()=>executed.push('timer'),
  realtimeMap:{hide:()=>executed.push('hide')},
  worldTiles:{invalidate:()=>executed.push('invalidate')},
  terrainChunks:{setInteractive:v=>executed.push('terrain:'+v)},
  shorelineChunks:{setInteractive:v=>executed.push('shore:'+v)},
  riverChunks:{setInteractive:v=>executed.push('river:'+v)},
  roadChunks:{setInteractive:v=>executed.push('roads:'+v)}
 };
 const cleanup=vm.runInNewContext(
  'let fastInteracting=true,tileModeActive=true,fastWheelTimer=12;'+
  app.slice(start,end)+';stopFastCameraForStrategy();'+
  '({fastInteracting,tileModeActive,fastWheelTimer})',env);
 assert.equal(cleanup.fastInteracting,false);
 assert.equal(cleanup.tileModeActive,false);
 assert.equal(cleanup.fastWheelTimer,null);
 assert.ok(executed.includes('hide'));
 assert.ok(executed.includes('invalidate'));
 assert.ok(executed.includes('terrain:false'));
 assert.ok(executed.includes('shore:false'));
 assert.ok(executed.includes('river:false'));
 assert.ok(executed.includes('roads:false'));
});

test('terrain-core gate rejects missing and stale chunks before seeding',()=>{
 const app=read('app.js'),start=app.indexOf('function currentTerrainCore(t){'),
  end=app.indexOf('function seedReadyWorldTiles(){',start);
 assert.ok(start>=0&&end>start);
 let ready=false,version=4;
 const terrainChunks={
  readyTiles:()=>ready?[{tile:{id:'0,0'},artwork:{version:5}}]:[],
  paintedVersions:()=>new Map([['0,0',version]])
 };
 const raster={ready:true};
 const state={chunkRendering:true,sceneSize:37};
 const terrainRasterCache={raster,signature:'direct-v1'};
 const logic=vm.runInNewContext(app.slice(start,end)+
  ';({currentTerrainCore,paintedTerrainCore})',
  {terrainChunks,state,terrainRasterCache,window:{__vedrasTerrainRaster:raster}});
 const t={id:'0,0',x:0,y:0,size:512};
 assert.equal(logic.currentTerrainCore(t),null,'missing chunks stay clouds');
 ready=true;
 assert.equal(logic.paintedTerrainCore(t),null,'stale screenshot is rejected');
 version=5;
 assert.equal(logic.paintedTerrainCore(t).artwork.version,5,
  'exact current snapshot can now be seeded');
 state.chunkRendering=false;
 assert.equal(logic.paintedTerrainCore(t).artwork.version,'direct-v1',
  'finished direct-raster mode must continue working without chunk caches');
 terrainRasterCache.raster=null;
 assert.equal(logic.paintedTerrainCore(t),null,
  'no unprepared full-raster source may be seeded');
});

test('strategy fix is cache-busted in the visible v0.22.1 app',()=>{
 const html=read('index.html'),server=read('server.py');
 assert.match(html,/Asset-Labor v0\.22\.6/);
 assert.match(html,/app\.js\?v=0\.55\.6/);
 assert.match(server,/VERSION = '0\.22\.6'/);
});

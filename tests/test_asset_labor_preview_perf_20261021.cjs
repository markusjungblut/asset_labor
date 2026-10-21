'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

test('fast preview has independent raster density and the original manual quality controls',()=>{
 assert.match(app,/quality:'fast'/);
 assert.match(app,/function previewDensity\(\)/);
 assert.match(app,/quality==='fast'\?1300000/);
 assert.match(html,/<option value="fast" selected>/);
 for(const quality of ['1','2','3','4'])assert.match(html,new RegExp('option value="'+quality+'"'));
});
test('editor changes debounce at 170ms and retain per-layer invalidation',()=>{
 assert.match(app,/function deferSceneRender\(channel,apply,delay=170\)/);
 assert.match(app,/deferSceneRender\('terrain',\(\)=>invalidateTerrain\('material'\)\)/);
 assert.match(app,/deferSceneRender\('shoreline',\(\)=>\{\}\)/);
 assert.match(app,/function invalidateTerrain\(scope='all'\)/);
 assert.match(app,/if\(scope==='forest'\)/);
 assert.match(app,/if\(scope==='rivers'\)/);
 assert.match(app,/if\(scope==='relief'\)/);
 assert.match(app,/effectiveBiome\(c\),selected\[i\]/);
});
test('camera changes cannot force regeneration of the connected forest-floor raster',()=>{
 const section=app.slice(app.indexOf('function drawForestFloor()'),app.indexOf('function drawGround()'));
 assert.match(section,/const resolution=finalRendering\?1\.4:/);
 assert.doesNotMatch(section,/state\.zoom\*state\.dpr/);
 assert.match(section,/forestFloorRasterCache\.signature!==signature/);
});
test('geography relief can run in a Worker and PNG export does not replace scene JSON',()=>{
 assert.match(app,/const workerActive=state\.workerTerrain!==false&&window\.VedrasTerrainWorker\.available\(\)/);
 assert.match(app,/\$\('exportMapPng'\)\.addEventListener\('click'/);
 assert.match(app,/t\.pending===0&&t\.painted===t\.visible&&t\.stalePainted===0/);
 assert.match(app,/canvas\.toBlob/);
 assert.match(html,/id="saveScene"/);
 assert.match(html,/id="exportMapPng"/);
 assert.match(app,/vedras_scene\.json/);
});
test('397-hex world uses a small set of visible chunks and caches completed tiles',()=>{
 const sandbox={window:{},performance:{now:()=>0},
  requestIdleCallback:task=>task(),console:{error:()=>{}}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'chunks.js'),'utf8'),sandbox);
 const C=sandbox.window.VedrasChunks;
 const cells=[];
 for(let r=-11;r<=11;r++)for(let q=-11;q<=11;q++)
  if(Math.abs(q+r)<=11)cells.push({q,r});
 assert.equal(cells.length,397);
 const small=C.visible({x:-300,y:-300,width:600,height:600},cells);
 assert.ok(small.length>0&&small.length<20);
 const engine=C.create({size:512,maxTiles:8,maxPixels:500000});
 let builds=0;
 engine.configure('preview',{worldCells:cells,family:'world',
  buildTile:tile=>{builds++;return {raster:{
   canvas:{width:100,height:100},x:tile.x,y:tile.y,width:512,height:512
  }};},redraw:()=>{}});
 const ctx={save(){},beginPath(){},rect(){},clip(){},restore(){}};
 const bounds={x:-300,y:-300,width:600,height:600};
 engine.draw(ctx,bounds,{drawRaster:()=>{},margin:0});
 engine.draw(ctx,bounds,{drawRaster:()=>{},margin:0});
 assert.equal(builds,small.length);
 assert.equal(engine.stats().pending,0);
 assert.equal(engine.stats().painted,small.length);
 assert.ok(engine.stats().cacheHits>=small.length);
});

test('single local edit rebuilds only the stamped viewport chunk',()=>{
 const sandbox={window:{},performance:{now:()=>0},
  requestIdleCallback:task=>task(),console:{error:()=>{}}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'chunks.js'),'utf8'),sandbox);
 const C=sandbox.window.VedrasChunks;
 const cells=[];for(let r=-4;r<=4;r++)for(let q=-4;q<=4;q++)
  if(Math.abs(q+r)<=4)cells.push({q,r});
 const bounds={x:-300,y:-300,width:600,height:600};
 const tiles=C.visible(bounds,cells);
 assert.ok(tiles.length>1);
 const changed=tiles[0].id;
 let revision=0,builds=0;
 const engine=C.create({size:512,maxTiles:20,maxPixels:1000000});
 engine.configure('same-global-materials',{worldCells:cells,
  stampTile:tile=>tile.id===changed?'local-revision-'+revision:'unchanged',
  buildTile:tile=>{builds++;return {raster:{
   canvas:{width:64,height:64},x:tile.x,y:tile.y,width:512,height:512
  }};},redraw:()=>{}});
 const ctx={save(){},beginPath(){},rect(){},clip(){},restore(){}};
 engine.draw(ctx,bounds,{drawRaster:()=>{},margin:0});
 assert.equal(builds,tiles.length);
 revision=1;
 engine.draw(ctx,bounds,{drawRaster:()=>{},margin:0});
 assert.equal(builds,tiles.length+1);
 assert.equal(engine.stats().painted,tiles.length);
});

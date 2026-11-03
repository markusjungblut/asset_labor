'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const chunks=fs.readFileSync(path.join(__dirname,'../chunks.js'),'utf8');
const sideSource=app.slice(app.indexOf('function shorelineSideCells(asset){'),app.indexOf('\nfunction changedGroundTileIds',app.indexOf('function shorelineSideCells(asset){')));
assert.ok(sideSource.startsWith('function shorelineSideCells(asset){'));
const key=(q,r)=>q+','+r;
const paths=Array.from({length:6},(_,i)=>'assets/shorelines/shore_v105_edge_'+String(i+1).padStart(2,'0')+'.png');
function sideHarness({cells=[{q:0,r:0},{q:20,r:0}],segments=[
 {side:0,cell:{q:0,r:0},center:{x:0,y:0}},
 {side:1,cell:{q:20,r:0},center:{x:5120,y:0}}],
 wetBefore=[],wetNow=wetBefore,enabled=true,mode='art',missingBaseline=false,missingGeometry=false}={}){
 const baseline=missingBaseline?null:new Map(cells.map(c=>[key(c.q,c.r),wetBefore.includes(key(c.q,c.r))]));
 const state={shoreline:{enabled,mode}};
 const cache={segments:missingGeometry?null:segments};
 const selector=new Function('worldCells','state','shorelineCache','lastGroundWetCells','SHORE_EDGE_PATHS','key','isWaterTerrain','typeOfCell',
  sideSource+'\nreturn shorelineSideCells;')(
  cells,state,cache,baseline,paths,key,t=>t==='water',c=>wetNow.includes(key(c.q,c.r))?'water':'grassland');
 return {run:selector,cache,cells};
}
function stamped({segments,files,mode='art'}){
 const anchor=app.indexOf('// Image revisions belong to each tile');
 assert.ok(anchor>0,'source must define per-shore-tile stamp');
 const start=app.indexOf('const stampTile=tile=>{',anchor);
 const end=app.indexOf('\n  shorelineChunks.configure(',start);
 assert.ok(start>0&&end>start,'stamp is used directly by production chunk configure');
 const src=app.slice(start,end);
 return new Function('window','segments','files','opts',src+'\nreturn stampTile;')(
  {VedrasChunks:{HALO:128}},segments,files,{mode});
}
test('shoreline side image changes only land hexes with corresponding edge',()=>{
 const h=sideHarness();
 assert.deepEqual([...h.run({path:paths[0]})],['0,0']);
 assert.deepEqual([...h.run({path:paths[1]})],['20,0']);
 assert.deepEqual([...h.run({path:paths[2]})],[]);
});
test('unknown shoreline source or geometry must retain global fallback',()=>{
 assert.equal(sideHarness().run({path:'unrecognized.png'}),null);
 assert.equal(sideHarness({missingGeometry:true}).run({path:paths[0]}),null);
 assert.equal(sideHarness({missingBaseline:true}).run({path:paths[0]}),null);
 assert.equal(sideHarness({mode:'temp'}).run({path:paths[0]}),null);
});
test('wet topology transition forbids local shoreline dependencies',()=>{
 assert.equal(sideHarness({wetNow:['20,0']}).run({path:paths[0]}),null);
});
test('disabled shoreline has no pixel dependencies',()=>{
 assert.deepEqual([...sideHarness({enabled:false}).run({path:paths[0]})],[]);
});
test('per-chunk shoreline stamp changes only with PNGs actually used in its raster',()=>{
 const segments=[
  {side:0,cell:{q:0,r:0},center:{x:0,y:0}},
  {side:1,cell:{q:20,r:0},center:{x:5120,y:0}}
 ];
 const files=[{path:paths[0],mtime:1,imageRevision:1},{path:paths[1],mtime:2,imageRevision:1}];
 const near={x:0,y:0,size:512},far={x:5120,y:0,size:512};
 const prior=stamped({segments,files});
 const beforeNear=prior(near),beforeFar=prior(far);
 files[0]={...files[0],imageRevision:2};
 const later=stamped({segments,files});
 assert.notEqual(later(near),beforeNear,'changed side raster must be rebuilt');
 assert.equal(later(far),beforeFar,'distant different-side raster must survive');
});
test('shoreline stamp uses 128 plus 260-unit source footprint rather than global side list',()=>{
 const s=[{side:4,cell:{q:0,r:0},center:{x:-380,y:50}}];
 const stamp=stamped({segments:s,files:Array.from({length:6},(_,i)=>({path:paths[i],imageRevision:1}))});
 assert.notEqual(stamp({x:0,y:0,size:512}),'[]');
 assert.equal(stamp({x:2000,y:0,size:512}),'[]');
});
test('renderer uses stable shoreline geometry family, revisioned per-chunk stamps',()=>{
 assert.match(app,/shorelineChunks\.configure\(shoreGeometryKey\+'\|density='\+shoreDensity,\{\s*worldCells,stampTile/);
 assert.match(app,/redraw:tile=>\{[\s\S]*?requestDraw\(\);\s*\},family:shoreGeometryKey/);
 assert.match(app,/const shoreGeometryKey=JSON\.stringify\(\{cells:classes/);
});
test('editor source start gate also requires prepared coastal art',()=>{
 assert.match(app,/canStartSource:tile=>tileArtworkStatus\(tile,null,true\)/);
 assert.match(app,/if\(!ready\)\{\s*if\(details\)details\.shorelineReason='shoreline-chunk-not-ready';/);
});
test('production image-ready dispatcher uses direction-aware dependency and global fallback',()=>{
 assert.match(app,/a\.category==='shorelines'\?shorelineSideCells\(a\):null/);
 assert.match(app,/if\(changed===null\)groundAssetNeedsGlobal=true/);
 assert.match(app,/else worldTiles\?\.invalidateTiles\(groundIds,'image-ready-ground-selective'\)/);
});

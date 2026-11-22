/* Phase-1 large-map baking preflight: deterministic planning, no artwork. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const G=require('../worldgen-geography.js');
const MIX=require('../geography-lab-presets.js');
const P=require('../large-map-bake-plan.js');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../chunks.js'),'utf8'),sandbox);
const C=sandbox.window.VedrasChunks;
function world(seed='vedras-welt-01',w=95,h=75,originQ=0,originR=0){
 return G.generateWorld(seed,{width:w,height:h,originQ,originR,
  config:MIX.configFor(G)});
}
test('95x75 variety world has a reproducible full-tile plan (not PNGs)',()=>{
 const w=world(),before=JSON.stringify(w);
 const a=P.plan(w),b=P.plan(w);
 assert.deepEqual(a,b);
 assert.equal(JSON.stringify(w),before,'planning cannot mutate world');
 assert.equal(a.source.cells,7125);
 assert.deepEqual(a.source.config,w.config);
 assert.equal(a.tileCount,1678);
 assert.equal(a.schema,'vedras-geography-bake-plan-v1');
 assert.equal(a.stage,'plan-only');
 assert.equal(a.rasterized,false);
 assert.equal(a.readyForViewer,false);
 assert.deepEqual(a.target.requiredLayers,['ground','scenery']);
 assert.equal(a.grid.tileSize,C.SIZE);
 assert.equal(a.grid.sourceHalo,470);
 assert.equal(P.batches(a,16).length,105);
 assert.equal(P.batches(a,16).at(-1).tiles.length,14);
 assert(P.validatePlan(JSON.parse(JSON.stringify(a))));
});
test('planned 512-unit occupied tiles agree with the existing chunks.js renderer',()=>{
 const w=world('chunk-parity',30,27,-28,19);
 const a=P.plan(w);
 const minX=Math.min(...a.tiles.map(x=>x.x))-C.SIZE;
 const minY=Math.min(...a.tiles.map(x=>x.y))-C.SIZE;
 const maxX=Math.max(...a.tiles.map(x=>x.x))+2*C.SIZE;
 const maxY=Math.max(...a.tiles.map(x=>x.y))+2*C.SIZE;
 const existing=C.visible({x:minX,y:minY,width:maxX-minX,height:maxY-minY},w.cells);
 assert.deepEqual(a.tiles.map(t=>t.id).sort(),Array.from(existing,t=>t.id).sort());
 for(const c of w.cells.slice(0,300)){
  const expected=C.worldPos(c),actual=P.worldPos(c);
  assert.equal(actual.x,expected.x);assert.equal(actual.y,expected.y);
 }
});
test('world identity changes with seed, config and origin; same area stays stable',()=>{
 const baseline=world('seed-A',22,20,-8,-7);
 const plan=P.plan(baseline);
 assert.notEqual(P.plan(world('seed-B',22,20,-8,-7)).source.fingerprint,
  plan.source.fingerprint);
 assert.notEqual(P.plan(world('seed-A',22,20,-9,-7)).source.fingerprint,
  plan.source.fingerprint);
 const modified=structuredClone(baseline);
 modified.cells[0].terrainId='other-terrain';
 assert.notEqual(P.plan(modified).source.fingerprint,plan.source.fingerprint);
 const ids=new Set(plan.tiles.map(x=>x.id));
 assert.equal(ids.size,plan.tileCount);
 for(const tile of plan.tiles){
  assert.equal(tile.id,(tile.x/512)+','+(tile.y/512));
  assert.equal(tile.size,512);
 }
});
test('reject corrupt / sparse / re-ordered geography and fake completed plans',()=>{
 const original=world('invalid-check',12,10);
 const invalid=[
  {...original,cells:original.cells.slice(1)},
  {...original,cells:[...original.cells].reverse()},
  {...original,originQ:1000001},
  {...original,version:'unknown'},
 ];
 for(const data of invalid)assert.throws(()=>P.plan(data));
 const good=P.plan(original);
 assert.throws(()=>P.batches(good,0));
 assert.throws(()=>P.batches(good,129));
 assert.throws(()=>P.validatePlan({...good,readyForViewer:true}));
 assert.throws(()=>P.validatePlan({...good,tiles:[good.tiles[0],good.tiles[0]],tileCount:2}));
});
test('geography laboratory offers honest plan-only export and loads its dependency',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8');
 const js=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 assert.match(html,/id="planLargeMap"/);
 assert.match(html,/id="largeBakeBatchSize"/);
 assert.match(html,/Renderplan erstellen und als JSON exportieren/);
 const planner=html.indexOf('src="large-map-bake-plan.js'),
  controller=html.indexOf('src="geography-lab.js');
 assert(planner>=0&&controller>planner);
 assert.match(js,/BAKE\.plan\(world\)/);
 assert.match(js,/BAKE\.batches\(plan,batchSize\)/);
 assert.match(js,/0 PNGs erstellt/);
});
test('large rectangular coordinate grid is planned without monolithic raster allocations',()=>{
 // Synthetic semantic world isolates planner scaling from expensive
 // procedural climate generation; 57,600 is inside the 60,000 cell limit.
 const width=240,height=240,cells=[];
 for(let r=0;r<height;r++)for(let q=0;q<width;q++)
  cells.push({q:q-120,r:r-120,terrainId:'grassland',
   reliefClass:'plain',features:[]});
 const synthetic={version:G.VERSION,seed:'large-grid',width,height,
  originQ:-120,originR:-120,config:G.defaultConfig(),cells,riverPaths:[]};
 const p=P.plan(synthetic);
 assert(p.tileCount>1000);
 assert.equal(p.source.cells,57600);
 assert.equal(P.batches(p,128).reduce((n,b)=>n+b.tiles.length,0),p.tileCount);
});

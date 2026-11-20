'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'geography-io.js'),'utf8');
const sandbox={window:{}};vm.runInNewContext(source,sandbox);
const IO=sandbox.window.VedrasGeographyIO;
const G=require('../worldgen-geography.js');
const raw={generatorVersion:G.VERSION,seed:'roundtrip-unit-1',width:12,height:11,
 originQ:-7,originR:8,config:G.defaultConfig()};
const world=G.generateWorld(raw.seed,raw);
test('valid exported parameter JSON recreates identical world and world JSON',()=>{
 const first=IO.generate(raw,G);
 assert.equal(first.world.cells.length,132);
 assert.equal(first.settings.seed,raw.seed);
 assert.equal(first.settings.originQ,-7);
 const saved=JSON.parse(JSON.stringify(first.world));
 assert.deepEqual(IO.generate(saved,G,{requireWorld:true}).world,saved);
 assert.equal(IO.signature(saved,G),IO.signature(first.world,G));
});
test('current world cell edits are rejected; state is never replaced silently',()=>{
 const tampered=JSON.parse(JSON.stringify(world));
 tampered.cells[0].terrainId='invalid-terrain';
 assert.throws(()=>IO.generate(tampered,G,{requireWorld:true}),/Hexdaten/);
 const badRiver=JSON.parse(JSON.stringify(world));
 badRiver.riverPaths.push([[999,999],[998,998]]);
 assert.throws(()=>IO.generate(badRiver,G,{requireWorld:true}),/Flussrouten/);
 assert.throws(()=>IO.generate(raw,G,{requireWorld:true}),/Parameterdatei/);
});
test('strict validation rejects incorrect seeds, dimensions, versions and configs',()=>{
 for(const fail of [
  {...raw,seed:[]},{...raw,seed:''},{...raw,width:241},
  {...raw,width:'12'},{...raw,originQ:1e9},{...raw,config:null},
  {...raw,config:{...raw.config,'climate.humidity':500}},
  {...raw,generatorVersion:'geography-v0.0.0'}
 ])assert.throws(()=>IO.readSettings(fail,G));
 const older={...raw,generatorVersion:'geography-v2.1.1'};
 assert.throws(()=>IO.readSettings(older,G),/Bestätigung/);
 assert.equal(IO.readSettings(older,G,{allowLegacy:true}).legacy,true);
});
test('statistics are validated for matching world rather than silently imported',()=>{
 const samples=[G.generateWorld('sample-a',raw).stats,
  G.generateWorld('sample-b',raw).stats];
 const data=G.aggregateDistributions(samples);
 const exported={...raw,seedBase:raw.seed,...data};
 const result=IO.readStatistics(exported,world,G);
 assert.equal(result.samples,2);
 assert.equal(result.meanHexes,132);
 assert.throws(()=>IO.readStatistics({...exported,seedBase:'wrong'},world,G),
  /passt nicht/);
 assert.throws(()=>IO.readStatistics({...exported,samples:0},world,G),
  /ungültige/);
});
test('Asset-Labor source consumes the same validator and reports failed scene imports',()=>{
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),
  html=fs.readFileSync(path.join(root,'index.html'),'utf8'),
  lab=fs.readFileSync(path.join(root,'geography-lab.js'),'utf8'),
  labHtml=fs.readFileSync(path.join(root,'geography-lab.html'),'utf8');
 assert.match(app,/window\.VedrasGeographyIO\.parseFile\(file\)/);
 assert.match(app,/IO\.generate\(raw,G,\{allowLegacy:legacy\}\)/);
 assert.match(app,/Geografie nicht übernommen: Der /);
 assert.match(app,/vedras-geography-preview-result/);
 assert.match(lab,/IO\.generate\(raw,G,\{\.\.\.options,requireWorld:true\}\)/);
 assert.match(lab,/IO\.readStatistics\(raw,world,G\)/);
 for(const id of ['importWorld','worldFile','importDistribution','distributionFile'])
  assert.ok(labHtml.includes('id="'+id+'"'),'missing '+id);
 assert.ok(html.includes('geography-io.js?v='));
 assert.ok(labHtml.includes('geography-io.js?v='));
});

test('actual Asset-Labor importGeographyWorld accepts valid center crop and reports rejection without scene mutation',()=>{
 const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
 const begin=source.indexOf('function importGeographyWorld(world){');
 const end=source.indexOf("window.addEventListener('message',event=>{",begin);
 assert.ok(begin>0&&end>begin);
 const fn=source.slice(begin,end);
 const output={};
 const state={sceneSize:37,natureSeed:'test',relief:{enabled:false},
  forest:{},river:false,hexTerrain:{},biomeTerrain:{},baseBiomeByHex:{}};
 const nodes={catalogMessage:{textContent:''},riverToggle:{checked:false}};
 let saved=0,redraw=0;
 const context={
  state,window:{VedrasGeography:G,confirm:()=>true,
   VedrasForest:{defaults:()=>({}),valid:data=>data},
   VedrasRivers:{normalizeRoutes:r=>r},
   VedrasRelief:{valid:r=>r},
   VedrasNature:{renderPlaced:()=>{}},
   dispatchEvent:()=>{}},
  Event:class Event{constructor(name){this.type=name;}},
  $:id=>nodes[id]??(nodes[id]={}),
  sceneRadius:()=>3,
  key:(q,r)=>q+','+r,
  catalog:{terrainTypes:G.TERRAIN_IDS.map(id=>({id}))},
  worldCells:[],wetHex:()=>false,
  syncReliefUI:()=>{},riverRasterCache:{clear:()=>{}},
  invalidateTerrain:()=>{},setView:()=>{},applyZoom:()=>{},
  suggestedSceneZoom:()=>1,persistScene:()=>{saved++},
  requestDraw:()=>{redraw++},
  localStorage:{}
 };
 const api=vm.runInNewContext(fn+'\nimportGeographyWorld;',context);
 const valid=G.generateWorld('asset-lab-interchange',{
  width:35,height:26,originQ:-13,originR:29,config:G.defaultConfig()});
 assert.equal(api(valid),true,nodes.catalogMessage.textContent);
 assert.equal(context.worldCells.length,37);
 assert.equal(saved,1);assert.equal(redraw,1);
 assert.equal(state.geographySource.seed,valid.seed);
 // The exporter owns the forest *absence* too. Every imported cell must
 // be pinned, otherwise VedrasForest generates an additional random grove.
 assert.equal(Object.keys(state.forest.overrides).length,37);
 assert.equal(Object.keys(state.forest.geographyHexes).length,37,
  'Geography pinning includes explicitly bare hexes so edge trees can spill without creating forests');
 const rawByPosition=new Map(valid.cells.map(c=>[c.q+','+c.r,c]));
 const forestSandbox={window:{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'forest.js'),'utf8'),forestSandbox);
 const waterIds=new Set(['ocean','coastal_water','icy_ocean','stormy_ocean']);
 const types={terrainTypes:G.TERRAIN_IDS.map(id=>({id,
  materialClass:waterIds.has(id)?'water':'ground',
  categoryId:'grass_pasture'}))};
 const calculated=forestSandbox.window.VedrasForest.generate(context.worldCells,
  types,state.forest,c=>c.terrainTypeId,c=>c.terrainTypeId);
 for(const c of calculated){
  const local=context.worldCells.find(cell=>cell.q===c.q&&cell.r===c.r);
  const original=rawByPosition.get(local.worldQ+','+local.worldR);
  assert.equal(state.forest.overrides[c.key],original.forestClass,
   'importer must explicitly pin nonforest and forest cells');
  assert.equal(c.forestClass,original.forestClass,
   'renderer must not invent an extra grove on imported Geography');
 }
 const previous=context.worldCells;
 const bad=G.generateWorld('small-world',{width:10,height:10});
 context.state.sceneSize=397;context.sceneRadius=()=>11;
 assert.equal(api(bad),false,'out-of-bounds scenes are rejected without changes');
 assert.match(nodes.catalogMessage.textContent,/zu klein/);
 assert.strictEqual(context.worldCells,previous,'failed import cannot replace the current scene');
 assert.equal(saved,1);
 const unsupported=G.generateWorld('bad-terrain',{width:35,height:26});
 unsupported.cells.forEach(c=>{c.terrainId='__bad__';});
 context.state.sceneSize=37;context.sceneRadius=()=>3;
 assert.equal(api(unsupported),false);
 assert.match(nodes.catalogMessage.textContent,/Terrain-ID fehlt/);
 assert.strictEqual(context.worldCells,previous);
});

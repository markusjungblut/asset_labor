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

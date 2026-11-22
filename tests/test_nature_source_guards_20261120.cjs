'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'nature_catalog.js'),'utf8'),sandbox);
const N=sandbox.window.VedrasNatureCatalog;
const terrain=JSON.parse(fs.readFileSync(path.join(root,'assets/terrain/terrain_catalog.json'),'utf8'));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/nature/nature_catalog.json'),'utf8'));
const allowed=(meta,base,forestClass='none')=>N.canPlace(meta,{
 baseBiome:base,biome:base,forestClass,neighborTypes:[]},terrain,catalog);
test('cactus filename cannot be reclassified into a grassland bush',()=>{
 const cactus=catalog.entries['nature/cactus_01.png'];
 assert(cactus&&allowed(cactus,'savanna'));
 const tampered={...cactus,id:'ordinary_bush',family:'dry_bushes',
  allowedTerrainCategories:['grass_pasture','arid_regions'],
  allowedTerrainTypes:['grassland','savanna'],
  sourceReference:'Bestandsdatei: cactus_01.png'};
 assert.equal(allowed(tampered,'grassland'),false);
 assert.equal(allowed(tampered,'pasture'),false);
 assert.equal(allowed(tampered,'savanna'),true);
 assert.equal(allowed(tampered,'savanna','dense_forest'),false);
});
test('succulent filename cannot leak through legacy terrain categories',()=>{
 const plant=catalog.entries['nature/sukkulent1.png'];
 const tampered={...plant,id:'generic_ground_cover',family:'herbs',
  allowedTerrainCategories:['grass_pasture','arid_regions'],
  allowedTerrainTypes:['grassland','savanna'],
  sourceReference:'Bestandsdatei: sukkulent1.png'};
 assert.equal(allowed(tampered,'grassland'),false);
 assert.equal(allowed(tampered,'savanna'),true);
});
test('source-backed warm boulder is warm-only even with wrong stored id and family',()=>{
 const boulder=catalog.entries['nature/boulder_45.png'];
 const tampered={...boulder,id:'ordinary_stone',family:'stones',
  allowedTerrainCategories:['grass_pasture','arid_regions'],
  allowedTerrainTypes:['grassland','savanna'],
  sourceReference:'Bestandsdatei: boulder_45.png'};
 assert.equal(allowed(tampered,'grassland'),false);
 assert.equal(allowed(tampered,'pasture'),false);
 assert.equal(allowed(tampered,'savanna'),true);
 const ordinary=catalog.entries['nature/boulder_01.png'];
 assert.equal(allowed(ordinary,'grassland'),true,
  'normal rocks still belong on grassy terrain');
});
test('winter boulder and other habitats stay correctly restricted',()=>{
 const winter=catalog.entries['nature/boulder_26.png'];
 const damaged={...winter,id:'generic_stone',family:'stones',
  sourceReference:'Bestandsdatei: boulder_26.png',
  allowedTerrainCategories:['grass_pasture','cold_regions'],
  allowedTerrainTypes:['grassland','tundra']};
 assert.equal(allowed(damaged,'grassland'),false);
 assert.equal(allowed(damaged,'tundra'),true);
 const ordinary={...catalog.entries['nature/boulder_01.png'],sourceReference:'Bestandsdatei: boulder_01.png'};
 assert.equal(allowed(ordinary,'grassland'),true);
});
test('offline exporter isolates native 4x core pixel corruption and fails closed',()=>{
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 assert.match(app,/const workQueue=all\.slice\(\),retriedIds=new Set\(\),pixelIssues=new Map\(\)/);
 assert.match(app,/pixelIssues\.set\(tile\.id,reason\)/);
 assert.match(app,/pixelIssues\.delete\(tile\.id\)/);
 assert.match(app,/\!run\.cancel&&audit\.complete&&seamAudit\.complete/);
 assert.match(app,/groundSeamPolicy:'exclusive'/);
});

test('geographical mountain HEXes select catalogued mountain sprites before PNG decode',()=>{
 const source=fs.readFileSync(path.join(root,'nature-ui.js'),'utf8');
 const begin=source.indexOf(' function autoGeoMountains(');
 const end=source.indexOf(' const isBoulder=',begin);
 assert.ok(begin>=0&&end>begin,'exercise the real geography-to-mountain implementation');
 const mountainSandbox={window:{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'mountain.js'),'utf8'),mountainSandbox);
 const mountainMeta=catalog.entries['nature/berg_17.png'];
 assert.equal(mountainMeta.kind,'mountain');
 assert.equal(N.mountainAllowed(mountainMeta,'grassland',terrain,catalog),true);
 const image={category:'nature',relPath:'nature/berg_17.png',
  path:'assets/nature/berg_17.png',name:'berg_17.png',img:null};
 const cells=[
  {q:0,r:0,reliefClass:'mountain',biome:'grassland'},
  {q:1,r:0,reliefClass:'mountain',biome:'grassland'},
  {q:2,r:0,reliefClass:'flat',biome:'grassland'}];
 const state={mountainInstances:[],natureInstances:[],hexObject:{},
  mountainShadowDefaults:{},shadowAssetPresets:{}};
 const loadCalls=[];
 const core={cells:()=>cells,baseBiomeOf:c=>c.biome,
  ensureAsset:a=>{loadCalls.push(a.path);return Promise.resolve();}};
 const context={
  core,state,N,catalog,entryFor:a=>catalog.entries[a.relPath],
  terrainRegistry:()=>terrain,random:()=>0,
  encodeInstanceShadow:()=>({}),
  mountainGeometry:()=>({width:360,aspect:1,anchorX:.5,anchorY:.67}),
  window:{VedrasMountains:mountainSandbox.window.VedrasMountains,
   VedrasShadows:{settings:config=>config}}
 };
 const generator=vm.runInNewContext(
  '(()=>{'+source.slice(begin,end)+';return autoGeoMountains;})()',context);
 const report=generator(12345,[image]);
 assert.equal(report.wanted,2);
 assert.equal(report.placed,2,'both adjacent mountain HEXes must produce a chain without PNG preload');
 assert.equal(report.noCompatible,0);
 assert.equal(report.blocked,0);
 assert.equal(report.requested,1,'only the one selected image is queued for both peaks');
 assert.deepEqual(loadCalls,['assets/nature/berg_17.png']);
 assert.deepEqual(state.mountainInstances.map(m=>m.q),[0,1]);
 assert.equal(state.mountainInstances[0].chainId,state.mountainInstances[1].chainId);
 assert.ok(state.mountainInstances.every(m=>m.source==='generated'));
 assert.equal(image.img,null,'generation must not mutate or synchronously decode source PNG');
 const repeat=generator(12345,[image]);
 assert.equal(repeat.placed,2,'repopulate must regenerate, not duplicate old peaks');
 assert.equal(state.mountainInstances.length,2);
 assert.deepEqual(loadCalls,['assets/nature/berg_17.png','assets/nature/berg_17.png'],
  'repopulate re-queues an unloaded image without duplicating peaks');
 const coldOnly={...image,relPath:'nature/berg_01.png',
  path:'assets/nature/berg_01.png',name:'berg_01.png'};
 const incompatible=generator(12345,[coldOnly]);
 assert.equal(incompatible.wanted,2);
 assert.equal(incompatible.placed,0);
 assert.equal(incompatible.noCompatible,2,
  'a cold-only mountain must not silently appear on grassland');
 assert.equal(incompatible.requested,0);
 assert.equal(state.mountainInstances.length,0,
  'old generated mountain sprites are removed on a no-match refresh');
});

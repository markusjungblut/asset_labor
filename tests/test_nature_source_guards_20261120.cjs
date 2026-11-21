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

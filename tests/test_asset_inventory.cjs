/* Regression: real artwork inventory, exact terrain families and API-only journal trees. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const window = {};
const context = vm.createContext({ window });
for (const name of ['catalog.js', 'nature_catalog.js', 'sprite-planner.js', 'existing-asset-rules.js', 'terrain-source-rules.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),context,{filename:name});
}
const C = window.VedrasCatalog;
const N = window.VedrasNatureCatalog;
const E = window.VedrasExistingAssets;
const T = window.VedrasTerrainSources;
const manifest = JSON.parse(fs.readFileSync(path.join(root,'plans/terrain_asset_plan.json'),'utf8'));
const terrainFiles = fs.readdirSync(path.join(root,'assets/terrain')).filter(x=>x.endsWith('.png')).sort();
const natureFiles = fs.readdirSync(path.join(root,'assets/nature')).filter(x=>x.endsWith('.png')).sort();
assert.equal(manifest.terrainFamilyCount,25);
assert.equal(manifest.items.length,25);
assert.equal(T.rules.length,25);
assert.equal(new Set(manifest.items.map(x=>x.sourceStem)).size,25);
assert.equal(terrainFiles.length,105);
assert.equal(natureFiles.length,148);
const assignedPaths = manifest.items.flatMap(x=>x.files);
assert.equal(assignedPaths.length,104);
assert.equal(new Set(assignedPaths).size,104);
for (const asset of assignedPaths) assert(fs.existsSync(path.join(root,asset)),asset);
assert.deepEqual(terrainFiles.filter(x=>!assignedPaths.some(p=>p.endsWith('/'+x))),['mountain_01.png']);
for(const row of manifest.items){
  const rule=T.rules.find(x=>x.sourceStem===row.sourceStem);
  assert(rule,row.sourceStem);
  assert.equal(rule.terrainTypeId,row.terrainTypeId);
  assert.equal(rule.materialClass,row.materialClass);
  for(const filename of row.files)assert.equal(T.match({category:'terrain',name:path.basename(filename)}).terrainTypeId,row.terrainTypeId);
}
const catalog=C.starter();
assert.equal(T.ensureTypes(catalog),true);
assert.equal(C.validate(catalog).length,0);
const assets=assignedPaths.map(p=>({category:'terrain',relPath:p.slice('assets/'.length),name:path.basename(p)}));
catalog.assets['terrain/grassland_01.png']={terrainTypeId:'snowfields',variantFamilyId:'manual_custom'};
const outcome=T.propose(catalog,assets,()=>true);
assert.equal(outcome.assigned,103);
assert.equal(catalog.assets['terrain/grassland_01.png'].terrainTypeId,'snowfields','manual mapping must survive');
assert.equal(Object.keys(catalog.assets).length,104);
assert.equal(C.validate(catalog).length,0);
const blocked=T.propose(C.starter(),assets,()=>false);
assert.equal(blocked.assigned,0,'unvalidated artwork must not be mapped');
assert.equal(T.match({category:'terrain',name:'mountain_01.png'}),null);
assert.equal(T.match({category:'terrain',name:'cosatal_water_01.png'}).terrainTypeId,'coastal_water');
assert.equal(T.match({category:'terrain',name:'wald_01.png'}).role,'forest_floor_overlay_not_base_biome');
assert.equal(T.match({category:'terrain',name:'stormy_ocean_051.png'}).terrainTypeId,'stormy_ocean');
const entries={};
for(const filename of natureFiles){
 const asset={category:'nature',name:filename};
 const classification=E.classify(asset);
 assert(classification,'unclassified '+filename);
 entries['nature/'+filename]=E.metadata(classification,N.template(),filename);
}
assert.equal(Object.keys(entries).length,148);
assert.equal(new Set(Object.values(entries).map(x=>x.id)).size,148);
const errors=N.validate({schemaVersion:1,revision:0,presets:{},entries},catalog);
assert.deepEqual(Array.from(errors),[],'nature metadata invalid: '+errors.join(', '));
for(let n=12;n<=19;n++){
 const filename='tree_'+n+'.png';
 const classification=E.classify({category:'nature',name:filename});
 const meta=entries['nature/'+filename];
 assert.equal(classification.apiOnly,true);
 assert.equal(meta.kind,'special');
 assert.equal(meta.family,'journal_trees');
 assert.equal(meta.placement.density,0);
 assert.equal(meta.placement.weight,0);
 assert.deepEqual(Array.from(meta.allowedTerrainCategories),[]);
 assert(meta.tags.includes('journal_api'));
}
assert.equal(E.classify({category:'nature',name:'unknown.png'}),null);
assert.equal(E.classify({category:'nature',name:'tanne_01.png'}).confirmedSpecies,false);
assert.equal(E.classify({category:'nature',name:'tanne_schnee_01.png'}).confirmedSpecies,false);
assert(entries['nature/tanne_01.png'].tags.includes('needs_species_review'));
assert(entries['nature/bush_01.png'].tags.includes('needs_species_review'));
assert.equal(entries['nature/bush_01.png'].placement.density,0);
assert(N.validPath('nature/lärche1.png'));
assert(N.validPath('nature/weißdorn1.png'));
assert(!N.validPath('nature/../secret.png'));
assert.equal(Object.values(entries).filter(e=>e.artStatus!=='candidate').length,0);
console.log('PASS inventory: 25 terrain families, 104 terrain variants, 148 nature profiles, 8 journal API trees; no existing assignments overwritten.');

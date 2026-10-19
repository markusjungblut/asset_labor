/* Regression: real artwork inventory, exact terrain families and ordinary Kapok trees. */
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
const natureManifest = JSON.parse(fs.readFileSync(path.join(root,'plans/nature_asset_inventory.json'),'utf8'));
assert.equal(natureManifest.entryCount,258);
assert.equal(natureManifest.entries.length,258);
const terrainFiles = fs.readdirSync(path.join(root,'assets/terrain')).filter(x=>x.endsWith('.png')).sort();
const natureFiles = fs.readdirSync(path.join(root,'assets/nature')).filter(x=>x.endsWith('.png')).sort();
assert.equal(manifest.terrainFamilyCount,25);
assert.equal(manifest.items.length,25);
assert.equal(T.rules.length,25);
assert.equal(new Set(manifest.items.map(x=>x.sourceStem)).size,25);
assert(terrainFiles.length>=104,'expected at least 104 terrain PNGs');
assert(natureFiles.length>=258,'existing nature assets must remain available');
const assignedPaths = manifest.items.flatMap(x=>x.files);
assert.equal(assignedPaths.length,104);
assert.equal(new Set(assignedPaths).size,104);
for (const asset of assignedPaths) assert(fs.existsSync(path.join(root,asset)),asset);
// Neue, noch unzugeordnete Terrain-Dateien dürfen zusätzlich vorhanden sein.
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
assert.equal(T.match({category:'terrain',name:'stormy_ocean_05.png'}).terrainTypeId,'stormy_ocean');
const entries={};
for(const filename of natureFiles){
 const asset={category:'nature',name:filename};
 const classification=E.classify(asset);
 if(classification)entries['nature/'+filename]=E.metadata(classification,N.template(),filename);
 // Unbekannte neue Dateinamen bleiben editierbar, erhalten aber keine erfundene Artzuordnung.
}
assert(Object.keys(entries).length>=258);
for(const row of natureManifest.entries){
 const metadata=entries[row.path.slice('assets/'.length)];
 assert(metadata,'no recorded Nature asset '+row.path);
 for(const key of ['id','family','kind','sizeClass','sizeMode','targetHeight','artStatus'])assert.equal(row[key],metadata[key],row.path+':'+key);
 assert.equal(JSON.stringify(row.allowedTerrainCategories),JSON.stringify(Array.from(metadata.allowedTerrainCategories)),row.path+':biomes');
 assert.equal(row.placement.density,metadata.placement.density,row.path+':density');
 assert.equal(row.placement.minSpacing,metadata.placement.minSpacing,row.path+':spacing');
 assert.equal(JSON.stringify(row.allowedTerrainTypes||[]),JSON.stringify(Array.from(metadata.allowedTerrainTypes)),row.path+':terrain types');
}
assert.equal(new Set(Object.values(entries).map(x=>x.id)).size,Object.keys(entries).length);
const errors=N.validate({schemaVersion:1,revision:0,presets:{},entries},catalog);
assert.deepEqual(Array.from(errors),[],'nature metadata invalid: '+errors.join(', '));
for(let n=12;n<=19;n++){
 const filename='tree_'+n+'.png';
 const classification=E.classify({category:'nature',name:filename});
 const meta=entries['nature/'+filename];
 assert.equal(classification.id,'kapok_tree_'+n);
 assert.equal(meta.kind,'tree');
 assert.equal(meta.family,'jungle_trees');
 assert(meta.tags.includes('kapok'));
 assert(!meta.tags.includes('journal_api'));
 assert(!meta.tags.includes('no_auto_spawn'));
 assert(meta.placement.density>0);
 assert(meta.placement.weight>0);
 assert.equal(JSON.stringify(Array.from(meta.allowedTerrainTypes)),JSON.stringify(['jungle']));
 assert(E.canAutoPlaceInTest({category:'nature',name:filename},meta,new Set(['jungle'])));
}
assert.equal(E.classify({category:'nature',name:'unknown.png'}),null);
assert.equal(E.classify({category:'nature',name:'tanne_01.png'}).name,'Tanne');
assert.equal(E.classify({category:'nature',name:'tanne_schnee_01.png'}).confirmedSpecies,false);
assert(entries['nature/tanne_01.png'].tags.includes('reassignable_conifer'));
assert.equal(entries['nature/bush_01.png'].sizeClass,'medium');
assert.equal(entries['nature/bush_05.png'].sizeClass,'small');
assert.equal(entries['nature/bush_09.png'].sizeClass,'large');
assert.equal(entries['nature/bush_20.png'].family,'dry_bushes');
assert.equal(entries['nature/bush_34.png'].kind,'cluster');
assert(entries['nature/bush_01.png'].placement.density>0);
assert(N.validPath('nature/lärche1.png'));
assert(N.validPath('nature/weißdorn1.png'));
assert(!N.validPath('nature/../secret.png'));
assert.equal(Object.values(entries).filter(e=>e.artStatus!=='candidate').length,0);
const terrainTypes= new Set(['grassland']);
const eligible=Object.entries(entries).filter(([rel,m])=>E.canAutoPlaceInTest({category:'nature',name:path.basename(rel)},m,
  N.effectiveTypes(m,catalog,{presets:{}}))).length;
assert(eligible>0,'candidate sprites must be eligible in the nature TEST distribution');
assert(E.canAutoPlaceInTest({category:'nature',name:'birke1.png'},entries['nature/birke1.png'],terrainTypes));
assert(E.canAutoPlaceInTest({category:'nature',name:'tree_12.png'},entries['nature/tree_12.png'],new Set(['jungle'])));
assert(E.canAutoPlaceInTest({category:'nature',name:'bush_01.png'},entries['nature/bush_01.png'],terrainTypes));
assert(!E.canAutoPlaceInTest({category:'nature',name:'birke1.png'},{...entries['nature/birke1.png'],artStatus:'deprecated'},terrainTypes));
assert.equal(E.classify({category:'nature',name:'marula-baum_01.png'}).family,'savanna_trees');
assert.equal(E.classify({category:'nature',name:'wacholder_04.png'}).family,'conifers');
for(let i=1;i<=11;i++){const filename='palme_'+String(i).padStart(2,'0')+'.png';
 const m=entries['nature/'+filename];assert.equal(m.family,'palms');assert.equal(m.sizeClass,i<=5?'medium':'large');
 assert(!m.allowedTerrainCategories.includes('water_coast'));
}
console.log('PASS inventory: 25 terrain families, 104 terrain variants, 258 nature profiles, 8 ordinary Kapok trees; no existing assignments overwritten.');

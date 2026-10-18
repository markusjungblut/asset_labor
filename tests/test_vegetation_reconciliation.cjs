/* Node regression of the user-approved Nature classifications and the cleaned production backlog. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const window={};
const ctx=vm.createContext({window});
for(const filename of ['nature_catalog.js','catalog.js','sprite-planner.js','existing-asset-rules.js']){
 vm.runInContext(fs.readFileSync(path.join(root,filename),'utf8'),ctx,{filename});
}
const E=window.VedrasExistingAssets, N=window.VedrasNatureCatalog, P=window.VedrasSpritePlanner;
const nature=JSON.parse(fs.readFileSync(path.join(root,'assets/nature/nature_catalog.json'),'utf8'));
const terrain=JSON.parse(fs.readFileSync(path.join(root,'assets/terrain/terrain_catalog.json'),'utf8'));
const plan=JSON.parse(fs.readFileSync(path.join(root,'plans/sprite_catalog_plan.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'plans/nature_asset_inventory.json'),'utf8'));
assert.equal(N.validate(nature,terrain).length,0,'real Nature catalog must validate');
assert.equal(plan.schemaVersion,2);
assert.equal(plan.items.length,11);
assert.equal(plan.resolved.length,34);
assert.equal(plan.items.filter(x=>x.priority==='optional').length,2);
assert.equal(P.entries.length,11);
assert.equal(P.resolved.length,34);
for(const id of ['clover_01','moss_01','alpine_grass_01','thyme_01','birch_01','fir_01','pine_01','palm_01','juniper_01','bush_group_01','jungle_tree_01']){
 assert(!plan.items.some(x=>x.id===id),'redundant/micro sprite incorrectly left open: '+id);
}
for(const id of ['fern_01','cactus_01','mangrove_01']){
 assert(plan.items.some(x=>x.id===id),'needed sprite excluded: '+id);
}
assert.equal(P.match({name:'thymian_01.png'}),null,'Thyme is in actual inventory, not backlog');
assert.equal(P.match({name:'schilf1.png'}),null,'Schilf ist bereits vorhanden');
assert.equal(P.match({name:'farn1.png'}).id,'fern_01');
assert.equal(P.match({name:'kaktus_01.png'}).id,'cactus_01');
const size=n=>n<=4?'medium':n<=6?'small':n<=10?'large':n<=14?'medium':n===15?'small':n===16?'medium':n<=19?'large':n<=24?'medium':n<=29?'small':n<=33?'medium':'medium';
for(let n=1;n<=41;n++){
 const name='bush_'+String(n).padStart(2,'0')+'.png';
 const rel='nature/'+name,meta=nature.entries[rel],classification=E.classify({category:'nature',name});
 assert(meta,'missing '+rel);
 assert(classification,'unclassified '+rel);
 assert.equal(meta.kind,n>=34?'cluster':'shrub',name);
 assert.equal(meta.sizeClass,size(n),name);
 assert.equal(meta.family,n>=20&&n<=29?'dry_bushes':'temperate_bushes',name);
 assert(meta.placement.density>0,name);
 assert.equal(meta.kind,classification.kind,name);
 assert.equal(meta.family,classification.family,name);
 assert.equal(meta.sizeClass,classification.sizeClass,name);
 if(n>=20&&n<=29)assert(meta.tags.includes('size_provisional'),name);
 if(n>=34)assert(meta.tags.includes('bush_group'),name);
}
for(let n=1;n<=10;n++){
 const rel='nature/tanne_schnee_'+String(n).padStart(2,'0')+'.png',m=nature.entries[rel];
 assert(m,rel);assert.equal(m.family,'snow_conifers');
 assert(m.tags.includes(n<=5?'snow_pine':'snow_fir'));
 assert.equal(m.kind,'tree');
}
for(let n=1;n<=11;n++){
 const rel='nature/tanne_'+String(n).padStart(2,'0')+'.png',m=nature.entries[rel];
 assert(m&&m.tags.includes('reassignable_conifer'),rel);
}
for(let n=12;n<=19;n++){
 const rel='nature/tree_'+n+'.png',m=nature.entries[rel];
 assert(m,rel);assert.equal(m.id,'kapok_tree_'+n);
 assert.equal(m.kind,'tree');assert.equal(m.family,'jungle_trees');
 assert(m.tags.includes('kapok'));assert(!m.tags.includes('journal_api'));
 assert(m.placement.density>0);assert(m.placement.weight>0);
 assert.equal(JSON.stringify(m.allowedTerrainTypes),JSON.stringify(['jungle']));
 assert(E.canAutoPlaceInTest({category:'nature',name:'tree_'+n+'.png'},m,new Set(['jungle'])));
}
for(const row of manifest.entries){
 const m=nature.entries[row.path.slice('assets/'.length)];
 assert(m,row.path);
 assert.equal(m.family,row.family,row.path);
 assert.equal(m.kind,row.kind,row.path);
 assert.equal(m.sizeClass,row.sizeClass,row.path);
}
console.log('PASS: 41 shrubs, 10 snowy conifers, 11 firs, 8 ordinary Kapok jungle trees, 11 outstanding sprite needs, 34 resolved tasks.');

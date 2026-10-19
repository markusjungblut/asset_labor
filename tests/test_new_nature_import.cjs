/* New Nature PNG import, exact metadata matching, and historical protections. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),window={};const ctx=vm.createContext({window});
for(const file of ['catalog.js','nature_catalog.js','sprite-planner.js','existing-asset-rules.js','flora-plan.js'])
 vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const N=window.VedrasNatureCatalog,E=window.VedrasExistingAssets;
const nature=JSON.parse(fs.readFileSync(path.join(root,'assets/nature/nature_catalog.json'),'utf8'));
const terrain=JSON.parse(fs.readFileSync(path.join(root,'assets/terrain/terrain_catalog.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(root,'plans/nature_asset_inventory.json'),'utf8'));
const plan=JSON.parse(fs.readFileSync(path.join(root,'plans/sprite_catalog_plan.json'),'utf8'));
const registry=JSON.parse(fs.readFileSync(path.join(root,'plans/flora_v2_registry.json'),'utf8'));
const images=fs.readdirSync(path.join(root,'assets/nature')).filter(n=>n.endsWith('.png'));
assert.equal(images.length,258);
assert.equal(Object.keys(nature.entries).length,258);
assert.equal(manifest.entryCount,258);assert.equal(manifest.entries.length,258);
assert.deepEqual(Array.from(N.validate(nature,terrain)),[]);
assert.equal(plan.items.length,4);assert.equal(plan.resolved.length,41);
assert.equal(registry.species.length,109);
const aliases=registry.species.flatMap(s=>s.aliases);
assert.equal(aliases.length,258);assert.equal(new Set(aliases).size,258);
assert.deepEqual(aliases.slice().sort(),images.slice().sort(),'every real PNG in flora lookup');
const specs=[
 ['Baumstumpf_',16,'deadwood','special'],
 ['Erle',4,'riparian_trees','tree'],
 ['Weide',4,'riparian_trees','tree'],
 ['Marula',3,'savanna_trees','tree'],
 ['Tundra_Zwergstrauch',4,'cold_bushes','shrub'],
 ['schilf',4,'reeds','cluster'],
 ['sukkulent',3,'succulents','ground_cover'],
 ['wacholder_',3,'conifers','shrub']
];
let total=0;
for(const [prefix,count,family,kind] of specs){
 const found=images.filter(n=>n.toLowerCase().startsWith(prefix.toLowerCase())).filter(n=>prefix!=='wacholder_'||Number(n.match(/(\d+)/)?.[1])>=4);
 assert.equal(found.length,count,prefix);
 for(const name of found){
  const meta=nature.entries['nature/'+name];
  assert(meta,'no metadata for '+name);
  assert.equal(meta.family,family,name);
  assert.equal(meta.kind,kind,name);
  assert.equal(meta.artStatus,'candidate',name);
  assert(meta.placement.density>0,name);
  assert(E.classify({category:'nature',name}),name);
  assert(N.effectiveTypes(meta,terrain,nature).size>0,name);
  assert(manifest.entries.find(e=>e.path==='assets/nature/'+name),name);
 }
 total+=count;
}
assert.equal(total,41);
for(const name of ['Marula2.png','Tundra_Zwergstrauch4.png']){
 assert(images.includes(name));assert(N.validPath('nature/'+name));
}
assert(!images.some(n=>n.includes('..png')));
for(const id of ['reeds_01','succulent_01','bush_tundra_01','willow_01','alder_01','tree_stump_01']){
 assert(plan.resolved.some(e=>e.id===id));assert(!plan.items.some(e=>e.id===id));
}
for(let i=12;i<=19;i++){const m=nature.entries['nature/tree_'+i+'.png'];assert.equal(m.id,'kapok_tree_'+i);assert.equal(m.kind,'tree');}
// Confirm the exact 77 uploaded files are registered, classified and seasonally valid.
for(const [prefix,a,b,family] of [
 ['bush_jungle_',1,5,'tropical_bushes'],['cactus_',1,10,'cacti'],
 ['dead_tree_',1,10,'dead_trees'],['dead_tree_',11,15,'snow_dead_trees'],
 ['fallen_log_',1,10,'fallen_logs'],['fallen_log_',11,20,'snow_fallen_logs'],['fallen_log_',21,24,'fallen_logs'],
 ['fern_',1,10,'ferns'],['mangrove_',1,5,'mangroves'],['Baumstumpf_',9,16,'deadwood']
]){
 for(let number=a;number<=b;number++){
  const filename=prefix+String(number).padStart(2,'0')+'.png';
  const meta=nature.entries['nature/'+filename];
  assert(images.includes(filename),'missing PNG '+filename);
  assert(meta&&meta.family===family,'incorrect seasonal classification '+filename);
  assert.equal(E.classify({category:'nature',name:filename}).family,family,filename);
  assert(manifest.entries.some(x=>x.path==='assets/nature/'+filename),'inventory missing '+filename);
  assert(N.effectiveTypes(meta,terrain,nature).size>0,'unplaceable '+filename);
  for(const type of N.effectiveTypes(meta,terrain,nature)){
   if(family.startsWith('snow_'))assert(['snowfields','frozen_tundra','tundra','highland'].includes(type),'snow sprite on '+type);
  }
 }
}
assert(registry.species.some(s=>s.family==='snow_fallen_logs'&&s.aliases.length===10));
for(let i=1;i<=4;i++)assert.equal(terrain.assets['terrain/frozen_tundra_base_0'+i+'.png']?.terrainTypeId,'frozen_tundra');
console.log('PASS: 41 reconciled historic PNGs, 77 recent uploads, 258 catalogued, 4 geological tasks outstanding, 109 flora groups, 8 Kapok trees preserved.');

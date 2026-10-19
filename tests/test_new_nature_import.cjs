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
assert.equal(images.length,181);
assert.equal(Object.keys(nature.entries).length,181);
assert.equal(manifest.entryCount,181);assert.equal(manifest.entries.length,181);
assert.deepEqual(Array.from(N.validate(nature,terrain)),[]);
assert.equal(plan.items.length,4);assert.equal(plan.resolved.length,41);
assert.equal(registry.species.length,106);
const aliases=registry.species.flatMap(s=>s.aliases);
assert.equal(aliases.length,181);assert.equal(new Set(aliases).size,181);
assert.deepEqual(aliases.slice().sort(),images.slice().sort(),'every real PNG in flora lookup');
const specs=[
 ['Baumstumpf_',8,'deadwood','special'],
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
assert.equal(total,33);
for(const name of ['Marula2.png','Tundra_Zwergstrauch4.png']){
 assert(images.includes(name));assert(N.validPath('nature/'+name));
}
assert(!images.some(n=>n.includes('..png')));
for(const id of ['reeds_01','succulent_01','bush_tundra_01','willow_01','alder_01','tree_stump_01']){
 assert(plan.resolved.some(e=>e.id===id));assert(!plan.items.some(e=>e.id===id));
}
for(let i=12;i<=19;i++){const m=nature.entries['nature/tree_'+i+'.png'];assert.equal(m.id,'kapok_tree_'+i);assert.equal(m.kind,'tree');}
console.log('PASS: 33 new PNGs classified, 181 catalogued, 4 geological tasks outstanding, 106 flora groups, 8 Kapok trees preserved.');

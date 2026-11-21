'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const sandbox={window:{}};
for(const name of ['nature_catalog.js','existing-asset-rules.js'])
 vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),sandbox,{filename:name});
const N=sandbox.window.VedrasNatureCatalog;
const nature=JSON.parse(fs.readFileSync(path.join(root,'assets/nature/nature_catalog.json'),'utf8'));
const terrain=JSON.parse(fs.readFileSync(path.join(root,'assets/terrain/terrain_catalog.json'),'utf8'));
const src=fs.readFileSync(path.join(root,'nature-ui.js'),'utf8');
const start=src.indexOf(' const entryFor=a=>{'),end=src.indexOf(' function status()',start);
assert(start>0&&end>start,'must test actual runtime metadata gate, not a reimplementation');
function run(filename,tampered){
 const relPath='nature/'+filename;
 const catalog={entries:{[relPath]:tampered}};
 const entryFor=vm.runInNewContext(src.slice(start,end)+'\nentryFor;',
  {catalog,window:sandbox.window});
 return entryFor({relPath,name:filename,category:'nature',path:'assets/'+relPath});
}
const allowed=(meta,base)=>N.canPlace(meta,
 {baseBiome:base,biome:base,forestClass:'none',neighborTypes:[]},terrain,nature);
test('real cactus PNG protects grassland even if local catalog family and source are corrupt',()=>{
 const original={...nature.entries['nature/cactus_01.png'],
  id:'custom_shrub',family:'dry_bushes',sourceReference:'Legacy import: unknown',
  allowedTerrainCategories:['grass_pasture','arid_regions'],
  allowedTerrainTypes:['grassland','savanna']};
 const effective=run('cactus_01.png',original);
 assert.equal(effective.sourceReference,'Bestandsdatei: cactus_01.png');
 assert.equal(original.sourceReference,'Legacy import: unknown',
  'do not mutate saved Nature catalog');
 assert.equal(allowed(effective,'grassland'),false);
 assert.equal(allowed(effective,'savanna'),true);
});
test('real warm boulder PNG protects grassland with wrong family/id',()=>{
 const original={...nature.entries['nature/boulder_45.png'],
  id:'unknown_stone',family:'stones',sourceReference:'',
  allowedTerrainCategories:['grass_pasture','warm_regions'],
  allowedTerrainTypes:['grassland','savanna']};
 const effective=run('boulder_45.png',original);
 assert.equal(allowed(effective,'grassland'),false);
 assert.equal(allowed(effective,'savanna'),true);
 assert.equal(original.sourceReference,'');
});
test('normal temperate boulder and ordinary plants retain editable metadata',()=>{
 const a={...nature.entries['nature/boulder_01.png'],sourceReference:'User edit'};
 assert.equal(run('boulder_01.png',a),a,'do not relabel an ordinary rock');
 const b={...nature.entries['nature/ahorn1.png'],sourceReference:'User edit'};
 assert.equal(run('ahorn1.png',b),b,'do not change ordinary tree records');
});

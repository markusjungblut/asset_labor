/* Cold-only nature habitat regression.
 * Run: node tests/test_cold_habitat_boulders_bushes_20261020.cjs
 * The four established cold terrains: snowfields, frozen_tundra, tundra,
 * highland. All other terrains must reject boulder_21..30 & snowy_bush.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..');
const w={};
for(const file of ['nature_catalog.js','existing-asset-rules.js'])
 new Function('window',fs.readFileSync(path.join(base,file),'utf8'))(w);
const N=w.VedrasNatureCatalog,E=w.VedrasExistingAssets;
const terrain=JSON.parse(fs.readFileSync(path.join(base,'assets/terrain/terrain_catalog.json'),'utf8'));
const catalog=JSON.parse(fs.readFileSync(path.join(base,'assets/nature/nature_catalog.json'),'utf8'));
const cold=['snowfields','frozen_tundra','tundra','highland'];
const notCold=['grassland','pasture','sparse_pasture','jungle','savanna',
 'moor','marshland','swamp','rocky_desert','sandy_rocky_desert',
 'badlands','wasteland','semi_desert'];
const context=(baseBiome,biome=baseBiome)=>({baseBiome,biome,forestClass:'none',neighborTypes:[]});
const allowed=(meta,biome)=>N.canPlace(meta,context(biome),terrain,catalog);
for(let number=21;number<=30;number++){
 const filename='boulder_'+number+'.png';
 const info=E.classify({category:'nature',name:filename});
 assert(info&&info.group==='winter_boulder','winter classification: '+filename);
 const meta=catalog.entries['nature/'+filename]||E.metadata(info,N.template(),filename);
 assert.equal(meta.family,'stones');
 for(const biome of cold)
  assert(allowed(meta,biome),filename+' must be permitted on '+biome);
 for(const biome of notCold)
  assert(!allowed(meta,biome),filename+' must be excluded from '+biome);
 assert(N.canPlace(meta,context('highland','forest_floor'),terrain,catalog),
  'winter boulder must use the cold base biome under forest-floor overlay');
}
for(const number of [21,22,23,24,25]){
 const meta=catalog.entries['nature/boulder_'+number+'.png'];
 assert.deepEqual(meta.allowedTerrainCategories,[],
  'existing winter boulder catalog must not show other terrain categories');
 assert.deepEqual([...meta.allowedTerrainTypes].sort(),[...cold].sort());
}
for(const name of ['snowy_bush.png','snowy_bush_01.png','snowy_bush02.png',
 'snowy-bush-13.png']){
 const info=E.classify({category:'nature',name});
 assert(info&&info.family==='snow_bushes'&&info.kind==='shrub',
  'snowy bush must be recognized on import: '+name);
 const meta=E.metadata(info,N.template(),name);
 assert(meta.placement.density>0,'snowy bushes can spawn during Nature verteilen');
 assert.deepEqual(meta.allowedTerrainCategories,[]);
 assert.deepEqual([...meta.allowedTerrainTypes].sort(),[...cold].sort());
 for(const biome of cold)
  assert(allowed(meta,biome),'snowy bush allowed on '+biome);
 for(const biome of notCold)
  assert(!allowed(meta,biome),'snowy bush prohibited on '+biome);
 assert(N.canPlace(meta,context('tundra','forest_floor'),terrain,catalog));
}
// Explicit catalog overrides must never circumvent hard ecology.
const broad=E.metadata(E.classify({category:'nature',name:'boulder_27.png'}),
 N.template(),'boulder_27.png');
broad.allowedTerrainCategories=['warm_regions','arid_regions','grass_pasture'];
broad.allowedTerrainTypes=['grassland','jungle','savanna','snowfields'];
assert(!allowed(broad,'grassland'));
assert(!allowed(broad,'jungle'));
assert(allowed(broad,'snowfields'));
const broadBush=E.metadata(E.classify({category:'nature',name:'snowy_bush.png'}),
 N.template(),'snowy_bush.png');
broadBush.allowedTerrainCategories=['grass_pasture','warm_regions'];
assert(!allowed(broadBush,'grassland'));
assert(allowed(broadBush,'tundra'));
// Original stones remain unchanged, including their snowfield exclusion.
for(const number of [1,20,31]){
 const filename='boulder_'+String(number).padStart(2,'0')+'.png';
 const info=E.classify({category:'nature',name:filename});
 assert(info&&info.group==='boulder');
 const meta=catalog.entries['nature/'+filename]||E.metadata(info,N.template(),filename);
 assert(allowed(meta,'grassland'),'ordinary boulder remains usable on grassland');
 for(const biome of ['snowfields','frozen_tundra'])
  assert(!allowed(meta,biome),'ordinary boulder still excluded from '+biome);
}
console.log('PASS cold-only boulder_21–30 and snowy_bush; legacy boulders unchanged; existing catalog correct.');

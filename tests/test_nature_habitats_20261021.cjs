/* New habitat series regression.
 * Run: node tests/test_nature_habitats_20261021.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'..'),get=p=>fs.readFileSync(path.join(dir,p),'utf8');
const window={};
new Function('window',get('nature_catalog.js'))(window);
new Function('window',get('existing-asset-rules.js'))(window);
const N=window.VedrasNatureCatalog,E=window.VedrasExistingAssets;
const terrain=JSON.parse(get('assets/terrain/terrain_catalog.json'));
const nature=JSON.parse(get('assets/nature/nature_catalog.json'));
const cold=['snowfields','frozen_tundra','tundra','highland'];
const moderate=['grassland','pasture','sparse_pasture','moor','marshland','swamp'];
const hot=['savanna','jungle','rocky_desert','sandy_desert','clay_desert',
 'badlands','wasteland','semi_desert','sandy_rocky_desert',
 'sandy_badlands','rocky_badlands','desert'];
const all=terrain.terrainTypes.filter(t=>t.materialClass==='ground').map(t=>t.id);
const make=filename=>{
 const info=E.classify({name:filename,category:'nature'});
 assert(info,'unrecognized uploaded name '+filename);
 return nature.entries['nature/'+filename]||E.metadata(info,N.template(),filename);
};
const eligible=(m,id)=>{
 if(m.kind==='mountain')return N.mountainAllowed(m,id,terrain,nature);
 return N.canPlace(m,{baseBiome:id,biome:id,forestClass:'none',neighborTypes:[]},
  terrain,nature);
};
function exact(filename,expected){
 const m=make(filename),allowed=[...expected].sort(),actual=all.filter(id=>eligible(m,id)).sort();
 assert.deepEqual(actual,allowed,filename+' has wrong habitats');
 const tooBroad={...m,allowedTerrainTypes:[...all],
  allowedTerrainCategories:terrain.categories.map(c=>c.id),excludedTerrainTypes:[]};
 for(const type of all)assert.equal(eligible(tooBroad,type),expected.includes(type),
  'hard habitat cannot be overridden for '+filename+' at '+type);
 const overlay='forest_floor';
 if(m.kind!=='mountain'&&eligible(m,expected[0]))
  assert(N.canPlace(m,{baseBiome:expected[0],biome:overlay,
   forestClass:'dense_forest',neighborTypes:[]},terrain,nature),
   'a forest-floor overlay must preserve '+filename+' base habitat');
}
const n2=n=>String(n).padStart(2,'0');
// Tree stumps 16–20: no cold climate and no unrequested deserts
for(let n=16;n<=20;n++)
 exact('Baumstumpf_'+n2(n)+'.png',
  [...moderate,'savanna','jungle']);
// Mountain 14–16: snowfields ONLY. 17–21: moderate land/wetlands ONLY.
for(let n=14;n<=16;n++)exact('berg_'+n2(n)+'.png',['snowfields']);
for(let n=17;n<=21;n++)exact('berg_'+n2(n)+'.png',moderate);
// Boulder 21–35 cold; 36–44 warm/arid; older 1–20 untouched.
for(let n=21;n<=35;n++)exact('boulder_'+n2(n)+'.png',cold);
for(let n=36;n<=44;n++)exact('boulder_'+n2(n)+'.png',hot);
// Five newly supplied ice blocks accept both German/English file naming.
for(let n=1;n<=5;n++){
 exact('Eisblock_'+n2(n)+'.png',['snowfields','frozen_tundra','tundra']);
 exact('ice_block_'+n2(n)+'.png',['snowfields','frozen_tundra','tundra']);
}
const recorded=nature.entries['nature/Baumstumpf_16.png'];
assert(recorded,'existing stump 16 retained rather than overwritten');
assert.deepEqual(recorded.allowedTerrainCategories,
 ['grass_pasture','warm_regions','wetlands']);
assert(recorded.excludedTerrainTypes.includes('highland'));
assert(recorded.excludedTerrainTypes.includes('tundra'));
// Do not affect other asset series or restore deleted files.
const old=make('boulder_01.png');
assert(eligible(old,'grassland'));
assert(!eligible(old,'snowfields'));
const oldMountain=make('berg_01.png');
assert(eligible(oldMountain,'snowfields'),'existing cold mountain rules survive');
const ui=get('nature-ui.js');
assert(ui.includes("if(existing?.group==='ice_block')"),
 'explicit iceblock metadata must override older broad sprite-plan information');
assert(ui.includes("const proposed=existing?.group==='ice_block'?"),
 'batch-import path must also prioritize no-highland ice rules');
assert(ui.includes('N.mountainAllowed(entryFor(a),terrain,terrainRegistry(),catalog)'),
 'automatic mountain spawning must honor terrain');
assert(ui.includes('if(!startCell||!N.mountainAllowed'),
 'manual mountain placement must honor terrain');
assert(ui.includes('target=>N.mountainAllowed(meta,core.baseBiomeOf(target)'),
 'mountain footprint must honor terrain');
console.log('PASS numbered stump, mountain, boulder and ice-block climates (including manual/autospawn mountain gating).');

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
// Boulder 21–35 cold; 36–54 warm/arid (including future imports); older 1–20 untouched.
for(let n=21;n<=35;n++)exact('boulder_'+n2(n)+'.png',cold);
for(let n=36;n<=54;n++){
  const filename='boulder_'+n2(n)+'.png';
  assert(fs.existsSync(path.join(dir,'assets/nature',filename)),
   'uploaded warm boulder PNG missing from active branch: '+filename);
  assert(nature.entries['nature/'+filename],
   'uploaded warm boulder not registered in Nature catalog: '+filename);
  assert.equal(E.classify({category:'nature',name:filename}).group,'warm_boulder');
  exact(filename,hot);
}
// Warm boulder spawning and rendered scale share the same explicit 36–54 class.
const balanceWin={};new Function('window',get('nature-balance.js'))(balanceWin);
const B=balanceWin.VedrasNatureBalance;
const warmMeta=make('boulder_45.png'),normalMeta=make('boulder_20.png'),
 coldMeta=make('boulder_35.png');
assert.equal(B.isWarmBoulder(warmMeta),true);
assert.equal(B.isWarmBoulder(coldMeta),false);
assert.equal(B.isWarmBoulder(normalMeta),false);
assert.equal(B.sizeFactor(warmMeta),B.sizeFactor(normalMeta)*1.28,
 'warm boulders should render 28% larger than ordinary stones');
assert.equal(B.placementScale(warmMeta),B.sizeFactor(warmMeta),
 'warm boulder collisions must scale with visual size');
assert.equal(B.sizeFactor(coldMeta),B.sizeFactor(normalMeta),
 'winter and ordinary boulder sizes must remain unchanged');
const savannaPool=Array.from({length:54},(_,i)=>({meta:make('boulder_'+n2(i+1)+'.png')}))
 .filter(a=>eligible(a.meta,'savanna'));
const warmDraw=B.warmBoulderPool(savannaPool,a=>a.meta,.1);
assert.equal(warmDraw.pool.length,19,'all warm boulder variants prioritized');
assert(warmDraw.pool.every(a=>B.isWarmBoulder(a.meta)));
assert(warmDraw.chance>=.30,'warm spawn chance must be above previous 13.8%');
const fallbackDraw=B.warmBoulderPool(savannaPool,a=>a.meta,.99);
assert.equal(fallbackDraw.pool.length,savannaPool.length,
 'ordinary rocks remain possible in warm regions');
const tundraPool=Array.from({length:54},(_,i)=>({meta:make('boulder_'+n2(i+1)+'.png')}))
 .filter(a=>eligible(a.meta,'tundra'));
const winterDraw=B.warmBoulderPool(tundraPool,a=>a.meta,.1);
assert.equal(winterDraw.warmCount,0,'warm boulders never spawn in tundra');
assert(Math.abs(winterDraw.chance-.138)<1e-10,'winter boulder chance unchanged');

// All ten arid biomes now support *occasional* palms and Schirmakazien.
const desertBiomes=["rocky_desert","sandy_desert","clay_desert","badlands","wasteland","semi_desert","sandy_rocky_desert","sandy_badlands","rocky_badlands","desert"];
assert.deepEqual([...N.DESERT_BIOMES],desertBiomes);
const palms=Object.entries(nature.entries).filter(([name,m])=>m.family==='palms');
const acacias=Object.entries(nature.entries).filter(([name,m])=>N.isAcacia(m));
assert.equal(palms.length,11);assert.equal(acacias.length,3);
for(const [name,m] of [...palms,...acacias]){
 assert(m.placement.density>0,name+' must remain spawnable');
 for(const biome of desertBiomes)assert(eligible(m,biome),name+' missing desert '+biome);
 for(const biome of ['grassland','pasture','moor','swamp','highland','tundra','snowfields'])
  assert(!eligible(m,biome),name+' escaped into '+biome);
 assert(eligible(m,'savanna'),name+' must remain in savanna');
}
for(const [name,m] of palms)assert(eligible(m,'jungle'),name+' must remain in jungle');
for(const [name,m] of acacias)assert(!eligible(m,'jungle'),name+' is not a jungle tree');
for(const filename of ['affenbrotbaum1.png','Marula1.png']){
 const m=nature.entries['nature/'+filename];
 assert(!eligible(m,'sandy_desert'),filename+' must retain limited habitat');
 assert(eligible(m,'semi_desert'),filename+' retains original semi-desert habitat');
}
for(const name of ['palme_01.png','schirmakazie1.png']){
 const info=E.classify({category:'nature',name});
 const future=E.metadata(info,N.template(),name);
 for(const biome of desertBiomes)
  assert(N.canPlace(future,{baseBiome:biome,biome,forestClass:'none'},terrain,nature),
   name+' import must support '+biome);
}

// Fifteen real dry_patch ground sprites must all be registered, eligible
// in approved dry/open habitats, and impossible to force onto wet/cold tiles.
const dryPatchNames=Array.from({length:15},(_,i)=>'dry_patch_'+n2(i+1)+'.png');
const expectedDry=[...N.DRY_PATCH_BIOMES].sort();
for(const filename of dryPatchNames){
 assert(fs.existsSync(path.join(dir,'assets/nature',filename)),filename+' PNG missing');
 const meta=nature.entries['nature/'+filename];
 assert(meta,'Nature metadata missing for '+filename);
 assert.equal(meta.family,'dry_patches');
 assert.equal(meta.kind,'ground_cover');
 assert.equal(meta.shadow.mode,'none');
 assert(N.isDryPatch(meta));
 assert(meta.placement.density>0);
 assert.deepEqual(all.filter(type=>eligible(meta,type)).sort(),expectedDry,filename+' habitats');
 const widened={...meta,allowedTerrainCategories:terrain.categories.map(c=>c.id),
  allowedTerrainTypes:all,excludedTerrainTypes:[]};
 for(const type of all)assert.equal(eligible(widened,type),expectedDry.includes(type),
  filename+' hard habitat gate '+type);
 const future=E.metadata(E.classify({name:filename,category:'nature'}),N.template(),filename);
 assert(N.effectiveTypes(future,terrain,nature).size>0);
 assert.deepEqual(all.filter(type=>eligible(future,type)).sort(),expectedDry,
  filename+' future-import habitats');
}
const dryChances={sparse_pasture:.32,pasture:.06,grassland:.04,
 sandy_desert:.07,savanna:.32,dry_ground:.07};
for(const [type,chance] of Object.entries(dryChances))assert.equal(N.dryPatchChance(type),chance);
for(const type of ['jungle','highland','tundra','snowfields','moor','swamp','marshland','ocean'])
 assert.equal(N.dryPatchChance(type),0,'No dry patch chance on '+type);
const dryUI=get('nature-ui.js');
assert(dryUI.includes('N.dryPatchChance(core.baseBiomeOf(c))'),
 'Dry patch frequency must use the real base terrain');
assert(dryUI.includes('dryPatches.length&&count<objectCap&&random(seed,c.q,c.r,1831)<dryChance'),
 'Dry patch spawn must be seeded per hex, not per image');
assert(dryUI.includes('!N.isDryPatch(entryFor(a))'),
 'Dry patches excluded from generic per-image loop');
assert(dryUI.includes('newDryPatches'),'Generated dry patches counted');
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
assert(ui.includes("desertTrees.length&&count<objectCap&&random(seed,c.q,c.r,1751)<.065"),
 'rare desert placement must not require a forest tree quota');
assert(ui.includes("const familyPools=random(seed,c.q,c.r,1752)<.5"),
 'palms and Schirmakazien should each have a seeded spawn opportunity');
assert(ui.includes('newDesertPalms')&&ui.includes('newDesertAcacias'),
 'UI must count generated desert trees');
assert(ui.includes("if(existing?.group==='ice_block')"),
 'explicit iceblock metadata must override older broad sprite-plan information');
assert(ui.includes("const proposed=existing?.group==='ice_block'?"),
 'batch-import path must also prioritize no-highland ice rules');
assert(ui.includes('B.warmBoulderPool(boulders,entryFor,'),'warm rocks selected ahead of all-region rocks');
assert(ui.includes('eligibleWarmSites.length>=3'),'warm rock fallback on larger suitable maps');
assert(ui.includes('newWarmBoulders'),'warm rock spawn count must be surfaced');
assert(ui.includes('N.mountainAllowed(entryFor(a),terrain,terrainRegistry(),catalog)'),
 'automatic mountain spawning must honor terrain');
assert(ui.includes('if(!startCell||!N.mountainAllowed'),
 'manual mountain placement must honor terrain');
assert(ui.includes('target=>N.mountainAllowed(meta,core.baseBiomeOf(target)'),
 'mountain footprint must honor terrain');
console.log('PASS numbered stump, mountain, boulder and ice-block climates (including manual/autospawn mountain gating).');

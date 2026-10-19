/* Block 1: base biome is authoritative; woodland artwork is an overlay. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),context=vm.createContext({window:{}});
for(const file of ['forest.js','nature_catalog.js','existing-asset-rules.js','catalog.js']){
 vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
}
const {VedrasForest:F,VedrasNatureCatalog:N,VedrasExistingAssets:E,VedrasCatalog:C}=context.window;
const terrain=JSON.parse(fs.readFileSync(path.join(root,'assets/terrain/terrain_catalog.json'),'utf8'));
const nature=JSON.parse(fs.readFileSync(path.join(root,'assets/nature/nature_catalog.json'),'utf8'));
const palm=nature.entries['nature/palme_01.png'],fern=nature.entries['nature/fern_01.png'];
const cactus=nature.entries['nature/cactus_01.png'],mangrove=nature.entries['nature/mangrove_01.png'];
const snowTree=nature.entries['nature/dead_tree_11.png'];
const snowLog=nature.entries['nature/fallen_log_11.png'];
const {canPlace}=N;
const eligible=(meta,base,biome=base,forestClass='none',neighbors=[])=>canPlace(meta,{
 baseBiome:base,biome,forestClass,neighborTypes:neighbors
},terrain,nature);
assert.equal(N.validate(nature,terrain).length,0,'real Nature catalog remains valid');
assert.equal(terrain.terrainTypes.find(x=>x.id==='forest_floor').categoryId,'forest_regions');
assert.equal(terrain.terrainTypes.find(x=>x.id==='forest_floor').name,'Waldboden (Wald-Overlay)');
assert.equal(C.starter().terrainTypes.find(x=>x.id==='forest_floor').categoryId,'forest_regions');
assert(F.jungleAllowed('savanna'));assert(F.jungleAllowed('jungle'));
for(const base of ['moor','swamp','marshland','grassland','highland','tundra','snowfields','ocean']){
 assert(!F.jungleAllowed(base),'jungle must not override '+base);
 assert(!eligible(palm,base,base,'dense_forest'),'palm in '+base);
 assert(!eligible(palm,base,'jungle','dense_forest'),'invalid jungle flag must not authorize palm on '+base);
}
assert(eligible(palm,'savanna'),'palms remain valid in savanna');
assert(eligible(palm,'jungle'),'palms remain valid in proper jungle');
assert(eligible(palm,'savanna','jungle','dense_forest'),'warm savanna jungle overlay may have palms');
assert(eligible(fern,'moor','moor','dense_forest'),'ferns can grow in moor woodland');
assert(eligible(fern,'grassland','grassland','dense_forest'),'forest ground-cover on base grassland');
assert(!eligible(cactus,'savanna','savanna','dense_forest'),'cactus must not grow beneath dense woodland');
assert(eligible(cactus,'savanna','savanna','none'),'cactus may grow in suitable open warm area');
assert(eligible(mangrove,'swamp','swamp','dense_forest',['ocean']),'root on swamp land near water');
assert(!eligible(mangrove,'highland','highland','dense_forest',['ocean']),'no mountain mangroves');
assert(!eligible(mangrove,'ocean','ocean','none',['swamp']),'no ocean-anchored mangroves');
assert(eligible(snowTree,'tundra'));assert(eligible(snowLog,'highland'));
assert(!eligible(snowTree,'savanna'));assert(!eligible(snowLog,'moor'));
assert.equal(E.classify({category:'nature',name:'fallen_log_11.png'}).family,'snow_fallen_logs');
const cells=[{q:0,r:0,baseBiome:'moor',biome:'forest'},
 {q:1,r:0,baseBiome:'savanna',biome:'plains'},
 {q:2,r:0,baseBiome:'ocean',biome:'plains'}];
const forest=F.generate(cells,terrain,{jungleHexes:{'0,0':true,'1,0':true,'2,0':true},
 overrides:{'0,0':'dense_forest'},coverage:.15},c=>c.baseBiome,c=>c.baseBiome);
assert.equal(forest[0].baseBiome,'moor');
assert.equal(forest[0].biome,'moor','moor stays moor under forest');
assert.equal(forest[0].forestClass,'dense_forest','moor may have forest');
assert.equal(forest[0].jungle,false);
assert.equal(forest[1].biome,'jungle');
assert.equal(forest[1].jungle,true);
assert.equal(forest[2].jungle,false);assert.equal(forest[2].forestClass,'none');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const editor=fs.readFileSync(path.join(root,'nature-ui.js'),'utf8');
const controls=fs.readFileSync(path.join(root,'forest-ui.js'),'utf8');
for(const req of ['function baseBiomeOf(c)','function typeOfCell(c)','function drawForestFloor()',
 'drawForestFloor();','baseBiomeByHex:','forestByHex:Object.fromEntries','baseBiomeOf,typeOfAsset']){
 assert(app.includes(req),'missing base/overlay integration: '+req);
}
assert(app.indexOf('drawForestFloor();')<app.indexOf('drawShorelines();'),'forest flooring before coast water overlays');
assert(controls.includes('if(!F.jungleAllowed(base))continue'),'jungle button must reject moor');
for(const required of ['N.canPlace(meta,','function cleanup()','vedras:forest-changed',
 "source:'manual'","n.source==='manual'"]){
 assert(editor.includes(required),'missing context/cleanup/retention: '+required);
}
console.log('PASS: ground biome preserved, moor forests tropical-free, mangrove/water checks, manual and generated gating, forest-floor overlay.');

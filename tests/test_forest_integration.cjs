/* Integration regression for actual Vedras Nature entries and forest/jungle semantics. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),window={};const context=vm.createContext({window});
for(const filename of ['nature_catalog.js','existing-asset-rules.js','forest.js']){
 vm.runInContext(fs.readFileSync(path.join(root,filename),'utf8'),context,{filename});
}
const N=window.VedrasNatureCatalog,E=window.VedrasExistingAssets,F=window.VedrasForest;
const terrain=JSON.parse(fs.readFileSync(path.join(root,'assets/terrain/terrain_catalog.json'),'utf8'));
const nature=JSON.parse(fs.readFileSync(path.join(root,'assets/nature/nature_catalog.json'),'utf8'));
const resources=Object.entries(nature.entries).map(([name,meta])=>({name,meta,asset:{name:path.basename(name),category:'nature'}}));
const suitable=(type,forestCell)=>resources.filter(x=>
 E.canAutoPlaceInTest(x.asset,x.meta,N.effectiveTypes(x.meta,terrain,nature)) &&
 N.effectiveTypes(x.meta,terrain,nature).has(type) &&
 F.preferredFamily(x.meta.family,forestCell));
const grassland=suitable('grassland',{jungle:false});
const wetland=suitable('swamp',{jungle:false});
const cold=suitable('snowfields',{jungle:false});
const jungle=suitable('jungle',{jungle:true});
assert(grassland.some(x=>x.meta.kind==='tree'&&x.meta.family==='deciduous_trees'),'woodland deciduous trees');
assert(grassland.some(x=>x.meta.kind==='tree'&&x.meta.family==='conifers'),'woodland conifers');
assert.equal(resources.filter(x=>x.meta.family==='riparian_trees').length,8);
assert.equal(resources.filter(x=>x.meta.family==='deadwood').length,16);
assert.equal(resources.filter(x=>x.meta.family==='reeds').length,4);
assert.equal(resources.filter(x=>x.meta.family==='cold_bushes').length,4);
assert.equal(resources.filter(x=>x.meta.family==='succulents').length,3);
assert(suitable('tundra',{jungle:false}).some(x=>x.meta.family==='cold_bushes'));
assert(suitable('marshland',{jungle:false}).some(x=>x.meta.family==='reeds'));
assert(!suitable('ocean',{jungle:false}).some(x=>x.meta.family==='reeds'));
assert(wetland.some(x=>x.meta.kind==='tree'),'wetland forests');
assert(cold.some(x=>x.meta.kind==='tree'&&x.meta.family==='snow_conifers'),'snow-covered conifers in cold biomes');
assert(jungle.some(x=>x.meta.kind==='tree'&&x.meta.family==='palms'),'real palm sprites available for jungle biome');
assert(!suitable('moor',{jungle:false}).some(x=>x.meta.family==='palms'),'palms must never auto-spawn on moor');
assert(!suitable('swamp',{jungle:false}).some(x=>x.meta.family==='palms'),'palms must never auto-spawn on swamp');
assert(!suitable('marshland',{jungle:false}).some(x=>x.meta.family==='palms'),'palms must never auto-spawn on marshland');
assert(suitable('savanna',{jungle:false}).some(x=>x.meta.family==='palms'),'palms still spawn in savanna');
assert(!jungle.some(x=>x.meta.family==='savanna_trees'),'savanna tree silhouettes excluded from closed jungle');
const kapok=jungle.filter(x=>x.meta.tags.includes('kapok'));
assert.equal(kapok.length,8,'all eight Kapok trees spawn in jungle');
assert(kapok.every(x=>x.meta.kind==='tree'&&x.meta.placement.density>0),'Kapok are normal spawnable trees');
assert(!grassland.some(x=>x.meta.tags.includes('kapok')),'Kapok spawn is restricted to jungle');
assert(F.treeTarget({forestClass:'dense_forest',suitability:1})>F.treeTarget({forestClass:'light_forest',suitability:1}));
assert(F.treeTarget({forestClass:'light_forest',suitability:1})>F.treeTarget({forestClass:'none',suitability:1,density:.12}));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const editor=fs.readFileSync(path.join(root,'nature-ui.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const required of ['forest:state.forest','forestByHex:','state.forest=window.VedrasForest.valid(scene.forest)','forestCells','riverRoutes','invalidateTerrain']){
 assert(app.includes(required),'missing scene forest integration: '+required);
}
for(const required of ['F.treeTarget(f)','F.maxObjects(f)','F.preferredFamily(m.family,f)','vedras:forest-changed']){
 assert(editor.includes(required),'missing Nature spawn integration: '+required);
}
for(const script of ['forest.js?v=0.18.0','forest-ui.js?v=0.18.0']){
 assert(html.includes(script),'missing forest browser module: '+script);
}
for(const id of ['forestEnabled','forestCoverage','forestEdge','forestHexLight','forestHexDense','forestHexNone','forestHexAuto','forestMakeJungle','forestClearJungle','forestApply']){
 assert(html.includes('id="'+id+'"'),'missing UI control: '+id);
}
console.log('PASS: real woodland, cold and wetland trees, jungle palms and ordinary Kapok trees, independent forest scene export and UI wiring.');

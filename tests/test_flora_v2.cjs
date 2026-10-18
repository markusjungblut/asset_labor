'use strict';
/* Offline FloraV2 regression: node tests/test_flora_v2.cjs */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx={window:{},Math,console};vm.createContext(ctx);
for(const src of ['terrain-plan.js','flora-plan.js','catalog.js','nature_catalog.js','sprite-planner.js']){
 vm.runInContext(fs.readFileSync(path.join(root,src),'utf8'),ctx,{filename:src});
}
const F=JSON.parse(fs.readFileSync(path.join(root,'plans/flora_v2_registry.json')));
const T=JSON.parse(fs.readFileSync(path.join(root,'plans/terrain_catalog_seed.json')));
const P=ctx.window.VedrasSpritePlanner,N=ctx.window.VedrasNatureCatalog;
assert.equal(T.terrainTypes.filter(x=>!x.archived).length,25);
assert.equal(T.terrainTypes.find(x=>x.id==='forest_floor').specialRole,'forest_surface');
assert.equal(Object.keys(T.assets).length,104);
assert.equal(F.species.length,104);
const assets=fs.readdirSync(path.join(root,'assets/nature')).filter(x=>/\.png$/i.test(x));
const aliasList=F.species.flatMap(s=>s.aliases);
assert.equal(aliasList.length,148);
assert.equal(new Set(aliasList).size,aliasList.length);
assert.equal(new Set(assets).size,assets.length);
const entries={};
for(const name of assets){
 assert(aliasList.includes(name),'Unmapped PNG: '+name);
 const match=P.match({name});
 assert(match,'No sprite match: '+name);
 const rel='nature/'+name,meta=P.metadata(match,N.template());
 entries[rel]=meta;
 assert(meta.targetHeight>0&&meta.targetHeight<=400,'Invalid height '+name);
 assert(meta.sizeMode==='class'||meta.kind==='mountain');
 assert(meta.allowedTerrainTypes.length>=1,'No biome '+name);
}
assert.equal(N.validate({schemaVersion:1,revision:0,entries,presets:{}},ctx.window.VedrasCatalog.starter()).length,0);
assert.equal(P.match({name:'tanne_11.png'}).speciesId,'stone_pine_01');
assert.equal(P.match({name:'tanne_schnee_08.png'}).speciesId,'snow_pine_01');
assert.equal(P.match({name:'tree_12.png'}).speciesId,'jungle_tree_01');
assert.equal(P.match({name:'bush_41.png'}).speciesId,'generic_bush_01');
assert.equal(P.match({name:'lärche1.png'}).id,'larche1');
assert.equal(N.validPath('nature/lärche1.png'),true);
assert.equal(N.validPath('nature/weißdorn1.png'),true);
assert.equal(N.validPath('nature/../outside.png'),false);
for(const s of F.species){
 assert(s.allowedTerrainTypes.every(t=>T.terrainTypes.some(x=>x.id===t)),s.id+' invalid biome');
 assert(fs.existsSync(path.join(root,'assets/nature',s.folder,'_ASSET_PLAN.md')),s.folder+' plan missing');
 if(!s.aliases.length)assert(!fs.existsSync(path.join(root,'assets/nature',s.folder,s.filename)),s.filename+' future slot already filled');
}
console.log('FloraV2 OK: '+assets.length+' Nature-PNGs, '+F.species.length+' types, 25 terrains and text-only future slots.');

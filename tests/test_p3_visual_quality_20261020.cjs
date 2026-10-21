/* Priority 3 QA – run: node tests/test_p3_visual_quality_20261020.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const browser={};
for(const file of ['nature-balance.js','forest.js','existing-asset-rules.js','nature_catalog.js'])
 new Function('window',read(file))(browser);
const B=browser.VedrasNatureBalance,F=browser.VedrasForest,
 E=browser.VedrasExistingAssets,N=browser.VedrasNatureCatalog;
const oak={kind:'tree',sizeClass:'medium',family:'deciduous_trees'};
const pine={kind:'tree',sizeClass:'giant',family:'jungle_trees'};
const dead={kind:'tree',sizeClass:'large',family:'dead_trees'};
const rock={kind:'rock',sizeClass:'large',family:'stones'};
const quarter=(Math.round(B.placementScale(rock)*1000))/1000;
assert.equal(quarter,.21,'boulder relative size should be 25% of former .84');
assert.equal(+(B.sizeFactor(oak)/(.72*.5*1.2)).toFixed(2),1.10);
assert.equal(+(B.sizeFactor(pine)/(.65*.5*1.2)).toFixed(2),1.10);
assert.equal(B.sizeFactor(dead),.58*.5,'standing dead trees must not be resized');
for(const i of [1,2,3,12,27]){
 const a=E.classify({name:'boulder_'+String(i).padStart(2,'0')+'.png',category:'nature'});
 assert(a&&a.family==='stones'&&a.kind==='rock','boulder variant detection '+i);
}
const terrain={terrainTypes:['grassland','snowfields','frozen_tundra']
 .map(id=>({id,categoryId:id==='grassland'?'grass_pasture':'cold_regions',
  materialClass:'ground'}))};
const stoneMeta={kind:'rock',family:'stones',allowedTerrainCategories:[],
 allowedTerrainTypes:['grassland','snowfields','frozen_tundra'],excludedTerrainTypes:[],
 placement:{density:.11,weight:1}};
for(const biome of ['snowfields','frozen_tundra'])
 assert.equal(N.canPlace(stoneMeta,{baseBiome:biome,biome,forestClass:'none',neighborTypes:[]},terrain),
 false,'no boulders on '+biome);
assert(N.canPlace(stoneMeta,{baseBiome:'grassland',biome:'grassland',
 forestClass:'none',neighborTypes:[]},terrain),'boulders remain available on grassland');
const cells=[{q:0,r:0,biome:'grassland',terrainTypeId:'grassland'},
 {q:1,r:0,biome:'grassland',terrainTypeId:'grassland'}];
const layer=F.generate(cells,terrain,{...F.defaults(),mode:'classic',
 overrides:{'0,0':'dense_forest','1,0':'light_forest'},
 densityOverrides:{'0,0':.97,'1,0':.5}},c=>c.terrainTypeId,c=>c.terrainTypeId);
const thick=layer.find(c=>c.key==='0,0'),thin=layer.find(c=>c.key==='1,0');
assert(F.treeTarget(thick)>F.treeTarget(thin),'dense forest must be visibly denser');
assert.equal(F.treeTarget(thick),7);
assert.equal(F.maxObjects(thick),11);
assert(F.valid({densityOverrides:{'0,0':.65}}).densityOverrides['0,0']===.65);
const app=read('app.js'),ui=read('nature-ui.js'),chunks=read('chunks.js'),html=read('index.html');
assert(app.includes('OBJECT_DISPLAY_SCALE_Y=.965')&&
 app.includes('OBJECT_DISPLAY_SHEAR_X=.012'),'perspective display-only transform');
assert((app.match(/objectPerspective\(ctx,p\);/g)||[]).length===2,
 'perspective in both shadowed/unshadowed object render paths');
assert(app.includes('densityOverrides[key(q,r)]=source.forestDensity'),
 'worldgen forest density must be transferred to nature');
assert(ui.includes('boulders[(first+j)%boulders.length]'),
 'all imported boulder variants must be eligible for selection');
assert(ui.includes("forestClass==='dense_forest'?.72"),
 'forest spacing must permit a fuller canopy');
assert(chunks.includes('ctx.rect(t.x-bleed,t.y-bleed,size+2*bleed,size+2*bleed)'),
 'terrain chunks need a sampling-safe overlap');
assert(/app\.js\?v=[0-9.]+/.test(html)&&/nature-ui\.js\?v=[0-9.]+/.test(html),
 'cache-busting protects local START_WINDOWS installs');
// Exercise the actual mountain placement helper with two neighboring
// geography mountain cells. No PNGs or server catalog writes are required.
const start=ui.indexOf(' function autoGeoMountains(seed,assets){');
const stop=ui.indexOf(' const isBoulder=',start);
assert(start>=0&&stop>start,'geographic mountain placement helper exists');
const helper=ui.slice(start,stop);
const scene=[{q:0,r:0,reliefClass:'mountain',biome:'grassland'},
 {q:1,r:0,reliefClass:'mountain',biome:'grassland'}];
const asset={name:'berg_01.png',category:'nature',path:'assets/nature/berg_01.png',
 img:{naturalWidth:256}};
const meta={id:'berg_01',family:'mountains',kind:'mountain',
 mountain:{radius:1,coreRadius:0},excludedTerrainTypes:[]};
const core={cells:()=>scene,effectiveBiome:()=> 'grassland',baseBiomeOf:()=> 'grassland'};
const state={mountainInstances:[],natureInstances:[],hexObject:{},
 mountainShadowDefaults:{},shadowAssetPresets:{}};
const calls=[];
const shadowEnv={VedrasMountains:{
 DIRS:[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]],
 config:()=>({radius:1}),candidate:(...args)=>{calls.push(args);return {ok:true};}
},VedrasShadows:{settings:()=>({})}};
const place=new Function('core','state','entryFor','terrainRegistry','random',
 'mountainGeometry','encodeInstanceShadow','window','N','catalog',helper+';return autoGeoMountains;')
 (core,state,()=>meta,()=>({terrainTypes:[{id:'grassland',materialClass:'ground'}]}),
 ()=>.2,()=>({width:360,aspect:1}),()=>({}),shadowEnv,{mountainAllowed:()=>true},{});
const placed=place(123,[asset]);
assert.equal(placed.placed,2,'both geographic mountain hexes should get mountains');
assert.equal(state.mountainInstances.length,2);
assert(state.mountainInstances.every(x=>x.source==='generated'&&x.mode==='chain'));
assert.equal(calls.length,2);
console.log('PASS p3: +10% living trees, 25% boulder scale and all variants, no snow boulders, forest contrast, geography density, mountain spawning, sprite perspective and chunk overlap.');

/* Shared geography v2.1 – run: node tests/test_geography_v2.cjs */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const enginePath=fs.existsSync(path.join(root,'worldgen-geography.js'))
 ?path.join(root,'worldgen-geography.js')
 :path.join(root,'public/worldgen-geography.js');
const G=require(enginePath),defaults=G.defaultConfig();
assert.equal(G.VERSION,'geography-v2.1.0');
assert(!Object.hasOwn(defaults,'climate.latitudeCooling'),'no map-edge latitude climate');
assert(!Object.hasOwn(defaults,'features.horseShare'),'one quota for all animal species');
for(const id of ['water.fraction','water.lakeInfluence','biomes.targetHexes',
 'relief.hillFraction','relief.mountainFraction','rivers.sourcesPer100',
 'forest.coverage','features.animalsPer1000'])
 assert(Object.hasOwn(defaults,id),'required parameter '+id);
const one=G.generateWorld('geography-v21-regression',{width:65,height:52});
const identical=G.generateWorld('geography-v21-regression',{width:65,height:52});
assert.deepEqual(one,identical,'same version + seed + config => same world');
assert.equal(one.cells.length,65*52);
assert.equal(one.riverGeometry,'hex-edges');
assert(one.stats.forestPercentLand>=0&&one.stats.forestPercentLand<=100);
assert(one.stats.forestPercentEligible>=0&&one.stats.forestPercentEligible<=100);
const map=new Map(one.cells.map(c=>[c.q+','+c.r,c]));
for(const c of one.cells){
 const near=G.DIRS.map(([dq,dr])=>map.get((c.q+dq)+','+(c.r+dr))).filter(Boolean);
 if(c.surfaceClass==='coastal_water'&&near.length===6)
  assert(near.some(n=>n.surfaceClass==='land'),'interior coast touches land');
 if(['ocean','icy_ocean','stormy_ocean'].includes(c.surfaceClass))
  assert(!near.some(n=>n.surfaceClass==='land'),'ocean types never touch land');
 if(c.surfaceClass==='land'){
  assert(['flat','hills','mountain'].includes(c.reliefClass));
  assert(c.terrainId&&c.baseBiome);
  if(c.reliefClass==='mountain')assert.equal(c.forestClass,'none');
 }
 if(c.features.includes('oasis'))assert.equal(c.baseBiome,'arid');
 if(c.features.includes('wreck'))assert.notEqual(c.surfaceClass,'land');
 if(c.features.includes('horses'))assert(['savanna','grassland'].includes(c.baseBiome));
 if(c.features.includes('pigs'))assert(['grassland','jungle','wetland'].includes(c.baseBiome));
 for(const direction of c.riverEdges)assert(direction>=0&&direction<6);
}
for(const route of one.riverPaths){
 assert(route.length-1>=defaults['rivers.minLength']);
 assert.equal(G.getWorldCell(one,...route[0]).surfaceClass,'land');
 assert.notEqual(G.getWorldCell(one,...route.at(-1)).surfaceClass,'land');
 for(let i=1;i<route.length;i++){
  const [q,r]=route[i-1],[qq,rr]=route[i];
  assert(G.DIRS.some(([dq,dr])=>q+dq===qq&&r+dr===rr),
   'river route remains neighbor-linked for HEX-SIDE rendering');
 }
}
// World extensions must not reclassify already generated hexes.
const short=G.generateWorld('vedras-grow-test',{width:40,height:40});
const grown=G.generateWorld('vedras-grow-test',{width:70,height:70});
for(const c of short.cells)
 assert.deepEqual(c,G.getWorldCell(grown,c.q,c.r),'changed hex on world expansion '+c.q+','+c.r);
const offset=G.generateWorld('vedras-grow-test',{width:30,height:30,originQ:20,originR:15});
for(const c of offset.cells)
 assert.deepEqual(c,G.getWorldCell(grown,c.q,c.r),'changed hex when origin shifted');
const dry=G.generateWorld('lake-slider-test',{width:35,height:35,
 config:{...defaults,'water.lakeInfluence':0}});
const wet=G.generateWorld('lake-slider-test',{width:35,height:35,
 config:{...defaults,'water.lakeInfluence':.4}});
assert(wet.stats.water>=dry.stats.water,'lake slider must never remove water');
for(const c of dry.cells)if(c.surfaceClass!=='land')
 assert.notEqual(G.getWorldCell(wet,c.q,c.r).surfaceClass,'land');
const lessWood=G.generateWorld('woods-test',{width:35,height:35,
 config:{...defaults,'forest.coverage':.05}});
const moreWood=G.generateWorld('woods-test',{width:35,height:35,
 config:{...defaults,'forest.coverage':.75}});
assert(moreWood.stats.forest>=lessWood.stats.forest,'more forest must not decrease coverage');
assert.throws(()=>G.normalizeConfig({'water.fraction':99}),RangeError);
assert.throws(()=>G.generateWorld('',{width:40,height:40}));
G.registerParameter({id:'extension.fungi.rarity',group:'Erweiterungen',label:'Pilze',
 defaultValue:3,min:0,max:20,step:1,help:'Regler für ein späteres Feature'});
G.registerFeature({id:'extension.fungi',place:({hex,config})=>
 hex.surfaceClass==='land'&&hex.q===2&&hex.r===3&&config['extension.fungi.rarity']>0});
const extra=G.generateWorld('fungi-test',{width:15,height:15});
if(G.getWorldCell(extra,2,3).surfaceClass==='land')
 assert(G.getWorldCell(extra,2,3).features.includes('extension.fungi'));
console.log('PASS Worldgen v2.1: expansion stable; permanent ocean terrains; coast; '+
 'river EDGE topology; wood statistics; lake monotonicity; all-animal quota; extensions.');

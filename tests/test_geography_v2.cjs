/* Geography v2 acceptance checks – run: node tests/test_geography_v2.cjs */
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const root=path.resolve(__dirname,'..');
const filename=fs.existsSync(path.join(root,'worldgen-geography.js'))
 ?path.join(root,'worldgen-geography.js')
 :path.join(root,'public','worldgen-geography.js');
const G=require(filename);
const defaults=G.defaultConfig();
const required=[
 'water.fraction','water.coastDetail','biomes.targetHexes','geology.scale',
 'relief.hillFraction','relief.mountainFraction','rivers.sourcesPer100',
 'forest.coverage','features.animalsPer1000','features.wrecksPer1000'];
for(const key of required)assert(Object.hasOwn(defaults,key),'missing tunable '+key);
assert(G.parameterSchema().length>=37);
const small=G.generateWorld('vedras-worldgen-quality-a',{width:85,height:65});
const again=G.generateWorld('vedras-worldgen-quality-a',{width:85,height:65});
assert.deepEqual(small,again,'seed and full preset must deterministically reproduce whole world');
assert.equal(small.version,G.VERSION);
assert.equal(small.stats.water,Math.round(small.stats.total*defaults['water.fraction']));
assert.equal(small.stats.total,small.width*small.height);
const land=small.cells.filter(c=>c.surfaceClass==='land');
assert(land.length>small.cells.length/2,'land-dominated world');
assert(land.every(c=>['flat','hills','mountain'].includes(c.reliefClass)),
 'exactly the three approved relief classes');
assert(land.every(c=>c.baseBiome&&c.terrainId),'every land hex has biome and terrain subtype');
assert(land.every(c=>c.reliefClass!=='mountain'||c.forestClass==='none'),
 'no tree density on impassable mountains');
for(const c of small.cells){
 const touching=G.DIRS.some(([dq,dr])=>G.getWorldCell(small,c.q+dq,c.r+dr)?.surfaceClass==='land');
 if(c.surfaceClass==='coastal_water')assert(touching,'coastal water always touches land');
 if(c.surfaceClass!=='land'&&c.surfaceClass!=='coastal_water')
  assert(!touching,'no ocean variant touches land');
 if(c.features.includes('oasis'))assert.equal(c.baseBiome,'arid');
 if(c.features.includes('wreck'))assert.notEqual(c.surfaceClass,'land');
 if(c.features.includes('horses'))assert(['grassland','savanna'].includes(c.baseBiome));
 if(c.features.includes('pigs'))assert(['grassland','wetland','jungle'].includes(c.baseBiome));
}
assert(small.stats.rivers>0,'rivers are generated before exploration');
for(const river of small.riverPaths){
 const head=river[0],tail=river[river.length-1];
 assert.equal(G.getWorldCell(small,...head).surfaceClass,'land');
 assert.notEqual(G.getWorldCell(small,...tail).surfaceClass,'land');
 assert(river.length-1>=defaults['rivers.minLength']);
 for(let i=1;i<river.length;i++){
  const [q1,r1]=river[i-1],[q2,r2]=river[i];
  assert(G.DIRS.some(([dq,dr])=>q1+dq===q2&&r1+dr===r2),'river segment not hex-adjacent');
 }
}
const changed=G.generateWorld('vedras-worldgen-quality-a',{width:85,height:65,
 config:{...defaults,'water.fraction':.38,'biomes.targetHexes':40,'relief.hillFraction':.18}});
assert.equal(changed.stats.water,Math.round(changed.stats.total*.38));
assert.notDeepEqual(changed.cells.map(c=>c.terrainId),small.cells.map(c=>c.terrainId));
assert.notDeepEqual(changed.stats,small.stats);
assert.throws(()=>G.normalizeConfig({'water.fraction':99}),RangeError);
assert.throws(()=>G.generateWorld('',{width:40,height:40}));
G.registerParameter({id:'extension.fungi.rarity',group:'Erweiterungen',label:'Pilzrarität',
 defaultValue:3,min:0,max:20,step:1,help:'Automatisch sichtbarer neuer Regler'});
assert.equal(G.defaultConfig()['extension.fungi.rarity'],3);
G.registerFeature({id:'extension.fungi',place:({hex,config})=>
 hex.surfaceClass==='land'&&hex.q===3&&hex.r===4&&config['extension.fungi.rarity']>0});
assert(G.generateWorld('extension-test',{width:15,height:15}).cells.some(c=>
 c.features.includes('extension.fungi')),'extension can participate in geographic generation');
console.log('PASS geography v2: deterministic seed; target water coverage; no land/ocean contacts;'+
 ' biome/terrain/relief; river adjacency; editable preset; extensible schema and features.');

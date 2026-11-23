/* Forest canopy, geography-origin and glade checks. 
 * Run: node tests/test_forest_canopy_generation_20261021.cjs
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const w={};new Function('window',read('forest.js'))(w);
new Function('window',read('nature-balance.js'))(w);
const F=w.VedrasForest,B=w.VedrasNatureBalance;
const terrain={terrainTypes:[
 {id:'grassland',categoryId:'grass_pasture',materialClass:'ground'},
 {id:'ocean',categoryId:'water',materialClass:'water'}]};
const cells=[];
for(let r=-8;r<=8;r++)for(let q=-8;q<=8;q++)
 if(Math.abs(q+r)<=8)cells.push({q,r,biome:'grassland',terrainTypeId:'grassland'});
cells.push({q:30,r:30,biome:'ocean',terrainTypeId:'ocean'});
const overrides={},densityOverrides={},geographyHexes={};
for(const c of cells){
 if(c.biome==='ocean')continue;
 const k=F.key(c.q,c.r);overrides[k]='dense_forest';
 densityOverrides[k]=.88;geographyHexes[k]=true;
}
const cfg={...F.defaults(),seed:16833,coverage:.45,gladeRate:.12,
 overrides,densityOverrides,geographyHexes};
const generate=extra=>F.generate(cells,terrain,{...cfg,...extra},c=>c.terrainTypeId,c=>c.terrainTypeId);
const classic=generate({mode:'classic'}),dense=generate({mode:'dense'}),
 canopy=generate({mode:'canopy'});
const total=arr=>arr.reduce((n,c)=>n+F.treeTarget(c),0);
assert(total(classic)<total(dense)&&total(dense)<total(canopy),
 'all 3 modes have visibly different tree quotas');
assert.equal(F.treeTarget(classic.find(c=>c.key==='0,0')),7);
assert(F.treeTarget(dense.find(c=>c.key==='0,0'))>=15);
assert(F.treeTarget(canopy.find(c=>c.key==='0,0'))>=20);
const glades=canopy.filter(c=>c.glade);
assert(glades.length>=5&&glades.length<cells.length*.2,
 'small amount of natural glades should be present in geographic forest');
assert(glades.some(c=>F.DIRS.some(([dq,dr])=>
 canopy.some(n=>n.glade&&n.key===F.key(c.q+dq,c.r+dr)))),
 'clearings are coherent neighboring patches');
assert(glades.every(c=>F.treeTarget(c)>=3&&F.treeTarget(c)<=6),'glades retain sparse perimeter trees');
assert(glades.every(c=>c.gladeRadius>=58&&c.gladeRadius<=76&&F.inGlade(c,c.gladeX,c.gladeY)),'glade center is a small local opening');
assert(glades.every(c=>!F.inGlade(c,130,130)),'glade does not empty the entire hex');
assert.equal(F.treeTarget(canopy.find(c=>c.key==='30,30')),0,
 'water never becomes forest');
assert.deepEqual(canopy,generate({mode:'canopy'}),'determinism');
const manual=generate({mode:'canopy',geographyHexes:{...geographyHexes,'0,0':false}});
assert.equal(manual.find(c=>c.key==='0,0').glade,false,
 'manual override hex never forcibly becomes auto glade');
const stronger=generate({mode:'canopy',canopyCover:.98,gladeRate:0});
assert.equal(stronger.filter(c=>c.glade).length,0);
assert(stronger.find(c=>c.key==='0,0').canopyCoverage>
 canopy.find(c=>c.key==='0,0').canopyCoverage);

// 2026-11-22: density fluctuation changes canopy targets but never forest
// geography, and isolated-tree odds remain independent from the forest share.
const zeroSwing=generate({mode:'canopy',gladeRate:0,canopyVariation:0});
const swung=generate({mode:'canopy',gladeRate:0,canopyVariation:.30});
const denseTargets=swung.filter(c=>c.forestClass==='dense_forest');
assert(denseTargets.length>50,'test needs a substantial dense-forest region');
assert(denseTargets.some(c=>Math.abs(c.canopyCoverage-
 zeroSwing.find(b=>b.key===c.key).canopyCoverage)>.01),
 'regional density variation must change canopy targets');
assert(denseTargets.some(c=>c.canopyCoverage>
 zeroSwing.find(b=>b.key===c.key).canopyCoverage+.005));
assert(denseTargets.some(c=>c.canopyCoverage<
 zeroSwing.find(b=>b.key===c.key).canopyCoverage-.005));
assert.deepEqual(swung,generate({mode:'canopy',gladeRate:0,canopyVariation:.30}),
 'the same seed and parameters give identical density variation');
assert(zeroSwing.every((c,i)=>c.forestClass===swung[i].forestClass),
 'variation must never recategorize forest hexes');
assert(F.valid({...F.defaults(),canopyVariation:100,openTreeChance:-1}).canopyVariation===.3);
assert(F.valid({...F.defaults(),canopyVariation:100,openTreeChance:-1}).openTreeChance===0);
assert.equal(F.valid({...F.defaults(),openTreeChance:.42}).openTreeChance,.42);
assert.deepEqual(generate({openTreeChance:0}),generate({openTreeChance:.5}),
 'isolated-tree chance must not alter forest classification or canopy geometry');
const cropped=F.generate(cells.map(c=>({...c,worldQ:c.q+170,worldR:c.r-120})),
 terrain,{...cfg,gladeRate:0,canopyVariation:.3},
 c=>c.terrainTypeId,c=>c.terrainTypeId);
assert(cropped.some((c,i)=>Math.abs(c.canopyCoverage-swung[i].canopyCoverage)>.002),
 'regional density seed must respect absolute geographic coordinates');
const legal=cells.filter(c=>c.biome==='grassland');
const forestMap=new Map(legal.map((c,i)=>[F.key(c.q,c.r),{
 key:F.key(c.q,c.r),forestClass:i<60?'dense_forest':'none'
}]));
const builder=B.reserveClearings(legal,forestMap,234,()=>true,new Set(),'canopy');
assert(builder.size>0);
assert([...builder].every(k=>forestMap.get(k).forestClass!=='dense_forest'),
 'build-site reservations avoid existing dense forests');
const nature=read('nature-ui.js'),floor=read('forest-ground.js'),
 ui=read('forest-ui.js'),app=read('app.js'),html=read('index.html');
assert(nature.includes("const spacingFactor=mode==='canopy'"));
assert(nature.includes('const canopyPair='));
assert(nature.includes('neighborsByHex'));
assert(nature.includes('occupied,state.forest.mode'));
assert(floor.includes("sg.globalCompositeOperation='destination-out'")&&
 floor.includes('createRadialGradient'));
assert(app.includes('c.glade,c.gladeX,c.gladeY'),'forest mask keys include glade offsets and radii');
assert(app.includes('geographyHexes[key(q,r)]=true'));
assert(ui.includes("config().mode=e.target.value;changed(true)"));
assert(ui.includes('config().canopyVariation=Number(e.target.value)/100;changed(true)'));
assert(ui.includes('config().openTreeChance=Number(e.target.value)/100;changed(true)'));
assert(nature.includes('rank(trees[0],c,311)<state.forest.openTreeChance'));
assert(!nature.includes('rank(trees[0],c,311)<.06'), 'hardcoded 6% must be removed');
for(const id of ['forestMode','forestCanopyCover','forestCanopyVariation','forestOpenTreeChance','forestGladeRate'])
 assert(html.includes('id="'+id+'"'),id+' input missing');
console.log('PASS: 3 forest modes, geography density, connected glades, protected manual overrides and infrastructure.');

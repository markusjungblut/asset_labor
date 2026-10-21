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
assert(glades.every(c=>F.treeTarget(c)===0));
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
assert(app.includes('c.glade,c.jungle'));
assert(app.includes('geographyHexes[key(q,r)]=true'));
assert(ui.includes("config().mode=e.target.value;changed(true)"));
for(const id of ['forestMode','forestCanopyCover','forestGladeRate'])
 assert(html.includes('id="'+id+'"'),id+' input missing');
console.log('PASS: 3 forest modes, geography density, connected glades, protected manual overrides and infrastructure.');

/* Block 2: source art stays untouched while Nature composition is balanced. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),context={window:{}};vm.createContext(context);
for(const filename of ['nature-balance.js','forest.js','nature_catalog.js'])vm.runInContext(fs.readFileSync(path.join(root,filename),'utf8'),context,{filename});
const B=context.window.VedrasNatureBalance,F=context.window.VedrasForest;
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/nature/nature_catalog.json'),'utf8'));
const assets=Object.values(catalog.entries);
assert.equal(assets.length,258);
const from=family=>assets.find(x=>x.family===family);
const regular=from('deciduous_trees'),conifer=from('conifers'),dead=from('dead_trees');
const snowyDead=from('snow_dead_trees'),fallen=from('fallen_logs'),snowyFallen=from('snow_fallen_logs');
const mediumShrub=assets.find(x=>x.kind==='shrub'&&x.sizeClass==='medium');
const mountain=from('mountains'),mangrove=from('mangroves');
assert.equal(B.sizeFactor(mountain),1,'geology must not be scaled by the Nature balance system');
assert(B.sizeFactor(regular)<=.462&&B.sizeFactor(regular)>.36,'living trees scale down');
assert(B.sizeFactor(conifer)<=.462,'conifers scale down');
assert(B.sizeFactor(dead)<=.30&&B.sizeFactor(snowyDead)<=.30,'dead trees shrink substantially');
assert(B.sizeFactor(fallen)<.525&&B.sizeFactor(snowyFallen)<.525,'fallen trees shrink');
assert(B.sizeFactor(mediumShrub)<=.69,'medium shrubs shrink');
assert(B.sizeFactor(mangrove)<.51,'mangroves are compatible with smaller buildings');
assert(B.isCanopy(regular)&&B.isCanopy(conifer),'living forest canopy');
assert(!B.isCanopy(dead)&&!B.isCanopy(snowyDead),'dead trees cannot fill living forest canopy quota');
assert(B.isAccent(dead)&&B.isAccent(fallen)&&B.isAccent(snowyFallen));
assert.equal(B.accentGroup(dead),'dead_trees');
assert.equal(B.accentGroup(snowyFallen),'fallen_logs');
assert(B.chanceMultiplier(dead)<.2,'dead-tree chances significantly reduced');
assert(B.chanceMultiplier(fallen)<.2,'fallen-log chances reduced');
assert(B.chanceMultiplier(from('deadwood'))<.5,'tree-stump density reduced');
const limits=B.accentLimits(37);
assert.equal(limits.dead_trees,2);assert.equal(limits.fallen_logs,2);
assert.equal(F.treeTarget({forestClass:'dense_forest',suitability:1}),5);
assert.equal(F.treeTarget({forestClass:'light_forest',suitability:1}),4);
assert.equal(F.maxObjects({forestClass:'dense_forest',suitability:1}),8);
assert.equal(F.maxObjects({forestClass:'light_forest',suitability:1}),7);
const hexes=[];for(let q=-3;q<=3;q++)for(let r=-3;r<=3;r++)if(Math.abs(q+r)<=3)hexes.push({q,r});
const occupied=new Set(['0,0','1,0']);
const ground=c=>c.q<=1;
const map=new Map(hexes.map(c=>[c.q+','+c.r,{key:c.q+','+c.r,forestClass:c.r<0?'dense_forest':'none'}]));
const a=B.reserveClearings(hexes,map,12345,ground,occupied),b=B.reserveClearings(hexes.slice().reverse(),map,12345,ground,occupied);
assert.deepEqual([...a].sort(),[...b].sort(),'reproducible, order-independent clearing locations');
const open=hexes.filter(c=>ground(c)&&!occupied.has(c.q+','+c.r));
assert.equal(a.size,Math.round(open.length*.18),'approximately 18% of buildable landscape remains free');
assert([...a].every(k=>!occupied.has(k)&&open.some(c=>k===c.q+','+c.r)),'only suitable unoccupied land reserved');
assert([...a].some(k=>[...a].some(other=>{
 if(k===other)return false;
 const [q,r]=k.split(',').map(Number),[x,y]=other.split(',').map(Number);
 return Math.max(Math.abs(q-x),Math.abs(r-y),Math.abs(q+r-x-y))===1;
})), 'at least one adjacent building clearing pair');
assert.equal(B.reserveClearings(hexes,map,12345,()=>false,new Set()).size,0,'water-only scenes reserve nothing');
const editor=fs.readFileSync(path.join(root,'nature-ui.js'),'utf8'),app=fs.readFileSync(path.join(root,'app.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const fragment of ['B.reserveClearings(core.cells()','B.isCanopy(entryFor(a))','B.accentGroup(meta)','accents[group]>=limits[group]',
 'conflictsWithBuilding(q,r,dx,dy,meta)','state.hexObject?.[cellKey]','n.source===\'manual\'']){
 assert(editor.includes(fragment),'runtime integration: '+fragment);
}
assert(app.includes('window.VedrasNatureBalance?.sizeFactor(m)'),'old/new nature sprites must share the reduction');
const moduleTag='nature-balance.js?v=0.25.0',appTag='app.js?v=0.30.0';
assert(html.includes(moduleTag)&&html.indexOf(moduleTag)<html.indexOf(appTag),'balance module must load before map');
console.log('PASS: 258 assets preserved, compact trees/shrubs/deadwood, sparse accents, adjacent building clearings and legacy sprite scales.');

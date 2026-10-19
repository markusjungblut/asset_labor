/* Regression: shoreline-aligned filled river masks and ecological Nature anchors. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),w={};
for(const script of ['river.js','nature_catalog.js','existing-asset-rules.js'])
 vm.runInNewContext(fs.readFileSync(path.join(root,script),'utf8'),{window:w},{filename:script});
const R=w.VedrasRivers,N=w.VedrasNatureCatalog,E=w.VedrasExistingAssets;
const terrain=JSON.parse(fs.readFileSync(path.join(root,'assets/terrain/terrain_catalog.json'),'utf8'));
const cat=JSON.parse(fs.readFileSync(path.join(root,'assets/nature/nature_catalog.json'),'utf8'));
assert.deepEqual(N.validate(cat,terrain),[]);
assert.equal(Object.keys(cat.entries).length,181);
const ok=(f,t,n=[])=>N.habitatOK({id:f,family:f,tags:[]},t,n,terrain);
for(const [f,t,n,want] of [
 ['mangroves','swamp',['ocean'],true],['mangroves','marshland',['jungle'],true],
 ['mangroves','highland',['ocean'],false],['mangroves','moor',['ocean'],false],
 ['mangroves','ocean',['swamp'],false],['mangroves','snowfields',['jungle'],false],
 ['mangroves','swamp',[],false],['palms','jungle',[],true],['palms','savanna',[],true],
 ['palms','moor',[],false],['palms','marshland',[],false],['palms','highland',[],false],
 ['savanna_trees','savanna',[],true],['savanna_trees','jungle',[],false],
 ['savanna_trees','sandy_desert',[],false],['conifers','snowfields',[],false],
 ['snow_conifers','snowfields',[],true],['reeds','ocean',['swamp'],false],
 ['riparian_trees','pasture',[],false],['riparian_trees','pasture',['marshland'],true]
 ])assert.equal(ok(f,t,n),want,f+'/'+t);
for(const [name,family] of [
 ['Dead_Tree_11.png','snow_dead_trees'],['Dead_Tree_15.png','snow_dead_trees'],
 ['Dead_Tree_01.png','dead_trees'],['Farn_03.png','ferns'],
 ['Mangrove_01.png','mangroves'],['Dschungelbusch_02.png','tropical_bushes'],
 ['Kaktus_03.png','cacti'],['Fallen_Tree_04.png','deadwood']
 ])assert.equal(E.classify({category:'nature',name})?.family,family,name);
assert.equal(E.classify({category:'nature',name:'Mangrove_Group_01.png'}),null,'mangrove group cancelled');
const cells=[];for(let q=-3;q<=3;q++)for(let r=-3;r<=3;r++)if(Math.abs(q+r)<=3)cells.push({q,r});
const wet=c=>c.q===2&&c.r===0,route=R.findRoute(cells,wet,{q:-2,r:0});
assert(route&&R.valid(route,cells,wet));
const source=R.sections(route,cells,wet)[0],c=source.start;
assert(R.blocksPoint(c.x,c.y,[route],cells,wet,32,8),'river roots blocked');
assert(!R.blocksPoint(source.center.x,source.center.y,[route],cells,wet,32,8),'hex centre outside edge river');
let strokes=0,masks=0,fade=0;
const context={
 setTransform(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},arc(){},
 fill(){masks++;if(this.globalCompositeOperation==='destination-out')fade++;},
 stroke(){strokes++;},save(){},restore(){},fillRect(){},createPattern(){return {setTransform(){}};},
 createLinearGradient(){return {addColorStop(){}};}
};
const doc={createElement:()=>({width:0,height:0,getContext:()=>context})};
const wrapper={window:{},document:doc};
vm.runInNewContext(fs.readFileSync(path.join(root,'river.js'),'utf8'),wrapper,{filename:'river.js'});
const image={naturalWidth:256},paint=wrapper.window.VedrasRivers.render({drawImage(){}},route,cells,wet,image,{width:32});
assert(paint?.canvas);assert.equal(strokes,0,'filled segment masks, not brush strokes');
assert(masks>=6&&fade>0,'water feathering and mouth fade');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.includes('id="nCleanup"')&&html.includes('river.js?v=0.16.0'));
console.log('PASS: 181 Nature entries, mangrove and palm hard habitats, future sprite classification, filled river geometry and block zones.');

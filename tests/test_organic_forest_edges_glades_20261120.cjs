'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const load=(name,sandbox)=>vm.runInNewContext(
 fs.readFileSync(path.join(root,name),'utf8'),sandbox,{filename:name});
const forestWindow={};load('forest.js',{window:forestWindow});
const F=forestWindow.VedrasForest;
const terrain={terrainTypes:[
 {id:'grassland',categoryId:'grass_pasture',materialClass:'ground'},
 {id:'ocean',categoryId:'water',materialClass:'water'}
]};
const cell=(q,r,id='grassland')=>({q,r,terrainTypeId:id,biome:id});
const forestOf=(cells,options)=>F.generate(cells,terrain,options,
 c=>c.terrainTypeId,c=>c.terrainTypeId);

test('geographic bare hex remains none while accepting sparse border trees',()=>{
 const cells=[cell(0,0),cell(1,0),cell(-1,0),cell(0,1,'ocean')];
 const options={...F.defaults(),coverage:0,
  overrides:{'0,0':'dense_forest','1,0':'none','-1,0':'none','0,1':'none'},
  geographyHexes:{'0,0':true,'1,0':true,'0,1':true}};
 const result=forestOf(cells,options),by=new Map(result.map(c=>[c.key,c]));
 assert.equal(by.get('0,0').forestClass,'dense_forest');
 assert.equal(by.get('1,0').forestClass,'none','no new Geography forest class');
 assert.equal(by.get('1,0').manualClearing,false);
 assert(by.get('1,0').edgeInfluence>.1,'geographic open ground gets forest-edge halo');
 assert(F.treeTarget(by.get('1,0'))>0&&F.treeTarget(by.get('1,0'))<=2,
  'border trees are sparse, never another dense woodland');
 assert.equal(by.get('-1,0').manualClearing,true);
 assert.equal(by.get('-1,0').edgeInfluence,0,'manual free space stays clear');
 assert.equal(by.get('0,1').edgeInfluence,0,'water stays clear');
 assert.deepEqual(JSON.parse(JSON.stringify(result)),
  JSON.parse(JSON.stringify(forestOf(cells,options))),'same seed deterministic');
 assert(forestOf(cells,{...options,edgeStrength:0}).every(c=>c.edgeInfluence===0));
});

test('glade is a localized opening with edge trees, not a completely bare hex',()=>{
 const cells=[];for(let q=-5;q<=5;q++)for(let r=-5;r<=5;r++)
  if(Math.abs(q+r)<=5)cells.push(cell(q,r));
 const overrides={},geographyHexes={};
 for(const c of cells){
  const k=F.key(c.q,c.r);overrides[k]='dense_forest';geographyHexes[k]=true;
 }
 const result=forestOf(cells,{...F.defaults(),seed:16833,coverage:0,
  gladeRate:.16,overrides,geographyHexes});
 const glades=result.filter(c=>c.glade);
 assert(glades.length>0,'geographic dense woodland has some glades');
 for(const g of glades){
  assert(g.gladeRadius>=58&&g.gladeRadius<=76);
  assert(F.inGlade(g,g.gladeX,g.gladeY),'clearing center is protected');
  assert(!F.inGlade(g,120,110),'hex perimeter is not a clearing');
  assert(F.treeTarget(g)>=3&&F.treeTarget(g)<=6,'few trees remain');
  assert(F.maxObjects(g)>=F.treeTarget(g),'tree and shrub headroom remains');
  assert(g.canopyCoverage>0&&g.canopyCoverage<.3,'not a completely bare canopy');
  assert.equal(g.forestClass,'dense_forest','Glades do not alter forest share');
 }
});

function renderer(){
 const canvases=[];
 const document={createElement(type){
  assert.equal(type,'canvas');
  const ops=[],canvas={width:0,height:0,ops};
  const g={
   filter:'none',globalCompositeOperation:'source-over',
   setTransform(){},scale(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},
   arc(...args){ops.push(['arc',...args,this.globalCompositeOperation]);},
   fill(){ops.push(['fill',this.globalCompositeOperation]);},
   createPattern(){return {};},fillRect(){},drawImage(){},
   save(){},restore(){},
   createRadialGradient(...args){
    ops.push(['gradient',...args]);
    return {addColorStop(){}};
   }
  };
  canvas.getContext=()=>g;canvases.push(canvas);return canvas;
 }};
 const window={};load('forest-ground.js',{window,document});
 return {M:window.VedrasForestGround,canvases};
}
const floor=(q,r,forestClass,edgeInfluence=0,manualClearing=false)=>({
 q,r,forestClass,edgeInfluence,manualClearing,
 baseBiome:'grassland',categoryId:'grass_pasture',ground:true,jungle:false,glade:false
});
test('floor mask develops organic bulbs only toward suitable fringe, not manual clearings',()=>{
 const input=[floor(0,0,'dense_forest'),floor(1,0,'none',.30)];
 const yes=renderer(),image={naturalWidth:512,naturalHeight:512};
 const out=yes.M.build(input,image,{resolution:1,textureSize:256});
 assert.equal(out.cells,1,'only the core forest is counted');
 assert.equal(out.mask,'organic-region-union-soft-biome-v4');
 assert(yes.canvases[0].ops.some(x=>x[0]==='arc'),'organic extension across boundary');
 const blocked=renderer();
 blocked.M.build([input[0],floor(1,0,'none',0,true)],image,{resolution:1});
 assert.equal(blocked.canvases[0].ops.filter(x=>x[0]==='arc').length,0,
  'manual clearing has no forest-ground outward bulbs');
 const water=renderer();
 water.M.build([input[0],{...input[1],ground:false}],image,{resolution:1});
 assert.equal(water.canvases[0].ops.filter(x=>x[0]==='arc').length,0,
  'water has no forest-ground outward bulbs');
});
test('ground renderer uses multiple shifted lobes for a small glade',()=>{
 const r=renderer(),g={...floor(0,0,'dense_forest'),glade:true,
  gladeX:18,gladeY:-12,gladeRadius:68};
 const out=r.M.build([g],{naturalWidth:512,naturalHeight:512});
 assert(out?.canvas);
 const holes=r.canvases[1].ops.filter(x=>x[0]==='gradient');
 assert.equal(holes.length,3,'asymmetric multi-lobe glade, not one tiny central dot');
 assert(holes.some(x=>x[1]!==0||x[2]!==0),'glade is offset from hex center');
});

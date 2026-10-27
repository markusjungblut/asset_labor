'use strict';
// Global sprite depth must not depend on independently baked World-Tile order.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function world(){
 const images=[];
 const g={setTransform(){},clearRect(){},save(){},restore(){},
  beginPath(){},closePath(){},clip(){},moveTo(){},lineTo(){},
  fill(){},fillRect(){},drawImage(img){images.push(img.tag);}};
 const win={};
 vm.runInNewContext(read('world-tile-streamer.js'),{window:win,performance:{now:()=>0}});
 const w=win.VedrasWorldTiles.create({canvas:{width:0,height:0,
  getContext:()=>g},source:null});
 const tiles=[0,1].map(x=>({id:x+',0',x:x*512,y:0,size:512,visibility:'visible'}));
 for(let i=0;i<2;i++)assert.ok(w.seed(tiles[i],'mid',{complete:true,layers:[
  {layer:'ground',image:{width:512,height:435,tag:'ground-'+i}},
  {layer:'scenery',image:{width:640,height:550,tag:'baked-tree-'+i},pad:64}
 ]}));
 const view={width:1000,height:600,dpr:1,zoom:.72,panX:0,panY:0,projectY:.85};
 w.request(view,tiles);
 return {w,view,tiles,g,images};
}
test('fast camera paints ground tiles but one globally ordered scenery pass',()=>{
 const x=world();let paints=0;
 const r=x.w.render(x.view,{drawStatic:g=>{
  paints++;g.drawImage({tag:'global-sorted-Nature'});
 }});
 assert.equal(paints,1);
 assert.deepEqual(x.images,['ground-0','ground-1','global-sorted-Nature']);
 assert.equal(r.drawn,3);
});
test('camera pan does not reintroduce old scenery tiles',()=>{
 const x=world();let paints=0;
 const drawStatic=g=>{paints++;g.drawImage({tag:'global-sorted-Nature'});};
 x.w.render(x.view,{drawStatic});
 x.images.length=0;
 const view={...x.view,panX:-120};
 x.w.request(view,x.tiles);
 x.w.render(view,{drawStatic});
 assert.deepEqual(x.images,['ground-0','ground-1','global-sorted-Nature']);
 assert.equal(paints,2);
});
test('legacy callers retain earlier tile scenery rendering',()=>{
 const x=world();
 x.w.render(x.view);
 assert.deepEqual(x.images,[
  'ground-0','ground-1','baked-tree-0','baked-tree-1'
 ]);
});
test('retained globally sorted scenery is reused over a camera pan',()=>{
 const win={};
 const draws=[],doc={createElement:()=>({
  width:0,height:0,getContext(){return {setTransform(){},drawImage(){}}}
 })};
 vm.runInNewContext(read('static-object-layer.js'),{
  window:win,document:doc,performance:{now:()=>0}
 });
 const staticScene=win.VedrasStaticObjects.create({padding:160,maxPixels:4000000});
 const target={drawImage(){draws.push('composite')}};
 let builds=0;
 const view={width:760,height:480,dpr:1,zoom:.72,panX:0,panY:0};
 const paint=panX=>staticScene.paint({ctx:target,
  view:{...view,panX},signature:'sorted-tree-layout',
  drawScene:()=>builds++});
 assert.equal(paint(0).cached,false);
 assert.equal(paint(55).cached,true);
 assert.equal(builds,1);
 assert.equal(draws.length,2);
});
test('normal and fast camera share the same static depth signature',()=>{
 const s=read('app.js');
 assert.match(s,/function staticScenerySignature\(\)/);
 assert.match(s,/drawStatic:drawFastStaticScenery/);
 assert.match(s,/ctx:g,signature:staticScenerySignature\(\)/);
 assert.match(s,/const sceneSignature=staticScenerySignature\(\)/);
 assert.match(s,/drawMapObjects\(\{includeUnits:false\}\)/);
});

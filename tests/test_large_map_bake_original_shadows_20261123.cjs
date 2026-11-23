'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const Shadow=require('../large-map-bake-original-sprite-shadows.js');
const root=path.resolve(__dirname,'..');
const canvasFactory=()=>{
 const ops=[],ctx={
  setTransform:(...a)=>ops.push(['setTransform',...a]),
  drawImage:(...a)=>ops.push(['drawImage',...a]),
  fillRect:(...a)=>ops.push(['fillRect',...a]),
  save:()=>{},restore:()=>{}
 };
 return {width:0,height:0,ops,getContext:()=>ctx};
};
function fixture(){
 const source={schemaVersion:1,revision:0,
  global:{strength:.68},profiles:{'assets/nature/bush_01.png':{}}};
 const engine={get:()=>source,valid:v=>v,
  profile:()=>({enabled:true,opacity:.4,angle:160,
   width:.62,length:1,softness:6,contact:.2,offsetX:0,offsetY:0}),
  draw:(...a)=>{fixture.draws.push(a);}};
 const tone={withMaskPass:fn=>{fixture.masks++;return fn();},
  targetAlpha:()=>.12,colorCss:()=> '#000000'};
 const item={type:'accent',inst:{assetPath:'assets/nature/bush_01.png'},
  meta:{kind:'shrub',family:'temperate_bushes'},p:{x:500,y:200}};
 const obj={item,img:{naturalWidth:200,naturalHeight:200},
  g:{b:{sx:0,sy:0,sw:200,sh:200},width:40,y:200},
  coveredByMountains:new Set()};
 fixture.draws=[];fixture.masks=0;
 return {engine,tone,objects:[obj],output:canvasFactory(),
  tile:{x:0,y:0},canvasFactory};
}
test('native shadow painter owns geometry and uses a single union mask',()=>{
 const f=fixture();
 const result=Shadow.paint(f);
 assert.equal(result.schema,'vedras-geography-sprite-shadow-preview-v1');
 assert.equal(result.drawn,1);
 assert.equal(result.manual,0);
 assert.equal(result.profiles,1);
 assert.equal(result.alpha,.12);
 assert.equal(result.needsOriginalMountainShadows,true);
 assert.equal(result.readyForViewer,false);
 assert.equal(fixture.masks,1);
 assert.equal(fixture.draws.length,1);
 assert.equal(fixture.draws[0][1].asset.path,'assets/nature/bush_01.png');
 assert.equal(fixture.draws[0][2].x,1250);
});
test('hand-drawn polygon shadow footprints include authentic negative bounds',()=>{
 const raw={manual:{polygons:[[[-.8,-.3],[-.2,-.3],[-.2,.1]]]},
  softness:2,contact:0,offsetX:0,offsetY:0};
 const x=Shadow.bounds({x:150,y:100},100,110,
  {x:.5,y:.96},raw,'stones','rock');
 assert(x.left<70);assert(x.top<65);
 assert(x.left+x.width>=150);
});
test('empty shadow profiles and absent original renderer fail closed',()=>{
 const f=fixture();
 assert.throws(()=>Shadow.paint({...f,engine:{...f.engine,
  get:()=>({...f.engine.get(),profiles:{}})}}),/gespeicherte Original/);
 assert.throws(()=>Shadow.paint({...f,tone:{}}),/gespeicherte Original/);
});
test('occluded trees and mountains get no fake sprite shadows',()=>{
 const f=fixture(),m={...f.objects[0],
  item:{...f.objects[0].item,type:'mountain'}},
  t={...f.objects[0],item:{...f.objects[0].item,
   type:'tree',meta:{kind:'tree'}},
   coveredByMountains:new Set([m])};
 const r=Shadow.paint({...f,objects:[m,t]});
 assert.equal(r.drawn,0);assert.equal(r.hidden,1);
 assert.equal(fixture.draws.length,0);
});
test('Geography UI uses optional shadow only for joint scenery, not old tree PNG',()=>{
 const lab=fs.readFileSync(path.join(root,'geography-lab.js'),'utf8');
 const html=fs.readFileSync(path.join(root,'geography-lab.html'),'utf8');
 const ci=fs.readFileSync(path.join(root,'.github/workflows/geography-large-bake-ci.yml'),'utf8');
 const old=lab.indexOf("'original-tree-scenery-png-preview'");
 const joint=lab.indexOf("$('previewJointScenery').addEventListener");
 const option=lab.indexOf("const withShadows=$('jointSceneryWithShadows').checked;");
 assert(old>0&&joint>old&&option>joint);
 assert.match(lab.slice(joint),/previewSpriteShadows:withShadows/);
 assert(html.includes('id="jointSceneryWithShadows"'));
 assert(html.indexOf('src="shadow-shapes.js')<
  html.indexOf('src="sprite-shadow-editor.js'));
 assert(html.indexOf('src="sprite-shadow-editor.js')<
  html.indexOf('src="large-map-bake-original-sprite-shadows.js'));
 assert(ci.includes('/tests/test_large_map_bake_original_shadows_20261123.cjs'));
});

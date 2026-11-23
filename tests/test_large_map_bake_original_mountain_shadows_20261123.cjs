'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const Mountain=require('../large-map-bake-original-mountain-shadows.js');
const root=path.resolve(__dirname,'..');
const ctxOps=[];
function canvasFactory(){
 const cv={width:0,height:0,getContext:()=>({
  drawImage:(...v)=>ctxOps.push(['draw',...v]),
  setTransform:()=>{},save:()=>{},restore:()=>{},
  createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),
  putImageData:(...v)=>ctxOps.push(['put',...v]),
  getImageData:()=>({data:new Uint8ClampedArray(512*512*4)})
 })};
 return cv;
}
const SH={
 settings:()=>({opacity:.44,softness:17,contactWidth:.16,
  originX:-.1,originY:.015,angle:150,length:.72,
  rootWidth:.26,midWidth:.21,tipWidth:.105}),
 mountainShape:(o,w,s)=>({origin:o,p2:{x:o.x-w*s.length,y:o.y+w*.25},
  radius:[w*s.rootWidth,w*s.midWidth,w*s.tipWidth]}),
 alphaFoot:()=>({x:-.27,y:0}),
 mountainOrigin:(p,w,h,a,s,f)=>({
  x:p.x+w*(f.x+s.originX),y:p.y+h*f.y+w*s.originY
 }),
 globalStrength:x=>x,
 paintMountain:(g,p,w,s,strength)=>{ctxOps.push(['native',p,w,strength]);
  return {positiveCount:220,maxAlpha:31};}
};
function fixture(){
 ctxOps.length=0;
 const o={item:{type:'mountain',meta:{kind:'mountain',
  anchor:{x:.5,y:.67}},inst:{assetPath:'assets/nature/berg_01.png'},
  p:{x:512,y:100}},g:{width:360,y:100,
   b:{sx:0,sy:0,sw:180,sh:120}},
  img:{naturalWidth:1200,naturalHeight:900}};
 const output=canvasFactory();output.width=1920;output.height=1632;
 return {objects:[o],output,tile:{x:0,y:0},
  canvasFactory,shadows:SH,
  tone:{targetAlpha:()=>.12},
  spriteShadows:{get:()=>({global:{strength:2},
   profiles:{'assets/nature/bush_01.png':{}}})}};
}
test('native editor distance-field and true original alphaFoot are called',()=>{
 const f=fixture(),r=Mountain.paint(f);
 assert.equal(r.schema,'vedras-geography-original-mountain-shadow-preview-v1');
 assert.equal(r.drawn,1);assert.equal(r.nonzeroPixels,220);
 assert.equal(r.maxAlpha,31);assert.equal(r.defaultEditorSettings,true);
 assert.equal(r.needsAuthoredSceneOverrides,true);
 assert.equal(r.readyForViewer,false);
 assert(ctxOps.some(v=>v[0]==='native'&&v[3]===2));
 assert(ctxOps.some(v=>v[0]==='draw'));
});
test('native mountain geometry is bounded by deterministic world coordinates',()=>{
 const x=Mountain.bounds(SH,{x:900,y:100},900,SH.settings());
 assert(x.left<900);assert(x.left+x.width>800);
 assert(x.height>0&&x.width>0);
});
test('reject missing native engine or shadow profile (fail closed)',()=>{
 const f=fixture();
 assert.throws(()=>Mountain.paint({...f,shadows:{}}),/Original-Bergschatten/);
 assert.throws(()=>Mountain.paint({...f,
  spriteShadows:{get:()=>({global:{strength:2},profiles:{}})}}),
  /Original-Bergschatten/);
});
test('no mountain shadow without authentic mountain source object',()=>{
 const f=fixture();
 assert.throws(()=>Mountain.paint({...f,objects:[{
  ...f.objects[0],item:{...f.objects[0].item,type:'rock'}
 }]}),/Bergschattenliste/);
});
test('shadow-only off-tile source is accepted, but no fake draw is generated',()=>{
 const f=fixture();f.objects[0].shadowOnly=true;
 const r=Mountain.paint(f);
 assert.equal(r.onlyShadow,1);
 assert.equal(r.complete,false);
});
test('browser and focused CI load native mountain module before joint renderer',()=>{
 const html=fs.readFileSync(path.join(root,'geography-lab.html'),'utf8');
 const lab=fs.readFileSync(path.join(root,'geography-lab.js'),'utf8');
 const joint=fs.readFileSync(path.join(root,'large-map-bake-joint-scenery.js'),'utf8');
 const ci=fs.readFileSync(path.join(root,
  '.github/workflows/geography-large-bake-ci.yml'),'utf8');
 assert(html.includes('jointSceneryWithMountainShadows'));
 assert(html.indexOf('src="shadow-system.js')<
  html.indexOf('src="large-map-bake-original-mountain-shadows.js'));
 assert(html.indexOf('src="large-map-bake-original-mountain-shadows.js')<
  html.indexOf('src="large-map-bake-joint-scenery.js'));
 assert(lab.includes('previewMountainShadows:withMountains'));
 assert(joint.includes('previewMountainShadows=false'));
 assert(joint.includes('VedrasLargeMapOriginalMountainShadows.paint'));
 assert(ci.includes('/tests/test_large_map_bake_original_mountain_shadows_20261123.cjs'));
});

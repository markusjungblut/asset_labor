'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const Probe=require('../large-map-bake-editor-reference-sprite.js');
const root=path.resolve(__dirname,'..');
const img={naturalWidth:100,naturalHeight:170};
const object={item:{type:'tree',p:{x:400,y:600},
 meta:{anchor:{x:.5,y:.96}}},img,g:{
 y:600,width:180,b:{sx:0,sy:0,sw:100,sh:170}}};
test('editor projects the GROUND FOOT only, never the sprite body',()=>{
 const g=Probe.geometry({object});
 assert.equal(g.footX,1000);
 assert.equal(g.footY,1275);
 assert.equal(g.height,765);
 assert.equal(g.top,1275-765*.96);
 assert(g.verticalBodyDifference>110);
 assert.equal(g.legacyImageHeight,g.height*.85);
});
test('editor receiver shadow scratch mirrors app.js 2.0 DPR and source-atop',()=>{
 const report=[];let scratch=null;
 function context(id){
  return {
   save:()=>report.push([id,'save']),
   restore:()=>report.push([id,'restore']),
   translate:()=>report.push([id,'translate']),
   transform:()=>report.push([id,'perspective']),
   setTransform:()=>report.push([id,'setTransform']),
   clearRect:()=>report.push([id,'clearRect']),
   drawImage:im=>report.push([id,im===img?'original':im===cast.canvas?'cast':'composited']),
   set globalCompositeOperation(x){report.push([id,x]);},
   set globalAlpha(x){},
   set filter(x){},
   set shadowBlur(x){},
   set shadowColor(x){}
  };
 }
 const cast={canvas:{},x:0,y:0,width:100,height:100};
 const contextOut=context('output');
 const result=Probe.paint({object,ctx:contextOut,
  canvasFactory:()=>{scratch={width:0,height:0,
   getContext:()=>context('scratch')};return scratch;},
  casts:[cast],polish:{natureFilter:()=>'none'}});
 const rows=report.map(x=>x[1]);
 assert.equal(result.casts,1);
 assert(rows.indexOf('original')>=0&&rows.indexOf('source-atop')>rows.indexOf('original'));
 assert(rows.indexOf('cast')>rows.indexOf('source-atop'));
 assert(rows.indexOf('perspective')>rows.indexOf('cast'));
 assert(rows.indexOf('composited')>rows.indexOf('perspective'));
 assert.equal(scratch.width,Math.ceil(450*2));
});
test('fail closed on missing original image or canvas',()=>{
 assert.throws(()=>Probe.geometry({object:{}}),/Original-PNG/);
 assert.throws(()=>Probe.paint({object,ctx:{},canvasFactory:()=>{},
  polish:{natureFilter:()=>'none'}}),/Canvas2D/);
});
test('real editor browser proof is wired to ORIGINAL app.js, not mock functions',()=>{
 const t=fs.readFileSync(path.join(root,'tests',
  'automated_browser_geography_editor_parity_20261123.cjs'),'utf8');
 const ci=fs.readFileSync(path.join(root,
  '.github/workflows/geography-io-regression.yml'),'utf8');
 assert(t.includes("const editor=read('app.js')"));
 assert(t.includes('function drawSprite(obj)'));
 assert(t.includes('function mountainCoversBase(plant,mountain)'));
 assert(t.includes('EDITOR_SPRITE_PARITY_DIAGNOSTIC'));
 assert(ci.includes('automated_browser_geography_editor_parity_20261123.cjs'));
});

test('editor pixel bounds enclose the complete perspective-transformed PNG body',()=>{
 const geo=Probe.geometry({object}),box=Probe.pixelBounds({object});
 assert.equal(Number.isInteger(box.left),true);
 assert.equal(Number.isInteger(box.top),true);
 assert(box.top<geo.top,'perspective margin protects the tallest canopy');
 assert(box.bottom>geo.footY,'sprite continues beneath the ground anchor');
 assert(box.right-box.left>geo.width);
 assert(box.bottom-box.top>geo.height*.9);
});
test('editor projection boundaries fail closed on missing fields or bad padding',()=>{
 assert.throws(()=>Probe.pixelBounds({object,padding:Infinity}),/begrenztes/);
 assert.throws(()=>Probe.pixelBounds({object:{}}),/Original-PNG/);
});
test('new editor projection is explicitly opt-in and never lifts viewer gates',()=>{
 const rootCode=fs.readFileSync(path.join(root,'large-map-bake-joint-scenery.js'),'utf8');
 const html=fs.readFileSync(path.join(root,'geography-lab.html'),'utf8');
 const seam=fs.readFileSync(path.join(root,'large-map-bake-scenery-seam.js'),'utf8');
 assert.match(rootCode,/previewEditorProjection=false/);
 assert.match(rootCode,/editorPixelsUnprojectedHeight:previewEditorProjection/);
 assert.match(rootCode,/hiddenEditorTrees/);
 assert.match(rootCode,/needsFullEditorImageParity:true/);
 assert.match(rootCode,/complete:false,readyForViewer:false/);
 assert(html.includes('jointSceneryWithEditorProjection'));
 assert.match(seam,/allowEditorProjectionPreview=false/);
});

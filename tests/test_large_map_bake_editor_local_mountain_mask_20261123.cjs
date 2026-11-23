'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const L=require('../large-map-bake-editor-local-mountain-mask.js');
function mock(){
 const observed=[];
 const sh={
  mountainShape:(o,w,cfg)=>{
   observed.push({o,w,softness:cfg.softness});
   return {radius:[5,3,2],p2:{x:-20,y:10}};
  },
  paintMountain:(ctx,o,w,cfg,strength)=>{
   observed.push({paint:o,w,softness:cfg.softness,strength});
   return {maxAlpha:27,positiveCount:42};
  }
 };
 const canvasFactory=()=>({width:0,height:0,
  getContext:()=>({getImageData(){},putImageData(){}})});
 return {observed,sh,canvasFactory};
}
test('original editor low-res raster is capped at .6 and 320 global pixels',()=>{
 const a=mock();
 const o=L.raster({width:1000,settings:{softness:10,contactWidth:.3},
  strength:1.12,shadows:a.sh,canvasFactory:a.canvasFactory});
 assert.equal(o.factor,.32);
 assert.equal(o.rasterWidth,320);
 assert.equal(a.observed[0].softness,3.2);
 assert.equal(a.observed[1].w,320);
 assert.equal(a.observed[1].strength,1.12);
 assert.equal(o.left,-125); // contact radius=96; floor(-20-102.5)-2
 assert.equal(o.canvas.width,Math.ceil(320*.045+3)-o.left);
 assert.equal(o.complete,false);assert.equal(o.readyForViewer,false);
});
test('source editor half-size variant remains capped by 60% world width',()=>{
 const a=mock();
 const o=L.raster({width:200,settings:{softness:20,contactWidth:.3},
  strength:1,shadows:a.sh,canvasFactory:a.canvasFactory});
 assert.equal(o.factor,.6);assert.equal(o.rasterWidth,120);
 assert.equal(a.observed[0].softness,12);
 const c=L.cast({raster:o,origin:{x:101.25,y:40.75}});
 assert.equal(c.x,101.25+o.left/.6);
 const b=L.globalBox({cast:c});
 assert(Number.isInteger(b.left)&&Number.isInteger(b.top));
 assert(b.left<=c.x&&b.top<=c.y);
 assert(b.left+b.width>=c.x+c.width);
 assert(b.top+b.height>=c.y+c.height);
 assert.equal(c.readyForViewer,false);
});
test('pixel limits, invalid mask, origin and style fail closed',()=>{
 const a=mock();
 assert.throws(()=>L.raster({width:0,settings:{softness:5,contactWidth:.1},
  strength:1,shadows:a.sh,canvasFactory:a.canvasFactory}),/Berggeometrie/);
 assert.throws(()=>L.raster({width:120,settings:{softness:-1,contactWidth:.1},
  strength:1,shadows:a.sh,canvasFactory:a.canvasFactory}),/Berggeometrie/);
 assert.throws(()=>L.cast({raster:null,origin:{x:1,y:1}}),/ursprung/);
 assert.throws(()=>L.globalBox({cast:{x:0,y:0,width:99999,height:3}}),/Rastergrenze/);
});
test('real source and browser fixture include independent original shadowLocalMask',()=>{
 const root=path.join(__dirname,'..');
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 const testSource=fs.readFileSync(path.join(__dirname,
  'automated_browser_geography_joint_scenery_20261123.cjs'),'utf8');
 const renderer=fs.readFileSync(path.join(root,'large-map-bake-joint-scenery.js'),'utf8');
 assert(app.includes('function shadowLocalMask(width,settings,global)'));
 assert(testSource.includes('editorLocalMaskSource=fromEditor('));
 assert(testSource.includes("'function shadowLocalMask(width,settings,global){'"));
 assert(testSource.includes('EDITOR_LOCAL_MOUNTAIN_MASK_DIAGNOSTIC'));
 assert(renderer.includes('previewEditorLocalMountainMask=false'));
 assert(renderer.includes('needsFullEditorImageParity:true'));
});

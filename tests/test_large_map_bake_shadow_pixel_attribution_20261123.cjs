'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const S=require('../large-map-bake-shadow-pixel-attribution.js');
const pixels=x=>new Uint8ClampedArray(x);
function fixture(){
 const wb=pixels([10,20,30,255, 40,50,60,255,
   2,2,2,100, 10,10,10,255]);
 const eb=pixels([100,20,30,255, 40,50,60,255,
   2,2,2,100, 10,10,10,255]);
 const ws=pixels([10,20,30,255, 40,50,60,255,
   2,2,2,100, 11,10,10,255]);
 const es=pixels([100,20,30,255, 40,50,61,255,
   2,2,2,100, 10,10,10,255]);
 const mountain=pixels([0,0,0,0, 1,2,3,90,
   0,0,0,0, 1,2,3,90]);
 const ground=pixels([0,0,0,0, 1,2,3,90,
   0,0,0,0, 4,4,4,120]);
 return {width:2,height:2,originX:100,originY:200,
  worldBare:wb,editorBare:eb,worldShaded:ws,editorShaded:es,
  mountainGround:mountain,spriteGround:ground,
  spriteMasks:[
   {ordinal:1,type:'tree',path:'assets/nature/birke1.png',
    x:100,y:200,width:2,height:2,bits:new Uint8Array([0b1011])},
   {ordinal:2,type:'mountain',path:'assets/nature/berg_01.png',
    x:101,y:200,width:1,height:1,bits:new Uint8Array([1])}
  ]};
}
test('actual packed alpha, not bounding boxes, attributes editor-only and world-only shadows',()=>{
 const args=fixture(),r=S.analyze(args);
 assert.equal(r.editorOnlyShadeTouched.count,1);
 assert.equal(r.worldOnlyShadeTouched.count,1);
 assert.equal(r.editorOnlyShadeTouched.multipleSprites,1);
 assert.equal(r.editorOnlyShadeTouched.byTopmost[0].source,
  '2:mountain:assets/nature/berg_01.png');
 assert.equal(r.editorOnlyShadeTouched.ground.mountainOnly,1);
 assert.equal(r.worldOnlyShadeTouched.ground.mountainAndSprite,1);
 assert.equal(r.severeBare.count,1);
 assert.equal(r.severeBare.samples[0].x,0);
 assert.equal(r.severeBare.samples[0].y,0);
 assert.equal(r.severeBare.samples[0].maxDelta,90);
 assert.equal(r.severeShaded.count,1);
 assert.equal(r.editorOnlyShadeTouched.bbox.left,1);
 assert.equal(r.complete,false);
 assert.equal(r.readyForViewer,false);
});
test('transparent mask holes MUST NOT be claimed by a bounding rectangle',()=>{
 const a=fixture();
 assert.equal(S.overlaps(a.spriteMasks[0],100,201),false);
 assert.equal(S.overlaps(a.spriteMasks[0],101,200),true);
 assert.equal(S.overlaps(a.spriteMasks[1],100,200),false);
});
test('auditor rejects wrong RGBA arrays, duplicate ordinals and invalid bitmaps',()=>{
 const a=fixture();
 assert.throws(()=>S.analyze({...a,worldBare:[]}),/sechs/);
 assert.throws(()=>S.analyze({...a,originX:.5}),/globale Pixel/);
 assert.throws(()=>S.analyze({...a,width:5000,height:5000}),/globale Pixel/);
 assert.throws(()=>S.analyze({...a,
  spriteMasks:[a.spriteMasks[0],a.spriteMasks[0]]}),/Sprite-Masken/);
 assert.throws(()=>S.analyze({...a,spriteMasks:[{...a.spriteMasks[0],
  bits:new Uint8Array([1,2])}]}),/Sprite-Masken/);
});
test('browser DIAGNOSTIC and sparse CI wiring is explicit, release flags still blocked',()=>{
 const root=path.join(__dirname,'..');
 const src=fs.readFileSync(path.join(root,'large-map-bake-joint-scenery.js'),'utf8');
 const browser=fs.readFileSync(path.join(__dirname,
  'automated_browser_geography_joint_scenery_20261123.cjs'),'utf8');
 const io=fs.readFileSync(path.join(root,
  '.github/workflows/geography-io-regression.yml'),'utf8');
 assert(src.includes('spriteAlphaMaskBytes'));
 assert(src.includes('editorMountainGround'));
 assert(src.includes('spriteAlphaMasks'));
 assert(browser.includes('VedrasEditorShadowAttribution'));
 assert(browser.includes('EDITOR_SHADOW_SOURCE_ATTRIBUTION'));
 assert(io.includes('large-map-bake-shadow-pixel-attribution.js'));
 assert(src.includes('needsFullEditorImageParity:true'));
 assert(src.includes('complete:false,readyForViewer:false'));
});

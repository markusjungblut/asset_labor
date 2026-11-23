'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const A=require('../large-map-bake-alpha-source-over-ab.js');
function base(){return {width:2,height:1,originX:100,originY:40,
 background:new Uint8ClampedArray([0,0,0,0,10,20,30,255]),
 sprites:[{x:100,y:40,width:2,height:1,
  rgba:new Uint8ClampedArray([255,0,0,128,110,0,0,128])}]};}
test('unpremultiplied SOURCE OVER is deterministic on real 8-bit RGBA arrays',()=>{
 const a=A.render({...base(),mode:'straight-rounded'});
 assert.deepEqual([...a.data],[255,0,0,128,60,10,15,255]);
 assert.equal(a.touched,2);assert.equal(a.patches,1);
 assert.equal(a.complete,false);assert.equal(a.readyForViewer,false);
});
test('quantized premultiplication mode remains independent and bounded',()=>{
 const a=A.render({...base(),mode:'premultiplied-byte'});
 assert.equal(a.data.length,8);
 assert.equal(a.data[3],128);assert.equal(a.data[7],255);
 assert(a.data[4]>=59&&a.data[4]<=61);
});
test('global integer patch positions give identical overlap pixels on adjacent tiles',()=>{
 const single={x:11,y:0,width:2,height:1,rgba:
  new Uint8ClampedArray([30,60,90,100,50,80,20,250])};
 const left=A.render({width:4,height:1,originX:9,originY:0,
  background:new Uint8ClampedArray(16),sprites:[single],mode:'straight-rounded'});
 const right=A.render({width:4,height:1,originX:11,originY:0,
  background:new Uint8ClampedArray(16),sprites:[single],mode:'straight-rounded'});
 assert.deepEqual([...left.data.slice(8,16)],[...right.data.slice(0,8)]);
});
test('failed quality and memory contracts do not affect the production renderer',()=>{
 const x=base();
 assert.throws(()=>A.render({...x,mode:'experimental-publish'}),/Rundungsmodus/);
 assert.throws(()=>A.render({...x,width:2000,height:2000}),/Canvas-Maße/);
 assert.throws(()=>A.render({...x,background:[0,0]}),/Originalhintergrund/);
 assert.throws(()=>A.render({...x,mode:'straight-rounded',
  sprites:[{...x.sprites[0],rgba:new Uint8Array(8)}]}),
  /Sprite-Patch/);
 const js=fs.readFileSync(path.join(__dirname,
  '../large-map-bake-joint-scenery.js'),'utf8');
 assert(js.includes('captureEditorCompositeReference=false'));
 assert(js.includes('readyForViewer:false'));
 assert(!js.includes('VedrasAlphaSourceOverAB.render('));
});

'use strict';
// Art coastlines: HTMLImageElement and transferred ImageBitmap must both work.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
function harness(){
 const calls=[];
 const canvas=()=>({width:0,height:0,getContext(){return {
  clearRect(){},save(){},restore(){},scale(){},beginPath(){},moveTo(){},
  lineTo(){},stroke(){calls.push('temp-stroke')},
  drawImage(img){calls.push('art-image');calls.push(img.tag)},
  createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
  getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
  putImageData(){calls.push('commit-image')}
 }}});
 const window={};vm.runInNewContext(read('shoreline.js'),{
  window,document:{createElement:canvas}
 });
 const cells=[{q:0,r:0,wet:false},{q:1,r:0,wet:true}],
  images=Array(6).fill(null);
 const run=(mode='art')=>window.VedrasShoreline.build(cells,c=>c.wet,images,
  {mode,resolution:.8});
 return {calls,images,run};
}
test('six-PNG mode draws transferred ImageBitmap with width and height',()=>{
 const h=harness();h.images[1]={width:512,height:512,tag:'bitmap-art'};
 const raster=h.run('art');
 assert.ok(raster.canvas);
 assert.equal(raster.missing,0);
 assert.ok(h.calls.includes('bitmap-art'));
 assert.ok(!h.calls.includes('temp-stroke'));
});
test('six-PNG mode draws loaded HTMLImageElement or catalog Canvas',()=>{
 const h=harness();h.images[1]={naturalWidth:512,naturalHeight:512,tag:'html-art'};
 const raster=h.run('art');assert.ok(raster.canvas);
 assert.ok(h.calls.includes('html-art'));
 assert.ok(!h.calls.includes('temp-stroke'));
});
test('missing PNG in art mode never silently renders procedural test coast',()=>{
 const h=harness();const result=h.run('art');
 assert.equal(result.canvas,null);
 assert.equal(result.missing,1);
 assert.deepEqual(Array.from(result.missingSides),[1]);
 assert.ok(!h.calls.includes('temp-stroke'));
});
test('procedural test coast remains available only when explicitly chosen',()=>{
 const h=harness(),r=h.run('temp');
 assert.ok(r.canvas);assert.ok(h.calls.includes('temp-stroke'));
 assert.ok(!h.calls.includes('art-image'));
});
test('editor uses art as default and keys prepared coast cache by selected mode',()=>{
 const app=read('app.js');
 assert.match(app,/shoreline:\{enabled:true,mode:'art'/);
 assert.match(app,/opts\.enabled\+'\|'\+opts\.mode/);
 assert.match(app,/missingSides=opts\.mode==='art'/);
 assert.match(app,/shoreline-art-assets-not-ready/);
 assert.match(app,/state\.shoreline\.mode=e\.target\.value==='temp'\?'temp':'art'/);
 assert.match(app,/function applyShorelineSelection\(\)/);
 assert.match(app,/shorelineChunks\.clear\(\);shorelineCache=\{signature:null,raster:null\}/);
 assert.match(app,/worldTiles\?\.invalidate\(\)/);
});
test('test layouts respect selected shoreline mode and restored mode is normalized',()=>{
 const app=read('app.js');
 assert.ok(!app.includes("state.shoreline.mode='temp';$('shorelineMode').value='temp'"));
 assert.match(app,/state\.shoreline\.mode=state\.shoreline\.mode==='temp'\?'temp':'art'/);
});
test('worker and main thread load the corrected shoreline module',()=>{
 const worker=read('terrain-worker.js'),client=read('terrain-worker-client.js'),
  html=read('index.html');
 assert.match(worker,/shoreline\.js\?v=0\.30\.1&artfix=20261027/);
 assert.match(client,/terrain-worker\.js\?v=0\.30\.2&artfix=20261027/);
 assert.match(html,/shoreline\.js\?v=0\.30\.1&amp;artfix=20261027/);
 assert.match(html,/app\.js\?v=0\.55\.6&amp;step9=20261027/);
});

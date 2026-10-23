'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function imagePool({withCanvas=false}={}){
 const pending=[],clock={value:1000};
 class FakeImage {
  constructor(){this.naturalWidth=1024;this.naturalHeight=1024;this.complete=false;this.onload=null;}
  set src(v){this._src=v;pending.push(this);}
  get src(){return this._src;}
 }
 const sandbox={window:{},Image:FakeImage,performance:{now:()=>clock.value},
  document:withCanvas?{createElement:tag=>{
   assert.equal(tag,'canvas');
   return {width:0,height:0,getContext:()=>({drawImage(){},
    imageSmoothingEnabled:false,imageSmoothingQuality:''})};
  }}:undefined};
 vm.runInNewContext(read('asset-image-pool.js'),sandbox);
 return {Pool:sandbox.window.VedrasImagePool,pending,clock,
  flush:()=>{const img=pending.shift();assert.ok(img);img.complete=true;img.onload();}};
}
const entry=n=>({path:'assets/nature/sprite_'+n+'.png',url:'/assets/sprite_'+n+'.png'});
test('image loading has bounded concurrent decodes, and coalesces duplicate requests',async()=>{
 const {Pool,pending,flush}=imagePool(),pool=Pool.create({parallel:3,maxBytes:256*1024*1024});
 const items=Array.from({length:10},(_,i)=>entry(i));
 const jobs=items.map(a=>pool.ensure(a));
 const duplicate=pool.ensure(items[0]);
 assert.equal(pending.length,3);
 for(let i=0;i<10;i++){
  assert.ok(pending.length<=3);
  flush();
 }
 await Promise.all([...jobs,duplicate]);
 assert.equal(pool.report().ready,10);
 assert.equal(pool.report().active,0);
 assert.equal(pool.report().queued,0);
 assert.ok(items.every(x=>x.img?.naturalWidth===1024));
});
test('image LRU releases old image references under a configurable memory limit',async()=>{
 const {Pool,pending,clock,flush}=imagePool();
 const pool=Pool.create({parallel:4,maxBytes:8*1024*1024,protectMs:100});
 const a=entry(1),b=entry(2),c=entry(3);
 const all=Promise.all([pool.ensure(a),pool.ensure(b),pool.ensure(c)]);
 flush();flush();flush();await all;
 assert.equal(pool.report().ready,3);
 assert.equal(pool.report().decodedBytes,3*1024*1024*4);
 clock.value+=1000;pool.prune();
 assert.ok(pool.report().decodedBytes<=8*1024*1024);
 assert.ok(pool.report().evicted>=1);
 assert.equal(a.img,null);
 // Evicted images can be lazily decoded again when selected.
 const reload=pool.ensure(a);assert.ok(pending.length>0);flush();await reload;
 assert.ok(a.img?.naturalWidth);
});
test('large terrain preview is limited to 512px while PNG export reloads native pixels',async()=>{
 const {Pool,pending,flush}=imagePool({withCanvas:true});
 const pool=Pool.create({parallel:2,maxBytes:192*1024*1024,previewTerrainPx:512});
 const terrain={...entry(20),category:'terrain'};
 const job=pool.ensure(terrain);flush();await job;
 assert.equal(terrain.img.naturalWidth,512);
 assert.equal(terrain.img.naturalHeight,512);
 assert.equal(terrain.sourceDimensions.width,1024);
 assert.equal(pool.report().decodedBytes,512*512*4);
 const preview=terrain.img;
 const exporting=pool.originals([terrain]);
 assert.equal(pending.length,1);
 flush();const restore=await exporting;
 assert.equal(terrain.img.naturalWidth,1024,'final renderer must use original resolution');
 restore();
 assert.equal(terrain.img,preview,'return to compact memory after export');
 assert.equal(pool.report().decodedBytes,512*512*4);
});
function fakeGL(){
 const gl={
  VERTEX_SHADER:1,FRAGMENT_SHADER:2,COMPILE_STATUS:3,LINK_STATUS:4,
  ARRAY_BUFFER:5,DYNAMIC_DRAW:6,FLOAT:7,TEXTURE_2D:8,
  TEXTURE_MIN_FILTER:9,TEXTURE_MAG_FILTER:10,LINEAR:11,
  TEXTURE_WRAP_S:12,TEXTURE_WRAP_T:13,CLAMP_TO_EDGE:14,
  BLEND:15,ONE:16,ONE_MINUS_SRC_ALPHA:17,DEPTH_TEST:18,CULL_FACE:19,
  UNPACK_FLIP_Y_WEBGL:20,UNPACK_PREMULTIPLY_ALPHA_WEBGL:21,
  TEXTURE0:22,RGBA:23,UNSIGNED_BYTE:24,TRIANGLE_STRIP:25,
  MAX_TEXTURE_SIZE:26,COLOR_BUFFER_BIT:27
 };
 const record={uploads:[],vertices:[],draws:0,pixelStore:[]};
 for(const name of ['createShader','createProgram','createVertexArray','createBuffer',
  'createTexture','getUniformLocation'])gl[name]=()=>({});
 for(const name of ['shaderSource','compileShader','attachShader','linkProgram',
  'deleteShader','bindVertexArray','bindBuffer','bufferData',
  'enableVertexAttribArray','vertexAttribPointer','useProgram','uniform1i',
  'enable','disable','blendFunc','pixelStorei','texParameteri','uniform2f',
  'viewport','clearColor','clear','activeTexture','bindTexture','deleteTexture'])
 gl[name]=()=>{};
 gl.pixelStorei=(...args)=>record.pixelStore.push(args);
 gl.getShaderParameter=()=>true;gl.getProgramParameter=()=>true;
 gl.getParameter=()=>8192;
 gl.texImage2D=(...args)=>record.uploads.push(args);
 gl.bufferSubData=(target,at,array)=>record.vertices.push(Array.from(array));
 gl.drawArrays=()=>record.draws++;
 return {gl,record};
}
test('WebGL2 compositor submits camera-snapped geometry and reuses GPU tile textures',()=>{
 const {gl,record}=fakeGL(),canvas={width:0,height:0,style:{},
  addEventListener(){},getContext:kind=>kind==='webgl2'?gl:null};
 const sandbox={window:{}};vm.runInNewContext(read('gpu-terrain.js'),sandbox);
 const gpu=sandbox.window.VedrasGpuTerrain.create(canvas,{maxBytes:64*1024*1024});
 assert.equal(gpu.available(),true);
 assert.equal(gpu.begin({width:800,height:600,dpr:1,zoom:1,projectY:.85,
  originX:300,originY:200}),true);
 const raster={canvas:{width:480,height:480},x:-128,y:-128,width:768,height:768};
 const core={x:0,y:0,size:512};
 assert.equal(gpu.draw(raster,core),true);
 assert.equal(gpu.draw(raster,core),true);
 gpu.end();
 assert.equal(record.draws,2);
 assert.equal(record.uploads.length,1);
 assert.equal(gpu.stats().uploads,1);
 assert.equal(gpu.stats().reused,1);
 const v=record.vertices[0];
 assert.equal(v[0],300);assert.equal(v[1],200);
 assert.equal(v[4],812);assert.equal(v[5],200);
 assert.ok(Math.abs(v[2]-128/768)<1e-5);
 assert.ok(Math.abs(v[3]-128/768)<1e-5);
 assert.ok(Math.abs(v[11]-(128+512)/768)<1e-5);
 assert.ok(record.pixelStore.some(([flag,value])=>flag===gl.UNPACK_FLIP_Y_WEBGL&&value===false),
  'Worker ImageBitmap ignores UNPACK_FLIP_Y_WEBGL; all sources must upload unflipped');
 assert.equal(gpu.stats().textureCount,1);
});
test('GPU feature falls back cleanly when WebGL2 is unavailable',()=>{
 const sandbox={window:{}};vm.runInNewContext(read('gpu-terrain.js'),sandbox);
 const canvas={style:{},getContext:()=>null};
 const gpu=sandbox.window.VedrasGpuTerrain.create(canvas);
 assert.equal(gpu.available(),false);
 assert.equal(gpu.begin({width:20,height:20}),false);
 assert.equal(canvas.style.display,'none');
});
test('actual editor is wired with nonblocking image loading, live GPU controls and CPU export fallback',()=>{
 const app=read('app.js'),html=read('index.html'),css=read('style.css');
 assert.match(app,/window\.VedrasImagePool\.create/);
 assert.match(app,/parallel:4,maxBytes:192\*1024\*1024/);
 assert.match(app,/gpuTerrain\.begin\(/);
 assert.match(app,/gpuFrame&&gpuTerrain\?\.draw\(r,t\)/);
 assert.match(app,/!finalRendering&&state\.view==='map'/);
 assert.match(app,/imagePool\.ensure\(a/);
 assert.doesNotMatch(app,/await Promise\.all\(assets\.map\(a=>new Promise/);
 assert.match(html,/id="gpuCanvas"/);
 assert.match(html,/id="gpuTerrain"/);
 assert.match(css,/#canvasOuter>#gpuCanvas/);
 assert.match(html,/asset-image-pool\.js\?v=/);
 assert.match(html,/gpu-terrain\.js\?v=/);
});

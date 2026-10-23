'use strict';
/* Run: node --test tests/test_static_scene_v016_20261023.cjs */
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
function setup(options={}){
 const images=[],rendered=[],main=[];
 let now=0;
 const document={createElement(type){
  assert.equal(type,'canvas');
  const bitmap={width:0,height:0};
  bitmap.getContext=()=>({setTransform(){},drawImage(){}});
  images.push(bitmap);return bitmap;
 }};
 const sandbox={window:{},document,performance:{now:()=>++now}};
 vm.runInNewContext(read('static-object-layer.js'),sandbox);
 const layer=sandbox.window.VedrasStaticObjects.create(options);
 const ctx={drawImage:(...args)=>main.push(args)};
 const render=({ctx,width,height,offscreen})=>{
  rendered.push({ctx,width,height,offscreen});
 };
 const view={width:1000,height:600,dpr:1,zoom:.5,panX:0,panY:0};
 const paint=(change={},extras={})=>layer.paint({
  ctx,view:{...view,...change},signature:'scene-a',drawScene:render,...extras
 });
 return {layer,paint,images,rendered,main};
}
test('static scenery is built once and translated on subsequent camera pans',()=>{
 const s=setup();
 const a=s.paint(),b=s.paint({panX:100,panY:-80});
 assert.equal(s.rendered.length,1);
 assert.equal(s.images.length,1);
 assert.equal(a.cached,false);
 assert.equal(b.cached,true);
 assert.equal(s.main.length,2);
 assert.equal(s.main[1][1]-s.main[0][1],100);
 assert.equal(s.main[1][2]-s.main[0][2],-80);
 assert.equal(s.layer.stats().hits,1);
});
test('zoom and scene signatures force a fresh source resolution/scene raster',()=>{
 const s=setup();
 s.paint();
 assert.equal(s.paint({zoom:.8}).rebuilt,true);
 assert.equal(s.paint({zoom:.8},{signature:'scene-edited'}).rebuilt,true);
 assert.equal(s.rendered.length,3);
});
test('panning beyond raster overscan triggers rebuild before missing object pixels',()=>{
 const s=setup({padding:220});
 s.paint();
 assert.equal(s.paint({panX:100}).cached,true);
 assert.equal(s.paint({panX:350}).cached,false);
 assert.equal(s.rendered.length,2);
});
test('oversized view uses direct Canvas2D fallback without allocating an enormous cache',()=>{
 const s=setup({maxPixels:1000});
 const info=s.paint();
 assert.equal(info.mode,'direct');
 assert.equal(s.rendered.length,1);
 assert.equal(s.rendered[0].offscreen,false);
 assert.equal(s.layer.stats().active,false);
});
test('GPU reuses one scene texture between pans and Canvas2D remains fallback',()=>{
 const s=setup();
 let uploads=0,draws=0,hidden=0;
 const gpu={draw(source){draws++;if(draws===1)uploads++;return true;},
  hide(){hidden++}};
 assert.equal(s.paint({},{gpu,preferGpu:true}).mode,'webgl');
 assert.equal(s.paint({panY:50},{gpu,preferGpu:true}).mode,'webgl');
 assert.equal(s.main.length,0);
 assert.equal(uploads,1);
 assert.equal(s.paint({panX:60},{gpu,preferGpu:false}).mode,'canvas');
 assert.equal(s.main.length,1);
 assert.equal(hidden,1);
});
test('shadow profile updates advance the invalidation generation',()=>{
 const sandbox={window:{addEventListener(){}}};
 vm.runInNewContext(read('sprite-shadow-editor.js'),sandbox);
 const engine=sandbox.window.VedrasSpriteShadows;
 const before=engine.revision();
 engine.set(engine.get());
 assert.equal(engine.revision(),before+1);
});
test('actual GPU compositor uploads once for pans and reuploads changed source',()=>{
 const observed={uploads:0,draws:0};
 const gl={
  VERTEX_SHADER:1,FRAGMENT_SHADER:2,COMPILE_STATUS:3,LINK_STATUS:4,
  ARRAY_BUFFER:5,DYNAMIC_DRAW:6,FLOAT:7,TEXTURE_2D:8,TEXTURE_MIN_FILTER:9,
  TEXTURE_MAG_FILTER:10,LINEAR:11,TEXTURE_WRAP_S:12,TEXTURE_WRAP_T:13,
  CLAMP_TO_EDGE:14,UNPACK_FLIP_Y_WEBGL:15,UNPACK_PREMULTIPLY_ALPHA_WEBGL:16,
  DEPTH_TEST:17,CULL_FACE:18,MAX_TEXTURE_SIZE:19,RGBA:20,
  UNSIGNED_BYTE:21,TEXTURE0:22,COLOR_BUFFER_BIT:23,TRIANGLE_STRIP:24,
  createShader:()=>({}),shaderSource(){},compileShader(){},
  getShaderParameter:()=>true,getShaderInfoLog:()=>'',createProgram:()=>({}),
  attachShader(){},linkProgram(){},deleteShader(){},
  getProgramParameter:()=>true,getProgramInfoLog:()=>'',createVertexArray:()=>({}),
  bindVertexArray(){},createBuffer:()=>({}),bindBuffer(){},bufferData(){},
  enableVertexAttribArray(){},vertexAttribPointer(){},
  getUniformLocation:()=>({}),useProgram(){},uniform1i(){},disable(){},
  pixelStorei(){},createTexture:()=>({}),bindTexture(){},texParameteri(){},
  texImage2D(){observed.uploads++},deleteTexture(){},viewport(){},
  clearColor(){},clear(){},uniform2f(){},activeTexture(){},bufferSubData(){},
  drawArrays(){observed.draws++},getParameter:()=>8192
 };
 const canvas={style:{},width:0,height:0,addEventListener(){},
  getContext:type=>type==='webgl2'?gl:null};
 const sandbox={window:{}};
 vm.runInNewContext(read('gpu-sprite-layer.js'),sandbox);
 const gpu=sandbox.window.VedrasGpuSprites.create(canvas);
 assert.equal(gpu.available(),true);
 const first={width:1600,height:1200},second={width:1600,height:1200};
 const view={width:1000,height:600,dpr:1,dx:0,dy:-300};
 assert.equal(gpu.draw(first,view),true);
 assert.equal(gpu.draw(first,{...view,dx:80}),true);
 assert.equal(observed.uploads,1);
 assert.equal(observed.draws,2);
 assert.equal(gpu.draw(second,view),true);
 assert.equal(observed.uploads,2);
 gpu.hide();
 assert.equal(canvas.style.display,'none');
});

test('integration retains export quality and editor overlays on direct renderer',()=>{
 const app=read('app.js'),html=read('index.html'),style=read('style.css'),server=read('server.py');
 assert.match(app,/if\(finalRendering\)blockers\.push\('Final-PNG-Export'\)/);
 assert.match(app,/if\(!state\.objects\)blockers\.push\('Objekte ausgeblendet'\)/);
 assert.match(app,/drawScene:\(\{ctx:layerCtx,width,height\}\)=>/);
 assert.match(app,/try\{\s*ctx=layerCtx;W=width;H=height;/);
 assert.match(app,/finally\{ctx=originalCtx;W=originalW;H=originalH;\}/);
 assert.match(app,/window\.VedrasStaticObjects\.create/);
 assert.match(app,/sceneryProfile\.cached/);
 assert.match(html,/id="gpuSpriteCanvas"/);
 assert.match(html,/id="gpuSprites"/);
 assert.ok(html.indexOf('static-object-layer.js')<html.indexOf('app.js'));
 assert.ok(html.indexOf('gpu-sprite-layer.js')<html.indexOf('app.js'));
 assert.match(style,/#canvasOuter>#gpuSpriteCanvas\{[^}]*pointer-events:none/);
 assert.match(server,/VERSION = '0\.\d+\.\d+'/);
 assert.match(server,/key = parsed\.path\[len\(prefix\):\]/);
 assert.doesNotMatch(server,/\.removeprefix\(/);
});

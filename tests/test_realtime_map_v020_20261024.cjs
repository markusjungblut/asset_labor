'use strict';
/* node --test tests/test_realtime_map_v020_20261024.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function setup({maxTiles=32,maxPixels=250000}={}){
 const calls=[],canvas={width:0,height:0,style:{}},ctx={
  setTransform:(...args)=>calls.push(['transform',...args]),
  clearRect:(...args)=>calls.push(['clear',...args]),
  fillRect:(...args)=>calls.push(['fill',...args]),
  drawImage:(...args)=>calls.push(['image',...args]),
  save:()=>calls.push(['save']),restore:()=>calls.push(['restore'])
 };
 canvas.getContext=type=>{assert.equal(type,'2d');return ctx};
 let ms=0;const sandbox={window:{},performance:{now:()=>++ms}};
 vm.runInNewContext(read('realtime-map-renderer.js'),sandbox);
 const m=sandbox.window.VedrasRealtimeMap.create({canvas,maxTiles,maxPixels});
 const image=(w,h)=>({width:w,height:h});
 const view=(overrides={})=>({width:100,height:100,dpr:1,
  zoom:1,panX:0,panY:0,projectY:.85,...overrides});
 const snapshot=({role='ground',zoom=1,panX=0,panY=0,dpr=1,pad=20,
  width=100,height=100}={})=>({role,canvas:image((width+pad*2)*dpr,
   (height+pad*2)*dpr),width,height,dpr,pad,zoom,panX,panY});
 return {m,canvas,calls,image,view,snapshot};
}
test('fast compositor uses 9-argument cropped blit for a padded 2D ground raster',()=>{
 const s=setup();s.m.setSnapshots([s.snapshot()]);
 const output=s.m.render(s.view());assert.equal(output.coverage,1);
 const imgs=s.calls.filter(c=>c[0]==='image');
 assert.equal(imgs.length,1);
 const [,img,sx,sy,sw,sh,dx,dy,dw,dh]=imgs[0];
 assert.equal(sx,20);assert.equal(sy,20);assert.equal(sw,100);assert.equal(sh,100);
 assert.equal(dx,0);assert.equal(dy,0);assert.equal(dw,100);assert.equal(dh,100);
});
test('camera pans prepared scenery without invoking geometry or rebuilding its canvas',()=>{
 const s=setup();
 s.m.setSnapshots([s.snapshot(),s.snapshot({role:'scenery'})]);
 s.m.render(s.view());const beforeWidth=s.canvas.width;
 s.calls.length=0;s.m.render(s.view({panX:10,panY:-8}));
 assert.equal(s.canvas.width,beforeWidth);
 assert.equal(s.calls.filter(c=>c[0]==='image').length,2);
 const [,im,sx,sy,sw,sh,dx,dy]=s.calls.find(c=>c[0]==='image');
 assert.equal(sx,10);assert.equal(sy,28);assert.equal(dx,0);assert.equal(dy,0);
});
test('zoom/pinch scales prepared world artwork around projected camera origin',()=>{
 const s=setup();s.m.setSnapshots([s.snapshot()]);
 s.m.render(s.view({zoom:2}));
 const image=s.calls.find(c=>c[0]==='image');
 assert.equal(image[2],45);assert.equal(image[4],50);assert.equal(image[6],0);
});
test('different DPR changes destination buffer but preserves logical world alignment',()=>{
 const s=setup();s.m.setSnapshots([s.snapshot({dpr:2})]);
 const result=s.m.render(s.view({dpr:1.5}));
 assert.ok(result);assert.equal(s.canvas.width,150);
 assert.equal(s.canvas.height,150);
 assert.equal(s.calls.find(c=>c[0]==='transform')[1],1.5);
 assert.equal(s.calls.find(c=>c[0]==='image')[2],40);
});
test('outside a cached map footprint the compositor never attempts invalid source rects',()=>{
 const s=setup();s.m.setSnapshots([s.snapshot()]);
 const out=s.m.render(s.view({panX:1000}));
 assert.equal(out.coverage,0);
 assert.equal(s.calls.filter(c=>c[0]==='image').length,0);
 assert.equal(s.calls.filter(c=>c[0]==='fill').length,1);
});
test('transparent scenery does not increase ground coverage',()=>{
 const s=setup();s.m.setSnapshots([s.snapshot({role:'ground',pad:0}),
  s.snapshot({role:'scenery',pad:0})]);
 const out=s.m.render(s.view({panX:50}));
 assert.equal(out.coverage,.5);
});
test('invalid source snapshots are ignored and invalid render views are rejected',()=>{
 const s=setup();
 assert.equal(s.m.setSnapshots([{role:'ground',canvas:{width:0,height:0}}]),0);
 assert.equal(s.m.snapshotReady(),false);
 assert.equal(s.m.render(s.view({zoom:0})),false);
 assert.equal(s.m.stats().draws,0);
});
test('world-space tiles paint only the visible area without invoking the terrain generator',()=>{
 const s=setup();
 s.m.putTile({id:'0,0',layer:'terrain',image:s.image(32,32),
  x:-20,y:-20,width:40,height:40});
 s.m.putTile({id:'far',layer:'terrain',image:s.image(32,32),
  x:10000,y:10000,width:40,height:40});
 const out=s.m.render(s.view());
 assert.equal(out.drawn,1);
 assert.equal(s.calls.filter(c=>c[0]==='image').length,1);
 assert.equal(s.m.stats().mode,'tiles');
});
test('layer order keeps prepared ground behind scenery and units',()=>{
 const s=setup();
 for(const layer of ['units','scenery','terrain'])
  s.m.putTile({id:layer,layer,image:{width:10,height:10,source:layer},
   x:0,y:0,width:20,height:20});
 s.m.render(s.view());
 assert.deepEqual(s.calls.filter(c=>c[0]==='image').map(c=>c[1].source),
  ['terrain','scenery','units']);
});
test('dynamic overlays render after static tiles and do not change their cached pixels',()=>{
 const s=setup();
 s.m.putTile({id:'ground',layer:'ground',image:s.image(20,20),
  x:-50,y:-50,width:100,height:100});
 let dynamic=0;
 s.m.render(s.view(),{drawDynamic:()=>{dynamic++}});
 s.m.render(s.view(),{drawDynamic:()=>{dynamic++}});
 assert.equal(dynamic,2);assert.equal(s.m.stats().tiles,1);
});
test('LRU evicts offscreen tiles and only closes owned transferred resources',()=>{
 const s=setup({maxTiles:2,maxPixels:200});
 let closed=0;
 for(const id of ['a','b','c'])
  s.m.putTile({id,layer:'terrain',image:{width:8,height:8,
   close:()=>closed++},owned:id!=='b',x:1000,y:1000,width:50,height:50});
 assert.equal(s.m.stats().tiles,2);
 assert.equal(closed,1);
 assert.equal(s.m.stats().tileBytes,2*8*8*4);
});
test('removeTile and clear release owned canvases but preserve shared images',()=>{
 const s=setup();let closed=0;
 s.m.putTile({id:'owned',layer:'terrain',image:{width:2,height:2,
  close:()=>closed++},owned:true,x:0,y:0,width:10,height:10});
 s.m.putTile({id:'shared',layer:'terrain',image:{width:2,height:2,
  close:()=>closed++},x:0,y:0,width:10,height:10});
 assert.equal(s.m.removeTile('terrain','owned'),true);
 s.m.clear();assert.equal(closed,1);
 assert.equal(s.m.stats().tiles,0);
});
test('show/hide changes only compositor visibility, preserving its sources',()=>{
 const s=setup();s.m.setSnapshots([s.snapshot()]);
 s.m.show();assert.equal(s.canvas.style.display,'block');
 s.m.hide();assert.equal(s.canvas.style.display,'none');
 assert.equal(s.m.snapshotReady(),true);
});
test('v0.20 app runs a fast animation frame without invoking heavy editor draw on pointermove',()=>{
 const app=read('app.js'),html=read('index.html'),css=read('style.css');
 const module=read('realtime-map-renderer.js'),staticSource=read('static-object-layer.js');
 assert.match(app,/if\(\(fastInteracting\|\|tileModeActive\)&&!finalRendering\)\{fastRender\(\);return;\}/);
 assert.match(app,/function draw\(\)\{\s*if\(\(fastInteracting\|\|tileModeActive\)&&!finalRendering\)/);
 assert.match(app,/realtimeMap\.render\(fastView\(\)/);
 assert.match(app,/realtimeMap\.setSnapshots\(\[/);
 assert.match(app,/endFastCamera\(moved\)/);
 assert.match(app,/fastWheelTimer=setTimeout\(\(\)=>\{/);
 assert.match(app,/chunks\.setInteractive\(true\)/);
 assert.match(app,/chunks\.setInteractive\(false\)/);
 assert.match(staticSource,/function snapshot\(\)/);
 assert.match(html,/id="fastCamera" checked/);
 assert.match(html,/id="realtimeCanvas"/);
 assert.match(html,/realtime-map-renderer\.js\?v=0\.1\.\d+/);
 assert.ok(html.indexOf('realtime-map-renderer.js')<html.indexOf('app.js'));
 assert.match(css,/#canvasOuter>#realtimeCanvas\{/);
 assert.match(css,/pointer-events:none;display:none/);
 assert.match(module,/function putTile\(input\)/);
});
test('full quality PNG path and existing scene exports bypass live preview',()=>{
 const app=read('app.js'),server=read('server.py');
 assert.match(app,/if\(!finalRendering&&!gpuFrame&&!state\.gpuSprites&&/);
 assert.match(app,/finalRendering=true;resize\(\);requestDraw\(\)/);
 assert.match(app,/canvas\.toBlob\(/);
 assert.match(app,/function exportScene\(\)/);
 assert.match(app,/fastCamera:true/);
 assert.match(app,/'worldStreaming','fastCamera','materialScales'/);
 assert.match(app,/realtimeStats:\(\)=>/);
 assert.match(server,/VERSION = '0\.2[01]\.\d+'/);
 assert.doesNotMatch(server,/\.removeprefix\(/);
});

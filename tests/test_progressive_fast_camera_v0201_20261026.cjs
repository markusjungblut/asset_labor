'use strict';
/* node --test tests/test_progressive_fast_camera_v0201_20261026.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function setup(){
 const calls=[],canvas={width:0,height:0,style:{}};
 const ctx={
  setTransform:(...v)=>calls.push(['setTransform',...v]),
  clearRect:(...v)=>calls.push(['clearRect',...v]),
  fillRect:(...v)=>calls.push(['fillRect',...v]),
  drawImage:(...v)=>calls.push(['drawImage',...v]),
  save:()=>calls.push(['save']),restore:()=>calls.push(['restore']),
  beginPath:()=>calls.push(['beginPath']),rect:(...v)=>calls.push(['rect',...v]),
  moveTo:(...v)=>calls.push(['moveTo',...v]),
  lineTo:(...v)=>calls.push(['lineTo',...v]),
  closePath:()=>calls.push(['closePath']),
  fill:()=>calls.push(['fill']),clip:()=>calls.push(['clip'])
 };
 canvas.getContext=()=>ctx;
 const sandbox={window:{},performance:{now:()=>5}};
 vm.runInNewContext(read('realtime-map-renderer.js'),sandbox);
 const m=sandbox.window.VedrasRealtimeMap.create({canvas});
 const view={width:100,height:100,dpr:1,zoom:1,panX:0,panY:0,projectY:.85};
 const image=(w=140,h=140)=>({width:w,height:h});
 const ground={role:'ground',canvas:image(),width:100,height:100,dpr:1,
  pad:20,zoom:1,panX:0,panY:0};
 const scenery={...ground,role:'scenery',canvas:image(170,170)};
 return {m,calls,view,ground,scenery,image};
}
test('v0.20.1 clips scenery to actual terrain footprint instead of displaying floating trees',()=>{
 const s=setup();s.m.setSnapshots([s.ground,s.scenery]);
 s.m.render({...s.view,panX:55});
 const images=s.calls.filter(c=>c[0]==='drawImage');
 assert.equal(images.length,2);
 const sceneryDrawIndex=s.calls.findIndex(c=>c[0]==='drawImage'&&c[1]===s.scenery.canvas);
 const clipIndex=s.calls.findIndex(c=>c[0]==='clip');
 assert.ok(clipIndex>0&&clipIndex<sceneryDrawIndex,'scenery must be clipped first');
 const groundRect=s.calls.find(c=>c[0]==='rect');
 assert.equal(groundRect[1],35);
});
test('terrain raster becomes visible on the frame after it completes, without full editor repaint',()=>{
 const s=setup();s.m.setSnapshots([s.ground,s.scenery]);
 const grass=s.image(100,100);
 const t={tile:{id:'1,0',x:256,y:0,size:512},
  artwork:{raster:{canvas:grass,x:256,y:0,width:512,height:512}}};
 const out=s.m.render({...s.view,panX:-265,zoom:1},{
  terrainPieces:[t]});
 assert.ok(out.drawn>=2);
 assert.ok(s.calls.some(c=>c[0]==='drawImage'&&c[1]===grass),
  'ready chunk should draw as soon as the fast compositor runs');
 assert.ok(s.calls.some(c=>c[0]==='rect'&&c[1]===256&&c[2]===0&&c[3]===512),
  'chunk paint must respect exclusive core bounds');
});
test('new pieces keep water below relief for geometrically identical world positions',()=>{
 const s=setup();s.m.setSnapshots([s.ground]);
 const water=s.image(32,32),land=s.image(32,32);
 const t={tile:{x:0,y:0,size:512},artwork:{
  raster:{waterLayer:{canvas:water,x:0,y:0,width:512,height:512}},
  relief:{canvas:land,x:0,y:0,width:512,height:512}}};
 s.m.render({...s.view,panX:-170}, {terrainPieces:[t]});
 const a=s.calls.filter(c=>c[0]==='drawImage').map(c=>c[1]);
 assert.ok(a.indexOf(water)>=0&&a.indexOf(land)>a.indexOf(water));
});
test('new tile versions fill holes INSIDE an older cached background during the gesture',()=>{
 const s=setup();s.m.setSnapshots([s.ground,s.scenery]);
 const raster=s.image(32,32);
 const tile={tile:{id:'0,0',x:-20,y:-20,size:50},
  artwork:{version:2,raster:{canvas:raster,x:-20,y:-20,width:50,height:50}}};
 s.m.setRenderedVersions([['0,0',1]]);
 s.m.render(s.view,{terrainPieces:[tile]});
 assert.ok(s.calls.some(c=>c[0]==='drawImage'&&c[1]===raster),
  'new terrain revision must be painted through a stale fullscreen background');
 const t=setup();t.m.setSnapshots([t.ground,t.scenery]);
 t.m.setRenderedVersions([['0,0',2]]);
 t.m.render(t.view,{terrainPieces:[tile]});
 assert.equal(t.calls.filter(c=>c[0]==='drawImage'&&c[1]===raster).length,0,
  'a tile already present inside the background must not draw twice');
});
test('coarse biome fallback uses hex polygons and is fully covered by prepared ground artwork',()=>{
 const s=setup();s.m.setSnapshots([s.ground]);
 assert.equal(s.m.setPreviewCells([{x:0,y:0,radius:147,water:true}]),1);
 s.m.render(s.view);
 assert.ok(s.calls.filter(c=>c[0]==='lineTo').length>=5);
 const fallback=s.calls.findIndex(c=>c[0]==='fill');
 const terrain=s.calls.findIndex(c=>c[0]==='drawImage');
 assert.ok(fallback>=0&&fallback<terrain,'fallback must be behind detailed imagery');
});
test('unchanged snapshot still renders during pan when no streaming pieces exist',()=>{
 const s=setup();s.m.setSnapshots([s.ground,s.scenery]);
 const r=s.m.render({...s.view,panX:5});
 assert.ok(r.coverage>0);assert.equal(s.calls.filter(c=>c[0]==='drawImage').length,2);
});
test('v0.20.1 urgent terrain requests run during gesture while idle prefetch remains paused',()=>{
 const src=read('app.js'),chunk=read('chunks.js');
 assert.match(src,/terrainChunks\.prime\(bounds,\{prefetch:\{enabled:false\},notifyReady:false\}\)/);
 assert.match(src,/terrainChunks\.readyTiles\(bounds,\{limit:100\}\)/);
 assert.match(src,/realtimeMap\.render\(fastView\(\),\{terrainPieces:ready\}\)/);
 assert.match(src,/if\(now-fastLastPrime>90\)/);
 assert.match(src,/chunks\.setInteractive\(true\)/);
 assert.match(chunk,/function readyTiles\(bounds,\{limit=100\}=\{\}\)/);
 assert.match(chunk,/notifyReady=true/);
 assert.match(chunk,/if\(unseenReady&&notifyReady\)/);
 assert.match(chunk,/return \{configure,draw,prime,readyTiles,/);
});
test('precise export and editor refresh stay available after gesture release',()=>{
 const app=read('app.js'),html=read('index.html'),server=read('server.py');
 assert.match(app,/if\(repair\)\{/);
 assert.match(app,/finalRendering=true;resize\(\);requestDraw\(\)/);
 assert.match(app,/canvas\.toBlob\(/);
 assert.match(app,/realtimeMap\.setPreviewCells\(worldCells\.map/);
 assert.match(html,/Asset-Labor v0\.22\.5/);
 assert.match(html,/realtime-map-renderer\.js\?v=0\.1\.1/);
 assert.match(server,/VERSION = '0\.22\.5'/);
});
test('future fog contract: unknown / loading / explored-dimmed states not faked as authoritative here',()=>{
 const src=read('realtime-map-renderer.js');
 assert.match(src,/v0\.21 will replace it with a/);
 assert.match(read('world-tile-streamer.js'),/fogHex\(c,view/);
 assert.doesNotMatch(src,/visibleByPlayer|discoveredByPlayer|serverAuthorization/);
});

'use strict';
// Zoom/cloud and coastline completion regressions.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const tile={id:'0,0',x:0,y:0,size:512};
function readiness(){
 const source=read('app.js'),start=source.indexOf('function shorelineTileStatus('),
  end=source.indexOf('function worldTileSnapshotDensity(',start);
 assert.ok(start>0&&end>start);
 const shoreline={segments:[{center:{x:250,y:250}}]};
 const painted=new Map(),artwork={version:7},ready=[];
 const ctx={state:{shoreline:{enabled:true},chunkRendering:true,sceneSize:397,
  objects:false},shorelineCache:shoreline,
  shorelineChunks:{readyTiles:()=>ready,paintedVersions:()=>painted},
  terrainChunks:{paintedVersions:()=>new Map([['0,0',12]])},
  currentTerrainCore:()=>({artwork:{version:12}}),
  paintedTerrainCore:()=>({artwork:{version:12}}),
  imagePool:{},window:{}};
 const funcs=vm.runInNewContext(source.slice(start,end)+
  ';({shorelineTileStatus,tileArtworkStatus,tileArtworkReady});',ctx);
 return {ctx,funcs,ready,painted,artwork,shoreline};
}
test('coastal world tile blocks until the exact shoreline raster is ready',()=>{
 const h=readiness(),info={};
 assert.equal(h.funcs.tileArtworkStatus(tile,info),false);
 assert.equal(info.reason,'shoreline-chunk-not-ready');
 h.ready.push({tile,artwork:h.artwork});
 assert.equal(h.funcs.tileArtworkReady(tile),false,
  'a built but unpainted shore cannot be reused from a scene snapshot');
 assert.equal(h.funcs.tileArtworkStatus(tile,null,true),true,
  'a directly painted tile can use an already built source');
 h.painted.set(tile.id,7);
 assert.equal(h.funcs.tileArtworkReady(tile),true);
});
test('shoreline-free tiles do not wait for unrelated coastal raster jobs',()=>{
 const h=readiness();
 h.shoreline.segments[0].center={x:2000,y:2000};
 assert.equal(h.funcs.tileArtworkReady(tile),true);
});
test('disabled shoreline overlay does not block the world compositor',()=>{
 const h=readiness();h.ctx.state.shoreline.enabled=false;
 assert.equal(h.funcs.tileArtworkReady(tile),true);
});
test('finished ground and scenery are composited fully opaque on the first frame',()=>{
 const calls=[],g={setTransform(){},clearRect(){},save(){},restore(){},
  beginPath(){},closePath(){},clip(){},fill(){},fillRect(){},
  moveTo(){},lineTo(){},drawImage(){calls.push(this.globalAlpha)}};
 const sandbox={window:{},performance:{now:()=>1000}};
 vm.runInNewContext(read('world-tile-streamer.js'),sandbox);
 const stream=sandbox.window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>g},source:null,requireScenery:true
 });
 assert.equal(stream.seed(tile,'mid',{complete:true,layers:[
  {layer:'ground',image:{width:512,height:435}},
  {layer:'scenery',image:{width:640,height:540},pad:64}
 ]}),true);
 const view={width:900,height:600,zoom:.7,dpr:1,panX:0,panY:0,projectY:.85};
 stream.request(view,[{...tile,visibility:'visible'}]);
 const r=stream.render(view);
 assert.equal(r.drawn,2);
 assert.deepEqual(calls,[1,1]);
});
test('tile source re-arms on shoreline chunk completion and zoom cache versions change',()=>{
 const app=read('app.js'),html=read('index.html');
 const a=app.indexOf('function drawShorelines()'),
  b=app.indexOf('// A forest is overlaid',a);
 assert.match(app.slice(a,b),/worldTiles\?\.terrainReady\(tile\.id\)/);
 assert.match(app,/shorelineChunks\.prime\(bounds/);
 assert.match(html,/artfix=20261027/);
});

'use strict';
/* Diagnostic-only regression. Run: node --test tests/test_tile_diagnostics_v023_step2_20261027.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
function chunkHarness(build){
 const urgent=[],ctx={window:{},performance:{now:()=>10},console:{error(){}},
  setTimeout:f=>{urgent.push(f);return urgent.length},
  requestIdleCallback:f=>{urgent.push(f);return urgent.length}};
 vm.runInNewContext(read('chunks.js'),ctx);
 const c=ctx.window.VedrasChunks.create();
 const configure=s=>c.configure(s,{worldCells:[{q:0,r:0}],diagnosticLod:'near',
  buildTile:build,redraw(){}});
 configure('a');
 const prime=()=>c.prime({x:-20,y:-20,width:40,height:40});
 const pump=()=>{let n=0;while(urgent.length&&n++<30)urgent.shift()();};
 return {c,configure,prime,urgent,pump};
}
function worldHarness(source){
 const sandbox={window:{},performance:{now:()=>1},console:{warn(){}}};
 vm.runInNewContext(read('world-tile-streamer.js'),sandbox);
 const w=sandbox.window.VedrasWorldTiles.create({canvas:{getContext:()=>({})},source});
 return {w,view:{width:600,height:500,dpr:1,zoom:1,panX:0,panY:0},
  tile:{id:'0,0',x:0,y:0,size:512,visibility:'visible'}};
}
test('terrain exposes queue, cached-empty result, epoch, LOD and cache versions',()=>{
 const h=chunkHarness(()=>null);h.prime();
 assert.ok(h.c.diagnostics().queuedVisible>0);
 assert.ok(h.c.diagnostics().tiles.some(t=>t.state==='queued-visible'));
 h.pump();const d=h.c.diagnostics();
 assert.equal(d.queuedVisible,0);
 assert.equal(d.lod,'near');
 assert.ok(d.tiles.every(t=>t.state==='cached-empty'));
 assert.ok(d.recent.some(t=>t.status==='empty-result'));
 assert.ok(d.tiles.every(t=>Number.isInteger(t.rasterVersion)));
});
test('terrain tracks in-flight, obsolete epochs, and errors',async()=>{
 let resolve;
 const h=chunkHarness(()=>new Promise(ok=>resolve=ok));h.prime();h.urgent.shift()();
 assert.ok(h.c.diagnostics().tiles.some(t=>t.state==='building'&&t.startedAt!==null));
 h.configure('changed');resolve({raster:{canvas:{width:8,height:8,close(){}}}});
 await flush();
 assert.equal(h.c.stats().cached,0);
 assert.ok(h.c.diagnostics().recent.some(t=>t.status==='obsolete'));
 const fail=chunkHarness(()=>{throw Error('sample terrain exception')});
 fail.prime();fail.pump();assert.ok(fail.c.diagnostics().errors>0);
 assert.ok(fail.c.diagnostics().recent.some(t=>t.error==='sample terrain exception'));
});
test('world tile exposes source-null and failed loaders without repairing them',async()=>{
 let resolve;const h=worldHarness(()=>new Promise(ok=>resolve=ok));
 h.w.request(h.view,[h.tile]);
 assert.equal(h.w.diagnostics().tiles[0].state,'running');
 await flush();resolve(null);await flush();
 let d=h.w.diagnostics();
 assert.equal(d.tiles[0].state,'source-null');
 assert.equal(d.tiles[0].lastOutcome,'source-null');
 assert.equal(d.queued,0);assert.equal(d.running,0);
 const fail=worldHarness(()=>{throw Error('sample tile exception')});
 fail.w.request(fail.view,[fail.tile]);await flush();
 d=fail.w.diagnostics();
 assert.equal(d.tiles[0].state,'failed');
 assert.match(d.tiles[0].lastError,/sample tile exception/);
});
test('artwork inspector distinguishes terrain and sprite gates without requesting images',()=>{
 const source=read('app.js'),a=source.indexOf('function tileArtworkReady(t){'),
  b=source.indexOf('\nfunction seedReadyWorldTiles()',a);
 assert.ok(a>=0&&b>a);
 let terrain=null,requested=0;const asset={img:null};
 const env={paintedTerrainCore:()=>terrain,currentTerrainCore:()=>terrain,
  terrainChunks:{paintedVersions:()=>new Map([['0,0',1]])},
  state:{objects:true,natureInstances:[{q:0,r:0,assetPath:'pine'}],
   mountainInstances:[],hexObject:{}},axialPos:()=>({x:0,y:0}),
  assetByPath:new Map([['pine',asset]]),imagePool:{ensure:()=>requested++}};
 const f=vm.runInNewContext(source.slice(a,b)+';({tileArtworkStatus,tileArtworkReady});',env);
 const t={id:'0,0',x:0,y:0,size:512};let d={};
 assert.equal(f.tileArtworkStatus(t,d),false);
 assert.equal(d.reason,'terrain-core-not-ready');
 terrain={artwork:{version:1}};d={};
 assert.equal(f.tileArtworkStatus(t,d),false);
 assert.equal(d.reason,'sprite-source-not-ready');
 assert.equal(requested,0);
 f.tileArtworkReady(t);assert.equal(requested,1);
 asset.img={naturalWidth:2};d={};
 assert.equal(f.tileArtworkStatus(t,d),true);
 assert.equal(d.reason,'ready');
});

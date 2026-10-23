'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

function harness(initialKeys=[]){
 const key='a'.repeat(64),served=[],events=[];
 class Picture{
  naturalWidth=8;naturalHeight=6;decoding='async';
  set src(v){this.url=v;queueMicrotask(()=>this.onload?.());}
 }
 const fakeManifest={schemaVersion:2,key,land:{
  x:-20,y:20,width:16,height:12,density:.5,
  file:'precomputed/terrain/aa/'+key+'.land.png'
 },water:null};
 const requests=async (url,opts={})=>{
  served.push({url,opts});
  if(url==='/api/static-terrain-index')return {ok:true,json:async()=>({schemaVersion:2,keys:initialKeys})};
  if(url==='/api/static-terrain/'+key)return {ok:true,json:async()=>fakeManifest};
  if(opts.method==='POST')return {ok:true,json:async()=>({stored:true})};
  throw Error('Unexpected fetch URL: '+url);
 };
 const sandbox={window:{},crypto:{subtle:{digest:async(_,bytes)=>new Uint8Array(32).fill(bytes.length%20).buffer}},
  TextEncoder:class{encode(s){return Uint8Array.from([...s].map(c=>c.charCodeAt(0))) }},
  Image:Picture,fetch:requests,setTimeout:fn=>fn(),
  requestIdleCallback:fn=>fn(),console,document:{
   createElement:()=>({width:8,height:6,getContext:()=>({drawImage(){}}),
    toBlob:fn=>fn(new Blob(['fake png'],{type:'image/png'}))})
  },
  FileReader:class{readAsDataURL(){this.result='data:image/png;base64,aGVsbG8=';this.onload();}}
 };
 vm.runInNewContext(read('static-terrain-cache.js'),sandbox);
 return {cache:sandbox.window.VedrasStaticTerrainCache.create({
  onStatus:s=>events.push(s)}),key,served,events};
}
test('disk cache checks index once and restores valid static terrain bitmap geometry',async()=>{
 const {cache,key,served}=harness(['a'.repeat(64)]);
 const found=await cache.read(key);
 assert.equal(found.relief.canvas.naturalWidth,8);
 assert.equal(found.relief.x,-20);
 assert.equal(found.raster,null);
 assert.equal(cache.status().hits,1);
 assert.equal(cache.status().misses,0);
 assert.equal(await cache.read('z'.repeat(64)),null);
 assert.equal(served.filter(v=>v.url.endsWith('-index')).length,1);
});
test('missing baked chunk falls back and can be saved without modifying originals',async()=>{
 const {cache,key,served}=harness();
 assert.equal(await cache.read(key),null);
 assert.equal(cache.status().misses,1);
 cache.store(key,{relief:{canvas:{width:8,height:6},x:-20,y:20,width:16,height:12,density:.5}});
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(cache.status().saved,1);
 assert.equal(cache.status().stored,1);
 assert.ok(served.some(x=>x.opts.method==='POST'));
});
test('static bake format excludes mutable road, building, camera and sprite placement state',()=>{
 const app=read('app.js'),view=read('index.html'),chunks=read('chunks.js'),
  server=read('server.py'),disk=read('static_terrain_store.py');
 assert.match(app,/staticTerrain\.keyFor\(/);
 const keyBlock=app.slice(app.indexOf('const diskKey=staticTerrain?'),
  app.indexOf('const precomputed=',app.indexOf('const diskKey=staticTerrain?')));
 for(const word of ['roadEdges','state.hexObject','state.natureInstances',
  'state.panX','state.panY','state.zoom','state.roadMaterial'])
  assert.ok(!keyBlock.includes(word),'mutable field leaked into static content hash: '+word);
 assert.match(app,/if\(precomputed\)return precomputed/);
 assert.match(app,/staticTerrain\.store\(diskKey,item\)/);
 assert.match(app,/terrainChunks\.warm\(tiles/);
 assert.match(view,/id="terrainBake"/);
 assert.match(view,/static-terrain-cache\.js\?v=/);
 assert.match(chunks,/function warm\(tiles/);
 assert.match(chunks,/backgroundQueue/);
 assert.match(server,/store_tile\(STATIC_TERRAIN, data\)/);
 assert.match(disk,/KEY = re\.compile/);
});
test('warm background queue produces chunks without forcing a redraw for each offscreen tile',()=>{
 const sandbox={window:{},requestIdleCallback:fn=>{pending.push(fn);},performance:{now:()=>1}};
 const pending=[],draws=[],progress=[];
 vm.runInNewContext(read('chunks.js'),sandbox);
 const chunks=sandbox.window.VedrasChunks.create({maxTiles:4});
 const cells=[{q:0,r:0}];
 chunks.configure('static-world',{worldCells:cells,family:'terrain-only',
  stampTile:()=> 'stable',buildTile:t=>{draws.push(t.id);return null;},
  redraw:()=>{throw Error('Background precompute should not redraw visible editor');}});
 chunks.warm([{id:'0,0',x:0,y:0,size:512},{id:'1,0',x:512,y:0,size:512}],{
  progress:state=>progress.push(state.warmDone)
 });
 let spins=0;while(pending.length&&spins++<8)pending.shift()();
 assert.equal(draws.length,2);
 assert.equal(progress.at(-1),2);
 assert.equal(chunks.stats().warmDone,2);
});

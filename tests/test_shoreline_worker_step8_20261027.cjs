'use strict';
// Step 8: integrate shoreline union into existing Worker/bitmap protocol.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
function builder(){
 const app=read('app.js'),start=app.indexOf('shorelineChunks.configure(');
 const begin=app.indexOf('buildTile:(tile)=>{',start);
 const end=app.indexOf('},\n   redraw:tile=>{',begin);
 assert.ok(start>=0&&begin>start&&end>begin);
 const opts={enabled:true,mode:'temp',width:34,outer:10};
 const raster={canvas:{width:10,height:10}};
 const calls=[],workers=[],worldCells=[{q:0,r:0}];
 const ctx={window:{
  __vedrasShorelineBuildProfile:{mainBuilds:0,workerBuilds:0,
   workerFailures:0,lastMainMs:0,lastWorkerRoundTripMs:0},
  VedrasChunks:{HALO:128},
  VedrasShoreline:{build:(...args)=>{calls.push(args);return raster;}},
  VedrasTerrainWorker:{available:()=>true,renderShoreline:(...args)=>{
   workers.push(args);return Promise.resolve({raster});
  }}},
  state:{workerTerrain:true},finalRendering:false,
  shorelineWorkerDisabled:false,
  performance:{now:()=>100},console:{warn(){}},
  opts,segments:[{center:{x:10,y:10},side:0}],
  files:[],imgs:[],worldCells,wetHex:()=>false,
  shoreDensity:1,mouthPortals:[]
 };
 const expr='('+app.slice(begin+'buildTile:'.length,end+1)+')';
 return {fn:vm.runInNewContext(expr,ctx),ctx,calls,workers,raster};
}
test('final export builds shoreline synchronously rather than yielding Promise',()=>{
 const h=builder();h.ctx.finalRendering=true;
 const result=h.fn({x:0,y:0,size:512});
 assert.equal(result.raster,h.raster);
 assert.equal(typeof result.then,'undefined');
 assert.equal(h.calls.length,1);
 assert.equal(h.workers.length,0);
});
test('unsupported Worker keeps established synchronous Canvas2D fallback',()=>{
 const h=builder();h.ctx.window.VedrasTerrainWorker.available=()=>false;
 const result=h.fn({x:0,y:0,size:512});
 assert.equal(result.raster,h.raster);
 assert.equal(h.ctx.window.__vedrasShorelineBuildProfile.mainBuilds,1);
});
test('supported Worker returns transferable coastal raster and records timing',async()=>{
 const h=builder();
 const result=await h.fn({x:0,y:0,size:512});
 assert.equal(result.raster,h.raster);
 assert.equal(h.calls.length,0);
 assert.equal(h.workers.length,1);
 assert.equal(h.ctx.window.__vedrasShorelineBuildProfile.workerBuilds,1);
 assert.equal(h.workers[0][0].segments.length,1);
});
test('failed shoreline worker falls back without disabling other terrain jobs',async()=>{
 const h=builder();
 h.ctx.window.VedrasTerrainWorker.renderShoreline=()=>Promise.reject(new Error('shoreline error'));
 const result=await h.fn({x:0,y:0,size:512});
 assert.equal(result.raster,h.raster);
 assert.equal(h.ctx.shorelineWorkerDisabled,true);
 assert.equal(h.ctx.window.__vedrasShorelineBuildProfile.workerFailures,1);
 assert.equal(h.ctx.window.__vedrasShorelineBuildProfile.mainBuilds,1);
});
test('worker dispatches shoreline through existing OffscreenCanvas bitmap transfer',()=>{
 const messages=[],bitmap={width:128,height:128},self={
  postMessage:(packet,transfer)=>messages.push({packet,transfer}),
  VedrasShoreline:{build:()=>({canvas:{transferToImageBitmap:()=>bitmap},
   x:0,y:0,width:512,height:512})}
 };
 const sb={self,importScripts(){},performance:{now:()=>100},
  OffscreenCanvas:class{}};
 vm.runInNewContext(read('terrain-worker.js'),sb);
 self.onmessage({data:{type:'shoreline-render',id:4,
  data:{cells:[],imagePaths:[],options:{},segments:[],mouthPortals:[],
   bounds:{x:0,y:0,width:512,height:512}}}});
 const result=messages.find(m=>m.packet.type==='result');
 assert.ok(result);
 assert.equal(result.packet.shoreline.canvas,bitmap);
 assert.equal(result.transfer[0],bitmap);
});
test('worker client sends shoreline jobs and accepts ImageBitmap response',async()=>{
 const jobs=[],bitmaps=[],scheduled=[];
 let backend=null;
 class Worker{
  constructor(url){this.url=url;backend=this;}
  postMessage(p){jobs.push(p);}
  terminate(){}
 }
 const sb={window:{},Worker,OffscreenCanvas:class{},
  createImageBitmap:async()=>({width:64,height:64,close(){}}),
  setTimeout:fn=>(scheduled.push(fn),scheduled.length),clearTimeout(){}};
 vm.runInNewContext(read('terrain-worker-client.js'),sb);
 const promise=sb.window.VedrasTerrainWorker.renderShoreline({segments:[]},[]);
 backend.onmessage({data:{type:'ready'}});await flush();
 const job=jobs.find(x=>x.type==='shoreline-render');
 assert.ok(job);
 const img={width:100,height:100,close(){bitmaps.push('close')}};
 backend.onmessage({data:{type:'result',id:job.id,ms:17,
  shoreline:{canvas:img,x:0,y:0,width:512,height:512}}});
 const result=await promise;
 assert.equal(result.raster.canvas,img);
 assert.equal(sb.window.VedrasTerrainWorker.status().shorelineCompleted,1);
 assert.equal(sb.window.VedrasTerrainWorker.status().shorelineMs,17);
});
test('existing worker client releases stale shoreline bitmaps',async()=>{
 const jobs=[],closed=[];
 let backend;
 class Worker{constructor(){backend=this;}postMessage(p){jobs.push(p);}terminate(){}}
 const sb={window:{},Worker,OffscreenCanvas:class{},
  createImageBitmap:async x=>x,setTimeout:()=>1,clearTimeout(){}};
 vm.runInNewContext(read('terrain-worker-client.js'),sb);
 const p=sb.window.VedrasTerrainWorker.renderShoreline({},[]);
 backend.onmessage({data:{type:'ready'}});await flush();
 const id=jobs.find(x=>x.type==='shoreline-render').id;
 backend.onmessage({data:{type:'result',id,empty:true}});await p;
 backend.onmessage({data:{type:'result',id,shoreline:{
  canvas:{close(){closed.push(true)}}}}});
 assert.equal(closed.length,1);
});
test('export and client version changes are limited to Worker pathway',()=>{
 const app=read('app.js'),html=read('index.html');
 assert.match(app,/shorelineBuildStats:\(\)=>/);
 assert.match(app,/finalRendering\|\|state\.workerTerrain===false/);
 assert.match(html,/terrain-worker-client\.js\?v=0\.30\.1/);
 assert.match(html,/app\.js\?v=0\.55\.6&amp;step9=20261027/);
});

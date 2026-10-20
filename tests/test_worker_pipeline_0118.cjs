/* v0.11.8 Worker and OffscreenCanvas regression.
 * Verifies transferable source bitmaps, async chunk lifetime and fallback.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
async function test(){
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),
  html=fs.readFileSync(path.join(root,'index.html'),'utf8'),
  workerCode=fs.readFileSync(path.join(root,'terrain-worker.js'),'utf8'),
  clientCode=fs.readFileSync(path.join(root,'terrain-worker-client.js'),'utf8'),
  chunksCode=fs.readFileSync(path.join(root,'chunks.js'),'utf8'),
  autotile=fs.readFileSync(path.join(root,'autotile.js'),'utf8');
 for(const token of ["importScripts('autotile.js?v=0.30.0'",
  'new OffscreenCanvas(1,1)','transferToImageBitmap',
  "postMessage({type:'result'",'terrainRGB(',
  'coastMask(data.maskCells)'])
  assert(workerCode.includes(token),'worker source: '+token);
 assert(autotile.includes('a.img.naturalWidth||a.img.width'),
  'transferable ImageBitmap accepted by texture sampler');
 for(const token of ['workerTerrain:true','VedrasTerrainWorker.render(data,assets)',
  'const {landMask,...safeRelief}=relief||{}','return localBuild();',
  'workerActive?',"'workerTerrain','materialScales'",
  "$('workerTerrain').addEventListener('change'"])
  assert(app.includes(token),'app integration: '+token);
 assert(html.includes('id="workerTerrain"'));
 assert(html.indexOf('terrain-worker-client.js?v=0.30.0')<
  html.indexOf('app.js?v=0.31.0'));
 assert(html.includes('Asset-Labor v0.11.9'));
 assert(workerCode.includes('self.window=self')&&workerCode.includes('self.document='),
  'Worker uses DOM-free offscreen canvas shim');

 // Fake worker tests protocol, transferable ownership and cached source art.
 const inbox=[],instances=[],transfers=[];let closed=0;
 class FakeWorker{
  constructor(uri){this.uri=uri;instances.push(this);Promise.resolve().then(()=>
   this.onmessage?.({data:{type:'ready'}}));}
  postMessage(msg,transfer=[]){
   inbox.push(msg);transfers.push(transfer);
   if(msg.type==='render'){
    const bitmap={width:64,height:64,close(){closed++;}};
    Promise.resolve().then(()=>this.onmessage?.({data:{
     type:'result',id:msg.id,ms:7,empty:false,
     relief:{canvas:bitmap,x:0,y:0,width:64,height:64,density:1}
    }}));
   }
  }
  terminate(){this.terminated=true;}
 }
 const browser={};
 const scope={window:browser,Worker:FakeWorker,
  OffscreenCanvas:class FakeOffscreen{},createImageBitmap:async img=>({
   width:img.naturalWidth,height:img.naturalHeight,close(){closed++;}
  }),setTimeout:()=>123,clearTimeout:()=>{}};
 vm.runInNewContext(clientCode,scope,{filename:'terrain-worker-client.js'});
 const client=browser.VedrasTerrainWorker;
 assert(client.available()&&client.status().supported);
 const source={path:'example.png',img:{naturalWidth:64,naturalHeight:64},meta:{}};
 const result=await client.render({cells:[],types:[]},[source]);
 assert.equal(result.relief.canvas.width,64);
 assert.equal(client.status().textures,1);
 await client.render({cells:[],types:[]},[source]);
 assert.equal(inbox.filter(msg=>msg.type==='texture').length,1,
  'repeat chunks reuse already transferred texture');
 assert.equal(inbox.filter(msg=>msg.type==='render').length,2);
 assert.equal(transfers.find((v,i)=>inbox[i].type==='texture').length,1);
 assert.equal(client.status().completed,2);
 client.disable('test requested fallback');
 assert(!client.available()&&instances[0].terminated);
 let rejected=false;try{await client.render({cells:[],types:[]},[source]);}
 catch{rejected=true;}
 assert(rejected,'unsupported/disabled worker rejects for legacy fallback');
 client.restart();
 assert(client.available(),'operator can retry a failed worker');
 await client.render({cells:[],types:[]},[source]);
 assert.equal(instances.length,2,'restarting the worker creates a fresh thread');
 assert.equal(inbox.filter(msg=>msg.type==='texture').length,2,
  'restarting re-uploads source artwork to the fresh worker');
 
 // Asynchronous chunks must preserve scene epochs and close stale bitmaps.
 const taskQueue=[],world={};
 vm.runInNewContext(chunksCode,{window:world,
  requestIdleCallback:fn=>taskQueue.push(fn),performance:{now:()=>9},
  console:{error(){}}},{filename:'chunks.js'});
 const queueBuild=[],cache=world.VedrasChunks.create({size:512,maxTiles:2});
 const cells=[{q:0,r:0}];
 const viewport={x:0,y:0,width:40,height:40};
 const ctx={save(){},restore(){},beginPath(){},rect(){},clip(){}};
 const setup=name=>cache.configure(name,{worldCells:cells,
  buildTile:()=>new Promise(resolve=>queueBuild.push(resolve)),redraw:()=>{}});
 setup('old');cache.draw(ctx,viewport,{drawRaster:()=>{}});
 assert.equal(taskQueue.length,1);
 taskQueue.shift()();assert.equal(queueBuild.length,1);
 setup('new');
 const stale={width:30,height:30,close(){closed++;}};
 queueBuild.shift()({relief:{canvas:stale}});
 await Promise.resolve();await Promise.resolve();
 assert.equal(cache.stats().cached,0,'stale result ignored after epoch change');
 assert(closed>=1,'stale transferred bitmap is released');
 cache.draw(ctx,viewport,{drawRaster:()=>{}});
 taskQueue.shift()();assert.equal(queueBuild.length,1);
 const kept={width:40,height:40,close(){closed++;}};
 queueBuild.shift()({relief:{canvas:kept}});
 await Promise.resolve();await Promise.resolve();
 assert.equal(cache.stats().cached,1,'Worker result cached for draw');
 cache.clear();
 assert(closed>=2,'cached ImageBitmap released on invalidation');
 console.log('PASS: Worker transferable images, texture reuse, DOM-free raster entry, async epochs, bitmap release and legacy fallback.');
}
module.exports=test();

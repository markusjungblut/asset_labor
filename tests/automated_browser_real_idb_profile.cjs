'use strict';
/* Step25W: genuine IndexedDB read + PNG decode + real Canvas paint profile.
 * The temporary local Firefox origin stores ONLY synthetic archived tiles.
 * There are NO intercepted/mock storage reads and NO source atlas writes.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.join(__dirname,'..'),BROWSER=process.env.VEDRAS_CI_BROWSER||'firefox';
const OUTPUT=process.env.VEDRAS_CI_ARTIFACTS||path.join(root,'test-artifacts');
const policy=fs.readFileSync(path.join(root,'frozen-map-view-policy.js'),'utf8');
const runtime=fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8');
const median=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];
async function run(){
 fs.mkdirSync(OUTPUT,{recursive:true});
 const server=http.createServer((_req,res)=>{
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8',
   'Cache-Control':'no-store'});
  res.end('<!doctype html><html><body><canvas id="game" '+
   'style="width:640px;height:420px"></canvas></body></html>');
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  const pw=require('playwright');
  assert.ok(pw[BROWSER],'Unsupported browser engine');
  browser=await pw[BROWSER].launch({headless:true});
  const context=await browser.newContext({
   viewport:{width:720,height:500},deviceScaleFactor:1,
   reducedMotion:'reduce'
  });
  const page=await context.newPage(),pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e.message||e)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.addScriptTag({content:policy});
  await page.addScriptTag({content:runtime});
  const seed=await page.evaluate(async()=>{
   const NAME='vedras-ci-step25w-real-indexeddb-v1',scene='v1-25c1f00d';
   const req=indexedDB.open(NAME,1);
   const db=await new Promise((resolve,reject)=>{
    req.onupgradeneeded=()=>req.result.createObjectStore('tiles',{keyPath:'key'});
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
   });
   const png=async(c)=>new Promise((resolve,reject)=>
    c.toBlob(b=>b?resolve(b):reject(Error('PNG encoding failed')),'image/png'));
   function image(w,h,index,scenery){
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const g=c.getContext('2d'),grad=g.createLinearGradient(0,0,w,h);
    grad.addColorStop(0,scenery?'#37634a':'#6b8a52');
    grad.addColorStop(1,scenery?'#856441':'#b5a172');
    g.fillStyle=grad;g.fillRect(0,0,w,h);
    for(let i=0;i<48;i++){
     const x=(i*97+index*31)%w,y=(i*63+index*23)%h;
     g.fillStyle='rgba('+(scenery?22:85)+',42,'+
      (120+i%30)+',.24)';
     g.fillRect(x,y,18+i%25,16+i%20);
    }
    return c;
   }
   const variants=[];
   for(let i=0;i<4;i++){
    variants.push({ground:await png(image(512,512,i,false)),
     scenery:await png(image(768,768,i,true))});
   }
   const tx=db.transaction('tiles','readwrite'),os=tx.objectStore('tiles');
   let tileCount=0,totalBytes=0;
   for(let y=-4;y<=4;y++)for(let x=-5;x<=5;x++){
    const id=x+','+y,key=scene+'|near|'+id,
     source=variants[(x+11*y+100)%4];
    os.put({key,sceneKey:scene,level:'near',
     tile:{id,x:x*512,y:y*512,size:512},revision:'ci-idb-1',
     layers:[{layer:'ground',pad:3,png:source.ground},
      {layer:'scenery',pad:128,png:source.scenery}]});
    tileCount++;totalBytes+=source.ground.size+source.scenery.size;
   }
   await new Promise((resolve,reject)=>{
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
    tx.onabort=()=>reject(tx.error);
   });
   // The isolated database stays open only for the duration of this page.
   window.__vedrasCiStep25wDB=db;
   return {tileCount,totalBlobBytes:totalBytes,
    groundSize:variants[0].ground.size,
    scenerySize:variants[0].scenery.size};
  });
  assert.equal(seed.tileCount,99);
  const results=[];
  const configs=[
   {enabled:false,parallel:false},{enabled:true,parallel:false},
   {enabled:true,parallel:false},{enabled:false,parallel:false},
   {enabled:true,parallel:false},{enabled:true,parallel:true},
   {enabled:true,parallel:true},{enabled:true,parallel:false}
  ];
  for(const config of configs){
   const trial=await page.evaluate(async({enabled,parallel})=>{
    const scene='v1-25c1f00d',db=window.__vedrasCiStep25wDB,
     canvas=document.getElementById('game'),
     wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),
     median=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];
    const pixelsByBlob=new WeakMap(),tileByImage=new WeakMap();
    const reads=[],frameSamples=[],decodeLayers=[],paintedAt=new Map();
    const originalDraw=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(img,...args){
     if(this.canvas===canvas){
      const id=tileByImage.get(img);
      if(id&&!paintedAt.has(id))paintedAt.set(id,performance.now());
     }
     return originalDraw.call(this,img,...args);
    };
    function transaction(fn){
     return new Promise((resolve,reject)=>{
      const tx=db.transaction('tiles','readonly');
      let answer;
      const req=fn(tx.objectStore('tiles'));
      req.onsuccess=()=>{answer=req.result;};
      tx.oncomplete=()=>{
       if(answer?.layers)for(const layer of answer.layers)
        pixelsByBlob.set(layer.png,answer.tile.id);
       resolve(answer);
      };
      tx.onerror=()=>reject(tx.error);
      tx.onabort=()=>reject(tx.error);
     });
    }
    const storage={
     keys:async prefix=>{
      const all=await transaction(os=>os.getAllKeys(
       IDBKeyRange.bound(prefix,prefix+String.fromCharCode(0xffff))));
      return all;
     },
     get:key=>transaction(os=>os.get(key))
    };
    const profiler={
     tileRead:record=>reads.push({...record,finishedAt:performance.now()}),
     frame:record=>{frameSamples.push(record);}
    };
    const player=window.VedrasFrozenMap.create({
     canvas,storage,profiler,visibleBorrow:enabled,
     parallelLayerDecode:parallel,prefetchGuard:true,
     directionalPrefetch:true,lodRecency:true,overview1x:false,
     useLayerCache:false,maxDecodedPixels:18000000,
     decode:async blob=>{
      const before=performance.now(),image=await createImageBitmap(blob);
      decodeLayers.push(performance.now()-before);
      const tileId=pixelsByBlob.get(blob);
      if(tileId)tileByImage.set(image,tileId);
      return image;
     }
    });
    const route=[0,-550,-1100,-1650,-1100,-550,0];
    const stepResults=[];
    try{
     const cells=[];
     for(let y=-4;y<=4;y++)for(let x=-5;x<=5;x++)
      cells.push({q:x,r:y,x:(x+.5)*512,y:(y+.5)*512,
       radius:260,visibility:'visible'});
     await player.load(scene,'near',
      {zoom:.85,panX:0,panY:0,projectY:.85,dpr:1.25},cells);
     for(const panX of route){
      const since=performance.now();
      player.setPose({panX});
      let ready=false,lastFrame=null;
      for(let i=0;i<135;i++){
       player.draw();
       lastFrame=frameSamples.at(-1);
       if(lastFrame&&lastFrame.visibleTiles>0&&
          lastFrame.visibleReadyTiles===lastFrame.visibleTiles){
        ready=true;break;
       }
       await wait(10);
      }
      if(!ready)throw Error('Visible tiles not ready at panX='+panX+
       ' '+JSON.stringify(lastFrame&&{
        visible:lastFrame.visibleTiles,ready:lastFrame.visibleReadyTiles
       }));
      stepResults.push({panX,readyMs:performance.now()-since,
       visibleTiles:lastFrame.visibleTiles,
       visibleReady:lastFrame.visibleReadyTiles,
       drawMs:lastFrame.drawMs,
       pending:player.report().pending});
     }
     // Do not require speculative offscreen work to complete; it is
     // separate from what the viewer has already painted on screen.
     player.draw();
     const final=player.report(),data=canvas.getContext('2d')
      .getImageData(0,0,canvas.width,canvas.height).data;
     let hash=2166136261>>>0;
     for(const value of data)hash=Math.imul(hash^value,16777619)>>>0;
     const values=(items,k)=>items.map(v=>v[k]).filter(Number.isFinite);
     const stat=items=>items.length?{
      count:items.length,p50:+median(items).toFixed(3),
      p95:+[...items].sort((a,b)=>a-b)[Math.ceil(.95*items.length)-1].toFixed(3),
      mean:+(items.reduce((a,b)=>a+b,0)/items.length).toFixed(3),
      sum:+items.reduce((a,b)=>a+b,0).toFixed(3)
     }:{count:0};
     const loaded=reads.filter(x=>!x.error),visible=loaded.filter(x=>x.purpose==='visible');
     const paintLags=visible.flatMap(x=>{
      const t=paintedAt.get(x.tileId);
      return Number.isFinite(t)&&t>=x.finishedAt?[t-x.finishedAt]:[];
     });
     return {
      enabled,parallel,parallelTileDecodes:final.parallelTileDecodes,
      scene,readCount:loaded.length,visibleReads:visible.length,
      prefetchReads:loaded.length-visible.length,failures:final.failures,
      decodedPixels:final.decodedPixels,maxDecodedPixels:final.maxDecodedPixels,
      borrowed:final.visibleBorrowStarts,peakInFlight:final.peakInFlight,
      evictions:final.evictions,repeatDecodes:final.decodeRepeats,
      pixelHash:hash.toString(16).padStart(8,'0'),
      stages:{
       storageMs:stat(values(visible,'storageMs')),
       decodeMs:stat(values(visible,'decodeMs')),
       totalMs:stat(values(visible,'totalMs')),
       imageBitmapLayerMs:stat(decodeLayers),
       drawAfterTileLoadedMs:stat(paintLags),
       visibleReadyMs:stat(stepResults.map(x=>x.readyMs)),
       drawMs:stat(values(frameSamples,'drawMs'))
      },
      visibleSteps:stepResults,
      sampleReads:visible.slice(0,12).map(x=>({
       tileId:x.tileId,storageMs:+x.storageMs.toFixed(3),
       decodeMs:+x.decodeMs.toFixed(3),totalMs:+x.totalMs.toFixed(3)
      }))
     };
    }finally{
     player.stop();
     CanvasRenderingContext2D.prototype.drawImage=originalDraw;
    }
   },config);
   results.push(trial);
   process.stdout.write('Step25W actual IndexedDB sample '+
    JSON.stringify({enabled:trial.enabled,parallel:trial.parallel,
     parallelTileDecodes:trial.parallelTileDecodes,
     readCount:trial.readCount,
     storage:trial.stages.storageMs,decode:trial.stages.decodeMs,
     visibleReady:trial.stages.visibleReadyMs,
     peak:trial.peakInFlight,borrowed:trial.borrowed})+'\n');
  }
  assert.deepEqual(pageErrors,[],'Browser page errors');
  for(const r of results){
   assert.equal(r.failures,0,'No image decoding/IDB read failures');
   assert.ok(r.readCount>=5,'Must read real PNG tiles from IndexedDB');
   assert.ok(r.visibleReads>=4,'Must actually read visible packets');
   assert.ok(r.stages.storageMs.p50>=0,'Real storage time');
   assert.ok(r.stages.decodeMs.p50>=0,'Real bitmap decoding time');
   assert.ok(r.stages.totalMs.p50>=r.stages.storageMs.p50,
    'Total read/decode must include IDB storage');
   assert.equal(r.visibleSteps.length,7);
   assert.ok(r.visibleSteps.every(s=>s.visibleTiles>0&&
    s.visibleReady===s.visibleTiles));
   assert.ok(r.decodedPixels<=r.maxDecodedPixels,
    'Decoded cache must stay in the existing RAM budget');
  }
  assert.equal(new Set(results.map(x=>x.pixelHash)).size,1,
   'Both scheduling modes must paint pixel-identical final view');
  const avg=r=>a=>a.reduce((s,x)=>s+x.stages[r].p50,0)/a.length;
  const borrowResults=results.slice(0,4);
  const on=borrowResults.filter(x=>x.enabled),
   off=borrowResults.filter(x=>!x.enabled);
  const decodeResults=results.slice(4);
  const parallelOn=decodeResults.filter(x=>x.parallel),
   parallelOff=decodeResults.filter(x=>!x.parallel);
  assert.equal(parallelOn.length,2);
  assert.equal(parallelOff.length,2);
  assert.ok(parallelOn.every(x=>x.parallelTileDecodes>0),
   'Real-browser parallel decoding must be exercised');
  assert.ok(parallelOff.every(x=>x.parallelTileDecodes===0),
   'Sequential path must remain a genuine A/B control');
  const output={schema:'vedras-step25x-real-idb-decode-ab-v1',
   browser:BROWSER,fixture:'99 authored 512+768 PNG tile packets in real isolated IndexedDB',
   seed,sequence:'two ABBA comparisons, camera 0/-550/-1100/-1650/-1100/-550/0',
   results,parallelComparison:{
    onDecodeP50Ms:+avg('decodeMs')(parallelOn).toFixed(3),
    offDecodeP50Ms:+avg('decodeMs')(parallelOff).toFixed(3),
    onVisibleReadyP50Ms:+avg('visibleReadyMs')(parallelOn).toFixed(3),
    offVisibleReadyP50Ms:+avg('visibleReadyMs')(parallelOff).toFixed(3),
    parallelTiles:parallelOn.reduce((sum,r)=>sum+r.parallelTileDecodes,0),
    allFinalPixelsEqual:true,noAssumedWin:true
   },summary:{
    realIDBReads:results.reduce((a,r)=>a+r.readCount,0),
    onBorrowStarts:on.reduce((a,r)=>a+r.borrowed,0),
    offBorrowStarts:off.reduce((a,r)=>a+r.borrowed,0),
    avgStorageP50OnMs:+avg('storageMs')(on).toFixed(3),
    avgStorageP50OffMs:+avg('storageMs')(off).toFixed(3),
    avgDecodeP50OnMs:+avg('decodeMs')(on).toFixed(3),
    avgDecodeP50OffMs:+avg('decodeMs')(off).toFixed(3),
    finalPixelHash:results[0].pixelHash,
    noUniversalSpeedAssertion:true,
    passed:true
   }};
  fs.writeFileSync(path.join(OUTPUT,BROWSER+'-real-idb-profile.json'),
   JSON.stringify(output,null,2));
  process.stdout.write(JSON.stringify(output.summary)+'\n');
 }finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
 }
}
run().catch(e=>{process.stderr.write(String(e.stack||e)+'\n');
 process.exitCode=1;});

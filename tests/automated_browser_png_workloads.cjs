'use strict';
/* Step25Y: real Firefox IDB/PNG A/B across compression, texture and density.
 * All tile images are generated in an isolated CI origin; never use a
 * user's original raster archive or existing IndexedDB database.
 */
const assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),
 BROWSER=process.env.VEDRAS_CI_BROWSER||'firefox',
 OUTPUT=process.env.VEDRAS_CI_ARTIFACTS||path.join(root,'test-artifacts');
const policy=fs.readFileSync(path.join(root,'frozen-map-view-policy.js'),'utf8'),
 runtime=fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8');
const median=xs=>[...xs].sort((a,b)=>a-b)[Math.floor(xs.length/2)];
async function run(){
 fs.mkdirSync(OUTPUT,{recursive:true});
 const server=http.createServer((_req,res)=>{
  res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});
  res.end('<!doctype html><canvas id="game" style="width:640px;height:420px"></canvas>');
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 let browser;
 try{
  const pw=require('playwright');
  assert.ok(pw[BROWSER],'Missing Playwright browser');
  browser=await pw[BROWSER].launch({headless:true});
  const context=await browser.newContext({viewport:{width:720,height:520},
   deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(String(error.message||error)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.addScriptTag({content:policy});
  await page.addScriptTag({content:runtime});
  const workloads=[
   {id:'smooth-512-768',ground:512,scenery:768,texture:false,variants:8,budget:18000000},
   {id:'textured-512-768',ground:512,scenery:768,texture:true,variants:8,budget:18000000},
   {id:'textured-1024-1536',ground:1024,scenery:1536,texture:true,variants:6,budget:55000000}
  ],measured=[];
  for(const config of workloads){
   const seed=await page.evaluate(async config=>{
    const DB='vedras-ci-step25y-workloads-v1',SCENE='v1-25c1f00d';
    const request=indexedDB.open(DB,1);
    const db=await new Promise((resolve,reject)=>{
     request.onupgradeneeded=()=>{
      request.result.createObjectStore('tiles',{keyPath:'key'});
     };
     request.onsuccess=()=>resolve(request.result);
     request.onerror=()=>reject(request.error);
    });
    const encode=cv=>new Promise((resolve,reject)=>cv.toBlob(
     blob=>blob?resolve(blob):reject(Error('PNG encode failure')),'image/png'));
    // Deterministic xorshift, separate palettes and unique images per seed.
    const makeImage=(width,height,seed,scenery)=>{
     const cv=document.createElement('canvas');
     cv.width=width;cv.height=height;
     const g=cv.getContext('2d',{alpha:true});
     if(!config.texture){
      const gradient=g.createLinearGradient(0,0,width,height);
      gradient.addColorStop(0,scenery?'#355441':'#6a8d56');
      gradient.addColorStop(1,scenery?'#927e5c':'#aabe80');
      g.fillStyle=gradient;g.fillRect(0,0,width,height);
      for(let i=0;i<20;i++){
       g.fillStyle=scenery?'rgba(43,78,57,.25)':'rgba(76,99,56,.25)';
       g.fillRect((i*61+seed*19)%width,(i*47+seed*29)%height,45,16);
      }
     }else{
      // Low-cost 6-pixel colored texture. Its much larger encoded PNG
      // and noisy alpha resemble complicated scenery better than a
      // nearly flat 4-image fixture, without claiming atlas equivalence.
      const scale=6,sw=Math.ceil(width/scale),sh=Math.ceil(height/scale);
      const tex=document.createElement('canvas');tex.width=sw;tex.height=sh;
      const t=tex.getContext('2d',{alpha:true}),im=t.createImageData(sw,sh);
      let state=(seed+1)*2654435761>>>0;
      for(let i=0;i<sw*sh;i++){
       state^=state<<13;state^=state>>>17;state^=state<<5;
       const off=i*4,v=state&255;
       im.data[off]=scenery?20+v%100:70+v%120;
       im.data[off+1]=scenery?55+(v>>2)%120:70+(v>>3)%120;
       im.data[off+2]=scenery?25+(v>>3)%65:45+(v>>4)%95;
       im.data[off+3]=scenery?(v%7===0?0:230):255;
      }
      t.putImageData(im,0,0);
      g.imageSmoothingEnabled=false;
      g.drawImage(tex,0,0,width,height);
     }
     return cv;
    };
    const choices=[];
    for(let i=0;i<config.variants;i++)choices.push({
     ground:await encode(makeImage(config.ground,config.ground,i,false)),
     scenery:await encode(makeImage(config.scenery,config.scenery,i+29,true))
    });
    const tx=db.transaction('tiles','readwrite'),store=tx.objectStore('tiles');
    store.clear();
    const sizes=[],SCENE_ID=SCENE;
    for(let y=-4;y<=4;y++)for(let x=-5;x<=5;x++){
     const id=x+','+y,key=SCENE_ID+'|near|'+id,
      source=choices[((x+5)+11*(y+4))%choices.length];
     store.put({key,sceneKey:SCENE_ID,level:'near',
      tile:{id,x:x*512,y:y*512,size:512},
      revision:'ci-step25y-'+config.id,
      layers:[{layer:'ground',pad:3,png:source.ground},
       {layer:'scenery',pad:128,png:source.scenery}]});
     sizes.push(source.ground.size+source.scenery.size);
    }
    await new Promise((resolve,reject)=>{
     tx.oncomplete=resolve;
     tx.onerror=()=>reject(tx.error);
     tx.onabort=()=>reject(tx.error);
    });
    // Store is read-only for all subsequent measurements.
    window.__step25yDB?.close();
    window.__step25yDB=db;
    return {count:sizes.length,meanCompressedTileBytes:Math.round(
     sizes.reduce((a,b)=>a+b,0)/sizes.length),
     minCompressedTileBytes:Math.min(...sizes),
     maxCompressedTileBytes:Math.max(...sizes),
     variants:choices.length,groundPixels:config.ground**2,
     sceneryPixels:config.scenery**2};
   },config);
   assert.equal(seed.count,99);
   const samples=[],order=[false,true,true,false];
   for(const parallel of order){
    const result=await page.evaluate(async({parallel,config})=>{
     const SCENE='v1-25c1f00d',db=window.__step25yDB,
      canvas=document.getElementById('game'),
      wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
     const reads=[],frames=[],layerDecodes=[];
     const storage={
      keys:prefix=>new Promise((resolve,reject)=>{
       const tx=db.transaction('tiles','readonly'),
        req=tx.objectStore('tiles').getAllKeys(
         IDBKeyRange.bound(prefix,prefix+String.fromCharCode(0xffff)));
       req.onsuccess=()=>resolve(req.result);
       req.onerror=()=>reject(req.error);
      }),
      get:key=>new Promise((resolve,reject)=>{
       const tx=db.transaction('tiles','readonly'),
        req=tx.objectStore('tiles').get(key);
       let answer;
       req.onsuccess=()=>{answer=req.result;};
       tx.oncomplete=()=>resolve(answer);
       tx.onerror=()=>reject(tx.error);
       tx.onabort=()=>reject(tx.error);
      })
     };
     const profiler={
      tileRead:x=>reads.push({...x}),
      frame:x=>frames.push({...x})
     };
     const player=window.VedrasFrozenMap.create({
      canvas,storage,profiler,parallelLayerDecode:parallel,
      visibleBorrow:true,directionalPrefetch:true,
      prefetchGuard:true,lodRecency:true,overview1x:false,
      useLayerCache:false,maxDecodedPixels:config.budget,
      decode:async png=>{
       const start=performance.now(),img=await createImageBitmap(png);
       layerDecodes.push(performance.now()-start);
       return img;
      }
     });
     const route=[0,-800,-1600,-800,0],steps=[];
     const stats=items=>{
      const arr=[...items].filter(Number.isFinite).sort((a,b)=>a-b);
      const n=arr.length;
      return n?{count:n,p50:+arr[Math.floor(n/2)].toFixed(2),
       p95:+arr[Math.ceil(.95*n)-1].toFixed(2),
       mean:+(arr.reduce((a,b)=>a+b,0)/n).toFixed(2)}
       :{count:0};
     };
     try{
      const cells=[];
      for(let y=-4;y<=4;y++)for(let x=-5;x<=5;x++)
       cells.push({q:x,r:y,x:(x+.5)*512,y:(y+.5)*512,
        radius:260,visibility:'visible'});
      await player.load(SCENE,'near',{zoom:.85,panX:0,
       panY:0,projectY:.85,dpr:1.25},cells);
      for(const panX of route){
       const start=performance.now(),before=player.report();
       player.setPose({panX});
       let ready=false,last;
       for(let i=0;i<150;i++){
        player.draw();
        last=frames.at(-1);
        if(last?.visibleTiles>0&&
           last.visibleReadyTiles===last.visibleTiles){
         ready=true;break;
        }
        await wait(10);
       }
       if(!ready)throw Error('Viewport not ready for '+config.id+
        ' at panX='+panX+' '+JSON.stringify(last&&{
         ready:last.visibleReadyTiles,visible:last.visibleTiles}));
       steps.push({panX,readyMs:performance.now()-start,
        visibleTiles:last.visibleTiles,
        newVisibleReads:player.report().visibleReadStarts-before.visibleReadStarts,
        renderMs:last.drawMs});
      }
      player.draw();
      const p=player.report(),pixels=canvas.getContext('2d')
       .getImageData(0,0,canvas.width,canvas.height).data;
      let hash=2166136261>>>0;
      for(const byte of pixels)hash=Math.imul(hash^byte,16777619)>>>0;
      const visible=reads.filter(x=>!x.error&&x.purpose==='visible');
      return {parallel,reads:reads.length,
       visibleReads:visible.length,
       parallelTiles:p.parallelTileDecodes,
       failures:p.failures,decodedPixels:p.decodedPixels,
       pixelBudget:p.maxDecodedPixels,evictions:p.evictions,
       frameCount:frames.length,pixelHash:hash.toString(16).padStart(8,'0'),
       metrics:{
        storageMs:stats(visible.map(x=>x.storageMs)),
        decodeMs:stats(visible.map(x=>x.decodeMs)),
        layerMs:stats(layerDecodes),
        totalMs:stats(visible.map(x=>x.totalMs)),
        visibleReadyMs:stats(steps.map(x=>x.readyMs)),
        renderDrawMs:stats(frames.map(x=>x.drawMs))
       },steps};
     }finally{player.stop();}
    },{parallel,config});
    samples.push(result);
    process.stdout.write('Step25Y '+config.id+' '+JSON.stringify({
     parallel,reads:result.reads,pngDecode:result.metrics.decodeMs,
     viewportReady:result.metrics.visibleReadyMs,
     evictions:result.evictions})+'\n');
   }
   for(const r of samples){
    assert.equal(r.failures,0,'Image loads must not fail');
    assert.ok(r.visibleReads>=4,'Read actual visible PNG tiles');
    assert.ok(r.metrics.decodeMs.count>=4,'Real decoded data');
    assert.ok(r.metrics.storageMs.count>=4,'Real indexedDB data');
    assert.ok(r.decodedPixels<=r.pixelBudget,'Existing RAM cap');
    assert.equal(r.steps.length,5);
    assert.ok(r.steps.every(x=>x.visibleTiles>0));
    assert.equal(r.parallelTiles>0,r.parallel,
     'Real parallel path must be exercised only in opt-in mode');
   }
   assert.equal(new Set(samples.map(x=>x.pixelHash)).size,1,
    'Final Canvas pixels must match within workload');
   const off=samples.filter(x=>!x.parallel),on=samples.filter(x=>x.parallel);
   const mean=(a,key)=>a.reduce((sum,x)=>sum+x.metrics[key].p50,0)/a.length;
   measured.push({workload:config,seed,results:samples,
    summary:{
     sequentialDecodeMedianMeanMs:+mean(off,'decodeMs').toFixed(2),
     parallelDecodeMedianMeanMs:+mean(on,'decodeMs').toFixed(2),
     sequentialReadyMedianMeanMs:+mean(off,'visibleReadyMs').toFixed(2),
     parallelReadyMedianMeanMs:+mean(on,'visibleReadyMs').toFixed(2),
     finalPixelHash:samples[0].pixelHash,
     allPixelsEqual:true
    }});
  }
  assert.deepEqual(errors,[],'No browser JS errors');
  const [smooth,textured,large]=measured;
  assert.ok(textured.seed.meanCompressedTileBytes>
   smooth.seed.meanCompressedTileBytes*1.5,
   'Textured fixtures must represent materially larger compressed PNGs');
  assert.ok(large.seed.groundPixels>textured.seed.groundPixels&&
   large.seed.sceneryPixels>textured.seed.sceneryPixels,
   'High-resolution fixture must use more decoded pixels per tile');
  const summary={schema:'vedras-step25y-png-workload-profile-v1',
   testHost:'CI isolated Firefox',browser:BROWSER,passed:true,
   noDefaultFlip:true,noUniversalSpeedAssertion:true,
   scenarios:measured,errors};
  fs.writeFileSync(path.join(OUTPUT,BROWSER+'-png-workloads.json'),
   JSON.stringify(summary,null,2));
  process.stdout.write('Step25Y summary '+JSON.stringify(measured.map(x=>({
   workload:x.workload.id,compressedBytes:x.seed.meanCompressedTileBytes,
   ...x.summary})))+'\n');
 }finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
 }
}
run().catch(error=>{process.stderr.write(String(error.stack||error)+'\n');
 process.exitCode=1;});

'use strict';
/* Step25Z: real Firefox 1x/2x PNG / IndexedDB RAM-eviction A/B.
 * The private map, source tiles, game storage, and local PC are untouched.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const ROOT=path.join(__dirname,'..'),BROWSER=process.env.VEDRAS_CI_BROWSER||'firefox';
const OUT=process.env.VEDRAS_CI_ARTIFACTS||path.join(ROOT,'test-artifacts');
const policy=fs.readFileSync(path.join(ROOT,'frozen-map-view-policy.js'),'utf8');
const runtime=fs.readFileSync(path.join(ROOT,'frozen-map-runtime.js'),'utf8');
function med(values){
 const a=[...values].sort((a,b)=>a-b);
 return a[Math.floor(a.length/2)];
}
async function run(){
 fs.mkdirSync(OUT,{recursive:true});
 const server=http.createServer((_req,res)=>{
  res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});
  res.end('<!doctype html><canvas id="game" style="width:640px;height:420px"></canvas>');
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 let browser;
 try{
  const playwright=require('playwright');
  assert.ok(playwright[BROWSER],'Playwright engine unavailable');
  browser=await playwright[BROWSER].launch({headless:true});
  const context=await browser.newContext({
   viewport:{width:720,height:520},deviceScaleFactor:1,reducedMotion:'reduce'
  });
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e.message||e)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.addScriptTag({content:policy});
  await page.addScriptTag({content:runtime});
  const seed=await page.evaluate(async()=>{
   const DB='vedras-ci-step25z-ram-churn-v1',scene='v1-25c1f00d';
   const rq=indexedDB.open(DB,1);
   const db=await new Promise((resolve,reject)=>{
    rq.onupgradeneeded=()=>{
     rq.result.createObjectStore('tiles',{keyPath:'key'});
     rq.result.createObjectStore('variants',{keyPath:'id'});
    };
    rq.onsuccess=()=>resolve(rq.result);
    rq.onerror=()=>reject(rq.error);
   });
   const png=canvas=>new Promise((resolve,reject)=>
    canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG encoding failed')),
     'image/png'));
   function makeImage(size,number,scenery){
    const canvas=document.createElement('canvas');
    canvas.width=size;canvas.height=size;
    const g=canvas.getContext('2d');
    g.fillStyle=scenery?'#395b45':'#7a955f';
    g.fillRect(0,0,size,size);
    for(let i=0;i<44;i++){
     const x=(i*97+number*51)%size,y=(i*67+number*39)%size;
     g.fillStyle=scenery?'rgba(15,95,55,.35)':'rgba(108,72,42,.26)';
     g.fillRect(x,y,17+(i%5)*8,11+(i%7)*6);
    }
    return canvas;
   }
   const options={},sizes={};
   for(const variant of ['1x','2x']){
    const dim=variant==='1x'?[256,384]:[512,768],records=[];
    for(let i=0;i<6;i++)records.push({
     ground:await png(makeImage(dim[0],i,false)),
     scenery:await png(makeImage(dim[1],i+17,true))
    });
    options[variant]=records;
    sizes[variant]={pixels:dim[0]**2+dim[1]**2,
     tileBytes:Math.round(records.reduce((s,x)=>
      s+x.ground.size+x.scenery.size,0)/records.length)};
   }
   const tx=db.transaction(['tiles','variants'],'readwrite'),
    keys=tx.objectStore('tiles'),variants=tx.objectStore('variants');
   let count=0;
   for(let y=-3;y<=3;y++)for(let x=-11;x<=11;x++){
    const id=x+','+y,key=scene+'|near|'+id,
     tile={id,x:x*512,y:y*512,size:512};
    keys.put({key});
    for(const variant of ['1x','2x']){
     const packet=options[variant][((x+11)+23*(y+3))%6];
     variants.put({id:key+'~'+variant,
      record:{key,sceneKey:scene,level:'near',
       derivedFormat:variant+'-png-v1',tile,
       layers:[{layer:'ground',pad:3,png:packet.ground},
        {layer:'scenery',pad:128,png:packet.scenery}]}});
    }
    count++;
   }
   await new Promise((resolve,reject)=>{
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
    tx.onabort=()=>reject(tx.error);
   });
   window.__step25zDB=db;
   return {tiles:count,variantPackets:count*2,sizes,
    budget:10000000};
  });
  assert.equal(seed.tiles,161);
  assert.ok(seed.sizes['2x'].pixels>seed.sizes['1x'].pixels*3);
  const route=[
   {zoom:.85,panX:0},{zoom:.85,panX:-650},
   {zoom:.5,panX:-750},{zoom:.85,panX:-1300},
   {zoom:.5,panX:-1400},{zoom:.85,panX:-1950},
   {zoom:.5,panX:-2050},{zoom:.85,panX:-2550},
   {zoom:.5,panX:-2600},{zoom:.85,panX:-2550},
   {zoom:.5,panX:-2050},{zoom:.85,panX:-1950},
   {zoom:.5,panX:-1400},{zoom:.85,panX:-1300},
   {zoom:.5,panX:-750},{zoom:.85,panX:-650},
   {zoom:.5,panX:0},{zoom:.85,panX:0}
  ];
  // Two independent ABBA comparisons: last-visible recency vs legacy,
  // then sequential vs parallel decoding under the recency strategy.
  const configs=[
   {lod:false,parallel:false},{lod:true,parallel:false},
   {lod:true,parallel:false},{lod:false,parallel:false},
   {lod:true,parallel:false},{lod:true,parallel:true},
   {lod:true,parallel:true},{lod:true,parallel:false}
  ],results=[];
  for(const config of configs){
   const result=await page.evaluate(async({config,route,budget})=>{
    const scene='v1-25c1f00d',db=window.__step25zDB,
     canvas=document.getElementById('game'),
     wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    const readTimings=[],frames=[];
    function lookup(store,key){
     return new Promise((resolve,reject)=>{
      const tx=db.transaction(store,'readonly'),
       rq=tx.objectStore(store).get(key);
      let data;
      rq.onsuccess=()=>{data=rq.result;};
      tx.oncomplete=()=>resolve(data);
      tx.onerror=()=>reject(tx.error);
      tx.onabort=()=>reject(tx.error);
     });
    }
    const storage={
     keys:async prefix=>new Promise((resolve,reject)=>{
      const tx=db.transaction('tiles','readonly'),
       rq=tx.objectStore('tiles').getAllKeys(
        IDBKeyRange.bound(prefix,prefix+String.fromCharCode(0xffff)));
      rq.onsuccess=()=>resolve(rq.result);
      rq.onerror=()=>reject(rq.error);
     }),
     getVariant:async(key,variant)=>{
      const entry=await lookup('variants',key+'~'+variant);
      return entry?.record||null;
     }
    };
    const profiler={
     tileRead:x=>readTimings.push(x),
     frame:x=>frames.push(x)
    };
    const player=window.VedrasFrozenMap.create({
     canvas,storage,profiler,overview1x:true,
     lodRecency:config.lod,parallelLayerDecode:config.parallel,
     prefetchGuard:true,directionalPrefetch:true,visibleBorrow:true,
     useLayerCache:false,maxDecodedPixels:budget,
     decode:blob=>createImageBitmap(blob)
    });
    const stops=[],median=xs=>{
     const a=[...xs].sort((a,b)=>a-b);return a[Math.floor(a.length/2)];
    };
    const summary=xs=>{
     const a=[...xs].filter(Number.isFinite).sort((a,b)=>a-b),n=a.length;
     return n?{count:n,p50:+median(a).toFixed(2),
      p95:+a[Math.ceil(n*.95)-1].toFixed(2),
      mean:+(a.reduce((s,v)=>s+v,0)/n).toFixed(2)}:{count:0};
    };
    try{
     const cells=[];
     for(let y=-3;y<=3;y++)for(let x=-11;x<=11;x++)
      cells.push({q:x,r:y,x:(x+.5)*512,y:(y+.5)*512,
       radius:265,visibility:'visible'});
     await player.load(scene,'near',
      {zoom:.85,panX:0,panY:0,dpr:1.25,projectY:.85},cells);
     let peak=0;
     for(const pose of route){
      const start=performance.now(),before=player.report();
      player.setPose({zoom:pose.zoom,panX:pose.panX});
      let ready=false,last,report;
      let readyFrames=0;
      for(let i=0;i<165;i++){
       player.draw();last=frames.at(-1);report=player.report();
       peak=Math.max(peak,report.decodedPixels);
       const visibleComplete=last?.visibleTiles>0&&
        last.visibleReadyTiles===last.visibleTiles;
       // Fall-back LOD images can be drawn while newer images decode.
       // Wait until every foreground read completes, but do not block
       // on valid speculative work outside the screen.
       if(visibleComplete&&report.pending===report.activePrefetch){
        if(++readyFrames>=2){ready=true;break;}
       }else readyFrames=0;
       await wait(8);
      }
      if(!ready)throw Error('Visible LOD not ready at '+
       JSON.stringify(pose)+' '+JSON.stringify({
        frame:last&&[last.visibleTiles,last.visibleReadyTiles],
        pending:report?.pending,prefetch:report?.activePrefetch,
        failures:report?.failures,decodedPixels:report?.decodedPixels}));
      stops.push({pose,readyMs:performance.now()-start,
       activeVariant:report.activeVariant,
       visible: last.visibleTiles,decoded:report.decoded,
       evictions:report.evictions-before.evictions,
       repeatDecodes:report.decodeRepeats-before.decodeRepeats,
       visibleReadStarts:report.visibleReadStarts-before.visibleReadStarts,
       memoryPixels:report.decodedPixels});
     }
     player.draw();
     const final=player.report();
     const pixels=canvas.getContext('2d')
      .getImageData(0,0,canvas.width,canvas.height).data;
     let hash=2166136261>>>0;
     for(const byte of pixels)hash=Math.imul(hash^byte,16777619)>>>0;
     const loaded=readTimings.filter(x=>!x.error),
      visible=loaded.filter(x=>x.purpose==='visible');
     return {config,saved:final.saved,failures:final.failures,
      maxDecodedPixels:final.maxDecodedPixels,peakDecodedPixels:peak,
      remainingDecodedPixels:final.decodedPixels,
      evictions:final.evictions,decodeRepeats:final.decodeRepeats,
      visibleDecodeRepeats:final.visibleDecodeRepeats,
      prefetchDecodeRepeats:final.prefetchDecodeRepeats,
      evictedSpeculative:final.evictedSpeculative,
      lodRecencyEvictions:final.lodRecencyEvictions,
      parallelTileDecodes:final.parallelTileDecodes,
      parallelDecodeFailures:final.parallelDecodeFailures,
      decoded1x:final.decoded1x,decoded2x:final.decoded2x,
      activeVariant:final.activeVariant,lodSwitches:final.lodSwitches,
      variantFallbackFrames:final.variantFallbackFrames,
      visibleReadStarts:final.visibleReadStarts,
      prefetchReadStarts:final.prefetchReadStarts,
      pixelHash:hash.toString(16).padStart(8,'0'),
      timings:{
       storageMs:summary(visible.map(x=>x.storageMs)),
       decodeMs:summary(visible.map(x=>x.decodeMs)),
       visibleReadyMs:summary(stops.map(x=>x.readyMs))
      },stops};
    }finally{player.stop();}
   },{config,route,budget:seed.budget});
   results.push(result);
   process.stdout.write('Step25Z RAM sample '+JSON.stringify({
    config:result.config,evictions:result.evictions,
    repeatDecodes:result.decodeRepeats,visibleReads:result.visibleReadStarts,
    peak:result.peakDecodedPixels,ready:result.timings.visibleReadyMs,
    decoded1x:result.decoded1x,decoded2x:result.decoded2x})+'\n');
  }
  assert.deepEqual(errors,[],'Page errors in real Firefox');
  assert.equal(new Set(results.map(x=>x.pixelHash)).size,1,
   'All modes must produce identical final ground/scenery pixels');
  for(const r of results){
   assert.equal(r.saved,seed.tiles);
   assert.equal(r.failures,0,'Real IndexedDB/decode path must succeed');
   assert.equal(r.parallelDecodeFailures,0);
   assert.equal(r.activeVariant,'2x','Return to same detailed final LOD');
   assert.equal(r.stops.length,route.length);
   assert.ok(r.stops.every(s=>s.visible>0&&
    s.memoryPixels<=seed.budget),'Visible route and RAM safety');
   assert.ok(r.peakDecodedPixels<=r.maxDecodedPixels);
   assert.ok(r.evictions>0,
    'Fixture must actually trigger RAM evictions');
   assert.ok(r.decodeRepeats>0,
    'Fixture must actually trigger redownload/redecode after eviction');
   assert.ok(r.lodSwitches>=12);
   assert.equal(r.parallelTileDecodes>0,r.config.parallel,
    'Decoder opt-in must be actually exercised');
   assert.ok(r.timings.decodeMs.count>0);
   assert.ok(r.timings.visibleReadyMs.p50>=0);
  }
  const recency=results.slice(0,4),decode=results.slice(4);
  const group=(xs,key)=>xs.filter(x=>x.config[key]),
   mean=(xs,key)=>xs.reduce((s,v)=>s+v[key],0)/xs.length,
   ready=xs=>xs.reduce((s,v)=>s+v.timings.visibleReadyMs.p50,0)/xs.length;
  const recOn=group(recency,'lod'),recOff=recency.filter(x=>!x.config.lod),
   decOn=group(decode,'parallel'),decOff=decode.filter(x=>!x.config.parallel);
  assert.equal(recOn.length,2);assert.equal(recOff.length,2);
  assert.equal(decOn.length,2);assert.equal(decOff.length,2);
  const comparison={
   recency:{on:{evictionsMean:mean(recOn,'evictions'),
     repeatDecodesMean:mean(recOn,'decodeRepeats'),
     visibleReadyP50MeanMs:ready(recOn)},
    off:{evictionsMean:mean(recOff,'evictions'),
     repeatDecodesMean:mean(recOff,'decodeRepeats'),
     visibleReadyP50MeanMs:ready(recOff)}},
   decoder:{parallel:{evictionsMean:mean(decOn,'evictions'),
     repeatDecodesMean:mean(decOn,'decodeRepeats'),
     visibleReadyP50MeanMs:ready(decOn)},
    sequential:{evictionsMean:mean(decOff,'evictions'),
     repeatDecodesMean:mean(decOff,'decodeRepeats'),
     visibleReadyP50MeanMs:ready(decOff)}}
  };
  const report={schema:'vedras-step25z-real-ram-eviction-v1',
   browser:BROWSER,fixture:seed,route,configs,
   results,comparison,allFinalPixelsEqual:true,
   realIndexedDBVariants:true,forcedEvictions:true,
   forcedRepeatDecodes:true,noUniversalSpeedAssertion:true,
   passed:true};
  fs.writeFileSync(path.join(OUT,BROWSER+'-ram-churn.json'),
   JSON.stringify(report,null,2));
  process.stdout.write('Step25Z summary '+JSON.stringify(comparison)+'\n');
 }finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
 }
}
run().catch(e=>{process.stderr.write(String(e.stack||e)+'\n');
 process.exitCode=1;});

'use strict';
/* Real-browser, zero-user-action regression of the frozen game renderer.
 * Every world tile is generated in an ISOLATED CI browser origin. This
 * deliberately never opens / migrates a real user's local IndexedDB.
 * Requires "playwright" (installed by GitHub Actions, not by the game).
 */
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const root=path.resolve(__dirname,'..');
const OUTPUT=process.env.VEDRAS_CI_ARTIFACTS||path.join(root,'test-artifacts');
const BROWSER=process.env.VEDRAS_CI_BROWSER||'firefox';
const SCENE='v1-25c1f00d',COUNT=120;
const cloud=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+XcJkAAAAASUVORK5CYII=','base64');
const files=new Set([
 'tests/fixtures/frozen-ci-seed.html','frozen-map-game.html',
 'frozen-map-game.js','frozen-map-runtime.js','frozen-map-profiler.js',
 'frozen-map-view-policy.js','frozen-map-fog-viewport.js',
 'frozen-map-derived-1x.js',
 'frozen-map-derived-2x.js','cloud-artwork.js'
]);
const run=async()=>{
 fs.mkdirSync(OUTPUT,{recursive:true});
 const server=http.createServer((req,res)=>{
  const requestPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/,'');
  if(/^tests\/fixtures\/clouds\/ci-[0-3]\.png$/.test(requestPath)){
   res.writeHead(200,{'Content-Type':'image/png','Cache-Control':'no-store'});
   res.end(cloud);return;
  }
  if(!files.has(requestPath)){
   res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not allowed');return;
  }
  fs.readFile(path.join(root,requestPath),(err,bytes)=>{
   if(err){res.writeHead(500);res.end(String(err));return;}
   res.writeHead(200,{'Content-Type':requestPath.endsWith('.js')?
    'text/javascript; charset=utf-8':'text/html; charset=utf-8',
    'Cache-Control':'no-store'});
   res.end(bytes);
  });
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 let browser=null;
 const collected={schema:'vedras-ci-browser-v1',browser:BROWSER,
  testHost:os.platform(),viewport:{width:2859,height:1382},
  scene:SCENE,fixture:'synthetic-120-tile-not-real-user-archive',
  startedAt:new Date().toISOString(),results:{},errors:[]};
 try{
  const playwright=require('playwright');
  const engine=playwright[BROWSER];
  assert.ok(engine,'Unknown Playwright browser: '+BROWSER);
  browser=await engine.launch({headless:true});
  const ctx=await browser.newContext({
   viewport:collected.viewport,deviceScaleFactor:1,
   reducedMotion:'reduce',acceptDownloads:false
  });
  const seed=await ctx.newPage();
  await seed.goto(origin+'/tests/fixtures/frozen-ci-seed.html');
  const inserted=await seed.evaluate(async scene=>{
   const png=async canvas=>new Promise((resolve,reject)=>
    canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG failed')),'image/png'));
   function canvas(width,height,kind){
    const c=document.createElement('canvas');c.width=width;c.height=height;
    const g=c.getContext('2d',{alpha:true});
    if(kind==='ground'){
     g.fillStyle='#7d9a67';g.fillRect(0,0,width,height);
     g.fillStyle='#a3a875';
     for(let y=12;y<height;y+=36){
      g.fillRect(0,y,width,5);
     }
     g.strokeStyle='#54745b';g.lineWidth=3;
     for(let x=16;x<width;x+=48){
      g.beginPath();g.moveTo(x,0);g.lineTo(x+24,height);g.stroke();
     }
    }else{
     const s=width/768;
     g.save();g.scale(s,s);
     g.fillStyle='rgba(23,37,25,.30)';
     g.beginPath();g.ellipse(385,545,120,30,0,0,Math.PI*2);g.fill();
     g.fillStyle='#725337';g.fillRect(366,290,37,246);
     g.fillStyle='#284d37';
     for(const [x,y,r] of [[350,310,130],[432,345,112],[380,242,125]]){
      g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
     }
     g.restore();
    }
    return c;
   }
   async function store(dbname,entries){
    const db=await new Promise((resolve,reject)=>{
     const req=indexedDB.open(dbname,1);
     req.onupgradeneeded=()=>{
      if(!req.result.objectStoreNames.contains('tiles'))
       req.result.createObjectStore('tiles',{keyPath:'key'});
     };
     req.onsuccess=()=>resolve(req.result);
     req.onerror=()=>reject(req.error);
    });
    await new Promise((resolve,reject)=>{
     const tx=db.transaction('tiles','readwrite');
     for(const e of entries)tx.objectStore('tiles').put(e);
     tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
     tx.onabort=()=>reject(tx.error);
    });
    db.close();
   }
   const ground=canvas(512,512,'ground'),scenery=canvas(768,768,'scenery'),
    ground1=canvas(256,256,'blank'),scenery1=canvas(384,384,'blank');
   ground1.getContext('2d').drawImage(ground,0,0,256,256);
   scenery1.getContext('2d').drawImage(scenery,0,0,384,384);
   const [g2,s2,g1,s1]=await Promise.all(
    [ground,scenery,ground1,scenery1].map(png));
   const records=[],overview=[];
   for(let y=-5;y<5;y++)for(let x=-6;x<6;x++){
    const id=x+','+y,key=scene+'|near|'+id;
    const base={key,sceneKey:scene,level:'near',
     tile:{id,x:x*512,y:y*512,size:512},revision:'ci-readonly-v1'};
    records.push({...base,layers:[
     {layer:'ground',pad:3,png:g2},{layer:'scenery',pad:128,png:s2}
    ]});
    overview.push({...base,derivedFormat:'1x-png-v1',
     sourceRevision:'ci-readonly-v1',sourceFormat:'original',layers:[
      {layer:'ground',pad:3,png:g1},{layer:'scenery',pad:128,png:s1}
     ]});
   }
   const cells=[];
   for(let r=-10;r<=10;r++)for(let q=-9;q<=9;q++)
    cells.push({q,r,x:q*256,y:r*235,radius:146,
     visibility:(Math.abs(q)>8&&Math.abs(r)>8)?
      'hidden':(Math.abs(q)>7||Math.abs(r)>8)?'explored':'visible'});
   const manifest={key:scene+'|manifest',schema:1,sceneKey:scene,
    levels:['near'],cells,pose:{zoom:.85,panX:0,panY:0,dpr:2,
     projectY:.85},expectedTiles:records.length,
    clouds:{seed:'ci-encoded-clouds',assets:Array.from({length:4},(_,i)=>
     ({path:'tests/fixtures/clouds/ci-'+i+'.png'}))}};
   await store('vedras-frozen-world-v1',[manifest,...records]);
   await store('vedras-frozen-derived-1x-v1',overview);
   return {tiles:records.length,overview:overview.length,
    cells:cells.length,cloudAssets:manifest.clouds.assets.length};
  },SCENE);
  assert.equal(inserted.tiles,COUNT);
  assert.equal(inserted.overview,COUNT);
  assert.equal(inserted.cloudAssets,4);
  collected.seed=inserted;
  await seed.close();

  async function loadMode(mode){
   const page=await ctx.newPage();
   const errors=[];
   page.on('pageerror',err=>errors.push(String(err.message||err)));
   page.on('response',res=>{if(res.status()>=400)
    errors.push('HTTP '+res.status()+' '+res.url());});
   const url=origin+'/frozen-map-game.html?scene='+SCENE+
    '&lod=near&perf=1'+
    (mode==='legacy'?'&prefetchGuard=0':'')+
    (mode==='noStream'?'&streamCache=0':'')+
    (mode==='noCloudPad'?'&cloudPad=0':'')+
    (mode==='forceCloud'?'&cloudAuto=0':'')+
    (mode==='noFogCull'?'&fogCull=0':'')+
    (mode==='noWorldFast'?'&worldFast=0':'')+
    (mode==='wholeWorldBlit'?'&worldBlit=whole':'');
   await page.goto(url,{waitUntil:'load'});
   await page.waitForFunction(()=>window.__vedrasFrozenGameTest?.stats()?.saved===120,
    null,{timeout:20000});
   // Warm visible tiles BEFORE timing pan; otherwise we would only
   // benchmark the one-time image bootstrap and IndexedDB initialization.
   await page.waitForFunction(()=>{
    const t=window.__vedrasFrozenGameTest;
    if(!t)return false;
    const last=t.profileReport().frames.at(-1);
    return last&&last.visibleTiles>0&&
     last.visibleReadyTiles===last.visibleTiles;
   },null,{timeout:90000,polling:350});
   assert.equal(await page.evaluate(()=>
    window.__vedrasFrozenGameTest.stats().failures),0);
   assert.equal(await page.evaluate(()=>
    window.__vedrasFrozenGameTest.stats().saved),COUNT);
   const layerStats=await page.evaluate(()=>
    window.__vedrasFrozenGameTest.stats().clouds);
   assert.ok(layerStats&&layerStats.bases===4,
    'Four authored synthetic cloud layers must load in real browser');
   const coldReport=await page.evaluate(()=>
    window.__vedrasFrozenGameTest.profileReport());
   // Previous CI dropped initial load and world compositor regressions.
   fs.writeFileSync(path.join(OUTPUT,BROWSER+'-'+mode+'-cold.json'),
    JSON.stringify(coldReport,null,2));
   const cold={
    firstFullyVisibleMs:coldReport.firstFullyVisibleMs,
    frames:coldReport.frameCounts.stored,
    p95DrawMs:coldReport.phasesMs.drawMs.p95,
    worldFallbacks:coldReport.environment.runtime.worldCacheFallbackFrames,
    worldBuilds:coldReport.environment.runtime.overviewRasterBuilds,
    worldHits:coldReport.environment.runtime.overviewRasterHits,
    streamingBuilds:coldReport.environment.runtime.overviewStreamingBuilds||0,
    streamingHits:coldReport.environment.runtime.overviewStreamingHits||0,
    patchBuilds:coldReport.environment.runtime.overviewPatchBuilds||0,
    patchedTiles:coldReport.environment.runtime.overviewPatchedTiles||0,
    cloudBuilds:coldReport.environment.runtime.cloudBackdropBuilds,
    cloudHits:coldReport.environment.runtime.cloudBackdropHits,
    cloudFallbacks:coldReport.environment.runtime.cloudCacheFallbackFrames,
    cloudPad:coldReport.environment.runtime.cloudEffectivePad,
    cloudAutoMode:coldReport.environment.runtime.cloudAutoMode,
    cloudDirectMs:coldReport.environment.runtime.cloudAutoDirectMs,
    cloudCachedMs:coldReport.environment.runtime.cloudAutoCachedMs,
    fogCull:coldReport.environment.runtime.fogViewportCull,
    fogCells:coldReport.environment.runtime.fogUnreadySubmitted,
    fogCandidates:coldReport.environment.runtime.fogUnreadyCandidates,
    fogEdges:coldReport.environment.runtime.fogFrontierSubmitted,
    fogEdgeCandidates:coldReport.environment.runtime.fogFrontierCandidates,
    worldFastEnabled:coldReport.environment.runtime.worldCacheFastReuse,
    worldFastHits:coldReport.environment.runtime.overviewFastHits,
    worldRechecks:coldReport.environment.runtime.overviewRechecks,
    wholeWorldBlit:coldReport.environment.runtime.wholeWorldBlit
   };
   await page.evaluate(()=>window.__vedrasFrozenGameTest.profileReset());
   const rect=await page.locator('#game').boundingBox();
   assert.ok(rect&&rect.width>500&&rect.height>500);
   const x=rect.x+rect.width*.52,y=rect.y+rect.height*.49;
   const poseBefore=await page.evaluate(()=>
    window.__vedrasFrozenGameTest.pose());
   await page.mouse.move(x,y);
   await page.mouse.down();
   for(let i=1;i<=15;i++){
    await page.mouse.move(x+i*24,y+i*4);
    await page.waitForTimeout(18);
   }
   for(let i=14;i>=0;i--){
    await page.mouse.move(x+i*24,y+i*4);
    await page.waitForTimeout(18);
   }
   await page.mouse.up();
   await page.waitForTimeout(250);
   const poseAfter=await page.evaluate(()=>
    window.__vedrasFrozenGameTest.pose());
   assert.ok(Math.abs(poseAfter.panX-poseBefore.panX)<45,
    'Bidirectional pan returns close to starting camera position');
   const report=await page.evaluate(()=>
    window.__vedrasFrozenGameTest.profileReport());
   assert.equal(report.environment.runtime.failures,0);
   assert.equal(report.tiles.counts.failed,0);
   assert.ok(report.frameCounts.active>0,'Mouse pan must produce active renderer frames');
   assert.ok(report.phasesMs.drawMs.p95!=null,
    'Renderer must record actual draw timing');
   assert.ok(report.tiles.topRepeated.length<=12);
   assert.ok(report.environment.runtime.overviewRasterHits>=0);
   assert.ok(report.environment.runtime.cloudBackdropHits>=0);
   assert.deepEqual(errors,[],
    'Browser JS/network errors during automated camera path');
   const file=path.join(OUTPUT,BROWSER+'-'+mode+'.json');
   fs.writeFileSync(file,JSON.stringify(report,null,2));
   await page.locator('#game').screenshot({
    path:path.join(OUTPUT,BROWSER+'-'+mode+'.png'),timeout:20000
   });
   collected.results[mode]={
    cold,
    p95DrawMs:report.phasesMs.drawMs.p95,
    p95FrameGapMs:report.phasesMs.frameGapMs.p95,
    p95FogMs:report.phasesMs.fogMs.p95,
    p95FogCullMs:report.phasesMs.fogCullMs.p95,
    p95FogUnreadyMs:report.phasesMs.fogUnreadyMs.p95,
    p95FogTransitionsMs:report.phasesMs.fogTransitionsMs.p95,
    p95WorldMs:report.phasesMs.worldMs.p95,
    p95WorldPrepareMs:report.phasesMs.worldPrepareMs.p95,
    p95WorldBlitMs:report.phasesMs.worldBlitMs.p95,
    activeFrames:report.frameCounts.active,
    tileReads:report.tiles.counts.loaded,
    decodeRepeats:report.tiles.counts.repeated,
    evictions:report.environment.runtime.evictions,
    worldFallbacks:report.environment.runtime.worldCacheFallbackFrames,
    cloudFallbacks:report.environment.runtime.cloudCacheFallbackFrames,
    prefetchStarts:report.environment.runtime.prefetchReadStarts
   };
   return page;
  }
  const guarded=await loadMode('guarded');
  const legacy=await loadMode('legacy');
  const noStream=await loadMode('noStream');
  const noCloudPad=await loadMode('noCloudPad');
  const forceCloud=await loadMode('forceCloud');
  const noFogCull=await loadMode('noFogCull');
  const noWorldFast=await loadMode('noWorldFast');
  const wholeWorldBlit=await loadMode('wholeWorldBlit');
  // Compare the same real browser and a deterministic camera trace;
  // these limits are deliberately conservative to avoid falsely flagging
  // runner resource contention as a rendering failure. Report exact data.
  const fast=collected.results.guarded,ref=collected.results.legacy;
  assert.ok(fast.p95DrawMs<=Math.max(350,ref.p95DrawMs*2.5),
   'New policy causes catastrophic render-time regression');
  assert.ok(fast.decodeRepeats<=ref.decodeRepeats+COUNT,
   'New policy causes excessive repeated image decodes');
  const control=collected.results.noStream;
  assert.equal(control.cold.streamingBuilds,0,
   'streamCache=0 must disable partial streaming world composites');
  assert.equal(control.cold.streamingHits,0);
  assert.ok(fast.cold.streamingBuilds>0||fast.cold.streamingHits>0,
   'new default must cache the partial world while visible PNGs stream');
  assert.ok(fast.cold.worldFallbacks<control.cold.worldFallbacks,
   'partial cache must eliminate direct per-frame painting while loading');
  assert.ok(fast.cold.patchBuilds>0&&fast.cold.patchedTiles>0,
   'the actual Firefox canvas must update tile-sized dirty rectangles');
  assert.ok(fast.cold.worldBuilds<=Math.max(5,control.cold.worldBuilds+8),
   'regression: full-world raster built once for every arriving PNG');
  assert.ok(fast.p95DrawMs<=Math.max(70,control.p95DrawMs*1.35),
   'regression: partial world cache slower than streaming direct painter');
  assert.ok(fast.p95FrameGapMs<=Math.max(85,control.p95FrameGapMs*1.45),
   'regression: browser pan frame cadence much slower than direct painter');
  assert.ok(fast.cold.p95DrawMs<=Math.max(130,control.cold.p95DrawMs*1.45),
   'regression: huge full-world spikes during initial PNG streaming');
  const cloudControl=collected.results.noCloudPad;
  assert.equal(cloudControl.cold.cloudBuilds,0,
   'cloudPad=0 must reproduce failed cloud buffer allocation');
  assert.ok(cloudControl.cold.cloudFallbacks>0);
  assert.ok(fast.cold.cloudBuilds>0&&fast.cold.cloudHits>0,
   'adaptive cloud pad must be sampled as a real 1.25x backdrop');
  assert.ok(fast.cold.cloudPad>0&&fast.cold.cloudPad<272,
   'only offscreen overscan is reduced, not rendered cloud density');
  assert.ok(fast.cold.cloudAutoMode==='direct'||
   fast.cold.cloudAutoMode==='cached',
   'cold startup must finish cloud compositing A/B calibration');
  assert.ok(collected.results.forceCloud.cold.cloudBuilds>0,
   'force-cloud control proves cached cloud path still available');
  // A cached ~6MP blit cost 29ms p95 in the original CI vs just 7ms
  // direct; auto-calibration must prevent this measured regression.
  assert.ok(fast.p95DrawMs<=Math.max(70,cloudControl.p95DrawMs*1.28),
   'automatic cloud selection must not regress real Firefox pan p95');
  assert.ok(fast.p95FrameGapMs<=Math.max(85,cloudControl.p95FrameGapMs*1.32),
   'automatic cloud selection must not worsen real Firefox pan cadence');
  const fogControl=collected.results.noFogCull;
  assert.equal(fogControl.cold.fogCull,false,
   'fogCull=0 must pass the same complete authored Fog scene to the painter');
  assert.equal(fogControl.cold.fogCells,fogControl.cold.fogCandidates);
  assert.equal(fogControl.cold.fogEdges,fogControl.cold.fogEdgeCandidates);
  assert.equal(fast.cold.fogCull,true);
  assert.ok(fast.cold.fogCells<fogControl.cold.fogCells,
   'the actual 399-hex viewport must skip offscreen unready checks');
  assert.ok(fast.cold.fogEdges<=fogControl.cold.fogEdges,
   'frontier culling must never create additional cloud stamps');
  assert.ok(fast.p95DrawMs<=Math.max(90,fogControl.p95DrawMs*1.4),
   'regression: viewport-culling increases actual browser draw p95');
  assert.ok(fast.p95FrameGapMs<=Math.max(100,fogControl.p95FrameGapMs*1.45),
   'regression: Fog viewport pruning worsens active pan frame cadence');
  assert.ok(fast.p95FogCullMs!=null&&fast.p95FogUnreadyMs!=null&&
   fast.p95FogTransitionsMs!=null,'real Firefox Fog stage timings required');
  const worldControl=collected.results.noWorldFast;
  assert.equal(worldControl.cold.worldFastEnabled,false,
   'worldFast=0 must retain the original per-frame cache signature scan');
  assert.equal(worldControl.cold.worldFastHits,0,
   'the legacy control must not use the fast cache reuse path');
  assert.equal(fast.cold.worldFastEnabled,true);
  assert.ok(fast.cold.worldFastHits>0,
   'actual Firefox must exercise world cache reuse without a tile scan');
  assert.ok(fast.p95WorldPrepareMs!=null&&fast.p95WorldBlitMs!=null,
   'real Firefox must report measured world preparation and blit costs');
  assert.ok(fast.p95DrawMs<=Math.max(90,worldControl.p95DrawMs*1.4),
   'regression: world-cache fast reuse increases browser draw p95');
  assert.ok(fast.p95FrameGapMs<=Math.max(100,worldControl.p95FrameGapMs*1.45),
   'regression: world-cache fast reuse worsens active pan frame cadence');
  const alternative=collected.results.wholeWorldBlit;
  assert.equal(fast.cold.wholeWorldBlit,false,
   'the quality-preserving cropped world blit remains default');
  assert.equal(alternative.cold.wholeWorldBlit,true,
   'the browser must actually exercise the alternate 1:1 world blit');
  assert.ok(alternative.activeFrames>=15&&alternative.p95WorldBlitMs!=null,
   'the alternate path must measure real warm-pan blit timing');
  // This is an EXPERIMENT. Do not gate the baseline on its speed:
  // if full-canvas uploads are slower, leave the original path enabled.
  await wholeWorldBlit.close();
  await noWorldFast.close();
  await noFogCull.close();
  await forceCloud.close();
  await noCloudPad.close();
  await noStream.close();
  await legacy.close();

  // Real wheel/zoom UI, actual 1x IndexedDB variant, then back to 2x.
  for(let i=0;i<4;i++)await guarded.locator('#zoomOut').click();
  await guarded.waitForFunction(()=>
   window.__vedrasFrozenGameTest.stats().activeVariant==='1x',
   null,{timeout:20000});
  await guarded.waitForFunction(()=>
   window.__vedrasFrozenGameTest.stats().decoded1x>0,
   null,{timeout:25000});
  for(let i=0;i<5;i++)await guarded.locator('#zoomIn').click();
  await guarded.waitForFunction(()=>
   window.__vedrasFrozenGameTest.stats().activeVariant==='2x',
   null,{timeout:20000});
  const final=await guarded.evaluate(()=>
   ({stats:window.__vedrasFrozenGameTest.stats(),
    originalFilesNotModified:window.__vedrasFrozenGameTest.readOnly}));
  assert.equal(final.stats.failures,0);
  assert.equal(final.originalFilesNotModified,true);
  collected.results.lod={
   finalVariant:final.stats.activeVariant,decoded1x:final.stats.decoded1x,
   decoded2x:final.stats.decoded2x,failures:final.stats.failures
  };
  await guarded.close();
  await ctx.close();
  collected.passed=true;
 }catch(error){
  collected.errors.push(String(error.stack||error));
  throw error;
 }finally{
  collected.completedAt=new Date().toISOString();
  fs.writeFileSync(path.join(OUTPUT,BROWSER+'-summary.json'),
   JSON.stringify(collected,null,2));
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
 }
};
run().catch(error=>{console.error(error);process.exitCode=1;});

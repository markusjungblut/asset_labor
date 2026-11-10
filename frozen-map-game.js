/* Standalone static-asset playback. This page loads no authoring modules,
 * no terrain/image Worker and no WorldTile source factory. */
'use strict';
(async()=>{
 const $=id=>document.getElementById(id),
  params=new URLSearchParams(location.search),
  scene=params.get('scene'),requestedLevel=params.get('lod');
 const output=$('message'),metrics=$('metrics'),zoomLabel=$('zoom');
 const benchmark=$('atlasBenchmark');
 if(benchmark&&scene)benchmark.href='frozen-map-benchmark.html?scene='+encodeURIComponent(scene);
 const canvas=$('game'),fogOverlay=$('fogOverlay');
 function fail(error){
  output.textContent=String(error?.message||error)+
   ' · Im Asset-Labor zuerst „Gesamte Karte einmalig vorbereiten“ verwenden.';
  metrics.textContent='Kein Terrain-Worker aktiv';
 }
 if(!/^v1-[0-9a-f]{8}$/.test(scene||'')){fail('Ungültige Kartenkennung');return;}
 // Profiling is opt-in and does nothing in the normal game playback.
 const profileRequested=params.get('perf')==='1';
 const profiler=profileRequested?
  window.VedrasFrozenProfiler?.create():null;
 if(profileRequested&&!profiler){
  fail('Performance-Modul konnte nicht geladen werden. Browser-Cache aktualisieren');
  return;
 }
 const twoXStore=window.VedrasFrozenDerived2x.createStore();
 const oneXStore=window.VedrasFrozenDerived1x.createStore({source:twoXStore});
 const overview1x=params.get('overview1x')!=='0';
 const largeViewportCache=params.get('cacheLarge')!=='0';
 // Regression control: preserve 25C prefetch policy with ?prefetchGuard=0.
 const prefetchGuard=params.get('prefetchGuard')!=='0';
 // A/B: simulate the former full repaint until every visible tile is ready.
 const streamingWorldCache=params.get('streamCache')!=='0';
 // Legacy soft-cloud raster A/B without changing world imagery or opacity.
 const adaptiveCloudCache=params.get('cloudPad')!=='0';
 // Force always-cached for A/B. Default measures direct vs. cached blits.
 const autoCloudStrategy=params.get('cloudAuto')!=='0';
 // Compare the same Fog artwork with and without conservative culling.
 const fogViewportCull=params.get('fogCull')!=='0';
 // A/B: skip unchanged cached-world tile scans while the camera stays inside pad.
 const worldCacheFastReuse=params.get('worldFast')!=='0';
 // Proven warm-pan benefit within unchanged hard raster limits; turn off
 // individually using &worldPad=0 and &worldBands=0.
 const adaptiveWorldPad=params.get('worldPad')!=='0';
 const sparseWorldBlit=params.get('worldBands')!=='0';
 // Step25Q: indexed authorized hex coverage, independent reversible opt-out.
 const indexedWorldBands=params.get('bandIndex')!=='0';
 // Diagnostic override for historic 397-hex map, never production default.
 const worldBandIndexMinCells=profileRequested&&params.get('bandIndexMin')==='256'?
  256:400;
 // Step25P: skip O(all stored tiles) selection scans on large worlds.
 // The original Set scanner remains available with &tileIndex=0.
 const indexedTileSelection=params.get('tileIndex')!=='0';
 // Diagnostic only until the Firefox pan/animation A/B is accepted.
 const layeredFog=params.get('fogLayer')==='1'&&!!fogOverlay;
 if(fogOverlay)fogOverlay.hidden=!layeredFog;
 // A compact UI for the most relevant, reversible game-viewer switches.
 // A reload re-reads only the prepared atlas; it never alters or rebakes it.
 for(const [id,parameter,active] of [
  ['optWorldPad','worldPad',adaptiveWorldPad],
  ['optWorldBands','worldBands',sparseWorldBlit],
  ['optWorldBandIndex','bandIndex',indexedWorldBands],
  ['optTileIndex','tileIndex',indexedTileSelection],
  ['optFogLayer','fogLayer',layeredFog]
 ]){
  const checkbox=$(id);
  if(!checkbox)continue;
  checkbox.checked=active;
  checkbox.addEventListener('change',()=>{
   const next=new URL(location.href);
   next.searchParams.set(parameter,checkbox.checked?'1':'0');
   location.assign(next.pathname+next.search+next.hash);
  });
 }
 // Optional A/B reference: identical source layers, no cached composites.
 // Never modifies or clears the derived PNGs in IndexedDB.
 const directRenderer=params.get('render')==='direct';
 let lastStatusPaint=-Infinity;
 const player=window.VedrasFrozenMap.create({
  canvas,fogCanvas:layeredFog?fogOverlay:null,
  storage:oneXStore,useLayerCache:!directRenderer,profiler,
  overview1x,largeViewportCache,prefetchGuard,streamingWorldCache,
  adaptiveCloudCache,autoCloudStrategy,fogViewportCull,worldCacheFastReuse,
  adaptiveWorldPad,sparseWorldBlit,indexedTileSelection,indexedWorldBands,
  worldBandIndexMinCells,onStatus:stats=>{
   // The Canvas is unaffected by diagnostics; avoid long DOM/text updates
   // on each rAF while the user pans, zooms or watches fog dissolve.
   const now=performance.now();
   if(stats.frames>1&&now-lastStatusPaint<180)return;
   lastStatusPaint=now;
   const optimized=twoXStore.stats(),overview=oneXStore.stats();
   metrics.textContent=stats.decoded+' / '+stats.saved+
    ' gespeicherte Tiles im Bildspeicher · '+stats.pending+
    ' PNG-Lesevorgänge · '+stats.paintMs.toFixed(1)+
    ' ms pro Bild · 0 Terrain-Bakes · Wolken: '+
    (stats.clouds?.bases??0)+'/4'+
    ' · Wolkenvorlauf ≥ '+stats.cloudBufferHexes+' Hex'+
    (stats.cloudDissolveActive?' · Auflösen aktiv':'')+
    (stats.zoomPreviewActive?' · Zoomvorschau aktiv':'')+
    ' · Zoomvorschau-Bilder '+stats.zoomPreviewFrames+
    ' · Übersicht-Canvas '+stats.overviewRasterHits+' Treffer / '+
    stats.overviewRasterBuilds+' Neuaufbauten'+
    ' · Wolken-Cache '+stats.cloudBackdropHits+' Treffer / '+
    stats.cloudBackdropBuilds+' Neuaufbauten'+
    (optimized.enabled?' · 2×-Cache: '+optimized.hits+' Treffer / '+
     optimized.converted+' einmalig erzeugt'+
     (optimized.pending?' / '+optimized.pending+' in Arbeit':'')+
     (optimized.failures?' · Speicherwarnungen '+optimized.failures:''):'')+
    (overview1x?' · LOD '+stats.activeVariant+
     ' · 1×-Cache '+overview.hits+' / '+overview.converted:
     ' · 1×-LOD deaktiviert')+
    ' · 1×/2× im RAM '+stats.decoded1x+'/'+stats.decoded2x+
    ' · Evictions '+stats.evictions+
    ' · Re-Decodes '+stats.decodeRepeats+
    ' · Hintergrund '+stats.prefetchReadStarts+
    ' · Vorladen gebremst '+stats.prefetchSkippedBudget+
    ' · Raster '+(largeViewportCache?'groß':'alt')+
    ' · Direkt-Welt/Wolken '+stats.worldCacheFallbackFrames+'/'+
     stats.cloudCacheFallbackFrames+
    (profiler?' · Profilframes: '+profiler.stats().frames:'');
   metrics.title=metrics.textContent;
   const p=player.getPose();if(p)zoomLabel.textContent=Math.round(p.zoom*100)+' %';
  }
 });
 let startPose=null,drag=null,manifestReadMs=null,sceneRegisterMs=null;
 try{
  const manifestReadStarted=performance.now();
  const manifest=await player.loadManifest(scene);
  manifestReadMs=performance.now()-manifestReadStarted;
  const lod=manifest.levels.includes(requestedLevel)?requestedLevel:
   manifest.levels[0];
  // Derive 2× images ONLY for legacy full 4× near PNG sources.
  // The originals and the manifest continue to live in the original DB.
  twoXStore.setEnabled(lod==='near'&&Number(manifest.pose?.dpr)>=3);
  oneXStore.setEnabled(overview1x&&lod==='near');
  startPose=manifest.pose||{zoom:.81,panX:0,panY:0,dpr:1,projectY:.85};
  // The browser may have a different DPR than the authoring machine;
  // image tiles retain their stored pixel density, not new CPU raster jobs.
  // 2× is the deliberate GAME quality standard, even on 1× desktop
   // monitors. Limit huge windows by an 8 MP backing budget / 4096px edge.
   // Neither stored archive pose.dpr=4 nor OS devicePixelRatio sets it.
   const area=Math.max(1,canvas.clientWidth*canvas.clientHeight);
   const edge=Math.max(1,canvas.clientWidth,canvas.clientHeight);
   const gameDpr=Math.min(2,Math.sqrt(8000000/area),4096/edge);
   startPose={...startPose,dpr:window.VedrasFrozenViewPolicy?
    window.VedrasFrozenViewPolicy.displayDpr({
     zoom:startPose.zoom,width:canvas.clientWidth,height:canvas.clientHeight,
     baseDpr:2}):Math.max(1,gameDpr)};
  // Clouds are a separate read-only overlay, not a terrain/WorldTile bake.
  player.setClouds(manifest.clouds||{});
  const registerStarted=performance.now();
  const status=await player.load(scene,lod,startPose,manifest.cells);
  sceneRegisterMs=performance.now()-registerStarted;
  const raster=$('rasterQuality');
  if(raster)raster.textContent='Raster '+startPose.dpr.toFixed(1).replace('.0','')+'×';
  output.textContent=(twoXStore.stats().enabled?
   '2×-Spielansicht: 4×-Quellkacheln werden beim ersten Besuch einmalig verkleinert und separat gespeichert. ':'')+
   (directRenderer?'Direktvergleich: keine Panorama-/Wolkenraster-Caches. ':'')+
   'Gespeicherte Karte '+scene+' · '+lod+' · '+
   status.saved+' / '+(manifest.expectedTiles??'?')+
   ' vollständig vorgerenderte Bildkacheln verfügbar.'+
   (manifest.expectedTiles!=null&&status.saved<manifest.expectedTiles?
    ' Karte UNVOLLSTÄNDIG: Fehlende Regionen bleiben unter Wolken. Im Asset-Labor fehlende Kacheln nachberechnen.':
    status.saved?' Kamera verschieben und zoomen.':
    ' Noch keine vollständigen Kacheln für diese Detailstufe.');
  output.title=output.textContent;
  player.draw();
 }catch(error){fail(error);return;}
 const setPose=(next,{deferDpr=false}={})=>{
  const prior=player.getPose();
  if(!prior)return;
  const view={...prior,...next};
  const policy=window.VedrasFrozenViewPolicy;
  const outDpr=policy?policy.displayDpr({
   zoom:view.zoom,width:canvas.clientWidth,height:canvas.clientHeight,
   baseDpr:2
  }):Math.min(2,view.dpr||1);
  if(!deferDpr&&Math.abs(outDpr-(view.dpr||1))>.015){
   next={...next,dpr:outDpr};
   const raster=$('rasterQuality');
   if(raster)raster.textContent='Raster '+outDpr.toFixed(2).replace(/0+$/,'').replace(/\.$/,'')+'×';
  }
  player.setPose(next);
 };
 let zoomSettler=null;
 const settleZoom=()=>{
  zoomSettler=null;
  // Final canvas backing density is calculated only once after wheel idle.
  // Live world layers (never a blurry screenshot) remain visible throughout.
  setPose({});
 };
 const onZoom=(factor,x=canvas.clientWidth/2,y=canvas.clientHeight/2)=>{
  const p=player.getPose();if(!p)return;
  if(profiler)profiler.input('zoom');
  const zoom=Math.min(4,Math.max(.15,p.zoom*factor));
  const wx=(x-canvas.clientWidth/2-p.panX)/p.zoom,
   wy=(y-canvas.clientHeight/2-p.panY)/(p.zoom*(p.projectY||.85));
  // Keep the backing raster at a bounded overview-like scale while the
  // wheel is active; recompute the REAL scene every animation frame.
  // Avoid repeatedly reallocating the display canvas during the gesture.
  const gestureDpr=Math.min(p.dpr||2,1.25);
  setPose({zoom,panX:x-canvas.clientWidth/2-wx*zoom,
   panY:y-canvas.clientHeight/2-wy*zoom*(p.projectY||.85),
   dpr:gestureDpr},{deferDpr:true});
  if(zoomSettler!==null)clearTimeout(zoomSettler);
  zoomSettler=setTimeout(settleZoom,130);
 };
 $('zoomIn').addEventListener('click',()=>onZoom(1.15));
 $('zoomOut').addEventListener('click',()=>onZoom(1/1.15));
 $('resetView').addEventListener('click',()=>{
  if(zoomSettler!==null)clearTimeout(zoomSettler);
  zoomSettler=null;
  setPose(startPose);
 });
 canvas.addEventListener('wheel',e=>{
  e.preventDefault();
  const r=canvas.getBoundingClientRect();
  onZoom(e.deltaY<0?1.1:1/1.1,e.clientX-r.left,e.clientY-r.top);
 },{passive:false});
 canvas.addEventListener('pointerdown',e=>{
  drag={id:e.pointerId,x:e.clientX,y:e.clientY};
  canvas.setPointerCapture?.(e.pointerId);
 });
 canvas.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const p=player.getPose();if(!p)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!dx&&!dy)return;
  if(profiler)profiler.input('pan');
  drag.x=e.clientX;drag.y=e.clientY;
  // Do not scale a 4-MP low-res snapshot across 2x scenery. Instead move
  // the real camera and let the padded world/cloud raster caches repaint.
  // Tile reads, fog readiness and fades continue WHILE dragging.
  setPose({panX:p.panX+dx,panY:p.panY+dy},{deferDpr:true});
 });
 for(const evt of ['pointerup','pointercancel','lostpointercapture'])
  canvas.addEventListener(evt,()=>{drag=null;});
 // Layout-driven statistics never trigger a resize. Genuine viewport size
 // changes preserve the current world pose and all decoded image tiles;
 // repaint at most once per animation frame.
 let lastViewportW=Math.floor(canvas.clientWidth),
  lastViewportH=Math.floor(canvas.clientHeight),resizeScheduled=false;
 const handleViewportResize=()=>{
  if(resizeScheduled)return;
  resizeScheduled=true;
  requestAnimationFrame(()=>{
   resizeScheduled=false;
   const w=Math.floor(canvas.clientWidth),h=Math.floor(canvas.clientHeight);
   if(w===lastViewportW&&h===lastViewportH)return;
   lastViewportW=w;lastViewportH=h;
   if(zoomSettler!==null){clearTimeout(zoomSettler);zoomSettler=null;}
   setPose({});
  });
 };
 if(typeof ResizeObserver==='function')
  new ResizeObserver(handleViewportResize).observe(canvas);
 else window.addEventListener('resize',handleViewportResize);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)player.draw();});
 const profileStatus=()=>({
  enabled:!!profiler,
  requested:profileRequested,
  frames:profiler?.stats().frames??0,
  message:profiler?
   'Performance-Aufzeichnung aktiv. profileReset() setzt die Messwerte zurück.':
   'Performance-Aufzeichnung ist ausgeschaltet. URL mit &perf=1 öffnen.'
 });
 const profileReset=()=>{
  if(!profiler)return {
   ok:false,...profileStatus(),
   message:'Keine Aufzeichnung aktiv. Bitte &perf=1 in der URL ergänzen.'
  };
  profiler.reset();
  return {ok:true,...profileStatus(),
   message:'Messwerte zurückgesetzt. Jetzt Karte bewegen und Performance-JSON exportieren.'};
 };
 const profileReport=()=>profiler?
  profiler.report({
   scene,level:requestedLevel||'near',
   renderMode:directRenderer?'direct':'cached',
   browser:navigator.userAgent,
   viewportCss:{width:canvas.clientWidth,height:canvas.clientHeight},
   canvasBacking:{width:canvas.width,height:canvas.height},
   startup:{manifestReadMs,sceneRegisterMs},
   runtime:player.report(),derived2x:twoXStore.stats(),
   derived1x:oneXStore.stats(),overview1x,largeViewportCache,
   prefetchGuard,streamingWorldCache,adaptiveCloudCache,autoCloudStrategy,
   fogViewportCull,layeredFog,adaptiveWorldPad,sparseWorldBlit,
   indexedTileSelection,indexedWorldBands,worldBandIndexMinCells
  }):{
   enabled:false,
   message:'Performance-Aufzeichnung ist ausgeschaltet. Öffne die Testkarte mit &perf=1.',
   currentUrl:location.href
  };
 if(profiler){
  const button=$('downloadProfile');
  if(button){
   button.hidden=false;
   button.addEventListener('click',()=>{
    const body=JSON.stringify(profileReport(),null,2);
    const url=URL.createObjectURL(new Blob([body],{type:'application/json'}));
    const link=document.createElement('a');
    link.href=url;link.download='vedras_profile_'+scene+
     '_'+(directRenderer?'direct':'cached')+'.json';
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
   });
  }
 }

 // Step 25Q: optional, reproducible browser A/B capture on the real atlas.
 // Only available under ?perf=1. Never changes stored atlas or Fog rights.
 let panABRunning=false;
 const frameTick=()=>new Promise(resolve=>requestAnimationFrame(resolve));
 const downloadJson=(body,name)=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(body,null,2)],
   {type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=name;
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const runPanAB=async({steps=96,warmupSteps=96,download=false,
   shouldAbort=null}={})=>{
  if(!profiler)throw Error('Messfahrt erfordert ?perf=1');
  if(panABRunning)throw Error('Eine Messfahrt läuft bereits');
  if(!startPose||!player.report().active)throw Error('Karte noch nicht geladen');
  if(document.hidden)throw Error('Messfahrt nur im sichtbaren Tab starten');
  steps=Math.max(24,Math.min(180,Math.trunc(Number(steps))||96));
  warmupSteps=Math.max(0,Math.min(180,Math.trunc(Number(warmupSteps))||0));
  const viewW=canvas.clientWidth,viewH=canvas.clientHeight;
  if(viewW<1||viewH<1)throw Error('Keine gültige Canvas-Größe');
  const base={...startPose};
  const amplitudeX=Math.min(viewW*.9,960),
   amplitudeY=Math.min(viewH*.35,420);
  const ensureActive=()=>{
   if(document.hidden)throw Error('Messung abgebrochen: Tab nicht sichtbar');
   if(typeof shouldAbort==='function'&&shouldAbort())
    throw Error('Messung abgebrochen: A/B-Serie angehalten');
  };
  const pass=async count=>{
   for(let i=0;i<count;i++){
    ensureActive();
    await frameTick();
    ensureActive();
    const t=(i+1)/count;
    profiler.input('pan');
    player.setPose({zoom:base.zoom,dpr:base.dpr,
     panX:base.panX+amplitudeX*Math.sin(2*Math.PI*t),
     panY:base.panY+amplitudeY*Math.sin(4*Math.PI*t)});
   }
   // Last scheduled paint must finish before sampling.
   await frameTick();ensureActive();
   await frameTick();ensureActive();
  };
  panABRunning=true;
  try{
   player.setPose(base);
   await frameTick();await frameTick();
   if(warmupSteps)await pass(warmupSteps);
   player.setPose(base);
   // Allow visible async reads and 850ms fades to settle; bound wait.
   let quiet=0,settleElapsedMs=0;
   const settleStarted=performance.now();
   for(let i=0;i<320;i++){
    ensureActive();
    await frameTick();
    ensureActive();
    quiet=player.report().pending===0?quiet+1:0;
    settleElapsedMs=performance.now()-settleStarted;
    // At 120/144 Hz, 60 frames are shorter than the 850ms Fog fade.
    if(quiet>=60&&settleElapsedMs>=1100)break;
   }
   const before=player.report(),startedAt=new Date().toISOString();
   profiler.reset();
   const wallStart=performance.now();
   await pass(steps);
   const elapsedMs=performance.now()-wallStart;
   const after=player.report();
   const result=profileReport();
   result.abCapture={
    schema:'vedras-step25q-local-ab-v2',
    trace:'pan-lissajous-20261110-v1',
    startedAt,finishedAt:new Date().toISOString(),
    scene,level:after.level,bandIndexRequested:indexedWorldBands,
    bandIndexActive:!!before.worldBandIndexActive,
    indexEntries:before.worldBandIndexEntries,
    indexMinimumCells:worldBandIndexMinCells,
    cellCount:before.worldBandTotalCells,
    authorizedCells:before.worldBandAuthorizedCells,
    framesPlanned:steps,warmupFrames:warmupSteps,
    quietFrames:quiet,settleElapsedMs:Math.round(settleElapsedMs),
    settled:quiet>=60&&settleElapsedMs>=1100,
    elapsedMs:Math.round(elapsedMs*100)/100,
    viewportCss:{width:viewW,height:viewH},
    basePose:{zoom:base.zoom,panX:base.panX,panY:base.panY,
     dpr:base.dpr,projectY:base.projectY},
    candidateBefore:{
     indexed:before.worldBandIndexCandidateCells,
     legacy:before.worldBandLegacyCandidateCells},
    candidateAfter:{
     indexed:after.worldBandIndexCandidateCells,
     legacy:after.worldBandLegacyCandidateCells},
    indexQueriesBefore:before.worldBandIndexQueries,
    indexQueriesAfter:after.worldBandIndexQueries,
    sparseFramesBefore:before.sparseWorldBlitFrames,
    sparseFramesAfter:after.sparseWorldBlitFrames,
    sparseFallbacksBefore:before.sparseWorldBlitFallbacks,
    sparseFallbacksAfter:after.sparseWorldBlitFallbacks,
    worldBlitPixelsBefore:before.worldBlitDevicePixels,
    worldBlitPixelsAfter:after.worldBlitDevicePixels,
    worldBlitFullPixelsBefore:before.worldBlitFullDevicePixels,
    worldBlitFullPixelsAfter:after.worldBlitFullDevicePixels,
    pendingBefore:before.pending,pendingAfter:after.pending,
    failuresBefore:before.failures,failuresAfter:after.failures,
    warmCountersBefore:{
     loads:before.loads,visibleReadStarts:before.visibleReadStarts,
     prefetchReadStarts:before.prefetchReadStarts,
     decodeRepeats:before.decodeRepeats,evictions:before.evictions},
    warmCountersAfter:{
     loads:after.loads,visibleReadStarts:after.visibleReadStarts,
     prefetchReadStarts:after.prefetchReadStarts,
     decodeRepeats:after.decodeRepeats,evictions:after.evictions}
   };
   if(download)downloadJson(result,'vedras_step25q_'+
    (indexedWorldBands?'indexed':'legacy')+'_'+scene+'_'
    +new Date().toISOString().replace(/[:.]/g,'-')+'.json');
   return result;
  }finally{
   panABRunning=false;
   player.setPose(base);
  }
 };
 if(profiler){
  const captureButton=$('runBandIndexAB');
  if(captureButton){
   captureButton.hidden=false;
   captureButton.addEventListener('click',async()=>{
    captureButton.disabled=true;
    const originalText=captureButton.textContent;
    captureButton.textContent='Messfahrt läuft …';
    try{
     const result=await runPanAB({download:true});
     output.textContent='Messfahrt abgeschlossen: '+
      result.abCapture.framesPlanned+' Pan-Schritte · '+
      (indexedWorldBands?'Hex-Index an':'Hex-Index aus')+
      '. JSON gespeichert. Gegenseite über Optimierungen messen.';
    }catch(error){output.textContent='Messfahrt: '+String(error.message||error);}
    finally{captureButton.disabled=false;captureButton.textContent=originalText;}
   });
  }
 }

 // An explicitly requested, tab-local six-run A/B series. A reload is
 // essential: it reinstantiates the SAME renderer with/without its index.
 // sessionStorage contains only bounded diagnostic JSON, never source PNGs,
 // authoring data, Fog permissions, or persistent IndexedDB changes.
 const AB_SERIES_KEY='vedras-step25q-ab-series-v1';
 const AB_SERIES_ORDER=[false,true,true,false,false,true];
 const seriesButton=$('runBandIndexSeries');
 const clearSeriesButton=$('clearBandIndexSeries');
 const stableSeriesUrl=()=>{
  const url=new URL(location.href);
  url.searchParams.delete('bandIndex');
  return url.pathname+url.search+url.hash;
 };
 const readSeries=()=>{
  const raw=sessionStorage.getItem(AB_SERIES_KEY);
  if(!raw)return null;
  const data=JSON.parse(raw);
  if(data.schema!=='vedras-step25q-local-series-v1'||
     data.scene!==scene||data.pageKey!==stableSeriesUrl()||
     !Number.isFinite(data.startedMs)||Date.now()-data.startedMs>
       (data.step===AB_SERIES_ORDER.length?86400000:2700000)||
     !Number.isInteger(data.step)||data.step<0||
     data.step>AB_SERIES_ORDER.length||
     !Array.isArray(data.captures)||data.captures.length!==data.step)
   throw Error('Ungültige oder abgelaufene A/B-Serie');
  return data;
 };
 const saveSeries=s=>sessionStorage.setItem(AB_SERIES_KEY,JSON.stringify(s));
 const cancelSeries=()=>{
  sessionStorage.removeItem(AB_SERIES_KEY);
  if(seriesButton){seriesButton.disabled=false;
   seriesButton.textContent='Dreifach-A/B starten';}
  if(clearSeriesButton)clearSeriesButton.hidden=true;
 };
 const indexUrl=enabled=>{
  const url=new URL(location.href);
  url.searchParams.set('bandIndex',enabled?'1':'0');
  return url.pathname+url.search+url.hash;
 };
 let seriesBusy=false;
 const runSeriesStep=async()=>{
  if(seriesBusy)return;
  let state;
  try{state=readSeries();}catch(error){
   cancelSeries();output.textContent='A/B-Serie: '+String(error.message||error);return;
  }
  if(!state||state.step===AB_SERIES_ORDER.length){
   if(state&&seriesButton)seriesButton.textContent='A/B-Serie herunterladen';
   if(state&&clearSeriesButton)clearSeriesButton.hidden=false;
   return;
  }
  if(!profiler||document.hidden){
   cancelSeries();
   output.textContent='A/B-Serie abgebrochen: Profilmodus und sichtbarer Tab erforderlich.';
   return;
  }
  if(indexedWorldBands!==AB_SERIES_ORDER[state.step]){
   location.assign(indexUrl(AB_SERIES_ORDER[state.step]));
   return;
  }
  seriesBusy=true;
  if(seriesButton){
   seriesButton.disabled=false;
   seriesButton.textContent='Serie '+(state.step+1)+'/6 läuft – Abbrechen';
  }
  const oldSingle=$('runBandIndexAB');
  if(oldSingle)oldSingle.disabled=true;
  try{
   const sample=await runPanAB({
    steps:state.steps,warmupSteps:state.warmupSteps,download:false,
    shouldAbort:()=>!sessionStorage.getItem(AB_SERIES_KEY)});
   const stillRunning=readSeries();
   if(!stillRunning||stillRunning.step!==state.step)
    throw Error('Serie während der Messfahrt abgebrochen');
   if(sample.abCapture.settled!==true)
    throw Error('Aufwärmphase nicht stabil; Serie verworfen');
   if(sample.abCapture.bandIndexRequested!==AB_SERIES_ORDER[state.step])
    throw Error('Falscher Modus; Serie verworfen');
   if(AB_SERIES_ORDER[state.step]&&!sample.abCapture.bandIndexActive)
    throw Error('Index nicht aktiv; bei kleiner Karte &bandIndexMin=256 im Profilmodus ergänzen');
   state.captures.push(sample);
   state.step++;
   saveSeries(state);
   if(state.step===AB_SERIES_ORDER.length){
    if(seriesButton)seriesButton.textContent='A/B-Serie herunterladen';
    if(clearSeriesButton)clearSeriesButton.hidden=false;
    const contaminated=state.captures.some(p=>{
     const c=p.abCapture;
     return c.pendingAfter!==0||p.tileReads?.length>0||
      ['loads','visibleReadStarts','prefetchReadStarts',
       'decodeRepeats','evictions'].some(k=>
        c.warmCountersAfter?.[k]!==c.warmCountersBefore?.[k]);
    });
    output.textContent=contaminated?
     'Drei A/B-Paare aufgezeichnet, aber zusätzliche Tile-Reads oder '+
      'Cache-Verdrängungen wurden während der Messung erkannt. '+
      'Kein gültiger Warm-Cache-Vergleich; JSON zur Diagnose herunterladen.':
     'Drei A/B-Paare aufgezeichnet. A/B-Serie herunterladen '+
      'und mit dem Offline-Prüfer auswerten.';
   }else{
    location.assign(indexUrl(AB_SERIES_ORDER[state.step]));
   }
  }catch(error){
   cancelSeries();output.textContent='A/B-Serie: '+String(error.message||error);
  }finally{
   seriesBusy=false;
   if(oldSingle)oldSingle.disabled=false;
  }
 };
 const startABSeries=async({steps=96,warmupSteps=96}={})=>{
  if(!profiler)throw Error('A/B-Serie benötigt ?perf=1');
  if(seriesBusy)throw Error('A/B-Serie läuft bereits');
  if(!startPose||!player.report().active)throw Error('Karte nicht geladen');
  if(document.hidden)throw Error('A/B-Serie benötigt sichtbaren Tab');
  if(!player.report().sparseWorldBlit||directRenderer)
   throw Error('A/B-Serie erfordert gecachten World-Blit (worldBands=1)');
  if(sessionStorage.getItem(AB_SERIES_KEY))
   throw Error('Vorherige A/B-Serie abschließen oder abbrechen');
  const state={schema:'vedras-step25q-local-series-v1',
   scene,pageKey:stableSeriesUrl(),startedMs:Date.now(),
   startedAt:new Date().toISOString(),step:0,captures:[],
   steps:Math.max(24,Math.min(180,Math.trunc(Number(steps))||96)),
   warmupSteps:Math.max(0,Math.min(180,Math.trunc(Number(warmupSteps))||96)),
   order:AB_SERIES_ORDER};
  saveSeries(state);
  await runSeriesStep();
  return true;
 };
 if(profiler&&seriesButton){
  seriesButton.hidden=false;
  seriesButton.addEventListener('click',()=>{
   try{
    const state=readSeries();
    if(state?.step===AB_SERIES_ORDER.length){
     downloadJson({...state,finishedAt:new Date().toISOString()},
      'vedras_step25q_series_'+scene+'_'
      +new Date().toISOString().replace(/[:.]/g,'-')+'.json');
     // Download activation cannot certify successful saving on disk.
     // Keep the only copy until explicit user-side cleanup.
     seriesButton.textContent='A/B-Serie erneut herunterladen';
     if(clearSeriesButton)clearSeriesButton.hidden=false;
     output.textContent='Download ausgelöst. Datei prüfen; bei Bedarf erneut herunterladen. '+
      'Anschließend Seriendaten löschen. Auswertung: '+
      'node tests/compare_rendering_step25q_profiles.cjs SERIE.json';
    }else if(state){
     cancelSeries();output.textContent='A/B-Serie abgebrochen.';
    }else{
     startABSeries().catch(error=>{
      cancelSeries();output.textContent='A/B-Serie: '+String(error.message||error);
     });
    }
   }catch(error){
    cancelSeries();output.textContent='A/B-Serie: '+String(error.message||error);
   }
  });
  if(clearSeriesButton)clearSeriesButton.addEventListener('click',()=>{
   try{
    if(readSeries()?.step!==AB_SERIES_ORDER.length)return;
    cancelSeries();
    output.textContent='A/B-Seriendaten im Tab gelöscht.';
   }catch(error){
    cancelSeries();output.textContent='A/B-Serie: '+String(error.message||error);
   }
  });
  try{
   const stored=readSeries();
   if(stored){
    if(stored.step===AB_SERIES_ORDER.length){
     seriesButton.textContent='A/B-Serie herunterladen';
     if(clearSeriesButton)clearSeriesButton.hidden=false;
    }
    else Promise.resolve().then(runSeriesStep);
   }else seriesButton.textContent='Dreifach-A/B starten';
  }catch(error){
   cancelSeries();output.textContent='A/B-Serie: '+String(error.message||error);
  }
 }

 window.__vedrasFrozenGameTest={
  stats:()=>player.report(),pose:()=>player.getPose(),
  profileReport,profileReset,profileStatus,runPanAB:profiler?runPanAB:null,
  startABSeries:profiler?startABSeries:null,
  // Explicit opt-in diagnostic repaint: never mutates atlas or Fog rights.
  forceRedraw:()=>player.draw(),
  // CI only (perf=1): deterministic camera motion, never modify atlas data.
  testPan:profileRequested?(patch)=>{
   profiler.input('pan');player.setPose(patch);return true;
  }:null,
  // Read-only diagnostic: no editor instance, no workers, no tile sources.
  readOnly:true,scene,derived2x:()=>twoXStore.stats(),
  derived1x:()=>oneXStore.stats()
 };
})();
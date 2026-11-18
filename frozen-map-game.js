/* Standalone static-asset playback. This page loads no authoring modules,
 * no terrain/image Worker and no WorldTile source factory. */
'use strict';
(async()=>{
 const $=id=>document.getElementById(id),
  params=new URLSearchParams(location.search),
  requestedScene=params.get('scene'),requestedLevel=params.get('lod');
 let scene=requestedScene,shadowSuccessorSource=null;
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
 // Normal playback selects genuine native 4x Ground automatically where
 // PNG-IHDR confirms it. The previous URL-only opt-in hid the quality
 // users expected. Both options remain reversible for A/B regression tests.
 const groundDetailRequested=params.get('ground4x')!=='0';
 const adaptiveGroundDecode=groundDetailRequested&&
  params.get('groundDecode')!=='full';
 let groundDetailActive=false;
 const groundDetailStore=window.VedrasFrozenGroundDetail.createStore({
  standard:twoXStore,overview:oneXStore,
  original:window.VedrasFrozenMap.indexedStore()
 });
 const overview1x=params.get('overview1x')!=='0';
 const largeViewportCache=params.get('cacheLarge')!=='0';
 // Regression control: preserve 25C prefetch policy with ?prefetchGuard=0.
 const prefetchGuard=params.get('prefetchGuard')!=='0';
  const directionalPrefetch=params.get('leadPrefetch')==='1';
 const lodRecency=params.get('lodRecency')==='1';
 const visibleBorrow=params.get('visibleBorrow')==='1';
 // Step25X: opt-in only pending real hardware A/B.
 const parallelLayerDecode=params.get('parallelDecode')==='1';
 // Experimental compact 1x background residency: off in normal sessions.
 const fallbackAtlas=params.get('fallbackAtlas')!=='0';
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
 // Step25P: skip O(all stored tiles) selection scans on large worlds.
 // The original Set scanner remains available with &tileIndex=0.
 const indexedTileSelection=params.get('tileIndex')!=='0';
 // Diagnostic only until the Firefox pan/animation A/B is accepted.
 // The high-detail viewer should not repaint 4x terrain for each 850ms
 // cloud-fade frame. Keep manual fogLayer=0 as an explicit A/B escape hatch.
 const layeredFog=(params.get('fogLayer')==='1'||
  (groundDetailRequested&&params.get('fogLayer')!=='0'))&&!!fogOverlay;
 if(fogOverlay)fogOverlay.hidden=!layeredFog;
 // A compact UI for the most relevant, reversible game-viewer switches.
 // A reload re-reads only the prepared atlas; it never alters or rebakes it.
 for(const [id,parameter,active] of [
  ['optWorldPad','worldPad',adaptiveWorldPad],
  ['optWorldBands','worldBands',sparseWorldBlit],
  ['optTileIndex','tileIndex',indexedTileSelection],
  ['optFogLayer','fogLayer',layeredFog],
  ['optFallbackAtlas','fallbackAtlas',fallbackAtlas],
  ['optGround4x','ground4x',groundDetailRequested],
  ['optAdaptiveGround','groundDecode',adaptiveGroundDecode]
 ]){
  const checkbox=$(id);
  if(!checkbox)continue;
  checkbox.checked=active;
  checkbox.addEventListener('change',()=>{
   const next=new URL(location.href);
   next.searchParams.set(parameter,parameter==='groundDecode'?
    (checkbox.checked?'adaptive':'full'):(checkbox.checked?'1':'0'));
   location.assign(next.pathname+next.search+next.hash);
  });
 }
 // Optional A/B reference: identical source layers, no cached composites.
 // Never modifies or clears the derived PNGs in IndexedDB.
 const directRenderer=params.get('render')==='direct';
 let lastStatusPaint=-Infinity;
 const player=window.VedrasFrozenMap.create({
  canvas,fogCanvas:layeredFog?fogOverlay:null,
  storage:groundDetailStore,useLayerCache:!directRenderer,profiler,
  maxDecodedPixels:adaptiveGroundDecode?128000000:95000000,
  adaptiveGroundDecode,
  overview1x,largeViewportCache,prefetchGuard,directionalPrefetch,lodRecency,
  visibleBorrow,parallelLayerDecode,fallbackAtlas,streamingWorldCache,
  adaptiveCloudCache,autoCloudStrategy,fogViewportCull,worldCacheFastReuse,
  adaptiveWorldPad,sparseWorldBlit,indexedTileSelection,
  fogDprCap:groundDetailRequested?1.25:Infinity,
  preferFogLayerAtHighDpr:groundDetailRequested,
  onStatus:stats=>{
   // The Canvas is unaffected by diagnostics; avoid long DOM/text updates
   // on each rAF while the user pans, zooms or watches fog dissolve.
   const now=performance.now();
   if(stats.frames>1&&now-lastStatusPaint<180)return;
   lastStatusPaint=now;
   const optimized=twoXStore.stats(),overview=oneXStore.stats();
   // Stored tile IDs differ from simultaneous decoded 1x/2x copies.
   metrics.textContent=stats.saved+' gespeicherte Kacheln · '+
    stats.decoded+' Bildpakete im RAM · '+stats.pending+
    ' PNG-Lesevorgänge · '+stats.paintMs.toFixed(1)+
    ' ms pro Bild · 0 Terrain-Bakes · Wolken: '+
    (stats.clouds?.bases??0)+'/4'+
    ' · Wolkenvorlauf ≥ '+stats.cloudBufferHexes+' Hex'+
    (stats.cloudDissolveActive?' · Auflösen aktiv':'')+
    (adaptiveGroundDecode?' · 4×-Bitmap-Tier '+stats.groundTier+'×'+
     ' · '+stats.groundResizedTiles+' verkleinerte Ground-Bitmaps'+
     ' · '+(stats.groundResizedPixelsSaved/1000000).toFixed(1)+
     ' Mio. dekodierte Pixel vermieden':'')+
    (stats.zoomPreviewActive?' · Zoomvorschau aktiv':'')+
    ' · Zoomvorschau-Bilder '+stats.zoomPreviewFrames+
    ' · Übersicht-Canvas '+stats.overviewRasterHits+' Treffer / '+
    stats.overviewRasterBuilds+' Neuaufbauten'+
    ' · Wolken-Cache '+stats.cloudBackdropHits+' Treffer / '+
    stats.cloudBackdropBuilds+' Neuaufbauten'+
    (groundDetailActive?' · 4×-Boden beibehalten: '+
     optimized.groundDownscalesSkipped+' Boden-Konvertierungen vermieden'+
     ' · 2×-Scenery-Cache '+(optimized.mixedLegacyHits+optimized.mixedHits)+
     ' Treffer / '+optimized.mixedBuilt+' neue':'')+
    (optimized.enabled?' · 2×-Cache: '+optimized.hits+' Treffer / '+
     optimized.converted+' einmalig erzeugt'+
     (optimized.pending?' / '+optimized.pending+' in Arbeit':'')+
     (optimized.failures?' · Speicherwarnungen '+optimized.failures:''):'')+
    (overview1x?' · LOD '+stats.activeVariant+
     ' · 1×-Cache '+overview.hits+' / '+overview.converted:
     ' · 1×-LOD deaktiviert')+
    (groundDetailActive?' · Nachgewiesener 4×-Boden '+
     groundDetailStore.stats().originalGrounds+' Kachelabrufe':'')+
    ' · 1×/2× im RAM '+stats.decoded1x+'/'+stats.decoded2x+
    ' · Evictions '+stats.evictions+
    ' · Re-Decodes '+stats.decodeRepeats+
    ' · Hintergrund '+stats.prefetchReadStarts+
    ' · Vorladen gebremst '+stats.prefetchSkippedBudget+
     ' · Nachlauf vermieden '+stats.prefetchTrailingSkipped+
     ' · Zuletzt genutzte Zoomstufe gehalten '+stats.lodRecencyEvictions+
    ' · Sofort gestartete sichtbare Reads '+stats.visibleBorrowStarts+
    ' · Parallel dekodierte Tiles '+stats.parallelTileDecodes+
    ' · Raster '+(largeViewportCache?'groß':'alt')+
    ' · Direkt-Welt/Wolken '+stats.worldCacheFallbackFrames+'/'+
     stats.cloudCacheFallbackFrames+
    (profiler?' · Profilframes: '+profiler.stats().frames:'');
   metrics.title=metrics.textContent;
   const p=player.getPose();if(p)zoomLabel.textContent=Math.round(p.zoom*100)+' %';
  }
 });
 let startPose=null,drag=null,manifestReadMs=null,sceneRegisterMs=null,
  groundProbe=null;
 let panSettler=null,dragLowDprFrames=0;
 try{
  const manifestReadStarted=performance.now();
  // A successful, explicit Scenery-only update publishes a local alias
  // to the immutable successor. Existing saved links open corrected
  // shadows without additional switches. ?original=1 bypasses the alias.
  if(params.get('original')!=='1'){
   let preferred=null;
   try{preferred=localStorage.getItem('vedras-frozen-shadow-current:'+scene);}
   catch{}
   if(preferred&&/^v1-[0-9a-f]{8}$/.test(preferred)&&preferred!==scene){
    try{
     const successor=await player.loadManifest(preferred);
     const count=successor.expectedTiles;
     if(successor.sceneryBaseScene===scene&&successor.shadowTone&&
        Number.isSafeInteger(count)&&count>0&&
        (await groundDetailStore.keys(preferred+'|near|')).length===count){
      shadowSuccessorSource=scene;scene=preferred;
     }
    }catch{/* The original immutable atlas remains a safe fallback. */}
   }
  }
  const manifest=await player.loadManifest(scene);
  manifestReadMs=performance.now()-manifestReadStarted;
  if(benchmark)benchmark.href='frozen-map-benchmark.html?scene='+
   encodeURIComponent(scene);
  const lod=manifest.levels.includes(requestedLevel)?requestedLevel:
   manifest.levels[0];
  // A saved pose.dpr is metadata, NOT proof of 4x PNG pixels.
  // Check three representative original Ground IHDR headers without decoding
  // the full atlas, then independently verify each fetched Ground record.
  groundProbe=lod==='near'?await groundDetailStore.probe(scene,lod):null;
  const true4x=lod==='near'&&groundProbe?.available===true;
  groundDetailActive=groundDetailRequested&&true4x;
  groundDetailStore.setEnabled(groundDetailActive);
  twoXStore.setEnabled(true4x);
  const qualityOption=$('optGround4x');
  if(qualityOption){
   qualityOption.disabled=!true4x;
   qualityOption.title=!true4x?
    'Keine durchgängig nachgewiesenen 4×-Originalboden-PNGs. Manifest-DPR reicht nicht aus.':
    'Nachgewiesene originale 4×-Bodenkacheln verwenden';
  }
  oneXStore.setEnabled(overview1x&&lod==='near');
  startPose=manifest.pose||{zoom:.81,panX:0,panY:0,dpr:1,projectY:.85};
  // The browser may have a different DPR than the authoring machine;
  // image tiles retain their stored pixel density, not new CPU raster jobs.
  // 2× is the deliberate GAME quality standard, even on 1× desktop
   // monitors. Limit huge windows by an 8 MP backing budget / 4096px edge.
   // Neither stored archive pose.dpr=4 nor OS devicePixelRatio sets it.
   const area=Math.max(1,canvas.clientWidth*canvas.clientHeight);
   const edge=Math.max(1,canvas.clientWidth,canvas.clientHeight);
   const gameDpr=Math.min(groundDetailActive?4:2,
    Math.sqrt((groundDetailActive?18000000:8000000)/area),
    (groundDetailActive?8192:4096)/edge);
   startPose={...startPose,dpr:window.VedrasFrozenViewPolicy?
    window.VedrasFrozenViewPolicy.displayDpr({
     zoom:startPose.zoom,width:canvas.clientWidth,height:canvas.clientHeight,
     baseDpr:groundDetailActive?4:2,
     maxDpr:groundDetailActive?4:2,
     maxPixels:groundDetailActive?18000000:8000000,
     maxEdge:groundDetailActive?8192:4096}):Math.max(1,gameDpr)};
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
   (groundDetailActive?'4×-Originalboden durch PNG-Prüfung bestätigt; Objekte bleiben 2×. ': '')+
   (groundDetailRequested&&!groundDetailActive?
    'Kein durchgängig echter 4×-Boden in den geprüften Quellkacheln; höheres Display-Raster würde keine Details erzeugen. ': '')+
   (groundProbe?'Originalboden-Referenz: '+groundProbe.original4x+'/'+
    groundProbe.sampled+' geprüfte 4×-Kacheln · kleinste Quelle '+
    groundProbe.minDensity.toFixed(2)+'×. ':'')+
   (shadowSuccessorSource?'Korrigierte Schatten automatisch geladen (Original '+
    shadowSuccessorSource+' mit ?original=1 erreichbar). ':'')+
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
   baseDpr:groundDetailActive?4:2,
   maxDpr:groundDetailActive?4:2,
   maxPixels:groundDetailActive?18000000:8000000,
   maxEdge:groundDetailActive?8192:4096
  }):Math.min(groundDetailActive?4:2,view.dpr||1);
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
  if(panSettler!==null){clearTimeout(panSettler);panSettler=null;}
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
  canvas.setPointerCapture?.(e.pointerId);
 });
 canvas.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const p=player.getPose();if(!p)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!dx&&!dy)return;
  if(profiler)profiler.input('pan');
  drag.x=e.clientX;drag.y=e.clientY;
  // Full-detail 4x backing can reach 18 MP and bypass the world cache.
  // During a drag, keep the real tile compositor at 1.25x so camera
  // frames remain bounded. After release restore 4x exactly once.
  // No PNGs are downgraded/re-encoded; the 4x source stays in RAM.
  const pan={panX:p.panX+dx,panY:p.panY+dy};
  if(groundDetailActive&&!drag.moved&&(p.dpr||1)>1.25){
   pan.dpr=1.25;dragLowDprFrames++;
   const raster=$('rasterQuality');
   if(raster)raster.textContent='Raster 1.25× (Bewegung)';
  }
  drag.moved=true;
  setPose(pan,{deferDpr:true});
 });
 const finishPan=()=>{
  if(!drag)return;
  const moved=drag.moved;
  drag=null;
  if(!moved||!groundDetailActive)return;
  if(panSettler!==null)clearTimeout(panSettler);
  panSettler=setTimeout(()=>{
   panSettler=null;
   if(!drag)setPose({}); // restores bounded original 4x DPR
  },150);
 };
 for(const evt of ['pointerup','pointercancel','lostpointercapture'])
  canvas.addEventListener(evt,finishPan);
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
   derived1x:oneXStore.stats(),groundDetail:groundDetailStore.stats(),
   groundProbe,groundDetailRequested,groundDetailActive,
   requestedScene,shadowSuccessorSource,
   adaptiveGroundDecode,dragLowDprFrames,overview1x,largeViewportCache,
   prefetchGuard,directionalPrefetch,lodRecency,visibleBorrow,
   parallelLayerDecode,fallbackAtlas,streamingWorldCache,
   adaptiveCloudCache,autoCloudStrategy,
   fogViewportCull,layeredFog,adaptiveWorldPad,sparseWorldBlit,
   indexedTileSelection
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
 const seamAuditButton=$('auditGroundSeams');
 if(seamAuditButton){
  seamAuditButton.addEventListener('click',async()=>{
   seamAuditButton.disabled=true;
   const previous=output.textContent;
   try{
    if(!window.VedrasFrozenSeamAudit)throw Error('Bodennaht-Prüfung fehlt');
    output.textContent='Originalboden wird an fünf Chunkgrenzen verglichen …';
    // Fully read-only. Only PNGs stored under the exact scene are read.
    // The linked resolver follows immutable Ground references where needed.
    const raw=window.VedrasFrozenMap.indexedStore();
    const store=window.VedrasFrozenMap.linkedStore(raw);
    const report=await window.VedrasFrozenSeamAudit.audit(scene,store,{
     progress:(done,total)=>{output.textContent='Bodennaht-Prüfung '+
      done+' / '+total+' Quellkachel-Paare …';}
    });
    const file=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),
     url=URL.createObjectURL(file),link=document.createElement('a');
    link.href=url;link.download='vedras_bodennahte_'+scene+'.json';
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    output.textContent='Originalboden geprüft: '+report.summary.compared+
     '/'+report.summary.total+' Kachelpaare; '+
     report.summary.likelySourceMismatch+
     ' mit deutlicher Quellabweichung. JSON erstellt; kein Atlas verändert.';
   }catch(error){
    output.textContent='Bodennaht-Prüfung fehlgeschlagen: '+
     String(error?.message||error);
   }finally{
    seamAuditButton.disabled=false;
   }
  });
 }
 window.__vedrasFrozenGameTest={
  stats:()=>player.report(),pose:()=>player.getPose(),
  profileReport,profileReset,profileStatus,
  // Explicit opt-in diagnostic repaint: never mutates atlas or Fog rights.
  forceRedraw:()=>player.draw(),
  // CI only (perf=1): deterministic camera motion, never modify atlas data.
  testPan:profileRequested?(patch)=>{
   profiler.input('pan');player.setPose(patch);return true;
  }:null,
  // Read-only diagnostic: no editor instance, no workers, no tile sources.
  readOnly:true,scene,derived2x:()=>twoXStore.stats(),
  derived1x:()=>oneXStore.stats(),
  groundDetail:()=>({requested:groundDetailRequested,active:groundDetailActive,
   dragLowDprFrames,
   probe:groundProbe,...groundDetailStore.stats()})
 };
})();
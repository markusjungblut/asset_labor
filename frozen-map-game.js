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
 // Controlled extra camera overscan within the existing world pixel cap.
 const adaptiveWorldPad=params.get('worldPad')==='1';
 // A/B: only the final, always covered display canvas may be opaque.
 // World and Fog buffers remain alpha:true for authorization masks.
 const opaqueDisplay=params.get('canvasOpaque')==='1';
 // Diagnostic only until the Firefox pan/animation A/B is accepted.
 const layeredFog=params.get('fogLayer')==='1'&&!!fogOverlay;
 if(fogOverlay)fogOverlay.hidden=!layeredFog;
 // Optional A/B reference: identical source layers, no cached composites.
 // Never modifies or clears the derived PNGs in IndexedDB.
 const directRenderer=params.get('render')==='direct';
 let lastStatusPaint=-Infinity;
 const player=window.VedrasFrozenMap.create({
  canvas,fogCanvas:layeredFog?fogOverlay:null,
  storage:oneXStore,useLayerCache:!directRenderer,profiler,
  overview1x,largeViewportCache,prefetchGuard,streamingWorldCache,
  adaptiveCloudCache,autoCloudStrategy,fogViewportCull,worldCacheFastReuse,
  adaptiveWorldPad,opaqueDisplay,
  onStatus:stats=>{
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
   fogViewportCull,layeredFog,opaqueDisplay
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
 window.__vedrasFrozenGameTest={
  stats:()=>player.report(),pose:()=>player.getPose(),
  profileReport,profileReset,profileStatus,
  // Explicit opt-in diagnostic repaint: never mutates atlas or Fog rights.
  forceRedraw:()=>player.draw(),
  // Read-only diagnostic: no editor instance, no workers, no tile sources.
  readOnly:true,scene,derived2x:()=>twoXStore.stats(),
  derived1x:()=>oneXStore.stats()
 };
})();
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
 const canvas=$('game');
 function fail(error){
  output.textContent=String(error?.message||error)+
   ' · Im Asset-Labor zuerst „Gesamte Karte einmalig vorbereiten“ verwenden.';
  metrics.textContent='Kein Terrain-Worker aktiv';
 }
 if(!/^v1-[0-9a-f]{8}$/.test(scene||'')){fail('Ungültige Kartenkennung');return;}
 const twoXStore=window.VedrasFrozenDerived2x.createStore();
 const player=window.VedrasFrozenMap.create({
  canvas,storage:twoXStore,
  onStatus:stats=>{
   const optimized=twoXStore.stats();
   metrics.textContent=stats.decoded+' / '+stats.saved+
    ' gespeicherte Tiles im Bildspeicher · '+stats.pending+
    ' PNG-Lesevorgänge · '+stats.paintMs.toFixed(1)+
    ' ms pro Bild · 0 Terrain-Bakes · Wolken: '+
    (stats.clouds?.bases??0)+'/4'+
    (optimized.enabled?' · 2×-Cache: '+optimized.hits+' Treffer / '+
     optimized.converted+' einmalig erzeugt'+
     (optimized.pending?' / '+optimized.pending+' in Arbeit':'')+
     (optimized.failures?' · Speicherwarnungen '+optimized.failures:''):'');
   const p=player.getPose();if(p)zoomLabel.textContent=Math.round(p.zoom*100)+' %';
  }
 });
 let startPose=null,drag=null;
 try{
  const manifest=await player.loadManifest(scene);
  const lod=manifest.levels.includes(requestedLevel)?requestedLevel:
   manifest.levels[0];
  // Derive 2× images ONLY for legacy full 4× near PNG sources.
  // The originals and the manifest continue to live in the original DB.
  twoXStore.setEnabled(lod==='near'&&Number(manifest.pose?.dpr)>=3);
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
  const status=await player.load(scene,lod,startPose,manifest.cells);
  const raster=$('rasterQuality');
  if(raster)raster.textContent='Raster '+startPose.dpr.toFixed(1).replace('.0','')+'×';
  output.textContent=(twoXStore.stats().enabled?
   '2×-Spielansicht: 4×-Quellkacheln werden beim ersten Besuch einmalig verkleinert und separat gespeichert. ':'')+
   'Gespeicherte Karte '+scene+' · '+lod+' · '+
   status.saved+' / '+(manifest.expectedTiles??'?')+
   ' vollständig vorgerenderte Bildkacheln verfügbar.'+
   (manifest.expectedTiles!=null&&status.saved<manifest.expectedTiles?
    ' Karte UNVOLLSTÄNDIG: Fehlende Regionen bleiben unter Wolken. Im Asset-Labor fehlende Kacheln nachberechnen.':
    status.saved?' Kamera verschieben und zoomen.':
    ' Noch keine vollständigen Kacheln für diese Detailstufe.');
  player.draw();
 }catch(error){fail(error);return;}
 const setPose=next=>{
  const prior=player.getPose();
  if(!prior)return;
  const view={...prior,...next};
  const policy=window.VedrasFrozenViewPolicy;
  const outDpr=policy?policy.displayDpr({
   zoom:view.zoom,width:canvas.clientWidth,height:canvas.clientHeight,
   baseDpr:2
  }):Math.min(2,view.dpr||1);
  if(Math.abs(outDpr-(view.dpr||1))>.015){
   next={...next,dpr:outDpr};
   const raster=$('rasterQuality');
   if(raster)raster.textContent='Raster '+outDpr.toFixed(2).replace(/0+$/,'').replace(/\.$/,'')+'×';
  }
  player.setPose(next);
 };
 const onZoom=(factor,x=canvas.clientWidth/2,y=canvas.clientHeight/2)=>{
  const p=player.getPose();if(!p)return;
  const zoom=Math.min(4,Math.max(.15,p.zoom*factor));
  const wx=(x-canvas.clientWidth/2-p.panX)/p.zoom,
   wy=(y-canvas.clientHeight/2-p.panY)/(p.zoom*(p.projectY||.85));
  setPose({zoom,panX:x-canvas.clientWidth/2-wx*zoom,
   panY:y-canvas.clientHeight/2-wy*zoom*(p.projectY||.85)});
 };
 $('zoomIn').addEventListener('click',()=>onZoom(1.15));
 $('zoomOut').addEventListener('click',()=>onZoom(1/1.15));
 $('resetView').addEventListener('click',()=>setPose(startPose));
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
  const p=player.getPose(),dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY};
  setPose({panX:p.panX+dx,panY:p.panY+dy});
 });
 for(const evt of ['pointerup','pointercancel','lostpointercapture'])
  canvas.addEventListener(evt,()=>{drag=null;});
 window.addEventListener('resize',()=>setPose({}));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)player.draw();});
 window.__vedrasFrozenGameTest={
  stats:()=>player.report(),pose:()=>player.getPose(),
  // Read-only diagnostic: no editor instance, no workers, no tile sources.
  readOnly:true,scene,derived2x:()=>twoXStore.stats()
 };
})();
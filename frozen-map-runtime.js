/* Step 17: proof of the actual shipped-map architecture.
 * This viewer NEVER asks a terrain Worker or a WorldTile source to bake.
 * It reads ONLY completed, explicitly exported static PNG tile layers
 * from IndexedDB. Initial authoring/precomputation is separate.
 * Local Asset-Labor test only. Server-authorized Fog is still required
 * for any future multiplayer use: do not ship hidden terrain to clients.
 */
'use strict';
window.VedrasFrozenMap=(()=>{
 // Static authored hex angles, identical to the old per-frame geometry.
 const HEX_CORNERS=Array.from({length:6},(_,i)=>{
  const theta=-Math.PI/2+i*Math.PI/3;
  return {cos:Math.cos(theta),sin:Math.sin(theta)};
 });
 const SCHEMA=1,DB='vedras-frozen-world-v1',STORE='tiles';
 const integer=v=>Number.isSafeInteger(v);
 function memoryStore(){
  const data=new Map();
  return {
   async put(rec){data.set(rec.key,rec);},
   async get(key){return data.get(key)||null;},
   async keys(prefix){return [...data.keys()].filter(k=>k.startsWith(prefix));},
   async clearPrefix(prefix){for(const key of [...data.keys()])
    if(key.startsWith(prefix))data.delete(key);}
  };
 }
 function indexedStore(){
  let opened;
  function open(){
   if(opened)return opened;
   opened=new Promise((resolve,reject)=>{
    if(typeof indexedDB==='undefined'){reject(Error('IndexedDB nicht verfügbar'));return;}
    const req=indexedDB.open(DB,SCHEMA);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))
      req.result.createObjectStore(STORE,{keyPath:'key'});};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||Error('IndexedDB konnte nicht geöffnet werden'));
   });return opened;
  }
  async function job(mode,action){
   const db=await open();
   return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,mode),os=tx.objectStore(STORE);
    let output=null;
    let req;
    try{req=action(os);if(req){req.onsuccess=()=>{output=req.result;};}}
    catch(e){reject(e);return;}
    tx.oncomplete=()=>resolve(output);
    tx.onerror=()=>reject(tx.error||Error('IndexedDB-Transaktion fehlgeschlagen'));
    tx.onabort=()=>reject(tx.error||Error('IndexedDB-Transaktion abgebrochen'));
   });
  }
  return {
   put:rec=>job('readwrite',os=>os.put(rec)),
   get:key=>job('readonly',os=>os.get(key)),
   keys:async prefix=>{
    const db=await open();
    return new Promise((resolve,reject)=>{
     const tx=db.transaction(STORE,'readonly'),
      req=tx.objectStore(STORE).getAllKeys(
       IDBKeyRange.bound(prefix,prefix+'\uffff'));
     req.onsuccess=()=>resolve(req.result);
     req.onerror=()=>reject(req.error);
    });
   },
   // No implicit cleanup: archived evidence is persistent until an explicit
   // future user-requested deletion workflow is added.
  };
 }
 function valid(packet){
  if(!packet||packet.dirty||packet.preview||!packet.complete||
    !['far','mid','near'].includes(packet.level)||!packet.tile?.id||
    typeof packet.revision!=='string')return false;
  const layers=packet.layers||[];
  return layers.some(l=>['ground','terrain'].includes(l.layer)&&l.image?.width>0&&l.image?.height>0)&&
   layers.some(l=>['scenery','structures'].includes(l.layer)&&l.image?.width>0&&l.image?.height>0);
 }
 function makeKey(scene,level,tileId){return scene+'|'+level+'|'+tileId;}
 async function encodeImage(image){
  const cv=document.createElement('canvas');cv.width=image.width;cv.height=image.height;
  const ctx=cv.getContext('2d',{alpha:true});if(!ctx)throw Error('PNG-Kontext fehlt');
  ctx.drawImage(image,0,0);
  return new Promise((resolve,reject)=>cv.toBlob(blob=>
   blob?resolve(blob):reject(Error('PNG-Bild konnte nicht gespeichert werden')),'image/png'));
 }
 function create({canvas,fogCanvas=null,storage=indexedStore(),decode=null,encode=encodeImage,onStatus=()=>{},
    maxDecodedPixels=95000000,useLayerCache=true,profiler=null,
    overview1x=false,largeViewportCache=true,prefetchGuard=true,streamingWorldCache=true,
    adaptiveCloudCache=true,autoCloudStrategy=true,fogViewportCull=true,
    worldCacheFastReuse=true,adaptiveWorldPad=true,
    sparseWorldBlit=true,indexedTileSelection=true,
     directionalPrefetch=true,lodRecency=true,visibleBorrow=true,
     parallelLayerDecode=false}={}){
  if(!canvas?.getContext)throw Error('Canvas für Spielkartentest fehlt');
  const ctx=canvas.getContext('2d',{alpha:true});
  // Optional transparent viewport-size overlay; world stays on #game.
  const fogCtx=fogCanvas?.getContext?.('2d',{alpha:true})||null;
  let baseStamp=null,baseFrames=0,fogOnlyFrames=0,cloudRevision=0;
  let fogLayerActive=false,basePaintWasLayered=false;
  let active=false,sceneKey='',level='mid',pose=null,cells=[],available=new Set();
  let tileRecords=[],authorizedClipCells=[];
  // Read-only metadata index; PNG blobs remain exclusively in IndexedDB.
  // Small scenes keep the original Set scan (no extra allocations/sorts).
  const MIN_INDEX_TILES=400;
  let tileColumns=null,tileIndexEntries=0,tileIndexQueries=0,
   tileIndexCandidateChecks=0,tileLegacyCandidateChecks=0;
  let generation=0,paintScheduled=false;
  // Decoded image packets are immutable and committed only after ALL layers
  // decode. Keep the entire visible set pinned while the viewport is shown;
  // the old 30M LRU evicted still-visible tiles on every camera repaint.
  let protectedKeys=new Set();
  const SCENERY_OVERHANG_WORLD=128; // Existing world-tile scene pad
  const decoded=new Map(),loading=new Set();
  const loadingPurpose=new Map(),seenDecoded=new Map();
  const MAX_SEEN=2048,MAX_INFLIGHT=3,MAX_SPECULATIVE=1;
  let lodRecencyEvictions=0,visibleBorrowStarts=0,peakInFlight=0;
  let parallelTileDecodes=0,parallelDecodeFailures=0;
  const typicalPixels={'1x':0,'2x':0};
  let visibleMissing=false;
   let prefetchPose=null,prefetchMotionX=0,prefetchMotionY=0,
    prefetchCoastFrames=0,directionalPrefetchFrames=0,
    prefetchTrailingSkipped=0,prefetchLeadingStarts=0;
  let visibleReadStarts=0,prefetchReadStarts=0,decodeRepeats=0,
   visibleDecodeRepeats=0,prefetchDecodeRepeats=0,
   prefetchSkippedVisible=0,prefetchSkippedBudget=0,
   prefetchSkippedSlots=0,evictedSpeculative=0,
   visibleWaitingOnPrefetch=0,visibleRequested=0,prefetchRequested=0;
  // Each variant keeps a private RAM identity; persisted storage keys do
  // not change. Keep previous 2x visible until a matching 1x tile is READY.
  let activeVariant='2x',lodSwitches=0,variantFallbackFrames=0;
  const cacheKey=(key,variant)=>key+'~'+variant;
  const decodedEntry=(key,variant)=>decoded.get(cacheKey(key,variant));
  const desiredVariant=()=>{
   if(!overview1x||!storage.getVariant)return '2x';
   if(activeVariant==='2x'&&pose?.zoom<=.60)activeVariant='1x';
   else if(activeVariant==='1x'&&pose?.zoom>=.72)activeVariant='2x';
   return activeVariant;
  };
  const viewportPolicy=window.VedrasFrozenViewPolicy||null;
  function buildTileIndex(){
   tileColumns=null;tileIndexEntries=0;tileIndexQueries=0;
   tileIndexCandidateChecks=0;tileLegacyCandidateChecks=0;
   tileRecords=[];
   const prefix=sceneKey+'|'+level+'|';
   let order=0;
   for(const key of available){
    const tail=key.slice(prefix.length),parts=tail.split(',');
    // Preserve Number() parsing, historic comma suffixes and Set order.
    const ix=Number(parts[0]),iy=Number(parts[1]);
    if(Number.isSafeInteger(ix)&&Number.isSafeInteger(iy))
     tileRecords.push({key,ix,iy,order});
    order++;
   }
   if(!indexedTileSelection||available.size<MIN_INDEX_TILES)return;
   const columns=new Map();
   for(const tile of tileRecords){
    if(!columns.has(tile.ix))columns.set(tile.ix,[]);
    columns.get(tile.ix).push(tile);
    tileIndexEntries++;
   }
   for(const rows of columns.values())
    rows.sort((a,b)=>a.iy-b.iy||a.order-b.order);
   tileColumns=columns;
  }
  function tileCandidates(bounds){
   if(!tileColumns||!bounds||
      ![bounds.minX,bounds.maxX,bounds.minY,bounds.maxY].every(Number.isFinite))
    return null;
   const x0=Math.floor(bounds.minX/512),x1=Math.ceil(bounds.maxX/512)-1,
    y0=Math.floor(bounds.minY/512),y1=Math.ceil(bounds.maxY/512)-1;
   if(x1<x0||y1<y0)return [];
   // Extreme/nonfinite camera metadata: retain original full Set scan.
   if(x1-x0>250||y1-y0>250)return null;
   const found=[];
   for(let ix=x0;ix<=x1;ix++){
    const rows=tileColumns.get(ix);
    if(!rows)continue;
    let lo=0,hi=rows.length;
    while(lo<hi){const mid=(lo+hi)>>1;
     if(rows[mid].iy<y0)lo=mid+1;else hi=mid;
    }
    for(let j=lo;j<rows.length&&rows[j].iy<=y1;j++)
     found.push(rows[j]);
   }
   found.sort((a,b)=>a.order-b.order);
   tileIndexQueries++;
   tileIndexCandidateChecks+=found.length;
   return found;
  }
  const fogViewport=window.VedrasFrozenFogViewport||null;
  let fogUnreadyCandidates=0,fogUnreadySubmitted=0;
  let fogFrontierCandidates=0,fogFrontierSubmitted=0;
  const revealedAt=new Map(),unreadyObserved=new Set(),DISSOLVE_MS=850;
  let dissolveActive=false,authoredFogSet=null,authoredEdges=null;
  let authoredVisibleById=new Map();
  let overviewRaster=null,overviewHits=0,overviewBuilds=0;
  let worldEffectivePad=0,worldPadBoostFrames=0,worldPadClampFrames=0;
  let decodedRevision=0,overviewFastHits=0,overviewRechecks=0;
  const worldBlitPlanner=window.VedrasFrozenWorldBlit?.plan||null;
  let sparseWorldBlitFrames=0,sparseWorldBlitFallbacks=0,
   worldBlitDevicePixels=0,worldBlitFullDevicePixels=0,
   worldBlitLastRectCount=0,worldBlitLastFraction=1;
  let overviewStreamingBuilds=0,overviewStreamingHits=0;
  let overviewPatchBuilds=0,overviewPatchedTiles=0;
  let cloudBackdropRaster=null,cloudBackdropHits=0,cloudBackdropBuilds=0;
  let cloudEffectivePad=0,cloudPadClamps=0;
  // The canvas cloud cache only helps when its large drawImage blit is
  // cheaper than drawing individual cloud hexes on the current GPU.
  const CLOUD_PROBES=4;
  let cloudAutoKey='',cloudAutoMode='calibrating',
   cloudAutoDirect=[],cloudAutoCached=[],cloudAutoDecisions=0,
   cloudAutoDirectFrames=0,cloudAutoCachedFrames=0;
  const cloudAutoMean=values=>values.length?
   Math.round(values.reduce((sum,value)=>sum+value,0)/values.length*10)/10:null;
  function resetCloudAuto(){
   cloudAutoKey='';cloudAutoMode='calibrating';
   cloudAutoDirect=[];cloudAutoCached=[];
  }
  let worldCacheFallbackFrames=0,cloudCacheFallbackFrames=0;
  const worldRasterLimit=largeViewportCache?16500000:8500000;
  function worldCachePad(view,dpr){
   const base=viewportPolicy.cameraCacheMargin(view.zoom);
   if(!adaptiveWorldPad||!largeViewportCache)return base;
   const w=view.width,h=view.height,maxPixels=worldRasterLimit/(dpr*dpr),
    limitPixels=(Math.sqrt((w-h)*(w-h)+4*maxPixels)-(w+h))/4,
    limitWidth=(8192/dpr-w)/2,limitHeight=(8192/dpr-h)/2,
    desired=Math.ceil(base*1.8);
   let pad=Math.min(desired,Math.floor(Math.min(limitPixels,limitWidth,limitHeight)));
   // Math.ceil() can exceed the continuous-area estimate by a few pixels.
   // Never exceed the original hard world raster pixel/edge budgets.
   while(pad>base){
    const cw=Math.ceil((w+2*pad)*dpr),ch=Math.ceil((h+2*pad)*dpr);
    if(cw*ch<=worldRasterLimit&&cw<=8192&&ch<=8192)break;
    pad--;
   }
   return Math.max(base,pad);
  }
  const cloudRasterLimit=largeViewportCache?8500000:6500000;
  let zoomPreview=null,zoomPreviewFrames=0,zoomPreviewStarted=0;
  let hits=0,loads=0,paintMs=0,misses=0,failures=0,frame=0,decodedPixels=0,
   evictions=0,profileFrame=null;
  const clock=()=>typeof performance!=='undefined'?performance.now():Date.now();
  const clouds=window.VedrasCloudArtwork?.create({
   onReady:()=>{cloudRevision++;cloudBackdropRaster=null;resetCloudAuto();repaint();}
  })||null;
  const decodePNG=decode||(async blob=>{
   if(typeof createImageBitmap==='function')return createImageBitmap(blob);
   return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(blob),im=new Image();
    im.onload=()=>{URL.revokeObjectURL(url);resolve(im)};
    im.onerror=()=>{URL.revokeObjectURL(url);reject(Error('PNG konnte nicht dekodiert werden'))};
    im.src=url;
   });
  });
  function report(){return {active,sceneKey,level,saved:available.size,
   decoded:decoded.size,decodedPixels,hits,loads,misses,failures,evictions,
   decoded1x:[...decoded.values()].filter(e=>e.variant==='1x').length,
   decoded2x:[...decoded.values()].filter(e=>e.variant==='2x').length,
   activeVariant,lodSwitches,variantFallbackFrames,maxDecodedPixels,
   prefetchGuard,visibleReadStarts,prefetchReadStarts,decodeRepeats,
   visibleDecodeRepeats,prefetchDecodeRepeats,evictedSpeculative,
   prefetchSkippedVisible,prefetchSkippedBudget,prefetchSkippedSlots,
   directionalPrefetch,directionalPrefetchFrames,prefetchTrailingSkipped,
   prefetchLeadingStarts,lodRecency,lodRecencyEvictions,
   visibleBorrow,visibleBorrowStarts,peakInFlight,
   parallelLayerDecode,parallelTileDecodes,parallelDecodeFailures,
   visibleWaitingOnPrefetch,visibleRequested,prefetchRequested,
   activePrefetch:[...loadingPurpose.values()].filter(v=>v==='prefetch').length,
   pending:loading.size,frames:frame,paintMs,clouds:clouds?.stats()||null,
   cloudDissolveActive:dissolveActive,
   zoomPreviewActive:!!zoomPreview,zoomPreviewFrames,
   renderMode:useLayerCache?'cached':'direct',
   indexedTileSelection,indexedTileSelectionActive:!!tileColumns,
   tileIndexEntries,tileIndexQueries,tileIndexCandidateChecks,
   tileLegacyCandidateChecks,tileParsedRecords:tileRecords.length,
   layeredFog:!!fogCtx,fogLayerActive,baseFrames,fogOnlyFrames,
   fogOverlayMiB:fogCtx?Math.round(fogCanvas.width*fogCanvas.height*4/1048576):0,
   cloudBufferHexes:viewportPolicy?1:0,
   overviewRasterHits:overviewHits,overviewRasterBuilds:overviewBuilds,
   overviewStreamingBuilds,overviewStreamingHits,streamingWorldCache,
   worldCacheFastReuse,overviewFastHits,overviewRechecks,
   adaptiveWorldPad,worldEffectivePad,worldPadBoostFrames,worldPadClampFrames,
   sparseWorldBlit,sparseWorldBlitFrames,sparseWorldBlitFallbacks,
   worldBlitDevicePixels,worldBlitFullDevicePixels,
   worldBlitLastRectCount,worldBlitLastFraction,
   overviewPatchBuilds,overviewPatchedTiles,
   cloudBackdropHits,cloudBackdropBuilds,adaptiveCloudCache,
   fogViewportCull,fogUnreadyCandidates,fogUnreadySubmitted,
   fogFrontierCandidates,fogFrontierSubmitted,
   cloudEffectivePad,cloudPadClamps,autoCloudStrategy,
   cloudAutoMode,cloudAutoDecisions,
   cloudAutoDirectMs:cloudAutoMean(cloudAutoDirect),
   cloudAutoCachedMs:cloudAutoMean(cloudAutoCached),
   cloudAutoDirectFrames,cloudAutoCachedFrames,
   worldCacheFallbackFrames,cloudCacheFallbackFrames,largeViewportCache,
   worldRasterLimit,cloudRasterLimit,
   cloudBackdropMiB:cloudBackdropRaster?
    Math.round(cloudBackdropRaster.canvas.width*
     cloudBackdropRaster.canvas.height*4/1048576):0,
   overviewRasterMiB:overviewRaster?
    Math.round(overviewRaster.canvas.width*overviewRaster.canvas.height*4/1048576):0};}
  function clearDecoded(){generation++;for(const entry of decoded.values())
   for(const img of entry.images)img.close?.();
   decoded.clear();decodedRevision++;baseStamp=null;
   loading.clear();loadingPurpose.clear();
   protectedKeys=new Set();decodedPixels=0;
   activeVariant='2x';lodSwitches=0;variantFallbackFrames=0;
   seenDecoded.clear();typicalPixels['1x']=0;typicalPixels['2x']=0;
   visibleMissing=false;
   prefetchPose=null;prefetchMotionX=0;prefetchMotionY=0;
   prefetchCoastFrames=0;directionalPrefetchFrames=0;
   prefetchTrailingSkipped=0;prefetchLeadingStarts=0;
   lodRecencyEvictions=0;visibleBorrowStarts=0;peakInFlight=0;
   parallelTileDecodes=0;parallelDecodeFailures=0;
   visibleReadStarts=0;prefetchReadStarts=0;decodeRepeats=0;
   visibleDecodeRepeats=0;prefetchDecodeRepeats=0;
   prefetchSkippedVisible=0;prefetchSkippedBudget=0;
   prefetchSkippedSlots=0;evictedSpeculative=0;
   visibleWaitingOnPrefetch=0;visibleRequested=0;prefetchRequested=0;
   revealedAt.clear();unreadyObserved.clear();
   dissolveActive=false;authoredFogSet=null;
   authoredVisibleById.clear();
   authoredEdges=null;overviewRaster=null;zoomPreview=null;
   overviewStreamingBuilds=0;overviewStreamingHits=0;
   overviewPatchBuilds=0;overviewPatchedTiles=0;
   worldEffectivePad=0;worldPadBoostFrames=0;worldPadClampFrames=0;
   sparseWorldBlitFrames=0;sparseWorldBlitFallbacks=0;
   worldBlitDevicePixels=0;worldBlitFullDevicePixels=0;
   worldBlitLastRectCount=0;worldBlitLastFraction=1;
   cloudBackdropRaster=null;resetCloudAuto();
   tileColumns=null;tileRecords=[];authorizedClipCells=[];
    tileIndexEntries=0;tileIndexQueries=0;
   tileIndexCandidateChecks=0;tileLegacyCandidateChecks=0;
   fogUnreadyCandidates=0;fogUnreadySubmitted=0;
   fogFrontierCandidates=0;fogFrontierSubmitted=0;
  }
  const repaint=()=>{
   if(!active||paintScheduled||typeof requestAnimationFrame!=='function')return;
   paintScheduled=true;
   requestAnimationFrame(()=>{paintScheduled=false;if(active)draw();});
  };
  function keepWithinBudget(){
   while(decodedPixels>maxDecodedPixels&&decoded.size>1){
    let victim=null;
    // Speculatively decoded but NEVER displayed images must yield
    // before recently visited terrain and before the inactive zoom LOD.
    if(prefetchGuard)for(const [key,entry] of decoded)
     if(!protectedKeys.has(key)&&entry.origin==='prefetch'){
      victim=key;break;
     }
    // A just-visited inactive LOD can be more valuable on the next zoom
    // reversal than an older offscreen bitmap of the active LOD.
    // Keep the visible-set pinning and speculative-first eviction exactly
    // as before; change only the order of remaining safe victims.
    if(!victim&&lodRecency){
     let oldest=Infinity,hasInactive=false;
     for(const [key,entry] of decoded){
      if(protectedKeys.has(key))continue;
      if(entry.variant!==activeVariant)hasInactive=true;
      const last=entry.lastVisibleFrame??-1;
      if(last<oldest){oldest=last;victim=key;}
     }
     if(victim&&hasInactive&&decoded.get(victim).variant===activeVariant)
      lodRecencyEvictions++;
    }
    if(!victim)for(const [key,entry] of decoded)
     if(!protectedKeys.has(key)&&entry.variant!==activeVariant){
      victim=key;break;
     }
    if(!victim)for(const key of decoded.keys())
     if(!protectedKeys.has(key)){victim=key;break;}
    if(!victim)break;
    const entry=decoded.get(victim);
    decoded.delete(victim);decodedRevision++;
    decodedPixels-=entry.pixels;evictions++;
    if(entry.origin==='prefetch')evictedSpeculative++;
    for(const im of entry.images)im.close?.();
   }
  }
  function read(key,variant=desiredVariant(),purpose='visible'){
   const speculative=purpose==='prefetch',
    id=cacheKey(key,variant),
    alternate=cacheKey(key,variant==='1x'?'2x':'1x');
   const hit=decoded.get(id);
   if(hit){
    // Offscreen cache probes MUST NOT refresh a tile's LRU timestamp:
    // refreshing 10+ background tiles every frame evicts the actual warm
    // viewport despite none of those background tiles being drawn.
    if(!speculative||!prefetchGuard){
     decoded.delete(id);decoded.set(id,hit);
    }
    if(!speculative){hit.origin='visible';hit.lastVisibleFrame=frame;}
    hits++;return hit;
   }
   const fallback=speculative&&prefetchGuard?null:decoded.get(alternate);
   if(fallback){
    if(!speculative||!prefetchGuard){
     decoded.delete(alternate);decoded.set(alternate,fallback);
    }
    if(!speculative){fallback.origin='visible';fallback.lastVisibleFrame=frame;}
   }
   if(!available.has(key))return fallback||null;
   if(loading.has(id)){
    if(!speculative&&loadingPurpose.get(id)==='prefetch')
     loadingPurpose.set(id,'visible');
    return fallback||null;
   }
   if(speculative&&prefetchGuard){
    if(visibleMissing){
     prefetchSkippedVisible++;return fallback||null;
    }
    const activeSpec=[...loadingPurpose.values()]
     .filter(x=>x==='prefetch').length;
    if(activeSpec>=MAX_SPECULATIVE||
       loading.size>=MAX_INFLIGHT-1){
     prefetchSkippedSlots++;return fallback||null;
    }
    // A spare region of decoded RAM is mandatory for speculative work.
    // Estimate the bitmap pixels from completed variants, never PNG bytes.
    const reserve=Math.max(maxDecodedPixels*.12,
     2*(typicalPixels[variant]||2000000));
    if(decodedPixels+reserve>=maxDecodedPixels){
     prefetchSkippedBudget++;return fallback||null;
    }
   }
   // A stale speculative IndexedDB/decode request cannot be cancelled.
   // When all three normal slots are used and ONE is speculative, lend
   // that slot to an urgent visible tile. This admits at most three
   // foreground reads plus one background read; never borrow for prefetch
   // or without the existing guarded background-admission policy.
   const borrowing=!speculative&&visibleBorrow&&prefetchGuard&&
    loading.size===MAX_INFLIGHT&&
    [...loadingPurpose.values()].includes('prefetch');
   if(loading.size>=MAX_INFLIGHT&&!borrowing){
    if(!speculative&&[...loadingPurpose.values()]
     .some(x=>x==='prefetch'))visibleWaitingOnPrefetch++;
    return fallback||null;
   }
   if(borrowing)visibleBorrowStarts++;
   loading.add(id);
   peakInFlight=Math.max(peakInFlight,loading.size);
   loadingPurpose.set(id,speculative?'prefetch':'visible');
   if(speculative)prefetchReadStarts++;else visibleReadStarts++;
   const run=generation,readStarted=profiler?clock():0;
   let readFinished=0,decodeDuration=0;
   // A rejected getVariant() request must not leave loading slots stuck.
   Promise.resolve().then(()=>storage.getVariant?
    storage.getVariant(key,variant):storage.get(key)).then(async record=>{
    readFinished=profiler?clock():0;
    if(!record||!Array.isArray(record.layers))throw Error('Kachelpaket fehlt');
    const images=[],decodeStarted=profiler?clock():0;
    try{
     if(parallelLayerDecode&&record.layers.length>1){
      // Ground/Scenery PNGs are independent. allSettled preserves
      // layer order and safely closes any success after a sibling fails.
      const outcomes=await Promise.allSettled(
       record.layers.map(layer=>decodePNG(layer.png)));
      const failure=outcomes.find(x=>x.status==='rejected');
      if(failure){
       parallelDecodeFailures++;
       for(const result of outcomes)if(result.status==='fulfilled')
        result.value?.close?.();
       throw failure.reason;
      }
      for(const result of outcomes)images.push(result.value);
      parallelTileDecodes++;
     }else for(const layer of record.layers)
      images.push(await decodePNG(layer.png));
    }catch(error){for(const im of images)im.close?.();throw error;}
    if(profiler)decodeDuration=clock()-decodeStarted;
    if(!active||run!==generation||record.key!==key||
       record.sceneKey!==sceneKey||record.level!==level){
     for(const im of images)im.close?.();return;
    }
    const pixels=images.reduce((sum,im)=>
     sum+(im.width||0)*(im.height||0),0);
    const actualPurpose=loadingPurpose.get(id)||'visible';
    const count=seenDecoded.get(id)||0;
    if(count){
     decodeRepeats++;
     if(actualPurpose==='prefetch')prefetchDecodeRepeats++;
     else visibleDecodeRepeats++;
    }
    if(seenDecoded.has(id))seenDecoded.delete(id);
    seenDecoded.set(id,count+1);
    if(seenDecoded.size>MAX_SEEN)
     seenDecoded.delete(seenDecoded.keys().next().value);
    typicalPixels[variant]=Math.max(typicalPixels[variant],pixels);
    decoded.set(id,{record,images,pixels,variant,origin:actualPurpose,
     lastVisibleFrame:actualPurpose==='visible'?frame:-1});
    decodedRevision++;
    decodedPixels+=pixels;loads++;
    keepWithinBudget();
    if(profiler)profiler.tileRead({
     tileId:record.tile?.id||null,variant,purpose:actualPurpose,
     redecoded:count>0,decodedCount:count+1,
     source:record.derivedFormat==='1x-png-v1'?'derived1x':
      record.derivedFormat==='2x-png-v1'?'derived2x':'original',
     storageMs:readFinished-readStarted,decodeMs:decodeDuration,
     totalMs:clock()-readStarted,layers:images.length,
     blobBytes:record.layers.reduce((sum,l)=>sum+(l.png?.size||0),0),
     pixels
    });
   }).catch(()=>{
    if(run===generation)failures++;
    if(profiler)profiler.tileRead({
     error:true,tileId:key.split('|').at(-1),variant,
     purpose:loadingPurpose.get(id)||purpose,
     storageMs:readFinished?
      readFinished-readStarted:clock()-readStarted,
     decodeMs:decodeDuration,totalMs:clock()-readStarted
    });
   }).finally(()=>{
    if(run===generation){
     loading.delete(id);loadingPurpose.delete(id);repaint();
    }
   });
   return fallback||null;
  }
  function getPose(){return pose?{...pose}:null;}
  function isHexReady(c){
   if(c.visibility!=='visible')return false;
   const half=c.radius*Math.sqrt(3)/2-.01;
   for(let ix=Math.floor((c.x-half)/512);ix<=Math.floor((c.x+half)/512);ix++)
    for(let iy=Math.floor((c.y-c.radius+.01)/512);
     iy<=Math.floor((c.y+c.radius-.01)/512);iy++)
     if(!decodedEntry(makeKey(sceneKey,level,ix+','+iy),activeVariant)&&
         !decodedEntry(makeKey(sceneKey,level,ix+','+iy),
          activeVariant==='1x'?'2x':'1x'))return false;
   return true;
  }
  function frontierEdges(){
   if(authoredEdges)return authoredEdges;
   const visibleCells=new Set(cells.filter(c=>c.visibility==='visible')
    .map(c=>c.q+','+c.r));
   const dirs=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
   authoredEdges=[];
   for(const c of cells)if(c.visibility==='visible')
    for(let direction=0;direction<6;direction++){
     const d=dirs[direction];
     if(!visibleCells.has((c.q+d[0])+','+(c.r+d[1])))
      authoredEdges.push({q:c.q,r:c.r,direction});
    }
   return authoredEdges;
  }
  function fogCellsFor(view){
   return fogViewportCull&&fogViewport?
    fogViewport.visibleCells(cells,view):cells;
  }
  function fogEdgesFor(view){
   const edges=frontierEdges();
   return fogViewportCull&&fogViewport?
    fogViewport.visibleEdges(edges,view):edges;
  }
  function zoomSnapshotOpacity(c,isReady){
   if(!isReady)return 1;
   const id=c.q+','+c.r;
   if(!unreadyObserved.has(id))return 0;
   const at=revealedAt.get(id);
   if(at==null)return 1;
   const t=Math.max(0,Math.min(1,
    ((typeof performance!=='undefined'?performance.now():Date.now())-at)/DISSOLVE_MS));
   return 1-t*t*(3-2*t);
  }
  function beginZoomPreview({zoomOut=false}={}){
   if(!active||!pose||typeof document==='undefined'||
      !canvas.width||!canvas.height)return false;
   if(zoomPreview){
    // Rebase at most once per significant camera travel. A drag or a long
    // zoom gesture should never outrun its temporary world overscan.
    const previous=zoomPreview;
    const sourceRatio=pose.zoom/previous.pose.zoom;
    const outsideBuffer=zoomOut&&(
     sourceRatio<.40||
     Math.abs(pose.panX-previous.pose.panX)>previous.padX*.85||
     Math.abs(pose.panY-previous.pose.panY)>previous.padY*.85);
    if(!outsideBuffer)return true;
    zoomPreview=null;
   }
   const bounds=canvas.getBoundingClientRect?.()||{
    width:canvas.width/(pose.dpr||1),height:canvas.height/(pose.dpr||1)};
   const width=Math.max(1,Math.floor(bounds.width)),
    height=Math.max(1,Math.floor(bounds.height));
   // A screen-only screenshot becomes a visible square on zoom-out because
   // it covers LESS than the destination viewport. Capture more *world*
   // around it, with fog and authorization clipping already applied.
   const padX=zoomOut?Math.ceil(width*1.45):0,
    padY=zoomOut?Math.ceil(height*1.45):0;
   const extendedWidth=width+2*padX,extendedHeight=height+2*padY,
    maxPixels=4000000;
   const backingDpr=Math.min(pose.dpr||1,1,
    Math.sqrt(maxPixels/(extendedWidth*extendedHeight)));
   const image=document.createElement('canvas');
   image.width=Math.max(1,Math.round(extendedWidth*backingDpr));
   image.height=Math.max(1,Math.round(extendedHeight*backingDpr));
   const g=image.getContext('2d',{alpha:true});
   if(!g)return false;
   const extendedView={...pose,width:extendedWidth,height:extendedHeight};
   if(zoomOut){
    g.setTransform(backingDpr,0,0,backingDpr,0,0);
    if(clouds){
     if(!authoredFogSet)authoredFogSet=new Set(cells.filter(c=>
      c.visibility==='visible'||c.visibility==='explored')
      .map(c=>c.q+','+c.r));
     clouds.drawBase(g,extendedView,authoredFogSet);
    }else{
     g.fillStyle='#bdced7';g.fillRect(0,0,extendedWidth,extendedHeight);
    }
    const region=viewportPolicy?.screenBounds(extendedView,{
     marginWorld:viewportPolicy.MARGIN_WORLD});
    const shown=[...decoded.values()].filter(entry=>{
     const t=entry.record.tile;
     return !region||viewportPolicy.visibleTile(
      Math.floor(t.x/512),Math.floor(t.y/512),region);
    }).map(entry=>({entry}));
    paintWorld(g,extendedView,shown,backingDpr);
    if(clouds){
     g.setTransform(backingDpr,0,0,backingDpr,0,0);
     clouds.drawUnready(g,extendedView,fogCellsFor(extendedView),
      isHexReady,zoomSnapshotOpacity);
     clouds.drawTransitions(g,extendedView,fogEdgesFor(extendedView));
    }
   }else{
    // Zoom-in never exposes pixels beyond the original viewport.
    g.drawImage(canvas,0,0,image.width,image.height);
    if(fogLayerActive)g.drawImage(fogCanvas,0,0,image.width,image.height);
   }
   zoomPreview={image,pose:{...pose},width,height,padX,padY,
    extendedWidth,extendedHeight};
   zoomPreviewStarted=typeof performance!=='undefined'?performance.now():Date.now();
   return true;
  }
  function previewNeedsData(){
   if(!zoomPreview||!pose)return false;
   const b=canvas.getBoundingClientRect?.()||{
    width:canvas.width/(pose.dpr||1),height:canvas.height/(pose.dpr||1)};
   const bounds=viewportPolicy?.screenBounds({
    ...pose,width:Math.max(1,Math.floor(b.width)),
    height:Math.max(1,Math.floor(b.height))
   },{marginWorld:0});
   if(!bounds)return false;
   for(const {key,ix,iy} of tileRecords)
     if(viewportPolicy.visibleTile(ix,iy,bounds)&&
        !decodedEntry(key,activeVariant))return true;
    return false;
  }
  function endZoomPreview({waitForVisible=false,maxHoldMs=950}={}){
   if(!zoomPreview)return true;
   const now=typeof performance!=='undefined'?performance.now():Date.now();
   if(waitForVisible&&now-zoomPreviewStarted<maxHoldMs&&previewNeedsData())
    return false;
   // The intermediate snapshot is static. Preserve the remaining dissolve
   // interval rather than letting it expire invisibly during a zoom gesture
   // and then abruptly swapping a cloudy preview for a clear landscape.
   const pausedMs=Math.max(0,now-zoomPreviewStarted);
   for(const [id,at] of revealedAt)revealedAt.set(id,at+pausedMs);
   zoomPreview=null;repaint();return true;
  }
  function setPose(next){if(!pose)return;pose={...pose,...next};repaint();}
  function setClouds({seed='vedras-local-preview',assets=[]}={}){
   if(!clouds)return false;
   cloudRevision++;baseStamp=null;
   cloudBackdropRaster=null;cloudEffectivePad=0;resetCloudAuto();
   clouds.setSeed(seed);
   clouds.setAssets(Array.isArray(assets)?assets:[]);
   repaint();return true;
  }
  function paintCloudBackdrop(target,view,dpr){
   if(!clouds)return false;
   // A bounded scene-aligned cloud backdrop avoids hundreds of artwork
   // stamps every time a warm 2x game scene pans a few screen pixels.
   const preferredPad=viewportPolicy?.cameraCacheMargin(view.zoom)||160;
   // The soft authored clouds retain their original cached 1.25x quality.
   // An ultrawide viewport may fit the 8.5-MP budget only with LESS padding.
   // This is better than discarding the entire backdrop and stamping every
   // cloud on every camera frame. Preserve the old fallback for CI A/B.
   const cacheDpr=largeViewportCache?Math.min(1.25,dpr):dpr;
   let pad=preferredPad;
   if(adaptiveCloudCache){
    const capacity=cloudRasterLimit/(cacheDpr*cacheDpr);
    const delta=view.width-view.height;
    const bound=Math.floor((Math.sqrt(delta*delta+4*capacity)-
     view.width-view.height)/4);
    pad=Math.max(0,Math.min(pad,bound));
    const fits=p=>{
     const w=Math.ceil((view.width+p*2)*cacheDpr),
      h=Math.ceil((view.height+p*2)*cacheDpr);
     return w*h<=cloudRasterLimit&&w<=8192&&h<=8192;
    };
    while(pad>0&&!fits(pad))pad--;
    if(pad<preferredPad)cloudPadClamps++;
   }
   cloudEffectivePad=pad;
   const cw=Math.ceil((view.width+pad*2)*cacheDpr),
    ch=Math.ceil((view.height+pad*2)*cacheDpr);
   if(cw*ch>cloudRasterLimit||cw>8192||ch>8192||
      typeof document==='undefined')return false;
   if(!authoredFogSet)authoredFogSet=new Set(cells.filter(c=>
    c.visibility==='visible'||c.visibility==='explored')
    .map(c=>c.q+','+c.r));
   const previous=cloudBackdropRaster;
   const usable=previous&&previous.zoom===view.zoom&&
    previous.dpr===cacheDpr&&previous.pad===pad&&
    previous.width===view.width&&
    previous.height===view.height&&
    Math.abs(previous.panX-view.panX)<pad-8&&
    Math.abs(previous.panY-view.panY)<pad-8;
   if(!usable){
    const buffer=document.createElement('canvas');
    buffer.width=cw;buffer.height=ch;
    const g=buffer.getContext('2d',{alpha:true});
    if(!g)return false;
    g.setTransform(cacheDpr,0,0,cacheDpr,0,0);
    clouds.drawBase(g,{...view,width:view.width+pad*2,
     height:view.height+pad*2},authoredFogSet);
    cloudBackdropRaster={canvas:buffer,width:view.width,
     height:view.height,zoom:view.zoom,dpr:cacheDpr,panX:view.panX,
     panY:view.panY,pad};
    cloudBackdropBuilds++;
   }else cloudBackdropHits++;
   const current=cloudBackdropRaster;
   const sx=(current.pad+current.panX-view.panX)*cacheDpr,
    sy=(current.pad+current.panY-view.panY)*cacheDpr;
   target.drawImage(current.canvas,sx,sy,
    view.width*cacheDpr,view.height*cacheDpr,0,0,view.width,view.height);
   return true;
  }
  // Direct and cached paths cover precisely the same authorized cloud
  // field. Dynamic Fog/transition layers are drawn afterward in draw().
  // At ultra-wide resolution a 6MP cached blit can be *slower* than the
  // original small stamps. Tune for real browser/GPU, not tile counts.
  function drawCloudBackground(target,view,dpr){
   const direct=()=>{
    cloudCacheFallbackFrames++;cloudAutoDirectFrames++;
    if(!authoredFogSet)authoredFogSet=new Set(cells.filter(c=>
     c.visibility==='visible'||c.visibility==='explored')
     .map(c=>c.q+','+c.r));
    clouds.drawBase(target,view,authoredFogSet);
   };
   const cached=()=>{
    if(!paintCloudBackdrop(target,view,dpr))return false;
    cloudAutoCachedFrames++;
    return true;
   };
   if(!useLayerCache){direct();return;}
   if(!adaptiveCloudCache||!autoCloudStrategy){
    if(!cached())direct();
    return;
   }
   const stats=clouds.stats();
   // An initial 0-stamp background is not a representative measurement:
   // postpone selection until the four authored cloud assets are ready.
   if(!stats?.bases||stats.pending){
    if(!cached())direct();
    return;
   }
   const signature=[view.width,view.height,view.zoom,dpr,stats.version].join('|');
   if(cloudAutoKey!==signature){
    resetCloudAuto();cloudAutoKey=signature;
   }
   if(cloudAutoMode==='direct'){direct();return;}
   if(cloudAutoMode==='cached'){
    if(!cached())direct();return;
   }
   if(cloudAutoDirect.length<CLOUD_PROBES){
    const before=clock();direct();
    cloudAutoDirect.push(Math.max(0,clock()-before));
    return;
   }
   const beforeHits=cloudBackdropHits,start=clock(),
    complete=cached(),cost=Math.max(0,clock()-start);
   if(!complete){
    // At extreme canvas dimensions not even pad=0 fits the budget.
    // Never bypass the hard 8.5-MP raster allocation guard.
    cloudAutoMode='direct';cloudAutoDecisions++;
    direct();return;
   }
   if(cloudBackdropHits>beforeHits)cloudAutoCached.push(cost);
   // Exclude the one-off cloud raster allocation from hit timings.
   if(cloudAutoCached.length>=CLOUD_PROBES){
    const directCost=cloudAutoMean(cloudAutoDirect),
     cachedCost=cloudAutoMean(cloudAutoCached);
    // Avoid switching on measurement noise; require a 15% advantage.
    cloudAutoMode=cachedCost<directCost*.85?'cached':'direct';
    cloudAutoDecisions++;
    if(cloudAutoMode==='direct')cloudBackdropRaster=null;
   }
  }
  function paintWorld(g,view,list,dpr){
   const worldStart=profileFrame?clock():0;
   const width=view.width,height=view.height,proj=view.projectY||.85;
   // Painted sprite layers must be ordered by WORLD depth, not distance
   // from the cursor/camera, decode arrival, or last-used tile cache order.
   list=[...list].sort((a,b)=>{
    const ta=a.entry.record.tile,tb=b.entry.record.tile;
    return (ta.y-tb.y)||(ta.x-tb.x)||
     String(ta.id||'').localeCompare(String(tb.id||''));
   });
   const snap=v=>Math.round(v*dpr)/dpr;
   g.setTransform(dpr,0,0,dpr,0,0);
   g.imageSmoothingEnabled=true;
   g.imageSmoothingQuality=view.zoom<=.52?'medium':'high';
   // A cached raster has a different screen center from the visible canvas:
   // recompute coordinates from immutable 512-world-unit tile positions.
   list=list.map(t=>{
    const tile=t.entry.record.tile;
    return {...t,
     left:snap(width/2+view.panX+tile.x*view.zoom),
     top:snap(height/2+view.panY+tile.y*view.zoom*proj),
     right:snap(width/2+view.panX+(tile.x+tile.size)*view.zoom),
     bottom:snap(height/2+view.panY+(tile.y+tile.size)*view.zoom*proj)};
   });
   function clipCells(halo=0){
    g.beginPath();
    for(const c of authorizedClipCells){
     const x=width/2+view.panX+c.x*view.zoom,
      y=height/2+view.panY+c.y*view.zoom*proj,
      rx=(c.radius+halo)*view.zoom,ry=rx*proj;
     if(x+rx<0||x-rx>width||y+ry<0||y-ry>height)continue;
     for(let i=0;i<6;i++){
      const corner=HEX_CORNERS[i],
       px=x+rx*corner.cos,py=y+ry*corner.sin;
      if(i===0)g.moveTo(px,py);else g.lineTo(px,py);
     }
     g.closePath();
    }
    g.clip();
   }
   // Ground uses exclusive device-snapped borders with an infinitesimal
   // source-gutter overdraw. It covers fractional-DPR seams without changing
   // the baked terrain content, and never samples outside the original PNG.
   const groundClipStart=profileFrame?clock():0;
   g.save();clipCells(0);
   if(profileFrame)profileFrame.maskMs+=clock()-groundClipStart;
   const groundStarted=profileFrame?clock():0;
   for(const t of list)for(let i=0;i<t.entry.record.layers.length;i++){
    const layer=t.entry.record.layers[i];
    if(layer.layer!=='ground'&&layer.layer!=='terrain')continue;
    const image=t.entry.images[i],pad=Math.max(0,layer.pad||0),
     x=t.left,y=t.top,w=t.right-t.left,h=t.bottom-t.top;
    if(pad){
     const bx=Math.min(.65/dpr,pad*view.zoom*.8),
      by=Math.min(.65/dpr,pad*view.zoom*proj*.8),
      sx=image.width*(pad-bx/view.zoom)/(512+2*pad),
      sy=image.height*(pad-by/(view.zoom*proj))/(512+2*pad),
      sw=image.width*(512+2*bx/view.zoom)/(512+2*pad),
      sh=image.height*(512+2*by/(view.zoom*proj))/(512+2*pad);
     g.drawImage(image,sx,sy,sw,sh,x-bx,y-by,w+2*bx,h+2*by);
    }else g.drawImage(image,x,y,w,h);
   }
   g.restore();
   if(profileFrame)profileFrame.groundMs+=clock()-groundStarted;
   // Tree crowns and cast shadows extend beyond the owning 512-unit core.
   const sceneryClipStart=profileFrame?clock():0;
   g.save();clipCells(45);
   if(profileFrame)profileFrame.maskMs+=clock()-sceneryClipStart;
   const sceneryStarted=profileFrame?clock():0;
   for(const t of list)for(let i=0;i<t.entry.record.layers.length;i++){
    const layer=t.entry.record.layers[i];
    if(layer.layer!=='scenery'&&layer.layer!=='structures')continue;
    const image=t.entry.images[i],pad=layer.pad||0,
     x=t.left,y=t.top,w=t.right-t.left,h=t.bottom-t.top,
     fx=x-pad*view.zoom,fy=y-pad*view.zoom*proj,
     fw=w+pad*2*view.zoom,fh=h+pad*2*view.zoom*proj;
    const c=layer.crop;
    if(c)g.drawImage(image,fx+fw*c.x/c.fullWidth,
     fy+fh*c.y/c.fullHeight,fw*image.width/c.fullWidth,
     fh*image.height/c.fullHeight);
    else g.drawImage(image,fx,fy,fw,fh);
   }
   g.restore();
   if(profileFrame){
    profileFrame.sceneryMs+=clock()-sceneryStarted;
    profileFrame.worldPainterMs+=clock()-worldStart;
   }
  }
  // A decoded tile changes at most its own full 512-unit footprint plus
  // padded scenery/shadows. Repaint just that region inside the warm atlas.
  function shownOverview(chosen){
   return new Map([...chosen].map(([logical,key])=>{
    const entry=decoded.get(key);
    return [logical,{key,tile:entry.record.tile,
     pad:Math.max(SCENERY_OVERHANG_WORLD,
      ...entry.record.layers.map(l=>Math.max(0,l.pad||0)))}];
   }));
  }
  function patchOverview(view,dpr,pad,chosen,signature){
   const old=overviewRaster;
   if(!streamingWorldCache||!old?.shown||old.zoom!==view.zoom||
      old.dpr!==dpr||old.pad!==pad||
      old.projectY!==(view.projectY||.85)||old.width!==view.width||
      old.height!==view.height||
      Math.abs(old.panX-view.panX)>=pad-8||
      Math.abs(old.panY-view.panY)>=pad-8)return false;
   const next=shownOverview(chosen),changed=[];
   for(const logical of new Set([...old.shown.keys(),...next.keys()]))
    if(old.shown.get(logical)?.key!==next.get(logical)?.key)
     changed.push(logical);
   if(!changed.length||changed.length>5)return false;
   const buffer=old.canvas,g=buffer.getContext('2d',{alpha:true});
   if(typeof g?.rect!=='function'||typeof g?.clearRect!=='function')
    return false;
   const bw=view.width+pad*2,bh=view.height+pad*2,
    z=view.zoom,py=view.projectY||.85,
    bufferView={...view,width:bw,height:bh,panX:old.panX,panY:old.panY};
   const boxFor=meta=>{
    const {tile}=meta,halo=(meta.pad+2)*z,
     x=bw/2+old.panX+tile.x*z,y=bh/2+old.panY+tile.y*z*py,
     w=tile.size*z,h=tile.size*z*py;
    return {x0:x-halo,y0:y-halo*py,x1:x+w+halo,y1:y+h+halo*py};
   };
   const intersects=(a,b)=>a.x0<b.x1&&a.x1>b.x0&&
    a.y0<b.y1&&a.y1>b.y0;
   const dirty=[];
   for(const id of changed){
    const parts=[old.shown.get(id),next.get(id)].filter(Boolean)
     .map(boxFor);
    const x0=Math.max(0,Math.floor(Math.min(...parts.map(p=>p.x0))*dpr)-2),
     y0=Math.max(0,Math.floor(Math.min(...parts.map(p=>p.y0))*dpr)-2),
     x1=Math.min(buffer.width,Math.ceil(Math.max(...parts.map(p=>p.x1))*dpr)+2),
     y1=Math.min(buffer.height,Math.ceil(Math.max(...parts.map(p=>p.y1))*dpr)+2);
    if(x1>x0&&y1>y0)dirty.push({
     x0:x0/dpr,y0:y0/dpr,x1:x1/dpr,y1:y1/dpr,
     pixels:(x1-x0)*(y1-y0)});
   }
   if(dirty.reduce((n,r)=>n+r.pixels,0)>
      buffer.width*buffer.height*.65)return false;
   const bufferKeys=[...chosen.values()].sort();
   for(const r of dirty){
    // Draw ALL nearby neighbors in the same global world-Y layer ordering.
    // Clearing before recomposition preserves correct translucent overlaps.
    const affected=bufferKeys.filter(key=>{
     const entry=decoded.get(key),meta=entry?next.get(entry.record.key):null;
     return meta&&intersects(boxFor(meta),r);
    }).map(key=>({entry:decoded.get(key)}));
    g.setTransform(dpr,0,0,dpr,0,0);
    g.save();g.beginPath();g.rect(r.x0,r.y0,r.x1-r.x0,r.y1-r.y0);
    g.clip();g.clearRect(r.x0,r.y0,r.x1-r.x0,r.y1-r.y0);
    paintWorld(g,bufferView,affected,dpr);
    g.restore();
   }
   old.shown=next;old.signature=signature;
   old.decodedRevision=decodedRevision;old.variant=activeVariant;
   overviewPatchBuilds++;overviewPatchedTiles+=changed.length;
   return true;
  }
  function paintOverview(target,view,list,dpr,visibleComplete=false){
   const pad=worldCachePad(view,dpr),
    cw=Math.ceil((view.width+2*pad)*dpr),
    ch=Math.ceil((view.height+2*pad)*dpr);
   if(cw*ch>worldRasterLimit||cw>8192||ch>8192||
      typeof document==='undefined')return false;
   const prepareStart=profileFrame?clock():0;
   // When the displayed raster and the decoded tile CONTENT are unchanged,
   // another full decoded-Map scan and sorted signature cannot affect pixels.
   // LRU reorders never change decodedRevision; insertions/evictions always do.
   const reusable=worldCacheFastReuse&&overviewRaster&&
    overviewRaster.decodedRevision===decodedRevision&&
    overviewRaster.variant===activeVariant&&
    overviewRaster.zoom===view.zoom&&overviewRaster.dpr===dpr&&
    overviewRaster.width===view.width&&overviewRaster.height===view.height&&
    overviewRaster.pad===pad&&
    overviewRaster.projectY===(view.projectY||.85)&&
    Math.abs(overviewRaster.panX-view.panX)<pad-8&&
    Math.abs(overviewRaster.panY-view.panY)<pad-8;
   if(reusable){
    overviewHits++;overviewFastHits++;
    if(loading.size&&!visibleComplete)overviewStreamingHits++;
   }else{
   overviewRechecks++;
   const anchorView=overviewRaster&&overviewRaster.zoom===view.zoom&&
    overviewRaster.dpr===dpr&&overviewRaster.width===view.width&&
    overviewRaster.height===view.height&&
    Math.abs(overviewRaster.panX-view.panX)<pad-8&&
    Math.abs(overviewRaster.panY-view.panY)<pad-8?
     {...view,panX:overviewRaster.panX,panY:overviewRaster.panY}:view;
   const bufferedBounds=viewportPolicy.screenBounds(anchorView,{
    marginWorld:Math.max((pad+48)/view.zoom,
     SCENERY_OVERHANG_WORLD+32)});
   // Multiple image densities may coexist in the decoder RAM. Rasterize
   // exactly ONE variant per world tile: the requested LOD or its fallback.
   const chosen=new Map();
   for(const [key,entry] of decoded){
    const t=entry.record.tile;
    if(!viewportPolicy.visibleTile(
      Math.round(t.x/512),Math.round(t.y/512),bufferedBounds))continue;
    const logical=entry.record.key,previous=chosen.get(logical);
    if(!previous||entry.variant===activeVariant)chosen.set(logical,key);
   }
   const bufferKeys=[...chosen.values()].sort();
   // Map iteration order is LRU order and changes on every tile read.
   // Sort to prevent a false raster rebuild during a simple camera pan.
   const signature=bufferKeys.join(';');
   const usable=overviewRaster&&overviewRaster.zoom===view.zoom&&
    overviewRaster.dpr===dpr&&overviewRaster.width===view.width&&
    overviewRaster.height===view.height&&overviewRaster.pad===pad&&
    overviewRaster.projectY===(view.projectY||.85)&&
    overviewRaster.signature===signature&&
    Math.abs(overviewRaster.panX-view.panX)<pad-8&&
    Math.abs(overviewRaster.panY-view.panY)<pad-8;
   if(usable){
    overviewHits++;
    if(loading.size&&!visibleComplete)overviewStreamingHits++;
    overviewRaster.decodedRevision=decodedRevision;
    overviewRaster.variant=activeVariant;
   }else{
    // Cache the completed portion of the map even while more PNGs decode.
    // Its signature includes exact decoded tiles and their 1x/2x variant,
    // so arrivals trigger a rebuild BEFORE Fog can reveal that landscape.
    // 25D forced a full direct world paint on every frame while loading;
    // this opt-out keeps that legacy behavior available for CI A/B.
    if(!streamingWorldCache&&loading.size&&!visibleComplete)return false;
    if(patchOverview(view,dpr,pad,chosen,signature)){
     if(loading.size&&!visibleComplete)overviewStreamingBuilds++;
    }else{
    const buffer=document.createElement('canvas');
    buffer.width=cw;buffer.height=ch;
    const g=buffer.getContext('2d',{alpha:true});
    if(!g)return false;
    const bufferView={...view,width:view.width+2*pad,
     height:view.height+2*pad};
    paintWorld(g,bufferView,bufferKeys.map(key=>({
     entry:decoded.get(key)
    })),dpr);
    overviewRaster={canvas:buffer,width:view.width,height:view.height,
     zoom:view.zoom,dpr,panX:view.panX,panY:view.panY,
     projectY:view.projectY||.85,decodedRevision,variant:activeVariant,
     signature,pad,shown:shownOverview(chosen)};
    overviewBuilds++;
    if(loading.size&&!visibleComplete)overviewStreamingBuilds++;
    }
   }
   }
   if(profileFrame)profileFrame.worldPrepareMs+=clock()-prepareStart;
   const m=overviewRaster,planStart=profileFrame?clock():0,
    plan=sparseWorldBlit&&worldBlitPlanner?
     worldBlitPlanner(view,cells,dpr):null;
   if(profileFrame)profileFrame.worldPrepareMs+=clock()-planStart;
   const blitStart=profileFrame?clock():0;
   const sx=(m.pad+m.panX-view.panX)*dpr,
    sy=(m.pad+m.panY-view.panY)*dpr,
    fullPixels=Math.round(view.width*dpr)*Math.round(view.height*dpr);
   worldBlitFullDevicePixels+=fullPixels;
   if(plan){
    sparseWorldBlitFrames++;
    worldBlitLastRectCount=plan.rects.length;
    worldBlitLastFraction=plan.fraction;
    worldBlitDevicePixels+=plan.pixels;
    // Rectangles are device-aligned. Reuse the SAME 9-argument sampling,
    // simply exclude already-transparent world pixels outside every
    // visible/explored authored Fog hex (including Scenery's +45 halo).
    for(const r of plan.rects){
     target.drawImage(m.canvas,sx+r.x,sy+r.y,r.w,r.h,
      r.x/dpr,r.y/dpr,r.w/dpr,r.h/dpr);
    }
   }else{
    if(sparseWorldBlit)sparseWorldBlitFallbacks++;
    worldBlitLastRectCount=1;worldBlitLastFraction=1;
    worldBlitDevicePixels+=fullPixels;
    target.drawImage(m.canvas,sx,sy,view.width*dpr,view.height*dpr,
     0,0,view.width,view.height);
   }
   if(profileFrame)profileFrame.worldBlitMs+=clock()-blitStart;
   return true;
  }
  function draw(){
   if(!active||!pose)return null;
   const now=typeof performance!=='undefined'?performance.now():Date.now();
   profileFrame=profiler?{selectMs:0,worldMs:0,groundMs:0,sceneryMs:0,
    maskMs:0,worldPainterMs:0,worldPrepareMs:0,worldBlitMs:0,
    cloudMs:0,fogMs:0,
    fogUnreadyMs:0,fogTransitionsMs:0,fogCullMs:0,statusMs:0}:null;
   const b=canvas.getBoundingClientRect?.()||{width:canvas.width,height:canvas.height};
   const width=Math.max(1,Math.floor(b.width)),height=Math.max(1,Math.floor(b.height));
   const dpr=Math.max(1,Math.min(4,pose.dpr||1));
   const dw=Math.round(width*dpr),dh=Math.round(height*dpr);
   if(canvas.width!==dw||canvas.height!==dh){
    canvas.width=dw;canvas.height=dh;baseStamp=null;
   }
   ctx.setTransform(dpr,0,0,dpr,0,0);
   ctx.globalAlpha=1;ctx.imageSmoothingEnabled=true;
   ctx.imageSmoothingQuality='high';
   const view={...pose,width,height},proj=view.projectY||.85;
   const snap=v=>Math.round(v*dpr)/dpr;
   const visible=[],prefetch=[];
   // During a longer cloud dissolve, cache the static baked landscape
   // even in ordinary detail view when memory permits. Only the lightweight
   // fog overlay then needs to change on animation frames.
   // Warm panning at ordinary zoom should reuse the same padded world
   // raster as overview zoom. paintOverview enforces an 8.5 MP memory cap.
   const rasterPad=viewportPolicy?worldCachePad(view,dpr):0;
   worldEffectivePad=rasterPad;
   if(adaptiveWorldPad&&viewportPolicy){
    const preferred=viewportPolicy.cameraCacheMargin(view.zoom);
    if(rasterPad>preferred)worldPadBoostFrames++;
    if(rasterPad<Math.ceil(preferred*1.8))worldPadClampFrames++;
   }
   const worldMargin=Math.max(viewportPolicy?.MARGIN_WORLD||0,
    rasterPad?(rasterPad+45)/view.zoom:0);
   const extra=viewportPolicy?.screenBounds(view,{marginWorld:worldMargin})||null;
   const indexedCandidates=tileCandidates(extra);
   if(!indexedCandidates)tileLegacyCandidateChecks+=available.size;
   for(const {key,ix,iy} of indexedCandidates||tileRecords){
     const x=ix*512,y=iy*512;
    const left=snap(width/2+view.panX+x*view.zoom),
     top=snap(height/2+view.panY+y*view.zoom*proj),
     right=snap(width/2+view.panX+(x+512)*view.zoom),
     bottom=snap(height/2+view.panY+(y+512)*view.zoom*proj);
    const haloX=SCENERY_OVERHANG_WORLD*view.zoom,
     haloY=SCENERY_OVERHANG_WORLD*view.zoom*proj;
    if(left-haloX>=width||top-haloY>=height||
       right+haloX<=0||bottom+haloY<=0){
     // Tree crowns and shadows can be ON SCREEN even when their 512px
     // tile core is not. Protect and paint the complete overhang too.
     if(extra&&viewportPolicy.visibleTile(ix,iy,extra))
      prefetch.push({key,left,top,right,bottom});
     continue;
    }
    visible.push({key,left,top,right,bottom});
   }
   const previousVariant=activeVariant,variant=desiredVariant();
   if(previousVariant!==variant){lodSwitches++;overviewRaster=null;}
   visibleMissing=visible.some(t=>!decodedEntry(t.key,variant));
   protectedKeys=new Set(visible.flatMap(t=>{
    const result=[cacheKey(t.key,variant)];
    const other=cacheKey(t.key,variant==='1x'?'2x':'1x');
    if(!decoded.has(cacheKey(t.key,variant))&&decoded.has(other))
     result.push(other);
    return result;
   }));
   keepWithinBudget();
   // Decode the middle of the viewport first when the map opens; always
   // keep already decoded tiles, even when 30M pixels cannot hold all of them.
   visible.sort((a,b)=>{
    const ax=(a.left+a.right)/2-width/2,ay=(a.top+a.bottom)/2-height/2,
     bx=(b.left+b.right)/2-width/2,by=(b.top+b.bottom)/2-height/2;
    return ax*ax+ay*ay-bx*bx-by*by;
   });
   const tiles=[];
   for(const t of visible){
    visibleRequested++;
    const entry=read(t.key,variant,'visible');
    if(entry){
     if(entry.variant!==variant)variantFallbackFrames++;
     tiles.push({...t,entry});
    }
    else misses++;
   }
   // Demand is ordered after on-screen keys; a new visible packet can
   // pre-empt speculative work on the next RAF, but previously prefetched
   // packets remain warm across short camera reversals.
   prefetch.sort((a,b)=>{
    const dx=a.left+a.right-width,dy=a.top+a.bottom-height,
     ex=b.left+b.right-width,ey=b.top+b.bottom-height;
    return dx*dx+dy*dy-ex*ex-ey*ey;
   });
   // A camera moving left exposes the new world on screen-right. Do not
   // occupy the only speculative loading slot with trailing/off-route tiles.
   // Coast for up to five stationary frames after a drag, then resume normal
   // distance-based prefetch. Zoom or density changes clear the direction.
   if(prefetchPose){
    const compatible=prefetchPose.zoom===view.zoom&&
     prefetchPose.dpr===dpr&&prefetchPose.projectY===proj;
    if(!compatible){
     prefetchMotionX=0;prefetchMotionY=0;prefetchCoastFrames=0;
    }else{
     const mx=prefetchPose.panX-view.panX,
      my=prefetchPose.panY-view.panY;
     if(mx*mx+my*my>=36){
      prefetchMotionX=mx;prefetchMotionY=my;prefetchCoastFrames=6;
     }else if(prefetchCoastFrames>0)prefetchCoastFrames--;
    }
   }
   prefetchPose={zoom:view.zoom,panX:view.panX,panY:view.panY,
    dpr,projectY:proj};
   const leading=directionalPrefetch&&prefetchGuard&&
    !zoomPreview&&prefetchCoastFrames>0;
   if(leading)directionalPrefetchFrames++;
   for(const t of prefetch){
    prefetchRequested++;
    if(leading){
     const dx=t.left+t.right-width,dy=t.top+t.bottom-height;
     if(dx*prefetchMotionX+dy*prefetchMotionY<=0){
      prefetchTrailingSkipped++;continue;
     }
    }
    const before=prefetchReadStarts;
    read(t.key,variant,'prefetch');
    if(leading&&prefetchReadStarts>before)prefetchLeadingStarts++;
   }
   if(profileFrame)profileFrame.selectMs=clock()-now;
   // A second large displayed Canvas can slow active panning. Switch back
   // to the original single-canvas compositor whenever the CAMERA MOVES.
   // A stationary Fog/dissolve frame may switch to the overlay; on entry
   // the clean world is recomposited once, then held without repeated blits.
   const cameraStill=!!baseStamp&&baseStamp.width===width&&
    baseStamp.height===height&&baseStamp.dpr===dpr&&
    baseStamp.zoom===view.zoom&&baseStamp.panX===view.panX&&
    baseStamp.panY===view.panY&&baseStamp.projectY===proj;
   const wantsFogLayer=!!fogCtx&&(!baseStamp||cameraStill)&&!zoomPreview;
   if(fogCtx&&fogLayerActive!==wantsFogLayer){
    fogLayerActive=wantsFogLayer;
    fogCanvas.hidden=!wantsFogLayer;
   }
   if(wantsFogLayer){
    if(fogCanvas.width!==dw||fogCanvas.height!==dh){
     fogCanvas.width=dw;fogCanvas.height=dh;
    }
    fogCtx.setTransform(1,0,0,1,0,0);
    fogCtx.clearRect(0,0,dw,dh);
    fogCtx.setTransform(dpr,0,0,dpr,0,0);
    fogCtx.globalAlpha=1;fogCtx.imageSmoothingEnabled=true;
    fogCtx.imageSmoothingQuality='high';
   }
   if(zoomPreview&&zoomPreview.width===width&&zoomPreview.height===height){
    // Continuous wheel gesture: transform one authorized canvas snapshot
    // instead of recomputing every Ground/Scenery and cloud stamp per tick.
    // While previewing, tile reads above still warm the destination area.
    const from=zoomPreview.pose,
     ratio=view.zoom/(from.zoom||1),
     ox=width/2+view.panX-ratio*(width/2+from.panX)-
      zoomPreview.padX*ratio,
     oy=height/2+view.panY-ratio*(height/2+from.panY)-
      zoomPreview.padY*ratio,
     destW=zoomPreview.extendedWidth*ratio,
     destH=zoomPreview.extendedHeight*ratio;
    // If a single extreme zoom step outruns the captured overscan, render
    // the real scene rather than exposing a rectangular screenshot.
    if(ox<=0&&oy<=0&&ox+destW>=width&&oy+destH>=height){
     ctx.globalAlpha=1;
     ctx.drawImage(zoomPreview.image,ox,oy,destW,destH);
     // Preview includes Fog already: do not draw it twice above #game.
     baseStamp=null;
     zoomPreviewFrames++;
     frame++;paintMs=(typeof performance!=='undefined'?
      performance.now():Date.now())-now;
     onStatus(report());
     return report();
    }
   }
   // Only true no-camera-change Fog frames reuse the unchanged world.
   // Every changed decoded PNG, cloud asset, canvas size, or pose repaints
   // the entire base BEFORE Fog can expose any new terrain pixels.
   const baseReusable=fogLayerActive&&basePaintWasLayered&&baseStamp&&
    baseStamp.decodedRevision===decodedRevision&&
    baseStamp.cloudRevision===cloudRevision&&
    baseStamp.width===width&&baseStamp.height===height&&
    baseStamp.dpr===dpr&&baseStamp.zoom===view.zoom&&
    baseStamp.panX===view.panX&&baseStamp.panY===view.panY&&
    baseStamp.projectY===proj;
   if(baseReusable){fogOnlyFrames++;}
   else{
    const cloudStart=profileFrame?clock():0;
    if(clouds)drawCloudBackground(ctx,view,dpr);
    else{ctx.fillStyle='#bfcbd7';ctx.fillRect(0,0,width,height);}
    if(profileFrame)profileFrame.cloudMs+=clock()-cloudStart;
    const worldCompositeStart=profileFrame?clock():0;
    if(!useLayerCache||!rasterPad||!paintOverview(ctx,view,tiles,dpr,tiles.length===visible.length)){
     // Unready landscape stays under the existing fog, never exposed.
     worldCacheFallbackFrames++;overviewRaster=null;
     paintWorld(ctx,view,tiles,dpr);
    }
    if(profileFrame)profileFrame.worldMs+=clock()-worldCompositeStart;
    baseFrames++;basePaintWasLayered=fogLayerActive;
    baseStamp={width,height,dpr,zoom:view.zoom,panX:view.panX,
     panY:view.panY,projectY:proj,decodedRevision,cloudRevision};
   }
   const fogStart=profileFrame?clock():0;
   if(clouds){
    const fogCullStart=profileFrame?clock():0;
    const fogCells=fogCellsFor(view),fogEdges=fogEdgesFor(view);
    fogUnreadyCandidates=cells.length;
    fogUnreadySubmitted=fogCells.length;
    fogFrontierCandidates=frontierEdges().length;
    fogFrontierSubmitted=fogEdges.length;
    if(profileFrame)profileFrame.fogCullMs=clock()-fogCullStart;
    // Do not reveal a partially loaded hex: both completed PNG layers of
    // every intersecting tile must be decoded before fog retreats.
    const ready=isHexReady;
    dissolveActive=false;
    const nowFade=typeof performance!=='undefined'?performance.now():Date.now();
    const fadeOpacity=(cell,isReady)=>{
     const id=cell.q+','+cell.r;
     const cx=width/2+view.panX+cell.x*view.zoom,
      cy=height/2+view.panY+cell.y*view.zoom*proj,
      r=cell.radius*view.zoom;
     const onScreen=cx+r>=0&&cx-r<=width&&
      cy+r*proj>=0&&cy-r*proj<=height;
     if(!isReady){
      revealedAt.delete(id);
      if(onScreen)unreadyObserved.add(id);
      return 1;
     }
     // A READY hex entering the viewport needs no transition at all:
     // only dissolve the clouds that the player actually saw while waiting.
     if(!unreadyObserved.has(id))return 0;
     if(!revealedAt.has(id))revealedAt.set(id,nowFade);
     const elapsed=Math.max(0,nowFade-revealedAt.get(id));
     if(elapsed>=DISSOLVE_MS){
      revealedAt.delete(id);unreadyObserved.delete(id);
      return 0;
     }
     dissolveActive=true;
     const t=elapsed/DISSOLVE_MS;
     // Ease opacity down smoothly; the authored cloud artwork's soft
     // edges make this look like dispersing mist instead of a hard cut.
     return 1-t*t*(3-2*t);
    };
    // Preserve Step22's fade lifecycle for hexes we previously showed
    // as unready: if a tile becomes ready offscreen, its 850ms dissolve
    // must finish there, not blink back into existence on return.
    // Only previously observed IDs need offscreen readiness checks.
    if(fogViewportCull&&fogViewport&&unreadyObserved.size){
     const painted=new Set(fogCells.map(c=>c.q+','+c.r));
     for(const id of [...unreadyObserved]){
      if(painted.has(id))continue;
      const cell=authoredVisibleById.get(id);
      if(cell)fadeOpacity(cell,ready(cell));
     }
    }
    const fogUnreadyStart=profileFrame?clock():0;
    clouds.drawUnready(fogLayerActive?fogCtx:ctx,view,fogCells,ready,fadeOpacity);
    if(profileFrame)profileFrame.fogUnreadyMs=clock()-fogUnreadyStart;
    const fogTransitionsStart=profileFrame?clock():0;
    clouds.drawTransitions(fogLayerActive?fogCtx:ctx,view,fogEdges);
    if(profileFrame)profileFrame.fogTransitionsMs=clock()-fogTransitionsStart;
   }
   if(profileFrame)profileFrame.fogMs+=clock()-fogStart;
   frame++;paintMs=clock()-now;
   const currentReport=report(),statusStart=profileFrame?clock():0;
   onStatus(currentReport);
   if(profileFrame){
    profileFrame.statusMs=clock()-statusStart;
    profiler.frame({
     time:clock(),drawMs:clock()-now,...profileFrame,
     renderMode:currentReport.renderMode,zoom:view.zoom,dpr,
     canvasPixels:dw*dh,visibleTiles:visible.length,
     visibleReadyTiles:tiles.length,
     decodedTiles:decoded.size,pendingTiles:loading.size,
     activeVariant,decodedPixels,evictions,
     visibleReadStarts,prefetchReadStarts,decodeRepeats,
     visibleDecodeRepeats,prefetchDecodeRepeats,evictedSpeculative,
     prefetchSkippedBudget,prefetchSkippedVisible,
     prefetchSkippedSlots,visibleWaitingOnPrefetch,
     visibleBorrowStarts,peakInFlight,
     worldCacheBuilds:overviewBuilds,worldCacheHits:overviewHits,
     worldCacheFastHits:overviewFastHits,worldCacheRechecks:overviewRechecks,
     sparseWorldBlit,worldBlitLastRectCount,worldBlitLastFraction,
     worldBlitDevicePixels,worldBlitFullDevicePixels,
     worldCacheStreamingBuilds:overviewStreamingBuilds,
     worldCacheStreamingHits:overviewStreamingHits,
     worldCachePatchBuilds:overviewPatchBuilds,
     worldCachePatchedTiles:overviewPatchedTiles,
     cloudCacheBuilds:cloudBackdropBuilds,cloudCacheHits:cloudBackdropHits,
     cloudCachePad:cloudEffectivePad,cloudPadClamps,
     cloudAutoMode,cloudAutoDirectMs:cloudAutoMean(cloudAutoDirect),
     layeredFog:!!fogCtx,fogLayerActive,baseFrames,fogOnlyFrames,
     cloudAutoCachedMs:cloudAutoMean(cloudAutoCached),
     worldCacheFallbackFrames,cloudCacheFallbackFrames,
     worldRasterMiB:currentReport.overviewRasterMiB,
     cloudRasterMiB:currentReport.cloudBackdropMiB
    });
   }
   profileFrame=null;
   if(dissolveActive)repaint();
   return currentReport;
  }
  async function load(scene,selectedLevel,initialPose,knownCells){
   if(!/^v1-[0-9a-f]{8}$/.test(scene))throw Error('Ungültige Spielkartenkennung');
   if(!['mid','near','far'].includes(selectedLevel))throw Error('Ungültiges Karten-LOD');
   active=false;clearDecoded();sceneKey=scene;level=selectedLevel;
   pose={...initialPose};cells=knownCells.map(c=>({...c}));
    authorizedClipCells=cells.filter(c=>
     c.visibility==='visible'||c.visibility==='explored');
   authoredVisibleById=new Map(cells.filter(c=>c.visibility==='visible')
    .map(c=>[c.q+','+c.r,c]));
   available=new Set(await storage.keys(scene+'|'+level+'|'));
   buildTileIndex();
   active=true;repaint();onStatus(report());return report();
  }
  function stop(){active=false;clearDecoded();onStatus(report());}
  // The manifest is NOT a terrain raster. It is local, authored metadata
  // used by a standalone player that does not load app.js or any workers.
  // Runtime visibility MUST be resolved by a game server in multiplayer.
  async function saveManifest(scene,{cells:mapCells,levels=['mid'],
      pose:initialPose=null,clouds:cloudData=null,expectedTiles=null}={}){
   if(!/^v1-[0-9a-f]{8}$/.test(scene))throw Error('Ungültige Spielkartenkennung');
   if(!Array.isArray(mapCells)||!mapCells.every(c=>
      Number.isInteger(c.q)&&Number.isInteger(c.r)&&
      [c.x,c.y,c.radius].every(Number.isFinite)&&c.radius>0))
     throw Error('Ungültige Hex-Geometrie im Spielkartenmanifest');
   const chosen=[...new Set(levels)].filter(l=>['far','mid','near'].includes(l));
   if(!chosen.length)throw Error('Keine gültige Kartenauflösung');
   const record={key:scene+'|manifest',schema:SCHEMA,sceneKey:scene,
    levels:chosen,cells:mapCells.map(c=>({...c,visibility:'visible'})),
    pose:initialPose?{...initialPose}:null,
    expectedTiles:Number.isSafeInteger(expectedTiles)&&expectedTiles>=0?expectedTiles:null,
    clouds:cloudData?{seed:String(cloudData.seed||'vedras-local-preview'),
     assets:(Array.isArray(cloudData.assets)?cloudData.assets:[]).slice(0,4).map(a=>({path:String(a.path||'')}))}:null,
    savedAt:new Date().toISOString()};
   await storage.put(record);return record;
  }
  async function loadManifest(scene){
   if(!/^v1-[0-9a-f]{8}$/.test(scene))throw Error('Ungültige Spielkartenkennung');
   const data=await storage.get(scene+'|manifest');
   if(!data||data.schema!==SCHEMA||data.sceneKey!==scene||
      !Array.isArray(data.cells)||!Array.isArray(data.levels))
    throw Error('Keine vorbereitete Spielkarten-Geometrie gefunden');
   return data;
  }
  async function capture(scene,packets,{onProgress=()=>{}}={}){
   if(!/^v1-[0-9a-f]{8}$/.test(scene))throw Error('Ungültige Spielkartenkennung');
   const exact=packets.filter(valid),rejected=packets.length-exact.length;
   const known=new Set();
   for(const level of new Set(exact.map(p=>p.level)))
    for(const key of await storage.keys(scene+'|'+level+'|'))known.add(key);
   let saved=0,skipped=0;
   for(const packet of exact){
    const key=makeKey(scene,packet.level,packet.tile.id);
    if(known.has(key)){skipped++;continue;}
    const layers=[];
    for(const layer of packet.layers)layers.push({
     layer:layer.layer,pad:layer.pad||0,crop:layer.crop||null,
     png:await encode(layer.image)
    });
    await storage.put({key,sceneKey:scene,level:packet.level,
     tile:{...packet.tile},revision:packet.revision,layers});
    saved++;known.add(key);onProgress({saved,skipped,total:exact.length,rejected});
   }
   return {saved,skipped,rejected,total:packets.length};
  }
  return {capture,load,stop,draw,report,getPose,setPose,setClouds,
   beginZoomPreview,endZoomPreview,
   saveManifest,loadManifest,isActive:()=>active,storage};
 }
 return {create,memoryStore,indexedStore,valid,makeKey};
})();
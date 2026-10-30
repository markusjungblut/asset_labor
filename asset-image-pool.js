/* Vedras Reiche – bounded image decoding and decoded-image LRU.
 * Only needed/selected graphics are decoded; raw PNGs stay on disk.
 * The browser owns Image memory, so estimates are advisory, not RSS.
 */
'use strict';
window.VedrasImagePool=(()=>{
 const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
 function create({parallel=4,maxBytes=192*1024*1024,protectMs=18000,
  previewTerrainPx=512,previewSpritePx=1024,onReady=()=>{}}={}){
  const targetLimit=asset=>['terrain','terrain_base','shorelines'].includes(asset.category)?
   previewTerrainPx:['nature','buildings','units'].includes(asset.category)?previewSpritePx:0;
  function prepare(asset,image){
   const __t=now();
   const limit=targetLimit(asset);
   asset.previewReduced=false;
   if(!limit||typeof document==='undefined'||!document.createElement)return image;
   const longest=Math.max(image.naturalWidth||0,image.naturalHeight||0);
   if(longest<=limit)return image;
   const scale=limit/longest,w=Math.max(1,Math.round(image.naturalWidth*scale)),
    h=Math.max(1,Math.round(image.naturalHeight*scale));
   const cv=document.createElement('canvas');cv.width=w;cv.height=h;
   const ctx=cv.getContext('2d',{alpha:true});if(!ctx)return image;
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(image,0,0,w,h);
   window.VedrasBenchmarkProfiler?.record('images.resampleMs',now()-__t);
   window.VedrasBenchmarkProfiler?.count('images.resampled');
   // Compatible with the engine's original HTMLImageElement dimension checks.
   cv.naturalWidth=w;cv.naturalHeight=h;cv.complete=true;
   asset.sourceDimensions={width:image.naturalWidth,height:image.naturalHeight};
   asset.previewReduced=true;
   return cv;
  }
  let active=0,activeUpgrades=0,queue=[],resources=new Map(),generation=0,protectedPaths=new Set();
  let stats={ready:0,failed:0,evicted:0,requests:0,decodedBytes:0,
   peakBytes:0,promoted:0,promotionFailures:0,deferredUpgrades:0,
   identicalRedecodes:0,sourceChanges:0};
  const size=img=>Math.max(0,(img?.naturalWidth||0)*(img?.naturalHeight||0)*4);
  function prune(force=false,headroom=0){
   if(stats.decodedBytes+headroom<=maxBytes&&!force)return;
   // Never evict an asset which has just been decoded or requested.
   // Repeated frame requests previously reloaded an evicted PNG immediately:
   // 74,166 loads and 74,025 evictions during a single benchmark.
   // Retain only a short hot window (max 2.5 s), not the old 24-second
   // exemption, so stale previews can still leave the pool promptly.
   const protectAge=Math.min(2500,Math.max(0,protectMs));
   const time=now();
   const candidates=[...resources.values()].filter(r=>r.ready&&!r.loading&&
    !protectedPaths.has(r.asset.path)&&time-r.lastUsed>=protectAge)
    .sort((a,b)=>{
     // Small shared terrain materials are preferred over transient sprites.
     const priority=e=>['terrain','terrain_base','shorelines'].includes(e.asset.category)?1:0;
     return priority(a)-priority(b)||a.lastUsed-b.lastUsed;
    });
   for(const entry of candidates){
    if(stats.decodedBytes+headroom<=maxBytes&&!force)break;
    window.VedrasStep15Trace?.record('asset.pool-evict',{
     path:entry.asset.path,category:entry.asset.category,bytes:entry.bytes,
     decodedBytes:stats.decodedBytes,limitBytes:maxBytes,
     ageMs:Math.round(time-entry.lastUsed),protected:false});
    resources.delete(entry.asset.path);
    window.VedrasBenchmarkProfiler?.count('images.evicted');
    stats.decodedBytes-=entry.bytes;entry.asset.img=null;
    // Old Image elements remain referenced by active draw operations only;
    // neither the asset catalogue nor our LRU holds them after eviction.
    entry.img=null;stats.evicted++;
   }
  }
  function pump(){
   while(active<parallel&&queue.length){
    queue.sort((a,b)=>b.priority-a.priority||a.order-b.order);
    // Image resampling 2048px+ canvases on the main thread must never
    // run as four simultaneous upgrades. Initial missing assets may still
    // fill the remaining slots, so upgrades do not block map readiness.
    const index=queue.findIndex(item=>!item.upgrade||activeUpgrades===0);
    if(index<0)break;
    const [r]=queue.splice(index,1);
    if(r.generation!==generation){
     if(!r.upgrade)r.resolve(null);continue;
    }
    const wasUpgrade=!!r.upgrade;
    active++;if(wasUpgrade)activeUpgrades++;
    r.loading=true;
    const __loadStart=now();
    const img=new Image();
    img.decoding='async';
    const finish=successful=>{
     window.VedrasBenchmarkProfiler?.record('images.loadWallMs',now()-__loadStart);
     window.VedrasBenchmarkProfiler?.count(successful?'images.loaded':'images.failed');
     active--;if(wasUpgrade)activeUpgrades--;
     r.loading=false;
     if(r.generation!==generation){
      if(!r.upgrade)r.resolve(null);
      r.upgrade=false;pump();return;
     }
     const upgrading=!!r.upgrade,previousBytes=upgrading?r.bytes:0;
     r.upgrade=false;
     if(successful){
      const source=prepare(r.asset,img);
      r.img=source;r.asset.img=source;r.bytes=size(source);r.lastUsed=now();
      r.ready=true;r.failed=false;
      // A decoded-image eviction is not a material edit. Keep the semantic
      // revision stable when the same versioned URL produces the same raster
      // dimensions. Missing -> ready and preview -> larger raster still change it.
      // In-place file changes must supply a new URL/mtime (as loadLibrary does).
      const sourceWidth=img.naturalWidth,sourceHeight=img.naturalHeight;
      const decodedWidth=source.naturalWidth||source.width;
      const decodedHeight=source.naturalHeight||source.height;
      const contentKey=JSON.stringify([r.asset.url,r.asset.mtime??null,
       sourceWidth,sourceHeight,decodedWidth,decodedHeight]);
      const priorKey=r.asset.imageContentKey;
      const firstDecode=priorKey===undefined;
      const contentChanged=firstDecode||priorKey!==contentKey;
      const previousRevision=r.asset.imageRevision||0;
      if(contentChanged){
       r.asset.imageRevision=previousRevision+1;
       r.asset.imageContentKey=contentKey;
       if(!firstDecode&&!upgrading)stats.sourceChanges++;
      }else stats.identicalRedecodes++;
      const kind=firstDecode?'first-decode':!contentChanged?'repeat-decode':
       upgrading?'quality-upgrade':'source-change';
      stats.decodedBytes+=r.bytes-previousBytes;
      stats.peakBytes=Math.max(stats.peakBytes,stats.decodedBytes);
      if(upgrading)stats.promoted++;else{stats.ready++;r.resolve(source);}
      const detail={kind,contentChanged,firstDecode,
       previousRevision,revision:r.asset.imageRevision,
       path:r.asset.path,category:r.asset.category,
       sourceWidth,sourceHeight,decodedWidth,decodedHeight,
       assetBytes:r.bytes,previousBytes,decodedBytes:stats.decodedBytes,
       limitBytes:maxBytes,protected:protectedPaths.has(r.asset.path)};
      window.VedrasStep15Trace?.record('asset.pool-ready',detail);
      onReady(r.asset,detail);prune();
     }else if(upgrading){
      // Keep the old small image usable. A broken original is never a blank
      // frame or a reason to rebuild unrelated terrain chunks.
      stats.promotionFailures++;r.failedUpgrade=true;
     }else{stats.failed++;r.failed=true;r.resolve(null);}
     pump();
    };
    img.onload=()=>finish(!!img.naturalWidth);
    img.onerror=()=>finish(false);
    img.src=r.asset.url;
   }
  }
  function ensure(asset,priority=0){
   if(!asset?.path||!asset.url)return Promise.resolve(null);
   let r=resources.get(asset.path);
   if(r){
    r.lastUsed=now();
    if(r.ready){
     const longest=Math.max(r.img?.naturalWidth||r.img?.width||0,
      r.img?.naturalHeight||r.img?.height||0);
     const sourceMax=Math.max(r.asset.sourceDimensions?.width||0,
      r.asset.sourceDimensions?.height||0);
     const target=targetLimit(r.asset);
     // Quality changes do not purge the entire pool. Upgrade only an
     // already-visible/selected asset when its previous preview is too small.
     if(!r.upgrade&&!r.failedUpgrade&&r.asset.previewReduced&&
        target>longest&&sourceMax>longest&&protectedPaths.has(asset.path)){
      const ratio=Math.min(1,target/sourceMax);
      const area=Math.max(1,Math.round((r.asset.sourceDimensions?.width||target)*ratio))*
       Math.max(1,Math.round((r.asset.sourceDimensions?.height||target)*ratio));
      const additional=Math.max(0,area*4-r.bytes);
      // Upgrading 200+ sprites while panning exhausted the Chromium main
      // thread. Allow at most two pending promotions and reserve their memory
      // before scheduling expensive canvas resampling.
      const upgradesPending=queue.filter(item=>item.upgrade).length+activeUpgrades;
      if(upgradesPending<2){
       prune(false,additional);
       if(stats.decodedBytes+additional<=maxBytes){
        r.upgrade=true;r.order=stats.requests++;r.priority=priority;
        queue.push(r);pump();
       }else if(!r.lastDeferred||now()-r.lastDeferred>5000){
        r.lastDeferred=now();stats.deferredUpgrades++;
       }
      }
     }
     return Promise.resolve(r.img);
    }
    return r.promise;
   }
   if(asset.img?.naturalWidth){
    r={asset,img:asset.img,bytes:size(asset.img),ready:true,loading:false,lastUsed:now()};
    resources.set(asset.path,r);stats.decodedBytes+=r.bytes;
    return Promise.resolve(r.img);
   }
   r={asset,ready:false,loading:false,bytes:0,lastUsed:now(),
    generation,priority,order:stats.requests++};
   r.promise=new Promise(resolve=>{r.resolve=resolve;});
   window.VedrasBenchmarkProfiler?.count('images.requested');
   resources.set(asset.path,r);queue.push(r);pump();return r.promise;
  }
  function protect(paths){protectedPaths=new Set(paths||[]);prune();}
  function setBudgetBytes(bytes){
   if(!Number.isFinite(bytes)||bytes<64*1048576||bytes>768*1048576)
    throw Error('Invalid decoded preview memory budget');
   const changed=maxBytes!==bytes;
   maxBytes=bytes;if(changed)prune();
   return changed;
  }
  function clear(){
   protectedPaths.clear();
   generation++;
   for(const r of queue)if(!r.upgrade)r.resolve(null);
   queue=[];
   for(const r of resources.values())if(r.ready){r.asset.img=null;}
   resources.clear();stats.decodedBytes=0;
  }
  async function originals(assets){
   const list=[...new Map((assets||[]).filter(a=>a?.previewReduced&&a.url)
    .map(a=>[a.path,a])).values()];
   const restored=[];
   try{
    for(let i=0;i<list.length;i+=parallel){
     await Promise.all(list.slice(i,i+parallel).map(a=>new Promise((resolve,reject)=>{
      const img=new Image();img.decoding='async';
      img.onload=()=>{
       if(!img.naturalWidth){reject(Error('Ungültige Originalgrafik: '+a.path));return;}
       const preview=a.img;restored.push({a,preview});a.img=img;resolve();
      };
      img.onerror=()=>reject(Error('Originalgrafik fehlt: '+a.path));
      img.src=a.url;
     })));
    }
   }catch(err){
    for(const {a,preview} of restored)a.img=preview;
    throw err;
   }
   return ()=>{for(const {a,preview} of restored)a.img=preview;};
  }
  function setPreviewLimits({terrainPx=previewTerrainPx,
    spritePx=previewSpritePx}={}){
   const finiteSize=n=>Number.isFinite(n)&&n>=128&&n<=4096;
   if(!finiteSize(terrainPx)||!finiteSize(spritePx))
    throw Error('Invalid image preview limits');
   const changed=terrainPx!==previewTerrainPx||spritePx!==previewSpritePx;
   previewTerrainPx=terrainPx;previewSpritePx=spritePx;
   // No global eviction or decode storm: ensure() lazily promotes assets.
   // A previously failed promotion may retry after a changed profile.
   if(changed)for(const r of resources.values())r.failedUpgrade=false;
   return changed;
  }
  function report(){
   let protectedBytes=0;
   for(const [path,r] of resources)if(protectedPaths.has(path)&&r.ready)
    protectedBytes+=r.bytes;
   return {...stats,active,activeUpgrades,queued:queue.length,
    resident:resources.size,protectedAssets:protectedPaths.size,protectedBytes,
    overLimitBytes:Math.max(0,stats.decodedBytes-maxBytes),
    previewTerrainPx,previewSpritePx,limitBytes:maxBytes};
  }
  return {ensure,clear,prune,report,originals,protect,setPreviewLimits,setBudgetBytes};
 }
 return {create};
})();
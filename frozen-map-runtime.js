/* Step 17: proof of the actual shipped-map architecture.
 * This viewer NEVER asks a terrain Worker or a WorldTile source to bake.
 * It reads ONLY completed, explicitly exported static PNG tile layers
 * from IndexedDB. Initial authoring/precomputation is separate.
 * Local Asset-Labor test only. Server-authorized Fog is still required
 * for any future multiplayer use: do not ship hidden terrain to clients.
 */
'use strict';
window.VedrasFrozenMap=(()=>{
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
 function create({canvas,storage=indexedStore(),decode=null,encode=encodeImage,onStatus=()=>{},
    maxDecodedPixels=95000000,useLayerCache=true,profiler=null,
    overview1x=false,largeViewportCache=true}={}){
  if(!canvas?.getContext)throw Error('Canvas für Spielkartentest fehlt');
  const ctx=canvas.getContext('2d',{alpha:true});
  let active=false,sceneKey='',level='mid',pose=null,cells=[],available=new Set();
  let generation=0,paintScheduled=false;
  // Decoded image packets are immutable and committed only after ALL layers
  // decode. Keep the entire visible set pinned while the viewport is shown;
  // the old 30M LRU evicted still-visible tiles on every camera repaint.
  let protectedKeys=new Set();
  const SCENERY_OVERHANG_WORLD=128; // Existing world-tile scene pad
  const decoded=new Map(),loading=new Set();
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
  const revealedAt=new Map(),unreadyObserved=new Set(),DISSOLVE_MS=850;
  let dissolveActive=false,authoredFogSet=null,authoredEdges=null;
  let overviewRaster=null,overviewHits=0,overviewBuilds=0;
  let cloudBackdropRaster=null,cloudBackdropHits=0,cloudBackdropBuilds=0;
  let worldCacheFallbackFrames=0,cloudCacheFallbackFrames=0;
  const worldRasterLimit=largeViewportCache?16500000:8500000;
  const cloudRasterLimit=largeViewportCache?8500000:6500000;
  let zoomPreview=null,zoomPreviewFrames=0,zoomPreviewStarted=0;
  let hits=0,loads=0,paintMs=0,misses=0,failures=0,frame=0,decodedPixels=0,
   evictions=0,profileFrame=null;
  const clock=()=>typeof performance!=='undefined'?performance.now():Date.now();
  const clouds=window.VedrasCloudArtwork?.create({
   onReady:()=>{cloudBackdropRaster=null;repaint();}
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
   pending:loading.size,frames:frame,paintMs,clouds:clouds?.stats()||null,
   cloudDissolveActive:dissolveActive,
   zoomPreviewActive:!!zoomPreview,zoomPreviewFrames,
   renderMode:useLayerCache?'cached':'direct',
   cloudBufferHexes:viewportPolicy?1:0,
   overviewRasterHits:overviewHits,overviewRasterBuilds:overviewBuilds,
   cloudBackdropHits,cloudBackdropBuilds,
   worldCacheFallbackFrames,cloudCacheFallbackFrames,largeViewportCache,
   worldRasterLimit,cloudRasterLimit,
   cloudBackdropMiB:cloudBackdropRaster?
    Math.round(cloudBackdropRaster.canvas.width*
     cloudBackdropRaster.canvas.height*4/1048576):0,
   overviewRasterMiB:overviewRaster?
    Math.round(overviewRaster.canvas.width*overviewRaster.canvas.height*4/1048576):0};}
  function clearDecoded(){generation++;for(const entry of decoded.values())
   for(const img of entry.images)img.close?.();
   decoded.clear();loading.clear();protectedKeys=new Set();decodedPixels=0;
   activeVariant='2x';lodSwitches=0;variantFallbackFrames=0;
   revealedAt.clear();unreadyObserved.clear();
   dissolveActive=false;authoredFogSet=null;
   authoredEdges=null;overviewRaster=null;zoomPreview=null;
   cloudBackdropRaster=null;
  }
  const repaint=()=>{
   if(!active||paintScheduled||typeof requestAnimationFrame!=='function')return;
   paintScheduled=true;
   requestAnimationFrame(()=>{paintScheduled=false;if(active)draw();});
  };
  function keepWithinBudget(){
   // 30M pixels was smaller than the visible bitmaps of a wide-screen
   // 2x viewport. 95M (~362 MiB RGBA) retains recently visited regions.
   // Never evict currently painted tiles, including fallback at LOD switch.
   while(decodedPixels>maxDecodedPixels&&decoded.size>1){
    let victim=null;
    for(const [key,entry] of decoded)
     if(!protectedKeys.has(key)&&entry.variant!==activeVariant){
      victim=key;break;
     }
    if(!victim)for(const key of decoded.keys())
     if(!protectedKeys.has(key)){victim=key;break;}
    if(!victim)break;
    const entry=decoded.get(victim);
    decoded.delete(victim);decodedPixels-=entry.pixels;evictions++;
    for(const im of entry.images)im.close?.();
   }
  }
  function read(key,variant=desiredVariant()){
   const id=cacheKey(key,variant),
    alternate=cacheKey(key,variant==='1x'?'2x':'1x');
   const hit=decoded.get(id);
   if(hit){
    decoded.delete(id);decoded.set(id,hit);
    hits++;return hit;
   }
   const fallback=decoded.get(alternate);
   if(fallback){decoded.delete(alternate);decoded.set(alternate,fallback);}
   if(!available.has(key)||loading.has(id))return fallback||null;
   if(loading.size>=3)return fallback||null;
   loading.add(id);
   const run=generation,readStarted=profiler?clock():0;
   let readFinished=0,decodeDuration=0;
   const operation=storage.getVariant?
    storage.getVariant(key,variant):storage.get(key);
   Promise.resolve(operation).then(async record=>{
    readFinished=profiler?clock():0;
    if(!record||!Array.isArray(record.layers))throw Error('Kachelpaket fehlt');
    const images=[],decodeStarted=profiler?clock():0;
    try{
     for(const layer of record.layers)images.push(await decodePNG(layer.png));
    }catch(error){for(const im of images)im.close?.();throw error;}
    if(profiler)decodeDuration=clock()-decodeStarted;
    if(!active||run!==generation||record.key!==key||
       record.sceneKey!==sceneKey||record.level!==level){
     for(const im of images)im.close?.();return;
    }
    const pixels=images.reduce((sum,im)=>
     sum+(im.width||0)*(im.height||0),0);
    decoded.set(id,{record,images,pixels,variant});
    decodedPixels+=pixels;loads++;
    keepWithinBudget();
    if(profiler)profiler.tileRead({
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
     error:true,storageMs:readFinished?
      readFinished-readStarted:clock()-readStarted,
     decodeMs:decodeDuration,totalMs:clock()-readStarted
    });
   }).finally(()=>{
    if(run===generation){loading.delete(id);repaint();}
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
     clouds.drawUnready(g,extendedView,cells,isHexReady,zoomSnapshotOpacity);
     clouds.drawTransitions(g,extendedView,frontierEdges());
    }
   }else{
    // Zoom-in never exposes pixels beyond the original viewport.
    g.drawImage(canvas,0,0,image.width,image.height);
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
   for(const key of available){
    const tail=key.slice((sceneKey+'|'+level+'|').length);
    const [ix,iy]=tail.split(',').map(Number);
    if(Number.isSafeInteger(ix)&&Number.isSafeInteger(iy)&&
       viewportPolicy.visibleTile(ix,iy,bounds)&&
       !decodedEntry(key,activeVariant))return true;
   }
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
   cloudBackdropRaster=null;
   clouds.setSeed(seed);
   clouds.setAssets(Array.isArray(assets)?assets:[]);
   repaint();return true;
  }
  function paintCloudBackdrop(target,view,dpr){
   if(!clouds)return false;
   // A bounded scene-aligned cloud backdrop avoids hundreds of artwork
   // stamps every time a warm 2x game scene pans a few screen pixels.
   const pad=viewportPolicy?.cameraCacheMargin(view.zoom)||160;
   // Backdrop clouds are soft artwork; 1.25x is enough even when
   // the fully detailed world layers require more than 1.25x.
   const cacheDpr=largeViewportCache?Math.min(1.25,dpr):dpr,
    cw=Math.ceil((view.width+pad*2)*cacheDpr),
    ch=Math.ceil((view.height+pad*2)*cacheDpr);
   if(cw*ch>cloudRasterLimit||cw>8192||ch>8192||
      typeof document==='undefined')return false;
   if(!authoredFogSet)authoredFogSet=new Set(cells.filter(c=>
    c.visibility==='visible'||c.visibility==='explored')
    .map(c=>c.q+','+c.r));
   const previous=cloudBackdropRaster;
   const usable=previous&&previous.zoom===view.zoom&&
    previous.dpr===cacheDpr&&previous.width===view.width&&
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
    for(const c of cells){
     if(c.visibility!=='visible'&&c.visibility!=='explored')continue;
     const x=width/2+view.panX+c.x*view.zoom,
      y=height/2+view.panY+c.y*view.zoom*proj,
      rx=(c.radius+halo)*view.zoom,ry=rx*proj;
     if(x+rx<0||x-rx>width||y+ry<0||y-ry>height)continue;
     for(let i=0;i<6;i++){
      const theta=-Math.PI/2+i*Math.PI/3,
       px=x+rx*Math.cos(theta),py=y+ry*Math.sin(theta);
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
  function paintOverview(target,view,list,dpr){
   const pad=viewportPolicy.cameraCacheMargin(view.zoom),
    cw=Math.ceil((view.width+2*pad)*dpr),
    ch=Math.ceil((view.height+2*pad)*dpr);
   if(cw*ch>worldRasterLimit||cw>8192||ch>8192||
      typeof document==='undefined')return false;
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
    overviewRaster.height===view.height&&overviewRaster.signature===signature&&
    Math.abs(overviewRaster.panX-view.panX)<pad-8&&
    Math.abs(overviewRaster.panY-view.panY)<pad-8;
   if(usable){
    overviewHits++;
   }else{
    // During cold streaming the exact bitmap contents change for every
    // completed image; avoid building a multi-megapixel overview atlas on
    // each step. Build it once when the visible request queue settles.
    if(loading.size)return false;
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
     signature,pad};
    overviewBuilds++;
   }
   const m=overviewRaster;
   const sx=(m.pad+m.panX-view.panX)*dpr,
    sy=(m.pad+m.panY-view.panY)*dpr;
   target.drawImage(m.canvas,sx,sy,view.width*dpr,view.height*dpr,
    0,0,view.width,view.height);
   return true;
  }
  function draw(){
   if(!active||!pose)return null;
   const now=typeof performance!=='undefined'?performance.now():Date.now();
   profileFrame=profiler?{selectMs:0,worldMs:0,groundMs:0,sceneryMs:0,
    maskMs:0,worldPainterMs:0,cloudMs:0,fogMs:0,statusMs:0}:null;
   const b=canvas.getBoundingClientRect?.()||{width:canvas.width,height:canvas.height};
   const width=Math.max(1,Math.floor(b.width)),height=Math.max(1,Math.floor(b.height));
   const dpr=Math.max(1,Math.min(4,pose.dpr||1));
   const dw=Math.round(width*dpr),dh=Math.round(height*dpr);
   if(canvas.width!==dw||canvas.height!==dh){canvas.width=dw;canvas.height=dh;}
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
   const rasterPad=viewportPolicy?
    viewportPolicy.cameraCacheMargin(view.zoom):0;
   const worldMargin=Math.max(viewportPolicy?.MARGIN_WORLD||0,
    rasterPad?(rasterPad+45)/view.zoom:0);
   const extra=viewportPolicy?.screenBounds(view,{marginWorld:worldMargin})||null;
   for(const key of available){
    const tail=key.slice((sceneKey+'|'+level+'|').length);
    const [ix,iy]=tail.split(',').map(Number);
    if(!Number.isSafeInteger(ix)||!Number.isSafeInteger(iy))continue;
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
    const entry=read(t.key,variant);
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
   for(const t of prefetch)read(t.key,variant);
   if(profileFrame)profileFrame.selectMs=clock()-now;
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
     zoomPreviewFrames++;
     frame++;paintMs=(typeof performance!=='undefined'?
      performance.now():Date.now())-now;
     onStatus(report());
     return report();
    }
   }
   const cloudStart=profileFrame?clock():0;
   if(clouds){
    if(!useLayerCache||!paintCloudBackdrop(ctx,view,dpr)){
     cloudCacheFallbackFrames++;
     if(!authoredFogSet)authoredFogSet=new Set(cells.filter(c=>
      c.visibility==='visible'||c.visibility==='explored')
      .map(c=>c.q+','+c.r));
     clouds.drawBase(ctx,view,authoredFogSet);
    }
   }else{ctx.fillStyle='#bfcbd7';ctx.fillRect(0,0,width,height);}
   if(profileFrame)profileFrame.cloudMs+=clock()-cloudStart;
   const worldCompositeStart=profileFrame?clock():0;
   if(!useLayerCache||!rasterPad||!paintOverview(ctx,view,tiles,dpr)){
    // Cold streaming paints the real terrain; the completed viewport is
    // then cached at full resolution without a blurred snapshot.
    worldCacheFallbackFrames++;
    overviewRaster=null;
    paintWorld(ctx,view,tiles,dpr);
   }
   if(profileFrame)profileFrame.worldMs+=clock()-worldCompositeStart;
   const fogStart=profileFrame?clock():0;
   if(clouds){
    frontierEdges();
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
    clouds.drawUnready(ctx,view,cells,ready,fadeOpacity);
    clouds.drawTransitions(ctx,view,authoredEdges);
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
     worldCacheBuilds:overviewBuilds,worldCacheHits:overviewHits,
     cloudCacheBuilds:cloudBackdropBuilds,cloudCacheHits:cloudBackdropHits
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
   available=new Set(await storage.keys(scene+'|'+level+'|'));
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
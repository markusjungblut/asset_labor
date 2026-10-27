/* Vedras Reiche v0.22.4 – retained, world-aligned tile compositor.
 * Sources provide finished rasters. Camera frames NEVER build terrain,
 * sprites, shadows, rivers or roads. A visibility resolver must be provided
 * by the authoritative game service; the local editor uses visible test cells.
 */
'use strict';
window.VedrasWorldTiles=(()=>{
 const ORDER=['ground','terrain','scenery','structures','units'];
 const clock=()=>typeof performance!=='undefined'?performance.now():Date.now();
 const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
 const finite=Number.isFinite;
 const density={far:.85,mid:1.5,near:2.5};
 function create({canvas,source=null,maxTiles=180,maxPixels=26000000,
   concurrency=1,onReady=()=>{},maxAttempts=5,sourceTimeoutMs=45000,
   requireScenery=false}={}){
  if(!canvas?.getContext)throw Error('WorldTiles requires canvas');
  const g=canvas.getContext('2d',{alpha:true});
  if(!g)throw Error('WorldTiles requires Canvas2D');
  const cache=new Map(),queue=new Map(),running=new Map(),history=new Map();
  const retries=new Map(),retryTimers=new Map();
  const attemptsCap=clamp(Math.floor(maxAttempts)||5,1,10);
  const parallelLimit=clamp(Math.floor(concurrency)||1,1,2);
  const MAX_QUEUE_WAIT_MS=2500;
  let priorityReorders=0,agedPromotions=0,discardedObsolete=0;
  function cancelRetry(k){
   const timer=retryTimers.get(k);
   if(timer!==undefined&&typeof clearTimeout==='function')clearTimeout(timer);
   retryTimers.delete(k);
  }
  function retryFailure(item,reason,error=null){
   const k=item.key,old=retries.get(k),attempts=(old?.attempts||0)+1;
   const terminal=attempts>=attemptsCap;
   const delay=Math.min(8000,400*2**(attempts-1));
   const nextRetryAt=terminal?null:Date.now()+delay;
   retries.set(k,{attempts,terminal,reason,error:error?String(error?.message||error):null,nextRetryAt});
   observe(k,terminal?'retry-exhausted':reason,
    {level:item.level,attempts,reason,error:error?String(error?.message||error):null});
   cancelRetry(k);
   if(terminal)onReady(); // make terminal state visible without retrying
   if(terminal||typeof setTimeout!=='function')return;
   const generation=epoch;
   const timer=setTimeout(()=>{
    retryTimers.delete(k);
    if(generation!==epoch||!wantedTiles.has(k)||
     (cache.has(k)&&!cache.get(k).packet.preview))return;
    const state=retries.get(k);
    if(!state||state.terminal)return;
    state.nextRetryAt=0;
    if(!running.has(k)&&!queue.has(k)){
     queue.set(k,{...item,epoch});
     observe(k,'queued',{level:item.level,attempts:state.attempts,reason:'scheduled-retry'});
     pump();
    }
   },delay);
   retryTimers.set(k,timer);
  }
  function observe(k,status,extra={}){
   const old=history.get(k);history.delete(k);
   history.set(k,{key:k,status,epoch,at:Date.now(),
    attempts:(old?.attempts||0)+(status==='running'?1:0),...extra});
   if(history.size>384)history.delete(history.keys().next().value);
  }
  function diagnostics({limit=100}={}){
   const now=Date.now(),max=clamp(Math.floor(limit)||100,1,250);
   const tiles=visibleTiles.slice(0,max).map(t=>{
    const k=key(t,lod),q=queue.get(k),r=running.get(k),
     c=cache.get(k),old=lookup(t),last=history.get(k),retry=retries.get(k);
    const provisional=!!c?.packet?.preview;
    return {key:k,id:t.id,lod,epoch,
     state:r?(provisional?'upgrading':'running'):
      q?(provisional?'upgrade-queued':'queued'):c?
      (provisional?(retry?.terminal?'preview-upgrade-failed':'preview-needs-upgrade'):
       c.packet.complete?'ready':'cached-partial'):old?'fallback-lod':
      last?.epoch===epoch?last.status:'unrequested',
     startedAt:r?.startedAt??null,revision:c?.revision??null,
     preview:provisional,sourceDensity:c?.packet?.sourceDensity??null,
     requiredDensity:density[lod],fallbackLod:!c&&old?
      old.tileLod??null:null,
     lastOutcome:last?.status??null,lastError:retry?.error??last?.error??null,
     attempts:retry?.attempts??last?.attempts??0,
     queuedMs:q?Math.max(0,now-(q.queuedAt??now)):null,
     retryAt:retry?.nextRetryAt??null,terminal:retry?.terminal??false,
     reason:retry?.reason??null,ageMs:last?Math.max(0,now-last.at):null};
   });
   return {epoch,lod,visible:visibleTiles.length,queued:queue.size,
    running:running.size,parallelLimit,priorityReorders,agedPromotions,
    discardedObsolete,completed,failed,retryWaiting:retryTimers.size,
    retryExhausted:[...retries.values()].filter(v=>v.terminal).length,
    visiblePreviews,upgraded,tiles,
    recent:[...history.values()].slice(-max).reverse()};
  }
  const clouds=window.VedrasCloudArtwork?.create({onReady:()=>{
   onReady();
   // Notify the normal map renderer only when the prepared cloud bank
   // changes. Terrain, scenery and road caches remain untouched.
   if(typeof window.dispatchEvent==='function'&&typeof Event!=='undefined')
    window.dispatchEvent(new Event('vedras:cloud-assets-ready'));
  }})||null;
  function setCloudAssets(entries){return clouds?.setAssets(entries)||
   {baseExpected:0,edgeExpected:0};}
  function setCloudSeed(seed){return clouds?.setSeed(seed)||false;}
  function drawCloudBackground(context,view){
   return clouds?.drawBase(context,view)||0;
  }
  function drawCloudFrontier(context,view,edges){
   return clouds?.drawTransitions(context,view,edges)||0;
  }
  function coverUnready(context,view,cells,ready){
   if(!Array.isArray(cells)||typeof ready!=='function')return 0;
   if(clouds?.stats().bases)
    return clouds.drawUnready(context,view,cells,ready);
   // Conservative fallback while the four PNGs decode: still hide the
   // unfinished hexes rather than briefly revealing incomplete artwork.
   let covered=0;context.save();
   for(const c of cells)if(c.visibility==='visible'&&!ready(c)){
    context.beginPath();
    if(window.VedrasFogAtmosphere)
     window.VedrasFogAtmosphere.hexPath(context,c,view);
    else continue;
    context.fillStyle='#bdced7';context.fill();covered++;
   }
   context.restore();return covered;
  }
  let epoch=0,serial=0,used=0,pixels=0,evicted=0,completed=0,
   previews=0,upgraded=0,visiblePreviews=0,
   failed=0,lastMs=0,lastCoverage=0,lastLod='mid',painted=0,
   fogCells=[],visibleTiles=[],wantedTiles=new Set(),
   lod='mid',lastView=null,frame=0;
  const key=(t,l)=>t.id+'@'+l;
  function release(packet){
   for(const layer of packet?.layers||[])
    if(layer.owned&&typeof layer.image?.close==='function')layer.image.close();
  }
  function invalidate(){
   for(const k of retryTimers.keys())cancelRetry(k);
   retries.clear();
   for(const task of running.values())if(task.timeout!==null&&
    typeof clearTimeout==='function')clearTimeout(task.timeout);
   for(const k of queue.keys())observe(k,'invalidated',{reason:'invalidate'});
   for(const k of running.keys())observe(k,'aborted',{reason:'invalidate'});
   epoch++;for(const task of running.values())task.controller?.abort?.();
   running.clear();queue.clear();
   for(const item of cache.values())release(item.packet);
   cache.clear();pixels=0;visibleTiles=[];fogCells=[];wantedTiles.clear();
  }
  // Per-footprint invalidation retains unrelated tiles and LOD variants.
  // Detached asynchronous packets are rejected by existing job-token fencing.
  let selectiveInvalidations=0,selectiveTiles=0;
  function invalidateTiles(tileIds){
   const ids=new Set(Array.isArray(tileIds)?tileIds:tileIds instanceof Set?
    [...tileIds]:[]);
   for(const id of [...ids])if(typeof id!=='string'||!id)ids.delete(id);
   if(!ids.size)return 0;
   let changed=0;
   for(const level of Object.keys(density))for(const id of ids){
    const k=id+'@'+level,old=cache.get(k);
    if(old){
     cache.delete(k);pixels-=old.pixels;release(old.packet);
     changed++;
    }
    if(queue.delete(k))changed++;
    const job=running.get(k);
    if(job){
     running.delete(k);
     if(job.timeout!==null&&typeof clearTimeout==='function')
      clearTimeout(job.timeout);
     job.controller?.abort?.();changed++;
    }
    cancelRetry(k);retries.delete(k);
    observe(k,'invalidated',{reason:'tile-content-changed',level});
   }
   selectiveInvalidations++;selectiveTiles+=ids.size;
   if(changed){onReady();pump();}
   return changed;
  }
  // A newly finished terrain core can unblock an exhausted source-null tile.
  // Only the named tile is rearmed, never a global retry storm.
  function terrainReady(tileId){
   if(typeof tileId!=='string'||!tileId)return 0;
   let resumed=0;
   for(const level of Object.keys(density)){
    const k=tileId+'@'+level,prior=retries.get(k);
    if(!prior||!wantedTiles.has(k)||
     (cache.has(k)&&!cache.get(k).packet.preview)||running.has(k))continue;
    // A new exact raster cannot fix an unrelated permanent loader exception.
    if(!['source-null','incomplete-source','invalid-packet'].includes(prior.reason))continue;
    const tile=visibleTiles.find(t=>t.id===tileId);
    if(!tile)continue;
    cancelRetry(k);retries.delete(k);
    if(!queue.has(k)){
     queue.set(k,{key:k,tile,level,epoch});
     observe(k,'queued',{reason:'terrain-core-ready',level});
     resumed++;
    }
   }
   if(resumed)pump();
   return resumed;
  }
  function setSource(next){source=next;invalidate();}
  function setFogCells(cells){
   fogCells=window.VedrasFogAtmosphere?
    window.VedrasFogAtmosphere.prepare(cells):
    Array.isArray(cells)?cells.filter(c=>finite(c?.x)&&finite(c?.y)&&
     finite(c?.radius)&&c.radius>0).map(c=>({...c})):[];
  }
  function chooseLod(zoom){
   if(zoom>=1.08)lastLod='near';
   else if(zoom<=.42)lastLod='far';
   else if(lastLod==='near'&&zoom<.94)lastLod='mid';
   else if(lastLod==='far'&&zoom>.49)lastLod='mid';
   return lastLod;
  }
  function trim(protect=new Set()){
   while((cache.size>maxTiles||pixels>maxPixels)&&cache.size){
    let candidate=null;
    for(const [k,item] of cache)
     if(!protect.has(k)&&(!candidate||item.used<candidate[1].used))
      candidate=[k,item];
    if(!candidate)break;
    const [k,item]=candidate;cache.delete(k);pixels-=item.pixels;
    release(item.packet);evicted++;
   }
  }
  function accept(tile,level,packet){
   if(!packet?.layers?.length)return false;
   const normalized=[];
   for(const layer of packet.layers){
    if(!layer?.image?.width||!layer.image.height||
      !ORDER.includes(layer.layer))continue;
    normalized.push({layer:layer.layer,image:layer.image,owned:!!layer.owned,
      pad:finite(layer.pad)?clamp(layer.pad,0,512):0});
   }
   if(!normalized.length)return false;
   const k=key(tile,level),old=cache.get(k);
   // A later snapshot seed must never replace an already sharp live tile.
   if(packet.preview===true&&old&&!old.packet.preview)return false;
   const provisional=packet.preview===true;
   if(provisional)previews++;
   else if(old?.packet.preview)upgraded++;
   if(old){pixels-=old.pixels;release(old.packet);}
   const count=normalized.reduce((n,x)=>n+x.image.width*x.image.height,0);
   cache.set(k,{tile:{...tile},tileLod:level,packet:{layers:normalized,
    complete:packet.complete!==false,preview:provisional,
    sourceDensity:finite(packet.sourceDensity)?packet.sourceDensity:null},
    pixels:count,used:++used,born:old?.packet.preview&&!provisional?
     clock()-240:clock(),revision:packet.revision??null});
   pixels+=count;completed++;trim(new Set(visibleTiles.map(t=>key(t,lod))));
   retries.delete(k);cancelRetry(k);
   observe(k,provisional?'preview-needs-upgrade':'ready',
    {level,sourceDensity:packet.sourceDensity??null,revision:packet.revision??null});
   onReady();return true;
  }
  function seed(tile,level,packet){
   // A repainted editor snapshot may be older/lower density: never replace
   // an already finished sharp tile merely because a canvas was rebuilt.
   if(cache.has(key(tile,level))&&!cache.get(key(tile,level)).packet.preview)
    return false;
   if(requireScenery&&(!packet?.layers?.some(layer=>
      (layer.layer==='ground'||layer.layer==='terrain')&&layer.image?.width>0)||
     !packet.layers.some(layer=>
      (layer.layer==='scenery'||layer.layer==='structures')&&layer.image?.width>0)))return false;
   return accept(tile,level,packet);
  }
  function pump(){
   if(typeof source!=='function')return;
   while(running.size<parallelLimit&&queue.size){
    const item=queue.values().next().value;
    queue.delete(item.key);
    if(item.epoch!==epoch)continue;
    const controller=typeof AbortController!=='undefined'?new AbortController():null;
    const token=++serial,job={controller,epoch:item.epoch,token,
     startedAt:Date.now(),timeout:null};
    running.set(item.key,job);
    observe(item.key,'running',{level:item.level});
    // A nonsettling source must never monopolize the single render slot.
    if(sourceTimeoutMs>0&&typeof setTimeout==='function')
     job.timeout=setTimeout(()=>{
      if(item.epoch!==epoch||running.get(item.key)?.token!==token)return;
      controller?.abort?.();
      running.delete(item.key);
      failed++;
      retryFailure(item,'source-timeout',new Error('Tile source exceeded '+sourceTimeoutMs+' ms'));
      pump();
     },sourceTimeoutMs);
    // Keep original asynchronous initiation and release late/stale packets.
    Promise.resolve().then(()=>source(item.tile,item.level,{signal:controller?.signal,
     density:density[item.level]})).then(packet=>{
      if(item.epoch!==epoch||running.get(item.key)?.token!==token||
        controller?.signal?.aborted||!wantedTiles.has(item.key)){
       release(packet);return;
      }
      const layers=packet?.layers||[];
      const hasGround=layers.some(layer=>(layer.layer==='ground'||layer.layer==='terrain')&&
       layer.image?.width>0&&layer.image?.height>0);
      const hasScenery=layers.some(layer=>(layer.layer==='scenery'||layer.layer==='structures')&&
       layer.image?.width>0&&layer.image?.height>0);
      const complete=packet?.complete!==false&&
       (!requireScenery||(hasGround&&hasScenery));
      if(packet&&complete&&accept(item.tile,item.level,packet))return;
      release(packet);
      retryFailure(item,packet&&!complete?'incomplete-source':
       packet?'invalid-packet':'source-null');
    }).catch(err=>{
      if(item.epoch!==epoch||running.get(item.key)?.token!==token||
       controller?.signal?.aborted||err?.name==='AbortError')return;
      failed++;
      retryFailure(item,'failed',err);
      if(typeof console!=='undefined')console.warn('World tile:',err);
    }).finally(()=>{
      if(job.timeout!==null&&typeof clearTimeout==='function')
       clearTimeout(job.timeout);
      const active=running.get(item.key);
      if(active?.token===token)running.delete(item.key);
      pump();
    });
   }
  }
  function request(view,tiles){
   lastView=view;lod=chooseLod(view.zoom);
   // Only user-authorized tile descriptors should be passed in.
   // The server must not ship hidden terrain or units at any zoom.
   visibleTiles=Array.isArray(tiles)?tiles.filter(t=>typeof t?.id==='string'&&
    finite(t.x)&&finite(t.y)&&t.size>0&&t.visibility!=='unknown'):[];
   const wanted=new Set(visibleTiles.map(t=>key(t,lod)));
   wantedTiles=wanted;
   for(const k of [...retries.keys()])if(!wanted.has(k)){
    cancelRetry(k);retries.delete(k);
   }
   // Preserve waiting ages for still-visible work while refreshing the
   // ordering from the CURRENT viewport rather than stale Map insertion order.
   const prior=new Map(queue),now=Date.now();
   for(const k of prior.keys())if(!wanted.has(k)){
    observe(k,'discarded',{reason:'outside-viewport'});discardedObsolete++;
   }
   queue.clear();
   for(const [k,task] of running)if(!wanted.has(k)){
    observe(k,'aborted',{reason:'outside-viewport'});discardedObsolete++;
    task.controller?.abort?.();
    if(task.timeout!==null&&typeof clearTimeout==='function')clearTimeout(task.timeout);
    running.delete(k);
   }
   const midX=(-view.panX)/view.zoom,midY=(-view.panY)/(view.zoom*(view.projectY||1));
   const distance=t=>(t.x+t.size/2-midX)**2+(t.y+t.size/2-midY)**2;
   // Missing core > fallback LOD > preview upgrade. An existing request
   // waiting longer than 2.5s is protected against camera-center churn.
   const rank=t=>{
    const existing=cache.get(key(t,lod));
    if(existing?.packet.preview)return 2;
    return Object.keys(density).some(l=>l!==lod&&cache.has(key(t,l)))?1:0;
   };
   const age=t=>Math.max(0,now-(prior.get(key(t,lod))?.queuedAt??now));
   const sorted=[...visibleTiles].sort((x,y)=>{
    const ax=age(x)>=MAX_QUEUE_WAIT_MS,ay=age(y)>=MAX_QUEUE_WAIT_MS;
    if(ax!==ay)return ax?-1:1;
    if(ax&&ay)return (prior.get(key(x,lod))?.queuedAt??now)-
     (prior.get(key(y,lod))?.queuedAt??now);
    return rank(x)-rank(y)||distance(x)-distance(y);
   });
   for(const t of sorted){
    const k=key(t,lod),existing=cache.get(k);
    if((existing&&!existing.packet.preview)||running.has(k))continue;
    const retry=retries.get(k);
    if(retry&&(retry.terminal||(retry.nextRetryAt&&retry.nextRetryAt>now)))continue;
    queue.set(k,{key:k,tile:t,level:lod,epoch,
     queuedAt:prior.get(k)?.queuedAt??now});
    if(!prior.has(k))observe(k,existing?.packet.preview?'upgrade-queued':'queued',{level:lod});
   }
   const before=[...prior.keys()].filter(k=>queue.has(k));
   const after=[...queue.keys()].filter(k=>prior.has(k));
   if(before.some((k,i)=>k!==after[i]))priorityReorders++;
   const first=queue.values().next().value;
   if(first&&age(first.tile)>=MAX_QUEUE_WAIT_MS&&
      [...queue.values()].some(item=>distance(item.tile)<distance(first.tile)))
    agedPromotions++;
   // Reserve loaded viewport tiles across zoom variants.
   const protect=new Set();
   for(const t of visibleTiles)
    for(const level of Object.keys(density))if(cache.has(key(t,level)))
     protect.add(key(t,level));
   trim(protect);pump();
   return {lod,requested:visibleTiles.length,pending:queue.size+running.size};
  }
  function lookup(t){
   const direct=cache.get(key(t,lod));
   if(direct)return direct;
   for(const alternate of ['near','mid','far'])
    if(alternate!==lod&&cache.has(key(t,alternate)))
     return cache.get(key(t,alternate));
   return null;
  }
  function drawImage(image,x,y,w,h,view,source=null){
   const x0=clamp(x,0,view.width),x1=clamp(x+w,0,view.width),
    y0=clamp(y,0,view.height),y1=clamp(y+h,0,view.height);
   if(x1<=x0||y1<=y0)return 0;
   const src=source||{x:0,y:0,w:image.width,h:image.height};
   g.drawImage(image,src.x+(x0-x)/w*src.w,src.y+(y0-y)/h*src.h,
    (x1-x0)/w*src.w,(y1-y0)/h*src.h,x0,y0,x1-x0,y1-y0);
   return (x1-x0)*(y1-y0);
  }
  function cloudRect(x,y,w,h){
   if(w<=0||h<=0)return;
   g.globalAlpha=1;g.fillStyle='#c2cdd1';g.fillRect(x,y,w,h);
  }
  function fogHex(c,view,readyByHex){
   const ready=typeof readyByHex==='function'&&readyByHex(c);
   if(window.VedrasFogAtmosphere)
    return window.VedrasFogAtmosphere.draw(g,c,view,{ready});
   const x=view.width/2+view.panX+c.x*view.zoom,
    y=view.height/2+view.panY+c.y*view.zoom*(view.projectY||1),
    rx=c.radius*view.zoom,ry=rx*(view.projectY||1);
   if(c.visibility==='visible'&&ready)return;
   g.save();g.beginPath();
   for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3;
    if(!i)g.moveTo(x+rx*Math.cos(a),y+ry*Math.sin(a));
    else g.lineTo(x+rx*Math.cos(a),y+ry*Math.sin(a));
   }
   g.closePath();g.clip();
   if(c.visibility==='explored'){
    g.fillStyle='rgba(59,66,70,.66)';g.fillRect(x-rx,y-ry,2*rx,2*ry);
   }else cloudRect(x-rx,y-ry,2*rx,2*ry);
   g.restore();
  }
  function render(view,{tiles=visibleTiles,drawDynamic=null,fog=fogCells}={}){
   if(!view||!(view.width>0)||!(view.height>0)||!(view.zoom>0)||
    !(view.dpr>0)||!finite(view.panX)||!finite(view.panY))return false;
   const start=clock(),cw=Math.max(1,Math.round(view.width*view.dpr)),
    ch=Math.max(1,Math.round(view.height*view.dpr));
   if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
   g.setTransform(view.dpr,0,0,view.dpr,0,0);g.globalAlpha=1;
   g.clearRect(0,0,view.width,view.height);
   // The cloud base conceals unrequested/unloaded map edges too.
   if(clouds)clouds.drawBase(g,view);
   else cloudRect(0,0,view.width,view.height);
   // Draw terrain only inside known world HEX geometry, never a rectangular
   // green tile core outside the map. Unrepresented space stays cloudy.
   const proj=view.projectY||1,items=[];
   visiblePreviews=0;
   const hasMask=Array.isArray(fog)&&fog.length>0&&typeof g.clip==='function';
   const atmosphere=window.VedrasFogAtmosphere;
   const drawKnownPath=(halo)=>{
    if(!hasMask)return;
    g.beginPath();let drawn=0;
    for(const c of fog){
     if(c.visibility!=='visible'&&c.visibility!=='explored')continue;
     const x=view.width/2+view.panX+c.x*view.zoom,
      y=view.height/2+view.panY+c.y*view.zoom*proj,
      reach=(c.radius+halo)*view.zoom;
     if(x+reach<0||x-reach>view.width||
      y+reach*proj<0||y-reach*proj>view.height)continue;
     if(atmosphere)atmosphere.hexPath(g,c,view,halo);
     else {
      for(let i=0;i<6;i++){
       const a=-Math.PI/2+i*Math.PI/3,
        px=x+Math.cos(a)*reach,py=y+Math.sin(a)*reach*proj;
       if(!i)g.moveTo(px,py);else g.lineTo(px,py);
      }
      g.closePath();
     }
     drawn++;
    }
    // Empty path intentionally clips all world imagery: empty authorization
    // must NEVER leak rectangular tile pixels into the cloud background.
    g.clip();return drawn;
   };
   for(const t of tiles){
    if(t.visibility==='unknown')continue;
    const item=lookup(t);if(!item)continue;
    // Shared rounded DEVICE-space core edges eliminate bright seams when
    // two adjacent tiles are composited at a fractional zoom or DPR.
    const snap=x=>Math.round(x*view.dpr)/view.dpr;
    const dx=snap(view.width/2+view.panX+t.x*view.zoom),
     dy=snap(view.height/2+view.panY+t.y*view.zoom*proj),
     dw=snap(view.width/2+view.panX+(t.x+t.size)*view.zoom)-dx,
     dh=snap(view.height/2+view.panY+(t.y+t.size)*view.zoom*proj)-dy;
    if(dx>=view.width||dy>=view.height||dx+dw<=0||dy+dh<=0)continue;
    item.used=++used;items.push({t,item,dx,dy,dw,dh});
    if(item.packet.preview||item.tileLod!==lod)visiblePreviews++;
   }
   g.imageSmoothingEnabled=true;g.imageSmoothingQuality='medium';
   let covered=0,draws=0,fading=false;
   function layerPass(layers,halo){
    g.save();drawKnownPath(halo);
    for(const layer of layers)for(const obj of items)
     for(const asset of obj.item.packet.layers)if(asset.layer===layer){
      const opacity=clamp((clock()-obj.item.born)/240,0,1);
      g.globalAlpha=opacity;
      // Scenery rasters may include an overscanned sprite halo. The pad is
      // metadata on the layer; core terrain remains exactly tile-aligned.
      const pad=finite(asset.pad)?clamp(asset.pad,0,512):0;
      const core=layer==='ground'||layer==='terrain';
      // Capture extra neighboring SOURCE pixels, but render only the
      // exclusive snapped 512-world-unit terrain core.
      const ratio=pad?pad/(obj.t.size+pad*2):0;
      const source=core&&pad?{x:asset.image.width*ratio,
       y:asset.image.height*ratio,w:asset.image.width*(1-2*ratio),
       h:asset.image.height*(1-2*ratio)}:null;
      const area=core?
       drawImage(asset.image,obj.dx,obj.dy,obj.dw,obj.dh,view,source):
       drawImage(asset.image,obj.dx-pad*view.zoom,
        obj.dy-pad*view.zoom*proj,obj.dw+pad*2*view.zoom,
        obj.dh+pad*2*view.zoom*proj,view);
      if(area){draws++;if(layer==='ground'||layer==='terrain')
       covered+=area*opacity;if(opacity<1)fading=true;}
     }
    g.globalAlpha=1;
    g.restore();
   }
   // Exact footprint for soil, grass, coastline and roads. The previous
   // 45-unit halo across ground tiles produced the bright green map outline.
   layerPass(['ground','terrain'],0);
   // Only overhanging trees, mountains, structures and moving sprites extend
   // into the clouds, where the atmospheric frontier feathers them away.
   layerPass(['scenery','structures'],45);
   // Dynamic units belong to the same authorized halo but not the terrain.
   if(typeof drawDynamic==='function'){
    g.save();drawKnownPath(45);
    try{drawDynamic(g,view);}finally{g.restore();}
   }
   if(Array.isArray(fog)){
    for(const c of fog)if(c.visibility==='explored')fogHex(c,view);
    // The cloud is ONLY removed once every image tile touching a visible
    // hex contains BOTH finished terrain and finished scenery. Testing only
    // the center tile leaked unfinished quarters of a hex during streaming.
    const byCore=new Map(items.map(o=>[o.t.id,o.item]));
    const ready=c=>{
     const R=c.radius,halfWidth=R*Math.sqrt(3)/2-0.01;
     const xmin=Math.floor((c.x-halfWidth)/512),
      xmax=Math.floor((c.x+halfWidth)/512),
      ymin=Math.floor((c.y-R+0.01)/512),
      ymax=Math.floor((c.y+R-0.01)/512);
     for(let tx=xmin;tx<=xmax;tx++)for(let ty=ymin;ty<=ymax;ty++){
      const item=byCore.get(tx+','+ty);
      if(!item||item.packet.complete===false)return false;
      const layers=item.packet.layers;
      if(!layers.some(v=>v.layer==='ground'||v.layer==='terrain')||
       !layers.some(v=>v.layer==='scenery'||v.layer==='structures'))return false;
     }
     return true;
    };
    if(clouds?.stats().bases){
     // Foreground ONLY AFTER terrain, scenery and dynamic units. These
     // SAME four cloud textures mask any sprite parts in hidden terrain.
     clouds.drawUnready(g,view,fog,ready);
     clouds.drawTransitions(g,view,fog.frontierEdges);
    }else{
     // Conceal unloaded and undiscovered data even before image decode.
     for(const c of fog)if(c.visibility!=='explored')fogHex(c,view,ready);
    }
   }
   painted=draws;frame++;lastMs=clock()-start;
   lastCoverage=clamp(covered/(view.width*view.height),0,1);
   if(fading)onReady(); // continue the cloud-dissolve transition via rAF
   return {renderMs:lastMs,coverage:lastCoverage,drawn:draws,lod,
    loaded:items.length,pending:queue.size+running.size};
  }
  function stats(){return {version:'0.22.3',clouds:clouds?.stats()||null,
    fogFrontier:fogCells.filter(c=>c.frontier).length,tiles:cache.size,pixels,bytes:pixels*4,
   budgetBytes:maxPixels*4,evicted,completed,failed,pending:queue.size+running.size,
   inFlight:running.size,visible:visibleTiles.length,lod,
   selectiveInvalidations,selectiveTiles,
   priorityReorders,agedPromotions,discardedObsolete,parallelLimit,
   visiblePreviews,previews,upgraded,
   retryWaiting:retryTimers.size,retryExhausted:[...retries.values()].filter(v=>v.terminal).length,
   renderMs:lastMs,coverage:lastCoverage,drawn:painted,frames:frame};}
  return {request,render,seed,setSource,setFogCells,setCloudAssets,
    setCloudSeed,drawCloudBackground,drawCloudFrontier,
    coverUnready,chooseLod,invalidate,invalidateTiles,stats,diagnostics,terrainReady};
 }
 return {create};
})();

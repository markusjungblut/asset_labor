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
 // Shared scene-wide raster-density contract, unchanged from v0.22.
 const density=window.VedrasAdaptiveLOD?.worldDensity||
  {far:.85,mid:1.5,near:2.5};
 function create({canvas,source=null,maxTiles=180,maxPixels=26000000,
   concurrency=1,onReady=()=>{},maxAttempts=5,sourceTimeoutMs=45000,
    sourceRevision=null,canStartSource=null,
   requireScenery=false,lodSelector=null}={}){
  if(!canvas?.getContext)throw Error('WorldTiles requires canvas');
  const g=canvas.getContext('2d',{alpha:true});
  if(!g)throw Error('WorldTiles requires Canvas2D');
  const cache=new Map(),queue=new Map(),running=new Map(),history=new Map();
  const retries=new Map(),retryTimers=new Map();
  // Diagnostic deduplication; blocked sources are reconsidered per request.
  const blockedSourceTrace=new Set();
  const attemptsCap=clamp(Math.floor(maxAttempts)||5,1,10);
  const parallelLimit=clamp(Math.floor(concurrency)||1,1,2);
  // Editor supplies its terrain controller. Standalone usage creates a
  // separate instance of the SAME hysteresis policy.
  const internalLod=window.VedrasAdaptiveLOD?.create?.()||null;
  let legacyLodInitialized=false;
  const MAX_QUEUE_WAIT_MS=2500;
  let priorityReorders=0,agedPromotions=0,discardedObsolete=0,
   lastAgedPriority=null;
  function cancelRetry(k){
   const timer=retryTimers.get(k);
   if(timer!==undefined&&typeof clearTimeout==='function')clearTimeout(timer);
   retryTimers.delete(k);
  }
  function retryFailure(item,reason,error=null,attemptRevision=null){
   const k=item.key,old=retries.get(k),attempts=(old?.attempts||0)+1;
   const terminal=attempts>=attemptsCap;
   const delay=Math.min(8000,400*2**(attempts-1));
   const nextRetryAt=terminal?null:Date.now()+delay;
   retries.set(k,{attempts,terminal,reason,error:error?String(error?.message||error):null,
    attemptRevision,nextRetryAt});
   observe(k,terminal?'retry-exhausted':reason,
    {level:item.level,attempts,reason,error:error?String(error?.message||error):null});
   cancelRetry(k);
   if(terminal)onReady(); // make terminal state visible without retrying
   if(terminal||typeof setTimeout!=='function')return;
   const generation=epoch;
   const timer=setTimeout(()=>{
    retryTimers.delete(k);
    if(generation!==epoch||!wantedTiles.has(k)||
     (cache.has(k)&&!cache.get(k).packet.preview&&!cache.get(k).dirty))return;
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
  const trace=(type,details)=>{
   if(window.VedrasStep15Trace?.enabled())
    window.VedrasStep15Trace.record(type,details);
  };
  function observe(k,status,extra={}){
   trace('tile.state',{key:k,status,epoch,lod,reason:extra.reason||null,
     sourceDensity:extra.sourceDensity??null,revision:extra.revision??null});
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
    const provisional=!!c?.packet?.preview,stale=!!c?.dirty;
    return {key:k,id:t.id,lod,epoch,
     state:r?(provisional?'upgrading':'running'):
      q?(stale?'stale-refresh-queued':provisional?'upgrade-queued':'queued'):c?
      (stale?(retry?.terminal?'stale-refresh-failed':'stale-needs-refresh'):
       provisional?(retry?.terminal?'preview-upgrade-failed':'preview-needs-upgrade'):
       c.packet.complete?'ready':'cached-partial'):old?'fallback-lod':
      last?.epoch===epoch?last.status:'unrequested',
     startedAt:r?.startedAt??null,revision:c?.revision??null,
     preview:provisional,stale,staleReason:c?.dirtyReason??null,
     staleAgeMs:stale?Math.max(0,now-(c?.dirtyAt??now)):null,
     sourceDensity:c?.packet?.sourceDensity??null,
     requiredDensity:density[lod],
     displayedLod:old?.tileLod??null,
     displayedPreview:old?.packet?.preview??null,
     displayedDensity:old?(old.packet.preview?
      old.packet.sourceDensity??0:density[old.tileLod]):null,
     fallbackLod:old?.tileLod!==lod?old?.tileLod??null:null,
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
   // A conservative opaque mask is necessary even when FogAtmosphere
   // and the authored cloud images are both unavailable.
   let covered=0;context.save();context.globalAlpha=1;
   for(const c of cells)if(c.visibility==='visible'&&!ready(c)){
    context.beginPath();
    if(window.VedrasFogAtmosphere?.hexPath)
     window.VedrasFogAtmosphere.hexPath(context,c,view);
    else{
     const proj=view.projectY||1,
      x=view.width/2+view.panX+c.x*view.zoom,
      y=view.height/2+view.panY+c.y*view.zoom*proj,
      rx=c.radius*view.zoom,ry=rx*proj;
     for(let i=0;i<6;i++){
      const theta=-Math.PI/2+i*Math.PI/3,
       px=x+Math.cos(theta)*rx,py=y+Math.sin(theta)*ry;
      if(!i)context.moveTo(px,py);else context.lineTo(px,py);
     }
     context.closePath();
    }
    context.fillStyle='#bdced7';context.fill();covered++;
   }
   context.restore();return covered;
  }
  let epoch=0,serial=0,used=0,pixels=0,evicted=0,completed=0,
   previews=0,upgraded=0,visiblePreviews=0,
   failed=0,lastMs=0,lastCoverage=0,lastLod='mid',painted=0,
   fogCells=[],fogConfigured=false,visibleTiles=[],wantedTiles=new Set(),
   lod='mid',lastView=null,frame=0,
   lastProgress={exact:0,fallback:0,provisional:0,stale:0,missing:0};
  const key=(t,l)=>t.id+'@'+l;
  function release(packet){
   for(const layer of packet?.layers||[])
    if(layer.owned&&typeof layer.image?.close==='function')layer.image.close();
  }
  function invalidate(reason='unknown'){
   trace('tile.invalidate',{scope:'all',reason,epoch,cacheCount:cache.size,
    pending:queue.size+running.size,lod});
   lastAgedPriority=null;
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
   deferredRevisionTrace.clear();blockedSourceTrace.clear();
  }
  // Diagnostic-only deduplication of transient pending source changes:
  // one event per tile/revision rather than one event per camera frame.
  const deferredRevisionTrace=new Map();
  // A refreshed terrain core may replace only its own World-Tile packets.
  // The editor supplies the *prepared* authoritative terrain revision per
  // visible tile. A changed background snapshot or camera pose is not itself
  // an invalidation of every cached world tile.
  function reconcileGroundRevisions(versions){
   if(!versions||typeof versions.get!=='function')return 0;
   const stale=new Set(),diagnose=window.VedrasStep15Trace?.enabled()===true;
   const fields=['terrain','shore','road','river'];
   const parts=revision=>{
    try{const parsed=JSON.parse(revision);
     return Array.isArray(parsed)?parsed.map(String):[String(revision)];
    }catch{return [String(revision)];}
   };
   for(const [k,item] of cache){
    // A retained image-revision packet is intentionally awaiting replacement.
    // Do not hard-evict it again when the prepared ground version advances.
    if(item.dirty)continue;
    // Preserve LOD variants: only compare the current level.
    if(item.tileLod!==lod||!versions.has(item.tile.id))continue;
    const expected=versions.get(item.tile.id);
    if(expected==null||item.revision==null)continue;
    if(item.revision!==expected){
     const old=parts(item.revision),next=parts(expected);
     const changed=fields.filter((field,i)=>old[i]!==next[i]);
     // A previously completed road/river raster does NOT become stale just
     // because the corresponding chunk temporarily leaves readyTiles()
     // during camera streaming. An actual new prepared revision must be
     // compared against the retained completed packet. Explicit edits still
     // invalidate their affected tiles via invalidateTiles()/invalidate().
     const temporaryMissing=old.length===4&&next.length===4&&
      old[0]===next[0]&&old[1]===next[1]&&
      changed.length>0&&changed.every(field=>{
       const i=fields.indexOf(field);
       return i>=2&&old[i]!=='pending'&&old[i]!=='off'&&
        next[i]==='pending';
      });
     if(temporaryMissing){
      if(diagnose&&deferredRevisionTrace.get(k)!==expected){
       if(deferredRevisionTrace.size>=384)deferredRevisionTrace.clear();blockedSourceTrace.clear();
       deferredRevisionTrace.set(k,expected);
       trace('tile.ground-revision-deferred',{
        id:item.tile.id,level:item.tileLod,changed:changed.join(','),
        reason:'previously-ready-road-or-river-temporarily-unavailable'});
      }
      continue;
     }
     deferredRevisionTrace.delete(k);
     stale.add(item.tile.id);
     if(diagnose){
      trace('tile.ground-revision-detail',{id:item.tile.id,level:item.tileLod,
       changed:changed.join(','),fromTerrain:old[0]??null,toTerrain:next[0]??null,
       fromShore:old[1]??null,toShore:next[1]??null,
       fromRoad:old[2]??null,toRoad:next[2]??null,
       fromRiver:old[3]??null,toRiver:next[3]??null});
     }
    }
   }
   if(!stale.size)return 0;
   trace('tile.ground-revision-changed',{count:stale.size,epoch,lod});
   return invalidateTiles(stale,'terrain-core-revision-changed',[lod]);
  }
  // Per-footprint invalidation retains unrelated tiles and LOD variants.
  // Detached asynchronous packets are rejected by existing job-token fencing.
  let selectiveInvalidations=0,selectiveTiles=0;
  function invalidateTiles(tileIds,reason='scene-change',levels=Object.keys(density)){
   // IDs may originate from another JS realm (Node vm, embedded editor).
   // A foreign Set fails instanceof Set; accept iterable collections while
   // rejecting scalar/string inputs. Individual IDs remain strictly checked.
   const iterable=tileIds!=null&&typeof tileIds!=='string'&&
    typeof tileIds[Symbol.iterator]==='function';
   const ids=new Set(iterable?tileIds:[]);
   for(const id of [...ids])if(typeof id!=='string'||!id)ids.delete(id);
   if(!ids.size)return 0;
   // Only visual image-revision updates may retain an already complete
   // packet. Authored editor changes still evict immediately.
   const retainPrevious=reason==='image-ready-ground-selective'||
    reason==='terrain-core-revision-changed';
   const visibleIds=new Set(visibleTiles.map(t=>t.id));
   trace('tile.invalidate',{scope:'selective',reason,epoch,tiles:ids.size,lod,
    retained:retainPrevious});
   let changed=0;
   for(const level of levels)for(const id of ids){
    const k=id+'@'+level,old=cache.get(k);
    deferredRevisionTrace.delete(k);blockedSourceTrace.delete(k);
    if(old){
     // Keep only currently visible completed pixels as a temporary fallback.
     // The dirty flag makes them ineligible for a fresh source cache hit,
     // readiness diagnostics and exact-frame accounting until replaced.
     if(retainPrevious&&visibleIds.has(id)&&drawable(old)&&!old.packet.preview){
      old.dirty=true;old.dirtyReason=reason;
      old.dirtyAt=old.dirtyAt??Date.now();
      trace('tile.stale-retained',{key:k,id,level,reason,epoch});
     }else{
      cache.delete(k);pixels-=old.pixels;release(old.packet);
     }
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
  function terrainReady(tileId,revision=null){
   if(typeof tileId!=='string'||!tileId)return 0;
   let resumed=0;
   for(const level of Object.keys(density)){
    const k=tileId+'@'+level,prior=retries.get(k);
    if(!prior||!wantedTiles.has(k)||
     (cache.has(k)&&!cache.get(k).packet.preview&&!cache.get(k).dirty)||running.has(k))continue;
    // A new exact raster cannot fix an unrelated permanent loader exception.
    if(!['source-null','incomplete-source','invalid-packet'].includes(prior.reason))continue;
    // Only a genuinely newer source can re-arm a failed bake. Repeated
    // readiness signals for one unchanged revision must not retry forever.
    if(revision==null||revision===prior.attemptRevision)continue;
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
   fogConfigured=true; // [] means no authorized cells, NOT no mask.
   fogCells=window.VedrasFogAtmosphere?
    window.VedrasFogAtmosphere.prepare(cells):
    Array.isArray(cells)?cells.filter(c=>finite(c?.x)&&finite(c?.y)&&
     finite(c?.radius)&&c.radius>0).map(c=>({...c})):[];
  }
  function chooseLod(zoom){
   const selected=typeof lodSelector==='function'?lodSelector(zoom):
    internalLod?.update(zoom)?.id;
   if(selected==='near'||selected==='full')lastLod='near';
   else if(selected==='mid'||selected==='far')lastLod=selected;
   else{
    // Legacy standalone hosts without adaptive-lod.js. Match the shared
    // initial selection as well as its hysteretic transition thresholds.
    if(!legacyLodInitialized){
     lastLod=zoom<.51?'far':zoom<.99?'mid':'near';
     legacyLodInitialized=true;return lastLod;
    }
    if(lastLod==='far'){
     if(zoom>=1.06)lastLod='near';
     else if(zoom>=.55)lastLod='mid';
    }else if(lastLod==='mid'){
     if(zoom<=.47)lastLod='far';
     else if(zoom>=1.06)lastLod='near';
    }else if(lastLod==='near'){
     if(zoom<=.47)lastLod='far';
     else if(zoom<=.92)lastLod='mid';
    }
   }
   return lastLod;
  }
  // Explicit audit-only reservation of the full motion envelope. The
  // ordinary renderer never reserves anything. Reservation does NOT raise
  // maxPixels or maxTiles; budget overflow remains a failed warm test.
  let warmReserved=new Set();
  function reserveWarmTiles(keys=null){
   if(keys===null){warmReserved.clear();return {active:false,keys:0};}
   const iterable=Array.isArray(keys)||keys instanceof Set;
   if(!iterable||keys.length>80||keys.size>80)
    throw Error('Invalid bounded World-Tile warm reservation');
   const collected=new Set(keys);
   if(collected.size>80||[...collected].some(k=>
    typeof k!=='string'||!/^[-]?\d+,[-]?\d+@(far|mid|near)$/.test(k)))
    throw Error('Invalid bounded World-Tile reservation key');
   warmReserved=collected;
   trim(visibleSourceKeys());
   return {active:true,keys:warmReserved.size};
  }
  function warmTileStatus(){
   let ready=0,stale=0,preview=0,missing=0;
   const incomplete=[];
   for(const k of warmReserved){
    const item=cache.get(k);
    if(!item||!drawable(item)){missing++;incomplete.push(k);continue;}
    if(item.dirty){stale++;incomplete.push(k);}
    else if(item.packet.preview){preview++;incomplete.push(k);}
    else ready++;
   }
   return {active:warmReserved.size>0,keys:warmReserved.size,
    ready,missing,stale,preview,firstIncomplete:incomplete.slice(0,20),
    cached:cache.size,pixels,budgetPixels:maxPixels,
    overBudgetPixels:Math.max(0,pixels-maxPixels),
    overTileLimit:Math.max(0,cache.size-maxTiles)};
  }
  function trim(protect=new Set()){
   while((cache.size>maxTiles||pixels>maxPixels)&&cache.size){
    let candidate=null;
    for(const [k,item] of cache)
     if(!protect.has(k)&&!warmReserved.has(k)&&
       (!candidate||item.used<candidate[1].used))
      candidate=[k,item];
    if(!candidate)break;
    const [k,item]=candidate;cache.delete(k);pixels-=item.pixels;
    release(item.packet);evicted++;
    trace('tile.evict',{key:k,reason:'lru-budget',epoch,lod,
     pixels:item.pixels,cacheCount:cache.size});
   }
  }
  function accept(tile,level,packet){
   if(!packet?.layers?.length||packet.complete===false)return false;
   const normalized=[];
   for(const layer of packet.layers){
    if(!layer?.image?.width||!layer.image.height||
      !ORDER.includes(layer.layer))continue;
    normalized.push({layer:layer.layer,image:layer.image,owned:!!layer.owned,
      pad:finite(layer.pad)?clamp(layer.pad,0,512):0});
   }
   // An unpainted shoreline, an absent terrain core, or an incomplete
   // scenery layer may NEVER be stored as a visually ready preview.
   if(!normalized.some(x=>x.layer==='ground'||x.layer==='terrain')||
     (requireScenery&&!normalized.some(x=>
      x.layer==='scenery'||x.layer==='structures')))return false;
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
     clock()-240:clock(),revision:packet.revision??null,
    dirty:false,dirtyReason:null,dirtyAt:null});
   pixels+=count;completed++;
   trace('tile.accept',{key:k,id:tile.id,level,revision:packet.revision??null,
     preview:provisional,pixels:count,epoch});
   trim(visibleSourceKeys());
   retries.delete(k);cancelRetry(k);
   observe(k,provisional?'preview-needs-upgrade':'ready',
    {level,sourceDensity:packet.sourceDensity??null,revision:packet.revision??null});
   onReady();return true;
  }
  // Avoid allocating and resampling a complete world tile again merely
  // because the editor's viewport-sized staging canvas was repainted.
  function needsSeed(tile,level,sourceDensity=null){
   const prior=cache.get(key(tile,level));
   if(!prior)return true;
   if(!prior.packet.preview)return false;
   return Number.isFinite(sourceDensity)&&
    sourceDensity>(prior.packet.sourceDensity??0)+.01;
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
    // Terrain workers can replace a queued source while another tile bakes.
    // Avoid a known-null bake and retain fog until a later request retries.
    if(typeof canStartSource==='function'&&
       canStartSource(item.tile,item.level)===false){
     if(!blockedSourceTrace.has(item.key)){
      blockedSourceTrace.add(item.key);
      trace('tile.source-deferred',{key:item.key,id:item.tile.id,
       level:item.level,epoch,reason:'source-became-unprepared-in-queue'});
     }
     continue;
    }
    blockedSourceTrace.delete(item.key);
    const controller=typeof AbortController!=='undefined'?new AbortController():null;
    const token=++serial,job={controller,epoch:item.epoch,token,
     sourceVersion:typeof sourceRevision==='function'?
      sourceRevision(item.tile,item.level):null,
     startedAt:Date.now(),timeout:null};
    running.set(item.key,job);
    trace('tile.source-start',{key:item.key,id:item.tile.id,
     x:item.tile.x,y:item.tile.y,size:item.tile.size,level:item.level,
     epoch:item.epoch,attempt:retries.get(item.key)?.attempts??0});
    observe(item.key,'running',{level:item.level});
    // A nonsettling source must never monopolize the single render slot.
    if(sourceTimeoutMs>0&&typeof setTimeout==='function')
     job.timeout=setTimeout(()=>{
      if(item.epoch!==epoch||running.get(item.key)?.token!==token)return;
      controller?.abort?.();
      running.delete(item.key);
      failed++;
      retryFailure(item,'source-timeout',new Error('Tile source exceeded '+sourceTimeoutMs+' ms'),job.sourceVersion);
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
       packet?'invalid-packet':'source-null',null,job.sourceVersion);
    }).catch(err=>{
      if(item.epoch!==epoch||running.get(item.key)?.token!==token||
       controller?.signal?.aborted||err?.name==='AbortError')return;
      failed++;
      retryFailure(item,'failed',err,job.sourceVersion);
      if(typeof console!=='undefined')console.warn('World tile:',err);
    }).finally(()=>{
      trace('tile.source-end',{key:item.key,id:item.tile.id,level:item.level,
       epoch:item.epoch,wallMs:Date.now()-job.startedAt,
       stale:item.epoch!==epoch,ready:!!cache.get(item.key)&&
        !cache.get(item.key).packet.preview});
      if(job.timeout!==null&&typeof clearTimeout==='function')
       clearTimeout(job.timeout);
      const active=running.get(item.key);
      if(active?.token===token){
       running.delete(item.key);
       if(typeof sourceRevision==='function')
        terrainReady(item.tile.id,sourceRevision(item.tile,item.level));
      }
      pump();
    });
   }
  }
  function request(view,tiles){
   const previousLod=lod;
   lastView=view;lod=chooseLod(view.zoom);
   if(previousLod!==lod)trace('tile.lod',{from:previousLod,to:lod,zoom:view.zoom,
    reason:'zoom-threshold',epoch});
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
   for(const k of blockedSourceTrace)if(!wanted.has(k))
    blockedSourceTrace.delete(k);
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
    if((existing&&!existing.packet.preview&&!existing.dirty)||running.has(k))continue;
    const retry=retries.get(k);
    if(retry&&(retry.terminal||(retry.nextRetryAt&&retry.nextRetryAt>now)))continue;
    // Keep an unprepared source cloudy; don't spend a slot/retry on a null.
    // Terrain worker callbacks request another compositor frame when ready.
    if(typeof canStartSource==='function'&&canStartSource(t,lod)===false){
     if(!blockedSourceTrace.has(k)){
      blockedSourceTrace.add(k);
      trace('tile.source-deferred',{key:k,id:t.id,level:lod,epoch,
       reason:'source-not-prepared'});
     }
     continue;
    }
    blockedSourceTrace.delete(k);
    queue.set(k,{key:k,tile:t,level:lod,epoch,
     queuedAt:prior.get(k)?.queuedAt??now});
    if(!prior.has(k)){
     trace('tile.cache-miss',{key:k,id:t.id,x:t.x,y:t.y,size:t.size,
      level:lod,epoch,reason:existing?.packet.preview?'preview-upgrade':
       Object.keys(density).some(l=>l!==lod&&cache.has(key(t,l)))?
       'different-lod-cached':'not-in-current-lod-cache'});
     observe(k,existing?.packet.preview?'upgrade-queued':'queued',{level:lod});
    }
   }
   const before=[...prior.keys()].filter(k=>queue.has(k));
   const after=[...queue.keys()].filter(k=>prior.has(k));
   if(before.some((k,i)=>k!==after[i]))priorityReorders++;
   const first=queue.values().next().value;
   const protectedWait=first&&age(first.tile)>=MAX_QUEUE_WAIT_MS&&
    [...queue.values()].some(item=>age(item.tile)<MAX_QUEUE_WAIT_MS&&
     distance(item.tile)<distance(first.tile));
   if(protectedWait){
    if(lastAgedPriority!==first.key){
     agedPromotions++;lastAgedPriority=first.key;
    }
   }else lastAgedPriority=null;
   // Protect exactly the complete raster used to represent each visible
   // tile, including an older LOD until its replacement finishes.
   trim(visibleSourceKeys());pump();
   return {lod,requested:visibleTiles.length,pending:queue.size+running.size};
  }
  function drawable(item){
   const packet=item?.packet;
   return !!packet&&packet.complete!==false&&
    packet.layers.some(x=>x.layer==='ground'||x.layer==='terrain')&&
    (!requireScenery||packet.layers.some(x=>
     x.layer==='scenery'||x.layer==='structures'));
  }
  // Existing LOD tiles are progressive FULL images, not partial layers.
  // Preserve a sharper previous LOD until the target LOD is complete;
  // do not replace it with a blurrier low-density target preview.
  function lookup(t){
   const target=cache.get(key(t,lod));
   if(drawable(target)&&!target.packet.preview&&!target.dirty)return target;
   const candidates=['near','mid','far'].map(level=>cache.get(key(t,level)))
    .filter(drawable);
   const resolution=item=>item.packet.preview?
    (item.packet.sourceDensity??0):density[item.tileLod]??0;
   candidates.sort((a,b)=>Number(a.dirty)-Number(b.dirty)||
    resolution(b)-resolution(a)||
    Number(a.packet.preview)-Number(b.packet.preview)||
    Number(b.tileLod===lod)-Number(a.tileLod===lod));
   return candidates[0]||null;
  }
  function visibleSourceKeys(){
   const keep=new Set();
   for(const t of visibleTiles){
    const shown=lookup(t);
    if(shown)keep.add(key(t,shown.tileLod));
   }
   return keep;
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
  // Rare standalone fallback: if cloud-artwork.js itself is absent, still
  // conceal the 45-world-unit cast/crown overhang beyond the known map.
  function maskFrontierWithoutArtwork(context,view,edges){
   if(!Array.isArray(edges)||!edges.length)return 0;
   const directions=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],
    R=256/Math.sqrt(3),H=1.5*R,seen=new Set();
   let count=0;context.save();context.globalAlpha=1;
   for(const e of edges){
    const d=directions[e.direction];if(!d)continue;
    const q=e.q+d[0],r=e.r+d[1],k=q+','+r;
    if(seen.has(k))continue;seen.add(k);
    const proj=view.projectY||1,
     x=view.width/2+view.panX+256*(q+r/2)*view.zoom,
     y=view.height/2+view.panY+H*r*view.zoom*proj,
     rx=R*view.zoom,ry=rx*proj;
    if(x+rx<0||x-rx>view.width||y+ry<0||y-ry>view.height)continue;
    context.beginPath();
    for(let i=0;i<6;i++){
     const a=-Math.PI/2+i*Math.PI/3,
      px=x+Math.cos(a)*rx,py=y+Math.sin(a)*ry;
     if(!i)context.moveTo(px,py);else context.lineTo(px,py);
    }
    context.closePath();context.fillStyle='#bdced7';
    context.fill();count++;
   }
   context.restore();return count;
  }
  function render(view,{tiles=visibleTiles,drawDynamic=null,drawStatic=null,fog=fogCells}={}){
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
   let exact=0,fallback=0,provisional=0,stale=0,missing=0;
   visiblePreviews=0;
   // Legacy standalone hosts without a fog policy remain compatible.
   // Explicit empty fog arrays MUST clip all ground, scenery and units.
   const hasMask=Array.isArray(fog)&&typeof g.clip==='function'&&
    (fogConfigured||fog!==fogCells);
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
    // Shared rounded DEVICE-space core edges eliminate bright seams when
    // two adjacent tiles are composited at a fractional zoom or DPR.
    const snap=x=>Math.round(x*view.dpr)/view.dpr;
    const dx=snap(view.width/2+view.panX+t.x*view.zoom),
     dy=snap(view.height/2+view.panY+t.y*view.zoom*proj),
     dw=snap(view.width/2+view.panX+(t.x+t.size)*view.zoom)-dx,
     dh=snap(view.height/2+view.panY+(t.y+t.size)*view.zoom*proj)-dy;
    if(dx>=view.width||dy>=view.height||dx+dw<=0||dy+dh<=0)continue;
    const item=lookup(t);
    if(!item){missing++;continue;}
    if(item.dirty)stale++;
    else if(item.tileLod!==lod)fallback++;
    else if(item.packet.preview)provisional++;
    else exact++;
    item.used=++used;items.push({t,item,dx,dy,dw,dh});
    if(item.packet.preview||item.tileLod!==lod)visiblePreviews++;
   }
   g.imageSmoothingEnabled=true;g.imageSmoothingQuality='medium';
   let covered=0,draws=0;
   function layerPass(layers,halo){
    g.save();drawKnownPath(halo);
    for(const layer of layers)for(const obj of items)
     for(const asset of obj.item.packet.layers)if(asset.layer===layer){
      // Completed world tiles must be fully opaque. Per-chunk opacity ramps
      // reveal rectangular clouds when an LOD replacement arrives.
      // The subsequent per-HEX fog still conceals incomplete imagery.
      g.globalAlpha=1;
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
       covered+=area;}
     }
    g.globalAlpha=1;
    g.restore();
   }
   // Exact footprint for soil, grass, coastline and roads. The previous
   // 45-unit halo across ground tiles produced the bright green map outline.
   layerPass(['ground','terrain'],0);
   // Terrain cores are independent; sprite depth is NOT. Overlapping trees
   // anchored in distinct tile cores must be globally depth sorted instead
   // of compositing padded scenery packets in tile/LOD arrival order.
   if(typeof drawStatic==='function'){
    g.save();drawKnownPath(45);
    try{drawStatic(g,view);}finally{g.restore();}
   }else layerPass(['scenery','structures'],45);
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
     // Mask missing hex cores even before any cloud artwork decodes.
     // The opaque frontier is drawn AFTER static casts and moving units.
     coverUnready(g,view,fog,ready);
     for(const c of fog)if(c.visibility!=='explored')fogHex(c,view,ready);
     if(clouds)clouds.drawTransitions(g,view,fog.frontierEdges);
     else maskFrontierWithoutArtwork(g,view,fog.frontierEdges);
    }
   }
   painted=draws;frame++;lastMs=clock()-start;
   lastProgress={exact,fallback,provisional,stale,missing};
   lastCoverage=clamp(covered/(view.width*view.height),0,1);
   
   return {renderMs:lastMs,coverage:lastCoverage,drawn:draws,lod,
    loaded:items.length,exact,fallback,provisional,stale,missing,
    pending:queue.size+running.size};
  }
  function stats(){return {version:'0.22.3',epoch,clouds:clouds?.stats()||null,
    fogFrontier:fogCells.filter(c=>c.frontier).length,tiles:cache.size,pixels,bytes:pixels*4,
   budgetBytes:maxPixels*4,evicted,completed,failed,pending:queue.size+running.size,
   inFlight:running.size,visible:visibleTiles.length,lod,
   scope:{far:'world',mid:'region',near:'local'}[lod],
   lodDensity:density[lod],
   selectiveInvalidations,selectiveTiles,
   staleTiles:[...cache.values()].filter(item=>item.dirty).length,
   priorityReorders,agedPromotions,discardedObsolete,parallelLimit,
   visiblePreviews,previews,upgraded,progress:{...lastProgress},
   retryWaiting:retryTimers.size,retryExhausted:[...retries.values()].filter(v=>v.terminal).length,
   renderMs:lastMs,coverage:lastCoverage,drawn:painted,frames:frame};}
  return {request,render,seed,setSource,setFogCells,setCloudAssets,
    reserveWarmTiles,warmTileStatus,
    setCloudSeed,drawCloudBackground,drawCloudFrontier,
    coverUnready,chooseLod,invalidate,invalidateTiles,reconcileGroundRevisions,
    needsSeed,stats,diagnostics,terrainReady};
 }
 return {create};
})();

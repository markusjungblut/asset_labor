/* Vedras Reiche v0.11.7 – camera-driven bounded chunk renderer.
 * World-aligned raster windows, neighbor halo, one idle build at a time,
 * clipped draw, and finite LRU GPU/canvas memory. No separate hex seams.
 */
'use strict';
window.VedrasChunks=(()=>{
 const SIZE=512,HALO=128;
 const key=(x,y)=>x+','+y;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function worldPos(c){return {x:256*(c.q+c.r/2),y:1.5*(256/Math.sqrt(3))*c.r};}
 function tile(x,y,size=SIZE){return {x:x*size,y:y*size,size,id:key(x,y)};}
 function intersects(a,b){
  return a.x < b.x+b.width && a.x+a.width>b.x &&
   a.y < b.y+b.height && a.y+a.height>b.y;
 }
 // All layers in one scene query the SAME cell positions many times per
 // frame. Build covered tile IDs once per cell-array identity and tile size.
 // Recheck the original occupancy inequalities at the edges: no new seams.
 let spatial=new WeakMap(),spatialBuilds=0,spatialHits=0;
 function invalidateGeometry(cells){
  if(cells&&typeof cells==='object')spatial.delete(cells);
  else spatial=new WeakMap();
 }
 function spatialFor(cells,size){
  let bySize=spatial.get(cells);
  if(!bySize){bySize=new Map();spatial.set(cells,bySize);}
  const existing=bySize.get(size);
  if(existing){spatialHits++;return existing;}
  const positions=cells.map(worldPos),occupied=new Set();
  for(const p of positions){
   // Expand by one additional candidate cell and retain only exact matches.
   // This also supports fractional river-bank occupancy hints.
   const minX=Math.floor((p.x-150)/size)-1,maxX=Math.floor((p.x+150)/size)+1;
   const minY=Math.floor((p.y-150)/size)-1,maxY=Math.floor((p.y+150)/size)+1;
   for(let cy=minY;cy<=maxY;cy++)for(let cx=minX;cx<=maxX;cx++){
    const x=cx*size,y=cy*size;
    if(p.x>=x-150&&p.x<x+size+150&&
     p.y>=y-150&&p.y<y+size+150)occupied.add(key(cx,cy));
   }
  }
  const entry={positions,occupied};
  bySize.set(size,entry);spatialBuilds++;return entry;
 }
 function visible(bounds,cells,size=SIZE){
  const present=[];
  if(!bounds||!cells?.length)return present;
  const left=Math.floor(bounds.x/size),right=Math.floor((bounds.x+bounds.width)/size),
   top=Math.floor(bounds.y/size),bottom=Math.floor((bounds.y+bounds.height)/size);
  const covered=spatialFor(cells,size).occupied;
  const xEnd=Math.min(right,left+60),yEnd=Math.min(bottom,top+60);
  for(let cy=top;cy<=yEnd;cy++)for(let cx=left;cx<=xEnd;cx++)
   if(covered.has(key(cx,cy)))present.push(tile(cx,cy,size));
  return present.sort((a,b)=>{
   const mx=bounds.x+bounds.width/2,my=bounds.y+bounds.height/2;
   return ((a.x+a.size/2-mx)**2+(a.y+a.size/2-my)**2)-
     ((b.x+b.size/2-mx)**2+(b.y+b.size/2-my)**2);
  });
 }
 function neighbors(tile,cells,halo=470){
  const xmin=tile.x-halo,xmax=tile.x+tile.size+halo,
    ymin=tile.y-halo,ymax=tile.y+tile.size+halo;
  const positions=spatialFor(cells,tile.size).positions;
  return cells.filter((c,i)=>{
   const p=positions[i];
   return p.x>=xmin&&p.x<=xmax&&p.y>=ymin&&p.y<=ymax;
  });
 }
 function create({size=SIZE,maxTiles=28,maxPixels=12500000}={}){
  size=clamp(Math.floor(size),256,1024);
  let cache=new Map();
  const retired=new Map(),queue=new Map(),backgroundQueue=new Map(),
   prefetchQueue=new Map(),warmRemaining=new Set(),visibleQueuedAt=new Map();
  const MAX_VISIBLE_WAIT_MS=2500,MAX_WARM_STREAK=6;
  let warmStreak=0;
  let signature='',family='',epoch=0,scheduled=false,urgentScheduled=false,
   backgroundPaused=false,
   inFlightInteractive=false,inFlightBackground=false,protectedIds=new Set(),
   viewportWanted=new Set(),prefetchWanted=new Set(),prefetchRejected=new Set(),
   lastDrawnVersions=new Map(),rasterVersion=0,lastFocus=null,
   stats={built:0,cacheHits:0,evicted:0,errors:0,lastMs:0,visible:0,pending:0,
    painted:0,stalePainted:0,pixels:0,warmTotal:0,warmDone:0,
    prefetchQueued:0,prefetched:0,prefetchDiscarded:0,obsolete:0,
    visibleRevision:0,prefetchPending:0,manualPending:0,
    priorityReorders:0,agedPromotions:0,backgroundFairTurns:0,
    duplicateBuildSkips:0,obsoleteVisibleDiscarded:0};
  let cells=[],build=()=>null,requestDraw=()=>{},stampForTile=()=>signature,onWarmProgress=()=>{};
  // Only the terrain layer requires a drawable raster; empty roads/banks are valid.
  let requireArtwork=false,taskTimeoutMs=60000;
  const failures=new Map(),retryTimers=new Map();
  const drawable=item=>!!(item?.raster?.canvas||item?.raster?.waterLayer?.canvas||
   item?.relief?.canvas);
  function forgetRetry(id){
   const timer=retryTimers.get(id);
   if(timer!==undefined&&typeof clearTimeout==='function')clearTimeout(timer);
   retryTimers.delete(id);failures.delete(id);
  }
  function enqueueVisible(t){
   if(!queue.has(t.id))visibleQueuedAt.set(t.id,Date.now());
   queue.set(t.id,t);
  }
  function building(id){
   return activeJobs.foreground?.id===id||activeJobs.background?.id===id;
  }
  // Camera-position priority, preserving the original waiting time. Long
  // waiting visible chunks receive priority so center churn cannot starve them.
  function prioritizeVisible(){
   if(queue.size<2)return;
   const now=Date.now(),focus=lastFocus||{x:0,y:0};
   const before=[...queue.keys()],ordered=[...queue.values()];
   const age=t=>Math.max(0,now-(visibleQueuedAt.get(t.id)??now));
   const dist=t=>(t.x+t.size/2-focus.x)**2+
    (t.y+t.size/2-focus.y)**2;
   ordered.sort((a,b)=>{
    const ao=age(a)>=MAX_VISIBLE_WAIT_MS,bo=age(b)>=MAX_VISIBLE_WAIT_MS;
    if(ao!==bo)return ao?-1:1;
    if(ao&&bo)return (visibleQueuedAt.get(a.id)??now)-
     (visibleQueuedAt.get(b.id)??now);
    return dist(a)-dist(b);
   });
   if(ordered.some((t,i)=>t.id!==before[i])){
    stats.priorityReorders++;
    if(ordered[0].id!==before[0]&&age(ordered[0])>=MAX_VISIBLE_WAIT_MS)
     stats.agedPromotions++;
   }
   queue.clear();
   for(const t of ordered)queue.set(t.id,t);
  }
  function eligible(id,t){
   if(!requireArtwork)return true;
   const failure=failures.get(id);
   if(!failure)return true;
   if(failure.stamp!==stampForTile(t)){forgetRetry(id);return true;}
   return !failure.terminal&&(!failure.nextAt||Date.now()>=failure.nextAt);
  }
  function retryFailure(id,t,stamp,reason,error=null){
   const prior=failures.get(id);
   const attempts=(prior?.stamp===stamp?prior.attempts:0)+1;
   const terminal=attempts>=4,delay=Math.min(4000,300*2**(attempts-1));
   const failure={stamp,attempts,terminal,nextAt:terminal?null:Date.now()+delay,
    reason,error:error?String(error?.message||error):null};
   forgetRetry(id);failures.set(id,failure);
   observe(id,terminal?'retry-exhausted':'retry-wait',
    {attempts,reason,error:failure.error});
   if(terminal&&viewportWanted.has(id))requestDraw();
   if(terminal||typeof setTimeout!=='function')return;
   const generation=epoch;
   const timer=setTimeout(()=>{
    retryTimers.delete(id);
    if(generation!==epoch||failures.get(id)!==failure)return;
    failure.nextAt=0;
    if(!viewportWanted.has(id)||cache.has(id)||queue.has(id))return;
    if(building(id))return;
    enqueueVisible(t);prioritizeVisible();
    observe(id,'queued-visible',{reason:'retry',attempts});
    schedule();
   },delay);
   retryTimers.set(id,timer);
  }
  // Bounded, opt-in diagnostics. Rendering and scheduling remain unchanged.
  const history=new Map(),activeJobs={foreground:null,background:null};
  let diagnosticLod=null,diagnosticTiles=[];
  function observe(id,status,extra={}){
   const old=history.get(id);history.delete(id);
   history.set(id,{id,status,epoch,lod:diagnosticLod,at:Date.now(),
    attempts:(old?.attempts||0)+(status==='building'?1:0),...extra});
   if(history.size>384)history.delete(history.keys().next().value);
  }
  function diagnostics({limit=100}={}){
   const max=clamp(Math.floor(limit)||100,1,250),now=Date.now();
   const tiles=diagnosticTiles.slice(0,max).map(t=>{
    const id=t.id,c=cache.get(id),prior=history.get(id),failure=failures.get(id);
    const flight=activeJobs.foreground?.id===id?activeJobs.foreground:
     activeJobs.background?.id===id?activeJobs.background:null;
    const matches=c?c.stamp===stampForTile(t):null;
    const state=flight?'building':queue.has(id)?'queued-visible':
     backgroundQueue.has(id)?'queued-warm':prefetchQueue.has(id)?'queued-prefetch':
     matches?(drawable(c)?'ready':'cached-empty'):
     failure?.stamp===stampForTile(t)?
       (failure.terminal?'retry-exhausted':'retry-wait'):
     prior?.epoch===epoch?prior.status:'unrequested';
    return {id,state,epoch,lod:diagnosticLod,stampMatches:matches,
     rasterVersion:c?.version??null,paintedVersion:lastDrawnVersions.get(id)??null,
     flight:flight?.lane??null,startedAt:flight?.startedAt??null,
     lastOutcome:prior?.status??null,lastError:failure?.error??prior?.error??null,
     retryAt:failure?.nextAt??null,terminal:failure?.terminal??false,
     queuedMs:queue.has(id)?Math.max(0,now-(visibleQueuedAt.get(id)??now)):null,
     failureReason:failure?.reason??null,
     attempts:failure?.attempts??prior?.attempts??0,
     ageMs:prior?Math.max(0,now-prior.at):null};
   });
   return {epoch,lod:diagnosticLod,visible:diagnosticTiles.length,
    queuedVisible:queue.size,queuedWarm:backgroundQueue.size,
    queuedPrefetch:prefetchQueue.size,retryWaiting:retryTimers.size,
    retryExhausted:[...failures.values()].filter(f=>f.terminal).length,
    foreground:activeJobs.foreground,
    background:activeJobs.background,errors:stats.errors,obsolete:stats.obsolete,
    tiles,recent:[...history.values()].slice(-max).reverse()};
  }
  function release(item){
   const canvases=[item?.raster?.canvas,item?.raster?.waterLayer?.canvas,
    item?.raster?.landLayer?.canvas,item?.relief?.canvas];
   const seen=new Set();
   for(const resource of canvases)if(resource&&!seen.has(resource)){
    seen.add(resource);
    if(typeof resource.close==='function')resource.close();
   }
  }
  function dispose(bucket){
   for(const item of bucket.values())release(item);
   bucket.clear();
  }
  function dropCache(){
   dispose(cache);for(const bucket of retired.values())dispose(bucket);
   retired.clear();cache=new Map();stats.pixels=0;
  }
  function clear(){
   for(const id of retryTimers.keys())forgetRetry(id);
   failures.clear();
   for(const id of queue.keys())observe(id,'invalidated',{reason:'clear'});
   for(const job of Object.values(activeJobs))if(job){
    if(job.watchdog!=null&&typeof clearTimeout==='function')clearTimeout(job.watchdog);
    observe(job.id,'invalidated',{reason:'clear'});
   }
   activeJobs.foreground=null;activeJobs.background=null;diagnosticTiles=[];
   dropCache();queue.clear();visibleQueuedAt.clear();
   backgroundQueue.clear();prefetchQueue.clear();warmStreak=0;
   warmRemaining.clear();protectedIds.clear();viewportWanted.clear();
   prefetchWanted.clear();prefetchRejected.clear();lastDrawnVersions.clear();lastFocus=null;
   signature='';family='';epoch++;scheduled=false;urgentScheduled=false;
   inFlightInteractive=false;inFlightBackground=false;
  }
  function configure(next,{worldCells,buildTile,redraw,family:nextFamily='',stampTile=null,
    diagnosticLod:nextLod=null,requireRaster:needsRaster=false,
    timeoutMs:nextTimeout=60000}){
   if(next!==signature){
    for(const id of retryTimers.keys())forgetRetry(id);
    failures.clear();
    for(const id of queue.keys())observe(id,'invalidated',{reason:'signature-change'});
    for(const job of Object.values(activeJobs))if(job){
     if(job.watchdog!=null&&typeof clearTimeout==='function')clearTimeout(job.watchdog);
     observe(job.id,'invalidated',{reason:'signature-change'});
    }
    activeJobs.foreground=null;activeJobs.background=null;diagnosticTiles=[];
    queue.clear();visibleQueuedAt.clear();backgroundQueue.clear();
    prefetchQueue.clear();warmStreak=0;
    warmRemaining.clear();protectedIds.clear();viewportWanted.clear();
    prefetchWanted.clear();prefetchRejected.clear();lastDrawnVersions.clear();
    lastFocus=null;epoch++;scheduled=false;urgentScheduled=false;inFlightInteractive=false;inFlightBackground=false;
    stats.warmTotal=0;stats.warmDone=0;
    if(nextFamily&&nextFamily===family){
     // Swapping visual LOD must NEVER blank an on-screen tile. Preserve the
     // old variant and reuse it immediately if the user zooms back.
     if(cache.size)retired.set(signature,cache);
     cache=retired.get(next)||new Map();
     retired.delete(next);
     while(retired.size>2){
      const oldest=retired.keys().next().value;
      const old=retired.get(oldest);
      for(const item of old.values())stats.pixels-=item.pixels;
      dispose(old);retired.delete(oldest);
     }
    }else dropCache();
    signature=next;family=nextFamily;
   }
   diagnosticLod=nextLod;
   requireArtwork=needsRaster;
   taskTimeoutMs=nextTimeout;
   cells=worldCells||[];build=buildTile;requestDraw=redraw||(()=>{});
   stampForTile=typeof stampTile==='function'?stampTile:()=>signature;
  }
  function use(k){
   const data=cache.get(k);
   if(data){cache.delete(k);cache.set(k,data);stats.cacheHits++;}
   return data;
  }
  function trim(){
   const itemCount=()=>cache.size+[...retired.values()].reduce((n,m)=>n+m.size,0);
   while(itemCount()>maxTiles||stats.pixels>maxPixels){
    // Retain the viewport's active and fallback variants; evict older
    // offscreen tiles before either currently visible resolution.
    let bucket=null,id;
    for(const candidate of [...retired.values(),cache]){
     id=[...candidate.keys()].find(k=>!protectedIds.has(k));
     if(id!==undefined){bucket=candidate;break;}
    }
    if(!bucket)break;
    const value=bucket.get(id);
    stats.pixels-=value.pixels;bucket.delete(id);release(value);stats.evicted++;
   }
  }
  // buildTile may return a concrete canvas group OR a Promise of transferred
  // ImageBitmaps. While the Worker is busy, input and the compositor stay free.
  function markWarm(id){
   if(warmRemaining.delete(id)){stats.warmDone++;onWarmProgress({...stats});}
  }
  // A foreground slot is independent of the speculative/explicit warm slot:
  // prefetch never blocks an urgent on-screen request waiting for a worker.
  function schedule(){
   const foreground=queue.size>0&&!inFlightInteractive;
   const background=!backgroundPaused&&!inFlightBackground&&
    (backgroundQueue.size||prefetchQueue.size);
   if(!foreground&&!background)return;
   // Two scheduled callbacks allow a fresh visible request to bypass an
   // already pending requestIdleCallback for speculative background work.
   const urgent=foreground;
   if(urgent?urgentScheduled:scheduled)return;
   if(urgent)urgentScheduled=true;else scheduled=true;
   const generation=epoch;
   const task=()=>{
    if(generation!==epoch)return;
    if(urgent)urgentScheduled=false;else scheduled=false;
    const interactive=urgent&&queue.size>0&&!inFlightInteractive;
    const canBackground=!urgent&&!backgroundPaused&&!inFlightBackground;
    const warm=canBackground&&backgroundQueue.size>0&&
     (prefetchQueue.size===0||warmStreak<MAX_WARM_STREAK);
    const predictive=canBackground&&!warm&&prefetchQueue.size>0;
    if(!interactive&&!warm&&!predictive){schedule();return;}
    const targetQueue=interactive?queue:warm?backgroundQueue:prefetchQueue;
    const next=targetQueue.entries().next().value;
    if(!next)return;
    const [id,t]=next;targetQueue.delete(id);
    if(interactive)visibleQueuedAt.delete(id);
    if(warm)warmStreak++;
    else if(predictive){
     if(backgroundQueue.size)stats.backgroundFairTurns++;
     warmStreak=0;
    }
    const isVisible=viewportWanted.has(id)||protectedIds.has(id);
    if(interactive&&!viewportWanted.has(id)){
     stats.obsoleteVisibleDiscarded++;schedule();return;
    }
    if(!interactive&&!isVisible&&predictive&&!prefetchWanted.has(id)){
     stats.prefetchDiscarded++;schedule();return;
    }
    if(!interactive&&cache.has(id)&&cache.get(id)?.stamp===stampForTile(t)&&
      (!requireArtwork||drawable(cache.get(id)))){
     markWarm(id);schedule();return;
    }
    if(!eligible(id,t)){markWarm(id);schedule();return;}
    const expectedStamp=stampForTile(t);
    const lane=interactive?'foreground':'background';
    const job={id,lane,epoch,startedAt:Date.now(),watchdog:null};
    activeJobs[lane]=job;
    let expired=false;
    observe(id,'building',{lane,stampLength:String(expectedStamp).length});
    const t0=typeof performance!=='undefined'?performance.now():0;
    const countPixels=item=>{
     const resources=[item?.raster?.canvas,item?.raster?.waterLayer?.canvas,
      item?.raster?.landLayer?.canvas,item?.relief?.canvas];
     const seen=new Set();
     return resources.reduce((sum,c)=>{
      if(!c||seen.has(c))return sum;
      seen.add(c);return sum+(c.width||0)*(c.height||0);
     },0);
    };
    const complete=item=>{
     if(expired){release(item);stats.obsolete++;return;}
     if(generation!==epoch){
      observe(id,'obsolete',{reason:'epoch-change'});release(item);stats.obsolete++;return;
     }
     const visibleNow=viewportWanted.has(id)||protectedIds.has(id);
     // Old foreground work may finish after the camera leaves its region.
     // Never publish such a result unless it belongs to the new bounded
     // prefetch ring or an explicit manual warm job.
     if(interactive&&!visibleNow&&!prefetchWanted.has(id)&&
        !warmRemaining.has(id)){
      observe(id,'obsolete',{reason:'outside-viewport'});
      release(item);stats.obsolete++;schedule();return;
     }
     // Ignore obsolete speculative jobs rather than filling the LRU with
     // a distant region after the player turns around.
     if(expectedStamp!==stampForTile(t)||
       (predictive&&!visibleNow&&!prefetchWanted.has(id))){
      observe(id,'obsolete',{reason:'stamp-or-prefetch-changed'});
      release(item);stats.obsolete++;
      if(visibleNow&&expectedStamp!==stampForTile(t)&&!queue.has(id)){
       if(!building(id)){enqueueVisible(t);prioritizeVisible();}
       observe(id,'queued-visible',{reason:'changed-stamp'});
      }
      markWarm(id);schedule();return;
     }
     if(requireArtwork&&!drawable(item)){
      release(item);
      retryFailure(id,t,expectedStamp,'missing-raster');
      markWarm(id);schedule();return;
     }
     const pixels=countPixels(item);
     const old=cache.get(id);
     // Background prefetch is not allowed to evict the current viewport
     // or a fallback LOD. Reserve 15% of this layer's pixel budget.
     if(predictive&&!visibleNow&&
       (cache.size>=Math.max(1,maxTiles-4)||
        stats.pixels-(old?.pixels||0)+pixels>maxPixels*.85)){
      release(item);stats.prefetchDiscarded++;
      prefetchRejected.add(id);
      schedule();return;
     }
     if(old){stats.pixels-=old.pixels||0;release(old);}
     if(!item)cache.set(id,{raster:null,relief:null,pixels:0,
      stamp:expectedStamp,version:++rasterVersion});
     else{
      cache.set(id,{...item,pixels,stamp:expectedStamp,
       version:++rasterVersion});
      stats.pixels+=pixels;stats.built++;
      if(predictive&&!visibleNow)stats.prefetched++;
     }
     if(visibleNow){stats.visibleRevision++;queue.delete(id);}
     if(requireArtwork)forgetRetry(id);
     observe(id,item?'completed':'empty-result',{version:rasterVersion});
     trim();
     stats.lastMs=(typeof performance!=='undefined'?performance.now():0)-t0;
     if(visibleNow)requestDraw(t); // publisher may retry precisely this completed tile
     markWarm(id);
     schedule();
    };
    const fail=error=>{
     if(expired||generation!==epoch)return;
     stats.errors++;
     if(requireArtwork)retryFailure(id,t,expectedStamp,'build-error',error);
     else observe(id,'failed',{error:String(error?.message||error)});
     if(typeof console!=='undefined')console.error('Chunk '+id+' failed:',error);
     if(!requireArtwork&&(interactive||viewportWanted.has(id)))requestDraw();
     markWarm(id);schedule();
    };
    if(interactive)inFlightInteractive=true;
    else inFlightBackground=true;
    const finish=()=>{
     if(job.watchdog!==null&&typeof clearTimeout==='function')
      clearTimeout(job.watchdog);
     if(activeJobs[lane]!==job||generation!==epoch)return;
     activeJobs[lane]=null;
     if(interactive)inFlightInteractive=false;
     else inFlightBackground=false;
    };
    // The terrain worker has a 45s watchdog; leave time for disk cache and
    // fallback but never let a nonsettling Promise own this lane indefinitely.
    if(requireArtwork&&taskTimeoutMs>0&&typeof setTimeout==='function')
     job.watchdog=setTimeout(()=>{
      if(activeJobs[lane]!==job||generation!==epoch)return;
      expired=true;finish();stats.errors++;
      retryFailure(id,t,expectedStamp,'build-timeout',
       new Error('Chunk build exceeded '+taskTimeoutMs+' ms'));
      markWarm(id);schedule();
     },taskTimeoutMs);
    try{
     const output=build(t,neighbors(t,cells));
     if(output&&typeof output.then==='function'){
      output.then(item=>{finish();complete(item);},
       err=>{finish();fail(err);});
     }else{finish();complete(output);}
    }catch(err){finish();fail(err);}
    // If another lane has work, it can run without waiting for this Promise.
    if(queue.size&&!inFlightInteractive)schedule();
   };
   // Foreground tiles must never wait for idle time under continuous input.
   if(urgent&&typeof setTimeout==='function')setTimeout(task,0);
   else if(typeof requestIdleCallback==='function')
    requestIdleCallback(task,{timeout:1000});
   else if(typeof setTimeout==='function')setTimeout(task,16);
   else task();
  }
  // Planning is camera-driven but world-aligned. Neighbors are merely
  // queued and never painted until they intersect the actual viewport.
  function updateStreaming(viewport,tiles,prefetch){
   const keep=new Set(tiles.map(t=>t.id));
   viewportWanted=keep;
   protectedIds=new Set(keep);
   for(const id of [...queue.keys()])if(!keep.has(id)){
    queue.delete(id);visibleQueuedAt.delete(id);
    observe(id,'discarded',{reason:'outside-viewport'});
    stats.obsoleteVisibleDiscarded++;
   }
   const cx=viewport.x+viewport.width/2,cy=viewport.y+viewport.height/2;
   const old=lastFocus;
   lastFocus={x:cx,y:cy};
   const enabled=!!prefetch?.enabled&&cells.length>0;
   if(!enabled){prefetchQueue.clear();prefetchWanted.clear();return;}
   const ring=clamp(Math.floor(prefetch.ring??1),1,3);
   const limit=clamp(Math.floor(prefetch.limit??8),1,18);
   const dx=old?clamp((cx-old.x)*2,-size*2,size*2):0;
   const dy=old?clamp((cy-old.y)*2,-size*2,size*2):0;
   const pad=ring*size;
   const expanded={x:viewport.x-pad,y:viewport.y-pad,
    width:viewport.width+2*pad,height:viewport.height+2*pad};
   const prediction={...expanded,x:expanded.x+dx,y:expanded.y+dy};
   const union=new Map();
   for(const t of [...visible(expanded,cells,size),...visible(prediction,cells,size)])
    if(!keep.has(t.id))union.set(t.id,t);
   const predictedX=cx+dx,predictedY=cy+dy;
   const chosen=[...union.values()].sort((a,b)=>
    ((a.x+size/2-predictedX)**2+(a.y+size/2-predictedY)**2)-
    ((b.x+size/2-predictedX)**2+(b.y+size/2-predictedY)**2)
   ).slice(0,limit);
   if(stats.pixels<maxPixels*.60)prefetchRejected.clear();
   prefetchWanted=new Set(chosen.map(t=>t.id));
   for(const id of [...prefetchQueue.keys()])
    if(!prefetchWanted.has(id))prefetchQueue.delete(id);
   // Reorder on a directional change; opposite camera movement does not
   // keep scheduling the old route's background chunks first.
   const previous=new Map(prefetchQueue);
   prefetchQueue.clear();
   for(const t of chosen){
    const cached=cache.get(t.id);
    if((cached&&cached.stamp===stampForTile(t))||
      prefetchRejected.has(t.id)||
      queue.has(t.id)||backgroundQueue.has(t.id))continue;
    prefetchQueue.set(t.id,previous.get(t.id)||t);
    if(!previous.has(t.id))stats.prefetchQueued++;
   }
  }
  // Used when the v0.17 static background itself was reused. Without this
  // hook, a warm camera pan would never reach draw() to update prefetch.
  function prime(bounds,{prefetch=null,notifyReady=true}={}){
   if(!signature||!cells?.length)return {...stats};
   const tiles=visible(bounds,cells,size);
   diagnosticTiles=tiles;
   stats.visible=tiles.length;
   updateStreaming(bounds,tiles,prefetch);
   trim();
   let unseenReady=false;
   for(const t of tiles){
    const data=cache.get(t.id);
    const ready=data&&data.stamp===stampForTile(t)&&
     (!requireArtwork||drawable(data));
    if(ready&&lastDrawnVersions.get(t.id)!==data.version)
     unseenReady=true;
    if(!ready&&!queue.has(t.id)&&!building(t.id)&&eligible(t.id,t)){
     prefetchQueue.delete(t.id);enqueueVisible(t);
    }else if(!ready&&building(t.id))stats.duplicateBuildSkips++;
   }
   // A speculative result can be ready before entering the visible region,
   // yet absent in v0.17's already cached, oversized background canvas.
   // Force only that newly seen region to refresh once when it enters view.
   if(unseenReady&&notifyReady){stats.visibleRevision++;requestDraw();}
   prioritizeVisible();
   stats.prefetchPending=prefetchQueue.size;
   stats.manualPending=backgroundQueue.size;
   stats.pending=queue.size+(inFlightInteractive?1:0);
   schedule();
   return {...stats};
  }
  // Read-only view of already prepared raster pieces for the v0.20.1 fast
  // camera compositor. No queue mutation, canvas copy or worker cost.
  // Consumers must finish painting synchronously: eviction still owns bitmaps.
  function paintedVersions(){return new Map(lastDrawnVersions);}
  function readyTiles(bounds,{limit=100}={}){
   if(!signature||!cells?.length||!bounds)return [];
   const result=[];
   for(const t of visible(bounds,cells,size)){
    const current=cache.get(t.id);
    if(current&&current.stamp===stampForTile(t)&&
      (current.relief?.canvas||current.raster?.canvas||
       current.raster?.waterLayer?.canvas)){
     result.push({tile:t,artwork:current});
     if(result.length>=limit)break;
    }
   }
   return result;
  }
  // Rasters keep their source halos, but each chunk exclusively owns a
  // device-pixel-aligned output rectangle. Two separate semi-transparent
  // rasters must never overlap at the four-way tile cross.
  function clipCore(ctx,t){
   const m=typeof ctx.getTransform==='function'?ctx.getTransform():null;
   if(m&&typeof ctx.setTransform==='function'&&
      Math.abs(m.b)<1e-9&&Math.abs(m.c)<1e-9&&
      Number.isFinite(m.a)&&Number.isFinite(m.d)&&
      Number.isFinite(m.e)&&Number.isFinite(m.f)){
    const x0=Math.round(t.x*m.a+m.e),
     x1=Math.round((t.x+t.size)*m.a+m.e),
     y0=Math.round(t.y*m.d+m.f),
     y1=Math.round((t.y+t.size)*m.d+m.f);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.beginPath();
    ctx.rect(Math.min(x0,x1),Math.min(y0,y1),Math.abs(x1-x0),Math.abs(y1-y0));
    ctx.clip();
    ctx.setTransform(m); // keep water and terrain sampling unchanged
    return {x0,y0,x1,y1,space:'device'};
   }
   ctx.beginPath();ctx.rect(t.x,t.y,t.size,t.size);ctx.clip();
   return {space:'world'};
  }
  function draw(ctx,bounds,{water=true,drawRaster,margin=80,prefetch=null}={}){
   const viewport={x:bounds.x-margin,y:bounds.y-margin,width:bounds.width+2*margin,
    height:bounds.height+2*margin};
   const tiles=visible(viewport,cells,size);
   diagnosticTiles=tiles;
   stats.visible=tiles.length;stats.painted=0;stats.stalePainted=0;
   updateStreaming(viewport,tiles,prefetch);
   trim();
   const paintedVersions=new Map();
   for(const t of tiles){
    let result=use(t.id);
    if(result&&(result.stamp!==stampForTile(t)||
      (requireArtwork&&!drawable(result)))){
     cache.delete(t.id);stats.pixels-=result.pixels||0;release(result);result=null;
    }
    if(!result&&!queue.has(t.id)&&!building(t.id)&&eligible(t.id,t)){
     backgroundQueue.delete(t.id);enqueueVisible(t);
    }else if(!result&&building(t.id))stats.duplicateBuildSkips++;
    const fallback=!result?[...retired.values()].reverse().map(m=>m.get(t.id)).
      find(v=>v&&(v.relief||v.raster?.canvas||v.raster?.waterLayer)):null;
    const artwork=result||fallback;
    if(!artwork||!ctx||!drawRaster)continue;
    paintedVersions.set(t.id,artwork.version);
    // The source halo is still present. Its destination is clipped to one
    // exclusive pixel-aligned core: adjacent pieces meet, never overlap.
    ctx.save();clipCore(ctx,t);
    if(water&&artwork.raster?.waterLayer)drawRaster(ctx,artwork.raster.waterLayer,t);
    if(artwork.relief)drawRaster(ctx,artwork.relief,t);
    else if(artwork.raster)drawRaster(ctx,artwork.raster,t);
    ctx.restore();stats.painted++;if(fallback)stats.stalePainted++;
   }
   lastDrawnVersions=paintedVersions;
   prioritizeVisible();
   stats.pending=queue.size+(inFlightInteractive?1:0);
   stats.prefetchPending=prefetchQueue.size;
   stats.manualPending=backgroundQueue.size;
   schedule();
   return {...stats,cached:cache.size,variants:retired.size};
  }
  function warm(tiles,{progress=()=>{}}={}){
   backgroundQueue.clear();warmRemaining.clear();onWarmProgress=progress;
   stats.warmTotal=tiles.length;stats.warmDone=0;
   for(const t of tiles){
    const existing=cache.get(t.id);
    if(existing&&existing.stamp===stampForTile(t)&&
     (!requireArtwork||drawable(existing)))stats.warmDone++;
    else{warmRemaining.add(t.id);backgroundQueue.set(t.id,t);}
   }
   onWarmProgress({...stats});schedule();
   return {total:stats.warmTotal,queued:backgroundQueue.size};
  }
  function stopWarm(){
   backgroundQueue.clear();warmRemaining.clear();stats.warmTotal=stats.warmDone;
   onWarmProgress({...stats});
  }
  // Gestures suspend optional background CPU work, but do not lose any
  // prepared raster or block an urgently requested visible chunk.
  function setInteractive(active){
   backgroundPaused=!!active;
   if(!backgroundPaused)schedule();
  }
  return {configure,draw,prime,readyTiles,paintedVersions,warm,stopWarm,clipCore,clear,setInteractive,diagnostics,
   stats:()=>({...stats,cached:cache.size,variants:retired.size,
    warmPending:backgroundQueue.size,prefetchPending:prefetchQueue.size,
    manualPending:backgroundQueue.size,
    inFlight:(inFlightInteractive?1:0)+(inFlightBackground?1:0),
    retryWaiting:retryTimers.size,retryExhausted:[...failures.values()].filter(f=>f.terminal).length,
    backgroundPaused,
    bytes:stats.pixels*4,budgetBytes:maxPixels*4}),
   has:id=>cache.has(id),pending:()=>queue.size};
 }
 return {SIZE,HALO,tile,worldPos,neighbors,visible,intersects,create,
  invalidateGeometry,spatialStats:()=>({builds:spatialBuilds,hits:spatialHits})};
})();

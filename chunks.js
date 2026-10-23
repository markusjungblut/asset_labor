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
   prefetchQueue=new Map(),warmRemaining=new Set();
  let signature='',family='',epoch=0,scheduled=false,
   inFlightInteractive=false,inFlightBackground=false,protectedIds=new Set(),
   viewportWanted=new Set(),prefetchWanted=new Set(),lastFocus=null,
   stats={built:0,cacheHits:0,evicted:0,errors:0,lastMs:0,visible:0,pending:0,
    painted:0,stalePainted:0,pixels:0,warmTotal:0,warmDone:0,
    prefetchQueued:0,prefetched:0,prefetchDiscarded:0,obsolete:0,
    visibleRevision:0,prefetchPending:0,manualPending:0};
  let cells=[],build=()=>null,requestDraw=()=>{},stampForTile=()=>signature,onWarmProgress=()=>{};
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
   dropCache();queue.clear();backgroundQueue.clear();prefetchQueue.clear();
   warmRemaining.clear();protectedIds.clear();viewportWanted.clear();
   prefetchWanted.clear();lastFocus=null;
   signature='';family='';epoch++;scheduled=false;
   inFlightInteractive=false;inFlightBackground=false;
  }
  function configure(next,{worldCells,buildTile,redraw,family:nextFamily='',stampTile=null}){
   if(next!==signature){
    queue.clear();backgroundQueue.clear();prefetchQueue.clear();
    warmRemaining.clear();protectedIds.clear();viewportWanted.clear();
    prefetchWanted.clear();lastFocus=null;
    epoch++;scheduled=false;inFlightInteractive=false;inFlightBackground=false;
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
   if(scheduled)return;
   const foreground=queue.size>0&&!inFlightInteractive;
   const background=!inFlightBackground&&(backgroundQueue.size||prefetchQueue.size);
   if(!foreground&&!background)return;
   scheduled=true;
   const generation=epoch;
   const task=()=>{
    if(generation!==epoch)return;
    scheduled=false;
    const interactive=queue.size>0&&!inFlightInteractive;
    const warm=!interactive&&!inFlightBackground&&backgroundQueue.size>0;
    const predictive=!interactive&&!warm&&!inFlightBackground&&prefetchQueue.size>0;
    if(!interactive&&!warm&&!predictive)return;
    const targetQueue=interactive?queue:warm?backgroundQueue:prefetchQueue;
    const next=targetQueue.entries().next().value;
    if(!next)return;
    const [id,t]=next;targetQueue.delete(id);
    const isVisible=viewportWanted.has(id)||protectedIds.has(id);
    if(!interactive&&!isVisible&&predictive&&!prefetchWanted.has(id)){
     stats.prefetchDiscarded++;schedule();return;
    }
    if(!interactive&&cache.has(id)&&cache.get(id)?.stamp===stampForTile(t)){
     markWarm(id);schedule();return;
    }
    const expectedStamp=stampForTile(t);
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
     if(generation!==epoch){release(item);stats.obsolete++;return;}
     const visibleNow=viewportWanted.has(id)||protectedIds.has(id);
     // Ignore obsolete speculative jobs rather than filling the LRU with
     // a distant region after the player turns around.
     if(expectedStamp!==stampForTile(t)||
       (predictive&&!visibleNow&&!prefetchWanted.has(id))){
      release(item);stats.obsolete++;markWarm(id);schedule();return;
     }
     const pixels=countPixels(item);
     const old=cache.get(id);
     // Background prefetch is not allowed to evict the current viewport
     // or a fallback LOD. Reserve 15% of this layer's pixel budget.
     if(predictive&&!visibleNow&&
       (cache.size>=Math.max(1,maxTiles-4)||
        stats.pixels-(old?.pixels||0)+pixels>maxPixels*.85)){
      release(item);stats.prefetchDiscarded++;schedule();return;
     }
     if(old){stats.pixels-=old.pixels||0;release(old);}
     if(!item)cache.set(id,{raster:null,relief:null,pixels:0,stamp:expectedStamp});
     else{
      cache.set(id,{...item,pixels,stamp:expectedStamp});
      stats.pixels+=pixels;stats.built++;
      if(predictive&&!visibleNow)stats.prefetched++;
     }
     if(visibleNow){stats.visibleRevision++;queue.delete(id);}
     trim();
     stats.lastMs=(typeof performance!=='undefined'?performance.now():0)-t0;
     if(visibleNow)requestDraw();
     markWarm(id);
     schedule();
    };
    const fail=error=>{
     if(generation!==epoch)return;
     stats.errors++;
     if(typeof console!=='undefined')console.error('Chunk '+id+' failed:',error);
     if(interactive||viewportWanted.has(id))requestDraw();
     markWarm(id);schedule();
    };
    if(interactive)inFlightInteractive=true;
    else inFlightBackground=true;
    const finish=()=>{
     if(generation!==epoch)return;
     if(interactive)inFlightInteractive=false;
     else inFlightBackground=false;
    };
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
   if(foreground&&typeof setTimeout==='function')setTimeout(task,0);
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
   for(const id of [...queue.keys()])if(!keep.has(id))queue.delete(id);
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
      queue.has(t.id)||backgroundQueue.has(t.id))continue;
    prefetchQueue.set(t.id,previous.get(t.id)||t);
    if(!previous.has(t.id))stats.prefetchQueued++;
   }
  }
  // Used when the v0.17 static background itself was reused. Without this
  // hook, a warm camera pan would never reach draw() to update prefetch.
  function prime(bounds,{prefetch=null}={}){
   if(!signature||!cells?.length)return {...stats};
   const tiles=visible(bounds,cells,size);
   stats.visible=tiles.length;
   updateStreaming(bounds,tiles,prefetch);
   trim();
   for(const t of tiles){
    const data=cache.get(t.id);
    if((!data||data.stamp!==stampForTile(t))&&!queue.has(t.id)){
     prefetchQueue.delete(t.id);
     queue.set(t.id,t);
    }
   }
   stats.prefetchPending=prefetchQueue.size;
   stats.manualPending=backgroundQueue.size;
   stats.pending=queue.size+(inFlightInteractive?1:0);
   schedule();
   return {...stats};
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
   stats.visible=tiles.length;stats.painted=0;stats.stalePainted=0;
   updateStreaming(viewport,tiles,prefetch);
   trim();
   for(const t of tiles){
    let result=use(t.id);
    if(result&&result.stamp!==stampForTile(t)){
     cache.delete(t.id);stats.pixels-=result.pixels||0;release(result);result=null;
    }
    if(!result&&!queue.has(t.id)){
     backgroundQueue.delete(t.id);queue.set(t.id,t);
    }
    const fallback=!result?[...retired.values()].reverse().map(m=>m.get(t.id)).
      find(v=>v&&(v.relief||v.raster?.canvas||v.raster?.waterLayer)):null;
    const artwork=result||fallback;
    if(!artwork||!ctx||!drawRaster)continue;
    // The source halo is still present. Its destination is clipped to one
    // exclusive pixel-aligned core: adjacent pieces meet, never overlap.
    ctx.save();clipCore(ctx,t);
    if(water&&artwork.raster?.waterLayer)drawRaster(ctx,artwork.raster.waterLayer,t);
    if(artwork.relief)drawRaster(ctx,artwork.relief,t);
    else if(artwork.raster)drawRaster(ctx,artwork.raster,t);
    ctx.restore();stats.painted++;if(fallback)stats.stalePainted++;
   }
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
    if(existing&&existing.stamp===stampForTile(t))stats.warmDone++;
    else{warmRemaining.add(t.id);backgroundQueue.set(t.id,t);}
   }
   onWarmProgress({...stats});schedule();
   return {total:stats.warmTotal,queued:backgroundQueue.size};
  }
  function stopWarm(){
   backgroundQueue.clear();warmRemaining.clear();stats.warmTotal=stats.warmDone;
   onWarmProgress({...stats});
  }
  return {configure,draw,prime,warm,stopWarm,clipCore,clear,
   stats:()=>({...stats,cached:cache.size,variants:retired.size,
    warmPending:backgroundQueue.size,prefetchPending:prefetchQueue.size,
    manualPending:backgroundQueue.size,
    inFlight:(inFlightInteractive?1:0)+(inFlightBackground?1:0),
    bytes:stats.pixels*4,budgetBytes:maxPixels*4}),
   has:id=>cache.has(id),pending:()=>queue.size};
 }
 return {SIZE,HALO,tile,worldPos,neighbors,visible,intersects,create,
  invalidateGeometry,spatialStats:()=>({builds:spatialBuilds,hits:spatialHits})};
})();

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
 function visible(bounds,cells,size=SIZE){
  const present=[];
  if(!bounds||!cells?.length)return present;
  const left=Math.floor(bounds.x/size),right=Math.floor((bounds.x+bounds.width)/size),
   top=Math.floor(bounds.y/size),bottom=Math.floor((bounds.y+bounds.height)/size);
  const occupancy=cells.map(c=>worldPos(c));
  const xEnd=Math.min(right,left+60),yEnd=Math.min(bottom,top+60);
  for(let cy=top;cy<=yEnd;cy++)for(let cx=left;cx<=xEnd;cx++){
   const t=tile(cx,cy,size);
   if(occupancy.some(p=>p.x>=t.x-150&&p.x<t.x+size+150&&
     p.y>=t.y-150&&p.y<t.y+size+150))present.push(t);
  }
  return present.sort((a,b)=>{
   const mx=bounds.x+bounds.width/2,my=bounds.y+bounds.height/2;
   return ((a.x+a.size/2-mx)**2+(a.y+a.size/2-my)**2)-
     ((b.x+b.size/2-mx)**2+(b.y+b.size/2-my)**2);
  });
 }
 function neighbors(tile,cells,halo=470){
  const xmin=tile.x-halo,xmax=tile.x+tile.size+halo,
    ymin=tile.y-halo,ymax=tile.y+tile.size+halo;
  return cells.filter(c=>{
   const p=worldPos(c);
   return p.x>=xmin&&p.x<=xmax&&p.y>=ymin&&p.y<=ymax;
  });
 }
 function create({size=SIZE,maxTiles=28,maxPixels=12500000}={}){
  size=clamp(Math.floor(size),256,1024);
  let cache=new Map();const retired=new Map(),queue=new Map();
  let signature='',family='',epoch=0,scheduled=false,inFlight=false,protectedIds=new Set(),
   stats={built:0,cacheHits:0,evicted:0,errors:0,lastMs:0,visible:0,pending:0,painted:0,stalePainted:0,pixels:0};
  let cells=[],build=()=>null,requestDraw=()=>{},stampForTile=()=>signature;
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
   dropCache();queue.clear();protectedIds.clear();
   signature='';family='';epoch++;scheduled=false;inFlight=false;
  }
  function configure(next,{worldCells,buildTile,redraw,family:nextFamily='',stampTile=null}){
   if(next!==signature){
    queue.clear();protectedIds.clear();epoch++;scheduled=false;inFlight=false;
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
  function schedule(){
   if(scheduled||inFlight||!queue.size)return;
   scheduled=true;const generation=epoch;
   const task=()=>{
    if(generation!==epoch)return;
    scheduled=false;
    const next=queue.entries().next().value;
    if(!next)return;
    const [id,t]=next;queue.delete(id);
     const expectedStamp=stampForTile(t);
    const t0=typeof performance!=='undefined'?performance.now():0;
    const complete=item=>{
     if(generation!==epoch){release(item);return;}
      if(expectedStamp!==stampForTile(t)){
       // A pixel-changing edit occurred during a background job.
       release(item);requestDraw();if(queue.size)schedule();return;
      }
     if(!item){
      cache.set(id,{raster:null,relief:null,pixels:0,stamp:expectedStamp});
     }else{
      const pixels=(item.raster?.canvas?.width||0)*(item.raster?.canvas?.height||0)+
       (item.raster?.waterLayer?.canvas?.width||0)*(item.raster?.waterLayer?.canvas?.height||0)+
       (item.raster?.landLayer?.canvas?.width||0)*(item.raster?.landLayer?.canvas?.height||0)+
       (item.relief?.canvas&&item.relief.canvas!==item.raster?.landLayer?.canvas?
        item.relief.canvas.width*item.relief.canvas.height:0);
      cache.set(id,{...item,pixels,stamp:expectedStamp});stats.pixels+=pixels;stats.built++;
     }
     trim();
     stats.lastMs=(typeof performance!=='undefined'?performance.now():0)-t0;
     requestDraw();
     if(queue.size)schedule();
    };
    const fail=error=>{
     if(generation!==epoch)return;
     stats.errors++;
     if(typeof console!=='undefined')console.error('Chunk '+id+' failed:',error);
     requestDraw();if(queue.size)schedule();
    };
    try{
     const output=build(t,neighbors(t,cells));
     if(output&&typeof output.then==='function'){
      inFlight=true;
      output.then(item=>{
       if(generation===epoch)inFlight=false;
       complete(item);
      },err=>{
       if(generation===epoch)inFlight=false;
       fail(err);
      });
     }else complete(output);
    }catch(err){fail(err);}
   };
   if(typeof requestIdleCallback==='function')requestIdleCallback(task,{timeout:250});
   else if(typeof setTimeout==='function')setTimeout(task,0);
   else task();
  }
  function draw(ctx,bounds,{water=true,drawRaster,margin=80}={}){
   const viewport={x:bounds.x-margin,y:bounds.y-margin,width:bounds.width+2*margin,
    height:bounds.height+2*margin};
   const tiles=visible(viewport,cells,size);
   stats.visible=tiles.length;stats.painted=0;stats.stalePainted=0;
   protectedIds=new Set(tiles.map(t=>t.id));trim();
   // Remove tiles that a changed camera no longer needs. Old cached tiles
   // remain until LRU eviction, allowing cheap return-pans.
   const keep=new Set(tiles.map(t=>t.id));
   for(const id of [...queue.keys()])if(!keep.has(id))queue.delete(id);
   for(const t of tiles){
    let result=use(t.id);
    if(result&&result.stamp!==stampForTile(t)){
     cache.delete(t.id);stats.pixels-=result.pixels||0;release(result);result=null;
    }
    if(!result&&!queue.has(t.id))queue.set(t.id,t);
    const fallback=!result?[...retired.values()].reverse().map(m=>m.get(t.id)).
      find(v=>v&&(v.relief||v.raster?.canvas||v.raster?.waterLayer)):null;
    const artwork=result||fallback;
    if(!artwork||!ctx||!drawRaster)continue;
    // Each terrain raster is built WITH a world-space halo. Allow adjacent
    // chunks to overlap by two world units rather than clipping on exactly
    // the same fractional screen pixel. This avoids hairline square seams
    // under fractional zoom/DPR without changing PNGs or terrain coordinates.
    const bleed=2;
    ctx.save();ctx.beginPath();ctx.rect(t.x-bleed,t.y-bleed,size+2*bleed,size+2*bleed);ctx.clip();
    if(water&&artwork.raster?.waterLayer)drawRaster(ctx,artwork.raster.waterLayer);
    if(artwork.relief)drawRaster(ctx,artwork.relief);
    else if(artwork.raster)drawRaster(ctx,artwork.raster);
    ctx.restore();stats.painted++;if(fallback)stats.stalePainted++;
   }
   stats.pending=queue.size+(inFlight?1:0);
   schedule();
   return {...stats,cached:cache.size,variants:retired.size};
  }
  return {configure,draw,clear,stats:()=>({...stats,cached:cache.size,variants:retired.size}),
   has:id=>cache.has(id),pending:()=>queue.size};
 }
 return {SIZE,HALO,tile,worldPos,neighbors,visible,intersects,create};
})();

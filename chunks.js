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
  const cache=new Map(),queue=new Map();
  let signature='',epoch=0,scheduled=false,protectedIds=new Set(),stats={built:0,cacheHits:0,evicted:0,errors:0,lastMs:0,visible:0,pending:0,painted:0,pixels:0};
  let cells=[],build=()=>null,requestDraw=()=>{};
  function clear(){
   cache.clear();queue.clear();protectedIds.clear();stats.pixels=0;
   signature='';epoch++;scheduled=false;
  }
  function configure(next,{worldCells,buildTile,redraw}){
   if(next!==signature){cache.clear();queue.clear();protectedIds.clear();stats.pixels=0;signature=next;epoch++;scheduled=false;}
   cells=worldCells||[];build=buildTile;requestDraw=redraw||(()=>{});
  }
  function use(k){
   const data=cache.get(k);
   if(data){cache.delete(k);cache.set(k,data);stats.cacheHits++;}
   return data;
  }
  function trim(){
   while(cache.size>maxTiles||stats.pixels>maxPixels){
    // Do not discard an on-screen tile to make room for the next on-screen
    // tile: doing so would create a permanent idle-build/evict/flicker loop.
    const oldest=[...cache.keys()].find(id=>!protectedIds.has(id));
    if(oldest===undefined)break;
    const value=cache.get(oldest);
    stats.pixels-=value.pixels;
    cache.delete(oldest);stats.evicted++;
   }
  }
  function schedule(){
   if(scheduled||!queue.size)return;
   scheduled=true;const generation=epoch;
   const task=()=>{
    scheduled=false;
    if(generation!==epoch)return;
    const next=queue.entries().next().value;
    if(!next)return;
    const [id,t]=next;queue.delete(id);
    try{
     const t0=typeof performance!=='undefined'?performance.now():0;
     const item=build(t,neighbors(t,cells));
     if(generation!==epoch)return;
     if(!item){
      // Empty or fully oceanless/forestless chunk: cache the absence too.
      // Otherwise a persistent missing tile is rebuilt on every pan/frame.
      cache.set(id,{raster:null,relief:null,pixels:0});
      trim();
     }else{
      // Count all offscreen tile canvases, including water/land and relief;
      // eviction releases entire image groups together.
      const pixels=(item.raster?.canvas?.width||0)*(item.raster?.canvas?.height||0)+
       (item.raster?.waterLayer?.canvas?.width||0)*(item.raster?.waterLayer?.canvas?.height||0)+
       (item.raster?.landLayer?.canvas?.width||0)*(item.raster?.landLayer?.canvas?.height||0)+
       (item.relief?.canvas&&item.relief.canvas!==item.raster?.landLayer?.canvas?
        item.relief.canvas.width*item.relief.canvas.height:0);
      cache.set(id,{...item,pixels});
      stats.pixels+=pixels;trim();stats.built++;
     }
     stats.lastMs=(typeof performance!=='undefined'?performance.now():0)-t0;
    }catch(e){stats.errors++;if(typeof console!=='undefined')console.error('Chunk '+id+' failed:',e);}
    requestDraw();
    if(queue.size)schedule();
   };
   if(typeof requestIdleCallback==='function')requestIdleCallback(task,{timeout:250});
   else if(typeof setTimeout==='function')setTimeout(task,0);
   else task();
  }
  function draw(ctx,bounds,{water=true,drawRaster,margin=80}={}){
   const viewport={x:bounds.x-margin,y:bounds.y-margin,width:bounds.width+2*margin,
    height:bounds.height+2*margin};
   const tiles=visible(viewport,cells,size);
   stats.visible=tiles.length;stats.painted=0;
   protectedIds=new Set(tiles.map(t=>t.id));trim();
   // Remove tiles that a changed camera no longer needs. Old cached tiles
   // remain until LRU eviction, allowing cheap return-pans.
   const keep=new Set(tiles.map(t=>t.id));
   for(const id of [...queue.keys()])if(!keep.has(id))queue.delete(id);
   for(const t of tiles){
    const result=use(t.id);
    if(!result){if(!queue.has(t.id))queue.set(t.id,t);continue;}
    if(!ctx||!drawRaster)continue;
    ctx.save();ctx.beginPath();ctx.rect(t.x,t.y,size,size);ctx.clip();
    if(water&&result.raster?.waterLayer)drawRaster(ctx,result.raster.waterLayer);
    if(result.relief)drawRaster(ctx,result.relief);
    else if(result.raster)drawRaster(ctx,result.raster);
    ctx.restore();stats.painted++;
   }
   stats.pending=queue.size;
   schedule();
   return {...stats,cached:cache.size};
  }
  return {configure,draw,clear,stats:()=>({...stats,cached:cache.size}),
   has:id=>cache.has(id),pending:()=>queue.size};
 }
 return {SIZE,HALO,tile,worldPos,neighbors,visible,intersects,create};
})();

/* Vedras Reiche v0.20 – reusable real-time camera compositor.
 * Pure presentation: no terrain/river/shadow calculation on the pan path.
 * The editor supplies snapshots from its existing high-quality scene render.
 * A game can instead supply immutable world-space tiles (setTile/removeTile).
 * Both paths support the same camera, DPR, clipping and optional live overlay.
 */
'use strict';
window.VedrasRealtimeMap=(()=>{
 const ORDER=['ground','terrain','scenery','structures','units','overlay'];
 const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
 const valid=n=>Number.isFinite(n);
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function create({canvas,maxTiles=128,maxPixels=12000000}={}){
  if(!canvas||typeof canvas.getContext!=='function')throw Error('RealtimeMap requires a canvas');
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)throw Error('RealtimeMap requires Canvas2D');
  const tiles=new Map();
  let snapshots=[],tick=0,pixels=0,draws=0,lastMs=0,lastCoverage=0,
   lastTiles=0,evictions=0,invalidFrames=0,visible=false,frameWidth=0,frameHeight=0;
  function release(tile){
   if(tile?.owned&&typeof tile.image?.close==='function')tile.image.close();
  }
  function clearTiles(){
   for(const tile of tiles.values())release(tile);
   tiles.clear();pixels=0;
  }
  function clear(){
   clearTiles();snapshots=[];hide();
  }
  function hide(){
   visible=false;
   if(canvas.style)canvas.style.display='none';
  }
  function show(){
   visible=true;
   if(canvas.style)canvas.style.display='block';
  }
  function setSnapshots(layers){
   snapshots=Array.isArray(layers)?layers.filter(s=>
    s?.canvas?.width>0&&s.canvas.height>0&&valid(s.zoom)&&s.zoom>0&&
    valid(s.dpr)&&s.dpr>0&&valid(s.width)&&valid(s.height)&&
    valid(s.panX)&&valid(s.panY)&&valid(s.pad)&&s.pad>=0
   ).map(s=>({...s})):[];
   return snapshots.length;
  }
  function snapshotReady(){return snapshots.length>0&&snapshots[0].role==='ground';}
  function putTile(input){
   if(!input||typeof input.id!=='string'||!input.id||
    !input.image||!valid(input.x)||!valid(input.y)||
    !(input.width>0)||!(input.height>0))
    throw Error('Invalid world tile');
   const layer=ORDER.includes(input.layer)?input.layer:'terrain';
   const id=layer+':'+input.id;
   const old=tiles.get(id);
   if(old){pixels-=old.pixels;if(old.image!==input.image)release(old);tiles.delete(id);}
   const count=Math.max(0,(input.image.width||0)*(input.image.height||0));
   tiles.set(id,{...input,layer,pixels:count,used:++tick});
   pixels+=count;
   trim(new Set());
  }
  function removeTile(layer,id){
   const k=layer+':'+id,t=tiles.get(k);
   if(!t)return false;
   tiles.delete(k);pixels-=t.pixels;release(t);return true;
  }
  function trim(protectedIds){
   while((tiles.size>maxTiles||pixels>maxPixels)&&tiles.size){
    const candidate=[...tiles.entries()].filter(([id])=>!protectedIds.has(id))
      .sort((a,b)=>a[1].used-b[1].used)[0];
    if(!candidate)break;
    const [id,item]=candidate;
    tiles.delete(id);pixels-=item.pixels;release(item);evictions++;
   }
  }
  function ensureSize(v){
   const pxWidth=Math.max(1,Math.round(v.width*v.dpr));
   const pxHeight=Math.max(1,Math.round(v.height*v.dpr));
   if(canvas.width!==pxWidth||canvas.height!==pxHeight){
    canvas.width=pxWidth;canvas.height=pxHeight;
   }
   frameWidth=v.width;frameHeight=v.height;
  }
  // Clip before drawImage: avoid sampling an entire multi-megapixel atlas
  // when the camera only displays a small section of it.
  function paintImage(image,dx,dy,dw,dh,width,height){
   if(!image?.width||!image.height||!valid(dx)||!valid(dy)||
    !(dw>0)||!(dh>0))return 0;
   const x0=Math.max(0,dx),y0=Math.max(0,dy),
    x1=Math.min(width,dx+dw),y1=Math.min(height,dy+dh);
   if(x1<=x0||y1<=y0)return 0;
   const sx=(x0-dx)/dw*image.width,sy=(y0-dy)/dh*image.height,
    sw=(x1-x0)/dw*image.width,sh=(y1-y0)/dh*image.height;
   ctx.drawImage(image,sx,sy,sw,sh,x0,y0,x1-x0,y1-y0);
   return (x1-x0)*(y1-y0);
  }
  function render(view,{background='#879a81',drawDynamic=null}={}){
   if(!view||!(view.zoom>0)||!(view.dpr>0)||
    !(view.width>0)||!(view.height>0)||
    !valid(view.panX)||!valid(view.panY))return false;
   const t0=now();
   ensureSize(view);
   ctx.setTransform(view.dpr,0,0,view.dpr,0,0);
   ctx.globalAlpha=1;ctx.clearRect(0,0,view.width,view.height);
   ctx.fillStyle=background;ctx.fillRect(0,0,view.width,view.height);
   ctx.imageSmoothingEnabled=true;
   ctx.imageSmoothingQuality='high';
   let groundArea=0,drawn=0;
   if(snapshots.length){
    for(const s of snapshots){
     // Entry canvas has logical extent [width+2pad,height+2pad] and a
     // world origin at (width/2+pad+panX, height/2+pad+panY).
     const scale=view.zoom/s.zoom,
      dx=view.width/2+view.panX-(s.width/2+s.pad+s.panX)*scale,
      dy=view.height/2+view.panY-(s.height/2+s.pad+s.panY)*scale,
      area=paintImage(s.canvas,dx,dy,s.canvas.width/s.dpr*scale,
       s.canvas.height/s.dpr*scale,view.width,view.height);
     if(area){drawn++;if(s.role==='ground')groundArea+=area;}
    }
   }else{
    const proj=valid(view.projectY)?view.projectY:1;
    const entries=[...tiles.entries()].sort((a,b)=>
     ORDER.indexOf(a[1].layer)-ORDER.indexOf(b[1].layer));
    const protectedIds=new Set();
    for(const [id,t] of entries){
     const dx=view.width/2+view.panX+t.x*view.zoom,
      dy=view.height/2+view.panY+t.y*view.zoom*proj,
      area=paintImage(t.image,dx,dy,t.width*view.zoom,
       t.height*view.zoom*proj,view.width,view.height);
     if(area){
      drawn++;protectedIds.add(id);t.used=++tick;
      if(t.layer==='ground'||t.layer==='terrain')groundArea+=area;
     }
    }
    trim(protectedIds);
   }
   if(typeof drawDynamic==='function'){
    ctx.save();
    try{drawDynamic(ctx,view);}finally{ctx.restore();}
   }
   draws++;lastTiles=drawn;lastCoverage=clamp(groundArea/(view.width*view.height),0,1);
   lastMs=now()-t0;
   return {drawn,coverage:lastCoverage,renderMs:lastMs};
  }
  function stats(){return {visible,mode:snapshots.length?'snapshots':'tiles',
   snapshotLayers:snapshots.length,tiles:tiles.size,
   tilePixels:pixels,tileBytes:pixels*4,budgetBytes:maxPixels*4,
   draws,renderMs:lastMs,drawn:lastTiles,coverage:lastCoverage,
   evictions,invalidFrames,width:frameWidth,height:frameHeight};}
  return {render,setSnapshots,snapshotReady,putTile,removeTile,
   clearTiles,clear,hide,show,stats};
 }
 return {create};
})();

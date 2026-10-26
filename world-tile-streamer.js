/* Vedras Reiche v0.22.0 – retained, world-aligned tile compositor.
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
   concurrency=1,onReady=()=>{}}={}){
  if(!canvas?.getContext)throw Error('WorldTiles requires canvas');
  const g=canvas.getContext('2d',{alpha:true});
  if(!g)throw Error('WorldTiles requires Canvas2D');
  const cache=new Map(),queue=new Map(),running=new Map();
  let epoch=0,serial=0,used=0,pixels=0,evicted=0,completed=0,
   failed=0,lastMs=0,lastCoverage=0,lastLod='mid',painted=0,
   fogCells=[],visibleTiles=[],wantedTiles=new Set(),
   lod='mid',lastView=null,frame=0;
  const key=(t,l)=>t.id+'@'+l;
  function release(packet){
   for(const layer of packet?.layers||[])
    if(layer.owned&&typeof layer.image?.close==='function')layer.image.close();
  }
  function invalidate(){
   epoch++;for(const task of running.values())task.controller?.abort?.();
   running.clear();queue.clear();
   for(const item of cache.values())release(item.packet);
   cache.clear();pixels=0;visibleTiles=[];fogCells=[];wantedTiles.clear();
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
   if(old){pixels-=old.pixels;release(old.packet);}
   const count=normalized.reduce((n,x)=>n+x.image.width*x.image.height,0);
   cache.set(k,{tile:{...tile},packet:{layers:normalized},pixels:count,
    used:++used,born:clock(),revision:packet.revision??null});
   pixels+=count;completed++;trim(new Set(visibleTiles.map(t=>key(t,lod))));
   onReady();return true;
  }
  function seed(tile,level,packet){return accept(tile,level,packet);}
  function pump(){
   if(typeof source!=='function')return;
   while(running.size<concurrency&&queue.size){
    const item=queue.values().next().value;
    queue.delete(item.key);
    if(item.epoch!==epoch)continue;
    const controller=typeof AbortController!=='undefined'?new AbortController():null;
    const token=++serial;
    running.set(item.key,{controller,epoch:item.epoch,token});
    // Yield before expensive loader initialization; in production, the
    // loader should fetch a prepared server/CDN image or use a worker.
    Promise.resolve().then(()=>source(item.tile,item.level,{signal:controller?.signal,
     density:density[item.level]})).then(packet=>{
      if(item.epoch!==epoch||controller?.signal?.aborted||
        !wantedTiles.has(item.key)){release(packet);return;}
      if(packet)accept(item.tile,item.level,packet);
    }).catch(err=>{
      if(item.epoch===epoch&&err?.name!=='AbortError'){failed++;
       if(typeof console!=='undefined')console.warn('World tile:',err);}
    }).finally(()=>{
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
   for(const [k,item] of queue)if(!wanted.has(k))queue.delete(k);
   for(const [k,task] of running)if(!wanted.has(k)){
    task.controller?.abort?.();running.delete(k);
   }
   const midX=(-view.panX)/view.zoom,midY=(-view.panY)/(view.zoom*(view.projectY||1));
   const sorted=[...visibleTiles].sort((a,b)=>
    (a.x+a.size/2-midX)**2+(a.y+a.size/2-midY)**2-
    (b.x+b.size/2-midX)**2-(b.y+b.size/2-midY)**2);
   for(const t of sorted){
    const k=key(t,lod);
    if(cache.has(k)||running.has(k)||queue.has(k))continue;
    // A new LOD never hides a cached old variant.
    queue.set(k,{key:k,tile:t,level:lod,epoch});
   }
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
  function drawImage(image,x,y,w,h,view){
   const x0=clamp(x,0,view.width),x1=clamp(x+w,0,view.width),
    y0=clamp(y,0,view.height),y1=clamp(y+h,0,view.height);
   if(x1<=x0||y1<=y0)return 0;
   g.drawImage(image,(x0-x)/w*image.width,(y0-y)/h*image.height,
    (x1-x0)/w*image.width,(y1-y0)/h*image.height,
    x0,y0,x1-x0,y1-y0);
   return (x1-x0)*(y1-y0);
  }
  // One-time tileable soft cloud texture. No viewport-sized circles, no
  // per-frame pixel processing and no screen-dependent cloud geometry.
  let cloudPattern=null,cloudPatternAttempted=false;
  function prepareCloudPattern(){
   if(cloudPatternAttempted)return cloudPattern;
   cloudPatternAttempted=true;
   if(typeof document==='undefined'||typeof g.createPattern!=='function')return null;
   try{
    const c=document.createElement('canvas');
    c.width=c.height=128;
    const cg=c.getContext('2d');
    const img=cg.createImageData(128,128),d=img.data;
    for(let y=0;y<128;y++)for(let x=0;x<128;x++){
     const a=x*2*Math.PI/128,b=y*2*Math.PI/128;
     // Every Fourier mode is periodic across the texture boundary.
     const wave=0.48+0.12*Math.sin(a+b*.0)+
      0.11*Math.sin(2*b-a)+0.09*Math.cos(3*a+2*b)+
      0.08*Math.sin(5*b-3*a)+0.04*Math.cos(7*a+8*b);
     const v=clamp(Math.round(187+wave*39),185,231),i=(y*128+x)*4;
     d[i]=v-3;d[i+1]=v+2;d[i+2]=v+5;d[i+3]=255;
    }
    cg.putImageData(img,0,0);
    cloudPattern=g.createPattern(c,'repeat');
   }catch(_){cloudPattern=null;}
   return cloudPattern;
  }
  function cloudRect(x,y,w,h,view=null){
   if(w<=0||h<=0)return;
   // This ALWAYS paints an opaque cloud foundation over the entire unknown
   // region. Fog banks are drawn only near known/unknown frontiers.
   g.globalAlpha=1;g.fillStyle='#c0ccd0';g.fillRect(x,y,w,h);
   const pattern=prepareCloudPattern();
   if(pattern){
    g.save();g.fillStyle=pattern;
    if(view){
     // World-anchored pattern: panning translates the cloud, not its shape.
     const offsetX=((view.width/2+view.panX)%128+128)%128;
     const offsetY=((view.height/2+view.panY)%128+128)%128;
     g.translate(offsetX,offsetY);
     g.fillRect(x-offsetX,y-offsetY,w,h);
    }else g.fillRect(x,y,w,h);
    g.restore();
   }
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
   cloudRect(0,0,view.width,view.height,view);
   // Draw terrain only inside known world HEX geometry, never a rectangular
   // green tile core outside the map. Unrepresented space stays cloudy.
   const proj=view.projectY||1,items=[];
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
      const area=drawImage(asset.image,obj.dx-pad*view.zoom,
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
    // Dim remembered land beneath rolling banks at the unknown frontier.
    for(const c of fog)if(c.visibility==='explored')fogHex(c,view);
    for(const c of fog)if(c.visibility!=='explored')fogHex(c,view,()=>{
     const px=Math.floor(c.x/512),py=Math.floor(c.y/512);
     return items.some(o=>o.t.x===px*512&&o.t.y===py*512&&
      o.item.packet.layers.some(v=>v.layer==='ground'||v.layer==='terrain'));
    });
   }
   painted=draws;frame++;lastMs=clock()-start;
   lastCoverage=clamp(covered/(view.width*view.height),0,1);
   if(fading)onReady(); // continue the cloud-dissolve transition via rAF
   return {renderMs:lastMs,coverage:lastCoverage,drawn:draws,lod,
    loaded:items.length,pending:queue.size+running.size};
  }
  function stats(){return {version:'0.22.0',fogFrontier:fogCells.filter(c=>c.frontier).length,tiles:cache.size,pixels,bytes:pixels*4,
   budgetBytes:maxPixels*4,evicted,completed,failed,pending:queue.size+running.size,
   inFlight:running.size,visible:visibleTiles.length,lod,
   renderMs:lastMs,coverage:lastCoverage,drawn:painted,frames:frame};}
  return {request,render,seed,setSource,setFogCells,chooseLod,invalidate,stats};
 }
 return {create};
})();

/* Vedras v0.16.0: panning reprojects prepared scenery instead of rerendering
 * hundreds of static sprites, shadow silhouettes and blur operations.
 * A zoom, scene edit, shadow profile change or a pan leaving the padded scene
 * raster rebuilds it. Final PNG exports always use the original renderer.
 */
'use strict';
window.VedrasStaticObjects=(()=>{
 function create({padding=420,maxPixels=12000000,minPadding=64}={}){
  let entry=null,builds=0,hits=0,misses=0,disabled=0;
  let lastBuildMs=0,lastCompositeMs=0;
  const clock=()=>typeof performance!=='undefined'?performance.now():Date.now();
  function clear(){entry=null;}
  function compatible(e,v){
   return !!e&&e.signature===v.signature&&e.width===v.width&&
    e.height===v.height&&e.dpr===v.dpr&&e.zoom===v.zoom&&
    Math.abs(v.panX-e.panX)<=e.pad*.86&&
    Math.abs(v.panY-e.panY)<=e.pad*.86;
  }
  function paint({ctx,view,signature,drawScene,gpu=null,preferGpu=false}){
   const v={...view,signature};
   if(!Number.isFinite(v.width)||!Number.isFinite(v.height)||!Number.isFinite(v.dpr)||
    v.width<=0||v.height<=0||v.dpr<=0)throw Error('Invalid scenery viewport');
   let rebuilt=false,buildMs=0;
   if(!compatible(entry,v)){
    misses++;
    // First fit the actual viewport, then reserve as much overscan as the
    // physical pixel budget permits. v0.16.0 disabled the entire cache on
    // high-resolution monitors if the fixed 440px border exceeded 6M px.
    const preferred=Math.max(64,Math.min(720,Math.ceil(padding)));
    const minimum=Math.max(0,Math.min(preferred,Math.ceil(minPadding)));
    const dimensions=pad=>{
     const width=v.width+pad*2,height=v.height+pad*2;
     const physicalWidth=Math.ceil(width*v.dpr),
      physicalHeight=Math.ceil(height*v.dpr);
     return {width,height,physicalWidth,physicalHeight,
      pixels:physicalWidth*physicalHeight};
    };
    const fits=pad=>{
     const d=dimensions(pad);
     return d.pixels<=maxPixels&&d.physicalWidth<=8192&&d.physicalHeight<=8192;
    };
    if(!fits(minimum)){
     const needed=dimensions(minimum),viewport=dimensions(0);
     disabled++;clear();gpu?.hide?.();
     drawScene({ctx,width:v.width,height:v.height,offscreen:false});
     return {cached:false,enabled:false,buildMs:0,compositeMs:0,
      mode:'direct',builds,hits,misses,
      reason:'viewport budget',requestedPixels:needed.pixels,
      viewportPixels:viewport.pixels,budgetPixels:maxPixels};
    }
    let pad=preferred;
    if(!fits(preferred)){
     let low=minimum,high=preferred;
     while(low<high){
      const probe=Math.ceil((low+high+1)/2);
      if(fits(probe))low=probe;else high=probe-1;
     }
     pad=low;
    }
    const {width,height,physicalWidth,physicalHeight}=dimensions(pad);
    const canvas=document.createElement('canvas');
    canvas.width=physicalWidth;canvas.height=physicalHeight;
    const g=canvas.getContext('2d',{alpha:true});
    if(!g){
     disabled++;clear();gpu?.hide?.();
     drawScene({ctx,width:v.width,height:v.height,offscreen:false});
     return {cached:false,enabled:false,buildMs:0,compositeMs:0,
      mode:'direct',builds,hits,misses,reason:'no Canvas2D'};
    }
    const begin=clock();
    g.setTransform(v.dpr,0,0,v.dpr,0,0);
    // The renderer temporarily uses a canvas wider/taller by 2*pad.
    // Its camera-centered mapping therefore adds exactly pad in each axis.
    drawScene({ctx:g,width,height,offscreen:true});
    buildMs=clock()-begin;lastBuildMs=buildMs;
    entry={canvas,pad,width:v.width,height:v.height,
     dpr:v.dpr,zoom:v.zoom,signature,panX:v.panX,panY:v.panY,
     buildMs,objectProfile:typeof window!=='undefined'?window.__vedrasObjectProfile:null};
    rebuilt=true;builds++;
   }else hits++;
   const dx=v.panX-entry.panX-entry.pad,dy=v.panY-entry.panY-entry.pad;
   const compositeStart=clock();
   let mode='canvas';
   // GPU path is optional. It uploads only on scene rebuild, then moves
   // a single premultiplied scene texture quad for subsequent camera pans.
   if(preferGpu&&gpu?.draw?.(entry.canvas,{
    width:v.width,height:v.height,dpr:v.dpr,dx,dy,
    worldWidth:entry.canvas.width/v.dpr,
    worldHeight:entry.canvas.height/v.dpr
   })===true)mode='webgl';
   else{
    gpu?.hide?.();
    ctx.drawImage(entry.canvas,dx,dy,
     entry.canvas.width/v.dpr,entry.canvas.height/v.dpr);
   }
   lastCompositeMs=clock()-compositeStart;
   return {cached:!rebuilt,enabled:true,rebuilt,buildMs,
    compositeMs:lastCompositeMs,mode,builds,hits,misses,
    bytes:entry.canvas.width*entry.canvas.height*4,
    pad:entry.pad,requestedPixels:entry.canvas.width*entry.canvas.height,
    budgetPixels:maxPixels,objectProfile:entry.objectProfile};
  }
  function stats(){return {builds,hits,misses,disabled,lastBuildMs,
   lastCompositeMs,bytes:entry?entry.canvas.width*entry.canvas.height*4:0,
   active:!!entry};}
  return {paint,clear,stats};
 }
 return {create};
})();

/* Phase 2.8u: ORIGINAL app.js shadowLocalMask geometry, bounded isolated
 * diagnostic mode. The editor does NOT paintMountain at full tile scale:
 * it caches a <=320px low-res local mask and draws it scaled at the
 * mountain origin. Do not enable this for the production atlas.
 *
 * Formula references app.js: shadowLocalMask(width,settings,global)
 * and drawMountainShadows(objects); an independent browser source extraction
 * verifies these same original functions, not a copied assertion.
 */
(function(root){
"use strict";
const SCHEMA="vedras-editor-local-mountain-shadow-mask-v1";
const MAX_WIDTH=3400,MAX_PIXELS=5500000;
function raster({width,settings,strength,canvasFactory,
 shadows=root.VedrasShadows}={}){
 if(!(width>0&&width<=3200)||!Number.isFinite(width+strength)||
  !settings||!(settings.softness>=0)||!(settings.contactWidth>=0)||
  typeof canvasFactory!=="function"||
  typeof shadows?.mountainShape!=="function"||
  typeof shadows?.paintMountain!=="function")
  throw Error("Editor-Lokalmaske benötigt echte Berggeometrie und Original-Schattenengine.");
 // Exact app.js low-resolution raster width, scaled softness, and crop.
 const factor=Math.min(.60,320/Math.max(width,1)),w=width*factor,
  cfg={...settings,softness:settings.softness*factor},
  shape=shadows.mountainShape({x:0,y:0},w,cfg),
  r=Math.max(...shape.radius,w*cfg.contactWidth),
  pad=r+Math.max(5,cfg.softness)*1.3,
  left=Math.floor(Math.min(0,shape.p2.x)-pad)-2,
  top=Math.floor(Math.min(0,shape.p2.y)-pad)-2,
  right=Math.ceil(w*.045+3),
  bottom=Math.ceil(Math.max(0,shape.p2.y)+pad)+2;
 const rw=Math.max(1,right-left),rh=Math.max(1,bottom-top);
 if(!(rw>0&&rh>0&&rw<=MAX_WIDTH&&rh<=MAX_WIDTH&&rw*rh<=MAX_PIXELS))
  throw Error("Editor-Lokalmaske überschreitet den Pixelrahmen.");
 const canvas=canvasFactory();canvas.width=rw;canvas.height=rh;
 const ctx=canvas.getContext("2d",{willReadFrequently:true});
 if(!ctx?.getImageData||!ctx?.putImageData)
  throw Error("Editor-Lokalmaske benötigt natives ImageData-Canvas.");
 const stats=shadows.paintMountain(ctx,{x:-left,y:-top},w,cfg,strength);
 if(!stats||!Number.isFinite(stats.maxAlpha)||!Number.isFinite(stats.positiveCount))
  throw Error("Editor-Lokalmaske erfordert originale Shadow-Engine-Statistik.");
 return {schema:SCHEMA,canvas,factor,left,top,
  maxAlpha:stats.maxAlpha,positiveCount:stats.positiveCount,
  fullWidth:width,rasterWidth:w,
  complete:false,readyForViewer:false};
}
function cast({raster:mask,origin}={}){
 if(!mask?.canvas||!(mask.factor>0)||
  !Number.isFinite(origin?.x+origin?.y))
  throw Error("Editor-Lokalmaske braucht Bergschattenursprung.");
 const x=origin.x+mask.left/mask.factor,
  y=origin.y+mask.top/mask.factor,
  width=mask.canvas.width/mask.factor,
  height=mask.canvas.height/mask.factor;
 if(!Number.isFinite(x+y+width+height)||!(width>0&&height>0))
  throw Error("Editor-Cast außerhalb der originalen Berggeometrie.");
 return {canvas:mask.canvas,x,y,width,height,
  complete:false,readyForViewer:false};
}
function globalBox({cast:c,padding=2}={}){
 if(!(c?.width>0&&c?.height>0)||
  !Number.isFinite(c.x+c.y+c.width+c.height)||
  !Number.isSafeInteger(padding)||padding<0||padding>4)
  throw Error("Editor-Lokalmaske braucht begrenzte globale Grenzen.");
 const left=Math.floor(c.x)-padding,
  top=Math.floor(c.y)-padding,
  right=Math.ceil(c.x+c.width)+padding,
  bottom=Math.ceil(c.y+c.height)+padding,
  width=right-left,height=bottom-top;
 if(width>MAX_WIDTH||height>MAX_WIDTH||width*height>MAX_PIXELS)
  throw Error("Editor-Cast überschreitet die globale Rastergrenze.");
 return {left,top,width,height};
}
const api={SCHEMA,raster,cast,globalBox};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasEditorLocalMountainMask=api;
})(typeof window!=="undefined"?window:globalThis);

/* Phase 2.8t: independent read-only source-over alpha A/B experiment.
 * Input is REAL globally anchored ORIGINAL sprite scratch pixels, not a
 * changed Nature PNG, replacement editor canvas or a viewer atlas.
 *
 * Candidate modes are measured, NEVER enabled in the production renderer.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-alpha-source-over-ab-v1";
const MAX_PIXELS=3500000,MAX_PATCH_BYTES=48000000,MAX_PATCHES=36;
const round=x=>Math.max(0,Math.min(255,Math.round(x)));
function validate({width,height,originX,originY,background,sprites,mode}={}){
 if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||
  width<1||height<1||width*height>MAX_PIXELS||
  !Number.isSafeInteger(originX)||!Number.isSafeInteger(originY))
  throw Error("Alpha-A/B benötigt begrenzte globale Canvas-Maße.");
 if(!(background instanceof Uint8ClampedArray)||
  background.length!==width*height*4)
  throw Error("Alpha-A/B benötigt Originalhintergrund mit echten RGBA-Pixeln.");
 if(!["straight-rounded","premultiplied-byte"].includes(mode))
  throw Error("Alpha-A/B benötigt einen expliziten ungeförderten Rundungsmodus.");
 if(!Array.isArray(sprites)||sprites.length>MAX_PATCHES)
  throw Error("Alpha-A/B überschreitet die ursprüngliche Sprite-Objektgrenze.");
 let bytes=0;
 for(const s of sprites){
  if(!s||!Number.isSafeInteger(s.x)||!Number.isSafeInteger(s.y)||
   !Number.isSafeInteger(s.width)||!Number.isSafeInteger(s.height)||
   !(s.width>0&&s.height>0&&s.width*s.height<=6500000)||
   !(s.rgba instanceof Uint8ClampedArray)||
   s.rgba.length!==s.width*s.height*4)
   throw Error("Alpha-A/B Sprite-Patch ist unvollständig.");
  bytes+=s.rgba.length;
  if(bytes>MAX_PATCH_BYTES)throw Error("Alpha-A/B überschreitet das Sprite-Speicherbudget.");
 }
}
function sourceOver(dst,i,src,j,mode){
 const sa=src[j+3];
 if(!sa)return;
 if(sa===255||dst[i+3]===0){
  dst[i]=src[j];dst[i+1]=src[j+1];dst[i+2]=src[j+2];
  dst[i+3]=sa;return;
 }
 const da=dst[i+3],remain=(255-sa)/255,
  alpha=sa+da*remain,oa=round(alpha);
 if(mode==="straight-rounded"){
  for(let c=0;c<3;c++)
   dst[i+c]=round((src[j+c]*sa+dst[i+c]*da*remain)/alpha);
 }else{
  for(let c=0;c<3;c++){
   const sp=round(src[j+c]*sa/255),
    dp=round(dst[i+c]*da/255),
    op=sp+round(dp*remain);
   dst[i+c]=round(op*255/oa);
  }
 }
 dst[i+3]=oa;
}
function render(args={}){
 validate(args);
 const {width,height,originX,originY,background,sprites,mode}=args;
 const output=new Uint8ClampedArray(background);
 let touched=0,patches=0;
 for(const s of sprites){
  const x0=Math.max(originX,s.x),x1=Math.min(originX+width,s.x+s.width),
   y0=Math.max(originY,s.y),y1=Math.min(originY+height,s.y+s.height);
  if(x0>=x1||y0>=y1)continue;
  patches++;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
   const srcIndex=((y-s.y)*s.width+(x-s.x))*4;
   if(!s.rgba[srcIndex+3])continue;
   const dstIndex=((y-originY)*width+(x-originX))*4;
   sourceOver(output,dstIndex,s.rgba,srcIndex,mode);
   touched++;
  }
 }
 return {schema:SCHEMA,mode,width,height,data:output,
  patches,touched,complete:false,readyForViewer:false};
}
const api={SCHEMA,render};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasAlphaSourceOverAB=api;
})(typeof window!=="undefined"?window:globalThis);

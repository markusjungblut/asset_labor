/* Phase 2.8o: isolate the editor's exact sprite DISPLAY projection for a
 * read-only, real-PNG parity experiment. This deliberately DOES NOT replace
 * any existing 2.5x WorldTile renderer, release gate or canonical atlas.
 *
 * In app.js toScreen() projects the object's GROUND FOOT by PROJECT_Y=.85,
 * while drawSprite() uses width*croppedAspect as the UNPROJECTED image height.
 * Applying PROJECT_Y again to the image body is NOT editor parity.
 */
(function(root){
"use strict";
const SCHEMA="vedras-editor-reference-sprite-projection-v1";
const SHEAR=.012,VERTICAL=.965;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function geometry({object,scale=2.5,projectY=.85}={}){
 const g=object?.g,item=object?.item,b=g?.b;
 if(!item?.p||!b||!object?.img||
  !Number.isFinite(item.p.x)||!Number.isFinite(g.y)||
  !Number.isFinite(g.width)||!(g.width>0)||
  !(b.sw>0&&b.sh>0&&scale>0&&projectY>0))
  throw Error("Editor-Referenz benötigt Original-PNG, Crop und Weltfuß.");
 const anchor=item.meta?.anchor||{x:.5,y:item.type==="mountain"?.67:.96},
  ax=clamp(Number(anchor.x??.5),0,1),
  ay=clamp(Number(anchor.y??.96),0,1);
 if(!Number.isFinite(ax+ay))throw Error("Editor-Referenz: Anker ungültig.");
 const footX=item.p.x*scale,footY=g.y*scale*projectY,
  width=g.width*scale,height=width*b.sh/b.sw;
 if(!Number.isFinite(footX+footY+width+height))
  throw Error("Editor-Referenz: Bildgröße ungültig.");
 const left=footX-width*ax,top=footY-height*ay;
 return {footX,footY,width,height,left,top,ax,ay,
  // For auditing only: the legacy 2.5D PNG stack scaled sprite bodies too.
  legacyImageHeight:height*projectY,
  verticalBodyDifference:height*(1-projectY)};
}
// Conservative but globally deterministic post-perspective pixel envelope.
 // Floor/ceil on the GLOBAL lattice, never on an individual tile viewport.
function pixelBounds({object,scale=2.5,projectY=.85,padding=32}={}){
 const g=geometry({object,scale,projectY});
 if(!(Number.isFinite(padding)&&padding>=0&&padding<=256))
  throw Error("Editor-Referenz benötigt begrenztes Bounding-Padding.");
 let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
 for(const y of [g.top,g.top+g.height])
  for(const x of [g.left,g.left+g.width]){
   const sx=x+SHEAR*(y-g.footY);
   const sy=g.footY+VERTICAL*(y-g.footY);
   x0=Math.min(x0,sx);x1=Math.max(x1,sx);
   y0=Math.min(y0,sy);y1=Math.max(y1,sy);
  }
 return {left:Math.floor(x0-padding),top:Math.floor(y0-padding),
  right:Math.ceil(x1+padding),bottom:Math.ceil(y1+padding)};
}
function paint({object,ctx,canvasFactory,
 casts=[],scale=2.5,projectY=.85,
 dpr=2,naturePolish=.40,outputX=0,outputY=0,
 polish=root.VedrasPolish}={}){
 const geom=geometry({object,scale,projectY});
 if(!ctx?.save||!ctx?.restore||!ctx?.translate||
  !ctx?.transform||!ctx?.drawImage||!ctx?.setTransform||
  !Array.isArray(casts)||casts.length>96||
  typeof canvasFactory!=="function"||!Number.isFinite(outputX+outputY)||
  !(dpr>0&&dpr<=4)||typeof polish?.natureFilter!=="function")
  throw Error("Editor-Referenz benötigt Canvas2D und originale Nature-Filter.");
 const {item,img,g}=object,
  {footX,footY,width,height,left,top}=geom,
  filter=polish.natureFilter(item.meta,naturePolish);
 ctx.save();ctx.setTransform(1,0,0,1,-outputX,-outputY);
 if(!casts.length){
  ctx.globalCompositeOperation="source-over";ctx.filter=filter;
  ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.shadowColor="transparent";
  ctx.translate(footX,footY);
  ctx.transform(1,0,SHEAR,VERTICAL,0,0);
  ctx.translate(-footX,-footY);
  ctx.drawImage(img,g.b.sx,g.b.sy,g.b.sw,g.b.sh,
   left,top,width,height);
 }else{
  // EXACT app.js drawSprite() scratch budget and untransformed PNG pass.
  const pixelScale=Math.min(Math.max(1,dpr),2,
   Math.sqrt(6000000/Math.max(1,width*height)));
  const sw=Math.max(1,Math.ceil(width*pixelScale)),
   sh=Math.max(1,Math.ceil(height*pixelScale));
  if(!(sw*sh<=6100000))throw Error("Editor-Referenz überschreitet Scratch-Limit.");
  const scratch=canvasFactory();scratch.width=sw;scratch.height=sh;
  const c=scratch.getContext("2d");
  if(!c?.setTransform||!c?.drawImage)
   throw Error("Editor-Referenz-Scratch-Canvas unvollständig.");
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,sw,sh);
  c.setTransform(pixelScale,0,0,pixelScale,0,0);
  c.globalCompositeOperation="source-over";c.globalAlpha=1;
  c.shadowBlur=0;c.shadowColor="transparent";c.filter=filter;
  c.drawImage(img,g.b.sx,g.b.sy,g.b.sw,g.b.sh,
   0,0,width,height);
  c.filter="none";c.globalCompositeOperation="source-atop";
  for(const cast of casts){
   if(!cast?.canvas||!Number.isFinite(cast.x+cast.y+cast.width+cast.height))
    throw Error("Editor-Referenz-Cast unvollständig.");
   c.drawImage(cast.canvas,cast.x-left,cast.y-top,cast.width,cast.height);
  }
  ctx.globalCompositeOperation="source-over";ctx.filter="none";
  ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.shadowColor="transparent";
  ctx.translate(footX,footY);
  ctx.transform(1,0,SHEAR,VERTICAL,0,0);
  ctx.translate(-footX,-footY);
  ctx.drawImage(scratch,0,0,sw,sh,left,top,width,height);
 }
 ctx.restore();
 return {schema:SCHEMA,projection:"editor-foot-only-projectY",
  originalUnprojectedSpriteHeight:height,legacyBodyDifference:geom.verticalBodyDifference,
  casts:casts.length,source:"original-PNG-and-editor-display-formulas",
  complete:false,readyForViewer:false};
}
// This is a strict independent auditor of the SOURCE opacity test used
// in app.js mountainCoversBase(), not an alternate sprite placement system.
function occludes({plant,mountain,canvasFactory,
 scale=2.5,projectY=.85}={}){
 if(!plant?.item||!mountain?.item||!mountain?.img||
  typeof canvasFactory!=="function"||!(scale>0&&projectY>0))
  throw Error("Editor-Referenz-Bergverdeckung braucht zwei Originalobjekte.");
 if(plant.item.type==="mountain")return false;
 const g=mountain.g,img=mountain.img,b=g.b,
  width=g.width*scale,height=width*b.sh/b.sw,
  ax=g.ax??.5,ay=g.ay??.67,
  foot={x:plant.item.p.x*scale,
   y:plant.g.y*scale*projectY},
  p={x:mountain.item.p.x*scale,
   y:g.y*scale*projectY};
 const u=(foot.x-(p.x-width*ax))/width,
  v=(foot.y-(p.y-height*ay))/height;
 if(u<0||u>=1||v<0||v>=1)return false;
 const cv=canvasFactory();cv.width=cv.height=64;
 const context=cv.getContext("2d",{willReadFrequently:true});
 if(!context?.drawImage||!context?.getImageData)
  throw Error("Editor-Referenz-Alphamaske nicht lesbar.");
 context.drawImage(img,b.sx,b.sy,b.sw,b.sh,0,0,64,64);
 const alpha=context.getImageData(0,0,64,64).data;
 return alpha[(Math.min(63,Math.floor(v*64))*64+
  Math.min(63,Math.floor(u*64)))*4+3]>50;
}
const api={SCHEMA,geometry,pixelBounds,paint,occludes};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasEditorReferenceSprite=api;
})(typeof window!=="undefined"?window:globalThis);

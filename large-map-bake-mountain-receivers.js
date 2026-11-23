/* Phase 2.8n – native editor mountain casts ON original Nature sprites.
 * Eligibility is decided at the receiver's GROUND FOOT, never by a crown
 * touching a cast. The source-atop compositing occurs BEFORE the editor's
 * foot-anchored sprite perspective transform. The global pixel lattice is
 * shared between neighboring WorldTile samples. This is a PREVIEW, not a
 * full pixel-for-pixel editor scene parity claim.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-mountain-receivers-preview-v1";
const LIMIT_CASTS=96,LIMIT_SPRITE_PIXELS=6000000;
function southwestLargeReceiver(receiver,caster){
 if(receiver.item.type!=="mountain")return false;
 const a=receiver.item.inst,b=caster.item.inst;
 return a.q===b.q-1&&a.r===b.r+1;
}
function select({object,casts,shadows=root.VedrasShadows,
 scale=2.5,projectY=.85}={}){
 if(!object?.item||!object?.g||
  !Array.isArray(casts)||casts.length>LIMIT_CASTS||
  typeof shadows?.mountainAlphaAt!=="function"||
  !(scale>0&&projectY>0))
  throw Error("Bergschattenempfänger benötigt native Fußpunkt-Distanzfelder.");
 const x=object.item.p.x*scale,y=object.g.y*scale*projectY,
  g=object.g,left=g.left*scale,top=g.top*scale*projectY,
  right=left+g.width*scale,bottom=top+g.height*scale*projectY;
 if(!Number.isFinite(x+y+left+top+right+bottom))
  throw Error("Objektfuß des Schattenempfängers ungültig.");
 const selected=[];
 for(const cast of casts){
  if(!cast?.owner?.item||!cast.box||
   !(cast.modelWidth>0)||!cast.shape||!cast.canvas||
   !Number.isFinite(cast.peakAlpha))
   throw Error("Bergschattenmaske nicht aus nativer Engine.");
  if(cast.owner.item===object.item||
   southwestLargeReceiver(object,cast.owner)||
   cast.box.left>=right||cast.box.left+cast.box.width<=left||
   cast.box.top>=bottom||cast.box.top+cast.box.height<=top)
   continue;
  const alpha=shadows.mountainAlphaAt(
   x,y,cast.shape,cast.modelWidth,cast.strength);
  const threshold=Math.max(1/255,(cast.peakAlpha/255)*.08);
  if(alpha>threshold)selected.push(cast);
 }
 return selected;
}
function paint({object,selected,ctx,canvasFactory,
 scale=2.5,projectY=.85,spriteFilter="none",
 gx,gy,width,height}={}){
 if(!object?.img||!object?.g||!object?.item||
  !Array.isArray(selected)||!selected.length||
  !ctx?.setTransform||typeof canvasFactory!=="function"||
  !Number.isSafeInteger(gx)||!Number.isSafeInteger(gy)||
  !Number.isSafeInteger(width)||!Number.isSafeInteger(height)||
  !(width>0&&height>0&&width*height<=LIMIT_SPRITE_PIXELS))
  throw Error("Native Sprite-Schattenkomposition benötigt begrenztes Originalpixelraster.");
 const {img,g,item}=object;
 const layer=canvasFactory();layer.width=width;layer.height=height;
 const l=layer.getContext("2d",{alpha:true});
 if(!l?.setTransform||!l?.drawImage||!l?.save||!l?.restore)
  throw Error("Original-Objektlayer ohne vollständiges Canvas2D.");
 l.setTransform(scale,0,0,scale*projectY,-gx,-gy);
 l.save();l.globalAlpha=1;l.globalCompositeOperation="source-over";
 l.filter=spriteFilter;
 l.drawImage(img,g.b.sx,g.b.sy,g.b.sw,g.b.sh,
  g.left,g.top,g.width,g.height);
 l.restore();
 // Exactly like app.js drawSprite: crop the cast with source-atop so
 // transparent regions of the ORIGINAL sprite remain transparent.
 l.setTransform(1,0,0,1,0,0);
 l.globalAlpha=1;l.filter="none";
 l.globalCompositeOperation="source-atop";
 for(const cast of selected)
  l.drawImage(cast.canvas,cast.box.left-gx,cast.box.top-gy);
 l.globalCompositeOperation="source-over";
 ctx.save();
 // Foot-relative transform is applied ONLY AFTER casting onto the sprite.
 // Pixel-space shear compensates for the 0.85 world-to-output Y projection.
 const px=item.p.x*scale,py=g.y*scale*projectY;
 ctx.setTransform(1,0,0,1,-gx,-gy);
 ctx.translate(px,py);
 ctx.transform(1,0,.012/projectY,.965,0,0);
 ctx.translate(-px,-py);
 ctx.drawImage(layer,gx,gy);
 ctx.restore();
 return {schema:SCHEMA,received:true,casts:selected.length,
  sourceAtop:true,footChecked:true,prePerspective:true,
  complete:false,readyForViewer:false};
}
const api={SCHEMA,southwestLargeReceiver,select,paint};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapMountainReceivers=api;
})(typeof window!=="undefined"?window:globalThis);

/* Phase 2.8l – original editor mountain ground shadows in a bounded
 * global-pixel scratch. The ONLY shadow distance field and alpha-foot finder
 * are VedrasShadows.mountainShape/paintMountain/alphaFoot/mountainOrigin.
 * The generated world has no editor scene presets or per-hex overrides:
 * this isolated sample uses the editor's ORIGINAL built-in defaults and
 * deliberately keeps full editor parity and viewer release blocked.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-original-mountain-shadow-preview-v1";
const MAX_MOUNTAINS=96,MAX_SIDE=3400,MAX_PIXELS=5500000;
function bounds(sh,origin,width,cfg){
 const shape=sh.mountainShape(origin,width,cfg);
 const reach=Math.max(...shape.radius,width*cfg.contactWidth),
  margin=reach+Math.max(5,cfg.softness)*1.3;
 const left=Math.floor(Math.min(origin.x,shape.p2.x)-margin)-2,
  top=Math.floor(Math.min(origin.y,shape.p2.y)-margin)-2,
  right=Math.ceil(origin.x+width*.045+1)+2,
  bottom=Math.ceil(Math.max(origin.y,shape.p2.y)+margin)+2;
 return {left,top,width:right-left,height:bottom-top};
}
function paint({objects,output,tile,canvasFactory,
 shadows=root.VedrasShadows,tone=root.VedrasShadowTone,
 spriteShadows=root.VedrasSpriteShadows,
 scale=2.5,projectY=.85,pad=128,size=512}={}){
 const profile=spriteShadows?.get?.();
 if(!Array.isArray(objects)||objects.length>MAX_MOUNTAINS||
  !output?.getContext||!tile||typeof canvasFactory!=="function"||
  typeof shadows?.settings!=="function"||
  typeof shadows?.mountainShape!=="function"||
  typeof shadows?.alphaFoot!=="function"||
  typeof shadows?.mountainOrigin!=="function"||
  typeof shadows?.paintMountain!=="function"||
  typeof shadows?.globalStrength!=="function"||
  typeof tone?.targetAlpha!=="function"||
  !profile?.global||!profile?.profiles||
  !Object.keys(profile.profiles).length||
  !(scale>0&&projectY>0&&pad>=0&&size>0))
  throw Error("Original-Bergschatten benötigen die Editor-Engine und echte Schattenprofile.");
 const ctx=output.getContext("2d",{alpha:true});
 if(!ctx?.drawImage||!ctx?.setTransform)
  throw Error("Original-Bergschatten benötigen ein vollständiges Canvas2D.");
 const settings=shadows.settings(); // Authored editor defaults, NEVER sprite presets
 const strength=shadows.globalStrength(profile.global.strength);
 const outputX=Math.round((tile.x-pad)*scale),
  outputY=Math.round((tile.y-pad)*scale*projectY);
 const maxOffset=(pad+1250)*scale; // matches joint candidate halo
 const scratch=canvasFactory(),feet=new WeakMap();
 function alphaFoot(obj,anchor){
  const img=obj.img;
  let cached=feet.get(img);
  if(!cached){
   const b=obj.g.b,ratio=Math.min(1,512/Math.max(b.sw,b.sh));
   const canvas=canvasFactory();
   canvas.width=Math.max(8,Math.round(b.sw*ratio));
   canvas.height=Math.max(8,Math.round(b.sh*ratio));
   const g=canvas.getContext("2d",{willReadFrequently:true});
   if(!g?.drawImage||!g?.getImageData)
    throw Error("Original-Berg-PNG-Fußalpha kann nicht gelesen werden.");
   g.drawImage(img,b.sx,b.sy,b.sw,b.sh,
    0,0,canvas.width,canvas.height);
   cached={data:g.getImageData(0,0,canvas.width,canvas.height).data,
    width:canvas.width,height:canvas.height,byAnchor:new Map()};
   feet.set(img,cached);
  }
  const key=(anchor.x??.5)+","+(anchor.y??.67);
  if(!cached.byAnchor.has(key))
   cached.byAnchor.set(key,shadows.alphaFoot(
    cached.data,cached.width,cached.height,anchor));
  return cached.byAnchor.get(key);
 }
 let drawn=0,nonzeroPixels=0,onlyShadow=0,maxAlpha=0;
 for(const obj of objects){
  if(obj?.item?.type!=="mountain"||obj.item.meta?.kind!=="mountain")
   throw Error("Bergschattenliste enthält keine originalen Bergobjekte.");
  const g=obj.g,width=g.width*scale,
   aspect=g.b.sh/g.b.sw,
   anchor=obj.item.meta.anchor||{x:.5,y:.67};
  if(!(width>0&&aspect>0)||!Number.isFinite(width*aspect))
   throw Error("Ungültige originale Berg-PNG-Geometrie.");
  const p={x:obj.item.p.x*scale,y:g.y*scale*projectY},
   foot=alphaFoot(obj,anchor),
   origin=shadows.mountainOrigin(p,width,width*aspect,anchor,settings,foot);
  const box=bounds(shadows,origin,width,settings);
  if(!(box.width>0&&box.height>0)||
   box.width>MAX_SIDE||box.height>MAX_SIDE||
   box.width*box.height>MAX_PIXELS)
   throw Error("Original-Bergschatten überschreitet den begrenzten Rasterbereich.");
  if(Math.abs(box.left-p.x)>maxOffset||Math.abs(box.top-p.y)>maxOffset||
   Math.abs(box.left+box.width-p.x)>maxOffset||
   Math.abs(box.top+box.height-p.y)>maxOffset)
   throw Error("Bergschatten reicht über den geprüften Quell-Halo hinaus.");
  // Reject without rasterization when no pixel may reach the target tile.
  if(box.left>=outputX+output.width||
   box.left+box.width<=outputX||
   box.top>=outputY+output.height||
   box.top+box.height<=outputY)continue;
  scratch.width=box.width;scratch.height=box.height;
  const sc=scratch.getContext("2d",{willReadFrequently:true});
  if(!sc?.createImageData||!sc?.putImageData)
   throw Error("Natives Bergschatten-Distanzfeld erfordert ImageData.");
  const stats=shadows.paintMountain(sc,
   {x:origin.x-box.left,y:origin.y-box.top},
   width,settings,strength);
  if(!stats||!(stats.positiveCount>0))continue;
  // The local raster origin is an ABSOLUTE INTEGER global pixel.
  // Adjacent tiles copy precisely the same generated RGBA samples.
  ctx.save();ctx.setTransform(1,0,0,1,0,0);
  ctx.globalCompositeOperation="source-over";
  ctx.globalAlpha=1;
  ctx.drawImage(scratch,box.left-outputX,box.top-outputY);
  ctx.restore();
  drawn++;nonzeroPixels+=stats.positiveCount;
  maxAlpha=Math.max(maxAlpha,stats.maxAlpha);
  if(obj.shadowOnly===true)onlyShadow++;
 }
 return {schema:SCHEMA,source:"native-VedrasShadows-paintMountain",
  drawn,onlyShadow,nonzeroPixels,maxAlpha,
  defaultEditorSettings:true,needsAuthoredSceneOverrides:true,
  needsMountainSpriteReceiverParity:true,needsOriginalGroundIntegration:true,
  complete:false,readyForViewer:false};
}
const api={SCHEMA,bounds,paint};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapOriginalMountainShadows=api;
})(typeof window!=="undefined"?window:globalThis);

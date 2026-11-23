/* Phase 2.8k: ORIGINAL SpriteShadows, bounded global-pixel WorldTile preview.
 * No synthetic shadow geometry, atlas publication or mutations.
 * Mountain shadows remain excluded until the dedicated ground pass.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-sprite-shadow-preview-v1";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function bounds(p,w,h,anchor,x,family,kind){
 const ax=clamp(Number(anchor.x??.5),0,1),ay=clamp(Number(anchor.y??.96),0,1),
  log=["fallen_logs","snow_fallen_logs"].includes(family);
 let x0=p.x,x1=p.x,y0=p.y,y1=p.y;
 const add=(a,b)=>{x0=Math.min(x0,a);x1=Math.max(x1,a);
  y0=Math.min(y0,b);y1=Math.max(y1,b);};
 if(x.manual?.polygons?.length){
  for(const poly of x.manual.polygons)for(const [a,b] of poly)
   add(p.x+w*a,p.y+w*b);
  if(kind==="rock"&&x.contact>0){
   const xx=p.x+w*(x.offsetX-.10),yy=p.y+w*x.offsetY;
   add(xx-w*.23,yy-w*.075);add(xx+w*.23,yy+w*.075);
  }
 }else{
  const rad=x.angle*Math.PI/180,
   dx=w*x.length*Math.cos(rad),
   dy=w*x.length*Math.sin(rad)*(log?.14:.30),
   ox=p.x+w*x.offsetX,oy=p.y+w*x.offsetY,
   horizontal=clamp(x.width,.2,1.8);
  for(const a of [-w*ax,w*(1-ax)])
   for(const b of [-h*ay,0])
    add(ox+horizontal*a-dx*b/Math.max(h,1),
     oy+(log?.01:.035)*a-dy*b/Math.max(h,1));
  if(x.contact>0){
   const cx=ox+dx*(log?.40:.22),cy=oy+dy*(log?.36:.20),
    rx=w*(log?.53:.24)*Math.max(.25,x.width)*(1+x.contact),
    ry=w*(log?.075:.085)*(x.contact+.25),r=Math.max(rx,ry);
   add(cx-r,cy-r);add(cx+r,cy+r);
  }
 }
 const margin=Math.ceil(Math.max(0,x.softness)*3+10);
 const left=Math.floor(x0-margin),top=Math.floor(y0-margin),
  right=Math.ceil(x1+margin),bottom=Math.ceil(y1+margin);
 return {left,top,width:right-left,height:bottom-top};
}
function paint({objects,output,tile,canvasFactory,engine=root.VedrasSpriteShadows,
 tone=root.VedrasShadowTone,scale=2.5,projectY=.85,pad=128,size=512}={}){
 const source=engine?.get?.();
 if(!Array.isArray(objects)||!output?.getContext||!tile||
  typeof canvasFactory!=="function"||typeof engine?.draw!=="function"||
  typeof engine?.valid!=="function"||typeof engine?.profile!=="function"||
  !source?.global||!source?.profiles||
  !Object.keys(source.profiles).length||
  typeof tone?.withMaskPass!=="function"||
  typeof tone?.targetAlpha!=="function"||
  typeof tone?.colorCss!=="function")
  throw Error("Schattenprobe benötigt gespeicherte Original-Schattenprofile und Renderer.");
 engine.valid(source);
 const w=Math.round((size+pad*2)*scale),
  h=Math.round((size+pad*2)*scale*projectY);
 const mask=canvasFactory();mask.width=w;mask.height=h;
 const m=mask.getContext("2d",{alpha:true});
 const out=output.getContext("2d",{alpha:true});
 if(!m?.setTransform||!m?.drawImage||!out?.drawImage)
  throw Error("Schattenmaske erfordert vollständiges Canvas2D.");
 m.setTransform(1,0,0,1,0,0);
 const sx=Math.round((tile.x-pad)*scale),
  sy=Math.round((tile.y-pad)*scale*projectY);
 const scratch=canvasFactory(),silhouettes=new WeakMap();
 function silhouette(o){
  if(silhouettes.has(o.img))return silhouettes.get(o.img);
  const b=o.g.b,ratio=Math.min(1,512/Math.max(b.sw,b.sh));
  const cv=canvasFactory();cv.width=Math.max(8,Math.round(b.sw*ratio));
  cv.height=Math.max(8,Math.round(b.sh*ratio));
  const c=cv.getContext("2d",{alpha:true});
  if(!c?.drawImage||!c?.fillRect)throw Error("Original-Silhouette nicht verfügbar.");
  c.drawImage(o.img,b.sx,b.sy,b.sw,b.sh,0,0,cv.width,cv.height);
  c.globalCompositeOperation="source-in";
  c.fillStyle=tone.colorCss();c.fillRect(0,0,cv.width,cv.height);
  const result={canvas:cv,aspect:b.sh/b.sw};
  silhouettes.set(o.img,result);return result;
 }
 let drawn=0,manual=0,hidden=0;
 tone.withMaskPass(()=>{
  for(const o of objects){
   if(o.item.type==="mountain")continue;
   // Editor hides living tree trunks covered by an opaque mountain face.
   if(o.item.meta.kind==="tree"&&o.coveredByMountains?.size){hidden++;continue;}
   const asset={path:o.item.inst.assetPath},meta=o.item.meta,
    profile=engine.profile(asset);
   if(profile.enabled===false||!(profile.opacity>0))continue;
   if(!Number.isFinite(profile.softness)||!Number.isFinite(profile.angle)||
    !Number.isFinite(profile.length)||!Number.isFinite(profile.width))
    throw Error("Beschädigtes Original-Schattenprofil.");
   const width=o.g.width*scale,aspect=o.g.b.sh/o.g.b.sw,
    p={x:o.item.p.x*scale,y:o.g.y*scale*projectY},
    anchor=meta.anchor||{x:.5,y:.96},
    b=bounds(p,width,width*aspect,anchor,profile,meta.family,meta.kind);
   if(!(b.width>0&&b.height>0)||b.width>3200||b.height>3200||
    b.width*b.height>5500000)
    throw Error("Schattenmaske überschreitet den begrenzten Rasterbereich.");
   scratch.width=b.width;scratch.height=b.height;
   const c=scratch.getContext("2d",{alpha:true});
   if(!c?.setTransform||!c?.drawImage)throw Error("Shadow-Scratch fehlt.");
   c.setTransform(1,0,0,1,-b.left,-b.top);
   engine.draw(c,{type:"nature",asset,natureMeta:meta},p,width,
    silhouette(o),anchor,source.global.strength);
   m.drawImage(scratch,b.left-sx,b.top-sy);
   drawn++;if(profile.manual?.polygons?.length)manual++;
  }
 });
 if(engine.get()!==source)throw Error("Schattenprofile während der Probe verändert.");
 out.save();out.setTransform(1,0,0,1,0,0);
 out.globalAlpha=tone.targetAlpha("sprite");
 out.globalCompositeOperation="source-over";out.drawImage(mask,0,0);
 out.restore();
 return {schema:SCHEMA,drawn,manual,hidden,profiles:Object.keys(source.profiles).length,
  alpha:tone.targetAlpha("sprite"),needsOriginalMountainShadows:true,
  complete:false,readyForViewer:false};
}
const api={SCHEMA,bounds,paint};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapOriginalSpriteShadows=api;
})(typeof window!=="undefined"?window:globalThis);

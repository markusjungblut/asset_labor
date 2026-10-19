/* Shared 2.5D ground shadows. All sprites use one neutral shadow color
 * and the same scene strength. Per-asset / per-instance geometry is optional.
 * Shadow origins are expressed in visible sprite-width units; they do not
 * modify the sprite's physical ground anchor or its gameplay hex. */
'use strict';
window.VedrasShadows=(()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const COLOR={r:32,g:49,b:49};
 const defaults={opacity:.48,reach:.9,softness:17,originX:-.20,originY:.035,spread:1.28,contact:1.10};
 const number=(v,fallback,min,max)=>Number.isFinite(Number(v))?clamp(Number(v),min,max):fallback;
 function settings(raw={}){
  return {
   opacity:number(raw.opacity,defaults.opacity,0,.75),
   reach:number(raw.reach,defaults.reach,.3,2.5),
   softness:number(raw.softness,defaults.softness,0,40),
   originX:number(raw.originX,defaults.originX,-.8,.8),
   originY:number(raw.originY,defaults.originY,-.5,.5),
   spread:number(raw.spread,defaults.spread,.5,2.5),
   contact:number(raw.contact,defaults.contact,.35,2.5)
  };
 }
 const globalStrength=v=>number(v,.68,0,1);
 function projection(kind='mountain',reach=1,shape={}){
  const k=number(reach,1,.2,3),spread=number(shape.spread,kind==='mountain'?1.28:1,.5,2.5);
  // A wider, more horizontal projected footprint: the user should see a
  // nearby darkened rim, not a thin black spear across several hexes.
  return kind==='mountain'?
   {a:.63*spread,b:.034,c:.42*k,d:-.105,e:0,f:0}:
   {a:.46*spread,b:.045,c:.43*k,d:-.145,e:0,f:0};
 }
 function projectedPoint(kind,width,height,anchor,reach,ux,uy,shape={}){
  const m=projection(kind,reach,shape),ax=clamp(Number(anchor?.x??.5),0,1),
   ay=clamp(Number(anchor?.y??.96),0,1),x=(ux-ax)*width,y=(uy-ay)*height;
  const ox=kind==='mountain'?(shape.originX??defaults.originX):shape.originX??0;
  const oy=kind==='mountain'?(shape.originY??defaults.originY):shape.originY??0;
  return {x:m.a*x+m.c*y+width*ox,y:m.b*x+m.d*y+width*oy};
 }
 function cast(ctx,silhouette,p,width,height,anchor,reach,kind,alpha,softness,shape={}){
  if(!silhouette?.canvas||width<=0||height<=0||alpha<=0)return;
  const matrix=projection(kind,reach,shape),ax=clamp(Number(anchor?.x??.5),0,1),
   ay=clamp(Number(anchor?.y??.96),0,1);
  const offsetX=kind==='mountain'?(shape.originX??defaults.originX):shape.originX??0;
  const offsetY=kind==='mountain'?(shape.originY??defaults.originY):shape.originY??0;
  ctx.save();ctx.translate(p.x+width*offsetX,p.y+width*offsetY);
  ctx.transform(matrix.a,matrix.b,matrix.c,matrix.d,0,0);
  // The alpha-cropped graphic, rather than the transparent PNG canvas,
  // defines the source silhouette. Trim everything below the contact row.
  ctx.beginPath();ctx.rect(-width*ax,-height*ay,width,height*ay);ctx.clip();
  ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=clamp(alpha,0,.8);
  ctx.filter='blur('+Math.max(0,Number(softness)||0)+'px)';
  ctx.drawImage(silhouette.canvas,-width*ax,-height*ay,width,height);
  ctx.restore();
 }
 function contact(ctx,p,width,kind='nature',strength=1,shape={}){
  if(!(width>0)||strength<=0)return;
  const mountain=kind==='mountain',k=clamp(strength,0,1.3);
  const s=mountain?settings(shape):shape;
  const radius=width*(mountain?.48:.31)*(mountain?s.contact:1);
  const offsetX=mountain?width*(s.originX*.44-.045):-width*.025;
  const offsetY=mountain?width*(s.originY+.018):width*.012;
  ctx.save();ctx.translate(p.x+offsetX,p.y+offsetY);
  ctx.scale(1,mountain?.37:.31);
  const gradient=ctx.createRadialGradient(0,0,0,0,0,radius);
  const rgba=a=>'rgba('+COLOR.r+','+COLOR.g+','+COLOR.b+','+Math.min(.62,a*k)+')';
  gradient.addColorStop(0,rgba(mountain?.45:.42));
  gradient.addColorStop(.24,rgba(mountain?.30:.29));
  gradient.addColorStop(.68,rgba(mountain?.12:.105));
  gradient.addColorStop(1,rgba(0));
  ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();
  ctx.restore();
 }
 return {COLOR,defaults,settings,globalStrength,projection,projectedPoint,cast,contact};
})();

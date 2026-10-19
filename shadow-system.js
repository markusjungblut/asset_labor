/* Shared 2.5D ground shadows. All sprites use one neutral shadow color
 * and the same scene strength. Per-asset / per-instance geometry is optional.
 * Shadow origins are expressed in visible sprite-width units; they do not
 * modify the sprite's physical ground anchor or its gameplay hex. */
'use strict';
window.VedrasShadows=(()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const COLOR={r:32,g:49,b:49};
 const defaults={opacity:.44,reach:.9,softness:17,originX:-.10,originY:.015,spread:1.28,contact:1.10,
  angle:150,length:.72,rootWidth:.26,midWidth:.21,tipWidth:.105,contactWidth:.16,contactLength:.33};
 const number=(v,fallback,min,max)=>Number.isFinite(Number(v))?clamp(Number(v),min,max):fallback;
 function settings(raw={}){
  return {
   opacity:number(raw.opacity,defaults.opacity,0,.75),
   reach:number(raw.reach,defaults.reach,.3,2.5),
   softness:number(raw.softness,defaults.softness,0,40),
   originX:number(raw.originX,defaults.originX,-.8,.8),
   originY:number(raw.originY,defaults.originY,-.5,.5),
   spread:number(raw.spread,defaults.spread,.5,2.5),
   contact:number(raw.contact,defaults.contact,.35,2.5),
   // Historic reach/spread/contact are migrated only if a new field is absent.
   angle:number(raw.angle,defaults.angle,105,215),
   length:number(raw.length,number(raw.reach,defaults.reach,.3,2.5)*.80,.15,1.6),
   rootWidth:number(raw.rootWidth,defaults.rootWidth*number(raw.spread,1.28,.5,2.5)/1.28,.07,.7),
   midWidth:number(raw.midWidth,defaults.midWidth,.04,.6),
   tipWidth:number(raw.tipWidth,defaults.tipWidth,.03,.3),
   contactWidth:number(raw.contactWidth,defaults.contactWidth*number(raw.contact,1.10,.35,2.5)/1.10,.04,.45),
   contactLength:number(raw.contactLength,defaults.contactLength,.08,1.1)
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
  const contactScale=number(s.contact,1,.35,2.5);
  const radius=width*(mountain?.48:.31)*contactScale;
  const offsetX=mountain?width*(s.originX*.44-.045):width*((s.originX??0)*.44-.025);
  const offsetY=mountain?width*(s.originY+.018):width*((s.originY??0)+.012);
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
 
 // Find the LEFT visible base contour, not the transparent PNG bounding-box
 // centre. Samples follow the authored ground-anchor band; transparent/sparse
 // rows and far-off decorative specks cannot shift the anchor unexpectedly.
 function alphaFoot(data,w,h,anchor={x:.5,y:.67}){
  if(!data||!(w>0)||!(h>0))return {x:-.27,y:0};
  const ay=clamp(Number(anchor.y??.67),.1,.95);
  const ymin=Math.max(0,Math.floor(h*(ay-.065))),ymax=Math.min(h-1,Math.ceil(h*(ay+.135)));
  const xs=[],ys=[];
  for(let y=ymin;y<=ymax;y+=Math.max(1,Math.floor(h/110))){
   let first=-1,count=0;
   for(let x=0;x<w;x++){
    if(data[(y*w+x)*4+3]>=72){if(first<0)first=x;count++;}
   }
   if(first>=0&&count>=Math.max(2,w*.035)){xs.push(first/w);ys.push(y/h);}
  }
  if(xs.length<3)return {x:-.27,y:0};
  xs.sort((a,b)=>a-b);ys.sort((a,b)=>a-b);
  const median=arr=>arr[Math.floor(arr.length*.5)];
  return {
   x:clamp(median(xs)+.035-(Number(anchor.x??.5)), -.65,-.08),
   y:clamp(median(ys)-ay,-.14,.18)
  };
 }
 // originX/originY are ADDITIVE edits to the alpha-detected LEFT foot.
 // A player's physical map coordinate and sprite foot never move.
 function mountainOrigin(p,width,height,anchor,config,foot){
  const s=settings(config),f=foot||{x:-.27,y:0};
  return {x:p.x+width*(f.x+s.originX),y:p.y+height*f.y+width*s.originY};
 }
 const smoothstep=(a,b,x)=>{const t=clamp((x-a)/(b-a||1),0,1);return t*t*(3-2*t);};
 function mountainShape(origin,width,config){
  const s=settings(config),rad=s.angle*Math.PI/180;
  const dir={x:Math.cos(rad),y:Math.sin(rad)},normal={x:-dir.y,y:dir.x};
  const length=width*s.length,p1={x:origin.x+dir.x*length*.43,y:origin.y+dir.y*length*.43};
  const p2={x:origin.x+dir.x*length,y:origin.y+dir.y*length};
  return {s,origin,dir,normal,length,p1,p2,
   radius:[s.rootWidth,s.midWidth,s.tipWidth].map(v=>v*width)};
 }
 // Continuous, non-additive distance-field with a diagonal contact capsule.
 // The x clipping plane is fixed relative to the ALPHA-DERIVED root:
 // enlarging the footprint cannot create a lobe on the mountain's right.
 function mountainAlphaAt(x,y,shape,width,global=1){
  const {s,origin,dir,normal,length,radius}=shape;
  if(!Number.isFinite(x+y)||width<=0||global<=0||s.opacity<=0)return 0;
  if(x>origin.x+width*.045)return 0;
  const dx=x-origin.x,dy=y-origin.y,t=dx*dir.x+dy*dir.y,
    lateral=dx*normal.x+dy*normal.y,soft=Math.max(1,s.softness);
  let r;
  if(t<length*.43)r=radius[0]+(radius[1]-radius[0])*clamp(t/(length*.43||1),0,1);
  else r=radius[1]+(radius[2]-radius[1])*clamp((t-length*.43)/(length*.57||1),0,1);
  // Root is nearly flat along the tilted normal; it never circles far back
  // under the mountain. The end uses a rounded cap and remains broad.
  const along=t<0?Math.abs(t):t>length?t-length:0;
  const signed=Math.hypot(Math.abs(lateral),along)-r;
  const rootGate=smoothstep(-width*.045,width*.04,t);
  const castFade=(1-smoothstep(-soft*.15,soft*.90,signed))*
   (1-smoothstep(length*.90,length+radius[2]+soft,t))*rootGate;
  const contactLength=width*s.contactLength;
  const contactAxis=clamp(t,-contactLength*.06,contactLength*.87);
  const contactDist=Math.hypot(lateral,t-contactAxis)-width*s.contactWidth;
  const contactFade=(1-smoothstep(-soft*.08,soft*.70,contactDist))*
   smoothstep(-width*.05,width*.025,t);
  const cover=Math.max(.90*castFade,.56*contactFade);
  return Math.min(.49,Math.max(0,s.opacity*global*cover));
 }
 function paintMountain(ctx,origin,width,config,global=1){
  if(!ctx?.createImageData||!ctx.putImageData||!(width>0)||global<=0)return null;
  const shape=mountainShape(origin,width,config);
  if(shape.s.opacity<=0)return null;
  const r=Math.max(...shape.radius,width*shape.s.contactWidth);
  const pad=r+Math.max(5,shape.s.softness)*1.3;
  const x0=Math.max(0,Math.floor(Math.min(origin.x,shape.p2.x)-pad));
  const x1=Math.min(ctx.canvas?.width??Infinity,Math.ceil(origin.x+width*.045+1));
  const y0=Math.max(0,Math.floor(Math.min(origin.y,shape.p2.y)-pad));
  const y1=Math.min(ctx.canvas?.height??Infinity,Math.ceil(Math.max(origin.y,shape.p2.y)+pad));
  if(x1<=x0||y1<=y0)return null;
  const raster=ctx.createImageData(x1-x0,y1-y0),d=raster.data;
  let max=0,positive=0;
  for(let yy=0;yy<raster.height;yy++)for(let xx=0;xx<raster.width;xx++){
   const alpha=Math.round(mountainAlphaAt(x0+xx+.5,y0+yy+.5,shape,width,global)*255);
   if(alpha===0)continue;
   const i=(yy*raster.width+xx)*4;
   d[i]=COLOR.r;d[i+1]=COLOR.g;d[i+2]=COLOR.b;d[i+3]=alpha;
   if(alpha>max)max=alpha;
   positive++;
  }
  ctx.putImageData(raster,x0,y0);
  return {maxAlpha:max,positiveCount:positive,bounds:{x0,x1,y0,y1}};
 }
 return {COLOR,defaults,settings,globalStrength,projection,projectedPoint,cast,contact,alphaFoot,mountainOrigin,mountainShape,mountainAlphaAt,paintMountain};
})();

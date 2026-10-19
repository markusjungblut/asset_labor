/* Block 3: shared ground-plane shadow projection. Sun is upper-right;
 * every cast moves left/down from the SAME foot anchor as the sprite.
 * Canvas effects are additive. Missing optional sprite-shadow PNGs are safe.
 */
'use strict';
window.VedrasShadows=(()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function projection(kind='mountain',reach=1){
  const k=clamp(Number(reach)||1,.2,3);
  // Canvas 2x3 matrix: world x from local x and height, ground y is
  // POSITIVE for points above the sprite anchor (negative source y).
  return kind==='mountain'?
   {a:.40,b:.055,c:.79*k,d:-.20,e:0,f:0}:
   {a:.46,b:.045,c:.58*k,d:-.165,e:0,f:0};
 }
 function projectedPoint(kind,width,height,anchor,reach,ux,uy){
  const m=projection(kind,reach),ax=clamp(Number(anchor?.x??.5),0,1),
   ay=clamp(Number(anchor?.y??.96),0,1);
  const x=(ux-ax)*width,y=(uy-ay)*height;
  return {x:m.a*x+m.c*y,y:m.b*x+m.d*y};
 }
 function cast(ctx,silhouette,p,width,height,anchor,reach,kind,alpha,softness){
  if(!silhouette?.canvas||width<=0||height<=0||alpha<=0)return;
  const matrix=projection(kind,reach),ax=clamp(Number(anchor?.x??.5),0,1),
   ay=clamp(Number(anchor?.y??.96),0,1);
  ctx.save();ctx.translate(p.x,p.y);
  ctx.transform(matrix.a,matrix.b,matrix.c,matrix.d,0,0);
  // Only the silhouette ABOVE the real foot participates. The former code
  // projected pixels below the foot behind the hill and upwards.
  ctx.beginPath();ctx.rect(-width*ax,-height*ay,width,height*ay);ctx.clip();
  ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=clamp(alpha,0,.98);
  ctx.filter='blur('+Math.max(0,Number(softness)||0)+'px)';
  ctx.drawImage(silhouette.canvas,-width*ax,-height*ay,width,height);
  ctx.restore();
 }
 function contact(ctx,p,width,kind='nature',strength=1){
  if(!(width>0)||strength<=0)return;
  const mountain=kind==='mountain',k=clamp(strength,0,1.3),
   radius=width*(mountain?.44:.31);
  ctx.save();ctx.translate(p.x-width*(mountain?.05:.025),p.y+width*(mountain?.024:.012));
  ctx.scale(1,mountain?.35:.31);
  const gradient=ctx.createRadialGradient(0,0,0,0,0,radius);
  gradient.addColorStop(0,'rgba(10,20,25,'+Math.min(.86,(mountain?.68:.59)*k)+')');
  gradient.addColorStop(.24,'rgba(10,20,25,'+Math.min(.80,(mountain?.48:.41)*k)+')');
  gradient.addColorStop(.68,'rgba(10,20,25,'+Math.min(.53,(mountain?.22:.16)*k)+')');
  gradient.addColorStop(1,'rgba(10,20,25,0)');
  ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();
  ctx.restore();
 }
 return {projection,projectedPoint,cast,contact};
})();

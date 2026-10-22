/* Hand-drawn sprite-ground shadow geometry. World units: sprite width,
 * coordinates relative to the sprite's existing foot/ground anchor.
 * No bitmap modification. Supports multiple filled closed contours. */
'use strict';
window.VedrasManualShadows=(()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const MAX_POLYGONS=12,MAX_POINTS=180;
 function valid(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.mode!=='polygons'||
     !Array.isArray(raw.polygons)||raw.polygons.length>MAX_POLYGONS)
   throw Error('Ungültiges gezeichnetes Schattenprofil.');
  const polygons=raw.polygons.map(poly=>{
   if(!Array.isArray(poly)||poly.length<3||poly.length>MAX_POINTS)
    throw Error('Schattenkontur benötigt 3 bis 180 Punkte.');
   return poly.map(pair=>{
    if(!Array.isArray(pair)||pair.length!==2||
       pair.some(v=>typeof v!=='number'||!Number.isFinite(v)||v< -3||v>3))
     throw Error('Ungültiger Schattenpunkt.');
    return [...pair];
   });
  });
  return {mode:'polygons',polygons};
 }
 function render(ctx,raw,anchor,width,alpha,blur){
  if(!raw?.polygons?.length||width<=0||alpha<=0)return;
  ctx.save();ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=clamp(alpha,0,.95);ctx.fillStyle='#203131';
  ctx.filter='blur('+Math.max(0,blur)+'px)';
  ctx.translate(anchor.x,anchor.y);ctx.scale(width,width);
  for(const poly of raw.polygons){
   if(poly.length<3)continue;
   ctx.beginPath();ctx.moveTo(poly[0][0],poly[0][1]);
   for(let i=1;i<poly.length;i++)ctx.lineTo(poly[i][0],poly[i][1]);
   ctx.closePath();ctx.fill();
  }
  ctx.restore();
 }
 function time(a){
  // st_birthtime_ns when available, otherwise file last-modified date.
  // On Linux, st_ctime is NOT the creation time.
  const n=Number(a?.createdNs||a?.mtime||a?.lastModified||0);
  return Number.isFinite(n)&&n>0?(n>=1e15?n/1e6:n):0;
 }
 function sort(assets,profiles={},order='recent',unprofiled=false){
  const arr=(assets||[]).filter(a=>a?.img?.naturalWidth&&
   ['nature','buildings','units'].includes(a.category)&&
   (!unprofiled||!Object.prototype.hasOwnProperty.call(profiles,a.path)));
  const alpha=(a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true});
  return arr.sort((a,b)=>order==='recent'?
   time(b)-time(a)||alpha(a,b):order==='name'?
   alpha(a,b):a.category.localeCompare(b.category)||alpha(a,b));
 }
 function simplify(points,max=MAX_POINTS){
  if(points.length<=max)return points;
  const result=[];
  for(let i=0;i<max;i++)result.push(points[Math.round(i*(points.length-1)/(max-1))]);
  return result;
 }
 return {valid,render,time,sort,simplify,MAX_POLYGONS,MAX_POINTS};
})();
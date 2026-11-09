/* Step 25O: conservative visible/explored hex footprint for a cached World blit.
 * This is an optimization of the final DRAW only; the raster and its Fog
 * permissions are created exactly as before. Invalid geometry => full blit.
 */
'use strict';
window.VedrasFrozenWorldBlit=(()=>{
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 function plan(view,cells,dpr,{stripeCss=224,maxRects=8,minSaved=.23}={}){
  if(!view||!Array.isArray(cells)||!Number.isFinite(dpr)||dpr<=0||
     !Number.isFinite(view.width)||!Number.isFinite(view.height)||
     !Number.isFinite(view.zoom)||view.zoom<=0||view.width<=0||
     view.height<=0||!Number.isFinite(view.panX)||
     !Number.isFinite(view.panY))return null;
  const proj=view.projectY||.85;
  if(!Number.isFinite(proj)||proj<=0)return null;
  const pw=Math.round(view.width*dpr),ph=Math.round(view.height*dpr);
  if(pw<=0||ph<=0)return null;
  const stripe=Math.max(32,Math.round(stripeCss*dpr)),
   count=Math.ceil(ph/stripe);
  // Avoid O(cells*stripes) allocation for malformed or giant viewports.
  if(count>64)return null;
  const left=new Float64Array(count),right=new Float64Array(count);
  left.fill(pw);right.fill(0);
  let included=0,fullyCoveredPixels=0;
  const fullPixels=pw*ph,minimumUnavoidable=fullPixels*(1-minSaved);
  for(const cell of cells){
   if(cell?.visibility!=='visible'&&cell?.visibility!=='explored')continue;
   if(![cell.x,cell.y,cell.radius].every(Number.isFinite)||
      cell.radius<=0)return null;
   included++;
   // The authoritative World painter uses clipCells(0) for Ground and
   // clipCells(45) for Scenery. A 45-unit halo encloses both; rounded
   // outward by three device pixels for clip AA, snapping and sampling.
   const rx=(cell.radius+45)*view.zoom,
    ry=rx*proj,
    cx=view.width/2+view.panX+cell.x*view.zoom,
    cy=view.height/2+view.panY+cell.y*view.zoom*proj;
   const x0=clamp(Math.floor((cx-rx)*dpr)-3,0,pw),
    x1=clamp(Math.ceil((cx+rx)*dpr)+3,0,pw),
    y0=clamp(Math.floor((cy-ry)*dpr)-3,0,ph),
    y1=clamp(Math.ceil((cy+ry)*dpr)+3,0,ph);
   if(x1<=x0||y1<=y0)continue;
   const first=Math.floor(y0/stripe),
    last=Math.floor((y1-1)/stripe);
   for(let k=first;k<=last;k++){
    const wasFull=left[k]===0&&right[k]===pw;
    if(x0<left[k])left[k]=x0;
    if(x1>right[k])right[k]=x1;
    if(!wasFull&&left[k]===0&&right[k]===pw)
     fullyCoveredPixels+=pw*Math.min(stripe,ph-k*stripe);
   }
   // Once full-width stripes alone defeat the saving threshold, scanning
   // the rest of a 15k-cell world cannot improve the answer. Safe fallback.
   if(fullyCoveredPixels>minimumUnavoidable)return null;
  }
  const rects=[];
  let used=0;
  for(let k=0;k<count;k++){
   if(right[k]<=left[k])continue;
   const x=left[k],w=right[k]-x,
    y=k*stripe,h=Math.min(stripe,ph-y);
   used+=w*h;
   const prev=rects.at(-1);
   if(prev&&prev.x===x&&prev.w===w&&prev.y+prev.h===y)
    prev.h+=h;
   else rects.push({x,y,w,h});
  }
  // No authorized hex => no world pixels. No extra texture/copy budget.
  if(included===0||rects.length===0)return {rects:[],pixels:0,total:pw*ph,
   fraction:0};
  if(rects.length>maxRects||used>minimumUnavoidable)return null;
  return {rects,pixels:used,total:pw*ph,fraction:used/(pw*ph)};
 }
 return {plan};
})();

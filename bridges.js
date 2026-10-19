/* River crossings: six direction-specific bridge illustrations.
 * River topology stays on hex EDGES; roads stay centre-to-centre.
 * Intersections use the exact smoothed water channel from VedrasRivers.
 */
'use strict';
window.VedrasBridges=(()=>{
 const R=()=>window.VedrasRoads,V=()=>window.VedrasRivers;
 const urls=Array.from({length:6},(_,i)=>'assets/bridges/bridge_dir_'+String(i).padStart(2,'0')+'.svg');
 const images=new Map();
 const cross=(a,b)=>a.x*b.y-a.y*b.x;
 const delta=(a,b)=>({x:b.x-a.x,y:b.y-a.y});
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function intersection(a,b,c,d){
  const r=delta(a,b),s=delta(c,d),den=cross(r,s);
  if(Math.abs(den)<1e-9)return null;
  const q=delta(a,c),t=cross(q,s)/den,u=cross(q,r)/den;
  if(t<0||t>1||u<0||u>1)return null;
  return {x:a.x+t*r.x,y:a.y+t*r.y,t,u};
 }
 function candidates(edges,routes,cells,isWet,width=40){
  const W=V(),Roads=R(),out=[],riverWidth=Math.max(12,Math.min(70,Number(width)||40));
  const courses=[];
  for(const route of routes||[]){
   const sections=W.sections(route,cells,isWet);
   if(sections.length)courses.push(W.coursePoints(sections,route,riverWidth));
  }
  for(const edge of edges||[]){
   if(!Roads.identity(edge.a,edge.b))continue;
   const direction=Roads.side(
    Array.isArray(edge.a)?{q:edge.a[0],r:edge.a[1]}:edge.a,
    Array.isArray(edge.b)?{q:edge.b[0],r:edge.b[1]}:edge.b);
   const line=Roads.course(edge),hits=[];
   for(const river of courses)for(let i=1;i<line.length;i++)for(let j=1;j<river.length;j++){
    const at=intersection(line[i-1],line[i],river[j-1],river[j]);
    if(at&&!hits.some(p=>distance(p,at)<Math.max(15,riverWidth*.65))){
     // Road must cross the river, not merely touch an endpoint or follow it.
     const roadD=delta(line[i-1],line[i]),riverD=delta(river[j-1],river[j]);
     const product=Math.abs(cross(roadD,riverD))/(Math.hypot(roadD.x,roadD.y)*Math.hypot(riverD.x,riverD.y)||1);
     if(product>.16)hits.push({x:at.x,y:at.y});
    }
   }
   for(const p of hits)out.push({...p,dir:direction,level:edge.level||'trail',
    // Deck spans the water channel plus its softly feathered banks.
    length:Math.max(88,riverWidth+51),road:Roads.identity(edge.a,edge.b)});
  }
  return out;
 }
 function getImage(dir,onLoad){
  if(images.has(dir))return images.get(dir);
  if(typeof Image==='undefined')return null;
  const img=new Image();images.set(dir,img);
  img.onload=onLoad||(()=>{});img.onerror=()=>images.set(dir,null);
  img.src=urls[dir];return img;
 }
 // SVG deck is 134 world units long inside a 160-unit transparent canvas.
 // Scaling the whole image keeps the six prebaked rotations geometrically
 // exact under Canvas' shared isometric viewport transform.
 function render(ctx,bridges,options={}){
  if(!ctx||!bridges?.length)return 0;
  const groundY=typeof options.groundY==='function'?options.groundY:null;
  let count=0;
  for(const bridge of bridges){
   if(bridge.dir<0||bridge.dir>5)continue;
   const size=bridge.length*160/134;
   const y=groundY?groundY(bridge.x,bridge.y):bridge.y;
   const img=getImage(bridge.dir,options.requestDraw);
   if(img?.complete&&img.naturalWidth>0){
    ctx.drawImage(img,bridge.x-size/2,y-size/2,size,size);count++;
   }else{
    // Nonblank immediate preview while SVGs load, same footprint/direction.
    const angle=(bridge.dir-1)*Math.PI/3;
    ctx.save();ctx.translate(bridge.x,y);ctx.rotate(angle);
    ctx.fillStyle='#a18b69';ctx.fillRect(-bridge.length/2,-24,bridge.length,48);
    ctx.fillStyle='#d6bd91';ctx.fillRect(-bridge.length/2+3,-17,bridge.length-6,34);
    ctx.restore();count++;
   }
  }
  return count;
 }
 return {urls,intersection,candidates,render};
})();

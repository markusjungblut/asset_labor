/* Vedras river topology and transparent water-only rendering, v0.14.
 * Side order and axial geometry are EXACTLY VedrasShoreline / VedrasAutotile.
 * A source uses ordinary water, only its unconnected end is rounded at a corner.
 * Interior connections are cut exactly at the shared hex edge and join seamlessly.
 */
'use strict';
window.VedrasRivers=(()=>{
 const HEX=256,R=HEX/Math.sqrt(3);
 const DIRS=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];
 const key=c=>c.q+','+c.r;
 const pos=c=>({x:HEX*(c.q+c.r/2),y:1.5*R*c.r});
 const vertices=c=>{const p=pos(c);return Array.from({length:6},(_,i)=>({x:p.x+R*Math.cos(-Math.PI/2+i*Math.PI/3),y:p.y+R*Math.sin(-Math.PI/2+i*Math.PI/3)}));};
 const side=(a,b)=>DIRS.findIndex(([dq,dr])=>b.q===a.q+dq&&b.r===a.r+dr);
 const midpoint=(a,sideIndex)=>{const v=vertices(a),u=v[sideIndex],w=v[(sideIndex+1)%6];return {x:(u.x+w.x)/2,y:(u.y+w.y)/2};};
 const isCoordinate=p=>p&&Number.isSafeInteger(p.q)&&Number.isSafeInteger(p.r)&&Math.abs(p.q)<=100000&&Math.abs(p.r)<=100000;
 const norm=p=>Array.isArray(p)?{q:p[0],r:p[1]}:{q:p?.q,r:p?.r};
 function valid(route,cells,isWet){
  if(!route||!Array.isArray(route.hexes)||route.hexes.length<2||route.hexes.length>10000)return false;
  const lookup=new Map(cells.map(c=>[key(c),c])),seen=new Set();
  for(let i=0;i<route.hexes.length;i++){
   const p=norm(route.hexes[i]);if(!isCoordinate(p)||seen.has(key(p))||!lookup.has(key(p)))return false;
   seen.add(key(p));
   if(!!isWet(lookup.get(key(p)))!==(i===route.hexes.length-1))return false;
   if(i&&side(norm(route.hexes[i-1]),p)<0)return false;
  }
  return route.corner===undefined||(Number.isInteger(route.corner)&&route.corner>=0&&route.corner<6);
 }
 // BFS over land. A route is valid ONLY when it ends at a real water tile.
 // Ordered neighbors and no random branches make generation deterministic.
 function findRoute(cells,isWet,start){
  const byKey=new Map(cells.map(c=>[key(c),c])),source=byKey.get(key(norm(start)));
  if(!source||isWet(source))return null;
  const queue=[source],seen=new Set([key(source)]),previous=new Map();
  for(let i=0;i<queue.length;i++){
   const c=queue[i];
   for(const [dq,dr] of DIRS){
    const n=byKey.get((c.q+dq)+','+(c.r+dr));
    if(!n||seen.has(key(n)))continue;
    seen.add(key(n));previous.set(key(n),key(c));
    if(isWet(n)){
     const rev=[key(n)];let k=key(n);
     while(k!==key(source)){k=previous.get(k);if(!k)return null;rev.push(k);}
     rev.reverse();
     return {hexes:rev.map(k=>k.split(',').map(Number))};
    }
    queue.push(n);
   }
  }
  return null;
 }
 function sections(route,cells,isWet){
  if(!valid(route,cells,isWet))return [];
  const points=route.hexes.map(norm),list=[];
  for(let i=0;i<points.length-1;i++){
   const c=points[i],to=points[i+1];
   const outSide=side(c,to),inSide=i?side(c,points[i-1]):null;
   // The free end of the source lies EXACTLY on a hex corner, rather than
   // being another special illustration. Default is the opposite corner.
   const corner=i===0?(route.corner??((outSide+3)%6)):null;
   const classification=i===0?(i===points.length-2?'source_mouth':'source'):
     i===points.length-2?'mouth':((inSide+3)%6===outSide?'straight':'curve');
   list.push({q:c.q,r:c.r,kind:classification,inSide,outSide,corner,
    start:corner===null?midpoint(c,inSide):vertices(c)[corner],center:pos(c),end:midpoint(c,outSide)});
  }
  return list;
 }
 function mouths(routes,cells,isWet){
  const set=new Set();
  for(const route of routes||[]){
   const s=sections(route,cells,isWet);
   if(s.length){const last=s[s.length-1];set.add(last.q+','+last.r+':'+last.outSide);}
  }
  return set;
 }
 function trace(ctx,route,cells,isWet){
  const segments=sections(route,cells,isWet);
  if(!segments.length)return null;
  const start=segments[0].start,water=pos(norm(route.hexes[route.hexes.length-1]));
  ctx.moveTo(start.x,start.y);
  for(const s of segments){
   // Two quadratic halves meet at the exact shared edge midpoint.
   // The tangent there points along the normal between hex centers.
   ctx.quadraticCurveTo(s.center.x,s.center.y,s.end.x,s.end.y);
  }
  // Only a short mouth extension into the WATER tile; no dead end on land.
  const exit=segments[segments.length-1].end;
  ctx.lineTo(exit.x+(water.x-exit.x)*.52,exit.y+(water.y-exit.y)*.52);
  return {segments,start,end:exit,water};
 }
 function render(ctx,route,cells,isWet,waterImage,options={}){
  if(!valid(route,cells,isWet))return null;
  const segments=sections(route,cells,isWet),width=Math.max(12,Math.min(70,Number(options.width)||32));
  const wpos=pos(norm(route.hexes.at(-1)));
  const points=[...segments.flatMap(s=>[s.start,s.center,s.end]),wpos];
  const pad=width+28,x=Math.floor(Math.min(...points.map(p=>p.x))-pad),y=Math.floor(Math.min(...points.map(p=>p.y))-pad);
  const xmax=Math.ceil(Math.max(...points.map(p=>p.x))+pad),ymax=Math.ceil(Math.max(...points.map(p=>p.y))+pad);
  const dw=xmax-x,dh=ymax-y;
  // Preview remains bounded; the source-to-water hex path stays in world units.
  const scale=Math.min(1.55,2500/Math.max(dw,dh)),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.ceil(dw*scale));canvas.height=Math.max(1,Math.ceil(dh*scale));
  const g=canvas.getContext('2d');g.setTransform(scale,0,0,scale,-x*scale,-y*scale);
  const traceStroke=(strokeWidth,alpha)=>{
   g.beginPath();trace(g,route,cells,isWet);g.lineJoin='round';g.lineCap='round';
   g.strokeStyle='rgba(255,255,255,'+alpha+')';g.lineWidth=strokeWidth;g.stroke();
  };
  // All bands are WATER ALPHA only: no sand, beach, bank or border material.
  // The terrain beneath shows through the progressively softer channel edges.
  traceStroke(width+24,.025);traceStroke(width+17,.08);
  traceStroke(width+11,.22);traceStroke(width+6,.52);
  traceStroke(width,.95);
  // Replace white mask with actual mouth-water image; preserve alpha shape.
  g.save();g.globalCompositeOperation='source-in';g.globalAlpha=1;
  const pattern=waterImage?.naturalWidth?g.createPattern(waterImage,'repeat'):null;
  if(pattern){
   // A water image normally occupies one 256-unit hex. No embedded beaches.
   if(pattern.setTransform&&typeof DOMMatrix!=='undefined'){
    const factor=HEX/Math.max(1,waterImage.naturalWidth);
    pattern.setTransform(new DOMMatrix([factor,0,0,factor,0,0]));
   }
   g.fillStyle=pattern;
  }else g.fillStyle='#4397b2';
  g.fillRect(x,y,dw,dh);g.restore();
  ctx.drawImage(canvas,x,y,dw,dh);
  return {segments,width,x,y,canvas};
 }
 function normalizeRoutes(routes,cells,isWet){
  return (Array.isArray(routes)?routes:[]).slice(0,50).filter(x=>valid(x,cells,isWet)).map(route=>({
   hexes:route.hexes.map(p=>{const n=norm(p);return [n.q,n.r];}),
   ...(route.corner===undefined?{}:{corner:route.corner})
  }));
 }
 return {DIRS,pos,vertices,side,midpoint,valid,findRoute,sections,mouths,trace,render,normalizeRoutes};
})();
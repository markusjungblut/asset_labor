/* Vedras Reiche – Wall graphics prototype v1.
 * One canonical undirected shared hex edge = one wall segment. Geometry is
 * borrowed from rivers, not a second independent hex projection.
 * This module provides DRAWING only: no M24 costs, gates, combat or ownership.
 */
'use strict';
window.VedrasWalls=(()=>{
 const rivers=window.VedrasRivers;
 const DIRS=rivers.DIRS;
 const kinds=['palisade','stone'];
 const point=p=>Array.isArray(p)?{q:p[0],r:p[1]}:{q:p?.q,r:p?.r};
 const key=p=>p.q+','+p.r;
 const pair=(a,b)=>{
  a=point(a);b=point(b);
  return a.q<b.q||a.q===b.q&&a.r<=b.r?[a,b]:[b,a];
 };
 const identity=(a,b)=>{
  const [x,y]=pair(a,b);
  return key(x)+'|'+key(y);
 };
 const validPoint=p=>p&&Number.isSafeInteger(p.q)&&Number.isSafeInteger(p.r)&&
  Math.abs(p.q)<=100000&&Math.abs(p.r)<=100000;
 const mountain=c=>c?.reliefClass==='mountain'||c?.biome==='mountain';
 function occupiedRiverEdges(routes,cells,isWet){
  const occupied=new Set();
  for(const route of routes||[]){
   for(const s of rivers.sections(route,cells,isWet)){
    const a={q:s.q,r:s.r};
    for(const side of s.edgeSides){
     const [dq,dr]=DIRS[side];
     occupied.add(identity(a,{q:a.q+dq,r:a.r+dr}));
    }
    // The last land-to-water crossing occupies the same physical hex edge.
    if(s.kind==='mouth'||s.kind==='source_mouth'){
     const [dq,dr]=DIRS[s.outSide];
     occupied.add(identity(a,{q:a.q+dq,r:a.r+dr}));
    }
   }
  }
  return occupied;
 }
 function context(cells=[],isWet=()=>false,routes=[]){
  const byKey=new Map((cells||[]).map(c=>[key(c),c]));
  return {byKey,isWet,rivers:occupiedRiverEdges(routes,cells,isWet)};
 }
 function canPlace(a,b,env){
  a=point(a);b=point(b);
  if(!validPoint(a)||!validPoint(b)||rivers.side(a,b)<0)
   return {ok:false,reason:'Nur direkt benachbarte Hexfelder teilen eine Kante.'};
  const ca=env.byKey.get(key(a)),cb=env.byKey.get(key(b));
  if(!ca||!cb)return {ok:false,reason:'Kante liegt außerhalb der Testkarte.'};
  if(env.isWet(ca)||env.isWet(cb))
   return {ok:false,reason:'Wasser-/Küstenwasserkante nicht bebaubar.'};
  if(mountain(ca)||mountain(cb))
   return {ok:false,reason:'Bergstandorte sind nicht bebaubar.'};
  if(env.rivers.has(identity(a,b)))
   return {ok:false,reason:'Auf einer tatsächlichen Flusskante ist keine Mauer erlaubt.'};
  return {ok:true,reason:'Bebaubare gemeinsame Hexkante.'};
 }
 function normalize(edges,env){
  const byEdge=new Map();
  for(const input of Array.isArray(edges)?edges.slice(0,10000):[]){
   const a=point(input?.a),b=point(input?.b);
   if(!kinds.includes(input?.kind)||!canPlace(a,b,env).ok)continue;
   const [x,y]=pair(a,b);
   byEdge.set(identity(x,y),{a:[x.q,x.r],b:[y.q,y.r],kind:input.kind});
  }
  return [...byEdge.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([,v])=>v);
 }
 function setEdge(edges,a,b,kind,env){
  if(!kinds.includes(kind)||!canPlace(a,b,env).ok)return normalize(edges,env);
  const [x,y]=pair(a,b),id=identity(x,y);
  return normalize([...normalize(edges,env).filter(e=>identity(e.a,e.b)!==id),
   {a:[x.q,x.r],b:[y.q,y.r],kind}],env);
 }
 function removeEdge(edges,a,b,env){
  const id=identity(a,b);
  return normalize(edges.filter(e=>identity(e.a,e.b)!==id),env);
 }
 function geometry(edge){
  const a=point(edge.a),b=point(edge.b),side=rivers.side(a,b);
  if(side<0)return null;
  const vertices=rivers.vertices(a);
  return {a:vertices[side],b:vertices[(side+1)%6],side};
 }
 function midpoint(edge){
  const g=geometry(edge);
  return g?{x:(g.a.x+g.b.x)*.5,y:(g.a.y+g.b.y)*.5}:null;
 }
 function heightFor(kind){return kind==='palisade'?62:78;}
 function projected(edge,project){
  const g=geometry(edge);if(!g)return null;
  return {a:project(g.a.x,g.a.y),b:project(g.b.x,g.b.y)};
 }
 function shadowVector(kind,zoom,global={}){
  const rad=(Number.isFinite(global.angle)?global.angle:160)*Math.PI/180;
  const h=heightFor(kind)*zoom;
  const length=Number.isFinite(global.length)?global.length:1.05;
  // Exactly the same leftward direction and squashed depth as generic
  // sprite shadows in sprite-shadow-editor.js.
  return {x:Math.cos(rad)*h*length,y:Math.sin(rad)*h*length*.30,
   height:h};
 }
 const poly=(ctx,points)=>{
  ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
  for(const p of points.slice(1))ctx.lineTo(p.x,p.y);
  ctx.closePath();ctx.fill();
 };
 const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
 const lift=(p,h)=>({x:p.x,y:p.y-h});
 function drawShadow(ctx,edge,project,zoom=1,global={}){
  const line=projected(edge,project);if(!line)return false;
  const a=line.a,b=line.b,d=shadowVector(edge.kind,zoom,global);
  const sx=Number(global.offsetX??-.07)*heightFor(edge.kind)*zoom;
  const sy=Number(global.offsetY??.025)*heightFor(edge.kind)*zoom;
  const shift=p=>({x:p.x+d.x+sx,y:p.y+d.y+sy});
  const tone=window.VedrasShadowTone;
  ctx.save();
  ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=tone?.targetAlpha?.('sprite')??.40;
  ctx.fillStyle=tone?.colorCss?.()||'#203131';
  ctx.lineCap='round';
  ctx.filter='blur('+Math.min(12,Math.max(1,(Number(global.softness)||6)*zoom*.65))+'px)';
  poly(ctx,[a,b,shift(b),shift(a)]);
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
  ctx.lineWidth=Math.max(2,7*zoom);ctx.strokeStyle=ctx.fillStyle;
  ctx.stroke();
  ctx.restore();
  return true;
 }
 function draw(ctx,edge,project,zoom=1){
  const g=projected(edge,project);if(!g)return false;
  const a=g.a,b=g.b,h=heightFor(edge.kind)*zoom;
  const at=lift(a,h),bt=lift(b,h);
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
  const thick=(edge.kind==='stone'?10:8)*zoom;
  // A slight depth-offset gives every direction an upright 2.5D top face.
  const depth={x:-dy/len*thick,y:dx/len*thick*.56};
  const back=p=>({x:p.x+depth.x,y:p.y+depth.y});
  const stone=edge.kind==='stone';
  const body=stone?'#9e9b90':'#9b7149';
  const upper=stone?'#d5cabe':'#cda478';
  const seam=stone?'#716f69':'#6e4a32';
  ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  ctx.filter='none';ctx.lineJoin='round';
  ctx.fillStyle=stone?'#77756d':'#755437';
  poly(ctx,[b,back(b),back(bt),bt]);
  ctx.fillStyle=body;poly(ctx,[a,b,bt,at]);
  ctx.fillStyle=upper;poly(ctx,[at,bt,back(bt),back(at)]);
  // Small material joints are part of the actual wall, never rotated PNG
  // shadows. Both orientations and reversed endpoint order use one model.
  const count=Math.max(2,Math.ceil(len/(stone?40:14)/Math.max(.30,zoom)));
  ctx.strokeStyle=seam;ctx.lineWidth=Math.max(.65,.9*zoom);
  for(let i=1;i<count;i++){
   const t=i/count,p=mix(a,b,t),top=lift(p,h);
   ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(top.x,top.y);ctx.stroke();
  }
  if(stone){
   const left=mix(a,at,.52),right=mix(b,bt,.52);
   ctx.beginPath();ctx.moveTo(left.x,left.y);ctx.lineTo(right.x,right.y);ctx.stroke();
   for(let i=0;i<Math.max(2,Math.floor(count/2));i++){
    const t=(i+.5)/Math.max(2,Math.floor(count/2)),p=mix(a,b,t);
    ctx.beginPath();ctx.moveTo(p.x,p.y-h*.52);ctx.lineTo(p.x,p.y-h);ctx.stroke();
   }
  }else{
   // Palisade heads remain vertical for all six hex directions.
   const heads=Math.max(2,Math.floor(count/2));
   ctx.fillStyle='#cda478';
   for(let i=0;i<=heads;i++){
    const t=i/heads,p=mix(at,bt,t),w=3.5*zoom;
    poly(ctx,[{x:p.x-w,y:p.y},{x:p.x,y:p.y-8*zoom},
     {x:p.x+w,y:p.y}]);
   }
  }
  // Matching end-posts conceal tiny floating point corner gaps. Connected
  // segments share exact corner coordinates; opaque posts never darken twice.
  for(const p of [a,b]){
   const top=lift(p,h),w=(stone?5:4)*zoom;
   ctx.fillStyle=stone?'#b6aea2':'#ac8259';
   poly(ctx,[{x:p.x-w,y:p.y},{x:p.x+w,y:p.y},
    {x:top.x+w,y:top.y},{x:top.x-w,y:top.y}]);
   ctx.fillStyle=upper;ctx.fillRect(top.x-w,top.y-2*zoom,w*2,3*zoom);
  }
  ctx.restore();return true;
 }
 return {DIRS,kinds,point,identity,context,canPlace,normalize,setEdge,removeEdge,
  occupiedRiverEdges,geometry,midpoint,heightFor,shadowVector,draw,drawShadow};
})();
/* Vedras river topology and transparent water-only EDGE rendering, v0.15.
 * Side order and axial geometry are EXACTLY VedrasShoreline / VedrasAutotile.
 * A source uses ordinary water, only its unconnected end is rounded at a corner.
 * Interior channels follow linked hex SIDES / CORNERS, never their centres.
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
 // Every river pixel lies near an actual hex EDGE, not the hex centre.
 // A route carries land cells; for each land/next-cell shared SIDE, select a
 // common vertex (one of the side's two corners), and walk along the perimeter
 // of the current hex to that vertex. Dynamic programming chooses a continuous,
 // short, deterministic edge-chain across all selected cells.
 const near=(a,b)=>Math.abs(a.x-b.x)<1e-5&&Math.abs(a.y-b.y)<1e-5;
 function cornerIndex(cell,point){
  return vertices(cell).findIndex(v=>near(v,point));
 }
 function edgeWalk(cell,from,to){
  const v=vertices(cell),a=cornerIndex(cell,from),b=cornerIndex(cell,to);
  if(a<0||b<0)throw Error('River edge-chain has a non-corner waypoint');
  const forward=(b-a+6)%6,backward=(a-b+6)%6;
  const step=forward<=backward?1:-1,n=Math.min(forward,backward);
  return Array.from({length:n+1},(_,i)=>v[(a+step*i+6*2)%6]);
 }
 function sections(route,cells,isWet){
  if(!valid(route,cells,isWet))return [];
  const points=route.hexes.map(norm),last=points.length-2;
  const options=points.slice(0,-1).map((c,i)=>{
   const s=side(c,points[i+1]),v=vertices(c);
   return [v[s],v[(s+1)%6]];
  });
  const sourceSide=side(points[0],points[1]);
  const corner=route.corner??((sourceSide+3)%6);
  const origin=vertices(points[0])[corner];
  const dp=options.map(()=>[Infinity,Infinity]),parent=options.map(()=>[0,0]);
  for(let k=0;k<2;k++)dp[0][k]=edgeWalk(points[0],origin,options[0][k]).length-1;
  for(let i=1;i<options.length;i++){
   for(let k=0;k<2;k++){
    for(let j=0;j<2;j++){
     const distance=edgeWalk(points[i],options[i-1][j],options[i][k]).length-1;
     const cost=dp[i-1][j]+distance;
     if(cost<dp[i][k]){dp[i][k]=cost;parent[i][k]=j;}
    }
   }
  }
  const gates=new Array(options.length);
  let chosen=dp[last][0]<=dp[last][1]?0:1;
  for(let i=last;i>=0;i--){gates[i]=options[i][chosen];chosen=parent[i][chosen];}
  const result=[];
  for(let i=0;i<=last;i++){
   const c=points[i],inSide=i?side(c,points[i-1]):null,outSide=side(c,points[i+1]);
   const start=i?gates[i-1]:origin,end=gates[i];
   const boundary=edgeWalk(c,start,end);
   result.push({q:c.q,r:c.r,
    kind:i===0?(i===last?'source_mouth':'source'):i===last?'mouth':((inSide+3)%6===outSide?'straight':'curve'),
    inSide,outSide,corner:i===0?corner:null,start,end,center:pos(c),
    path:boundary,
    // Each pair of path points follows a real side of this specific hex.
    edgeSides:boundary.slice(1).map((v,j)=>{const a=cornerIndex(c,boundary[j]),b=cornerIndex(c,v);return b===(a+1)%6?a:b;})
   });
  }
  return result;
 }
 function mouthTip(segments,route,width=32){
  const last=segments[segments.length-1],water=pos(norm(route.hexes.at(-1)));
  const land=pos(last),dx=water.x-land.x,dy=water.y-land.y;
  const len=Math.hypot(dx,dy)||1;
  return {x:last.end.x+dx/len*(width*.88),y:last.end.y+dy/len*(width*.88)};
 }
 function mouths(routes,cells,isWet){
  const set=new Set();
  for(const route of routes||[]){
   const s=sections(route,cells,isWet);
   if(s.length){const last=s[s.length-1];set.add(last.q+','+last.r+':'+last.outSide);}
  }
  return set;
 }
 function trace(ctx,route,cells,isWet,groundY=null,width=32){
  const segments=sections(route,cells,isWet);
  if(!segments.length)return null;
  const start=segments[0].start,water=pos(norm(route.hexes.at(-1)));
  const height=(x,y)=>groundY?groundY(x,y):y;
  ctx.moveTo(start.x,height(start.x,start.y));
  // No quadratic-to-centre curves. Move along vertices of the SIX real hex
  // edges, joining across shared corners with no gap or artificial beach.
  for(const s of segments){
   for(const v of s.path.slice(1))ctx.lineTo(v.x,height(v.x,v.y));
  }
  const mouth=mouthTip(segments,route,width);
  ctx.lineTo(mouth.x,height(mouth.x,mouth.y));
  return {segments,start,end:segments.at(-1).end,water,mouth};
 }
 function render(ctx,route,cells,isWet,waterImage,options={}){
  if(!valid(route,cells,isWet))return null;
  const segments=sections(route,cells,isWet),width=Math.max(12,Math.min(70,Number(options.width)||32));
  const wpos=pos(norm(route.hexes.at(-1)));
  const groundY=typeof options.groundY==='function'?options.groundY:null;
  const points=[...segments.flatMap(s=>s.path),mouthTip(segments,route,width),wpos];
  const pad=width+34,x=Math.floor(Math.min(...points.map(p=>p.x))-pad);
  const y=Math.floor(Math.min(...points.map(p=>groundY?groundY(p.x,p.y):p.y))-pad);
  const xmax=Math.ceil(Math.max(...points.map(p=>p.x))+pad),ymax=Math.ceil(Math.max(...points.map(p=>groundY?groundY(p.x,p.y):p.y))+pad);
  const dw=xmax-x,dh=ymax-y;
  // Preview remains bounded; the source-to-water hex path stays in world units.
  const scale=Math.min(1.55,2500/Math.max(dw,dh)),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.ceil(dw*scale));canvas.height=Math.max(1,Math.ceil(dh*scale));
  const g=canvas.getContext('2d');g.setTransform(scale,0,0,scale,-x*scale,-y*scale);
  // Mask a chain of actual shoreline-aligned EDGE SEGMENTS. Each tile-side
  // is an oriented filled polygon; joins and endcaps are shared filled discs.
  // No freehand canvas stroke is used to paint a river.
  const channel=[...segments.flatMap(s=>s.path),mouthTip(segments,route,width)].filter((p,i,a)=>!i||Math.hypot(p.x-a[i-1].x,p.y-a[i-1].y)>1e-6);
  const project=p=>({x:p.x,y:groundY?groundY(p.x,p.y):p.y});
  function segmentMask(points,diameter,style){
   const projected=points.map(project),half=diameter/2;
   g.beginPath();
   for(let i=1;i<projected.length;i++){
    const a=projected[i-1],b=projected[i],len=Math.hypot(b.x-a.x,b.y-a.y);
    if(len<1e-6)continue;
    const nx=-(b.y-a.y)/len*half,ny=(b.x-a.x)/len*half;
    g.moveTo(a.x+nx,a.y+ny);g.lineTo(b.x+nx,b.y+ny);
    g.lineTo(b.x-nx,b.y-ny);g.lineTo(a.x-nx,a.y-ny);g.closePath();
   }
   for(const p of projected){g.moveTo(p.x+half,p.y);g.arc(p.x,p.y,half,0,Math.PI*2);}
   g.fillStyle=style;g.fill();
  }
  // Feathered per-segment alpha masks, with exactly the same material for
  // straight edges, turns and rounded source end. No sand or hard bank.
  for(const [extra,alpha] of [[24,.025],[17,.08],[11,.22],[6,.52],[0,.95]])
   segmentMask(channel,width+extra,'rgba(255,255,255,'+alpha+')');
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
  // River becomes indistinguishable from WATER within the receiving tile:
  // smoothly remove the overlay; never place a flat color cap in the sea.
  const last=segments[segments.length-1].end;
  const mouth=mouthTip(segments,route,width);
  g.save();g.globalCompositeOperation='destination-out';
  const grad=g.createLinearGradient(last.x,groundY?groundY(last.x,last.y):last.y,mouth.x,groundY?groundY(mouth.x,mouth.y):mouth.y);
  grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(1,'rgba(0,0,0,1)');
  segmentMask([last,mouth],width+28,grad);g.restore();
  ctx.drawImage(canvas,x,y,dw,dh);
  return {segments,width,x,y,canvas,widthWorld:dw,heightWorld:dh};
 }
 // Shared geometry contract for the Nature system: the river occupies a
 // continuous capsule around each edge segment, including the source and mouth.
 function blocksPoint(x,y,routes,cells,isWet,width=32,padding=0){
  const reach=Math.max(12,Math.min(70,Number(width)||32))/2+Math.max(0,Number(padding)||0);
  const nearSegment=(p,a,b)=>{
   const dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy;
   const t=len2?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/len2)):0;
   return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)<=reach;
  };
  const p={x,y};
  for(const route of routes||[]){
   const chunks=sections(route,cells,isWet);if(!chunks.length)continue;
   const points=[...chunks.flatMap(c=>c.path),mouthTip(chunks,route,width)];
   if(points.some((v,i)=>i>0&&nearSegment(p,points[i-1],v)))return true;
  }
  return false;
 }
 function normalizeRoutes(routes,cells,isWet){
  return (Array.isArray(routes)?routes:[]).slice(0,50).filter(x=>valid(x,cells,isWet)).map(route=>({
   hexes:route.hexes.map(p=>{const n=norm(p);return [n.q,n.r];}),
   ...(route.corner===undefined?{}:{corner:route.corner})
  }));
 }
 return {DIRS,key,pos,vertices,side,midpoint,edgeWalk,valid,findRoute,sections,mouths,trace,render,blocksPoint,normalizeRoutes};
})();
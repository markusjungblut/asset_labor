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
 // Non-destructive scenery clearance: only natural GROUND anchors directly
 // touching a wall segment are hidden. Overhanging canopies remain valid and
 // return instantly if the wall is removed; no mutation of the tree catalog.
 function blocksPoint(x,y,edges,padding=18){
  if(!Number.isFinite(x)||!Number.isFinite(y))return false;
  const radius=Math.max(2,Math.min(64,Number(padding)||18));
  for(const edge of edges||[]){
   const g=geometry(edge);if(!g)continue;
   const dx=g.b.x-g.a.x,dy=g.b.y-g.a.y,denom=dx*dx+dy*dy;
   const t=denom>0?Math.max(0,Math.min(1,((x-g.a.x)*dx+(y-g.a.y)*dy)/denom)):0;
   if(Math.hypot(x-g.a.x-t*dx,y-g.a.y-t*dy)<radius)return true;
  }
  return false;
 }
 // Height is the world-space VERTICAL dimension, independent of the
 // direction of the shared hex edge. NW and NE therefore use identical
 // sprite height, including the eight-unit sharpened palisade tip.
 function heightFor(_kind){return 62;}
 function widthFor(kind){return kind==='stone'?24:16;}
 function projected(edge,project){
  const g=geometry(edge);if(!g)return null;
  return {a:project(g.a.x,g.a.y),b:project(g.b.x,g.b.y)};
 }
 const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
 const lift=(p,h)=>({x:p.x,y:p.y-h});
 const poly=(ctx,points)=>{
  ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
  for(const p of points.slice(1))ctx.lineTo(p.x,p.y);
  ctx.closePath();ctx.fill();
 };
 // Projected wall footprint: symmetrical about the REAL shared hex edge.
 // Normalize the perpendicular toward the viewer (positive screen Y).
 // Otherwise one orientation's "back" would be drawn ABOVE its ridge,
 // making NW appear taller than NE even with the same numeric wall height.
 function footprint(edge,project,zoom=1){
  const line=projected(edge,project);if(!line)return null;
  const {a,b}=line,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
  if(!(len>0))return null;
  let nx=-dy/len,ny=dx/len;
  if(ny<0||(Math.abs(ny)<1e-9&&nx<0)){nx=-nx;ny=-ny;}
  const thickness=widthFor(edge.kind)*zoom;
  const depth={x:nx*thickness,y:ny*thickness*.62};
  const offset=(p,sign)=>({x:p.x+depth.x*sign*.5,
   y:p.y+depth.y*sign*.5});
  return {a,b,frontA:offset(a,-1),frontB:offset(b,-1),
   backA:offset(a,1),backB:offset(b,1),
   thickness,depth,height:heightFor(edge.kind)*zoom};
 }
 function shadowVector(kind,zoom,global={}){
  const rad=(Number.isFinite(global.angle)?global.angle:160)*Math.PI/180;
  const h=heightFor(kind)*zoom;
  const length=Number.isFinite(global.length)?global.length:1.05;
  return {x:Math.cos(rad)*h*length,y:Math.sin(rad)*h*length*.30,
   height:h};
 }
 function drawShadow(ctx,edge,project,zoom=1,global={}){
  const p=footprint(edge,project,zoom);if(!p)return false;
  const d=shadowVector(edge.kind,zoom,global);
  const sx=Number(global.offsetX??-.07)*d.height;
  const sy=Number(global.offsetY??.025)*d.height;
  const cast=x=>({x:x.x+d.x+sx,y:x.y+d.y+sy});
  const tone=window.VedrasShadowTone;
  ctx.save();
  ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=tone?.targetAlpha?.('sprite')??.40;
  ctx.fillStyle=tone?.colorCss?.()||'#203131';
  ctx.filter='blur('+Math.min(12,Math.max(1,(Number(global.softness)||6)*zoom*.65))+'px)';
  // Both sides cast from the actual thick base, not from the infinitely
  // thin border line. This is still painted through the existing shared
  // normal-shadow mask, so joined segments cannot compound darkness.
  poly(ctx,[p.frontA,p.frontB,cast(p.frontB),cast(p.frontA)]);
  poly(ctx,[p.backA,p.backB,cast(p.backB),cast(p.backA)]);
  poly(ctx,[p.frontA,p.frontB,p.backB,p.backA]);
  // Retain a continuous grounding stroke at the true shared edge.
  // It closes subpixel cracks between adjacent segments in the mask.
  ctx.beginPath();ctx.moveTo(p.a.x,p.a.y);ctx.lineTo(p.b.x,p.b.y);
  ctx.lineWidth=Math.max(2,7*zoom);ctx.strokeStyle=ctx.fillStyle;
  ctx.lineCap='round';ctx.stroke();
  ctx.restore();
  return true;
 }

 // Direction-specific, authored SVG material art. Each SVG has its own
 // precisely measured transparent bounds and a known footpoint at side.a.
 // Never rotate a 2.5D sprite (which would tilt its upright timber posts).
 // A missing image retains the existing Canvas fallback for older browsers.
 const wallArtMeta={
  palisade:[[150,160,11,86],[28,216,14,82],[150,160,139,86],
   [150,160,139,148],[28,216,14,208],[150,160,11,148]],
  stone:[[156,167,14,89],[40,216,20,82],[156,167,142,89],
   [156,167,142,152],[40,216,20,208],[156,167,14,152]]
 };
 // Palisade v5: eight painted binary assets, with individually complete
 // posts and identical 70-unit above-ground pole bodies. Every image has a
 // canonical anchor at the ORIGINAL (not trimmed) first hex corner.
 // Endpoints are inset by 10.5 world units; join art owns the corners.
 // Six directions share EXACT hex-edge geometry, with no paper-thin
 // transformation of a horizontal facade at east/west directions.
 const palisadeRasterMeta=[
  [140,148,6,78.368581],[28,210,14,78.184291],
  [141,148,134,78.815709],[141,148,134,141.631419],
  [28,210,14,203.815709],[141,148,6,141.184291]
 ];
 const palisadeMaterial={inset:10.5,width:16,height:70,
  cornerWidth:25,cornerHeight:76,endWidth:23,endHeight:76};
 const palisadeJoinArt=new Map();
 // Stone v6 uses newly constructed palisade-aligned 3x raster masonry.
 // 3x raster sprites retain fixed 2.5D anchors and upright stone faces.
 // No image is tilted or stretched by direction at runtime.
 const stoneJoinArt=new Map();
 const stoneRasterMeta=wallArtMeta.stone;
 const stoneMaterial={cornerWidth:30,cornerHeight:74,endWidth:26,endHeight:74};
 const wallArt=new Map();
 let artworkPromise=null;
 function artworkReady(){
  if(typeof Image==='undefined')return Promise.resolve(false);
  if(artworkPromise)return artworkPromise;
  const pending=[];
  for(const kind of kinds)for(let side=0;side<6;side++){
   const name=kind+':'+side,image=new Image();
   wallArt.set(name,image);
   pending.push(new Promise(resolve=>{
    image.onload=()=>resolve(true);
    image.onerror=()=>resolve(false);
    image.src='assets/walls/'+kind+(kind==='stone'?'/v6':'')+'/edge_dir'+side+
     (kind==='palisade'?'.webp?v=20261123-painted-volumetric-v5':
      '.png?v=20261123-stone-palisade-native-v6');
   }));
  }
  for(const name of ['corner_post','end_post']){
   const image=new Image();palisadeJoinArt.set(name,image);
   pending.push(new Promise(resolve=>{
    image.onload=()=>resolve(true);
    image.onerror=()=>resolve(false);
    image.src='assets/walls/palisade/'+name+'.webp?v=20261123-painted-volumetric-v5';
   }));
  }
  for(const name of ['corner_post','end_post']){
   const image=new Image();stoneJoinArt.set(name,image);
   pending.push(new Promise(resolve=>{
    image.onload=()=>resolve(true);
    image.onerror=()=>resolve(false);
    image.src='assets/walls/stone/v6/'+name+'.png?v=20261123-stone-palisade-native-v6';
   }));
  }
  artworkPromise=Promise.all(pending).then(results=>{
   if(typeof window.dispatchEvent==='function'&&typeof Event!=='undefined')
    window.dispatchEvent(new Event('vedras:wall-art-ready'));
   return results.every(Boolean);
  });
  return artworkPromise;
 }
 function artworkInfo(){return {count:wallArt.size,
  loaded:[...wallArt.values()].filter(i=>i.naturalWidth>0).length,
  total:12,
  postsLoaded:[...palisadeJoinArt.values()].filter(i=>i.naturalWidth>0).length,
  postsTotal:2,
  stonePostsLoaded:[...stoneJoinArt.values()].filter(i=>i.naturalWidth>0).length,
  stonePostsTotal:2};}
 function drawArtwork(ctx,edge,project,zoom){
  if(typeof Image==='undefined')return false;
  if(!artworkPromise)artworkReady();
  const g=geometry(edge);if(!g)return false;
  const img=wallArt.get(edge.kind+':'+g.side);
  if(!img?.naturalWidth)return false;
  const [w,h,ax,ay]=(edge.kind==='palisade'?
   palisadeRasterMeta:stoneRasterMeta)[g.side];
  const origin=project(g.a.x,g.a.y);
  ctx.save();ctx.globalAlpha=1;ctx.filter='none';
  ctx.globalCompositeOperation='source-over';
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   ctx.drawImage(img,origin.x-ax*zoom,origin.y-ay*zoom,w*zoom,h*zoom);
  ctx.restore();
  return true;
 }
 // Three wall segments at most can touch one hex vertex. The same canonical
 // node is shared by both hex owners and all six orientation combinations.
 // A small volume/corner graphic at each node seals every direction pair
 // without storing the exponential number of full wall combinations.
 function junctions(edges){
  const map=new Map();
  for(const e of edges||[]){
   const g=geometry(e);if(!g)continue;
   for(const [p,other] of [[g.a,g.b],[g.b,g.a]]){
    const id=Math.round(p.x*1e5)+','+Math.round(p.y*1e5);
    let node=map.get(id);
    if(!node){node={id,x:p.x,y:p.y,incident:[],kinds:[],degree:0};
     map.set(id,node);}
    node.incident.push({kind:e.kind,angle:Math.atan2(other.y-p.y,other.x-p.x)});
    if(!node.kinds.includes(e.kind))node.kinds.push(e.kind);
   }
  }
  return [...map.values()].map(n=>({...n,
   degree:n.incident.length,kind:n.kinds.includes('stone')?'stone':'palisade'}))
   .sort((a,b)=>a.y-b.y||a.x-b.x);
 }
 function drawJoin(ctx,node,project,zoom=1){
  if(!node||!node.degree)return false;
  // Mixed stone/wood vertices are finished with a deliberate timber post,
  // not a stone pier running through the palisade's wooden body.
  const timber=node.kind==='palisade'||node.kinds?.includes('palisade')&&
   node.kinds?.includes('stone');
  if(typeof Image!=='undefined'){
   if(!artworkPromise)artworkReady();
   const end=node.degree===1,material=timber?palisadeMaterial:stoneMaterial;
   const image=(timber?palisadeJoinArt:stoneJoinArt).get(end?'end_post':'corner_post');
   if(image?.naturalWidth){
    const p=project(node.x,node.y),
     w=(end?material.endWidth:material.cornerWidth)*zoom,
     h=(end?material.endHeight:material.cornerHeight)*zoom;
    // Each complete painted pier/post is independently grounded at the
    // one shared hex corner. Mixed timber/stone vertices retain timber art.
    ctx.save();ctx.globalAlpha=1;ctx.filter='none';
    ctx.globalCompositeOperation='source-over';
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
     ctx.drawImage(image,p.x-w/2,p.y-h,w,h);
    ctx.restore();return true;
   }
  }
  const p=project(node.x,node.y),stone=node.kind==='stone',
   h=heightFor(node.kind)*zoom,w=(stone?14:8.5)*zoom;
  const top=p.y-h;
  ctx.save();ctx.globalAlpha=1;ctx.filter='none';
  ctx.globalCompositeOperation='source-over';
  // Broad base and full-height pier/post overlap adjacent direction sprites.
  // Every visible bottom edge lies on the ground, with no lower spikes.
  if(stone){
   ctx.fillStyle='#554f43';poly(ctx,[
    {x:p.x-w*1.08,y:p.y},{x:p.x+w*1.08,y:p.y},
    {x:p.x+w*1.08,y:top},{x:p.x-w*1.08,y:top}]);
   ctx.fillStyle='#90806c';poly(ctx,[
    {x:p.x-w*.94,y:p.y},{x:p.x+w*.30,y:p.y},
    {x:p.x+w*.30,y:top},{x:p.x-w*.94,y:top}]);
   ctx.fillStyle='#bcac91';poly(ctx,[
    {x:p.x-w*.94,y:top},{x:p.x+w*.30,y:top},
    {x:p.x+w,y:top-4*zoom},{x:p.x-w*.2,y:top-4*zoom}]);
   ctx.strokeStyle='#4d493f';ctx.lineWidth=1.15*zoom;
   for(let i=1;i<4;i++){
    const y=p.y-h*i/4;
    ctx.beginPath();ctx.moveTo(p.x-w,y);ctx.lineTo(p.x+w,y);ctx.stroke();
   }
   ctx.strokeStyle='#ddd0b6';ctx.lineWidth=1.3*zoom;
   ctx.beginPath();ctx.moveTo(p.x-w*.92,top);
   ctx.lineTo(p.x+w*.3,top);ctx.stroke();
   // Crenellated corner/end pier. Its 9-unit merlons align with the
   // directional stone artwork, while the shared vertex remains the sole
   // footprint anchor for all six directions and mixed wall connections.
   ctx.fillStyle='#736a5d';
   poly(ctx,[{x:p.x-w*1.13,y:top},{x:p.x+w*1.13,y:top},
    {x:p.x+w*1.13,y:top-3*zoom},{x:p.x-w*1.13,y:top-3*zoom}]);
   ctx.fillStyle='#c4b69e';
   poly(ctx,[{x:p.x-w*1.18,y:top-3*zoom},{x:p.x+w*.75,y:top-3*zoom},
    {x:p.x+w*1.15,y:top-6*zoom},{x:p.x-w*.78,y:top-6*zoom}]);
   for(const t of [-.70,0,.70]){
    const x=p.x+w*t,side=3.5*zoom,y=top-3*zoom,z=y-7.5*zoom;
    ctx.fillStyle=t===0?'#b9ab96':'#a49884';
    poly(ctx,[{x:x-side,y:y},{x:x+side,y:y},
     {x:x+side,y:z},{x:x-side,y:z}]);
    ctx.fillStyle='#e2d3bc';
    poly(ctx,[{x:x-side,y:z},{x:x+side,y:z},
     {x:x+side+2*zoom,y:z-2*zoom},{x:x-side+2*zoom,y:z-2*zoom}]);
    ctx.strokeStyle='#6d6458';ctx.lineWidth=.85*zoom;
    ctx.strokeRect?.(x-side,y-7.5*zoom,side*2,7.5*zoom);
   }
   // A recessed defensive slit, avoiding a single flat stone rectangle.
   ctx.fillStyle='#4c4c46';
   poly(ctx,[{x:p.x-w*.14,y:top+14*zoom},
    {x:p.x+w*.10,y:top+14*zoom},{x:p.x+w*.08,y:top+34*zoom},
    {x:p.x-w*.12,y:top+34*zoom}]);
   ctx.strokeStyle='#c9b9a2';ctx.lineWidth=1.1*zoom;
   ctx.beginPath();ctx.moveTo(p.x-w*.18,top+14*zoom);
   ctx.lineTo(p.x-w*.18,top+34*zoom);ctx.stroke();
  }else{
   ctx.fillStyle='#4b3423';poly(ctx,[
    {x:p.x-w,y:p.y},{x:p.x+w,y:p.y},
    {x:p.x+w,top},{x:p.x-w,top}]);
   ctx.fillStyle='#976137';poly(ctx,[
    {x:p.x-w*.85,y:p.y},{x:p.x+w*.15,y:p.y},
    {x:p.x+w*.15,y:top},{x:p.x-w*.85,y:top}]);
   ctx.fillStyle='#b77e49';poly(ctx,[
    {x:p.x-w,y:top},{x:p.x+w,y:top},
    {x:p.x, y:top-8*zoom}]);
   ctx.strokeStyle='#d6a369';ctx.lineWidth=1.35*zoom;
   ctx.beginPath();ctx.moveTo(p.x-w*.46,p.y-5*zoom);
   ctx.lineTo(p.x-w*.46,top+5*zoom);ctx.stroke();
  }
  ctx.restore();
  return true;
 }
 function drawJoinShadow(ctx,node,project,zoom=1,global={}){
  if(!node||!node.degree)return false;
  const p=project(node.x,node.y);
  const timber=node.kind==='palisade'||node.kinds?.includes('palisade')&&
   node.kinds?.includes('stone');
  const kind=timber?'palisade':'stone';
  const d=shadowVector(kind,zoom,global);
  const sx=Number(global.offsetX??-.07)*d.height;
  const sy=Number(global.offsetY??.025)*d.height;
  const moved={x:p.x+d.x+sx,y:p.y+d.y+sy};
  const halfWidth=(timber?10:13)*zoom;
  const tone=window.VedrasShadowTone;
  ctx.save();
  ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=tone?.targetAlpha?.('sprite')??.40;
  ctx.fillStyle=tone?.colorCss?.()||'#203131';
  ctx.filter='blur('+Math.min(12,Math.max(1,
   (Number(global.softness)||6)*zoom*.65))+'px)';
  // A connected narrow footprint, NO independently blurred circles at
  // either end. Combined with edge casts in the common nonstacking mask.
  poly(ctx,[{x:p.x-halfWidth,y:p.y-3*zoom},
   {x:p.x+halfWidth,y:p.y-3*zoom},
   {x:moved.x+halfWidth,y:moved.y+3*zoom},
   {x:moved.x-halfWidth,y:moved.y+3*zoom}]);
  ctx.restore();return true;
 }

 function draw(ctx,edge,project,zoom=1){
  if(drawArtwork(ctx,edge,project,zoom))return true;
  const p=footprint(edge,project,zoom);if(!p)return false;
  const {frontA,frontB,backA,backB,depth,height:h}=p;
  const frontTopA=lift(frontA,h),frontTopB=lift(frontB,h);
  const backTopA=lift(backA,h),backTopB=lift(backB,h);
  const length=Math.hypot(frontB.x-frontA.x,frontB.y-frontA.y);
  const stone=edge.kind==='stone';
  ctx.save();
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  ctx.filter='none';ctx.lineJoin='round';ctx.lineCap='round';
  if(stone){
   // A broad, low light-gray medieval stone wall. Unlike v1, volume
   // extends into BOTH neighboring hexes around their common edge.
   ctx.fillStyle='#8b8f8c';
   poly(ctx,[frontB,backB,backTopB,frontTopB]);
   ctx.fillStyle='#bfc4c1';
   poly(ctx,[frontA,frontB,frontTopB,frontTopA]);
   ctx.fillStyle='#e0e2dc';
   poly(ctx,[frontTopA,frontTopB,backTopB,backTopA]);
   // Horizontal courses and staggered ashlar joints. Their projected
   // endpoints remain parallel to the wall regardless of edge direction.
   const rows=4,cols=Math.max(4,Math.round(length/(25*zoom)));
   ctx.strokeStyle='#777e7b';
   ctx.lineWidth=Math.max(.85,1.2*zoom);
   for(let row=1;row<rows;row++){
    const a=lift(frontA,h*row/rows),b=lift(frontB,h*row/rows);
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
   }
   for(let row=0;row<rows;row++){
    const offset=row%2?.5:0;
    for(let i=1;i<=cols;i++){
     const t=(i-offset)/cols;
     if(t<=.01||t>=.99)continue;
     const start=lift(mix(frontA,frontB,t),h*row/rows);
     const end=lift(start,h/rows);
     ctx.beginPath();ctx.moveTo(start.x,start.y);
     ctx.lineTo(end.x,end.y);ctx.stroke();
    }
   }
   // Stone faceting gives each course a visible (but restrained) edge.
   ctx.strokeStyle='#eef0e9';ctx.lineWidth=Math.max(1,1.4*zoom);
   ctx.beginPath();ctx.moveTo(frontTopA.x,frontTopA.y);
   ctx.lineTo(frontTopB.x,frontTopB.y);ctx.stroke();
   // Low corner piers close adjacent segments without raising the roof.
   for(const t of [0,1]){
    const a=mix(frontA,frontB,t),b=mix(backA,backB,t);
    const at=lift(a,h),bt=lift(b,h);
    ctx.fillStyle='#acb1af';
    const w=3.8*zoom;
    poly(ctx,[{x:a.x-w,y:a.y},{x:a.x+w,y:a.y},
     {x:at.x+w,y:at.y},{x:at.x-w,y:at.y}]);
    ctx.fillStyle='#d5d9d4';
    poly(ctx,[{x:at.x-w,y:at.y},{x:at.x+w,y:at.y},
     {x:bt.x+w,y:bt.y},{x:bt.x-w,y:bt.y}]);
   }
  }else{
   // Strong, separately readable trunks, not one smooth brown slab.
   // Count is based on WORLD length, so zoom and orientation do not
   // change the number of posts or produce a tall NW-only variation.
   const count=Math.max(4,Math.round(length/(12*zoom)));
   ctx.fillStyle='#69482f';
   poly(ctx,[frontA,frontB,frontTopB,frontTopA]);
   // Two horizontal rear braces. Individual timber posts go in front.
   ctx.strokeStyle='#593c2b';
   ctx.lineWidth=Math.max(2,3*zoom);
   for(const level of [.34,.62]){
    const a=lift(frontA,h*level),b=lift(frontB,h*level);
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
   }
   for(let i=0;i<count;i++){
    const t0=i/count,t1=(i+.94)/count,tm=(i+.47)/count;
    const a=mix(frontA,frontB,t0),b=mix(frontA,frontB,t1);
    const c=mix(backA,backB,t0),d=mix(backA,backB,t1);
    const at=lift(a,h),bt=lift(b,h),ct=lift(c,h),dt=lift(d,h);
    const peak=lift(mix(at,bt,.5),8*zoom);
    const backPeak=lift(mix(ct,dt,.5),8*zoom);
    // Distinct timber side, front and pointed head in consistent light.
    ctx.fillStyle='#61432f';poly(ctx,[b,d,dt,bt]);
    ctx.fillStyle=i%3===0?'#99704b':i%3===1?'#a47a51':'#906643';
    poly(ctx,[a,b,bt,at]);
    ctx.fillStyle='#be9467';
    poly(ctx,[at,bt,peak]);
    ctx.fillStyle='#765235';
    poly(ctx,[bt,dt,backPeak,peak]);
    ctx.fillStyle='#ceaa78';
    poly(ctx,[at,peak,backPeak,ct]);
    // Narrow sunlight stripe and a restrained vertical grain mark.
    const gl=mix(a,b,.73),gt=lift(gl,h*.84);
    ctx.strokeStyle='#c09a70';ctx.lineWidth=Math.max(.6,.9*zoom);
    ctx.beginPath();ctx.moveTo(gl.x,gl.y-h*.13);
    ctx.lineTo(gt.x,gt.y);ctx.stroke();
    const gr=mix(a,b,.30),grTop=lift(gr,h*.68);
    ctx.strokeStyle='#6c4b35';ctx.lineWidth=Math.max(.6,.75*zoom);
    ctx.beginPath();ctx.moveTo(gr.x,gr.y-h*.33);
    ctx.lineTo(grTop.x,grTop.y);ctx.stroke();
   }
  }
  ctx.restore();
  return true;
 }
 return {DIRS,kinds,point,identity,context,canPlace,normalize,setEdge,removeEdge,
  occupiedRiverEdges,geometry,midpoint,blocksPoint,heightFor,widthFor,footprint,shadowVector,draw,drawShadow,
  artworkReady,artworkInfo,wallArtMeta,palisadeRasterMeta,stoneRasterMeta,palisadeMaterial,stoneMaterial,junctions,drawJoin,drawJoinShadow};
})();
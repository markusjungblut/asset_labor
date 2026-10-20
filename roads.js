/* Vedras Reiche paths v0.11.4.
 * Undirected hex-centre graph: six simultaneous neighbor links per hex,
 * one shared port at every side midpoint, junction-safe strokes and
 * repeatable earthy in-game graphics. All upgrades reuse the SAME graph.
 */
'use strict';
window.VedrasRoads=(()=>{
 const DIRS=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];
 const levels=['trail','packed','stone'];
 // Soft embedded surfaces rather than flat outlined ribbons.
 // World size is unchanged; width is the compacted central track, not a
 // solid opaque road slab. Three visually distinct materials share a graph.
 const profiles={
  trail:{title:'Trampelpfad · eingelaufene Erde',width:17,outer:42,shoulder:30,
   edge:'rgba(82,64,38,.105)',bank:'rgba(163,136,92,.25)',center:[156,133,93],speck:[96,85,62],opacity:.73},
  packed:{title:'Befestigter Erdweg · Fahrspuren',width:26,outer:46,shoulder:36,
   edge:'rgba(84,68,47,.16)',bank:'rgba(148,125,90,.32)',center:[166,146,112],speck:[103,89,67],opacity:.83},
  stone:{title:'Steinstraße · Pflaster',width:32,outer:49,shoulder:40,
   edge:'rgba(71,68,59,.23)',bank:'rgba(132,127,108,.36)',center:[152,147,131],speck:[99,95,83],opacity:.95}
 };
 const key=p=>p.q+','+p.r,asPoint=p=>Array.isArray(p)?{q:p[0],r:p[1]}:p;
 const validPoint=p=>p&&Number.isInteger(p.q)&&Number.isInteger(p.r)&&Math.abs(p.q)<100000&&Math.abs(p.r)<100000;
 const side=(a,b)=>DIRS.findIndex(([dq,dr])=>b.q===a.q+dq&&b.r===a.r+dr);
 function identity(a,b){
  a=asPoint(a);b=asPoint(b);
  if(!validPoint(a)||!validPoint(b)||side(a,b)<0)return null;
  const ka=key(a),kb=key(b);
  return ka<kb?ka+'|'+kb:kb+'|'+ka;
 }
 const type=x=>levels.includes(x)?x:'trail';
 function normalizeEdges(input,cells,isWet,isBlocked){
  const visible=new Map((cells||[]).map(c=>[key(c),c])),unique=new Map();
  if(!Array.isArray(input))return [];
  for(const raw of input.slice(0,12000)){
   if(!raw||typeof raw!=='object')continue;
   const a=asPoint(raw.a),b=asPoint(raw.b),id=identity(a,b);
   if(!id||!visible.has(key(a))||!visible.has(key(b)))continue;
   if((isWet&&(isWet(visible.get(key(a)))||isWet(visible.get(key(b)))))||
     (isBlocked&&(isBlocked(visible.get(key(a)))||isBlocked(visible.get(key(b))))))continue;
   const pair=key(a)<key(b)?[a,b]:[b,a];
   const next={a:[pair[0].q,pair[0].r],b:[pair[1].q,pair[1].r],level:type(raw.level)};
   const prev=unique.get(id);
   if(!prev||levels.indexOf(next.level)>levels.indexOf(prev.level))unique.set(id,next);
  }
  return [...unique.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([,v])=>v);
 }
 function setEdge(input,a,b,level,cells,isWet,isBlocked){
  const id=identity(a,b);
  if(!id)return normalizeEdges(input,cells,isWet,isBlocked);
  const others=normalizeEdges(input,cells,isWet,isBlocked).filter(e=>identity(e.a,e.b)!==id);
  return normalizeEdges([...others,{a:[asPoint(a).q,asPoint(a).r],b:[asPoint(b).q,asPoint(b).r],level:type(level)}],cells,isWet,isBlocked);
 }
 function removeEdge(input,a,b,cells,isWet,isBlocked){
  const id=identity(a,b);
  return normalizeEdges(input,cells,isWet,isBlocked).filter(e=>identity(e.a,e.b)!==id);
 }
 function mask(edges,p){
  p=asPoint(p);if(!validPoint(p))return 0;
  let bits=0;
  for(const edge of edges||[]){
   const a=asPoint(edge.a),b=asPoint(edge.b);
   if(key(a)===key(p)){const d=side(a,b);if(d>=0)bits|=1<<d;}
   else if(key(b)===key(p)){const d=side(b,a);if(d>=0)bits|=1<<d;}
  }
  return bits;
 }
 function degree(edges,p){let n=mask(edges,p),count=0;while(n){n&=n-1;count++;}return count;}
 const center=(p,hex=256)=>({x:hex*(p.q+p.r/2),y:1.5*(hex/Math.sqrt(3))*p.r});
 function port(a,b,hex=256){const x=center(asPoint(a),hex),y=center(asPoint(b),hex);return{x:(x.x+y.x)/2,y:(x.y+y.y)/2};}
 function hash(x,y,seed=0){
  let n=Math.imul(x+37,374761393)^Math.imul(y+91,668265263)^Math.imul(seed+7,2246822519);
  n^=n>>>13;n=Math.imul(n,1274126177);
  return (n^(n>>>16))>>>0;
 }
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 // Seeded low-amplitude bends vanish at t=0, 1/2, and 1:
 // the shared side is crossed EXACTLY at its midpoint, even across relief.
 const roadCourseCache=new Map();
 function course(edge,hex=256,groundY=null){
  // The same centre-line is reused by painting, collisions and plant
  // placement. Cache unprojected world curves; relief projects a copy.
  const id=identity(edge.a,edge.b);
  const cacheKey=key(asPoint(edge.a))+'>'+key(asPoint(edge.b))+'@'+hex;
  if(groundY){
   return course(edge,hex,null).map(p=>({x:p.x,y:groundY(p.x,p.y)}));
  }
  if(roadCourseCache.has(cacheKey))return roadCourseCache.get(cacheKey);
  const a=asPoint(edge.a),b=asPoint(edge.b),p=center(a,hex),z=center(b,hex);
  const vx=z.x-p.x,vy=z.y-p.y,length=Math.hypot(vx,vy),nx=-vy/length,ny=vx/length;
  const noise=hash(a.q+b.q,a.r+b.r,hash(a.q-b.q,a.r-b.r,11));
  const bend=((noise%2001)/1000-1)*4.2,points=[];
  for(let i=0;i<=16;i++){
   const t=i/16,jitter=bend*Math.sin(t*2*Math.PI);
   const x=p.x+vx*t+nx*jitter,y=p.y+vy*t+ny*jitter;
   points.push({x,y});
  }
  if(id){
   roadCourseCache.set(cacheKey,points);
   if(roadCourseCache.size>1400)roadCourseCache.delete(roadCourseCache.keys().next().value);
  }
  return points;
 }
 function trace(ctx,points){
  ctx.beginPath();
  for(let i=0;i<points.length;i++){
   const p=points[i];if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
  }
 }
 const cache=new Map();
 // Deterministic tiled soil, porous alpha reveals the actual biome underneath.
 // Coarse layered noise, moss/dirt micro-grains, footprint dabs and stone chips.
 function texture(profileName){
  if(cache.has(profileName))return cache.get(profileName);
  if(typeof document==='undefined')return null;
  const p=profiles[profileName],size=128,canvas=document.createElement('canvas');
  canvas.width=canvas.height=size;
  const g=canvas.getContext('2d'),img=g.createImageData(size,size),out=img.data;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const i=4*(y*size+x),fine=hash(x,y,profileName.length*129),
     coarse=hash(x>>3,y>>3,577),macro=hash(x>>5,y>>5,771),
     vein=Math.sin((x*.22+y*.07))*Math.cos((y*.17-x*.045)),
     grain=(fine%43)-21,stone=profileName==='stone'&&((coarse>>>7)%17)<4,
     thin=(fine>>>12)%97===0,weather=(macro%31)-15,
     delta=grain*.31+((coarse%37)-18)*.49+weather*.50+vein*5+
       (stone?11:0)-(thin?18:0);
   const base=stone&&thin?p.speck:p.center;
   out[i]=clamp(Math.round(base[0]+delta),0,255);
   out[i+1]=clamp(Math.round(base[1]+delta*.91),0,255);
   out[i+2]=clamp(Math.round(base[2]+delta*.78),0,255);
   // Dirt stays partially transparent so forest/meadow hues appear inside.
   out[i+3]=profileName==='stone'?Math.round(217+(fine%24)):
     Math.round(168+(fine%62));
  }
  g.putImageData(img,0,0);cache.set(profileName,canvas);return canvas;
 }
 function drawEdges(ctx,entries,hex,groundY,weight,paint){
  if(!entries.length)return;
  ctx.lineWidth=weight;ctx.strokeStyle=paint;
  ctx.lineCap='round';ctx.lineJoin='round';
  for(const e of entries){trace(ctx,course(e,hex,groundY));ctx.stroke();}
 }
 function drawNodes(ctx,entries,hex,groundY,weight,paint){
  const nodes=new Map();
  for(const e of entries)for(const p of [asPoint(e.a),asPoint(e.b)])nodes.set(key(p),p);
  ctx.fillStyle=paint;
  for(const p of nodes.values()){
   const c=center(p,hex),y=groundY?groundY(c.x,c.y):c.y;
   ctx.beginPath();ctx.arc(c.x,y,weight*.501,0,2*Math.PI);ctx.fill();
  }
 }
 // One continuous slightly asymmetric compacted strip, not a perfect
 // software stroke. Direction-aligned soil banks meander subtly between
 // hex centres while the endpoints remain precise for six-way junctions.
 function drawWornFill(ctx,entries,hex,groundY,width,paint,level){
  const rough=level==='trail'?.16:level==='packed'?.075:.028;
  ctx.fillStyle=paint;
  for(const edge of entries){
   const pts=course(edge,hex,groundY),left=[],right=[];
   const id=identity(edge.a,edge.b),phase=hash(id.length,edge.a[0]||0,edge.b[1]||0)%628/100;
   for(let i=0;i<pts.length;i++){
    const previous=pts[Math.max(0,i-1)],next=pts[Math.min(pts.length-1,i+1)],
      dx=next.x-previous.x,dy=next.y-previous.y,len=Math.hypot(dx,dy)||1,
      nx=-dy/len,ny=dx/len,t=i/(pts.length-1),smooth=Math.sin(Math.PI*t),
      a=width*.5*(1+rough*smooth*(.69*Math.sin(t*12+phase)+.36*Math.cos(t*17+phase))),
      b=width*.5*(1+rough*smooth*(.63*Math.cos(t*11+phase)-.32*Math.sin(t*18+phase)));
    left.push({x:pts[i].x+nx*a,y:pts[i].y+ny*a});
    right.push({x:pts[i].x-nx*b,y:pts[i].y-ny*b});
   }
   ctx.beginPath();ctx.moveTo(left[0].x,left[0].y);
   for(let i=1;i<left.length;i++)ctx.lineTo(left[i].x,left[i].y);
   for(let i=right.length-1;i>=0;i--)ctx.lineTo(right[i].x,right[i].y);
   ctx.closePath();ctx.fill();
  }
 }
 // Off-centre earth grains, granular lower recesses, worn light on the upper
 // rim, and etched footprints/wheel ruts. All detail fades at each node.
 function detail(ctx,entries,level,hex,groundY){
  const p=profiles[level];ctx.lineJoin='round';ctx.lineCap='round';
  for(const edge of entries){
   const pts=course(edge,hex,groundY),id=identity(edge.a,edge.b);
   const salt=[...id].reduce((v,c)=>Math.imul(v,31)+c.charCodeAt(0)|0,17);
   // Two soft indented parallel wheels on packed roads, a single asymmetric
   // foot groove on trails; stone has irregular joint marks instead.
   if(level!=='stone'){
    const ruts=level==='packed'?[-.24,.24]:[.12];
    for(const offset of ruts){
     for(const [distance,color] of [
      [0,'rgba(65,57,42,.17)'],[1.8,'rgba(237,220,180,.11)']]){
      ctx.strokeStyle=color;ctx.lineWidth=level==='packed'?2.6:2.1;
      ctx.beginPath();
      for(let i=2;i<pts.length-2;i++){
       const t=i/(pts.length-1),prev=pts[i-1],next=pts[i+1],
         dx=next.x-prev.x,dy=next.y-prev.y,l=Math.hypot(dx,dy)||1,
         normal={x:-dy/l,y:dx/l},u=offset*p.width+distance;
       const px=pts[i].x+normal.x*u,py=pts[i].y+normal.y*u;
       if(i===2)ctx.moveTo(px,py);else ctx.lineTo(px,py);
      }
      ctx.stroke();
     }
    }
   }
   for(let i=2;i<pts.length-2;i++){
    const base=pts[i],prev=pts[i-1],next=pts[i+1],
      dx=next.x-prev.x,dy=next.y-prev.y,len=Math.hypot(dx,dy)||1,
      nx=-dy/len,ny=dx/len;
    for(let j=-1;j<=1;j++){
     const h=hash(i*5+j,salt,level.length),side=((h%140)/70-1);
     if((h>>>9)%4===0)continue;
     const offset=side*p.width*.46,x=base.x+nx*offset,y=base.y+ny*offset;
     const bright=(h>>>12)%3===0;
     ctx.fillStyle=bright?'rgba(236,219,174,.29)':'rgba(82,73,52,.20)';
     ctx.beginPath();ctx.ellipse(x,y,level==='stone'?1.7:.9,
       level==='stone'?2.2:1.45,(h%17)/10,0,Math.PI*2);ctx.fill();
    }
    if(level==='stone'&&i%3===0){
     ctx.strokeStyle='rgba(79,75,67,.24)';ctx.lineWidth=1.4;
     ctx.beginPath();
     ctx.moveTo(base.x-nx*p.width*.32,base.y-ny*p.width*.32);
     ctx.lineTo(base.x+nx*p.width*.30,base.y+ny*p.width*.30);ctx.stroke();
    }
   }
  }
 }
 function render(ctx,edges,options={}){
  if(!ctx||!Array.isArray(edges)||!edges.length)return {edges:0,nodes:0};
  const hex=Number(options.hex)||256,groundY=typeof options.groundY==='function'?options.groundY:null,
    normalized=edges.filter(e=>identity(e.a,e.b)),allNodes=new Set();
  ctx.save();
  for(const e of normalized)for(const p of [e.a,e.b])allNodes.add(key(asPoint(p)));
  for(const level of levels){
   const group=normalized.filter(e=>type(e.level)===level);
   if(!group.length)continue;
   const p=profiles[level],tile=texture(level),
     pattern=tile&&ctx.createPattern?ctx.createPattern(tile,'repeat'):null;
   // Wide but nearly transparent softened earth/shoulder, followed by
   // semi-transparent compacted earth. This avoids bright plastic ribbons.
   for(const [weight,color] of [[p.outer,p.edge],[p.shoulder,p.bank]]){
    drawEdges(ctx,group,hex,groundY,weight,color);
    drawNodes(ctx,group,hex,groundY,weight,color);
   }
   ctx.save();
   ctx.globalAlpha=p.opacity;
   const fill=pattern||'rgba('+p.center.join(',')+',.72)';
   drawWornFill(ctx,group,hex,groundY,p.width,fill,level);
   drawNodes(ctx,group,hex,groundY,p.width,fill);
   ctx.restore();
   if(options.detail!==false)detail(ctx,group,level,hex,groundY);
  }
  ctx.restore();return {edges:normalized.length,nodes:allNodes.size};
 }
 // World-space root clearance: remove ONLY objects whose ground anchor
 // falls on a road's capsule. Overhanging crowns and branches may remain.
 function distanceToSegment(p,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy;
  const t=len2?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/len2,0,1):0;
  return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
 }
 function blocksPoint(x,y,edges,padding=8,hex=256){
  if(!Number.isFinite(x)||!Number.isFinite(y))return false;
  const p={x,y};
  for(const edge of edges||[]){
   if(!identity(edge.a,edge.b))continue;
   const radius=profiles[type(edge.level)].outer*.5+Math.max(0,padding),
     a=center(asPoint(edge.a),hex),b=center(asPoint(edge.b),hex),
     bound=radius+6;
   // Reject nearly all road segments cheaply before point-to-segment math.
   if(x<Math.min(a.x,b.x)-bound||x>Math.max(a.x,b.x)+bound||
      y<Math.min(a.y,b.y)-bound||y>Math.max(a.y,b.y)+bound)continue;
   const pts=course(edge,hex);
   for(let i=1;i<pts.length;i++)
    if(distanceToSegment(p,pts[i-1],pts[i])<=radius)return true;
  }
  return false;
 }
 function clearCorridor(previous,next,natureInstances,hexObjects,hex=256){
  const previousIds=new Set((previous||[]).map(e=>identity(e.a,e.b)));
  const added=(next||[]).filter(e=>!previousIds.has(identity(e.a,e.b)));
  if(!added.length)return {natureInstances:natureInstances||[],hexObjects:hexObjects||{},removed:0};
  const nature=(natureInstances||[]).filter(inst=>{
   const p=center(inst,hex);
   return !blocksPoint(p.x+(Number(inst.dx)||0),p.y+(Number(inst.dy)||0),added,9,hex);
  });
  const objects={};
  for(const [k,obj] of Object.entries(hexObjects||{})){
   const [q,r]=k.split(',').map(Number),p=center({q,r},hex);
   if(!blocksPoint(p.x,p.y+52,added,Math.max(42,Math.min(72,(Number(obj?.width)||150)*.38)),hex))objects[k]=obj;
  }
  return {natureInstances:nature,hexObjects:objects,
   removed:(natureInstances||[]).length-nature.length+
     Object.keys(hexObjects||{}).length-Object.keys(objects).length};
 }
 return {DIRS,levels,profiles,key,side,identity,normalizeEdges,setEdge,removeEdge,mask,degree,center,port,course,render,blocksPoint,clearCorridor};
})();

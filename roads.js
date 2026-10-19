/* Vedras Reiche paths v0.11.4.
 * Undirected hex-centre graph: six simultaneous neighbor links per hex,
 * one shared port at every side midpoint, junction-safe strokes and
 * repeatable earthy in-game graphics. All upgrades reuse the SAME graph.
 */
'use strict';
window.VedrasRoads=(()=>{
 const DIRS=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];
 const levels=['trail','packed','stone'];
 const profiles={
  trail:{title:'Sandiger Trampelpfad',width:19,outer:33,shoulder:27,
   edge:'rgba(119,94,58,.18)',bank:'rgba(178,148,104,.46)',center:[204,180,135],highlight:'rgba(242,225,182,.13)',speck:[123,103,71]},
  packed:{title:'Befestigter Erdweg',width:27,outer:39,shoulder:34,
   edge:'rgba(101,89,69,.25)',bank:'rgba(160,137,104,.65)',center:[190,168,132],highlight:'rgba(231,209,170,.15)',speck:[117,102,78]},
  stone:{title:'Steinstraße',width:32,outer:44,shoulder:39,
   edge:'rgba(87,86,75,.38)',bank:'rgba(133,130,110,.80)',center:[170,164,143],highlight:'rgba(230,222,199,.10)',speck:[89,87,77]}
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
 function normalizeEdges(input,cells,isWet){
  const visible=new Map((cells||[]).map(c=>[key(c),c])),unique=new Map();
  if(!Array.isArray(input))return [];
  for(const raw of input.slice(0,12000)){
   if(!raw||typeof raw!=='object')continue;
   const a=asPoint(raw.a),b=asPoint(raw.b),id=identity(a,b);
   if(!id||!visible.has(key(a))||!visible.has(key(b)))continue;
   if(isWet&&(isWet(visible.get(key(a)))||isWet(visible.get(key(b)))))continue;
   const pair=key(a)<key(b)?[a,b]:[b,a];
   const next={a:[pair[0].q,pair[0].r],b:[pair[1].q,pair[1].r],level:type(raw.level)};
   const prev=unique.get(id);
   if(!prev||levels.indexOf(next.level)>levels.indexOf(prev.level))unique.set(id,next);
  }
  return [...unique.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([,v])=>v);
 }
 function setEdge(input,a,b,level,cells,isWet){
  const id=identity(a,b);
  if(!id)return normalizeEdges(input,cells,isWet);
  const others=normalizeEdges(input,cells,isWet).filter(e=>identity(e.a,e.b)!==id);
  return normalizeEdges([...others,{a:[asPoint(a).q,asPoint(a).r],b:[asPoint(b).q,asPoint(b).r],level:type(level)}],cells,isWet);
 }
 function removeEdge(input,a,b,cells,isWet){
  const id=identity(a,b);
  return normalizeEdges(input,cells,isWet).filter(e=>identity(e.a,e.b)!==id);
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
 function course(edge,hex=256,groundY=null){
  const a=asPoint(edge.a),b=asPoint(edge.b),p=center(a,hex),z=center(b,hex);
  const vx=z.x-p.x,vy=z.y-p.y,length=Math.hypot(vx,vy),nx=-vy/length,ny=vx/length;
  const noise=hash(a.q+b.q,a.r+b.r,hash(a.q-b.q,a.r-b.r,11));
  const bend=((noise%2001)/1000-1)*4.2,points=[];
  for(let i=0;i<=16;i++){
   const t=i/16,jitter=bend*Math.sin(t*2*Math.PI);
   const x=p.x+vx*t+nx*jitter,y=p.y+vy*t+ny*jitter;
   points.push({x,y:groundY?groundY(x,y):y});
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
 function texture(profileName){
  if(cache.has(profileName))return cache.get(profileName);
  if(typeof document==='undefined')return null;
  const p=profiles[profileName],size=128,canvas=document.createElement('canvas');
  canvas.width=canvas.height=size;
  const g=canvas.getContext('2d'),img=g.createImageData(size,size),out=img.data;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const i=4*(y*size+x),fine=hash(x,y,profileName.length*129),
    wave=5*Math.sin(x*Math.PI*4/size)*Math.cos(y*Math.PI*4/size)+
      4*Math.sin((x+y)*Math.PI*2/size);
   const grain=(fine%31)-15,speck=(fine>>>10)%61===0,stone=profileName==='stone'&&((fine>>>8)%45<5);
   const delta=wave*.48+grain*.28+(speck?-12:0)+(stone?12:0);
   const base=stone&&speck?p.speck:p.center;
   out[i]=clamp(Math.round(base[0]+delta),0,255);
   out[i+1]=clamp(Math.round(base[1]+delta*.9),0,255);
   out[i+2]=clamp(Math.round(base[2]+delta*.65),0,255);
   out[i+3]=255;
  }
  g.putImageData(img,0,0);cache.set(profileName,canvas);
  return canvas;
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
 function render(ctx,edges,options={}){
  if(!ctx||!Array.isArray(edges)||!edges.length)return {edges:0,nodes:0};
  const hex=Number(options.hex)||256,groundY=typeof options.groundY==='function'?options.groundY:null;
  const normalized=edges.filter(e=>identity(e.a,e.b));
  const allNodes=new Set();
  ctx.save();
  for(const e of normalized)for(const p of [e.a,e.b])allNodes.add(key(asPoint(p)));
  for(const level of levels){
   const group=normalized.filter(e=>type(e.level)===level);
   if(!group.length)continue;
   const p=profiles[level];
   const tile=texture(level),pattern=tile&&ctx.createPattern?ctx.createPattern(tile,'repeat'):null;
   // All arms of one material are painted in whole-network passes, not
   // as separately composited tiles; round hub unions remove star seams.
   for(const [weight,color] of [[p.outer,p.edge],[p.shoulder,p.bank],[p.width,pattern||'rgb('+p.center.join(',')+')']]){
    drawEdges(ctx,group,hex,groundY,weight,color);
    drawNodes(ctx,group,hex,groundY,weight,color);
   }
   // No translucent complete-arm overlay here: sixfold intersections would
   // otherwise become bright disks. Surface granularity comes from the tile.
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
   const pts=course(edge,hex),radius=profiles[type(edge.level)].outer*.5+Math.max(0,padding);
   if(pts.slice(1).some((v,i)=>distanceToSegment(p,pts[i],v)<=radius))return true;
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

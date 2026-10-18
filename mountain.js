/* v0.10.9 mountain formations: occupied core != visual / relief influence. */
'use strict';
window.VedrasMountains=(()=>{
 const DIRS=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];
 const key=(q,r)=>q+','+r;
 const distance=(a,b)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r));
 function cells(q,r,radius=0){const result=[];for(let dr=-radius;dr<=radius;dr++)for(let dq=-radius;dq<=radius;dq++)if(distance({q,r},{q:q+dq,r:r+dr})<=radius)result.push({q:q+dq,r:r+dr});return result;}
 function config(meta={}){const m=meta.mountain||{};return {
  radius:m.radius===2?2:1,coreRadius:m.coreRadius===1?1:0,
  shadowOpacity:Number.isFinite(m.shadowOpacity)?Math.max(0,Math.min(.65,m.shadowOpacity)):.23,
  flatten:m.flatten!==false
 };}
 function influence(instance){return cells(instance.q,instance.r,instance.radius===2?2:1).map(c=>key(c.q,c.r));}
 function occupied(instance){return cells(instance.q,instance.r,instance.coreRadius===1?1:0).map(c=>key(c.q,c.r));}
 function overlaps(a,b){const x=new Set(occupied(a));return occupied(b).some(k=>x.has(k));}
 function influenceOverlaps(a,b){const x=new Set(influence(a));return influence(b).some(k=>x.has(k));}
 // AABB is a conservative screen-space silhouette proxy. Alpha pixels are used
 // for casting shadows; geometry only decides whether chain sprites crowd too much.
 function screenBox(m,info={}){
  const size=Math.max(1,Number(info.width)||360),aspect=Math.max(.2,Number(info.aspect)||1);
  const ax=Math.max(0,Math.min(1,Number(info.anchorX??.5)));
  const ay=Math.max(0,Math.min(1,Number(info.anchorY??.67)));
  const h=size*aspect,px=256*(m.q+m.r/2),py=1.5*(256/Math.sqrt(3))*m.r*.85;
  return {x:px-size*ax,y:py-h*ay,w:size,h};
 }
 function visualOverlap(a,b,infoA={},infoB={}){
  const x=screenBox(a,infoA),y=screenBox(b,infoB);
  const ix=Math.max(0,Math.min(x.x+x.w,y.x+y.w)-Math.max(x.x,y.x));
  const iy=Math.max(0,Math.min(x.y+x.h,y.y+y.h)-Math.max(x.y,y.y));
  return ix*iy/Math.max(1,Math.min(x.w*x.h,y.w*y.h));
 }
 const SPACING={tight:.52,normal:.33,wide:.15};
 function modeOf(m){return m.mode==='chain'?'chain':'single';}
 function sameChain(a,b){return modeOf(a)==='chain'&&modeOf(b)==='chain'&&typeof a.chainId==='string'&&a.chainId.trim()!==''&&a.chainId===b.chainId;}
 function candidate(scene,q,r,radius,allowTypes,options={}){
  const influenceArea=cells(q,r,radius===2?2:1);
  const coreRadius=options.coreRadius===1?1:0;
  const area=cells(q,r,coreRadius);
  const lookup=new Map(scene.cells.map(c=>[key(c.q,c.r),c]));
  if(area.some(c=>!lookup.has(key(c.q,c.r))))return {ok:false,reason:'Bergkern ragt aus der Testkarte.',area,influenceArea};
  if(area.some(c=>!allowTypes(lookup.get(key(c.q,c.r)))))return {ok:false,reason:'Bergkern enthält Wasser oder nicht erlaubtes Gelände.',area,influenceArea};
  const other={q,r,radius,coreRadius,mode:options.mode,chainId:options.chainId};
  for(const m of (scene.mountains||[])){
   if(overlaps(m,other))return {ok:false,reason:'Ein anderer Bergkern belegt diese Standfläche.',area,influenceArea};
   if(influenceOverlaps(m,other)&&!sameChain(m,other))return {ok:false,reason:'Andere Berg-Einflusszone überschneidet sich. Für eine zusammenhängende Bergkette bei beiden Bergen denselben Kettenmodus und dieselbe Ketten-ID verwenden.',area,influenceArea};
   // Compare screen-space sprite envelopes (not just occupied hex cores).
   // Existing placements stay valid; this only prevents new severe collisions.
   if(sameChain(m,other)&&options.visualInfo&&options.visualInfoOf){
    const ratio=visualOverlap(m,other,options.visualInfoOf(m),options.visualInfo);
    const spacing=SPACING[options.spacing]===undefined?'normal':options.spacing;
    if(ratio>SPACING[spacing])return {ok:false,reason:`Bergsilhouetten überlagern sich zu stark (${Math.round(ratio*100)} % > ${Math.round(SPACING[spacing]*100)} %). Kettenabstand ändern oder ein anderes Hex wählen.`,area,influenceArea,overlap:ratio};
   }
  }
  const taken=new Set(area.map(c=>key(c.q,c.r)));
  if((scene.nature||[]).some(n=>taken.has(key(n.q,n.r))))return {ok:false,reason:'Gespeichertes Nature-Sprite steht auf dem Bergkern.',area,influenceArea};
  if(Object.keys(scene.objects||{}).some(k=>taken.has(k)))return {ok:false,reason:'Gespeichertes Gebäude oder Objekt steht auf dem Bergkern.',area,influenceArea};
  return {ok:true,reason:'Bergkern frei, Nachbarhexe bleiben verfügbar.',area,influenceArea};
 }
 function chainGroups(mountains){const groups=new Map();for(const m of mountains){
  const id=sameChain(m,m)?'chain:'+m.chainId:'single:'+key(m.q,m.r);
  if(!groups.has(id))groups.set(id,[]);groups.get(id).push(m);
 }return groups;}
 return {DIRS,key,distance,cells,config,occupied,influence,overlaps,influenceOverlaps,sameChain,chainGroups,candidate,screenBox,visualOverlap,SPACING};
})();
/* Interactive fillable shadow contours. Canvas coordinates are converted
 * into sprite-width-normalized offsets from the existing ground anchor. */
'use strict';
window.VedrasShadowPainter=(()=>{
 let draft=[],drag=null,activePointer=null,freehand=false,selectedPath=null;
 const $=id=>document.getElementById(id),clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 function ui(){return window.__vedrasShadowEditor;}
 function current(){return ui()?.asset();}
 function polygons(){const a=current();return a?ui().Engine.get().profiles[a.path]?.manual?.polygons||[]:[];}
 function frame(){return ui()?.frame();}
 function point(event){
  const f=frame(),cv=$('ssPreview');if(!f||!cv)return null;
  const box=cv.getBoundingClientRect(),sx=cv.width/Math.max(1,box.width),
   sy=cv.height/Math.max(1,box.height);
  const x=((event.clientX-box.left)*sx-f.p.x)/f.w,
   y=((event.clientY-box.top)*sy-f.p.y)/f.w;
  if(Math.abs(x)>3||Math.abs(y)>3)return null;
  return [x,y];
 }
 function commit(newPolygons){
  const a=current(),e=ui();if(!a||e.isMountainAsset(a))return;
  const data=e.Engine.get(),profile={...(data.profiles[a.path]||{})};
  if(newPolygons.length)profile.manual={mode:'polygons',polygons:newPolygons};
  else delete profile.manual;
  const profiles={...data.profiles};
  if(!Object.keys(profile).length)delete profiles[a.path];
  else profiles[a.path]=profile;
  e.Engine.set({...data,profiles});
  e.modified();e.refresh();
 }
 function overlay(ctx,f,asset){
  if(!f||!asset||ui()?.isMountainAsset(asset))return;
  if(selectedPath!==asset.path){draft=[];drag=null;selectedPath=asset.path;}
  const {p,w}=f;
  ctx.save();ctx.lineWidth=1.6;ctx.strokeStyle='#f6c35c';
  ctx.fillStyle='#f9b652';
  for(const poly of polygons()){
   if(poly.length<3)continue;
   ctx.beginPath();poly.forEach(([x,y],i)=>i?ctx.lineTo(p.x+x*w,p.y+y*w):
    ctx.moveTo(p.x+x*w,p.y+y*w));
   ctx.closePath();ctx.stroke();
   for(const [x,y] of poly){
    ctx.beginPath();ctx.arc(p.x+x*w,p.y+y*w,3.4,0,Math.PI*2);ctx.fill();
   }
  }
  ctx.strokeStyle='#74e9dc';ctx.fillStyle='#9effee';
  if(draft.length){
   ctx.beginPath();draft.forEach(([x,y],i)=>i?ctx.lineTo(p.x+x*w,p.y+y*w):
    ctx.moveTo(p.x+x*w,p.y+y*w));
   ctx.stroke();
   for(const [x,y] of draft){
    ctx.beginPath();ctx.arc(p.x+x*w,p.y+y*w,2.5,0,Math.PI*2);ctx.fill();
   }
  }
  ctx.restore();
 }
 function nearest(pt){
  if(!pt||!frame())return null;
  let nearest=null,best=11/frame().w;
  polygons().forEach((poly,polygon)=>poly.forEach((v,vertex)=>{
   const d=Math.hypot(pt[0]-v[0],pt[1]-v[1]);
   if(d<best){best=d;nearest={polygon,vertex};}
  }));
  return nearest;
 }
 function updateHandle(pt,save=false){
  if(!drag||!pt)return;
  const p=polygons().map(poly=>poly.map(x=>[...x]));
  if(!p[drag.polygon]?.[drag.vertex])return;
  p[drag.polygon][drag.vertex]=pt;
  if(save){commit(p);return;}
  // Use the same validated profile as the map renderer during dragging.
  const a=current(),e=ui(),data=e.Engine.get();
  e.Engine.set({...data,profiles:{...data.profiles,
   [a.path]:{...(data.profiles[a.path]||{}),
    manual:{mode:'polygons',polygons:p}}}});
  e.preview();
 }
 function down(event){
  const a=current(),e=ui();if(!a||e.isMountainAsset(a))return;
  const pt=point(event);if(!pt)return;
  const mode=$('ssDrawMode').value;
  if(mode==='edit'){
   drag=nearest(pt);if(!drag)return;
  }else if(mode==='freehand'){
   draft=[pt];freehand=true;
  }else{
   if(draft.length<180)draft.push(pt);
   e.preview();
   return;
  }
  activePointer=event.pointerId;
  $('ssPreview').setPointerCapture?.(activePointer);
  event.preventDefault();
 }
 function move(event){
  if(event.pointerId!==activePointer)return;
  const pt=point(event);if(!pt)return;
  if(drag){updateHandle(pt);return;}
  if(freehand){
   const last=draft.at(-1),f=frame();
   if(!last||Math.hypot(pt[0]-last[0],pt[1]-last[1])*f.w>=3){
    draft.push(pt);
    if(draft.length>180)
     draft=window.VedrasManualShadows.simplify(draft,180);
    ui().preview();
   }
  }
 }
 function up(event){
  if(activePointer!==event.pointerId)return;
  if(drag){const pt=point(event);if(pt)updateHandle(pt,true);drag=null;}
  activePointer=null;freehand=false;
  if($('ssPreview').hasPointerCapture?.(event.pointerId))
   $('ssPreview').releasePointerCapture(event.pointerId);
  if(draft.length)$('ssDrawStatus').textContent='Kontur mit „Fläche füllen“ abschließen.';
 }
 function fill(){
  if(draft.length<3){
   $('ssDrawStatus').textContent='Mindestens drei Punkte nötig.';return;
  }
  const prev=polygons();
  if(prev.length>=12){
   $('ssDrawStatus').textContent='Maximal zwölf getrennte Konturen.';return;
  }
  commit([...prev,window.VedrasManualShadows.simplify(draft,180)]);
  draft=[];
  $('ssDrawStatus').textContent='Ausgefüllt. Mit „Profile speichern“ dauerhaft sichern.';
 }
 function undo(){
  if(draft.length){draft.pop();ui()?.preview();return;}
  const p=polygons();
  if(p.length)commit(p.slice(0,-1));
 }
 function remove(){draft=[];drag=null;commit([]);}
 window.addEventListener('DOMContentLoaded',()=>{
  const cv=$('ssPreview');if(!cv)return;
  cv.addEventListener('pointerdown',down);
  cv.addEventListener('pointermove',move);
  cv.addEventListener('pointerup',up);
  cv.addEventListener('pointercancel',up);
  $('ssNewContour').addEventListener('click',()=>{
   draft=[];drag=null;ui()?.preview();
   $('ssDrawStatus').textContent='Neue Kontur: Punkte setzen oder Freihand ziehen.';
  });
  $('ssFillContour').addEventListener('click',fill);
  $('ssUndoPoint').addEventListener('click',undo);
  $('ssClearManual').addEventListener('click',remove);
 });
 return {overlay,point,fill,polygons};
})();
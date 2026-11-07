/* Step 25H: read-only viewport pruning for runtime Fog overlays.
 * Do not infer multiplayer authorization from this visual optimization.
 * Conservative union of authored hexPath AND q/r cloud stamp bounds prevents
 * hiding a valid on-screen cloud when authored/world positions differ.
 */
'use strict';
window.VedrasFrozenFogViewport=(()=>{
 const HEX=256,R=HEX/Math.sqrt(3),HEX_H=R*1.5,FEATHER=38;
 const DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
 const finite=Number.isFinite;
 function bounds(view){
  const zoom=view?.zoom,proj=view?.projectY||1;
  if(!finite(zoom)||zoom<=0||!finite(proj)||proj<=0||
     !finite(view?.width)||!finite(view?.height)||
     !finite(view?.panX)||!finite(view?.panY))return null;
  return {
   minX:(-view.width/2-view.panX)/zoom,
   maxX:(view.width/2-view.panX)/zoom,
   minY:(-view.height/2-view.panY)/(zoom*proj),
   maxY:(view.height/2-view.panY)/(zoom*proj)
  };
 }
 function intersects(box,x,y,rx,ry){
  // Malformed authored metadata is deliberately NOT culled.
  return !box||![x,y,rx,ry].every(finite)||
   (x+rx>=box.minX&&x-rx<=box.maxX&&
    y+ry>=box.minY&&y-ry<=box.maxY);
 }
 function cloudPoint(q,r){
  return {x:HEX*(q+r/2),y:HEX_H*r};
 }
 function visibleCells(cells,view){
  if(!Array.isArray(cells))return [];
  const box=bounds(view);
  return cells.filter(c=>{
   if(c?.visibility!=='visible')return false;
   const radius=c.radius||R;
   // hexPath uses authored x/y/radius while the precomposed cloud
   // artwork is positioned on the immutable 256-unit q/r grid.
   const path=intersects(box,c.x,c.y,radius,radius);
   const cloud=cloudPoint(c.q,c.r);
   const stamp=intersects(box,cloud.x,cloud.y,R+FEATHER,R+FEATHER);
   return path||stamp;
  });
 }
 function visibleEdges(edges,view){
  if(!Array.isArray(edges))return [];
  const box=bounds(view);
  return edges.filter(e=>{
   const d=DIRS[e?.direction];
   if(!d)return true; // Retain invalid metadata for the original painter.
   const t=cloudPoint(e.q+d[0],e.r+d[1]);
   // drawTransitions' hard polygon is strictly inside this feather extent.
   return intersects(box,t.x,t.y,R+FEATHER,R+FEATHER);
  });
 }
 return {visibleCells,visibleEdges,bounds};
})();

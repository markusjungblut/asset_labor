/* Step 21: frozen game viewport policy, independent of baked image density.
 * At ordinary zoom the default remains 2x. At overview zoom the display
 * backs off to 1.25x; 4x source images remain untouched. One hex of
 * offscreen world margin is always requested in advance.
 */
'use strict';
window.VedrasFrozenViewPolicy=(()=>{
 const HEX_WIDTH=256;
 const MARGIN_WORLD=HEX_WIDTH+64; // 1 complete hex plus scenery/shadow overhang
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 function displayDpr({zoom=1,width=800,height=600,baseDpr=2,maxPixels=8000000}={}){
  const z=Number.isFinite(zoom)?zoom:1;
  const overview=z<=.42?1.25:z>=.52?baseDpr:
   1.25+(baseDpr-1.25)*(z-.42)/.10;
  const pixels=Math.max(1,width*height);
  const edge=Math.max(1,width,height);
  return clamp(Math.min(baseDpr,overview,Math.sqrt(maxPixels/pixels),
   4096/edge),1,2);
 }
 function screenBounds(view,{marginWorld=MARGIN_WORLD}={}){
  const p=view.projectY||.85,z=view.zoom||1;
  const x0=(-view.width/2-view.panX)/z,
   x1=(view.width/2-view.panX)/z,
   y0=(-view.height/2-view.panY)/(z*p),
   y1=(view.height/2-view.panY)/(z*p);
  return {minX:x0-marginWorld,maxX:x1+marginWorld,
   minY:y0-marginWorld,maxY:y1+marginWorld};
 }
 function visibleTile(ix,iy,bounds){
  const x=ix*512,y=iy*512;
  return x<bounds.maxX&&x+512>bounds.minX&&
   y<bounds.maxY&&y+512>bounds.minY;
 }
 function cameraCacheMargin(zoom){
  // Logical screen-space pad for a reusable, already-rasterized viewport.
  return clamp(Math.ceil(MARGIN_WORLD*zoom),110,280);
 }
 return {HEX_WIDTH,MARGIN_WORLD,displayDpr,screenBounds,visibleTile,
  cameraCacheMargin};
})();

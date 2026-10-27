/* Vedras Step 11 – bounded interactive DPR and on-demand source previews.
 * Quality selection is an upper bound, not a promise of unsafe canvas size.
 * All calculations are pure so fullscreen/zoom and export can be tested.
 */
'use strict';
window.VedrasRenderQuality=(()=>{
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const profiles=Object.freeze({
  fast:Object.freeze({requested:.8,budget:1300000,terrainPx:512,spritePx:1024}),
  auto:Object.freeze({requested:1.35,budget:3200000,terrainPx:512,spritePx:1024}),
  '1':Object.freeze({requested:1,budget:14000000,terrainPx:512,spritePx:1024}),
  '2':Object.freeze({requested:2,budget:14000000,terrainPx:768,spritePx:1536}),
  '3':Object.freeze({requested:3,budget:14000000,terrainPx:1024,spritePx:2048}),
  '4':Object.freeze({requested:4,budget:14000000,terrainPx:1536,spritePx:2048})
 });
 function resolve({quality='fast',width,height,devicePixelRatio=1,
   natureCount=0,objects=true,final=false}={}){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)
   throw Error('Render quality requires positive viewport dimensions');
  const kind=String(quality) in profiles?String(quality):'fast';
  const profile=profiles[kind];
  const highDensity=objects&&natureCount>500;
  // Keep the dense-scene two-layer budget bounded. Unlike the obsolete
  // unconditional 1.5x cap this still permits REAL 4x on compact screens.
  const budget=final?18000000:highDensity?Math.min(profile.budget,8000000):
   profile.budget;
  const native=Number.isFinite(devicePixelRatio)?clamp(devicePixelRatio,.65,4):1;
  const requested=final?2:kind==='auto'?Math.min(native,1.35):profile.requested;
  const pixels=width*height;
  const budgetDpr=Math.sqrt(budget/pixels);
  const dimensionDpr=Math.min(4096/width,4096/height);
  // Preserve the old minimum .65x policy for extreme windows. The canvas
  // dimension remains clipped, and no new 4x DPR export path is introduced.
  const effective=clamp(Math.min(requested,4,budgetDpr,dimensionDpr),.65,4);
  const limiter=effective>=requested-1e-6?'none':
   budgetDpr<=dimensionDpr?'pixel-budget':'canvas-dimensions';
  return {quality:kind,requestedDpr:requested,effectiveDpr:effective,
   limiter,budgetPixels:budget,canvasPixels:Math.round(width*effective)*
    Math.round(height*effective),viewportPixels:pixels,dense:!!highDensity,
   terrainPx:profile.terrainPx,spritePx:profile.spritePx};
 }
 return {resolve,profiles};
})();

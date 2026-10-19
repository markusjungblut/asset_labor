/* Block 4: subtle, reversible renderer finishing. No pixel asset mutation.
 * Every map point uses stable seeded, spatially correlated composition.
 */
'use strict';
window.VedrasPolish=(()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
 const defaults=()=>({nature:.40,terrain:.35,composition:1});
 const valid=raw=>{
  const r=raw&&typeof raw==='object'?raw:{};
  return {nature:clamp(r.nature??.40,0,1),terrain:clamp(r.terrain??.35,0,1),composition:clamp(r.composition??1,0,1)};
 };
 const hash=(seed,q,r,salt)=>{
  let h=(seed|0)^Math.imul(q+173,374761393)^Math.imul(r+311,668265263)^Math.imul(salt+79,2246822519);
  h^=h>>>13;h=Math.imul(h,1274126177);
  return ((h^(h>>>16))>>>0)/4294967296;
 };
 // Nearby hexes share a coherent density modulation, rather than every
 // shrub/bush being independently scattered at the same frequency.
 function patch(seed,q,r,group='shrub',strength=1){
  const salt=group==='ground_cover'?727:group==='shrub'?311:group==='tree'?521:101;
  const neighbors=[[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]];
  let value=.50*hash(seed,q,r,salt);
  for(const [dq,dr] of neighbors)value+=.50/6*hash(seed,q+dq,r+dr,salt);
  // Up to ~±40%, moderated for sparse groups to avoid excessive density.
  return Math.max(.60,Math.min(1.4,1+(value-.5)*1.5*clamp(strength,0,1)));
 }
 function natureFilter(meta,amount=.40){
  const v=clamp(amount,0,1);
  if(!v||meta?.kind==='mountain')return 'none';
  const snowy=['snow_conifers','snow_dead_trees','snow_fallen_logs'].includes(meta?.family);
  const saturation=1-(snowy?.06:.18)*v;
  const brightness=1-(snowy?.015:.065)*v;
  const contrast=1+.045*v;
  return 'saturate('+saturation.toFixed(3)+') brightness('+brightness.toFixed(3)+') contrast('+contrast.toFixed(3)+')';
 }
 function terrainRGB(r,g,b,amount=.35,material='ground',terrainType=''){
  const v=clamp(amount,0,1);
  if(!v||material!=='ground'||['snowfields','frozen_tundra','forest_floor'].includes(terrainType))return [r,g,b];
  // Very light contrast and saturation compression reduces highly detailed
  // terrain noise, but leaves the underlying forest/water artwork untouched.
  const y=.2126*r+.7152*g+.0722*b,contrast=1-.12*v,saturation=1-.14*v;
  return [r,g,b].map(c=>Math.max(0,Math.min(255,Math.round((y+(c-y)*saturation-128)*contrast+128))));
 }
 return {defaults,valid,patch,natureFilter,terrainRGB};
})();

/* Asset-Labor Block 2: coherent sprite size, density and build-space policy.
 * All values apply at runtime: the 258 source PNGs and individual catalog
 * editor dimensions remain unmodified and can still be tuned independently.
 */
'use strict';
window.VedrasNatureBalance=(()=>{
 const key=(c)=>c.q+','+c.r;
 const accents=new Set(['dead_trees','snow_dead_trees','fallen_logs','snow_fallen_logs']);
 const deadTrees=new Set(['dead_trees','snow_dead_trees']);
 const fallen=new Set(['fallen_logs','snow_fallen_logs']);
 function sizeFactor(meta){
  if(!meta||meta.kind==='mountain')return 1;
  if(deadTrees.has(meta.family))return .58;
  if(fallen.has(meta.family))return .71;
  if(meta.family==='deadwood')return .72;
  if(meta.kind==='tree'){
   if(meta.sizeClass==='giant')return .73;
   return meta.sizeClass==='large'?.79:meta.sizeClass==='medium'?.81:.86;
  }
  if(meta.kind==='shrub')return meta.sizeClass==='medium'?.81:meta.sizeClass==='large'?.79:.90;
  if(meta.kind==='cluster')return .82;
  if(meta.kind==='ground_cover')return .90;
  return meta.kind==='special'?.85:1;
 }
 const isCanopy=meta=>!!meta&&meta.kind==='tree'&&!deadTrees.has(meta.family);
 const isAccent=meta=>!!meta&&accents.has(meta.family);
 function accentGroup(meta){
  return deadTrees.has(meta?.family)?'dead_trees':fallen.has(meta?.family)?'fallen_logs':null;
 }
 // Density is still authorable per asset. These multipliers are intentional
 // map-composition caps, not a mutation of the source catalog metadata.
 const chanceMultiplier=(meta)=>{
  if(deadTrees.has(meta?.family))return .11;
  if(fallen.has(meta?.family))return .16;
  if(meta?.family==='deadwood')return .40;
  if(meta?.kind==='cluster')return .68;
  if(meta?.kind==='shrub')return .84;
  return 1;
 };
 function accentLimits(landCells){
  const count=Math.max(1,Number(landCells)||1);
  return {dead_trees:Math.max(1,Math.floor(count/16)),fallen_logs:Math.max(1,Math.floor(count/15))};
 }
 function stable(seed,q,r,salt=0){
  let n=(seed|0)^Math.imul(q+613,374761393)^Math.imul(r+1379,668265263)^Math.imul(salt+41,2246822519);
  n^=n>>>13;n=Math.imul(n,1274126177);
  return ((n^(n>>>16))>>>0)/4294967296;
 }
 // Reserve small, adjacent clusters of buildable hexes (not merely isolated
 // dots). A reserve suppresses AUTO decoration, never an explicit manual asset.
 // Real building/mountain footprints remain separately protected by the caller.
 function reserveClearings(cells,forests,seed,isGround,occupied){
  const forestByHex=forests instanceof Map?forests:new Map((forests||[]).map(f=>[f.key||key(f),f]));
  const legal=(cells||[]).filter(c=>isGround(c)&&!occupied?.has(key(c)));
  const target=Math.min(legal.length,Math.max(1,Math.round(legal.length*.18)));
  const chosen=new Set(),pool=new Map(legal.map(c=>[key(c),c]));
  const score=c=>{
   const f=forestByHex.get(key(c)),stand=f?.forestClass;
   const priority=stand==='dense_forest'?.30:stand==='light_forest'?.15:0;
   return stable(seed,c.q,c.r,601)+priority;
  };
  const ordered=legal.slice().sort((a,b)=>score(a)-score(b)||key(a).localeCompare(key(b)));
  for(const c of ordered){
   if(chosen.size>=target)break;
   if(chosen.has(key(c)))continue;
   chosen.add(key(c));
   if(chosen.size>=target)break;
   const close=legal.filter(v=>!chosen.has(key(v))&&
    Math.max(Math.abs(v.q-c.q),Math.abs(v.r-c.r),Math.abs(v.q+v.r-c.q-c.r))===1)
    .sort((a,b)=>score(a)-score(b));
   if(close.length)chosen.add(key(close[0]));
  }
  return chosen;
 }
 return {sizeFactor,isCanopy,isAccent,accentGroup,chanceMultiplier,accentLimits,reserveClearings,stable};
})();

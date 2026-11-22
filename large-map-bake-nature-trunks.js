/* Phase 2.8b: deterministic, read-only ORIGINAL tree trunk placements.
 * Tree-only staging pass: uses existing habitat, forest, polish, collision,
 * road and river APIs. It is NOT full editor populate(), crown coverage,
 * shrub/rock layering, a PNG renderer or an atlas release.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-tree-trunk-plan-v1",LIMIT=10000;
const key=c=>c.q+","+c.r;
const pos=c=>({x:256*(c.q+c.r/2),y:1.5*(256/Math.sqrt(3))*c.r});
const radius=256/Math.sqrt(3);
const inside=(x,y,margin=0)=>{
 const ax=Math.abs(x),ay=Math.abs(y);
 return ay<=radius-margin&&ax<=Math.min(128,Math.sqrt(3)*(radius-ay))-margin;
};
function hash(seed,q,r,salt){
 let h=(seed|0)^Math.imul(q+97,374761393)^Math.imul(r+513,668265263)^Math.imul(salt+11,2246822519);
 h^=h>>>13;h=Math.imul(h,1274126177);
 return ((h^(h>>>16))>>>0)/4294967296;
}
function pathSalt(s){let v=0;for(const ch of s)v=(Math.imul(v,31)+ch.charCodeAt(0))|0;return v;}
function create({world,terrainCatalog,natureCatalog,assets,forestCells,mountainPlan,siteAudit,
 seed=12345,composition=1,riverWidth=32,roadEdges=world?.roadEdges||[],
 rules=root.VedrasNatureCatalog,forest=root.VedrasForest,
 balance=root.VedrasNatureBalance,mountains=root.VedrasMountains,
 polish=root.VedrasPolish,existing=root.VedrasExistingAssets,
 rivers=root.VedrasRivers,roads=root.VedrasRoads}={}){
 if(!Array.isArray(world?.cells)||!world.cells.length||world.cells.length>LIMIT||
  !Array.isArray(world.riverPaths)||!Array.isArray(roadEdges)||
  !Array.isArray(terrainCatalog?.terrainTypes)||!natureCatalog?.entries||
  !Array.isArray(assets)||!Array.isArray(forestCells)||
  !Array.isArray(mountainPlan?.instances)||mountainPlan.complete!==false||
  mountainPlan.readyForViewer!==false||
  mountainPlan.worldHexes!==world.cells.length||
  siteAudit?.schema!=="vedras-geography-nature-tree-sites-v1"||
  siteAudit.complete!==false||siteAudit.readyForViewer!==false||
  siteAudit.rasterized!==false||siteAudit.worldHexes!==world.cells.length||
  !Array.isArray(siteAudit.sites)||siteAudit.seed!==seed||
  typeof rules?.canPlace!=="function"||typeof rules?.effectiveTypes!=="function"||
  typeof forest?.inGlade!=="function"||typeof forest?.preferredFamily!=="function"||
  typeof balance?.placementScale!=="function"||typeof balance?.isCanopy!=="function"||
  typeof balance?.reserveClearings!=="function"||
  typeof mountains?.occupied!=="function"||
  typeof polish?.localOffset!=="function"||
  typeof existing?.canAutoPlaceInTest!=="function"||
  typeof rivers?.blocksPoint!=="function"||typeof rivers?.valid!=="function"||
  typeof roads?.blocksPoint!=="function"||
  !Number.isSafeInteger(seed)||seed<1||
  !Number.isFinite(composition)||composition<0||composition>1||
  !Number.isFinite(riverWidth)||riverWidth<12||riverWidth>70)
  throw Error("Originalregeln, vollständige Wald-/Flussquelle oder unfertiges Nature-Audit fehlen.");
 const terrain=new Map(terrainCatalog.terrainTypes.map(t=>[t.id,t]));
 const cells=new Map();
 for(const c of world.cells){
  if(!Number.isSafeInteger(c.q)||!Number.isSafeInteger(c.r)||
   !terrain.has(c.terrainId)||cells.has(key(c)))
   throw Error("Ungültige oder doppelte geografische Baumzelle.");
  cells.set(key(c),c);
 }
 const woods=new Map();
 for(const f of forestCells){
  if(!cells.has(key(f))||woods.has(key(f))||
   cells.get(key(f)).forestClass!==f.forestClass)
   throw Error("Original-Waldzellen sind nicht mit der Geografie verbunden.");
  woods.set(key(f),f);
 }
 if(woods.size!==cells.size)throw Error("Waldzellen fehlen.");
 const cores=new Set();
 for(const m of mountainPlan.instances){
  if(!cells.has(key(m)))throw Error("Bergkern außerhalb der Welt.");
  for(const k of mountains.occupied(m))if(cells.has(k))cores.add(k);
 }
 const isGround=c=>terrain.get(c.terrainId)?.materialClass==="ground";
 // Feed an ARRAY, not a cross-realm Map: original NatureBalance distinguishes by instanceof.
 const clearings=balance.reserveClearings(world.cells,forestCells,seed,isGround,cores,"canopy");
 if(siteAudit.mountainCoreHexes!==cores.size||
    siteAudit.reservedBuildHexes!==clearings.size)
  throw Error("Nature-Audit und Berg-/Bauflächenreservierung sind inkonsistent.");
 const wet=c=>["water","shoreline"].includes(terrain.get(c?.terrainId)?.materialClass);
 const routes=[];
 for(const points of world.riverPaths){
  if(!Array.isArray(points)||points.length<2||points.length>10000||
   points.some(p=>!Array.isArray(p)||p.length!==2||
    !Number.isSafeInteger(p[0])||!Number.isSafeInteger(p[1])||
    !cells.has(p[0]+","+p[1])))
   throw Error("Geografische Flussroute ist unvollständig.");
  const route={hexes:points.map(p=>[p[0],p[1]])};
  if(!rivers.valid(route,world.cells,wet))
   throw Error("Geografische Flussroute ist keine gültige Originalroute.");
  routes.push(route);
 }
 const variants=[],seen=new Set();
 for(const asset of assets){
  if(asset?.category!=="nature"||typeof asset.path!=="string"||
   !asset.path.startsWith("assets/nature/")||
   !asset.path.endsWith(".png")||asset.relPath!==asset.path.slice(7)||
   seen.has(asset.path))continue;
  seen.add(asset.path);
  const meta=natureCatalog.entries[asset.relPath];
  if(!balance.isCanopy(meta))continue;
  const allowed=rules.effectiveTypes(meta,terrainCatalog,natureCatalog);
  if(existing.canAutoPlaceInTest(asset,meta,allowed))
   variants.push({asset,meta,salt:pathSalt(asset.relPath)});
 }
 variants.sort((a,b)=>a.asset.path.localeCompare(b.asset.path,"en"));
 if(siteAudit.physicalTreeVariants!==variants.length)
  throw Error("Physischer Nature-Katalog seit dem Audit verändert.");
 const usedSites=new Set(),sites=siteAudit.sites.slice().sort((a,b)=>a.r-b.r||a.q-b.q);
 for(const s of sites){
  if(!Number.isSafeInteger(s.q)||!Number.isSafeInteger(s.r)||
   !cells.has(key(s))||usedSites.has(key(s))||cores.has(key(s))||
   clearings.has(key(s))||!isGround(cells.get(key(s)))||
   !Number.isSafeInteger(s.targetTreeSlots)||s.targetTreeSlots<0||
   s.targetTreeSlots>36||s.forestClass!==woods.get(key(s)).forestClass)
   throw Error("Standort-Audit enthält nicht freigegebene Baumhexe.");
  usedSites.add(key(s));
 }
 const byHex=new Map(),instances=[],stats={
  eligibleSites:0,targetTreeSlots:0,attemptedTreeSlots:0,
  placedTrees:0,failedTreeSlots:0,desertTreeAttempts:0,desertTreesPlaced:0,
  rejectedOutside:0,rejectedGlade:0,rejectedRiver:0,
  rejectedRoad:0,rejectedSpacing:0,missingMatchingAssets:0
 };
 const riverClearance=meta=>Math.max(6,Math.min(28,(Number(meta.logicalWidth)||52)*.16))+5;
 function makeTree(v,c,f,spacingFactor){
  const index=instances.length+1,meta=v.meta,base=pos(c);
  const scale=meta.scaleMin+(meta.scaleMax-meta.scaleMin)*hash(seed,c.q,c.r,index*47+7);
  const neighborInstances=[];
  for(let dr=-2;dr<=2;dr++)for(let dq=-2;dq<=2;dq++){
   const found=byHex.get((c.q+dq)+","+(c.r+dr));
   if(found)neighborInstances.push(...found);
  }
  for(let attempt=0;attempt<72;attempt++){
   const {dx,dy}=polish.localOffset(seed,c.q,c.r,"tree",index,attempt,composition);
   if(!inside(dx,dy,meta.placement.edgeMargin)){stats.rejectedOutside++;continue;}
   if(forest.inGlade(f,dx,dy)){stats.rejectedGlade++;continue;}
   const x=base.x+dx,y=base.y+dy;
   if(routes.length&&rivers.blocksPoint(x,y,routes,world.cells,wet,riverWidth,riverClearance(meta))){
    stats.rejectedRiver++;continue;
   }
   if(roadEdges.length&&roads.blocksPoint(x,y,roadEdges,8,256)){
    stats.rejectedRoad++;continue;
   }
   if(neighborInstances.some(old=>{
    const a=pos(old),other=natureCatalog.entries[old.assetPath.slice(7)];
    const areaScale=Math.sqrt(balance.placementScale(meta)*balance.placementScale(other));
    const factor=spacingFactor;
    const spacing=Math.max(factor<.6?10:14,
     Math.max(meta.placement.minSpacing,other?.placement?.minSpacing||0)*factor*areaScale);
    return Math.hypot(x-a.x-old.dx,y-a.y-old.dy)<spacing;
   })){stats.rejectedSpacing++;continue;}
   const inst={assetPath:v.asset.path,assetId:meta.id,q:c.q,r:c.r,
    dx:Math.round(dx*100)/100,dy:Math.round(dy*100)/100,
    scale:Math.round(scale*1000)/1000,
    source:"geography-original-tree-trunk-preview",
    artStatus:meta.artStatus||"unknown"};
   instances.push(inst);
   if(!byHex.has(key(c)))byHex.set(key(c),[]);
   byHex.get(key(c)).push(inst);
   return true;
  }
  return false;
 }
 for(const s of sites){
  const c=cells.get(key(s)),f=woods.get(key(c));
  const neighborTypes=forest.DIRS.map(([dq,dr])=>
   cells.get((c.q+dq)+","+(c.r+dr))?.terrainId).filter(Boolean);
  const possible=variants.filter(v=>
   forest.preferredFamily(v.meta.family,f)&&
   rules.canPlace(v.meta,{
    baseBiome:c.terrainId,biome:c.terrainId,forestClass:f.forestClass,
    neighborTypes
   },terrainCatalog,natureCatalog)&&
   !(c.terrainId==="tundra"&&v.meta.family==="snow_conifers"&&
     hash(seed,c.q,c.r,973+v.salt)>=.02));
  if(!possible.length){if(s.targetTreeSlots)stats.missingMatchingAssets++;continue;}
  stats.eligibleSites++;
  const desert=Array.isArray(rules.DESERT_BIOMES)&&
   rules.DESERT_BIOMES.includes(c.terrainId);
  const desertPool=desert?possible.filter(v=>
   v.meta.family==="palms"||rules.isAcacia?.(v.meta)):[];
  const trees=possible.filter(v=>!desertPool.includes(v)).sort((a,b)=>{
   const priority=v=>hash(seed,c.q,c.r,301+v.salt)/
    Math.max(.04,v.meta.placement.density*Math.min(1,v.meta.placement.weight));
   return priority(a)-priority(b)||a.asset.path.localeCompare(b.asset.path,"en");
  });
  const mode=f.forestMode||"canopy";
  const factor=mode==="canopy"?
   (f.forestClass==="dense_forest"?.34:f.forestClass==="light_forest"?.59:.88):
   mode==="dense"?
   (f.forestClass==="dense_forest"?.52:f.forestClass==="light_forest"?.73:1):
   (f.forestClass==="dense_forest"?.72:f.forestClass==="light_forest"?.92:1);
  const limit=Math.min(s.targetTreeSlots,36);
  stats.targetTreeSlots+=limit;
  if(desertPool.length&&hash(seed,c.q,c.r,1751)<.065){
   const palms=desertPool.filter(v=>v.meta.family==="palms");
   const acacias=desertPool.filter(v=>rules.isAcacia?.(v.meta));
   const families=hash(seed,c.q,c.r,1752)<.5?[palms,acacias]:[acacias,palms];
   stats.desertTreeAttempts++;
   for(const pool of families){
    if(!pool.length)continue;
    pool.sort((a,b)=>a.asset.path.localeCompare(b.asset.path,"en"));
    const start=Math.floor(hash(seed,c.q,c.r,1753)*pool.length);
    let placed=false;
    for(let k=0;k<pool.length;k++){
     if(makeTree(pool[(start+k)%pool.length],c,f,1)){
      stats.desertTreesPlaced++;placed=true;break;
     }
    }
    if(placed)break;
   }
  }
  // Forest canopy quota is the audited baseline. Original editor can extend
  // this after actual image-based crown-coverage measurement; deferred.
  for(let slot=0;slot<limit&&trees.length;slot++){
   stats.attemptedTreeSlots++;
   if(!makeTree(trees[slot%Math.min(trees.length,5)],c,f,factor))
    stats.failedTreeSlots++;
  }
  if(!trees.length&&limit)stats.missingMatchingAssets++;
 }
 stats.placedTrees=instances.length;
 return {schema:SCHEMA,stage:"original-tree-trunks-read-only",
  seed,worldHexes:world.cells.length,worldSource:siteAudit.worldSource,
  natureCatalogRevision:natureCatalog.revision??null,
  mountainCoreHexes:cores.size,reservedBuildHexes:clearings.size,
  riverRoutes:routes.length,roadEdges:roadEdges.length,
  originalTreeVariants:variants.length,stats,instances,
  requiresPixelCrownCoverage:true,requiresEditorFullPopulationParity:true,
  requiresOriginalPngDecoding:true,requiresNatureShrubs:true,
  requiresRockAndAccentPass:true,requiresTreeShadows:true,
  requiresTrunkPixelOverlapAudit:true,
  rasterized:false,complete:false,readyForViewer:false};
}
const api={SCHEMA,LIMIT,hash,inside,create};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapNatureTrunks=api;
})(typeof window!=="undefined"?window:globalThis);

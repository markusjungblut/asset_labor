/* Phase 2.8h: original warm-boulder FIRST PASS, before tree canopy.
 * Uses NatureBalance warmBoulderPool, original catalog habitat, original
 * seeded placement offsets and river/road/clearings gates. Not full populate.
 * NEVER replaces artwork, mutates the world or marks an atlas complete.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-warm-boulder-prepass-v1",LIMIT=10000;
const R=256/Math.sqrt(3),key=c=>c.q+","+c.r;
const pos=c=>({x:256*(c.q+c.r/2),y:1.5*R*c.r});
const inside=(x,y,margin=0)=>{
 const ax=Math.abs(x),ay=Math.abs(y);
 return ay<=R-margin&&ax<=Math.min(128,Math.sqrt(3)*(R-ay))-margin;
};
function hash(seed,q,r,salt){
 let h=(seed|0)^Math.imul(q+97,374761393)^Math.imul(r+513,668265263)^Math.imul(salt+11,2246822519);
 h^=h>>>13;h=Math.imul(h,1274126177);
 return ((h^(h>>>16))>>>0)/4294967296;
}
const pathSalt=p=>{let h=0;for(const ch of p)h=(Math.imul(h,31)+ch.charCodeAt(0))|0;return h;};
const sameSource=(a,b)=>!!a&&!!b&&
 ["version","seed","width","height","originQ","originR"].every(k=>a[k]===b[k]);
function create({world,terrainCatalog,natureCatalog,assets,forestCells,
 mountainPlan,siteAudit,seed=12345,composition=1,riverWidth=32,
 roadEdges=world?.roadEdges||[],
 rules=root.VedrasNatureCatalog,forest=root.VedrasForest,
 balance=root.VedrasNatureBalance,mountains=root.VedrasMountains,
 polish=root.VedrasPolish,existing=root.VedrasExistingAssets,
 rivers=root.VedrasRivers,roads=root.VedrasRoads}={}){
 if(!Array.isArray(world?.cells)||!world.cells.length||world.cells.length>LIMIT||
  !Array.isArray(world.riverPaths)||!Array.isArray(roadEdges)||
  !Array.isArray(terrainCatalog?.terrainTypes)||!natureCatalog?.entries||
  !Array.isArray(assets)||!Array.isArray(forestCells)||
  !Array.isArray(mountainPlan?.instances)||mountainPlan.complete!==false||
  mountainPlan.readyForViewer!==false||mountainPlan.rasterized!==false||
  mountainPlan.worldHexes!==world.cells.length||
  siteAudit?.schema!=="vedras-geography-nature-tree-sites-v1"||
  siteAudit.complete!==false||siteAudit.readyForViewer!==false||
  siteAudit.rasterized!==false||siteAudit.worldHexes!==world.cells.length||
  siteAudit.seed!==seed||
  !sameSource(mountainPlan.worldSource,siteAudit.worldSource)||
  typeof rules?.canPlace!=="function"||
  typeof rules?.effectiveTypes!=="function"||
  typeof forest?.maxObjects!=="function"||
  typeof forest?.preferredFamily!=="function"||
  !Array.isArray(forest?.DIRS)||
  typeof balance?.isWarmBoulder!=="function"||
  typeof balance?.warmBoulderPool!=="function"||
  typeof balance?.reserveClearings!=="function"||
  typeof balance?.placementScale!=="function"||
  typeof mountains?.occupied!=="function"||
  typeof polish?.localOffset!=="function"||
  typeof existing?.canAutoPlaceInTest!=="function"||
  typeof rivers?.blocksPoint!=="function"||
  typeof rivers?.valid!=="function"||
  typeof roads?.blocksPoint!=="function"||
  !Number.isSafeInteger(seed)||seed<1||
  !Number.isFinite(composition)||composition<0||composition>1||
  !Number.isFinite(riverWidth)||riverWidth<12||riverWidth>70)
  throw Error("Original-Findlingsvorlauf benötigt gültige Nature-, Wald- und Reliefquellen.");
 const terrain=new Map(terrainCatalog.terrainTypes.map(x=>[x.id,x]));
 const cells=new Map(),woods=new Map();
 for(const c of world.cells){
  if(!Number.isSafeInteger(c.q)||!Number.isSafeInteger(c.r)||
   !terrain.has(c.terrainId)||cells.has(key(c)))
   throw Error("Findlingsvorlauf: ungültige oder doppelte Geografiezelle.");
  cells.set(key(c),c);
 }
 for(const f of forestCells){
  if(!cells.has(key(f))||woods.has(key(f))||
   f.forestClass!==cells.get(key(f)).forestClass)
   throw Error("Findlingsvorlauf: inkonsistente Waldzelle.");
  woods.set(key(f),f);
 }
 if(woods.size!==cells.size)
  throw Error("Findlingsvorlauf: Waldzellen fehlen.");
 const cores=new Set();
 for(const m of mountainPlan.instances){
  if(!cells.has(key(m)))throw Error("Findlingsvorlauf: Berganker außerhalb der Welt.");
  for(const k of mountains.occupied(m))if(cells.has(k))cores.add(k);
 }
 const isGround=c=>terrain.get(c.terrainId)?.materialClass==="ground";
 const clearings=balance.reserveClearings(world.cells,forestCells,seed,isGround,cores,"canopy");
 if(cores.size!==siteAudit.mountainCoreHexes||
  clearings.size!==siteAudit.reservedBuildHexes)
  throw Error("Findlingsvorlauf: Audit der Berg-/Freiflächen stimmt nicht.");
 const wet=c=>["water","shoreline"].includes(terrain.get(c?.terrainId)?.materialClass);
 const routes=[];
 for(const route of world.riverPaths){
  if(!Array.isArray(route)||route.length<2||route.length>10000||
   route.some(p=>!Array.isArray(p)||p.length!==2||
    !Number.isSafeInteger(p[0])||!Number.isSafeInteger(p[1])||
    !cells.has(p[0]+","+p[1])))
   throw Error("Findlingsvorlauf: geografische Flussroute ungültig.");
  const candidate={hexes:route.map(x=>[x[0],x[1]])};
  if(!rivers.valid(candidate,world.cells,wet))
   throw Error("Findlingsvorlauf: Flussroute von Originalregeln abgelehnt.");
  routes.push(candidate);
 }
 const warm=[];
 for(const asset of assets){
  if(asset?.category!=="nature"||typeof asset.path!=="string"||
   !asset.path.startsWith("assets/nature/")||
   !asset.path.endsWith(".png")||asset.path.includes("..")||
   asset.relPath!==asset.path.slice(7))continue;
  const meta=natureCatalog.entries[asset.relPath];
  if(!balance.isWarmBoulder(meta))continue;
  const types=rules.effectiveTypes(meta,terrainCatalog,natureCatalog);
  if(existing.canAutoPlaceInTest(asset,meta,types)&&
   !warm.some(w=>w.asset.path===asset.path))
   warm.push({asset,meta,salt:pathSalt(asset.relPath)});
 }
 warm.sort((a,b)=>a.asset.path.localeCompare(b.asset.path,"en"));
 const byHex=new Map(),instances=[],stats={
  eligibleWarmSites:0,warmOriginalVariants:warm.length,
  guaranteedWarmPlaced:0,ordinaryWarmPlaced:0,
  evaluatedCellAttempts:0,rejectedOutside:0,
  rejectedRiver:0,rejectedRoad:0,rejectedSpacing:0
 };
 const near=(q,r)=>{
  const arr=[];
  for(let dr=-2;dr<=2;dr++)for(let dq=-2;dq<=2;dq++){
   const found=byHex.get((q+dq)+","+(r+dr));
   if(found)arr.push(...found);
  }
  return arr;
 };
 const canPlace=(v,c)=>{
  const f=woods.get(key(c));
  const neighbors=forest.DIRS.map(([dq,dr])=>
   cells.get((c.q+dq)+","+(c.r+dr))?.terrainId).filter(Boolean);
  return forest.preferredFamily(v.meta.family,f)&&
   rules.canPlace(v.meta,{baseBiome:c.terrainId,biome:c.terrainId,
    forestClass:f.forestClass,neighborTypes:neighbors},terrainCatalog,natureCatalog);
 };
 const allowed=c=>isGround(c)&&!cores.has(key(c))&&!clearings.has(key(c))&&
  !(c.q===0&&c.r===0)&&forest.maxObjects(woods.get(key(c)))>0;
 const suitable=world.cells.filter(c=>allowed(c)&&warm.some(v=>canPlace(v,c)));
 stats.eligibleWarmSites=suitable.length;
 function attempt(v,c){
  const index=instances.length+1,meta=v.meta,base=pos(c);
  const scale=meta.scaleMin+(meta.scaleMax-meta.scaleMin)*hash(seed,c.q,c.r,index*47+7);
  const candidates=near(c.q,c.r);
  for(let i=0;i<72;i++){
   const {dx,dy}=polish.localOffset(seed,c.q,c.r,"other",index,i,composition);
   if(!inside(dx,dy,meta.placement.edgeMargin)){stats.rejectedOutside++;continue;}
   const x=base.x+dx,y=base.y+dy;
   const radius=Math.max(6,Math.min(28,(Number(meta.logicalWidth)||52)*.16))+5;
   if(routes.length&&rivers.blocksPoint(x,y,routes,world.cells,wet,riverWidth,radius)){
    stats.rejectedRiver++;continue;
   }
   if(roadEdges.length&&roads.blocksPoint(x,y,roadEdges,8,256)){
    stats.rejectedRoad++;continue;
   }
   if(candidates.some(old=>{
    const q=pos(old),other=natureCatalog.entries[old.assetPath.slice(7)];
    const spacing=Math.max(14,Math.max(meta.placement.minSpacing,
     other.placement.minSpacing)*Math.max(.85,1)*
     Math.sqrt(balance.placementScale(meta)*balance.placementScale(other)));
    return Math.hypot(x-q.x-old.dx,y-q.y-old.dy)<spacing;
   })){stats.rejectedSpacing++;continue;}
   const inst={assetPath:v.asset.path,assetId:meta.id,
    q:c.q,r:c.r,dx:Math.round(dx*100)/100,
    dy:Math.round(dy*100)/100,scale:Math.round(scale*1000)/1000,
    source:"geography-original-warm-boulder-prepass",
    artStatus:meta.artStatus||"unknown"};
   instances.push(inst);
   if(!byHex.has(key(c)))byHex.set(key(c),[]);
   byHex.get(key(c)).push(inst);
   return true;
  }
  return false;
 }
 const priority=(v,c,salt)=>hash(seed,c.q,c.r,salt+v.salt);
 // The editor ensures at least one eligible warm rock on maps containing
 // >=3 warm sites, prior to the normal seeded per-cell warm opportunity.
 if(suitable.length>=3){
  const sorted=suitable.slice().sort((a,b)=>
   hash(seed,a.q,a.r,1650)-hash(seed,b.q,b.r,1650)||
   a.r-b.r||a.q-b.q);
  for(const c of sorted){
   const pool=warm.filter(v=>canPlace(v,c)).sort((a,b)=>
    priority(a,c,1651)-priority(b,c,1651)||
    a.asset.path.localeCompare(b.asset.path,"en"));
   if(pool.some(v=>attempt(v,c))){
    stats.guaranteedWarmPlaced=1;break;
   }
  }
 }
 for(const c of world.cells){
  if(!allowed(c)||byHex.has(key(c)))continue;
  const pool=warm.filter(v=>canPlace(v,c));
  if(!pool.length)continue;
  const roll=hash(seed,c.q,c.r,1607);
  const draw=balance.warmBoulderPool(pool.map(v=>v.asset),
   a=>natureCatalog.entries[a.relPath],roll);
  if(!draw.warmCount||!draw.pool.length||
   hash(seed,c.q,c.r,1601)>=draw.chance)continue;
  stats.evaluatedCellAttempts++;
  const start=Math.floor(hash(seed,c.q,c.r,1602)*draw.pool.length);
  for(let j=0;j<draw.pool.length;j++){
   const asset=draw.pool[(start+j)%draw.pool.length];
   const v=warm.find(v=>v.asset.path===asset.path);
   if(v&&attempt(v,c)){stats.ordinaryWarmPlaced++;break;}
  }
 }
 return {schema:SCHEMA,stage:"original-warm-boulders-before-canopy",
  seed,worldHexes:world.cells.length,worldSource:{...siteAudit.worldSource},
  natureCatalogRevision:natureCatalog.revision??null,
  mountainCoreHexes:cores.size,reservedBuildHexes:clearings.size,
  originalWarmVariants:warm.length,statistics:stats,instances,
  requiresOtherBoulderPass:true,requiresShrubs:true,
  requiresTreeCanopyPlacement:true,requiresOriginalPngDecoding:true,
  requiresOriginalShadows:true,requiresFullEditorPopulationParity:true,
  rasterized:false,complete:false,readyForViewer:false};
}
const api={SCHEMA,LIMIT,hash,inside,create};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapWarmBoulders=api;
})(typeof window!=="undefined"?window:globalThis);

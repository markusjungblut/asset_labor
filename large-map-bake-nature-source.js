/* Phase 2.8a: original Nature tree habitat / quota preflight.
 * Read-only: no placed trunks, shrubs, shadows, PNG or atlas readiness.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-nature-tree-sites-v1",LIMIT=10000;
const key=c=>c.q+","+c.r;
function hash(seed,q,r,salt){
 let h=(seed|0)^Math.imul(q+97,374761393)^Math.imul(r+513,668265263)^Math.imul(salt+11,2246822519);
 h^=h>>>13;h=Math.imul(h,1274126177);
 return ((h^(h>>>16))>>>0)/4294967296;
}
function pathSalt(path){
 let n=0;for(const c of path)n=(Math.imul(n,31)+c.charCodeAt(0))|0;
 return n;
}
function create({world,terrainCatalog,natureCatalog,assets,forestCells,mountainPlan,
 seed=12345,rules=root.VedrasNatureCatalog,forest=root.VedrasForest,
 balance=root.VedrasNatureBalance,mountains=root.VedrasMountains,
 existing=root.VedrasExistingAssets,polish=root.VedrasPolish}={}){
 if(!Array.isArray(world?.cells)||!world.cells.length||world.cells.length>LIMIT||
  !Array.isArray(terrainCatalog?.terrainTypes)||!natureCatalog?.entries||
  !Array.isArray(assets)||!Array.isArray(forestCells)||
  !Array.isArray(mountainPlan?.instances)||mountainPlan.complete!==false||
  mountainPlan.readyForViewer!==false||mountainPlan.worldHexes!==world.cells.length||
  typeof rules?.canPlace!=="function"||typeof rules?.effectiveTypes!=="function"||
  typeof forest?.treeTarget!=="function"||typeof forest?.maxObjects!=="function"||
  typeof forest?.preferredFamily!=="function"||!Array.isArray(forest?.DIRS)||
  typeof balance?.reserveClearings!=="function"||typeof balance?.isCanopy!=="function"||
  typeof mountains?.occupied!=="function"||typeof existing?.canAutoPlaceInTest!=="function"||
  typeof polish?.patch!=="function"||!Number.isSafeInteger(seed)||seed<1)
  throw Error("Original-Nature-Regeln, Waldquelle oder Bergplanung fehlen (maximal 10.000 Hexe).");
 const terrain=new Map(terrainCatalog.terrainTypes.map(t=>[t.id,t]));
 const cells=new Map(),woods=new Map();
 for(const c of world.cells){
  if(!Number.isSafeInteger(c.q)||!Number.isSafeInteger(c.r)||
   !terrain.has(c.terrainId)||cells.has(key(c)))
   throw Error("Doppelte oder unbekannte geografische Nature-Zelle.");
  cells.set(key(c),c);
 }
 for(const f of forestCells){
  const c=cells.get(key(f));
  if(!c||woods.has(key(f))||f.forestClass!==c.forestClass)
   throw Error("Original-Waldklasse der Nature-Quelle inkonsistent.");
  woods.set(key(f),f);
 }
 if(woods.size!==cells.size)throw Error("Für die Nature-Quelle fehlen Waldzellen.");
 const variants=[],used=new Set();
 for(const a of assets){
  if(a?.category!=="nature"||typeof a.path!=="string"||
    !a.path.startsWith("assets/nature/")||!a.path.endsWith(".png")||
    a.relPath!==a.path.slice(7)||used.has(a.path))continue;
  used.add(a.path);
  const meta=natureCatalog.entries[a.relPath];
  if(!balance.isCanopy(meta))continue;
  const allowed=rules.effectiveTypes(meta,terrainCatalog,natureCatalog);
  if(existing.canAutoPlaceInTest(a,meta,allowed))
   variants.push({path:a.path,meta,allowed,salt:pathSalt(a.relPath)});
 }
 variants.sort((a,b)=>a.path.localeCompare(b.path,"en"));
 const blocked=new Set();
 for(const m of mountainPlan.instances){
  if(!cells.has(key(m)))throw Error("Berganker außerhalb der geografischen Welt.");
  for(const k of mountains.occupied(m))if(cells.has(k))blocked.add(k);
 }
 const isGround=c=>terrain.get(c.terrainId)?.materialClass==="ground";
 const reserved=balance.reserveClearings(world.cells,forestCells,seed,isGround,blocked,"canopy");
 const statuses={},sites=[];
 for(const v of variants)statuses[v.meta.artStatus||"unknown"]=
  (statuses[v.meta.artStatus||"unknown"]||0)+1;
 let landHexes=0,candidateHexes=0,demandHexes=0,unservedHexes=0,treeQuota=0;
 for(const c of world.cells){
  if(!isGround(c))continue;
  landHexes++;
  const id=key(c);if(blocked.has(id)||reserved.has(id))continue;
  const f=woods.get(id);
  const neighborTypes=forest.DIRS.map(([dq,dr])=>
   cells.get((c.q+dq)+","+(c.r+dr))?.terrainId).filter(Boolean);
  const pool=variants.filter(v=>
   (v.allowed.has(c.terrainId)||
    (["light_forest","dense_forest"].includes(f.forestClass)&&v.allowed.has("forest_floor"))) &&
    forest.preferredFamily(v.meta.family,f) &&
    rules.canPlace(v.meta,{baseBiome:c.terrainId,biome:c.terrainId,
     forestClass:f.forestClass,neighborTypes},terrainCatalog,natureCatalog));
  if(pool.length)candidateHexes++;
  const priority=v=>hash(seed,c.q,c.r,301+v.salt)/
   Math.max(.04,v.meta.placement.density*Math.min(1,v.meta.placement.weight));
  pool.sort((a,b)=>priority(a)-priority(b)||a.path.localeCompare(b.path,"en"));
  let target=forest.treeTarget(f);
  if(target>1&&polish.patch(seed,c.q,c.r,"tree",1)<.58)target--;
  target=Math.min(target,forest.maxObjects(f));
  if(target===0&&!f.glade&&f.source!=="manual"&&pool.length&&
    hash(seed,c.q,c.r,311+pool[0].salt)<.06)target=1;
  if(target>0){demandHexes++;treeQuota+=target;if(!pool.length)unservedHexes++;}
  if(pool.length||target)sites.push({q:c.q,r:c.r,forestClass:f.forestClass,
   targetTreeSlots:target,eligibleVariants:pool.length,
   firstAssetPath:pool[0]?.path||null,source:f.source||"none",glade:!!f.glade});
 }
 return {schema:SCHEMA,stage:"original-nature-tree-site-preflight",
  seed,worldHexes:world.cells.length,landHexes,
  worldSource:{version:world.version,seed:world.seed,width:world.width,
   height:world.height,originQ:world.originQ,originR:world.originR},
  natureCatalogRevision:natureCatalog.revision??null,
  physicalTreeVariants:variants.length,artStatuses:statuses,
  mountainCoreHexes:blocked.size,reservedBuildHexes:reserved.size,
  candidateHexes,demandHexes,unservedHexes,treeQuota,sites,
  requiresTrunkPlacement:true,requiresRiverRoadGates:true,
  requiresPixelOverlapCheck:true,requiresShadows:true,
  requiresNatureShrubs:true,requiresOriginalPngDecoding:true,
  rasterized:false,complete:false,readyForViewer:false};
}
const api={SCHEMA,LIMIT,hash,create};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapNatureSource=api;
})(typeof window!=="undefined"?window:globalThis);

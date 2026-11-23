/* Phase 2.8j: deterministic ORIGINAL shrubs, deadwood and minor Nature accents.
 * Runs after warm boulders, living trees, ordinary boulders and snow.
 * Planning only; no atlas write, no catalog mutation, no viewer release.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-nature-accents-v1",LIMIT=10000;
const radius=256/Math.sqrt(3);
const key=c=>c.q+","+c.r;
const pos=c=>({x:256*(c.q+c.r/2),y:1.5*radius*c.r});
const inside=(x,y,margin=0)=>{
 const ax=Math.abs(x),ay=Math.abs(y);
 return ay<=radius-margin&&ax<=Math.min(128,Math.sqrt(3)*(radius-ay))-margin;
};
function hash(seed,q,r,salt){
 let h=(seed|0)^Math.imul(q+97,374761393)^Math.imul(r+513,668265263)^Math.imul(salt+11,2246822519);
 h^=h>>>13;h=Math.imul(h,1274126177);
 return ((h^(h>>>16))>>>0)/4294967296;
}
function pathSalt(s){
 let v=0;for(const ch of s)v=(Math.imul(v,31)+ch.charCodeAt(0))|0;
 return v;
}
const sameSource=(a,b)=>!!a&&!!b&&
 ["version","seed","width","height","originQ","originR"].every(k=>a[k]===b[k]);
const isAccentCandidate=(m,balance)=>!!m&&
 (["shrub","cluster","ground_cover","special"].includes(m.kind)||
 (m.kind==="tree"&&!balance.isCanopy(m)))&&
 m.family!=="snow"&&m.kind!=="mountain";
function create({world,terrainCatalog,natureCatalog,assets,forestCells,
 mountainPlan,siteAudit,warmPlan,treePlan,latePlan,
 seed=12345,composition=1,riverWidth=32,roadEdges=world?.roadEdges||[],
 rules=root.VedrasNatureCatalog,forest=root.VedrasForest,
 balance=root.VedrasNatureBalance,mountains=root.VedrasMountains,
 polish=root.VedrasPolish,existing=root.VedrasExistingAssets,
 rivers=root.VedrasRivers,roads=root.VedrasRoads}={}){
 if(!Array.isArray(world?.cells)||!world.cells.length||world.cells.length>LIMIT||
  !Array.isArray(world.riverPaths)||!Array.isArray(roadEdges)||
  !Array.isArray(terrainCatalog?.terrainTypes)||!natureCatalog?.entries||
  !Array.isArray(assets)||!Array.isArray(forestCells)||
  mountainPlan?.schema!=="vedras-geography-scenery-source-v1"||
  !Array.isArray(mountainPlan.instances)||mountainPlan.complete!==false||
  mountainPlan.rasterized!==false||mountainPlan.readyForViewer!==false||
  siteAudit?.schema!=="vedras-geography-nature-tree-sites-v1"||
  siteAudit.complete!==false||siteAudit.rasterized!==false||
  siteAudit.readyForViewer!==false||siteAudit.seed!==seed||
  warmPlan?.schema!=="vedras-geography-warm-boulder-prepass-v1"||
  warmPlan.stage!=="original-warm-boulders-before-canopy"||
  warmPlan.complete!==false||warmPlan.rasterized!==false||
  warmPlan.readyForViewer!==false||warmPlan.seed!==seed||
  !Array.isArray(warmPlan.instances)||
  treePlan?.schema!=="vedras-geography-tree-trunk-plan-v1"||
  treePlan.complete!==false||treePlan.rasterized!==false||
  treePlan.readyForViewer!==false||treePlan.seed!==seed||
  !Array.isArray(treePlan.instances)||
  latePlan?.schema!=="vedras-geography-late-rock-snow-v1"||
  latePlan.stage!=="original-late-rock-and-snow-after-trees"||
  latePlan.complete!==false||latePlan.rasterized!==false||
  latePlan.readyForViewer!==false||latePlan.seed!==seed||
  !Array.isArray(latePlan.instances)||
  ![mountainPlan,siteAudit,warmPlan,treePlan,latePlan].every(p=>
   p.worldHexes===world.cells.length&&sameSource(p.worldSource,world)&&
   (p===siteAudit||p.natureCatalogRevision===(natureCatalog.revision??null)))||
  treePlan.earlierWarmBoulders!==warmPlan.instances.length||
  latePlan.earlierWarmBoulders!==warmPlan.instances.length||
  latePlan.earlierTrees!==treePlan.instances.length||
  warmPlan.instances.length+treePlan.instances.length+latePlan.instances.length>250000||
  typeof rules?.effectiveTypes!=="function"||typeof rules?.canPlace!=="function"||
  !Array.isArray(forest?.DIRS)||typeof forest?.maxObjects!=="function"||
  typeof forest?.preferredFamily!=="function"||typeof forest?.inGlade!=="function"||
  typeof balance?.isCanopy!=="function"||typeof balance?.isWarmBoulder!=="function"||
  typeof balance?.isAccent!=="function"||typeof balance?.accentGroup!=="function"||
  typeof balance?.accentLimits!=="function"||
  typeof balance?.chanceMultiplier!=="function"||
  typeof balance?.placementScale!=="function"||
  typeof balance?.reserveClearings!=="function"||
  typeof mountains?.occupied!=="function"||
  typeof polish?.patch!=="function"||typeof polish?.localOffset!=="function"||
  typeof existing?.canAutoPlaceInTest!=="function"||
  typeof rivers?.blocksPoint!=="function"||typeof rivers?.valid!=="function"||
  typeof roads?.blocksPoint!=="function"||
  !Number.isSafeInteger(seed)||seed<1||
  !Number.isFinite(composition)||composition<0||composition>1||
  !Number.isFinite(riverWidth)||riverWidth<12||riverWidth>70)
  throw Error("Original-Akzent-Nachlauf benötigt vollständige unveränderte Quellen.");
 const terrain=new Map(terrainCatalog.terrainTypes.map(t=>[t.id,t]));
 const cells=new Map(),woods=new Map();
 for(const c of world.cells){
  if(!Number.isSafeInteger(c.q)||!Number.isSafeInteger(c.r)||
   !terrain.has(c.terrainId)||cells.has(key(c)))
   throw Error("Original-Akzente: Weltzelle doppelt oder Terrain unbekannt.");
  cells.set(key(c),c);
 }
 for(const f of forestCells){
  if(!cells.has(key(f))||woods.has(key(f))||
   f.forestClass!==cells.get(key(f)).forestClass)
   throw Error("Original-Akzente: Waldquelle inkonsistent.");
  woods.set(key(f),f);
 }
 if(woods.size!==cells.size)throw Error("Original-Akzente: Waldzellen fehlen.");
 const cores=new Set();
 for(const m of mountainPlan.instances){
  if(!cells.has(key(m)))throw Error("Original-Akzente: Berg außerhalb der Welt.");
  for(const k of mountains.occupied(m))if(cells.has(k))cores.add(k);
 }
 const isGround=c=>terrain.get(c.terrainId)?.materialClass==="ground";
 const clearings=balance.reserveClearings(world.cells,forestCells,seed,isGround,cores,"canopy");
 if(cores.size!==siteAudit.mountainCoreHexes||
  cores.size!==latePlan.mountainCoreHexes||
  clearings.size!==siteAudit.reservedBuildHexes||
  clearings.size!==latePlan.reservedBuildHexes)
  throw Error("Original-Akzente: Berg- und Freiflächenreserven veraltet.");
 const wet=c=>["water","shoreline"].includes(terrain.get(c?.terrainId)?.materialClass);
 const routes=[];
 for(const route of world.riverPaths){
  if(!Array.isArray(route)||route.length<2||route.length>10000||
   route.some(p=>!Array.isArray(p)||p.length!==2||
    !Number.isSafeInteger(p[0])||!Number.isSafeInteger(p[1])||
    !cells.has(p[0]+","+p[1])))
   throw Error("Original-Akzente: Flussroute unvollständig.");
  const source={hexes:route.map(p=>[p[0],p[1]])};
  if(!rivers.valid(source,world.cells,wet))
   throw Error("Original-Akzente: Original-Flussroute ungültig.");
  routes.push(source);
 }
 const seen=new Set(),candidates=[];
 for(const asset of assets){
  if(asset?.category!=="nature"||typeof asset.path!=="string"||
   !/^assets\/nature\/[\p{L}\p{N}_.-]+\.png$/iu.test(asset.path)||
   asset.path.includes("..")||asset.relPath!==asset.path.slice(7)||
   seen.has(asset.path))continue;
  seen.add(asset.path);
  const meta=natureCatalog.entries[asset.relPath];
  if(!isAccentCandidate(meta,balance))continue;
  if(!(meta.placement?.density>0&&meta.placement?.weight>0))continue;
  if(!existing.canAutoPlaceInTest(asset,meta,
   rules.effectiveTypes(meta,terrainCatalog,natureCatalog)))continue;
  candidates.push({asset,meta,salt:pathSalt(asset.relPath)});
 }
 candidates.sort((a,b)=>a.asset.path.localeCompare(b.asset.path,"en"));
 const byHex=new Map(),priorCount=warmPlan.instances.length+
  treePlan.instances.length+latePlan.instances.length;
 function registerPrior(n,kind){
  const c=cells.get(key(n)),meta=natureCatalog.entries[n.assetPath?.slice(7)];
  if(!c||!meta||meta.id!==n.assetId||
   !Number.isFinite(n.dx)||!Number.isFinite(n.dy)||
   !Number.isFinite(n.scale)||n.scale<=0||
   (kind==="warm"?!balance.isWarmBoulder(meta):
    kind==="tree"?!balance.isCanopy(meta):
    kind==="late"?!(
     (n.kind==="rock"&&meta.kind==="rock")||
     (n.kind==="snow"&&meta.kind==="ground_cover"&&meta.family==="snow")):
    true))
   throw Error("Original-Akzente: frühere Platzierung widersprüchlich.");
  const k=key(c);
  if(!byHex.has(k))byHex.set(k,[]);
  byHex.get(k).push(n);
 }
 for(const n of warmPlan.instances)registerPrior(n,"warm");
 for(const n of treePlan.instances)registerPrior(n,"tree");
 for(const n of latePlan.instances)registerPrior(n,"late");
 const limits=balance.accentLimits(world.cells.filter(isGround).length);
 const accents={dead_trees:0,fallen_logs:0};
 const instances=[],stats={
  physicalAccentVariants:candidates.length,checkedGroundHexes:0,
  earlierWarmBoulders:warmPlan.instances.length,
  earlierTrees:treePlan.instances.length,
  earlierRocksAndSnow:latePlan.instances.length,
  placedShrubs:0,placedDeadTrees:0,placedFallenLogs:0,
  placedDeadwood:0,placedOther:0,
  rejectedCap:0,rejectedAccentCap:0,rejectedSpacing:0,
  rejectedRiver:0,rejectedRoad:0,rejectedOutside:0,
  accentLimits:limits
 };
 const neighbors=(q,r)=>{
  const a=[];
  for(let dr=-2;dr<=2;dr++)for(let dq=-2;dq<=2;dq++){
   const hit=byHex.get((q+dq)+","+(r+dr));
   if(hit)a.push(...hit);
  }
  return a;
 };
 const rank=(v,c,salt)=>hash(seed,c.q,c.r,salt+v.salt);
 function place(v,c,f,spacingFactor){
  const {meta,asset}=v,index=priorCount+instances.length+1,base=pos(c),
   scale=meta.scaleMin+(meta.scaleMax-meta.scaleMin)*
    hash(seed,c.q,c.r,index*47+7),old=neighbors(c.q,c.r);
  for(let attempt=0;attempt<72;attempt++){
   const group=meta.kind==="shrub"?"shrub":
    meta.kind==="ground_cover"?"ground_cover":
    meta.kind==="tree"?"tree":"other";
   const {dx,dy}=polish.localOffset(seed,c.q,c.r,group,index,attempt,composition);
   if(!inside(dx,dy,meta.placement.edgeMargin)){
    stats.rejectedOutside++;continue;
   }
   if(meta.kind==="tree"&&forest.inGlade(f,dx,dy))continue;
   const x=base.x+dx,y=base.y+dy;
   const fallen=["fallen_logs","snow_fallen_logs"].includes(meta.family);
   const riverRadius=(fallen?
    Math.max(64,Math.min(95,(Number(meta.logicalWidth)||140)*.55)):
    Math.max(6,Math.min(28,(Number(meta.logicalWidth)||52)*.16)))+5;
   if(routes.length&&rivers.blocksPoint(x,y,routes,world.cells,wet,riverWidth,riverRadius)){
    stats.rejectedRiver++;continue;
   }
   if(roadEdges.length&&roads.blocksPoint(x,y,roadEdges,8,256)){
    stats.rejectedRoad++;continue;
   }
   if(c.q===0&&c.r===0&&Math.hypot(dx,dy-52)<65)continue;
   if(old.some(n=>{
    const p=pos(n),other=natureCatalog.entries[n.assetPath.slice(7)];
    const both=balance.isCanopy(meta)&&balance.isCanopy(other);
    const factor=both?spacingFactor:Math.max(.85,spacingFactor);
    const spacing=Math.max(both&&factor<.6?10:14,
     Math.max(meta.placement.minSpacing,other?.placement?.minSpacing||0)*
     factor*Math.sqrt(balance.placementScale(meta)*balance.placementScale(other)));
    return Math.hypot(x-p.x-n.dx,y-p.y-n.dy)<spacing;
   })){stats.rejectedSpacing++;continue;}
   const inst={assetPath:asset.path,assetId:meta.id,q:c.q,r:c.r,
    dx:Math.round(dx*100)/100,dy:Math.round(dy*100)/100,
    scale:Math.round(scale*1000)/1000,kind:meta.kind,
    source:"geography-original-late-accents",
    artStatus:meta.artStatus||"unknown"};
   instances.push(inst);
   if(!byHex.has(key(c)))byHex.set(key(c),[]);
   byHex.get(key(c)).push(inst);
   return true;
  }
  return false;
 }
 for(const c of world.cells){
  const k=key(c);
  if(!isGround(c)||cores.has(k)||clearings.has(k)||k==="0,0")continue;
  const f=woods.get(k),cap=forest.maxObjects(f);
  if(!(cap>0))continue;
  stats.checkedGroundHexes++;
  const neighborTypes=forest.DIRS.map(([dq,dr])=>
   cells.get((c.q+dq)+","+(c.r+dr))?.terrainId).filter(Boolean);
  const mode=f.forestMode||"canopy";
  const spacingFactor=mode==="canopy"?
   (f.forestClass==="dense_forest"?.34:f.forestClass==="light_forest"?.59:.88):
   mode==="dense"?
   (f.forestClass==="dense_forest"?.52:f.forestClass==="light_forest"?.73:1):
   (f.forestClass==="dense_forest"?.72:f.forestClass==="light_forest"?.92:1);
  const possible=candidates.filter(v=>
   forest.preferredFamily(v.meta.family,f)&&
   rules.canPlace(v.meta,{baseBiome:c.terrainId,biome:c.terrainId,
    forestClass:f.forestClass,neighborTypes},terrainCatalog,natureCatalog))
   .sort((a,b)=>rank(a,c,302)-rank(b,c,302)||
    a.asset.path.localeCompare(b.asset.path,"en"));
  let count=(byHex.get(k)||[]).length;
  let accentOnHex=(byHex.get(k)||[]).some(n=>
   balance.isAccent(natureCatalog.entries[n.assetPath.slice(7)]));
  for(const v of possible){
   if(count>=cap){stats.rejectedCap++;break;}
   const m=v.meta,group=balance.accentGroup(m);
   if(group&&(accentOnHex||accents[group]>=limits[group])){
    stats.rejectedAccentCap++;continue;
   }
   const factor=f.forestClass==="dense_forest"?1.20:
    f.forestClass==="light_forest"?1.05:f.edgeInfluence>.1?1.05:1;
   const groupName=m.kind==="shrub"?"shrub":
    m.kind==="ground_cover"?"ground_cover":"other";
   const patch=polish.patch(seed,c.q,c.r,groupName,composition);
   const chance=Math.min(.82,m.placement.density*
    Math.min(1,m.placement.weight)*factor*
    balance.chanceMultiplier(m)*patch);
   if(rank(v,c,312)>=chance)continue;
   if(place(v,c,f,spacingFactor)){
    count++;
    if(group){accents[group]++;accentOnHex=true;}
    if(m.kind==="shrub")stats.placedShrubs++;
    else if(group==="dead_trees")stats.placedDeadTrees++;
    else if(group==="fallen_logs")stats.placedFallenLogs++;
    else if(m.family==="deadwood")stats.placedDeadwood++;
    else stats.placedOther++;
   }
  }
 }
 return {schema:SCHEMA,stage:"original-shrubs-deadwood-and-accents-after-snow",
  seed,worldHexes:world.cells.length,worldSource:{...siteAudit.worldSource},
  natureCatalogRevision:natureCatalog.revision??null,
  earlierWarmBoulders:warmPlan.instances.length,
  earlierTrees:treePlan.instances.length,
  earlierRocksAndSnow:latePlan.instances.length,
  mountainCoreHexes:cores.size,reservedBuildHexes:clearings.size,
  stats,instances,
  requiresOriginalShadows:true,requiresFullCanopyCoverage:true,
  requiresOriginalPngDecoding:true,requiresFullEditorPopulationParity:true,
  rasterized:false,complete:false,readyForViewer:false};
}
const api={SCHEMA,hash,create};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapNatureAccents=api;
})(typeof window!=="undefined"?window:globalThis);

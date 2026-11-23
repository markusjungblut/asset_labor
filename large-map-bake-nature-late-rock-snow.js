/* Phase 2.8i: original LATE ordinary boulders and snow ground-cover.
 * Mirrors Nature UI populate() AFTER tree canopy and BEFORE shrubs/deadwood.
 * Deterministic independent world planning; no editor mutations or atlas.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-late-rock-snow-v1",LIMIT=10000;
const radius=256/Math.sqrt(3),key=c=>c.q+","+c.r;
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
function sameSource(a,b){
 return !!a&&!!b&&["version","seed","width","height","originQ","originR"]
  .every(k=>a[k]===b[k]);
}
function create({world,terrainCatalog,natureCatalog,assets,forestCells,
 mountainPlan,siteAudit,warmPlan,treePlan,seed=12345,composition=1,
 riverWidth=32,roadEdges=world?.roadEdges||[],
 rules=root.VedrasNatureCatalog,forest=root.VedrasForest,
 balance=root.VedrasNatureBalance,mountains=root.VedrasMountains,
 polish=root.VedrasPolish,existing=root.VedrasExistingAssets,
 rivers=root.VedrasRivers,roads=root.VedrasRoads}={}){
 if(!Array.isArray(world?.cells)||world.cells.length===0||world.cells.length>LIMIT||
  !Array.isArray(world.riverPaths)||!Array.isArray(roadEdges)||
  !Array.isArray(terrainCatalog?.terrainTypes)||!natureCatalog?.entries||
  !Array.isArray(assets)||!Array.isArray(forestCells)||
  mountainPlan?.schema!=="vedras-geography-scenery-source-v1"||
  !Array.isArray(mountainPlan.instances)||mountainPlan.complete!==false||
  mountainPlan.rasterized!==false||mountainPlan.readyForViewer!==false||
  mountainPlan.worldHexes!==world.cells.length||
  siteAudit?.schema!=="vedras-geography-nature-tree-sites-v1"||
  siteAudit.complete!==false||siteAudit.rasterized!==false||
  siteAudit.readyForViewer!==false||siteAudit.seed!==seed||
  siteAudit.worldHexes!==world.cells.length||
  warmPlan?.schema!=="vedras-geography-warm-boulder-prepass-v1"||
  warmPlan.stage!=="original-warm-boulders-before-canopy"||
  warmPlan.complete!==false||warmPlan.rasterized!==false||
  warmPlan.readyForViewer!==false||warmPlan.seed!==seed||
  warmPlan.worldHexes!==world.cells.length||
  treePlan?.schema!=="vedras-geography-tree-trunk-plan-v1"||
  treePlan.complete!==false||treePlan.rasterized!==false||
  treePlan.readyForViewer!==false||treePlan.seed!==seed||
  treePlan.worldHexes!==world.cells.length||
  treePlan.earlierWarmBoulders!==warmPlan.instances?.length||
  !Array.isArray(warmPlan.instances)||!Array.isArray(treePlan.instances)||
  warmPlan.instances.length+treePlan.instances.length>250000||
  !sameSource(siteAudit.worldSource,mountainPlan.worldSource)||
  !sameSource(siteAudit.worldSource,warmPlan.worldSource)||
  !sameSource(siteAudit.worldSource,treePlan.worldSource)||
  !sameSource(siteAudit.worldSource,world)||
  warmPlan.natureCatalogRevision!==(natureCatalog.revision??null)||
  treePlan.natureCatalogRevision!==(natureCatalog.revision??null)||
  mountainPlan.natureCatalogRevision!==(natureCatalog.revision??null)||
  typeof rules?.effectiveTypes!=="function"||typeof rules?.canPlace!=="function"||
  !Array.isArray(forest?.DIRS)||typeof forest?.maxObjects!=="function"||
  typeof forest?.preferredFamily!=="function"||
  typeof balance?.warmBoulderPool!=="function"||
  typeof balance?.isWarmBoulder!=="function"||
  typeof balance?.isCanopy!=="function"||
  typeof balance?.placementScale!=="function"||
  typeof balance?.reserveClearings!=="function"||
  typeof mountains?.occupied!=="function"||
  typeof polish?.localOffset!=="function"||
  typeof existing?.canAutoPlaceInTest!=="function"||
  typeof rivers?.blocksPoint!=="function"||typeof rivers?.valid!=="function"||
  typeof roads?.blocksPoint!=="function"||
  !Number.isSafeInteger(seed)||seed<1||
  !Number.isFinite(composition)||composition<0||composition>1||
  !Number.isFinite(riverWidth)||riverWidth<12||riverWidth>70)
  throw Error("Später Original-Fels-/Schneevorlauf benötigt vollständige unveränderte Quellen.");
 const terrain=new Map(terrainCatalog.terrainTypes.map(t=>[t.id,t]));
 const cells=new Map(),woods=new Map();
 for(const c of world.cells){
  if(!Number.isSafeInteger(c.q)||!Number.isSafeInteger(c.r)||
   !terrain.has(c.terrainId)||cells.has(key(c)))
   throw Error("Späte Nature-Phase: Weltzelle doppelt oder Terrain unbekannt.");
  cells.set(key(c),c);
 }
 for(const f of forestCells){
  if(!cells.has(key(f))||woods.has(key(f))||
   f.forestClass!==cells.get(key(f)).forestClass)
   throw Error("Späte Nature-Phase: Waldquelle inkonsistent.");
  woods.set(key(f),f);
 }
 if(woods.size!==cells.size)throw Error("Späte Nature-Phase: Waldzellen fehlen.");
 const cores=new Set();
 for(const m of mountainPlan.instances){
  if(!cells.has(key(m)))throw Error("Späte Nature-Phase: Berg außerhalb der Welt.");
  for(const k of mountains.occupied(m))if(cells.has(k))cores.add(k);
 }
 const isGround=c=>terrain.get(c.terrainId)?.materialClass==="ground";
 const clearing=balance.reserveClearings(world.cells,forestCells,seed,isGround,cores,"canopy");
 if(cores.size!==siteAudit.mountainCoreHexes||
  clearing.size!==siteAudit.reservedBuildHexes||
  warmPlan.mountainCoreHexes!==cores.size||
  warmPlan.reservedBuildHexes!==clearing.size||
  treePlan.mountainCoreHexes!==cores.size||
  treePlan.reservedBuildHexes!==clearing.size)
  throw Error("Späte Nature-Phase: Berg- und Freiflächenreserven widersprüchlich.");
 const wet=c=>["water","shoreline"].includes(terrain.get(c?.terrainId)?.materialClass);
 const routes=[];
 for(const route of world.riverPaths){
  if(!Array.isArray(route)||route.length<2||route.length>10000||
   route.some(p=>!Array.isArray(p)||p.length!==2||
    !Number.isSafeInteger(p[0])||!Number.isSafeInteger(p[1])||
    !cells.has(p[0]+","+p[1])))
   throw Error("Späte Nature-Phase: ungültige Flussroute.");
  const candidate={hexes:route.map(p=>[p[0],p[1]])};
  if(!rivers.valid(candidate,world.cells,wet))
   throw Error("Späte Nature-Phase: Original-Flussroute ungültig.");
  routes.push(candidate);
 }
 const rock=[],snow=[],seen=new Set();
 for(const asset of assets){
  if(asset?.category!=="nature"||typeof asset.path!=="string"||
   !asset.path.startsWith("assets/nature/")||
   !asset.path.endsWith(".png")||asset.path.includes("..")||
   asset.relPath!==asset.path.slice(7)||seen.has(asset.path))continue;
  seen.add(asset.path);
  const meta=natureCatalog.entries[asset.relPath];
  const boulder=meta?.kind==="rock"&&
   (meta.family==="stones"||/^boulder[_-]?\d+$/i.test(meta.id||""));
  const snowPatch=meta?.kind==="ground_cover"&&meta.family==="snow";
  if(!boulder&&!snowPatch)continue;
  const allowed=rules.effectiveTypes(meta,terrainCatalog,natureCatalog);
  if(!existing.canAutoPlaceInTest(asset,meta,allowed))continue;
  const v={asset,meta};
  if(boulder)rock.push(v);else snow.push(v);
 }
 rock.sort((a,b)=>a.asset.path.localeCompare(b.asset.path,"en"));
 snow.sort((a,b)=>a.asset.path.localeCompare(b.asset.path,"en"));
 const byHex=new Map(),priorCount=warmPlan.instances.length+treePlan.instances.length;
 function registerOld(n,kind){
  const c=cells.get(key(n)),m=natureCatalog.entries[n.assetPath?.slice(7)];
  if(!c||!m||m.id!==n.assetId||
   (kind==="warm"?!balance.isWarmBoulder(m):!balance.isCanopy(m))||
   !Number.isFinite(n.dx)||!Number.isFinite(n.dy)||
   !Number.isFinite(n.scale)||n.scale<=0||
   n.source!==(kind==="warm"?
    "geography-original-warm-boulder-prepass":
    "geography-original-tree-trunk-preview"))
   throw Error("Späte Nature-Phase: frühere Sprite-Anker nicht autoritativ.");
  const k=key(c);
  if(!byHex.has(k))byHex.set(k,[]);
  byHex.get(k).push(n);
 }
 for(const n of warmPlan.instances)registerOld(n,"warm");
 for(const n of treePlan.instances)registerOld(n,"tree");
 const instances=[],stats={earlierWarmBoulders:warmPlan.instances.length,
  earlierTrees:treePlan.instances.length,
  regularBoulderVariants:rock.filter(v=>!balance.isWarmBoulder(v.meta)).length,
  snowOriginalVariants:snow.length,
  checkedGroundHexes:0,rockHexOpportunities:0,
  placedOrdinaryBoulders:0,placedSnowPatches:0,
  suppressedByWarmPool:0,rejectedSlotCapacity:0,
  rejectedOutside:0,rejectedRiver:0,rejectedRoad:0,rejectedSpacing:0};
 const neighbors=(q,r)=>{
  const a=[];
  for(let dr=-2;dr<=2;dr++)for(let dq=-2;dq<=2;dq++){
   const found=byHex.get((q+dq)+","+(r+dr));
   if(found)a.push(...found);
  }
  return a;
 };
 function place(v,c,f,spacingFactor,kind){
  const index=priorCount+instances.length+1,meta=v.meta,base=pos(c),
   scale=meta.scaleMin+(meta.scaleMax-meta.scaleMin)*hash(seed,c.q,c.r,index*47+7);
  const old=neighbors(c.q,c.r);
  for(let attempt=0;attempt<72;attempt++){
   const offsetKind=kind==="snow"?"ground_cover":"other";
   const {dx,dy}=polish.localOffset(seed,c.q,c.r,offsetKind,index,attempt,composition);
   if(!inside(dx,dy,meta.placement.edgeMargin)){stats.rejectedOutside++;continue;}
   const x=base.x+dx,y=base.y+dy;
   const riverRadius=Math.max(6,Math.min(28,(Number(meta.logicalWidth)||52)*.16))+5;
   if(routes.length&&rivers.blocksPoint(x,y,routes,world.cells,wet,riverWidth,riverRadius)){
    stats.rejectedRiver++;continue;
   }
   if(roadEdges.length&&roads.blocksPoint(x,y,roadEdges,8,256)){
    stats.rejectedRoad++;continue;
   }
   if(old.some(n=>{
    const p=pos(n),other=natureCatalog.entries[n.assetPath.slice(7)];
    const bothCanopy=balance.isCanopy(meta)&&balance.isCanopy(other);
    const factor=bothCanopy?spacingFactor:Math.max(.85,spacingFactor);
    const spacing=Math.max(bothCanopy&&factor<.6?10:14,
     Math.max(meta.placement.minSpacing,other?.placement?.minSpacing||0)*
     factor*Math.sqrt(balance.placementScale(meta)*balance.placementScale(other)));
    return Math.hypot(x-p.x-n.dx,y-p.y-n.dy)<spacing;
   })){stats.rejectedSpacing++;continue;}
   const inst={assetPath:v.asset.path,assetId:meta.id,q:c.q,r:c.r,
    dx:Math.round(dx*100)/100,dy:Math.round(dy*100)/100,
    scale:Math.round(scale*1000)/1000,
    source:"geography-original-late-rock-snow",
    kind,artStatus:meta.artStatus||"unknown"};
   instances.push(inst);
   const k=key(c);
   if(!byHex.has(k))byHex.set(k,[]);
   byHex.get(k).push(inst);
   return true;
  }
  return false;
 }
 for(const c of world.cells){
  const k=key(c);
  if(!isGround(c)||cores.has(k)||clearing.has(k)||k==="0,0")continue;
  const f=woods.get(k),max=forest.maxObjects(f);
  if(!(max>0))continue;
  stats.checkedGroundHexes++;
  const neighborTypes=forest.DIRS.map(([dq,dr])=>
   cells.get((c.q+dq)+","+(c.r+dr))?.terrainId).filter(Boolean);
  const eligible=v=>forest.preferredFamily(v.meta.family,f)&&
   rules.canPlace(v.meta,{baseBiome:c.terrainId,biome:c.terrainId,
    forestClass:f.forestClass,neighborTypes},terrainCatalog,natureCatalog);
  const permittedRocks=rock.filter(eligible),permittedSnow=snow.filter(eligible);
  const mode=f.forestMode||"canopy";
  const spacingFactor=mode==="canopy"?
   (f.forestClass==="dense_forest"?.34:f.forestClass==="light_forest"?.59:.88):
   mode==="dense"?
   (f.forestClass==="dense_forest"?.52:f.forestClass==="light_forest"?.73:1):
   (f.forestClass==="dense_forest"?.72:f.forestClass==="light_forest"?.92:1);
  let count=(byHex.get(k)||[]).length;
  if(count>=max){stats.rejectedSlotCapacity++;continue;}
  // Editor: ordinary boulders only where the allowed boulder pool
  // contains NO warm variant. Warm variants were already tried pre-canopy.
  const selection=balance.warmBoulderPool(
   permittedRocks.map(v=>v.asset),
   a=>natureCatalog.entries[a.relPath],hash(seed,c.q,c.r,1607));
  if(selection.warmCount)stats.suppressedByWarmPool++;
  else if(permittedRocks.length){
   const chance=Math.min(.32,
    Math.max(...permittedRocks.map(v=>v.meta.placement.density))*1.15);
   if(hash(seed,c.q,c.r,1601)<chance){
    stats.rockHexOpportunities++;
    const first=Math.floor(hash(seed,c.q,c.r,1602)*permittedRocks.length);
    for(let j=0;j<permittedRocks.length;j++){
     const v=permittedRocks[(first+j)%permittedRocks.length];
     if(place(v,c,f,1,"rock")){
      count++;stats.placedOrdinaryBoulders++;break;
     }
    }
   }
  }
  if(count>=max){stats.rejectedSlotCapacity++;continue;}
  if(permittedSnow.length){
   const chance=["snowfields","frozen_tundra"].includes(c.terrainId)?
    .58:c.terrainId==="highland"?.25:.14;
   if(hash(seed,c.q,c.r,1643)<chance){
    const first=Math.floor(hash(seed,c.q,c.r,1644)*permittedSnow.length);
    for(let j=0;j<permittedSnow.length;j++){
     const v=permittedSnow[(first+j)%permittedSnow.length];
     if(place(v,c,f,spacingFactor,"snow")){
      stats.placedSnowPatches++;break;
     }
    }
   }
  }
 }
 return {schema:SCHEMA,stage:"original-late-rock-and-snow-after-trees",
  seed,worldHexes:world.cells.length,
  worldSource:{...siteAudit.worldSource},
  natureCatalogRevision:natureCatalog.revision??null,
  earlierWarmBoulders:warmPlan.instances.length,
  earlierTrees:treePlan.instances.length,
  mountainCoreHexes:cores.size,reservedBuildHexes:clearing.size,
  stats,instances,
  requiresShrubsAndAccents:true,requiresFullCanopyCoverage:true,
  requiresOriginalPngDecoding:true,requiresOriginalShadows:true,
  requiresFullEditorPopulationParity:true,
  rasterized:false,complete:false,readyForViewer:false};
}
const api={SCHEMA,hash,inside,create};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapLateNature=api;
})(typeof window!=="undefined"?window:globalThis);

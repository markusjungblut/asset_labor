
(function(root) {
"use strict";
const SCHEMA = "vedras-geography-scenery-source-v1";
function key(c) { return c.q + "," + c.r; }
function hash(seed,q,r,salt) {
 let h = (seed|0) ^ Math.imul(q+97,374761393) ^ Math.imul(r+513,668265263) ^ Math.imul(salt+11,2246822519);
 h ^= h >>> 13;
 h = Math.imul(h,1274126177);
 return ((h ^ (h>>>16))>>>0)/4294967296;
}
async function loadNatureCatalog(options={}) {
 const fetcher=options.fetcher || root.fetch?.bind(root);
 if(typeof fetcher!=="function") throw Error("Asset-Labor-Server fehlt.");
 const response=await fetcher("/api/nature-catalog",{cache:"no-store"});
 if(!response?.ok) throw Error("Nature-Katalog nicht abrufbar.");
 return response.json();
}
function create(options={}) {
 const {world,terrainCatalog,natureCatalog,assets}=options;
 const mountains=options.mountains || root.VedrasMountains;
 const rules=options.rules || root.VedrasNatureCatalog;
 const seed=options.seed ?? 12345;
 if(!Array.isArray(world?.cells) || !Array.isArray(terrainCatalog?.terrainTypes) ||
    !natureCatalog?.entries || !Array.isArray(assets) ||
    typeof mountains?.candidate!=="function" || typeof mountains?.config!=="function" ||
    !Array.isArray(mountains?.DIRS) || typeof rules?.mountainAllowed!=="function" ||
    !Number.isSafeInteger(seed) || seed<1)
    throw Error("Original-Bergkatalog und vollständige Geografie fehlen.");
 const types=new Set(terrainCatalog.terrainTypes.map(t=>t.id));
 const seenAssets=new Set();
 const variants=[];
 for(const asset of assets) {
  if(asset?.category!=="nature" || typeof asset.path!=="string" ||
     !asset.path.startsWith("assets/nature/") || !asset.path.endsWith(".png") ||
     asset.relPath!==asset.path.slice(7) || seenAssets.has(asset.path))continue;
  seenAssets.add(asset.path);
  const meta=natureCatalog.entries[asset.relPath];
  if(meta?.kind==="mountain" && meta.artStatus!=="deprecated" &&
     Number.isFinite(meta.logicalWidth) && meta.logicalWidth>0)
    variants.push({asset,meta});
 }
 // /api/assets is lexically ordered; normalize mocks/alternate API listings
 // before the original seeded pick to keep full-world placement deterministic.
 variants.sort((a,b)=>a.asset.path.localeCompare(b.asset.path,'en'));
 const pools=new Map();
 for(const t of terrainCatalog.terrainTypes)
  pools.set(t.id,variants.filter(v=>rules.mountainAllowed(
   v.meta,t.id,terrainCatalog,natureCatalog)));
 const wanted=world.cells.filter(c=>c.reliefClass==="mountain"||c.mountainClass==="massif");
 if(wanted.length>6000)throw Error("Bergquellenlimit von 6.000 überschritten.");
 const lookup=new Map(wanted.map(c=>[key(c),c]));
 const seen=new Set();
 const components=[];
 for(const first of wanted) {
  if(!types.has(first.terrainId))throw Error("Bergterrain unbekannt.");
  if(seen.has(key(first)))continue;
  const component=[first];
  seen.add(key(first));
  for(let i=0;i<component.length;i++) {
   const cell=component[i];
   for(const dir of mountains.DIRS) {
    const id=(cell.q+dir[0])+","+(cell.r+dir[1]);
    const next=lookup.get(id);
    if(next&&!seen.has(id)){seen.add(id);component.push(next);}
   }
  }
  components.push(component);
 }
 const scene={cells:world.cells,mountains:[],nature:[],objects:{}};
 const placed=[],unmatched=[],statuses={};
 for(let index=0;index<components.length;index++) {
  for(const cell of components[index]) {
   const pool=pools.get(cell.terrainId)||[];
   if(!pool.length) {
    unmatched.push({q:cell.q,r:cell.r,terrainId:cell.terrainId,reason:"no-valid-source"});
    continue;
   }
   const start=Math.floor(hash(seed,cell.q,cell.r,2002)*pool.length);
   let chosen=false;
   for(let i=0;i<pool.length;i++) {
    const choice=pool[(start+i)%pool.length];
    const cfg=mountains.config(choice.meta);
    const allow=c=>rules.mountainAllowed(
     choice.meta,c.terrainId,terrainCatalog,natureCatalog);
    const candidate=mountains.candidate(scene,cell.q,cell.r,cfg.radius,allow,
     {coreRadius:0,mode:"chain",chainId:"geography_"+index,spacing:"tight"});
    if(!candidate.ok)continue;
    const record={q:cell.q,r:cell.r,assetPath:choice.asset.path,
     assetId:choice.meta.id,terrainId:cell.terrainId,
     width:choice.meta.logicalWidth,anchor:choice.meta.anchor,
     radius:cfg.radius,coreRadius:0,mode:"chain",chainId:"geography_"+index,
     artStatus:choice.meta.artStatus,source:"geography-scenery-preview"};
    scene.mountains.push(record);
    placed.push(record);
    const status=record.artStatus||"unknown";
    statuses[status]=(statuses[status]||0)+1;
    chosen=true;break;
   }
   if(!chosen)unmatched.push({q:cell.q,r:cell.r,
    terrainId:cell.terrainId,reason:"mountain-candidate-rejected"});
  }
 }
 return {schema:SCHEMA,stage:"original-mountain-placement-preflight",
  seed,worldSource:{version:world.version,seed:world.seed,
   width:world.width,height:world.height,
   originQ:world.originQ,originR:world.originR},
  natureCatalogRevision:natureCatalog.revision??null,
  worldHexes:world.cells.length,mountainHexes:wanted.length,
  mountainRegions:components.length,sourceVariants:variants.length,
  placed:placed.length,instances:placed,unmatched,artStatuses:statuses,
  requiresOriginalPngDecoding:true,requiresPixelOverlapCheck:true,
  requiresNatureTrees:true,requiresShadows:true,
  rasterized:false,complete:false,readyForViewer:false};
}
const api={SCHEMA,hash,loadNatureCatalog,create};
if(typeof module!=="undefined" && module.exports)module.exports=api;
root.VedrasLargeMapScenerySource=api;
})(typeof window!=="undefined"?window:globalThis);

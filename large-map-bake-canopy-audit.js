/* Phase 2.8d: read-only per-WorldTile original-editor CANOPY PROXY audit.
 * Measures the same 0.72*visualWidth^2/hexArea proxy as nature-ui.populate(),
 * using decoded ORIGINAL PNG alpha crops. This is NOT literal crown pixels,
 * nor a request to auto-place trees or approve a completed Scenery layer.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-canopy-proxy-audit-v1";
const SIZE=512,HEX_AREA=256*256*Math.sqrt(3)/2,ALPHA_THRESHOLD=12;
const key=c=>c.q+","+c.r;
const worldPos=c=>({x:256*(c.q+c.r/2),y:1.5*(256/Math.sqrt(3))*c.r});
const sameSource=(a,b)=>!!a&&!!b&&["version","seed","width","height","originQ","originR"]
 .every(k=>a[k]===b[k]);
function create({plan,treePlan,siteAudit,forestCells,natureCatalog,assets,loadImage,
 canvasFactory=()=>root.document.createElement("canvas"),
 spritePlanner=root.VedrasSpritePlanner,balance=root.VedrasNatureBalance,
 forest=root.VedrasForest}={}){
 if(plan?.schema!=="vedras-geography-bake-plan-v1"||
  plan.stage!=="plan-only"||plan.readyForViewer!==false||
  plan.rasterized!==false||plan.grid?.tileSize!==SIZE||
  !Array.isArray(plan.tiles)||plan.tiles.length!==plan.tileCount||
  treePlan?.schema!=="vedras-geography-tree-trunk-plan-v1"||
  treePlan.rasterized!==false||treePlan.complete!==false||
  treePlan.readyForViewer!==false||!Array.isArray(treePlan.instances)||
  treePlan.worldHexes!==plan.source?.cells||
  !sameSource(treePlan.worldSource,plan.source)||
  siteAudit?.schema!=="vedras-geography-nature-tree-sites-v1"||
  siteAudit.rasterized!==false||siteAudit.complete!==false||
  siteAudit.readyForViewer!==false||
  siteAudit.worldHexes!==plan.source.cells||
  !sameSource(siteAudit.worldSource,plan.source)||
  siteAudit.seed!==treePlan.seed||
  !Array.isArray(siteAudit.sites)||
  !Array.isArray(forestCells)||forestCells.length!==plan.source.cells||
  !natureCatalog?.entries||!Array.isArray(assets)||
  treePlan.natureCatalogRevision!==(natureCatalog.revision??null)||
  siteAudit.natureCatalogRevision!==(natureCatalog.revision??null)||
  typeof loadImage!=="function"||typeof canvasFactory!=="function"||
  typeof spritePlanner?.visualWidth!=="function"||
  typeof balance?.sizeFactor!=="function"||
  typeof balance?.isCanopy!=="function"||
  typeof forest?.maxObjects!=="function")
  throw Error("Kronen-Audit benötigt konsistente unfertige Welt-, Baum- und Waldquellen.");
 const tileById=new Map(),byTile=new Map();
 for(const t of plan.tiles){
  if(!Number.isSafeInteger(t?.x)||!Number.isSafeInteger(t.y)||
    t.x%SIZE||t.y%SIZE||t.size!==SIZE||
    t.id!==(t.x/SIZE)+","+(t.y/SIZE)||tileById.has(t.id))
   throw Error("Kronen-Audit: ungültige geografische Kachel.");
  tileById.set(t.id,t);
 }
 const woods=new Map();
 for(const f of forestCells){
  if(!Number.isSafeInteger(f?.q)||!Number.isSafeInteger(f.r)||
   woods.has(key(f))||!["none","light_forest","dense_forest"].includes(f.forestClass))
   throw Error("Kronen-Audit: fehlende oder doppelte Waldzelle.");
  woods.set(key(f),f);
 }
 const originals=new Map(assets.filter(a=>a?.category==="nature"&&
  typeof a.path==="string"&&a.path.startsWith("assets/nature/")&&
  a.relPath===a.path.slice(7)).map(a=>[a.path,a]));
 const grouped=new Map();
 for(const t of treePlan.instances){
  const f=woods.get(key(t)),m=natureCatalog.entries[t.assetPath?.slice(7)];
  if(!f||!balance.isCanopy(m)||t.assetId!==m.id||
   !originals.has(t.assetPath)||!Number.isFinite(t.scale)||t.scale<=0)
   throw Error("Kronen-Audit: geplante Bäume ohne physisches Original.");
  if(!grouped.has(key(t)))grouped.set(key(t),[]);
  grouped.get(key(t)).push(t);
 }
 const seen=new Set();
 for(const s of siteAudit.sites){
  const k=key(s),f=woods.get(k);
  if(!f||seen.has(k)||!Number.isSafeInteger(s.targetTreeSlots)||
    s.targetTreeSlots<0||s.targetTreeSlots>36||f.forestClass!==s.forestClass)
   throw Error("Kronen-Audit: inkonsistenter Standort-Audit.");
  seen.add(k);
  const coverage=f.forestMode==="canopy"&&f.forestClass!=="none"?
   Number(f.canopyCoverage)||0:0;
  if(!s.targetTreeSlots&&coverage<=0&&!(grouped.get(k)?.length))continue;
  const p=worldPos(s),id=Math.floor(p.x/SIZE)+","+Math.floor(p.y/SIZE);
  if(!tileById.has(id))continue;
  if(!byTile.has(id))byTile.set(id,[]);
  byTile.get(id).push({site:s,forest:f,coverTarget:coverage});
 }
 const cache=new WeakMap();
 function bounds(img){
  if(cache.has(img))return cache.get(img);
  const w=img?.naturalWidth,h=img?.naturalHeight;
  if(!(w>0&&h>0))throw Error("Originalbaum für Kronen-Audit nicht dekodiert.");
  const ratio=Math.min(1,256/Math.max(w,h));
  const cw=Math.max(1,Math.round(w*ratio)),ch=Math.max(1,Math.round(h*ratio));
  const scratch=canvasFactory();scratch.width=cw;scratch.height=ch;
  const ctx=scratch.getContext("2d",{willReadFrequently:true});
  if(!ctx?.drawImage||!ctx?.getImageData)
   throw Error("Kronen-Audit benötigt originalgetreue Alphagrenzen.");
  ctx.drawImage(img,0,0,cw,ch);
  const a=ctx.getImageData(0,0,cw,ch).data;
  let x0=cw,y0=ch,x1=-1,y1=-1;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)
   if(a[(y*cw+x)*4+3]>ALPHA_THRESHOLD){
    x0=Math.min(x0,x);x1=Math.max(x1,x);
    y0=Math.min(y0,y);y1=Math.max(y1,y);
   }
  if(x1<0)throw Error("Originalbaum für Kronen-Audit vollständig transparent.");
  const sx=Math.max(0,(x0-.5)*w/cw),sy=Math.max(0,(y0-.5)*h/ch);
  const b={sx,sy,sw:Math.min(w-sx,(x1-x0+2)*w/cw),
   sh:Math.min(h-sy,(y1-y0+2)*h/ch)};
  cache.set(img,b);return b;
 }
 function defaultTile(){
  let best=null,score=-1;
  for(const [id,sites] of byTile){
   const weight=sites.reduce((n,s)=>n+s.site.targetTreeSlots+(s.coverTarget>0?2:0),0);
   if(weight>score){best=id;score=weight;}
  }
  return best||plan.tiles[0]?.id||null;
 }
 async function auditTile(id){
  if(!tileById.has(id))throw Error("Unbekannte WorldTile für Kronen-Audit.");
  const sites=byTile.get(id)||[],images=new Map(),areas=new Map(),rows=[];
  const totals={sites:0,forestSites:0,treeQuota:0,placedTrees:0,
   quotaShortfall:0,underQuotaSites:0,underCanopySites:0,
   overObjectCapSites:0,estimatedAdditionalCapacity:0,
   uncoveredProxyGap:0,totalCoverTarget:0,totalCoverProxy:0};
  async function widthProxy(tree){
   if(areas.has(tree.assetPath))return areas.get(tree.assetPath);
   let img=images.get(tree.assetPath);
   if(!img){
    const loaded=await loadImage(originals.get(tree.assetPath));
    img=loaded?.img||loaded;
    if(!(img?.naturalWidth>0&&img?.naturalHeight>0))
     throw Error("Originalbaum nicht dekodiert: "+tree.assetPath);
    images.set(tree.assetPath,img);
   }
   const m=natureCatalog.entries[tree.assetPath.slice(7)];
   const crop=bounds(img);
   // This is EXACTLY nature-ui.populate()'s per-asset crownCoverage proxy.
   const width=(spritePlanner.visualWidth(m,img,crop)||
    m.logicalWidth||52)*(balance.sizeFactor(m)||1);
   const area=.72*width*width/HEX_AREA;
   if(!(area>0&&Number.isFinite(area)))
    throw Error("Originalbaum ergibt ungültigen Deckungsproxy.");
   areas.set(tree.assetPath,area);
   return area;
  }
  for(const {site,forest:f,coverTarget} of sites){
   const trees=grouped.get(key(site))||[];
   let proxy=0;
   for(const t of trees)proxy+=await widthProxy(t)*t.scale*t.scale;
   const quota=site.targetTreeSlots,cap=forest.maxObjects(f);
   const missing=Math.max(0,quota-trees.length),
    gap=Math.max(0,coverTarget-proxy);
   totals.sites++;totals.forestSites+=f.forestClass!=="none"?1:0;
   totals.treeQuota+=quota;totals.placedTrees+=trees.length;
   totals.quotaShortfall+=missing;
   totals.underQuotaSites+=missing>0?1:0;
   totals.underCanopySites+=gap>1e-9?1:0;
   totals.overObjectCapSites+=trees.length>cap?1:0;
   totals.estimatedAdditionalCapacity+=Math.max(0,cap-trees.length);
   totals.uncoveredProxyGap+=gap;
   totals.totalCoverTarget+=coverTarget;
   totals.totalCoverProxy+=proxy;
   rows.push({q:site.q,r:site.r,forestClass:f.forestClass,
    targetTrees:quota,placedTrees:trees.length,objectCap:cap,
    targetCover:Math.round(coverTarget*10000)/10000,
    editorCoverProxy:Math.round(proxy*10000)/10000,
    proxyGap:Math.round(gap*10000)/10000,
    missingTrees:missing,
    needsAdditionalCanopyPass:missing>0||gap>1e-9,
    unverifiedAdditionalSlots:Math.max(0,cap-trees.length)});
  }
  totals.uncoveredProxyGap=Math.round(totals.uncoveredProxyGap*10000)/10000;
  totals.totalCoverProxy=Math.round(totals.totalCoverProxy*10000)/10000;
  totals.totalCoverTarget=Math.round(totals.totalCoverTarget*10000)/10000;
  return {schema:SCHEMA,stage:"original-editor-canopy-proxy-only",
   tile:{...tileById.get(id)},worldHexes:plan.source.cells,
   originalPngs:images.size,statistics:totals,sites:rows,
   coverageMethod:"editor-0.72-visible-width-squared",
   actualCrownPixelsMeasured:false,
   needsPhysicalCrownOverlapTest:true,needsAdditionalCanopyPass:
    totals.underQuotaSites>0||totals.underCanopySites>0,
   needsEditorFullPopulationParity:true,needsPriorRockPass:true,
   needsTreeMountainOcclusion:true,needsShadows:true,
   rasterized:false,complete:false,readyForViewer:false};
 }
 return {defaultTile,auditTile,previewOnly:true};
}
const api={SCHEMA,SIZE,HEX_AREA,create};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapCanopyAudit=api;
})(typeof window!=="undefined"?window:globalThis);

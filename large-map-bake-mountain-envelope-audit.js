/* Phase 2.8f: read-only mountain chain source-parity audit.
 * Uses the editor's actual mountain SCREEN-ENVELOPE AABB test, based on
 * decoded original PNG aspect ratios, NOT an invented alpha overlap claim.
 * A preflight: no mountain mutations, source replacements or atlas writes.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-mountain-envelope-audit-v1";
const MAX_MOUNTAINS=6000,BUCKET=512,MAX_ISSUES=200;
const key=m=>m.q+","+m.r;
const plain=x=>!!x&&typeof x==="object"&&!Array.isArray(x);
const sameWorld=(a,b)=>!!a&&!!b&&
 ["version","seed","width","height","originQ","originR"].every(k=>a[k]===b[k]);
function create({plan,mountainPlan,natureCatalog,assets,loadImage,
 mountains=root.VedrasMountains}={}){
 if(plan?.schema!=="vedras-geography-bake-plan-v1"||
   plan.stage!=="plan-only"||plan.rasterized!==false||
   plan.readyForViewer!==false||!Array.isArray(plan.tiles)||
   plan.tiles.length!==plan.tileCount||
   !Number.isSafeInteger(plan.source?.cells)||
   mountainPlan?.schema!=="vedras-geography-scenery-source-v1"||
   mountainPlan.stage!=="original-mountain-placement-preflight"||
   mountainPlan.rasterized!==false||
   mountainPlan.complete!==false||mountainPlan.readyForViewer!==false||
   !Array.isArray(mountainPlan.instances)||
   mountainPlan.instances.length>MAX_MOUNTAINS||
   mountainPlan.worldHexes!==plan.source.cells||
   !sameWorld(mountainPlan.worldSource,plan.source)||
   mountainPlan.natureCatalogRevision!==(natureCatalog?.revision??null)||
   !plain(natureCatalog?.entries)||!Array.isArray(assets)||
   typeof loadImage!=="function"||
   typeof mountains?.visualOverlap!=="function"||
   typeof mountains?.screenBox!=="function"||
   typeof mountains?.overlaps!=="function"||
   typeof mountains?.influenceOverlaps!=="function"||
   typeof mountains?.sameChain!=="function"||
   typeof mountains?.occupied!=="function"||
   typeof mountains?.influence!=="function"||
   !Number.isFinite(mountains?.SPACING?.tight))
  throw Error("Berg-Silhouettenvorprüfung benötigt unveränderte Originalpläne und Bildkataloge.");
 const originals=new Map();
 for(const a of assets){
  if(a?.category!=="nature"||typeof a.path!=="string"||
   !/^assets\/nature\/[A-Za-z0-9_.-]+\.png$/.test(a.path)||
   a.relPath!==a.path.slice(7)||originals.has(a.path))continue;
  originals.set(a.path,a);
 }
 const entries=new Map();
 for(const m of mountainPlan.instances){
  const path=m?.assetPath,meta=natureCatalog.entries[path?.slice(7)];
  if(!originals.has(path)||meta?.kind!=="mountain"||
    meta.id!==m.assetId||m.width!==meta.logicalWidth||
    !Number.isSafeInteger(m.q)||!Number.isSafeInteger(m.r)||
    m.q<plan.source.originQ||
    m.q>=plan.source.originQ+plan.source.width||
    m.r<plan.source.originR||
    m.r>=plan.source.originR+plan.source.height||
    m.source!=="geography-scenery-preview"||
    !Number.isFinite(meta.logicalWidth)||meta.logicalWidth<=0||
    m.mode!=="chain"||typeof m.chainId!=="string"||
    !m.chainId.startsWith("geography_"))
   throw Error("Berginstanz verletzt ursprüngliche Quelle oder geografischen Anker.");
  entries.set(path,meta);
 }
 async function audit(){
  // Validate ALL physically referenced originals, before claiming any
  // source-envelope test. A hidden fallback image is not an original.
  const images=new Map(),info=new Map(),shapes=[];
  for(const [path,meta] of entries){
   const result=await loadImage(originals.get(path));
   const img=result?.img||result;
   if(!(img?.naturalWidth>0&&img?.naturalHeight>0))
    throw Error("Original-Berg-PNG fehlt oder nicht dekodiert: "+path);
   if(img.naturalWidth>16000||img.naturalHeight>16000)
    throw Error("Original-Berg-PNG hat unzulässige Bildabmessungen: "+path);
   images.set(path,img);
   // nature-ui.mountainGeometry() uses *uncropped* natural image aspect,
   // while object drawing later uses the alpha-cropped visible bounds.
   info.set(path,{width:meta.logicalWidth,
    aspect:img.naturalHeight/img.naturalWidth,
    anchorX:meta.anchor?.x??.5,anchorY:meta.anchor?.y??.67});
  }
  const seenCore=new Map(),seenInfluence=new Map(),
   buckets=new Map(),pairs=new Set(),issues=[];
  const counts={mountains:mountainPlan.instances.length,
   decodedOriginalPngs:images.size,
   testedSharedChainEnvelopes:0,sharedChainTooCrowded:0,
   coreOverlaps:0,interChainInfluenceConflicts:0,
   sharedChainEnvelopeOverlaps:0,nonChainEnvelopeOverlaps:0,
   candidateArtwork:0};
  const report=(kind,a,b,ratio=null)=>{
   if(issues.length<MAX_ISSUES)issues.push({
    kind,a:{q:a.q,r:a.r,assetPath:a.assetPath,chainId:a.chainId},
    b:{q:b.q,r:b.r,assetPath:b.assetPath,chainId:b.chainId},
    ...(ratio===null?{}:{envelopeOverlap:Math.round(ratio*10000)/10000})
   });
  };
  const register=(map,id,item,kind)=>{
   const prior=map.get(id);
   if(prior){
    const listed=Array.isArray(prior)?prior:[prior];
    for(const p of listed){
     const pair=[p.index,item.index].sort((a,b)=>a-b).join(",");
     if(kind==="core"&&!pairs.has("core:"+pair)){
      pairs.add("core:"+pair);counts.coreOverlaps++;report("core-overlap",p.m,item.m);
     }else if(kind==="influence"&&!pairs.has("influence:"+pair)&&
       !mountains.sameChain(p.m,item.m)){
      pairs.add("influence:"+pair);
      counts.interChainInfluenceConflicts++;
      report("inter-chain-influence",p.m,item.m);
     }
    }
   }
   if(!prior)map.set(id,[item]);
   else prior.push(item);
  };
  for(let index=0;index<mountainPlan.instances.length;index++){
   const m=mountainPlan.instances[index],geometry=info.get(m.assetPath);
   const rect=mountains.screenBox(m,geometry);
   if(![rect.x,rect.y,rect.w,rect.h].every(Number.isFinite)||
     rect.w<=0||rect.h<=0||rect.w>4096||rect.h>16000)
    throw Error("Original-Bergbild hat ein ungeeignetes Bildformat.");
   const item={index,m,geometry,rect};
   if(entries.get(m.assetPath).artStatus==="candidate")counts.candidateArtwork++;
   for(const k of mountains.occupied(m))register(seenCore,k,item,"core");
   for(const k of mountains.influence(m))register(seenInfluence,k,item,"influence");
   const x0=Math.floor(rect.x/BUCKET),x1=Math.floor((rect.x+rect.w)/BUCKET),
    y0=Math.floor(rect.y/BUCKET),y1=Math.floor((rect.y+rect.h)/BUCKET);
   if((x1-x0+1)*(y1-y0+1)>160)
    throw Error("Berg-Bildumschlag überschreitet den Vergleichsrahmen.");
   const neighboring=new Set();
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const found=buckets.get(x+","+y);
    if(found)for(const prev of found)neighboring.add(prev);
   }
   for(const older of neighboring){
    const old=older.rect,ix=Math.min(rect.x+rect.w,old.x+old.w)-Math.max(rect.x,old.x),
     iy=Math.min(rect.y+rect.h,old.y+old.h)-Math.max(rect.y,old.y);
    if(ix<=0||iy<=0)continue;
    const overlap=mountains.visualOverlap(older.m,m,older.geometry,geometry);
    if(!Number.isFinite(overlap)||overlap<0||overlap>1.000001)
     throw Error("Berg-Envelope-Überlappung nicht definiert.");
    if(mountains.sameChain(older.m,m)){
     counts.testedSharedChainEnvelopes++;
     counts.sharedChainEnvelopeOverlaps++;
     // Matches mountain.candidate(...,{spacing:'tight'}) exactly.
     if(overlap>mountains.SPACING.tight){
      counts.sharedChainTooCrowded++;
      report("chain-envelope-too-crowded",older.m,m,overlap);
     }
    }else counts.nonChainEnvelopeOverlaps++;
   }
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const k=x+","+y;
    if(!buckets.has(k))buckets.set(k,[]);
    buckets.get(k).push(item);
   }
  }
  return {schema:SCHEMA,stage:"original-mountain-editor-envelope-audit",
   worldSource:{...mountainPlan.worldSource},
   natureCatalogRevision:mountainPlan.natureCatalogRevision,
   statistics:counts,issues,issueLimit:MAX_ISSUES,
   usesEditorVisualOverlap:true,usesOriginalUncroppedPngAspect:true,
   actualAlphaOverlapMeasured:false,
   matchesOriginalCandidateSpacing:counts.sharedChainTooCrowded===0&&
    counts.coreOverlaps===0&&counts.interChainInfluenceConflicts===0,
   requiresVisualEditorImageParity:true,requiresShadowCasts:true,
   requiresOriginalPngSilhouetteTest:true,requiresFinal4x:true,
   rasterized:false,complete:false,readyForViewer:false};
 }
 return {audit,previewOnly:true};
}
const api={SCHEMA,MAX_MOUNTAINS,create};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapMountainEnvelopeAudit=api;
})(typeof window!=="undefined"?window:globalThis);

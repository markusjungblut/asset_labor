/* Phase 2.8c: real ORIGINAL tree PNGs on a transparent, world-aligned
 * 2.5x Scenery SAMPLE. No terrain, other Nature, shadows or final atlas.
 * Reuse the editor's visibleBounds, SpritePlanner.visualWidth,
 * NatureBalance.sizeFactor and Polish natureFilter/objectPerspective rules.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-tree-png-preview-v1";
const SIZE=512,PAD=128,SCALE=2.5,PROJECT_Y=.85,REACH=1024;
const MAX_INSTANCES=250000,MAX_NEAR=8000;
const pos=c=>({x:256*(c.q+c.r/2)+(c.dx||0),
 y:1.5*(256/Math.sqrt(3))*c.r+(c.dy||0)});
const bucket=(x,y)=>Math.floor(x/SIZE)+","+Math.floor(y/SIZE);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const validPath=path=>typeof path==="string"&&
 /^assets\/nature\/[\p{L}\p{N}_.-]+\.png$/iu.test(path)&&!path.includes("..");
function create({plan,treePlan,natureCatalog,assets,loadImage,
 canvasFactory=()=>root.document.createElement("canvas"),
 spritePlanner=root.VedrasSpritePlanner,balance=root.VedrasNatureBalance,
 polish=root.VedrasPolish,naturePolish=.40}={}){
 if(plan?.schema!=="vedras-geography-bake-plan-v1"||
  plan.stage!=="plan-only"||plan.readyForViewer!==false||
  plan.rasterized!==false||plan.grid?.tileSize!==SIZE||
  !Number.isSafeInteger(plan.source?.cells)||
  !Array.isArray(plan.tiles)||plan.tiles.length!==plan.tileCount||
  treePlan?.schema!=="vedras-geography-tree-trunk-plan-v1"||
  treePlan.stage!=="original-tree-trunks-read-only"||
  treePlan.rasterized!==false||treePlan.complete!==false||
  treePlan.readyForViewer!==false||
  !treePlan.requiresOriginalPngDecoding||!treePlan.requiresTreeShadows||
  treePlan.worldHexes!==plan.source.cells||
  treePlan.worldSource?.seed!==plan.source.seed||
  treePlan.worldSource?.version!==plan.source.version||
  treePlan.worldSource?.width!==plan.source.width||
  treePlan.worldSource?.height!==plan.source.height||
  treePlan.worldSource?.originQ!==plan.source.originQ||
  treePlan.worldSource?.originR!==plan.source.originR||
  treePlan.natureCatalogRevision!==(natureCatalog?.revision??null)||
  !Array.isArray(treePlan.instances)||treePlan.instances.length>MAX_INSTANCES||
  !natureCatalog?.entries||!Array.isArray(assets)||
  typeof loadImage!=="function"||typeof canvasFactory!=="function"||
  typeof spritePlanner?.visualWidth!=="function"||
  typeof balance?.sizeFactor!=="function"||
  typeof balance?.isCanopy!=="function"||
  typeof polish?.natureFilter!=="function"||
  !Number.isFinite(naturePolish)||naturePolish<0||naturePolish>1)
  throw Error("Original-Baum-PNG-Probe benötigt einen gültigen, unfertigen Baum-/Weltplan und Originalrenderer.");
 const tiles=new Map();
 for(const tile of plan.tiles){
  if(typeof tile?.id!=="string"||tile.size!==SIZE||
   !Number.isSafeInteger(tile.x)||!Number.isSafeInteger(tile.y)||
   tile.x%SIZE||tile.y%SIZE||
   tile.id!==(tile.x/SIZE)+","+(tile.y/SIZE)||tiles.has(tile.id))
   throw Error("Geografische WorldTile-Koordinaten sind ungültig.");
  tiles.set(tile.id,tile);
 }
 const originals=new Map();
 for(const a of assets){
  if(a?.category==="nature"&&validPath(a.path)&&
   a.relPath===a.path.slice(7)&&!originals.has(a.path))
   originals.set(a.path,a);
 }
 const byBucket=new Map(),records=[];
 const startQ=plan.source.originQ,startR=plan.source.originR;
 for(const inst of treePlan.instances){
  if(!validPath(inst?.assetPath)||!originals.has(inst.assetPath)||
   !Number.isSafeInteger(inst.q)||!Number.isSafeInteger(inst.r)||
   inst.q<startQ||inst.q>=startQ+plan.source.width||
   inst.r<startR||inst.r>=startR+plan.source.height||
   !Number.isFinite(inst.dx)||!Number.isFinite(inst.dy)||
   Math.abs(inst.dx)>160||Math.abs(inst.dy)>160||
   !Number.isFinite(inst.scale)||inst.scale<=0||inst.scale>5||
   inst.source!=="geography-original-tree-trunk-preview")
   throw Error("Baumposition ohne gültige physische Originalgrafik.");
  const m=natureCatalog.entries[inst.assetPath.slice(7)];
  if(!balance.isCanopy(m)||inst.assetId!==m.id||
   inst.scale<m.scaleMin-.002||inst.scale>m.scaleMax+.002)
   throw Error("Baumart, Baummaß oder Stammanker widerspricht dem Originalkatalog.");
  const p=pos(inst),record={inst,meta:m,p};
  records.push(record);
  const k=bucket(p.x,p.y);
  if(!byBucket.has(k))byBucket.set(k,[]);
  byBucket.get(k).push(record);
 }
 const boundsCache=new WeakMap();
 function crop(img){
  if(boundsCache.has(img))return boundsCache.get(img);
  const w=img?.naturalWidth,h=img?.naturalHeight;
  if(!(w>0&&h>0))throw Error("Original-Baum-PNG fehlt oder ist nicht dekodiert.");
  const ratio=Math.min(1,256/Math.max(w,h));
  const cw=Math.max(1,Math.round(w*ratio)),ch=Math.max(1,Math.round(h*ratio));
  const scratch=canvasFactory();scratch.width=cw;scratch.height=ch;
  const g=scratch.getContext("2d",{willReadFrequently:true});
  if(!g?.getImageData)throw Error("Originale Alpha-Silhouettenprüfung fehlt.");
  g.drawImage(img,0,0,cw,ch);
  const data=g.getImageData(0,0,cw,ch).data;
  let left=cw,top=ch,right=-1,bottom=-1;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){
   if(data[(y*cw+x)*4+3]<=12)continue;
   left=Math.min(left,x);right=Math.max(right,x);
   top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<0)throw Error("Original-Baum-PNG ist vollständig transparent.");
  const sx=Math.max(0,(left-.5)*w/cw);
  const sy=Math.max(0,(top-.5)*h/ch);
  const b={sx,sy,sw:Math.min(w-sx,(right-left+2)*w/cw),
   sh:Math.min(h-sy,(bottom-top+2)*h/ch)};
  boundsCache.set(img,b);return b;
 }
 function collect(tile){
  const minX=tile.x-PAD,maxX=tile.x+SIZE+PAD,
    minY=tile.y-PAD,maxY=tile.y+SIZE+PAD,near=[];
  for(let by=Math.floor((minY-REACH)/SIZE);by<=Math.floor((maxY+REACH)/SIZE);by++)
   for(let bx=Math.floor((minX-REACH)/SIZE);bx<=Math.floor((maxX+REACH)/SIZE);bx++){
    const found=byBucket.get(bx+","+by);
    if(found)for(const record of found)if(
     record.p.x>=minX-REACH&&record.p.x<=maxX+REACH&&
     record.p.y>=minY-REACH&&record.p.y<=maxY+REACH)near.push(record);
   }
  if(near.length>MAX_NEAR)
   throw Error("Zu viele Nature-Sprites im WorldTile-Halo.");
  // Match editor's ground-foot depth ordering, including stable tie-breakers.
  return near.sort((a,b)=>a.p.y-b.p.y||a.p.x-b.p.x||
   a.inst.assetPath.localeCompare(b.inst.assetPath,"en"));
 }
 function defaultTile(){
  for(const r of records){
   const id=bucket(r.p.x,r.p.y);
   if(tiles.has(id))return id;
  }
  return plan.tiles[0]?.id||null;
 }
 function geometry(r,img){
  const b=crop(img),meta=r.meta;
  const baseWidth=spritePlanner.visualWidth(meta,img,b);
  const width=baseWidth*r.inst.scale*balance.sizeFactor(meta);
  const height=width*b.sh/b.sw;
  if(!(width>0&&height>0&&width<=900&&height<=900))
   throw Error("Original-Baumgröße überschreitet den garantierten Pixel-Halo.");
  const anchor=meta.anchor||{x:.5,y:.96};
  const ax=clamp(Number(anchor.x??.5),0,1),ay=clamp(Number(anchor.y??.96),0,1);
  const left=r.p.x-width*ax,top=r.p.y-height*ay;
  // Perspective transform is about the base point; shear can move the crown
  // by at most 0.012*height plus 3.5% vertical compression.
  const box={left:left-20,right:left+width+20,
   top:Math.min(top,r.p.y)-20,bottom:Math.max(top+height,r.p.y)+20};
  return {b,width,height,ax,ay,left,top,box};
 }
 async function renderTile(id){
  const tile=tiles.get(id);
  if(!tile)throw Error("Unbekannte geografische WorldTile-ID.");
  const near=collect(tile);
  const decoded=new Map();
  // Fail CLOSED before first drawing command: no fake Nature colors.
  for(const r of near)if(!decoded.has(r.inst.assetPath)){
   const original=originals.get(r.inst.assetPath);
   const loaded=await loadImage(original);
   const img=loaded?.img||loaded;
   if(!(img?.naturalWidth>0&&img?.naturalHeight>0))
    throw Error("Original-Baum-PNG nicht dekodiert: "+r.inst.assetPath);
   crop(img);
   decoded.set(r.inst.assetPath,img);
  }
  const selected=[];
  for(const r of near){
   const img=decoded.get(r.inst.assetPath),g=geometry(r,img);
   if(g.box.left>tile.x+SIZE+PAD||g.box.right<tile.x-PAD||
      g.box.top>tile.y+SIZE+PAD||g.box.bottom<tile.y-PAD)continue;
   selected.push({r,img,g});
  }
  const canvas=canvasFactory();
  canvas.width=Math.round((SIZE+2*PAD)*SCALE);
  canvas.height=Math.round((SIZE+2*PAD)*SCALE*PROJECT_Y);
  const ctx=canvas.getContext("2d",{alpha:true});
  if(!ctx?.setTransform||!ctx?.drawImage||!ctx?.transform)
   throw Error("Transparenter Nature-Scenery-Canvas2D fehlt.");
  // 512*2.5 = 1280 and 512*2.5*.85 = 1088 are INTEGER pixel
  // shifts: adjacent tiles use exactly the same global sample lattice.
  ctx.setTransform(SCALE,0,0,SCALE*PROJECT_Y,
   -(tile.x-PAD)*SCALE,-(tile.y-PAD)*SCALE*PROJECT_Y);
  for(const {r,img,g} of selected){
   ctx.save();
   ctx.filter=polish.natureFilter(r.meta,naturePolish);
   ctx.globalAlpha=1;
   ctx.globalCompositeOperation="source-over";
   ctx.translate(r.p.x,r.p.y);
   ctx.transform(1,0,.012,.965,0,0);
   ctx.translate(-r.p.x,-r.p.y);
   ctx.drawImage(img,g.b.sx,g.b.sy,g.b.sw,g.b.sh,
    g.left,g.top,g.width,g.height);
   ctx.restore();
  }
  let png;
  if(typeof canvas.convertToBlob==="function")
   png=await canvas.convertToBlob({type:"image/png"});
  else if(typeof canvas.toBlob==="function")
   png=await new Promise((resolve,reject)=>canvas.toBlob(
    blob=>blob?resolve(blob):reject(Error("Baum-Scenery-PNG nicht kodierbar.")),
    "image/png"));
  else throw Error("Nature-Scenery-PNG-Kodierer fehlt.");
  if(!(png instanceof Blob)||png.type!=="image/png"||png.size===0)
   throw Error("Originalbaum-Scenery-PNG ist leer oder ungültig.");
  return {schema:SCHEMA,stage:"original-tree-scenery-png-preview",
   tile:{...tile},width:canvas.width,height:canvas.height,png,
   samplesPerWorldUnitX:SCALE,samplesPerWorldUnitY:SCALE*PROJECT_Y,
   nearby:near.length,drawn:selected.length,originalPngs:decoded.size,
   artStatuses:selected.reduce((a,x)=>{const k=x.r.meta.artStatus||"unknown";
    a[k]=(a[k]||0)+1;return a;},{}),
   requiresOriginalPixelSeamVerification:true,
   requiresEditorVisualParity:true,requiresCanopyCoverage:true,
   requiresShrubs:true,requiresBoulders:true,requiresShadows:true,
   requiresMountainsComposite:true,requiresFinal4x:true,
   transparent:true,rasterized:true,complete:false,readyForViewer:false};
 }
 return {defaultTile,renderTile,previewOnly:true};
}
const api={SCHEMA,SIZE,PAD,SCALE,PROJECT_Y,REACH,create};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapTreePNG=api;
})(typeof window!=="undefined"?window:globalThis);

/* Phase 2.8e: joint original tree + mountain transparent Scenery SAMPLE.
 * Both layers share one 2.5x world-aligned raster, original relief height,
 * mountain chain flattening and the editor's 64px base-occlusion test.
 * NO tree/shrub/rock shadows, finished 4x atlas or viewer publication.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-joint-scenery-preview-v1";
const SIZE=512,PAD=128,SCALE=2.5,PROJECT_Y=.85,REACH=1250;
const MAX_NEAR=8000,MAX_INSTANCES=250000;
const key=c=>c.q+","+c.r;
const pos=c=>({x:256*(c.q+c.r/2),y:1.5*(256/Math.sqrt(3))*c.r});
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const validPath=p=>typeof p==="string"&&
 /^assets\/nature\/[\p{L}\p{N}_.-]+\.png$/iu.test(p)&&!p.includes("..");
const sameSource=(a,b)=>!!a&&!!b&&
 ["version","seed","width","height","originQ","originR"].every(k=>a[k]===b[k]);
function create({world,plan,treePlan,mountainPlan,terrainCatalog,natureCatalog,
 assets,loadImage,canvasFactory=()=>root.document.createElement("canvas"),
 planner=root.VedrasLargeMapBakePlan,
 groundRelief=root.VedrasLargeMapBakeGroundRelief,
 relief=root.VedrasRelief,autotile=root.VedrasAutotile,
 mountains=root.VedrasMountains,
 spritePlanner=root.VedrasSpritePlanner,
 balance=root.VedrasNatureBalance,polish=root.VedrasPolish,
 naturePolish=.40}={}){
 if(!Array.isArray(world?.cells)||!Array.isArray(terrainCatalog?.terrainTypes)||
  typeof planner?.plan!=="function"||
  plan?.schema!=="vedras-geography-bake-plan-v1"||
  plan.stage!=="plan-only"||plan.readyForViewer!==false||
  plan.rasterized!==false||plan.grid?.tileSize!==SIZE||
  !Array.isArray(plan.tiles)||plan.tiles.length!==plan.tileCount||
  treePlan?.schema!=="vedras-geography-tree-trunk-plan-v1"||
  treePlan.complete!==false||treePlan.readyForViewer!==false||
  treePlan.rasterized!==false||!treePlan.requiresTreeShadows||
  mountainPlan?.schema!=="vedras-geography-scenery-source-v1"||
  mountainPlan.complete!==false||mountainPlan.readyForViewer!==false||
  mountainPlan.rasterized!==false||
  !Array.isArray(treePlan.instances)||!Array.isArray(mountainPlan.instances)||
  treePlan.instances.length+mountainPlan.instances.length>MAX_INSTANCES||
  treePlan.worldHexes!==plan.source?.cells||
  mountainPlan.worldHexes!==plan.source?.cells||
  !sameSource(treePlan.worldSource,plan.source)||
  !sameSource(mountainPlan.worldSource,plan.source)||
  treePlan.seed!==mountainPlan.seed||
  treePlan.natureCatalogRevision!==(natureCatalog?.revision??null)||
  mountainPlan.natureCatalogRevision!==(natureCatalog?.revision??null)||
  !Array.isArray(assets)||typeof loadImage!=="function"||
  typeof canvasFactory!=="function"||
  typeof groundRelief?.createOptions!=="function"||
  typeof relief?.at!=="function"||typeof relief?.rawAt!=="function"||
  typeof autotile?.hexAt!=="function"||
  typeof mountains?.chainGroups!=="function"||
  typeof spritePlanner?.visualWidth!=="function"||
  typeof balance?.sizeFactor!=="function"||
  typeof balance?.isCanopy!=="function"||
  typeof polish?.natureFilter!=="function"||
  !Number.isFinite(naturePolish)||naturePolish<0||naturePolish>1)
  throw Error("Gemeinsame Scenery benötigt vollständige Originalpläne, Kataloge und Reliefregeln.");
 // Do not let the caller substitute a source world from another generation.
 const expected=planner.plan(world);
 if(expected.source.fingerprint!==plan.source.fingerprint||
    expected.tileCount!==plan.tileCount||
    expected.tiles.some((t,i)=>t.id!==plan.tiles[i]?.id))
  throw Error("Geografiewelt und WorldTile-Plan haben verschiedene Revisionen.");
 const byTile=new Map(plan.tiles.map(t=>[t.id,t]));
 const originals=new Map();
 for(const a of assets)if(a?.category==="nature"&&validPath(a.path)&&
  a.relPath===a.path.slice(7)&&!originals.has(a.path))originals.set(a.path,a);
 const members=[],buckets=new Map();
 function register(inst,type){
  if(!Number.isSafeInteger(inst.q)||!Number.isSafeInteger(inst.r)||
   inst.q<world.originQ||inst.q>=world.originQ+world.width||
   inst.r<world.originR||inst.r>=world.originR+world.height||
   !validPath(inst.assetPath)||!originals.has(inst.assetPath))
   throw Error("Scenery-Instanz ohne gültige physische Originalgrafik.");
  const meta=natureCatalog.entries[inst.assetPath.slice(7)];
  if(!meta||meta.id!==inst.assetId||
    (type==="tree"?!balance.isCanopy(meta):meta.kind!=="mountain"))
   throw Error("Scenery-Asset widerspricht dem Original-Naturekatalog.");
  const p=pos(inst);
  if(type==="tree"){
   if(!Number.isFinite(inst.dx)||!Number.isFinite(inst.dy)||
     Math.abs(inst.dx)>160||Math.abs(inst.dy)>160||
     !Number.isFinite(inst.scale)||inst.scale<=0||
     inst.scale<meta.scaleMin-.002||inst.scale>meta.scaleMax+.002||
     inst.source!=="geography-original-tree-trunk-preview")
    throw Error("Originalbaum-Stammanker oder Skalierung ungültig.");
   p.x+=inst.dx;p.y+=inst.dy;
  }else if(!Number.isFinite(inst.width)||inst.width<=0||
   Math.abs(inst.width-meta.logicalWidth)>.001||
   inst.source!=="geography-scenery-preview")
   throw Error("Bergbreite oder Berg-Originalquelle ungültig.");
  else p.y+=20;
  const item={inst,type,meta,p,ordinal:members.length};
  members.push(item);
  const b=Math.floor(p.x/SIZE)+","+Math.floor(p.y/SIZE);
  if(!buckets.has(b))buckets.set(b,[]);
  buckets.get(b).push(item);
 }
 for(const m of mountainPlan.instances)register(m,"mountain");
 for(const t of treePlan.instances)register(t,"tree");
 // Exactly the same continuous geography relief source as the native ground
 // adapter, but with the editor's additional flattened mountain chain pads.
 // Full world cells are used to make relief independent of the requested tile.
 const base=groundRelief.createOptions({
  cells:world.cells,tile:plan.tiles[0],source:plan.source,
  sourceHalo:1280},terrainCatalog.terrainTypes,{relief,autotile}).options;
 if(!base||base.enabled!==true||base.mode!=="geography")
  throw Error("Aktives geografisches Originalrelief fehlt.");
 const pads=[...(base.pads||[])];
 const groups=mountains.chainGroups(mountainPlan.instances);
 for(const group of groups.values()){
  const active=group.filter(m=>
   natureCatalog.entries[m.assetPath.slice(7)]?.mountain?.flatten!==false);
  if(!active.length)continue;
  const avg=active.reduce((sum,m)=>{
   const p=pos(m);return sum+relief.rawAt(p.x,p.y+20,base);
  },0)/active.length;
  if(!Number.isFinite(avg))throw Error("Bergketten-Fundamenthöhe ungültig.");
  for(const m of active){
   const p=pos(m),core=m.coreRadius===1;
   pads.push({x:p.x,y:p.y+20,radius:core?124:70,
    transition:core?76:60,height:avg});
  }
 }
 // Relief.at() validates with a 60-pad limit in the native renderer.\n // Select pads for each global sprite foot, NOT by tile, so cross-seam\n // sampling and distant mountain flattening remain consistent.\n const footHeight=item=>{\n  const local=pads.filter(p=>Math.hypot(p.x-item.p.x,p.y-item.p.y)<p.radius+p.transition);\n  if(local.length>60)throw Error("Mehr als 60 Bergfundamente überlagern einen Spritefuß.");\n  return relief.at(item.p.x,item.p.y,{...base,pads:local});\n };
 const boundsCache=new WeakMap(),alphaCache=new WeakMap();
 function crop(img){
  if(boundsCache.has(img))return boundsCache.get(img);
  const w=img?.naturalWidth,h=img?.naturalHeight;
  if(!(w>0&&h>0))throw Error("Original-Scenery-PNG nicht dekodiert.");
  const scale=Math.min(1,256/Math.max(w,h));
  const cw=Math.max(1,Math.round(w*scale)),ch=Math.max(1,Math.round(h*scale));
  const cv=canvasFactory();cv.width=cw;cv.height=ch;
  const ctx=cv.getContext("2d",{willReadFrequently:true});
  if(!ctx?.drawImage||!ctx?.getImageData)
   throw Error("Originale Alpha-Silhouette kann nicht geprüft werden.");
  ctx.drawImage(img,0,0,cw,ch);
  const data=ctx.getImageData(0,0,cw,ch).data;
  let x0=cw,y0=ch,x1=-1,y1=-1;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)
   if(data[(y*cw+x)*4+3]>12){
    x0=Math.min(x0,x);y0=Math.min(y0,y);
    x1=Math.max(x1,x);y1=Math.max(y1,y);
   }
  if(x1<0)throw Error("Original-Scenery-PNG vollständig transparent.");
  const sx=Math.max(0,(x0-.5)*w/cw),sy=Math.max(0,(y0-.5)*h/ch);
  const b={sx,sy,sw:Math.min(w-sx,(x1-x0+2)*w/cw),
   sh:Math.min(h-sy,(y1-y0+2)*h/ch)};
  boundsCache.set(img,b);return b;
 }
 function mountainAlpha(img,bounds){
  if(alphaCache.has(img))return alphaCache.get(img);
  const cv=canvasFactory();cv.width=64;cv.height=64;
  const c=cv.getContext("2d",{willReadFrequently:true});
  if(!c?.getImageData)throw Error("Berg-Verdeckungs-Alphamaskenprüfung fehlt.");
  c.drawImage(img,bounds.sx,bounds.sy,bounds.sw,bounds.sh,0,0,64,64);
  const data=c.getImageData(0,0,64,64).data;
  alphaCache.set(img,data);return data;
 }
 function candidates(tile){
  const margin=PAD+REACH,items=[];
  const x0=Math.floor((tile.x-margin)/SIZE),x1=Math.floor((tile.x+SIZE+margin)/SIZE);
  const y0=Math.floor((tile.y-margin)/SIZE),y1=Math.floor((tile.y+SIZE+margin)/SIZE);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const arr=buckets.get(x+","+y);
   if(arr)for(const item of arr)if(
    Math.abs(item.p.x-(tile.x+SIZE/2))<=SIZE/2+margin&&
    Math.abs(item.p.y-(tile.y+SIZE/2))<=SIZE/2+margin)
    items.push(item);
  }
  if(items.length>MAX_NEAR)throw Error("Zu viele Original-Sprites im Kachel-Halo.");
  return items;
 }
 function geometry(item,img){
  const b=crop(img);
  const width=item.type==="mountain"?item.inst.width:
   spritePlanner.visualWidth(item.meta,img,b)*
   item.inst.scale*balance.sizeFactor(item.meta);
  const height=width*b.sh/b.sw;
  if(!(width>0&&height>0&&width<=950&&height<=950))
   throw Error("Original-Sprite überschreitet den sicheren Scenery-Halo.");
  const a=item.meta.anchor||{x:.5,y:item.type==="tree"?.96:.67};
  const ax=clamp(Number(a.x??.5),0,1),ay=clamp(Number(a.y??.67),0,1);
  const y=item.p.y-footHeight(item);
  if(!Number.isFinite(y))throw Error("Geografische Sprite-Reliefhöhe ungültig.");
  const left=item.p.x-width*ax,top=y-height*ay;
  return {b,width,height,ax,ay,left,top,y,
   box:{left:left-26,right:left+width+26,
    top:top-30,bottom:Math.max(top+height,y)+30}};
 }
 function occludes(tree,mountain){
  // Match app.js mountainCoversBase: the screen coordinates are projected
  // by PROJECT_Y, whereas sprite height uses the unprojected width.
  const mx=mountain.item.p.x,my=mountain.g.y,
   tx=tree.item.p.x,ty=tree.g.y,
   g=mountain.g;
  const u=(tx-(mx-g.width*g.ax))/g.width;
  const v=(PROJECT_Y*(ty-my)+g.height*g.ay)/g.height;
  if(u<0||u>=1||v<0||v>=1)return false;
  const data=mountainAlpha(mountain.img,g.b);
  return data[(Math.min(63,Math.floor(v*64))*64+
    Math.min(63,Math.floor(u*64)))*4+3]>50;
 }
 function defaultTile(){
  // Choose a mountainous spot with nearby original-tree anchors when possible.
  for(const m of members)if(m.type==="mountain"){
   const id=Math.floor(m.p.x/SIZE)+","+Math.floor(m.p.y/SIZE);
   if(byTile.has(id)&&candidates(byTile.get(id)).some(x=>x.type==="tree"))return id;
  }
  for(const m of members){
   const id=Math.floor(m.p.x/SIZE)+","+Math.floor(m.p.y/SIZE);
   if(byTile.has(id))return id;
  }
  return plan.tiles[0]?.id||null;
 }
 async function renderTile(id){
  const tile=byTile.get(id);
  if(!tile)throw Error("Unbekanntes geografisches WorldTile.");
  const near=candidates(tile),images=new Map(),placed=[];
  // Decode, alpha-validate and size-check BEFORE any output Canvas2D draw.
  for(const item of near){
   let img=images.get(item.inst.assetPath);
   if(!img){
    const a=originals.get(item.inst.assetPath),loaded=await loadImage(a);
    img=loaded?.img||loaded;
    if(!(img?.naturalWidth>0&&img?.naturalHeight>0))
     throw Error("Originalgrafik nicht dekodiert: "+item.inst.assetPath);
    crop(img);images.set(item.inst.assetPath,img);
   }
   const g=geometry(item,img);
   if(g.box.right<tile.x-PAD||g.box.left>tile.x+SIZE+PAD||
      g.box.bottom<tile.y-PAD||g.box.top>tile.y+SIZE+PAD)continue;
   placed.push({item,img,g,coveredByMountains:new Set()});
  }
  const mount=placed.filter(x=>x.item.type==="mountain"),
   trees=placed.filter(x=>x.item.type==="tree");
  let occluded=0;
  for(const tree of trees)for(const m of mount)if(occludes(tree,m)){
   tree.coveredByMountains.add(m);
   occluded++;
  }
  const sorted=placed.slice().sort((a,b)=>{
   if(a.item.type==="mountain"&&b.coveredByMountains.has(a))return 1;
   if(b.item.type==="mountain"&&a.coveredByMountains.has(b))return -1;
   return a.g.y-b.g.y||a.item.p.x-b.item.p.x||
    a.item.ordinal-b.item.ordinal;
  });
  const output=canvasFactory();
  output.width=Math.round((SIZE+2*PAD)*SCALE);
  output.height=Math.round((SIZE+2*PAD)*SCALE*PROJECT_Y);
  const ctx=output.getContext("2d",{alpha:true});
  if(!ctx?.setTransform||!ctx?.drawImage||!ctx?.transform)
   throw Error("Gemeinsame transparente Scenery-Canvas2D fehlt.");
  ctx.setTransform(SCALE,0,0,SCALE*PROJECT_Y,
   -(tile.x-PAD)*SCALE,-(tile.y-PAD)*SCALE*PROJECT_Y);
  for(const obj of sorted){
   const {item,img,g}=obj;
   ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";
   ctx.filter=polish.natureFilter(item.meta,naturePolish);
   ctx.translate(item.p.x,g.y);
   ctx.transform(1,0,.012,.965,0,0);
   ctx.translate(-item.p.x,-g.y);
   ctx.drawImage(img,g.b.sx,g.b.sy,g.b.sw,g.b.sh,
    g.left,g.top,g.width,g.height);
   ctx.restore();
  }
  let png;
  if(typeof output.convertToBlob==="function")
   png=await output.convertToBlob({type:"image/png"});
  else if(typeof output.toBlob==="function")
   png=await new Promise((resolve,reject)=>output.toBlob(
    blob=>blob?resolve(blob):reject(Error("Scenery-PNG nicht kodierbar.")),
    "image/png"));
  else throw Error("Scenery-PNG-Kodierer fehlt.");
  if(!(png instanceof Blob)||png.type!=="image/png"||!png.size)
   throw Error("Transparente Scenery-PNG leer oder nicht kodiert.");
  return {schema:SCHEMA,stage:"original-tree-mountain-combined-preview",
   tile:{...tile},png,width:output.width,height:output.height,
   drawnTrees:trees.length,drawnMountains:mount.length,
   testedTreeMountainOcclusions:trees.length*mount.length,
   occludedTreeMountainPairs:occluded,
   originalPngs:images.size,mountainFlattenPads:pads.length,
   reliefMode:base.mode,sourceFingerprint:plan.source.fingerprint,
   samplesPerWorldUnitX:SCALE,samplesPerWorldUnitY:SCALE*PROJECT_Y,
   needsFullEditorImageParity:true,needsPhysicalMountainOverlapAudit:true,
   needsFullNaturePopulation:true,needsPriorBoulderPass:true,
   needsShrubsAndSnow:true,needsGroundAndSpriteShadows:true,
   needsFinal4x:true,transparent:true,rasterized:true,
   complete:false,readyForViewer:false};
 }
 return {defaultTile,renderTile,previewOnly:true};
}
const api={SCHEMA,SIZE,PAD,SCALE,PROJECT_Y,REACH,create};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapJointScenery=api;
})(typeof window!=="undefined"?window:globalThis);

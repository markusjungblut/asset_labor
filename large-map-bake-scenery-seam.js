/* Phase 2.8e quality gate: compare ACTUAL rendered RGBA of adjacent
 * transparent joint tree/mountain WorldTiles, including their overlap.
 * A seam proof is neither a completed Scenery bake nor an editor parity test.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-joint-scenery-seam-proof-v1";
const SIZE=512,SCALE_X=2.5,SCALE_Y=2.125,PAD=128;
const EXPECTED_WIDTH=Math.round((SIZE+2*PAD)*SCALE_X);
const EXPECTED_HEIGHT=Math.round((SIZE+2*PAD)*SCALE_Y);
function create({plan,renderer,allowShadowPreview=false,allowMountainShadowPreview=false,
 bitmapFactory=root.createImageBitmap?.bind(root),
 canvasFactory=()=>root.document.createElement("canvas")}={}){
 if(plan?.schema!=="vedras-geography-bake-plan-v1"||
  plan.stage!=="plan-only"||plan.rasterized!==false||
  plan.readyForViewer!==false||plan.grid?.tileSize!==SIZE||
  !Array.isArray(plan.tiles)||plan.tiles.length!==plan.tileCount||
  !plan.source?.fingerprint||typeof renderer?.renderTile!=="function"||
  renderer.previewOnly!==true||typeof bitmapFactory!=="function"||
  typeof canvasFactory!=="function"||
  (allowMountainShadowPreview&&!allowShadowPreview))
  throw Error("Pixelnahtprüfung benötigt den ungeänderten Weltplan und Original-Scenery-Testbilder.");
 const tiles=new Map();
 for(const tile of plan.tiles){
  if(!Number.isSafeInteger(tile?.x)||!Number.isSafeInteger(tile?.y)||
   tile.x%SIZE!==0||tile.y%SIZE!==0||tile.size!==SIZE||
   tile.id!==(tile.x/SIZE)+","+(tile.y/SIZE)||tiles.has(tile.id))
   throw Error("Pixelnahtprüfung: ungültige WorldTile-Position.");
  tiles.set(tile.id,tile);
 }
 const neighbor=(tile,dir)=>dir==="right"?
  (tile.x+SIZE)/SIZE+","+(tile.y/SIZE):
  dir==="down"?(tile.x/SIZE)+","+(tile.y+SIZE)/SIZE:null;
 function defaultPair(){
  const start=renderer.defaultTile?.();
  const t=tiles.get(start);
  if(t){
   for(const dir of ["right","down"]){
    const adjacent=neighbor(t,dir);
    if(tiles.has(adjacent))return {id:t.id,neighborId:adjacent,direction:dir};
   }
   for(const dir of ["right","down"]){
    const first=dir==="right"?
     (t.x-SIZE)/SIZE+","+(t.y/SIZE):
     (t.x/SIZE)+","+(t.y-SIZE)/SIZE;
    if(tiles.has(first))return {id:first,neighborId:t.id,direction:dir};
   }
  }
  for(const t of plan.tiles)for(const dir of ["right","down"]){
   const adjacent=neighbor(t,dir);
   if(tiles.has(adjacent))return {id:t.id,neighborId:adjacent,direction:dir};
  }
  return null;
 }
 function validateResult(result,id){
  if(result?.schema!=="vedras-geography-joint-scenery-preview-v1"||
   result.stage!==(allowMountainShadowPreview?
    "original-mountain-sprite-shadow-scenery-preview":
    allowShadowPreview?"original-sprite-shadow-scenery-preview":
    "original-tree-mountain-combined-preview")||
   (allowShadowPreview&&!(result.originalShadowProfiles>0))||
   (allowMountainShadowPreview&&(
    result.needsOriginalMountainShadows!==false||
    !(result.drawnOriginalMountainShadows>0)||
    result.needsMountainShadowScenePresetParity!==true))||
   (allowShadowPreview&&!allowMountainShadowPreview&&
    !result.needsOriginalMountainShadows)||
   result.tile?.id!==id||
   result.tile.x!==tiles.get(id).x||
   result.tile.y!==tiles.get(id).y||
   result.width!==EXPECTED_WIDTH||result.height!==EXPECTED_HEIGHT||
   result.samplesPerWorldUnitX!==SCALE_X||
   result.samplesPerWorldUnitY!==SCALE_Y||
   result.sourceFingerprint!==plan.source.fingerprint||
   result.rasterized!==true||result.transparent!==true||
   result.complete!==false||result.readyForViewer!==false||
   !(result.png instanceof Blob)||result.png.type!=="image/png"||
   !result.png.size)
   throw Error("Nicht verifizierbare Original-Scenery-PNG oder falsche Quellrevision: "+
    JSON.stringify({id,stage:result?.stage,
     expected:allowMountainShadowPreview?"original-mountain-sprite-shadow-scenery-preview":
      allowShadowPreview?"original-sprite-shadow-scenery-preview":
      "original-tree-mountain-combined-preview",
     mountainShadows:result?.drawnOriginalMountainShadows,
     mountainShadowPixels:result?.originalMountainShadowPositivePixels,
     needsMountain:result?.needsOriginalMountainShadows,
     presetParity:result?.needsMountainShadowScenePresetParity,
     profiles:result?.originalShadowProfiles,
     tile:result?.tile?.id,width:result?.width,height:result?.height,
     source:result?.sourceFingerprint,expectedSource:plan.source.fingerprint}));
 }
 async function getPixels(png,x,y,width,height){
  const bitmap=await bitmapFactory(png);
  try{
   if(bitmap?.width!==EXPECTED_WIDTH||bitmap?.height!==EXPECTED_HEIGHT)
    throw Error("Dekodiertes Original-Scenery-Bild hat eine andere Pixelgröße.");
   const c=canvasFactory();c.width=EXPECTED_WIDTH;c.height=EXPECTED_HEIGHT;
   const ctx=c.getContext("2d",{willReadFrequently:true});
   if(!ctx?.drawImage||!ctx?.getImageData)
    throw Error("Echte Canvas2D-RGBA-Prüfung nicht verfügbar.");
   ctx.drawImage(bitmap,0,0);
   const rgba=ctx.getImageData(x,y,width,height).data;
   if(rgba?.length!==width*height*4)
    throw Error("Pixelnahtprüfung erhielt eine unvollständige RGBA-Maske.");
   return rgba;
  }finally{bitmap?.close?.();}
 }
 async function verifyPair(id,direction="right"){
  const tile=tiles.get(id);
  if(!tile||!["right","down"].includes(direction))
   throw Error("Pixelnahtprüfung benötigt ein gültiges Start-WorldTile und right/down.");
  const adjacent=neighbor(tile,direction);
  if(!tiles.has(adjacent))
   throw Error("Pixelnahtprüfung: benachbarte WorldTile-Kachel fehlt.");
  const a=await renderer.renderTile(id),b=await renderer.renderTile(adjacent);
  validateResult(a,id);validateResult(b,adjacent);
  const shift=direction==="right"?SIZE*SCALE_X:SIZE*SCALE_Y;
  if(!Number.isInteger(shift))
   throw Error("Pixelnahtprüfung: keine globale ganzzahlige Pixelverschiebung.");
  const w=direction==="right"?EXPECTED_WIDTH-shift:EXPECTED_WIDTH;
  const h=direction==="down"?EXPECTED_HEIGHT-shift:EXPECTED_HEIGHT;
  const ax=direction==="right"?shift:0,ay=direction==="down"?shift:0;
  const [left,right]=await Promise.all([
   getPixels(a.png,ax,ay,w,h),
   getPixels(b.png,0,0,w,h)
  ]);
  let painted=0,transparent=0,differing=0,maxDelta=0;
  const examples=[];
  for(let p=0;p<w*h;p++){
   const i=p*4,one=left[i+3],two=right[i+3];
   if(one||two)painted++;else transparent++;
   let changed=false;
   for(let ch=0;ch<4;ch++){
    const delta=Math.abs(left[i+ch]-right[i+ch]);
    if(delta){changed=true;maxDelta=Math.max(maxDelta,delta);}
   }
   if(changed){
    differing++;
    if(examples.length<8)examples.push({x:p%w,y:Math.floor(p/w),
     a:[...left.slice(i,i+4)],b:[...right.slice(i,i+4)]});
   }
  }
  return {schema:SCHEMA,stage:"joint-original-png-pixel-seam-proof",
   tileId:id,neighborTileId:adjacent,direction,
   overlapWidth:w,overlapHeight:h,
   testedPixels:w*h,paintedPixels:painted,transparentPixels:transparent,
   differingPixels:differing,maxChannelDifference:maxDelta,
   firstDifferences:examples,passesPixelIdentity:differing===0&&painted>0,
   needsEditorVisualParity:true,needsOriginalShadows:true,
   shadowMode:allowMountainShadowPreview?"original-mountain-and-sprite-preview":
    allowShadowPreview?"original-sprite-preview":"none",
   needsOriginalMountainShadows:true,
   complete:false,readyForViewer:false,rasterized:false};
 }
 return {defaultPair,verifyPair,previewOnly:true};
}
const api={SCHEMA,SIZE,SCALE_X,SCALE_Y,PAD,create};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasJointScenerySeam=api;
})(typeof window!=="undefined"?window:globalThis);

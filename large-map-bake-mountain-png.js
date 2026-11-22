
/* Phase 2.7b: original Nature mountain PNGs in a transparent, tile-local
 * Scenery test layer. NOT full Scenery: no trees, ground casts or verified
 * mountain-to-mountain silhouette collisions. The existing editor remains
 * the reference; no archived game map can use this preview as completed.
 */
(function(root){
"use strict";
const SCALE=1.9,PROJECT_Y=.85,SIZE=512,PAD=128;
const worldPos=c=>({x:256*(c.q+c.r/2),y:1.5*(256/Math.sqrt(3))*c.r});
function create({plan,sceneryPlan,assets,loadImage,
 canvasFactory=()=>root.document.createElement("canvas")}={}){
 if(!Array.isArray(plan?.tiles)||!Array.isArray(sceneryPlan?.instances)||
    sceneryPlan.readyForViewer!==false||sceneryPlan.rasterized!==false||
    !Array.isArray(assets)||typeof loadImage!=="function"||
    typeof canvasFactory!=="function")
  throw Error("Berg-Scenery benötigt einen ungeprüften Original-Placementplan.");
 const tiles=new Map(plan.tiles.map(t=>[t.id,t]));
 const assetByPath=new Map(assets.filter(a=>a.category==="nature")
  .map(a=>[a.path,a]));
 const cache=new WeakMap();
 function bounds(img){
  if(cache.has(img))return cache.get(img);
  const width=img?.naturalWidth,height=img?.naturalHeight;
  if(!(width>0&&height>0))throw Error("Original-Berg-PNG fehlt.");
  // Exact same alpha-crop outline and threshold as app.js visibleBounds.
  const ratio=Math.min(1,256/Math.max(width,height));
  const cw=Math.max(1,Math.round(width*ratio));
  const ch=Math.max(1,Math.round(height*ratio));
  const temp=canvasFactory();
  temp.width=cw;temp.height=ch;
  const g=temp.getContext("2d",{willReadFrequently:true});
  if(!g?.getImageData)throw Error("Alphamaskenprüfung fehlt.");
  g.drawImage(img,0,0,cw,ch);
  const data=g.getImageData(0,0,cw,ch).data;
  let x0=cw,y0=ch,x1=-1,y1=-1;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){
   if(data[(y*cw+x)*4+3]<=12)continue;
   x0=Math.min(x0,x);x1=Math.max(x1,x);
   y0=Math.min(y0,y);y1=Math.max(y1,y);
  }
  if(x1<0)throw Error("Berg-PNG vollständig transparent.");
  const sx=Math.max(0,(x0-.5)*width/cw);
  const sy=Math.max(0,(y0-.5)*height/ch);
  const b={sx,sy,sw:Math.min(width-sx,(x1-x0+2)*width/cw),
   sh:Math.min(height-sy,(y1-y0+2)*height/ch)};
  cache.set(img,b);return b;
 }
 function defaultTile(){
  for(const m of sceneryPlan.instances){
   const p=worldPos(m);
   const id=Math.floor(p.x/SIZE)+","+Math.floor((p.y+20)/SIZE);
   if(tiles.has(id))return id;
  }
  return plan.tiles[0]?.id||null;
 }
 async function renderTile(id){
  const tile=tiles.get(id);
  if(!tile)throw Error("Unbekannte 512er-Weltkachel.");
  // Conservative overhang; source sprites are anchored by original absolute
  // geography coordinates, NOT recentered to the local editor viewport.
  const near=sceneryPlan.instances.filter(m=>{
   const p=worldPos(m);
   return p.x>=tile.x-PAD-1100&&p.x<=tile.x+SIZE+PAD+1100&&
    p.y>=tile.y-PAD-1100&&p.y<=tile.y+SIZE+PAD+1100;
  });
  const imgByPath=new Map();
  for(const path of new Set(near.map(m=>m.assetPath))){
   const asset=assetByPath.get(path);
   if(!asset)throw Error("Original-Berg-PNG fehlt in /api/assets: "+path);
   const loaded=await loadImage(asset);
   const img=loaded?.img||loaded;
   if(!(img?.naturalWidth>0&&img?.naturalHeight>0))
    throw Error("Original-Berggrafik nicht dekodiert: "+path);
   imgByPath.set(path,img);
  }
  const output=canvasFactory();
  output.width=Math.round((SIZE+2*PAD)*SCALE);
  output.height=Math.round((SIZE+2*PAD)*SCALE*PROJECT_Y);
  const ctx=output.getContext("2d",{alpha:true});
  if(!ctx?.setTransform)throw Error("Scenery-Canvas2D fehlt.");
  ctx.setTransform(SCALE,0,0,SCALE*PROJECT_Y,
   -(tile.x-PAD)*SCALE,-(tile.y-PAD)*SCALE*PROJECT_Y);
  let drawn=0;
  const sorted=[...near].sort((a,b)=>{
   const p=worldPos(a),q=worldPos(b);
   return p.y-q.y||p.x-q.x;
  });
  for(const m of sorted){
   const img=imgByPath.get(m.assetPath),b=bounds(img);
   const p=worldPos(m),foot={x:p.x,y:p.y+20};
   const width=m.width,height=width*b.sh/b.sw;
   const ax=Math.min(1,Math.max(0,Number(m.anchor?.x??.5)));
   const ay=Math.min(1,Math.max(0,Number(m.anchor?.y??.67)));
   const left=foot.x-width*ax,top=foot.y-height*ay;
   if(left>tile.x+SIZE+PAD||left+width<tile.x-PAD||
      top>tile.y+SIZE+PAD||top+height<tile.y-PAD)continue;
   // The same display-only 2.5D sprite perspective as in app.js.
   ctx.save();
   ctx.translate(foot.x,foot.y);
   ctx.transform(1,0,.012,.965,0,0);
   ctx.translate(-foot.x,-foot.y);
   ctx.drawImage(img,b.sx,b.sy,b.sw,b.sh,left,top,width,height);
   ctx.restore();
   drawn++;
  }
  let png;
  if(typeof output.convertToBlob==="function")
   png=await output.convertToBlob({type:"image/png"});
  else if(typeof output.toBlob==="function")
   png=await new Promise((resolve,reject)=>output.toBlob(
    blob=>blob?resolve(blob):reject(Error("Original-Scenery-PNG nicht kodierbar.")),
    "image/png"));
  else throw Error("PNG-Kodierer fehlt.");
  if(!(png instanceof Blob)||png.size===0)
   throw Error("Berg-PNG ist leer.");
  return {stage:"original-mountain-scenery-preview",
   tile:{...tile},width:output.width,height:output.height,png,
   nearby:near.length,drawn,originalPngs:imgByPath.size,
   needsVisualOverlapCheck:true,needsShadows:true,
   omitted:["nature-trees","shrubs","snow","shadow-casts",
    "mountain-ground-pads","4x-scenery"],
   complete:false,readyForViewer:false,rasterized:true};
 }
 return {defaultTile,renderTile,previewOnly:true};
}
const api={SCALE,PROJECT_Y,PAD,create};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapMountainPNG=api;
})(typeof window!=="undefined"?window:globalThis);

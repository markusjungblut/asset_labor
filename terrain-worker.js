/* Vedras terrain worker v0.11.8.
 * OffscreenCanvas performs pixel compositing, alpha water/land split and
 * optional relief away from the DOM thread; only ImageBitmaps are sent back.
 * No scene state is read from the main browser window.
 */
'use strict';
self.window=self;
self.document={createElement:tag=>{
 if(tag!=='canvas')throw Error('Only offscreen canvases are supported');
 return new OffscreenCanvas(1,1);
}};
importScripts('water-texture.js?v=0.1.0','autotile.js?v=0.31.0','polish.js?v=0.21.0','relief.js?v=0.11.0','shoreline.js?v=0.30.1&artfix=20261027');
const terrain=new Map();
const HEX=256,R=HEX/Math.sqrt(3);
const key=(q,r)=>q+','+r;
const pos=(q,r)=>({x:HEX*(q+r/2),y:1.5*R*r});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function coastMask(maskCells){
 const cells=new Map((maskCells||[]).map(c=>[key(c.q,c.r),c]));
 const steps=self.VedrasAutotile.DIRS;
 return (x,y)=>{
  const id=self.VedrasAutotile.hexAt(x,y),here=cells.get(id);
  if(!here||here.wet)return 0;
  const p=pos(here.q,here.r);let fade=1;
  for(const [dq,dr] of steps){
   const n=cells.get(key(here.q+dq,here.r+dr));
   if(!n?.wet)continue;
   const q=pos(n.q,n.r),dx=p.x-q.x,dy=p.y-q.y;
   const distance=((x-(p.x+q.x)/2)*dx+(y-(p.y+q.y)/2)*dy)/Math.hypot(dx,dy);
   const t=clamp(distance/65,0,1);fade=Math.min(fade,t*t*(3-2*t));
  }
  return fade;
 };
}
function surface(bitmap,raster){
 if(!bitmap||!raster)return null;
 const {x,y,width,height,density}=raster;
 return {canvas:bitmap,x,y,width,height,density};
}
function bitmap(canvas){
 if(!canvas)return null;
 if(typeof canvas.transferToImageBitmap==='function')return canvas.transferToImageBitmap();
 throw Error('OffscreenCanvas.transferToImageBitmap unavailable');
}
function render(data){
 const types=new Map(data.types.map(t=>[t.id,t.materialClass]));
 const assets=new Map(data.cells.map(c=>{
  const source=terrain.get(c.path);
  if(!source)throw Error('Missing terrain texture '+c.path);
  return [c.path,source];
 }));
 const materialClassOf=id=>types.get(id)||'ground';
 const transitionMode=(a,b)=>{
  if(a===b)return 'variant';
  const p=materialClassOf(a),q=materialClassOf(b);
  if(p==='water'&&q==='water')return 'soft_water';
  if(p==='ground'&&q==='ground')return 'soft_ground';
  return 'shoreline_required';
 };
 const opts=data.options;
 const raster=self.VedrasAutotile.build(data.cells,
  c=>assets.get(c.path),c=>c.terrainTypeId,{
   bounds:data.bounds,band:opts.band,blendVariants:opts.blendVariants,
   waterSampling:opts.waterSampling,irregularity:opts.irregularity,
   blend:opts.blend,materialScales:opts.materialScales,
   terrainTone:(rgb,cls,id)=>self.VedrasPolish.terrainRGB(
    rgb[0],rgb[1],rgb[2],opts.terrainAmount,cls,id),
   resolution:opts.resolution,maxPixels:opts.maxPixels,
   cornerBlend:opts.cornerBlend,transitionMode,materialClassOf
  });
 if(!raster)return {empty:true};
 const enabled=!!data.relief?.enabled;
 const reliefParams=enabled?{
  ...data.relief,landMask:coastMask(data.maskCells),maskKey:data.maskKey
 }:null;
 const relief=enabled?self.VedrasRelief.make(raster.landLayer,reliefParams):raster;
 // The main thread never receives 1.3m individual RGBA pixels. Transfer
 // already composed GPU/Canvas bitmaps, using ownership transfer not cloning.
 const image=bitmap(relief.canvas),water=enabled?bitmap(raster.waterLayer.canvas):null;
 const payload={empty:false,
  relief:surface(image,relief),
  waterLayer:water?surface(water,raster.waterLayer):null};
 return {payload,transfer:water?[image,water]:[image]};
}
// Offscreen shoreline MAX-alpha union: reuse the established bitmap worker.
function renderShoreline(data){
 const images=(data.imagePaths||[]).map(path=>path?terrain.get(path)?.img||null:null);
 const raster=self.VedrasShoreline.build(data.cells||[],c=>c.wet,images,{
  ...data.options,segments:data.segments||[],bounds:data.bounds,
  mouthPortals:data.mouthPortals||[]
 });
 if(!raster?.canvas)return {empty:true};
 const image=bitmap(raster.canvas);
 return {payload:{shoreline:surface(image,raster)},transfer:[image]};
}
self.onmessage=e=>{
 const m=e.data;
 if(m?.type==='texture'){
  try{
   const previous=terrain.get(m.path);
   if(previous?.img&&typeof previous.img.close==='function')previous.img.close();
   terrain.set(m.path,{path:m.path,img:m.bitmap,
    meta:{textureWorldSize:m.worldSize||256}});
   // Textures are unpacked only once and shared across all offscreen chunks.
   self.VedrasAutotile.clearCache();
  }catch(err){
   self.postMessage({type:'fatal',message:String(err)});
  }
  return;
 }
 if(m?.type==='reset'){
  for(const asset of terrain.values())asset.img?.close?.();
  terrain.clear();self.VedrasAutotile.clearCache();self.VedrasRelief.clear();
  return;
 }
 if(m?.type!=='render'&&m?.type!=='shoreline-render')return;
 const start=performance.now();
 try{
  const result=m.type==='shoreline-render'?
   renderShoreline(m.data):render(m.data);
  self.postMessage({type:'result',id:m.id,ms:performance.now()-start,
   ...(result.empty?{empty:true}:{...result.payload})},result.transfer||[]);
 }catch(err){
  self.postMessage({type:'error',id:m.id,message:String(err),stack:err?.stack||''});
 }
};
self.postMessage({type:'ready'});

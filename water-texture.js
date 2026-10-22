/* Repeatable water texture sampling without straight rectangular seams.
 * Stable world-space texture origin; original artwork is preserved except
 * for narrow, automatically detected seam/edge repairs.
 */
'use strict';
window.VedrasWaterTexture=(()=>{
 const cached=new WeakMap();
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
 function repairPixels(pixels,width,height){
  const original=pixels,output=new Uint8ClampedArray(original);
  if(width<24||height<24)return output;
  const at=(x,y,c)=>original[(y*width+x)*4+c];
  // A seam is recognized only if a narrow vertical column has a nearly
  // uniform deviation over the majority of image rows. Legitimate waves,
  // foam and localized art must NOT be blurred or flattened.
  const candidates=[Math.floor(width/2)-1,Math.floor(width/2),
   Math.floor(width/2)+1];
  for(const x of candidates){
   let hit=0,rows=0;
   for(let y=4;y<height-4;y+=4){
    let deviation=0;
    for(let c=0;c<3;c++)deviation+=Math.abs(at(x,y,c)-
     .5*(at(x-3,y,c)+at(x+3,y,c)))/3;
    if(deviation>26)hit++;
    rows++;
   }
   if(rows&&hit/rows>.72){
    for(let y=0;y<height;y++)for(let dx=-2;dx<=2;dx++){
     const xx=x+dx,t=(dx+3)/6;
     for(let c=0;c<3;c++)output[(y*width+xx)*4+c]=
      Math.round(at(x-3,y,c)*(1-t)+at(x+3,y,c)*t);
    }
    break; // One clear centre stripe only; never smooth whole water artwork.
   }
  }
  // Source textures are not necessarily authored as perfect repeat tiles.
  // Blend just the outer 8 texels of each side into their wrapped partner.
  const band=Math.min(8,Math.floor(Math.min(width,height)/6));
  for(let y=0;y<height;y++)for(let d=0;d<band;d++){
   const weight=.5*(1-smooth(d/band));
   const a=(y*width+d)*4,b=(y*width+(width-1-d))*4;
   for(let c=0;c<4;c++){
    const first=output[a+c],last=output[b+c];
    output[a+c]=Math.round(first*(1-weight)+last*weight);
    output[b+c]=Math.round(last*(1-weight)+first*weight);
   }
  }
  for(let x=0;x<width;x++)for(let d=0;d<band;d++){
   const weight=.5*(1-smooth(d/band));
   const a=(d*width+x)*4,b=((height-1-d)*width+x)*4;
   for(let c=0;c<4;c++){
    const first=output[a+c],last=output[b+c];
    output[a+c]=Math.round(first*(1-weight)+last*weight);
    output[b+c]=Math.round(last*(1-weight)+first*weight);
   }
  }
  return output;
 }
 function seamlessTile(image){
  if(!image)return null;
  if(cached.has(image))return cached.get(image);
  const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
  if(!width||!height)return null;
  const tile=document.createElement('canvas');tile.width=width;tile.height=height;
  const ctx=tile.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(image,0,0,width,height);
  try{
   const src=ctx.getImageData(0,0,width,height);
   src.data.set(repairPixels(src.data,width,height));
   ctx.putImageData(src,0,0);
   cached.set(image,tile);return tile;
  }catch{
   // Tainted/missing source: retain normal textured image, never flat blue.
   cached.set(image,image);return image;
  }
 }
 function fillWorld(ctx,image,rect,worldSize=256){
  const width=image?.naturalWidth||image?.width,height=image?.naturalHeight||image?.height;
  if(!width||!height){
   ctx.fillStyle='#4397b2';ctx.fillRect(rect.x,rect.y,rect.width,rect.height);
   return false;
  }
  const tile=seamlessTile(image)||image;
  const tw=worldSize,th=worldSize*height/width;
  const x0=Math.floor(rect.x/tw)*tw,y0=Math.floor(rect.y/th)*th;
  const right=rect.x+rect.width,bottom=rect.y+rect.height;
  // A single source-in operation clears pixels outside that source's
  // footprint. Repeating several drawImage calls with source-in would erase
  // ALL previous tiles, leaving only the final rectangle painted. Source-
  // atop retains the existing mask while filling it one texture tile at a
  // time; transparent terrain outside the mask remains transparent.
  const previous=ctx.globalCompositeOperation;
  if(previous==='source-in')ctx.globalCompositeOperation='source-atop';
  try{
   // Always start at the world origin, never the bounding box origin.
   for(let y=y0;y<bottom;y+=th)for(let x=x0;x<right;x+=tw)
    ctx.drawImage(tile,x,y,tw+.015,th+.015);
  }finally{ctx.globalCompositeOperation=previous;}
  return true;
 }
 return {repairPixels,seamlessTile,fillWorld};
})();
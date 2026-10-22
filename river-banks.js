/* Vedras Reiche – continuous, biome-aware river-bank overlay.
 * A river is a union of six-direction hex-edge courses, NOT a collection of
 * individually stamped banks. All geometry is in world space and deterministic.
 * Land material and water masks are unchanged; the result is a transparent
 * raster drawn above terrain and below roads, bridges and nature.
 */
'use strict';
window.VedrasRiverBanks=(()=>{
 const HEX=256,R=HEX/Math.sqrt(3),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
 const palettes={
  earth:[110,91,65,0],
  forest:[80,80,60,.14],
  rock:[113,111,101,.95],
  marsh:[76,86,66,.22],
  sand:[161,134,95,.08]
 };
 const hash=(x,y)=>{
  let n=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^0x5e1ba83;
  n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;
 };
 function material(cell,type=''){
  const id=String(type||cell?.terrainTypeId||cell?.baseBiome||cell?.biome||'').toLowerCase();
  const relief=String(cell?.reliefClass||'').toLowerCase();
  if(relief==='mountain'||/mountain|highland|cliff|stone|rock|alpine|hilly|ridge|volcan|gebirg|fels/.test(id))
   return 'rock';
  if(/swamp|marsh|bog|mire|wetland|moor|mangrove|sumpf|feucht|floodplain/.test(id))
   return 'marsh';
  if(/desert|dune|arid|savanna|dry|steppe|badland|wüste/.test(id))
   return 'sand';
  if(/forest|wood|jungle|taiga|wald/.test(id)||cell?.forestClass)return 'forest';
  if(relief==='hills')return 'rock';
  return 'earth';
 }
 // Sample broad world-space color weights around the actual water course.
 // This avoids changes exactly on biome hex boundaries or at a confluence.
 function paletteAt(x,y,cells){
  let sum=0,r=0,g=0,b=0,rock=0,marsh=0;
  for(const c of cells){
   const centerX=HEX*(c.q+c.r/2),centerY=1.5*R*c.r;
   const d=Math.hypot(x-centerX,y-centerY);
   if(d>410)continue;
   const t=1-smooth((d-35)/385),w=t*t;
   const p=palettes[c.bankMaterial||material(c)];
   r+=p[0]*w;g+=p[1]*w;b+=p[2]*w;rock+=p[3]*w;
   if(c.bankMaterial==='marsh')marsh+=w;
   sum+=w;
  }
  if(!sum)return {r:110,g:91,b:65,rock:0,marsh:0};
  return {r:r/sum,g:g/sum,b:b/sum,rock:rock/sum,marsh:marsh/sum};
 }
 function positionPalette(p,cells,memo){
  const id=Math.round(p.x*10)+','+Math.round(p.y*10);
  if(!memo.has(id))memo.set(id,paletteAt(p.x,p.y,cells));
  return memo.get(id);
 }
 function prepare(routes,cells,isWet,options={}){
  const RIVERS=window.VedrasRivers,width=clamp(Number(options.width)||40,12,70);
  const groundY=typeof options.groundY==='function'?options.groundY:null;
  const classified=cells.map(c=>({...c,
   bankMaterial:material(c,typeof options.typeForCell==='function'?options.typeForCell(c):'')}));
  const colors=new Map(),lines=[],paths=[],imageList=[],imageMap=new Map();
  function textureId(image){
   if(!image?.naturalWidth)return -1;
   if(!imageMap.has(image)){imageMap.set(image,imageList.length);imageList.push(image);}
   return imageMap.get(image);
  }
  for(const route of routes||[]){
   const sections=RIVERS.sections(route,cells,isWet);
   if(!sections.length)continue;
   const raw=RIVERS.coursePoints(sections,route,width);
   if(raw.length<2)continue;
   const projected=raw.map(p=>({x:p.x,y:groundY?groundY(p.x,p.y):p.y}));
   const cross=RIVERS.mouthCross(sections);
   const tail=projected.at(-1);
   const mouth={cross:{x:cross.x,y:groundY?groundY(cross.x,cross.y):cross.y},tip:tail};
   const image=typeof options.waterForRoute==='function'?options.waterForRoute(route):null;
   const waterIndex=textureId(image);
   const pathStyles=raw.map(p=>positionPalette(p,classified,colors));
   let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
   for(let i=1;i<projected.length;i++){
    const a=projected[i-1],b=projected[i],dx=b.x-a.x,dy=b.y-a.y;
    const length2=dx*dx+dy*dy;
    if(length2<1e-7)continue;
    const id=lines.length;
    lines.push({a,b,dx,dy,length2,start:pathStyles[i-1],end:pathStyles[i],
     minX:Math.min(a.x,b.x),maxX:Math.max(a.x,b.x),
     minY:Math.min(a.y,b.y),maxY:Math.max(a.y,b.y),waterIndex,mouth});
    minX=Math.min(minX,a.x,b.x);minY=Math.min(minY,a.y,b.y);
    maxX=Math.max(maxX,a.x,b.x);maxY=Math.max(maxY,a.y,b.y);
   }
   paths.push({points:projected,bounds:{minX,minY,maxX,maxY}});
  }
  return {lines,paths,images:imageList,width,routeCount:paths.length};
 }
 // Single MIN-distance union: at a corner, fork or confluence, the bank exists
 // only at the exterior boundary. No alpha accumulation or double shore line.
 function nearestField(prepared,bounds,scale){
  const {x,y,width,height}=bounds,w=Math.max(1,Math.ceil(width*scale)),
   h=Math.max(1,Math.ceil(height*scale)),length=w*h;
  const distances=new Float32Array(length),lineId=new Int32Array(length),along=new Float32Array(length);
  distances.fill(Infinity);lineId.fill(-1);
  const limit=prepared.width/2+42;
  prepared.lines.forEach((line,id)=>{
   if(line.maxX<x-limit||line.minX>x+width+limit||
      line.maxY<y-limit||line.minY>y+height+limit)return;
   const ix0=Math.max(0,Math.floor((line.minX-limit-x)*scale));
   const ix1=Math.min(w,Math.ceil((line.maxX+limit-x)*scale));
   const iy0=Math.max(0,Math.floor((line.minY-limit-y)*scale));
   const iy1=Math.min(h,Math.ceil((line.maxY+limit-y)*scale));
   for(let py=iy0;py<iy1;py++){
    const wy=y+(py+.5)/scale;
    for(let px=ix0;px<ix1;px++){
     const wx=x+(px+.5)/scale,offsetX=wx-line.a.x,offsetY=wy-line.a.y;
     const t=clamp((offsetX*line.dx+offsetY*line.dy)/line.length2,0,1);
     const rx=offsetX-t*line.dx,ry=offsetY-t*line.dy,dist2=rx*rx+ry*ry;
     const idx=py*w+px;
     if(dist2<distances[idx]){
      distances[idx]=dist2;lineId[idx]=id;along[idx]=t;
     }
    }
   }
  });
  return {w,h,distances,lineId,along};
 }
 // A small irregular, sloped cross-section: darker moist cut nearest water,
 // lighter elevated lip farther inland. Coordinates are world-anchored.
 function bankSample(distance,half,style,strength,x,y,normalLight=0){
  const wobble=1.35*Math.sin(x*.069+y*.051)+.85*Math.sin(x*.109-y*.072);
  const d=distance+wobble;
  const reach=20+style.marsh*10+style.rock*3;
  const lip=1-smooth((d-half+1)/reach);
  const cut=Math.exp(-Math.pow((d-half-3)/6.6,2));
  const crown=Math.exp(-Math.pow((d-half-15)/7.8,2));
  const grain=hash(Math.floor(x/8),Math.floor(y/8));
  const stone=(grain>.77?1:0)*style.rock*Math.max(0,1-Math.abs(d-half-15)/11);
  const damp=style.marsh;
  const alpha=clamp(strength*(.15*lip+.32*cut+.15*crown+
   .21*stone+.055*damp*lip),0,.72);
  const light=clamp(1+normalLight*.105+crown*.08-cut*.12+stone*.19,-1,2);
  return {alpha,red:clamp(style.r*light,0,255),green:clamp(style.g*light,0,255),
   blue:clamp(style.b*light,0,255),stone};
 }
 function render(prepared,options={}){
  const bounds=options.bounds;
  if(!bounds||!prepared?.lines.length)return null;
  const pad=prepared.width/2+42;
  if(!prepared.lines.some(l=>l.maxX>=bounds.x-pad&&l.minX<=bounds.x+bounds.width+pad&&
   l.maxY>=bounds.y-pad&&l.minY<=bounds.y+bounds.height+pad))return null;
  const density=clamp(Number(options.resolution)||1,.5,1.6);
  const scale=Math.min(density,Math.sqrt(900000/(bounds.width*bounds.height)));
  const field=nearestField(prepared,bounds,scale),{w,h}=field;
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const g=canvas.getContext('2d',{willReadFrequently:true}),bank=g.createImageData(w,h);
  const waterMasks=new Map();
  const half=prepared.width/2,strength=clamp(Number(options.bankStrength??.85),0,1);
  let bankPixels=0,waterPixels=0;
  for(let i=0;i<field.lineId.length;i++){
   const lineIndex=field.lineId[i];if(lineIndex<0)continue;
   const rawDistance=Math.sqrt(field.distances[i]);
   if(rawDistance>half+40)continue;
   const py=Math.floor(i/w),px=i-py*w,wx=bounds.x+(px+.5)/scale,wy=bounds.y+(py+.5)/scale;
   const line=prepared.lines[lineIndex],t=field.along[i],posX=line.a.x+t*line.dx,
    posY=line.a.y+t*line.dy,distX=wx-posX,distY=wy-posY;
   const normalSign=Math.sign(-line.dy*distX+line.dx*distY)||1;
   const length=Math.sqrt(line.length2);
   const normalLight=normalSign*((-line.dy/length)*(-.6)+(line.dx/length)*(-.8));
   const style={
    r:line.start.r*(1-t)+line.end.r*t,
    g:line.start.g*(1-t)+line.end.g*t,
    b:line.start.b*(1-t)+line.end.b*t,
    rock:line.start.rock*(1-t)+line.end.rock*t,
    marsh:line.start.marsh*(1-t)+line.end.marsh*t
   };
   // The same disturbance shapes water and bank; the channel stays joined.
   const wobble=1.35*Math.sin(wx*.069+wy*.051)+.85*Math.sin(wx*.109-wy*.072);
   const d=rawDistance+wobble;
   const texFade=(()=>{
    const cross=line.mouth.cross,tip=line.mouth.tip,dx=tip.x-cross.x,dy=tip.y-cross.y;
    const endLen=dx*dx+dy*dy||1;
    const forward=clamp(((wx-cross.x)*dx+(wy-cross.y)*dy)/endLen,0,1);
    return 1-smooth(forward);
   })();
   const j=i*4;
   if(strength>0){
    const bankValue=bankSample(rawDistance,half,style,strength,wx,wy,normalLight);
    if(bankValue.alpha>.004){
     bank.data[j]=bankValue.red;
     bank.data[j+1]=bankValue.green;
     bank.data[j+2]=bankValue.blue;
     bank.data[j+3]=Math.round(bankValue.alpha*255*texFade);
     bankPixels++;
    }
   }
   const waterAlpha=Math.round(window.VedrasRivers.alphaAtDistance(d,prepared.width)*255*texFade);
   if(waterAlpha>0){
    const id=line.waterIndex;let mask=waterMasks.get(id);
    if(!mask){mask=new Uint8Array(w*h);waterMasks.set(id,mask);}
    mask[i]=waterAlpha;waterPixels++;
   }
  }
  g.putImageData(bank,0,0);
  // River textures are sampled in world coordinates, not individual hex
  // stamps. Separate source textures remain possible across tributaries.
  for(const [id,mask] of waterMasks){
   const waterCanvas=document.createElement('canvas');waterCanvas.width=w;waterCanvas.height=h;
   const wg=waterCanvas.getContext('2d',{willReadFrequently:true});
   const image=wg.createImageData(w,h);
   for(let i=0;i<mask.length;i++){
    if(!mask[i])continue;const j=i*4;
    image.data[j]=255;image.data[j+1]=255;image.data[j+2]=255;image.data[j+3]=mask[i];
   }
   wg.putImageData(image,0,0);
   wg.save();wg.setTransform(scale,0,0,scale,-bounds.x*scale,-bounds.y*scale);
   wg.globalCompositeOperation='source-in';
   const source=prepared.images[id],pattern=source?.naturalWidth?wg.createPattern(source,'repeat'):null;
   if(pattern){
    if(pattern.setTransform&&typeof DOMMatrix!=='undefined'){
     const factor=HEX/Math.max(1,source.naturalWidth);
     pattern.setTransform(new DOMMatrix([factor,0,0,factor,0,0]));
    }
    wg.fillStyle=pattern;
   }else wg.fillStyle='#4397b2';
   wg.fillRect(bounds.x,bounds.y,bounds.width,bounds.height);
   wg.restore();g.drawImage(waterCanvas,0,0);
  }
  return {canvas,x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height,
   routes:prepared.routeCount,sections:prepared.lines.length,bankPixels,waterPixels};
 }
 return {material,paletteAt,bankSample,prepare,nearestField,render};
})();
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
  earth:[151,125,93,.20],
  forest:[113,111,84,.24],
  rock:[166,157,137,.95],
  marsh:[101,105,77,.13],
  sand:[185,150,105,.22],
  frost:[177,186,186,.28]
 };
 const hash=(x,y)=>{
  let n=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^0x5e1ba83;
  n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;
 };
 function material(cell,type=''){
  const id=String(type||cell?.terrainTypeId||cell?.baseBiome||cell?.biome||'').toLowerCase();
  const relief=String(cell?.reliefClass||'').toLowerCase();
  if(/snow|frozen|tundra|glaci|icefield|winter|schnee|eisfeld/.test(id))
   return 'frost';
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
  if(!sum)return {r:151,g:125,b:93,rock:.20,marsh:0};
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
  const classified=cells.filter(c=>!isWet(c)).map(c=>({...c,
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
 // Sparse deterministic elliptical rocks / grassy tufts aligned with the
 // local river tangent. No six-angle sprite variants and no square tiling.
 function debris(x,y,tx,ty,kind){
  const pitch=19,gx=Math.floor(x/pitch),gy=Math.floor(y/pitch);
  let coverage=0;
  for(let iy=gy-1;iy<=gy+1;iy++)for(let ix=gx-1;ix<=gx+1;ix++){
   const seed=hash(ix,iy);
   if(seed>(kind==='rock'?.32:.17))continue;
   const jx=hash(ix+17,iy-31)-.5,jy=hash(ix-39,iy+13)-.5;
   const cx=(ix+.5+jx*.42)*pitch,cy=(iy+.5+jy*.42)*pitch;
   const dx=x-cx,dy=y-cy,along=dx*tx+dy*ty,across=-dx*ty+dy*tx;
   const wide=kind==='rock'?3.1+hash(ix+7,iy)*2.4:2.0;
   const high=kind==='rock'?1.5+hash(ix,iy-6)*1.5:4.0;
   const d=Math.hypot(along/wide,across/high);
   coverage=Math.max(coverage,1-smooth((d-.55)/.45));
  }
  return coverage;
 }

 // The bank occupies a genuinely visible 2.5-D cross-section: wet cut,
 // faceted ledge/earth wall, sunlit crest, then a terrain-transparent shoulder.
 // All detail is derived from world coordinates so it works in all 6 headings.
 function facets(x,y){
  const pitch=29,gx=Math.floor(x/pitch),gy=Math.floor(y/pitch);
  let first=Infinity,second=Infinity,tint=0;
  for(let iy=gy-1;iy<=gy+1;iy++)for(let ix=gx-1;ix<=gx+1;ix++){
   const fx=(ix+.5+(hash(ix+29,iy-11)-.5)*.72)*pitch;
   const fy=(iy+.5+(hash(ix-12,iy+17)-.5)*.72)*pitch;
   const d=Math.hypot(x-fx,y-fy);
   if(d<first){second=first;first=d;tint=hash(ix+7,iy+3)*2-1;}
   else if(d<second)second=d;
  }
  const crack=1-smooth((second-first-1.25)/3.5);
  return {plane:tint,crack:clamp(crack,0,1)};
 }
 function bankSample(distance,half,style,strength,x,y,normalLight=0,tx=1,ty=0){
  const base={alpha:0,red:style.r,green:style.g,blue:style.b,stone:0,reeds:0};
  // No shoreline effect inside the actual water envelope; water is rendered
  // afterward by the original VedrasRivers.render without any alterations.
  if(distance<half-2||distance>half+47||strength<=0)return base;
  const warp=2.1*Math.sin(x*.061+y*.043)+
   1.35*Math.sin(x*.123-y*.079)+.8*Math.sin(x*.23+y*.17);
  const d=distance-half+warp;
  if(d<-.5||d>44)return base;
  const enter=smooth((d+.6)/2.6);
  const foot=(1-smooth((d-2)/8))*enter;
  const wall=(1-smooth((d-18)/8))*smooth((d-.5)/5);
  const crest=Math.exp(-Math.pow((d-23.5)/5.0,2));
  const shoulder=(1-smooth((d-26)/16))*smooth((d-22)/6);
  if(foot+wall+crest+shoulder<.001)return base;
  const rockMix=clamp(style.rock*.83+.21,0,1);
  const facet=facets(x,y),broken=facet.crack*rockMix;
  const looseBand=(1-smooth(Math.abs(d-29)/15));
  const stone=looseBand*rockMix*debris(x,y,tx,ty,'rock');
  const reeds=style.marsh*.9*looseBand*debris(x,y,tx,ty,'reeds');
  // Dense, but translucent cliff faces preserve hints of the original
  // terrain. On the outside, shoulder transparency fades to exactly zero.
  const alpha=clamp(strength*(
   foot*.68+wall*.90+crest*.75+shoulder*.25+
   stone*.35+reeds*.20),0,.94);
  const direction=clamp(normalLight,-1,1);
  // Individual stones form differently lit polygonal facets with hairline
  // shadow seams, rather than a uniformly colored rectangular river outline.
  const rockShade=facet.plane*.20*rockMix-broken*.25+
   stone*.27;
  const tone=1+wall*(-.18+direction*.27+rockShade)+
   foot*(-.38)+crest*(.32+direction*.10)+
   shoulder*(.05+facet.plane*.04);
  const stoneBlend=clamp((wall+crest*.4)*rockMix*.35+stone*.60,0,.7);
  const r=(style.r*(1-stoneBlend)+173*stoneBlend)*tone;
  const g=(style.g*(1-stoneBlend)+163*stoneBlend)*tone+reeds*10;
  const b=(style.b*(1-stoneBlend)+142*stoneBlend)*tone-reeds*12;
  return {alpha,red:clamp(r,0,255),green:clamp(g,0,255),
   blue:clamp(b,0,255),stone,reeds};
 }
 // Only the bank is rasterized here. Previously this module replaced the
 // old textured water with its own flat-color composite, a visual regression.
 function render(prepared,options={}){
  const bounds=options.bounds;
  if(!bounds||!prepared?.lines.length)return null;
  const bankStrength=clamp(Number(options.bankStrength??.85),0,1);
  if(bankStrength<=0)return null;
  const pad=prepared.width/2+50;
  if(!prepared.lines.some(l=>l.maxX>=bounds.x-pad&&l.minX<=bounds.x+bounds.width+pad&&
   l.maxY>=bounds.y-pad&&l.minY<=bounds.y+bounds.height+pad))return null;
  const density=clamp(Number(options.resolution)||1,.5,1.6);
  const scale=Math.min(density,Math.sqrt(900000/(bounds.width*bounds.height)));
  // World-aligned pixel origin prevents seams at chunk boundaries for
  // fractional preview quality as well as final-quality rasterization.
  const left=Math.floor(bounds.x*scale),top=Math.floor(bounds.y*scale);
  const right=Math.ceil((bounds.x+bounds.width)*scale);
  const bottom=Math.ceil((bounds.y+bounds.height)*scale);
  const aligned={x:left/scale,y:top/scale,width:(right-left)/scale,
   height:(bottom-top)/scale};
  const field=nearestField(prepared,aligned,scale),{w,h}=field;
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const g=canvas.getContext('2d',{willReadFrequently:true}),image=g.createImageData(w,h);
  const half=prepared.width/2;
  let bankPixels=0;
  for(let i=0;i<field.lineId.length;i++){
   const lineIndex=field.lineId[i];if(lineIndex<0)continue;
   const distance=Math.sqrt(field.distances[i]);
   if(distance<half-2||distance>half+47)continue;
   const py=Math.floor(i/w),px=i-py*w,
    wx=aligned.x+(px+.5)/scale,wy=aligned.y+(py+.5)/scale;
   const line=prepared.lines[lineIndex],t=field.along[i];
   const posX=line.a.x+t*line.dx,posY=line.a.y+t*line.dy,
    distX=wx-posX,distY=wy-posY;
   const sign=Math.sign(-line.dy*distX+line.dx*distY)||1;
   const length=Math.sqrt(line.length2);
   const directionalLight=sign*((-line.dy/length)*(-.6)+(line.dx/length)*(-.8));
   const style={
    r:line.start.r*(1-t)+line.end.r*t,
    g:line.start.g*(1-t)+line.end.g*t,
    b:line.start.b*(1-t)+line.end.b*t,
    rock:line.start.rock*(1-t)+line.end.rock*t,
    marsh:line.start.marsh*(1-t)+line.end.marsh*t
   };
   const pixel=bankSample(distance,half,style,bankStrength,wx,wy,
    directionalLight,line.dx/length,line.dy/length);
   if(pixel.alpha<.004)continue;
   // A shoreline mouth becomes part of the sea coast, not a rock wall
   // extending across open water. Match the original portal fade.
   const cross=line.mouth.cross,tip=line.mouth.tip;
   const mx=tip.x-cross.x,my=tip.y-cross.y,m2=mx*mx+my*my||1;
   const towardWater=clamp(((wx-cross.x)*mx+(wy-cross.y)*my)/m2,0,1);
   const fade=1-smooth(towardWater);
   const alpha=Math.round(pixel.alpha*fade*255);
   if(!alpha)continue;
   const j=i*4;
   image.data[j]=pixel.red;image.data[j+1]=pixel.green;
   image.data[j+2]=pixel.blue;image.data[j+3]=alpha;
   bankPixels++;
  }
  g.putImageData(image,0,0);
  return {canvas,x:aligned.x,y:aligned.y,width:aligned.width,height:aligned.height,
   routes:prepared.routeCount,sections:prepared.lines.length,bankPixels,
   waterPixels:0,layer:'bank-only'};
 }
 return {material,paletteAt,bankSample,prepare,nearestField,render};
})();
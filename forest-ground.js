/* Forest-floor renderer: one world-space texture, one smooth mask for
 * each connected woodland region. Adjacent forest hexes have NO interior
 * opacity transition. Their shared edge is not part of the forest boundary.
 */
'use strict';
window.VedrasForestGround=(()=>{
 const HEX=256,R=HEX/Math.sqrt(3);
 const dirs=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
 const sideNeighbors=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];
 const key=c=>c.q+','+c.r;
 const pos=c=>({x:HEX*(c.q+c.r/2),y:1.5*R*c.r});
 const points=c=>{
  const p=pos(c);return Array.from({length:6},(_,i)=>{
   const a=-Math.PI/2+i*Math.PI/3;
   return {x:p.x+R*Math.cos(a),y:p.y+R*Math.sin(a)};
  });
 };
 function strength(cell){
  const category=cell.categoryId||cell.category||'';
  const base=category==='wetlands'?.30:category==='cold_regions'?.25:category==='arid_regions'?.22:.72;
  return base*(cell.forestClass==='dense_forest'?1:.58);
 }
 function eligible(cell){
  return cell&&!cell.jungle&&['dense_forest','light_forest'].includes(cell.forestClass)&&
   cell.ground!==false&&!['snowfields','frozen_tundra'].includes(cell.baseBiome);
 }
 function regions(cells){
  const byKey=new Map((cells||[]).filter(eligible).map(c=>[key(c),c]));
  const seen=new Set(),out=[];
  for(const item of byKey.values()){
   if(seen.has(key(item)))continue;
   const queue=[item],region=[];seen.add(key(item));
   for(let i=0;i<queue.length;i++){
    const cell=queue[i];region.push(cell);
    for(const [dq,dr] of dirs){
     const k=(cell.q+dq)+','+(cell.r+dr),next=byKey.get(k);
     if(next&&!seen.has(k)){seen.add(k);queue.push(next);}
    }
   }
   out.push(region);
  }
  return out;
 }
 function exteriorEdges(region){
  const entries=new Set(region.map(key)),edges=[];
  for(const c of region){
   const vertices=points(c);
   for(let i=0;i<6;i++){
    const n=sideNeighbors[i],neighbor=(c.q+n[0])+','+(c.r+n[1]);
    if(entries.has(neighbor))continue;
    edges.push({from:vertices[i],to:vertices[(i+1)%6],cell:key(c),side:i});
   }
  }
  return edges;
 }
 // Irregular fringe is ONLY visual: the adjacent geography hex remains
 // forestClass='none'. Water, snow, jungle and manually cleared ground never
 // receive these organic excursions.
 function canSpill(edge,grid){
  if(!grid)return false;
  const [dq,dr]=sideNeighbors[edge.side],
   [q,r]=edge.cell.split(',').map(Number);
  const n=grid.get((q+dq)+','+(r+dr));
  return !!n&&n.ground!==false&&!n.jungle&&!n.manualClearing&&
   !['snowfields','frozen_tundra'].includes(n.baseBiome)&&
   n.forestClass==='none'&&(n.edgeInfluence||0)>.05;
 }
 function edgeShape(edge,index){
  const [q,r]=edge.cell.split(',').map(Number),
   a=edge.from,b=edge.to,p=pos({q,r}),
   mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2},
   length=Math.hypot(mid.x-p.x,mid.y-p.y)||1;
  const normal={x:(mid.x-p.x)/length,y:(mid.y-p.y)/length};
  const h=(salt)=>{
   let n=Math.imul(q+37,374761393)^Math.imul(r+151,668265263)^
    Math.imul(edge.side+salt+23,2246822519);
   n^=n>>>13;n=Math.imul(n,1274126177);return((n^(n>>>16))>>>0)/4294967296;
  };
  const t=.23+index*.49+(h(index+1)-.5)*.12;
  const spot={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
  const outward=7+h(index+11)*12;
  const radius=27+h(index+29)*17;
  return {spot,normal,outward,radius};
 }
 function fillHexes(g,cells,edges=[],grid=null){
  // Same union path across every forest hex. Boundary-only organic bulbs
  // interrupt otherwise straight 256-wide hex silhouettes.
  g.beginPath();
  for(const c of cells){
   const p=points(c);
   g.moveTo(p[0].x,p[0].y);
   for(let i=1;i<6;i++)g.lineTo(p[i].x,p[i].y);
   g.closePath();
  }
  if(typeof g.arc==='function')
   for(const edge of edges)if(canSpill(edge,grid))
    for(let i=0;i<2;i++){
     const {spot,normal,outward,radius}=edgeShape(edge,i);
     const x=spot.x+normal.x*outward,y=spot.y+normal.y*outward;
     g.moveTo(x+radius,y);g.arc(x,y,radius,0,Math.PI*2);
    }
  g.fill();
 }
 function build(cells,image,options={}){
  const groups=regions(cells);
  if(!groups.length||!image?.naturalWidth)return null;
  const all=groups.flat(),verts=all.flatMap(points);
  const feather=Math.max(8,Math.min(40,Number(options.feather)||24)),pad=Math.ceil(feather*3+3);
  const left=Math.floor(Math.min(...verts.map(p=>p.x))-pad),top=Math.floor(Math.min(...verts.map(p=>p.y))-pad);
  const right=Math.ceil(Math.max(...verts.map(p=>p.x))+pad),bottom=Math.ceil(Math.max(...verts.map(p=>p.y))+pad);
  const width=right-left,height=bottom-top;
  const maxPixels=Math.max(400000,Number(options.maxPixels)||2600000);
  const scale=Math.max(.35,Math.min(Number(options.resolution)||1.25,Math.sqrt(maxPixels/(width*height))));
  const pw=Math.max(1,Math.ceil(width*scale)),ph=Math.max(1,Math.ceil(height*scale));
  const make=()=>{const canvas=document.createElement('canvas');canvas.width=pw;canvas.height=ph;return canvas;};
  const mask=make(),mg=mask.getContext('2d');
  mg.setTransform(scale,0,0,scale,-left*scale,-top*scale);
  const grid=new Map((cells||[]).map(c=>[key(c),c])),edges=[];
  for(const group of groups){
   const opacity=group.reduce((v,c)=>v+strength(c),0)/group.length;
   mg.fillStyle='rgba(255,255,255,'+opacity.toFixed(4)+')';
   const boundary=exteriorEdges(group);
   fillHexes(mg,group,boundary,grid);
   edges.push(...boundary);
  }
  // Narrow, seeded bites on eligible exterior edges erase the perfectly
  // straight segments left between bulbs. No per-hex alpha seam is added.
  if(typeof mg.arc==='function'){
   mg.globalCompositeOperation='destination-out';
   mg.beginPath();
   let notches=0;
   for(const edge of edges)if(canSpill(edge,grid)){
    const {spot,normal,radius}=edgeShape(edge,0);
    const bite=Math.max(13,radius*.49);
    const x=spot.x-normal.x*6,y=spot.y-normal.y*6;
    mg.moveTo(x+bite,y);mg.arc(x,y,bite,0,Math.PI*2);notches++;
   }
   if(notches)mg.fill();
   mg.globalCompositeOperation='source-over';
  }
  const softened=make(),sg=softened.getContext('2d');
  // Blur applied to the UNION silhouette, not to 37 different hex stamps.
  // No seams exist between adjacent cells, even when their base biome differs.
  sg.filter='blur('+(feather*scale).toFixed(2)+'px)';
  sg.drawImage(mask,0,0);
  sg.filter='none';
  // The editor formerly clipped this already-blurred mask to every
  // non-snow hex using a hard Canvas path. At snow/forest contacts that
  // reintroduced the exact 256-unit HEX side and erased the soft blend.
  // Subtract excluded terrain here with a WORLD-SPACE feather instead.
  // All excluded polygons are one union fill, so adjacent snowy/wet hexes
  // cannot create interior seams. This affects only the visual overlay,
  // never the underlying biome, forestClass, or normal terrain blend.
  const excluded=(cells||[]).filter(c=>c.ground===false||c.jungle||
   ['snowfields','frozen_tundra'].includes(c.baseBiome));
  if(excluded.length){
   sg.save();
   sg.globalCompositeOperation='destination-out';
   sg.setTransform(scale,0,0,scale,-left*scale,-top*scale);
   sg.filter='blur('+(Math.max(12,Math.min(28,feather))*scale).toFixed(2)+'px)';
   sg.fillStyle='#000';
   sg.beginPath();
   for(const c of excluded){
    const polygon=points(c);
    sg.moveTo(polygon[0].x,polygon[0].y);
    for(let i=1;i<polygon.length;i++)
     sg.lineTo(polygon[i].x,polygon[i].y);
    sg.closePath();
   }
   sg.fill();
   sg.filter='none';
   sg.restore();
  }
  // Forest glades have soft, irregularly positioned openings in the unified
  // forest-floor mask. Never erase an entire hex polygon: there must be no
  // hexagonal seams around small clearings or among neighboring forest cells.
  const glades=(cells||[]).filter(c=>c.glade&&eligible(c));
  if(glades.length){
   sg.save();sg.globalCompositeOperation='destination-out';
   sg.setTransform(scale,0,0,scale,-left*scale,-top*scale);
   for(const c of glades){
    const p=pos(c),radius=c.gladeRadius||64,
     x=p.x+(c.gladeX||0),y=p.y+(c.gladeY||0);
    // Three overlapping feathered pockets make an asymmetric clearing.
    // Tree trunks are excluded from its center by VedrasForest.inGlade,
    // while perimeter trees remain inside the forest hex.
    for(const [dx,dy,factor] of [[0,0,1],[.38,-.25,.60],[-.34,.28,.67]]){
     const rad=radius*factor,px=x+radius*dx,py=y+radius*dy;
     const gradient=sg.createRadialGradient(px,py,rad*.12,px,py,rad);
     gradient.addColorStop(0,'rgba(0,0,0,.96)');
     gradient.addColorStop(.48,'rgba(0,0,0,.82)');
     gradient.addColorStop(1,'rgba(0,0,0,0)');
     sg.fillStyle=gradient;sg.fillRect(px-rad,py-rad,rad*2,rad*2);
    }
   }
   sg.restore();
  }
  const output=make(),g=output.getContext('2d');
  const imgW=image.naturalWidth,imgH=image.naturalHeight||imgW;
  const tileSize=Math.max(160,Math.min(1536,Number(options.textureSize)||256));
  // The pattern origin is the WORLD origin (0,0), never an individual hex
  // center or component bbox. All forest patches share identical UV phase.
  g.setTransform(scale,0,0,scale,-left*scale,-top*scale);
  g.scale(tileSize/imgW,tileSize/imgH);
  // Forest texture is an independent repeating layer over the terrain.
  // Repeating its raw non-tileable PNG can create hard vertical/horizontal
  // lines inside a hex and at 512-unit chunk boundaries. The derived
  // seamless copy has a wider wrap fade; source PNG remains unchanged.
  const repeated=window.VedrasWaterTexture?.seamlessTile?.(image,
   {centerStripe:false,edgeBand:32})||image;
  g.fillStyle=g.createPattern(repeated,'repeat');
  g.fillRect(left*imgW/tileSize,top*imgH/tileSize,width*imgW/tileSize,height*imgH/tileSize);
  g.setTransform(1,0,0,1,0,0);
  g.globalCompositeOperation='destination-in';
  g.drawImage(softened,0,0);
  g.globalCompositeOperation='source-over';
  return {canvas:output,x:left,y:top,width,height,regions:groups.length,cells:all.length,
   exteriorEdges:edges.length,scale,feather,textureOrigin:'world-0,0',mask:'organic-region-union-soft-biome-v4',textureEdgePolicy:'seamless-ground-wrap-v1'};
 }
 return {key,pos,points,strength,eligible,regions,exteriorEdges,fillHexes,build};
})();

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
 function fillHexes(g,cells){
  // One path and one fill per connected component: the 2D renderer unions
  // all polygons BEFORE applying alpha. No per-hex radial fades can occur.
  g.beginPath();
  for(const c of cells){
   const p=points(c);
   g.moveTo(p[0].x,p[0].y);
   for(let i=1;i<6;i++)g.lineTo(p[i].x,p[i].y);
   g.closePath();
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
  const edges=[];
  for(const group of groups){
   const opacity=group.reduce((v,c)=>v+strength(c),0)/group.length;
   mg.fillStyle='rgba(255,255,255,'+opacity.toFixed(4)+')';
   fillHexes(mg,group);
   edges.push(...exteriorEdges(group));
  }
  const softened=make(),sg=softened.getContext('2d');
  // Blur applied to the UNION silhouette, not to 37 different hex stamps.
  // No seams exist between adjacent cells, even when their base biome differs.
  sg.filter='blur('+(feather*scale).toFixed(2)+'px)';
  sg.drawImage(mask,0,0);
  sg.filter='none';
  const output=make(),g=output.getContext('2d');
  const imgW=image.naturalWidth,imgH=image.naturalHeight||imgW;
  const tileSize=Math.max(160,Math.min(1536,Number(options.textureSize)||256));
  // The pattern origin is the WORLD origin (0,0), never an individual hex
  // center or component bbox. All forest patches share identical UV phase.
  g.setTransform(scale,0,0,scale,-left*scale,-top*scale);
  g.scale(tileSize/imgW,tileSize/imgH);
  g.fillStyle=g.createPattern(image,'repeat');
  g.fillRect(left*imgW/tileSize,top*imgH/tileSize,width*imgW/tileSize,height*imgH/tileSize);
  g.setTransform(1,0,0,1,0,0);
  g.globalCompositeOperation='destination-in';
  g.drawImage(softened,0,0);
  g.globalCompositeOperation='source-over';
  return {canvas:output,x:left,y:top,width,height,regions:groups.length,cells:all.length,
   exteriorEdges:edges.length,scale,feather,textureOrigin:'world-0,0',mask:'region-union'};
 }
 return {key,pos,points,strength,eligible,regions,exteriorEdges,fillHexes,build};
})();

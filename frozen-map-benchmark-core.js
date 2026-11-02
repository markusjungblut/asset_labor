/* Step 19: non-destructive, pure helpers for the frozen-image atlas A/B test.
 * No terrain, sprite or fog authoring. All source records are read-only.
 */
'use strict';
window.VedrasAtlasBenchmarkCore=(()=>{
 const VARIANTS=Object.freeze([
  {id:'A',name:'Original-PNG 4×',kind:'original'},
  {id:'B',name:'Transparenzbeschnitt',kind:'crop'},
  {id:'C',name:'PNG 2×',kind:'resize',factor:.5},
  {id:'D',name:'PNG 1×',kind:'resize',factor:.25},
  {id:'E',name:'WebP Qualität 0,92',kind:'webp',quality:.92}
 ]);
 function idFromKey(key){
  const id=String(key).split('|').pop();
  return /^-?\d+,-?\d+$/.test(id)?id:null;
 }
 function tileIndex(id){
  if(!/^-?\d+,-?\d+$/.test(String(id)))return null;
  const [x,y]=id.split(',').map(Number);
  return Number.isSafeInteger(x)&&Number.isSafeInteger(y)?{x,y}:null;
 }
 function choosePairs(keys,count=5){
  const tiles=new Map();
  for(const key of keys||[]){
   const id=idFromKey(key),at=tileIndex(id);
   if(at)tiles.set(id,{id,key,x:at.x,y:at.y});
  }
  const pairs=[];
  for(const t of tiles.values()){
   for(const otherId of [(t.x+1)+','+t.y,t.x+','+(t.y+1)]){
    const other=tiles.get(otherId);
    if(other)pairs.push({ids:[t.id,other.id],keys:[t.key,other.key],
     x:(t.x+other.x)/2,y:(t.y+other.y)/2});
   }
  }
  pairs.sort((a,b)=>a.x-b.x||a.y-b.y);
  const chosen=[],used=new Set();
  while(chosen.length<Math.max(1,count)){
   const remaining=pairs.filter(pair=>pair.ids.every(id=>!used.has(id)));
   if(!remaining.length)break;
   let best=remaining[0],bestScore=-Infinity;
   for(const pair of remaining){
    const score=chosen.length?
     Math.min(...chosen.map(p=>(p.x-pair.x)**2+(p.y-pair.y)**2)):
     // Deterministic first choice near center of actual tile distribution.
     -((pair.x-(pairs[0].x+pairs.at(-1).x)/2)**2+
       (pair.y-(pairs[0].y+pairs.at(-1).y)/2)**2);
    if(score>bestScore){bestScore=score;best=pair;}
   }
   chosen.push(best);
   best.ids.forEach(id=>used.add(id));
  }
  return chosen;
 }
 function cropLayerMetadata(layer,originalWidth,originalHeight,left,top){
  const c=layer.crop||{x:0,y:0,fullWidth:originalWidth,fullHeight:originalHeight};
  return {...layer,crop:{x:c.x+left,y:c.y+top,
   fullWidth:c.fullWidth,fullHeight:c.fullHeight}};
 }
 function resizeLayerMetadata(layer,originalWidth,originalHeight,newWidth,newHeight){
  if(!layer.crop)return {...layer};
  const sx=newWidth/originalWidth,sy=newHeight/originalHeight,c=layer.crop;
  return {...layer,crop:{x:c.x*sx,y:c.y*sy,
   fullWidth:c.fullWidth*sx,fullHeight:c.fullHeight*sy}};
 }
 function alphaBounds(bytes,width,height,margin=2){
  if(!bytes||bytes.length!==width*height*4)return null;
  let minX=width,minY=height,maxX=-1,maxY=-1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   if(bytes[(y*width+x)*4+3]===0)continue;
   minX=Math.min(minX,x);maxX=Math.max(maxX,x);
   minY=Math.min(minY,y);maxY=Math.max(maxY,y);
  }
  if(maxX<0)return null;
  const x=Math.max(0,minX-margin),y=Math.max(0,minY-margin);
  const r=Math.min(width,maxX+margin+1),b=Math.min(height,maxY+margin+1);
  return {x,y,width:r-x,height:b-y,removed:width*height-(r-x)*(b-y)};
 }
 function quantile(values,p){
  if(!values?.length)return null;
  const sorted=[...values].sort((a,b)=>a-b);
  const i=(sorted.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);
  return sorted[lo]+(sorted[hi]-sorted[lo])*(i-lo);
 }
 function visibleTiles(records,pose,width,height){
  const proj=pose.projectY||.85;
  return records.filter(record=>{
   const t=record.tile;
   const left=width/2+pose.panX+t.x*pose.zoom;
   const top=height/2+pose.panY+t.y*pose.zoom*proj;
   const right=left+t.size*pose.zoom;
   const bottom=top+t.size*pose.zoom*proj;
   return left<width&&top<height&&right>0&&bottom>0;
  });
 }
 function sceneryRect(layer,imgWidth,imgHeight){
  const c=layer.crop||{x:0,y:0,fullWidth:imgWidth,fullHeight:imgHeight};
  return {left:c.x/c.fullWidth,top:c.y/c.fullHeight,
   width:imgWidth/c.fullWidth,height:imgHeight/c.fullHeight};
 }
 return {VARIANTS,idFromKey,tileIndex,choosePairs,cropLayerMetadata,
  resizeLayerMetadata,alphaBounds,quantile,visibleTiles,sceneryRect};
})();

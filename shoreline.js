/* Vedras Reiche – Shoreline renderer v0.10.5
 * Every coastline belongs to a LAND hex; a side is wet iff its axial neighbor
 * is water. Six side indices exactly match VedrasAutotile.DIRS and hexPoints.
 * One world-space RGBA MAX-alpha union avoids overpaint/dark wedges where
 * adjacent shore segments meet. Nothing is clipped to the land hex polygon;
 * the beach extends both into the LAND and the WATER side.
 */
'use strict';
window.VedrasShoreline=(()=>{
 const HEX=256,R=HEX/Math.sqrt(3),DIRS=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];
 const pos=c=>({x:HEX*(c.q+c.r/2),y:1.5*R*c.r});
 const key=c=>`${c.q},${c.r}`;
 const vertices=c=>{const p=pos(c);return Array.from({length:6},(_,i)=>{const a=-Math.PI/2+i*Math.PI/3;return {x:p.x+R*Math.cos(a),y:p.y+R*Math.sin(a)};});};
 function segments(cells,isWet,skipEdges=new Set()){
  const lookup=new Map(cells.map(c=>[key(c),c])),out=[];
  for(const c of cells){if(isWet(c))continue;
   for(let side=0;side<6;side++){
    const [dq,dr]=DIRS[side],n=lookup.get(`${c.q+dq},${c.r+dr}`);
    if(n&&isWet(n)&&!skipEdges.has(key(c)+':'+side)){
     const v=vertices(c),a=v[side],b=v[(side+1)%6],u=pos(c),w=pos(n);
     // The shared edge's midpoint is the midpoint of the land/water centres.
     out.push({cell:c,water:n,side,a,b,mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},center:u,waterCenter:w});
    }
   }
  }
  return out;
 }
 function drawTemporary(ctx,seg,options){
  // World units are represented as pixels inside a 512 x 512 logical sprite.
  const a={x:seg.a.x-seg.center.x+256,y:seg.a.y-seg.center.y+256},
        b={x:seg.b.x-seg.center.x+256,y:seg.b.y-seg.center.y+256};
  const width=Math.max(18,Math.min(64,Number(options.width)||34)),outer=Math.max(0,Math.min(24,Number(options.outer)||10));
  const n={x:(seg.waterCenter.x-seg.center.x)/HEX,y:(seg.waterCenter.y-seg.center.y)/HEX};
  const stroke=(shift,w,color)=>{ctx.beginPath();ctx.moveTo(a.x+n.x*shift,a.y+n.y*shift);ctx.lineTo(b.x+n.x*shift,b.y+n.y*shift);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=w;ctx.strokeStyle=color;ctx.stroke();};
  // Landward sand + seaward pale wash + surf at their join.
  stroke(-width*.14,width+outer,'rgba(212,190,143,0.40)');
  stroke(-width*.12,width*.68+outer*.5,'rgba(230,215,176,0.78)');
  stroke(outer*.24,outer+7,'rgba(73,183,189,0.45)');
  stroke(0,3,'rgba(253,249,231,0.88)');
 }
 function build(cells,isWet,images,options={}){
  // Keep ALL real coast edges, including the river mouth's host edge.
  // Only a small local aperture is feathered out where water crosses it.
  const bbox=options.bounds||null;
  const allSegments=options.segments||segments(cells,isWet);
  const segs=bbox?allSegments.filter(s=>
   s.center.x>=bbox.x-260&&s.center.x<=bbox.x+bbox.width+260&&
   s.center.y>=bbox.y-260&&s.center.y<=bbox.y+bbox.height+260):allSegments;
  const portals=Array.isArray(options.mouthPortals)?options.mouthPortals:[],
   density=Math.max(.8,Math.min(2.0,Number(options.resolution)||1.35));
  if(!segs.length)return {segments:segs,canvas:null,missing:0};
  // The large full-hex+bleed square can overrun outer map edges.
  let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  for(const c of cells){const p=pos(c);left=Math.min(left,p.x-260);right=Math.max(right,p.x+260);top=Math.min(top,p.y-260);bottom=Math.max(bottom,p.y+260);}
  if(bbox){
   left=Math.floor(bbox.x);top=Math.floor(bbox.y);
   right=Math.ceil(bbox.x+bbox.width);bottom=Math.ceil(bbox.y+bbox.height);
  }else{
   left=Math.floor(left);top=Math.floor(top);right=Math.ceil(right);bottom=Math.ceil(bottom);
  }
  // All shoreline chunks share one world-space texel lattice, also at .8x.
  const leftPx=Math.floor(left*density),topPx=Math.floor(top*density),
   rightPx=Math.ceil(right*density),bottomPx=Math.ceil(bottom*density);
  left=leftPx/density;top=topPx/density;
  right=rightPx/density;bottom=bottomPx/density;
  const width=rightPx-leftPx,height=bottomPx-topPx;
  const output=document.createElement('canvas');output.width=width;output.height=height;
  const outContext=output.getContext('2d',{willReadFrequently:true});
  const result=outContext.createImageData(width,height),dst=result.data;
  const tileSize=Math.ceil(512*density),scratch=document.createElement('canvas');scratch.width=scratch.height=tileSize;
  const sc=scratch.getContext('2d',{willReadFrequently:true});
  let missing=0;
  for(const s of segs){
   const asset=images?.[s.side];sc.clearRect(0,0,tileSize,tileSize);
   if(options.mode==='art'&&asset?.naturalWidth){sc.drawImage(asset,0,0,tileSize,tileSize);}else{
    if(options.mode==='art')missing++;
    sc.save();sc.scale(density,density);drawTemporary(sc,s,options);sc.restore();
   }
   const src=sc.getImageData(0,0,tileSize,tileSize).data;
   const originX=Math.round((s.center.x-256)*density)-leftPx,
    originY=Math.round((s.center.y-256)*density)-topPx;
   const startY=Math.max(0,-originY),endY=Math.min(tileSize,height-originY),startX=Math.max(0,-originX),endX=Math.min(tileSize,width-originX);
   // MAX-alpha union, never source-over: two shores meeting at a vertex do not
   // darken, lighten or create a double-thickness patch at their shared corner.
   for(let y=startY;y<endY;y++){
    let si=(y*tileSize+startX)*4,di=((originY+y)*width+originX+startX)*4;
    for(let x=startX;x<endX;x++,si+=4,di+=4){
     if(src[si+3]>dst[di+3]){dst[di]=src[si];dst[di+1]=src[si+1];dst[di+2]=src[si+2];dst[di+3]=src[si+3];}
    }
   }
  }

  // A curved opening in the existing beach follows the ACTUAL land-to-water
  // normal of the last hex side; do not abruptly clip an entire coastal edge.
  // Both side and depth feathers converge on the river, avoiding shore bands.
  for(const portal of portals){
   const host=cells.find(c=>c.q===portal.landQ&&c.r===portal.landR);
   if(!host||!Number.isInteger(portal.side)||portal.side<0||portal.side>=6)continue;
   const [dq,dr]=DIRS[portal.side],land=pos(host),
    water=pos({q:host.q+dq,r:host.r+dr});
   const dx=water.x-land.x,dy=water.y-land.y,len=Math.hypot(dx,dy)||1;
   const nx=dx/len,ny=dy/len,tx=-ny,ty=nx;
   const riverWidth=Math.max(12,Math.min(70,Number(portal.width)||32)),
    core=riverWidth/2+4,blend=Math.max(15,Math.min(36,Number(options.width||34)*.68)),
    outer=core+blend;
   const inland=Math.max(22,Number(options.width||34)+9),
    seaward=Math.max(25,Number(options.outer||10)+30);
   const px=Math.round(portal.x*density)-leftPx,py=Math.round(portal.y*density)-topPx,
    reach=Math.ceil(Math.max(outer,inland,seaward)*density)+2;
   for(let iy=Math.max(0,py-reach);iy<Math.min(height,py+reach);iy++){
    const wy=top+(iy+.5)/density-portal.y;
    for(let ix=Math.max(0,px-reach);ix<Math.min(width,px+reach);ix++){
     const wx=left+(ix+.5)/density-portal.x,
      along=Math.abs(wx*tx+wy*ty),across=wx*nx+wy*ny;
     if(along>=outer||across<=-inland||across>=seaward)continue;
     const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
     const side=1-smooth((along-core)/blend);
     const fromLand=smooth((across+inland)/(inland*.45));
     const fromSea=1-smooth((across-(seaward-seaward*.45))/(seaward*.45));
     const aperture=side*fromLand*fromSea;
     const alpha=(iy*width+ix)*4+3;
     dst[alpha]=Math.round(dst[alpha]*(1-aperture));
    }
   }
  }
  outContext.putImageData(result,0,0);
  return {canvas:output,x:left,y:top,width:right-left,height:bottom-top,segments:segs,missing,mouthPortals:portals.length};
 }
 return {DIRS,segments,vertices,pos,build};
})();
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
  const segs=segments(cells,isWet),portals=Array.isArray(options.mouthPortals)?options.mouthPortals:[],
   density=Math.max(.8,Math.min(2.0,Number(options.resolution)||1.35));
  if(!segs.length)return {segments:segs,canvas:null,missing:0};
  // The large full-hex+bleed square can overrun outer map edges.
  let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  for(const c of cells){const p=pos(c);left=Math.min(left,p.x-260);right=Math.max(right,p.x+260);top=Math.min(top,p.y-260);bottom=Math.max(bottom,p.y+260);}
  left=Math.floor(left);top=Math.floor(top);right=Math.ceil(right);bottom=Math.ceil(bottom);
  const width=Math.ceil((right-left)*density),height=Math.ceil((bottom-top)*density);
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
   const originX=Math.round((s.center.x-256-left)*density),originY=Math.round((s.center.y-256-top)*density);
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
  // Gradually reveal the river THROUGH the existing beach. Removing
  // the entire shoreline EDGE made the source water hex lose its coast.
  // This anisotropic aperture follows the correct side tangent/normal.
  for(const portal of portals){
   const host=cells.find(c=>c.q===portal.landQ&&c.r===portal.landR);
   if(!host||!Number.isInteger(portal.side)||portal.side<0||portal.side>=6)continue;
   const end=vertices(host),a=end[portal.side],b=end[(portal.side+1)%6];
   const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
   const tx=dx/len,ty=dy/len,nx=-ty,ny=tx;
   const base=Math.max(12,Math.min(70,Number(portal.width)||32));
   const half=base*.5,core=half+2,edge=half+28,depth=base*.70+25;
   const px=Math.round((portal.x-left)*density),py=Math.round((portal.y-top)*density);
   const reach=Math.ceil(Math.max(edge,depth)*density);
   for(let iy=Math.max(0,py-reach);iy<Math.min(height,py+reach);iy++){
    const wy=top+(iy+.5)/density-portal.y;
    for(let ix=Math.max(0,px-reach);ix<Math.min(width,px+reach);ix++){
     const wx=left+(ix+.5)/density-portal.x,along=Math.abs(wx*tx+wy*ty),across=Math.abs(wx*nx+wy*ny);
     if(along>=edge||across>=depth)continue;
     const t=Math.max(0,Math.min(1,(along-core)/Math.max(1,edge-core)));
     const feather=t*t*(3-2*t);
     const transverse=Math.max(0,Math.min(1,(depth-across)/(depth*.27)));
     const passage=(1-feather)*transverse;
     const alphaIndex=(iy*width+ix)*4+3;
     dst[alphaIndex]=Math.round(dst[alphaIndex]*(1-passage));
    }
   }
  }
  outContext.putImageData(result,0,0);
  return {canvas:output,x:left,y:top,width:right-left,height:bottom-top,segments:segs,missing,mouthPortals:portals.length};
 }
 return {DIRS,segments,vertices,pos,build};
})();
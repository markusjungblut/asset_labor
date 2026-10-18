/* Vedras Reiche – Auto-Tiling v0.8 (viewer proof of concept).
 * Geometry is shared by all terrain; one continuous world-space pixel field
 * replaces per-hex antialias and two independent edge overlays.
 * The canonical edge is the perpendicular bisector of two hex centres.
 * Each material's contribution uses compact-support, normalized weights.
 * Exactly at a two-material boundary: 50/50. At triple junction: 1/3 each.
 * Objects/shadows and projected depth remain separate.
 */
'use strict';
window.VedrasAutotile = (() => {
 const HEX=256,R=HEX/Math.sqrt(3),DIRS=[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];
 const vtx=Array.from({length:6},(_,i)=>{const a=-Math.PI/2+i*Math.PI/3;return [R*Math.cos(a),R*Math.sin(a)];});
 const cache=new Map();
 function pos(q,r){return {x:HEX*(q+r/2),y:1.5*R*r};}
 function k(q,r){return `${q},${r}`;}
 function hashText(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
 function graph(cells,biomeOf,textureOf,opts={}){
  const lookup=new Map(cells.map(c=>[k(c.q,c.r),c]));
  const directed=[],seams=[],corners=[],cornerSeen=new Set();
  for(const c of cells){
   for(let side=0;side<6;side++){
    const [dq,dr]=DIRS[side],n=lookup.get(k(c.q+dq,c.r+dr));if(!n)continue;
    const from=textureOf(c),to=textureOf(n),biomeChange=biomeOf(c)!==biomeOf(n);
    const variantChange=from?.path!==to?.path;
    if(!biomeChange&&!(opts.blendVariants&&variantChange))continue;
    const id=[k(c.q,c.r),k(n.q,n.r)].sort().join('|');
    directed.push({c,n,side,edgeId:id,kind:biomeChange?'biome':'variant',variant:hashText(id)%5});
    if(k(c.q,c.r)<k(n.q,n.r))seams.push({c,n,side,edgeId:id,kind:biomeChange?'biome':'variant'});
   }
   for(let vertex=0;vertex<6;vertex++){
    const a=DIRS[vertex],b=DIRS[(vertex+5)%6],n1=lookup.get(k(c.q+a[0],c.r+a[1])),n2=lookup.get(k(c.q+b[0],c.r+b[1]));
    if(!n1||!n2)continue;
    const types=new Set([biomeOf(c),biomeOf(n1),biomeOf(n2)]);if(types.size!==3)continue;
    const id=[k(c.q,c.r),k(n1.q,n1.r),k(n2.q,n2.r)].sort().join('|');if(cornerSeen.has(id))continue;
    cornerSeen.add(id);const p=pos(c.q,c.r);corners.push({id,x:p.x+vtx[vertex][0],y:p.y+vtx[vertex][1],types:[...types]});
   }
  }
  return {directed,seams,corners};
 }
 function cubeRound(q,r){let x=q,z=r,y=-q-r;let rx=Math.round(x),ry=Math.round(y),rz=Math.round(z),dx=Math.abs(rx-x),dy=Math.abs(ry-y),dz=Math.abs(rz-z);if(dx>dy&&dx>dz)rx=-ry-rz;else if(dy>dz)ry=-rx-rz;else rz=-rx-ry;return k(rx,rz);}
 function hexAt(x,y){return cubeRound(x/HEX-y/(3*R),2*y/(3*R));}
 function smoother(t){t=Math.max(0,Math.min(1,t));return t*t*t*(t*(6*t-15)+10);}
 function smoothField(x,y){ // coherent, world-anchored, shared by all materials
  return (.62*Math.sin(x*.038+Math.cos(y*.025)*1.3)*Math.sin(y*.029+x*.014)
         +.27*Math.sin(x*.087-y*.042)*Math.cos(y*.075+x*.031)
         +.11*Math.sin(x*.143+y*.094));
 }
 // Every ground/water material uses the same unmodified source pixels.
 // Water can opt into a source-once-per-hex sampler: this never wraps inside
 // a hex, so wrecks, reefs and other recognizable motifs remain intact.
 function texData(a,textureScales){
  const size=clamp(Number(textureScales[a.path]||a.meta?.textureWorldSize)||256,160,1536);
  const w=Math.min(1536,Math.max(512,a.img.naturalWidth)),h=Math.min(1536,Math.max(512,a.img.naturalHeight));
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(a.img,0,0,w,h);
  return {path:a.path,size,pixels:g.getImageData(0,0,w,h).data,width:w,height:h};
 }
 function clamp(n,lo,hi){return Math.max(lo,Math.min(hi,n));}
 function wrap(n,m){return ((n%m)+m)%m;}
 function pixelAt(t,x,y,cell,sampling='repeat'){
  // Hex-local 'cover' sampling: a square source is sampled once without
  // stretching and without a wrap seam. Its shorter axis is cropped slightly.
  // All texels remain original; only a narrow neighborhood of cell edges blends.
  let tx,ty,periodic=sampling!=='hex';
  if(periodic){
   tx=wrap(x/t.size*t.width,t.width);ty=wrap(y/t.size*t.height,t.height);
  }else{
   const cover=Math.max(HEX,2*R,t.size);
   const coordX=.5+(x-cell.x)/cover,coordY=.5+(y-cell.y)/cover;
   tx=clamp(coordX*(t.width-1),0,t.width-1);
   ty=clamp(coordY*(t.height-1),0,t.height-1);
  }
  const x0=Math.floor(tx),y0=Math.floor(ty);
  const x1=periodic?(x0+1)%t.width:Math.min(x0+1,t.width-1);
  const y1=periodic?(y0+1)%t.height:Math.min(y0+1,t.height-1);
  const fx=tx-x0,fy=ty-y0;
  const i=(xx,yy)=>(yy*t.width+xx)*4,d=t.pixels;
  const a=i(x0,y0),b=i(x1,y0),c=i(x0,y1),e=i(x1,y1);
  const w00=(1-fx)*(1-fy),w10=fx*(1-fy),w01=(1-fx)*fy,w11=fx*fy;
  return [d[a]*w00+d[b]*w10+d[c]*w01+d[e]*w11,
          d[a+1]*w00+d[b+1]*w10+d[c+1]*w01+d[e+1]*w11,
          d[a+2]*w00+d[b+2]*w10+d[c+2]*w01+d[e+2]*w11];
 }
 // Shared 2D material field. Every pixel has one normalized partition of unity.
 // No candidate-specific offset: both sides of a shared edge use the same warped point.
 function build(cells,textureOf,typeOf,opts={}){
  const {band=28,blendVariants=true,irregularity=5,blend=true,cornerBlend=true,resolution=1.55,maxPixels=4200000,materialScales={},transitionMode,materialClassOf=()=> 'ground',waterSampling='hex'}=opts;
  const data=[],samples=new Map();
  for(const cell of cells){const a=textureOf(cell);if(!a?.img?.naturalWidth)return null;
   if(!samples.has(a.path))samples.set(a.path,texData(a,materialScales));
   const p=pos(cell.q,cell.r);data.push({...cell,terrainTypeId:typeOf(cell),x:p.x,y:p.y,asset:a,sample:samples.get(a.path),materialClass:materialClassOf(typeOf(cell))});
  }
  let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  for(const c of data){left=Math.min(left,c.x-HEX/2);right=Math.max(right,c.x+HEX/2);top=Math.min(top,c.y-R);bottom=Math.max(bottom,c.y+R);}
  left=Math.floor(left-1);right=Math.ceil(right+1);top=Math.floor(top-1);bottom=Math.ceil(bottom+1);
  let density=clamp(resolution,1,3);const maxPix=Math.max(160000,Math.min(4200000,Number(maxPixels)||4200000));density=Math.min(density,Math.sqrt(maxPix/((right-left)*(bottom-top))));
  const width=Math.ceil((right-left)*density),height=Math.ceil((bottom-top)*density);
  const image=document.createElement('canvas');image.width=width;image.height=height;
  const context=image.getContext('2d',{willReadFrequently:true});const img=context.createImageData(width,height),pixels=img.data;
  const seaCanvas=document.createElement('canvas'),landCanvas=document.createElement('canvas');
  seaCanvas.width=landCanvas.width=width;seaCanvas.height=landCanvas.height=height;
  const seaCtx=seaCanvas.getContext('2d',{willReadFrequently:true}),landCtx=landCanvas.getContext('2d',{willReadFrequently:true});
  const seaImg=seaCtx.createImageData(width,height),landImg=landCtx.createImageData(width,height);
  const lookup=new Map(data.map((c,i)=>[k(c.q,c.r),i]));
  const neighborhood=data.map(c=>{const group=[lookup.get(k(c.q,c.r))];for(const [dq,dr] of DIRS){const j=lookup.get(k(c.q+dq,c.r+dr));if(j!==undefined)group.push(j);}return group;});
  const dist=new Float64Array(data.length),weights=new Float64Array(data.length);
  const b=Math.max(1,Number(band)),irr=Math.min(Number(irregularity)||0,b*.28);
  const hexWater=waterSampling==='hex';
  const same=data.every(c=>c.sample.path===data[0].sample.path)&&!(hexWater&&data.some(c=>c.materialClass==='water'));
  // Identical image paths still have different origins in the hex-local mode.
  // They MUST blend at common edges, otherwise a discontinuity appears there.
  const hasTransition=neighborhood.map((ns,i)=>ns.some(j=>data[i].sample.path!==data[j].sample.path ||
    (hexWater&&data[i].materialClass==='water'&&data[j].materialClass==='water')));
  function canMix(first,second){
   if(first.terrainTypeId===second.terrainTypeId){
    if(hexWater&&first.materialClass==='water'&&first.sample.path===second.sample.path)return true;
    return blendVariants;
   }
   return !transitionMode||['soft_ground','soft_water'].includes(transitionMode(first.terrainTypeId,second.terrainTypeId));}
  for(let iy=0;iy<height;iy++){
   const y=top+(iy+.5)/density;
   for(let ix=0;ix<width;ix++){
    const x=left+(ix+.5)/density,idx=lookup.get(hexAt(x,y));if(idx===undefined)continue;
    const p4=(iy*width+ix)*4,selected=data[idx];
    let candidates=[idx],total=1;
    if(blend&&!same&&hasTransition[idx]){
     candidates=neighborhood[idx];
     const offset=irr?smoothField(x,y)*irr:0;
     const wx=x+offset,wy=y+offset*.61; // ONE warp for all candidates, stable in world space
     let min=Infinity;
     for(const ci of candidates){const c=data[ci],dx=wx-c.x,dy=wy-c.y;const d=dx*dx+dy*dy;dist[ci]=d;
      // A land cell must not influence the Voronoi baseline for water-water blending (or vice versa).
      if(ci===idx||canMix(selected,c))min=Math.min(min,d);}
     total=0;
     for(const ci of candidates){
      const cell=data[ci];
      if(ci!==idx&&!canMix(selected,cell)){weights[ci]=0;continue;}
      const delta=(dist[ci]-min)/(2*HEX);
      // compact support: interior is always purely the home material
      const wt=delta>=b?0:smoother(1-delta/b);
      weights[ci]=wt;total+=wt;
     }
     if(total<1e-9){weights[idx]=1;total=1;}
     // No separate edge/corner paint. All present nearest candidates share one sum.
     if(!cornerBlend){const sorted=candidates.filter(i=>weights[i]>0).sort((a,b)=>dist[a]-dist[b]);for(const ci of sorted.slice(2)){total-=weights[ci];weights[ci]=0;}}
    }
    let red=0,green=0,blue=0;
    for(const ci of candidates){const weight=(candidates.length===1?1:weights[ci]/total);if(weight<=0)continue;
     const cell=data[ci],rgb=pixelAt(cell.sample,x,y,cell,hexWater&&cell.materialClass==='water'?'hex':'repeat');
     red+=weight*rgb[0];green+=weight*rgb[1];blue+=weight*rgb[2];
    }
    // The shared blend weights already sum to one. No water-only brightness
    // patch: it can damage a deliberate shipwreck or high-contrast ice motif.
    pixels[p4]=Math.round(red);pixels[p4+1]=Math.round(green);pixels[p4+2]=Math.round(blue);pixels[p4+3]=255;
    // Split according to HOME tile, not blended pixel color: water is always FLAT.
    const dst=(selected.materialClass==='water'||selected.materialClass==='shoreline')?seaImg.data:landImg.data;
    dst[p4]=pixels[p4];dst[p4+1]=pixels[p4+1];dst[p4+2]=pixels[p4+2];dst[p4+3]=255;
   }
  }
  context.putImageData(img,0,0);seaCtx.putImageData(seaImg,0,0);landCtx.putImageData(landImg,0,0);
  const common={x:left,y:top,width:right-left,height:bottom-top,density};
  return {...common,canvas:image,materialCount:samples.size,waterLayer:{...common,canvas:seaCanvas},landLayer:{...common,canvas:landCanvas}};
 }
 function draw(ctx,raster){if(raster)ctx.drawImage(raster.canvas,raster.x,raster.y,raster.width,raster.height);}
 function clearCache(){cache.clear();}
 function drawDebug(ctx,g,{mode='edges',band=28}={}){
  ctx.save();ctx.lineWidth=2;ctx.setLineDash([6,5]);
  if(mode==='weights'){for(const seam of g.seams){const p=pos(seam.c.q,seam.c.r),a=vtx[seam.side],b=vtx[(seam.side+1)%6];ctx.strokeStyle='#58edff';ctx.lineWidth=Math.max(2,band*1.6);ctx.globalAlpha=.2;ctx.beginPath();ctx.moveTo(p.x+a[0],p.y+a[1]);ctx.lineTo(p.x+b[0],p.y+b[1]);ctx.stroke();}ctx.globalAlpha=1;}
  for(const seam of g.seams){const p=pos(seam.c.q,seam.c.r),a=vtx[seam.side],b=vtx[(seam.side+1)%6];ctx.strokeStyle=seam.kind==='variant'?'#7796ff':'#ff8657';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x+a[0],p.y+a[1]);ctx.lineTo(p.x+b[0],p.y+b[1]);ctx.stroke();}
  ctx.setLineDash([]);
  for(const corner of g.corners){ctx.beginPath();ctx.arc(corner.x,corner.y,6,0,Math.PI*2);ctx.fillStyle='#f7d362';ctx.fill();ctx.strokeStyle='#774318';ctx.stroke();}
  ctx.restore();
 }
 return {DIRS,graph,build,draw,drawDebug,clearCache,hexAt,hashText,pixelAt};
})();
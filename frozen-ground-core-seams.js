/* Deterministic 4x Ground border protection and read-only core seam gate.
 * Saved tile gutters may be intentionally empty on the non-owned side:
 * only the exclusive 512-world-unit cores are authoritative for publication.
 * Original source artwork and existing archived PNGs are NEVER modified.
 */
'use strict';
window.VedrasGroundCoreSeams=(()=>{
 const HEX=256,R=HEX/Math.sqrt(3);
 const pct=(n,d)=>d?+(n*100/d).toFixed(3):0;
 const rgbDistance=(a,ai,b,bi)=>
  (Math.abs(a[ai]-b[bi])+Math.abs(a[ai+1]-b[bi+1])+
   Math.abs(a[ai+2]-b[bi+2]))/3;
 function hexId(x,y){
  const rf=y/(1.5*R),qf=x/HEX-rf/2;
  let q=Math.round(qf),r=Math.round(rf),s=Math.round(-qf-rf);
  const dq=Math.abs(q-qf),dr=Math.abs(r-rf),ds=Math.abs(s+qf+rf);
  if(dq>dr&&dq>ds)q=-r-s;
  else if(dr>ds)r=-q-s;
  return q+','+r;
 }
 function cellsSet(cells){
  return new Set((cells||[]).map(c=>c.q+','+c.r));
 }
 function sourceGeometry(width,height,tile,pad){
  const span=tile.size+2*pad;
  const dx=width/span,dy=height/span;
  return {dx,dy,x0:Math.round(pad*dx),
   x1:Math.round((tile.size+pad)*dx),
   y0:Math.round(pad*dy),
   y1:Math.round((tile.size+pad)*dy)};
 }
 function repairEdgeBands(canvas,{tile,pad=3,cells,width=3}={}){
  if(!canvas?.getContext||!tile?.size||!Array.isArray(cells))
   throw Error('Ground-Nahtreparatur: fehlende Weltgeometrie');
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx?.getImageData||!ctx?.putImageData)
   throw Error('Ground-Nahtreparatur: Pixelzugriff nicht möglich');
  const region=cellsSet(cells),g=sourceGeometry(canvas.width,canvas.height,tile,pad);
  const band=Math.max(1,Math.min(6,Math.floor(width)));
  let repaired=0,nearTipRepaired=0,unresolved=0,examined=0;
  // Only a few coordinates are retained: no full-size error bitmap, no
  // history or changes to original PNG files.
  const unresolvedSamples=[];
  const recordUnresolved=(tx,ty,side)=>{
   unresolved++;
   if(unresolvedSamples.length>=5)return;
   const wx=tile.x+(tx+.5)/g.dx-pad,
    wy=tile.y+(ty+.5)/g.dy-pad;
   unresolvedSamples.push({sourceX:tx,sourceY:ty,
    worldX:Math.round(wx*100)/100,worldY:Math.round(wy*100)/100,
    hex:hexId(wx,wy),side});
  };
  // Read/write only tiny strips, not the entire ~14 MiB native 4x raster.
  // Edge guards also cover the two outer gutter pixels used by bilinear
  // sampling; exterior map pixels are left completely transparent.
  function bandRect(x,y,w,h,side){
   x=Math.max(0,x);y=Math.max(0,y);
   w=Math.min(w,canvas.width-x);h=Math.min(h,canvas.height-y);
   if(w<=0||h<=0)return;
   const src=ctx.getImageData(x,y,w,h),data=src.data;
   // Repair donors must be ORIGINAL terrain. Reading newly copied pixels
   // would cascade across a genuinely missing 4x Ground region.
   const original=new Uint8ClampedArray(data);
   const isVertical=side==='left'||side==='right';
   // The 0.5–1x terrain source can miss opaque texels at a narrow HEX TIP.
   // A straight inward search at the same row finds nothing, although
   // real, opaque pixels exist a few rows up/down inside the SAME hex.
   // Search no farther than 24 native-4x pixels (~6 world units) and only
   // within the owned core. Never paint an absent/outside-world hex.
   const tipDonor=(px,py,hex)=>{
    const maxDistance=24,sign=side==='left'||side==='top'?1:-1;
    for(let radius=1;radius<=maxDistance;radius++)
     for(let inward=0;inward<=radius;inward++){
      const tangent=radius-inward;
      for(const tSign of tangent===0?[1]:[-1,1]){
       const cx=isVertical?px+sign*inward:px+tSign*tangent;
       const cy=isVertical?py+tSign*tangent:py+sign*inward;
       if(cx<x||cx>=x+w||cy<y||cy>=y+h||
          cx<g.x0||cx>=g.x1||cy<g.y0||cy>=g.y1)continue;
       const i=((cy-y)*w+(cx-x))*4;
       if(original[i+3]<250)continue;
       const wx=tile.x+(cx+.5)/g.dx-pad,
        wy=tile.y+(cy+.5)/g.dy-pad;
       if(hexId(wx,wy)!==hex)continue;
       return original.subarray(i,i+4);
      }
     }
    return null;
   };
   const count=isVertical?h:w;
   for(let k=0;k<count;k++){
    const px=isVertical?
     (side==='left'?g.x0:g.x1-1):g.x0+k;
    const py=isVertical?g.y0+k:
     (side==='top'?g.y0:g.y1-1);
    const wx=tile.x+(px+.5)/g.dx-pad;
    const wy=tile.y+(py+.5)/g.dy-pad;
    const edgeHex=hexId(wx,wy);
    if(!region.has(edgeHex))continue;
    // Paint from an already opaque interior texel; never invent black
    // terrain at the map boundary. Half-transparent interpolation artifacts
    // are replaced only along internal Ground core joins.
    let donor=-1;
    for(let depth=band;depth<=band+5;depth++){
     const tx=side==='left'?g.x0+depth:
      side==='right'?g.x1-1-depth:px;
     const ty=side==='top'?g.y0+depth:
      side==='bottom'?g.y1-1-depth:py;
     if(tx<0||tx>=canvas.width||ty<0||ty>=canvas.height)break;
     if(tx<x||tx>=x+w||ty<y||ty>=y+h)continue;
     const d=((ty-y)*w+(tx-x))*4;
     if(original[d+3]>=250){donor=original.subarray(d,d+4);break;}
    }
    for(let z=0;z<band;z++){
     const tx=side==='left'?g.x0-1-z:
      side==='right'?g.x1+z:px;
     const ty=side==='top'?g.y0-1-z:
      side==='bottom'?g.y1+z:py;
     if(tx<x||tx>=x+w||ty<y||ty>=y+h)continue;
     const worldX=tile.x+(tx+.5)/g.dx-pad;
     const worldY=tile.y+(ty+.5)/g.dy-pad;
     if(!region.has(hexId(worldX,worldY)))continue;
     examined++;
     const i=((ty-y)*w+(tx-x))*4;
     if(data[i+3]>=250)continue;
     let chosen=donor;
     if(chosen<0){
      chosen=tipDonor(tx,ty,hexId(worldX,worldY));
      if(chosen)nearTipRepaired++;
     }
     if(!chosen){recordUnresolved(tx,ty,side);continue;}
     data[i]=chosen[0];data[i+1]=chosen[1];data[i+2]=chosen[2];
     data[i+3]=255;repaired++;
    }
    // The two innermost core pixels must also be opaque, but never
    // replace valid fully opaque texture colors.
    for(let z=0;z<band;z++){
     const tx=isVertical?
      (side==='left'?g.x0+z:g.x1-1-z):px;
     const ty=isVertical?py:
      (side==='top'?g.y0+z:g.y1-1-z);
     if(tx<x||tx>=x+w||ty<y||ty>=y+h)continue;
     if(!region.has(hexId(tile.x+(tx+.5)/g.dx-pad,
      tile.y+(ty+.5)/g.dy-pad)))continue;
     examined++;
     const i=((ty-y)*w+(tx-x))*4;
     if(data[i+3]>=250)continue;
     let chosen=donor;
     if(chosen<0){
      chosen=tipDonor(tx,ty,hexId(
       tile.x+(tx+.5)/g.dx-pad,
       tile.y+(ty+.5)/g.dy-pad));
      if(chosen)nearTipRepaired++;
     }
     if(!chosen){recordUnresolved(tx,ty,side);continue;}
     if(data[i+3]<128){
      data[i]=chosen[0];data[i+1]=chosen[1];data[i+2]=chosen[2];
     }
     data[i+3]=255;repaired++;
    }
   }
   ctx.putImageData(src,x,y);
  }
  // Vertical guards include full y-core; horizontal guards cover all x-core.
  const reach=24;
  bandRect(g.x0-band,g.y0,band*2+6+reach,Math.max(0,g.y1-g.y0),'left');
  bandRect(g.x1-band-6-reach,g.y0,band*2+6+reach,
   Math.max(0,g.y1-g.y0),'right');
  bandRect(g.x0,g.y0-band,Math.max(0,g.x1-g.x0),band*2+6+reach,'top');
  bandRect(g.x0,g.y1-band-6-reach,Math.max(0,g.x1-g.x0),
   band*2+6+reach,'bottom');
  return {examined,repaired,nearTipRepaired,unresolved,unresolvedSamples,
   policy:'authored-core-only-v1'};
 }
 function measureCore(a,b,{axis,worldA,worldB,dx,dy,worldCells,
  size=512,step=1}={}){
  if(!['x','y'].includes(axis)||!a?.data||!b?.data||
     a.width!==b.width||a.height!==b.height||
     !Number.isFinite(dx)||dx<=0||!Number.isFinite(dy)||dy<=0)
   throw Error('Ungültige Core-Naht-Probe');
  const set=cellsSet(worldCells),count=axis==='x'?a.height:a.width;
  let checked=0,alphaFailures=0,badJumps=0,excessSum=0,
   jumpSum=0,baselineSum=0,sharedStripeRows=0,stripeSum=0;
  for(let n=0;n<count;n+=Math.max(1,step)){
   const wxA=axis==='x'?worldA.x+size-.5/dx:
    worldA.x+(n+.5)/dx;
   const wyA=axis==='y'?worldA.y+size-.5/dy:
    worldA.y+(n+.5)/dy;
   const wxB=axis==='x'?worldB.x+.5/dx:
    worldB.x+(n+.5)/dx;
   const wyB=axis==='y'?worldB.y+.5/dy:
    worldB.y+(n+.5)/dy;
   if(!set.has(hexId(wxA,wyA))||!set.has(hexId(wxB,wyB)))
    continue;
   checked++;
   const iA=axis==='x'?(n*a.width+a.width-1)*4:
    ((a.height-1)*a.width+n)*4;
   const jA=axis==='x'?iA-4:iA-a.width*4;
   const iB=axis==='x'?n*b.width*4:n*4;
   const jB=axis==='x'?iB+4:iB+b.width*4;
   if(a.data[iA+3]<250||b.data[iB+3]<250||
      a.data[jA+3]<250||b.data[jB+3]<250){
    alphaFailures++;continue;
   }
   const jump=rgbDistance(a.data,iA,b.data,iB);
   const baseline=(rgbDistance(a.data,iA,a.data,jA)+
    rgbDistance(b.data,iB,b.data,jB))/2;
   const excess=Math.max(0,jump-baseline);
   jumpSum+=jump;baselineSum+=baseline;excessSum+=excess;
   if(excess>20&&jump>26)badJumps++;
   // Equal-colored neighboring edge pixels can STILL form a bright or
   // dark stripe if BOTH were baked with the same 1-2px fringe. Compare
   // the interface to a deeper in-core reference, not to each other.
   const depth=axis==='x'?Math.min(a.width-1,5):
    Math.min(a.height-1,5);
   if(depth>=3){
    const dA=axis==='x'?iA-depth*4:iA-depth*a.width*4;
    const dB=axis==='x'?iB+depth*4:iB+depth*b.width*4;
    if(a.data[dA+3]>=250&&b.data[dB+3]>=250){
     const light=(data,i)=>(data[i]+data[i+1]+data[i+2])/3;
     const contrast=(light(a.data,iA)+light(b.data,iB)-
      light(a.data,dA)-light(b.data,dB))/2;
     stripeSum+=Math.abs(contrast);
     if(Math.abs(contrast)>30)sharedStripeRows++;
    }
   }
  }
  const good=checked-alphaFailures;
  const alphaRate=pct(alphaFailures,checked),jumpRate=pct(badJumps,good),
   sharedStripePct=pct(sharedStripeRows,good),
   meanStripeContrast=good?+(stripeSum/good).toFixed(3):0,
   meanExcess=good?+(excessSum/good).toFixed(3):0;
  // Hard fail only on a substantial persistent line or missing terrain.
  // A natural one-pixel texture transition is not a 512-unit-wide seam.
  const failure=checked>0&&(alphaRate>0.25||
   (good>=16&&jumpRate>12&&meanExcess>11)||
   (good>=16&&sharedStripePct>35&&meanStripeContrast>24));
  return {checked,alphaFailures,alphaRate,badJumps,jumpRate,
   sharedStripeRows,sharedStripePct,meanStripeContrast,
   meanJump:good?+(jumpSum/good).toFixed(3):null,
   meanBaseline:good?+(baselineSum/good).toFixed(3):null,
   meanExcess,verdict:checked===0?'outside-authored-world':
    failure?'real-core-seam':'core-border-verified',failure};
 }
 async function auditSaved(scene,store,tiles,cells,{onProgress=()=>{}}={}){
  if(!/^v1-[0-9a-f]{8}$/.test(scene)||!store?.get||
   !Array.isArray(tiles)||!Array.isArray(cells))
   throw Error('Ungültige 4×-Nahtprüfung');
  const byPos=new Map(tiles.map(t=>[t.x+','+t.y,t]));
  const pairs=[];
  for(const t of tiles)for(const [offX,offY,axis] of
   [[512,0,'x'],[0,512,'y']]){
   const other=byPos.get((t.x+offX)+','+(t.y+offY));
   if(other)pairs.push({a:t,b:other,axis});
  }
  const results=[];
  for(const pair of pairs){
   let first=null,second=null;
   try{
    const records=await Promise.all([pair.a,pair.b].map(t=>
     store.get(scene+'|near|'+t.id)));
    if(records.some(r=>!r?.layers))throw Error('Fehlende Nachbar-PNG');
    const layers=records.map(r=>r.layers.find(x=>x.layer==='ground'));
    if(layers.some(x=>!(x?.png instanceof Blob)||x.pad!==3))
     throw Error('Ground-PNG/3er-Gutter fehlt');
    const headers=await Promise.all(layers.map(async layer=>{
     const bytes=new DataView(await layer.png.slice(0,24).arrayBuffer());
     return {w:bytes.getUint32(16),h:bytes.getUint32(20)};
    }));
    if(headers[0].w!==headers[1].w||
       headers[0].h!==headers[1].h)throw Error('Quellauflösungen weichen ab');
    const geom=sourceGeometry(headers[0].w,headers[0].h,pair.a,3);
    const w=pair.axis==='x'?6:geom.x1-geom.x0;
    const h=pair.axis==='y'?6:geom.y1-geom.y0;
    const rectA={x:pair.axis==='x'?geom.x1-6:geom.x0,
     y:pair.axis==='y'?geom.y1-6:geom.y0,w,h};
    const rectB={x:geom.x0,y:geom.y0,w,h};
    first=await createImageBitmap(layers[0].png,
     rectA.x,rectA.y,rectA.w,rectA.h);
    second=await createImageBitmap(layers[1].png,
     rectB.x,rectB.y,rectB.w,rectB.h);
    function read(img){
     const canvas=document.createElement('canvas');
     canvas.width=img.width;canvas.height=img.height;
     const g=canvas.getContext('2d',{willReadFrequently:true});
     if(!g)throw Error('Read-only Pixelkontext fehlt');
     g.drawImage(img,0,0);
     return {data:g.getImageData(0,0,canvas.width,canvas.height).data,
      width:canvas.width,height:canvas.height};
    }
    const metrics=measureCore(read(first),read(second),{
     axis:pair.axis,worldA:pair.a,worldB:pair.b,
     dx:geom.dx,dy:geom.dy,worldCells:cells});
    results.push({pair:[pair.a.id,pair.b.id],...metrics});
   }catch(e){
    results.push({pair:[pair.a.id,pair.b.id],failure:true,
     verdict:'unverifiable',error:String(e?.message||e)});
   }finally{first?.close?.();second?.close?.();}
   onProgress(results.length,pairs.length,results.at(-1));
  }
  return {scene,pairs:results,checked:results.length,
   failures:results.filter(x=>x.failure),
   complete:results.every(x=>!x.failure),policy:'owned-core-4x-v1'};
 }
 return {hexId,sourceGeometry,repairEdgeBands,measureCore,auditSaved};
})();

/* Read-only seam audit for independently baked 4x Ground PNGs.
 * Compares the same world-coordinate 3-unit gutter in neighboring tiles.
 * No IndexedDB writes, no map rerender, no canvas/scene modification. */
'use strict';
((root)=>{
 const PAIRS=[['-1,0','0,0'],['5,-1','5,0'],
  ['-3,-5','-2,-5'],['-6,0','-5,0'],['2,-5','2,-4']];
 function comparePixels(a,b,width,height,axis){
  if(!Number.isInteger(width)||!Number.isInteger(height)||
     width<2||height<2||a.length!==b.length||
     a.length!==width*height*4||
     (axis!=='x'&&axis!=='y'))throw Error('Ungültige Bodennaht-Probe');
  let sum=0,changed=0,alphaWeak=0,points=0;
  const center=Math.floor((axis==='x'?width:height)/2);
  let centerSum=0,edgeSum=0,nCenter=0,nEdge=0;
  const coordinate=(i)=>axis==='x'?i%width:Math.floor(i/width);
  for(let i=0;i<width*height;i++){
   const j=i*4;
   const d=(Math.abs(a[j]-b[j])+Math.abs(a[j+1]-b[j+1])+
    Math.abs(a[j+2]-b[j+2]))/3;
   sum+=d;changed+=d>12?1:0;
   if(a[j+3]<240||b[j+3]<240)alphaWeak++;
   const c=coordinate(i);
   // A dark (or bright) stripe shared by BOTH PNGs can escape a
   // source-difference test. Measure center-vs-neighbor contrast as well.
   const light=(a[j]+a[j+1]+a[j+2])/3;
   if(Math.abs(c-center)<=1){centerSum+=light;nCenter++;}
   else if(Math.abs(c-center)>=4&&Math.abs(c-center)<=7){
    edgeSum+=light;nEdge++;
   }
   points++;
  }
  return {pixelsCompared:points,
   meanRgbDifference:+(sum/points).toFixed(3),
   differentPct:+(100*changed/points).toFixed(2),
   transparentPct:+(100*alphaWeak/points).toFixed(2),
   centerBrightnessDelta:nCenter&&nEdge?
    +(centerSum/nCenter-edgeSum/nEdge).toFixed(3):null};
 }
 const decode=async(blob)=>createImageBitmap(blob);
 function strip(bitmap,x,y,width,height){
  const canvas=document.createElement('canvas');
  canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw Error('Canvas-Pixelprüfung nicht verfügbar');
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(bitmap,x,y,width,height,0,0,width,height);
  return ctx.getImageData(0,0,width,height).data;
 }
 async function audit(scene,store,{pairs=PAIRS,progress=()=>{}}={}){
  if(!/^v1-[0-9a-f]{8}$/.test(scene)||!store?.get)
   throw Error('Ungültige Kartenszene oder IndexedDB-Speicher');
  const result={scene,createdAt:new Date().toISOString(),
   source:'original saved PNGs via readonly IndexedDB get',
   scope:'exact common world-coordinate gutter (not a 4x-camera benchmark)',
   pairs:[],summary:null};
  for(const pair of pairs){
   const [idA,idB]=pair;
   const keys=pair.map(id=>scene+'|near|'+id);
   const records=await Promise.all(keys.map(k=>store.get(k)));
   if(records.some(r=>!r?.layers)){
    result.pairs.push({pair,status:'missing-ground-record'});continue;
   }
   const layers=records.map(r=>r.layers.find(l=>
    l.layer==='ground'||l.layer==='terrain'));
   if(layers.some(l=>!l?.png||!(l.pad>0))){
    result.pairs.push({pair,status:'no-source-gutter'});continue;
   }
   const [left,right]=records.map(r=>r.tile);
   const xAdjacent=right.x-left.x===512&&right.y===left.y;
   const yAdjacent=right.y-left.y===512&&right.x===left.x;
   if(!xAdjacent&&!yAdjacent){
    result.pairs.push({pair,status:'not-adjacent'});continue;
   }
   let bitmapA=null,bitmapB=null;
   try{
    bitmapA=await decode(layers[0].png);
    bitmapB=await decode(layers[1].png);
    const pad=Math.min(layers[0].pad,layers[1].pad);
    const s=left.size||512,
     dXA=bitmapA.width/(s+2*layers[0].pad),
     dXB=bitmapB.width/(s+2*layers[1].pad),
     dYA=bitmapA.height/(s+2*layers[0].pad),
     dYB=bitmapB.height/(s+2*layers[1].pad);
    if(Math.abs(dXA-dXB)>.025||Math.abs(dYA-dYB)>.025){
     result.pairs.push({pair,status:'different-source-density',
      first:[bitmapA.width,bitmapA.height],
      second:[bitmapB.width,bitmapB.height]});continue;
    }
    const axis=xAdjacent?'x':'y';
    const width=axis==='x'?Math.max(2,Math.round(pad*2*dXA)):
     Math.max(2,Math.round(s*dXA));
    const height=axis==='y'?Math.max(2,Math.round(pad*2*dYA)):
     Math.max(2,Math.round(s*dYA));
    const aX=axis==='x'?Math.round((s+layers[0].pad-pad)*dXA):
     Math.round(layers[0].pad*dXA);
    const aY=axis==='y'?Math.round((s+layers[0].pad-pad)*dYA):
     Math.round(layers[0].pad*dYA);
    const bX=Math.round((layers[1].pad-pad)*dXB)+
     (axis==='y'?Math.round(pad*dXB):0);
    const bY=Math.round((layers[1].pad-pad)*dYB)+
     (axis==='x'?Math.round(pad*dYB):0);
    if(aX+width>bitmapA.width||aY+height>bitmapA.height||
       bX+width>bitmapB.width||bY+height>bitmapB.height)
     throw Error('Boden-Gutter-Lage außerhalb der gespeicherten PNGs');
    const a=strip(bitmapA,aX,aY,width,height),
     b=strip(bitmapB,bX,bY,width,height);
    const metrics=comparePixels(a,b,width,height,axis);
    result.pairs.push({pair,status:'compared',axis,pad,
     sourcePixels:[bitmapA.width,bitmapA.height],
     overlapPixels:[width,height],...metrics,
     interpretation:metrics.differentPct>15?
      'saved-neighbor-PNGs-disagree':
      'saved-neighbor-PNGs-largely-agree; inspect baked stripe and viewer composition'});
   }catch(error){
    result.pairs.push({pair,status:'readback-error',
     error:String(error?.message||error).slice(0,180)});
   }finally{
    bitmapA?.close?.();bitmapB?.close?.();
   }
   progress(result.pairs.length,pairs.length);
  }
  const valid=result.pairs.filter(x=>x.status==='compared');
  result.summary={compared:valid.length,total:pairs.length,
   likelySourceMismatch:valid.filter(x=>x.differentPct>15).length,
   warning:valid.length<pairs.length?'Not all chosen pairs were measurable':null,
   verdict:'This audit separates independent source mismatch from viewer-side image stitching. A source-matching pair may still contain a shared baked stripe.'};
  return result;
 }
 root.VedrasFrozenSeamAudit={audit,comparePixels,PAIRS};
})(window);

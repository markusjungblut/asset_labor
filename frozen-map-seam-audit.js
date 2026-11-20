/* Read-only seam audit for independently baked 4x Ground PNGs.
 * Compares the same world-coordinate 3-unit gutter in neighboring tiles.
 * No IndexedDB writes, no map rerender, no canvas/scene modification. */
'use strict';
((root)=>{
 const PAIRS=[['-1,0','0,0'],['5,-1','5,0'],
  ['-3,-5','-2,-5'],['-6,0','-5,0'],['2,-5','2,-4']];
 function pairsForView(view,known=[],limit=12){
  if(!view||![view.zoom,view.panX,view.panY,view.width,view.height]
    .every(Number.isFinite)||view.zoom<=0)return [];
  const z=view.zoom,py=view.projectY||.85,
   minX=(-view.width/2-view.panX)/z,
   maxX=(view.width/2-view.panX)/z,
   minY=(-view.height/2-view.panY)/(z*py),
   maxY=(view.height/2-view.panY)/(z*py),
   centerX=-view.panX/z,centerY=-view.panY/(z*py);
  // Only audit actual stored neighbors that touch the CURRENT viewport.
  // Do not decode arbitrary distant pairs that cannot explain a seam on
  // the user's screen at 400% zoom.
  const ids=new Set([...known].map(k=>String(k).split('|').at(-1)));
  const present=(x,y)=>ids.has(x+','+y);
  const found=[];
  const x0=Math.floor(minX/512)-1,x1=Math.ceil(maxX/512),
   y0=Math.floor(minY/512)-1,y1=Math.ceil(maxY/512);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   if(!present(x,y))continue;
   const id=x+','+y;
   if(present(x+1,y)&&Math.abs((x+1)*512-centerX)<=
      view.width/(2*z)+6)
    found.push({pair:[id,(x+1)+','+y],
     distance:((x+1)*512-centerX)**2+((y+.5)*512-centerY)**2});
   if(present(x,y+1)&&Math.abs((y+1)*512-centerY)<=
      view.height/(2*z*py)+6)
    found.push({pair:[id,x+','+(y+1)],
     distance:((x+.5)*512-centerX)**2+((y+1)*512-centerY)**2});
  }
  return found.sort((a,b)=>a.distance-b.distance)
   .slice(0,Math.min(24,Math.max(1,limit))).map(v=>v.pair);
 }
 function comparePixels(a,b,width,height,axis){
  if(!Number.isInteger(width)||!Number.isInteger(height)||
     width<2||height<2||a.length!==b.length||
     a.length!==width*height*4||
     (axis!=='x'&&axis!=='y'))throw Error('Ungültige Bodennaht-Probe');
  // A transparent PNG pixel can contain arbitrary RGB. Counting it as a
  // visible difference produced false 91%-mismatch alarms on empty edges.
  let rawSum=0,rawChanged=0,transparent=0,
   comparable=0,visibleSum=0,visibleChanged=0,
   alphaMismatch=0,partial=0,centerSum=0,edgeSum=0,
   nCenter=0,nEdge=0;
  const count=width*height,mid=Math.floor((axis==='x'?width:height)/2);
  for(let i=0;i<count;i++){
   const j=i*4,aa=a[j+3],ba=b[j+3],
    rgb=(Math.abs(a[j]-b[j])+Math.abs(a[j+1]-b[j+1])+
     Math.abs(a[j+2]-b[j+2]))/3;
   rawSum+=rgb;if(rgb>12)rawChanged++;
   if(aa<240||ba<240)transparent++;
   if(aa!==255||ba!==255)partial++;
   if(Math.abs(aa-ba)>16)alphaMismatch++;
   // Only compare RGB where both fragments contribute an opaque pixel.
   // Alpha disagreement is recorded separately, not swept under the rug.
   if(aa<240||ba<240)continue;
   comparable++;visibleSum+=rgb;
   if(rgb>12)visibleChanged++;
   const c=axis==='x'?i%width:Math.floor(i/width),
    light=(a[j]+a[j+1]+a[j+2]+b[j]+b[j+1]+b[j+2])/6;
   if(Math.abs(c-mid)<=1){centerSum+=light;nCenter++;}
   else if(Math.abs(c-mid)>=4&&Math.abs(c-mid)<=7){
    edgeSum+=light;nEdge++;
   }
  }
  const pct=n=>+(100*n/count).toFixed(2);
  return {pixelsCompared:count,
   // Keep original fields to make old-vs-new JSON comparison possible.
   meanRgbDifference:+(rawSum/count).toFixed(3),
   differentPct:pct(rawChanged),transparentPct:pct(transparent),
   // Ground composition can only show these RGB disagreements.
   opaquePixelsCompared:comparable,
   opaqueCoveragePct:pct(comparable),
   opaqueMeanRgbDifference:comparable?
    +(visibleSum/comparable).toFixed(3):null,
   opaqueDifferentPct:comparable?
    +(100*visibleChanged/comparable).toFixed(2):null,
   alphaMismatchPct:pct(alphaMismatch),
   partialAlphaPct:pct(partial),
   centerBrightnessDelta:nCenter>=16&&nEdge>=16?
    +(centerSum/nCenter-edgeSum/nEdge).toFixed(3):null};
 }
 function classify(metrics){
  // In a largely empty strip, raw RGB mismatch is meaningless. Mark
  // under-covered samples inconclusive instead of accusing source PNGs.
  if(metrics.opaquePixelsCompared<256&&metrics.alphaMismatchPct<1)
   return 'insufficient-visible-ground';
  // An exclusive-core Ground tile deliberately clips its 3-unit gutter
  // to its own 512-unit owner. Raw gutter alpha mismatch is not proof of
  // a visible seam: only the two actual core edge pixel rows can decide.
  if(metrics.alphaMismatchPct>2)return 'gutter-alpha-ownership-unverified';
  if(metrics.opaquePixelsCompared>=256&&metrics.opaqueDifferentPct>15)
   return 'saved-neighbor-visible-RGB-differs';
  if(metrics.opaquePixelsCompared<256)
   return 'insufficient-visible-ground';
  if(metrics.centerBrightnessDelta!==null&&
     metrics.centerBrightnessDelta< -12)
   return 'possible-shared-baked-dark-stripe';
  return 'visible-ground-overlap-matches; test viewer composition';
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
     interpretation:classify(metrics)});
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
   likelySourceMismatch:valid.filter(x=>
    x.interpretation==='saved-neighbor-visible-RGB-differs').length,
   gutterAlphaCandidates:valid.filter(x=>
    x.interpretation==='gutter-alpha-ownership-unverified').length,
   insufficientVisibleGround:valid.filter(x=>
    x.interpretation==='insufficient-visible-ground').length,
   bakedStripeCandidates:valid.filter(x=>
    x.interpretation==='possible-shared-baked-dark-stripe').length,
   warning:valid.length<pairs.length?'Not all chosen pairs were measurable':null,
   verdict:'Raw gutter alpha can be intentionally split by 512-unit clip ownership. The owned-core pixel audit, not raw gutter coverage, determines a visible Ground seam.'};
  return result;
 }
 root.VedrasFrozenSeamAudit={audit,comparePixels,classify,PAIRS,pairsForView};
})(window);

/* Step 19 – opt-in local A/B benchmark. Reads v1-0374527a from the
 * existing IndexedDB ONLY; transformed PNGs stay in an ephemeral memoryStore.
 * No calls to capture(), saveManifest(), or source storage.put().
 */
'use strict';
(async()=>{
 const core=window.VedrasAtlasBenchmarkCore,Frozen=window.VedrasFrozenMap;
 const $=id=>document.getElementById(id);
 const params=new URLSearchParams(location.search);
 const scene=params.get('scene')||'v1-0374527a',level='near';
 const status=$('status'),samples=$('samples'),results=$('results'),
  canvas=$('preview'),runButton=$('run'),downloadButton=$('download');
 let stopped=false,running=false,source=null,records=[],pairs=[],report=null;
 const start=()=>performance.now();
 const tick=()=>new Promise(resolve=>requestAnimationFrame(resolve));
 const idle=()=>new Promise(resolve=>setTimeout(resolve,0));
 const round=n=>Number.isFinite(n)?Math.round(n*100)/100:null;
 const mb=n=>round(n/1048576);
 const msg=message=>{status.textContent=message;};
 const fail=error=>{msg('Benchmarkfehler: '+String(error?.message||error));console.error(error);};
 const makeImage=async blob=>{
  if(typeof createImageBitmap==='function')return await createImageBitmap(blob);
  throw Error('Firefox/createImageBitmap zur Bilddekodierung erforderlich');
 };
 const encode=(cv,type,quality)=>{
  return new Promise((resolve,reject)=>cv.toBlob(blob=>{
   if(!blob)return reject(Error('Bildkodierung fehlgeschlagen: '+type));
   if(type==='image/webp'&&blob.type!=='image/webp')
    return reject(Error('WebP-Encoder in diesem Browser nicht verfügbar'));
   resolve(blob);
  },type,quality));
 };
 const canvasFor=(w,h)=>{
  const cv=document.createElement('canvas');
  cv.width=Math.max(1,Math.round(w));cv.height=Math.max(1,Math.round(h));
  const ctx=cv.getContext('2d',{alpha:true,willReadFrequently:true});
  if(!ctx)throw Error('Kein Canvas-2D-Kontext');
  return {cv,ctx};
 };
 function stopIfNeeded(){if(stopped)throw Error('Vom Benutzer abgebrochen');}
 async function hashBlob(blob){
  if(typeof crypto==='undefined'||!crypto.subtle?.digest)return null;
  const bytes=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());
  return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
 }
 async function inspectOriginal(){
  if(!/^v1-[a-f0-9]{8}$/.test(scene))throw Error('Ungültige Szenenkennung');
  const sourceViewer=Frozen.create({canvas:document.createElement('canvas')});
  source=sourceViewer.storage;
  const m=await sourceViewer.loadManifest(scene);
  if(!m.levels.includes(level))throw Error('Diese Szene enthält kein near-LOD');
  const keys=await source.keys(scene+'|'+level+'|');
  pairs=core.choosePairs(keys,5,m.cells);
  if(!pairs.length)throw Error('Keine zwei benachbarten gespeicherten Bildkacheln gefunden');
  const chosen=pairs.flatMap(p=>p.keys);
  records=[];const origin=[];
  for(const key of chosen){
   const t=start(),rec=await source.get(key),readMs=start()-t;
   if(!rec||rec.sceneKey!==scene||rec.level!==level||!Array.isArray(rec.layers)||
      !rec.layers.some(l=>l.layer==='ground')||
      !rec.layers.some(l=>l.layer==='scenery')||
      rec.layers.some(l=>!(l.png instanceof Blob)))
    throw Error('Fehlendes oder unvollständiges Originalpaket: '+key);
   records.push(rec);
   const fingerprints=[];
   for(const l of rec.layers){
    fingerprints.push({layer:l.layer,bytes:l.png.size,pad:l.pad||0,
     crop:l.crop||null,sha256:await hashBlob(l.png)});
   }
   origin.push({id:rec.tile.id,readMs:round(readMs),
    files:fingerprints});
  }
  samples.textContent=pairs.map((p,i)=>
   (i+1)+'. Nachbarpaar '+p.ids.join(' ↔ ')).join(' · ');
  return {manifest:m,available:keys.length,expected:m.expectedTiles,
   origin,originalBytes:records.reduce((n,r)=>n+
    r.layers.reduce((sum,l)=>sum+l.png.size,0),0)};
 }
 async function transformLayer(layer,variant){
  stopIfNeeded();
  const input=layer.png;
  if(variant.kind==='original'){
   // Still decode once to measure baseline pixel geometry/decode throughput.
   const t=start(),im=await makeImage(input),decodeMs=start()-t,
    pixels=im.width*im.height;
   im.close?.();
   return {layer:{...layer,png:input},
    stats:{inBytes:input.size,outBytes:input.size,
     inPixels:pixels,outPixels:pixels,decodeMs:round(decodeMs),encodeMs:0,
     transformed:false}};
  }
  const tDecode=start(),im=await makeImage(input),decodeMs=start()-tDecode;
  let output=null,metadata={...layer},transformed=false,encodeMs=0;
  try{
   const originalPixels=im.width*im.height;
   if(variant.kind==='crop'&&!['scenery','structures'].includes(layer.layer))
    return {layer:{...layer,png:input},
     stats:{inBytes:input.size,outBytes:input.size,inPixels:originalPixels,
      outPixels:originalPixels,decodeMs:round(decodeMs),encodeMs:0,transformed:false}};
   const {cv,ctx}=canvasFor(im.width,im.height);
   ctx.drawImage(im,0,0);
   if(variant.kind==='crop'){
    const data=ctx.getImageData(0,0,im.width,im.height);
    const b=core.alphaBounds(data.data,im.width,im.height,2);
    // Existing baked scenery often already cropped; don't re-encode for
    // negligible trim (or cut alpha/shadow pixels for an empty raster).
    if(b&&b.removed>=4096&&b.removed>=originalPixels*.02){
     const cropped=canvasFor(b.width,b.height);
     cropped.ctx.drawImage(cv,b.x,b.y,b.width,b.height,0,0,b.width,b.height);
     metadata=core.cropLayerMetadata(layer,im.width,im.height,b.x,b.y);
     const t=start();output=await encode(cropped.cv,'image/png');
     encodeMs=start()-t;transformed=true;
     return {layer:{...metadata,png:output},
      stats:{inBytes:input.size,outBytes:output.size,inPixels:originalPixels,
       outPixels:b.width*b.height,decodeMs:round(decodeMs),
       encodeMs:round(encodeMs),transformed}};
    }
   }else if(variant.kind==='resize'){
    const w=Math.max(1,Math.round(im.width*variant.factor)),
     h=Math.max(1,Math.round(im.height*variant.factor));
    const down=canvasFor(w,h);
    down.ctx.imageSmoothingEnabled=true;
    down.ctx.imageSmoothingQuality='high';
    down.ctx.drawImage(im,0,0,w,h);
    metadata=core.resizeLayerMetadata(layer,im.width,im.height,w,h);
    const t=start();output=await encode(down.cv,'image/png');
    encodeMs=start()-t;transformed=true;
    return {layer:{...metadata,png:output},
     stats:{inBytes:input.size,outBytes:output.size,inPixels:originalPixels,
      outPixels:w*h,decodeMs:round(decodeMs),
      encodeMs:round(encodeMs),transformed}};
   }else if(variant.kind==='webp'){
    const t=start();output=await encode(cv,'image/webp',variant.quality);
    encodeMs=start()-t;transformed=true;
    return {layer:{...metadata,png:output},
     stats:{inBytes:input.size,outBytes:output.size,inPixels:originalPixels,
      outPixels:originalPixels,decodeMs:round(decodeMs),
      encodeMs:round(encodeMs),transformed}};
   }
   return {layer:{...layer,png:input},
    stats:{inBytes:input.size,outBytes:input.size,inPixels:originalPixels,
     outPixels:originalPixels,decodeMs:round(decodeMs),encodeMs:0,transformed:false}};
  }finally{im.close?.();}
 }
 async function checkOriginalIntegrity(){
  // Independent fresh reads, not references to the previously cached packet.
  for(let ri=0;ri<records.length;ri++){
   const original=records[ri],again=await source.get(original.key);
   if(!again||again.layers.length!==original.layers.length)
    throw Error('Originalarchiv verändert oder nicht lesbar: '+original.key);
   for(let li=0;li<again.layers.length;li++){
    if(again.layers[li].png.size!==sourceMetadata.origin[ri].files[li].bytes)
     throw Error('Originalgröße verändert: '+original.key);
    const fingerprint=sourceMetadata.origin[ri].files[li].sha256;
    if(fingerprint&&await hashBlob(again.layers[li].png)!==fingerprint)
     throw Error('Original-Hash stimmt nicht mehr: '+original.key);
   }
  }
  return true;
 }
 async function prepareVariant(variant){
  const memory=Frozen.memoryStore(),details=[],t0=start();
  for(let ri=0;ri<records.length;ri++){
   stopIfNeeded();
   const original=records[ri],layers=[];
   for(let li=0;li<original.layers.length;li++){
    const layer=original.layers[li];
    msg('Variante '+variant.id+': Bild '+(ri+1)+' / '+records.length+
     ', Ebene '+(li+1)+' / '+original.layers.length+' umwandeln …');
    const next=await transformLayer(layer,variant);
    layers.push(next.layer);
    details.push({tile:original.tile.id,layer:layer.layer,...next.stats});
    // Allow paint/UI progress while dozens of megapixels are processed.
    await idle();
   }
   await memory.put({...original,layers});
  }
  return {memory,details,prepareMs:round(start()-t0),
   inputBytes:details.reduce((n,x)=>n+x.inBytes,0),
   outputBytes:details.reduce((n,x)=>n+x.outBytes,0),
   decodedPixels:details.reduce((n,x)=>n+x.outPixels,0)};
 }
 function pairPose(pair,zoom,dpr=2){
  const a=records.find(t=>t.tile.id===pair.ids[0]).tile,
   b=records.find(t=>t.tile.id===pair.ids[1]).tile;
  const x=(a.x+a.size/2+b.x+b.size/2)/2,
   y=(a.y+a.size/2+b.y+b.size/2)/2;
  return {zoom,panX:-x*zoom,panY:-y*zoom*.85,dpr,projectY:.85};
 }
 async function ready(view,pose,timeout=20000){
  const expected=core.visibleTiles(records,pose,canvas.clientWidth,canvas.clientHeight).length;
  const begin=start();
  do{
   stopIfNeeded();
   const s=view.report();
   if(s.decoded>=expected&&s.pending===0){
    await tick();
    return {readyMs:round(start()-begin),expected,loaded:s.decoded,
     failures:s.failures};
   }
   if(start()-begin>timeout)throw Error('Bildpakete nach 20 s nicht geladen ('+
    s.decoded+'/'+expected+', Fehler '+s.failures+')');
   await new Promise(resolve=>setTimeout(resolve,60));
  }while(true);
 }
 // This image is a COMPLETE geometric composite of the selected two tile
 // cores, not a screenshot of an enormous viewport filled by only two tiles.
 // It uses their exact ground GUTTER and scenery CROP rectangles, and
 // preserves baked shadows without consulting the editor or source sprites.
 async function compositePair(memory,pair,cells){
  const a=await memory.get(pair.keys[0]),b=await memory.get(pair.keys[1]);
  if(!a||!b)throw Error('Vergleichspaar fehlt im Teststore');
  const tiles=[a,b],minX=Math.min(...tiles.map(t=>t.tile.x)),
   minY=Math.min(...tiles.map(t=>t.tile.y)),
   maxX=Math.max(...tiles.map(t=>t.tile.x+t.tile.size)),
   maxY=Math.max(...tiles.map(t=>t.tile.y+t.tile.size));
  const proj=.85,scale=Math.min(1.5,1800/(maxX-minX),
   1000/((maxY-minY)*proj));
  const {cv,ctx}=canvasFor((maxX-minX)*scale,(maxY-minY)*scale*proj);
  ctx.fillStyle='#bfcbd1';ctx.fillRect(0,0,cv.width,cv.height);
  function clipAuthored(halo){
   ctx.beginPath();
   for(const c of cells){
    if(c.visibility!=='visible'&&c.visibility!=='explored')continue;
    if(c.x+c.radius+halo<minX||c.x-c.radius-halo>maxX||
     c.y+c.radius+halo<minY||c.y-c.radius-halo>maxY)continue;
    const x=(c.x-minX)*scale,y=(c.y-minY)*scale*proj;
    const rx=(c.radius+halo)*scale,ry=rx*proj;
    for(let i=0;i<6;i++){
     const theta=-Math.PI/2+i*Math.PI/3;
     const px=x+rx*Math.cos(theta),py=y+ry*Math.sin(theta);
     if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();
   }
   ctx.clip();
  }
  // Decode only one large image at a time to limit temporary memory.
  ctx.save();clipAuthored(0);
  for(const t of tiles)for(const layer of t.layers){
   if(!['ground','terrain'].includes(layer.layer))continue;
   const im=await makeImage(layer.png);
   try{
    const pad=Math.max(0,layer.pad||0),fraction=pad/(t.tile.size+2*pad),
     sourceLeft=im.width*fraction,sourceTop=im.height*fraction,
     sourceW=im.width*(1-2*fraction),sourceH=im.height*(1-2*fraction);
    ctx.drawImage(im,sourceLeft,sourceTop,sourceW,sourceH,
     (t.tile.x-minX)*scale,(t.tile.y-minY)*scale*proj,
     t.tile.size*scale,t.tile.size*scale*proj);
   }finally{im.close?.();}
  }
  ctx.restore();
  ctx.save();clipAuthored(45);
  for(const t of tiles)for(const layer of t.layers){
   if(!['scenery','structures'].includes(layer.layer))continue;
   const im=await makeImage(layer.png);
   try{
    const pad=layer.pad||0,
     fx=(t.tile.x-pad-minX)*scale,fy=(t.tile.y-pad-minY)*scale*proj,
     fw=(t.tile.size+2*pad)*scale,fh=(t.tile.size+2*pad)*scale*proj,
     c=layer.crop;
    if(c)ctx.drawImage(im,fx+fw*c.x/c.fullWidth,
     fy+fh*c.y/c.fullHeight,fw*im.width/c.fullWidth,
     fh*im.height/c.fullHeight);
    else ctx.drawImage(im,fx,fy,fw,fh);
   }finally{im.close?.();}
  }
  ctx.restore();
  return encode(cv,'image/png');
 }
 async function compareScreenshot(reference,subject){
  if(!reference)return null;
  const a=await makeImage(reference),b=await makeImage(subject);
  try{
   if(a.width!==b.width||a.height!==b.height)return null;
   const first=canvasFor(a.width,a.height),
    second=canvasFor(b.width,b.height);
   first.ctx.drawImage(a,0,0);second.ctx.drawImage(b,0,0);
   const x=first.ctx.getImageData(0,0,a.width,a.height).data,
    y=second.ctx.getImageData(0,0,a.width,a.height).data;
   let changed=0,sum=0,total=0;
   // 4-pixel grid on a constant-DPR canvas. A/B crops should agree exactly;
   // scaling and lossy WebP are evaluated visually, not against hard RMS.
   for(let k=0;k<x.length;k+=16){
    let mismatch=0;
    for(let channel=0;channel<4;channel++){
     const delta=x[k+channel]-y[k+channel];
     sum+=delta*delta;mismatch=Math.max(mismatch,Math.abs(delta));
    }
    if(mismatch>2)changed++;total++;
   }
   return {sampledPixels:total,changedPct:round(changed/total*100),
    rms:round(Math.sqrt(sum/(total*4)))};
  }finally{a.close?.();b.close?.();}
 }
 async function renderVariant(variant,memory,manifest,referenceImages){
  const allPaint=[],allGaps=[],cold=[],shots=[];
  let decodeCount=0,redecodes=0;
  const intervals=[.28,.65,1,1.5];
  for(let i=0;i<pairs.length;i++){
   stopIfNeeded();
   const pair=pairs[i],pose=pairPose(pair,1,2);
   const touched=new Set(core.visibleTiles(records,pose,
    canvas.clientWidth,canvas.clientHeight).map(r=>r.key));
   let sampleActive=false;
   const frames=[];
   const player=Frozen.create({canvas,storage:memory,maxDecodedPixels:30000000,
    onStatus:stats=>{if(sampleActive)frames.push({t:start(),paintMs:stats.paintMs});}});
   try{
    msg('Variante '+variant.id+': Nachbarpaar '+(i+1)+'/'+pairs.length+
     ' – Viewer laden und Kameratest …');
    const t=start();await player.load(scene,level,pose,manifest.cells);
    const settled=await ready(player,pose);
    cold.push({pair:pair.ids.join('~'),...settled,
     initialMs:round(start()-t)});
    for(const zoom of intervals){
     stopIfNeeded();
     const current=pairPose(pair,zoom,2);
     for(const t of core.visibleTiles(records,current,canvas.clientWidth,canvas.clientHeight))
      touched.add(t.key);
     player.setPose(current);
     await ready(player,current);
     // 3 warmup frames, 12 measured, same path per variant and zoom.
     for(let n=0;n<3;n++){
      player.setPose({...current,panX:current.panX+n*.6});
      await tick();
     }
     frames.length=0;sampleActive=true;
     for(let n=0;n<12;n++){
      player.setPose({...current,panX:current.panX+n*2.5,
       panY:current.panY+(n%6)*1.2});
      await tick();
     }
     sampleActive=false;
     for(const frame of frames)allPaint.push({zoom,pair:i,value:frame.paintMs});
     for(let k=1;k<frames.length;k++)
      allGaps.push({zoom,pair:i,value:frames[k].t-frames[k-1].t});

    }
    const stats=player.report();
    decodeCount+=stats.loads;
    redecodes+=Math.max(0,stats.loads-touched.size);
   }finally{sampleActive=false;player.stop();}
   const preview=await compositePair(memory,pair,manifest.cells);
   const comparison=await compareScreenshot(referenceImages?.[i],preview);
   shots.push({pair:pair.ids,blob:preview,comparison});
   await idle();
  }
  return {cold,decodeCount,redecodes,
   drawP50:round(core.quantile(allPaint.map(x=>x.value),.5)),
   drawP95:round(core.quantile(allPaint.map(x=>x.value),.95)),
   frameGapP95:round(core.quantile(allGaps.map(x=>x.value),.95)),
   sampleFrames:allPaint.length,perZoom:intervals.map(z=>{
    const v=allPaint.filter(x=>x.zoom===z).map(x=>x.value);
    return {zoom:z,paintP50:round(core.quantile(v,.5)),
     paintP95:round(core.quantile(v,.95)),frames:v.length};
   }),shots};
 }
 let referenceShots=null,shotUrls=[];
 async function runBenchmark(){
  if(running)return;
  running=true;stopped=false;runButton.disabled=true;downloadButton.disabled=true;
  results.textContent='Messung läuft. Bitte diesen Tab sichtbar lassen und nicht bewegen.';
  report={scene,level,createdAt:new Date().toISOString(),
   environment:{userAgent:navigator.userAgent,dpr:devicePixelRatio,
    cssViewport:[canvas.clientWidth,canvas.clientHeight],
    testDpr:2,zoomLevels:[.28,.65,1,1.5]},
   warnings:['Kein Terrain-Rebake. Benchmarkvarianten nur in RAM.',
    'Die Messung beruht auf zehn Stichproben-Tiles, nicht dem ganzen 600-MB-Atlas.',
    'PNG/WebP-Quelldaten bleiben in ihrer IndexedDB unangetastet.',
    'Browser-Canvas bietet hier keine garantierte verlustfreie WebP-Kodierung; Gruppe E ist WebP Qualität 0,92.',
    'Disk-I/O für Originalquelle separat protokolliert; die Kameramessung benutzt für alle Varianten denselben temporären In-Memory-Store.'],
   samples:pairs.map(p=>p.ids),sourceMetadata:sourceMetadata,
   variants:[]};
  try{
   for(const variant of core.VARIANTS){
    stopIfNeeded();
    let prep,rendered;
    try{
     prep=await prepareVariant(variant);
     rendered=await renderVariant(variant,prep.memory,
      sourceMetadata.manifest,referenceShots);
    }catch(error){
     if(variant.id==='E'&&!stopped){
      report.variants.push({variant:variant.id,name:variant.name,
       skipped:true,reason:String(error?.message||error)});
      await idle();continue;
     }
     throw error;
    }
    if(variant.id==='A')referenceShots=rendered.shots.map(s=>s.blob);
    const {shots,...metric}=rendered;
    for(const shot of shots){
     const url=URL.createObjectURL(shot.blob);
     shotUrls.push(url);
     const link=document.createElement('a'),img=document.createElement('img'),
      label=document.createElement('span');
     img.src=url;img.alt='Vollständiger Kachelausschnitt '+shot.pair.join(' / ');
     label.textContent=variant.id+' · '+shot.pair.join(' / ')+
      (shot.comparison?.changedPct!=null?
       ' · '+shot.comparison.changedPct+' % Pixelabweichung':'');
     link.href=url;link.target='_blank';link.rel='noopener';
     link.append(img,label);$('gallery').append(link);
    }
    report.variants.push({variant:variant.id,name:variant.name,
     inputMiB:mb(prep.inputBytes),outputMiB:mb(prep.outputBytes),
     savingsPct:round(100*(1-prep.outputBytes/prep.inputBytes)),
     decodedMiB:mb(prep.decodedPixels*4),
     prepareMs:prep.prepareMs,details:prep.details,
     ...metric,visualComparisons:shots.map(shot=>({
      pair:shot.pair,...shot.comparison
     })),visualComparison:shots[0]?.comparison||null});
    results.textContent=JSON.stringify(report.variants.map(v=>({
     group:v.variant,sizeMiB:v.outputMiB,savingsPct:v.savingsPct,
     decodedMiB:v.decodedMiB,drawP95:v.drawP95,
     frameGapP95:v.frameGapP95,visualDifference:v.visualComparison
    })),null,2);
    await idle();
   }
   msg('Vergleiche die ursprünglichen Kachel-Dateien per SHA-256 …');
   report.sourceUnchanged=await checkOriginalIntegrity();
   msg('Benchmark abgeschlossen: '+report.variants.length+' Varianten mit '+
    records.length+' Weltkacheln überprüft. Original-Hashes unverändert.');
   downloadButton.disabled=false;
  }catch(error){
   fail(error);
   report.error=String(error?.message||error);
   if(report.variants.length)downloadButton.disabled=false;
  }finally{
   running=false;runButton.disabled=false;
  }
 }
 function downloadReport(){
  if(!report)return;
  const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),
   url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='vedras_atlas_benchmark_'+scene+'.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
 }
 let sourceMetadata=null;
 $('stop').addEventListener('click',()=>{stopped=true;msg('Abbruch angefordert. Originalkarte bleibt erhalten.');});
 runButton.addEventListener('click',runBenchmark);
 downloadButton.addEventListener('click',downloadReport);
 try{
  msg('Lese gespeicherte Atlas-Metadaten …');
  sourceMetadata=await inspectOriginal();
  msg('Bereit: '+sourceMetadata.available+' gespeicherte WorldTiles; '+
   records.length+' davon für den A/B-Benchmark ausgewählt. Keine Änderung an der Originalkarte.');
  runButton.disabled=false;
 }catch(error){fail(error);}
})();

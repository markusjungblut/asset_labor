/* Vedras Reiche – opt-in standalone renderer profiler (Schritt 25A).
 * Instrumentation is inert unless explicitly enabled by ?perf=1.
 * All collected samples are bounded and stay local until user exports JSON.
 * No source PNG, IndexedDB record, Fog permission or game state is modified.
 */
'use strict';
window.VedrasFrozenProfiler=(()=>{
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const round=v=>Math.round(v*100)/100;
 const quantile=(sorted,q)=>!sorted.length?null:
  round(sorted[Math.floor((sorted.length-1)*q)]);
 const summary=values=>{
  const a=values.filter(v=>Number.isFinite(v)).sort((x,y)=>x-y);
  if(!a.length)return {count:0,min:null,p50:null,p95:null,p99:null,max:null,mean:null};
  return {count:a.length,min:round(a[0]),p50:quantile(a,.50),
   p95:quantile(a,.95),p99:quantile(a,.99),max:round(a.at(-1)),
   mean:round(a.reduce((n,v)=>n+v,0)/a.length)};
 };
 function create({maxFrames=2400,maxTiles=750,now=()=>performance.now()}={}){
  maxFrames=clamp(Math.round(maxFrames)||2400,60,8000);
  maxTiles=clamp(Math.round(maxTiles)||750,20,3000);
  const frames=[],tileReads=[],inputs={pan:0,zoom:0,other:0};
  let pendingInput=null,lastFrameTime=null,lastFrameActive=false,
   firstFrameTime=null,recorded=0,
   droppedFrames=0,recordedTiles=0,droppedTiles=0,frameInputs=0,
   activeFrames=0;
  const limited=(buffer,value,max)=>{buffer.push(value);if(buffer.length>max)buffer.shift();};
  function input(kind,time=now()){
   const category=kind==='pan'?'pan':kind==='zoom'?'zoom':'other';
   inputs[category]++;
   // Pointer events may coalesce into a single RAF. Keep the OLDEST
   // waiting timestamp to estimate event-handler-to-draw completion latency.
   if(!pendingInput||time<pendingInput.at)
    pendingInput={kind:category,at:time};
  }
  function frame(data){
   const t=Number.isFinite(data.time)?data.time:now();
   if(firstFrameTime===null)firstFrameTime=t;
   const gap=lastFrameTime!==null?t-lastFrameTime:null;
   const gesture=pendingInput?.kind||data.gesture||null;
   const delay=pendingInput?Math.max(0,t-pendingInput.at):null;
   if(pendingInput)frameInputs++;
   pendingInput=null;
   const active=gesture!==null||data.active===true;
   // A frame after seconds of not panning is not a 2-second "jank"
   // frame. Frame gaps for active input must be CONTIGUOUS.
   const activeGap=active&&lastFrameActive&&gap!==null&&gap<=350?gap:null;
   lastFrameTime=t;lastFrameActive=active;
   if(active)activeFrames++;
   const sample={
    tMs:round(t-firstFrameTime),
    kind:gesture||'background',
    active,
    drawMs:round(data.drawMs||0),
    frameGapMs:Number.isFinite(activeGap)?round(activeGap):null,
    inputToDrawEndMs:Number.isFinite(delay)?round(delay):null,
    selectMs:round(data.selectMs||0),
    worldMs:round(data.worldMs||0),
    groundMs:round(data.groundMs||0),
    sceneryMs:round(data.sceneryMs||0),
    maskMs:round(data.maskMs||0),
    cloudMs:round(data.cloudMs||0),
    fogMs:round(data.fogMs||0),
    statusMs:round(data.statusMs||0),
    renderMode:data.renderMode||'cached',
    zoom:round(data.zoom||1),
    dpr:round(data.dpr||1),
    canvasPixels:data.canvasPixels||0,
    visibleTiles:data.visibleTiles||0,
    visibleReadyTiles:data.visibleReadyTiles||0,
    decodedTiles:data.decodedTiles||0,
    activeVariant:data.activeVariant||'2x',
    decodedPixels:data.decodedPixels||0,
    evictions:data.evictions||0,
    visibleReadStarts:data.visibleReadStarts||0,
    prefetchReadStarts:data.prefetchReadStarts||0,
    decodeRepeats:data.decodeRepeats||0,
    visibleDecodeRepeats:data.visibleDecodeRepeats||0,
    prefetchDecodeRepeats:data.prefetchDecodeRepeats||0,
    evictedSpeculative:data.evictedSpeculative||0,
    prefetchSkippedBudget:data.prefetchSkippedBudget||0,
    prefetchSkippedVisible:data.prefetchSkippedVisible||0,
    prefetchSkippedSlots:data.prefetchSkippedSlots||0,
    visibleWaitingOnPrefetch:data.visibleWaitingOnPrefetch||0,
    pendingTiles:data.pendingTiles||0,
    worldCacheBuilds:data.worldCacheBuilds||0,
    worldCacheHits:data.worldCacheHits||0,
    cloudCacheBuilds:data.cloudCacheBuilds||0,
    cloudCacheHits:data.cloudCacheHits||0,
    worldCacheFallbackFrames:data.worldCacheFallbackFrames||0,
    cloudCacheFallbackFrames:data.cloudCacheFallbackFrames||0,
    worldRasterMiB:data.worldRasterMiB||0,
    cloudRasterMiB:data.cloudRasterMiB||0
   };
   recorded++;
   if(frames.length>=maxFrames)droppedFrames++;
   limited(frames,sample,maxFrames);
   return sample;
  }
  function tileRead(data){
   const sample={
    source:data.source==='derived1x'?'derived1x':
     data.source==='derived2x'?'derived2x':data.source==='original'?
     'original':'unknown',
    kind:data.error?'failed':'loaded',
    tileId:data.tileId||null,
    variant:data.variant||null,
    purpose:data.purpose==='prefetch'?'prefetch':'visible',
    redecoded:!!data.redecoded,
    decodedCount:data.decodedCount||0,
    storageMs:round(data.storageMs||0),
    decodeMs:round(data.decodeMs||0),
    totalMs:round(data.totalMs||0),
    layers:data.layers||0,
    blobBytes:data.blobBytes||0,
    pixels:data.pixels||0
   };
   recordedTiles++;
   if(tileReads.length>=maxTiles)droppedTiles++;
   limited(tileReads,sample,maxTiles);
  }
  function reset(){
   frames.length=0;tileReads.length=0;
   inputs.pan=inputs.zoom=inputs.other=0;
   pendingInput=null;lastFrameTime=null;lastFrameActive=false;firstFrameTime=null;
   recorded=0;droppedFrames=0;recordedTiles=0;droppedTiles=0;
   frameInputs=0;activeFrames=0;
  }
  const metric=(samples,name)=>summary(samples.map(x=>x[name]));
  function report(extra={}){
   const active=frames.filter(x=>x.active),
    distinct={
     cached:frames.filter(x=>x.renderMode==='cached').length,
     direct:frames.filter(x=>x.renderMode==='direct').length
    };
   const selected=active.length>=5?active:frames;
   const phaseNames=['drawMs','frameGapMs','inputToDrawEndMs','selectMs',
    'worldMs','groundMs','sceneryMs','maskMs','cloudMs','fogMs','statusMs'];
   const phases=Object.fromEntries(phaseNames.map(key=>[key,metric(selected,key)]));
   const readPhases=Object.fromEntries(['storageMs','decodeMs','totalMs'].map(
    key=>[key,metric(tileReads.filter(t=>t.kind==='loaded'),key)]));
   const slow=selected.filter(x=>x.frameGapMs!=null);
   const thresholds={
    gapOver33ms:slow.filter(x=>x.frameGapMs>33.3).length,
    gapOver50ms:slow.filter(x=>x.frameGapMs>50).length,
    gapOver100ms:slow.filter(x=>x.frameGapMs>100).length,
    drawOver33ms:selected.filter(x=>x.drawMs>33.3).length,
    drawOver100ms:selected.filter(x=>x.drawMs>100).length
   };
   const output={
    schema:'vedras-frozen-profile-v1',
    generatedAt:new Date().toISOString(),
    note:'FrameGap = intervals between rendered frames, not monitor refresh; drawMs is synchronous JS/Canvas call wall time, NOT GPU present/driver upload duration. Input latency is event handler to end of Canvas draw, not physical device-to-photon. Cold converted tile storageMs can INCLUDE 4x read, half-size conversion and IndexedDB write.',
    sampleLimit:{maxFrames,maxTiles,recorded,droppedFrames,recordedTiles,droppedTiles},
    inputEvents:{...inputs,framesWithInput:frameInputs,activeFrames},
    firstFullyVisibleMs:frames.find(f=>f.visibleTiles>0&&
     f.visibleReadyTiles===f.visibleTiles)?.tMs??null,
    frameCounts:{stored:frames.length,selected: selected.length,
     active:active.length,renderModes:distinct},
    phasesMs:phases,
    byGesture:Object.fromEntries(['pan','zoom'].map(kind=>[kind,{
     draws:metric(frames.filter(f=>f.kind===kind),'drawMs'),
     gaps:metric(frames.filter(f=>f.kind===kind),'frameGapMs'),
     inputLatency:metric(frames.filter(f=>f.kind===kind),'inputToDrawEndMs')
    }])),
    tiles:{counts:{
     loaded:tileReads.filter(t=>t.kind==='loaded').length,
     failed:tileReads.filter(t=>t.kind==='failed').length,
     derived2x:tileReads.filter(t=>t.source==='derived2x').length,
     derived1x:tileReads.filter(t=>t.source==='derived1x').length,
     original:tileReads.filter(t=>t.source==='original').length,
     unknown:tileReads.filter(t=>t.source==='unknown').length,
     visible:tileReads.filter(t=>t.purpose==='visible').length,
     prefetch:tileReads.filter(t=>t.purpose==='prefetch').length,
     repeated:tileReads.filter(t=>t.redecoded).length,
     repeatedVisible:tileReads.filter(t=>t.redecoded&&t.purpose==='visible').length,
     repeatedPrefetch:tileReads.filter(t=>t.redecoded&&t.purpose==='prefetch').length
    },
    byPurpose:Object.fromEntries(['visible','prefetch'].map(purpose=>[
     purpose,{
      readMs:metric(tileReads.filter(t=>t.purpose===purpose),'storageMs'),
      decodeMs:metric(tileReads.filter(t=>t.purpose===purpose),'decodeMs')
     }
    ])),
    topRepeated:(([...groups])=>groups.sort((a,b)=>b[1]-a[1]).slice(0,12)
     .map(([tile,count])=>({tile,count})))(
      tileReads.reduce((map,t)=>{
       if(t.tileId&&t.variant&&t.kind==='loaded'){
        const id=t.variant+':'+t.tileId;
        map.set(id,(map.get(id)||0)+1);
       }
       return map;
      },new Map())),
    timingMs:readPhases,
     totalBlobBytes:tileReads.reduce((n,t)=>n+t.blobBytes,0),
     totalDecodedPixels:tileReads.reduce((n,t)=>n+t.pixels,0)},
    slowFrames:thresholds,
    environment:extra,
    frames:[...frames],tileReads:[...tileReads]
   };
   return output;
  }
  return {input,frame,tileRead,reset,report,stats:()=>({
   frames:frames.length,reads:tileReads.length,inputs:{...inputs},
   newestFrame:frames.at(-1)||null
  })};
 }
 return {create,summary};
})();

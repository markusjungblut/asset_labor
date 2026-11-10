'use strict';
/* Offline comparison of TWO on-machine Step 25Q profile JSON files.
 * Never reads original image bytes, and never declares 60 FPS proven.
 */
const fs=require('node:fs');
const STABLE_FLAGS=['renderMode','overview1x','largeViewportCache',
 'prefetchGuard','streamingWorldCache','adaptiveCloudCache',
 'autoCloudStrategy','fogViewportCull','layeredFog','adaptiveWorldPad',
 'sparseWorldBlit','indexedTileSelection','worldBandIndexMinCells'];
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const metric=(p,phase,k)=>p?.phasesMs?.[phase]?.[k];
const delta=(cap,after,before)=>
 finite(cap?.[after])&&finite(cap?.[before])?
 cap[after]-cap[before]:null;
function compare(first,second){
 const errors=[],warnings=[];
 const byFlag=[first,second].sort((a,b)=>Number(
  !!a?.abCapture?.bandIndexRequested)-
  Number(!!b?.abCapture?.bandIndexRequested));
 const [legacy,indexed]=byFlag;
 const a=legacy?.abCapture,b=indexed?.abCapture;
 if(a?.schema!=='vedras-step25q-local-ab-v2'||
    b?.schema!=='vedras-step25q-local-ab-v2')
  errors.push('Beide Dateien müssen aus der Step-25Q-Messfahrt stammen.');
 if(a?.bandIndexRequested!==false||b?.bandIndexRequested!==true)
  errors.push('Benötigt eine Messung mit bandIndex=0 und eine mit bandIndex=1.');
 if(b?.bandIndexActive!==true)
  errors.push('Der Index war nicht aktiv (Hexzahl unter Mindestwert oder Fallback).');
 if(a?.bandIndexActive!==false)
  errors.push('Die Legacy-Messung hatte einen aktiven Index.');
 if(a?.indexMinimumCells!==b?.indexMinimumCells)
  errors.push('Index-Mindestwert unterscheidet sich; bandIndexMin muss gleich sein.');
 if(a?.scene!==b?.scene||a?.level!==b?.level)
  errors.push('Szene oder LOD unterscheiden sich.');
 if(a?.cellCount!==b?.cellCount||a?.authorizedCells!==b?.authorizedCells||
    !finite(a?.cellCount)||!finite(a?.authorizedCells))
  errors.push('Unterschiedliche oder ungültige Karten-/Autorisierungsmetadaten.');
 if(a?.trace!==b?.trace||a?.framesPlanned!==b?.framesPlanned||
    a?.warmupFrames!==b?.warmupFrames)
  errors.push('Unterschiedliche Kamerafahrt oder Schrittzahl.');
 const same=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
 if(!same(a?.viewportCss,b?.viewportCss)||
    !same(a?.basePose,b?.basePose))
  errors.push('Viewport/DPR oder Ausgangskamera unterscheiden sich.');
 if(!same(legacy?.environment?.canvasBacking,
          indexed?.environment?.canvasBacking))
  errors.push('Canvas-Pixelmaße unterscheiden sich.');
 if(typeof legacy?.environment?.browser!=='string'||
    legacy.environment.browser.length<4||
    legacy.environment.browser!==indexed?.environment?.browser)
  errors.push('Browser/Version unterscheiden sich oder fehlen.');
 for(const flag of STABLE_FLAGS)
  if(legacy?.environment?.[flag]!==indexed?.environment?.[flag])
   errors.push('Andere Render-Option außer bandIndex: '+flag);
 if(legacy?.environment?.renderMode!=='cached'||
    indexed?.environment?.renderMode!=='cached')
  errors.push('25Q World-Blit-A/B erfordert den gecachten Render-Modus.');
 if(legacy?.environment?.sparseWorldBlit!==true||
    indexed?.environment?.sparseWorldBlit!==true)
  errors.push('25Q A/B erfordert auf beiden Seiten worldBands=1.');
 const queriesOff=delta(a,'indexQueriesAfter','indexQueriesBefore');
 const queriesOn=delta(b,'indexQueriesAfter','indexQueriesBefore');
 const scansOff=finite(a?.candidateAfter?.legacy)&&
  finite(a?.candidateBefore?.legacy)?
   a.candidateAfter.legacy-a.candidateBefore.legacy:null;
 const candidatesOn=finite(b?.candidateAfter?.indexed)&&
  finite(b?.candidateBefore?.indexed)?
   b.candidateAfter.indexed-b.candidateBefore.indexed:null;
 if(queriesOff!==0||!(queriesOn>0))
  errors.push('Indexabfragen fehlen oder laufen im Legacy-Modus.');
 if(!(scansOff>0)||!(candidatesOn>0))
  errors.push('World-Band-Kandidatenscans wurden nicht in beiden Modi ausgeführt.');
 for(const [name,cap] of [['Legacy',a],['Index',b]]){
  const frameCount=(delta(cap,'sparseFramesAfter','sparseFramesBefore')||0)+
   (delta(cap,'sparseFallbacksAfter','sparseFallbacksBefore')||0);
  if(!(frameCount>0)||!(delta(cap,'worldBlitFullPixelsAfter',
     'worldBlitFullPixelsBefore')>0))
   errors.push(name+': kein gemessener gecachter World-Blit-Aufruf.');
 }
 const onPixels=delta(b,'worldBlitPixelsAfter','worldBlitPixelsBefore');
 const offPixels=delta(a,'worldBlitPixelsAfter','worldBlitPixelsBefore');
 if(!(onPixels>=0)||!(offPixels>=0))
  errors.push('World-Blit-Pixelzähler fehlen oder sind ungültig.');
 for(const [name,p] of [['Legacy',legacy],['Index',indexed]]){
  const c=p?.abCapture;
  if(c?.settled!==true||c?.pendingBefore!==0)
   errors.push(name+': Aufwärmphase nicht ruhig (offene Tile-Reads).');
  if((c?.failuresAfter||0)>0||(c?.failuresBefore||0)>0)
   errors.push(name+': Renderfehler während der Messung.');
  const min=Math.floor((c?.framesPlanned||96)*.65);
  if((p?.frameCounts?.active||0)<min)
   errors.push(name+': zu wenige aktive Pan-Frames.');
  if((p?.phasesMs?.frameGapMs?.count||0)<min-2)
   errors.push(name+': zu wenige zusammenhängende Frame-Gaps.');
  if(c?.pendingAfter!==0)
   errors.push(name+': nach der Messfahrt sind Tile-Reads offen.');
  // A warm cached A/B must not mix new tile IO, image decoding or eviction
  // into the measured JS/Canvas frames. Do not call such a run valid.
  const counters=['loads','visibleReadStarts','prefetchReadStarts',
   'decodeRepeats','evictions'];
  for(const key of counters){
   const work=finite(c?.warmCountersBefore?.[key])&&
    finite(c?.warmCountersAfter?.[key])?
     c.warmCountersAfter[key]-c.warmCountersBefore[key]:null;
   if(work===null||work<0)
    errors.push(name+': unvollständiger Cache-/Tile-Zähler '+key+'.');
   else if(work>0)
    errors.push(name+': kein warmer Lauf – '+key+' +'+work+' während der Messfahrt.');
  }
  if((p?.tileReads?.length||0)>0)
   errors.push(name+': Mess-Profiler enthält Tile-Lese-/Decode-Ereignisse.');
  if((p?.sampleLimit?.droppedTiles||0)>0)
   errors.push(name+': Tile-Profiler-Daten abgeschnitten.');
  const samples=p?.frames||[];
  const raster=samples[0]?.canvasPixels;
  if(samples.length>0&&(samples.some(f=>f.canvasPixels!==raster)||
     samples.some(f=>f.activeVariant!==samples[0].activeVariant)))
   errors.push(name+': Canvas-Auflösung oder LOD wechselte während der Messfahrt.');
  if(p?.sampleLimit?.droppedFrames>0)
   errors.push(name+': Profilframes wurden abgeschnitten.');
 }
 const phases=['drawMs','frameGapMs','worldPrepareMs','worldPlanMs','worldBlitMs'];
 const timings={};
 for(const phase of phases){
  timings[phase]={};
  for(const field of ['p50','p95']){
   const base=metric(legacy,phase,field),next=metric(indexed,phase,field);
   timings[phase][field]={
    legacyMs:finite(base)?base:null,indexedMs:finite(next)?next:null,
    deltaMs:finite(base)&&finite(next)?
     Math.round((next-base)*100)/100:null,
    deltaPct:finite(base)&&finite(next)&&base>0?
     Math.round((next/base-1)*1000)/10:null};
   if(!finite(base)||!finite(next))
    errors.push('Messwert fehlt: '+phase+'.'+field);
  }
 }
 const draw=timings.drawMs.p95,gap=timings.frameGapMs.p95;
 for(const [name,m] of [['drawMs',draw],['frameGapMs',gap]]){
  if(finite(m.legacyMs)&&finite(m.indexedMs)&&
     m.indexedMs>m.legacyMs+Math.max(2,m.legacyMs*.1))
   warnings.push(name+': p95 relevant schlechter (nur ein Messpaar).');
 }
 return {schema:'vedras-step25q-comparison-v1',
  valid:errors.length===0,
  decision:'Keine automatische Merge-Freigabe; mindestens drei A/B-Paare und reale Bild-/Fog-Kontrolle erforderlich.',
  trace:a?.trace||null,scene:a?.scene||null,level:a?.level||null,
  work:{queriesOff,queriesOn,scansOff,candidatesOn,offPixels,onPixels},
  timings,errors,warnings};
}

const ORDER=[false,true,true,false,false,true];
const median=values=>{
 const v=[...values].sort((a,b)=>a-b);
 return v[Math.floor(v.length/2)];
};
function compareSeries(bundle){
 const errors=[],warnings=[],pairs=[];
 const captures=bundle?.captures;
 if(bundle?.schema!=='vedras-step25q-local-series-v1'||
    !Array.isArray(captures)||captures.length!==6)
  return {schema:'vedras-step25q-series-comparison-v1',
   valid:false,errors:['Serie benötigt genau sechs v2-Profile.'],
   warnings,pairs:[],summary:null};
 const mode=captures.map(x=>x?.abCapture?.bandIndexRequested);
 if(mode.some((x,i)=>x!==ORDER[i]))
  errors.push('Serienreihenfolge muss OFF-ON, ON-OFF, OFF-ON sein.');
 const fingerprint=p=>{
  const env=p?.environment||{},ab=p?.abCapture||{};
  return JSON.stringify({scene:ab.scene,level:ab.level,
   trace:ab.trace,frames:ab.framesPlanned,warmup:ab.warmupFrames,
   viewport:ab.viewportCss,pose:ab.basePose,
   backing:env.canvasBacking,cellCount:ab.cellCount,
   authorizedCells:ab.authorizedCells,
   stable:Object.fromEntries(STABLE_FLAGS.map(k=>[k,env[k]]))});
 };
 if(captures.some(x=>fingerprint(x)!==fingerprint(captures[0])))
  errors.push('Serienmessungen unterscheiden sich in Kamera, Raster, Karte oder Rendereroptionen.');
 for(let i=0;i<3;i++){
  const result=compare(captures[i*2],captures[i*2+1]);
  pairs.push({number:i+1,order:ORDER[i*2]?'ON-OFF':'OFF-ON',
   ...result});
  if(!result.valid)errors.push('Paar '+(i+1)+': '+result.errors.join('; '));
  for(const w of result.warnings)warnings.push('Paar '+(i+1)+': '+w);
 }
 const fields=['drawMs','frameGapMs','worldPrepareMs','worldPlanMs','worldBlitMs'];
 const summary={};
 for(const field of fields){
  summary[field]={};
  for(const stat of ['p50','p95']){
   const nums=pairs.map(p=>p.timings?.[field]?.[stat]?.deltaMs);
   summary[field][stat]=nums.every(finite)?{
    deltasMs:nums,medianDeltaMs:Math.round(median(nums)*100)/100,
    improvedPairs:nums.filter(n=>n<0).length,
    regressedPairs:nums.filter(n=>n>0).length}:null;
  }
 }
 if(!summary.frameGapMs?.p95||!summary.drawMs?.p95)
  errors.push('Paarübergreifende p95-Zeiten fehlen.');
 return {schema:'vedras-step25q-series-comparison-v1',
  valid:errors.length===0,mode,scene:captures[0]?.abCapture?.scene,
  pairs,summary,errors,warnings,
  decision:'Drei vergleichbare A/B-Paare sind nur ein Performance-Nachweis. Kein automatischer Merge; Originalkarten-Pixel/Fog, reale Windows-/GPU-Wirkung und p95-Regressionsrisiko manuell beurteilen.'};
}

if(require.main===module){
 const names=process.argv.slice(2);
 if(names.length!==1&&names.length!==2){
  console.error('Verwendung: node tests/compare_rendering_step25q_profiles.cjs SERIE.json ODER LEGACY.json INDEX.json');
  process.exitCode=2;
 }else{
  try{
   const files=names.map(n=>JSON.parse(fs.readFileSync(n,'utf8')));
   const result=names.length===1?compareSeries(files[0]):compare(...files);
   process.stdout.write(JSON.stringify(result,null,2)+'\n');
   if(!result.valid)process.exitCode=1;
  }catch(error){console.error(String(error));process.exitCode=2;}
 }
}
module.exports={compare,compareSeries};

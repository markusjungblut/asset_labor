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
  if(c?.pendingAfter>0)
   warnings.push(name+': während der Messfahrt liefen noch Tile-Reads.');
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
if(require.main===module){
 const names=process.argv.slice(2);
 if(names.length!==2){
  console.error('Verwendung: node tests/compare_rendering_step25q_profiles.cjs LEGACY.json INDEX.json');
  process.exitCode=2;
 }else{
  try{
   const files=names.map(n=>JSON.parse(fs.readFileSync(n,'utf8')));
   const result=compare(...files);
   process.stdout.write(JSON.stringify(result,null,2)+'\n');
   if(!result.valid)process.exitCode=1;
  }catch(error){console.error(String(error));process.exitCode=2;}
 }
}
module.exports={compare};

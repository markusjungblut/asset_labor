/* Originalkarten-Abnahme, ein Klick je Serverversion. Keine Schreib- oder Loeschoperationen an Atlas/Fog. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const features=['lodRecency','leadPrefetch','visibleBorrow','parallelDecode'];
const scenarios=['warm','lod','region'];
const NAMES={warm:'Warme Fahrt',lod:'1x/2x-Zoomwechsel',region:'Neue Region + Rueckfahrt',pressure:'Schnelle Richtungswechsel unter Ladelast'};
const wait=ms=>new Promise(ok=>setTimeout(ok,ms));
const nextFrame=()=>new Promise(ok=>requestAnimationFrame(ok));
const finite=n=>Number.isFinite(n);
const ALL_FLAGS=['lodRecency','leadPrefetch','visibleBorrow','parallelDecode'];
let running=false,cancelled=false,latest=null,iframeLoadNumber=0;
function status(message){$('status').textContent=message;}
function percentile(values,p){
 const v=values.filter(finite).sort((a,b)=>a-b);
 return v.length?v[Math.min(v.length-1,Math.ceil(v.length*p)-1)]:null;
}

function viewerVisibilityPx(){
 const r=$('game').getBoundingClientRect();
 return Math.max(0,Math.min(innerHeight,r.bottom)-Math.max(0,r.top));
}
async function ensureViewerVisible(){
 const minPx=Math.min(180,Math.max(80,innerHeight*.45));
 if(viewerVisibilityPx()<minPx){
  $('game').scrollIntoView({block:'center',behavior:'instant'});
  await wait(150);
 }
 if(viewerVisibilityPx()<minPx)
  throw Error('Testkarte ist ausserhalb des sichtbaren Firefox-Fensters. Browserfenster vergroessern, kein verstecktes iframe benchmarken.');
}

function api(){
 try{return $('game').contentWindow.__vedrasFrozenGameTest||null;}
 catch(_){return null;}
}
// Do not accept __vedrasFrozenGameTest from the previous iframe document.
// Setting iframe.src is asynchronous when Firefox is under CPU/GPU pressure.
// A unique URL per run plus the actual contentWindow document URL identifies
// the currently loaded version, not just a stale WindowProxy.
function readyViewerAt(frame,expectedHref){
 try{
  const w=frame.contentWindow;
  if(!w||w.location.href!==expectedHref||w.document.readyState!=='complete')
   return null;
  const a=w.__vedrasFrozenGameTest||null;
  return a&&a.readOnly&&typeof a.testPan==='function'&&
   a.stats?.().saved>0?a:null;
 }catch(_){return null;}
}
async function load(scene,feature,value,version=''){
 await ensureViewerVisible();
 const frame=$('game');
 frame.src='about:blank';
 const resetDeadline=performance.now()+15000;
 while(performance.now()<resetDeadline){
  if(cancelled)throw Error('Vom Benutzer abgebrochen');
  let current;
  try{current=frame.contentWindow?.location.href;}catch(_){current=null;}
  if(current==='about:blank')break;
  await wait(65);
 }
 if(frame.contentWindow?.location.href!=='about:blank')
  throw Error('Viewer-Navigation zu about:blank haengt; A/B-Lauf nicht gestartet, Originaldaten unberuehrt.');
 const url=new URL((version?version+'/':'')+'frozen-map-game.html',location.href);
 url.searchParams.set('_suiteRun',String(++iframeLoadNumber));
 url.searchParams.set('scene',scene);
 url.searchParams.set('lod','near');
 url.searchParams.set('perf','1');
 // Isolated A/B: the candidate starts with all four tested flags OFF.
 // The separate "production" smoke test deliberately uses shipped defaults.
 const isolated=(version==='candidate'||(!version&&feature!==null))&&feature!=='production';
 if(isolated)for(const key of ALL_FLAGS)url.searchParams.set(key,'0');
 else url.searchParams.set('parallelDecode','0');
 if(feature!==null&&feature!=='production')url.searchParams.set(feature,String(value));
 frame.src=url.href;
 const until=performance.now()+45000;
 let lastObservedHref=null;
 while(performance.now()<until){
  if(cancelled)throw Error('Vom Benutzer abgebrochen');
  let href=null;
  try{href=frame.contentWindow?.location.href||null;}catch(_){}
  if(href)lastObservedHref=href;
  const a=readyViewerAt(frame,url.href);
  if(a){
   // A second check after a browser task turn catches pending navigation.
   await wait(35);
   if(readyViewerAt(frame,url.href)===a)return a;
  }
  await wait(90);
 }
 throw Error('Viewer-Navigation/API-Timeout: erwartet '+url.pathname+
  ', zuletzt '+(lastObservedHref||'kein Dokument')+
  '. Kein Zurueckfallen auf alte iframe-API. Bitte Firefox-Origin/Server pruefen; keine Karte loeschen.');
}
async function tileCenters(scene){
 const prefix=scene+'|near|';
 const db=await new Promise((resolve,reject)=>{
  const req=indexedDB.open('vedras-frozen-world-v1');
  req.onupgradeneeded=()=>{req.transaction.abort();};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||Error('Kein bestehender Atlas'));
 });
 try{
  if(!db.objectStoreNames.contains('tiles'))throw Error('Atlas-Tabelle fehlt');
  const keys=await new Promise((resolve,reject)=>{
   const tx=db.transaction('tiles','readonly');
   const req=tx.objectStore('tiles').getAllKeys(IDBKeyRange.bound(prefix,prefix+'\uffff'));
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||Error('Kachelmetadaten nicht lesbar'));
  });
  const points=[];
  for(const key of keys){
   const match=String(key).slice(prefix.length).match(/^(-?\d+),(-?\d+)$/);
   if(match)points.push({x:(Number(match[1])+.5)*512,y:(Number(match[2])+.5)*512});
  }
  if(points.length<2)throw Error('Nicht genug gespeicherte Near-Kacheln fuer einen Regionsvergleich');
  return points;
 }finally{db.close();}
}
function worldCenter(p){
 const z=p.zoom||1,py=p.projectY||.85;
 return {x:-p.panX/z,y:-p.panY/(z*py)};
}
function closestFar(points,from){
 const ranked=points.map(p=>({p,d:(p.x-from.x)**2+(p.y-from.y)**2})).sort((a,b)=>b.d-a.d);
 return ranked[0].p;
}
function pose(base,x,y,zoom,dpr){
 return {...base,zoom,panX:-x*zoom,panY:-y*zoom*(base.projectY||.85),dpr};
}
function route(base,scenario,tiles){
 const origin=worldCenter(base),z0=base.zoom||.33,poses=[];
 const far=closestFar(tiles,origin);
 const other=closestFar(tiles,far);
 const p=(x,y,z,dpr=1.25)=>poses.push(pose(base,x,y,z,dpr));
 function interpolate(a,b,steps){
  for(let i=1;i<=steps;i++){
   const t=i/steps;
   p(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,
    a.z+(b.z-a.z)*t,i===steps?b.dpr:1.25);
  }
 }
 function hold(center,z,n,dpr=1.25){
  for(let i=0;i<n;i++)p(center.x,center.y,z,dpr);
 }
 const start={...origin,z:z0,dpr:base.dpr||1.25};
 const back={...origin,z:z0,dpr:base.dpr||1.25};
 if(scenario==='warm'){
  const step=1200/48;
  for(let i=0;i<48;i++){
   const phase=i/47;
   p(origin.x+Math.sin(phase*Math.PI)*step*20,
    origin.y+Math.sin(phase*Math.PI*2)*300,z0,base.dpr||1.25);
  }
  p(origin.x,origin.y,z0,base.dpr||1.25);
 }else if(scenario==='lod'){
  let current=start;
  const high={...origin,z:.96,dpr:2};
  const low={...origin,z:.44,dpr:1.25};
  for(const target of [high,low,high,low,high,back]){
   interpolate(current,target,10);
   hold(target,target.z,8,target.dpr);
   current=target;
  }
 }else if(scenario==='region'){
  const first={...far,z:.90,dpr:2},second={...other,z:.90,dpr:2};
  const begin={...origin,z:.90,dpr:2};
  interpolate(start,begin,9);
  interpolate(begin,first,36);
  hold(first,.90,14,2);
  interpolate(first,second,32);
  hold(second,.90,14,2);
  interpolate(second,first,32);
  interpolate(first,begin,36);
  interpolate(begin,back,9);
 }else if(scenario==='pressure'){
  // Strong read contention while panning between widely separated stored tiles.
  // No synthetic tiles or permission changes. A and B share exact poses.
  const ranked=tiles.map(t=>({tile:t,d:(t.x-origin.x)**2+(t.y-origin.y)**2}))
   .sort((a,b)=>b.d-a.d).map(e=>e.tile);
  const points=[],stride=Math.max(1,Math.floor(ranked.length/12));
  for(let i=0;i<ranked.length&&points.length<12;i+=stride)points.push(ranked[i]);
  for(let lap=0;lap<3;lap++){
   const order=lap%2?points.slice().reverse():points;
   for(const t of order){p(t.x,t.y,.92,2);p(t.x,t.y,.92,2);}
  }
  for(let i=0;i<10;i++)p(origin.x,origin.y,.92,2);
  p(origin.x,origin.y,z0,base.dpr||1.25);
 }else{throw Error('Unbekannte Route');}
 return {poses,origin,far,other};
}
function visibility(report){
 for(const f of (report.frames||[]).slice().reverse()){
  if(f.visibleTiles>0)return {visible:f.visibleTiles,ready:f.visibleReadyTiles};
 }
 return {visible:0,ready:0};
}
async function settle(a,limit=12000){
 const end=performance.now()+limit;
 let v={visible:0,ready:0};
 while(performance.now()<end){
  if(cancelled)throw Error('Vom Benutzer abgebrochen');
  a.forceRedraw();await wait(85);
  v=visibility(a.profileReport());
  if(v.visible>0&&v.visible===v.ready&&a.stats().pending===0)
   return {ok:true,...v};
 }
 return {ok:false,...v};
}
async function drive(a,poses){
 const ticks=[];let last=null;
 for(const p of poses){
  if(cancelled)throw Error('Vom Benutzer abgebrochen');
  if(document.hidden)throw Error('Firefox-Tab wurde im Test inaktiv. Test wiederholen und im Vordergrund lassen.');
  if(viewerVisibilityPx()<Math.min(80,innerHeight*.25))
   throw Error('Renderer-iframe waehrend der Fahrt ausserhalb des Viewports: Lauf ungueltig');
  if(a.testPan(p)!==true)throw Error('Diagnose-Kamera-API nicht verfuegbar');
  await nextFrame();
  const now=performance.now();
  if(last!==null)ticks.push(now-last);
  last=now;
 }
 for(let i=0;i<3;i++)await nextFrame();
 return {p95RafTickMs:percentile(ticks,.95),p50RafTickMs:percentile(ticks,.50),p99RafTickMs:percentile(ticks,.99),maxRafTickMs:ticks.length?Math.max(...ticks):null,rafOver50:ticks.filter(t=>t>50).length,rafOver100:ticks.filter(t=>t>100).length,samples:ticks.length};
}

function readinessWhileMoving(report){
 const frames=(report.frames||[]).filter(f=>f.active&&f.visibleTiles>0);
 let missingFrames=0,missingDurationMs=0,longestMissingMs=0,streak=0,peakMissingTiles=0;
 for(let i=0;i<frames.length;i++){
  const missing=Math.max(0,frames[i].visibleTiles-(frames[i].visibleReadyTiles||0));
  peakMissingTiles=Math.max(peakMissingTiles,missing);
  const dt=i+1<frames.length?Math.min(250,Math.max(0,frames[i+1].tMs-frames[i].tMs)):0;
  if(missing){missingFrames++;missingDurationMs+=dt;streak+=dt;longestMissingMs=Math.max(longestMissingMs,streak);}
  else streak=0;
 }
 return {observedFrames:frames.length,missingFrames,
  missingFraction:frames.length?missingFrames/frames.length:null,
  missingDurationMs:Math.round(missingDurationMs),
  longestMissingMs:Math.round(longestMissingMs),peakMissingTiles};
}

function delta(a,b,key){return Math.max(0,(b[key]||0)-(a[key]||0));}
async function measure(scene,feature,value,scenario,label,tiles,version='',extras={}){
 const a=await load(scene,feature,value,version);
 if(feature!==null&&feature!=='production'){
  const mapping={leadPrefetch:'directionalPrefetch',lodRecency:'lodRecency',
   visibleBorrow:'visibleBorrow',parallelDecode:'parallelLayerDecode'};
  const actual=a.stats();
  for(const key of ALL_FLAGS){
   const expected=key===feature?Boolean(value):false;
   if(actual[mapping[key]]!==expected)
    throw Error('Schalter nicht isoliert: '+key+', erwartet '+Number(expected));
  }
 }
 if(extras.control&&version==='candidate'){
  const st=a.stats();
  if(st.lodRecency||st.directionalPrefetch||st.visibleBorrow||st.parallelLayerDecode)
   throw Error('Kontrolle: Nicht alle vier Flags deaktiviert');
 }
 const base=a.pose();
 if(!base)throw Error('Keine Startkamera');
 const routeInfo=route(base,scenario,tiles);
 const startReady=await settle(a);
 if(!startReady.ok)throw Error('Startansicht unvollstaendig: '+startReady.ready+'/'+startReady.visible);
 if(scenario==='warm'){
  // Warm means warm: traverse once without recording, return and settle.
  await drive(a,routeInfo.poses);
  a.testPan(base);
  const preheated=await settle(a);
  if(!preheated.ok)throw Error('Warme Vorfahrt unvollstaendig');
 }
 await wait(200);
 a.profileReset();
 const before=a.stats();
 const derivedBefore={one:a.derived1x?.().converted||0,two:a.derived2x?.().converted||0};
 const start=performance.now();
 const ticks=await drive(a,routeInfo.poses);
 const movingReport=a.profileReport();
 const moveStats=a.stats();
 const endReady=await settle(a);
 const after=a.stats();
 const r=movingReport;
 const readiness=readinessWhileMoving(r);
 const derivedConversions=Math.max(0,(a.derived1x?.().converted||0)-derivedBefore.one)+
  Math.max(0,(a.derived2x?.().converted||0)-derivedBefore.two);
 const validityIssues=[];
 if(r.frameCounts?.active<Math.min(24,routeInfo.poses.length*.4))validityIssues.push('Zu wenige aktive Frames');
 if(ticks.samples<Math.min(20,routeInfo.poses.length*.4))validityIssues.push('Zu wenige rAF-Ticks');
 if((r.sampleLimit?.droppedFrames||0)>0||(r.sampleLimit?.droppedTiles||0)>0)
  validityIssues.push('Samplelimit erreicht');
 if(!endReady.ok)validityIssues.push('Rueckkehransicht nicht geladen');
 if(delta(before,after,'failures'))validityIssues.push('Kachel-Ladefehler');
 if(scenario==='lod'&&delta(before,moveStats,'lodSwitches')<4)
  validityIssues.push('Weniger als vier LOD-Wechsel');
 if(['region','pressure'].includes(scenario)&&delta(before,moveStats,'visibleReadStarts')<5)
  validityIssues.push('Neue Region nicht geladen (weniger als fuenf sichtbare Reads)');
 const variantCounts={};
 for(const f of r.frames||[]){
  if(f.activeVariant)variantCounts[f.activeVariant]=(variantCounts[f.activeVariant]||0)+1;
 }
 const record={
  label,feature,value,scenario,version,
  groupId:extras.groupId||null,block:extras.block||null,control:!!extras.control,
  production:feature==='production',success:true,
  valid:validityIssues.length===0,validityIssues,readiness,derivedConversions,
  missingDurationMs:readiness.missingDurationMs,longestMissingMs:readiness.longestMissingMs,
  measuredAt:new Date().toISOString(),
  frameSamples:r.frameCounts?.active??0,
  p95FrameGapMs:r.phasesMs?.frameGapMs?.p95??null,
  p95DrawMs:r.phasesMs?.drawMs?.p95??null,
  p95RafTickMs:ticks.p95RafTickMs,p50RafTickMs:ticks.p50RafTickMs,
  p99RafTickMs:ticks.p99RafTickMs,maxRafTickMs:ticks.maxRafTickMs,
  visibleIframePx:viewerVisibilityPx(),
  rafOver50:ticks.rafOver50,rafOver100:ticks.rafOver100,
  rafTickSamples:ticks.samples,
  p95WorldBlitMs:r.phasesMs?.worldBlitMs?.p95??null,
  p95CloudMs:r.phasesMs?.cloudMs?.p95??null,
  decodeRepeats:delta(before,after,'decodeRepeats'),
  evictions:delta(before,after,'evictions'),
  visibleReadStarts:delta(before,after,'visibleReadStarts'),
  prefetchReadStarts:delta(before,after,'prefetchReadStarts'),
  lodSwitches:delta(before,after,'lodSwitches'),
  lodRecencyEvictions:delta(before,after,'lodRecencyEvictions'),
  visibleBorrowStarts:delta(before,after,'visibleBorrowStarts'),
  prefetchLeadingStarts:delta(before,after,'prefetchLeadingStarts'),
  parallelTileDecodes:delta(before,after,'parallelTileDecodes'),
  parallelDecodeFailures:delta(before,after,'parallelDecodeFailures'),
  failures:delta(before,after,'failures')+delta(before,after,'parallelDecodeFailures'),
  decodedBefore:before.decoded,decodedAfter:after.decoded,
  decodedPixelsBefore:before.decodedPixels,decodedPixelsAfter:after.decodedPixels,
  maxDecodedPixels:after.maxDecodedPixels,peakInFlight:after.peakInFlight,
  variantCounts,ready:endReady,startReady,
  droppedFrames:r.sampleLimit?.droppedFrames??0,
  droppedTiles:r.sampleLimit?.droppedTiles??0,
  movementSteps:routeInfo.poses.length,
  durationMs:Math.round(performance.now()-start),
  coverage:{
   bothLods:!!variantCounts['1x']&&!!variantCounts['2x'],
   newReads:delta(before,after,'visibleReadStarts')+delta(before,after,'prefetchReadStarts')>0,
   noDataLoss:delta(before,after,'failures')===0,
   warning:scenario==='lod'&&!(variantCounts['1x']&&variantCounts['2x'])?
    'LOD-Wechsel nicht in beiden Varianten gemessen':
    scenario==='region'&&delta(before,after,'visibleReadStarts')===0?
    'Keine neuen sichtbaren Reads: Cache-Vergleich eingeschraenkt':null
  },
  raw:r
 };
 if(scenario==='lod'&&!record.coverage.bothLods){
  record.valid=false;record.validityIssues.push('1x/2x-Variantenabdeckung fehlt');
 }
 return record;
}

function median(values){return percentile(values,.50);}
function groupSummary(records,controls,id){
 const runs=records.filter(r=>r.groupId===id&&r.success);
 const example=runs[0];
 if(!example)return {groupId:id,qualified:false,status:'OHNE DATEN',issues:['Keine gueltigen Messungen']};
 const feature=example.feature,scenario=example.scenario;
 const aa=runs.filter(r=>r.value===0),bb=runs.filter(r=>r.value===1);
 const issues=[];
 if(aa.length!==4||bb.length!==4)issues.push('Nicht vier A- und vier B-Wiederholungen');
 if(runs.some(r=>!r.valid))issues.push('Ungueltige oder unvollstaendige Einzelmessungen');
 const signal={lodRecency:'lodRecencyEvictions',
  leadPrefetch:'prefetchLeadingStarts',visibleBorrow:'visibleBorrowStarts',
  parallelDecode:'parallelTileDecodes'}[feature];
 const triggers=bb.reduce((total,r)=>total+(r[signal]||0),0);
 const triggeredRuns=bb.filter(r=>(r[signal]||0)>0).length;
 if(triggers===0)issues.push('Wirkmechanismus nicht ausgeloest: '+signal);
 else if(triggeredRuns<2)issues.push('Wirkmechanismus nur in '+triggeredRuns+
  '/4 B-Laeufen ausgeloest: keine reproduzierbare Feature-Belastung');
 const conversions=runs.reduce((total,r)=>total+r.derivedConversions,0);
 const startA=median(aa.map(r=>r.decodedPixelsBefore));
 const startB=median(bb.map(r=>r.decodedPixelsBefore));
 const ramStartDifference=startA>0?Math.abs(startB-startA)/startA:null;
 if(ramStartDifference!==null&&ramStartDifference>.25&&Math.abs(startB-startA)>8000000)
  issues.push('A/B beginnen mit deutlich anderem RAM-Cachezustand');
 if(conversions)issues.push('Persistente 1x/2x-Cacheableitungen im Messintervall: '+conversions);
 const checkpoints=controls.filter(r=>r.scenario===scenario&&r.success);
 if(checkpoints.some(r=>!r.valid))issues.push('Mindestens eine Kontrollfahrt ungueltig');
 const drawValues=checkpoints.map(r=>r.p95DrawMs).filter(finite);
 const rafValues=checkpoints.map(r=>r.p95RafTickMs).filter(finite);
 const drawDrift=drawValues.length>1?Math.max(...drawValues)-Math.min(...drawValues):null;
 const rafDrift=rafValues.length>1?Math.max(...rafValues)-Math.min(...rafValues):null;
 if(rafDrift===null||drawDrift===null)issues.push('Fehlende unabhaengige Kontrollfahrt');
 if((rafDrift>12&&Math.max(...rafValues)>1.25*Math.min(...rafValues))||
    (drawDrift>8&&Math.max(...drawValues)>1.25*Math.min(...drawValues)))
   issues.push('Kontrollfahrten driften: rAF '+rafDrift+' ms, draw '+drawDrift+' ms');
 const metrics={};
 for(const key of ['p95RafTickMs','p95DrawMs','p95FrameGapMs','missingDurationMs','longestMissingMs']){
  const blocks=[];
  for(const block of [1,2]){
   const samples=runs.filter(r=>r.block===block);
   const av=samples.filter(r=>r.value===0).map(r=>r[key]).filter(finite);
   const bv=samples.filter(r=>r.value===1).map(r=>r[key]).filter(finite);
   if(av.length===2&&bv.length===2){
    const a=(av[0]+av[1])/2,b=(bv[0]+bv[1])/2;
    blocks.push({block,meanA:a,meanB:b,differenceMs:Math.round((b-a)*100)/100,
     ratio:b/a||null});
   }
  }
  metrics[key]={
   aMedian:median(aa.map(r=>r[key])),bMedian:median(bb.map(r=>r[key])),
   blocks};
 }
 const raf=metrics.p95RafTickMs;
 const rafDiff=(raf.bMedian??0)-(raf.aMedian??0);
 const relative=raf.aMedian>0?rafDiff/raf.aMedian:null;
 const consistent=raf.blocks.length===2&&
   ((raf.blocks[0].differenceMs>0&&raf.blocks[1].differenceMs>0)||
    (raf.blocks[0].differenceMs<0&&raf.blocks[1].differenceMs<0));
 const negligible=raf.blocks.length===2&&raf.blocks.every(b=>
  Math.abs(b.differenceMs)<=Math.max(3,b.meanA*.10));
 if(!consistent&&!negligible)
  issues.push('Grosse Unterschiede mit widerspruechlicher Richtung zwischen den Crossover-Bloecken');
 const qualified=issues.length===0;
 return {groupId:id,feature,scenario,total:runs.length,
  trigger:signal,triggerCount:triggers,triggeredBRuns:triggeredRuns,derivedConversions:conversions,
  ramStartMedianA:startA,ramStartMedianB:startB,ramStartDifference,
  checkpointCount:checkpoints.length,controlDrawRangeMs:drawDrift,
  controlRafRangeMs:rafDrift,metrics,
  rafRelativeDifference:relative==null?null:Math.round(relative*1000)/1000,
  qualified,issues,
  status:!qualified?'NICHT BELASTBAR':Math.abs(relative)<.10?
   'KEIN REPRODUZIERBARER UNTERSCHIED':'TENDENZ - IN ZWEITER FIREFOX-SITZUNG PRUEFEN'};
}
function summarizeSuite(report){
 const all=report.records||[];
 const controls=all.filter(r=>r.control);
 const groupIds=[...new Set(all.map(r=>r.groupId).filter(Boolean))];
 const comparisons=groupIds.map(id=>groupSummary(all,controls,id));
 const baselineDrift={};
 for(const scenario of ['warm','lod','region']){
  const b=all.filter(r=>r.version==='baseline'&&r.scenario===scenario&&r.success);
  if(b.length>=2)baselineDrift[scenario]={
   drawP95First:b[0].p95DrawMs,drawP95Last:b[b.length-1].p95DrawMs,
   rafP95First:b[0].p95RafTickMs,rafP95Last:b[b.length-1].p95RafTickMs};
 }
 return {schema:'vedras-windows-original-map-statistics-v3',
  releaseDecision:'KEIN AUTOMATISCHER MERGE ODER PERFORMANCE-GO',
  independence:'Messungen in einer Firefox-Sitzung sind NICHT unabhaengig. Zweite frische Sitzung fuer Freigabebewertung noetig.',
  method:'4 A + 4 B in gegenlaeufiger ABBA-/BAAB-Reihenfolge, isolierte Flags, Kontrollfahrten, getrennte Wirkungsnachweise',
  comparisons,qualifiedGroups:comparisons.filter(x=>x.qualified).length,
  unqualifiedGroups:comparisons.filter(x=>!x.qualified).length,
  invalidRuns:all.filter(x=>!x.valid).length,
  baselineDrift,controls:controls.map(r=>({scenario:r.scenario,
   p95RafTickMs:r.p95RafTickMs,p95DrawMs:r.p95DrawMs,measuredAt:r.measuredAt}))};
}

function row(r){
 const tr=document.createElement('tr');
 const cells=[r.label,r.p95FrameGapMs,r.p95DrawMs,r.decodeRepeats,r.evictions,
  r.visibleReadStarts,r.failures,r.ready?String(r.ready.ready)+'/'+r.ready.visible:'–'];
 for(const c of cells){const td=document.createElement('td');td.textContent=c==null?'–':String(c);tr.appendChild(td);}
 if(r.coverage?.warning||r.ready&&!r.ready.ok||!r.success)tr.style.background='#40342f';
 $('results').appendChild(tr);
}
function exportJson(){
 if(!latest)return;
 const blob=new Blob([JSON.stringify(latest,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;
 a.download='vedras_windows_complete_'+latest.mode+'_'+Date.now()+'.json';
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function lock(on){
 const ids=['start','startAll','scene','mode','feature','scenario','runOrder'];
 for(const id of ids){
  const e=$(id);if(!e)continue;
  const legacy=['start','mode','feature','scenario'].includes(id);
  e.disabled=on||(legacy&&window.__vedrasCombinedMode===true);
 }
 $('stopAll').disabled=!on;
}
async function combinedAvailable(){
 try{
  const response=await fetch('/__vedras_suite_mode',{cache:'no-store'});
  return response.ok&&(await response.text()).trim()==='combined-v1';
 }catch(_){return false;}
}

async function primeDerivedCache(scene,version,tiles){
 const a=await load(scene,version==='candidate'?'production':null,null,version);
 const start=a.pose();
 if(!start)throw Error('Preflight: Kamera nicht verfuegbar');
 const check=await settle(a);
 if(!check.ok)throw Error('Preflight: Startkarte unvollstaendig');
 const before={one:a.derived1x?.().converted||0,two:a.derived2x?.().converted||0};
 for(const scenario of ['lod','region']){
  const poses=route(start,scenario,tiles).poses;
  await drive(a,poses);
  const ok=await settle(a,15000);
  if(!ok.ok)throw Error('Preflight '+scenario+' nicht vollstaendig');
  a.testPan(start);
  await settle(a,12000);
 }
 return {version,derived1xNew:(a.derived1x?.().converted||0)-before.one,
  derived2xNew:(a.derived2x?.().converted||0)-before.two};
}
function makeTasks(order){
 const tasks=[];
 const baselineOrder=order==='reverse'?['region','lod','warm']:['warm','lod','region'];
 // Bracket the entire candidate campaign with same-version main control
 // at the beginning and end to reveal overall runtime drift.
 for(const scenario of baselineOrder){
  tasks.push({kind:'baseline',version:'baseline',feature:null,value:null,scenario,
   label:'Baseline Anfang / '+NAMES[scenario]});
 }
 const scenarioOrder=order==='reverse'?
  ['pressure','region','lod','warm']:['warm','lod','region','pressure'];
 for(const scenario of scenarioOrder){
  const candidates=scenario==='pressure'?['visibleBorrow']:
   ALL_FLAGS.slice().map((_,i)=>ALL_FLAGS[(i+scenarioOrder.indexOf(scenario))%4]);
  if(order==='reverse')candidates.reverse();
  function checkpoint(marker){
   tasks.push({kind:'control',version:'candidate',feature:null,value:null,scenario,
    control:true,label:'Kontrolle / '+NAMES[scenario]+' / '+marker});
  }
  checkpoint('Start');
  for(let i=0;i<candidates.length;i++){
   const feature=candidates[i],groupId=feature+'/'+scenario;
   for(const block of [1,2]){
    const sequence=block===1?[0,1,1,0]:[1,0,0,1];
    for(let j=0;j<sequence.length;j++){
     const value=sequence[j];
     tasks.push({kind:'feature',version:'candidate',feature,value,scenario,
      groupId,block,order:j+1,
      label:feature+' / '+NAMES[scenario]+' / Block '+block+' '+(value?'B':'A')+(j+1)});
    }
   }
   if(i===1&&candidates.length>2)checkpoint('Mitte');
  }
  checkpoint('Ende');
 }
 for(const scenario of baselineOrder){
  tasks.push({kind:'baseline',version:'baseline',feature:null,value:null,scenario,
   label:'Baseline Ende / '+NAMES[scenario]});
 }
 for(const scenario of ['warm','lod','region']){
  tasks.push({kind:'production',version:'candidate',feature:'production',value:null,scenario,
   label:'Produktiv-Konfiguration / '+NAMES[scenario]});
 }
 return tasks;
}
// Stop wasting an entire 124-run campaign when a repeated, unchanged
// candidate control shows order-of-magnitude timing drift. The stop is
// NOT a performance result: it is an environmental reliability warning.
function severeControlDrift(records,last){
 if(!last?.control||!last.success||!last.valid)return null;
 const c=records.filter(r=>r.control&&r.scenario===last.scenario&&r.success&&r.valid);
 if(c.length<3)return null;
 for(const [field,absolute,relative,minMax] of [
  ['p95RafTickMs',80,1.7,150],
  ['p95DrawMs',80,1.7,130]
 ]){
  const v=c.map(r=>r[field]).filter(finite);
  if(v.length<3)continue;
  const high=Math.max(...v),low=Math.min(...v);
  if(high-low>absolute&&high>relative*Math.max(1,low)&&high>minMax)
   return {scenario:last.scenario,metric:field,minimumMs:low,maximumMs:high,
    absoluteDriftMs:high-low,reason:'Starke Drift in unveraenderten Kontrollfahrten ('+
      field+': '+low+'-'+high+' ms). Firefox neu starten; Vergleich aus dieser Sitzung nicht freigeben.'};
 }
 return null;
}
function addComparisonRows(summary){
 const target=$('comparisons');
 if(!target)return;
 target.textContent='';
 for(const c of summary.comparisons){
  const tr=document.createElement('tr');
  for(const value of [c.feature,c.scenario,
   c.metrics?.p95RafTickMs?.aMedian,c.metrics?.p95RafTickMs?.bMedian,
   c.triggerCount,c.status]){
   const td=document.createElement('td');
   td.textContent=value==null?'–':String(value);
   tr.appendChild(td);
  }
  if(!c.qualified)tr.style.background='#40342f';
  target.appendChild(tr);
 }
}
async function suite(){
 if(running)return;
 const scene=$('scene').value.trim();
 if(!/^v1-[0-9a-f]{8}$/.test(scene)){status('Ungueltige Kartenkennung');return;}
 running=true;cancelled=false;latest=null;lock(true);
 $('downloadAll').disabled=true;
 $('results').textContent='';
 if($('comparisons'))$('comparisons').textContent='';
 let records=[],errors=[],tasks=[],attempted=0,prime=[];
 const started=new Date().toISOString();
 try{
  const combined=await combinedAvailable();
  if(!combined)throw Error('Fuer belastbare A/B-Messungen nur den kombinierten Read-only-Server (-Action All) verwenden.');
  status('Pruefe main und Kandidat, Kartenkennung und lokale Kachelschluessel …');
  const probe=await load(scene,null,null,'baseline');
  if('lodRecency' in probe.stats())throw Error('Baseline ist nicht main. Vergleich ungueltig.');
  const candidateProbe=await load(scene,'lodRecency',0,'candidate');
  if(!('lodRecency' in candidateProbe.stats()))throw Error('Kandidat ohne Test-Flags. Vergleich ungueltig.');
  const tiles=await tileCenters(scene);
  const order=$('runOrder')?.value==='reverse'?'reverse':'standard';
  tasks=makeTasks(order);
  latest={
   schema:'vedras-windows-original-map-full-suite-v3',
   at:started,scene,mode:'combined',order,browser:navigator.userAgent,
   origin:location.origin,plan:tasks.length+' Laeufe in zwei gegenlaeufigen Bloecken',
   methodologicalNotes:[
    'A/B: alle vier Feature-Flags deaktiviert; nur das untersuchte Feature ist im B-Lauf aktiviert.',
    'ABBA + BAAB: vier A- und vier B-Messungen pro Feature und Route; jeweils neue JS-RAM-Karte im iframe.',
    'Persistent gespeicherte abgeleitete 1x/2x-Bilder werden vorgewaermt und nie geloescht. Das ist KEIN echter disk-cold-Vergleich.',
    'Kontrollfahrten dienen zur Drift-Erkennung. Ein einziges Firefox-Session-Ergebnis erlaubt keine endgueltige Freigabe.',
    'Nur Renderer/JS- und rAF-Zeitmessungen; keine GPU-Present-FPS oder physische End-to-End-Latenz.',
    'Beobachtete Sichtbarkeitsluecken werden aus aktiven Frames abgeleitet; zwischen Frames koennen ungesehene Laecken liegen.'
   ],
   tasksPlanned:tasks.length,tilesIndexed:tiles.length,
   records,errors,preflight:prime,completed:false,
   environment:{hardwareConcurrency:navigator.hardwareConcurrency||null,
    deviceMemory:navigator.deviceMemory??null,
    viewport:{width:window.innerWidth,height:window.innerHeight},
    userAgent:navigator.userAgent}
  };
  window.__vedrasWindowsSuiteLatest=latest;
  // Normalize persistent derived image state without touching original PNGs.
  for(const version of ['baseline','candidate']){
   if(cancelled)break;
   status('Vorbereitung: gespeicherte 1x/2x-Ableitungen fuer '+version+' angleichen …');
   prime.push(await primeDerivedCache(scene,version,tiles));
  }
  for(const task of tasks){
   if(cancelled)break;
   attempted++;
   status('Vergleich '+attempted+'/'+tasks.length+': '+task.label+
    '. Firefox aktiv lassen. Kontrollfahrten markieren Drift.');
   try{
    const result=await measure(scene,task.feature,task.value,task.scenario,
     task.label,tiles,task.version,task);
    records.push(result);row(result);
    const unstable=severeControlDrift(records,result);
    if(unstable){
     latest.qualityStop={afterRun:attempted,...unstable};
     break;
    }
   }catch(error){
    const msg=String(error?.message||error);
    errors.push({run:attempted,...task,error:msg});
    row({...task,success:false,error:msg});
    // A one-off route error remains in the report; systemic failure stops.
    if(cancelled||/nicht erreichbar|Startansicht unvollstaendig|nicht isoliert|Kontrolle:|Schalter|Kandidat ohne|nicht main/.test(msg))
     break;
   }
   // Let the browser process detached canvases and asynchronous tasks
   // before allocating the next iframe; do not call explicit GC APIs.
   $('game').src='about:blank';
   await wait(600);
  }
  latest.attemptedRuns=attempted;
  latest.completedRuns=records.length;
  latest.finishedAt=new Date().toISOString();
  latest.completed=!cancelled&&!latest.qualityStop&&
   attempted===tasks.length&&errors.length===0;
  latest.statistics=summarizeSuite(latest);
  latest.warnings=records.filter(r=>!r.valid||!r.ready?.ok||r.coverage?.warning)
   .map(r=>({label:r.label,issues:r.validityIssues||[],
    coverage:r.coverage?.warning||null}));
  if(latest.qualityStop)latest.warnings.unshift({label:'QUALITAETSSTOPP',
   issues:[latest.qualityStop.reason]});
  addComparisonRows(latest.statistics);
  $('downloadAll').disabled=false;
  status((latest.qualityStop?'QUALITAETSSTOPP: '+latest.qualityStop.reason+' ': 
    cancelled?'Abgebrochen. ':'Fertig. ')+records.length+'/'+tasks.length+
   ' Messungen, '+errors.length+' Fehler, '+latest.statistics.unqualifiedGroups+
   ' nicht belastbare Gruppen. Gesamt-JSON lokal exportieren. Keine Mergefreigabe.');
  exportJson();
 }catch(error){
  const msg=String(error?.message||error);
  status('ABGEBROCHEN: '+msg+'. Keine Daten geloescht oder gebacken.');
  errors.push({run:attempted,error:msg});
  if(latest){
   latest.completed=false;latest.finishedAt=new Date().toISOString();
   latest.statistics=summarizeSuite(latest);
   $('downloadAll').disabled=false;
   exportJson();
  }
 }finally{
  $('game').src='about:blank';
  running=false;lock(false);
 }
}
combinedAvailable().then(isCombined=>{
 window.__vedrasCombinedMode=isCombined;
 if(isCombined)for(const id of ['start','mode','feature','scenario'])$(id).disabled=true;
}).catch(()=>{});
$('startAll').addEventListener('click',suite);
$('stopAll').addEventListener('click',()=>{cancelled=true;status('Stopp angefordert: laufenden Schritt beenden und bisherige Daten exportieren …');});
$('downloadAll').addEventListener('click',exportJson);
})();

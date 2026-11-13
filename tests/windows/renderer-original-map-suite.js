/* Originalkarten-Abnahme, ein Klick je Serverversion. Keine Schreib- oder Loeschoperationen an Atlas/Fog. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const features=['lodRecency','leadPrefetch','visibleBorrow','parallelDecode'];
const scenarios=['warm','lod','region'];
const NAMES={warm:'Warme Fahrt',lod:'1x/2x-Zoomwechsel',region:'Neue Region + Rueckfahrt'};
const wait=ms=>new Promise(ok=>setTimeout(ok,ms));
const nextFrame=()=>new Promise(ok=>requestAnimationFrame(ok));
const finite=n=>Number.isFinite(n);
let running=false,cancelled=false,latest=null;
function status(message){$('status').textContent=message;}
function percentile(values,p){
 const v=values.filter(finite).sort((a,b)=>a-b);
 return v.length?v[Math.min(v.length-1,Math.ceil(v.length*p)-1)]:null;
}
function api(){
 try{return $('game').contentWindow.__vedrasFrozenGameTest||null;}
 catch(_){return null;}
}
async function load(scene,feature,value){
 $('game').src='about:blank';await wait(75);
 const url=new URL('frozen-map-game.html',location.href);
 url.searchParams.set('scene',scene);
 url.searchParams.set('lod','near');
 url.searchParams.set('perf','1');
 url.searchParams.set('parallelDecode','0');
 if(feature!==null)url.searchParams.set(feature,String(value));
 $('game').src=url.href;
 const until=performance.now()+35000;
 while(performance.now()<until){
  if(cancelled)throw Error('Vom Benutzer abgebrochen');
  const a=api();
  if(a&&a.readOnly&&a.testPan&&a.stats?.().saved>0)return a;
  await wait(110);
 }
 throw Error('Originalkarte nicht erreichbar. Firefox-Profil, Karten-ID und 127.0.0.1:8780 pruefen. Keine Daten loeschen.');
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
  if(a.testPan(p)!==true)throw Error('Diagnose-Kamera-API nicht verfuegbar');
  await nextFrame();
  const now=performance.now();
  if(last!==null)ticks.push(now-last);
  last=now;
 }
 for(let i=0;i<3;i++)await nextFrame();
 return {p95RafTickMs:percentile(ticks,.95),samples:ticks.length};
}
function delta(a,b,key){return Math.max(0,(b[key]||0)-(a[key]||0));}
async function measure(scene,feature,value,scenario,label,tiles){
 const a=await load(scene,feature,value);
 const base=a.pose();
 if(!base)throw Error('Keine Startkamera');
 const routeInfo=route(base,scenario,tiles);
 const startReady=await settle(a);
 if(!startReady.ok)throw Error('Startansicht unvollstaendig: '+startReady.ready+'/'+startReady.visible);
 a.profileReset();
 const before=a.stats();
 const start=performance.now();
 const ticks=await drive(a,routeInfo.poses);
 const movingReport=a.profileReport();
 const endReady=await settle(a);
 const after=a.stats();
 const r=movingReport;
 const variantCounts={};
 for(const f of r.frames||[]){
  if(f.activeVariant)variantCounts[f.activeVariant]=(variantCounts[f.activeVariant]||0)+1;
 }
 const record={
  label,feature,value,scenario,success:true,
  measuredAt:new Date().toISOString(),
  frameSamples:r.frameCounts?.active??0,
  p95FrameGapMs:r.phasesMs?.frameGapMs?.p95??null,
  p95DrawMs:r.phasesMs?.drawMs?.p95??null,
  p95RafTickMs:ticks.p95RafTickMs,rafTickSamples:ticks.samples,
  p95WorldBlitMs:r.phasesMs?.worldBlitMs?.p95??null,
  p95CloudMs:r.phasesMs?.cloudMs?.p95??null,
  decodeRepeats:delta(before,after,'decodeRepeats'),
  evictions:delta(before,after,'evictions'),
  visibleReadStarts:delta(before,after,'visibleReadStarts'),
  prefetchReadStarts:delta(before,after,'prefetchReadStarts'),
  lodSwitches:delta(before,after,'lodSwitches'),
  visibleBorrowStarts:delta(before,after,'visibleBorrowStarts'),
  prefetchLeadingStarts:delta(before,after,'prefetchLeadingStarts'),
  parallelTileDecodes:delta(before,after,'parallelTileDecodes'),
  failures:delta(before,after,'failures')+delta(before,after,'parallelDecodeFailures'),
  decodedBefore:before.decoded,decodedAfter:after.decoded,
  decodedPixelsBefore:before.decodedPixels,decodedPixelsAfter:after.decodedPixels,
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
 return record;
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
 const ids=['start','startAll','scene','mode','feature','scenario'];
 for(const id of ids){const e=$(id);if(e)e.disabled=on;}
 $('stopAll').disabled=!on;
}
async function suite(){
 if(running)return;
 const scene=$('scene').value.trim();
 if(!/^v1-[0-9a-f]{8}$/.test(scene)){status('Ungueltige Kartenkennung');return;}
 running=true;cancelled=false;latest=null;lock(true);
 $('downloadAll').disabled=true;
 $('results').textContent='';
 let records=[],errors=[];
 const started=new Date().toISOString();
 let mode='unknown',run=0,total=0;
 try{
  status('Pruefe Originalkarte und lese nur Kachelkoordinaten …');
  const probe=await load(scene,null,null);
  const stats=probe.stats();
  mode=Object.prototype.hasOwnProperty.call(stats,'lodRecency')?'candidate':'baseline';
  const tiles=await tileCenters(scene);
  const tasks=[];
  if(mode==='baseline'){
   for(const scenario of scenarios)tasks.push({feature:null,value:null,scenario,label:'Baseline / '+NAMES[scenario]});
  }else{
   for(const feature of features)for(const scenario of scenarios)
    for(const value of [0,1,1,0])
     tasks.push({feature,value,scenario,label:feature+' / '+NAMES[scenario]+' / '+(value?'B':'A')});
  }
  total=tasks.length;
  latest={schema:'vedras-windows-original-map-full-suite-v2',at:started,scene,mode,
   browser:navigator.userAgent,origin:location.origin,
   plan:mode==='candidate'?'4 Features x 3 Routen x A/B/B/A':'3 Referenzrouten',
   persistedCacheCaveat:'A/B/B/A laedt iframe-Speicher neu, loescht jedoch keinerlei persistente 1x/2x-Ableitungen. Spaetere Laeufe koennen vom Warm-Cache profitieren.',
   fpsCaveat:'frameGapMs und RAF-Ticks sind keine GPU-Present-FPS.',
   tilesIndexed:tiles.length,records,errors,completed:false};
  window.__vedrasWindowsSuiteLatest=latest;
  for(const task of tasks){
   if(cancelled)break;
   run++;
   status('Automatischer Lauf '+run+'/'+total+': '+task.label+'. Firefox-Tab im Vordergrund lassen. Keine Bilddaten werden hochgeladen.');
   try{
    const result=await measure(scene,task.feature,task.value,task.scenario,task.label,tiles);
    records.push(result);row(result);
   }catch(e){
    const msg=String(e?.message||e);
    errors.push({run,...task,error:msg});
    const failure={...task,success:false,p95FrameGapMs:null,p95DrawMs:null,error:msg};
    row(failure);
    if(cancelled||/Originalkarte nicht erreichbar|Startansicht unvollstaendig/.test(msg))break;
   }
  }
  latest.completed=!cancelled&&run===total&&errors.length===0;
  latest.finishedAt=new Date().toISOString();
  latest.completedRuns=records.length;
  latest.attemptedRuns=run;
  latest.warnings=records.filter(r=>r.coverage?.warning||!r.ready?.ok).map(r=>({label:r.label,warning:r.coverage?.warning||'Zielansicht nicht vollstaendig'}));
  const report='Abgeschlossen: '+records.length+'/'+total+' Laeufe, Fehler: '+errors.length+
   ', Abdeckungswarnungen: '+latest.warnings.length+
   '. Ergebnisse werden als eine JSON-Datei gespeichert. Keine automatische Merge-Freigabe.';
  status((cancelled?'Gestoppt. ': '')+report);
  $('downloadAll').disabled=false;
  exportJson();
 }catch(e){
  const msg=String(e?.message||e);
  status('Abbruch: '+msg+'. Keine Loeschung, kein Bake. Bereits gemessene Daten bleiben exportierbar.');
  errors.push({run,error:msg});
  if(latest){latest.errors=errors;latest.completed=false;latest.finishedAt=new Date().toISOString();
   $('downloadAll').disabled=false;exportJson();}
 }finally{running=false;lock(false);}
}
$('startAll').addEventListener('click',suite);
$('stopAll').addEventListener('click',()=>{cancelled=true;status('Stopp angefordert: laufenden Schritt beenden und bisherige Daten exportieren …');});
$('downloadAll').addEventListener('click',exportJson);
})();

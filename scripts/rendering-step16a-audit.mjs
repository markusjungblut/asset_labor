#!/usr/bin/env node
/* Step 16A: architecture audit only. No renderer, asset or cache settings changed. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';
import {launch,preflight,waitFor,importScene,setControls,setCamera,settle,
 snapshot,measureMetrics,delta,percentile} from './rendering-step13-browser.mjs';

function args(argv){
 const options={url:'http://127.0.0.1:8780/',
  scene:resolve('artifacts/rendering-step13/vedras_scene.json'),
  out:resolve('artifacts/rendering-step16a-audit'),
  qualities:['4','auto'],frames:90,settleMs:12000,headed:false};
 for(let i=0;i<argv.length;i++){
  const key=argv[i];
  if(key==='--help'){options.help=true;continue;}
  if(key==='--headed'){options.headed=true;continue;}
  if(!['--url','--scene','--out','--qualities','--frames','--settle-ms','--chrome'].includes(key))
   throw Error('Unknown option '+key);
  const value=argv[++i];
  if(value===undefined)throw Error('Missing value for '+key);
  if(key==='--url')options.url=value;
  if(key==='--scene')options.scene=resolve(value);
  if(key==='--out')options.out=resolve(value);
  if(key==='--qualities')options.qualities=value.split(',');
  if(key==='--frames')options.frames=Number(value);
  if(key==='--settle-ms')options.settleMs=Number(value);
  if(key==='--chrome')options.chrome=value;
 }
 if(!options.help){
  const url=new URL(options.url);
  if(url.protocol!=='http:'||!['localhost','127.0.0.1','[::1]'].includes(url.hostname))
   throw Error('Step16A must use the private local editor server');
  if(options.qualities.some(q=>!['4','auto'].includes(q))||!options.qualities.length)
   throw Error('Select 4 and/or auto only');
  if(!Number.isInteger(options.frames)||options.frames<45||options.frames>300)
   throw Error('Frames must be 45..300');
  if(!Number.isInteger(options.settleMs)||options.settleMs<3000||options.settleMs>30000)
   throw Error('Settle-ms must be 3000..30000');
 }
 return options;
}
function summarizeTrace(trace){
 const counts={invalidations:{},assetEvents:{},bakes:{},cacheMisses:{},types:trace?.counts||{}};
 for(const event of trace?.events||[]){
  const d=event.detail||{};
  const push=(group,key)=>{const k=String(key||'unknown');group[k]=(group[k]||0)+1;};
  if(event.type==='tile.invalidate')push(counts.invalidations,d.reason);
  if(event.type==='asset.invalidate')push(counts.assetEvents,d.reason);
  if(event.type==='tile.bake')push(counts.bakes,d.outcome);
  if(event.type==='tile.cache-miss')push(counts.cacheMisses,d.reason);
 }
 return {...counts,dropped:trace?.dropped||0,totalEvents:trace?.totalEvents||0,
  attributionComplete:(trace?.dropped||0)===0};
}
function simplify(snapshot){
 const w=snapshot?.world||{},p=snapshot?.quality?.images||{};
 return {active:w.active,tiles:w.tiles,pending:w.pending,failed:w.failed,
  retryExhausted:w.retryExhausted,visible:w.visible,coverage:w.coverage,
  progress:w.progress,bakes:snapshot?.camera?.worldTileBakes,
  groundReuse:snapshot?.camera?.groundReuse,
  sceneryBuilds:snapshot?.camera?.sceneryBuilds,
  terrainBuilds:snapshot?.camera?.terrainBuilds,
  imagePool:{decodedBytes:p.decodedBytes,limitBytes:p.limitBytes,
   protectedBytes:p.protectedBytes,protectedAssets:p.protectedAssets,
   resident:p.resident,queued:p.queued,active:p.active,evicted:p.evicted,
   ready:p.ready,overLimitBytes:p.overLimitBytes,
   previewSpritePx:p.previewSpritePx,previewTerrainPx:p.previewTerrainPx}};
}
function cameraCondition(s){
 return !!s?.active&&s?.pending===0&&s?.retryExhausted===0&&
  s?.progress?.exact===1&&s?.progress?.missing===0&&
  s?.progress?.provisional===0&&s?.coverage>=.999;
}
function buildDecision(run){
 const synthetic=run.control;
 const warm=run.real.filter(p=>p.kind?.startsWith('warm-'));
 const clean=warm.filter(p=>p.valid);
 const reasons=[];
 if(!synthetic?.valid)reasons.push('Independent compositor control invalid: cannot isolate camera costs');
 if(!clean.length)reasons.push('No valid real warm run; cannot claim FPS improvement or choose rewrite');
 if(run.real.some(p=>p.start?.imagePool?.protectedBytes>p.start?.imagePool?.limitBytes))
  reasons.push('Protected decoded image bytes alone exceed the image budget');
 if(run.real.some(p=>!p.valid))
  reasons.push('Actual real camera still allocates/rebuilds or fails readiness');
 const pass=Boolean(synthetic?.valid&&warm.length>0&&clean.length===warm.length);
 return {status:pass?'REAL_WARM_MEASURED':'INSUFFICIENT_REAL_WARM_EVIDENCE',
  rendererRewriteRecommended:false,
  recommendation:!synthetic?.valid?
   'Inspect compositor-only pipeline first; the isolated control did not validate':
   !clean.length?'Investigate real scene preparation/readiness and asset lifetimes before changing backend':
   'Compare compositor-only and real-warm frame timing and memory; prioritize measured deltas',
  blockers:reasons};
}

// Runs in the actual editor, after initial loading. Never patches renderer
// internals or suppresses legitimate invalidations.
async function editorCameraProbe(kind,frames){
 const v=window.VedrasAssetLabor;
 const old={zoom:v.state.zoom,panX:v.state.panX,panY:v.state.panY};
 const intervals=[],drawMs=[];
 let last=null;
 try{
  if(!v.activateTileCamera())return {activated:false,intervals:[],drawMs:[]};
  for(let i=0;i<frames;i++){
   const start=await new Promise(resolve=>requestAnimationFrame(resolve));
   if(last!==null)intervals.push(start-last);
   last=start;
   const fraction=(i+1)/frames;
   const wave=Math.sin(Math.PI*2*fraction);
   if(kind==='pan'){
    v.state.panX=old.panX+wave*90;
    v.state.panY=old.panY+wave*20;
   }else{
    // Remain within the mid LOD used by the original 0.70 reference camera.
    v.state.zoom=old.zoom+.055*(1-Math.cos(2*Math.PI*fraction));
   }
   const t=performance.now();
   v.requestDraw();
   drawMs.push(performance.now()-t);
  }
 }finally{
  v.state.zoom=old.zoom;v.state.panX=old.panX;v.state.panY=old.panY;
  v.requestDraw();
 }
 return {activated:true,intervals,drawMs};
}

// Runs on step16a-control.html, whose only loaded app script is the
// production world-tile-streamer.js. No editor/decoding/terrain code exists.
async function compositorOnlyProbe(kind,frames){
 const canvas=document.createElement('canvas');
 canvas.width=900;canvas.height=600;
 document.body.append(canvas);
 const compositor=window.VedrasWorldTiles.create({
  canvas,source:null,maxTiles:64,maxPixels:26000000,
  requireScenery:true,lodSelector:()=> 'mid'
 });
 const tiles=[];
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){
  const tile={id:col+','+row,x:(col-2)*512,y:(row-2)*512,
   size:512,visibility:'visible'};
  const ground=document.createElement('canvas'),scenery=document.createElement('canvas');
  for(const c of [ground,scenery]){c.width=768;c.height=653;}
  ground.getContext('2d').fillRect(0,0,ground.width,ground.height);
  scenery.getContext('2d').fillRect(15,15,50,50);
  if(!compositor.seed(tile,'mid',{complete:true,revision:'immutable-v1',
   layers:[{layer:'ground',image:ground},{layer:'scenery',image:scenery}]}))
   throw Error('One of the immutable compositor tiles was not seeded');
  tiles.push(tile);
 }
 const initial=compositor.stats(),measure=[],frameIntervals=[],frameMs=[];
 let last=null,coverMin=1,sourcePending=false;
 for(let i=0;i<frames;i++){
  const now=await new Promise(resolve=>requestAnimationFrame(resolve));
  if(last!==null)frameIntervals.push(now-last);
  last=now;
  const fraction=(i+1)/frames,wave=Math.sin(Math.PI*2*fraction);
  const view={width:900,height:600,dpr:1,projectY:.85,
   zoom:kind==='zoom'?.72+.085*(1-Math.cos(2*Math.PI*fraction)):.72,
   panX:kind==='pan'?wave*90:0,panY:kind==='pan'?wave*20:0};
  const t=performance.now();
  compositor.request(view,tiles);
  const result=compositor.render(view);
  measure.push(performance.now()-t);
  frameMs.push(result.renderMs);
  coverMin=Math.min(coverMin,result.coverage);
  if(result.pending||result.missing||result.provisional)sourcePending=true;
 }
 const end=compositor.stats();
 canvas.remove();
 return {kind,seeded:initial.tiles,retained:end.tiles,
  completedChange:end.completed-initial.completed,
  evictedChange:end.evicted-initial.evicted,
  minCoverage:coverMin,sourcePending,
  viewportRafIntervals:frameIntervals,renderWallMs:measure,
  compositorReportedMs:frameMs,
  cachePixels:end.pixels,cacheBytes:end.bytes};
}
async function main(){
 const o=args(process.argv.slice(2));
 if(o.help){console.log('node scripts/rendering-step16a-audit.mjs --url LOCAL --qualities 4,auto --frames 90');return;}
 const sceneRaw=await readFile(o.scene),scene=JSON.parse(sceneRaw);
 if(scene.sceneSize!==397||(scene.natureInstances||[]).length!==2631)
  throw Error('Step16A requires the unchanged 397-hex/2631-nature scene');
 await preflight(o.url);
 await mkdir(o.out,{recursive:true});
 const run={schema:'vedras-step16a-audit-v1',timestamp:new Date().toISOString(),
  sceneSha256:createHash('sha256').update(sceneRaw).digest('hex'),
  source:'real editor + production compositor-only control',
  environment:{qualities:o.qualities,frames:o.frames},real:[],control:[],
  warnings:[],errors:[]};
 let engine;
 try{
  engine=await launch(o.url,o);
  const c=engine.cdp;
  await waitFor(()=>c.eval('Boolean(window.VedrasAssetLabor?.enableStep15Trace)'),
   'Asset-Labor hooks',30000);
  await waitFor(()=>c.eval('window.VedrasAssetLabor?.assets?.().length>0'),
   'Asset-Labor assets',30000);
  await c.eval('window.VedrasBenchmarkProfiler?.enable(true)');
  const importStarted=Date.now();
 run.import=await importScene(c,o.scene);
 run.importMs=Date.now()-importStarted;
  for(const quality of o.qualities){
   console.log('Step16A real scene quality '+quality);
   await setControls(c,quality,false);
   await setCamera(c,{q:0,r:0},.70);
   await c.eval('window.VedrasAssetLabor.enableStep15Trace(true)');
   await c.eval('window.VedrasAssetLabor.resetStep15Trace("16a-preparation")');
   const t0=Date.now(),cold=await settle(c,o.settleMs);
   const prepared=await snapshot(c);
   run.real.push({quality,kind:'preparation',ready:cold.ready,
    prepareMs:Date.now()-t0,reasons:cold.reasons||[],
    stats:simplify(prepared),
    trace:summarizeTrace(await c.eval('window.VedrasAssetLabor.step15Trace()'))});
   for(const kind of ['pan','zoom']){
    await setCamera(c,{q:0,r:0},.70);
    const gate=await settle(c,o.settleMs);
    // Track state across an additional quiet interval; "READY" for a single
    // instant is insufficient to call the next phase a warm measurement.
    const before=await snapshot(c);
    await sleep(1200);
    const pre=await snapshot(c);
    const start=simplify(pre),previous=simplify(before);
    const quiet=gate.ready&&cameraCondition(start)&&
     start.bakes===previous.bakes&&
     start.imagePool.queued===0&&start.imagePool.active===0&&
     start.imagePool.ready===previous.imagePool.ready&&
     start.imagePool.evicted===previous.imagePool.evicted;
    await c.eval('window.VedrasAssetLabor.resetStep15Trace("16a-real-warm")');
    const startCpu=await measureMetrics(c),probe=await c.eval(
     '('+editorCameraProbe.toString()+')('+JSON.stringify(kind)+','+o.frames+')');
    const endCpu=await measureMetrics(c),after=await snapshot(c);
    const trace=summarizeTrace(await c.eval('window.VedrasAssetLabor.step15Trace()'));
    const end=simplify(after);
    const mutating=(trace.types['tile.invalidate']||0)>0||
      (trace.types['tile.cache-miss']||0)>0||
      (trace.types['tile.bake']||0)>0||
      (trace.types['asset.invalidate']||0)>0||
      start.bakes!==end.bakes||
      start.imagePool.ready!==end.imagePool.ready||
      start.imagePool.evicted!==end.imagePool.evicted;
    const valid=quiet&&cameraCondition(end)&&probe.activated&&
     !mutating&&trace.dropped===0;
    run.real.push({quality,kind:'warm-'+kind,valid,
     gateReady:gate.ready,quiet,mutating,
     start,end,trace,cpuTaskSeconds:delta(startCpu,endCpu,'TaskDuration'),
     frame:{count:probe.intervals.length,p50:percentile(probe.intervals,.5),
      p95:percentile(probe.intervals,.95),
      syncDrawP95Ms:percentile(probe.drawMs,.95)},
     invalidReasons:[...(!gate.ready?gate.reasons:[]),
      ...(!quiet?['not-quiescent-before-sampling']:[]),
      ...(mutating?['asset/tile work occurred during camera-only test']:[])]});
    console.log('  '+kind+': '+(valid?'VALID REAL WARM':'NOT WARM')+
     ', exact '+String(end.progress?.exact)+', tile events '+trace.totalEvents);
   }
   await c.eval('window.VedrasAssetLabor.enableStep15Trace(false)');
  }
  // A separate page removes the entire editor and all live asset work from
  // the compositor control. It still loads the ACTUAL production tile module.
  const controlUrl=new URL('step16a-control.html',o.url).href;
  await c.send('Page.navigate',{url:controlUrl});
  await waitFor(()=>c.eval('Boolean(window.VedrasWorldTiles?.create)'),
   'isolated production compositor',20000);
  for(const kind of ['pan','zoom']){
   const raw=await c.eval('('+compositorOnlyProbe.toString()+')('+
    JSON.stringify(kind)+','+o.frames+')');
   const valid=raw.seeded===16&&raw.retained===16&&
    raw.completedChange===0&&raw.evictedChange===0&&
    !raw.sourcePending&&raw.minCoverage>=.999;
   run.control.push({kind,valid,seeded:raw.seeded,retained:raw.retained,
    cacheBytes:raw.cacheBytes,coverageMin:raw.minCoverage,
    sourcePending:raw.sourcePending,completedChange:raw.completedChange,
    evictedChange:raw.evictedChange,
    frame:{count:raw.viewportRafIntervals.length,
     p50:percentile(raw.viewportRafIntervals,.5),
     p95:percentile(raw.viewportRafIntervals,.95),
     requestRenderP95Ms:percentile(raw.renderWallMs,.95),
     compositeP95Ms:percentile(raw.compositorReportedMs,.95)}});
   console.log('  compositor-only '+kind+' '+(valid?'VALID':'INVALID')+
    ', p95 '+run.control.at(-1).frame.requestRenderP95Ms+'ms');
  }
 }catch(error){
  run.errors.push(String(error?.stack||error));
 }finally{
  run.decision=buildDecision({...run,control:{
   valid:run.control.length===2&&run.control.every(x=>x.valid)
  }});
  const lines=['# Schritt 16A – Architektur-/Performanceaudit','',
   '**Status:** '+run.decision.status,
   '**Szene SHA-256:** '+run.sceneSha256,
   '**Keine Renderingoptimierungen in diesem Lauf.**','',
   '## Produktionscompositor allein (statische 16 vorbereitete Tiles)','',
   '| Geste | Test gültig | rAF-p95 ms | request+render-p95 ms | compositor-p95 ms |',
   '|---|---|---:|---:|---:|',
   ...run.control.map(x=>'| '+[x.kind,x.valid?'ja':'NEIN',x.frame.p95,
    x.frame.requestRenderP95Ms,x.frame.compositeP95Ms].join(' | ')+' |'),
   '','## Reale 397-Hex-Szene','',
   '| Qualität | Phase | Bereit/gültig | rAF-p95 ms | Bake-Events | Tile-Invalidierungen | geschützte MiB / Budget MiB |',
   '|---|---|---|---:|---:|---:|---:|',
   ...run.real.map(x=>'| '+[x.quality,x.kind,
    x.kind==='preparation'?(x.ready?'bereit':'NEIN'):(x.valid?'gültig':'UNGÜLTIG'),
    x.frame?.p95??'–',x.trace?.types?.['tile.bake']??0,
    x.trace?.types?.['tile.invalidate']??0,
    ((x.end||x.stats)?.imagePool?.protectedBytes/1048576||0).toFixed(1)+
    ' / '+(((x.end||x.stats)?.imagePool?.limitBytes||0)/1048576).toFixed(1)
   ].join(' | ')+' |'),
   '','## Entscheidung','',run.decision.recommendation,
   ...run.decision.blockers.map(x=>'- '+x),
   '','Nicht READY/ohne quiet gate gemessene Framezeiten sind diagnostisch, kein FPS-Abnahmebeleg.',
   'Die isolierten Testkacheln sind bewusst synthetisch: Sie messen nur',
   'die unveränderte Kompositionsfunktion, nicht reale Sprite- oder Terrainvorbereitung.',
   'Erst 16A-Gate, dann gezielte 16B-Änderungen; 16C nur nach Windows-Hardwarewiederholungen.',
   ''];
  await writeFile(join(o.out,'result.json'),JSON.stringify(run,null,2));
  await writeFile(join(o.out,'README.md'),lines.join('\n'));
  if(engine){engine.cdp.close();await engine.clean();}
 }
 console.log('Step16A result: '+run.decision.status+' in '+o.out);
 if(run.errors.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});

#!/usr/bin/env node
/* Step 15: observe, never optimize. Capture explicit tile/revision causes on
 * the fixed 397-hex scene, plus grounded camera/biome/fog diagnostics.
 */
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';
import {launch,preflight,waitFor,importScene,setControls,setCamera,settle,
 phase,screenshot,snapshot} from './rendering-step13-browser.mjs';
function args(argv){
 const o={url:'http://127.0.0.1:8780/',scene:resolve('artifacts/rendering-step13/vedras_scene.json'),
  out:resolve('artifacts/rendering-step15-diagnostics'),qualities:['4','auto'],
  duration:1800,warmup:1500,headed:false};
 for(let i=0;i<argv.length;i++){
  const key=argv[i];
  if(key==='--help'){o.help=true;continue;}
  if(key==='--headed'){o.headed=true;continue;}
  if(!['--url','--scene','--out','--qualities','--duration','--warmup','--chrome'].includes(key))
   throw Error('Unknown argument '+key);
  const value=argv[++i];if(value===undefined)throw Error('Missing value for '+key);
  if(key==='--url')o.url=value;
  if(key==='--scene')o.scene=resolve(value);
  if(key==='--out')o.out=resolve(value);
  if(key==='--qualities')o.qualities=value.split(',');
  if(key==='--duration')o.duration=Number(value);
  if(key==='--warmup')o.warmup=Number(value);
  if(key==='--chrome')o.chrome=value;
 }
 if(!o.help){
  const url=new URL(o.url);
  if(url.protocol!=='http:'||!['localhost','127.0.0.1','[::1]'].includes(url.hostname))
   throw Error('Local server required');
  if(!o.qualities.length||o.qualities.some(q=>!['fast','auto','1','2','3','4'].includes(q)))
   throw Error('Unknown quality');
  if(!Number.isFinite(o.duration)||o.duration<1500||o.duration>10000)
   throw Error('Duration 1500–10000 ms');
  if(!Number.isFinite(o.warmup)||o.warmup<0||o.warmup>10000)
   throw Error('Warmup 0–10000 ms');
 }
 return o;
}
function describe(trace){
 const events=trace?.events||[],bakes=events.filter(x=>x.type==='tile.bake');
 const misses=events.filter(x=>x.type==='tile.cache-miss');
 const grouper=arr=>Object.fromEntries([...arr.reduce((m,e)=>{
  const key=String(e.detail?.reason||e.detail?.outcome||'unknown');
  m.set(key,(m.get(key)||0)+1);return m;
 },new Map())]);
 const long=(trace?.slowBakes||bakes).filter(x=>x.detail?.wallMs>100)
  .sort((a,b)=>b.detail.wallMs-a.detail.wallMs).slice(0,20);
 const terrain=events.filter(x=>x.type==='terrain.draw');
 const roads=events.filter(x=>x.type==='roads.draw');
 const fallback=terrain.filter(x=>x.detail?.origin==='world-tile-fallback');
 return {
  events:trace?.totalEvents??0,dropped:trace?.dropped??0,
  cacheMissReasons:grouper(misses),bakeOutcomes:grouper(bakes),
  invalidations:events.filter(x=>x.type==='tile.invalidate'),
  lodChanges:events.filter(x=>x.type==='tile.lod'),
  stagingSignatureChanges:events.filter(x=>x.type==='tile.snapshot-signature-change'),
  longestTileBakes:long,
  terrainDraws:terrain.length,roadDraws:roads.length,
  fallbackTerrainDraws:fallback.length,
  fallbackGroundMs:+fallback.reduce((n,x)=>n+(x.detail?.wallMs||0),0).toFixed(2),
  requests:events.filter(x=>x.type==='camera.request').length
 };
}
function readme(run){
 const lines=['# Schritt 15 – Tile- und Kameradiagnose','',
  '**Status:** '+run.status,'**Szene:** '+run.sceneSha256,
  '**Beobachtung, keine Optimierung:** Das Rendering wurde nicht absichtlich beschleunigt.',
  'Weltkachel-/Snapshot-Ereignisse und Geländezuordnung sind Diagnosewerte, keine visuelle Freigabe.',
  '','## Pan/Zoom mit Tile-IDs und konkreten Cache-Miss-Gründen','',
  '| Qualität | Geste | Start ready | Ende ready | p95 (ms) | Main-Thread Task (s) | Terrain-Fallback-Aufrufe | Fallback-Terrainzeit (ms) | Cache Misses | Lange Bakes |',
  '|---|---|---|---|---:|---:|---:|---:|---:|---:|'];
 for(const p of run.phases)lines.push('| '+[
  p.quality,p.kind,p.start.ready?'ja':'NEIN',p.end.ready?'ja':'NEIN',
  p.performance.frameIntervalMs.p95??'–',p.performance.cpuTaskSeconds??'–',
  p.analysis.fallbackTerrainDraws,p.analysis.fallbackGroundMs,
  Object.values(p.analysis.cacheMissReasons).reduce((a,b)=>a+b,0),
  p.analysis.longestTileBakes.length].join(' | ')+' |');
 lines.push('','## Auslösegründe der teuersten Kacheln','',
  ...run.phases.flatMap(p=>p.analysis.longestTileBakes.slice(0,8).map(x=>
   '- '+p.quality+'/'+p.kind+' **'+x.detail.id+'** / '+x.detail.level+
   ': '+x.detail.wallMs.toFixed(1)+' ms; Ergebnis '+x.detail.outcome+
   ', Snapshot '+x.detail.snapshotReason)),
  '','## Kamera/Geografie (Soll ist Szenen-JSON, Ist ist editorseitiger Geländetyp)','',
  '| Region | Soll Hex | Kameramitte Hex | Soll-Biom | Effektives Biom | gleich? | Fog-Zentrum |',
  '|---|---|---|---|---|---|---|',
  ...run.cameraChecks.map(p=>'| '+[
   p.label, p.q+','+p.r,p.diag.actualCenter.id,
   p.diag.target.expectedTerrain??'–',p.diag.actualCenter.effectiveTerrain??'–',
   p.diag.actualCenter.terrainMatchesReference===null?'nicht bekannt':
    p.diag.actualCenter.terrainMatchesReference?'ja':'NEIN',
   p.diag.selectedFogOrigin].join(' | ')+' |'),
  '','## Entscheidungsregel','',
  '- Quelle des nächsten Eingriffs ist die tatsächliche Ereigniszeitlinie in result.json, nicht die subjektive Wirkung des Screenshots.',
  '- Step 16 erst nach Prüfung von Tile-ID, Cache-Miss- und Invalidierungsgrund auf der Zielhardware.',
  '- Falls Trace-Ereignisse verworfen wurden, Diagnosetest kürzer ausführen; dropped ist kein Fehler in der Renderinglogik.',
  '- Readiness-gate false bleibt diagnostisch und darf nicht in FPS-Abnahme einfließen.',
  '- Die aufgezeichneten Zeitspannen beinhalten ggf. Wartezeit und verschachtelte Arbeit; keine Summen über Kategorien bilden.',
  '- Byte-/Pixelvergleich für Wasser, Fog und Höhen über PNGs separat durchführen.',
  '','Alle Ereignisse, Tile-IDs und Revisionen stehen in result.json; Screenshots im Verzeichnis images/.');
 return lines.join('\n')+'\n';
}
async function main(){
 const o=args(process.argv.slice(2));
 if(o.help){console.log('Usage: node scripts/rendering-step15-diagnostics.mjs --url LOCALHOST --qualities 4,auto --duration 1800');return;}
 if(!existsSync(o.scene))throw Error('Reference scene not found: '+o.scene);
 const raw=await readFile(o.scene);
 const scene=JSON.parse(raw);
 if(scene.sceneSize!==397||(scene.natureInstances||[]).length!==2631)
  throw Error('Reference scene changed: expected 397 hex / 2631 nature');
 await mkdir(join(o.out,'images'),{recursive:true});await preflight(o.url);
 const run={created:new Date().toISOString(),status:'DIAGNOSTIC',
  sceneSha256:createHash('sha256').update(raw).digest('hex'),
  scenePath:o.scene,qualities:o.qualities,phases:[],cameraChecks:[],errors:[],screenshots:[]};
 let engine;
 try{
  engine=await launch(o.url,o);const c=engine.cdp;
  await waitFor(()=>c.eval('Boolean(window.VedrasAssetLabor?.enableStep15Trace)'),
   'Step15 hooks',30000);
  await waitFor(()=>c.eval('window.VedrasAssetLabor?.assets?.().length>0'),
   'Asset library',30000);
  run.import=await importScene(c,o.scene);
  if(run.import.missingNatureInstances)throw Error('Missing authored assets');
  for(const quality of o.qualities){
   console.log('Step 15 quality '+quality);
   await setControls(c,quality,false);
   for(const kind of ['pan','zoom']){
    await setCamera(c,{q:0,r:0},.70);
    await sleep(o.warmup);
    const start=await settle(c,9000);
    await c.eval(`(()=>{
     window.VedrasAssetLabor.enableStep15Trace(true);
     window.VedrasAssetLabor.resetStep15Trace('${quality}-${kind}');
    })()`);
    const perf=await phase(c,kind,quality,o.duration);
    const end=await settle(c,9000);
    const trace=await c.eval('window.VedrasAssetLabor.step15Trace()');
    const analysis=describe(trace);
    run.phases.push({quality,kind,start,end,performance:perf,analysis,trace});
    console.log('  '+kind+': '+analysis.fallbackTerrainDraws+
      ' terrain fallback, '+analysis.fallbackGroundMs+'ms, '+trace.totalEvents+
      ' trace events, ready '+start.ready+'/'+end.ready);
    await c.eval('window.VedrasAssetLabor.enableStep15Trace(false)');
   }
  }
  await setControls(c,'auto',false);
  for(const site of run.import.sites){
   await setCamera(c,site,.70);await sleep(400);
   const ready=await settle(c,9000,{edgeSite:true});
   const diag=await c.eval(`window.VedrasAssetLabor.cameraDiagnostics(${JSON.stringify(site)})`);
   const shot=await screenshot(c,join(o.out,'images',site.label+'-'+
    (ready.ready?'ready':'diagnostic')+'.png'));
   run.cameraChecks.push({...site,ready,diag,screenshot:shot.file});
   run.screenshots.push({...shot,verified:ready.ready,region:site.label});
   console.log('  camera '+site.label+': center='+diag.actualCenter.id+
     ', terrain='+diag.actualCenter.effectiveTerrain+
     ', expected='+diag.target.expectedTerrain);
  }
  // Same camera and same selected Fog origin; isolate cloud permission result.
  await setCamera(c,{q:0,r:0},.48);
  await setControls(c,'auto',false);
  const clear=await settle(c,9000);
  const clearDiag=await c.eval('window.VedrasAssetLabor.cameraDiagnostics({q:0,r:0})');
  const clearShot=await screenshot(c,join(o.out,'images','fog-off.png'));
  await setControls(c,'auto',true);await sleep(800);
  const fogDiag=await c.eval('window.VedrasAssetLabor.cameraDiagnostics({q:0,r:0})');
  const fogShot=await screenshot(c,join(o.out,'images','fog-on.png'));
  run.fog={clearReady:clear.ready,clearDiag,fogDiag,
   images:{clear:clearShot.file,preview:fogShot.file},
   changed:clearShot.sha256!==fogShot.sha256};
  run.screenshots.push({...clearShot,verified:clear.ready},{...fogShot,verified:false});
  run.status='RECORDED; visual and hardware acceptance pending';
 }catch(err){run.status='FAILED – partial traces';run.errors.push(String(err?.stack||err));}
 finally{
  await writeFile(join(o.out,'result.json'),JSON.stringify(run,null,2));
  await writeFile(join(o.out,'README.md'),readme(run));
  if(engine){engine.cdp.close();await engine.clean();}
 }
 console.log('Step 15 result: '+run.status+'; '+o.out);
 if(run.errors.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});

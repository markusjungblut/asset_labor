#!/usr/bin/env node
/* Vedras Step 14: controlled Atlas ON / OFF and zoom-CPU profiling.
 * Each variant is a separate Chromium process and user-data directory.
 * No scene/art/cache mutations are written to the repository.
 */
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';
import {launch,preflight,waitFor,importScene,setControls,setCamera,settle,
 phase,screenshot,snapshot} from './rendering-step13-browser.mjs';

function parse(args){
 const o={url:'http://127.0.0.1:8780/',scene:resolve('artifacts/rendering-step13/vedras_scene.json'),
  out:resolve('artifacts/rendering-step14-ab'),qualities:['auto','4'],
  duration:1800,warmup:1200,headed:false,order:['on','off']};
 for(let i=0;i<args.length;i++){
  const k=args[i];
  if(k==='--help'){o.help=true;continue;}
  if(k==='--headed'){o.headed=true;continue;}
  if(!['--url','--scene','--out','--qualities','--duration','--warmup','--chrome','--order'].includes(k))
   throw Error('Unknown argument '+k);
  if(++i>=args.length)throw Error('Missing value for '+k);
  const v=args[i];
  if(k==='--url')o.url=v;
  if(k==='--scene')o.scene=resolve(v);
  if(k==='--out')o.out=resolve(v);
  if(k==='--qualities')o.qualities=v.split(',');
  if(k==='--duration')o.duration=Number(v);
  if(k==='--warmup')o.warmup=Number(v);
  if(k==='--chrome')o.chrome=v;
  if(k==='--order')o.order=v.split(',');
 }
 if(!o.help){
  const u=new URL(o.url);
  if(u.protocol!=='http:'||!['127.0.0.1','localhost','[::1]'].includes(u.hostname))
   throw Error('Only a local test server is allowed');
  if(o.order.length!==2||!o.order.includes('on')||!o.order.includes('off'))throw Error('Order must be on,off or off,on');
  if(!o.qualities.length||o.qualities.some(q=>!['fast','auto','1','2','3','4'].includes(q)))
   throw Error('Invalid qualities');
  if(o.duration<1500||o.duration>10000||!Number.isFinite(o.duration))
   throw Error('Duration must be between 1500 and 10000 ms');
  if(!Number.isFinite(o.warmup)||o.warmup<0||o.warmup>30000)
   throw Error('Invalid warmup');
 }
 return o;
}
function diff(a,b){return Number.isFinite(a)&&Number.isFinite(b)?+(b-a).toFixed(2):null;}
function metric(p,k){return p?.[k]??null;}
function pairRows(a,b){
 const rows=[];
 for(const quality of [...new Set([...a.phases,...b.phases].map(p=>p.quality))])
  for(const kind of ['pan','zoom','cold-zoom']){
   const on=a.phases.find(p=>(p.scenario||p.kind)===kind&&p.quality===quality);
   const off=b.phases.find(p=>(p.scenario||p.kind)===kind&&p.quality===quality);
   if(!on||!off)continue;
   const valid=on.validStart&&off.validStart&&on.readyAfter&&off.readyAfter;
   rows.push({quality,kind,comparable:!!valid,
    frameP95:{on:on.frameIntervalMs.p95,off:off.frameIntervalMs.p95,
      deltaMs:diff(on.frameIntervalMs.p95,off.frameIntervalMs.p95)},
    cpuTaskSeconds:{on:on.cpuTaskSeconds,off:off.cpuTaskSeconds,
      delta:diff(on.cpuTaskSeconds,off.cpuTaskSeconds)},
    mainThreadTaskUtilizationPercent:{on:on.mainThreadTaskUtilizationPercent,
      off:off.mainThreadTaskUtilizationPercent},
    loads:{on:on.resourceLoads,off:off.resourceLoads},
    atlas:{on:on.atlasChanges,off:off.atlasChanges},
    profile:{on:on.profile,off:off.profile},
    memory:{on:on.memory,off:off.memory},
    note:valid?'same input; compare raw data, not a statistical significance claim':
     'unready start/end, not a performance comparison'});
  }
 return rows;
}
function generateReadme(data){
 const lines=['# Vedras Schritt 14 – Atlas AN/AUS und Zoom-Ursachenanalyse','',
  'Messung: zwei **separate, frische Chromium-Prozesse und User-Data-Verzeichnisse**;',
  'identische 397-Hex-Szene, gleiche Fenstergröße, DPR, Kamera (Hex 0,0 / Zoom 0,70),',
  'Qualitätsprofile und deterministische Pan-/Zoom-Gesten. Cold-Zoom invalidiert vor der Geste',
  'in beiden Varianten einmal gezielt die Terrain-/Kachel-Caches.',
  'Atlas AN erzwingt Atlas-Versuche auch bei >500 Vegetationsinstanzen.',
  'Atlas AUS unterbindet Atlas-Zeichnungen, nutzt denselben Asset-Pool.',
  'Achtung: Atlas AN kann Original-Pixel verwenden, AUS eine reduzierte PNG-Vorschau.',
  'DPR und Qualitätsprofil sind gleich, die Quellschärfe kann variieren: Bilder prüfen.',
  'Versuchsanordnung: Reihenfolge im result.json. Bei Wiederholung --order off,on',
  'verwenden, um Prozess-/OS-Caching-Reihenfolgeeffekte sichtbar zu machen.',
  'Alle Ergebnisse sind vorläufig; die Reihenfolge AN → AUS ist fest. Mehrfach wiederholen.',
  '','**Interpretation:** CDP TaskDuration ist die kumulierte Browser-Main-Thread-Taskzeit',
  '(Proxy für Auslastung eines Browserthreads), **keine systemweite CPU-%**.',
  'Bildladezeiten enthalten Fetch/Warten/Dekodieren; nur images.resampleMs misst CPU-Canvas',
  'Vorschauneuskalierung. Die Renderzeitkategorien können ineinander verschachtelt sein',
  '(z. B. tile.bakeWallMs enthält tile.sceneryMs und Schatten) – **nicht addieren**.',
  'Speicher in Byte: JSHeapUsedSize von CDP, geschätzter ImagePool-RGBA-Bytes;',
  'keine Garantie für tatsächlichen RAM/VRAM. HTTP-Zähler sind Resource-Timing-Einträge,',
  'keine verlässliche Zahl physischer Übertragungen bei Browsercaching.',
  '','## Vergleich','',
  '| Profil | Geste | gültig | AN p95 ms | AUS p95 ms | AN Main-Thread % | AUS Main-Thread % | AN Bild-Ressourcen | AUS Bild-Ressourcen |',
  '|---|---|---|---:|---:|---:|---:|---:|---:|'];
 for(const p of data.pairs)lines.push(
  '| '+[p.quality,p.kind,p.comparable?'ja':'NEIN',
   p.frameP95.on??'–',p.frameP95.off??'–',
   p.mainThreadTaskUtilizationPercent.on??'–',p.mainThreadTaskUtilizationPercent.off??'–',
   p.loads.on?.images??'–',p.loads.off?.images??'–'].join(' | ')+' |');
 lines.push('','## Atlas-Nutzung in den Messphasen','',
  '| Profil | Szenario | AN-Versuche | AN-Treffer | AN-Fallbacks | AUS-Bypass-Zeichnungen |',
  '|---|---|---:|---:|---:|---:|',
  ...data.pairs.map(r=>{
   const on=data.on.phases.find(p=>p.quality===r.quality&&(p.scenario||p.kind)===r.kind);
   const off=data.off.phases.find(p=>p.quality===r.quality&&(p.scenario||p.kind)===r.kind);
   const value=(p,key)=>p?.profile?.[key]?.count??0;
   return '| '+[r.quality,r.kind,value(on,'atlas.attempt'),value(on,'atlas.hit'),
     value(on,'atlas.miss'),value(off,'atlas.bypass')].join(' | ')+' |';
  }),
  '','## Zoom: CPU-Ursachen im direkten Vergleich','',
  '| Profil | Szenario | Modus | World-Tile-Wall ms | Tile-Grund/Straßen ms | Vegetation/Sprites ms | Schatten ms | Image-Resample ms | Bildlade-Wall ms |',
  '|---|---|---|---:|---:|---:|---:|---:|---:|');
 const time=(p,key)=>p.profile?.[key]?.totalMs??0;
 for(const [label,run] of [['AN',data.on],['AUS',data.off]])
  for(const p of run.phases.filter(x=>x.kind==='zoom'))
   lines.push('| '+[p.quality,p.scenario,label,time(p,'tile.bakeWallMs'),time(p,'tile.groundRoadsMs'),
    time(p,'sprites.drawMs'),time(p,'shadows.drawMs'),
    time(p,'images.resampleMs'),time(p,'images.loadWallMs')].join(' | ')+' |');
 lines.push('','## Startbilder und Readiness',
  ...[...data.on.checks,...data.off.checks].map(r=>
   '- '+r.atlas+'/'+r.quality+'/'+r.kind+': '+(r.ready?'READY':'DIAGNOSTIC')+
   ', Wartezeit '+r.waitMs+'ms, '+r.reasons.join(', ')),
  '','## Begrenzungen und Prüfpflicht',
  '- In Atlas AN muss die Atlas-Manifest-Datei vorhanden und aktiv sein.',
  '- Mindestens ein tatsächlicher Atlas-Treffer ist nötig; reine Versuche mit PNG-Fallback genügen nicht.',
  '- Hat eine Variante keinen Atlas-Versuch oder fehlen sichtbare Kacheln, ist der direkte Vergleich ungültig.',
  '- A/B-Tests mindestens dreimal wiederholen und bei verändertem Qualitätsprofil separat bewerten.',
  '- Statische Vorberechnung und WebGL-Uploads können auf anderen Threads laufen; die Main-Thread-Taskzeit misst diese nicht.',
  '- Screenshots visuell auf dieselben Biome und fehlende Pflanzen prüfen.',
  '','Details: `result.json`, Kartenbilder in `on/` und `off/`.');
 return lines.join('\n')+'\n';
}
async function runMode(opts,atlas){
 const path=join(opts.out,atlas);
 await mkdir(path,{recursive:true});
 const result={atlas,phases:[],checks:[],screenshots:[],errors:[],browser:null,
  started:new Date().toISOString()};
 let engine=null;
 try{
  engine=await launch(opts.url,{...opts});
  result.browser=engine.chrome+(opts.headed?' (headed)':' (headless)');
  const c=engine.cdp;
  await waitFor(()=>c.eval(`Boolean(window.VedrasAssetLabor?.setBenchmarkAtlasMode)`),
   'benchmark controls',30000);
  await waitFor(()=>c.eval(`window.VedrasAssetLabor?.assets?.().length>0`),
   'loaded library',30000);
  const toggle=await c.eval(`(()=>{
   performance.setResourceTimingBufferSize(25000);
   const mode=window.VedrasAssetLabor.setBenchmarkAtlasMode('${atlas}');
   window.VedrasBenchmarkProfiler.enable(true);
   return mode;
  })()`);
  result.atlasSwitch=toggle;
  if(atlas==='on'&&!toggle.atlas?.active)
   throw Error('Atlas ON requires compiled atlas manifest; unavailable – comparison invalid.');
  result.import=await importScene(c,opts.scene);
  if(result.import.nature!==2631||result.import.missingNatureInstances!==0)
   throw Error('Reference scene invalid/missing nature assets');
  result.scene=await snapshot(c);
  for(const quality of opts.qualities){
   await setControls(c,quality,false);
   for(const scenario of ['pan','zoom','cold-zoom']){
    const kind=scenario==='cold-zoom'?'zoom':scenario;
    await setCamera(c,{q:0,r:0},.70);
    await sleep(opts.warmup);
    const before=await settle(c,9000);
    console.log(`Step 14 ${atlas.toUpperCase()} / ${quality} / ${scenario}: ${before.ready?'READY':'DIAGNOSTIC'} (${before.waitMs}ms)`);
    result.checks.push({atlas,quality,kind:scenario,stage:'before',ready:before.ready,
     reasons:before.reasons,waitMs:before.waitMs});
    if(kind==='pan'){
     const img=await screenshot(c,join(path,`${quality}-baseline-${before.ready?'ready':'diagnostic'}.png`));
     result.screenshots.push({...img,stage:'before',quality,verified:before.ready});
    }
    // A separate controlled cold-zoom checks the expensive rebuild path.
    // Warm pan/zoom are never polluted by an earlier explicit invalidation.
    if(scenario==='cold-zoom')await c.eval(`(()=>{
      const v=window.VedrasAssetLabor;
      v.invalidateTerrain('all');v.requestDraw();return true;
     })()`);
    const metrics=await phase(c,kind,quality,opts.duration);
    metrics.scenario=scenario;metrics.validStart=before.ready;
    const after=await settle(c,9000);
    metrics.readyAfter=after.ready;
    metrics.readinessReasons=after.reasons;
    result.phases.push(metrics);
    result.checks.push({atlas,quality,kind:scenario,stage:'after',ready:after.ready,
      reasons:after.reasons,waitMs:after.waitMs});
    if(kind==='zoom'){
     const img=await screenshot(c,join(path,`${quality}-${scenario}-${after.ready?'ready':'diagnostic'}.png`));
     result.screenshots.push({...img,stage:'after',quality,verified:after.ready});
    }
    console.log(`  frame p95 ${metrics.frameIntervalMs.p95}ms / main-thread-task ${metrics.mainThreadTaskUtilizationPercent}% / atlas ${metrics.atlasChanges.pageLoads} page loads / ready after ${after.ready}`);
   }
  }
  result.completed=true;
 }catch(e){
  result.errors.push(String(e?.stack||e));result.completed=false;
  console.error('Step 14 '+atlas+' failed: '+e.message);
 }finally{
  await writeFile(join(path,'result.json'),JSON.stringify(result,null,2));
  if(engine){engine.cdp.close();await engine.clean();}
 }
 return result;
}
async function main(){
 const o=parse(process.argv.slice(2));
 if(o.help){console.log('Usage: node scripts/rendering-step14-ab.mjs --url LOCALHOST --scene FILE --out DIR --qualities auto,4 --duration 1800 --warmup 1200 --order on,off');return;}
 if(!existsSync(o.scene))throw Error('Scene missing: '+o.scene);
 if(JSON.parse(await readFile(o.scene,'utf8')).natureInstances?.length!==2631)
  throw Error('Expected exact reference scene: 2631 Nature');
 await mkdir(o.out,{recursive:true});
 await preflight(o.url);
 console.log('Step 14 A/B – separate Chrome profiles; order: '+o.order.join(' then '));
 const passes={};
 for(const mode of o.order)passes[mode]=await runMode(o,mode);
 const on=passes.on,off=passes.off;
 const data={timestamp:new Date().toISOString(),experiment:'atlas-ab-step14-v1',
  input:{scene:o.scene,order:o.order,sceneSha256:createHash('sha256').update(await readFile(o.scene)).digest('hex'),
   qualities:o.qualities,gestureDurationMs:o.duration,warmupMs:o.warmup,
   camera:{q:0,r:0,zoom:.70},chromeWindow:'1280x820',dpr:1},
  on,off,pairs:pairRows(on,off),
  valid:!!(on.completed&&off.completed&&on.atlasSwitch?.atlas?.active&&
    on.phases.some(p=>p.profile?.['atlas.attempt']?.count>0)&&
    on.phases.some(p=>p.profile?.['atlas.hit']?.count>0)&&
    off.phases.every(p=>!p.profile?.['atlas.attempt']?.count)&&
    [...on.phases,...off.phases].every(p=>p.validStart&&p.readyAfter))};
 if(!data.valid)data.warnings=['Comparison is diagnostic only: atlas switch, tile readiness, or phase completeness failed.'];
 await writeFile(join(o.out,'result.json'),JSON.stringify(data,null,2));
 await writeFile(join(o.out,'README.md'),generateReadme(data));
 console.log('Step 14: '+(data.valid?'A/B technically comparable':'DIAGNOSTIC – inspect warnings')+'; '+o.out);
 if(!on.completed||!off.completed)process.exitCode=1;
}
main().catch(e=>{console.error(e?.stack||e);process.exitCode=1;});

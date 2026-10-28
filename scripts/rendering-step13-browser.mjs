#!/usr/bin/env node
/**
 * Step 13: real Chromium/CDP rendering capture for Vedras Asset-Labor.
 * Requires Node >= 22 (built-in WebSocket). No npm packages and no CI job.
 * Results are diagnostic, not a claim that visual appearance is correct.
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdtemp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { createInterface } from 'node:readline/promises';
import { createHash } from 'node:crypto';
import { cameraSites } from './rendering-step13-sites.mjs';

const help = `Usage: node scripts/rendering-step13-browser.mjs [options]
  --url URL          Running local Asset-Labor, default http://127.0.0.1:8780/
  --scene FILE       Existing exported 397-hex JSON scene (default: repo reference scene)
  --out DIR          Result folder (default artifacts/rendering-step13-auto)
  --chrome FILE      Chrome/Chromium executable (or CHROME_BIN)
  --qualities LIST  Comma separated: fast,auto,1,2,3,4 (default all)
  --duration MS      Gesture capture per phase (default 3600, min 1500)
  --warmup MS        Initial settle duration per quality (default 3000)
  --headed           Show browser window (default headless)
  --pause-on-exit    With --headed and a terminal: leave Chrome open until Enter
  --help             Display this help
The URL must be localhost/127.0.0.1. Start python server.py separately.
Each run writes JSON, Markdown and map-only PNG screenshots. Fog-off is the default for measurements; separate fog-on comparison images are saved.
`;
function options(argv) {
  const defaultScene=resolve('artifacts/rendering-step13/vedras_scene.json');
  const o={url:'http://127.0.0.1:8780/',out:'artifacts/rendering-step13-auto',
    scene:existsSync(defaultScene)?defaultScene:null,
    qualities:['fast','auto','1','2','3','4'],duration:3600,warmup:3000,headed:false};
  for(let i=0;i<argv.length;i++){
    const k=argv[i];
    if(k==='--help'){o.help=true;continue;}
    if(k==='--headed'){o.headed=true;continue;}
    if(k==='--pause-on-exit'){o.pauseOnExit=true;continue;}
    if(!['--url','--scene','--out','--chrome','--qualities','--duration','--warmup'].includes(k))throw Error('Unknown option: '+k);
    if(++i>=argv.length)throw Error('Missing value for '+k);
    const v=argv[i];
    if(k==='--url')o.url=v;
    if(k==='--scene')o.scene=v;
    if(k==='--out')o.out=v;
    if(k==='--chrome')o.chrome=v;
    if(k==='--qualities')o.qualities=v.split(',');
    if(k==='--duration')o.duration=Number(v);
    if(k==='--warmup')o.warmup=Number(v);
  }
  if(!o.help){
    const u=new URL(o.url);
    if(u.protocol!=='http:'||!['127.0.0.1','localhost','[::1]'].includes(u.hostname))
      throw Error('Only a local http://127.0.0.1 or localhost URL is permitted.');
    if(o.pauseOnExit&&!o.headed)throw Error('--pause-on-exit requires --headed');
    if(!o.qualities.length||o.qualities.some(x=>!['fast','auto','1','2','3','4'].includes(x)))throw Error('Invalid --qualities');
    if(!Number.isFinite(o.duration)||o.duration<1500||!Number.isFinite(o.warmup)||o.warmup<0)throw Error('Invalid duration/warmup');
  }
  return o;
}
function percentile(values,p) {
  const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);
  if(!sorted.length)return null;
  const at=(sorted.length-1)*p,lo=Math.floor(at),hi=Math.ceil(at);
  return +(sorted[lo]+(sorted[hi]-sorted[lo])*(at-lo)).toFixed(2);
}
function chromeBinary(explicit) {
  if(explicit||process.env.CHROME_BIN)return explicit||process.env.CHROME_BIN;
  if(process.platform==='win32')return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if(process.platform==='darwin')return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  return '/usr/bin/chromium';
}
async function ephemeralPort() {
  const s=createServer();
  return new Promise((ok,bad)=>{
    s.once('error',bad);s.listen(0,'127.0.0.1',()=>{
      const port=s.address().port;s.close(()=>ok(port));
    });
  });
}
class CDP {
  constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map();this.errors=[];
    this.ws.addEventListener('message',e=>{
      const message=JSON.parse(e.data);
      if(message.method==='Runtime.exceptionThrown')this.errors.push(message.params?.exceptionDetails?.text||'Runtime exception');
      const task=this.pending.get(message.id);
      if(!task)return;
      this.pending.delete(message.id);clearTimeout(task.timer);
      if(message.error)task.reject(Error(message.error.message));else task.resolve(message.result||{});
    });
  }
  async open(){
    if(this.ws.readyState===WebSocket.OPEN)return;
    await new Promise((yes,no)=>{
      const timeout=setTimeout(()=>no(Error('CDP WebSocket timeout')),12000);
      this.ws.addEventListener('open',()=>{clearTimeout(timeout);yes();},{once:true});
      this.ws.addEventListener('error',()=>{clearTimeout(timeout);no(Error('Cannot open CDP WebSocket'));},{once:true});
    });
  }
  async send(method,params={}){
    const id=++this.id;
    return await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('CDP timeout: '+method));},30000);
      this.pending.set(id,{resolve,reject,timer});
      this.ws.send(JSON.stringify({id,method,params}));
    });
  }
  async eval(expression){
    const out=await this.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    if(out.exceptionDetails)throw Error(out.exceptionDetails.exception?.description||out.exceptionDetails.text);
    return out.result?.value;
  }
  close(){this.ws.close();for(const t of this.pending.values())clearTimeout(t.timer);this.pending.clear();}
}
async function waitFor(fn,description,timeout=30000){
  const end=Date.now()+timeout;
  while(Date.now()<end){try{const found=await fn();if(found)return found;}catch{}
    await sleep(200);
  }
  throw Error('Timed out waiting for '+description);
}
async function preflight(url){
  let response;
  try{
    response=await fetch(url,{signal:AbortSignal.timeout(5000)});
  }catch(error){
    throw Error(`Local Asset-Labor server not reachable at ${url}. Run python server.py and use the port it prints. (${error.message})`);
  }
  if(!response.ok)throw Error(`Local server returned HTTP ${response.status} at ${url}. Check the --url port.`);
  const html=await response.text();
  if(!html.includes('id="canvasOuter"')||!html.includes('id="quality"'))
    throw Error(`The local server at ${url} is not serving the Asset-Labor editor. Check the port and start python server.py.`);
}
async function launch(url,opts){
  const profile=await mkdtemp(join(tmpdir(),'vedras-step13-'));
  const port=await ephemeralPort();
  const args=[`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,
    '--no-first-run','--no-default-browser-check','--disable-extensions','--disable-dev-shm-usage','--no-proxy-server',
    '--window-size=1280,820','--force-device-scale-factor=1',
    ...(opts.headed?[]:['--headless=new']),url];
  if(process.platform!=='win32'&&process.getuid?.()===0)args.unshift('--no-sandbox');
  const child=spawn(chromeBinary(opts.chrome),args,{stdio:['ignore','ignore','pipe']});
  let failed=null,chromeStderr='';
  child.stderr?.on('data',chunk=>{chromeStderr=(chromeStderr+String(chunk)).slice(-2500);});
  child.once('error',e=>failed=e);
  child.once('exit',(code,signal)=>{if(!failed)failed=Error(`Chrome exited early (code ${code}, signal ${signal}).`);});
  const clean=async()=>{child.kill();await sleep(400);await rm(profile,{recursive:true,force:true,maxRetries:3,retryDelay:200});};
  try{
    const item=await waitFor(async()=>{
      if(failed)throw failed;
      const res=await fetch(`http://127.0.0.1:${port}/json/list`);
      const pages=await res.json();return pages.find(p=>p.type==='page'&&p.webSocketDebuggerUrl&&p.url.startsWith(new URL(url).origin));
    },'Chromium debugging target',20000);
    const cdp=new CDP(item.webSocketDebuggerUrl);await cdp.open();
    await cdp.send('Page.enable');await cdp.send('Runtime.enable');await cdp.send('Performance.enable');
    return {cdp,clean,chrome:chromeBinary(opts.chrome)};
  }catch(e){await clean();throw Error(`${failed?.message||e.message}${chromeStderr?'\nChrome stderr (tail): '+chromeStderr.slice(-1300):''}`);}
}
async function measureMetrics(cdp){
  const r=await cdp.send('Performance.getMetrics');
  return Object.fromEntries((r.metrics||[]).map(m=>[m.name,m.value]));
}
function delta(a,b,k){
  const first=a?.[k],last=b?.[k];
  return Number.isFinite(first)&&Number.isFinite(last)?+(last-first).toFixed(2):null;
}
async function screenshot(cdp,filename){
  // Capture the actual game viewport only. Do not publish a screenshot of the entire editor.
  const clip=await cdp.eval(`(()=>{
    const el=document.getElementById('canvasOuter'),r=el?.getBoundingClientRect();
    if(!r)return null;
    const x=Math.max(0,Math.floor(r.left)),y=Math.max(0,Math.floor(r.top));
    return {x,y,width:Math.floor(Math.min(r.right,innerWidth)-x),
      height:Math.floor(Math.min(r.bottom,innerHeight)-y),scale:1};
  })()`);
  if(!clip||clip.width<180||clip.height<150)throw Error('Game canvas is not visible enough for a screenshot');
  const r=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,
    fromSurface:true,clip});
  const png=Buffer.from(r.data,'base64');
  if(png.length<3000||png.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')
    throw Error('Canvas screenshot is empty or invalid: '+filename);
  await writeFile(filename,png);
  return {file:basename(filename),bytes:png.length,width:png.readUInt32BE(16),
    height:png.readUInt32BE(20),sha256:createHash('sha256').update(png).digest('hex')};
}
async function settle(cdp,timeoutMs=9000,{edgeSite=false}={}){
  let last=null,consecutive=0,reasons=[];
  const started=Date.now(),deadline=started+timeoutMs;
  while(Date.now()<deadline){
    last=await cdp.eval(`(()=>{
      const v=window.VedrasAssetLabor;
      return {world:v.worldTileStats(),artwork:v.tileDiagnostics({limit:32,includeReadiness:true}),
        mode:v.state.mode,view:v.state.view,assetPool:v.assetMemory()};
    })()`);
    const w=last.world,art=last.artwork;
    reasons=[];
    if(last.view!=='map'||last.mode!=='normal')reasons.push('not-map-view');
    if(!w.active)reasons.push('world-tile-compositor-not-active');
    if(!w.visible||!w.drawn)reasons.push('no-visible-world-tiles');
    if(w.pending!==0)reasons.push('tile-queue-pending:'+w.pending);
    if(w.retryExhausted>0)reasons.push('retry-exhausted');
    // Interior test: full viewport coverage. Edge biomes may legitimately
    // reveal the cloudy world boundary; still require every requested tile
    // and each visible artwork dependency to have completed.
    if(w.coverage<(edgeSite?.10:.999))reasons.push('coverage:'+w.coverage);
    if((w.progress?.exact??0)<1)reasons.push('no-exact-world-tiles');
    if(w.progress?.missing>0)reasons.push('missing:'+w.progress.missing);
    if(w.progress?.provisional>0)reasons.push('provisional:'+w.progress.provisional);
    if(w.visiblePreviews>0)reasons.push('visible-previews');
    // tileDiagnostics checks whether the *editor chunk* was painted, which
    // may legitimately remain false after the complete World-Tile has been
    // baked. Those details are advisory, not a second mandatory gate.
    const waiting=(art?.artwork||[]).filter(a=>!a.ready);
    const notes=waiting.length?['editor-chunk-not-ready:'+waiting.length]:[];

    if(!reasons.length&&++consecutive>=3)
      return {ready:true,stats:w,assetPool:last.assetPool,waitMs:Date.now()-started,reasons:[],notes};
    if(reasons.length)consecutive=0;
    // No camera motion: request the actual tile compositor again when the
    // first frame has not created any visible tiles (old baseline cloud bug).
    if((Date.now()-started)%2700<800)
      await cdp.eval(`window.VedrasAssetLabor?.activateTileCamera?.()`);
    await sleep(750);
  }
  return {ready:false,stats:last?.world,assetPool:last?.assetPool,
    waitMs:Date.now()-started,reasons,notes:[]};
}
async function setCamera(cdp,site,zoom=.70){
  const q=Number(site.q),r=Number(site.r);
  if(!Number.isInteger(q)||!Number.isInteger(r))throw Error('Invalid camera site');
  await cdp.eval(`(()=>{
    const v=window.VedrasAssetLabor,slider=document.getElementById('zoomSlider');
    slider.value=${Math.round(zoom*100)};
    slider.dispatchEvent(new Event('input',{bubbles:true}));
    const hex=v.geometry.HEX,R=v.geometry.R;
    const x=hex*(${q}+${r}/2),y=1.5*R*${r};
    v.state.panX=-x*v.state.zoom;
    v.state.panY=-y*v.geometry.PROJECT_Y*v.state.zoom;
    v.activateTileCamera();
    v.requestDraw();
    return true;
  })()`);
}
function recordReadiness(run,quality,phase,readiness){
  run.readiness.push({quality,phase,...readiness});
  console.log(`  ${quality}/${phase}: ${readiness.ready?'READY':'DIAGNOSTIC'} after ${Math.round(readiness.waitMs/1000)}s; ${readiness.reasons.join(', ')||'world tiles complete'}`);
  if(!readiness.ready){
    run.warnings.push(`Unready ${quality}/${phase}: ${readiness.reasons.join('; ')}; waited ${readiness.waitMs}ms`);
    return false;
  }
  return true;
}
async function captureGate(run,cdp,out,quality,phase,readiness,validName){
  const valid=recordReadiness(run,quality,phase,readiness);
  const name=valid?validName:validName.replace(/\\.png$/,'-diagnostic.png');
  const file=await screenshot(cdp,join(resolve(out),name));
  run.screenshots.push({...file,verified:valid});
  return {valid,file};
}
async function assetPresence(cdp){
  return cdp.eval(`(()=>{
    const v=window.VedrasAssetLabor,valid=v.state.natureInstances||[];
    const files=new Set(v.assets().map(a=>a.path));
    const absent=valid.filter(n=>!files.has(n.assetPath));
    return {catalogAssets:files.size,nature:valid.length,
      missingNatureInstances:absent.length,
      missingPaths:[...new Set(absent.map(n=>n.assetPath))].slice(0,35)};
  })()`);
}
async function setControls(cdp,quality,fog){
  await cdp.eval(`(()=>{
    const select=document.getElementById('quality');
    select.value=${JSON.stringify(quality)};
    select.dispatchEvent(new Event('change',{bubbles:true}));
    const f=document.getElementById('fogPreview');
    f.checked=${fog};f.dispatchEvent(new Event('change',{bubbles:true}));
    const fast=document.getElementById('fastCamera');
    if(!fast.checked){fast.checked=true;fast.dispatchEvent(new Event('change',{bubbles:true}));}
    // Enter the real tile compositor even before the first pan. The stock editor
    // otherwise keeps the direct map canvas until the user moves the camera.
    const slider=document.getElementById('zoomSlider'),prior=Number(slider.value);
    slider.value=prior>=199?prior-1:prior+1;
    slider.dispatchEvent(new Event('input',{bubbles:true}));
    slider.value=prior;
    slider.dispatchEvent(new Event('input',{bubbles:true}));
    return true;
  })()`);
}
async function beginSamples(cdp){
  await cdp.eval(`(()=>{
    const samples=[],longTasks=[];
    let last=null,active=true;
    const obs=typeof PerformanceObserver==='undefined'?null:new PerformanceObserver(list=>{
      for(const entry of list.getEntries())longTasks.push(entry.duration);
    });
    try{obs?.observe({type:'longtask'});}catch{}
    const frame=t=>{if(!active)return;if(last!==null)samples.push(t-last);last=t;requestAnimationFrame(frame);};
    requestAnimationFrame(frame);
    window.__vedrasStep13Sample={finish(){active=false;obs?.disconnect();return {samples,longTasks};}};
    return true;
  })()`);
}
async function endSamples(cdp){
  return cdp.eval(`(()=>{
    const sample=window.__vedrasStep13Sample?.finish()||{samples:[],longTasks:[]};
    delete window.__vedrasStep13Sample;
    return sample;
  })()`);
}
async function snapshot(cdp){
  return cdp.eval(`(()=>{
    const v=window.VedrasAssetLabor;
    return {quality:v.qualityStats(),camera:v.cameraStats(),world:v.worldTileStats(),
      lod:v.lodStats(),scenery:v.sceneryDrawStats(),streaming:v.streamingStats(),
      worker:window.VedrasTerrainWorker?.status?.()||null,
      cellCount:v.cells().length,natureCount:v.state.natureInstances?.length||0,
      zoom:v.state.zoom,view:v.state.view,mode:v.state.mode,
      qualityText:document.getElementById('qualityStats')?.textContent||'',
      perfText:document.getElementById('perfStats')?.textContent||''};
  })()`);
}
async function gesture(cdp,kind,ms){
  const rect=await cdp.eval(`(()=>{const r=document.getElementById('canvasOuter').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()`);
  const x=Math.round(rect.x+rect.width*.5),y=Math.round(rect.y+rect.height*.5);
  if(kind==='pan'){
    const steps=24,delay=Math.ceil(ms/(2*steps));
    for(let round=0;round<2;round++){
      await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
      await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1,buttons:1});
      for(let i=1;i<=steps;i++){
        const fraction=i/steps,offset=(round===0?1:-1)*Math.round(120*fraction);
        await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+offset,y:y+Math.round(offset*.2),button:'left',buttons:1});
        await sleep(delay);
      }
      await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+(round===0?120:-120),y,button:'left',buttons:0});
    }
  }else if(kind==='zoom'){
    const steps=22,delay=Math.ceil(ms/steps);
    await cdp.eval(`document.getElementById('zoomSlider').value=70;document.getElementById('zoomSlider').dispatchEvent(new Event('input',{bubbles:true}));`);
    for(let i=0;i<steps;i++){
      const percent=i<steps/2?70+i*2.5:97.5-(i-steps/2)*2.5;
      await cdp.eval(`(()=>{let el=document.getElementById('zoomSlider');el.value=${Math.round(percent)};el.dispatchEvent(new Event('input',{bubbles:true}));})()`);
      await sleep(delay);
    }
  }
}
async function importScene(cdp,filename){
  const contents=await readFile(resolve(filename),'utf8'),scene=JSON.parse(contents);
  if(!['vedras-asset-labor-scene-0.8','vedras-asset-labor-scene-0.7','vedras-asset-labor-scene-0.6'].includes(scene.schema))
    throw Error('Unsupported scene schema: '+scene.schema);
  if(scene.sceneSize!==397)throw Error('Reference scene must have 397 hexes, found '+scene.sceneSize);
  const expectedNature=(scene.natureInstances||[]).filter(n=>
    typeof n.assetPath==='string'&&Number.isFinite(n.dx)&&Number.isFinite(n.dy)&&
    Number.isFinite(n.q)&&Number.isFinite(n.r)&&Number.isFinite(n.scale)&&n.scale>0&&n.scale<=3).length;
  // Simulate an actual user-chosen File in Chromium. CDP DOM node IDs are invalidated
  // during asynchronous editor startup and produced "Could not find node with given id".
  // This path does not depend on a cached document/tree node.
  const injected=await cdp.eval(`(()=>{
    const input=document.getElementById('sceneImport');
    if(!input)return false;
    const file=new File([${JSON.stringify(contents)}],${JSON.stringify(basename(filename))},
      {type:'application/json'});
    const transfer=new DataTransfer();transfer.items.add(file);
    input.files=transfer.files;
    const message=document.getElementById('catalogMessage');
    if(message)message.textContent='Importiere Referenzszene…';
    window.__vedrasStep13ImportError=null;
    window.alert=message=>{window.__vedrasStep13ImportError=String(message)};
    input.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  })()`);
  if(!injected)throw Error('Scene import input #sceneImport missing');
  await waitFor(()=>cdp.eval(`(()=>{
    if(window.__vedrasStep13ImportError)return true;
    const v=window.VedrasAssetLabor;
    return v?.cells?.().length===397&&
      v?.state?.natureInstances?.length===${expectedNature}&&
      document.getElementById('catalogMessage')?.textContent?.includes('Szene importiert.');
  })()`),'397-hex scene with '+expectedNature+' Nature sprites',45000);
  const message=await cdp.eval(`window.__vedrasStep13ImportError||null`);
  if(message)throw Error('Asset-Labor rejected scene import: '+message);
  const presence=await assetPresence(cdp);
  if(presence.nature!==expectedNature)throw Error('Imported '+presence.nature+
    ' of '+expectedNature+' valid vegetation instances. Scene import truncated data.');
  return {file:resolve(filename),expectedNature,sceneSize:397,...presence,
    sites:cameraSites(scene)};
}
async function phase(cdp,kind,quality,ms){
  const start=await snapshot(cdp),before=await measureMetrics(cdp);
  await beginSamples(cdp);
  await gesture(cdp,kind,ms);
  const observed=await endSamples(cdp),after=await measureMetrics(cdp),end=await snapshot(cdp);
  return {quality,kind,frameIntervalMs:{count:observed.samples.length,
      p50:percentile(observed.samples,.5),p95:percentile(observed.samples,.95),
      over50ms:observed.samples.filter(n=>n>50).length},
    longTasks:{count:observed.longTasks.length,p95Ms:percentile(observed.longTasks,.95)},
    cpuTaskSeconds:delta(before,after,'TaskDuration'),
    heapUsedBefore:before.JSHeapUsedSize??null,heapUsedAfter:after.JSHeapUsedSize??null,
    tileBakes:delta(start.camera,end.camera,'worldTileBakes'),
    fastFrames:delta(start.camera,end.camera,'fastFrames'),
    sceneryBuilds:delta(start.camera,end.camera,'sceneryBuilds'),
    terrainBuilds:delta(start.camera,end.camera,'terrainBuilds'),
    visiblePreviews:end.world.visiblePreviews??null,
    remainingTiles:end.world.pending??null,
    failedTiles:end.world.failed??null,
    exhaustedRetries:end.world.retryExhausted??null,
    visibleTiles:end.world.visible??null,
    coverage:end.world.coverage??null,
    lodMatchesWorld:end.lod?.tier===end.lod?.worldTile,
    qualityEffectiveDpr:end.quality.effectiveDpr,
    end};
}
function report(run){
  const lines=['# Rendering Step 13 – automatische 397-Hex-Browsermessung','',
    `**Datum:** ${run.timestamp}`,
    `**Status:** ${run.acceptance}`,
    `**Browser:** ${run.browser}`,
    `**Szenario:** ${run.sceneProvided?'Importierte Szene':'Ohne gespeicherte Szenendatei (nur Smoke)'}`,
    `**Hexe / Nature:** ${run.scene?.cellCount??'?'} / ${run.scene?.natureCount??'?'}`,
    `**Erwartete / importierte Vegetation:** ${run.import?.expectedNature??'?'} / ${run.import?.nature??'?'}`,
    `**Nicht vorhandene Asset-Instanzen:** ${run.import?.missingNatureInstances??'?'}`,
    `**Screenshots:** ${run.screenshots?.length??0} (nur Kartenausschnitt; normale Bilder ohne Fog)`,
    `**Geografische Testpositionen:** ${run.sites?.length??0} (6 Biome/Features × fast und 4×)`,
    '',
    '| Profil | Geste | rAF-p50 ms | rAF-p95 ms | >50 ms | Longtasks | Tile-Bakes | effektive DPR |',
    '|---|---|---:|---:|---:|---:|---:|---:|'];
  for(const p of run.phases)lines.push(`| ${p.quality} | ${p.kind} | ${p.frameIntervalMs.p50??'–'} | ${p.frameIntervalMs.p95??'–'} | ${p.frameIntervalMs.over50ms} | ${p.longTasks.count} | ${p.tileBakes??'–'} | ${p.qualityEffectiveDpr??'–'} |`);
  if(run.phases?.length)lines.push('', '## Bildpool und Zoomdiagnostik', '',
    '| Qualität | Geste | Pool MiB | Budget MiB | Überhang MiB | geschützt | Upgrade verschoben | Messbeginn gültig |',
    '|---|---|---:|---:|---:|---:|---:|---|',
    ...run.phases.map(p=>{
      const m=p.end?.quality?.images||{};
      const mb=n=>Number.isFinite(n)?(n/1048576).toFixed(1):'–';
      return `| ${p.quality} | ${p.kind} | ${mb(m.decodedBytes)} | ${mb(m.limitBytes)} | ${mb(m.overLimitBytes)} | ${m.protectedAssets??'–'} | ${m.deferredUpgrades??'–'} | ${p.validStart?'ja':'NEIN'} |`;
    }));
  if(run.sites?.length)lines.push('', '## Regionale Kameratestpositionen (wirkliche Hexkoordinaten)', '',
    '| Profil | Region | Hex | Terrain | Waldklasse | bereit | Kachelabdeckung |',
    '|---|---|---|---|---|---|---:|',
    ...run.sites.map(s=>`| ${s.quality} | ${s.label} | ${s.q},${s.r} | ${s.terrain} | ${s.forestClass} | ${s.ready?'ja':'NEIN'} | ${s.coverage??'–'} |`));
  if(run.screenshots?.length)lines.push('', '## Karten-Screenshots', '',
    ...run.screenshots.map(s=>`- ${s.file} (${s.width}×${s.height}, ${Math.round(s.bytes/1024)} KiB)`));
  if(run.readiness?.length)lines.push('', '## Nachladezustand', '',
    ...run.readiness.map(r=>`- ${r.quality} / ${r.phase}: ${r.ready?'bereit':'NICHT BEREIT'}; pending ${r.stats?.pending??'?'}; missing ${r.stats?.progress?.missing??'?'}; coverage ${r.stats?.coverage??'?'}; wait ${r.waitMs??'?'} ms; ${r.reasons?.join(', ')||'OK'}`));
  if(run.warnings?.length)lines.push('', '## Warnungen', '', ...run.warnings.map(w=>`- ${w}`));
  lines.push('','rAF-p50/p95 sind **Bildschirm-Frameintervalle während der Geste**, keine direkt instrumentierten `draw()`-Laufzeiten oder garantierten FPS-Werte. CDP-CPU-Taskzeit/Heap und Cachewerte stehen in `result.json`.','',
    '## Noch visuell und auf Zielhardware abzunehmen','',
    '- [ ] Nebelvergleich: fog-comparison-clear.png gegenüber fog-comparison-on.png',
    '- [ ] Fog-Kern vollständig opak, auch bei leeren/verspäteten Assets',
    '- [ ] Wolkenweltposition und Beleuchtung bleiben bei Pan/Zoom stabil',
    '- [ ] Waldtiefe, Bergschatten, Küsten, Relief und Sprite-Nähte ohne sichtbare Regression',
    '- [ ] Regionale Schnappschüsse fast/4× für Wald, Küste, Berge, Moor, Meer, Mitte prüfen',
    '- [ ] Keine dauerhaft unter Wolken blockierten sichtbaren Tiles',
    '- [ ] 4×-Bildschärfe und wirksame DPR innerhalb 8/14-MP- und 4096-Pixel-Budgets',
    '- [ ] Vergleich über denselben gespeicherten 397-Hex-Stand, Viewport, Zoom und Browser/GPU',
    '- [ ] Wiederholung des Laufes zur Kontrolle von Heap-/Cache-Wachstum',
    '','**Keine automatische visuelle Freigabe.** Renderer-Fog ist nur Editor-Preview, kein Ersatz für Multiplayer-Berechtigungen.');
  if(run.errors.length)lines.push('','## Browser-Ausnahmen','',...run.errors.map(e=>`- ${e}`));
  return lines.join('\n')+'\n';
}
async function main(){
  const o=options(process.argv.slice(2));
  if(o.help){console.log(help);return;}
  await mkdir(resolve(o.out),{recursive:true});
  const run={timestamp:new Date().toISOString(),url:o.url,sceneProvided:!!o.scene,
    phases:[],screenshots:[],readiness:[],sites:[],warnings:[],errors:[],
    acceptance:'CAPTURED – visual inspection still required'};
  let engine;
  try{
    await preflight(o.url);
    console.log(`Local server reachable: ${o.url}`);
    engine=await launch(o.url,o);run.browser=engine.chrome+(o.headed?' (headed)':' (headless)');
    const c=engine.cdp;
    const navigation=await c.eval(`location.href`);
    if(navigation?.startsWith('chrome-error:')){
      const page=await c.eval(`({title:document.title,text:document.body?.innerText?.slice(0,500)||''})`);
      throw Error(`Chrome could not open ${o.url}: ${page?.title||'Browser error'} – ${page?.text||'No details'}`);
    }
    await waitFor(()=>c.eval(`Boolean(window.VedrasAssetLabor?.cameraStats&&typeof window.VedrasAssetLabor?.cells==='function')`),'Asset-Labor renderer',30000);
    await waitFor(()=>c.eval(`window.VedrasAssetLabor?.assets?.().length>0`),'loaded asset library',30000);
    if(o.scene){
      run.import=await importScene(c,o.scene);
      console.log(`Imported 397 hexes, ${run.import.nature} vegetation; missing asset instances: ${run.import.missingNatureInstances}`);
    }
    run.scene=await snapshot(c);
    if(!o.scene)run.acceptance='SMOKE ONLY – no stored 397-hex scene supplied';
    else if(run.scene.cellCount!==397)throw Error('Imported scene does not contain 397 hexes');
    if(run.import?.missingNatureInstances)
      run.warnings.push(`${run.import.missingNatureInstances} Nature instances reference absent asset paths: ${run.import.missingPaths.join(', ')}`);
    for(const quality of o.qualities){
      console.log(`Measuring ${quality} (${o.duration} ms/gesture, fog OFF)...`);
      await setControls(c,quality,false);
      await setCamera(c,{q:0,r:0},.70);
      await sleep(o.warmup);
      const baseline=await settle(c);
      await captureGate(run,c,o.out,quality,'baseline',baseline,`${quality}-baseline-clear.png`);
      for(const kind of ['pan','zoom']){
        // Store whether the starting tiles were complete before the gesture.
        const validStart=run.readiness.at(-1)?.ready===true;
        const result=await phase(c,kind,quality,o.duration);
        result.validStart=validStart;
        run.phases.push(result);
        if(kind==='zoom'&&result.frameIntervalMs.p95>150)
          run.warnings.push(`Zoom ${quality}: p95 ${result.frameIntervalMs.p95}ms (above 150ms diagnostic threshold)`);
        const mem=result.end?.quality?.images||{};
        if(mem.overLimitBytes>16*1048576)
          run.warnings.push(`Image pool ${quality}/${kind}: ${Math.round(mem.overLimitBytes/1048576)} MiB over configured budget`);
        const steady=await settle(c);
        await captureGate(run,c,o.out,quality,kind,steady,`${quality}-${kind}-clear.png`);
      }
    }
    // Grounded geographic coverage; fixed camera and zoom at each location.
    for(const quality of ['fast','4']){
      await setControls(c,quality,false);
      for(const site of run.import?.sites||[]){
        await setCamera(c,site,.70);
        await sleep(1000);
        const ready=await settle(c,9000,{edgeSite:true});
        const shot=await captureGate(run,c,o.out,quality,`site-${site.label}`,ready,
          `${quality}-site-${site.label}.png`);
        run.sites.push({...site,quality,ready:shot.valid,waitMs:ready.waitMs,
          reason:ready.reasons,coverage:ready.stats?.coverage??null,
          screenshot:shot.file.file});
      }
    }
    // Exactly identical camera position, explicitly different fog modes.
    await setControls(c,'auto',false);
    await setCamera(c,{q:0,r:0},.48);
    const clear=await settle(c);
    const cleanFog=await captureGate(run,c,o.out,'auto','fog-reference-clear',clear,
      'fog-comparison-clear.png');
    await setControls(c,'auto',true);
    await sleep(1800);
    const fogShot=await screenshot(c,join(resolve(o.out),'fog-comparison-on.png'));
    run.screenshots.push({...fogShot,verified:cleanFog.valid});
    run.fogComparison={available:true,verified:cleanFog.valid,onlyHereFogEnabled:true,
      changed:fogShot.sha256!==cleanFog.file.sha256};
    if(!run.fogComparison.changed)
      run.warnings.push('Fog-on and fog-off screenshots are identical; check visibility toggle');
    const clearHashes=new Set(run.screenshots.filter(s=>s.file.endsWith('-clear.png')).map(s=>s.sha256));
    if(clearHashes.size<2)
      run.warnings.push('All fog-off map screenshots identical or missing; renderer may be frozen');
    if(!run.screenshots.some(s=>s.verified))
      run.warnings.push('No verified fully loaded screenshot; review diagnostic PNGs');
    run.errors.push(...c.errors);
    if(run.errors.length||run.warnings.length)
      run.acceptance='PARTIAL – inspect readiness, assets or browser errors';
  }catch(error){
    run.errors.push(String(error?.stack||error));
    if(engine)run.errors.push(...engine.cdp.errors);
    console.error('Step 13 browser test failed: '+error.message);
    run.acceptance='INCOMPLETE – browser capture error';
    process.exitCode=1;
  }finally{
    await writeFile(join(resolve(o.out),'result.json'),JSON.stringify(run,null,2));
    await writeFile(join(resolve(o.out),'README.md'),report(run));
    if(engine){
      if(o.pauseOnExit){
        if(process.stdin.isTTY){
          const rl=createInterface({input:process.stdin,output:process.stdout});
          try{await rl.question('Chrome stays open for inspection. Press Enter to close it. ');}
          finally{rl.close();}
        }else console.log('No interactive terminal; --pause-on-exit skipped.');
      }
      engine.cdp.close();await engine.clean();
    }
    console.log(`Step 13: ${run.acceptance}\nSaved: ${resolve(o.out)}`);
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});

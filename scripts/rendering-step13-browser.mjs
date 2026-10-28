#!/usr/bin/env node
/**
 * Step 13: real Chromium/CDP rendering capture for Vedras Asset-Labor.
 * Requires Node >= 22 (built-in WebSocket). No npm packages and no CI job.
 * Results are diagnostic, not a claim that visual appearance is correct.
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdtemp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { createInterface } from 'node:readline/promises';

const help = `Usage: node scripts/rendering-step13-browser.mjs [options]
  --url URL          Running local Asset-Labor, default http://127.0.0.1:8780/
  --scene FILE       Existing exported 397-hex JSON scene (recommended)
  --out DIR          Result folder (default artifacts/rendering-step13)
  --chrome FILE      Chrome/Chromium executable (or CHROME_BIN)
  --qualities LIST  Comma separated: fast,auto,1,2,3,4 (default all)
  --duration MS      Gesture capture per phase (default 3600, min 1500)
  --warmup MS        Initial settle duration per quality (default 3000)
  --headed           Show browser window (default headless)
  --pause-on-exit    With --headed and a terminal: leave Chrome open until Enter
  --help             Display this help
The URL must be localhost/127.0.0.1. Start python server.py separately.
Each run writes JSON, Markdown and PNG screenshots; visual checks remain manual.
`;
function options(argv) {
  const o={url:'http://127.0.0.1:8780/',out:'artifacts/rendering-step13',
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
  const r=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
  await writeFile(filename,Buffer.from(r.data,'base64'));
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
  const schema=JSON.parse(await readFile(filename,'utf8')).schema;
  if(!['vedras-asset-labor-scene-0.8','vedras-asset-labor-scene-0.7','vedras-asset-labor-scene-0.6'].includes(schema))
    throw Error('Unsupported scene schema: '+schema);
  const doc=await cdp.send('DOM.getDocument');
  const found=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#sceneImport'});
  if(!found.nodeId)throw Error('Scene file input missing');
  await cdp.send('DOM.setFileInputFiles',{nodeId:found.nodeId,files:[resolve(filename)]});
  await waitFor(()=>cdp.eval(`window.VedrasAssetLabor?.cells?.().length===397`),'397-hex import',30000);
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
  const lines=['# Rendering Step 13 – Browser-Abnahme','',
    `**Datum:** ${run.timestamp}`,
    `**Status:** ${run.acceptance}`,
    `**Browser:** ${run.browser}`,
    `**Szenario:** ${run.sceneProvided?'Importierte Szene':'Ohne gespeicherte Szenendatei (nur Smoke)'}`,
    `**Hexe / Nature:** ${run.scene?.cellCount??'?'} / ${run.scene?.natureCount??'?'}`,
    '',
    '| Profil | Geste | rAF-p50 ms | rAF-p95 ms | >50 ms | Longtasks | Tile-Bakes | effektive DPR |',
    '|---|---|---:|---:|---:|---:|---:|---:|'];
  for(const p of run.phases)lines.push(`| ${p.quality} | ${p.kind} | ${p.frameIntervalMs.p50??'–'} | ${p.frameIntervalMs.p95??'–'} | ${p.frameIntervalMs.over50ms} | ${p.longTasks.count} | ${p.tileBakes??'–'} | ${p.qualityEffectiveDpr??'–'} |`);
  lines.push('','rAF-p50/p95 sind **Bildschirm-Frameintervalle während der Geste**, keine direkt instrumentierten `draw()`-Laufzeiten oder garantierten FPS-Werte. CDP-CPU-Taskzeit/Heap und Cachewerte stehen in `result.json`.','',
    '## Noch visuell und auf Zielhardware abzunehmen','',
    '- [ ] Fog-Kern vollständig opak, auch bei leeren/verspäteten Assets',
    '- [ ] Wolkenweltposition und Beleuchtung bleiben bei Pan/Zoom stabil',
    '- [ ] Waldtiefe, Bergschatten, Küsten, Relief und Sprite-Nähte ohne sichtbare Regression',
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
    phases:[],errors:[],acceptance:'PARTIAL – visual and reference-scene checks pending'};
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
    if(o.scene)await importScene(c,o.scene);
    run.scene=await snapshot(c);
    if(!o.scene)run.acceptance='SMOKE ONLY – no stored 397-hex scene supplied';
    else if(run.scene.cellCount!==397)throw Error('Imported scene does not contain 397 hexes');
    for(const quality of o.qualities){
      console.log(`Measuring ${quality} (${o.duration} ms per gesture)...`);
      await setControls(c,quality,true);
      await sleep(o.warmup);
      for(const kind of ['pan','zoom']){
        const result=await phase(c,kind,quality,o.duration);
        run.phases.push(result);
        await screenshot(c,join(resolve(o.out),`${quality}-${kind}-fog.png`));
      }
    }
    run.errors=c.errors;
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

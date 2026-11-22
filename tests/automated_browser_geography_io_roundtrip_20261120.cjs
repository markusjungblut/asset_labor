'use strict';
/* Full Firefox Geography-Lab interchange: real clicks, actual JSON download
 * bytes saved by Firefox, parsed and uploaded; corrupted files must not
 * mutate the current world. A synthetic opener tests acknowledged delivery.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const allowed=new Set(['geography-lab.html','geography-lab.js',
 'geography-lab-presets.js','geography-io.js','worldgen-geography.js']);
const output=process.env.VEDRAS_CI_ARTIFACTS||path.join(root,'test-artifacts');
const progress=s=>console.log('[Geography I/O]',s);
// Report the last completed step instead of leaving an open CI worker.
setTimeout(()=>{console.error('Geography I/O test exceeded 150 seconds');process.exit(1);},150000).unref();
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const server=http.createServer((req,res)=>{
  const name=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\//,'');
  if(name==='opener-test'){
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
   res.end([
    '<!doctype html><title>Geo-Import-Empfaenger</title>',
    '<button id="open">Geografie-Labor öffnen</button><script>',
    'window.received=[];window.respondOk=true;',
    "window.addEventListener('message',e=>{",
    "if(e.origin!==location.origin||e.data?.type!=='vedras-geography-preview')return;",
    'received.push({seed:e.data.world.seed,cells:e.data.world.cells.length});',
    "e.source.postMessage({type:'vedras-geography-preview-result',",
    'requestId:e.data.requestId,ok:respondOk,',
    "message:respondOk?'Welt erfolgreich übernommen':'Karte passt nicht zur Szene'},e.origin);",
    '});',
    "document.getElementById('open').addEventListener('click',()=>{",
    "window.open('geography-lab.html','vedras-geography-lab');",
    '});</script>'
   ].join('\n'));
   return;
  }
  if(!allowed.has(name)){res.writeHead(404);res.end('not found');return;}
  const type=name.endsWith('.html')?'text/html':'text/javascript';
  res.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store'});
  if(name==='geography-lab.html'){
   // Keep the same real UI and runtime, but avoid generating the 95x75
   // default map twice just to test the 35x26 JSON workflows.
   const html=fs.readFileSync(path.join(root,name),'utf8')
    .replace('id="worldWidth" type="number" min="10" max="240" value="95"',
     'id="worldWidth" type="number" min="10" max="240" value="35"')
    .replace('id="worldHeight" type="number" min="10" max="240" value="75"',
     'id="worldHeight" type="number" min="10" max="240" value="26"');
   res.end(html);
  }else fs.createReadStream(path.join(root,name)).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 let browser=null;
 const errors=[],checks=[];
 try{
  const {firefox}=require('playwright');
  browser=await firefox.launch({headless:true});
  const page=await browser.newPage({acceptDownloads:true,viewport:{width:1440,height:900}});
  page.on('pageerror',error=>errors.push(String(error)));
  page.on('dialog',async dialog=>dialog.accept());
  progress('Opening actual Geography Lab');
  await page.goto(origin+'/geography-lab.html',{waitUntil:'load'});
  await page.waitForFunction(()=>document.getElementById('message').textContent.includes('Berechnet in'));
  async function exportJson(id){
   const [download]=await Promise.all([
    page.waitForEvent('download',{timeout:30000}),page.locator('#'+id).click()
   ]);
   const file=await download.path();
   const raw=fs.readFileSync(file,'utf8');
   assert.ok(raw.trim().startsWith('{'));
   const data=JSON.parse(raw);
   checks.push({event:'download',id,name:download.suggestedFilename(),bytes:raw.length});
   return data;
  }
  async function importJson(id,raw,statusId,okText){
   await page.locator('#'+id).setInputFiles({
    name:'import-test.json',mimeType:'application/json',
    buffer:Buffer.from(typeof raw==='string'?raw:JSON.stringify(raw),'utf8')
   });
   await page.waitForFunction(({statusId,okText})=>
    document.getElementById(statusId).textContent.includes(okText),
    {statusId,okText},{timeout:30000});
  }
  await page.evaluate(()=>{
   for(const [id,value] of [
    ['worldSeed','geography-roundtrip-20261120'],
    ['worldWidth','35'],['worldHeight','26'],
    ['worldOriginQ','-17'],['worldOriginR','37']
   ])document.getElementById(id).value=value;
  });
  await page.locator('#generate').click();
  await page.waitForFunction(()=>
   document.getElementById('message').textContent.includes('geography-roundtrip-20261120'));
  progress('Parameter JSON export, change and import');
  const config=await exportJson('exportConfig');
  assert.equal(config.seed,'geography-roundtrip-20261120');
  assert.equal(config.generatorVersion,'geography-v2.1.2');
  assert.equal(config.originQ,-17);
  assert.equal(config.originR,37);
  await page.locator('#worldSeed').fill('changed-before-import');
  await page.locator('#generate').click();
  await importJson('configFile',config,'message','Parameter erfolgreich importiert');
  assert.equal(await page.locator('#worldSeed').inputValue(),config.seed);
  assert.equal(await page.locator('#worldWidth').inputValue(),'35');
  assert.equal(await page.locator('#worldOriginQ').inputValue(),'-17');
  const recoveredConfig=await exportJson('exportConfig');
  assert.deepEqual(recoveredConfig,config,'Parameter download/upload must be lossless');
  progress('World JSON export, import and exact roundtrip');
  const world=await exportJson('downloadWorld');
  assert.equal(world.version,'geography-v2.1.2');
  assert.equal(world.cells.length,35*26);
  assert.ok(world.cells.every(c=>typeof c.terrainId==='string'));
  await page.evaluate(()=>{
   document.getElementById('worldSeed').value='another-world';
   document.getElementById('worldOriginQ').value='0';
  });
  await page.locator('#generate').click();
  await importJson('worldFile',world,'message','Welt erfolgreich importiert');
  assert.equal(await page.locator('#worldSeed').inputValue(),world.seed);
  const restored=await exportJson('downloadWorld');
  assert.deepEqual(restored,world,
   'Exported complete world must import and re-export identical JSON');
  const bad=JSON.parse(JSON.stringify(world));
  bad.cells[0].terrainId='__unknown_asset__';
  await importJson('worldFile',bad,'message','Weltimport fehlgeschlagen');
  assert.equal(await page.locator('#worldSeed').inputValue(),world.seed);
  assert.deepEqual(await exportJson('downloadWorld'),world);
  await importJson('configFile','{ not valid JSON','message','Parameterimport fehlgeschlagen');
  assert.equal(await page.locator('#worldSeed').inputValue(),world.seed);
  progress('Statistics calculation, JSON export and import');
  await page.locator('#analysisSamples').fill('2');
  await page.locator('#analyzeDistribution').click();
  await page.waitForFunction(()=>!document.getElementById('exportDistribution').disabled,
   null,{timeout:45000});
  const statistics=await exportJson('exportDistribution');
  assert.equal(statistics.samples,2);
  assert.equal(statistics.seedBase,world.seed);
  await page.locator('#worldSeed').fill('different-stats-world');
  await page.locator('#generate').click();
  await importJson('distributionFile',statistics,'distributionStatus','Statistikimport fehlgeschlagen');
  assert.equal(await page.locator('#exportDistribution').isDisabled(),true);
  await importJson('worldFile',world,'message','Welt erfolgreich importiert');
  await importJson('distributionFile',statistics,'distributionStatus','Statistik erfolgreich importiert');
  const statisticsRestored=await exportJson('exportDistribution');
  assert.deepEqual(statisticsRestored,statistics);
  checks.push({event:'roundtrip',kind:'parameters,world,statistics',cells:world.cells.length,
   seed:world.seed,statsSamples:statistics.samples});
  // Seeds are user-defined Unicode strings, not trustworthy filenames.
  await page.evaluate(()=>{document.getElementById('worldSeed').value='Münster / Welt: 2026?';});
  await page.locator('#generate').click();
  const exotic=await exportJson('downloadWorld');
  assert.equal(exotic.seed,'Münster / Welt: 2026?');
  const safeName=checks.at(-1).name;
  assert.match(safeName,/^vedras-welt-/);
  assert.ok(!/[\/:?]/.test(safeName),'filenames must be portable: '+safeName);
  checks.push({event:'safe-filename',filename:safeName});
  progress('PostMessage opener handoff with acceptance and rejection');
  const opener=await browser.newPage();
  await opener.goto(origin+'/opener-test');
  const [popup]=await Promise.all([
   opener.waitForEvent('popup',{timeout:30000}),opener.locator('#open').click()
  ]);
  await popup.waitForSelector('#sendToLab');
  // The button is parsed before the final script attaches its click handler.
  // Ensure geography-lab.js completed its initial build before clicking.
  await popup.waitForFunction(()=>
   document.getElementById('message')?.textContent.includes('Berechnet in'),
   null,{timeout:30000});
  await popup.locator('#sendToLab').click();
  await popup.waitForFunction(()=>
   document.getElementById('message').textContent.includes('Übertragung erfolgreich'),
   null,{timeout:20000});
  assert.equal((await opener.evaluate(()=>window.received.length)),1);
  await opener.evaluate(()=>{window.respondOk=false;});
  await popup.locator('#sendToLab').click();
  await popup.waitForFunction(()=>
   document.getElementById('message').textContent.includes('Übertragung nicht übernommen'),
   null,{timeout:20000});
  checks.push({event:'postMessage',result:'accepted and rejected handoffs acknowledged'});
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(output,'geography-io-browser-test.json'),
   JSON.stringify({checks,passed:true,errors},null,2));
  console.log('PASS geography import/export roundtrip:',JSON.stringify(checks));
 }finally{
  // Always shut down the HTTP listener even when Playwright fails BEFORE
  // launching a browser; a leaked listener used to hang the CI job.
  try{await browser?.close();}finally{
   server.closeAllConnections();
   await new Promise(resolve=>server.close(resolve));
  }
 }
})().catch(e=>{console.error(e);process.exitCode=1;});

'use strict';
/* Standalone UI-only smoke: no server, atlas, IndexedDB or original assets. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
const organizer=fs.readFileSync(path.join(root,'ui-organizer.js'),'utf8');
(async()=>{
 const playwright=require('playwright');
 const browser=await playwright.firefox.launch({headless:true});
 const errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('pageerror',e=>errors.push(String(e.message||e)));
  // Strip all application modules; a broken server/worker is irrelevant
  // to a pure toolbar/inspector wiring test.
  const clean=html.replace(/<script\b[^>]*\bsrc="[^"]+"[^>]*><\/script>/g,'')
   .replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g,'');
  await page.setContent(clean);
  await page.addStyleTag({content:css});
  const expectedIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  const before=await page.evaluate(()=>[...document.querySelectorAll('[id]')]
   .map(x=>x.id));
  for(const id of expectedIds)assert.ok(before.includes(id),
   'HTML parsed without required ID '+id);
  await page.addScriptTag({content:organizer});
  const result=await page.evaluate(()=>{
   const groups=[...document.querySelectorAll('.inspector-group')];
   const nav=[...document.querySelectorAll('.inspector-shortcuts button')];
   const counts={};
   for(const id of ['terrainTests','reliefPanel','shorelinePanel','riverPanel',
    'roadPanel','natureLabTools','mountainTools','spriteShadowLab','polishPanel',
    'viewSettings','testSceneSettings']){
    const drawer=document.getElementById('drawer_'+id);
    counts[id]={
     count:document.querySelectorAll('#drawer_'+id).length,
     group:drawer?.closest('.inspector-group')?.id||null
    };
   }
   let natureRuns=0;
   document.getElementById('nPopulate').addEventListener('click',()=>natureRuns++);
   nav.find(x=>x.dataset.drawer==='natureLabTools').click();
   const afterNavigation=natureRuns;
   document.getElementById('quickPopulate').click();
   const afterExplicitAction=natureRuns;
   const output={
    groups:groups.map(x=>({id:x.id,title:x.querySelector('h3')?.textContent})),
    nav:nav.map(x=>({label:x.textContent,controls:x.getAttribute('aria-controls')})),
    counts,afterNavigation,afterExplicitAction,
    natureOpen:document.getElementById('drawer_natureLabTools').open,
    displayDefaults:Object.fromEntries(['objectsToggle','riverToggle',
     'chunkRendering','fastCamera','worldStreaming','adaptiveLod',
     'workerTerrain','gpuTerrain','gpuSprites','fogPreview','gridToggle']
     .map(id=>[id,document.getElementById(id).checked])),
    quality:document.getElementById('quality').value,
    sceneSize:document.getElementById('sceneSize').value,
    advancedWater:!!document.getElementById('waterSamplingMode')
     .closest('.lab-advanced'),
    advancedGPU:!!document.getElementById('gpuTerrain')
     .closest('.lab-advanced'),
    toolbar:!!document.querySelector('.toolbar-tools-menu #openGeography'),
    fileImport:!!document.querySelector('label[for="sceneImport"]')&&
     !!document.getElementById('sceneImport'),
    hasQuick37:!!document.getElementById('quick37'),
    ids:[...document.querySelectorAll('[id]')].map(x=>x.id)
   };
   return output;
  });
  assert.deepEqual(errors,[],'Organizer browser errors');
  assert.deepEqual(result.groups.map(x=>x.id),
   ['tools_terrain','tools_nature','tools_view','tools_test']);
  assert.equal(result.nav.length,6);
  for(const x of result.nav)assert.ok(result.ids.includes(x.controls));
  assert.equal(new Set(result.ids).size,result.ids.length);
  for(const id of expectedIds)assert.ok(result.ids.includes(id),
   'Original control ID lost by organizer: '+id);
  for(const item of Object.values(result.counts))
   assert.equal(item.count,1,'Accordion must be unique');
  for(const id of ['terrainTests','reliefPanel','shorelinePanel',
   'riverPanel','roadPanel'])assert.equal(result.counts[id].group,'tools_terrain');
  for(const id of ['natureLabTools','mountainTools','spriteShadowLab',
   'polishPanel'])assert.equal(result.counts[id].group,'tools_nature');
  assert.equal(result.counts.viewSettings.group,'tools_view');
  assert.equal(result.counts.testSceneSettings.group,'tools_test');
  assert.equal(result.afterNavigation,0,'Navigation must not redistribute nature');
  assert.equal(result.afterExplicitAction,1,'Explicit action must remain usable');
  assert.equal(result.natureOpen,true);
  for(const id of ['objectsToggle','riverToggle','chunkRendering',
   'fastCamera','worldStreaming','adaptiveLod','workerTerrain'])
   assert.equal(result.displayDefaults[id],true,id);
  for(const id of ['gpuTerrain','gpuSprites','fogPreview','gridToggle'])
   assert.equal(result.displayDefaults[id],false,id);
  assert.equal(result.quality,'2');
  assert.equal(result.sceneSize,'37');
  assert.ok(result.advancedWater&&result.advancedGPU);
  assert.ok(result.toolbar&&result.fileImport);
  assert.equal(result.hasQuick37,false);
  // UI-only screenshot, contains no real atlas or authoring assets.
  const out=process.env.VEDRAS_CI_ARTIFACTS||'test-artifacts';
  fs.mkdirSync(out,{recursive:true});
  await page.screenshot({path:path.join(out,'asset-lab-ui-cleanup.png')});
  process.stdout.write('Asset Labor organizer Firefox smoke: PASS ('+
   expectedIds.length+' original IDs, '+result.nav.length+' navigation links)\n');
 }finally{await browser.close();}
})().catch(e=>{process.stderr.write(String(e.stack||e)+'\n');process.exitCode=1;});

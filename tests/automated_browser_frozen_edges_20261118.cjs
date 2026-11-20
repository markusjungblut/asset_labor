'use strict';
/* Four real PNG chunks with an intentionally bright 2-source-pixel core
 * fringe. Verify the shipped viewer removes that fringe without covering
 * authorized land with clouds. No access to any user's IndexedDB. */
const assert=require('node:assert/strict'),http=require('node:http'),
 fs=require('node:fs'),path=require('node:path');
const ROOT=path.join(__dirname,'..'),OUT=process.env.VEDRAS_CI_ARTIFACTS||
 path.join(ROOT,'test-artifacts'),SCENE='v1-acafefed';
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const allow=p=>p==='frozen-map-game.html'||
  /^frozen-map-[\w-]+\.js$/.test(p)||
  ['cloud-artwork.js','authored-world-contract.js',
   'frozen-ground-core-seams.js'].includes(p);
 const server=http.createServer((req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname.slice(1);
  if(name==='seed.html'){res.writeHead(200,{'Content-Type':'text/html'});
   res.end('<!doctype html><html><body>synthetic seam seed</body></html>');return;}
  if(!allow(name)){res.writeHead(404);res.end('Not allowed');return;}
  fs.readFile(path.join(ROOT,name),(err,data)=>{
   if(err){res.writeHead(500);res.end(String(err));return;}
   res.writeHead(200,{'Content-Type':name.endsWith('.js')?
    'text/javascript':'text/html','Cache-Control':'no-store'});
   res.end(data);
  });
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await require('playwright')[process.env.VEDRAS_CI_BROWSER||'firefox']
   .launch({headless:true});
  const context=await browser.newContext({
   viewport:{width:950,height:720},deviceScaleFactor:1,
   reducedMotion:'reduce'
  });
  const seed=await context.newPage();
  await seed.goto(origin+'/seed.html');
  await seed.evaluate(async scene=>{
   const makePng=canvas=>new Promise((resolve,reject)=>canvas.toBlob(
    blob=>blob?resolve(blob):reject(Error('PNG encode failed')),'image/png'));
   const pad=3,size=512,sourceScale=2;
   const gcv=document.createElement('canvas');
   gcv.width=(size+2*pad)*sourceScale;
   gcv.height=Math.round((size+2*pad)*sourceScale*.85);
   const g=gcv.getContext('2d');
   g.fillStyle='#4c6740';g.fillRect(0,0,gcv.width,gcv.height);
   // Both adjacent tiles contain corrupted original baked border pixels.
   // The default border inset must remove these without adding draw passes.
   const lx=pad*sourceScale,rx=(pad+size)*sourceScale;
   const ty=Math.floor(pad*sourceScale*.85),
    by=Math.floor((pad+size)*sourceScale*.85);
   g.fillStyle='#fdfdfd';
   g.fillRect(lx,0,2,gcv.height);g.fillRect(rx-2,0,2,gcv.height);
   g.fillRect(0,ty,gcv.width,2);g.fillRect(0,by-2,gcv.width,2);
   const ground=await makePng(gcv);
   const sc=document.createElement('canvas');sc.width=sc.height=16;
   const scenery=await makePng(sc);
   const db=await new Promise((resolve,reject)=>{
    const r=indexedDB.open('vedras-frozen-world-v1',1);
    r.onupgradeneeded=()=>r.result.createObjectStore('tiles',{keyPath:'key'});
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
   });
   const records=[];
   for(const y of [-1,0])for(const x of [-1,0]){
    const id=x+','+y;
    records.push({key:scene+'|near|'+id,sceneKey:scene,level:'near',
     tile:{id,x:x*512,y:y*512,size:512},revision:'edge-fixture-v1',
     layers:[{layer:'ground',pad,png:ground},
      {layer:'scenery',pad:128,png:scenery}]});
   }
   const manifest={key:scene+'|manifest',schema:1,sceneKey:scene,
    levels:['near'],expectedTiles:4,
    cells:[{q:0,r:0,x:0,y:0,radius:230,visibility:'visible'}],
    pose:{zoom:1.15,panX:0,panY:0,dpr:2,projectY:.85},
    clouds:{seed:'ci-edge-fixture',assets:[]}};
   await new Promise((resolve,reject)=>{
    const tx=db.transaction('tiles','readwrite'),os=tx.objectStore('tiles');
    for(const row of [manifest,...records])os.put(row);
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
   });
   db.close();
  },SCENE);
  await seed.close();
  async function open(mode){
   const page=await context.newPage();
   const errors=[];page.on('pageerror',err=>errors.push(err.message));
   const suffix=mode==='safe'?'':'&groundSeam=exclusive';
   await page.goto(origin+'/frozen-map-game.html?scene='+SCENE+
    '&lod=near&perf=1&overview1x=0&fallbackAtlas=0&render=direct'+suffix);
   await page.waitForFunction(()=>
    window.__vedrasFrozenGameTest?.stats()?.decoded===4,
    null,{timeout:35000});
   await page.evaluate(()=>window.__vedrasFrozenGameTest.forceRedraw());
   const state=await page.evaluate(()=>{
    const report=window.__vedrasFrozenGameTest.stats();
    const cv=document.getElementById('game'),
     g=cv.getContext('2d'),x=Math.floor(cv.width/2),
     y=Math.floor(cv.height/2);
    const lum=(dx,dy)=>{
     const rgb=g.getImageData(x+dx,y+dy,1,1).data;
     return (rgb[0]+rgb[1]+rgb[2])/3;
    };
    return {complete:report.completeVisibleAtlas,
     seamPolicy:window.__vedrasFrozenGameTest.profileReport()?.environment?
      report.sourceEdgeInset?'inset':'raw':report.sourceEdgeInset?'inset':'raw',
     vertical:lum(0,95),horizontal:lum(95,0),
     interior:lum(95,95),failures:report.failures};
   });
   await page.screenshot({path:path.join(OUT,'seam-'+mode+'.png')});
   assert.deepEqual(errors,[]);
   assert.equal(state.complete,true);
   assert.equal(state.failures,0);
   await page.close();
   return state;
  }
  const safe=await open('safe'),raw=await open('raw');
  assert.equal(safe.seamPolicy,'inset');
  assert.equal(raw.seamPolicy,'raw');
  assert.ok(raw.vertical>safe.vertical+22,
   'raw source must show the synthetic vertical bright seam');
  assert.ok(raw.horizontal>safe.horizontal+22,
   'raw source must show the synthetic horizontal bright seam');
  assert.ok(Math.abs(safe.vertical-safe.interior)<32,
   'safe vertical seam must match uninterrupted terrain');
  assert.ok(Math.abs(safe.horizontal-safe.interior)<32,
   'safe horizontal seam must match uninterrupted terrain');
  console.log(JSON.stringify({passed:true,scene:SCENE,safe,raw},null,2));
  await context.close();
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});

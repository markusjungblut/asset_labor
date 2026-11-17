'use strict';
/* Synthetic local-only Firefox/IndexedDB restore. No user profile, atlas,
 * original scene or live server is mounted. One tiny ZIP is generated in RAM.
 */
const assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs');
const zlib=require('node:zlib');
const path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const {firefox}=require('playwright');
const allowed=new Set([
 'static-map-import.html','static-map-import-ui.js',
 'static-map-zip-inspector.js','static-map-zip-importer.js',
 'frozen-map-game.html','frozen-map-game.js','frozen-map-runtime.js',
 'frozen-map-derived-1x.js','frozen-map-derived-2x.js',
 'frozen-map-view-policy.js','frozen-map-fog-viewport.js',
 'frozen-map-profiler.js','frozen-map-world-blit.js','cloud-artwork.js'
]);
const SOURCE='v1-aabbccdd',SENTINEL='v1-0374527a';
const mods={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'frozen-map-package.js'),'utf8'),
 {...mods,Blob,TextEncoder,TextDecoder,DataView,Uint8Array});
const writer=mods.window.VedrasFrozenMapPackage;
// The common tiny base64 "PNG placeholder" has an INVALID internal
// IDAT CRC. Generate a standards-valid, opaque synthetic PNG instead.
const PNG=(()=>{
 const width=256,height=256,stride=width*4+1;
 const raw=Buffer.alloc(height*stride);
 for(let y=0;y<height;y++){
  const row=y*stride;raw[row]=0; // PNG scanline filter NONE
  for(let x=0;x<width;x++){
   const at=row+1+x*4;
   raw[at]=45;raw[at+1]=120;raw[at+2]=76;raw[at+3]=255;
  }
 }
 const chunk=(name,data)=>{
  const tag=Buffer.from(name,'ascii'),size=Buffer.alloc(4),crc=Buffer.alloc(4);
  size.writeUInt32BE(data.length,0);
  crc.writeUInt32BE(writer.crc32(Buffer.concat([tag,data])),0);
  return Buffer.concat([size,tag,data,crc]);
 };
 const ihdr=Buffer.alloc(13);
 ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);
 ihdr[8]=8;ihdr[9]=6; // RGBA 8-bit
 return Buffer.concat([
  Buffer.from([137,80,78,71,13,10,26,10]),
  chunk('IHDR',ihdr),
  chunk('IDAT',zlib.deflateSync(raw)),
  chunk('IEND',Buffer.alloc(0))
 ]);
})();
async function archive({badLast=false}={}){
 const cells=[
  {q:0,r:0,x:0,y:0,radius:164,visibility:'visible'},
  {q:1,r:0,x:256,y:0,radius:164,visibility:'visible'}
 ];
 const entries=[],tiles=[];
 for(let i=0;i<2;i++){
  const layers=[];
  for(let j=0;j<2;j++){
   const file='tiles/near/'+i+'_0.'+j+'.png';
   const body=badLast&&i===1&&j===1?Buffer.from('spoofed PNG body'):PNG;
   entries.push({name:file,blob:new Blob([body],{type:'image/png'})});
   layers.push({layer:j?'scenery':'ground',file,pad:j?128:3,
    crop:null,byteSize:body.length});
  }
  tiles.push({id:i+',0',x:i*512,y:0,size:512,revision:'ci-fixture',
   layers});
 }
 const manifest={schemaVersion:1,format:'vedras-static-game-map',
  scene:SOURCE,level:'near',worldTileSize:512,projectY:.85,
  complete:true,expectedTiles:2,exportedTiles:2,cells,
  initialPose:{zoom:.81,panX:0,panY:0,dpr:2,projectY:.85},
  visibilityPolicy:'local-test-all-authored; multiplayer requires server Fog',
  clouds:null,tiles};
 const blob=await writer.zipEntries([
  {name:'manifest.json',blob:new Blob([JSON.stringify(manifest)])},...entries]);
 return Buffer.from(await blob.arrayBuffer());
}
async function main(){
 const server=http.createServer((request,response)=>{
  const p=decodeURIComponent(new URL(request.url,'http://localhost').pathname)
   .replace(/^\/+/,'');
  if(!allowed.has(p)){response.writeHead(404);response.end('not allowed');return;}
  fs.readFile(path.join(root,p),(err,bytes)=>{
   if(err){response.writeHead(500);response.end(String(err));return;}
   response.writeHead(200,{'Content-Type':p.endsWith('.js')?
    'text/javascript;charset=utf-8':'text/html;charset=utf-8',
    'Cache-Control':'no-store'});
   response.end(bytes);
  });
 });
 await new Promise((resolve,reject)=>{
  server.once('error',reject);server.listen(0,'127.0.0.1',resolve);
 });
 const origin='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await firefox.launch({headless:true});
  const context=await browser.newContext();
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(String(error.message||error)));
  await page.goto(origin+'/static-map-import.html');
  await page.evaluate(async sentinel=>{
   await new Promise((resolve,reject)=>{
    const req=indexedDB.open('vedras-frozen-world-v1',1);
    req.onupgradeneeded=()=>req.result.createObjectStore('tiles',{keyPath:'key'});
    req.onerror=()=>reject(req.error);
    req.onsuccess=()=>{
     const db=req.result,tx=db.transaction('tiles','readwrite'),os=tx.objectStore('tiles');
     os.add({key:sentinel+'|manifest',keep:'do-not-touch'});
     os.add({key:sentinel+'|near|0,0',keep:'do-not-touch'});
     tx.oncomplete=()=>{db.close();resolve();};
     tx.onerror=()=>reject(tx.error);
    };
   });
  },SENTINEL);
  await page.locator('#archive').setInputFiles({
   name:'synthetic-restorable-map.zip',mimeType:'application/zip',
   buffer:await archive()
  });
  await page.locator('#inspect').click();
  await page.waitForFunction(()=>
   document.getElementById('preview').textContent.includes('Originalkarte: '+ 'v1-aabbccdd'),
   null,{timeout:15000});
  assert.equal(await page.locator('#import').isDisabled(),true);
  await page.locator('#confirm').check();
  await page.locator('#import').click();
  await page.locator('#openViewer').waitFor({state:'visible',timeout:30000});
  const href=await page.locator('#openViewer').getAttribute('href');
  const match=href.match(/scene=(v1-[0-9a-f]{8})&lod=near/);
  assert.ok(match,'Restored viewer must have a new scene ID');
  const target=match[1];
  assert.notEqual(target,SOURCE);
  assert.notEqual(target,SENTINEL);
  const saved=await page.evaluate(async ids=>{
   const db=await new Promise((resolve,reject)=>{
    const r=indexedDB.open('vedras-frozen-world-v1',1);
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
   });
   try{
    const keys=[ids.s+'|manifest',ids.s+'|near|0,0',
     ids.t+'|manifest',ids.t+'|near|0,0',ids.t+'|near|1,0',
     ids.t+'|import-pending'];
    return await new Promise((resolve,reject)=>{
     const tx=db.transaction('tiles','readonly'),os=tx.objectStore('tiles');
     const results={};for(const k of keys){
      const req=os.get(k);
      req.onsuccess=()=>{results[k]=req.result||null;};
     }
     tx.oncomplete=()=>resolve(results);tx.onerror=()=>reject(tx.error);
    });
   }finally{db.close();}
  },{s:SENTINEL,t:target});
  assert.equal(saved[SENTINEL+'|manifest'].keep,'do-not-touch');
  assert.equal(saved[SENTINEL+'|near|0,0'].keep,'do-not-touch');
  assert.equal(saved[target+'|manifest'].sceneKey,target);
  assert.equal(saved[target+'|manifest'].levels[0],'near');
  assert.equal(saved[target+'|manifest'].complete,true);
  assert.equal(saved[target+'|near|0,0'].layers.length,2);
  assert.equal(saved[target+'|near|1,0'].layers.length,2);
  assert.equal(saved[target+'|import-pending'],null);

  // Verify a broken late layer does not publish a partially restored map.
  await page.locator('#archive').setInputFiles({
   name:'bad-second-tile.zip',mimeType:'application/zip',
   buffer:await archive({badLast:true})
  });
  await page.locator('#inspect').click();
  await page.waitForFunction(()=>
   document.getElementById('preview').textContent.includes('Originalkarte: v1-aabbccdd'),
   null,{timeout:15000});
  await page.locator('#confirm').check();
  await page.locator('#import').click();
  await page.waitForFunction(()=>
   document.getElementById('status').textContent.includes('Import nicht abgeschlossen'),
   null,{timeout:30000});
  const after=await page.evaluate(async ids=>{
   const db=await new Promise((resolve,reject)=>{
    const r=indexedDB.open('vedras-frozen-world-v1',1);
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
   });
   try{
    return await new Promise((resolve,reject)=>{
     const tx=db.transaction('tiles','readonly'),os=tx.objectStore('tiles');
     const req=os.getAllKeys();
     req.onsuccess=()=>resolve(req.result);
     req.onerror=()=>reject(req.error);
    });
   }finally{db.close();}
  },{t:target});
  assert.equal(after.filter(k=>k.endsWith('|manifest')).length,2,
   'Only original sentinel and successful new scene may be published');
  assert.equal(after.filter(k=>k.includes('import-pending')).length,0,
   'Rollback must not leave a pending reservation on handled failure');

  // The NEW scene must remain readable after navigating to a fresh page.
  const viewer=await context.newPage();
  viewer.on('pageerror',error=>errors.push(String(error.message||error)));
  await viewer.goto(origin+'/'+href+'&perf=1');
  await viewer.waitForFunction(()=>
   window.__vedrasFrozenGameTest?.stats()?.saved===2,
   null,{timeout:30000});
  assert.equal(await viewer.evaluate(()=>
   window.__vedrasFrozenGameTest.readOnly),true);
  const diagnostics=await viewer.evaluate(()=>({
   stats:window.__vedrasFrozenGameTest.stats(),
   derived1x:window.__vedrasFrozenGameTest.derived1x(),
   derived2x:window.__vedrasFrozenGameTest.derived2x()
  }));
  if(diagnostics.stats.failures)
   process.stderr.write('Imported viewer diagnostic: '+
    JSON.stringify(diagnostics)+'\n');
  assert.equal(diagnostics.stats.failures,0);
  await viewer.reload();
  await viewer.waitForFunction(()=>
   window.__vedrasFrozenGameTest?.stats()?.saved===2,
   null,{timeout:30000});
  assert.equal(await viewer.evaluate(()=>
   window.__vedrasFrozenGameTest.scene),target);
  assert.deepEqual(errors,[]);
  process.stdout.write('ZIP importer Firefox/IndexedDB: PASS (new scene '+
   target+', original intact, rollback and viewer reload)\n');
  await context.close();
 }finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
 }
}
main().catch(error=>{process.stderr.write(String(error.stack||error)+'\n');
 process.exitCode=1;});
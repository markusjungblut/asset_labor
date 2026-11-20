'use strict';
// Synthetic Firefox/IndexedDB gate: real browser origin, no user atlas.
const assert=require('node:assert/strict'),fs=require('node:fs'),
 path=require('node:path'),http=require('node:http');
const {firefox}=require('playwright'),root=path.join(__dirname,'..');
const allowed=new Set(['saved-maps.html','saved-maps.js']);
async function main(){
 const server=http.createServer((request,response)=>{
  const p=new URL(request.url,'http://localhost').pathname.slice(1);
  if(!allowed.has(p)){response.writeHead(404);response.end();return;}
  fs.readFile(path.join(root,p),(err,bytes)=>{
   if(err){response.writeHead(500);response.end(String(err));return;}
   response.writeHead(200,{'Content-Type':p.endsWith('.js')?
    'text/javascript;charset=utf-8':'text/html;charset=utf-8',
    'Cache-Control':'no-store'});response.end(bytes);
  });
 });
 await new Promise((resolve,reject)=>{
  server.once('error',reject);server.listen(0,'127.0.0.1',resolve);
 });
 let browser;
 try{
  browser=await firefox.launch({headless:true});
  const context=await browser.newContext(),page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/saved-maps.html');
  // An absent store must not be created as a side effect of discovery.
  await page.locator('#findMaps').click();
  await page.waitForFunction(()=>
   document.querySelector('#mapStatus').textContent.includes('Kein vorhandener Kartenbestand'),
   null,{timeout:12000});
  const initial=await page.evaluate(async()=>typeof indexedDB.databases==='function'?
   (await indexedDB.databases()).some(db=>db.name==='vedras-frozen-world-v1'):null);
  if(initial!==null)assert.equal(initial,false,'catalog created an empty database');
  const scene='v1-0374527a',pending='v1-aaaabbbb';
  await page.evaluate(async ({scene,pending})=>new Promise((resolve,reject)=>{
   const req=indexedDB.open('vedras-frozen-world-v1',1);
   req.onupgradeneeded=()=>req.result.createObjectStore('tiles',{keyPath:'key'});
   req.onerror=()=>reject(req.error);
   req.onsuccess=()=>{
    const db=req.result,tx=db.transaction('tiles','readwrite'),
     os=tx.objectStore('tiles');
    os.add({key:scene+'|manifest',sceneKey:scene,schema:1,
     levels:['near'],expectedTiles:2,cells:[{q:0,r:0}],savedAt:'2026-11-17T00:00:00Z'});
    for(let i=0;i<2;i++)os.add({key:scene+'|near|'+i+',0',
     layers:[{png:new Blob(['synthetic'])}]});
    os.add({key:pending+'|manifest',sceneKey:pending,schema:1,
     levels:['near'],cells:[]});
    os.add({key:pending+'|near|0,0',layers:[]});
    os.add({key:pending+'|import-pending',sceneKey:pending,status:'import-pending'});
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onerror=()=>reject(tx.error);
   };
  }),{scene,pending});
  // Any attempt to fetch a tile value or write during the catalog scan fails.
  await page.evaluate(()=>{
   const oldGet=IDBObjectStore.prototype.get;
   IDBObjectStore.prototype.get=function(key){
    if(typeof key==='string'&&!key.endsWith('|manifest'))
     throw Error('Unexpected PNG payload read '+key);
    return oldGet.call(this,key);
   };
   const oldTx=IDBDatabase.prototype.transaction;
   IDBDatabase.prototype.transaction=function(store,mode,...rest){
    if(mode!=='readonly')throw Error('Unexpected write transaction');
    return oldTx.call(this,store,mode,...rest);
   };
  });
  await page.locator('#findMaps').click();
  await page.waitForFunction(()=>
   document.querySelector('#mapStatus').textContent.includes('1 veröffentlichte Karten'),
   null,{timeout:12000});
  assert.equal(await page.locator('#mapResults article').count(),1);
  assert.equal(await page.locator('#mapResults h2').innerText(),scene);
  assert.match(await page.locator('#mapResults').innerText(),/near: 2\/2/);
  assert.equal(await page.locator('#mapResults article a').getAttribute('href'),
   'frozen-map-game.html?scene='+scene+'&lod=near');
  await page.reload();
  await page.locator('#findMaps').click();
  await page.waitForFunction(()=>
   document.querySelector('#mapStatus').textContent.includes('1 veröffentlichte Karten'),
   null,{timeout:12000});
  assert.deepEqual(errors,[]);
  await context.close();
 }finally{if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));}
}
main().then(()=>process.stdout.write('Saved-map Firefox read-only gate passed\n'))
 .catch(e=>{console.error(e);process.exitCode=1;});

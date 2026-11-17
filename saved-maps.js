/* Local read-only catalog of published frozen-map manifests. Never reads
 * PNG payloads, creates stores, cleans records or grants Fog permissions. */
'use strict';
window.VedrasSavedMaps=(()=>{
 const DB='vedras-frozen-world-v1',STORE='tiles';
 const SCENE=/^v1-[0-9a-f]{8}$/;
 const LEVELS=['near','mid','far'];
 function inspectKeys(keys){
  const byScene=new Map();
  for(const key of keys){
   if(typeof key!=='string')continue;
   const match=/^(v1-[0-9a-f]{8})\|(manifest|import-pending|(?:(?:near|mid|far)\|-?\d+,-?\d+))$/.exec(key);
   if(!match)continue;
   const scene=match[1],suffix=match[2];
   let item=byScene.get(scene);
   if(!item){item={scene,manifest:false,pending:false,counts:{near:0,mid:0,far:0}};
    byScene.set(scene,item);}
   if(suffix==='manifest')item.manifest=true;
   else if(suffix==='import-pending')item.pending=true;
   else item.counts[suffix.slice(0,suffix.indexOf('|'))]++;
  }
  return [...byScene.values()].filter(x=>x.manifest&&!x.pending);
 }
 function describe(record,meta){
  const scene=meta.scene;
  const valid=record?.key===scene+'|manifest'&&record?.sceneKey===scene&&
   record.schema===1&&Array.isArray(record.cells)&&Array.isArray(record.levels);
  const levels=valid?[...new Set(record.levels)].filter(x=>LEVELS.includes(x)):[];
  const available=levels.filter(l=>meta.counts[l]>0);
  const expected=valid&&Number.isSafeInteger(record.expectedTiles)&&
   record.expectedTiles>=0?record.expectedTiles:null;
  return {scene,valid:!!valid,levels:available,counts:{...meta.counts},
   expectedTiles:expected,partial:valid&&record.complete===false,
   hexes:valid?record.cells.length:0,
   importedFromScene:valid&&SCENE.test(record.importedFromScene||'')?
    record.importedFromScene:null,
   savedAt:valid&&typeof record.savedAt==='string'&&
    /^\d{4}-\d{2}-\d{2}T/.test(record.savedAt)?record.savedAt:null};
 }
 function openExistingDb(){
  return new Promise((resolve,reject)=>{
   if(typeof indexedDB==='undefined'){
    reject(Error('IndexedDB ist in diesem Browser nicht verfügbar'));return;
   }
   // Opening an absent DB normally creates it. Abort that upgrade immediately.
   const req=indexedDB.open(DB);
   req.onupgradeneeded=()=>req.transaction.abort();
   req.onsuccess=()=>{
    const db=req.result;
    if(!db.objectStoreNames.contains(STORE)){
     db.close();reject(Error('Der lokale Kartenspeicher besitzt keine Kacheltabelle'));
    }else resolve(db);
   };
   req.onerror=()=>reject(Error('Kein vorhandener Kartenbestand in dieser Browser-Origin (oder Zugriff verweigert)'));
   req.onblocked=()=>reject(Error('Kartenspeicher wird durch einen anderen Tab blockiert'));
  });
 }
 function readKeys(db){
  return new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readonly');
   const req=tx.objectStore(STORE).getAllKeys(IDBKeyRange.bound('v1-','v1-\uffff'));
   let keys=[];
   req.onsuccess=()=>{keys=req.result;};
   tx.oncomplete=()=>resolve(keys);
   tx.onerror=()=>reject(tx.error||Error('Kartenkennungen konnten nicht gelesen werden'));
   tx.onabort=()=>reject(tx.error||Error('Kartenkennungssuche abgebrochen'));
  });
 }
 function readManifests(db,meta){
  if(!meta.length)return Promise.resolve([]);
  return new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readonly'),os=tx.objectStore(STORE),rows=[];
   for(const item of meta){
    const req=os.get(item.scene+'|manifest'); // No PNG tiles.
    req.onsuccess=()=>rows.push(describe(req.result,item));
   }
   tx.oncomplete=()=>resolve(rows);
   tx.onerror=()=>reject(tx.error||Error('Kartenmanifest konnte nicht gelesen werden'));
   tx.onabort=()=>reject(tx.error||Error('Manifestprüfung abgebrochen'));
  });
 }
 async function list({storage=null}={}){
  let records;
  if(storage){
   const meta=inspectKeys(await storage.keys());
   records=await Promise.all(meta.map(async item=>
    describe(await storage.get(item.scene+'|manifest'),item)));
  }else{
   const db=await openExistingDb();
   try{
    const meta=inspectKeys(await readKeys(db));
    records=await readManifests(db,meta);
   }finally{db.close();}
  }
  return records.sort((a,b)=>(b.savedAt||'').localeCompare(a.savedAt||'')||
   a.scene.localeCompare(b.scene));
 }
 function viewerPath(scene,level){
  if(!SCENE.test(scene)||!LEVELS.includes(level))throw Error('Ungültiger Kartenlink');
  return 'frozen-map-game.html?scene='+encodeURIComponent(scene)+
   '&lod='+encodeURIComponent(level);
 }
 return {inspectKeys,describe,list,viewerPath};
})();
(()=>{
 const find=document.getElementById('findMaps');
 if(!find)return;
 const LEVELS=['near','mid','far'];
 const $=id=>document.getElementById(id),search=$('sceneSearch'),
  output=$('mapResults'),status=$('mapStatus');
 $('origin').textContent=location.origin;
 let rows=[],scanned=false;
 function render(){
  output.replaceChildren();
  const query=search.value.trim().toLowerCase();
  const visible=rows.filter(r=>r.scene.includes(query)||
   (r.importedFromScene||'').includes(query));
  if(!visible.length){
   output.textContent=scanned?'Keine passenden veröffentlichten Karten gefunden.':
    'Noch keine Suche durchgeführt.';return;
  }
  for(const item of visible){
   const article=document.createElement('article');
   const title=document.createElement('h2');title.textContent=item.scene;
   article.appendChild(title);
   const info=document.createElement('p');
   const pieces=[item.hexes+' Hexfelder'];
   if(item.importedFromScene)pieces.push('Import aus '+item.importedFromScene);
   if(item.savedAt)pieces.push('Gespeichert '+item.savedAt.slice(0,10));
   info.textContent=pieces.join(' · ');article.appendChild(info);
   const details=document.createElement('p');
   details.textContent=item.valid?(
    item.partial?'Als Teilkarte markiert. ':'')+
    LEVELS.map(level=>level+': '+item.counts[level]+'/'+
     (item.expectedTiles??'?')).join(' · '):
    'Manifest ungültig – nicht öffnen.';
   article.appendChild(details);
   if(!item.levels.length){
    const note=document.createElement('p');
    note.textContent=item.valid?'Keine gespeicherten Bildkacheln für die eingetragenen Detailstufen.':
     'Bitte ausschließlich über die vorhandene Sicherung wiederherstellen.';
    article.appendChild(note);
   }
   for(const level of item.levels){
    const link=document.createElement('a');
    link.href=window.VedrasSavedMaps.viewerPath(item.scene,level);
    link.textContent=level+' öffnen';article.appendChild(link);
   }
   output.appendChild(article);
  }
 }
 find.addEventListener('click',async()=>{
  find.disabled=true;status.textContent='Lese lokale Kartenkennungen und Manifeste …';
  try{
   rows=await window.VedrasSavedMaps.list();scanned=true;
   status.textContent=rows.length+' veröffentlichte Karten gefunden. Keine Daten verändert.';
   render();
  }catch(error){
   rows=[];scanned=false;
   status.textContent=String(error.message||error)+
    '. Prüfe Firefox-Profil und http://127.0.0.1:8780.';
   render();
  }finally{find.disabled=false;}
 });
 search.addEventListener('input',render);
})();
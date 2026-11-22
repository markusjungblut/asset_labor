/* Separate, append-only IndexedDB store for experimental large-map PNG
 * receipts. Does not open or mutate the existing frozen-world database.
 * Database opens ONLY when get/add is explicitly called.
 */
(function(root){
'use strict';
const NAME='vedras-large-map-bake-v1',VERSION=1,STORE='receipts';
function create({indexedDB=root.indexedDB,name=NAME}={}){
 if(typeof name!=='string'||!/^vedras-large-map-bake-[\w-]+$/.test(name))
  throw Error('Ungültiger isolierter Bake-Speichername.');
 let dbPromise=null;
 function db(){
  if(!indexedDB?.open)throw Error('IndexedDB ist nicht verfügbar.');
  if(!dbPromise){
   dbPromise=new Promise((resolve,reject)=>{
    const request=indexedDB.open(name,VERSION);
    request.onupgradeneeded=()=>{
     if(!request.result.objectStoreNames.contains(STORE))
      request.result.createObjectStore(STORE,{keyPath:'key'});
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||Error('Bake-Speicher konnte nicht geöffnet werden.'));
    request.onblocked=()=>reject(Error('Bake-Speicher ist in einem anderen Tab blockiert.'));
   }).catch(error=>{dbPromise=null;throw error;});
  }
  return dbPromise;
 }
 async function get(key){
  if(typeof key!=='string'||!key.startsWith('bake-v1|'))
   throw Error('Ungültiger Bake-Kachelschlüssel.');
  const connection=await db();
  return new Promise((resolve,reject)=>{
   const tx=connection.transaction(STORE,'readonly'),
    req=tx.objectStore(STORE).get(key);
   let result=null;
   req.onsuccess=()=>{result=req.result||null;};
   tx.oncomplete=()=>resolve(result);
   tx.onabort=()=>reject(tx.error||Error('Bake-Lesezugriff abgebrochen.'));
   tx.onerror=()=>reject(tx.error||Error('Bake-Lesezugriff fehlgeschlagen.'));
  });
 }
 async function add(record){
  if(!record||typeof record.key!=='string'||
     !record.key.startsWith('bake-v1|')||
     record.schema!=='vedras-large-map-bake-receipt-v1')
   throw Error('Ungültiger Bake-Receipt. Speicherung verweigert.');
  const connection=await db();
  return new Promise((resolve,reject)=>{
   const tx=connection.transaction(STORE,'readwrite');
   // IDB add() is atomic: an existing key aborts the entire transaction.
   // Never use put(), clear(), delete() or overwrite an older render result.
   tx.objectStore(STORE).add(record);
   tx.oncomplete=()=>resolve({saved:true,key:record.key});
   tx.onabort=()=>reject(tx.error||Error('Bake-Kachel existiert bereits oder Speicherung abgebrochen.'));
   tx.onerror=()=>reject(tx.error||Error('Bake-Kachel konnte nicht gespeichert werden.'));
  });
 }
 return {name,get,add};
}
const api={NAME,STORE,VERSION,create};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.VedrasLargeMapBakeStorage=api;
})(typeof window!=='undefined'?window:globalThis);

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Storage=require('../large-map-bake-storage.js');
function mockDatabase(){
 const values=new Map(),opened=[];
 const adapter={open(name,version){
  opened.push({name,version});
  const request={result:null,error:null};
  const connection={
   objectStoreNames:{contains:()=>false},
   createObjectStore:()=>{},
   transaction(_store,mode){
    const tx={error:null,oncomplete:null,onabort:null,onerror:null};
    tx.objectStore=()=>({
     get(key){
      const req={result:null,onsuccess:null};
      queueMicrotask(()=>{
       req.result=values.get(key);
       req.onsuccess?.();
       tx.oncomplete?.();
      });return req;
     },
     add(value){
      queueMicrotask(()=>{
       if(values.has(value.key)){
        tx.error=Error('ConstraintError');tx.onabort?.();return;
       }
       values.set(value.key,value);tx.oncomplete?.();
      });
     }
    });
    return tx;
   }
  };
  queueMicrotask(()=>{
   request.result=connection;request.onupgradeneeded?.();request.onsuccess?.();
  });
  return request;
 }};
 return {adapter,opened,values};
}
test('separate IndexedDB is lazy, append-only and cannot replace original atlas',async()=>{
 const db=mockDatabase();
 const store=Storage.create({indexedDB:db.adapter});
 assert.equal(db.opened.length,0,'no database opened just by importing module');
 const key='bake-v1|plan|renderer|catalog|near-4x|0,0';
 assert.equal(await store.get(key),null);
 assert.equal(db.opened.length,1);
 assert.equal(db.opened[0].name,'vedras-large-map-bake-v1');
 assert.notEqual(db.opened[0].name,'vedras-frozen-world-v1');
 const record={key,schema:'vedras-large-map-bake-receipt-v1',layers:[]};
 assert.deepEqual(await store.add(record),{saved:true,key});
 assert.equal((await store.get(key)).schema,record.schema);
 await assert.rejects(()=>store.add({...record,layers:['tampered']}),/ConstraintError/);
 assert.deepEqual((await store.get(key)).layers,[]);
 assert.equal(db.values.size,1);
 await assert.rejects(()=>store.get('scene|manifest'),/[Ss]chlüssel/);
 await assert.rejects(()=>store.add({key:'something-else'}),/Receipt/);
});

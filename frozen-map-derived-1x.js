/* Vedras – optional 1x overview images derived from the ALREADY persisted
 * 2x cache. Never modify the frozen originals or the 2x derived DB.
 * The full 2x layers remain available at ordinary/close zoom.
 */
'use strict';
window.VedrasFrozenDerived1x=(()=>{
 const DB='vedras-frozen-derived-1x-v1',STORE='tiles';
 function createStore({source=window.VedrasFrozenDerived2x.createStore()}={}){
  let opened=null;
  const inFlight=new Map(),volatile=new Map(),MAX_VOLATILE=32*1048576;
  let volatileBytes=0,enabled=false;
  const counts={hits:0,converted:0,bytes:0,failures:0,lastError:null};
  const dims=window.VedrasFrozenDerived2x.dimensions;
  const scaledCrop=window.VedrasFrozenDerived2x.scaledCrop;
  async function open(){
   if(opened)return opened;
   opened=new Promise((resolve,reject)=>{
    const q=indexedDB.open(DB,1);
    q.onupgradeneeded=()=>{
     if(!q.result.objectStoreNames.contains(STORE))
      q.result.createObjectStore(STORE,{keyPath:'key'});
    };
    q.onsuccess=()=>resolve(q.result);
    q.onerror=()=>reject(q.error||Error('1×-Cache nicht verfügbar'));
   });
   return opened;
  }
  async function job(mode,fn){
   const db=await open();
   return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,mode),obj=tx.objectStore(STORE);
    const req=fn(obj);
    let result=null;
    if(req)req.onsuccess=()=>result=req.result;
    tx.oncomplete=()=>resolve(result);
    tx.onerror=()=>reject(tx.error||Error('1×-Cache fehlgeschlagen'));
    tx.onabort=()=>reject(tx.error||Error('1×-Cache abgebrochen'));
   });
  }
  async function downscale(layer){
   if(!['ground','terrain','scenery','structures'].includes(layer.layer))
    return {...layer};
   const {width,height}=await dims(layer.png);
   const outW=Math.max(1,Math.round(width/2)),
    outH=Math.max(1,Math.round(height/2));
   let im;
   try{
    try{
     im=await createImageBitmap(layer.png,{
      resizeWidth:outW,resizeHeight:outH,resizeQuality:'high'
     });
    }catch{im=await createImageBitmap(layer.png);}
    const cv=document.createElement('canvas');
    cv.width=outW;cv.height=outH;
    const g=cv.getContext('2d',{alpha:true});
    if(!g)throw Error('1×-Canvas-Kontext fehlt');
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    g.drawImage(im,0,0,outW,outH);
    const png=await new Promise((resolve,reject)=>cv.toBlob(blob=>
     blob?resolve(blob):reject(Error('1×-PNG Encoding fehlgeschlagen')),
     'image/png'));
    return {...layer,png,
     crop:scaledCrop(layer,width,height,outW,outH)};
   }finally{im?.close?.();}
  }
  async function build(key){
   const sourceRecord=await source.get(key);
   if(!sourceRecord||!Array.isArray(sourceRecord.layers))return sourceRecord;
   const layers=[];
   for(const layer of sourceRecord.layers)layers.push(await downscale(layer));
   const record={...sourceRecord,layers,derivedFormat:'1x-png-v1',
    sourceRevision:sourceRecord.revision,
    sourceFormat:sourceRecord.derivedFormat||'original'};
   counts.converted++;
   const bytes=layers.reduce((sum,l)=>sum+(l.png?.size||0),0);
   counts.bytes+=bytes;
   try{await job('readwrite',obj=>obj.put(record));}
   catch(error){
    counts.failures++;counts.lastError=String(error?.message||error);
    if(bytes<=MAX_VOLATILE){
     if(volatile.has(key))volatileBytes-=volatile.get(key).bytes;
     volatile.set(key,{record,bytes});volatileBytes+=bytes;
     while(volatileBytes>MAX_VOLATILE&&volatile.size>1){
      const oldest=volatile.keys().next().value;
      volatileBytes-=volatile.get(oldest).bytes;volatile.delete(oldest);
     }
    }
   }
   return record;
  }
  async function get1x(key){
   if(!enabled)return source.get(key);
   if(volatile.has(key)){
    const stored=volatile.get(key);
    volatile.delete(key);volatile.set(key,stored);
    counts.hits++;return stored.record;
   }
   try{
    const hit=await job('readonly',obj=>obj.get(key));
    if(hit?.derivedFormat==='1x-png-v1'){
     counts.hits++;return hit;
    }
   }catch(error){
    counts.failures++;counts.lastError=String(error?.message||error);
   }
   if(inFlight.has(key))return inFlight.get(key);
   const p=build(key).finally(()=>inFlight.delete(key));
   inFlight.set(key,p);return p;
  }
  return {
   get:key=>source.get(key),
   getVariant:(key,variant)=>variant==='1x'?get1x(key):source.get(key),
   keys:prefix=>source.keys(prefix),
   setEnabled:value=>{
    enabled=value===true;
    source.setEnabled?.(true);
   },
   stats:()=>({...counts,enabled,pending:inFlight.size,
    volatileTiles:volatile.size,volatileBytes,
    source2x:source.stats?.()||null}),
   source2x:source
  };
 }
 return {DB,createStore};
})();

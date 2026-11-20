/* Step 20: opt-in, lazily persisted 2x image derivatives.
 * Reads immutable 4x tiles from the ORIGINAL frozen-map IndexedDB.
 * Writes ONLY to a separate derived-image DB. Never modifies originals,
 * manifests, world geometry, sprites, shadow parameters or atlas ZIP files.
 */
'use strict';
window.VedrasFrozenDerived2x=(()=>{
 const DB='vedras-frozen-derived-2x-v1',STORE='tiles',VERSION=1;
 function dimensions(png){
  if(!(png instanceof Blob))throw Error('PNG-Blob fehlt');
  return png.slice(0,24).arrayBuffer().then(buffer=>{
   const b=new Uint8Array(buffer);
   if(b.length!==24||b[0]!==137||b[1]!==80||b[2]!==78||b[3]!==71||
      b[4]!==13||b[5]!==10||b[6]!==26||b[7]!==10)
    throw Error('Ungültiger PNG-Header');
   const v=new DataView(buffer),width=v.getUint32(16),height=v.getUint32(20);
   if(!width||!height||width>10000||height>10000)
    throw Error('PNG-Größe nicht zulässig');
   return {width,height};
  });
 }
 function scaledCrop(layer,width,height,outWidth,outHeight){
  if(!layer.crop)return null;
  const c=layer.crop;
  const sx=outWidth/width,sy=outHeight/height;
  return {x:c.x*sx,y:c.y*sy,fullWidth:c.fullWidth*sx,
   fullHeight:c.fullHeight*sy};
 }
 function getDb(){
  let opened;
  return async()=>{
   if(opened)return opened;
   opened=new Promise((resolve,reject)=>{
    const q=indexedDB.open(DB,VERSION);
    q.onupgradeneeded=()=>{
     if(!q.result.objectStoreNames.contains(STORE))
      q.result.createObjectStore(STORE,{keyPath:'key'});
    };
    q.onsuccess=()=>resolve(q.result);
    q.onerror=()=>reject(q.error||Error('2×-Cache konnte nicht geöffnet werden'));
   });
   return opened;
  };
 }
 function createStore({source=window.VedrasFrozenMap.indexedStore()}={}){
  const open=getDb(),inflight=new Map(),volatile=new Map();
  let volatileBytes=0;
  const maxVolatileBytes=48*1048576;
  const counters={converted:0,hits:0,volatileHits:0,bytes:0,failures:0,lastError:null};
  let enabled=false;
  async function job(mode,action){
   const db=await open();
   return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,mode),os=tx.objectStore(STORE);
    const q=action(os);let result=null;
    if(q)q.onsuccess=()=>{result=q.result;};
    tx.oncomplete=()=>resolve(result);
    tx.onerror=()=>reject(tx.error||Error('2×-Cache-Transaktion fehlgeschlagen'));
    tx.onabort=()=>reject(tx.error||Error('2×-Cache-Transaktion abgebrochen'));
   });
  }
  async function encode(canvas){
   return new Promise((resolve,reject)=>canvas.toBlob(blob=>
    blob?resolve(blob):reject(Error('2× PNG konnte nicht gespeichert werden')),
    'image/png'));
  }
  async function downscale(layer){
   const sourcePng=layer.png,{width,height}=await dimensions(sourcePng);
   if(width<=1||height<=1)return {...layer};
   const w=Math.max(1,Math.round(width/2)),
    h=Math.max(1,Math.round(height/2));
   let image;
   try{
    // A supporting browser may resize DURING PNG decoding, avoiding an
    // intermediate fully decoded 4x pixel buffer. If unsupported, the
    // canvas downsamples after decoding the source.
    try{image=await createImageBitmap(sourcePng,{
      resizeWidth:w,resizeHeight:h,resizeQuality:'high'});
    }catch{image=await createImageBitmap(sourcePng);}
    const cv=document.createElement('canvas');
    cv.width=w;cv.height=h;
    const cx=cv.getContext('2d',{alpha:true});
    if(!cx)throw Error('2× Canvas-Kontext nicht verfügbar');
    cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality='high';
    cx.drawImage(image,0,0,w,h);
    const png=await encode(cv);
    return {...layer,png,crop:scaledCrop(layer,width,height,w,h)};
   }finally{image?.close?.();}
  }
  async function build(key){
   const record=await source.get(key);
   if(!record||!Array.isArray(record.layers))return record;
   const layers=[];
   for(const layer of record.layers){
    // Only image layers may be downscaled; world placement and layer order
    // always come directly from the archived record.
    if(['ground','terrain'].includes(layer.layer)||
       (!record.sceneryNative2x&&['scenery','structures'].includes(layer.layer)))
     layers.push(await downscale(layer));
    else layers.push({...layer});
   }
   const derived={...record,layers,derivedFormat:'2x-png-v1',
    sourceRevision:record.revision,sourceLayerBytes:record.layers.map(l=>l.png?.size||0)};
   counters.converted++;
   counters.bytes+=layers.reduce((n,l)=>n+(l.png?.size||0),0);
   // A browser storage quota failure must not hide an otherwise valid tile.
   try{await job('readwrite',os=>os.put(derived));}
   catch(error){
    counters.failures++;counters.lastError=String(error?.message||error);
    const bytes=layers.reduce((n,l)=>n+(l.png?.size||0),0);
    // Quota exhaustion must not force constant 4x re-decodes during a pan.
    // Volatile fallback never touches the immutable original archive.
    if(bytes<=maxVolatileBytes){
     volatile.set(key,{record:derived,bytes});volatileBytes+=bytes;
     while(volatileBytes>maxVolatileBytes&&volatile.size>1){
      const oldest=volatile.keys().next().value,e=volatile.get(oldest);
      volatile.delete(oldest);volatileBytes-=e.bytes;
     }
    }
   }
   return derived;
  }
  async function get(key){
   if(!enabled||key.endsWith('|manifest'))return source.get(key);
   if(volatile.has(key)){
    const e=volatile.get(key);
    volatile.delete(key);volatile.set(key,e);
    counters.volatileHits++;return e.record;
   }
   try{
    const cached=await job('readonly',os=>os.get(key));
    if(cached?.derivedFormat==='2x-png-v1'){
     counters.hits++;return cached;
    }
   }catch(error){counters.failures++;counters.lastError=String(error?.message||error);}
   if(inflight.has(key))return inflight.get(key);
   const promise=build(key).finally(()=>inflight.delete(key));
   inflight.set(key,promise);
   return promise;
  }
  // High-detail viewer: do not downscale a 4x Ground that will be
  // discarded immediately. Reuse a pre-existing 2x tile for its Scenery
  // where possible, otherwise derive and persist only the Scenery PNG.
  // This derived-only cache never duplicates the huge original Ground blob.
  const mixedInflight=new Map();
  let mixedHits=0,mixedBuilt=0,mixedLegacyHits=0,mixedFailures=0,
   groundDownscalesSkipped=0;
  async function getSceneryMixed(key,original){
   if(!original?.layers?.length||key.endsWith('|manifest'))return original;
   // Fresh shadow-only successors already store Scenery at 2x. Do not
   // waste time or reduce its quality by downscaling it to 1x again.
   if(original.sceneryNative2x)return {...original,
    derivedFormat:'4x-ground-2x-scenery-v1'};
   const overlayKey=key+'~scenery-only-v1';
   const combine=record=>{
    if(!record||record.sourceRevision!==original.revision||
       !Array.isArray(record.layers)||record.layers.length!==original.layers.length)
     return null;
    let replaced=0;
    const layers=original.layers.map((layer,i)=>{
     const smaller=record.layers[i];
     if(['scenery','structures'].includes(layer.layer)&&
        smaller?.layer===layer.layer&&smaller.png instanceof Blob){
      replaced++;return smaller;
     }
     return layer;
    });
    if(!replaced)return null;
    groundDownscalesSkipped++;
    return {...original,layers,derivedFormat:'4x-ground-2x-scenery-v1'};
   };
   // Existing complete 2x-derived record is authoritative for smaller
   // Scenery; do not generate a second copy after an older standard session.
   try{
    const complete=await job('readonly',os=>os.get(key));
    if(complete?.derivedFormat==='2x-png-v1'){
     const reused=combine(complete);
     if(reused){mixedLegacyHits++;return reused;}
    }
   }catch(error){mixedFailures++;counters.lastError=String(error?.message||error);}
   if(volatile.has(overlayKey)){
    const entry=volatile.get(overlayKey),existing=combine(entry.record);
    if(existing){mixedHits++;return existing;}
    volatileBytes-=entry.bytes;volatile.delete(overlayKey);
   }
   try{
    const cached=await job('readonly',os=>os.get(overlayKey));
    if(cached?.derivedFormat==='scenery-only-2x-v1'){
     const hit=combine(cached);
     if(hit){mixedHits++;return hit;}
    }
   }catch(error){mixedFailures++;counters.lastError=String(error?.message||error);}
   if(mixedInflight.has(key))return mixedInflight.get(key);
   const promise=(async()=>{
    const layers=[];
    for(const layer of original.layers)
     layers.push(['scenery','structures'].includes(layer.layer)?
      await downscale(layer):null);
    const overlay={key:overlayKey,derivedFormat:'scenery-only-2x-v1',
     sourceRevision:original.revision,layers};
    mixedBuilt++;
    const bytes=layers.reduce((n,layer)=>n+(layer?.png?.size||0),0);
    try{await job('readwrite',os=>os.put(overlay));}
    catch(error){
     mixedFailures++;counters.lastError=String(error?.message||error);
     if(bytes<=maxVolatileBytes){
      volatile.set(overlayKey,{record:overlay,bytes});volatileBytes+=bytes;
      while(volatileBytes>maxVolatileBytes&&volatile.size>1){
       const oldest=volatile.keys().next().value,entry=volatile.get(oldest);
       volatile.delete(oldest);volatileBytes-=entry.bytes;
      }
     }
    }
    return combine(overlay)||original;
   })().finally(()=>mixedInflight.delete(key));
   mixedInflight.set(key,promise);
   return promise;
  }
  return {
   get,getSceneryMixed,keys:prefix=>source.keys(prefix),
   put:()=>Promise.reject(Error('2×-Abspielcache ist nur lesend; Originalarchiv bleibt unverändert')),
   setEnabled:value=>{enabled=value===true;},
   stats:()=>({...counters,enabled,pending:inflight.size,
    volatileTiles:volatile.size,volatileBytes,
    mixedHits,mixedBuilt,mixedLegacyHits,mixedFailures,
    groundDownscalesSkipped,mixedPending:mixedInflight.size})
  };
 }
 return {DB,scaledCrop,dimensions,createStore};
})();

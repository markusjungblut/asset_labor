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
  const open=getDb(),inflight=new Map();
  const counters={converted:0,hits:0,skipped:0,bytes:0,failures:0,lastError:null};
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
    if(['ground','terrain','scenery','structures'].includes(layer.layer))
     layers.push(await downscale(layer));
    else layers.push({...layer});
   }
   const derived={...record,layers,derivedFormat:'2x-png-v1',
    sourceRevision:record.revision,sourceLayerBytes:record.layers.map(l=>l.png?.size||0)};
   counters.converted++;
   counters.bytes+=layers.reduce((n,l)=>n+(l.png?.size||0),0);
   // A browser storage quota failure must not hide an otherwise valid tile.
   try{await job('readwrite',os=>os.put(derived));}
   catch(error){counters.failures++;counters.lastError=String(error?.message||error);}
   return derived;
  }
  async function get(key){
   if(!enabled||key.endsWith('|manifest'))return source.get(key);
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
  return {
   get,keys:prefix=>source.keys(prefix),
   put:()=>Promise.reject(Error('2×-Abspielcache ist nur lesend; Originalarchiv bleibt unverändert')),
   setEnabled:value=>{enabled=value===true;},
   stats:()=>({...counters,enabled,pending:inflight.size})
  };
 }
 return {DB,scaledCrop,dimensions,createStore};
})();

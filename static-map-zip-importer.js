/* Explicit, crash-safe-ish ZIP32 restore into a NEW local scene identity.
 * "Crash-safe" here means the viewer never sees an incomplete manifest:
 * a crash can leave inaccessible reserved tile records, not a published map.
 * Never overwrite archived/authoring scene IDs or clear original data.
 */
'use strict';
window.VedrasStaticMapZipImporter=(()=>{
 const SCHEMA=1,DB='vedras-frozen-world-v1',STORE='tiles';
 const PREFIX='v1-',LEVELS=['near','mid','far'];
 // Never treat a recently active import as abandoned.
 const MIN_RECOVERY_AGE_MS=30*60*1000,MAX_RECOVERY_RECORDS=30001;
 const sceneValid=s=>/^v1-[0-9a-f]{8}$/.test(s||'');
 const fail=s=>{throw Error('Kartenimport: '+s)};
 const randomHex=n=>{
  if(typeof crypto==='undefined'||typeof crypto.getRandomValues!=='function')
   fail('Sichere Zufallsquelle nicht verfügbar');
  const bytes=crypto.getRandomValues(new Uint8Array(n));
  return [...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');
 };
 const createSceneId=()=>PREFIX+randomHex(4);
 const createToken=()=>randomHex(16);
 const prefix=scene=>scene+'|';
 const pendingKey=scene=>prefix(scene)+'import-pending';
 function createIndexedStorage(){
  let opening;
  const open=()=>{
   if(opening)return opening;
   opening=new Promise((resolve,reject)=>{
    if(typeof indexedDB==='undefined'){reject(Error('IndexedDB nicht verfügbar'));return;}
    const req=indexedDB.open(DB,SCHEMA);
    req.onupgradeneeded=()=>{
     if(!req.result.objectStoreNames.contains(STORE))
      req.result.createObjectStore(STORE,{keyPath:'key'});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||Error('IndexedDB-Öffnung fehlgeschlagen'));
   });
   return opening;
  };
  function transaction(mode,operation){
   return open().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE);
    let result,reason=null;
    tx.oncomplete=()=>resolve(result);
    tx.onerror=()=>reject(reason||tx.error||Error('IndexedDB-Transaktion fehlgeschlagen'));
    tx.onabort=()=>reject(reason||tx.error||Error('IndexedDB-Transaktion abgebrochen'));
    const abort=message=>{
     reason=Error('Kartenimport: '+(message||'Schreibtransaktion abgebrochen'));
     try{tx.abort();}catch(_){}
    };
    try{operation(store,value=>{result=value;},abort);}
    catch(e){abort(String(e?.message||e));}
   }));
  }
  const range=scene=>IDBKeyRange.bound(prefix(scene),prefix(scene)+'\uffff');
  return {
   async reserve(scene,token){
    if(!sceneValid(scene)||typeof token!=='string'||token.length!==32)
     fail('ungültige Importidentität');
    return transaction('readwrite',(os,done,abort)=>{
     const probe=os.getAllKeys(range(scene),1);
     probe.onsuccess=()=>{
      if(probe.result.length){done(false);return;}
      os.add({key:pendingKey(scene),sceneKey:scene,
       status:'import-pending',importToken:token,startedAt:new Date().toISOString()});
      done(true);
     };
     probe.onerror=abort;
    });
   },
   async addTile(scene,token,record){
    return transaction('readwrite',(os,done,abort)=>{
     const marker=os.get(pendingKey(scene));
     marker.onsuccess=()=>{
      if(marker.result?.importToken!==token){abort();return;}
      if(record.sceneKey!==scene||!record.key.startsWith(prefix(scene))||
       record.key===pendingKey(scene)||record.key===prefix(scene)+'manifest'){
       abort();return;
      }
      // Refresh activity lease transactionally with each completed tile.
      os.put({...marker.result,lastActivityAt:new Date().toISOString()});
      os.add({...record,importToken:token});
      done(true);
     };
     marker.onerror=abort;
    });
   },
   async publish(scene,token,manifest,count,authoredWorld=null){
    return transaction('readwrite',(os,done,abort)=>{
     const marker=os.get(pendingKey(scene));
     marker.onsuccess=()=>{
      if(marker.result?.importToken!==token){abort();return;}
      const size=os.count(range(scene));
      size.onsuccess=()=>{
       if(size.result!==count+1){abort();return;}
       if(authoredWorld)os.add({key:prefix(scene)+'world',schema:SCHEMA,
        sceneKey:scene,kind:'vedras-authored-world-v1',data:authoredWorld,
        savedAt:new Date().toISOString()});
       os.add(manifest);
       os.delete(pendingKey(scene));
       done(true);
      };
      size.onerror=abort;
     };
     marker.onerror=abort;
    });
   },
   async rollback(scene,token){
    // Scope-limited: never delete anything without the exact token that
    // this importer previously attached to its reserved new namespace.
    return transaction('readwrite',(os,done,abort)=>{
     const request=os.openCursor(range(scene));
     request.onsuccess=()=>{
      const cursor=request.result;
      if(!cursor){done(true);return;}
      if(cursor.value?.importToken===token)cursor.delete();
      cursor.continue();
     };
     request.onerror=abort;
    });
   },
   // Read-only primary-KEY scan. Large PNG tile records are not loaded.
   async pending(){
    return transaction('readonly',(os,done,abort)=>{
     const found=[],scan=os.openKeyCursor(IDBKeyRange.bound('v1-','v1-\uffff'));
     scan.onsuccess=()=>{
      const cursor=scan.result;
      if(!cursor){done(found);return;}
      const key=cursor.key;
      if(typeof key!=='string'||!key.endsWith('|import-pending')){
       cursor.continue();return;
      }
      const scene=key.slice(0,-'|import-pending'.length);
      if(!sceneValid(scene)){cursor.continue();return;}
      const req=os.get(key);
      req.onsuccess=()=>{
       const m=req.result;
       if(m?.sceneKey===scene&&m?.status==='import-pending'&&
        /^[0-9a-f]{32}$/.test(m.importToken||'')){
        const activity=Date.parse(m.lastActivityAt||m.startedAt||'');
        const age=Date.now()-activity;
        found.push({scene,token:m.importToken,startedAt:m.startedAt,
         lastActivityAt:m.lastActivityAt||m.startedAt,
         eligible:Number.isFinite(activity)&&age>=MIN_RECOVERY_AGE_MS});
        if(found.length>100){abort('Zu viele offene Importe');return;}
       }
       cursor.continue();
      };
      req.onerror=()=>abort('Importmarkierung konnte nicht gelesen werden');
     };
     scan.onerror=()=>abort('Importmarkierungen konnten nicht gesucht werden');
    });
   },
   // Never clean a published scene, an active import, or a row without
   // the exact reservation token. One atomic transaction, no partial delete.
   async discardPending(scene,token){
    if(!sceneValid(scene)||!/^[0-9a-f]{32}$/.test(token||''))
     fail('ungültige Bereinigungskennung');
    return transaction('readwrite',(os,done,abort)=>{
     const req=os.get(pendingKey(scene));
     req.onsuccess=()=>{
      const m=req.result;
      if(m?.key!==pendingKey(scene)||m.sceneKey!==scene||
       m.status!=='import-pending'||m.importToken!==token){
       abort('Kein passender unvollständiger Import');return;
      }
      const last=Date.parse(m.lastActivityAt||m.startedAt||'');
      if(!Number.isFinite(last)||Date.now()-last<MIN_RECOVERY_AGE_MS){
       abort('Import noch aktiv oder jünger als 30 Minuten');return;
      }
      const manifest=os.get(scene+'|manifest');
      manifest.onsuccess=()=>{
       if(manifest.result){abort('Fertige Karte darf nicht bereinigt werden');return;}
       let removed=0;
       const scan=os.openKeyCursor(range(scene));
       scan.onsuccess=()=>{
        const cursor=scan.result;
        if(!cursor){done({scene,removed});return;}
        if(++removed>MAX_RECOVERY_RECORDS){
         abort('Importumfang überschreitet sichere Bereinigungsgrenze');return;
        }
        const key=cursor.key;
        const tile=typeof key==='string'&&key.startsWith(prefix(scene))&&
         /^(near|mid|far)\|-?\d+,-?\d+$/.test(key.slice(prefix(scene).length));
        if(key!==pendingKey(scene)&&!tile){
         abort('Fremder Datensatz im Importbereich');return;
        }
        const rec=os.get(key);
        rec.onsuccess=()=>{
         if(rec.result?.key!==key||rec.result?.sceneKey!==scene||
          rec.result?.importToken!==token){
          abort('Importdatensatz nicht eindeutig zugeordnet');return;
         }
         os.delete(key);
         cursor.continue();
        };
        rec.onerror=()=>abort('Importdatensatz konnte nicht geprüft werden');
       };
       scan.onerror=()=>abort('Importbereich konnte nicht geprüft werden');
      };
      manifest.onerror=()=>abort('Fertigstellungsstatus konnte nicht geprüft werden');
     };
     req.onerror=()=>abort('Importmarkierung konnte nicht geprüft werden');
    });
   },
   async close(){
    if(opening){try{(await opening).close();}catch(_){}}
   }
  };
 }
 const finite=(value,min,max)=>
  typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;
 function mapManifest(source,scene){
  const cells=source.cells;
  if(!Array.isArray(cells)||cells.length===0)
   fail('ZIP enthält keine Hex-Geometrie für die eigenständige Ansicht');
  if(source.visibilityPolicy!=='local-test-all-authored; multiplayer requires server Fog')
   fail('unbekannte Sichtbarkeitsrichtlinie; nur lokales Kartenarchiv zulässig');
  const visibility=new Set(['visible','explored','hidden']);
  const parsed=cells.map(c=>{
   if(!c||!Number.isSafeInteger(c.q)||!Number.isSafeInteger(c.r)||
    !finite(c.x,-1e8,1e8)||!finite(c.y,-1e8,1e8)||
    !finite(c.radius,1,1e5)||(
     c.visibility!==undefined&&!visibility.has(c.visibility)))
    fail('ungültige Hex-Geometrie im Archiv');
   return {q:c.q,r:c.r,x:c.x,y:c.y,radius:c.radius,
    // These are LOCAL preview states, never multiplayer authorization.
    visibility:c.visibility||'visible'};
  });
  const p=source.initialPose;
  const pose=p&&finite(p.zoom,.02,5)&&finite(p.dpr,1,4)&&
   finite(p.projectY,.05,2)&&finite(p.panX,-1e8,1e8)&&
   finite(p.panY,-1e8,1e8)?
   {zoom:p.zoom,panX:p.panX,panY:p.panY,
    dpr:p.dpr,projectY:p.projectY}:
   {zoom:.81,panX:0,panY:0,dpr:1,projectY:.85};
  const clouds=source.clouds&&typeof source.clouds==='object'?
   {seed:String(source.clouds.seed||'vedras-local-preview').slice(0,100),
    assets:Array.isArray(source.clouds.assets)?
     source.clouds.assets.slice(0,4).map(x=>{
      const path=String(x?.path||'');
      if(!/^assets\/[a-zA-Z0-9_\/.-]+\.png$/.test(path)||
       path.includes('..')||path.length>280)
       fail('unzulässiger lokaler Wolkenbildpfad im Archiv');
      return {path};
     }):[]}:
   null;
  return {key:prefix(scene)+'manifest',schema:SCHEMA,sceneKey:scene,
   levels:[source.level],cells:parsed,pose,
   expectedTiles:source.expectedTiles,
   clouds,complete:source.complete,importedFromScene:source.scene,
   importedLocalPreviewOnly:true,savedAt:new Date().toISOString()};
 }
 function cropValid(c){
  if(c===null||c===undefined)return true;
  return typeof c==='object'&&['x','y','fullWidth','fullHeight'].every(k=>
   finite(c[k],k==='fullWidth'||k==='fullHeight'?1:0,100000));
 }
 async function restore(file,{inspector=window.VedrasStaticMapZipInspector,
  storage=null,confirmed=false,allowPartial=false,onProgress=()=>{},
  sceneFactory=createSceneId,tokenFactory=createToken}={}){
  if(confirmed!==true)fail('explizite Importbestätigung fehlt');
  if(!inspector||typeof inspector.inspect!=='function')
   fail('ZIP-Vorprüfung ist nicht installiert');
  const checked=await inspector.inspect(file),source=checked.manifest;
  if(!source.complete&&!allowPartial)
   fail('ZIP ist unvollständig; Teilkartenimport muss gesondert bestätigt werden');
  // Validate all lightweight metadata BEFORE starting an IndexedDB write.
  const draft=mapManifest(source,'v1-00000000');
  const authoredWorld=source.authoredWorld===undefined?null:
   window.VedrasAuthoredWorld?.clone(source.authoredWorld);
  if(source.authoredWorld!==undefined&&!authoredWorld)
   fail('ungültige Weltbeschreibung oder fehlender Weltdaten-Vertrag');
  if(!source.tiles.every(t=>t.layers.some(l=>l.layer==='ground'||l.layer==='terrain')&&
   t.layers.some(l=>l.layer==='scenery'||l.layer==='structures')))
   fail('mindestens eine fertige Ground- und Scenery-Schicht pro Kachel erforderlich');
  for(const tile of source.tiles){
   for(const l of tile.layers)
    if(!cropValid(l.crop))fail('fehlerhafter PNG-Bildzuschnitt');
  }
  const ownStore=!storage,db=storage||createIndexedStorage();
  let scene=null,token=null,reserved=false,published=false;
  try{
   for(let attempt=0;attempt<12;attempt++){
    const next=sceneFactory();
    if(!sceneValid(next)||next===source.scene)continue;
    const newToken=tokenFactory();
    if(typeof newToken!=='string'||!/^[0-9a-f]{32}$/.test(newToken))
     fail('ungültiger Sicherheits-Token');
    if(await db.reserve(next,newToken)){
     scene=next;token=newToken;reserved=true;break;
    }
   }
   if(!reserved)fail('keine freie neue Kartenkennung gefunden');
   // Pure blob slices: this code does not build a 600 MB Uint8Array.
   // CRC check reads one PNG in bounded chunks before each tile is committed.
   for(let i=0;i<source.tiles.length;i++){
    const item=source.tiles[i],layers=[];
    for(const l of item.layers){
     const png=await checked.verifyLayer(l.file);
     layers.push({layer:l.layer,pad:l.pad||0,crop:l.crop||null,png});
    }
    const record={key:prefix(scene)+source.level+'|'+item.id,
     sceneKey:scene,level:source.level,
     tile:{id:item.id,x:item.x,y:item.y,size:item.size},
     revision:typeof item.revision==='string'?item.revision:'zip-restored',
     layers};
    await db.addTile(scene,token,record);
    // Progress feedback must never cause a failed/half-committed import.
    try{onProgress({done:i+1,total:source.tiles.length,scene});}catch(_){}
   }
   const manifest={...draft,key:prefix(scene)+'manifest',sceneKey:scene};
   // Publish the verified semantic world AND geometry manifest in one
   // transaction; incomplete imports remain invisible to saved-map browsers.
   await db.publish(scene,token,manifest,source.tiles.length,authoredWorld);
   published=true;
   return {scene,sourceScene:source.scene,level:source.level,
    tiles:source.tiles.length,complete:source.complete,
    viewerPath:'frozen-map-game.html?scene='+scene+'&lod='+source.level};
  }catch(error){
   if(reserved&&!published){
    try{await db.rollback(scene,token);}
    catch(cleanup){
     throw Error('Kartenimport fehlgeschlagen; nicht veröffentlichte Restdaten '+
      'können verbleiben: '+String(error)+' / Rollback: '+String(cleanup));
    }
   }
   throw error;
  }finally{if(ownStore)await db.close();}
 }
 // Explicit recovery tools; never invoked by restore or on page startup.
 async function listPending({storage=null}={}){
  const own=!storage,db=storage||createIndexedStorage();
  try{return await db.pending();}
  finally{if(own)await db.close();}
 }
 async function discardPending(scene,token,{confirmed=false,storage=null}={}){
  if(confirmed!==true)fail('ausdrückliche Bereinigungsbestätigung fehlt');
  const own=!storage,db=storage||createIndexedStorage();
  try{return await db.discardPending(scene,token);}
  finally{if(own)await db.close();}
 }
 return {restore,createIndexedStorage,listPending,discardPending};
})();
/* Large-map baker phase 2: strict, resumable per-tile PNG job runner.
 * Inject the actual Asset-Labor renderer; this module does not approximate
 * terrain, fabricate successful tiles, or publish game atlases.
 *
 * Baked tiles belong to the exact source+renderer+catalog version. Store.add
 * MUST be atomic and must never replace an existing record.
 */
(function(root){
'use strict';
const SCHEMA='vedras-large-map-bake-receipt-v1';
const PIXEL_SCALE=Object.freeze({
 'native-near':{ground:2.5,scenery:1.9},
 'near-4x':{ground:4,scenery:2}
});
const SIZE=512,PROJECT_Y=.85;
const groundPad=3,sceneryPad=128,MAX_PNG=128*1024*1024;
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function profile(name){
 if(!Object.hasOwn(PIXEL_SCALE,name))throw Error('Nicht unterstützte Renderqualität.');
 return PIXEL_SCALE[name];
}
function dimensions(layer,mode){
 const scale=profile(mode)[layer],pad=layer==='ground'?groundPad:sceneryPad;
 const span=SIZE+2*pad;
 return {width:Math.round(span*scale),height:Math.round(span*PROJECT_Y*scale)};
}
function hexHash(bytes){
 return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
}
async function sha256(blob){
 const subtle=root.crypto?.subtle;
 if(!subtle)throw Error('SHA-256 über WebCrypto nicht verfügbar; Export verweigert.');
 return hexHash(await subtle.digest('SHA-256',await blob.arrayBuffer()));
}
async function pngInfo(blob){
 if(!(blob instanceof Blob)||blob.size<24||blob.size>MAX_PNG)
  throw Error('Unzulässiger oder fehlender PNG-Blob.');
 const head=new Uint8Array(await blob.slice(0,24).arrayBuffer());
 const signature=[137,80,78,71,13,10,26,10];
 if(signature.some((x,i)=>head[i]!==x))throw Error('Ungültige PNG-Signatur.');
 const v=new DataView(head.buffer,head.byteOffset,head.byteLength);
 if(v.getUint32(8)!==13||
    String.fromCharCode(...head.slice(12,16))!=='IHDR')
  throw Error('PNG-IHDR fehlt.');
 const width=v.getUint32(16),height=v.getUint32(20);
 if(width<1||height<1||width>8192||height>8192)
  throw Error('PNG-Dimensionen außerhalb des sicheren Renderbudgets.');
 return {width,height,size:blob.size};
}
function canvasToBlob(canvas){
 if(canvas?.convertToBlob)return canvas.convertToBlob({type:'image/png'});
 if(typeof canvas?.toBlob==='function')return new Promise((resolve,reject)=>{
  canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Canvas-PNG-Codierung fehlgeschlagen.')),'image/png');
 });
 throw Error('Kein vollständiger PNG-Blob oder Canvas vom Renderer geliefert.');
}
async function normalizeLayer(layer,mode){
 if(!plain(layer)||!['ground','scenery'].includes(layer.layer))
  throw Error('Ground oder Scenery fehlt.');
 const targetPad=layer.layer==='ground'?groundPad:sceneryPad;
 if(layer.pad!==targetPad)throw Error('Inkonsistentes Ground/Scenery-Padding.');
 const png=layer.png instanceof Blob?layer.png:await canvasToBlob(layer.image);
 const info=await pngInfo(png),expected=dimensions(layer.layer,mode);
 const crop=layer.crop??null;
 if(crop!==null){
  if(layer.layer!=='scenery'||!plain(crop)||
     !['x','y','fullWidth','fullHeight'].every(k=>Number.isSafeInteger(crop[k]))||
     crop.x<0||crop.y<0||crop.fullWidth!==expected.width||
     crop.fullHeight!==expected.height||
     crop.x+info.width>crop.fullWidth||
     crop.y+info.height>crop.fullHeight)
   throw Error('Ungültiger Scenery-Crop für die geforderte Renderstufe.');
 }else if(info.width!==expected.width||info.height!==expected.height)
  throw Error('PNG-Abmessungen passen nicht zur Renderstufe: '+layer.layer);
 return {layer:layer.layer,pad:targetPad,crop,
  png,width:info.width,height:info.height,
  byteSize:info.size};
}
async function checkPacket(raw,mode,{digest=sha256}={}){
 if(!plain(raw)||raw.complete!==true||raw.dirty===true||
    raw.preview===true||!Array.isArray(raw.layers)||
    raw.layers.length!==2||typeof raw.revision!=='string'||
    !raw.revision.length)
  throw Error('Renderer hat keine vollständige unveränderte Kachel geliefert.');
 const result=[];
 for(const layer of raw.layers)result.push(await normalizeLayer(layer,mode));
 if(result[0].layer!=='ground'||result[1].layer!=='scenery')
  throw Error('PNG-Reihenfolge muss Ground, Scenery sein.');
 for(const layer of result){
  const hash=await digest(layer.png);
  if(!/^[0-9a-f]{64}$/.test(hash))
   throw Error('Ungültiger SHA-256-Hash vom Bildprüfer.');
  layer.sha256=hash;
 }
 return result;
}
function keyFor(plan,rendererRevision,catalogRevision,tileId,mode){
 if(!plan?.source?.fingerprint||!rendererRevision||!catalogRevision||
    !/^[-]?\d+,[-]?\d+$/.test(tileId))throw Error('Kachelidentität unvollständig.');
 return 'bake-v1|'+plan.source.fingerprint+'|'+rendererRevision+
  '|'+catalogRevision+'|'+mode+'|'+tileId;
}
async function validateReceipt(receipt,expected,{digest=sha256}={}){
 if(!plain(receipt)||receipt.schema!==SCHEMA||
    receipt.key!==expected.key||
    receipt.sourceFingerprint!==expected.sourceFingerprint||
    receipt.rendererRevision!==expected.rendererRevision||
    receipt.catalogRevision!==expected.catalogRevision||
    receipt.tileId!==expected.tileId||
    receipt.mode!==expected.mode)
  throw Error('Gespeicherte Kachel hat einen fremden oder beschädigten Herkunftsvertrag.');
 const layers=await checkPacket({
  complete:true,revision:receipt.revision,layers:receipt.layers
 },receipt.mode,{digest});
 if(layers.some((l,i)=>l.sha256!==receipt.layers[i].sha256))
  throw Error('Gespeicherter PNG-Inhalt weicht vom Inhalts-Hash ab.');
 return true;
}
function create({world,plan,planner=root.VedrasLargeMapBakePlan,
 sourceAdapter=root.VedrasLargeMapBakeSource,renderer,
 store,rendererRevision,catalogRevision,mode='near-4x',
 digest=sha256}={}){
 profile(mode);
 if(typeof renderer?.renderTile!=='function'||
    typeof store?.get!=='function'||typeof store?.add!=='function'||
    !/^[A-Za-z0-9_.:-]{1,120}$/.test(rendererRevision||'')||
    !/^[A-Za-z0-9_.:-]{1,120}$/.test(catalogRevision||''))
  throw Error('Renderer, atomarer Speicher oder Asset-/Rendererrevision fehlt.');
 const source=sourceAdapter?.create(world,plan,{planner});
 if(!source)throw Error('Kachelquellen-Adapter fehlt.');
 function expected(tileId){
  return {key:keyFor(plan,rendererRevision,catalogRevision,tileId,mode),
   sourceFingerprint:plan.source.fingerprint,rendererRevision,
   catalogRevision,tileId,mode};
 }
 let running=false;
 async function run({signal,onProgress=()=>{},maxTiles=Infinity}={}){
  if(running)throw Error('Dieser Renderauftrag läuft bereits.');
  if(maxTiles!==Infinity&&(!Number.isSafeInteger(maxTiles)||maxTiles<1))
   throw Error('Maximalzahl zu rendernder Kacheln ist ungültig.');
  running=true;
  let rendered=0,resumed=0,examined=0,blocked=null;
  const total=plan.tileCount,progress=()=>onProgress({
   total,examined,rendered,resumed,remaining:total-examined,
   status:blocked?'blocked':signal?.aborted?'cancelled':
    examined===total?'all-tiles-verified':'building',
   readyForViewer:false,
  });
  try{
   for(const tile of plan.tiles){
    if(signal?.aborted||rendered>=maxTiles)break;
    const id=expected(tile.id);
    try{
     // Resume only from a fully verified matching PNG pair; NEVER skip
     // on a plan-only entry, an incomplete image or a foreign revision.
     const old=await store.get(id.key);
     if(old){
      await validateReceipt(old,id,{digest});
      resumed++;examined++;progress();continue;
     }
     const context=source.contextFor(tile.id);
     const packet=await renderer.renderTile(context,{mode,signal});
     if(signal?.aborted)break;
     const layers=await checkPacket(packet,mode,{digest});
     const receipt={schema:SCHEMA,...id,revision:packet.revision,
      createdAt:new Date().toISOString(),tile:{...tile},layers};
     // Must atomically refuse replacement; no update/put fallback.
     await store.add(receipt);
     rendered++;examined++;progress();
    }catch(error){
     blocked={tileId:tile.id,error:String(error?.message||error)};
     progress();break;
    }
   }
   return {total,examined,rendered,resumed,
    missing:total-examined,blocked,
    status:blocked?'blocked':signal?.aborted?'cancelled':
     examined===total?'all-tiles-verified':'paused',
    // Only verified receipts: archive publication/semantic binding has NOT
    // been implemented. Do not equate success here with a finished map.
    readyForViewer:false};
  }finally{running=false;}
 }
 return {run,expected,tileCount:plan.tileCount,mode,
  sourceFingerprint:plan.source.fingerprint};
}
const api={SCHEMA,dimensions,pngInfo,sha256,checkPacket,keyFor,
 validateReceipt,create};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.VedrasLargeMapBakeRunner=api;
})(typeof window!=='undefined'?window:globalThis);

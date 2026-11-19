/* Read-only inspection of Vedras' existing STORE-only ZIP atlas.
 * No IndexedDB writes, no worker, no terrain bake, no archive extraction.
 * Large PNG bodies are not read during inspection; use verifyLayer() before
 * passing a layer Blob to a future explicit, transactional importer.
 */
'use strict';
window.VedrasStaticMapZipInspector=(()=>{
 const MB=1024*1024;
 const LIMITS=Object.freeze({
  archive:0xffffffff,central:16*MB,manifest:32*MB,
  entries:60000,tiles:30000,cells:200000,layer:512*MB
 });
 const error=message=>{throw Error('Karten-ZIP: '+message)};
 const requireValue=(condition,message)=>{if(!condition)error(message)};
 const decode=new TextDecoder('utf-8',{fatal:true});
 const table=Array.from({length:256},(_,i)=>{
  let c=i;for(let j=0;j<8;j++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;
  return c>>>0;
 });
 const crcStart=()=>0xffffffff;
 const crcAdd=(c,bytes)=>{
  for(const byte of bytes)c=table[(c^byte)&255]^(c>>>8);
  return c>>>0;
 };
 const crcEnd=c=>(c^0xffffffff)>>>0;
 const reader=bytes=>new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const u16=(view,i)=>view.getUint16(i,true);
 const u32=(view,i)=>view.getUint32(i,true);
 async function sliceBytes(file,start,count){
  requireValue(Number.isSafeInteger(start)&&Number.isSafeInteger(count)&&
   start>=0&&count>=0&&start+count<=file.size,'ungültiger ZIP-Dateibereich');
  return new Uint8Array(await file.slice(start,start+count).arrayBuffer());
 }
 function pathAllowed(name){
  return name==='manifest.json'||
   /^tiles\/(?:near|mid|far)\/-?\d+_-?\d+\.\d+\.png$/.test(name);
 }
 async function endRecord(file){
  requireValue(file&&typeof file.slice==='function'&&
   Number.isSafeInteger(file.size),'keine gültige ZIP-Datei');
  requireValue(file.size>=22&&file.size<=LIMITS.archive,'Dateigröße außerhalb des ZIP32-Formats');
  const count=Math.min(65557,file.size),offset=file.size-count;
  const tail=await sliceBytes(file,offset,count),v=reader(tail);
  for(let i=count-22;i>=0;i--){
   if(u32(v,i)!==0x06054b50||i+22+u16(v,i+20)!==count)continue;
   requireValue(u16(v,i+4)===0&&u16(v,i+6)===0&&
    u16(v,i+8)===u16(v,i+10),'mehrteilige ZIPs nicht unterstützt');
   const n=u16(v,i+10),size=u32(v,i+12),start=u32(v,i+16);
   requireValue(n>0&&n<=LIMITS.entries,'zu viele ZIP-Einträge');
   requireValue(size>0&&size<=LIMITS.central&&start+size<=offset+i,
    'ZIP-Verzeichnis ungültig oder zu groß');
   return {count:n,centralStart:start,centralSize:size,endOffset:offset+i};
  }
  error('kein vollständiges ZIP-Endverzeichnis gefunden');
 }
 async function readCentral(file,eocd){
  const raw=await sliceBytes(file,eocd.centralStart,eocd.centralSize),v=reader(raw);
  const entries=new Map();let at=0;
  for(let i=0;i<eocd.count;i++){
   requireValue(at+46<=raw.length&&u32(v,at)===0x02014b50,
    'ZIP-Zentralverzeichnis beschädigt');
   const flags=u16(v,at+8),method=u16(v,at+10),crc=u32(v,at+16);
   const compressed=u32(v,at+20),uncompressed=u32(v,at+24);
   const nameBytes=u16(v,at+28),extra=u16(v,at+30),
    comment=u16(v,at+32),disk=u16(v,at+34);
   const local=u32(v,at+42),end=at+46+nameBytes+extra+comment;
   requireValue(end<=raw.length&&nameBytes>0,'ZIP-Eintrag ohne gültigen Namen');
   requireValue(flags===0&&method===0&&disk===0,
    'verschlüsselte oder komprimierte ZIPs nicht unterstützt');
   requireValue(compressed===uncompressed&&
    compressed<=LIMITS.layer,'ZIP-Eintrag zu groß oder komprimiert');
   const name=decode.decode(raw.subarray(at+46,at+46+nameBytes));
   requireValue(pathAllowed(name)&&!entries.has(name),
    'unzulässiger oder doppelter ZIP-Pfad: '+name);
   requireValue(local+30+nameBytes+compressed<=eocd.centralStart,
    'ZIP-Eintrag reicht in das Verzeichnis');
   entries.set(name,{name,size:compressed,crc,local,nameBytes});
   at=end;
  }
  requireValue(at===raw.length,'zusätzliche Bytes im ZIP-Verzeichnis');
  return entries;
 }
 async function entryBlob(file,eocd,entry){
  const head=await sliceBytes(file,entry.local,30+entry.nameBytes),v=reader(head);
  requireValue(u32(v,0)===0x04034b50,'lokaler ZIP-Kopf fehlt');
  requireValue(u16(v,6)===0&&u16(v,8)===0&&
   u32(v,14)===entry.crc&&u32(v,18)===entry.size&&
   u32(v,22)===entry.size&&u16(v,26)===entry.nameBytes,
   'ZIP-Eintrag stimmt nicht mit dem Verzeichnis überein');
  requireValue(decode.decode(head.subarray(30))===entry.name,
   'ZIP-Pfad im lokalen Kopf stimmt nicht überein');
  const start=entry.local+30+entry.nameBytes+u16(v,28);
  requireValue(start+entry.size<=eocd.centralStart,'ZIP-Datenbereich überschritten');
  return file.slice(start,start+entry.size);
 }
 // Parse PNG chunks with bounded slices. A correct ZIP CRC and the
 // eight signature bytes alone do NOT imply that the PNG will decode.
 // This catches broken internal CRCs, malformed chunk boundaries,
 // oversized image dimensions and incomplete/trailing file content.
 async function checkPng(blob,name){
  const signature=[137,80,78,71,13,10,26,10];
  requireValue(blob.size>=45,'PNG-Schicht zu kurz: '+name);
  const sig=await sliceBytes(blob,0,8);
  requireValue(signature.every((n,i)=>sig[i]===n),
   'keine PNG-Signatur: '+name);
  let offset=8,chunks=0,sawHeader=false,sawImage=false,sawEnd=false;
  while(offset<blob.size){
   requireValue(++chunks<=100000&&offset+12<=blob.size,
    'PNG-Chunk-Index überschreitet Grenzen: '+name);
   const head=await sliceBytes(blob,offset,8),v=reader(head);
   const size=v.getUint32(0,false);
   const kind=String.fromCharCode(...head.subarray(4));
   requireValue(/^[A-Za-z]{4}$/.test(kind)&&
    offset+size+12<=blob.size,'PNG-Chunk-Länge oder -Typ ungültig: '+name);
   if(!sawHeader){
    requireValue(kind==='IHDR'&&size===13,'PNG muss mit IHDR beginnen: '+name);
    const ihdr=reader(await sliceBytes(blob,offset+8,13));
    const width=ihdr.getUint32(0,false),height=ihdr.getUint32(4,false);
    const depth=ihdr.getUint8(8),color=ihdr.getUint8(9),
     compression=ihdr.getUint8(10),filter=ihdr.getUint8(11),
     interlace=ihdr.getUint8(12);
    const depths={0:[1,2,4,8,16],2:[8,16],3:[1,2,4,8],
     4:[8,16],6:[8,16]};
    requireValue(width>0&&height>0&&width<=10000&&height<=10000&&
     width*height<=48000000&&depths[color]?.includes(depth)&&
     compression===0&&filter===0&&(interlace===0||interlace===1),
     'PNG-IHDR-Bildparameter unzulässig: '+name);
    sawHeader=true;
   }else{
    requireValue(kind!=='IHDR','doppeltes PNG-IHDR: '+name);
   }
   if(kind==='IDAT')sawImage=true;
   if(kind==='IEND'){
    requireValue(sawImage&&size===0&&offset+12===blob.size,
     'PNG-IEND fehlt oder hat nachlaufende Daten: '+name);
    sawEnd=true;
   }
   if(kind[0]===kind[0].toUpperCase()&&
    !['IHDR','PLTE','IDAT','IEND'].includes(kind))
    error('nicht unterstützter kritischer PNG-Chunk: '+kind);
   let checksum=crcAdd(crcStart(),head.subarray(4,8));
   for(let p=offset+8;p<offset+8+size;p+=MB){
    const bytes=await sliceBytes(blob,p,Math.min(MB,offset+8+size-p));
    checksum=crcAdd(checksum,bytes);
   }
   const expected=reader(await sliceBytes(blob,offset+8+size,4))
    .getUint32(0,false);
   requireValue(crcEnd(checksum)===expected,
    'PNG-Chunk-Prüfsumme ungültig: '+name+' / '+kind);
   offset+=size+12;
   if(kind==='IEND')break;
  }
  requireValue(sawHeader&&sawImage&&sawEnd&&offset===blob.size,
   'PNG-Bilddaten unvollständig: '+name);
 }
 async function verifiedBlob(file,eocd,entry,{maxBytes=LIMITS.layer}={}){
  requireValue(entry.size<=maxBytes,'ZIP-Eintrag überschreitet Leselimit');
  const blob=await entryBlob(file,eocd,entry);
  let crc=crcStart();
  for(let i=0;i<blob.size;i+=MB){
   const bytes=new Uint8Array(await blob.slice(i,Math.min(blob.size,i+MB)).arrayBuffer());
   crc=crcAdd(crc,bytes);
  }
  requireValue(crcEnd(crc)===entry.crc,'CRC-Fehler: '+entry.name);
  // Enforce PNG chunk structure and internal CRC only on an explicitly
  // requested layer, not while simply previewing a 600 MB ZIP manifest.
  if(entry.name!=='manifest.json')await checkPng(blob,entry.name);
  return blob;
 }
 function manifestValid(m,entries){
  requireValue(m&&typeof m==='object'&&m.schemaVersion===1&&
   m.format==='vedras-static-game-map'&&
   /^v1-[0-9a-f]{8}$/.test(m.scene||'')&&
   ['near','mid','far'].includes(m.level)&&
   m.worldTileSize===512,'unbekanntes Kartenmanifest');
  requireValue(Array.isArray(m.tiles)&&m.tiles.length>0&&
   m.tiles.length<=LIMITS.tiles&&m.tiles.length===m.exportedTiles,
   'Kachelanzahl im Manifest stimmt nicht');
  requireValue(m.expectedTiles===null||
   (Number.isSafeInteger(m.expectedTiles)&&m.expectedTiles>=m.exportedTiles),
   'Erwartete Kachelanzahl ungültig');
  requireValue(typeof m.complete==='boolean'&&
   (!m.complete||(m.expectedTiles!==null&&m.expectedTiles===m.exportedTiles)),
   'Unvollständiges ZIP ist als vollständig markiert');
  requireValue(m.groundSeamPolicy===undefined||m.groundSeamPolicy===null||
   m.groundSeamPolicy==='exclusive',
   'unbekannte Bodennaht-Richtlinie im Archiv');
  requireValue(Array.isArray(m.cells)&&m.cells.length<=LIMITS.cells,
   'Hex-Geometrie fehlt oder ist zu groß');
  // Optional semantic data extends schema v1 without invalidating earlier
  // image-only ZIPs. Do not trust unverified world coordinates on restore.
  if(m.authoredWorld!==undefined){
   const contract=window.VedrasAuthoredWorld;
   requireValue(contract&&contract.validate(m.authoredWorld),
    'ungültige editierbare Weltbeschreibung');
   requireValue(m.authoredWorld.worldCells.length===m.cells.length,
    'Hexwelt und Atlas-Geometrie haben unterschiedliche Zellzahlen');
   const expected=new Set(m.cells.map(c=>c.q+','+c.r));
   requireValue(expected.size===m.cells.length&&
    m.authoredWorld.worldCells.every(c=>expected.has(c.q+','+c.r)),
    'Hexwelt und Atlas-Geometrie stimmen nicht überein');
  }
  const used=new Set(['manifest.json']),ids=new Set();
  for(const tile of m.tiles){
   requireValue(tile&&/^-?\d+,-?\d+$/.test(tile.id||'')&&
    Number.isSafeInteger(tile.x)&&Number.isSafeInteger(tile.y)&&
    tile.size===512&&Array.isArray(tile.layers)&&tile.layers.length>0&&
    !ids.has(tile.id),'Kacheleintrag ungültig oder doppelt');
   ids.add(tile.id);
   for(const layer of tile.layers){
    const name='tiles/'+m.level+'/'+tile.id.replace(',','_')+'.';
    requireValue(['ground','terrain','scenery','structures'].includes(layer.layer)&&
     typeof layer.file==='string'&&layer.file.startsWith(name)&&
     /^\d+\.png$/.test(layer.file.slice(name.length))&&
     Number.isSafeInteger(layer.byteSize)&&layer.byteSize>0&&
     Number.isFinite(layer.pad)&&layer.pad>=0&&
     !used.has(layer.file),'ungültige oder doppelte PNG-Schicht');
    const entry=entries.get(layer.file);
    requireValue(entry&&entry.size===layer.byteSize,
     'Schicht fehlt oder Größe weicht ab: '+layer.file);
    used.add(layer.file);
   }
  }
  requireValue(used.size===entries.size,'ZIP enthält nicht zugeordnete Dateien');
 }
 async function inspect(file){
  const end=await endRecord(file),entries=await readCentral(file,end);
  const entry=entries.get('manifest.json');
  requireValue(entry&&entry.size>0&&entry.size<=LIMITS.manifest,
   'Kartenmanifest fehlt oder ist zu groß');
  const data=await verifiedBlob(file,end,entry,{maxBytes:LIMITS.manifest});
  let manifest;
  try{manifest=JSON.parse(decode.decode(new Uint8Array(await data.arrayBuffer())));}
  catch(_){error('Kartenmanifest enthält kein gültiges UTF-8-JSON');}
  manifestValid(manifest,entries);
  const summary={scene:manifest.scene,level:manifest.level,
   complete:manifest.complete,expectedTiles:manifest.expectedTiles,
   exportedTiles:manifest.exportedTiles,archiveBytes:file.size,
   layerFiles:entries.size-1};
  return {
   summary,manifest,
   // The inspected archive remains unchanged. No PNG body is loaded until
   // the caller explicitly requests and CRC-verifies an individual layer.
   verifyLayer:async name=>{
    requireValue(name!=='manifest.json'&&entries.has(name),'PNG-Schicht nicht gefunden');
    return verifiedBlob(file,end,entries.get(name));
   }
  };
 }
 return {inspect,LIMITS};
})();
/* Step 17 – portable baked-game-map ZIP, STORE method (PNGs are already
 * compressed). Standard ZIP with CRC32 and a deterministic JSON manifest.
 * This is an explicit export action, never invoked by camera frames.
 * A partial atlas is marked as partial: no fabricated completed tiles.
 */
'use strict';
window.VedrasFrozenMapPackage=(()=>{
 const utf8=str=>new TextEncoder().encode(str);
 const write=(view,off,value,bytes)=>{
  for(let i=0;i<bytes;i++)view.setUint8(off+i,(value>>>8*i)&255);
 };
 const crcTable=Array.from({length:256},(_,i)=>{
  let v=i;for(let b=0;b<8;b++)v=(v&1)?0xedb88320^(v>>>1):v>>>1;
  return v>>>0;
 });
 function crc32(data){
  let value=0xffffffff;
  for(const byte of data)value=crcTable[(value^byte)&255]^(value>>>8);
  return (value^0xffffffff)>>>0;
 }
 async function zipEntries(entries){
  const parts=[],central=[];let offset=0,total=0;
  const names=new Set();
  for(const entry of entries){
   const name=entry.name,bytes=utf8(name);
   if(!name||names.has(name)||!/^[-\w/.]+$/.test(name)||
      name.startsWith('/')||name.includes('..')||bytes.length>65535)
    throw Error('Unzulässiger oder doppelter Archivpfad: '+name);
   names.add(name);
   const blob=entry.blob instanceof Blob?entry.blob:new Blob([entry.blob]);
   const size=blob.size;
   if(size>0xffffffff||offset+size+bytes.length+200>0xffffffff)
    throw Error('ZIP zu groß für das kompakte Kartenformat');
   const data=new Uint8Array(await blob.arrayBuffer());
   const crc=crc32(data);
   const header=new Uint8Array(30+bytes.length);
   const h=new DataView(header.buffer);
   write(h,0,0x04034b50,4);write(h,4,20,2);
   write(h,6,0,2);write(h,8,0,2); // STORE, no second compression
   write(h,14,crc,4);write(h,18,size,4);write(h,22,size,4);
   write(h,26,bytes.length,2);header.set(bytes,30);
   parts.push(header,blob);
   const entryCenter=new Uint8Array(46+bytes.length),
    c=new DataView(entryCenter.buffer);
   write(c,0,0x02014b50,4);write(c,4,20,2);write(c,6,20,2);
   write(c,8,0,2);write(c,10,0,2);
   write(c,16,crc,4);write(c,20,size,4);write(c,24,size,4);
   write(c,28,bytes.length,2);write(c,42,offset,4);
   entryCenter.set(bytes,46);
   central.push(entryCenter);
   offset+=header.length+size;total++;
  }
  const centralLength=central.reduce((n,c)=>n+c.length,0);
  const end=new Uint8Array(22),e=new DataView(end.buffer);
  write(e,0,0x06054b50,4);write(e,8,total,2);write(e,10,total,2);
  write(e,12,centralLength,4);write(e,16,offset,4);
  return new Blob([...parts,...central,end],{type:'application/zip'});
 }
 async function exportMap(storage,scene,level,{totalExpected=null,onProgress=()=>{}}={}){
  if(!/^v1-[a-f0-9]{8}$/.test(scene)||!['far','mid','near'].includes(level))
   throw Error('Spielkartenkennung/Detailstufe ungültig');
  const keys=(await storage.keys(scene+'|'+level+'|')).sort();
  if(!keys.length)throw Error('Keine eingefrorenen Bildkacheln für dieses LOD');
  const items=[],entries=[],paths=new Set();
  for(const [i,key] of keys.entries()){
   const packet=await storage.get(key);
   if(!packet||packet.sceneKey!==scene||packet.level!==level||
      packet.key!==key||!/^[-\d]+,[-\d]+$/.test(packet.tile?.id||'')||
      !Array.isArray(packet.layers))throw Error('Fehlerhaftes Kartenpaket '+key);
   const base='tiles/'+level+'/'+packet.tile.id.replace(',','_');
   const layers=[];
   for(let n=0;n<packet.layers.length;n++){
    const layer=packet.layers[n],file=base+'.'+n+'.png';
    if(!['ground','terrain','scenery','structures'].includes(layer.layer)||
       !(layer.png instanceof Blob)||paths.has(file))throw Error('PNG-Schicht fehlt');
    paths.add(file);entries.push({name:file,blob:layer.png});
    layers.push({layer:layer.layer,file,pad:layer.pad||0,crop:layer.crop||null,
     byteSize:layer.png.size});
   }
   items.push({id:packet.tile.id,x:packet.tile.x,y:packet.tile.y,
    size:packet.tile.size,revision:packet.revision,layers});
   onProgress({done:i+1,total:keys.length});
  }
  // Portable atlas must include static Hex topology as well as raster
  // filenames. A future standalone client cannot reconstruct Fog geometry
  // from 512-unit bitmap rectangles alone.
  const authored=await storage.get(scene+'|manifest');
  const manifest={schemaVersion:1,format:'vedras-static-game-map',
   scene,level,worldTileSize:512,projectY:.85,
   complete:totalExpected!=null&&keys.length===totalExpected,
   expectedTiles:totalExpected,exportedTiles:keys.length,
   note:'Prebaked static terrain/scenery only. Units/Fog/UI remain runtime layers.',
   cells:Array.isArray(authored?.cells)?authored.cells:[],
   initialPose:authored?.pose||null,
   visibilityPolicy:'local-test-all-authored; multiplayer requires server Fog',
   tiles:items};
  const encoded=JSON.stringify(manifest,null,2);
  const blob=await zipEntries([{name:'manifest.json',blob:new Blob([encoded],
   {type:'application/json'})},...entries]);
  return {blob,manifest};
 }
 return {crc32,zipEntries,exportMap};
})();
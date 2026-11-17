'use strict';
// Synthetic ZIPs only: verifies the legacy exporter and the NEW read-only
// verifier without opening/writing any IndexedDB or private user's atlas.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const window={};
vm.runInNewContext(fs.readFileSync(path.join(root,'frozen-map-package.js'),'utf8'),
 {window,Blob,TextEncoder,TextDecoder,Uint8Array,DataView});
vm.runInNewContext(fs.readFileSync(path.join(root,'static-map-zip-inspector.js'),'utf8'),
 {window,Blob,TextEncoder,TextDecoder,Uint8Array,DataView});
const writer=window.VedrasFrozenMapPackage;
const reader=window.VedrasStaticMapZipInspector;
const PNG=new Blob([Buffer.from(
 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+XcJkAAAAASUVORK5CYII=','base64')],
 {type:'image/png'});
const SCENE='v1-1234abcd',LAYER='tiles/near/0_0.0.png';
const entry=(blob=PNG)=>({name:LAYER,blob});
function manifest({complete=true,expectedTiles=1,layers=null}={}){
 return {
  schemaVersion:1,format:'vedras-static-game-map',
  scene:SCENE,level:'near',worldTileSize:512,projectY:.85,
  complete,expectedTiles,exportedTiles:1,cells:[],
  initialPose:{zoom:.8,panX:0,panY:0,dpr:2,projectY:.85},
  clouds:null,visibilityPolicy:'local-test-all-authored; multiplayer requires server Fog',
  tiles:[{id:'0,0',x:0,y:0,size:512,revision:'static',
   layers:layers||[{layer:'ground',file:LAYER,pad:0,crop:null,
    byteSize:PNG.size}]}]
 };
}
async function archive(m=manifest(),images=[entry()]){
 return writer.zipEntries([{name:'manifest.json',blob:new Blob([
  JSON.stringify(m)],{type:'application/json'})},...images]);
}
function mutateZip(blob,change){
 return blob.arrayBuffer().then(raw=>{
  const a=new Uint8Array(raw),v=new DataView(a.buffer);
  change(a,v);return new Blob([a],{type:'application/zip'});
 });
}
function centralOffset(view){return view.getUint32(view.byteLength-22+16,true);}
test('existing ZIP exporter roundtrips in read-only inspector; PNG CRC can be verified',async()=>{
 const zip=await archive();
 const result=await reader.inspect(zip);
 assert.equal(result.summary.scene,SCENE);
 assert.equal(result.summary.level,'near');
 assert.equal(result.summary.complete,true);
 assert.equal(result.summary.exportedTiles,1);
 assert.equal(result.summary.layerFiles,1);
 assert.equal(result.summary.archiveBytes,zip.size);
 assert.equal(result.manifest.tiles[0].layers[0].file,LAYER);
 const layer=await result.verifyLayer(LAYER);
 assert.equal(layer.size,PNG.size);
 assert.deepEqual([...new Uint8Array((await layer.arrayBuffer()).slice(0,8))],
  [137,80,78,71,13,10,26,10]);
 await assert.rejects(result.verifyLayer('tiles/near/5_5.0.png'),/PNG-Schicht nicht gefunden/);
});
test('partial but honest manifest is inspected without silently marking complete',async()=>{
 const result=await reader.inspect(await archive(manifest({
  complete:false,expectedTiles:3
 })));
 assert.equal(result.summary.complete,false);
 assert.equal(result.summary.exportedTiles,1);
 assert.equal(result.summary.expectedTiles,3);
});
test('impossible complete count is rejected before exposing an import result',async()=>{
 const zip=await archive(manifest({complete:true,expectedTiles:3}));
 await assert.rejects(reader.inspect(zip),/Unvollständiges ZIP/);
});
test('non-referenced, duplicate and invalid file paths are rejected',async()=>{
 await assert.rejects(reader.inspect(await archive(manifest(),[
  entry(),{name:'tiles/near/1_0.0.png',blob:PNG}
 ])),/nicht zugeordnete Dateien/);
 const bad=await mutateZip(await archive(),(bytes,v)=>{
  const at=centralOffset(v); // first central entry is "manifest.json"
  bytes[at+46]='/'.charCodeAt(0);
 });
 await assert.rejects(reader.inspect(bad),/unzulässiger oder doppelter ZIP-Pfad/);
});
test('ZIP deflate or unsupported encryption flags are rejected',async()=>{
 const deflated=await mutateZip(await archive(),(_bytes,v)=>{
  v.setUint16(centralOffset(v)+10,8,true);
 });
 await assert.rejects(reader.inspect(deflated),/verschlüsselte oder komprimierte ZIPs/);
 const encrypted=await mutateZip(await archive(),(_bytes,v)=>{
  v.setUint16(centralOffset(v)+8,1,true);
 });
 await assert.rejects(reader.inspect(encrypted),/verschlüsselte oder komprimierte ZIPs/);
});
test('CRC corruption of a PNG is detected when that layer is explicitly inspected',async()=>{
 const zip=await archive();
 const result=await reader.inspect(zip);
 const bad=await mutateZip(zip,(bytes)=>{
  // The second local record begins after manifest's local record and bytes.
  const marker=[137,80,78,71,13,10,26,10];
  let index=-1;
  for(let i=0;i<=bytes.length-marker.length;i++)
   if(marker.every((n,j)=>bytes[i+j]===n)){index=i;break;}
  assert.ok(index>0);
  bytes[index+10]^=1;
 });
 const scan=await reader.inspect(bad); // central metadata still valid
 await assert.rejects(scan.verifyLayer(LAYER),/CRC-Fehler/);
});
test('a valid ZIP entry with a fake PNG body still fails PNG signature gate',async()=>{
 const fake=new Blob([Buffer.from('definitely no PNG here')]);
 const zip=await archive(manifest({layers:[{
  layer:'ground',file:LAYER,pad:0,crop:null,byteSize:fake.size
 }]}),[entry(fake)]);
 const result=await reader.inspect(zip);
 await assert.rejects(result.verifyLayer(LAYER),/keine PNG-Signatur/);
});
test('inspection never reads large PNG bodies into JS memory',async()=>{
 const payload=new Blob([PNG,Buffer.alloc(2*1024*1024)]);
 const zip=await archive(manifest({layers:[{
  layer:'ground',file:LAYER,pad:0,crop:null,byteSize:payload.size
 }]}),[entry(payload)]);
 const stats={bytes:0,reads:0};
 class SpyFile {
  constructor(inner){this.inner=inner;this.size=inner.size;}
  slice(from,to){return new SpyFile(this.inner.slice(from,to));}
  async arrayBuffer(){stats.reads++;stats.bytes+=this.size;
   return this.inner.arrayBuffer();}
 }
 const result=await reader.inspect(new SpyFile(zip));
 assert.equal(result.summary.layerFiles,1);
 assert.ok(stats.bytes<100*1024,
  'Metadata scan must not decode or read 2 MB PNG blob into memory');
 assert.ok(stats.reads>=3,'ZIP tail, central directory, manifest must be read');
});
test('the inspector contains no storage writes and compiles as a standalone script',()=>{
 const source=fs.readFileSync(path.join(root,'static-map-zip-inspector.js'),'utf8');
 assert.doesNotMatch(source,/\bindexedDB\b.*\.(?:put|add|delete|clear)\(/);
 assert.doesNotMatch(source,/\bdeleteDatabase\(|bakeWorldTile\(/);
 assert.doesNotThrow(()=>new Function(source));
});
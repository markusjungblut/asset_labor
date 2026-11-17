'use strict';
// Synthetic exporter -> ZIP inspector -> safe staged restore.
// The test storage is isolated and never opens a browser IndexedDB.
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const window={};
const context={window,Blob,TextEncoder,TextDecoder,Uint8Array,DataView};
for(const f of ['frozen-map-package.js','static-map-zip-inspector.js',
 'static-map-zip-importer.js'])
 vm.runInNewContext(fs.readFileSync(path.join(root,f),'utf8'),context);
const writer=window.VedrasFrozenMapPackage,
 importer=window.VedrasStaticMapZipImporter,
 inspector=window.VedrasStaticMapZipInspector;
function validPngBytes(){
 const zlib=require('node:zlib'),width=8,height=8;
 const data=Buffer.alloc((width*4+1)*height);
 for(let y=0;y<height;y++){
  const row=y*(width*4+1);data[row]=0;
  for(let x=0;x<width;x++){
   const at=row+1+x*4;
   data[at]=44;data[at+1]=90;data[at+2]=60;data[at+3]=255;
  }
 }
 const chunk=(type,bytes)=>{
  const code=Buffer.from(type),length=Buffer.alloc(4),crc=Buffer.alloc(4);
  length.writeUInt32BE(bytes.length);
  crc.writeUInt32BE(writer.crc32(Buffer.concat([code,bytes])));
  return Buffer.concat([length,code,bytes,crc]);
 };
 const ihdr=Buffer.alloc(13);
 ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);
 ihdr[8]=8;ihdr[9]=6;
 return Buffer.concat([
  Buffer.from([137,80,78,71,13,10,26,10]),
  chunk('IHDR',ihdr),
  chunk('IDAT',zlib.deflateSync(data)),
  chunk('IEND',Buffer.alloc(0))
 ]);
}
const png=new Blob([validPngBytes()],{type:'image/png'});
const SOURCE='v1-abc12345',TARGET='v1-00000001',OTHER='v1-00000002';
function payload({complete=true,expectedTiles=2,brokenLayer=false,
 invalidCells=false,source=SOURCE,visibility='visible'}={}){
 const tiles=[0,1].map(ix=>({
  id:ix+',0',x:ix*512,y:0,size:512,revision:'sample-r1',
  layers:[
   {layer:'ground',file:'tiles/near/'+ix+'_0.0.png',pad:3,crop:null,byteSize:png.size},
   {layer:'scenery',file:'tiles/near/'+ix+'_0.1.png',pad:128,crop:null,byteSize:png.size}
  ]
 }));
 const manifest={
  schemaVersion:1,format:'vedras-static-game-map',
  scene:source,level:'near',worldTileSize:512,projectY:.85,
  complete,expectedTiles,exportedTiles:2,
  visibilityPolicy:'local-test-all-authored; multiplayer requires server Fog',
  cells:invalidCells?[{q:0,r:0,x:0,y:0,radius:-1}]:[
   {q:0,r:0,x:0,y:0,radius:164,visibility},
   {q:1,r:0,x:256,y:0,radius:164,visibility:'hidden'}
  ],
  initialPose:{zoom:.8,dpr:2,panX:0,panY:0,projectY:.85},
  clouds:null,tiles
 };
 const entries=[{name:'manifest.json',blob:new Blob([JSON.stringify(manifest)])}];
 for(const tile of tiles)for(const layer of tile.layers){
  const fail=brokenLayer&&layer.file.endsWith('1_0.1.png');
  const body=fail?new Blob([Buffer.from('not a PNG, CRC is valid')]):png;
  if(fail)layer.byteSize=body.size;
  entries.push({name:layer.file,blob:body});
 }
 // Manifest must be serialized after intentional corruption metadata changes.
 entries[0].blob=new Blob([JSON.stringify(manifest)]);
 return writer.zipEntries(entries);
}
function store({existing=[],failTile=null,failCommit=false}={}){
 const map=new Map(existing.map(item=>[item.key,item]));
 const calls={reserve:0,add:0,publish:0,rollback:0};
 const key=scene=>scene+'|import-pending';
 return {map,calls,async reserve(scene,token){
   calls.reserve++;
   if([...map.keys()].some(k=>k.startsWith(scene+'|')))return false;
   map.set(key(scene),{key:key(scene),sceneKey:scene,importToken:token});
   return true;
  },async addTile(scene,token,rec){
   calls.add++;
   if(!map.has(key(scene))||map.get(key(scene)).importToken!==token)
    throw Error('token mismatch');
   if(rec.key!==scene+'|near|'+rec.tile.id||map.has(rec.key))
    throw Error('invalid key');
   if(failTile===rec.tile.id)throw Error('simulated quota error');
   map.set(rec.key,{...rec,importToken:token});
  },async publish(scene,token,record,n){
   calls.publish++;
   if(failCommit)throw Error('simulated publish failure');
   const keys=[...map.keys()].filter(k=>k.startsWith(scene+'|'));
   if(keys.length!==n+1||map.get(key(scene))?.importToken!==token)
    throw Error('incomplete reservation');
   map.set(record.key,record);map.delete(key(scene));
  },async rollback(scene,token){
   calls.rollback++;
   for(const [k,v] of map)if(k.startsWith(scene+'|')&&
    v.importToken===token)map.delete(k);
  }};
}
const options=(db,sceneFactory=()=>TARGET,extra={})=>({
 confirmed:true,storage:db,sceneFactory,tokenFactory:()=>'a'.repeat(32),...extra
});
test('requires explicit confirmation before touching storage',async()=>{
 const db=store();
 await assert.rejects(importer.restore(await payload(),options(db,undefined,{confirmed:false})),
  /explizite Importbestätigung/);
 assert.equal(db.calls.reserve,0);
});
test('exports a complete 2-tile ZIP into fresh scene; only then publishes manifest',async()=>{
 const db=store(),progress=[];
 const file=await payload();
 const report=await importer.restore(file,options(db,()=>TARGET,{
  onProgress:v=>progress.push({...v})
 }));
 assert.equal(report.scene,TARGET);
 assert.equal(report.sourceScene,SOURCE);
 assert.equal(report.tiles,2);
 assert.equal(report.viewerPath,'frozen-map-game.html?scene='+TARGET+'&lod=near');
 assert.equal(db.calls.publish,1);
 assert.equal(db.calls.add,2);
 assert.equal(db.calls.rollback,0);
 assert.equal(db.map.has(TARGET+'|import-pending'),false);
 assert.equal(db.map.get(TARGET+'|manifest').schema,1);
 assert.equal(db.map.get(TARGET+'|manifest').sceneKey,TARGET);
 assert.equal(db.map.get(TARGET+'|manifest').levels[0],'near');
 assert.equal(db.map.get(TARGET+'|manifest').importedLocalPreviewOnly,true);
 assert.equal(db.map.get(TARGET+'|manifest').cells[1].visibility,'hidden');
 assert.equal(db.map.get(TARGET+'|near|0,0').layers.length,2);
 assert.equal(db.map.get(TARGET+'|near|0,0').layers[0].png.size,png.size);
 assert.deepEqual(progress.map(v=>v.done),[1,2]);
});
test('existing original is untouched and occupied target is skipped',async()=>{
 const original={key:TARGET+'|manifest',preserve:'original-user-map'};
 const db=store({existing:[original]});
 const list=[TARGET,OTHER],report=await importer.restore(await payload(),
  options(db,()=>list.shift()));
 assert.equal(report.scene,OTHER);
 assert.equal(db.map.get(TARGET+'|manifest'),original);
 assert.equal(db.calls.reserve,2);
 assert.equal(db.map.get(OTHER+'|manifest').sceneKey,OTHER);
});
test('a corrupt later PNG rolls back only new scene and does not publish',async()=>{
 const original={key:'v1-deadbeef|near|0,0',preserve:1};
 const db=store({existing:[original]});
 await assert.rejects(importer.restore(await payload({brokenLayer:true}),
  options(db)),/PNG-(?:Schicht zu kurz|Signatur)/);
 assert.equal(db.calls.rollback,1);
 assert.equal(db.calls.add,1);
 assert.equal(db.calls.publish,0);
 assert.equal(db.map.get(original.key),original);
 assert.equal([...db.map.keys()].filter(k=>k.startsWith(TARGET+'|')).length,0);
});
test('quota or commit failure rolls back only staged tiles',async()=>{
 for(const db of [store({failTile:'1,0'}),store({failCommit:true})]){
  await assert.rejects(importer.restore(await payload(),options(db)),
   /simulated/);
  assert.equal(db.calls.rollback,1);
  assert.equal(db.map.size,0);
  assert.equal(db.map.has(TARGET+'|manifest'),false);
 }
});
test('incomplete ZIP requires explicit opt-in and preserves incomplete status',async()=>{
 const file=await payload({complete:false,expectedTiles:3}),db=store();
 await assert.rejects(importer.restore(file,options(db)),/unvollständig/);
 assert.equal(db.calls.reserve,0);
 const result=await importer.restore(file,options(db,()=>TARGET,{allowPartial:true}));
 assert.equal(result.complete,false);
 assert.equal(db.map.get(TARGET+'|manifest').complete,false);
});
test('invalid geometry rejected before reservation and original scene never reused',async()=>{
 const db=store();
 await assert.rejects(importer.restore(await payload({invalidCells:true}),options(db)),
  /Hex-Geometrie/);
 assert.equal(db.calls.reserve,0);
 await assert.rejects(importer.restore(await payload(),options(db,()=>SOURCE)),
  /keine freie neue Kartenkennung/);
 assert.equal(db.calls.reserve,0);
});
test('progress callback exceptions cannot corrupt an otherwise complete import',async()=>{
 const db=store(),result=await importer.restore(await payload(),
  options(db,()=>TARGET,{onProgress:()=>{throw Error('UI closed');}}));
 assert.equal(result.scene,TARGET);
 assert.equal(db.map.get(TARGET+'|manifest').complete,true);
});
test('inspector is mandatory and browser storage is never deleted implicitly',async()=>{
 const db=store();
 await assert.rejects(importer.restore(await payload(),options(db,()=>TARGET,{
  inspector:null
 })),/ZIP-Vorprüfung/);
 const code=fs.readFileSync(path.join(root,'static-map-zip-importer.js'),'utf8');
 assert.doesNotMatch(code,/deleteDatabase\(|\.clear\(/);
 assert.doesNotThrow(()=>new Function(code));
});
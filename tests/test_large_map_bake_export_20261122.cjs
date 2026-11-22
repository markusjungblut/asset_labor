'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const G=require('../worldgen-geography.js');
const P=require('../large-map-bake-plan.js');
const S=require('../large-map-bake-source.js');
const Export=require('../large-map-bake-export.js');
const zipSandbox={window:{},TextEncoder,TextDecoder,Blob,Uint8Array,DataView};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../frozen-map-package.js'),'utf8'),zipSandbox);
const zip=zipSandbox.window.VedrasFrozenMapPackage;
function setup(sectorSize=4){
 const world=G.generateWorld('sector-test',{width:12,height:10,originQ:-7,originR:9}),
  plan=P.plan(world),records=new Map();
 const expected=id=>({key:'bake-v1|'+id,tileId:id,
  sourceFingerprint:plan.source.fingerprint,
  rendererRevision:'renderer-r7',catalogRevision:'catalog-r3',mode:'near-4x'});
 const bytes=new Blob([new Uint8Array(256)],{type:'image/png'});
 for(const tile of plan.tiles){
  const e=expected(tile.id);
  records.set(e.key,{schema:'vedras-large-map-bake-receipt-v1',
   key:e.key,revision:'source-r9',layers:[
    {layer:'ground',png:bytes,pad:3,sha256:'a'.repeat(64),width:2072,height:1759},
    {layer:'scenery',png:bytes,pad:128,sha256:'b'.repeat(64),width:1536,height:1306}
   ]});
 }
 let verifications=0;
 const receiptVerifier={validateReceipt:async(rec,e)=>{
  verifications++;
  if(!rec||rec.key!==e.key||rec.invalid)throw Error('tampered-or-other-revision');
  assert.equal(rec.layers.length,2);
 }};
 const store={get:async key=>records.get(key)||null};
 const exporter=Export.create({world,plan,planner:P,sourceAdapter:S,
  receiptVerifier,packageApi:zip,runner:{expected},store,sectorSize});
 return {world,plan,records,exporter,expected,
  verifications:()=>verifications};
}
test('bounded verified ZIP sectors preserve owned semantic cells and filename references',async()=>{
 const {world,plan,exporter,verifications}=setup(4);
 assert.equal(exporter.sectorCount,Math.ceil(plan.tileCount/4));
 const ownerIds=new Set(),allTileIds=new Set();
 for(let i=0;i<exporter.sectorCount;i++){
  const result=await exporter.exportSector(i);
  assert.equal(result.manifest.schema,'vedras-geography-bake-sector-v1');
  assert.equal(result.manifest.stage,'verified-sector');
  assert.equal(result.manifest.readyForViewer,false);
  assert.equal(result.manifest.complete,true);
  assert(result.tiles>=1&&result.tiles<=4);
  const zipBytes=Buffer.from(await result.blob.arrayBuffer());
  assert.equal(zipBytes.readUInt32LE(0),0x04034b50);
  assert(zipBytes.includes(Buffer.from('manifest.json')));
  assert(zipBytes.includes(Buffer.from('tiles/near/')));
  for(const t of result.manifest.tiles){
   assert(!allTileIds.has(t.id));
   allTileIds.add(t.id);
   assert.deepEqual(t.layers.map(l=>l.layer),['ground','scenery']);
   assert(t.layers.every(l=>l.file.endsWith('.png')));
  }
  for(const c of result.manifest.cells){
   const k=c.q+','+c.r;
   assert(!ownerIds.has(k),'semantic cell owned by exactly one sector');
   ownerIds.add(k);
  }
 }
 assert.equal(ownerIds.size,world.cells.length,
  'all original geography hexes survive sector ownership exactly once');
 assert.equal(allTileIds.size,plan.tileCount);
 assert.equal(verifications(),plan.tileCount);
});
test('audit refuses to publish a world index when a tile is missing or corrupted',async()=>{
 const {exporter,plan,records,expected}=setup(2);
 const first=plan.tiles[0].id;
 records.delete(expected(first).key);
 let report=await exporter.audit();
 assert.equal(report.allVerified,false);
 assert.equal(report.missing,1);
 await assert.rejects(()=>exporter.exportSector(0),/nicht vollständig|keine gültige/);
 await assert.rejects(()=>exporter.exportCollectionIndex(),/Weltindex verweigert/);
 const current=plan.tiles[1].id;
 records.get(expected(current).key).invalid=true;
 report=await exporter.audit();
 assert.equal(report.invalid,1);
 assert.equal(report.missing,1);
});
test('collection index retains complete geography but never claims sector ZIPs are delivered',async()=>{
 const {world,plan,exporter}=setup(5);
 const doc=await exporter.exportCollectionIndex();
 assert.equal(doc.index.schema,'vedras-geography-bake-collection-v1');
 assert.equal(doc.index.expectedTiles,plan.tileCount);
 assert.equal(doc.index.verifiedTiles,plan.tileCount);
 assert.equal(doc.index.sectorsPackaged,false);
 assert.equal(doc.index.readyForViewer,false);
 assert.deepEqual(doc.index.geographicWorld.cells,world.cells);
 assert.deepEqual(doc.index.geographicWorld.riverPaths,world.riverPaths);
 assert(doc.blob.size>0);
 assert.equal(doc.filename,'vedras-geografie-sektoren.json');
});
test('invalid sector limits and unsupported incomplete sources fail closed',async()=>{
 const f=setup();
 assert.throws(()=>f.exporter.descriptor(-1),/Sektorindex/);
 assert.throws(()=>f.exporter.descriptor(f.exporter.sectorCount),/Sektorindex/);
 assert.throws(()=>Export.create({sectorSize:33}),/Sektorexport/);
});

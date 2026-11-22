'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const zlib=require('node:zlib');
const G=require('../worldgen-geography.js');
const P=require('../large-map-bake-plan.js');
const S=require('../large-map-bake-source.js');
const R=require('../large-map-bake-runner.js');
const digest=async blob=>createHash('sha256').update(Buffer.from(await blob.arrayBuffer()))
 .digest('hex');

function crc32(bytes){
 let c=0xffffffff;
 for(const byte of bytes){
  c^=byte;
  for(let i=0;i<8;i++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;
 }
 return (c^0xffffffff)>>>0;
}
function chunk(type,body){
 const tag=Buffer.from(type,'ascii'),data=Buffer.from(body),
  out=Buffer.alloc(12+data.length);
 out.writeUInt32BE(data.length,0);tag.copy(out,4);data.copy(out,8);
 out.writeUInt32BE(crc32(out.subarray(4,8+data.length)),8+data.length);
 return out;
}
function makePng({width,height},variant=0){
 const head=Buffer.from([137,80,78,71,13,10,26,10]);
 const ihdr=Buffer.alloc(13);
 ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);
 ihdr[8]=8;ihdr[9]=6; // 8 bit RGBA, filter/compression 0
 const raw=Buffer.alloc(height*(width*4+1));
 raw[1]=variant; // First red channel; legal filter byte at raw[0] is zero.
 const encoded=zlib.deflateSync(raw,{level:1});
 return new Blob([head,chunk('IHDR',ihdr),chunk('IDAT',encoded),
  chunk('IEND',Buffer.alloc(0))],{type:'image/png'});
}
function setup(seed='runner-fixture'){
 const world=G.generateWorld(seed,{width:10,height:10});
 const plan=P.plan(world);
 const source=S.create(world,plan,{planner:P});
 return {world,plan,source};
}
function store(){
 const records=new Map();
 return {records,get:async key=>records.get(key)||null,
  add:async value=>{
   if(records.has(value.key))throw Error('AlreadyExists');
   records.set(value.key,value);
  }};
}
const ground=makePng(R.dimensions('ground','near-4x')),
 scenery=makePng(R.dimensions('scenery','near-4x')),
 altered=makePng(R.dimensions('ground','near-4x'),1);
const fresh=()=>({complete:true,preview:false,dirty:false,revision:'terrain-r1',
 layers:[{layer:'ground',png:ground,pad:3},
  {layer:'scenery',png:scenery,pad:128}]});

test('genuine PNG images have the exact dimensions of existing 4x/2x Asset-Labor layers',async()=>{
 const g=await R.pngInfo(ground),s=await R.pngInfo(scenery);
 assert.deepEqual({width:g.width,height:g.height},R.dimensions('ground','near-4x'));
 assert.deepEqual({width:s.width,height:s.height},R.dimensions('scenery','near-4x'));
 assert.equal((await R.checkPacket(fresh(),'near-4x',{digest})).length,2);
 await assert.rejects(()=>R.pngInfo(new Blob([await ground.arrayBuffer()].slice(0,1))));
 await assert.rejects(()=>R.pngInfo(new Blob([Buffer.from(await ground.arrayBuffer()).subarray(0,30)])),/PNG/);
});
test('partial render resumes strictly from verified, append-only PNG receipts',async()=>{
 const {world,plan}=setup(),db=store();
 let renders=0,contexts=[];
 const runner=R.create({world,plan,planner:P,sourceAdapter:S,
  rendererRevision:'assetlab-r7',catalogRevision:'catalog-test-1',
  renderer:{renderTile:async context=>{renders++;contexts.push(context);return fresh();}},
  store:db,digest});
 const first=await runner.run({maxTiles:2});
 assert.equal(first.status,'paused');assert.equal(first.rendered,2);
 assert.equal(db.records.size,2);
 assert.equal(first.readyForViewer,false);
 const next=await runner.run();
 assert.equal(next.status,'all-tiles-verified');
 assert.equal(next.rendered,plan.tileCount-2);
 assert.equal(next.resumed,2);
 assert.equal(db.records.size,plan.tileCount);
 assert.equal(renders,plan.tileCount);
 assert(contexts.every(x=>x.sourceCount<100));
 const third=await runner.run();
 assert.equal(third.rendered,0);
 assert.equal(third.resumed,plan.tileCount);
 assert.equal(db.records.size,plan.tileCount);
});
test('foreign revision, tampered PNG and wrong dimensions never count as complete',async()=>{
 const {world,plan}=setup('integrity'),db=store();
 const common={world,plan,planner:P,sourceAdapter:S,store:db,digest,
  rendererRevision:'renderer1',catalogRevision:'catalog1'};
 const runner=R.create({...common,renderer:{renderTile:async()=>fresh()}});
 assert.equal((await runner.run({maxTiles:1})).rendered,1);
 const key=runner.expected(plan.tiles[0].id).key;
 const stored=db.records.get(key);
 db.records.set(key,{...stored,layers:[{...stored.layers[0],png:altered},stored.layers[1]]});
 const bad=await runner.run({maxTiles:1});
 assert.equal(bad.status,'blocked');assert.equal(bad.rendered,0);
 assert.match(bad.blocked.error,/SHA-256|Hash/);
 const another=R.create({...common,rendererRevision:'renderer2',
  renderer:{renderTile:async()=>fresh()}});
 assert.equal((await another.run({maxTiles:1})).rendered,1);
 assert.equal(db.records.size,2,'new revision creates a different immutable key');
 const invalid=R.create({...common,rendererRevision:'renderer3',
  renderer:{renderTile:async()=>({
   ...fresh(),layers:[{layer:'ground',png:scenery,pad:3},
    {layer:'scenery',png:scenery,pad:128}]
  })}});
 const rejected=await invalid.run({maxTiles:1});
 assert.equal(rejected.status,'blocked');assert.equal(rejected.rendered,0);
 assert.match(rejected.blocked.error,/Abmessungen/);
});
test('an abort or failed renderer leaves already committed tiles untouched',async()=>{
 const {world,plan}=setup('abort'),db=store(),controller=new AbortController();
 const runner=R.create({world,plan,planner:P,sourceAdapter:S,store:db,
  rendererRevision:'r1',catalogRevision:'c1',
  renderer:{renderTile:async()=>fresh()},digest});
 const result=await runner.run({signal:controller.signal,
  onProgress:p=>{if(p.rendered===1)controller.abort();}});
 assert.equal(result.status,'cancelled');
 assert.equal(result.rendered,1);assert.equal(db.records.size,1);
 const blocked=R.create({world,plan,planner:P,sourceAdapter:S,store:db,
  rendererRevision:'r2',catalogRevision:'c1',
  renderer:{renderTile:async()=>null},digest});
 const report=await blocked.run({maxTiles:1});
 assert.equal(report.status,'blocked');
 assert.equal(db.records.size,1);
});

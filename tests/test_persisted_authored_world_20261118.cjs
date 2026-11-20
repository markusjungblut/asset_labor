'use strict';
// Zero production PNGs, no browser IndexedDB, no terrain worker, no atlas bake.
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),
 zlib=require('node:zlib');
const root=path.join(__dirname,'..'),window={};
const scope={window,TextEncoder,TextDecoder,Blob,Date,Promise,
 performance:{now:()=>0},requestAnimationFrame:()=>0,console};
for(const name of ['authored-world-contract.js','frozen-map-runtime.js',
 'frozen-map-package.js','static-map-zip-inspector.js',
 'static-map-zip-importer.js'])
 vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),scope,{filename:name});
const contract=window.VedrasAuthoredWorld,api=window.VedrasFrozenMap,
 pack=window.VedrasFrozenMapPackage,inspect=window.VedrasStaticMapZipInspector,
 importer=window.VedrasStaticMapZipImporter;
const SCENE='v1-11111111',RESTORED='v1-22222222';
const authored=()=>({
 schema:'vedras-asset-labor-scene-0.8',schemaVersion:3,sceneSize:1,
 worldCells:[{q:0,r:0,worldQ:90,worldR:-12,biome:'grassland',
  terrainTypeId:'grassland',reliefClass:'hills',hillStrength:.65,
  features:['ore'],temperature:.45,humidity:.55}],
 geographySource:{version:'geography-v2.1.1',seed:'vedras',width:160,
  height:100,originQ:10,originR:-50,config:{waterPercent:25}},
 natureInstances:[],mountainInstances:[],roadEdges:[],riverPaths:[],
 shadowTone:{lift:.15,balance:.4}
});
function player(storage){
 const ctx={setTransform(){},clearRect(){},fillRect(){},
  save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},
  clip(){},drawImage(){}};
 return api.create({canvas:{width:0,height:0,getContext:()=>ctx,
  getBoundingClientRect:()=>({width:900,height:600})},
  storage,onStatus:()=>{}});
}
function png(){
 const w=8,h=8,raw=Buffer.alloc((w*4+1)*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*(w*4+1)+1+x*4;raw[i]=42;raw[i+1]=100;
  raw[i+2]=60;raw[i+3]=255;
 }
 const chunk=(type,data)=>{
  const b=Buffer.from(type),size=Buffer.alloc(4),crc=Buffer.alloc(4);
  size.writeUInt32BE(data.length);
  crc.writeUInt32BE(pack.crc32(Buffer.concat([b,data])));
  return Buffer.concat([size,b,data,crc]);
 };
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w);ihdr.writeUInt32BE(h,4);
 ihdr[8]=8;ihdr[9]=6;
 return new Blob([Buffer.concat([
  Buffer.from([137,80,78,71,13,10,26,10]),
  chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),
  chunk('IEND',Buffer.alloc(0))])],{type:'image/png'});
}
async function setup(){
 const storage=api.memoryStore(),game=player(storage),world=authored();
 await game.saveAuthoredWorld(SCENE,world);
 await game.saveManifest(SCENE,{cells:[{q:0,r:0,x:0,y:0,
  radius:147.8}],levels:['near'],expectedTiles:1,
  pose:{zoom:.75,dpr:2,projectY:.85,panX:0,panY:0}});
 const blob=png();
 await storage.put({key:SCENE+'|near|0,0',sceneKey:SCENE,level:'near',
  tile:{id:'0,0',x:0,y:0,size:512},revision:'fixed-source',
  layers:[{layer:'ground',png:blob,pad:3},
   {layer:'scenery',png:blob,pad:128}]});
 return {storage,game,world};
}
test('semantic contract accepts stable provenance and rejects duplicate/invalid Hexes',()=>{
 const w=authored();assert.equal(contract.validate(w),true);
 assert.equal(contract.clone(w).worldCells[0].worldQ,90);
 const duplicate=authored();duplicate.sceneSize=2;
 duplicate.worldCells.push({...duplicate.worldCells[0]});
 assert.equal(contract.validate(duplicate),false);
 const invalid=authored();invalid.worldCells[0].worldR=1.2;
 assert.equal(contract.validate(invalid),false);
 const erased=authored();delete erased.worldCells[0].terrainTypeId;
 assert.equal(contract.validate(erased),false);
});
test('save/load is immutable and separate from tiles; legacy image scenes stay intact',async()=>{
 const {storage,game,world}=await setup();
 const loaded=await game.loadAuthoredWorld(SCENE);
 assert.equal(loaded.worldCells[0].features[0],'ore');
 assert.equal(loaded.geographySource.seed,'vedras');
 assert.equal((await game.saveAuthoredWorld(SCENE,world)).saved,false);
 const altered=authored();altered.worldCells[0].biome='desert';
 await assert.rejects(game.saveAuthoredWorld(SCENE,altered),/anderen Inhalt/);
 assert.equal((await storage.get(SCENE+'|near|0,0')).layers.length,2);
 assert.equal((await storage.keys(SCENE+'|near|')).length,1);
 await assert.rejects(game.loadAuthoredWorld('v1-00000000'),
  /keine editierbare Weltbeschreibung/);
});
test('portable ZIP includes validated semantic Hexes without changing PNG payload',async()=>{
 const {storage}=await setup();
 const result=await pack.exportMap(storage,SCENE,'near',{totalExpected:1});
 assert.equal(result.manifest.complete,true);
 assert.equal(result.manifest.authoredWorld.worldCells[0].reliefClass,'hills');
 const checked=await inspect.inspect(result.blob);
 assert.equal(checked.manifest.authoredWorld.worldCells[0].worldQ,90);
 assert.ok((await checked.verifyLayer('tiles/near/0_0.0.png')).size>0);
});
test('ZIP import publishes semantic world atomically with its new atlas identity',async()=>{
 const {storage}=await setup();
 const archive=(await pack.exportMap(storage,SCENE,'near',{totalExpected:1})).blob;
 const records=new Map(),calls=[];
 const pending=RESTORED+'|import-pending';
 const db={
  async reserve(scene,token){records.set(pending,{key:pending,importToken:token});return true;},
  async addTile(scene,token,record){
   assert.equal(records.get(pending).importToken,token);
   records.set(record.key,record);calls.push('tile');
  },
  async publish(scene,token,manifest,count,world){
   assert.equal(records.size,count+1);
   assert.equal(world.worldCells[0].terrainTypeId,'grassland');
   records.set(scene+'|world',{kind:'vedras-authored-world-v1',data:world});
   records.set(manifest.key,manifest);records.delete(pending);
   calls.push('atomic-publish');
  },
  async rollback(){calls.push('rollback');}
 };
 const restored=await importer.restore(archive,{
  confirmed:true,storage:db,sceneFactory:()=>RESTORED,
  tokenFactory:()=>'a'.repeat(32)});
 assert.equal(restored.scene,RESTORED);
 assert.equal(records.get(RESTORED+'|world').data.worldCells[0].worldR,-12);
 assert.deepEqual(calls,['tile','atomic-publish']);
});
test('viewer startup does not eagerly read semantic data or require generator',()=>{
 const game=fs.readFileSync(path.join(root,'frozen-map-game.js'),'utf8');
 const html=fs.readFileSync(path.join(root,'frozen-map-game.html'),'utf8');
 const editor=fs.readFileSync(path.join(root,'app.js'),'utf8');
 assert.match(game,/showWorldData.*addEventListener\('click'/);
 assert.match(html,/id="showWorldData"/);
 assert.match(editor,/saveAuthoredWorld\(scene,authoredSceneSnapshot\(\)\)/);
 assert.match(editor,/worldCells=saved\.worldCells/);
 assert.doesNotMatch(game,/VedrasGeography\.generateWorld|bakeWorldTile\(/);
});

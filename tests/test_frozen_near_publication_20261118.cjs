'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const game=fs.readFileSync(path.join(root,'frozen-map-game.js'),'utf8');
const S='v1-87654321',sceneCells=[
 {q:0,r:0,x:0,y:0,radius:100,visibility:'visible'}];
const tiles=[{id:'0,0',x:0,y:0,size:512},
 {id:'1,0',x:512,y:0,size:512}];
function png(w,h){
 const b=new Uint8Array(24);
 b.set([137,80,78,71,13,10,26,10],0);
 new DataView(b.buffer).setUint32(16,w);
 new DataView(b.buffer).setUint32(20,h);
 return new Blob([b],{type:'image/png'});
}
function packet(tile,{lowRes=false,cropped=false,broken=false}={}){
 const g=lowRes?2:4;
 const fullScenery=768*4,sceneryHeight=Math.round(768*.85*4);
 const ground=png(518*g,Math.round(518*.85*g));
 const scenery=broken?new Blob(['not a png']):
  cropped?png(1,1):png(fullScenery,sceneryHeight);
 return {
  key:S+'|near|'+tile.id,sceneKey:S,level:'near',
  revision:'static-v6',tile:{...tile},
  layers:[
   {layer:'ground',pad:3,png:ground},
   {layer:'scenery',pad:128,png:scenery,
    ...(cropped?{crop:{x:0,y:0,fullWidth:fullScenery,
     fullHeight:sceneryHeight}}:{})}
  ]
 };
}
function fixture(){
 const window={};vm.runInNewContext(src,{
  window,console,Date,Promise,Blob,performance:{now:()=>1}
 },{filename:'frozen-map-runtime.js'});
 const api=window.VedrasFrozenMap,storage=api.memoryStore();
 const canvas={getContext:()=>({}),getBoundingClientRect:()=>({
  width:640,height:480})};
 const player=api.create({canvas,storage});
 return {player,storage};
}
test('missing near tile cannot be published even if one valid PNG is present',async()=>{
 const {player,storage}=fixture();
 await storage.put(packet(tiles[0]));
 const result=await player.verifyArchive(S,'near',tiles,{require4x:true});
 assert.equal(result.complete,false);
 assert.equal(result.expected,2);assert.equal(result.stored,1);
 assert.deepEqual(Array.from(result.missingIds),['1,0']);
 assert.equal(result.invalidTiles.length,0);
});
test('complete native 4x Ground and cropped original 4x Scenery are accepted',async()=>{
 const {player,storage}=fixture();
 await storage.put(packet(tiles[0]));
 await storage.put(packet(tiles[1],{cropped:true}));
 const result=await player.verifyArchive(S,'near',tiles,{require4x:true});
 assert.equal(result.complete,true,JSON.stringify(result));
 assert.equal(result.stored,2);
});
test('low density source, broken PNG or invalid geometry cannot count as complete',async()=>{
 const {player,storage}=fixture();
 await storage.put(packet(tiles[0]));
 await storage.put(packet(tiles[1],{lowRes:true}));
 let result=await player.verifyArchive(S,'near',tiles,{require4x:true});
 assert.equal(result.complete,false);
 assert.equal(result.invalidTiles[0].reason,'wrong-native-pixel-density');
 await storage.put(packet(tiles[1],{broken:true}));
 result=await player.verifyArchive(S,'near',tiles,{require4x:true});
 assert.equal(result.invalidTiles[0].reason,'missing-or-invalid-png');
 await storage.put({...packet(tiles[1]),tile:{...tiles[1],x:999}});
 result=await player.verifyArchive(S,'near',tiles,{require4x:true});
 assert.equal(result.invalidTiles[0].reason,'record-geometry-or-revision');
});
test('manifest building status and tile accounting survive an interrupted session',async()=>{
 const {player}=fixture();
 await player.saveManifest(S,{cells:sceneCells,levels:['near'],
  expectedTiles:2,generationStatus:'building',verifiedTiles:1,
  missingTileIds:['1,0']});
 const a=await player.loadManifest(S);
 assert.equal(a.generationStatus,'building');
 assert.equal(a.verifiedTiles,1);
 assert.deepEqual(Array.from(a.missingTileIds),['1,0']);
 await player.saveManifest(S,{cells:sceneCells,levels:['near'],
  expectedTiles:2,generationStatus:'complete',verifiedTiles:2,
  missingTileIds:[]});
 const b=await player.loadManifest(S);
 assert.equal(b.generationStatus,'complete');
 assert.equal(b.verifiedTiles,2);
});
test('full export requires 4x and a successful read-only audit before release',()=>{
 assert.ok(app.includes("const scene=frozenFinalSceneKey(),quality4=true,lod='near'"));
 assert.ok(app.includes("state.quality='4';"));
 assert.ok(app.includes('state.quality=pose.editorQuality;'));
 assert.ok(app.includes('game-map-export-renderer-v6-verified-near'));
 assert.ok(app.includes('const workQueue=all.slice(),retriedIds=new Set()'));
 assert.ok(app.includes("verifyArchive(scene,'near',all,{require4x:true})"));
 assert.ok(app.includes("generationStatus:published?'complete':'building'"));
 assert.ok(game.includes('requestedLevel&&!manifest.levels.includes(requestedLevel)'));
 assert.ok(game.includes("manifest.generationStatus==='building'"));
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function fourXGround(width=2072,height=1761){
 const h=new Uint8Array(24);h.set([137,80,78,71,13,10,26,10]);
 const d=new DataView(h.buffer);d.setUint32(16,width);d.setUint32(20,height);
 return new Blob([h],{type:'image/png'});
}
function runtime(){
 const ctx={window:{},Blob,console,
  performance:{now:()=>1},requestAnimationFrame(){}};
 vm.runInNewContext(read('frozen-map-runtime.js'),ctx);
 return ctx.window.VedrasFrozenMap;
}
test('scenery-only successor stores one PNG and links an immutable original Ground',async()=>{
 const api=runtime(),raw=api.memoryStore(),storage=api.linkedStore(raw);
 const source='v1-0374527a',target='v1-12345678',tile={
  id:'0,0',x:0,y:0,size:512
 };
 const sourceKey=api.makeKey(source,'near',tile.id),
  targetKey=api.makeKey(target,'near',tile.id);
 const ground=fourXGround(),
  sourceScenery=new Blob(['old shadows']),newScenery=new Blob(['fixed shadows']);
 await storage.put({key:sourceKey,sceneKey:source,level:'near',
  revision:'terrain-r1',tile,
  layers:[{layer:'ground',pad:3,png:ground},
   {layer:'scenery',pad:128,png:sourceScenery}]});
 let encoded=0;
 const player=api.create({
  canvas:{getContext:()=>({})},storage,
  encode:async()=>{encoded++;return newScenery;}
 });
 const refreshed={image:{width:300,height:240},
  pad:128,crop:{x:12,y:5,fullWidth:320,fullHeight:300}};
 assert.equal((await player.captureScenery(target,sourceKey,tile,refreshed)).saved,1);
 const linked=await raw.get(targetKey);
 assert.equal(linked.groundRefKey,sourceKey);
 assert.equal(linked.sceneryNative2x,true);
 assert.equal(linked.layers.length,1);
 assert.equal(linked.layers[0].png,newScenery);
 assert.equal(linked.layers[0].crop.x,12);
 assert.equal(linked.layers.some(l=>l.layer==='ground'),false);
 const resolved=await storage.get(targetKey);
 assert.equal(resolved.key,targetKey);
 assert.equal(resolved.layers.length,2);
 assert.equal(resolved.layers[0].png,ground);
 assert.equal(resolved.layers[1].png,newScenery);
 assert.equal(resolved.groundRefKey,sourceKey);
 assert.equal((await storage.get(sourceKey)).layers[1].png,sourceScenery);
 assert.equal((await player.captureScenery(target,sourceKey,tile,refreshed)).skipped,1);
 assert.equal(encoded,1,'resume cannot encode an already committed tile');
 assert.equal((await raw.keys(target+'|near|')).length,1);
});
test('shadow-only refresh rejects a legacy low-resolution Ground',async()=>{
 const api=runtime(),raw=api.memoryStore(),storage=api.linkedStore(raw);
 const tile={id:'0,0',x:0,y:0,size:512};
 const from='v1-aaaaaaaa|near|0,0',to='v1-bbbbbbbb';
 await raw.put({key:from,sceneKey:'v1-aaaaaaaa',level:'near',
  tile,revision:'r1',layers:[
   {layer:'ground',pad:3,png:fourXGround(1295,1101)},
   {layer:'scenery',png:new Blob(['old'])}]});
 const player=api.create({canvas:{getContext:()=>({})},storage,
  encode:async()=>new Blob(['new'])});
 await assert.rejects(player.captureScenery(to,from,tile,{
  image:{width:300,height:200}}),/nicht nachweislich echtes 4×/);
 assert.equal((await raw.keys(to+'|near|')).length,0);
});
test('scenery-only successor cannot overwrite or link mismatched original geometry',async()=>{
 const api=runtime(),raw=api.memoryStore(),storage=api.linkedStore(raw);
 const source='v1-aaaaaaaa',target='v1-bbbbbbbb';
 const tile={id:'0,0',x:0,y:0,size:512};
 const sourceKey=api.makeKey(source,'near',tile.id),targetKey=api.makeKey(target,'near',tile.id);
 await raw.put({key:sourceKey,sceneKey:source,level:'near',
  tile,revision:'r',layers:[{layer:'ground',png:fourXGround()},
   {layer:'scenery',png:new Blob(['original-scenery'])}]});
 const player=api.create({canvas:{getContext:()=>({})},storage,
  encode:async()=>new Blob(['new-scene'])});
 const scenery={image:{width:200,height:200}};
 await assert.rejects(player.captureScenery(source,sourceKey,tile,scenery),
  /Ungültige Scenery-only/);
 await assert.rejects(player.captureScenery(target,sourceKey,
  {...tile,x:512},scenery),/Unpassender/);
 await raw.put({key:targetKey,sceneKey:target,level:'near',
  tile,revision:'unrelated',layers:[]});
 await assert.rejects(player.captureScenery(target,sourceKey,tile,scenery),
  /Zielkachel existiert/);
 await raw.clearPrefix(target);
 await raw.put({key:targetKey,sceneKey:target,level:'near',tile,
  derivedFormat:'scenery-refresh-v1',groundRefKey:targetKey,
  layers:[{layer:'scenery',png:new Blob(['bad'])}]});
 await assert.rejects(storage.get(targetKey),/Ungültiger Bodenverweis/);
});
test('a linked shadow card fails closed without its original Ground',async()=>{
 const api=runtime(),raw=api.memoryStore(),storage=api.linkedStore(raw);
 const k='v1-22222222|near|0,0',original='v1-11111111|near|0,0';
 await raw.put({key:k,sceneKey:'v1-22222222',level:'near',
  tile:{id:'0,0',x:0,y:0,size:512},revision:'r',
  derivedFormat:'scenery-refresh-v1',groundRefKey:original,
  layers:[{layer:'scenery',png:new Blob(['new'])}]});
 await assert.rejects(storage.get(k),/Originalboden fehlt/);
});
test('manifest records the source atlas and new tonality without rewriting it',async()=>{
 const api=runtime(),raw=api.memoryStore(),storage=api.linkedStore(raw);
 const player=api.create({canvas:{getContext:()=>({})},storage});
 const cells=[{q:0,r:0,x:0,y:0,radius:52,visibility:'visible'}];
 await player.saveManifest('v1-12345678',{cells,levels:['near'],
  expectedTiles:1,sceneryBaseScene:'v1-0374527a',
  shadowTone:{lift:.75,balance:.9}});
 const m=await player.loadManifest('v1-12345678');
 assert.equal(m.sceneryBaseScene,'v1-0374527a');
 assert.equal(m.shadowTone.lift,.75);
 assert.equal(m.shadowTone.balance,.9);
 assert.equal((await raw.keys('v1-0374527a|')).length,0);
});
test('the editor re-bakes Scenery alone, validates geometry and asks for confirmation',()=>{
 const editor=read('app.js'),html=read('index.html'),
  deriv=read('frozen-map-derived-2x.js');
 const begin=editor.indexOf('function bakeFrozenSceneryOnly(tile)');
 const end=editor.indexOf("$('frozenReshade').addEventListener",begin);
 assert.ok(begin>=0&&end>begin);
 const bake=editor.slice(begin,end);
 assert.match(bake,/drawMapObjects\(\{includeUnits:false/);
 assert.match(bake,/packWorldTileScenery\(cv,'near'\)/);
 assert.doesNotMatch(bake.replace(/\/\/[^\n]*/g,''),/drawGround\(|drawRoads\(|bakeWorldTile\(/);
 assert.match(editor,/frozenMap\.captureScenery\(target,sourceKey,tile,scenery\)/);
 assert.match(editor,/frozenMap\.storage\.keys\(target\+'\|near\|'\)/);
 assert.match(editor,/current\.length!==saved\.length/);
 assert.match(editor,/sceneryBaseScene:source,shadowTone:tone/);
 assert.match(html,/id="frozenSceneryConfirm"/);
 assert.match(html,/id="frozenReshade"/);
 assert.match(deriv,/if\(original\.sceneryNative2x\)/);
 assert.match(deriv,/!record\.sceneryNative2x/);
});

test('portable ZIP of a linked scene embeds both complete image layers',async()=>{
 const api=runtime(),raw=api.memoryStore(),storage=api.linkedStore(raw);
 const from='v1-0374527a',to='v1-12345678',
  tile={id:'0,0',x:0,y:0,size:512};
 const original=api.makeKey(from,'near',tile.id);
 const ground=fourXGround(),oldScene=new Blob(['old']),
  newScene=new Blob(['corrected shadow png']);
 await raw.put({key:original,sceneKey:from,level:'near',tile,
  revision:'original-r1',layers:[
   {layer:'ground',pad:3,png:ground},
   {layer:'scenery',pad:128,png:oldScene}]});
 const player=api.create({canvas:{getContext:()=>({})},storage,
  encode:async()=>newScene});
 await player.saveManifest(to,{cells:[{
  q:0,r:0,x:0,y:0,radius:52,visibility:'visible'}],
  levels:['near'],expectedTiles:1,
  sceneryBaseScene:from,shadowTone:{lift:.5,balance:.75},
  appendOnly:true});
 await player.captureScenery(to,original,tile,{
  image:{width:200,height:140},pad:128});
 const packageCtx={window:{},Blob,TextEncoder,DataView,Uint8Array};
 vm.runInNewContext(read('frozen-map-package.js'),packageCtx);
 const zipped=await packageCtx.window.VedrasFrozenMapPackage
  .exportMap(storage,to,'near',{totalExpected:1});
 assert.equal(zipped.manifest.complete,true);
 assert.equal(zipped.manifest.tiles.length,1);
 assert.deepEqual(Array.from(zipped.manifest.tiles[0].layers,
  l=>l.layer),['ground','scenery']);
 assert.equal(zipped.manifest.tiles[0].layers[0].byteSize,ground.size);
 assert.equal(zipped.manifest.tiles[0].layers[1].byteSize,newScene.size);
 // ZIP STORE entries contain both PNG payloads: the portable export is
 // self-contained and never relies on this browser's linked Ground key.
 const bytes=Buffer.from(await zipped.blob.arrayBuffer());
 assert.ok(bytes.includes(Buffer.from('corrected shadow png')));
 assert.ok(bytes.includes(Buffer.from(await ground.arrayBuffer())));
 assert.equal((await raw.get(original)).layers[1].png,oldScene);
});

test('only a fully completed shadow-scene becomes automatic playback choice',()=>{
 const editor=read('app.js'),viewer=read('frozen-map-game.js'),
  html=read('frozen-map-game.html');
 assert.match(editor,/const fullyRefreshed=!run\.cancel&&!failed&&/);
 assert.match(editor,/completed===coverage\.expected&&coverage\.sourcePublished/);
 assert.match(editor,/localStorage\.setItem\('vedras-frozen-shadow-current:'\+source,target\)/);
 assert.match(editor,/localStorage\.setItem\('vedras-frozen-shadow-preview:'\+source,target\)/);
 assert.match(editor,/Schattenkarte UNVOLLSTÄNDIG/);
 assert.match(viewer,/params\.get\('original'\)!=='1'/);
 assert.match(viewer,/vedras-frozen-shadow-current:/);
 assert.match(viewer,/vedras-frozen-shadow-preview:/);
 assert.match(viewer,/previewIncomplete&&candidate\.preview/);
 assert.match(viewer,/tiles\.length===count/);
 assert.match(viewer,/shadowSuccessorSource=scene;shadowPreviewChosen=previewReady/);
 assert.match(viewer,/params\.get\('ground4x'\)==='1'/);
 assert.match(viewer,/params\.get\('fallbackAtlas'\)!=='0'/);
 assert.match(html,/frozen-map-game\.js\?v=20261120-original-scenery-ab/);
 assert.doesNotMatch(editor,/deleteDatabase\(|indexedDB\.deleteDatabase\(/);
});

test('a 98/120 partial Ground archive yields a safe 98-tile shadow preview',async()=>{
 const editor=read('app.js');
 const first=editor.indexOf('function frozenSceneryCoverage(');
 const last=editor.indexOf("$('frozenShadowPreview').addEventListener",first);
 assert(first>0&&last>first,'exercise the actual coverage gate');
 const coverage=vm.runInNewContext(editor.slice(first,last)+'\nfrozenSceneryCoverage;',{});
 const source='v1-0f902ecd',target='v1-abcdef12',
  all=Array.from({length:120},(_,i)=>({id:i+',0',x:i*512,y:0,size:512}));
 const sourceKeys=all.slice(0,98).map(t=>source+'|near|'+t.id);
 const c=coverage(sourceKeys,all,{
  sceneKey:source,expectedTiles:120,generationStatus:'building'});
 assert.equal(c.available,98);
 assert.equal(c.expected,120);
 assert.equal(c.missingIds.length,22);
 assert.equal(c.sourcePublished,false);
 assert.throws(()=>coverage([source+'|near|bad'],all,{
  sceneKey:source,expectedTiles:120}),/Chunk-Raster/);
 assert.throws(()=>coverage(sourceKeys,all,{
  sceneKey:source,expectedTiles:98}),/Chunk-Raster/);
 const full=coverage(all.map(t=>source+'|near|'+t.id),all,{
  sceneKey:source,expectedTiles:120,generationStatus:'complete'});
 assert.equal(full.sourcePublished,true);
 const unverified=coverage(all.map(t=>source+'|near|'+t.id),all,{
  sceneKey:source,expectedTiles:120,generationStatus:'building'});
 assert.equal(unverified.sourcePublished,false,
  'full tile count must not publish unverified original');

 const api=runtime(),raw=api.memoryStore(),storage=api.linkedStore(raw);
 const player=api.create({canvas:{getContext:()=>({})},storage,
  encode:async()=>new Blob(['balanced shadow PNG'])});
 const cells=[{q:0,r:0,x:0,y:0,radius:52,visibility:'visible'}];
 await player.saveManifest(target,{cells,levels:['near'],expectedTiles:120,
  generationStatus:'building',verifiedTiles:0,
  missingTileIds:c.missingIds,sceneryBaseScene:source,
  shadowTone:{lift:0,balance:.9},appendOnly:true});
 for(const t of all.slice(0,2)){
  const key=source+'|near|'+t.id;
  await raw.put({key,sceneKey:source,level:'near',tile:t,revision:'r',
   layers:[{layer:'ground',pad:3,png:fourXGround()},
    {layer:'scenery',png:new Blob(['old shadows'])}]});
  assert.equal((await player.captureScenery(target,key,t,
   {image:{width:200,height:200}})).saved,1);
  const old=await storage.get(key),linked=await storage.get(target+'|near|'+t.id);
  assert.equal(old.layers[1].png.size,11,'original scenery is immutable');
  assert.equal(linked.groundRefKey,key);
  assert.equal(linked.layers[1].png.size,19);
 }
 const manifest=await player.loadManifest(target);
 assert.equal(manifest.expectedTiles,120);
 assert.equal(manifest.generationStatus,'building');
 assert.equal((await storage.keys(target+'|near|')).length,2);
 assert.equal((await storage.keys(source+'|near|')).length,2);
});

test('118/120 mixed archive: 98 linked shadow Ground tiles + 20 native tiles are valid for local preview',async()=>{
 const api=runtime(),raw=api.memoryStore(),storage=api.linkedStore(raw);
 const source='v1-2bbd1a6d',target='v1-dcaeb82e',
  tiles=Array.from({length:120},(_,i)=>({
   id:(i-60)+',0',x:(i-60)*512,y:0,size:512
  }));
 const png=(w,h)=>fourXGround(w,h);
 for(const tile of tiles.slice(0,98)){
  const sourceKey=api.makeKey(source,'near',tile.id);
  await raw.put({key:sourceKey,sceneKey:source,level:'near',tile,
   revision:'original-source-r1',
   layers:[{layer:'ground',pad:3,png:png(2072,1761)},
    {layer:'scenery',pad:128,png:png(1536,1306)}]});
  await raw.put({key:api.makeKey(target,'near',tile.id),
   sceneKey:target,level:'near',tile,revision:'original-source-r1',
   derivedFormat:'scenery-refresh-v1',
   groundRefKey:sourceKey,sceneryNative2x:true,
   layers:[{layer:'scenery',pad:128,png:png(1536,1306)}]});
 }
 for(const tile of tiles.slice(98,118)){
  await raw.put({key:api.makeKey(target,'near',tile.id),
   sceneKey:target,level:'near',tile,revision:'native-r1',
   layers:[{layer:'ground',pad:3,png:png(2072,1761)},
    {layer:'scenery',pad:128,png:png(1536,1306)}]});
 }
 const reader=api.create({canvas:{getContext:()=>({})},storage});
 const audited=await reader.verifyArchive(target,'near',tiles,{require4x:true});
 assert.equal(audited.expected,120);
 assert.equal(audited.stored,118);
 assert.equal(audited.missingIds.length,2);
 assert.deepEqual(audited.invalidTiles,[],
  'linked original Ground is verified, not mislabeled as corrupt');
 assert.equal(audited.complete,false,
  'do not publish the map while any outer tile is missing');
 const archivedOriginal=await raw.get(api.makeKey(source,'near',tiles[0].id));
 assert.equal(archivedOriginal.layers.length,2,'original PNGs untouched');
 await raw.clearPrefix(source+'|near|');
 const broken=await reader.verifyArchive(target,'near',tiles,{require4x:true});
 assert.equal(broken.invalidTiles.length,98,
  'broken linked Ground still fails closed');
});
test('local test viewer can play a sound but incomplete atlas; publication gate stays strict',()=>{
 const app=read('app.js'),viewer=read('frozen-map-game.js');
 assert(app.includes('quality.invalidTiles.length||quality.extraIds.length'));
 assert(app.includes('const quality=await frozenMap.verifyArchive('));
 assert(app.includes("'&lod='+encodeURIComponent(lod)+'&previewIncomplete=1'"));
 assert(app.includes("'&lod=near&previewIncomplete=1'"));
 assert(app.includes('const published=!run.cancel&&audit.complete&&seamAudit.complete'));
 assert(viewer.includes("params.get('previewIncomplete')==='1'"));
 assert(viewer.includes("if(manifest.generationStatus==='building'&&!previewIncomplete)"));
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8'),
 runtime=read('frozen-map-runtime.js'),policy=read('frozen-map-view-policy.js'),
 game=read('frozen-map-game.js'),html=read('frozen-map-game.html');
const SCENE='v1-0374527a';
const createFixture=(count=15000,indexedTileSelection=true)=>{
 const window={};vm.runInNewContext(policy,{window});
 const calls=[];
 const ctx=()=>({setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
  lineTo(){},closePath(){},clip(){},rect(){},translate(){},scale(){},
  clearRect(){},fillRect(){},fill(){},drawImage(...args){calls.push(args)}});
 const canvas={width:0,height:0,getContext:ctx,
  getBoundingClientRect:()=>({width:1650,height:940})};
 const document={createElement:()=>({width:0,height:0,getContext:ctx})};
 const keys=[];
 let n=0;
 for(let iy=-50;iy<50&&n<count;iy++)
  for(let ix=-75;ix<75&&n<count;ix++,n++)
   keys.push(SCENE+'|near|'+ix+','+iy);
 const png={width:128,height:128,close(){}};
 const storage={async keys(prefix){return keys.filter(x=>x.startsWith(prefix))},
  async get(key){
   const [ix,iy]=key.slice((SCENE+'|near|').length).split(',').map(Number);
   return {key,sceneKey:SCENE,level:'near',
    tile:{id:ix+','+iy,x:ix*512,y:iy*512,size:512},layers:[
     {layer:'ground',pad:0,png},
     {layer:'scenery',pad:0,png}]};
  }};
 let t=0;vm.runInNewContext(runtime,{window,document,console,
  performance:{now:()=>++t},requestAnimationFrame:()=>{}});
 const player=window.VedrasFrozenMap.create({canvas,storage,
  indexedTileSelection,overview1x:false,largeViewportCache:true,
  sparseWorldBlit:false,adaptiveWorldPad:false,
  maxDecodedPixels:15000000,decode:async blob=>blob});
 const camera={zoom:.85,panX:0,panY:0,dpr:1.25,projectY:.85};
 const cells=[{q:0,r:0,x:0,y:0,radius:170,visibility:'visible'},
  {q:1,r:0,x:250,y:0,radius:170,visibility:'explored'}];
 return {player,calls,keys,async load(){
  await player.load(SCENE,'near',camera,cells);
  for(let i=0;i<6;i++){player.draw();await new Promise(r=>setImmediate(r));}
 },async pan(x,y){
  player.setPose({panX:x,panY:y});
  for(let i=0;i<3;i++){player.draw();await new Promise(r=>setImmediate(r));}
 }};
};
test('15k tile index preserves exact visible/prefetch/decode semantics and original order',async()=>{
 const indexed=createFixture(15000,true),legacy=createFixture(15000,false);
 await indexed.load();await legacy.load();
 assert.equal(indexed.player.report().indexedTileSelectionActive,true);
 assert.equal(indexed.player.report().tileIndexEntries,15000);
 assert.equal(legacy.player.report().indexedTileSelectionActive,false);
 const poses=[[0,0],[-1250,300],[850,-450],[4300,1850],[-6500,-2200],[0,0]];
 for(const [x,y] of poses){
  await indexed.pan(x,y);await legacy.pan(x,y);
  const a=indexed.player.report(),b=legacy.player.report();
  for(const k of ['saved','decoded','decodedPixels','visibleRequested',
   'prefetchRequested','prefetchReadStarts','visibleReadStarts','failures',
   'worldCacheFallbackFrames','overviewRasterBuilds','overviewRasterHits',
   'overviewPatchBuilds'])
   assert.equal(a[k],b[k],k+' at pan='+x+','+y);
  assert.equal(a.pending,b.pending);
 }
 const a=indexed.player.report(),b=legacy.player.report();
 assert.ok(a.tileIndexQueries>=10);
 assert.ok(a.tileIndexCandidateChecks<b.tileLegacyCandidateChecks*.1,
  'spatial selection must inspect at least 90% fewer candidate tile keys');
 assert.ok(b.tileLegacyCandidateChecks>=300000,
  'the control must really scan the full 15k keys every frame');
 indexed.player.stop();legacy.player.stop();
});
test('below 400 tiles a default-on index retains the original Set scan',async()=>{
 const f=createFixture(120,true);await f.load();
 assert.equal(f.player.report().saved,120);
 assert.equal(f.player.report().indexedTileSelection,true);
 assert.equal(f.player.report().indexedTileSelectionActive,false);
 assert.equal(f.player.report().tileIndexEntries,0);
 assert.ok(f.player.report().tileLegacyCandidateChecks>=120);
 f.player.stop();
});
test('a scene switch drops the old index; fresh camera loads only current scene keys',async()=>{
 const f=createFixture(15000,true);await f.load();
 assert.equal(f.player.report().tileIndexEntries,15000);
 f.player.stop();
 assert.equal(f.player.report().tileIndexEntries,0);
 await f.load();
 assert.equal(f.player.report().tileIndexEntries,15000);
 f.player.stop();
});
test('default-on optimizations preserve explicit opt-outs, no archive rewriting',()=>{
 assert.match(game,/params\.get\('worldPad'\)!=='0'/);
 assert.match(game,/params\.get\('worldBands'\)!=='0'/);
 assert.match(game,/params\.get\('tileIndex'\)!=='0'/);
 for(const [id,parameter] of [
  ['optWorldPad','worldPad'],['optWorldBands','worldBands'],
  ['optTileIndex','tileIndex'],['optFogLayer','fogLayer']]){
  assert.ok(html.includes('id="'+id+'"'));
  assert.ok(game.includes("'"+id+"','"+parameter+"'"));
 }
 assert.match(game,/location\.assign\(next\.pathname\+next\.search\+next\.hash\)/);
 assert.match(html,/id="performanceOptions"/);
 assert.match(runtime,/adaptiveWorldPad=true/);
 assert.match(runtime,/sparseWorldBlit=true,indexedTileSelection=true/);
 assert.match(runtime,/MIN_INDEX_TILES=400/);
 assert.match(runtime,/function tileCandidates\(bounds\)/);
 assert.match(runtime,/found\.sort\(\(a,b\)=>a\.order-b\.order\)/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 for(const code of [runtime,game,policy])
  assert.doesNotThrow(()=>new Function(code));
});

test('25R retains original index vs legacy ordering with suffix and malformed keys',async()=>{
 const indexed=createFixture(401,true),legacy=createFixture(401,false);
 const extra=[SCENE+'|near|0,0,extra',SCENE+'|near|invalid,0',
  SCENE+'|near|,0'];
 indexed.keys.push(...extra);legacy.keys.push(...extra);
 await indexed.load();await legacy.load();
 const a=indexed.player.report(),b=legacy.player.report();
 assert.equal(a.saved,404);
 assert.equal(a.tileParsedRecords,403);
 assert.equal(b.tileParsedRecords,403);
 assert.equal(a.tileIndexEntries,403);
 assert.equal(b.tileIndexEntries,0);
 for(const [x,y] of [[0,0],[400,-100],[-900,200],[0,0]]){
  await indexed.pan(x,y);await legacy.pan(x,y);
  const m=indexed.player.report(),n=legacy.player.report();
  for(const key of ['decoded','visibleRequested','prefetchRequested',
   'visibleReadStarts','prefetchReadStarts','failures'])
   assert.equal(m[key],n[key],key+' at '+x+','+y);
 }
 indexed.player.stop();legacy.player.stop();
 assert.equal(indexed.player.report().tileParsedRecords,0);
 assert.equal(legacy.player.report().tileParsedRecords,0);
});
test('25R precaches metadata for 397-tile scenes with no index activation',async()=>{
 const f=createFixture(397,true);await f.load();
 const report=f.player.report();
 assert.equal(report.saved,397);
 assert.equal(report.indexedTileSelectionActive,false);
 assert.equal(report.tileParsedRecords,397);
 for(let i=0;i<5;i++)await f.pan(i*140,-i*110);
 assert.ok(f.player.report().tileLegacyCandidateChecks>=397*15);
 assert.equal(f.player.report().tileIndexQueries,0);
 f.player.stop();
});

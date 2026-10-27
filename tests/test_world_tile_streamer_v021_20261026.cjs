'use strict';
/* node --test tests/test_world_tile_streamer_v021_20261026.cjs */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','world-tile-streamer.js'),'utf8');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function harness(options={}){
 const calls=[],now={value:1000};
 const g={setTransform(){},clearRect(){},save(){calls.push('save');},
  restore(){calls.push('restore');},beginPath(){},moveTo(){},lineTo(){},
  closePath(){},clip(){calls.push('clip');},ellipse(){},fill(){},
  fillRect(){calls.push('cloud');},drawImage(image){calls.push(image.name||'tile');}};
 const canvas={width:0,height:0,getContext:()=>g};
 const sandbox={window:{},performance:{now:()=>now.value}};
 vm.runInNewContext(source,sandbox);
 const loader=options.source||((tile,lod)=>({
  layers:[{layer:'ground',image:{name:tile.id+'/'+lod,width:256,height:256}}]}));
 const world=sandbox.window.VedrasWorldTiles.create({canvas,source:loader,
  onReady:options.onReady||(()=>{}),maxPixels:options.maxPixels||4000000});
 const view={width:800,height:600,panX:0,panY:0,zoom:.8,dpr:1,projectY:.85};
 const a={id:'0,0',x:0,y:0,size:512,visibility:'visible'},
  unknown={id:'1,0',x:512,y:0,size:512,visibility:'unknown'};
 return {world,view,a,unknown,calls,now};
}
async function flush(){for(let i=0;i<12;i++)await Promise.resolve();}
test('never requests a tile explicitly marked unknown',async()=>{
 let calls=0;const h=harness({source:()=>{
  calls++;return {layers:[{layer:'ground',image:{width:64,height:64}}]};
 }});
 h.world.request(h.view,[h.a,h.unknown]);
 await flush();assert.equal(calls,1);
 assert.equal(h.world.stats().visible,1);
});
test('ready world tile is retained across arbitrary camera pans',async()=>{
 let calls=0;const h=harness({source:(tile,lod)=>{
  calls++;return {layers:[{layer:'ground',image:{name:'terrain',width:256,height:256}}]};
 }});
 h.world.request(h.view,[h.a]);await flush();h.now.value+=500;
 assert.equal(h.world.render(h.view).loaded,1);
 h.world.request({...h.view,panX:-100},[h.a]);
 assert.equal(h.world.render({...h.view,panX:-100}).loaded,1);
 assert.equal(calls,1);
});
test('LOD transition uses previous resolution while requesting higher quality',async()=>{
 let resolveNext;
 const h=harness({source:(tile,lod)=>{
  if(lod==='near')return new Promise(resolve=>{resolveNext=resolve;});
  return {layers:[{layer:'ground',image:{width:128,height:128}}]};
 }});
 h.world.request(h.view,[h.a]);await flush();h.now.value+=300;
 const close={...h.view,zoom:1.3};
 h.world.request(close,[h.a]);await flush();
 assert.equal(h.world.render(close).loaded,1,'old LOD remains visible');
 resolveNext({layers:[{layer:'ground',image:{width:400,height:340}}]});
 await flush();assert.equal(h.world.stats().lod,'near');
 assert.equal(h.world.stats().tiles,2);
});
test('clouds conceal missing tiles and explored fog masks are applied AFTER units',()=>{
 const h=harness(),dynamic=[];
 h.world.setFogCells([{x:0,y:0,radius:140,visibility:'explored'}]);
 h.world.request(h.view,[h.a]);
 h.world.render(h.view,{drawDynamic:()=>dynamic.push('units')});
 assert.ok(h.calls.includes('cloud'),'cloud background covers missing content');
 assert.ok(h.calls.indexOf('clip')>h.calls.indexOf('cloud'),
  'explored hex should be clipped and dimmed');
 assert.deepEqual(dynamic,['units']);
});
test('all sources and queued work invalidated on world revision',async()=>{
 let finish;const h=harness({source:()=>new Promise(resolve=>{finish=resolve;})});
 h.world.request(h.view,[h.a]);await flush();
 h.world.invalidate();
 finish({layers:[{layer:'ground',image:{width:128,height:128}}]});
 await flush();assert.equal(h.world.stats().tiles,0);
});
test('editor uses the v0.21 retained compositor, streaming, cloud demo and dynamic units',()=>{
 const app=read('app.js'),html=read('index.html'),server=read('server.py');
 assert.match(app,/window\.VedrasWorldTiles\?\.create/);
 assert.match(app,/worldTiles\.request\(fastView\(\),tiles\)/);
 assert.match(app,/worldTiles\.render\(fastView\(\),\{drawDynamic:drawTileDynamics\}\)/);
 assert.match(app,/if\(worldTiles\)\{tileModeActive=true;fastRender\(\);\}/);
 assert.match(app,/drawMapObjects\(\{includeUnits:false,/);
 assert.match(app,/visibleFogTiles/);
 assert.match(html,/world-tile-streamer\.js\?v=0\.22\.6/);
 assert.match(html,/id="fogPreview"/);
 assert.match(server,/VERSION = '0\.22\.6'/);
});

test('initial exact editor draw seeds already rendered terrain and sprites before a pan',()=>{
 const app=read('app.js');
 assert.match(app,/function seedReadyWorldTiles\(\)/);
 assert.match(app,/if\(key!==lastTileSnapshotSignature\)\{[\s\S]*?seedReadyWorldTiles\(\);/);
 assert.match(app,/worldTiles\.seed\(t,lod,\{complete:true,\s*layers:\[\{layer:'ground',image:a,pad:WORLD_TILE_GUTTER\},/);
 // Step 6: the static snapshot no longer captures unit sprites. The
 // separate dynamic layer is drawn after the cached Nature tile.
 assert.match(app,/drawMapObjects\\(\\{includeUnits:false\\}\\)/);
 assert.match(app,/drawMapObjects\\(\\{onlyUnits:true\\}\\)/);
 const seed=app.slice(app.indexOf('function seedReadyWorldTiles()'),
  app.indexOf('function snapshotTile('));
 assert.doesNotMatch(seed,/const units=objectLayoutCache\\.query/);
});
test('rapid camera reversal cancels obsolete tile loading without poisoning cache',async()=>{
 let resolveOld, requests=[];
 const h=harness({source:(tile)=>{
  requests.push(tile.id);
  if(tile.id==='0,0')return new Promise(resolve=>{resolveOld=resolve;});
  return {layers:[{layer:'ground',image:{width:128,height:128}}]};
 }});
 const newer={id:'2,0',x:1024,y:0,size:512,visibility:'visible'};
 h.world.request(h.view,[h.a]);await flush();
 h.world.request({...h.view,panX:-1050},[newer]);await flush();
 resolveOld({layers:[{layer:'ground',image:{width:128,height:128}}]});
 await flush();
 assert.deepEqual(requests,['0,0','2,0']);
 assert.equal(h.world.stats().tiles,1,'old tile from former viewport is discarded');
 assert.equal(h.world.stats().visible,1);
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const worldSrc=fs.readFileSync(path.join(root,'world-tile-streamer.js'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const audit=fs.readFileSync(path.join(root,'scripts/rendering-step16a-audit.mjs'),'utf8');
function create({maxPixels=40000}={}){
 const window={};
 vm.runInNewContext(worldSrc,{window,console,Date,Promise,
  setTimeout,clearTimeout,performance,AbortController});
 const g={save(){},restore(){},setTransform(){},clearRect(){},fillRect(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},fill(){},
  drawImage(){}};
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:1,height:1,getContext:()=>g},
  source:null,requireScenery:true,lodSelector:()=> 'mid',
  maxTiles:10,maxPixels
 });
 const tile=x=>({id:x+',0',x:x*512,y:0,size:512,visibility:'visible'});
 const packet=(x,preview=false)=>({complete:true,preview,
  revision:JSON.stringify(['terrain','no-coast','src-road','off']),
  layers:[{layer:'ground',image:{width:100,height:100}},
   {layer:'scenery',image:{width:100,height:100}}]});
 return {renderer,tile,packet};
}
test('entire planned tile union is retained while an unrelated cache entry is evicted',()=>{
 const {renderer,tile,packet}=create(),a=tile(0),b=tile(1),c=tile(2);
 const lease=renderer.reserveWarmTiles([a.id+'@mid',b.id+'@mid']);
 assert.equal(lease.keys,2);
 assert.equal(renderer.seed(a,'mid',packet('a')),true);
 assert.equal(renderer.seed(b,'mid',packet('b')),true);
 assert.equal(renderer.warmTileStatus().ready,2);
 renderer.seed(c,'mid',packet('c'));
 const status=renderer.warmTileStatus();
 assert.equal(status.keys,2);
 assert.equal(status.ready,2);
 assert.equal(status.pixels,40000);
 assert.equal(status.overBudgetPixels,0);
 assert.equal(renderer.stats().evicted,1);
 renderer.reserveWarmTiles(null);
 assert.equal(renderer.warmTileStatus().active,false);
});
test('insufficient fixed pixel budget is reported rather than silently enlarged',()=>{
 const {renderer,tile,packet}=create({maxPixels:25000});
 const a=tile(0),b=tile(1);
 renderer.reserveWarmTiles([a.id+'@mid',b.id+'@mid']);
 renderer.seed(a,'mid',packet('a'));
 renderer.seed(b,'mid',packet('b'));
 const status=renderer.warmTileStatus();
 assert.equal(status.ready,2);
 assert.equal(status.revisionMismatch,0);
 assert.equal(status.budgetPixels,25000);
 assert.equal(status.overBudgetPixels,15000);
 renderer.reserveWarmTiles(null);
 assert.equal(renderer.warmTileStatus().overBudgetPixels,0);
 assert.equal(renderer.stats().tiles,1,'normal LRU reclaims excess immediately');
});
test('reservation cannot mistake missing or preview tiles for fully exact',()=>{
 const {renderer,tile,packet}=create();
 const a=tile(0),b=tile(1);
 renderer.reserveWarmTiles([a.id+'@mid',b.id+'@mid']);
 renderer.seed(a,'mid',packet('a',true));
 let status=renderer.warmTileStatus();
 assert.equal(status.preview,1);
 assert.equal(status.missing,1);
 assert.equal(status.ready,0);
 assert.deepEqual([...status.firstIncomplete],[a.id+'@mid',b.id+'@mid']);
 renderer.reserveWarmTiles(null);
});
test('reservation validates bounded level-qualified IDs and never authorizes unknown tiles',()=>{
 const {renderer}=create();
 assert.throws(()=>renderer.reserveWarmTiles(['../../invalid@mid']),/Invalid/);
 assert.throws(()=>renderer.reserveWarmTiles(Array.from({length:81},(_,i)=>i+',0@mid')),/Invalid/);
 assert.throws(()=>renderer.reserveWarmTiles(['0,0@other']),/Invalid/);
 assert.equal(renderer.warmTileStatus().active,false);
});
test('camera tile geometry matches the compositor footprint and respects fog restrictions',()=>{
 const a=app.indexOf('function cameraTilesAtPose('),
  b=app.indexOf('function cameraSourcesAtPose(',a);
 assert.ok(a>0&&b>a);
 const queries=[];
 const fake={VedrasChunks:{visible:(bounds)=>{
  queries.push(bounds);
  return [{id:'0,0',x:0,y:0,size:512},
   {id:'1,0',x:512,y:0,size:512}];
 }}};
 const fn=new Function('W','H','PROJECT_Y','window','worldCells','visibleFogTiles',
  app.slice(a,b)+'\nreturn cameraTilesAtPose;')(
  640,400,.85,fake,[{q:0,r:0}],new Set(['1,0']));
 assert.deepEqual(fn({panX:0,panY:0,zoom:.7}).map(t=>t.id),['1,0']);
 fn({panX:90,panY:20,zoom:.7});
 assert.equal(queries.length,2);
 assert.ok(queries[1].x<queries[0].x,'positive pan shifts sampled world bounds left');
 assert.equal(queries[0].width,(640+192)/.7);
});
test('sprite halo includes authored neighbour beyond visible-camera point bounds',()=>{
 const a=app.indexOf('function cameraSourcesAtPose('),
  b=app.indexOf('function configureCameraWarmFootprint(',a);
 assert.ok(a>0&&b>a);
 const get=new Function('W','H','PROJECT_Y','HEX','R','assets',
  'worldCells','axialPos','imageForBiome','state','cameraTilesAtPose',
  app.slice(a,b)+'\nreturn cameraSourcesAtPose;')(
   640,400,.85,256,148,[],[{q:0,r:0}],
   q=>({x:256*q,y:0}),()=>null,
   {natureInstances:[{q:5,r:0,dx:0,dy:0,assetPath:'neighbour.png'}],
    mountainInstances:[],hexObject:{},hexShadow:{}},
   ()=>[{id:'1,0',x:512,y:0,size:512}]);
 const paths=get({panX:0,panY:0,zoom:.7});
 assert.ok(paths.has('neighbour.png'),
  'tile core +320 overhang includes x=1280 even if visible camera ends before it');
});
test('audit prewarm rejects an overbudget union despite individually READY stations',async()=>{
 const a=audit.indexOf('async function prepareCameraTrajectory('),
  b=audit.indexOf('\n// Runs in the actual editor',a);
 assert.ok(a>0&&b>a);
 const prepare=new Function('settle',audit.slice(a,b)+
  '\nreturn prepareCameraTrajectory;')(async()=>({ready:true,reasons:[],waitMs:2}));
 const calls=[],v={state:{zoom:.7,panX:0,panY:0},
  configureCameraWarmFootprint:p=>{calls.push({kind:'configured',poses:p});
   return {active:true,missing:0,paths:150,tiles:12};},
  async prepareCameraWarmImages(){return {ready:true,remaining:0}},
  activateTileCamera(){return true},requestDraw(){},
  primeCameraWarmChunks(){return {terrain:0,road:0,river:0,shore:0}},
  warmWorldTileStatus(){return {active:true,keys:12,ready:12,missing:0,
   stale:0,preview:0,revisionMismatch:0,overBudgetPixels:100,overTileLimit:0}},
  pruneIdleImagePool(){return {evicted:0}},
  assetMemory(){return {queued:0,active:0,overLimitBytes:0,
   protectedBytes:300,limitBytes:500,decodedBytes:400,evicted:0}}
 };
 const c={eval:async expression=>new Function('window',
  'return '+expression)({VedrasAssetLabor:v})};
 const result=await prepare(c,'pan',3000,90);
 assert.equal(result.ready,false);
 assert.equal(result.world.overBudgetPixels,100);
 assert.ok(calls[0].poses.length>90);
 assert.ok(calls[0].poses.some(p=>Math.abs(p.panX-90)<1e-6));
 assert.ok(calls[0].poses.some(p=>Math.abs(p.panX+90)<1e-6));
 assert.ok(result.stations>=16);
 assert.equal(result.passes.length,2);
});
test('audit does not report warm until every reserved WorldTile is exact',async()=>{
 const a=audit.indexOf('async function prepareCameraTrajectory('),
  b=audit.indexOf('\n// Runs in the actual editor',a);
 const prepare=new Function('settle',audit.slice(a,b)+
  '\nreturn prepareCameraTrajectory;')(async()=>({ready:true,reasons:[],waitMs:1}));
 let readyCount=11;
 const v={state:{zoom:.7,panX:0,panY:0},
  configureCameraWarmFootprint:()=>({active:true,missing:0}),
  async prepareCameraWarmImages(){return {ready:true}},
  activateTileCamera(){},requestDraw(){},primeCameraWarmChunks(){},
  warmWorldTileStatus:()=>({active:true,keys:12,ready:readyCount,missing:12-readyCount,
   stale:0,preview:0,revisionMismatch:0,overBudgetPixels:0,overTileLimit:0}),
  pruneIdleImagePool:()=>({evicted:0}),
  assetMemory:()=>({queued:0,active:0,protectedBytes:10,limitBytes:100,
   overLimitBytes:0,decodedBytes:10,evicted:0})};
 const c={eval:async expression=>new Function('window',
  'return '+expression)({VedrasAssetLabor:v})};
 const failed=await prepare(c,'zoom',3000,60);
 assert.equal(failed.ready,false);
 readyCount=12;
 const passed=await prepare(c,'zoom',3000,60);
 assert.equal(passed.ready,true);
 assert.ok(passed.world.keys>0);
});
test('normal gameplay only enables image-request filtering during explicit audit lease',()=>{
 assert.match(app,/if\(a&&\(!warmCameraFootprint\|\|warmCameraFootprint\.has\(a\.path\)\)\)/);
 assert.match(app,/primeCameraWarmChunks,\s*warmWorldTileStatus/);
 assert.match(audit,/const quiet=prewarm\.ready&&gate\.ready&&cameraCondition\(start\)/);
 assert.match(audit,/const valid=quiet&&cameraCondition\(end\)/);
 assert.match(app,/worldTiles\?\.reserveWarmTiles\(null\)/);
});

test('source content change makes complete-looking reserved tile NOT warm',()=>{
 const window={};
 vm.runInNewContext(worldSrc,{window,console,Date,Promise,
  setTimeout,clearTimeout,performance,AbortController});
 const g={save(){},restore(){},setTransform(){},clearRect(){},fillRect(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},fill(){},drawImage(){}};
 let authoritative='old-road';
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:1,height:1,getContext:()=>g},source:null,
  maxPixels:40000,requireScenery:true,lodSelector:()=> 'mid',
  sourceRevision:()=>authoritative
 });
 const tile={id:'-1,-2',x:-512,y:-1024,size:512,visibility:'visible'};
 renderer.reserveWarmTiles([tile.id+'@mid']);
 renderer.seed(tile,'mid',{complete:true,revision:'old-road',layers:[
  {layer:'ground',image:{width:60,height:60}},
  {layer:'scenery',image:{width:60,height:60}}]});
 assert.equal(renderer.warmTileStatus().ready,1);
 authoritative='new-road';
 const result=renderer.warmTileStatus();
 assert.equal(result.ready,0);
 assert.equal(result.revisionMismatch,1);
 assert.equal(result.changedRevisions[0].to,'new-road');
 renderer.reserveWarmTiles(null);
});

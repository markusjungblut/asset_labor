'use strict';
/* node --test tests/test_sprite_recovery_cloud_background_v0226_20261027.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=n=>fs.readFileSync(path.join(__dirname,'..',n),'utf8');

test('decoded image completion flushes sprite cache without undeclared variables',()=>{
 const app=read('app.js'),start=app.indexOf('onReady:a=>{'),
  end=app.indexOf('\n }\n});',start);
 assert.ok(start>=0&&end>start);
 const expr=app.slice(start+8,end+3);
 let flush=null,invalidations=0,draws=0;
 const sandbox={
  inspectTerrain:()=>({}),isTerrain:()=>false,state:{
   relief:{enabled:false},mountainInstances:[]},
  frameMemo:{invalidate(){}},backgroundScene:{clear(){}},
  imagePoolPriming:false,spriteAssetBatchDirty:false,assetReadyTimer:null,
  clearTimeout(){},setTimeout(cb){flush=cb;return 7;},
  imagePool:{report:()=>({queued:0,active:0})},
  invalidateSpriteLayout(){invalidations++},requestDraw(){draws++},
  window:{dispatchEvent(){}},Event:class{constructor(name){this.type=name}},
  performance:{now:()=>1200}
 };
 vm.runInNewContext("'use strict';("+expr+")({category:'nature'});",sandbox);
 assert.equal(typeof flush,'function','decode callback must schedule a redraw');
 assert.doesNotThrow(()=>flush(),'the settled timer must not throw ReferenceError');
 assert.equal(invalidations,1);
 assert.equal(draws,1);
});
test('visible authored Nature sources are requested even when sprite layout is empty',()=>{
 const app=read('app.js'),start=app.indexOf('function primeVisibleSpriteAssets(){'),
  end=app.indexOf('\nfunction drawMapObjects(',start);
 assert.ok(start>0&&end>start);
 const asset={path:'nature/pine_01.png',img:null,url:'/assets/nature/pine_01.png'};
 const calls=[],env={
  state:{objects:true,view:'map',
   natureInstances:[{q:0,r:0,dx:0,dy:0,assetPath:asset.path}],
   mountainInstances:[],hexObject:{}},
  W:1000,H:700,imagePoolPriming:false,
  fromScreen:(x,y)=>({x:x-500,y:y-350}),
  axialPos:(q,r)=>({x:q*256,y:r*222}),
  imagePool:{ensure:(a,p)=>calls.push([a.path,p])},
  assetByPath:new Map([[asset.path,asset]]),
  window:{}
 };
 vm.runInNewContext(app.slice(start,end)+';primeVisibleSpriteAssets();',env);
 assert.equal(calls.length,1,'one decoded source request for visible instance');
 assert.equal(env.window.__vedrasSpriteDemand.authored,1);
 assert.equal(env.window.__vedrasSpriteDemand.requested,1);
 asset.img={naturalWidth:100};
 calls.length=0;
 vm.runInNewContext(app.slice(start,end)+';primeVisibleSpriteAssets();',env);
 assert.equal(calls.length,0,'decoded graphics should not be requested again');
});
test('clouds paint directly on screen, not inside terrain snapshot',()=>{
 const app=read('app.js');
 const groundStart=app.indexOf('function drawGround(){'),
  groundEnd=app.indexOf('\nfunction ',groundStart+8);
 assert.ok(groundStart>0&&groundEnd>groundStart);
 assert.doesNotMatch(app.slice(groundStart,groundEnd),/drawCloudBackground/);
 const start=app.indexOf('function draw(){');
 const clear=app.indexOf('ctx.clearRect(0,0,W,H)',start);
 const cloud=app.indexOf('worldTiles.drawCloudBackground(ctx',start);
 const raster=app.indexOf('backgroundScene.paint({',start);
 assert.ok(clear>start&&clear<cloud&&cloud<raster,
  'cloud underlay must be drawn before the transparent cached terrain image');
});
test('scenery and mountain shadows clip to known hex footprints',()=>{
 const app=read('app.js'),start=app.indexOf('function draw(){'),
  clip=app.indexOf('ctx.clip();clippedWorld=true',start),
  scenery=app.indexOf('staticScenery.paint({',start),
  unclip=app.indexOf('if(clippedWorld)ctx.restore()',scenery),
  fog=app.indexOf('worldTiles.drawCloudFrontier(ctx,view,frontier.edges)',scenery);
 assert.ok(start>0&&clip>start&&scenery>clip&&unclip>scenery&&fog>unclip,
  'draw all shadows below opaque authored cloud frontier');
 assert.match(read('world-tile-streamer.js'),/function drawCloudFrontier\(context,view,edges\)/);
});
test('performance status differentiates hidden object toggle from missing paths',()=>{
 const app=read('app.js');
 assert.match(app,/Nature sichtbar /);
 assert.match(app,/Sprite-Bilder /);
 assert.match(app,/Pfade fehlen /);
 assert.match(app,/Objekte ausgeblendet/);
});
test('runtime versions match v0.22.6 and include updated cloud compositor',()=>{
 const html=read('index.html');
 assert.match(html,/Asset-Labor v0\.22\.6/);
 assert.match(html,/app\.js\?v=0\.55\.6/);
 assert.match(html,/world-tile-streamer\.js\?v=0\.22\.6/);
 assert.match(read('server.py'),/VERSION = '0\.22\.6'/);
});

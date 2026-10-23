'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=file=>fs.readFileSync(path.join(root,file),'utf8');

test('onReady does not reset every landscape chunk for each arriving image',()=>{
 const app=source('app.js');
 const block=app.slice(app.indexOf(' onReady:a=>{'),app.indexOf('\n});',app.indexOf(' onReady:a=>{')));
 assert.ok(block.includes('terrainRasterCache.signature=null'));
 assert.doesNotMatch(block,/invalidateTerrain\(/);
 assert.match(block,/assetReadyTimer=setTimeout\(/);
 assert.match(app,/asset\?\.imageRevision\|\|0/);
 assert.match(app,/terrainRasterCache\.tileStamps/);
 assert.match(app,/imagePool\.protect\(pinned\)/);
});

test('old v0.14.1 GPU setting is migrated to safe Canvas unless explicitly enabled',()=>{
 const app=source('app.js'),html=source('index.html');
 assert.match(app,/gpuTerrain:false,gpuTerrainUserEnabled:false/);
 assert.match(app,/state\.gpuTerrain=state\.gpuTerrain===true&&state\.gpuTerrainUserEnabled===true/);
 assert.match(app,/state\.gpuTerrainUserEnabled=e\.target\.checked/);
 assert.match(html,/Asset-Labor v0\.(?:14\.[2-9]|15\.\d+)/);
});

function poolHarness(){
 const queue=[],clock={now:1000};
 class Img{
  constructor(){this.naturalWidth=1024;this.naturalHeight=1024;}
  set src(x){this._src=x;queue.push(this);}
  get src(){return this._src;}
 }
 const sandbox={window:{},Image:Img,performance:{now:()=>clock.now}};
 vm.runInNewContext(source('asset-image-pool.js'),sandbox);
 return {queue,clock,Pool:sandbox.window.VedrasImagePool,
  finish:()=>{const image=queue.shift();assert.ok(image);image.onload();}};
}
const entry=i=>({category:'nature',path:'nature_'+i+'.png',url:'/sprite_'+i+'.png'});
test('visible sprites are protected from budget eviction and older offscreen sprites are released',async()=>{
 const {Pool,queue,clock,finish}=poolHarness();
 const pool=Pool.create({maxBytes:8*1024*1024,parallel:4,protectMs:100});
 const a=entry('visible'),b=entry('old'),c=entry('later');
 pool.protect([a.path]);
 const ready=Promise.all([pool.ensure(a),pool.ensure(b)]);finish();finish();await ready;
 clock.now+=500;
 const request=pool.ensure(c);finish();await request;pool.prune();
 assert.ok(a.img?.naturalWidth===1024,'selected visible sprite is retained');
 assert.equal(b.img,null,'unused sprite is evicted first');
 assert.ok(pool.report().evicted>0);
});

test('image generations are monotonically raised after asset re-decoding',async()=>{
 const {Pool,clock,finish}=poolHarness();
 const pool=Pool.create({parallel:2,maxBytes:4*1024*1024,protectMs:0});
 const a=entry('reload'),b=entry('throwaway');
 const first=pool.ensure(a);finish();await first;
 assert.equal(a.imageRevision,1);
 const next=pool.ensure(b);finish();await next;
 clock.now+=50;pool.prune();
 assert.equal(a.img,null);
 const reloaded=pool.ensure(a);finish();await reloaded;
 assert.equal(a.imageRevision,2);
});

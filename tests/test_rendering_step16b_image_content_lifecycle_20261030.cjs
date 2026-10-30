'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const poolCode=fs.readFileSync(path.join(root,'asset-image-pool.js'),'utf8');
const reuseCode=fs.readFileSync(path.join(root,'world-tile-ground-reuse.js'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');

function poolHarness({terrain=768,sprite=768,bytes=64*1048576}={}){
 const ready=[],events=[];
 class FakeImage {
  constructor(){this.naturalWidth=2048;this.naturalHeight=1024;}
  set src(value){
   this._src=value;
   queueMicrotask(()=>this.onload?.());
  }
  get src(){return this._src;}
 }
 const window={VedrasStep15Trace:{record:(type,detail)=>events.push({type,detail})}};
 const document={createElement:()=>({
  width:0,height:0,
  getContext:()=>({imageSmoothingEnabled:false,imageSmoothingQuality:'low',drawImage(){}})
 })};
 vm.runInNewContext(poolCode,{window,document,Image:FakeImage,
  performance,Date,Promise,console,Math,Set,Map});
 const pool=window.VedrasImagePool.create({
  maxBytes:bytes,protectMs:0,parallel:1,
  previewTerrainPx:terrain,previewSpritePx:sprite,
  onReady:(asset,details)=>ready.push({asset,details})
 });
 const asset={path:'assets/terrain/grassland_01.png',
  url:'./assets/terrain/grassland_01.png?v=1',mtime:'1',
  category:'terrain',img:null};
 return {pool,asset,ready,events};
}
const settle=async()=>{for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));};

test('first missing texture has a semantic revision and triggers an actual update',async()=>{
 const {pool,asset,ready,events}=poolHarness();
 await pool.ensure(asset);await settle();
 assert.equal(asset.imageRevision,1);
 assert.equal(ready.length,1);
 assert.equal(ready[0].details.kind,'first-decode');
 assert.equal(ready[0].details.contentChanged,true);
 assert.equal(ready[0].details.decodedWidth,768);
 assert.equal(events.filter(e=>e.type==='asset.pool-ready').length,1);
});
test('eviction then identical re-decode does not change content or revision',async()=>{
 const {pool,asset,ready,events}=poolHarness();
 await pool.ensure(asset);
 const before=asset.imageRevision,identity=asset.imageContentKey;
 pool.prune(true);
 assert.equal(asset.img,null,'the original asset must actually be evicted');
 await pool.ensure(asset);await settle();
 assert.equal(ready.at(-1).details.kind,'repeat-decode');
 assert.equal(ready.at(-1).details.contentChanged,false);
 assert.equal(asset.imageRevision,before);
 assert.equal(asset.imageContentKey,identity);
 assert.equal(pool.report().identicalRedecodes,1);
 assert.ok(events.some(e=>e.type==='asset.pool-evict'&&
  e.detail.path===asset.path));
});
test('versioned source URL/mtime change remains a real ground content change',async()=>{
 const {pool,asset,ready}=poolHarness();
 await pool.ensure(asset);
 pool.prune(true);
 asset.url='./assets/terrain/grassland_01.png?v=2';
 asset.mtime='2';
 await pool.ensure(asset);await settle();
 assert.equal(ready.at(-1).details.kind,'source-change');
 assert.equal(ready.at(-1).details.contentChanged,true);
 assert.equal(asset.imageRevision,2);
 assert.equal(pool.report().sourceChanges,1);
});
test('higher resolution preview promotion is not confused with identical decode',async()=>{
 const {pool,asset,ready}=poolHarness({terrain:512,bytes:64*1048576});
 await pool.ensure(asset);
 assert.equal(ready.at(-1).details.decodedWidth,512);
 pool.protect(new Set([asset.path]));
 pool.setPreviewLimits({terrainPx:1024,spritePx:768});
 await pool.ensure(asset);
 await settle();
 assert.equal(ready.at(-1).details.kind,'quality-upgrade');
 assert.equal(ready.at(-1).details.decodedWidth,1024);
 assert.equal(ready.at(-1).details.previousRevision,1);
 assert.equal(asset.imageRevision,2);
 pool.protect(new Set());
 pool.prune(true);
 await pool.ensure(asset);
 assert.equal(ready.at(-1).details.kind,'repeat-decode');
 assert.equal(asset.imageRevision,2);
});
test('protected image does not get evicted by forced prune',async()=>{
 const {pool,asset}=poolHarness();
 await pool.ensure(asset);
 pool.protect(new Set([asset.path]));
 pool.prune(true);
 assert.ok(asset.img?.naturalWidth);
});
test('ground reuse retains distant LODs and purges local LODs only',()=>{
 const window={};
 vm.runInNewContext(reuseCode,{window,Map,Set,Math});
 const cache=window.VedrasGroundTileReuse.create({maxBytes:32*1048576,maxEntries:20});
 const a={id:'0,0'},b={id:'6,4'};
 const img={width:80,height:80};
 cache.put(a,'mid','ground-A-v1',img);
 cache.put(a,'near','ground-A-v1',img);
 cache.put(b,'mid','ground-B-v1',img);
 assert.equal(cache.invalidateTiles(new Set([a.id])),2);
 assert.equal(cache.get(a,'mid','ground-A-v1'),null);
 assert.equal(cache.get(a,'near','ground-A-v1'),null);
 assert.equal(cache.get(b,'mid','ground-B-v1'),img);
 assert.equal(cache.stats().invalidated,2);
 assert.equal(cache.stats().entries,1);
});
test('global ground flush still blocks previously cached sources',()=>{
 const window={};vm.runInNewContext(reuseCode,{window,Map,Set,Math});
 const cache=window.VedrasGroundTileReuse.create();
 const t={id:'0,0'},img={width:50,height:50};
 cache.put(t,'mid','terrain-1',img);
 cache.clear();
 assert.equal(cache.get(t,'mid','terrain-1'),null);
});
test('app short circuits only unchanged re-decodes, not first loads or upgrades',()=>{
 const first=app.indexOf("if(decode?.kind==='repeat-decode')");
 const affect=app.indexOf('const affectsGround=',first);
 assert.ok(first>0&&affect>first);
 assert.match(app.slice(first,affect),/requestDraw\(\)/);
 assert.match(app.slice(first,affect),/vedras:asset-image-loaded/);
 assert.match(app.slice(first,affect),/return;/);
 assert.match(app,/onReady:\(a,decode\)=>/);
});
test('ground content key does not contain unrelated frame memo revision',()=>{
 const start=app.indexOf('function groundTileContentKey(');
 const end=app.indexOf('function tileSemanticSignature(',start);
 assert.ok(start>0&&end>start);
 const token=app.slice(start,end);
 assert.doesNotMatch(token,/frameMemo\.stats\(\)\.revision/);
 assert.match(token,/String\(coreVersion\)/);
 assert.match(token,/state\.materialScales/);
 assert.match(token,/state\.edgeBlend/);
});
test('ground asset callback uses selective reuse invalidation with global fallback',()=>{
 assert.match(app,/const reuseIds=changed===null\?null:changedGroundTileIds\(changed\)/);
 assert.match(app,/if\(reuseIds===null\)groundTileReuse\?\.clear\(\);/);
 assert.match(app,/else groundTileReuse\?\.invalidateTiles\(reuseIds\)/);
 assert.match(app,/if\(groundIds===null\)worldTiles\?\.invalidate\('image-ready-ground'\);/);
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
test('once-failed required PNG is not permanently cached as absent',async()=>{
 let time=0,tries=0;
 class ImageStub{
  constructor(){this.naturalWidth=256;this.naturalHeight=256;}
  set src(value){
   this._src=value;
   tries++;
   if(tries===1)queueMicrotask(()=>this.onerror?.(Error('transient')));
   else queueMicrotask(()=>this.onload?.());
  }
 }
 const win={};
 vm.runInNewContext(read('asset-image-pool.js'),{
  window:win,Image:ImageStub,performance:{now:()=>time},Promise,
  Math,Date,Set,Map,console
 },{filename:'asset-image-pool.js'});
 const pool=win.VedrasImagePool.create({parallel:1});
 const asset={path:'terrain/grass.png',url:'/assets/grass.png',
  category:'terrain',mtime:100,img:null};
 assert.equal(await pool.ensure(asset),null);
 assert.equal(tries,1);
 assert.equal(await pool.ensure(asset),null,
  'cooldown avoids an unbounded retry loop');
 time=2000;
 assert.ok(await pool.ensure(asset,12));
 assert.equal(tries,2);
 assert.equal(pool.report().retries,1);
 assert.equal(pool.report().recoveredFailures,1);
 assert.ok(asset.img?.naturalWidth);
});
test('4x export isolates archive and asset pixel provenance from historical 4x maps',()=>{
 const app=read('app.js');
 assert.match(app,/game-map-export-renderer-v5-stable-original-materials/);
 assert.match(app,/function freeze4xGroundSources\(/);
 assert.match(app,/await freeze4xGroundSources\(\)/);
 assert.match(app,/imagePool\.protect\(new Set\(sources\.map/);
 assert.match(app,/const restore=await imagePool\.originals\(sources\)/);
 assert.match(app,/restoreFrozenSources=frozenSources\.restore/);
 assert.match(app,/if\(restoreFrozenSources\)\{/);
 assert.match(app,/terrain-static-v4-source-dimensions/);
 assert.match(app,/a\?\.img\?\.naturalWidth\|\|0,a\?\.img\?\.naturalHeight\|\|0/);
 assert.match(app,/asset\?\.img\?\.naturalWidth\|\|0/);
 assert.match(app,/invalidateTerrain\('all'\)/);
});

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
 assert.match(app,/game-map-export-renderer-v7-ground-wrap-v1/);
 assert.match(app,/function freeze4xGroundSources\(/);
 assert.match(app,/await freeze4xGroundSources\(\)/);
 assert.match(app,/imagePool\.protect\(new Set\(sources\.map/);
 assert.match(app,/const restore=await imagePool\.originals\(sources\)/);
 assert.match(app,/restoreFrozenSources=frozenSources\.restore/);
 assert.match(app,/if\(restoreFrozenSources\)\{/);
 assert.match(app,/terrain-static-v5-ground-wrap-v1/);
 assert.match(app,/a\?\.img\?\.naturalWidth\|\|0,a\?\.img\?\.naturalHeight\|\|0/);
 assert.match(app,/asset\?\.img\?\.naturalWidth\|\|0/);
 assert.match(app,/invalidateTerrain\('all'\)/);
});


test('terrain checker accepts dark opaque forest details but rejects a uniform black outside',()=>{
 const source=read('app.js'),
  start=source.indexOf('function inspectTerrain(asset){'),
  end=source.indexOf('\nfunction hexPath(',start);
 assert.ok(start>=0&&end>start,'real editor terrain checker found');
 const checkCode=source.slice(start,end)+'\nwindow.inspectTerrain=inspectTerrain;';
 const buffer=(color)=>{
  const data=new Uint8ClampedArray(40*40*4);
  for(let i=0;i<data.length;i+=4)data.set(color,i);
  return data;
 };
 const paint=(data,x,y,color)=>data.set(color,(y*40+x)*4);
 const inspect=(data,extra={})=>{
  const window={};
  const document={createElement:()=>({getContext:()=>({
   drawImage(){},getImageData:()=>({data}),
  })})};
  vm.runInNewContext(checkCode,{window,document,isTerrain:a=>a.category==='terrain'});
  return window.inspectTerrain({category:'terrain',img:{
   naturalWidth:1254,naturalHeight:1254,
  },...extra});
 };
 // Forest detail can be almost black at five old sampled positions.
 const forest=buffer([69,78,50,255]);
 for(const [x,y] of [[2,2],[37,2],[2,37],[37,37],[3,20]])
  paint(forest,x,y,[5,9,6,255]);
 assert.equal(inspect(forest).ok,true,
  'isolated near-black forest shadows must not abort the 4x export');
 // A genuine opaque black exterior forms a mostly uniform outer band.
 const framed=buffer([113,89,54,255]);
 for(let y=0;y<40;y++)for(let x=0;x<40;x++)
  if(x<4||x>=36||y<4||y>=36)paint(framed,x,y,[0,0,0,255]);
 const rejected=inspect(framed);
 assert.equal(rejected.ok,false);
 assert.match(rejected.reason,/schwarzer Außenhintergrund/i);
 // Entirely dark opaque materials are not evidence of a separate exterior.
 assert.equal(inspect(buffer([0,0,0,255])).ok,true);
 const alpha=buffer([75,85,60,255]);
 paint(alpha,2,2,[0,0,0,0]);paint(alpha,37,2,[0,0,0,0]);
 assert.equal(inspect(alpha).ok,false);
 assert.match(inspect(alpha).reason,/transparente Außenbereiche/i);
 assert.equal(inspect(forest,{meta:{assetType:'legacy_hex_block'}}).ok,false);
});

'use strict';
// Step 11: bounded 4x interactive DPR, lazy preview promotions, export parity.
// Run: node --test tests/test_interactive_quality_step11_20261028.cjs
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const flush=async()=>{for(let i=0;i<15;i++)await Promise.resolve();};
function policy(){
 const window={};
 vm.runInNewContext(read('render-quality-policy.js'),{window});
 return window.VedrasRenderQuality;
}
function pool({failUpgrade=false}={}){
 let loads=0;const decoded=[];
 class Image{
  constructor(){this.naturalWidth=0;this.naturalHeight=0;}
  set src(src){
   loads++;
   const ordinal=loads;
   Promise.resolve().then(()=>{
    if(failUpgrade&&ordinal===2){this.onerror?.();return;}
    this.naturalWidth=4096;this.naturalHeight=4096;
    this.onload?.();
   });
  }
 }
 const document={createElement:()=>({width:0,height:0,
  getContext:()=>({imageSmoothingEnabled:false,imageSmoothingQuality:'low',
   drawImage:(...args)=>decoded.push(args)})})};
 const window={};
 vm.runInNewContext(read('asset-image-pool.js'),{
  window,document,Image,performance:{now:()=>123}
 });
 let callbacks=0;
 const pool=window.VedrasImagePool.create({
  parallel:2,maxBytes:192*1024*1024,onReady:()=>callbacks++
 });
 return {pool,decoded,loads:()=>loads,callbacks:()=>callbacks};
}
test('4x is actually selected for a fitting viewport, including dense scenery',()=>{
 const q=policy();
 const p=q.resolve({quality:'4',width:800,height:450,
  natureCount:1000,objects:true});
 assert.equal(p.requestedDpr,4);
 assert.equal(p.effectiveDpr,4);
 assert.equal(p.limiter,'none');
 assert.equal(p.canvasPixels,800*450*16);
});
test('large dense maps are pixel-bound, not arbitrarily capped at 1.5x',()=>{
 const q=policy();
 const p=q.resolve({quality:'4',width:1400,height:900,natureCount:900});
 assert.equal(p.dense,true);
 assert.equal(p.budgetPixels,8000000);
 assert.ok(p.effectiveDpr>1.5&&p.effectiveDpr<3);
 assert.ok(p.canvasPixels<=8000000+5000,'rounding may add a few pixels');
 assert.equal(p.limiter,'pixel-budget');
});
test('a large ordinary viewport is capped to the 14 megapixel profile',()=>{
 const p=policy().resolve({quality:'4',width:1100,height:1000,natureCount:20});
 assert.equal(p.budgetPixels,14000000);
 assert.ok(p.effectiveDpr>3&&p.effectiveDpr<4);
 assert.ok(p.canvasPixels<=14000000+5000);
});
test('4096px physical dimension is never exceeded',()=>{
 const p=policy().resolve({quality:'4',width:1200,height:300});
 assert.equal(p.effectiveDpr,4096/1200);
 assert.equal(p.limiter,'canvas-dimensions');
 assert.ok(Math.round(p.effectiveDpr*1200)<=4096);
});
test('extreme display dimensions cannot evade physical caps by a 0.65x floor',()=>{
 const p=policy().resolve({quality:'4',width:9000,height:1000});
 assert.ok(p.effectiveDpr<.65);
 assert.ok(p.canvasPixels<=p.budgetPixels+10000);
 assert.ok(p.effectiveDpr*9000<=4096);
});
test('fast and auto profiles preserve their former requested DPR ceilings',()=>{
 const q=policy();
 const f=q.resolve({quality:'fast',width:960,height:600,devicePixelRatio:3});
 const a=q.resolve({quality:'auto',width:960,height:600,devicePixelRatio:2});
 assert.equal(f.requestedDpr,.8);
 assert.equal(a.requestedDpr,1.35);
 assert.equal(f.terrainPx,512);assert.equal(a.spritePx,1024);
});
test('manually selected higher profiles promote image previews selectively',()=>{
 const q=policy();
 assert.equal(q.resolve({quality:'2',width:800,height:450}).spritePx,1536);
 assert.equal(q.resolve({quality:'3',width:800,height:450}).spritePx,2048);
 assert.equal(q.resolve({quality:'4',width:800,height:450}).terrainPx,1536);
 assert.equal(q.resolve({quality:'4',width:800,height:450}).spritePx,2048);
});
test('final image export keeps the original 2x DPR and pixel budget',()=>{
 const q=policy();
 const p=q.resolve({quality:'4',width:1100,height:700,
  natureCount:2000,final:true});
 assert.equal(p.requestedDpr,2);
 assert.equal(p.effectiveDpr,2);
 assert.equal(p.budgetPixels,18000000);
 const app=read('app.js');
 assert.match(app,/finalRendering\?1\.5/);
 assert.match(app,/finalRendering=true;resize\(\)/);
});
test('pool upgrades an already loaded sprite only on its next request',async()=>{
 const h=pool(),asset={path:'assets/nature/tree.png',
  url:'assets/nature/tree.png',category:'nature'};
 const small=await h.pool.ensure(asset,10);await flush();
 assert.equal(small.naturalWidth,1024);
 assert.equal(h.loads(),1);
 h.pool.setPreviewLimits({terrainPx:1536,spritePx:2048});
 assert.equal(h.loads(),1,'quality switch must not bulk-refetch images');
 assert.equal((await h.pool.ensure(asset,11)).naturalWidth,1024);
 await flush();
 assert.equal(h.loads(),2);
 assert.equal(asset.img.naturalWidth,2048);
 assert.equal(h.callbacks(),2);
 assert.equal(h.pool.report().promoted,1);
 assert.equal(h.pool.report().decodedBytes,2048*2048*4,
  'old preview must be subtracted rather than accumulated');
 assert.equal((await h.pool.ensure(asset,11)).naturalWidth,2048);
 assert.equal(h.loads(),2,'completed upgrade must not repeat');
});
test('failed image promotion preserves the usable old bitmap',async()=>{
 const h=pool({failUpgrade:true}),asset={
  path:'assets/nature/oak.png',url:'oak.png',category:'nature'};
 const first=await h.pool.ensure(asset);await flush();
 h.pool.setPreviewLimits({spritePx:2048});
 assert.equal((await h.pool.ensure(asset)).naturalWidth,1024);
 await flush();
 assert.equal(asset.img,first);
 assert.equal(asset.img.naturalWidth,1024);
 assert.equal(h.pool.report().promotionFailures,1);
 assert.equal((await h.pool.ensure(asset)).naturalWidth,1024);
 assert.equal(h.loads(),2);
});
test('source preview upgrades never force a full pool eviction',async()=>{
 const h=pool(),asset={path:'assets/terrain/soil.png',
  url:'soil.png',category:'terrain'};
 const image=await h.pool.ensure(asset);await flush();
 h.pool.setPreviewLimits({terrainPx:1536});
 assert.equal(h.pool.report().resident,1);
 assert.equal(asset.img,image);
 assert.equal((await h.pool.ensure(asset)).naturalWidth,512);
 await flush();
 assert.equal(asset.img.naturalWidth,1536);
 assert.equal(h.pool.report().resident,1);
});
test('editor and fast camera both use the same bounded effective DPR',()=>{
 const app=read('app.js'),html=read('index.html');
 assert.match(app,/function fastView\(\)\{return \{width:W,height:H,\s*\/\//);
 assert.match(app,/dpr:state\.dpr,zoom:state\.zoom/);
 assert.match(app,/const policy=renderQualityProfile\(\)/);
 assert.match(app,/imagePool\.setPreviewLimits/);
 assert.match(app,/qualityStats:\(\)=>/);
 assert.match(html,/id="qualityStats"/);
 assert.match(html,/render-quality-policy\.js\?v=0\.1\.0&amp;step11=20261028/);
 assert.match(html,/asset-image-pool\.js\?v=0\.3\.1&amp;step11=20261028/);
});
test('retained layers remain hard pixel-bounded rather than disabling 4x',()=>{
 const app=read('app.js');
 assert.match(app,/padding:440,maxPixels:17000000,minPadding:24/);
 assert.match(app,/padding:220,maxPixels:17000000,minPadding:24/);
 assert.match(read('static-object-layer.js'),/const fits=pad=>/);
});

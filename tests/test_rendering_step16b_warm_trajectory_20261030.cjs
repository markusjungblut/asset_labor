'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const poolCode=fs.readFileSync(path.join(root,'asset-image-pool.js'),'utf8');
const audit=fs.readFileSync(path.join(root,'scripts/rendering-step16a-audit.mjs'),'utf8');
const MiB=1048576;
function poolFixture({maxBytes=2*MiB}={}){
 const window={VedrasStep15Trace:{record(){}}};
 class FakeImage {
  constructor(){this.naturalWidth=1024;this.naturalHeight=1024;}
  set src(value){this._src=value;queueMicrotask(()=>this.onload?.());}
  get src(){return this._src;}
 }
 const document={createElement:()=>({width:0,height:0,
  getContext:()=>({drawImage(){},imageSmoothingEnabled:false,
   imageSmoothingQuality:'high'})})};
 vm.runInNewContext(poolCode,{window,Image:FakeImage,document,performance});
 const pool=window.VedrasImagePool.create({
  maxBytes,parallel:1,protectMs:24000,
  previewTerrainPx:512,previewSpritePx:512
 });
 const asset=n=>({path:'terrain_'+n+'.png',url:'/terrain_'+n+'.png?v=1',
  category:'terrain'});
 return {pool,asset};
}
test('idle prune releases young unprotected overbudget images, never the pinned footprint',async()=>{
 const {pool,asset}=poolFixture(),a=asset('a'),b=asset('b'),c=asset('c');
 pool.protect(new Set([a.path]));
 for(const x of [a,b,c])await pool.ensure(x);
 assert.equal(pool.report().decodedBytes,3*MiB);
 assert.equal(pool.report().evicted,0,'normal pruning respects its hot window');
 const result=pool.pruneIdle();
 assert.ok(result.evicted>=1);
 assert.equal(result.overLimitBytes,0);
 assert.ok(a.img?.naturalWidth,'camera footprint asset remains protected');
 const kept=pool.report().resident;
 const next=pool.pruneIdle();
 assert.equal(next.evicted,0,'an idle cleanup is not forced eviction');
 assert.equal(pool.report().resident,kept);
});
test('idle prune reports protected-overbudget condition instead of increasing budget',async()=>{
 const {pool,asset}=poolFixture({maxBytes:MiB}),items=['a','b'].map(asset);
 pool.protect(new Set(items.map(a=>a.path)));
 for(const a of items)await pool.ensure(a);
 const cleaned=pool.pruneIdle();
 assert.equal(cleaned.evicted,0);
 assert.equal(cleaned.overLimitBytes,MiB);
 assert.equal(cleaned.limitBytes,MiB);
 assert.ok(items.every(a=>a.img?.naturalWidth));
});
test('normal gameplay still uses age-protected pruning; special idle mode is opt-in',()=>{
 const begin=poolCode.indexOf('function prune(force=false,headroom=0,ignoreAge=false)');
 assert.ok(begin>0);
 assert.match(poolCode,/function protect\(paths\)\{protectedPaths=new Set\(paths\|\|\[\]\);prune\(\);\}/);
 assert.match(poolCode,/function pruneIdle\(\)\{[\s\S]*?prune\(false,0,true\)/);
 assert.match(poolCode,/return \{ensure,clear,prune,pruneIdle,report/);
 assert.doesNotMatch(poolCode,/maxBytes\s*\+=/);
});
function cameraSources({
 panX=0,panY=0,zoom=.7,
 assets=[{path:'shore.png',category:'shorelines'}],
 worldCells=[{q:0,r:0},{q:8,r:0}],
 nature=[{q:0,r:0,assetPath:'near.png'},
  {q:8,r:0,assetPath:'far.png'}]
}={}){
 const start=app.indexOf('function cameraSourcesAtPose('),
  end=app.indexOf('function configureCameraWarmFootprint(',start);
 assert.ok(start>0&&end>start);
 const create=new Function('W','H','PROJECT_Y','HEX','R','assets',
  'worldCells','axialPos','imageForBiome','state',
  app.slice(start,end)+'\nreturn cameraSourcesAtPose;');
 const scan=create(640,400,.85,256,148,assets,worldCells,
  (q,r)=>({x:256*(q+r/2),y:222*r}),
  cell=>({path:'ground_'+cell.q+'.png'}),
  {natureInstances:nature,mountainInstances:[],hexObject:{}});
 return scan({panX,panY,zoom});
}
test('source footprints include terrain, nature and coast but not distant assets',()=>{
 const near=cameraSources();
 assert.ok(near.has('shore.png'));
 assert.ok(near.has('ground_0.png'));
 assert.ok(near.has('near.png'));
 assert.ok(!near.has('far.png'));
 assert.ok(!near.has('ground_8.png'));
});
test('a shifted pan extremum includes terrain/nature absent from center camera',()=>{
 const near=cameraSources(),far=cameraSources({panX:-1050});
 assert.ok(!near.has('far.png'));
 assert.ok(far.has('far.png'));
 assert.ok(far.has('ground_8.png'));
 const union=new Set([...near,...far]);
 assert.ok(union.has('near.png')&&union.has('far.png'));
});
test('warm image preparation reports insufficient protected budget, never silently READY',async()=>{
 const start=app.indexOf('async function prepareCameraWarmImages('),
  end=app.indexOf('let lastProtectedCameraSignature=',start);
 assert.ok(start>0&&end>start);
 const source=app.slice(start,end);
 const a={path:'test.png',img:{naturalWidth:512,naturalHeight:512},
  previewReduced:false};
 let ensureCalls=0;
 const pool={pruneIdle:()=>({evicted:0}),
  report:()=>({evicted:0,active:0,queued:0,overLimitBytes:MiB,
   protectedBytes:2*MiB,decodedBytes:2*MiB,limitBytes:MiB,
   previewTerrainPx:512,previewSpritePx:512}),
  ensure:()=>{ensureCalls++;return Promise.resolve(a.img)}};
 const make=new Function('warmCameraFootprint','assetByPath','imagePool',
  'performance','setTimeout','window',
  'const cameraWarmImageNeeded=(a,p)=>!a.img?.naturalWidth;\n'+source+
  '\nreturn prepareCameraWarmImages;');
 const prep=make(new Set([a.path]),new Map([[a.path,a]]),pool,
  performance,setTimeout,{});
 const result=await prep(600);
 assert.equal(result.ready,false);
 assert.equal(result.overLimitBytes,MiB);
 assert.equal(result.limitBytes,MiB);
 assert.equal(result.remaining,0);
 assert.equal(ensureCalls,0,'an image already at quality must not reload');
});
test('warm image preparation can complete without new decodes when inside budget',async()=>{
 const start=app.indexOf('async function prepareCameraWarmImages('),
  end=app.indexOf('let lastProtectedCameraSignature=',start);
 const a={path:'ground.png',img:{naturalWidth:512,naturalHeight:512},
  previewReduced:false};
 const pool={pruneIdle:()=>({evicted:0}),
  report:()=>({evicted:5,active:0,queued:0,overLimitBytes:0,
   protectedBytes:MiB,decodedBytes:MiB,limitBytes:2*MiB,
   previewTerrainPx:512,previewSpritePx:512}),ensure:()=>null};
 const prep=new Function('warmCameraFootprint','assetByPath','imagePool',
  'performance','setTimeout','window',
  'const cameraWarmImageNeeded=(a,p)=>!a.img?.naturalWidth;\n'+
   app.slice(start,end)+'\nreturn prepareCameraWarmImages;')(
  new Set([a.path]),new Map([[a.path,a]]),pool,performance,setTimeout,{});
 const result=await prep(600);
 assert.equal(result.ready,true);
 assert.equal(result.remaining,0);
 assert.equal(result.overLimitBytes,0);
});
test('audit visits both pan extrema and zoom peak before measurements',()=>{
 const begin=audit.indexOf('async function prepareCameraTrajectory(');
 const end=audit.indexOf('async function editorCameraProbe(',begin);
 assert.ok(begin>0&&end>begin);
 const block=audit.slice(begin,end);
 assert.match(block,/panX:b\.panX\+90,panY:b\.panY\+20/);
 assert.match(block,/panX:b\.panX-90,panY:b\.panY-20/);
 assert.match(block,/zoom:b\.zoom\+\.11/);
 assert.match(block,/\.\.\.poses\.slice\(1\),poses\[0\]/);
 assert.match(block,/await settle\(c,settleMs\)/);
 assert.match(block,/pruneIdleImagePool\(\)/);
});
test('audit requires successful trajectory preparation AND unchanged quiet gates',()=>{
 assert.match(audit,/const quiet=prewarm\.ready&&gate\.ready&&cameraCondition\(start\)/);
 assert.match(audit,/const valid=quiet&&cameraCondition\(end\)/);
 assert.match(audit,/start\.imagePool\.evicted===previous\.imagePool\.evicted/);
 assert.match(audit,/start\.imagePool\.ready!==end\.imagePool\.ready/);
 assert.match(audit,/start\.imagePool\.evicted!==end\.imagePool\.evicted/);
 assert.match(audit,/trajectory-preparation-incomplete/);
 assert.match(audit,/configureCameraWarmFootprint\(null\)/);
});
test('warm footprint is opt-in and is merged into ordinary camera protection',()=>{
 assert.match(app,/let warmCameraFootprint=null;/);
 assert.match(app,/if\(warmCameraFootprint\)\s+for\(const path of warmCameraFootprint\)pinned\.add\(path\)/);
 assert.match(app,/configureCameraWarmFootprint,prepareCameraWarmImages/);
 assert.match(app,/pruneIdleImagePool:\(\)=>imagePool\.pruneIdle\(\)/);
 assert.match(app,/warmCameraFootprint=null;lastProtectedCameraSignature='';/);
});

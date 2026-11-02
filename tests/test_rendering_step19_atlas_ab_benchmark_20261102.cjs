'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const coreSource=fs.readFileSync(path.join(root,'frozen-map-benchmark-core.js'),'utf8');
const benchSource=fs.readFileSync(path.join(root,'frozen-map-benchmark.js'),'utf8');
const page=fs.readFileSync(path.join(root,'frozen-map-benchmark.html'),'utf8');
const browser={};
vm.runInNewContext(coreSource,{window:browser,console});
const C=browser.VedrasAtlasBenchmarkCore;
const plain=v=>JSON.parse(JSON.stringify(v));
test('selection is deterministic and uses existing adjacent tile pairs only',()=>{
 const ids=['0,0','1,0','10,0','11,0','0,10','0,11','10,10',
  '11,10','20,0','21,0','-10,0','-9,0'];
 const keys=ids.map(id=>'v1-0374527a|near|'+id);
 const first=C.choosePairs(keys,5),again=C.choosePairs([...keys].reverse(),5);
 assert.equal(first.length,5);
 assert.deepEqual(plain(first),plain(again));
 const used=new Set();
 for(const p of first){
  assert.equal(p.ids.length,2);
  const [a,b]=p.ids.map(C.tileIndex);
  assert.equal(Math.abs(a.x-b.x)+Math.abs(a.y-b.y),1);
  for(const id of p.ids){assert.ok(ids.includes(id));assert.ok(!used.has(id));used.add(id);}
 }
});
test('extra trimming keeps scenery world-space rectangle and shadow anchors',()=>{
 const layer={layer:'scenery',pad:128,
  crop:{x:82,y:37,fullWidth:1200,fullHeight:900}};
 const oldImage={width:760,height:610};
 const trim={left:25,top:31,width:690,height:550};
 const next=C.cropLayerMetadata(layer,oldImage.width,oldImage.height,
  trim.left,trim.top);
 const before=C.sceneryRect(layer,oldImage.width,oldImage.height);
 const after=C.sceneryRect(next,trim.width,trim.height);
 assert.equal(after.left,before.left+trim.left/layer.crop.fullWidth);
 assert.equal(after.top,before.top+trim.top/layer.crop.fullHeight);
 assert.equal(after.width,trim.width/layer.crop.fullWidth);
 assert.equal(after.height,trim.height/layer.crop.fullHeight);
 assert.equal(next.pad,128);
 assert.deepEqual(plain(layer.crop),{x:82,y:37,fullWidth:1200,fullHeight:900},
  'original metadata unchanged');
});
test('LOD downscales source resolution but leaves logical scene coordinates unchanged',()=>{
 const layer={layer:'scenery',pad:128,crop:{x:80,y:45,fullWidth:1200,fullHeight:900}};
 for(const factor of [.5,.25]){
  const image={width:720,height:528};
  const width=Math.round(image.width*factor),height=Math.round(image.height*factor);
  const resized=C.resizeLayerMetadata(layer,image.width,image.height,width,height);
  const before=C.sceneryRect(layer,image.width,image.height),
   after=C.sceneryRect(resized,width,height);
  for(const key of ['left','top','width','height'])
   assert.ok(Math.abs(before[key]-after[key])<1e-12,key+' changes with source density');
  assert.equal(resized.pad,128);
 }
 const ground={layer:'ground',pad:3,crop:null};
 assert.equal(C.resizeLayerMetadata(ground,2068,1758,1034,879).pad,3);
});
test('alpha crop excludes no nonzero pixels and retains two-pixel halo',()=>{
 const w=18,h=15,pixels=new Uint8Array(w*h*4);
 for(let y=4;y<=9;y++)for(let x=6;x<=11;x++)pixels[(y*w+x)*4+3]=128;
 const b=C.alphaBounds(pixels,w,h,2);
 assert.deepEqual(plain(b),{x:4,y:2,width:10,height:10,removed:170});
 for(let y=4;y<=9;y++)for(let x=6;x<=11;x++)
  assert.ok(x>=b.x&&x<b.x+b.width&&y>=b.y&&y<b.y+b.height);
 assert.equal(C.alphaBounds(new Uint8Array(w*h*4),w,h),null);
});
test('quantiles produce stable p50/p95 and skip empty arrays',()=>{
 assert.equal(C.quantile([1,3,4,6,10],.5),4);
 assert.equal(C.quantile([1,3,4,6,10],.95),9.2);
 assert.equal(C.quantile([],.95),null);
});
test('benchmark uses saved frozen atlas read-only and transforms only temporary blobs',()=>{
 assert.match(benchSource,/sourceViewer\.loadManifest\(scene\)/);
 assert.match(benchSource,/source\.keys\(scene\+'\|'\+level\+'\|'\)/);
 assert.match(benchSource,/Frozen\.memoryStore\(\)/);
 assert.match(benchSource,/memory\.put\(/);
 assert.doesNotMatch(benchSource,/source\.put\(|source\.clearPrefix\(|capture\(|saveManifest\(/);
 assert.doesNotMatch(benchSource,/bakeWorldTile\(|VedrasTerrainWorker|drawGround\(/);
 assert.match(benchSource,/checkOriginalIntegrity/);
 assert.match(benchSource,/image\/webp/);
 assert.match(page,/frozen-map-benchmark-core\.js/);
 assert.match(page,/frozen-map-benchmark\.js/);
 assert.doesNotThrow(()=>new Function(benchSource));
});

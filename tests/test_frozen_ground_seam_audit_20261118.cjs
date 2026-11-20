'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'frozen-map-seam-audit.js'),'utf8');
const game=fs.readFileSync(path.join(root,'frozen-map-game.js'),'utf8');
const html=fs.readFileSync(path.join(root,'frozen-map-game.html'),'utf8');
const w={};
vm.runInNewContext(source,{window:w,Date,console});
const api=w.VedrasFrozenSeamAudit;
const pixels=(width,height)=>new Uint8ClampedArray(Array.from(
 {length:width*height},()=>[55,100,125,255]).flat());
test('read-only seam audit selects saved neighbors crossing the actual zoom viewport',()=>{
 const known=['v1-aabbccdd|near|0,0','v1-aabbccdd|near|1,0',
  'v1-aabbccdd|near|0,1','v1-aabbccdd|near|10,10'];
 const pairs=api.pairsForView({
  zoom:4,panX:-2048,panY:0,width:1100,height:850,projectY:.85
 },known);
 assert.ok(pairs.some(p=>p[0]==='0,0'&&p[1]==='1,0'));
 assert.ok(pairs.every(p=>!p.includes('10,10')));
 assert.equal(api.pairsForView({zoom:0,width:100,height:100,
  panX:0,panY:0},known).length,0);
});
test('a matching Ground gutter is reported as matching without any scene mutation',()=>{
 const a=pixels(24,32),b=a.slice();
 const result=api.comparePixels(a,b,24,32,'x');
 assert.equal(result.meanRgbDifference,0);
 assert.equal(result.differentPct,0);
 assert.equal(result.transparentPct,0);
 assert.equal(result.centerBrightnessDelta,0);
});
test('an independently baked conflicting Ground border is measurable',()=>{
 const a=pixels(24,32),b=a.slice();
 for(let y=0;y<32;y++)for(let x=0;x<24;x++){
  const i=(y*24+x)*4;b[i]=160;b[i+1]=200;b[i+2]=230;
 }
 const metric=api.comparePixels(a,b,24,32,'x');
 assert.ok(metric.meanRgbDifference>100);
 assert.equal(metric.differentPct,100);
});
test('shared baked dark line is seen even if adjacent source PNGs agree',()=>{
 const a=pixels(24,32);
 for(let y=0;y<32;y++)for(let x=11;x<=13;x++){
  const i=(y*24+x)*4;a[i]=10;a[i+1]=20;a[i+2]=30;
 }
 const matched=api.comparePixels(a,a.slice(),24,32,'x');
 assert.equal(matched.differentPct,0);
 assert.ok(matched.centerBrightnessDelta< -20,
  'a shared baked stripe must not be misclassified as clean');
});
test('auditor reads only, never writes or deletes original IndexedDB or exported PNGs',()=>{
 assert.match(source,/store\.get\(/);
 assert.doesNotMatch(source,/store\.put\(|deleteDatabase\(|clearPrefix\(|store\.delete\(/);
 assert.match(html,/id="auditGroundSeams"/);
 assert.match(html,/frozen-map-seam-audit\.js\?v=/);
 assert.match(game,/window\.VedrasFrozenSeamAudit\.audit\(scene,store/);
 assert.match(game,/vedras_bodennahte_/);
 assert.doesNotThrow(()=>new Function(source));
 assert.doesNotThrow(()=>new Function(game));
});

test('fully transparent source gutters with arbitrary RGB are inconclusive, not defects',()=>{
 const a=pixels(24,32),b=pixels(24,32);
 for(let i=0;i<a.length;i+=4){
  a[i]=20;a[i+1]=5;a[i+2]=90;a[i+3]=0;
  b[i]=240;b[i+1]=250;b[i+2]=10;b[i+3]=0;
 }
 const m=api.comparePixels(a,b,24,32,'x');
 assert.equal(m.differentPct,100,'legacy raw RGB alarm remains traceable');
 assert.equal(m.transparentPct,100);
 assert.equal(m.opaquePixelsCompared,0);
 assert.equal(m.opaqueDifferentPct,null);
 assert.equal(m.centerBrightnessDelta,null);
 assert.equal(api.classify(m),'insufficient-visible-ground');
});
test('opaque mismatches remain reportable independently of transparent pixels',()=>{
 const a=pixels(24,32),b=a.slice();
 for(let y=0;y<32;y++)for(let x=0;x<24;x++){
  const i=(y*24+x)*4;
  b[i]=180;b[i+1]=200;b[i+2]=240;
 }
 const m=api.comparePixels(a,b,24,32,'x');
 assert.equal(m.opaquePixelsCompared,768);
 assert.equal(m.opaqueDifferentPct,100);
 assert.equal(api.classify(m),'saved-neighbor-visible-RGB-differs');
});
test('a missing alpha-covered side is detected without relying on hidden RGB',()=>{
 const a=pixels(24,32),b=a.slice();
 for(let y=0;y<32;y++)for(let x=0;x<12;x++){
  const i=(y*24+x)*4;
  a[i+3]=0;b[i+3]=255;
 }
 const m=api.comparePixels(a,b,24,32,'x');
 assert.equal(m.alphaMismatchPct,50);
 assert.equal(api.classify(m),'gutter-alpha-ownership-unverified');
});
test('exclusive device-snapped Ground cores share exact destination edges',()=>{
 const sandbox={window:{},Blob,console};
 vm.runInNewContext(fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8'),sandbox);
 const placement=sandbox.window.VedrasFrozenMap.groundCorePlacement;
 const image={width:2072,height:1761},dpr=1.6,zoom=1.125,proj=.85,offset=17.24;
 const snap=n=>Math.round(n*dpr)/dpr;
 const make=(x,y)=>({entry:{record:{tile:{x,y,size:512}}},
  left:snap(offset+x*zoom),right:snap(offset+(x+512)*zoom),
  top:snap(offset+y*zoom*proj),
  bottom:snap(offset+(y+512)*zoom*proj)});
 const one=placement(image,make(0,0),3),
  right=placement(image,make(512,0),3),
  below=placement(image,make(0,512),3);
 assert.equal(one.x+one.w,right.x);
 assert.equal(one.y+one.h,below.y);
 assert.equal(one.sx,12);
 assert.equal(one.sw,2048);
 assert.ok(one.sy>10&&one.sy<11);
 assert.ok(one.sh>1740&&one.sh<1742);
 assert.ok(!('bleed' in one));
});
test('viewer enables exclusive Ground by default and keeps legacy A/B rollback',()=>{
 const runtime=fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8');
 assert.match(runtime,/exclusiveGroundSeams=true/);
 assert.match(runtime,/if\(exclusiveGroundSeams\)/);
 assert.match(runtime,/groundCorePlacement\(image,t,pad,effectiveEdgeInset\)/);
 assert.match(game,/params\.get\('groundSeam'\)!=='legacy'/);
 assert.match(game,/adaptiveGroundDecode,exclusiveGroundSeams,sourceEdgeInset/);
 assert.match(html,/20261118-near-archive-audit-v4/);
 assert.match(html,/20261120-ownership-diagnostic-v1/);
 assert.match(html,/20261120-owned-core-gate-v1/);
});


const coreSource=fs.readFileSync(path.join(root,'frozen-ground-core-seams.js'),'utf8');
const guardSandbox={window:{},Uint8ClampedArray,Blob,Math};
vm.runInNewContext(coreSource,guardSandbox);
const core=guardSandbox.window.VedrasGroundCoreSeams;
function littleStrip({red=100,alpha=255,rows=32}={}){
 const data=new Uint8ClampedArray(2*rows*4);
 for(let i=0;i<data.length;i+=4){
  data[i]=red;data[i+1]=red;data[i+2]=red;data[i+3]=alpha;
 }
 return {data,width:2,height:rows};
}
test('valid exclusive Ground cores do not inherit 50%-mismatched empty gutters',()=>{
 const a=littleStrip(),b=littleStrip();
 const m=core.measureCore(a,b,{axis:'x',worldA:{x:0,y:0},
  worldB:{x:512,y:0},dx:4,dy:3.4,worldCells:[{q:2,r:0}]});
 assert.equal(m.checked,32);
 assert.equal(m.alphaFailures,0);
 assert.equal(m.meanJump,0);
 assert.equal(m.failure,false);
 assert.equal(m.verdict,'core-border-verified');
});
test('real missing Ground-core alpha and a hard RGB seam prevent publication',()=>{
 const a=littleStrip(),b=littleStrip();
 b.data[3]=0;
 let m=core.measureCore(a,b,{axis:'x',worldA:{x:0,y:0},
  worldB:{x:512,y:0},dx:4,dy:3.4,worldCells:[{q:2,r:0}]});
 assert.equal(m.alphaFailures,1);
 assert.equal(m.verdict,'real-core-seam');
 b.data[3]=255;
 for(let i=0;i<b.data.length;i+=4){
  b.data[i]=210;b.data[i+1]=210;b.data[i+2]=210;
 }
 m=core.measureCore(a,b,{axis:'x',worldA:{x:0,y:0},
  worldB:{x:512,y:0},dx:4,dy:3.4,worldCells:[{q:2,r:0}]});
 assert.ok(m.meanExcess>100);
 assert.equal(m.verdict,'real-core-seam');
});
test('edge stabilization touches only authored core joins, leaving outside transparent',()=>{
 const tile={x:496,y:0,size:16},pad=3,scale=4,
  ww=(tile.size+2*pad)*scale,hh=75;
 let data=new Uint8ClampedArray(ww*hh*4);
 // Opaque source interior except two anti-aliased core edge columns.
 const cx0=12,cx1=76,cy0=10,cy1=65;
 for(let y=cy0;y<cy1;y++)for(let x=cx0+3;x<cx1-3;x++){
  const i=(y*ww+x)*4;
  data[i]=80;data[i+1]=115;data[i+2]=45;data[i+3]=255;
 }
 const ctx={
  getImageData(x,y,w,h){
   const pixels=new Uint8ClampedArray(w*h*4);
   for(let row=0;row<h;row++){
    const offset=((y+row)*ww+x)*4;
    pixels.set(data.slice(offset,offset+w*4),row*w*4);
   }
   return {width:w,height:h,data:pixels};
  },
  putImageData(image,x,y){
   for(let row=0;row<image.height;row++)
    data.set(image.data.slice(row*image.width*4,(row+1)*image.width*4),
     ((y+row)*ww+x)*4);
  }
 };
 const canvas={width:ww,height:hh,getContext:()=>ctx};
 const r=core.repairEdgeBands(canvas,{tile,pad,cells:[{q:2,r:0}],width:3});
 assert.ok(r.repaired>0,'isolated transparent join texels were filled');
 assert.equal(r.unresolved,0,'interior donor was available');
 assert.equal(data[((cy0+10)*ww+cx0)*4+3],255);
 assert.equal(data[((cy0+10)*ww+cx1-1)*4+3],255);
 const original=core.repairEdgeBands(canvas,{tile,pad,cells:[],width:3});
 assert.equal(original.repaired,0,'outside world cells must not be flattened');
 assert.equal(data[3],0,'transparent canvas exterior must stay transparent');
});
test('full 4x export invokes mandatory owned-core checks and never rewrites existing archives',()=>{
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const game=fs.readFileSync(path.join(root,'frozen-map-game.js'),'utf8');
 assert.match(index,/frozen-ground-core-seams\.js\?v=/);
 assert.match(app,/guard\.repairEdgeBands\(out,\{tile:t,pad:groundPad/);
 assert.match(app,/seamAudit=await checker\.auditSaved\(scene,frozenMap\.storage,all,worldCells/);
 assert.match(app,/audit\.complete&&seamAudit\.complete/);
 assert.match(app,/ground-owned-core-seam-gate-v1/);
 assert.match(game,/report\.core=await checker\.auditSaved\(/);
 assert.match(coreSource,/createImageBitmap\(layers\[0\]\.png,/);
 assert.match(coreSource,/createImageBitmap\(layers\[1\]\.png,/);
 assert.doesNotMatch(coreSource,/store\.put\(|store\.delete\(|deleteDatabase\(/);
});

test('shared fully opaque bright stripes fail even when both adjacent core RGB edges agree',()=>{
 const width=6,height=40,
  mk=()=>({width,height,data:new Uint8ClampedArray(width*height*4)});
 const a=mk(),b=mk();
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4;
  for(const img of [a,b]){
   img.data[i]=95;img.data[i+1]=115;img.data[i+2]=80;
   img.data[i+3]=255;
  }
  if(x>=width-2){
   a.data[i]=250;a.data[i+1]=250;a.data[i+2]=250;
  }
  if(x<2){
   b.data[i]=250;b.data[i+1]=250;b.data[i+2]=250;
  }
 }
 const m=core.measureCore(a,b,{axis:'x',worldA:{x:0,y:0},
  worldB:{x:512,y:0},dx:4,dy:3.4,worldCells:[{q:2,r:0}]});
 assert.equal(m.alphaFailures,0);
 assert.equal(m.meanJump,0,'both owners paint the same defective white fringe');
 assert.ok(m.sharedStripePct>95);
 assert.equal(m.verdict,'real-core-seam');
});

test('unresolved 4x core alpha reports bounded source/world coordinates instead of an opaque error',()=>{
 const tile={x:496,y:0,size:16},pad=3,scale=4,
  ww=(tile.size+2*pad)*scale,hh=75;
 const raw=new Uint8ClampedArray(ww*hh*4); // no opaque donor available
 const canvas={width:ww,height:hh,getContext:()=>({
  getImageData(x,y,w,h){
   const data=new Uint8ClampedArray(w*h*4);
   for(let row=0;row<h;row++)
    data.set(raw.slice(((y+row)*ww+x)*4,((y+row)*ww+x+w)*4),row*w*4);
   return {width:w,height:h,data};
  },
  putImageData(){}
 })};
 const result=core.repairEdgeBands(canvas,{tile,pad,cells:[{q:2,r:0}],width:3});
 assert(result.unresolved>0,'transparent interior cannot be fabricated into valid terrain');
 assert(result.unresolvedSamples.length>0&&result.unresolvedSamples.length<=5);
 assert(result.unresolvedSamples.every(p=>Number.isFinite(p.sourceX)&&
  Number.isFinite(p.sourceY)&&Number.isFinite(p.worldX)&&
  Number.isFinite(p.worldY)&&p.hex==='2,0'));
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 assert.match(app,/checked\.unresolvedSamples\.map\(p=>p\.side/);
 assert.match(app,/Die PNG wird nicht gespeichert/);
});
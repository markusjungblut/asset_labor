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
 assert.equal(api.classify(m),'saved-neighbor-alpha-coverage-differs');
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
 assert.match(runtime,/groundCorePlacement\(image,t,pad\)/);
 assert.match(game,/params\.get\('groundSeam'\)!=='legacy'/);
 assert.match(game,/adaptiveGroundDecode,exclusiveGroundSeams,sourceEdgeInset/);
 assert.match(html,/20261118-source-edge-inset-v3/);
 assert.match(html,/20261118-visible-alpha-audit-v2/);
});

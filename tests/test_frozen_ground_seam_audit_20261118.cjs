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

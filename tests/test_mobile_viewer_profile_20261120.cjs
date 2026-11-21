'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'frozen-map-view-policy.js'),'utf8');
const sandbox={window:{}};vm.runInNewContext(source,sandbox);
const P=sandbox.window.VedrasFrozenViewPolicy;
test('desktop budgets unchanged by mobile profile',()=>{
 const d=P.deviceProfile({width:1920,height:1080,touch:false,memoryGB:16});
 assert.equal(d.name,'desktop');assert.equal(d.maxDecodedPixels,95000000);
 assert.equal(d.maxDpr,2);assert.equal(d.maxPixels,8000000);
 assert.equal(d.overviewEnterZoom,.6);
});
test('phone budget caps RAM, backing canvas and favors 1x overview',()=>{
 const p=P.deviceProfile({width:393,height:852,touch:true,memoryGB:4});
 assert.equal(p.name,'mobile');assert.equal(p.maxDecodedPixels,16000000);
 assert(p.maxDpr<=1.5&&p.maxPixels<=1600000);
 assert(p.overviewEnterZoom>.8&&p.overviewLeaveZoom>p.overviewEnterZoom);
 const h=P.deviceProfile({width:393,height:852,touch:true});
 assert.equal(h.maxDecodedPixels,24000000,'unknown iOS memory uses conservative budget');
 assert(P.displayDpr({width:393,height:852,zoom:.8,baseDpr:p.maxDpr,
  maxDpr:p.maxDpr,maxPixels:p.maxPixels,maxEdge:p.maxEdge})<=p.maxDpr);
});
test('tablet mode and explicit A/B profile override are deterministic',()=>{
 const tablet=P.deviceProfile({width:1024,height:768,touch:true,memoryGB:8});
 assert.equal(tablet.name,'tablet');
 assert(tablet.maxDecodedPixels<95000000&&tablet.maxDecodedPixels>24000000);
 const compare=P.deviceProfile({width:393,height:852,touch:true,override:'desktop'});
 assert.equal(compare.name,'desktop');
});
test('viewer wires device profile to immutable atlas playback and two-finger input',()=>{
 const game=fs.readFileSync(path.join(root,'frozen-map-game.js'),'utf8'),
  runtime=fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8'),
  html=fs.readFileSync(path.join(root,'frozen-map-game.html'),'utf8');
 for(const required of [
  'deviceProfile({','maxDecodedPixels:Math.min(viewerProfile.maxDecodedPixels',
  'overviewEnterZoom:viewerProfile.overviewEnterZoom',
  'const touches=new Map();','const pinchGeometry=()=>',
  'current.span/first.span','touches.delete(e.pointerId)',
  'setPose({}); // restore the profile'
 ])assert(game.includes(required),'missing mobile integration: '+required);
 assert(runtime.includes('overviewEnterZoom=.60,overviewLeaveZoom=.72'));
 assert(runtime.includes('pose?.zoom<=enter'));
 assert(runtime.includes('pose?.zoom>=leave'));
 assert(html.includes('frozen-map-view-policy.js?v=20261120-mobile-profile-v1'));
});

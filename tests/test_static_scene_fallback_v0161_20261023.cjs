'use strict';
/* Run with node --test tests/test_static_scene_fallback_v0161_20261023.cjs */
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
function setup(config={}){
 let built=0,now=0;
 const canvases=[];
 const sandbox={
  window:{},
  performance:{now:()=>++now},
  document:{createElement(tag){
   assert.equal(tag,'canvas');
   const bitmap={width:0,height:0,
    getContext:()=>({setTransform(){},drawImage(){}})};
   canvases.push(bitmap);
   return bitmap;
  }}
 };
 vm.runInNewContext(read('static-object-layer.js'),sandbox);
 const renderer=sandbox.window.VedrasStaticObjects.create(config);
 const draw=(v,opts={})=>renderer.paint({ctx:{drawImage(){}},view:v,
  signature:'stable-scene',drawScene(){built++},...opts});
 return {renderer,draw,canvases,builds:()=>built};
}
test('large display adapts overscan to available cache budget rather than direct rendering',()=>{
 const s=setup({padding:440,maxPixels:12000000,minPadding:64});
 const view={width:3000,height:1800,dpr:1.1,zoom:.5,panX:0,panY:0};
 const first=s.draw(view);
 assert.equal(first.mode,'canvas');
 assert.equal(first.enabled,true);
 assert.ok(first.pad<440&&first.pad>=64);
 assert.ok(first.requestedPixels<=12000000);
 assert.equal(s.draw({...view,panX:20}).cached,true);
 assert.equal(s.builds(),1);
});
test('a truly oversized display falls back with an actionable reason and pixel counts',()=>{
 const s=setup({padding:440,maxPixels:1000000,minPadding:64});
 const first=s.draw({width:2200,height:1200,dpr:1,zoom:.5,panX:0,panY:0});
 assert.equal(first.mode,'direct');
 assert.equal(first.reason,'viewport budget');
 assert.ok(first.requestedPixels>first.budgetPixels);
 assert.equal(s.builds(),1);
});
test('debug overlays external to sprite scene no longer force CPU direct fallback',()=>{
 const app=read('app.js');
 assert.match(app,/if\(state\.gpuSprites&&\(state\.mountainDebug\|\|state\.bounds\|\|state\.forest\?\.debug\)\)/);
 assert.match(app,/if\(state\.mountainShadowDebug\)blockers\.push/);
 assert.match(app,/if\(state\.shadowHandles\)blockers\.push/);
 assert.match(app,/reason:blockers\.join\(', '\)/);
 assert.match(app,/sceneryProfile\?\.reason\?' · Grund: '/);
 assert.match(app,/maxPixels:12000000,minPadding:64/);
});
test('hotfix scripts bust browser caches and preserve Python 3.8 endpoint',()=>{
 const html=read('index.html'),server=read('server.py');
 assert.match(html,/Asset-Labor v0\.\d+\.\d+/);
 assert.match(html,/static-object-layer\.js\?v=/);
 assert.match(html,/app\.js\?v=/);
 assert.match(server,/VERSION = '0\.\d+\.\d+'/);
 assert.match(server,/key = parsed\.path\[len\(prefix\):\]/);
 assert.doesNotMatch(server,/\.removeprefix\(/);
});

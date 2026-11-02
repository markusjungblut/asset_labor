'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const profilerCode=read('frozen-map-profiler.js'),
 runtimeCode=read('frozen-map-runtime.js'),
 policyCode=read('frozen-map-view-policy.js'),
 gameCode=read('frozen-map-game.js'),
 html=read('frozen-map-game.html');
const plain=x=>JSON.parse(JSON.stringify(x));
function profiler(){
 const window={};vm.runInNewContext(profilerCode,{window});
 let t=0;
 return {p:window.VedrasFrozenProfiler.create({
  maxFrames:60,maxTiles:20,now:()=>++t}),
  advance(ms){t+=ms},time(){return t}};
}
test('bounded local-only profile records inputs, frame phases and read/decode',()=>{
 const {p,advance,time}=profiler();
 p.input('pan',time());
 p.frame({time:time()+12,drawMs:12,selectMs:2,worldMs:6,
  groundMs:3,sceneryMs:2,maskMs:1,cloudMs:1,fogMs:2,
  canvasPixels:1000,visibleTiles:5,decodedTiles:3,renderMode:'cached'});
 advance(1000);p.frame({drawMs:1});
 advance(40);p.input('zoom',time());
 const zoom=p.frame({drawMs:8,time:time()+8});
 assert.equal(zoom.kind,'zoom');
 assert.equal(zoom.frameGapMs,null,
  'an idle pause is NOT a slow zoom animation frame');
 assert.equal(zoom.inputToDrawEndMs,8);
 p.tileRead({source:'derived2x',storageMs:4,decodeMs:8,totalMs:12,
  layers:2,pixels:100,blobBytes:700});
 const report=p.report({scene:'v1-0374527a'});
 assert.equal(report.schema,'vedras-frozen-profile-v1');
 assert.equal(report.inputEvents.pan,1);
 assert.equal(report.inputEvents.zoom,1);
 assert.equal(report.tiles.counts.derived2x,1);
 assert.ok(report.phasesMs.worldMs.p95>=0);
 assert.equal(report.environment.scene,'v1-0374527a');
 assert.ok(report.note.includes('NOT GPU'));
 p.reset();assert.equal(p.report().frames.length,0);
});
test('bounded ring drops old samples, computes percentiles only at export',()=>{
 const {p}=profiler();
 for(let i=0;i<110;i++)p.frame({time:i*16,drawMs:i%12});
 for(let i=0;i<40;i++)p.tileRead({source:'original',decodeMs:2});
 const r=p.report();
 assert.equal(r.frames.length,60);
 assert.equal(r.sampleLimit.droppedFrames,50);
 assert.equal(r.tileReads.length,20);
 assert.equal(r.sampleLimit.droppedTiles,20);
 assert.equal(r.tiles.counts.original,20);
 assert.equal(r.frames[0].tMs,800);
});
test('actual frozen renderer can profile indexed tile storage and bitmap decoding',async()=>{
 const window={};vm.runInNewContext(policyCode,{window});
 vm.runInNewContext(profilerCode,{window});
 let ticks=0;
 const perf={now:()=>ticks+=.25};
 const p=window.VedrasFrozenProfiler.create({now:perf.now});
 const paints=[];
 const context=()=>({
  setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
  lineTo(){},closePath(){},clip(){},drawImage(image){paints.push(image.id||'cache')},
  fillRect(){},translate(){},scale(){},imageSmoothingEnabled:true
 });
 const doc={createElement:()=>({width:0,height:0,getContext:()=>context()})};
 const canvas={width:0,height:0,getContext:()=>context(),
  getBoundingClientRect:()=>({width:500,height:320})};
 const records=new Map();
 for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++){
  const id=x+','+y,key='v1-0374527a|near|'+id;
  records.set(key,{key,sceneKey:'v1-0374527a',level:'near',
   derivedFormat:'2x-png-v1',tile:{id,x:x*512,y:y*512,size:512},
   layers:[
    {layer:'ground',pad:3,png:{id:'ground'+id,width:250,height:250,size:800}},
    {layer:'scenery',pad:128,png:{id:'scenery'+id,width:250,height:250,size:500}}
   ]});
 }
 vm.runInNewContext(runtimeCode,{window,document:doc,performance:perf,
  requestAnimationFrame:()=>{},console});
 const viewer=window.VedrasFrozenMap.create({canvas,profiler:p,
  storage:{get:async key=>records.get(key),
   keys:async pre=>[...records.keys()].filter(key=>key.startsWith(pre))},
  decode:async img=>({...img,close(){}})});
 await viewer.load('v1-0374527a','near',
  {zoom:.65,panX:0,panY:0,dpr:1.25,projectY:.85},
  [{q:0,r:0,x:0,y:0,radius:140,visibility:'visible'}]);
 for(let i=0;i<30;i++){
  viewer.draw();
  await new Promise(resolve=>setImmediate(resolve));
  if(viewer.report().pending===0&&viewer.report().decoded===9)break;
 }
 p.input('pan',perf.now());
 viewer.setPose({panX:15,panY:10});viewer.draw();
 const report=p.report();
 assert.ok(report.frames.length>0,'synchronous canvas frames sampled');
 assert.ok(report.tileReads.length>0,'storage and decode sampled');
 assert.ok(report.tileReads.every(t=>t.source==='derived2x'));
 assert.ok(report.tileReads.some(t=>t.blobBytes===1300));
 assert.ok(report.byGesture.pan.draws.count>=1);
 assert.ok(report.frames.some(f=>f.canvasPixels>0));
 assert.ok(report.frames.every(f=>f.maskMs>=0&&f.worldMs>=0));
 assert.equal(viewer.report().renderMode,'cached');
 assert.ok(paints.length>0,'original image layers were drawn');
 viewer.stop();
});
test('profiling is disabled by default and has no data/file side effects',()=>{
 assert.match(gameCode,/params\.get\('perf'\)==='1'/);
 assert.match(gameCode,/profiler\.input\('pan'\)/);
 assert.match(gameCode,/profiler\.input\('zoom'\)/);
 assert.match(gameCode,/const profileReset=\(\)=>/);
 assert.match(gameCode,/profileReport,profileReset,profileStatus/);
 assert.ok(gameCode.includes('Performance-Aufzeichnung ist ausgeschaltet.'));
 assert.ok(gameCode.includes('Messwerte zurückgesetzt.'));
 assert.match(html,/frozen-map-profiler\.js\?v=20261102-step25a/);
 assert.match(html,/<button id="downloadProfile" hidden/);
 assert.doesNotMatch(profilerCode,/indexedDB|localStorage|source\.put|deleteDatabase/);
 assert.doesNotMatch(runtimeCode,/bakeWorldTile\(/);
 for(const script of [gameCode,profilerCode,runtimeCode])
  assert.doesNotThrow(()=>new Function(script));
});

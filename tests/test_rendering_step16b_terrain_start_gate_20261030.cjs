'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
function harness({blocked=false,withGate=true}={}){
 const window={},ctx={window,performance:{now:()=>100},Date,Promise,console,
   setTimeout,clearTimeout,AbortController};
 vm.runInNewContext(read('render-step15-trace.js'),ctx);
 vm.runInNewContext(read('world-tile-streamer.js'),ctx);
 const g={save(){},restore(){},setTransform(){},clearRect(){},
   fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},
   fill(){},drawImage(){}};
 let prepared=!blocked,bakes=0;
 const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 const view={width:640,height:400,zoom:.7,dpr:1,panX:0,panY:0,projectY:.85};
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>g},maxTiles:32,
  source:async()=>{bakes++;return {complete:true,revision:'terrain-7',layers:[
   {layer:'ground',image:{width:64,height:64}},
   {layer:'scenery',image:{width:64,height:64}}]};},
  ...(withGate?{canStartSource:()=>prepared}:{}),
  requireScenery:true,lodSelector:()=> 'mid',sourceTimeoutMs:0
 });
 return {window,renderer,tile,view,setPrepared:v=>{prepared=v},
  get bakes(){return bakes}};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('unprepared terrain has no bake, pending job, or consumed retry slot',async()=>{
 const h=harness({blocked:true});
 h.window.VedrasStep15Trace.enable(true);
 for(let i=0;i<30;i++)h.renderer.request(h.view,[h.tile]);
 await tick();await tick();
 assert.equal(h.bakes,0);
 assert.equal(h.renderer.stats().pending,0);
 assert.equal(h.renderer.stats().retryExhausted,0);
 assert.equal(h.renderer.stats().visible,1);
 const events=h.window.VedrasStep15Trace.snapshot().events
  .filter(e=>e.type==='tile.source-deferred');
 assert.equal(events.length,1);
});
test('a subsequent request after terrain worker preparation starts and accepts the tile',async()=>{
 const h=harness({blocked:true});
 h.renderer.request(h.view,[h.tile]);await tick();
 h.setPrepared(true);
 h.renderer.request(h.view,[h.tile]);await tick();await tick();
 assert.equal(h.bakes,1);
 assert.equal(h.renderer.stats().completed,1);
 assert.equal(h.renderer.stats().tiles,1);
 assert.equal(h.renderer.stats().retryExhausted,0);
});
test('legacy source hosts without gate continue as before',async()=>{
 const h=harness({blocked:true,withGate:false});
 h.renderer.request(h.view,[h.tile]);await tick();await tick();
 assert.equal(h.bakes,1);
 assert.equal(h.renderer.stats().tiles,1);
});
test('only local editor enables the gate; source-readiness and fog checks remain',()=>{
 const app=read('app.js');
 assert.match(app,/canStartSource:tile=>!!currentTerrainCore\(tile\)/);
 assert.match(app,/source:bakeWorldTile,requireScenery:true/);
 assert.match(app,/const snapshotReady=tileArtworkReady\(t\)/);
 assert.match(app,/if\(!snapshotReady&&!tileArtworkStatus\(t,null,true\)\)/);
});

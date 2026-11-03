'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
function harness(){
 const window={},context={window,performance:{now:()=>100},console,
  Date,Promise,setTimeout,clearTimeout,AbortController};
 vm.runInNewContext(read('render-step15-trace.js'),context);
 vm.runInNewContext(read('world-tile-streamer.js'),context);
 const g={save(){},restore(){},setTransform(){},clearRect(){},fillRect(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},drawImage(){}};
 const renderer=window.VedrasWorldTiles.create({
  canvas:{getContext:()=>g},source:null,requireScenery:true,lodSelector:()=> 'mid'});
 const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 const packet=revision=>({complete:true,revision,layers:[
  {layer:'ground',image:{width:64,height:64}},
  {layer:'scenery',image:{width:64,height:64}}
 ]});
 const view={width:600,height:400,dpr:1,zoom:.70,
  panX:0,panY:0,projectY:.85};
 const revision=(terrain,shore,road,river)=>JSON.stringify([terrain,shore,road,river]);
 const events=()=>window.VedrasStep15Trace.snapshot().events;
 return {window,renderer,tile,packet,view,revision,events};
}
test('one road revision produces road-only attribution for its exact tile',()=>{
 const h=harness(),old=h.revision('t1','s1','road-1','river-1');
 const next=h.revision('t1','s1','road-2','river-1');
 h.renderer.seed(h.tile,'mid',h.packet(old));
 h.renderer.request(h.view,[h.tile]);
 h.window.VedrasStep15Trace.enable(true);
 assert.equal(h.renderer.reconcileGroundRevisions(new Map([[h.tile.id,next]])),1);
 const detail=h.events().find(x=>x.type==='tile.ground-revision-detail');
 assert.ok(detail);
 assert.equal(detail.detail.id,'0,0');
 assert.equal(detail.detail.changed,'road');
 assert.equal(detail.detail.fromRoad,'road-1');
 assert.equal(detail.detail.toRoad,'road-2');
 assert.equal(h.renderer.stats().tiles,0);
});
test('terrain and shoreline update reports two independent contributors',()=>{
 const h=harness(),old=h.revision('t1','s1','road-1','river-1');
 h.renderer.seed(h.tile,'mid',h.packet(old));h.renderer.request(h.view,[h.tile]);
 h.window.VedrasStep15Trace.enable(true);
 h.renderer.reconcileGroundRevisions(new Map([[
  h.tile.id,h.revision('t2','s2','road-1','river-1')]]));
 const detail=h.events().find(x=>x.type==='tile.ground-revision-detail');
 assert.equal(detail.detail.changed,'terrain,shore');
 assert.equal(detail.detail.fromTerrain,'t1');
 assert.equal(detail.detail.toTerrain,'t2');
});
test('unchanged ground revision never logs an invalidation',()=>{
 const h=harness(),old=h.revision('t1','s1','road-1','river-1');
 h.renderer.seed(h.tile,'mid',h.packet(old));h.renderer.request(h.view,[h.tile]);
 h.window.VedrasStep15Trace.enable(true);
 assert.equal(h.renderer.reconcileGroundRevisions(new Map([[h.tile.id,old]])),0);
 assert.equal(h.events().filter(x=>x.type==='tile.ground-revision-detail').length,0);
});
test('4x attribution is opt-in and never changes cache decisions',()=>{
 const h=harness(),old=h.revision('t1','s1','r1','v1');
 h.renderer.seed(h.tile,'mid',h.packet(old));h.renderer.request(h.view,[h.tile]);
 assert.equal(h.renderer.reconcileGroundRevisions(new Map([[
  h.tile.id,h.revision('t2','s1','r1','v1')]])),1);
 assert.equal(h.events().length,0);
 const audit=read('scripts/rendering-step16a-audit.mjs');
 assert.match(audit,/groundRevisionDetails:revisions\.slice\(0,60\)/);
 assert.match(audit,/tile\.ground-revision-detail/);
});

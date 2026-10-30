'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
function create(){
 const window={},ctx={window,performance:{now:()=>100},console,
  Date,Promise,setTimeout,clearTimeout,AbortController};
 vm.runInNewContext(read('render-step15-trace.js'),ctx);
 vm.runInNewContext(read('world-tile-streamer.js'),ctx);
 const g={save(){},restore(){},setTransform(){},clearRect(){},fillRect(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},drawImage(){}};
 const renderer=window.VedrasWorldTiles.create({canvas:{getContext:()=>g},
  source:null,requireScenery:true,lodSelector:()=> 'mid'});
 const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 const view={width:600,height:400,dpr:1,zoom:.70,panX:0,panY:0,projectY:.85};
 const packet=revision=>({complete:true,revision,layers:[
  {layer:'ground',image:{width:64,height:64}},
  {layer:'scenery',image:{width:64,height:64}}]});
 const rev=(terrain,shore,road,river)=>JSON.stringify([terrain,shore,road,river]);
 const seed=revision=>{renderer.seed(tile,'mid',packet(revision));renderer.request(view,[tile]);};
 const change=r=>renderer.reconcileGroundRevisions(new Map([[tile.id,r]]));
 return {renderer,tile,window,seed,change,rev,
  events:()=>window.VedrasStep15Trace.snapshot().events};
}
test('ready road to temporarily pending keeps original exact world tile',()=>{
 const h=create();h.seed(h.rev('21','31','163','pending'));
 h.window.VedrasStep15Trace.enable(true);
 assert.equal(h.change(h.rev('21','31','pending','pending')),0);
 assert.equal(h.renderer.stats().tiles,1);
 assert.equal(h.renderer.needsSeed(h.tile,'mid',3),false);
 assert.ok(h.events().some(e=>e.type==='tile.ground-revision-deferred'&&
  e.detail.changed==='road'));
 assert.equal(h.events().filter(e=>e.type==='tile.invalidate').length,0);
});
test('road replacement invalidates from OLD completed revision exactly once',()=>{
 const h=create();h.seed(h.rev('21','31','163','pending'));
 assert.equal(h.change(h.rev('21','31','pending','pending')),0);
 assert.equal(h.change(h.rev('21','31','184','pending')),1);
 assert.equal(h.renderer.stats().tiles,0);
});
test('road and river both transiently pending do not discard completed packet',()=>{
 const h=create();h.seed(h.rev('34','38','150','138'));
 assert.equal(h.change(h.rev('34','38','pending','pending')),0);
 assert.equal(h.renderer.stats().tiles,1);
 assert.equal(h.change(h.rev('34','38','189','177')),1);
});
test('terrain revision remains authoritative even if road briefly pending',()=>{
 const h=create();h.seed(h.rev('34','38','150','138'));
 assert.equal(h.change(h.rev('35','38','pending','138')),1);
 assert.equal(h.renderer.stats().tiles,0);
});
test('shoreline revision changes are never deferred',()=>{
 const h=create();h.seed(h.rev('34','38','150','138'));
 assert.equal(h.change(h.rev('34','pending','150','138')),1);
});
test('previously pending road becoming ready invalidates incomplete source',()=>{
 const h=create();h.seed(h.rev('34','38','pending','pending'));
 assert.equal(h.change(h.rev('34','38','189','177')),1);
});
test('changed road state off is an authoritative change, not a transient gap',()=>{
 const h=create();h.seed(h.rev('34','38','150','138'));
 assert.equal(h.change(h.rev('34','38','off','138')),1);
});
test('explicit editor tile edits still invalidate regardless of pending defense',()=>{
 const h=create();h.seed(h.rev('34','38','150','138'));
 h.renderer.invalidateTiles(new Set([h.tile.id]),'manual-road-edit');
 assert.equal(h.renderer.stats().tiles,0);
 assert.equal(h.renderer.needsSeed(h.tile,'mid',3),true);
});
test('unrelated unchanged tile remains intact during selective invalidation',()=>{
 const h=create();h.seed(h.rev('34','38','150','138'));
 assert.equal(h.change(h.rev('34','38','150','138')),0);
 assert.equal(h.renderer.stats().tiles,1);
});

test('repeated camera samples do not flood deferred-revision trace',()=>{
 const h=create();h.seed(h.rev('21','31','163','pending'));
 h.window.VedrasStep15Trace.enable(true);
 for(let i=0;i<90;i++)
  assert.equal(h.change(h.rev('21','31','pending','pending')),0);
 assert.equal(h.events().filter(e=>e.type==='tile.ground-revision-deferred').length,1);
 assert.equal(h.renderer.stats().tiles,1);
});

'use strict';
// Step 7: visible-first, center priority, bounded prefetch and fairness.
// Run: node --test tests/test_priority_render_queues_v023_step7_20261027.cjs
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const CELLS=Array.from({length:225},(_,i)=>({q:i%15-7,r:Math.floor(i/15)-7}));
const view=(x=0,y=0)=>({x,y,width:310,height:310});
const packet=()=>({complete:true,layers:[
 {layer:'ground',image:{width:128,height:128}},
 {layer:'scenery',image:{width:128,height:128}}
]});
const flush=async()=>{for(let i=0;i<16;i++)await Promise.resolve();};

function chunksHarness(buildOverride=null){
 const urgent=[],idle=[],started=[];
 let now=1000;
 const sandbox={window:{},Date:{now:()=>now},performance:{now:()=>now},
  setTimeout:fn=>(urgent.push(fn),urgent.length),
  clearTimeout(){},requestIdleCallback:fn=>(idle.push(fn),idle.length)};
 vm.runInNewContext(read('chunks.js'),sandbox);
 const chunks=sandbox.window.VedrasChunks;
 let build=buildOverride||((t)=>({raster:{canvas:{width:16,height:16}}}));
 const renderer=chunks.create({size:512});
 renderer.configure('world-a',{worldCells:CELLS,redraw(){},
  buildTile:t=>{started.push(t.id);return build(t);}});
 const pump=(queue,n=100)=>{let count=0;while(queue.length&&count++<n)queue.shift()();};
 return {chunks,renderer,urgent,idle,started,pump,
  setBuild:fn=>build=fn,advance:ms=>{now+=ms}};
}
function worldHarness(options={}){
 let now=1000;const started=[],pending=[],timers=[];
 const g={setTransform(){},clearRect(){},save(){},restore(){},
  beginPath(){},closePath(){},clip(){},moveTo(){},lineTo(){},
  fill(){},fillRect(){},drawImage(){}};
 const sandbox={window:{},Date:{now:()=>now},performance:{now:()=>now},
  setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout(){}};
 vm.runInNewContext(read('world-tile-streamer.js'),sandbox);
 const tiles=Array.from({length:5},(_,i)=>({
  id:i+',0',x:512*i,y:0,size:512,visibility:'visible'}));
 const source=options.source||((t)=>{started.push(t.id);
  return new Promise(resolve=>pending.push({id:t.id,resolve}));});
 const renderer=sandbox.window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>g},
  source,concurrency:options.concurrency||1,sourceTimeoutMs:0
 });
 const camera=x=>({width:1200,height:500,dpr:1,zoom:1,
  panX:-x,panY:0,projectY:.85});
 return {renderer,tiles,camera,started,pending,timers,advance:ms=>{now+=ms}};
}

test('terrain foreground is reprioritized around the new camera center',()=>{
 const h=chunksHarness(),old=view(0),next=view(900);
 h.renderer.prime(old);
 h.renderer.prime(next);
 h.pump(h.urgent,1);
 const target=h.chunks.visible(next,CELLS,512)[0];
 assert.equal(h.started[0],target.id);
});
test('an old visible terrain request cannot starve under shifting focus',()=>{
 const h=chunksHarness();
 h.renderer.prime(view(0));
 h.advance(3100);
 h.renderer.prime(view(400));
 h.pump(h.urgent,1);
 assert.equal(h.started[0],'0,0');
 assert.ok(h.renderer.stats().agedPromotions>=1);
});
test('terrain discards completed foreground work from a distant former camera',()=>{
 const callbacks=[];
 const h=chunksHarness(t=>({then:resolve=>callbacks.push({id:t.id,resolve})}));
 h.renderer.prime(view(0));
 h.pump(h.urgent,1);
 const old=callbacks[0].id;
 h.renderer.prime(view(3000));
 callbacks[0].resolve({raster:{canvas:{width:16,height:16}}});
 assert.equal(h.renderer.has(old),false);
 assert.ok(h.renderer.stats().obsolete>0);
});
test('manual warm queue allows limited prefetch turns instead of starvation',()=>{
 const h=chunksHarness(),prefetch={enabled:true,ring:1,limit:6};
 h.renderer.prime(view(0),{prefetch});
 h.pump(h.urgent);
 const manual=Array.from({length:15},(_,i)=>({
  id:(20+i)+',20',x:(20+i)*512,y:20*512,size:512
 }));
 h.renderer.warm(manual);
 h.pump(h.idle,45);
 assert.equal(h.renderer.stats().warmDone,15);
 assert.ok(h.renderer.stats().backgroundFairTurns>=1);
 assert.ok(h.renderer.stats().prefetched>=1);
});
test('world tiles update old queue order to favor newly centered core',async()=>{
 const h=worldHarness(),tiles=h.tiles.slice(0,3);
 h.renderer.request(h.camera(100),tiles);await flush();
 assert.equal(h.started[0],'0,0');
 h.renderer.request(h.camera(1300),tiles);
 assert.ok(h.renderer.stats().priorityReorders>=1);
 h.pending.shift().resolve(packet());await flush();
 assert.equal(h.started[1],'2,0');
});
test('world tiles preserve age and prevent indefinite visible starvation',async()=>{
 const h=worldHarness(),tiles=h.tiles.slice(0,3);
 h.renderer.request(h.camera(100),tiles);await flush();
 h.advance(3100);
 h.renderer.request(h.camera(1300),tiles);
 h.pending.shift().resolve(packet());await flush();
 assert.equal(h.started[1],'1,0','an aged visible tile outranks new center');
});
test('obsolete world-tile job does not overwrite or block the new camera',async()=>{
 const h=worldHarness();
 h.renderer.request(h.camera(100),[h.tiles[0]]);await flush();
 const old=h.pending.shift();
 h.renderer.request(h.camera(1200),[h.tiles[2]]);await flush();
 assert.equal(h.started.at(-1),'2,0');
 old.resolve(packet());await flush();
 assert.equal(h.renderer.stats().tiles,0,'late old packet must not enter cache');
 h.pending.shift().resolve(packet());await flush();
 assert.equal(h.renderer.stats().tiles,1,'new camera packet stays valid');
 assert.ok(h.renderer.stats().discardedObsolete>=1);
});
test('world-tile render concurrency is hard-bounded',async()=>{
 const h=worldHarness({concurrency:8});
 h.renderer.request(h.camera(1300),h.tiles);
 await flush();
 assert.equal(h.renderer.stats().parallelLimit,2);
 assert.equal(h.started.length,2);
 assert.equal(h.renderer.stats().inFlight,2);
});
test('provisional snapshot upgrade is retried instead of stuck behind its preview',async()=>{
 let builds=0;
 const h=worldHarness({source:()=>++builds===1?null:packet()});
 h.renderer.seed(h.tiles[0],'mid',{...packet(),preview:true,sourceDensity:.6});
 h.renderer.request(h.camera(100),[h.tiles[0]]);await flush();
 assert.equal(builds,1);
 assert.ok(h.renderer.stats().retryWaiting>0);
 h.timers.shift()();await flush();
 assert.equal(builds,2);
 assert.equal(h.renderer.diagnostics().tiles[0].preview,false);
});

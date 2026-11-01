'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../chunks.js'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function fixture(paused=false){
 const scope={window:{},setTimeout,clearTimeout,
  performance:{now:()=>Date.now()},console,
  requestIdleCallback:fn=>setTimeout(fn,0)};
 vm.runInNewContext(source,scope);
 const chunks=scope.window.VedrasChunks.create({
  size:512,maxTiles:28,maxPixels:5000000
 });
 const pending=[],started=[];
 // Several independent world cores intersect the same camera viewport.
 const worldCells=[{q:-4,r:0},{q:-2,r:0},{q:0,r:0},
  {q:2,r:0},{q:4,r:0}];
 chunks.configure('test-unchanged-scene',{
  worldCells,requireRaster:true,timeoutMs:0,
  buildTile:t=>new Promise(resolve=>{
   started.push(t.id);pending.push(resolve);
  }),redraw:()=>{},stampTile:t=>'same-content-'+t.id
 });
 chunks.setInteractive(paused);
 const bounds={x:-1200,y:-100,width:2800,height:400};
 const prime=()=>chunks.prime(bounds,{prefetch:{enabled:false}});
 const stop=()=>{
  chunks.clear();
  for(const resolve of pending)resolve(null);
 };
 return {chunks,pending,started,prime,stop};
}

test('idle normal camera starts two DISTINCT currently visible chunks concurrently',async()=>{
 const f=fixture();
 try{
  f.prime();await delay(45);
  assert.equal(f.started.length,2,
   'one foreground plus one spare lane must begin without waiting for first finish');
  assert.notEqual(f.started[0],f.started[1]);
  const d=f.chunks.diagnostics({limit:80});
  assert.equal(d.foreground?.lane,'foreground');
  assert.equal(d.background?.lane,'background');
  assert.equal(f.chunks.stats().visibleAssistStarted,1);
  assert.ok(d.queuedVisible>0,'remaining visible cores stay in bounded queue');
  assert.equal(f.chunks.stats().backgroundPaused,false);
 }finally{f.stop();}
});

test('during an active pan the existing single visible source lane is preserved',async()=>{
 const f=fixture(true);
 try{
  f.prime();await delay(45);
  assert.equal(f.started.length,1);
  assert.equal(f.chunks.stats().visibleAssistStarted,0);
  assert.equal(f.chunks.diagnostics().background,null);
  assert.equal(f.chunks.stats().backgroundPaused,true);
 }finally{f.stop();}
});

test('after pan settles the spare lane immediately helps the waiting visible queue',async()=>{
 const f=fixture(true);
 try{
  f.prime();await delay(35);
  assert.equal(f.started.length,1);
  f.chunks.setInteractive(false);await delay(45);
  assert.equal(f.started.length,2);
  assert.equal(f.chunks.stats().visibleAssistStarted,1);
  assert.ok(f.chunks.diagnostics().queuedVisible>0);
 }finally{f.stop();}
});

test('live editor streamingStats reads actual chunk cache and queue counters',()=>{
 assert.match(app,/streamingStats:\(\)=>\(\{\.\.\.window\.__vedrasStreamingProfile,/);
 assert.match(app,/terrain:terrainChunks\.stats\(\)/);
 assert.match(app,/shore:shorelineChunks\.stats\(\)/);
 assert.match(app,/current:true/);
 assert.match(source,/visibleAssistStarted:\s*0/);
 assert.match(source,/if\(assisting\)stats\.visibleAssistStarted\+\+/);
});

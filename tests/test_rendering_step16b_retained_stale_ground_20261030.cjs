'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../world-tile-streamer.js'),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const flush=async()=>{await tick();await tick();await tick();};
const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
const view={width:640,height:400,zoom:.7,dpr:1,panX:0,panY:0,projectY:.85};
function setup({gate=true,sourceFn=null,requireScenery=true}={}){
 const window={},draws=[];
 vm.runInNewContext(source,{window,console,Date,Promise,AbortController,
  setTimeout,clearTimeout,performance});
 const g={save(){},restore(){},setTransform(){},clearRect(){},
  fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},
  clip(){},fill(){},drawImage(img){draws.push(img.id||'image')}};
 let allowed=gate,calls=0,closed=0;
 const make=(name,preview=false)=>({
  complete:true,preview,revision:JSON.stringify([name,'no-coast','off','off']),
  layers:[
   {layer:'ground',owned:true,image:{id:name+'-ground',width:64,height:64,close(){closed++}}},
   {layer:'scenery',owned:true,image:{id:name+'-scenery',width:64,height:64,close(){closed++}}}
  ]});
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>g},maxTiles:32,maxPixels:200000,
  source:()=>{calls++;return sourceFn?sourceFn(calls,make):make('build-'+calls)},
  canStartSource:()=>allowed,sourceTimeoutMs:0,requireScenery,
  lodSelector:()=> 'mid'});
 return {renderer,draws,make,view,tile,setGate:v=>{allowed=v},
  get calls(){return calls},get closed(){return closed}};
}
test('large selective ground refresh retains visible complete pixels but not exact readiness',async()=>{
 const h=setup();
 h.renderer.request(view,[tile]);await flush();
 assert.equal(h.renderer.stats().tiles,1);
 let display=h.renderer.render(view);
 assert.equal(display.exact,1);
 h.renderer.invalidateTiles(new Set([tile.id]),'image-ready-ground-selective');
 assert.equal(h.renderer.stats().tiles,1,'previous full packet must not be destroyed');
 assert.equal(h.renderer.stats().staleTiles,1);
 const first=h.draws.length;
 display=h.renderer.render(view);
 assert.ok(h.draws.length>first,'the previous packet is still composited');
 assert.equal(display.stale,1);
 assert.equal(display.exact,0);
 assert.equal(h.renderer.stats().progress.exact,0);
 assert.equal(h.renderer.stats().progress.stale,1);
 const record=h.renderer.diagnostics().tiles[0];
 assert.equal(record.stale,true);
 assert.equal(record.state,'stale-needs-refresh');
 assert.equal(h.closed,0,'visible owned bitmaps must remain allocated until replacement');
 h.renderer.invalidate('test-cleanup');
 assert.equal(h.closed,2);
});
test('a fresh exact bake atomically replaces and releases only its stale predecessor',async()=>{
 let resolveSecond;
 const h=setup({sourceFn:(n,make)=>n===1?make('first'):
  new Promise(resolve=>{resolveSecond=()=>resolve(make('second'))})});
 h.renderer.request(view,[tile]);await flush();
 h.renderer.invalidateTiles([tile.id],'image-ready-ground-selective');
 h.renderer.request(view,[tile]);await flush();
 assert.equal(h.calls,2);
 assert.equal(h.renderer.stats().staleTiles,1);
 assert.equal(h.closed,0);
 assert.equal(h.renderer.render(view).stale,1);
 resolveSecond();await flush();
 assert.equal(h.renderer.stats().tiles,1);
 assert.equal(h.renderer.stats().staleTiles,0);
 assert.equal(h.renderer.render(view).exact,1);
 assert.equal(h.renderer.stats().progress.stale,0);
 assert.equal(h.closed,2,'only the retired image pair is released');
});
test('retained stale packet does not suppress requeue after source resources are ready',async()=>{
 const h=setup();
 h.renderer.request(view,[tile]);await flush();
 h.renderer.invalidateTiles([tile.id],'image-ready-ground-selective');
 h.setGate(false);
 for(let i=0;i<8;i++)h.renderer.request(view,[tile]);
 await flush();
 assert.equal(h.calls,1);
 assert.equal(h.renderer.stats().staleTiles,1);
 assert.equal(h.renderer.stats().retryExhausted,0);
 h.setGate(true);
 h.renderer.request(view,[tile]);await flush();
 assert.equal(h.calls,2);
 assert.equal(h.renderer.stats().staleTiles,0);
});
test('global and authored scene changes still hard-evict all stale packets',async()=>{
 const h=setup();
 h.renderer.request(view,[tile]);await flush();
 h.renderer.invalidateTiles([tile.id],'image-ready-ground-selective');
 h.renderer.invalidateTiles([tile.id],'scene-change');
 assert.equal(h.renderer.stats().tiles,0);
 assert.equal(h.closed,2);
 h.renderer.request(view,[tile]);await flush();
 h.renderer.invalidateTiles([tile.id],'terrain-core-revision-changed');
 assert.equal(h.renderer.stats().staleTiles,1,'prepared revision changes use the same retained swap');
 h.renderer.invalidate('authored-terrain-change');
 assert.equal(h.renderer.stats().tiles,0);
 assert.equal(h.closed,4);
});
test('temporary stale is not double-invalidated when source revision reconciliation catches up',async()=>{
 const h=setup();
 h.renderer.request(view,[tile]);await flush();
 h.renderer.invalidateTiles([tile.id],'image-ready-ground-selective');
 const n=h.renderer.reconcileGroundRevisions(new Map([[tile.id,
  JSON.stringify(['later','no-coast','off','off'])]]));
 assert.equal(n,0);
 assert.equal(h.renderer.stats().staleTiles,1);
 assert.equal(h.closed,0);
 h.renderer.invalidate('cleanup');
});
test('fresh alternative LOD takes precedence over stale higher resolution fallback',()=>{
 const h=setup({sourceFn:()=>null});
 assert.equal(h.renderer.seed(tile,'mid',h.make('mid-fresh')),true);
 assert.equal(h.renderer.seed(tile,'near',h.make('near-before')),true);
 h.renderer.invalidateTiles([tile.id],'image-ready-ground-selective',['near']);
 h.renderer.request(view,[tile]);
 const display=h.renderer.render(view);
 assert.equal(display.stale,0,'prefer a nonstale complete image');
 assert.equal(display.exact,1);
 h.renderer.invalidate('cleanup');
});
test('preview packets are never kept as authoritative stale complete fallback',()=>{
 const h=setup();
 const preview=h.make('preview',true);
 assert.equal(h.renderer.seed(tile,'mid',preview),true);
 h.renderer.invalidateTiles([tile.id],'image-ready-ground-selective');
 assert.equal(h.renderer.stats().staleTiles,0);
 assert.equal(h.renderer.stats().tiles,0);
 assert.equal(h.closed,2);
});
test('unauthorized hidden tile cannot reuse previously retained image after fog visibility changes',async()=>{
 const h=setup();
 h.renderer.request(view,[tile]);await flush();
 h.renderer.invalidateTiles([tile.id],'image-ready-ground-selective');
 h.draws.length=0;
 h.renderer.request(view,[{...tile,visibility:'unknown'}]);
 h.renderer.render(view);
 assert.equal(h.draws.length,0,'an unknown tile is not placed in authorized render list');
 assert.equal(h.renderer.stats().visible,0);
 h.renderer.invalidate('cleanup');
});
test('late source errors keep visible fallback and report failure, not a falsely ready tile',async()=>{
 const h=setup({sourceFn:(n,make)=>n===1?make('old'):null});
 h.renderer.request(view,[tile]);await flush();
 h.renderer.invalidateTiles([tile.id],'image-ready-ground-selective');
 h.renderer.request(view,[tile]);await flush();
 assert.equal(h.renderer.stats().staleTiles,1);
 assert.equal(h.renderer.render(view).exact,0);
 assert.equal(h.renderer.render(view).stale,1);
 h.renderer.invalidate('cleanup');
});

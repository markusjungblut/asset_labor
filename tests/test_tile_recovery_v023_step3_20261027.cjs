'use strict';
/* v0.23 step 3: targeted tile-lifecycle regressions.
 * Run: node --test tests/test_tile_recovery_v023_step3_20261027.cjs
 */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const flush=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
function clock(){
 let now=0,sequence=0;const tasks=new Map();
 const setTimeout=(fn,delay=0)=>{
  const id=++sequence;tasks.set(id,{due:now+delay,fn});return id;
 };
 const clearTimeout=id=>tasks.delete(id);
 function advance(ms){
  const end=now+ms;
  for(let i=0;i<500;i++){
   const next=[...tasks].filter(([,v])=>v.due<=end).
    sort((a,b)=>a[1].due-b[1].due||a[0]-b[0])[0];
   if(!next){now=end;return;}
   now=next[1].due;tasks.delete(next[0]);next[1].fn();
  }
  throw Error('Unbounded callback cycle');
 }
 return {now:()=>now,tasks,advance,Date:{now:()=>now},
  performance:{now:()=>now},setTimeout,clearTimeout,
  requestIdleCallback:fn=>setTimeout(fn,1)};
}
function chunkHarness(build,{requireRaster=true,timeoutMs=1000,stampTile=null}={}){
 const time=clock(),sandbox={window:{},console:{error(){}},...time};
 vm.runInNewContext(read('chunks.js'),sandbox);
 const renderer=sandbox.window.VedrasChunks.create({size:512});
 const options={worldCells:[{q:0,r:0}],buildTile:build,redraw(){},
  requireRaster,timeoutMs,stampTile,diagnosticLod:'near'};
 renderer.configure('scene-A',options);
 return {...time,renderer,
  prime:()=>renderer.prime({x:-10,y:-10,width:30,height:30},
   {prefetch:{enabled:false}}),
  configure:signature=>renderer.configure(signature,options),
  tile:()=>renderer.diagnostics().tiles.find(t=>t.id==='0,0')};
}
function worldHarness(source,{maxAttempts=4,sourceTimeoutMs=1000}={}){
 const time=clock(),sandbox={window:{},console:{warn(){}},...time};
 vm.runInNewContext(read('world-tile-streamer.js'),sandbox);
 const renderer=sandbox.window.VedrasWorldTiles.create({
  canvas:{getContext:()=>({})},source,requireScenery:true,
  maxAttempts,sourceTimeoutMs});
 const view={width:800,height:600,dpr:1,zoom:1,panX:0,panY:0};
 const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 return {...time,renderer,view,tile,
  request:()=>renderer.request(view,[tile]),current:()=>renderer.diagnostics().tiles[0]};
}
const canvas=()=>({raster:{canvas:{width:16,height:16}}});
const packet=()=>({complete:true,layers:[
 {layer:'ground',image:{width:32,height:32}},
 {layer:'scenery',image:{width:32,height:32}}]});
test('temporary empty terrain result retries and becomes a drawable cache entry',()=>{
 let attempts=0;
 const h=chunkHarness(t=>t.id==='0,0'&&attempts++===0?null:canvas());
 h.prime();h.advance(0);
 assert.equal(h.renderer.has('0,0'),false,'no false positive cached terrain');
 assert.equal(h.tile().state,'retry-wait');
 h.advance(300);
 assert.equal(h.tile().state,'ready');
 assert.ok(h.renderer.has('0,0'));
 assert.ok(h.renderer.readyTiles({x:0,y:0,width:1,height:1})
  .some(v=>v.tile.id==='0,0'));
});
test('permanent empty terrain is exhausted and explained instead of spinning',()=>{
 let calls=0;const h=chunkHarness(()=>{calls++;return null;});
 h.prime();h.advance(5000);
 assert.equal(h.tile().state,'retry-exhausted');
 assert.equal(h.tile().terminal,true);
 const before=calls;h.prime();h.advance(1000);
 assert.equal(calls,before,'exhausted tile must not be scheduled again');
 assert.equal(h.renderer.has('0,0'),false);
});
test('empty tiles in non-terrain layers remain valid and cached',()=>{
 const h=chunkHarness(()=>null,{requireRaster:false});
 h.prime();h.advance(0);
 assert.equal(h.tile().state,'cached-empty');
 assert.ok(h.renderer.has('0,0'));
});
test('hanging terrain promise times out and late bitmap is released',async()=>{
 let finish,closed=0;
 const h=chunkHarness(t=>t.id==='0,0'?
  new Promise(resolve=>{finish=resolve;}):canvas());
 h.prime();h.advance(0);
 assert.equal(h.tile().state,'building');
 h.advance(1000);
 assert.equal(h.tile().state,'retry-wait');
 finish({raster:{canvas:{width:16,height:16,close(){closed++;}}}});
 await flush();
 assert.equal(closed,1);
 assert.equal(h.renderer.has('0,0'),false);
});
test('changed terrain stamp is queued again when obsolete async result settles',async()=>{
 let stamp='a',resolveFirst,builds=0,closed=0;
 const h=chunkHarness(t=>{
  if(t.id!=='0,0')return canvas();
  if(++builds===1)return new Promise(ok=>{resolveFirst=ok;});
  return canvas();
 },{stampTile:()=>stamp});
 h.prime();h.advance(0);
 stamp='b';
 resolveFirst({raster:{canvas:{width:16,height:16,close(){closed++;}}}});
 await flush();h.advance(0);
 assert.equal(h.tile().state,'ready');
 assert.equal(h.tile().stampMatches,true);
 assert.equal(closed,1);
 assert.equal(builds,2);
});
test('world source-null is retried while unknown tiles stay excluded',async()=>{
 let calls=0;const h=worldHarness(()=>++calls<3?null:packet());
 h.request();
 await flush();assert.equal(h.current().state,'source-null');
 h.advance(400);await flush();
 h.advance(800);await flush();
 assert.equal(calls,3);
 assert.equal(h.current().state,'ready');
 const unknown={...h.tile,id:'1,0',visibility:'unknown'};
 h.renderer.request(h.view,[h.tile,unknown]);
 assert.equal(h.renderer.stats().visible,1);
});
test('incomplete world packets never bypass cloud-ready constraints',async()=>{
 let count=0;
 const h=worldHarness(()=>{count++;return {complete:true,
  layers:[{layer:'ground',image:{width:10,height:10}}]};},
  {maxAttempts:3});
 h.request();await flush();
 h.advance(400);await flush();h.advance(800);await flush();
 assert.equal(count,3);
 assert.equal(h.current().state,'retry-exhausted');
 assert.equal(h.current().terminal,true);
 assert.equal(h.renderer.stats().tiles,0);
});
test('world source timeout frees slot and discards late owned bitmaps',async()=>{
 let finish,closed=0,calls=0;
 const h=worldHarness(()=>{
  if(++calls===1)return new Promise(resolve=>{finish=resolve;});
  return packet();
 });
 h.request();await flush();
 h.advance(1000);
 assert.equal(h.current().state,'source-timeout');
 h.advance(400);await flush();
 assert.equal(h.current().state,'ready');
 finish({layers:[{layer:'ground',owned:true,
  image:{width:10,height:10,close(){closed++;}}}]});
 await flush();
 assert.equal(closed,1);
 assert.equal(h.renderer.stats().tiles,1);
});
test('direct bake permits prepared core, but snapshot path still requires painted version',()=>{
 const s=read('app.js'),start=s.indexOf('function tileArtworkReady(t){'),
  end=s.indexOf('\nfunction seedReadyWorldTiles()',start);
 assert.ok(start>=0&&end>start);
 const source=s.slice(start,end);
 const core={artwork:{version:7}},sandbox={
  paintedTerrainCore:()=>null,currentTerrainCore:()=>core,
  terrainChunks:{paintedVersions:()=>new Map()},
  // Step 8 coast readiness lives outside the source slice tested here.
  shorelineTileStatus:()=>true,
  state:{objects:false}};
 const f=vm.runInNewContext(source+';({tileArtworkReady,tileArtworkStatus});',sandbox);
 const tile={id:'0,0',x:0,y:0,size:512};
 assert.equal(f.tileArtworkReady(tile),false);
 assert.equal(f.tileArtworkStatus(tile,null,true),true);
 const bake=s.slice(s.indexOf('async function bakeWorldTile('),
  s.indexOf('\nlet fastInteracting='));
 assert.match(bake,/if\(!snapshotReady&&!tileArtworkStatus\(t,null,true\)\)return null/);
 assert.match(bake,/drawGround\(\);drawRoads\(\)/);
 assert.match(bake,/if\(signal\?\.aborted\|\|!tileArtworkReady\(t\)\)return null/);
});

test('a finished terrain core rearms an exhausted world tile without pan or scene change',async()=>{
 let ready=false,requests=0;
 const h=worldHarness(()=>{requests++;return ready?packet():null;},
  {maxAttempts:3});
 h.request();await flush();
 h.advance(400);await flush();
 h.advance(800);await flush();
 assert.equal(h.current().state,'retry-exhausted');
 ready=true;
 assert.equal(h.renderer.terrainReady('0,0'),1);
 await flush();
 assert.equal(h.current().state,'ready');
 assert.equal(requests,4);
 // A hidden world position cannot be rearmed by a terrain readiness event.
 h.renderer.request(h.view,[{...h.tile,visibility:'unknown'}]);
 assert.equal(h.renderer.terrainReady('0,0'),0);
});

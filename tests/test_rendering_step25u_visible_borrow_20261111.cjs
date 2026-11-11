'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const runtime=fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8');
const policy=fs.readFileSync(path.join(root,'frozen-map-view-policy.js'),'utf8');
const game=fs.readFileSync(path.join(root,'frozen-map-game.js'),'utf8');
const html=fs.readFileSync(path.join(root,'frozen-map-game.html'),'utf8');
const SCENE='v1-12345678';
function fixture({visibleBorrow=true,prefetchGuard=true}={}){
 const window={};vm.runInNewContext(policy,{window});
 const ctx=()=>({setTransform(){},save(){},restore(){},beginPath(){},
  moveTo(){},lineTo(){},closePath(){},clip(){},clearRect(){},
  fillRect(){},fill(){},drawImage(){}});
 const canvas={width:0,height:0,getContext:ctx,
  getBoundingClientRect:()=>({width:400,height:240})};
 const document={createElement:()=>({getContext:ctx})};
 let time=0;
 vm.runInNewContext(runtime,{window,document,console,
  performance:{now:()=>++time},requestAnimationFrame:()=>{}});
 const records=new Map(),pending=new Map(),started=[];
 for(let ix=-7;ix<=7;ix++)for(let iy=-4;iy<=4;iy++){
  const id=ix+','+iy,key=SCENE+'|near|'+id;
  const png={width:64,height:64};
  records.set(key,{key,sceneKey:SCENE,level:'near',
   tile:{id,x:ix*512,y:iy*512,size:512},
   layers:[{layer:'ground',png},{layer:'scenery',png}]});
 }
 const storage={
  keys:async prefix=>[...records.keys()].filter(k=>k.startsWith(prefix)),
  get:key=>{
   started.push(key);
   return new Promise(resolve=>pending.set(key,()=>{
    pending.delete(key);resolve(records.get(key));
   }));
  }
 };
 const player=window.VedrasFrozenMap.create({
  canvas,storage,visibleBorrow,prefetchGuard,directionalPrefetch:false,
  useLayerCache:false,overview1x:false,maxDecodedPixels:30000000,
  decode:async png=>({...png,close(){}})
 });
 return {player,pending,started};
}
const settle=async()=>{
 for(let i=0;i<10;i++)await Promise.resolve();
};
async function prepare(options){
 const f=fixture(options);
 await f.player.load(SCENE,'near',
  {zoom:.85,panX:0,panY:0,projectY:.85,dpr:1.25},
  [{q:0,r:0,x:0,y:0,radius:145,visibility:'visible'}]);
 for(let i=0;i<25;i++){
  f.player.draw();await settle();
  const r=f.player.report();
  // All four visible hex-region tiles have decoded. Hold ONE
  // offscreen speculative request unresolved to reproduce a slow I/O.
  if(r.decoded>=4&&r.activePrefetch===1&&r.pending===1)
   return f;
  for(const finish of [...f.pending.values()])finish();
  await settle();
 }
 assert.fail('Could not establish warm foreground + slow prefetch');
}
async function sample(visibleBorrow){
 const f=await prepare({visibleBorrow});
 const prior=f.player.report();
 assert.equal(prior.activePrefetch,1);
 const previousCount=f.started.length;
 const slowPrefetch=[...f.pending.keys()];
 // Four new visible tiles across a sudden wide camera move.
 f.player.setPose({panX:-3200});
 f.player.draw();await settle();
 const r=f.player.report();
 const startedNow=f.started.slice(previousCount);
 const result={r,prior,slowPrefetch,startedNow};
 f.player.stop();
 for(const finish of [...f.pending.values()])finish();
 await settle();
 return result;
}
test('25U borrows one background slot so third urgent visible read starts immediately',async()=>{
 const on=await sample(true),off=await sample(false);
 assert.equal(on.slowPrefetch.length,1);
 assert.equal(off.slowPrefetch.length,1);
 assert.equal(on.startedNow.length,3);
 assert.equal(off.startedNow.length,2);
 assert.equal(on.r.visibleReadStarts-on.prior.visibleReadStarts,3);
 assert.equal(off.r.visibleReadStarts-off.prior.visibleReadStarts,2);
 assert.equal(on.r.visibleBorrowStarts,1);
 assert.equal(off.r.visibleBorrowStarts,0);
 assert.equal(on.r.peakInFlight,4);
 assert.equal(off.r.peakInFlight,3);
 assert.equal(on.r.pending,4);
 assert.equal(off.r.pending,3);
 assert.ok(on.r.visibleWaitingOnPrefetch<off.r.visibleWaitingOnPrefetch);
 assert.equal(on.r.failures,0);assert.equal(off.r.failures,0);
 assert.equal(on.r.saved,off.r.saved);
 assert.equal(on.r.maxDecodedPixels,off.r.maxDecodedPixels);
});
test('25U never opens a fifth request while one speculative and three visible are pending',async()=>{
 const f=await prepare({visibleBorrow:true});
 f.player.setPose({panX:-3200});
 for(let i=0;i<5;i++){f.player.draw();await settle();}
 const r=f.player.report();
 assert.equal(r.visibleBorrowStarts,1);
 assert.equal(r.pending,4);
 assert.equal(r.peakInFlight,4);
 assert.equal(r.activePrefetch,1);
 assert.equal(r.failures,0);
 f.player.stop();
 assert.equal(f.player.report().pending,0);
 for(const finish of [...f.pending.values()])finish();
 await settle();
});
test('25U never borrows when only foreground loads are in flight',async()=>{
 const f=fixture({visibleBorrow:true});
 await f.player.load(SCENE,'near',
  {zoom:.85,panX:0,panY:0,projectY:.85,dpr:1.25},
  [{q:0,r:0,x:0,y:0,radius:145,visibility:'visible'}]);
 for(let i=0;i<4;i++){f.player.draw();await settle();}
 const r=f.player.report();
 assert.equal(r.pending,3);
 assert.equal(r.activePrefetch,0);
 assert.equal(r.visibleBorrowStarts,0);
 assert.equal(r.peakInFlight,3);
 f.player.stop();
 for(const finish of [...f.pending.values()])finish();
 await settle();
});
test('25U opt-out and existing guarded limits preserve old semantics',()=>{
 assert.match(game,/params\.get\('visibleBorrow'\)!=='0'/);
 assert.match(runtime,/visibleBorrow=true/);
 assert.match(runtime,/MAX_INFLIGHT=3,MAX_SPECULATIVE=1/);
 assert.match(runtime,/loading\.size===MAX_INFLIGHT/);
 assert.match(html,/step25u-visible-borrow/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 for(const source of [runtime,game])assert.doesNotThrow(()=>new Function(source));
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const runtime=fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8');
const policy=fs.readFileSync(path.join(root,'frozen-map-view-policy.js'),'utf8');
const game=fs.readFileSync(path.join(root,'frozen-map-game.js'),'utf8');
const html=fs.readFileSync(path.join(root,'frozen-map-game.html'),'utf8');
const key=id=>'v1-0374527a|near|'+id;

function createFixture({streamingWorldCache=true}={}){
 const w={},calls=[],fogReadiness=[],recordCalls=[],dirtyOps=[];
 vm.runInNewContext(policy,{window:w});
 w.VedrasCloudArtwork={create(){return {
  setSeed(){},setAssets(){},stats(){return {bases:0}},
  drawBase(g){g.fillRect(0,0,500,320)},
  drawTransitions(){},drawUnready(g,view,cells,isReady){
   fogReadiness.push(cells.map(c=>({id:c.q+','+c.r,ready:isReady(c)})));
  }
 }}};
 const ctx=()=>({
  setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
  lineTo(){},closePath(){},clip(){},translate(){},scale(){},
  rect(){},clearRect(x,y,width,height){dirtyOps.push({x,y,width,height})},
  fillRect(){},drawImage(im){calls.push(im?.id||'raster')}
 });
 const canvas={width:0,height:0,getContext:ctx,
  getBoundingClientRect(){return {width:500,height:320}}};
 const document={createElement:()=>({width:0,height:0,getContext:ctx})};
 const records=new Map();
 for(const id of ['0,0','1,0']){
  const x=Number(id.split(',')[0])*512;
  records.set(key(id),{key:key(id),sceneKey:'v1-0374527a',
   level:'near',tile:{id,x,y:0,size:512},revision:'r1',
   layers:[
    {layer:'ground',pad:3,png:{id:'G:'+id,width:512,height:512}},
    {layer:'scenery',pad:128,png:{id:'S:'+id,width:512,height:512}}
   ]});
 }
 let releaseSecond;
 const secondReady=new Promise(resolve=>{releaseSecond=()=>resolve(records.get(key('1,0')));});
 const storage={
  async keys(prefix){return [...records.keys()].filter(k=>k.startsWith(prefix));},
  async getVariant(k,variant){
   recordCalls.push({k,variant});
   if(k===key('1,0'))return secondReady;
   return records.get(k);
  }
 };
 let now=0;
 vm.runInNewContext(runtime,{window:w,document,console,
  performance:{now:()=>++now},requestAnimationFrame:()=>{}});
 const player=w.VedrasFrozenMap.create({canvas,storage,
  streamingWorldCache,prefetchGuard:true,overview1x:false,
  maxDecodedPixels:10000000,profiler:null,
  decode:async blob=>({...blob,close(){}})});
 return {player,calls,fogReadiness,recordCalls,releaseSecond,dirtyOps};
}
async function tick(f,n=1){
 for(let i=0;i<n;i++){
  f.player.draw();
  await new Promise(resolve=>setImmediate(resolve));
 }
}
async function prepare(f){
 await f.player.load('v1-0374527a','near',
  {zoom:.8,panX:-250,panY:0,dpr:1.25,projectY:.85},
  [{q:0,r:0,x:256,y:256,radius:80,visibility:'visible'},
   {q:1,r:0,x:620,y:256,radius:80,visibility:'visible'}]);
 await tick(f,3);
 assert.equal(f.player.report().decoded,1,
  'first tile must be decoded; second source request deliberately pending');
 assert.equal(f.player.report().pending,1);
}
test('streaming cached panorama is built ONCE and reused while one visible PNG is missing',async()=>{
 const f=createFixture();await prepare(f);
 const first=f.player.report();
 assert.equal(first.streamingWorldCache,true);
 assert.ok(first.overviewRasterBuilds>0,
  'partial real panorama must build while one visible PNG remains pending');
 assert.ok(first.overviewStreamingBuilds>0);
 const before={builds:first.overviewRasterBuilds,fallback:first.worldCacheFallbackFrames,
  hits:first.overviewRasterHits};
 await tick(f,9);
 const after=f.player.report();
 assert.equal(after.overviewRasterBuilds,before.builds,
  'identical decoded content cannot rebuild multi-megapixel raster every frame');
 assert.equal(after.worldCacheFallbackFrames,before.fallback,
  'full direct world painting must stop while waiting for the slow tile');
 assert.ok(after.overviewRasterHits>=before.hits+9);
 assert.ok(after.overviewStreamingHits>=9);
 assert.ok(f.fogReadiness.some(a=>a.some(c=>c.id==='1,0'&&!c.ready)),
  'unready terrain must remain concealed despite cached partial landscape');
 f.releaseSecond();
 await tick(f,4);
 const loaded=f.player.report();
 assert.equal(loaded.decoded,2);
 assert.equal(loaded.pending,0);
 assert.ok(loaded.overviewPatchBuilds>0,
  'the incoming tile must update a bounded dirty rectangle, not a full atlas');
 assert.equal(loaded.overviewRasterBuilds,before.builds,
  'new PNG arrival should preserve the existing world raster allocation');
 assert.ok(f.dirtyOps.length>0);
 assert.ok(f.dirtyOps.every(op=>op.width>0&&op.height>0&&
  op.width<1012&&op.height<832),'patch must not repaint whole viewport');
 assert.ok(f.calls.includes('G:1,0')&&f.calls.includes('S:1,0'));
 f.player.stop();
});
test('streamCache=0 preserves legacy per-frame live painter for automated A/B',async()=>{
 const f=createFixture({streamingWorldCache:false});await prepare(f);
 const before=f.player.report();
 assert.equal(before.overviewRasterBuilds,0);
 await tick(f,8);
 const after=f.player.report();
 assert.equal(after.overviewRasterBuilds,0);
 assert.ok(after.worldCacheFallbackFrames>=before.worldCacheFallbackFrames+8);
 f.releaseSecond();
 await tick(f,5);
 assert.ok(f.player.report().overviewRasterBuilds>0);
 assert.equal(f.player.report().failures,0);
 f.player.stop();
});
test('streaming partial cache uses read-only archived data, same Fog mask and LOD',()=>{
 assert.match(game,/params\.get\('streamCache'\)!=='0'/);
 assert.match(html,/step25f-stream-cache/);
 assert.match(runtime,/if\(!streamingWorldCache&&loading\.size&&!visibleComplete\)return false/);
 assert.match(runtime,/signature=bufferKeys\.join\(';'\)/);
 assert.match(runtime,/clipCells\(45\)/);
 assert.match(runtime,/function isHexReady/);
 assert.match(runtime,/function patchOverview/);
 assert.match(runtime,/old.shown=next;old.signature=signature/);
 assert.match(runtime,/clouds\.drawUnready\(ctx,view,cells,ready,fadeOpacity\)/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|source\.put\(|bakeWorldTile\(/);
 for(const s of [runtime,policy,game])assert.doesNotThrow(()=>new Function(s));
});
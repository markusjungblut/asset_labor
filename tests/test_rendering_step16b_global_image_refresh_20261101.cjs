'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../world-tile-streamer.js'),'utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const flush=async()=>{await tick();await tick();await tick();};
const view={width:640,height:400,zoom:.7,dpr:1,panX:0,panY:0,projectY:.85};
const tile=id=>({id,x:Number(id.split(',')[0])*512,
 y:Number(id.split(',')[1])*512,size:512,visibility:'visible'});
function fixture({bake=null,gate=true}={}){
 const window={},draws=[],clips=[];
 vm.runInNewContext(source,{window,Date,Promise,AbortController,
  setTimeout,clearTimeout,performance,console});
 const g={save(){},restore(){},setTransform(){},clearRect(){},
  fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},
  clip(){clips.push('clip')},fill(){},
  drawImage(img){draws.push(img.id||'anonymous')}};
 let closed=0,calls=0,permitted=gate;
 const packet=(id,preview=false)=>({complete:true,preview,
  revision:JSON.stringify([id,'no-coast','off','off']),
  layers:[
   {layer:'ground',owned:true,image:{id:id+'-ground',width:64,height:64,
    close(){closed++}}},
   {layer:'scenery',owned:true,image:{id:id+'-scenery',width:64,height:64,
    close(){closed++}}}
  ]});
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>g},
  source:()=>{calls++;return bake?bake(calls,packet):packet('fresh-'+calls)},
  maxTiles:20,maxPixels:200000,requireScenery:true,
  sourceTimeoutMs:0,canStartSource:()=>permitted,
  lodSelector:()=> 'mid'
 });
 renderer.setFogCells([{q:0,r:0,x:0,y:0,radius:150,
  visibility:'visible'}]);
 return {renderer,packet,draws,clips,view,tile,
  setGate:v=>{permitted=v},get calls(){return calls},
  get closed(){return closed}};
}
test('global asynchronous image refresh keeps one finished viewport tile as stale',async()=>{
 const h=fixture(),a=tile('0,0');
 h.renderer.request(view,[a]);await flush();
 assert.equal(h.renderer.render(view).exact,1);
 assert.equal(h.renderer.stats().tiles,1);
 const before=h.draws.length;
 h.renderer.invalidate('image-ready-ground');
 assert.equal(h.renderer.stats().tiles,1);
 assert.equal(h.renderer.stats().staleTiles,1);
 assert.equal(h.closed,0);
 const result=h.renderer.render(view);
 assert.equal(result.exact,0);
 assert.equal(result.stale,1);
 assert.ok(h.draws.length>before,'old authorized image remains visible');
 assert.equal(h.renderer.diagnostics().tiles[0].state,'stale-needs-refresh');
});
test('Fog authorization remains active after background image refresh',async()=>{
 const h=fixture(),a=tile('0,0');
 h.renderer.request(view,[a]);await flush();
 h.renderer.render(view);const oldClips=h.clips.length;
 assert.ok(oldClips>0,'initial normal renderer must clip authorized hexes');
 h.renderer.invalidate('image-ready-ground');
 h.renderer.render(view);
 assert.ok(h.clips.length>oldClips,
  'image readiness must not erase Fog mask and its clip paths');
 h.draws.length=0;
 h.renderer.request(view,[{...a,visibility:'unknown'}]);
 h.renderer.render(view);
 assert.equal(h.draws.length,0,'hidden tiles are not drawn from stale cache');
});
test('image refresh releases off-camera tiles and never preserves previews',async()=>{
 const h=fixture({bake:(n,packet)=>packet('build-'+n)}),
  a=tile('0,0'),b=tile('1,0');
 h.renderer.request(view,[a]);await flush();
 h.renderer.request(view,[b]);await flush();
 const c=tile('2,0');
 assert.equal(h.renderer.seed(c,'mid',h.packet('preview',true)),true);
 assert.equal(h.renderer.stats().tiles,3);
 h.renderer.invalidate('image-ready-ground');
 assert.equal(h.renderer.stats().tiles,1);
 assert.equal(h.renderer.stats().staleTiles,1);
 assert.equal(h.closed,4,'offscreen complete + preview were released');
});
test('fresh exact source replaces stale global-refresh fallback atomically',async()=>{
 const h=fixture(),a=tile('0,0');
 h.renderer.request(view,[a]);await flush();
 h.renderer.invalidate('image-ready-ground');
 h.renderer.request(view,[a]);await flush();
 assert.equal(h.calls,2);
 assert.equal(h.renderer.stats().tiles,1);
 assert.equal(h.renderer.stats().staleTiles,0);
 assert.equal(h.renderer.render(view).exact,1);
 assert.equal(h.closed,2,'retired bitmaps released only after replacement');
});
test('blocked source keeps last authorized image and remains unready',async()=>{
 const h=fixture(),a=tile('0,0');
 h.renderer.request(view,[a]);await flush();
 h.renderer.invalidate('image-ready-ground');
 h.setGate(false);
 for(let i=0;i<8;i++)h.renderer.request(view,[a]);
 await flush();
 assert.equal(h.calls,1);
 assert.equal(h.renderer.stats().staleTiles,1);
 assert.equal(h.renderer.render(view).stale,1);
 assert.equal(h.renderer.stats().retryExhausted,0);
 h.setGate(true);
 h.renderer.request(view,[a]);await flush();
 assert.equal(h.renderer.stats().staleTiles,0);
});
test('real authored/global scene change still hard-evicts and clears previous mask',async()=>{
 const h=fixture(),a=tile('0,0');
 h.renderer.request(view,[a]);await flush();
 h.renderer.invalidate('scene-change');
 assert.equal(h.renderer.stats().tiles,0);
 assert.equal(h.closed,2);
 const before=h.clips.length;
 h.renderer.render(view);
 // Global authored scene invalidation forgets old authorization until
 // the caller explicitly publishes the newly computed Fog policy.
 assert.equal(h.clips.length,before);
});
test('repeated image-ready callbacks keep stale pixels without unbounded cache growth',async()=>{
 const h=fixture(),a=tile('0,0');
 h.renderer.request(view,[a]);await flush();
 for(let i=0;i<6;i++){
  h.renderer.invalidate('image-ready-ground');
  assert.equal(h.renderer.stats().tiles,1);
  assert.equal(h.renderer.stats().staleTiles,1);
  assert.equal(h.renderer.stats().pixels,8192);
 }
 assert.equal(h.closed,0);
 assert.equal(h.renderer.render(view).stale,1);
});

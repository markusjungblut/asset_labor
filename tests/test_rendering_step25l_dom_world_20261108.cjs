'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const runtime=read('frozen-map-runtime.js'),policy=read('frozen-map-view-policy.js'),
 profiler=read('frozen-map-profiler.js'),html=read('frozen-map-game.html'),
 game=read('frozen-map-game.js');
const SCENE='v1-0374527a',key=id=>SCENE+'|near|'+id;
function fixture(domWorld=true){
 const window={},mainOps=[],offOps=[],fogOps=[],events=[];
 vm.runInNewContext(policy,{window});
 vm.runInNewContext(profiler,{window,performance:{now:()=>0}});
 let now=0;
 function context(ops){return {
  setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
  lineTo(){},closePath(){},clip(){},translate(){},scale(){},rect(){},
  clearRect(){ops.push(['clear'])},fillRect(){ops.push(['fill'])},
  drawImage(...args){ops.push(['image',...args]);},
  fill(){ops.push(['fill'])}
 }}
 const mainCtx=context(mainOps),fogCtx=context(fogOps);
 const canvas={width:0,height:0,getContext:()=>mainCtx,
  getBoundingClientRect:()=>({width:500,height:320})};
 const fogCanvas={width:0,height:0,hidden:true,getContext:()=>fogCtx};
 const worldLayer={hidden:true,firstChild:null,replaceCount:0,
  replaceChildren(...items){this.firstChild=items[0]||null;this.replaceCount++;}};
 const document={createElement(tag){
  assert.equal(tag,'canvas');
  return {width:0,height:0,style:{},getContext:()=>context(offOps)};
 }};
 let release;
 const pending=new Promise(resolve=>{release=()=>resolve(records.get(key('1,0')))});
 const records=new Map();
 for(const id of ['0,0','1,0']){
  const x=+id.split(',')[0]*512;
  records.set(key(id),{key:key(id),sceneKey:SCENE,level:'near',
   tile:{id,x,y:0,size:512},revision:'r1',layers:[
    {layer:'ground',pad:3,png:{width:512,height:512,id:'G:'+id}},
    {layer:'scenery',pad:128,png:{width:768,height:768,id:'S:'+id}}
   ]});
 }
 const storage={async keys(){return [...records.keys()]},
  async getVariant(k){return k===key('1,0')?pending:records.get(k)}};
 window.VedrasCloudArtwork={create:()=>({
  setSeed(){},setAssets(){},stats:()=>({bases:4,pending:0,version:1}),
  drawBase(g,v){events.push({type:'base',g});g.fillRect(0,0,v.width,v.height)},
  drawUnready(g,v,cells,ready,opacity){
   events.push({type:'fog',g,ids:cells.map(c=>({id:c.q+','+c.r,ready:ready(c)}))});
   for(const c of cells)opacity(c,ready(c));
  },
  drawTransitions(g,v,edges){events.push({type:'edge',g,number:edges.length});}
 })};
 vm.runInNewContext(runtime,{window,document,console,
  performance:{now:()=>++now},requestAnimationFrame:()=>{}});
 const player=window.VedrasFrozenMap.create({canvas,
  fogCanvas:domWorld?fogCanvas:null,worldLayer:domWorld?worldLayer:null,
  storage,decode:async im=>({...im,close(){}}),
  overview1x:false,maxDecodedPixels:12000000});
 const pose={zoom:.8,panX:-240,panY:0,dpr:1.25,projectY:.85};
 const cells=[
  {q:0,r:0,x:250,y:0,radius:150,visibility:'visible'},
  {q:1,r:0,x:760,y:0,radius:150,visibility:'visible'}
 ];
 return {player,canvas,fogCanvas,worldLayer,mainOps,offOps,fogOps,
  events,release,async start(){
   await player.load(SCENE,'near',pose,cells);
   for(let n=0;n<4;n++){player.draw();await new Promise(r=>setImmediate(r));}
   assert.equal(player.report().decoded,1);
  },async tick(n=1){
   for(let i=0;i<n;i++){player.draw();await new Promise(r=>setImmediate(r));}
  }};
}
test('DOM opt-in positions existing masked cache exactly where the Canvas blit sampled it',async()=>{
 const f=fixture(true);await f.start();
 const info=f.player.report();
 assert.equal(info.domWorldEnabled,true);
 assert.equal(info.domWorldActive,true);
 assert.equal(info.overviewRasterBuilds,1);
 assert.ok(info.domWorldFrames>0);
 assert.equal(f.worldLayer.hidden,false);
 const buffer=f.worldLayer.firstChild;
 assert.ok(buffer&&buffer.style);
 assert.equal(buffer.style.width,buffer.width/1.25+'px');
 assert.equal(buffer.style.height,buffer.height/1.25+'px');
 assert.ok(buffer.style.transform.startsWith('translate3d('));
 assert.equal(f.fogCanvas.hidden,false);
 const mainBlits=()=>f.mainOps.filter(x=>x[0]==='image'&&x[1]===buffer).length;
 assert.equal(mainBlits(),0,'no world-cache drawImage on main display');
 const replacements=f.worldLayer.replaceCount;
 f.player.setPose({panX:-220,panY:4});await f.tick(1);
 assert.equal(f.worldLayer.firstChild,buffer);
 assert.equal(f.worldLayer.replaceCount,replacements,
  'warm pan only moves the existing canvas, no new allocation/DOM node');
 assert.equal(mainBlits(),0);
 assert.ok(f.events.some(x=>x.type==='fog'&&x.g!==f.canvas.getContext()));
 assert.ok(f.events.some(x=>x.type==='fog'&&x.ids.some(y=>!y.ready)),
  'unready landscape still covered by the unready Fog');
 f.release();await f.tick(5);f.player.stop();
});
test('async arriving tile updates DOM-attached raster rather than revealing stale data',async()=>{
 const f=fixture(true);await f.start();
 const old=f.worldLayer.firstChild;
 const previous=f.player.report().overviewPatchBuilds;
 f.release();await f.tick(6);
 assert.equal(f.player.report().decoded,2);
 assert.ok(f.player.report().overviewPatchBuilds>previous);
 assert.equal(f.worldLayer.firstChild,old,'dirty patch updates same source');
 assert.equal(f.player.report().failures,0);
 assert.ok(f.offOps.some(x=>x[0]==='image'&&x[1].id==='G:1,0'));
 f.player.stop();
 assert.equal(f.worldLayer.hidden,true);
 assert.equal(f.worldLayer.firstChild,null,
  'clearing scene must release previous DOM image buffer');
});
test('legacy browser mode always draws world cache into original canvas, not DOM',async()=>{
 const f=fixture(false);await f.start();
 assert.equal(f.player.report().domWorldEnabled,false);
 assert.equal(f.player.report().domWorldFrames,0);
 assert.ok(f.mainOps.some(x=>x[0]==='image'),
  'original 9-argument world blit remains production default');
 assert.ok(f.events.filter(x=>x.type==='fog')
  .every(x=>x.g===f.canvas.getContext()));
 f.release();await f.tick(4);f.player.stop();
});
test('zoom-in snapshot captures original cloud, DOM world, then secure Fog',async()=>{
 const f=fixture(true);await f.start();
 const buffer=f.worldLayer.firstChild,offset=f.offOps.length;
 assert.equal(f.player.beginZoomPreview({zoomOut:false}),true);
 const images=f.offOps.slice(offset).filter(x=>x[0]==='image');
 const worldIndex=images.findIndex(x=>x[1]===buffer),
  cloudIndex=images.findIndex(x=>x[1]===f.canvas),
  fogIndex=images.findIndex(x=>x[1]===f.fogCanvas);
 assert.ok(cloudIndex>=0&&worldIndex>cloudIndex&&fogIndex>worldIndex,
  'snapshot must preserve cloud-world-fog stack');
 f.player.draw();
 assert.equal(f.worldLayer.hidden,true);
 f.player.endZoomPreview();f.player.draw();
 assert.equal(f.worldLayer.hidden,false);
 f.release();await f.tick(4);f.player.stop();
});
test('opt-in DOM rendering requires Fog overlay, remains covered and archive-read-only',()=>{
 assert.match(html,/id="worldLayer" aria-hidden="true" hidden/);
 assert.match(html,/#worldLayer\[hidden\]\{display:none\}/);
 assert.match(html,/#worldLayer\{[^}]*pointer-events:none/);
 assert.ok(html.indexOf('id="game"')<html.indexOf('id="worldLayer"')&&
  html.indexOf('id="worldLayer"')<html.indexOf('id="fogOverlay"'));
 assert.match(game,/params\.get\('worldDOM'\)==='1'/);
 assert.match(game,/domWorldCompositor\?worldLayer:null/);
 assert.match(runtime,/style\.transform='translate3d\('/);
 assert.match(runtime,/worldLayer&&!zoomPreview&&fogCtx/);
 assert.match(runtime,/hideWorldLayer\(\);domWorldFallbacks/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 for(const source of [runtime,game,policy,profiler])
  assert.doesNotThrow(()=>new Function(source));
});

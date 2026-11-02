'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.join(__dirname,'..');
const file=name=>fs.readFileSync(path.join(dir,name),'utf8');
const runtime=file('frozen-map-runtime.js'),cloud=file('cloud-artwork.js'),
 policy=file('frozen-map-view-policy.js'),game=file('frozen-map-game.js'),
 html=file('frozen-map-game.html');
function scripts(clouds=null){
 const window={},context={window};
 vm.runInNewContext(policy,context);
 if(clouds)window.VedrasCloudArtwork=clouds;
 return {window,context};
}
const plain=x=>JSON.parse(JSON.stringify(x));
function fakeCanvas(w=400,h=240){
 const metrics={draws:0};
 function ctx(){return {
  setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
  lineTo(){},closePath(){},clip(){},fillRect(){},translate(){},scale(){},
  drawImage(){metrics.draws++}
 };}
 const c={width:0,height:0,getContext:()=>ctx(),
  getBoundingClientRect:()=>({width:w,height:h})};
 return {canvas:c,metrics,ctx};
}
function tile(ix,iy){
 const key='v1-0374527a|near|'+ix+','+iy;
 return {key,sceneKey:'v1-0374527a',level:'near',
  revision:'r1',tile:{id:ix+','+iy,x:ix*512,y:iy*512,size:512},
  layers:[{layer:'ground',pad:3,png:{width:250,height:250}},
   {layer:'scenery',pad:128,crop:{x:0,y:0,fullWidth:250,
    fullHeight:250},png:{width:250,height:250}}]};
}
function makePlayer({withClouds=false,clock=null}={}){
 const draws=[],times=[],clouds=withClouds?{
  create:()=>({
   drawBase(){},drawTransitions(){},
   drawUnready(g,view,cells,ready,opacityFor){
    for(const cell of cells)if(cell.visibility==='visible')
     times.push(opacityFor(cell,ready(cell)));
   },
   stats:()=>({bases:4}),setSeed(){},setAssets(){}
  })
 }:null;
 const {window}=scripts(clouds);
 const {canvas,metrics}=fakeCanvas();
 let created=0;
 const document={createElement:()=>({width:0,height:0,
  getContext(){created++;return {
   setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
   lineTo(){},closePath(){},clip(){},drawImage(){},fillRect(){}
  }}})};
 const registry=new Map();
 for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++){
  const t=tile(x,y);registry.set(t.key,t);
 }
 const storage={keys:async prefix=>[...registry.keys()].filter(k=>k.startsWith(prefix)),
  get:async key=>registry.get(key)};
 vm.runInNewContext(runtime,{window,document,performance:{now:()=>clock?.value||0},
  requestAnimationFrame:()=>{},console});
 const player=window.VedrasFrozenMap.create({canvas,storage,
  decode:async png=>({width:png.width,height:png.height,close(){}})});
 return {player,registry,metrics,draws,times,created:()=>created};
}
test('one full hex plus shadow overhang beyond all four viewport edges',()=>{
 const {window}=scripts(),p=window.VedrasFrozenViewPolicy;
 assert.equal(p.MARGIN_WORLD>=p.HEX_WIDTH,true);
 const bounds=p.screenBounds({width:800,height:600,zoom:.25,
  panX:0,panY:0,projectY:.85});
 assert.equal(bounds.minX,-1600-p.MARGIN_WORLD);
 assert.equal(bounds.maxX,1600+p.MARGIN_WORLD);
 assert.ok(bounds.minY<-(600/2)/(.25*.85));
 assert.ok(bounds.maxY>(600/2)/(.25*.85));
 assert.equal(p.visibleTile(0,0,bounds),true);
 assert.equal(p.visibleTile(10,10,bounds),false);
});
test('standard remains 2x, overview uses 1.25x, canvas budget is respected',()=>{
 const {window}=scripts(),p=window.VedrasFrozenViewPolicy;
 assert.equal(p.displayDpr({zoom:.8,width:1252,height:540}),2);
 assert.equal(p.displayDpr({zoom:.3,width:1252,height:540}),1.25);
 assert.ok(p.displayDpr({zoom:.6,width:3200,height:1800})<2);
 assert.match(game,/viewportPolicy|VedrasFrozenViewPolicy/);
});
test('warm far-zoom camera reuses one cached scene raster during short pans',async()=>{
 const {player,created}=makePlayer();
 await player.load('v1-0374527a','near',
  {zoom:.30,panX:0,panY:0,dpr:1.25,projectY:.85},
  [{q:0,r:0,x:256,y:256,radius:140,visibility:'visible'}]);
 // The mock intentionally disables requestAnimationFrame, so the normal
 // browser-driven load chain is not advanced automatically. The renderer
 // requests only 3 tile packets per draw and deliberately skips the panorama
 // build while any packet is still in flight. Drive the mocked cold stream
 // until all 9 fixture tiles have actually decoded, then test WARM panning.
 const total=9;
 for(let attempt=0;attempt<30;attempt++){
  player.draw();
  await new Promise(resolve=>setImmediate(resolve));
  const progress=player.report();
  if(progress.decoded===total&&progress.pending===0)break;
 }
 const ready=player.report();
 assert.equal(ready.decoded,total,
  'all requested fixture tiles should finish decoding before warm-cache assertions');
 assert.equal(ready.pending,0,'warm scene must have no in-flight tile decodes');
 player.draw();
 const before=player.report();
 assert.ok(before.overviewRasterBuilds>=1,'overview should be prepared after load settles');
 for(let i=1;i<=5;i++){
  player.setPose({panX:i*5,panY:i*3});player.draw();
 }
 const after=player.report();
 assert.equal(after.overviewRasterBuilds,before.overviewRasterBuilds);
 assert.ok(after.overviewRasterHits>=before.overviewRasterHits+5);
 assert.ok(created()>=1);
 assert.equal(after.failures,0);
 player.stop();
});
test('clouds dissolve only when once seen unfinished on screen',async()=>{
 const clock={value:0};
 const {player,times}=makePlayer({withClouds:true,clock});
 await player.load('v1-0374527a','near',
  {zoom:.4,panX:-100,panY:-20,dpr:1.25,projectY:.85},
  [{q:0,r:0,x:256,y:256,radius:140,visibility:'visible'}]);
 player.draw();
 assert.equal(times.at(-1),1,'unfinished cloud remains opaque');
 await new Promise(resolve=>setTimeout(resolve,0));
 clock.value=100;player.draw();
 assert.equal(times.at(-1),1,'fade begins after image becomes ready');
 clock.value=380;player.draw();
 assert.ok(times.at(-1)>0&&times.at(-1)<1,'opacity eases away');
 clock.value=700;player.draw();
 assert.equal(times.at(-1),0,'cloud completely dissolved');
 player.setPose({panX:-105});clock.value=900;player.draw();
 assert.equal(times.at(-1),0,'no cloud reappears on camera movement');
 player.stop();
});
test('runtime remains independent from editor, source baking and multiplayer fog claims',()=>{
 for(const name of ['frozen-map-runtime.js','frozen-map-view-policy.js',
  'cloud-artwork.js','frozen-map-game.js'])
  assert.doesNotThrow(()=>new Function(file(name)),name);
 assert.match(runtime,/prefetch\.sort/);
 assert.match(runtime,/unreadyObserved\.has\(id\)/);
 assert.match(runtime,/paintOverview\(ctx,view,tiles,dpr\)/);
 assert.match(runtime,/bufferKeys\.join\(';\'\)/);
 assert.match(runtime,/bufferedBounds\)\)\.map\(\(\[key\]\)=>key\)\.sort\(\)/);
 assert.match(html,/frozen-map-view-policy\.js/);
 assert.match(html,/step21-overscan-cache/);
 assert.doesNotMatch(runtime,/drawGround\(|drawRoads\(|bakeWorldTile\(/);
 assert.doesNotMatch(file('frozen-map-view-policy.js'),/source\.put\(/);
});

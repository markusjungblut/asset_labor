'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');
const cloudSource=source('cloud-artwork.js'),
 runtimeSource=source('frozen-map-runtime.js'),
 policySource=source('frozen-map-view-policy.js'),
 gameSource=source('frozen-map-game.js'),
 gameHtml=source('frozen-map-game.html');
function graphicContext(log=[],w=384,h=384){
 let alpha=1,stack=[];
 const g={
  get globalAlpha(){return alpha},
  set globalAlpha(v){alpha=v},
  save(){stack.push(alpha)},
  restore(){alpha=stack.pop()??1},
  translate(){},scale(){},setTransform(){},beginPath(){},moveTo(){},
  lineTo(){},closePath(){},clip(){},fill(){},
  fillRect(){},putImageData(){},clearRect(){},
  drawImage(image){log.push({image,alpha})},
  getImageData(){return {data:new Uint8ClampedArray(w*h*4)}},
  imageSmoothingEnabled:true,
 };
 return g;
}
test('all cloud layers actually blend with the same opacity, not just background hex',async()=>{
 let generated=0;
 const window={};
 const document={createElement:()=>({
  kind:'offscreen-'+(++generated),width:384,height:384,
  getContext(){return graphicContext();}
 })};
 class FakeImage{
  set src(v){queueMicrotask(()=>this.onload?.());}
 }
 vm.runInNewContext(cloudSource,{window,document,Image:FakeImage,console});
 const clouds=window.VedrasCloudArtwork.create();
 clouds.setAssets([{path:'assets/clouds/opaque_test.png'}]);
 for(let i=0;i<4;i++)await Promise.resolve();
 assert.equal(clouds.stats().bases,1,'one real artwork texture loaded');
 const log=[],g=graphicContext(log);
 const cells=[{q:0,r:0,x:0,y:0,radius:148,visibility:'visible'}],
  view={zoom:1,width:800,height:600,panX:0,panY:0,projectY:.85};
 assert.equal(clouds.drawUnready(g,view,cells,()=>true,()=>.50),1);
 assert.equal(log.length,1,'cloud base, hard art and fringe must be precomposited');
 assert.equal(log[0].alpha,.5,'actual cloud artwork is 50 % transparent');
 assert.equal(clouds.drawUnready(g,view,cells,()=>true,()=>0),0);
 assert.equal(log.length,1,'fully dissolved cloud draws no graphic');
 assert.equal(clouds.drawUnready(g,view,cells,()=>false,()=>1),1);
 assert.equal(log.at(-1).alpha,1,'unfinished fog is still fully opaque');
});
function setup(){
 const window={};
 vm.runInNewContext(policySource,{window});
 const displayLog=[];
 const fakeContext=()=>graphicContext(displayLog,1,1);
 const canvas={width:0,height:0,
  getContext:()=>fakeContext(),
  getBoundingClientRect:()=>({width:400,height:240})};
 // Canvas backing copies a previously authorized frame. The test has no
 // editor or authoring image sources.
 const document={createElement:()=>({
  kind:'preview-canvas',width:0,height:0,
  getContext:()=>fakeContext()})};
 const tiles=new Map();
 for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++){
  const key='v1-0374527a|near|'+x+','+y;
  tiles.set(key,{key,sceneKey:'v1-0374527a',level:'near',
   revision:'r1',tile:{id:x+','+y,x:x*512,y:y*512,size:512},
   layers:[{layer:'ground',pad:3,png:{width:200,height:200}},
    {layer:'scenery',pad:128,crop:{x:0,y:0,fullWidth:200,
     fullHeight:200},png:{width:200,height:200}}]});
 }
 const store={async get(key){return tiles.get(key)},
  async keys(prefix){return [...tiles.keys()].filter(k=>k.startsWith(prefix))}};
 let now=100;
 vm.runInNewContext(runtimeSource,{window,document,console,
  performance:{now:()=>now},requestAnimationFrame:()=>{}});
 const player=window.VedrasFrozenMap.create({canvas,storage:store,
  decode:async png=>({width:png.width,height:png.height,close(){}})});
 return {player,displayLog,advance:ms=>{now+=ms}};
}
test('wheel-zoom preview reprojects an authorized snapshot and avoids full world redraw per event',async()=>{
 const {player,displayLog}=setup();
 await player.load('v1-0374527a','near',
  {zoom:.7,panX:0,panY:0,dpr:2,projectY:.85},
  [{q:0,r:0,x:0,y:0,radius:148,visibility:'visible'}]);
 for(let i=0;i<25;i++){
  player.draw();
  await new Promise(resolve=>setImmediate(resolve));
  if(player.report().decoded===9&&player.report().pending===0)break;
 }
 player.draw();
 assert.ok(player.report().decoded>=1);
 const start=displayLog.length;
 assert.ok(player.beginZoomPreview(),'snapshot of authorized canvas created');
 for(let i=1;i<=4;i++){
  player.setPose({zoom:.7/(1+i*.15),panX:i*8,panY:i*5});
  player.draw();
 }
 const during=displayLog.slice(start);
 assert.equal(player.report().zoomPreviewFrames,4);
 // One snapshot copy, four transformed draws, no tile-layer paint passes.
 assert.equal(during.length,5,'zoom gestures must not recompose 2 world layers');
 assert.ok(during.slice(1).every(e=>e.image.kind==='preview-canvas'));
 assert.equal(player.endZoomPreview({waitForVisible:true}),true);
 assert.equal(player.report().zoomPreviewActive,false);
 const before=displayLog.length;
 player.draw();
 assert.ok(displayLog.length>before,'full quality after gesture');
 player.stop();
});
test('zoom gesture defers canvas DPR reallocations until settle',()=>{
 assert.match(gameSource,/beginZoomPreview\(\)/);
 assert.match(gameSource,/endZoomPreview\(\{waitForVisible:true,maxHoldMs:950\}\)/);
 assert.match(gameSource,/\{deferDpr:true\}/);
 assert.match(gameSource,/if\(!deferDpr&&Math\.abs\(outDpr/);
 assert.match(gameHtml,/step22/);
});

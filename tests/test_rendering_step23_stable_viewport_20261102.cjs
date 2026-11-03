'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const file=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=file('frozen-map-game.html'),game=file('frozen-map-game.js'),
 runtime=file('frozen-map-runtime.js'),policy=file('frozen-map-view-policy.js');
function makePlayer(){
 const window={};
 vm.runInNewContext(policy,{window});
 let cloudDraws=0;
 window.VedrasCloudArtwork={create:()=>({
  drawBase(){cloudDraws++},drawTransitions(){},
  drawUnready(){},setSeed(){},setAssets(){},stats(){return {bases:4}}
 })};
 const calls=[],contexts=[];
 const makeContext=()=>{
  const g={
   setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
   lineTo(){},closePath(){},clip(){},fill(){},fillRect(){},
   translate(){},scale(){},
   drawImage(...args){calls.push({image:args[0],args})},
   globalAlpha:1,imageSmoothingEnabled:true
  };
  contexts.push(g);return g;
 };
 let nextCanvasId=0;
 const document={createElement:()=>{
  const canvas={kind:'offscreen',id:++nextCanvasId,width:0,height:0,
   getContext(){return makeContext()}};
  return canvas;
 }};
 const canvas={kind:'display',width:0,height:0,
  getContext:()=>makeContext(),
  getBoundingClientRect:()=>({width:400,height:240})};
 const records=new Map();
 for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++){
  const key='v1-0374527a|near|'+x+','+y;
  records.set(key,{key,sceneKey:'v1-0374527a',level:'near',
   tile:{id:x+','+y,x:x*512,y:y*512,size:512},
   layers:[
    {layer:'ground',pad:3,png:{width:250,height:250}},
    {layer:'scenery',pad:128,
     crop:{x:0,y:0,fullWidth:250,fullHeight:250},
     png:{width:250,height:250}}
   ]});
 }
 let now=100;
 vm.runInNewContext(runtime,{window,document,
  requestAnimationFrame:()=>{},performance:{now:()=>now},console});
 const p=window.VedrasFrozenMap.create({canvas,
  storage:{keys:async prefix=>[...records.keys()].filter(k=>k.startsWith(prefix)),
   get:async key=>records.get(key)},
  decode:async image=>({width:image.width,height:image.height,close(){}})});
 return {player:p,calls,cloudDraws:()=>cloudDraws,
  advance:ms=>{now+=ms},contexts};
}
async function warmed(p){
 await p.load('v1-0374527a','near',
  {zoom:.8,panX:0,panY:0,dpr:2,projectY:.85},
  [{q:0,r:0,x:0,y:0,radius:148,visibility:'visible'}]);
 for(let i=0;i<35;i++){
  p.draw();
  await new Promise(resolve=>setImmediate(resolve));
  if(p.report().decoded===9&&p.report().pending===0)break;
 }
 assert.equal(p.report().decoded,9);
 assert.equal(p.report().pending,0);
 p.draw();
}
test('diagnostic message never changes frozen map viewport height',()=>{
 assert.match(html,/flex:0 0 36px;height:36px;min-height:36px/);
 assert.match(html,/footer\{[^}]*flex-wrap:nowrap;overflow:hidden/s);
 assert.match(html,/#message,#metrics\{[^}]*text-overflow:ellipsis/s);
 assert.match(html,/#message,#metrics\{[^}]*white-space:nowrap/s);
 assert.match(game,/lastStatusPaint<180/);
 assert.match(game,/ResizeObserver\(handleViewportResize\)/);
 assert.match(game,/w===lastViewportW&&h===lastViewportH/);
});
test('cloud field and world panorama caches survive repeated short pans',async()=>{
 const t=makePlayer(),p=t.player;
 await warmed(p);
 const before=p.report(),base=t.cloudDraws();
 assert.ok(before.overviewRasterBuilds>=1);
 assert.ok(before.cloudBackdropBuilds>=1);
 for(let i=1;i<=5;i++){
  p.setPose({panX:i*5,panY:i*3});p.draw();
 }
 const after=p.report();
 assert.equal(after.overviewRasterBuilds,before.overviewRasterBuilds,
  'the world must not repaint for every 5px movement');
 assert.ok(after.overviewRasterHits>=before.overviewRasterHits+5);
 assert.equal(after.cloudBackdropBuilds,before.cloudBackdropBuilds,
  'the animated cloud backdrop should also use the buffered raster');
 assert.ok(after.cloudBackdropHits>=before.cloudBackdropHits+5);
 assert.equal(t.cloudDraws(),base,'no cloud bitmap restamping on short pans');
 p.stop();
});
test('zoom-out preview includes offscreen authored world and no rectangle at 50%',async()=>{
 const t=makePlayer(),p=t.player;
 await warmed(p);
 const first=t.calls.length;
 assert.ok(p.beginZoomPreview({zoomOut:true}));
 const snapshot=t.calls.slice(first);
 // Preparation must paint the real underlying world image layers and
 // cloud mask rather than merely copy the original visible screenshot.
 assert.ok(snapshot.some(call=>call.image.width===250),
  'buffered snapshot must contain actual decoded world tile images');
 const start=t.calls.length;
 p.setPose({zoom:.4,panX:0,panY:0});p.draw();
 const draws=t.calls.slice(start);
 const preview=draws.find(call=>call.image.kind==='offscreen'&&
  call.args.length>=5&&call.args.length!==9);
 assert.ok(preview,'the transformed preview image is displayed');
 const [,dx,dy,dw,dh]=preview.args;
 assert.ok(dx<=0&&dy<=0&&dx+dw>=400&&dy+dh>=240,
  'the zoom preview must cover every pixel of the viewport');
 assert.ok(p.report().zoomPreviewFrames>=1);
 p.stop();
});
test('extreme one-step zoom-out renders the real map rather than a square',async()=>{
 const t=makePlayer(),p=t.player;
 await warmed(p);
 assert.ok(p.beginZoomPreview({zoomOut:true}));
 const before=p.report().zoomPreviewFrames;
 p.setPose({zoom:.12});p.draw();
 assert.equal(p.report().zoomPreviewFrames,before,
  'undersized zoom snapshot must not be displayed as a centered square');
 p.stop();
});
test('2x original atlas stays read-only and preview is fog-clipped',()=>{
 assert.doesNotMatch(game,/player\.beginZoomPreview\(/);
 assert.match(runtime,/paintWorld\(g,extendedView,shown,backingDpr\)/);
 assert.match(runtime,/clouds\.drawTransitions\(g,extendedView,frontierEdges\(\)\)/);
 assert.match(runtime,/clouds\.drawUnready\(g,extendedView,cells,isHexReady/);
 assert.match(runtime,/if\(ox<=0&&oy<=0&&ox\+destW>=width&&oy\+destH>=height\)/);
 assert.doesNotMatch(runtime,/bakeWorldTile\(|drawGroundImpl\(/);
 assert.doesNotMatch(game,/source\.put\(|deleteDatabase\(/);
 for(const script of [runtime,game,policy])
  assert.doesNotThrow(()=>new Function(script));
});

test('panning is a live world raster rather than frozen 4-MP screenshot',()=>{
 assert.ok(html.includes('min-width:10ch;text-align:center;white-space:nowrap'));
 assert.ok(game.includes('metrics.title=metrics.textContent'));
 assert.ok(!game.includes('player.beginZoomPreview('));
 assert.ok(game.includes('setPose({panX:p.panX+dx,panY:p.panY+dy}'));
 assert.ok(game.includes("for(const evt of ['pointerup','pointercancel','lostpointercapture'])"));
 assert.ok(runtime.includes('list=[...list].sort'));
});

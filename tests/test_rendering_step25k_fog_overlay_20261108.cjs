'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const runtime=read('frozen-map-runtime.js'),policy=read('frozen-map-view-policy.js');
const game=read('frozen-map-game.js'),html=read('frozen-map-game.html');
const scene='v1-0374527a';
function fixture(layered=true){
 const window={},mainOps=[],fogOps=[],bufferOps=[];
 vm.runInNewContext(policy,{window});
 function makeCtx(ops){
  return {setTransform(){ops.push('transform')},clearRect(){ops.push('clear')},
   save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},
   clip(){},rect(){},translate(){},scale(){},fill(){},
   fillRect(){ops.push('fill')},drawImage(src){ops.push(['image',src])}};
 }
 const mainCtx=makeCtx(mainOps),fogCtx=makeCtx(fogOps);
 const canvas={width:0,height:0,getContext:()=>mainCtx,
  getBoundingClientRect:()=>({width:600,height:400})};
 const fogCanvas={width:0,height:0,getContext:()=>fogCtx};
 const document={createElement:()=>({width:0,height:0,
  getContext:()=>makeCtx(bufferOps)})};
 const calls={unready:[],frontier:[],base:[]};
 window.VedrasCloudArtwork={create:()=>({
  setSeed(){},setAssets(){},
  stats:()=>({bases:4,version:1}),
  drawBase(g,v){calls.base.push(g);g.fillRect(0,0,v.width,v.height);},
  drawUnready(g,v,cells,isReady,opacity){
   calls.unready.push({g,count:cells.length});
   for(const c of cells)opacity(c,isReady(c));
  },
  drawTransitions(g,v,edges){calls.frontier.push({g,count:edges.length});}
 })};
 let now=0;
 vm.runInNewContext(runtime,{window,document,console,
  performance:{now:()=>++now},requestAnimationFrame:()=>{}});
 const player=window.VedrasFrozenMap.create({
  canvas,fogCanvas:layered?fogCanvas:null,
  storage:{async keys(){return [];}},
  overview1x:false
 });
 const cells=[{q:0,r:0,x:0,y:0,radius:140,visibility:'visible'},
  {q:2,r:0,x:520,y:0,radius:140,visibility:'explored'}];
 const pose={zoom:.85,panX:0,panY:0,dpr:1.25,projectY:.85};
 return {canvas,fogCanvas,player,mainOps,fogOps,bufferOps,calls,
  async start(){await player.load(scene,'near',pose,cells);player.draw();}};
}
test('Fog-only redraws do not touch immutable world or cloudy base, but clear transparent overlay',async()=>{
 const f=fixture(true);await f.start();
 const first=f.player.report(),beforeMain=f.mainOps.length;
 const firstUnready=f.calls.unready.length,firstFrontier=f.calls.frontier.length;
 assert.equal(first.layeredFog,true);
 assert.equal(first.baseFrames,1);
 assert.equal(first.fogOnlyFrames,0);
 assert.equal(f.fogCanvas.width,750);
 assert.equal(f.fogCanvas.height,500);
 for(let i=0;i<8;i++)f.player.draw();
 const after=f.player.report();
 assert.equal(after.baseFrames,1,'never repaint 16.5MP base for unchanged Fog');
 assert.equal(after.fogOnlyFrames,8);
 assert.equal(f.mainOps.length,beforeMain,
  'the display world/cloud context must receive no operations during fog-only frames');
 assert.ok(f.fogOps.filter(x=>x==='clear').length>=9);
 assert.equal(f.calls.unready.length,firstUnready+8);
 assert.equal(f.calls.frontier.length,firstFrontier+8);
 assert.ok(f.calls.unready.every(x=>x.g===f.fogCanvas.getContext()));
 assert.ok(f.calls.frontier.every(x=>x.g===f.fogCanvas.getContext()));
 assert.ok(f.fogOps.length>0);
 f.player.stop();
});
test('pan, projection, zoom/dpr and cloud assets immediately invalidate static base',async()=>{
 const f=fixture(true);await f.start();f.player.draw();
 assert.equal(f.player.report().fogOnlyFrames,1);
 const changes=[
  ()=>f.player.setPose({panX:11}),
  ()=>f.player.setPose({panY:-7}),
  ()=>f.player.setPose({zoom:.65}),
  ()=>f.player.setPose({projectY:.91}),
  ()=>f.player.setPose({dpr:1.5}),
  ()=>f.player.setClouds({seed:'test',assets:[]})
 ];
 let n=f.player.report().baseFrames;
 for(const change of changes){
  change();f.player.draw();n++;
  assert.equal(f.player.report().baseFrames,n,'stale base reused after source/camera change');
 }
 assert.equal(f.fogCanvas.width,900);
 assert.equal(f.fogCanvas.height,600);
 const stableMainOps=f.mainOps.length;
 f.player.draw();
 assert.equal(f.mainOps.length,stableMainOps);
 f.player.stop();
});
test('without overlay the original world+fog canvas remains the only paint target',async()=>{
 const f=fixture(false);await f.start();f.player.draw();
 const status=f.player.report();
 assert.equal(status.layeredFog,false);
 assert.equal(status.fogOnlyFrames,0);
 assert.equal(status.baseFrames,2);
 assert.equal(f.fogOps.length,0);
 assert.ok(f.calls.unready.every(x=>x.g===f.canvas.getContext()));
 assert.ok(f.calls.frontier.every(x=>x.g===f.canvas.getContext()));
 f.player.stop();
});
test('zoom preview captures both opaque world and transparent overlay',async()=>{
 const f=fixture(true);await f.start();
 const original=f.bufferOps.length;
 assert.equal(f.player.beginZoomPreview({zoomOut:false}),true);
 const images=f.bufferOps.slice(original).filter(x=>Array.isArray(x)&&x[0]==='image');
 assert.ok(images.some(x=>x[1]===f.canvas));
 assert.ok(images.some(x=>x[1]===f.fogCanvas));
 f.player.draw();assert.equal(f.player.report().zoomPreviewActive,true);
 assert.equal(f.player.endZoomPreview(),true);
 f.player.draw();assert.ok(f.player.report().baseFrames>=2);
 f.player.stop();
});
test('HTML keeps pointer input on original canvas; new overlay requires explicit opt-in',()=>{
 assert.match(html,/id="game"/);
 assert.match(html,/id="fogOverlay" aria-hidden="true" hidden/);
 assert.match(html,/#fogOverlay\{[^}]+pointer-events:none/);
 assert.match(game,/params\.get\('fogLayer'\)==='1'/);
 assert.match(game,/fogOverlay\.hidden=!layeredFog/);
 assert.match(runtime,/fogCtx\.clearRect\(0,0,dw,dh\)/);
 assert.match(runtime,/baseStamp\.decodedRevision===decodedRevision/);
 assert.match(runtime,/baseStamp\.cloudRevision===cloudRevision/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 for(const source of [runtime,policy,game])assert.doesNotThrow(()=>new Function(source));
});

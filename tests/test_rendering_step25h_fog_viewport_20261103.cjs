'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const helperSource=read('frozen-map-fog-viewport.js');
const runtime=read('frozen-map-runtime.js');
const html=read('frozen-map-game.html'),game=read('frozen-map-game.js');
function helper(){
 const window={};vm.runInNewContext(helperSource,{window});
 return window.VedrasFrozenFogViewport;
}
const view={width:1200,height:800,zoom:1,panX:0,panY:0,projectY:1};
test('Fog view culls only cells with neither authored path nor cloud stamp on screen',()=>{
 const fog=helper();
 const cells=[
  {q:0,r:0,x:0,y:0,radius:140,visibility:'visible'},
  {q:100,r:100,x:650,y:0,radius:100,visibility:'visible'},
  {q:0,r:0,x:9000,y:9000,radius:100,visibility:'visible'},
  {q:100,r:100,x:9000,y:9000,radius:140,visibility:'visible'},
  {q:0,r:0,x:0,y:0,radius:140,visibility:'unknown'},
  {q:0,r:0,x:0,y:0,radius:140,visibility:'explored'}
 ];
 const output=fog.visibleCells(cells,view);
 assert.equal(output.length,3,'retain either visible hex path or visible stamp');
 assert.equal(output[0],cells[0]);
 assert.equal(output[1],cells[1]);
 assert.equal(output[2],cells[2]);
 // Fail open on malformed coordinates rather than hiding Fog at the edge.
 assert.equal(fog.visibleCells([
  {q:null,r:null,x:NaN,y:NaN,radius:100,visibility:'visible'}
 ],view).length,1);
});
test('neighbor frontiers keep 38-world-unit fringe when hard core is offscreen',()=>{
 const fog=helper();
 const edges=[
  {q:0,r:0,direction:0}, // target (1,0), on screen
  {q:-4,r:0,direction:0}, // target (-3,0), soft fringe touches view
  {q:-5,r:0,direction:0}, // target (-4,0), fully outside
  {q:10,r:0,direction:0}, // target (11,0), fully outside
  {q:0,r:0,direction:7} // invalid retains original safe painter behavior
 ];
 const result=fog.visibleEdges(edges,view);
 assert.equal(result.length,3);
 assert.equal(result[0],edges[0]);
 assert.equal(result[1],edges[1]);
 assert.equal(result[2],edges[4]);
 const shifted={...view,panX:-2800};
 assert.ok(fog.visibleEdges(edges,shifted).includes(edges[3]),
  'recompute bounds after pan, not from an obsolete snapshot');
});
function fixture(cull){
 const window={},fog=helper(),calls={cells:[],edges:[]};
 window.VedrasFrozenFogViewport=fog;
 window.VedrasCloudArtwork={create:()=>({
  setSeed(){},setAssets(){},
  stats:()=>({bases:4,pending:0,version:1}),
  drawBase(g,v){g.fillRect(0,0,v.width,v.height);},
  drawUnready(g,v,cells){calls.cells.push(cells.length);},
  drawTransitions(g,v,edges){calls.edges.push(edges.length);}
 })};
 const ctx=()=>({setTransform(){},save(){},restore(){},beginPath(){},
  moveTo(){},lineTo(){},closePath(){},clip(){},fillRect(){},
  rect(){},clearRect(){},drawImage(){},translate(){},scale(){}});
 const canvas={width:0,height:0,getContext:ctx,
  getBoundingClientRect:()=>({width:1000,height:600})};
 const document={createElement:()=>({width:0,height:0,getContext:ctx})};
 let now=0;
 vm.runInNewContext(runtime,{window,document,console,
  performance:{now:()=>++now},requestAnimationFrame:()=>{}});
 const player=window.VedrasFrozenMap.create({
  canvas,storage:{async keys(){return [];}},
  fogViewportCull:cull,useLayerCache:false
 });
 return {player,calls};
}
test('runtime fogCull=0 preserves full original Fog path for controlled A/B',async()=>{
 const cells=[
  {q:0,r:0,x:0,y:0,radius:140,visibility:'visible'},
  ...Array.from({length:900},(_,i)=>({
   q:i+50,r:i+50,x:40000+i*256,y:40000+i*200,
   radius:140,visibility:'visible'
  }))
 ];
 const original=fixture(false),optimized=fixture(true);
 for(const x of [original,optimized]){
  await x.player.load('v1-0374527a','near',
   {zoom:1,panX:0,panY:0,dpr:1,projectY:1},cells);
  x.player.draw();
 }
 const before=original.player.report(),after=optimized.player.report();
 assert.equal(before.fogViewportCull,false);
 assert.equal(before.fogUnreadyCandidates,cells.length);
 assert.equal(before.fogUnreadySubmitted,cells.length);
 assert.equal(after.fogViewportCull,true);
 assert.equal(after.fogUnreadyCandidates,cells.length);
 assert.ok(after.fogUnreadySubmitted<before.fogUnreadySubmitted/10);
 assert.equal(after.fogFrontierCandidates,before.fogFrontierCandidates);
 assert.ok(after.fogFrontierSubmitted<before.fogFrontierSubmitted);
 assert.equal(original.calls.cells.at(-1),cells.length);
 assert.equal(optimized.calls.cells.at(-1),after.fogUnreadySubmitted);
 assert.equal(optimized.calls.edges.at(-1),after.fogFrontierSubmitted);
 original.player.stop();optimized.player.stop();
});
test('standalone HTML loads Fog culling before runtime and keeps archive read-only',()=>{
 assert.match(html,/frozen-map-fog-viewport\.js\?v=/);
 assert.ok(html.indexOf('frozen-map-fog-viewport.js')<
  html.indexOf('frozen-map-runtime.js'));
 assert.match(game,/params\.get\('fogCull'\)!=='0'/);
 assert.match(runtime,/fogViewport\.visibleCells\(cells,view\)/);
 assert.match(runtime,/fogViewport\.visibleEdges\(edges,view\)/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 for(const src of [helperSource,runtime,game])assert.doesNotThrow(()=>
  new Function(src));
});

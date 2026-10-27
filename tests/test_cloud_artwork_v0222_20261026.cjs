'use strict';
/* node --test tests/test_cloud_artwork_v0222_20261026.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function setup(){
 const calls=[],ctx={
  save(){},restore(){},setTransform(){},translate(){},rotate(){},scale(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},fill(){},
  clearRect(){},fillRect(...v){calls.push(['fill',...v])},
  drawImage(...v){calls.push(['image',...v])}
 };
 const document={createElement:()=>({width:0,height:0,getContext:()=>({
  clearRect(){},drawImage(){},save(){},restore(){},beginPath(){},
  moveTo(){},lineTo(){},closePath(){},fill(){}
 })})};
 class Img{
  naturalWidth=512;naturalHeight=512;width=512;height=512;
  set src(value){if(this.onload)this.onload();}
 }
 const window={};
 vm.runInNewContext(read('cloud-artwork.js'),{window,document,Image:Img});
 vm.runInNewContext(read('fog-atmosphere.js'),{window});
 const art=window.VedrasCloudArtwork.create({seed:'player-A'});
 const assets=[
  ...Array.from({length:4},(_,i)=>({path:'assets/clouds/cloud_'+(i+1)+'.png'})),
  ...Array.from({length:4},(_,i)=>({path:'assets/clouds/edge_'+(i+1)+'.png'}))
 ];
 const view={width:780,height:520,panX:0,panY:0,zoom:.7,
  dpr:1,projectY:.85};
 return {calls,ctx,art,assets,view,window};
}
test('four final covers are used, obsolete edge sprites ignored',()=>{
 const h=setup();
 const expected=h.art.setAssets(h.assets);
 assert.equal(expected.baseExpected,4);
 assert.equal(expected.edgeExpected,0);
 assert.equal(h.art.stats().bases,4);
 assert.equal(h.art.stats().edges,0);
});
test('cloud material recognition excludes terrain and edge images',()=>{
 const h=setup(),classify=h.window.VedrasCloudArtwork.classify;
 assert.equal(classify({path:'assets/clouds/clouds1.png'}),'base');
 assert.equal(classify({path:'assets/clouds/cloud_edge_01.png'}),'edge');
 assert.equal(classify({path:'assets/terrain/grass.png'}),null);
});
test('seeded per-hex choice remains fixed across panning and zooming',()=>{
 const h=setup();h.art.setAssets(h.assets);
 const a=h.art.fieldAt(-3,7),b=h.art.fieldAt(-3,7);
 assert.equal(a,b,'cached hex choice');
 const before=h.art.stats().seed;
 h.art.drawBase(h.ctx,h.view);
 h.art.drawBase(h.ctx,{...h.view,panX:127,zoom:.25});
 assert.equal(h.art.fieldAt(-3,7),a);
 assert.equal(h.art.stats().seed,before);
 h.art.setSeed('player-B');
 assert.notEqual(h.art.stats().seed,before);
 assert.notEqual(h.art.fieldAt(-3,7),a);
});
test('infinite hex grid covers map and ungenerated world with same field',()=>{
 const h=setup();h.art.setAssets(h.assets);
 const list=h.art.visibleHexes(h.view);
 assert.ok(list.length>12&&list.length<800);
 assert.ok(list.some(c=>c.q<0)&&list.some(c=>c.q>0));
 assert.ok(h.art.drawBase(h.ctx,h.view)>12);
 assert.ok(h.calls.some(c=>c[0]==='fill'&&c[3]===780&&c[4]===520));
 assert.ok(h.calls.some(c=>c[0]==='image'),'hex-mask graphics drawn');
});
test('unknown neighbors overlay terrain and tree canopy at the frontier',()=>{
 const h=setup();h.art.setAssets(h.assets);
 const cells=h.window.VedrasFogAtmosphere.prepare([
  {q:0,r:0,x:0,y:0,radius:147.8,visibility:'visible'},
  {q:1,r:0,x:256,y:0,radius:147.8,visibility:'unknown'}]);
 assert.equal(cells.frontierEdges.length,6);
 assert.ok(cells.frontierEdges.some(e=>e.direction===0&&e.neighborQ===1));
 const count=h.art.drawTransitions(h.ctx,h.view,cells.frontierEdges);
 assert.ok(count>0,'unknown cloud hex drawn as foreground');
});
test('unready visible terrain remains under actual cloud artwork',()=>{
 const h=setup();h.art.setAssets(h.assets);
 const fog=[{q:0,r:0,x:0,y:0,visibility:'visible'}];
 assert.equal(h.art.drawUnready(h.ctx,h.view,fog,()=>true),0);
 assert.equal(h.art.drawUnready(h.ctx,h.view,fog,()=>false),1);
});
test('compositor places unknown cloud textures above scenery and units',()=>{
 const h=setup();
 vm.runInNewContext(read('world-tile-streamer.js'),{
  window:h.window,performance:{now:()=>1000}
 });
 const canvas={width:0,height:0,getContext:()=>h.ctx};
 const world=h.window.VedrasWorldTiles.create({canvas});
 world.setCloudAssets(h.assets);
 const t={id:'0,0',x:-256,y:-256,size:512,visibility:'visible'};
 world.seed(t,'mid',{layers:[
  {layer:'ground',image:{width:256,height:256,name:'ground'}},
  {layer:'scenery',image:{width:256,height:256,name:'tree'}}
 ]});
 world.setFogCells([
  {q:0,r:0,x:0,y:0,radius:h.window.VedrasCloudArtwork.R,
   visibility:'visible'},
  {q:1,r:0,x:256,y:0,radius:h.window.VedrasCloudArtwork.R,
   visibility:'unknown'}
 ]);
 world.request(h.view,[t]);
 world.render(h.view,{drawDynamic:()=>h.calls.push(['unit'])});
 const tree=h.calls.findIndex(x=>x[0]==='image'&&x[1].name==='tree');
 const unit=h.calls.findIndex(x=>x[0]==='unit');
 assert.ok(tree>=0&&unit>tree);
 assert.ok(h.calls.slice(unit+1).some(x=>x[0]==='image'),
  'frontier cloud art must be painted AFTER dynamic and static sprites');
});
test('asset library, cloud background and revision are wired',()=>{
 const html=read('index.html'),server=read('server.py'),
  app=read('app.js'),compositor=read('world-tile-streamer.js');
 assert.match(html,/cloud-artwork\.js\?v=0\.22\.5/);
 assert.match(html,/app\.js\?v=0\.55\.5/);
 assert.match(server,/VERSION = '0\.22\.5'/);
 assert.match(app,/worldTiles\.drawCloudBackground\(ctx/);
 assert.match(app,/setFogSeed:seed=>/);
 assert.match(compositor,/clouds\.drawTransitions\(g,view,fog\.frontierEdges\)/);
 assert.doesNotMatch(compositor,/clouds\?\.drawEdges/);
});

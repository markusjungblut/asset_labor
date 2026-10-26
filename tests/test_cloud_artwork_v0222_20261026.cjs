'use strict';
/* node --test tests/test_cloud_artwork_v0222_20261026.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function harness(){
 const calls=[];
 const ctx={
  save(){},restore(){},setTransform(){},translate(){},rotate(){},scale(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},
  clearRect(){},fillRect(...p){calls.push(['background',...p])},
  drawImage(...p){calls.push(['image',...p])},
  createLinearGradient(){return {addColorStop(){}}},
  createRadialGradient(){return {addColorStop(){}}}
 };
 const document={createElement:()=>{
  const cv={width:1,height:1,getContext:()=>({
   clearRect(){},drawImage(){},fillRect(){},createLinearGradient(){
    return {addColorStop(){}};
   }
  })};return cv;
 }};
 class MockImage{
  naturalWidth=1024;naturalHeight=512;width=1024;height=512;
  set src(value){this.url=value;if(this.onload)this.onload();}
 }
 const sandbox={window:{},Image:MockImage,document,performance:{now:()=>10000},
  console:{warn(){}}};
 vm.runInNewContext(read('cloud-artwork.js'),sandbox);
 vm.runInNewContext(read('fog-atmosphere.js'),sandbox);
 vm.runInNewContext(read('world-tile-streamer.js'),sandbox);
 const view={width:880,height:600,zoom:.8,dpr:1,
  panX:0,panY:0,projectY:.85};
 return {calls,ctx,view,sandbox,cloud:sandbox.window.VedrasCloudArtwork,
  atmosphere:sandbox.window.VedrasFogAtmosphere,
  create:()=>sandbox.window.VedrasWorldTiles.create({
   canvas:{width:0,height:0,getContext:()=>ctx},onReady(){}})};
}
test('eight bases and four edges are classified from local assets/clouds',()=>{
 const h=harness(),entries=[
  ...Array.from({length:8},(_,i)=>({category:'clouds',
   relPath:'clouds/cloud_base_0'+i+'.png',path:'assets/clouds/cloud_base_0'+i+'.png'})),
  ...Array.from({length:4},(_,i)=>({category:'clouds',
   relPath:'clouds/edges/cloud_edge_0'+i+'.png',
   path:'assets/clouds/edges/cloud_edge_0'+i+'.png'}))
 ];
 const art=h.cloud.create();
 assert.deepEqual(art.setAssets(entries),{baseExpected:8,edgeExpected:4});
 assert.deepEqual({bases:art.stats().bases,edges:art.stats().edges},{bases:8,edges:4});
 assert.equal(art.stats().pending,0);
});
test('cloud deck swaps atomically instead of reshuffling tiles on every image decode',()=>{
 const pictures=[];
 class DeferredImage{
  naturalWidth=512;naturalHeight=512;width=512;height=512;
  set src(value){pictures.push(this);}
 }
 const env={window:{},Image:DeferredImage};
 vm.runInNewContext(read('cloud-artwork.js'),env);
 const art=env.window.VedrasCloudArtwork.create();
 art.setAssets([{path:'assets/clouds/base_old.png',category:'clouds'}]);
 pictures[0].onload();
 assert.equal(art.stats().bases,1);
 art.setAssets([
  {path:'assets/clouds/base_new_a.png',category:'clouds'},
  {path:'assets/clouds/base_new_b.png',category:'clouds'}]);
 assert.equal(art.stats().pending,2);
 pictures[1].onload();
 assert.equal(art.stats().bases,1,'previous stable bank stays active');
 pictures[2].onload();
 assert.equal(art.stats().pending,0);
 assert.equal(art.stats().bases,2,'new bank published all at once');
});

test('cloud naming and image-type classification is deterministic',()=>{
 const h=harness(),classify=h.cloud.classify;
 assert.equal(classify({relPath:'clouds/wolkendecke8.png',category:'clouds'}),'base');
 assert.equal(classify({relPath:'clouds/wolken_rand_3.png',category:'clouds'}),'edge');
 assert.equal(classify({relPath:'assets/clouds/rim_4.webp',meta:{cloudRole:'edge'}}),'edge');
 assert.equal(classify({relPath:'terrain/cloud_base.png',category:'terrain'}),null);
 assert.equal(classify({relPath:'clouds/cloud_catalog.json',category:'clouds'}),null);
});
test('unexplored world always starts with fully opaque base even without images',()=>{
 const h=harness(),art=h.cloud.create();
 assert.equal(art.drawBase(h.ctx,h.view),0);
 assert.ok(h.calls.some(x=>x[0]==='background'&&
  x[1]===0&&x[2]===0&&x[3]===880&&x[4]===600));
});
test('artwork deck remains aligned to world while panning',()=>{
 const h=harness(),art=h.cloud.create();
 art.setAssets([{path:'assets/clouds/base_1.png',category:'clouds',url:'local/1.png'}]);
 art.drawBase(h.ctx,h.view);
 const first=h.calls.filter(x=>x[0]==='image');
 assert.ok(first.length>0);
 h.calls.length=0;
 art.drawBase(h.ctx,{...h.view,panX:100});
 const second=h.calls.filter(x=>x[0]==='image');
 // Pixel geometry moves by panX when it is the same world tile.
 assert.ok(second.some(b=>first.some(a=>Math.abs((b[2]-a[2])-100)<.01)));
});
test('outer world perimeter has edge segments even without explicit unknown cells',()=>{
 const h=harness(),cells=h.atmosphere.prepare([
  {q:0,r:0,x:0,y:0,radius:140,visibility:'visible'},
  {q:1,r:0,x:256,y:0,radius:140,visibility:'visible'}]);
 assert.equal(cells.frontierEdges.length,10,'two adjoining hexes expose 10 sides');
 assert.equal(cells.some(c=>c.frontier),false);
});
test('known-to-unknown boundary produces cloud fringe on discovered side',()=>{
 const h=harness(),cells=h.atmosphere.prepare([
  {q:0,r:0,x:0,y:0,radius:140,visibility:'visible'},
  {q:1,r:0,x:256,y:0,radius:140,visibility:'unknown'}]);
 assert.equal(cells.frontierEdges.length,6);
 const art=h.cloud.create();art.setAssets([{
  path:'assets/clouds/edge_a.png',category:'clouds',url:'local/edge.png'}]);
 const count=art.drawEdges(h.ctx,h.view,cells.frontierEdges);
 assert.ok(count>0);
 assert.equal(h.calls.filter(x=>x[0]==='image').length,count);
});
test('ground with a padded source gutter draws only its tile core',()=>{
 const h=harness(),w=h.create();
 const t={id:'0,0',x:-256,y:-256,size:512,visibility:'visible'};
 const ground={name:'ground',width:518,height:518};
 w.seed(t,'mid',{layers:[{layer:'ground',image:ground,pad:3}]});
 w.request(h.view,[t]);w.render(h.view,{fog:[]});
 const shot=h.calls.find(x=>x[0]==='image'&&x[1]===ground);
 assert.ok(shot);
 assert.equal(shot.length,10,'uses 9-argument cropped Canvas2D source draw');
 assert.ok(shot[2]>0&&shot[3]>0,'source gutter cropped');
 assert.ok(shot[4]<ground.width&&shot[5]<ground.height);
});
test('asset-library wiring and release version are complete',()=>{
 const app=read('app.js'),html=read('index.html'),server=read('server.py'),
  tile=read('world-tile-streamer.js');
 assert.match(html,/cloud-artwork\.js\?v=0\.22\.2/);
 assert.ok(html.indexOf('cloud-artwork.js')<html.indexOf('world-tile-streamer.js'));
 assert.match(app,/worldTiles\?\.setCloudAssets\(assets\)/);
 assert.match(app,/WORLD_TILE_GUTTER=3/);
 assert.match(tile,/clouds\?\.drawEdges\(g,view,fog\.frontierEdges\)/);
 assert.match(html,/Asset-Labor v0\.22\.2/);
 assert.match(server,/VERSION = '0\.22\.2'/);
});

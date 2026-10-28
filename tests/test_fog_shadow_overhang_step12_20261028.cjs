'use strict';
// Step 12: world-space cloud orientation, fog authorization and sprite overhang.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function context(){
 const events=[];let segments=0;
 const g={globalAlpha:1,imageSmoothingEnabled:true,
  beginPath(){segments=0;events.push('begin')},
  moveTo(){segments++;events.push('move')},
  lineTo(){segments++;events.push('line')},
  closePath(){events.push('close')},
  clip(){events.push(['clip',segments])},
  fill(){events.push('opaque')},
  fillRect(){events.push('base')},clearRect(){},
  setTransform(){},save(){},restore(){},translate(...xy){events.push(['translate',...xy])},
  scale(...xy){events.push(['scale',...xy])},
  rotate(){events.push('ROTATED')},drawImage(img){events.push(['image',img.tag||img._id||'raster'])}};
 return {g,events};
}
function world({cloud=true,atmosphere=true}={}){
 const window={};const {g,events}=context();
 if(atmosphere)vm.runInNewContext(read('fog-atmosphere.js'),{window});
 if(cloud)vm.runInNewContext(read('cloud-artwork.js'),{window});
 vm.runInNewContext(read('world-tile-streamer.js'),{
  window,performance:{now:()=>10}
 });
 const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>g},
  requireScenery:true
 });
 renderer.seed(tile,'mid',{complete:true,layers:[
  {layer:'ground',image:{width:32,height:32,tag:'ground'}},
  {layer:'scenery',image:{width:32,height:32,tag:'scenery'}}
 ]});
 const view={width:900,height:680,panX:0,panY:0,zoom:.7,dpr:1,projectY:.85};
 return {window,renderer,tile,view,g,events};
}
test('explicitly empty authorization must clip all image and sprite passes',()=>{
 const h=world();h.renderer.setFogCells([]);
 h.renderer.request(h.view,[h.tile]);
 h.renderer.render(h.view,{drawStatic:g=>g.drawImage({tag:'shadows-trees'}),
  drawDynamic:g=>g.drawImage({tag:'unit'})});
 const clips=h.events.filter(e=>Array.isArray(e)&&e[0]==='clip');
 assert.ok(clips.length>=3);
 assert.ok(clips.every(e=>e[1]===0),
  'ground, static shadow/tree and unit passes must clip to empty paths');
});
test('unknown-only explicit fog also denies all tile and sprite silhouettes',()=>{
 const h=world();h.renderer.setFogCells([
  {q:0,r:0,x:0,y:0,radius:256/Math.sqrt(3),visibility:'unknown'}]);
 h.renderer.request(h.view,[h.tile]);
 h.renderer.render(h.view,{drawStatic:g=>g.drawImage({tag:'trees'})});
 const clips=h.events.filter(e=>Array.isArray(e)&&e[0]==='clip');
 assert.ok(clips.length>=2);
 assert.ok(clips.every(e=>e[1]===0));
});
test('standalone world-tile usage without configured fog preserves legacy rendering',()=>{
 const h=world({cloud:false,atmosphere:false});
 h.renderer.request(h.view,[h.tile]);h.renderer.render(h.view);
 assert.ok(h.events.some(e=>Array.isArray(e)&&e[0]==='image'&&e[1]==='ground'));
 assert.equal(h.events.filter(e=>Array.isArray(e)&&e[0]==='clip').length,0);
});
test('frontier covers shadow and tree overhang after drawing them',()=>{
 const h=world();
 h.renderer.setFogCells([
  {q:0,r:0,x:0,y:0,radius:256/Math.sqrt(3),visibility:'visible'}]);
 h.renderer.request(h.view,[h.tile]);
 h.renderer.render(h.view,{
  drawStatic:g=>g.drawImage({tag:'mountain-shadow-and-trees'}),
  drawDynamic:g=>g.drawImage({tag:'moving-unit'})});
 const unit=h.events.findIndex(e=>Array.isArray(e)&&e[1]==='moving-unit');
 const over=h.events.findIndex((e,i)=>i>unit&&e==='opaque');
 assert.ok(unit>=0&&over>unit,'unknown neighboring hexes are masked last');
});
test('frontier deduplicates targets and stays fixed in world coordinates',()=>{
 const window={};vm.runInNewContext(read('cloud-artwork.js'),{window});
 const cloud=window.VedrasCloudArtwork.create();
 const {g,events}=context();
 const v={width:1000,height:700,panX:0,panY:0,zoom:1,projectY:.85};
 // Both source hexes border target (1,0): eastern side of (0,0)
 // and southeastern side of (1,-1).
 const edges=[{q:0,r:0,direction:0},{q:1,r:-1,direction:5}];
 assert.equal(cloud.drawTransitions(g,v,edges),0); // no textures yet
 assert.equal(events.filter(e=>e==='opaque').length,1);
 const a=events.find(e=>Array.isArray(e)&&e[0]==='translate');
 assert.equal(a,undefined);
 events.length=0;
 cloud.drawTransitions(g,{...v,panX:35},edges);
 const p=events.filter(e=>e==='opaque');
 assert.equal(p.length,1);
});
test('cloud variants never rotate baked directional lighting',()=>{
 const window={};vm.runInNewContext(read('cloud-artwork.js'),{window});
 const clouds=window.VedrasCloudArtwork.create();
 for(const [q,r] of [[0,0],[3,-2],[-7,4],[100,20]]){
  assert.equal(clouds.fieldAt(q,r).rotation,0);
  assert.equal(clouds.fieldAt(q,r).density,1);
 }
});
test('authored cloud layers are drawn core-first, then feather, after opaque fill',()=>{
 const window={};const images=[];
 let nextCanvas=0;
 const document={createElement:()=>({
  _id:'prepared-'+(++nextCanvas),width:0,height:0,
  getContext:()=>({
   drawImage(){},getImageData(){throw Error('unreadable source')},
   save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},
   closePath(){},fill(){},putImageData(){},
   set globalCompositeOperation(v){},set fillStyle(v){}
  })
 })};
 class Image{
  set src(url){this.url=url;this.onload?.();}
 }
 vm.runInNewContext(read('cloud-artwork.js'),{window,document,Image});
 const clouds=window.VedrasCloudArtwork.create();
 clouds.setAssets([{path:'assets/clouds/cloud_01.png'},{path:'assets/clouds/cloud_02.png'}]);
 assert.equal(clouds.stats().bases,2);
 const {g,events}=context();const v={
  width:1000,height:700,panX:0,panY:0,zoom:1,projectY:.85};
 clouds.drawTransitions(g,v,[{q:0,r:0,direction:0},{q:0,r:0,direction:1}]);
 const fills=events.map((e,i)=>e==='opaque'?i:-1).filter(i=>i>=0);
 const imgs=events.map((e,i)=>Array.isArray(e)&&e[0]==='image'?i:-1).filter(i=>i>=0);
 assert.equal(fills.length,2);
 assert.equal(imgs.length,4);
 assert.ok(fills.every(i=>i<imgs[0]));
 // First two stamps are hard, later two are feathered.
 const tags=imgs.map(i=>events[i][1]);
 assert.ok(tags[0]!==tags[2]);
 assert.ok(tags[1]!==tags[3]);
 assert.ok(!events.includes('ROTATED'));
});
test('fog classifier includes genuine external world boundary sides',()=>{
 const window={};vm.runInNewContext(read('fog-atmosphere.js'),{window});
 const f=window.VedrasFogAtmosphere.prepare([
  {q:0,r:0,x:0,y:0,radius:256/Math.sqrt(3),visibility:'visible'}
 ]);
 assert.equal(f.frontierEdges.length,6);
 assert.deepEqual(f.frontierEdges.map(e=>e.direction),[0,1,2,3,4,5]);
});
test('cloud/world JS version is refreshed without changing shadow or relief settings',()=>{
 const app=read('app.js'),html=read('index.html');
 assert.match(html,/cloud-artwork\.js\?v=0\.22\.4&amp;step12=20261028/);
 assert.match(html,/world-tile-streamer\.js\?v=0\.22\.6&amp;step12=20261028/);
 assert.match(app,/mountainShadowDefaults:\{opacity:\.44,softness:17/);
 assert.match(app,/relief:window\.VedrasRelief\.defaults\(\)/);
});

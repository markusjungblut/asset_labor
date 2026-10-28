'use strict';
// Roadmap step 9: full-image progressive LODs and strictly opaque unfinished hexes.
// Run: node --test tests/test_progressive_tile_readiness_step9_20261027.cjs
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function harness({maxPixels=100000,requireScenery=true}={}){
 const calls=[],window={};
 const context={
  setTransform(){},clearRect(){calls.push('clear')},save(){},restore(){},
  beginPath(){},closePath(){},clip(){},moveTo(){},lineTo(){},
  fill(){calls.push('opaque-hex')},fillRect(){calls.push('cloud-base')},
  drawImage(image){calls.push(image.tag||'tile')},globalAlpha:1
 };
 vm.runInNewContext(read('world-tile-streamer.js'),{
  window,performance:{now:()=>1000}
 });
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>context},
  source:null,maxPixels,requireScenery
 });
 const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 const view={width:1000,height:700,zoom:.6,panX:0,panY:0,dpr:1,projectY:.85};
 function packet(name,{preview=false,sourceDensity=null,complete=true,
  noScenery=false,quality=16}={}){
  return {complete,preview,sourceDensity,layers:[
   {layer:'ground',image:{width:quality,height:quality,tag:name+'-ground'}},
   ...noScenery?[]:[{layer:'scenery',image:{
    width:quality,height:quality,tag:name+'-scenery'}}]
  ]};
 }
 const paint=(v=view,options={})=>{
  calls.length=0;
  renderer.request(v,[tile]);
  const result=renderer.render(v,options);
  return {result,calls:[...calls]};
 };
 return {renderer,tile,view,packet,paint,calls};
}
test('complete old LOD remains visible while the new requested LOD is missing',()=>{
 const h=harness();
 assert.equal(h.renderer.seed(h.tile,'far',h.packet('old-far')),true);
 const p=h.paint();
 assert.equal(p.result.fallback,1);
 assert.equal(p.result.missing,0);
 assert.ok(p.calls.includes('old-far-ground'));
 assert.ok(p.calls.includes('old-far-scenery'));
 assert.equal(h.renderer.diagnostics().tiles[0].displayedLod,'far');
});
test('sharp earlier LOD beats blurrier provisional packet at current LOD',()=>{
 const h=harness();
 h.renderer.seed(h.tile,'near',h.packet('old-near'));
 h.renderer.seed(h.tile,'mid',h.packet('blurred-mid',{
  preview:true,sourceDensity:.6}));
 const p=h.paint();
 assert.equal(p.result.fallback,1);
 assert.ok(p.calls.includes('old-near-ground'));
 assert.ok(!p.calls.includes('blurred-mid-ground'));
 assert.equal(h.renderer.stats().progress.fallback,1);
 assert.equal(h.renderer.diagnostics().tiles[0].displayedLod,'near');
 assert.equal(h.renderer.diagnostics().tiles[0].displayedPreview,false);
});
test('ready requested LOD replaces fallback atomically with no mixed image layers',()=>{
 const h=harness();
 h.renderer.seed(h.tile,'far',h.packet('far'));
 h.paint();
 h.renderer.seed(h.tile,'mid',h.packet('sharp-mid'));
 const p=h.paint();
 assert.equal(p.result.exact,1);
 assert.equal(p.result.fallback,0);
 assert.ok(p.calls.includes('sharp-mid-ground'));
 assert.ok(p.calls.includes('sharp-mid-scenery'));
 assert.ok(!p.calls.includes('far-ground'));
 assert.ok(!p.calls.includes('far-scenery'));
});
test('partial source seed never hides previous full LOD',()=>{
 const h=harness();
 h.renderer.seed(h.tile,'far',h.packet('finished-far'));
 assert.equal(h.renderer.seed(h.tile,'mid',h.packet('unfinished-mid',{
  complete:false})),false);
 const p=h.paint();
 assert.equal(p.result.fallback,1);
 assert.equal(h.renderer.diagnostics().tiles[0].displayedLod,'far');
 assert.ok(!p.calls.includes('unfinished-mid-ground'));
});
test('a ground-only packet does not uncover an incomplete scene',()=>{
 const h=harness();
 assert.equal(h.renderer.seed(h.tile,'mid',h.packet('terrain-only',
  {noScenery:true})),false);
 h.renderer.setFogCells([{q:0,r:0,x:256,y:256,radius:75,
  visibility:'visible'}]);
 const p=h.paint(h.view,{drawStatic:g=>g.drawImage({tag:'global-forest'})});
 assert.equal(p.result.missing,1);
 assert.equal(p.result.loaded,0);
 assert.ok(p.calls.includes('global-forest'));
 assert.ok(p.calls.includes('opaque-hex'));
 assert.ok(p.calls.indexOf('opaque-hex')>p.calls.indexOf('global-forest'),
  'unready hex is hidden after drawing static scenery');
});
test('hidden tile descriptors cannot enter the compositor',()=>{
 const h=harness();
 h.renderer.seed(h.tile,'mid',h.packet('private'));
 h.renderer.request(h.view,[{...h.tile,visibility:'unknown'}]);
 h.calls.length=0;
 const result=h.renderer.render(h.view,{tiles:[
  {...h.tile,visibility:'unknown'}]});
 assert.equal(result.loaded,0);
 assert.ok(!h.calls.includes('private-ground'));
});
test('a complete fallback is preserved across unrelated cache evictions',()=>{
 const h=harness({maxPixels:550});
 const unused={id:'9,9',x:4608,y:4608,size:512,visibility:'visible'};
 const extra={id:'10,10',x:5120,y:5120,size:512,visibility:'visible'};
 h.renderer.seed(h.tile,'far',h.packet('protected',{
  quality:16}));
 h.renderer.request(h.view,[h.tile]);
 h.renderer.seed(unused,'mid',h.packet('evictable',{quality:16}));
 h.renderer.seed(extra,'mid',h.packet('evictable2',{quality:16}));
 const p=h.paint();
 assert.equal(p.result.fallback,1);
 assert.ok(p.calls.includes('protected-ground'));
});
test('decorative transparent cloud texture gets an opaque HEX underlay',()=>{
 const source=read('cloud-artwork.js'),a=source.indexOf('function drawUnready('),
  b=source.indexOf('function stats()',a);
 assert.ok(a>0&&b>a);
 const actions=[],g={
  save(){},restore(){},beginPath(){actions.push('path')},
  moveTo(){},lineTo(){},closePath(){},
  fill(){actions.push('opaque')},globalAlpha:1
 };
 const box={bases:[{}],R:128,backdrop:'#bdced7',window:{},
  stamp:(g,view,q,r,style)=>{actions.push(style);return true}};
 const draw=vm.runInNewContext(source.slice(a,b)+';drawUnready;',box);
 const count=draw(g,{width:800,height:600,zoom:.6,panX:0,panY:0,
  projectY:.85},[{q:0,r:0,x:0,y:0,radius:128,visibility:'visible'}],
  ()=>false);
 assert.equal(count,1);
 assert.deepEqual(actions,['path','opaque','hard','soft']);
});
test('browser scripts and camera diagnostic expose step-9 progress',()=>{
 const html=read('index.html'),app=read('app.js');
 assert.match(html,/cloud-artwork\.js\?v=0\.22\.4&amp;step12=20261028/);
 assert.match(html,/world-tile-streamer\.js\?v=0\.22\.6&amp;step12=20261028/);
 assert.match(app,/result\.fallback\?\?0/);
 assert.match(app,/result\.missing\?\?0/);
});

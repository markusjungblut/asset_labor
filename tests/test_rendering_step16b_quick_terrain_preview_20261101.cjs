'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const previewSource=fs.readFileSync(path.join(root,'quick-terrain-preview.js'),'utf8');
const worldSource=fs.readFileSync(path.join(root,'world-tile-streamer.js'),'utf8');
const appSource=fs.readFileSync(path.join(root,'app.js'),'utf8');
const view={width:700,height:420,zoom:1.34,dpr:1,panX:0,panY:0,projectY:.85};
const visible=(q=0,r=0)=>({q,r,x:q*256+r*128,y:r*221.7025,
 radius:256/Math.sqrt(3),visibility:'visible'});
const img={naturalWidth:512,naturalHeight:512};
function g(){
 const log=[];
 return {log,save(){log.push('save')},restore(){log.push('restore')},
  setTransform(){},clearRect(){},fillRect(){log.push('fillRect')},
  beginPath(){log.push('beginPath')},moveTo(){},lineTo(){},
  closePath(){},clip(){log.push('clip')},fill(){log.push('fill')},
  drawImage(x){log.push('image')},
  getTransform(){return null}};
}
function previewHarness(){
 const window={};
 vm.runInNewContext(previewSource,{window,console,Math,Set});
 return window.VedrasQuickTerrainPreview;
}
function rendererHarness(){
 const window={};
 vm.runInNewContext(worldSource,{window,console,Date,Promise,performance,
  AbortController,setTimeout,clearTimeout});
 const ctx=g(),canvas={width:0,height:0,getContext:()=>ctx};
 const renderer=window.VedrasWorldTiles.create({
  canvas,source:()=>null,sourceTimeoutMs:0,
  lodSelector:()=> 'near',requireScenery:true
 });
 return {renderer,ctx};
}
test('decoded native material image covers visible hex instantly without raster build',()=>{
 const p=previewHarness(),ctx=g();
 const cells=[visible(),{...visible(1,0),visibility:'unknown'},
  {...visible(-1,0),visibility:'explored'}];
 const drawn=p.paint(ctx,view,cells,()=>({img}));
 assert.equal(drawn.size,1);
 assert.equal(drawn.has('0,0'),true);
 assert.equal(ctx.log.filter(x=>x==='image').length,1);
 assert.equal(ctx.log.filter(x=>x==='clip').length,1);
 assert.equal(ctx.log.filter(x=>x==='save').length,1);
 assert.equal(ctx.log.filter(x=>x==='restore').length,1);
});
test('missing or undecoded texture never reveals terrain under Fog',()=>{
 const p=previewHarness(),ctx=g();
 for(const val of [null,{}, {img:{}},{img:{naturalWidth:0,naturalHeight:0}}]){
  const ready=p.paint(ctx,view,[visible()],()=>val);
  assert.equal(ready.size,0);
 }
 assert.equal(ctx.log.filter(x=>x==='image').length,0);
});
test('far zoom and explicit empty fog forbid provisional draws',()=>{
 const p=previewHarness(),ctx=g();
 assert.equal(p.paint(ctx,{...view,zoom:.30},[visible()],()=>({img})).size,0);
 assert.equal(p.paint(ctx,view,[],()=>({img})).size,0);
 assert.equal(p.paint(ctx,view,null,()=>({img})).size,0);
 assert.equal(ctx.log.filter(x=>x==='image').length,0);
});
test('visible workload is strictly bounded without preallocating any canvas',()=>{
 const p=previewHarness(),ctx=g();
 const many=Array.from({length:200},(_,i)=>({...visible(),q:i}));
 const count=p.paint(ctx,view,many,()=>({img}),{limit:12});
 assert.ok(count.size<=12);
 assert.ok(ctx.log.filter(x=>x==='image').length<=12);
 for(const forbidden of ['getImageData(','createImageBitmap(','requestIdleCallback('])
  assert.equal(previewSource.includes(forbidden),false,
   'preview must not perform expensive raster work: '+forbidden);
});
test('missing WorldTile may show preview but MUST NOT count as exact/complete/cached',()=>{
 const {renderer,ctx}=rendererHarness();
 const t={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 renderer.setFogCells([visible()]);
 let calls=0;
 const first=renderer.render(view,{tiles:[t]});
 assert.equal(first.missing,1);
 const noPreviewFills=ctx.log.filter(x=>x==='fillRect').length;
 ctx.log.length=0;
 const result=renderer.render(view,{tiles:[t],drawPreview:(g,v,fog)=>{
  calls++;g.drawImage(img,200,120,50,50);
  return new Set(['0,0']);
 }});
 assert.equal(calls,1);
 assert.equal(result.missing,1);
 assert.equal(result.exact,0);
 assert.equal(result.previewHexes,1);
 assert.equal(renderer.stats().tiles,0);
 assert.ok(ctx.log.filter(x=>x==='fillRect').length<noPreviewFills,
  'provisional painted hex should not get a second cloud mask');
});
test('empty Fog authorization blocks drawPreview and does not leak pixels',()=>{
 const {renderer,ctx}=rendererHarness();
 renderer.setFogCells([]);ctx.log.length=0;
 const t={id:'0,0',x:0,y:0,size:512,visibility:'unknown'};
 let attempted=0;
 const r=renderer.render(view,{tiles:[t],drawPreview:()=>{
  attempted++;return new Set(['0,0']);
 }});
 assert.equal(attempted,0);
 assert.equal(r.previewHexes,0);
 assert.equal(r.exact,0);
});
test('production fast camera loads preview only in existing Fog and calls no ensure',()=>{
 assert.match(appSource,/drawPreview:drawFastTerrainPreview/);
 assert.match(appSource,/window\.VedrasQuickTerrainPreview/);
 assert.match(appSource,/cell\?imageForBiome\(cell,false\):null/);
 assert.match(worldSource,/missing>0&&hasMask&&Array\.isArray\(fog\)/);
 assert.match(worldSource,/c\.visibility==='visible'&&previewHexes\.has/);
 assert.match(worldSource,/lastProgress=\{exact,fallback,provisional,stale,missing,/);
});

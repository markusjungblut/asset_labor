'use strict';
/* Vedras v0.15.4 - run: node --test tests/test_spatial_shadow_cache_20261023.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function grid(options={}){
 const sandbox={window:{},performance:{now:()=>100}};
 vm.runInNewContext(read('object-layout-cache.js'),sandbox);
 return sandbox.window.VedrasObjectLayoutCache.create(options);
}
const inside=(o,v)=>o.x+o.r>=v.x&&o.x-o.r<=v.x+v.width&&
 o.groundY+o.r>=v.y&&o.groundY-o.r<=v.y+v.height;
const radius=o=>o.r;

test('spatial buckets preserve exact result and original object order across negative coordinates',()=>{
 const objs=[{id:'left',x:-80,groundY:-130,r:300},
  {id:'far',x:2000,groundY:50,r:10},
  {id:'center',x:0,groundY:0,r:10},
  {id:'near',x:5,groundY:5,r:10}];
 const cache=grid({cellSize:128,maxObjectBuckets:9});
 let calls=0;const build=()=>{calls++;return objs};
 const view={x:-60,y:-50,width:110,height:100};
 const actual=cache.query(view,build,inside,radius);
 assert.equal(actual.objects.map(o=>o.id).join(','),'left,center,near');
 assert.equal(actual.objects.length,new Set(actual.objects).size);
 assert.ok(actual.candidates<objs.length,'spatial lookup avoids scanning distant objects');
 const distant=cache.query({x:1950,y:0,width:200,height:120},build,inside,radius);
 assert.equal(distant.objects.map(o=>o.id).join(','),'far');
 assert.equal(calls,1,'camera changes do not rebuild spatial buckets');
});

test('a very wide object uses overflow safely, without disappearing at bucket seams',()=>{
 const cache=grid({cellSize:128,maxObjectBuckets:4});
 const obj={x:0,groundY:0,r:5000};
 const answer=cache.query({x:3500,y:3500,width:200,height:200},()=>[obj],inside,radius);
 assert.equal(answer.objects.length,1);
 assert.equal(answer.overflow,1);
});

test('edited scenes replace spatial positions and old cell membership',()=>{
 const cache=grid();let x=10,calls=0;const build=()=>{calls++;return [{x,groundY:0,r:5}]};
 cache.query({x:0,y:-5,width:40,height:30},build,inside,radius);
 x=3000;cache.invalidate();
 assert.equal(cache.query({x:0,y:-5,width:40,height:30},build,inside,radius).objects.length,0);
 assert.equal(cache.query({x:3000,y:-5,width:40,height:30},build,inside,radius).objects.length,1);
 assert.equal(calls,2);
});

function shadow(){
 const paints=[],screen=[],created=[];
 const context=log=>({
  save(){},restore(){},translate(){},transform(){},beginPath(){},
  ellipse(){},fill(){},rect(){},clip(){},drawImage(...p){log.push(p)},
  set filter(v){},set globalAlpha(v){},set fillStyle(v){},
  set globalCompositeOperation(v){}
 });
 const document={createElement(tag){
  assert.equal(tag,'canvas');
  const canvas={width:0,height:0,getContext:()=>context(paints)};
  created.push(canvas);return canvas;
 }};
 const sandbox={window:{addEventListener(){}},document,performance:{now:()=>100}};
 vm.runInNewContext(read('sprite-shadow-editor.js'),sandbox);
 return {engine:sandbox.window.VedrasSpriteShadows,created,paints,screen,
  ctx:context(screen)};
}
const object=()=>({type:'nature',asset:{path:'assets/nature/tree.png'},
 natureMeta:{kind:'tree',family:'temperate_forest'}});
const shape=()=>({canvas:{width:256,height:256},aspect:.9});

test('repeated ground shadows are stamped from one cached blur/alpha raster',()=>{
 const {engine,created,screen,ctx}=shadow();
 const obj=object(),silhouette=shape(),anchor={x:.5,y:.96};
 engine.beginFrame();
 engine.drawCached(ctx,obj,{x:100,y:200},74,silhouette,anchor,.7);
 engine.drawCached(ctx,obj,{x:200,y:300},75,silhouette,anchor,.7);
 assert.equal(created.length,1);
 assert.equal(engine.cacheStats().frameMisses,1);
 assert.equal(engine.cacheStats().frameHits,1);
 assert.equal(screen.length,2);
 assert.equal(screen[0][0],screen[1][0],'the same prepared raster is reused');
});

test('changing an authored shadow style invalidates the bitmap cache',()=>{
 const {engine,created,ctx}=shadow();
 const obj=object(),silhouette=shape(),anchor={x:.5,y:.96};
 engine.drawCached(ctx,obj,{x:0,y:0},64,silhouette,anchor,.7);
 const next={...engine.get(),global:{...engine.get().global,angle:175}};
 engine.set(next);
 assert.equal(engine.cacheStats().entries,0);
 engine.drawCached(ctx,obj,{x:0,y:0},64,silhouette,anchor,.7);
 assert.equal(created.length,2);
});

test('manual shadow art stays on the exact, non-rasterized path',()=>{
 const {engine,created,ctx}=shadow();
 const obj=object(),silhouette=shape(),anchor={x:.5,y:.96};
 engine.set({...engine.get(),profiles:{
  [obj.asset.path]:{manual:{mode:'polygons',polygons:[[[0,0],[.2,0],[.1,.2]]]}}
 }});
 // In the editor's browser the hand-drawn shadow renderer is installed.
 // Here its draw function is a minimal invocation stub.
 const source=read('sprite-shadow-editor.js');
 assert.match(source,/window\.VedrasManualShadows\.render/);
 const sandbox={window:{addEventListener(){},VedrasManualShadows:{render(){},valid(){}}},document:{
  createElement:()=>{throw Error('should not allocate bitmap for manual shadow')}},
  performance:{now:()=>100}};
 vm.runInNewContext(source,sandbox);
 const manual=sandbox.window.VedrasSpriteShadows;
 manual.set({...manual.get(),profiles:{
  [obj.asset.path]:{manual:{mode:'polygons',polygons:[[[0,0],[.2,0],[.1,.2]]]}}
 }});
 manual.beginFrame();
 assert.doesNotThrow(()=>manual.drawCached(ctx,obj,{x:0,y:0},80,silhouette,anchor,.7));
 assert.equal(manual.cacheStats().frameFallback,1);
 assert.equal(manual.cacheStats().entries,0);
 assert.equal(created.length,0);
});

test('dense scene pins raster entries for a frame and cannot thrash page budget',()=>{
 const {engine,created,ctx}=shadow();
 const obj=object();
 engine.beginFrame();
 const silhouettes=Array.from({length:152},()=>shape());
 for(const s of silhouettes)engine.drawCached(ctx,obj,{x:0,y:0},64,s,{x:.5,y:.96},.7);
 const first=engine.cacheStats();
 assert.ok(first.entries<=144&&first.frameFallback>0);
 const allocated=created.length;
 engine.beginFrame();
 for(const s of silhouettes)engine.drawCached(ctx,obj,{x:0,y:0},64,s,{x:.5,y:.96},.7);
 const second=engine.cacheStats();
 assert.ok(second.frameHits>0);
 assert.equal(second.frameMisses,0,'cached items do not get displaced and repainted');
 assert.equal(created.length,allocated);
});

test('v0.15.4 integrates indexed lookup and shadow-cache paths without breaking exports',()=>{
 const app=read('app.js'),html=read('index.html'),server=read('server.py');
 assert.match(app,/objectLayoutCache\.query\(view,buildSpriteLayout,spriteInViewport,spriteIndexMargin\)/);
 assert.match(app,/finalRendering\?shared\.draw:shared\.drawCached/);
 assert.match(app,/finalRendering\?window\.VedrasSpriteShadows\.draw:window\.VedrasSpriteShadows\.drawCached/);
 assert.match(app,/VedrasSpriteShadows\?\.beginFrame\?\.\(\)/);
 assert.match(html,/object-layout-cache\.js\?v=0\.2\.0/);
 assert.match(html,/sprite-shadow-editor\.js\?v=0\.38\.0/);
 assert.match(html,/app\.js\?v=0\.48\.0/);
 assert.match(server,/VERSION = '0\.15\.4'/);
 assert.match(server,/key = parsed\.path\[len\(prefix\):\]/);
 assert.doesNotMatch(server,/\.removeprefix\(/);
});

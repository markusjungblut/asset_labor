'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

function fixture(manifest,limitPages=6){
 const images=[],draws=[];
 class FakeImage {
  naturalWidth=2048;naturalHeight=2048;
  set src(url){this.url=url;images.push(this);}
 }
 const sandbox={window:{innerWidth:1700,innerHeight:1000},
  navigator:{maxTouchPoints:0},Image:FakeImage,
  fetch:async()=>({ok:true,json:async()=>manifest})};
 vm.runInNewContext(read('sprite-atlas-runtime.js'),sandbox);
 const atlas=sandbox.window.VedrasSpriteAtlas.create({limitPages});
 const ctx={drawImage:(...args)=>draws.push(args)};
 return {atlas,ctx,images,draws};
}
const entry=(page,source=[1254,1254],trim=[200,50,800,900],
 rect=[300,400,400,450])=>({page,source,trim,rect});
const manifestFor=sprites=>({schemaVersion:1,tiers:{desktop:{
 pages:Array.from({length:Math.max(...Object.values(sprites).map(x=>x.page))+1},
  (_,i)=>({file:'desktop/page_'+i+'.png'})),sprites}}});

test('atlas maps downsampled visible bounds to native source coordinates before sampling',async()=>{
 const atlasData=manifestFor({'assets/nature/tree.png':entry(0)});
 const {atlas,ctx,images,draws}=fixture(atlasData);
 assert.equal(await atlas.open(),true);
 const factor=1254/1024;
 const bounds={sx:250/factor,sy:100/factor,sw:600/factor,sh:700/factor};
 const dest={x:100,y:220,w:120,h:140};
 const preview={width:1024,height:1024};
 assert.equal(atlas.draw(ctx,'assets/nature/tree.png',bounds,dest,preview),false);
 images[0].onload();
 assert.equal(atlas.draw(ctx,'assets/nature/tree.png',bounds,dest,preview),true);
 const [,sx,sy,sw,sh,dx,dy,dw,dh]=draws[0];
 for(const [actual,expected] of [[sx,325],[sy,425],[sw,300],[sh,350],
  [dx,100],[dy,220],[dw,120],[dh,140]])
  assert.ok(Math.abs(actual-expected)<1e-7,actual+' != '+expected);
});

test('atlas keeps trimmed transparent margins aligned with original PNG fallback',async()=>{
 const {atlas,ctx,images,draws}=fixture(manifestFor({
  'assets/nature/plant.png':entry(0,[1254,1254],[100,100,1000,1000],[4,4,500,500])
 }));
 await atlas.open();
 const dest={x:100,y:100,w:200,h:200};
 const fullPreview={sx:0,sy:0,sw:1024,sh:1024};
 assert.equal(atlas.draw(ctx,'assets/nature/plant.png',fullPreview,dest,
  {width:1024,height:1024}),false);
 images[0].onload();
 assert.equal(atlas.draw(ctx,'assets/nature/plant.png',fullPreview,dest,
  {width:1024,height:1024}),true);
 const [,sx,sy,sw,sh,dx,dy,dw,dh]=draws[0];
 assert.equal(sx,4);assert.equal(sy,4);assert.equal(sw,500);assert.equal(sh,500);
 assert.ok(Math.abs(dx-(100+200*100/1254))<1e-7);
 assert.ok(Math.abs(dy-(100+200*100/1254))<1e-7);
 assert.ok(Math.abs(dw-(200*1000/1254))<1e-7);
 assert.ok(Math.abs(dh-(200*1000/1254))<1e-7);
});

test('more visible atlas pages than budget never cause perpetual page thrash',async()=>{
 const sprites=Object.fromEntries(Array.from({length:3},(_,i)=>
  ['sprite'+i,entry(i,[100,100],[0,0,100,100],[0,0,100,100])]));
 const {atlas,ctx,images}=fixture(manifestFor(sprites),2);
 await atlas.open();
 const b={sx:0,sy:0,sw:100,sh:100},d={x:0,y:0,w:40,h:40};
 const draw=i=>atlas.draw(ctx,'sprite'+i,b,d,{width:100,height:100});
 atlas.beginFrame();
 assert.equal(draw(0),false);assert.equal(draw(1),false);
 assert.equal(draw(2),false);
 atlas.endFrame();
 assert.equal(images.length,2,'third page does not start an evict/reload cycle');
 for(const image of images)image.onload();
 for(let frame=0;frame<10;frame++){
  atlas.beginFrame();
  assert.equal(draw(0),true);assert.equal(draw(1),true);
  assert.equal(draw(2),false);
  atlas.endFrame();
 }
 assert.equal(images.length,2);
 assert.equal(atlas.info().pages,2);
 // A new camera/scene can replace a no-longer-visible page.
 atlas.beginFrame();assert.equal(draw(2),false);atlas.endFrame();
 assert.equal(images.length,3);
 images[2].onload();
 atlas.beginFrame();assert.equal(draw(2),true);atlas.endFrame();
});

test('map sprite draw uses preview dimensions and reserves atlas pages for a frame',()=>{
 const app=read('app.js');
 assert.match(app,/spriteAtlas\?\.draw\(ctx,obj\.asset\.path,b,[\s\S]*?width:obj\.asset\.img\.naturalWidth/);
 assert.match(app,/spriteAtlas\?\.beginFrame\(\)/);
 assert.match(app,/finally\{spriteAtlas\?\.endFrame\(\)\}/);
});

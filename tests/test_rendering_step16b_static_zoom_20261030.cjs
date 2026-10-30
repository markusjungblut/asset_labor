'use strict';
/* node --test tests/test_rendering_step16b_static_zoom_20261030.cjs */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','static-object-layer.js'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
function harness(){
 const images=[],graphics={drawImage(...args){images.push(args)}};
 const document={createElement(type){
  assert.equal(type,'canvas');
  return {width:0,height:0,getContext:()=>({setTransform(){}})};
 }};
 const window={};
 let clock=0;
 vm.runInNewContext(source,{window,document,performance:{now:()=>++clock}});
 const layer=window.VedrasStaticObjects.create({
  padding:440,maxPixels:17000000,minPadding:24
 });
 const base={width:900,height:600,dpr:1,zoom:.70,panX:0,panY:0};
 let paints=0;
 function paint(view,options={}){
  return layer.paint({ctx:graphics,view,signature:options.signature||'same',
   allowZoomReprojection:options.allowZoomReprojection===true,
   drawScene:()=>{paints++;}});
 }
 return {layer,images,base,paint,get builds(){return paints;}};
}
test('fast 0.70→0.77 zoom uses same static raster and correct affine screen placement',()=>{
 const h=harness(),first=h.paint(h.base);
 assert.equal(first.rebuilt,true);assert.equal(h.builds,1);
 const view={...h.base,zoom:.77};
 const second=h.paint(view,{allowZoomReprojection:true});
 assert.equal(second.rebuilt,false);
 assert.equal(second.cached,true);
 assert.equal(second.zoomReprojected,true);
 assert.equal(h.builds,1);
 const [canvas,dx,dy,dw,dh]=h.images.at(-1);
 const ratio=view.zoom/h.base.zoom;
 assert.ok(canvas.width>0);
 assert.ok(Math.abs(dx-(450-(440+450)*ratio))<.0001);
 assert.ok(Math.abs(dy-(300-(440+300)*ratio))<.0001);
 assert.ok(Math.abs(dw-(900+880)*ratio)<.0001);
 assert.ok(Math.abs(dh-(600+880)*ratio)<.0001);
});

test('same-camera pan remains cached with and without zoom reprojection enabled',()=>{
 const h=harness();
 h.paint(h.base);const result=h.paint({...h.base,panX:90,panY:-70});
 assert.equal(result.rebuilt,false);
 assert.equal(result.zoomReprojected,false);
 assert.equal(h.builds,1);
});

test('exact editor and PNG paths NEVER reuse a raster when zoom changes',()=>{
 const h=harness();
 h.paint(h.base);
 const result=h.paint({...h.base,zoom:.77});
 assert.equal(result.rebuilt,true);
 assert.equal(result.zoomReprojected,false);
 assert.equal(h.builds,2);
 assert.match(app,/allowZoomReprojection:true/);
 assert.match(app,/staticScenery\.clear\(\);\s*fastRender\(\);/);
});

test('large zoom ratio forces a new native-resolution raster',()=>{
 const h=harness();
 h.paint(h.base);
 const result=h.paint({...h.base,zoom:.86},{allowZoomReprojection:true});
 assert.equal(result.rebuilt,true);
 assert.equal(h.builds,2);
});

test('viewport leaving source coverage triggers exact scenery rebuild',()=>{
 const h=harness();
 h.paint(h.base);
 const result=h.paint({...h.base,zoom:.77,panX:800},{allowZoomReprojection:true});
 assert.equal(result.rebuilt,true);
});

test('changed scenery content is never reprojection-compatible',()=>{
 const h=harness();
 h.paint(h.base);
 const result=h.paint({...h.base,zoom:.77},{allowZoomReprojection:true,signature:'edited'});
 assert.equal(result.rebuilt,true);
 assert.equal(h.builds,2);
});

test('cache clear always restores exact scene after camera movement',()=>{
 const h=harness();
 h.paint(h.base);
 assert.equal(h.paint({...h.base,zoom:.77},{allowZoomReprojection:true}).rebuilt,false);
 h.layer.clear();
 const result=h.paint({...h.base,zoom:.77},{allowZoomReprojection:true});
 assert.equal(result.rebuilt,true);
 assert.equal(result.zoomReprojected,false);
 assert.equal(h.builds,2);
});

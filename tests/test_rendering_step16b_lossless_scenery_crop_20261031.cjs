'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const world=fs.readFileSync(path.join(root,'world-tile-streamer.js'),'utf8');
const begin=app.indexOf('function packWorldTileScenery('),
 end=app.indexOf('async function bakeWorldTile(',begin);
assert.ok(begin>0&&end>begin);
const packCode=app.slice(begin,end);
function fixture(width,height,opaque=[],throws=false){
 const srcAlpha=new Uint8ClampedArray(width*height*4),draws=[];
 for(const [x,y,a=255] of opaque)srcAlpha[(y*width+x)*4+3]=a;
 const source={width,height,getContext:()=>({
  getImageData(){if(throws)throw Error('SecurityError');
   return {data:srcAlpha};}
 })};
 const document={createElement:()=>{
  const tile={width:0,height:0,draws:[]};
  tile.getContext=()=>({drawImage:(...args)=>{
   tile.draws.push(args);draws.push({tile,args});
  }});
  return tile;
 }};
 const trace=[];
 const window={VedrasStep15Trace:{record:(type,details)=>
  trace.push({type,details})}};
 const pack=new Function('document','window','performance',packCode+
  '\nreturn packWorldTileScenery;')(document,window,performance);
 return {pack,source,draws,trace,srcAlpha};
}
test('mid scenery removes only transparent margins and retains 2px guard',()=>{
 const f=fixture(100,80,[[35,25],[45,40],[35,45]]);
 const p=f.pack(f.source,'mid');
 assert.notEqual(p.image,f.source);
 assert.equal(p.crop.x,33);
 assert.equal(p.crop.y,23);
 assert.equal(p.crop.fullWidth,100);
 assert.equal(p.crop.fullHeight,80);
 assert.equal(p.image.width,15);
 assert.equal(p.image.height,25);
 assert.equal(f.draws.length,1);
 assert.deepEqual(f.draws[0].args.slice(1),[33,23,15,25,0,0,15,25]);
 assert.equal(f.trace[0].type,'tile.scenery-pack');
 assert.equal(f.trace[0].details.removedPixels,100*80-15*25);
});
test('one-pixel fully transparent image remains valid complete scenery',()=>{
 const f=fixture(100,80);
 const p=f.pack(f.source,'mid');
 assert.equal(p.image.width,1);
 assert.equal(p.image.height,1);
 assert.deepEqual(JSON.parse(JSON.stringify(p.crop)),{
  x:0,y:0,fullWidth:100,fullHeight:80});
 assert.equal(f.draws.length,1);
});
test('no edge cut is allowed if true opaque pixels reach both boundaries',()=>{
 const f=fixture(100,80,[[0,0],[99,79]]);
 const p=f.pack(f.source,'mid');
 assert.equal(p.image,f.source);
 assert.equal(p.crop,undefined);
 assert.equal(f.draws.length,0);
});
test('no crop when the memory saving is below 4096 raster pixels',()=>{
 const f=fixture(80,80,[[3,3],[76,76]]);
 const p=f.pack(f.source,'mid');
 assert.equal(p.image,f.source);
 assert.equal(f.draws.length,0);
});
test('unknown or tainted alpha remains untouched rather than faking readiness',()=>{
 const f=fixture(100,80,[],true);
 const p=f.pack(f.source,'mid');
 assert.equal(p.image,f.source);
 assert.equal(f.draws.length,0);
});
test('other LODs retain their original full scenery geometry',()=>{
 const f=fixture(100,80,[[40,40]]);
 for(const lod of ['far','near'])assert.equal(f.pack(f.source,lod).image,f.source);
 assert.equal(f.draws.length,0);
});
test('alpha scan treats any nonzero coverage as content, never thresholds detail',()=>{
 const f=fixture(100,100,[[15,15,1],[75,65,255]]);
 const p=f.pack(f.source,'mid');
 assert.equal(p.crop.x,13);
 assert.equal(p.crop.y,13);
 assert.equal(p.image.width,65);
 assert.equal(p.image.height,55);
});
test('packed packet is validated and retains exact fog/complete layer contract',()=>{
 const window={};
 vm.runInNewContext(world,{window,Date,Promise,setTimeout,
  clearTimeout,performance,console,AbortController});
 const g={save(){},restore(){},setTransform(){},clearRect(){},
  fillRect(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},
  clip(){},fill(){},drawImage(){}};
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:4,height:4,getContext:()=>g},source:null,
  requireScenery:true,lodSelector:()=> 'mid',maxPixels:1000000});
 const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 const good={complete:true,revision:'same',layers:[
  {layer:'ground',image:{width:20,height:20}},
  {layer:'scenery',pad:128,image:{width:8,height:9},
   crop:{x:10,y:12,fullWidth:80,fullHeight:100}}]};
 renderer.reserveWarmTiles(['0,0@mid']);
 assert.equal(renderer.seed(tile,'mid',good),true);
 assert.equal(renderer.warmTileStatus().ready,1);
 const details=renderer.warmTileStatus().rasterDetails[0];
 assert.equal(details.layers[1].pixels,72);
 assert.equal(details.layers[1].crop.x,10);
 assert.equal(details.totalPixels,472);
 assert.equal(renderer.stats().pixels,472);
 renderer.reserveWarmTiles(null);
 const badTile={id:'1,0',x:512,y:0,size:512,visibility:'visible'};
 assert.equal(renderer.seed(badTile,'mid',{complete:true,layers:[
  {layer:'ground',image:{width:20,height:20}},
  {layer:'scenery',image:{width:8,height:9},
   crop:{x:75,y:12,fullWidth:80,fullHeight:100}}]}),false);
});
test('cropped display maps to the original continuous screen-space rectangle',()=>{
 const window={};
 vm.runInNewContext(world,{window,Date,Promise,setTimeout,
  clearTimeout,performance,console,AbortController});
 const draws=[];
 const g={save(){},restore(){},setTransform(){},clearRect(){},
  fillRect(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},
  clip(){},fill(){},drawImage:(...a)=>draws.push(a),
  globalAlpha:1};
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:1600,height:1200,getContext:()=>g},source:null,
  requireScenery:true,lodSelector:()=> 'mid',maxPixels:1000000});
 const view={width:1600,height:1200,zoom:.7,panX:0,panY:0,dpr:1,projectY:.85};
 const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 const full={width:100,height:80},packed={width:40,height:30};
 const ground={width:30,height:30};
 const common={complete:true,revision:'same',layers:[
  {layer:'ground',image:ground},
  {layer:'scenery',pad:128,image:full}]};
 renderer.seed(tile,'mid',common);
 renderer.request(view,[tile]);
 renderer.render(view,{drawStatic:null,fog:null});
 const first=draws.find(a=>a[0]===full);
 assert.ok(first,'uncropped fallback scenery must actually render');
 const idx=draws.length;
 // A fresh renderer avoids completed-tile overwrite guards.
 const rr=window.VedrasWorldTiles.create({
  canvas:{width:1600,height:1200,getContext:()=>g},source:null,
  requireScenery:true,lodSelector:()=> 'mid',maxPixels:1000000});
 rr.seed(tile,'mid',{...common,layers:[
  {layer:'ground',image:ground},
  {layer:'scenery',pad:128,image:packed,
   crop:{x:20,y:25,fullWidth:100,fullHeight:80}}]});
 rr.request(view,[tile]);rr.render(view,{drawStatic:null,fog:null});
 const second=draws.slice(idx).find(a=>a[0]===packed);
 assert.ok(second,'cropped scenery fallback must actually render');
 assert.ok(Math.abs(second[5]-(first[5]+first[7]*20/100))<1e-7);
 assert.ok(Math.abs(second[6]-(first[6]+first[8]*25/80))<1e-7);
 assert.ok(Math.abs(second[7]-first[7]*40/100)<1e-7);
 assert.ok(Math.abs(second[8]-first[8]*30/80)<1e-7);
});
test('camera normal path keeps the same gates, without a crop scan per frame',()=>{
 const bake=app.slice(app.indexOf('async function bakeWorldTile('),
  app.indexOf('let fastInteracting=',app.indexOf('async function bakeWorldTile(')));
 assert.match(bake,/packWorldTileScenery\(overlay,level\)/);
 assert.match(bake,/packWorldTileScenery\(b,level\)/);
 assert.match(app,/const sceneryLayer=preview\?\{image:b\}/);
 assert.match(world,/if\(typeof drawStatic==='function'\)/);
 assert.match(world,/if\(c\.visibility!=='visible'&&c\.visibility!=='explored'\)/);
 assert.doesNotMatch(world.slice(world.indexOf('function render(')),
  /getImageData\(/);
 assert.match(world,/overBudgetPixels:Math.max\(0,pixels-maxPixels\)/);
});

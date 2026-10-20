/* Synthetic Canvas2D smoke test: actual worker raster must match legacy
 * pixel sampler for two adjoining biomes, with no real DOM dependency.
 * The fake offscreen canvas is intentionally minimal and uses uniform
 * RGBA source images to isolate the material blend calculation.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
class TinyCanvas{
 constructor(width,height){this.width=width;this.height=height;this.pixels=null;}
 getContext(){return new TinyContext(this);}
 transferToImageBitmap(){return {width:this.width,height:this.height,
  pixels:this.pixels?.slice(),close(){}};}
}
class TinyContext{
 constructor(canvas){this.canvas=canvas;}
 createImageData(w,h){return {width:w,height:h,data:new Uint8ClampedArray(w*h*4)};}
 putImageData(image){this.canvas.pixels=image.data.slice();}
 getImageData(){return {width:this.canvas.width,height:this.canvas.height,
  data:this.canvas.pixels?this.canvas.pixels.slice():
   new Uint8ClampedArray(this.canvas.width*this.canvas.height*4)};}
 drawImage(image){
  const c=this.canvas,col=image.rgba||image.pixels?.slice(0,4)||[0,0,0,0];
  const b=new Uint8ClampedArray(c.width*c.height*4);
  for(let i=0;i<b.length;i+=4){b[i]=col[0];b[i+1]=col[1];b[i+2]=col[2];b[i+3]=col[3];}
  c.pixels=b;
 }
}
const doc={createElement(tag){assert.equal(tag,'canvas');return new TinyCanvas(1,1);}};
const modules=['autotile.js','polish.js','relief.js'];
function boot(){
 const fake={postMessage(msg){this.messages.push(msg);},messages:[]};
 const scope={window:fake,self:fake,document:doc,OffscreenCanvas:TinyCanvas,
  performance:{now:()=>1},console};
 const context=vm.createContext(scope);
 scope.importScripts=(...urls)=>{
  for(const url of urls){
   const filename=url.split('?')[0];
   assert(modules.includes(filename),'only source modules imported');
   vm.runInContext(fs.readFileSync(path.join(root,filename),'utf8'),context,{filename});
  }
 };
 vm.runInContext(fs.readFileSync(path.join(root,'terrain-worker.js'),'utf8'),
  context,{filename:'terrain-worker.js'});
 return fake;
}
const worker=boot();
assert.equal(worker.messages.shift().type,'ready');
const colors=[['grass.png',[103,144,75,255]],['sand.png',[197,160,104,255]]];
for(const [filename,rgba] of colors)
 worker.onmessage({data:{type:'texture',path:filename,
  bitmap:{width:32,height:32,rgba,close(){}},worldSize:256}});
const cells=[{q:0,r:0,path:'grass.png',terrainTypeId:'grassland'},
 {q:1,r:0,path:'sand.png',terrainTypeId:'dry_ground'}];
const bounds={x:-90,y:-100,width:445,height:200,lowResolution:true};
const options={band:28,blendVariants:true,irregularity:5,
 blend:true,cornerBlend:true,resolution:.5,maxPixels:1300000,
 materialScales:{},waterSampling:'hex',terrainAmount:.35};
worker.onmessage({data:{type:'render',id:11,data:{
 cells,bounds,options,types:[
  {id:'grassland',materialClass:'ground'},
  {id:'dry_ground',materialClass:'ground'}
 ],relief:null,maskCells:[]}}});
const answer=worker.messages.pop();
assert.equal(answer.type,'result',answer.message||'worker failed');
assert(answer.relief.canvas.pixels?.length>1000);
assert.equal(answer.waterLayer,null);
assert.equal(answer.relief.width,bounds.width);
assert.equal(answer.relief.height,bounds.height);
const main={};
const scope={window:main,document:doc,OffscreenCanvas:TinyCanvas};
const context=vm.createContext(scope);
for(const filename of ['autotile.js','polish.js'])
 vm.runInContext(fs.readFileSync(path.join(root,filename),'utf8'),context,{filename});
const texture=new Map(colors.map(([filename,rgba])=>[
 filename,{path:filename,img:{width:32,height:32,rgba},meta:{textureWorldSize:256}}]));
const raster=main.VedrasAutotile.build(cells,c=>texture.get(c.path),c=>c.terrainTypeId,{
 ...options,bounds,
 terrainTone:(rgb,kind,id)=>main.VedrasPolish.terrainRGB(...rgb,options.terrainAmount,kind,id),
 transitionMode:()=> 'soft_ground',materialClassOf:()=> 'ground'});
assert(raster,'main-thread reference raster built');
const workerPixels=answer.relief.canvas.pixels,mainPixels=raster.canvas.pixels;
assert.equal(workerPixels.length,mainPixels.length);
let compared=0,nonempty=0;
for(let i=0;i<workerPixels.length;i+=4){
 for(let j=0;j<4;j++)assert.equal(workerPixels[i+j],mainPixels[i+j],
  'Worker/main raster RGB mismatch at pixel '+i/4+' channel '+j);
 if(workerPixels[i+3])nonempty++;compared++;
}
assert(nonempty>1000,'actual colored pixels rendered in synthetic test');
// Test split water over elevated land and active relief warping. Source
// atlas/shoreline logic is shared; oceans remain flat on the water layer.
worker.onmessage({data:{type:'texture',path:'ocean.png',
 bitmap:{width:32,height:32,rgba:[50,122,180,255],close(){}},worldSize:256}});
const seaCells=[{q:0,r:0,path:'ocean.png',terrainTypeId:'coastal_water'}];
worker.onmessage({data:{type:'render',id:12,data:{
 cells:seaCells,bounds:{x:-65,y:-55,width:130,height:110,lowResolution:true},
 options,types:[{id:'coastal_water',materialClass:'water'}],
 relief:{enabled:true,strength:0,profile:'rounded',center:'0,0',pads:[]},
 maskCells:[{q:0,r:0,wet:true}],maskKey:'sea-test'
}}});
const seaAnswer=worker.messages.pop();
assert.equal(seaAnswer.type,'result',seaAnswer.message||'water worker failed');
assert(seaAnswer.waterLayer?.canvas?.pixels?.some((v,i)=>i%4===3&&v>0),
 'water RGBA remains on its own flat layer');
assert(!seaAnswer.relief.canvas.pixels.some((v,i)=>i%4===3&&v>0),
 'water must never bleed into elevated land raster');
const plainBounds={x:-70,y:-60,width:140,height:120,lowResolution:true};
worker.onmessage({data:{type:'render',id:13,data:{
 cells:[cells[0]],bounds:plainBounds,options,
 types:[{id:'grassland',materialClass:'ground'}],
 relief:{enabled:true,strength:18,profile:'rounded',center:'0,0',
  lighting:true,connected:true,padBuildings:false,pads:[]},
 maskCells:[{q:0,r:0,wet:false}],maskKey:'hill-test'
}}});
const hill=worker.messages.pop();
assert.equal(hill.type,'result',hill.message||'relief worker failed');
assert(hill.relief.height>plainBounds.height,'OffscreenCanvas produced elevated terrain overlay');
assert(hill.relief.canvas.pixels.some((v,i)=>i%4===3&&v>0),
 'active terrain displacement still contains visible pixels');
console.log('PASS: OffscreenCanvas raster parity across '+compared+
 ' biome-blend pixels, separate flat-water bitmap and active relief bitmap.');

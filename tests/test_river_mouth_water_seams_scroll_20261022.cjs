'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(names){
 const browser={window:{},document:{createElement:()=>new FakeCanvas()}};
 for(const name of names)vm.runInNewContext(read(name),browser,{filename:name});
 return browser.window;
}
class FakeCanvas{
 width=0;height=0;original=null;last=null;
 getContext(){
  const canvas=this;
  return {
   drawImage(image){canvas.original=image;},
   createPattern(){return {setTransform(){}};},
   createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),
   getImageData(x,y,w,h){
    const pixels=new Uint8ClampedArray(w*h*4);
    if(canvas.original){
     for(let j=0;j<h;j++)for(let i=0;i<w;i++){
      const sourceX=Math.floor(i*(canvas.original.naturalWidth||32)/w);
      const p=4*(j*w+i);
      pixels[p]=sourceX%230+10;pixels[p+1]=120;
      pixels[p+2]=180;pixels[p+3]=255;
     }
    }else if(canvas.last)pixels.set(canvas.last.slice(0,pixels.length));
    return {width:w,height:h,data:pixels};
   },
   putImageData(image){canvas.last=new Uint8ClampedArray(image.data);},
   save(){},restore(){},setTransform(){},fillRect(){},beginPath(){},
   arc(){},moveTo(){},lineTo(){},rect(){},clip(){},stroke(){},
  };
 }
}
test('riverbank vanishes BEFORE entering ocean, in all six hex-edge headings',()=>{
 const W=load(['river.js','river-banks.js']),fn=W.VedrasRiverBanks.mouthLandFade;
 for(let i=0;i<6;i++){
  const angle=i*Math.PI/3,n={x:Math.cos(angle),y:Math.sin(angle)};
  const mouth={cross:{x:120,y:-40},tip:{x:120+n.x*70,y:-40+n.y*70}};
  const at=s=>fn(120+n.x*s,-40+n.y*s,mouth,40);
  assert.equal(at(-35),1);
  assert.ok(at(-10)>0&&at(-10)<1);
  assert.equal(at(0),0);
  assert.equal(at(10),0);
  assert.equal(at(60),0);
 }
 assert.match(read('river.js'),/bankImage\.data\[base\+3\]=Math\.round\(rim\*\.20\*fade\*landFade\)/);
});
test('fixed centre-line artefacts are repaired only when very consistent',()=>{
 const W=load(['water-texture.js']),repair=W.VedrasWaterTexture.repairPixels;
 const width=64,height=64,pixels=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const k=(y*width+x)*4;pixels[k]=26;pixels[k+1]=105;pixels[k+2]=177;pixels[k+3]=255;
 }
 for(let y=0;y<height;y++){
  const k=(y*width+32)*4;pixels[k]=250;pixels[k+1]=250;pixels[k+2]=255;
 }
 const inputCopy=pixels.slice(),output=repair(pixels,width,height);
 assert.deepEqual(pixels,inputCopy,'source PNG pixels must not be mutated');
 assert.ok(output[(30*width+32)*4]<40,'vertical artificial line should disappear');
 assert.equal(output[(30*width+18)*4],pixels[(30*width+18)*4],
  'unrelated water detail must be left untouched');
 // An occasional water highlight is not a stripe and must survive unchanged.
 const isolated=inputCopy.slice();
 for(let y=0;y<height;y++){
  const k=(y*width+32)*4;
  isolated[k]=y%6===0?250:26;
  isolated[k+1]=y%6===0?250:105;
  isolated[k+2]=y%6===0?255:177;
 }
 const repaired=repair(isolated,width,height);
 assert.equal(repaired[(7*width+32)*4],26);
 assert.equal(repaired[(12*width+32)*4],250); // outside the 8px repeat-edge blend
});
test('water texture repeat borders are made continuous without changing the source',()=>{
 const W=load(['water-texture.js']),repair=W.VedrasWaterTexture.repairPixels;
 const width=48,height=48,pixels=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const k=(y*width+x)*4;
  pixels[k]=x*3;pixels[k+1]=y*3;pixels[k+2]=140;pixels[k+3]=255;
 }
 const output=repair(pixels,width,height);
 for(let y=0;y<height;y++){
  assert.equal(output[(y*width)*4],output[(y*width+width-1)*4]);
 }
 for(let x=0;x<width;x++){
  assert.equal(output[x*4],output[((height-1)*width+x)*4]);
 }
 assert.equal(pixels[0],0,'original texture must be unchanged');
});
test('world tiling fills multiple source-atop tiles without erasing masked water',()=>{
 const W=load(['water-texture.js']),fill=W.VedrasWaterTexture.fillWorld;
 const trace=[],ctx={globalCompositeOperation:'source-in',drawImage:(img,x,y,w,h)=>
  trace.push({x,y,w,h,mode:ctx.globalCompositeOperation})};
 const image={naturalWidth:32,naturalHeight:32};
 const a={x:160,y:-40,width:540,height:100};
 assert.equal(fill(ctx,image,a,256),true);
 assert.ok(trace.length>=6);
 assert.ok(trace.every(t=>t.mode==='source-atop'));
 assert.equal(ctx.globalCompositeOperation,'source-in');
 assert.equal(trace[0].x,0);
 assert.equal(trace[0].y,-256);
});
test('fractional-resolution terrain chunks share the same world-pixel lattice',()=>{
 const W=load(['water-texture.js','autotile.js']),A=W.VedrasAutotile;
 const asset={path:'water.png',img:{naturalWidth:32,naturalHeight:32}};
 const cells=[{q:0,r:0,terrainTypeId:'water'}],opts={
  band:14,blend:false,waterSampling:'hex',resolution:.6,maxPixels:200000,
  materialClassOf:()=> 'water',
  transitionMode:()=> 'soft_water'
 };
 const one=A.build(cells,()=>asset,()=>'water',
  {...opts,bounds:{x:-55,y:-55,width:140,height:140,lowResolution:true}});
 const two=A.build(cells,()=>asset,()=>'water',
  {...opts,bounds:{x:-10,y:-55,width:140,height:140,lowResolution:true}});
 assert.ok(one&&two);
 const pixA=one.canvas.last,pixB=two.canvas.last;
 const d=.6,ax=Math.round(one.x*d),ay=Math.round(one.y*d),
  bx=Math.round(two.x*d),by=Math.round(two.y*d);
 let checked=0;
 for(let gy=-12;gy<28;gy++)for(let gx=0;gx<35;gx++){
  const ia=((gy-ay)*one.canvas.width+(gx-ax))*4;
  const ib=((gy-by)*two.canvas.width+(gx-bx))*4;
  for(let c=0;c<4;c++)assert.equal(pixA[ia+c],pixB[ib+c]);
  checked++;
 }
 assert.ok(checked>1000);
});
test('outer page scrollbar is disabled without affecting panel scrolling',()=>{
 const css=read('style.css'),html=read('index.html');
 assert.match(css,/@media\s*\(min-width:801px\)\s*\{[\s\S]*html,body\{[^}]*overflow:hidden/);
 assert.match(css,/\.library,\.inspector\{overflow-y:auto;overflow-x:hidden/);
 assert.match(html,/style\.css\?v=0\.35\.0/);
 assert.match(html,/water-texture\.js\?v=0\.1\.0/);
 const worker=read('terrain-worker.js');
 assert.match(worker,/importScripts\('water-texture\.js\?v=0\.1\.0'/);
});

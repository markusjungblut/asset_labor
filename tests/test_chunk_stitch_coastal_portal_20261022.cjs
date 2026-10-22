'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const load=(name,sandbox)=>vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),sandbox);

function clipContext(scaleX,scaleY,translateX,translateY){
 const calls=[],matrix={a:scaleX,b:0,c:0,d:scaleY,e:translateX,f:translateY};
 const ctx={
  getTransform:()=>({...matrix}),
  setTransform:(...args)=>{calls.push(['transform',...args]);},
  beginPath:()=>calls.push(['begin']),
  rect:(...args)=>calls.push(['rect',...args]),
  clip:()=>calls.push(['clip'])
 };
 return {ctx,calls};
}
test('four adjacent chunks share identical snapped device-pixel edges with no overlap',()=>{
 const sandbox={window:{}};load('chunks.js',sandbox);
 const engine=sandbox.window.VedrasChunks.create({size:512});
 for(const [sx,sy,tx,ty] of [[.6,.6,127.33,-41.75],[1.78,1.513,12.44,71.92],[.91,.86,-49.1,8.7]]){
  const {ctx,calls}=clipContext(sx,sy,tx,ty);
  const clips=[[0,0],[1,0],[0,1],[1,1]].map(([cx,cy])=>{
   const t={x:cx*512,y:cy*512,size:512};
   const box=engine.clipCore(ctx,t);assert.equal(box.space,'device');return box;
  });
  assert.equal(clips[0].x1,clips[1].x0,'vertical 1px overlap or gap');
  assert.equal(clips[2].x1,clips[3].x0,'lower vertical boundary mismatch');
  assert.equal(clips[0].y1,clips[2].y0,'horizontal 1px overlap or gap');
  assert.equal(clips[1].y1,clips[3].y0,'right horizontal mismatch');
  assert.equal(clips[0].x1,clips[2].x1);
  assert.equal(clips[0].y1,clips[1].y1);
  const rects=calls.filter(c=>c[0]==='rect');
  assert.equal(rects.length,4);
  for(const c of rects)for(const n of c.slice(1))assert.equal(n,Math.round(n));
 }
});
test('chunk renderer keeps world-coordinate source textures and falls back safely',()=>{
 const sandbox={window:{}};load('chunks.js',sandbox);
 const engine=sandbox.window.VedrasChunks.create();
 const recorded=[];
 const ctx={beginPath(){},rect:(...a)=>recorded.push(a),clip(){}};
 assert.equal(engine.clipCore(ctx,{x:512,y:0,size:512}).space,'world');
 assert.deepEqual(recorded[0],[512,0,512,512]);
 const source=fs.readFileSync(path.join(root,'chunks.js'),'utf8');
 assert.doesNotMatch(source,/const bleed=2;/);
 assert.match(source,/ctx\.setTransform\(m\)/);
});
class Canvas {
 width=0;height=0;data=null;
 getContext(){
  const parent=this;
  return {
   clearRect(){parent.data=null;},
   drawImage(){
    const a=new Uint8ClampedArray(parent.width*parent.height*4);
    for(let i=0;i<a.length;i+=4){a[i]=203;a[i+1]=193;a[i+2]=167;a[i+3]=255;}
    parent.data=a;
   },
   createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),
   getImageData:(x,y,w,h)=>({width:w,height:h,data:parent.data||new Uint8ClampedArray(w*h*4)}),
   putImageData:i=>{parent.data=i.data;},
   save(){},restore(){},scale(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}
  };
 }
}
test('coastal pixels and mouth-aperture alpha match between overlapping 0.8x chunks',()=>{
 const sandbox={window:{},document:{createElement:()=>new Canvas()}};
 load('shoreline.js',sandbox);const S=sandbox.window.VedrasShoreline;
 const cells=[{q:0,r:0},{q:1,r:0,wet:true}],isWet=c=>!!c.wet;
 const images=Array.from({length:6},()=>({naturalWidth:512}));
 const port={x:128,y:0,landQ:0,landR:0,side:1,width:42};
 const opts={mode:'art',resolution:.8,mouthPortals:[port]};
 const first=S.build(cells,isWet,images,{...opts,bounds:{x:-384,y:-384,width:768,height:768}});
 const second=S.build(cells,isWet,images,{...opts,bounds:{x:-128,y:-384,width:768,height:768}});
 assert.ok(first.canvas&&second.canvas);
 const density=.8;
 const xA=Math.round(first.x*density),yA=Math.round(first.y*density),
  xB=Math.round(second.x*density),yB=Math.round(second.y*density);
 let checked=0;
 for(let gy=-70;gy<=90;gy+=4)for(let gx=-65;gx<225;gx+=4){
  const xa=gx-xA,xb=gx-xB,ya=gy-yA,yb=gy-yB;
  if(xa<0||xb<0||ya<0||yb<0||xa>=first.canvas.width||xb>=second.canvas.width||
   ya>=first.canvas.height||yb>=second.canvas.height)continue;
  const ai=(ya*first.canvas.width+xa)*4,bi=(yb*second.canvas.width+xb)*4;
  for(let c=0;c<4;c++)assert.equal(first.canvas.data[ai+c],second.canvas.data[bi+c]);
  checked++;
 }
 assert.ok(checked>1500);
 const sample=(result,x,y)=>{
  const px=Math.floor(x*density)-Math.round(result.x*density),
   py=Math.floor(y*density)-Math.round(result.y*density);
  return result.canvas.data[(py*result.canvas.width+px)*4+3];
 };
 assert.equal(sample(first,128,0),0,'river mouth must be fully open');
 assert.ok(sample(first,128,65)>0,'shore must return beside river opening');
});
test('mouth portal softens two coast sides rather than discarding the entire shore edge',()=>{
 const src=fs.readFileSync(path.join(root,'shoreline.js'),'utf8');
 assert.match(src,/landMask|fromLand/);
 assert.match(src,/seaward|fromSea/);
 assert.match(src,/const aperture=side\*fromLand\*fromSea;/);
 assert.doesNotMatch(src,/skipEdges\.has\(/g); // skipEdges only a reusable helper, not render path
});

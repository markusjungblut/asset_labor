/* Real alpha raster of a coast must survive everywhere except the river portal. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),w={};
for(const file of ['shoreline.js','river.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),{window:w});
const S=w.VedrasShoreline,R=w.VedrasRivers;
const cells=[{q:0,r:0},{q:1,r:0}],wet=c=>c.q===1;
const route={hexes:[[0,0],[1,0]]},portal=R.mouthPortals([route],cells,wet,32)[0];
assert(portal,'valid river outlet');
let result=null;
const document={createElement:()=>{const cv={width:0,height:0};cv.getContext=()=>({
 createImageData(w,h){return {width:w,height:h,data:new Uint8ClampedArray(w*h*4)};},
 getImageData(x,y,w,h){
  const d=new Uint8ClampedArray(w*h*4);
  for(let i=3;i<d.length;i+=4)d[i]=190; // test-coast artwork uniformly opaque
  return {data:d};
 },
 clearRect(){},drawImage(){},putImageData(data){result=data;}
 });return cv;}};
const context={window:w,document};
vm.runInNewContext(fs.readFileSync(path.join(root,'shoreline.js'),'utf8'),context);
const images=Array.from({length:6},()=>({naturalWidth:512}));
const coast=S.build(cells,wet,images,{mode:'art',resolution:.8,mouthPortals:[portal]});
assert.equal(coast.segments.length,1,'river mouth does not erase coastline');
assert.equal(coast.mouthPortals,1);
assert(result?.data,'real alpha mask constructed');
const density=coast.canvas.width/coast.width;
const sample=(x,y)=>{
 const ix=Math.round((x-coast.x)*density),iy=Math.round((y-coast.y)*density);
 assert(ix>=0&&ix<result.width&&iy>=0&&iy<result.height,'sample inside raster');
 return result.data[(iy*result.width+ix)*4+3];
};
const vertex=S.vertices(cells[0]),a=vertex[1],b=vertex[2];
const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
const tx=dx/len,ty=dy/len;
const center=sample(portal.x,portal.y);
const near=sample(portal.x+tx*30,portal.y+ty*30);
const intact=sample(portal.x+tx*65,portal.y+ty*65);
assert(center<=10,'coast completely opens only at the precise river crossing: '+center);
assert(near>center&&near<intact,'portal blends smoothly into beach: '+near+' vs '+intact);
assert(intact>=175,'most of the host beach edge stays visible: '+intact);
console.log('PASS: full shoreline retained with narrow feathered river aperture ('+center+' → '+near+' → '+intact+' alpha).');

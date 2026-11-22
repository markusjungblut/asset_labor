'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../river.js'),'utf8');
function sandbox(){
 const allocations=[],draws=[];
 function canvas(){
  const c={width:0,height:0};
  const g={
   createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),
   putImageData:()=>{},save:()=>{},restore:()=>{},setTransform:()=>{},
   drawImage:()=>{},fillRect:()=>{},createPattern:()=>null,
  };
  c.getContext=()=>g;
  allocations.push(c);
  return c;
 }
 const window={VedrasWaterTexture:{fillWorld:()=>{}}};
 const document={createElement:type=>{
  assert.equal(type,'canvas');return canvas();
 }};
 vm.runInNewContext(source,{window,document,Uint8Array,Uint8ClampedArray,
  Float32Array,DataView,Math,Set,Map});
 return {river:window.VedrasRivers,allocations,draws,
  target:{drawImage:(...args)=>draws.push(args)}};
}
const route={hexes:[[0,0],[1,0],[2,0],[3,0]]};
const cells=route.hexes.map(([q,r],i)=>({q,r,water:i===3}));
const wet=c=>c.water;
const image={naturalWidth:512,naturalHeight:512};
test('original route geometry is unchanged while optional raster world window limits allocation',()=>{
 const full=sandbox(),cropped=sandbox();
 assert.equal(full.river.valid(route,cells,wet),true);
 const a=full.river.render(full.target,route,cells,wet,image,{width:32});
 const b=cropped.river.render(cropped.target,route,cells,wet,image,{
  width:32,bounds:{x:250,y:-128,width:512,height:768}
 });
 assert(a?.canvas&&b?.canvas);
 assert.deepEqual(
  JSON.parse(JSON.stringify(a.segments)),
  JSON.parse(JSON.stringify(b.segments)),'absolute corner routing unchanged');
 assert(b.canvas.width<a.canvas.width,
  'bounded tile source uses less raster memory than whole river');
 assert(b.canvas.height<=Math.ceil(768*1.55)+2);
 assert(b.x>=249&&b.x<=251);
 assert.equal(cropped.draws.length,1);
 assert.equal(cropped.draws[0][1],b.x);
 assert.equal(b.source,'rounded-edge-fillets');
 assert.equal(b.mouth,'shore-midpoint-fade');
});
test('adjacent world windows share a global 1.55 pixel lattice without raw-route truncation',()=>{
 const A=sandbox(),B=sandbox();
 const first=A.river.render(A.target,route,cells,wet,image,{
  bounds:{x:0,y:-200,width:512,height:700}
 });
 const second=B.river.render(B.target,route,cells,wet,image,{
  bounds:{x:512,y:-200,width:512,height:700}
 });
 assert(first?.canvas&&second?.canvas);
 const nearInteger=x=>Math.abs(x-Math.round(x))<1e-6;
 assert(nearInteger(first.x*1.55));
 assert(nearInteger(second.x*1.55));
 assert(nearInteger((first.x+first.widthWorld)*1.55));
 assert(nearInteger((second.x+second.widthWorld)*1.55));
 assert.deepEqual(
  JSON.parse(JSON.stringify(first.segments)),
  JSON.parse(JSON.stringify(second.segments)));
});
test('empty out-of-range window returns no PNG and invalid requested bounds fail closed',()=>{
 const w=sandbox();
 assert.equal(w.river.render(w.target,route,cells,wet,image,{
  bounds:{x:99999,y:99999,width:512,height:512}
 }),null);
 assert.equal(w.draws.length,0);
 assert.throws(()=>w.river.render(w.target,route,cells,wet,image,{
  bounds:{x:0,y:0,width:9000,height:512}
 }),/Rasterbereich/);
});

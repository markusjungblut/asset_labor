'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

function setup(){
 class Canvas {
  width=0;height=0;snapshot=null;
  getContext(){
   const canvas=this;
   return {
    createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),
    putImageData(image){canvas.snapshot=new Uint8ClampedArray(image.data);},
    createPattern:()=>({setTransform(){}}),
    save(){},restore(){},setTransform(){},fillRect(){},drawImage(){}
   };
  }
 }
 const sandbox={window:{},document:{createElement:()=>new Canvas()}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'river.js'),'utf8'),sandbox);
 vm.runInNewContext(fs.readFileSync(path.join(root,'river-banks.js'),'utf8'),sandbox);
 return {R:sandbox.window.VedrasRivers,B:sandbox.window.VedrasRiverBanks};
}
function fixture(R){
 const DIRS=R.DIRS,cells=[];
 for(let r=-3;r<=3;r++)for(let q=-3;q<=3;q++)if(Math.abs(r+q)<=3){
  const wet=DIRS.some(([dq,dr])=>q===2*dq&&r===2*dr);
  cells.push({q,r,wet,terrainTypeId:wet?'lake':'grassland'});
 }
 const routes=DIRS.map(([dq,dr])=>({hexes:[[0,0],[dq,dr],[dq*2,dr*2]]}));
 return {cells,routes,isWet:c=>c.wet};
}
test('all six shared hex-edge directions produce a valid continuous bank network',()=>{
 const {R,B}=setup(),{cells,routes,isWet}=fixture(R);
 for(const route of routes){
  assert.equal(R.valid(route,cells,isWet),true);
  assert.equal(R.sections(route,cells,isWet).length,2);
 }
 const net=B.prepare(routes,cells,isWet,{width:40});
 assert.equal(net.routeCount,6);
 assert.ok(net.lines.length>20);
 for(const line of net.lines)assert.ok(Number.isFinite(line.length2)&&line.length2>0);
});
test('land materials choose distinct rocky, wet, vegetated and soft-earth banks',()=>{
 const {B}=setup();
 assert.equal(B.material({terrainTypeId:'hilly_ground'}),'rock');
 assert.equal(B.material({terrainTypeId:'highland'}),'rock');
 assert.equal(B.material({terrainTypeId:'marshland'}),'marsh');
 assert.equal(B.material({terrainTypeId:'moorground'}),'marsh');
 assert.equal(B.material({terrainTypeId:'forest'}),'forest');
 assert.equal(B.material({terrainTypeId:'grassland'}),'earth');
 const rocky=B.paletteAt(0,0,[{q:0,r:0,bankMaterial:'rock'}]);
 const marsh=B.paletteAt(0,0,[{q:0,r:0,bankMaterial:'marsh'}]);
 assert.ok(rocky.rock>marsh.rock&&marsh.marsh>rocky.marsh);
});
test('bank is a shallow feathered shelf, never a uniform opaque dark stripe',()=>{
 const {B}=setup(),style={r:118,g:104,b:82,rock:.8,marsh:0};
 const inside=B.bankSample(21,20,style,.8,65,81,.4);
 const lip=B.bankSample(34,20,style,.8,65,81,.4);
 const beyond=B.bankSample(75,20,style,.8,65,81,.4);
 assert.ok(inside.alpha>0&&lip.alpha>0);
 assert.equal(beyond.alpha,0);
 assert.ok(inside.alpha<1&&lip.alpha<1);
 assert.deepEqual(B.bankSample(34,20,style,.8,65,81,.4),
  B.bankSample(34,20,style,.8,65,81,.4));
});
test('multiple rivers sharing a junction are unioned with max coverage, never stacked',()=>{
 const {R,B}=setup(),{cells,routes,isWet}=fixture(R);
 const first=B.prepare([routes[0]],cells,isWet,{width:40});
 const doubled=B.prepare([routes[0],routes[0]],cells,isWet,{width:40});
 const bounds={x:-330,y:-260,width:660,height:520};
 const a=B.nearestField(first,bounds,1),b=B.nearestField(doubled,bounds,1);
 for(let i=0;i<a.distances.length;i+=103)
  assert.equal(a.distances[i],b.distances[i]);
 const raster1=B.render(first,{bounds,resolution:.6,bankStrength:.8});
 const raster2=B.render(doubled,{bounds,resolution:.6,bankStrength:.8});
 assert.equal(raster1.waterPixels,raster2.waterPixels);
 assert.equal(raster1.bankPixels,raster2.bankPixels);
 assert.deepEqual(raster1.canvas.snapshot,raster2.canvas.snapshot);
});
test('world-space bank and stone masks match across overlapping chunk margins',()=>{
 const {R,B}=setup(),{cells,routes,isWet}=fixture(R);
 const prepared=B.prepare([routes[1]],cells,isWet,{width:40});
 const left={x:-256,y:-256,width:768,height:768};
 const right={x:0,y:-256,width:768,height:768};
 const a=B.render(prepared,{bounds:left,resolution:1,bankStrength:.8});
 const b=B.render(prepared,{bounds:right,resolution:1,bankStrength:.8});
 assert.ok(a&&b);
 // Both canvases represent the same world positions where their halos overlap.
 // Sample pixels with identical integer-world centres.
 let matched=0;
 for(let y=-180;y<420;y+=23)for(let x=15;x<470;x+=19){
  const ai=((y+256)*a.canvas.width+(x+256))*4;
  const bi=((y+256)*b.canvas.width+x)*4;
  for(let c=0;c<4;c++)assert.equal(a.canvas.snapshot[ai+c],b.canvas.snapshot[bi+c]);
  matched++;
 }
 assert.ok(matched>100);
});

test('0.6x editor riverbank pixels align exactly across world-anchored chunks',()=>{
 const {R,B}=setup(),{cells,routes,isWet}=fixture(R);
 const prepared=B.prepare([routes[0],routes[1]],cells,isWet,{width:40});
 const left={x:-256,y:-256,width:768,height:768};
 const right={x:0,y:-256,width:768,height:768};
 const a=B.render(prepared,{bounds:left,resolution:.6,bankStrength:.8});
 const b=B.render(prepared,{bounds:right,resolution:.6,bankStrength:.8});
 const density=.6,ax=Math.floor(left.x*density),bx=Math.floor(right.x*density);
 const ay=Math.floor(left.y*density),by=Math.floor(right.y*density);
 let checked=0;
 for(let gy=-120;gy<230;gy+=11)for(let gx=5;gx<245;gx+=11){
  const ia=((gy-ay)*a.canvas.width+(gx-ax))*4;
  const ib=((gy-by)*b.canvas.width+(gx-bx))*4;
  for(let k=0;k<4;k++)assert.equal(a.canvas.snapshot[ia+k],b.canvas.snapshot[ib+k]);
  checked++;
 }
 assert.ok(checked>400);
});

test('old river data structures and scene exports remain usable',()=>{
 assert.match(app,/window\.VedrasRiverBanks\.prepare\(routes,bankCells,wetHex/);
 assert.match(app,/window\.VedrasRiverBanks\.render\(riverNetworkCache\.prepared/);
 assert.match(app,/riverNetworkCache=\{signature,prepared,occupancy\}/);
 assert.match(app,/riverBanks:state\.riverBanks,riverBankStrength:state\.riverBankStrength/);
 assert.match(app,/state\.riverBanks=scene\.riverBanks!==false/);
 assert.match(app,/river\.painted===river\.visible&&river\.stalePainted===0/);
 assert.match(html,/id="riverBanks"/);
 assert.match(html,/id="riverBankStrength"/);
 assert.match(html,/river-banks\.js\?v=/);
 assert.match(html,/river\.js\?v=/);
});

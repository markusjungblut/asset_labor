'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const Seam=require('../large-map-bake-scenery-seam.js');
const plan={schema:'vedras-geography-bake-plan-v1',stage:'plan-only',
 rasterized:false,readyForViewer:false,grid:{tileSize:512},
 source:{fingerprint:'source-fingerprint-123'},tileCount:3,
 tiles:[{id:'0,0',x:0,y:0,size:512},
  {id:'1,0',x:512,y:0,size:512},
  {id:'0,1',x:0,y:512,size:512}]};
const SIZE_X=1920,SIZE_Y=1632;
function harness({mutate=false,blank=false,wrongSource=false}={}){
 const calls=[];
 const tileById=new Map(plan.tiles.map(t=>[t.id,t]));
 const renderer={previewOnly:true,defaultTile:()=> '0,0',
  async renderTile(id){
   calls.push(id);
   const tile=tileById.get(id);
   if(!tile)throw Error('tile absent');
   const png=new Blob(['fake PNG bytes'],{type:'image/png'});
   png.tile=id;
   return {schema:'vedras-geography-joint-scenery-preview-v1',
    stage:'original-tree-mountain-combined-preview',
    tile,width:SIZE_X,height:SIZE_Y,
    samplesPerWorldUnitX:2.5,samplesPerWorldUnitY:2.125,
    sourceFingerprint:wrongSource?'stale':'source-fingerprint-123',
    rasterized:true,transparent:true,complete:false,
    readyForViewer:false,png};
  }
 };
 const bitmapFactory=async png=>({width:SIZE_X,height:SIZE_Y,
  tile:png.tile,close:()=>{}});
 const canvasFactory=()=>{
  let bitmap=null;
  return {getContext:()=>({
   drawImage:(b)=>{bitmap=b;},
   getImageData(x,y,w,h){
    const t=tileById.get(bitmap.tile);
    const dx=(t.x-128)*2.5,dy=(t.y-128)*2.125;
    const pixels=new Uint8ClampedArray(w*h*4);
    for(let row=0;row<h;row++)for(let col=0;col<w;col++){
     const gx=dx+x+col,gy=dy+y+row;
     const paint=!blank&&gx>=972&&gx<1100&&gy>=50&&gy<300;
     const index=(row*w+col)*4;
     if(!paint)continue;
     pixels[index]=Math.abs(gx)%251;
     pixels[index+1]=Math.abs(gy)%251;
     pixels[index+2]=112;
     pixels[index+3]=255;
     if(mutate&&bitmap.tile==='1,0'&&gx===1000&&gy===100)
      pixels[index]=(pixels[index]+1)%256;
    }
    return {data:pixels};
   }
  })};
 };
 return {seam:Seam.create({plan,renderer,canvasFactory,bitmapFactory}),calls};
}
test('right-side overlap: canonical world pixels are exactly identical',async()=>{
 const h=harness();
 assert.deepEqual(h.seam.defaultPair(),{
  id:'0,0',neighborId:'1,0',direction:'right'});
 const r=await h.seam.verifyPair('0,0','right');
 assert.equal(r.schema,'vedras-geography-joint-scenery-seam-proof-v1');
 assert.equal(r.stage,'joint-original-png-pixel-seam-proof');
 assert.equal(r.overlapWidth,640);
 assert.equal(r.overlapHeight,1632);
 assert.equal(r.testedPixels,1044480);
 assert(r.paintedPixels>100);
 assert(r.transparentPixels>100);
 assert.equal(r.differingPixels,0);
 assert.equal(r.maxChannelDifference,0);
 assert.equal(r.passesPixelIdentity,true);
 assert.deepEqual(h.calls,['0,0','1,0']);
 assert.equal(r.rasterized,false);
 assert.equal(r.complete,false);
 assert.equal(r.readyForViewer,false);
});
test('down-side overlap: world pixel lattice is equally 1088 px aligned',async()=>{
 const r=await harness().seam.verifyPair('0,0','down');
 assert.equal(r.overlapWidth,1920);
 assert.equal(r.overlapHeight,544);
 assert.equal(r.testedPixels,1044480);
 assert.equal(r.differingPixels,0);
 assert.equal(r.passesPixelIdentity,false,
  'completely transparent overlaps are not a valid positive seam proof');
});
test('single changed colored pixel fails quality gate and reports its coordinates',async()=>{
 const r=await harness({mutate:true}).seam.verifyPair('0,0','right');
 assert.equal(r.differingPixels,1);
 assert.equal(r.maxChannelDifference,1);
 assert.equal(r.passesPixelIdentity,false);
 assert.equal(r.firstDifferences.length,1);
 assert.equal(r.firstDifferences[0].x,1000-960);
});
test('fully transparent overlap cannot pass and stale source images are refused',async()=>{
 const empty=await harness({blank:true}).seam.verifyPair('0,0','right');
 assert.equal(empty.differingPixels,0);
 assert.equal(empty.paintedPixels,0);
 assert.equal(empty.passesPixelIdentity,false);
 await assert.rejects(
  harness({wrongSource:true}).seam.verifyPair('0,0','right'),
  /Quellrevision/);
 await assert.rejects(harness().seam.verifyPair('1,0','right'),
  /benachbarte/);
 await assert.rejects(harness().seam.verifyPair('0,0','diagonal'),
  /right\/down/);
});
test('no completed source plan is accepted as proof',()=>{
 assert.throws(()=>Seam.create({plan:{...plan,readyForViewer:true},
  renderer:{previewOnly:true,renderTile(){}},bitmapFactory:()=>{},
  canvasFactory:()=>{}}),/ungeänderten Weltplan/);
});
test('seam test is explicitly opt-in and sparse-checked, not an atlas publisher',()=>{
 const root=path.resolve(__dirname,'..');
 const html=fs.readFileSync(path.join(root,'geography-lab.html'),'utf8');
 const lab=fs.readFileSync(path.join(root,'geography-lab.js'),'utf8');
 const ci=fs.readFileSync(path.join(root,
  '.github/workflows/geography-large-bake-ci.yml'),'utf8');
 assert(html.includes('src="large-map-bake-scenery-seam.js'));
 assert(html.includes('id="verifyJointSeam"'));
 assert(html.includes('id="jointSeamReport"'));
 assert.match(lab,/SEAM\.create/);
 assert.match(lab,/\.verifyPair\(id,direction\)/);
 assert.match(lab,/passesPixelIdentity/);
 assert(ci.includes('/large-map-bake-scenery-seam.js'));
 assert(ci.includes('/tests/test_large_map_bake_scenery_seam_20261123.cjs'));
});

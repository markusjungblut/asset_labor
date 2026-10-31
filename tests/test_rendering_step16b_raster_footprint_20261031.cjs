'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const streamer=fs.readFileSync(path.join(root,'world-tile-streamer.js'),'utf8');
const audit=fs.readFileSync(path.join(root,'scripts/rendering-step16a-audit.mjs'),'utf8');
function fixture(){
 const window={};
 vm.runInNewContext(streamer,{window,console,Date,Promise,
  setTimeout,clearTimeout,performance,AbortController});
 const context={save(){},restore(){},setTransform(){},clearRect(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},
  fill(){},fillRect(){},drawImage(){}};
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:4,height:4,getContext:()=>context},
  source:null,requireScenery:true,lodSelector:()=> 'mid',
  maxTiles:10,maxPixels:1000000
 });
 const tile=x=>({id:x+',0',x:x*512,y:0,size:512,visibility:'visible'});
 const packet=(ground,scenery,preview=false)=>({
  complete:true,preview,revision:'stable',
  layers:[{layer:'ground',pad:3,image:{width:ground[0],height:ground[1]}},
   {layer:'scenery',pad:128,image:{width:scenery[0],height:scenery[1]}}]
 });
 return {renderer,tile,packet};
}
test('diagnostic records exact per-layer dimensions, padding and pixel count',()=>{
 const {renderer,tile,packet}=fixture(),t=tile(0);
 renderer.reserveWarmTiles([t.id+'@mid']);
 renderer.seed(t,'mid',packet([60,80],[100,200]));
 const s=renderer.warmTileStatus(),r=s.rasterDetails[0];
 assert.equal(s.ready,1);
 assert.equal(s.reservedPixels,24800);
 assert.equal(s.pixels,24800);
 assert.equal(s.rasterAccountingMismatch,0);
 assert.equal(r.key,'0,0@mid');
 assert.equal(r.totalPixels,24800);
 assert.equal(r.accountedPixels,24800);
 assert.equal(r.layers[0].pixels,4800);
 assert.equal(r.layers[0].pad,3);
 assert.equal(r.layers[1].pixels,20000);
 assert.equal(r.layers[1].pad,128);
 assert.deepEqual(JSON.parse(JSON.stringify(s.reservedLayerPixels)),
  {ground:4800,scenery:20000});
});
test('reserved and unrelated retained raster pixels are kept separate',()=>{
 const {renderer,tile,packet}=fixture(),a=tile(0),b=tile(1);
 renderer.reserveWarmTiles([a.id+'@mid']);
 renderer.seed(a,'mid',packet([60,80],[100,200]));
 renderer.seed(b,'mid',packet([30,50],[40,50]));
 const s=renderer.warmTileStatus();
 assert.equal(s.reservedPixels,24800);
 assert.equal(s.unreservedPixels,3500);
 assert.equal(s.pixels,28300);
 assert.equal(s.rasterDetails.length,1);
 assert.equal(s.layerPixels.ground,6300);
 assert.equal(s.layerPixels.scenery,22000);
});
test('preview and stale states stay unready, while raster footprint remains observable',()=>{
 const {renderer,tile,packet}=fixture(),a=tile(0),b=tile(1);
 renderer.reserveWarmTiles([a.id+'@mid',b.id+'@mid']);
 renderer.seed(a,'mid',packet([60,80],[100,200],true));
 const s=renderer.warmTileStatus();
 assert.equal(s.preview,1);
 assert.equal(s.missing,1);
 assert.equal(s.ready,0);
 assert.equal(s.rasterDetails.length,1);
 assert.equal(s.reservedPixels,24800);
});
test('renderer formula explains measured 16-tile 26,250,048-pixel footprint',()=>{
 // Original full-quality mid fallback: 3 logical ground gutter, 128
 // logical scenery overhang, density=1.5, y projection=.85.
 const round=Math.round;
 const ground=[round((512+2*3)*1.5),
  round((512+2*3)*.85*1.5)];
 const scenery=[round((512+2*128)*1.5),
  round((512+2*128)*.85*1.5)];
 const groundPx=ground[0]*ground[1],sceneryPx=scenery[0]*scenery[1];
 assert.equal(groundPx,512820);
 assert.equal(sceneryPx,1127808);
 assert.equal(16*(groundPx+sceneryPx),26250048);
 assert.equal(26250048-26000000,250048);
});
test('telemetry is read-only; existing exactness and budget gates remain',()=>{
 const a=streamer.indexOf('function warmTileStatus()'),
  b=streamer.indexOf('function trim(protect=',a);
 assert.ok(a>0&&b>a);
 const section=streamer.slice(a,b);
 assert.match(section,/rasterDetails,layerPixels,reservedLayerPixels/);
 assert.match(section,/rasterAccountingMismatch/);
 assert.match(section,/overBudgetPixels:Math.max\(0,pixels-maxPixels\)/);
 assert.doesNotMatch(section,/cache\.set\(|cache\.delete\(|maxPixels\s*=/);
 assert.match(audit,/world\.overBudgetPixels===0/);
 assert.match(audit,/world\.revisionMismatch===0/);
});

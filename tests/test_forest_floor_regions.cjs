/* Forest-floor regional-masking regression. It checks the actual
 * construction path, not just that a function name exists in app.js. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),script=fs.readFileSync(path.join(root,'forest-ground.js'),'utf8');
const rootCtx={window:{}};
vm.runInNewContext(script,rootCtx,{filename:'forest-ground.js'});
const M=rootCtx.window.VedrasForestGround;
const field=(q,r,forestClass='dense_forest',baseBiome='grassland',categoryId='grass_pasture')=>
 ({q,r,forestClass,baseBiome,categoryId,ground:true,jungle:false});
const connected=[field(0,0),field(1,0,'light_forest','moor','wetlands')];
const isolated=field(5,0);
const exclude=[
 field(2,0,'dense_forest','snowfields','cold_regions'),
 {...field(3,0),jungle:true},
 {...field(4,0),ground:false},
 field(6,0,'none')
];
assert.equal(M.regions([...connected,...exclude]).length,1,'two adjacent forest hexes are a single region');
assert.equal(M.regions([connected[0],isolated]).length,2,'disconnected forests remain distinct');
assert.equal(M.exteriorEdges(connected).length,10,'two adjacent hexes have only 10 perimeter edges, NOT 12');
assert.equal(M.exteriorEdges([connected[0]]).length,6,'single hex perimeter is six edges');
assert.equal(M.exteriorEdges(M.regions([...connected,isolated])[0]).length,10);
assert.equal(M.regions([...connected,...exclude]).flat().length,2,'no jungle/snow/water is forest-floor masked');
assert(M.strength(connected[1])<M.strength(connected[0]),'wet forest stays visually subdued');
const shared=M.exteriorEdges(connected);
assert(!shared.some(e=>{
 const mid={x:(e.from.x+e.to.x)/2,y:(e.from.y+e.to.y)/2};
 const a=M.pos(connected[0]),b=M.pos(connected[1]);
 return Math.abs(Math.hypot(mid.x-a.x,mid.y-a.y)-256/Math.sqrt(3)*Math.sqrt(3)/2)<1e-3&&
  Math.abs(Math.hypot(mid.x-b.x,mid.y-b.y)-256/Math.sqrt(3)*Math.sqrt(3)/2)<1e-3;
}),'shared inner edge is not in the exterior feather geometry');
const canvases=[];
const document={createElement(type){
 assert.equal(type,'canvas');
 const ops=[];const canvas={width:0,height:0,ops};
 const ctx={
  ops,filter:'none',globalCompositeOperation:'source-over',fillStyle:'',
  setTransform(...args){ops.push(['matrix',...args]);},
  scale(...args){ops.push(['scale',...args]);},
  beginPath(){ops.push(['begin']);},
  moveTo(...args){ops.push(['move',...args]);},
  lineTo(...args){ops.push(['line',...args]);},
  closePath(){ops.push(['close']);},
  fill(){ops.push(['fill',this.fillStyle]);},
  createPattern(img,repeat){ops.push(['pattern',repeat]);return {img,repeat};},
  fillRect(...args){ops.push(['fillRect',...args]);},
  drawImage(...args){ops.push(['drawImage',this.filter,this.globalCompositeOperation]);}
 };
 canvas.getContext=()=>ctx;canvases.push(canvas);return canvas;
}};
const runtime={window:{},document};
vm.runInNewContext(script,runtime,{filename:'forest-ground.js'});
const build=runtime.window.VedrasForestGround.build;
const art={naturalWidth:512,naturalHeight:512};
const raster=build([...connected,isolated,...exclude],art,{textureSize:256,feather:24,resolution:1,maxPixels:2000000});
assert(raster&&raster.canvas,'raster is generated');
assert.equal(raster.cells,3);
assert.equal(raster.regions,2);
assert.equal(raster.exteriorEdges,16,'inner forest-to-forest border is excluded');
assert.equal(raster.textureOrigin,'world-0,0');
assert.equal(raster.mask,'region-union');
assert.equal(canvases.length,3,'one shared union mask, one filtered result, one world texture');
const maskOps=canvases[0].ops;
assert.equal(maskOps.filter(o=>o[0]==='fill').length,2,
 'mask is filled ONCE PER REGION, never once per hex');
assert.equal(maskOps.filter(o=>o[0]==='move').length,3,'union path contains each hex');
assert.equal(canvases[1].ops.filter(o=>o[0]==='drawImage').length,1,'blurred mask is computed once');
const textureOps=canvases[2].ops;
assert.equal(textureOps.filter(o=>o[0]==='pattern').length,1,'one repeating material covers all hexes');
assert(textureOps.some(o=>o[0]==='matrix'&&o[4]!==0),'UV coordinates tied to world offset');
assert(textureOps.some(o=>o[0]==='drawImage'&&o[2]==='destination-in'),
 'feathered union mask clips the textured region');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(app.includes('window.VedrasForestGround.build(cells,asset.img'), 'map uses forest region raster');
assert(app.includes('let forestFloorRasterCache='),'region mask caches across draws');
assert(app.includes('textureSize,resolution,maxPixels:2600000,feather:23'),'one feather for region');
assert(!app.includes('forestFloorStamps'),'legacy radial per-hex overlay is removed');
assert(html.includes('forest-ground.js?v=0.22.0'),'new script loads on client');
assert(html.indexOf('forest-ground.js?v=0.22.0')<html.indexOf('app.js?v=0.22.0'),'region renderer loads before app');
console.log('PASS: connected forest union has no inner bank, shared world UV phase, outer-only feather, and module load order.');

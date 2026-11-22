'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const G=require('../worldgen-geography.js');
const MIX=require('../geography-lab-presets.js');
const Plan=require('../large-map-bake-plan.js');
const Source=require('../large-map-bake-source.js');
const Coast=require('../large-map-bake-shoreline.js');
const context={window:{}};
for(const file of ['river.js','shoreline.js'])
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
const rivers=context.window.VedrasRivers;
const originals=context.window.VedrasShoreline;
const WET=new Set(['ocean','coastal_water','coast','icy_ocean','stormy_ocean']);
const catalog={terrainTypes:G.TERRAIN_IDS.map(id=>({
 id,materialClass:WET.has(id)?'water':'ground'
}))};
const wet=c=>WET.has(c.terrainId);
const world=()=>G.generateWorld(MIX.PRESET.seed,{
 width:MIX.PRESET.width,height:MIX.PRESET.height,
 config:MIX.configFor(G)
});
function shoreTile(w,p,source){
 for(const tile of p.tiles){
  const context=source.contextFor(tile.id,{sourceHalo:Coast.SOURCE_HALO});
  const segments=originals.segments(context.cells,wet);
  if(segments.some(s=>s.center.x>=tile.x-128-260&&
   s.center.x<=tile.x+512+128+260&&
   s.center.y>=tile.y-128-260&&
   s.center.y<=tile.y+512+128+260))
   return context;
 }
 throw Error('No test coastline in reference world.');
}
test('all ten full-world rivers are valid; shoreline adapter keeps their mouth positions without holes',()=>{
 const w=world(),plan=Plan.plan(w),source=Source.create(w,plan,{planner:Plan});
 assert.equal(w.riverPaths.length,10);
 for(const route of w.riverPaths)
  assert.equal(rivers.valid({hexes:route},w.cells,wet),true);
 const fullPortals=rivers.mouthPortals(
  w.riverPaths.map(hexes=>({hexes})),w.cells,wet,32);
 assert.equal(fullPortals.length,w.riverPaths.length);
 const renderer=Coast.create({world:w,catalog,shoreline:originals,
  rivers,loadImage:async()=>({img:{naturalWidth:512,naturalHeight:512}})});
 assert.equal(renderer.riverMouthCount,10);
 const near=shoreTile(w,plan,source);
 const p=renderer.prepare(near);
 assert(p.requiredSides.length>0);
 assert(p.nearCount>0);
 assert(p.nearbyMouths.every(m=>fullPortals.some(f=>
  f.x===m.x&&f.y===m.y&&f.side===m.side)));
 assert.equal(renderer.sourceHalo,768);
 assert.throws(()=>renderer.prepare({...near,sourceHalo:470}),/Halo/);
});
test('original six-sided shoreline renderer uses actual side PNGs and never temporary strokes',async()=>{
 const w=world(),plan=Plan.plan(w),source=Source.create(w,plan,{planner:Plan});
 const ctx=shoreTile(w,plan,source),seenPaths=[],calls=[];
 const fakeShore={segments:originals.segments,build:(cells,isWet,images,opts)=>{
  assert.equal(opts.mode,'art');
  assert.equal(opts.resolution,1.5);
  assert.deepEqual(opts.mouthPortals,[],'without river water, leave shore intact');
  assert(opts.segments.length>=1);
  assert(images.some(img=>img?.naturalWidth===512));
  assert(cells.some(c=>isWet(c))&&cells.some(c=>!isWet(c)));
  calls.push(opts);
  return {canvas:{realArt:true},x:opts.bounds.x,y:opts.bounds.y,
   width:opts.bounds.width,height:opts.bounds.height,missing:0};
 }};
 const renderer=Coast.create({world:w,catalog,shoreline:fakeShore,rivers,
  loadImage:async asset=>{
   seenPaths.push(asset.path);
   return {img:{naturalWidth:512,naturalHeight:512}};
  }});
 const prep=renderer.prepare(ctx),result=await renderer.render(ctx);
 assert.equal(result.stage,'original-shoreline-preview');
 assert.equal(result.complete,false);
 assert.equal(result.readyForViewer,false);
 assert.equal(result.segmentCount,prep.nearCount);
 assert.equal(calls.length,1);
 assert.equal(result.assetsUsed.length,prep.requiredSides.length);
 assert.deepEqual(seenPaths,prep.requiredSides.map(i=>Coast.SHORE_PATHS[i]));
 assert(result.assetsUsed.every(p=>/^assets\/shorelines\/shore_v105_edge_0[1-6]\.png$/.test(p)));
 assert(result.canvas.realArt);
});
test('missing originals or failed shoreline build block PNG creation, no generated coastline fallback',async()=>{
 const w=world(),plan=Plan.plan(w),source=Source.create(w,plan,{planner:Plan}),
 ctx=shoreTile(w,plan,source);
 const make=({loadImage,build})=>Coast.create({
  world:w,catalog,rivers,
  shoreline:{segments:originals.segments,build},loadImage
 });
 const failFile=make({loadImage:async()=>({img:{naturalWidth:0,naturalHeight:0}}),
  build:()=>{throw Error('should not draw');}});
 await assert.rejects(()=>failFile.render(ctx),/Original-Ufer-PNG fehlt/);
 const badRender=make({loadImage:async()=>({img:{naturalWidth:512,naturalHeight:512}}),
  build:()=>({canvas:null,missing:1})});
 await assert.rejects(()=>badRender.render(ctx),/nicht vollständig/);
 const corrupt={...w,riverPaths:[...w.riverPaths,[[1,1],[44,55]]]};
 assert.throws(()=>Coast.create({world:corrupt,catalog,shoreline:originals,rivers,
  loadImage:async()=>({})}),/inkonsistent/);
});
test('UI wires original river and shoreline modules in order, never claims a finished atlas',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8');
 const js=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 const order=['river.js','shoreline.js','large-map-bake-shoreline.js',
  'large-map-bake-material-preview.js','geography-lab.js'];
 const indices=order.map(x=>html.indexOf('src="'+x));
 assert(indices.every(x=>x>0));
 assert(indices.every((x,i)=>i===0||x>indices[i-1]));
 assert.match(html,/id="materialPreviewShoreline"/);
 assert.match(js,/shorelineAdapter:window\.VedrasLargeMapBakeShoreline/);
 assert.match(js,/renderer\.renderTile\(tileId,\{withRelief,withShoreline,withRivers\}\)/);
 assert.match(js,/zurückgestellte Flussmündungen/);
 assert.match(js,/UNVOLLSTÄNDIG/);
});

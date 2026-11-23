'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Warm=require('../large-map-bake-warm-boulders.js');
const Late=require('../large-map-bake-nature-late-rock-snow.js');
const Trees=require('../large-map-bake-nature-trunks.js');
const Joint=require('../large-map-bake-joint-scenery.js');
const sandbox={window:{}};
for(const name of ['nature-balance.js','polish.js','sprite-planner.js','mountain.js'])
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),sandbox);
const W=sandbox.window,key=i=>i.q+','+i.r;
const mkWorld=()=>({
 seed:'boulder-before-canopy',version:'geography-v2.1.2',
 width:6,height:5,originQ:0,originR:0,roadEdges:[],riverPaths:[],
 cells:Array.from({length:30},(_,i)=>({q:i%6,r:Math.floor(i/6),
  terrainId:'savanna',forestClass:'light_forest'}))
});
const terrain={terrainTypes:[{id:'savanna',materialClass:'ground'}]};
const rockPath='assets/nature/boulder_36.png',treePath='assets/nature/birke1.png';
const rockMeta={id:'boulder_36',kind:'rock',family:'stones',
 sizeClass:'medium',logicalWidth:60,scaleMin:.85,scaleMax:1.15,
 placement:{edgeMargin:12,minSpacing:24,weight:1,density:.12},
 artStatus:'candidate'};
const treeMeta={id:'birke1',kind:'tree',family:'birches',
 sizeClass:'medium',logicalWidth:100,scaleMin:.85,scaleMax:1.15,
 placement:{edgeMargin:12,minSpacing:35,weight:1,density:.8},
 artStatus:'candidate'};
const nature={revision:7,entries:{
 'nature/boulder_36.png':rockMeta,'nature/birke1.png':treeMeta
}};
const assets=[rockPath,treePath].map(p=>({path:p,relPath:p.slice(7),category:'nature',mtime:1}));
const forest={DIRS:[[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]],
 maxObjects:()=>4,preferredFamily:()=>true,inGlade:()=>false};
const rules={canPlace:()=>true,effectiveTypes:()=>new Set(['savanna'])};
const existing={canAutoPlaceInTest:()=>true};
const river={blocksPoint:()=>false,valid:()=>true};
const roads={blocksPoint:()=>false};
function setup(){
 const world=mkWorld();
 const source={version:world.version,seed:world.seed,width:world.width,
  height:world.height,originQ:0,originR:0};
 const forestCells=world.cells.map(c=>({...c,forestMode:'canopy',
  source:'geography'}));
 const mountainPlan={schema:'vedras-geography-scenery-source-v1',
  stage:'original-mountain-placement-preflight',
  complete:false,readyForViewer:false,rasterized:false,
  seed:12345,natureCatalogRevision:7,
  worldSource:source,worldHexes:30,instances:[]};
 const clearings=W.VedrasNatureBalance.reserveClearings(
  world.cells,forestCells,12345,()=>true,new Set(),'canopy');
 const siteAudit={schema:'vedras-geography-nature-tree-sites-v1',
  complete:false,readyForViewer:false,rasterized:false,
  worldHexes:30,seed:12345,worldSource:source,mountainCoreHexes:0,
  reservedBuildHexes:clearings.size,physicalTreeVariants:1,
  sites:world.cells.filter(c=>!clearings.has(key(c))).map(c=>({
   q:c.q,r:c.r,forestClass:c.forestClass,targetTreeSlots:2
  }))};
 const opts={world,terrainCatalog:terrain,natureCatalog:nature,assets,
  forestCells,mountainPlan,siteAudit,seed:12345,forest,rules,
  balance:W.VedrasNatureBalance,polish:W.VedrasPolish,existing,
  rivers:river,roads,mountains:W.VedrasMountains};
 // W.VedrasMountains.occupied() works on empty source; no mountain core.
 return {opts,source};
}

const regularPath='assets/nature/boulder_01.png';
const snowPath='assets/nature/snow_patch_01.png';
const regularMeta={...rockMeta,id:'boulder_01',logicalWidth:63,
 placement:{...rockMeta.placement,density:.28}};
const snowMeta={id:'snow_patch_01',kind:'ground_cover',family:'snow',
 sizeClass:'small',logicalWidth:80,scaleMin:.85,scaleMax:1.15,
 placement:{edgeMargin:10,minSpacing:15,weight:1,density:.18},
 artStatus:'candidate'};
function fixture({withWarm=false,terrainId='snowfields'}={}){
 const {opts}=setup();
 const natureCatalog={revision:7,entries:{
  ...nature.entries,'nature/boulder_01.png':regularMeta,
  'nature/snow_patch_01.png':snowMeta
 }};
 const extra=[regularPath,snowPath].map(path=>({
  path,relPath:path.slice(7),category:'nature',mtime:1
 }));
 const nextAssets=withWarm?[...opts.assets,...extra]:
  [opts.assets.find(x=>x.path===treePath),...extra];
 const geo={...opts.world,cells:opts.world.cells.map(c=>({
  ...c,terrainId
 }))};
 const next={...opts,world:geo,natureCatalog,
  assets:nextAssets,terrainCatalog:{terrainTypes:[
   {id:'savanna',materialClass:'ground'},
   {id:'snowfields',materialClass:'ground'}
  ]}};
 const warm=Warm.create(next);
 const trees=Trees.create({...next,boulderPlan:warm});
 const late=Late.create({...next,warmPlan:warm,treePlan:trees});
 return {opts:next,warm,trees,late};
}
test('ordinary rocks and snow are placed AFTER earlier tree anchors',()=>{
 const f=fixture(),p=f.late;
 assert.equal(p.schema,'vedras-geography-late-rock-snow-v1');
 assert.equal(p.stage,'original-late-rock-and-snow-after-trees');
 assert.equal(p.earlierWarmBoulders,f.warm.instances.length);
 assert.equal(p.earlierTrees,f.trees.instances.length);
 assert.equal(p.stats.regularBoulderVariants,1);
 assert.equal(p.stats.snowOriginalVariants,1);
 assert(p.stats.placedOrdinaryBoulders>0);
 assert(p.stats.placedSnowPatches>0);
 assert.equal(p.instances.length,p.stats.placedOrdinaryBoulders+
  p.stats.placedSnowPatches);
 assert(p.instances.every(x=>x.source==='geography-original-late-rock-snow'&&
  (x.kind==='rock'?x.assetPath===regularPath:x.assetPath===snowPath)));
 assert.equal(p.complete,false);assert.equal(p.readyForViewer,false);
 assert.equal(p.rasterized,false);
 assert.equal(p.requiresShrubsAndAccents,true);
});
test('warm boulder pools prevent ordinary boulder placement, but not snowfall',()=>{
 const f=fixture({withWarm:true,terrainId:'savanna'});
 assert(f.warm.instances.length>0);
 assert.equal(f.late.stats.placedOrdinaryBoulders,0);
 assert(f.late.stats.suppressedByWarmPool>0);
 assert(f.late.instances.every(x=>x.kind==='snow'));
});
test('all late anchors observe original noncanopy distance to trees and warm rocks',()=>{
 const f=fixture(),p=f.late;
 const old=[...f.warm.instances,...f.trees.instances];
 const all=[...old,...p.instances];
 const screen=x=>({x:256*(x.q+x.r/2)+x.dx,
  y:1.5*(256/Math.sqrt(3))*x.r+x.dy});
 for(let i=old.length;i<all.length;i++){
  const a=all[i],am=f.opts.natureCatalog.entries[a.assetPath.slice(7)];
  for(let j=0;j<i;j++){
   const b=all[j],bm=f.opts.natureCatalog.entries[b.assetPath.slice(7)];
   if(Math.abs(a.q-b.q)>2||Math.abs(a.r-b.r)>2)continue;
   const ap=screen(a),bp=screen(b);
   const distance=Math.max(14,
    Math.max(am.placement.minSpacing,bm.placement.minSpacing)*.85*
    Math.sqrt(W.VedrasNatureBalance.placementScale(am)*
     W.VedrasNatureBalance.placementScale(bm)));
   assert(Math.hypot(ap.x-bp.x,ap.y-bp.y)>=distance-.03,
    'late overlap '+key(a)+' / '+key(b));
  }
 }
});
test('original source order does not change geographic late placements',()=>{
 const f=fixture();
 const again=Late.create({...f.opts,warmPlan:f.warm,treePlan:f.trees,
  assets:[...f.opts.assets].reverse(),
  forestCells:[...f.opts.forestCells].reverse()});
 assert.deepEqual(again.instances,f.late.instances);
 assert.deepEqual(again.stats,f.late.stats);
});
test('stale source, absent image and completed plans fail closed',()=>{
 const f=fixture();
 assert.throws(()=>Late.create({...f.opts,warmPlan:f.warm,
  treePlan:{...f.trees,readyForViewer:true}}),/vollständige unveränderte Quellen/);
 assert.throws(()=>Late.create({...f.opts,warmPlan:{
  ...f.warm,natureCatalogRevision:99},treePlan:f.trees}),/vollständige unveränderte Quellen/);
 assert.throws(()=>Late.create({...f.opts,warmPlan:f.warm,
  treePlan:{...f.trees,earlierWarmBoulders:123}}),/vollständige unveränderte Quellen/);
 const withoutRock=Late.create({...f.opts,
  assets:f.opts.assets.filter(a=>a.path!==regularPath),
  warmPlan:f.warm,treePlan:f.trees});
 assert.equal(withoutRock.stats.placedOrdinaryBoulders,0);
});
test('browser source and focused CI load the new Nature postpass before joint Scenery',()=>{
 const root=path.resolve(__dirname,'..');
 const html=fs.readFileSync(path.join(root,'geography-lab.html'),'utf8');
 const lab=fs.readFileSync(path.join(root,'geography-lab.js'),'utf8');
 const ci=fs.readFileSync(path.join(root,'.github/workflows/geography-large-bake-ci.yml'),'utf8');
 assert(html.includes('src="large-map-bake-nature-late-rock-snow.js'));
 assert(html.indexOf('src="large-map-bake-nature-late-rock-snow.js')<
  html.indexOf('src="large-map-bake-joint-scenery.js'));
 assert.match(lab,/VedrasLargeMapLateNature\.create/);
 assert.match(lab,/latePlan:late/);
 assert.match(lab,/drawnOrdinaryBoulders/);
 assert(ci.includes('/large-map-bake-nature-late-rock-snow.js'));
 assert(ci.includes('/tests/test_large_map_bake_nature_late_20261123.cjs'));
});

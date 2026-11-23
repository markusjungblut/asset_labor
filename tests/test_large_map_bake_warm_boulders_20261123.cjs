'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Warm=require('../large-map-bake-warm-boulders.js');
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
test('warm boulders reserve editor-priority warm originals before tree quota',()=>{
 const {opts}=setup();
 const rocks=Warm.create(opts);
 assert.equal(rocks.schema,'vedras-geography-warm-boulder-prepass-v1');
 assert.equal(rocks.stage,'original-warm-boulders-before-canopy');
 assert.equal(rocks.originalWarmVariants,1);
 assert(rocks.statistics.eligibleWarmSites>=3);
 assert.equal(rocks.statistics.guaranteedWarmPlaced,1);
 assert(rocks.instances.length>=1);
 assert.equal(rocks.instances.length,rocks.statistics.guaranteedWarmPlaced+
  rocks.statistics.ordinaryWarmPlaced);
 assert(rocks.instances.every(r=>r.assetPath===rockPath&&
  r.source==='geography-original-warm-boulder-prepass'&&
  Warm.inside(r.dx,r.dy,rockMeta.placement.edgeMargin-.02)));
 assert.equal(new Set(rocks.instances.map(key)).size,rocks.instances.length);
 assert.equal(rocks.rasterized,false);
 assert.equal(rocks.complete,false);
 assert.equal(rocks.readyForViewer,false);
 assert(rocks.requiresOtherBoulderPass);
 const tree=Trees.create({...opts,boulderPlan:rocks});
 assert.equal(tree.earlierWarmBoulders,rocks.instances.length);
 assert.equal(tree.stats.earlierWarmBoulders,rocks.instances.length);
 assert(tree.instances.length>0);
 assert.equal(tree.readyForViewer,false);
});
test('warm placements are independent of input asset and forest list order',()=>{
 const {opts}=setup();
 const first=Warm.create(opts);
 const second=Warm.create({...opts,
  assets:[...opts.assets].reverse(),
  forestCells:[...opts.forestCells].reverse()});
 assert.deepEqual(first.instances,second.instances);
 assert.deepEqual(first.statistics,second.statistics);
 const a=Trees.create({...opts,boulderPlan:first});
 const b=Trees.create({...opts,boulderPlan:second,
  assets:[...opts.assets].reverse(),
  forestCells:[...opts.forestCells].reverse(),
  siteAudit:{...opts.siteAudit,sites:[...opts.siteAudit.sites].reverse()}});
 assert.deepEqual(a.instances,b.instances);
});
test('tree trunks retain original min spacing from previously placed warm rocks',()=>{
 const {opts}=setup(),rocks=Warm.create(opts);
 const trees=Trees.create({...opts,boulderPlan:rocks});
 const px=i=>({x:256*(i.q+i.r/2)+i.dx,
  y:1.5*(256/Math.sqrt(3))*i.r+i.dy});
 const factor=Math.sqrt(W.VedrasNatureBalance.placementScale(rockMeta)*
  W.VedrasNatureBalance.placementScale(treeMeta));
 const distance=Math.max(14,Math.max(rockMeta.placement.minSpacing,
  treeMeta.placement.minSpacing)*.85*factor);
 for(const t of trees.instances)for(const r of rocks.instances){
  if(Math.abs(t.q-r.q)>2||Math.abs(t.r-r.r)>2)continue;
  const a=px(t),b=px(r);
  assert(Math.hypot(a.x-b.x,a.y-b.y)>=distance-.03,
   'tree overlaps rock base at '+key(t)+' / '+key(r));
 }
});
test('wrong rock revision, foreign asset and completed plan are rejected',()=>{
 const {opts}=setup(),rocks=Warm.create(opts);
 assert.throws(()=>Trees.create({...opts,
  boulderPlan:{...rocks,natureCatalogRevision:999}}),/Findlingsvorlauf/);
 assert.throws(()=>Trees.create({...opts,
  boulderPlan:{...rocks,readyForViewer:true}}),/Findlingsvorlauf/);
 assert.throws(()=>Trees.create({...opts,
  boulderPlan:{...rocks,instances:[{...rocks.instances[0],assetId:'fake'}]}}),
  /Findling kollidiert/);
 assert.throws(()=>Warm.create({...opts,siteAudit:{
  ...opts.siteAudit,readyForViewer:true}}),/Original-Findlingsvorlauf/);
 assert.equal(Warm.create({...opts,assets:[]}).instances.length,0);
});
test('combined renderer draws physical warm rock and keeps atlas closed',async()=>{
 const {opts,source}=setup();
 const rocks=Warm.create(opts),trees=Trees.create({...opts,boulderPlan:rocks});
 const first=rocks.instances[0],xy={
  x:256*(first.q+first.r/2),y:1.5*(256/Math.sqrt(3))*first.r
 };
 const x=Math.floor(xy.x/512)*512,y=Math.floor(xy.y/512)*512;
 const tile={x,y,id:(x/512)+','+(y/512),size:512};
 const plan={schema:'vedras-geography-bake-plan-v1',
  stage:'plan-only',rasterized:false,readyForViewer:false,
  grid:{tileSize:512},tileCount:1,tiles:[tile],
  source:{...source,cells:30,fingerprint:'warm-verified'}};
 const paint=[],loads=[];
 const renderer=Joint.create({
  world:opts.world,plan,treePlan:trees,mountainPlan:opts.mountainPlan,
  boulderPlan:rocks,terrainCatalog:terrain,natureCatalog:nature,assets,
  loadImage:async a=>{
   loads.push(a.path);
   return {img:{naturalWidth:600,naturalHeight:600,path:a.path}};
  },
  canvasFactory:()=>({getContext:()=>({
   setTransform:()=>{},translate:()=>{},transform:()=>{},
   save:()=>{},restore:()=>{},drawImage:(...args)=>paint.push(args),
   getImageData:(_x,_y,w,h)=>{
    const a=new Uint8ClampedArray(w*h*4);
    for(let i=3;i<a.length;i+=4)a[i]=255;
    return {data:a};
   }
  }),toBlob:cb=>cb(new Blob([new Uint8Array(100)],{type:'image/png'}))}),
  planner:{plan:()=>plan},
  groundRelief:{createOptions:()=>({options:{
   enabled:true,mode:'geography',pads:[]}})},
  relief:{at:()=>0,rawAt:()=>0},
  autotile:{hexAt:()=>true},
  mountains:W.VedrasMountains,
  spritePlanner:W.VedrasSpritePlanner,
  balance:W.VedrasNatureBalance,polish:W.VedrasPolish
 });
 const result=await renderer.renderTile(tile.id);
 assert(result.drawnWarmBoulders>=1);
 assert.equal(result.drawnMountains,0);
 assert.equal(result.needsPriorBoulderPass,false);
 assert.equal(result.needsOtherBoulderPass,true);
 assert.equal(result.needsShrubsAndSnow,true);
 assert.equal(result.complete,false);
 assert.equal(result.readyForViewer,false);
 assert(loads.includes(rockPath));
 assert(paint.some(a=>a.length===9&&a[0].path===rockPath));
 assert.throws(()=>Joint.create({world:opts.world,plan,
  treePlan:trees,mountainPlan:opts.mountainPlan,
  boulderPlan:{...rocks,readyForViewer:true},terrainCatalog:terrain,
  natureCatalog:nature,assets,loadImage:async()=>null,planner:{plan:()=>plan},
  groundRelief:{createOptions:()=>({options:{enabled:true,mode:'geography'}})},
  relief:{at:()=>0,rawAt:()=>0},autotile:{hexAt:()=>true},
  mountains:W.VedrasMountains,spritePlanner:W.VedrasSpritePlanner,
  balance:W.VedrasNatureBalance,polish:W.VedrasPolish
 }),/vollständige Originalpläne/);
});
test('UI connects warm-rock pass before trunks and keeps a separate legacy tree preview',()=>{
 const root=path.resolve(__dirname,'..');
 const html=fs.readFileSync(path.join(root,'geography-lab.html'),'utf8');
 const lab=fs.readFileSync(path.join(root,'geography-lab.js'),'utf8');
 const ci=fs.readFileSync(path.join(root,'.github/workflows/geography-large-bake-ci.yml'),'utf8');
 assert(html.includes('src="large-map-bake-warm-boulders.js'));
 assert(html.indexOf('src="large-map-bake-warm-boulders.js')<
  html.indexOf('src="large-map-bake-nature-trunks.js'));
 assert.match(lab,/const boulders=window\.VedrasLargeMapWarmBoulders\.create/);
 assert.match(lab,/boulderPlan:boulders/);
 assert.match(lab,/drawnWarmBoulders/);
 assert(ci.includes('/large-map-bake-warm-boulders.js'));
 assert(ci.includes('/tests/test_large_map_bake_warm_boulders_20261123.cjs'));
});

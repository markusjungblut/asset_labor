'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Accents=require('../large-map-bake-nature-accents.js');
const Warm=require('../large-map-bake-warm-boulders.js');
const Trees=require('../large-map-bake-nature-trunks.js');
const Late=require('../large-map-bake-nature-late-rock-snow.js');
const sandbox={window:{}};
for(const name of ['nature-balance.js','polish.js','mountain.js'])
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),sandbox);
const W=sandbox.window;
const key=c=>c.q+','+c.r;
function fixture(){
 const world={seed:'2.8j-nature-accents',version:'geography-v2.1.2',
  width:6,height:5,originQ:0,originR:0,roadEdges:[],riverPaths:[],
  cells:Array.from({length:30},(_,i)=>({q:i%6,r:Math.floor(i/6),
   terrainId:'savanna',forestClass:'light_forest'}))};
 const source={version:world.version,seed:world.seed,width:6,height:5,
  originQ:0,originR:0};
 const terrainCatalog={terrainTypes:[{id:'savanna',materialClass:'ground'}]};
 const spec=[
  ['birke1','tree','birches',.95,35],
  ['boulder_36','rock','stones',.3,24],
  ['boulder_01','rock','stones',.3,24],
  ['snow_patch_01','ground_cover','snow',.3,15],
  ['bush_01','shrub','temperate_bushes',.95,25],
  ['Baumstumpf_01','special','deadwood',.9,20],
  ['dead_tree_01','tree','dead_trees',.95,28],
  ['fallen_log_01','cluster','fallen_logs',.95,35]
 ];
 const natureCatalog={revision:7,entries:{}};
 const assets=spec.map(([name,kind,family,density,minSpacing])=>{
  const relPath='nature/'+name+'.png';
  natureCatalog.entries[relPath]={id:name,kind,family,sizeClass:'small',
   logicalWidth:family==='fallen_logs'?140:70,scaleMin:.85,scaleMax:1.15,
   placement:{edgeMargin:8,minSpacing,weight:1,density},artStatus:'candidate'};
  return {path:'assets/'+relPath,relPath,category:'nature'};
 });
 const forestCells=world.cells.map(c=>({...c,forestMode:'canopy',
  edgeInfluence:.2,source:'geography'}));
 const forest={DIRS:[[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]],
  maxObjects:()=>6,preferredFamily:()=>true,inGlade:()=>false};
 const rules={canPlace:()=>true,effectiveTypes:()=>new Set(['savanna'])};
 const existing={canAutoPlaceInTest:()=>true};
 const rivers={blocksPoint:()=>false,valid:()=>true};
 const roads={blocksPoint:()=>false};
 const mountainPlan={schema:'vedras-geography-scenery-source-v1',
  complete:false,rasterized:false,readyForViewer:false,worldSource:source,
  worldHexes:30,seed:12345,natureCatalogRevision:7,instances:[]};
 const clearing=W.VedrasNatureBalance.reserveClearings(world.cells,
  forestCells,12345,()=>true,new Set(),'canopy');
 const siteAudit={schema:'vedras-geography-nature-tree-sites-v1',
  complete:false,rasterized:false,readyForViewer:false,
  worldHexes:30,seed:12345,worldSource:source,
  mountainCoreHexes:0,reservedBuildHexes:clearing.size,
  physicalTreeVariants:1,
  sites:world.cells.filter(c=>!clearing.has(key(c))).map(c=>({
   q:c.q,r:c.r,forestClass:c.forestClass,targetTreeSlots:2
  }))};
 const opts={world,terrainCatalog,natureCatalog,assets,forestCells,
  mountainPlan,siteAudit,forest,rules,existing,rivers,roads,
  seed:12345,balance:W.VedrasNatureBalance,polish:W.VedrasPolish,
  mountains:W.VedrasMountains};
 const warmPlan=Warm.create(opts);
 const treePlan=Trees.create({...opts,boulderPlan:warmPlan});
 const latePlan=Late.create({...opts,warmPlan,treePlan});
 const input={...opts,warmPlan,treePlan,latePlan};
 return {input,plan:Accents.create(input)};
}
test('Phase 2.8j stays a deterministic, non-publishable preview',()=>{
 const {plan}=fixture();
 assert.equal(plan.schema,'vedras-geography-nature-accents-v1');
 assert.equal(plan.stage,'original-shrubs-deadwood-and-accents-after-snow');
 assert.equal(plan.complete,false);
 assert.equal(plan.rasterized,false);
 assert.equal(plan.readyForViewer,false);
 assert.equal(plan.requiresOriginalShadows,true);
 assert(plan.stats.physicalAccentVariants>=4);
 assert(plan.stats.placedShrubs>0);
 assert.equal(plan.instances.length,plan.stats.placedShrubs+
  plan.stats.placedDeadTrees+plan.stats.placedFallenLogs+
  plan.stats.placedDeadwood+plan.stats.placedOther);
});
test('asset and forest listing order do not affect seeded placements',()=>{
 const {input,plan}=fixture();
 const again=Accents.create({...input,assets:[...input.assets].reverse(),
  forestCells:[...input.forestCells].reverse()});
 assert.deepEqual(again.instances,plan.instances);
 assert.deepEqual(again.stats,plan.stats);
});
test('accent families observe shared world-wide original limits',()=>{
 const {input,plan}=fixture();
 const limits=W.VedrasNatureBalance.accentLimits(30);
 assert.equal(plan.stats.accentLimits.dead_trees,limits.dead_trees);
 assert.equal(plan.stats.accentLimits.fallen_logs,limits.fallen_logs);
 assert(plan.stats.placedDeadTrees<=limits.dead_trees);
 assert(plan.stats.placedFallenLogs<=limits.fallen_logs);
 const groups=new Map();
 for(const n of plan.instances){
  const m=input.natureCatalog.entries[n.assetPath.slice(7)];
  const g=W.VedrasNatureBalance.accentGroup(m);
  if(!g)continue;
  const k=key(n);assert(!groups.has(k));
  groups.set(k,g);
 }
});
test('new anchors respect earlier boulder, tree, rock and snow spacing',()=>{
 const {input,plan}=fixture();
 const old=[...input.warmPlan.instances,...input.treePlan.instances,
  ...input.latePlan.instances];
 const all=[...old,...plan.instances];
 const position=n=>({x:256*(n.q+n.r/2)+n.dx,
  y:1.5*(256/Math.sqrt(3))*n.r+n.dy});
 for(let i=old.length;i<all.length;i++){
  const a=all[i],am=input.natureCatalog.entries[a.assetPath.slice(7)];
  for(let j=0;j<i;j++){
   const b=all[j],bm=input.natureCatalog.entries[b.assetPath.slice(7)];
   if(Math.abs(a.q-b.q)>2||Math.abs(a.r-b.r)>2)continue;
   const p=position(a),q=position(b);
   const min=Math.max(14,Math.max(am.placement.minSpacing,
    bm.placement.minSpacing)*.85*Math.sqrt(
    W.VedrasNatureBalance.placementScale(am)*
    W.VedrasNatureBalance.placementScale(bm)));
   assert(Math.hypot(p.x-q.x,p.y-q.y)>=min-.03,'overlap '+key(a)+' '+key(b));
  }
 }
});
test('stale plans and altered source revisions are rejected',()=>{
 const {input}=fixture();
 assert.throws(()=>Accents.create({...input,latePlan:{
  ...input.latePlan,readyForViewer:true}}),/vollständige unveränderte Quellen/);
 assert.throws(()=>Accents.create({...input,latePlan:{
  ...input.latePlan,earlierTrees:777}}),/vollständige unveränderte Quellen/);
 assert.throws(()=>Accents.create({...input,natureCatalog:{
  ...input.natureCatalog,revision:8}}),/vollständige unveränderte Quellen/);
 assert.throws(()=>Accents.create({...input,world:{
  ...input.world,seed:'different'}}),/vollständige unveränderte Quellen/);
});
test('browser loads accents before joint renderer; focused CI contains test',()=>{
 const root=path.resolve(__dirname,'..');
 const html=fs.readFileSync(path.join(root,'geography-lab.html'),'utf8');
 const lab=fs.readFileSync(path.join(root,'geography-lab.js'),'utf8');
 const ci=fs.readFileSync(path.join(root,'.github/workflows/geography-large-bake-ci.yml'),'utf8');
 assert(html.includes('src="large-map-bake-nature-accents.js'));
 assert(html.indexOf('src="large-map-bake-nature-accents.js')<
  html.indexOf('src="large-map-bake-joint-scenery.js'));
 assert.match(lab,/VedrasLargeMapNatureAccents\.create/);
 assert.match(lab,/accentPlan:accents/);
 assert.match(lab,/drawnAccents/);
 assert(ci.includes('/large-map-bake-nature-accents.js'));
 assert(ci.includes('/tests/test_large_map_bake_nature_accents_20261123.cjs'));
});

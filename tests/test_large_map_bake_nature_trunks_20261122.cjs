'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const G=require('../worldgen-geography.js');
const Mix=require('../geography-lab-presets.js');
const Mountain=require('../large-map-bake-scenery-source.js');
const Audit=require('../large-map-bake-nature-source.js');
const Trunks=require('../large-map-bake-nature-trunks.js');
const ForestFloor=require('../large-map-bake-forest-floor.js');
const sandbox={window:{}};
for(const name of ['mountain.js','nature_catalog.js','forest.js',
 'forest-ground.js','nature-balance.js','existing-asset-rules.js',
 'polish.js','river.js','roads.js'])
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),sandbox);
const W=sandbox.window;
const terrain=JSON.parse(fs.readFileSync(path.join(__dirname,
 '../assets/terrain/terrain_catalog.json'),'utf8'));
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,
 '../assets/nature/nature_catalog.json'),'utf8'));
const assets=Object.keys(catalog.entries).map(relPath=>({
 path:'assets/'+relPath,relPath,category:'nature',mtime:1
}));
const key=o=>o.q+','+o.r;
function setup(geo,assetList=assets){
 const mountains=Mountain.create({world:geo,terrainCatalog:terrain,
  natureCatalog:catalog,assets:assetList,mountains:W.VedrasMountains,
  rules:W.VedrasNatureCatalog,seed:12345});
 const forestCells=ForestFloor.create({world:geo,catalog:terrain,
  groups:{byType:new Map()},loadImage:async()=>null,
  forest:W.VedrasForest,floor:W.VedrasForestGround}).forestCells;
 const opts={world:geo,terrainCatalog:terrain,natureCatalog:catalog,
  assets:assetList,forestCells,mountainPlan:mountains,seed:12345,
  rules:W.VedrasNatureCatalog,forest:W.VedrasForest,
  balance:W.VedrasNatureBalance,mountains:W.VedrasMountains,
  existing:W.VedrasExistingAssets,polish:W.VedrasPolish};
 const siteAudit=Audit.create(opts);
 return {opts:{...opts,siteAudit,rivers:W.VedrasRivers,roads:W.VedrasRoads},
  siteAudit};
}
function makeWorld(width=25,height=22){
 return G.generateWorld('trunk-test-'+width+'-'+height,{width,height});
}
test('7,125 original-asset tree trunks are positioned without releasing an atlas',()=>{
 const geo=G.generateWorld(Mix.PRESET.seed,{width:95,height:75,
  config:Mix.configFor(G)});
 const {opts,siteAudit}=setup(geo),p=Trunks.create(opts);
 assert.equal(p.worldHexes,7125);
 assert.equal(p.schema,'vedras-geography-tree-trunk-plan-v1');
 assert(p.stats.placedTrees>0);
 assert.equal(p.stats.placedTrees,p.instances.length);
 assert(p.originalTreeVariants>0);
 assert(p.stats.targetTreeSlots<=siteAudit.treeQuota);
 assert.equal(p.mountainCoreHexes,siteAudit.mountainCoreHexes);
 assert.equal(p.reservedBuildHexes,siteAudit.reservedBuildHexes);
 assert.equal(p.riverRoutes,geo.riverPaths.length);
 assert(p.instances.every(i=>{
  const m=catalog.entries[i.assetPath.slice(7)];
  return W.VedrasNatureBalance.isCanopy(m)&&
   Number.isFinite(i.dx)&&Number.isFinite(i.dy)&&
   Trunks.inside(i.dx,i.dy,m.placement.edgeMargin+.02);
 }));
 const cores=new Set(opts.mountainPlan.instances.flatMap(m=>
  W.VedrasMountains.occupied(m)));
 assert(p.instances.every(i=>!cores.has(key(i))));
 assert(!p.rasterized&&!p.complete&&!p.readyForViewer);
 assert(p.requiresOriginalPngDecoding&&p.requiresTreeShadows&&
  p.requiresNatureShrubs&&p.requiresPixelCrownCoverage&&
  p.requiresEditorFullPopulationParity);
});
test('source listing and audited site ordering do not change coordinates',()=>{
 const geo=makeWorld(24,21),{opts}=setup(geo);
 const a=Trunks.create(opts);
 const b=Trunks.create({...opts,assets:[...assets].reverse(),
  forestCells:[...opts.forestCells].reverse(),
  siteAudit:{...opts.siteAudit,sites:[...opts.siteAudit.sites].reverse()}});
 assert.deepEqual(a.instances,b.instances);
 assert.deepEqual(a.stats,b.stats);
 assert.deepEqual(a.worldSource,b.worldSource);
});
test('tree-to-tree spatial spacing follows original canopy sizing',()=>{
 const geo=makeWorld(25,24),{opts}=setup(geo),p=Trunks.create(opts);
 const woods=new Map(opts.forestCells.map(c=>[key(c),c]));
 const source=opts.natureCatalog.entries;
 for(let i=0;i<p.instances.length;i++){
  const a=p.instances[i],m=source[a.assetPath.slice(7)];
  const f=woods.get(key(a));
  const mode=f.forestMode||'canopy';
  const factor=mode==='canopy'?
   (f.forestClass==='dense_forest'?.34:f.forestClass==='light_forest'?.59:.88):
   mode==='dense'?
   (f.forestClass==='dense_forest'?.52:f.forestClass==='light_forest'?.73:1):
   (f.forestClass==='dense_forest'?.72:f.forestClass==='light_forest'?.92:1);
  const px=256*(a.q+a.r/2)+a.dx,py=1.5*(256/Math.sqrt(3))*a.r+a.dy;
  for(let j=0;j<i;j++){
   const b=p.instances[j];
   if(Math.abs(a.q-b.q)>2||Math.abs(a.r-b.r)>2)continue;
   const n=source[b.assetPath.slice(7)],qx=256*(b.q+b.r/2)+b.dx,
    qy=1.5*(256/Math.sqrt(3))*b.r+b.dy;
   const spacing=Math.max(factor<.6?10:14,
    Math.max(m.placement.minSpacing,n.placement.minSpacing)*factor*
    Math.sqrt(W.VedrasNatureBalance.placementScale(m)*
     W.VedrasNatureBalance.placementScale(n)));
   assert(Math.hypot(px-qx,py-qy)>=spacing-.025,
    'stems conflict at '+key(a)+' and '+key(b));
  }
 }
});
test('road and river exclusion gates reject trunks; bad inputs fail closed',()=>{
 const geo=makeWorld(25,22),{opts}=setup(geo),regular=Trunks.create(opts);
 assert(regular.instances.length>0);
 let roadCalls=0;
 const blocked=Trunks.create({...opts,roadEdges:[{a:[0,0],b:[1,0]}],
  roads:{blocksPoint(){roadCalls++;return true;}}});
 assert(roadCalls>0);
 assert.equal(blocked.instances.length,0);
 assert(blocked.stats.rejectedRoad>0);
 if(geo.riverPaths.length){
  let riverCalls=0;
  const stopped=Trunks.create({...opts,rivers:{
   valid:W.VedrasRivers.valid,
   blocksPoint(){riverCalls++;return true;}
  }});
  assert(riverCalls>0);
  assert.equal(stopped.instances.length,0);
  assert(stopped.stats.rejectedRiver>0);
 }
 assert.throws(()=>Trunks.create({...opts,siteAudit:{...opts.siteAudit,
  readyForViewer:true}}),/fehlen/);
 assert.throws(()=>Trunks.create({...opts,world:{...geo,
  riverPaths:[[[999,999],[1000,1000]]]}}),/Flussroute/);
});
test('geography lab is explicit opt-in and loads real road/river source',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8');
 const ui=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 for(const needle of ['src="river.js','src="roads.js',
  'src="large-map-bake-nature-trunks.js','id="planNatureTrunks"',
  'id="natureTrunkReport"'])assert(html.includes(needle),needle);
 assert(html.indexOf('src="roads.js')<
  html.indexOf('src="large-map-bake-nature-trunks.js'));
 assert(html.indexOf('src="large-map-bake-nature-trunks.js')<
  html.indexOf('src="geography-lab.js'));
 assert.match(ui,/VedrasLargeMapNatureTrunks/);
 assert.match(ui,/ORIGINAL-BAUMSTÄMME/);
 assert.match(ui,/KEIN fertiger Kartenatlas/);
});

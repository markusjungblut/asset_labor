'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const G=require('../worldgen-geography.js');
const Mix=require('../geography-lab-presets.js');
const Mountain=require('../large-map-bake-scenery-source.js');
const Nature=require('../large-map-bake-nature-source.js');
const ForestFloor=require('../large-map-bake-forest-floor.js');
const sandbox={window:{}};
for(const name of ['mountain.js','nature_catalog.js','forest.js',
 'forest-ground.js','nature-balance.js','existing-asset-rules.js','polish.js'])
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),sandbox);
const w=sandbox.window;
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,
 '../assets/terrain/terrain_catalog.json'),'utf8'));
const nature=JSON.parse(fs.readFileSync(path.join(__dirname,
 '../assets/nature/nature_catalog.json'),'utf8'));
const assets=Object.keys(nature.entries).map(relPath=>({
 path:'assets/'+relPath,relPath,category:'nature',mtime:1
}));
function build(geo,list=assets){
 const mountainPlan=Mountain.create({world:geo,terrainCatalog:catalog,
  natureCatalog:nature,assets:list,mountains:w.VedrasMountains,
  rules:w.VedrasNatureCatalog,seed:12345});
 const forestCells=ForestFloor.create({world:geo,catalog,
  groups:{byType:new Map()},loadImage:async()=>null,
  forest:w.VedrasForest,floor:w.VedrasForestGround}).forestCells;
 const options={world:geo,terrainCatalog:catalog,natureCatalog:nature,
  assets:list,forestCells,mountainPlan,rules:w.VedrasNatureCatalog,
  forest:w.VedrasForest,balance:w.VedrasNatureBalance,
  mountains:w.VedrasMountains,existing:w.VedrasExistingAssets,
  polish:w.VedrasPolish};
 return {audit:Nature.create(options),options};
}
test('95x75 tree habitat/site audit respects real original PNG catalog',()=>{
 const geo=G.generateWorld(Mix.PRESET.seed,{width:95,height:75,
  config:Mix.configFor(G)});
 const p=build(geo).audit;
 assert.equal(p.schema,'vedras-geography-nature-tree-sites-v1');
 assert.equal(p.worldHexes,7125);
 assert(p.physicalTreeVariants>0&&p.candidateHexes>0);
 assert(p.mountainCoreHexes>0&&p.reservedBuildHexes>0);
 assert(p.treeQuota>0&&p.sites.length<=p.landHexes);
 assert(p.sites.every(s=>s.eligibleVariants>0||s.targetTreeSlots>0));
 assert(p.sites.every(s=>!s.firstAssetPath||
  nature.entries[s.firstAssetPath.slice(7)]?.kind==='tree'));
 assert.equal(p.rasterized,false);
 assert.equal(p.complete,false);
 assert.equal(p.readyForViewer,false);
 assert(p.requiresTrunkPlacement&&p.requiresNatureShrubs&&p.requiresShadows);
});
test('original Nature variants are order-independent and missing files are not simulated',()=>{
 const geo=G.generateWorld('tree-test',{width:25,height:22});
 const a=build(geo).audit,b=build(geo,[...assets].reverse()).audit;
 assert.deepEqual(a.sites,b.sites);
 assert.equal(a.physicalTreeVariants,b.physicalTreeVariants);
 const none=build(geo,assets.filter(x=>nature.entries[x.relPath]?.kind==='mountain')).audit;
 assert.equal(none.physicalTreeVariants,0);
 assert.equal(none.candidateHexes,0);
 assert.equal(none.rasterized,false);
});
test('invalid forest or falsely completed mountain plan rejected',()=>{
 const geo=G.generateWorld('tree-invalid',{width:18,height:16});
 const {options}=build(geo);
 assert.throws(()=>Nature.create({...options,forestCells:options.forestCells.slice(1)}),/fehlen/);
 assert.throws(()=>Nature.create({...options,mountainPlan:{...options.mountainPlan,complete:true}}),/fehlen/);
});
test('opt-in Nature audit UI stays read-only and is loaded after original rules',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8');
 const js=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 const scripts=['nature_catalog.js','nature-balance.js',
  'existing-asset-rules.js','polish.js',
  'large-map-bake-nature-source.js','geography-lab.js'];
 const idx=scripts.map(f=>html.indexOf('src="'+f));
 assert(idx.every(x=>x>0)&&idx.every((x,i)=>i===0||x>idx[i-1]));
 assert(html.includes('id="auditNatureTreeSites"'));
 assert(html.includes('id="natureTreeReport"'));
 assert.match(js,/NATURE\.create/);
 assert.match(js,/requiresTrunkPlacement/);
 assert.match(js,/KEINE fertigen/);
});

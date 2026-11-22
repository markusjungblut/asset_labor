'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Geo=require('../worldgen-geography.js');
const Plan=require('../large-map-bake-plan.js');
const Joint=require('../large-map-bake-joint-scenery.js');
const sandbox={window:{}};
for(const f of ['sprite-planner.js','nature-balance.js','polish.js','mountain.js'])
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),sandbox);
const W=sandbox.window;
const nature=JSON.parse(fs.readFileSync(
 path.join(__dirname,'../assets/nature/nature_catalog.json'),'utf8'));
const terrain=JSON.parse(fs.readFileSync(
 path.join(__dirname,'../assets/terrain/terrain_catalog.json'),'utf8'));
const treePath='assets/nature/birke1.png',mountPath='assets/nature/berg_01.png';
const treeMeta=nature.entries[treePath.slice(7)];
const mountMeta=nature.entries[mountPath.slice(7)];
const world=Geo.generateWorld('joint-original-png-preview',{width:10,height:10});
const plan=Plan.plan(world);
const source={version:world.version,seed:world.seed,width:world.width,
 height:world.height,originQ:world.originQ,originR:world.originR};
const trees={schema:'vedras-geography-tree-trunk-plan-v1',
 complete:false,readyForViewer:false,rasterized:false,
 worldSource:source,worldHexes:world.cells.length,
 seed:12345,natureCatalogRevision:nature.revision??null,
 requiresTreeShadows:true,instances:[{assetPath:treePath,
 assetId:treeMeta.id,q:3,r:2,dx:-120,dy:60,scale:1,
 source:'geography-original-tree-trunk-preview'}]};
const mountains={schema:'vedras-geography-scenery-source-v1',
 complete:false,readyForViewer:false,rasterized:false,
 worldSource:source,worldHexes:world.cells.length,
 seed:12345,natureCatalogRevision:nature.revision??null,
 instances:[{assetPath:mountPath,assetId:mountMeta.id,q:2,r:2,
 width:mountMeta.logicalWidth,radius:1,coreRadius:0,mode:'chain',
 chainId:'geography_0',source:'geography-scenery-preview'}]};
const assets=[treePath,mountPath].map(p=>({path:p,category:'nature',
 relPath:p.slice(7)}));
const planet=plan.tiles.find(t=>t.x===512&&t.y===0)||plan.tiles[0];
function mocked(extra={}){
 const paints=[],loads=[],perspectives=[],heights=[],pads=[],originals=new Map();
 const makeCanvas=()=>{
  const c={
   drawImage:(...args)=>paints.push(args),
   setTransform:(...args)=>perspectives.push(args),
   translate:()=>{},transform:()=>{},save:()=>{},restore:()=>{},
   getImageData:(x,y,w,h)=>{
    const a=new Uint8ClampedArray(w*h*4);
    for(let i=3;i<a.length;i+=4)a[i]=255;
    return {data:a};
   }
  };
  return {getContext:()=>c,toBlob:callback=>
   callback(new Blob([new Uint8Array(600)],{type:'image/png'}))};
 };
 const loader=async a=>{
  loads.push(a.path);
  if(!originals.has(a.path))
   originals.set(a.path,{naturalWidth:600,naturalHeight:800,
    name:a.path});
  return {img:originals.get(a.path)};
 };
 const relief={
  at:(x,y,opts)=>{heights.push({x,y,pads:opts.pads});
   return x===768?14:0;},
  rawAt:(x,y)=>{pads.push({x,y});return 36;}
 };
 const groundRelief={createOptions:()=>({options:{
  enabled:true,mode:'geography',pads:[]}})};
 const args={world,plan,treePlan:trees,mountainPlan:mountains,
  terrainCatalog:terrain,natureCatalog:nature,assets,
  loadImage:loader,canvasFactory:makeCanvas,planner:Plan,
  groundRelief,relief,autotile:{hexAt:()=>''},
  mountains:W.VedrasMountains,
  spritePlanner:W.VedrasSpritePlanner,
  balance:W.VedrasNatureBalance,polish:W.VedrasPolish,
  ...extra};
 return {renderer:Joint.create(args),paints,loads,perspectives,heights,pads};
}
test('original mountains and trees are drawn in ONE 2.5x transparent world tile',async()=>{
 const x=mocked(),id=x.renderer.defaultTile();
 assert(plan.tiles.some(t=>t.id===id));
 const a=await x.renderer.renderTile(planet.id);
 assert.equal(a.schema,'vedras-geography-joint-scenery-preview-v1');
 assert.equal(a.stage,'original-tree-mountain-combined-preview');
 assert.equal(a.width,1920);
 assert.equal(a.height,1632);
 assert.equal(a.drawnTrees,1);
 assert.equal(a.drawnMountains,1);
 assert.equal(a.originalPngs,2);
 assert.equal(a.reliefMode,'geography');
 assert.equal(a.mountainFlattenPads,1);
 assert.equal(a.occludedTreeMountainPairs,1);
 assert.equal(a.testedTreeMountainOcclusions,1);
 assert.equal(a.transparent,true);
 assert.equal(a.rasterized,true);
 assert.equal(a.readyForViewer,false);
 assert.equal(a.complete,false);
 assert(a.needsGroundAndSpriteShadows);
 assert(a.needsFullEditorImageParity);
 assert(a.needsFullNaturePopulation);
 assert.equal(x.loads.length,2);
 const rendered=x.paints.filter(p=>p.length===9&&
  !(p[7]===64&&p[8]===64));
 assert.equal(rendered.length,2);
 // The editor renders an occluded tree before its mountain, not deleted.
 assert.equal(rendered[0][0].name,treePath);
 assert.equal(rendered[1][0].name,mountPath);
 assert.deepEqual(x.perspectives[0],[1,0,0,1,0,0]);
 assert.equal(x.perspectives.filter(t=>t[0]===2.5&&t[3]===2.125).length,2);
 assert(x.heights.some(o=>o.pads.length===1));
});
test('adjacent tiles use EXACT same world-space 2.5x sample lattice',async()=>{
 const x=mocked();
 const a=plan.tiles.find(t=>t.x===512&&t.y===0);
 const b=plan.tiles.find(t=>t.x===1024&&t.y===0);
 assert(a&&b);
 const left=await x.renderer.renderTile(a.id);
 const right=await x.renderer.renderTile(b.id);
 assert.equal(left.drawnTrees,1);
 assert.equal(right.drawnTrees,1);
 assert.equal(left.drawnMountains,1);
 assert.equal(right.drawnMountains,1);
 assert.equal(left.occludedTreeMountainPairs,right.occludedTreeMountainPairs);
 const tx=x.perspectives;
 assert.equal(tx.length,6);
 assert.deepEqual(tx[0],[1,0,0,1,0,0]);
 assert.deepEqual(tx[3],[1,0,0,1,0,0]);
 assert.deepEqual(tx.slice(1,3),tx.slice(4,6),
  'Sprite source pixels must keep an identical GLOBAL pixel origin');
});
test('world mismatch, completed source and invalid original asset fail closed',()=>{
 assert.throws(()=>mocked({world:{...world,seed:'different'}}),
  /verschiedene Revisionen/);
 assert.throws(()=>mocked({treePlan:{...trees,readyForViewer:true}}),
  /vollständige Originalpläne/);
 assert.throws(()=>mocked({mountainPlan:{...mountains,complete:true}}),
  /vollständige Originalpläne/);
 assert.throws(()=>mocked({assets:[assets[0]]}),/physische Originalgrafik/);
 assert.throws(()=>mocked({treePlan:{...trees,instances:[
  {...trees.instances[0],assetId:'made_up'}]}}),/Original-Naturekatalog/);
});
test('missing or fully transparent original pixels reject before fake placeholders',async()=>{
 const x=mocked({loadImage:async()=>{throw Error('broken original PNG');}});
 await assert.rejects(x.renderer.renderTile(planet.id),/broken original PNG/);
 const empty=mocked({canvasFactory:()=>{
  const ctx={drawImage:()=>{},getImageData:(_x,_y,w,h)=>({
   data:new Uint8ClampedArray(w*h*4)})};
  return {getContext:()=>ctx};
 }});
 await assert.rejects(empty.renderer.renderTile(planet.id),/vollständig transparent/);
 await assert.rejects(mocked().renderer.renderTile('9999,9999'),/Unbekanntes/);
});
test('original joint preview is explicitly opt-in and never an atlas receipt',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8');
 const lab=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 const ci=fs.readFileSync(path.join(__dirname,'../.github/workflows/geography-large-bake-ci.yml'),'utf8');
 for(const s of ['src="large-map-bake-joint-scenery.js',
  'id="previewJointScenery"','id="jointSceneryReport"'])assert(html.includes(s),s);
 assert(html.indexOf('src="large-map-bake-joint-scenery.js')<
  html.indexOf('src="geography-lab.js'));
 assert.match(lab,/JOINT\.create/);
 assert.match(lab,/original-tree-mountain-combined-preview/);
 assert.match(lab,/KEIN fertiger Kartenatlas/);
 assert(ci.includes('/large-map-bake-joint-scenery.js'));
 assert(ci.includes('/tests/test_large_map_bake_joint_scenery_20261123.cjs'));
});

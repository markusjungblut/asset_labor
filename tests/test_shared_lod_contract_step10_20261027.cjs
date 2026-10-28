'use strict';
// Roadmap Step 10 – shared world/region/local LOD contract, no Step 11 DPR changes.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function harness({shared=true,adaptive=true,source=null}={}){
 const win={};if(adaptive)vm.runInNewContext(read('adaptive-lod.js'),{window:win});
 const canvas={width:0,height:0,getContext:()=>({
  save(){},restore(){},setTransform(){},clearRect(){},beginPath(){},
  closePath(){},clip(){},moveTo(){},lineTo(){},fill(){},fillRect(){},
  drawImage(){},imageSmoothingEnabled:true
 })};
 vm.runInNewContext(read('world-tile-streamer.js'),{
  window:win,performance:{now:()=>1000}
 });
 const controller=adaptive?win.VedrasAdaptiveLOD.create():null;
 const createOptions={canvas,source};
 if(shared&&controller)createOptions.lodSelector=z=>controller.update(z).id;
 const renderer=win.VedrasWorldTiles.create(createOptions);
 const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 const view=(zoom,panX=0)=>({zoom,width:1000,height:650,
  panX,panY:0,projectY:.85,dpr:1});
 const packet=(tag='tile')=>({complete:true,layers:[
  {layer:'ground',image:{width:32,height:32,tag:tag+'-ground'}},
  {layer:'scenery',image:{width:32,height:32,tag:tag+'-scenery'}}
 ]});
 return {win,controller,renderer,tile,view,packet};
}
test('three world/region/local scopes retain the original raster density budgets',()=>{
 const {win}=harness(),a=win.VedrasAdaptiveLOD;
 assert.equal(a.tiers.far.scope,'world');
 assert.equal(a.tiers.mid.scope,'region');
 assert.equal(a.tiers.near.scope,'local');
 assert.equal(a.tiers.full.scope,'local');
 assert.equal(a.worldDensity.far,.85);
 assert.equal(a.worldDensity.mid,1.5);
 assert.equal(a.worldDensity.near,2.5);
 assert.equal(a.tiers.far.terrain,.60);
 assert.equal(a.tiers.mid.shore,.90);
 assert.equal(a.tiers.near.road,1);
});
test('canonical hysteresis is stable at world/region threshold until crossing',()=>{
 const h=harness(),lod=h.controller;
 assert.equal(lod.update(.50).id,'far');
 assert.equal(lod.update(.52).id,'far');
 assert.equal(lod.update(.549).id,'far');
 assert.equal(lod.update(.55).id,'mid');
 assert.equal(lod.update(.51).id,'mid');
 assert.equal(lod.update(.471).id,'mid');
 assert.equal(lod.update(.47).id,'far');
 assert.equal(lod.stats().changes,3);
});
test('canonical hysteresis is stable at region/local threshold and skips tiers',()=>{
 const h=harness(),lod=h.controller;
 assert.equal(lod.update(.80).id,'mid');
 assert.equal(lod.update(1.05).id,'mid');
 assert.equal(lod.update(1.06).id,'near');
 assert.equal(lod.update(.94).id,'near');
 assert.equal(lod.update(.921).id,'near');
 assert.equal(lod.update(.92).id,'mid');
 assert.equal(lod.update(.47).id,'far');
 assert.equal(lod.update(1.5).id,'near');
});
test('World-Tile and terrain use exactly the same tier on zoom and pan',()=>{
 const h=harness();
 for(const z of [.50,.52,.55,.62,.96,1.07,1.01,.94,.91,.62,.48,.46]){
  const world=h.renderer.chooseLod(z);
  assert.equal(world,h.controller.stats().tier);
  assert.equal(h.renderer.chooseLod(z),world,
   'repeated same zoom must not toggle tier');
 }
 assert.equal(h.renderer.chooseLod(.65),'mid');
 const before=h.controller.stats().changes;
 h.renderer.request(h.view(.65,-180),[h.tile]);
 h.renderer.request(h.view(.65,-300),[h.tile]);
 assert.equal(h.controller.stats().changes,before);
});
test('standalone renderer with adaptive module uses canonical thresholds',()=>{
 const h=harness({shared:false});
 assert.equal(h.renderer.chooseLod(.50),'far');
 assert.equal(h.renderer.chooseLod(.54),'far');
 assert.equal(h.renderer.chooseLod(.55),'mid');
 assert.equal(h.renderer.chooseLod(1.06),'near');
 assert.equal(h.renderer.chooseLod(.93),'near');
 assert.equal(h.renderer.chooseLod(.92),'mid');
});
test('legacy standalone renderer without adaptive module matches cutoffs',()=>{
 const h=harness({shared:false,adaptive:false});
 assert.equal(h.renderer.chooseLod(.50),'far');
 assert.equal(h.renderer.chooseLod(.53),'far');
 assert.equal(h.renderer.chooseLod(.55),'mid');
 assert.equal(h.renderer.chooseLod(1.06),'near');
 assert.equal(h.renderer.chooseLod(.92),'mid');
 assert.equal(h.renderer.chooseLod(.47),'far');
});
test('disabling adaptive terrain detail selects full profile and near world raster',()=>{
 const h=harness(),ctrl=h.win.VedrasAdaptiveLOD.create();
 const r=h.win.VedrasWorldTiles.create({
  canvas:{getContext:()=>({})},source:null,
  lodSelector:z=>ctrl.update(z,{enabled:false}).id
 });
 assert.equal(ctrl.update(.3,{enabled:false}).id,'full');
 assert.equal(r.chooseLod(.3),'near');
 assert.equal(ctrl.stats().tier,null);
});
test('final export returns full detail without changing interactive hysteresis',()=>{
 const h=harness(),ctrl=h.win.VedrasAdaptiveLOD.create();
 assert.equal(ctrl.update(.49).id,'far');
 assert.equal(ctrl.update(1.6,{final:true}).id,'full');
 assert.equal(ctrl.stats().tier,'far');
 assert.equal(ctrl.update(.52).id,'far');
});
test('camera-only pan reuses prepared tile and has no unnecessary source build',()=>{
 let builds=0;const h=harness({source:()=>{builds++;return h.packet();}});
 h.renderer.seed(h.tile,'mid',h.packet('prepared'));
 h.renderer.request(h.view(.65,0),[h.tile]);
 h.renderer.request(h.view(.65,-200),[h.tile]);
 h.renderer.request(h.view(.65,-320),[h.tile]);
 assert.equal(builds,0);
 assert.equal(h.renderer.stats().lod,'mid');
 assert.equal(h.renderer.stats().scope,'region');
 assert.equal(h.renderer.stats().lodDensity,1.5);
});
test('same complete old LOD stays available while target tier changes',()=>{
 const h=harness();
 h.renderer.seed(h.tile,'far',h.packet('far'));
 h.renderer.request(h.view(.65),[h.tile]);
 assert.equal(h.renderer.diagnostics().tiles[0].displayedLod,'far');
 h.renderer.seed(h.tile,'mid',h.packet('mid'));
 assert.equal(h.renderer.diagnostics().tiles[0].displayedLod,'mid');
});
test('editor uses a single shared controller and exposes coherent LOD stats',()=>{
 const app=read('app.js'),html=read('index.html');
 assert.equal((app.match(/const adaptiveLOD=window\.VedrasAdaptiveLOD\.create\(\)/g)||[]).length,1);
 assert.match(app,/lodSelector:zoom=>updateTerrainLod\(zoom\)/);
 assert.match(app,/currentLodProfile=adaptiveLOD\.update\(zoom/);
 assert.match(app,/worldTileDensity:worldTiles\?\.stats\(\)\.lodDensity/);
 assert.match(html,/adaptive-lod\.js\?v=0\.1\.1&amp;step12=20261028/);
 assert.match(html,/world-tile-streamer\.js\?v=0\.22\.6&amp;step12=20261028/);
 assert.match(html,/app\.js\?v=0\.55\.6&amp;step11=20261028/);
});
test('raster bounds and final-export DPR safeguards remain unchanged',()=>{
 const app=read('app.js');
 assert.match(app,/window\.VedrasRenderQuality\.resolve\(/);
 assert.match(read('render-quality-policy.js'),/budgetDpr/);
 assert.match(read('render-quality-policy.js'),/dense:/);
 assert.match(app,/return finalRendering\?1\.5:state\.quality==='fast'\?\.60/);
 assert.match(read('adaptive-lod.js'),/if\(final\)return TIERS\.full/);
});

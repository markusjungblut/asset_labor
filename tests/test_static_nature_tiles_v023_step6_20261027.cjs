'use strict';
// Step 6: static Nature / ground-shadow tiles versus moving units.
// Run: node --test tests/test_static_nature_tiles_v023_step6_20261027.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const source=read('app.js');

function objectPassFixture(){
 const start=source.indexOf('function drawMapObjects(');
 const stop=source.indexOf('function visibleDynamicUnits()',start);
 assert.ok(start>=0&&stop>start,'source contains object passes');
 const calls=[];
 const objs=[
  {type:'nature',x:10,y:20,groundY:20,w:16,
   natureMeta:{kind:'tree'},asset:{img:{naturalWidth:8}}},
  {type:'unit',x:30,y:40,groundY:40,w:18,
   asset:{img:{naturalWidth:8}}}
 ];
 let now=0;
 const sandbox={
  state:{objects:true,mode:'normal',zoom:1,mountainShadowDebug:false,
   shadowHandles:false},W:800,H:600,ctx:{},
  window:{VedrasSpriteShadows:{drawCached:()=>calls.push('unit-shadow')}},
  performance:{now:()=>++now},
  fromScreen:(x,y)=>({x,y}),toScreen:(x,y)=>({x,y}),
  sceneShadowStrength:()=>1,
  objectLayoutCache:{query:()=>({objects:objs,buildMs:0,rebuilt:false,
   total:2,candidates:2,buckets:2,hits:0,builds:1})},
  drawMountainShadows:()=>{},
  drawNatureGrounding:()=>calls.push('nature-shadow'),
  drawSprite:o=>calls.push(o.type+'-sprite'),
  shadowSilhouette:()=>({}),pairedShadow:()=>null,
  spriteIndexMargin:()=>0,buildSpriteLayout:()=>[],
  spriteInViewport:()=>true,mountainCoversBase:()=>false,
  finalRendering:false
 };
 vm.runInNewContext(source.slice(start,stop),sandbox);
 return {draw:sandbox.drawMapObjects,calls,window:sandbox.window};
}
test('app source remains valid JavaScript',()=>{
 assert.doesNotThrow(()=>new vm.Script(source));
});
test('static Nature and ground shadow bake excludes units',()=>{
 const s=objectPassFixture();
 s.draw({includeUnits:false});
 assert.deepEqual(s.calls,['nature-shadow','nature-sprite']);
 assert.equal(s.window.__vedrasObjectProfile.drawnSprites,1);
 assert.equal(s.window.__vedrasObjectProfile.shadowCandidates,1);
 assert.equal(s.window.__vedrasObjectProfile.staticSprites,1);
 assert.equal(s.window.__vedrasObjectProfile.staticShadows,1);
 assert.equal(s.window.__vedrasObjectProfile.dynamicSprites,0);
});
test('moving unit pass draws no static tree or tree shadow',()=>{
 const s=objectPassFixture();
 s.draw({includeUnits:false});
 s.calls.length=0;
 s.draw({onlyUnits:true});
 assert.deepEqual(s.calls,['unit-shadow','unit-sprite']);
 assert.equal(s.window.__vedrasDynamicObjectProfile.drawnSprites,1);
 assert.equal(s.window.__vedrasDynamicObjectProfile.dynamicSprites,1);
 assert.equal(s.window.__vedrasDynamicObjectProfile.staticSprites,0);
 assert.equal(s.window.__vedrasObjectProfile.drawnSprites,1);
});
test('direct editor/export draw order remains unchanged',()=>{
 const s=objectPassFixture();
 s.draw();
 assert.deepEqual(s.calls,[
  'nature-shadow','unit-shadow','nature-sprite','unit-sprite'
 ]);
});
test('retained snapshot never stores units and tile seeding skips per-tile unit scans',()=>{
 const scene=source.slice(source.indexOf('sceneryProfile=staticScenery.paint('),
  source.indexOf('if(sceneryProfile.cached',source.indexOf('sceneryProfile=staticScenery.paint(')));
 const seed=source.slice(source.indexOf('function seedReadyWorldTiles()'),
  source.indexOf('function snapshotTile('));
 const bake=source.slice(source.indexOf('async function bakeWorldTile('),
  source.indexOf('let fastInteracting=',source.indexOf('async function bakeWorldTile(')));
 assert.match(scene,/drawMapObjects\(\{includeUnits:false\}\)/);
 assert.match(source,/drawMapObjects\(\{onlyUnits:true\}\)/);
 assert.doesNotMatch(seed,/const units=objectLayoutCache\.query/);
 assert.match(bake,/drawMapObjects\(\{includeUnits:false,/);
 assert.match(source,/preferGpu:state\.gpuSprites===true&&!visibleDynamicUnits\(\)/);
});
test('ready Nature/ground tile composites on pan without rebuilding sprites',()=>{
 const draws=[],ctx={setTransform(){},clearRect(){},save(){},restore(){},
  beginPath(){},closePath(){},clip(){},fill(){},fillRect(){},
  moveTo(){},lineTo(){},drawImage(...args){draws.push(args)}};
 const canvas={width:0,height:0,getContext:()=>ctx};
 const sandbox={window:{}};
 vm.runInNewContext(read('world-tile-streamer.js'),sandbox);
 const world=sandbox.window.VedrasWorldTiles.create({canvas,source:null});
 const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 const image={width:768,height:640};
 assert.equal(world.seed(tile,'mid',{complete:true,layers:[
  {layer:'ground',image,pad:3},{layer:'scenery',image,pad:128}
 ]}),true);
 const view={width:700,height:600,dpr:1,zoom:.65,panX:0,panY:0,projectY:.85};
 world.request(view,[tile]);
 assert.equal(world.render(view).drawn,2);
 world.request({...view,panX:60},[tile]);
 assert.equal(world.render({...view,panX:60}).drawn,2);
 assert.equal(world.stats().completed,1);
 assert.equal(draws.length,4);
});

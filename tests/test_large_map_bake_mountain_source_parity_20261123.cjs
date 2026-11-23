'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Source=require('../large-map-bake-scenery-source.js');
const Audit=require('../large-map-bake-mountain-envelope-audit.js');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../mountain.js'),'utf8'),sandbox);
const mountains=sandbox.window.VedrasMountains;
const mountainPath='assets/nature/berg_01.png';
const makeWorld=()=>({
 version:'geography-v2.1.2',seed:'original-mountain-geometry',
 width:10,height:10,originQ:0,originR:0,config:{},riverPaths:[],
 cells:Array.from({length:100},(_,i)=>({
  q:i%10,r:Math.floor(i/10),terrainId:'highland',
  reliefClass:(i===13||i===14)?'mountain':'none',features:[]
 }))
});
const terrainCatalog={terrainTypes:[{id:'highland',materialClass:'ground'}]};
const rules={mountainAllowed:()=>true};
const meta={kind:'mountain',family:'mountains',id:'original_mountain',
 logicalWidth:720,anchor:{x:.5,y:.67},artStatus:'candidate',
 mountain:{radius:1,coreRadius:0}};
const natureCatalog={revision:123,entries:{'nature/berg_01.png':meta}};
const assets=[{category:'nature',path:mountainPath,
 relPath:'nature/berg_01.png',mtime:1}];
const options=(extra={})=>({
 world:makeWorld(),terrainCatalog,natureCatalog,assets,seed:12345,
 mountains,rules,...extra
});
const loadImage=async()=>({img:{naturalWidth:600,naturalHeight:240}});
test('optional original geometry switches ON editor tight-spacing rejection',async()=>{
 const legacy=Source.create(options());
 assert.equal(legacy.placed,2);
 assert.equal(legacy.usesDecodedOriginalMountainSpacing,false);
 const original=await Source.createWithOriginalImages(options({loadImage}));
 assert.equal(original.mountainHexes,2);
 assert.equal(original.placed,1);
 assert.equal(original.unmatched.length,1);
 assert.equal(original.rejectedVisualSpacing,1);
 assert.equal(original.usesDecodedOriginalMountainSpacing,true);
 assert.equal(original.originalMountainImageVariants,1);
 assert.equal(original.complete,false);
 assert.equal(original.readyForViewer,false);
 assert.equal(original.rasterized,false);
 assert.equal(original.instances[0].q,3);
 assert.equal(original.instances[0].r,1);
});
test('NATURE editor envelope audit sees no spacing conflicts in corrected source',async()=>{
 const original=await Source.createWithOriginalImages(options({loadImage}));
 const plan={schema:'vedras-geography-bake-plan-v1',stage:'plan-only',
  rasterized:false,readyForViewer:false,source:{
   version:'geography-v2.1.2',seed:'original-mountain-geometry',
   width:10,height:10,originQ:0,originR:0,cells:100
  },tileCount:1,tiles:[{id:'0,0',x:0,y:0,size:512}]};
 const auditor=Audit.create({plan,mountainPlan:original,
  natureCatalog,assets,loadImage,mountains});
 const result=await auditor.audit();
 assert.equal(result.matchesOriginalCandidateSpacing,true);
 assert.equal(result.statistics.sharedChainTooCrowded,0);
 assert.equal(result.statistics.coreOverlaps,0);
 assert.equal(result.statistics.interChainInfluenceConflicts,0);
});
test('valid narrower mountain PNG geometry retains both positions',async()=>{
 const localMeta={...meta,logicalWidth:360};
 const localNature={revision:123,entries:{'nature/berg_01.png':localMeta}};
 const a=await Source.createWithOriginalImages(options({
  natureCatalog:localNature,loadImage}));
 assert.equal(a.placed,2);
 assert.equal(a.rejectedVisualSpacing,0);
 assert.deepEqual(a.instances.map(x=>x.q),[3,4]);
});
test('candidate enumeration and placement are deterministic regardless of /api/assets order',async()=>{
 const duplicated=[...assets,...assets];
 const a=await Source.createWithOriginalImages(options({
  assets:duplicated,loadImage}));
 const b=await Source.createWithOriginalImages(options({
  assets:[...duplicated].reverse(),loadImage}));
 assert.deepEqual(a.instances,b.instances);
 assert.deepEqual(a.unmatched,b.unmatched);
 assert.equal(a.originalMountainImageVariants,1);
});
test('missing, unreadable or invalid source imagery never enables placement',async()=>{
 await assert.rejects(Source.createWithOriginalImages(options()),
  /physischen PNG-Dekoder/);
 await assert.rejects(Source.createWithOriginalImages(options({
  loadImage:async()=>{throw Error('JPEG instead of PNG');}})),/JPEG instead of PNG/);
 await assert.rejects(Source.createWithOriginalImages(options({
  loadImage:async()=>({img:{naturalWidth:0,naturalHeight:0}})})),/Original-Berg-PNG/);
 const geometry=new Map([[mountainPath,{width:720,aspect:0,anchorX:.5,anchorY:.67}]]);
 assert.throws(()=>Source.create(options({
  originalMountainImageGeometry:geometry})),/Geometrie fehlt/);
 const noImage=await Source.createWithOriginalImages(options({
  assets:[],loadImage}));
 assert.equal(noImage.placed,0);
 assert.equal(noImage.sourceVariants,0);
 assert.equal(noImage.readyForViewer,false);
});
test('geography preflight explicitly uses physically decoded mountain widths',()=>{
 const lab=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8');
 const ci=fs.readFileSync(path.join(__dirname,'../.github/workflows/geography-large-bake-ci.yml'),'utf8');
 assert.match(lab,/await SCENERY\.createWithOriginalImages/);
 assert.match(lab,/usesDecodedOriginalMountainSpacing/);
 assert(html.includes('src="large-map-bake-scenery-source.js'));
 assert(ci.includes('/tests/test_large_map_bake_mountain_source_parity_20261123.cjs'));
});

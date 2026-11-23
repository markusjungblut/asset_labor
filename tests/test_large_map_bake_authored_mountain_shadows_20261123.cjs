'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const Bridge=require('../large-map-bake-authored-mountain-shadows.js');
const root=path.resolve(__dirname,'..');
const shadow={
 settings:cfg=>({angle:150,length:.72,rootWidth:.26,contactWidth:.16,
  opacity:.44,...cfg}),
 globalStrength:v=>v
};
const tone={clean:v=>({...v})};
const plan={instances:[
 {q:0,r:0,assetPath:'assets/nature/berg_01.png'},
 {q:1,r:1,assetPath:'assets/nature/berg_02.png'}]};
function scene(){
 return {schema:'vedras-asset-labor-scene-0.8',schemaVersion:3,
  projection:{hexWidth:256,groundY:.85},
  mountainShadowDefaults:{angle:147,length:.65,rootWidth:.2},
  shadowGlobal:1.34,
  shadowAssetPresets:{'assets/nature/berg_01.png':{
   angle:180,length:.84,rootWidth:.3},
   'assets/buildings/tower.png':{angle:190}},
  mountainInstances:[
   {q:0,r:0,assetPath:'assets/nature/berg_01.png',
    shadowAngle:202,shadowLength:1.18},
   {q:1,r:1,assetPath:'assets/nature/berg_02.png',shadowAngle:165}
  ],shadowTone:{gray:27,mountains:true,balance:0}};
}
const create=(s=scene(),p=plan)=>Bridge.create({
 scene:s,mountainPlan:p,shadows:shadow,tone});
test('authentic editor scene matches all mountain instances 1:1',()=>{
 const style=create();
 assert.equal(Bridge.valid(style),true);
 assert.equal(style.instanceMatchComplete,true);
 assert.equal(style.shadowGlobal,1.34);
 assert.equal(style.instancesInScene,2);
 assert.equal(style.readyForViewer,false);
 assert.equal(style.shadowTone.gray,27);
});
test('editor specificity: global -> asset -> instance, without renaming',()=>{
 const st=create();
 const a=Bridge.resolve(st,plan.instances[0],shadow);
 const b=Bridge.resolve(st,plan.instances[1],shadow);
 assert.equal(a.angle,202);
 assert.equal(a.length,1.18);
 assert.equal(a.rootWidth,.3);
 assert.equal(b.angle,165);
 assert.equal(b.rootWidth,.2);
});
test('unmatched geography source NEVER gets editor position overrides',()=>{
 const st=create(scene(),{instances:[
  {q:10,r:0,assetPath:'assets/nature/berg_01.png'}]});
 assert.equal(st.instanceMatchComplete,false);
 const result=Bridge.resolve(st,{
  q:10,r:0,assetPath:'assets/nature/berg_01.png'},shadow);
 assert.equal(result.angle,180);
 assert.equal(result.length,.84);
});
test('same counts but mismatched asset path cannot match',()=>{
 const st=create(scene(),{instances:[
  {q:0,r:0,assetPath:'assets/nature/berg_02.png'},
  {q:1,r:1,assetPath:'assets/nature/berg_01.png'}]});
 assert.equal(st.instanceMatchComplete,false);
});
test('reject forged styles and corrupt schema/settings before drawing',()=>{
 assert.equal(Bridge.valid({schema:Bridge.SCHEMA}),false);
 assert.throws(()=>Bridge.resolve({schema:Bridge.SCHEMA},
  plan.instances[0],shadow),/validiert/);
 assert.throws(()=>create({...scene(),schemaVersion:2}),/Authentischer/);
 assert.throws(()=>create({...scene(),shadowGlobal:Infinity}),/globale/);
 assert.throws(()=>create({...scene(),shadowAssetPresets:{
  'assets/nature/../escape.png':{angle:170}}}),/Grafikpfad/);
 assert.throws(()=>create({...scene(),shadowTone:{gray:101,mountains:true}}),/Grauton/);
});
test('duplicate imported hex+asset entries block ambiguous overrides',()=>{
 const s=scene();s.mountainInstances.push(s.mountainInstances[0]);
 assert.throws(()=>create(s),/Mehrdeutige/);
});
test('historical per-asset geometry conversion matches editor order',()=>{
 const s=scene();s.shadowAssetPresets['assets/nature/berg_01.png']=
  {reach:1.1,spread:1.6,contact:1.5};
 s.mountainInstances[0]={q:0,r:0,assetPath:'assets/nature/berg_01.png',
  shadowReach:.9,shadowContact:1.8};
 const r=Bridge.resolve(create(s),plan.instances[0],shadow);
 assert.equal(r.length,.9*.8);
 assert.equal(r.rootWidth,.26*1.6/1.28);
 assert.equal(r.contactWidth,.16*1.8/1.10);
});
test('browser wiring uses only explicit uploaded editor file and no persistence',()=>{
 const html=fs.readFileSync(path.join(root,'geography-lab.html'),'utf8');
 const lab=fs.readFileSync(path.join(root,'geography-lab.js'),'utf8');
 const mountain=fs.readFileSync(path.join(root,
  'large-map-bake-original-mountain-shadows.js'),'utf8');
 const ci=fs.readFileSync(path.join(root,
  '.github/workflows/geography-large-bake-ci.yml'),'utf8');
 assert(html.includes('id="jointMountainShadowSceneFile"'));
 assert(html.indexOf('src="large-map-bake-authored-mountain-shadows.js')<
  html.indexOf('src="large-map-bake-original-mountain-shadows.js'));
 assert(lab.includes('file.text()'));
 assert(lab.includes('persist:false'));
 assert(lab.includes('withJointShadowTone(authored'));
 assert(mountain.includes('styleBridge.resolve'));
 assert(ci.includes('/tests/test_large_map_bake_authored_mountain_shadows_20261123.cjs'));
});

'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'renderer-original-map-suite.js'),'utf8');
const needle="$('startAll').addEventListener('click',suite);";
assert.ok(source.includes(needle),'Suite test-hook anchor changed');
const injected=source.replace(needle,"window.__suiteTestHooks={makeTasks,route,readinessWhileMoving,groupSummary,summarizeSuite};\n"+needle);
const elements=new Map();
const document={
 getElementById(id){
  if(!elements.has(id))elements.set(id,{addEventListener(){},disabled:false});
  return elements.get(id);
 }
};
const sandbox={
 window:{},document,location:{origin:'http://127.0.0.1:8780'},
 fetch:async()=>({ok:false,text:async()=>''})
};
vm.createContext(sandbox);
vm.runInContext(injected,sandbox,{timeout:4000});
const {makeTasks,route,readinessWhileMoving,groupSummary}=sandbox.window.__suiteTestHooks;

test('deterministic 124-task matrix, isolated crossover and reverse order',()=>{
 const tasks=makeTasks('standard'),reversed=makeTasks('reverse');
 assert.equal(tasks.length,124);
 assert.equal(reversed.length,124);
 const count=type=>tasks.filter(t=>t.kind===type).length;
 assert.deepEqual([count('baseline'),count('control'),count('feature'),count('production')],[6,11,104,3]);
 const ids=[...new Set(tasks.filter(t=>t.groupId).map(t=>t.groupId))];
 assert.equal(ids.length,13);
 for(const id of ids){
  const t=tasks.filter(x=>x.groupId===id);
  assert.equal(t.length,8,id);
  assert.equal(t.map(x=>x.value).join(''),'01101001',id);
  assert.deepEqual(Array.from(t,x=>x.block),[1,1,1,1,2,2,2,2],id);
 }
 const firstFeature=t=>t.find(r=>r.kind==='feature'&&r.scenario==='region').feature;
 assert.notEqual(firstFeature(tasks),firstFeature(reversed));
});
test('route returns to initial pose and performs real 1x/2x and distant jumps',()=>{
 const base={zoom:.33,panX:0,panY:0,dpr:1.25,projectY:.85};
 const tiles=[];
 for(let x=-5;x<=5;x++)for(let y=-5;y<=5;y++)tiles.push({x:x*512,y:y*512});
 for(const scenario of ['warm','lod','region','pressure']){
  const plan=route(base,scenario,tiles);
  assert.ok(plan.poses.length>=40,scenario);
  const last=plan.poses.at(-1);
  assert.equal(last.zoom,base.zoom,scenario);
  assert.equal(last.panX,base.panX,scenario);
  assert.equal(last.panY,base.panY,scenario);
  if(scenario==='lod'){
   assert.ok(plan.poses.some(x=>x.zoom>=.72));
   assert.ok(plan.poses.some(x=>x.zoom<=.60));
  }
  if(scenario==='pressure')assert.ok(plan.poses.some(x=>Math.abs(x.panX)>1500));
 }
});
test('missing-tile window is measured from adjacent active frames',()=>{
 const result=readinessWhileMoving({frames:[
  {active:true,tMs:0,visibleTiles:4,visibleReadyTiles:4},
  {active:true,tMs:16,visibleTiles:4,visibleReadyTiles:2},
  {active:true,tMs:32,visibleTiles:4,visibleReadyTiles:4}
 ]});
 assert.equal(result.missingFrames,1);
 assert.equal(result.missingDurationMs,16);
 assert.equal(result.peakMissingTiles,2);
});
function group(){
 const groupId='parallelDecode/region';
 const values=[0,1,1,0,1,0,0,1];
 return values.map((value,i)=>({
  label:'mock-'+i,groupId,feature:'parallelDecode',scenario:'region',
  success:true,valid:true,value,block:i<4?1:2,
  decodedPixelsBefore:20_000_000,derivedConversions:0,
  parallelTileDecodes:value?3:0,
  p95RafTickMs:value?30:40,p95DrawMs:value?4:5,
  p95FrameGapMs:value?31:41,missingDurationMs:value?100:200,
  longestMissingMs:value?20:30
 }));
}
function controls(raf=22){
 return [
  {scenario:'region',success:true,valid:true,p95RafTickMs:20,p95DrawMs:4},
  {scenario:'region',success:true,valid:true,p95RafTickMs:raf,p95DrawMs:4}
 ];
}
test('qualifies real consistent crossover activation without control drift',()=>{
 const r=groupSummary(group(),controls(),'parallelDecode/region');
 assert.equal(r.qualified,true,JSON.stringify(r.issues));
 assert.equal(r.triggerCount,12);
 assert.ok(r.rafRelativeDifference<0);
 assert.equal(r.metrics.p95RafTickMs.blocks.length,2);
});
test('rejects missing feature activation',()=>{
 const noActivation=group().map(r=>({...r,parallelTileDecodes:0}));
 const r=groupSummary(noActivation,controls(),'parallelDecode/region');
 assert.equal(r.qualified,false);
 assert.match(r.issues.join(' '),/nicht ausgeloest/);
});
test('rejects hardware time drift',()=>{
 const r=groupSummary(group(),controls(95),'parallelDecode/region');
 assert.equal(r.qualified,false);
 assert.match(r.issues.join(' '),/driften/);
});
test('rejects mismatched A/B initial RAM',()=>{
 const data=group().map(r=>r.value?{...r,decodedPixelsBefore:46_000_000}:r);
 const r=groupSummary(data,controls(),'parallelDecode/region');
 assert.equal(r.qualified,false);
 assert.match(r.issues.join(' '),/RAM-Cachezustand/);
});

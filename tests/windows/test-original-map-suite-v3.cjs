'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'renderer-original-map-suite.js'),'utf8');
const needle="$('startAll').addEventListener('click',suite);";
assert.ok(source.includes(needle),'Suite test-hook anchor changed');
const injected=source.replace(needle,"window.__suiteTestHooks={makeTasks,makeBlitTasks,makeStressTasks,makeTraceTasks,makeFallbackTasks,makeFinalTasks,analyzeFinal,analyzeFallback,summarizeTileTraces,analyzeBlit,route,readinessWhileMoving,groupSummary,summarizeSuite,readyViewerAt,severeControlDrift,median};\n"+needle);
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
test('9-run final crossover keeps both A and B on 1x experimental runtime',()=>{
 const {makeFinalTasks}=sandbox.window.__suiteTestHooks;
 const ss=makeFinalTasks('standard'),rs=makeFinalTasks('reverse');
 for(const tasks of [ss,rs]){
  assert.equal(tasks.length,9);
  const ab=tasks.filter(t=>t.feature==='parallelDecode');
  assert.equal(ab.length,6);
  assert.equal(ab.filter(t=>t.value===0).length,3);
  assert.equal(ab.filter(t=>t.value===1).length,3);
  assert.equal(tasks.filter(t=>t.control).length,3);
  assert.ok(tasks.every(t=>t.version==='experiment'&&t.fallbackCombo));
  assert.ok(tasks.filter(t=>t.control).every(t=>
   t.feature===null&&t.scenario==='region'));
  assert.ok(ab.every(t=>t.scenario==='pressure'));
 }
 const bits=t=>t.filter(x=>x.feature==='parallelDecode').map(x=>x.value).join('');
 assert.equal(bits(ss),'011001');
 assert.equal(bits(rs),'100110');
});
test('final evaluator rejects missing B activations and preserves paired metrics',()=>{
 const {analyzeFinal}=sandbox.window.__suiteTestHooks;
 const values=[0,1,1,0,0,1],records=values.map((value,i)=>({
  label:'sample '+i,feature:'parallelDecode',fallbackCombo:true,
  success:true,valid:true,ready:{ok:true},value,
  missingDurationMs:0,readiness:{missingFraction:0,missingFrames:0},
  p95RafTickMs:value?45:59,p95DrawMs:value?5:4,p99RafTickMs:93,
  evictions:8,decodeRepeats:0,frameSamples:64,rafOver50:4,
  parallelTileDecodes:value?20:0,decodedPixelsAfter:76000000,
  fallbackAtStart:{enabled:true,complete:true,resident:120,target:120}
 }));
 const x=analyzeFinal(records);
 assert.equal(x.verdict,'MOEGLICHER KLEINER GEWINN: WEITERE PRUEFUNG NOETIG');
 assert.equal(x.metrics.p95RafTickMs.delta,-14);
 assert.equal(x.metrics.p95DrawMs.delta,1);
 assert.equal(x.totals.missingB,0);
 records[1].parallelTileDecodes=0;
 assert.equal(analyzeFinal(records).verdict,'NICHT QUALIFIZIERT');
});
test('13-run 1x fallback experiment uses separate candidate A and experiment B',()=>{
 const {makeFallbackTasks}=sandbox.window.__suiteTestHooks;
 const plans=[makeFallbackTasks('standard'),makeFallbackTasks('reverse')];
 for(const tasks of plans){
  assert.equal(tasks.length,13);
  assert.equal(tasks.filter(x=>x.kind==='baseline').length,2);
  assert.equal(tasks.filter(x=>x.control).length,3);
  const ab=tasks.filter(x=>x.feature==='fallbackAtlas');
  assert.equal(ab.length,8);
  assert.equal(ab.filter(x=>x.value===0).length,4);
  assert.equal(ab.filter(x=>x.value===1).length,4);
  assert.ok(ab.every(x=>x.scenario==='pressure'));
  assert.ok(ab.every(x=>x.version===(x.value===1?'experiment':'candidate')));
  assert.ok(tasks.filter(x=>x.control).every(x=>x.version==='candidate'));
  assert.ok(tasks.filter(x=>x.kind==='baseline').every(x=>x.version==='baseline'));
 }
 const bits=t=>t.filter(x=>x.feature==='fallbackAtlas').map(x=>x.value).join('');
 assert.equal(bits(plans[0]),'01101001');
 assert.equal(bits(plans[1]),'10010110');
});
test('1x fallback comparison retains missing and raf paired blocks and warmup',()=>{
 const {analyzeFallback}=sandbox.window.__suiteTestHooks;
 const records=[];
 for(const block of [1,2])for(const [i,value] of [0,1,1,0].entries()){
  records.push({success:true,valid:true,feature:'fallbackAtlas',value,block,
   label:'B'+block+'-'+i,missingDurationMs:value?300:1800,
   p95RafTickMs:value?25:36,p95DrawMs:value?5:4,
   evictions:value?10:70,decodeRepeats:value?2:20,
   readiness:{missingFraction:value?.12:.85},
   fallbackWarmupMs:value?1500:0,
   fallbackAtStart:{enabled:!!value,resident:value?110:0,target:value?120:0,
    capped:false},fallbackAtEnd:{fallbackHits:value?44:0,
    staleStorageSkips:value?5:0,staleDecodeDrops:value?3:0}
  });
 }
 const cmp=analyzeFallback(records);
 assert.equal(cmp.status,'TECHNISCH GUELTIG');
 assert.equal(cmp.metrics.missingFraction.aMedian,.85);
 assert.equal(cmp.metrics.missingFraction.bMedian,.12);
 assert.equal(cmp.metrics.missingDurationMs.aMedian,1800);
 assert.equal(cmp.metrics.missingDurationMs.bMedian,300);
 assert.equal(cmp.metrics.p95RafTickMs.blockDiffs[0],-11);
 assert.equal(cmp.totals.fallbackHits,176);
 assert.equal(cmp.totals.skippedObsoleteStorage,20);
 assert.equal(cmp.warm.length,4);
});
test('13-run blit plan uses two main baselines, three off-controls, four A and four B',()=>{
 const {makeBlitTasks}=sandbox.window.__suiteTestHooks;
 const normal=makeBlitTasks('standard'),reverse=makeBlitTasks('reverse');
 for(const tasks of [normal,reverse]){
  assert.equal(tasks.length,13);
  assert.equal(tasks.filter(t=>t.kind==='baseline').length,2);
  assert.equal(tasks.filter(t=>t.kind==='control').length,3);
  const ab=tasks.filter(t=>t.kind==='feature');
  assert.equal(ab.length,8);
  assert.equal(ab.filter(t=>t.value===0).length,4);
  assert.equal(ab.filter(t=>t.value===1).length,4);
  assert.ok(ab.every(t=>t.groupId==='parallelDecode/region'));
  assert.ok(tasks.filter(t=>t.kind==='control').every(t=>t.value===null));
 }
 const values=t=>t.filter(r=>r.kind==='feature').map(r=>r.value).join('');
 assert.equal(values(normal),'01101001');
 assert.equal(values(reverse),'10010110');
});
test('23-run isolated mixed stress plan protects original atlas and brackets stages',()=>{
 const {makeStressTasks}=sandbox.window.__suiteTestHooks;
 for(const order of ['standard','reverse']){
  const tasks=makeStressTasks(order);
  assert.equal(tasks.length,23);
  assert.equal(tasks.filter(t=>t.kind==='baseline').length,2);
  assert.equal(tasks.filter(t=>t.kind==='control').length,6);
  assert.equal(tasks.filter(t=>t.kind==='stress').length,15);
  assert.equal(tasks[0].version,'baseline');
  assert.equal(tasks.at(-1).version,'baseline');
  assert.equal(tasks[1].scenario,'region');
  assert.ok(tasks.filter(t=>t.kind==='control').every(t=>t.scenario==='region'));
  assert.ok(tasks.filter(t=>t.kind==='stress').every(t=>
   t.version==='candidate'&&t.feature===null&&t.value===null&&t.stress===true));
  const groups=tasks.filter(t=>t.kind==='stress').map(t=>t.scenario);
  assert.equal(groups.filter(t=>t==='pressure').length,6);
  assert.equal(groups.filter(t=>t==='lod').length,6);
  assert.equal(groups.filter(t=>t==='warm').length,3);
  const ctrlIndices=tasks.map((t,i)=>t.kind==='control'?i:null).filter(x=>x!==null);
  assert.equal(ctrlIndices.join(','),'1,5,9,13,17,21');
 }
 assert.equal(makeStressTasks('standard')[2].scenario,'pressure');
 assert.equal(makeStressTasks('reverse')[2].scenario,'lod');
});
test('9-run tile lifecycle plan brackets exactly four instrumented pressure routes',()=>{
 const {makeTraceTasks}=sandbox.window.__suiteTestHooks;
 const tasks=makeTraceTasks();
 assert.equal(tasks.length,9);
 assert.deepEqual(Array.from(tasks,t=>t.kind),
  ['baseline','control','stress','stress','control','stress','stress','control','baseline']);
 assert.equal(tasks.filter(t=>t.kind==='baseline').length,2);
 assert.equal(tasks.filter(t=>t.kind==='control').length,3);
 assert.equal(tasks.filter(t=>t.kind==='stress').length,4);
 assert.ok(tasks.filter(t=>t.version==='candidate').every(t=>
  t.trace===true&&t.feature===null&&t.value===null));
 assert.ok(tasks.filter(t=>t.version==='baseline').every(t=>!t.trace));
 assert.ok(tasks.filter(t=>t.kind==='stress').every(t=>t.scenario==='pressure'));
 assert.ok(tasks.filter(t=>t.kind==='control').every(t=>t.scenario==='region'));
});
test('tile lifecycle summary separates capacity waits, decode repeats and visible missing',()=>{
 const {summarizeTileTraces}=sandbox.window.__suiteTestHooks;
 const records=[
  {label:'pressure 1',scenario:'pressure',tileTrace:{
   counts:{'capacity-wait':3,'inflight-wait':2,evict:4,'missing-start':3},
   dropped:0,peakMissing:2,events:[
    {kind:'ready',redecoded:true},
    {kind:'missing-ready',waitMs:80},
    {kind:'missing-left-view',waitMs:40}
   ]}},
  {label:'pressure 2',scenario:'pressure',tileTrace:{
   counts:{'capacity-wait':1,'missing-start':2},dropped:2,peakMissing:4,
   events:[{kind:'missing-ready',waitMs:120}]}}
 ];
 const sum=summarizeTileTraces(records);
 assert.equal(sum.observedRuns,2);
 assert.equal(sum.tracesWithDroppedEvents,1);
 assert.equal(sum.eventCounts['capacity-wait'],4);
 assert.equal(sum.eventCounts.evict,4);
 assert.equal(sum.peakMissing,4);
 assert.equal(sum.missingReadyDurationMedianMs,100);
 assert.equal(sum.missingLeftViewDurationMedianMs,40);
 assert.equal(sum.perRun[0].redecodedReadies,1);
 assert.equal(sum.perRun[1].longestResolvedMs,120);
});
test('blit evidence retains later stalls, first stalls and pixel/DPR context',()=>{
 const {analyzeBlit}=sandbox.window.__suiteTestHooks;
 const records=[
  {label:'candidate B',version:'candidate',feature:'parallelDecode',value:1,
   p95RafTickMs:90,p95DrawMs:80,raw:{frames:[
    {tMs:0,dpr:1.25,canvasPixels:706525,drawMs:3001,worldBlitMs:3000},
    {tMs:5000,dpr:2,canvasPixels:1807760,drawMs:270,worldBlitMs:268,
     worldRasterMiB:46,zoom:.9,visibleTiles:8,visibleReadyTiles:6}
   ]}},
  {label:'baseline',version:'baseline',feature:null,value:null,
   p95RafTickMs:40,p95DrawMs:5,raw:{frames:[
    {tMs:0,dpr:1.25,canvasPixels:706525,drawMs:5,worldBlitMs:3}
   ]}}
 ];
 const result=analyzeBlit(records);
 assert.equal(result.totalFrames,3);
 assert.equal(result.thresholdCounts['100'],2);
 assert.equal(result.thresholdCounts['250'],2);
 assert.equal(result.thresholdCounts['1000'],1);
 assert.equal(result.initialStalls,1);
 assert.equal(result.movingStalls,1);
 assert.equal(result.byDpr['2'].over100,1);
 assert.equal(result.byVersion.candidate.over100,2);
 assert.equal(result.worstFrames[0].worldBlitMs,3000);
 assert.equal(result.worstFrames[1].canvasPixels,1807760);
 assert.equal(result.perRun[0].over250,2);
});
test('route returns to initial pose and performs real 1x/2x and distant jumps',()=>{
 const base={zoom:.33,panX:0,panY:0,dpr:1.25,projectY:.85};
 const tiles=[];
 for(let x=-5;x<=5;x++)for(let y=-5;y<=5;y++)tiles.push({x:x*512,y:y*512});
 for(const scenario of ['warm','lod','region','pressure']){
  const plan=route(base,scenario,tiles);
  assert.ok(plan.poses.length>=40,scenario);
  const last=plan.poses.at(-1);
  // Interpolated coordinates can differ by floating-point roundoff,
  // e.g. 0.32999999999999996 versus 0.33. Compare with a tight tolerance.
  const epsilon=1e-10;
  assert.ok(Math.abs(last.zoom-base.zoom)<=epsilon,
   scenario+': zoom must return to initial value');
  assert.ok(Math.abs(last.panX-base.panX)<=epsilon,
   scenario+': panX must return to initial value');
  assert.ok(Math.abs(last.panY-base.panY)<=epsilon,
   scenario+': panY must return to initial value');
  if(scenario==='lod'){
   assert.ok(plan.poses.some(x=>x.zoom>=.72));
   assert.ok(plan.poses.some(x=>x.zoom<=.60));
  }
  if(scenario==='pressure')assert.ok(plan.poses.some(x=>Math.abs(x.panX)>1500));
 }
});
test('iframe guard rejects old A/B viewer API and incomplete navigation',()=>{
 const expected='http://127.0.0.1:8780/candidate/frozen-map-game.html?leadPrefetch=1&_suiteRun=47';
 const previous='http://127.0.0.1:8780/candidate/frozen-map-game.html?leadPrefetch=0&_suiteRun=46';
 const a={readOnly:true,testPan(){return true;},stats(){return {saved:120};}};
 const frame={contentWindow:{
  location:{href:previous},document:{readyState:'complete'},
  __vedrasFrozenGameTest:a
 }};
 const {readyViewerAt}=sandbox.window.__suiteTestHooks;
 assert.equal(readyViewerAt(frame,expected),null,
  'Do not reuse the prior run API while new iframe navigation is pending');
 frame.contentWindow.location.href=expected;
 frame.contentWindow.document.readyState='loading';
 assert.equal(readyViewerAt(frame,expected),null,
  'Do not accept an unfinished iframe document');
 frame.contentWindow.document.readyState='complete';
 assert.equal(readyViewerAt(frame,expected),a,
  'Exact URL and fully initialized current document is accepted');
 frame.contentWindow.__vedrasFrozenGameTest=null;
 assert.equal(readyViewerAt(frame,expected),null,
  'Do not accept the current document until the player API exists');
});
test('true median averages middle values for even A/B sample counts',()=>{
 const {median}=sandbox.window.__suiteTestHooks;
 assert.equal(median([1,2,10,11]),6);
 assert.equal(median([11,2,1,10]),6);
 assert.equal(median([2,5,9]),5);
 assert.equal(median([Number.NaN,2,4]),3);
 assert.equal(median([]),null);
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
test('rejects a feature activated only once in four B runs',()=>{
 const onlyOne=group().map((r,i)=>({...r,parallelTileDecodes:i===1?3:0}));
 const r=groupSummary(onlyOne,controls(),'parallelDecode/region');
 assert.equal(r.qualified,false);
 assert.equal(r.triggeredBRuns,1);
 assert.ok(r.issues.join(' ').includes('nur in 1/4 B-Laeufen'));
});
test('stops only severe repeated control drift, not mild variation',()=>{
 const {severeControlDrift}=sandbox.window.__suiteTestHooks;
 const example=(raf,draw)=>({control:true,scenario:'region',valid:true,success:true,
  p95RafTickMs:raf,p95DrawMs:draw});
 const stable=[example(148,90),example(142,94),example(150,88)];
 assert.equal(severeControlDrift(stable,stable[2]),null);
 const drifting=[example(148,144),example(107,79),example(256,74)];
 const problem=severeControlDrift(drifting,drifting[2]);
 assert.ok(problem);
 assert.equal(problem.metric,'p95RafTickMs');
 assert.equal(problem.absoluteDriftMs,149);
});
test('rejects mismatched A/B initial RAM',()=>{
 const data=group().map(r=>r.value?{...r,decodedPixelsBefore:46_000_000}:r);
 const r=groupSummary(data,controls(),'parallelDecode/region');
 assert.equal(r.qualified,false);
 assert.match(r.issues.join(' '),/RAM-Cachezustand/);
});

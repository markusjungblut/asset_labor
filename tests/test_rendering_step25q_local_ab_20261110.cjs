'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {compare}=require('./compare_rendering_step25q_profiles.cjs');
function report(enabled){
 const entry={schema:'vedras-step25q-local-ab-v1',
  trace:'pan-lissajous-20261110-v1',bandIndexRequested:enabled,
  bandIndexActive:enabled,scene:'v1-12345678',level:'near',
  viewportCss:{width:1200,height:800},
  basePose:{zoom:.8,panX:0,panY:0,dpr:2,projectY:.85},
  framesPlanned:96,warmupFrames:96,settled:true,
  pendingBefore:0,pendingAfter:0,failuresBefore:0,failuresAfter:0};
 const phase=(v)=>({count:95,p50:v,p95:v+1,p99:v+1,mean:v});
 const environment={canvasBacking:{width:2400,height:1600},
  renderMode:'cached',overview1x:true,largeViewportCache:true,
  prefetchGuard:true,streamingWorldCache:true,adaptiveCloudCache:true,
  autoCloudStrategy:true,fogViewportCull:true,layeredFog:false,
  adaptiveWorldPad:true,sparseWorldBlit:true,indexedTileSelection:true};
 return {abCapture:entry,environment,frameCounts:{active:96},
  sampleLimit:{droppedFrames:0},phasesMs:{
   drawMs:phase(enabled?12:14),frameGapMs:phase(enabled?17:19),
   worldPrepareMs:phase(enabled?.1:.5),worldBlitMs:phase(8)}};
}
test('25Q capture comparison accepts correctly paired validated inputs',()=>{
 const result=compare(report(true),report(false));
 assert.equal(result.valid,true);
 assert.equal(result.timings.drawMs.p95.deltaMs,-2);
 assert.equal(result.timings.frameGapMs.p95.deltaMs,-2);
 assert.match(result.decision,/Keine automatische Merge-Freigabe/);
});
test('25Q A/B rejects silently inactive on-mode and different view sizes',()=>{
 const off=report(false),on=report(true);
 on.abCapture.bandIndexActive=false;
 on.abCapture.viewportCss.width=1300;
 const result=compare(off,on);
 assert.equal(result.valid,false);
 assert.ok(result.errors.some(x=>x.includes('nicht aktiv')));
 assert.ok(result.errors.some(x=>x.includes('Viewport')));
});
test('25Q rejects non-consecutive frame gaps, pending reads and policy drift',()=>{
 const off=report(false),on=report(true);
 off.phasesMs.frameGapMs.count=2;
 on.abCapture.pendingBefore=4;on.abCapture.settled=false;
 on.environment.sparseWorldBlit=false;
 const result=compare(off,on);
 assert.equal(result.valid,false);
 assert.ok(result.errors.some(x=>x.includes('Frame-Gaps')));
 assert.ok(result.errors.some(x=>x.includes('Aufwärmphase')));
 assert.ok(result.errors.some(x=>x.includes('sparseWorldBlit')));
});
test('25Q warns if index increases full-frame p95',()=>{
 const off=report(false),on=report(true);
 on.phasesMs.drawMs.p95=45;
 const result=compare(off,on);
 assert.equal(result.valid,true);
 assert.ok(result.warnings.some(x=>x.includes('drawMs')));
});

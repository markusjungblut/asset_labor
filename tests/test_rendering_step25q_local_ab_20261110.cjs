'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {compare}=require('./compare_rendering_step25q_profiles.cjs');
function report(enabled){
 const entry={schema:'vedras-step25q-local-ab-v2',
  trace:'pan-lissajous-20261110-v1',bandIndexRequested:enabled,
  bandIndexActive:enabled,scene:'v1-12345678',level:'near',
  viewportCss:{width:1200,height:800},
  basePose:{zoom:.8,panX:0,panY:0,dpr:2,projectY:.85},
  framesPlanned:96,warmupFrames:96,indexMinimumCells:400,settled:true,
  cellCount:397,authorizedCells:360,
  indexQueriesBefore:0,indexQueriesAfter:enabled?96:0,
  sparseFramesBefore:0,sparseFramesAfter:96,
  sparseFallbacksBefore:0,sparseFallbacksAfter:0,
  worldBlitPixelsBefore:0,worldBlitPixelsAfter:15000000,
  worldBlitFullPixelsBefore:0,worldBlitFullPixelsAfter:25000000,
  candidateBefore:{indexed:0,legacy:0},
  candidateAfter:{indexed:enabled?360:0,legacy:enabled?0:39700},
  pendingBefore:0,pendingAfter:0,failuresBefore:0,failuresAfter:0,
  warmCountersBefore:{loads:30,visibleReadStarts:10,prefetchReadStarts:20,
   decodeRepeats:0,evictions:0},
  warmCountersAfter:{loads:30,visibleReadStarts:10,prefetchReadStarts:20,
   decodeRepeats:0,evictions:0}};
 const phase=(v)=>({count:95,p50:v,p95:v+1,p99:v+1,mean:v});
 const environment={canvasBacking:{width:2400,height:1600},
  browser:'Firefox 99 Test Fixture',renderMode:'cached',overview1x:true,largeViewportCache:true,
  prefetchGuard:true,streamingWorldCache:true,adaptiveCloudCache:true,
  autoCloudStrategy:true,fogViewportCull:true,layeredFog:false,
  adaptiveWorldPad:true,sparseWorldBlit:true,indexedTileSelection:true,
  worldBandIndexMinCells:400};
 return {abCapture:entry,environment,frameCounts:{active:96},
  sampleLimit:{droppedFrames:0},phasesMs:{
   drawMs:phase(enabled?12:14),frameGapMs:phase(enabled?17:19),
   worldPrepareMs:phase(enabled?.1:.5),worldPlanMs:phase(enabled?.02:.1),
   worldBlitMs:phase(8)}};
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

test('25Q A/B rejects unequal diagnostic index thresholds',()=>{
 const a=report(false),b=report(true);
 b.abCapture.indexMinimumCells=256;
 b.environment.worldBandIndexMinCells=256;
 const c=compare(a,b);
 assert.equal(c.valid,false);
 assert.ok(c.errors.some(x=>x.includes('Mindestwert')));
});

test('25Q rejects an existing but never queried index',()=>{
 const a=report(false),b=report(true);b.abCapture.indexQueriesAfter=0;
 const r=compare(a,b);assert.equal(r.valid,false);
 assert.ok(r.errors.some(e=>e.includes('Indexabfragen')));
});
test('25Q rejects direct-only renderer even with an allocated index',()=>{
 const a=report(false),b=report(true);
 a.environment.renderMode='direct';b.environment.renderMode='direct';
 const r=compare(a,b);assert.equal(r.valid,false);
 assert.ok(r.errors.some(e=>e.includes('gecachten Render-Modus')));
});
test('25Q rejects missing cached world blit activity',()=>{
 const a=report(false),b=report(true);
 for(const c of [a.abCapture,b.abCapture]){c.sparseFramesAfter=0;c.worldBlitFullPixelsAfter=0;}
 const r=compare(a,b);assert.equal(r.valid,false);
 assert.ok(r.errors.some(e=>e.includes('kein gemessener')));
});
test('25Q rejects mismatched authorized map metadata',()=>{
 const a=report(false),b=report(true);b.abCapture.authorizedCells--;
 const r=compare(a,b);assert.equal(r.valid,false);
 assert.ok(r.errors.some(e=>e.includes('Autorisierungsmetadaten')));
});

test('25Q three-pair bundle validates alternating A/B order and computes median deltas',()=>{
 const {compareSeries}=require('./compare_rendering_step25q_profiles.cjs');
 const order=[false,true,true,false,false,true];
 const captures=order.map(x=>report(x));
 const bundle={schema:'vedras-step25q-local-series-v1',captures};
 const result=compareSeries(bundle);
 assert.equal(result.valid,true);
 assert.equal(result.pairs.length,3);
 assert.equal(result.summary.drawMs.p95.medianDeltaMs,-2);
 assert.equal(result.summary.frameGapMs.p95.improvedPairs,3);
 assert.match(result.decision,/Kein automatischer Merge/);
});
test('25Q rejects incomplete, wrong-order and changed-viewport series',()=>{
 const {compareSeries}=require('./compare_rendering_step25q_profiles.cjs');
 const order=[false,true,true,false,false,true];
 const bundle={schema:'vedras-step25q-local-series-v1',
  captures:order.map(x=>report(x))};
 assert.equal(compareSeries({...bundle,captures:bundle.captures.slice(0,5)}).valid,false);
 const wrong={...bundle,captures:order.map(x=>report(x))};
 wrong.captures[1]=report(false);
 assert.equal(compareSeries(wrong).valid,false);
 const shifted={...bundle,captures:order.map(x=>report(x))};
 shifted.captures[4].abCapture.basePose.zoom=.9;
 const result=compareSeries(shifted);
 assert.equal(result.valid,false);
 assert.ok(result.errors.some(e=>e.includes('Serienmessungen')));
});
test('25Q three-pair series fails if any single pair skips the real index path',()=>{
 const {compareSeries}=require('./compare_rendering_step25q_profiles.cjs');
 const order=[false,true,true,false,false,true];
 const bundle={schema:'vedras-step25q-local-series-v1',
  captures:order.map(x=>report(x))};
 bundle.captures[5].abCapture.indexQueriesAfter=0;
 const result=compareSeries(bundle);
 assert.equal(result.valid,false);
 assert.ok(result.errors.some(e=>e.includes('Paar 3')));
});

test('25Q series keeps captures for retry and checks abort between pan frames',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const game=fs.readFileSync(path.join(__dirname,'..','frozen-map-game.js'),'utf8');
 const html=fs.readFileSync(path.join(__dirname,'..','frozen-map-game.html'),'utf8');
 assert.match(game,/seriesButton\.textContent='A\/B-Serie erneut herunterladen'/);
 assert.match(game,/clearSeriesButton\.addEventListener\('click'/);
 assert.match(game,/shouldAbort:\(\)=>!sessionStorage\.getItem\(AB_SERIES_KEY\)/);
 assert.match(html,/id="clearBandIndexSeries" hidden/);
});

// Warm A/B integrity is independent of successful index allocation.
test('25Q rejects measured visible reads, prefetch reads and image decoding',()=>{
 const off=report(false),on=report(true);
 on.abCapture.warmCountersAfter.visibleReadStarts++;
 on.abCapture.warmCountersAfter.prefetchReadStarts++;
 on.abCapture.warmCountersAfter.loads++;
 on.abCapture.warmCountersAfter.decodeRepeats++;
 on.tileReads=[{source:'derived2x',kind:'loaded'}];
 const result=compare(off,on);
 assert.equal(result.valid,false);
 assert.ok(result.errors.some(e=>e.includes('kein warmer Lauf')));
 assert.ok(result.errors.some(e=>e.includes('Profiler')));
});
test('25Q rejects pending end reads, cache eviction and mismatched browser',()=>{
 const off=report(false),on=report(true);
 off.abCapture.pendingAfter=1;
 on.abCapture.warmCountersAfter.evictions++;
 on.environment.browser='Different Browser';
 const result=compare(off,on);
 assert.equal(result.valid,false);
 assert.ok(result.errors.some(e=>e.includes('nach der Messfahrt')));
 assert.ok(result.errors.some(e=>e.includes('evictions')));
 assert.ok(result.errors.some(e=>e.includes('Browser/Version')));
});
test('25Q rejects changing render resolution or LOD within one run',()=>{
 const off=report(false),on=report(true);
 off.frames=[{canvasPixels:100,activeVariant:'2x'},
  {canvasPixels:200,activeVariant:'1x'}];
 const result=compare(off,on);
 assert.equal(result.valid,false);
 assert.ok(result.errors.some(e=>e.includes('Canvas-Auflösung oder LOD')));
});

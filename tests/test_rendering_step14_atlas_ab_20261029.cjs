'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {readFileSync,existsSync}=require('node:fs');
const {join}=require('node:path'),{spawnSync}=require('node:child_process');
const root=join(__dirname,'..');
const read=name=>readFileSync(join(root,name),'utf8');

test('profiler is opt-in and counts timing and number of sprite draws',()=>{
 const sandbox={window:{},performance:{now:()=>100}};
 vm.runInNewContext(read('render-benchmark-profiler.js'),sandbox);
 const p=sandbox.window.VedrasBenchmarkProfiler;
 p.record('tile.bakeWallMs',10);
 assert.equal(Object.keys(p.snapshot().entries).length,0);
 p.enable(true);p.record('tile.bakeWallMs',11);
 p.record('tile.bakeWallMs',61);p.count('atlas.attempt',3);
 assert.equal(p.snapshot().entries['tile.bakeWallMs'].count,2);
 assert.equal(p.snapshot().entries['tile.bakeWallMs'].totalMs,72);
 assert.equal(p.snapshot().entries['tile.bakeWallMs'].over50ms,1);
 assert.equal(p.snapshot().entries['atlas.attempt'].count,3);
 p.reset();assert.equal(Object.keys(p.snapshot().entries).length,0);
});
test('runtime enables Atlas forced ON/OFF regardless of dense-scene auto bypass',()=>{
 const app=read('app.js');
 assert.match(app,/benchmarkAtlasMode='auto'/);
 assert.match(app,/benchmarkAtlasMode==='on'\|\|/);
 assert.match(app,/benchmarkAtlasMode==='auto'&&!/);
 assert.match(app,/setBenchmarkAtlasMode:mode=>/);
 assert.match(app,/!\['auto','on','off'\]\.includes\(mode\)/);
 assert.match(app,/count\(attemptAtlas\?'atlas\.attempt':'atlas\.bypass'\)/);
 assert.match(app,/if\(usedAtlas\)/);
});
test('step14 uses fresh browser profiles for ON and OFF, same scene and gesture',()=>{
 const script=read('scripts/rendering-step14-ab.mjs');
 assert.match(script,/for\(const scenario of \['pan','zoom','cold-zoom'\]\)/);
 assert.match(script,/const on=await runMode\(o,'on'\)/);
 assert.match(script,/const off=await runMode\(o,'off'\)/);
 assert.match(script,/engine=await launch\(opts,/);
 assert.match(script,/setCamera\(c,\{q:0,r:0\},\.70\)/);
 assert.match(script,/const metrics=await phase\(c,kind,quality,opts\.duration\)/);
 assert.match(script,/v\.invalidateTerrain\('all'\)/);
 assert.match(script,/atlasSwitch\?\.atlas\?\.active/);
 assert.match(script,/validStart&&p\.readyAfter/);
});
test('measurement covers GPU, ImagePool, main-thread CDP time and explicit limits',()=>{
 const runner=read('scripts/rendering-step13-browser.mjs');
 const pool=read('asset-image-pool.js');
 const app=read('app.js');
 assert.match(runner,/mainThreadTaskUtilizationPercent/);
 assert.match(runner,/ProfilerDifference|profilerDifference/);
 assert.match(runner,/resourceLoads/);
 assert.match(runner,/gpuTerrainEstimateBytes/);
 assert.match(runner,/imagePoolDecodedBytes/);
 assert.match(pool,/images\.resampleMs/);
 assert.match(pool,/images\.loadWallMs/);
 assert.match(app,/tile\.groundRoadsMs/);
 assert.match(app,/tile\.sceneryMs/);
 assert.match(app,/tile\.bakeWallMs/);
 assert.match(app,/sprites\.drawMs/);
 assert.match(app,/shadows\.drawMs/);
});
test('one-click integration includes paired artifacts and does not overwrite step13 evidence',()=>{
 assert.ok(existsSync(join(root,'START_ATLAS_AB_WINDOWS.cmd')));
 const launcher=read('scripts/rendering-step14-auto.mjs');
 const pack=read('scripts/rendering-step14-pack.py');
 assert.match(launcher,/VEDRAS_SILENT_HTTP:'1'/);
 assert.match(launcher,/rendering-step14-ab\.mjs/);
 assert.match(launcher,/rendering-step14-pack\.py/);
 assert.match(launcher,/rendering-step14-ab/);
 assert.match(pack,/rglob\("\*"\)/);
 assert.match(pack,/step14-atlas-ab\.zip/);
});
test('Step 14 CLI help starts without launching Chrome',()=>{
 const r=spawnSync(process.execPath,[join(root,'scripts/rendering-step14-ab.mjs'),'--help'],
  {cwd:root,encoding:'utf8',timeout:10000});
 assert.equal(r.status,0,r.stderr);
 assert.match(r.stdout,/Usage:/);
});

'use strict';
/* node --test tests/test_rendering_step16a_audit_20261029.cjs */
const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const root=join(__dirname,'..');
const audit=readFileSync(join(root,'scripts/rendering-step16a-audit.mjs'),'utf8');
const control=readFileSync(join(root,'step16a-control.html'),'utf8');
const launcher=readFileSync(join(root,'scripts/rendering-step16a-auto.mjs'),'utf8');
function extract(name,next){
 const a=audit.indexOf('function '+name+'(');
 const b=audit.indexOf(next,a);
 assert.ok(a>=0&&b>a,'Missing pure helper '+name);
 return new Function(audit.slice(a,b)+';return '+name+';')();
}
const summarizeTrace=extract('summarizeTrace','\nfunction simplify(');
const simplify=extract('simplify','\nfunction cameraCondition(');
const cameraCondition=extract('cameraCondition','\nfunction buildDecision(');
const buildDecision=extract('buildDecision','\n// Runs in the actual editor');

test('isolated control serves ONLY the existing production tile compositor',()=>{
 assert.match(control,/src="world-tile-streamer\.js"/);
 assert.doesNotMatch(control,/src="app\.js"|src="asset-image-pool\.js"|src="autotile\.js"/);
 assert.match(audit,/source:null,maxTiles:64,maxPixels:26000000/);
 assert.match(audit,/requireScenery:true,lodSelector:\(\)=> 'mid'/);
 assert.match(audit,/raw\.seeded===16&&raw\.retained===16/);
});

test('Step16A explicitly rejects live scene mutations as warm camera performance',()=>{
 assert.match(audit,/const valid=quiet&&cameraCondition\(end\)/);
 assert.match(audit,/trace\.types\['tile\.invalidate'\]/);
 assert.match(audit,/trace\.types\['tile\.bake'\]/);
 assert.match(audit,/start\.imagePool\.ready!==end\.imagePool\.ready/);
 assert.match(audit,/start\.imagePool\.evicted!==end\.imagePool\.evicted/);
 assert.doesNotMatch(audit.slice(audit.indexOf('async function editorCameraProbe'),
  audit.indexOf('async function compositorOnlyProbe')),/invalidate\(|activateTileCamera\(/);
});

test('WorldTiles exact is a COUNT and accepts multiple ready tiles',()=>{
 const valid={active:true,pending:0,retryExhausted:0,progress:{
  exact:16,fallback:0,missing:0,provisional:0},coverage:1};
 assert.equal(cameraCondition(valid),true);
 assert.equal(cameraCondition({...valid,progress:{...valid.progress,exact:1}}),true);
 assert.equal(cameraCondition({...valid,progress:{...valid.progress,exact:0}}),false);
 assert.equal(cameraCondition({...valid,pending:1}),false);
 assert.equal(cameraCondition({...valid,progress:{...valid.progress,fallback:1}}),false);
 assert.equal(cameraCondition({...valid,progress:{...valid.progress,missing:1}}),false);
 assert.equal(cameraCondition({...valid,progress:{...valid.progress,provisional:1}}),false);
 assert.equal(cameraCondition({...valid,retryExhausted:1}),false);
 assert.equal(cameraCondition({...valid,coverage:0.99}),false);
});

test('cold camera audit still runs and records blockers when warm gate fails',()=>{
 assert.match(audit,/const blockers=quiet\?null:await c\.eval/);
 assert.match(audit,/classification=quiet\?'warm-candidate':'cold-diagnostic'/);
 assert.match(audit,/const startCpu=await measureMetrics\(c\)/);
 assert.match(audit,/await c\.eval\(\s*'\('\+editorCameraProbe\.toString\(\)/);
 assert.match(audit,/unreadyEditorCores:waiting\.length/);
 assert.doesNotMatch(audit,/SKIPPED – no stable fully ready source/);
 assert.doesNotMatch(audit,/if\(!quiet\)\{[\s\S]{0,650}?continue;/);
});

test('trace attribution acknowledges dropped events rather than guessing missing causes',()=>{
 const t=summarizeTrace({dropped:7,totalEvents:10,
  counts:{'tile.invalidate':4,'tile.bake':1},
  events:[{type:'tile.invalidate',detail:{reason:'image-ready-ground'}},
   {type:'asset.invalidate',detail:{reason:'image-ready-scenery'}},
   {type:'tile.bake',detail:{outcome:'fallback-complete'}}]});
 assert.equal(t.attributionComplete,false);
 assert.equal(t.invalidations['image-ready-ground'],1);
 assert.equal(t.assetEvents['image-ready-scenery'],1);
 assert.equal(t.bakes['fallback-complete'],1);
 assert.equal(t.types['tile.invalidate'],4);
});

test('memory auditor reports protected bytes independently from budget overrun',()=>{
 const s=simplify({world:{active:true,coverage:1,
  progress:{exact:1},pending:0},camera:{worldTileBakes:10},
  quality:{images:{limitBytes:100,protectedBytes:150,
   decodedBytes:190,overLimitBytes:90,resident:20,ready:15}}});
 assert.equal(s.imagePool.protectedBytes,150);
 assert.equal(s.imagePool.limitBytes,100);
 assert.equal(s.imagePool.overLimitBytes,90);
 assert.equal(s.bakes,10);
});

test('even a fast isolated compositor does not authorize a renderer rewrite',()=>{
 const r=buildDecision({control:{valid:true},
  real:[{kind:'preparation',ready:false},
   {kind:'warm-pan',valid:false,start:{imagePool:{
    protectedBytes:150,limitBytes:100}}}]});
 assert.equal(r.status,'INSUFFICIENT_REAL_WARM_EVIDENCE');
 assert.equal(r.rendererRewriteRecommended,false);
 assert.match(r.blockers.join(' '),/Protected decoded image bytes/);
});

test('fully valid warm pan AND zoom plus valid control are required',()=>{
 const r=buildDecision({control:{valid:true},
  real:[{kind:'preparation',ready:true},
   {kind:'warm-pan',valid:true,start:{imagePool:{
    protectedBytes:50,limitBytes:100}}},
   {kind:'warm-zoom',valid:true,start:{imagePool:{
    protectedBytes:50,limitBytes:100}}}]});
 assert.equal(r.status,'REAL_WARM_MEASURED');
 const invalid=buildDecision({control:{valid:false},
  real:[{kind:'warm-pan',valid:true,start:{imagePool:{}}}]});
 assert.equal(invalid.status,'INSUFFICIENT_REAL_WARM_EVIDENCE');
});

test('launcher has a private server, no GitHub Actions, fixed artifact directory',()=>{
 assert.match(launcher,/VEDRAS_PORT:'0'/);
 assert.match(launcher,/VEDRAS_NO_BROWSER:'1'/);
 assert.match(launcher,/rendering-step16a-audit\.mjs/);
 assert.match(launcher,/artifacts\/rendering-step16a-audit/);
 assert.doesNotMatch(launcher,/git push|workflow_dispatch|npm install/);
});

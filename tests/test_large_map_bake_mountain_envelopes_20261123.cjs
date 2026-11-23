'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Audit=require('../large-map-bake-mountain-envelope-audit.js');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(
 path.join(__dirname,'../mountain.js'),'utf8'),context);
const mountains=context.window.VedrasMountains;
const plan={schema:'vedras-geography-bake-plan-v1',
 stage:'plan-only',rasterized:false,readyForViewer:false,
 source:{version:'geography-v2.1.2',seed:'mountain-audit-proof',
  width:10,height:10,originQ:0,originR:0,cells:100},
 tileCount:1,tiles:[{id:'0,0',x:0,y:0,size:512}]};
const pathName='assets/nature/berg_01.png';
const relPath=pathName.slice(7);
const asset={category:'nature',path:pathName,relPath};
const baseMeta={kind:'mountain',id:'audit_original_mountain',
 logicalWidth:360,anchor:{x:.5,y:.67},artStatus:'candidate'};
const instance=(q,r,opts={})=>({
 assetPath:pathName,assetId:baseMeta.id,
 width:opts.width??360,q,r,chainId:opts.chainId??'geography_0',
 radius:1,coreRadius:0,mode:'chain',
 source:'geography-scenery-preview'
});
const mplan=instances=>({
 schema:'vedras-geography-scenery-source-v1',
 stage:'original-mountain-placement-preflight',
 rasterized:false,complete:false,readyForViewer:false,
 worldHexes:100,worldSource:{version:plan.source.version,
 seed:plan.source.seed,width:10,height:10,originQ:0,originR:0},
 natureCatalogRevision:11,instances
});
function fixture({
 instances=[instance(3,1),instance(4,1)],
 width=360,imgWidth=600,imgHeight=240,
 planData=plan,mountainPlan,natureCatalog,assets=[asset],
 loadImage
}={}){
 const meta={...baseMeta,logicalWidth:width};
 const cat=natureCatalog||{revision:11,entries:{[relPath]:meta}};
 const source=mountainPlan||mplan(instances.map(m=>({...m,width})));
 const loads=[];
 const loader=loadImage|| (async a=>{
  loads.push(a.path);return {img:{naturalWidth:imgWidth,naturalHeight:imgHeight}};
 });
 const audit=Audit.create({plan:planData,mountainPlan:source,
  natureCatalog:cat,assets,loadImage:loader,mountains});
 return {audit,loads};
}
test('original mountain image aspect + editor tight envelope accepts valid chain',async()=>{
 const x=fixture();
 const r=await x.audit.audit();
 assert.equal(r.schema,'vedras-geography-mountain-envelope-audit-v1');
 assert.equal(r.stage,'original-mountain-editor-envelope-audit');
 assert.equal(r.statistics.mountains,2);
 assert.equal(r.statistics.decodedOriginalPngs,1);
 assert.equal(r.statistics.candidateArtwork,2);
 assert.equal(r.statistics.sharedChainTooCrowded,0);
 assert.equal(r.statistics.coreOverlaps,0);
 assert.equal(r.statistics.interChainInfluenceConflicts,0);
 assert.equal(r.statistics.testedSharedChainEnvelopes,1);
 assert.equal(r.matchesOriginalCandidateSpacing,true);
 assert.equal(r.actualAlphaOverlapMeasured,false);
 assert.equal(r.rasterized,false);
 assert.equal(r.readyForViewer,false);
 assert.equal(r.complete,false);
 assert.deepEqual(x.loads,[pathName]);
});
test('source would be REJECTED by editor tight spacing when uncropped original width is large',async()=>{
 const x=fixture({width:720});
 const r=await x.audit.audit();
 assert.equal(r.statistics.sharedChainTooCrowded,1);
 assert.equal(r.matchesOriginalCandidateSpacing,false);
 assert.equal(r.issues.length,1);
 assert.equal(r.issues[0].kind,'chain-envelope-too-crowded');
 const actual=mountains.visualOverlap(
  {q:3,r:1},{q:4,r:1},
  {width:720,aspect:.4},{width:720,aspect:.4});
 assert(Math.abs(actual-r.issues[0].envelopeOverlap)<.0001);
 assert(actual>mountains.SPACING.tight);
});
test('disjoint chains may not share original influence cells',async()=>{
 const r=await fixture({instances:[
  instance(3,1,{chainId:'geography_0'}),
  instance(4,1,{chainId:'geography_1'})]}).audit.audit();
 assert.equal(r.statistics.coreOverlaps,0);
 assert.equal(r.statistics.interChainInfluenceConflicts,1);
 assert.equal(r.matchesOriginalCandidateSpacing,false);
 assert(r.issues.some(x=>x.kind==='inter-chain-influence'));
});
test('shared core and invalid repeated placement are counted exactly once per pair',async()=>{
 const r=await fixture({instances:[
  instance(3,1),instance(3,1)]}).audit.audit();
 assert.equal(r.statistics.coreOverlaps,1);
 assert.equal(r.statistics.sharedChainTooCrowded,1);
 assert.equal(r.matchesOriginalCandidateSpacing,false);
 assert(r.issues.some(x=>x.kind==='core-overlap'));
});
test('unphysically sourced mountain PNGs and completed plans reject closed',async()=>{
 assert.throws(()=>fixture({assets:[]}),/physische Originalgrafik/);
 assert.throws(()=>fixture({planData:{...plan,readyForViewer:true}}),
  /unveränderte Originalpläne/);
 assert.throws(()=>fixture({mountainPlan:{...mplan([instance(3,1)]),
  complete:true}}),/unveränderte Originalpläne/);
 assert.throws(()=>fixture({natureCatalog:{revision:12,entries:{
  [relPath]:baseMeta}}}),/unveränderte Originalpläne/);
 const r=fixture({loadImage:async()=>{throw Error('PNG decode failure');}});
 await assert.rejects(r.audit.audit(),/PNG decode failure/);
 const missing=fixture({loadImage:async()=>({img:{naturalWidth:0,naturalHeight:0}})});
 await assert.rejects(missing.audit.audit(),/nicht dekodiert/);
});
test('original mountain source geometry audit is opt-in and marks no atlas ready',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8');
 const lab=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 const ci=fs.readFileSync(path.join(__dirname,
  '../.github/workflows/geography-large-bake-ci.yml'),'utf8');
 for(const s of ['src="large-map-bake-mountain-envelope-audit.js',
  'id="auditMountainEnvelopes"','id="mountainEnvelopeReport"'])
  assert(html.includes(s),s);
 assert.match(lab,/MOUNTAIN_ENVELOPES\.create/);
 assert.match(lab,/original-mountain-editor-envelope-audit/);
 assert(ci.includes('/large-map-bake-mountain-envelope-audit.js'));
 assert(ci.includes('/tests/test_large_map_bake_mountain_envelopes_20261123.cjs'));
});

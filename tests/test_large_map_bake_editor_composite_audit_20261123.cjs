'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const A=require('../large-map-bake-editor-composite-audit.js');
const pixels=x=>new Uint8ClampedArray(x);
test('full RGBA paired audit records exact channel, delta and shadow transition partition',()=>{
 // 4 pixels: first unchanged, second RGB only one-byte,
 // third gets shadow-specific alpha, fourth RGB+alpha large difference.
 const wb=pixels([0,0,0,0,10,20,30,255,20,20,20,128,40,50,60,200]);
 const eb=pixels([0,0,0,0,11,20,30,255,20,20,20,128,40,50,60,200]);
 const ws=pixels([0,0,0,0,10,20,30,255,20,20,20,100,41,50,60,201]);
 const es=pixels([0,0,0,0,11,20,30,255,20,20,20,90,100,50,60,255]);
 const out=A.paired({width:2,height:2,worldBare:wb,editorBare:eb,
  worldShaded:ws,editorShaded:es,columns:2,rows:2});
 assert.equal(out.bare.different,1);
 assert.equal(out.bare.channels.r,1);
 assert.equal(out.bare.maxDeltaBins['1'],1);
 assert.equal(out.shaded.different,3);
 assert.equal(out.shaded.channels.a,2);
 assert.equal(out.shaded.maxDeltaBins['1'],1);
 assert.equal(out.shaded.maxDeltaBins['5-16'],1);
 assert.equal(out.shaded.maxDeltaBins['17-64'],1);
 assert.equal(out.shaded.differentRGBAndAlpha,1);
 assert.equal(out.shaded.differentRGBOnly,1);
 assert.equal(out.shaded.differentAlphaOnly,1);
 assert.deepEqual(out.shaded.bbox,{left:0,top:0,right:1,bottom:1});
 assert.equal(out.transitions.introduced,2);
 assert.equal(out.transitions.persistent,1);
 assert.equal(out.transitions.neverDifferent,1);
 assert.equal(out.transitions.worldShadeTouched,2);
 assert.equal(out.transitions.editorShadeTouched,2);
 assert.equal(out.transitions.shadeTouchedBoth,2);
 assert.equal(out.transitions.shadeTouchedNeither,2);
 assert.equal(out.transitions.shadedMismatchOnTouched,2);
 assert.equal(out.transitions.shadedMismatchOnUntouched,1);
 assert.equal(out.transitions.backgroundOnlyMismatch,1);
 assert.equal(out.parityPassed,false);
 assert.equal(out.complete,false);
 assert.equal(out.readyForViewer,false);
});
test('identical images yield zero differences and true isolation-level parity only',()=>{
 const z=new Uint8ClampedArray(64);
 const r=A.paired({width:4,height:4,worldBare:z,editorBare:z,
  worldShaded:z,editorShaded:z});
 assert.equal(r.parityPassed,true);
 assert.equal(r.bare.different,0);
 assert.equal(r.shaded.different,0);
 assert.equal(r.transitions.neverDifferent,16);
 assert.equal(r.shaded.heatmap.counts.reduce((s,x)=>s+x,0),0);
 assert.equal(r.readyForViewer,false);
});
test('invalid images, bounds, histogram sizes and implicit color conversions fail closed',()=>{
 const z=new Uint8ClampedArray(16);
 assert.throws(()=>A.compare({width:2,height:2,world:z,editor:[]}),/Uint8ClampedArray/);
 assert.throws(()=>A.compare({width:2,height:2,world:z,editor:z,columns:0}),/Heatmap/);
 assert.throws(()=>A.compare({width:2,height:2,world:z,editor:z,rows:65}),/Heatmap/);
 assert.throws(()=>A.compare({width:10000,height:10000,world:z,editor:z}),/begrenzt/);
 assert.throws(()=>A.paired({width:2,height:2,worldBare:z,editorBare:z,
  worldShaded:z,editorShaded:new Uint8ClampedArray(4)}),/Uint8ClampedArray/);
});
test('Firefox source-derived multi-object audit keeps release gates and true neighbor seam',()=>{
 const t=fs.readFileSync(path.join(__dirname,'automated_browser_geography_joint_scenery_20261123.cjs'),'utf8');
 assert(t.includes('const RGBA=window.VedrasEditorCompositeAudit'));
 assert(t.includes('RGBA.paired({width:1920,height:1632'));
 assert(t.includes('EDITOR_COMPOSITE_RGBA_AUDIT'));
 assert(t.includes('result.compositeSeams.withShadow.different,0'));
 const io=fs.readFileSync(path.join(__dirname,'../.github/workflows/geography-io-regression.yml'),'utf8');
 assert(io.includes('large-map-bake-editor-composite-audit.js'));
 assert(io.includes('test-artifacts/'));
});

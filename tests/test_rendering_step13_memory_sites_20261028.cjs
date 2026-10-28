'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const {pathToFileURL}=require('node:url');
const root=join(__dirname,'..');
const source=readFileSync(join(root,'asset-image-pool.js'),'utf8');

test('image pool evicts unprotected recent 1024px previews under pressure',async()=>{
 class MockImage{
  constructor(){this.naturalWidth=0;this.naturalHeight=0;}
  set src(value){this._src=value;queueMicrotask(()=>{
   this.naturalWidth=1024;this.naturalHeight=1024;this.onload?.();
  });}
 }
 const sandbox={window:{},Image:MockImage,Date,Promise,console};
 vm.runInNewContext(source,sandbox,{filename:'asset-image-pool.js'});
 const pool=sandbox.window.VedrasImagePool.create({
  parallel:2,maxBytes:8*1024*1024,protectMs:300000
 });
 const assets=Array.from({length:7},(_,i)=>({
  path:'assets/nature/test_'+i+'.png',url:'fake://'+i,category:'nature'
 }));
 pool.protect([assets[0].path]);
 await Promise.all(assets.map(a=>pool.ensure(a)));
 const stats=pool.report();
 assert.ok(stats.evicted>=5,'old idle decoded previews must be removed');
 assert.ok(stats.decodedBytes<=stats.limitBytes,JSON.stringify(stats));
 assert.ok(assets[0].img?.naturalWidth>0,'protected visible image must survive');
 assert.equal(stats.overLimitBytes,0);
});
test('fixed camera positions reflect actual reference biomes and are unique',async()=>{
 const {cameraSites}=await import(pathToFileURL(join(root,'scripts/rendering-step13-sites.mjs')).href);
 const scene=JSON.parse(readFileSync(join(root,'artifacts/rendering-step13/vedras_scene.json'),'utf8'));
 const sites=cameraSites(scene);
 assert.deepEqual(sites.map(s=>s.label),
  ['center','dense-forest','coast','mountains','moor','open-water']);
 assert.equal(new Set(sites.map(s=>s.q+','+s.r)).size,6);
 for(const site of sites){
  assert.equal(site.terrain,scene.terrainTypeByHex[site.q+','+site.r]);
  assert.equal(typeof site.q,'number');
 }
 assert.equal(sites.find(s=>s.label==='dense-forest').forestClass,'dense_forest');
 assert.equal(sites.find(s=>s.label==='moor').terrain,'moor');
});
test('new benchmark never publishes unready terrain baseline as a success',()=>{
 const source=readFileSync(join(root,'scripts/rendering-step13-browser.mjs'),'utf8');
 assert.match(source,/w\.coverage<\.999/);
 assert.match(source,/artwork-not-ready/);
 assert.match(source,/if\(recordReadiness\(run,quality,'baseline',baseline\)\)/);
 assert.match(source,/if\(recordReadiness\(run,quality,kind,steady\)\)/);
 assert.match(source,/for\(const site of run\.import\?\.sites\|\|\[\]\)/);
 assert.match(source,/setControls\(c,quality,false\)/);
});

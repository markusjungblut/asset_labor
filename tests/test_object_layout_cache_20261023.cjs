'use strict';
/* Run with node --test tests/test_object_layout_cache_20261023.cjs */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');

function cache(){
 const sandbox={window:{},performance:{now:()=>performance.now()}};
 vm.runInNewContext(read('object-layout-cache.js'),sandbox);
 return sandbox.window.VedrasObjectLayoutCache.create();
}
const near=(o,view)=>o.x>=view.x&&o.x<=view.x+view.width;

test('pan and zoom reuse exact scene objects without rerunning placement/relief builder',()=>{
 const c=cache();let builds=0;
 const builder=()=>{builds++;return [{x:20,name:'tree'},{x:220,name:'rock'}];};
 const v1=c.query({x:0,width:100},builder,near);
 const v2=c.query({x:200,width:100},builder,near);
 assert.equal(builds,1);
 assert.equal(v1.rebuilt,true);
 assert.equal(v2.rebuilt,false);
 assert.equal(v1.objects[0].name,'tree');
 assert.equal(v2.objects[0].name,'rock');
 assert.equal(c.stats().hits,1);
 assert.equal(v1.objects[0],c.query({x:0,width:100},builder,near).objects[0]);
});

test('editing the scene invalidates layout and rebuilds with new world positions',()=>{
 const c=cache();let x=40,builds=0;
 const builder=()=>{builds++;return [{x}];};
 c.query({x:0,width:100},builder,near);
 x=500;
 assert.equal(c.query({x:0,width:100},builder,near).objects.length,1,
  'a camera frame cannot implicitly alter a cached static scene');
 c.invalidate();
 assert.equal(c.query({x:0,width:100},builder,near).objects.length,0);
 assert.equal(c.query({x:450,width:100},builder,near).objects[0].x,500);
 assert.equal(builds,2);
});

test('cache never keeps a partially failed builder as a valid scene',()=>{
 const c=cache();let attempts=0;
 const builder=()=>{if(++attempts===1)throw Error('image not ready');return [{x:20}];};
 assert.throws(()=>c.query({x:0,width:100},builder,near),/image not ready/);
 assert.equal(c.query({x:0,width:100},builder,near).objects.length,1);
 assert.equal(c.stats().builds,1);
 assert.equal(attempts,2);
});

test('a build must return an object array, not an unresolved promise',()=>{
 const c=cache();
 assert.throws(()=>c.query({x:0,width:100},()=>({}),near),/array/);
 assert.equal(c.stats().builds,0);
});

test('app wires camera-independent layout and invalidates on scene or asset edits',()=>{
 const app=read('app.js'),index=read('index.html'),server=read('server.py');
 assert.match(app,/objectLayoutCache\.query\(view,buildSpriteLayout,spriteInViewport\)/);
 assert.match(app,/function persistScene\(\)\{invalidateSpriteLayout\(\)/);
 assert.match(app,/function invalidateTerrain\(scope='all'\)\{\s*invalidateSpriteLayout\(\)/);
 assert.match(app,/if\(\['nature','buildings','units'\]\.includes\(a\.category\)\)invalidateSpriteLayout\(\)/);
 assert.match(app,/window\.addEventListener\('vedras:nature-catalog-changed',[\s\S]*?invalidateSpriteLayout\(\)/);
 assert.match(app,/function buildSpriteLayout\(\)\{[\s\S]*?genericObjects\(\)[\s\S]*?displayGroundY/);
 assert.match(index,/object-layout-cache\.js\?v=0\.1\.0/);
 assert.ok(index.indexOf('object-layout-cache.js')<index.indexOf('app.js'));
 assert.match(server,/VERSION = '0\.15\.3'/);
});

test('object profiler exposes layout/occlusion/sort/ground-shadows/sprites separately',()=>{
 const app=read('app.js'),index=read('index.html');
 for(const field of ['layoutMs','occlusionMs','sortMs','shadowPassMs','spritePassMs'])
  assert.ok(app.includes(field),field);
 assert.match(app,/window\.__vedrasObjectProfile=profile/);
 assert.match(app,/window\.__vedrasRenderProfile=\{[\s\S]*?object:objProfile/);
 assert.match(index,/id="objectPerfStats"/);
});

test('sprite fixes and Python 3.8 compatibility survive v0.15.3',()=>{
 const app=read('app.js');
 const server=read('server.py');
 assert.match(app,/spriteAtlas\?\.beginFrame\(\)/);
 assert.match(app,/finally\{spriteAtlas\?\.endFrame\(\);?\}/);
 assert.ok(server.includes("key = parsed.path[len(prefix):]"));
 assert.ok(!server.includes('.removeprefix('));
});

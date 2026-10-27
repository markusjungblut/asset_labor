'use strict';
/* Run: node --test tests/test_terrain_frame_cache_v017_20261023.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
function moduleOf(name,api){
 const sandbox={window:{},performance:{now:()=>100}};
 vm.runInNewContext(read(name),sandbox);
 return sandbox.window[api];
}
const C=()=>moduleOf('chunks.js','VedrasChunks');

test('scene memo computes each expensive signature once and reuses it across pans',()=>{
 const memo=moduleOf('frame-preparation-cache.js','VedrasFrameMemo').create();
 let builds=0;
 const first=memo.use('terrain','fast|coarse',()=>({name:'graph',n:++builds}));
 const second=memo.use('terrain','fast|coarse',()=>{throw Error('should not rebuild')});
 assert.equal(first,second);
 assert.equal(builds,1);
 assert.equal(memo.stats().hits,1);
 assert.equal(memo.stats().misses,1);
 memo.invalidate();
 assert.equal(memo.use('terrain','fast|coarse',()=>({n:++builds})).n,2);
});

test('memo revision and variant keys invalidate only relevant scene preparation',()=>{
 const memo=moduleOf('frame-preparation-cache.js','VedrasFrameMemo').create();
 let builds=0;
 memo.use('river','scene',()=>++builds);
 memo.use('road','scene',()=>++builds);
 memo.use('river','scene',()=>++builds);
 assert.equal(builds,2);
 memo.use('river','changed',()=>++builds);
 assert.equal(builds,3);
 assert.equal(memo.stats().entries,2);
 memo.invalidate();
 assert.equal(memo.stats().entries,0);
 assert.equal(memo.use('road','scene',()=>++builds),4);
});

test('memo builder errors do not cache an incomplete autotile graph',()=>{
 const memo=moduleOf('frame-preparation-cache.js','VedrasFrameMemo').create();
 let calls=0;
 assert.throws(()=>memo.use('terrain','x',()=>{calls++;throw Error('worker')}));
 assert.equal(memo.use('terrain','x',()=>{calls++;return 'ok'}),'ok');
 assert.equal(calls,2);
});

function naiveVisible(bounds,cells,size=512){
 const left=Math.floor(bounds.x/size),right=Math.floor((bounds.x+bounds.width)/size);
 const top=Math.floor(bounds.y/size),bottom=Math.floor((bounds.y+bounds.height)/size);
 const out=[];
 for(let cy=top;cy<=Math.min(bottom,top+60);cy++)
 for(let cx=left;cx<=Math.min(right,left+60);cx++){
  const t={x:cx*size,y:cy*size,size,id:cx+','+cy};
  if(cells.some(c=>{
   const p={x:256*(c.q+c.r/2),y:1.5*(256/Math.sqrt(3))*c.r};
   return p.x>=t.x-150&&p.x<t.x+size+150&&p.y>=t.y-150&&p.y<t.y+size+150;
  }))out.push(t);
 }
 const mx=bounds.x+bounds.width/2,my=bounds.y+bounds.height/2;
 return out.sort((a,b)=>((a.x+a.size/2-mx)**2+(a.y+a.size/2-my)**2)-
   ((b.x+b.size/2-mx)**2+(b.y+b.size/2-my)**2)).map(x=>x.id);
}
test('chunk occupancy grid produces exactly the former visible tiles at corners and negative coordinates',()=>{
 const c=C();
 const world=[];
 for(let r=-7;r<=7;r++)for(let q=-7;q<=7;q++)
  if(Math.abs(q+r)<=7)world.push({q,r});
 world.push({q:-.14,r:3.7},{q:0.5,r:-.8});
 for(const size of [256,512,1024]){
  for(const [x,y,w,h] of [[-2450,-1700,820,700],[0,0,600,600],
   [300,-80,1300,1200],[-190,340,150,200],[-512,-512,512,512],
   [101,-2000,3500,3200]]){
   const view={x,y,width:w,height:h};
   assert.deepEqual(Array.from(c.visible(view,world,size).map(t=>t.id)),
    naiveVisible(view,world,size));
  }
 }
 assert.ok(c.spatialStats().hits>0,'multiple frame queries reuse position index');
});

test('geometry cache can be invalidated after a modified world position',()=>{
 const c=C(),cells=[{q:0,r:0}],view={x:-200,y:-200,width:400,height:400};
 assert.ok(c.visible(view,cells).length>0);
 cells[0].q=30;
 c.invalidateGeometry(cells);
 assert.equal(c.visible(view,cells).length,0);
});

test('neighbor halo includes exactly the previous source tiles',()=>{
 const c=C();
 const cells=Array.from({length:90},(_,i)=>({q:i-45,r:(i%9)-4}));
 const t=c.tile(-2,0),halo=470;
 const naive=cells.filter(p=>{
  const pos=c.worldPos(p);
  return pos.x>=t.x-halo&&pos.x<=t.x+t.size+halo&&
   pos.y>=t.y-halo&&pos.y<=t.y+t.size+halo;
 });
 assert.deepEqual(Array.from(c.neighbors(t,cells,halo).map(o=>o.q)),
  naive.map(o=>o.q));
});

test('terrain and rivers use revision memo and background compositor with worker chunk freshness',()=>{
 const app=read('app.js'),html=read('index.html'),server=read('server.py');
 assert.match(app,/frameMemo\.use\('terrain'/);
 assert.match(app,/frameMemo\.use\('shores'/);
 assert.match(app,/frameMemo\.use\('road-prep'/);
 assert.match(app,/frameMemo\.use\('routes'/);
 assert.match(app,/backgroundScene\.paint\(/);
 for(const prefix of ['terrainChunks','roadChunks','shorelineChunks','riverChunks'])
  assert.ok(app.includes(prefix+'.stats().visibleRevision'),prefix+' invalidation');
 assert.match(app,/window\.__vedrasBackgroundProfile=backgroundProfile/);
 assert.match(app,/finalRendering\|\|state\.view!=='map'\|\|gpuFrame/);
 assert.match(app,/frameMemo\.invalidate\(\);backgroundScene\.clear\(\)/);
 assert.match(html,/frame-preparation-cache\.js\?v=0\.1\.0/);
 assert.ok(html.indexOf('frame-preparation-cache.js')<html.indexOf('app.js'));
 assert.match(html,/id="backgroundPerfStats"/);
 assert.match(server,/VERSION = '0\.\d+\.\d+'/);
 assert.match(server,/key = parsed\.path\[len\(prefix\):\]/);
 assert.doesNotMatch(server,/\.removeprefix\(/);
});

test('bridge SVG loading and terrain image decoding cannot freeze the cached background',()=>{
 const app=read('app.js');
 assert.match(app,/requestDraw:\(\)=>\{[\s\S]*?backgroundScene\.clear\(\);requestDraw\(\);/);
 assert.match(app,/const affectsGround=isTerrain\(a\)\|\|a\.category==='shorelines'/);
 assert.match(app,/if\(affectsGround\)\{frameMemo\.invalidate\(\);backgroundScene\.clear\(\);\s*spriteBatchGroundDirty=true;\}/);
 assert.match(app,/if\(\['nature','buildings','units'\]\.includes\(a\.category\)\)\{\s*spriteAssetBatchDirty=true;pendingSpriteAssetPaths\.add\(a\.path\)/);
 assert.match(app,/invalidateSpriteLayout\(worldTilesForAssetPaths\(paths\)\)/);
});
test('detailed terrain profiler partitions expensive cold renders without corrupting frame timings',()=>{
 const app=read('app.js'),html=read('index.html');
 assert.match(app,/window\.__vedrasGroundDetail=\{/);
 for(const field of ['preparationMs','rasterMs','forestMs','shoreMs','diagnosticsMs'])
  assert.ok(app.includes(field),field);
 assert.match(app,/window\.__vedrasRoadPreparation=\{ms:roadPrepMs/);
 assert.match(app,/terrainDetail:window\.__vedrasGroundDetail,roadsDetail:window\.__vedrasRoadPreparation/);
 assert.match(html,/id="terrainDetailStats"/);
});
test('existing final PNG renderer and GPU terrain path are not replaced by cached preview',()=>{
 const app=read('app.js');
 assert.match(app,/const interactiveBackground=finalRendering/);
 assert.match(app,/if\(interactiveBackground\)\{\s*renderBackground\(\);/);
 assert.match(app,/if\(gpuFrame\)gpuTerrain\.end\(\)/);
 assert.match(app,/window\.VedrasTerrainWorker\.restart\(\)/);
 assert.match(app,/const blob=await new Promise\(\(resolve,reject\)=>canvas\.toBlob/);
});

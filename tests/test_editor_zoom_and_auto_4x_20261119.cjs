'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),
 app=fs.readFileSync(path.join(root,'app.js'),'utf8'),
 html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('cold camera primes missing assigned water and unassigned biome textures',()=>{
 const start=app.indexOf("let lastProtectedCameraSignature='';"),
  end=app.indexOf('\nfunction draw(){',start);
 assert.ok(start>0&&end>start);
 const src=app.slice(start,end);
 const water={path:'water.png',category:'terrain',kind:'water'},
  grass={path:'grass.png',category:'terrain',kind:'grassland'},
  coast={path:'shore.png',category:'shorelines'},
  tree={path:'tree.png',category:'nature'},
  hut={path:'hut.png',category:'buildings'};
 const requests=[],protectedSets=[];
 const win={};
 const context={window:win,console,
  state:{panX:0,panY:0,zoom:1,sceneSize:37,
   hexTerrain:{'0,0':'water.png'},biomeTerrain:{},
   mountainInstances:[],natureInstances:[{q:0,r:0,assetPath:'tree.png'}],
   hexObject:{'1,0':{path:'hut.png'}}},
  frameMemo:{stats:()=>({revision:1})},
  W:700,H:560,HEX:256,R:147,
  warmCameraFootprint:null,worldCells:[
   {q:0,r:0,biome:'water'}, {q:1,r:0,biome:'plains'}],
  assets:[water,grass,coast,tree,hut],
  assetByPath:new Map([[water.path,water],[grass.path,grass],
   [tree.path,tree],[hut.path,hut]]),
  isTerrain:a=>a?.category==='terrain',
  typeOfAsset:a=>a?.kind,
  typeOfCell:c=>c.biome==='water'?'water':'grassland',
  fromScreen:(x,y)=>({x:x-350,y:y-280}),
  axialPos:(q,r)=>({x:q*256,y:r*221}),
  hash:()=>0,key:(q,r)=>q+','+r,
  imageForBiome:()=>null,
  imagePool:{ensure:a=>{requests.push(a.path);return Promise.resolve();},
   protect:set=>protectedSets.push([...set])},
 };
 vm.runInNewContext(src+'\nwindow.testProtect=protectCameraImagePool;',context);
 win.testProtect();
 assert.ok(requests.includes('water.png'),
  'unloaded authored water texture must be requested');
 assert.ok(requests.includes('grass.png'),
  'unloaded fallback terrain must be requested');
 for(const path of ['shore.png','tree.png','hut.png'])
  assert.ok(requests.includes(path),path+' should load in cold camera');
 assert.ok(protectedSets[0].includes('water.png'));
 assert.ok(protectedSets[0].includes('grass.png'));
 const before=requests.length;
 win.testProtect();
 assert.equal(requests.length,before,'unchanged camera is not requeued');
});
test('fast camera explicitly primes terrain, shore, river and road layers',()=>{
 const start=app.indexOf('function fastRender(){'),
  end=app.indexOf('// Step 4: camera-only',start);
 assert.ok(start>0&&end>start);
 const fast=app.slice(start,end);
 for(const layer of ['terrainChunks','shorelineChunks','riverChunks','roadChunks'])
  assert.ok(fast.includes(layer+'.prime(bounds'),layer);
 assert.ok(fast.includes('riverChunks.prime(bounds'));
 assert.ok(fast.includes('Wartet bei '));
 assert.ok(fast.includes('fastMissingCheckAt>1500'));
});
test('final map identity remains native-4x while editor preview is 2x',()=>{
 assert.ok(app.includes('function frozenFinalSceneKey()'));
 assert.ok(app.includes('frozenSceneKey({force4x:true})'));
 assert.ok(app.includes('const scene=frozenFinalSceneKey(),quality4=true,lod='));
 assert.ok(app.includes("state.quality='4';"));
 assert.ok(app.includes('state.quality=pose.editorQuality;'));
 assert.ok(app.includes('const scene=frozenFinalSceneKey(),manifest='));
 assert.ok(app.includes("const scene=frozenFinalSceneKey(),level='near';"));
 assert.ok(html.includes('4× automatisch'));
 assert.ok(html.includes('Eine separate 4×-Einstellung ist nicht erforderlich.'));
 assert.ok(!app.includes('Bitte Qualitätsstufe 4× auswählen. Die endgültige'));
});

test('exhausted terrain retry is rearmed only after leaving and re-entering viewport',()=>{
 const chunkSource=fs.readFileSync(path.join(root,'chunks.js'),'utf8');
 const i=chunkSource.indexOf('function updateStreaming(viewport,tiles,prefetch){'),
  end=chunkSource.indexOf('\n   // Used when the v0.17',i);
 assert.ok(i>0&&end>i,'view membership state machine found');
 const area=chunkSource.slice(i,end);
 const cleared=[];
 const sandbox={window:{},viewportWanted:new Set(),protectedIds:new Set(),
  failures:new Map([['0,0',{terminal:true}]]),
  forgetRetry:id=>{sandbox.failures.delete(id);cleared.push(id);},
  observe(){},queue:new Map(),visibleQueuedAt:new Map(),
  stats:{obsoleteVisibleDiscarded:0},lastFocus:null,cells:[],
  prefetchQueue:new Map(),prefetchWanted:new Set()};
 vm.runInNewContext(area+'\nwindow.testUpdate=updateStreaming;',sandbox);
 const view={x:-100,y:-100,width:200,height:200};
 sandbox.window.testUpdate(view,[],{enabled:false});
 assert.equal(cleared.length,0,'moving away does not retry anything');
 sandbox.window.testUpdate(view,[{id:'0,0'}],{enabled:false});
 assert.deepEqual(cleared,['0,0']);
 assert.equal(sandbox.failures.size,0);
 sandbox.failures.set('0,0',{terminal:true});
 sandbox.window.testUpdate(view,[{id:'0,0'}],{enabled:false});
 assert.equal(cleared.length,1,'same-viewport redraw cannot reset exhausted retries');
});

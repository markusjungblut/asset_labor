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
  coast={path:'shore.png',category:'shorelines'};
 const requests=[],protectedSets=[];
 const win={};
 const context={window:win,console,
  state:{panX:0,panY:0,zoom:1,sceneSize:37,
   hexTerrain:{'0,0':'water.png'},biomeTerrain:{},
   mountainInstances:[],natureInstances:[],hexObject:{}},
  frameMemo:{stats:()=>({revision:1})},
  W:700,H:560,HEX:256,R:147,
  warmCameraFootprint:null,worldCells:[
   {q:0,r:0,biome:'water'}, {q:1,r:0,biome:'plains'}],
  assets:[water,grass,coast],
  assetByPath:new Map([[water.path,water],[grass.path,grass]]),
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

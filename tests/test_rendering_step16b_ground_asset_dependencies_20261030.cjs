'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const chunkSource=fs.readFileSync(path.join(root,'chunks.js'),'utf8');
const window={};vm.runInNewContext(chunkSource,{window,console,Date,Promise,setTimeout,clearTimeout});
const begin=app.indexOf('function selectedGroundAssetChanges('),
 end=app.indexOf('const spriteAtlas=',begin);
assert.ok(begin>=0&&end>begin,'Production dependency functions must exist');
const production=app.slice(begin,end);
function harness({cells=[{q:0,r:0},{q:1,r:0}],before=['a.png','b.png'],
 after=before,assetType='grassland',relief=false,hasBaseline=true,
 wetBefore=[],wetAfter=wetBefore,riverPaths=[],river=false}={}){
 const choices=new Map(cells.map((c,i)=>[c.q+','+c.r,after[i]]));
 const original=hasBaseline?new Map(cells.map((c,i)=>[c.q+','+c.r,before[i]])):null;
 const originalWet=hasBaseline?new Map(cells.map((c,i)=>[
  c.q+','+c.r,wetBefore.includes(c.q+','+c.r)])):null;
 const wetNow=new Set(wetAfter);
 const code=[
  'let lastGroundMaterialPaths=original,lastGroundWetCells=originalWet,',
  'terrainAssetGroups=new Map();',
  'const worldCells=cells,state={relief:{enabled:relief},river,riverPaths},',
  'typeOfAsset=a=>a.type,',
  "isWaterTerrain=t=>t==='ocean'||t==='coastal_water',",
  'typeOfCell=c=>wetNow.has(c.q+","+c.r)?"coastal_water":"grassland",',
  'key=(q,r)=>q+","+r,',
  'imageForBiome=c=>{const p=choices.get(key(c.q,c.r));return p?{path:p}:null},',
  "baseImage=()=>({path:'fallback.png'}),",
  'axialPos=(q,r)=>({x:q*350+r*175,y:r*300});',
  production,
  'return {evaluate:selectedGroundAssetChanges,tiles:changedGroundTileIds,',
  'selection:()=>lastGroundMaterialPaths,groups:()=>terrainAssetGroups};'
 ].join('\n');
 return new Function('original','originalWet','cells','choices','wetNow',
  'relief','river','riverPaths','window',code)(
  original,originalWet,cells,choices,wetNow,relief,river,riverPaths,window);
}
const sorted=set=>[...set].sort();
test('changed pixels of a previously selected material invalidate its own cell',()=>{
 const h=harness();
 assert.deepEqual(sorted(h.evaluate({path:'a.png',type:'grassland',terrainCheck:{ok:true}})),
  ['0,0']);
 assert.equal(h.selection().get('0,0'),'a.png');
 assert.equal(h.groups(),null);
});
test('new variant reindex detects OTHER changed paths, not only newly decoded filename',()=>{
 const h=harness({before:['old.png','old.png'],after:['new.png','old.png']});
 const changed=h.evaluate({path:'third.png',type:'grassland',terrainCheck:{ok:true}});
 assert.deepEqual(sorted(changed),['0,0']);
});
test('unrelated already valid land image has zero affected cells',()=>{
 const h=harness();
 assert.deepEqual(sorted(h.evaluate({path:'other.png',type:'grassland',terrainCheck:{ok:true}})),[]);
});
test('multiple decode callbacks compare against previous planned selection',()=>{
 const h=harness({before:['old.png','old.png'],after:['new.png','old.png']});
 assert.deepEqual(sorted(h.evaluate({path:'new.png',type:'grassland',terrainCheck:{ok:true}})),['0,0']);
 assert.deepEqual(sorted(h.evaluate({path:'new.png',type:'grassland',terrainCheck:{ok:true}})),['0,0']);
});
test('forest floor remains conservatively global; stable water is local',()=>{
 const h=harness();
 assert.equal(h.evaluate({path:'x.png',type:'forest_floor',terrainCheck:{ok:true}}),null);
 assert.deepEqual(sorted(h.evaluate({path:'a.png',type:'coastal_water',terrainCheck:{ok:true}})),['0,0']);
});
test('relief, invalid graphics and unknown initial selection remain global',()=>{
 assert.equal(harness({relief:true}).evaluate({path:'a.png',type:'grassland',terrainCheck:{ok:true}}),null);
 assert.equal(harness().evaluate({path:'a.png',type:'grassland',terrainCheck:{ok:false}}),null);
 assert.equal(harness({hasBaseline:false}).evaluate({path:'a.png',type:'grassland',terrainCheck:{ok:true}}),null);
});
test('terrain tiles use actual chunk neighbor footprint, not only center cell',()=>{
 const h=harness();
 const chosen=h.tiles(new Set(['0,0']));
 assert.ok(chosen instanceof Set&&chosen.size>0);
 const neighboring=h.tiles(new Set(['1,0']));
 assert.ok(neighboring.size>0);
 assert.deepEqual(sorted(h.tiles(new Set())),[]);
 // Distinct far-away cells cannot cause completely identical dirty footprints.
 const far=harness({cells:[{q:0,r:0},{q:23,r:0}],before:['a','b']});
 const left=far.tiles(new Set(['0,0'])),right=far.tiles(new Set(['23,0']));
 assert.ok([...left].some(id=>!right.has(id)));
 assert.ok([...right].some(id=>!left.has(id)));
});
test('production callback performs localized invalidation or global fallback, not both',()=>{
 assert.match(app,/if\(groundIds===null\)worldTiles\?\.invalidate\('image-ready-ground'\);\s*else worldTiles\?\.invalidateTiles\(groundIds,'image-ready-ground-selective'\)/);
 assert.match(app,/const changed=isTerrain\(a\)\?selectedGroundAssetChanges\(a\):null/);
 assert.match(app,/lastGroundMaterialPaths=new Map\(worldCells\.map/);
 assert.match(app,/lastGroundMaterialPaths=null;groundAssetNeedsGlobal=true/);
 assert.match(app,/pendingGroundCells\.clear\(\);pendingGroundPaths\.clear\(\)/);
});

test('read-only material comparison cannot start or promote image-pool requests',()=>{
 const start=app.indexOf('function imageForBiome(c,ensureSource=true){'),
  end=app.indexOf('\nfunction effectiveBiome',start);
 assert.ok(start>=0&&end>start);
 let ensures=0;
 const asset={path:'test.png',ok:true};
 const make=new Function('state','key','useAsset','assetByPath',
  'isTerrainValid','typeOfAsset','typeOfCell','terrainAssetsByType','hash',
  app.slice(start,end)+'\nreturn imageForBiome;');
 const imageForBiome=make(
  {hexTerrain:{'0,0':'test.png'},biomeTerrain:{}},
  (q,r)=>q+','+r,
  ()=>{ensures++;return asset;},
  new Map([['test.png',asset]]),
  a=>a?.ok===true,
  ()=> 'grassland',
  ()=> 'grassland',
  ()=> [],
  ()=>0);
 const cell={q:0,r:0,biome:'plains'};
 assert.equal(imageForBiome(cell,false),asset);
 assert.equal(ensures,0);
 assert.equal(imageForBiome(cell),asset);
 assert.equal(ensures,1);
});

test('full biome lookup also remains read-only through baseBiomeOf and typeOfCell',()=>{
 const begin=app.indexOf('function baseBiomeOf(c,ensureSource=true){'),
  end=app.indexOf('let forestMemoSignature',begin);
 const selector=app.indexOf('function imageForBiome(c,ensureSource=true){'),
  selectorEnd=app.indexOf('\nfunction effectiveBiome',selector);
 assert.ok(begin>0&&end>begin&&selector>0&&selectorEnd>selector);
 const invalid={path:'invalid.png',type:'grassland',ok:false},
  valid={path:'valid.png',type:'grassland',ok:true};
 const assetByPath=new Map([['invalid.png',invalid],['valid.png',valid]]);
 let calls=0;
 const state={hexTerrain:{},biomeTerrain:{plains:'invalid.png'},baseBiomeByHex:{}},
  window={VedrasForest:{jungleAllowed:()=>false},VedrasCatalog:{terrainType:()=>null}},
  catalog={terrainTypes:[]};
 const code=[
  "const key=(q,r)=>q+','+r,",
  "typeOfAsset=a=>a?.type||null,isTerrainValid=a=>a?.ok===true,",
  "terrainAssetsByType=t=>t==='grassland'?[valid]:[],hash=()=>0,",
  "demoTypes={plains:'grassland'},",
  "useAsset=p=>{calls.increment();return assetByPath.get(p)||null};",
  app.slice(begin,end),app.slice(selector,selectorEnd),
  'return imageForBiome;'
 ].join('\n');
 const make=new Function('state','window','catalog','assetByPath','valid','calls',code);
 const counter={increment(){calls++}};
 const choose=make(state,window,catalog,assetByPath,valid,counter);
 const c={q:0,r:0,biome:'plains',terrainTypeId:'grassland'};
 assert.equal(choose(c,false),valid);
 assert.equal(calls,0,'no indirect imagePool.ensure calls');
 assert.equal(choose(c),valid);
 assert.ok(calls>0,'ordinary draw still primes its assets');
});


test('water pixel upgrade keeps local cores if land/water classes stay stable',()=>{
 const h=harness({before:['sea.png','land.png'],wetBefore:['0,0']});
 const changed=h.evaluate({path:'sea.png',type:'coastal_water',terrainCheck:{ok:true}});
 assert.deepEqual(sorted(changed),['0,0']);
});
test('newly valid water topology change forces global invalidation',()=>{
 const h=harness({before:['land.png','land.png'],after:['sea.png','land.png'],
  wetBefore:[],wetAfter:['0,0']});
 assert.equal(h.evaluate({path:'sea.png',type:'coastal_water',terrainCheck:{ok:true}}),null);
});
test('water type becomes land forces global invalidation even with same image path',()=>{
 const h=harness({before:['sea.png','land.png'],wetBefore:['0,0'],wetAfter:[]});
 assert.equal(h.evaluate({path:'sea.png',type:'coastal_water',terrainCheck:{ok:true}}),null);
});
test('water used at a river mouth invalidates the entire river course',()=>{
 const cells=Array.from({length:12},(_,q)=>({q,r:0}));
 const before=cells.map((_,i)=>i===11?'water.png':'land.png');
 const h=harness({cells,before,wetBefore:['11,0'],river:true,
  riverPaths:[{hexes:cells.map(c=>[c.q,c.r])}]});
 const changed=h.evaluate({path:'water.png',type:'coastal_water',terrainCheck:{ok:true}});
 assert.deepEqual(sorted(changed),sorted(new Set(cells.map(c=>c.q+',0'))));
 const dirty=h.tiles(changed),far=h.tiles(new Set(['11,0']));
 assert.ok(dirty.size>=far.size);
 assert.ok([...dirty].some(id=>!far.has(id)),'source water also dirties distant river segments');
});
test('unrelated water source keeps river cores untouched',()=>{
 const cells=Array.from({length:12},(_,q)=>({q,r:0}));
 const before=cells.map((_,i)=>i===11?'water.png':i===0?'other.png':'land.png');
 const h=harness({cells,before,wetBefore:['11,0'],river:true,
  riverPaths:[{hexes:cells.map(c=>[c.q,c.r])}]});
 assert.deepEqual(sorted(h.evaluate({path:'other.png',type:'coastal_water',terrainCheck:{ok:true}})),['0,0']);
});
test('unknown/malformed river source path retains safe global fallback',()=>{
 const h=harness({river:true,riverPaths:[{hexes:[[99,99]]}]});
 assert.equal(h.evaluate({path:'a.png',type:'grassland',terrainCheck:{ok:true}}),null);
});
test('river raster key includes image revision so same-size decoded pixels refresh',()=>{
 assert.match(app,/width,asset:water\?\.path,mtime:water\?\.mtime,\s*imageRevision:water\?\.imageRevision\|\|0,/);
});

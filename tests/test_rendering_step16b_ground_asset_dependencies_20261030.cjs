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
 after=before,assetType='grassland',relief=false,hasBaseline=true}={}){
 const choices=new Map(cells.map((c,i)=>[c.q+','+c.r,after[i]]));
 const original=hasBaseline?new Map(cells.map((c,i)=>[c.q+','+c.r,before[i]])):null;
 const code=[
  'let lastGroundMaterialPaths=original,terrainAssetGroups=new Map();',
  'const worldCells=cells,state={relief:{enabled:relief}},',
  'typeOfAsset=a=>a.type,',
  "isWaterTerrain=t=>t==='ocean'||t==='coastal_water',",
  'key=(q,r)=>q+","+r,',
  'imageForBiome=c=>{const p=choices.get(key(c.q,c.r));return p?{path:p}:null},',
  "baseImage=()=>({path:'fallback.png'}),",
  'axialPos=(q,r)=>({x:q*350+r*175,y:r*300});',
  production,
  'return {evaluate:selectedGroundAssetChanges,tiles:changedGroundTileIds,',
  'selection:()=>lastGroundMaterialPaths,groups:()=>terrainAssetGroups};'
 ].join('\n');
 return new Function('original','cells','choices','relief','window',code)(
  original,cells,choices,relief,window);
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
test('forest floor and water remain conservatively global',()=>{
 const h=harness();
 assert.equal(h.evaluate({path:'x.png',type:'forest_floor',terrainCheck:{ok:true}}),null);
 assert.equal(h.evaluate({path:'y.png',type:'coastal_water',terrainCheck:{ok:true}}),null);
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
 assert.match(app,/groundAssetNeedsGlobal=false;\s*if\(spriteAssetBatchDirty\)/)===false;
});

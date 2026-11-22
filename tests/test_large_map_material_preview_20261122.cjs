'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const G=require('../worldgen-geography.js');
const P=require('../large-map-bake-plan.js');
const Source=require('../large-map-bake-source.js');
const Preview=require('../large-map-bake-material-preview.js');
function fixtures(){
 const terrainTypes=[...G.TERRAIN_IDS,'forest_floor'].map(id=>({
  id,materialClass:/(?:ocean|coastal_water)/.test(id)?'water':'ground'
 }));
 const assets=terrainTypes.filter(t=>t.id!=='jungle').flatMap(t=>
  [1,2].map(n=>({
   path:'assets/terrain/'+t.id+'_'+String(n).padStart(2,'0')+'.png',
   relPath:'terrain/'+t.id+'_'+String(n).padStart(2,'0')+'.png',
   category:'terrain',mtime:10,meta:{textureWorldSize:256}
  })));
 const catalog={terrainTypes,assets:Object.fromEntries(assets.map(a=>[
  a.relPath,{terrainTypeId:a.relPath.split('/')[1].replace(/_\d\d.png$/,'')}
 ]))};
 return {catalog,assets};
}
test('select the live catalog materials with the same absolute-coordinate hash as editor',()=>{
 const {catalog,assets}=fixtures(),groups=Preview.assetGroups(catalog,assets.reverse());
 for(const id of G.TERRAIN_IDS){
  const a=Preview.pick({q:-8,r:12,terrainId:id},groups);
  assert(a.path.startsWith('assets/terrain/'));
  if(id==='jungle')assert(a.path.includes('forest_floor_'),
   'jungle is the only allowed original-floor fallback');
  else assert(a.path.includes(id+'_'));
 }
 assert.equal(groups.byType.get('grassland').length,2);
 const first=Preview.pick({q:-8,r:12,terrainId:'grassland'},groups);
 assert.deepEqual(first,Preview.pick({q:-8,r:12,terrainId:'grassland'},groups));
 const noCatalog=Preview.assetGroups({terrainTypes:catalog.terrainTypes,assets:{}},assets);
 assert.throws(()=>Preview.pick({q:0,r:0,terrainId:'grassland'},noCatalog),/Originalmaterial/);
 assert.throws(()=>Preview.assetGroups({},[]),/Terrainkatalog/);
 assert.throws(()=>Preview.pick({q:1.4,r:0,terrainId:'ocean'},groups),/Hex/);
 assert.equal(Preview.hash(1,-1),Preview.hash(1,-1));
});
test('direct geographic 512-tile uses the existing autotile compositor with real source assets',async()=>{
 const world=G.generateWorld('material-test',{width:12,height:10,originQ:-4,originR:9}),
  plan=P.plan(world),tile=plan.tiles[Math.floor(plan.tileCount/2)];
 const {catalog,assets}=fixtures(),trace={assignments:[],transforms:[],images:[]};
 const autotile={build:(cells,textureOf,typeOf,options)=>{
  trace.options=options;trace.cells=cells;
  for(const c of cells){
   const a=textureOf(c);
   assert(a?.img?.naturalWidth>0,'real source image required');
   assert.equal(typeOf(c),c.terrainId);
   trace.assignments.push(a.path);
  }
  return {canvas:{},x:tile.x-128,y:tile.y-128,width:768,height:768};
 }};
 const canvas={width:0,height:0,
  getContext:()=>({setTransform:(...args)=>trace.transforms.push(args),
   drawImage:(...args)=>trace.images.push(args)}),
  toBlob:fn=>fn(new Blob([new Uint8Array(50)],{type:'image/png'}))};
 const renderer=Preview.create({
  world,plan,planner:P,sourceAdapter:Source,
  autotile,catalog,assets,
  loadImage:async a=>({...a,img:{naturalWidth:512}}),
  canvasFactory:()=>canvas
 });
 const result=await renderer.renderTile(tile.id);
 assert.equal(result.stage,'material-only-preview');
 assert.equal(result.complete,false);
 assert.equal(result.readyForViewer,false);
 assert.equal(result.rasterized,true);
 assert.equal(result.tile.id,tile.id);
 assert.equal(result.width,1295);
 assert.equal(result.height,1101);
 assert.equal(trace.options.resolution,2.5);
 assert.equal(trace.options.maxPixels,4200000);
 assert.deepEqual(trace.options.bounds,{
  x:tile.x-128,y:tile.y-128,width:768,height:768});
 assert(trace.assignments.length>0);
 assert.equal(trace.transforms[0][0],2.5);
 assert.equal(trace.transforms[0][3],2.5*.85);
 assert.equal(trace.images.length,1);
 assert(result.omitted.includes('scenery'));
 assert(result.omitted.includes('rivers'));
 await assert.rejects(()=>renderer.renderTile('999,999'),/Weltplan/);
});
test('world-wide coverage reports missing materials instead of silently substituting them',()=>{
 const w=G.generateWorld('audit',{width:20,height:15});
 const {catalog,assets}=fixtures();
 const full=Preview.auditWorld(w,catalog,assets);
 assert.equal(full.stage,'material-catalog-preflight');
 assert.equal(full.readyForMaterialPreview,true);
 assert.equal(full.readyForFinishedGameMap,false);
 assert.equal(full.worldHexes,w.cells.length);
 assert.equal(full.missingHexes,0);
 const wanted=new Set(['sandy_desert','grassland']);
 const missingCatalog={...catalog,assets:Object.fromEntries(
  Object.entries(catalog.assets).filter(([,value])=>!wanted.has(value.terrainTypeId))
 )};
 const blocked=Preview.auditWorld(w,missingCatalog,assets);
 const affected=w.cells.filter(c=>wanted.has(c.terrainId)).length;
 assert.equal(blocked.readyForMaterialPreview,affected===0);
 assert.equal(blocked.missingHexes,affected);
 assert.equal(blocked.coveredHexes+blocked.missingHexes,w.cells.length);
 assert(blocked.missing.every(x=>x.hexes>0));
});
test('no source catalog/texture or renderer produces no falsely finished game tile',async()=>{
 const world=G.generateWorld('reject-material',{width:10,height:10}),
  plan=P.plan(world),tile=plan.tiles[0],{catalog,assets}=fixtures();
 const base={world,plan,planner:P,sourceAdapter:Source,
  autotile:{build:()=>null},catalog,assets,
  loadImage:async a=>({...a,img:{naturalWidth:256}}),
  canvasFactory:()=>({})};
 const render=Preview.create(base);
 await assert.rejects(()=>render.renderTile(tile.id),/kein Materialraster/);
 const missing=Preview.create({...base,catalog:{...catalog,assets:{}}});
 await assert.rejects(()=>missing.renderTile(tile.id),/Originalmaterial/);
 assert.throws(()=>Preview.create({...base,autotile:null}),/Autotile/);
});
test('geography lab actually loads shared render modules in order and labels partial output',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8'),
  js=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 for(const id of ['materialPreviewTileId','materialPreviewBake','materialPreviewReport','auditMaterialCatalog','materialCatalogReport'])
  assert(html.includes('id="'+id+'"'));
 const modules=['water-texture.js','autotile.js','large-map-bake-plan.js',
  'large-map-bake-source.js','large-map-bake-material-preview.js','geography-lab.js'];
 const indices=modules.map(m=>html.indexOf('src="'+m));
 assert(indices.every(n=>n>0));
 assert(indices.every((n,i)=>i===0||n>indices[i-1]));
 assert.match(js,/MATERIAL\.loadCatalog\(\)/);
 assert.match(js,/MATERIAL\.auditWorld\(sourceWorld,catalog,assets\)/);
 assert.match(js,/renderer\.renderTile\(tileId,\{withRelief\}\)/);
 assert.match(js,/result\.complete\|\|result\.readyForViewer/);
 assert.match(js,/UNVOLLSTÄNDIG/);
});

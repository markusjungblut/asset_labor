'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const G=require('../worldgen-geography.js');
const MIX=require('../geography-lab-presets.js');
const P=require('../large-map-bake-plan.js');
const Source=require('../large-map-bake-source.js');
const Authoring=require('../large-map-bake-authoring.js');
const world=(seed='authoring',width=32,height=28,q=-12,r=22)=>
 G.generateWorld(seed,{width,height,originQ:q,originR:r,
  config:MIX.configFor(G)});
test('absolute geographic Q/R becomes original Asset-Labor cell fields without recentering',()=>{
 const w=world(),p=P.plan(w),source=Source.create(w,p,{planner:P});
 let total=0,ownerTotal=0;
 for(const tile of p.tiles.slice(0,40)){
  const raw=source.contextFor(tile.id);
  const out=Authoring.create(raw,{terrainIds:G.TERRAIN_IDS});
  assert.equal(out.worldCells.length,raw.cells.length);
  assert.equal(out.ownerCells.length,raw.ownerCells.length);
  assert.equal(out.riverRoutesMayCrossSourceBounds,true);
  for(let i=0;i<raw.cells.length;i++){
   const c=raw.cells[i],a=out.worldCells[i],k=c.q+','+c.r;
   assert.deepEqual([a.q,a.r,a.worldQ,a.worldR],[c.q,c.r,c.q,c.r]);
   assert.equal(a.biome,c.terrainId);
   assert.equal(a.terrainTypeId,c.terrainId);
   assert.equal(a.name,c.terrainId);
   assert.equal(a.reliefClass,c.reliefClass);
   assert.equal(a.hillStrength,
    Number.isFinite(c.hillStrength)?c.hillStrength:0.5);
   assert.equal(out.forestOverrides[k],c.forestClass);
   assert.equal(out.geographyHexes[k],true);
   assert.deepEqual(a.features,c.features);
   if(c.forestClass!=='none'&&Number.isFinite(c.forestDensity))
    assert.equal(out.densityOverrides[k],c.forestDensity);
   if(c.baseBiome==='jungle')assert.equal(out.jungleHexes[k],true);
  }
  for(const c of out.ownerCells)
   assert(out.worldCells.includes(c),'scenery owner is one source cell');
  for(let i=0;i<out.riverPaths.length;i++)
   assert.deepEqual(out.riverPaths[i].hexes,raw.riverPaths[i]);
  total+=out.worldCells.length;ownerTotal+=out.ownerCells.length;
 }
 assert(total>0&&ownerTotal>0);
});
test('conversion is independent of geography source and enforces catalogs',()=>{
 const w=world(),p=P.plan(w),src=Source.create(w,p,{planner:P}),
  raw=src.contextFor(p.tiles[Math.floor(p.tiles.length/2)].id);
 const converted=Authoring.create(raw,{terrainIds:G.TERRAIN_IDS});
 const old=w.cells.find(c=>c.q===converted.worldCells[0].q&&
  c.r===converted.worldCells[0].r).terrainId;
 converted.worldCells[0].terrainTypeId='not-a-real-terrain';
 assert.equal(w.cells.find(c=>c.q===converted.worldCells[0].q&&
  c.r===converted.worldCells[0].r).terrainId,old);
 assert.throws(()=>Authoring.create(raw,{terrainIds:[]}),/Terrainkatalog/);
 assert.throws(()=>Authoring.create({
  ...raw,cells:[{...raw.cells[0],forestClass:'unknown'}]
 },{terrainIds:G.TERRAIN_IDS}),/Waldklasse/);
 assert.throws(()=>Authoring.create({
  ...raw,cells:[{...raw.cells[0],terrainId:'not-in-catalog'}]
 },{terrainIds:G.TERRAIN_IDS}),/Terrain/);
});

/* Geography-to-Asset-Labor authoring input adapter, phase 2.
 * Maps absolute Q/R cells to the existing editor's authored cell contract.
 * Does NOT recenter the world, mutate editor state, select images, or
 * normalize incomplete (halo-only) river routes as full scene routes.
 */
(function(root){
'use strict';
const allowedForest=new Set(['none','light_forest','dense_forest']);
const finite=Number.isFinite,integer=Number.isSafeInteger;
const key=(q,r)=>q+','+r;
function create(context,{terrainIds}={}){
 if(!context||!context.tile||!Array.isArray(context.cells)||
    !Array.isArray(context.ownerCells)||!Array.isArray(context.riverPaths)||
    typeof context.source?.version!=='string')
  throw Error('Ungültiger Tile-BakingContext.');
 const terrain=new Set(terrainIds||root.VedrasGeography?.TERRAIN_IDS||[]);
 if(!terrain.size)throw Error('Terrainkatalog fehlt für den Bake-Auftrag.');
 const cells=[],forestOverrides={},densityOverrides={},
  geographyHexes={},jungleHexes={},byKey=new Map();
 for(const cell of context.cells){
  if(!integer(cell.q)||!integer(cell.r)||!terrain.has(cell.terrainId)||
     !allowedForest.has(cell.forestClass)||
     typeof cell.reliefClass!=='string'||!Array.isArray(cell.features))
   throw Error('BakingContext enthält unbekanntes Terrain, Relief oder Waldklasse.');
  const k=key(cell.q,cell.r);
  if(byKey.has(k))throw Error('BakingContext enthält doppelte Hexkoordinaten.');
  const id=cell.terrainId;
  const authored={
   q:cell.q,r:cell.r,worldQ:cell.q,worldR:cell.r,
   biome:id,terrainTypeId:id,name:id,
   reliefClass:cell.reliefClass,hillProfile:cell.hillProfile,
   hillStrength:finite(cell.hillStrength)?cell.hillStrength:0.5,
   features:JSON.parse(JSON.stringify(cell.features)),
   temperature:cell.temperature,humidity:cell.humidity,
  };
  cells.push(authored);byKey.set(k,authored);
  forestOverrides[k]=cell.forestClass;
  geographyHexes[k]=true;
  if(cell.forestClass!=='none'&&finite(cell.forestDensity))
   densityOverrides[k]=cell.forestDensity;
  if(cell.baseBiome==='jungle')jungleHexes[k]=true;
 }
 const ownerCells=[];
 for(const cell of context.ownerCells){
  const authored=byKey.get(key(cell.q,cell.r));
  if(!authored)throw Error('Scenery-Owner fehlt im Quellbereich.');
  ownerCells.push(authored);
 }
 const seenOwners=new Set();
 for(const cell of ownerCells){
  const id=key(cell.q,cell.r);
  if(seenOwners.has(id))throw Error('Mehrfacher Scenery-Owner.');
  seenOwners.add(id);
 }
 const riverPaths=context.riverPaths.map(route=>{
  if(!Array.isArray(route)||!route.length)throw Error('Leere Flussroute.');
  const hexes=route.map(point=>{
   if(!Array.isArray(point)||point.length!==2||
      !integer(point[0])||!integer(point[1]))
    throw Error('Ungültige absolute Flusskoordinaten.');
   return [point[0],point[1]];
  });
  return {hexes};
 });
 return {
  source:context.source,tile:{...context.tile},
  worldCells:cells,ownerCells,
  forestOverrides,densityOverrides,geographyHexes,jungleHexes,
  riverPaths,
  // A route may continue far outside this tile's halo. The eventual
  // renderer must evaluate it with the full geography route graph before
  // rasterizing its visible segment, never truncate it silently here.
  riverRoutesMayCrossSourceBounds:true,
 };
}
const api={create};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.VedrasLargeMapBakeAuthoring=api;
})(typeof window!=='undefined'?window:globalThis);

/* Phase 1 of the independent large-map baker:
 * deterministic, read-only 512-world-unit tile planning from geography data.
 * Plans contain NO artwork; never publish them as finished game atlases.
 * The pixel renderer and ZIP publisher are separate later stages.
 */
(function(root){
'use strict';
const SCHEMA='vedras-geography-bake-plan-v1';
const TILE_SIZE=512, OCCUPANCY_MARGIN=150, SOURCE_HALO=470;
const PROJECTION='VedrasChunks.worldPos/v0.11.7';
const MAX_CELLS=60000,MAX_TILES=60000;
const integer=Number.isSafeInteger;
const plain=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
function fingerprint(value){
 const text=JSON.stringify(value);
 if(typeof text!=='string')throw Error('Ungültige Fingerprint-Eingabe.');
 // Four independent 32-bit lanes, as in the existing chunk revision tag.
 // This is a *change detector*, not a cryptographic or file-integrity hash.
 let a=2166136261,b=2246822519,c=3266489917,d=668265263;
 for(let i=0;i<text.length;i++){
  const v=text.charCodeAt(i);
  a=Math.imul(a^v,16777619);
  b=Math.imul(b^v,2246822519);
  c=Math.imul(c^v,3266489917);
  d=Math.imul(d^v,668265263);
 }
 const hex=n=>(n>>>0).toString(16).padStart(8,'0');
 return 'draft-'+text.length.toString(36)+'-'+hex(a)+hex(b)+hex(c)+hex(d);
}
function worldPos(cell){
 return {x:256*(cell.q+cell.r/2),y:1.5*(256/Math.sqrt(3))*cell.r};
}
function validateWorld(world){
 if(!plain(world)||typeof world.version!=='string'||
    !/^geography-v[0-9]+\.[0-9]+\.[0-9]+$/.test(world.version)||
    typeof world.seed!=='string'||!world.seed.length||world.seed.length>256||
    !plain(world.config)||!integer(world.width)||!integer(world.height)||
    world.width<10||world.height<10||
    world.width*world.height>MAX_CELLS||
    !integer(world.originQ)||!integer(world.originR)||
    Math.abs(world.originQ)>1000000||Math.abs(world.originR)>1000000||
    !Array.isArray(world.cells)||
    world.cells.length!==world.width*world.height||
    !Array.isArray(world.riverPaths))
  throw Error('Ungültige oder unvollständige Geografiewelt für Renderplanung.');
 // Verify exact row-major world coordinates. No off-origin or duplicate cells.
 for(let i=0;i<world.cells.length;i++){
  const cell=world.cells[i];
  if(!plain(cell)||cell.q!==world.originQ+i%world.width||
     cell.r!==world.originR+Math.floor(i/world.width)||
     typeof cell.terrainId!=='string'||!cell.terrainId.length||
     typeof cell.reliefClass!=='string'||!Array.isArray(cell.features))
   throw Error('Ungültiges Welt-Hexfeld bei Index '+i+'.');
 }
}
function plan(world){
 validateWorld(world);
 // This geometry is deliberately identical to chunks.js spatialFor().
 // The source halo is a *renderer requirement*, not included in occupancy.
 const occupied=new Map();
 for(const cell of world.cells){
  const p=worldPos(cell);
  const minX=Math.floor((p.x-OCCUPANCY_MARGIN)/TILE_SIZE)-1;
  const maxX=Math.floor((p.x+OCCUPANCY_MARGIN)/TILE_SIZE)+1;
  const minY=Math.floor((p.y-OCCUPANCY_MARGIN)/TILE_SIZE)-1;
  const maxY=Math.floor((p.y+OCCUPANCY_MARGIN)/TILE_SIZE)+1;
  for(let ty=minY;ty<=maxY;ty++)for(let tx=minX;tx<=maxX;tx++){
   const x=tx*TILE_SIZE,y=ty*TILE_SIZE;
   if(p.x>=x-OCCUPANCY_MARGIN&&p.x<x+TILE_SIZE+OCCUPANCY_MARGIN&&
      p.y>=y-OCCUPANCY_MARGIN&&p.y<y+TILE_SIZE+OCCUPANCY_MARGIN){
    const id=tx+','+ty;
    if(!occupied.has(id))occupied.set(id,{id,x,y,size:TILE_SIZE});
   }
  }
 }
 const tiles=[...occupied.values()].sort((a,b)=>a.y-b.y||a.x-b.x);
 if(!tiles.length||tiles.length>MAX_TILES)
  throw Error('Unzulässige Zahl an Render-Kacheln: '+tiles.length);
 const sourceFingerprint=fingerprint({
  version:world.version,seed:world.seed,
  width:world.width,height:world.height,originQ:world.originQ,
  originR:world.originR,config:world.config,cells:world.cells,
  riverPaths:world.riverPaths,
 });
 return {
  schema:SCHEMA,stage:'plan-only',rasterized:false,readyForViewer:false,
  source:{version:world.version,seed:world.seed,width:world.width,
   height:world.height,originQ:world.originQ,originR:world.originR,
   // Enables later offline reconstruction, then fingerprint comparison.
   config:{...world.config},cells:world.cells.length,
   fingerprint:sourceFingerprint},
  target:{format:'vedras-static-game-map',lod:'near',
   requiredLayers:['ground','scenery'],rasterFormat:'png'},
  grid:{projection:PROJECTION,tileSize:TILE_SIZE,
   occupancyMargin:OCCUPANCY_MARGIN,sourceHalo:SOURCE_HALO},
  tileCount:tiles.length,tiles,
 };
}
function validatePlan(p){
 if(!plain(p)||p.schema!==SCHEMA||p.stage!=='plan-only'||
    p.rasterized!==false||p.readyForViewer!==false||
    !plain(p.source)||!plain(p.source.config)||
    typeof p.source.fingerprint!=='string'||!plain(p.grid)||
    p.grid.tileSize!==TILE_SIZE||
    p.grid.projection!==PROJECTION||p.grid.sourceHalo!==SOURCE_HALO||
    !Array.isArray(p.tiles)||!integer(p.tileCount)||
    p.tileCount!==p.tiles.length||p.tileCount<1||
    p.tileCount>MAX_TILES)throw Error('Renderplan passt nicht zur gültigen Planungsfassung.');
 const seen=new Set();
 for(const tile of p.tiles){
  if(!plain(tile)||!/^[-]?\d+,[-]?\d+$/.test(tile.id)||
     !integer(tile.x)||!integer(tile.y)||tile.size!==TILE_SIZE||
     tile.x%TILE_SIZE!==0||tile.y%TILE_SIZE!==0||
     tile.id!==(tile.x/TILE_SIZE)+','+(tile.y/TILE_SIZE)||
     seen.has(tile.id))throw Error('Ungültige oder doppelte Render-Kachel.');
  seen.add(tile.id);
 }
 return true;
}
// Planning batches are *not* finished image receipts. Never count such a
// batch as persisted until the later raster/PNG storage layer verifies it.
function batches(p,batchSize=16){
 validatePlan(p);
 if(!integer(batchSize)||batchSize<1||batchSize>128)
  throw RangeError('Batchgröße muss 1–128 WorldTiles betragen.');
 const out=[];
 for(let i=0;i<p.tiles.length;i+=batchSize)
  out.push({index:out.length,start:i,total:p.tileCount,
   tiles:p.tiles.slice(i,i+batchSize)});
 return out;
}
const api={SCHEMA,TILE_SIZE,OCCUPANCY_MARGIN,SOURCE_HALO,PROJECTION,
 worldPos,validateWorld,plan,validatePlan,batches};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.VedrasLargeMapBakePlan=api;
})(typeof window!=='undefined'?window:globalThis);

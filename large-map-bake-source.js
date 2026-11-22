/* Large-map baker phase 2: tile-local geographic source adapter.
 * The existing Asset-Labor renderer is the sole owner of raster materials.
 * This module extracts bounded, absolute-coordinate inputs; no drawing or
 * writes to the editor/IndexedDB/scene are performed here.
 */
(function(root){
'use strict';
const TILE_SIZE=512,MAX_CELLS=60000;
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const coord=(q,r)=>q+','+r;
const parseTile=id=>{
 const a=/^(-?\d+),(-?\d+)$/.exec(id||'');
 if(!a)throw Error('Ungültige Renderkachel-ID.');
 return [Number(a[1]),Number(a[2])];
};
function create(world,plan,{planner=root.VedrasLargeMapBakePlan}={}){
 if(!planner?.validateWorld||!planner?.plan||!planner?.validatePlan)
  throw Error('Geografie-Renderplaner nicht verfügbar.');
 planner.validateWorld(world);
 planner.validatePlan(plan);
 // A plan must be an exact match for the supplied *full* world. Neither
 // a foreign plan nor a plan with omitted / injected tile IDs is usable.
 const reference=planner.plan(world);
 if(plan.source.fingerprint!==reference.source.fingerprint||
    plan.tileCount!==reference.tileCount||
    plan.tiles.some((t,i)=>t.id!==reference.tiles[i].id||
      t.x!==reference.tiles[i].x||t.y!==reference.tiles[i].y))
  throw Error('Renderplan passt nicht zur angegebenen Geografiewelt.');
 const tiles=new Map(reference.tiles.map(t=>[t.id,t]));
 const grid=new Map(),routeByCell=new Map();
 // Bucket every geographic center only once; tile queries are local even
 // for 60,000 world cells. Never recenter Q/R relative to an editor scene.
 for(let i=0;i<world.cells.length;i++){
  const c=world.cells[i],pos=planner.worldPos(c);
  const bx=Math.floor(pos.x/TILE_SIZE),by=Math.floor(pos.y/TILE_SIZE);
  const id=coord(bx,by);
  if(!grid.has(id))grid.set(id,[]);
  grid.get(id).push(i);
 }
 for(let i=0;i<world.riverPaths.length;i++){
  const route=world.riverPaths[i];
  if(!Array.isArray(route))throw Error('Flussroute ist kein Array.');
  for(const p of route){
   if(!Array.isArray(p)||p.length!==2||
      !Number.isSafeInteger(p[0])||!Number.isSafeInteger(p[1]))
    throw Error('Flusswegpunkt ist ungültig.');
   const k=coord(p[0],p[1]);
   if(!routeByCell.has(k))routeByCell.set(k,new Set());
   routeByCell.get(k).add(i);
  }
 }
 function contextFor(tileId){
  const [tx,ty]=parseTile(tileId),id=coord(tx,ty);
  const tile=tiles.get(id);
  if(!tile||tile.x!==tx*TILE_SIZE||tile.y!==ty*TILE_SIZE)
   throw Error('Renderkachel gehört nicht zum bestätigten Weltplan.');
  // Existing chunks.js neighbors(tile,cells,470) includes cell centers
  // in [tile.x-470, tile.x+512+470]. Do not build boundaries by
  // subtracting originQ/R or by slicing the generator's 2-D array.
  const halo=plan.grid.sourceHalo;
  if(!Number.isFinite(halo)||halo<470)
   throw Error('Renderquell-Halo unterschreitet den bestehenden Editorvertrag.');
  const left=tile.x-halo,right=tile.x+tile.size+halo;
  const top=tile.y-halo,bottom=tile.y+tile.size+halo;
  const minBX=Math.floor(left/TILE_SIZE),maxBX=Math.floor(right/TILE_SIZE);
  const minBY=Math.floor(top/TILE_SIZE),maxBY=Math.floor(bottom/TILE_SIZE);
  const indices=[];
  for(let by=minBY;by<=maxBY;by++)
   for(let bx=minBX;bx<=maxBX;bx++)
    for(const i of grid.get(coord(bx,by))||[]){
     const p=planner.worldPos(world.cells[i]);
     if(p.x>=left&&p.x<=right&&p.y>=top&&p.y<=bottom)
      indices.push(i);
    }
  // Row-major order is part of the shared geography world contract.
  indices.sort((a,b)=>a-b);
  const riverIds=new Set(),cells=[],ownerCells=[];
  for(const i of indices){
   const cell=world.cells[i],pos=planner.worldPos(cell);
   const independent=JSON.parse(JSON.stringify(cell));
   cells.push(independent);
   for(const id of routeByCell.get(coord(cell.q,cell.r))||[])
    riverIds.add(id);
   // Owner-by-anchor: scenery is drawn in the tile containing its anchor.
   // Its silhouette may overlap another tile via the source halo.
   if(pos.x>=tile.x&&pos.x<tile.x+tile.size&&
      pos.y>=tile.y&&pos.y<tile.y+tile.size)
    ownerCells.push(independent);
  }
  const routes=[...riverIds].sort((a,b)=>a-b).map(i=>
   world.riverPaths[i].map(p=>[p[0],p[1]]));
  return {source:plan.source,tile:{...tile},
   projection:plan.grid.projection,sourceHalo:halo,
   worldBounds:{x:tile.x,y:tile.y,width:tile.size,height:tile.size},
   sourceBounds:{x:left,y:top,width:right-left,height:bottom-top},
   cells,ownerCells,riverPaths:routes,
   sourceCount:cells.length,ownerCount:ownerCells.length};
 }
 return {source:reference.source,tileCount:tiles.size,contextFor,
  hasTile:id=>tiles.has(id)};
}
const api={create};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.VedrasLargeMapBakeSource=api;
})(typeof window!=='undefined'?window:globalThis);

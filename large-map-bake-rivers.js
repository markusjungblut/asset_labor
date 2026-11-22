/* Phase 2.5: original Asset-Labor river water and bank artwork.
 * Uses the SAME VedrasRivers.render + VedrasRiverBanks.prepare/render as
 * the editor. Full, absolute routes and mouths; no partial local route
 * which could change corners, endpoints or water masks at tile seams.
 * Experimental 2.5x Ground preview, not a completed 4x game atlas.
 */
(function(root){
'use strict';
const SOURCE_HALO=1280,HALF_WORLD_PAD=128,NEAR_MARGIN=300;
const MAX_ROUTES=3000,MAX_ROUTE_POINTS=10000;
const key=(q,r)=>q+','+r;
const pos=c=>({x:256*(c.q+c.r/2),y:1.5*(256/Math.sqrt(3))*c.r});
function create({world,catalog,groups,loadImage,pick,
 rivers=root.VedrasRivers,banks=root.VedrasRiverBanks,
 relief=root.VedrasRelief,width=32,bankStrength=.85}={}){
 if(!world?.cells?.length||!Array.isArray(world.riverPaths)||
    !Array.isArray(catalog?.terrainTypes)||!groups||
    typeof loadImage!=='function'||typeof pick!=='function'||
    !rivers?.sections||!rivers?.render||!rivers?.coursePoints||
    !banks?.prepare||!banks?.render)
  throw Error('Original-Flussrenderer, Ufer-Renderer oder Terrainmaterialien fehlen.');
 if(!Number.isFinite(width)||width<12||width>70||
    !Number.isFinite(bankStrength)||bankStrength<0||bankStrength>1)
  throw Error('Ungültige Fluss-/Uferparameter.');
 if(world.riverPaths.length>MAX_ROUTES)
  throw Error('Zu viele geografische Flussrouten.');
 const water=new Set(catalog.terrainTypes.filter(t=>t.materialClass==='water').map(t=>t.id));
 if(!water.size)throw Error('Der Originalkatalog enthält keine Wasserterrains.');
 const wet=c=>water.has(c?.terrainId||c?.terrainTypeId||c?.biome);
 const indexed=new Map(world.cells.map(c=>[key(c.q,c.r),c]));
 // Data and course geometry are prepared once, not 7,125 cells per tile.
 const routes=world.riverPaths.map((points,i)=>{
  if(!Array.isArray(points)||points.length<2||points.length>MAX_ROUTE_POINTS)
   throw Error('Flussroute '+i+' hat ungültige Länge.');
  const route={hexes:points.map(p=>[p[0],p[1]])};
  const routeCells=route.hexes.map(([q,r])=>indexed.get(key(q,r)));
  if(routeCells.some(c=>!c)||!rivers.valid(route,routeCells,wet))
   throw Error('Flussroute '+i+' ist geografisch inkonsistent.');
  const geometry=rivers.sections(route,routeCells,wet);
  if(!geometry.length)throw Error('Flussroute '+i+' enthält keine Renderer-Segmente.');
  const course=rivers.coursePoints(geometry,route,width);
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(const p of course){
   minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);
   minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);
  }
  const extent={minX,maxX,minY,maxY};
  const [mouthQ,mouthR]=route.hexes.at(-1),mouth=indexed.get(key(mouthQ,mouthR));
  if(!mouth||!wet(mouth))throw Error('Flussmündung ohne Original-Wasserterrain.');
  return {index:i,route,routeCells,extent,mouth};
 });
 function visible(context){
  const t=context?.tile;
  if(!t||!Number.isSafeInteger(context.sourceHalo)||
     context.sourceHalo<SOURCE_HALO)
   throw Error('Original-Flusslauf benötigt einen 1.280er Quell-Halo.');
  const left=t.x-HALF_WORLD_PAD-NEAR_MARGIN,
   top=t.y-HALF_WORLD_PAD-NEAR_MARGIN;
  const right=t.x+t.size+HALF_WORLD_PAD+NEAR_MARGIN,
   bottom=t.y+t.size+HALF_WORLD_PAD+NEAR_MARGIN;
  return routes.filter(x=>x.extent.maxX>=left&&x.extent.minX<=right&&
   x.extent.maxY>=top&&x.extent.minY<=bottom);
 }
 async function render(context,ctx,{reliefOptions=null}={}){
  if(typeof ctx?.drawImage!=='function')
   throw Error('Flussausgabe benötigt einen Original-Canvas2D-Kontext.');
  if(reliefOptions&&typeof relief?.at!=='function')
   throw Error('Geografische Höhenprojektion fehlt.');
  const active=visible(context);
  if(!active.length)return {stage:'original-river-preview',riverCount:0,
   bankCount:0,texturePaths:[],complete:false,readyForViewer:false};
  const groundY=reliefOptions?(x,y)=>y-relief.at(x,y,reliefOptions):null;
  const bounds={x:context.tile.x-HALF_WORLD_PAD,
   y:context.tile.y-HALF_WORLD_PAD,
   width:context.tile.size+2*HALF_WORLD_PAD,
   height:context.tile.size+2*HALF_WORLD_PAD};
  const baseCells=new Map(context.cells.map(c=>[key(c.q,c.r),c]));
  const assets=new Map();
  // All original image decodes succeed before drawing any river.
  for(const item of active){
   const asset=pick(item.mouth,groups);
   if(!asset?.path)throw Error('Kein Originalwasser für Fluss '+item.index);
   const loaded=await loadImage(asset),img=loaded?.img||loaded;
   if(!(img?.naturalWidth>0&&img?.naturalHeight>0))
    throw Error('Original-Flusswassertextur fehlt: '+asset.path);
   assets.set(item.index,{path:asset.path,img});
   // Route geometry must remain complete even when a source crosses a tile.
   for(const cell of item.routeCells)baseCells.set(key(cell.q,cell.r),cell);
  }
  const bankCells=[...baseCells.values()].map(c=>
   c.forestClass==='none'?{...c,forestClass:null}:c);
  // Draw banks first, textured original water after. This is the exact
  // ordering used in app.js drawRoadsImpl().
  const prepared=banks.prepare(active.map(x=>x.route),bankCells,wet,{
   width,groundY,typeForCell:c=>c.terrainId||c.terrainTypeId||c.biome
  });
  if(prepared.routeCount!==active.length)
   throw Error('Original-Uferrenderer hat eine vollständige Flussroute verworfen.');
  const renderedBank=banks.render(prepared,{
   bounds,resolution:1.5,bankStrength
  });
  if(renderedBank?.canvas)
   ctx.drawImage(renderedBank.canvas,renderedBank.x,renderedBank.y,
    renderedBank.width,renderedBank.height);
  // River raster uses an exact full-route world-space course. It is
  // clipped by the caller's tile canvas; never silently cut the
  // source route to the limited context.cells.
  let count=0;
  for(const item of active){
   const water=assets.get(item.index);
   const result=rivers.render(ctx,item.route,item.routeCells,wet,
    water.img,{width,groundY,detailScale:1});
   if(!result?.canvas)
    throw Error('Original-Flusswasser wurde nicht vollständig gerendert: '+item.index);
   count++;
  }
  return {stage:'original-river-preview',riverCount:count,
   bankCount:renderedBank?.canvas?1:0,
   texturePaths:[...new Set([...assets.values()].map(a=>a.path))],
   complete:false,readyForViewer:false};
 }
 return {sourceHalo:SOURCE_HALO,riverCount:routes.length,
  visible,render};
}
const api={SOURCE_HALO,create};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.VedrasLargeMapBakeRivers=api;
})(typeof window!=='undefined'?window:globalThis);

/* Large-map baker phase 2.4: ORIGINAL six-sided shoreline artwork.
 * Reuses VedrasShoreline.segments()/build() verbatim with the real six PNGs.
 * River mouth portals are computed from the WHOLE world; they are deliberately
 * not cut into the coast until the original river WATER renderer is integrated,
 * otherwise the preview would contain fake empty gaps at every river mouth.
 */
(function(root){
'use strict';
const SOURCE_HALO=768,SHORE_DENSITY=1.5,PAD=128;
const SHORE_PATHS=Object.freeze(Array.from({length:6},(_,i)=>
 'assets/shorelines/shore_v105_edge_'+String(i+1).padStart(2,'0')+'.png'));
const MAX_ROUTES=3000;
function create({world,catalog,shoreline=root.VedrasShoreline,
 rivers=root.VedrasRivers,loadImage,
 riverWidth=32}={}){
 if(!Array.isArray(world?.cells)||!Array.isArray(world?.riverPaths)||
    !Array.isArray(catalog?.terrainTypes)||
    !shoreline?.segments||!shoreline?.build||
    !rivers?.valid||!rivers?.mouthPortals||
    typeof loadImage!=='function')
  throw Error('Gemeinsame Ufer-/Flussrenderer oder Originalkatalog fehlen.');
 const water=new Set(catalog.terrainTypes.filter(x=>x.materialClass==='water')
  .map(x=>x.id));
 if(!water.size)throw Error('Der Terrainkatalog kennt keine Wasserklassen.');
 const wet=cell=>water.has(cell.terrainId||cell.terrainTypeId||cell.biome);
 const routes=world.riverPaths.map(x=>({hexes:x.map(p=>[p[0],p[1]])}));
 if(routes.length>MAX_ROUTES)throw Error('Unzulässig viele Flussrouten.');
 for(let i=0;i<routes.length;i++)
  if(!rivers.valid(routes[i],world.cells,wet))
   throw Error('Welt-Flussroute '+i+' ist inkonsistent; Uferdarstellung wird blockiert.');
 // Evaluate river mouths once, against the complete geographic world.
 const mouthPortals=rivers.mouthPortals(routes,world.cells,wet,riverWidth);
 function prepare(context){
  if(!context?.tile||!Array.isArray(context.cells)||
     !Number.isSafeInteger(context.sourceHalo)||context.sourceHalo<SOURCE_HALO)
   throw Error('Ufer-Probekachel benötigt einen 768er Nachbarschafts-Halo.');
  const bounds={x:context.tile.x-PAD,y:context.tile.y-PAD,
   width:context.tile.size+2*PAD,height:context.tile.size+2*PAD};
  const segments=shoreline.segments(context.cells,wet);
  // Exactly the existing build() selection; do not clip by the target's
  // center alone or miss original shore sprites crossing a chunk edge.
  const near=segments.filter(s=>s.center.x>=bounds.x-260&&
   s.center.x<=bounds.x+bounds.width+260&&
   s.center.y>=bounds.y-260&&s.center.y<=bounds.y+bounds.height+260);
  const requiredSides=[...new Set(near.map(s=>s.side))].sort((a,b)=>a-b);
  const nearbyMouths=mouthPortals.filter(p=>
   p.x>=bounds.x-260&&p.x<=bounds.x+bounds.width+260&&
   p.y>=bounds.y-260&&p.y<=bounds.y+bounds.height+260);
  return {bounds,segments,requiredSides,nearCount:near.length,
   nearbyMouths,sourceHalo:context.sourceHalo};
 }
 async function render(context){
  const preparation=prepare(context);
  if(!preparation.nearCount)return {
   stage:'original-shoreline-preview',canvas:null,
   segmentCount:0,assetsUsed:[],deferredMouthPortals:0,
   complete:false,readyForViewer:false};
  const images=Array(6).fill(null);
  const assetsUsed=[];
  for(const side of preparation.requiredSides){
   if(side<0||side>=6||!Number.isInteger(side))
    throw Error('Ungültiger Original-Uferseitenindex.');
   const path=SHORE_PATHS[side];
   const loaded=await loadImage({path,mtime:0});
   const img=loaded?.img||loaded;
   if(!(img?.naturalWidth>0&&img?.naturalHeight>0))
    throw Error('Original-Ufer-PNG fehlt oder ist noch nicht dekodiert: '+path);
   images[side]=img;
   assetsUsed.push(path);
  }
  const raster=shoreline.build(context.cells,wet,images,{
   mode:'art',resolution:SHORE_DENSITY,
   bounds:preparation.bounds,segments:preparation.segments,
   // Important: NOT until river artwork is drawn in the same output.
   mouthPortals:[]
  });
  if(raster?.missing||!raster?.canvas)
   throw Error('Der gemeinsame Original-Uferrenderer konnte nicht vollständig zeichnen.');
  return {stage:'original-shoreline-preview',
   canvas:raster.canvas,x:raster.x,y:raster.y,
   width:raster.width,height:raster.height,
   segmentCount:preparation.nearCount,assetsUsed,
   deferredMouthPortals:preparation.nearbyMouths.length,
   mouthPortalsReadyForFutureRiverLayer:preparation.nearbyMouths,
   complete:false,readyForViewer:false};
 }
 return {sourceHalo:SOURCE_HALO,shorePaths:[...SHORE_PATHS],
  riverMouthCount:mouthPortals.length,prepare,render};
}
const api={SOURCE_HALO,SHORE_DENSITY,SHORE_PATHS,create};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.VedrasLargeMapBakeShoreline=api;
})(typeof window!=='undefined'?window:globalThis);

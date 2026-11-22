/* Native Asset-Labor 2.5D geography-ground bridge (experimental).
 * Reuses VedrasRelief.make() on the original Autotile land raster;
 * the water layer remains flat, exactly as in the editor drawGround().
 * This DOES NOT include shoreline, rivers, forest or scenery, and must
 * never be accepted as a completed game-map layer.
 */
(function(root){
'use strict';
const SOURCE_HALO=1280;
function createOptions(context,types,{relief=root.VedrasRelief,
 autotile=root.VedrasAutotile}={}){
 if(!relief?.valid||!autotile?.hexAt||!Array.isArray(context?.cells)||
    !Array.isArray(types)||!context.tile)
  throw Error('Original-Relief, Terrainkatalog oder geografische Quellen fehlen.');
 const wetTypes=new Set(types.filter(t=>t.materialClass==='water')
  .map(t=>t.id));
 // Build from the enlarged world-space source window, not from a 397-hex
 // local/centered editor scene. Every tile sees the same source hill shapes.
 const positions=new Map(context.cells.map(c=>[
  c.q+','+c.r,{cell:c,wet:wetTypes.has(c.terrainId)}
 ]));
 const pos=c=>({x:256*(c.q+c.r/2),y:1.5*(256/Math.sqrt(3))*c.r});
 const dirs=autotile.DIRS||[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]];
 const landMask=(x,y)=>{
  const here=positions.get(autotile.hexAt(x,y));
  if(!here||here.wet)return 0;
  const p=pos(here.cell);
  let fade=1;
  for(const [dq,dr] of dirs){
   const neighbor=positions.get((here.cell.q+dq)+','+(here.cell.r+dr));
   if(!neighbor?.wet)continue;
   const n=pos(neighbor.cell),dx=p.x-n.x,dy=p.y-n.y;
   const distance=((x-(p.x+n.x)/2)*dx+(y-(p.y+n.y)/2)*dy)/
    Math.hypot(dx,dy);
   const t=Math.min(1,Math.max(0,distance/65));
   fade=Math.min(fade,t*t*(3-2*t));
  }
  return fade;
 };
 const geoHills=context.cells.filter(c=>c.reliefClass==='hills')
  .map(c=>({q:c.q,r:c.r,worldQ:c.q,worldR:c.r,
   profile:c.hillProfile||'rounded',
   strength:Math.min(1,Math.max(0,
    Number.isFinite(c.hillStrength)?c.hillStrength:0.5))}));
 const defaults=relief.defaults?.()||{};
 const opts=relief.valid({...defaults,enabled:true,mode:'geography',
  geoHills,landMask,maskKey:context.source?.fingerprint||'',
  lighting:defaults.lighting!==false});
 return {options:opts,hillHexes:geoHills.length,
  waterHexes:context.cells.filter(c=>wetTypes.has(c.terrainId)).length,
  sourceHalo:context.sourceHalo};
}
function apply({context,raster,types,relief=root.VedrasRelief,
 autotile=root.VedrasAutotile}={}){
 if(context?.sourceHalo<SOURCE_HALO)
  throw Error('Geo-Relief benötigt den erweiterten 1.280er-Quell-Halo.');
 if(!raster?.landLayer?.canvas||!raster?.waterLayer?.canvas||
    !relief?.make||!autotile?.draw)
  throw Error('Echte getrennte Land- und Wasser-Rasterbilder fehlen.');
 const {options,hillHexes,waterHexes}=createOptions(context,types,{relief,autotile});
 const raised=hillHexes>0?relief.make(raster.landLayer,options):
  raster.landLayer;
 if(!raised?.canvas)throw Error('Original-Relief-Renderer lieferte keinen Land-Raster.');
 // Caller paints water first, then raised land. No combined opaque raster
 // may be overdrawn afterward or the lifted coastline would be erased.
 return {water:raster.waterLayer,land:raised,hillHexes,waterHexes,
  options,sourceHalo:context.sourceHalo,complete:false,
  stage:'material-relief-preview'};
}
const api={SOURCE_HALO,createOptions,apply};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.VedrasLargeMapBakeGroundRelief=api;
})(typeof window!=='undefined'?window:globalThis);

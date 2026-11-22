/* Direct Geography → original world-connected forest floor, Phase 2.6.
 * Reuse VedrasForest.generate/ VedrasForestGround.build, without replacing
 * authoritative forestClass or drawing synthetic/flat forest textures.
 */
(function(root){
'use strict';
const SOURCE_HALO=768,SIZE=512,PAD=128,RESOLUTION=1.4;
const key=c=>c.q+','+c.r;
const near=(c,b,r)=>{
 const x=256*(c.q+c.r/2),y=1.5*(256/Math.sqrt(3))*c.r;
 return x>=b.x-r&&x<=b.x+b.width+r&&y>=b.y-r&&y<=b.y+b.height+r;
};
function create({world,catalog,groups,loadImage,
 forest=root.VedrasForest,floor=root.VedrasForestGround}={}){
 if(!Array.isArray(world?.cells)||!world.cells.length||
    !Array.isArray(catalog?.terrainTypes)||!groups?.byType||
    typeof loadImage!=='function'||!forest?.defaults||!forest?.generate||
    !floor?.build||!floor?.regions||!floor?.strength||!floor?.eligible)
  throw Error('Original-Wald-/Waldbodenrenderer oder Terrainkatalog fehlen.');
 const terrain=new Map(catalog.terrainTypes.map(t=>[t.id,t]));
 const overrides={},densityOverrides={},geographyHexes={},jungleHexes={};
 for(const c of world.cells){
  if(!Number.isSafeInteger(c.q)||!Number.isSafeInteger(c.r)||
     !['none','dense_forest','light_forest'].includes(c.forestClass)||
     !terrain.has(c.terrainId))
   throw Error('Geografische Waldklasse oder Terrain-ID ist inkonsistent.');
  const id=key(c);
  if(Object.hasOwn(overrides,id))throw Error('Doppelte geografische Waldzelle.');
  overrides[id]=c.forestClass;geographyHexes[id]=true;
  if(c.forestClass!=='none'&&Number.isFinite(c.forestDensity))
   densityOverrides[id]=c.forestDensity;
  if(c.baseBiome==='jungle')jungleHexes[id]=true;
 }
 // Every geography cell, including 'none', is a fixed override.
 // coverage:0 skips only the unnecessary synthetic grove-selection pass;
 // the actual edgeInfluence, glades and density logic stays unchanged.
 const options={...forest.defaults(),enabled:true,coverage:0,
  overrides,densityOverrides,geographyHexes,jungleHexes};
 const generated=forest.generate(world.cells,catalog,options,
  c=>c.terrainId,c=>c.terrainId);
 if(generated.length!==world.cells.length)
  throw Error('Der Waldgenerator hat geografische Zellen verloren.');
 const cells=generated.map((c,i)=>{
  const original=world.cells[i];
  if(c.q!==original.q||c.r!==original.r||
     c.forestClass!==original.forestClass)
   throw Error('Der Waldgenerator widerspricht geografischen Waldklassen.');
  const t=terrain.get(c.baseBiome);
  return {...c,categoryId:t?.categoryId,
   ground:t?.materialClass==='ground'};
 });
 const byKey=new Map(cells.map(c=>[key(c),c]));
 const opacityByHex=new Map();
 let regionCount=0;
 for(const region of floor.regions(cells)){
  regionCount++;
  const opacity=region.reduce((a,c)=>a+floor.strength(c),0)/region.length;
  for(const c of region)opacityByHex.set(key(c),opacity);
 }
 const asset=(groups.byType.get('forest_floor')||[])[0]||null;
 const forestHexes=cells.filter(c=>floor.eligible(c)).length;
 async function render(context){
  if(!context?.tile||!Array.isArray(context.cells)||
     !Number.isSafeInteger(context.sourceHalo)||context.sourceHalo<SOURCE_HALO)
   throw Error('Original-Waldboden benötigt einen 768er Geografie-Halo.');
  const b={x:context.tile.x-PAD,y:context.tile.y-PAD,
   width:SIZE+2*PAD,height:SIZE+2*PAD};
  const local=context.cells.map(c=>{
   const source=byKey.get(key(c));
   if(!source)throw Error('Fremde geografische Waldzelle im Renderauftrag.');
   return source;
  });
  if(!local.some(c=>floor.eligible(c)&&near(c,b,245)))
   return {stage:'original-forest-floor-preview',canvas:null,
    regions:0,forestHexes:0,glades:0,assetPath:null,
    complete:false,readyForViewer:false};
  if(!asset?.path)throw Error('Original-Waldboden fehlt im Terrainkatalog: forest_floor.');
  const loaded=await loadImage(asset),img=loaded?.img||loaded;
  if(!(img?.naturalWidth>0&&img?.naturalHeight>0))
   throw Error('Original-Waldboden-PNG fehlt oder ist nicht dekodiert: '+asset.path);
  const size=Math.max(160,Math.min(1536,
   Number(asset.meta?.textureWorldSize)||256));
  const raster=floor.build(local,img,{
   bounds:b,resolution:RESOLUTION,maxPixels:2600000,
   feather:23,textureSize:size,
   regionOpacityOf:c=>opacityByHex.get(key(c))
  });
  if(!raster?.canvas||raster.textureOrigin!=='world-0,0')
   throw Error('Original-Waldboden konnte nicht nahtstabil gerendert werden.');
  return {stage:'original-forest-floor-preview',canvas:raster.canvas,
   x:raster.x,y:raster.y,width:raster.width,height:raster.height,
   regions:raster.regions,forestHexes:raster.cells,
   glades:local.filter(c=>c.glade&&floor.eligible(c)).length,
   scale:raster.scale,assetPath:asset.path,
   complete:false,readyForViewer:false};
 }
 return {sourceHalo:SOURCE_HALO,forestHexes,regionCount,
  forestCells:cells,cellById:byKey,opacityByHex,render};
}
const api={SOURCE_HALO,RESOLUTION,create};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.VedrasLargeMapBakeForestFloor=api;
})(typeof window!=='undefined'?window:globalThis);

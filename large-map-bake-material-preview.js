/* Experimental, direct-from-Geography REAL terrain-material raster preview.
 * Reuses the exact VedrasAutotile.build() image compositor and the LIVE
 * Asset-Labor terrain catalog. Does NOT produce a complete game tile:
 * no relief, shoreline art, rivers, forest floor, sprites or shadows.
 * Deliberately incompatible with the "complete PNG" bake receipt format.
 */
(function(root){
'use strict';
const SCALE=2.5,PROJECT_Y=.85,SIZE=512,PAD=3,SOURCE_PAD=128;
const MAX_PREVIEW_PIXELS=4200000;
const PLAIN=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validPath=s=>typeof s==='string'&&
 /^assets\/terrain\/[A-Za-z0-9_.-]+\.(?:png|webp|jpe?g)$/i.test(s)&&
 !s.includes('..');
function hash(q,r,k=11){
 let n=(309175+Math.imul(q+4096,374761393)+
  Math.imul(r+4096,668265263)+Math.imul(k+11,2246822519))|0;
 n^=n>>>13;n=Math.imul(n,1274126177);
 return (n^(n>>>16))>>>0;
}
function assetGroups(catalog,listing){
 if(!PLAIN(catalog)||!Array.isArray(catalog.terrainTypes)||
    !PLAIN(catalog.assets)||!Array.isArray(listing))
  throw Error('Aktueller Asset-Labor-Terrainkatalog und Assetliste fehlen.');
 const byType=new Map(),byPath=new Map();
 const types=new Map(catalog.terrainTypes.map(t=>[t.id,t]));
 for(const raw of listing){
  if(raw?.category!=='terrain'||!validPath(raw.path)||byPath.has(raw.path))
   continue;
  if(raw.meta?.assetType==='legacy_hex_block'||
     raw.meta?.assetType==='concept_hex')continue;
  const descriptor=catalog.assets[raw.relPath];
  const id=descriptor?.terrainTypeId;
  if(!types.has(id)||types.get(id)?.archived)continue;
  const entry={path:raw.path,relPath:raw.relPath,mtime:raw.mtime,
   meta:raw.meta||{},terrainTypeId:id};
  byPath.set(entry.path,entry);
  if(!byType.has(id))byType.set(id,[]);
  byType.get(id).push(entry);
 }
 // /api/assets is lexicographically ordered, exactly as editor loadLibrary.
 // Sorting here also handles alternate/mock listings deterministically.
 for(const group of byType.values())group.sort((a,b)=>a.path.localeCompare(b.path,'en'));
 return {byType,types,byPath};
}
function pick(cell,groups){
 if(!Number.isSafeInteger(cell?.q)||!Number.isSafeInteger(cell?.r))
  throw Error('Ungültiges geografisches Hex für Materialwahl.');
 const typeId=cell.terrainId;
 let choices=groups.byType.get(typeId)||[];
 // Match the editor's existing no-jungle-material fallback, but NEVER
 // silently substitute grassland or a different terrain type.
 if(typeId==='jungle'&&!choices.length)
  choices=groups.byType.get('forest_floor')||[];
 if(!choices.length)
  throw Error('Kein zugeordnetes Originalmaterial im Live-Katalog für Terrain '+typeId);
 return choices[hash(cell.q,cell.r)%choices.length];
}
function auditWorld(world,catalog,listing){
 if(!world||!Array.isArray(world.cells)||!world.cells.length)
  throw Error('Für den Material-Check fehlt die generierte Geografiewelt.');
 const groups=assetGroups(catalog,listing),counts=new Map();
 for(const cell of world.cells)
  counts.set(cell.terrainId,(counts.get(cell.terrainId)||0)+1);
 const missing=[],covered=[],fallbacks=[];
 for(const [terrainId,hexes] of [...counts].sort((a,b)=>a[0].localeCompare(b[0]))){
  const direct=groups.byType.get(terrainId)||[];
  const jungleFallback=terrainId==='jungle'&&!direct.length?
   groups.byType.get('forest_floor')||[]:[];
  if(direct.length){
   covered.push({terrainId,hexes,variants:direct.length});
  }else if(jungleFallback.length){
   fallbacks.push({terrainId,hexes,uses:'forest_floor',
    variants:jungleFallback.length});
  }else{
   missing.push({terrainId,hexes,reason:'Kein zugeordnetes Material im Live-Katalog'});
  }
 }
 return {stage:'material-catalog-preflight',readyForMaterialPreview:missing.length===0,
  readyForFinishedGameMap:false,worldHexes:world.cells.length,
  coveredHexes:covered.reduce((n,x)=>n+x.hexes,0)+
   fallbacks.reduce((n,x)=>n+x.hexes,0),
  missingHexes:missing.reduce((n,x)=>n+x.hexes,0),
  covered,fallbacks,missing};
}
async function loadCatalog({fetcher=root.fetch?.bind(root)}={}){
 if(typeof fetcher!=='function')throw Error('Lokaler Asset-Labor-Server fehlt.');
 const [c,a]=await Promise.all([
  fetcher('/api/terrain-catalog',{cache:'no-store'}),
  fetcher('/api/assets',{cache:'no-store'})
 ]);
 if(!c?.ok||!a?.ok)
  throw Error('Live-Terrainkatalog oder Dateiliste nicht erreichbar. Asset-Labor lokal starten.');
 const [catalog,list]=await Promise.all([c.json(),a.json()]);
 return {catalog,assets:list?.assets};
}
function imageLoader({makeImage=()=>new root.Image()}={}){
 const cache=new Map();
 return async asset=>{
  if(!cache.has(asset.path))cache.set(asset.path,(async()=>{
   const img=makeImage();
   if(!img)throw Error('Browser kann keine Original-Textur laden.');
   img.src='./'+asset.path+(asset.mtime?'?v='+asset.mtime:'');
   if(typeof img.decode==='function')await img.decode();
   else await new Promise((resolve,reject)=>{
    if(img.complete&&img.naturalWidth>0)return resolve();
    img.onload=resolve;img.onerror=()=>reject(Error('PNG-Laden fehlgeschlagen: '+asset.path));
   });
   if(!(img.naturalWidth||img.width))
    throw Error('Original-Textur ist leer: '+asset.path);
   return {...asset,img};
  })().catch(e=>{cache.delete(asset.path);throw e;}));
  return cache.get(asset.path);
 };
}
function create({world,plan,planner=root.VedrasLargeMapBakePlan,
 sourceAdapter=root.VedrasLargeMapBakeSource,
 autotile=root.VedrasAutotile,catalogApi=root.VedrasCatalog,
 reliefAdapter=root.VedrasLargeMapBakeGroundRelief,
 reliefApi=root.VedrasRelief,
 shorelineAdapter=root.VedrasLargeMapBakeShoreline,
 shorelineApi=root.VedrasShoreline,
 riversApi=root.VedrasRivers,
 riverAdapter=root.VedrasLargeMapBakeRivers,
 riverBanksApi=root.VedrasRiverBanks,
 forestAdapter=root.VedrasLargeMapBakeForestFloor,
 forestApi=root.VedrasForest,
 forestFloorApi=root.VedrasForestGround,
 catalog,assets,loadImage=imageLoader(),canvasFactory=
  ()=>root.document.createElement('canvas')}={}){
 if(typeof autotile?.build!=='function'||
    typeof sourceAdapter?.create!=='function'||
    typeof canvasFactory!=='function')
  throw Error('Gemeinsamer Autotile-Renderer oder Kachelquellen fehlen.');
 const groups=assetGroups(catalog,assets);
 const source=sourceAdapter.create(world,plan,{planner});
 const materialClass=id=>groups.types.get(id)?.materialClass||
  (id==='jungle'?'ground':null);
 function mode(a,b){
  if(catalogApi?.profile)return catalogApi.profile(catalog,a,b)?.mode;
  const c1=materialClass(a),c2=materialClass(b);
  return c1==='water'&&c2==='water'?'soft_water':
   c1==='ground'&&c2==='ground'?'soft_ground':'shoreline_required';
 }
 let shoreRenderer=null,riverRenderer=null,forestRenderer=null;
 async function renderTile(tileId,{withRelief=false,withShoreline=false,
  withRivers=false,withForest=false}={}){
  if(withRelief&&(!reliefAdapter?.apply||!reliefApi?.make))
   throw Error('Gemeinsamer 2.5D-Relief-Renderer wurde nicht geladen.');
  if(withShoreline&&(!shorelineAdapter?.create||!shorelineApi?.build||
     !riversApi?.mouthPortals))
   throw Error('Original-Uferrenderer und Flussmündungsprüfung fehlen.');
  if(withRivers&&(!riverAdapter?.create||!riverBanksApi?.prepare||
     !riversApi?.render))
   throw Error('Original-Flusswasser und Uferwand-Renderer fehlen.');
  if(withForest&&(!forestAdapter?.create||!forestApi?.generate||
     !forestFloorApi?.build||!forestFloorApi?.points))
   throw Error('Original-Wald-/Waldbodenrenderer fehlen.');
  const halo=Math.max(withRelief?(reliefAdapter.SOURCE_HALO||0):0,
   withShoreline?(shorelineAdapter.SOURCE_HALO||0):0,
   withRivers?(riverAdapter.SOURCE_HALO||0):0,
   withForest?(forestAdapter.SOURCE_HALO||0):0);
  const ctxData=source.contextFor(tileId,halo?{sourceHalo:halo}:{});
  const assignments=ctxData.cells.map(cell=>[cell,pick(cell,groups)]);
  const needed=[...new Map(assignments.map(([,a])=>[a.path,a])).values()];
  // Only selected source assets for THIS tile are decoded. 60k-world
  // source images never load in one giant batch.
  const decoded=await Promise.all(needed.map(loadImage));
  const images=new Map(decoded.map(a=>[a.path,a]));
  const resolved=new Map(assignments.map(([cell,a])=>[
   cell.q+','+cell.r,images.get(a.path)
  ]));
  if(resolved.size!==ctxData.cells.length)throw Error('Materialwahl enthält doppelte Hexe.');
  const t=ctxData.tile,bounds={x:t.x-SOURCE_PAD,y:t.y-SOURCE_PAD,
   width:t.size+2*SOURCE_PAD,height:t.size+2*SOURCE_PAD};
  const raster=autotile.build(ctxData.cells,
   cell=>resolved.get(cell.q+','+cell.r),
   cell=>cell.terrainId,{
    bounds,band:28,blendVariants:true,waterSampling:'hex',
    irregularity:5,blend:true,cornerBlend:true,
    resolution:SCALE,maxPixels:MAX_PREVIEW_PIXELS,
    materialClassOf:materialClass,transitionMode:mode
   });
  if(!raster?.canvas)
   throw Error('Gemeinsamer AutoTile-Renderer lieferte kein Materialraster.');
  const output=canvasFactory();
  output.width=Math.round((SIZE+PAD*2)*SCALE);
  output.height=Math.round((SIZE+PAD*2)*SCALE*PROJECT_Y);
  const g=output.getContext('2d',{alpha:true});
  if(!g)throw Error('Kachel-Canvas ist nicht verfügbar.');
  g.setTransform(SCALE,0,0,SCALE*PROJECT_Y,
   -(t.x-PAD)*SCALE,-(t.y-PAD)*SCALE*PROJECT_Y);
  const raised=withRelief?reliefAdapter.apply({
   context:ctxData,raster,types:[...groups.types.values()],
   relief:reliefApi,autotile
  }):null;
  if(raised){
   // This is the editor's material-water/raised-land ordering. Never
   // paint the opaque unraised all-terrain raster after the hill layer.
   autotile.draw(g,raised.water);
   autotile.draw(g,raised.land);
  }else g.drawImage(raster.canvas,raster.x,raster.y,raster.width,raster.height);
  // Identical editor order: terrain, elevated land, forest floor, coast,
  // river banks and water. Do not clip the soft forest-to-snow boundary.
  if(withForest&&!forestRenderer)forestRenderer=forestAdapter.create({
   world,catalog,groups,loadImage,forest:forestApi,floor:forestFloorApi
  });
  const forest=withForest?await forestRenderer.render(ctxData):null;
  if(forest?.canvas){
   g.save();g.beginPath();
   // Clip only to the outer authored world silhouette, as the editor.
   for(const cell of ctxData.cells){
    const pts=forestFloorApi.points(cell);
    g.moveTo(pts[0].x,pts[0].y);
    for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);
    g.closePath();
   }
   g.clip();
   g.drawImage(forest.canvas,forest.x,forest.y,forest.width,forest.height);
   g.restore();
  }
  if(withShoreline){
   if(!shoreRenderer)shoreRenderer=shorelineAdapter.create({
    world,catalog,shoreline:shorelineApi,rivers:riversApi,loadImage
   });
  }
  const shore=withShoreline?await shoreRenderer.render(ctxData,
   {withRiverWater:withRivers}):null;
  if(shore?.canvas)
   g.drawImage(shore.canvas,shore.x,shore.y,shore.width,shore.height);
  if(withRivers&&!riverRenderer)riverRenderer=riverAdapter.create({
   world,catalog,groups,loadImage,pick,
   rivers:riversApi,banks:riverBanksApi,relief:reliefApi
  });
  const river=withRivers?await riverRenderer.render(ctxData,g,
   {reliefOptions:withRelief?raised.options:null}):null;
  if(typeof output.toBlob!=='function'&&typeof output.convertToBlob!=='function')
   throw Error('Originalmaterial-Raster kann nicht als PNG kodiert werden.');
  const png=output.convertToBlob?
   await output.convertToBlob({type:'image/png'}):
   await new Promise((resolve,reject)=>output.toBlob(
    v=>v?resolve(v):reject(Error('PNG-Kodierung fehlgeschlagen.')),'image/png'));
  if(!(png instanceof Blob)||png.size<45)
   throw Error('Materialvorschau enthält keine gültige PNG-Datei.');
  const stage=withRivers?'original-river-ground-preview':
   withForest?'original-forest-ground-preview':
   (withShoreline?
    (withRelief?'material-relief-shoreline-preview':'material-shoreline-preview'):
    (withRelief?'material-relief-preview':'material-only-preview'));
  return {stage,complete:false,rasterized:true,readyForViewer:false,
   reliefHillSources:raised?.hillHexes||0,
   shorelineSegments:shore?.segmentCount||0,
   shorelineAssets:shore?.assetsUsed||[],
   riverMouthPortalsDeferred:shore?.deferredMouthPortals||0,
   riverMouthPortalsOpened:shore?.openedMouthPortals||0,
   riverRoutesRendered:river?.riverCount||0,
   riverBankLayers:river?.bankCount||0,
   riverWaterTextures:river?.texturePaths||[],
   forestFloorHexes:forest?.forestHexes||0,
   forestFloorRegions:forest?.regions||0,
   forestFloorGlades:forest?.glades||0,
   forestFloorAssets:forest?.assetPath?[forest.assetPath]:[],
   tile:{...t},source:ctxData.source,sourceCount:ctxData.sourceCount,
   assetPaths:needed.map(a=>a.path),
   width:output.width,height:output.height,png,
   omitted:[
    ...(withRelief?[]:['relief']),
    ...(withShoreline?[]:['shorelines']),
    ...(withRivers?[]:['rivers']),
    ...(withForest?[]:['forest']),
    'scenery','shadows'
   ]};
 }
 return {renderTile,tileCount:source.tileCount,
  availableTypes:[...groups.byType.keys()].sort(),
  previewOnly:true};
}
const api={SCALE,PROJECT_Y,SIZE,PAD,hash,assetGroups,pick,auditWorld,loadCatalog,
 imageLoader,create};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.VedrasLargeMapMaterialPreview=api;
})(typeof window!=='undefined'?window:globalThis);

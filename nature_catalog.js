/* Nature asset registry v0.9.1 — v0.9 files remain valid without migration. */
'use strict';
window.VedrasNatureCatalog=(()=>{
 const idOK=x=>typeof x==='string'&&/^[a-z][a-z0-9_]{0,63}$/.test(x);
 const validPath=x=>typeof x==='string'&&/^nature\/[\p{L}\p{N}_./-]+\.(?:png|webp|jpe?g|svg|gif|avif)$/iu.test(x)&&!x.includes('..');
 const kinds=['ground_cover','shrub','cluster','tree','rock','special','mountain'];
 const sizes=['tiny','small','medium','large','giant'];
 const shadows=['none','generic_small_round','generic_small_wide','generic_medium_round','generic_medium_wide','custom'];
 const initial=()=>({schemaVersion:1,revision:0,presets:{},entries:{}});
 const template=()=>({id:'',description:'',sourceReference:'',family:'',kind:'shrub',sizeClass:'small',sizeMode:'manual',logicalWidth:52,
  scaleMin:.85,scaleMax:1.15,anchor:{x:.5,y:.96},shadow:{mode:'generic_small_round',path:'',offsetX:-.24,offsetY:0,widthScale:.70,depthScale:.18},
  terrainPresetId:'',allowedTerrainCategories:[],allowedTerrainTypes:[],excludedTerrainTypes:[],
  placement:{weight:1,density:.22,minSpacing:28,canCluster:true,edgeMargin:12},mountain:{radius:1,coreRadius:0,shadowOpacity:.23,flatten:true},artStatus:'candidate',tags:[]});
 const validNum=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
 const rules=(m)=>({categoryIds:m.allowedTerrainCategories||m.categoryIds||[],typeIds:m.allowedTerrainTypes||m.typeIds||[],excludeIds:m.excludedTerrainTypes||m.excludeIds||[]});
 function effectiveTypes(m,terrain,catalog){
  const types=terrain?.terrainTypes||[],presets=catalog?.presets||{},base=m.terrainPresetId?presets[m.terrainPresetId]:null;
  const own=rules(m),shared=base?rules(base):{categoryIds:[],typeIds:[],excludeIds:[]};
  const cats=new Set([...shared.categoryIds,...own.categoryIds]),included=new Set([...shared.typeIds,...own.typeIds]);
  const removed=new Set([...shared.excludeIds,...own.excludeIds]);
  return new Set(types.filter(t=>!removed.has(t.id)&&(cats.has(t.categoryId)||included.has(t.id))).map(t=>t.id));
 }
 // Shared cold-region definition from the Terrain catalog.
 const COLD_BIOMES=['snowfields','frozen_tundra','tundra','highland'];
 const winterBoulder=meta=>meta?.family==='stones'&&
   /^boulder_(?:2[1-9]|30)$/.test(meta.id||'');
 const snowyBush=meta=>meta?.family==='snow_bushes'||
   /^snowy_bush(?:_\d+)?$/.test(meta?.id||'');
 // Hard ecological guard, independent of category presets and edited metadata.
 // Both generated and manually placed sprites MUST pass it. The anchor stays on
 // LAND; a mangrove crown may overhang adjacent water without spawning in it.
 function habitatOK(meta,typeId,neighborTypes=[],terrain=null){
  if(!meta||!typeId)return false;
  const registry=terrain?.terrainTypes||[];
  const tile=registry.find(t=>t.id===typeId);
  if(tile&&tile.materialClass!=='ground')return false;
  const f=meta.family,t=typeId,neighbors=new Set(neighborTypes||[]);
  const nearWater=[...neighbors].some(id=>registry.find(v=>v.id===id)?.materialClass==='water'||registry.find(v=>v.id===id)?.materialClass==='shoreline');
  const nearWarm=[...neighbors].some(id=>id==='jungle'||id==='savanna');
  const among=(...v)=>v.includes(t);
  // Winter boulders 21–30 and snowy_bush belong ONLY to cold biomes.
  // Their hard rule also overrides obsolete, overly broad catalog settings.
  if(winterBoulder(meta)||snowyBush(meta))return COLD_BIOMES.includes(t);
  if(f==='mangroves')return among('swamp','marshland')&&(nearWater||nearWarm);
  if(f==='palms')return among('jungle','savanna','tropical_coast');
  if(f==='jungle_trees'||f==='tropical_bushes')return among('jungle');
  if(f==='savanna_trees')return among('savanna','semi_desert');
  if(f==='cacti')return among('rocky_desert','sandy_desert','clay_desert','desert','semi_desert','sandy_rocky_desert','savanna');
  if(f==='succulents')return among('savanna','semi_desert','rocky_desert','sandy_desert','sandy_rocky_desert','badlands','desert');
  if(f==='ferns')return among('forest_floor','grassland','pasture','moor','swamp','marshland','jungle');
  if(f==='reeds')return among('moor','swamp','marshland');
  if(f==='cold_bushes')return among('tundra','frozen_tundra','highland');
  if(f==='snow_conifers'||f==='snow_dead_trees'||f==='snow_deadwood'||f==='snow_fallen_logs')return among('snowfields','frozen_tundra','tundra','highland');
  if(f==='riparian_trees')return among('moor','swamp','marshland')||
   among('grassland','pasture')&&(nearWater||[...neighbors].some(id=>['moor','swamp','marshland'].includes(id)));
  const snow=/(?:snow|schnee|verschneit|winter)/i.test([meta.id,meta.description,...(meta.tags||[])].join(' '));
  if(among('snowfields','frozen_tundra')&&!snow)return false;
  if(f==='dry_bushes')return !among('jungle','moor','swamp','marshland','tundra','highland');
  if(f==='herbs')return !among('jungle','swamp','marshland','ocean','snowfields','frozen_tundra');
  if(f==='flowering_bushes'||f==='temperate_bushes'||f==='heath')return !among('jungle','rocky_desert','sandy_desert','clay_desert');
  return true;
 }
 // Unified biome + overlay gate for manual placement, generation, rendering
 // and cleanup. The catalog is a preference, the underlying habitat a hard rule.
 function canPlace(meta,context,terrain,catalog=null){
  if(!meta||!context||meta.kind==='mountain')return false;
  const base=context.baseBiome,biome=context.biome||base;
  const all=terrain?.terrainTypes||[];
  const baseInfo=all.find(x=>x.id===base),logicalInfo=all.find(x=>x.id===biome);
  if(baseInfo?.materialClass!=='ground'||logicalInfo?.materialClass!=='ground')return false;
  const wet=['moor','swamp','marshland'],cold=['snowfields','frozen_tundra','tundra','highland'];
  if(winterBoulder(meta)||snowyBush(meta)){
   if(!COLD_BIOMES.includes(base))return false;
  }else if(meta.family==='stones'&&['snowfields','frozen_tundra'].includes(base))return false;
  const warm=['jungle','savanna'];
  const forest=['light_forest','dense_forest'].includes(context.forestClass);
  const jungle=biome==='jungle';
  // An editor-drawn forest floor and a generic forest must never create a
  // tropical climate. A jungle overlay is only valid on warm base terrain.
  if(jungle&&!warm.includes(base))return false;
  if(meta.family==='palms'&&(!warm.includes(base)||wet.includes(base)||cold.includes(base)))return false;
  if(['jungle_trees','tropical_bushes'].includes(meta.family)&&!jungle)return false;
  if(forest&&['cacti','succulents','dry_bushes'].includes(meta.family))return false;
  const allowed=effectiveTypes(meta,terrain,catalog);
  const listed=allowed.has(biome)||allowed.has(base)||
   (forest&&allowed.has('forest_floor')&&meta.family!=='palms');
  if(!listed)return false;
  const neighbors=context.neighborTypes||[];
  // Forest-floor overlays must not overwrite the real cold base biome.
  if(winterBoulder(meta)||snowyBush(meta))
   return habitatOK(meta,base,neighbors,terrain);
  // All plants other than explicit tropical-jungle species must survive the
  // original habitat test, even after a forest overlay changed their artwork.
  if(!['jungle_trees','tropical_bushes'].includes(meta.family)&&!habitatOK(meta,base,neighbors,terrain))return false;
  if(!habitatOK(meta,biome,neighbors,terrain))return false;
  return true;
 }
 function validate(catalog,terrain=null){const err=[];
  if(!catalog||catalog.schemaVersion!==1||!catalog.entries||Array.isArray(catalog.entries)||typeof catalog.entries!=='object')return ['Ungültiges Nature-Katalogformat.'];
  if(Object.keys(catalog.entries).length>10000)return ['Zu viele Nature-Sprites'];
  const ts=Array.isArray(terrain)?terrain:(terrain?.terrainTypes||[]).map(t=>t.id);
  const cs=Array.isArray(terrain)?null:(terrain?.categories||[]).map(c=>c.id);
  const presets=catalog.presets||{};
  if(!presets||typeof presets!=='object'||Array.isArray(presets)||Object.keys(presets).length>500)err.push('Ungültige Presets');
  function validRules(r,where){
   const {categoryIds,typeIds,excludeIds}=rules(r);
   for(const [field,list,valid] of [['Kategorien',categoryIds,cs],['Geländearten',typeIds,ts],['Ausnahmen',excludeIds,ts]]){
    if(!Array.isArray(list)||list.length>250||new Set(list).size!==list.length||list.some(x=>!idOK(x)||(valid&&!valid.includes(x))))err.push(field+' ungültig: '+where);
   }
  }
  for(const [id,preset] of Object.entries(presets)){
   if(!idOK(id)||!preset||typeof preset.name!=='string'||!preset.name.trim()||preset.name.length>90){err.push('Preset ungültig: '+id);continue;}
   validRules(preset,'Preset '+id);
  }
  const ids=new Set();
  for(const [path,e] of Object.entries(catalog.entries)){
   if(!validPath(path)){err.push('Ungültiger Nature-Pfad: '+path);continue;}
   if(!e||!idOK(e.id)||ids.has(e.id))err.push('Fehlende oder doppelte Sprite-ID: '+path);else ids.add(e.id);
   if(!e){continue;}
   if(typeof e.description!=='string'||e.description.length>600||typeof e.sourceReference!=='string'||e.sourceReference.length>300)err.push('Beschreibung/Quelle ungültig: '+path);
   if(!idOK(e.family)||!kinds.includes(e.kind)||!sizes.includes(e.sizeClass))err.push('Familie/Klasse/Größe ungültig: '+path);
   if(e.sizeMode!==undefined&&!['manual','class'].includes(e.sizeMode))err.push('Größenmodus ungültig: '+path);
   if(e.targetHeight!==undefined&&!validNum(e.targetHeight,4,400))err.push('Zielhöhe ungültig: '+path);
   if(!validNum(e.logicalWidth,4,400)||!validNum(e.scaleMin,.2,3)||!validNum(e.scaleMax,.2,3)||e.scaleMin>e.scaleMax)err.push('Größenwerte ungültig: '+path);
   if(!e.anchor||!validNum(e.anchor.x,0,1)||!validNum(e.anchor.y,0,1))err.push('Ankerwerte ungültig: '+path);
   if(!e.shadow||!shadows.includes(e.shadow.mode)||typeof e.shadow.path!=='string'||e.shadow.path.length>240||e.shadow.path.includes('..'))err.push('Schatten ungültig: '+path);
   if(e.shadow?.mode==='custom'&&!/^shadows\/[A-Za-z0-9_./-]+\.(?:png|webp|svg)$/i.test(e.shadow.path))err.push('Eigener Schattenpfad fehlt: '+path);
   for(const [field,min,max] of [['offsetX',-1,1],['offsetY',-.6,.6],['widthScale',.1,2],['depthScale',.03,1]]){
    if(e.shadow&&e.shadow[field]!==undefined&&!validNum(e.shadow[field],min,max))err.push('Schatten '+field+' ungültig: '+path);
   }
   if(e.kind==='mountain'){const mm=e.mountain||{};if(![1,2].includes(mm.radius)||![undefined,0,1].includes(mm.coreRadius)||!validNum(mm.shadowOpacity,0,.65)||typeof mm.flatten!=='boolean')err.push('Berg-Footprint/Schatten ungültig: '+path);}
   if(e.terrainPresetId!==undefined&&e.terrainPresetId!==''&&(!idOK(e.terrainPresetId)||!presets[e.terrainPresetId]))err.push('Preset fehlt: '+path);
   validRules(e,path);
   const p=e.placement||{};
   if(!validNum(p.weight,0,100)||!validNum(p.density,0,1)||!validNum(p.minSpacing,0,256)||typeof p.canCluster!=='boolean'||!validNum(p.edgeMargin,0,80))err.push('Platzierung ungültig: '+path);
   if(!['candidate','test','approved','deprecated'].includes(e.artStatus)||!Array.isArray(e.tags)||e.tags.length>30||e.tags.some(x=>typeof x!=='string'||x.length>50))err.push('Status/Tags ungültig: '+path);
  }
  return err;
 }
 return {idOK,validPath,kinds,sizes,shadows,initial,template,validate,effectiveTypes,habitatOK,canPlace,rules};
})();
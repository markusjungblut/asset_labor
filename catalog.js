/* Vedras terrain registry v0.8: category !== terrain type !== visual variant. */
'use strict';
window.VedrasCatalog = (() => {
 const seedGroups=[
  ['water_coast','Wasser und Küste',[['ocean','Ozean','water'],['coastal_water','Küstengewässer','water'],['coast','Küste (Küstenwasser)','water']]],
  ['cold_regions','Kalte Regionen',[['frozen_tundra','Gefrorene Tundra'],['tundra','Tundra'],['snowfields','Schneefelder']]],
  ['grass_pasture','Gras- und Weideland',[['grassland','Grasland'],['pasture','Weideland'],['sparse_pasture','karges Weideland']]],
  ['warm_regions','Warme Regionen',[['savanna','Savanne'],['jungle','Dschungel']]],
  ['wetlands','Feuchtgebiete',[['moor','Moor'],['marshland','Marschland'],['swamp','Sumpf']]],
  ['arid_regions','Trockene Regionen',[['rocky_desert','Steinwüste'],['sandy_desert','Sandwüste'],['clay_desert','Lehmwüste'],['badlands','Badlands'],['wasteland','Ödland']]],
  ['demo_regions','Weitere Testgelände',[['forest_floor','Waldboden (Test)'],['hilly_ground','Hügelboden (Test)'],['mountain_ground','Gebirgsboden (Test)'],['dry_ground','Trockener Boden (Test)']]]
 ];
 const starter=()=>({schemaVersion:2,categories:seedGroups.map(([id,name],i)=>({id,name,sortOrder:i*10})),terrainTypes:seedGroups.flatMap(([categoryId,,items])=>items.map(([id,name,materialClass='ground'])=>({id,name,categoryId,materialClass,transitionProfileId:materialClass==='ground'?'organic_ground':materialClass==='water'?'soft_water':'shoreline_required'}))),transitionProfiles:[{id:'organic_ground',mode:'soft_ground',defaultBand:28},{id:'soft_water',mode:'soft_water',defaultBand:42},{id:'shoreline_required',mode:'shoreline_required',defaultBand:0}],assets:{}});
 const validId=id=>typeof id==='string'&&/^[a-z][a-z0-9_]{0,59}$/.test(id);
 function validate(obj){const errors=[];
  if(!obj||obj.schemaVersion!==2||!Array.isArray(obj.categories)||!Array.isArray(obj.terrainTypes)||!obj.assets||typeof obj.assets!=='object')return ['Ungültiges Terrain-Katalog-Schema v2.'];
  for(const name of ['categories','terrainTypes','transitionProfiles']){if(!Array.isArray(obj[name])){errors.push(`${name} fehlt`);continue;}const ids=new Set();for(const row of obj[name]){if(!validId(row?.id))errors.push(`Ungültige ID in ${name}`);else if(ids.has(row.id))errors.push(`Doppelte ID: ${row.id}`);ids.add(row.id);}}
  const catIds=new Set((obj.categories||[]).map(x=>x.id)),profileIds=new Set((obj.transitionProfiles||[]).map(x=>x.id));
  for(const row of obj.terrainTypes||[]){if(!catIds.has(row.categoryId))errors.push(`Unbekannte Kategorie bei ${row.id}`);if(!profileIds.has(row.transitionProfileId))errors.push(`Unbekanntes Übergangsprofil bei ${row.id}`);if(!['ground','water','shoreline'].includes(row.materialClass))errors.push(`Ungültige Materialklasse bei ${row.id}`);}
  const typeIds=new Set(obj.terrainTypes.map(x=>x.id));for(const [path,entry] of Object.entries(obj.assets)){if(path.includes('..')||path.startsWith('/')||path.includes('\\'))errors.push('Ungültiger Asset-Pfad');if(!typeIds.has(entry?.terrainTypeId))errors.push(`Unbekannte Geländeart bei ${path}`);}
  return errors;
 }
 function terrainType(catalog,id){return catalog.terrainTypes.find(t=>t.id===id)||null;}
 function category(catalog,id){return catalog.categories.find(t=>t.id===id)||null;}
 function materialType(catalog,a){const id=catalog?.assets?.[a?.relPath]?.terrainTypeId||a?.meta?.terrainTypeId;return terrainType(catalog,id)?.id||null;}
 function assign(catalog,asset,typeId){if(!terrainType(catalog,typeId))throw Error('Unbekannte Geländeart');catalog.assets[asset.relPath]={terrainTypeId:typeId,variantFamilyId:typeId+'_base'};return catalog;}
 function profile(catalog,first,second){if(!first||!second)return {mode:'missing'};if(first===second)return {mode:'variant'};const a=terrainType(catalog,first),b=terrainType(catalog,second);if(!a||!b)return {mode:'missing'};if(a.materialClass==='water'&&b.materialClass==='water')return {mode:'soft_water'};if(a.materialClass==='ground'&&b.materialClass==='ground')return {mode:'soft_ground'};return {mode:'shoreline_required'};}
 // Existing catalogs from v0.10.1 may contain new ocean types incorrectly defaulted to 'ground'.
 // Migration is limited to the canonical water category. Other/custom categories remain explicit.
 function migrateWaterTypes(catalog){let changed=false;
  if(!catalog.transitionProfiles.some(p=>p.id==='soft_water')){catalog.transitionProfiles.push({id:'soft_water',mode:'soft_water',defaultBand:42});changed=true;}
  for(const type of catalog.terrainTypes){
   if(type.categoryId!=='water_coast')continue;
   // v0.10.4 misclassified the actual coastal-water terrain `coast` as an edge.
   // Only the legacy coast ID is force-migrated; other explicit shoreline types remain supported.
   const shoreline=type.id!=='coast'&&type.materialClass==='shoreline';
   const wanted=shoreline?'shoreline':'water',profileId=shoreline?'shoreline_required':'soft_water';
   if(type.materialClass!==wanted){type.materialClass=wanted;changed=true;}
   if(type.transitionProfileId!==profileId){type.transitionProfileId=profileId;changed=true;}
  }return changed;
 }
 function profileIdFor(materialClass){return materialClass==='water'?'soft_water':materialClass==='shoreline'?'shoreline_required':'organic_ground';}
 return {starter,validate,terrainType,category,materialType,assign,profile,validId,migrateWaterTypes,profileIdFor};
})();
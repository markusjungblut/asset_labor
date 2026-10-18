/* Exakte Dateinamen-Familien aus plans/terrain_asset_plan.json (25 bestätigte Gruppen). */
'use strict';
window.VedrasTerrainSources=(()=>{
 const families=[["badlands","Badlands","badlands","arid_regions","ground","terrain_base"],["cosatal_water","Küstenwasser","coastal_water","water_coast","water","terrain_base"],["frozen_tundra_base","Gefrorene Tundra","frozen_tundra","cold_regions","ground","terrain_base"],["grassland","Grasland","grassland","grass_pasture","ground","terrain_base"],["halbwueste","Halbwüste","semi_desert","arid_regions","ground","terrain_base"],["hochland","Hochland","highland","cold_regions","ground","terrain_base"],["icy_ocean","Eisiger Ozean","icy_ocean","water_coast","water","terrain_base"],["karges_weideland","Karges Weideland","sparse_pasture","grass_pasture","ground","terrain_base"],["lehmwueste","Lehmwüste","clay_desert","arid_regions","ground","terrain_base"],["marshland","Marschland","marshland","wetlands","ground","terrain_base"],["moor","Moor","moor","wetlands","ground","terrain_base"],["ocean","Ozean","ocean","water_coast","water","terrain_base"],["oedland","Ödland","wasteland","arid_regions","ground","terrain_base"],["sandige_steinige_wueste","Sandig-steinige Wüste","sandy_rocky_desert","arid_regions","ground","terrain_base"],["sandy_badlands","Sandige Badlands","sandy_badlands","arid_regions","ground","terrain_base"],["savanne","Savanne","savanna","warm_regions","ground","terrain_base"],["schneefeld","Schneefeld","snowfields","cold_regions","ground","terrain_base"],["steinige_badlands","Steinige Badlands","rocky_badlands","arid_regions","ground","terrain_base"],["steinige_wueste","Steinige Wüste","rocky_desert","arid_regions","ground","terrain_base"],["stormy_ocean","Stürmischer Ozean","stormy_ocean","water_coast","water","terrain_base"],["sumpf","Sumpf","swamp","wetlands","ground","terrain_base"],["tundra_base","Tundra","tundra","cold_regions","ground","terrain_base"],["wald","Waldboden","forest_floor","demo_regions","ground","forest_floor_overlay_not_base_biome"],["weideland","Weideland","pasture","grass_pasture","ground","terrain_base"],["wueste","Wüste (generisch)","desert","arid_regions","ground","terrain_base"]];
 const rules=families.map(([sourceStem,name,terrainTypeId,categoryId,materialClass,role])=>({sourceStem,name,terrainTypeId,categoryId,materialClass,role}));
 function match(asset){
  if(asset?.category!=='terrain'||typeof asset.name!=='string')return null;
  const m=/^(.+)_([0-9]+)\.(?:png|webp|jpe?g)$/i.exec(asset.name);
  if(!m)return null;
  return rules.find(r=>r.sourceStem===m[1].toLowerCase())||null;
 }
 function ensureTypes(catalog){
  if(!catalog?.terrainTypes||!catalog?.categories)return false;
  const known=new Set(catalog.terrainTypes.map(t=>t.id));
  const cats=new Set(catalog.categories.map(c=>c.id));
  let changed=false;
  for(const r of rules){
   if(known.has(r.terrainTypeId)||!cats.has(r.categoryId))continue;
   catalog.terrainTypes.push({id:r.terrainTypeId,name:r.name,categoryId:r.categoryId,materialClass:r.materialClass,transitionProfileId:r.materialClass==='water'?'soft_water':'organic_ground'});
   known.add(r.terrainTypeId);changed=true;
  }
  return changed;
 }
 function propose(catalog,assets,isValid){
  let assigned=0;const skipped=[];
  for(const a of assets){
   const r=match(a);if(!r||catalog.assets[a.relPath])continue;
   if(!isValid(a)||!catalog.terrainTypes.some(t=>t.id===r.terrainTypeId)){skipped.push(a.name);continue;}
   catalog.assets[a.relPath]={terrainTypeId:r.terrainTypeId,variantFamilyId:r.terrainTypeId+'_base'};
   assigned++;
  }
  return {assigned,skipped};
 }
 return {rules,match,ensureTypes,propose};
})();

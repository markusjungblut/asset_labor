/* Balanced, deliberately diverse geography-lab preview preset.
 * Works with the shared engine and never modifies existing saved worlds.
 */
(function(root){
"use strict";
const PRESET=Object.freeze({
  name:"Vielfalt-Mix",seed:"vedras-welt-01",width:95,height:75,
  originQ:0,originR:0
});
const OVERRIDES=Object.freeze({
  "water.fraction":0.22,
  "water.iceTemperature":0.28,
  "climate.scale":11,
  "climate.temperature":0.55,
  "climate.tempVariation":0.72,
  "climate.humidity":0.50,
  "climate.humidityVariation":0.72,
  "biomes.coldBoundary":0.34,
  "biomes.warmBoundary":0.76,
  "biomes.aridWarmBoundary":0.40,
  "biomes.dryThreshold":0.31,
  "biomes.wetThreshold":0.73,
  "biomes.wetlandBoundary":0.72,
  "biomes.jungleWarmBoundary":0.82,
  "biomes.regionClimateMix":0.58,
  "biomes.targetHexes":50,
  "biomes.snowHumidity":0.40,
  "biomes.semiDesertMargin":0.015,
  "geology.highlandColdMargin":0.15,
  "geology.grassSparseHumidity":0.28,
  "geology.pastureSoil":0.22,
  "geology.swampWarmBoundary":0.50,
  "geology.aridPatchMix":1,
  "geology.aridRockyBadlands":16,
  "geology.aridDesert":20,
  "geology.aridSandyBadlands":20
});
function configFor(generator){
 if(!generator?.normalizeConfig||!generator?.defaultConfig)
  throw TypeError("Geografie-Engine fehlt.");
 return generator.normalizeConfig({...generator.defaultConfig(),...OVERRIDES});
}
function inspect(world,generator){
 const s=world?.stats;
 if(!s||!generator?.TERRAIN_IDS||!s.biomes||!s.terrains)
  throw TypeError("Für die Mischung muss eine Welt generiert sein.");
 const land=s.land;
 const biomes=Object.fromEntries(generator.BIOME_IDS.map(id=>[id,s.biomes[id]||0]));
 const shares=Object.fromEntries(generator.BIOME_IDS.map(id=>
  [id,land?100*biomes[id]/land:0]));
 const missing=generator.TERRAIN_IDS.filter(id=>!s.terrains[id]);
 const wetDryGap=Math.abs(shares.arid-shares.wetland);
 const highland=s.terrains.highland||0;
 const checks={
  allTerrains:missing.length===0,
  grasslandMoreThanCold:biomes.grassland>biomes.cold,
  highlandAtLeast200:highland>=200,
  wetDryComparable:wetDryGap<=5
 };
 return {land,biomes,shares,wetDryGap,highland,missing,
  terrainPresent:generator.TERRAIN_IDS.length-missing.length,
  terrainTotal:generator.TERRAIN_IDS.length,checks,
  allGoalsMet:Object.values(checks).every(Boolean)};
}
const api={PRESET,OVERRIDES,configFor,inspect};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasGeographyLabMix=api;
})(typeof window!=="undefined"?window:globalThis);

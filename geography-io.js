/* Geography Lab: validated, reversible file I/O. No generated-map, artwork,
 * scene or catalog changes happen until a complete input has been checked.
 * Shared by standalone Geography Lab and Asset-Labor's geography importer.
 */
'use strict';
window.VedrasGeographyIO=(()=>{
 const MAX_BYTES=30*1024*1024,OLD_VERSIONS=[
  'geography-v2.0.0','geography-v2.1.0','geography-v2.1.1'];
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const object=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
 function readSettings(raw,G,{allowLegacy=false}={}){
  if(!object(raw))throw Error('JSON muss ein Geografie-Objekt enthalten.');
  const version=raw.generatorVersion||raw.version;
  if(!version||typeof version!=='string')throw Error('Generatorversion fehlt.');
  const legacy=version!==G.VERSION;
  if(legacy&&(!OLD_VERSIONS.includes(version)||!allowLegacy))
   throw Error(OLD_VERSIONS.includes(version)?
    'Weltversion '+version+' benötigt vor dem Import eine ausdrückliche Bestätigung.':
    'Unbekannte Geografie-Version '+version+'.');
  if(typeof raw.seed!=='string'||!raw.seed.length||raw.seed.length>256)
   throw Error('World Seed muss 1–256 Zeichen lang sein.');
  const width=raw.width,height=raw.height;
  if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||
   width<10||height<10||width>240||height>240||width*height>60000)
   throw Error('Kartengröße muss 10–240 Hex pro Achse und maximal 60.000 Hex enthalten.');
  const originQ=raw.originQ??0,originR=raw.originR??0;
  if(!Number.isSafeInteger(originQ)||!Number.isSafeInteger(originR)||
   Math.abs(originQ)>1000000||Math.abs(originR)>1000000)
   throw Error('Ungültige Weltstart-Koordinaten Q/R.');
  if(!object(raw.config))throw Error('Generatorparameter fehlen oder sind ungültig.');
  const config=G.normalizeConfig(raw.config);
  return {version,legacy,seed:raw.seed,width,height,originQ,originR,config};
 }
 function generate(raw,G,options={}){
  const settings=readSettings(raw,G,options);
  const {seed,width,height,originQ,originR,config}=settings;
  const world=G.generateWorld(seed,{width,height,originQ,originR,config});
  if(options.requireWorld&&!Array.isArray(raw.cells))
   throw Error('Dies ist eine Parameterdatei, keine exportierte Welt mit Hexdaten.');
  if(Array.isArray(raw.cells)){
   if(raw.cells.length!==world.cells.length)
    throw Error('Hexanzahl in der gespeicherten Welt stimmt nicht.');
   // The same-version export must round-trip EXACTLY. Never silently
   // discard an edited/corrupt terrain array and pretend import succeeded.
   if(!settings.legacy&&JSON.stringify(raw.cells)!==JSON.stringify(world.cells))
    throw Error('Gespeicherte Hexdaten stimmen nicht mit Seed und Parametern überein.');
   if(!settings.legacy&&JSON.stringify(raw.riverPaths??[])!==
     JSON.stringify(world.riverPaths??[]))
    throw Error('Gespeicherte Flussrouten stimmen nicht mit der Welt überein.');
  }
  return {world,settings};
 }
 function signature(world,G){
  return JSON.stringify({version:G.VERSION,seed:world.seed,width:world.width,
   height:world.height,originQ:world.originQ,originR:world.originR,
   config:world.config});
 }
 function readStatistics(raw,world,G){
  if(!object(raw)||raw.generatorVersion!==G.VERSION)
   throw Error('Die Statistikdatei hat eine andere oder fehlende Generatorversion.');
  if(!world||raw.seedBase!==world.seed||
   raw.width!==world.width||raw.height!==world.height||
   (raw.originQ??0)!==(world.originQ??0)||
   (raw.originR??0)!==(world.originR??0)||
   JSON.stringify(G.normalizeConfig(raw.config))!==JSON.stringify(world.config))
   throw Error('Die Statistik passt nicht zur momentan angezeigten Welt.');
  if(!Number.isSafeInteger(raw.samples)||raw.samples<2||raw.samples>40||
   !Number.isFinite(raw.meanHexes)||raw.meanHexes!==world.width*world.height||
   !Number.isFinite(raw.meanLand)||raw.meanLand<0||raw.meanLand>raw.meanHexes||
   !object(raw.biomes)||!object(raw.terrains))
   throw Error('Unvollständige oder ungültige Verteilungsstatistik.');
  function verify(group,ids){
   for(const id of ids){
    const v=group[id];
    if(!object(v)||!Number.isFinite(v.total)||v.total<0||
     !Number.isFinite(v.mean)||v.mean<0||
     !Number.isFinite(v.percent)||v.percent<0||v.percent>100||
     !Number.isSafeInteger(v.worldsPresent)||v.worldsPresent<0||
     v.worldsPresent>raw.samples)
     throw Error('Ungültige Statistikwerte für '+id+'.');
   }
  }
  verify(raw.biomes,G.BIOME_IDS);verify(raw.terrains,G.TERRAIN_IDS);
  return {generatorVersion:G.VERSION,samples:raw.samples,
   meanHexes:raw.meanHexes,meanLand:raw.meanLand,
   biomes:raw.biomes,terrains:raw.terrains};
 }
 async function parseFile(file){
  if(!file||typeof file.text!=='function')throw Error('Keine JSON-Datei ausgewählt.');
  if(file.size>MAX_BYTES)throw Error('Datei ist größer als 30 MiB.');
  let raw;
  try{raw=JSON.parse(await file.text());}catch{
   throw Error('Datei enthält kein gültiges JSON.');
  }
  if(!object(raw))throw Error('Die JSON-Datei muss ein Objekt enthalten.');
  return raw;
 }
 function saveJSON(name,raw){
  if(!/^[a-zA-Z0-9_.-]+\.json$/.test(name))
   throw Error('Ungültiger Export-Dateiname.');
  const json=JSON.stringify(raw,null,2);
  if(typeof json!=='string')throw Error('Export konnte nicht serialisiert werden.');
  const blob=new Blob([json],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;
  // Firefox needs the download anchor inside the document for consistent
  // user-activated downloads; detached click() is not portable.
  document.body.appendChild(a);
  try{a.click();}finally{
   a.remove();
   window.setTimeout(()=>URL.revokeObjectURL(url),15000);
  }
  return {filename:name,bytes:blob.size};
 }
 return {MAX_BYTES,OLD_VERSIONS,readSettings,generate,readStatistics,
  signature,parseFile,saveJSON};
})();

/* Immutable, editor-authored world data. No terrain generation or PNG decoding.
 * Separate from the frozen viewer's small geometry manifest and dynamic Fog.
 */
'use strict';
window.VedrasAuthoredWorld=(()=>{
 const SCHEMA='vedras-asset-labor-scene-0.8',VERSION=3;
 const MAX_CELLS=60000,MAX_JSON_BYTES=28*1024*1024;
 const plain=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
 function validate(raw){
  if(!plain(raw)||raw.schema!==SCHEMA||raw.schemaVersion!==VERSION||
     !Number.isSafeInteger(raw.sceneSize)||raw.sceneSize<1||
     !Array.isArray(raw.worldCells)||raw.worldCells.length!==raw.sceneSize||
     raw.worldCells.length>MAX_CELLS)return false;
  const seen=new Set();
  for(const cell of raw.worldCells){
   if(!plain(cell)||!Number.isSafeInteger(cell.q)||!Number.isSafeInteger(cell.r)||
      Math.abs(cell.q)>1000000||Math.abs(cell.r)>1000000||
      typeof cell.biome!=='string'||cell.biome.length>128||
      typeof cell.terrainTypeId!=='string'||cell.terrainTypeId.length>128)
    return false;
   const id=cell.q+','+cell.r;
   if(seen.has(id))return false;
   seen.add(id);
   for(const k of ['worldQ','worldR'])
    if(cell[k]!==undefined&&(!Number.isSafeInteger(cell[k])||
       Math.abs(cell[k])>100000000))return false;
  }
  if(raw.geographySource!==null&&raw.geographySource!==undefined){
   const source=raw.geographySource;
   if(!plain(source)||typeof source.version!=='string'||source.version.length>80||
      typeof source.seed!=='string'||source.seed.length>256||
      !Number.isSafeInteger(source.width)||source.width<1||
      !Number.isSafeInteger(source.height)||source.height<1||
      !Number.isSafeInteger(source.originQ)||
      !Number.isSafeInteger(source.originR)||!plain(source.config))
    return false;
  }
  return true;
 }
 function serialize(raw){
  if(!validate(raw))throw Error('Ungültige oder unvollständige Weltdaten');
  const json=JSON.stringify(raw);
  if(!json||new TextEncoder().encode(json).byteLength>MAX_JSON_BYTES)
   throw Error('Weltdaten überschreiten das sichere Archivlimit');
  return json;
 }
 function clone(raw){return JSON.parse(serialize(raw));}
 return {SCHEMA,VERSION,MAX_CELLS,MAX_JSON_BYTES,validate,serialize,clone};
})();

/* Step 16: bounded cache for complete world-aligned GROUND rasters only.
 * Scenery/units remain independent; a changed ground fingerprint never reuses
 * stale terrain. No camera pan or screen DPR is part of the identity.
 */
'use strict';
window.VedrasGroundTileReuse=(()=>{
 function create({maxBytes=44*1024*1024,maxEntries=24}={}){
  const entries=new Map();let bytes=0,hits=0,misses=0,evicted=0,stored=0,invalidated=0;
  const key=(tile,level)=>tile.id+'@'+level;
  function get(tile,level,revision){
   const k=key(tile,level),v=entries.get(k);
   if(!v||!revision||v.revision!==revision){misses++;return null;}
   entries.delete(k);entries.set(k,v);
   hits++;return v.image;
  }
  function put(tile,level,revision,image){
   if(!revision||!image?.width||!image.height)return false;
   const k=key(tile,level),cost=image.width*image.height*4;
   if(cost>maxBytes)return false;
   const previous=entries.get(k);
   if(previous){entries.delete(k);bytes-=previous.bytes;}
   entries.set(k,{revision,image,bytes:cost});bytes+=cost;stored++;
   while((bytes>maxBytes||entries.size>maxEntries)&&entries.size){
    const oldest=entries.keys().next().value,entry=entries.get(oldest);
    entries.delete(oldest);bytes-=entry.bytes;evicted++;
   }
   return true;
  }
  // Ground invalidation follows the same world-tile IDs as the authoritative
  // terrain neighbor-footprint. A changed source must not flush distant tiles.
  function invalidateTiles(ids){
   if(!(ids instanceof Set))return 0;
   let count=0;
   for(const [k,v] of entries){
    if(!ids.has(k.slice(0,k.lastIndexOf('@'))))continue;
    entries.delete(k);bytes-=v.bytes;count++;
   }
   invalidated+=count;
   return count;
  }
  function clear(){entries.clear();bytes=0;}
  function stats(){return {entries:entries.size,bytes,budgetBytes:maxBytes,
   hits,misses,evicted,stored,invalidated};}
  return {get,put,invalidateTiles,clear,stats};
 }
 return {create};
})();

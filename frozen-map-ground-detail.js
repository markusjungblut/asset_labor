/* Optional high-detail Ground playback: original 4× terrain with standard
 * 2× scenery and 1× overview. No PNGs are written or modified.
 * Ground source PNGs already exist in the immutable frozen-world store. */
'use strict';
window.VedrasFrozenGroundDetail=(()=>{
 const GROUND=new Set(['ground','terrain']);
 function merge(raw,derived){
  if(!raw||!derived||raw.key!==derived.key||raw.revision!==derived.revision||
   !Array.isArray(raw.layers)||!Array.isArray(derived.layers)||
   raw.layers.length!==derived.layers.length)return derived;
  const layers=derived.layers.map((layer,i)=>{
   const source=raw.layers[i];
   return GROUND.has(layer.layer)&&source?.layer===layer.layer&&
    source.png instanceof Blob?source:layer;
  });
  return {...derived,layers,groundDetailSource:'original-4x'};
 }
 function createStore({standard,overview,original}={}){
  if(!standard?.get||!overview?.getVariant||!original?.get)
   throw Error('4×-Bodenmodus benötigt vorhandene Karten-Reader');
  let enabled=false;
  const counters={reads:0,originalGrounds:0,missingOriginals:0};
  const get=async key=>{
   const derived=await standard.get(key);
   if(!enabled||!derived||key.endsWith('|manifest'))return derived;
   const raw=await original.get(key);
   const result=merge(raw,derived);
   counters.reads++;
   if(result.groundDetailSource==='original-4x')counters.originalGrounds++;
   else counters.missingOriginals++;
   return result;
  };
  return {
   get,
   getVariant:(key,variant)=>variant==='1x'?overview.getVariant(key,'1x'):get(key),
   keys:prefix=>standard.keys(prefix),
   setEnabled:value=>{enabled=value===true;},
   stats:()=>({...counters,enabled})
  };
 }
 return {merge,createStore};
})();

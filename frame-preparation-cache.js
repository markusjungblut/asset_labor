/* v0.17: render preparation is owned by the mutable scene, not the camera.
 * A new revision invalidates cached expensive JSON signatures, selected
 * material arrays and river/road geometry. Failed builders are not retained.
 */
'use strict';
window.VedrasFrameMemo=(()=>{
 function create(){
  let revision=0,values=new Map(),hits=0,misses=0,buildMs=0;
  function invalidate(){revision++;values.clear();}
  function use(slot,variant,build){
   const k=slot+'|'+revision+'|'+variant;
   const value=values.get(slot);
   if(value?.key===k){hits++;return value.data;}
   const t=typeof performance!=='undefined'?performance.now():Date.now();
   const data=build();
   values.set(slot,{key:k,data});misses++;
   buildMs+=(typeof performance!=='undefined'?performance.now():Date.now())-t;
   return data;
  }
  function stats(){return {revision,hits,misses,entries:values.size,buildMs};}
  return {use,invalidate,stats};
 }
 return {create};
})();

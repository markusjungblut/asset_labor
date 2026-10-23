/* Vedras Asset-Labor v0.15.3: scene-owned object layout cache.
 * A pan/zoom changes the viewport, NOT the objects' world positions, scale,
 * legality on roads/rivers or terrain heights. Keep that work until an edit
 * invalidates it. No assets or serialized scene state are changed.
 */
'use strict';
window.VedrasObjectLayoutCache=(()=>{
 function create(){
  let revision=0,builtRevision=-1,objects=[],builds=0,hits=0,lastBuildMs=0;
  function invalidate(){revision++;}
  function query(view,build,isVisible){
   let rebuilt=false,buildMs=0;
   if(builtRevision!==revision){
    const start=typeof performance!=='undefined'?performance.now():Date.now();
    // Set the revision only after the build finishes. If it throws, retry on
    // next draw rather than accidentally caching an incomplete scene.
    const next=build();
    if(!Array.isArray(next))throw Error('Object layout build must return an array');
    objects=next;
    lastBuildMs=buildMs=(typeof performance!=='undefined'?performance.now():Date.now())-start;
    builtRevision=revision;builds++;rebuilt=true;
   }else hits++;
   const visible=objects.filter(o=>isVisible(o,view));
   return {objects:visible,rebuilt,buildMs,total:objects.length,builds,hits};
  }
  function stats(){return {revision,builtRevision,builds,hits,total:objects.length,lastBuildMs};}
  return {query,invalidate,stats};
 }
 return {create};
})();

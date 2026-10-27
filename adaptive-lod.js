/* Vedras v0.18.0 – unified, hysteretic, scene-wide terrain/river LOD.
 * This selects raster density and decorative strokes ONLY. Geometry of
 * hexes, shores, river routes, bank margins and road crossings is unchanged.
 * The whole scene uses one tier, so neighboring chunks use identical sampling.
 */
'use strict';
window.VedrasAdaptiveLOD=(()=>{
 // One canonical scene-wide level contract. 'far/mid/near' correspond to
 // world / region / local DETAIL, distinct from strategic state.mode='far'.
 // World-Tile output density is unchanged; step 11 owns the DPR policy.
 const WORLD_DENSITY=Object.freeze({far:.85,mid:1.5,near:2.5});
 const HYSTERESIS=Object.freeze({initialFar:.51,initialNear:.99,
  farToMid:.55,midToFar:.47,midToNear:1.06,nearToMid:.92});
 const TIERS=Object.freeze({
  far:Object.freeze({id:'far',label:'Fern',scope:'world',worldTileDensity:WORLD_DENSITY.far,terrain:.60,shore:.72,bank:.76,
   river:.72,road:.62,forest:.78,roadDetail:false}),
  mid:Object.freeze({id:'mid',label:'Mittel',scope:'region',worldTileDensity:WORLD_DENSITY.mid,terrain:.83,shore:.90,bank:.90,
   river:.86,road:.82,forest:.90,roadDetail:true}),
  near:Object.freeze({id:'near',label:'Nah',scope:'local',worldTileDensity:WORLD_DENSITY.near,terrain:1,shore:1,bank:1,
   river:1,road:1,forest:1,roadDetail:true}),
  full:Object.freeze({id:'full',label:'Vollauflösung',scope:'local',worldTileDensity:WORLD_DENSITY.near,terrain:1,shore:1,bank:1,
   river:1,road:1,forest:1,roadDetail:true})
 });
 const ORDER=['far','mid','near'];
 function create(){
  let active=null,changes=0,evaluations=0;
  function update(zoom,{enabled=true,final=false}={}){
   evaluations++;
   if(final)return TIERS.full; // Never mutate the interactive tier on export.
   if(!enabled)return TIERS.full;
   if(!Number.isFinite(zoom))throw Error('LOD zoom must be finite');
   const z=Math.max(.05,Math.min(4,zoom));
   if(!active)active=z<HYSTERESIS.initialFar?'far':
    z<HYSTERESIS.initialNear?'mid':'near';
   else {
    // Hysteresis prevents zoom-wheel jitter near level boundaries, while
    // large jumps can skip intermediate tiers in a single update.
    if(active==='far'){
     if(z>=HYSTERESIS.midToNear)active='near';
     else if(z>=HYSTERESIS.farToMid)active='mid';
    }else if(active==='mid'){
     if(z<=HYSTERESIS.midToFar)active='far';
     else if(z>=HYSTERESIS.midToNear)active='near';
    }else if(active==='near'){
     if(z<=HYSTERESIS.midToFar)active='far';
     else if(z<=HYSTERESIS.nearToMid)active='mid';
    }
   }
   if(active!==update.lastActive){changes++;update.lastActive=active;}
   return TIERS[active];
  }
  function reset(){active=null;update.lastActive=null;}
  function stats(){return {tier:active,changes,evaluations};}
  return {update,reset,stats,tiers:TIERS};
 }
 return {create,tiers:TIERS,order:ORDER,worldDensity:WORLD_DENSITY,
  hysteresis:HYSTERESIS};
})();

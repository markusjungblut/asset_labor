/* Vedras v0.18.0 – unified, hysteretic, scene-wide terrain/river LOD.
 * This selects raster density and decorative strokes ONLY. Geometry of
 * hexes, shores, river routes, bank margins and road crossings is unchanged.
 * The whole scene uses one tier, so neighboring chunks use identical sampling.
 */
'use strict';
window.VedrasAdaptiveLOD=(()=>{
 const TIERS=Object.freeze({
  far:Object.freeze({id:'far',label:'Fern',terrain:.60,shore:.72,bank:.76,
   river:.72,road:.62,forest:.78,roadDetail:false}),
  mid:Object.freeze({id:'mid',label:'Mittel',terrain:.83,shore:.90,bank:.90,
   river:.86,road:.82,forest:.90,roadDetail:true}),
  near:Object.freeze({id:'near',label:'Nah',terrain:1,shore:1,bank:1,
   river:1,road:1,forest:1,roadDetail:true}),
  full:Object.freeze({id:'full',label:'Vollauflösung',terrain:1,shore:1,bank:1,
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
   if(!active)active=z<.51?'far':z<.99?'mid':'near';
   else {
    // Hysteresis prevents zoom-wheel jitter near level boundaries, while
    // large jumps can skip intermediate tiers in a single update.
    if(active==='far'){
     if(z>=1.06)active='near';
     else if(z>=.55)active='mid';
    }else if(active==='mid'){
     if(z<=.47)active='far';
     else if(z>=1.06)active='near';
    }else if(active==='near'){
     if(z<=.47)active='far';
     else if(z<=.92)active='mid';
    }
   }
   if(active!==update.lastActive){changes++;update.lastActive=active;}
   return TIERS[active];
  }
  function reset(){active=null;update.lastActive=null;}
  function stats(){return {tier:active,changes,evaluations};}
  return {update,reset,stats,tiers:TIERS};
 }
 return {create,tiers:TIERS,order:ORDER};
})();

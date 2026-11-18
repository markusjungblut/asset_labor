/* Local visual calibration of newly drawn shadows, independent from
 * archived PNG atlases and the versioned sprite-profile JSON schema. */
'use strict';
window.VedrasShadowTone=(()=>{
 const KEY='vedras-shadow-tone-preview-v1';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const defaults=()=>({lift:0,balance:0});
 function clean(raw){
  const result=defaults();
  for(const key of ['balance']){
   const v=raw?.[key];
   if(typeof v==='number'&&Number.isFinite(v))result[key]=clamp(v,0,1);
  }
  return result;
 }
 let current=defaults(),revision=0;
 try{current=clean(JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(_){}
 function set(raw,{persist=true}={}){
  const next=clean(raw);
  if(next.balance!==current.balance)revision++;
  current=next;
  if(persist)try{localStorage.setItem(KEY,JSON.stringify(current));}catch(_){}
  return get();
 }
 const get=()=>({...current});
 function colorRgb(){
  // Shadow color remains the original neutral green-black.
  return {r:32,g:49,b:49};
 }
 function colorCss(){
  const {r,g,b}=colorRgb();
  return 'rgb('+r+','+g+','+b+')';
 }
 // Some nature families were additionally multiplied by .28/.8 after
 // profile normalization, so their shadows remained almost transparent.
 // At full equalization neutralize these per-family attenuations too.
 function attenuation(value){
  if(!Number.isFinite(value)||value<=0)return 0;
  const factor=clamp(value,0,1);
  const strength=1-(1-current.balance)**2;
  return clamp(factor+(1-factor)*strength,0,1);
 }
 function opacity(value,target=.40){
  if(!Number.isFinite(value)||value<=0)return 0;
  const strength=1-(1-current.balance)**2;
  return clamp(value+(Math.max(.52,target)-value)*strength,0,1);
 }
 return {defaults,clean,get,set,colorRgb,colorCss,opacity,attenuation,revision:()=>revision};
})();

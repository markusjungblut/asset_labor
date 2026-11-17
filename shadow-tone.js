/* Local visual calibration of newly drawn shadows, independent from
 * archived PNG atlases and the versioned sprite-profile JSON schema. */
'use strict';
window.VedrasShadowTone=(()=>{
 const KEY='vedras-shadow-tone-preview-v1';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const defaults=()=>({lift:0,balance:0});
 function clean(raw){
  const result=defaults();
  for(const key of Object.keys(result)){
   const v=raw?.[key];
   if(typeof v==='number'&&Number.isFinite(v))result[key]=clamp(v,0,1);
  }
  return result;
 }
 let current=defaults(),revision=0;
 try{current=clean(JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(_){}
 function set(raw,{persist=true}={}){
  const next=clean(raw);
  if(next.lift!==current.lift||next.balance!==current.balance)revision++;
  current=next;
  if(persist)try{localStorage.setItem(KEY,JSON.stringify(current));}catch(_){}
  return get();
 }
 const get=()=>({...current});
 function colorRgb(){
  const t=current.lift;
  return {r:Math.round(32+(116-32)*t),g:Math.round(49+(116-49)*t),
   b:Math.round(49+(116-49)*t)};
 }
 function colorCss(){
  const {r,g,b}=colorRgb();
  return 'rgb('+r+','+g+','+b+')';
 }
 function opacity(value,target=.40){
  if(!Number.isFinite(value)||value<=0)return 0;
  return clamp(value+(target-value)*current.balance,0,1);
 }
 return {defaults,clean,get,set,colorRgb,colorCss,opacity,revision:()=>revision};
})();

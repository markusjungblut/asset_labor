/* One authoritative tonal control for every visible cast-shadow family.
 * Shadow geometry, per-asset overrides, saved PNGs and 4x maps are untouched.
 * Legacy balance functions are retained for archived preview compatibility.
 */
'use strict';
window.VedrasShadowTone=(()=>{
 const KEY='vedras-shadow-tone-preview-v1';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 // 0 is deliberately a faint, visible cast (12% black), not "off".
 // 100 is opaque black at the solid interior of every cast mask.
 const defaults=()=>({lift:0,balance:0,gray:0,mountains:true});
 function clean(raw){
  const result=defaults();
  const old=raw?.balance;
  if(typeof old==='number'&&Number.isFinite(old))
   result.balance=clamp(old,0,1);
  if(typeof raw?.gray==='number'&&Number.isFinite(raw.gray))
   result.gray=clamp(raw.gray,0,100);
  if(typeof raw?.mountains==='boolean')result.mountains=raw.mountains;
  return result;
 }
 let current=defaults(),revision=0,maskPassDepth=0;
 try{current=clean(JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(_){}
 function set(raw,{persist=true}={}){
  const next=clean(raw);
  if(next.gray!==current.gray||next.mountains!==current.mountains||
    next.balance!==current.balance)revision++;
  current=next;
  if(persist)try{localStorage.setItem(KEY,JSON.stringify(current));}catch(_){}
  return get();
 }
 const get=()=>({...current});
 // Draw every ordinary cast into a fully opaque union first, then apply
 // the user's selected opacity exactly once to the complete ground mask.
 function withMaskPass(paint){
  if(typeof paint!=='function')throw TypeError('Shadow mask callback required');
  maskPassDepth++;
  try{return paint();}finally{maskPassDepth--;}
 }
 const inMaskPass=()=>maskPassDepth>0;
 // The normalized target is the FINAL opacity. Do not multiply it by the
 // historical global strength, the authored sprite opacity, the vegetation
 // family attenuation, or the mountain's 0.90 coverage ceiling.
 // None of those old multipliers may darken a hand-drawn cast relative to an
 // automatic or mountain cast when the shared override is active.
 function targetAlpha(kind='sprite'){
  if(kind==='mountain'&&!current.mountains)return null;
  // Mountain shades are independent of the ordinary mask.
  if(kind!=='mountain'&&inMaskPass())return 1;
  return clamp(.12+.88*current.gray/100,.12,1);
 }
 function colorRgb(kind='sprite'){
  if(kind==='mountain'&&!current.mountains)return {r:32,g:49,b:49};
  return {r:0,g:0,b:0};
 }
 function colorCss(kind='sprite'){
  const {r,g,b}=colorRgb(kind);
  return 'rgb('+r+','+g+','+b+')';
 }
 // Retained for the opt-out mountain and pre-existing balance contracts.
 function attenuation(value){
  if(!Number.isFinite(value)||value<=0)return 0;
  const factor=clamp(value,0,1),strength=1-(1-current.balance)**2;
  return clamp(factor+(1-factor)*strength,0,1);
 }
 function opacity(value,target=.40){
  if(!Number.isFinite(value)||value<=0)return 0;
  const strength=1-(1-current.balance)**2;
  return clamp(value+(Math.max(.52,target)-value)*strength,0,1);
 }
 function coverageGain(maxCoverage=1){
  if(!Number.isFinite(maxCoverage)||maxCoverage<=0)return 1;
  const peak=clamp(maxCoverage,.01,1);
  const strength=1-(1-current.balance)**2;
  return 1+(1/peak-1)*strength;
 }
 return {defaults,clean,get,set,targetAlpha,colorRgb,colorCss,opacity,
  attenuation,coverageGain,withMaskPass,inMaskPass,revision:()=>revision};
})();

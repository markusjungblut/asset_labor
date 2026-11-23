/* Phase 2.8m: opt-in, read-only shadow styling from a REAL exported
 * Vedras Asset Labor scene. No map/PNG mutation and no implicit transfer
 * of position-specific overrides to unrelated geography placements.
 */
(function(root){
"use strict";
const SCHEMA="vedras-geography-authored-mountain-shadow-style-v1";
const LIVE=new WeakSet();
const PARAMS=new Set(["opacity","reach","softness","originX","originY",
 "spread","contact","angle","length","rootWidth","midWidth","tipWidth",
 "contactWidth","contactLength"]);
const INSTANCE={opacity:"shadowOpacity",softness:"shadowSoftness",
 originX:"shadowOriginX",originY:"shadowOriginY",angle:"shadowAngle",
 length:"shadowLength",rootWidth:"shadowRootWidth",
 midWidth:"shadowMidWidth",tipWidth:"shadowTipWidth",
 contactWidth:"shadowContactWidth",contactLength:"shadowContactLength"};
const plain=x=>!!x&&typeof x==="object"&&!Array.isArray(x)&&
 Object.getPrototypeOf(x)===Object.prototype;
function numberFields(obj,label,allowed){
 if(!plain(obj))throw Error("Ungültige Editor-Schattenwerte: "+label);
 for(const [field,v] of Object.entries(obj)){
  if(!allowed.has(field)||typeof v!=="number"||!Number.isFinite(v))
   throw Error("Beschädigter Editor-Schattenwert: "+label+"."+field);
 }
 return {...obj};
}
const key=m=>m.q+","+m.r+"|"+m.assetPath;
function create({scene,mountainPlan,shadows=root.VedrasShadows,
 tone=root.VedrasShadowTone}={}){
 if(!plain(scene)||scene.schema!=="vedras-asset-labor-scene-0.8"||
  scene.schemaVersion!==3||scene.projection?.hexWidth!==256||
  scene.projection?.groundY!==.85||
  !Array.isArray(mountainPlan?.instances)||
  typeof shadows?.settings!=="function"||
  typeof shadows?.globalStrength!=="function"||
  typeof tone?.clean!=="function")
  throw Error("Authentischer Editor-Szenenexport v3 mit 2.5D-Projektion erforderlich.");
 const defaults=numberFields(scene.mountainShadowDefaults,
  "mountainShadowDefaults",PARAMS);
 if(typeof scene.shadowGlobal!=="number"||
  !Number.isFinite(scene.shadowGlobal)||
  scene.shadowGlobal<0||scene.shadowGlobal>2)
  throw Error("Ungültige globale Editor-Schattenstärke.");
 const presets={};
 const raw=scene.shadowAssetPresets??{};
 if(!plain(raw)||Object.keys(raw).length>5000)
  throw Error("Beschädigte Berg-Grafikprofile im Editor-Szenenexport.");
 for(const [asset,cfg] of Object.entries(raw)){
  if(!/^assets\/(?:nature|buildings|units)\/[A-Za-z0-9_.\/-]+\.png$/.test(asset)||
   asset.includes(".."))
   throw Error("Ungültiger Grafikpfad im Editor-Szenenexport.");
  // The editor may store building and unit presets in the same dictionary;
  // only mountain source assets are consumed by the mountain baker.
  presets[asset]=numberFields(cfg,asset,PARAMS);
 }
 if(scene.shadowTone!==null&&scene.shadowTone!==undefined&&
  (!plain(scene.shadowTone)||
   typeof scene.shadowTone.gray!=="number"||
   !Number.isFinite(scene.shadowTone.gray)||
   scene.shadowTone.gray<0||scene.shadowTone.gray>100||
   typeof scene.shadowTone.mountains!=="boolean"))
  throw Error("Ungültiger Grauton im Editor-Szenenexport.");
 const shadowTone=scene.shadowTone==null?null:tone.clean(scene.shadowTone);
 const fromScene=scene.mountainInstances;
 if(!Array.isArray(fromScene)||fromScene.length>6000)
  throw Error("Ungültige Berginstanzen im Editor-Szenenexport.");
 const instances=new Map(),worldKeys=new Set();
 for(const m of fromScene){
  if(!m||!Number.isSafeInteger(m.q)||!Number.isSafeInteger(m.r)||
   typeof m.assetPath!=="string"||
   !/^assets\/nature\/[A-Za-z0-9_.-]+\.png$/.test(m.assetPath))
   throw Error("Ungültige Berginstanz im Editor-Szenenexport.");
  const k=key(m);
  if(instances.has(k))throw Error("Mehrdeutige Berginstanz im Editor-Szenenexport.");
  instances.set(k,m);
 }
 for(const m of mountainPlan.instances){
  if(!m||!Number.isSafeInteger(m.q)||!Number.isSafeInteger(m.r)||
   typeof m.assetPath!=="string")
   throw Error("Unvollständiger geografischer Bergplan.");
  worldKeys.add(key(m));
 }
 // Only a full 1:1 source correspondence allows position-specific edits.
 // Global and per-image styles are still useful on a different world.
 const exact=worldKeys.size===mountainPlan.instances.length&&
  instances.size===worldKeys.size&&
  [...worldKeys].every(k=>instances.has(k));
 const approved=new Map();
 if(exact)for(const [k,m] of instances){
  const overrides={};
  for(const [field,name] of Object.entries(INSTANCE))
   if(m[name]!==undefined){
    if(typeof m[name]!=="number"||!Number.isFinite(m[name]))
     throw Error("Ungültiger Instanzschattenwert: "+name);
    overrides[field]=m[name];
   }
  for(const [legacy,property] of [["shadowReach","reach"],
   ["shadowSpread","spread"],["shadowContact","contact"]])
   if(m[legacy]!==undefined){
    if(typeof m[legacy]!=="number"||!Number.isFinite(m[legacy]))
     throw Error("Ungültiger historischer Schattenwert: "+legacy);
    overrides[property]=m[legacy];
   }
  approved.set(k,overrides);
 }
 const result=Object.freeze({schema:SCHEMA,source:"exported-editor-scene-v3",
  defaults:Object.freeze(defaults),presets:Object.freeze(presets),
  instanceOverrides:approved,instanceMatchComplete:exact,
  instancesInScene:fromScene.length,instancesInPlan:mountainPlan.instances.length,
  shadowGlobal:scene.shadowGlobal,shadowTone,
  requiresReceiverParity:true,complete:false,readyForViewer:false});
 LIVE.add(result);return result;
}
function valid(style){return !!style&&LIVE.has(style);}
function resolve(style,instance,shadows=root.VedrasShadows){
 if(!valid(style)||typeof shadows?.settings!=="function"||
  !instance||!Number.isSafeInteger(instance.q)||!Number.isSafeInteger(instance.r)||
  typeof instance.assetPath!=="string")
  throw Error("Editor-Bergstil muss aus validiertem Szenenexport stammen.");
 const preset=style.presets[instance.assetPath]||{};
 const placed=style.instanceMatchComplete?
  (style.instanceOverrides.get(key(instance))||{}):{};
 const cfg={...style.defaults,...preset};
 // EXACT editor rule: named modern params supersede legacy reach,
 // spread and contact on both asset presets and placed instances.
 if(Number.isFinite(preset.reach)&&!Number.isFinite(preset.length))
  cfg.length=preset.reach*.8;
 if(Number.isFinite(preset.spread)&&!Number.isFinite(preset.rootWidth))
  cfg.rootWidth=.26*preset.spread/1.28;
 if(Number.isFinite(preset.contact)&&!Number.isFinite(preset.contactWidth))
  cfg.contactWidth=.16*preset.contact/1.10;
 if(Number.isFinite(placed.reach)&&!Number.isFinite(placed.length))
  cfg.length=placed.reach*.8;
 if(Number.isFinite(placed.spread)&&!Number.isFinite(placed.rootWidth))
  cfg.rootWidth=.26*placed.spread/1.28;
 if(Number.isFinite(placed.contact)&&!Number.isFinite(placed.contactWidth))
  cfg.contactWidth=.16*placed.contact/1.10;
 for(const field of Object.keys(INSTANCE))
  if(Number.isFinite(placed[field]))cfg[field]=placed[field];
 return shadows.settings(cfg);
}
const api={SCHEMA,create,valid,resolve};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.VedrasLargeMapAuthoredMountainShadows=api;
})(typeof window!=="undefined"?window:globalThis);

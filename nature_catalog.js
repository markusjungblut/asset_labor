/* Nature asset registry v0.9.1 — v0.9 files remain valid without migration. */
'use strict';
window.VedrasNatureCatalog=(()=>{
 const idOK=x=>typeof x==='string'&&/^[a-z][a-z0-9_]{0,63}$/.test(x);
 const validPath=x=>typeof x==='string'&&/^nature\/[\p{L}\p{N}_./-]+\.(?:png|webp|jpe?g|svg|gif|avif)$/iu.test(x)&&!x.includes('..');
 const kinds=['ground_cover','shrub','cluster','tree','rock','special','mountain'];
 const sizes=['tiny','small','medium','large','giant'];
 const shadows=['none','generic_small_round','generic_small_wide','generic_medium_round','generic_medium_wide','custom'];
 const initial=()=>({schemaVersion:1,revision:0,presets:{},entries:{}});
 const template=()=>({id:'',description:'',sourceReference:'',family:'',kind:'shrub',sizeClass:'small',sizeMode:'manual',logicalWidth:52,
  scaleMin:.85,scaleMax:1.15,anchor:{x:.5,y:.96},shadow:{mode:'generic_small_round',path:'',offsetX:-.24,offsetY:0,widthScale:.70,depthScale:.18},
  terrainPresetId:'',allowedTerrainCategories:[],allowedTerrainTypes:[],excludedTerrainTypes:[],
  placement:{weight:1,density:.22,minSpacing:28,canCluster:true,edgeMargin:12},mountain:{radius:1,coreRadius:0,shadowOpacity:.23,flatten:true},artStatus:'candidate',tags:[]});
 const validNum=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
 const rules=(m)=>({categoryIds:m.allowedTerrainCategories||m.categoryIds||[],typeIds:m.allowedTerrainTypes||m.typeIds||[],excludeIds:m.excludedTerrainTypes||m.excludeIds||[]});
 function effectiveTypes(m,terrain,catalog){
  const types=terrain?.terrainTypes||[],presets=catalog?.presets||{},base=m.terrainPresetId?presets[m.terrainPresetId]:null;
  const own=rules(m),shared=base?rules(base):{categoryIds:[],typeIds:[],excludeIds:[]};
  const cats=new Set([...shared.categoryIds,...own.categoryIds]),included=new Set([...shared.typeIds,...own.typeIds]);
  const removed=new Set([...shared.excludeIds,...own.excludeIds]);
  return new Set(types.filter(t=>!removed.has(t.id)&&(cats.has(t.categoryId)||included.has(t.id))).map(t=>t.id));
 }
 function validate(catalog,terrain=null){const err=[];
  if(!catalog||catalog.schemaVersion!==1||!catalog.entries||Array.isArray(catalog.entries)||typeof catalog.entries!=='object')return ['Ungültiges Nature-Katalogformat.'];
  if(Object.keys(catalog.entries).length>10000)return ['Zu viele Nature-Sprites'];
  const ts=Array.isArray(terrain)?terrain:(terrain?.terrainTypes||[]).map(t=>t.id);
  const cs=Array.isArray(terrain)?null:(terrain?.categories||[]).map(c=>c.id);
  const presets=catalog.presets||{};
  if(!presets||typeof presets!=='object'||Array.isArray(presets)||Object.keys(presets).length>500)err.push('Ungültige Presets');
  function validRules(r,where){
   const {categoryIds,typeIds,excludeIds}=rules(r);
   for(const [field,list,valid] of [['Kategorien',categoryIds,cs],['Geländearten',typeIds,ts],['Ausnahmen',excludeIds,ts]]){
    if(!Array.isArray(list)||list.length>250||new Set(list).size!==list.length||list.some(x=>!idOK(x)||(valid&&!valid.includes(x))))err.push(field+' ungültig: '+where);
   }
  }
  for(const [id,preset] of Object.entries(presets)){
   if(!idOK(id)||!preset||typeof preset.name!=='string'||!preset.name.trim()||preset.name.length>90){err.push('Preset ungültig: '+id);continue;}
   validRules(preset,'Preset '+id);
  }
  const ids=new Set();
  for(const [path,e] of Object.entries(catalog.entries)){
   if(!validPath(path)){err.push('Ungültiger Nature-Pfad: '+path);continue;}
   if(!e||!idOK(e.id)||ids.has(e.id))err.push('Fehlende oder doppelte Sprite-ID: '+path);else ids.add(e.id);
   if(!e){continue;}
   if(typeof e.description!=='string'||e.description.length>600||typeof e.sourceReference!=='string'||e.sourceReference.length>300)err.push('Beschreibung/Quelle ungültig: '+path);
   if(!idOK(e.family)||!kinds.includes(e.kind)||!sizes.includes(e.sizeClass))err.push('Familie/Klasse/Größe ungültig: '+path);
   if(e.sizeMode!==undefined&&!['manual','class'].includes(e.sizeMode))err.push('Größenmodus ungültig: '+path);
   if(e.targetHeight!==undefined&&!validNum(e.targetHeight,4,400))err.push('Zielhöhe ungültig: '+path);
   if(!validNum(e.logicalWidth,4,400)||!validNum(e.scaleMin,.2,3)||!validNum(e.scaleMax,.2,3)||e.scaleMin>e.scaleMax)err.push('Größenwerte ungültig: '+path);
   if(!e.anchor||!validNum(e.anchor.x,0,1)||!validNum(e.anchor.y,0,1))err.push('Ankerwerte ungültig: '+path);
   if(!e.shadow||!shadows.includes(e.shadow.mode)||typeof e.shadow.path!=='string'||e.shadow.path.length>240||e.shadow.path.includes('..'))err.push('Schatten ungültig: '+path);
   if(e.shadow?.mode==='custom'&&!/^shadows\/[A-Za-z0-9_./-]+\.(?:png|webp|svg)$/i.test(e.shadow.path))err.push('Eigener Schattenpfad fehlt: '+path);
   for(const [field,min,max] of [['offsetX',-1,1],['offsetY',-.6,.6],['widthScale',.1,2],['depthScale',.03,1]]){
    if(e.shadow&&e.shadow[field]!==undefined&&!validNum(e.shadow[field],min,max))err.push('Schatten '+field+' ungültig: '+path);
   }
   if(e.kind==='mountain'){const mm=e.mountain||{};if(![1,2].includes(mm.radius)||![undefined,0,1].includes(mm.coreRadius)||!validNum(mm.shadowOpacity,0,.65)||typeof mm.flatten!=='boolean')err.push('Berg-Footprint/Schatten ungültig: '+path);}
   if(e.terrainPresetId!==undefined&&e.terrainPresetId!==''&&(!idOK(e.terrainPresetId)||!presets[e.terrainPresetId]))err.push('Preset fehlt: '+path);
   validRules(e,path);
   const p=e.placement||{};
   if(!validNum(p.weight,0,100)||!validNum(p.density,0,1)||!validNum(p.minSpacing,0,256)||typeof p.canCluster!=='boolean'||!validNum(p.edgeMargin,0,80))err.push('Platzierung ungültig: '+path);
   if(!['candidate','test','approved','deprecated'].includes(e.artStatus)||!Array.isArray(e.tags)||e.tags.length>30||e.tags.some(x=>typeof x!=='string'||x.length>50))err.push('Status/Tags ungültig: '+path);
  }
  return err;
 }
 return {idOK,validPath,kinds,sizes,shadows,initial,template,validate,effectiveTypes,rules};
})();
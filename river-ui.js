/* Minimal flow editor. A river may start anywhere on LAND but only ends on WATER. */
'use strict';
window.VedrasRiverUI=(()=>{
 const $=id=>document.getElementById(id),core=window.VedrasAssetLabor,R=window.VedrasRivers;
 if(!core||!R||!$('riverPanel'))return null;
 const state=core.state;
 const isWet=c=>['water','shoreline'].includes(core.catalog().terrainTypes.find(t=>t.id===core.effectiveBiome(c))?.materialClass);
 function refresh(note=''){
  const cells=core.cells(),routes=R.normalizeRoutes(state.riverPaths,cells,isWet);
  const wet=cells.filter(isWet).length,invalid=(state.riverPaths||[]).length-routes.length;
  $('riverDebug').checked=!!state.riverDebug;
  $('riverWidth').value=String(state.riverWidth||32);$('riverWidthValue').textContent=String(state.riverWidth||32);
  $('riverStats').textContent=(note?note+' · ':'')+routes.length+' gültige Flüsse · '+wet+' Wasserhexe · '+invalid+' veraltete Routen (nicht gezeichnet). Quelle immer in einer Ecke; Mündung immer im Wasser. Ohne Wasserhex keine Flusserzeugung.';
 }
 function persist(){core.persistScene();core.requestDraw();window.dispatchEvent(new Event('vedras:river-changed'));}
 $('riverAdd').addEventListener('click',()=>{
  const cells=core.cells(),selected=cells.find(c=>R.key(c)===state.selected);
  if(!selected){refresh('Bitte ein Landhex auswählen');return;}
  const route=R.findRoute(cells,isWet,selected);
  if(!route){refresh(isWet(selected)?'Eine Quelle muss auf Land liegen':'Kein erreichbares Wasserhex: zuerst über die Terrain-Zuweisung mindestens ein Wasserhex erstellen');return;}
  state.riverPaths=[...(Array.isArray(state.riverPaths)?state.riverPaths:[]),route].slice(-50);
  state.river=true;$('riverToggle').checked=true;persist();refresh('Fluss von '+state.selected+' bis Wasserhex '+route.hexes.at(-1).join(',')+' erstellt');
 });
 $('riverWidth').addEventListener('input',e=>{$('riverWidthValue').textContent=e.target.value;});
 $('riverWidth').addEventListener('change',e=>{state.riverWidth=Number(e.target.value);persist();refresh();});
 $('riverRemove').addEventListener('click',()=>{state.riverPaths=(state.riverPaths||[]).slice(0,-1);persist();refresh('Letzter Fluss entfernt');});
 $('riverClear').addEventListener('click',()=>{state.riverPaths=[];persist();refresh('Alle Flüsse entfernt');});
 // This is only geometry visualization; no effects on biome or water textures.
 $('riverDebug').addEventListener('change',e=>{state.riverDebug=e.target.checked;core.persistScene();core.requestDraw();});
 window.addEventListener('vedras:hex-selected',()=>refresh());
 window.addEventListener('vedras:terrain-catalog-changed',()=>refresh());
 window.addEventListener('vedras:river-changed',()=>refresh());
 window.addEventListener('vedras:assets-loaded',()=>refresh());
 refresh();
 return {refresh,isWet};
})();
/* River laboratory: one-click demo and hex-by-hex placement. All mouths are real WATER hexes. */
'use strict';
window.VedrasRiverUI=(()=>{
 const $=id=>document.getElementById(id);
 const core=window.VedrasAssetLabor,R=window.VedrasRivers;
 if(!core||!R||!$('riverPanel'))return null;
 const state=core.state;
 const cells=()=>core.cells();
 const cellFor=k=>cells().find(c=>R.key(c)===k);
 const isWet=c=>['water','shoreline'].includes(core.catalog().terrainTypes.find(t=>t.id===core.effectiveBiome(c))?.materialClass);
 const distance=(a,b)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r));
 const availableWater=()=>core.assets().filter(a=>{
  if(!core.isTerrainValid(a))return false;
  const id=core.typeOfAsset(a);
  return !!id&&['water','shoreline'].includes(core.catalog().terrainTypes.find(t=>t.id===id)?.materialClass);
 });
 let notice='';
 function refresh(message){
  if(message!==undefined)notice=message;
  const terrain=cells(),routes=R.normalizeRoutes(state.riverPaths,terrain,isWet),wet=terrain.filter(isWet).length;
  const invalid=(Array.isArray(state.riverPaths)?state.riverPaths.length:0)-routes.length;
  const draft=Array.isArray(state.riverDraft)&&state.riverDraft.length?state.riverDraft:null;
  if(draft&&!draft.every(([q,r])=>cellFor(q+','+r)))state.riverDraft=null;
  $('riverWidth').value=String(state.riverWidth||32);
  $('riverWidthValue').textContent=String(state.riverWidth||32);
  $('riverDebug').checked=!!state.riverDebug;
  $('riverPaint').textContent=state.riverDraft?'Zeichenmodus abbrechen':'Fluss Hex für Hex zeichnen';
  $('riverPaint').classList.toggle('active',!!state.riverDraft);
  const where=state.selected,selected=cellFor(where);
  $('riverStats').textContent=(notice?notice+' · ':'')+
   routes.length+' Fluss/Flüsse · '+wet+' Wasserhexe · '+invalid+' ungültige Routen · Auswahl: '+where+
   (selected?(isWet(selected)?' (Wasser)':' (Land)'):' (außerhalb)')+
   (state.riverDraft?' · Zeichnen: '+state.riverDraft.length+' Hexe. Als Nächstes angrenzendes Land- oder Wasserhex anklicken.':'')+
   (wet===0?' · Ohne Wasser-Mündung: „Testfluss mit Wasserhex“ verwenden.':'');
 }
 function persist(terrainChanged=false){
  if(terrainChanged)core.invalidateTerrain('cells');
  core.persistScene();
  core.requestDraw();
  window.dispatchEvent(new Event('vedras:river-changed'));
 }
 function add(route,message,terrainChanged=false){
  if(!R.valid(route,cells(),isWet)){refresh('Route endet nicht im Wasser oder besitzt ungültige Verbindungen');return false;}
  state.riverPaths=[...(Array.isArray(state.riverPaths)?state.riverPaths:[]),route].slice(-50);
  state.riverDraft=null;
  state.river=true;$('riverToggle').checked=true;
  persist(terrainChanged);
  refresh(message);
  return true;
 }
 function beginPaint(){
  if(state.riverDraft){state.riverDraft=null;persist();refresh('Zeichenmodus abgebrochen');return;}
  const selected=cellFor(state.selected);
  if(!selected||isWet(selected)){refresh('Wähle zuerst ein Landhex als Quelle aus');return;}
  state.riverDraft=[[selected.q,selected.r]];
  state.river=true;$('riverToggle').checked=true;
  persist();
  refresh('Quelle gewählt: '+state.selected+'. Klicke jetzt auf angrenzende Hexfelder bis zum Wasser.');
 }
 function paintClick(){
  const path=state.riverDraft;
  if(!Array.isArray(path)||!path.length)return refresh();
  const clicked=cellFor(state.selected);
  if(!clicked){refresh('Nur Hexfelder innerhalb der Karte verwenden');return;}
  const last=path.at(-1),next=[clicked.q,clicked.r];
  if(last[0]===next[0]&&last[1]===next[1]){refresh('Nächstes angrenzendes Hex anklicken');return;}
  if(R.side({q:last[0],r:last[1]},clicked)<0){refresh('Flusssegmente müssen unmittelbar benachbart sein');return;}
  if(path.some(([q,r])=>q===clicked.q&&r===clicked.r)){refresh('Ein Fluss darf dasselbe Hex nicht zweimal durchlaufen');return;}
  const candidate=[...path,next];
  if(isWet(clicked)){add({hexes:candidate},'Fluss fertig: Mündung bei '+state.selected);return;}
  state.riverDraft=candidate;
  persist();
  refresh('Landsegment gesetzt: '+state.selected+'. Weiter bis zum Wasserhex zeichnen.');
 }
 function addAutomatic(){
  state.riverDraft=null;
  const source=cellFor(state.selected);
  if(!source||isWet(source)){refresh('Wähle zuerst ein Landhex als Quelle aus');return;}
  const route=R.findRoute(cells(),isWet,source);
  if(!route){refresh('Kein Wasserhex vorhanden oder erreichbar. Nutze „Testfluss mit Wasserhex“ oder setze ein Wasser-Tile auf der Karte.');return;}
  add(route,'Fluss von '+state.selected+' zur Mündung '+route.hexes.at(-1).join(',')+' platziert');
 }
 function addDemo(){
  state.riverDraft=null;
  const start=cellFor(state.selected);
  if(!start||isWet(start)){refresh('Bitte zuerst ein Landhex als Quelle wählen');return;}
  const existing=R.findRoute(cells(),isWet,start);
  if(existing){add(existing,'Testfluss zur vorhandenen Wasser-Mündung '+existing.hexes.at(-1).join(',')+' erstellt');return;}
  const water=availableWater().sort((a,b)=>{
   // Prefer calm ocean water over icy or stormy variants.
   const score=x=>x.name.toLowerCase()==='ocean_01.png'?0:x.name.toLowerCase().startsWith('ocean_')?1:2;
   return score(a)-score(b)||a.name.localeCompare(b.name);
  })[0];
  if(!water){refresh('Noch keine nutzbare Wassertextur geladen. Lade ein Ozean- oder Küstenwasser-PNG und klicke auf „Neu einlesen“.');return;}
  const lookup=new Set(cells().map(R.key));
  const edge=cells().filter(c=>c!==start&&!isWet(c)&&
   !(state.hexTerrain||{})[R.key(c)]&&
   !(state.hexObject||{})[R.key(c)]&&
   !state.forest?.jungleHexes?.[R.key(c)]&&
   R.DIRS.some(([dq,dr])=>!lookup.has((c.q+dq)+','+(c.r+dr))));
  edge.sort((a,b)=>distance(start,b)-distance(start,a)||a.q-b.q||a.r-b.r);
  const mouth=edge[0];
  if(!mouth){refresh('Kein freies Randhex verfügbar. Entferne eine manuelle Geländezuteilung oder setze dort selbst eine Wassertextur.');return;}
  const k=R.key(mouth),previous=state.hexTerrain[k];
  state.hexTerrain[k]=water.path;
  if(!isWet(mouth)){
   if(previous===undefined)delete state.hexTerrain[k];else state.hexTerrain[k]=previous;
   refresh('Wassertextur konnte diesem Hex nicht zugeordnet werden. Terrain-Katalog prüfen.');
   return;
  }
  const route=R.findRoute(cells(),isWet,start);
  if(!route){
   if(previous===undefined)delete state.hexTerrain[k];else state.hexTerrain[k]=previous;
   refresh('Kein gültiger Weg zur Wasser-Mündung gefunden.');return;
  }
  add(route,'Testfluss erstellt: Wasserhex '+k+' mit '+water.name+' gesetzt',true);
 }
 $('riverAdd').addEventListener('click',addAutomatic);
 $('riverQuickStart').addEventListener('click',addDemo);
 $('riverPaint').addEventListener('click',beginPaint);
 $('riverWidth').addEventListener('input',e=>{$('riverWidthValue').textContent=e.target.value;});
 $('riverWidth').addEventListener('change',e=>{state.riverWidth=Number(e.target.value);persist();});
 $('riverRemove').addEventListener('click',()=>{
  state.riverPaths=(state.riverPaths||[]).slice(0,-1);persist();refresh('Letzten Fluss entfernt (Wasserhexe bleiben erhalten)');
 });
 $('riverClear').addEventListener('click',()=>{
  state.riverPaths=[];state.riverDraft=null;persist();refresh('Alle Flüsse entfernt (Terrain bleibt erhalten)');
 });
 $('riverDebug').addEventListener('change',e=>{state.riverDebug=e.target.checked;core.persistScene();core.requestDraw();});
 window.addEventListener('vedras:hex-selected',paintClick);
 window.addEventListener('vedras:terrain-catalog-changed',()=>refresh());
 window.addEventListener('vedras:river-changed',()=>refresh());
 window.addEventListener('vedras:assets-loaded',()=>refresh());
 refresh();
 return {refresh,isWet,addDemo,addAutomatic,beginPaint,paintClick};
})();
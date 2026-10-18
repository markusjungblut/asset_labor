/* FloraV2 — deterministic Nature population and special forest-floor test. */
'use strict';
window.VedrasFloraWorkspace=(()=>{
 const core=window.VedrasAssetLabor, nature=window.VedrasNature, plan=window.VedrasTerrainPlan;
 const $=id=>document.getElementById(id), state=core.state;
 const profiles=['temperate_deciduous','mixed_forest','conifer_forest','dry_forest','wet_forest','tropical_jungle'];
 const stages=['edge','core','jungle'];
 if(!profiles.includes(state.forestProfile))state.forestProfile='temperate_deciduous';
 if(!stages.includes(state.forestDensityStage))state.forestDensityStage='core';
 $('forestProfile').value=state.forestProfile;
 $('forestDensityStage').value=state.forestDensityStage;
 function rnd(seed,q,r,n){
  let h=(seed|0)^Math.imul(q+97,374761393)^Math.imul(r+513,668265263)^Math.imul(n+11,2246822519);
  h^=h>>>13;h=Math.imul(h,1274126177);return ((h^(h>>>16))>>>0)/4294967296;
 }
 const families={
  temperate_deciduous:['deciduous_trees','riparian_trees','temperate_bushes','flowering_bushes','ferns','mosses','heath','herbs','deadwood'],
  mixed_forest:['deciduous_trees','conifers','temperate_bushes','flowering_bushes','ferns','mosses','heath','deadwood'],
  conifer_forest:['conifers','snow_conifers','cold_bushes','temperate_bushes','heath','mosses','lichens','ferns','deadwood'],
  dry_forest:['conifers','dry_trees','dry_bushes','dry_grasses','heath','herbs','deadwood'],
  wet_forest:['wet_trees','riparian_trees','wet_bushes','wet_herbs','reeds','ferns','mosses','deadwood'],
  tropical_jungle:['tropical_trees','palms','tropical_bushes','jungle_herbs','ferns','mosses','mangroves']
 };
 function kind(m){if(m.kind==='tree')return 'tree';if(m.kind==='shrub'||m.kind==='cluster')return 'shrub';if(m.kind==='ground_cover')return 'groundCover';return null;}
 function populate(){
  const seed=Number($('nSeed').value)||12345,all=[];
  const assets=core.assets().filter(a=>a.category==='nature'&&nature.entryFor(a)&&nature.entryFor(a).kind!=='mountain'&&nature.entryFor(a).artStatus!=='deprecated');
  for(const c of core.cells()){
   const terrain=core.effectiveBiome(c),forest=terrain==='forest_floor';
   const pools={tree:new Map(),shrub:new Map(),groundCover:new Map()};
   for(const a of assets){
    const meta=nature.entryFor(a),role=kind(meta);
    if(!role||!nature.resolveForMeta(meta).has(terrain))continue;
    if(forest&&!families[state.forestProfile].includes(meta.family))continue;
    const species=window.VedrasSpritePlanner?.match(a)?.speciesId||meta.id;
    if(!pools[role].has(species))pools[role].set(species,[]);
    pools[role].get(species).push(a);
   }
   const goals={tree:0,shrub:0,groundCover:0};
   if(forest){
    const bounds=state.forestDensityStage==='edge'?[1,3]:state.forestDensityStage==='jungle'?[3,6]:[2,5];
    goals.tree=bounds[0]+Math.floor(rnd(seed,c.q,c.r,110)*(bounds[1]-bounds[0]+1));
    goals.shrub=1+Math.floor(rnd(seed,c.q,c.r,112)*3);
    goals.groundCover=Math.floor(rnd(seed,c.q,c.r,113)*4);
   }else{
    const biome=plan.densityProfiles[terrain]||{};
    for(const role of ['tree','shrub','groundCover']){
     const band=biome[role]||[0,0],prob=(band[0]+band[1])/200;
     goals[role]=rnd(seed,c.q,c.r,role.length*23+999)<prob?(role==='groundCover'?1+Math.floor(rnd(seed,c.q,c.r,103)*3):1):0;
    }
   }
   for(const role of ['tree','shrub','groundCover']){
    const groups=[...pools[role].values()];
    for(let n=0;n<goals[role]&&groups.length;n++){
     const weights=groups.map(g=>Math.max(.001,Number(nature.entryFor(g[0]).placement?.weight)||.1));
     let value=rnd(seed,c.q,c.r,role.length*113+n*71+13)*weights.reduce((a,b)=>a+b,0);
     let idx=groups.length-1;
     for(let k=0;k<groups.length;k++){value-=weights[k];if(value<=0){idx=k;break;}}
     const variants=groups[idx];
     const a=variants[Math.floor(rnd(seed,c.q,c.r,role.length*211+n*89+19)*variants.length)];
     const instance=nature.makeInstance(a,c.q,c.r,all.length+1,all,seed);
     if(instance)all.push(instance);
    }
   }
  }
  state.natureInstances=all;state.showLegacyNature=false;$('nShowDemo').checked=false;
  state.objects=true;$('objectsToggle').checked=true;core.persistScene();core.requestDraw();
  nature.renderPlaced();
  $('nMessage').textContent=all.length+' Nature-Instanzen mit Biom-Chancen, Waldtyp und Artgewicht verteilt.';
 }
 function forestPatch(){
  const png=core.assets().find(a=>a.category==='terrain'&&core.typeOfAsset(a)==='forest_floor');
  if(!png){$('nMessage').textContent='Keine Waldboden-Textur zugeordnet; wald_01–04 prüfen.';return;}
  if(!confirm('Waldboden auf dem gewählten Hex und bis zu sechs Nachbarn platzieren? Vorhandene Test-Terrainzuweisungen dort werden geändert.'))return;
  const [q,r]=state.selected.split(',').map(Number);let count=0;
  state.forestBaseBiomeByHex=state.forestBaseBiomeByHex||{};
  for(const c of core.cells()){
   const d=Math.max(Math.abs(c.q-q),Math.abs(c.r-r),Math.abs(c.q+c.r-q-r));
   if(d>1)continue;
   const k=c.q+','+c.r,old=core.effectiveBiome(c);
   if(old!=='forest_floor')state.forestBaseBiomeByHex[k]=old;
   state.hexTerrain[k]=png.path;count++;
  }
  core.invalidateTerrain();core.persistScene();core.requestDraw();
  $('nMessage').textContent=count+' Hexfelder mit Waldboden. Das vorherige Grundbiom wurde separat gespeichert.';
 }
 $('forestProfile').addEventListener('change',e=>{state.forestProfile=e.target.value;core.persistScene();});
 $('forestDensityStage').addEventListener('change',e=>{state.forestDensityStage=e.target.value;core.persistScene();});
 $('nForestPatch').addEventListener('click',forestPatch);
 // Capture before the legacy independent-per-asset handler, without deleting it.
 $('nPopulate').addEventListener('click',event=>{event.stopImmediatePropagation();populate();},true);
 return {populate,forestPatch,profiles,stages};
})();

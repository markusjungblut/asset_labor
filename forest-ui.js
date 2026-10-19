/* Forest laboratory controls: independent overlay; no change to original PNG/catalog. */
'use strict';
window.VedrasForestUI=(()=>{
 const $=id=>document.getElementById(id),core=window.VedrasAssetLabor,F=window.VedrasForest;
 if(!core||!$('forestTools'))return null;
 const state=core.state;
 function config(){state.forest=F.valid(state.forest);return state.forest;}
 function selectedKey(){return state.selected;}
 function render(){
  const f=config(),cells=core.forestCells(),selected=cells.find(c=>c.key===selectedKey());
  $('forestEnabled').checked=f.enabled;$('forestCoverage').value=String(Math.round(f.coverage*100));
  $('forestEdge').value=String(Math.round(f.edgeStrength*100));$('forestDebug').checked=f.debug;
  $('forestCoverageValue').textContent=Math.round(f.coverage*100)+' %';
  $('forestEdgeValue').textContent=Math.round(f.edgeStrength*100)+' %';
  const dense=cells.filter(c=>c.forestClass==='dense_forest').length,light=cells.filter(c=>c.forestClass==='light_forest').length;
  const edges=cells.filter(c=>c.forestClass==='none'&&c.edgeInfluence>.05).length;
  const jungle=cells.filter(c=>c.jungle).length;
  const name=selected?.jungle?'Dschungel über '+selected.baseBiome:selected?.baseBiome||'–';
  const cls=selected?.forestClass==='dense_forest'?'dicht':selected?.forestClass==='light_forest'?'licht':selected?.edgeInfluence>.05?'Waldrand':'offen';
  $('forestStatus').textContent=cells.length+' Hexe · '+dense+' dicht · '+light+' licht · '+edges+' Waldrand · '+jungle+' Dschungel · ausgewählt: '+name+', '+cls+' ('+Math.round((selected?.density||0)*100)+' % Waldintensität).';
 }
 function changed(repopulate=false){
  config();core.persistScene();core.requestDraw();window.dispatchEvent(new Event('vedras:forest-changed'));
  if(repopulate&&window.VedrasNature?.populate)window.VedrasNature.populate();
  else render();
 }
 function setOverride(kind){
  const f=config(),cell=core.forestCells().find(c=>c.key===selectedKey());
  if(!cell)return;
  if(kind==='auto')delete f.overrides[cell.key];
  else{
   if(cell.suitability===0)return; // Wasser darf auch manuell keinen Wald erhalten.
   f.overrides[cell.key]=kind;
  }
  changed(true);
 }
 $('forestEnabled').addEventListener('change',e=>{config().enabled=e.target.checked;changed(true);});
 $('forestCoverage').addEventListener('input',e=>{$('forestCoverageValue').textContent=e.target.value+' %';});
 $('forestCoverage').addEventListener('change',e=>{config().coverage=Number(e.target.value)/100;changed(true);});
 $('forestEdge').addEventListener('input',e=>{$('forestEdgeValue').textContent=e.target.value+' %';});
 $('forestEdge').addEventListener('change',e=>{config().edgeStrength=Number(e.target.value)/100;changed(true);});
 $('forestDebug').addEventListener('change',e=>{config().debug=e.target.checked;changed(false);});
 $('forestApply').addEventListener('click',()=>changed(true));
 for(const [button,override] of [['forestHexLight','light_forest'],['forestHexDense','dense_forest'],['forestHexNone','none'],['forestHexAuto','auto']]){
  $(button).addEventListener('click',()=>setOverride(override));
 }
 $('forestMakeJungle').addEventListener('click',()=>{
  const f=config(),cell=core.cells().find(c=>c.q+','+c.r===selectedKey());if(!cell)return;
  // Logisches Dschungelbiom, von der gewählten Grund-Textur unabhängig.
  // Wasserflächen bleiben ausdrücklich Wasser.
  let added=0;
  for(const c of core.cells()){
   if(F.distance(c,cell)>1)continue;
   const base=core.baseBiomeOf(c);
   if(!F.jungleAllowed(base))continue; // Moorwald and temperate forest cannot become jungle.
   if(f.jungleHexes[F.key(c.q,c.r)]!==true)added++;
   f.jungleHexes[F.key(c.q,c.r)]=true;
   delete f.overrides[F.key(c.q,c.r)];
  }
  changed(true);
  $('forestStatus').textContent+=' · '+added+' zulässige Dschungel-Hexe markiert (nur warme Basisbiome).';
 });
 $('forestClearJungle').addEventListener('click',()=>{config().jungleHexes={};changed(true);});
 window.addEventListener('vedras:hex-selected',render);
 window.addEventListener('vedras:forest-changed',render);
 window.addEventListener('vedras:terrain-catalog-changed',render);
 window.addEventListener('vedras:assets-loaded',render);
 $('nSeed')?.addEventListener('change',()=>{config().seed=Number($('nSeed').value)||12345;changed(false);});
 render();
 return {render,setOverride,config};
})();
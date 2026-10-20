/* Six-way hex path / road-upgrade editor; draws only into the map's
 * shared roadEdges graph. All materials have identical connectivity.
 */
'use strict';
(()=>{
 const core=window.VedrasAssetLabor,R=window.VedrasRoads;
 const $=id=>document.getElementById(id);
 if(!core||!R||!$('roadPanel'))return;
 const state=core.state,words=['NO','O','SO','SW','W','NW'];
 const current=()=>{const [q,r]=String(state.selected).split(',').map(Number);return {q,r};};
 const cellMap=()=>new Map(core.cells().map(c=>[R.key(c),c]));
 const water=c=>{const id=core.effectiveBiome(c);return core.catalog().terrainTypes.some(t=>t.id===id&&t.materialClass==='water');};
 const eligible=(a,b)=>{
  const cells=cellMap();
  return R.side(a,b)>=0&&cells.has(R.key(a))&&cells.has(R.key(b))&&
   !water(cells.get(R.key(a)))&&!water(cells.get(R.key(b)))&&
   !core.roads.blocked(cells.get(R.key(a)))&&!core.roads.blocked(cells.get(R.key(b)));
 };
 const edges=()=>R.normalizeEdges(state.roadEdges,core.cells(),water,core.roads.blocked);
 function commit(next){
  const outcome=core.roads.apply(next);
  render();
  if(outcome.removed)$('roadStatus').textContent+=' · '+outcome.removed+' Pflanzen-/Objektanker beim Straßenbau entfernt.';
 }
 function paintState(){
  const btn=$('roadPaint');
  btn.textContent=state.roadPaintMode?'Zeichnen beenden':'Hex für Hex zeichnen';
  btn.classList.toggle('primary',!!state.roadPaintMode);
 }
 function render(){
  const p=current(),list=$('roadNeighbors');
  if(!$('roadShown'))return;
  $('roadShown').checked=state.roadShown!==false;
  $('roadMaterial').value=R.levels.includes(state.roadMaterial)?state.roadMaterial:'trail';
  paintState();
  list.textContent='';
  const currentEdges=edges(),cells=cellMap();
  let count=0;
  R.DIRS.forEach(([dq,dr],i)=>{
   const neighbor={q:p.q+dq,r:p.r+dr},ok=eligible(p,neighbor);
   const exists=currentEdges.find(e=>R.identity(e.a,e.b)===R.identity(p,neighbor));
   if(exists)count++;
   const button=document.createElement('button');
   button.type='button';
   button.className='button outline';
   button.disabled=!ok;
   const level=exists?R.profiles[exists.level].title:null;
   button.textContent=words[i]+' · '+neighbor.q+','+neighbor.r+(ok?
    (exists?' · '+level+' → '+(exists.level===state.roadMaterial?'entfernen':'wechseln'):' · verbinden'):
    (cells.has(R.key(neighbor))?(core.roads.blocked(cells.get(R.key(neighbor)))||core.roads.blocked(cells.get(R.key(p)))?' · Berg gesperrt':' · Wasser'):' · außerhalb'));
   button.title=exists?'Mit ausgewähltem Material ersetzen; bei gleichem Material entfernen':'Weg zum benachbarten Hex hinzufügen';
   button.addEventListener('click',()=>{
    const next=exists&&exists.level===state.roadMaterial?
      R.removeEdge(currentEdges,p,neighbor,core.cells(),water,core.roads.blocked):
      R.setEdge(currentEdges,p,neighbor,state.roadMaterial,core.cells(),water,core.roads.blocked);
    commit(next);
   });
   list.append(button);
  });
  $('roadStatus').textContent=currentEdges.length+' Verbindungen auf der Karte · '+count+
   '/6 Abzweige an Hex '+state.selected+
   (state.roadPaintMode?' · Zeichenmodus: benachbartes Hex anklicken.':'');
 }
 $('roadShown').addEventListener('change',()=>{
  state.roadShown=$('roadShown').checked;core.persistScene();core.requestDraw();
 });
 $('roadMaterial').addEventListener('change',()=>{
  state.roadMaterial=$('roadMaterial').value;core.persistScene();render();
 });
 $('roadPaint').addEventListener('click',()=>{
  state.roadPaintMode=!state.roadPaintMode;
  state.roadPaintOrigin=state.roadPaintMode?state.selected:null;
  render();core.requestDraw();
 });
 $('roadRemoveLast').addEventListener('click',()=>{
  const list=edges();if(list.length)list.pop();commit(list);
 });
 $('roadClear').addEventListener('click',()=>{
  if(!edges().length||confirm('Alle Wege und ausgebauten Straßen entfernen?'))commit([]);
 });
 $('roadJunctionTest').addEventListener('click',()=>{
  let p=current(),count=0,next=edges();
  const candidates=R.DIRS.map(([dq,dr])=>({q:p.q+dq,r:p.r+dr}));
  for(const n of candidates)if(eligible(p,n)){
   next=R.setEdge(next,p,n,'trail',core.cells(),water,core.roads.blocked);count++;
   // A second branch away from the centre demonstrates connected intersections.
   const far={q:n.q+(n.q-p.q),r:n.r+(n.r-p.r)};
   if(eligible(n,far))next=R.setEdge(next,n,far,'trail',core.cells(),water,core.roads.blocked);
  }
  if(!count){$('roadStatus').textContent='Kein benachbartes Landhex vorhanden: bitte Landhex auswählen.';return;}
  state.roadShown=true;commit(next);
  $('roadStatus').textContent+=' · Sechsarm-Test: '+count+' Landverbindungen.';
 });
 window.addEventListener('vedras:hex-selected',render);
 window.addEventListener('vedras:road-changed',render);
 window.addEventListener('vedras:assets-loaded',render);
 render();
})();

/* Hex-edge wall prototype editor. No gameplay authority or build costs. */
'use strict';
(()=>{
 const W=window.VedrasWalls,core=window.VedrasAssetLabor;
 const $=id=>document.getElementById(id);
 if(!core||!W||!$('wallPanel'))return;
 const state=core.state,dirs=['NO','O','SO','SW','W','NW'];
 const selected=()=>{const [q,r]=state.selected.split(',').map(Number);return {q,r};};
 const env=()=>core.walls.environment();
 const walls=()=>W.normalize(state.wallEdges,env());
 const commit=(next)=>{
  core.walls.apply(next);render();
 };
 function render(){
  $('wallShown').checked=state.wallShown!==false;
  $('wallKind').value=W.kinds.includes(state.wallKind)?state.wallKind:'stone';
  $('wallTest').textContent=state.wallKind==='stone_gate'?'Beide südlichen Tore testen':'Alle sechs Kanten am Hex testen';
  $('wallPaint').textContent=state.wallPaintMode?'Kanten-Zeichnen beenden':'Kante über zwei Hexe zeichnen';
  $('wallPaint').classList.toggle('primary',!!state.wallPaintMode);
  const list=$('wallNeighbors');list.textContent='';
  const from=selected(),scope=env(),current=walls();
  const local=current.filter(e=>W.identity(e.a,e.b).includes(from.q+','+from.r));
  W.DIRS.forEach(([dq,dr],i)=>{
   const to={q:from.q+dq,r:from.r+dr},check=W.canPlace(from,to,scope),
    existing=current.find(e=>W.identity(e.a,e.b)===W.identity(from,to));
   const button=document.createElement('button');button.type='button';
   const placement=W.canPlaceKind(from,to,state.wallKind,scope);
   const removing=existing&&existing.kind===state.wallKind;
   button.className='button outline';button.disabled=!(check.ok&&(removing||placement.ok));
   button.textContent=dirs[i]+(existing?' · '+(existing.kind==='stone_gate'?'Steintor':existing.kind==='stone'?'Stein':'Palisade'):
    check.ok?' · freie Kante':' · gesperrt');
   button.title=(removing?check.reason:placement.reason)+(existing?' · Gleicher Typ: entfernen; anderer Typ: ersetzen.':'');
   button.addEventListener('click',()=>{
    const next=existing&&existing.kind===state.wallKind?
     W.removeEdge(current,from,to,scope):
     W.setEdge(current,from,to,state.wallKind,scope);
    commit(next);
   });
   list.append(button);
  });
  const count=current.filter(e=>[e.a,e.b].some(c=>c[0]===from.q&&c[1]===from.r)).length;
  const total=Array.isArray(state.wallEdges)?state.wallEdges.length:0;
  $('wallStatus').textContent=current.length+' Mauersegmente ('+total+
   ' gespeichert) · '+count+'/6 Kanten am ausgewählten Hex '+
   state.selected+(state.wallPaintMode?' · benachbartes Zielhex anklicken':'')+
   (current.length!==total?' · '+(total-current.length)+' zurzeit unzulässig/ausgeblendet':'');
 }
 $('wallShown').addEventListener('change',()=>{
  state.wallShown=$('wallShown').checked;
  core.persistScene();core.requestDraw();render();
 });
 $('wallKind').addEventListener('change',()=>{
  state.wallKind=$('wallKind').value;
  core.persistScene(false);render();
 });
 $('wallPaint').addEventListener('click',()=>{
  state.wallPaintMode=!state.wallPaintMode;
  state.wallPaintOrigin=state.wallPaintMode?state.selected:null;
  state.roadPaintMode=false;state.roadPaintOrigin=null;
  core.persistScene(false);core.requestDraw();render();
 });
 $('wallTest').addEventListener('click',()=>{
  const from=selected(),scope=env();
  let next=walls(),added=0;
  for(const [dq,dr] of W.DIRS){
   const to={q:from.q+dq,r:from.r+dr};
   if(!W.canPlaceKind(from,to,state.wallKind,scope).ok)continue;
   next=W.setEdge(next,from,to,state.wallKind,scope);added++;
  }
  if(!added){$('wallStatus').textContent='Keine bebaubare Nachbarkante am ausgewählten Hex.';return;}
  state.wallShown=true;commit(next);
  $('wallStatus').textContent+=' · Richtungstest: '+added+' Segmente möglich.';
 });
 $('wallRemoveLast').addEventListener('click',()=>{
  const list=walls();if(list.length){list.pop();commit(list);}
 });
 $('wallClear').addEventListener('click',()=>{
  if(walls().length&&confirm('Alle Mauersegmente aus dieser Testkarte entfernen?'))commit([]);
 });
 window.addEventListener('vedras:hex-selected',render);
 window.addEventListener('vedras:wall-changed',render);
 // Load/decode all twelve direction images asynchronously. A late asset
 // completion must invalidate the cached static scene, not just its sidebar.
 window.addEventListener('vedras:wall-art-ready',()=>{
  core.invalidateScenery();render();
 });
 window.addEventListener('vedras:river-changed',render);
 window.addEventListener('vedras:assets-loaded',render);
 render();
})();
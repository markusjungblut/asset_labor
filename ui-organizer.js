/* v0.11.0: Progressive disclosure & sprite planning. All existing IDs and events remain stable. */
'use strict';
(()=>{
 const $=id=>document.getElementById(id),P=window.VedrasSpritePlanner;
 const inspector=document.querySelector('.inspector');
 if(!inspector)return;
 // Separate mountain tools from Nature generation. Editing and mountain tools are independent workflows.
 const mountain=$('mountainTools'),natureTools=$('natureLabTools');
 if(mountain&&natureTools)natureTools.after(mountain);
 const captions={natureLabTools:'Natur auf Karte verteilen',spriteShadowLab:'Schatten-Editor: alle Sprites',mountainTools:'Berge & Bergketten',terrainTests:'Gelände & Regionen testen',reliefPanel:'Hügel & Relief',shorelinePanel:'Ufer & Küsten',riverPanel:'Flüsse',roadPanel:'Wege & Straßen',polishPanel:'Grafik-Finish',viewSettings:'Ansicht & Qualität',testSceneSettings:'Testszene & Ausgabe'};
 // Set up native accessible disclosure containers, no reimplementation of existing event handlers.
 function accordion(element,open){
  const wrap=document.createElement('details');wrap.className='lab-accordion';wrap.id='drawer_'+element.id;wrap.open=!!open;
  const head=document.createElement('summary');head.textContent=captions[element.id]||element.querySelector('h3')?.textContent||'Weitere Einstellungen';
  element.before(wrap);wrap.append(head,element);element.querySelector('h3')?.classList.add('visually-hidden');
  return wrap;
 }
 for(const id of ['natureLabTools','spriteShadowLab','mountainTools','terrainTests','reliefPanel','shorelinePanel']){const el=$(id);if(el)accordion(el,id==='natureLabTools');}
 for(const section of [...inspector.children].filter(x=>x.classList?.contains('control-section')&&x.id!=='natureInspector'&&x.id!=='assetTerrainTypeRow'))accordion(section,false);
 // Divide long metadata form into three independently collapsible groups.
 const form=$('natureInspector')?.querySelector('.nature-form');
 if(form){
  const nodes=[...form.children];
  const sections=[{name:'Identität & Größenprofil',first:0,last:9,open:true},{name:'Anker & Schatten',first:10,last:15,open:false},{name:'Biomfreigabe & Verteilung',first:16,last:nodes.length-1,open:false}];
  for(const part of sections){const d=document.createElement('details');d.className='lab-fieldset';d.open=part.open;
   const summary=document.createElement('summary');summary.textContent=part.name;d.append(summary);
   const container=document.createElement('div');container.className='lab-fieldset-inner';
   for(const node of nodes.slice(part.first,part.last+1))container.append(node);
   d.append(container);form.append(d);}
 }
 // Never alter runtime state, IndexedDB, or saved scene values when
 // reorganizing the user interface; existing controls retain their IDs.
 function makeBlock(title,nodes,{collapsed=false}={}){
  const outer=document.createElement(collapsed?'details':'section');
  outer.className=collapsed?'lab-advanced':'lab-setting-block';
  const head=document.createElement(collapsed?'summary':'h4');
  head.textContent=title;
  const body=document.createElement('div');
  body.className='lab-setting-body';
  outer.append(head,body);
  for(const node of nodes)if(node)body.append(node);
  return {outer,body};
 }
 function directChild(root,id){
  let node=$(id);
  while(node&&node.parentElement!==root)node=node.parentElement;
  return node?.parentElement===root?node:null;
 }
 // The normal view exposes display and transition controls. Older water
 // repetition and diagnostics remain accessible without taking page space.
 const view=$('viewSettings');
 if(view){
  const all=[...view.children].filter(node=>node.tagName!=='H3');
  const split=all.indexOf(directChild(view,'edgeBlendToggle'));
  const debug=all.indexOf(directChild(view,'transitionDebugMode'));
  if(split>0&&debug>split){
   const oldWater=directChild(view,'waterSamplingMode');
   const waterHelp=oldWater?.nextElementSibling?.tagName==='P'?
    oldWater.nextElementSibling:null;
   const display=makeBlock('Kartenansicht',all.slice(0,split));
   const blend=makeBlock('Geländeübergänge',all.slice(split,debug));
   const advanced=makeBlock('Diagnose & ältere A/B-Vergleiche',
    all.slice(debug),{collapsed:true});
   if(oldWater){
    advanced.body.prepend(oldWater);
    if(waterHelp)advanced.body.insertBefore(waterHelp,oldWater.nextSibling);
    const note=document.createElement('p');
    note.className='muted';
    note.textContent='Standard: Wassertexturen behalten ihr Motiv pro Hex. Alte Wiederholungsdarstellung nur zum Vergleichen.';
    blend.body.append(note);
   }
   view.append(display.outer,blend.outer,advanced.outer);
  }
 }
 // Group ordinary scene choices apart from the renderer feature toggles.
 // All toggles stay addressable for old scenes and controlled A/B checks.
 const tests=$('testSceneSettings');
 if(tests){
  const all=[...tests.children].filter(node=>node.tagName!=='H3');
  const settings=all.indexOf(directChild(tests,'chunkRendering'));
  const bake=all.indexOf(directChild(tests,'terrainBake'));
  const exports=all.indexOf(directChild(tests,'saveScene'));
  if(settings>0&&bake>settings&&exports>bake){
   const fog=directChild(tests,'fogPreview');
   const worker=directChild(tests,'workerTerrain');
   const workerHelp=worker?.nextElementSibling?.tagName==='P'?
    worker.nextElementSibling:null;
   const chunkStats=directChild(tests,'chunkStats');
   const gpuNodes=['gpuTerrain','gpuSprites','gpuStatus'].map(
    id=>directChild(tests,id)).filter(Boolean);
   const basics=makeBlock('Szenengröße & Vorschau',
    all.slice(0,settings));
   const renderer=makeBlock('Renderer-Standardwerte & Diagnose',
    all.slice(settings,bake),{collapsed:true});
   const preparation=makeBlock('Karten vorbereiten & Spielatlas',
    all.slice(bake,exports));
   const files=makeBlock('Export & Verwaltung',
    all.slice(exports));
   if(fog)basics.body.append(fog);
   for(const node of [worker,workerHelp,chunkStats])
    if(node)renderer.body.append(node);
   const gpu=makeBlock('WebGL2-Vergleiche (standardmäßig aus)',
    gpuNodes,{collapsed:true});
   renderer.body.append(gpu.outer);
   tests.append(basics.outer,renderer.outer,preparation.outer,files.outer);
  }
 }
 // Stable workflow order, existing listeners keep working because the
 // real DOM nodes, not cloned replacements, are moved.
 const groups=[
  {id:'terrain',title:'01 · Gelände & Wasser',
   drawers:['terrainTests','reliefPanel','shorelinePanel','riverPanel','roadPanel']},
  {id:'nature',title:'02 · Natur, Berge & Schatten',
   drawers:['natureLabTools','mountainTools','spriteShadowLab','polishPanel']},
  {id:'view',title:'03 · Ansicht & Darstellung',
   drawers:['viewSettings']},
  {id:'test',title:'04 · Testkarte & Ausgabe',
   drawers:['testSceneSettings']}
 ];
 for(const group of groups){
  const section=document.createElement('section');
  section.className='inspector-group';
  section.id='tools_'+group.id;
  const heading=document.createElement('h3');
  heading.textContent=group.title;
  section.setAttribute('aria-label',group.title);
  section.append(heading);
  for(const id of group.drawers){
   const drawer=$('drawer_'+id);
   if(drawer)section.append(drawer);
  }
  if(section.children.length>1)inspector.append(section);
 }
 // Collect top-bar authoring actions in one expandable menu, rather than
 // making all of them compete for space with zoom and view selection.
 const quick=document.querySelector('.map-toolbar .quick-actions');
 if(quick){
  const dropdown=document.createElement('details');
  dropdown.className='toolbar-tools-menu';
  const heading=document.createElement('summary');
  heading.textContent='Werkzeuge';
  heading.setAttribute('aria-label','Kartenwerkzeuge anzeigen');
  quick.before(dropdown);
  dropdown.append(heading,quick);
  quick.addEventListener('click',event=>{
   if(event.target.closest('button'))dropdown.open=false;
  });
 }
 const shortcuts=document.createElement('nav');
 shortcuts.className='inspector-shortcuts';
 shortcuts.setAttribute('aria-label','Arbeitsbereiche im Inspector');
 const targets=[
  ['terrainTests','Gelände'],['natureLabTools','Natur'],
  ['mountainTools','Berge'],['spriteShadowLab','Schatten'],
  ['viewSettings','Ansicht'],['testSceneSettings','Test & Export']
 ];
 for(const [id,label] of targets){
  if(!$('drawer_'+id))continue;
  const button=document.createElement('button');
  button.type='button';
  button.textContent=label;
  button.dataset.drawer=id;
  button.setAttribute('aria-controls','drawer_'+id);
  shortcuts.append(button);
 }
 inspector.querySelector('.paneheader')?.after(shortcuts);
 function openDrawer(id){
  const drawer=$('drawer_'+id);
  if(!drawer)return;
  drawer.open=true;
  drawer.scrollIntoView({behavior:'smooth',block:'start'});
 }
 shortcuts.addEventListener('click',event=>{
  const button=event.target.closest('button[data-drawer]');
  if(button)openDrawer(button.dataset.drawer);
 });
 // A jump to the Nature panel must NOT implicitly redistribute sprites.
 // Actual editing remains a separate, clearly labelled authoring action.
 $('quickPopulate')?.addEventListener('click',()=>$('nPopulate')?.click());
 $('quickMountains')?.addEventListener('click',()=>openDrawer('mountainTools'));
 // Planned sprite library; explicit filenames and catalog defaults, no user record overwritten.
 const planList=$('spritePlanList'),input=$('spritePlanSearch'),feedback=$('spritePlanFeedback');
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const natural=()=>window.VedrasNature?.catalog()?.entries||{};
 function download(name,data){const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

 function renderPlan(){
  if(!P||!planList)return;
  const q=(input?.value||'').trim().toLowerCase(),assets=window.VedrasAssetLabor?.assets?.()||[];
  const archived=P.resolved||[],terrainDetails=archived.filter(x=>x.resolution==='terrain_detail').length;
  planList.replaceChildren();
  let available=0;
  for(const item of P.entries){
   const filenames=[item.filename,...(item.aliases||[])].map(x=>x.toLowerCase());
   const actual=assets.find(a=>a.category==='nature'&&filenames.includes(a.name.toLowerCase()));
   if(actual)available++;
   if(q&&![item.id,item.name,item.family,item.kind,...filenames].some(v=>String(v).toLowerCase().includes(q)))continue;
   const saved=actual&&natural()[actual.relPath];
   const row=document.createElement('div');row.className='plan-item';
   const detail=document.createElement('div');
   const state=actual?(saved?'Im Nature-Katalog erfasst':'PNG vorhanden – Metadaten prüfen'):(item.priority==='optional'?'Optional – noch kein Bild':'Noch zu erstellen');
   detail.innerHTML='<strong>'+escape(item.name)+'</strong><small>'+escape(item.filename)+' · '+escape(item.kind)+' · '+escape(item.sizeClass)+' · '+item.targetHeight+' WE Höhe</small><small>'+escape(state)+' · '+escape(item.allowedTerrainCategories.join(', '))+'</small>';
   const button=document.createElement('button');button.className='plan-action';button.textContent='Sidecar';button.title='Metadaten für den vorgeschlagenen Dateinamen exportieren';
   button.addEventListener('click',()=>{
    const name=(actual?.name||item.filename).replace(/\.[^.]+$/,'');
    const meta=P.metadata(item,window.VedrasNatureCatalog.template());
    download(name+'.json',{assetType:'nature_sprite',relPath:actual?.relPath||'nature/'+item.filename,data:meta});
    feedback.textContent=item.name+' · Sidecar exportiert. Bereits gespeicherte individuelle Katalogdaten werden nicht überschrieben.';
   });
   row.append(detail,button);planList.append(row);
  }
  const outstanding=P.entries.length-available;
  if($('spritePlanCount'))$('spritePlanCount').textContent=outstanding+' offen · '+available+' vorhanden';
  if(feedback)feedback.textContent=P.entries.length+' gezielte Produktionsarten; '+(archived.length-terrainDetails)+' bereits abgedeckte Planposten und '+terrainDetails+' entfallene Boden-/Kleinstobjekte werden nicht als fehlende PNGs geführt.';
 }

 $('spritePlanSearch')?.addEventListener('input',renderPlan);$('spritePlanExport')?.addEventListener('click',()=>download('sprite_catalog_plan.json',{schemaVersion:2,items:P.entries,resolved:P.resolved||[]}));
 window.addEventListener('vedras:assets-loaded',renderPlan);window.addEventListener('vedras:nature-catalog-changed',renderPlan);renderPlan();
})();
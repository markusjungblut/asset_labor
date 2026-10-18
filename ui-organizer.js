/* v0.11.0: Progressive disclosure & sprite planning. All existing IDs and events remain stable. */
'use strict';
(()=>{
 const $=id=>document.getElementById(id),P=window.VedrasSpritePlanner;
 const inspector=document.querySelector('.inspector');
 if(!inspector)return;
 // Separate mountain tools from Nature generation. Editing and mountain tools are independent workflows.
 const mountain=$('mountainTools'),natureTools=$('natureLabTools');
 if(mountain&&natureTools)natureTools.after(mountain);
 const captions={natureLabTools:'Natur auf Karte verteilen',mountainTools:'Berge & Bergketten',terrainTests:'Gelände & Regionen testen',reliefPanel:'Hügel & Relief',shorelinePanel:'Ufer & Küsten',};
 // Set up native accessible disclosure containers, no reimplementation of existing event handlers.
 function accordion(element,open){
  const wrap=document.createElement('details');wrap.className='lab-accordion';wrap.id='drawer_'+element.id;wrap.open=!!open;
  const head=document.createElement('summary');head.textContent=captions[element.id]||element.querySelector('h3')?.textContent||'Weitere Einstellungen';
  element.before(wrap);wrap.append(head,element);element.querySelector('h3')?.classList.add('visually-hidden');
  return wrap;
 }
 for(const id of ['natureLabTools','mountainTools','terrainTests','reliefPanel','shorelinePanel']){const el=$(id);if(el)accordion(el,id==='natureLabTools');}
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
 // Sticky quick actions are always one click away, rather than buried after metadata.
 const shortcuts=document.createElement('nav');shortcuts.className='inspector-shortcuts';shortcuts.setAttribute('aria-label','Schnellzugriff');
 shortcuts.innerHTML='<button type="button" id="shortcutNature">Natur verteilen</button><button type="button" id="shortcutMountain">Berge</button><button type="button" id="shortcutMap">Testkarte</button>';
 inspector.querySelector('.paneheader')?.after(shortcuts);
 function openDrawer(id){const drawer=$('drawer_'+id);if(drawer)drawer.open=true;drawer?.scrollIntoView({behavior:'smooth',block:'start'});}
 const populate=()=>{openDrawer('natureLabTools');$('nPopulate')?.click();};
 $('quickPopulate')?.addEventListener('click',populate);$('shortcutNature')?.addEventListener('click',populate);
 const openMountain=()=>openDrawer('mountainTools');
 $('quickMountains')?.addEventListener('click',openMountain);$('shortcutMountain')?.addEventListener('click',openMountain);
 $('quick37')?.addEventListener('click',()=>{$('sceneSize').value='37';$('sceneSize').dispatchEvent(new Event('change',{bubbles:true}));});
 $('shortcutMap')?.addEventListener('click',()=>openDrawer('terrainTests'));
 // Planned sprite library; explicit filenames and catalog defaults, no user record overwritten.
 const planList=$('spritePlanList'),input=$('spritePlanSearch'),feedback=$('spritePlanFeedback');
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const natural=()=>window.VedrasNature?.catalog()?.entries||{};
 function download(name,data){const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function renderPlan(){if(!P||!planList)return;const q=(input?.value||'').trim().toLowerCase();planList.replaceChildren();let available=0;
  const assets=window.VedrasAssetLabor?.assets?.()||[];
  for(const item of P.entries.filter(i=>!q||[i.id,i.name,i.family,i.kind].some(v=>v.toLowerCase().includes(q)))){
   const matches=assets.filter(a=>a.category==='nature'&&P.matches(item,a));const hasAsset=matches[0];
   const saved=matches.length&&matches.every(a=>natural()[a.relPath]);if(matches.length)available++;
   const row=document.createElement('div');row.className='plan-item';
   const text=document.createElement('div');text.innerHTML=`<strong>${escape(item.name)}</strong><small>${escape(item.folder?'nature/'+item.folder+'/'+item.filename:item.filename)} · ${escape(item.kind)} · ${escape(item.sizeClass)} · ${item.targetHeight} WE Höhe</small><small>${saved?'Eingepflegt':hasAsset?'Grafik vorhanden':'Noch zu erstellen'} · ${matches.length} Varianten · ${escape((item.allowedTerrainTypes?.length?item.allowedTerrainTypes:item.allowedTerrainCategories).join(', '))}</small>`;
   const button=document.createElement('button');button.className='plan-action';button.textContent='Sidecar';button.title='Vollständige Metadaten als Sidecar-JSON';
   button.addEventListener('click',()=>{const name=item.filename.replace(/\.[^.]+$/,'');const meta=P.metadata(item,window.VedrasNatureCatalog.template());download(name+'.json',{assetType:'nature_sprite',relPath:'nature/'+(item.folder?item.folder+'/':'')+item.filename,data:meta});feedback.textContent=item.name+' · Metadaten exportiert. Neue PNG in den angezeigten Zielordner kopieren.';});
   row.append(text,button);planList.append(row);
  }
  if($('spritePlanCount'))$('spritePlanCount').textContent=`${available}/${P.entries.length} Arten mit Grafik`;
 }
 $('spritePlanSearch')?.addEventListener('input',renderPlan);$('spritePlanExport')?.addEventListener('click',()=>download('sprite_catalog_plan.json',{schemaVersion:1,items:P.entries}));
 window.addEventListener('vedras:assets-loaded',renderPlan);window.addEventListener('vedras:nature-catalog-changed',renderPlan);renderPlan();
})();
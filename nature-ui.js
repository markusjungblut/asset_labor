/* Nature asset laboratory v0.10.1 – client/editor with write-protected fallbacks. */
'use strict';
window.VedrasNature=(()=>{
 const $=id=>document.getElementById(id),core=window.VedrasAssetLabor,N=window.VedrasNatureCatalog;
 const state=core.state,escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let catalog=N.initial(),dirty=false,serverWritable=false,revision=0,saving=null,timer=null,selected=null;
 let pendingAutoImport=false,loadedFromServer=false;
 const message=s=>{$('nMessage').textContent=s;};
 const entryFor=a=>a?catalog.entries[a.relPath]||null:null;
 function status(){ const values=Object.values(catalog.entries);if($('nSizeAudit'))$('nSizeAudit').textContent=`${values.filter(e=>e.kind!=='mountain'&&e.sizeMode==='class').length} von ${values.filter(e=>e.kind!=='mountain').length} vorhandenen nicht-Berg-Sprites verwenden bereits die normierte sichtbare Höhe. Bisherige manuelle Breiten bleiben erhalten.`; $('nCatalogState').textContent=`${Object.keys(catalog.entries).length} Sprites · ${Object.keys(catalog.presets||{}).length} Presets · ${dirty?(serverWritable?'Speichern offen':'Export nötig'):(serverWritable?'gespeichert':'nur lokal')}`;}
 const slug=x=>String(x||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,55);
 function suggest(a){const m=(a?.meta?.assetType==='nature_sprite'&&a.meta.data)?a.meta.data:(a?.meta||{}),r={...N.template(),...m};r.id=N.idOK(m.id)?m.id:(slug(a.name.replace(/\.[^.]+$/,''))||'asset')+'_01';
  const plan=window.VedrasSpritePlanner?.match(a);if(plan)return window.VedrasSpritePlanner.metadata(plan,N.template());
  const existing=window.VedrasExistingAssets?.classify(a);if(existing)return window.VedrasExistingAssets.metadata(existing,N.template(),a.name);
  // Bei unbenannten PNGs niemals raten: generische, nicht spawnende Kategorie.
  r.family=N.idOK(m.family)?m.family:'unclassified';
  if(!N.kinds.includes(m.kind))r.kind='special';
  if(!m.placement)r.placement={...r.placement,weight:0,density:0};
  if(!Array.isArray(m.tags))r.tags=['needs_classification'];
  // Alte explizite Testnamen (pine_, rock_, mountain) behalten ihre Vorschau-Sonderregeln.
  r.artStatus=['candidate','test','approved','deprecated'].includes(m.artStatus)?m.artStatus:'candidate';
  if(a.name.startsWith('pine_')){r.kind='tree';r.family='conifers';r.sizeClass='medium';r.logicalWidth=65;r.shadow={mode:'generic_medium_round',path:''};}
  if(/(?:mountain|berg|snow_peak)/i.test(a.name)){r.kind='mountain';r.family='snowy_mountains';r.sizeClass='giant';r.logicalWidth=360;r.anchor={x:.5,y:.67};r.shadow={mode:'none',path:'',offsetX:-.24,offsetY:0,widthScale:.7,depthScale:.18};r.mountain={radius:1,coreRadius:0,shadowOpacity:.23,flatten:true};}
  if(a.name.startsWith('rock_')){r.kind='rock';r.family='rocks';r.shadow={mode:'generic_small_wide',path:''};}
  return r;
 }
 function rulesFromForm(){return {
  allowedTerrainCategories:[...$('nCategoryPick').querySelectorAll('input:checked')].map(x=>x.value),
  allowedTerrainTypes:[...$('nBiomes').querySelectorAll('select[data-type]')].filter(x=>x.value==='include').map(x=>x.dataset.type),
  excludedTerrainTypes:[...$('nBiomes').querySelectorAll('select[data-type]')].filter(x=>x.value==='exclude').map(x=>x.dataset.type)};
 }
 function terrainRegistry(){return core.catalog()||{categories:[],terrainTypes:[]};}
 function renderPresets(id=''){const saved=catalog.presets||{};
  $('nPresetSelect').innerHTML='<option value="">Kein Preset</option>'+Object.entries(saved).map(([k,v])=>`<option value="${escape(k)}">${escape(v.name)}</option>`).join('');
  $('nPresetSelect').value=id||'';
 }
 function ensureTypeOptions(m={}){
  const t=terrainRegistry(),categories=t.categories||[],types=t.terrainTypes||[];
  const enabledCats=new Set(m.allowedTerrainCategories||[]),added=new Set(m.allowedTerrainTypes||[]),excluded=new Set(m.excludedTerrainTypes||[]);
  $('nCategoryPick').innerHTML=categories.map(c=>`<label class="nature-category"><input type="checkbox" value="${escape(c.id)}" ${enabledCats.has(c.id)?'checked':''}> ${escape(c.name)} <span>(${types.filter(x=>x.categoryId===c.id).length})</span></label>`).join('');
  $('nBiomes').innerHTML=types.map(t=>`<div class="nature-type-rule"><span>${escape(t.name)}</span><select data-type="${escape(t.id)}"><option value="auto">Automatisch</option><option value="include">Zusätzlich</option><option value="exclude">Ausschließen</option></select></div>`).join('');
  for(const e of $('nBiomes').querySelectorAll('select[data-type]'))e.value=excluded.has(e.dataset.type)?'exclude':added.has(e.dataset.type)?'include':'auto';
  showCoverage();
 }
 function showCoverage(){if(!selected)return;
  const m={...rulesFromForm(),terrainPresetId:$('nPresetSelect').value};
  const ids=N.effectiveTypes(m,terrainRegistry(),catalog),total=terrainRegistry().terrainTypes?.length||0;
  $('nCoverage').textContent=`${ids.size} von ${total} Geländearten erlaubt. Kategorie-Freigaben gelten automatisch für künftige Arten. ${m.terrainPresetId?'Vorgaben aus Preset + individuelle Ergänzungen.':'Ohne Preset.'}`;
 }
 function resolveForMeta(m){return N.effectiveTypes(m,terrainRegistry(),catalog);}
 function alphaInspect(a){
  const info=$('nAlphaInfo');if(!a?.img?.naturalWidth){info.textContent='Bild nicht geladen – Transparenz nicht prüfbar.';return;}
  try{const cv=document.createElement('canvas');cv.width=cv.height=36;const c=cv.getContext('2d',{willReadFrequently:true});c.clearRect(0,0,36,36);c.drawImage(a.img,0,0,36,36);
   const data=c.getImageData(0,0,36,36).data,pts=[[0,0],[35,0],[0,35],[35,35],[1,18],[34,18]],opaque=pts.filter(([x,y])=>data[(y*36+x)*4+3]>240).length;
   info.classList.toggle('warning',opaque>=4);info.classList.toggle('passed',opaque<4);
   info.textContent=opaque>=4?'Freistellung prüfen: Außenbereiche überwiegend deckend – möglicherweise noch schwarzer/weißer Hintergrund. Als Produktionssprite nicht freigegeben.':'Transparenz-Stichprobe: Außenbereiche überwiegend transparent. Exakte Alpha-Kanten weiterhin visuell prüfen.';
  }catch(e){info.textContent='Alpha-Test nicht möglich; manuelle Prüfung notwendig.';}
 }
 function setForm(a){selected=a?.category==='nature'?a:null;$('natureInspector').classList.toggle('hidden',!selected);
  if(!selected){$('nAddToHex').disabled=false;return;}
  $('nAddToHex').disabled=false;
  $('nAddToHex').title='Ausgewähltes Nature-Sprite auf das Hex setzen';
  alphaInspect(selected);
  const m=entryFor(selected)||suggest(selected);
  const val=(id,x)=>{$(id).value=x??'';};
  $('nMountainFields').classList.toggle('hidden',m.kind!=='mountain');
  val('nMountainRadius',m.mountain?.radius||1);val('nMountainCoreRadius',m.mountain?.coreRadius===1?1:0);val('nMountainShadow',m.mountain?.shadowOpacity??.23);$('nMountainFlatten').checked=m.mountain?.flatten!==false;
  val('nId',m.id);val('nDescription',m.description);val('nSource',m.sourceReference);val('nFamily',m.family);
  val('nKind',m.kind);val('nSize',m.sizeClass);val('nSizeMode',m.sizeMode||'manual');val('nWidth',m.logicalWidth);updateSizeHint();val('nScaleMin',m.scaleMin);val('nScaleMax',m.scaleMax);
  val('nAnchorX',m.anchor?.x);val('nAnchorY',m.anchor?.y);val('nShadowMode',m.shadow?.mode);val('nShadowPath',m.shadow?.path);
  val('nShadowX',m.shadow?.offsetX??-.24);val('nShadowY',m.shadow?.offsetY??0);val('nShadowWidth',m.shadow?.widthScale??.70);val('nShadowDepth',m.shadow?.depthScale??.18);
  val('nWeight',m.placement?.weight);val('nDensity',m.placement?.density);val('nSpacing',m.placement?.minSpacing);val('nMargin',m.placement?.edgeMargin);
  $('nCluster').checked=!!m.placement?.canCluster;val('nStatus',m.artStatus);val('nTags',(m.tags||[]).join(', '));
  renderPresets(m.terrainPresetId||'');ensureTypeOptions(m);
  const used=[...new Set(Object.values(catalog.entries).map(x=>x.family))];$('nFamilySuggestions').innerHTML=used.map(v=>`<option value="${escape(v)}"></option>`).join('');
  message(entryFor(selected)?'Metadaten aus Nature-Katalog geladen.':'Noch nicht katalogisiert. Bitte bearbeiten und speichern.');
 }
 function updateSizeHint(){if(!selected)return;const kind=$('nKind').value,cl=$('nSize').value,mode=$('nSizeMode').value;
  const h=window.VedrasSpritePlanner?.targetHeight(kind,cl)||50;
  const img=selected.img;
  $('nSizeInfo').textContent=mode==='class'?`Automatische Zielhöhe ca. ${h} Welteinheiten (sichtbarer Ausschnitt, unabhängig von PNG-Größe). Die eingestellte Basisbreite bleibt als manueller Rückfall erhalten.`:`Manueller Modus: Basisbreite ${$('nWidth').value||'?'} Welteinheiten. Größenklasse ist hier nur ein Katalogetikett.`;
 }
 function readForm(){if(!selected)throw Error('Nature-Sprite auswählen');const f=id=>$(id).value.trim();
  const m={id:f('nId'),description:f('nDescription'),sourceReference:f('nSource'),family:f('nFamily'),kind:f('nKind'),sizeClass:f('nSize'),sizeMode:f('nSizeMode'),targetHeight:window.VedrasSpritePlanner?.targetHeight(f('nKind'),f('nSize'))||40,
   logicalWidth:Number(f('nWidth')),scaleMin:Number(f('nScaleMin')),scaleMax:Number(f('nScaleMax')),
   anchor:{x:Number(f('nAnchorX')),y:Number(f('nAnchorY'))},shadow:{mode:f('nShadowMode'),path:f('nShadowPath'),
    offsetX:Number(f('nShadowX')),offsetY:Number(f('nShadowY')),widthScale:Number(f('nShadowWidth')),depthScale:Number(f('nShadowDepth'))},
   terrainPresetId:f('nPresetSelect'),...rulesFromForm(),
   placement:{weight:Number(f('nWeight')),density:Number(f('nDensity')),minSpacing:Number(f('nSpacing')),canCluster:$('nCluster').checked,edgeMargin:Number(f('nMargin'))},
   mountain:{radius:Number(f('nMountainRadius'))||1,coreRadius:Number(f('nMountainCoreRadius'))===1?1:0,shadowOpacity:Number(f('nMountainShadow')),flatten:$('nMountainFlatten').checked},
   artStatus:f('nStatus'),tags:f('nTags')?f('nTags').split(',').map(x=>x.trim()).filter(Boolean):[]};
  const next=structuredClone(catalog);next.entries[selected.relPath]=m;
  const errors=N.validate(next,terrainRegistry());if(errors.length)throw Error(errors.join(' · '));return m;
 }
 const saveTimer=()=>{if(timer)clearTimeout(timer);timer=null;if(!serverWritable||!dirty)return;timer=setTimeout(()=>save().catch(e=>message('Speichern fehlgeschlagen: '+e.message+' – lokale Daten bleiben erhalten.')),350);};
 function change(){dirty=true;revision++;status();saveTimer();window.dispatchEvent(new Event('vedras:nature-catalog-changed'));}
 async function save(){if(timer){clearTimeout(timer);timer=null;}if(saving){await saving;if(!dirty)return;}if(!dirty)return;
  if(!serverWritable)throw Error('Nur Browseransicht: Nature-Katalog exportieren.');
  const errors=N.validate(catalog,terrainRegistry());if(errors.length)throw Error(errors.join(' / '));
  const work=(async()=>{while(dirty){const r=revision;const payload=JSON.stringify(catalog);
   const res=await fetch('/api/nature-catalog',{method:'POST',headers:{'Content-Type':'application/json'},body:payload});
   if(!res.ok)throw Error('HTTP '+res.status+' '+(await res.text()).slice(0,140));
   if(r===revision){dirty=false;status();message('Nature-Katalog automatisch gespeichert.');}
  }})();saving=work;try{await work;}finally{if(saving===work)saving=null;}
 }
 const exportJSON=(name,data)=>{const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 async function reload(){if(dirty){try{await save();}catch(e){message('Katalog nicht gespeichert: '+e.message+' – wird NICHT überschrieben.');}}
  const r0=revision;
  try{const response=await fetch('/api/nature-catalog',{cache:'no-store'});if(!response.ok)throw Error('Server nicht verfügbar');const data=await response.json();
   const errors=N.validate(data,terrainRegistry());if(errors.length)throw Error(errors.join('; '));
   if(!dirty&&revision===r0)catalog=data;loadedFromServer=true;serverWritable=true;status();$('nRecoveryStatus').textContent=Object.keys(catalog.entries).length+' gespeicherte Nature-Zuordnungen vom Server geladen. Editor öffnet sich beim Anklicken einer Nature-Grafik.';importSidecars();cleanup();if(dirty)saveTimer();setForm(core.assets().find(a=>a.path===core.state.asset));
  }catch(e){serverWritable=false;status();message('Nature-Katalog konnte nicht geladen werden: '+e.message+' – vorhandene Daten nicht zurückgesetzt.');$('nRecoveryStatus').textContent='Ladefehler: '+e.message+'. Bitte den ursprünglichen assets/nature/nature_catalog.json sichern und ggf. die .bak prüfen.';}
 }
 async function importJSON(file){let data=JSON.parse(await file.text());let next;
  if(data.schemaVersion===1&&data.entries)next={...data,presets:data.presets||{}};
  else if(data.assetType==='nature_sprite'&&data.relPath&&data.data){
   if(!N.validPath(data.relPath))throw Error('Assetpfad ungültig');next=structuredClone(catalog);next.entries[data.relPath]=data.data;
  }else if(data.id&&data.kind&&selected){next=structuredClone(catalog);next.entries[selected.relPath]=data;}
  else throw Error('Weder Nature-Katalog noch Sprite-Sidecar erkannt');
  const errors=N.validate(next,terrainRegistry());if(errors.length)throw Error(errors.join('; '));
  if(Object.keys(catalog.entries).length&&!confirm('Vorhandene Nature-Metadaten durch den Import ersetzen bzw. ergänzen?'))return;
  catalog=next;change();setForm(core.assets().find(a=>a.path===core.state.asset));message('Nature-Daten importiert; '+Object.keys(catalog.entries).length+' Sprites erfasst.');
 }
 function pts(q,r){return {x:256*(q+r/2),y:1.5*(256/Math.sqrt(3))*r};}
 const R=256/Math.sqrt(3);
 const neighborTypes=(q,r)=>window.VedrasRivers.DIRS.map(([dq,dr])=>core.cells().find(c=>c.q===q+dq&&c.r===r+dr)).filter(Boolean).map(c=>core.effectiveBiome(c));
 function eligible(meta,q,r){
  const cell=core.cells().find(c=>c.q===q&&c.r===r);
  if(!cell||!meta||meta.kind==='mountain')return false;
  const type=core.effectiveBiome(cell),allowed=resolveForMeta(meta);
  const forestFallback=type==='forest_floor'&&cell.biome==='forest'&&allowed.has('grassland')&&['tree','shrub','ground_cover','cluster','special'].includes(meta.kind);
  return (allowed.has(type)||forestFallback)&&N.habitatOK(meta,type,neighborTypes(q,r),terrainRegistry());
 }
 function blocksRiver(q,r,dx,dy,meta){
  const pos=pts(q,r),x=pos.x+dx,y=pos.y+dy;
  const width=Number(state.riverWidth)||32;
  const radius=Math.max(6,Math.min(28,(Number(meta?.logicalWidth)||52)*.16));
  return window.VedrasRivers.blocksPoint(x,y,state.riverPaths||[],core.cells(),
   c=>['water','shoreline'].includes(terrainRegistry().terrainTypes.find(t=>t.id===core.effectiveBiome(c))?.materialClass),
   width,radius+5);
 }
 function validInstance(inst){
  const a=core.assets().find(v=>v.path===inst.assetPath),meta=entryFor(a);
  if(!a||!meta)return null; // Unknown assets are retained pending import.
  return eligible(meta,inst.q,inst.r)&&!blocksRiver(inst.q,inst.r,inst.dx,inst.dy,meta);
 }
 function cleanup(){
  if(!Object.keys(catalog.entries||{}).length)return 0;
  const before=(state.natureInstances||[]).length;
  state.natureInstances=(state.natureInstances||[]).filter(inst=>validInstance(inst)!==false);
  const dropped=before-state.natureInstances.length;
  if(dropped){saved();message(dropped+' unzulässige Nature-Instanz(en) entfernt: Wasser, Fluss oder unpassendes Biom.');}
  return dropped;
 }
 function inside(x,y,margin=0){const ax=Math.abs(x),ay=Math.abs(y);return ay<=R-margin&&ax<=Math.min(128,Math.sqrt(3)*(R-ay))-margin;}
 // Simple deterministic, order-independent per asset + hex. Never uses Math.random().
 function hash(seed,q,r,k){let h=(seed|0)^Math.imul(q+97,374761393)^Math.imul(r+513,668265263)^Math.imul(k+11,2246822519);h^=h>>>13;h=Math.imul(h,1274126177);return (h^(h>>>16))>>>0;}
 const random=(seed,q,r,k)=>hash(seed,q,r,k)/4294967296;
 function makeInstance(a,q,r,index,all,seed,spacingFactor=1){const meta=entryFor(a);if(!meta||meta.kind==='mountain')return null;
  if((state.mountainInstances||[]).some(m=>window.VedrasMountains.occupied(m).includes(q+','+r)))return null;
  if(!eligible(meta,q,r))return null;
  const margin=meta.placement.edgeMargin;const scale=meta.scaleMin+(meta.scaleMax-meta.scaleMin)*random(seed,q,r,index*47+7);
  const p=pts(q,r);for(let j=0;j<48;j++){
   const dx=(random(seed,q,r,index*127+j*2+17)-.5)*242,dy=(random(seed,q,r,index*127+j*2+18)-.5)*258;
   if(!inside(dx,dy,margin))continue;
   const x=p.x+dx,y=p.y+dy;
   if(blocksRiver(q,r,dx,dy,meta))continue;
   if((q===0&&r===0)&&Math.hypot(dx,dy-52)<65)continue; // reserve mine demo footprint
   if(all.some(i=>{const v=pts(i.q,i.r);const other=catalog.entries[i.assetPath.replace(/^assets\//,'')];const spacing=Math.max(20,Math.max(meta.placement.minSpacing,other?.placement?.minSpacing||0)*spacingFactor);
     return Math.hypot(x-v.x-i.dx,y-v.y-i.dy)<spacing;}))continue;
   return {assetPath:a.path,assetId:meta.id,q,r,dx:Math.round(dx*100)/100,dy:Math.round(dy*100)/100,scale:Math.round(scale*1000)/1000};
  }return null;
 }
 function saved(){core.persistScene();core.requestDraw();renderPlaced();}
 function placeSelected(){const a=core.assets().find(a=>a.path===state.asset);if(a?.category!=='nature'){message('Bitte links ein Nature-Sprite wählen.');return;}
  const meta=entryFor(a);if(!meta){message('Zuerst Sprite-Metadaten speichern.');return;}
  const [q,r]=state.selected.split(',').map(Number);const arr=state.natureInstances||[];
  if(!eligible(meta,q,r)){message('Dieses Nature-Sprite ist auf dem ausgewählten Biom nicht zulässig. Mangroven brauchen geeignete warme Feuchtufer und einen Landanker.');return;}
  const instance=makeInstance(a,q,r,arr.filter(x=>x.q===q&&x.r===r).length+1,arr,Number($('nSeed').value)||12345);
  if(!instance){message('Keine freie Standfläche auf diesem Hex.');return;}
  state.natureInstances=[...arr,instance];state.objects=true;$('objectsToggle').checked=true;saved();message(meta.id+' auf Hex ('+q+','+r+') platziert.');
 }
 function populate(){
  const seed=Number($('nSeed').value)||12345;
  state.natureSeed=seed;
  state.forest=window.VedrasForest.valid({...state.forest,seed});
  const F=window.VedrasForest,forest=core.forestCells();
  const forestByHex=new Map(forest.map(c=>[c.key,c]));
  const all=[],assets=core.assets();
  const candidates=assets.filter(a=>F&&window.VedrasExistingAssets?.canAutoPlaceInTest(a,entryFor(a),entryFor(a)?resolveForMeta(entryFor(a)):null));
  let suitableCells=0,forestTrees=0;
  const rank=(a,c,salt)=>random(seed,c.q,c.r,salt+a.relPath.split('').reduce((v,ch)=>Math.imul(v,31)+ch.charCodeAt(0)|0,0));
  for(const c of core.cells()){
   const terrainType=core.effectiveBiome(c),f=forestByHex.get(c.q+','+c.r);
   const type=terrainRegistry().terrainTypes?.find(x=>x.id===terrainType);
   const possible=candidates.filter(a=>{
    const m=entryFor(a);
    if(!F.preferredFamily(m.family,f))return false;
    if(!eligible(m,c.q,c.r))return false;
    // Ordinary tundra is largely snow-free: snowy conifers remain possible but rare.
    if(core.effectiveBiome(c)==='tundra'&&m.family==='snow_conifers'&&rank(a,c,973)>=.02)return false;
    return true;
   });
   if(possible.length)suitableCells++;
   const treePriority=a=>{
    const p=entryFor(a).placement;
    // Häufigkeit aus dem Nature-Katalog beachten; seltene Baumarten werden
    // trotz dichter Waldklasse nicht so häufig wie gewöhnliche Bäume gezogen.
    return rank(a,c,301)/Math.max(.04,p.density*Math.min(1,p.weight));
   };
   const trees=possible.filter(a=>entryFor(a).kind==='tree').sort((a,b)=>treePriority(a)-treePriority(b));
   const other=possible.filter(a=>entryFor(a).kind!=='tree').sort((a,b)=>rank(a,c,302)-rank(b,c,302));
   const wantedTrees=F.treeTarget(f),objectCap=F.maxObjects(f);
   const spacingFactor=f?.forestClass==='dense_forest'?.67:f?.forestClass==='light_forest'?.82:.95;
   let count=0,treeCount=0;
   for(const a of trees){
    if(treeCount>=wantedTrees||count>=objectCap)break;
    const meta=entryFor(a);
    const inst=makeInstance(a,c.q,c.r,all.length+1,all,seed,spacingFactor);
    if(inst){all.push(inst);treeCount++;count++;forestTrees++;}
   }
   // Auf offenen Hexen bleiben vereinzelte Bäume erhalten, ohne gleich einen
   // Wald zu erzeugen. Wald- und Randhexe bekommen zuerst ihre Baumquote.
   if(!wantedTrees&&f?.source!=='manual'&&trees.length&&rank(trees[0],c,311)<.12&&count<objectCap){
    const inst=makeInstance(trees[0],c.q,c.r,all.length+1,all,seed);
    if(inst){all.push(inst);count++;forestTrees++;}
   }
   for(const a of other){
    if(count>=objectCap)break;
    const meta=entryFor(a);
    const factor=f?.forestClass==='dense_forest'?1.65:f?.forestClass==='light_forest'?1.30:f?.edgeInfluence>.1?1.15:1;
    const chance=Math.min(0.9,meta.placement.density*Math.min(1,meta.placement.weight)*factor);
    if(rank(a,c,312)>=chance)continue;
    const inst=makeInstance(a,c.q,c.r,all.length+1,all,seed,spacingFactor);
    if(inst){all.push(inst);count++;}
   }
  }
  state.natureInstances=all;state.showLegacyNature=false;$('nShowDemo').checked=false;
  state.objects=true;$('objectsToggle').checked=true;
  saved();window.dispatchEvent(new Event('vedras:forest-changed'));
  const dense=forest.filter(c=>c.forestClass==='dense_forest').length,light=forest.filter(c=>c.forestClass==='light_forest').length;
  const edge=forest.filter(c=>c.forestClass==='none'&&c.edgeInfluence>.05).length;
  if(!candidates.length)message('0 Nature-Instanzen: Keine zulässigen Nature-Sprites. Katalog und Dichte prüfen.');
  else if(!suitableCells)message('0 Nature-Instanzen: Die aktuellen Geländearten passen zu keinem Nature-Sprite.');
  else message(all.length+' Nature-Instanzen ('+forestTrees+' Bäume) auf '+core.cells().length+' Hexen · Wald: '+dense+' dicht, '+light+' licht, '+edge+' Rand · '+candidates.length+' Testkandidaten.');
 }

 function mountainGeometry(m){
  const a=core.assets().find(a=>a.path===m.assetPath),meta=entryFor(a);
  return {width:meta?.logicalWidth||360,aspect:a?.img?.naturalWidth?a.img.naturalHeight/a.img.naturalWidth:1,anchorX:meta?.anchor?.x??.5,anchorY:meta?.anchor?.y??.67};
 }
 function selectedMountain(){const [q,r]=state.selected.split(',').map(Number);return (state.mountainInstances||[]).find(m=>m.q===q&&m.r===r)||null;}
 function getShadowControls(){return {opacity:Number($('mountainCastOpacity').value),reach:Number($('mountainCastReach').value),softness:Number($('mountainCastSoft').value)};}
 function setShadowControls(s){
  $('mountainCastOpacity').value=String(s.opacity??.48);$('mountainCastReach').value=String(s.reach??1.3);$('mountainCastSoft').value=String(s.softness??12);
  $('mountainCastOpacityText').textContent=Number($('mountainCastOpacity').value).toFixed(2).replace('.',',');
  $('mountainCastReachText').textContent=Number($('mountainCastReach').value).toFixed(2).replace('.',',')+'×';
  $('mountainCastSoftText').textContent=$('mountainCastSoft').value;
 }
 function syncMountainControls(){
  const current=selectedMountain(),defaults=state.mountainShadowDefaults||{opacity:.48,reach:1.3,softness:12};
  setShadowControls(current?{
   opacity:current.shadowOpacity??defaults.opacity,reach:current.shadowReach??defaults.reach,softness:current.shadowSoftness??defaults.softness
  }:defaults);
  renderMountainOverlap();
 }
 function renderMountainOverlap(){
  const mts=state.mountainInstances||[];let peak=0,pair=null;
  for(let i=0;i<mts.length;i++)for(let j=i+1;j<mts.length;j++){
   const ratio=window.VedrasMountains.visualOverlap(mts[i],mts[j],mountainGeometry(mts[i]),mountainGeometry(mts[j]));
   if(ratio>peak){peak=ratio;pair=[mts[i],mts[j]];}
  }
  const limit=window.VedrasMountains.SPACING[state.mountainSpacing||'normal'];
  $('mountainOverlapStats').textContent=`${mts.length} Berge · größte projizierte Rechtecküberdeckung: ${Math.round(peak*100)} %${pair?' ('+pair[0].q+','+pair[0].r+' ↔ '+pair[1].q+','+pair[1].r+')':''} · Neugrenze: ${Math.round(limit*100)} %. Bestehende Berge bleiben erhalten.`;
 }
 function updateShadow(){
  const values=getShadowControls(),current=selectedMountain();
  if(current){current.shadowOpacity=values.opacity;current.shadowReach=values.reach;current.shadowSoftness=values.softness;}
  else state.mountainShadowDefaults={...values};
  setShadowControls(values);core.requestDraw();core.persistScene();
  $('mountainStatus').textContent=current?`Schlagschatten für Berg (${current.q},${current.r}) gespeichert.`:'Schattenvorgaben für neue Berge gespeichert.';
 }
 function placedMountainsMessage(){const all=state.mountainInstances||[],chains=window.VedrasMountains.chainGroups(all);
  return `${all.length} Berge · ${[...chains.keys()].filter(x=>x.startsWith('chain:')).length} Bergketten`;}
 function placeMountain(){
  const a=core.assets().find(a=>a.path===state.asset),meta=entryFor(a);
  if(a?.category!=='nature'||meta?.kind!=='mountain'){message('Wähle ein katalogisiertes Nature-Sprite der Klasse Berg.');return;}
  const [q,r]=state.selected.split(',').map(Number),config=window.VedrasMountains.config(meta);
  const eligible=new Set(resolveForMeta(meta));
  const mode=$('mountainMode').value==='chain'?'chain':'single',chainId=$('mountainChainId').value.trim();
  if(mode==='chain'&&!/^[a-zA-Z0-9_-]{1,50}$/.test(chainId)){message('Bergketten-ID: 1–50 Zeichen (Buchstaben, Zahlen, - oder _).');return;}
  const result=window.VedrasMountains.candidate({cells:core.cells(),mountains:state.mountainInstances||[],nature:state.natureInstances||[],objects:state.hexObject||{}},q,r,config.radius,
    cell=>{const t=core.effectiveBiome(cell),tt=core.catalog().terrainTypes.find(v=>v.id===t);return tt?.materialClass==='ground'&&eligible.has(t);},
    {coreRadius:config.coreRadius,mode,chainId,spacing:state.mountainSpacing||'normal',visualInfo:mountainGeometry({assetPath:a.path}),visualInfoOf:mountainGeometry});
  if(!result.ok){message('Berg nicht platziert: '+result.reason);$('mountainStatus').textContent=result.reason;return;}
  const sh=state.mountainShadowDefaults||{opacity:.48,reach:1.3,softness:12};
  state.mountainInstances=[...(state.mountainInstances||[]),{assetPath:a.path,assetId:meta.id,q,r,radius:config.radius,coreRadius:config.coreRadius,mode,chainId:mode==='chain'?chainId:null,shadowOpacity:sh.opacity,shadowReach:sh.reach,shadowSoftness:sh.softness}];
  state.objects=true;$('objectsToggle').checked=true;
  core.invalidateTerrain?.();saved();syncMountainControls();$('mountainStatus').textContent=`${meta.id}: ${result.area.length} Kernhex(e) reserviert; ${result.influenceArea.length} Einflusshexe. Nachbarfelder für Sprites frei. ${placedMountainsMessage()}`;
 }
 function testMountainChain(){
  const mountains=core.assets().filter(a=>a.category==='nature'&&entryFor(a)?.kind==='mountain'&&a.img?.naturalWidth);
  if(!mountains.length){message('Erst mindestens einen Berg mit Nature-Metadaten katalogisieren.');return;}
  if(!confirm('19-Hex-Bergketten-Test ersetzen: Bisherige Terrain- und Objektplatzierungen dieser Testszene werden überschrieben. Fortfahren?'))return;
  const terrain=core.assets().find(a=>a.category==='terrain'&&core.isTerrainValid(a)&&core.typeOfAsset(a)&&core.catalog().terrainTypes.some(t=>t.id===core.typeOfAsset(a)&&t.materialClass==='ground')&&mountains.every(m=>resolveForMeta(entryFor(m)).has(core.typeOfAsset(a))));
  if(!terrain){message('Für die Bergkette fehlt eine gemeinsame, für alle Berge freigegebene Landtextur.');return;}
  state.sceneSize=19;$('sceneSize').value='19';core.assignBiomes();
  state.hexTerrain=Object.fromEntries(core.cells().map(c=>[c.q+','+c.r,terrain.path]));state.biomeTerrain={};
  state.hexObject={};state.natureInstances=[];state.mountainInstances=[];
  const centers=[[0,0],[1,0],[0,1],[-1,1]];const id='testkette_01';
  centers.forEach(([q,r],i)=>{const a=mountains[i%mountains.length],meta=entryFor(a),conf=window.VedrasMountains.config(meta);
   const result=window.VedrasMountains.candidate({cells:core.cells(),mountains:state.mountainInstances,nature:[],objects:{}},q,r,conf.radius,
    c=>{const tt=core.catalog().terrainTypes.find(t=>t.id===core.effectiveBiome(c));return c.q===q&&c.r===r&&tt?.materialClass==='ground';},
    {coreRadius:0,mode:'chain',chainId:id,spacing:state.mountainSpacing||'normal',visualInfo:mountainGeometry({assetPath:a.path}),visualInfoOf:mountainGeometry});
   if(result.ok){const sh=state.mountainShadowDefaults||{opacity:.48,reach:1.3,softness:12};state.mountainInstances.push({assetPath:a.path,assetId:meta.id,q,r,radius:conf.radius,coreRadius:0,mode:'chain',chainId:id,shadowOpacity:sh.opacity,shadowReach:sh.reach,shadowSoftness:sh.softness});}
  });
  state.objects=true;state.showLegacyNature=false;state.river=false;state.mountainDebug=true;
  $('objectsToggle').checked=true;$('nShowDemo').checked=false;$('riverToggle').checked=false;$('mountainDebug').checked=true;
  $('mountainMode').value='chain';$('mountainChainId').value=id;state.mountainMode='chain';state.mountainChainId=id;
  core.invalidateTerrain?.();saved();syncMountainControls();core.requestDraw();
  $('mountainStatus').textContent=`${state.mountainInstances.length} von 4 Bergen in der 19-Hex-Testkette. Kernhex frei, Nachbarn bebaubar.`;
 }
 function joinMountainChain(){
  const id=$('mountainChainId').value.trim(),[q,r]=state.selected.split(',').map(Number);
  if(!/^[a-zA-Z0-9_-]{1,50}$/.test(id)){message('Ketten-ID ist ungültig.');return;}
  const idx=(state.mountainInstances||[]).findIndex(m=>m.q===q&&m.r===r);
  if(idx<0){message('Kein Berganker auf dem ausgewählten Hex.');return;}
  const original=state.mountainInstances[idx],other=state.mountainInstances.filter((_,i)=>i!==idx);
  const updated={...original,mode:'chain',chainId:id};
  if(other.some(m=>window.VedrasMountains.overlaps(m,updated)||window.VedrasMountains.influenceOverlaps(m,updated)&&!window.VedrasMountains.sameChain(m,updated))){
   message('Bergkette kann andere, nicht zugehörige Einzelberge nicht überlagern.');return;
  }
  state.mountainInstances=[...state.mountainInstances.slice(0,idx),updated,...state.mountainInstances.slice(idx+1)];
  state.mountainMode='chain';state.mountainChainId=id;$('mountainMode').value='chain';
  core.invalidateTerrain?.();saved();message('Berg an Hex '+state.selected+' gehört jetzt zur Kette '+id+'.');
 }
 function removeMountain(){const [q,r]=state.selected.split(',').map(Number),before=(state.mountainInstances||[]).length;
  state.mountainInstances=(state.mountainInstances||[]).filter(m=>m.q!==q||m.r!==r);
  if(before===state.mountainInstances.length){message('Kein Berganker auf diesem Hex.');return;}
  core.invalidateTerrain?.();saved();syncMountainControls();$('mountainStatus').textContent='Berg entfernt; Kernzone freigegeben. '+placedMountainsMessage();
 }
 function renderPlaced(){const [q,r]=state.selected.split(',').map(Number);const matches=(state.natureInstances||[]).map((x,i)=>({...x,index:i})).filter(x=>x.q===q&&x.r===r);
  $('nPlacedList').innerHTML=matches.length?matches.map(x=>`<div><button data-del="${x.index}" title="Instanz entfernen">×</button><strong>${escape(x.assetId)}</strong> · (${x.dx.toFixed(0)}, ${x.dy.toFixed(0)}) · ${x.scale.toFixed(2)}×</div>`).join(''):'Auf diesem Hex keine individuell platzierten Nature-Sprites.';
  for(const b of $('nPlacedList').querySelectorAll('[data-del]'))b.addEventListener('click',()=>{state.natureInstances.splice(Number(b.dataset.del),1);saved();});
 }
 // Reusable presets are linked by stable ID. Local category/type exceptions remain per sprite.
 function updateCatalogAndView(){change();setForm(selected);core.requestDraw();}
 $('nPresetCreate').addEventListener('click',()=>{try{
   if(!selected)throw Error('Bitte zuerst ein Sprite auswählen.');
   const name=$('nPresetName').value.trim(),id=slug(name);if(!id||!name||name.length>90)throw Error('Name für das Preset eingeben.');
   if((catalog.presets||{})[id])throw Error('Preset-ID existiert bereits. Wähle einen anderen Namen.');
   const entry=readForm(),r=rulesFromForm();catalog.presets=catalog.presets||{};
   catalog.presets[id]={name,categoryIds:r.allowedTerrainCategories,typeIds:r.allowedTerrainTypes,excludeIds:r.excludedTerrainTypes};
   entry.terrainPresetId=id;entry.allowedTerrainCategories=[];entry.allowedTerrainTypes=[];entry.excludedTerrainTypes=[];
   catalog.entries[selected.relPath]=entry;
   const errors=N.validate(catalog,terrainRegistry());if(errors.length)throw Error(errors.join(' / '));
   updateCatalogAndView();message('Preset „'+name+'“ erstellt und mit dem Sprite verknüpft.');
  }catch(e){message('Preset konnte nicht erstellt werden: '+e.message);}});
 $('nPresetUpdate').addEventListener('click',()=>{try{
   const id=$('nPresetSelect').value,preset=(catalog.presets||{})[id];if(!preset)throw Error('Bitte ein bestehendes Preset auswählen.');
   const entry=readForm(),r=rulesFromForm();
   preset.categoryIds=[...new Set([...(preset.categoryIds||[]),...r.allowedTerrainCategories])];
   preset.typeIds=[...new Set([...(preset.typeIds||[]),...r.allowedTerrainTypes])];
   preset.excludeIds=[...new Set([...(preset.excludeIds||[]),...r.excludedTerrainTypes])];
   entry.terrainPresetId=id;entry.allowedTerrainCategories=[];entry.allowedTerrainTypes=[];entry.excludedTerrainTypes=[];
   catalog.entries[selected.relPath]=entry;
   const errors=N.validate(catalog,terrainRegistry());if(errors.length)throw Error(errors.join(' / '));
   updateCatalogAndView();message('Preset aktualisiert; alle damit verknüpften Sprites verwenden die neuen Regeln.');
  }catch(e){message('Preset konnte nicht aktualisiert werden: '+e.message);}});
 $('nPresetRemove').addEventListener('click',()=>{const id=$('nPresetSelect').value,preset=(catalog.presets||{})[id];if(!preset)return;
   if(!confirm('Preset „'+preset.name+'“ löschen? Verknüpfte Sprites behalten die bisherige Freigabe als eigene Regeln.'))return;
   const before=structuredClone(catalog);
   try{for(const entry of Object.values(catalog.entries))if(entry.terrainPresetId===id){
     entry.allowedTerrainCategories=[...new Set([...(preset.categoryIds||[]),...(entry.allowedTerrainCategories||[])])];
     entry.allowedTerrainTypes=[...new Set([...(preset.typeIds||[]),...(entry.allowedTerrainTypes||[])])];
     entry.excludedTerrainTypes=[...new Set([...(preset.excludeIds||[]),...(entry.excludedTerrainTypes||[])])];entry.terrainPresetId='';
   }
   delete catalog.presets[id];const errors=N.validate(catalog,terrainRegistry());if(errors.length)throw Error(errors.join(' / '));
   updateCatalogAndView();message('Preset gelöscht; Sprite-Freigaben übernommen.');}
   catch(e){catalog=before;message('Löschen fehlgeschlagen: '+e.message);}
 });
 $('nPresetSelect').addEventListener('change',showCoverage);
 $('nCategoryPick').addEventListener('change',showCoverage);
 $('nBiomes').addEventListener('change',showCoverage);
 $('nShadowDebug').addEventListener('change',e=>{state.natureShadowDebug=e.target.checked;core.requestDraw();});
 window.addEventListener('vedras:terrain-catalog-changed',()=>{if(selected){
   const m=entryFor(selected)||suggest(selected);renderPresets($('nPresetSelect').value||m.terrainPresetId||'');
   ensureTypeOptions({...m,...rulesFromForm()}); // refresh dynamic menu when terrain types change
  }});
 $('nSave').addEventListener('click',()=>{try{const meta=readForm();catalog.entries[selected.relPath]=meta;change();setForm(selected);message('Sprite gespeichert: '+meta.id);}catch(e){message('Validierung: '+e.message);}});
 $('nExportOne').addEventListener('click',()=>{try{const entry=readForm();exportJSON(entry.id+'.json',{assetType:'nature_sprite',relPath:selected.relPath,data:entry});}catch(e){message(e.message);}});
 $('nDelete').addEventListener('click',()=>{if(!selected||!entryFor(selected)||!confirm('Nature-Katalogeintrag entfernen? Bilddatei bleibt bestehen.'))return;delete catalog.entries[selected.relPath];change();setForm(selected);});
 $('nNormalizeAll').addEventListener('click',()=>{
  const candidates=Object.values(catalog.entries).filter(e=>e.kind!=='mountain'&&e.sizeMode!=='class');
  if(!candidates.length){message('Alle bestehenden Nicht-Berg-Sprites verwenden bereits Klassengrößen.');return;}
  if(!confirm(`${candidates.length} bereits katalogisierte Sprites künftig anhand ihrer Größenklasse skalieren? Die bisherigen Basisbreiten bleiben als manueller Rückfall erhalten. Bitte zuvor den Nature-Katalog exportieren.`))return;
  for(const e of candidates){e.sizeMode='class';e.targetHeight=window.VedrasSpritePlanner.targetHeight(e.kind,e.sizeClass);}
  change();setForm(selected);core.requestDraw();message(candidates.length+' Größenprofile angewendet. Alte Basisbreiten erhalten; Metadaten werden gespeichert.');
 });
 $('nExportAll').addEventListener('click',()=>exportJSON('nature_catalog.json',catalog));
 $('nImportCatalog').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{await importJSON(f);}catch(err){message('Import abgelehnt: '+err.message);}e.target.value='';});
 $('mountainSpacing').addEventListener('change',e=>{state.mountainSpacing=e.target.value;renderMountainOverlap();core.persistScene();});
 for(const id of ['mountainCastOpacity','mountainCastReach','mountainCastSoft'])$(id).addEventListener('input',updateShadow);
 $('mountainShadowAll').addEventListener('click',()=>{
  const v=getShadowControls();for(const m of (state.mountainInstances||[])){m.shadowOpacity=v.opacity;m.shadowReach=v.reach;m.shadowSoftness=v.softness;}
  state.mountainShadowDefaults={...v};saved();message(`Schattenwerte auf ${(state.mountainInstances||[]).length} Berge und künftige Platzierungen angewandt.`);
 });
 $('mountainShadowDebug').addEventListener('change',e=>{state.mountainShadowDebug=e.target.checked;core.requestDraw();core.persistScene();});
 window.addEventListener('vedras:hex-selected',syncMountainControls);
 $('mountainMode').addEventListener('change',e=>{state.mountainMode=e.target.value;core.persistScene();});
 $('mountainChainId').addEventListener('change',e=>{state.mountainChainId=e.target.value.trim();core.persistScene();});
 $('mountainPlace').addEventListener('click',placeMountain);$('mountainRemove').addEventListener('click',removeMountain);$('mountainChainTest').addEventListener('click',testMountainChain);$('mountainJoinChain').addEventListener('click',joinMountainChain);
 $('mountainDebug').addEventListener('change',e=>{state.mountainDebug=e.target.checked;core.requestDraw();core.persistScene();});
 $('nMountainAnchor067').addEventListener('click',()=>{$('nAnchorX').value='0.5';$('nAnchorY').value='0.67';message('Berganker auf X=0,50 / Y=0,67 gesetzt. Klicke „Sprite-Metadaten speichern“, um diese Änderung zu übernehmen.');});
 for(const id of ['nKind','nSize','nSizeMode','nWidth'])$(id).addEventListener('change',updateSizeHint);
 $('nKind').addEventListener('change',e=>{const mountain=e.target.value==='mountain';$('nMountainFields').classList.toggle('hidden',!mountain);if(mountain&&Number($('nAnchorY').value)===.96){$('nAnchorX').value='0.5';$('nAnchorY').value='0.67';}});
 $('nAddToHex').addEventListener('click',placeSelected);$('nPopulate').addEventListener('click',populate);
 $('nCleanup').addEventListener('click',()=>{const removed=cleanup();if(!removed)message('Keine überprüfbaren Fehlplatzierungen gefunden. Nicht geladene Assets bleiben erhalten.');});
 $('nClearHex').addEventListener('click',()=>{const [q,r]=state.selected.split(',').map(Number);state.natureInstances=(state.natureInstances||[]).filter(i=>i.q!==q||i.r!==r);saved();});
 $('nClearAll').addEventListener('click',()=>{if(!confirm('Generierte Nature-Instanzen aus der aktuellen Testszene entfernen?'))return;state.natureInstances=[];saved();});
 $('nShowDemo').addEventListener('change',e=>{state.showLegacyNature=e.target.checked;saved();});
 $('nSeed').addEventListener('change',saved);
 $('nShadowMode').addEventListener('change',()=>{$('nShadowPath').disabled=$('nShadowMode').value!=='custom';});
 const previousOnSelect=core.onSelect; // core only calls our own hook, no cycles
 const onSelect=a=>{setForm(a);renderPlaced();$('nShadowPath').disabled=$('nShadowMode').value!=='custom';};
 function importSidecars(){let count=0,skipped=[];
   for(const a of core.assets().filter(x=>x.category==='nature'&&!entryFor(x))){
     const raw=a.meta?.assetType==='nature_sprite'?(a.meta.data||a.meta):a.meta;
     if(!raw?.id||!raw?.kind){
      const plan=window.VedrasSpritePlanner?.match(a);
      const existing=window.VedrasExistingAssets?.classify(a);
      const proposed=plan?window.VedrasSpritePlanner.metadata(plan,N.template()):existing?window.VedrasExistingAssets.metadata(existing,N.template(),a.name):null;
      if(proposed){const trial=structuredClone(catalog);trial.entries[a.relPath]=proposed;
       if(!N.validate(trial,terrainRegistry()).length){catalog.entries[a.relPath]=proposed;count++;}else skipped.push(a.name);}
      continue;
     }
     const test=structuredClone(catalog);test.entries[a.relPath]=raw;
     const errors=N.validate(test,terrainRegistry());
     if(errors.length){skipped.push(a.name);continue;}
     catalog.entries[a.relPath]=raw;count++;
   }
   if(count){change();message(count+' Nature-Asset-Sidecar(s) automatisch zugeordnet.');}
   if(skipped.length)message('Importhinweis: unpassende Sidecars bei '+skipped.join(', '));
 }
 const onLibrary=async()=>{if(core.terrainReady?.()&&!loadedFromServer&&!dirty)await reload();
  importSidecars();setForm(core.assets().find(a=>a.path===state.asset));status();};
 window.addEventListener('vedras:assets-loaded',onLibrary);
 window.addEventListener('vedras:hex-selected',renderPlaced);
 window.addEventListener('vedras:assets-loaded',syncMountainControls);
 for(const event of ['vedras:river-changed','vedras:nature-catalog-changed','vedras:terrain-catalog-changed'])
  window.addEventListener(event,cleanup);
 window.addEventListener('vedras:terrain-catalog-changed',()=>{if(core.terrainReady?.()&&!dirty)reload();else if(selected)ensureTypeOptions(entryFor(selected)||suggest(selected));});
 $('nShowDemo').checked=state.showLegacyNature!==false;$('nSeed').value=String(state.natureSeed||12345);
 $('nSeed').addEventListener('change',()=>{state.natureSeed=Number($('nSeed').value)||12345;saved();});
 if(core.terrainReady?.())reload();
 $('nBackupPreview').addEventListener('click',async()=>{try{
  const res=await fetch('/api/nature-catalog-backup',{cache:'no-store'});if(!res.ok)throw Error('Keine Sicherung verfügbar');
  const backup=await res.json();const amount=Object.keys(backup.entries||{}).length;
  if(!confirm('Sicherung enthält '+amount+' Sprite-Einträge. Jetzt als Nature-Katalog wiederherstellen? Der aktuelle Stand wird zuvor vom Server gesichert.'))return;
  const r=await fetch('/api/nature-catalog',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(backup)});
  if(!r.ok)throw Error((await r.text()).slice(0,200));dirty=false;await reload();
  message('Sicherung wiederhergestellt: '+amount+' Sprite-Einträge.');
 }catch(e){message('Wiederherstellung: '+e.message);}});
 return {catalog:()=>catalog,entryFor,resolveForMeta,onSelect,placeSelected,reload,save,renderPlaced,populate,inside,makeInstance,eligible,blocksRiver,validInstance,cleanup};
})();
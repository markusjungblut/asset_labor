/* Isolated import UI: never runs in editor/game. No automatic writes.
 * The chosen ZIP is inspected read-only first; a new scene is then created
 * only after user explicitly confirms. No persistent state is cleared.
 */
'use strict';
(()=>{
 const $=id=>document.getElementById(id);
 const archive=$('archive'),inspect=$('inspect'),submit=$('import'),
  confirm=$('confirm'),partial=$('allowPartial'),partialRow=$('partialRow'),
  preview=$('preview'),status=$('status'),link=$('openViewer');
 $('origin').textContent=location.origin;
 let current=null,checked=null,busy=false;
 const update=()=>{
  inspect.disabled=busy||!archive.files?.length;
  submit.disabled=busy||!current||!checked||!confirm.checked||
   (!checked.summary.complete&&!partial.checked);
 };
 const reset=()=>{
  current=null;checked=null;link.hidden=true;link.removeAttribute('href');
  preview.textContent='Noch kein Archiv geprüft.';
  status.textContent='';
  confirm.checked=false;partial.checked=false;partialRow.hidden=true;
  update();
 };
 archive.addEventListener('change',reset);
 confirm.addEventListener('change',update);
 partial.addEventListener('change',update);
 inspect.addEventListener('click',async()=>{
  const file=archive.files?.[0];
  if(!file||busy)return;
  reset();busy=true;update();
  preview.textContent='Prüfe ZIP-Verzeichnis und Manifest – ohne Speicherung …';
  try{
   const result=await window.VedrasStaticMapZipInspector.inspect(file);
   checked=result;current=file;
   const s=result.summary;
   preview.textContent='Archiv: '+file.name+'\nOriginalkarte: '+s.scene+
    '\nDetailstufe: '+s.level+'\nKacheln: '+s.exportedTiles+
    ' / '+(s.expectedTiles??'unbekannt')+'\nPNG-Schichten: '+s.layerFiles+
    '\nArchivgröße: '+s.archiveBytes.toLocaleString('de-DE')+' Bytes'+
    '\nStatus: '+(s.complete?'vollständig':'UNVOLLSTÄNDIG');
   partialRow.hidden=s.complete;
   status.textContent='Noch nichts gespeichert. Zum Import bestätigen.';
  }catch(error){
   preview.textContent='ZIP-Prüfung fehlgeschlagen: '+String(error.message||error);
  }finally{busy=false;update();}
 });
 submit.addEventListener('click',async()=>{
  if(busy||!current||!checked||!confirm.checked||submit.disabled)return;
  busy=true;update();link.hidden=true;
  status.textContent='Neuen Kartenbereich reservieren …';
  const file=current;
  try{
   const report=await window.VedrasStaticMapZipImporter.restore(file,{
    confirmed:true,allowPartial:!checked.summary.complete&&partial.checked,
    onProgress:p=>{status.textContent='Kachel '+p.done+' / '+p.total+
     ' geprüft und in neuer Karte abgelegt …';}
   });
   status.textContent='Wiederhergestellt: '+report.scene+' · '+report.tiles+
    ' Kacheln · '+(report.complete?'vollständige Karte':'Teilkarte');
   link.href=report.viewerPath;
   link.hidden=false;
   checked=null;current=null;confirm.checked=false;
  }catch(error){
   status.textContent='Import nicht abgeschlossen: '+String(error.message||error)+
    '\nDas ursprüngliche Kartenarchiv wurde nicht verändert.';
  }finally{busy=false;update();}
 });
 // No automatic cleanup. Inspect the marker list only when clicked.
 const scan=$('scanPending'),results=$('pendingResults');
 scan.addEventListener('click',async()=>{
  if(busy)return;
  scan.disabled=true;
  results.textContent='Suche Importmarkierungen – noch keine Änderungen …';
  try{
   const pending=await window.VedrasStaticMapZipImporter.listPending();
   results.replaceChildren();
   if(!pending.length){
    results.textContent='Keine offenen Importmarkierungen gefunden.';return;
   }
   for(const item of pending){
    const row=document.createElement('div');
    row.className='recoveryRow';
    const label=document.createElement('span');
    label.textContent=item.scene+' · Letzte Aktivität: '+
     (item.lastActivityAt||'unbekannt')+
     (item.eligible?' · Bereinigung zulässig':' · noch aktiv/zu neu');
    row.appendChild(label);
    const remove=document.createElement('button');
    remove.type='button';
    remove.dataset.scene=item.scene;
    remove.textContent='Nur diesen unvollständigen Import entfernen';
    remove.disabled=!item.eligible;
    remove.addEventListener('click',async()=>{
     if(!window.confirm('Den unveröffentlichten Import '+item.scene+
      ' entfernen? Stelle sicher, dass kein anderer Tab importiert. '+
      'Fertige Karten bleiben unverändert.'))return;
     remove.disabled=true;
     try{
      const result=await window.VedrasStaticMapZipImporter.discardPending(
       item.scene,item.token,{confirmed:true});
      row.textContent='Bereinigt: '+result.scene+' ('+result.removed+
       ' ausschließlich zugehörige Importdatensätze)';
     }catch(e){
      label.textContent='Bereinigung abgelehnt: '+String(e.message||e);
     }
    });
    row.appendChild(remove);
    results.appendChild(row);
   }
  }catch(e){results.textContent='Prüfung fehlgeschlagen: '+String(e.message||e);}
  finally{scan.disabled=false;}
 });
 update();
})();
/* FloraV2 read-only reference explorer. Never intercepts Nature spawn or edits catalog. */
'use strict';
window.VedrasFloraWorkspace=(()=>{
 const plan=window.VedrasFloraPlan;
 const panel=document.getElementById('floraV2Panel');
 if(!panel||!plan)return null;
 const $=id=>document.getElementById(id);
 const data=plan.species||[];
 const search=$('floraV2Search'),family=$('floraV2Family'),list=$('floraV2List'),summary=$('floraV2Summary');
 const families=[...new Set(data.map(s=>s.family))].sort((a,b)=>a.localeCompare(b,'de'));
 for(const f of families){const option=document.createElement('option');option.value=f;option.textContent=f;family.append(option);}
 function draw(){
  const query=(search.value||'').trim().toLocaleLowerCase('de'),wanted=family.value;
  const assets=window.VedrasAssetLabor?.assets?.()||[];
  const files=new Set(assets.filter(a=>a.category==='nature').map(a=>a.name.toLocaleLowerCase('de')));
  const visible=data.filter(s=>(!wanted||s.family===wanted)&&(!query||[s.id,s.name,s.family,s.filename,...(s.aliases||[])].some(x=>String(x).toLocaleLowerCase('de').includes(query))));
  list.replaceChildren();
  for(const s of visible){
   const names=(s.aliases||[]),count=names.filter(n=>files.has(n.toLocaleLowerCase('de'))).length;
   const row=document.createElement('div');row.className='flora-row';
   const title=document.createElement('strong');title.textContent=s.name;
   const meta=document.createElement('small');meta.textContent=s.family+' · '+(s.kind||'')+' · '+count+'/'+names.length+' bekannte Bestandsvarianten';
   const detail=document.createElement('small');
   detail.textContent=count?'Vorhanden: '+names.filter(n=>files.has(n.toLocaleLowerCase('de'))).join(', '):'Nur Referenz, keine Produktionsfreigabe';
   row.append(title,meta,detail);list.append(row);
  }
  summary.textContent=visible.length+'/'+data.length+' Kategorien';
  $('floraV2Help').textContent='Nur Referenz: '+data.length+' Kategorien, '+data.reduce((n,s)=>n+(s.aliases||[]).length,0)+' bekannte Dateialiasse. Verbindliche Größen, Biome und Kapok-/Buschklassifikationen stehen im Nature-Katalog.';
 }
 search.addEventListener('input',draw);family.addEventListener('change',draw);
 window.addEventListener('vedras:assets-loaded',draw);
 window.addEventListener('vedras:nature-catalog-changed',draw);
 draw();
 return {draw,count:data.length};
})();
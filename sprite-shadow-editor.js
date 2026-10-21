/* Vedras Reiche: unified sprite shadow profiles + interactive calibration.
 * Rendered shadows are derived from alpha-cropped silhouettes; PNGs and
 * Nature placement metadata are NEVER modified.
 */
'use strict';
window.VedrasSpriteShadows=(()=>{
 const fields={
  angle:{min:105,max:215,step:1,default:160},
  opacity:{min:0,max:.75,step:.01,default:.40},
  length:{min:.15,max:2.6,step:.01,default:1.05},
  width:{min:.2,max:1.8,step:.01,default:.62},
  softness:{min:0,max:30,step:.5,default:6},
  offsetX:{min:-.8,max:.8,step:.01,default:-.07},
  offsetY:{min:-.5,max:.5,step:.01,default:.025},
  contact:{min:0,max:.7,step:.01,default:.21},
  strength:{min:0,max:2,step:.01,default:.68}
 };
 const shapeKeys=Object.keys(fields).filter(x=>x!=='strength');
 const defaults=()=>({schemaVersion:1,revision:0,
  global:Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,v.default])),
  profiles:{}});
 let current=defaults();
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 function valid(input){
  if(!input||input.schemaVersion!==1||!input.global||
   typeof input.global!=='object'||!input.profiles||
   typeof input.profiles!=='object'||Array.isArray(input.profiles))
   throw Error('Ungültiges Schattenprofil v1.');
  const keys=Object.keys(input.profiles);
  if(keys.length>10000)throw Error('Zu viele Sprite-Profile.');
  function numeric(obj,allowStrength){
   if(!obj||Array.isArray(obj)||typeof obj!=='object')throw Error('Ungültige Schattenwerte.');
   for(const [k,v] of Object.entries(obj)){
    if(k==='enabled'&&!allowStrength&&typeof v==='boolean')continue;
    const rule=fields[k];if(!rule||(k==='strength'&&!allowStrength)||
      typeof v!=='number'||!Number.isFinite(v)||v<rule.min||v>rule.max)
     throw Error('Schattenwert außerhalb des Bereichs: '+k);
   }
  }
  numeric(input.global,true);
  for(const field of Object.keys(fields))if(!(field in input.global))
   throw Error('Globaler Schattenparameter fehlt: '+field);
  for(const key of keys){
   if(!/^assets\/(?:nature|buildings|units)\/[A-Za-z0-9_./-]+\.(?:png|webp|jpg|jpeg|svg|gif|avif)$/i.test(key)||
     key.includes('..'))throw Error('Ungültiger Sprite-Pfad: '+key);
   const p=input.profiles[key];
   numeric(p,false);
   if('enabled' in p&&typeof p.enabled!=='boolean')throw Error('Ungültiger Schatten-Schalter.');
  }
  return {schemaVersion:1,revision:Number.isSafeInteger(input.revision)&&input.revision>=0?input.revision:0,
   global:{...input.global},profiles:Object.fromEntries(keys.map(k=>[k,{...input.profiles[k]}]))};
 }
 function set(data){current=valid(data);return current;}
 function get(){return current;}
 function profile(asset){
  const path=typeof asset==='string'?asset:asset?.path||'';
  return {...current.global,...(current.profiles[path]||{})};
 }
 function draw(ctx,obj,p,width,silhouette,anchor={x:.5,y:.96},strength=null){
  if(!silhouette?.canvas||!(width>0))return;
  const x=profile(obj.asset),family=obj.natureMeta?.family,
    log=family==='fallen_logs'||family==='snow_fallen_logs',
    small=obj.natureMeta?.kind==='ground_cover';
  if(x.enabled===false||x.opacity<=0)return;
  const globalStrength=strength===null?current.global.strength:strength;
  const alpha=clamp(globalStrength*x.opacity*(small?.28:1)*(family==='snow_fallen_logs'?.8:1),0,.95);
  if(alpha<=0)return;
  const height=width*silhouette.aspect,ax=clamp(Number(anchor.x??.5),0,1),
    ay=clamp(Number(anchor.y??.96),0,1),rad=x.angle*Math.PI/180,
    reach=width*x.length,castX=reach*Math.cos(rad),castY=reach*Math.sin(rad)*(log?.14:.30),
    ox=p.x+width*x.offsetX,oy=p.y+width*x.offsetY,
    blur=Math.min(30,x.softness);
  ctx.save();ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=clamp(alpha*(log?.65:.48),0,.94);
  ctx.fillStyle='#203131';ctx.filter='blur('+Math.max(0,blur*.65)+'px)';
  // Contact ellipse is long for logs, compact for trees and stones.
  const contactX=ox+castX*(log?.40:.22),contactY=oy+castY*(log?.36:.20);
  const rx=width*(log?.53:.24)*Math.max(.25,x.width)*(1+x.contact),
    ry=width*(log?.075:.085)*(x.contact+.25);
  if(x.contact>0){ctx.beginPath();ctx.ellipse(contactX,contactY,rx,ry,
    log?-.08:0,0,Math.PI*2);ctx.fill();}
  // A single directional TRUE-ALPHA cast extends from the contact point to
  // the left; it never uses the legacy round/small-cluster shadow texture.
  ctx.globalAlpha=alpha;ctx.filter='blur('+blur+'px)';
  ctx.translate(ox,oy);
  const horiz=clamp(x.width,.2,1.8);
  ctx.transform(horiz,log?.01:.035,
   -castX/Math.max(height,1),-castY/Math.max(height,1),0,0);
  ctx.beginPath();ctx.rect(-width*ax,-height*ay,width,height*ay);ctx.clip();
  ctx.drawImage(silhouette.canvas,-width*ax,-height*ay,width,height);
  ctx.restore();
 }
 const api={fields,shapeKeys,defaults,valid,set,get,profile,draw};
 return api;
})();
window.addEventListener('DOMContentLoaded',()=>{
 const $=id=>document.getElementById(id),Engine=window.VedrasSpriteShadows,
  core=window.VedrasAssetLabor,panel=$('spriteShadowLab');
 if(!core||!panel)return;
 let cursor=0,visible=[],dirty=false,saveInProgress=false,seq=0;
 let loaded=false,editable=false;
 const canvas=$('ssPreview'),ctx=canvas.getContext('2d');
 const inputs={
  global:Engine.shapeKeys.concat('strength'),
  sprite:Engine.shapeKeys
 };
 const text=s=>{$('ssStatus').textContent=s;};
 const asset=()=>visible[cursor]||null;
 const labelFor=a=>a?.category==='nature'?'Natur':a?.category==='buildings'?'Gebäude':'Einheiten';
 const numeric=(id)=>Number($(id).value);
 function list(){
  const query=$('ssSearch').value.toLowerCase().trim(),category=$('ssCategory').value;
  const prior=asset()?.path;
  visible=core.assets().filter(a=>['nature','buildings','units'].includes(a.category)&&a.img?.naturalWidth&&
   (category==='all'||a.category===category)&&
   (!query||(a.name+' '+a.path).toLowerCase().includes(query)))
   .sort((a,b)=>a.category.localeCompare(b.category)||a.name.localeCompare(b.name,undefined,{numeric:true}));
  cursor=Math.max(0,visible.findIndex(a=>a.path===prior));
  if(cursor>=visible.length)cursor=0;
  refresh();
 }
 function setRange(prefix,field,v){
  const n=$(prefix+field),value=$(prefix+field+'Value');
  if(!n)return;
  n.value=String(v);
  value.textContent=field==='strength'?Math.round(v*100)+' %':Number(v).toFixed(field==='angle'?0:2)+(field==='angle'?'°':'');
 }
 function allControls(){
  for(const field of inputs.global)setRange('ssGlobal_',field,Engine.get().global[field]);
 }
 function preview(){
  const a=asset();ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#29443d';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#344f46';ctx.fillRect(0,canvas.height*.70,canvas.width,canvas.height*.30);
  ctx.strokeStyle='#76948a';ctx.lineWidth=1;ctx.beginPath();
  ctx.moveTo(0,canvas.height*.70);ctx.lineTo(canvas.width,canvas.height*.70);ctx.stroke();
  if(!a){ctx.fillStyle='#d4e9d3';ctx.font='15px sans-serif';ctx.fillText('Keine passende Sprite-Datei geladen.',16,35);return;}
  const meta=window.VedrasNature?.entryFor(a)||null,kind=meta?.kind||a.category,
   w=kind==='mountain'?150:Math.min(135,kind==='tree'?105:110),
   p={x:canvas.width*.57,y:canvas.height*.70},anchor=meta?.anchor||
    (a.category==='buildings'?{x:.5,y:.9}:{x:.5,y:.96});
  // In the preview use the same visible alpha crop and shadow engine
  // as the map, with the original transparent PNG placed on top.
  const img=a.img,sw=img.naturalWidth,sh=img.naturalHeight,aspect=sh/sw;
  const silhouette=document.createElement('canvas');
  silhouette.width=Math.min(512,sw);silhouette.height=Math.max(8,Math.round(silhouette.width*aspect));
  const g=silhouette.getContext('2d');g.drawImage(img,0,0,silhouette.width,silhouette.height);
  g.globalCompositeOperation='source-in';g.fillStyle='#203131';g.fillRect(0,0,silhouette.width,silhouette.height);
  const shape={canvas:silhouette,aspect};
  if(kind==='mountain'){
   const sh=window.VedrasShadows,pf=Engine.profile(a);
   const mountainCfg=sh.settings({angle:pf.angle,opacity:pf.opacity,
    length:pf.length,softness:pf.softness,originX:pf.offsetX,originY:pf.offsetY,
    rootWidth:pf.width*.43,midWidth:pf.width*.34,tipWidth:pf.width*.18,
    contactWidth:pf.contact*.72});
   sh.paintMountain(ctx,{x:p.x-w*.14,y:p.y+w*.02},w,mountainCfg,Engine.get().global.strength);
  }else Engine.draw(ctx,{asset:a,natureMeta:meta},p,w,shape,anchor,Engine.get().global.strength);
  ctx.save();
  ctx.drawImage(img,p.x-w*anchor.x,p.y-w*aspect*anchor.y,w,w*aspect);
  ctx.restore();
  ctx.strokeStyle='#f2ce76';ctx.lineWidth=1.5;ctx.beginPath();
  ctx.moveTo(p.x-8,p.y);ctx.lineTo(p.x+8,p.y);
  ctx.moveTo(p.x,p.y-8);ctx.lineTo(p.x,p.y+8);ctx.stroke();
 }
 function refresh(){
  const a=asset();
  $('ssCurrent').textContent=a?labelFor(a)+' · '+a.name:'Keine Sprite-Datei';
  $('ssIndex').textContent=visible.length?(cursor+1)+' / '+visible.length:'0 / 0';
  $('ssPrevious').disabled=cursor===0;
  $('ssNext').disabled=cursor>=visible.length-1;
  $('ssOverride').textContent=a&&Engine.get().profiles[a.path]?'Individuell angepasst':'Gemeinsamer Standard';
  const p=a?Engine.profile(a):Engine.get().global;
  for(const k of inputs.sprite)setRange('ssSprite_',k,p[k]);
  $('ssEnabled').checked=a?Engine.get().profiles[a.path]?.enabled!==false:true;
  preview();
 }
 function modified(){
  dirty=true;seq++;text('Ungespeicherte Schattenänderungen – mit „Profile speichern“ sichern.');
  core.requestDraw();
 }
 function updateGlobal(field,v){
  const prev=Engine.get(),next={...prev,global:{...prev.global,[field]:v}};
  Engine.set(next);setRange('ssGlobal_',field,v);
  if(field==='strength'){
   core.state.shadowGlobal=v;
   for(const [slider,out] of [['shadowGeneralStrength','shadowGeneralText'],
    ['shadowGlobalStrength','shadowGlobalText']]){
    if($(slider))$(slider).value=String(Math.round(100*v));
    if($(out))$(out).textContent=Math.round(v*100)+' %';
   }
   core.persistScene();
  }
  refresh();modified();
 }
 function updateSprite(field,v){
  const a=asset();if(!a)return;
  const data=Engine.get(),next={...data,profiles:{...data.profiles,
   [a.path]:{...(data.profiles[a.path]||{}),[field]:v}}};
  Engine.set(next);refresh();modified();
 }
 async function save(){
  if(saveInProgress)return;
  saveInProgress=true;
  const snapshot=Engine.get(),version=seq;
  $('ssSave').disabled=true;
  try{
   const response=await fetch('/api/sprite-shadows',{method:'POST',
    headers:{'Content-Type':'application/json'},body:JSON.stringify(snapshot)});
   if(!response.ok)throw Error((await response.text()).slice(0,240));
   editable=true;
   if(version===seq){dirty=false;text('Gespeichert: alle Schattenprofile im Asset-Labor-Ordner.');}
   else text('Zwischenzeitlich geändert – bitte erneut speichern.');
  }catch(e){text('Speichern fehlgeschlagen: '+e.message+' · JSON-Export als Sicherung verwenden.');}
  finally{saveInProgress=false;$('ssSave').disabled=false;}
 }
 function download(){
  const data=JSON.stringify(Engine.get(),null,2);
  const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
  const a=document.createElement('a');a.download='sprite_shadow_profiles.json';a.href=url;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1200);
 }
 async function load(){
  try{
   const res=await fetch('/api/sprite-shadows',{cache:'no-store'});
   if(!res.ok)throw Error('Lokaler Schatten-Profilserver nicht erreichbar');
   Engine.set(await res.json());loaded=true;editable=true;
   core.state.shadowGlobal=Engine.get().global.strength;core.persistScene();
   allControls();refresh();core.requestDraw();
   text('Schattenprofile geladen. Pro Sprite justieren und anschließend speichern.');
  }catch(e){loaded=true;allControls();refresh();
   text('Nur Vorschau/JSON-Export: '+e.message);}
 }
 for(const field of inputs.global)$('ssGlobal_'+field).addEventListener('input',e=>
  updateGlobal(field,Number(e.target.value)));
 for(const field of inputs.sprite)$('ssSprite_'+field).addEventListener('input',e=>
  updateSprite(field,Number(e.target.value)));
 $('ssEnabled').addEventListener('change',e=>{
  const a=asset();if(!a)return;const d=Engine.get();
  Engine.set({...d,profiles:{...d.profiles,[a.path]:{...(d.profiles[a.path]||{}),
   enabled:e.target.checked}}});modified();preview();
 });
 $('ssResetOne').addEventListener('click',()=>{
  const a=asset();if(!a)return;
  const d=Engine.get(),profiles={...d.profiles};delete profiles[a.path];
  Engine.set({...d,profiles});refresh();modified();
 });
 $('ssResetAll').addEventListener('click',()=>{
  if(!confirm('Alle individuell gespeicherten Schattenkorrekturen entfernen und gemeinsame Standardwerte verwenden? Die PNGs bleiben unverändert. Zuvor JSON exportieren, falls die Profile erhalten bleiben sollen.'))return;
  const d=Engine.get();Engine.set({...d,profiles:{}});refresh();modified();
 });
 $('ssSave').addEventListener('click',save);
 $('ssExport').addEventListener('click',download);
 $('ssImport').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{
   if(file.size>2000000)throw Error('Die Profildatei ist zu groß.');
   const incoming=Engine.valid(JSON.parse(await file.text()));
   if(!confirm('Gespeicherte Schattenprofile durch die importierten Werte ersetzen?'))return;
   Engine.set(incoming);allControls();refresh();modified();
  }catch(e){text('Import abgelehnt: '+e.message);}
  finally{event.target.value='';}
 });
 $('ssPrevious').addEventListener('click',()=>{cursor=Math.max(0,cursor-1);refresh()});
 $('ssNext').addEventListener('click',()=>{cursor=Math.min(visible.length-1,cursor+1);refresh()});
 $('ssSearch').addEventListener('input',list);$('ssCategory').addEventListener('change',list);
 window.addEventListener('vedras:assets-loaded',list);
 window.addEventListener('vedras:shadow-changed',()=>{if(!dirty){allControls();refresh();}});
 // Keep the existing scene-wide 0–200% slider and the dedicated editor in sync.
 for(const id of ['shadowGlobalStrength','shadowGeneralStrength'])$(id)?.addEventListener('input',()=>{
  const value=Number($(id).value)/100;
  if(Math.abs(Engine.get().global.strength-value)>.0001)updateGlobal('strength',value);
 });
 allControls();list();load();
});

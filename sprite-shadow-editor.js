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
    if(k==='manual'&&!allowStrength){window.VedrasManualShadows.valid(v);continue;}
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
 function set(data){current=valid(data);clearRasterCache();return current;}
 function get(){return current;}
 function profile(asset){
  const path=typeof asset==='string'?asset:asset?.path||'';
  return {...current.global,...(current.profiles[path]||{})};
 }
 function draw(ctx,obj,p,width,silhouette,anchor={x:.5,y:.96},strength=null){
  // Mountains own their native large 2.5D ground projection. No generic
  // silhouette/contact cast may supplement it, even in old legacy placements.
  if(obj?.type==='mountain'||obj?.natureMeta?.kind==='mountain')return;
  if(!silhouette?.canvas||!(width>0))return;
  const x=profile(obj.asset),family=obj.natureMeta?.family,
    log=family==='fallen_logs'||family==='snow_fallen_logs',
    small=obj.natureMeta?.kind==='ground_cover';
  if(x.enabled===false||x.opacity<=0)return;
  const globalStrength=strength===null?current.global.strength:strength;
  const alpha=clamp(globalStrength*x.opacity*(small?.28:1)*(family==='snow_fallen_logs'?.8:1),0,.95);
  if(alpha<=0)return;
  if(x.manual?.polygons?.length){
   window.VedrasManualShadows.render(ctx,x.manual,p,width,alpha,Math.min(30,x.softness));
   return; // manual footprints supersede generic contact/silhouette
  }
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

 // Sprite casts do not change when the camera pans. Rasterize their costly
 // filter/blur/transforms once per image, quantized size and shadow profile.
 // The editor still calls draw() directly; final PNG exports also use draw().
 const rasterCache=new Map();
 const rasterPinned=new Set();
 const rasterIds=new WeakMap();
 let rasterNextId=0,rasterBytes=0;
 const rasterBudget=18*1024*1024,rasterLimit=144;
 const rasterStats={hits:0,misses:0,evicted:0,fallback:0,paintMs:0,
  frameHits:0,frameMisses:0,frameFallback:0};
 function beginFrame(){rasterPinned.clear();rasterStats.frameHits=0;rasterStats.frameMisses=0;rasterStats.frameFallback=0;}
 function clearRasterCache(){rasterCache.clear();rasterPinned.clear();rasterBytes=0;}
 function cacheStats(){return {...rasterStats,entries:rasterCache.size,bytes:rasterBytes};}
 function imageId(silhouette){
  let id=rasterIds.get(silhouette.canvas);
  if(!id){id=++rasterNextId;rasterIds.set(silhouette.canvas,id);}
  return id;
 }
 function shadowBounds(width,shape,anchor,aspect,log){
  const height=width*aspect,ax=clamp(Number(anchor.x??.5),0,1),
   ay=clamp(Number(anchor.y??.96),0,1),rad=shape.angle*Math.PI/180,
   castX=width*shape.length*Math.cos(rad),
   castY=width*shape.length*Math.sin(rad)*(log?.14:.30),
   ox=width*shape.offsetX,oy=width*shape.offsetY,
   horiz=clamp(shape.width,.2,1.8),slant=log?.01:.035;
  if(!(height>0))return null;
  const xs=[-width*ax,width*(1-ax)],ys=[-height*ay,0];
  let minX=0,maxX=0,minY=0,maxY=0;
  for(const x of xs)for(const y of ys){
   const px=ox+horiz*x-castX*y/height,
    py=oy+slant*x-castY*y/height;
   minX=Math.min(minX,px);maxX=Math.max(maxX,px);
   minY=Math.min(minY,py);maxY=Math.max(maxY,py);
  }
  if(shape.contact>0){
   const centerX=ox+castX*(log?.40:.22),
    centerY=oy+castY*(log?.36:.20),
    rx=width*(log?.53:.24)*Math.max(.25,shape.width)*(1+shape.contact),
    ry=width*(log?.075:.085)*(shape.contact+.25),
    radius=Math.max(rx,ry);
   minX=Math.min(minX,centerX-radius);maxX=Math.max(maxX,centerX+radius);
   minY=Math.min(minY,centerY-radius);maxY=Math.max(maxY,centerY+radius);
  }
  const pad=Math.ceil(3*Math.min(30,Math.max(0,shape.softness))+5);
  const left=Math.floor(minX)-pad,top=Math.floor(minY)-pad;
  const right=Math.ceil(maxX)+pad,bottom=Math.ceil(maxY)+pad;
  return {left,top,width:right-left,height:bottom-top};
 }
 function drawCached(ctx,obj,p,width,silhouette,anchor={x:.5,y:.96},strength=null){
  const kind=obj?.natureMeta?.kind;
  if(obj?.type==='mountain'||kind==='mountain')return;
  if(!silhouette?.canvas||!(width>0))return;
  const x=profile(obj.asset),family=obj.natureMeta?.family,
   log=family==='fallen_logs'||family==='snow_fallen_logs';
  const globalStrength=strength===null?current.global.strength:strength;
  const alpha=globalStrength*x.opacity*(kind==='ground_cover'?.28:1)*
   (family==='snow_fallen_logs'?.8:1);
  if(x.enabled===false||!(alpha>0))return;
  // Hand-painted masks, very small objects, and unsupported canvases keep
  // the original exact renderer. No cached stamp can override manual art.
  if(x.manual?.polygons?.length||width<8||typeof document==='undefined'){
   rasterStats.fallback++;rasterStats.frameFallback++;
   return draw(ctx,obj,p,width,silhouette,anchor,strength);
  }
  const step=width>256?8:4;
  const nominal=Math.max(8,Math.round(width/step)*step);
  const ratio=width/nominal;
  // A style's mutating edits cannot reuse a previous silhouette's image;
  // Engine.set() also flushes all cached bitmaps immediately.
  const id=JSON.stringify([imageId(silhouette),obj.asset?.path,
   nominal,anchor.x??.5,anchor.y??.96,globalStrength,
   family||'',kind||'',x.angle,x.opacity,x.length,x.width,x.softness,
   x.offsetX,x.offsetY,x.contact]);
  let raster=rasterCache.get(id);
  if(raster){
   rasterCache.delete(id);rasterCache.set(id,raster);
   rasterPinned.add(id);
   rasterStats.hits++;rasterStats.frameHits++;
  }else{
   // Cache hits avoid *all* bounds computations and offscreen allocations.
   const bounds=shadowBounds(nominal,x,anchor,silhouette.aspect,log);
   if(!bounds||bounds.width<1||bounds.height<1||
    bounds.width>1300||bounds.height>1300||
    bounds.width*bounds.height>750000){
    rasterStats.fallback++;rasterStats.frameFallback++;
    return draw(ctx,obj,p,width,silhouette,anchor,strength);
   }
   // Keep all previously used bitmaps resident throughout this frame.
   // When a dense scene exceeds the budget, use the original renderer for
   // extra casts rather than thrashing the LRU every frame.
   const bytes=bounds.width*bounds.height*4;
   while(rasterCache.size>=rasterLimit||rasterBytes+bytes>rasterBudget){
    const old=[...rasterCache.keys()].find(k=>!rasterPinned.has(k));
    if(old===undefined){
     rasterStats.fallback++;rasterStats.frameFallback++;
     return draw(ctx,obj,p,width,silhouette,anchor,strength);
    }
    const entry=rasterCache.get(old);
    rasterCache.delete(old);rasterBytes-=entry.bytes;rasterStats.evicted++;
   }
   const start=typeof performance!=='undefined'?performance.now():Date.now();
   const canvas=document.createElement('canvas');
   canvas.width=bounds.width;canvas.height=bounds.height;
   const g=canvas.getContext('2d',{alpha:true});
   if(!g){
    rasterStats.fallback++;rasterStats.frameFallback++;
    return draw(ctx,obj,p,width,silhouette,anchor,strength);
   }
   g.translate(-bounds.left,-bounds.top);
   draw(g,obj,{x:0,y:0},nominal,silhouette,anchor,strength);
   raster={canvas,...bounds,bytes:canvas.width*canvas.height*4};
   rasterCache.set(id,raster);rasterPinned.add(id);rasterBytes+=raster.bytes;
   rasterStats.misses++;rasterStats.frameMisses++;
   rasterStats.paintMs+=(typeof performance!=='undefined'?performance.now():Date.now())-start;
  }
  ctx.save();ctx.globalCompositeOperation='source-over';ctx.filter='none';
  ctx.drawImage(raster.canvas,p.x+raster.left*ratio,p.y+raster.top*ratio,
   raster.width*ratio,raster.height*ratio);
  ctx.restore();
 }
 const api={fields,shapeKeys,defaults,valid,set,get,profile,draw,drawCached,beginFrame,cacheStats};
 return api;
})();
window.addEventListener('DOMContentLoaded',()=>{
 const $=id=>document.getElementById(id),Engine=window.VedrasSpriteShadows,
  core=window.VedrasAssetLabor,panel=$('spriteShadowLab');
 if(!core||!panel)return;
 let cursor=0,visible=[],dirty=false,saveInProgress=false,seq=0;
 let loaded=false,editable=false;
 let drawingFrame=null;
 const canvas=$('ssPreview'),ctx=canvas.getContext('2d');
 const inputs={
  global:Engine.shapeKeys.concat('strength'),
  sprite:Engine.shapeKeys
 };
 const text=s=>{$('ssStatus').textContent=s;};
 const asset=()=>visible[cursor]||null;
 const isMountainAsset=a=>a?.category==='nature'&&
  (window.VedrasNature?.entryFor(a)?.kind==='mountain'||
   core.state.mountainInstances?.some(m=>m.assetPath===a.path));
 const labelFor=a=>a?.category==='nature'?'Natur':a?.category==='buildings'?'Gebäude':'Einheiten';
 const numeric=(id)=>Number($(id).value);
 function list(){
  const query=$('ssSearch').value.toLowerCase().trim(),category=$('ssCategory').value,
   old=asset()?.path;
  const matching=core.assets().filter(a=>
   (category==='all'||a.category===category)&&
   (!query||(a.name+' '+a.path).toLowerCase().includes(query)));
  visible=window.VedrasManualShadows.sort(matching,Engine.get().profiles,
   $('ssSort').value,$('ssUnprofiled').checked);
  const index=visible.findIndex(a=>a.path===old);
  cursor=index>=0?index:0;refresh();
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
  const a=asset();drawingFrame=null;ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#29443d';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#344f46';ctx.fillRect(0,canvas.height*.70,canvas.width,canvas.height*.30);
  ctx.strokeStyle='#76948a';ctx.lineWidth=1;ctx.beginPath();
  ctx.moveTo(0,canvas.height*.70);ctx.lineTo(canvas.width,canvas.height*.70);ctx.stroke();
  if(!a){ctx.fillStyle='#d4e9d3';ctx.font='15px sans-serif';ctx.fillText('Keine passende Sprite-Datei geladen.',16,35);return;}
  if(!a.img?.naturalWidth){
   ctx.fillStyle='#d4e9d3';ctx.font='14px sans-serif';
   ctx.fillText('Grafik wird bei Bedarf geladen…',16,35);
   core.ensureAsset?.(a).then(()=>{
    if(asset()?.path===a.path&&a.img?.naturalWidth)refresh();
   });
   return;
  }
  const meta=window.VedrasNature?.entryFor(a)||null,kind=meta?.kind||a.category,
   anchor=meta?.anchor||(a.category==='buildings'?{x:.5,y:.9}:{x:.5,y:.96});
  // Use the game's visible alpha crop and scale the preview to fit tall
  // trees/buildings/mountains without cutting off their crowns or peaks.
  const img=a.img,b=core.shadowSprites?.bounds(img)||{
   sx:0,sy:0,sw:img.naturalWidth,sh:img.naturalHeight},
   aspect=b.sh/b.sw,
   p={x:canvas.width*.57,y:canvas.height*.70},
   maxWidth=kind==='mountain'?165:145,
   w=Math.max(30,Math.min(maxWidth,(p.y-16)/Math.max(.25,aspect*anchor.y)));
  drawingFrame={p,w};
  let shape=core.shadowSprites?.silhouette(img);
  if(!shape){
   const cv=document.createElement('canvas');cv.width=256;
   cv.height=Math.max(8,Math.round(cv.width*aspect));
   const g=cv.getContext('2d');g.drawImage(img,b.sx,b.sy,b.sw,b.sh,0,0,cv.width,cv.height);
   g.globalCompositeOperation='source-in';g.fillStyle='#203131';g.fillRect(0,0,cv.width,cv.height);
   shape={canvas:cv,aspect};
  }
  if(isMountainAsset(a)){
   // Preview uses the mountain section (default -> asset -> instance).
   const sh=window.VedrasShadows;
   const mountainCfg=core.shadowSprites?.mountainSettingsForAsset?.(a)||
    sh.settings(core.state.mountainShadowDefaults||{});
   sh.paintMountain(ctx,{x:p.x-w*.14,y:p.y+w*.02},w,
    mountainCfg,core.state.shadowGlobal);
  }else Engine.draw(ctx,{asset:a,natureMeta:meta},p,w,shape,anchor,Engine.get().global.strength);
  ctx.save();
  ctx.translate(p.x,p.y);
  ctx.transform(1,0,.012,.965,0,0);
  ctx.translate(-p.x,-p.y);
  ctx.drawImage(img,b.sx,b.sy,b.sw,b.sh,
   p.x-w*anchor.x,p.y-w*aspect*anchor.y,w,w*aspect);
  ctx.restore();
  ctx.strokeStyle='#f2ce76';ctx.lineWidth=1.5;ctx.beginPath();
  ctx.moveTo(p.x-8,p.y);ctx.lineTo(p.x+8,p.y);
  ctx.moveTo(p.x,p.y-8);ctx.lineTo(p.x,p.y+8);ctx.stroke();
  window.VedrasShadowPainter?.overlay(ctx,drawingFrame,a);
 }
 function refresh(){
  const a=asset();
  $('ssCurrent').textContent=a?labelFor(a)+' · '+a.name:'Keine Sprite-Datei';
  $('ssIndex').textContent=visible.length?(cursor+1)+' / '+visible.length:'0 / 0';
  $('ssPrevious').disabled=cursor===0;
  $('ssNext').disabled=cursor>=visible.length-1;
  const mountain=isMountainAsset(a);
  $('ssDrawTools').hidden=mountain||!a;
  const date=window.VedrasManualShadows.time(a);
  $('ssFileDate').textContent=a?(date?
   ((a.createdNs?'Erstellt: ':'Geändert: ')+new Date(date).toLocaleString('de-DE')+' · '+a.path):
   ('Kein Zeitstempel verfügbar · '+a.path)):'Keine Sprite-Datei';
  $('ssOverride').textContent=mountain?'Bergsektion hat Vorrang':
   a&&Engine.get().profiles[a.path]?'Individuell angepasst':'Gemeinsamer Standard';
  $('ssMountainNotice').hidden=!mountain;
  $('ssSpriteDetails').hidden=mountain;
  const p=a?Engine.profile(a):Engine.get().global;
  for(const k of inputs.sprite)setRange('ssSprite_',k,p[k]);
  $('ssEnabled').checked=a?Engine.get().profiles[a.path]?.enabled!==false:true;
  preview();
 }
 function modified(){
  dirty=true;seq++;text('Ungespeicherte Schattenänderungen – mit „Profile speichern“ sichern.');
  core.requestDraw();
 }
 function syncSceneStrength(){
  const v=Engine.get().global.strength,percent=Math.round(100*v);
  core.state.shadowGlobal=v;
  for(const [slider,out] of [['shadowGeneralStrength','shadowGeneralText'],
    ['shadowGlobalStrength','shadowGlobalText']]){
   if($(slider))$(slider).value=String(percent);
   if($(out))$(out).textContent=percent+' %';
  }
  core.persistScene();
 }
 function updateGlobal(field,v){
  const prev=Engine.get(),next={...prev,global:{...prev.global,[field]:v}};
  Engine.set(next);setRange('ssGlobal_',field,v);
  if(field==='strength')syncSceneStrength();
  refresh();modified();
 }
 function updateSprite(field,v){
  const a=asset();if(!a||isMountainAsset(a))return;
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
   const incoming=await res.json();if(dirty)return;
   Engine.set(incoming);loaded=true;editable=true;
   syncSceneStrength();
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
  const a=asset();if(!a||isMountainAsset(a))return;const d=Engine.get();
  Engine.set({...d,profiles:{...d.profiles,[a.path]:{...(d.profiles[a.path]||{}),
   enabled:e.target.checked}}});refresh();modified();
 });
 $('ssResetOne').addEventListener('click',()=>{
  const a=asset();if(!a||isMountainAsset(a))return;
  const d=Engine.get(),profiles={...d.profiles};delete profiles[a.path];
  Engine.set({...d,profiles});refresh();modified();
 });
 $('ssResetAll').addEventListener('click',()=>{
  if(!confirm('Alle individuell gespeicherten Schattenkorrekturen entfernen und gemeinsame Standardwerte verwenden? Die PNGs bleiben unverändert. Zuvor JSON exportieren, falls die Profile erhalten bleiben sollen.'))return;
  const d=Engine.get();Engine.set({...d,profiles:{}});refresh();modified();
 });
 $('ssRestoreGlobal').addEventListener('click',()=>{
  if(!confirm('Die gemeinsamen Schattenwerte auf den Ausgangszustand zurücksetzen? Individuelle Sprite-Profile bleiben erhalten.'))return;
  const data=Engine.get();
  Engine.set({...data,global:Engine.defaults().global});
  syncSceneStrength();allControls();refresh();modified();
 });
 $('ssBackup').addEventListener('click',async()=>{
  try{
   const response=await fetch('/api/sprite-shadows-backup',{cache:'no-store'});
   if(!response.ok)throw Error('Keine Schattenprofil-Sicherung vorhanden.');
   const backup=Engine.valid(await response.json());
   if(!confirm('Die letzte gespeicherte Schatten-Sicherung laden? Danach „Profile speichern“ klicken.'))return;
   Engine.set(backup);syncSceneStrength();allControls();refresh();modified();
   text('Backup geladen. Noch nicht gespeichert.');
  }catch(e){text('Backup konnte nicht geladen werden: '+e.message);}
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
 $('ssSort').addEventListener('change',list);
 $('ssUnprofiled').addEventListener('change',list);
 $('ssPrevious').addEventListener('click',()=>{cursor=Math.max(0,cursor-1);refresh()});
 $('ssNext').addEventListener('click',()=>{cursor=Math.min(visible.length-1,cursor+1);refresh()});
 $('ssOpenMountain').addEventListener('click',()=>{
  // The right-hand mountain section sits inside a collapsed native drawer.
  // Use its existing shortcut so the drawer opens before scrolling.
  if($('shortcutMountain'))$('shortcutMountain').click();
  else{
   const drawer=$('drawer_mountainTools');
   if(drawer)drawer.open=true;
   (drawer||$('mountainTools'))?.scrollIntoView({behavior:'smooth',block:'start'});
  }
 });
 $('ssSearch').addEventListener('input',list);$('ssCategory').addEventListener('change',list);
 window.addEventListener('beforeunload',e=>{
  if(!dirty)return;
  e.preventDefault();e.returnValue='';
 });
 window.addEventListener('vedras:assets-loaded',list);
 window.addEventListener('vedras:shadow-changed',()=>{if(!dirty){allControls();refresh();}});
 window.addEventListener('vedras:hex-selected',()=>{
  if(isMountainAsset(asset()))preview();
 });
 for(const id of ['mountainCastOpacity','mountainCastSoft','mountainOriginX',
  'mountainOriginY','mountainAngle','mountainLength','mountainRootWidth',
  'mountainMidWidth','mountainTipWidth','mountainContactWidth',
  'mountainContactLength'])$(id)?.addEventListener('input',()=>{
   if(isMountainAsset(asset()))preview();
  });
 // Keep the existing scene-wide 0–200% slider and the dedicated editor in sync.
 for(const id of ['shadowGlobalStrength','shadowGeneralStrength'])$(id)?.addEventListener('input',()=>{
  const value=Number($(id).value)/100;
  if(Math.abs(Engine.get().global.strength-value)>.0001)updateGlobal('strength',value);
 });
 window.__vedrasShadowEditor={asset,refresh,preview,list,modified,Engine,
  frame:()=>drawingFrame,isMountainAsset};
 allControls();list();load();
});

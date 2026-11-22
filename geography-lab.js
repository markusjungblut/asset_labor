/* Parameter-driven geography workbench for the Asset-Labor. */
(()=>{
"use strict";
const G=window.VedrasGeography,MIX=window.VedrasGeographyLabMix,
 IO=window.VedrasGeographyIO,BAKE=window.VedrasLargeMapBakePlan,
 MATERIAL=window.VedrasLargeMapMaterialPreview,
 $=id=>document.getElementById(id);
let config=MIX.configFor(G),world=null,selected=null,buildTimer=null;
let handoffRequest=null,handoffSequence=0;
const DISTRIBUTION_STORAGE_KEY="vedras-geography-distribution-v2.1.2";
let distribution=null,distributionKey=null,distributionRun=0,distributionRunning=false;
const BIOME_NAMES={cold:"Kalte Regionen",grassland:"Grasland",savanna:"Savanne",
 arid:"Trockengebiete",wetland:"Feuchtgebiete",jungle:"Dschungel"};
const TERRAIN_NAMES={
 ocean:"Ozean",coastal_water:"Küstenwasser",icy_ocean:"Eisiger Ozean",
 stormy_ocean:"Stürmischer Ozean",frozen_tundra:"Gefrorene Tundra",
 tundra:"Tundra",snowfields:"Schneefelder",highland:"Hochland",
 grassland:"Grasland",pasture:"Weideland",sparse_pasture:"Karges Weideland",
 savanna:"Savanne",jungle:"Dschungel",moor:"Moor",marshland:"Marschland",
 swamp:"Sumpf",rocky_badlands:"Steinige Badlands",badlands:"Badlands",
 rocky_desert:"Steinwüste",sandy_rocky_desert:"Sandig-steinige Wüste",
 sandy_desert:"Sandwüste",desert:"Wüstenboden",clay_desert:"Lehmwüste",
 sandy_badlands:"Sandige Badlands",wasteland:"Ödland",semi_desert:"Halbwüste"
};
const COLORS={ocean:"#1d537b",coastal_water:"#478cac",icy_ocean:"#95cad8",
 stormy_ocean:"#253f71",frozen_tundra:"#bec6ca",tundra:"#849d8f",
 snowfields:"#f0f2eb",grassland:"#80b570",pasture:"#91bc76",sparse_pasture:"#a1ad75",
 savanna:"#a6af59",jungle:"#318962",moor:"#568673",marshland:"#538a77",
 swamp:"#3c7960",rocky_desert:"#a79569",sandy_rocky_desert:"#c4aa6b",
 sandy_desert:"#e3c27c",
 desert:"#d5bb77",clay_desert:"#bb9266",badlands:"#ad7950",sandy_badlands:"#cd9b65",
 rocky_badlands:"#988066",wasteland:"#807768",semi_desert:"#c2b37c",highland:"#82968a"};
function buildControls(){
 const groups=new Map();
 for(const def of G.parameterSchema()){
  if(!groups.has(def.group))groups.set(def.group,[]);
  groups.get(def.group).push(def);
 }
 $('parameters').replaceChildren();
 for(const [group,defs] of groups){
  const section=document.createElement('details');section.open=group==="Welt / Wasser"||group==="Klima";
  const heading=document.createElement('summary');heading.textContent=group;section.append(heading);
  for(const def of defs){
   const field=document.createElement('div');field.className='field';
   const label=document.createElement('label');label.htmlFor="cfg-"+def.id;label.textContent=def.label;
   const pair=document.createElement('div');pair.className='pair';
   const range=document.createElement('input');range.type='range';range.id="cfg-"+def.id;
   range.min=def.min;range.max=def.max;range.step=def.step;range.value=config[def.id];
   const number=document.createElement('input');number.type='number';number.min=def.min;
   number.max=def.max;number.step=def.step;number.value=config[def.id];
   function adjust(raw){const n=Number(raw);
    if(!Number.isFinite(n)||n<def.min||n>def.max){number.setCustomValidity("Außerhalb des Bereichs");return;}
    number.setCustomValidity("");config[def.id]=n;range.value=String(n);number.value=String(n);requestBuild();
   }
   range.addEventListener('input',()=>adjust(range.value));
   number.addEventListener('change',()=>adjust(number.value));
   const help=document.createElement('div');help.className='help';help.textContent=def.help;
   pair.append(range,number);field.append(label,pair,help);section.append(field);
  }
  $('parameters').append(section);
 }
}
function cancelBuild(){
 if(buildTimer!==null){window.clearTimeout(buildTimer);buildTimer=null;}
}
function requestBuild(){
 cancelBuild();
 buildTimer=window.setTimeout(()=>{buildTimer=null;build();},320);
}
function showWorld(next,message){
 world=next;
 $('largeBakeReport').textContent=
  'Noch kein Renderplan für diese Welt erstellt. Keine PNGs erzeugt.';
 $('materialPreviewReport').textContent=
  'Neue Welt: noch kein echtes Terrainmaterial-PNG erstellt.';
 $('materialCatalogReport').textContent=
  'Material-Vollständigkeit dieser Welt noch nicht geprüft.';
 $('downloadWorld').disabled=false;$('sendToLab').disabled=false;
 $('message').textContent=message;
 const signature=IO.signature(world,G);
  if(distributionKey!==signature){
   ++distributionRun;
   distributionRunning=false;
   $('analyzeDistribution').disabled=false;
   distributionKey=signature;distribution=null;
   try{
    const cached=JSON.parse(localStorage.getItem(DISTRIBUTION_STORAGE_KEY));
    if(cached?.signature===signature&&cached?.data?.generatorVersion===G.VERSION)
     distribution=cached.data;
   }catch(_error){/* Browsers may disable local storage. */}
  }
  selected=null;draw();updateStats();
}
function build(){
 cancelBuild();
 try{
  const width=Number($('worldWidth').value),height=Number($('worldHeight').value);
  $('message').textContent="Welt wird berechnet …";
  const start=performance.now();
  const next=G.generateWorld($('worldSeed').value,{width,height,config,
   originQ:Number($('worldOriginQ').value),originR:Number($('worldOriginR').value)});
  showWorld(next,"Berechnet in "+Math.round(performance.now()-start)+
   " ms · "+next.version+" · Seed "+next.seed);
  return true;
 }catch(error){
  // Never let a stale earlier atlas be downloaded under new, invalid input.
  world=null;distribution=null;$('downloadWorld').disabled=true;
  $('sendToLab').disabled=true;$('exportDistribution').disabled=true;
  $('largeBakeReport').textContent='Kein Renderplan: Weltberechnung fehlgeschlagen.';
  $('materialPreviewReport').textContent='Kein PNG: Weltberechnung fehlgeschlagen.';
  $('materialCatalogReport').textContent='Material-Check nicht möglich: Weltberechnung fehlgeschlagen.';
  $('message').textContent="Weltberechnung fehlgeschlagen: "+error.message;
  return false;
 }
}
function currentWorld(){
 return buildTimer!==null?build():!!world;
}
function applyImportedWorld(next,label){
 // An earlier delayed slider callback cannot overwrite an imported world.
 cancelBuild();config={...next.config};
 $('worldSeed').value=next.seed;$('worldWidth').value=next.width;
 $('worldHeight').value=next.height;
 $('worldOriginQ').value=next.originQ;$('worldOriginR').value=next.originR;
 buildControls();showWorld(next,label+' · '+next.version+' · Seed '+next.seed);
}
const colorFor=(cell,mode)=>{
 if(mode==="water")return cell.surfaceClass==="land"?"#829e71":COLORS[cell.surfaceClass];
 if(mode==="relief")return cell.surfaceClass!=="land"?COLORS[cell.surfaceClass]:
  cell.reliefClass==="mountain"?"#aeb9b7":cell.reliefClass==="hills"?"#bba278":"#6b9a70";
 if(mode==="temperature"){const n=cell.temperature;return 'hsl('+(220-n*212)+',64%,48%)';}
 if(mode==="humidity"){const n=cell.humidity;return 'hsl('+(39+n*181)+',55%,45%)';}
 if(mode==="forest")return cell.surfaceClass!=="land"?COLORS[cell.surfaceClass]:
  cell.forestClass==="dense_forest"?"#145b32":cell.forestClass==="light_forest"?"#4b9965":"#9ca98a";
 if(mode==="features")return cell.features.length?"#f4bb51":cell.surfaceClass==="land"?"#5e8269":COLORS[cell.surfaceClass];
 if(mode==="biomes"){
  const families={cold:"#c1d4cf",grassland:"#79b46c",savanna:"#d9bd65",
   arid:"#cb9363",wetland:"#4c9487",jungle:"#287c49"};
  return cell.surfaceClass!=="land"?COLORS[cell.surfaceClass]:families[cell.baseBiome]||"#888";
 }
 return COLORS[cell.terrainId]||"#99847b";
};
let geometry=null;
function draw(){
 if(!world)return;
 const canvas=$('worldMap'),ctx=canvas.getContext('2d');
 const W=canvas.width,H=canvas.height;
 ctx.fillStyle='#0d1720';ctx.fillRect(0,0,W,H);
 const rad=Math.min((W-32)/(Math.sqrt(3)*(world.width+world.height/2+1)),
   (H-34)/(1.5*(world.height+1)));
 const x0=16+Math.sqrt(3)*rad,y0=15+rad;
 geometry={rad,x0,y0};
 const mode=$('viewMode').value;
 function point(q,r){const u=q-(world.originQ||0),v=r-(world.originR||0);
  return [x0+Math.sqrt(3)*rad*(u+v/2),y0+1.5*rad*v];}
 
 // Hex-edge geometry: routes contain axial neighbors, but visible rivers
 // follow the SIDES and shared CORNERS of the hexes, as in river.js.
 const vertex=(p,i)=>{
  const [x,y]=point(p.q,p.r),a=-Math.PI/6+i*Math.PI/3;
  return [x+rad*Math.cos(a),y+rad*Math.sin(a)];
 };
 const near=(a,b)=>Math.abs(a[0]-b[0])<.001&&Math.abs(a[1]-b[1])<.001;
 function corners(a,b){
  const other=Array.from({length:6},(_,i)=>vertex(b,i));
  return Array.from({length:6},(_,i)=>({i,p:vertex(a,i)}))
   .filter(x=>other.some(y=>near(x.p,y)));
 }
 function around(h,from,to){
  const vs=Array.from({length:6},(_,i)=>vertex(h,i));
  const i=vs.findIndex(p=>near(p,from)),j=vs.findIndex(p=>near(p,to));
  if(i<0||j<0)return [];
  const forward=(j-i+6)%6,backward=(i-j+6)%6;
  const step=forward<=backward?1:-1,n=Math.min(forward,backward);
  return Array.from({length:n+1},(_,k)=>vs[(i+step*k+12)%6]);
 }
 function edgeRiver(route){
  const hexes=route.map(([q,r])=>({q,r})),land=hexes.slice(0,-1);
  if(!land.length)return;
  const exits=land.map((h,i)=>corners(h,hexes[i+1]));
  if(exits.some(x=>x.length!==2))return;
  // Use the shorter continuous walk along each hex's perimeter.
  let current=vertex(land[0],(exits[0][0].i+3)%6);
  ctx.beginPath();ctx.moveTo(...current);
  for(let i=0;i<land.length;i++){
   const scores=exits[i].map(x=>({x,path:around(land[i],current,x.p)}));
   scores.sort((a,b)=>a.path.length-b.path.length);
   const chosen=scores[0];
   for(const point of chosen.path.slice(1))ctx.lineTo(...point);
   current=chosen.x.p;
  }
  const last=exits.at(-1);
  ctx.lineTo((last[0].p[0]+last[1].p[0])/2,
    (last[0].p[1]+last[1].p[1])/2); // actual water boundary
  ctx.stroke();
 }
for(const c of world.cells){
  const [x,y]=point(c.q,c.r);ctx.beginPath();
  for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6,xx=x+rad*Math.cos(a),yy=y+rad*Math.sin(a);
   if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);}
  ctx.closePath();ctx.fillStyle=colorFor(c,mode);ctx.fill();
 }
 if(rad>=2.5&&['terrain','biomes','relief','water'].includes(mode)){
  ctx.strokeStyle="#328cbb";ctx.lineWidth=Math.max(1,rad*.22);
  for(const path of (world.riverPreviewPaths||world.riverPaths))edgeRiver(path); }
 ctx.save();
  ctx.fillStyle='rgba(12,29,26,.91)';
  ctx.fillRect(15,15,325,46);
  ctx.fillStyle='#ebf6e7';ctx.font='bold 16px system-ui';
  ctx.fillText('Wald: '+world.stats.forestPercentLand+' % der Landhexe',26,34);
  ctx.font='12px system-ui';ctx.fillStyle='#c5e4cb';
  ctx.fillText(world.stats.forest+' bewaldete Hexe · '+world.stats.forestPercentEligible+
    ' % der geeigneten Landhexe',26,51);
  ctx.restore();
  if(selected){
  const [x,y]=point(selected.q,selected.r);ctx.strokeStyle='#ffffff';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(x,y,Math.max(3,rad*.88),0,Math.PI*2);ctx.stroke();
 }
}
function updateStats(){
 if(!world)return;
 const s=world.stats,most=Object.entries(s.terrains).sort((a,b)=>b[1]-a[1]).slice(0,8);
 $('stats').textContent=
  'Hexfelder: '+s.total.toLocaleString('de-DE')+' · Land: '+(100*s.land/s.total).toFixed(1)+
  '% · Wasser: '+(100*s.water/s.total).toFixed(1)+'% · Küstenwasser: '+s.coast+
  ' · Hügel: '+s.hills+' · Berge: '+s.mountains+' · Flüsse: '+s.rivers+
  ' · Wald: '+s.forest+' Hexe ('+s.forestPercentLand+' % Land; '+
    s.forestPercentEligible+' % geeignete Gebiete) · Flusshexe: '+s.riverHexes+
   ' · Zusammenhängendes Land: '+s.connectedLandPercent+'%' +
  ' · Größtes Gewässer: '+s.largestWaterBody+' Hexe' +
  ' · Biomkerne: '+s.biomeRegions.count+' (Ø '+s.biomeRegions.average+
  ', Median '+s.biomeRegions.median+', davon '+s.biomeRegions.within30to90+' mit 30–90 Hexen)' +
  ' · Häufigste Terrains: '+most.map(([k,v])=>k+' '+v).join(', ');
 renderDistribution();
}
function renderDistribution(){
 if(!world)return;
 const report=MIX.inspect(world,G);
 const pct=n=>n.toLocaleString('de-DE',{maximumFractionDigits:1});
 const s=report.shares;
 const status='Terrain-Typen: '+report.terrainPresent+' / '+report.terrainTotal+
  ' · Hochland '+report.highland+' Hexe (Ziel mindestens 200)'+
  ' · Grasland '+pct(s.grassland)+' % / kalte Regionen '+pct(s.cold)+' %'+
  ' · Feuchtgebiete '+pct(s.wetland)+' % / Trockengebiete '+pct(s.arid)+' %'+
  ' · '+(report.missing.length?'Nicht vorhanden: '+
   report.missing.map(id=>TERRAIN_NAMES[id]||id).join(', '):
   'Alle regulären Terrain-Typen vorhanden')+
  (report.allGoalsMet?' · Zielmix erreicht':' · Abweichungen zum Zielmix');
 $('mixReport').textContent=status;
 $('mixReport').className='mix-result'+(report.allGoalsMet?'':' incomplete');
 const number=n=>n.toLocaleString('de-DE',{maximumFractionDigits:1});
 const appendRows=(target,ids,counts,means,names)=>{
  const rows=$(target);rows.replaceChildren();
  const keys=[...new Set([...ids,...Object.keys(counts||{}),...Object.keys(means||{})])];
  for(const id of keys){
   const current=counts?.[id]||0,average=means?.[id];
   const tr=document.createElement('tr');if(current===0)tr.className='zero';
   const type=document.createElement('td'),label=document.createElement('div'),
    identifier=document.createElement('div');
   label.textContent=names[id]||id;identifier.textContent=id;
   identifier.className='terrain-id';type.append(label,identifier);tr.append(type);
   const values=[number(current),average?number(average.mean):'—',
    average?number(average.percent)+' %':'—',
    average?average.worldsPresent+' / '+distribution.samples:'—'];
   for(const value of values){
    const td=document.createElement('td');td.className='numeric';
    td.textContent=value;tr.append(td);
   }
   rows.append(tr);
  }
 };
 appendRows('biomeCounts',G.BIOME_IDS,world.stats.biomes,distribution?.biomes,BIOME_NAMES);
 appendRows('terrainCounts',G.TERRAIN_IDS,world.stats.terrains,distribution?.terrains,TERRAIN_NAMES);
 $('exportDistribution').disabled=!distribution;
 if(!distribution&&!distributionRunning)
  $('distributionStatus').textContent='Aktuelle Welt angezeigt. Mittelwerte für mehrere Seeds noch nicht berechnet.';
 else if(distribution&&!distributionRunning)
  $('distributionStatus').textContent=distribution.samples+' Testwelten, je '+
   number(distribution.meanHexes)+' Hexfelder (Ø '+number(distribution.meanLand)+
   ' Landhexe). Mittelwerte passend zu den aktuellen Einstellungen.';
}
async function analyzeDistribution(){
 if(distributionRunning||!currentWorld())return;
 const n=Number($('analysisSamples').value);
 if(!Number.isSafeInteger(n)||n<2||n>40){
  $('distributionStatus').textContent='Bitte 2 bis 40 Testwelten auswählen.';return;
 }
 const basis=world,signature=distributionKey,run=++distributionRun;
 const options={width:basis.width,height:basis.height,
  originQ:basis.originQ,originR:basis.originR,config:{...basis.config}};
 const samples=[];
 distributionRunning=true;$('analyzeDistribution').disabled=true;
 try{
  for(let i=0;i<n;i++){
   if(run!==distributionRun||signature!==distributionKey)return;
   // Seed suffix remains unique even when the user's seed has 256 characters.
   const suffix=':stat:'+String(i+1);
   const sampleSeed=basis.seed.slice(0,256-suffix.length)+suffix;
   samples.push(G.generateWorld(sampleSeed,options).stats);
   $('distributionStatus').textContent='Statistik berechnen: '+(i+1)+' / '+n+
    ' Testwelten (eigene Seeds, identische Parameter) …';
   await new Promise(resolve=>window.setTimeout(resolve,0));
  }
  if(run!==distributionRun||signature!==distributionKey)return;
  distribution=G.aggregateDistributions(samples);
  try{
   localStorage.setItem(DISTRIBUTION_STORAGE_KEY,JSON.stringify({
    signature,data:distribution}));
  }catch(_error){/* Reporting works without browser storage. */}
 }catch(error){
  if(run===distributionRun)
   $('distributionStatus').textContent='Statistik fehlgeschlagen: '+error.message;
 }finally{
  if(run===distributionRun){
   distributionRunning=false;
   $('analyzeDistribution').disabled=false;
   if(distribution)renderDistribution();
  }
 }
}
$('worldMap').addEventListener('click',e=>{
 if(!world||!geometry)return;
 const b=e.currentTarget.getBoundingClientRect(),
  X=(e.clientX-b.left)*e.currentTarget.width/b.width;
 const Y=(e.clientY-b.top)*e.currentTarget.height/b.height;
 const {rad,x0,y0}=geometry,rf=(Y-y0)/(1.5*rad),qf=(X-x0)/(Math.sqrt(3)*rad)-rf/2;
 let cx=qf,cz=rf,cy=-cx-cz,rx=Math.round(cx),ry=Math.round(cy),rz=Math.round(cz);
 const dx=Math.abs(rx-cx),dy=Math.abs(ry-cy),dz=Math.abs(rz-cz);
 if(dx>dy&&dx>dz)rx=-ry-rz;else if(dy>dz)ry=-rx-rz;else rz=-rx-ry;
 selected=G.getWorldCell(world,rx+(world.originQ||0),rz+(world.originR||0));
 $('selected').textContent=selected?JSON.stringify(selected,null,2):
  'Kein Hexfeld an dieser Position.';draw();
});
function download(name,data){
 try{
  const info=IO.saveJSON(name,data);
  $('message').textContent='Export bereitgestellt: '+info.filename+
   ' ('+Math.ceil(info.bytes/1024)+' KiB).';
 }catch(error){$('message').textContent='Export fehlgeschlagen: '+error.message;}
}
$('generate').addEventListener('click',build);
$('applyBalancedMix').addEventListener('click',()=>{
 config=MIX.configFor(G);
 const preset=MIX.PRESET;
 $('worldSeed').value=preset.seed;
 $('worldWidth').value=preset.width;
 $('worldHeight').value=preset.height;
 $('worldOriginQ').value=preset.originQ;
 $('worldOriginR').value=preset.originR;
 buildControls();build();
});
$('analyzeDistribution').addEventListener('click',analyzeDistribution);
$('exportDistribution').addEventListener('click',()=>{
 if(!currentWorld()||!distribution)return;
 download('vedras-geografie-biome-statistik.json',{
  seedBase:world.seed,width:world.width,height:world.height,
  originQ:world.originQ,originR:world.originR,config:world.config,
  ...distribution
 });
});
$('viewMode').addEventListener('change',draw);
for(const id of ['worldSeed','worldWidth','worldHeight','worldOriginQ','worldOriginR'])$(id).addEventListener('change',requestBuild);
$('resetConfig').addEventListener('click',()=>{cancelBuild();config=G.defaultConfig();buildControls();build();});
$('exportConfig').addEventListener('click',()=>download('vedras-worldgen-parameter.json',
 {generatorVersion:G.VERSION,seed:$('worldSeed').value,width:Number($('worldWidth').value),
 height:Number($('worldHeight').value),originQ:Number($('worldOriginQ').value),
  originR:Number($('worldOriginR').value),config}));
$('downloadWorld').addEventListener('click',()=>{
 if(!currentWorld())return;
 download('vedras-welt-'+world.seed+'.json',world);
});
$('planLargeMap').addEventListener('click',()=>{
 if(!currentWorld())return;
 try{
  if(!BAKE)throw Error('Großkarten-Planer wurde nicht geladen.');
  const batchSize=Number($('largeBakeBatchSize').value);
  // No expensive atlas/PNG generation: plan only, wholly read-only.
  const plan=BAKE.plan(world);
  const count=BAKE.batches(plan,batchSize).length;
  const filename='vedras-renderplan-'+world.seed+'.json';
  const result=IO.saveJSON(filename,{
   ...plan,scheduling:{batchSize,batchCount:count}
  });
  $('largeBakeReport').textContent=
   plan.source.cells.toLocaleString('de-DE')+' Hexfelder · '+
   plan.tileCount.toLocaleString('de-DE')+' WorldTiles à 512 · '+
   count.toLocaleString('de-DE')+' Renderpakete · '+
   'Status: nur Planung; 0 PNGs erstellt · '+
   'JSON: '+result.filename;
  $('message').textContent='Renderplanung exportiert ('+
   Math.ceil(result.bytes/1024)+' KiB). Für fertige Spielkarten fehlt noch die Raster-Bake-Stufe.';
 }catch(error){
  $('largeBakeReport').textContent='Renderplanung fehlgeschlagen: '+error.message;
 }
});
$('auditMaterialCatalog').addEventListener('click',async()=>{
 if(!currentWorld())return;
 const button=$('auditMaterialCatalog'),report=$('materialCatalogReport');
 if(button.disabled)return;
 button.disabled=true;
 const sourceWorld=world;
 try{
  if(!MATERIAL?.loadCatalog||!MATERIAL?.auditWorld)
   throw Error('Material-Katalogprüfer nicht geladen.');
  report.textContent='Live-Originalmaterialien werden ohne Änderung am Katalog geprüft …';
  const {catalog,assets}=await MATERIAL.loadCatalog();
  if(sourceWorld!==world)
   throw Error('Welt wurde während des Katalogchecks geändert.');
  const audit=MATERIAL.auditWorld(sourceWorld,catalog,assets);
  report.textContent='Material-Check: '+audit.coveredHexes.toLocaleString('de-DE')+
   ' / '+audit.worldHexes.toLocaleString('de-DE')+' Hexe mit Material'+
   (audit.missing.length?' · FEHLEND: '+audit.missing.map(x=>
    x.terrainId+' ('+x.hexes+' Hexe)').join(', '):
    ' · keine fehlenden Grundmaterialien')+
   (audit.fallbacks.length?' · explizite Ersatzregel: '+audit.fallbacks.map(x=>
    x.terrainId+' → '+x.uses+' ('+x.hexes+' Hexe)').join(', '):'')+
   '. Dies prüft ausschließlich Grundmaterialien; vollständige 4×-Bildschichten fehlen.';
 }catch(error){
  report.textContent='Material-Check fehlgeschlagen: '+String(error?.message||error);
 }finally{button.disabled=false;}
});
$('materialPreviewBake').addEventListener('click',async()=>{
 if(!currentWorld())return;
 const button=$('materialPreviewBake'),report=$('materialPreviewReport');
 if(button.disabled)return;
 button.disabled=true;
 const sourceWorld=world;
 try{
  if(!MATERIAL||!BAKE||!window.VedrasLargeMapBakeSource||
     !window.VedrasAutotile)
   throw Error('Gemeinsamer AutoTile-Renderer oder Großkarten-Kachelquellen fehlen.');
  report.textContent='Echte Terraintexturen und Katalog werden vom lokalen Asset-Labor geladen …';
  const plan=BAKE.plan(sourceWorld),rawId=String($('materialPreviewTileId').value||'').trim();
  const tileId=rawId||plan.tiles[Math.floor(plan.tiles.length/2)]?.id;
  if(!plan.tiles.some(tile=>tile.id===tileId))
   throw Error('WorldTile-ID liegt nicht in diesem geografischen Ausschnitt. Renderplan prüfen.');
  const {catalog,assets}=await MATERIAL.loadCatalog();
  if(sourceWorld!==world)throw Error('Welt wurde während des Materialtests geändert; kein veraltetes PNG exportiert.');
  const renderer=MATERIAL.create({
   world:sourceWorld,plan,catalog,assets,
   planner:BAKE,sourceAdapter:window.VedrasLargeMapBakeSource,
   autotile:window.VedrasAutotile,catalogApi:window.VedrasCatalog,
   reliefAdapter:window.VedrasLargeMapBakeGroundRelief,
   reliefApi:window.VedrasRelief,
   shorelineAdapter:window.VedrasLargeMapBakeShoreline,
   shorelineApi:window.VedrasShoreline,
   riversApi:window.VedrasRivers,
   riverAdapter:window.VedrasLargeMapBakeRivers,
   riverBanksApi:window.VedrasRiverBanks,
   forestAdapter:window.VedrasLargeMapBakeForestFloor,
   forestApi:window.VedrasForest,
   forestFloorApi:window.VedrasForestGround,
  });
  const withRelief=!!$('materialPreviewRelief').checked;
  const withShoreline=!!$('materialPreviewShoreline').checked;
  const withRivers=!!$('materialPreviewRivers').checked;
  const withForest=!!$('materialPreviewForest').checked;
  report.textContent='Originalmaterial'+(withRelief?' und Geografie-Hügelrelief':'')+
   (withShoreline?' plus sechs Original-Ufer-PNGs':'')+
   (withRivers?' plus Flusswasser/Uferwände':'')+
   (withForest?' plus Waldboden':'')+
   ' für Kachel '+tileId+' werden mit den bestehenden Bildrenderern zusammengesetzt …';
  const result=await renderer.renderTile(tileId,{withRelief,withShoreline,withRivers,withForest});
  if(sourceWorld!==world)throw Error('Welt wurde während des Renderns geändert; kein veraltetes PNG exportiert.');
  const expectedStage=withRivers?'original-river-ground-preview':
   withForest?'original-forest-ground-preview':withShoreline?
   (withRelief?'material-relief-shoreline-preview':'material-shoreline-preview'):
   (withRelief?'material-relief-preview':'material-only-preview');
  if(result.complete||result.readyForViewer||result.stage!==expectedStage)
   throw Error('Terrainprobe darf nicht als fertige Spielkarte publiziert werden.');
  const blobUrl=URL.createObjectURL(result.png);
  const link=document.createElement('a');
  link.href=blobUrl;
  link.download='vedras-'+(withRelief?'material-relief':'material')+
   (withShoreline?'-ufer':'')+(withRivers?'-fluss':'')+
   (withForest?'-wald':'')+
   'probe-'+result.tile.id.replace(',','_')+'.png';
  document.body.appendChild(link);
  try{link.click();}finally{
   link.remove();setTimeout(()=>URL.revokeObjectURL(blobUrl),15000);
  }
  report.textContent='Original-Ground-Probe exportiert: '+result.tile.id+
   ' · '+result.sourceCount+' Quellhexe · '+result.assetPaths.length+
   ' Originaltexturen · '+result.width+'×'+result.height+' Pixel · '+
   Math.ceil(result.png.size/1024)+' KiB'+
   (withRelief?' · Geografie-Hügelquellen: '+result.reliefHillSources:
    ' · Relief nicht aktiviert')+
   (withShoreline?' · Original-Ufersegmente: '+result.shorelineSegments+
    ' · Original-Ufer-PNGs: '+result.shorelineAssets.length+
    ' · zurückgestellte Flussmündungen: '+result.riverMouthPortalsDeferred+
    ' · geöffnete Flussmündungen: '+result.riverMouthPortalsOpened:'')+
   (withRivers?' · Original-Flussläufe: '+result.riverRoutesRendered+
    ' · Uferwandschichten: '+result.riverBankLayers+
    ' · Flusswasser-Texturen: '+result.riverWaterTextures.length:'')+
   (withForest?' · Original-Waldboden: '+result.forestFloorHexes+
    ' Quellhexe, '+result.forestFloorRegions+' Regionen'+
    ' · Lichtungen: '+result.forestFloorGlades+
    ' · Original-Waldboden-PNGs: '+result.forestFloorAssets.length:'')+
   '. UNVOLLSTÄNDIG: '+(withRelief?'':'ohne Relief, ')+
   (withShoreline?'':'ohne Ufergrafiken, ')+
   (withRivers?'':'ohne Flusswasser, ')+
   (withForest?'':'ohne Waldboden, ')+
   'ohne Nature-Scenery und Schatten. Kein fertiger Kartenatlas.';
 }catch(error){
  report.textContent='Materialprobe nicht exportiert: '+String(error?.message||error);
 }finally{button.disabled=false;}
});
$('importConfig').addEventListener('click',()=>$('configFile').click());
async function readSettingsWithConsent(raw){
 const version=raw?.generatorVersion||raw?.version;
 const legacy=version!==G.VERSION&&IO.OLD_VERSIONS.includes(version);
 if(legacy&&!window.confirm('Die Welt stammt aus '+version+
  '. Sie wird mit '+G.VERSION+' neu generiert; Landschaft und Verteilung können sich ändern. Fortfahren?'))
  throw Error('Import der älteren Generatorversion abgebrochen.');
 return {allowLegacy:legacy};
}
$('configFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  const raw=await IO.parseFile(file),options=await readSettingsWithConsent(raw);
  const {world:next}=IO.generate(raw,G,options);
  applyImportedWorld(next,'Parameter erfolgreich importiert');
 }catch(error){$('message').textContent='Parameterimport fehlgeschlagen: '+error.message;}
 finally{e.target.value='';}
});
$('importWorld').addEventListener('click',()=>$('worldFile').click());
$('worldFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  const raw=await IO.parseFile(file),options=await readSettingsWithConsent(raw);
  const {world:next}=IO.generate(raw,G,{...options,requireWorld:true});
  applyImportedWorld(next,'Welt erfolgreich importiert');
 }catch(error){$('message').textContent='Weltimport fehlgeschlagen: '+error.message;}
 finally{e.target.value='';}
});
$('importDistribution').addEventListener('click',()=>$('distributionFile').click());
$('distributionFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  const raw=await IO.parseFile(file),data=IO.readStatistics(raw,world,G);
  distribution=data;distributionKey=IO.signature(world,G);++distributionRun;
  distributionRunning=false;$('analyzeDistribution').disabled=false;
  try{localStorage.setItem(DISTRIBUTION_STORAGE_KEY,JSON.stringify({
   signature:distributionKey,data:distribution}));}catch(_error){}
  renderDistribution();
  $('distributionStatus').textContent='Statistik erfolgreich importiert: '+
   data.samples+' Testwelten für die aktuelle Welt.';
 }catch(error){$('distributionStatus').textContent='Statistikimport fehlgeschlagen: '+error.message;}
 finally{e.target.value='';}
});
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==window.opener||
  event.data?.type!=='vedras-geography-preview-result'||
  !handoffRequest||event.data.requestId!==handoffRequest)return;
 handoffRequest=null;
 $('message').textContent=(event.data.ok?'Übertragung erfolgreich: ':
  'Übertragung nicht übernommen: ')+(event.data.message||'Keine Rückmeldung.');
});
$('sendToLab').addEventListener('click',()=>{
 if(!currentWorld())return;
 if(!window.opener||window.opener.closed){$('message').textContent=
  'Öffne das Geografie-Labor über den Knopf im Asset-Labor in einem neuen Tab.';return;}
 try{
  handoffRequest='geo-'+(++handoffSequence);
  window.opener.postMessage({type:'vedras-geography-preview',
   requestId:handoffRequest,world},location.origin);
  $('message').textContent='An Asset-Labor gesendet. Übernahme muss dort bestätigt werden …';
 }catch(error){
  handoffRequest=null;
  $('message').textContent='Übertragung fehlgeschlagen: '+error.message;
 }
});
buildControls();build();
})();
/* Parameter-driven geography workbench – same script in both repositories. */
(()=>{
"use strict";
const G=window.VedrasGeography,$=id=>document.getElementById(id);
let config=G.defaultConfig(),world=null,selected=null,renderPending=false;
const COLORS={ocean:"#1d537b",coastal_water:"#478cac",icy_ocean:"#95cad8",
 stormy_ocean:"#253f71",frozen_tundra:"#bec6ca",tundra:"#849d8f",
 snowfields:"#f0f2eb",grassland:"#80b570",pasture:"#91bc76",sparse_pasture:"#a1ad75",
 savanna:"#a6af59",jungle:"#318962",moor:"#568673",marshland:"#538a77",
 swamp:"#3c7960",rocky_desert:"#a79569",sandy_rocky_desert:"#c4aa6b",
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
function requestBuild(){
 if(renderPending)return;renderPending=true;
 window.setTimeout(()=>{renderPending=false;build();},320);
}
function build(){
 try{
  const width=Number($('worldWidth').value),height=Number($('worldHeight').value);
  $('message').textContent="Welt wird berechnet …";
  const start=performance.now();
  world=G.generateWorld($('worldSeed').value,{width,height,config});
  $('message').textContent="Berechnet in "+Math.round(performance.now()-start)+
    " ms · "+world.version+" · Seed "+world.seed;
  selected=null;draw();updateStats();
 }catch(error){$('message').textContent=error.message;}
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
 function point(q,r){return [x0+Math.sqrt(3)*rad*(q+r/2),y0+1.5*rad*r];}
 for(const c of world.cells){
  const [x,y]=point(c.q,c.r);ctx.beginPath();
  for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6,xx=x+rad*Math.cos(a),yy=y+rad*Math.sin(a);
   if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);}
  ctx.closePath();ctx.fillStyle=colorFor(c,mode);ctx.fill();
 }
 if(rad>=2.5&&['terrain','biomes','relief','water'].includes(mode)){
  ctx.strokeStyle="#328cbb";ctx.lineWidth=Math.max(1,rad*.22);
  for(const path of world.riverPaths){ctx.beginPath();
   path.forEach(([q,r],i)=>{const [x,y]=point(q,r);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
   ctx.stroke();
  }
 }
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
  ' · Bewaldet: '+s.forest+' · Häufigste Terrains: '+most.map(([k,v])=>k+' '+v).join(', ');
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
 selected=G.getWorldCell(world,rx,rz);
 $('selected').textContent=selected?JSON.stringify(selected,null,2):
  'Kein Hexfeld an dieser Position.';draw();
});
function download(name,data){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;
 a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('generate').addEventListener('click',build);
$('viewMode').addEventListener('change',draw);
for(const id of ['worldSeed','worldWidth','worldHeight'])$(id).addEventListener('change',requestBuild);
$('resetConfig').addEventListener('click',()=>{config=G.defaultConfig();buildControls();build();});
$('exportConfig').addEventListener('click',()=>download('vedras-worldgen-parameter.json',
 {generatorVersion:G.VERSION,seed:$('worldSeed').value,width:Number($('worldWidth').value),
 height:Number($('worldHeight').value),config}));
$('downloadWorld').addEventListener('click',()=>{
 if(world)download('vedras-welt-'+world.seed+'.json',world);
});
$('importConfig').addEventListener('click',()=>$('configFile').click());
$('configFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  const obj=JSON.parse(await file.text());
  if(obj.generatorVersion!==G.VERSION)throw Error("Unpassende Worldgen-Version. Keine stille Migration.");
  config=G.normalizeConfig(obj.config);
  $('worldSeed').value=obj.seed;$('worldWidth').value=obj.width;
  $('worldHeight').value=obj.height;buildControls();build();
 }catch(error){$('message').textContent="Import fehlgeschlagen: "+error.message;}
 finally{e.target.value="";}
});
$('sendToLab').addEventListener('click',()=>{
 if(!world)return;
 if(!window.opener||window.opener.closed){$('message').textContent=
  'Öffne das Geografie-Labor über den Knopf im Asset-Labor in einem neuen Tab.';return;}
 window.opener.postMessage({type:'vedras-geography-preview',world},location.origin);
 $('message').textContent='Vorschau an Asset-Labor gesendet. Wechsel dorthin und bestätige die Testszene.';
});
buildControls();build();
})();
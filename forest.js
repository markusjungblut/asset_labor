/* Vegetation overlay v0.12.0: jungle biome + forest cover, without modifying terrain textures. */
'use strict';
window.VedrasForest=(()=>{
 const DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
 const key=(q,r)=>q+','+r;
 const validKey=k=>/^-?\d+,-?\d+$/.test(k);
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const hash=(seed,q,r,salt=0)=>{
  let n=(seed|0)^Math.imul(q+8191,374761393)^Math.imul(r+4093,668265263)^Math.imul(salt+17,2246822519);
  n^=n>>>13;n=Math.imul(n,1274126177);return(n^(n>>>16))>>>0;
 };
 const random=(seed,q,r,salt=0)=>hash(seed,q,r,salt)/4294967296;
 const distance=(a,b)=>Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r));
 // Tropical canopy is a climate-specific overlay, not a universal forest type.
 const jungleAllowed=base=>['jungle','savanna'].includes(base);
 const defaults=()=>({enabled:true,seed:12345,coverage:0.38,edgeStrength:0.72,
  mode:'canopy',canopyCover:.82,gladeRate:.10,debug:false,
  overrides:{},densityOverrides:{},jungleHexes:{}});
 function valid(raw){
  const d=defaults(),v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  const numeric=(n,fallback,min,max)=>Number.isFinite(Number(n))?clamp(Number(n),min,max):fallback;
  const overrides={};
  for(const [k,value] of Object.entries(v.overrides&&typeof v.overrides==='object'&&!Array.isArray(v.overrides)?v.overrides:{})){
   if(validKey(k)&&['none','light_forest','dense_forest'].includes(value))overrides[k]=value;
  }
  const densityOverrides={};
  for(const [k,value] of Object.entries(v.densityOverrides&&typeof v.densityOverrides==='object'&&!Array.isArray(v.densityOverrides)?v.densityOverrides:{})){
   if(validKey(k)&&Number.isFinite(Number(value)))densityOverrides[k]=clamp(Number(value),0,1);
  }
  const jungleHexes={};
  for(const [k,value] of Object.entries(v.jungleHexes&&typeof v.jungleHexes==='object'&&!Array.isArray(v.jungleHexes)?v.jungleHexes:{})){
   if(validKey(k)&&value===true)jungleHexes[k]=true;
  }
  return {enabled:v.enabled!==false,seed:Math.trunc(numeric(v.seed,d.seed,1,2147483647)),
   coverage:numeric(v.coverage,d.coverage,0,1),edgeStrength:numeric(v.edgeStrength,d.edgeStrength,0,1),
   mode:['classic','dense','canopy'].includes(v.mode)?v.mode:d.mode,
   canopyCover:numeric(v.canopyCover,d.canopyCover,.35,.98),
   gladeRate:numeric(v.gladeRate,d.gladeRate,0,.30),
   debug:v.debug===true,overrides,densityOverrides,jungleHexes};
 }
 function suitability(terrainType,c,biome){
  if(terrainType?.materialClass==='water'||terrainType?.materialClass==='shoreline')return 0;
  if(['ocean','coastal_water','icy_ocean','stormy_ocean','coast'].includes(biome))return 0;
  if(biome==='jungle')return 1;
  if(c.biome==='forest'||biome==='forest_floor')return .98;
  switch(terrainType?.categoryId){
   case 'grass_pasture': return .90;
   case 'wetlands': return .83;
   case 'warm_regions': return .75;
   case 'cold_regions': return biome==='snowfields'?.35:.70;
   case 'arid_regions': return ['savanna','semi_desert'].includes(biome)?.36:.15;
   case 'demo_regions': return ['hilly_ground','mountain_ground'].includes(biome)?.60:.67;
   default: return .55;
  }
 }
 function generate(cells,terrainCatalog,raw,biomeOf,baseOf){
  const options=valid(raw);
  const types=new Map((terrainCatalog?.terrainTypes||[]).map(t=>[t.id,t]));
  const info=cells.map(c=>{
   const k=key(c.q,c.r),biome=String(typeof biomeOf==='function'?biomeOf(c):c.terrainTypeId||c.biome||'');
   const baseBiome=String(typeof baseOf==='function'?baseOf(c):c.baseBiome||biome);
   const ground=types.get(baseBiome)?.materialClass==='ground';
   const isJungle=ground&&jungleAllowed(baseBiome)&&(options.jungleHexes[k]===true||biome==='jungle');
   const intendedBiome=isJungle?'jungle':baseBiome;
   const climate=suitability(types.get(intendedBiome),c,intendedBiome);
   return {q:c.q,r:c.r,key:k,baseBiome,biome:intendedBiome,biomeId:intendedBiome,jungle:isJungle,suitability:climate,
    forestClass:'none',baseDensity:0,edgeInfluence:0,density:0,source:'none',
    forestMode:options.mode,canopyCoverage:0,glade:false};
  });
  const byKey=new Map(info.map(c=>[c.key,c]));
  const originalByKey=new Map(cells.map(c=>[key(c.q,c.r),c]));
  const candidates=info.filter(c=>c.suitability>=.25&&!c.jungle);
  const nCenters=options.enabled&&options.coverage>0?Math.max(1,Math.round(candidates.length*options.coverage/5.5)):0;
  const ranked=candidates.map(c=>({...c,rank:random(options.seed,c.q,c.r,100)/(0.3+c.suitability)})).sort((a,b)=>a.rank-b.rank||a.key.localeCompare(b.key));
  const centers=[];
  for(const c of ranked){
   if(centers.length>=nCenters)break;
   if(!centers.some(v=>distance(v,c)<2))centers.push(c);
  }
  // Small maps still receive a grove if the selected centers were too close together.
  if(nCenters>0&&!centers.length&&ranked.length)centers.push(ranked[0]);
  if(options.enabled){
   for(const c of info){
    if(!c.suitability)continue;
    let forestClass='none',source='none';
    if(c.jungle){forestClass='dense_forest';source='jungle';}
    else if(originalByKey.get(c.key)?.biome==='forest'){
     forestClass=random(options.seed,c.q,c.r,104)<.75?'dense_forest':'light_forest';source='demo_woodland';
    }else{
     const nearest=centers.reduce((d,seed)=>Math.min(d,distance(c,seed)),Infinity);
     const variation=random(options.seed,c.q,c.r,105);
     if(nearest===0){forestClass='dense_forest';source='grove';}
     else if(nearest===1){forestClass=variation<.38*c.suitability?'dense_forest':'light_forest';source='grove';}
     else if(nearest===2&&variation<.44*c.suitability){forestClass='light_forest';source='grove';}
    }
    const override=options.overrides[c.key];
    if(override){forestClass=override;source='manual';}
    c.forestClass=forestClass;c.source=source;
    const densityOverride=options.densityOverrides[c.key];
    c.baseDensity=Number.isFinite(densityOverride)&&forestClass!=='none'?densityOverride:(forestClass==='dense_forest'?1:forestClass==='light_forest'?.44:0);
   }
   // One-ring halo: a core forest raises tree probability in neighboring, otherwise open hexes.
   // Overrides of 'none' intentionally remain clear.
   for(const c of info){
    if(!c.suitability||options.overrides[c.key]==='none')continue;
    const maxNeighbor=Math.max(0,...DIRS.map(([dq,dr])=>byKey.get(key(c.q+dq,c.r+dr))?.baseDensity||0));
    c.edgeInfluence=clamp(maxNeighbor*(c.baseDensity?0.18:0.48)*options.edgeStrength*c.suitability,0,.46);
    c.density=clamp(c.baseDensity+c.edgeInfluence,0,1);
   }
  }
  // Coherent small glades inside established forests, never one independent
  // coin toss on every tree. Manual class/density overrides remain authoritative:
  // a manually forced dense hex is not turned into a clearing.
  if(options.enabled&&options.mode==='canopy'&&options.gladeRate>0){
   const dense=info.filter(c=>c.forestClass==='dense_forest'&&!c.jungle&&
    !options.overrides[c.key]);
   const interior=dense.filter(c=>DIRS.filter(([dq,dr])=>
    byKey.get(key(c.q+dq,c.r+dr))?.forestClass==='dense_forest').length>=2);
   const pool=(interior.length?interior:dense).sort((a,b)=>
    random(options.seed,a.q,a.r,1864)-random(options.seed,b.q,b.r,1864));
   const centers=[],want=Math.min(Math.floor(dense.length*.19),
    Math.round(dense.length*options.gladeRate/2));
   for(const c of pool){
    if(centers.length>=want)break;
    if(!centers.some(prev=>distance(prev,c)<3))centers.push(c);
   }
   for(const c of centers){
    c.glade=true;
    const neighbors=DIRS.map(([dq,dr])=>byKey.get(key(c.q+dq,c.r+dr)))
     .filter(v=>v&&v.forestClass==='dense_forest'&&!v.jungle&&
      !options.overrides[v.key])
     .sort((a,b)=>random(options.seed,a.q,a.r,1953)-
      random(options.seed,b.q,b.r,1953));
    if(neighbors.length&&random(options.seed,c.q,c.r,1954)<.84)
     neighbors[0].glade=true;
   }
  }
  for(const c of info){
   const base=c.forestClass==='dense_forest'?1:
    c.forestClass==='light_forest'?.49:c.edgeInfluence>.08?.17:0;
   c.canopyCoverage=c.glade?0:clamp(options.canopyCover*base*
    (.64+.36*c.density)*c.suitability,0,.98);
  }
  return info;
 }
 function treeTarget(cell){
  if(!cell?.suitability)return 0;
  if(cell.glade)return 0;
  if(cell.forestMode==='classic'){
   if(cell.forestClass==='dense_forest')return 5+Math.round(2*cell.density);
   if(cell.forestClass==='light_forest')return 3+Math.round(2*cell.density);
   return cell.density>.18?1:0;
  }
  const target=cell.canopyCoverage||0;
  if(cell.forestClass==='dense_forest')
   return cell.forestMode==='canopy'?14+Math.round(target*13):10+Math.round(target*10);
  if(cell.forestClass==='light_forest')
   return cell.forestMode==='canopy'?5+Math.round(target*13):5+Math.round(target*10);
  return cell.density>.18?2:cell.density>.1?1:0;
 }
 function maxObjects(cell){
  if(!cell?.suitability)return 0;
  if(cell.glade)return 3;
  if(cell.forestMode==='canopy'){
   if(cell.forestClass==='dense_forest')return 36;
   if(cell.forestClass==='light_forest')return 22;
   return cell.edgeInfluence>.1?6:4;
  }
  if(cell.forestMode==='dense'){
   if(cell.forestClass==='dense_forest')return 27;
   if(cell.forestClass==='light_forest')return 18;
   return cell.edgeInfluence>.1?5:4;
  }
  if(cell.forestClass==='dense_forest')return 11;
  if(cell.forestClass==='light_forest')return 7;
  return cell.edgeInfluence>.1?5:4;
 }
 function preferredFamily(family,cell){
  if(!cell?.jungle)return true;
  // Warm-savanna trees belong to savannas rather than closed jungle canopy.
  return !['savanna_trees','conifers','snow_conifers','deciduous_trees','dry_bushes'].includes(family);
 }
 return {DIRS,key,distance,defaults,valid,random,suitability,jungleAllowed,generate,treeTarget,maxObjects,preferredFamily};
})();
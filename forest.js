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
 const defaults=()=>({enabled:true,seed:12345,coverage:0.38,edgeStrength:0.72,debug:false,overrides:{},jungleHexes:{}});
 function valid(raw){
  const d=defaults(),v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  const numeric=(n,fallback,min,max)=>Number.isFinite(Number(n))?clamp(Number(n),min,max):fallback;
  const overrides={};
  for(const [k,value] of Object.entries(v.overrides&&typeof v.overrides==='object'&&!Array.isArray(v.overrides)?v.overrides:{})){
   if(validKey(k)&&['none','light_forest','dense_forest'].includes(value))overrides[k]=value;
  }
  const jungleHexes={};
  for(const [k,value] of Object.entries(v.jungleHexes&&typeof v.jungleHexes==='object'&&!Array.isArray(v.jungleHexes)?v.jungleHexes:{})){
   if(validKey(k)&&value===true)jungleHexes[k]=true;
  }
  return {enabled:v.enabled!==false,seed:Math.trunc(numeric(v.seed,d.seed,1,2147483647)),
   coverage:numeric(v.coverage,d.coverage,0,1),edgeStrength:numeric(v.edgeStrength,d.edgeStrength,0,1),
   debug:v.debug===true,overrides,jungleHexes};
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
    forestClass:'none',baseDensity:0,edgeInfluence:0,density:0,source:'none'};
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
    c.baseDensity=forestClass==='dense_forest'?1:forestClass==='light_forest'?.44:0;
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
  return info;
 }
 function treeTarget(cell){
  if(!cell?.suitability)return 0;
  if(cell.forestClass==='dense_forest')return 5;
  if(cell.forestClass==='light_forest')return 3;
  return cell.density>.24?2:cell.density>.06?1:0;
 }
 function maxObjects(cell){const t=treeTarget(cell);return t>=5?9:t>=3?7:t>=1?4:3;}
 function preferredFamily(family,cell){
  if(!cell?.jungle)return true;
  // Warm-savanna trees belong to savannas rather than closed jungle canopy.
  return !['savanna_trees','conifers','snow_conifers','deciduous_trees','dry_bushes'].includes(family);
 }
 return {DIRS,key,distance,defaults,valid,random,suitability,jungleAllowed,generate,treeTarget,maxObjects,preferredFamily};
})();
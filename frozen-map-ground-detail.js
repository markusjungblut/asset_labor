/* Optional original-Ground playback. Inspect source PNG IHDR before claiming
 * 4x quality: manifest pose.dpr is not proof of encoded ground resolution.
 * Read-only original IndexedDB. Scenery stays at the standard 2x variant.
 */
'use strict';
window.VedrasFrozenGroundDetail=(()=>{
 const GROUND=new Set(['ground','terrain']);
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function merge(raw,derived){
  if(!raw||!derived||raw.key!==derived.key||raw.revision!==derived.revision||
   !Array.isArray(raw.layers)||!Array.isArray(derived.layers)||
   raw.layers.length!==derived.layers.length)return derived;
  let mixed=false;
  const layers=derived.layers.map((layer,i)=>{
   const source=raw.layers[i];
   if(GROUND.has(layer.layer)&&source?.layer===layer.layer&&
    source.png instanceof Blob){mixed=true;return source;}
   return layer;
  });
  return mixed?{...derived,layers,groundDetailSource:'original-4x'}:derived;
 }
 async function sourceGround(record){
  if(!record||!Array.isArray(record.layers))return {density:0,reason:'missing-packet'};
  const layer=record.layers.find(x=>GROUND.has(x?.layer)&&x.png instanceof Blob);
  if(!layer)return {density:0,reason:'missing-ground'};
  const size=Number(record.tile?.size??512),pad=Number(layer.pad??0);
  if(!Number.isFinite(size)||size<=0||!Number.isFinite(pad)||pad<0||pad>512)
   return {density:0,reason:'invalid-layout'};
  let w,h;
  try{
   const head=new Uint8Array(await layer.png.slice(0,24).arrayBuffer());
   if(head.length!==24||head[0]!==137||head[1]!==80||head[2]!==78||
    head[3]!==71||head[4]!==13||head[5]!==10||head[6]!==26||
    head[7]!==10)return {density:0,reason:'invalid-png'};
   const view=new DataView(head.buffer,head.byteOffset,head.byteLength);
   w=view.getUint32(16);h=view.getUint32(20);
  }catch{return {density:0,reason:'unreadable-png'};}
  if(!(w>0&&w<=10000&&h>0&&h<=10000))
   return {density:0,reason:'invalid-dimensions'};
  const density=w/(size+2*pad);
  const vertical=h/((size+2*pad)*.85);
  // 4x authoring uses the orthographic 0.85 ground projection. Both
  // axes must agree, so an arbitrary oversized or malformed PNG is rejected.
  if(Math.abs(density-vertical)>.20)
   return {density:0,reason:'aspect-mismatch'};
  return {density,ready:density>=3.5&&density<=4.3,
   width:w,height:h,reason:density>=3.5&&density<=4.3?'4x':'lower-density'};
 }
 function createStore({standard,overview,original}={}){
  if(!standard?.get||!overview?.getVariant||!original?.get||!original?.keys)
   throw Error('4×-Bodenmodus benötigt vorhandene Karten-Reader');
  let enabled=false;
  const counters={reads:0,originalGrounds:0,missingOriginals:0,
   probeSamples:0,probe4x:0,probeDensity:0,probeIssue:null};
  // Read only 3 representative records, not the whole 600MB atlas.
  // The actual get() still validates EACH source record before substitution.
  async function probe(scene,level,{limit=3}={}){
   const prefix=scene+'|'+level+'|';
   const keys=await original.keys(prefix);
   const chosen=[];
   const count=Math.min(keys.length,clamp(Math.floor(limit)||3,1,7));
   for(let i=0;i<count;i++){
    const k=keys[Math.floor(i*(keys.length-1)/Math.max(1,count-1))];
    if(k&&!chosen.includes(k))chosen.push(k);
   }
   const details=[];
   for(const key of chosen){
    const record=await original.get(key);
    details.push(await sourceGround(record));
   }
   const valid=details.filter(x=>x.ready);
   counters.probeSamples=details.length;counters.probe4x=valid.length;
   counters.probeDensity=details.length?
    Math.min(...details.map(x=>x.density)):0;
   counters.probeIssue=details.find(x=>!x.ready)?.reason||null;
   return {available:details.length>0&&details.length===valid.length,
    tiles:keys.length,sampled:details.length,original4x:valid.length,
    minDensity:counters.probeDensity,
    reasons:[...new Set(details.map(x=>x.reason))]};
  }
  const get=async key=>{
   if(!enabled||key.endsWith('|manifest'))return standard.get(key);
   // Read Ground once, then obtain only the *smaller Scenery* from its
   // separate derived store. The original 4x Ground is never downscaled.
   const raw=await original.get(key);
   const info=await sourceGround(raw);
   counters.reads++;
   if(!info.ready){
    counters.missingOriginals++;return standard.get(key);
   }
   const scenery=typeof standard.getSceneryMixed==='function'?
    await standard.getSceneryMixed(key,raw):await standard.get(key);
   const result=merge(raw,scenery);
   if(result.groundDetailSource==='original-4x')counters.originalGrounds++;
   else counters.missingOriginals++;
   return result;
  };
  return {
   probe,get,sourceGround,
   getVariant:(key,variant)=>variant==='1x'?overview.getVariant(key,'1x'):get(key),
   keys:prefix=>standard.keys(prefix),
   setEnabled:value=>{enabled=value===true;},
   stats:()=>({...counters,enabled})
  };
 }
 return {merge,sourceGround,createStore};
})();

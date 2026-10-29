/* Step 15: opt-in bounded event ledger; no rendering changes or console spam.
 * Events are diagnostic, not CPU samples. The producer reports actual causes.
 */
'use strict';
window.VedrasStep15Trace=(()=>{
 const CAP=1800,counts=new Map();let enabled=false,events=[],slowBakes=[],dropped=0,seq=0,session='';
 const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
 function enable(on=true){enabled=!!on;if(!enabled)reset();return enabled;}
 function reset(label=''){events=[];slowBakes=[];dropped=0;seq=0;counts.clear();session=String(label).slice(0,100);return true;}
 function record(type,detail={}){
  if(!enabled)return;
  const name=String(type).slice(0,64),item={seq:++seq,ms:+now().toFixed(3),type:name};
  const clean={};
  if(detail&&typeof detail==='object')
   for(const [k,v] of Object.entries(detail))
    if(v===null||typeof v==='string'||typeof v==='boolean'||
       (typeof v==='number'&&Number.isFinite(v)))
     clean[k]=typeof v==='string'?v.slice(0,140):v;
  item.detail=clean;
  counts.set(name,(counts.get(name)||0)+1);
  if(name==='tile.bake'&&Number.isFinite(clean.wallMs)){
   slowBakes.push(item);
   slowBakes.sort((a,b)=>b.detail.wallMs-a.detail.wallMs);
   if(slowBakes.length>30)slowBakes.length=30;
  }
  if(events.length>=CAP){events.shift();dropped++;}
  events.push(item);
 }
 function snapshot(){
  const groups=Object.fromEntries(counts);
  const slow=slowBakes.slice();
  return {enabled,session,capacity:CAP,dropped,totalEvents:seq,
   counts:groups,slowBakes:slow,events:events.slice()};
 }
 function classify(reason){
  const map={camera:'camera',zoom:'camera',pan:'camera',
   scene:'scene-change',terrain:'scene-change',scenery:'scene-change',
   asset:'asset-load',image:'asset-load',quality:'quality-lod',
   lod:'quality-lod',mode:'view-mode'};
  return map[reason]||'unknown';
 }
 return {enable,enabled:()=>enabled,reset,record,snapshot,classify};
})();

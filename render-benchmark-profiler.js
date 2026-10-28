/* Step 14 diagnostic counters. Benchmark-only; never owns scene state or rendering. */
'use strict';
window.VedrasBenchmarkProfiler=(()=>{
 let enabled=false,stats=new Map();
 const clock=()=>performance.now();
 function enable(value){enabled=!!value; if(!enabled)stats.clear();return enabled;}
 function reset(){stats.clear();return true;}
 function record(name,elapsed){
  if(!enabled||typeof name!=='string'||!Number.isFinite(elapsed)||elapsed<0)return;
  let s=stats.get(name);if(!s){s={count:0,totalMs:0,maxMs:0,over50ms:0};stats.set(name,s);}
  s.count++;s.totalMs+=elapsed;s.maxMs=Math.max(s.maxMs,elapsed);
  if(elapsed>50)s.over50ms++;
 }
 function count(name,value=1){
  if(!enabled||!Number.isFinite(value))return;
  let s=stats.get(name);if(!s){s={count:0,totalMs:0,maxMs:0,over50ms:0};stats.set(name,s);}
  s.count+=value;
 }
 function snapshot(){
  return {enabled,entries:Object.fromEntries([...stats].map(([name,s])=>[
   name,{count:s.count,totalMs:+s.totalMs.toFixed(3),
    maxMs:+s.maxMs.toFixed(3),over50ms:s.over50ms}
  ]))};
 }
 return {enable,reset,record,count,snapshot,clock};
})();

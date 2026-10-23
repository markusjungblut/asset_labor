/* Vedras Reiche – bounded image decoding and decoded-image LRU.
 * Only needed/selected graphics are decoded; raw PNGs stay on disk.
 * The browser owns Image memory, so estimates are advisory, not RSS.
 */
'use strict';
window.VedrasImagePool=(()=>{
 const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
 function create({parallel=4,maxBytes=192*1024*1024,protectMs=18000,onReady=()=>{}}={}){
  let active=0,queue=[],resources=new Map(),generation=0;
  let stats={ready:0,failed:0,evicted:0,requests:0,decodedBytes:0,peakBytes:0};
  const size=img=>Math.max(0,(img?.naturalWidth||0)*(img?.naturalHeight||0)*4);
  function prune(force=false){
   if(stats.decodedBytes<=maxBytes&&!force)return;
   const candidates=[...resources.values()].filter(r=>r.ready&&!r.loading&&
    (force||now()-r.lastUsed>protectMs))
    .sort((a,b)=>a.lastUsed-b.lastUsed);
   for(const entry of candidates){
    if(stats.decodedBytes<=maxBytes&&!force)break;
    resources.delete(entry.asset.path);
    stats.decodedBytes-=entry.bytes;entry.asset.img=null;
    // Old Image elements remain referenced by active draw operations only;
    // neither the asset catalogue nor our LRU holds them after eviction.
    entry.img.src='';entry.img=null;stats.evicted++;
   }
  }
  function pump(){
   while(active<parallel&&queue.length){
    queue.sort((a,b)=>b.priority-a.priority||a.order-b.order);
    const r=queue.shift();
    if(r.generation!==generation){r.resolve(null);continue;}
    active++;r.loading=true;
    const img=new Image();
    img.decoding='async';
    const finish=successful=>{
     active--;r.loading=false;
     if(r.generation!==generation){r.resolve(null);pump();return;}
     r.ready=successful;r.failed=!successful;
     if(successful){
      r.img=img;r.asset.img=img;r.bytes=size(img);r.lastUsed=now();
      stats.decodedBytes+=r.bytes;stats.peakBytes=Math.max(stats.peakBytes,stats.decodedBytes);
      stats.ready++;r.resolve(img);onReady(r.asset);prune();
     }else{stats.failed++;resources.delete(r.asset.path);r.resolve(null);}
     pump();
    };
    img.onload=()=>finish(!!img.naturalWidth);
    img.onerror=()=>finish(false);
    img.src=r.asset.url;
   }
  }
  function ensure(asset,priority=0){
   if(!asset?.path||!asset.url)return Promise.resolve(null);
   let r=resources.get(asset.path);
   if(r){r.lastUsed=now();if(r.ready)return Promise.resolve(r.img);return r.promise;}
   if(asset.img?.naturalWidth){
    r={asset,img:asset.img,bytes:size(asset.img),ready:true,loading:false,lastUsed:now()};
    resources.set(asset.path,r);stats.decodedBytes+=r.bytes;
    return Promise.resolve(r.img);
   }
   r={asset,ready:false,loading:false,bytes:0,lastUsed:now(),
    generation,priority,order:stats.requests++};
   r.promise=new Promise(resolve=>{r.resolve=resolve;});
   resources.set(asset.path,r);queue.push(r);pump();return r.promise;
  }
  function clear(){
   generation++;
   for(const r of queue)r.resolve(null);
   queue=[];
   for(const r of resources.values())if(r.ready){r.asset.img=null;r.img.src='';}
   resources.clear();stats.decodedBytes=0;
  }
  function report(){return {...stats,active,queued:queue.length,resident:resources.size,
   limitBytes:maxBytes};}
  return {ensure,clear,prune,report};
 }
 return {create};
})();
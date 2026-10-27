/* Vedras terrain Worker client v0.11.8.
 * The UI never transfers its visible canvas. Only immutable source image
 * bitmaps and finished offscreen chunk bitmaps cross the worker boundary.
 */
'use strict';
window.VedrasTerrainWorker=(()=>{
 const supported=()=>typeof Worker==='function'&&
  typeof OffscreenCanvas==='function'&&typeof createImageBitmap==='function';
 let worker=null,ready=null,resolveReady=null,rejectReady=null,disabledReason='',
  nextId=0,loaded=new Map(),loading=new Map(),jobs=new Map();
 const stats={jobs:0,completed:0,failed:0,workerMs:0,transferred:0,
  shorelineJobs:0,shorelineCompleted:0,shorelineFailed:0,shorelineMs:0};
 function stop(reason){
  disabledReason=String(reason||'Worker unavailable');
  if(worker){worker.terminate();worker=null;}
  if(rejectReady){rejectReady(new Error(disabledReason));resolveReady=null;rejectReady=null;}
  ready=null;
  for(const job of jobs.values()){clearTimeout(job.timer);job.reject(new Error(disabledReason));}
  jobs.clear();loaded.clear();loading.clear();
 }
 function boot(){
  if(disabledReason||!supported())return false;
  if(worker)return true;
  try{
   worker=new Worker('terrain-worker.js?v=0.30.1&step8=20261027');
   ready=new Promise((yes,no)=>{resolveReady=yes;rejectReady=no;});
   worker.onmessage=e=>{
    const m=e.data;
    if(m?.type==='ready'){resolveReady?.();resolveReady=null;rejectReady=null;return;}
    if(m?.type==='fatal'){stop(m.message);return;}
    const job=jobs.get(m?.id);
    if(!job){
     // A timed-out or invalidated message must release transferred bitmaps.
     m?.relief?.canvas?.close?.();m?.waterLayer?.canvas?.close?.();
     m?.shoreline?.canvas?.close?.();return;
    }
    jobs.delete(m.id);clearTimeout(job.timer);
    if(m.type==='error'){
     stats.failed++;if(job.shoreline)stats.shorelineFailed++;
     job.reject(new Error(m.message));return;
    }
    if(m.type==='result'){
     stats.completed++;stats.workerMs=m.ms||0;
     stats.transferred+=(m.relief?1:0)+(m.waterLayer?1:0)+(m.shoreline?1:0);
     if(job.shoreline){
      stats.shorelineCompleted++;stats.shorelineMs=m.ms||0;
      job.resolve(m.empty?null:{raster:m.shoreline});
     }else job.resolve(m.empty?null:{
      raster:m.waterLayer?{waterLayer:m.waterLayer}:null,
      relief:m.relief
     });
    }
   };
   worker.onerror=e=>{e.preventDefault?.();stop(e.message||'Worker script loading failed');};
   worker.onmessageerror=()=>stop('Worker message decoding failed');
   return true;
  }catch(err){stop(err);return false;}
 }
 async function texture(asset){
  const path=asset?.path,img=asset?.img;
  if(!path||!img||(img.naturalWidth||img.width)<=0)throw Error('Terrain image not ready: '+path);
  if(loaded.get(path)===img)return;
  if(loading.has(path))return loading.get(path);
  const pending=(async()=>{
   const bitmap=await createImageBitmap(img);
   if(!worker){bitmap.close?.();throw Error('Worker stopped');}
   try{
    worker.postMessage({type:'texture',path,bitmap,
     worldSize:asset.meta?.textureWorldSize||256},[bitmap]);
   }catch(e){bitmap.close?.();throw e;}
   loaded.set(path,img);
  })();
  loading.set(path,pending);
  try{await pending;}finally{loading.delete(path);}
 }
 async function render(data,assets){
  if(!boot())throw Error(disabledReason||'Worker/OffscreenCanvas unsupported');
  await ready;
  await Promise.all((assets||[]).map(texture));
  if(!worker)throw Error(disabledReason||'Worker stopped');
  const id=++nextId;stats.jobs++;
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{
    const found=jobs.get(id);
    if(!found)return;
    jobs.delete(id);stats.failed++;
    reject(new Error('Terrain-Worker exceeded 45 seconds'));
    stop('Terrain-Worker timeout');
   },45000);
   jobs.set(id,{resolve,reject,timer});
   try{worker.postMessage({type:'render',id,data});}
   catch(e){clearTimeout(timer);jobs.delete(id);reject(e);}
  });
 }
 // The shoreline job shares the existing worker texture pool and
 // transferable ImageBitmap protocol. No DOM canvas enters the worker.
 async function renderShoreline(data,assets){
  if(!boot())throw Error(disabledReason||'Worker/OffscreenCanvas unsupported');
  await ready;
  await Promise.all((assets||[]).filter(Boolean).map(texture));
  if(!worker)throw Error(disabledReason||'Worker stopped');
  const id=++nextId;stats.jobs++;stats.shorelineJobs++;
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>{
    if(!jobs.has(id))return;
    jobs.delete(id);stats.failed++;stats.shorelineFailed++;
    reject(new Error('Shoreline worker exceeded 45 seconds'));
    stop('Shoreline worker timeout');
   },45000);
   jobs.set(id,{resolve,reject,timer,shoreline:true});
   try{worker.postMessage({type:'shoreline-render',id,data});}
   catch(e){clearTimeout(timer);jobs.delete(id);reject(e);}
  });
 }
 function status(){
  return {supported:supported(),enabled:!disabledReason&&supported(),active:!!worker,
   failedReason:disabledReason,textures:loaded.size,pending:jobs.size,...stats};
 }
 function restart(){
  stop('Worker was reset by user');
  disabledReason='';
 }
 return {render,renderShoreline,status,disable:stop,restart,available:()=>!disabledReason&&supported()};
})();

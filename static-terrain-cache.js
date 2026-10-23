/* Persist fully rendered terrain-only chunk layers across app restarts.
 * Roads, buildings, units, trees and interactive shadows are NOT included.
 * Chunk content keys encode geometry/material settings and nearby terrain,
 * never camera, UI selection or dynamic object state.
 *
 * A missing server, corrupt cached entry, or a failed encode uses the
 * existing Worker/Canvas renderer. No source PNG is ever modified.
 */
'use strict';
window.VedrasStaticTerrainCache=(()=>{
 const VERSION=2;
 async function sha256(value){
  const bytes=new TextEncoder().encode(JSON.stringify([VERSION,value]));
  if(typeof crypto==='undefined'||!crypto.subtle)throw Error('Secure hashing unavailable');
  const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
  return [...hash].map(b=>b.toString(16).padStart(2,'0')).join('');
 }
 function create({api='/api/static-terrain',onStatus=()=>{}}={}){
  let index=null,loadingIndex=null,supported=true;
  let hits=0,misses=0,saved=0,failed=0;
  const writing=new Set();
  const inform=()=>onStatus(status());
  function status(){return {supported,hits,misses,saved,failed,
   stored:index?.size||0,writing:writing.size};}
  async function initialize(){
   if(loadingIndex)return loadingIndex;
   loadingIndex=(async()=>{
    try{
     const response=await fetch(api+'-index',{cache:'no-store'});
     if(!response.ok)throw Error('No terrain cache endpoint');
     const doc=await response.json();
     if(doc.schemaVersion!==VERSION||!Array.isArray(doc.keys))
      throw Error('Unsupported disk terrain-cache schema');
     index=new Set(doc.keys);
    }catch(error){supported=false;index=new Set();}
    inform();return supported;
   })();
   return loadingIndex;
  }
  const validRaster=data=>data&&[data.x,data.y,data.width,data.height,data.density]
   .every(v=>Number.isFinite(v))&&data.width>0&&data.height>0;
  function image(url){
   return new Promise((resolve,reject)=>{
    const img=new Image();img.decoding='async';
    img.onload=()=>img.naturalWidth?resolve(img):reject(Error('Bad terrain image'));
    img.onerror=()=>reject(Error('Missing static terrain raster'));
    img.src=url;
   });
  }
  async function read(key){
   if(!/^[a-f0-9]{64}$/.test(key))return null;
   await initialize();
   if(!supported||!index.has(key)){misses++;return null;}
   try{
    const response=await fetch(api+'/'+key,{cache:'force-cache'});
    if(!response.ok)throw Error('Missing precomputed tile');
    const doc=await response.json();
    if(doc.schemaVersion!==VERSION||doc.key!==key||!validRaster(doc.land))
     throw Error('Invalid static terrain metadata');
    const loadLayer=async(layer)=>{
     if(!layer)return null;
     if(!validRaster(layer)||typeof layer.file!=='string'||
        !/^precomputed\/terrain\/[a-f0-9]{2}\/[a-f0-9]{64}\.(land|water)\.png$/.test(layer.file))
      throw Error('Invalid static tile image path');
     return {...layer,canvas:await image('./'+layer.file)};
    };
    const [land,water]=await Promise.all([loadLayer(doc.land),loadLayer(doc.water)]);
    hits++;inform();
    return {raster:water?{waterLayer:water}:null,relief:land};
   }catch(err){
    // A corrupted/stale tile is never allowed to blank the map.
    index.delete(key);failed++;inform();return null;
   }
  }
  async function encodeLayer(source){
   if(!source?.canvas||!validRaster(source))return null;
   const canvas=document.createElement('canvas');
   canvas.width=source.canvas.width;canvas.height=source.canvas.height;
   const ctx=canvas.getContext('2d',{alpha:true});
   ctx.drawImage(source.canvas,0,0);
   const blob=await new Promise((resolve,reject)=>canvas.toBlob(
    b=>b?resolve(b):reject(Error('PNG encode failed')),'image/png'));
   const data=await new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onerror=()=>reject(reader.error);
    reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(blob);
   });
   return {x:source.x,y:source.y,width:source.width,height:source.height,
    density:source.density,png:data};
  }
  function store(key,item){
   if(!supported||!index||index.has(key)||writing.has(key)||
      !/^[a-f0-9]{64}$/.test(key))return;
   writing.add(key);inform();
   // Schedule serialization at idle; never delay an interactive map frame.
   const work=async()=>{
    try{
     const land=await encodeLayer(item.relief||item.raster);
     if(!land)return;
     const water=await encodeLayer(item.raster?.waterLayer);
     const response=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({schemaVersion:VERSION,key,land,water})});
     if(!response.ok)throw Error('Static terrain write failed');
     index.add(key);saved++;
    }catch(error){failed++;}
    finally{writing.delete(key);inform();}
   };
   if(typeof requestIdleCallback==='function')requestIdleCallback(work,{timeout:1000});
   else setTimeout(work,0);
  }
  return {keyFor:sha256,initialize,read,store,status};
 }
 return {create,sha256};
})();
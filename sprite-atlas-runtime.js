/* Optional offline atlas pages. Source PNGs remain authoritative for editing,
 * alpha silhouettes and shadows; atlas is a fast replacement for repeated
 * on-screen sprite drawImage sources when compiled atlas files exist. */
'use strict';
window.VedrasSpriteAtlas=(()=>{
 function create({base='atlases/',limitPages=6,onReady=()=>{}}={}){
  let manifest=null,tier='desktop',failed=false,loaded=false;
  const pages=new Map(),pending=new Map(),failedPages=new Set();
  const evictionCooldown=new Map();
  let pageLoads=0,pageEvictions=0,cooldownFallbacks=0;
  const capacity=Math.max(1,Math.floor(limitPages));
  // A frame reserves at most 'capacity' pages. Extra sprites use their original
  // PNG instead of constantly evicting/reloading atlas pages every redraw.
  let selectedPages=null;
  function beginFrame(){selectedPages=new Set();}
  function endFrame(){selectedPages=null;}
  function freeSlot(){
   if(pages.size+pending.size<capacity)return true;
   for(const id of pages.keys()){
    if(!selectedPages?.has(id)){
     pages.delete(id);evictionCooldown.set(id,Date.now());pageEvictions++;return true;
    }
   }
   for(const [id,image] of pending){
    if(!selectedPages?.has(id)){
     pending.delete(id);image.onload=null;image.onerror=null;
     evictionCooldown.set(id,Date.now());pageEvictions++;return true;
    }
   }
   return false;
  }
  const tierName=()=>{
   const small=typeof navigator!=='undefined'&&navigator.maxTouchPoints>0&&
    (typeof window==='undefined'||Math.min(window.innerWidth,window.innerHeight)<1200);
   return small?'mobile':'desktop';
  };
  async function open(){
   if(loaded||failed)return !!manifest;
   loaded=true;
   try{
    const response=await fetch(base+'manifest.json',{cache:'no-cache'});
    if(!response.ok)throw Error('Atlas not compiled');
    const data=await response.json();
    if(data.schemaVersion!==1||!data.tiers)throw Error('Atlas manifest version');
    manifest=data;tier=tierName();
    if(!data.tiers[tier])tier='desktop';
    return true;
   }catch{failed=true;return false;}
  }
  function page(index){
   const info=manifest?.tiers?.[tier]?.pages?.[index];
   if(!info)return null;
   const id=tier+'/'+index;
   if(selectedPages&&!selectedPages.has(id)){
    if(selectedPages.size>=capacity)return null;
    selectedPages.add(id);
   }
   if(pages.has(id)){
    const image=pages.get(id);pages.delete(id);pages.set(id,image);
    return image;
   }
   if(pending.has(id)||failedPages.has(id))return null;
   // Very large maps touch far more than six atlas pages. While a page is
   // cooling down, draw its original PNG rather than requesting the atlas
   // page again and again after each cache eviction.
   const recent=evictionCooldown.get(id);
   if(recent&&Date.now()-recent<10000){cooldownFallbacks++;return null;}
   if(!freeSlot())return null;
   evictionCooldown.delete(id);
   pageLoads++;
   const image=new Image();image.decoding='async';
   pending.set(id,image);
   image.onload=()=>{
    if(pending.get(id)!==image)return;
    pending.delete(id);pages.set(id,image);
    onReady();
   };
   image.onerror=()=>{
    if(pending.get(id)!==image)return;
    pending.delete(id);failedPages.add(id);onReady();
   };
   image.src=base+info.file;
   return null;
  }
  function draw(ctx,path,b,dest,previewSize=null){
   const t=manifest?.tiers?.[tier],entry=t?.sprites?.[path];
   if(!entry||!b?.sw||!b?.sh)return false;
   const img=page(entry.page);if(!img?.naturalWidth)return false;
   const [tx,ty,tw,th]=entry.trim,[ax,ay,aw,ah]=entry.rect;
   // 'b' is measured from the decoded preview (often downsampled to 1024px),
   // while atlas trim/rect coordinates belong to the full-resolution source.
   // Convert BOTH origin and dimensions before sampling. Destination geometry
   // must still use that same crop for a stable anchor and silhouette size.
   const [nativeW,nativeH]=entry.source||[];
   const factorX=nativeW>0&&previewSize?.width>0?
    nativeW/previewSize.width:1;
   const factorY=nativeH>0&&previewSize?.height>0?
    nativeH/previewSize.height:1;
   const bx=b.sx*factorX,by=b.sy*factorY,
    bw=b.sw*factorX,bh=b.sh*factorY;
   const sx=Math.max(tx,bx),sy=Math.max(ty,by),
    ex=Math.min(tx+tw,bx+bw),ey=Math.min(ty+th,by+bh);
   if(ex<=sx||ey<=sy)return false;
   const x=dest.x+(sx-bx)/bw*dest.w,
    y=dest.y+(sy-by)/bh*dest.h,
    w=(ex-sx)/bw*dest.w,h=(ey-sy)/bh*dest.h;
   ctx.drawImage(img,ax+(sx-tx)*aw/tw,ay+(sy-ty)*ah/th,
    (ex-sx)*aw/tw,(ey-sy)*ah/th,x,y,w,h);
   return true;
  }
  function info(){return {
   active:!!manifest,tier,pages:pages.size,pending:pending.size,
   sprites:Object.keys(manifest?.tiers?.[tier]?.sprites||{}).length,failed,
   pageLoads,pageEvictions,cooldownFallbacks
  };}
  async function reload(){
   loaded=false;failed=false;manifest=null;pages.clear();pending.clear();
   failedPages.clear();evictionCooldown.clear();selectedPages=null;
   const ok=await open();if(ok)onReady();return ok;
  }
  return {open,reload,draw,beginFrame,endFrame,info};
 }
 return {create};
})();
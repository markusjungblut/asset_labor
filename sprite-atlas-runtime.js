/* Optional offline atlas pages. Source PNGs remain authoritative for editing,
 * alpha silhouettes and shadows; atlas is a fast replacement for repeated
 * on-screen sprite drawImage sources when compiled atlas files exist. */
'use strict';
window.VedrasSpriteAtlas=(()=>{
 function create({base='atlases/',limitPages=6,onReady=()=>{}}={}){
  let manifest=null,tier='desktop',failed=false,loaded=false;
  const pages=new Map(),pending=new Map();
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
   if(pages.has(id)){
    const image=pages.get(id);pages.delete(id);pages.set(id,image);
    return image;
   }
   if(pending.has(id))return null;
   const image=new Image();image.decoding='async';
   pending.set(id,image);
   image.onload=()=>{
    pending.delete(id);pages.set(id,image);
    while(pages.size>limitPages)pages.delete(pages.keys().next().value);
    onReady();
   };
   image.onerror=()=>pending.delete(id);
   image.src=base+info.file;
   return null;
  }
  function draw(ctx,path,b,dest){
   const t=manifest?.tiers?.[tier],entry=t?.sprites?.[path];
   if(!entry||!b?.sw||!b?.sh)return false;
   const img=page(entry.page);if(!img?.naturalWidth)return false;
   const [tx,ty,tw,th]=entry.trim,[ax,ay,aw,ah]=entry.rect;
   const sx=Math.max(tx,b.sx),sy=Math.max(ty,b.sy),
    ex=Math.min(tx+tw,b.sx+b.sw),ey=Math.min(ty+th,b.sy+b.sh);
   if(ex<=sx||ey<=sy)return false;
   const x=dest.x+(sx-b.sx)/b.sw*dest.w,
    y=dest.y+(sy-b.sy)/b.sh*dest.h,
    w=(ex-sx)/b.sw*dest.w,h=(ey-sy)/b.sh*dest.h;
   ctx.drawImage(img,ax+(sx-tx)*aw/tw,ay+(sy-ty)*ah/th,
    (ex-sx)*aw/tw,(ey-sy)*ah/th,x,y,w,h);
   return true;
  }
  function info(){return {
   active:!!manifest,tier,pages:pages.size,pending:pending.size,
   sprites:Object.keys(manifest?.tiers?.[tier]?.sprites||{}).length,failed
  };}
  return {open,draw,info};
 }
 return {create};
})();
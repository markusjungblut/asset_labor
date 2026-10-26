/* Vedras Reiche v0.22.2 – artwork-backed, world-anchored cloud tiles.
 * Pure presentation. An authoritative server must withhold unknown terrain
 * BEFORE the client renders any cloud pixels or frontier transparency.
 */
'use strict';
window.VedrasCloudArtwork=(()=>{
 const finite=Number.isFinite;
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const mix=(x,y)=>((Math.imul(x|0,374761393)^Math.imul(y|0,668265263))>>>0);
 function classify(entry){
  const path=String(entry?.relPath||entry?.path||'').replaceAll('\\','/').toLowerCase(),
   category=String(entry?.category||'').toLowerCase(),
   meta=entry?.meta||{};
  if(!/\.(png|webp|jpg|jpeg|avif)$/i.test(path))return null;
  if(!/^(clouds?|fog)$/.test(category)&&
   !/(?:^|\/)(?:clouds?|fog)\//.test(path))return null;
  const role=String(meta.cloudRole||meta.role||'').toLowerCase();
  return /edge|fringe|rand|kante|border|saum/.test(path)||role==='edge'?
   'edge':'base';
 }
 function create({onReady=()=>{}}={}){
  let bases=[],edges=[],generation=0,loading=0;
  const canvasFor=(w,h)=>{
   if(typeof document==='undefined')return null;
   const c=document.createElement('canvas');c.width=w;c.height=h;
   return c;
  };
  function soften(img,type){
   const width=512,height=type==='base'?512:
    clamp(Math.round(512*(img.naturalHeight||img.height)/
     Math.max(1,img.naturalWidth||img.width)),180,512);
   const c=canvasFor(width,height),g=c?.getContext('2d');
   if(!g)return img;
   g.clearRect(0,0,width,height);
   g.drawImage(img,0,0,width,height);
   // Precompute alpha gutters ONCE per asset, never per animation frame.
   // A repeated opaque tile with a hard square source edge is not allowed.
   const edge=type==='base'?.16:.11;
   g.globalCompositeOperation='destination-in';
   let grad=g.createLinearGradient(0,0,width,0);
   grad.addColorStop(0,'rgba(0,0,0,0)');
   grad.addColorStop(edge,'rgba(0,0,0,1)');
   grad.addColorStop(1-edge,'rgba(0,0,0,1)');
   grad.addColorStop(1,'rgba(0,0,0,0)');
   g.fillStyle=grad;g.fillRect(0,0,width,height);
   grad=g.createLinearGradient(0,0,0,height);
   grad.addColorStop(0,'rgba(0,0,0,0)');
   grad.addColorStop(edge,'rgba(0,0,0,1)');
   grad.addColorStop(1-edge,'rgba(0,0,0,1)');
   grad.addColorStop(1,'rgba(0,0,0,0)');
   g.fillStyle=grad;g.fillRect(0,0,width,height);
   g.globalCompositeOperation='source-over';
   return c;
  }
  function setAssets(entries){
   generation++;const version=generation;loading=0;
   bases=[];edges=[];
   // Importer reports every asset and a stable URL. Do not assume that the
   // files are checked into GitHub: local assets/clouds/ also works.
   const eligible=(Array.isArray(entries)?entries:[]).map(e=>({
    asset:e,kind:classify(e)
   })).filter(e=>e.kind);
   for(const {asset,kind} of eligible){
    if(typeof Image==='undefined')continue;
    const img=new Image();loading++;
    img.onload=()=>{
     if(version!==generation)return;
     const packet={path:asset.path||asset.relPath,art:soften(img,kind)};
     if(kind==='base')bases.push(packet);else edges.push(packet);
     loading--;onReady();
    };
    img.onerror=()=>{if(version!==generation)return;loading--;onReady();};
    img.src=asset.url||('./'+asset.path);
   }
   onReady();
   return {baseExpected:eligible.filter(a=>a.kind==='base').length,
    edgeExpected:eligible.filter(a=>a.kind==='edge').length};
  }
  function drawBase(g,view){
   // Fallback must always be opaque even while the local artwork decodes.
   g.globalAlpha=1;g.fillStyle='#c2cdd1';
   g.fillRect(0,0,view.width,view.height);
   if(!bases.length)return 0;
   const proj=view.projectY||1;
   const tier=view.zoom<.40?2:1,stride=480*tier,size=600*tier;
   const left=(-view.width/2-view.panX)/view.zoom,
    top=(-view.height/2-view.panY)/(view.zoom*proj);
   const right=left+view.width/view.zoom,
    bottom=top+view.height/(view.zoom*proj);
   const minX=Math.floor(left/stride)-1,maxX=Math.ceil(right/stride)+1,
    minY=Math.floor(top/stride)-1,maxY=Math.ceil(bottom/stride)+1;
   const total=(maxX-minX+1)*(maxY-minY+1);
   if(total>260)return 0; // never flood the main thread at extreme zoom.
   let count=0;
   g.save();g.imageSmoothingEnabled=true;
   for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    const h=mix(x,y),art=bases[h%bases.length].art;
    const dx=view.width/2+view.panX+(x*stride-(size-stride)/2)*view.zoom;
    const dy=view.height/2+view.panY+
     (y*stride-(size-stride)/2)*view.zoom*proj;
    g.drawImage(art,dx,dy,size*view.zoom,size*view.zoom*proj);
    count++;
   }
   g.restore();
   return count;
  }
  function drawEdges(g,view,frontier){
   if(!edges.length||!Array.isArray(frontier))return 0;
   const proj=view.projectY||1,zoom=view.zoom;
   let count=0;
   g.save();g.imageSmoothingEnabled=true;
   for(const e of frontier){
    const sx=view.width/2+view.panX+e.x*zoom,
     sy=view.height/2+view.panY+e.y*zoom*proj,
     reach=e.radius*zoom*1.8;
    if(sx+reach<0||sy+reach<0||sx-reach>view.width||
     sy-reach>view.height)continue;
    const hash=mix(e.q*7+e.side,e.r*11-e.side),
     img=edges[hash%edges.length].art;
    const angle=Math.atan2(Math.sin(e.angle)*proj,Math.cos(e.angle));
    const w=e.radius*zoom*2.35,h=e.radius*zoom*proj*1.48;
    g.save();g.translate(sx,sy);g.rotate(angle-Math.PI/2);
    // The cloud bank straddles the known/unknown boundary. Feathered pixels
    // hide the terrain cut while never creating unknown terrain pixels.
    g.drawImage(img,-w/2,-h*.55,w,h);
    g.restore();count++;
   }
   g.restore();
   return count;
  }
  function stats(){return {bases:bases.length,edges:edges.length,
   pending:loading,version:generation};}
  return {setAssets,drawBase,drawEdges,stats};
 }
 return {create,classify};
})();

/* Vedras Reiche v0.22.4 – seeded, hex-aligned cloud field.
 * Visual concealment only. The multiplayer server must NEVER send
 * unknown terrain pixels or hidden objects to unauthorized players.
 */
'use strict';
window.VedrasCloudArtwork=(()=>{
 const HEX=256,R=HEX/Math.sqrt(3),HEX_H=R*1.5;
 const S=384,HALF=S/2,FEATHER=38,INSET=18;
 const DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 function hashString(s){
  let h=2166136261;
  for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619);}
  return h>>>0;
 }
 function hashHex(seed,q,r){
  let h=(seed^Math.imul(q,0x9e3779b1)^Math.imul(r,0x85ebca77))>>>0;
  h=Math.imul(h^(h>>>16),0x7feb352d);
  h=Math.imul(h^(h>>>15),0x846ca68b);
  return (h^(h>>>16))>>>0;
 }
 function classify(a){
  const p=String(a?.relPath||a?.path||'').replaceAll('\\','/').toLowerCase();
  const folder=/(?:^|\/)(?:clouds?|fog)\//.test(p);
  if(!folder||!/\.(png|webp|jpe?g|avif)$/i.test(p))return null;
  if(/edge|fringe|rand|kante|border|saum/.test(p)||
   String(a?.meta?.cloudRole||'').toLowerCase()==='edge')return 'edge';
  return 'base';
 }
 function polygon(g){
  g.beginPath();
  for(let i=0;i<6;i++){
   const a=-Math.PI/2+i*Math.PI/3;
   const x=HALF+R*Math.cos(a),y=HALF+R*Math.sin(a);
   if(i===0)g.moveTo(x,y);else g.lineTo(x,y);
  }
  g.closePath();
 }
 function create({onReady=()=>{},seed='vedras-preview-clouds'}={}){
  let seedValue=hashString(seed),generation=0,loading=0,bases=[],backdrop='#bdced7';
  const fieldCache=new Map(),MAX_FIELDS=4096;
  const make=()=>{
   if(typeof document==='undefined')return null;
   const c=document.createElement('canvas');c.width=c.height=S;
   return c;
  };
  function prebake(img){
   const draw=()=>{
    const c=make(),g=c?.getContext('2d',{willReadFrequently:true});
    if(!g)return null;
    g.drawImage(img,0,0,S,S);
    return {canvas:c,ctx:g};
   };
   const hard=draw(),soft=draw();
   if(!hard||!soft)return {hard:img,soft:img};
   let tint=null;
   try{
    const data=hard.ctx.getImageData(0,0,S,S),d=data.data;
    let sum=[0,0,0],n=0;
    for(let y=64;y<S-64;y+=35)for(let x=64;x<S-64;x+=35){
     const i=(y*S+x)*4;
     if(d[i+3]<50)continue;
     for(let k=0;k<3;k++)sum[k]+=d[i+k];
     n++;
    }
    if(n){tint='#'+sum.map(v=>Math.round(v/n).toString(16).padStart(2,'0')).join('');}
    const smooth=soft.ctx.getImageData(0,0,S,S),a=smooth.data;
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){
     const px=x-HALF,py=y-HALF,ix=(y*S+x)*4;
     const inradius=R*Math.sqrt(3)/2;
     const signed=Math.min(inradius-Math.abs(px),
      inradius-Math.abs(px*.5+py*Math.sqrt(3)/2),
      inradius-Math.abs(px*.5-py*Math.sqrt(3)/2));
     a[ix+3]=Math.round(a[ix+3]*clamp((signed+FEATHER)/
      (FEATHER+INSET),0,1));
    }
    soft.ctx.putImageData(smooth,0,0);
   }catch(_){
    // On exotic browsers without a readable image buffer, use a sharp
    // clipped source. No rectangular cloud artwork may leak out.
    soft.ctx.save();soft.ctx.globalCompositeOperation='destination-in';
    polygon(soft.ctx);soft.ctx.fillStyle='#fff';soft.ctx.fill();
    soft.ctx.restore();
   }
   hard.ctx.save();hard.ctx.globalCompositeOperation='destination-in';
   polygon(hard.ctx);hard.ctx.fillStyle='#fff';hard.ctx.fill();
   hard.ctx.restore();
   return {hard:hard.canvas,soft:soft.canvas,tint};
  }
  function setSeed(next){
   const hashed=hashString(next);
   if(seedValue===hashed)return false;
   seedValue=hashed;fieldCache.clear();onReady();return true;
  }
  function fieldAt(q,r){
   q=Math.trunc(q);r=Math.trunc(r);
   const id=q+','+r;
   if(fieldCache.has(id))return fieldCache.get(id);
   const hash=hashHex(seedValue,q,r);
   // Cloud PNGs contain baked lighting. Never rotate/mirror them:
   // the light source and cast shadows must agree across ALL hexes.
   const value=Object.freeze({q,r,variant:hash%4,
    rotation:0,density:1});
   if(fieldCache.size>=MAX_FIELDS)fieldCache.delete(fieldCache.keys().next().value);
   fieldCache.set(id,value);
   return value;
  }
  function setAssets(entries){
   generation++;
   const current=generation;
   // Only the FOUR selected cloud-cover images; the former edge sprites
   // are intentionally ignored. Sort before assigning deterministic IDs.
   const candidates=(Array.isArray(entries)?entries:[])
    .filter(a=>classify(a)==='base')
    .sort((a,b)=>String(a.path||a.relPath).localeCompare(String(b.path||b.relPath)))
    .slice(0,4);
   loading=0;
   const expected={baseExpected:candidates.length,edgeExpected:0};
   if(!candidates.length||typeof Image==='undefined'){
    bases=[];onReady();return expected;
   }
   const incoming=[];
   loading=candidates.length;
   function finished(){
    if(current!==generation)return;
    loading--;
    if(loading===0){
     bases=incoming.sort((a,b)=>a.path.localeCompare(b.path));
     backdrop=bases.find(x=>x.tone)?.tone||'#bdced7';
     onReady();
    }
   }
   for(const entry of candidates){
    const img=new Image(),path=String(entry.path||entry.relPath);
    img.onload=()=>{
     if(current!==generation)return;
     try{
      const art=prebake(img);
      incoming.push({path,hard:art.hard,soft:art.soft,tone:art.tint});
     }catch(e){if(typeof console!=='undefined')console.warn('Cloud bake:',e);}
     finished();
    };
    img.onerror=finished;
    img.src=entry.url||('./'+path);
   }
   return expected;
  }
  function visibleHexes(view){
   const proj=view.projectY||1,zoom=view.zoom;
   const minX=(-view.width/2-view.panX)/zoom-R-65,
    maxX=(view.width/2-view.panX)/zoom+R+65;
   const minY=(-view.height/2-view.panY)/(zoom*proj)-R-65,
    maxY=(view.height/2-view.panY)/(zoom*proj)+R+65;
   const minR=Math.floor(minY/HEX_H)-1,maxR=Math.ceil(maxY/HEX_H)+1;
   const out=[];
   for(let r=minR;r<=maxR;r++){
    const first=Math.floor(minX/HEX-r/2)-1,
     last=Math.ceil(maxX/HEX-r/2)+1;
    for(let q=first;q<=last;q++)out.push({q,r});
   }
   return out;
  }
  function stamp(g,view,q,r,part='hard'){
   if(!bases.length)return false;
   const field=fieldAt(q,r),asset=bases[field.variant%bases.length];
   if(!asset)return false;
   const x=view.width/2+view.panX+HEX*(q+r/2)*view.zoom,
    y=view.height/2+view.panY+HEX_H*r*view.zoom*(view.projectY||1);
   const rx=(R+FEATHER)*view.zoom,ry=rx*(view.projectY||1);
   if(x+rx<0||y+ry<0||x-rx>view.width||y-ry>view.height)return false;
   g.save();g.translate(x,y);
   g.scale(view.zoom,view.zoom*(view.projectY||1));
   // Deliberately no rotate/scale(-1): authored illumination stays fixed.
   g.drawImage(asset[part],-HALF,-HALF,S,S);
   g.restore();return true;
  }
  function drawBase(g,view){
   // No viewport-sized gray texture or squares: even outside the generated
   // map this is precisely the same deterministic hex field.
   g.save();g.globalAlpha=1;g.fillStyle=backdrop;
   g.fillRect(0,0,view.width,view.height);
   if(!bases.length){g.restore();return 0;}
   const hexes=visibleHexes(view);
   if(hexes.length>1400){g.restore();return 0;}
   g.imageSmoothingEnabled=true;
   // Opaque tessellated cores first, then precomputed feathered overlaps
   // blending neighboring cloud artwork (like material-edge transitions).
   for(const c of hexes)stamp(g,view,c.q,c.r,'hard');
   for(const c of hexes)stamp(g,view,c.q,c.r,'soft');
   g.restore();return hexes.length;
  }
  function drawTransitions(g,view,edges){
   if(!Array.isArray(edges))return 0;
   const unique=new Set(),targets=[];let count=0;
   for(const e of edges){
    const d=DIRS[e.direction];
    if(!d)continue;
    const q=e.q+d[0],r=e.r+d[1],id=q+','+r;
    if(unique.has(id))continue;
    unique.add(id);targets.push({q,r});
   }
   // Known sprites and mountain casts may extend 45 world units across an
   // edge. A translucent cloud PNG must NEVER reveal those pixels outside
   // authorized world hexes. Mask the exact unknown neighbor cores first,
   // including when cloud PNGs are not loaded yet.
   g.save();g.globalAlpha=1;
   for(const {q,r} of targets){
    const x=view.width/2+view.panX+HEX*(q+r/2)*view.zoom,
     y=view.height/2+view.panY+HEX_H*r*view.zoom*(view.projectY||1),
     rx=R*view.zoom,ry=rx*(view.projectY||1);
    if(x+rx<0||x-rx>view.width||y+ry<0||y-ry>view.height)continue;
    g.beginPath();
    for(let k=0;k<6;k++){
     const a=-Math.PI/2+k*Math.PI/3,
      px=x+Math.cos(a)*rx,py=y+Math.sin(a)*ry;
     if(!k)g.moveTo(px,py);else g.lineTo(px,py);
    }
    g.closePath();g.fillStyle=backdrop;g.fill();
   }
   // Composite every hard core before EVERY soft fringe. Otherwise drawing
   // a later neighbor's hard image can cut through the previous soft bank.
   g.imageSmoothingEnabled=true;
   for(const {q,r} of targets)
    if(stamp(g,view,q,r,'hard'))count++;
   for(const {q,r} of targets)stamp(g,view,q,r,'soft');
   g.restore();return count;
  }
  function drawUnready(g,view,cells,ready){
   if(!bases.length||!Array.isArray(cells))return 0;
   let count=0;
   for(const c of cells)if(c.visibility==='visible'&&!ready(c)){
    // The authored cloud PNG may have transparent highlights/edges. Cover
    // the exact unfinished HEX with an opaque backing BEFORE drawing the
    // decorative cloud artwork; never expose incomplete coast/sprites through
    // holes in a cloud texture at any zoom/LOD.
    g.save();g.globalAlpha=1;g.beginPath();
    if(window.VedrasFogAtmosphere?.hexPath)
     window.VedrasFogAtmosphere.hexPath(g,c,view);
    else{
     const proj=view.projectY||1,r=(c.radius||R)*view.zoom;
     const x=view.width/2+view.panX+c.x*view.zoom,
      y=view.height/2+view.panY+c.y*view.zoom*proj;
     for(let k=0;k<6;k++){
      const a=-Math.PI/2+k*Math.PI/3,
       px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*proj;
      if(!k)g.moveTo(px,py);else g.lineTo(px,py);
     }
     g.closePath();
    }
    g.fillStyle=backdrop;g.fill();g.restore();
    if(stamp(g,view,c.q,c.r,'hard'))count++;
    stamp(g,view,c.q,c.r,'soft');
   }
   return count;
  }
  function stats(){return {bases:bases.length,edges:0,pending:loading,
   hexCache:fieldCache.size,seed:seedValue,version:generation};}
  return {setAssets,setSeed,fieldAt,drawBase,drawTransitions,drawUnready,stats,
   visibleHexes};
 }
 return {create,classify,hashHex,hashString,DIRS,HEX,R};
})();

/* Step 17: proof of the actual shipped-map architecture.
 * This viewer NEVER asks a terrain Worker or a WorldTile source to bake.
 * It reads ONLY completed, explicitly exported static PNG tile layers
 * from IndexedDB. Initial authoring/precomputation is separate.
 * Local Asset-Labor test only. Server-authorized Fog is still required
 * for any future multiplayer use: do not ship hidden terrain to clients.
 */
'use strict';
window.VedrasFrozenMap=(()=>{
 const SCHEMA=1,DB='vedras-frozen-world-v1',STORE='tiles';
 const integer=v=>Number.isSafeInteger(v);
 function memoryStore(){
  const data=new Map();
  return {
   async put(rec){data.set(rec.key,rec);},
   async get(key){return data.get(key)||null;},
   async keys(prefix){return [...data.keys()].filter(k=>k.startsWith(prefix));},
   async clearPrefix(prefix){for(const key of [...data.keys()])
    if(key.startsWith(prefix))data.delete(key);}
  };
 }
 function indexedStore(){
  let opened;
  function open(){
   if(opened)return opened;
   opened=new Promise((resolve,reject)=>{
    if(typeof indexedDB==='undefined'){reject(Error('IndexedDB nicht verfügbar'));return;}
    const req=indexedDB.open(DB,SCHEMA);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))
      req.result.createObjectStore(STORE,{keyPath:'key'});};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||Error('IndexedDB konnte nicht geöffnet werden'));
   });return opened;
  }
  async function job(mode,action){
   const db=await open();
   return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,mode),os=tx.objectStore(STORE);
    let output=null;
    let req;
    try{req=action(os);if(req){req.onsuccess=()=>{output=req.result;};}}
    catch(e){reject(e);return;}
    tx.oncomplete=()=>resolve(output);
    tx.onerror=()=>reject(tx.error||Error('IndexedDB-Transaktion fehlgeschlagen'));
    tx.onabort=()=>reject(tx.error||Error('IndexedDB-Transaktion abgebrochen'));
   });
  }
  return {
   put:rec=>job('readwrite',os=>os.put(rec)),
   get:key=>job('readonly',os=>os.get(key)),
   keys:async prefix=>{
    const db=await open();
    return new Promise((resolve,reject)=>{
     const tx=db.transaction(STORE,'readonly'),
      req=tx.objectStore(STORE).getAllKeys(
       IDBKeyRange.bound(prefix,prefix+'\uffff'));
     req.onsuccess=()=>resolve(req.result);
     req.onerror=()=>reject(req.error);
    });
   },
   // No implicit cleanup: archived evidence is persistent until an explicit
   // future user-requested deletion workflow is added.
  };
 }
 function valid(packet){
  if(!packet||packet.dirty||packet.preview||!packet.complete||
    !['far','mid','near'].includes(packet.level)||!packet.tile?.id||
    typeof packet.revision!=='string')return false;
  const layers=packet.layers||[];
  return layers.some(l=>['ground','terrain'].includes(l.layer)&&l.image?.width>0&&l.image?.height>0)&&
   layers.some(l=>['scenery','structures'].includes(l.layer)&&l.image?.width>0&&l.image?.height>0);
 }
 function makeKey(scene,level,tileId){return scene+'|'+level+'|'+tileId;}
 async function encodeImage(image){
  const cv=document.createElement('canvas');cv.width=image.width;cv.height=image.height;
  const ctx=cv.getContext('2d',{alpha:true});if(!ctx)throw Error('PNG-Kontext fehlt');
  ctx.drawImage(image,0,0);
  return new Promise((resolve,reject)=>cv.toBlob(blob=>
   blob?resolve(blob):reject(Error('PNG-Bild konnte nicht gespeichert werden')),'image/png'));
 }
 function create({canvas,storage=indexedStore(),decode=null,encode=encodeImage,onStatus=()=>{},
    maxDecodedPixels=18000000}={}){
  if(!canvas?.getContext)throw Error('Canvas für Spielkartentest fehlt');
  const ctx=canvas.getContext('2d',{alpha:true});
  let active=false,sceneKey='',level='mid',pose=null,cells=[],available=new Set();
  const decoded=new Map(),loading=new Set();
  let hits=0,loads=0,paintMs=0,misses=0,failures=0,frame=0,decodedPixels=0;
  const decodePNG=decode||(async blob=>{
   if(typeof createImageBitmap==='function')return createImageBitmap(blob);
   return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(blob),im=new Image();
    im.onload=()=>{URL.revokeObjectURL(url);resolve(im)};
    im.onerror=()=>{URL.revokeObjectURL(url);reject(Error('PNG konnte nicht dekodiert werden'))};
    im.src=url;
   });
  });
  function report(){return {active,sceneKey,level,saved:available.size,
   decoded:decoded.size,decodedPixels,hits,loads,misses,failures,
   pending:loading.size,frames:frame,paintMs};}
  function clearDecoded(){for(const entry of decoded.values())
   for(const img of entry.images)img.close?.();
   decoded.clear();loading.clear();decodedPixels=0;
  }
  const repaint=()=>{if(active&&typeof requestAnimationFrame==='function')
   requestAnimationFrame(draw);};
  function keepWithinBudget(){
   while(decodedPixels>maxDecodedPixels&&decoded.size>1){
    const [key,entry]=decoded.entries().next().value;
    decoded.delete(key);decodedPixels-=entry.pixels;
    for(const img of entry.images)img.close?.();
   }
  }
  function read(key){
   if(decoded.has(key)){
    const entry=decoded.get(key);decoded.delete(key);decoded.set(key,entry);
    hits++;return entry;
   }
   if(!available.has(key)||loading.has(key))return null;
   // Bound simultaneous disk reads/decodes – rendering is always nonblocking.
   if(loading.size>=3)return null;
   loading.add(key);
   storage.get(key).then(async record=>{
    if(!record||!Array.isArray(record.layers))throw Error('Kachelpaket fehlt');
    const images=[];
    try{
     for(const l of record.layers)images.push(await decodePNG(l.png));
    }catch(e){for(const im of images)im.close?.();throw e;}
    if(!active||record.key!==key||record.sceneKey!==sceneKey||record.level!==level){
     for(const im of images)im.close?.();return;
    }
    const pixels=images.reduce((n,im)=>n+(im.width||0)*(im.height||0),0);
    decoded.set(key,{record,images,pixels});decodedPixels+=pixels;
    loads++;keepWithinBudget();
   }).catch(()=>{failures++;}).finally(()=>{loading.delete(key);repaint();});
   return null;
  }
  function getPose(){return pose?{...pose}:null;}
  function setPose(next){if(!pose)return;pose={...pose,...next};repaint();}
  function draw(){
   if(!active||!pose)return null;
   const now=typeof performance!=='undefined'?performance.now():Date.now();
   const b=canvas.getBoundingClientRect?.()||{width:canvas.width,height:canvas.height};
   const width=Math.max(1,Math.floor(b.width)),height=Math.max(1,Math.floor(b.height));
   const dpr=Math.max(1,pose.dpr||1);
   const dw=Math.round(width*dpr),dh=Math.round(height*dpr);
   if(canvas.width!==dw||canvas.height!==dh){canvas.width=dw;canvas.height=dh;}
   ctx.setTransform(dpr,0,0,dpr,0,0);
   ctx.fillStyle='#bfcbd1';ctx.fillRect(0,0,width,height);
   const view={...pose,width,height},proj=view.projectY||.85,tiles=[];
   for(const key of available){
    const tail=key.slice((sceneKey+'|'+level+'|').length);
    const [ix,iy]=tail.split(',').map(Number);
    if(!Number.isInteger(ix)||!Number.isInteger(iy))continue;
    const x=ix*512,y=iy*512;
    const snap=v=>Math.round(v*dpr)/dpr,
     left=snap(width/2+view.panX+x*view.zoom),
     top=snap(height/2+view.panY+y*view.zoom*proj),
     right=snap(width/2+view.panX+(x+512)*view.zoom),
     bottom=snap(height/2+view.panY+(y+512)*view.zoom*proj);
    if(left>=width||top>=height||right<=0||bottom<=0)continue;
    const entry=read(key);
    if(entry)tiles.push({left,top,right,bottom,entry});
    else misses++;
   }
   // Even locally baked image packets are clipped to the known authored
   // map geometry. A future network client must supply a stricter,
   // server-authorized visible list, never merely this local array.
   ctx.save();ctx.beginPath();
   for(const c of cells){
    if(c.visibility!=='visible'&&c.visibility!=='explored')continue;
    const x=width/2+view.panX+c.x*view.zoom,
     y=height/2+view.panY+c.y*view.zoom*proj,
     rx=c.radius*view.zoom,ry=rx*proj;
    if(x+rx<0||x-rx>width||y+ry<0||y-ry>height)continue;
    for(let i=0;i<6;i++){
     const theta=-Math.PI/2+i*Math.PI/3,px=x+rx*Math.cos(theta),
      py=y+ry*Math.sin(theta);
     if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();
   }
   ctx.clip();
   for(const layerType of [['ground','terrain'],['scenery','structures']])
    for(const t of tiles){
     const rec=t.entry.record;
     for(let i=0;i<rec.layers.length;i++){
      const layer=rec.layers[i];
      if(!layerType.includes(layer.layer))continue;
      const image=t.entry.images[i],pad=layer.pad||0,core=layerType[0]==='ground';
      const x=t.left,y=t.top,w=t.right-t.left,h=t.bottom-t.top;
      if(core){
       const ratio=pad/(512+pad*2),sx=image.width*ratio,sy=image.height*ratio,
        sw=image.width*(1-ratio*2),sh=image.height*(1-ratio*2);
       ctx.drawImage(image,sx,sy,sw,sh,x,y,w,h);
      }else{
       const fx=x-pad*view.zoom,fy=y-pad*view.zoom*proj,
        fw=w+pad*2*view.zoom,fh=h+pad*2*view.zoom*proj;
       const c=layer.crop;
       if(c)ctx.drawImage(image,fx+fw*c.x/c.fullWidth,
        fy+fh*c.y/c.fullHeight,fw*image.width/c.fullWidth,
        fh*image.height/c.fullHeight);
       else ctx.drawImage(image,fx,fy,fw,fh);
      }
     }
    }
   ctx.restore();
   // This player draws no dynamic entities. Fog/units/etc must remain
   // runtime layers; the local editor test is explicitly terrain/scenery.
   frame++;paintMs=(typeof performance!=='undefined'?performance.now():Date.now())-now;
   onStatus(report());return report();
  }
  async function load(scene,selectedLevel,initialPose,knownCells){
   if(!/^v1-[0-9a-f]{8}$/.test(scene))throw Error('Ungültige Spielkartenkennung');
   if(!['mid','near','far'].includes(selectedLevel))throw Error('Ungültiges Karten-LOD');
   active=false;clearDecoded();sceneKey=scene;level=selectedLevel;
   pose={...initialPose};cells=knownCells.map(c=>({...c}));
   available=new Set(await storage.keys(scene+'|'+level+'|'));
   active=true;repaint();onStatus(report());return report();
  }
  function stop(){active=false;clearDecoded();onStatus(report());}
  async function capture(scene,packets,{onProgress=()=>{}}={}){
   if(!/^v1-[0-9a-f]{8}$/.test(scene))throw Error('Ungültige Spielkartenkennung');
   const exact=packets.filter(valid),rejected=packets.length-exact.length;
   const known=new Set();
   for(const level of new Set(exact.map(p=>p.level)))
    for(const key of await storage.keys(scene+'|'+level+'|'))known.add(key);
   let saved=0,skipped=0;
   for(const packet of exact){
    const key=makeKey(scene,packet.level,packet.tile.id);
    if(known.has(key)){skipped++;continue;}
    const layers=[];
    for(const layer of packet.layers)layers.push({
     layer:layer.layer,pad:layer.pad||0,crop:layer.crop||null,
     png:await encode(layer.image)
    });
    await storage.put({key,sceneKey:scene,level:packet.level,
     tile:{...packet.tile},revision:packet.revision,layers});
    saved++;known.add(key);onProgress({saved,skipped,total:exact.length,rejected});
   }
   return {saved,skipped,rejected,total:packets.length};
  }
  return {capture,load,stop,draw,report,getPose,setPose,
   isActive:()=>active,storage};
 }
 return {create,memoryStore,valid,makeKey};
})();
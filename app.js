/* Vedras Reiche – Asset Labor v0.11.0, browser canvas / standard ES2022.
 * Preview tool. Terrain textures and old SVGs are placeholders, not approved art.
 * True hex dimensions: 256 logical width; orthographic ground y-compression 0.85.
 * Sprites are pre-rendered at the same angle and are NOT compressed a second time.
 */
'use strict';
let catalog=window.VedrasCatalog.starter();
let catalogDirty=false,catalogCanSave=false;
let catalogRevision=0,catalogAutosaveTimer=null,catalogSaveInFlight=null;
const CATALOG_AUTOSAVE_DELAY=300;

const HEX=256, R=HEX/Math.sqrt(3), PROJECT_Y=.85, MAX_BUILD=HEX*.75, SEED=309175;
const ZMIN=.30,ZMAX=2.40,FAR_ENTER=.54,FAR_LEAVE=.64;
const $=id=>document.getElementById(id);
const canvas=$('mapCanvas'),viewport=$('canvasOuter'),ctx=canvas.getContext('2d',{alpha:false,desynchronized:false});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const state={zoom:.65,panX:0,panY:20,mode:'normal',view:'map',dpr:1,quality:'auto',
 selected:'0,0',grid:false,objects:true,river:true,riverPaths:[],riverWidth:40,riverDebug:false,bounds:false,sceneSize:37,width:160,edgeBlend:true,blendVariants:true,waterSampling:'hex',edgeWidth:28,edgeDebug:false,seamCheck:false,materialScales:{},visualPolish:window.VedrasPolish.defaults(),edgeIrregularity:5,cornerBlend:true,transitionDebugMode:"edges",
 shoreline:{enabled:true,mode:'temp',width:34,outer:10},
 asset:null,compareA:null,compareB:null,hexTerrain:{},biomeTerrain:{},baseBiomeByHex:{},hexObject:{},hexShadow:{},natureInstances:[],mountainInstances:[],mountainDebug:false,mountainShadowDebug:false,mountainSpacing:'normal',mountainShadowDefaults:{opacity:.44,softness:17,originX:-.10,originY:.015,angle:150,length:.72,rootWidth:.26,midWidth:.21,tipWidth:.105,contactWidth:.16,contactLength:.33},shadowGlobal:.68,shadowAssetPresets:{},shadowHandles:false,mountainMode:'single',mountainChainId:'alpen_01',showLegacyNature:true,natureSeed:12345,forest:window.VedrasForest.defaults(),relief:window.VedrasRelief.defaults()};
let assets=[],assetByPath=new Map(),drawPending=false,W=800,H=600,worldCells=[];
const demoTypes={plains:'grassland',forest:'forest_floor',jungle:'jungle',hills:'hilly_ground',mountain:'mountain_ground',dry:'dry_ground',desert:'rocky_desert'};
function typeOfAsset(a){return window.VedrasCatalog.materialType(catalog,a);}
// Ground-material selection, the original habitat and the forest canopy are
// distinct layers. forest_floor is a VISUAL TEXTURE, never an ecological biome.
function baseBiomeOf(c){
 if(!c)return null;
 const k=key(c.q,c.r);
 const own=typeOfAsset(useAsset(state.hexTerrain[k]));
 if(own&&own!=='forest_floor')return own;
 const perBiome=typeOfAsset(useAsset(state.biomeTerrain[c.biome]));
 if(!own&&perBiome&&perBiome!=='forest_floor')return perBiome;
 const fallback=c.terrainTypeId==='forest_floor'?'grassland':c.terrainTypeId||demoTypes[c.biome]||'grassland';
 const remembered=state.baseBiomeByHex?.[k];
 return remembered&&catalog.terrainTypes.some(t=>t.id===remembered&&t.materialClass==='ground')?remembered:fallback;
}
function typeOfCell(c){
 const base=baseBiomeOf(c);
 return window.VedrasForest.jungleAllowed(base)&&state.forest?.jungleHexes?.[key(c.q,c.r)]===true?'jungle':base;
}
let forestMemoSignature='',forestMemoCells=[];
function forestCells(){
 // The placement gate is called for hundreds of sprites per frame. Forest
 // generation is deterministic; cache it by its ecological inputs.
 const signature=JSON.stringify([state.forest,catalog.terrainTypes.map(t=>[t.id,t.categoryId,t.materialClass]),
  worldCells.map(c=>[c.q,c.r,c.biome,baseBiomeOf(c)])]);
 if(forestMemoSignature!==signature){
  forestMemoCells=window.VedrasForest.generate(worldCells,catalog,state.forest,c=>typeOfCell(c),baseBiomeOf);
  forestMemoSignature=signature;
 }
 return forestMemoCells;
}
function refreshCatalog(){
 const status=catalogDirty?(catalogCanSave?' · Speichern ausstehend':' · ungespeichert – bitte exportieren'):'';
 document.getElementById('catalogStatus').textContent=`${catalog.categories.length} Kategorien · ${catalog.terrainTypes.length} Arten · ${Object.keys(catalog.assets).length} zugeordnete Grafiken${status}`;
 renderCatalogChoices();renderAssetsList();invalidateTerrain();requestDraw();window.dispatchEvent(new Event('vedras:terrain-catalog-changed'));
}
const BIOME_COLOR={plains:'#9fb77a',forest:'#668f62',jungle:'#2f6850',hills:'#b0a777',mountain:'#919888',dry:'#c6ae76',desert:'#d7bb7f'};
const isTerrain=a=>a&&(a.category==='terrain'||a.category==='terrain_base'||a.meta?.assetType==='terrain_base');
const isTerrainValid=a=>isTerrain(a)&&a.terrainCheck?.ok===true;
const fallbackAssets=[
 'terrain/plains_01.png','terrain/plains_02.png','terrain/forest_01.png',
 'terrain/hills_01.png','terrain/mountain_01.png','terrain/dry_01.png',
 'terrain/desert_rocky_base_01.png','terrain/desert_rocky_base_02.png',
 'terrain/desert_rocky_base_03.png','terrain/desert_rocky_base_04.png',
 'terrain/plains_handpainted_01.png','terrain/dry_grass_test_01.png',
 'shorelines/shore_edge_01.png','shorelines/shore_edge_02.png','shorelines/shore_edge_03.png',
 'shorelines/shore_edge_04.png','shorelines/shore_edge_05.png','shorelines/shore_edge_06.png',
 'references/concept_hexblock_NOT_TERRAIN.png',
 'buildings/mine_lvl01__main.png','nature/pine_01.svg','nature/pine_02.svg',
 'nature/rock_01.svg','nature/rock_02.svg','nature/hill_01.svg','nature/ore_iron.svg',
 'units/expedition.svg'
].map(x=>({path:'assets/'+x,relPath:x,name:x.split('/').pop(),category:x.split('/')[0],meta:{},bytes:0,mtime:0}));
function hash(q,r,k=0){let n=(SEED+Math.imul(q+4096,374761393)+Math.imul(r+4096,668265263)+Math.imul(k+11,2246822519))|0;n^=n>>>13;n=Math.imul(n,1274126177);return (n^(n>>>16))>>>0;}
function rnd(q,r,k){return hash(q,r,k)/4294967296;}
function key(q,r){return q+','+r;}
function axialPos(q,r){return {x:HEX*(q+r/2),y:1.5*R*r};}
function hexPoints(q,r){const p=axialPos(q,r);return Array.from({length:6},(_,i)=>{const a=(-Math.PI/2+i*Math.PI/3);return [p.x+R*Math.cos(a),p.y+R*Math.sin(a)];});}
function cubeRound(q,r){let x=q,z=r,y=-q-r;let rx=Math.round(x),ry=Math.round(y),rz=Math.round(z),dx=Math.abs(rx-x),dy=Math.abs(ry-y),dz=Math.abs(rz-z);if(dx>dy&&dx>dz)rx=-ry-rz;else if(dy>dz)ry=-rx-rz;else rz=-rx-ry;return {q:rx,r:rz};}
function pixelToHex(x,y){return cubeRound((x/HEX)-(y/(3*R)),2*y/(3*R));}
function toScreen(x,y){return {x:W/2+state.panX+x*state.zoom,y:H/2+state.panY+y*PROJECT_Y*state.zoom};}
function fromScreen(x,y){return {x:(x-W/2-state.panX)/state.zoom,y:(y-H/2-state.panY)/(PROJECT_Y*state.zoom)};}
function assignBiomes(){const cs=[];const radius=state.sceneSize===7?1:state.sceneSize===37?3:2;for(let r=-radius;r<=radius;r++)for(let q=-radius;q<=radius;q++){if(Math.abs(q+r)>radius)continue;
 const fixed={"0,0":'plains',"-1,0":'forest',"-1,1":'forest',"0,-1":'hills',"1,-1":'mountain',"0,1":'plains',"1,0":'plains'};
 const h=hash(q,r,13)%12;const biome=fixed[key(q,r)]||(h<2?'forest':h===2?'mountain':h<5?'hills':'plains');cs.push({q,r,biome,terrainTypeId:demoTypes[biome],name:{plains:'Grasland',forest:'Waldboden',hills:'Hügel',mountain:'Gebirge'}[biome]});}
 worldCells=cs;draw();}
function useAsset(path){return assetByPath.get(path)||null;}
function allAssets(){return assets.filter(a=>a.img&&a.img.complete&&a.img.naturalWidth>0);}
function findAsset(category,stem){return assets.find(a=>a.category===category&&(a.name===stem||a.name.startsWith(stem)))||null;}
function imageForBiome(c){
 // Forest-floor PNGs are overlay materials. Never use them as the opaque
 // ground of a moor (or any other base biome), even when painted manually.
 if(state.hexTerrain[key(c.q,c.r)]){
  const a=useAsset(state.hexTerrain[key(c.q,c.r)]);
  if(isTerrainValid(a)&&typeOfAsset(a)&&typeOfAsset(a)!=='forest_floor')return a;
 }
 const chosen=state.biomeTerrain[c.biome];
 if(chosen){const a=useAsset(chosen);if(isTerrainValid(a)&&typeOfAsset(a)&&typeOfAsset(a)!=='forest_floor')return a;}
 const typeId=typeOfCell(c),jungle=typeId==='jungle';
 let matches=assets.filter(a=>isTerrainValid(a)&&typeOfAsset(a)===typeId);
 // Ein Jungle-Biom benötigt keine erfundene PNG. Bis eine echte Jungle-Bodengrafik
 // vorhanden ist, wird vorhandener Waldboden NUR visuell als Material verwendet.
 if(jungle&&!matches.length)matches=assets.filter(a=>isTerrainValid(a)&&typeOfAsset(a)==='forest_floor');
 return matches.length?matches[hash(c.q,c.r,11)%matches.length]:null;
}
function effectiveBiome(c){return typeOfCell(c);}
function baseImage(){const fallback=assets.find(a=>isTerrainValid(a)&&typeOfAsset(a)==='grassland');return fallback||null;}
// Asset geometry contract: terrain is a square/rectangular, opaque repeatable MATERIAL.
// Hex borders are generated only by the renderer. A pre-painted 3D hex is not normalizable automatically.
const stampCache=new Map();
function inspectTerrain(asset){
 if(!isTerrain(asset))return null;
 const img=asset.img;if(!img?.naturalWidth)return {ok:false,reason:'Die Grafik konnte nicht geladen werden.'};
 if(asset.meta?.assetType==='legacy_hex_block'||asset.meta?.assetType==='concept_hex')return {ok:false,reason:'Konzept-Hexblock mit Seitenwand: kein Terrain-Base-Material.'};
 try{
  const t=document.createElement('canvas');t.width=t.height=40;const g=t.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0,40,40);
  const d=g.getImageData(0,0,40,40).data;
  const points=[[2,2],[37,2],[2,37],[37,37],[3,20],[36,20],[20,3],[20,36]];
  let alphaBad=0,dark=0;
  for(const [x,y] of points){const i=(y*40+x)*4,alpha=d[i+3];if(alpha<240)alphaBad++;
   if(alpha>235&&d[i]<26&&d[i+1]<26&&d[i+2]<26)dark++;}
  if(alphaBad>=2)return {ok:false,reason:'Freigestellte Hex-/Objektgrafik erkannt (transparente Außenbereiche). Sie ist kein vollflächiges Terrainmaterial. Bitte nur Bodenstruktur ohne Hexkontur erzeugen.'};
  if(dark>=3)return {ok:false,reason:'Schwarzer Außenhintergrund erkannt. Die Grafik ist als Terrain Base nicht geeignet.'};
  const ratio=img.naturalWidth/img.naturalHeight;
  if(ratio<.5||ratio>2)return {ok:false,reason:'Ungewöhnliches Seitenverhältnis; Terrain Base soll eine flächige, wiederholbare Materialtextur sein.'};
  return {ok:true,reason:'Opake Materialfläche: für Top-Surface geeignet. Ob die Textur nahtlos und frei von Einzelobjekten ist, bitte visuell prüfen.'};
 }catch(e){return {ok:false,reason:'Transparenzprüfung der Quelldatei nicht möglich.'};}
}
function hexPath(q,r,margin=0){const p=axialPos(q,r);ctx.beginPath();for(let i=0;i<6;i++){
 const a=-Math.PI/2+i*Math.PI/3;const x=p.x+(R+margin)*Math.cos(a),y=p.y+(R+margin)*Math.sin(a);
 if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
 }ctx.closePath();}
function makePattern(a,patternCtx=ctx){
 if(!isTerrainValid(a))return null;
 const size=clamp(Number(state.materialScales[a.path]||a.meta?.textureWorldSize)||256,160,1536);
 const pat=patternCtx.createPattern(a.img,'repeat');if(!pat)return null;
 const sc=size/a.img.naturalWidth;
 if(pat.setTransform)pat.setTransform(new DOMMatrix([sc,0,0,sc,0,0]));
 return pat;
}
function requestDraw(){if(drawPending)return;drawPending=true;requestAnimationFrame(()=>{drawPending=false;draw();});}
function deviceRatio(){const requested=state.quality==='auto'?Math.min(window.devicePixelRatio||1,3):Number(state.quality);
 return Math.max(1,Math.min(requested,4,Math.sqrt(18000000/Math.max(1,W*H)),4096/Math.max(1,W),4096/Math.max(1,H)));}
function resize(){const b=canvas.getBoundingClientRect();const nw=Math.max(100,Math.round(b.width)),nh=Math.max(100,Math.round(b.height));W=nw;H=nh;state.dpr=deviceRatio();canvas.width=Math.round(W*state.dpr);canvas.height=Math.round(H*state.dpr);requestDraw();updateDiagnostics();}
let terrainRasterCache={signature:null,raster:null};
function invalidateTerrain(){terrainRasterCache={signature:null,raster:null};shorelineCache={signature:null,raster:null};window.VedrasAutotile.clearCache();window.VedrasRelief.clear();}
function currentRelief(){
 const r=state.relief;
 // Water and shoreline are level 0 regardless of the land profile or relief seed.
 // On the LAND side of a shore the height tapers to zero over ~65 world units.
 const map=new Map(worldCells.map(c=>[key(c.q,c.r),{c,wet:isWaterTerrain(typeOfCell(c))}]));
 const coastFade=(x,y)=>{
  const h=window.VedrasAutotile.hexAt(x,y),here=map.get(h);
  if(!here||here.wet)return 0;
  const landPos=axialPos(here.c.q,here.c.r);let fade=1;
  for(const [dq,dr] of window.VedrasAutotile.DIRS){
   const adjacent=map.get(key(here.c.q+dq,here.c.r+dr));if(!adjacent?.wet)continue;
   const seaPos=axialPos(adjacent.c.q,adjacent.c.r),vx=landPos.x-seaPos.x,vy=landPos.y-seaPos.y;
   const distance=((x-(landPos.x+seaPos.x)/2)*vx+(y-(landPos.y+seaPos.y)/2)*vy)/Math.hypot(vx,vy);
   const t=clamp(distance/65,0,1);fade=Math.min(fade,t*t*(3-2*t));
  }
  return fade;
 };
 const base={...r,landMask:coastFade,maskKey:terrainRasterCache.signature};
 if(!r.enabled)return base;
 // Buildings remain upright. Small world-space platforms flatten only their footprints.
 const pads=(r.padBuildings?genericObjects().filter(o=>o.type==='building'):[]).map(o=>({x:o.x,y:o.y,radius:Math.max(27,Math.min(72,o.w*.34)),transition:Math.max(30,Math.min(75,o.w*.28)),height:window.VedrasRelief.rawAt(o.x,o.y,r)}));
 // Mountain influence rings do not occupy ground. Flatten only a compact bed around
 // actual mountain cores; chain members share a compatible reference height.
 const mgs=window.VedrasMountains.chainGroups(validMountains());
 for(const group of mgs.values()){
  const filtered=group.filter(m=>window.VedrasNature?.entryFor(useAsset(m.assetPath))?.mountain?.flatten!==false);
  if(!filtered.length)continue;
  const avg=filtered.reduce((sum,m)=>{const p=axialPos(m.q,m.r);return sum+window.VedrasRelief.rawAt(p.x,p.y+20,r);},0)/filtered.length;
  for(const m of filtered){const p=axialPos(m.q,m.r),core=m.coreRadius===1?1:0;
   pads.push({x:p.x,y:p.y+20,radius:core?124:70,transition:core?76:60,height:avg});
  }
 }
 return {...base,pads};
}
function isWaterTerrain(id){const kind=window.VedrasCatalog.terrainType(catalog,id)?.materialClass;return kind==='water'||kind==='shoreline';}
function reliefHeight(x,y){if(!state.relief.enabled)return 0;return window.VedrasRelief.at(x,y,currentRelief());}
function displayGroundY(x,y){return y-reliefHeight(x,y);}

const SHORE_EDGE_PATHS=Array.from({length:6},(_,i)=>`assets/shorelines/shore_v105_edge_${String(i+1).padStart(2,'0')}.png`);
let shorelineCache={signature:null,raster:null};
const riverRasterCache=new Map();
const wetHex=c=>isWaterTerrain(typeOfCell(c));
const riverRoutes=()=>window.VedrasRivers.normalizeRoutes(state.riverPaths,worldCells,wetHex);
function drawShorelines(){
 const opts=state.shoreline||{enabled:true,mode:'art',width:34,outer:10};
 const report=$('shorelineStats');
 if(!opts.enabled){if(report)report.textContent='Ufer-Overlays ausgeschaltet.';return;}
 const classes=worldCells.map(c=>[c.q,c.r,isWaterTerrain(typeOfCell(c))]);
 const files=SHORE_EDGE_PATHS.map(path=>useAsset(path));
 const mouthPortals=state.river?window.VedrasRivers.mouthPortals(riverRoutes(),worldCells,wetHex,state.riverWidth):[];
 const signature=JSON.stringify({cells:classes,mode:opts.mode,width:opts.width,outer:opts.outer,
  images:files.map(a=>[a?.path,a?.mtime]),mouthPortals,version:4});
 if(shorelineCache.signature!==signature){
  const imgs=files.map(a=>a?.img?.naturalWidth?a.img:null);
  const t0=performance.now();
  shorelineCache.raster=window.VedrasShoreline.build(worldCells,wetHex,imgs,{...opts,resolution:1.5,mouthPortals});
  shorelineCache.signature=signature;shorelineCache.buildMs=performance.now()-t0;
 }
 const r=shorelineCache.raster;
 if(r?.canvas)ctx.drawImage(r.canvas,r.x,r.y,r.width,r.height);
 if(report)report.textContent=`${r?.segments?.length||0} vollständige Land/Wasser-Kanten · ${r?.mouthPortals||0} weiche Mündungsöffnungen · ${r?.missing||0} Grafik-Fallbacks · ${shorelineCache.buildMs?.toFixed(0)||0} ms.`;
}

// A forest is overlaid on its *original* ground, rather than replacing a moor,
// meadow or highland biome with a generic forest-floor ecological type.
// Forest floor is a WORLD-SPACE MATERIAL over a UNION of connected forest
// polygons, not 37 individual hex stamps. The signature keeps this raster
// separate from terrain, rivers and shoreline caches.
let forestFloorRasterCache={signature:null,raster:null,buildMs:0};
function drawForestFloor(){
 const asset=assets.find(a=>isTerrainValid(a)&&typeOfAsset(a)==='forest_floor'&&a.img?.naturalWidth>0);
 if(!asset){window.__vedrasForestFloorRaster=null;return;}
 const cells=forestCells().map(c=>{
  const type=catalog.terrainTypes.find(t=>t.id===c.baseBiome);
  return {...c,categoryId:type?.categoryId,ground:type?.materialClass==='ground'};
 });
 const textureSize=clamp(Number(state.materialScales[asset.path]||asset.meta?.textureWorldSize)||256,160,1536);
 const resolution=Math.max(.65,Math.min(1.9,state.zoom*state.dpr*1.45));
 const signature=JSON.stringify({
  asset:[asset.path,asset.mtime,asset.img.naturalWidth,asset.img.naturalHeight],
  size:textureSize,resolution:Math.round(resolution*10)/10,
  cells:cells.map(c=>[c.q,c.r,c.forestClass,c.jungle,c.baseBiome,c.ground,c.categoryId]),
  version:'region-mask-v1'
 });
 if(forestFloorRasterCache.signature!==signature){
  const start=performance.now();
  forestFloorRasterCache.raster=window.VedrasForestGround.build(cells,asset.img,{
   textureSize,resolution,maxPixels:2600000,feather:23
  });
  forestFloorRasterCache.signature=signature;
  forestFloorRasterCache.buildMs=performance.now()-start;
 }
 const raster=forestFloorRasterCache.raster;
 window.__vedrasForestFloorRaster=raster;
 if(!raster?.canvas)return;
 ctx.save();
 // One complete map silhouette prevents the outward feather spilling onto
 // the background. Critically, there is NO per-forest-hex clipping/fade.
 ctx.beginPath();
 for(const c of worldCells){
  const pts=hexPoints(c.q,c.r);ctx.moveTo(...pts[0]);
  for(let i=1;i<6;i++)ctx.lineTo(...pts[i]);
  ctx.closePath();
 }
 ctx.clip();
 ctx.globalAlpha=1;
 ctx.drawImage(raster.canvas,raster.x,raster.y,raster.width,raster.height);
 ctx.restore();
}
function drawGround(){
 ctx.save();ctx.setTransform(state.dpr,0,0,state.dpr,0,0);
 ctx.fillStyle=state.seamCheck?'#ec27f1':'#879a81';ctx.fillRect(0,0,W,H);
 ctx.translate(W/2+state.panX,H/2+state.panY);ctx.scale(state.zoom,state.zoom*PROJECT_Y);
 const fallback=baseImage();const selected=worldCells.map(c=>imageForBiome(c)||fallback);
 const graph=window.VedrasAutotile.graph(worldCells,effectiveBiome,c=>imageForBiome(c)||fallback,{blendVariants:state.blendVariants});
 window.__vedrasLastAutotile=graph;
 const signature=JSON.stringify({cells:worldCells.map((c,i)=>[c.q,c.r,c.biome,selected[i]?.path,selected[i]?.mtime]),scales:state.materialScales,polish:state.visualPolish.terrain,
   blend:state.edgeBlend,variants:state.blendVariants,waterSampling:state.waterSampling,width:state.edgeWidth,irregularity:state.edgeIrregularity,cornerBlend:state.cornerBlend,catalog:catalog.assets,types:catalog.terrainTypes});
 if(terrainRasterCache.signature!==signature){
  terrainRasterCache.signature=signature;const start=performance.now();
  terrainRasterCache.raster=window.VedrasAutotile.build(worldCells,c=>selected[worldCells.indexOf(c)],effectiveBiome,{
    band:state.edgeWidth,blendVariants:state.blendVariants,waterSampling:state.waterSampling,irregularity:state.edgeIrregularity,
    blend:state.edgeBlend,materialScales:state.materialScales,terrainTone:(rgb,material,id)=>window.VedrasPolish.terrainRGB(rgb[0],rgb[1],rgb[2],state.visualPolish.terrain,material,id),resolution:1.5,maxPixels:state.sceneSize===37?1100000:4200000,cornerBlend:state.cornerBlend,transitionMode:(a,b)=>window.VedrasCatalog.profile(catalog,a,b).mode,materialClassOf:id=>window.VedrasCatalog.terrainType(catalog,id)?.materialClass||'ground'
  });
  terrainRasterCache.buildMs=performance.now()-start;
 }
 window.__vedrasTerrainRaster=terrainRasterCache.raster;
 const reliefRaster=terrainRasterCache.raster?(state.relief.enabled?
   window.VedrasRelief.make(terrainRasterCache.raster.landLayer,currentRelief()):terrainRasterCache.raster):null;
 window.__vedrasReliefRaster=reliefRaster;
 if(reliefRaster){
  // Union silhouette is clipped once, after compositing: no per-hex alpha fringes.
  ctx.save();
  // The auto-tiled material is already unified. Relief deforms its outer silhouette.
  // A flat hex clip here would shear the raised ridge back down at tile edges.
  if(!state.relief.enabled){ctx.beginPath();for(const c of worldCells){const pts=hexPoints(c.q,c.r);ctx.moveTo(...pts[0]);for(let i=1;i<6;i++)ctx.lineTo(...pts[i]);ctx.closePath();}ctx.clip();}
  if(state.relief.enabled)window.VedrasAutotile.draw(ctx,terrainRasterCache.raster.waterLayer);
  window.VedrasAutotile.draw(ctx,reliefRaster);ctx.restore();
 }
 drawForestFloor();
 drawShorelines();
 if(state.edgeDebug)window.VedrasAutotile.drawDebug(ctx,graph,{mode:state.transitionDebugMode,band:state.edgeWidth});
 const reliefLabel=$('reliefStats');if(reliefLabel){const [cq,cr]=state.relief.center.split(',').map(Number),pp=axialPos(cq,cr);reliefLabel.textContent=(state.relief.enabled?'Relief aktiv':'Flachland')+' · Höhe am Reliefzentrum '+reliefHeight(pp.x,pp.y).toFixed(1)+' Welt-Einheiten · '+(state.relief.connected?'hexübergreifend':'lokale Kuppe')+' · Seed '+state.relief.seed;}
 const padLabel=$('buildingPadStats');if(padLabel){
  const houses=genericObjects().filter(o=>o.type==='building');
  if(!state.relief.enabled||!houses.length)padLabel.textContent=state.relief.enabled?'Keine Gebäude in dieser Szene.':'Bauplätze: Relief ausgeschaltet.';
  else{
   let results=[];
   for(const o of houses.slice(0,5)){
    const hs=[[-.26,-.19],[.26,-.19],[-.26,.19],[.26,.19]].map(([x,y])=>window.VedrasRelief.rawAt(o.x+o.w*x,o.y+o.w*y,state.relief));
    const uneven=(Math.max(...hs)-Math.min(...hs));
    results.push((o.asset?.name||'Gebäude')+': Rohrelief ± '+(uneven/2).toFixed(1)+' Einheiten; '+(state.relief.padBuildings?'Standfläche im Nahbereich abgeflacht, sanfter Übergang.':uneven>8?'Hang zu uneben – Fundament nötig.':'Standfläche annähernd eben.'));
   }
   padLabel.textContent=results.join(' | ');
  }
 }
 if(state.relief.enabled&&state.relief.debug&&state.relief.padBuildings){ctx.save();
  for(const o of genericObjects().filter(o=>o.type==='building')){ctx.beginPath();ctx.ellipse(o.x,displayGroundY(o.x,o.y),o.w*.34,o.w*.25,0,0,Math.PI*2);ctx.setLineDash([4,4]);ctx.lineWidth=1.8;ctx.strokeStyle='#f8e2a0';ctx.stroke();}
  ctx.restore();}
 const waterStats=$('waterTransitionStats');if(waterStats){const modes=graph.seams.map(s=>window.VedrasCatalog.profile(catalog,effectiveBiome(s.c),effectiveBiome(s.n)).mode);
  waterStats.textContent=`Wasser-Sampling: ${state.waterSampling==='hex'?'Einmal pro Hex · ohne Bildwiederholung':'Legacy · weltweit wiederholt'} · Wasser ↔ Wasser: ${modes.filter(m=>m==='soft_water').length} Übergänge · Wasser ↔ Land: ${modes.filter(m=>m==='shoreline_required').length} Übergänge per Ufer-Overlay · Wasser bleibt bei allen fünf Hügelprofilen flach.`;}
 const label=$('autotileStats');if(label)label.textContent=`${graph.seams.filter(x=>x.kind==='biome').length} Biomkanten · ${graph.seams.filter(x=>x.kind==='variant').length} Variantengrenzen · ${graph.corners.length} Dreifachkontakte · ${state.edgeWidth} Einheiten Übergang · gemeinsame Pixelmischung · ${terrainRasterCache.buildMs?.toFixed(0)||"–"} ms Rasteraufbau`;
 const info=$('selectedTransitionInfo');if(info){const [sq,sr]=state.selected.split(',').map(Number),c=worldCells.find(x=>x.q===sq&&x.r===sr);
 if(c){const own=effectiveBiome(c),type=window.VedrasCatalog.terrainType(catalog,own);const neighbors=window.VedrasAutotile.DIRS.map(([dq,dr])=>worldCells.find(n=>n.q===sq+dq&&n.r===sr+dr)).filter(Boolean);
 info.innerHTML=`<b>Ausgewähltes Hex ${escapeHtml(state.selected)}:</b> ${escapeHtml(type?.name||'Nicht zugeordnet')}<br>`+
 neighbors.map(n=>{const t=effectiveBiome(n),p=window.VedrasCatalog.profile(catalog,own,t);return `Nachbar ${n.q},${n.r}: ${escapeHtml(window.VedrasCatalog.terrainType(catalog,t)?.name||'Nicht zugeordnet')} → ${escapeHtml(p.mode==='variant'?'Variante gleicher Art':p.mode==='soft_ground'?'Geländeartenübergang':p.mode==='soft_water'?'Weicher Wasserübergang':p.mode==='shoreline_required'?'Uferregel benötigt':'Profil fehlt')}`;}).join('<br>');}}
 if(state.edgeDebug&&['types','cores'].includes(state.transitionDebugMode)){
  ctx.save();for(const c of worldCells){const p=axialPos(c.q,c.r),type=effectiveBiome(c);
   if(state.transitionDebugMode==='cores'){ctx.beginPath();ctx.arc(p.x,p.y,Math.max(9,R*.28),0,Math.PI*2);ctx.strokeStyle='#24faea';ctx.setLineDash([3,3]);ctx.lineWidth=2;ctx.stroke();}
   else{ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#132a29cd';ctx.fillRect(p.x-79,p.y+51,158,22);ctx.fillStyle='#fff';ctx.fillText(type||'nicht zugeordnet',p.x,p.y+66);}}ctx.restore();}
 if(state.grid){for(const c of worldCells){const pts=hexPoints(c.q,c.r);ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<6;i++)ctx.lineTo(...pts[i]);ctx.closePath();
  ctx.strokeStyle=state.selected===key(c.q,c.r)?'#fff4ba':'rgba(45,87,57,.46)';ctx.lineWidth=state.selected===key(c.q,c.r)?2.4:1.15;ctx.stroke();}}
 const [q,r]=state.selected.split(',').map(Number);hexPath(q,r);ctx.fillStyle='rgba(246,237,153,.035)';ctx.fill();ctx.restore();
}

function smoothLine(pts,width,color){if(pts.length<2)return;ctx.beginPath();
 let first=true;for(let i=1;i<pts.length;i++){
  const a=pts[i-1],b=pts[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);const steps=state.relief.enabled?Math.ceil(length/9):1;
  for(let j=0;j<=steps;j++){if(i>1&&j===0)continue;const t=j/steps,x=a[0]+t*(b[0]-a[0]),y=a[1]+t*(b[1]-a[1]);
   if(first){ctx.moveTo(x,displayGroundY(x,y));first=false;}else ctx.lineTo(x,displayGroundY(x,y));}
 }
 ctx.lineWidth=width;ctx.strokeStyle=color;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
function drawRoads(){
 if(!state.river)return;
 ctx.save();ctx.setTransform(state.dpr,0,0,state.dpr,0,0);
 ctx.translate(W/2+state.panX,H/2+state.panY);ctx.scale(state.zoom,state.zoom*PROJECT_Y);
 const routes=riverRoutes(),byKey=new Map(worldCells.map(c=>[key(c.q,c.r),c]));
 for(const route of routes){
  const mouth=route.hexes.at(-1),cell=byKey.get(mouth.join(',')),water=cell?imageForBiome(cell):null;
  const width=clamp(Number(state.riverWidth)||32,12,70);
  // Raster is reused at every pan/zoom. The water sampler must come from
  // the actual mouth tile, not a fixed blue/sandy river bitmap.
  const signature=JSON.stringify({hexes:route.hexes,corner:route.corner,width,asset:water?.path,mtime:water?.mtime,img:water?.img?.naturalWidth||0,relief:state.relief,mask:'sdf-v5'});
  const cached=riverRasterCache.get(signature);
  if(cached)ctx.drawImage(cached.canvas,cached.x,cached.y,cached.width,cached.height);
  else{
   const rendered=window.VedrasRivers.render(ctx,route,worldCells,wetHex,water?.img,{width,groundY:state.relief.enabled?displayGroundY:null});
   if(rendered){riverRasterCache.set(signature,{canvas:rendered.canvas,x:rendered.x,y:rendered.y,width:rendered.widthWorld,height:rendered.heightWorld});
    if(riverRasterCache.size>40)riverRasterCache.delete(riverRasterCache.keys().next().value);}
  }
 }
 // Diagnostics and provisional editing follow real hex SIDES and CORNERS.
 if($('riverDebug')?.checked)for(const route of routes){
  for(const s of window.VedrasRivers.sections(route,worldCells,wetHex)){
   ctx.beginPath();
   for(const [i,p] of s.path.entries()){
    const y=displayGroundY(p.x,p.y);
    if(i===0)ctx.moveTo(p.x,y);else ctx.lineTo(p.x,y);
   }
   ctx.strokeStyle='rgba(250,250,156,.85)';ctx.lineWidth=2;
   ctx.setLineDash([5,5]);ctx.stroke();ctx.setLineDash([]);
   for(const [p,color] of [[s.start,s.corner===null?'#d7d4bc':'#f59c42'],[s.end,'#3bd8d2']]){
    ctx.beginPath();ctx.arc(p.x,displayGroundY(p.x,p.y),5,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
   }
  }
 }
 // The unfinished route highlights selected shared sides, never a phantom
 // river cutting across the middle of a terrain hex.
 if(Array.isArray(state.riverDraft)&&state.riverDraft.length){
  ctx.save();ctx.setLineDash([10,6]);ctx.lineCap='round';ctx.lineJoin='round';
  for(let i=1;i<state.riverDraft.length;i++){
   const [pq,pr]=state.riverDraft[i-1],[nq,nr]=state.riverDraft[i];
   const prev={q:pq,r:pr},next={q:nq,r:nr};
   const side=window.VedrasRivers.side(prev,next);if(side<0)continue;
   const vertices=window.VedrasRivers.vertices(prev),a=vertices[side],b=vertices[(side+1)%6];
   ctx.beginPath();ctx.moveTo(a.x,displayGroundY(a.x,a.y));ctx.lineTo(b.x,displayGroundY(b.x,b.y));
   ctx.lineWidth=7;ctx.strokeStyle='#d8fbef';ctx.stroke();
   ctx.lineWidth=4;ctx.strokeStyle='#287c96';ctx.stroke();
  }
  const [sq,sr]=state.riverDraft[0];
  for(const p of window.VedrasRivers.vertices({q:sq,r:sr})){
   ctx.beginPath();ctx.arc(p.x,displayGroundY(p.x,p.y),2.5,0,Math.PI*2);ctx.fillStyle='#68eecb';ctx.fill();
  }
  ctx.setLineDash([]);ctx.restore();
 }
 const road=[[1,-1],[0,0],[-1,1]].map(([q,r])=>{const p=axialPos(q,r);return [p.x,p.y];});
 smoothLine(road,18,'#9e8458');smoothLine(road,13,'#dab77e');
 ctx.restore();
}
function validMountains(){
 const lookup=new Map(worldCells.map(c=>[key(c.q,c.r),c]));
 return (state.mountainInstances||[]).filter(m=>{
  if(!Number.isInteger(m.q)||!Number.isInteger(m.r)||![1,2].includes(m.radius)||!useAsset(m.assetPath)?.img?.naturalWidth)return false;
  const meta=window.VedrasNature?.entryFor(useAsset(m.assetPath));if(meta?.kind!=='mountain')return false;
  return window.VedrasMountains.occupied(m).every(k=>{
   const cell=lookup.get(k);if(!cell)return false;
   const type=catalog.terrainTypes.find(t=>t.id===effectiveBiome(cell));
   const allowed=window.VedrasNatureCatalog.effectiveTypes(meta,catalog,window.VedrasNature.catalog());
   return type?.materialClass==='ground'&&allowed.has(type?.id);
  });
 });
}
function reservedMountainHexes(){return new Set(validMountains().flatMap(m=>window.VedrasMountains.occupied(m)));}
// Mountain shadows are procedural ground shapes. The PNG only determines
// the LEFT-FOOT contact point; it is no longer sheared into a hidden spike.
const mountainSilhouettes=new WeakMap();
function shadowSilhouette(img){
 if(mountainSilhouettes.has(img))return mountainSilhouettes.get(img);
 const b=visibleBounds(img),side=512,ratio=Math.min(1,side/Math.max(b.sw,b.sh));
 const cv=document.createElement('canvas');cv.width=Math.max(8,Math.round(b.sw*ratio));cv.height=Math.max(8,Math.round(b.sh*ratio));
 const g=cv.getContext('2d',{willReadFrequently:true});
 g.drawImage(img,b.sx,b.sy,b.sw,b.sh,0,0,cv.width,cv.height);
 // Keep the alpha channel and compute an anchor in the authored-foot band.
 let footprint=null;
 try{footprint=g.getImageData(0,0,cv.width,cv.height).data;}catch{}
 g.globalCompositeOperation='source-in';g.fillStyle='#203131';g.fillRect(0,0,cv.width,cv.height);
 const result={canvas:cv,aspect:b.sh/b.sw,footData:footprint,footCache:new Map()};
 mountainSilhouettes.set(img,result);return result;
}
function mountainShadowSettings(o){
 const placed=o.mountainInstance||{},preset=state.shadowAssetPresets?.[o.asset?.path]||{};
 const fields={opacity:'shadowOpacity',softness:'shadowSoftness',
  originX:'shadowOriginX',originY:'shadowOriginY',
  angle:'shadowAngle',length:'shadowLength',rootWidth:'shadowRootWidth',
  midWidth:'shadowMidWidth',tipWidth:'shadowTipWidth',
  contactWidth:'shadowContactWidth',contactLength:'shadowContactLength'};
 const cfg={...(state.mountainShadowDefaults||{}),...preset};
 if(Number.isFinite(preset.reach)&&!Number.isFinite(preset.length))cfg.length=preset.reach*.8;
 if(Number.isFinite(preset.spread)&&!Number.isFinite(preset.rootWidth))cfg.rootWidth=.26*preset.spread/1.28;
 if(Number.isFinite(preset.contact)&&!Number.isFinite(preset.contactWidth))cfg.contactWidth=.16*preset.contact/1.10;
 // Legacy instance reach/spread/contact remain readable if a new geometric
 // parameter was not explicitly authored on that particular instance.
 if(Number.isFinite(placed.shadowReach)&&!Number.isFinite(placed.shadowLength))cfg.length=placed.shadowReach*.8;
 if(Number.isFinite(placed.shadowSpread)&&!Number.isFinite(placed.shadowRootWidth))cfg.rootWidth=.26*placed.shadowSpread/1.28;
 if(Number.isFinite(placed.shadowContact)&&!Number.isFinite(placed.shadowContactWidth))cfg.contactWidth=.16*placed.shadowContact/1.10;
 for(const [k,name] of Object.entries(fields))if(Number.isFinite(placed[name]))cfg[k]=placed[name];
 return window.VedrasShadows.settings(cfg);
}
function sceneShadowStrength(){return window.VedrasShadows.globalStrength(state.shadowGlobal);}
function mountainOriginForObject(o,s,scale=1){
 const shadows=window.VedrasShadows,p=toScreen(o.x,o.y);
 const sprite=shadowSilhouette(o.asset.img),w=o.w*state.zoom*scale,h=w*sprite.aspect;
 const anchor=o.natureMeta?.anchor||{x:.5,y:.67};
 const footKey=(anchor.x??.5)+','+(anchor.y??.67);
 let foot=sprite.footCache.get(footKey);
 if(!foot){foot=shadows.alphaFoot(sprite.footData,sprite.canvas.width,sprite.canvas.height,anchor);sprite.footCache.set(footKey,foot);}
 return shadows.mountainOrigin({x:p.x*scale,y:p.y*scale},w,h,anchor,s,foot);
}
function drawMountainShadows(objects){
 const mts=objects.filter(o=>o.type==='mountain');
 if(!mts.length){window.__vedrasMountainShadowStats={count:0,maxAlpha:0,positiveCount:0};return;}
 const factor=.5,sw=Math.max(1,Math.ceil(W*factor)),sh=Math.max(1,Math.ceil(H*factor));
 const maxAlpha=new Uint8Array(sw*sh),scratch=document.createElement('canvas');
 scratch.width=sw;scratch.height=sh;
 const g=scratch.getContext('2d',{willReadFrequently:true}),shadows=window.VedrasShadows;
 for(const o of mts){
  const settings=mountainShadowSettings(o);
  if(settings.opacity<=0||sceneShadowStrength()<=0)continue;
  const origin=mountainOriginForObject(o,settings,factor),w=o.w*state.zoom*factor;
  g.clearRect(0,0,sw,sh);
  shadows.paintMountain(g,origin,w,{...settings,softness:settings.softness*factor},sceneShadowStrength());
  const layer=g.getImageData(0,0,sw,sh).data;
  // MAX union, never accumulate black bands between touching mountains.
  for(let i=0,j=3;i<maxAlpha.length;i++,j+=4)
   if(layer[j]>maxAlpha[i])maxAlpha[i]=layer[j];
 }
 const image=g.createImageData(sw,sh);
 for(let i=0,j=0;i<maxAlpha.length;i++,j+=4){
  image.data[j]=shadows.COLOR.r;image.data[j+1]=shadows.COLOR.g;
  image.data[j+2]=shadows.COLOR.b;image.data[j+3]=maxAlpha[i];
 }
 g.clearRect(0,0,sw,sh);g.putImageData(image,0,0);
 ctx.save();ctx.globalCompositeOperation='source-over';ctx.filter='none';ctx.globalAlpha=1;
 ctx.drawImage(scratch,0,0,W,H);ctx.restore();
 let peakAlpha=0,positiveCount=0;
 for(const alpha of maxAlpha){if(alpha>peakAlpha)peakAlpha=alpha;if(alpha>2)positiveCount++;}
 window.__vedrasMountainShadowStats={
  count:mts.length,maxAlpha:peakAlpha,positiveCount,dimensions:[sw,sh],
  projection:'alpha-foot / diagonal-procedural-ground-shadow'
 };
}
function drawMountainShadowGuide(mountains){
 const shadows=window.VedrasShadows;
 ctx.save();ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.strokeStyle='rgba(255,210,118,.95)';
 ctx.fillStyle='#fff0ae';ctx.font='12px system-ui';
 for(const o of mountains){
  const s=mountainShadowSettings(o),w=o.w*state.zoom;
  const origin=mountainOriginForObject(o,s),shape=shadows.mountainShape(origin,w,s);
  const base={x:shape.normal.x*shape.radius[0],y:shape.normal.y*shape.radius[0]};
  ctx.beginPath();ctx.moveTo(origin.x-base.x,origin.y-base.y);
  ctx.lineTo(origin.x+base.x,origin.y+base.y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.lineTo(shape.p1.x,shape.p1.y);
  ctx.lineTo(shape.p2.x,shape.p2.y);ctx.stroke();
  for(const [p,r] of [[origin,shape.radius[0]],[shape.p1,shape.radius[1]],[shape.p2,shape.radius[2]]]){
   ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.stroke();
  }
  ctx.beginPath();ctx.arc(origin.x,origin.y,5,0,Math.PI*2);ctx.fill();
  ctx.fillText('Schattenbasis',origin.x-30,origin.y-12);
 }
 ctx.setLineDash([]);ctx.restore();
}
function drawMountainFootprints(){
 if(!state.mountainDebug)return;
 ctx.save();ctx.setTransform(state.dpr,0,0,state.dpr,0,0);
 ctx.translate(W/2+state.panX,H/2+state.panY);ctx.scale(state.zoom,state.zoom*PROJECT_Y);
 for(const m of validMountains()){
  ctx.lineWidth=1.6;ctx.setLineDash([6,7]);ctx.strokeStyle='#f9c46d';ctx.fillStyle='rgba(245,168,70,.025)';
  for(const c of window.VedrasMountains.cells(m.q,m.r,m.radius)){
   const pts=hexPoints(c.q,c.r);ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<6;i++)ctx.lineTo(...pts[i]);ctx.closePath();ctx.fill();ctx.stroke();
  }
  ctx.lineWidth=2.7;ctx.setLineDash([]);ctx.strokeStyle='#ff725f';ctx.fillStyle='rgba(245,75,60,.13)';
  for(const k of window.VedrasMountains.occupied(m)){
   const [q,r]=k.split(',').map(Number),pts=hexPoints(q,r);ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<6;i++)ctx.lineTo(...pts[i]);ctx.closePath();ctx.fill();ctx.stroke();
  }
  const anchor=axialPos(m.q,m.r);ctx.beginPath();ctx.arc(anchor.x,displayGroundY(anchor.x,anchor.y+20),6,0,Math.PI*2);ctx.fillStyle='#ffec99';ctx.fill();
  if(m.mode==='chain'){ctx.font='bold 11px sans-serif';ctx.fillStyle='#fff5b4';ctx.fillText(m.chainId||'Kette',anchor.x+12,displayGroundY(anchor.x,anchor.y+20)-8);}
 }
 ctx.restore();
}
function genericObjects(){const objs=[];const blocked=reservedMountainHexes();
 if(state.showLegacyNature!==false)for(const c of worldCells){if(blocked.has(key(c.q,c.r)))continue;if(c.biome==='forest')for(let j=0;j<4;j++){const a=rnd(c.q,c.r,j+40)*Math.PI*2,rad=38+rnd(c.q,c.r,j+70)*78,p=axialPos(c.q,c.r);
 const x=p.x+Math.cos(a)*rad,y=p.y+Math.sin(a)*rad;if(Math.hypot(x,y-50)<126)continue;
 objs.push({asset:findAsset('nature',j%2?'pine_02':'pine_01'),x,y,w:29,type:'nature'});}
 if(c.biome==='mountain' || c.biome==='hills'){const p=axialPos(c.q,c.r);
 const a=findAsset('nature',c.biome==='mountain'?'hill_01':'rock_02');if(a)objs.push({asset:a,x:p.x+30,y:p.y+38,w:c.biome==='mountain'?153:65,type:'nature'});}
 }
 if(state.showLegacyNature!==false&&!blocked.has(window.VedrasAutotile.hexAt(113,-32))){const ore=findAsset('nature','ore_iron');if(ore)objs.push({asset:ore,x:113,y:-32,w:68,type:'nature'});}
 const a=findAsset('buildings','mine_lvl01__main');if(a&&!blocked.has('0,0'))objs.push({asset:a,x:0,y:52,w:160,type:'building',cell:'0,0'});
 const army=findAsset('units','expedition');const ep=axialPos(1,0);if(army&&!blocked.has('1,0'))objs.push({asset:army,x:ep.x-35,y:ep.y+50,w:44,type:'unit'});
 for(const [k,values] of Object.entries(state.hexObject)){
  const [q,r]=k.split(',').map(Number);const c=worldCells.find(c=>c.q===q&&c.r===r);if(!c||blocked.has(k))continue;const a=useAsset(values.path);if(!a)continue;
  if(a.category==='nature'){
   const meta=window.VedrasNature?.entryFor(a);
   if(!meta||window.VedrasNature?.eligible(meta,q,r)===false)continue;
  }
  const p=axialPos(q,r),natureMeta=a.category==='nature'?window.VedrasNature?.entryFor(a):null;
  const authoredWidth=values.width??(a.category==='buildings'?160:80);
  const balancedWidth=a.category==='nature'?authoredWidth*(window.VedrasNatureBalance?.sizeFactor(natureMeta)??.85):authoredWidth;
  const obj={asset:a,x:p.x,y:p.y+52,w:balancedWidth,type:a.category==='buildings'?'building':'nature',natureMeta,cell:k};
  if(k==='0,0'){
    const old=objs.findIndex(o=>o.cell==='0,0');if(old>=0)objs.splice(old,1);
  }
  objs.push(obj);
 }
 // Nature objects are independent per-instance; their picture anchor is stored in the Nature catalog.

 for(const n of (state.natureInstances||[])){
   if(blocked.has(key(n.q,n.r)))continue;
   if(window.VedrasNature?.validInstance(n)===false)continue;
   const a=useAsset(n.assetPath);if(!a)continue;
   const m=window.VedrasNature?.entryFor(a);if(!m)continue;
   const p=axialPos(n.q,n.r);
   const crop=visibleBounds(a.img);const baseWidth=window.VedrasSpritePlanner?.visualWidth(m,a.img,crop)??m.logicalWidth;
   // Keep author-defined catalog dimensions editable; apply the shared map
   // composition factor to both old saved and newly generated instances.
   const balance=window.VedrasNatureBalance?.sizeFactor(m)??1;
   objs.push({asset:a,x:p.x+n.dx,y:p.y+n.dy,w:baseWidth*n.scale*balance,type:'nature',natureMeta:m,cell:key(n.q,n.r)});
 }
 for(const m of validMountains()){
  const a=useAsset(m.assetPath),meta=window.VedrasNature.entryFor(a),p=axialPos(m.q,m.r);
  objs.push({asset:a,x:p.x,y:p.y+20,w:meta.logicalWidth,type:'mountain',natureMeta:meta,mountainInstance:m,cell:key(m.q,m.r)});
 }
 // Legacy/demo objects are not catalogued: still keep their foot anchors
 // outside the real water-channel mask. Buildings and units are unchanged.
 return objs.filter(o=>o.type!=='nature'||!window.VedrasRivers.blocksPoint(o.x,o.y,
  state.riverPaths||[],worldCells,wetHex,Number(state.riverWidth)||32,Math.min(28,(o.w||52)*.14)+5));}
function pairedShadow(obj){if(obj.cell&&state.hexShadow[obj.cell])return useAsset(state.hexShadow[obj.cell]);
 const natureShadow=obj.natureMeta?.shadow;
 if(natureShadow){if(natureShadow.mode==='none')return null;const path=natureShadow.mode==='custom'?natureShadow.path:'shadows/'+natureShadow.mode+'.png';return useAsset('assets/'+path)||null;}
 const meta=obj.asset?.meta||{};if(meta.shadowSprite){const path=String(meta.shadowSprite);return useAsset(path)||useAsset('assets/'+path)||useAsset('assets/'+obj.asset.category+'/'+path);}
 return null;}
// Normalized visible silhouette: ignore large transparent PNG margins when placing Nature sprites.
const natureBounds=new WeakMap();
function visibleBounds(img){
 if(natureBounds.has(img))return natureBounds.get(img);
 const w=img.naturalWidth,h=img.naturalHeight;
 let bounds={sx:0,sy:0,sw:w,sh:h};
 try{const limit=256,scale=Math.min(1,limit/Math.max(w,h)),cw=Math.max(1,Math.round(w*scale)),ch=Math.max(1,Math.round(h*scale));
  const canvas=document.createElement('canvas');canvas.width=cw;canvas.height=ch;
  const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0,cw,ch);
  const a=c.getImageData(0,0,cw,ch).data;let left=cw,top=ch,right=-1,bottom=-1;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(a[(y*cw+x)*4+3]>12){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(right>=left&&bottom>=top){const sx=Math.max(0,(left-.5)*w/cw),sy=Math.max(0,(top-.5)*h/ch);
   bounds={sx,sy,sw:Math.min(w-sx,(right-left+2)*w/cw),sh:Math.min(h-sy,(bottom-top+2)*h/ch)};}
 }catch(e){/* SVG, opaque or canvas restrictions: preserve full geometry. */}
 natureBounds.set(img,bounds);return bounds;
}
function drawSprite(obj){if(!obj.asset?.img?.naturalWidth)return;const p=toScreen(obj.x,obj.y),width=obj.w*state.zoom;
 const b=obj.natureMeta?visibleBounds(obj.asset.img):{sx:0,sy:0,sw:obj.asset.img.naturalWidth,sh:obj.asset.img.naturalHeight};
 const height=width*b.sh/b.sw,anchor=obj.natureMeta?.anchor||obj.asset.meta?.anchor||{x:.5,y:.96};
 const ax=Number.isFinite(Number(anchor.x))?clamp(Number(anchor.x),0,1):.5;
 const ay=Number.isFinite(Number(anchor.y))?clamp(Number(anchor.y),0,1):.96;
 ctx.save();ctx.globalCompositeOperation='source-over';
 ctx.filter=obj.natureMeta?window.VedrasPolish.natureFilter(obj.natureMeta,state.visualPolish.nature):'none';
 ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.shadowColor='transparent';
 ctx.drawImage(obj.asset.img,b.sx,b.sy,b.sw,b.sh,p.x-width*ax,p.y-height*ay,width,height);ctx.restore();
}
function drawNatureShadow(sh,obj,p){
 const meta=obj.natureMeta.shadow||{};const ww=obj.w*state.zoom;
 const sw=ww*Math.max(.52,meta.widthScale??.70),hh=ww*Math.max(.15,meta.depthScale??.18);
 const centerX=p.x+ww*(meta.offsetX??-.24),centerY=p.y+ww*(meta.offsetY??0)*PROJECT_Y+ww*.035;
 const b=visibleBounds(sh.img);
 // Respect separately authored shadow artwork, but strengthen its terrain
 // integration. A generic shadow image is supplementary, never the only
 // contact/cast layer.
 ctx.save();ctx.globalAlpha=.65*sceneShadowStrength();
 ctx.drawImage(sh.img,b.sx,b.sy,b.sw,b.sh,centerX-sw*.5,centerY-hh*.5,sw,hh);
 ctx.restore();
 if(state.natureShadowDebug){ctx.save();ctx.strokeStyle='#f9ef9a';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#ef79b6';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(centerX,centerY);ctx.stroke();ctx.restore();}
}
function drawNatureGrounding(obj,p){
 if(!obj.natureMeta)return;
 const meta=obj.natureMeta,kind=meta.kind,ww=obj.w*state.zoom;
 const strength=kind==='ground_cover'?.32:kind==='tree'?1:.76;
 window.VedrasShadows.contact(ctx,p,ww,'nature',strength*sceneShadowStrength());
 if(kind!=='tree'&&kind!=='shrub'&&kind!=='cluster')return;
 const silhouette=shadowSilhouette(obj.asset.img),height=ww*silhouette.aspect;
 // Taller trees cast more than bushes; both share one global light source.
 const reach=kind==='tree'?.92:.55;
 const alpha=kind==='tree'?.38:.25;
 window.VedrasShadows.cast(ctx,silhouette,p,ww,height,
  meta.anchor||{x:.5,y:.96},reach,'nature',alpha*sceneShadowStrength(),
  Math.min(8,Math.max(2,ww*.045)));
}

// If a neighboring tree is projected on top of an opaque mountain, render it
// behind that mountain; the tree is NOT deleted and the neighboring hex stays usable.
const mountainAlphaCache=new WeakMap();
function mountainCoversBase(plant,mountain){
 const img=mountain.asset?.img;if(!img?.naturalWidth||!plant||plant.type==='mountain')return false;
 const b=visibleBounds(img),ground=toScreen(plant.x,plant.y),p=toScreen(mountain.x,mountain.y);
 const width=mountain.w*state.zoom,height=width*b.sh/b.sw,a=mountain.natureMeta?.anchor||{x:.5,y:.67};
 const u=(ground.x-(p.x-width*(a.x??.5)))/width,v=(ground.y-(p.y-height*(a.y??.67)))/height;
 if(u<0||u>=1||v<0||v>=1)return false;
 try{
  let raster=mountainAlphaCache.get(img);
  if(!raster){const can=document.createElement('canvas');can.width=can.height=64;const g=can.getContext('2d',{willReadFrequently:true});g.drawImage(img,b.sx,b.sy,b.sw,b.sh,0,0,64,64);raster=g.getImageData(0,0,64,64).data;mountainAlphaCache.set(img,raster);}
  return raster[(Math.min(63,Math.floor(v*64))*64+Math.min(63,Math.floor(u*64)))*4+3]>50;
 }catch{return false;}
}
function drawMapObjects(){if(!state.objects)return;
 const objs=genericObjects().filter(o=>o.asset?.img?.naturalWidth).map(o=>{
  const heightAdjusted=displayGroundY(o.x,o.y);
  return {...o,groundY:o.y,y:heightAdjusted,sortY:toScreen(o.x,heightAdjusted).y};
 });
 if(state.mode==='far'){
   // Far view deliberately uses simplified strategic markers, not the detailed sprites.
   for(const o of objs){if(o.type!=='building'&&o.type!=='unit'&&o.type!=='mountain')continue;const p=toScreen(o.x,o.y);
    if(o.type==='mountain'){ctx.fillStyle='#e8f2f8';const scale=Math.max(11,30*state.zoom);ctx.beginPath();ctx.moveTo(p.x-scale,p.y+scale*.5);ctx.lineTo(p.x,p.y-scale);ctx.lineTo(p.x+scale,p.y+scale*.5);ctx.closePath();ctx.fill();}
    else if(o.type==='building'){ctx.fillStyle='#e6d2b4';ctx.strokeStyle='#654d3c';const s=Math.max(10,22*state.zoom);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-s,p.y-s*.5);ctx.lineTo(p.x,p.y-s*1.8);ctx.lineTo(p.x+s,p.y-s*.5);ctx.lineTo(p.x+s,p.y+s*.4);ctx.lineTo(p.x-s,p.y+s*.4);ctx.closePath();ctx.fill();ctx.stroke();}
    else{ctx.beginPath();ctx.arc(p.x,p.y-8,6,0,Math.PI*2);ctx.fillStyle='#3b71b2';ctx.fill();ctx.strokeStyle='#ecf6fc';ctx.lineWidth=2;ctx.stroke();}
   }
   ctx.textAlign='center';ctx.font='700 11px system-ui';for(const c of worldCells){const p=axialPos(c.q,c.r),s=toScreen(p.x,p.y+105);const text=c.q===0&&c.r===0?'MINE':c.name.toUpperCase();const width=ctx.measureText(text).width+11;ctx.fillStyle='#1e3e33bd';ctx.fillRect(s.x-width/2,s.y-12,width,19);ctx.fillStyle='#f1f7e6';ctx.fillText(text,s.x,s.y+2);}ctx.textAlign='left';return;}
  // A base point intersecting the mountain's opaque silhouette is occluded,
  // even when that Nature sprite originates from a legal neighboring hex.
  const mountains=objs.filter(o=>o.type==='mountain');
  for(const o of objs)if(o.type==='nature'&&mountains.some(m=>mountainCoversBase(o,m)))o.occludedByMountain=true;
  // Painter order follows the ACTUAL projected ground-foot height, including
  // relief displacement. A mountain only covers a neighbor when the neighbor's
  // foot intersects that particular mountain's opaque silhouette.
  objs.sort((a,b)=>{
   if(a.type==='mountain'&&b.occludedByMountain&&mountainCoversBase(b,a))return 1;
   if(b.type==='mountain'&&a.occludedByMountain&&mountainCoversBase(a,b))return -1;
   return a.sortY-b.sortY||(a.x-b.x);
  });
  // Ground shadows FIRST: a foreground tree must not paint its shadow
  // across the already rendered canopy of a tree behind it.
  drawMountainShadows(objs);
  if(state.mountainShadowDebug){
   drawMountainShadowGuide(objs.filter(o=>o.type==='mountain'));
   return;
  }
  for(const o of objs){
   const p=toScreen(o.x,o.y);
   if(p.x<-450||p.x>W+450||p.y<-450||p.y>H+450||o.type==='mountain')continue;
   if(o.natureMeta)drawNatureGrounding(o,p);
   else if(o.type==='building'){
    const w=o.w*state.zoom,preset=state.shadowAssetPresets?.[o.asset.path]||{};
    const shape=window.VedrasShadows.settings({opacity:.37,reach:.55,spread:1.05,originX:-.06,originY:0,contact:.75,...preset});
    window.VedrasShadows.contact(ctx,p,w,'nature',.65*sceneShadowStrength(),shape);
    const silhouette=shadowSilhouette(o.asset.img),height=w*silhouette.aspect;
    window.VedrasShadows.cast(ctx,silhouette,p,w,height,o.asset.meta?.anchor||{x:.5,y:.90},shape.reach,'nature',
      shape.opacity*sceneShadowStrength()*.8,shape.softness*.5,shape);
   }
   else if(o.type==='unit')window.VedrasShadows.contact(ctx,p,o.w*state.zoom,'nature',.35*sceneShadowStrength());
   const sh=pairedShadow(o);
   if(sh?.img?.naturalWidth){
    if(o.natureMeta)drawNatureShadow(sh,o,p);
    else{
     const ww=o.w*state.zoom,hh=ww*sh.img.naturalHeight/sh.img.naturalWidth;
     const anchor=sh.meta?.anchor||{x:.5,y:.5};
     ctx.save();ctx.globalAlpha=sceneShadowStrength()*.65;
     ctx.drawImage(sh.img,p.x-ww*anchor.x,p.y-hh*anchor.y,ww,hh);ctx.restore();
    }
   }
  }
  // Real sprites are sorted by projected ground foot AFTER the shadow layer.
  for(const o of objs){
   const p=toScreen(o.x,o.y);
   if(p.x<-450||p.x>W+450||p.y<-450||p.y>H+450)continue;
   drawSprite(o);
  }
  if(state.shadowHandles)drawMountainShadowGuide(objs.filter(o=>o.type==='mountain'));
}
function drawBounds(){if(!state.bounds)return;const [q,r]=state.selected.split(',').map(Number),p=axialPos(q,r),s=toScreen(p.x,p.y+52),half=96*state.zoom,full=128*state.zoom;
 ctx.save();ctx.fillStyle='#d69b3b33';ctx.fillRect(s.x-full,s.y-290*state.zoom,(full-half),290*state.zoom);ctx.fillRect(s.x+half,s.y-290*state.zoom,full-half,290*state.zoom);
 ctx.strokeStyle='#e6ae5d';ctx.setLineDash([6,5]);ctx.lineWidth=1.7;ctx.strokeRect(s.x-half,s.y-290*state.zoom,half*2,290*state.zoom);ctx.setLineDash([]);ctx.restore();}
function drawForestDebug(){
 if(!state.forest?.debug)return;
 ctx.save();ctx.setTransform(state.dpr,0,0,state.dpr,0,0);
 ctx.translate(W/2+state.panX,H/2+state.panY);ctx.scale(state.zoom,state.zoom*PROJECT_Y);
 for(const cell of forestCells()){
  if(!cell.jungle&&cell.density<=0.005)continue;
  const p=axialPos(cell.q,cell.r),points=hexPoints(cell.q,cell.r);
  ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<6;i++)ctx.lineTo(...points[i]);ctx.closePath();
  ctx.fillStyle=cell.jungle?'rgba(24,115,75,.35)':cell.forestClass==='dense_forest'?'rgba(32,110,55,.24)':cell.forestClass==='light_forest'?'rgba(112,162,56,.22)':'rgba(152,184,69,.12)';
  ctx.fill();ctx.strokeStyle=cell.jungle?'#31ba84':cell.forestClass==='dense_forest'?'#398c4b':cell.forestClass==='light_forest'?'#9bb764':'#becb72';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#f5f8e8';ctx.font='14px sans-serif';ctx.textAlign='center';
  ctx.fillText(cell.jungle?'Dschungel':cell.forestClass==='dense_forest'?'Dicht':cell.forestClass==='light_forest'?'Licht':'Rand',p.x,p.y+5);
 }
 ctx.restore();
}
function draw(){if(!ctx||!canvas.width)return;ctx.setTransform(state.dpr,0,0,state.dpr,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.clearRect(0,0,W,H);drawGround();drawRoads();drawForestDebug();drawMapObjects();drawMountainFootprints();drawBounds();
 $('modeBadge').textContent=state.mode==='normal'?'NORMAL':'FERNANSICHT';}
function updateDiagnostics(){const pixels=canvas.width*canvas.height,mb=(pixels*4/1048576).toFixed(1);$('renderStats').textContent=`Canvas ${canvas.width}×${canvas.height} px · ${state.dpr.toFixed(2)}× Pixelratio · ${mb} MiB Bildpuffer`;
 const a=useAsset(state.asset);if(!a?.img?.naturalWidth){$('sharpnessInfo').textContent='Bitte eine Grafik auswählen.';return;}
 const isSvg=a.name.toLowerCase().endsWith('.svg');const meta=a.meta||{};const terrain=isTerrain(a);
 const logical=terrain?(Number(state.materialScales[a.path]||meta.textureWorldSize)||256):(Number(meta.logicalWidth)||state.width);
 const required=logical*state.zoom*state.dpr;
 const density=a.img.naturalWidth/Math.max(1,required);
 $('sharpnessInfo').innerHTML=`Quellauflösung: <strong>${a.img.naturalWidth}×${a.img.naturalHeight}</strong> px<br>Aktuelle Bildpufferauflösung: <strong>${state.dpr.toFixed(2)}×</strong><br>`+
 (isSvg?'Vektorgrafik: in dieser Darstellung ohne quellbedingtes Rasterlimit.':`Quellpixel pro Ausgabepixel bei ${terrain?"Terrainmaterial":"Objektbreite"} ${logical}: <strong>${density.toFixed(2)}×</strong> (${density>=1?'ausreichende Quelldichte':'Hochskalierung – kann weich wirken'})`)+
 '<br>Hinweis: hohe Quelldichte garantiert keine feinen Details in einer KI-Illustration.';
}
function applyZoom(zoom,pivotX=W/2,pivotY=H/2){zoom=clamp(zoom,ZMIN,ZMAX);const world=fromScreen(pivotX,pivotY);state.zoom=zoom;state.panX=pivotX-W/2-world.x*zoom;state.panY=pivotY-H/2-world.y*PROJECT_Y*zoom;
 if(state.mode==='normal'&&state.zoom<FAR_ENTER)state.mode='far';else if(state.mode==='far'&&state.zoom>FAR_LEAVE)state.mode='normal';$('zoomSlider').value=Math.round(zoom*100);$('zoomText').textContent=Math.round(zoom*100)+' %';requestDraw();updateDiagnostics();}
function setView(view){state.view=view;for(const [id,name] of [['viewMap','map'],['viewSolo','solo'],['viewCompare','compare']])$(id).classList.toggle('active',view===name);
 $('mapCanvas').classList.toggle('hidden',view!=='map');$('mapLegend').classList.toggle('hidden',view!=='map');$('mapFooter').classList.toggle('hidden',view!=='map');
 $('soloPane').classList.toggle('hidden',view!=='solo');$('comparePane').classList.toggle('hidden',view!=='compare');if(view==='map')resize();}
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function setSelectedAsset(path){state.asset=path;const a=useAsset(path);if(!a)return;
 $('selectedName').textContent=a.name;$('selectedPath').textContent=a.relPath;
 $('previewImg').src=a.url;$('soloImage').src=a.url;$('soloEmpty').classList.add('hidden');
 const meta=a.meta||{},isBuilding=a.category==='buildings'||meta.category==='building',terrain=isTerrain(a),isReference=a.category==='references'||meta.assetType==='concept_hex'||meta.assetType==='legacy_hex_block';const logical=Number(meta.logicalWidth)||(isBuilding?160:80);
 $('spriteWidth').max=isBuilding?192:350;$('spriteWidth').min=isBuilding?24:16;$('spriteWidth').value=clamp(logical,Number($('spriteWidth').min),Number($('spriteWidth').max));state.width=Number($('spriteWidth').value);$('widthText').textContent=terrain?'Hexgeometrie: automatisch':String(state.width);$('spriteWidth').disabled=terrain;
 $('assetInfo').innerHTML=`<strong>Geländeart:</strong> ${escapeHtml(window.VedrasCatalog.terrainType(catalog,typeOfAsset(a))?.name||'Nicht zugeordnet')}<br><strong>Kategorie:</strong> ${escapeHtml(a.category)}<br><strong>Pixel:</strong> ${a.img?.naturalWidth||'?'} × ${a.img?.naturalHeight||'?'}<br><strong>Metadaten:</strong> ${Object.keys(meta).length?'vorhanden':'noch keine JSON-Datei'}<br><strong>Status:</strong> ${escapeHtml(meta.artStatus||'Testgrafik')}<br><strong>Schatten:</strong> ${escapeHtml(meta.shadowMode||'nicht festgelegt')}`;
 const verdict=terrain?a.terrainCheck:null;
 $('terrainValidation').classList.toggle('hidden',!terrain&&!isReference);
 $('terrainValidation').classList.toggle('warning',isReference||(terrain&&!verdict?.ok));
 $('terrainValidation').classList.toggle('passed',terrain&&!!verdict?.ok);
 $('terrainValidation').textContent=isReference?'Nur Stil-/Konzeptreferenz: kein Terrain-Base-Asset. Nicht für die Karte verwendbar.':terrain?(verdict?.ok?'Terrain Base · geeignetes Bildformat. ':'Nicht kompatibel als Terrain Base. ')+(verdict?.reason||'Unbekannte Prüfung.'):'';
 $('placeHex').disabled=isReference||(terrain&&(!verdict?.ok||!typeOfAsset(a)));$('placeBiome').disabled=isReference||(terrain&&(!verdict?.ok||!typeOfAsset(a)));
 $('assetTerrainTypeRow').classList.toggle('hidden',!terrain);$('assetTerrainType').value=typeOfAsset(a)||'';
 $('materialScaleRow').classList.toggle('hidden',!terrain);if(terrain){const size=Number(state.materialScales[a.path]||meta.textureWorldSize)||256;$('materialScale').value=clamp(size,160,768);$('materialScaleLabel').textContent=String($('materialScale').value);}
 window.VedrasNature?.onSelect(a);
 $('soloMeta').textContent=`${a.name}\n${a.img?.naturalWidth||'?'} × ${a.img?.naturalHeight||'?'} px\n${a.relPath}`;
 renderAssetsList();updateDiagnostics();}
function renderAssetsList(){
 const filter=$('categoryFilter').value,q=$('assetSearch').value.trim().toLowerCase();
 const listed=assets.filter(a=>(filter==='all'||a.category===filter)&&(!q||a.relPath.toLowerCase().includes(q)));
 const groups=new Map();for(const a of listed){let tag=a.category==='terrain'?(typeOfAsset(a)||'unassigned'):(a.category==='nature'?'nature_'+(window.VedrasNature?.entryFor(a)?.family||'unassigned'):'other_'+a.category);
  if(!groups.has(tag))groups.set(tag,[]);groups.get(tag).push(a);}
 const list=$('assetList');list.innerHTML='';
 let openState={};try{openState=JSON.parse(localStorage.getItem('vedras_library_groups')||'{}');}catch{}
 function appendGroup(id,name,items){if(!items?.length)return;
  const details=document.createElement('details');details.className='asset-group';
  const hasSelected=items.some(a=>a.path===state.asset);details.open=q?true:(openState[id]===true||hasSelected);
  const summary=document.createElement('summary');summary.textContent=`${name} · ${items.length}`;details.append(summary);
  const body=document.createElement('div');body.className='asset-group-content';
  for(const a of items){const button=document.createElement('button');button.className='asset-card'+(a.path===state.asset?' selected':'');
   const img=document.createElement('img');img.className='asset-thumb';img.src=a.url;
   const box=document.createElement('div');box.innerHTML=`<div class="asset-title">${escapeHtml(a.name)}</div><div class="asset-desc">${escapeHtml(a.meta?.artStatus||'Testdatei')} · ${a.img?.naturalWidth||'…'} px</div>`;
   button.append(img,box);button.addEventListener('click',()=>setSelectedAsset(a.path));body.append(button);}
  details.append(body);details.addEventListener('toggle',()=>{if(!q){openState[id]=details.open;try{localStorage.setItem('vedras_library_groups',JSON.stringify(openState));}catch{}}});list.append(details);
 }
 for(const cat of catalog.categories)for(const type of catalog.terrainTypes.filter(t=>t.categoryId===cat.id))appendGroup(type.id,`${cat.name} / ${type.name}`,groups.get(type.id));
 appendGroup('unassigned','Nicht zugeordnet',groups.get('unassigned'));
 for(const [tag,g] of groups)if(tag.startsWith('nature_'))appendGroup(tag,'NATURE / '+(tag.slice(7)==='unassigned'?'Noch ohne Metadaten':tag.slice(7)),g);
 for(const [tag,g] of groups)if(tag.startsWith('other_'))appendGroup(tag,tag.slice(6),g);
 if(!listed.length)list.innerHTML='<p class="muted">Keine passenden Bilder gefunden.</p>';
}
function assignCompare(which){if(!state.asset)return;state[which]=state.asset;const a=useAsset(state.asset);$(which==='compareA'?'compareA':'compareB').src=a.url;$(which==='compareA'?'compareALabel':'compareBLabel').textContent=a.name;setView('compare');}
function applySelected(toBiome){const a=useAsset(state.asset);if(!a)return;if(a.category==='references'||a.meta?.assetType==='concept_hex'||a.meta?.assetType==='legacy_hex_block'){alert('Dies ist nur eine Grafikreferenz und keine Terrain- oder Objektdatei für die Karte.');return;}const c=worldCells.find(c=>key(c.q,c.r)===state.selected);if(!c)return;
 if(!isTerrain(a)&&reservedMountainHexes().has(state.selected)){alert('Dieses Hex gehört zu einer Bergstandfläche. Entferne zuerst den Berg oder wähle ein anderes Hex.');return;}
 if(isTerrain(a)){
    if(!isTerrainValid(a)||!typeOfAsset(a)){alert('Nicht als Terrain Base zulässig oder nicht zugeordnet: '+(a.terrainCheck?.reason||'Unbekannte Bildgeometrie'));return;}
    if(toBiome)state.biomeTerrain[c.biome]=a.path;
    else{
     // Remember the ecological habitat when only forest-floor artwork is painted.
     const previous=baseBiomeOf(c),next=typeOfAsset(a);
     state.baseBiomeByHex[state.selected]=next==='forest_floor'?previous:next;
     state.hexTerrain[state.selected]=a.path;
    }
    stampCache.clear();invalidateTerrain();window.dispatchEvent(new Event('vedras:terrain-catalog-changed'));
 }else if(a.category==='shadows'){state.hexShadow[state.selected]=a.path;}
 else if(!toBiome&&a.category==='nature'){window.VedrasNature?.placeSelected();return;}
 else if(!toBiome){state.hexObject[state.selected]={path:a.path,width:state.width};}
 else{alert('„Als Biom-Grundlage“ ist nur für Terrain-Texturen gedacht.');return;}
 persistScene();setView('map');requestDraw();}
function clearCell(){state.natureInstances=(state.natureInstances||[]).filter(n=>key(n.q,n.r)!==state.selected);window.VedrasNature?.renderPlaced();delete state.hexTerrain[state.selected];delete state.baseBiomeByHex[state.selected];window.dispatchEvent(new Event('vedras:terrain-catalog-changed'));delete state.hexObject[state.selected];delete state.hexShadow[state.selected];persistScene();requestDraw();}
const savedFields=['terrainTest','relief','natureInstances','mountainInstances','mountainDebug','mountainMode','mountainChainId','mountainSpacing','mountainShadowDefaults','mountainShadowDebug','shadowGlobal','shadowAssetPresets','shadowHandles','showLegacyNature','natureSeed','forest','river','riverPaths','riverWidth','riverDebug','hexTerrain','biomeTerrain','baseBiomeByHex','hexObject','hexShadow','sceneSize','materialScales','visualPolish','edgeBlend','blendVariants','waterSampling','edgeWidth','edgeDebug','edgeIrregularity','cornerBlend','transitionDebugMode','shoreline'];
function persistScene(){try{const d={};for(const k of savedFields)d[k]=state[k];localStorage.setItem('vedras_asset_labor_v10',JSON.stringify(d));}catch{}}
function restoreScene(){try{const d=JSON.parse((localStorage.getItem('vedras_asset_labor_v10')||localStorage.getItem('vedras_asset_labor_v09')||localStorage.getItem('vedras_asset_labor_v08')||localStorage.getItem('vedras_asset_labor_v07')||localStorage.getItem('vedras_asset_labor_v06')||'{}'));for(const k of savedFields)if(d[k]!==undefined)state[k]=d[k];}catch{}state.baseBiomeByHex=state.baseBiomeByHex&&typeof state.baseBiomeByHex==='object'?state.baseBiomeByHex:{};state.visualPolish=window.VedrasPolish.valid(state.visualPolish);state.relief=window.VedrasRelief.valid(state.relief);state.forest=window.VedrasForest.valid(state.forest);state.riverPaths=Array.isArray(state.riverPaths)?state.riverPaths:[];state.riverWidth=clamp(Number(state.riverWidth)||40,12,70);state.mountainSpacing=['tight','normal','wide'].includes(state.mountainSpacing)?state.mountainSpacing:'normal';state.mountainShadowDefaults=window.VedrasShadows.settings(state.mountainShadowDefaults||{});state.shadowGlobal=sceneShadowStrength();state.shadowAssetPresets=state.shadowAssetPresets&&typeof state.shadowAssetPresets==='object'&&!Array.isArray(state.shadowAssetPresets)?state.shadowAssetPresets:{};state.shadowHandles=!!state.shadowHandles;state.waterSampling=state.waterSampling==='repeat'?'repeat':'hex';state.sceneSize=[7,19,37].includes(Number(state.sceneSize))?Number(state.sceneSize):37;$('sceneSize').value=String(state.sceneSize);}
function exportScene(){const config={schema:'vedras-asset-labor-scene-0.8',schemaVersion:2,catalogVersion:catalog.schemaVersion,terrainTypeByHex:Object.fromEntries(worldCells.map(c=>[key(c.q,c.r),typeOfCell(c)])),baseBiomeByHex:Object.fromEntries(worldCells.map(c=>[key(c.q,c.r),baseBiomeOf(c)])),projection:{hexWidth:256,groundY:PROJECT_Y},
 terrainByHex:state.hexTerrain,terrainByBiome:state.biomeTerrain,objectsByHex:state.hexObject,shadowsByHex:state.hexShadow,natureInstances:state.natureInstances,mountainInstances:state.mountainInstances,mountainDebug:state.mountainDebug,mountainMode:state.mountainMode,mountainChainId:state.mountainChainId,mountainSpacing:state.mountainSpacing,mountainShadowDefaults:state.mountainShadowDefaults,mountainShadowDebug:state.mountainShadowDebug,shadowGlobal:state.shadowGlobal,shadowAssetPresets:state.shadowAssetPresets,shadowHandles:state.shadowHandles,natureSeed:state.natureSeed,river:state.river,riverPaths:riverRoutes(),riverWidth:state.riverWidth,riverDebug:state.riverDebug,forest:state.forest,forestByHex:Object.fromEntries(forestCells().map(c=>[c.key,{baseBiome:c.baseBiome,biome:c.biome,forestClass:c.forestClass,density:Number(c.density.toFixed(3)),edgeInfluence:Number(c.edgeInfluence.toFixed(3)),jungle:c.jungle}])),sceneSize:state.sceneSize,autotiling:{enabled:state.edgeBlend,blendVariants:state.blendVariants,waterSampling:state.waterSampling,width:state.edgeWidth,irregularity:state.edgeIrregularity,cornerBlend:state.cornerBlend,debug:state.edgeDebug,debugMode:state.transitionDebugMode},materialScales:state.materialScales,visualPolish:state.visualPolish,terrainTest:state.terrainTest||null,relief:state.relief,shoreline:state.shoreline};
 const url=URL.createObjectURL(new Blob([JSON.stringify(config,null,2)],{type:'application/json'}));const el=document.createElement('a');el.href=url;el.download='vedras_scene.json';el.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
async function loadLibrary(list,mode){const old=state.asset;
 for(const a of assets)if(a.temporary&&a.url?.startsWith('blob:'))URL.revokeObjectURL(a.url);
 assets=list.map(e=>({...e,img:null,terrainCheck:null,url:e.url||('./'+e.path+(e.mtime?'?v='+e.mtime:''))}));assetByPath=new Map(assets.map(a=>[a.path,a]));stampCache.clear();invalidateTerrain();
 await Promise.all(assets.map(a=>new Promise(res=>{const img=new Image();img.decoding='async';img.onload=()=>{a.img=img;a.terrainCheck=inspectTerrain(a);res();};img.onerror=()=>{a.img=null;res();};img.src=a.url;})));
 const sourceRules=window.VedrasTerrainSources;
 const typesAdded=sourceRules?.ensureTypes(catalog)||false;
 const proposed=sourceRules?.propose(catalog,assets,isTerrainValid)||{assigned:0,skipped:[]};
 if(typesAdded||proposed.assigned){catalogDirty=true;catalogRevision++;}
 if(proposed.assigned)$('catalogMessage').textContent=proposed.assigned+' vorhandene Terrainvarianten per eindeutigem Dateinamen zugeordnet; vorhandene Zuweisungen bleiben erhalten.';
 const loaded=allAssets().length;$('serverStatus').textContent=`${loaded}/${assets.length} Grafiken · ${mode}`;
 const categories=[...new Set(assets.map(a=>a.category))].sort(),select=$('categoryFilter'),current=select.value;select.innerHTML='<option value="all">Alle</option>'+categories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');select.value=categories.includes(current)?current:'all';
 renderAssetsList();const first=assetByPath.has(old)?old:assets.find(a=>isTerrainValid(a))?.path||assets[0]?.path;if(first)setSelectedAsset(first);refreshCatalog();resize();window.dispatchEvent(new Event('vedras:assets-loaded'));}
// "Neu einlesen" must refresh the asset FILE LIST, never discard unsaved catalog assignments.
// Autosaves are serialized and awaited before reading the server catalog back.
async function reloadFromServer(){
 if(catalogDirty&&catalogCanSave){
  try{await saveCatalog({silent:true});}catch(err){$('catalogMessage').textContent='Katalog konnte noch nicht gespeichert werden; lokale Zuordnungen bleiben erhalten: '+err.message;}
 }
 const revisionAtStart=catalogRevision;
 try{
  const r=await fetch('/api/assets',{cache:'no-store'});if(!r.ok)throw Error('Kein lokaler Server');const d=await r.json();
  const response=await fetch('/api/terrain-catalog',{cache:'no-store'});
  if(response.ok){
   const parsed=await response.json();
   if(window.VedrasCatalog.validate(parsed).length)throw Error('Serverkatalog ungültig');
   const migrated=window.VedrasCatalog.migrateWaterTypes(parsed);
   // Do NOT replace an edited or currently changing in-memory catalog with an older file.
   if(!catalogDirty&&catalogRevision===revisionAtStart){catalog=parsed;if(migrated){catalogDirty=true;catalogRevision++;$('catalogMessage').textContent='Küstenwasser und die Legacy-Geländeart Küste werden als mischbares WATER geführt. Zugeordnete Grafiken bleiben erhalten; Sicherung beim Speichern.';}}
  }
  // Ein fehlender Erstkatalog (404) ist im lokalen Server neu speicherbar.
  catalogCanSave=response.ok||response.status===404;
  await loadLibrary(d.assets,`lokaler Ordner · Server v${d.version||'unbekannt'} · Port ${location.port||'-'}`);
  if(catalogDirty&&catalogCanSave)scheduleCatalogAutosave();
  if(d.version!=='0.11.0'){
   $('serverStatus').textContent+=' · VERSION KONFLIKT';
   $('nRecoveryStatus').textContent=`Achtung: Programmoberfläche v0.11.0 und Server v${d.version||'unbekannt'}. Bitte alten Server beenden und START_WINDOWS.bat aus diesem Ordner starten.`;
  }

 }catch(err){
  // Only use bundled fallback assets if the live list cannot be reached; never reset catalog.
  catalogCanSave=false;
  await loadLibrary(fallbackAssets,'Direktansicht – Ordnerimport möglich');
  $('catalogMessage').textContent='Lokaler Server nicht erreichbar. Bisherige Zuordnungen bleiben im Viewer erhalten. '+err.message;
 }
 refreshCatalog();
}
async function importFolder(files){const extensions=/\.(png|jpe?g|webp|svg|avif|gif)$/i;const list=[];const jsons=new Map();const fs=[...files];
 for(const f of fs){if(f.name.toLowerCase().endsWith('.json')){try{jsons.set(f.webkitRelativePath||f.name,JSON.parse(await f.text()));}catch{}}}
 for(const f of fs){if(!extensions.test(f.name))continue;let rel=f.webkitRelativePath||f.name;const at=rel.indexOf('/assets/');rel=at>=0?rel.substring(at+8):rel.split('/').slice(1).join('/')||f.name;
 const category=rel.split('/')[0];const stem=rel.replace(/\.[^.]+$/,'').replace(/__main$/,'');const matching=[...jsons.entries()].find(([p])=>p.replace(/\.[^.]+$/,'').endsWith(stem));
 list.push({path:'import/'+rel,relPath:rel,name:f.name,category:category||'imports',bytes:f.size,mtime:f.lastModified,meta:matching?.[1]||{},url:URL.createObjectURL(f),temporary:true});}
 if(!list.length){alert('Der gewählte Ordner enthält keine unterstützten Grafikdateien.');return;}
 const loaded=[...jsons.entries()].find(([p])=>p.endsWith('terrain_catalog.json'));if(loaded&&!window.VedrasCatalog.validate(loaded[1]).length){window.VedrasCatalog.migrateWaterTypes(loaded[1]);
  if(!catalogDirty||confirm('Der Ordner enthält einen eigenen Terrain-Katalog. Ungespeicherte Zuordnungen durch diesen Katalog ersetzen?')){catalog=loaded[1];catalogDirty=true;catalogRevision++;scheduleCatalogAutosave();}
 }await loadLibrary(list,'Ordnerimport (manuell)');refreshCatalog();}
function renderCatalogChoices(){
 const types=catalog.terrainTypes;const selectors=['assetTerrainType','newTypeCategory'];
 $('assetTerrainType').innerHTML='<option value="">Nicht zugeordnet</option>'+types.map(t=>`<option value="${t.id}">${escapeHtml(window.VedrasCatalog.category(catalog,t.categoryId)?.name||'?')} / ${escapeHtml(t.name)}</option>`).join('');
 $('newTypeCategory').innerHTML=catalog.categories.map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
 const oldCat=$('editCategorySelect').value,oldType=$('editTypeSelect').value;
 $('editCategorySelect').innerHTML=catalog.categories.map(c=>`<option value="${c.id}">${escapeHtml(c.name)}${c.archived?' (archiviert)':''}</option>`).join('');
 $('editTypeCategory').innerHTML=$('newTypeCategory').innerHTML;
 $('editTypeSelect').innerHTML=catalog.terrainTypes.map(t=>`<option value="${t.id}">${escapeHtml(t.name)}${t.archived?' (archiviert)':''}</option>`).join('');
 if(oldCat&&window.VedrasCatalog.category(catalog,oldCat))$('editCategorySelect').value=oldCat;
 if(oldType&&window.VedrasCatalog.terrainType(catalog,oldType))$('editTypeSelect').value=oldType;
 updateAdminFields();
 const a=useAsset(state.asset);$('assetTerrainType').value=typeOfAsset(a)||'';
 $('catalogSave').disabled=!catalogDirty;
}
function changedCatalog(){
 catalogDirty=true;catalogRevision++;
 refreshCatalog();if(state.asset&&useAsset(state.asset))setSelectedAsset(state.asset);
 scheduleCatalogAutosave();
}
function scheduleCatalogAutosave(delay=CATALOG_AUTOSAVE_DELAY){
 if(catalogAutosaveTimer!==null)clearTimeout(catalogAutosaveTimer);
 catalogAutosaveTimer=null;
 if(!catalogCanSave||!catalogDirty)return; // Without server, export remains the explicit persistence method.
 catalogAutosaveTimer=setTimeout(()=>{
  catalogAutosaveTimer=null;
  saveCatalog({silent:true}).catch(err=>{$('catalogMessage').textContent='Automatisches Speichern fehlgeschlagen: '+err.message+' – Zuordnungen bleiben erhalten. Bitte erneut speichern.';});
 },delay);
}
function downloadJSON(filename,data){const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(u),3000);}
async function saveCatalog({silent=false}={}){
 if(catalogAutosaveTimer!==null){clearTimeout(catalogAutosaveTimer);catalogAutosaveTimer=null;}
 // All callers share one save loop. New changes during a POST are saved in a NEW,
 // sequential request, never in parallel with an older pending snapshot.
 if(catalogSaveInFlight){await catalogSaveInFlight;if(!catalogDirty)return;}
 const errors=window.VedrasCatalog.validate(catalog);
 if(errors.length)throw Error('Katalog ungültig: '+errors.join('; '));
 if(!catalogCanSave){
  if(!silent){downloadJSON('terrain_catalog.json',catalog);$('catalogMessage').textContent='Katalog exportiert: im manuellen Ordnerimport kann nicht automatisch geschrieben werden.';}
  return; // Export is not the same as confirmed disk persistence.
 }
 if(!catalogDirty)return;
 const operation=(async()=>{
  while(catalogDirty){
   const revision=catalogRevision;
   const payload=JSON.stringify(catalog);
   const response=await fetch('/api/terrain-catalog',{method:'POST',headers:{'Content-Type':'application/json'},body:payload});
   if(!response.ok)throw Error('HTTP '+response.status+': '+(await response.text()));
   if(catalogRevision===revision){catalogDirty=false;$('catalogMessage').textContent='Gelände-Katalog automatisch in assets/terrain/terrain_catalog.json gespeichert.';}
   // A newer revision appeared during I/O -> the loop writes that next.
  }
 })();
 catalogSaveInFlight=operation;
 try{await operation;}finally{if(catalogSaveInFlight===operation)catalogSaveInFlight=null;refreshCatalog();}
}
function updateAdminFields(){const c=window.VedrasCatalog.category(catalog,$('editCategorySelect').value),t=window.VedrasCatalog.terrainType(catalog,$('editTypeSelect').value);if(c)$('editCategoryName').value=c.name;if(t){$('editTypeName').value=t.name;$('editTypeCategory').value=t.categoryId;$('editTypeMaterialClass').value=t.materialClass;}}
$('editCategorySelect').addEventListener('change',updateAdminFields);
$('editTypeSelect').addEventListener('change',updateAdminFields);
$('newTypeCategory').addEventListener('change',()=>{const cat=$('newTypeCategory').value;$('newTypeMaterialClass').value=cat==='water_coast'?'water':'ground';});
$('editTypeCategory').addEventListener('change',()=>{const cat=$('editTypeCategory').value;
 if(cat==='water_coast'&&$('editTypeMaterialClass').value==='ground')$('editTypeMaterialClass').value='water';});
$('renameCategoryBtn').addEventListener('click',()=>{const c=window.VedrasCatalog.category(catalog,$('editCategorySelect').value);const name=$('editCategoryName').value.trim();if(!c||!name)return;c.name=name;changedCatalog();});
$('archiveCategoryBtn').addEventListener('click',()=>{const c=window.VedrasCatalog.category(catalog,$('editCategorySelect').value);if(!c)return;c.archived=!c.archived;changedCatalog();});
$('updateTypeBtn').addEventListener('click',()=>{const t=window.VedrasCatalog.terrainType(catalog,$('editTypeSelect').value),name=$('editTypeName').value.trim(),cat=$('editTypeCategory').value;if(!t||!name||!window.VedrasCatalog.category(catalog,cat))return;t.name=name;t.categoryId=cat;t.materialClass=$('editTypeMaterialClass').value;
 if(!catalog.transitionProfiles.some(p=>p.id==='soft_water'))catalog.transitionProfiles.push({id:'soft_water',mode:'soft_water',defaultBand:42});
 t.transitionProfileId=window.VedrasCatalog.profileIdFor(t.materialClass);changedCatalog();});
$('archiveTypeBtn').addEventListener('click',()=>{const t=window.VedrasCatalog.terrainType(catalog,$('editTypeSelect').value);if(!t)return;t.archived=!t.archived;changedCatalog();});
$('newCategoryBtn').addEventListener('click',()=>{const id=$('newCategoryId').value.trim(),name=$('newCategoryName').value.trim();if(!window.VedrasCatalog.validId(id)||!name||catalog.categories.some(c=>c.id===id)){alert('Eindeutige ID (a-z, 0-9, _) und Name erforderlich.');return;}
 catalog.categories.push({id,name,sortOrder:catalog.categories.length*10});changedCatalog();});
$('newTypeBtn').addEventListener('click',()=>{const id=$('newTypeId').value.trim(),name=$('newTypeName').value.trim(),categoryId=$('newTypeCategory').value;
 if(!window.VedrasCatalog.validId(id)||!name||!window.VedrasCatalog.category(catalog,categoryId)||catalog.terrainTypes.some(t=>t.id===id)){alert('Eindeutige Geländeart-ID, Kategorie und Name erforderlich.');return;}
 const materialClass=categoryId==='water_coast'&&$('newTypeMaterialClass').value==='ground'?'water':$('newTypeMaterialClass').value;
 if(!catalog.transitionProfiles.some(p=>p.id==='soft_water'))catalog.transitionProfiles.push({id:'soft_water',mode:'soft_water',defaultBand:42});
 catalog.terrainTypes.push({id,name,categoryId,materialClass,transitionProfileId:window.VedrasCatalog.profileIdFor(materialClass)});changedCatalog();});
$('assetTerrainType').addEventListener('change',e=>{const a=useAsset(state.asset);if(!isTerrain(a))return;
 if(e.target.value){window.VedrasCatalog.assign(catalog,a,e.target.value);}else{delete catalog.assets[a.relPath];}
 changedCatalog();});
$('catalogSave').addEventListener('click',()=>saveCatalog().catch(err=>{$('catalogMessage').textContent='Speichern fehlgeschlagen: '+err.message;alert(err.message);}));
$('catalogExport').addEventListener('click',()=>downloadJSON('terrain_catalog.json',catalog));
$('catalogImportInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const parsed=JSON.parse(await f.text());const errors=window.VedrasCatalog.validate(parsed);if(errors.length)throw Error(errors.join('\n'));catalog=parsed;changedCatalog();}catch(err){alert('Katalog-Import abgelehnt: '+err.message);}e.target.value='';});
$('catalogReload').addEventListener('click',async()=>{if(catalogDirty&&!confirm('Ungespeicherte Änderungen verwerfen?'))return;try{const r=await fetch('/api/terrain-catalog');if(!r.ok)throw Error('Server nicht erreichbar');const c=await r.json();if(window.VedrasCatalog.validate(c).length)throw Error('Ungültiger Katalog');if(catalogAutosaveTimer!==null){clearTimeout(catalogAutosaveTimer);catalogAutosaveTimer=null;}if(catalogSaveInFlight)await catalogSaveInFlight;catalog=c;catalogDirty=false;catalogRevision++;refreshCatalog();}catch(e){alert(e.message);}});
// Controls
$('reloadBtn').addEventListener('click',reloadFromServer);
$('folderInput').addEventListener('change',e=>importFolder(e.target.files));
$('assetSearch').addEventListener('input',renderAssetsList);$('categoryFilter').addEventListener('change',renderAssetsList);
$('viewMap').addEventListener('click',()=>setView('map'));$('viewSolo').addEventListener('click',()=>setView('solo'));$('viewCompare').addEventListener('click',()=>setView('compare'));
$('setA').addEventListener('click',()=>assignCompare('compareA'));$('setB').addEventListener('click',()=>assignCompare('compareB'));
$('placeHex').addEventListener('click',()=>applySelected(false));$('placeBiome').addEventListener('click',()=>applySelected(true));$('clearHex').addEventListener('click',clearCell);
$('spriteWidth').addEventListener('input',e=>{state.width=Number(e.target.value);$('widthText').textContent=String(state.width);updateDiagnostics();});
function syncPolishControls(){
 for(const [id,valueId,key] of [['polishNature','polishNatureValue','nature'],['polishTerrain','polishTerrainValue','terrain'],['polishComposition','polishCompositionValue','composition']]){
  if(!$(id))continue;const value=Math.round(state.visualPolish[key]*100);
  $(id).value=String(value);$(valueId).textContent=String(value)+' %';
 }
}
for(const [id,key] of [['polishNature','nature'],['polishTerrain','terrain'],['polishComposition','composition']]){
 $(id).addEventListener('input',e=>{
  state.visualPolish[key]=Math.max(0,Math.min(1,Number(e.target.value)/100));
  syncPolishControls();
  if(key==='terrain')terrainRasterCache.signature=null;
  persistScene();requestDraw();
 });
}
$('materialScale').addEventListener('input',e=>{const a=useAsset(state.asset);if(!isTerrainValid(a))return;const size=Number(e.target.value);state.materialScales[a.path]=size;$('materialScaleLabel').textContent=String(size);persistScene();requestDraw();updateDiagnostics();});
$('zoomSlider').addEventListener('input',e=>applyZoom(Number(e.target.value)/100));$('zoomIn').addEventListener('click',()=>applyZoom(state.zoom*1.16));$('zoomOut').addEventListener('click',()=>applyZoom(state.zoom/1.16));
$('home').addEventListener('click',()=>{state.panX=0;state.panY=20;applyZoom(state.sceneSize===37?.65:.95);});
$('quality').addEventListener('change',e=>{state.quality=e.target.value;resize();});
for(const [id,field] of [['gridToggle','grid'],['objectsToggle','objects'],['riverToggle','river'],['boundsToggle','bounds'],['edgeBlendToggle','edgeBlend'],['seamCheckToggle','seamCheck']])$(id).addEventListener('change',e=>{state[field]=e.target.checked;requestDraw();});
$('sceneSize').addEventListener('change',e=>{state.sceneSize=Number(e.target.value);if(state.sceneSize===37&&state.zoom>.75)applyZoom(.65);assignBiomes();window.dispatchEvent(new Event('vedras:forest-changed'));persistScene();});
// Dynamic terrain test scenes: derive categories and materials from the live catalog.
function terrainTestOptions(){
 const old={};for(const id of ['testSingleType','testCategoryA','testCategoryCompareA','testCategoryCompareB','testTypeA','testTypeB','testTypeC'])old[id]=$(id).value;
 const available=new Set(assets.filter(isTerrainValid).map(typeOfAsset).filter(Boolean));
 const all=catalog.terrainTypes.filter(t=>!t.archived&&available.has(t.id));
 const categories=catalog.categories.filter(c=>!c.archived&&all.some(t=>t.categoryId===c.id));
 function fill(id,items){const el=$(id);el.innerHTML=items.map(t=>`<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`).join('');if(items.some(t=>t.id===old[id]))el.value=old[id];}
 for(const id of ['testSingleType','testTypeA','testTypeB','testTypeC'])fill(id,all);
 for(const id of ['testCategoryA','testCategoryCompareA','testCategoryCompareB'])fill(id,categories);
 if(!old.testTypeB&&all[1])$('testTypeB').value=all[1].id;
 if(!old.testTypeC&&all[2])$('testTypeC').value=all[2].id;
 if(!old.testCategoryCompareB&&categories[1])$('testCategoryCompareB').value=categories[1].id;
 const label=$('testFeedback');if(!all.length)label.textContent='Noch keine kompatiblen, kategorisierten Terrainmaterialien gefunden.';
 else label.textContent=`${all.length} Geländearten in ${categories.length} Kategorien mit geladenen Texturen verfügbar. Eine regionale Testkarte benötigt mindestens eine gültige Grafik je verwendeter Geländeart.`;
}
function showTerrainTestFields(){const mode=$('terrainTestMode').value;
 for(const [id,kind] of [['testSingleSection','single'],['testCategorySection','category'],['testCategoriesSection','categories'],['testTripleSection','triple']])$(id).classList.toggle('hidden',mode!==kind);
}
function testCellIndex(cell,count,seed){
 // Coherent territories instead of per-hex dice rolls: stable world-space Voronoi zones.
 const p=axialPos(cell.q,cell.r);let best=0,bestD=Infinity;
 for(let i=0;i<count;i++){
  const ang=2*Math.PI*(i+.14)/count+.35,rad=count===1?0:320;
  const cx=Math.cos(ang)*rad,cy=Math.sin(ang)*rad;
  const n=(hash(cell.q,cell.r,seed%100000+i*971)%1000)/1000-.5;
  const d=(p.x-cx)**2+(p.y-cy)**2+n*3000;
  if(d<bestD){bestD=d;best=i;}
 }return best;
}
function terrainTestApply(){const mode=$('terrainTestMode').value,options=catalog.terrainTypes.filter(t=>!t.archived);
 const available=new Map();for(const a of assets.filter(isTerrainValid)){const t=typeOfAsset(a);if(!t)continue;if(!available.has(t))available.set(t,[]);available.get(t).push(a);}
 const forCategory=id=>options.filter(t=>t.categoryId===id&&available.has(t.id)).map(t=>t.id);
 let groups=[];
 if(mode==='single')groups=[[$('testSingleType').value]];
 if(mode==='category')groups=forCategory($('testCategoryA').value).map(id=>[id]);
 if(mode==='water')groups=options.filter(t=>t.materialClass==='water'&&available.has(t.id)).map(t=>[t.id]);
 if(mode==='triple')groups=[$('testTypeA').value,$('testTypeB').value,$('testTypeC').value].map(id=>[id]);
 if(mode==='categories')groups=[forCategory($('testCategoryCompareA').value),forCategory($('testCategoryCompareB').value)];
 if(!groups.length||groups.some(g=>!g.length||g.some(t=>!available.has(t)))){$('testFeedback').textContent='Fehlende kompatible Materialien für diese Auswahl. Ordne die Bilder zuerst im Gelände-Katalog zu.';return;}
 const allTypeIds=[...new Set(groups.flat())],mix=$('testMixVariants').checked;
 const seed=state.relief.seed; // deterministic selection coupled to the scene seed
 state.sceneSize=[7,19,37].includes(Number($('sceneSize').value))?Number($('sceneSize').value):37;assignBiomes();state.hexTerrain={};state.biomeTerrain={};state.baseBiomeByHex={};
 for(const c of worldCells){const g=groups[testCellIndex(c,groups.length,seed)];
  const t=g.length>1?g[testCellIndex(c,g.length,seed+101)]:g[0];
  const variants=available.get(t).slice().sort((x,y)=>x.path.localeCompare(y.path));
  const n=mix?hash(c.q,c.r,seed+77)%variants.length:0;
  state.hexTerrain[key(c.q,c.r)]=variants[n].path;
 }
 state.edgeBlend=true;state.blendVariants=true;state.edgeDebug=$('testTransitionDebug').checked;state.cornerBlend=true;
 state.objects=false;state.showLegacyNature=false;state.river=false;state.grid=false;
 $('edgeBlendToggle').checked=true;$('blendVariantsToggle').checked=true;$('edgeDebugToggle').checked=state.edgeDebug;
 $('objectsToggle').checked=false;$('nShowDemo').checked=false;$('riverToggle').checked=false;$('gridToggle').checked=false;
 state.terrainTest={mode,single:$('testSingleType').value,category:$('testCategoryA').value,categories:[$('testCategoryCompareA').value,$('testCategoryCompareB').value],types:[$('testTypeA').value,$('testTypeB').value,$('testTypeC').value],mix};
 invalidateTerrain();persistScene();setView('map');state.panX=0;state.panY=0;applyZoom(.84);requestDraw();
 const labels=allTypeIds.map(id=>catalog.terrainTypes.find(t=>t.id===id)?.name||id);
 $('testFeedback').textContent=`${worldCells.length} Hexe · ${allTypeIds.length} Geländearten: ${labels.join(', ')} · ${mix?'Varianten automatisch gemischt':'erste Materialvariante'} · Seed ${seed}.`;
}
$('terrainTestMode').addEventListener('change',showTerrainTestFields);
function syncTerrainTestUI(){const t=state.terrainTest;if(!t)return;
 $('terrainTestMode').value=t.mode||'category';showTerrainTestFields();
 const fields={testSingleType:t.single,testCategoryA:t.category,testCategoryCompareA:t.categories?.[0],testCategoryCompareB:t.categories?.[1],testTypeA:t.types?.[0],testTypeB:t.types?.[1],testTypeC:t.types?.[2]};
 for(const [id,value] of Object.entries(fields))if(value&&[...$(id).options].some(o=>o.value===value))$(id).value=value;
 $('testMixVariants').checked=t.mix!==false;}

$('applyTerrainTest').addEventListener('click',terrainTestApply);
showTerrainTestFields();
$('edgeWidth').addEventListener('input',e=>{state.edgeWidth=Number(e.target.value);$('edgeWidthText').textContent=String(state.edgeWidth);invalidateTerrain();requestDraw();persistScene();});
$('edgeDebugToggle').addEventListener('change',e=>{state.edgeDebug=e.target.checked;requestDraw();persistScene();});
$('edgeBlendToggle').addEventListener('change',persistScene);
$('blendVariantsToggle').addEventListener('change',e=>{state.blendVariants=e.target.checked;invalidateTerrain();requestDraw();persistScene();});
$('waterSamplingMode').addEventListener('change',e=>{state.waterSampling=e.target.value==='repeat'?'repeat':'hex';invalidateTerrain();requestDraw();persistScene();});
$('edgeIrregularity').addEventListener('input',e=>{state.edgeIrregularity=Number(e.target.value);$('irregularityText').textContent=String(state.edgeIrregularity);invalidateTerrain();requestDraw();persistScene();});
$('cornerBlendToggle').addEventListener('change',e=>{state.cornerBlend=e.target.checked;invalidateTerrain();requestDraw();persistScene();});
$('transitionDebugMode').addEventListener('change',e=>{state.transitionDebugMode=e.target.value;requestDraw();persistScene();});
$('shorelineToggle').addEventListener('change',e=>{state.shoreline.enabled=e.target.checked;requestDraw();persistScene();});
$('shorelineMode').addEventListener('change',e=>{state.shoreline.mode=e.target.value;syncShorelineControls();requestDraw();persistScene();});
$('shorelineWidth').addEventListener('input',e=>{state.shoreline.width=Number(e.target.value);$('shorelineWidthText').textContent=String(state.shoreline.width);requestDraw();persistScene();});
$('shorelineOuter').addEventListener('input',e=>{state.shoreline.outer=Number(e.target.value);$('shorelineOuterText').textContent=String(state.shoreline.outer);requestDraw();persistScene();});
function syncShorelineControls(){
 const temp=state.shoreline.mode==='temp';
 $('shorelineWidth').disabled=!temp;$('shorelineOuter').disabled=!temp;
 $('shorelineWidth').title=temp?'Testbreite in Welteinheiten':'Grafikmodus: Breite wird vom PNG bestimmt';
 $('shorelineOuter').title=temp?'Testüberhang in Welteinheiten':'Grafikmodus: Überhang wird vom PNG bestimmt';
}
function shorelineTest(mode){
 const mats=assets.filter(isTerrainValid),land=mats.find(a=>window.VedrasCatalog.terrainType(catalog,typeOfAsset(a))?.materialClass==='ground');
 const water=mats.find(a=>window.VedrasCatalog.terrainType(catalog,typeOfAsset(a))?.materialClass==='water');
 if(!land||!water){$('shorelineStats').textContent='Für den Ufertest werden mindestens ein zugeordnetes Landmaterial und ein als WATER klassifiziertes Material benötigt.';return;}
 state.sceneSize=[7,19,37].includes(Number($('sceneSize').value))?Number($('sceneSize').value):37;assignBiomes();state.hexTerrain={};state.biomeTerrain={};state.baseBiomeByHex={};
 for(const c of worldCells)state.hexTerrain[key(c.q,c.r)]=land.path;
 const neighbors=window.VedrasShoreline.DIRS;
 const dirs=mode==='six'?neighbors:neighbors.filter((_,i)=>[0,1,2,4].includes(i));
 for(const [q,r] of dirs)state.hexTerrain[key(q,r)]=water.path;
 if(mode==='corners'){
  // A second land/water contact tests exterior corners and disjoint segments.
  for(const [q,r] of [[2,-1],[-1,2]])state.hexTerrain[key(q,r)]=water.path;
 }
 state.objects=false;state.river=false;state.showLegacyNature=false;state.grid=false;state.edgeBlend=true;
 $('objectsToggle').checked=false;$('riverToggle').checked=false;$('nShowDemo').checked=false;$('gridToggle').checked=false;$('edgeBlendToggle').checked=true;
 state.shoreline.enabled=true;$('shorelineToggle').checked=true;
 state.shoreline.mode='temp';$('shorelineMode').value='temp';syncShorelineControls();
 invalidateTerrain();persistScene();setView('map');state.panX=0;state.panY=0;applyZoom(.76);requestDraw();
}
$('shorelineSixTest').addEventListener('click',()=>shorelineTest('six'));
$('shorelineCornersTest').addEventListener('click',()=>shorelineTest('corners'));

$('sceneImport').addEventListener('change',async e=>{
 const f=e.target.files?.[0];if(!f)return;
 try{
  const scene=JSON.parse(await f.text());
  if(!['vedras-asset-labor-scene-0.8','vedras-asset-labor-scene-0.7','vedras-asset-labor-scene-0.6'].includes(scene.schema))throw Error('Nicht unterstütztes Szenenformat');
  const tileMap=scene.terrainByHex||{},biomeMap=scene.terrainByBiome||{};
  const good=x=>typeof x==='string'&&assetByPath.has(x)&&isTerrainValid(useAsset(x))&&!!typeOfAsset(useAsset(x));
  const skipped=[...Object.values(tileMap),...Object.values(biomeMap)].filter(v=>!good(v)).length;
  state.sceneSize=[7,19,37].includes(Number(scene.sceneSize))?Number(scene.sceneSize):37;$('sceneSize').value=String(state.sceneSize);assignBiomes();
  state.hexTerrain=Object.fromEntries(Object.entries(tileMap).filter(([k,v])=>/^-?\d+,-?\d+$/.test(k)&&good(v)));
  state.biomeTerrain=Object.fromEntries(Object.entries(biomeMap).filter(([k,v])=>good(v)));
  state.baseBiomeByHex=Object.fromEntries(Object.entries(scene.baseBiomeByHex||{}).filter(([k,v])=>/^-?\d+,-?\d+$/.test(k)&&catalog.terrainTypes.some(t=>t.id===v&&t.materialClass==='ground')));
  state.materialScales=scene.materialScales||{};state.visualPolish=window.VedrasPolish.valid(scene.visualPolish);
  state.hexObject=scene.objectsByHex||{};state.hexShadow=scene.shadowsByHex||{};state.natureInstances=(Array.isArray(scene.natureInstances)?scene.natureInstances:[]).filter(x=>typeof x.assetPath==='string'&&Number.isFinite(x.dx)&&Number.isFinite(x.dy)&&Number.isFinite(x.q)&&Number.isFinite(x.r)&&Number.isFinite(x.scale)&&x.scale>0&&x.scale<=3).slice(0,2000);state.mountainInstances=(Array.isArray(scene.mountainInstances)?scene.mountainInstances:[]).filter(m=>typeof m.assetPath==='string'&&Number.isInteger(m.q)&&Number.isInteger(m.r)&&[1,2].includes(m.radius)).map(m=>({...m,coreRadius:m.coreRadius===1?1:0,mode:m.mode==='chain'?'chain':'single',chainId:typeof m.chainId==='string'?m.chainId:null})).slice(0,60);state.mountainDebug=!!scene.mountainDebug;state.mountainMode=scene.mountainMode==='chain'?'chain':'single';state.mountainChainId=typeof scene.mountainChainId==='string'?scene.mountainChainId:'alpen_01';state.mountainSpacing=['tight','normal','wide'].includes(scene.mountainSpacing)?scene.mountainSpacing:'normal';if(scene.mountainShadowDefaults&&typeof scene.mountainShadowDefaults==='object')state.mountainShadowDefaults=window.VedrasShadows.settings({...state.mountainShadowDefaults,...scene.mountainShadowDefaults});state.shadowGlobal=window.VedrasShadows.globalStrength(scene.shadowGlobal);state.shadowAssetPresets=scene.shadowAssetPresets&&typeof scene.shadowAssetPresets==='object'&&!Array.isArray(scene.shadowAssetPresets)?scene.shadowAssetPresets:{};state.shadowHandles=!!scene.shadowHandles;$('shadowHandles').checked=state.shadowHandles;state.mountainShadowDebug=!!scene.mountainShadowDebug;$('mountainDebug').checked=state.mountainDebug;$('mountainMode').value=state.mountainMode;$('mountainChainId').value=state.mountainChainId;$('mountainSpacing').value=state.mountainSpacing;$('mountainShadowDebug').checked=state.mountainShadowDebug;state.natureSeed=Number(scene.natureSeed)||12345;state.forest=window.VedrasForest.valid(scene.forest);state.riverPaths=window.VedrasRivers.normalizeRoutes(scene.riverPaths,worldCells,wetHex);state.riverDraft=null;state.riverWidth=clamp(Number(scene.riverWidth)||40,12,70);state.riverDebug=!!scene.riverDebug;state.river=scene.river!==false;$('riverToggle').checked=state.river;window.dispatchEvent(new Event('vedras:forest-changed'));window.dispatchEvent(new Event('vedras:river-changed'));window.dispatchEvent(new Event('vedras:shadow-changed'));
  state.relief=window.VedrasRelief.valid(scene.relief||window.VedrasRelief.defaults());syncReliefUI();
  if(scene.autotiling){state.edgeBlend=!!scene.autotiling.enabled;state.blendVariants=!!scene.autotiling.blendVariants;state.edgeWidth=Number(scene.autotiling.width)||28;state.waterSampling=scene.autotiling.waterSampling==='repeat'?'repeat':'hex';
   state.edgeIrregularity=Number(scene.autotiling.irregularity)||0;state.cornerBlend=scene.autotiling.cornerBlend!==false;}
  if(scene.shoreline){state.shoreline={...state.shoreline,...scene.shoreline};}
  $('edgeBlendToggle').checked=state.edgeBlend;$('blendVariantsToggle').checked=state.blendVariants;$('waterSamplingMode').value=state.waterSampling;
  $('edgeWidth').value=String(state.edgeWidth);$('edgeWidthText').textContent=String(state.edgeWidth);$('waterSamplingMode').value=state.waterSampling;
  $('edgeIrregularity').value=String(state.edgeIrregularity);$('irregularityText').textContent=String(state.edgeIrregularity);$('cornerBlendToggle').checked=state.cornerBlend;
  $('shorelineToggle').checked=state.shoreline.enabled!==false;$('shorelineMode').value=state.shoreline.mode||'art';$('shorelineWidth').value=String(state.shoreline.width||34);$('shorelineWidthText').textContent=String(state.shoreline.width||34);$('shorelineOuter').value=String(state.shoreline.outer||10);$('shorelineOuterText').textContent=String(state.shoreline.outer||10);
  persistScene();invalidateTerrain();requestDraw();setView('map');
  $('catalogMessage').textContent=`Szene importiert. ${skipped} fehlende oder nicht zugeordnete Textur(en) ausgelassen.`;
 }catch(err){alert('Szenenimport abgelehnt: '+err.message);}e.target.value='';
});
$('saveScene').addEventListener('click',exportScene);
$('resetScene').addEventListener('click',()=>{state.hexTerrain={};state.biomeTerrain={};state.baseBiomeByHex={};state.hexObject={};state.hexShadow={};state.natureInstances=[];window.VedrasNature?.renderPlaced?.();state.materialScales={};state.mountainInstances=[];state.riverPaths=[];state.riverDraft=null;state.riverDebug=false;if($('riverDebug'))$('riverDebug').checked=false;riverRasterCache.clear();window.dispatchEvent(new Event('vedras:river-changed'));state.forest=window.VedrasForest.defaults();window.dispatchEvent(new Event('vedras:forest-changed'));persistScene();stampCache.clear();requestDraw();});
canvas.addEventListener('wheel',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();applyZoom(state.zoom*(e.deltaY<0?1.10:.90),e.clientX-r.left,e.clientY-r.top);},{passive:false});
let points=new Map(),moved=false,initialPinch=null,shadowDrag=null;
function selectedShadowHandle(e){
 if(!state.shadowHandles)return null;
 const mountain=state.mountainInstances.find(m=>key(m.q,m.r)===state.selected);
 if(!mountain)return null;
 const raw=genericObjects().find(o=>o.mountainInstance===mountain);
 if(!raw?.asset?.img)return null;
 const o={...raw,y:displayGroundY(raw.x,raw.y)},sh=mountainShadowSettings(o);
 const origin=mountainOriginForObject(o,sh);
 const w=o.w*state.zoom,base={
  x:origin.x-w*sh.originX,y:origin.y-w*sh.originY
 };
 const box=canvas.getBoundingClientRect(),x=e.clientX-box.left,y=e.clientY-box.top;
 return Math.hypot(x-origin.x,y-origin.y)<=16?{instance:mountain,base,width:w}:null;
}
canvas.addEventListener('pointerdown',e=>{
 const handle=selectedShadowHandle(e);
 if(handle){canvas.setPointerCapture(e.pointerId);shadowDrag={...handle,pointerId:e.pointerId};return;}
 canvas.setPointerCapture(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=false;if(points.size===2)initialPinch=null;
});
canvas.addEventListener('pointermove',e=>{
 if(shadowDrag?.pointerId===e.pointerId){
  const box=canvas.getBoundingClientRect();
  const x=(e.clientX-box.left-shadowDrag.base.x)/shadowDrag.width;
  const y=(e.clientY-box.top-shadowDrag.base.y)/shadowDrag.width;
  shadowDrag.instance.shadowOriginX=clamp(Math.round(x*100)/100,-.8,.8);
  shadowDrag.instance.shadowOriginY=clamp(Math.round(y*100)/100,-.5,.5);
  $('mountainOriginX').value=String(shadowDrag.instance.shadowOriginX);
  $('mountainOriginY').value=String(shadowDrag.instance.shadowOriginY);
  $('mountainOriginXText').textContent=shadowDrag.instance.shadowOriginX.toFixed(2).replace('.',',');
  $('mountainOriginYText').textContent=shadowDrag.instance.shadowOriginY.toFixed(2).replace('.',',');
  requestDraw();return;
 }
 if(!points.has(e.pointerId))return;const old=points.get(e.pointerId);const dx=e.clientX-old.x,dy=e.clientY-old.y;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(Math.abs(dx)+Math.abs(dy)>1)moved=true;
 if(points.size===1){state.panX+=dx;state.panY+=dy;requestDraw();}else if(points.size===2){const p=[...points.values()],dist=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),r=canvas.getBoundingClientRect();if(initialPinch)applyZoom(state.zoom*dist/initialPinch.dist,(p[0].x+p[1].x)/2-r.left,(p[0].y+p[1].y)/2-r.top);initialPinch={dist};}});
canvas.addEventListener('pointerup',e=>{
 if(shadowDrag?.pointerId===e.pointerId){shadowDrag=null;persistScene();requestDraw();return;}
 points.delete(e.pointerId);initialPinch=null;if(moved)return;const b=canvas.getBoundingClientRect(),world=fromScreen(e.clientX-b.left,e.clientY-b.top),hex=pixelToHex(world.x,world.y);if(worldCells.find(c=>c.q===hex.q&&c.r===hex.r)){
 state.selected=key(hex.q,hex.r);$('selectedHex').textContent='Ausgewählt: Hex ('+hex.q+','+hex.r+')';$('mapFooter').textContent=`Hex (${hex.q},${hex.r}) · ${worldCells.find(c=>c.q===hex.q&&c.r===hex.r).name} · Drag zum Verschieben`;requestDraw();window.dispatchEvent(new Event('vedras:hex-selected'));}});
canvas.addEventListener('pointercancel',e=>{if(shadowDrag?.pointerId===e.pointerId){shadowDrag=null;persistScene();}points.delete(e.pointerId);initialPinch=null;});
window.addEventListener('keydown',e=>{if(e.target?.matches('input,select,textarea'))return;if(e.key==='+'||e.key==='=')applyZoom(state.zoom*1.1);if(e.key==='-')applyZoom(state.zoom/.9);});
window.addEventListener('resize',resize);
new ResizeObserver(()=>resize()).observe(canvas);
let lastDeviceRatio=window.devicePixelRatio||1;setInterval(()=>{const n=window.devicePixelRatio||1;if(n!==lastDeviceRatio){lastDeviceRatio=n;resize();}},950);
function syncReliefUI(){const r=state.relief;
 $('reliefOn').checked=r.enabled;$('reliefProfile').value=r.profile;$('reliefStrength').value=String(r.strength);$('reliefStrengthText').textContent=String(r.strength);
 $('reliefLighting').checked=r.lighting;$('reliefConnected').checked=r.connected;$('reliefDebug').checked=r.debug;$('reliefPadBuildings').checked=r.padBuildings;
 $('reliefSeed').value=String(r.seed);$('reliefCenter').textContent=r.center;
 $('reliefFlatCompare').textContent=r.enabled?'A/B: Flachland anzeigen':'A/B: Relief anzeigen';}
function reliefChange(){state.relief=window.VedrasRelief.valid(state.relief);syncReliefUI();window.VedrasRelief.clear();persistScene();requestDraw();}
$('reliefOn').addEventListener('change',e=>{state.relief.enabled=e.target.checked;reliefChange();});
$('reliefProfile').addEventListener('change',e=>{state.relief.profile=e.target.value;reliefChange();});
$('reliefStrength').addEventListener('input',e=>{state.relief.strength=+e.target.value;reliefChange();});
for(const [id,prop] of [['reliefLighting','lighting'],['reliefConnected','connected'],['reliefDebug','debug'],['reliefPadBuildings','padBuildings']])$(id).addEventListener('change',e=>{state.relief[prop]=e.target.checked;reliefChange();});
$('reliefSeed').addEventListener('change',e=>{state.relief.seed=+e.target.value;reliefChange();});
$('reliefSetCenter').addEventListener('click',()=>{state.relief.center=state.selected;reliefChange();});
$('reliefFlatCompare').addEventListener('click',()=>{state.relief.enabled=!state.relief.enabled;reliefChange();});
$('reliefBuildingTest').addEventListener('click',()=>{
 state.sceneSize=19;$('sceneSize').value='19';assignBiomes();
 const selected=assets.filter(isTerrainValid).find(a=>typeOfAsset(a)==='grassland')||assets.find(isTerrainValid);
 state.hexTerrain={};if(selected)for(const c of worldCells)state.hexTerrain[key(c.q,c.r)]=selected.path;
 state.relief={...state.relief,enabled:true,profile:'steep',strength:95,center:'0,0',connected:true,padBuildings:true};
 state.objects=true;state.river=false;state.showLegacyNature=false;$('objectsToggle').checked=true;$('riverToggle').checked=false;$('nShowDemo').checked=false;
 invalidateTerrain();state.panX=0;state.panY=0;setView('map');applyZoom(.85);reliefChange();
});
$('reliefGrassTest').addEventListener('click',()=>{
 state.sceneSize=19;$('sceneSize').value='19';assignBiomes();
 const grass=assets.find(a=>isTerrainValid(a)&&typeOfAsset(a)==='grassland')||assets.find(isTerrainValid);
 state.hexTerrain={};if(grass)for(const c of worldCells)state.hexTerrain[key(c.q,c.r)]=grass.path;
 state.objects=true;state.river=false;state.grid=false;
 $('objectsToggle').checked=true;$('riverToggle').checked=false;$('gridToggle').checked=false;
 state.showLegacyNature=true;$('nShowDemo').checked=true;
 state.relief={...state.relief,center:'0,0',enabled:true,profile:'rounded',strength:85,connected:true};
 invalidateTerrain();setView('map');state.panX=0;state.panY=0;applyZoom(.70);reliefChange();});
$('reliefBiomesTest').addEventListener('click',()=>{
 state.sceneSize=19;$('sceneSize').value='19';assignBiomes();state.hexTerrain={};
 const sampleTypes=['grassland','dry_ground','forest_floor','hilly_ground'];
 const sample=sampleTypes.map(t=>assets.find(a=>isTerrainValid(a)&&typeOfAsset(a)===t)).filter(Boolean);
 if(sample.length>=2)for(const c of worldCells)state.hexTerrain[key(c.q,c.r)]=(c.q<0?sample[0]:c.q===0?sample[Math.min(1,sample.length-1)]:sample[Math.min(2,sample.length-1)]).path;
 state.objects=true;state.river=false;state.grid=false;state.edgeBlend=true;
 $('objectsToggle').checked=true;$('riverToggle').checked=false;$('gridToggle').checked=false;$('edgeBlendToggle').checked=true;
 state.showLegacyNature=true;$('nShowDemo').checked=true;
 state.relief={...state.relief,center:'0,0',enabled:true,profile:'ridge',strength:90,connected:true};
 invalidateTerrain();setView('map');state.panX=0;state.panY=0;applyZoom(.70);reliefChange();});
$('objectsToggle').checked=state.objects;
restoreScene();syncPolishControls();$('riverToggle').checked=state.river;$('zoomSlider').value=Math.round(state.zoom*100);$('zoomText').textContent=Math.round(state.zoom*100)+' %';$('mountainDebug').checked=!!state.mountainDebug;$('mountainMode').value=state.mountainMode==='chain'?'chain':'single';$('mountainChainId').value=state.mountainChainId||'alpen_01';$('mountainSpacing').value=state.mountainSpacing;$('mountainShadowDebug').checked=!!state.mountainShadowDebug;syncReliefUI();$('edgeIrregularity').value=String(state.edgeIrregularity);$('irregularityText').textContent=String(state.edgeIrregularity);$('cornerBlendToggle').checked=state.cornerBlend;$('transitionDebugMode').value=state.transitionDebugMode;$('edgeBlendToggle').checked=state.edgeBlend;$('blendVariantsToggle').checked=state.blendVariants;$('waterSamplingMode').value=state.waterSampling;$('edgeDebugToggle').checked=state.edgeDebug;$('edgeWidth').value=String(state.edgeWidth);$('edgeWidthText').textContent=String(state.edgeWidth);$('shorelineToggle').checked=state.shoreline.enabled!==false;$('shorelineMode').value=state.shoreline.mode||'art';$('shorelineWidth').value=String(state.shoreline.width||34);$('shorelineWidthText').textContent=String(state.shoreline.width||34);$('shorelineOuter').value=String(state.shoreline.outer||10);$('shorelineOuterText').textContent=String(state.shoreline.outer||10);syncShorelineControls();assignBiomes();reloadFromServer();
window.addEventListener('vedras:nature-catalog-changed',()=>renderAssetsList());
window.addEventListener('vedras:terrain-catalog-changed',terrainTestOptions);
window.addEventListener('vedras:assets-loaded',()=>{terrainTestOptions();syncTerrainTestUI();});
window.VedrasAssetLabor={terrainReady:()=>catalogCanSave,state,catalog:()=>catalog,assets:()=>assets,cells:()=>worldCells,persistScene,requestDraw,onSelect:null,inspectTerrain,isTerrainValid,effectiveBiome,baseBiomeOf,typeOfAsset,geometry:{HEX,R,PROJECT_Y,MAX_BUILD},forestCells,riverRoutes,invalidateTerrain,mountains:{validMountains,reservedMountainHexes},relief:{height:reliefHeight,displayY:displayGroundY},autotile:()=>window.__vedrasLastAutotile,toScreen,pixelToHex,assignBiomes,reloadFromServer};
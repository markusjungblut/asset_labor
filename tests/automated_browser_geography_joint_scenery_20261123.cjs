'use strict';
/* Real Firefox proof: original birch, mountain AND warm boulder PNG in ONE joined 2.5x
 * world tile. Overlapping strips across adjacent WorldTiles must have
 * identical RGBA pixels. This does not claim editor 4x or shadows parity.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const Geo=require('../worldgen-geography.js');
const Plan=require('../large-map-bake-plan.js');
const root=path.resolve(__dirname,'..');
// Direct editor source functions: run app.js itself for independent
// compositing, visibility and depth-order comparison, not copied formulas.
const editorSource=fs.readFileSync(path.join(root,'app.js'),'utf8');
function fromEditor(begin,end){
 const start=editorSource.indexOf(begin);
 const stop=editorSource.indexOf(end,start+begin.length);
 if(start<0||stop<=start)throw Error('Editor source boundary missing: '+begin);
 return editorSource.slice(start,stop);
}
const editorCompositeSource=[
 fromEditor('function visibleBounds(img){','// Large neighboring objects rise'),
 fromEditor('function protectsSouthwestLargeSprite(', '// A cast may overlap an elevated tree'),
 fromEditor('function mountainShadowReachesFoot(', '// The owner\'s own cast'),
 fromEditor('function spriteMountainCasts(', '// Reuse one scratch canvas'),
 fromEditor('let spriteShadeCanvas=null;','function drawNatureShadow('),
 fromEditor('function mountainCoversBase(', '// Build once per scene edit')
].join('\n');
// Compile the ORIGINAL low-resolution shadowLocalMask from app.js directly
// in Firefox; the adapter must match its own source, not a copied unit mock.
const editorLocalMaskSource=fromEditor(
 'function shadowLocalMask(width,settings,global){',
 '// Reuse the exact same mountain-shadow rasters');
const names=['assets/nature/birke1.png','assets/nature/berg_01.png',
 'assets/nature/boulder_36.png','assets/nature/boulder_01.png',
 'assets/nature/snow_patch_01.png','assets/nature/bush_01.png',
 'assets/nature/fallen_log_01.png','assets/nature/dead_tree_01.png'];
const nature=JSON.parse(fs.readFileSync(path.join(root,
 'assets/nature/nature_catalog.json'),'utf8'));
const terrain=JSON.parse(fs.readFileSync(path.join(root,
 'assets/terrain/terrain_catalog.json'),'utf8'));
const shadowProfiles=JSON.parse(fs.readFileSync(path.join(root,
 'assets/shadows/sprite_shadow_profiles.json'),'utf8'));
for(const file of names)assert(fs.statSync(path.join(root,file)).size>1024,
 'Original PNG is missing: '+file);
const allowed=new Set([...names,'sprite-planner.js','nature-balance.js',
 'polish.js','mountain.js','relief.js','autotile.js',
 'large-map-bake-ground-relief.js','large-map-bake-plan.js',
 'large-map-bake-joint-scenery.js','large-map-bake-scenery-seam.js',
 'large-map-bake-original-sprite-shadows.js',
 'large-map-bake-original-mountain-shadows.js',
 'large-map-bake-authored-mountain-shadows.js',
 'large-map-bake-mountain-receivers.js',
 'large-map-bake-editor-reference-sprite.js',
 'large-map-bake-editor-composite-audit.js',
 'large-map-bake-shadow-pixel-attribution.js',
 'large-map-bake-alpha-source-over-ab.js',
 'large-map-bake-editor-local-mountain-mask.js',
 'shadow-system.js','shadow-tone.js',
 'shadow-shapes.js','sprite-shadow-editor.js']);
const world=Geo.generateWorld('original-tree-mountain-png-proof',
 {width:10,height:10});
const plan=Plan.plan(world);
(async()=>{
 const server=http.createServer((req,res)=>{
  const filename=decodeURIComponent((req.url||'/').split('?')[0])
   .replace(/^\//,'');
  if(filename==='test'){
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
   res.end('<!doctype html><title>Joint Nature Scenery pixel test</title>');return;
  }
  if(!allowed.has(filename)){res.writeHead(404);res.end('not found');return;}
  res.writeHead(200,{'Content-Type':filename.endsWith('.png')?
   'image/png':'text/javascript','Cache-Control':'no-store'});
  fs.createReadStream(path.join(root,filename)).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser=null;
 try{
  const {firefox}=require('playwright');
  browser=await firefox.launch({headless:true});
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const origin='http://127.0.0.1:'+server.address().port;
  await page.goto(origin+'/test',{waitUntil:'load'});
  for(const file of ['sprite-planner.js','nature-balance.js','polish.js',
   'mountain.js','relief.js','autotile.js','large-map-bake-plan.js',
   'large-map-bake-ground-relief.js','large-map-bake-joint-scenery.js',
   'large-map-bake-scenery-seam.js',
   'shadow-tone.js','shadow-system.js','shadow-shapes.js',
   'sprite-shadow-editor.js','large-map-bake-original-sprite-shadows.js',
   'large-map-bake-authored-mountain-shadows.js',
   'large-map-bake-original-mountain-shadows.js',
   'large-map-bake-mountain-receivers.js',
   'large-map-bake-editor-reference-sprite.js',
   'large-map-bake-editor-composite-audit.js',
   'large-map-bake-shadow-pixel-attribution.js',
   'large-map-bake-alpha-source-over-ab.js',
   'large-map-bake-editor-local-mountain-mask.js'])
   await page.addScriptTag({url:origin+'/'+file});
  const result=await page.evaluate(async({world,plan,nature,terrain,names,shadowProfiles,editorCompositeSource,
  editorLocalMaskSource})=>{
   const [tree,mount,rock,ordinary,snow,bush,log,deadTree]=names;
   const imageByPath=new Map();
   for(const p of names){
    const img=new Image();img.src='/'+p;await img.decode();
    imageByPath.set(p,img);
   }
   const source={version:world.version,seed:world.seed,width:world.width,
    height:world.height,originQ:world.originQ,originR:world.originR};
   const revision=nature.revision??null;
   const treePlan={schema:'vedras-geography-tree-trunk-plan-v1',
    complete:false,readyForViewer:false,rasterized:false,
    requiresTreeShadows:true,earlierWarmBoulders:1,
    worldHexes:world.cells.length,
    worldSource:source,natureCatalogRevision:revision,seed:12345,
    instances:[{q:3,r:0,dx:-115,dy:70,assetPath:tree,
     assetId:nature.entries[tree.slice(7)].id,scale:1,
     source:'geography-original-tree-trunk-preview'}]};
   const mountainPlan={schema:'vedras-geography-scenery-source-v1',
    complete:false,readyForViewer:false,rasterized:false,
    worldHexes:world.cells.length,worldSource:source,
    natureCatalogRevision:revision,seed:12345,
    instances:[{q:2,r:0,assetPath:mount,
     assetId:nature.entries[mount.slice(7)].id,
     width:nature.entries[mount.slice(7)].logicalWidth,
     mode:'chain',chainId:'geography_0',coreRadius:0,radius:1,
     source:'geography-scenery-preview'},
     // q=3,r=1 has a PNG body OUTSIDE tile 0,0, but its left cast
     // reaches the real shared-pixel strip and must be included there.
     {q:3,r:1,assetPath:mount,
     assetId:nature.entries[mount.slice(7)].id,
     width:nature.entries[mount.slice(7)].logicalWidth,
     mode:'chain',chainId:'geography_1',coreRadius:0,radius:1,
     source:'geography-scenery-preview'}]};
   const boulderPlan={schema:'vedras-geography-warm-boulder-prepass-v1',
    stage:'original-warm-boulders-before-canopy',
    complete:false,readyForViewer:false,rasterized:false,
    worldHexes:world.cells.length,worldSource:source,
    natureCatalogRevision:revision,seed:12345,
    instances:[{q:3,r:0,dx:-95,dy:65,assetPath:rock,
     assetId:nature.entries[rock.slice(7)].id,scale:1,
     source:'geography-original-warm-boulder-prepass'}]};
   const latePlan={schema:'vedras-geography-late-rock-snow-v1',
    stage:'original-late-rock-and-snow-after-trees',
    complete:false,readyForViewer:false,rasterized:false,
    worldHexes:world.cells.length,worldSource:source,
    natureCatalogRevision:revision,seed:12345,
    earlierWarmBoulders:1,earlierTrees:1,
    instances:[
     {q:2,r:1,dx:-60,dy:48,assetPath:ordinary,
      assetId:nature.entries[ordinary.slice(7)].id,scale:1,
      kind:'rock',source:'geography-original-late-rock-snow'},
     {q:3,r:0,dx:-100,dy:35,assetPath:snow,
      assetId:nature.entries[snow.slice(7)].id,scale:1,
      kind:'snow',source:'geography-original-late-rock-snow'}
    ]};
   const accentPlan={schema:'vedras-geography-nature-accents-v1',
    stage:'original-shrubs-deadwood-and-accents-after-snow',
    complete:false,readyForViewer:false,rasterized:false,
    worldHexes:world.cells.length,worldSource:source,
    natureCatalogRevision:revision,seed:12345,
    earlierWarmBoulders:1,earlierTrees:1,earlierRocksAndSnow:2,
    instances:[
     {q:2,r:1,dx:-92,dy:45,assetPath:bush,
      assetId:nature.entries[bush.slice(7)].id,scale:1,
      kind:nature.entries[bush.slice(7)].kind,
      source:'geography-original-late-accents'},
     {q:2,r:1,dx:-115,dy:65,assetPath:log,
      assetId:nature.entries[log.slice(7)].id,scale:1,
      kind:nature.entries[log.slice(7)].kind,
      source:'geography-original-late-accents'}
    ]};
   const assets=names.map(p=>({path:p,relPath:p.slice(7),category:'nature'}));
   const renderer=window.VedrasLargeMapJointScenery.create({
    world,plan,treePlan,mountainPlan,boulderPlan,latePlan,accentPlan,
    terrainCatalog:terrain,
    natureCatalog:nature,assets,
    loadImage:async a=>({img:imageByPath.get(a.path)})
   });
   const profiles=window.VedrasSpriteShadows.valid(shadowProfiles);
   window.VedrasSpriteShadows.set(profiles);
   const a=await renderer.renderTile('0,0',{
    previewSpriteShadows:true,previewMountainShadows:true
   });
   const b=await renderer.renderTile('1,0',{
    previewSpriteShadows:true,previewMountainShadows:true
   });
   const verifier=window.VedrasJointScenerySeam.create({
    plan,allowShadowPreview:true,allowMountainShadowPreview:true,renderer:{
    previewOnly:true,defaultTile:()=> '0,0',
    renderTile:async id=>id==='0,0'?a:b
   }});
   console.log('MOUNTAIN_SHADOW_PREVERIFY',JSON.stringify({
    tiles:[{id:a.tile.id,stage:a.stage,shadows:a.drawnOriginalMountainShadows,
     shadowPixels:a.originalMountainShadowPositivePixels,
     needs:a.needsOriginalMountainShadows,
     profiles:a.originalShadowProfiles,scenePresetGate:a.needsMountainShadowScenePresetParity},
     {id:b.tile.id,stage:b.stage,shadows:b.drawnOriginalMountainShadows,
     shadowPixels:b.originalMountainShadowPositivePixels,
     needs:b.needsOriginalMountainShadows,
     profiles:b.originalShadowProfiles,scenePresetGate:b.needsMountainShadowScenePresetParity}]
   }));
   const pixelProof=await verifier.verifyPair('0,0','right');
   const authoredExport={
    schema:'vedras-asset-labor-scene-0.8',schemaVersion:3,
    projection:{hexWidth:256,groundY:.85},shadowGlobal:1.12,
    mountainShadowDefaults:{angle:154,length:.82,originX:-.12,
     originY:.04,opacity:.53,rootWidth:.31,midWidth:.20,
     tipWidth:.12,softness:14,contactWidth:.18,contactLength:.39},
    shadowAssetPresets:{[mount]:{angle:178,length:.9,rootWidth:.35}},
    mountainInstances:mountainPlan.instances.map((m,i)=>({
     ...m,shadowAngle:i===0?163:189,
     shadowLength:i===0?.7:1.1,shadowOriginX:-.16
    })),
    shadowTone:{gray:0,mountains:true,balance:0}
   };
   const authored=window.VedrasLargeMapAuthoredMountainShadows.create({
    scene:authoredExport,mountainPlan,shadows:window.VedrasShadows,
    tone:window.VedrasShadowTone
   });
   if(!authored.instanceMatchComplete)throw Error('Expected exact exported source match');
   const toneBefore=window.VedrasShadowTone.get();
   // Compare authored geometry with the SAME visible tone as the baseline.
   if(toneBefore.gray!==0)throw Error('Fixture assumes fresh default editor tone.');
   let authA,authB,authProof;
   try{
    window.VedrasShadowTone.set(authored.shadowTone,{persist:false});
    authA=await renderer.renderTile('0,0',{
     previewSpriteShadows:true,previewMountainShadows:true,
     authoredShadowScene:authored
    });
    authB=await renderer.renderTile('1,0',{
     previewSpriteShadows:true,previewMountainShadows:true,
     authoredShadowScene:authored
    });
    const verifyAuth=window.VedrasJointScenerySeam.create({
     plan,allowShadowPreview:true,allowMountainShadowPreview:true,
     allowAuthoredMountainScene:true,renderer:{
      previewOnly:true,defaultTile:()=> '0,0',
      renderTile:async id=>id==='0,0'?authA:authB
     }
    });
    authProof=await verifyAuth.verifyPair('0,0','right');
   }finally{
    window.VedrasShadowTone.set(toneBefore,{persist:false});
   }
   // A small REAL shrub field sits southwest of the first native cast.
   // The sampling is deterministic and is deliberately not a fake flat
   // receiver silhouette. Original PNGs and the actual relief remain active.
   const receiverSites=[];
   for(const dx of [-100,-40,20,80])
    for(const dy of [35,85,135])
     receiverSites.push({q:1,r:0,dx,dy,assetPath:bush,
      assetId:nature.entries[bush.slice(7)].id,scale:1,
      kind:nature.entries[bush.slice(7)].kind,
      source:'geography-original-late-accents'});
   const receivingPlan={...accentPlan,
    instances:[...accentPlan.instances,...receiverSites]};
   const receiverRenderer=window.VedrasLargeMapJointScenery.create({
    world,plan,treePlan,mountainPlan,boulderPlan,latePlan,
    accentPlan:receivingPlan,terrainCatalog:terrain,natureCatalog:nature,
    assets,loadImage:async a=>({img:imageByPath.get(a.path)})
   });
   const receiverBefore=await receiverRenderer.renderTile('0,0',{
    previewSpriteShadows:true,previewMountainShadows:true
   });
   const receiverLeft=await receiverRenderer.renderTile('0,0',{
    previewSpriteShadows:true,previewMountainShadows:true,
    previewMountainReceivers:true
   });
   const receiverRight=await receiverRenderer.renderTile('1,0',{
    previewSpriteShadows:true,previewMountainShadows:true,
    previewMountainReceivers:true
   });
   console.log('MOUNTAIN_RECEIVER_COUNTS',JSON.stringify({
    receivers:[receiverLeft.drawnMountainShadowReceivers,
     receiverRight.drawnMountainShadowReceivers],
    casts:[receiverLeft.drawnMountainReceiverCasts,
     receiverRight.drawnMountainReceiverCasts],
    groundShadows:[receiverLeft.drawnOriginalMountainShadows,
     receiverRight.drawnOriginalMountainShadows]
   }));
   const receiverVerifier=window.VedrasJointScenerySeam.create({
    plan,allowShadowPreview:true,allowMountainShadowPreview:true,
    allowReceiverPreview:true,renderer:{
     previewOnly:true,defaultTile:()=> '0,0',
     renderTile:async id=>id==='0,0'?receiverLeft:receiverRight
    }
   });
   const receiverProof=await receiverVerifier.verifyPair('0,0','right');
   // Independent opt-in experiment: FULL ORIGINAL Sprite height is not
   // multiplied by the ground-foot PROJECT_Y=.85. Both neighboring tiles
   // still use the integer WORLD raster and both old options stay unchanged.
   const editorBareLegacy=await renderer.renderTile('0,0');
   const editorBareLeft=await renderer.renderTile('0,0',{
    previewEditorProjection:true
   });
   const editorBareRight=await renderer.renderTile('1,0',{
    previewEditorProjection:true
   });
   const editorBareProof=await window.VedrasJointScenerySeam.create({
    plan,allowEditorProjectionPreview:true,renderer:{
     previewOnly:true,defaultTile:()=> '0,0',
     renderTile:async id=>id==='0,0'?editorBareLeft:editorBareRight
    }
   }).verifyPair('0,0','right');
   const editorShadowNoReceiver=await receiverRenderer.renderTile('0,0',{
    previewSpriteShadows:true,previewMountainShadows:true,
    previewEditorProjection:true
   });
   const editorShadowLeft=await receiverRenderer.renderTile('0,0',{
    previewSpriteShadows:true,previewMountainShadows:true,
    previewMountainReceivers:true,previewEditorProjection:true
   });
   const editorShadowRight=await receiverRenderer.renderTile('1,0',{
    previewSpriteShadows:true,previewMountainShadows:true,
    previewMountainReceivers:true,previewEditorProjection:true
   });
   const editorShadowProof=await window.VedrasJointScenerySeam.create({
    plan,allowShadowPreview:true,allowMountainShadowPreview:true,
    allowReceiverPreview:true,allowEditorProjectionPreview:true,
    renderer:{previewOnly:true,defaultTile:()=> '0,0',
     renderTile:async id=>id==='0,0'?editorShadowLeft:editorShadowRight}
   }).verifyPair('0,0','right');

   // Phase 2.8q. Exercise multiple living trees, one covered dead tree,
   // overlapping shrubs, warm/late rocks and TWO original mountains. This
   // is a fixed read-only editor scene; no generated assets are changed.
   const extraTrees=[
    {q:1,r:0,dx:90,dy:90,assetPath:tree,
     assetId:nature.entries[tree.slice(7)].id,scale:1,
     source:'geography-original-tree-trunk-preview'},
    {q:4,r:0,dx:-95,dy:90,assetPath:tree,
     assetId:nature.entries[tree.slice(7)].id,scale:1,
     source:'geography-original-tree-trunk-preview'}
   ];
   const compositeTrees={...treePlan,
    instances:[...treePlan.instances,...extraTrees]};
   const compositeLate={...latePlan,earlierTrees:compositeTrees.instances.length};
   const coveredDeadTree={q:3,r:0,dx:-115,dy:70,
    assetPath:deadTree,assetId:nature.entries[deadTree.slice(7)].id,
    scale:1,kind:'tree',source:'geography-original-late-accents'};
   const compositeAccents={...receivingPlan,
    earlierTrees:compositeTrees.instances.length,
    instances:[...receivingPlan.instances,coveredDeadTree]};
   const compositeRenderer=window.VedrasLargeMapJointScenery.create({
    world,plan,treePlan:compositeTrees,mountainPlan,boulderPlan,
    latePlan:compositeLate,accentPlan:compositeAccents,
    terrainCatalog:terrain,natureCatalog:nature,
    assets,loadImage:async a=>({img:imageByPath.get(a.path)})
   });
   const sourceNative=new Function('ctx','state','toScreen',
    'mountainCastsForFrame','finalRendering','spriteAtlas',
    'mountainAlphaCache','natureBounds','clamp',
    '"use strict";\n'+editorCompositeSource+
    '\nreturn {visibleBounds,drawSprite,mountainCoversBase,spriteMountainCasts};');
   const nativeClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
   const nativeState={zoom:2.5,dpr:2,visualPolish:{nature:.4},
    natureInstances:Array(501),objects:true};
   const nativeToScreen=(x,y)=>({x:x*2.5,y:y*2.5*.85});
   function nativeComposite(output){
    const trace=output.editorCompositeReference;
    if(trace?.source!=='read-only-original-editor-reference-candidates-v1'||
     trace.readyForViewer!==false||trace.complete!==false||
     !trace.background||!trace.candidates.length)
     throw Error('Editor composite requires a complete READ-ONLY source trace');
    const screen=document.createElement('canvas');
    screen.width=output.width;screen.height=output.height;
    const target=screen.getContext('2d',{willReadFrequently:true});
    target.drawImage(trace.background,0,0);
    target.setTransform(1,0,0,1,-trace.sampleX,-trace.sampleY);
    const obj=raw=>({
     type:raw.item.type==='mountain'?'mountain':'nature',
     x:raw.item.p.x,y:raw.g.y,w:raw.g.width,
     sortY:raw.g.y,cell:raw.item.inst.q+','+raw.item.inst.r,
     natureMeta:raw.item.meta,
     asset:{img:raw.img,path:raw.item.inst.assetPath},
     itemOrdinal:raw.item.ordinal,
     groundY:raw.item.p.y
    });
    const owners=new Map(trace.candidates.map(o=>[o.item,obj(o)]));
    for(const m of trace.shadowOnlyMountains)owners.set(m.item,obj(m));
    const placed=trace.candidates.map(o=>owners.get(o.item));
    const mountains=placed.filter(o=>o.type==='mountain');
    const native=sourceNative(target,nativeState,nativeToScreen,
     trace.mountainCasts.map(c=>({
      owner:owners.get(c.owner.item),
      canvas:c.canvas,x:c.box.left,y:c.box.top,
      width:c.box.width,height:c.box.height,shape:c.shape,
      modelWidth:c.modelWidth,strength:c.strength,peakAlpha:c.peakAlpha
     })),true,null,new WeakMap(),new WeakMap(),nativeClamp);
    for(const o of placed)if(o.type==='nature'){
     o.coveredByMountains=new Set(mountains.filter(m=>
      native.mountainCoversBase(o,m)));
    }
    const hidden=placed.filter(o=>o.type==='nature'&&
     o.natureMeta?.kind==='tree'&&o.coveredByMountains.size>0);
    const visible=placed.filter(o=>!hidden.includes(o));
    visible.sort((a,b)=>{
     if(a.type==='mountain'&&b.coveredByMountains?.has(a))return 1;
     if(b.type==='mountain'&&a.coveredByMountains?.has(b))return -1;
     return a.sortY-b.sortY||(a.x-b.x);
    });
    for(const o of visible)native.drawSprite(o);
    target.setTransform(1,0,0,1,0,0);
    return {ctx:target,
     hidden:hidden.map(o=>o.itemOrdinal),
     order:visible.map(o=>o.itemOrdinal),
     candidates:placed.length,
     count:visible.length};
   }
   const compareFrames=(a,b)=>{
    const A=a.getImageData(0,0,a.canvas.width,a.canvas.height).data,
     B=b.getImageData(0,0,b.canvas.width,b.canvas.height).data;
    if(A.length!==B.length)throw Error('Composite image lengths differ');
    let different=0,painted=0,maxDelta=0;
    const samples=[];
    for(let i=0;i<A.length;i+=4){
     if(A[i+3]>0||B[i+3]>0)painted++;
     if(A[i]!==B[i]||A[i+1]!==B[i+1]||
      A[i+2]!==B[i+2]||A[i+3]!==B[i+3]){
      different++;
      maxDelta=Math.max(maxDelta,
       Math.abs(A[i]-B[i]),Math.abs(A[i+1]-B[i+1]),
       Math.abs(A[i+2]-B[i+2]),Math.abs(A[i+3]-B[i+3]));
      if(samples.length<5)
       samples.push({x:(i/4)%a.canvas.width,
        y:Math.floor((i/4)/a.canvas.width),
        original:[...A.slice(i,i+4)],editor:[...B.slice(i,i+4)]});
     }
    }
    return {different,painted,maxDelta,samples};
   };
   const compositeBare0=await compositeRenderer.renderTile('0,0',{
    previewEditorProjection:true,captureEditorCompositeReference:true
   });
   const compositeBare1=await compositeRenderer.renderTile('1,0',{
    previewEditorProjection:true,captureEditorCompositeReference:true
   });
   const compositeShadow0=await compositeRenderer.renderTile('0,0',{
    previewEditorProjection:true,previewSpriteShadows:true,
    previewMountainShadows:true,previewMountainReceivers:true,
    captureEditorCompositeReference:true,captureAlphaAB:true
   });
   const compositeShadow1=await compositeRenderer.renderTile('1,0',{
    previewEditorProjection:true,previewSpriteShadows:true,
    previewMountainShadows:true,previewMountainReceivers:true,
    captureEditorCompositeReference:true,captureAlphaAB:true
   });
   // Phase 2.8u: same original mountain PNGs with independently
   // extracted app.js shadowLocalMask (0.6 / 320 px local canvas).
   // The old renderer and old alpha candidates are preserved unchanged.
   const localMasked0=await compositeRenderer.renderTile('0,0',{
    previewEditorProjection:true,previewSpriteShadows:true,
    previewMountainShadows:true,previewMountainReceivers:true,
    captureEditorCompositeReference:true,
    previewEditorLocalMountainMask:true
   });
   const localMasked1=await compositeRenderer.renderTile('1,0',{
    previewEditorProjection:true,previewSpriteShadows:true,
    previewMountainShadows:true,previewMountainReceivers:true,
    captureEditorCompositeReference:true,
    previewEditorLocalMountainMask:true
   });
   const localMaskSeam=await window.VedrasJointScenerySeam.create({
    plan,allowShadowPreview:true,allowMountainShadowPreview:true,
    allowReceiverPreview:true,allowEditorProjectionPreview:true,
    renderer:{previewOnly:true,defaultTile:()=> '0,0',
     renderTile:async id=>id==='0,0'?localMasked0:localMasked1}
   }).verifyPair('0,0','right');
   const originalShadowLocal=new Function('window','document',
    '"use strict";\n'+
    'const mountainShadowRasterCache=new Map();'+
    'let mountainShadowCachedPixels=0;\n'+editorLocalMaskSource+
    '\nreturn shadowLocalMask;')(window,document);
   // Phase 2.8v: source-exact local Editor masks for DIFFERENT widths and
   // exported styles. World mountains have catalogue-fixed logicalWidth=360:
   // deliberately do not falsify original assets to get arbitrary widths.
   const originalMaskEngine=window.VedrasEditorLocalMountainMask,
    originalStyleEngine=window.VedrasLargeMapAuthoredMountainShadows,
    originalMountainEngine=window.VedrasShadows,
    bitmapCanvas=()=>document.createElement('canvas');
   const maskStyles=[
    {case:'small-480px',width:480,origin:{x:1031.375,y:991.625},
     settings:originalMountainEngine.settings({
      ...originalMountainEngine.settings(),angle:145,softness:7,
      opacity:.41,rootWidth:.28,length:.64})},
    {case:'authored-first-900px',width:900,origin:{x:1200.25,y:1095.875},
     settings:originalStyleEngine.resolve(authored,
      mountainPlan.instances[0],originalMountainEngine)},
    {case:'authored-second-1280px',width:1280,
     origin:{x:1270.625,y:1120.375},
     settings:originalStyleEngine.resolve(authored,
      mountainPlan.instances[1],originalMountainEngine)}
   ];
   const variableRasterReceipt=[];
   for(const v of maskStyles){
    const generated=originalMaskEngine.raster({
     width:v.width,settings:v.settings,strength:1.12,
     canvasFactory:bitmapCanvas,shadows:originalMountainEngine
    });
    const editor=originalShadowLocal(v.width,v.settings,1.12);
    if(generated.canvas.width!==editor.canvas.width||
     generated.canvas.height!==editor.canvas.height)
     throw Error('2.8v original local-mask dimensions differ for '+v.case);
    const A=generated.canvas.getContext('2d',{willReadFrequently:true})
     .getImageData(0,0,generated.canvas.width,generated.canvas.height).data,
     B=editor.canvas.getContext('2d',{willReadFrequently:true})
     .getImageData(0,0,editor.canvas.width,editor.canvas.height).data;
    let mismatches=0,positive=0,minX=Infinity,maxX=-Infinity,
     minY=Infinity,maxY=-Infinity;
    for(let i=0;i<A.length;i+=4){
     const p=i/4,x=p%generated.canvas.width,
      y=Math.floor(p/generated.canvas.width);
     if(A[i]!==B[i]||A[i+1]!==B[i+1]||
      A[i+2]!==B[i+2]||A[i+3]!==B[i+3])mismatches++;
     if(B[i+3]>0){
      positive++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);
      minY=Math.min(minY,y);maxY=Math.max(maxY,y);
     }
    }
    if(!positive||!Number.isFinite(minX+minY+maxX+maxY))
     throw Error('2.8v original Editor mask must have positive source alpha');
    const got=originalMaskEngine.cast({raster:generated,origin:v.origin});
    const expected={
     x:v.origin.x+editor.left/editor.factor,
     y:v.origin.y+editor.top/editor.factor,
     width:editor.canvas.width/editor.factor,
     height:editor.canvas.height/editor.factor
    };
    const placementError=Math.max(
     Math.abs(got.x-expected.x),Math.abs(got.y-expected.y),
     Math.abs(got.width-expected.width),
     Math.abs(got.height-expected.height));
    variableRasterReceipt.push({case:v.case,width:v.width,
     factor:generated.factor,
     cachedWidth:generated.canvas.width,
     cachedHeight:generated.canvas.height,
     sourceRGBAChanged:mismatches,positive,
     placementError,peakAlpha:generated.maxAlpha,
     sourcePeakAlpha:editor.peakAlpha,
     positiveExtent:{minX,maxX,minY,maxY},
     complete:false,readyForViewer:false});
   }
   // Force a real source-derived alpha-positive part of a FRACTIONALLY
   // placed ORIGINAL cast through BOTH the right and down tile overlaps.
   // The integer GLOBAL scratch is copied without source re-sampling at
   // separate tile origins. This is a ground-mask seam probe, separate
   // from the full original sprite scene checked below.
   const overlapStyle=maskStyles[1],
    overlapSource=originalMaskEngine.raster({
     width:overlapStyle.width,settings:overlapStyle.settings,
     strength:1.12,canvasFactory:bitmapCanvas,shadows:originalMountainEngine
    });
   const ex=variableRasterReceipt[1].positiveExtent,
    centerX=(ex.minX+ex.maxX)/2,centerY=(ex.minY+ex.maxY)/2,
    positiveCenter={x:1270.375,y:1110.625};
   const centeredOrigin={
    x:positiveCenter.x-(overlapSource.left+centerX)/overlapSource.factor,
    y:positiveCenter.y-(overlapSource.top+centerY)/overlapSource.factor
   };
   const crossCast=originalMaskEngine.cast({
    raster:overlapSource,origin:centeredOrigin});
   const crossBox=originalMaskEngine.globalBox({cast:crossCast});
   const master=bitmapCanvas();master.width=crossBox.width;
   master.height=crossBox.height;
   const masterContext=master.getContext('2d',{willReadFrequently:true});
   masterContext.drawImage(crossCast.canvas,
    crossCast.x-crossBox.left,crossCast.y-crossBox.top,
    crossCast.width,crossCast.height);
   const tileAlpha=(ox,oy)=>{
    const cv=bitmapCanvas();cv.width=1920;cv.height=1632;
    const c=cv.getContext('2d',{willReadFrequently:true});
    c.drawImage(master,crossBox.left-ox,crossBox.top-oy);
    return c.getImageData(0,0,1920,1632).data;
   };
   const acrossLeft=tileAlpha(-320,-272),
    acrossRight=tileAlpha(960,-272),
    acrossDown=tileAlpha(-320,816);
   const seamCheck=(first,second,dir)=>{
    const w=dir==='right'?640:1920,h=dir==='down'?544:1632,
     offsetX=dir==='right'?1280:0,
     offsetY=dir==='down'?1088:0;
    let different=0,painted=0,maxDelta=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
     const a=((y+offsetY)*1920+x+offsetX)*4,
      b=(y*1920+x)*4;
     if(first[a+3]||second[b+3])painted++;
     for(let channel=0;channel<4;channel++){
      const delta=Math.abs(first[a+channel]-second[b+channel]);
      if(delta){maxDelta=Math.max(maxDelta,delta);}
     }
     if(first[a]!==second[b]||first[a+1]!==second[b+1]||
      first[a+2]!==second[b+2]||first[a+3]!==second[b+3])
      different++;
    }
    return {direction:dir,different,painted,maxDelta,width:w,height:h};
   };
   const fractionalGlobalSeams=[
    seamCheck(acrossLeft,acrossRight,'right'),
    seamCheck(acrossLeft,acrossDown,'down')
   ];
   // Full real-PNG fixture: two exported ORIGINAL mountain instances
   // plus a third actual catalogue mountain whose foot straddles a
   // vertical tile overlap. Distinct instance style overrides are source
   // validated; a mountain's hard-coded logicalWidth is NOT changed.
   const downMountain={...mountainPlan.instances[0],
    q:2,r:2,mode:'chain',chainId:'geography_vertical_2',
    coreRadius:0,radius:1};
   const variantMountainPlan={...mountainPlan,
    instances:[...mountainPlan.instances,downMountain]};
   const styleExport={...authoredExport,
    mountainShadowDefaults:{...authoredExport.mountainShadowDefaults,
     softness:10,rootWidth:.27,tipWidth:.095},
    shadowAssetPresets:{[mount]:{
     angle:179,length:.91,rootWidth:.34,softness:9,
     contactWidth:.15}},
    mountainInstances:variantMountainPlan.instances.map((m,i)=>({
     ...m,shadowAngle:[153,211,188][i],
     shadowLength:[.73,1.08,.48][i],
     shadowSoftness:[5,22,33][i],
     shadowOriginX:[-.12,-.21,.035][i],
     shadowOriginY:[.04,.08,-.055][i]
    }))
   };
   const variantAuthored=originalStyleEngine.create({
    scene:styleExport,mountainPlan:variantMountainPlan,
    shadows:originalMountainEngine,tone:window.VedrasShadowTone
   });
   if(!variantAuthored.instanceMatchComplete||
    variantAuthored.instancesInPlan!==3)
    throw Error('2.8v needs three exactly matched exported mountain instances');
   const variedRenderer=window.VedrasLargeMapJointScenery.create({
    world,plan,treePlan:compositeTrees,mountainPlan:variantMountainPlan,
    boulderPlan,latePlan:compositeLate,accentPlan:compositeAccents,
    terrainCatalog:terrain,natureCatalog:nature,assets,
    loadImage:async a=>({img:imageByPath.get(a.path)})
   });
   const variedOptions={
    previewEditorProjection:true,previewSpriteShadows:true,
    previewMountainShadows:true,previewMountainReceivers:true,
    authoredShadowScene:variantAuthored,captureEditorCompositeReference:true
   };
   const variedLocalLeft=await variedRenderer.renderTile('0,0',{
    ...variedOptions,previewEditorLocalMountainMask:true
   });
   const variedLocalRight=await variedRenderer.renderTile('1,0',{
    ...variedOptions,previewEditorLocalMountainMask:true
   });
   const variedLocalDown=await variedRenderer.renderTile('0,1',{
    ...variedOptions,previewEditorLocalMountainMask:true
   });
   const variedBaseLeft=await variedRenderer.renderTile('0,0',variedOptions);
   const variedBaseRight=await variedRenderer.renderTile('1,0',variedOptions);
   const sourceDerivedStyleReceipts=[],variedComparisons=[];
   for(const [i,tile] of [
    ['0,0',variedLocalLeft],['1,0',variedLocalRight],
    ['0,1',variedLocalDown]]){
    const trace=tile.editorCompositeReference;
    if(!trace?.mountainCasts?.length||tile.readyForViewer!==false||
     tile.authoredMountainInstanceMatch!==true)
     throw Error('2.8v original authored mountain source missing on tile '+i);
    const sources=[];
    const directCanvas=bitmapCanvas();directCanvas.width=1920;
    directCanvas.height=1632;
    const direct=directCanvas.getContext('2d',{willReadFrequently:true});
    for(const cast of trace.mountainCasts){
     const settings=originalStyleEngine.resolve(
      variantAuthored,cast.owner.item.inst,originalMountainEngine);
     const source=originalShadowLocal(cast.modelWidth,settings,cast.strength);
     if(source.canvas.width!==cast.canvas.width||
      source.canvas.height!==cast.canvas.height)
      throw Error('2.8v per-instance Editor style mask size mismatch');
     const src=source.canvas.getContext('2d',{willReadFrequently:true})
      .getImageData(0,0,source.canvas.width,source.canvas.height).data;
     const actual=cast.canvas.getContext('2d',{willReadFrequently:true})
      .getImageData(0,0,cast.canvas.width,cast.canvas.height).data;
     let different=0;
     for(let p=0;p<src.length;p+=4)
      if(src[p]!==actual[p]||src[p+1]!==actual[p+1]||
       src[p+2]!==actual[p+2]||src[p+3]!==actual[p+3])
       different++;
     const expectedX=cast.nativeCastOriginX+source.left/source.factor,
      expectedY=cast.nativeCastOriginY+source.top/source.factor;
     const err=Math.max(
      Math.abs(cast.box.left-expectedX),
      Math.abs(cast.box.top-expectedY),
      Math.abs(cast.box.width-source.canvas.width/source.factor),
      Math.abs(cast.box.height-source.canvas.height/source.factor));
     direct.drawImage(source.canvas,expectedX-trace.sampleX,
      expectedY-trace.sampleY,
      source.canvas.width/source.factor,source.canvas.height/source.factor);
     sources.push({asset:cast.owner.item.inst.assetPath,
      instance:cast.owner.item.inst.q+','+cast.owner.item.inst.r,
      softness:settings.softness,width:cast.modelWidth,
      sourceRGBAChanged:different,placementError:err,
      peakAlpha:cast.peakAlpha,sourcePeakAlpha:source.peakAlpha});
    }
    const native=nativeComposite(tile);
    const sampled=tile.editorCompositeReference.painted
     .getContext('2d',{willReadFrequently:true});
    const fg=tile.editorCompositeReference.mountainGround
     .getContext('2d',{willReadFrequently:true});
    const compositor=compareFrames(sampled,native.ctx);
    const bg=window.VedrasEditorCompositeAudit.compare({
     width:1920,height:1632,
     world:fg.getImageData(0,0,1920,1632).data,
     editor:direct.getImageData(0,0,1920,1632).data
    });
    sourceDerivedStyleReceipts.push({tile:i,sources,
     groundDifferent:bg.different,groundMaxDelta:bg.maxDelta,
     groundPainted:bg.painted,
     compositorDifferent:compositor.different,
     compositorMaxDelta:compositor.maxDelta});
    if(i!=='0,1'){
     const baseline=i==='0,0'?variedBaseLeft:variedBaseRight;
     const reference=nativeComposite(baseline);
     const bc=compareFrames(baseline.editorCompositeReference.painted
      .getContext('2d',{willReadFrequently:true}),reference.ctx);
     const originalBg=baseline.editorCompositeReference.mountainGround
      .getContext('2d',{willReadFrequently:true});
     const old=window.VedrasEditorCompositeAudit.compare({
      width:1920,height:1632,
      world:originalBg.getImageData(0,0,1920,1632).data,
      editor:direct.getImageData(0,0,1920,1632).data
     });
     variedComparisons.push({tile:i,localCompositorDifferent:compositor.different,
      baselineCompositorDifferent:bc.different,
      localGroundDifferent:bg.different,
      baselineGroundDifferent:old.different,
      localGroundMaxDelta:bg.maxDelta,
      baselineGroundMaxDelta:old.maxDelta,
      maskBetter:bg.different<old.different,
      compositorBetter:compositor.different<bc.different});
    }
   }
   const pixelCanvas=sample=>sample.editorCompositeReference.painted
    .getContext('2d',{willReadFrequently:true})
    .getImageData(0,0,1920,1632).data;
   const realVariedSeams=[
    seamCheck(pixelCanvas(variedLocalLeft),
     pixelCanvas(variedLocalRight),'right'),
    seamCheck(pixelCanvas(variedLocalLeft),
     pixelCanvas(variedLocalDown),'down')
   ];
   const variedEditorMaskAudit={
    schema:'vedras-phase28v-original-mountain-mask-style-and-seams',
    sourceVariants:variableRasterReceipt,
    fractionalGlobalSeams,sourceDerivedStyleReceipts,
    realVariedSeams,variedComparisons,
    exactSourceMasks:sourceDerivedStyleReceipts.every(r=>
     r.sources.length>0&&r.sources.every(s=>
      s.sourceRGBAChanged===0&&s.placementError===0&&
      s.peakAlpha===s.sourcePeakAlpha)),
    eligibleForReview:
     realVariedSeams.every(s=>s.different===0)&&
     variedComparisons.length===2&&
     variedComparisons.every(c=>
      c.maskBetter&&c.compositorBetter&&c.localGroundMaxDelta<=
      c.baselineGroundMaxDelta),
    complete:false,readyForViewer:false
   };
   const sourceLocalMaskReceipt=[];
   const localResults=[localMasked0,localMasked1];
   for(let i=0;i<localResults.length;i++){
    const result=localResults[i];
    if(!result.editorCachedLocalMountainMask||
     !result.editorCompositeReference?.mountainCasts?.length)
     throw Error('Missing editor original cached local mountain mask proof');
    const masks=[];
    for(const c of result.editorCompositeReference.mountainCasts){
     const source=originalShadowLocal(c.modelWidth,
      window.VedrasShadows.settings(),c.strength);
     const src=source.canvas.getContext('2d',{willReadFrequently:true});
     const dst=c.canvas.getContext('2d',{willReadFrequently:true});
     const sameDimensions=source.canvas.width===c.canvas.width&&
      source.canvas.height===c.canvas.height;
     if(!sameDimensions)throw Error('Cached original local shadow dimensions differ');
     const A=src.getImageData(0,0,c.canvas.width,c.canvas.height).data,
      B=dst.getImageData(0,0,c.canvas.width,c.canvas.height).data;
     let different=0;
     for(let k=0;k<A.length;k+=4)
      if(A[k]!==B[k]||A[k+1]!==B[k+1]||
       A[k+2]!==B[k+2]||A[k+3]!==B[k+3])different++;
     const expectedX=c.nativeCastOriginX+source.left/source.factor,
      expectedY=c.nativeCastOriginY+source.top/source.factor;
     const placementError=Math.max(
      Math.abs(c.box.left-expectedX),Math.abs(c.box.top-expectedY),
      Math.abs(c.box.width-c.canvas.width/source.factor),
      Math.abs(c.box.height-c.canvas.height/source.factor));
     masks.push({source:'unmodified-app.js-shadowLocalMask',
      originalWidth:c.modelWidth,cachedWidth:c.canvas.width,
      cachedHeight:c.canvas.height,scale:source.factor,
      pixelDifference:different,peakAlpha:c.peakAlpha,
      expectedPeakAlpha:source.peakAlpha,
      placementError,positiveCount:source.positiveCount});
    }
    sourceLocalMaskReceipt.push(masks);
   }
   const compositeBareSeam=await window.VedrasJointScenerySeam.create({
    plan,allowEditorProjectionPreview:true,
    renderer:{previewOnly:true,defaultTile:()=> '0,0',
     renderTile:async id=>id==='0,0'?compositeBare0:compositeBare1}
   }).verifyPair('0,0','right');
   const compositeShadowSeam=await window.VedrasJointScenerySeam.create({
    plan,allowShadowPreview:true,allowMountainShadowPreview:true,
    allowReceiverPreview:true,allowEditorProjectionPreview:true,
    renderer:{previewOnly:true,defaultTile:()=> '0,0',
     renderTile:async id=>id==='0,0'?compositeShadow0:compositeShadow1}
   }).verifyPair('0,0','right');
   const nativeBare0=nativeComposite(compositeBare0);
   const nativeBare1=nativeComposite(compositeBare1);
   const nativeShade0=nativeComposite(compositeShadow0);
   const nativeShade1=nativeComposite(compositeShadow1);
   // Compare pre-encode canvas pixels directly. PNG decode / createImageBitmap
   // would add two extra alpha premultiplication roundtrips to the proof.
   const raw=sample=>{
    const canvas=sample.editorCompositeReference?.painted;
    if(!canvas||canvas.width!==1920||canvas.height!==1632)
     throw Error('Missing unmodified pre-encode source canvas');
    return canvas.getContext('2d',{willReadFrequently:true});
   };
   const compositeNoShadows=[
    compareFrames(raw(compositeBare0),nativeBare0.ctx),
    compareFrames(raw(compositeBare1),nativeBare1.ctx)];
   const compositeWithShadows=[
    compareFrames(raw(compositeShadow0),nativeShade0.ctx),
    compareFrames(raw(compositeShadow1),nativeShade1.ctx)];
   const cachedLocalNative=[
    nativeComposite(localMasked0),nativeComposite(localMasked1)];
   const localComposites=[
    compareFrames(raw(localMasked0),cachedLocalNative[0].ctx),
    compareFrames(raw(localMasked1),cachedLocalNative[1].ctx)];
   // The editor DIRECTLY draws its local mask at a fractional pixel offset.
   // WorldTiles must first align this source onto the GLOBAL integer lattice
   // to guarantee exact neighbor seams; quantify the local shadow raster
   // error independently from all sprite and receiver passes.
   const maskGroundComparison=[0,1].map(i=>{
    const local=localResults[i],baseline=[compositeShadow0,compositeShadow1][i];
    const trace=local.editorCompositeReference;
    const cv=document.createElement('canvas');cv.width=1920;cv.height=1632;
    const direct=cv.getContext('2d',{willReadFrequently:true});
    direct.setTransform(1,0,0,1,0,0);
    for(const cast of trace.mountainCasts){
     direct.drawImage(cast.canvas,cast.box.left-trace.sampleX,
      cast.box.top-trace.sampleY,cast.box.width,cast.box.height);
    }
    const toData=sample=>sample.editorCompositeReference.mountainGround
     .getContext('2d',{willReadFrequently:true})
     .getImageData(0,0,1920,1632).data;
    const source=direct.getImageData(0,0,1920,1632).data;
    const maskRGBA=window.VedrasEditorCompositeAudit;
    const old=maskRGBA.compare({width:1920,height:1632,
     world:toData(baseline),editor:source});
    const fresh=maskRGBA.compare({width:1920,height:1632,
     world:toData(local),editor:source});
    return {directOriginalMaskSource:'app.js shadowLocalMask',
     baselineDifferent:old.different,localDifferent:fresh.different,
     baselineMaxDelta:old.maxDelta,localMaxDelta:fresh.maxDelta,
     localCloser:fresh.different<old.different,
     sourcePixels:fresh.painted};
   });
   const localMaskAudit={
    schema:'vedras-original-editor-cached-mountain-mask-audit-v1',
    sourceLocalMaskReceipt,localComposites,maskGroundComparison,
    seam:{passed:localMaskSeam.passesPixelIdentity,
     different:localMaskSeam.differingPixels,
     painted:localMaskSeam.paintedPixels},
    eligibleForReview:localMaskSeam.passesPixelIdentity&&
     localComposites.every((x,i)=>x.different<compositeWithShadows[i].different)&&
     maskGroundComparison.every(x=>x.localCloser),
    complete:false,readyForViewer:false
   };
   // Analyze ORIGINAL pre-encode canvases by RGBA channel, transparency
   // bucket, delta magnitude and the shadow-only transition on each pixel.
   const RGBA=window.VedrasEditorCompositeAudit;
   if(!RGBA?.paired)throw Error('Independent RGBA parity auditor not loaded.');
   const rgbaOf=ctx=>ctx.getImageData(0,0,1920,1632).data;
   const compositeAudits=[
    RGBA.paired({width:1920,height:1632,
     worldBare:rgbaOf(raw(compositeBare0)),
     editorBare:rgbaOf(nativeBare0.ctx),
     worldShaded:rgbaOf(raw(compositeShadow0)),
     editorShaded:rgbaOf(nativeShade0.ctx)}),
    RGBA.paired({width:1920,height:1632,
     worldBare:rgbaOf(raw(compositeBare1)),
     editorBare:rgbaOf(nativeBare1.ctx),
     worldShaded:rgbaOf(raw(compositeShadow1)),
     editorShaded:rgbaOf(nativeShade1.ctx)})
   ];
   const AlphaAB=window.VedrasAlphaSourceOverAB;
   if(typeof AlphaAB?.render!=="function")
    throw Error('Read-only original alpha A/B experiment not loaded.');
   const abTiles=[compositeShadow0,compositeShadow1];
   const originalEditorPixels=[rgbaOf(nativeShade0.ctx),rgbaOf(nativeShade1.ctx)];
   const alphaAB=["straight-rounded","premultiplied-byte"].map(mode=>{
    const rendered=abTiles.map((sample,i)=>{
     const trace=sample.editorCompositeReference;
     const input=trace?.alphaAB;
     if(!input||input.complete!==false||input.readyForViewer!==false||
      !input.background||!Array.isArray(input.sprites)||
      input.sprites.length===0)
      throw Error('Missing explicit bounded original alpha A/B inputs');
     const result=AlphaAB.render({
      mode,width:1920,height:1632,
      originX:trace.sampleX,originY:trace.sampleY,
      background:input.background,sprites:input.sprites
     });
     if(result.readyForViewer!==false||result.complete!==false)
      throw Error('Alpha A/B must never release the viewer gate');
     const against=RGBA.compare({
      width:1920,height:1632,world:result.data,
      editor:originalEditorPixels[i]
     });
     return {mode,data:result.data,patches:result.patches,
      touched:result.touched,against};
    });
    // The overlapping sample strip must be EXACTLY the same globally
    // for both WorldTiles. No tolerance or shared post-blend patching.
    let seamDifferent=0,overlapPainted=0,maxSeamDelta=0;
    for(let y=0;y<1632;y++)for(let x=0;x<640;x++){
     const li=(y*1920+x+1280)*4,ri=(y*1920+x)*4,
      L=rendered[0].data,R=rendered[1].data;
     if(L[li+3]||R[ri+3])overlapPainted++;
     let differs=false;
     for(let c=0;c<4;c++){
      const d=Math.abs(L[li+c]-R[ri+c]);
      if(d){differs=true;maxSeamDelta=Math.max(maxSeamDelta,d);}
     }
     if(differs)seamDifferent++;
    }
    const result={mode,seamDifferent,maxSeamDelta,overlapPainted,
     tiles:rendered.map((r,i)=>({
      different:r.against.different,
      maxDelta:r.against.maxDelta,painted:r.against.painted,
      baselineDifferent:compositeWithShadows[i].different,
      baselineMaxDelta:compositeWithShadows[i].maxDelta,
      patches:r.patches,touched:r.touched,
      oneByte:r.against.maxDeltaBins['1'],
      alphaOnly:r.against.differentAlphaOnly,
      rgbOnly:r.against.differentRGBOnly
     })),
     eligibleForReview:seamDifferent===0&&rendered.every((r,i)=>
      r.against.different<compositeWithShadows[i].different&&
      r.against.maxDelta<=compositeWithShadows[i].maxDelta),
     complete:false,readyForViewer:false};
    return result;
   });
   const Provenance=window.VedrasEditorShadowAttribution;
   if(typeof Provenance?.analyze!=="function")
    throw Error("Read-only original sprite-shadow attribution unavailable.");
   const traceData=(sample,key)=>{
    const trace=sample.editorCompositeReference;
    if(!trace||trace.source!=="read-only-original-editor-reference-candidates-v1"||
     !trace.mountainGround||!trace.background||
     !Array.isArray(trace.spriteAlphaMasks)||trace.spriteAlphaMasks.length===0)
     throw Error("Missing original mountain/sprite ground and precise alpha mask trace: "+key);
    const source=key==="mountainGround"?trace.mountainGround:trace.background;
    return source.getContext("2d",{willReadFrequently:true})
     .getImageData(0,0,1920,1632).data;
   };
   const originalPixelAttribution=[
    Provenance.analyze({width:1920,height:1632,
     originX:compositeShadow0.editorCompositeReference.sampleX,
     originY:compositeShadow0.editorCompositeReference.sampleY,
     worldBare:rgbaOf(raw(compositeBare0)),
     editorBare:rgbaOf(nativeBare0.ctx),
     worldShaded:rgbaOf(raw(compositeShadow0)),
     editorShaded:rgbaOf(nativeShade0.ctx),
     mountainGround:traceData(compositeShadow0,"mountainGround"),
     spriteGround:traceData(compositeShadow0,"background"),
     spriteMasks:compositeShadow0.editorCompositeReference.spriteAlphaMasks}),
    Provenance.analyze({width:1920,height:1632,
     originX:compositeShadow1.editorCompositeReference.sampleX,
     originY:compositeShadow1.editorCompositeReference.sampleY,
     worldBare:rgbaOf(raw(compositeBare1)),
     editorBare:rgbaOf(nativeBare1.ctx),
     worldShaded:rgbaOf(raw(compositeShadow1)),
     editorShaded:rgbaOf(nativeShade1.ctx),
     mountainGround:traceData(compositeShadow1,"mountainGround"),
     spriteGround:traceData(compositeShadow1,"background"),
     spriteMasks:compositeShadow1.editorCompositeReference.spriteAlphaMasks})
   ];
   const auditDigest=compositeAudits.map(r=>({
    tileWidth:r.width,tileHeight:r.height,
    parity:r.parityPassed,
    bare:{
     different:r.bare.different,
     channels:r.bare.channels,
     rgbOnly:r.bare.differentRGBOnly,
     alphaOnly:r.bare.differentAlphaOnly,
     both:r.bare.differentRGBAndAlpha,
     delta:r.bare.maxDeltaBins,
     opacity:r.bare.alphaBins,
     bounds:r.bare.bbox
    },
    shaded:{
     different:r.shaded.different,
     channels:r.shaded.channels,
     rgbOnly:r.shaded.differentRGBOnly,
     alphaOnly:r.shaded.differentAlphaOnly,
     both:r.shaded.differentRGBAndAlpha,
     delta:r.shaded.maxDeltaBins,
     opacity:r.shaded.alphaBins,
     bounds:r.shaded.bbox
    },
    transitions:{
     introduced:r.transitions.introduced,
     resolved:r.transitions.resolved,
     persistent:r.transitions.persistent,
     newOnShadowTouched:r.transitions.shadedMismatchOnTouched,
     persistentOnShadowUntouched:r.transitions.shadedMismatchOnUntouched,
     worldTouched:r.transitions.worldShadeTouched,
     editorTouched:r.transitions.editorShadeTouched,
     bothTouched:r.transitions.shadeTouchedBoth,
     worldOnly:r.transitions.shadeTouchedWorldOnly,
     editorOnly:r.transitions.shadeTouchedEditorOnly
    }
   }));
   // Read-only four-panel 32x16 pixel density receipt. The heatmap is
   // merely a CI visualization; it cannot alter source sprite output.
   const heatmapCanvas=document.createElement('canvas');
   heatmapCanvas.width=680;heatmapCanvas.height=400;
   const hm=heatmapCanvas.getContext('2d');
   hm.fillStyle='#101923';hm.fillRect(0,0,680,400);
   hm.font='12px monospace';hm.textBaseline='top';
   const panels=[
    {x:12,y:12,name:'Bare 0,0',cells:compositeAudits[0].bare.heatmap.counts},
    {x:348,y:12,name:'Bare 1,0',cells:compositeAudits[1].bare.heatmap.counts},
    {x:12,y:208,name:'Shaded 0,0',cells:compositeAudits[0].shaded.heatmap.counts},
    {x:348,y:208,name:'Shaded 1,0',cells:compositeAudits[1].shaded.heatmap.counts}
   ];
   for(const panel of panels){
    hm.fillStyle='#dce7f1';hm.fillText(panel.name,panel.x,panel.y);
    const max=Math.max(1,...panel.cells);
    for(let j=0;j<16;j++)for(let i=0;i<32;i++){
     const v=panel.cells[j*32+i],t=Math.sqrt(v/max);
     const red=Math.round(30+225*t),green=Math.round(34+65*t),
      blue=Math.round(55+20*t);
     hm.fillStyle='rgb('+red+','+green+','+blue+')';
     hm.fillRect(panel.x+i*10,panel.y+24+j*10,10,10);
    }
   }
   const editorRGBAHeatmapPng=heatmapCanvas.toDataURL('image/png');
   if(!editorRGBAHeatmapPng.startsWith('data:image/png;base64,'))
    throw Error('Editor RGBA diagnostic heatmap PNG was not encoded.');
   const compositePixelParityPassed=compositeNoShadows.every(x=>x.different===0)&&
    compositeWithShadows.every(x=>x.different===0);
   const compositeSeams={
    noShadow:{passed:compositeBareSeam.passesPixelIdentity,
     different:compositeBareSeam.differingPixels,
     painted:compositeBareSeam.paintedPixels},
    withShadow:{passed:compositeShadowSeam.passesPixelIdentity,
     different:compositeShadowSeam.differingPixels,
     painted:compositeShadowSeam.paintedPixels}
   };
   const compositeOcclusion=[
    {expected:hiddenFromNative(nativeBare0),
     drawn:compositeBare0.editorHiddenTrees+
      compositeBare0.editorHiddenDeadTreeAccents,
     dead:compositeBare0.editorHiddenDeadTreeAccents,
     orderMatching:JSON.stringify(nativeBare0.order)===
      JSON.stringify(compositeBare0.editorCompositeReference.displayedOrder)},
    {expected:hiddenFromNative(nativeBare1),
     drawn:compositeBare1.editorHiddenTrees+
      compositeBare1.editorHiddenDeadTreeAccents,
     dead:compositeBare1.editorHiddenDeadTreeAccents,
     orderMatching:JSON.stringify(nativeBare1.order)===
      JSON.stringify(compositeBare1.editorCompositeReference.displayedOrder)}];
   function hiddenFromNative(frame){return frame.hidden.length;}
   console.log('EDITOR_COMPOSITE_DIAGNOSTIC',JSON.stringify({
    bare:compositeNoShadows,shadows:compositeWithShadows,
    parity:compositePixelParityPassed,
    rgba:auditDigest,sourceAttribution:originalPixelAttribution,
    alphaAB,localMaskAudit,
    seams:compositeSeams,occlusion:compositeOcclusion,
    receivers:[compositeShadow0.drawnMountainShadowReceivers,
     compositeShadow1.drawnMountainShadowReceivers]
   }));
   const spriteOnly=await renderer.renderTile('0,0',{
    previewSpriteShadows:true,previewMountainShadows:false
   });
   const decode=async blob=>{
    const bitmap=await createImageBitmap(blob);
    const canvas=document.createElement('canvas');
    canvas.width=bitmap.width;canvas.height=bitmap.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(bitmap,0,0);bitmap.close();return ctx;
   };
   const left=await decode(a.png),right=await decode(b.png);
   const baseline=await decode(spriteOnly.png);
   const editorBefore=await decode(editorBareLegacy.png),
    editorAfter=await decode(editorBareLeft.png),
    editorWithCast=await decode(editorShadowLeft.png),
    editorNoCast=await decode(editorShadowNoReceiver.png);
   function imagePixelDifference(a,b){
    const first=a.getImageData(0,0,a.canvas.width,a.canvas.height).data,
     second=b.getImageData(0,0,b.canvas.width,b.canvas.height).data;
    if(first.length!==second.length)throw Error('EDITOR_PROJECTION_SAMPLE_DIMENSIONS_DIFFER');
    let changed=0;
    for(let p=0;p<first.length;p+=4)
     if(first[p]!==second[p]||first[p+1]!==second[p+1]||
        first[p+2]!==second[p+2]||first[p+3]!==second[p+3])
      changed++;
    return changed;
   }
   const editorBodyChangedPixels=imagePixelDifference(editorBefore,editorAfter),
    editorReceiverChangedPixels=imagePixelDifference(editorNoCast,editorWithCast);
   const receiverA=await decode(receiverLeft.png),
    receiverBaseline=await decode(receiverBefore.png);
   const ar=receiverA.getImageData(0,0,receiverA.canvas.width,receiverA.canvas.height).data,
    br=receiverBaseline.getImageData(0,0,receiverBaseline.canvas.width,
     receiverBaseline.canvas.height).data;
   let receiverChangedPixels=0;
   for(let k=0;k<ar.length;k+=4)
    if(ar[k]!==br[k]||ar[k+1]!==br[k+1]||
       ar[k+2]!==br[k+2]||ar[k+3]!==br[k+3])
     receiverChangedPixels++;
   const authLeft=await decode(authA.png),authRgba=authLeft.getImageData(
    0,0,authLeft.canvas.width,authLeft.canvas.height).data;
   const aa=left.getImageData(0,0,left.canvas.width,left.canvas.height).data,
    bb=baseline.getImageData(0,0,baseline.canvas.width,baseline.canvas.height).data;
   let mountainChangedPixels=0,authoredChangedPixels=0;
   for(let k=0;k<aa.length;k+=4){
    if(aa[k]!==bb[k]||aa[k+1]!==bb[k+1]||
       aa[k+2]!==bb[k+2]||aa[k+3]!==bb[k+3])
     mountainChangedPixels++;
    if(aa[k]!==authRgba[k]||aa[k+1]!==authRgba[k+1]||
       aa[k+2]!==authRgba[k+2]||aa[k+3]!==authRgba[k+3])
     authoredChangedPixels++;
   }
   const w=640,h=1632,L=left.getImageData(1280,0,w,h).data,
    R=right.getImageData(0,0,w,h).data;
   let different=0,opaque=0,transparent=0,maxDelta=0;
   const mismatchSamples=[];
   for(let i=0;i<L.length;i+=4){
    opaque+=L[i+3]>0?1:0;
    transparent+=L[i+3]===0?1:0;
    if(L[i]!==R[i]||L[i+1]!==R[i+1]||
     L[i+2]!==R[i+2]||L[i+3]!==R[i+3]){
     different++;
     maxDelta=Math.max(maxDelta,...[0,1,2,3].map(ch=>Math.abs(L[i+ch]-R[i+ch])));
     if(mismatchSamples.length<8)mismatchSamples.push({
      x:(i/4)%w,y:Math.floor((i/4)/w),
      left:[...L.slice(i,i+4)],right:[...R.slice(i,i+4)]
     });
    }
   }
   return {stages:[a.stage,b.stage],
    sizes:[a.png.size,b.png.size],
    draws:[a.drawnTrees+a.drawnMountains+a.drawnWarmBoulders+
     a.drawnOrdinaryBoulders+a.drawnSnowPatches+a.drawnAccents,
     b.drawnTrees+b.drawnMountains+b.drawnWarmBoulders+
     b.drawnOrdinaryBoulders+b.drawnSnowPatches+b.drawnAccents],
    ordinaryRocks:[a.drawnOrdinaryBoulders,b.drawnOrdinaryBoulders],
    snowPatches:[a.drawnSnowPatches,b.drawnSnowPatches],
    accents:[a.drawnAccents,b.drawnAccents],
    spriteShadows:[a.drawnOriginalSpriteShadows,b.drawnOriginalSpriteShadows],
    manualShadows:[a.drawnManualShadows,b.drawnManualShadows],
    shadowProfiles:[a.originalShadowProfiles,b.originalShadowProfiles],
    mountainChangedPixels,authoredChangedPixels,
    receiverChangedPixels,
    compositeNoShadows,compositeWithShadows,compositeOcclusion,compositeSeams,
    compositePixelParityPassed,compositeRGBA:auditDigest,
    compositeAlphaAB:alphaAB,compositeLocalMaskAudit:localMaskAudit,
    variedEditorMaskAudit,
    compositeSourceAttribution:originalPixelAttribution,
    editorRGBAHeatmapPng,
    compositeAuditFullReport:compositeAudits,
    compositeNeedsFullEditorParity:[
     compositeBare0.needsFullEditorImageParity,
     compositeShadow0.needsFullEditorImageParity],
    compositeNotReady:[
     compositeBare0.readyForViewer,compositeShadow0.readyForViewer],
    compositeReceivers:[compositeShadow0.drawnMountainShadowReceivers,
     compositeShadow1.drawnMountainShadowReceivers],
    editorBodyChangedPixels,editorReceiverChangedPixels,
    editorBareStages:[editorBareLeft.stage,editorBareRight.stage],
    editorShadowStages:[editorShadowLeft.stage,editorShadowRight.stage],
    editorFootProjection:[editorBareLeft.editorFootSpriteProjection,
     editorShadowLeft.editorFootSpriteProjection],
    editorHiddenTrees:[editorBareLeft.editorHiddenTrees,
     editorBareRight.editorHiddenTrees],
    editorRenderedTrees:[editorBareLeft.drawnTrees,editorBareRight.drawnTrees],
    editorShadowReceivers:[editorShadowLeft.drawnMountainShadowReceivers,
     editorShadowRight.drawnMountainShadowReceivers],
    editorShadowOnlyCasters:[editorShadowLeft.drawnShadowOnlyMountains,
     editorShadowRight.drawnShadowOnlyMountains],
    editorBareSeam:{passed:editorBareProof.passesPixelIdentity,
     differing:editorBareProof.differingPixels,painted:editorBareProof.paintedPixels},
    editorShadowSeam:{passed:editorShadowProof.passesPixelIdentity,
     differing:editorShadowProof.differingPixels,painted:editorShadowProof.paintedPixels},
    realMountainReceiverCounts:[receiverLeft.drawnMountainShadowReceivers,
     receiverRight.drawnMountainShadowReceivers],
    realMountainReceiverCasts:[receiverLeft.drawnMountainReceiverCasts,
     receiverRight.drawnMountainReceiverCasts],
    receiverProof:{passed:receiverProof.passesPixelIdentity,
     different:receiverProof.differingPixels,
     painted:receiverProof.paintedPixels},
    authoredSceneSource:[authA.authoredMountainScene,authB.authoredMountainScene],
    authoredInstanceMatch:[authA.authoredMountainInstanceMatch,
     authB.authoredMountainInstanceMatch],
    authoredPixelProof:{passed:authProof.passesPixelIdentity,
     differences:authProof.differingPixels,painted:authProof.paintedPixels},
    mountainShadows:[a.drawnOriginalMountainShadows,b.drawnOriginalMountainShadows],
    mountainShadowPixels:[a.originalMountainShadowPositivePixels,b.originalMountainShadowPositivePixels],
    mountainShadowOnly:[a.drawnShadowOnlyMountains,b.drawnShadowOnlyMountains],
    pendingMountainShadows:[a.needsOriginalMountainShadows,b.needsOriginalMountainShadows],
    mountainEditorPresetsPending:[a.needsMountainShadowScenePresetParity,b.needsMountainShadowScenePresetParity],
    pendingAccents:[a.needsShrubsAndAccents,b.needsShrubsAndAccents],
    missingSnow:[a.needsSnowPass,b.needsSnowPass],
    rocks:[a.drawnWarmBoulders,b.drawnWarmBoulders],
    lateRocks:[a.needsOtherBoulderPass,b.needsOtherBoulderPass],
    trees:[a.drawnTrees,b.drawnTrees],
    mountains:[a.drawnMountains,b.drawnMountains],
    occludedPairs:[a.occludedTreeMountainPairs,b.occludedTreeMountainPairs],
    flattenPads:[a.mountainFlattenPads,b.mountainFlattenPads],
    different,opaque,transparent,maxDelta,mismatchSamples,
    pixelProof:{passed:pixelProof.passesPixelIdentity,
     different:pixelProof.differingPixels,painted:pixelProof.paintedPixels},
    ready:[a.readyForViewer,b.readyForViewer],
    complete:[a.complete,b.complete],
    projection:[a.samplesPerWorldUnitX,a.samplesPerWorldUnitY]};
  },{world,plan,nature,terrain,names,shadowProfiles,editorCompositeSource,
   editorLocalMaskSource});
  // Persist the tested heatmap and full machine-readable metrics in the
  // existing short-lived CI artifact. Do not print base64 into workflow logs.
  const rgbaDir=path.join(root,process.env.VEDRAS_CI_ARTIFACTS||'test-artifacts');
  fs.mkdirSync(rgbaDir,{recursive:true});
  assert(result.editorRGBAHeatmapPng.startsWith('data:image/png;base64,'));
  fs.writeFileSync(path.join(rgbaDir,'phase28r_editor_composite_rgba_heatmap.png'),
   Buffer.from(result.editorRGBAHeatmapPng.slice('data:image/png;base64,'.length),'base64'));
  fs.writeFileSync(path.join(rgbaDir,'phase28r_editor_composite_rgba_report.json'),
   JSON.stringify({schema:'vedras-geography-phase28r-rgba-report',
    source:'app.js independent source + original PNG pre-encode canvases',
    result:result.compositeAuditFullReport},null,2));
  fs.writeFileSync(path.join(rgbaDir,'phase28s_original_sprite_shadow_attribution.json'),
   JSON.stringify({schema:'vedras-geography-phase28s-shadow-ownership-diagnostic',
    source:'original sprite alpha masks + independent editor RGBA',
    results:result.compositeSourceAttribution},null,2));
  fs.writeFileSync(path.join(rgbaDir,'phase28t_original_sprite_alpha_composite_ab.json'),
   JSON.stringify({schema:'vedras-geography-phase28t-alpha-source-over-ab',
    source:'pre-encode actual global scratch pixels, independent editor RGBAs',
    productionRendererChanged:false,results:result.compositeAlphaAB},null,2));
  fs.writeFileSync(path.join(rgbaDir,'phase28u_original_editor_cached_local_mountain_mask.json'),
   JSON.stringify({schema:'vedras-geography-phase28u-editor-original-local-mask',
    originalSource:'app.js source-extracted shadowLocalMask()',
    productionRendererChanged:false,result:result.compositeLocalMaskAudit},null,2));
  fs.writeFileSync(path.join(rgbaDir,'phase28v_original_mountain_mask_variants.json'),
   JSON.stringify({schema:'vedras-geography-phase28v-real-original-mask-variants',
    originalSource:'app.js source-extracted shadowLocalMask()',
    productionRendererChanged:false,result:result.variedEditorMaskAudit},null,2));
  delete result.editorRGBAHeatmapPng;
  delete result.compositeAuditFullReport;
  console.log('JOINT_SCENERY_PIXEL_DIAGNOSTIC',JSON.stringify(result));
  console.log('EDITOR_COMPOSITE_RGBA_AUDIT',JSON.stringify(result.compositeRGBA));
  console.log('ORIGINAL_ALPHA_SOURCE_OVER_AB',JSON.stringify(result.compositeAlphaAB));
  console.log('EDITOR_LOCAL_MOUNTAIN_MASK_VARIANTS',
   JSON.stringify(result.variedEditorMaskAudit));
  console.log('EDITOR_LOCAL_MOUNTAIN_MASK_DIAGNOSTIC',
   JSON.stringify(result.compositeLocalMaskAudit));
  console.log('EDITOR_SHADOW_SOURCE_ATTRIBUTION',JSON.stringify(
   result.compositeSourceAttribution.map((r,i)=>({
    tile:i===0?'0,0':'1,0',masks:r.masks,
    editorOnly:r.editorOnlyShadeTouched,
    worldOnly:r.worldOnlyShadeTouched,
    severeBare:r.severeBare,severeShaded:r.severeShaded,
    complete:r.complete,ready:r.readyForViewer
   }))));
  assert.deepEqual(errors,[]);
  assert.deepEqual(result.stages,[
   'original-mountain-sprite-shadow-scenery-preview',
   'original-mountain-sprite-shadow-scenery-preview']);
  assert.deepEqual(result.trees,[1,1]);
  assert.deepEqual(result.mountains,[1,2],
   'right tile also contains the second actual original mountain PNG');
  assert.deepEqual(result.rocks,[1,1]);
  assert.deepEqual(result.ordinaryRocks,[1,1]);
  assert.deepEqual(result.snowPatches,[1,1]);
  assert.deepEqual(result.lateRocks,[false,false]);
  assert.deepEqual(result.missingSnow,[false,false]);
  assert.deepEqual(result.accents,[2,2]);
  assert(result.spriteShadows.every(x=>x>=4));
  assert(result.manualShadows.every(x=>x>=2));
  assert(result.shadowProfiles.every(x=>x>=7));
  assert(result.compositeOcclusion.every(x=>x.expected===x.drawn),
   'editor must decide visibility independently at actual feet');
  assert(result.compositeOcclusion.some(x=>x.dead>0),
   'a covered dead-tree accent must be hidden like other trees');
  assert(result.compositeOcclusion.every(x=>x.orderMatching),
   'the editor must independently reproduce exact sprite draw ordering');
  assert(result.compositeReceivers.some(x=>x>0),
   'multiple real Nature sprites must actually receive casts');
  assert(result.compositeSeams.noShadow.passed,true);
  assert.equal(result.compositeSeams.noShadow.different,0);
  assert(result.compositeSeams.withShadow.passed,true);
  assert.equal(result.compositeSeams.withShadow.different,0);
  assert.equal(result.compositeRGBA.length,2);
  for(let i=0;i<2;i++){
   const a=result.compositeRGBA[i];
   assert.equal(a.tileWidth,1920);
   assert.equal(a.tileHeight,1632);
   assert.equal(a.bare.different,result.compositeNoShadows[i].different);
   assert.equal(a.shaded.different,result.compositeWithShadows[i].different);
   assert.equal(Object.values(a.bare.delta).reduce((x,y)=>x+y,0),
    a.bare.different);
   assert.equal(Object.values(a.shaded.opacity).reduce((x,y)=>x+y,0),
    a.shaded.different);
   assert.equal(a.bare.rgbOnly+a.bare.alphaOnly+a.bare.both,
    a.bare.different);
   assert.equal(a.shaded.rgbOnly+a.shaded.alphaOnly+a.shaded.both,
    a.shaded.different);
   assert.equal(a.transitions.introduced+a.transitions.persistent,
    a.shaded.different);
   assert.equal(a.transitions.resolved+a.transitions.persistent,
    a.bare.different);
   assert(a.transitions.worldTouched>100);
   assert(a.transitions.editorTouched>100);
   assert.equal(a.parity,false);
  }
  const variants=result.variedEditorMaskAudit;
  assert.equal(variants.schema,'vedras-phase28v-original-mountain-mask-style-and-seams');
  assert.equal(variants.sourceVariants.length,3);
  assert.deepEqual(variants.sourceVariants.map(x=>x.width),[480,900,1280]);
  assert(variants.sourceVariants.every(x=>
   x.sourceRGBAChanged===0&&x.placementError===0&&x.positive>1000&&
   x.sourcePeakAlpha===x.peakAlpha));
  assert.equal(variants.sourceDerivedStyleReceipts.length,3);
  assert.equal(variants.exactSourceMasks,true);
  assert(variants.sourceDerivedStyleReceipts.some(x=>x.sources.length>=2));
  assert(variants.sourceDerivedStyleReceipts.some(x=>
   x.sources.some(y=>y.softness!==5&&y.softness!==9)));
  for(const seam of [...variants.fractionalGlobalSeams,...variants.realVariedSeams]){
   assert.equal(seam.different,0,'Real source mountain mask must stay pixel-identical');
   assert.equal(seam.maxDelta,0);
   assert(seam.painted>100,
    'Horizontal and vertical overlap MUST contain original positive shadow alpha');
  }
  assert(variants.sourceDerivedStyleReceipts.every(x=>
   x.groundPainted>100&&x.groundDifferent>=0&&x.groundMaxDelta<=2));
  assert.equal(variants.variedComparisons.length,2);
  assert(variants.variedComparisons.every(x=>x.maskBetter),
   'Real authored style ground must get closer with the original cached local mask');
  // The independent REAL authored multi-mountain fixture is now a strict
  // positive regression, not a report that may silently worsen later.
  assert.equal(variants.eligibleForReview,true,
   '2.8v must improve both real styled scenes and preserve BOTH tile seams');
  assert(variants.variedComparisons.every(x=>x.compositorBetter),
   'Editor-authored source must improve the complete original-PNG composite');
  assert.equal(variants.complete,false);
  assert.equal(variants.readyForViewer,false);
  if(variants.eligibleForReview)
   assert(variants.variedComparisons.every(x=>x.compositorBetter));
    assert.equal(result.compositeLocalMaskAudit.sourceLocalMaskReceipt.length,2);
  assert.equal(result.compositeLocalMaskAudit.localComposites.length,2);
  assert(result.compositeLocalMaskAudit.sourceLocalMaskReceipt.every(
   masks=>masks.length>0&&masks.every(m=>
    m.pixelDifference===0&&m.placementError===0&&
    m.peakAlpha===m.expectedPeakAlpha)));
  assert.equal(result.compositeLocalMaskAudit.seam.passed,true);
  assert.equal(result.compositeLocalMaskAudit.seam.different,0);
  assert(result.compositeLocalMaskAudit.seam.painted>500);
  assert(result.compositeLocalMaskAudit.maskGroundComparison.every(x=>
   x.sourcePixels>1000));
  // The positive 2.8u hypothesis is now an immutable fixture regression,
  // not just an optional unasserted quality report.
  assert.equal(result.compositeLocalMaskAudit.eligibleForReview,true,
   'Original app.js local mask must improve BOTH full sprite scenes without seams');
  for(let i=0;i<2;i++){
   const ground=result.compositeLocalMaskAudit.maskGroundComparison[i];
   const sprite=result.compositeLocalMaskAudit.localComposites[i];
   assert(ground.localCloser&&ground.localDifferent<ground.baselineDifferent,
    'Original local ground masks must be strictly closer to app.js');
   assert(ground.localMaxDelta<=1,
    'Remaining global scratch vs direct fractional mask error must be only 1 byte');
   assert(sprite.different<result.compositeWithShadows[i].different,
    'Original cached local casts must improve complete independent sprite composite');
   assert(sprite.maxDelta<=result.compositeWithShadows[i].maxDelta,
    'Original cast must not create a new larger channel excursion');
  }
  assert(result.compositeLocalMaskAudit.localComposites.every(x=>
   Number.isSafeInteger(x.different)&&x.painted>10000));
  assert.equal(result.compositeLocalMaskAudit.complete,false);
  assert.equal(result.compositeLocalMaskAudit.readyForViewer,false);
  if(result.compositeLocalMaskAudit.eligibleForReview){
   assert(result.compositeLocalMaskAudit.localComposites.every((x,i)=>
    x.different<result.compositeWithShadows[i].different));
  }
  assert.equal(result.compositeAlphaAB.length,2);
  for(const variant of result.compositeAlphaAB){
   assert.equal(variant.tiles.length,2);
   assert(variant.tiles.every(t=>t.patches>=2&&t.touched>1000));
   assert(variant.tiles.every(t=>Number.isSafeInteger(t.different)&&
    t.different>=0&&t.different<=t.painted));
   assert(Number.isSafeInteger(variant.seamDifferent));
   assert(variant.overlapPainted>100);
   assert.equal(variant.readyForViewer,false);
   assert.equal(variant.complete,false);
   if(variant.eligibleForReview){
    assert.equal(variant.seamDifferent,0);
    assert(variant.tiles.every(t=>t.different<t.baselineDifferent));
   }
  }
  assert.equal(result.compositeSourceAttribution.length,2);
  for(let i=0;i<2;i++){
   const s=result.compositeSourceAttribution[i],
    reference=result.compositeRGBA[i];
   assert(s.masks>=2,'Original sprites must provide exact visible alpha masks');
   assert.equal(s.editorOnlyShadeTouched.count,reference.transitions.editorOnly);
   assert.equal(s.worldOnlyShadeTouched.count,reference.transitions.worldOnly);
   assert.equal(s.severeBare.count,reference.bare.delta['65-255']);
   assert.equal(s.severeShaded.count,reference.shaded.delta['65-255']);
   assert.equal(s.editorOnlyShadeTouched.ground.mountainOnly+
    s.editorOnlyShadeTouched.ground.mountainAndSprite+
    s.editorOnlyShadeTouched.ground.spriteOnly+
    s.editorOnlyShadeTouched.ground.neither,
    s.editorOnlyShadeTouched.count);
   assert(s.editorOnlyShadeTouched.count>0);
   assert(s.severeBare.count>0);
   assert(s.severeBare.samples.length>0);
   assert.equal(s.complete,false);
   assert.equal(s.readyForViewer,false);
  }
  assert(result.compositeNoShadows.every(x=>x.painted>10000));
  assert(result.compositeWithShadows.every(x=>x.painted>10000));
  // A whole-scene editor pixel-equivalence GATE does not yet exist:
  // the 2.5× WorldTile must first preserve EXACT overlapped pixels.
  // Quantify the remaining compositing difference, never claim full
  // editor parity merely because its geometry, visibility and order match.
  assert(result.compositeNoShadows.every(x=>
   Number.isSafeInteger(x.different)&&x.different<=x.painted));
  assert(result.compositeWithShadows.every(x=>
   Number.isSafeInteger(x.different)&&x.different<=x.painted));
  assert.deepEqual(result.compositeNeedsFullEditorParity,[true,true]);
  assert.deepEqual(result.compositeNotReady,[false,false]);
  assert.deepEqual(result.editorFootProjection,[true,true]);
  assert.deepEqual(result.editorBareStages,[
   'editor-foot-tree-mountain-scenery-preview',
   'editor-foot-tree-mountain-scenery-preview']);
  assert.deepEqual(result.editorShadowStages,[
   'editor-foot-mountain-sprite-shadow-scenery-preview',
   'editor-foot-mountain-sprite-shadow-scenery-preview']);
  assert(result.editorBodyChangedPixels>1000,
   'correct original sprite height must CHANGE actual PNG pixels');
  assert(result.editorReceiverChangedPixels>100,
   'editor body projection must receive mountain shadow on original pixels');
  assert.equal(result.editorBareSeam.passed,true);
  assert.equal(result.editorBareSeam.differing,0);
  assert(result.editorBareSeam.painted>100);
  assert.equal(result.editorShadowSeam.passed,true);
  assert.equal(result.editorShadowSeam.differing,0);
  assert(result.editorShadowSeam.painted>100);
  assert(result.editorHiddenTrees.some(x=>x>0),
   'Editor semantics must HIDE trees whose feet lie in opaque mountain alpha');
  assert(result.editorShadowReceivers.some(x=>x>0),
   'Native cast must reach real original Nature PNG bodies');
  assert(result.editorShadowOnlyCasters[0]>=1,
   'Editor projection must keep casts from off-tile mountain bodies');
  assert(result.realMountainReceiverCounts[0]>0,
   'real original Nature sprites must receive a native mountain cast');
  assert(result.realMountainReceiverCasts[0]>0);
  assert(result.receiverChangedPixels>100,
   'source-atop must alter real original PNG pixels, not just metadata');
  assert.equal(result.receiverProof.passed,true);
  assert.equal(result.receiverProof.different,0);
  assert(result.receiverProof.painted>100);
  assert(result.authoredChangedPixels>100,
   'real exported editor styles must alter real mountain shadow pixels');
  assert.deepEqual(result.authoredSceneSource,[true,true]);
  assert.deepEqual(result.authoredInstanceMatch,[true,true]);
  assert.equal(result.authoredPixelProof.passed,true);
  assert.equal(result.authoredPixelProof.differences,0);
  assert(result.mountainChangedPixels>100,
   'native mountain shadow must alter pixels beyond sprite-only preview');
  assert(result.mountainShadows.every(x=>x>=1));
  assert(result.mountainShadowOnly[0]>=1,
   'left tile must include an off-tile mountain shadow caster');
  assert(result.mountainShadowPixels.every(x=>x>100),
   'native mountain cast must draw actual positive shadow alpha');
  assert.deepEqual(result.pendingMountainShadows,[false,false]);
  assert.deepEqual(result.mountainEditorPresetsPending,[true,true]);
  assert.deepEqual(result.pendingAccents,[false,false]);
  assert.deepEqual(result.draws,[7,8]);
  assert.deepEqual(result.ready,[false,false]);
  assert.deepEqual(result.complete,[false,false]);
  assert(result.sizes.every(x=>x>1000));
  assert(result.opaque>500,'both original sprites must contribute visible pixels');
  assert(result.transparent>500);
  assert.equal(result.different,0,'adjacent joint original PNG sample lattices differ');
  assert.equal(result.pixelProof.passed,true);
  assert.equal(result.pixelProof.different,0);
  assert(result.pixelProof.painted>500);
  assert.deepEqual(result.projection,[2.5,2.125]);
  console.log('PASS real joint Nature tree+mountain+ordinary boulders+snow 2.5x pixel seam',JSON.stringify(result));
 }finally{
  try{await browser?.close();}finally{
   server.closeAllConnections();
   await new Promise(resolve=>server.close(resolve));
  }
 }
})().catch(error=>{console.error(error);process.exitCode=1;});

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
   'large-map-bake-editor-composite-audit.js'])
   await page.addScriptTag({url:origin+'/'+file});
  const result=await page.evaluate(async({world,plan,nature,terrain,names,shadowProfiles,editorCompositeSource})=>{
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
    captureEditorCompositeReference:true
   });
   const compositeShadow1=await compositeRenderer.renderTile('1,0',{
    previewEditorProjection:true,previewSpriteShadows:true,
    previewMountainShadows:true,previewMountainReceivers:true,
    captureEditorCompositeReference:true
   });
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
    rgba:auditDigest,
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
  },{world,plan,nature,terrain,names,shadowProfiles,editorCompositeSource});
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
  delete result.editorRGBAHeatmapPng;
  delete result.compositeAuditFullReport;
  console.log('JOINT_SCENERY_PIXEL_DIAGNOSTIC',JSON.stringify(result));
  console.log('EDITOR_COMPOSITE_RGBA_AUDIT',JSON.stringify(result.compositeRGBA));
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

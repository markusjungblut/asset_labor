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
const names=['assets/nature/birke1.png','assets/nature/berg_01.png',
 'assets/nature/boulder_36.png','assets/nature/boulder_01.png',
 'assets/nature/snow_patch_01.png','assets/nature/bush_01.png',
 'assets/nature/fallen_log_01.png'];
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
   'large-map-bake-original-mountain-shadows.js'])
   await page.addScriptTag({url:origin+'/'+file});
  const result=await page.evaluate(async({world,plan,nature,terrain,names,shadowProfiles})=>{
   const [tree,mount,rock,ordinary,snow,bush,log]=names;
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
  },{world,plan,nature,terrain,names,shadowProfiles});
  console.log('JOINT_SCENERY_PIXEL_DIAGNOSTIC',JSON.stringify(result));
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

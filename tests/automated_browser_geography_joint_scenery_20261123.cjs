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
 'assets/nature/snow_patch_01.png'];
const nature=JSON.parse(fs.readFileSync(path.join(root,
 'assets/nature/nature_catalog.json'),'utf8'));
const terrain=JSON.parse(fs.readFileSync(path.join(root,
 'assets/terrain/terrain_catalog.json'),'utf8'));
for(const file of names)assert(fs.statSync(path.join(root,file)).size>1024,
 'Original PNG is missing: '+file);
const allowed=new Set([...names,'sprite-planner.js','nature-balance.js',
 'polish.js','mountain.js','relief.js','autotile.js',
 'large-map-bake-ground-relief.js','large-map-bake-plan.js',
 'large-map-bake-joint-scenery.js','large-map-bake-scenery-seam.js']);
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
   'large-map-bake-scenery-seam.js'])
   await page.addScriptTag({url:origin+'/'+file});
  const result=await page.evaluate(async({world,plan,nature,terrain,names})=>{
   const [tree,mount,rock,ordinary,snow]=names;
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
     {q:3,r:0,dx:-75,dy:48,assetPath:ordinary,
      assetId:nature.entries[ordinary.slice(7)].id,scale:1,
      kind:'rock',source:'geography-original-late-rock-snow'},
     {q:3,r:0,dx:-100,dy:35,assetPath:snow,
      assetId:nature.entries[snow.slice(7)].id,scale:1,
      kind:'snow',source:'geography-original-late-rock-snow'}
    ]};
   const assets=names.map(p=>({path:p,relPath:p.slice(7),category:'nature'}));
   const renderer=window.VedrasLargeMapJointScenery.create({
    world,plan,treePlan,mountainPlan,boulderPlan,latePlan,
    terrainCatalog:terrain,
    natureCatalog:nature,assets,
    loadImage:async a=>({img:imageByPath.get(a.path)})
   });
   const a=await renderer.renderTile('0,0');
   const b=await renderer.renderTile('1,0');
   const verifier=window.VedrasJointScenerySeam.create({plan,renderer:{
    previewOnly:true,defaultTile:()=> '0,0',
    renderTile:async id=>id==='0,0'?a:b
   }});
   const pixelProof=await verifier.verifyPair('0,0','right');
   const decode=async blob=>{
    const bitmap=await createImageBitmap(blob);
    const canvas=document.createElement('canvas');
    canvas.width=bitmap.width;canvas.height=bitmap.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(bitmap,0,0);bitmap.close();return ctx;
   };
   const left=await decode(a.png),right=await decode(b.png);
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
     a.drawnOrdinaryBoulders+a.drawnSnowPatches,
     b.drawnTrees+b.drawnMountains+b.drawnWarmBoulders+
     b.drawnOrdinaryBoulders+b.drawnSnowPatches],
    ordinaryRocks:[a.drawnOrdinaryBoulders,b.drawnOrdinaryBoulders],
    snowPatches:[a.drawnSnowPatches,b.drawnSnowPatches],
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
  },{world,plan,nature,terrain,names});
  console.log('JOINT_SCENERY_PIXEL_DIAGNOSTIC',JSON.stringify(result));
  assert.deepEqual(errors,[]);
  assert.deepEqual(result.stages,[
   'original-tree-mountain-combined-preview',
   'original-tree-mountain-combined-preview']);
  assert.deepEqual(result.trees,[1,1]);
  assert.deepEqual(result.mountains,[1,1]);
  assert.deepEqual(result.rocks,[1,1]);
  assert.deepEqual(result.ordinaryRocks,[1,1]);
  assert.deepEqual(result.snowPatches,[1,1]);
  assert.deepEqual(result.lateRocks,[false,false]);
  assert.deepEqual(result.missingSnow,[false,false]);
  assert.deepEqual(result.draws,[5,5]);
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

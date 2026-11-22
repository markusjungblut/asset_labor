'use strict';
// Real forest source regression: wald_03.png is checked out by CI.
// Exercises Firefox Canvas2D, seamless wrapping, connected forest alpha,
// real 2x/4x forest masks, jungle exclusion, and preserves the source.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const OUT=process.env.VEDRAS_CI_ARTIFACTS||path.join(ROOT,'test-artifacts');
(async()=>{
 const png=fs.readFileSync(path.join(ROOT,'assets/terrain/wald_03.png'));
 assert.ok(png.length>100000,'Actual wald_03.png source is required, not a text pointer');
 fs.mkdirSync(OUT,{recursive:true});
 const {firefox}=require('playwright');
 const browser=await firefox.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:820},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('about:blank');
  for(const src of ['water-texture.js','forest-ground.js','world-tile-streamer.js'])
   await page.addScriptTag({content:fs.readFileSync(path.join(ROOT,src),'utf8')});
  const result=await page.evaluate(async base64=>{
   const image=new Image();
   image.src='data:image/png;base64,'+base64;
   await image.decode();
   const W=image.naturalWidth,H=image.naturalHeight;
   const sourceCanvas=document.createElement('canvas');
   sourceCanvas.width=W;sourceCanvas.height=H;
   const raw=sourceCanvas.getContext('2d',{willReadFrequently:true});
   raw.drawImage(image,0,0);
   const before=raw.getImageData(0,0,W,H).data;
   const corrected=window.VedrasWaterTexture.seamlessTile(image,
    {centerStripe:false,edgeBand:32});
   const repaired=corrected.getContext('2d',{willReadFrequently:true})
    .getImageData(0,0,W,H).data;
   function verticalError(data){
    let sum=0,count=0;
    for(let y=0;y<H;y+=Math.max(1,Math.floor(H/80))){
     const a=y*W*4,b=(y*W+W-1)*4;
     for(let ch=0;ch<3;ch++){sum+=Math.abs(data[a+ch]-data[b+ch]);count++;}
    }
    return sum/Math.max(1,count);
   }
   const beforeEdge=verticalError(before),afterEdge=verticalError(repaired);
   const originalsNow=raw.getImageData(0,0,W,H).data;
   let changedSource=0;
   for(let i=0;i<before.length;i+=Math.max(4,Math.floor(before.length/2000)))
    if(before[i]!==originalsNow[i])changedSource++;
   const forest=window.VedrasForestGround;
   const field=(q,r,kind)=>({
    q,r,baseBiome:'grassland',categoryId:'grass_pasture',
    forestClass:kind,ground:true,jungle:false,glade:false
   });
   const cells=[field(0,0,'dense_forest'),field(1,0,'light_forest')];
   const outputs=[];
   const xy=[0,90,128,130,164,256];
   for(const resolution of [1.25,2.5]){
    const region=forest.build(cells,image,{
     resolution,textureSize:256,feather:23,maxPixels:4500000
    });
    if(!region)throw Error('Forest-floor build returned no raster');
    const ctx=region.canvas.getContext('2d',{willReadFrequently:true});
    function alphaAt(x,y){
     const px=Math.round((x-region.x)*region.scale),
      py=Math.round((y-region.y)*region.scale);
     if(px<0||py<0||px>=region.canvas.width||py>=region.canvas.height)
      return -1;
     return ctx.getImageData(px,py,1,1).data[3];
    }
    outputs.push({resolution,regionCount:region.regions,cellCount:region.cells,
     canvas:[region.canvas.width,region.canvas.height],
     scale:region.scale,alpha:xy.map(x=>({x,a:alphaAt(x,0)})),
     outside:alphaAt(-193,0)});
    if(resolution===2.5){
     region.canvas.style.cssText='max-width:950px;height:auto';
     document.body.appendChild(region.canvas);
    }
   }
   // Native browser pixel proof for the independent long-standing terrain
   // CHUNK seam: no terrain biomes, forest masks or texture changes involved.
   const source=document.createElement('canvas');
   source.width=104;source.height=104;
   const sourceCtx=source.getContext('2d');
   sourceCtx.fillStyle='#456e37';
   sourceCtx.fillRect(2,2,100,100);
   function drawCrop(box){
    const dest=document.createElement('canvas');
    dest.width=400;dest.height=400;
    const destCtx=dest.getContext('2d',{willReadFrequently:true});
    destCtx.imageSmoothingEnabled=true;
    destCtx.drawImage(source,box.x,box.y,box.w,box.h,
     0,0,dest.width,dest.height);
    const alphas=[];
    for(const [x,y] of [[0,0],[399,0],[0,399],[399,399],[1,200],[398,200]])
     alphas.push(destCtx.getImageData(x,y,1,1).data[3]);
    return alphas;
   }
   const coreCrop=window.VedrasWorldTiles.coreSourceCrop(source,2,100);
   const oldCrop={x:2,y:2,w:100,h:100};
   const corePixelProof={
    old:drawCrop(oldCrop),
    guarded:drawCrop(coreCrop),
    sourceCrop:coreCrop
   };
   const notForest=forest.build([{...cells[0],jungle:true}],image,{
    resolution:1.25,textureSize:256
   });
   const snowBoundary=forest.build([cells[0],{
    ...field(1,0,'none'),baseBiome:'snowfields',
    categoryId:'cold_regions',ground:true
   }],image,{resolution:1.5,textureSize:256,feather:23,
    maxPixels:4500000});
   const snowPixels=snowBoundary.canvas.getContext('2d',{
    willReadFrequently:true});
   const atSnowX=x=>{
    const px=Math.round((x-snowBoundary.x)*snowBoundary.scale),
     py=Math.round((0-snowBoundary.y)*snowBoundary.scale);
    return snowPixels.getImageData(px,py,1,1).data[3];
   };
   const snowFade=[102,118,128,145,170].map(x=>({
    worldX:x,alpha:atSnowX(x)
   }));
   // Real Firefox pixel comparison across two overlapping 512-unit tile
   // windows, retaining the SAME world UV and region alpha.
   const extended=[field(1,0,'dense_forest'),field(2,0,'dense_forest'),
    field(3,0,'light_forest'),field(4,0,'none')];
   const opts={resolution:1.4,textureSize:256,maxPixels:2600000,
    feather:23,regionOpacityOf:()=>.72};
   const west=forest.build(extended,image,{...opts,
    bounds:{x:-128,y:-128,width:768,height:768}});
   const east=forest.build(extended,image,{...opts,
    bounds:{x:384,y:-128,width:768,height:768}});
   const forestAt=(r,x,y)=>{
    const px=Math.floor((x-r.x)*r.scale),py=Math.floor((y-r.y)*r.scale);
    return Array.from(r.canvas.getContext('2d',{willReadFrequently:true})
     .getImageData(px,py,1,1).data);
   };
   const forestTileSeam=[490,505,512,520,535].map(x=>{
    const a=forestAt(west,x,0),b=forestAt(east,x,0);
    return {x,maxDiff:Math.max(...a.map((v,i)=>Math.abs(v-b[i])))};
   });
   return {forestTileSeam,forestWindows:[west,east].map(r=>({
    width:r.canvas.width,height:r.canvas.height,
    scale:r.scale,origin:r.textureOrigin})),
    source:{width:W,height:H,bytesApprox:base64.length*.75},
    wrapping:{beforeEdge,afterEdge,changedSource},
    outputs,jungleOverlay:notForest!==null,snowFade,corePixelProof};
  },png.toString('base64'));
  assert.ok(result.source.width>=40&&result.source.height>=40);
  assert.equal(result.wrapping.changedSource,0,'Source PNG is immutable');
  assert.ok(result.wrapping.afterEdge<=result.wrapping.beforeEdge+.25,
   'Real forest repeat edges must not worsen');
  assert.ok(result.wrapping.afterEdge<=1.25,
   'Opposite source-edge texels must repeat without a hard line');
  const oldAlpha=result.corePixelProof.old,
   guardedAlpha=result.corePixelProof.guarded;
  assert(guardedAlpha.every(a=>a>=250),
   'real Firefox: every core-edge sample must stay opaque when gutter is transparent: '+
   JSON.stringify(result.corePixelProof));
  assert(guardedAlpha.every((a,i)=>a>=oldAlpha[i]),
   'Guard must never introduce more alpha loss than the original sampling');
  assert.equal(result.jungleOverlay,false,
   'Jungle must not use the ordinary woodland overlay');
  for(const window of result.forestWindows){
   assert(window.width<1500&&window.height<1500,
    'bounded forest PNG source exceeded tile pixel budget');
   assert.equal(window.scale,1.4);
   assert.equal(window.origin,'world-0,0');
  }
  for(const point of result.forestTileSeam)
   assert(point.maxDiff<=18,
    'real Firefox: two neighboring forest tile sources have different pixels: '+
    JSON.stringify(point));
  const fade=result.snowFade.map(p=>p.alpha);
  assert.ok(fade[0]>fade[2]&&fade[2]>fade[3]&&fade[3]>=fade[4],
   'Snow-border forest alpha should fade across, not stop at the hex edge: '+
    JSON.stringify(result.snowFade));
  assert.ok(fade[2]>5,
   'The forest underlay must not be hard-clipped at the snow hex border: '+
    JSON.stringify(result.snowFade));
  assert.ok(fade[4]<24,'Snow interior must stay free of ordinary woodland underlay');
  for(const out of result.outputs){
   assert.equal(out.regionCount,1,'Adjacent woodland is a single masked region');
   assert.equal(out.cellCount,2);
   const left=out.alpha.find(a=>a.x===0).a;
   const right=out.alpha.find(a=>a.x===256).a;
   const seam=out.alpha.find(a=>a.x===128).a;
   assert.ok(left>65&&right>65,
    'Forest floor must be visible in BOTH dense and light woodland: '+JSON.stringify(out));
   assert.ok(seam>Math.min(left,right)*.65,
    'No straight inner alpha gap between adjacent forest hexes: '+JSON.stringify(out));
   assert.ok(out.outside>=0&&out.outside<30,
    'Outside woodland boundary must fade to transparency: '+JSON.stringify(out));
  }
  for(const x of [0,128,256]){
   const a=result.outputs[0].alpha.find(p=>p.x===x).a;
   const b=result.outputs[1].alpha.find(p=>p.x===x).a;
   assert.ok(Math.abs(a-b)<=18,
    '2x/4x forest opacity differs at world coordinate '+x+': '+a+'/'+b);
  }
  assert.deepEqual(errors,[],'Firefox script errors');
  await page.locator('canvas').last().screenshot({
   path:path.join(OUT,'real-wald-03-forest-overlay.png')
  });
  fs.writeFileSync(path.join(OUT,'real-wald-03-forest-audit.json'),
   JSON.stringify(result,null,2));
  console.log('REAL FOREST PIXEL TEST:',JSON.stringify({
   source:result.source,edge:result.wrapping,
   samples:result.outputs.map(x=>({resolution:x.resolution,alpha:x.alpha,outside:x.outside}))
  }));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

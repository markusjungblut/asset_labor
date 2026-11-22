'use strict';
/* Phase 2.8c: actual original birch PNG, genuine Firefox Canvas2D PNG bytes,
 * transparent pixel content and equal global pixels at the padded 512 seam.
 * A separate visual editor reference comparison is still mandatory.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const imagePath='assets/nature/birke1.png';
const catalog=JSON.parse(fs.readFileSync(
 path.join(root,'assets/nature/nature_catalog.json'),'utf8'));
const meta=catalog.entries['nature/birke1.png'];
assert(meta?.kind==='tree');
assert(fs.statSync(path.join(root,imagePath)).size>20000,
 'The ORIGINAL PNG source, not a stand-in image, is required.');
const allowed=new Set(['sprite-planner.js','nature-balance.js','polish.js',
 'large-map-bake-tree-png.js',imagePath]);
(async()=>{
 const server=http.createServer((request,response)=>{
  const name=decodeURIComponent((request.url||'/').split('?')[0]).replace(/^\//,'');
  if(name==='test'){
   response.writeHead(200,{'Content-Type':'text/html'});
   response.end('<!doctype html><meta charset="utf-8"><title>Nature raster proof</title>');
   return;
  }
  if(!allowed.has(name)){response.writeHead(404);response.end('not found');return;}
  response.writeHead(200,{'Content-Type':name.endsWith('.png')?
   'image/png':'text/javascript','Cache-Control':'no-store'});
  fs.createReadStream(path.join(root,name)).pipe(response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  const {firefox}=require('playwright');
  browser=await firefox.launch({headless:true});
  const page=await browser.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  const origin='http://127.0.0.1:'+server.address().port;
  await page.goto(origin+'/test',{waitUntil:'load'});
  for(const script of ['sprite-planner.js','nature-balance.js','polish.js',
   'large-map-bake-tree-png.js'])
   await page.addScriptTag({url:origin+'/'+script});
  const result=await page.evaluate(async ({meta,revision})=>{
   const p='assets/nature/birke1.png';
   const img=new Image();img.src='/'+p;await img.decode();
   const src=document.createElement('canvas');
   src.width=img.naturalWidth;src.height=img.naturalHeight;
   const srcCtx=src.getContext('2d',{willReadFrequently:true});
   srcCtx.drawImage(img,0,0);
   const sourcePixels=srcCtx.getImageData(0,0,src.width,src.height).data;
   let sourceOpaque=0;
   for(let i=3;i<sourcePixels.length;i+=4)if(sourcePixels[i]>12)sourceOpaque++;
   const worldSource={seed:'real-tree-png-proof',version:'geography-v2.1.2',
    width:10,height:10,originQ:0,originR:0};
   const plan={schema:'vedras-geography-bake-plan-v1',stage:'plan-only',
    rasterized:false,readyForViewer:false,source:{...worldSource,cells:100},
    grid:{tileSize:512},tileCount:2,
    tiles:[{id:'0,0',x:0,y:0,size:512},
     {id:'1,0',x:512,y:0,size:512}]};
   const treePlan={schema:'vedras-geography-tree-trunk-plan-v1',
    stage:'original-tree-trunks-read-only',rasterized:false,
    complete:false,readyForViewer:false,seed:12345,
    worldHexes:100,worldSource,natureCatalogRevision:revision,
    requiresOriginalPngDecoding:true,requiresTreeShadows:true,
    instances:[{assetPath:p,assetId:meta.id,q:2,r:0,dx:0,dy:70,
     scale:1,source:'geography-original-tree-trunk-preview',
     artStatus:meta.artStatus}]};
   const sourceAsset={path:p,relPath:p.slice(7),category:'nature',mtime:1};
   const renderer=window.VedrasLargeMapTreePNG.create({
    plan,treePlan,natureCatalog:{revision,entries:{[p.slice(7)]:meta}},
    assets:[sourceAsset],loadImage:async a=>{
     if(a.path!==p)throw Error('Unexpected PNG source: '+a.path);
     return {img};
    }
   });
   const a=await renderer.renderTile('0,0');
   const b=await renderer.renderTile('1,0');
   const decode=async blob=>{
    const bitmap=await createImageBitmap(blob);
    const canvas=document.createElement('canvas');
    canvas.width=bitmap.width;canvas.height=bitmap.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(bitmap,0,0);bitmap.close();
    return ctx;
   };
   const left=await decode(a.png),right=await decode(b.png);
   const overlapWidth=640,height=1632;
   // Same world x coordinates: left starts at -128, right at +384.
   // Their 512-world-unit displacement is exactly 1280 pixels.
   const L=left.getImageData(1280,0,overlapWidth,height).data;
   const R=right.getImageData(0,0,overlapWidth,height).data;
   let nonTransparent=0,transparent=0,differing=0;
   for(let i=0;i<L.length;i+=4){
    if(L[i+3]>0)nonTransparent++;else transparent++;
    if(L[i]!==R[i]||L[i+1]!==R[i+1]||
       L[i+2]!==R[i+2]||L[i+3]!==R[i+3])differing++;
   }
   return {sourceWidth:img.naturalWidth,sourceHeight:img.naturalHeight,
    sourceOpaque,nonTransparent,transparent,differing,
    overlapWidth,height,stages:[a.stage,b.stage],
    PNGBytes:[a.png.size,b.png.size],drawn:[a.drawn,b.drawn],
    complete:[a.complete,b.complete],ready:[a.readyForViewer,b.readyForViewer],
    projectedScaleX:a.samplesPerWorldUnitX,
    projectedScaleY:a.samplesPerWorldUnitY};
  },{meta,revision:catalog.revision??null});
  assert.deepEqual(pageErrors,[]);
  assert.equal(result.sourceWidth>20,true);
  assert.equal(result.sourceHeight>20,true);
  assert(result.sourceOpaque>100,'the original birch graphic must contain opaque pixels');
  assert.deepEqual(result.stages,[
   'original-tree-scenery-png-preview','original-tree-scenery-png-preview']);
  assert.deepEqual(result.drawn,[1,1]);
  assert.deepEqual(result.complete,[false,false]);
  assert.deepEqual(result.ready,[false,false]);
  assert(result.PNGBytes.every(x=>x>1000));
  assert(result.nonTransparent>200,'the original image must cross the world-tile seam');
  assert(result.transparent>200,'the output must retain alpha transparency');
  assert.equal(result.differing,0,
   'both overlapping original-tree PNG strips must agree byte-for-byte on every RGBA pixel');
  assert.equal(result.projectedScaleX,2.5);
  assert.equal(result.projectedScaleY,2.125);
  console.log('PASS original Nature PNG + global tile-seam pixel identity',JSON.stringify(result));
 }finally{
  try{await browser?.close();}finally{
   server.closeAllConnections();
   await new Promise(resolve=>server.close(resolve));
  }
 }
})().catch(error=>{console.error(error);process.exitCode=1;});

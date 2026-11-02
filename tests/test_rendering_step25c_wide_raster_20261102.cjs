'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const runtime=read('frozen-map-runtime.js'),policy=read('frozen-map-view-policy.js'),
 game=read('frozen-map-game.js'),page=read('frozen-map-game.html');
function fixture({largeViewportCache=true,dpr=1.735}={}){
 const w={},calls=[],buffers=[],cloudPaints=[];
 vm.runInNewContext(policy,{window:w});
 w.VedrasCloudArtwork={create(){
  return {setSeed(){},setAssets(){},stats(){return {bases:4}},
   drawBase(g,view){cloudPaints.push({width:view.width,height:view.height});g.fillRect(0,0,view.width,view.height)},
   drawUnready(){},drawTransitions(){}};
 }};
 const canvasWidth=2859,canvasHeight=929;
 const context=()=>({
  setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
  lineTo(){},closePath(){},clip(){},fillRect(){},translate(){},scale(){},
  drawImage(image){calls.push(image.id||'raster')}
 });
 const canvas={width:0,height:0,getContext:()=>context(),
  getBoundingClientRect:()=>({width:canvasWidth,height:canvasHeight})};
 const document={createElement:()=>{
  const buffer={width:0,height:0,getContext:()=>context()};
  buffers.push(buffer);return buffer;
 }};
 const records=new Map();
 for(let iy=-1;iy<=1;iy++)for(let ix=-1;ix<=1;ix++){
  const id=ix+','+iy,key='v1-0374527a|near|'+id;
  records.set(key,{key,sceneKey:'v1-0374527a',level:'near',
   tile:{id,x:ix*512,y:iy*512,size:512},
   layers:[
    {layer:'ground',pad:3,png:{id:'ground'+id,width:256,height:256}},
    {layer:'scenery',pad:128,png:{id:'scenery'+id,width:256,height:256}}
   ]});
 }
 const store={get:async key=>records.get(key),
  keys:async prefix=>[...records.keys()].filter(key=>key.startsWith(prefix))};
 let tick=0;
 vm.runInNewContext(runtime,{window:w,document,console,
  performance:{now:()=>++tick},requestAnimationFrame:()=>{}});
 const viewer=w.VedrasFrozenMap.create({canvas,storage:store,
  largeViewportCache,overview1x:false,
  decode:async img=>({...img,close(){}})});
 return {viewer,calls,buffers,cloudPaints,dpr};
}
async function warm(f){
 await f.viewer.load('v1-0374527a','near',
  {zoom:.96,panX:0,panY:0,dpr:f.dpr,projectY:.85},
  [{q:0,r:0,x:0,y:0,radius:140,visibility:'visible'}]);
 for(let i=0;i<70;i++){
  f.viewer.draw();await new Promise(resolve=>setImmediate(resolve));
  if(f.viewer.report().decoded===9&&f.viewer.report().pending===0)break;
 }
 f.viewer.draw();
 assert.equal(f.viewer.report().decoded,9);
}
test('ultrawide 8MP viewport keeps full-DPR world painter and 1.25x cached soft clouds',async()=>{
 const f=fixture();await warm(f);
 const afterWarm=f.viewer.report();
 assert.equal(afterWarm.largeViewportCache,true);
 assert.ok(afterWarm.overviewRasterBuilds>0,
  'padded 16.5MP raster fits the window that exceeded the old 8.5MP guard');
 assert.ok(afterWarm.cloudBackdropBuilds>0);
 const builds=afterWarm.overviewRasterBuilds,clouds=afterWarm.cloudBackdropBuilds;
 const worldHits=afterWarm.overviewRasterHits;
 const p= f.viewer.getPose();
 f.viewer.setPose({panX:p.panX+12,panY:p.panY+5});
 f.viewer.draw();
 const afterPan=f.viewer.report();
 assert.equal(afterPan.overviewRasterBuilds,builds);
 assert.equal(afterPan.cloudBackdropBuilds,clouds);
 assert.ok(afterPan.overviewRasterHits>worldHits);
 assert.ok(afterPan.cloudBackdropHits>afterWarm.cloudBackdropHits);
 assert.equal(afterPan.worldCacheFallbackFrames,afterWarm.worldCacheFallbackFrames,
  'warm pan does not fall back to full ground and scenery draw');
 assert.equal(afterPan.cloudCacheFallbackFrames,afterWarm.cloudCacheFallbackFrames,
  'warm pan does not stamp every cloud again');
 assert.ok(afterPan.cloudBackdropMiB<33,
  'cloud raster is at the lower density and remains within bounded pixels');
 const worldRasters=f.buffers.filter(b=>b.width*b.height>8500000);
 assert.ok(worldRasters.some(b=>b.width*b.height<=16500000),
  'world raster retains full requested image detail without global downscale');
 f.viewer.stop();
});
test('cacheLarge=0 keeps identical source scene but reproduces earlier raster budget fallback',async()=>{
 const f=fixture({largeViewportCache:false});await warm(f);
 const before=f.viewer.report();
 assert.equal(before.overviewRasterBuilds,0);
 assert.equal(before.cloudBackdropBuilds,0);
 f.viewer.setPose({panX:10});f.viewer.draw();
 const after=f.viewer.report();
 assert.ok(after.worldCacheFallbackFrames>before.worldCacheFallbackFrames);
 assert.ok(after.cloudCacheFallbackFrames>before.cloudCacheFallbackFrames);
 f.viewer.stop();
});
test('large caches do not change LOD, world layer ordering or original data writes',()=>{
 assert.match(game,/params\.get\('cacheLarge'\)!=='0'/);
 assert.match(runtime,/worldRasterLimit=largeViewportCache\?16500000:8500000/);
 assert.match(runtime,/cacheDpr=largeViewportCache\?Math\.min\(1\.25,dpr\):dpr/);
 assert.match(runtime,/target\.drawImage\(current\.canvas,sx,sy,/);
 assert.match(runtime,/list=\[\.\.\.list\]\.sort/);
 assert.match(page,/step25c-wide-cache/);
 assert.doesNotMatch(runtime,/bakeWorldTile\(/);
 for(const source of [runtime,policy,game])assert.doesNotThrow(()=>new Function(source));
});

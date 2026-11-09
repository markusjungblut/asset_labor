'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const runtime=read('frozen-map-runtime.js'),
 policy=read('frozen-map-view-policy.js'),game=read('frozen-map-game.js');
const scene='v1-0374527a';
function fixture({adaptiveWorldPad=false,width=2859,height=1382,
 dpr=1.433,largeViewportCache=true}={}){
 const window={},buffers=[],worldImages=[];
 vm.runInNewContext(policy,{window});
 const ctx=()=>({setTransform(){},save(){},restore(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},
  rect(){},clearRect(){},fillRect(){},translate(){},scale(){},
  drawImage(...args){worldImages.push(args);}
 });
 const canvas={width:0,height:0,getContext:ctx,
  getBoundingClientRect:()=>({width,height})};
 const document={createElement:()=>{
  const c={width:0,height:0,getContext:ctx};buffers.push(c);return c;
 }};
 const records=new Map();
 for(let iy=-1;iy<=1;iy++)for(let ix=-1;ix<=1;ix++){
  const id=ix+','+iy,key=scene+'|near|'+id;
  records.set(key,{key,sceneKey:scene,level:'near',
   tile:{id,x:ix*512,y:iy*512,size:512},layers:[
    {layer:'ground',pad:3,png:{width:512,height:512}},
    {layer:'scenery',pad:128,png:{width:768,height:768}}
   ]});
 }
 const storage={
  async keys(prefix){return [...records.keys()].filter(x=>x.startsWith(prefix))},
  async get(k){return records.get(k)}
 };
 let now=0;
 vm.runInNewContext(runtime,{window,document,console,
  performance:{now:()=>++now},requestAnimationFrame:()=>{}});
 const viewer=window.VedrasFrozenMap.create({canvas,storage,adaptiveWorldPad,
  largeViewportCache,overview1x:false,autoCloudStrategy:false,
  decode:async image=>({...image,close(){}}),maxDecodedPixels:9000000});
 const pose={zoom:.85,panX:0,panY:0,dpr,projectY:.85};
 return {viewer,buffers,worldImages,async warm(){
  await viewer.load(scene,'near',pose,[{q:0,r:0,x:0,y:0,radius:1000,
   visibility:'visible'}]);
  for(let i=0;i<12;i++){
   viewer.draw();await new Promise(resolve=>setImmediate(resolve));
  }
  assert.equal(viewer.report().decoded,records.size);
  assert.equal(viewer.report().pending,0);
  assert.ok(viewer.report().overviewRasterBuilds>0);
 }};
}
test('opt-in reuses original world 16.5MP limit and increases pad only if it fits',async()=>{
 const old=fixture(),boost=fixture({adaptiveWorldPad:true});
 await old.warm();await boost.warm();
 const a=old.viewer.report(),b=boost.viewer.report();
 assert.equal(a.adaptiveWorldPad,false);
 assert.equal(b.adaptiveWorldPad,true);
 assert.equal(a.worldEffectivePad,272);
 assert.ok(b.worldEffectivePad>a.worldEffectivePad+100,
  'wide-screen panorama can use more EXISTING headroom as a pan buffer');
 assert.ok(b.worldEffectivePad<=440);
 assert.ok(b.worldPadBoostFrames>0);
 assert.ok(b.worldPadClampFrames>0);
 assert.equal(a.worldRasterLimit,16500000);
 assert.equal(b.worldRasterLimit,a.worldRasterLimit);
 const worlds=boost.buffers.filter(c=>c.width*c.height>10000000);
 assert.ok(worlds.length>0);
 assert.ok(worlds.every(c=>c.width*c.height<=b.worldRasterLimit&&
  c.width<=8192&&c.height<=8192),
  'all world panorama buffers remain strictly under original pixel/edge cap');
 assert.ok(worlds.some(c=>c.width*c.height>old.buffers.reduce(
  (n,v)=>Math.max(n,v.width*v.height),0)));
 old.viewer.stop();boost.viewer.stop();
});
test('350px bidirectional pan stays in bigger buffer and avoids two full raster rebuilds',async()=>{
 const old=fixture(),boost=fixture({adaptiveWorldPad:true});
 await old.warm();await boost.warm();
 const baseOld=old.viewer.report().overviewRasterBuilds,
  baseBoost=boost.viewer.report().overviewRasterBuilds;
 for(const x of [old,boost]){
  x.viewer.setPose({panX:350});x.viewer.draw();
  x.viewer.setPose({panX:0});x.viewer.draw();
 }
 assert.ok(old.viewer.report().overviewRasterBuilds>=baseOld+2,
  'default 272px pad requires both full 350px pan raster rebuilds');
 assert.equal(boost.viewer.report().overviewRasterBuilds,baseBoost,
  'extra cap-bounded pad eliminates both full world raster rebuilds');
 assert.ok(boost.viewer.report().overviewRasterHits>0);
 assert.equal(boost.viewer.report().failures,0);
 old.viewer.stop();boost.viewer.stop();
});
test('cannot force a larger raster when current viewport already exceeds existing limit',async()=>{
 const f=fixture({adaptiveWorldPad:true,width:3900,height:2000,dpr:2});
 await f.viewer.load(scene,'near',
  {zoom:.85,panX:0,panY:0,dpr:2,projectY:.85},
  [{q:0,r:0,x:0,y:0,radius:2000,visibility:'visible'}]);
 for(let i=0;i<6;i++){
  f.viewer.draw();await new Promise(resolve=>setImmediate(resolve));
 }
 const stats=f.viewer.report();
 assert.equal(stats.worldRasterLimit,16500000);
 assert.equal(stats.worldPadBoostFrames,0);
 assert.equal(stats.overviewRasterBuilds,0);
 assert.ok(stats.worldCacheFallbackFrames>0);
 assert.ok(f.buffers.every(c=>c.width*c.height<=16500000),
  'never create out-of-budget raster even when boosting impossible');
 f.viewer.stop();
});
test('new pad remains opt-in without archive writes or changes to layer quality',()=>{
 assert.match(game,/params\.get\('worldPad'\)!=='0'/);
 assert.match(runtime,/adaptiveWorldPad=true/);
 assert.match(runtime,/worldRasterLimit\/\(dpr\*dpr\)/);
 assert.match(runtime,/const pad=worldCachePad\(view,dpr\)/);
 assert.match(runtime,/const rasterPad=viewportPolicy\?worldCachePad\(view,dpr\):0/);
 assert.match(runtime,/cw\*ch<=worldRasterLimit&&cw<=8192&&ch<=8192/);
 assert.match(runtime,/target\.drawImage\(m\.canvas,sx,sy,view\.width\*dpr/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 for(const code of [runtime,policy,game])assert.doesNotThrow(()=>new Function(code));
});

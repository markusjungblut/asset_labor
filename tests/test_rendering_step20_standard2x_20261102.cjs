'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const load=file=>fs.readFileSync(path.join(root,file),'utf8');
const derivedSrc=load('frozen-map-derived-2x.js'),
 policySrc=load('render-quality-policy.js'),appSrc=load('app.js'),
 gameSrc=load('frozen-map-game.js'),html=load('index.html'),
 page=load('frozen-map-game.html'),runtime=load('frozen-map-runtime.js');
function png(w,h){
 const buf=new Uint8Array(24),head=[137,80,78,71,13,10,26,10];
 buf.set(head,0);const view=new DataView(buf.buffer);
 view.setUint32(16,w);view.setUint32(20,h);
 return new Blob([buf],{type:'image/png'});
}
const wrap=()=>{
 const win={},ctx={window:win,Blob,console};
 vm.runInNewContext(derivedSrc,ctx);
 return win.VedrasFrozenDerived2x;
};
test('2x crop metadata leaves WORLD coordinates and pad intact',()=>{
 const d=wrap(),input={crop:{x:416,y:57,fullWidth:3072,fullHeight:2611},pad:128};
 const c=d.scaledCrop(input,2400,1800,1200,900);
 assert.deepEqual(JSON.parse(JSON.stringify(c)),{
  x:208,y:28.5,fullWidth:1536,fullHeight:1305.5});
 assert.equal(input.pad,128);
 assert.equal(input.crop.x,416);
 const originalLeft=input.crop.x/input.crop.fullWidth;
 assert.equal(c.x/c.fullWidth,originalLeft);
 const newNoCrop=d.scaledCrop({layer:'ground',pad:3},2068,1758,1034,879);
 assert.equal(newNoCrop,null);
});
test('PNG header gives dimensions without decoding a 4x Bitmap',async()=>{
 const d=wrap();
 assert.deepEqual(JSON.parse(JSON.stringify(await d.dimensions(png(2072,1761)))),
  {width:2072,height:1761});
 await assert.rejects(()=>d.dimensions(new Blob(['not png'])),/PNG-Header/);
});
test('2x derived store never writes to source and serves stored half-size images',async()=>{
 const cache=new Map();
 const idb={open:()=>{
  const request={result:{
   objectStoreNames:{contains:()=>true},
   transaction:()=>{
    const tx={};
    tx.objectStore=()=>({
     get:key=>{
      const req={};
      setTimeout(()=>{req.result=cache.get(key);req.onsuccess?.();tx.oncomplete?.();},0);
      return req;
     },
     put:rec=>{
      const req={};
      setTimeout(()=>{cache.set(rec.key,rec);req.onsuccess?.();tx.oncomplete?.();},0);
      return req;
     }
    });
    return tx;
   }
  }};
  setTimeout(()=>request.onsuccess?.(),0);
  return request;
 }};
 const fakeCanvas=()=>({
  width:0,height:0,
  getContext:()=>({imageSmoothingEnabled:false,imageSmoothingQuality:'',
   drawImage:()=>{}}),
  toBlob(callback){callback(png(this.width,this.height));}
 });
 const win={};
 vm.runInNewContext(derivedSrc,{
  window:win,Blob,DataView,Uint8Array,
  indexedDB:idb,document:{createElement:()=>fakeCanvas()},
  createImageBitmap:async (_blob,options)=>({
   width:options.resizeWidth,height:options.resizeHeight,close(){}
  }),console,setTimeout
 });
 const code=win.VedrasFrozenDerived2x;
 const key='v1-0374527a|near|0,0',sourceRecord={key,sceneKey:'v1-0374527a',
  level:'near',revision:'r1',tile:{id:'0,0',x:0,y:0,size:512},
  layers:[
   {layer:'ground',pad:3,crop:null,png:png(2080,1760)},
   {layer:'scenery',pad:128,crop:{x:400,y:100,fullWidth:3072,fullHeight:2611},
    png:png(2400,1400)}
  ]};
 const originalSourceBlob=sourceRecord.layers[0].png;
 let reads=0,writes=0;
 const source={
  get:async k=>{reads++;return k===key?sourceRecord:{key:k,schema:1};},
  keys:async prefix=>[key].filter(k=>k.startsWith(prefix)),
  put:async()=>{writes++;throw Error('Source must never be changed');}
 };
 const store=code.createStore({source});
 assert.equal(await store.get(key),sourceRecord,'disabled derived cache reads originals');
 store.setEnabled(true);
 const first=await store.get(key);
 const originalDims=await code.dimensions(originalSourceBlob);
 const newDims=await code.dimensions(first.layers[0].png);
 assert.deepEqual(JSON.parse(JSON.stringify(originalDims)),{width:2080,height:1760});
 assert.deepEqual(JSON.parse(JSON.stringify(newDims)),{width:1040,height:880});
 assert.equal(first.layers[0].pad,3);
 assert.equal(first.layers[1].pad,128);
 assert.equal(first.layers[1].crop.x,200);
 assert.equal(first.layers[1].crop.fullWidth,1536);
 assert.equal(first.derivedFormat,'2x-png-v1');
 assert.equal(sourceRecord.layers[1].crop.x,400,'source metadata unchanged');
 assert.equal(sourceRecord.layers[0].png,originalSourceBlob);
 assert.equal(writes,0,'no source put');
 const second=await store.get(key);
 assert.equal(second.derivedFormat,'2x-png-v1');
 assert.equal(store.stats().converted,1,'one conversion only');
 assert.equal(store.stats().hits,1,'subsequent read uses derived cache');
 assert.equal(writes,0);
 await assert.rejects(()=>store.put(sourceRecord),/nur lesend/);
});
test('step 20 applies 2x standard without altering 4x baked PNG manifest',()=>{
 const win={};vm.runInNewContext(policySrc,{window:win});
 const policy=win.VedrasRenderQuality.resolve({width:800,height:600});
 assert.equal(policy.quality,'2');assert.equal(policy.requestedDpr,2);
 assert.match(appSrc,/view:'map',dpr:1,quality:'2'/);
 assert.match(html,/<option value="2" selected>2×/);
 assert.match(html,/<option value="4" disabled>/);
 assert.ok(gameSrc.includes('const gameDpr=Math.min(2,Math.sqrt(8000000/area),4096/edge)'));
 assert.ok(gameSrc.includes('startPose={...startPose,dpr:Math.max(1,gameDpr)}'));
 assert.match(gameSrc,/twoXStore\.setEnabled\(lod==='near'/);
 assert.match(page,/frozen-map-derived-2x\.js/);
 assert.match(runtime,/return \{create,memoryStore,indexedStore,valid,makeKey\}/);
 assert.match(appSrc,/groundInfoCache\.graph!==graph/);
 assert.match(appSrc,/End cached DOM-only diagnostics/);
 assert.doesNotMatch(derivedSrc,/source\.put\(/);
 assert.doesNotMatch(derivedSrc,/bakeWorldTile\(/);
 assert.doesNotThrow(()=>new Function(appSrc));
});

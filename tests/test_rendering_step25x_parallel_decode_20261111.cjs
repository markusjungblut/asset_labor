'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const runtime=fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8');
const policy=fs.readFileSync(path.join(root,'frozen-map-view-policy.js'),'utf8');
const game=fs.readFileSync(path.join(root,'frozen-map-game.js'),'utf8');
const SCENE='v1-12345678',KEY=SCENE+'|near|0,0';
function fixture(parallelLayerDecode){
 const window={},requested=[],closed=[],drawn=[];
 vm.runInNewContext(policy,{window});
 const ctx=()=>({setTransform(){},save(){},restore(){},beginPath(){},
  moveTo(){},lineTo(){},closePath(){},clip(){},clearRect(){},
  fillRect(){},fill(){},translate(){},scale(){},
  drawImage(image){drawn.push(image.id)}});
 const canvas={width:0,height:0,getContext:ctx,
  getBoundingClientRect:()=>({width:400,height:240})};
 let now=0;
 vm.runInNewContext(runtime,{window,document:{createElement:()=>({getContext:ctx})},
  console,requestAnimationFrame:()=>{},performance:{now:()=>++now}});
 const storage={
  keys:async prefix=>KEY.startsWith(prefix)?[KEY]:[],
  get:async key=>{
   if(key!==KEY)throw Error('Unexpected test tile');
   return {key,sceneKey:SCENE,level:'near',
    tile:{id:'0,0',x:0,y:0,size:512},layers:[
     {layer:'ground',pad:3,png:{id:'G',width:512,height:512}},
     {layer:'scenery',pad:128,png:{id:'S',width:768,height:768}}
    ]};
  }
 };
 const decode=png=>new Promise((resolve,reject)=>{
  requested.push({id:png.id,
   resolve:()=>resolve({id:png.id,width:png.width,height:png.height,
    close:()=>closed.push(png.id)}),
   reject:()=>reject(Error('Decode failed: '+png.id))
  });
 });
 const player=window.VedrasFrozenMap.create({canvas,storage,decode,
  parallelLayerDecode,useLayerCache:false,overview1x:false,
  prefetchGuard:true,maxDecodedPixels:10000000});
 return {player,requested,closed,drawn};
}
const settle=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};
async function start(parallelLayerDecode){
 const f=fixture(parallelLayerDecode);
 await f.player.load(SCENE,'near',
  {zoom:.85,panX:0,panY:0,projectY:.85,dpr:1.25},
  [{q:0,r:0,x:0,y:0,radius:145,visibility:'visible'}]);
 f.player.draw();await settle();
 return f;
}
test('25X legacy decoder is strictly sequential and remains the default',async()=>{
 const f=await start(false);
 assert.deepEqual(f.requested.map(r=>r.id),['G']);
 f.requested[0].resolve();await settle();
 assert.deepEqual(f.requested.map(r=>r.id),['G','S']);
 f.requested[1].resolve();await settle();
 f.player.draw();
 assert.deepEqual(f.drawn,['G','S']);
 assert.equal(f.player.report().parallelTileDecodes,0);
 assert.equal(f.player.report().parallelLayerDecode,false);
 assert.equal(f.player.report().failures,0);
 f.player.stop();
 assert.deepEqual(f.closed.sort(),['G','S']);
});
test('25X parallel decode retains original Ground-then-Scenery paint order',async()=>{
 const f=await start(true);
 assert.deepEqual(f.requested.map(r=>r.id),['G','S'],
  'Both decoding tasks must be launched before either completes');
 f.requested[1].resolve();await settle();
 assert.equal(f.player.report().decoded,0,
  'Do not expose half-decoded tile before its sibling is ready');
 f.requested[0].resolve();await settle();
 f.player.draw();
 assert.deepEqual(f.drawn,['G','S'],
  'Promise.allSettled must preserve layer order despite opposite finish order');
 assert.equal(f.player.report().parallelTileDecodes,1);
 assert.equal(f.player.report().parallelDecodeFailures,0);
 assert.equal(f.player.report().failures,0);
 assert.ok(f.player.report().decodedPixels<=f.player.report().maxDecodedPixels);
 f.player.stop();
 assert.deepEqual(f.closed.sort(),['G','S']);
});
test('25X failed Scenery closes successful Ground before propagating error',async()=>{
 const f=await start(true);
 f.requested[0].resolve();await settle();
 f.requested[1].reject();await settle();
 assert.equal(f.player.report().pending,0);
 assert.equal(f.player.report().decoded,0);
 assert.equal(f.player.report().failures,1);
 assert.equal(f.player.report().parallelDecodeFailures,1);
 assert.deepEqual(f.closed,['G']);
 f.player.stop();
 assert.deepEqual(f.closed,['G'],'No double-close on stop');
});
test('25X failed Ground closes successful Scenery even when it finishes later',async()=>{
 const f=await start(true);
 f.requested[0].reject();await settle();
 assert.equal(f.player.report().pending,1,
  'allSettled must await the other decode before releasing the tile');
 f.requested[1].resolve();await settle();
 assert.equal(f.player.report().pending,0);
 assert.equal(f.player.report().decoded,0);
 assert.equal(f.player.report().failures,1);
 assert.equal(f.player.report().parallelDecodeFailures,1);
 assert.deepEqual(f.closed,['S'],
  'Late successful bitmap must be closed after its sibling rejects');
 f.player.stop();
});
test('25X is explicitly opt-in, does not mutate an archived world',()=>{
 assert.match(game,/params\.get\('parallelDecode'\)==='1'/);
 assert.match(runtime,/parallelLayerDecode=false/);
 assert.match(runtime,/Promise\.allSettled/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 for(const code of [runtime,game])assert.doesNotThrow(()=>new Function(code));
});

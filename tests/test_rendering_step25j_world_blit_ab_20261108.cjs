'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const runtime=read('frozen-map-runtime.js');
const policy=read('frozen-map-view-policy.js');
const game=read('frozen-map-game.js');
const scene='v1-0374527a',key=scene+'|near|0,0';
async function sample(wholeWorldBlit){
 const window={},mainCalls=[];
 vm.runInNewContext(policy,{window});
 const makeCtx=target=>({
  setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
  lineTo(){},closePath(){},clip(){},translate(){},scale(){},rect(){},
  clearRect(){},fillRect(){},drawImage(...a){
   if(target==='display')mainCalls.push(a);
  }
 });
 const canvas={width:0,height:0,getContext:()=>makeCtx('display'),
  getBoundingClientRect:()=>({width:500,height:320})};
 const document={createElement:()=>({width:0,height:0,
  getContext:()=>makeCtx('offscreen')})};
 const record={key,sceneKey:scene,level:'near',
  tile:{id:'0,0',x:0,y:0,size:512},revision:'r1',layers:[
   {layer:'ground',pad:3,png:{width:512,height:512}},
   {layer:'scenery',pad:128,png:{width:768,height:768}}]};
 const storage={async keys(){return [key];},async get(){return record;}};
 let now=0;
 vm.runInNewContext(runtime,{window,document,
  performance:{now:()=>++now},requestAnimationFrame:()=>{},console});
 const player=window.VedrasFrozenMap.create({canvas,storage,
  wholeWorldBlit,overview1x:false,
  decode:async image=>({...image,close(){}})});
 const pose={zoom:.85,panX:0,panY:0,dpr:1.25,projectY:.85};
 await player.load(scene,'near',pose,[{q:0,r:0,x:0,y:0,
  radius:250,visibility:'visible'}]);
 for(let i=0;i<3;i++){
  player.draw();
  await new Promise(resolve=>setImmediate(resolve));
 }
 assert.equal(player.report().overviewRasterBuilds,1);
 const first=mainCalls.at(-1);
 player.setPose({panX:24,panY:-11});
 player.draw();
 const moved=mainCalls.at(-1);
 const stats=player.report();
 player.stop();
 return {first,moved,stats};
}
function sourceAt(call,x,y){
 const img=call[0];
 if(call.length===9){
  const [,sx,sy,sw,sh,dx,dy,dw,dh]=call;
  return [sx+(x-dx)*sw/dw,sy+(y-dy)*sh/dh];
 }
 if(call.length===5){
  const [,dx,dy,dw,dh]=call;
  return [(x-dx)*img.width/dw,(y-dy)*img.height/dh];
 }
 throw Error('unexpected canvas drawImage signature '+call.length);
}
test('cropped 9-argument blit remains the stable default',async()=>{
 const result=await sample(false);
 assert.equal(result.stats.wholeWorldBlit,false);
 assert.equal(result.first.length,9);
 assert.equal(result.moved.length,9);
 assert.ok(result.stats.overviewRasterHits>0);
});
test('whole-source 5-argument 1:1 blit maps the exact same world pixels under pan',async()=>{
 const old=await sample(false),alternative=await sample(true);
 assert.equal(alternative.stats.wholeWorldBlit,true);
 assert.equal(alternative.first.length,5);
 assert.equal(alternative.moved.length,5);
 assert.equal(alternative.stats.overviewRasterBuilds,old.stats.overviewRasterBuilds);
 for(const k of ['first','moved'])for(const [x,y] of
  [[0,0],[25,17],[250,160],[499,319]]){
  const a=sourceAt(old[k],x,y),b=sourceAt(alternative[k],x,y);
  for(let i=0;i<2;i++)
   assert.ok(Math.abs(a[i]-b[i])<1e-9,
    'different source pixel '+k+' @ '+x+','+y+' channel '+i+': '+a[i]+' vs '+b[i]);
 }
});
test('step25j is an opt-in render-only comparison without atlas mutation',()=>{
 assert.match(game,/params\.get\('worldBlit'\)==='whole'/);
 assert.match(runtime,/wholeWorldBlit=false/);
 assert.match(runtime,/target\.drawImage\(m\.canvas,-sx\/dpr,-sy\/dpr/);
 assert.match(runtime,/target\.drawImage\(m\.canvas,sx,sy,view\.width\*dpr/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 for(const code of [game,runtime,policy])assert.doesNotThrow(()=>new Function(code));
});

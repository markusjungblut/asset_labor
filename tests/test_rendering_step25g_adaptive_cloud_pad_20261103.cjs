'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const runtime=read('frozen-map-runtime.js'),policy=read('frozen-map-view-policy.js'),
 game=read('frozen-map-game.js'),html=read('frozen-map-game.html');
function fixture(adaptiveCloudCache){
 const window={},drawCloud=[],buffers=[];
 vm.runInNewContext(policy,{window});
 window.VedrasCloudArtwork={create:()=>({
  stats:()=>({bases:4,edges:0,pending:0}),
  setSeed(){},setAssets(){},
  drawBase(g,view){drawCloud.push([view.width,view.height]);g.fillRect(0,0,view.width,view.height);},
  drawUnready(){},drawTransitions(){}
 })};
 const ctx=()=>({setTransform(){},save(){},restore(){},beginPath(){},
  moveTo(){},lineTo(){},closePath(){},clip(){},fillRect(){},
  rect(){},clearRect(){},drawImage(){},translate(){},scale(){}});
 const width=2859,height=1382;
 const canvas={width:0,height:0,getContext:ctx,
  getBoundingClientRect:()=>({width,height})};
 const document={createElement(){
  const c={width:0,height:0,getContext:ctx};buffers.push(c);return c;
 }};
 const key='v1-0374527a|near|0,0';
 const record={key,sceneKey:'v1-0374527a',level:'near',
  tile:{id:'0,0',x:0,y:0,size:512},
  layers:[{layer:'ground',pad:3,png:{width:512,height:512}},
   {layer:'scenery',pad:128,png:{width:768,height:768}}]};
 const storage={async keys(prefix){return key.startsWith(prefix)?[key]:[];},
  async get(k){return k===key?record:null}};
 let now=0;
 vm.runInNewContext(runtime,{window,document,console,
  performance:{now:()=>++now},requestAnimationFrame:()=>{}});
 const player=window.VedrasFrozenMap.create({
  canvas,storage,adaptiveCloudCache,
  decode:async blob=>({...blob,close(){}}),maxDecodedPixels:5000000
 });
 return {player,buffers,drawCloud};
}
async function ready(f){
 await f.player.load('v1-0374527a','near',
  {zoom:.85,panX:0,panY:0,dpr:1.25,projectY:.85},
  [{q:0,r:0,x:256,y:256,radius:140,visibility:'visible'}]);
 for(let i=0;i<8;i++){f.player.draw();await new Promise(r=>setImmediate(r));}
}
test('ultrawide 1.25x clouds fit existing 8.5MP budget by reducing overscan only',async()=>{
 const f=fixture(true);await ready(f);
 const first=f.player.report();
 assert.equal(first.adaptiveCloudCache,true);
 assert.ok(first.cloudBackdropBuilds>0,'wide viewport no longer disables artwork cache');
 assert.ok(first.cloudBackdropMiB>0&&first.cloudBackdropMiB<=33);
 assert.ok(first.cloudEffectivePad>=8&&first.cloudEffectivePad<272);
 assert.ok(first.cloudPadClamps>0);
 assert.equal(first.cloudCacheFallbackFrames,0);
 const builds=first.cloudBackdropBuilds,clouds=f.drawCloud.length;
 for(let i=0;i<8;i++)f.player.draw();
 const after=f.player.report();
 assert.equal(after.cloudBackdropBuilds,builds,'no new cloud artwork stamping');
 assert.ok(after.cloudBackdropHits>=first.cloudBackdropHits+8);
 assert.equal(f.drawCloud.length,clouds);
 f.player.stop();
});
test('cloudPad=0 reproduces old direct cloud fallback at same zoom and resolution',async()=>{
 const f=fixture(false);await ready(f);
 const first=f.player.report();
 assert.equal(first.adaptiveCloudCache,false);
 assert.equal(first.cloudBackdropBuilds,0);
 assert.ok(first.cloudCacheFallbackFrames>=8);
 const drawn=f.drawCloud.length;
 for(let i=0;i<8;i++)f.player.draw();
 assert.ok(f.drawCloud.length>=drawn+8);
 assert.equal(f.player.report().cloudBackdropMiB,0);
 f.player.stop();
});
test('smaller cloud overscan never modifies world 2x resolution or Fog geometry',()=>{
 assert.match(game,/params\.get\('cloudPad'\)!=='0'/);
 assert.match(html,/step25g-cloud-pad/);
 assert.match(runtime,/const cacheDpr=largeViewportCache\?Math\.min\(1\.25,dpr\):dpr/);
 assert.match(runtime,/cloudRasterLimit\/\(cacheDpr\*cacheDpr\)/);
 assert.match(runtime,/pad=Math\.max\(0,Math\.min\(pad,bound\)\)/);
 assert.match(runtime,/clouds\.drawUnready\(ctx,view,cells,ready,fadeOpacity\)/);
 assert.match(runtime,/worldRasterLimit=largeViewportCache\?16500000:8500000/);
 assert.doesNotMatch(runtime,/bakeWorldTile\(|deleteDatabase\(/);
 for(const file of [runtime,policy,game])assert.doesNotThrow(()=>new Function(file));
});
'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const runtime=read('frozen-map-runtime.js'),policy=read('frozen-map-view-policy.js'),
 game=read('frozen-map-game.js'),page=read('frozen-map-game.html');

function fixture({width=1200,height=800,withClouds=false}={}){
 const window={};
 vm.runInNewContext(policy,{window});
 const draws=[],sourceGets=[];
 let now=10,cloudFades=0,cloudFrames=0;
 const ctx=()=>{
  const g={setTransform(){},save(){},restore(){},beginPath(){},
   moveTo(){},lineTo(){},closePath(){},clip(){},translate(){},scale(){},
   fillRect(){},fill(){},clearRect(){},imageSmoothingEnabled:true,
   drawImage(image){draws.push(image?.id||image?.kind||'other')},
   globalAlpha:1};
  return g;
 };
 const display={width:0,height:0,
  getBoundingClientRect:()=>({width,height}),getContext:()=>ctx()};
 const document={createElement:()=>({kind:'offscreen',width:0,height:0,
  getContext:()=>ctx()})};
 if(withClouds)window.VedrasCloudArtwork={create:()=>({
  setSeed(){},setAssets(){},stats:()=>({bases:4}),
  drawBase(){cloudFrames++},drawTransitions(){},
  drawUnready(g,view,cells,ready,alpha){
   for(const c of cells)if(c.visibility==='visible')
    if(ready(c))cloudFades++;
  }
 })};
 const packets=new Map();
 for(let iy=-1;iy<=1;iy++)for(let ix=-1;ix<=1;ix++){
  const id=ix+','+iy,key='v1-0374527a|near|'+id;
  packets.set(key,{key,sceneKey:'v1-0374527a',level:'near',
   tile:{id,x:ix*512,y:iy*512,size:512},
   layers:[
    {layer:'ground',pad:3,png:{id:'G:'+id,width:250,height:250}},
    {layer:'scenery',pad:128,
     crop:{x:0,y:0,fullWidth:250,fullHeight:250},
     png:{id:'S:'+id,width:250,height:250}}
   ]});
 }
 const storage={
  keys:async prefix=>[...packets.keys()].filter(k=>k.startsWith(prefix)),
  get:async key=>{sourceGets.push(key);return packets.get(key)}
 };
 vm.runInNewContext(runtime,{window,document,console,
  requestAnimationFrame:()=>{},performance:{now:()=>now}});
 const player=window.VedrasFrozenMap.create({canvas:display,storage,
  decode:async image=>({...image,close(){}})});
 return {player,draws,sourceGets,advance(ms){now+=ms},
  cloudFades:()=>cloudFades,cloudFrames:()=>cloudFrames};
}
async function warm(f,pose={zoom:.8,panX:0,panY:0,dpr:1.25,projectY:.85}){
 const p=f.player;
 await p.load('v1-0374527a','near',pose,
  [{q:0,r:0,x:0,y:0,radius:148,visibility:'visible'}]);
 for(let i=0;i<30;i++){
  p.draw();
  await new Promise(resolve=>setImmediate(resolve));
  if(p.report().decoded===9&&p.report().pending===0)break;
 }
 assert.equal(p.report().decoded,9,'all simulated WorldTiles decoded');
 assert.equal(p.report().pending,0);
 p.draw();
}
function sequences(draws){
 const groups=[],arr=draws.filter(x=>x.startsWith('S:'));
 for(let i=0;i<arr.length;i+=9)groups.push(arr.slice(i,i+9));
 return groups;
}
test('direct live camera never calls blurry zoom/drag preview',()=>{
 assert.doesNotMatch(game,/player\.beginZoomPreview\s*\(/);
 assert.doesNotMatch(game,/player\.endZoomPreview\s*\(/);
 assert.match(game,/setPose\(\{panX:p\.panX\+dx,panY:p\.panY\+dy\}/);
 assert.match(game,/const gestureDpr=Math\.min\(p\.dpr\|\|2,1\.25\)/);
 assert.match(game,/zoomSettler=setTimeout\(settleZoom,130\)/);
 assert.match(page,/frozen-map-runtime\.js/);
});
test('tree and shadow layers preserve same stable tile depth after zoom or reordered cache',async()=>{
 const f=fixture();await warm(f);
 const original=sequences(f.draws).at(-1);
 assert.equal(original.length,9);
 f.player.setPose({zoom:.9,panX:10,panY:12});
 f.player.draw();
 const changed=sequences(f.draws).at(-1);
 assert.deepEqual(changed,original,
  'scenery owner layers must not swap when the camera moves');
 assert.deepEqual(original,[
  'S:-1,-1','S:0,-1','S:1,-1',
  'S:-1,0','S:0,0','S:1,0',
  'S:-1,1','S:0,1','S:1,1']);
 f.player.stop();
});
test('a tile whose scenery overhang crosses the screen is rendered before its core',async()=>{
 const f=fixture({width:400,height:240});
 await f.player.load('v1-0374527a','near',
  {zoom:.8,panX:-200,panY:0,dpr:1.25,projectY:.85},
  [{q:0,r:0,x:0,y:0,radius:148,visibility:'visible'}]);
 // The 1,0 tile core starts at x = 200 - 200 + 512*0.8 = 409.6,
 // outside the 400px frame. Its 128-unit tree crowns and shadows still
 // extend 102.4 screen pixels into that frame.
 for(let n=0;n<30;n++){
  f.player.draw();
  await new Promise(resolve=>setImmediate(resolve));
  if(f.player.report().pending===0&&f.draws.includes('S:1,0'))break;
 }
 f.draws.length=0;f.player.draw();
 assert.ok(f.draws.includes('S:1,0'),
  'sprite overhang visible even though owning tile core is outside view');
 assert.ok(runtime.includes('SCENERY_OVERHANG_WORLD*view.zoom'));
 assert.ok(runtime.includes('marginWorld:Math.max((pad+48)/view.zoom'));
 f.player.stop();
});
test('decoded tile streaming and alpha state update on live pan, not on release',async()=>{
 const f=fixture({withClouds:true});await warm(f);
 const start=f.player.report().frames;
 f.player.setPose({panX:18,panY:10});f.player.draw();
 f.player.setPose({panX:36,panY:20});f.player.draw();
 assert.equal(f.player.report().frames,start+2);
 assert.ok(f.cloudFrames()>=1);
 assert.equal(f.player.report().zoomPreviewActive,false);
 f.player.stop();
});
test('2x atlas and persistent variants are never touched by live-camera changes',()=>{
 assert.doesNotMatch(runtime,/source\.put\(|deleteDatabase\(|bakeWorldTile\(/);
 assert.doesNotMatch(game,/source\.put\(|deleteDatabase\(|bakeWorldTile\(/);
 assert.match(runtime,/list=\[\.\.\.list\]\.sort/);
 assert.match(runtime,/\(ta\.y-tb\.y\)\|\|\(ta\.x-tb\.x\)/);
 assert.match(page,/footer\{box-sizing:border-box;flex:0 0 36px/);
 for(const value of [runtime,game,policy])
  assert.doesNotThrow(()=>new Function(value));
});

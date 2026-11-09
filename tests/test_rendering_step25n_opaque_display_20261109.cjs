'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const runtime=read('frozen-map-runtime.js'),policy=read('frozen-map-view-policy.js'),
 game=read('frozen-map-game.js'),html=read('frozen-map-game.html');
const SCENE='v1-0374527a';
function fixture(opaqueDisplay){
 const window={},contexts=[],ops=[];
 vm.runInNewContext(policy,{window});
 const makeContext=(kind,attributes)=>{
  const alpha=attributes?.alpha!==false;
  const ctx={getContextAttributes:()=>({alpha}),
   setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
   lineTo(){},closePath(){},clip(){},rect(){},translate(){},scale(){},
   clearRect(){ops.push([kind,'clear'])},
   fillRect(){ops.push([kind,'fill'])},
   drawImage(source,...coords){ops.push([kind,'image',source?.id||'cache',coords.length])}};
  contexts.push({kind,alpha,attributes:attributes||null});
  return ctx;
 };
 const canvas={width:0,height:0,getContext:(type,opts)=>makeContext('display',opts),
  getBoundingClientRect:()=>({width:500,height:320})};
 const fogCanvas={width:0,height:0,hidden:true,
  getContext:(type,opts)=>makeContext('fog',opts)};
 const document={createElement:()=>({width:0,height:0,
  getContext:(type,opts)=>makeContext('offscreen',opts)})};
 const records=new Map();
 for(const id of ['0,0','1,0']){
  const x=Number(id.split(',')[0])*512,key=SCENE+'|near|'+id;
  records.set(key,{key,sceneKey:SCENE,level:'near',
   tile:{id,x,y:0,size:512},layers:[
    {layer:'ground',pad:3,png:{id:'ground:'+id,width:512,height:512}},
    {layer:'scenery',pad:128,png:{id:'scenery:'+id,width:768,height:768}}]});
 }
 const storage={keys:async()=>[...records.keys()],get:async k=>records.get(k)};
 window.VedrasCloudArtwork={create:()=>({
  setSeed(){},setAssets(){},stats:()=>({bases:4,version:1}),
  drawBase(g,v){g.fillRect(0,0,v.width,v.height)},
  drawUnready(g,view,cells,isReady,fade){
   for(const c of cells)fade(c,isReady(c));
  },drawTransitions(){}
 })};
 let now=0;
 vm.runInNewContext(runtime,{window,document,console,
  performance:{now:()=>++now},requestAnimationFrame:()=>{}});
 const player=window.VedrasFrozenMap.create({canvas,fogCanvas,
  opaqueDisplay,storage,overview1x:false,
  decode:async blob=>({...blob,close(){}})});
 const pose={zoom:.8,panX:0,panY:0,dpr:1.25,projectY:.85};
 return {player,contexts,ops,canvas,fogCanvas,async warm(){
  await player.load(SCENE,'near',pose,[{q:0,r:0,x:0,y:0,
   radius:160,visibility:'visible'}]);
  for(let i=0;i<8;i++){
   player.draw();await new Promise(resolve=>setImmediate(resolve));
  }
  assert.equal(player.report().decoded,2);
  assert.ok(player.report().overviewRasterBuilds>0);
 }};
}
test('opaque output is opt-in; only final display 2D context loses alpha',async()=>{
 const legacy=fixture(false),trial=fixture(true);
 await legacy.warm();await trial.warm();
 assert.equal(legacy.contexts[0].kind,'display');
 assert.equal(legacy.contexts[0].alpha,true);
 assert.equal(trial.contexts[0].kind,'display');
 assert.equal(trial.contexts[0].alpha,false);
 assert.equal(legacy.player.report().opaqueDisplayRequested,false);
 assert.equal(trial.player.report().opaqueDisplayRequested,true);
 assert.equal(legacy.player.report().displayContextAlpha,true);
 assert.equal(trial.player.report().displayContextAlpha,false);
 assert.ok(trial.contexts.some(x=>x.kind==='offscreen'),
  'the real cached panorama must still exist');
 assert.ok(trial.contexts.filter(x=>x.kind!=='display')
  .every(x=>x.alpha===true),
  'Fog/cloud/world buffers must NEVER lose transparency or authorization masks');
 legacy.player.stop();trial.player.stop();
});
test('opaque output preserves the same cached world and authorized Fog paint calls',async()=>{
 const legacy=fixture(false),trial=fixture(true);
 await legacy.warm();await trial.warm();
 for(const f of [legacy,trial]){f.player.setPose({panX:22,panY:-7});f.player.draw();}
 const projection=ops=>ops.map(([kind,action,source,n])=>[kind,action,
  source==='cache'?'cache':source,n]);
 assert.deepEqual(projection(legacy.ops),projection(trial.ops),
  'no scene, Fog, Cloud, raster or zoom sampling operations may differ');
 assert.equal(legacy.player.report().overviewRasterBuilds,
  trial.player.report().overviewRasterBuilds);
 assert.equal(legacy.player.report().fogUnreadySubmitted,
  trial.player.report().fogUnreadySubmitted);
 assert.equal(legacy.player.report().fogFrontierSubmitted,
  trial.player.report().fogFrontierSubmitted);
 legacy.player.stop();trial.player.stop();
});
test('display background is always initialized before the world and Fog',async()=>{
 const f=fixture(true);await f.warm();
 const display=f.ops.filter(x=>x[0]==='display');
 const bg=display.findIndex(x=>x[1]==='fill');
 const world=display.findIndex(x=>x[1]==='image');
 assert.ok(bg>=0&&world>bg,
  'opaque canvas must be covered by the original cloud background first');
 assert.ok(f.ops.some(x=>x[0]==='offscreen'&&x[1]==='image'));
 f.player.stop();
});
test('standalone A/B switch is read-only and default remains alpha:true',()=>{
 assert.match(game,/params\.get\('canvasOpaque'\)==='1'/);
 assert.match(runtime,/opaqueDisplay=false/);
 assert.match(runtime,/canvas\.getContext\('2d',\{alpha:!opaqueDisplay\}\)/);
 assert.match(runtime,/fogCanvas\?\.getContext\?\.\('2d',\{alpha:true\}\)/);
 assert.match(runtime,/buffer\.getContext\('2d',\{alpha:true\}\)/);
 assert.match(html,/frozen-map-runtime\.js\?v=20261109-step25n/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 for(const source of [runtime,game,policy])
  assert.doesNotThrow(()=>new Function(source));
});

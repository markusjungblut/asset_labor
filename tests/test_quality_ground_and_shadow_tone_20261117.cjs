'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function moduleOf(path,extra={}){
 const ctx={window:{},Blob,localStorage:{
  getItem:()=>null,setItem:()=>{throw Error('test should not persist')}
 },...extra};
 vm.runInNewContext(read(path),ctx,{filename:path});
 return ctx.window;
}
test('normal viewport remains 2x; verified original 4x mode is pixel-budget bounded',()=>{
 const v=moduleOf('frozen-map-view-policy.js').VedrasFrozenViewPolicy;
 assert.equal(v.displayDpr({zoom:1,width:1200,height:700}),2);
 assert.equal(v.displayDpr({zoom:1,width:1200,height:700,
  baseDpr:4,maxDpr:4,maxPixels:18000000,maxEdge:8192}),4);
 assert.ok(v.displayDpr({zoom:1,width:4800,height:2200,
  baseDpr:4,maxDpr:4,maxPixels:18000000,maxEdge:8192})<2);
});
test('original 4x ground replaces only the Ground layer in memory',async()=>{
 const api=moduleOf('frozen-map-ground-detail.js').VedrasFrozenGroundDetail;
 const makeBlob=text=>new Blob([text]);
 const makePng=(width,height)=>{
  const header=new Uint8Array(24);
  header.set([137,80,78,71,13,10,26,10]);
  const view=new DataView(header.buffer);view.setUint32(16,width);view.setUint32(20,height);
  return new Blob([header],{type:'image/png'});
 };
 const base={key:'v1-0374527a|near|0,0',revision:'r1',tile:{size:512},
  layers:[{layer:'ground',png:makePng(1040,884),pad:4},
   {layer:'scenery',png:makeBlob('2x-scenery'),crop:{x:2,y:2,fullWidth:20,fullHeight:20}}]};
 const raw={...base,layers:[{layer:'ground',png:makePng(2080,1768),pad:4},
  {layer:'scenery',png:makeBlob('4x-scenery')}]};
 const calls={original:0,standard:0,overview:0,writes:0};
 const store=api.createStore({
  standard:{async get(){calls.standard++;return base;},async keys(){return ['test'];}},
  original:{async get(){calls.original++;return raw;},
   async keys(){return [base.key];}},
  overview:{async getVariant(){calls.overview++;return {key:'overview'};}}
 });
 assert.equal((await store.get(base.key)).layers[0].png,base.layers[0].png);
 assert.equal(calls.original,0,'default does not touch original 4x PNGs');
 const probe=await store.probe('v1-0374527a','near');
 assert.equal(probe.available,true);
 assert.equal(probe.original4x,1);
 assert.equal(probe.minDensity,4);
 store.setEnabled(true);
 const mixed=await store.getVariant(base.key,'2x');
 assert.equal(mixed.layers[0].png,raw.layers[0].png);
 assert.equal(mixed.layers[1].png,base.layers[1].png);
 assert.equal(mixed.layers[1].crop,base.layers[1].crop);
 assert.equal(mixed.groundDetailSource,'original-4x');
 assert.equal((await store.getVariant(base.key,'1x')).key,'overview');
 assert.equal(calls.overview,1);
 assert.equal(calls.writes,0);
});
test('stale or misordered original ground cannot replace a valid derived tile',()=>{
 const api=moduleOf('frozen-map-ground-detail.js').VedrasFrozenGroundDetail;
 const a={key:'v1-11111111|near|0,0',revision:'a',layers:[
  {layer:'ground',png:new Blob(['2x'])},{layer:'scenery',png:new Blob(['shade'])}]};
 const b={...a,revision:'b',layers:[
  {layer:'ground',png:new Blob(['4x'])},{layer:'scenery',png:new Blob(['shade'])}]};
 assert.equal(api.merge(b,a),a);
 assert.equal(api.merge(null,a),a);
});
test('gutter bridge samples a source strip across shared device boundaries',()=>{
 const api=moduleOf('frozen-map-runtime.js').VedrasFrozenMap;
 const image={width:2072,height:1761},dpr=2,zoom=1,proj=.85,
  t={entry:{record:{tile:{size:512}}},left:40,right:552,
   top:70,bottom:70+512*.85};
 const right=api.groundSeamStrip(image,t,3,'right',dpr,zoom,proj);
 const bottom=api.groundSeamStrip(image,t,3,'bottom',dpr,zoom,proj);
 assert.ok(right&&bottom);
 assert.ok(Math.abs(right.x+right.w/2-t.right)<1e-9);
 assert.ok(Math.abs(bottom.y+bottom.h/2-t.bottom)<1e-9);
 assert.ok(right.sx>=0&&right.sx+right.sw<=image.width);
 assert.ok(bottom.sy>=0&&bottom.sy+bottom.sh<=image.height);
 assert.equal(api.groundSeamStrip(image,t,0,'right',dpr,zoom,proj),null);
 assert.match(read('frozen-map-runtime.js'),/sourceGutterSeamBridge&&/);
 assert.match(read('frozen-map-runtime.js'),/g\.globalCompositeOperation='copy'/);
 assert.match(read('frozen-map-game.js'),/params\.get\('groundSeam'\)!=='exclusive'/);
});
test('shadow tone defaults preserve historical color and relative alpha',()=>{
 const win=moduleOf('shadow-tone.js'),tone=win.VedrasShadowTone;
 assert.equal(tone.colorCss(),'rgb(32,49,49)');
 assert.equal(tone.opacity(.27),.27);
 assert.equal(tone.attenuation(.28),.28);
 assert.equal(tone.opacity(0),0);
 assert.equal(tone.revision(),0);
 tone.set({lift:1,balance:1},{persist:false});
 assert.equal(tone.colorCss(),'rgb(32,49,49)');
 assert.equal(tone.opacity(.27),.52);
 assert.equal(tone.attenuation(.28),1,
  '100% normalization must also equalize the family .28 multiplier');
 assert.equal(tone.opacity(0),0);
 assert.equal(tone.revision(),1);
 tone.set({lift:100,balance:-20},{persist:false});
 assert.equal(tone.get().lift,0);
 assert.equal(tone.get().balance,0);
});
test('tone affects mountain alpha and RGB while preserving origin geometry',()=>{
 const context={window:{},Blob,localStorage:{getItem:()=>null,setItem:()=>{}}};
 for(const source of ['shadow-tone.js','shadow-system.js'])
  vm.runInNewContext(read(source),context,{filename:source});
 const sh=context.window.VedrasShadows,tone=context.window.VedrasShadowTone;
 const shape=sh.mountainShape({x:100,y:100},120,{opacity:.20,angle:155});
 const x=shape.p1.x,y=shape.p1.y;
 const before=sh.mountainAlphaAt(x,y,shape,120,.8);
 tone.set({lift:.8,balance:1},{persist:false});
 const after=sh.mountainAlphaAt(x,y,shape,120,.8);
 assert.ok(after>before,'strength harmonization must lift a weak mountain shadow');
 assert.equal(shape.p1.x,shape.p1.x);
 assert.ok(sh.COLOR.r===32,'legacy fallback color remains unchanged');
 assert.equal(tone.colorRgb().r,32);
});
test('viewer switch and authoring tone are not writes to the frozen archive',()=>{
 const game=read('frozen-map-game.js'),html=read('frozen-map-game.html'),
  editor=read('index.html'),app=read('app.js');
 assert.match(game,/params\.get\('ground4x'\)==='1'/);
 assert.match(game,/groundDetailStore\.setEnabled\(groundDetailActive\)/);
 assert.match(game,/groundDetailStore\.probe\(scene,lod\)/);
 assert.doesNotMatch(game,/Number\(manifest\.pose\?\.dpr\)>=3/);
 assert.match(html,/id="optGround4x"/);
 assert.match(html,/frozen-map-ground-detail\.js\?v=/);
 assert.doesNotMatch(editor,/id="shadowToneLift"/);
 assert.match(editor,/id="shadowToneBalance"/);
 assert.match(app,/VedrasShadowTone\?\.get\?\.\(\)\|\|null/);
 assert.doesNotMatch(read('frozen-map-ground-detail.js'),
  /deleteDatabase\(|\.put\(|\.clear\(|'readwrite'/);
});

test('low-res native atlas is never misrepresented as genuine 4x',async()=>{
 const api=moduleOf('frozen-map-ground-detail.js').VedrasFrozenGroundDetail;
 const makePng=(w,h)=>{
  const hbuf=new Uint8Array(24);hbuf.set([137,80,78,71,13,10,26,10]);
  const dv=new DataView(hbuf.buffer);dv.setUint32(16,w);dv.setUint32(20,h);
  return new Blob([hbuf]);
 };
 const key='v1-0374527a|near|0,0';
 const raw={key,revision:'old',tile:{size:512},layers:[
  {layer:'ground',pad:3,png:makePng(1295,1101)}]};
 const original={async keys(){return[key];},async get(){return raw;}};
 const standard={async get(){return {...raw,derivedFormat:'2x-png-v1'};},
  async keys(){return[key];}};
 const overview={async getVariant(){return null;}};
 const store=api.createStore({standard,original,overview});
 const probe=await store.probe('v1-0374527a','near');
 assert.equal(probe.available,false);
 assert.equal(probe.original4x,0);
 assert.ok(probe.minDensity<3);
 store.setEnabled(true);
 const returned=await store.get(key);
 assert.notEqual(returned.groundDetailSource,'original-4x');
 assert.equal(store.stats().originalGrounds,0);
});
test('readiness is exact-LOD and non-provisional; authored blend hides hard per-hex preview',()=>{
 const runtime=read('world-tile-streamer.js'),editor=read('app.js');
 assert.match(runtime,/if\(!item\|\|item\.dirty\|\|item\.tileLod!==lod\|\|[\s\S]{0,100}item\.packet\.preview===true\|\|item\.packet\.complete===false\)return false/);
 assert.match(editor,/drawPreview:state\.edgeBlend\?null:drawFastTerrainPreview/);
 assert.match(editor,/if\(preview&&lod==='near'&&state\.edgeBlend\)return;/);
});

test('near source fidelity increases with editor quality and stays bounded',()=>{
 const p=moduleOf('render-quality-policy.js').VedrasRenderQuality;
 const args={lod:'near',previewDensity:1,terrainFactor:1};
 const q2=p.terrainSource({...args,quality:'2'});
 const q3=p.terrainSource({...args,quality:'3'});
 const q4=p.terrainSource({...args,quality:'4'});
 assert.ok(q2.resolution>1&&q2.resolution<q3.resolution);
 assert.ok(q3.resolution<q4.resolution);
 assert.ok(q4.maxPixels<=1500000);
 assert.equal(p.terrainSource({...args,lod:'far',quality:'4'}).resolution,1);
 assert.equal(p.terrainSource({...args,lod:'far',quality:'4'}).maxPixels,850000);
 const source=read('app.js');
 assert.match(source,/state\.quality\+'\|'\+previewDensity\(\)/);
 assert.match(source,/terrain-static-v3-quality-source/);
 assert.match(source,/resolution:terrainSource\.resolution,maxPixels:terrainSource\.maxPixels/);
 assert.match(source,/const terrainSource=window\.VedrasRenderQuality\.terrainSource/);
});

test('a provisional near tile remains hidden by fog until exact layers finish',()=>{
 const calls=[],context={
  setTransform(){},clearRect(){},save(){},restore(){},beginPath(){},
  moveTo(){},lineTo(){},closePath(){},clip(){},fillRect(){},
  fill(){calls.push('opaque-fog');},
  drawImage(image){calls.push(image.label);}
 };
 const env={window:{},performance:{now:()=>1000}};
 vm.runInNewContext(read('world-tile-streamer.js'),env);
 const renderer=env.window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>context},
  source:null,requireScenery:true
 });
 const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'};
 const view={width:1000,height:700,zoom:.6,dpr:1,panX:0,panY:0,projectY:.85};
 const packet=preview=>({complete:true,preview,sourceDensity:preview?.5:1.5,
  layers:[{layer:'ground',image:{width:64,height:64,label:'ground'}},
   {layer:'scenery',image:{width:64,height:64,label:'scenery'}}]});
 renderer.setFogCells([{q:0,r:0,x:256,y:256,radius:75,visibility:'visible'}]);
 assert.equal(renderer.seed(tile,'mid',packet(true)),true);
 renderer.request(view,[tile]);
 let result=renderer.render(view);
 assert.equal(result.provisional,1);
 assert.ok(calls.includes('opaque-fog'),
  'a complete-but-soft bitmap must not reveal the underlying hex');
 calls.length=0;
 assert.equal(renderer.seed(tile,'mid',packet(false)),true);
 result=renderer.render(view);
 assert.equal(result.exact,1);
 assert.ok(!calls.includes('opaque-fog'),
  'only the finished target LOD may lift the fog');
});

test('fourfold static Ground uses 1.25x fog and retains its base during dissolve',async()=>{
 const window={};
 const ctx={setTransform(){},clearRect(){},save(){},restore(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},
  fillRect(){},fill(){},drawImage(){}};
 const c={width:0,height:0,getContext:()=>ctx,
  getBoundingClientRect:()=>({width:600,height:400})},
  fog={width:0,height:0,getContext:()=>ctx,hidden:true};
 window.VedrasCloudArtwork={create:()=>({
  setSeed(){},setAssets(){},stats:()=>({bases:4,version:1}),
  drawBase(){},drawUnready(){},drawTransitions(){}
 })};
 vm.runInNewContext(read('frozen-map-view-policy.js'),{window});
 vm.runInNewContext(read('frozen-map-runtime.js'),{window,console,
  requestAnimationFrame(){},performance:{now:()=>1}});
 const player=window.VedrasFrozenMap.create({
  canvas:c,fogCanvas:fog,storage:{async keys(){return [];}},overview1x:false,
  fogDprCap:1.25,preferFogLayerAtHighDpr:true
 });
 await player.load('v1-0374527a','near',
  {zoom:1,panX:0,panY:0,dpr:4,projectY:.85},[]);
 player.draw();
 assert.equal(c.width,2400);
 assert.equal(fog.width,750);
 assert.equal(fog.height,500);
 assert.equal(fog.hidden,false);
 const first=player.report().baseFrames;
 for(let i=0;i<4;i++)player.draw();
 assert.equal(player.report().baseFrames,first);
 assert.equal(player.report().fogOnlyFrames,4);
 player.setPose({panX:20});player.draw();
 assert.equal(player.report().baseFrames,first+1);
 assert.equal(fog.hidden,false,
  '4x stationary redraw must already be clean before the next fog fade');
 player.draw();
 assert.equal(player.report().baseFrames,first+1,
  'no extra 18MP erase-and-repaint after camera move');
 player.setPose({dpr:1.25,panX:40});player.draw();
 assert.equal(c.width,750);
 assert.equal(fog.hidden,true,'moving quality mode stays on one canvas');
 player.setPose({dpr:4});player.draw();
 assert.equal(c.width,2400);
 assert.equal(fog.width,750);
 assert.equal(fog.hidden,false);
 player.stop();
});
test('fourfold camera gesture is a reversible 1.25x raster budget, not a PNG rewrite',()=>{
 const game=read('frozen-map-game.js'),runtime=read('frozen-map-runtime.js');
 assert.match(game,/groundDetailActive&&!drag\.moved&&\(p\.dpr\|\|1\)>1\.25/);
 assert.match(game,/pan\.dpr=1\.25;dragLowDprFrames\+\+/);
 assert.match(game,/if\(!drag\)setPose\(\{\}\); \/\/ restores bounded original 4x DPR/);
 assert.match(game,/fogDprCap:groundDetailRequested\?1\.25:Infinity/);
 assert.match(game,/groundDetailRequested&&params\.get\('fogLayer'\)!=='0'/);
 assert.match(runtime,/const overlayDpr=Math\.min\(dpr,cap\)/);
 assert.match(runtime,/dpr>=2\.25\|\|\(!!baseStamp&&cameraStill\)/);
 assert.doesNotMatch(game,/indexedDB\.deleteDatabase\(|\.clearPrefix\(|bakeWorldTile\(/);
});

test('4x Ground loads directly and never invokes the wasteful full 2x conversion',async()=>{
 const api=moduleOf('frozen-map-ground-detail.js').VedrasFrozenGroundDetail;
 function png(w,h){
  const p=new Uint8Array(24);p.set([137,80,78,71,13,10,26,10]);
  const data=new DataView(p.buffer);data.setUint32(16,w);data.setUint32(20,h);
  return new Blob([p]);
 }
 const key='v1-0374527a|near|0,0',raw={
  key,revision:'original-4x',tile:{size:512},
  layers:[{layer:'ground',pad:3,png:png(2072,1761)},
   {layer:'scenery',pad:128,png:png(3072,2608)}]
 };
 const scene2x=new Blob(['scenery2x']);
 let originalReads=0,sceneryMixed=0,fullConversions=0;
 const standard={
  async get(){fullConversions++;throw Error('Must not resample original ground');},
  async keys(){return [];},
  async getSceneryMixed(requested,record){
   assert.equal(requested,key);assert.equal(record,raw);sceneryMixed++;
   return {...record,layers:[record.layers[0],
    {...record.layers[1],png:scene2x}]};
  }
 };
 const original={async get(){originalReads++;return raw;},
  async keys(){return[key];}};
 const store=api.createStore({standard,original,
  overview:{async getVariant(){return null;}}});
 store.setEnabled(true);
 const combined=await store.get(key);
 assert.equal(originalReads,1);
 assert.equal(sceneryMixed,1);
 assert.equal(fullConversions,0);
 assert.equal(combined.layers[0].png,raw.layers[0].png);
 assert.equal(combined.layers[1].png,scene2x);
 assert.equal(combined.groundDetailSource,'original-4x');
 const derived=read('frozen-map-derived-2x.js');
 assert.match(derived,/async function getSceneryMixed\(key,original\)/);
 assert.match(derived,/complete\?\.derivedFormat==='2x-png-v1'/);
 assert.match(derived,/layers\.push\(\['scenery','structures'\]\.includes\(layer\.layer\)\?/);
 assert.match(derived,/derivedFormat:'scenery-only-2x-v1'/);
 assert.doesNotMatch(derived,/deleteDatabase\(/);
});

test('zoom-aware original 4x bitmap residency follows screen pixels, not archive DPR',async()=>{
 const window={},options=[];
 const layer=(width,height,opts)=>({width:opts?.resizeWidth||width,
  height:opts?.resizeHeight||height,close(){}});
 const view={width:2859,height:1382};
 const g={setTransform(){},clearRect(){},save(){},restore(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},
  fillRect(){},fill(){},drawImage(){}};
 const canvas={width:0,height:0,getContext:()=>g,
  getBoundingClientRect:()=>view};
 const scene='v1-0374527a',key=scene+'|near|0,0';
 const pngGround=new Blob(['ground']),pngScenery=new Blob(['scenery']);
 const source={key,sceneKey:scene,level:'near',revision:'exact',
  tile:{id:'0,0',x:0,y:0,size:512},
  groundDetailSource:'original-4x',
  groundSourcePixels:{width:2080,height:1768,density:4},
  layers:[{layer:'ground',pad:4,png:pngGround},
   {layer:'scenery',pad:128,png:pngScenery}]
 };
 const context={window,Blob,console,requestAnimationFrame(){},
  performance:{now:()=>1}};
 vm.runInNewContext(read('frozen-map-view-policy.js'),context);
 vm.runInNewContext(read('frozen-map-runtime.js'),context);
 const player=window.VedrasFrozenMap.create({
  canvas,storage:{async keys(){return [key];},
   async getVariant(){return source;}},
  decode:async(blob,opts)=>{
   if(blob===pngGround){
    options.push(opts||null);return layer(2080,1768,opts);
   }
   return layer(1200,1200,null);
  },
  adaptiveGroundDecode:true,maxDecodedPixels:128000000,
  overview1x:false,useLayerCache:false
 });
 await player.load(scene,'near',
  {zoom:.64,panX:0,panY:0,dpr:2.13,projectY:.85},[]);
 const settle=async()=>{for(let i=0;i<5;i++){
  player.draw();await new Promise(resolve=>setImmediate(resolve));
 }};
 await settle();
 assert.equal(player.report().groundTier,1.75);
 assert.equal(options[0].resizeWidth,910);
 assert.equal(options[0].resizeHeight,774);
 assert.ok(player.report().groundResizedPixelsSaved>2000000);
 player.setPose({zoom:.94});
 await settle();
 assert.equal(player.report().groundTier,2.5);
 assert.equal(options[1].resizeWidth,1300);
 player.setPose({zoom:1.83});
 await settle();
 assert.equal(player.report().groundTier,4);
 assert.equal(options[2],null,
  'near 4x on-screen sampling must use native PNG without resizing');
 assert.equal(player.report().groundTierSwitches,3,
  'initial density selection and two zoom upgrades use distinct tiers');
 player.stop();
});
test('adaptive original-ground decoder is opt-in and non-mutating',()=>{
 const runtime=read('frozen-map-runtime.js'),
  page=read('frozen-map-game.js'),html=read('frozen-map-game.html');
 assert.match(page,/params\.get\('groundDecode'\)!=='full'/);
 assert.match(page,/maxDecodedPixels:adaptiveGroundDecode\?128000000:95000000/);
 assert.match(html,/id="optAdaptiveGround"/);
 assert.match(runtime,/groundTierSwitches/);
 assert.match(runtime,/resizeWidth:Math\.max\(1,Math\.round\(p\.width\*scale\)\)/);
 assert.doesNotMatch(runtime,/deleteDatabase\(/);
});

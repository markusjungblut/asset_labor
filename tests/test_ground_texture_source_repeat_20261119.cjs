'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const window={};
vm.runInNewContext(read('water-texture.js'),{window,Uint8ClampedArray,Math});
const repair=window.VedrasWaterTexture.repairPixels;
function pixels(width,height,fill){
 const p=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4,red=fill(x,y);
  p[i]=red;p[i+1]=Math.floor(red*.85);p[i+2]=Math.floor(red*.4);p[i+3]=255;
 }
 return p;
}
function sample(p,w,x,y=24){
 const i=(y*w+x)*4;return [...p.slice(i,i+3)];
}
test('land repeat edges blend without touching source artwork or center',()=>{
 const w=128,h=128,raw=pixels(w,h,(x,y)=>x<64?35:195);
 const old=new Uint8ClampedArray(raw);
 const fixed=repair(raw,w,h,{centerStripe:false,edgeBand:32});
 assert.deepEqual([...raw],[...old],'original PNG texels remain unchanged');
 assert.deepEqual(sample(fixed,w,64),sample(raw,w,64),
  'land core is not blurred or stripped');
 const a=sample(fixed,w,0),b=sample(fixed,w,w-1);
 const before=Math.abs(sample(raw,w,0)[0]-sample(raw,w,w-1)[0]);
 assert.ok(before>=150);
 assert.ok(Math.abs(a[0]-b[0])<=1,
  'opposite land repeat edges meet at the same RGB');
 assert.ok(Math.abs(sample(fixed,w,15)[0]-sample(raw,w,15)[0])>0,
  'only the repeat-margin undergoes correction');
});
test('water keeps its narrow eight-texel wrap correction',()=>{
 const w=128,h=128,raw=pixels(w,h,x=>x<64?10:225);
 const water=repair(raw,w,h);
 const land=repair(raw,w,h,{centerStripe:false,edgeBand:32});
 assert.ok(Math.abs(sample(water,w,15)[0]-10)<2,
  'water artwork 15px in from the edge remains intact');
 assert.ok(Math.abs(sample(land,w,15)[0]-10)>2,
  'land has a wider gradual transition than water');
});
test('worker, on-screen editor and frozen atlas all use new derived ground sampling',()=>{
 const a=read('autotile.js'),w=read('terrain-worker.js'),
  client=read('terrain-worker-client.js'),app=read('app.js'),
  html=read('index.html');
 assert.match(a,/window\.VedrasWaterTexture\?\.repairPixels\?/);
 assert.match(a,/centerStripe:false,edgeBand:32/);
 assert.match(w,/20261119-ground-wrap-v1/);
 assert.match(client,/20261119-ground-wrap-v1/);
 assert.match(app,/game-map-export-renderer-v7-ground-wrap-v1/);
 assert.match(app,/terrain-static-v5-ground-wrap-v1/);
 assert.match(html,/autotile\.js\?v=20261119-ground-wrap-v1/);
});
test('equalization control has a direct shortcut without mutating the map',()=>{
 const ui=read('ui-organizer.js'),html=read('index.html');
 assert.match(ui,/balanceShortcut\.textContent='Schattenangleich'/);
 assert.match(ui,/balanceShortcut\.dataset\.focus='shadowToneControls'/);
 assert.match(ui,/if\(detail\)detail\.open=true/);
 assert.match(html,/id="shadowToneBalance"/);
});

test('hand-painted rock cast keeps manual art and gains the missing compact contact',()=>{
 const marks=[],window={
  addEventListener(){},
  VedrasManualShadows:{valid(){},render(){marks.push('manual');}},
  VedrasShadowTone:{opacity:v=>v,attenuation:v=>v,colorCss:()=> '#203131'}
 };
 vm.runInNewContext(read('sprite-shadow-editor.js'),{window,Math,console});
 const engine=window.VedrasSpriteShadows;
 const rock='assets/nature/boulder_05.png',shrub='assets/nature/bush_05.png';
 const manual={mode:'polygons',polygons:[[[-.4,-.1],[-.1,.1],[0,0]]]};
 engine.set({...engine.defaults(),profiles:{
  [rock]:{manual},[shrub]:{manual}
 }});
 const ctx={save(){},restore(){},beginPath(){},ellipse(){marks.push('contact');},
  fill(){},setTransform(){}};
 const draw=(asset,kind)=>engine.draw(ctx,{
  asset:{path:asset},type:'nature',natureMeta:{kind}
 },{x:100,y:100},52,{canvas:{},aspect:1},{x:.5,y:.95},1);
 draw(rock,'rock');
 assert.deepEqual(marks,['contact','manual']);
 marks.length=0;
 draw(shrub,'shrub');
 assert.deepEqual(marks,['manual'],'bush hand-art is preserved without rock contact');
});

test('changing hand-painted or mountain shadow invalidates only new immutable scene identity',()=>{
 const app=read('app.js'),
  start=app.indexOf('function frozenSceneKey({force4x=false}={}){'),
  end=app.indexOf('// Native 4x final-map IDs',start);
 assert.ok(start>0&&end>start);
 const profiles={global:{opacity:.4},profiles:{
  'assets/nature/boulder_05.png':{manual:{mode:'polygons',polygons:[[[-.2,-.1],[0,0],[.2,.1]]]}}
 }};
 const context={window:{
  VedrasShadowTone:{get:()=>({balance:.5})},
  VedrasSpriteShadows:{get:()=>profiles}
 },worldCells:[],state:{quality:'2',visualPolish:{},shadowGlobal:1,
  shadowAssetPresets:{},mountainShadowDefaults:{},forest:{},materialScales:{},
  natureInstances:[],mountainInstances:[],hexObject:{},hexShadow:{}},
 catalog:{assets:{},terrainTypes:[],categories:[]},assets:[],Math,JSON};
 vm.runInNewContext(app.slice(start,end)+'\nwindow.sceneFingerprint=frozenSceneKey;',context);
 const key=()=>context.window.sceneFingerprint({force4x:true});
 const before=key();
 profiles.profiles['assets/nature/boulder_05.png'].manual.polygons[0][0][0]=-.4;
 assert.notEqual(key(),before,'manual cast editing must create a fresh atlas');
 const after=key();
 context.state.mountainShadowDefaults={opacity:.15};
 assert.notEqual(key(),after,'mountain shadow controls also affect saved PNGs');
 const again=key();
 context.state.quality='3';
 assert.equal(key(),again,'editor preview quality does not change native-4x identity');
});

test('read-only forest tile and water tile keep distinct seamless cache policies',()=>{
 const source=pixels(128,128,x=>x<64?30:210);
 const image={naturalWidth:128,naturalHeight:128,pixels:source};
 const document={createElement(){
  const canvas={width:0,height:0};
  const g={
   drawImage(img){canvas.pixels=new Uint8ClampedArray(img.pixels);},
   getImageData(){return {data:new Uint8ClampedArray(canvas.pixels)};},
   putImageData(p){canvas.pixels=new Uint8ClampedArray(p.data);}
  };
  canvas.getContext=()=>g;return canvas;
 }};
 const w={};
 vm.runInNewContext(read('water-texture.js'),{window:w,document,Uint8ClampedArray,Math});
 const api=w.VedrasWaterTexture;
 const water=api.seamlessTile(image),
  forest=api.seamlessTile(image,{centerStripe:false,edgeBand:32});
 assert.notEqual(forest,water,'forest and water must not share an 8px texture');
 assert.strictEqual(api.seamlessTile(image),water);
 assert.strictEqual(api.seamlessTile(image,
  {centerStripe:false,edgeBand:32}),forest);
 assert.equal(source[0],30,'original source bytes are untouched');
 assert.ok(Math.abs(forest.pixels[15*4]-source[15*4])>2,
  'forest texture corrects nonseamless repeat boundaries');
 assert.ok(Math.abs(water.pixels[15*4]-source[15*4])<2,
  'existing water seam settings must not change');
 const forestCode=read('forest-ground.js');
 assert.match(forestCode,/VedrasWaterTexture\?\.seamlessTile\?\.\(image,/);
 assert.match(forestCode,/centerStripe:false,edgeBand:32/);
 assert.match(forestCode,/g\.createPattern\(repeated,'repeat'\)/);
 assert.doesNotMatch(forestCode,/g\.createPattern\(image,'repeat'\)/);
});
test('new 4x manifests retain exclusive pixel-perfect core mapping; old ones remain optional inset',async()=>{
 const env={window:{},Blob,requestAnimationFrame(){},performance:{now:()=>0}};
 vm.runInNewContext(read('frozen-map-runtime.js'),env);
 const api=env.window.VedrasFrozenMap,store=api.memoryStore();
 const player=api.create({canvas:{getContext:()=>({})},storage:store,
  sourceEdgeInset:true});
 const scene='v1-fedcba98',cells=[{q:0,r:0,x:0,y:0,radius:100}];
 await player.saveManifest(scene,{cells,levels:['near'],
  groundSeamPolicy:'exclusive'});
 assert.equal((await player.loadManifest(scene)).groundSeamPolicy,'exclusive');
 assert.equal(player.report().sourceEdgeInset,true);
 assert.equal(player.setSourceEdgeInset(false),true);
 assert.equal(player.report().sourceEdgeInset,false);
 assert.equal(player.setSourceEdgeInset(false),false);
 const legacy='v1-00000001';
 await player.saveManifest(legacy,{cells,levels:['near']});
 assert.equal((await player.loadManifest(legacy)).groundSeamPolicy,null);
 const editor=read('app.js'),game=read('frozen-map-game.js');
 assert.match(editor,/groundSeamPolicy:'exclusive'/);
 assert.match(editor,/groundSeamPolicy:sourceManifest\.groundSeamPolicy/);
 assert.match(game,/!params\.has\('groundSeam'\)&&manifest\.groundSeamPolicy==='exclusive'/);
 assert.match(game,/player\.setSourceEdgeInset\(false\)/);
 assert.match(editor,/forest-floor-wrap-v1/);
});

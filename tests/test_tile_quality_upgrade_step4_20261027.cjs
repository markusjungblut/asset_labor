'use strict';
/* Step-4 follow-up: a low-density snapshot must never be considered a sharp tile.
 * Run: node --test tests/test_tile_quality_upgrade_step4_20261027.cjs
 */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const flush=async()=>{for(let i=0;i<18;i++)await Promise.resolve();};
function packet(label='sharp',preview=false,density=null){
 return {complete:true,preview,sourceDensity:density,layers:[
  {layer:'ground',image:{width:64,height:64,name:label+'-ground'}},
  {layer:'scenery',image:{width:64,height:64,name:label+'-scenery'}}]};
}
function world(source,options={}){
 const draws=[],ctx={setTransform(){},clearRect(){},save(){},
  restore(){},beginPath(){},rect(){},clip(){},fillRect(){},
  drawImage:(image)=>draws.push(image.name)};
 const sandbox={window:{},performance:{now:()=>1000}};
 vm.runInNewContext(read('world-tile-streamer.js'),sandbox);
 const tile={id:'0,0',x:0,y:0,size:512,visibility:'visible'},
  view={width:700,height:500,zoom:1,dpr:1,panX:0,panY:0};
 const renderer=sandbox.window.VedrasWorldTiles.create({
  canvas:{getContext:()=>ctx},source,requireScenery:true,
  maxAttempts:options.maxAttempts||5});
 return {renderer,view,tile,draws,request:()=>renderer.request(view,[tile]),
  tileState:()=>renderer.diagnostics().tiles[0]};
}
function sourceFunctions(){
 const s=read('app.js'),start=s.indexOf('function worldTileSnapshotDensity('),
  end=s.indexOf('function seedReadyWorldTiles()',start);
 assert.ok(start>=0&&end>start);
 return vm.runInNewContext(s.slice(start,end)+
  ';({worldTileSnapshotDensity,worldTileSnapshotsSharp});');
}
test('a low-density snapshot is not considered a full-resolution near tile',()=>{
 const f=sourceFunctions(),low={zoom:.6,dpr:1.25},high={zoom:1.4,dpr:2};
 assert.equal(f.worldTileSnapshotDensity(low),.75);
 assert.equal(f.worldTileSnapshotsSharp(low,low,'near'),false);
 assert.equal(f.worldTileSnapshotsSharp(high,high,'near'),true);
 assert.equal(f.worldTileSnapshotsSharp(low,low,'mid'),false);
 assert.equal(f.worldTileSnapshotsSharp(low,low,'far'),false);
});
test('snapshotTile never enlarges the provisional source past native pixel density',()=>{
 const s=read('app.js'),start=s.indexOf('function snapshotTile('),
  end=s.indexOf('async function bakeWorldTile(',start);
 const f=vm.runInNewContext(s.slice(start,end)+';snapshotTile;',
  {worldTileSnapshotDensity:p=>p.zoom*p.dpr,PROJECT_Y:.85,
   document:{createElement:()=>({width:0,height:0,
    getContext:()=>({drawImage(){}})})}});
 const base={canvas:{width:2000,height:2000},width:1000,height:1000,
  panX:0,panY:0,pad:200,zoom:.5,dpr:1.5};
 const tile={x:0,y:0,size:512};
 const near=f(base,tile,'near');
 assert.ok(near);
 assert.equal(near.width,384,'512 world units at .75 px/unit');
 assert.ok(near.width<512*2.5);
 const original=f({...base,canvas:{width:5000,height:5000},zoom:2,dpr:1.5},tile,'near');
 assert.ok(original);
 assert.equal(original.width,1280,'adequately dense source keeps full near output');
});
test('seedReadyWorldTiles records provisional quality rather than false ready',()=>{
 const app=read('app.js'),start=app.indexOf('function worldTileSnapshotDensity('),
  end=app.indexOf('function snapshotTile(',start);
 let inputZoom=.55,seeds=[];
 const tile={id:'0,0',x:0,y:0,size:512};
 const snapshot=()=>({canvas:{width:800},zoom:inputZoom,dpr:1.5});
 const ctx={worldTiles:{chooseLod:()=> 'near',seed:(t,l,p)=>seeds.push(p)},
  state:{mode:'normal',zoom:1.2},finalRendering:false,
  backgroundScene:{snapshot},staticScenery:{snapshot},
  streamingViewBounds:()=>({}),worldCells:[{q:0,r:0}],
  window:{VedrasChunks:{visible:()=>[tile]}},
  objectLayoutCache:{query:()=>({objects:[]})},
  buildSpriteLayout(){},spriteInViewport(){},spriteIndexMargin:0,
  tileArtworkReady:()=>true,snapshotTile:()=>({width:32,height:32}),
  WORLD_TILE_GUTTER:3};
 const f=vm.runInNewContext(app.slice(start,end)+';seedReadyWorldTiles;',ctx);
 f();assert.equal(seeds.length,1);
 assert.equal(seeds[0].preview,true);
 assert.ok(seeds[0].sourceDensity<1);
 inputZoom=2;
 f();assert.equal(seeds[1].preview,false);
 assert.ok(seeds[1].sourceDensity>=2.5);
});
test('visible preview is queued for upgrade instead of treated as finished',async()=>{
 let finish,calls=0;
 const h=world(()=>{calls++;return new Promise(resolve=>finish=resolve)});
 assert.equal(h.renderer.seed(h.tile,'mid',packet('preview',true,.6)),true);
 h.request();await flush();
 assert.equal(calls,1);
 assert.equal(h.tileState().state,'upgrading');
 assert.equal(h.tileState().preview,true);
 h.renderer.render(h.view);
 assert.equal(h.renderer.stats().visiblePreviews,1);
 assert.ok(h.draws.includes('preview-ground'));
 finish(packet('sharp'));
 await flush();
 assert.equal(h.tileState().state,'ready');
 assert.equal(h.tileState().preview,false);
 h.draws.length=0;
 h.renderer.render(h.view);
 assert.equal(h.renderer.stats().visiblePreviews,0);
 assert.ok(h.draws.includes('sharp-ground'));
 assert.equal(h.renderer.stats().upgraded,1);
 h.request();await flush();
 assert.equal(calls,1,'the upgraded tile is never re-requested on warm pan');
});
test('a late low-resolution seed cannot overwrite a sharp completed tile',async()=>{
 const h=world(()=>packet('rendered'));
 h.request();await flush();
 assert.equal(h.tileState().state,'ready');
 assert.equal(h.renderer.seed(h.tile,'mid',packet('late-preview',true,.5)),false);
 h.draws.length=0;
 h.renderer.render(h.view);
 assert.ok(h.draws.includes('rendered-ground'));
 assert.ok(!h.draws.includes('late-preview-ground'));
});
test('an exhausted upgrade can restart when authoritative terrain finishes',async()=>{
 let ready=false,calls=0;
 const h=world(()=>{calls++;return ready?packet('sharp'):null},
  {maxAttempts:1});
 h.renderer.seed(h.tile,'mid',packet('preview',true,.5));
 h.request();await flush();
 assert.equal(h.tileState().state,'preview-upgrade-failed');
 assert.equal(h.tileState().terminal,true);
 assert.equal(h.renderer.stats().tiles,1,'preview remains visually available');
 ready=true;
 assert.equal(h.renderer.terrainReady('0,0'),1);
 await flush();
 assert.equal(h.tileState().state,'ready');
 assert.equal(calls,2);
});
test('source-bake never accepts a blurry snapshot as a finished near tile',()=>{
 const s=read('app.js');
 const bake=s.slice(s.indexOf('async function bakeWorldTile('),
  s.indexOf('\nlet fastInteracting=',s.indexOf('async function bakeWorldTile(')));
 assert.match(bake,/const reuseSnapshot=snapshotReady&&\s*worldTileSnapshotsSharp\(ground,scenery,level\)/);
 assert.match(bake,/drawGround\(\);drawRoads\(\)/,
  'a blurry source must fall through to the direct sharp renderer');
 const s2=s.slice(s.indexOf('function seedReadyWorldTiles()'),
  s.indexOf('function snapshotTile('));
 assert.match(s2,/preview=!worldTileSnapshotsSharp\(ground,scenery,lod\)/);
});

test('sharp and provisional neighboring tiles converge without rebaking sharp neighbor',async()=>{
 const calls=[],g={setTransform(){},clearRect(){},save(){},restore(){},
  beginPath(){},rect(){},clip(){},fillRect(){},drawImage(){}};
 const sandbox={window:{},performance:{now:()=>1000}};
 vm.runInNewContext(read('world-tile-streamer.js'),sandbox);
 const renderer=sandbox.window.VedrasWorldTiles.create({
  canvas:{getContext:()=>g},requireScenery:true,
  source:(t,l)=>{calls.push(t.id);return packet('fresh');}});
 const a={id:'0,0',x:0,y:0,size:512,visibility:'visible'},
  b={id:'1,0',x:512,y:0,size:512,visibility:'visible'},
  view={width:1000,height:600,dpr:1,zoom:1,panX:0,panY:0};
 renderer.seed(a,'mid',packet('old-low',true,.6));
 renderer.seed(b,'mid',packet('already-sharp'));
 renderer.request(view,[a,b]);await flush();
 assert.equal(calls.length,1);
 assert.equal(calls[0],'0,0','only the soft tile should be rebuilt');
 const states=renderer.diagnostics().tiles;
 assert.ok(states.every(x=>x.state==='ready'));
 assert.equal(renderer.stats().upgraded,1);
 renderer.request({...view,panX:-20},[a,b]);await flush();
 assert.equal(calls.length,1,'a warm pan must not rebuild either sharp tile');
});

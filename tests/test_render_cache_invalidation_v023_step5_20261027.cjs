'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const flush=async()=>{for(let n=0;n<25;n++)await Promise.resolve();};
const packet=name=>({complete:true,layers:[
 {layer:'ground',image:{width:70,height:70,name:name+'-ground'}},
 {layer:'scenery',image:{width:70,height:70,name:name+'-scenery'}}]});
function world(source){
 const draws=[],g={setTransform(){},clearRect(){},save(){},restore(){},
  beginPath(){},rect(){},clip(){},fillRect(){},drawImage:a=>draws.push(a.name)};
 const sb={window:{},performance:{now:()=>1000}};
 vm.runInNewContext(read('world-tile-streamer.js'),sb);
 const view={width:1600,height:700,zoom:1,dpr:1,panX:0,panY:0},
  a={id:'0,0',x:0,y:0,size:512,visibility:'visible'},
  b={id:'1,0',x:512,y:0,size:512,visibility:'visible'};
 const stream=sb.window.VedrasWorldTiles.create({canvas:{getContext:()=>g},
  requireScenery:true,source:source||(()=>packet('fresh'))});
 return {stream,view,a,b,draws};
}
test('one dirty tile leaves unrelated cached world artwork intact',()=>{
 const h=world();h.stream.seed(h.a,'mid',packet('a'));
 h.stream.seed(h.b,'mid',packet('b'));
 const before=h.stream.stats().pixels;
 assert.equal(h.stream.invalidateTiles(['0,0']),1);
 assert.equal(h.stream.stats().tiles,1);
 assert.ok(h.stream.stats().pixels<before);
 h.stream.render(h.view,{tiles:[h.a,h.b]});
 assert.ok(h.draws.includes('b-ground'));
 assert.ok(!h.draws.includes('a-ground'));
 assert.equal(h.stream.stats().selectiveTiles,1);
});
test('targeted invalidation removes all LOD variants but preserves neighbors',()=>{
 const h=world();h.stream.seed(h.a,'far',packet('far'));
 h.stream.seed(h.a,'mid',packet('mid'));h.stream.seed(h.b,'mid',packet('b'));
 assert.equal(h.stream.invalidateTiles(['0,0']),2);
 assert.equal(h.stream.stats().tiles,1);
 assert.equal(h.stream.stats().pixels,9800);
});
test('stale in-flight source output is fenced and cannot resurface',async()=>{
 let resolveA,calls=0;
 const h=world(t=>t.id==='0,0'?(calls++,new Promise(r=>resolveA=r)):
  packet('b'));
 h.stream.request(h.view,[h.a]);await flush();
 assert.equal(calls,1);
 assert.equal(h.stream.stats().inFlight,1);
 h.stream.invalidateTiles(['0,0']);
 assert.equal(h.stream.stats().inFlight,0);
 resolveA(packet('late'));await flush();
 assert.equal(h.stream.stats().tiles,0);
 h.stream.request(h.view,[h.b]);await flush();
 assert.equal(h.stream.stats().tiles,1);
});
test('new snapshot seeding never downgrades an existing ready tile',()=>{
 const h=world();h.stream.seed(h.a,'mid',packet('original'));
 assert.equal(h.stream.seed(h.a,'mid',packet('outdated')),false);
 h.stream.render(h.view,{tiles:[h.a]});
 assert.ok(h.draws.includes('original-ground'));
 assert.ok(!h.draws.includes('outdated-ground'));
});
test('empty and unknown footprints do not drop retained tiles',()=>{
 const h=world();h.stream.seed(h.a,'mid',packet('a'));
 assert.equal(h.stream.invalidateTiles([]),0);
 assert.equal(h.stream.invalidateTiles(['','7,9']),0);
 assert.equal(h.stream.stats().tiles,1);
});
test('snapshot invalidation key uses scene content, not camera pose',()=>{
 const app=read('app.js'),start=app.indexOf(
  '// Camera pose and overscan do not change the underlying tile artwork.');
 assert.ok(start>0);
 const part=app.slice(start,app.indexOf(" const ready=$('fastCameraStats');",start));
 assert.match(part,/const key=\[base\?\.signature,scenery\?\.signature/);
 assert.doesNotMatch(part,/base\?\.panX|scenery\?\.panY|base\?\.zoom/);
 assert.match(part,/if\(!worldTileSelectiveSnapshot\)worldTiles\.invalidate\(\)/);
});
test('save-only and ground-only edits preserve independent scenery cache',()=>{
 const app=read('app.js'),start=app.indexOf('function persistScene('),
  end=app.indexOf('function restoreScene(',start);
 let scenery=0,background=0,frame=0;
 const sb={invalidateSpriteLayout(){scenery++},
  frameMemo:{invalidate(){frame++}},backgroundScene:{clear(){background++}},
  worldCells:[],assets:[],state:{roadEdges:[]},
  savedFields:[],localStorage:{setItem(){}},JSON};
 const fn=vm.runInNewContext(app.slice(start,end)+';persistScene;',sb);
 fn(false);assert.equal(scenery,0);assert.equal(background,0);
 fn('ground');assert.equal(scenery,0);assert.equal(background,1);
 fn();assert.equal(scenery,1);assert.equal(background,2);
 assert.equal(frame,2);
});
test('sprite image completion targets expanded local anchor footprints',()=>{
 const app=read('app.js'),start=app.indexOf('function worldTilesNearPoint('),
  end=app.indexOf('function invalidateSpriteLayout(',start);
 let count=0;
 const sb={worldCells:[{}],state:{
  natureInstances:[{q:0,r:0,assetPath:'tree.png'},
   {q:10,r:10,assetPath:'other.png'}],
  mountainInstances:[],hexObject:{}},
  axialPos:(q,r)=>({x:q*900,y:r*900}),
  window:{VedrasChunks:{visible:bounds=>{
   count++;
   return [{id:'0,0',x:0,y:0},{id:'9,9',x:9000,y:9000}]
    .filter(t=>t.x>=bounds.x&&t.x<=bounds.x+bounds.width&&
     t.y>=bounds.y&&t.y<=bounds.y+bounds.height);
  }}},Number,Set};
 const f=vm.runInNewContext(app.slice(start,end)+
  ';({worldTilesNearPoint,worldTilesForAssetPaths});',sb);
 const ids=f.worldTilesForAssetPaths(new Set(['tree.png']));
 assert.equal(ids.has('0,0'),true);assert.equal(ids.has('9,9'),false);
 assert.equal(count,1);
});
test('road chunk family remains stable while local stamps track changed edges',()=>{
 const app=read('app.js'),start=app.indexOf('const signature=JSON.stringify([state.relief,'),
  end=app.indexOf('roadChunks.configure(signature,',start);
 assert.ok(start>0&&end>start);
 const run=roadEdges=>vm.runInNewContext(app.slice(start,end)+
  ';({signature,roadStamp});',{
   state:{relief:{enabled:false},mountainInstances:[],hexObject:{}},
   level:{id:'mid'},density:1.5,
   roadEdges,window:{VedrasChunks:{HALO:128}},
   roadInView:(e,b)=>e.x>=b.x&&e.x<=b.x+b.width
  });
 const a=run([{x:10}]),b=run([{x:10},{x:1600}]);
 assert.equal(a.signature,b.signature);
 assert.equal(a.roadStamp({x:0,y:0,size:512}),
  b.roadStamp({x:0,y:0,size:512}));
 assert.notEqual(a.roadStamp({x:1536,y:0,size:512}),
  b.roadStamp({x:1536,y:0,size:512}));
});
test('coastline-safe material edits and shoreline options preserve selective scopes',()=>{
 const s=read('app.js');
 assert.match(s,/function invalidateTerrain\(scope='all',dirtyWorldTiles=null\)/);
 assert.match(s,/previousWater===wetHex\(c\)/);
 assert.match(s,/worldTilesNearPoint\(pos\.x,pos\.y,1280\)/);
 assert.match(s,/deferSceneRender\('shoreline',\(\)=>\{\},170,'ground'\)/);
 assert.match(s,/persistScene\('ground'\)/);
});

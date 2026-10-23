'use strict';
/* Run: node --test tests/test_adaptive_lod_v018_20261024.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
function module(){
 const sandbox={window:{}};
 vm.runInNewContext(read('adaptive-lod.js'),sandbox);
 return sandbox.window.VedrasAdaptiveLOD;
}
test('three tiers preserve deterministic zoom thresholds',()=>{
 const levels=module();
 assert.deepEqual(Array.from(levels.order),['far','mid','near']);
 const far=levels.create().update(.25);
 const mid=levels.create().update(.70);
 const near=levels.create().update(1.3);
 assert.equal(far.id,'far');assert.equal(mid.id,'mid');assert.equal(near.id,'near');
 assert.ok(far.terrain<mid.terrain&&mid.terrain<near.terrain);
 assert.ok(far.shore<mid.shore&&mid.shore<=near.shore);
 assert.ok(far.road<mid.road&&mid.road<near.road);
 assert.equal(far.roadDetail,false);
 assert.equal(mid.roadDetail,true);
});
test('lower boundary hysteresis prevents thrashing around the 169-hex zoom',()=>{
 const c=module().create();
 assert.equal(c.update(.3).id,'far');
 assert.equal(c.update(.51).id,'far');
 assert.equal(c.update(.54).id,'far');
 assert.equal(c.update(.55).id,'mid');
 assert.equal(c.update(.50).id,'mid');
 assert.equal(c.update(.48).id,'mid');
 assert.equal(c.update(.47).id,'far');
});
test('169-hex recommended zoom selects far LOD after a medium-range view',()=>{
 const c=module().create();
 assert.equal(c.update(.8).id,'mid');
 assert.equal(c.update(3.1/7).id,'far');
 assert.equal(module().create().update(3.1/7).id,'far');
});
test('upper boundary hysteresis stabilizes 92-106 percent zoom',()=>{
 const c=module().create();
 assert.equal(c.update(.7).id,'mid');
 assert.equal(c.update(1.05).id,'mid');
 assert.equal(c.update(1.06).id,'near');
 assert.equal(c.update(.95).id,'near');
 assert.equal(c.update(.92).id,'mid');
});
test('one massive wheel zoom jump skips intermediate tiers',()=>{
 const c=module().create();
 assert.equal(c.update(.25).id,'far');
 assert.equal(c.update(1.7).id,'near');
 assert.equal(c.update(.27).id,'far');
});
test('final export temporarily forces full detail but does not mutate interactive tier',()=>{
 const c=module().create();
 assert.equal(c.update(.3).id,'far');
 const full=c.update(.3,{final:true});
 assert.equal(full.id,'full');
 for(const key of ['terrain','shore','bank','river','road','forest'])assert.equal(full[key],1);
 assert.equal(full.roadDetail,true);
 assert.equal(c.update(.32).id,'far');
});
test('disabled adaptive preview uses high detail without disturbing the saved tier',()=>{
 const c=module().create();
 assert.equal(c.update(.26).id,'far');
 assert.equal(c.update(.26,{enabled:false}).id,'full');
 assert.equal(c.update(.3).id,'far');
});
test('LOD state changes only on tier transitions',()=>{
 const c=module().create();
 for(const z of [.60,.64,.68,.72,.75])c.update(z);
 assert.equal(c.stats().changes,1);
 c.update(.37);assert.equal(c.stats().changes,2);
 c.update(.42);assert.equal(c.stats().changes,2);
});
test('invalid zoom cannot pollute hysteresis state',()=>{
 const c=module().create();
 assert.throws(()=>c.update(NaN),/finite/);
 assert.equal(c.update(.64).id,'mid');
});
test('LOD controls every terrain raster path and keeps async tile sampling captured',()=>{
 const app=read('app.js');
 assert.match(app,/adaptiveLOD\.update\(zoom/);
 assert.match(app,/const terrainFactor=lodProfile\(\)\.terrain/);
 assert.match(app,/resolution:terrainFactor\*previewDensity\(\)/);
 assert.match(app,/terrainRasterCache\.density=previewDensity\(\)\*lodProfile\(\)\.terrain/);
 assert.match(app,/resolution=finalRendering\?1\.4/);
 assert.match(app,/lodProfile\(\)\.forest/);
});
test('river sampling, coast and road LOD remain separate from river/road geometry',()=>{
 const app=read('app.js'),river=read('river.js');
 assert.match(app,/shorelineChunks\.configure\(signature\+'\|density='\+shoreDensity/);
 assert.match(app,/resolution:shoreDensity,mouthPortals/);
 assert.match(app,/const bankDensity=previewDensity\(\)\*lodProfile\(\)\.bank/);
 assert.match(app,/resolution:bankDensity/);
 assert.match(app,/detailScale:finalRendering\?1:lodProfile\(\)\.river/);
 assert.match(app,/const riverRasterKey=signature\+'\|density='\+lodProfile\(\)\.river/);
 assert.match(app,/const level=lodProfile\(\),density=level\.road\*previewDensity\(\)/);
 assert.match(app,/detail:level\.roadDetail/);
 assert.match(river,/const scale=Math\.min\(1\.55\*detailScale,2500\/Math\.max\(dw,dh\)\)/);
 assert.match(river,/const segments=sections\(route,cells,isWet\),width=/);
});
test('LOD switch and saved preferences do not invalidate unrelated sprite placement',()=>{
 const app=read('app.js'),html=read('index.html');
 assert.match(app,/adaptiveLod:true/);
 assert.match(app,/'gpuSprites','adaptiveLod','materialScales'/);
 assert.match(app,/state\.adaptiveLod=state\.adaptiveLod!==false/);
 assert.match(app,/\$\('adaptiveLod'\)\.addEventListener\('change',e=>\{/);
 assert.match(app,/backgroundScene\.clear\(\);\s*persistScene\(false\);\s*requestDraw\(\);/);
 assert.match(html,/id="adaptiveLod" checked/);
 assert.match(html,/id="lodPerfStats"/);
});
test('LOD transitions keep old terrain/shore/river raster variants until replacement',()=>{
 const chunks=read('chunks.js'),app=read('app.js');
 assert.match(chunks,/retired\.set\(signature,cache\)/);
 assert.match(chunks,/const fallback=!result\?\[\.\.\.retired\.values\(\)\]/);
 assert.match(app,/redraw:requestDraw,family:signature/); // shores or river banks
 assert.match(app,/redraw:requestDraw,family:roadFamily/);
 assert.match(app,/drawRaster:\(g,r,t\)=>\{/);
});
test('real river SDF uses fewer pixels without moving the mouth or changing footprint',()=>{
 const canvasContext=()=>({
  createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
  putImageData(){},save(){},restore(){},setTransform(){},
  createPattern:()=>null,fillRect(){},drawImage(){},
  set globalCompositeOperation(v){},set fillStyle(v){}
 });
 const sandbox={
  window:{},
  document:{createElement(type){
   assert.equal(type,'canvas');
   const c={width:0,height:0};
   c.getContext=()=>canvasContext();
   return c;
  }}
 };
 vm.runInNewContext(read('river.js'),sandbox);
 const rivers=sandbox.window.VedrasRivers;
 const cells=[{q:0,r:0},{q:1,r:0}],route={hexes:[[0,0],[1,0]]};
 const wet=c=>c.q===1;
 assert.ok(rivers.valid(route,cells,wet));
 const full=rivers.render(canvasContext(),route,cells,wet,null,{width:32,detailScale:1});
 const far=rivers.render(canvasContext(),route,cells,wet,null,{width:32,detailScale:.72});
 assert.equal(far.x,full.x);assert.equal(far.y,full.y);
 assert.equal(far.widthWorld,full.widthWorld);assert.equal(far.heightWorld,full.heightWorld);
 assert.ok(far.canvas.width<full.canvas.width);
 assert.ok(far.canvas.height<full.canvas.height);
 assert.ok(far.canvas.width*far.canvas.height<full.canvas.width*full.canvas.height*.55);
});
test('PNG export and legacy pipeline remain available at full precision',()=>{
 const app=read('app.js'),html=read('index.html'),server=read('server.py');
 assert.match(app,/enabled:state\.adaptiveLod!==false,final:finalRendering/);
 assert.match(app,/const interactiveBackground=finalRendering/);
 assert.match(app,/const direct=blockers\.length>0/);
 assert.match(app,/canvas\.toBlob\(/);
 assert.match(html,/adaptive-lod\.js\?v=0\.1\.0/);
 assert.ok(html.indexOf('adaptive-lod.js')<html.indexOf('app.js'));
 assert.match(html,/Asset-Labor v0\.18\.0/);
 assert.match(server,/VERSION = '0\.18\.0'/);
 assert.match(server,/key = parsed\.path\[len\(prefix\):\]/);
 assert.doesNotMatch(server,/\.removeprefix\(/);
});

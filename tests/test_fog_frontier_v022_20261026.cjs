'use strict';
/* node --test tests/test_fog_frontier_v022_20261026.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function setup(){
 const log=[],paths=[],g={
  save(){log.push('save')},restore(){log.push('restore')},
  setTransform(){},clearRect(){},fillRect(x,y,w,h){log.push(['fill',x,y,w,h])},
  translate(){},scale(){},beginPath(){paths.push([])},
  moveTo(x,y){paths[paths.length-1].push([x,y])},
  lineTo(x,y){paths[paths.length-1].push([x,y])},
  closePath(){},clip(){log.push('clip')},
  drawImage(image){log.push('image:'+image.name)},
  createRadialGradient(){return {addColorStop(){}}}
 };
 const canvas={width:0,height:0,getContext:()=>g};
 const env={window:{},performance:{now:()=>10000}};
 vm.runInNewContext(file('fog-atmosphere.js'),env);
 vm.runInNewContext(file('world-tile-streamer.js'),env);
 const w=env.window.VedrasWorldTiles.create({canvas,onReady:()=>{}});
 const view={width:800,height:600,zoom:1,dpr:1,panX:0,panY:0,projectY:.85};
 const tile={id:'0,0',x:-256,y:-256,size:512,visibility:'visible'};
 return {w,g,log,paths,view,tile};
}
test('unknown outside a map has an opaque fullscreen cloud fill but no fullscreen ellipses',()=>{
 const h=setup();h.w.render(h.view,{fog:[]});
 assert.ok(h.log.some(v=>Array.isArray(v)&&v[0]==='fill'&&
  v[1]===0&&v[2]===0&&v[3]===800&&v[4]===600));
 assert.ok(!h.g.ellipse,'original viewport-sized circles must be removed');
});
test('ground has exact footprint, scenery a separate 45-unit overhang',()=>{
 const h=setup(),R=256/Math.sqrt(3);
 h.w.seed(h.tile,'mid',{layers:[
  {layer:'ground',image:{width:96,height:96,name:'grass'}},
  {layer:'scenery',image:{width:96,height:96,name:'tree'}}]});
 h.w.setFogCells([{x:0,y:0,radius:R,visibility:'visible'},
  {x:260,y:0,radius:R,visibility:'unknown'}]);
 h.w.request(h.view,[h.tile]);h.w.render(h.view);
 const clipIndex=h.log.map((v,i)=>v==='clip'?i:-1).filter(i=>i>=0);
 assert.equal(clipIndex.length,2,
  'ground and scenery have independent known-world clips');
 const radii=h.paths.filter(p=>p.length>=6).map(p=>
  Math.max(...p.map(([x,y])=>Math.abs(x-400))));
 assert.ok(radii.some(r=>r<R*Math.sqrt(3)/2+2),'ground clip retains exact hex size');
 assert.ok(radii.some(r=>r>R*Math.sqrt(3)/2+25),'sprite clip adds a halo');
 assert.ok(h.log.indexOf('image:grass')<h.log.indexOf('image:tree'));
});
test('object silhouettes respect their own padded tile raster',()=>{
 const h=setup();h.w.seed(h.tile,'mid',{layers:[
  {layer:'ground',image:{width:96,height:96,name:'ground'}},
  {layer:'scenery',image:{width:144,height:144,name:'padded'},pad:128}]});
 h.w.setFogCells([{x:0,y:0,radius:140,visibility:'visible'}]);
 h.w.request(h.view,[h.tile]);h.w.render(h.view);
 assert.ok(h.log.includes('image:padded'));
});
test('asset laboratory separates terrain and scenery and uses ownership-bounded baking',()=>{
 const app=file('app.js'),html=file('index.html'),server=file('server.py');
 assert.match(app,/worldTiles\.seed\(t,lod,\{complete:true,\s*layers:\[\{layer:'ground',image:a,pad:WORLD_TILE_GUTTER\},/);
 assert.match(app,/anchorBounds:\{x:t\.x,y:t\.y,width:t\.size,height:t\.size\}/);
 assert.match(app,/layer:'scenery',image:overlay,pad/);
 assert.match(html,/app\.js\?v=0\.55\.4/);
 assert.match(html,/Asset-Labor v0\.22\.4/);
 assert.match(server,/VERSION = '0\.22\.4'/);
});

'use strict';
/* node --test tests/test_fog_atmosphere_v0211_20261026.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function harness(){
 const calls=[],gradients=[];
 const ctx={
  save(){calls.push('save');},restore(){calls.push('restore');},
  beginPath(){},closePath(){},moveTo(){calls.push('move');},lineTo(){},
  clip(){calls.push('clip');},fill(){calls.push('fill');},fillRect(){calls.push('fillRect');},
  translate(){},scale(){},setTransform(){},clearRect(){},ellipse(){},
  drawImage(img){calls.push('image:'+img.name);},
  createRadialGradient(){
   calls.push('gradient');
   const stops=[];gradients.push(stops);
   return {addColorStop:(position,color)=>stops.push({position,color})};
  }
 };
 const canvas={width:0,height:0,getContext:()=>ctx};
 const sandbox={window:{},performance:{now:()=>1000}};
 vm.runInNewContext(read('fog-atmosphere.js'),sandbox);
 vm.runInNewContext(read('world-tile-streamer.js'),sandbox);
 const world=sandbox.window.VedrasWorldTiles.create({canvas,
  source:()=>({layers:[{layer:'ground',image:{width:128,height:128,name:'ground'}}]})});
 const view={width:800,height:600,zoom:1,dpr:1,panX:0,panY:0,projectY:.85};
 return {ctx,calls,gradients,world,view,fog:sandbox.window.VedrasFogAtmosphere};
}
test('known world is clipped to known hexes with a soft halo',()=>{
 const h=harness();
 const known={id:'0',x:-256,y:-256,size:512,visibility:'visible'};
 h.world.seed(known,'mid',{layers:[{layer:'ground',
  image:{width:128,height:128,name:'terrain'}}]});
 h.world.setFogCells([{x:0,y:0,radius:145,visibility:'visible'},
  {x:250,y:0,radius:145,visibility:'unknown'}]);
 h.world.request(h.view,[known]);
 h.world.render(h.view);
 assert.ok(h.calls.includes('clip'),'world has a known-cell clip');
 assert.ok(h.calls.includes('gradient'),'frontier is feathered');
 assert.ok(h.calls.indexOf('image:terrain')<h.calls.indexOf('gradient'),
  'clouds cover imagery instead of cropping silhouettes');
});
test('fog cells have world-fixed frontier indexing',()=>{
 const h=harness(),cells=h.fog.prepare([
  {x:0,y:0,radius:145,visibility:'visible'},
  {x:250,y:0,radius:145,visibility:'unknown'},
  {x:1500,y:0,radius:145,visibility:'unknown'}]);
 assert.equal(cells[1].frontier,true);
 assert.equal(cells[2].frontier,false);
 assert.equal(cells[0].frontier,false);
});
test('fully loaded visible hex gets no cloud cover',()=>{
 const h=harness(),cell={x:0,y:0,radius:145,visibility:'visible'};
 assert.equal(h.fog.draw(h.ctx,cell,h.view,{ready:true}),false);
 assert.equal(h.gradients.length,0);
});
test('visible-but-unloaded imagery is hidden by opaque cloudy core',()=>{
 const h=harness(),cell={x:0,y:0,radius:145,visibility:'visible'};
 h.fog.draw(h.ctx,cell,h.view,{ready:false});
 assert.equal(h.gradients[0][0].color,'rgba(186,198,202,1)');
 assert.ok(h.gradients[0].at(-1).color.endsWith(',0)'));
});
test('explored region is darkened but retains known terrain',()=>{
 const h=harness(),cell={x:0,y:0,radius:145,visibility:'explored'};
 assert.equal(h.fog.draw(h.ctx,cell,h.view),true);
 assert.ok(h.calls.includes('clip'));
 assert.equal(h.gradients.length,0);
});
test('unknown interior incurs no per-frame gradient work',()=>{
 const h=harness();const clouds=Array.from({length:4000},(_,i)=>
  ({x:800+(i%80)*250,y:800+Math.floor(i/80)*250,
   radius:145,visibility:'unknown'}));
 const cells=h.fog.prepare([{x:0,y:0,radius:145,visibility:'visible'},...clouds]);
 for(const cell of cells)h.fog.draw(h.ctx,cell,h.view);
 assert.ok(h.gradients.length<=12,'only near-edge fog creates layered gradients');
});
test('v0.21.1 wiring and preview version are coherent',()=>{
 const html=read('index.html'),app=read('app.js'),server=read('server.py');
 assert.match(html,/fog-atmosphere\.js\?v=0\.22\.0/);
 assert.match(html,/world-tile-streamer\.js\?v=0\.22\.0/);
 assert.ok(html.indexOf('fog-atmosphere.js')<html.indexOf('world-tile-streamer.js'));
 assert.match(app,/worldTiles\.setFogCells\(cells\)/);
 assert.match(server,/VERSION = '0\.22\.0'/);
});

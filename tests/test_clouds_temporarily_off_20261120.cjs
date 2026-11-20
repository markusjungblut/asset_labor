'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=pathName=>fs.readFileSync(path.join(__dirname,'..',pathName),'utf8');
function makeCanvas(){
 const marks=[];
 const g={setTransform(){},clearRect(){},save(){},restore(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},
  fill(){marks.push('fill');},fillRect(){marks.push('fillRect');},
  drawImage(){marks.push('drawImage');}};
 return {marks,canvas:{width:0,height:0,getContext:()=>g},context:g};
}
function worldFixture(disabled){
 const {canvas,marks}=makeCanvas(),events=[];
 const window={VedrasCloudsDisabled:disabled,
  VedrasCloudArtwork:{create:()=>{events.push('cloudCreated');return {
   setAssets(){},setSeed(){},stats(){return {bases:4};},
   drawBase(){events.push('cloudBase')},
   drawUnready(){events.push('cloudUnready')},
   drawTransitions(){events.push('cloudTransitions')}
  };}}};
 vm.runInNewContext(read('world-tile-streamer.js'),{window,
  performance:{now:()=>0}});
 const tiles=window.VedrasWorldTiles.create({canvas,source:()=>({layers:[]})});
 const view={width:500,height:320,zoom:1,dpr:1,panX:0,panY:0,projectY:.85};
 const fog=[{q:0,r:0,x:0,y:0,radius:120,visibility:'visible'}];
 tiles.setFogCells(fog);
 tiles.render(view,{fog});
 return {tiles,events,marks,view,fog};
}
test('editor and game viewer default cloud mode is OFF; legacy A/B remains explicit',()=>{
 for(const file of ['index.html','frozen-map-game.html']){
  const html=read(file);
  assert.match(html,/VedrasCloudsDisabled=new URLSearchParams\(location\.search\)\.get\('clouds'\)!=='1'/);
 }
 const app=read('app.js'),game=read('frozen-map-game.js');
 assert.match(app,/!window\.VedrasCloudsDisabled&&!state\.seamCheck&&worldTiles/);
 assert.match(app,/!window\.VedrasCloudsDisabled&&!finalRendering/);
 assert.match(game,/!window\.VedrasCloudsDisabled&&\(params\.get\('fogLayer'\)/);
 assert.match(game,/if\(!window\.VedrasCloudsDisabled\)player\.setClouds/);
});
test('world tile streamer does not create, decode or paint clouds while disabled',()=>{
 const h=worldFixture(true);
 assert.deepEqual(h.events,[]);
 assert.equal(h.tiles.stats().clouds,null);
 assert.equal(h.tiles.drawCloudBackground(h.context,h.view),0);
 assert.equal(h.tiles.drawCloudFrontier(h.context,h.view,[]),0);
 assert.equal(h.tiles.coverUnready(h.context,h.view,h.fog,()=>false),0);
 assert.equal(h.marks.filter(m=>m==='fillRect').length,0,
  'disabled clouds must not paint opaque fallback rectangles');
 const original=worldFixture(false);
 assert.ok(original.events.includes('cloudCreated'));
 assert.ok(original.events.includes('cloudBase'));
});
test('standalone viewer does not instantiate cloud artwork or allocate Fog overlay',()=>{
 const {canvas}=makeCanvas(),events=[];
 const window={VedrasCloudsDisabled:true,
  VedrasCloudArtwork:{create(){events.push('create');throw Error('cloud disabled');}}};
 vm.runInNewContext(read('frozen-map-runtime.js'),{window,Blob,
  performance:{now:()=>0}});
 const f=window.VedrasFrozenMap;
 const layer={getContext(){events.push('fogContext');return {};}};
 const player=f.create({canvas,fogCanvas:layer,storage:f.memoryStore()});
 assert.equal(player.report().clouds,null);
 assert.equal(player.report().layeredFog,false);
 assert.equal(player.report().fogOverlayMiB,0);
 assert.equal(player.report().cloudBackdropBuilds,0);
 assert.equal(player.setClouds({seed:'no-cloud',assets:[{path:'cloud.png'}]}),false);
 assert.deepEqual(events,[]);
});
test('original clouds remain functional in explicit A/B mode without saving changes',()=>{
 const {canvas}=makeCanvas(),events=[];
 const window={VedrasCloudsDisabled:false,
  VedrasCloudArtwork:{create:()=>{events.push('created');return {
   stats:()=>({bases:0}),setSeed:s=>{events.push('seed:'+s);},
   setAssets:a=>{events.push('assets:'+a.length);}
  };}}};
 vm.runInNewContext(read('frozen-map-runtime.js'),{window,Blob,
  performance:{now:()=>0}});
 const f=window.VedrasFrozenMap;
 const player=f.create({canvas,storage:f.memoryStore()});
 assert.equal(player.setClouds({seed:'manual',assets:[]}),true);
 assert.deepEqual(events,['created','seed:manual','assets:0']);
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','frozen-map-runtime.js'),'utf8');
const SCENE='v1-11111111',KEY=SCENE+'|near|0,0';
function fixture(){
 const events={unready:0,transitions:0};
 const ctx={setTransform(){},clearRect(){},fillRect(){},save(){},restore(){},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},
  drawImage(){},rect(){},fill(){}};
 const canvas={width:0,height:0,getContext:()=>ctx,
  getBoundingClientRect:()=>({width:700,height:500})};
 const win={VedrasCloudArtwork:{create:()=>({
  setSeed(){},setAssets(){},drawBase(){},stats:()=>({bases:4}),
  drawUnready(){events.unready++},
  drawTransitions(){events.transitions++}
 })}};
 vm.runInNewContext(source,{window:win,Blob,console,requestAnimationFrame(){},
  performance:{now:()=>1000}},{filename:'frozen-map-runtime.js'});
 const storage={async keys(){return [KEY];},async get(){return null;}};
 const player=win.VedrasFrozenMap.create({
  canvas,storage,overview1x:false,useLayerCache:false
 });
 const pose={zoom:.88,panX:0,panY:0,dpr:1,projectY:.85};
 const cell=visibility=>({q:0,r:0,x:50,y:50,radius:75,visibility});
 return {player,events,pose,cell};
}
test('complete local visible atlas does not re-cover existing landscape during zoom',async()=>{
 const {player,events,pose,cell}=fixture();
 await player.load(SCENE,'near',pose,[cell('visible')],{expectedTiles:1});
 assert.equal(player.report().completeVisibleAtlas,true);
 player.draw();player.setPose({zoom:1.7});player.draw();
 assert.equal(events.unready,0,'all-visible local atlas must not regain loading clouds');
 assert.ok(events.transitions>=2,'frontier cloud artwork remains intact');
 player.stop();
});
test('missing archive tiles retain loading-cloud protection',async()=>{
 const {player,events,pose,cell}=fixture();
 await player.load(SCENE,'near',pose,[cell('visible')],{expectedTiles:2});
 assert.equal(player.report().completeVisibleAtlas,false);
 player.draw();
 assert.ok(events.unready>0);
 player.stop();
});
test('explored or hidden cell authorization always retains Fog',async()=>{
 const {player,events,pose,cell}=fixture();
 await player.load(SCENE,'near',pose,[cell('explored')],{expectedTiles:1});
 assert.equal(player.report().completeVisibleAtlas,false);
 player.draw();
 assert.ok(events.unready>0);
 player.stop();
});
test('viewer passes exact manifest completeness',()=>{
 const game=fs.readFileSync(path.join(__dirname,'..','frozen-map-game.js'),'utf8');
 assert.match(game,/expectedTiles:manifest\.expectedTiles/);
 assert.match(game,/status\.completeVisibleAtlas/);
 assert.match(game,/sourceEdgeInset/);
});

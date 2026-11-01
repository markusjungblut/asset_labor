'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const world=fs.readFileSync(path.join(__dirname,'../world-tile-streamer.js'),'utf8');
const start=app.indexOf('function tileArtworkReady('),
 end=app.indexOf('// A 2.5px/world-unit tile',start);
assert.ok(start>=0&&end>start,'production artwork gate must be present');
const original=app.slice(start,end);
function gates({core=true,painted=false,shoreReady=true}={}){
 const t={id:'0,0',x:0,y:0,size:512};
 const current=()=>core?{tile:t,artwork:{version:'prepared-v1'}}:null;
 const paintedCore=()=>painted?current():null;
 const shoreline=(_tile,_allow,details)=>{
  if(shoreReady)return true;
  if(details)details.shorelineReason='shoreline-chunk-not-ready';
  return false;
 };
 const result=new Function('currentTerrainCore','paintedTerrainCore',
  'shorelineTileStatus','terrainChunks','state',
  original+'\nreturn {tileArtworkStatus,tileArtworkReady};')(
  current,paintedCore,shoreline,
  {paintedVersions:()=>new Map()}, {objects:false});
 return {t,...result};
}
test('prepared unpainted core is a valid LIVE bake source, not a snapshot',()=>{
 const h=gates(),snapshot={},live={};
 assert.equal(h.tileArtworkStatus(h.t,snapshot),false);
 assert.equal(snapshot.reason,'terrain-not-painted');
 assert.equal(h.tileArtworkStatus(h.t,live,true),true);
 assert.equal(live.reason,'ready-objects-hidden');
 assert.equal(live.terrainVersion,'prepared-v1');
 assert.equal(h.tileArtworkReady(h.t),false);
});
test('an unprepared core is still a genuine blocker for either pathway',()=>{
 const h=gates({core:false}),snapshot={},live={};
 assert.equal(h.tileArtworkStatus(h.t,snapshot),false);
 assert.equal(h.tileArtworkStatus(h.t,live,true),false);
 assert.equal(snapshot.reason,'terrain-core-not-ready');
 assert.equal(live.reason,'terrain-core-not-ready');
});
test('shoreline not prepared cannot be misclassified as a ready tile',()=>{
 const h=gates({shoreReady:false}),snapshot={},live={};
 assert.equal(h.tileArtworkStatus(h.t,snapshot),false);
 assert.equal(snapshot.reason,'terrain-not-painted');
 assert.equal(h.tileArtworkStatus(h.t,live,true),false);
 assert.equal(live.reason,'shoreline-chunk-not-ready');
});
test('live 4x near uses exact 2.5x ground and 1.9x scenery; memory is bounded',()=>{
 const pixels=(w,h)=>Math.round(w)*Math.round(h);
 const ground=pixels((512+2*3)*2.5,(512+2*3)*.85*2.5);
 const scenery=pixels((512+2*128)*1.9,(512+2*128)*.85*1.9);
 assert.equal(ground,1425795);
 assert.equal(scenery,1809160);
 assert.equal(ground+scenery,3234955);
 assert.equal((ground+scenery)*8,25879640);
 assert.match(app,/sceneryScale=Math\.min\(scale,1\.9\)/);
 assert.match(app,/if\(!\['mid','near'\]\.includes\(level\)/);
 assert.match(app,/const bakeReady=tileArtworkStatus\(t,bakeDetails,true\)/);
 assert.match(app,/bakeReason:bakeDetails\.reason/);
 assert.match(app,/canStartSource:tile=>tileArtworkStatus\(tile,null,true\)/);
 assert.match(world,/maxPixels=26000000/);
});

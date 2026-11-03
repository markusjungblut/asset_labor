'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const start=app.indexOf('function tileArtworkStatus(t,details=null,allowPrepared=false){');
const end=app.indexOf('\n// A 2.5px/world-unit tile',start);
assert.ok(start>=0&&end>start,'Source gate must share the real tileArtworkStatus function');
const production=app.slice(start,end);
function harness({terrain=true,shore=true,objects=true,sourceDecoded=false,
 missingPath=false}={}){
 const tile={id:'0,0',x:0,y:0,size:512};
 const asset={path:'assets/nature/example.png',img:sourceDecoded?{naturalWidth:256}:null};
 const state={objects,natureInstances:[{q:0,r:0,assetPath:asset.path}],
  mountainInstances:[],hexObject:{}};
 const byPath=missingPath?new Map():new Map([[asset.path,asset]]);
 const ensures=[];
 const current=()=>terrain?{artwork:{version:'terrain-ok'}}:null;
 const shoreStatus=()=>shore;
 const fn=new Function('state','assetByPath','imagePool','currentTerrainCore',
  'paintedTerrainCore','shorelineTileStatus','axialPos','key','terrainChunks',
  production+'\nreturn tileArtworkStatus;')(
   state,byPath,{ensure:(a,priority)=>ensures.push([a.path,priority])},
   current,current,shoreStatus,
   (q,r)=>({x:q*256,y:r*222}), (q,r)=>q+','+r,
   {paintedVersions:()=>new Map()});
 return {run:()=>fn(tile,null,true),asset,ensures,byPath,fn,tile};
}
test('source gate is exactly the shared prepared tile readiness contract',()=>{
 assert.match(app,/canStartSource:tile=>tileArtworkStatus\(tile,null,true\)/);
 assert.match(production,/shorelineTileStatus\(t,allowPrepared,details\)/);
 assert.match(production,/const asset=assetByPath\.get\(path\)/);
});
test('missing authored sprite delays source and gives image pool high priority',()=>{
 const h=harness();
 assert.equal(h.run(),false);
 assert.deepEqual(h.ensures,[[h.asset.path,11]]);
 h.asset.img={naturalWidth:256};
 assert.equal(h.run(),true);
 assert.equal(h.ensures.length,1);
});
test('absent terrain or coastal raster blocks source even if sprite is decoded',()=>{
 assert.equal(harness({terrain:false,sourceDecoded:true}).run(),false);
 assert.equal(harness({shore:false,sourceDecoded:true}).run(),false);
});
test('hidden authored objects are not required for tile source completeness',()=>{
 const h=harness({objects:false});
 assert.equal(h.run(),true);
 assert.deepEqual(h.ensures,[]);
});
test('deleted optional asset does not prevent exploration',()=>{
 const h=harness({missingPath:true});
 assert.equal(h.run(),true);
 assert.deepEqual(h.ensures,[]);
});
test('missing sprite never qualifies as a complete source merely because terrain and coast are ready',()=>{
 const h=harness();
 assert.equal(h.run(),false);
 const detail={waitingAssets:[],missingOptionalAssets:[]};
 assert.equal(h.fn(h.tile,detail,true),false);
 assert.equal(detail.reason,'sprite-source-not-ready');
 assert.deepEqual(detail.waitingAssets,[h.asset.path]);
});

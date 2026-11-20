'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const a=app.indexOf('function riverTileStatus('),
 b=app.indexOf('function tileArtworkReady(',a);
assert.ok(a>0&&b>a,'river readiness function exists');
const functionSource=app.slice(a,b);
function fixture({waterReady=true,banksReady=true,bankBuilt=true,
 bankPainted=true,river=true,near=true}={}){
 const tile={id:'0,0',x:0,y:0,size:512};
 const mouthAsset={path:'water.png',
  img:{naturalWidth:waterReady?256:0},
  imageRevision:waterReady?9:8};
 const route=near?{hexes:[[0,0],[1,0]]}:
  {hexes:[[44,44],[45,44]]};
 const known={id:'0,0',tile,artwork:{version:11}};
 const requested=[];
 const context={
  assets:[mouthAsset],assetByPath:new Map(),
  isTerrain:()=>true,typeOfAsset:()=>null,typeOfCell:()=>null,
  state:{river,riverBanks:true,riverBankStrength:70,riverPaths:[route],
   hexTerrain:{},biomeTerrain:{}},
  riverRoutes:()=>[route],
  axialPos:(q,r)=>({x:q*256,y:r*220}),
  worldCells:[{q:1,r:0},{q:45,r:44}],
  key:(q,r)=>q+','+r,
  imageForBiome:()=>mouthAsset,
  imagePool:{ensure(asset,priority){requested.push({asset,priority});}},
  riverNetworkCache:{prepared:banksReady?{lines:[{
   minX:200,maxX:280,minY:0,maxY:220
  }]}:null},
  riverChunks:{
   readyTiles:()=>bankBuilt?[known]:[],
   paintedVersions:()=>new Map(bankPainted?[['0,0',11]]:[])
  }
 };
 vm.runInNewContext(functionSource,context);
 return {fn:context.riverTileStatus,tile,context,requested};
}
test('a dry tile never waits for unrelated route textures or bank chunks',()=>{
 const {fn,tile}=fixture({waterReady:false,banksReady:false,near:false});
 assert.equal(fn(tile,true,{}),true);
});
test('invalid saved river routes never make a riverless atlas complete',()=>{
 const {fn,tile,context}=fixture();
 context.riverRoutes=()=>[];
 const details={};
 assert.equal(fn(tile,true,details),false);
 assert.equal(details.riverReason,'river-route-not-renderable');
});
test('river Ground cannot become complete while the mouth PNG is undecoded',()=>{
 const {fn,tile,requested}=fixture({waterReady:false});
 const details={};assert.equal(fn(tile,true,details),false);
 assert.equal(details.riverReason,'river-water-texture-not-ready');
 assert.equal(requested.length,1,'diagnostic path must request missing water');
 assert.equal(requested[0].priority,11);
});
test('river Ground cannot become complete while bank raster is not prepared',()=>{
 const {fn,tile}=fixture({banksReady:false});
 const details={};assert.equal(fn(tile,true,details),false);
 assert.equal(details.riverReason,'river-bank-network-not-prepared');
});
test('river Ground cannot become complete while exact bank chunk is missing',()=>{
 const {fn,tile}=fixture({bankBuilt:false});
 const details={};assert.equal(fn(tile,true,details),false);
 assert.equal(details.riverReason,'river-bank-chunk-not-ready');
});
test('offscreen bake may use prepared banks; camera snapshot requires painted version',()=>{
 const {fn,tile}=fixture({bankPainted:false});
 const details={};assert.equal(fn(tile,true,details),true);
 assert.equal(fn(tile,false,details),false);
 assert.equal(details.riverReason,'river-bank-not-painted');
});
test('ready water texture and stable bank raster permit the Ground tile',()=>{
 const {fn,tile}=fixture();
 assert.equal(fn(tile,true,{}),true);
 assert.equal(fn(tile,false,{}),true);
});
test('only river-adjacent tiles enforce water preparation and water assets affect Ground revision',()=>{
 const gate=app.indexOf('if(!riverTileStatus(t,allowPrepared,details))');
 const objects=app.indexOf('if(!state.objects)',gate);
 assert.ok(gate>0&&objects>gate,'river readiness must precede optional scenery');
 const sourceVersion=app.slice(app.indexOf('function groundSourceRevision('),
  app.indexOf('function groundTileContentKey('));
 assert.match(sourceVersion,/const riverWater=state\.river\?riverRoutes\(\)/);
 assert.match(sourceVersion,/water\?\.imageRevision\|\|0/);
 assert.match(sourceVersion,/String\(river\),riverWater/);
 assert.doesNotMatch(functionSource,/drawGround\(|drawRoads\(/);
 assert.match(app,/state\.riverPaths=authoredRivers\?\?window\.VedrasRivers\.normalizeRoutes/);
 assert.match(functionSource,/imagePool\.ensure\(pending,11\)/);
});

'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const app=read('app.js');
const start=app.indexOf('function forestFloorAsset(){');
const end=app.indexOf('function drawGround(){',start);
assert.ok(start>0&&end>start,'test must use the actual forest source selection and draw functions');
const production=app.slice(start,end);
const forestWindow={};
vm.runInNewContext(read('forest-ground.js'),{window:forestWindow});
const realForest=forestWindow.VedrasForestGround;
const floor={path:'assets/terrain/wald_01.png',category:'terrain',
 type:'forest_floor',terrainCheck:null,img:null,mtime:4};
const grass={path:'assets/terrain/grassland_01.png',category:'terrain',
 type:'grassland',terrainCheck:{ok:true},img:{naturalWidth:128}};
const dense={q:0,r:0,baseBiome:'grassland',forestClass:'dense_forest',
 jungle:false,glade:false};
const light={q:1,r:0,baseBiome:'grassland',forestClass:'light_forest',
 jungle:false,glade:false};
function harness({cells=[dense,light],source=floor,finalRendering=false}={}){
 const ensured=[],drawn=[],builds=[];
 const state={forest:{enabled:true},materialScales:{}};
 const catalog={terrainTypes:[
  {id:'grassland',categoryId:'grass_pasture',materialClass:'ground'},
  {id:'jungle',categoryId:'warm_regions',materialClass:'ground'}
 ]};
 const window={VedrasForestGround:{...realForest,build(...args){
  builds.push(args);
  return {canvas:{drawn:true},x:0,y:0,width:260,height:200};
 }}};
 const imagePool={ensure(a,priority){ensured.push({path:a.path,priority});
  return Promise.resolve(null);}};
 const ctx={save(){},restore(){},beginPath(){},
  moveTo(){},lineTo(){},closePath(){},clip(){},
  drawImage(...args){drawn.push(args);}};
 const fn=new Function('assets','catalog','state','window','imagePool',
  'isTerrain','typeOfAsset','isTerrainValid','forestCells','axialPos',
  'HEX','R','clamp','finalRendering','previewDensity','lodProfile',
  'performance','ctx','worldCells','hexPoints',
  production+'\nreturn {source:forestFloorAsset,visible:visibleForestFloorAsset,draw:drawForestFloor};');
 const api=fn([grass,source],catalog,state,window,imagePool,
  a=>a.category==='terrain',a=>a?.type||null,
  a=>a?.terrainCheck?.ok===true,()=>cells,
  (q,r)=>({x:256*(q+r/2),y:256*r*.866}),256,256/Math.sqrt(3),
  (v,lo,hi)=>Math.max(lo,Math.min(hi,v)),finalRendering,
  ()=>1,()=>({forest:1}),{now:()=>0},ctx,cells,
  (q,r)=>Array.from({length:6},(_,i)=>[q*256+i*2,r*256+i*2]));
 return {api,state,window,ensured,drawn,builds};
}
test('forest floor is selected even before first decode and pinned for woodland viewport',()=>{
 const unready={...floor,img:null,terrainCheck:null};
 const x=harness({source:unready});
 assert.equal(x.api.source(),unready);
 assert.equal(x.api.visible({minX:-200,maxX:100,minY:-200,maxY:100}),unready);
 assert.equal(x.api.visible({minX:4000,maxX:5000,minY:4000,maxY:5000}),null);
 x.api.draw();
 assert.deepEqual(x.ensured.map(e=>e.path),[unready.path]);
 assert.equal(x.drawn.length,0,'missing overlay cannot be faked with grassland');
 assert.equal(x.window.__vedrasForestFloorRaster,null);
 assert.match(app,/pinned\.add\(forestFloor\.path\)/);
 assert.match(app,/imagePool\.ensure\(forestFloor,10\)/);
});
test('woodland renderer draws overlay after decode, dense and light remain eligible',()=>{
 const ready={...floor,img:{naturalWidth:512,naturalHeight:512},
  terrainCheck:{ok:true}};
 const x=harness({source:ready});
 x.api.draw();
 assert.equal(x.ensured.length,0);
 assert.equal(x.drawn.length,1);
 assert.equal(x.builds.length,1);
 assert.equal(x.builds[0][0].length,2);
 assert.equal(x.window.__vedrasForestFloorRaster?.canvas.drawn,true);
 assert.equal(realForest.eligible({...dense,ground:true}),true);
 assert.equal(realForest.eligible({...light,ground:true}),true);
 assert.ok(realForest.strength({...dense,categoryId:'grass_pasture'})>
  realForest.strength({...light,categoryId:'grass_pasture'}));
});
test('jungle never receives ordinary woodland overlay, and disabled woods remain clear',()=>{
 const jungle={...dense,jungle:true,baseBiome:'jungle'};
 const z=harness({cells:[jungle],source:{...floor,img:null}});
 assert.equal(z.api.visible({minX:-200,maxX:200,minY:-200,maxY:200}),null);
 z.api.draw();
 assert.equal(z.ensured.length,0);
 assert.equal(z.drawn.length,0);
 const x=harness({source:{...floor,img:null}});
 x.state.forest.enabled=false;
 assert.equal(x.api.visible({minX:-200,maxX:200,minY:-200,maxY:200}),null);
});
test('the native 4x exporter fails closed rather than omitting forest material',()=>{
 const missing=harness({source:{...floor,img:null},finalRendering:true});
 assert.throws(()=>missing.api.draw(),/4×-Waldboden fehlt oder ist ungültig/);
 const invalid=harness({source:{...floor,terrainCheck:{ok:false}},
  finalRendering:true});
 assert.throws(()=>invalid.api.draw(),/4×-Waldboden fehlt oder ist ungültig/);
 assert.match(app,/organic-forest-fringes-and-soft-snow-v4/,
  'new atlas identity must not reuse previously published missing forest PNGs');
 const index=read('index.html');
 assert.match(index,/app\.js\?v=20261120-organic-v1/);
});

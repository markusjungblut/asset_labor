'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const G=require('../worldgen-geography.js'),Pre=require('../geography-lab-presets.js');
const Plan=require('../large-map-bake-plan.js');
const Source=require('../large-map-bake-source.js');
const Bridge=require('../large-map-bake-forest-floor.js');
const sandbox={window:{}};
for(const name of ['forest.js','forest-ground.js'])
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../'+name),'utf8'),sandbox);
const Forest=sandbox.window.VedrasForest,Floor=sandbox.window.VedrasForestGround;
const catalog={terrainTypes:[...G.TERRAIN_IDS,'forest_floor'].map(id=>({
 id,materialClass:/ocean|^coast$/.test(id)?'water':'ground',
 categoryId:/snow|tundra/.test(id)?'cold_regions':'grass_pasture'
}))};
const groups={byType:new Map([['forest_floor',[{
 path:'assets/terrain/wald_03.png',meta:{textureWorldSize:256}
}]]])};
const reference=()=>G.generateWorld(Pre.PRESET.seed,{
 width:95,height:75,config:Pre.configFor(G)
});
const newBridge=(world,floor=Floor,more={})=>Bridge.create({
 world,catalog,groups,forest:Forest,floor,
 loadImage:async a=>({...a,img:{naturalWidth:512,naturalHeight:512}}),
 ...more
});
function firstVisibleForestTile(plan,source,bridge){
 return plan.tiles.find(t=>{
  const ctx=source.contextFor(t.id,{sourceHalo:768});
  const left=t.x-128-245,right=t.x+512+128+245,
   top=t.y-128-245,bottom=t.y+512+128+245;
  return ctx.cells.some(c=>{
   const original=bridge.cellById.get(c.q+','+c.r);
   if(!Floor.eligible(original))return false;
   const x=256*(c.q+c.r/2),y=1.5*(256/Math.sqrt(3))*c.r;
   return x>=left&&x<=right&&y>=top&&y<=bottom;
  });
 });
}
test('all geographic forest classes and original world glades stay stable',()=>{
 const w=reference(),b=newBridge(w);
 assert.equal(b.forestCells.length,7125);
 assert(b.forestHexes>500&&b.regionCount>10);
 for(let i=0;i<w.cells.length;i++){
  const source=w.cells[i],c=b.forestCells[i];
  assert.equal(c.forestClass,source.forestClass);
  assert.deepEqual([c.q,c.r],[source.q,source.r]);
  assert.equal(c.manualClearing,false);
  if(c.jungle)assert.equal(Floor.eligible(c),false);
 }
 assert(b.forestCells.some(c=>c.glade),'globally seeded glades missing');
});
test('full authoritative overrides give identical forest edges and glades with coverage zero',()=>{
 const w=G.generateWorld('forest-parity',{width:21,height:20});
 const overrides={},densityOverrides={},geographyHexes={},jungleHexes={};
 for(const c of w.cells){
  const id=c.q+','+c.r;
  overrides[id]=c.forestClass;geographyHexes[id]=true;
  if(c.forestClass!=='none')densityOverrides[id]=c.forestDensity;
  if(c.baseBiome==='jungle')jungleHexes[id]=true;
 }
 const options={...Forest.defaults(),overrides,densityOverrides,geographyHexes,jungleHexes};
 const a=Forest.generate(w.cells,catalog,options,c=>c.terrainId,c=>c.terrainId);
 const b=Forest.generate(w.cells,catalog,{...options,coverage:0},
  c=>c.terrainId,c=>c.terrainId);
 const keys=['forestClass','density','edgeInfluence','glade','gladeX','gladeY',
  'gladeRadius','jungle','manualClearing'];
 for(let i=0;i<a.length;i++)for(const k of keys)
  assert.equal(a[i][k],b[i][k],k+' differs at '+i);
});
test('bounded original forest mask receives full-world opacity and real original PNG',async()=>{
 const w=reference(),p=Plan.plan(w),s=Source.create(w,p,{planner:Plan});
 let capture=null;
 const floor={...Floor,build:(cells,image,options)=>{
  capture={cells,image,options};
  return {canvas:{},x:options.bounds.x,y:options.bounds.y,
   width:options.bounds.width,height:options.bounds.height,
   regions:2,cells:cells.filter(Floor.eligible).length,
   scale:1.4,mask:'original',textureOrigin:'world-0,0'};
 }};
 const b=newBridge(w,floor);
 const tile=firstVisibleForestTile(p,s,b);
 assert(tile);
 const ctx=s.contextFor(tile.id,{sourceHalo:768}),out=await b.render(ctx);
 assert.equal(out.stage,'original-forest-floor-preview');
 assert.equal(out.complete,false);
 assert.equal(out.readyForViewer,false);
 assert.equal(out.assetPath,'assets/terrain/wald_03.png');
 assert.deepEqual(capture.options.bounds,{x:tile.x-128,y:tile.y-128,
  width:768,height:768});
 assert.equal(capture.options.resolution,1.4);
 assert.equal(capture.options.maxPixels,2600000);
 for(const c of capture.cells)if(Floor.eligible(c))
  assert.equal(capture.options.regionOpacityOf(c),
   b.opacityByHex.get(c.q+','+c.r));
});
test('missing material, invalid class and insufficient halo cannot silently produce PNG',async()=>{
 const w=reference(),p=Plan.plan(w),s=Source.create(w,p,{planner:Plan});
 const b=newBridge(w,Floor,{groups:{byType:new Map()}});
 const tile=firstVisibleForestTile(p,s,b);
 assert(tile);
 await assert.rejects(()=>b.render(s.contextFor(tile.id,{sourceHalo:768})),/Waldboden fehlt/);
 await assert.rejects(()=>b.render(s.contextFor(tile.id)),/768er/);
 const changed={...w,cells:[{...w.cells[0],forestClass:'bogus'},...w.cells.slice(1)]};
 assert.throws(()=>newBridge(changed),/Waldklasse/);
});
test('Geography Lab loads original forest sources after water and before direct PNG',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8'),
  lab=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 const order=['water-texture.js','forest.js','forest-ground.js',
  'large-map-bake-forest-floor.js','large-map-bake-material-preview.js','geography-lab.js'];
 const idx=order.map(x=>html.indexOf('src="'+x));
 assert(idx.every(x=>x>0)&&idx.every((x,i)=>i===0||x>idx[i-1]));
 assert(html.includes('id="materialPreviewForest"'));
 assert.match(lab,/forestAdapter:window\.VedrasLargeMapBakeForestFloor/);
 assert.match(lab,/renderer\.renderTile\(tileId,\{withRelief,withShoreline,withRivers,withForest\}\)/);
 assert.match(lab,/UNVOLLSTÄNDIG/);
});

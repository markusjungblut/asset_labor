'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const G=require('../worldgen-geography.js');
const MIX=require('../geography-lab-presets.js');
const P=require('../large-map-bake-plan.js');
const Source=require('../large-map-bake-source.js');
const Relief=require('../large-map-bake-ground-relief.js');
const Material=require('../large-map-bake-material-preview.js');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../chunks.js'),'utf8'),sandbox);
const chunks=sandbox.window.VedrasChunks;
function world(){
 return G.generateWorld(MIX.PRESET.seed,{width:95,height:75,
  config:MIX.configFor(G)});
}
const types=G.TERRAIN_IDS.map(id=>({id,materialClass:
 /^(?:ocean|coastal_water|icy_ocean|stormy_ocean)$/.test(id)?'water':'ground'}));
const pos=c=>({x:256*(c.q+c.r/2),y:1.5*(256/Math.sqrt(3))*c.r});
const autotile={
 draw:()=>{},
 DIRS:[[1,-1],[1,0],[0,1],[-1,1],[-1,0],[0,-1]],
 hexAt:(x,y)=>{
  const rf=y/(1.5*(256/Math.sqrt(3))),qf=x/256-rf/2;
  const xf=qf,yf=rf,zf=-xf-yf;
  let rx=Math.round(xf),ry=Math.round(yf),rz=Math.round(zf);
  const dx=Math.abs(rx-xf),dy=Math.abs(ry-yf),dz=Math.abs(rz-zf);
  if(dx>dy&&dx>dz)rx=-ry-rz;
  else if(dy>dz)ry=-rx-rz;
  return rx+','+ry;
 }
};
function mockRelief(){
 const calls=[],api={
  defaults:()=>({seed:43781,strength:45,lighting:true}),
  valid:opts=>opts,
  make:(land,opts)=>{
   calls.push({land,opts});
   return {...land,canvas:{raised:true}};
  }
 };
 return {api,calls};
}
test('extended 1280-unit geography halo is the same row-major selection as chunks.neighbors()',()=>{
 const w=world(),plan=P.plan(w),adapter=Source.create(w,plan,{planner:P});
 for(const i of [0,3,100,260,Math.floor(plan.tileCount/2),plan.tileCount-1]){
  const tile=plan.tiles[i];
  const ctx=adapter.contextFor(tile.id,{sourceHalo:Relief.SOURCE_HALO});
  const expected=Array.from(chunks.neighbors(tile,w.cells,Relief.SOURCE_HALO),
   c=>c.q+','+c.r);
  assert.deepEqual(ctx.cells.map(c=>c.q+','+c.r),expected);
  assert.equal(ctx.sourceHalo,1280);
  assert(ctx.sourceCount>0);
  const baseline=adapter.contextFor(tile.id);
  assert.equal(baseline.sourceHalo,470);
  assert(ctx.sourceCount>=baseline.sourceCount);
 }
 assert.throws(()=>adapter.contextFor(plan.tiles[0].id,{sourceHalo:300}),/Halo/);
 assert.throws(()=>adapter.contextFor(plan.tiles[0].id,{sourceHalo:2049}),/Halo/);
});
test('original 2.5D hill sources retain absolute q/r, land-mask sea level and editor seed',()=>{
 const w=world(),plan=P.plan(w),adapter=Source.create(w,plan,{planner:P}),
  center=plan.tiles[Math.floor(plan.tileCount/2)],
  ctx=adapter.contextFor(center.id,{sourceHalo:Relief.SOURCE_HALO}),
  {api}=mockRelief();
 const {options,hillHexes,waterHexes}=Relief.createOptions(ctx,types,{relief:api,autotile});
 assert.equal(options.enabled,true);
 assert.equal(options.mode,'geography');
 assert.equal(options.seed,43781);
 assert.equal(options.strength,45);
 assert.equal(options.geoHills.length,hillHexes);
 assert.equal(waterHexes,ctx.cells.filter(c=>
  ['ocean','coastal_water','icy_ocean','stormy_ocean'].includes(c.terrainId)).length);
 for(const h of options.geoHills){
  const c=ctx.cells.find(c=>c.q===h.q&&c.r===h.r);
  assert(c&&c.reliefClass==='hills');
  assert.equal(h.worldQ,c.q);assert.equal(h.worldR,c.r);
 }
 const wet=ctx.cells.find(c=>['ocean','coastal_water','icy_ocean','stormy_ocean'].includes(c.terrainId));
 if(wet){const p=pos(wet);assert.equal(options.landMask(p.x,p.y),0);}
 const land=ctx.cells.find(c=>!['ocean','coastal_water','icy_ocean','stormy_ocean'].includes(c.terrainId));
 if(land){const p=pos(land);assert(options.landMask(p.x,p.y)>=0);}
 assert.equal(options.landMask(100000,100000),0);
});
test('raised land and flat water use two actual original raster layers, not fake completed packets',()=>{
 const w=world(),plan=P.plan(w),adapter=Source.create(w,plan,{planner:P});
 const ctx=adapter.contextFor(plan.tiles[Math.floor(plan.tileCount/2)].id,
  {sourceHalo:Relief.SOURCE_HALO});
 const {api,calls}=mockRelief(),raster={
  canvas:{opaque:true},landLayer:{canvas:{land:true}},
  waterLayer:{canvas:{water:true}}
 };
 const result=Relief.apply({context:ctx,raster,types,relief:api,autotile});
 assert.equal(result.stage,'material-relief-preview');
 assert.equal(result.complete,false);
 assert.equal(result.water,raster.waterLayer);
 assert(result.land?.canvas);
 assert.equal(calls.length,result.hillHexes>0?1:0);
 if(calls.length)assert.equal(calls[0].land,raster.landLayer);
 assert.throws(()=>Relief.apply({context:{...ctx,sourceHalo:470},
  raster,types,relief:api,autotile}),/Halo/);
 assert.throws(()=>Relief.apply({context:ctx,raster:{canvas:{}},
  types,relief:api,autotile}),/Rasterbilder/);
});
test('direct geography material renderer selects old and new preview stages safely',async()=>{
 const w=G.generateWorld('ground-relief-test',{width:12,height:10}),
  plan=P.plan(w),tiles=plan.tiles;
 const catalog={terrainTypes:types,assets:{}},assets=[];
 for(const id of G.TERRAIN_IDS){
  const relPath='terrain/'+id+'_01.png';
  catalog.assets[relPath]={terrainTypeId:id};
  assets.push({category:'terrain',path:'assets/'+relPath,
   relPath,mtime:1,meta:{}});
 }
 const calls=[],raster={canvas:{tag:'combined'},
  landLayer:{canvas:{tag:'land'}},waterLayer:{canvas:{tag:'water'}}};
 const fakeAuto={...autotile,build:()=>raster,
  draw:(g,layer)=>g.drawImage(layer.canvas)};
 const {api}=mockRelief(),canvas={
  getContext:()=>({setTransform:()=>{},
   drawImage:(image)=>calls.push(image.tag|| (image.raised?'raised':'unknown'))}),
  toBlob:cb=>cb(new Blob([new Uint8Array(50)],{type:'image/png'}))
 };
 const renderer=Material.create({world:w,plan,planner:P,sourceAdapter:Source,
  autotile:fakeAuto,reliefAdapter:Relief,reliefApi:api,catalog,assets,
  loadImage:async a=>({...a,img:{naturalWidth:128}}),
  canvasFactory:()=>canvas});
 const tileId=tiles[Math.floor(tiles.length/2)].id;
 const plain=await renderer.renderTile(tileId);
 assert.equal(plain.stage,'material-only-preview');
 assert.equal(plain.complete,false);
 assert.deepEqual(calls,['combined']);
 calls.length=0;
 const raised=await renderer.renderTile(tileId,{withRelief:true});
 assert.equal(raised.stage,'material-relief-preview');
 assert.equal(raised.complete,false);
 assert.equal(raised.readyForViewer,false);
 assert.equal(raised.omitted.includes('relief'),false);
 assert.deepEqual(calls[0],'water');
 assert(['land','raised'].includes(calls[1]));
 assert.equal(calls.length,2);
});
test('Geography-Lab loads shared original relief before experimental direct PNG renderer',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8'),
  lab=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 assert(html.includes('id="materialPreviewRelief"'));
 const order=['relief.js','large-map-bake-ground-relief.js',
  'large-map-bake-material-preview.js','geography-lab.js'];
 const pos=order.map(x=>html.indexOf('src="'+x));
 assert(pos.every(x=>x>0));assert(pos.every((x,i)=>i===0||x>pos[i-1]));
 assert.match(lab,/renderer\.renderTile\(tileId,\{withRelief,withShoreline,withRivers\}\)/);
 assert.match(lab,/material-relief-preview/);
 assert.match(lab,/UNVOLLSTÄNDIG/);
});

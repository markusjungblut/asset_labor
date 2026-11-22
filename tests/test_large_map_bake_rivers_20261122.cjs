'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const G=require('../worldgen-geography.js');
const MIX=require('../geography-lab-presets.js');
const Plan=require('../large-map-bake-plan.js');
const Source=require('../large-map-bake-source.js');
const RiverBridge=require('../large-map-bake-rivers.js');
const sb={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../river.js'),'utf8'),sb);
const actualRivers=sb.window.VedrasRivers;
const wetTypes=new Set(['ocean','coastal_water','coast','icy_ocean','stormy_ocean']);
const catalog={terrainTypes:G.TERRAIN_IDS.map(id=>({
 id,materialClass:wetTypes.has(id)?'water':'ground'
}))};
const world=()=>G.generateWorld(MIX.PRESET.seed,{
 width:95,height:75,config:MIX.configFor(G)
});
function fixture(){
 const w=world(),p=Plan.plan(w),src=Source.create(w,p,{planner:Plan}),
  wet=c=>wetTypes.has(c.terrainId);
 const banks={
  prepare:(routes,cells,isWet,options)=>{
   assert.equal(typeof options.typeForCell,'function');
   assert.equal(options.width,32);
   assert(routes.every(x=>actualRivers.valid(x,cells,isWet)));
   return {lines:[{a:{x:0,y:0}}],routeCount:routes.length};
  },
  render:(prepared,{bounds})=>({
   canvas:{bank:true},x:bounds.x,y:bounds.y,
   width:bounds.width,height:bounds.height
  })
 };
 const draws=[],renders=[];
 const rivers={...actualRivers,render:(ctx,route,cells,isWet,image,options)=>{
  assert(actualRivers.valid(route,cells,isWet));
  assert(image.naturalWidth>0);
  renders.push({route,options});
  ctx.drawImage({water:true});
  return {canvas:{river:true}};
 }};
 const bridge=RiverBridge.create({
  world:w,catalog,rivers,banks,
  groups:{},
  pick:mouth=>({path:'assets/terrain/'+mouth.terrainId+'_01.png',mtime:1}),
  loadImage:async()=>({img:{naturalWidth:512,naturalHeight:512}})
 });
 const active=p.tiles.find(t=>bridge.visible(src.contextFor(t.id,{sourceHalo:1280})).length>0);
 assert(active,'reference world has visible river tile');
 return {w,p,src,banks,rivers,bridge,active,draws,renders};
}
test('full ten routes remain valid with full absolute courses and tile-local selection',()=>{
 const f=fixture();
 assert.equal(f.bridge.riverCount,10);
 const tile=f.src.contextFor(f.active.id,{sourceHalo:1280});
 const visible=f.bridge.visible(tile);
 assert(visible.length>0);
 assert(visible.every(v=>actualRivers.valid(v.route,v.routeCells,c=>wetTypes.has(c.terrainId))));
 assert(visible.every(v=>v.extent.minX<=v.extent.maxX));
 assert.throws(()=>f.bridge.visible({...tile,sourceHalo:470}),/Halo/);
});
test('bank raster is drawn before real textured original river; only valid PNG textures accepted',async()=>{
 const f=fixture(),context=f.src.contextFor(f.active.id,{sourceHalo:1280});
 const calls=[],target={drawImage:image=>calls.push(
  image?.bank?'bank':image?.water?'water':'other')};
 const result=await f.bridge.render(context,target);
 assert.equal(result.stage,'original-river-preview');
 assert.equal(result.complete,false);
 assert.equal(result.readyForViewer,false);
 assert.equal(result.riverCount,f.bridge.visible(context).length);
 assert.equal(result.bankCount,1);
 assert.equal(result.texturePaths.length>0,true);
 assert.equal(calls[0],'bank');
 assert(calls.slice(1).every(x=>x==='water'));
 assert.equal(calls.length,result.riverCount+1);
 assert.equal(f.renders.length,result.riverCount);
 assert(f.renders.every(r=>r.options.detailScale===1));
});
test('invalid river texture / route / halo refuses to render without fallback color',async()=>{
 const f=fixture(),ctx=f.src.contextFor(f.active.id,{sourceHalo:1280});
 const weak=RiverBridge.create({world:f.w,catalog,groups:{},
  rivers:f.rivers,banks:f.banks,
  pick:()=>({path:'assets/terrain/missing.png'}),
  loadImage:async()=>({img:{naturalWidth:0,naturalHeight:0}})
 });
 const drawn=[];
 await assert.rejects(()=>weak.render(ctx,{drawImage:x=>drawn.push(x)}),
  /Flusswassertextur fehlt/);
 assert.equal(drawn.length,0,'no ghost bank on missing water');
 const damaged={...f.w,riverPaths:[[[0,0],[50,50]]]};
 assert.throws(()=>RiverBridge.create({world:damaged,catalog,
  rivers:f.rivers,banks:f.banks,groups:{},loadImage:async()=>({}),
  pick:()=>({})}),/inkonsistent/);
 await assert.rejects(()=>f.bridge.render(ctx,{}),/Canvas2D/);
});
test('geography-Lab loads original water texture, banks and new tile bridge in order',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8');
 const js=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 const order=['water-texture.js','river.js','shoreline.js','river-banks.js',
  'large-map-bake-rivers.js','large-map-bake-material-preview.js','geography-lab.js'];
 const pos=order.map(x=>html.indexOf('src="'+x));
 assert(pos.every(x=>x>0));assert(pos.every((x,i)=>i===0||x>pos[i-1]));
 assert(html.includes('id="materialPreviewRivers"'));
 assert.match(js,/riverAdapter:window\.VedrasLargeMapBakeRivers/);
 assert.match(js,/riverBanksApi:window\.VedrasRiverBanks/);
 assert.match(js,/renderer\.renderTile\(tileId,\{withRelief,withShoreline,withRivers\}\)/);
 assert.match(js,/materialPreviewRivers/);
 assert.match(js,/UNVOLLSTÄNDIG/);
});

'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const app=read('app.js'),tile=read('world-tile-streamer.js'),
 viewer=read('frozen-map-runtime.js'),nature=read('nature-ui.js');
test('a frozen scenery core recomposes ALL intersecting mountain, tree and shadows',()=>{
 assert(app.includes("drawMapObjects({includeUnits:false});"),
  'render every overlapping mountain/tree, irrespective of anchor tile');
 assert(!app.includes('anchorBounds:{x:t.x,y:t.y,width:t.size,height:t.size}'),
  'do not clip objects to the cell containing their roots');
 assert(app.includes("{layer:'scenery',...sceneryLayer,pad,coreOnly:true}"),
  'per-tile bake marks canonical scenery ownership');
 assert(app.includes("{layer:'scenery',...sceneryLayer,coreOnly:true}"),
  'snapshot-seeded/scenery-upgrade tiles keep the same ownership contract');
 assert(app.includes("Math.max(800,(o.w||0)*2.4)"),
  'mountain overhang and shadow must enter the offscreen query');
 assert(app.includes("inside(p.x,p.y,1450)"),
  'source readiness covers mountains crossing another tile');
 assert(app.includes('!o.occludedByMountain')&&
  app.includes("o.natureMeta?.kind!=='tree'"),
  'only tree roots on opaque mountain faces are hidden; shrubs survive');
 assert(app.includes("alpine.has(o.cell)"),
  'tree roots in geographic mountain hexes are not visible');
 assert(nature.includes("if(meta.kind==='tree'&&(cell.reliefClass==='mountain'"),
  'do not generate future tree roots on mountain geography');
});
test('empty terrain rim tiles still bake incoming mountain silhouettes and shadows',()=>{
 const begin=app.indexOf('async function frozenEmptyNative4xTile(tile){');
 const end=app.indexOf("$('frozenCaptureAll').addEventListener",begin);
 assert(begin>0&&end>begin,'the empty-ground rim must have a scenery renderer');
 const rim=app.slice(begin,end);
 assert(rim.includes('drawMapObjects({includeUnits:false});'),
  'do not replace the mountain overhang with a transparent scenery placeholder');
 assert(rim.includes('await imagePool.ensure(asset,11)'),
  'a cold mountain source must finish loading before publishing rim scenery');
 assert(rim.includes("coreOnly:true"),
  'empty-ground rim and regular scenery use the identical exclusive core');
 assert(rim.includes("'no-authored-ground-with-scenery-v2'"));
 assert(!rim.includes("'no-authored-hex-in-core-v1'"),
  'old empty placeholders must not masquerade as complete source scenery');
 assert(app.includes("'scenery-global-composition-exclusive-core-v2'"),
  'new export must use a fresh immutable atlas key, not old broken tiles');
});
test('viewer/core compositors clip only new core-owned scenery, not old archives',()=>{
 assert(tile.includes("coreOnly:layer.coreOnly===true"));
 assert(tile.includes("if(asset.coreOnly&&!core){"));
 assert(tile.includes("g.rect(obj.dx,obj.dy,obj.dw,obj.dh);g.clip()"));
 assert(viewer.includes("if(layer.coreOnly===true){"));
 assert(viewer.includes("g.rect(x,y,w,h);g.clip()"));
 assert(viewer.includes("if(!allMapVisible)clipCells(45)"),
  'fully visible test worlds preserve tall sprite overhang at outer rim');
 assert(viewer.includes("plan=sparseWorldBlit&&!allMapVisible&&worldBlitPlanner?"),
  'sparse hex-only blit must not cut mountains on a fully visible map');
 assert(viewer.includes("coreOnly:layer.coreOnly===true,png:await encode(layer.image)"),
  'exported PNG record must retain core ownership');
 assert(viewer.includes("coreOnly:sceneryLayer.coreOnly===true,png"),
  'scenery-only refresh must retain identical compositor behavior');
 assert(!tile.includes("coreOnly:!!layer.coreOnly&&layer.layer==='ground'"),
  'ground remains exclusive by its existing separate crop path');
});
test('core ownership survives real archive capture without changing legacy packets',async()=>{
 const sandbox={window:{},Blob,Date,console,Promise,performance:{now:()=>0}};
 vm.runInNewContext(viewer,sandbox,{filename:'frozen-map-runtime.js'});
 const F=sandbox.window.VedrasFrozenMap,storage=F.memoryStore();
 const player=F.create({canvas:{getContext:()=>({})},storage,
  encode:async()=>new Blob(['pixels'],{type:'image/png'})});
 const fake={width:16,height:16};
 const base={sceneKey:'v1-12345678',level:'near',
  tile:{id:'0,0',x:0,y:0,size:512},revision:'core-ownership-v1',
  complete:true};
 const packets=[{...base,layers:[
  {layer:'ground',image:fake,pad:3},
  {layer:'scenery',image:fake,pad:128,coreOnly:true}
 ]},{...base,tile:{id:'1,0',x:512,y:0,size:512},layers:[
  {layer:'ground',image:fake,pad:3},
  {layer:'scenery',image:fake,pad:128}
 ]}];
 const report=await player.capture('v1-12345678',packets);
 assert.equal(report.saved,2);
 const first=await storage.get('v1-12345678|near|0,0');
 const legacy=await storage.get('v1-12345678|near|1,0');
 assert.equal(first.layers[1].coreOnly,true);
 assert.equal(legacy.layers[1].coreOnly,false);
 assert.equal(first.layers[0].coreOnly,false);
 assert.equal(first.layers[1].pad,128);
});
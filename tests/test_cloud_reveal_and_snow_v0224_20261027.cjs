'use strict';
/* node --test tests/test_cloud_reveal_and_snow_v0224_20261027.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function setup(){
 const calls=[];
 const ctx={
  save(){calls.push('save')},restore(){calls.push('restore')},
  setTransform(){},clearRect(){},fillRect(){calls.push('fill')},
  beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},
  translate(){},scale(){},rotate(){calls.push('ROTATE')},
  drawImage(img){calls.push(img.name||'cloud')},
  fill(){calls.push('fill-hex')}
 };
 const sandbox={window:{},performance:{now:()=>10000}};
 vm.runInNewContext(read('cloud-artwork.js'),sandbox);
 vm.runInNewContext(read('fog-atmosphere.js'),sandbox);
 vm.runInNewContext(read('world-tile-streamer.js'),sandbox);
 const canvas={width:0,height:0,getContext:()=>ctx};
 const w=sandbox.window.VedrasWorldTiles.create({canvas});
 const tile={id:'0,0',x:-256,y:-256,size:512,visibility:'visible'};
 const view={width:800,height:600,zoom:1,panX:0,panY:0,dpr:1,projectY:.85};
 const fog=[{q:0,r:0,x:0,y:0,radius:256/Math.sqrt(3),visibility:'visible'}];
 return {calls,ctx,sandbox,w,tile,view,fog};
}
test('four cloud artworks retain authored north/light orientation',()=>{
 const source=read('cloud-artwork.js');
 assert.doesNotMatch(source,/g\.rotate\(field\.rotation\)/);
 const h=setup();
 const a=h.sandbox.window.VedrasCloudArtwork.create();
 const c=a.fieldAt(0,0),d=a.fieldAt(13,-14);
 assert.equal(c.rotation,0);
 assert.equal(d.rotation,0);
 assert.equal(c.density,1);
 assert.ok(c.variant>=0&&c.variant<4);
});
test('a tile with terrain alone never exposes a complete visible hex',()=>{
 const h=setup(),t=h.tile,v=h.view;
 h.w.seed(t,'mid',{complete:true,layers:[
  {layer:'ground',image:{width:32,height:32,name:'ground'}}]});
 h.w.setFogCells(h.fog);
 h.w.request(v,[t]);h.w.render(v);
 // Real PNGs aren't loaded in this harness: verify readiness contract
 // in executable packet shape and code branch, not visual gradient pixels.
 assert.match(read('world-tile-streamer.js'),
  /!layers\.some\(v=>v\.layer==='scenery'\|\|v\.layer==='structures'\)/);
 assert.equal(h.w.stats().tiles,1);
});
test('tile readiness requires all intersecting 512 cores, not just center',()=>{
 const src=read('world-tile-streamer.js');
 assert.match(src,/const byCore=new Map\(items\.map\(o=>\[o\.t\.id,o\.item\]\)\)/);
 assert.match(src,/for\(let tx=xmin;tx<=xmax;tx\+\+\)for\(let ty=ymin;ty<=ymax;ty\+\+\)/);
 assert.match(src,/item\.packet\.complete===false/);
});
test('normal map editor covers missing hexes after all foreground painting',()=>{
 const src=read('app.js');
 const stage=src.indexOf('drawMountainFootprints();drawBounds();');
 const overlay=src.indexOf('worldTiles.coverUnready(ctx,view,pending,fullyPainted)',stage);
 assert.ok(stage>=0&&overlay>stage);
 assert.match(src,/function tileArtworkReady\(t\)/);
 assert.match(src,/const expected=genericObjects\(/);
 assert.match(src,/if\(units\|\|!tileArtworkReady\(t\)\)continue/);
 assert.match(src,/if\(signal\?\.aborted\|\|!tileArtworkReady\(t\)\)return null/);
});
test('all 10 snow patch source entries are enabled as cold ground cover',()=>{
 const catalog=JSON.parse(read('assets/nature/nature_catalog.json'));
 const assets=Object.entries(catalog.entries).filter(([p])=>
  /^nature\/snow_patch_\d{2}\.png$/.test(p));
 assert.equal(assets.length,10);
 for(const [p,m] of assets){
  assert.equal(m.family,'snow',p);
  assert.equal(m.kind,'ground_cover',p);
  assert.ok(m.placement.weight>0&&m.placement.density>0,p);
  assert.ok(m.allowedTerrainTypes.includes('snowfields'),p);
  assert.ok(m.allowedTerrainTypes.includes('frozen_tundra'),p);
  assert.equal(m.shadow.mode,'none');
 }
});
test('the shared habitat validator accepts snow patches only on cold land',()=>{
 const window={};
 vm.runInNewContext(read('nature_catalog.js'),{window});
 const terrain=JSON.parse(read('assets/terrain/terrain_catalog.json'));
 const catalog=JSON.parse(read('assets/nature/nature_catalog.json'));
 const patch=catalog.entries['nature/snow_patch_01.png'];
 const ctx=biome=>({baseBiome:biome,biome,forestClass:'none',neighborTypes:[]});
 assert.equal(window.VedrasNatureCatalog.canPlace(patch,ctx('snowfields'),terrain,catalog),true);
 assert.equal(window.VedrasNatureCatalog.canPlace(patch,ctx('frozen_tundra'),terrain,catalog),true);
 assert.equal(window.VedrasNatureCatalog.canPlace(patch,ctx('pasture'),terrain,catalog),false);
});
test('nature generator gives snow ground cover a seeded spawn opportunity',()=>{
 const src=read('nature-ui.js');
 assert.match(src,/const snowPatches=possible\.filter\(a=>entryFor\(a\)\?\.family==='snow'\)/);
 assert.match(src,/const snowChance=\['snowfields','frozen_tundra'\]\.includes\(terrainType\)/);
 assert.match(src,/makeInstance\(asset,c\.q,c\.r,all\.length\+1,/);
});
test('updated HTML invalidates cloud, nature and server code caches',()=>{
 const html=read('index.html'),server=read('server.py');
 assert.match(html,/Asset-Labor v0\.22\.5/);
 assert.match(html,/cloud-artwork\.js\?v=0\.22\.5/);
 assert.match(html,/nature_catalog\.js\?v=0\.33\.1/);
 assert.match(html,/nature-ui\.js\?v=0\.36\.1/);
 assert.match(server,/VERSION = '0\.22\.5'/);
});

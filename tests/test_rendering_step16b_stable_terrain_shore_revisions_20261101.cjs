'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const chunksSrc=fs.readFileSync(path.join(root,'chunks.js'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const bounds={x:0,y:0,width:511,height:511};
function fixture(family='terrain'){
 const window={};vm.runInNewContext(chunksSrc,{
  window,console,Date,Promise,performance,setTimeout,clearTimeout
 });
 const chunk=window.VedrasChunks.create({size:512,maxTiles:20,maxPixels:5000000});
 const worldCells=[{q:0,r:0}];
 let signature=family+'|LOD-near|density-2.5';
 let stamp='material-a.png|revision-1';
 let count=0;
 const configure=()=>chunk.configure(signature,{
  worldCells,stampTile:()=>stamp,
  buildTile:()=>{count++;return {raster:{canvas:{width:100,height:100}}};},
  redraw:()=>{},family
 });
 async function prepared(){
  configure();chunk.prime(bounds,{prefetch:{enabled:false}});
  const deadline=Date.now()+1500;
  while(Date.now()<deadline){
   const candidates=chunk.readyTiles(bounds,{limit:12,sourceKeys:true});
   if(candidates.length)return candidates[0].artwork;
   await new Promise(resolve=>setTimeout(resolve,10));
  }
  throw Error('Chunk never prepared: '+JSON.stringify(chunk.diagnostics({limit:3})));
 }
 return {chunk,prepared,rebuild:()=>chunk.clear(),
  setStamp:s=>{stamp=s},setSignature:s=>{signature=s},
  get builds(){return count}};
}
test('terrain source fingerprint survives an identical cache eviction and rebuild',async()=>{
 const h=fixture('terrain'),a=await h.prepared();
 assert.match(a.sourceRevision,/^src-[0-9a-z]+-[a-f0-9]{32}$/);
 h.rebuild();const b=await h.prepared();
 assert.notEqual(a.version,b.version,'integer build counters must change');
 assert.equal(a.sourceRevision,b.sourceRevision,'identical terrain pixels keep content identity');
 assert.equal(h.builds,2);
});
test('shoreline fingerprint survives an identical new chunk build',async()=>{
 const h=fixture('shore'),a=await h.prepared();
 h.rebuild();const b=await h.prepared();
 assert.notEqual(a.version,b.version);
 assert.equal(a.sourceRevision,b.sourceRevision);
});
test('actual terrain material, shoreline geometry and render-setting edits change fingerprints',async()=>{
 const h=fixture('terrain'),a=await h.prepared();
 h.setStamp('material-b.png|revision-2');
 const b=await h.prepared();
 assert.notEqual(a.sourceRevision,b.sourceRevision,'material revision must invalidate');
 h.setSignature('terrain|LOD-near|different-resolution');
 const c=await h.prepared();
 assert.notEqual(b.sourceRevision,c.sourceRevision,'render density must invalidate');
});
test('production ground revision remains unchanged when only terrain/shore build numbers change',()=>{
 const start=app.indexOf('function groundSourceRevision('),
  end=app.indexOf('function groundTileContentKey(',start);
 assert.ok(start>0&&end>start,'must use production ground revision function');
 const tile={id:'0,0',x:0,y:0,size:512};
 const t={version:1,sourceRevision:'src-terrain-unchanged'};
 const shore={version:10,sourceRevision:'src-shore-unchanged'};
 const fakeChunks={readyTiles:()=>[{tile,artwork:shore}]};
 const get=new Function('state','currentTerrainCore','shorelineCache',
  'shorelineChunks','roadChunks','riverChunks',
  app.slice(start,end)+'\nreturn groundSourceRevision;')(
  {shoreline:{enabled:true},roadShown:false,river:false},
  ()=>({tile,artwork:t}),
  {segments:[{center:{x:1,y:1}}]},fakeChunks,null,null
 );
 const before=get(tile);
 t.version=100;shore.version=5000;
 assert.equal(get(tile),before,'reconstructed identical source cannot invalidate WorldTile');
 t.sourceRevision='src-terrain-material-edited';
 assert.notEqual(get(tile),before,'real terrain edit invalidates WorldTile');
 const terrainChanged=get(tile);
 shore.sourceRevision='src-shore-geometry-edited';
 assert.notEqual(get(tile),terrainChanged,'real shoreline edit invalidates WorldTile');
});
test('live camera consumes semantic source tokens without weakening painted snapshot checks',()=>{
 assert.match(app,/const ready=terrainChunks\.readyTiles\(bounds,\{limit:100,sourceKeys:true\}\)/);
 assert.match(app,/shore:state\.shoreline\?\.enabled!==false\?prepared\(shorelineChunks,true\):null/);
 assert.match(app,/artwork\.sourceRevision\?\?artwork\.version,layers/);
 assert.match(app,/versionFor\(shorelineChunks,readyMaps\?\.shore,true\)/);
 assert.match(app,/const sourceVersion=terrainVersion\?\?terrainArtwork\?\.sourceRevision/);
 assert.match(app,/terrainChunks\.paintedVersions\(\)\.get\(t\.id\)===entry\.artwork\.version/);
 assert.match(app,/\{limit:32,sourceKeys:true\}/);
});

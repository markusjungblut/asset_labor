'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../world-tile-streamer.js'),'utf8');
const view={width:640,height:400,zoom:.81,dpr:1,panX:0,panY:0,projectY:.85};
const cell={q:0,r:0,x:0,y:0,radius:256/Math.sqrt(3),visibility:'visible'};
function setup(){
 const window={};
 vm.runInNewContext(source,{window,console,Date,Promise,performance,
  AbortController,setTimeout,clearTimeout});
 const paths=[],draws=[];let moves=0;
 const ctx={save(){},restore(){},setTransform(){},clearRect(){},fillRect(){},
  beginPath(){moves=0},moveTo(){moves++},lineTo(){},closePath(){},
  clip(){paths.push(moves)},fill(){},drawImage(img){draws.push(img.id||'unknown')}};
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>ctx},source:()=>null,
  lodSelector:()=> 'mid',requireScenery:true,sourceTimeoutMs:0
 });
 renderer.setFogCells([cell]);
 const tiles=[
  {id:'-1,-1',x:-512,y:-512,size:512,visibility:'visible'},
  {id:'0,-1',x:0,y:-512,size:512,visibility:'visible'},
  {id:'-1,0',x:-512,y:0,size:512,visibility:'visible'},
  {id:'0,0',x:0,y:0,size:512,visibility:'visible'}
 ];
 renderer.request(view,tiles);
 const packet=(name,shore='src-shore-a')=>({
  complete:true,revision:JSON.stringify(['terrain-a',shore,'off','off']),
  layers:[{layer:'ground',image:{width:64,height:64,id:name+'-ground'}},
   {layer:'scenery',image:{width:64,height:64,id:name+'-scenery'}}]
 });
 const preview=(g,v,fog)=>{g.drawImage({id:'preview'},0,0,50,50);
  return new Set(['0,0'])};
 return {renderer,tiles,paths,draws,packet,preview,ctx};
}
test('a partially prepared 4-core Hex stays ONE provisional material Hex',()=>{
 const h=setup();
 assert.equal(h.renderer.seed(h.tiles[3],'mid',h.packet('partial')),true);
 const result=h.renderer.render(view,{tiles:h.tiles,drawPreview:h.preview});
 assert.equal(result.exact,1);
 assert.equal(result.missing,3);
 assert.equal(result.previewHexes,1);
 assert.equal(result.previewPending,1);
 // Preview mask (path present), exact ground mask (path EXCLUDED), static
 // scenery fallback (the known polygon is still present for objects).
 assert.equal(h.paths[0],1);
 assert.equal(h.paths[1],0,
  'partial exact world-core must not overwrite the provisional Hex');
 assert.ok(h.draws.includes('preview'));
 assert.ok(h.draws.includes('partial-ground'));
});
test('when every touching core is ready, high-res Hex promotes atomically',()=>{
 const h=setup();
 for(let i=0;i<h.tiles.length;i++)assert.equal(
  h.renderer.seed(h.tiles[i],'mid',h.packet('exact-'+i)),true);
 const result=h.renderer.render(view,{tiles:h.tiles,drawPreview:h.preview});
 assert.equal(result.exact,4);
 assert.equal(result.missing,0);
 assert.equal(result.previewHexes,0);
 assert.equal(result.previewPending,0);
 assert.equal(h.paths[0],1,'ground mask contains the entire authorized Hex');
 assert.ok(!h.draws.includes('preview'),
  'warm full-quality path must not waste texture preview work');
});
test('missing shoreline chunk is NOT a semantic edit or reason to discard exact terrain',()=>{
 const h=setup(),tile=h.tiles[3];
 assert.equal(h.renderer.seed(tile,'mid',h.packet('coast')),true);
 const previous=h.renderer.stats().selectiveInvalidations;
 assert.equal(h.renderer.reconcileGroundRevisions(new Map([
  [tile.id,JSON.stringify(['terrain-a','pending','off','off'])]
 ])),0,'temporary missing coast should be deferred as for roads/rivers');
 assert.equal(h.renderer.stats().selectiveInvalidations,previous);
 assert.equal(h.renderer.stats().staleTiles,0);
 assert.equal(h.renderer.render(view,{tiles:[tile]}).exact,1);
});
test('real coast source modification still invalidates the relevant exact WorldTile',()=>{
 const h=setup(),tile=h.tiles[3];
 assert.equal(h.renderer.seed(tile,'mid',h.packet('coast')),true);
 const n=h.renderer.reconcileGroundRevisions(new Map([
  [tile.id,JSON.stringify(['terrain-a','src-shore-b','off','off'])]
 ]));
 assert.equal(n,1);
 assert.equal(h.renderer.stats().staleTiles,1);
});
test('real terrain edit and authored edit are not hidden as missing source',()=>{
 const h=setup(),tile=h.tiles[3];
 assert.equal(h.renderer.seed(tile,'mid',h.packet('before')),true);
 assert.equal(h.renderer.reconcileGroundRevisions(new Map([
  [tile.id,JSON.stringify(['terrain-b','pending','off','off'])]
 ])),1,'changed terrain must not be deferred even with absent coast');
});
test('unknown Fog remains excluded, even if a callback claims preview content',()=>{
 const h=setup();
 h.renderer.setFogCells([{...cell,visibility:'unknown'}]);
 const r=h.renderer.render(view,{tiles:[{...h.tiles[3],visibility:'unknown'}],
  drawPreview:h.preview});
 assert.equal(r.previewHexes,0);
 assert.equal(r.previewPending,0);
 assert.equal(r.exact,0);
 assert.ok(!h.draws.includes('preview'));
});
test('integration retains prior exact source and preview metrics independently',()=>{
 assert.match(source,/const previewPendingHexes=new Set\(\)/);
 assert.match(source,/if\(exclude\?\.has\(c\.q\+','\+c\.r\)\)continue/);
 assert.match(source,/halo===0&&previewPendingHexes\.size\?previewPendingHexes:null/);
 assert.match(source,/lastProgress=\{exact,fallback,provisional,stale,missing,/);
 assert.match(source,/previewPending:previewPendingHexes\.size/);
});

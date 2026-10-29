'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const vm=require('node:vm'),{readFileSync}=require('node:fs');
const {join}=require('node:path'),root=join(__dirname,'..');
const read=name=>readFileSync(join(root,name),'utf8');
function createFixtures(){
 const window={},sandbox={window,performance:{now:()=>100},console,
  Date,Promise,setTimeout,clearTimeout,AbortController};
 vm.runInNewContext(read('render-step15-trace.js'),sandbox);
 vm.runInNewContext(read('world-tile-ground-reuse.js'),sandbox);
 vm.runInNewContext(read('world-tile-streamer.js'),sandbox);
 const g={save(){},restore(){},setTransform(){},clearRect(){},
  fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},
  fill(){},drawImage(){},translate(){},scale(){},createPattern(){return null;}};
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>g},maxTiles:32,
  requireScenery:true,lodSelector:zoom=>zoom>=1.06?'near':'mid'});
 const tile=(id,x)=>({id,x,y:0,size:512,visibility:'visible'});
 const packet=revision=>({complete:true,revision,layers:[
  {layer:'ground',image:{width:64,height:64}},
  {layer:'scenery',image:{width:64,height:64}}
 ]});
 const view=(zoom,panX=0)=>({width:640,height:400,zoom,dpr:1,
  panX,panY:0,projectY:.85});
 return {renderer,tile,packet,view,window,
  reuse:window.VedrasGroundTileReuse.create({maxBytes:1024,maxEntries:3})};
}
test('unchanged warm pan retains exact tile, no source or terrain rebuild',()=>{
 const h=createFixtures(),a=h.tile('0,0',0),b=h.tile('1,0',512);
 h.renderer.seed(a,'mid',h.packet('groundA'));
 h.renderer.seed(b,'mid',h.packet('groundB'));
 h.renderer.request(h.view(.70),[a,b]);
 h.renderer.request(h.view(.70,-160),[a,b]);
 assert.equal(h.renderer.reconcileGroundRevisions(new Map([
  [a.id,'groundA'],[b.id,'groundB']])),0);
 assert.equal(h.renderer.stats().tiles,2);
 assert.equal(h.renderer.needsSeed(a,'mid',3),false);
 assert.equal(h.renderer.stats().completed,2);
});
test('zoom within same LOD retains original ground and full tile packets',()=>{
 const h=createFixtures(),a=h.tile('0,0',0);
 h.renderer.seed(a,'mid',h.packet('core-v1'));
 h.renderer.request(h.view(.70),[a]);const count=h.renderer.stats().completed;
 h.renderer.request(h.view(.94),[a]);
 assert.equal(h.renderer.reconcileGroundRevisions(new Map([[a.id,'core-v1']])),0);
 assert.equal(h.renderer.stats().completed,count);
 assert.equal(h.renderer.stats().tiles,1);
});
test('changed terrain core invalidates only touched tile and preserves neighbor',()=>{
 const h=createFixtures(),a=h.tile('0,0',0),b=h.tile('1,0',512);
 h.renderer.seed(a,'mid',h.packet('old'));
 h.renderer.seed(b,'mid',h.packet('still-good'));
 h.renderer.request(h.view(.70),[a,b]);
 h.window.VedrasStep15Trace.enable(true);
 const changed=h.renderer.reconcileGroundRevisions(new Map([
  [a.id,'new'],[b.id,'still-good']]));
 assert.equal(changed,1);
 assert.equal(h.renderer.stats().tiles,1);
 assert.equal(h.renderer.needsSeed(b,'mid',3),false);
 assert.equal(h.renderer.needsSeed(a,'mid',3),true);
 assert.ok(h.window.VedrasStep15Trace.snapshot().events.some(x=>
  x.type==='tile.invalidate'&&x.detail.reason==='terrain-core-revision-changed'));
});
test('LOD variants are preserved when checking current zoom',()=>{
 const h=createFixtures(),a=h.tile('0,0',0);
 h.renderer.seed(a,'mid',h.packet('mid-core'));
 h.renderer.seed(a,'near',h.packet('near-core'));
 h.renderer.request(h.view(.72),[a]);
 assert.equal(h.renderer.reconcileGroundRevisions(new Map([[a.id,'mid-core']])),0);
 assert.equal(h.renderer.stats().tiles,2);
 h.renderer.request(h.view(1.20),[a]);
 assert.equal(h.renderer.reconcileGroundRevisions(new Map([[a.id,'near-core']])),0);
 assert.equal(h.renderer.stats().tiles,2);
});
test('refreshing the current terrain LOD does not evict the other tier',()=>{
 const h=createFixtures(),a=h.tile('0,0',0);
 h.renderer.seed(a,'mid',h.packet('old-mid'));
 h.renderer.seed(a,'near',h.packet('unchanged-near'));
 h.renderer.request(h.view(.70),[a]);
 const changed=h.renderer.reconcileGroundRevisions(new Map([[a.id,'new-mid']]));
 assert.equal(changed,1);
 assert.equal(h.renderer.stats().tiles,1);
 assert.equal(h.renderer.needsSeed(a,'near',3),false);
 assert.equal(h.renderer.needsSeed(a,'mid',3),true);
});
test('ground reuse cache retains identical revision, rejects edits and evicts by bytes',()=>{
 const h=createFixtures(),a=h.tile('0,0',0),b=h.tile('1,0',512);
 const image={width:8,height:8},key='terrain-v1';
 assert.equal(h.reuse.put(a,'mid',key,image),true);
 assert.equal(h.reuse.get(a,'mid',key),image);
 assert.equal(h.reuse.get(a,'mid','terrain-v2'),null);
 assert.equal(h.reuse.put(b,'mid',key,image),true);
 assert.equal(h.reuse.stats().entries,2);
 assert.equal(h.reuse.stats().hits,1);
 assert.equal(h.reuse.stats().misses,1);
 h.reuse.clear();assert.equal(h.reuse.stats().entries,0);
});
test('preview seeds only upgrade when source is higher density, exact stays immutable',()=>{
 const h=createFixtures(),a=h.tile('0,0',0);
 h.renderer.seed(a,'mid',{...h.packet('v1'),preview:true,sourceDensity:.7});
 assert.equal(h.renderer.needsSeed(a,'mid',.7),false);
 assert.equal(h.renderer.needsSeed(a,'mid',1.2),true);
 h.renderer.seed(a,'mid',{...h.packet('v1'),preview:false});
 assert.equal(h.renderer.needsSeed(a,'mid',3),false);
});
test('editor staging identity cannot globally invalidate unchanged world content',()=>{
 const src=read('app.js');
 assert.match(src,/const semanticKey=JSON\.stringify/);
 assert.match(src,/const stagingChanged=stagedKey!==lastTilePreparedSignature/);
 assert.match(src,/worldTiles\.invalidate\('semantic-content-changed'\)/);
 assert.doesNotMatch(src,/worldTiles\.invalidate\('staging-signature-changed'\)/);
 assert.match(src,/worldTiles\.reconcileGroundRevisions/);
 assert.match(src,/groundTileReuse\?\.get\(t,level,sourceToken\)/);
 assert.match(src,/groundTileReuse\?\.put\(t,level,sourceToken,out\)/);
 assert.match(src,/groundSourceRevision\(t/);
});
test('source completeness and deep layers remain checked before accepting tiles',()=>{
 const app=read('app.js');
 assert.match(app,/if\(!snapshotReady&&!tileArtworkStatus\(t,null,true\)\)/);
 assert.match(app,/currentTerrainCore\(t\)/);
 assert.match(app,/!tileArtworkReady\(t\)/);
 assert.match(app,/groundSourceRevision\(t\)!==sourceGroundVersion/);
 assert.match(app,/anchorBounds:\{x:t\.x,y:t\.y,width:t\.size,height:t\.size\}/);
});


test('bakeWorldTile finalizer can read ground revision on early exit (no ReferenceError)',async()=>{
 // Real extracted function: the former implementation declared
 // sourceGroundVersion inside try and read it from finally, causing every
 // tile bake, including early exits, to reject with ReferenceError.
 const app=read('app.js');
 const start=app.indexOf('async function bakeWorldTile(');
 const end=app.indexOf('\nlet fastInteracting=',start);
 assert.ok(start>=0&&end>start,'cannot isolate actual bake function');
 const events=[];
 const win={
  VedrasBenchmarkProfiler:{record(){}},
  VedrasStep15Trace:{enabled:()=>true,record:(type,details)=>
   events.push({type,details})}
 };
 const fn=new Function('window','performance','state','terrainLod',
  app.slice(start,end)+'\nreturn bakeWorldTile;')(
  win,{now:()=>100},{mode:'normal',view:'map',zoom:.7,dpr:1},'mid');
 const result=await fn({id:'0,0',x:0,y:0,size:512},'mid',
  {signal:{aborted:true}});
 assert.equal(result,null);
 assert.equal(events.length,1);
 assert.equal(events[0].type,'tile.bake');
 assert.equal(events[0].details.outcome,'aborted-or-not-map');
 assert.equal(events[0].details.sourceGroundVersion,'null');
});

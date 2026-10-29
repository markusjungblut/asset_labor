'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const vm=require('node:vm'),{readFileSync}=require('node:fs'),{join}=require('node:path');
const root=join(__dirname,'..'),read=n=>readFileSync(join(root,n),'utf8');

function mockWorld(){
 const window={},clock={now:()=>100};
 const sandbox={window,performance:clock,Date,Promise,
  setTimeout,clearTimeout,AbortController,console};
 vm.runInNewContext(read('render-step15-trace.js'),sandbox);
 vm.runInNewContext(read('world-tile-streamer.js'),sandbox);
 const g={save(){},restore(){},setTransform(){},clearRect(){},
  fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},
  fill(){},drawImage(){},translate(){},scale(){},createPattern(){return null;}};
 const tile=(id,x)=>({id,x,y:0,size:512,visibility:'visible'});
 const renderer=window.VedrasWorldTiles.create({
  canvas:{width:0,height:0,getContext:()=>g},maxTiles:20,
  source:null,requireScenery:true,lodSelector:zoom=>zoom>=1.06?'near':'mid'
 });
 const packet=()=>({complete:true,revision:'v1',layers:[
  {layer:'ground',image:{width:64,height:64}},
  {layer:'scenery',image:{width:64,height:64}}
 ]});
 const view=(zoom,panX=0)=>({width:640,height:450,dpr:1,
  zoom,panX,panY:0,projectY:.85});
 return {window,renderer,tile,packet,view};
}

test('trace is disabled by default, enabled only on request and bounded',()=>{
 const h=mockWorld(),p=h.window.VedrasStep15Trace;
 p.record('tile.invalidate',{reason:'scene'});assert.equal(p.snapshot().totalEvents,0);
 p.enable(true);
 for(let i=0;i<1900;i++)p.record('tile.state',{id:'test',n:i});
 const x=p.snapshot();assert.equal(x.events.length,1800);
 assert.equal(x.dropped,100);assert.equal(x.counts['tile.state'],1900);
 p.reset('same-scene');assert.equal(p.snapshot().totalEvents,0);
 p.enable(false);assert.equal(p.snapshot().enabled,false);
});
test('warm pan reuses both cached tiles with identical level and revision',()=>{
 const h=mockWorld(),p=h.window.VedrasStep15Trace;p.enable(true);
 const a=h.tile('0,0',0),b=h.tile('1,0',512);
 h.renderer.seed(a,'mid',h.packet());h.renderer.seed(b,'mid',h.packet());
 p.reset('pan');
 const initial=h.renderer.stats().epoch;
 h.renderer.request(h.view(.70,0),[a,b]);
 h.renderer.request(h.view(.70,-160),[a,b]);
 const x=p.snapshot();
 assert.equal(h.renderer.stats().epoch,initial);
 assert.equal(x.counts['tile.invalidate']||0,0);
 assert.equal(x.counts['tile.cache-miss']||0,0);
 assert.equal(h.renderer.stats().tiles,2);
});
test('zoom within same LOD does not invalidate semantic tiles',()=>{
 const h=mockWorld(),p=h.window.VedrasStep15Trace;p.enable(true);
 const a=h.tile('0,0',0);h.renderer.seed(a,'mid',h.packet());
 p.reset('same-lod');const epoch=h.renderer.stats().epoch;
 h.renderer.request(h.view(.70),[a]);
 h.renderer.request(h.view(.95),[a]);
 assert.equal(h.renderer.stats().epoch,epoch);
 assert.equal(h.renderer.stats().tiles,1);
 assert.equal(p.snapshot().counts['tile.invalidate']||0,0);
 assert.equal(p.snapshot().counts['tile.lod']||0,0);
});
test('scene edit selectively evicts the touched tile only, with reason',()=>{
 const h=mockWorld(),p=h.window.VedrasStep15Trace;p.enable(true);
 const a=h.tile('0,0',0),b=h.tile('1,0',512);
 h.renderer.seed(a,'mid',h.packet());h.renderer.seed(b,'mid',h.packet());
 p.reset('changed-terrain');
 const removed=h.renderer.invalidateTiles([a.id],'terrain-edit');
 assert.equal(removed,1);
 assert.equal(h.renderer.stats().tiles,1);
 const x=p.snapshot();
 assert.equal(x.counts['tile.invalidate'],1);
 assert.equal(x.events.find(x=>x.type==='tile.invalidate').detail.reason,'terrain-edit');
 // Neighbor remains in its original LOD and no new global epoch was issued.
 h.renderer.request(h.view(.7),[b]);assert.equal(h.renderer.stats().tiles,1);
});
test('explicit global invalidation increments epoch and records cause',()=>{
 const h=mockWorld(),p=h.window.VedrasStep15Trace;p.enable(true);
 const a=h.tile('0,0',0);h.renderer.seed(a,'mid',h.packet());
 const before=h.renderer.stats().epoch;p.reset('staging-signature');
 h.renderer.invalidate('staging-signature-changed');
 assert.equal(h.renderer.stats().epoch,before+1);
 assert.equal(h.renderer.stats().tiles,0);
 assert.equal(p.snapshot().events.find(x=>x.type==='tile.invalidate').detail.reason,
  'staging-signature-changed');
});
test('camera diagnostic does not silently overwrite the reference terrain',()=>{
 const app=read('app.js'),bench=read('scripts/rendering-step15-diagnostics.mjs');
 const scene=JSON.parse(read('artifacts/rendering-step13/vedras_scene.json'));
 assert.equal(scene.terrainTypeByHex['-4,5'],'ocean');
 assert.match(app,/step15ImportedTerrain=scene\.terrainTypeByHex\|\|null/);
 assert.match(app,/terrainMatchesReference:expected===null\?null:effective===expected/);
 assert.match(app,/fogUsesSelectedNotCameraCenter/);
 assert.match(bench,/cameraDiagnostics/);
 assert.match(bench,/fog-off\.png/);assert.match(bench,/fog-on\.png/);
 assert.match(bench,/tile\.snapshot-signature-change/);
});
test('Step 15 Windows command, diagnostics packer and status links exist',()=>{
 const auto=read('scripts/rendering-step15-auto.mjs');
 const pack=read('scripts/rendering-step15-pack.py');
 const cmd=read('START_STEP15_WINDOWS.cmd');
 assert.match(auto,/rendering-step15-diagnostics\.mjs/);
 assert.match(auto,/rendering-step15-pack\.py/);
 assert.match(auto,/VEDRAS_SILENT_HTTP:'1'/);
 assert.match(pack,/rglob\("\*"\)/);
 assert.match(cmd,/rendering-step15-auto\.mjs/);
});

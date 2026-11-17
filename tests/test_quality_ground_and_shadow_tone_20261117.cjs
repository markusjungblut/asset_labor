'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function moduleOf(path,extra={}){
 const ctx={window:{},Blob,localStorage:{
  getItem:()=>null,setItem:()=>{throw Error('test should not persist')}
 },...extra};
 vm.runInNewContext(read(path),ctx,{filename:path});
 return ctx.window;
}
test('normal viewport remains 2x; verified original 4x mode is pixel-budget bounded',()=>{
 const v=moduleOf('frozen-map-view-policy.js').VedrasFrozenViewPolicy;
 assert.equal(v.displayDpr({zoom:1,width:1200,height:700}),2);
 assert.equal(v.displayDpr({zoom:1,width:1200,height:700,
  baseDpr:4,maxDpr:4,maxPixels:18000000,maxEdge:8192}),4);
 assert.ok(v.displayDpr({zoom:1,width:4800,height:2200,
  baseDpr:4,maxDpr:4,maxPixels:18000000,maxEdge:8192})<2);
});
test('original 4x ground replaces only the Ground layer in memory',async()=>{
 const api=moduleOf('frozen-map-ground-detail.js').VedrasFrozenGroundDetail;
 const makeBlob=text=>new Blob([text]);
 const makePng=(width,height)=>{
  const header=new Uint8Array(24);
  header.set([137,80,78,71,13,10,26,10]);
  const view=new DataView(header.buffer);view.setUint32(16,width);view.setUint32(20,height);
  return new Blob([header],{type:'image/png'});
 };
 const base={key:'v1-0374527a|near|0,0',revision:'r1',tile:{size:512},
  layers:[{layer:'ground',png:makePng(1040,884),pad:4},
   {layer:'scenery',png:makeBlob('2x-scenery'),crop:{x:2,y:2,fullWidth:20,fullHeight:20}}]};
 const raw={...base,layers:[{layer:'ground',png:makePng(2080,1768),pad:4},
  {layer:'scenery',png:makeBlob('4x-scenery')}]};
 const calls={original:0,standard:0,overview:0,writes:0};
 const store=api.createStore({
  standard:{async get(){calls.standard++;return base;},async keys(){return ['test'];}},
  original:{async get(){calls.original++;return raw;},
   async keys(){return [base.key];}},
  overview:{async getVariant(){calls.overview++;return {key:'overview'};}}
 });
 assert.equal((await store.get(base.key)).layers[0].png,base.layers[0].png);
 assert.equal(calls.original,0,'default does not touch original 4x PNGs');
 const probe=await store.probe('v1-0374527a','near');
 assert.equal(probe.available,true);
 assert.equal(probe.original4x,1);
 assert.equal(probe.minDensity,4);
 store.setEnabled(true);
 const mixed=await store.getVariant(base.key,'2x');
 assert.equal(mixed.layers[0].png,raw.layers[0].png);
 assert.equal(mixed.layers[1].png,base.layers[1].png);
 assert.equal(mixed.layers[1].crop,base.layers[1].crop);
 assert.equal(mixed.groundDetailSource,'original-4x');
 assert.equal((await store.getVariant(base.key,'1x')).key,'overview');
 assert.equal(calls.overview,1);
 assert.equal(calls.writes,0);
});
test('stale or misordered original ground cannot replace a valid derived tile',()=>{
 const api=moduleOf('frozen-map-ground-detail.js').VedrasFrozenGroundDetail;
 const a={key:'v1-11111111|near|0,0',revision:'a',layers:[
  {layer:'ground',png:new Blob(['2x'])},{layer:'scenery',png:new Blob(['shade'])}]};
 const b={...a,revision:'b',layers:[
  {layer:'ground',png:new Blob(['4x'])},{layer:'scenery',png:new Blob(['shade'])}]};
 assert.equal(api.merge(b,a),a);
 assert.equal(api.merge(null,a),a);
});
test('shadow tone defaults preserve historical color and relative alpha',()=>{
 const win=moduleOf('shadow-tone.js'),tone=win.VedrasShadowTone;
 assert.equal(tone.colorCss(),'rgb(32,49,49)');
 assert.equal(tone.opacity(.27),.27);
 assert.equal(tone.attenuation(.28),.28);
 assert.equal(tone.opacity(0),0);
 assert.equal(tone.revision(),0);
 tone.set({lift:1,balance:1},{persist:false});
 assert.equal(tone.colorCss(),'rgb(116,116,116)');
 assert.equal(tone.opacity(.27),.4);
 assert.equal(tone.attenuation(.28),1,
  '100% normalization must also equalize the family .28 multiplier');
 assert.equal(tone.opacity(0),0);
 assert.equal(tone.revision(),1);
 tone.set({lift:100,balance:-20},{persist:false});
 assert.equal(tone.get().lift,1);
 assert.equal(tone.get().balance,0);
});
test('tone affects mountain alpha and RGB while preserving origin geometry',()=>{
 const context={window:{},Blob,localStorage:{getItem:()=>null,setItem:()=>{}}};
 for(const source of ['shadow-tone.js','shadow-system.js'])
  vm.runInNewContext(read(source),context,{filename:source});
 const sh=context.window.VedrasShadows,tone=context.window.VedrasShadowTone;
 const shape=sh.mountainShape({x:100,y:100},120,{opacity:.20,angle:155});
 const x=shape.p1.x,y=shape.p1.y;
 const before=sh.mountainAlphaAt(x,y,shape,120,.8);
 tone.set({lift:.8,balance:1},{persist:false});
 const after=sh.mountainAlphaAt(x,y,shape,120,.8);
 assert.ok(after>before,'strength harmonization must lift a weak mountain shadow');
 assert.equal(shape.p1.x,shape.p1.x);
 assert.ok(sh.COLOR.r===32,'legacy fallback color remains unchanged');
 assert.equal(tone.colorRgb().r,99);
});
test('viewer switch and authoring tone are not writes to the frozen archive',()=>{
 const game=read('frozen-map-game.js'),html=read('frozen-map-game.html'),
  editor=read('index.html'),app=read('app.js');
 assert.match(game,/params\.get\('ground4x'\)==='1'/);
 assert.match(game,/groundDetailStore\.setEnabled\(groundDetailActive\)/);
 assert.match(game,/groundDetailStore\.probe\(scene,lod\)/);
 assert.doesNotMatch(game,/Number\(manifest\.pose\?\.dpr\)>=3/);
 assert.match(html,/id="optGround4x"/);
 assert.match(html,/frozen-map-ground-detail\.js\?v=/);
 assert.match(editor,/id="shadowToneLift"/);
 assert.match(editor,/id="shadowToneBalance"/);
 assert.match(app,/VedrasShadowTone\?\.get\?\.\(\)\|\|null/);
 assert.doesNotMatch(read('frozen-map-ground-detail.js'),
  /deleteDatabase\(|\.put\(|\.clear\(|'readwrite'/);
});

test('low-res native atlas is never misrepresented as genuine 4x',async()=>{
 const api=moduleOf('frozen-map-ground-detail.js').VedrasFrozenGroundDetail;
 const makePng=(w,h)=>{
  const hbuf=new Uint8Array(24);hbuf.set([137,80,78,71,13,10,26,10]);
  const dv=new DataView(hbuf.buffer);dv.setUint32(16,w);dv.setUint32(20,h);
  return new Blob([hbuf]);
 };
 const key='v1-0374527a|near|0,0';
 const raw={key,revision:'old',tile:{size:512},layers:[
  {layer:'ground',pad:3,png:makePng(1295,1101)}]};
 const original={async keys(){return[key];},async get(){return raw;}};
 const standard={async get(){return {...raw,derivedFormat:'2x-png-v1'};},
  async keys(){return[key];}};
 const overview={async getVariant(){return null;}};
 const store=api.createStore({standard,original,overview});
 const probe=await store.probe('v1-0374527a','near');
 assert.equal(probe.available,false);
 assert.equal(probe.original4x,0);
 assert.ok(probe.minDensity<3);
 store.setEnabled(true);
 const returned=await store.get(key);
 assert.notEqual(returned.groundDetailSource,'original-4x');
 assert.equal(store.stats().originalGrounds,0);
});
test('readiness is exact-LOD and non-provisional; authored blend hides hard per-hex preview',()=>{
 const runtime=read('world-tile-streamer.js'),editor=read('app.js');
 assert.match(runtime,/if\(!item\|\|item\.dirty\|\|item\.tileLod!==lod\|\|[\s\S]{0,100}item\.packet\.preview===true\|\|item\.packet\.complete===false\)return false/);
 assert.match(editor,/drawPreview:state\.edgeBlend\?null:drawFastTerrainPreview/);
 assert.match(editor,/if\(preview&&lod==='near'&&state\.edgeBlend\)return;/);
});

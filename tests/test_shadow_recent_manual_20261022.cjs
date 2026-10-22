'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
function engine(){
 const sandbox={window:{addEventListener(){}}};
 vm.runInNewContext(read('shadow-shapes.js'),sandbox);
 vm.runInNewContext(read('sprite-shadow-editor.js'),sandbox);
 return {shape:sandbox.window.VedrasManualShadows,
  shadow:sandbox.window.VedrasSpriteShadows};
}
test('recent sprite ordering uses birth timestamp where available, otherwise mtime',()=>{
 const {shape}=engine();
 const entries=[
  {path:'assets/nature/old_maple.png',name:'old_maple.png',category:'nature',mtime:1000,img:{naturalWidth:64}},
  {path:'assets/nature/snow_patch_01.png',name:'snow_patch_01.png',category:'nature',mtime:1500,createdNs:3300,img:{naturalWidth:64}},
  {path:'assets/nature/snow_patch_10.png',name:'snow_patch_10.png',category:'nature',mtime:2400,img:{naturalWidth:64}},
  {path:'assets/nature/missing_timestamp.png',name:'missing_timestamp.png',category:'nature',mtime:0,img:{naturalWidth:64}},
  {path:'assets/nature/removed_maple.png',name:'removed_maple.png',category:'nature',mtime:9999,img:null}
 ];
 const recent=shape.sort(entries,{},'recent').map(x=>x.name);
 assert.deepEqual(Array.from(recent),[
  'snow_patch_01.png','snow_patch_10.png','old_maple.png','missing_timestamp.png'
 ]);
 const newestFiltered=shape.sort(entries,{
  'assets/nature/old_maple.png':{enabled:true}
 },'recent',true);
 assert.equal(newestFiltered.length,3);
 assert.ok(!newestFiltered.some(a=>a.name==='old_maple.png'));
 const names=shape.sort(entries,{},'name').map(x=>x.name);
 assert.equal(names[0],'missing_timestamp.png');
});
test('polygon footprints validate numeric coordinates, limits and multiple contours',()=>{
 const {shape}=engine();
 const outline={mode:'polygons',polygons:[
  [[-.42,.02],[.13,.04],[.1,.27]],
  [[-.3,-.1],[-.1,-.1],[0,.1]]
 ]};
 assert.deepEqual(JSON.stringify(shape.valid(outline)),JSON.stringify(outline));
 for(const bad of [
  {mode:'polygons',polygons:[[[0,0],[1,1]]]},
  {mode:'polygons',polygons:[[[0,0],[4,0],[1,0]]]},
  {mode:'polyline',polygons:[]},
  {mode:'polygons',polygons:[[[0,0],[0,0],[Infinity,1]]]},
  {mode:'polygons',polygons:[[0,1,2]]}
 ])assert.throws(()=>shape.valid(bad));
});
test('v1 shadow profiles remain compatible with manually filled polygons and round-trip JSON',()=>{
 const {shadow}=engine(),before=shadow.defaults();
 const old={...before,profiles:{'assets/nature/tree_01.png':{angle:150,opacity:.32}}};
 shadow.set(old);assert.equal(shadow.profile('assets/nature/tree_01.png').opacity,.32);
 const manual={mode:'polygons',polygons:[
  [[-.3,.04],[.17,.08],[.18,.21]],
  [[-.5,.01],[-.3,.07],[-.2,.18]]
 ]};
 const next={...old,profiles:{...old.profiles,
  'assets/nature/snow_patch_01.png':{opacity:.49,manual}}};
 shadow.set(next);
 const decoded=shadow.valid(JSON.parse(JSON.stringify(shadow.get())));
 assert.deepEqual(JSON.stringify(decoded.profiles['assets/nature/snow_patch_01.png'].manual),
  JSON.stringify(manual));
 assert.equal(decoded.profiles['assets/nature/tree_01.png'].angle,150);
});
test('manual shadows are filled in the live renderer and replace generic silhouette',()=>{
 const {shadow}=engine();const state=shadow.defaults();
 const key='assets/nature/snow_patch_10.png';
 state.profiles[key]={opacity:.5,manual:{
  mode:'polygons',polygons:[[[-.2,0],[.05,0],[.1,.2]],[[-.6,.07],[-.4,.1],[-.3,.17]]]
 }};
 shadow.set(state);
 const log=[];
 const ctx=new Proxy({},{
  get:(target,key)=>{
   if(['save','restore','beginPath','moveTo','lineTo','closePath','fill','translate','scale',
    'drawImage','ellipse','rect','transform','clip'].includes(key))
    return (...args)=>{log.push({key,args});};
   return target[key];
  },
  set:(target,key,value)=>{target[key]=value;return true;}
 });
 shadow.draw(ctx,{asset:{path:key},natureMeta:{kind:'ground_cover'}},
  {x:200,y:170},120,{canvas:{},aspect:1},{x:.5,y:.96},1);
 assert.equal(log.filter(x=>x.key==='fill').length,2);
 assert.equal(log.filter(x=>x.key==='drawImage').length,0);
 assert.deepEqual(log.filter(x=>x.key==='translate')[0].args,[200,170]);
 assert.deepEqual(log.filter(x=>x.key==='scale')[0].args,[120,120]);
});
test('sorting, painter and manual profiles are wired to actual UI and server',()=>{
 const ui=read('index.html'),editor=read('sprite-shadow-editor.js'),
  painter=read('shadow-painter-ui.js'),server=read('server.py');
 for(const id of ['ssSort','ssUnprofiled','ssDrawMode','ssFillContour',
  'ssUndoPoint','ssClearManual','ssNewContour'])assert.match(ui,new RegExp('id="'+id+'"'));
 assert.match(ui,/shadow-shapes\.js\?v=/);
 assert.match(ui,/shadow-painter-ui\.js\?v=/);
 assert.match(editor,/window\.VedrasManualShadows\.sort\(/);
 assert.match(editor,/window\.VedrasManualShadows\.render\(/);
 assert.match(painter,/setPointerCapture/);
 assert.match(painter,/window\.__vedrasShadowEditor/);
 assert.match(server,/key == 'manual' and not allow_strength/);
 assert.match(server,/st_birthtime/);
 assert.match(server,/for alias in \('shadow\.json', 'shadows\.json', 'schatten\.json'\)/);
});

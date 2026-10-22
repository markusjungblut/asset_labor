'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),
 path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function ui(){
 const handlers=new Map(),ready=[],fields={};
 for(const id of ['ssPreview','ssDrawMode','ssNewContour','ssFillContour',
   'ssUndoPoint','ssClearManual','ssDrawStatus']){
  fields[id]={value:id==='ssDrawMode'?'polygon':'',textContent:'',
   width:370,height:260,handlers:new Map(),
   addEventListener(kind,callback){this.handlers.set(kind,callback);},
   getBoundingClientRect:()=>({left:0,top:0,width:370,height:260}),
   setPointerCapture(){},releasePointerCapture(){},hasPointerCapture:()=>false};
 }
 const sandbox={window:{addEventListener:(kind,fn)=>{if(kind==='DOMContentLoaded')ready.push(fn)}},
  document:{getElementById:id=>fields[id]}};
 for(const name of ['shadow-shapes.js','sprite-shadow-editor.js','shadow-painter-ui.js'])
  vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),sandbox);
 const Engine=sandbox.window.VedrasSpriteShadows,asset={
  name:'snow_patch_03.png',category:'nature',path:'assets/nature/snow_patch_03.png'};
 let dirty=0;
 sandbox.window.__vedrasShadowEditor={
  asset:()=>asset,Engine,isMountainAsset:()=>false,
  frame:()=>({p:{x:180,y:130},w:100}),
  modified:()=>{dirty++;},refresh:()=>{},preview:()=>{}
 };
 ready.at(-1)();
 function send(type,x,y){
  const fn=fields.ssPreview.handlers.get(type);
  assert.ok(fn,'missing pointer event '+type);
  fn({pointerId:1,clientX:x,clientY:y,preventDefault(){}});
 }
 function click(id){const fn=fields[id].handlers.get('click');assert.ok(fn);fn();}
 return {Engine,asset,send,click,fields,getDirty:()=>dirty};
}
test('polygon mouse clicks + Fill produce one real editable sprite profile',()=>{
 const i=ui();
 i.send('pointerdown',150,133);i.send('pointerdown',200,133);i.send('pointerdown',200,165);
 i.click('ssFillContour');
 const p=i.Engine.get().profiles[i.asset.path];
 assert.equal(p.manual.mode,'polygons');
 assert.equal(p.manual.polygons.length,1);
 assert.equal(p.manual.polygons[0].length,3);
 assert.ok(i.getDirty()>0);
});
test('manual contour vertices can be dragged, undone and removed',()=>{
 const i=ui();
 for(const [x,y] of [[150,133],[200,133],[200,165]])i.send('pointerdown',x,y);
 i.click('ssFillContour');
 i.fields.ssDrawMode.value='edit';
 const before=i.Engine.get().profiles[i.asset.path].manual.polygons[0][0][0];
 i.send('pointerdown',150,133);
 i.send('pointermove',139,143);
 i.send('pointerup',139,143);
 const after=i.Engine.get().profiles[i.asset.path].manual.polygons[0][0][0];
 assert.notEqual(after,before);
 i.click('ssUndoPoint');
 assert.equal(i.Engine.get().profiles[i.asset.path],undefined);
 i.click('ssClearManual');
 assert.equal(i.Engine.get().profiles[i.asset.path],undefined);
});
test('separate freehand shapes are filled without changing previous polygons',()=>{
 const i=ui();
 for(const [x,y] of [[150,133],[200,133],[200,165]])i.send('pointerdown',x,y);
 i.click('ssFillContour');
 i.fields.ssDrawMode.value='freehand';
 i.send('pointerdown',120,150);
 for(const [x,y] of [[135,150],[155,150],[170,162],[150,190],[130,180]])
  i.send('pointermove',x,y);
 i.send('pointerup',130,180);
 i.click('ssFillContour');
 const p=i.Engine.get().profiles[i.asset.path].manual.polygons;
 assert.equal(p.length,2);
 assert.ok(p[1].length>=3);
 assert.equal(p[0].length,3);
 i.click('ssClearManual');
 assert.equal(i.Engine.get().profiles[i.asset.path],undefined);
});

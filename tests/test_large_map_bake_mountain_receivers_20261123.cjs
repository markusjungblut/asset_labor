'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const R=require('../large-map-bake-mountain-receivers.js');
const here=path.resolve(__dirname,'..');
const owner={item:{type:'mountain',p:{x:100,y:110},
 inst:{q:0,r:0,assetPath:'assets/nature/berg_01.png'}}};
const receiver={item:{type:'accent',p:{x:75,y:100},
 inst:{q:0,r:0,assetPath:'assets/nature/bush_01.png'}},
 img:{naturalWidth:32,naturalHeight:32},
 g:{y:100,left:65,top:80,width:45,height:70,
 b:{sx:0,sy:0,sw:32,sh:32}}};
const cast={owner,shape:{},modelWidth:200,peakAlpha:45,strength:.68,
 box:{left:100,top:100,width:300,height:250},
 canvas:{width:300,height:250}};
const within={mountainAlphaAt:()=>.3};
test('native ground-foot hit, not crown rectangle alone, selects the cast',()=>{
 const obj={...receiver,item:{...receiver.item,p:{x:75,y:100}}};
 const hits=R.select({object:obj,casts:[cast],shadows:within});
 assert.equal(hits.length,1);
 assert.equal(R.select({object:obj,casts:[cast],shadows:{
  mountainAlphaAt:()=>0
 }}).length,0,'sunlit foot protects shaded-looking high crown');
});
test('reject owner cast and preserve the editor southwest large sprite exception',()=>{
 const mountainReceiver={...receiver,item:{type:'mountain',
  inst:{q:-1,r:1,assetPath:'assets/nature/berg_02.png'},p:{x:75,y:100}}};
 assert.equal(R.select({object:mountainReceiver,casts:[cast],
  shadows:within}).length,0);
 const self={...receiver,item:owner.item};
 assert.equal(R.select({object:self,casts:[cast],shadows:within}).length,0);
});
test('opaque PNG body may overlap but cannot be tinted if cast rectangle misses',()=>{
 const shifted={...cast,box:{left:900,top:900,width:100,height:100}};
 assert.equal(R.select({object:receiver,casts:[shifted],
  shadows:within}).length,0);
});
test('threshold is proportional to the actual native alpha, with a one-byte floor',()=>{
 const faint={...cast,peakAlpha:255};
 assert.equal(R.select({object:receiver,casts:[faint],shadows:{
  mountainAlphaAt:()=>.015
 }}).length,0);
 assert.equal(R.select({object:receiver,casts:[faint],shadows:{
  mountainAlphaAt:()=>.09
 }}).length,1);
});
test('source-atop is painted after actual PNG and before foot perspective',()=>{
 const order=[];let canvasId=0;
 function context(id){
  return {setTransform:(...x)=>order.push([id,'setTransform',...x]),
   drawImage:(...x)=>order.push([id,'drawImage',x[0]===receiver.img?
    'original':x[0]===cast.canvas?'native-cast':'composited']),
   save:()=>order.push([id,'save']),
   restore:()=>order.push([id,'restore']),
   translate:()=>order.push([id,'translate']),
   transform:()=>order.push([id,'perspective']),
   set globalCompositeOperation(x){order.push([id,'composite',x]);},
   set globalAlpha(x){},
   set filter(x){}};
 }
 const ctx=context('out');
 const cv=()=>({width:0,height:0,getContext:()=>context('layer'+(++canvasId))});
 const result=R.paint({object:receiver,selected:[cast],ctx,canvasFactory:cv,
  gx:0,gy:0,width:600,height:400});
 assert.equal(result.casts,1);assert.equal(result.sourceAtop,true);
 const rows=order.map(x=>x.slice(0,3).join('/'));
 const idx=x=>rows.findIndex(a=>a.includes(x));
 assert(idx('original')>=0&&idx('source-atop')>idx('original'));
 assert(idx('native-cast')>idx('source-atop'));
 assert(idx('perspective')>idx('native-cast'));
 assert(idx('composited')>idx('perspective'));
});
test('fail closed on missing real caster raster or excessive scratch memory',()=>{
 assert.throws(()=>R.select({object:receiver,casts:[{
  ...cast,canvas:null}],shadows:within}),/Bergschattenmaske/);
 assert.throws(()=>R.paint({object:receiver,selected:[cast],
  ctx:{setTransform:()=>{}},canvasFactory:()=>({}),
  gx:0,gy:0,width:4000,height:4000}),/begrenztes/);
});
test('wiring does not silently enable receiver casts on default scenes',()=>{
 const joint=fs.readFileSync(path.join(here,'large-map-bake-joint-scenery.js'),'utf8');
 const mountain=fs.readFileSync(path.join(here,'large-map-bake-original-mountain-shadows.js'),'utf8');
 const html=fs.readFileSync(path.join(here,'geography-lab.html'),'utf8');
 const seam=fs.readFileSync(path.join(here,'large-map-bake-scenery-seam.js'),'utf8');
 const ci=fs.readFileSync(path.join(here,'.github/workflows/geography-large-bake-ci.yml'),'utf8');
 assert.match(joint,/previewMountainReceivers=false/);
 assert.match(joint,/needsFullEditorReceiverImageParity:true/);
 assert.match(mountain,/captureReceiverCasts=false/);
 assert(html.includes('jointSceneryWithMountainReceivers'));
 assert(html.includes('large-map-bake-mountain-receivers.js'));
 assert.match(seam,/allowReceiverPreview=false/);
 assert(ci.includes('tests/test_large_map_bake_mountain_receivers_20261123.cjs'));
});

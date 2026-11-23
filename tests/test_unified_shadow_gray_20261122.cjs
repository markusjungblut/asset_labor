'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=n=>
 fs.readFileSync(path.join(root,n),'utf8');
const sandbox={window:{addEventListener(){}},
 localStorage:{getItem:()=>null,setItem(){}},
 document:{getElementById:()=>null}};
for(const file of ['shadow-tone.js','shadow-system.js','shadow-shapes.js',
 'sprite-shadow-editor.js'])
 vm.runInNewContext(read(file),sandbox,{filename:file});
const Tone=sandbox.window.VedrasShadowTone,
 Mountains=sandbox.window.VedrasShadows,
 Sprites=sandbox.window.VedrasSpriteShadows;
function context(){
 const ops=[],ctx={
  globalAlpha:1,fillStyle:'',globalCompositeOperation:'source-over',
  save(){},restore(){},translate(){},scale(){},transform(){},
  clip(){},rect(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},
  ellipse(){},fill(){ops.push({kind:'fill',alpha:this.globalAlpha,
   color:this.fillStyle});},
  drawImage(){ops.push({kind:'image',alpha:this.globalAlpha});}
 };
 return {ctx,ops};
}
function sample(gray,kind,manual){
 Tone.set({gray,mountains:true},{persist:false});
 const profile=Sprites.defaults();
 profile.global.strength=.1;profile.global.opacity=.16;
 profile.global.contact=0;profile.global.softness=0;
 profile.profiles={'assets/nature/test.png':{
  opacity:.14,contact:0,softness:0,
  ...(manual?{manual:{mode:'polygons',polygons:[
   [[-0.2,-0.4],[0.2,-0.4],[0.2,-0.1],[-0.2,-0.1]]
  ]}}:{})
 }};
 Sprites.set(profile);
 const {ctx,ops}=context();
 Sprites.draw(ctx,{asset:{path:'assets/nature/test.png'},
  natureMeta:{kind,family:kind==='ground_cover'?'snow_fallen_logs':'broadleaf'}},
  {x:0,y:0},90,{canvas:{},aspect:1},{x:.5,y:.96},.1);
 const preferred=manual?'fill':'image';
 const draw=ops.find(o=>o.kind===preferred);
 assert.ok(draw,'shadow must render '+preferred+' path');
 return draw.alpha;
}
test('common gray overrides manually drawn and automatic cast alpha across families',()=>{
 for(const gray of [0,50,100]){
  const target=.12+.88*gray/100;
  for(const kind of ['rock','ground_cover','tree'])
   for(const manual of [true,false]){
    const actual=sample(gray,kind,manual);
    assert.ok(Math.abs(actual-target)<1e-9,
     'gray '+gray+' '+kind+' manual '+manual+
      ': received '+actual+' expected '+target);
   }
 }
});
test('ordinary shadow pass is opaque while mountains remain independently configured',()=>{
 for(const gray of [0,50,100]){
  Tone.set({gray,mountains:true},{persist:false});
  const expected=Tone.targetAlpha('sprite');
  assert.equal(Tone.withMaskPass(()=>Tone.targetAlpha('sprite')),1);
  assert.equal(Tone.targetAlpha('sprite'),expected);
  assert.equal(Tone.withMaskPass(()=>Tone.targetAlpha('mountain')),expected,
   'mountain strength must remain outside the ordinary mask');
  Tone.set({gray,mountains:false},{persist:false});
  assert.equal(Tone.withMaskPass(()=>Tone.targetAlpha('mountain')),null,
   'mountain opt-out must remain independent of ordinary union');
 }
 assert.throws(()=>Tone.withMaskPass(()=>{throw Error('intentional');}),/intentional/);
 assert.equal(Tone.inMaskPass(),false,'mask state restored after error');
 const app=read('app.js'),editor=read('sprite-shadow-editor.js');
 assert.ok(app.includes('paintUnifiedNormalShadows(()=>{'),
  'all ordinary shadow families must enter the shared layer');
 assert.ok(app.includes("original.globalAlpha=tone.targetAlpha('sprite')"),
  'common opacity must be applied only to the final layer');
 assert.ok(app.indexOf('drawMountainShadows(objs);')<
  app.indexOf('paintUnifiedNormalShadows(()=>{'),
  'mountains must stay independent of the normal union');
 assert.ok(editor.includes('window.VedrasShadowTone?.inMaskPass?.()===true'),
  'cached normal stamps must not reuse non-mask opacity');
});
test('mountain distance field has the same peak, or independent authored intensity',()=>{
 const shape=Mountains.mountainShape({x:160,y:100},150,
  {angle:155,opacity:.21,softness:1});
 for(const gray of [0,50,100]){
  Tone.set({gray,mountains:true},{persist:false});
  const peak=Mountains.mountainAlphaAt(shape.p1.x,shape.p1.y,shape,150,.1);
  assert.ok(Math.abs(peak-Tone.targetAlpha('sprite'))<1e-9,
   'mountain must ignore old .21 opacity and .1 global strength');
 }
 Tone.set({gray:100,mountains:false,balance:1},{persist:false});
 assert.equal(Tone.targetAlpha('mountain'),null);
 assert.deepEqual(JSON.parse(JSON.stringify(Tone.colorRgb('mountain'))),
  {r:32,g:49,b:49});
 const legacy=Mountains.mountainAlphaAt(shape.p1.x,shape.p1.y,shape,150,.1);
 assert.ok(legacy>0&&legacy<.03,'mountain keeps original strength when unchecked');
});
test('UI and frozen atlas record both properties without mutating sprite profile schema',()=>{
 const html=read('index.html'),editor=read('sprite-shadow-editor.js'),
  app=read('app.js'),runtime=read('frozen-map-runtime.js');
 assert(html.includes('id="shadowGrayLevel"'));
 assert(html.includes('id="shadowGrayMountains"'));
 assert(html.indexOf('id="shadowGrayLevel"')<html.indexOf('id="ssPreview"'),
  'primary gray slider must be immediately visible above sprite preview');
 assert(editor.includes('core.invalidateScenery?.()'));
 assert(editor.includes('node.disabled=true'));
 assert(app.includes('existing.shadowTone?.gray!==tone.gray'));
 assert(app.includes('existing.shadowTone?.mountains!==tone.mountains'));
 assert(runtime.includes('mountains:shadowTone.mountains!==false'));
 assert(runtime.includes('Math.min(100,Number(shadowTone.gray))'));
 const profiles=Sprites.defaults();
 assert.equal(profiles.schemaVersion,1,'legacy profile schema is unchanged');
 assert.deepEqual(Object.keys(profiles.global).sort(),
  Object.keys(Sprites.fields).sort());
});

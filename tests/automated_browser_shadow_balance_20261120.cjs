'use strict';
/* Real Firefox canvas pixel regression for authored shadow opacity.
 * Synthetic, controlled alpha masks – no user IndexedDB or asset mutation.
 * 2x and 4x rendered with the same authored source and world geometry.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const OUTPUT=process.env.VEDRAS_CI_ARTIFACTS||path.join(root,'test-artifacts');
const BROWSER=process.env.VEDRAS_CI_BROWSER||'firefox';
(async()=>{
 fs.mkdirSync(OUTPUT,{recursive:true});
 const browser=await require('playwright')[BROWSER].launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:900,height:650}});
  await page.goto('about:blank');
  for(const source of ['shadow-tone.js','shadow-system.js',
   'shadow-shapes.js','sprite-shadow-editor.js'])
   await page.addScriptTag({content:fs.readFileSync(path.join(root,source),'utf8')});
  const result=await page.evaluate(()=>{
   const tone=window.VedrasShadowTone,
    sprites=window.VedrasSpriteShadows,
    mountains=window.VedrasShadows;
   function render(balance,scale,kind='rock'){
    tone.set({balance},{persist:false});
    const profile=sprites.defaults();
    profile.global.strength=1;
    profile.global.opacity=.22;
    profile.global.contact=0;
    profile.global.softness=0;
    profile.profiles={
     'assets/nature/ci.png':{
      opacity:.22,contact:0,softness:0,
      manual:{mode:'polygons',polygons:[
       [[-.25,-.40],[.25,-.40],[.25,-.10],[-.25,-.10]]
      ]}
     }
    };
    sprites.set(profile);
    const c=document.createElement('canvas');
    c.width=300*scale;c.height=210*scale;
    const g=c.getContext('2d',{alpha:true,willReadFrequently:true});
    g.scale(scale,scale);
    const shape={canvas:document.createElement('canvas'),aspect:1};
    shape.canvas.width=16;shape.canvas.height=16;
    const o={asset:{path:'assets/nature/ci.png'},
     natureMeta:{kind}};
    sprites.draw(g,o,{x:135,y:110},90,shape,{x:.5,y:.96},1);
    const q=g.getImageData(135*scale,83*scale,1,1).data;
    const mountainCanvas=document.createElement('canvas');
    mountainCanvas.width=300*scale;mountainCanvas.height=210*scale;
    const m=mountainCanvas.getContext('2d',{alpha:true});
    const painted=mountains.paintMountain(m,
     {x:135*scale,y:125*scale},90*scale,
     {opacity:.22,softness:1*scale,angle:155,length:1.10},1);
    const pixelTone=mountains.COLOR;
    return {balance,scale,kind,
     castAlpha:q[3],castRgb:[q[0],q[1],q[2]],
     mountainPeak:painted?.maxAlpha??0,shadowRgb:pixelTone};
   }
   const samples=[];
   for(const balance of [0,1])for(const scale of [2,4]){
    samples.push(render(balance,scale,'rock'));
    samples.push(render(balance,scale,'ground_cover'));
   }
   return {samples,referenceRgb:tone.colorRgb(),raster:'firefox-native-canvas'};
  });
  const find=(b,s,k)=>result.samples.find(x=>x.balance===b&&x.scale===s&&x.kind===k);
  for(const k of ['rock','ground_cover']){
   const two=find(1,2,k),four=find(1,4,k);
   assert.ok(two.castAlpha>100,
    'Fully balanced cast must be visibly present: '+JSON.stringify(two));
   assert.ok(Math.abs(two.castAlpha-four.castAlpha)<=3,
    '2x and 4x authored shadow density diverged: '+k);
  }
  assert.ok(find(0,2,'ground_cover').castAlpha<
   find(0,2,'rock').castAlpha*.5,
   'Off state must preserve intentional historical ground-cover attenuation');
  assert.ok(Math.abs(find(1,2,'ground_cover').castAlpha-
   find(1,2,'rock').castAlpha)<=3,
   'Full equalization must override ground-cover family attenuation');
  for(const scale of [2,4]){
   const row=find(1,scale,'rock');
   assert.ok(row.mountainPeak>100,'Mountain alpha must not disappear');
   assert.ok(Math.abs(row.mountainPeak-row.castAlpha)<=15,
    'Mountain and sprite tonal peak diverged after equalization: '+
    JSON.stringify(row));
  }
  assert.equal(result.referenceRgb.r,32);
  fs.writeFileSync(path.join(OUTPUT,'firefox-shadow-tone-2x-4x.json'),
   JSON.stringify(result,null,2));
  console.log('Rendered shadow alpha samples:',JSON.stringify(result.samples));
  await page.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

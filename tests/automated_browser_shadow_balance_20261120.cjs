'use strict';
/* Real Firefox Canvas2D pixel regression for ONE absolute cast tone.
 * All three sprite families and mountains are compared at 0/50/100 in
 * 2x/4x without altering any user's IndexedDB or source artwork. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const OUTPUT=process.env.VEDRAS_CI_ARTIFACTS||path.join(ROOT,'test-artifacts');
const BROWSER=process.env.VEDRAS_CI_BROWSER||'firefox';
(async()=>{
 fs.mkdirSync(OUTPUT,{recursive:true});
 const browser=await require('playwright')[BROWSER].launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:900,height:650}});
  const errors=[];page.on('pageerror',err=>errors.push(String(err)));
  await page.goto('about:blank');
  for(const name of ['shadow-tone.js','shadow-system.js','shadow-shapes.js',
   'sprite-shadow-editor.js'])
   await page.addScriptTag({content:fs.readFileSync(path.join(ROOT,name),'utf8')});
  const result=await page.evaluate(()=>{
   const Tone=window.VedrasShadowTone,Sprites=window.VedrasSpriteShadows,
    Mountains=window.VedrasShadows;
   function solidSilhouette(){
    const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
    const g=canvas.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,64,64);
    return {canvas,aspect:1};
   }
   const mask=solidSilhouette();
   const manual={mode:'polygons',polygons:[
    [[-.25,-.40],[.25,-.40],[.25,-.10],[-.25,-.10]]
   ]};
   function render(gray,scale,kind){
    Tone.set({...Tone.get(),gray,mountains:true},{persist:false});
    const profile=Sprites.defaults();
    profile.global.strength=1;profile.global.opacity=.22;
    profile.global.contact=0;profile.global.softness=0;
    profile.profiles={'assets/nature/ci.png':{
     opacity:.22,contact:0,softness:0,
     ...(kind==='automatic'?{}:{manual})
    }};
    Sprites.set(profile);
    const canvas=document.createElement('canvas');
    canvas.width=300*scale;canvas.height=210*scale;
    const g=canvas.getContext('2d',{alpha:true,willReadFrequently:true});
    g.scale(scale,scale);
    Sprites.draw(g,{asset:{path:'assets/nature/ci.png'},
     natureMeta:{kind:kind==='ground_cover'?'ground_cover':'rock'}},
     {x:135,y:110},90,mask,{x:.5,y:.96},1);
    const pixels=g.getImageData(0,0,canvas.width,canvas.height).data;
    let maxAlpha=0,firstRgb=null;
    for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]>maxAlpha){
     maxAlpha=pixels[i+3];firstRgb=[pixels[i],pixels[i+1],pixels[i+2]];
    }
    const mountainCanvas=document.createElement('canvas');
    mountainCanvas.width=300*scale;mountainCanvas.height=210*scale;
    const m=mountainCanvas.getContext('2d',{alpha:true,willReadFrequently:true});
    const shape={opacity:.22,softness:1*scale,angle:155,length:1.10};
    const painted=Mountains.paintMountain(m,{x:135*scale,y:125*scale},
     90*scale,shape,1);
    return {gray,scale,kind,castAlpha:maxAlpha,castRgb:firstRgb,
     mountainPeak:painted?.maxAlpha??0,
     geometry:Mountains.mountainShape({x:0,y:0},90,shape).p2};
   }
   const samples=[];
   for(const gray of [0,50,100])for(const scale of [2,4])
    for(const kind of ['rock','ground_cover','automatic'])
     samples.push(render(gray,scale,kind));
   function overlapCheck(gray,scale){
    Tone.set({gray,mountains:true},{persist:false});
    const settings=Sprites.defaults();
    settings.global.strength=1;settings.global.opacity=.2;
    settings.profiles={'assets/nature/overlap.png':{
     opacity:.2,contact:0,softness:0,
     manual:{mode:'polygons',polygons:[
      [[-.3,-.35],[.3,-.35],[.3,-.05],[-.3,-.05]]
     ]}
    }};
    Sprites.set(settings);
    function sample(count){
     const layer=document.createElement('canvas');
     layer.width=280*scale;layer.height=180*scale;
     const c=layer.getContext('2d',{alpha:true});
     c.scale(scale,scale);
     Tone.withMaskPass(()=>{
      for(let i=0;i<count;i++)
       Sprites.draw(c,{asset:{path:'assets/nature/overlap.png'},
        natureMeta:{kind:'rock',family:'broadleaf'}},
        {x:135,y:95},85,mask,{x:.5,y:.96},1);
     });
     const out=document.createElement('canvas');
     out.width=layer.width;out.height=layer.height;
     const g=out.getContext('2d',{alpha:true,willReadFrequently:true});
     g.globalAlpha=Tone.targetAlpha('sprite');
     g.drawImage(layer,0,0);
     const pixels=g.getImageData(0,0,out.width,out.height).data;
     let peak=0;
     for(let i=3;i<pixels.length;i+=4)peak=Math.max(peak,pixels[i]);
     return peak;
    }
    return {gray,scale,one:sample(1),two:sample(2),four:sample(4)};
   }
   const overlaps=[];
   for(const gray of [0,50,100])for(const scale of [2,4])
    overlaps.push(overlapCheck(gray,scale));
   Tone.set({...Tone.get(),gray:100,mountains:false,balance:1},
    {persist:false});
   const offCanvas=document.createElement('canvas');
   offCanvas.width=600;offCanvas.height=420;
   const optOut=Mountains.paintMountain(offCanvas.getContext('2d'),
    {x:270,y:250},180,{opacity:.22,softness:2,angle:155,length:1.1},1);
   return {samples,overlaps,optOut:{peak:optOut?.maxAlpha,
    color:Tone.colorRgb('mountain')},
    spriteColor:Tone.colorRgb('sprite')};
  });
  for(const gray of [0,50,100]){
   const target=Math.round(255*(.12+.88*gray/100));
   for(const scale of [2,4]){
    const row=result.samples.filter(s=>s.gray===gray&&s.scale===scale);
    assert.equal(row.length,3);
    for(const sample of row){
     assert.ok(Math.abs(sample.castAlpha-target)<=5,
      'Manual/automatic/cover casts must share one exact opacity: '+
       JSON.stringify({target,sample}));
     assert.ok(Math.abs(sample.mountainPeak-target)<=7,
      'Mountain peak must match other casts at all gray levels: '+
       JSON.stringify({target,sample}));
     assert.deepEqual(sample.castRgb,[0,0,0],
      'All casts use neutral black, not tinted green/blue');
    }
   }
   const two=result.samples.filter(s=>s.gray===gray&&s.scale===2);
   const four=result.samples.filter(s=>s.gray===gray&&s.scale===4);
   for(const k of ['rock','ground_cover','automatic']){
    const a=two.find(s=>s.kind===k),b=four.find(s=>s.kind===k);
    assert.ok(Math.abs(a.castAlpha-b.castAlpha)<=3,'2x/4x shadow difference '+k);
   }
  }
  for(const o of result.overlaps){
   const target=Math.round(255*(.12+.88*o.gray/100));
   assert.ok(Math.abs(o.one-target)<=5,
    'a single ordinary shadow reaches configured tone');
   assert.ok(Math.abs(o.two-o.one)<=1,
    'two overlapping ordinary shadows must not darken');
   assert.ok(Math.abs(o.four-o.one)<=1,
    'four overlapping ordinary shadows must not darken');
  }
  assert.ok(result.optOut.peak>0&&result.optOut.peak<115,
   'Unchecked mountains keep their original authored weak opacity');
  assert.deepEqual(result.optOut.color,{r:32,g:49,b:49},
   'Unchecked mountains keep their original neutral green-black tone');
  assert.deepEqual(result.spriteColor,{r:0,g:0,b:0});
  assert.deepEqual(errors,[],'Firefox page errors');
  fs.writeFileSync(path.join(OUTPUT,'firefox-shadow-gray-0-50-100.json'),
   JSON.stringify(result,null,2));
  console.log('Shadow gray 0/50/100 pixel samples:',JSON.stringify(result.samples));
  await page.close();
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});

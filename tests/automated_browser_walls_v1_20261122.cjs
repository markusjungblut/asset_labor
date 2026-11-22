'use strict';
/* A real Firefox Canvas2D 2x/4x smoke of all six upright hex-edge wall
 * orientations and their unified left-cast shadows. No user's asset needed. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const ART=process.env.VEDRAS_CI_ARTIFACTS||path.join(ROOT,'test-artifacts');
(async()=>{
 fs.mkdirSync(ART,{recursive:true});
 const browser=await require('playwright').firefox.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:740}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('about:blank');
  for(const name of ['river.js','shadow-tone.js','walls.js'])
   await page.addScriptTag({content:fs.readFileSync(path.join(ROOT,name),'utf8')});
  const outcome=await page.evaluate(()=>{
   const W=window.VedrasWalls,T=window.VedrasShadowTone;
   const total=[];
   function run(scale,kind,repeat=1,angle=160){
    T.set({gray:50,mountains:true},{persist:false});
    const a=document.createElement('canvas');a.width=520*scale;a.height=390*scale;
    const mask=a.getContext('2d',{willReadFrequently:true});
    mask.setTransform(scale,0,0,scale,0,0);
    const project=(x,y)=>({x:260+x*.65,y:190+y*.65});
    const edges=W.DIRS.map(([dq,dr])=>({a:[0,0],b:[dq,dr],kind}));
    T.withMaskPass(()=>{
     for(let times=0;times<repeat;times++)
      for(const edge of edges)W.drawShadow(mask,edge,project,.65,{angle,length:1.05,softness:4});
    });
    const out=document.createElement('canvas');out.width=a.width;out.height=a.height;
    const g=out.getContext('2d',{willReadFrequently:true});
    g.globalAlpha=T.targetAlpha('sprite');g.drawImage(a,0,0);
    const px=g.getImageData(0,0,out.width,out.height).data;
    let max=0,positive=0,checksum=0;
    for(let i=3;i<px.length;i+=4){
     max=Math.max(max,px[i]);if(px[i]>0)positive++;
     if((i>>2)%101===0)checksum+=px[i];
    }
    const castChecks={max,positive,checksum};
    g.globalAlpha=1;g.setTransform(scale,0,0,scale,0,0);
    for(const edge of edges)W.draw(g,edge,project,.65);
    const composite=g.getImageData(0,0,out.width,out.height).data;
    let painted=0;
    for(let i=3;i<composite.length;i+=4)if(composite[i]>0)painted++;
    if(scale===2&&kind==='stone'&&repeat===1&&angle===160){
     out.style.maxWidth='96%';out.style.height='auto';
     document.body.append(out);
    }
    return {scale,kind,repeat,angle,...castChecks,painted};
   }
   for(const kind of ['stone','palisade'])for(const scale of [2,4])
    for(const repeat of [1,2])total.push(run(scale,kind,repeat));
   const different=run(2,'stone',1,200);
   return {samples:total,rotated:different};
  });
  assert.deepEqual(errors,[],'Firefox runtime error');
  assert.equal(outcome.samples.length,8);
  for(const row of outcome.samples){
   assert(row.max>=140&&row.max<=145,
    'all casts use exactly gray50 common alpha; '+JSON.stringify(row));
   assert(row.positive>700,'cast has visible nonempty area');
   assert(row.painted>row.positive,'wall is drawn above its ground cast');
  }
  for(const kind of ['stone','palisade'])for(const scale of [2,4]){
   const a=outcome.samples.find(v=>v.kind===kind&&v.scale===scale&&v.repeat===1);
   const b=outcome.samples.find(v=>v.kind===kind&&v.scale===scale&&v.repeat===2);
   assert.equal(a.max,b.max,'shadow overlap never increases peak opacity');
  }
  assert.notEqual(outcome.rotated.checksum,
   outcome.samples.find(x=>x.scale===2&&x.kind==='stone'&&x.repeat===1).checksum,
   'wall shadow geometry follows edited global sprite angle');
  await page.screenshot({path:path.join(ART,'wall-v1-six-directions-shadow.png')});
  process.stdout.write('Wall v1 Firefox six-direction 2x/4x shadows PASS\n');
 }finally{await browser.close();}
})().catch(e=>{process.stderr.write(String(e.stack||e)+'\n');process.exitCode=1;});
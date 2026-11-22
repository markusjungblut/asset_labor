'use strict';
/* Real Firefox test for an exported tall mountain crossing a 512-world
 * scenery boundary, with leftward shadow and a tree rooted on the next tile.
 * Runs in isolated memory; never touches the user's saved IndexedDB atlas. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const OUT=process.env.VEDRAS_CI_ARTIFACTS||path.join(ROOT,'test-artifacts');
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const {firefox}=require('playwright'),browser=await firefox.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:740}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e.message||e)));
  await page.goto('about:blank');
  await page.evaluate(()=>{window.VedrasCloudsDisabled=true;});
  await page.addScriptTag({content:fs.readFileSync(path.join(ROOT,'frozen-map-runtime.js'),'utf8')});
  const result=await page.evaluate(async()=>{
   const F=window.VedrasFrozenMap,store=F.memoryStore(),scene='v1-1a2b3c4d';
   const png=c=>new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('toBlob failed')),'image/png'));
   const tileIds=[0,1];
   for(const tx of tileIds){
    const t={id:tx+',0',x:tx*512,y:0,size:512};
    const ground=document.createElement('canvas');
    ground.width=512;ground.height=Math.round(512*.85);
    ground.getContext('2d').fillRect(0,0,512,ground.height);
    const scenery=document.createElement('canvas');
    scenery.width=768;scenery.height=Math.round(768*.85);
    const g=scenery.getContext('2d',{alpha:true});
    // Each padded source bakes the SAME world scene, not only objects
    // whose ground anchors belong to this source tile.
    const sx=x=>x-t.x+128,sy=y=>(y+128)*.85;
    g.fillStyle='rgba(0,0,0,.30)';
    g.fillRect(sx(350),sy(380),330,34);
    g.fillStyle='#b8aba1';
    g.fillRect(sx(290),sy(108),440,235*.85);
    // Tree rooted in tile 1, but its crown enters tile 0. It must
    // appear IN FRONT of the mountain on both sides of the tile seam.
    g.fillStyle='#12d34d';
    g.fillRect(sx(480),sy(208),140,144*.85);
    await store.put({
     key:scene+'|near|'+t.id,sceneKey:scene,level:'near',
     tile:t,revision:'world-core-v2',
     layers:[{layer:'ground',pad:0,png:await png(ground)},
      {layer:'scenery',pad:128,coreOnly:true,png:await png(scenery)}]
    });
   }
   const canvas=document.createElement('canvas');
   canvas.style.width='1280px';canvas.style.height='740px';
   document.body.style.margin='0';document.body.append(canvas);
   const player=F.create({canvas,storage:store,useLayerCache:false,
    maxDecodedPixels:10000000,overview1x:false});
   await player.load(scene,'near',{zoom:1,panX:-512,panY:-212.5,dpr:1,
    projectY:.85},[{q:0,r:0,x:520,y:250,radius:35,visibility:'visible'}],
    {expectedTiles:2});
   for(let k=0;k<140;k++){
    player.draw();
    if(player.report().decoded>=2)break;
    await new Promise(resolve=>setTimeout(resolve,25));
   }
   const report=player.report();
   player.draw();
   const ctx=canvas.getContext('2d',{willReadFrequently:true});
   const sample=(x,y)=>{
    const sx=Math.round(1280/2-512+x),sy=Math.round(740/2-212.5+y*.85);
    return [...ctx.getImageData(sx,sy,1,1).data];
   };
   return {report:{saved:report.saved,decoded:report.decoded,failures:report.failures},
    outside:sample(700,180),front:sample(500,265),back:sample(670,250),
    shadowLeft:sample(498,398),shadowRight:sample(526,398),
    blank:sample(815,398)};
  });
  assert.deepEqual(errors,[],'viewer JavaScript must not throw');
  assert.equal(result.report.saved,2);
  assert.equal(result.report.decoded,2,'both authored tiles must decode');
  assert.equal(result.report.failures,0);
  const green=p=>p[1]>140&&p[0]<70;
  const stone=p=>p[0]>130&&p[1]>110&&p[2]>90;
  assert(green(result.front),'tree canopy entering the adjacent tile must stay in front of mountain');
  assert(stone(result.back),'mountain remains complete on neighboring tile');
  assert(stone(result.outside),'fully visible map must not clip mountain outside a tiny authored-hex silhouette');
  assert(Math.abs(result.shadowLeft[0]-result.shadowRight[0])<=2,
   'leftward cast must not double-darken on either side of tile 0/1 boundary: '+JSON.stringify(result));
  assert(result.shadowLeft[0]<result.blank[0],
   'ground shadow is visible on both sides of the seam');
  process.stdout.write('Frozen mountain world-core + shadow + tree depth Firefox PASS '+JSON.stringify(result)+'\n');
 }finally{await browser.close();}
})().catch(error=>{process.stderr.write(String(error.stack||error)+'\n');process.exitCode=1;});
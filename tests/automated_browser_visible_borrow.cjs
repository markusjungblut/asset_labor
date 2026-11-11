'use strict';
/* Firefox Canvas/Bitmap time-to-third-visible-tile A/B, no private atlas. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),BROWSER=process.env.VEDRAS_CI_BROWSER||'firefox',
 OUTPUT=process.env.VEDRAS_CI_ARTIFACTS||path.join(root,'test-artifacts');
const policy=fs.readFileSync(path.join(root,'frozen-map-view-policy.js'),'utf8'),
 runtime=fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8');
const median=a=>[...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];
async function measure(){
 fs.mkdirSync(OUTPUT,{recursive:true});
 const engine=require('playwright')[BROWSER];
 assert.ok(engine,'Unsupported browser engine');
 const browser=await engine.launch({headless:true});
 const results=[],pageErrors=[];
 try{
  const context=await browser.newContext({
   viewport:{width:520,height:360},deviceScaleFactor:1,reducedMotion:'reduce'
  });
  for(const enabled of [false,true,true,false,false,true]){
   const page=await context.newPage();
   page.on('pageerror',err=>pageErrors.push(String(err.message||err)));
   try{
    await page.setContent('<!doctype html><canvas id="game" '+
     'style="width:400px;height:240px"></canvas>');
    await page.addScriptTag({content:policy});
    await page.addScriptTag({content:runtime});
    const sample=await page.evaluate(async(enabled)=>{
     const canvas=document.getElementById('game'),scene='v1-12345678',
      wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
     const tileImg=document.createElement('canvas');
     tileImg.width=32;tileImg.height=32;
     const g=tileImg.getContext('2d');
     g.fillStyle='#3c8a62';g.fillRect(0,0,32,32);
     g.fillStyle='#d5b274';g.fillRect(3,3,24,24);
     const original=await new Promise((resolve,reject)=>
      tileImg.toBlob(b=>b?resolve(b):reject(Error('Canvas PNG encode failed')),
       'image/png'));
     const blobIds=new WeakMap(),imageIds=new WeakMap(),
      records=new Map(),pending=new Map(),getStarts=[];
     for(let ix=-7;ix<=7;ix++)for(let iy=-4;iy<=4;iy++){
      const id=ix+','+iy,key=scene+'|near|'+id,
       ground=new Blob([original],{type:'image/png'}),
       scenery=new Blob([original],{type:'image/png'});
      blobIds.set(ground,key);blobIds.set(scenery,key);
      records.set(key,{key,sceneKey:scene,level:'near',
       tile:{id,x:ix*512,y:iy*512,size:512},
       layers:[{layer:'ground',pad:3,png:ground},
        {layer:'scenery',pad:128,png:scenery}]});
     }
     let phase='warm',track=false;
     const drawn=new Set();
     const originalDraw=CanvasRenderingContext2D.prototype.drawImage;
     CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
      if(track&&this.canvas===canvas){
       const key=imageIds.get(image);if(key)drawn.add(key);
      }
      return originalDraw.call(this,image,...args);
     };
     const storage={
      keys:async prefix=>[...records.keys()].filter(x=>x.startsWith(prefix)),
      get:key=>{
       getStarts.push({key,phase,t:performance.now()});
       if(phase==='warm')return new Promise(resolve=>
        pending.set(key,()=>{
         pending.delete(key);resolve(records.get(key));
        }));
       return new Promise(resolve=>setTimeout(()=>resolve(records.get(key)),95));
      }
     };
     const player=window.VedrasFrozenMap.create({
      canvas,storage,visibleBorrow:enabled,prefetchGuard:true,
      directionalPrefetch:false,overview1x:false,lodRecency:true,
      useLayerCache:false,maxDecodedPixels:30000000,
      decode:async blob=>{
       const image=await createImageBitmap(blob);
       imageIds.set(image,blobIds.get(blob));
       return image;
      }
     });
     try{
      const cells=[
       {q:0,r:0,x:0,y:0,radius:195,visibility:'visible'},
       {q:14,r:0,x:3584,y:0,radius:560,visibility:'visible'}];
      await player.load(scene,'near',
       {zoom:.85,panX:0,panY:0,projectY:.85,dpr:1.25},cells);
      let warm=false;
      for(let i=0;i<50;i++){
       player.draw();await wait(8);
       const r=player.report();
       if(r.decoded>=4&&r.activePrefetch===1&&r.pending===1){
        warm=true;break;
       }
       for(const finish of [...pending.values()])finish();
       await wait(8);
      }
      if(!warm)throw Error('Cannot establish warm visible + held prefetch');
      const oldPrefetch=[...pending.keys()];
      if(oldPrefetch.length!==1)throw Error('Not exactly 1 held prefetch');
      const before=player.report(),oldCount=getStarts.length;
      phase='pan';track=true;
      const start=performance.now();
      player.setPose({panX:-3200});player.draw();
      await Promise.resolve();await Promise.resolve();
      const immediate=player.report();
      let thirdMs=null;
      for(let i=0;i<190;i++){
       if(drawn.size>=3){thirdMs=performance.now()-start;break;}
       await wait(9);player.draw();
      }
      if(thirdMs===null)throw Error('Third tile never painted within 1.7 s');
      const afterThird=player.report(),threeIds=[...drawn].slice(0,3);
      for(const finish of [...pending.values()])finish();
      for(let i=0;i<130;i++){
       player.draw();await wait(6);
       const r=player.report();
       if(r.pending===0&&drawn.size>=4)break;
      }
      player.draw();
      const final=player.report(),
       pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
      let hash=2166136261>>>0,nonBlank=0;
      for(let i=0;i<pixels.length;i++){
       hash=Math.imul(hash^pixels[i],16777619)>>>0;
       if(i%4===0&&pixels[i]!==191)nonBlank++;
      }
      return {
       enabled,thirdPaintMs:+thirdMs.toFixed(2),
       firstThree:threeIds.map(k=>k.split('|').at(-1)),
       immediateVisibleStarts:immediate.visibleReadStarts-before.visibleReadStarts,
       actualVisibleStartsAtThird:afterThird.visibleReadStarts-before.visibleReadStarts,
       borrowed:afterThird.visibleBorrowStarts-before.visibleBorrowStarts,
       peak:afterThird.peakInFlight,
       prefetchedAtStart:before.activePrefetch,
       pendingAtThird:afterThird.pending,
       failures:afterThird.failures,pendingAfter:final.pending,
       paintedTiles:drawn.size,pixelHash:hash.toString(16).padStart(8,'0'),
       nonBlankPixels:nonBlank,newStorageGets:getStarts.length-oldCount,
       heldPrefetch:oldPrefetch[0].split('|').at(-1)
      };
     }finally{
      player.stop();
      for(const finish of [...pending.values()])finish();
      CanvasRenderingContext2D.prototype.drawImage=originalDraw;
     }
    },enabled);
    results.push(sample);
    process.stdout.write('Step25V sample '+JSON.stringify(sample)+'\n');
   }finally{await page.close();}
  }
  assert.deepEqual(pageErrors,[],'Real-browser JS errors');
  const on=results.filter(x=>x.enabled),off=results.filter(x=>!x.enabled);
  for(const r of results){
   assert.equal(r.prefetchedAtStart,1);
   assert.equal(r.failures,0);
   assert.ok(r.nonBlankPixels>0,'Real bitmap must paint on Canvas');
   // A settled visible viewport can still maintain an offscreen prefetch.
   // That background read is not evidence of a missing visible bitmap.
   assert.ok(r.paintedTiles>=4,'At least 4 target tiles painted');
   assert.ok(r.thirdPaintMs>0&&r.thirdPaintMs<1700);
   assert.equal(r.immediateVisibleStarts,r.enabled?3:2);
   assert.equal(r.borrowed,r.enabled?1:0);
   assert.equal(r.peak,r.enabled?4:3);
  }
  assert.equal(new Set(results.map(x=>x.pixelHash)).size,1,
   'Final browser canvas pixels must be identical with/without borrowing');
  const onTimes=on.map(x=>x.thirdPaintMs),offTimes=off.map(x=>x.thirdPaintMs);
  const onMedian=median(onTimes),offMedian=median(offTimes),
   gain=offMedian-onMedian;
  assert.ok(gain>=35,'No reliable paint latency improvement: '+
   JSON.stringify({gain,onTimes,offTimes}));
  const output={schema:'vedras-step25v-delayed-tile-first-paint-v1',
   fixture:'135 real browser PNG bitmaps; 95ms delayed synthetic storage.get',
   browser:BROWSER,results,onTimes,offTimes,onMedian,offMedian,
   medianGainMs:+gain.toFixed(2),sameFinalPixels:true,passed:true};
  fs.writeFileSync(path.join(OUTPUT,BROWSER+'-visible-borrow-summary.json'),
   JSON.stringify(output,null,2));
  process.stdout.write(JSON.stringify({passed:true,onMedianMs:onMedian,
   offMedianMs:offMedian,medianGainMs:+gain.toFixed(2),
   pixelHash:results[0].pixelHash,samples:results.length})+'\n');
 }finally{await browser.close();}
}
measure().catch(e=>{process.stderr.write(String(e.stack||e)+'\n');
 process.exitCode=1;});

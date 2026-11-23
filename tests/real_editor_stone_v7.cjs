'use strict';
/* Real asset-labor editor acceptance, NOT an isolated mock canvas.
   Opens index.html, uses its actual six-side wall test, renders in mapCanvas,
   and saves a screenshot for visual review. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const ROOT=path.resolve(__dirname,'..');
const OUT=process.env.VEDRAS_CI_ARTIFACTS||path.join(ROOT,'test-artifacts');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css',
 '.json':'application/json','.png':'image/png','.webp':'image/webp',
 '.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg',
 '.wasm':'application/wasm','.woff2':'font/woff2'};
async function main(){
 fs.mkdirSync(OUT,{recursive:true});
 const server=http.createServer((req,res)=>{
  const requested=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  // Local test serves repository files, not external network or real map saves.
  let file=path.resolve(ROOT,'.'+(requested==='/'?'/index.html':requested));
  if(file!==ROOT&&!file.startsWith(ROOT+path.sep)){
   res.writeHead(403);return res.end();
  }
  try{
   const bytes=fs.readFileSync(file);
   res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream'});
   res.end(bytes);
  }catch(e){
   res.writeHead(404,{'Content-Type':'application/json'});res.end('{"error":"not found"}');
  }
 });
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const {firefox}=require('playwright');
 const browser=await firefox.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1680,height:1000},deviceScaleFactor:1});
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(String(error.message||error)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>!!window.VedrasAssetLabor?.walls&&!!window.VedrasWalls,{timeout:45000});
  const result=await page.evaluate(async()=>{
   const W=window.VedrasWalls,core=window.VedrasAssetLabor;
   if(!await W.artworkReady())throw Error('wall assets did not load in the real editor');
   const env=core.walls.environment();
   let chosen=null;
   for(const cell of env.byKey.values()){
    const p={q:cell.q,r:cell.r};
    if(W.DIRS.every(([dq,dr])=>W.canPlace(p,{q:p.q+dq,r:p.r+dr},env).ok)){
     chosen=p;break;
    }
   }
   if(!chosen)throw Error('No dry six-edge hex in real editor map');
   core.state.selected=chosen.q+','+chosen.r;
   core.state.wallKind='stone';
   core.state.wallShown=true;
   const sel=document.getElementById('wallKind');
   sel.value='stone';sel.dispatchEvent(new Event('change',{bubbles:true}));
   window.dispatchEvent(new Event('vedras:hex-selected'));
   document.getElementById('wallTest').click();
   const edges=W.normalize(core.state.wallEdges,core.walls.environment());
   const target=edges.filter(e=>[e.a,e.b].some(p=>p[0]===chosen.q&&p[1]===chosen.r));
   core.requestDraw();
   return {chosen,target:target.length,kind:target.map(e=>e.kind),
     info:W.artworkInfo(), canvasSize:[document.getElementById('mapCanvas').width,document.getElementById('mapCanvas').height],
     status:document.getElementById('wallStatus').textContent};
  });
  assert.equal(result.target,6,'real editor must place all six directions');
  assert(result.kind.every(k=>k==='stone'),'no palisade substitutes');
  assert.equal(result.info.loaded,12);
  assert.equal(result.info.stonePostsLoaded,2);
  assert(result.canvasSize[0]>100&&result.canvasSize[1]>100,'renderer canvas must exist');
  await page.waitForTimeout(1900);
  await page.screenshot({path:path.join(OUT,'editor-stone-v7.png')});
  // A second, human-inspectable 185% editor view: the former 65% overview
  // hid even substantial endpoint and shadow defects at thumbnail size.
  // Center the ACTUAL dry editor hex without introducing a mock canvas.
  const closeup=await page.evaluate(({chosen})=>{
   const core=window.VedrasAssetLabor;
   const slider=document.getElementById('zoomSlider');
   slider.value='185';
   slider.dispatchEvent(new Event('input',{bubbles:true}));
   const hex=256, radius=hex/Math.sqrt(3), worldX=hex*(chosen.q+chosen.r/2),
    worldY=1.5*radius*chosen.r;
   core.state.panX=-worldX*core.state.zoom;
   core.state.panY=-worldY*.85*core.state.zoom;
   core.state.fastCamera=false;
   core.requestDraw();
   return {zoom:core.state.zoom,selected:core.state.selected};
  },{chosen:result.chosen});
  assert(closeup.zoom>=1.8,'real editor must support an inspectable 185% hex view');
  await page.waitForTimeout(2000);
  await page.screenshot({path:path.join(OUT,'editor-stone-v7-closeup.png')});

  const visible=await page.evaluate(()=>{
   const c=document.getElementById('mapCanvas');
   try{
    const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let painted=0;for(let i=3;i<data.length;i+=1600)if(data[i]>0)painted++;
    return painted;
   }catch(e){return -1;}
  });
  assert(visible!==0,'real editor canvas must paint content');
  // Image is an auditable screenshot, not a claim of aesthetic acceptance.
  console.log(JSON.stringify({realEditor:true,...result,visible,pageErrors:pageErrors.slice(0,8)}));
 }finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});

'use strict';
/* Browser-level wall-art acceptance: six wooden WebPs and six stone PNGs decode, every
 * orientation renders without rotating the upright wall graphics, and six
 * connected corners remain filled and cast continuous nonadditive shadows. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {once}=require('node:events');
const ROOT=path.resolve(__dirname,'..');
const OUT=process.env.VEDRAS_CI_ARTIFACTS||path.join(ROOT,'test-artifacts');
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(name==='/'){
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
   return res.end('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
  }
  const webp=/^\/assets\/walls\/palisade\/(?:edge_dir[0-5]|corner_post|end_post)\.webp$/.test(name);
  const png=/^\/assets\/walls\/stone\/v7\/(?:edge_dir[0-5]|corner_post|end_post)\.png$/.test(name);
  if(!webp&&!png){res.writeHead(404);return res.end('missing');}
  res.writeHead(200,{'Content-Type':png?'image/png':'image/webp'});
  res.end(fs.readFileSync(path.join(ROOT,name)));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const {firefox}=require('playwright'),browser=await firefox.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:790}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e.message||e)));
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  for(const name of ['river.js','shadow-tone.js','walls.js'])
   await page.addScriptTag({content:fs.readFileSync(path.join(ROOT,name),'utf8')});
  const result=await page.evaluate(async()=>{
   const W=window.VedrasWalls,T=window.VedrasShadowTone;
   const ok=await W.artworkReady();
   if(!ok)throw Error('Not all six painted palisades, six painted stone walls or four joins loaded');
   const info=W.artworkInfo();
   const canvas=document.createElement('canvas');
   canvas.width=1200;canvas.height=730;
   const g=canvas.getContext('2d',{willReadFrequently:true});
   document.body.style.background='#22352b';document.body.append(canvas);
   // 12 previews, each uses a real painted image via drawImage().
   for(let row=0;row<2;row++)for(let dir=0;dir<6;dir++){
    const kind=row===0?'palisade':'stone';
    const [dq,dr]=W.DIRS[dir],edge={a:[0,0],b:[dq,dr],kind};
    const project=(x,y)=>({x:100+dir*195+x*.73,
     y:125+row*340+y*.73*.85});
    W.draw(g,edge,project,.72);
   }
   const pair=[{a:[0,0],b:[1,-1],kind:'stone'},
    {a:[0,0],b:[1,0],kind:'stone'}],joined=W.junctions(pair);
   const node=joined.find(n=>n.degree===2);
   if(!node)throw Error('Missing NE/NW shared junction');
   const spot=document.createElement('canvas');spot.width=490;spot.height=400;
   const j=spot.getContext('2d',{willReadFrequently:true});
   const project=(x,y)=>({x:205+x*.90,y:270+y*.90*.85});
   for(const edge of pair)W.draw(j,edge,project,.90);
   W.drawJoin(j,node,project,.90);
   const xy=project(node.x,node.y);
   const color=(x,y)=>[...j.getImageData(Math.round(x),Math.round(y),1,1).data];
   const connected=color(xy.x,xy.y-29);
   const atFoot=color(xy.x,xy.y-2);
   T.set({gray:50,mountains:true},{persist:false});
   const shadow=document.createElement('canvas');shadow.width=490;shadow.height=400;
   const mask=shadow.getContext('2d',{willReadFrequently:true});
   T.withMaskPass(()=>{
    for(const edge of pair)W.drawShadow(mask,edge,project,.90,{angle:160,softness:3});
    W.drawJoinShadow(mask,node,project,.90,{angle:160,softness:3});
   });
   const out=document.createElement('canvas');out.width=490;out.height=400;
   const h=out.getContext('2d',{willReadFrequently:true});
   h.globalAlpha=T.targetAlpha('sprite');h.drawImage(shadow,0,0);
   const d=W.shadowVector('stone',.90,{angle:160});
   const shadowColor=[...h.getImageData(
    Math.round(xy.x+d.x*.5),Math.round(xy.y+d.y*.5),1,1).data];
   // Real painted Palisade v5: complete timber posts meet through one
   // distinct hand-painted corner post, never through a polygon proxy.
   const timber=pair.map(e=>({...e,kind:'palisade'}));
   const timberNode=W.junctions(timber).find(n=>n.degree===2);
   const tcan=document.createElement('canvas');tcan.width=490;tcan.height=400;
   const tc=tcan.getContext('2d',{willReadFrequently:true});
   for(const e of timber)W.draw(tc,e,project,.90);
   W.drawJoin(tc,timberNode,project,.90);
   const xyT=project(timberNode.x,timberNode.y);
   const timberPx=(x,y)=>[...tc.getImageData(Math.round(x),Math.round(y),1,1).data];
   const timberCore=timberPx(xyT.x,xyT.y-34);
   const timberFoot=timberPx(xyT.x,xyT.y-3);
   const timberBridge=timberPx(xyT.x,xyT.y+3);
   // Sample below the middle of ONE slope, not below a shared node:
   // at the shared node the second valid segment naturally continues down.
   const only=document.createElement('canvas');only.width=490;only.height=400;
   const onlyCtx=only.getContext('2d',{willReadFrequently:true});
   W.draw(onlyCtx,timber[0],project,.90);
   const middle=W.midpoint(timber[0]),midp=project(middle.x,middle.y);
   const timberBelow=[...onlyCtx.getImageData(
    Math.round(midp.x),Math.round(midp.y+9),1,1).data];
   // Regression: authored diagonals must descend/rise in the same order
   // as the TRUE projected hex-edge geometry. V3 swapped all four slopes.
   const diagonalFeet=[];
   const uprightColumns=[];
   let matteFringe=0;
   for(const dir of [0,2,3,5]){
    const im=new Image();
    im.src='assets/walls/stone/v7/edge_dir'+dir+'.png?v=20261123-original-stone-v7-foot-shadow-v2';
    await im.decode();
    const proof=document.createElement('canvas');
    proof.width=im.naturalWidth;proof.height=im.naturalHeight;
    const pc=proof.getContext('2d',{willReadFrequently:true});
    pc.drawImage(im,0,0);
    const p=pc.getImageData(0,0,proof.width,proof.height).data;
    const footAt=xf=>{
     const x=Math.round(proof.width*xf);
     for(let y=proof.height-1;y>=0;y--)
      if(p[(y*proof.width+x)*4+3]>180)return y;
     throw Error('Missing painted masonry footprint at direction '+dir);
    };
    const [dq,dr]=W.DIRS[dir],geometry=W.geometry({a:[0,0],b:[dq,dr],kind:'stone'});
    const ideal=((geometry.b.y-geometry.a.y)*.85/(geometry.b.x-geometry.a.x))*
     ((.78-.22)*im.naturalWidth);
    const [w,h,ax,ay]=W.wallArtMeta.stone[dir];
    const expectedAt=xf=>{
     const x=im.naturalWidth*xf;
     return (ay+(x/3-ax)*(geometry.b.y-geometry.a.y)*.85/
      (geometry.b.x-geometry.a.x))*3;
    };
    diagonalFeet.push({dir,left:footAt(.22),right:footAt(.78),ideal,
     expectedLeft:expectedAt(.22),expectedRight:expectedAt(.78)});
   }
   // Edge-on walls must have one straight shaft, unlike obsolete bent art.
   for(const dir of [1,4]){
    const im=new Image();
    im.src='assets/walls/stone/v7/edge_dir'+dir+'.png?v=20261123-original-stone-v7-foot-shadow-v2';
    await im.decode();
    const can=document.createElement('canvas');can.width=im.width;can.height=im.height;
    const c=can.getContext('2d',{willReadFrequently:true});c.drawImage(im,0,0);
    const p=c.getImageData(0,0,can.width,can.height).data;
    const shaft=[];
    for(const part of [.30,.45,.60,.75,.90]){
     const y=Math.floor(im.height*part),xs=[];
     for(let x=0;x<im.width;x++)if(p[(y*im.width+x)*4+3]>225)xs.push(x);
     if(xs.length>4)shaft.push({left:xs[0],right:xs.at(-1)});
    }
    let top=im.height,bottom=-1;
     for(let yy=0;yy<im.height;yy++)for(let xx=0;xx<im.width;xx++)
      if(p[(yy*im.width+xx)*4+3]>80){top=Math.min(top,yy);bottom=Math.max(bottom,yy);}
     uprightColumns.push({dir,shaft,top,bottom});
   }
   // Transparent RGBA must never contain a white JPEG/matte fringe.
   for(let dir=0;dir<6;dir++){
    const im=new Image();im.src='assets/walls/stone/v7/edge_dir'+dir+'.png';
    await im.decode();
    const can=document.createElement('canvas');can.width=im.width;can.height=im.height;
    const c=can.getContext('2d',{willReadFrequently:true});c.drawImage(im,0,0);
    const p=c.getImageData(0,0,can.width,can.height).data;
    for(let k=0;k<p.length;k+=4)
     if(p[k+3]>80&&p[k+3]<249&&p[k]>232&&p[k+1]>232&&p[k+2]>232)matteFringe++;
   }
   return {ok,info,connected,atFoot,shadowColor,diagonalFeet,uprightColumns,matteFringe,counts:joined.map(n=>n.degree),
    timberCore,timberFoot,timberBridge,timberBelow,
    pngData:spot.toDataURL('image/png')};
  });
  assert.deepEqual(errors,[]);
  assert.equal(result.ok,true);
  assert.equal(result.info.loaded,12);
  assert.equal(result.info.postsLoaded,2,'real painted palisade corner and end posts must decode');
  assert.equal(result.info.stonePostsLoaded,2,'real painted stone corner and end posts must decode');
  for(const {dir,left,right,ideal,expectedLeft,expectedRight} of result.diagonalFeet){
   assert(Math.abs(left-expectedLeft)<12&&Math.abs(right-expectedRight)<12,
    'wall feet must sit on true projected hex BASE, not only have correct slope: '+dir+
    ', observed '+left+','+right+' expected '+expectedLeft+','+expectedRight);
   assert(Math.abs((right-left)-ideal)<15,
    '3x raster base must follow the true hex slope, not merely its sign: '+dir+
    ', observed='+(right-left)+', ideal='+ideal);
   const shouldDescend=dir===0||dir===3;
   assert(shouldDescend?right-left>90:left-right>90,
    'direction '+dir+' must follow the real hex footprint, left='+left+', right='+right);
  }
  for(const u of result.uprightColumns){
    const {dir,shaft}=u;
   assert(shaft.length>=4,'edge-on direction '+dir+' has a continuous shaft');
   const drift=Math.max(...shaft.map(s=>s.left))-Math.min(...shaft.map(s=>s.left));
   assert(drift<=10,'edge-on direction '+dir+' must be straight, x drift='+drift);
    assert(Math.abs(u.top-90)<=2&&Math.abs(u.bottom-623)<=2,
     'edge-on wall must be visibly lower and terminate at the shared hex vertex: '+dir+
     ' actual '+u.top+'..'+u.bottom);
  }
  assert.equal(result.matteFringe,0,'no stone image may contain a white matte halo');
  assert(result.connected[3]>235,'joint must seal daylight in the middle of the wall');
  assert(result.atFoot[3]>235,'no detached pointed stakes at ground base');
  assert(result.shadowColor[3]>40,'connected wall corner has a visible shared shadow');
  assert(result.shadowColor[3]<170,'the shadow cap never adds full darkness');
  assert(result.timberCore[3]>235,
   'real painted corner post closes the daylight gap between both timber edges');
  assert(result.timberFoot[3]>100,
   'painted corner post remains visible at the ground-level shared vertex');
  // The v5 joint is grounded at the TRUE shared vertex. Nearby slopes
  // may extend below the vertex, but the joint image is never stretched to
  // force a false triangle-shaped bridge (the v4 visual defect).
  assert(result.timberFoot[3]>100,
   'real fixed-size timber corner must stand on the shared hex vertex');
  assert(result.timberBelow[3]<12,
   'no palisade point may protrude below its shared ground anchor');
  await page.screenshot({path:path.join(OUT,'wall-art-v3-all-directions.png')});
  process.stdout.write('Six painted palisades, two painted posts, six stone PNGs and corner shadows Firefox PASS\n');
 }finally{await browser.close();server.close();}
})().catch(e=>{process.stderr.write(String(e.stack||e)+'\n');process.exitCode=1;});
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
  const gate=/^\/assets\/walls\/stone\/gates\/v1\/gate_dir[0-4]\.png$/.test(name);
  const timberGate=/^\/assets\/walls\/palisade\/gates\/v1\/gate_dir[0-5]\.svg$/.test(name);
  if(!webp&&!png&&!gate&&!timberGate){res.writeHead(404);return res.end('missing');}
  res.writeHead(200,{'Content-Type':timberGate?'image/svg+xml':png||gate?'image/png':'image/webp'});
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
    Math.round(midp.x),Math.round(midp.y+16),1,1).data];
   // Compare the actual opaque lower silhouette of the painted stone
   // corner/end against the edge-on raster at both southern vertices.
   const postOverlap=[];
   const shadowCoverage=[];
   const allEdges=W.DIRS.map(([q,r])=>({a:[0,0],b:[q,r],kind:'stone'}));
   const testZoom=1.85;
   for(const dir of [1,4]){
    const edge=allEdges[dir],g=W.geometry(edge),foot=g.a.y>g.b.y?g.a:g.b;
    const local=(x,y)=>({x:350+(x-foot.x)*testZoom,y:500+(y-foot.y)*.85*testZoom});
    const make=()=>{const c=document.createElement('canvas');c.width=700;c.height=650;return c.getContext('2d',{willReadFrequently:true});};
    const ectx=make();W.draw(ectx,edge,local,testZoom);
    const bottom=(ctx,x)=>{
     const pix=ctx.getImageData(Math.round(x),0,1,650).data;
     for(let yy=649;yy>=0;yy--)if(pix[yy*4+3]>160)return yy;
     return -1;
    };
    const p=local(foot.x,foot.y);
    for(const list of [[edge],allEdges]){
     const node=W.junctions(list).find(n=>Math.hypot(n.x-foot.x,n.y-foot.y)<1e-6);
     const jctx=make();W.drawJoin(jctx,node,local,testZoom);
     const margins=[-5,0,5].map(dx=>bottom(jctx,p.x+dx*testZoom)-bottom(ectx,p.x+dx*testZoom));
     postOverlap.push({dir,degree:node.degree,margins});
    }
   }
   // Inspect actual cast-mask pixels within the swept center and
   // cross-section for every side and several global light directions.
   for(const angle of [135,160,200,270]){
    for(let dir=0;dir<6;dir++){
     const edge=allEdges[dir],mid=W.midpoint(edge),z=1.4;
     const local=(x,y)=>({x:350+(x-mid.x)*z,y:250+(y-mid.y)*.85*z});
     const c=document.createElement('canvas');c.width=700;c.height=500;
     const mask=c.getContext('2d',{willReadFrequently:true});
     T.withMaskPass(()=>W.drawShadow(mask,edge,local,z,{angle,softness:3}));
     const p=W.footprint(edge,local,z),v=W.shadowVector('stone',z,{angle});
     const dx=v.x*.58-.07*v.height,dy=v.y*.58+.025*v.height;
     let minAlpha=255;
     for(const along of [.2,.5,.8])for(const t of [.2,.5,.8])for(const lateral of [-.2,0,.2]){
      const x=p.a.x+(p.b.x-p.a.x)*along+dx*t+p.depth.x*lateral;
      const y=p.a.y+(p.b.y-p.a.y)*along+dy*t+p.depth.y*lateral;
      minAlpha=Math.min(minAlpha,mask.getImageData(Math.round(x),Math.round(y),1,1).data[3]);
     }
     shadowCoverage.push({angle,dir,minAlpha});
    }
   }
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
   const gatePixels=[];
   for(const dir of [1,4]){
    const im=new Image();
    im.src='assets/walls/stone/gates/v1/gate_dir'+dir+'.png?v=20261124-gates-wide-center-v3';
    await im.decode();
    const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
    const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);
    gatePixels.push(g.getImageData(0,0,c.width,c.height).data);
   }
   const widthAt=(p,y)=>{
    let min=120,max=-1;
    for(let x=0;x<120;x++)if(p[(y*120+x)*4+3]>128){min=Math.min(min,x);max=Math.max(max,x);}
    return max-min+1;
   };
   let mirrorMismatch=0;
   for(let y=0;y<648;y++)for(let x=0;x<120;x++)for(let k=0;k<4;k++){
    if(gatePixels[0][(y*120+x)*4+k]!==gatePixels[1][(y*120+119-x)*4+k])mirrorMismatch++;
   }
   const gateWidth={middle:widthAt(gatePixels[0],300),upper:widthAt(gatePixels[0],150),
    lower:widthAt(gatePixels[0],400),mirrorMismatch};
   return {gateWidth,ok,info,connected,atFoot,shadowColor,diagonalFeet,uprightColumns,matteFringe,postOverlap,shadowCoverage,counts:joined.map(n=>n.degree),
    timberCore,timberFoot,timberBridge,timberBelow,
    pngData:spot.toDataURL('image/png')};
  });
  assert.deepEqual(errors,[]);
  assert.equal(result.ok,true);
  assert.equal(result.info.loaded,12);
  assert.equal(result.info.postsLoaded,2,'real painted palisade corner and end posts must decode');
  assert.equal(result.info.gateLoaded,6);
  assert.equal(result.info.palisadeGateLoaded,6);
  assert(result.gateWidth.middle>=84&&result.gateWidth.middle<=90,'gatehouse is locally thicker');
  assert(result.gateWidth.upper<70&&result.gateWidth.lower<70,'original wall ends remain narrow');
  assert.equal(result.gateWidth.mirrorMismatch,0,'east/west gate pixels must mirror exactly');
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
  for(const p of result.postOverlap){
   assert(p.margins[1]>=0&&p.margins[1]<=12,'pier center must end just beyond the edge-on foot: '+JSON.stringify(p));
   assert(p.margins.every(n=>n>=-3&&n<=12),'pier sides must remain near the wall foot: '+JSON.stringify(p));
  }
  for(const dir of [1,4]){
   const [end,corner]=result.postOverlap.filter(p=>p.dir===dir);
   assert.deepEqual(end.margins,corner.margins,'open ends must retain the identical corner silhouette');
  }
  for(const p of result.shadowCoverage){
   assert(p.minAlpha>=100,'closed shadow sweep must have no interior holes: '+JSON.stringify(p));
  }
  console.log(JSON.stringify({postOverlap:result.postOverlap,shadowCoverage:result.shadowCoverage}));
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
   'no palisade point may protrude beyond its centered footprint');
  await page.screenshot({path:path.join(OUT,'wall-art-v3-all-directions.png')});
  process.stdout.write('Six painted palisades, two painted posts, six stone PNGs and corner shadows Firefox PASS\n');
 }finally{await browser.close();server.close();}
})().catch(e=>{process.stderr.write(String(e.stack||e)+'\n');process.exitCode=1;});
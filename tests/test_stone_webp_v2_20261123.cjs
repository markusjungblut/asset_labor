/* Stone v3: independent 3x painted PNG rasters, canonical anchors and joins. */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=p=>fs.readFileSync(path.join(root,p),'utf8');
const loaded=[];
class MockImage {
 constructor(){this.naturalWidth=0;}
 set src(uri){this.url=uri;this.naturalWidth=40;loaded.push(uri);this.onload?.();}
 get src(){return this.url;}
}
const scope={window:{},Image:MockImage};
vm.runInNewContext(source('river.js'),scope);
vm.runInNewContext(source('walls.js'),scope);
const W=scope.window.VedrasWalls,R=scope.window.VedrasRivers;
const expected=[[156,167,14,89],[40,216,20,82],[156,167,142,89],
 [156,167,142,152],[40,216,20,208],[156,167,14,152]];
function size(file){
 const bytes=fs.readFileSync(path.join(root,'assets','walls','stone','v7',file+'.png'));
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',file);
 assert([8,16].includes(bytes[24]),'Each source must be genuine RGB+A PNG');
 assert.equal(bytes[25],6,'Transparent RGBA PNG is required');
 assert(bytes.length>5000,'No placeholder or pixel-length fake asset: '+file);
 return [bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
}
test('all six stand-alone stone edge rasters preserve the original fixed-size hex-footprint contract',()=>{
 assert.deepEqual(JSON.parse(JSON.stringify(W.wallArtMeta.stone)),expected);
 for(let dir=0;dir<6;dir++){
  const [w,h,ax,ay]=expected[dir];
  assert.deepEqual(size('edge_dir'+dir),[w*3,h*3]);
  assert(ax>=0&&ax<=w&&ay>0&&ay<=h);
  const [dq,dr]=R.DIRS[dir],g=W.geometry({a:[0,0],b:[dq,dr],kind:'stone'});
  assert(g&&Math.hypot(g.b.x-g.a.x,g.b.y-g.a.y)>100);
  const x=ax+(g.b.x-g.a.x),y=ay+(g.b.y-g.a.y)*.85;
  assert(x>=-1&&x<=w+1&&y>=-1&&y<=h+1,
   'both real hex corners must fit the directional bitmap: '+dir);
 }
 assert.deepEqual(size('corner_post'),[46*3,84*3]);
 assert.deepEqual(size('end_post'),[38*3,82*3]);
});
test('stone artwork loads only PNG raster images, while palisade v5 remains unchanged',async()=>{
 assert.equal(await W.artworkReady(),true);
 const info=W.artworkInfo();
 assert.equal(info.loaded,12);
 assert.equal(info.postsLoaded,2);
 assert.equal(info.stonePostsLoaded,2);
 assert.equal(loaded.length,27);
 assert.equal(info.palisadeGateLoaded,6);
 assert.equal(info.gateLoaded,6);
 for(let dir=0;dir<6;dir++){
  assert(loaded.some(x=>x.includes('walls/stone/v7/edge_dir'+dir+'.png?v=20261123-original-stone-v7-foot-shadow-v2')));
  assert(loaded.some(x=>x.includes('walls/palisade/edge_dir'+dir+'.webp?v=20261123-painted-volumetric-v5')));
 }
 for(const join of ['corner_post','end_post']){
  assert(loaded.some(x=>x.includes('walls/stone/v7/'+join+'.png?v=20261123-original-stone-v7-foot-shadow-v2')));
  assert(loaded.some(x=>x.includes('walls/palisade/'+join+'.webp?v=20261123-painted-volumetric-v5')));
 }
 assert(!loaded.some(x=>x.endsWith('.svg')||x.includes('.svg?')),'no SVG artwork in the active wall/gate renderer');
});
test('all six stone directions draw independent raster images, not vector facades',async()=>{
 await W.artworkReady();
 const drawCalls=[],ctx={
  save(){},restore(){},
  drawImage(...args){drawCalls.push(args);}
 };
 const project=(x,y)=>({x:100+x,y:200+y*.85});
 for(let dir=0;dir<6;dir++){
  const [q,r]=R.DIRS[dir],edge={a:[0,0],b:[q,r],kind:'stone'};
  assert.equal(W.draw(ctx,edge,project,1),true);
 }
 assert.equal(drawCalls.length,6);
 for(let dir=0;dir<6;dir++){
  const img=drawCalls[dir][0];
  assert(img.src.includes('walls/stone/v7/edge_dir'+dir+'.png'));
  assert.equal(drawCalls[dir][3],expected[dir][0]);
  assert.equal(drawCalls[dir][4],expected[dir][1]);
 }
});
test('end and corner piers use painted stone; mixed joints retain the timber post',async()=>{
 await W.artworkReady();
 const edge={a:[0,0],b:[1,-1],kind:'stone'},
       next={a:[0,0],b:[1,0],kind:'stone'};
 const corner=W.junctions([edge,next]).find(n=>n.degree===2);
 const end=W.junctions([edge]).find(n=>n.degree===1);
 const mixed=W.junctions([edge,{...next,kind:'palisade'}]).find(n=>n.degree===2);
 assert(corner&&end&&mixed);
 const project=(x,y)=>({x:100+x,y:200+y*.85});
 for(const [node,asset,width,height] of [
  [corner,'stone/v7/corner_post.png',46,84],
  [end,'stone/v7/corner_post.png',46,84],
  [mixed,'palisade/corner_post.webp',25,76]]){
  const calls=[],ctx={save(){},restore(){},drawImage(...args){calls.push(args);}};
  assert(W.drawJoin(ctx,node,project,1));
  assert.equal(calls.length,1);
  assert(calls[0][0].src.includes(asset));
  assert.equal(calls[0][3],width);
  assert.equal(calls[0][4],height);
  const p=project(node.x,node.y);
  assert(Math.abs(calls[0][1]+width/2-p.x)<1e-6);
  assert(Math.abs(calls[0][2]+height-W.joinArtPlacement(node,project,1).south-p.y)<1e-6);
 }
});
test('viewer and baked scene invalidate pre-v5 stone assets',()=>{
 const js=source('walls.js'),html=source('index.html'),app=source('app.js');
 assert(js.includes("20261123-original-stone-v7-foot-shadow-v2"));
 assert(js.includes('const stoneJoinArt=new Map()'));
 assert(html.includes('walls.js?v=20261124-palisade-gates-ai-v3'));
 assert(html.includes('walls=20261124-palisade-gates-ai-v3'));
 assert(app.includes("'stone-orthographic-3x-raster-edges-no-birdseye-crenels-v3'"));
 assert(app.includes("'stone-correct-diagonal-hex-slope-ground-footprint-v4'"));
 assert(app.includes("'palisade-complete-posts-symmetric-volume-v5'"));
 assert(app.includes("'stone-independent-reanchored-six-hex-raster-v5'"));
 assert(app.includes("'stone-palisade-native-geometry-new-ashlar-v6'"));
});

test('stone and timber use the same grid-center geometry, not the front pixel or relief',async()=>{
 await W.artworkReady();
 for(const kind of ['stone','palisade'])for(const zoom of [.65,1,1.85,2]){
  const project=(x,y)=>({x:170+x*zoom,y:210+y*.85*zoom});
  const edges=R.DIRS.map(([q,r])=>({a:[0,0],b:[q,r],kind}));
  const nodes=W.junctions(edges);
  assert.equal(nodes.length,6);
  const southeast=W.geometry(edges[2]),southwest=W.geometry(edges[3]);
  assert(Math.abs(southeast.a.y-southwest.b.y)<1e-6);
  const a=W.edgeArtPlacement(edges[2],project,zoom),b=W.edgeArtPlacement(edges[3],project,zoom);
  assert(Math.abs(a.south-b.south)<1e-6,'southeast and southwest offsets symmetric');
  assert(Math.abs(a.south/zoom-W.edgeArtPlacement(edges[0],project,zoom).south/zoom)<1e-6);
  for(const edge of edges){
   const p=W.footprint(edge,project,zoom),g=W.geometry(edge);
   const box=W.edgeArtPlacement(edge,project,zoom);
   assert(box.south>0);
   const meta=(kind==='stone'?W.stoneRasterMeta:W.palisadeRasterMeta)[g.side];
   assert(Math.abs(box.x+meta[2]*zoom-p.a.x)<1e-6);
   assert(Math.abs(box.y+box.anchorY*zoom-box.south-p.a.y)<1e-6);
   const reversed=W.edgeArtPlacement({a:edge.b,b:edge.a,kind},project,zoom);
   assert(Math.abs(box.south-reversed.south)<1e-6);
   const drawCalls=[],ctx={save(){},restore(){},drawImage(...a){drawCalls.push(a)}};
   W.draw(ctx,edge,project,zoom);
   assert.deepEqual(drawCalls[0].slice(1),[box.x,box.y,box.width,box.height]);
  }
  for(const node of nodes){
   const box=W.joinArtPlacement(node,project,zoom),p=project(node.x,node.y);
   assert(Math.abs(box.x+box.width/2-p.x)<1e-6);
   assert(Math.abs(box.y+box.height-box.south-p.y)<1e-6);
  }
 }
 const app=source('app.js');
 assert(app.includes('function wallGridProject(x,y){return toScreen(x,y);}'));
 assert(app.includes('draw(ctx,obj.wallEdge,wallGridProject,state.zoom)'));
 assert(app.includes('drawJoin(ctx,obj.wallJoin,wallGridProject,state.zoom)'));
 assert(app.includes("'stone-and-palisade-grid-foot-center-v1'"));
});

test('stone ends, corners and three-way joints use one unstretched sprite and a small front offset',async()=>{
 await W.artworkReady();
 const edges=R.DIRS.map(([q,r])=>({a:[0,0],b:[q,r],kind:'stone'}));
 for(const zoom of [.65,1,1.85,2]){
  const project=(x,y)=>({x:100+x*zoom,y:200+y*.85*zoom});
  for(const node of W.junctions(edges)){
   const reference=W.joinArtPlacement(node,project,zoom);
   const calls=[];
   const ctx={save(){},restore(){},drawImage(...a){calls.push(a)}};
   for(const degree of [1,2,3]){
    const n={...node,degree};
    const box=W.joinArtPlacement(n,project,zoom);
    assert.deepEqual(box,reference);
    assert(Math.abs(box.south/zoom-9.5)<1e-8);
    assert(Math.abs(box.width/zoom-46)<1e-8);
    assert(Math.abs(box.height/zoom-84)<1e-8);
    W.drawJoin(ctx,n,project,zoom);
   }
   assert(calls[0][0].src.includes('stone/v7/corner_post.png'));
   assert.deepEqual(calls[0],calls[1]);
   assert.deepEqual(calls[1],calls[2]);
  }
  const node=W.junctions(edges.map(e=>({...e,kind:'palisade'})))[0];
  const timber=W.joinArtPlacement(node,project,zoom);
  assert(Math.abs(timber.south/zoom-3.5)<1e-8);
  assert(Math.abs(timber.height/zoom-76)<1e-8);
 }
});

test('all stone gate facings use native 3x sprites with NW reusing SO',async()=>{
 await W.artworkReady();
 const ctx={save(){},restore(){},drawImage(...a){this.call=a;}};
 const project=(x,y)=>({x:100+x,y:200+y*.85});
 for(const dir of [0,1,2,3,4,5]){
  const sourceDir=dir===5?2:dir;
  const bytes=fs.readFileSync(path.join(root,'assets/walls/stone/gates/v1/gate_dir'+sourceDir+'.png'));
  assert.equal(bytes[25],6);
  assert.equal(bytes.readUInt32BE(16),[1,4].includes(dir)?120:468);
  assert.equal(bytes.readUInt32BE(20),[1,4].includes(dir)?648:501);
  const edge={a:[0,0],b:R.DIRS[dir],kind:'stone_gate',gateSide:dir};
  assert(W.draw(ctx,edge,project,1));
  assert(ctx.call[0].src.includes('gates/v1/gate_dir'+sourceDir+'.png'));
  assert.deepEqual(ctx.call.slice(1),[...Object.values(W.edgeArtPlacement(edge,project,1)).slice(0,4)]);
  const stone=W.edgeArtPlacement({...edge,kind:'stone'},project,1);
  assert.deepEqual(W.edgeArtPlacement(edge,project,1),stone);
 }
});

test('six timber gate assets use the exact original palisade image dimensions and anchors',async()=>{
 await W.artworkReady();
 const ctx={save(){},restore(){},drawImage(...a){this.call=a;}};
 const project=(x,y)=>({x:100+x,y:200+y*.85});
 for(let dir=0;dir<6;dir++){
  const [w,h]=W.palisadeRasterMeta[dir];
  const bytes=fs.readFileSync(path.join(root,'assets/walls/palisade/gates/v1/gate_dir'+dir+'.png'));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(bytes.readUInt32BE(16),w*3);
  assert.equal(bytes.readUInt32BE(20),h*3);
  assert.equal(bytes[25],6,'native RGBA PNG required');
  assert(!fs.existsSync(path.join(root,'assets/walls/palisade/gates/v1/gate_dir'+dir+'.svg')));
  const edge={a:[0,0],b:R.DIRS[dir],kind:'palisade_gate',gateSide:dir};
  assert(W.draw(ctx,edge,project,1));
  assert(ctx.call[0].src.includes('palisade/gates/v1/gate_dir'+dir+'.png'));
  assert.deepEqual(W.edgeArtPlacement(edge,project,1),W.edgeArtPlacement({...edge,kind:'palisade'},project,1));
 }
});

 test('northwest reuses the exact southeast painted timber gate bytes',()=>{
  const dir=path.join(root,'assets/walls/palisade/gates/v1');
  assert.deepEqual(fs.readFileSync(path.join(dir,'gate_dir5.png')),fs.readFileSync(path.join(dir,'gate_dir2.png')));
 });

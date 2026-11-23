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
 const bytes=fs.readFileSync(path.join(root,'assets','walls','stone',file+'.png'));
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
 assert.deepEqual(size('corner_post'),[34*3,74*3]);
 assert.deepEqual(size('end_post'),[30*3,74*3]);
});
test('stone artwork loads only PNG raster images, while palisade v5 remains unchanged',async()=>{
 assert.equal(await W.artworkReady(),true);
 const info=W.artworkInfo();
 assert.equal(info.loaded,12);
 assert.equal(info.postsLoaded,2);
 assert.equal(info.stonePostsLoaded,2);
 assert.equal(loaded.length,16);
 for(let dir=0;dir<6;dir++){
  assert(loaded.some(x=>x.includes('walls/stone/edge_dir'+dir+'.png?v=20261123-stone-correct-hex-v4')));
  assert(loaded.some(x=>x.includes('walls/palisade/edge_dir'+dir+'.webp?v=20261123-painted-volumetric-v5')));
 }
 for(const join of ['corner_post','end_post']){
  assert(loaded.some(x=>x.includes('walls/stone/'+join+'.png?v=20261123-stone-correct-hex-v4')));
  assert(loaded.some(x=>x.includes('walls/palisade/'+join+'.webp?v=20261123-painted-volumetric-v5')));
 }
 assert(!loaded.some(x=>x.endsWith('.svg')||x.includes('.svg?')));
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
  assert(img.src.includes('walls/stone/edge_dir'+dir+'.png'));
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
  [corner,'stone/corner_post.png',34,74],
  [end,'stone/end_post.png',30,74],
  [mixed,'palisade/corner_post.webp',25,76]]){
  const calls=[],ctx={save(){},restore(){},drawImage(...args){calls.push(args);}};
  assert(W.drawJoin(ctx,node,project,1));
  assert.equal(calls.length,1);
  assert(calls[0][0].src.includes(asset));
  assert.equal(calls[0][3],width);
  assert.equal(calls[0][4],height);
  const p=project(node.x,node.y);
  assert(Math.abs(calls[0][1]+width/2-p.x)<1e-6);
  assert(Math.abs(calls[0][2]+height-p.y)<1e-6);
 }
});
test('viewer and baked scene invalidate pre-v4 stone assets',()=>{
 const js=source('walls.js'),html=source('index.html'),app=source('app.js');
 assert(js.includes("stone-correct-hex-v4"));
 assert(js.includes('const stoneJoinArt=new Map()'));
 assert(html.includes('walls.js?v=20261123-stone-correct-hex-v4'));
 assert(html.includes('walls=20261123-stone-correct-hex-v4'));
 assert(app.includes("'stone-orthographic-3x-raster-edges-no-birdseye-crenels-v3'"));
 assert(app.includes("'stone-correct-diagonal-hex-slope-ground-footprint-v4'"));
 assert(app.includes("'palisade-complete-posts-symmetric-volume-v5'"));
});

/* Stone battlement v1: preserve six hex-direction anchors and v5 timber. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');
const ctx={window:{}};
vm.runInNewContext(source('river.js'),ctx);
vm.runInNewContext(source('walls.js'),ctx);
const W=ctx.window.VedrasWalls,R=ctx.window.VedrasRivers;
const coordinate=s=>s.split(',').map(Number);
test('all six masonry facades retain their original transparent hex-edge anchors and raster bounds',()=>{
 for(let dir=0;dir<6;dir++){
  const src=source('assets/walls/stone/edge_dir'+dir+'.svg');
  const [width,height,ax,ay]=W.wallArtMeta.stone[dir];
  const match=src.match(/<svg[^>]*width="(\d+)" height="(\d+)" viewBox="([\d.\- ]+)"/);
  assert(match,'well-formed dimensions: '+dir);
  assert.equal(Number(match[1]),width);
  assert.equal(Number(match[2]),height);
  const [x,y,w,h]=match[3].split(' ').map(Number);
  assert.equal(w,width);assert.equal(h,height);
  assert(src.includes('id="stone-crenellations-v1"'));
  assert(src.includes('ashlar'),'retain material-specific masonry');
  assert(!src.includes('transform="rotate'),'never rotate upright 2.5D facades');
  assert(!src.includes('<image '),'only deterministic standalone geometry');
  const coords=[...src.slice(src.indexOf('id="stone-crenellations-v1"')).matchAll(/(-?\d+\.\d+,-?\d+\.\d+)/g)]
   .map(m=>coordinate(m[1]));
  assert(coords.length>75,'actual polygonal crenels, not a flat wall texture');
  for(const [px,py] of coords){
   assert(px>=x-1&&px<=x+w+1,'overlay horizontal clip in direction '+dir);
   assert(py>=y-1&&py<=y+h+1,'overlay vertical clip in direction '+dir);
  }
  assert(ax>=0&&ax<=width&&ay>=0&&ay<=height);
  const [dq,dr]=R.DIRS[dir],g=W.geometry({a:[0,0],b:[dq,dr],kind:'stone'});
  assert(g&&Math.hypot(g.b.x-g.a.x,g.b.y-g.a.y)>100);
 }
});
test('battlements make separate top and back-side silhouettes in every direction',()=>{
 for(let dir=0;dir<6;dir++){
  const src=source('assets/walls/stone/edge_dir'+dir+'.svg');
  const overlay=src.slice(src.indexOf('id="stone-crenellations-v1"'));
  assert.equal((overlay.match(/#e0d2b9/g)||[]).length,7,'seven near-side upper caps in '+dir);
  assert.equal((overlay.match(/#c7b9a1/g)||[]).length,7,'seven far-side upper caps in '+dir);
  assert(overlay.includes('fill="#817d72"'),'stone walkway retained');
  if(dir===1||dir===4)assert(!overlay.includes('opacity=".45"'),
   'end-on silhouettes do not paint floating facade arches');
  else assert.equal((overlay.match(/opacity=".45"/g)||[]).length,4,
   'four blind arcades on the exposed wall facade');
 }
});
test('stone corner turrets share the same canonical vertices without altering wood',()=>{
 const sourceText=source('walls.js');
 assert(sourceText.includes('Crenellated corner/end pier'));
 assert(sourceText.includes("'.svg?v=20261123-crenellated-stone-v1'"));
 assert(sourceText.includes("'.webp?v=20261123-painted-volumetric-v5'"));
 const [q,r]=R.DIRS[0],e={a:[0,0],b:[q,r],kind:'stone'};
 const node=W.junctions([e])[0];assert(node);
 const operations=[],c={};
 for(const action of ['save','restore','beginPath','moveTo','lineTo','closePath','fill','stroke'])
  c[action]=()=>operations.push({action,color:c.fillStyle});
 assert(W.drawJoin(c,node,(x,y)=>({x,y}),1));
 assert(operations.some(x=>x.color==='#e2d3bc'),'corner has highlighted raised merlons');
 assert(operations.some(x=>x.color==='#4c4c46'),'corner has a dark defensible slit');
});
test('stone-wall revisions refresh scripts and rendered world fingerprints',()=>{
 const html=source('index.html'),app=source('app.js');
 assert(html.includes('walls.js?v=20261123-stone-battlements-v1'));
 assert(html.includes('walls=20261123-stone-battlements-v1'));
 assert(app.includes("'stone-crenellated-ashlar-parapets-and-pier-v1'"));
 assert(app.includes("'palisade-complete-posts-symmetric-volume-v5'"));
});

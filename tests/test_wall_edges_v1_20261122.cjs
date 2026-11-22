/* Hex edge walls v1: real river geometry, six canonical sides, renderer and shadows. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');
const s={window:{
 VedrasShadowTone:{targetAlpha:()=>.42,colorCss:()=>"#000"}
}};
vm.runInNewContext(source('river.js'),s);
vm.runInNewContext(source('walls.js'),s);
const R=s.window.VedrasRivers,W=s.window.VedrasWalls;
const plain=x=>JSON.parse(JSON.stringify(x));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const cells=[];
for(let q=-3;q<=3;q++)for(let r=-3;r<=3;r++)
 if(Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))<=3)
  cells.push({q,r,reliefClass:'flat',biome:'grassland',wet:q===3&&r===0});
const wet=c=>c.wet===true;
const env=()=>W.context(cells,wet,[]);
const near=(a,b)=>dist(a,b)<1e-6;
const makeContext=()=>{
 const ops=[],ctx={ops};
 for(const fn of ['save','restore','beginPath','moveTo','lineTo',
  'closePath','stroke','fill','fillRect','arc']){
  ctx[fn]=(...args)=>ops.push({fn,args,fillStyle:ctx.fillStyle});
 }
 return ctx;
};

test('six projected sides share EXACT geometric corners from both hex owners',()=>{
 const start={q:0,r:0};
 for(let side=0;side<6;side++){
  const [dq,dr]=R.DIRS[side],end={q:dq,r:dr};
  assert.equal(R.side(start,end),side);
  assert.equal(R.side(end,start),(side+3)%6);
  const a=W.geometry({a:[0,0],b:[dq,dr],kind:'stone'});
  const b=W.geometry({a:[dq,dr],b:[0,0],kind:'stone'});
  assert(a&&b,'both ownership directions must expose a physical edge');
  assert(near(a.a,b.b)&&near(a.b,b.a),
   'from either hex the exact same line joins the same world corners: '+side);
 }
});

test('one shared physical edge is saved once and mirrors overwrite it',()=>{
 let data=[],scope=env();
 for(let i=0;i<6;i++){
  const [q,r]=R.DIRS[i];
  data=W.setEdge(data,[0,0],[q,r],'stone',scope);
 }
 assert.equal(data.length,6);
 data=W.setEdge(data,[1,0],[0,0],'palisade',scope);
 assert.equal(data.length,6);
 assert.equal(data.find(e=>W.identity(e.a,e.b)===W.identity([1,0],[0,0])).kind,'palisade');
 assert.equal(W.identity([0,0],[1,0]),W.identity([1,0],[0,0]));
 const duplicated=W.normalize([...data,{a:[1,0],b:[0,0],kind:'stone'}],scope);
 assert.equal(duplicated.length,6);
 const removed=W.removeEdge(duplicated,[1,0],[0,0],scope);
 assert.equal(removed.length,5);
 assert(removed.every(e=>W.identity(e.a,e.b)!==W.identity([1,0],[0,0])));
 const poison=W.normalize([...removed,{a:[0,0],b:[4,0],kind:'stone'},
  {a:[0,0],b:[0,1],kind:'exploit'},
  {a:[0.1,0],b:[1,0],kind:'stone'}],scope);
 assert.equal(poison.length,5,'only six legal immediately adjacent, defined kinds');
});

test('mountains, water and actual river EDGE geometry are never wall sites',()=>{
 const a={q:0,r:0},water={q:3,r:0};
 assert.equal(W.canPlace({q:2,r:0},water,env()).ok,false);
 const hill=cells.find(x=>x.q===-1&&x.r===0);
 hill.reliefClass='mountain';
 assert.match(W.canPlace(a,hill,env()).reason,/Berg/);
 hill.reliefClass='flat';
 const route={hexes:[[0,0],[1,0],[2,0],[3,0]]};
 const actualSections=R.sections(route,cells,wet);
 assert(actualSections.length>=1);
 const scope=W.context(cells,wet,[route]);
 const realSegments=actualSections.flatMap(s=>s.edgeSides.map(dir=>{
  const [dq,dr]=R.DIRS[dir];
  return {a:[s.q,s.r],b:[s.q+dq,s.r+dr]};
 })).filter(z=>{
  const by=new Map(cells.map(c=>[R.key(c),c]));
  return by.has(z.a.join(','))&&by.has(z.b.join(','))&&
   !wet(by.get(z.a.join(',')))&&!wet(by.get(z.b.join(',')));
 });
 assert(realSegments.length>0,'river follows at least one shared dry land edge');
 for(const edge of realSegments){
  assert.equal(W.canPlace(edge.a,edge.b,scope).ok,false);
  assert.match(W.canPlace(edge.a,edge.b,scope).reason,/Flusskante/);
  assert.equal(W.setEdge([],...[edge.a,edge.b,'stone',scope]).length,0);
 }
 assert(scope.rivers.size>0);
 assert([...W.DIRS].some(([dq,dr])=>W.canPlace([0,0],[dq,dr],scope).ok),
  'a nearby river must not block all six sides of a land hex');
});

test('wall construction hides only ground roots crossing its line',()=>{
 const edge={a:[0,0],b:[1,0],kind:'stone'};
 const mid=W.midpoint(edge);
 assert.equal(W.blocksPoint(mid.x,mid.y,[edge],22),true);
 assert.equal(W.blocksPoint(mid.x,mid.y+150,[edge],22),false);
 assert.equal(W.blocksPoint(0,0,[edge],22),false);
 assert.equal(W.blocksPoint(mid.x+26,mid.y,[edge],22),false);
 assert.equal(W.blocksPoint(mid.x+10,mid.y,[edge],22),true);
});
test('wall visual v2 keeps identical NW/NE height, thicker stone and centered footprints',()=>{
 assert.equal(W.heightFor('stone'),62,'stone should no longer tower over the palisade');
 assert.equal(W.heightFor('stone'),W.heightFor('palisade'),
  'palisade and masonry share the same vertical wall height');
 assert.equal(W.widthFor('stone'),24);
 assert.equal(W.widthFor('palisade'),11);
 const project=(x,y)=>({x:x*.8+22,y:y*.85-12});
 for(const [dq,dr] of R.DIRS){
  const a={q:0,r:0},b={q:dq,r:dr};
  const e={a:[a.q,a.r],b:[b.q,b.r]};
  const stone=W.footprint({...e,kind:'stone'},project,1);
  const timber=W.footprint({...e,kind:'palisade'},project,1);
  assert(stone&&timber,'every direction has a wall footprint');
  for(const p of [stone,timber]){
   assert(Math.abs((p.frontA.x+p.backA.x)/2-p.a.x)<1e-8);
   assert(Math.abs((p.frontA.y+p.backA.y)/2-p.a.y)<1e-8);
   assert(Math.abs((p.frontB.x+p.backB.x)/2-p.b.x)<1e-8);
   assert(Math.abs((p.frontB.y+p.backB.y)/2-p.b.y)<1e-8);
   assert(p.depth.y>=-1e-9,'all back faces point toward screen front, including NW');
   assert.equal(p.height,62,'a different hex direction must not change height');
  }
  assert(stone.thickness>timber.thickness*2,
   'broad masonry extends into both neighboring hexes');
  const shadowStone=W.shadowVector('stone',1,{angle:160});
  const shadowTimber=W.shadowVector('palisade',1,{angle:160});
  assert.equal(shadowStone.height,shadowTimber.height,
   'equal wall heights produce the same standardized shadow reach');
  assert.equal(shadowStone.x,shadowTimber.x);
 }
});
test('wall visual v2 paints separated wooden posts and ashlar courses',()=>{
 const p=(x,y)=>({x:x*.8,y:y*.85});
 const edge={a:[0,0],b:[1,0]};
 const wood=makeContext(),stone=makeContext();
 assert(W.draw(wood,{...edge,kind:'palisade'},p,1));
 assert(W.draw(stone,{...edge,kind:'stone'},p,1));
 assert(wood.ops.filter(op=>op.fn==='fill').length>=18,
  'timber wall should contain multiple distinct posts, not one smooth slab');
 assert(wood.ops.some(op=>op.fn==='fill'&&op.fillStyle==='#be9467'),
  'visible individual pointed timber heads');
 assert(stone.ops.some(op=>op.fn==='fill'&&op.fillStyle==='#bfc4c1'),
  'masonry needs a light-gray body');
 assert(stone.ops.some(op=>op.fn==='fill'&&op.fillStyle==='#e0e2dc'),
  'masonry needs a lighter broad top face');
 assert(stone.ops.filter(op=>op.fn==='stroke').length>=16,
  'ashlar blocks need explicit horizontal courses and staggered joints');
});
test('wall casting uses default sprite sun angle (left) and can follow edits',()=>{
 const orig=W.shadowVector('stone',1,{angle:160,length:1.05});
 assert(orig.x<0&&orig.y>0,'sprite angle 160 casts left and slightly down');
 const adjusted=W.shadowVector('stone',1,{angle:200,length:1.05});
 assert(adjusted.x<0&&adjusted.y<0,'changing global sprite angle changes wall cast');
 assert.equal(W.shadowVector('stone',2,{angle:160,length:1.05}).x,orig.x*2);
 const wall={a:[0,0],b:[1,0],kind:'stone'};
 const project=(x,y)=>({x:x*.8+7,y:y*.85-3});
 const ctx=makeContext();
 assert.equal(W.drawShadow(ctx,wall,project,1,{angle:160,length:1.05,softness:6}),true);
 assert(ctx.ops.some(x=>x.fn==='fill'));
 assert(ctx.ops.some(x=>x.fn==='stroke'));
 assert.equal(ctx.globalAlpha,.42,
  'wall cast defers the final alpha to the common shared tone and mask pass');
 assert.match(ctx.filter,/blur/);
 assert.equal(W.draw(ctx,wall,project,.75),true);
 assert(ctx.ops.filter(x=>x.fn==='fill').length>2,'opaque upright geometry, top and joins');
 const wood=makeContext();
 assert.equal(W.draw(wood,{...wall,kind:'palisade'},project,.75),true);
 assert(wood.ops.filter(x=>x.fn==='fill').length>2);
});


test('painted palisade v4 has six real raster edges and independent painted posts',()=>{
 const raster=W.palisadeRasterMeta;
 assert.equal(raster.length,6);
 const expected=[[128,139,0,72.369],[58,210,29,68.5],
  [128,139,128,71.816],[128,139,128,134.631],
  [58,210,29,194.131],[128,139,0,135.184]];
 assert.deepEqual(plain(raster),expected);
 for(let dir=0;dir<6;dir++){
  const filename=path.join(root,'assets','walls','palisade','edge_dir'+dir+'.webp');
  const bytes=fs.readFileSync(filename);
  assert.equal(bytes.subarray(0,4).toString(),'RIFF');
  assert.equal(bytes.subarray(8,12).toString(),'WEBP');
  assert(bytes.length>8000,'hand-painted source cannot be a CSS-vector proxy');
  const [w,h,ax,ay]=raster[dir];
  assert(w>20&&h>110&&ax>=0&&ax<=w&&ay>0&&ay<=h,
   'world-unit image bounds and canonical shared-edge anchor: '+dir);
 }
 for(const name of ['corner_post','end_post']){
  const bytes=fs.readFileSync(path.join(root,'assets','walls','palisade',name+'.webp'));
  assert.equal(bytes.subarray(8,12).toString(),'WEBP');
  assert(bytes.length>8000,'junction artwork must be a real painting');
 }
 const js=source('walls.js'),index=source('index.html');
 assert(js.includes("kind==='palisade'?'.webp':'.svg'"));
 assert(js.includes("image.src='assets/walls/palisade/'+name+'.webp'"));
 assert(js.includes("const end=node.degree===1"));
 assert(index.includes('walls.js?v=20261123-painted-palisade-v4'),
  'browser needs to invalidate cached proxy art');
 const app=source('app.js');
 assert(app.includes("'palisade-painted-webp-edge-inset-and-posts-v4'"));
});
test('twelve authored SVG variants exist and preserve canonical foot anchors',()=>{
 const meta=W.wallArtMeta;
 for(const kind of ['palisade','stone'])for(let dir=0;dir<6;dir++){
  const file=path.join(root,'assets','walls',kind,'edge_dir'+dir+'.svg');
  const svg=fs.readFileSync(file,'utf8');
  assert.match(svg,/^<\?xml[^]*<svg[\s\S]+<\/svg>\s*$/);
  assert.match(svg,/viewBox="/);
  assert(svg.includes('hex edge direction '+dir));
  assert(svg.includes('polygon'),'real painted polygons, not a placeholder link');
  const [width,height,anchorX,anchorY]=meta[kind][dir];
  assert(width>20&&height>120);
  assert(anchorX>=0&&anchorX<=width&&anchorY>=0&&anchorY<=height);
  const opening=svg.match(/<svg[^>]+>/)?.[0]||'';
  assert(opening.includes('width="'+width+'"')&&
   opening.includes('height="'+height+'"'),
   'sprite metadata must exactly match SVG raster dimensions');
  assert(kind==='stone'?svg.includes('ashlar'):svg.includes('timber'),
   'each family has distinct authored material geometry');
 }
 const app=source('app.js'),html=source('index.html');
 assert(app.includes('window.VedrasWalls.junctions(edges)'));
 assert(app.includes('window.VedrasWalls.drawJoin(ctx,obj.wallJoin'));
 assert(app.includes('window.VedrasWalls.drawJoinShadow(ctx,o.wallJoin'));
 assert(html.includes('walls.js?v=20261123-authored-art-and-joins-v3'));
 assert(app.includes("'authored-wall-directional-svg-corner-nodes-v3'"));
});

test('all six corner combinations resolve a single canonical joined node',()=>{
 const edges=R.DIRS.map(([q,r])=>({a:[0,0],b:[q,r],kind:'stone'}));
 const nodes=W.junctions(edges);
 assert.equal(nodes.filter(n=>n.degree===2).length,6,
  'each corner connects two different neighboring edge directions');
 assert.equal(nodes.filter(n=>n.degree===1).length,0,
  'the six sides of a closed hex have no open endpoints');
 assert.equal(nodes.length,6);
 const first=edges[0],next=edges[1];
 const pair=W.junctions([first,next]);
 assert.equal(pair.filter(n=>n.degree===2).length,1);
 const reversed=W.junctions([{a:first.b,b:first.a,kind:'stone'},next]);
 assert.deepEqual(plain(pair.map(x=>({id:x.id,degree:x.degree}))),
  plain(reversed.map(x=>({id:x.id,degree:x.degree}))));
 const mixed=W.junctions([first,{...next,kind:'palisade'}]);
 assert.equal(mixed.find(n=>n.degree===2).kind,'stone',
  'mixed stone/timber joints use a stone grounding pier');
 const node=pair.find(n=>n.degree===2);
 for(const zoom of [.5,1,2,4]){
  const c=makeContext(),sh=makeContext();
  const project=(x,y)=>({x:x,y:y*.85});
  assert(W.drawJoin(c,node,project,zoom));
  assert(W.drawJoinShadow(sh,node,project,zoom,{angle:160,length:1.05}));
  assert(c.ops.some(op=>op.fn==='fill'),'join fills opaque corner geometry');
  assert(sh.ops.some(op=>op.fn==='fill'),'join fills missing shadow pixel seam');
 }
});

test('actual 2.5D map hooks preserve scenery depth, save/import and reset',()=>{
 const app=source('app.js'),html=source('index.html'),ui=source('wall-ui.js');
 assert(app.includes("(o.type==='wall'||o.type==='wall-joint')?300"));
 assert(app.includes("if(o.type!=='wall'&&o.type!=='wall-joint'&&!o.asset?.img?.naturalWidth)return false"));
 assert(app.includes('visible.push({type:\'wall\',wallEdge,'),
  'walls are indexed as depth-sorted scene objects, not global overlay');
 assert(app.includes('if(obj.type===\'wall\')'));
 assert(app.includes('window.VedrasWalls.drawShadow(ctx,o.wallEdge'));
 assert(app.includes('window.VedrasWalls.blocksPoint(o.x,o.y,walls,22)'));

 assert(app.includes('window.VedrasSpriteShadows?.get?.().global'),
  'no independent wall sun vector');
 assert(app.includes('paintUnifiedNormalShadows(()=>{'),
  'wall casts share the nonstacking alpha mask with all ordinary sprites');
 assert(app.includes('wallEdges:visibleWallEdges()'));
 assert(app.includes('state.wallEdges=window.VedrasWalls.normalize(scene.wallEdges,wallEnvironment())'));
 assert(app.includes("'wallEdges','wallShown','wallKind'"));
 assert(app.includes("state.wallEdges=[];state.wallPaintMode=false;state.wallPaintOrigin=null"));
 assert(app.includes('state.wallEdges,state.wallShown'),
  'baked map / cache fingerprints include wall geometry and visibility');
 for(const key of ['wallPanel','wallKind','wallShown','wallPaint','wallNeighbors',
  'wallStatus','wallTest','wallRemoveLast','wallClear'])
  assert(html.includes('id="'+key+'"'),'missing usable editor control '+key);
 assert(html.includes('walls.js?v=')&&html.includes('wall-ui.js?v='));
 assert(ui.includes("W.removeEdge")&&ui.includes("W.setEdge"));
});
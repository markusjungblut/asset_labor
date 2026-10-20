/* v0.11.7: progressive world-aligned chunk rendering and large map wiring. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const w={},tasks=[],clock={now:()=>42};
vm.runInNewContext(fs.readFileSync(path.join(root,'chunks.js'),'utf8'),{
 window:w,requestIdleCallback:job=>tasks.push(job),performance:clock,console
},{filename:'chunks.js'});
const C=w.VedrasChunks;
assert.equal(C.SIZE,512);assert.equal(C.HALO,128);
function hexes(radius){const cells=[];for(let r=-radius;r<=radius;r++)for(let q=-radius;q<=radius;q++)
 if(Math.abs(q+r)<=radius)cells.push({q,r});return cells;}
for(const [radius,count] of [[1,7],[2,19],[3,37],[5,91],[7,169],[9,271],[11,397]])
 assert.equal(hexes(radius).length,count);
const cells=hexes(11);
const bound={x:-900,y:-700,width:1800,height:1400};
const visible=C.visible(bound,cells,512);
assert(visible.length>0&&visible.length<60,'viewport only tiles, not entire 397 hex map');
const one=visible[0],halo=C.neighbors(one,cells);
assert(halo.length>0&&halo.length<cells.length,'local halo cuts massive world to adjacent cell subset');
const stats={builds:0,draws:0,redraws:0};
const fakeCanvas={width:256,height:256};
const render=C.create({size:512,maxTiles:2,maxPixels:500000});
const build=t=>{stats.builds++;return {raster:{
 canvas:fakeCanvas,landLayer:{canvas:fakeCanvas},waterLayer:{canvas:fakeCanvas},
 x:t.x-128,y:t.y-128,width:t.size+256,height:t.size+256}}};
const ctx={save(){},restore(){},beginPath(){},rect(){},clip(){}};
const drawRaster=()=>{stats.draws++;};
render.configure('epoch-a',{worldCells:cells,buildTile:build,redraw:()=>stats.redraws++});
const initial=render.draw(ctx,{x:one.x,y:one.y,width:200,height:200},{drawRaster,margin:0});
assert(initial.visible>0&&initial.pending>0,'request only nearby chunks without blocking the draw');
assert.equal(stats.builds,0,'raster must not build on input/frame callback');
assert(tasks.length===1,'at most one asynchronous build is scheduled');
tasks.shift()();assert.equal(stats.builds,1);
assert(stats.redraws===1,'finished tile requests a new draw');
const painted=render.draw(ctx,{x:one.x,y:one.y,width:200,height:200},{drawRaster,margin:0});
assert(painted.painted>=1,'completed chunk is composited from cached raster');
const cached=render.stats().cacheHits;render.draw(ctx,{x:one.x,y:one.y,width:200,height:200},{drawRaster,margin:0});
assert(render.stats().cacheHits>cached,'return-pan reuses cached tile');
while(tasks.length&&stats.builds<10)tasks.shift()();
assert(render.stats().cached<=2,'LRU respects maximum count');
const before=stats.builds;
render.configure('epoch-b',{worldCells:cells,buildTile:build,redraw:()=>stats.redraws++});
assert(render.stats().cached===0,'terrain edit drops old chunks');
const stale=tasks.shift();if(stale)stale();
assert.equal(stats.builds,before,'stale idle tasks must not build outdated scene');
const clipped=C.tile(-3,4);assert.equal(clipped.x,-1536);assert.equal(clipped.y,2048);
const ab=C.tile(0,0),ba=C.tile(1,0);
assert.equal(ab.x+ab.size,ba.x,'adjacent chunk cores share exact world boundary');
assert(C.intersects({x:0,y:0,width:10,height:10},{x:9,y:9,width:2,height:2}));
assert(!C.intersects({x:0,y:0,width:10,height:10},{x:10,y:10,width:2,height:2}));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),
 autotile=fs.readFileSync(path.join(root,'autotile.js'),'utf8'),
 coast=fs.readFileSync(path.join(root,'shoreline.js'),'utf8'),
 html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const field of ['SCENE_SIZES=[7,19,37,91,169,271,397]',
 'const chunkMode=state.chunkRendering||state.sceneSize>37',
 'bounds,band:state.edgeWidth','terrainChunks.configure(chunkSignature',
 'terrainChunks.draw(ctx','shorelineChunks.configure(signature',
 'shorelineChunks.draw(ctx','genericObjects(view)',
 "if(!inView(p.x+n.dx,p.y+n.dy,220))continue",
 'reliefFieldCache','state.chunkRendering=!!scene.chunkRendering',
 'sceneSize:state.sceneSize,chunkRendering:state.chunkRendering'])
 assert(app.includes(field),'chunk map integration missing '+field);
assert(autotile.includes('bounds=null')&&autotile.includes('textureCache=new WeakMap'),
 'world-aligned autotile chunk bounds and shared source decoded texels');
assert(coast.includes('options.segments||segments(cells,isWet)')&&coast.includes('const bbox=options.bounds||null'),
 'chunk coastline keeps global coast neighborhood');
for(const name of ['91','169','271','397'])
 assert(html.includes('<option value="'+name+'">'),'new map size '+name);
assert(html.indexOf('chunks.js?v=0.29.0')<html.indexOf('app.js?v=0.29.0'));
assert(html.includes('id="chunkStats"')&&html.includes('id="chunkRendering"'));
assert(!fs.readFileSync(path.join(root,'forest-ground.js'),'utf8').includes('VedrasChunks'),
 'forest floor existing union renderer and textures untouched');
console.log('PASS: 397-cell map, visible-only queued chunks, LRU, idle cancellation, exact chunk core alignment, coast halo, large-map UI and scene persistence.');

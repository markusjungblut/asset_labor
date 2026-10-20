/* v0.11.6 – organic road materials, alpine road ban and bounded caches. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),w={};
vm.runInNewContext(fs.readFileSync(path.join(root,'roads.js'),'utf8'),{window:w},{filename:'roads.js'});
const R=w.VedrasRoads,hex={q:0,r:0},neighbors=R.DIRS.map(([q,r])=>({q,r})),cells=[hex,...neighbors];
const roads=neighbors.map(n=>({a:[0,0],b:[n.q,n.r],level:'trail'}));
const blocked=new Set(['0,0','1,0']);
const forbid=c=>blocked.has(R.key(c));
assert.equal(R.normalizeEdges(roads,cells,()=>false,forbid).length,0,'mountain center excludes all six exits');
const endpoints=R.normalizeEdges(roads,cells,()=>false,c=>R.key(c)==='1,0');
assert.equal(endpoints.length,5,'mountain endpoint is forbidden, surrounding connections survive');
const illegal=R.setEdge([],hex,{q:1,r:0},'stone',cells,()=>false,forbid);
assert.equal(illegal.length,0,'road upgrades cannot evade the mountain ban');
const legal=R.setEdge([],hex,{q:1,r:-1},'trail',cells,()=>false,()=>false);
assert.equal(legal.length,1,'non-mountain land road still works');
assert.equal(R.mask(roads,hex),63,'six-way graph topology remains intact when allowed');
const p0=R.course(roads[0]),p1=R.course(roads[0]);
assert.equal(p0,p1,'world-space road curves are memoized');
const reverse={a:roads[0].b,b:roads[0].a,level:'trail'};
const p2=R.course(reverse);
assert(Math.abs(p2[0].x-R.center({q:1,r:-1}).x)<1e-9,'reverse geometry has correct starting point');
assert(Math.abs(p2.at(-1).x-R.center(hex).x)<1e-9,'reverse geometry has correct endpoint');
for(const mat of R.levels)assert(R.profiles[mat].opacity<1,'surface blends with terrain: '+mat);
assert(R.profiles.trail.width<R.profiles.packed.width&&R.profiles.packed.width<R.profiles.stone.width,
 'distinct walking, cart and stone surfaces');
assert(R.profiles.trail.outer>R.profiles.trail.width*2,'worn trails feather well beyond their compacted core');
const events=[];
const ctx={save:()=>events.push('save'),restore:()=>events.push('restore'),
 moveTo(){},lineTo(){},arc(){},beginPath(){},fill(){},stroke(){},
 ellipse:()=>events.push('grain'),createPattern:()=>null};
const full=R.render(ctx,[roads[0]],{detail:true});
assert.equal(full.edges,1);assert(events.includes('grain'),'visible dust grains/pebbles and footprint marks');
events.length=0;
const fast=R.render(ctx,[roads[0]],{detail:false});
assert.equal(fast.edges,1);assert(!events.includes('grain'),'small zoom has lower-cost road detail');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),
 html=fs.readFileSync(path.join(root,'index.html'),'utf8'),
 editor=fs.readFileSync(path.join(root,'road-ui.js'),'utf8');
for(const fragment of ['function roadBlockedHexes()','window.VedrasMountains.influence(m)',
 "c.biome==='mountain'",'roadBlockedMemo',
 'const edges=window.VedrasRoads.normalizeEdges(next,worldCells,wetHex,',
 'state.roadEdges=visibleRoadEdges()','roadBlockedCell(previousCell)',
 "detail:state.zoom>=.80", 'function shadowLocalMask(width,settings,global)',
 'mountainShadowRasterCache','mountainShadowCachedPixels>5000000',
 'mountainOriginForObject(o,cfg)','reliefRasterCache.signature',
 'terrainRasterCache.graph','bridgeCrossingsCache',
 'coveredByMountains=new Set','window.__vedrasRenderProfile',
 "averageObjectsMs:mean('objectsMs')"])
 assert(app.includes(fragment),'missing mountain veto or optimization: '+fragment);
assert(editor.includes('core.roads.blocked'),'six-way editor vetoes alpine connections');
assert(html.includes('perfStats')&&html.includes('Asset-Labor v0.11.6'));
assert(html.includes('roads.js?v=0.28.0')&&html.includes('app.js?v=0.28.0'));
assert(html.includes('bis 2× (leistungsoptimiert)'));
for(let i=0;i<6;i++){
 const svg=fs.readFileSync(path.join(root,'assets/bridges/bridge_dir_'+String(i).padStart(2,'0')+'.svg'),'utf8');
 assert(svg.includes('id="deck"')&&svg.includes('id="rail"'),'timber palette and rails exist');
 assert((svg.match(/width="9.2" height="38"/g)||[]).length>=12,
  'distinct grainy oak planks per bridge direction '+i);
}
console.log('PASS: mountain hex veto, 64-way graph preserved, organic tread detail, LOD, cached terrain and shadows, six upgraded timber bridges.');

/* Hex-center road graph regression: all 64 junction combinations, exact
 * shared side portals, mixed-material road upgrades and scene integration. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),window={};
vm.runInNewContext(fs.readFileSync(path.join(root,'roads.js'),'utf8'),{window},{filename:'roads.js'});
const R=window.VedrasRoads;
const center={q:0,r:0};
const cells=[center,...R.DIRS.map(([q,r])=>({q,r}))];
const wet=()=>false;
assert.equal(R.DIRS.length,6);
assert.equal(R.levels.length,3);
assert(R.levels.includes('trail')&&R.levels.includes('packed')&&R.levels.includes('stone'));
for(let bits=0;bits<64;bits++){
 let edges=[];
 for(let i=0;i<6;i++)if(bits&(1<<i)){
  const [q,r]=R.DIRS[i];edges=R.setEdge(edges,center,{q,r},'trail',cells,wet);
 }
 assert.equal(edges.length,R.degree(edges,center));
 assert.equal(R.mask(edges,center),bits,'all six independent arms and their combinations: '+bits);
 const normalized=R.normalizeEdges(edges,cells,wet);
 assert.deepEqual(JSON.parse(JSON.stringify(edges)),JSON.parse(JSON.stringify(normalized)),'stable normalized graph '+bits);
 const reverse=edges.slice().reverse().map(e=>({...e,a:e.b,b:e.a}));
 assert.equal(R.mask(R.normalizeEdges(reverse,cells,wet),center),bits,'unordered undirected links '+bits);
 for(const e of edges){
  assert.equal(R.course(e)[0].x,R.center({q:e.a[0],r:e.a[1]}).x);
  const points=R.course(e);
  const shared=R.port(e.a,e.b);
  assert(Math.hypot(points[8].x-shared.x,points[8].y-shared.y)<1e-9,
   'exact half-hex crossing: '+bits);
  const last=points.at(-1),finish=R.center({q:e.b[0],r:e.b[1]});
  assert(Math.hypot(last.x-finish.x,last.y-finish.y)<1e-9);
 }
}
let edges=R.DIRS.map(([q,r])=>({a:[0,0],b:[q,r],level:'trail'}));
edges=R.normalizeEdges(edges,cells,wet);
assert.equal(R.degree(edges,center),6,'sixfold star must be fully supported');
const northeast={q:1,r:-1};
edges=R.setEdge(edges,center,northeast,'stone',cells,wet);
assert.equal(edges.length,6,'upgrading a road MUST retain the graph');
assert.equal(edges.find(e=>R.identity(e.a,e.b)===R.identity(center,northeast)).level,'stone');
assert.equal(R.mask(edges,center),63,'upgrading preserves all neighbor connections');
edges=R.removeEdge(edges,center,northeast,cells,wet);
assert.equal(edges.length,5);assert.equal(R.mask(edges,center),62);
const blocked=R.normalizeEdges([{a:[0,0],b:[1,-1],level:'trail'}],cells,c=>c.q===1&&c.r===-1);
assert.equal(blocked.length,0,'paths do not automatically span wet hexes');
assert.equal(R.normalizeEdges([{a:[0,0],b:[5,5]}],cells,wet).length,0,'non-adjacent rejected');
assert.equal(R.normalizeEdges([{a:[0,0],b:[3,0]}],cells,wet).length,0,'out-of-scene rejected');
const duplicated=R.normalizeEdges([
 {a:[1,-1],b:[0,0],level:'trail'},
 {a:[0,0],b:[1,-1],level:'stone'}
],cells,wet);
assert.equal(duplicated.length,1);assert.equal(duplicated[0].level,'stone');
const calls=[];
const ctx={
 save(){calls.push('save');},restore(){calls.push('restore')},
 beginPath(){calls.push('path')},moveTo(){},lineTo(){},
 stroke(){calls.push('stroke')},arc(){calls.push('arc')},fill(){calls.push('fill')},
 createPattern(){return {pattern:true}}
};
const result=R.render(ctx,duplicated,{hex:256});
assert.equal(result.edges,1);assert.equal(result.nodes,2);
assert(calls.includes('stroke')&&calls.includes('arc')&&calls.includes('fill'),'network strokes and junction disks drawn');
assert.equal(calls.filter(x=>x==='save').length,calls.filter(x=>x==='restore').length);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const ui=fs.readFileSync(path.join(root,'road-ui.js'),'utf8');
for(const name of ['roadPanel','roadNeighbors','roadPaint','roadJunctionTest','roadShown','roadMaterial'])
 assert(html.includes('id="'+name+'"'),'road control missing: '+name);
assert(html.indexOf('roads.js?v=0.27.0')<html.indexOf('app.js?v=0.27.0'));
assert(html.indexOf('app.js?v=0.27.0')<html.indexOf('road-ui.js?v=0.27.0'));
for(const field of ['roadEdges:','roadShown:','roadMaterial:','state.roadEdges=',
 'window.VedrasRoads.render(ctx,','window.VedrasRoads.setEdge(state.roadEdges',
 "window.dispatchEvent(new Event('vedras:road-changed'))"])
 assert(app.includes(field),'missing map integration: '+field);
assert(!app.includes("const road=[[1,-1],[0,0],[-1,1]]"),'remove old fixed demo road');
assert(ui.includes('R.DIRS.forEach')&&ui.includes('R.removeEdge')&&ui.includes('R.setEdge'));
assert(html.includes('Flüsse anzeigen'),'river visibility independent of roads');
console.log('PASS: 64 six-way junction bitmasks, shared centre and port continuity, road upgrades, import/export, and editor.');

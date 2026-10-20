/* v0.11.5 roads over rivers: bridge locations/orientations and anchor removal. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),w={};
for(const file of ['roads.js','river.js','bridges.js'])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),{window:w},{filename:file});
const R=w.VedrasRoads,V=w.VedrasRivers,B=w.VedrasBridges;
const cells=[];for(let q=-3;q<=3;q++)for(let r=-3;r<=3;r++)if(Math.abs(q+r)<=3)cells.push({q,r});
const water=c=>c.q===2&&c.r===0;
const route=V.findRoute(cells,water,{q:-2,r:0});
assert(route&&V.valid(route,cells,water),'real side-following river');
const edges=[];
for(const c of cells)if(!water(c))for(const [dq,dr] of R.DIRS){
 const n=cells.find(v=>v.q===c.q+dq&&v.r===c.r+dr);
 if(n&&!water(n)){
  const e={a:[c.q,c.r],b:[n.q,n.r],level:'trail'};
  if(!edges.some(o=>R.identity(o.a,o.b)===R.identity(e.a,e.b)))edges.push(e);
 }
}
const results=B.candidates(edges,[route],cells,water,40);
assert(results.length>=3,'real road network crosses edge-based river');
assert(results.every(x=>x.dir>=0&&x.dir<6&&x.length>=88));
assert.equal(B.candidates(edges,[],cells,water,40).length,0,'no water => no bridges');
assert.equal(B.candidates([], [route],cells,water,40).length,0,'no roads => no bridges');
assert(B.urls.length===6,'all orientations have their own image');
for(let i=0;i<6;i++){
 const filename='assets/bridges/bridge_dir_'+String(i).padStart(2,'0')+'.svg';
 const svg=fs.readFileSync(path.join(root,filename),'utf8');
 assert(svg.includes('<svg')&&svg.includes('rotate('+([-60,0,60,120,180,240][i])+')'),
  'image has correct world-space axial orientation: '+i);
 assert(svg.includes('id="deck"')&&svg.includes('id="rail"'),'bridge has textured deck and timber rims');
 assert.equal(B.urls[i],filename);
}
assert.equal(B.intersection({x:0,y:0},{x:10,y:0},{x:5,y:-5},{x:5,y:5}).x,5);
assert.equal(B.intersection({x:0,y:0},{x:10,y:0},{x:0,y:5},{x:10,y:5}),null);
const map=R.DIRS.map(([q,r])=>({q,r}));
const strip=[{a:[0,0],b:[1,0],level:'trail'}];
const existing=[{q:0,r:0,dx:1,dy:5,source:'auto'},{q:1,r:0,dx:4,dy:0,source:'manual'},
 {q:0,r:1,dx:30,dy:30,source:'auto'}];
const buildings={'0,0':{path:'building.png'},'0,1':{path:'other.png'}};
const cleared=R.clearCorridor([],strip,existing,buildings);
assert.equal(cleared.natureInstances.length,1,'remove only roots on newly laid path');
assert.equal(cleared.natureInstances[0].r,1,'outlying sprite roots remain');
assert(!cleared.hexObjects['0,0']&&cleared.hexObjects['0,1'],'clear only building anchor on path');
const upgrade=R.clearCorridor(strip,[{...strip[0],level:'stone'}],existing,buildings);
assert.equal(upgrade.removed,0,'upgrading does not arbitrarily remove new nearby objects');
const outside=R.clearCorridor(strip,[],existing,buildings);
assert.equal(outside.removed,0,'removing road does not clear roots');
assert(R.blocksPoint(0,0,strip,8),'root blocked on road');
assert(!R.blocksPoint(0,60,strip,8),'overhanging trees can keep roots off road');
const ctxCalls=[];
const ctx={save:()=>ctxCalls.push('save'),restore:()=>ctxCalls.push('restore'),
 translate:()=>{},rotate:()=>{},fillRect:()=>ctxCalls.push('fallback'),drawImage:()=>ctxCalls.push('bridge')};
assert.equal(B.render(ctx,results,{groundY:(x,y)=>y-9}),results.length,'visible deck for each actual crossing');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),
 ui=fs.readFileSync(path.join(root,'road-ui.js'),'utf8'),
 nature=fs.readFileSync(path.join(root,'nature-ui.js'),'utf8'),
 html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const riverIndex=app.indexOf('for(const route of routes){',app.indexOf('function drawRoads(){'));
const roadsIndex=app.indexOf('window.VedrasRoads.render(ctx,visibleEdges',riverIndex);
const bridgeIndex=app.indexOf('window.VedrasBridges.render(ctx,crossings',roadsIndex);
assert(riverIndex>=0&&roadsIndex>riverIndex&&bridgeIndex>roadsIndex,
 'render in precise order: terrain, river, sandy paths, bridge');
assert(html.indexOf('river.js?v=0.28.0')<html.indexOf('bridges.js?v=0.28.0'));
assert(html.indexOf('bridges.js?v=0.28.0')<html.indexOf('app.js?v=0.30.0'));
assert(app.includes('function applyRoadChanges(next)')&&app.includes('clearCorridor(previous,edges'));
assert(app.includes('if(o.type!==\'mountain\'&&window.VedrasRoads.blocksPoint'));
assert(ui.includes('core.roads.apply(next)'),'all click and junction actions use clearance');
assert(nature.includes('blocksRoad(inst.q,inst.r')&&nature.includes('blocksRoad(q,r,dx,dy)'),
 'new vegetation cannot repopulate road root corridors');
assert(!fs.readFileSync(path.join(root,'forest-ground.js'),'utf8').includes('VedrasBridges'),
 'never alter forest-floor renderer');
console.log('PASS: six SVG bridge orientations, real crossings, river-first layer, 2-D corridor clearing and replant exclusions.');

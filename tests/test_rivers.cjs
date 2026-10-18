/* River topologies, source caps, water mouths, and coast exclusions. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),window={};
const context=vm.createContext({window});
for(const file of ['river.js','shoreline.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const R=window.VedrasRivers,S=window.VedrasShoreline,close=(a,b)=>Math.abs(a-b)<1e-8;
const same=(a,b)=>close(a.x,b.x)&&close(a.y,b.y);
const cells=[];for(let q=-3;q<=3;q++)for(let r=-3;r<=3;r++)if(Math.abs(q+r)<=3)cells.push({q,r});
const get=(q,r)=>cells.find(c=>c.q===q&&c.r===r);
const sea=get(2,0),wet=c=>c.q===sea.q&&c.r===sea.r;
assert.equal(R.DIRS.length,6);
assert.deepEqual(JSON.parse(JSON.stringify(R.DIRS)),JSON.parse(JSON.stringify(S.DIRS)),'same shoreline orientation');
for(const [i,[dq,dr]] of R.DIRS.entries()){
 assert.equal(R.side(get(0,0),get(dq,dr)),i,'direction '+i);
 assert.equal(R.side(get(dq,dr),get(0,0)),(i+3)%6);
 assert(same(R.midpoint(get(0,0),i),R.midpoint(get(dq,dr),(i+3)%6)),'shared edge '+i);
}
const route=R.findRoute(cells,wet,{q:-2,r:0});
assert(route&&R.valid(route,cells,wet),'river must reach genuine water');
assert.deepEqual(JSON.parse(JSON.stringify(route.hexes)),[[-2,0],[-1,0],[0,0],[1,0],[2,0]]);
const sections=R.sections(route,cells,wet);
assert.equal(sections.length,4);
assert.equal(sections[0].kind,'source');
assert.equal(sections[1].kind,'straight');
assert.equal(sections[2].kind,'straight');
assert.equal(sections[3].kind,'mouth');
assert(same(sections[0].start,R.vertices(get(-2,0))[sections[0].corner]),'source starts exactly on a hex CORNER');
for(let i=1;i<sections.length;i++){
 assert(same(sections[i-1].end,sections[i].start),'NO gap or overlap across shared hex edge '+i);
}
const mouths=R.mouths([route],cells,wet);
assert(mouths.has('1,0:1'));
const allCoast=S.segments(cells,wet),openCoast=S.segments(cells,wet,mouths);
assert.equal(allCoast.length-openCoast.length,1,'only the actual river mouth removes a sandy coastline');
assert(!openCoast.some(e=>e.cell.q===1&&e.cell.r===0&&e.side===1));
const bad={hexes:[[-2,0],[-1,0],[0,0],[1,0]]};
assert(!R.valid(bad,cells,wet),'river may not stop on land');
assert(!R.valid({hexes:[[0,0],[2,0]]},cells,wet),'route must use adjacent hexes');
assert(!R.valid({hexes:[[2,0],[1,0]]},cells,wet),'water source forbidden');
assert(!R.findRoute(cells,()=>false,get(-2,0)),'no phantom water tile');
assert(!R.valid({hexes:[[0,0],[99,0]]},cells,wet),'off-map mouth forbidden');
const one={hexes:[[1,0],[2,0]]};
assert.equal(R.sections(one,cells,wet)[0].kind,'source_mouth');
for(let i=0;i<6;i++){
 const [dq,dr]=R.DIRS[i],water=get(dq,dr);
 const pair={hexes:[[0,0],[dq,dr]]};
 const s=R.sections(pair,cells,c=>c===water);
 assert.equal(s.length,1);assert.equal(s[0].outSide,i);
 assert(same(s[0].start,R.vertices(get(0,0))[s[0].corner]));
}
const curve={hexes:[[-1,1],[0,0],[1,0],[2,0]]};
const bend=R.sections(curve,cells,wet);
assert(bend.some(s=>s.kind==='curve'),'turn yields curve segment');
const stroked=[],ctx={moveTo:(...x)=>stroked.push(['M',...x]),quadraticCurveTo:(...x)=>stroked.push(['Q',...x]),lineTo:(...x)=>stroked.push(['L',...x])};
R.trace(ctx,route,cells,wet);
assert.deepEqual(stroked[0][0],'M');assert(stroked.some(x=>x[0]==='Q'));
const raised=[];R.trace({moveTo:(...x)=>raised.push(['M',...x]),lineTo:(...x)=>raised.push(['L',...x])},route,cells,wet,(x,y)=>y-10);
assert(close(raised[0][2],sections[0].start.y-10),'relief maps source onto ground');
const calls=[],g={
 setTransform(){},beginPath(){},moveTo(){},quadraticCurveTo(){},lineTo(){},stroke(){calls.push(['stroke',this.lineCap,this.lineWidth,this.strokeStyle]);},
 save(){},restore(){},fillRect(){calls.push(['fill',this.globalCompositeOperation,this.fillStyle]);},
 createPattern(){calls.push(['waterTexture']);return {setTransform(){}};},
 createLinearGradient(){return {addColorStop(){}};}
};
const globalCtx={drawImage(){calls.push(['paint'])}};
const document={createElement(){return {width:0,height:0,getContext(){return g}}}};
const renderWindow={},scope={window:renderWindow,document};
vm.runInNewContext(fs.readFileSync(path.join(root,'river.js'),'utf8'),scope,{filename:'river.js'});
const paint=renderWindow.VedrasRivers.render(globalCtx,route,cells,wet,{naturalWidth:256},{width:32});
assert(paint?.canvas&&paint.widthWorld>0);
assert(calls.some(x=>x[0]==='waterTexture'),'river overlays the actual WATER texture');
assert(calls.some(x=>x[0]==='stroke'&&x[1]==='round'&&x[2]===32),'same body and rounded source cap');
assert(!calls.some(x=>typeof x[3]==='string'&&/sand|beach|rgba\(212,190,143|#dacb8b/.test(x[3])),'NO beach or sand along river');
assert(calls.some(x=>x[0]==='fill'&&x[1]==='source-in'),'water fills soft alpha mask only');
assert(calls.some(x=>x[0]==='stroke'&&x[1]==='butt'),'mouth fades inside receiving water tile');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const s of ['river.js?v=0.14.1','river-ui.js?v=0.14.1','id="riverPanel"','id="riverAdd"','id="riverClear"'])assert(html.includes(s));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
assert(app.includes('riverPaths:riverRoutes()'));assert(app.includes('skipEdges'));assert(app.includes('riverRasterCache'));
console.log('PASS: 6 aligned sides, straight/bent segments, corner-rounded source, transparent river water, seam-safe mouths, shoreline exclusion, persistence.');

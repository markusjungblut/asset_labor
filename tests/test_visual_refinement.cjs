/* Refinement tests: global shade, draggable offsets, edge-constrained rivers
 * and strictly untouched forest ground renderer. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),w={};
for(const file of ['shadow-system.js','river.js','forest.js','nature-balance.js'])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),{window:w},{filename:file});
const S=w.VedrasShadows,R=w.VedrasRivers,F=w.VedrasForest,B=w.VedrasNatureBalance;
assert.equal(S.globalStrength(0),0);
assert.equal(S.globalStrength(.68),.68);
assert.equal(S.globalStrength(4),2);
const base=S.settings(),anchor={x:.5,y:.67},w0=350,h0=400;
const before=S.projectedPoint('mountain',w0,h0,anchor,base.reach,.5,0,base);
const shifted=S.projectedPoint('mountain',w0,h0,anchor,base.reach,.5,0,{...base,originX:base.originX-.25});
assert(Math.abs(before.x-shifted.x-w0*.25)<1e-6,'origin X shifts cast without changing the real mountain');
assert(before.x<0&&before.y>0,'mountain casts left and down');
const broad=S.projection('mountain',base.reach,{spread:1.6});
const narrow=S.projection('mountain',base.reach,{spread:.75});
assert(broad.a>narrow.a,'footprint width is authorable');
assert(S.projection('mountain',base.reach).c<S.projection('mountain',2).c,'reach still controls projection');
assert.equal(S.settings({opacity:0}).opacity,0);
assert.equal(S.settings({spread:999}).spread,2.5);
const cells=[];for(let q=-3;q<=3;q++)for(let r=-3;r<=3;r++)if(Math.abs(q+r)<=3)cells.push({q,r});
const sea=cells.find(c=>c.q===2&&c.r===0),wet=c=>c===sea;
const route=R.findRoute(cells,wet,{q:-2,r:0}),sections=R.sections(route,cells,wet);
const pts=R.coursePoints(sections,route,40);
assert(pts.length>sections.flatMap(s=>s.path).length,'fillets add smooth interpolated points');
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
assert(distance(pts[0],sections[0].start)<1e-7,'source remains on its exact original corner');
assert(distance(pts.at(-2),R.midpoint(sections.at(-1),sections.at(-1).outSide))<1e-7,'coast midpoint preserved');
assert(R.blocksPoint(pts[Math.floor(pts.length/2)].x,pts[Math.floor(pts.length/2)].y,[route],cells,wet,40),
 'nature blocking uses precisely the smoothed stream');
assert.equal(F.treeTarget({suitability:1,forestClass:'dense_forest'}),5);
assert.equal(F.maxObjects({suitability:1,forestClass:'dense_forest'}),8);
assert(B.sizeFactor({kind:'tree',sizeClass:'medium'})<.75);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),app=fs.readFileSync(path.join(root,'app.js'),'utf8'),editor=fs.readFileSync(path.join(root,'nature-ui.js'),'utf8');
for(const id of ['shadowGlobalStrength','mountainOriginX','mountainOriginY','mountainRootWidth','mountainContactWidth','mountainAngle','mountainLength','shadowHandles','shadowAssetApply','shadowResetInstance'])
 assert(html.includes('id="'+id+'"'),'shadow control must exist: '+id);
for(const part of ['shadowDrag.instance.shadowOriginX','shadowDrag.instance.shadowOriginY',
 'shadowGlobal:state.shadowGlobal','shadowAssetPresets:state.shadowAssetPresets',
 'state.shadowHandles=!!scene.shadowHandles','sceneShadowStrength()',
 'mask:\'sdf-v5\''])
 assert(app.includes(part),'map integration: '+part);
assert(editor.includes('encodeInstanceShadow(values)')&&editor.includes('shadowAssetApply'),'editor persists profiles');
assert(!fs.readFileSync(path.join(root,'forest-ground.js'),'utf8').includes('sdf-v5'),'river must not alter forest floor');
console.log('PASS visual refinement: tunable shadows, drag origins, river fillets and exact coast ports, smaller denser vegetation, scene persistence and unchanged forest layer.');

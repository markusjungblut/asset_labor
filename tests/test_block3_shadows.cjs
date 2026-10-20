/* Block 3: validate shadow cast direction, foot anchors, falloff and ordering. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),window={};
vm.runInNewContext(fs.readFileSync(path.join(root,'shadow-system.js'),'utf8'),{window});
const S=window.VedrasShadows;
const mountainAnchor={x:.5,y:.67},treeAnchor={x:.5,y:.96};
for(const [kind,width,height,anchor] of [['mountain',360,420,mountainAnchor],['nature',110,150,treeAnchor]]){
 const foot=S.projectedPoint(kind,width,height,anchor,1.35,anchor.x,anchor.y);
 assert(kind==='mountain'?foot.x<0&&foot.y>0:Math.abs(foot.x)<.0001&&Math.abs(foot.y)<.0001,'configurable mountain shadow offsets and original Nature foot');
 const summit=S.projectedPoint(kind,width,height,anchor,1.35,anchor.x,0);
 assert(summit.x<0&&summit.y>0,'sun on upper-right -> summit casts visibly lower-left '+kind);
 const farther=S.projectedPoint(kind,width,height,anchor,2,anchor.x,0);
 assert(farther.x<summit.x,'reach slider increases actual leftward extent '+kind);
 assert(farther.y>0,'cast stays below root even when reach increases');
 const m=S.projection(kind,1.35);
 assert(m.c>0&&m.d<0,'height must project LEFT and DOWN');
}
const calls=[];
const ctx={
 save(){calls.push(['save']);},restore(){calls.push(['restore']);},
 translate(...a){calls.push(['translate',...a]);},
 transform(...a){calls.push(['transform',...a]);},
 beginPath(){calls.push(['beginPath']);},rect(...a){calls.push(['rect',...a]);},
 clip(){calls.push(['clip']);},drawImage(...a){calls.push(['drawImage',...a]);},
 scale(...a){calls.push(['scale',...a]);},arc(...a){calls.push(['arc',...a]);},
 fill(){calls.push(['fill']);},createRadialGradient(...a){calls.push(['gradient',...a]);return {addColorStop(paint,color){calls.push(['stop',paint,color]);}}}
};
S.cast(ctx,{canvas:{}},{x:200,y:150},300,390,mountainAnchor,1.55,'mountain',.8,11);
assert(calls.some(x=>x[0]==='transform'&&x[4]<0),'actual Canvas transform projects the height below the foot');
assert(calls.some(x=>x[0]==='clip'),'exclude silhouette below the root');
assert(calls.some(x=>x[0]==='drawImage'),'draw alpha silhouette rather than a simple rectangle');
assert(calls.some(x=>x[0]==='restore'),'transforms must not bleed into sprite draw');
const old=calls.length;
S.cast(ctx,{canvas:{}},{x:200,y:150},300,390,mountainAnchor,1.55,'mountain',0,11);
assert.equal(calls.length,old,'zero intensity suppresses cast');
S.contact(ctx,{x:200,y:150},220,'mountain',1);
const stops=calls.filter(x=>x[0]==='stop');
assert(stops.length>=4,'multistop contact fading instead of one hard oval');
assert(stops[stops.length-1][2].endsWith(',0)'),'outer contact fades completely into terrain');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const nature=fs.readFileSync(path.join(root,'nature-ui.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.includes('shadow-system.js?v=0.24.0'),'browser loads shadow system');
assert(html.indexOf('shadow-system.js?v=0.24.0')<html.indexOf('app.js?v=0.30.0'),'shadow system loaded before app renderer');
for(const fragment of ['Sh.paintMountain(g,{x:-left,y:-top},w,cfg,global)',
 'mountainOriginForObject(o,cfg)','mountainShadowRasterCache',
 "projection:'cached-local-mountain-shadow'",'drawNatureGrounding(o,p)',
 'cacheHits:hits,cacheMisses:misses']){
 assert(app.includes(fragment),'missing shadow integration: '+fragment);
}
assert(app.indexOf('drawMountainShadows(objs);')<app.indexOf('for(const o of objs){\n   const p=toScreen(o.x,o.y);\n   if(p.x<-450'),'ground shadows precede visible sprite pass');
assert(app.includes('sortY:toScreen(o.x,heightAdjusted).y'),'sort by projected relief-adjusted foot');
assert(app.includes('return a.sortY-b.sortY'),'ground foot used in painter sort');
assert(app.includes("else if(o.type==='building'){"),'buildings receive grounding');
assert(nature.includes('encodeInstanceShadow(values)')&&nature.includes('core.persistScene()'),'per-mountain slider persists');
assert(html.includes('Schattenlänge'),'direction is explained in UI');
console.log('PASS: mountain and Nature casts travel down-left from exact foot, softness/alpha modes, contact falloff, renderer depth order and slider persistence.');

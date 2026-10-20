/* Fallen-log shadow geometry and renderer regression.
 * Run: node tests/test_fallen_log_shadows_20261021.cjs
 * Source sprites and Nature catalog are intentionally read-only.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const begin=app.indexOf("const FALLEN_LOG_FAMILIES=new Set(");
const end=app.indexOf("// If a neighboring tree is projected",begin);
assert(begin>=0&&end>begin,'fallen-log shadow implementation found');
assert(app.includes("const sh=isFallenLog(o)?null:pairedShadow(o);"),
 'no additional paired shadow for lying trunks');
const source=app.slice(begin,end);
const records=[];
let contacts=0,otherCasts=0,strength=1;
const fakeCtx={
 save(){records.push(['save']);},restore(){records.push(['restore']);},
 beginPath(){records.push(['beginPath']);},
 ellipse(...args){records.push(['ellipse',...args]);},
 fill(){records.push(['fill']);},
 translate(...args){records.push(['translate',...args]);},
 transform(...args){records.push(['transform',...args]);},
 drawImage(...args){records.push(['drawImage',...args]);}
};
const state={zoom:1};
const silhouettes={canvas:{id:'real-alpha-of-fallen-log'},aspect:.44};
const win={VedrasShadows:{
 contact(){contacts++;},cast(){otherCasts++;}
}};
const setup=new Function('state','ctx','sceneShadowStrength','shadowSilhouette',
 'clamp','window',source+'\nreturn {isFallenLog,fallenLogShadowGeometry,drawNatureGrounding};');
const shadow=setup(state,fakeCtx,()=>strength,()=>silhouettes,
 (v,a,b)=>Math.max(a,Math.min(b,v)),win);
const pos={x:420,y:340};
function obj(family,w=140){
 return {w,natureMeta:{family,kind:'cluster',anchor:{x:.5,y:.96}},
  asset:{img:{naturalWidth:340,naturalHeight:160}}};
}
assert(shadow.isFallenLog(obj('fallen_logs')));
assert(shadow.isFallenLog(obj('snow_fallen_logs')));
assert(!shadow.isFallenLog(obj('ground_cover')));
assert(!shadow.isFallenLog({type:'building'}));
for(const zoom of [.5,1,2]){
 state.zoom=zoom;records.length=0;contacts=0;otherCasts=0;strength=1;
 const log=obj('fallen_logs'),g=shadow.fallenLogShadowGeometry(log,pos);
 shadow.drawNatureGrounding(log,pos);
 const ellipses=records.filter(x=>x[0]==='ellipse'),
  draws=records.filter(x=>x[0]==='drawImage'),
  transforms=records.filter(x=>x[0]==='transform');
 assert.equal(ellipses.length,1,'one elongated shadow footprint per log');
 assert.equal(draws.length,1,'one true-alpha silhouette cast per log');
 assert.equal(draws[0][1],silhouettes.canvas,'use alpha silhouette, not PNG rectangle');
 assert.equal(transforms.length,1,'directional, flattened shadow geometry');
 assert.equal(contacts,0,'no generic circular ground shadow');
 assert.equal(otherCasts,0,'no generic cluster shadow');
 assert(g.x<pos.x,'shadow center must be LEFT of sprite anchor');
 assert(g.rx>=g.ry*4,'ground shadow should be strongly elongated');
 assert.equal(ellipses[0][1],g.x,'drawn at computed left-offset x');
 assert.equal(ellipses[0][3],g.rx,'actual footprint uses full log width');
 assert(g.blur>=1.5&&g.blur<=8);
 assert(Math.abs(g.width-log.w*zoom)<1e-9,'responds to zoom scale');
}
state.zoom=1;
const regular=shadow.fallenLogShadowGeometry(obj('fallen_logs'),pos);
const snow=shadow.fallenLogShadowGeometry(obj('snow_fallen_logs'),pos);
assert(snow.opacity<regular.opacity,'snow-log shadow slightly softer');
records.length=0;strength=0;
shadow.drawNatureGrounding(obj('fallen_logs'),pos);
assert.equal(records.length,0,'global shadow strength zero switches log shadows off');
strength=1;records.length=0;contacts=0;otherCasts=0;
shadow.drawNatureGrounding(obj('ordinary_cluster'),pos);
assert.equal(contacts,1,'non-log Nature retains existing contact shadow');
assert.equal(otherCasts,1,'non-log cluster retains existing cast');
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'..',
 'assets/nature/nature_catalog.json'),'utf8'));
const logEntries=Object.values(catalog.entries).filter(e=>
 ['fallen_logs','snow_fallen_logs'].includes(e.family));
assert(logEntries.length>=10,'both existing log families are present');
console.log('PASS fallen logs: long left cast, actual silhouette, no dot/double shadows, snowy variant, all zooms.');

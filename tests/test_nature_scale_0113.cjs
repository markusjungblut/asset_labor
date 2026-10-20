/* v0.11.3: all catalogued Nature artwork +20% except standing
 * deadwood, fallen branches/logs, stumps and mountains. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),w={};
vm.runInNewContext(fs.readFileSync(path.join(root,'nature-balance.js'),'utf8'),{window:w});
const B=w.VedrasNatureBalance;
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/nature/nature_catalog.json'),'utf8'));
const entries=Object.values(catalog.entries);
const exceptions=new Set(['dead_trees','snow_dead_trees','fallen_logs','snow_fallen_logs','deadwood']);
function previousBase(meta){
 if(exceptions.has(meta.family)){
  if(['dead_trees','snow_dead_trees'].includes(meta.family))return .58;
  if(['fallen_logs','snow_fallen_logs'].includes(meta.family))return .71;
  return .72;
 }
 if(meta.kind==='tree')return meta.sizeClass==='giant'?.65:meta.sizeClass==='large'?.69:meta.sizeClass==='medium'?.72:.77;
 if(meta.kind==='shrub')return meta.sizeClass==='medium'?.73:meta.sizeClass==='large'?.71:.82;
 if(meta.kind==='cluster')return .77;
 if(meta.kind==='ground_cover')return .84;
 return meta.kind==='special'?.85:1;
}
function oldPlacement(meta){return meta.kind==='mountain'?1:meta.kind==='tree'?.5:.7;}
const covered=new Set();let larger=0,unchanged=0;
assert.equal(entries.length,258,'catalogue stays intact');
for(const meta of entries){
 const label=meta.id+' ('+meta.kind+'/'+meta.family+')';
 const before=meta.kind==='mountain'?1:previousBase(meta)*oldPlacement(meta);
 const isExcept=meta.kind==='mountain'||exceptions.has(meta.family);
 const expected=before*(isExcept?1:1.2);
 const actual=B.sizeFactor(meta);
 assert(Math.abs(actual-expected)<1e-10,label+' display scale mismatch');
 const expectedPlacement=oldPlacement(meta)*(isExcept?1:1.2);
 assert(Math.abs(B.placementScale(meta)-expectedPlacement)<1e-10,label+' placement spacing mismatch');
 if(exceptions.has(meta.family))covered.add(meta.family);
 if(isExcept)unchanged++;else larger++;
}
for(const family of exceptions)assert(covered.has(family),'missing regression case '+family);
assert(larger>180&&unchanged>30,'both classes represented across catalog');
assert.equal(B.sizeFactor(null),1);
assert.equal(B.placementScale(null),1);
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
assert(app.includes("w:34.8,type:'nature'"),'legacy tree previews also grow by 20%');
assert(app.includes("w:c.biome==='mountain'?153:78,type:'nature'"),'legacy mountain unchanged and rock enlarged');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.includes('Asset-Labor v0.11.7'),'version label');
assert(html.includes('nature-balance.js?v=0.25.0'),'browser bypasses cached old scale');
console.log('PASS: '+larger+' regular Nature sprites +20%; '+unchanged+' excluded deadwood, fallen branches, stumps and mountains unchanged.');

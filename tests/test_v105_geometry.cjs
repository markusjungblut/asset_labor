const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');const sandbox={window:{},console,Math};vm.createContext(sandbox);
for(const f of ['catalog.js','autotile.js','shoreline.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox);
const {VedrasCatalog:C,VedrasShoreline:S}=sandbox.window;
const c=C.starter(),coast=C.terrainType(c,'coast');assert.equal(coast.materialClass,'water');assert.equal(C.profile(c,'coast','ocean').mode,'soft_water');
coast.materialClass='shoreline';coast.transitionProfileId='shoreline_required';assert(C.migrateWaterTypes(c));assert.equal(coast.materialClass,'water');assert.equal(coast.transitionProfileId,'soft_water');
const e=S.segments([{q:0,r:0,wet:false},...S.DIRS.map(([q,r])=>({q,r,wet:true}))],x=>x.wet);
assert.equal(e.length,6);
for(let i=0;i<6;i++){assert.equal(e[i].side,i);const s=e[i],mid={x:(s.center.x+s.waterCenter.x)/2,y:(s.center.y+s.waterCenter.y)/2};assert(Math.hypot(mid.x-s.mid.x,mid.y-s.mid.y)<1e-6);}
for(let n=1;n<=6;n++){const water=new Set(S.DIRS.slice(0,n).map(([q,r])=>q+','+r));const edges=S.segments([{q:0,r:0,wet:false},...S.DIRS.map(([q,r])=>({q,r,wet:water.has(q+','+r)}))],x=>x.wet);assert.equal(edges.filter(e=>e.cell.q===0&&e.cell.r===0).length,n);}
const water=new Set(['1,-1','1,0','0,1']);const edges=S.segments([{q:0,r:0,wet:false},...S.DIRS.map(([q,r])=>({q,r,wet:water.has(q+','+r)}))],x=>x.wet);assert.equal(edges.filter(e=>e.cell.q===0&&e.cell.r===0).length,3);
console.log('PASS: legacy coastal-water migration, soft water, six exact axial side directions, 1–6 wet neighbors');
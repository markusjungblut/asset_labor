'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Audit=require('../large-map-bake-canopy-audit.js');
const sandbox={window:{}};
for(const file of ['sprite-planner.js','nature-balance.js'])
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),sandbox);
const W=sandbox.window;
const catalog=JSON.parse(fs.readFileSync(
 path.join(__dirname,'../assets/nature/nature_catalog.json'),'utf8'));
const assetPath='assets/nature/birke1.png',meta=catalog.entries[assetPath.slice(7)];
const assets=[{path:assetPath,relPath:assetPath.slice(7),category:'nature'}];
const origin={seed:'test-forest',version:'geography-v2.1.2',
 width:10,height:10,originQ:0,originR:0};
const plan={schema:'vedras-geography-bake-plan-v1',stage:'plan-only',
 rasterized:false,readyForViewer:false,source:{...origin,cells:100},
 grid:{tileSize:512},tileCount:2,tiles:[
 {id:'0,0',x:0,y:0,size:512},{id:'1,0',x:512,y:0,size:512}]};
const instance={q:0,r:0,assetPath,assetId:meta.id,dx:0,dy:30,scale:1};
const trunks={schema:'vedras-geography-tree-trunk-plan-v1',
 rasterized:false,complete:false,readyForViewer:false,
 worldHexes:100,worldSource:origin,seed:12345,
 natureCatalogRevision:catalog.revision??null,instances:[instance]};
const sites={schema:'vedras-geography-nature-tree-sites-v1',
 rasterized:false,complete:false,readyForViewer:false,
 worldHexes:100,worldSource:origin,seed:12345,
 natureCatalogRevision:catalog.revision??null,
 sites:[{q:0,r:0,forestClass:'dense_forest',targetTreeSlots:2}]};
const forestCells=Array.from({length:100},(_,n)=>({
 q:n%10,r:Math.floor(n/10),forestClass:n===0?'dense_forest':'none',
 forestMode:'canopy',canopyCoverage:n===0?.70:0
}));
function make(opts={}){
 let loads=0,bounds=0;
 const factory=()=>({getContext:()=>({
  drawImage:()=>{bounds++;},
  getImageData:(x,y,w,h)=>{const d=new Uint8ClampedArray(w*h*4);
   for(let i=3;i<d.length;i+=4)d[i]=255;
   return {data:d};}
 })});
 const load=async a=>{assert.equal(a.path,assetPath);loads++;
  return {img:{naturalWidth:600,naturalHeight:800}};};
 const args={plan,treePlan:trunks,siteAudit:sites,forestCells,
  natureCatalog:catalog,assets,loadImage:load,canvasFactory:factory,
  spritePlanner:W.VedrasSpritePlanner,balance:W.VedrasNatureBalance,
  forest:{maxObjects:()=>8},...opts};
 return {audit:Audit.create(args),get loads(){return loads;},
  get bounds(){return bounds;}};
}
test('real catalog sprite sizing uses exact original-editor canopy proxy and flags shortfall',async()=>{
 const x=make();
 assert.equal(x.audit.defaultTile(),'0,0');
 const r=await x.audit.auditTile('0,0');
 assert.equal(r.schema,'vedras-geography-canopy-proxy-audit-v1');
 assert.equal(r.coverageMethod,'editor-0.72-visible-width-squared');
 assert.equal(r.statistics.sites,1);
 assert.equal(r.statistics.treeQuota,2);
 assert.equal(r.statistics.placedTrees,1);
 assert.equal(r.statistics.quotaShortfall,1);
 assert.equal(r.statistics.underQuotaSites,1);
 assert.equal(r.statistics.underCanopySites,1);
 assert.equal(r.statistics.overObjectCapSites,0);
 assert.equal(r.sites[0].targetCover,.70);
 const visibleWidth=W.VedrasSpritePlanner.visualWidth(meta,
  {naturalWidth:600,naturalHeight:800},{sw:600,sh:800})*
  W.VedrasNatureBalance.sizeFactor(meta);
 const want=.72*visibleWidth*visibleWidth/Audit.HEX_AREA;
 assert(Math.abs(r.sites[0].editorCoverProxy-want)<.0001);
 assert.equal(x.loads,1);
 assert.equal(x.bounds,1);
 assert.equal(r.actualCrownPixelsMeasured,false);
 assert.equal(r.rasterized,false);
 assert.equal(r.complete,false);
 assert.equal(r.readyForViewer,false);
 assert.equal(r.needsAdditionalCanopyPass,true);
 assert.equal(r.needsEditorFullPopulationParity,true);
 assert.equal(r.needsPriorRockPass,true);
});
test('audit isolates tile-local sites without loading unused artwork',async()=>{
 const x=make();
 const empty=await x.audit.auditTile('1,0');
 assert.equal(empty.statistics.sites,0);
 assert.equal(empty.originalPngs,0);
 assert.equal(x.loads,0);
 await assert.rejects(x.audit.auditTile('3,3'),/Unbekannte/);
});
test('full quota and an already met cover proxy are reported but never released',async()=>{
 const amended={...sites,sites:[{...sites.sites[0],targetTreeSlots:1}]};
 const forest=forestCells.map(f=>f.q===0&&f.r===0?{...f,canopyCoverage:.001}:f);
 const x=make({siteAudit:amended,forestCells:forest});
 const r=await x.audit.auditTile('0,0');
 assert.equal(r.statistics.quotaShortfall,0);
 assert.equal(r.statistics.underCanopySites,0);
 assert.equal(r.needsAdditionalCanopyPass,false);
 assert.equal(r.readyForViewer,false);
});
test('source revision, physical assets and alpha decoding fail closed',async()=>{
 assert.throws(()=>make({treePlan:{...trunks,worldSource:{...origin,seed:'stale'}}}),
  /konsistente/);
 assert.throws(()=>make({siteAudit:{...sites,seed:777}}),/konsistente/);
 assert.throws(()=>make({assets:[]}),/physisches Original/);
 assert.throws(()=>make({forestCells:forestCells.slice(1)}),/konsistente/);
 const broken=make({loadImage:async()=>{throw Error('real image failed');}});
 await assert.rejects(broken.audit.auditTile('0,0'),/real image failed/);
 const blank=make({canvasFactory:()=>({getContext:()=>({
  drawImage:()=>{},
  getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)})
 })})});
 await assert.rejects(blank.audit.auditTile('0,0'),/transparent/);
});
test('geography-lab opt-in wiring, sparse checkout and incomplete report are explicit',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8');
 const lab=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 const ci=fs.readFileSync(path.join(__dirname,'../.github/workflows/geography-large-bake-ci.yml'),'utf8');
 assert(html.includes('src="large-map-bake-canopy-audit.js'));
 assert(html.includes('id="auditCanopyProxy"'));
 assert(html.includes('id="canopyAuditReport"'));
 assert(html.indexOf('src="large-map-bake-canopy-audit.js')<
  html.indexOf('src="geography-lab.js'));
 assert.match(lab,/CANOPY\.create/);
 assert.match(lab,/\.auditTile\(id\)/);
 assert.match(lab,/Kronendeckungs-Proxy/);
 assert.match(lab,/KEIN fertiger Kartenatlas/);
 assert(ci.includes('/large-map-bake-canopy-audit.js'));
 assert(ci.includes('/tests/test_large_map_bake_canopy_audit_20261123.cjs'));
});

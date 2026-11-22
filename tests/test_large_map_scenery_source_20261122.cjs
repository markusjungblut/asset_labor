'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const G=require('../worldgen-geography.js');
const Mix=require('../geography-lab-presets.js');
const Plan=require('../large-map-bake-plan.js');
const Source=require('../large-map-bake-scenery-source.js');
const PNG=require('../large-map-bake-mountain-png.js');
const sandbox={window:{}};
for(const name of ['mountain.js','nature_catalog.js'])
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),sandbox);
const mountains=sandbox.window.VedrasMountains,
 rules=sandbox.window.VedrasNatureCatalog;
const nature=JSON.parse(fs.readFileSync(
 path.join(__dirname,'../assets/nature/nature_catalog.json'),'utf8'));
const catalog=JSON.parse(fs.readFileSync(
 path.join(__dirname,'../assets/terrain/terrain_catalog.json'),'utf8'));
const assets=Object.keys(nature.entries).map(relPath=>({
 path:'assets/'+relPath,relPath,category:'nature',mtime:1
}));
const world=()=>G.generateWorld(Mix.PRESET.seed,{
 width:95,height:75,config:Mix.configFor(G)});
const build=(w=world(),a=assets,seed=12345)=>Source.create({
 world:w,terrainCatalog:catalog,natureCatalog:nature,assets:a,
 mountains,rules,seed
});
test('real original nature catalog yields 275 mountains across 7 geographic regions',()=>{
 const p=build();
 assert.equal(p.schema,'vedras-geography-scenery-source-v1');
 assert.equal(p.mountainHexes,346);
 assert.equal(p.mountainRegions,7);
 assert.equal(p.sourceVariants,21);
 assert.equal(p.placed,275);
 assert.equal(p.unmatched.length,71);
 assert.equal(p.artStatuses.candidate,275);
 assert.equal(p.rasterized,false);
 assert.equal(p.complete,false);
 assert.equal(p.readyForViewer,false);
 assert.equal(p.requiresPixelOverlapCheck,true);
 assert.equal(p.requiresShadows,true);
 assert.equal(p.instances.length,p.placed);
 const keys=new Set(p.instances.map(x=>x.q+','+x.r));
 assert.equal(keys.size,p.placed);
 for(const m of p.instances){
  const metadata=nature.entries[m.assetPath.slice(7)];
  assert.equal(metadata.kind,'mountain');
  assert(rules.mountainAllowed(metadata,m.terrainId,catalog,nature));
  assert.equal(m.artStatus,'candidate');
 }
});
test('mountain candidates are insensitive to listing order and reject missing nature assets',()=>{
 const w=G.generateWorld('small-mountains',{width:34,height:30});
 const p=build(w),r=build(w,[...assets].reverse());
 assert.deepEqual(p.instances,r.instances);
 assert.deepEqual(p.unmatched,r.unmatched);
 const none=build(w,[]);
 assert.equal(none.placed,0);
 assert.equal(none.sourceVariants,0);
 assert.equal(none.unmatched.length,none.mountainHexes);
 assert.equal(none.readyForViewer,false);
});
test('original editor-compatible Nature hash and chain/candidate coordinates are stable',()=>{
 for(const [s,q,r,k] of [[12345,0,0,2002],[12345,56,0,2002],
  [12345,-22,30,1643],[777,999,-800,304]]){
  let h=(s|0)^Math.imul(q+97,374761393)^
   Math.imul(r+513,668265263)^Math.imul(k+11,2246822519);
  h^=h>>>13;h=Math.imul(h,1274126177);
  assert.equal(Source.hash(s,q,r,k),((h^(h>>>16))>>>0)/4294967296);
 }
 const p=build();
 const every=p.instances.every(m=>m.chainId.startsWith('geography_')&&
   m.mode==='chain'&&m.coreRadius===0);
 assert(every);
});
test('transparent mountain scenery PNG uses real decoded source, world coordinates and never advertises completion',async()=>{
 const w=world(),plan=Plan.plan(w),scene=build(w);
 const images=new Map(),draws=[],setTransforms=[];
 function makeCanvas(){
  const context={
   drawImage:(...args)=>draws.push(args),setTransform:(...args)=>setTransforms.push(args),
   translate:()=>{},transform:()=>{},save:()=>{},restore:()=>{},
   getImageData:(x,y,ww,hh)=>{
    const data=new Uint8ClampedArray(ww*hh*4);
    for(let i=3;i<data.length;i+=4)data[i]=255;
    return {data};
   }
  };
  return {getContext:()=>context,
   toBlob:cb=>cb(new Blob([new Uint8Array(200)],{type:'image/png'}))};
 }
 const renderer=PNG.create({plan,sceneryPlan:scene,assets,
  loadImage:async asset=>{
   assert.equal(asset.category,'nature');
   if(!images.has(asset.path))
    images.set(asset.path,{naturalWidth:512,naturalHeight:512});
   return {img:images.get(asset.path)};
  },canvasFactory:makeCanvas});
 const id=renderer.defaultTile();
 assert(plan.tiles.some(t=>t.id===id));
 const result=await renderer.renderTile(id);
 assert.equal(result.stage,'original-mountain-scenery-preview');
 assert.equal(result.complete,false);
 assert.equal(result.readyForViewer,false);
 assert.equal(result.rasterized,true);
 assert(result.drawn>=1);
 assert.equal(result.width,1459);
 assert.equal(result.height,1240);
 assert(result.originalPngs>=1);
 assert(draws.some(args=>args.length===9));
 assert.equal(setTransforms[0][0],PNG.SCALE);
 assert(result.omitted.includes('shadow-casts'));
 await assert.rejects(()=>renderer.renderTile('99999,99999'),/Unbekannte/);
});
test('missing original Nature PNG rejects the scene before fake-colored replacement',async()=>{
 const w=world(),plan=Plan.plan(w),scene=build(w);
 const renderer=PNG.create({plan,sceneryPlan:scene,assets:[],
  loadImage:async()=>{throw Error('must not decode');},
  canvasFactory:()=>({})});
 await assert.rejects(()=>renderer.renderTile(renderer.defaultTile()),
  /Original-Berg-PNG fehlt/);
});
test('geography UI scripts are load-ordered and both mountain controls are real handlers',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8');
 const lab=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 const order=['mountain.js','nature_catalog.js','large-map-bake-scenery-source.js',
  'large-map-bake-mountain-png.js','geography-lab.js'];
 const indices=order.map(x=>html.indexOf('src="'+x));
 assert(indices.every(x=>x>0)&&indices.every((x,i)=>i===0||x>indices[i-1]));
 for(const id of ['auditMountainScenery','previewMountainScenery','mountainSceneryReport'])
  assert(html.includes('id="'+id+'"'));
 assert.match(lab,/mountainPreflight\(worldAtStart\)/);
 assert.match(lab,/MOUNTAINPNG\.create/);
 assert.match(lab,/\.renderTile\(id\)/);
 assert.match(lab,/sample\.complete\|\|sample\.readyForViewer/);
 assert.match(lab,/UNVOLLSTÄNDIG/);
});

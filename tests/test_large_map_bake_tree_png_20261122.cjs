'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const TreePNG=require('../large-map-bake-tree-png.js');
const sandbox={window:{}};
for(const f of ['sprite-planner.js','nature-balance.js','polish.js'])
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),sandbox);
const W=sandbox.window;
const nature=JSON.parse(fs.readFileSync(
 path.join(__dirname,'../assets/nature/nature_catalog.json'),'utf8'));
const treePath='assets/nature/birke1.png';
const meta=nature.entries[treePath.slice(7)];
const asset={path:treePath,relPath:treePath.slice(7),category:'nature',mtime:1};
const worldSource={seed:'tree-png-test',version:'geography-v2.1.2',
 width:10,height:10,originQ:0,originR:0};
const tiles=[{id:'0,0',x:0,y:0,size:512},{id:'1,0',x:512,y:0,size:512}];
const plan={schema:'vedras-geography-bake-plan-v1',stage:'plan-only',
 rasterized:false,readyForViewer:false,
 source:{...worldSource,cells:100},grid:{tileSize:512},
 tileCount:2,tiles};
const instance={assetPath:treePath,assetId:meta.id,q:2,r:0,
 dx:0,dy:70,scale:1,source:'geography-original-tree-trunk-preview',
 artStatus:meta.artStatus};
const trunks={schema:'vedras-geography-tree-trunk-plan-v1',
 stage:'original-tree-trunks-read-only',rasterized:false,
 complete:false,readyForViewer:false,seed:12345,worldHexes:100,
 worldSource,natureCatalogRevision:nature.revision??null,
 requiresOriginalPngDecoding:true,requiresTreeShadows:true,
 instances:[instance]};
function mocks(){
 const canvases=[],draws=[],transforms=[],images=[];
 const originalImage={naturalWidth:600,naturalHeight:800};
 function canvasFactory(){
  const entry={width:0,height:0,draws:[],transforms:[],styles:[]};
  const ctx={
   drawImage:(...args)=>{draws.push(args);entry.draws.push(args);},
   setTransform:(...args)=>{transforms.push(args);entry.transforms.push(args);},
   translate:()=>{},transform:()=>{},save:()=>{},restore:()=>{},
   getImageData:(_x,_y,w,h)=>{
    const data=new Uint8ClampedArray(w*h*4);
    for(let i=3;i<data.length;i+=4)data[i]=255;
    return {data};
   },
   set filter(x){entry.styles.push(x);}
  };
  const canvas={get width(){return entry.width;},set width(x){entry.width=x;},
   get height(){return entry.height;},set height(x){entry.height=x;},
   getContext:()=>ctx,toBlob:cb=>cb(new Blob(['PNG_FAKE'],{type:'image/png'}))};
  canvases.push(entry);return canvas;
 }
 const loaders=[];
 const loadImage=async a=>{loaders.push(a.path);return {img:originalImage};};
 return {canvasFactory,loadImage,canvases,draws,transforms,loaders};
}
function create(opt={}){
 const f=mocks();
 const renderer=TreePNG.create({plan,treePlan:trunks,
  natureCatalog:nature,assets:[asset],loadImage:f.loadImage,
  canvasFactory:f.canvasFactory,
  spritePlanner:W.VedrasSpritePlanner,
  balance:W.VedrasNatureBalance,polish:W.VedrasPolish,...opt});
 return {renderer,f};
}
test('real catalog tree PNG geometry follows editor alpha crop, size and composition',async()=>{
 const {renderer,f}=create();
 assert.equal(renderer.defaultTile(),'1,0');
 const a=await renderer.renderTile('0,0');
 const b=await renderer.renderTile('1,0');
 assert.equal(a.schema,'vedras-geography-tree-png-preview-v1');
 assert.equal(a.stage,'original-tree-scenery-png-preview');
 assert.equal(a.width,1920);
 assert.equal(a.height,1632);
 assert.equal(a.drawn,1);
 assert.equal(b.drawn,1);
 assert.equal(a.originalPngs,1);
 assert.equal(a.artStatuses.candidate,1);
 assert.equal(a.transparent,true);
 assert.equal(a.complete,false);
 assert.equal(a.readyForViewer,false);
 assert.equal(a.rasterized,true);
 assert(a.requiresEditorVisualParity&&a.requiresShadows&&
  a.requiresFinal4x&&a.requiresOriginalPixelSeamVerification);
 assert.equal(f.draws.filter(d=>d.length===9).length,2);
 // Scratch crop uses drawImage(image,0,0,cw,ch), scene uses 9 args.
 const painted=f.draws.filter(x=>x.length===9);
 const expected=W.VedrasSpritePlanner.visualWidth(meta,
  {naturalWidth:600,naturalHeight:800},{sw:600,sh:800})*
  W.VedrasNatureBalance.sizeFactor(meta);
 assert(Math.abs(painted[0][7]-expected)<.01);
 assert.equal(f.transforms[0][0],2.5);
 assert.equal(f.transforms[0][3],2.125);
 assert.equal(f.transforms[1][4]-f.transforms[0][4],-1280);
 assert(f.canvases.some(x=>x.styles.includes(
  W.VedrasPolish.natureFilter(meta,.40))));
});
test('independent tiles include the same cross-seam tree; missing original PNG is fatal',async()=>{
 const {renderer}=create();
 const result=await renderer.renderTile('0,0');
 assert.equal(result.nearby,1);
 assert.equal(result.drawn,1);
 const {renderer:empty}=create({assets:[]});
 assert.throws(()=>empty.renderTile('0,0'),/physische Originalgrafik/);
 const {renderer:broken}=create({loadImage:async()=>{throw Error('PNG not found');}});
 await assert.rejects(broken.renderTile('1,0'),/PNG not found/);
 const {renderer:transparent}=create({canvasFactory:()=>{
  const a=mocks().canvasFactory();
  const ctx=a.getContext();
  ctx.getImageData=(_,__,w,h)=>({data:new Uint8ClampedArray(w*h*4)});
  return a;
 }});
 await assert.rejects(transparent.renderTile('1,0'),/vollständig transparent/);
 await assert.rejects(renderer.renderTile('999,999'),/Unbekannte/);
});
test('reject completed source plans, non-tree originals and inconsistent world revisions',()=>{
 for(const x of [
  {plan:{...plan,readyForViewer:true}},
  {plan:{...plan,source:{...plan.source,cells:101}}},
  {treePlan:{...trunks,complete:true}},
  {treePlan:{...trunks,worldSource:{...worldSource,seed:'other'}}},
  {treePlan:{...trunks,instances:[{...instance,source:'manual'}]}},
  {treePlan:{...trunks,instances:[{...instance,assetId:'wrong'}]}},
  {treePlan:{...trunks,instances:[{...instance,q:500}]}},
 ]){
  assert.throws(()=>create(x),/Baum|Original|Weltplan|Stammanker/);
 }
});
test('tree PNG source, UI and CI are an opt-in, never a final 4x baked scenery',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../geography-lab.html'),'utf8');
 const js=fs.readFileSync(path.join(__dirname,'../geography-lab.js'),'utf8');
 const ci=fs.readFileSync(path.join(__dirname,'../.github/workflows/geography-large-bake-ci.yml'),'utf8');
 for(const path of ['sprite-planner.js','large-map-bake-tree-png.js'])
  assert(html.includes('src="'+path),path);
 for(const id of ['previewTreeScenery','treeSceneryReport'])
  assert(html.includes('id="'+id+'"'));
 assert(html.indexOf('src="sprite-planner.js')<
  html.indexOf('src="large-map-bake-tree-png.js'));
 assert(html.indexOf('src="large-map-bake-tree-png.js')<
  html.indexOf('src="geography-lab.js'));
 assert.match(js,/TREEPNG\.create/);
 assert.match(js,/original-tree-scenery-png-preview/);
 assert.match(js,/KEIN fertiger/);
 assert(ci.includes('/large-map-bake-tree-png.js'));
 assert(ci.includes('/tests/test_large_map_bake_tree_png_20261122.cjs'));
});

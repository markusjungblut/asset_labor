/* v0.11.9: zoom continuity, retired LOD fallback, no additive road
 * junctions, and global 0–200% shadow intensity. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),base={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'shadow-system.js'),'utf8'),base);
const Shadows=base.window.VedrasShadows;
assert.equal(Shadows.globalStrength(1),1);
assert.equal(Shadows.globalStrength(2),2);
assert.equal(Shadows.globalStrength(7),2);
assert.equal(Shadows.globalStrength(-5),0);
const shape=Shadows.mountainShape({x:0,y:0},300,{opacity:.65,softness:9});
const alpha1=Shadows.mountainAlphaAt(-70,40,shape,300,1),
 alpha2=Shadows.mountainAlphaAt(-70,40,shape,300,2);
assert(alpha2>alpha1,'200% must actually increase the mountain shadow darkness');
assert(alpha2<=.90,'mountain alpha remains bounded');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),
 html=fs.readFileSync(path.join(root,'index.html'),'utf8'),
 ui=fs.readFileSync(path.join(root,'nature-ui.js'),'utf8');
assert(app.includes('ZMIN=.12,ZMAX=2.40,FAR_ENTER=.17,FAR_LEAVE=.23'),
 'strategic labels no longer triggered at 50%');
assert(html.includes('id="zoomSlider" type="range" min="12"'));
assert(html.includes('id="shadowGeneralStrength"')&&
 html.includes('id="shadowGlobalStrength" type="range" min="0" max="200"'));
assert(ui.includes("['shadowGeneralStrength','shadowGeneralText']")&&
 ui.includes("['shadowGlobalStrength','shadowGlobalText']"),
 'two global controls stay synchronized');
assert(app.includes('function updateTerrainLod(zoom)'));
assert(app.includes("terrainLod==='high'&&zoom<.48"));
assert(app.includes("terrainLod==='coarse'&&zoom>.76"));
assert(app.includes('family:chunkFamily')&&app.includes('family:roadFamily'));
assert(html.includes('Asset-Labor v0.11.9'));

const jobs=[],world={};
vm.runInNewContext(fs.readFileSync(path.join(root,'chunks.js'),'utf8'),{
 window:world,requestIdleCallback:cb=>jobs.push(cb),
 performance:{now:()=>15},console:{error:()=>{}}
});
const cells=[{q:0,r:0},{q:1,r:0}],info={x:0,y:0,width:40,height:40},
 drawLog=[],ctxFake={save(){},restore(){},beginPath(){},rect(){},clip(){}};
const generator=world.VedrasChunks.create({size:512,maxTiles:16,maxPixels:2000000});
const makeRaster=(name)=>({raster:{canvas:{width:32,height:32,name,
 close(){drawLog.push('release '+name);}},x:0,y:0,width:32,height:32}});
const configure=(version,family)=>generator.configure(version,{
 family,worldCells:cells,buildTile:()=>makeRaster(version),redraw:()=>{}});
const draw=()=>generator.draw(ctxFake,info,{margin:0,
 drawRaster:(unused,raster)=>drawLog.push(raster.canvas.name)});
configure('high','same-map');
generator.draw(ctxFake,info,{margin:0,drawRaster:()=>{}});
while(jobs.length)jobs.shift()();
let stats=draw();
assert(stats.painted>=1);
configure('coarse','same-map');
stats=draw();
assert(stats.stalePainted>=1,'old terrain painted while replacement LOD is pending');
assert(drawLog.includes('high'));
while(jobs.length)jobs.shift()();
drawLog.length=0;stats=draw();
assert.equal(stats.stalePainted,0,'new chunk replaces previous frame when complete');
assert(drawLog.includes('coarse'));
configure('high','same-map');
drawLog.length=0;stats=draw();
assert.equal(stats.stalePainted,0,'zooming back reuses cached original quality');
assert.equal(stats.pending,0,'no rebuild required when returning to existing zoom variant');
assert(drawLog.includes('high'));
configure('other-world','different-map');
assert.equal(generator.stats().cached,0,'edits invalidate old-world images, no unrelated stale landscape');

const document={createElement:tag=>{
 assert.equal(tag,'canvas');
 const output={width:0,height:0};
 output.getContext=()=>({
  canvas:output,save(){},restore(){},setTransform(){},clearRect(){},
  beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},arc(){},ellipse(){},
  closePath(){},fillRect(){},createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
  putImageData(){},createPattern:()=>null
 });
 return output;
}};
const roadsGlobal={window:{},document};
vm.runInNewContext(fs.readFileSync(path.join(root,'roads.js'),'utf8'),roadsGlobal);
const Roads=roadsGlobal.window.VedrasRoads;
const ops=[];const canvas={width:300,height:180},visual={
 canvas,save(){},restore(){},getTransform:()=>({a:1,b:0,c:0,d:1,e:0,f:0}),
 setTransform(){},drawImage(){ops.push('union-layer')},
 createPattern:()=>null,beginPath(){},moveTo(){},lineTo(){},
 arc(){},fill(){},stroke(){},ellipse(){},closePath(){}
};
const edges=Roads.DIRS.map(([q,r])=>({a:[0,0],b:[q,r],level:'trail'}));
const joined=Roads.render(visual,edges,{hex:256,detail:false});
assert.equal(joined.edges,6);
assert.equal(ops.length,3,'every translucent pass is composited ONCE, not once per road arm');
assert(fs.readFileSync(path.join(root,'roads.js'),'utf8').includes("g.globalCompositeOperation='source-in'"),
 'terrain-colored texture is applied to opaque union mask once');
console.log('PASS: strategic mode at 17%, LOD fallback and return cache, 200% shadows, six-arm nonadditive terrain road union.');

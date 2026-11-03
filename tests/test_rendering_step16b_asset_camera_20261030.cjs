'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const begin=app.indexOf('function invalidateSpriteLayout('),
 end=app.indexOf('\nconst clamp=',begin);
assert.ok(begin>0&&end>begin,'Live sprite invalidation function must exist');
const actual=app.slice(begin,end);
function harness({allowed=true}={}){
 const calls=[],worldTiles={
  invalidateTiles(ids,reason){calls.push(['selective',ids.size,reason])},
  invalidate(reason){calls.push(['global',reason])}
 };
 const code=[
  "let tileModeActive=true,visibleFogTiles=new Set(['0,0']),",
  "lastTileSnapshotSignature='v1',worldTileSelectiveSnapshot=false;",
  "const objectLayoutCache={invalidate(){calls.push(['layout'])}},",
  "staticScenery={clear(){calls.push(['scenery-clear'])}},",
  "fastAllowed=()=>allowed,",
  "tileFog=()=>{calls.push(['fog-refresh']);visibleFogTiles=new Set(['safe'])},",
  "window={VedrasStep15Trace:{record:(kind,data)=>calls.push([kind,data.reason])}};",
  actual,
  "return {call:invalidateSpriteLayout,state:()=>({",
  "tileModeActive,visibleFogTiles,lastTileSnapshotSignature,worldTileSelectiveSnapshot})};"
 ].join('\n');
 const {call,state}=new Function('worldTiles','calls','allowed',code)(worldTiles,calls,allowed);
 return {call,state,calls};
}
test('late image decode retains active camera while refreshing fog authorization',()=>{
 const h=harness();
 h.call(new Set(['0,0','1,0']),{preserveCamera:true});
 assert.equal(h.state().tileModeActive,true);
 assert.ok(h.state().visibleFogTiles.has('safe'));
 assert.equal(h.calls.filter(x=>x[0]==='fog-refresh').length,1);
 assert.equal(h.calls.filter(x=>x[0]==='camera.mode-retained').length,1);
 assert.deepEqual(h.calls.find(x=>x[0]==='selective'),['selective',2,'localized-scenery-change']);
});
test('global ground decode invalidation retains camera but still drops world cache',()=>{
 const h=harness();
 h.call(null,{preserveCamera:true});
 assert.equal(h.state().tileModeActive,true);
 assert.ok(h.calls.some(x=>x[0]==='global'&&x[1]==='scenery-revision-changed'));
 assert.ok(h.calls.some(x=>x[0]==='fog-refresh'));
});
test('editor-origin scenery edit retains previous exit semantics',()=>{
 const h=harness();
 h.call(new Set(['0,0']));
 assert.equal(h.state().tileModeActive,false);
 assert.equal(h.state().visibleFogTiles,null);
 assert.equal(h.calls.filter(x=>x[0]==='fog-refresh').length,0);
});
test('if the fast path is no longer allowed, a decode cannot retain it',()=>{
 const h=harness({allowed:false});
 h.call(new Set(['0,0']),{preserveCamera:true});
 assert.equal(h.state().tileModeActive,false);
 assert.equal(h.state().visibleFogTiles,null);
 assert.equal(h.calls.filter(x=>x[0]==='camera.mode-retained').length,0);
});
test('only debounced image completion is authorized to preserve camera mode',()=>{
 assert.match(app,/invalidateSpriteLayout\(groundChanged\?new Set\(\):worldTilesForAssetPaths\(paths\),\s*\{preserveCamera:true\}\)/);
 assert.doesNotMatch(app,/function invalidateTerrain\([\s\S]{0,1900}preserveCamera:true/);
 assert.match(app,/if\(keepTileCamera\)\{\s*\/\/ The fog authorization is rebuilt/);
});

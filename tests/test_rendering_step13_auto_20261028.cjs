'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync,existsSync}=require('node:fs');
const {join,resolve}=require('node:path');
const {spawnSync}=require('node:child_process');
const root=resolve(__dirname,'..');
const source=readFileSync(join(root,'scripts/rendering-step13-browser.mjs'),'utf8');
test('reference scene is 397 hexes with 2631 valid Nature sprites',()=>{
 const p=join(root,'artifacts/rendering-step13/vedras_scene.json');
 assert.ok(existsSync(p));
 const scene=JSON.parse(readFileSync(p,'utf8'));
 assert.equal(scene.schema,'vedras-asset-labor-scene-0.8');
 assert.equal(scene.sceneSize,397);
 assert.equal(scene.natureInstances.length,2631);
 assert.equal(scene.natureInstances.filter(n=>typeof n.assetPath==='string'&&
  Number.isFinite(n.q)&&Number.isFinite(n.r)&&Number.isFinite(n.dx)&&
  Number.isFinite(n.dy)&&Number.isFinite(n.scale)&&n.scale>0&&n.scale<=3).length,2631);
});
test('scene importer no longer drops 631 reference trees',()=>{
 const app=readFileSync(join(root,'app.js'),'utf8');
 assert.match(app,/natureInstances=.*?\.slice\(0,5000\)/);
});
test('test capture explicitly disables fog and saves map-only clear screenshots',()=>{
 assert.match(source,/await setControls\(c,quality,false\)/);
 assert.match(source,/-baseline-clear\.png/);
 assert.match(source,/fog-comparison-clear\.png/);
 assert.match(source,/fog-comparison-on\.png/);
 assert.match(source,/Page\.captureScreenshot/);
 assert.match(source,/getElementById\('canvasOuter'\)/);
 assert.doesNotMatch(source,/DOM\.getDocument|DOM\.setFileInputFiles/);
});
test('one-click starter uses repository scene and isolated local server',()=>{
 const wrapper=readFileSync(join(root,'scripts/rendering-step13-auto.mjs'),'utf8');
 const cmd=readFileSync(join(root,'START_RENDERTEST_WINDOWS.cmd'),'utf8');
 assert.match(wrapper,/VEDRAS_PORT:'0'/);
 assert.match(wrapper,/VEDRAS_NO_BROWSER:'1'/);
 assert.match(wrapper,/rendering-step13-browser\.mjs/);
 assert.match(cmd,/rendering-step13-auto\.mjs/);
});
test('CLI help is available without launching Chrome',()=>{
 const run=spawnSync(process.execPath,[join(root,'scripts/rendering-step13-browser.mjs'),'--help'],{cwd:root,encoding:'utf8',timeout:10000});
 assert.equal(run.status,0,run.stderr);
 assert.match(run.stdout,/repo reference scene/);
 assert.match(run.stdout,/fog-on comparison/);
});

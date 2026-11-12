'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),
 css=fs.readFileSync(path.join(root,'style.css'),'utf8'),
 organizer=fs.readFileSync(path.join(root,'ui-organizer.js'),'utf8'),
 app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
test('asset-labor UI keeps all app-bound DOM ids and unique element ids',()=>{
 assert.equal(new Set(ids).size,ids.length,'No duplicate HTML ids');
 const used=[...app.matchAll(/\$\(['"]([^'"]+)['"]\)/g)].map(x=>x[1]);
 for(const id of used)assert.ok(ids.includes(id),'App binding missing '+id);
 for(const id of ['viewSettings','testSceneSettings','gpuTerrain',
  'gpuSprites','objectsToggle','waterSamplingMode','nPopulate','sceneImport'])
  assert.ok(ids.includes(id),'Required control missing '+id);
});
test('stable standard profile is displayed before scripts restore saved values',()=>{
 assert.match(app,/quality:'2'/);
 assert.match(app,/fastCamera:true,grid:false,objects:true,river:true/);
 assert.match(app,/workerTerrain:true,gpuTerrain:false/);
 assert.match(app,/adaptiveLod:true,worldStreaming:true/);
 for(const id of ['chunkRendering','fastCamera','worldStreaming','adaptiveLod',
  'workerTerrain','objectsToggle','riverToggle']){
  assert.match(html,new RegExp('<input[^>]*id="'+id+'"[^>]*\\bchecked\\b'),
   'Expected default-on checkbox '+id);
 }
 for(const id of ['gpuTerrain','gpuSprites','gridToggle','fogPreview']){
  const hit=html.match(new RegExp('<input[^>]*id="'+id+'"[^>]*>'));
  assert.ok(hit,'Expected control '+id);
  assert.doesNotMatch(hit[0],/\bchecked\b/,'Expected default-off '+id);
 }
 assert.match(html,/<option value="2" selected>/);
});
test('obsolete disabled quality and redundant one-click scene size are removed',()=>{
 assert.doesNotMatch(html,/id="quick37"/);
 assert.doesNotMatch(html,/<option value="4" disabled>/);
 assert.match(html,/<select id="sceneSize">/);
 assert.match(html,/<option value="37" selected>/);
 // Previous saved scene and 4× source paths remain backward compatible.
 assert.match(app,/scene\.sceneSize/);
 assert.match(app,/state\.quality=e\.target\.value==='4'\?'2'/);
});
test('organization preserves authoring controls and separates diagnostics',()=>{
 assert.doesNotThrow(()=>new Function(organizer));
 assert.match(organizer,/const groups=\[/);
 assert.match(organizer,/drawers:\['terrainTests','reliefPanel','shorelinePanel','riverPanel','roadPanel'\]/);
 assert.match(organizer,/parallel/gi.test(organizer)?/Renderer-Standardwerte & Diagnose/:/Renderer-Standardwerte & Diagnose/);
 assert.match(organizer,/WebGL2-Vergleiche \(standardmäßig aus\)/);
 assert.match(organizer,/Diagnose & ältere A\/B-Vergleiche/);
 assert.match(organizer,/quickPopulate.*nPopulate/);
 assert.match(organizer,/button\.dataset\.drawer=id/);
 assert.doesNotMatch(organizer,/shortcutNature.*nPopulate/);
 assert.match(css,/\.inspector-group/);
 assert.match(css,/\.toolbar-tools-menu/);
});

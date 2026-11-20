'use strict';
// Ensure Editor/Geography 2.1.1, standalone viewer and staged ZIP importer
// remain compatible in a combined RC. No IndexedDB or original data opened.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const get=p=>fs.readFileSync(path.join(root,p),'utf8');
const editor=get('index.html'),viewer=get('frozen-map-game.html'),
 game=get('frozen-map-game.js'),runtime=get('frozen-map-runtime.js');
const zipPage=get('static-map-import.html'),zipUI=get('static-map-import-ui.js'),
 importer=get('static-map-zip-importer.js'),inspector=get('static-map-zip-inspector.js');
test('keep current Geography v2.1.1 plus approved UI cleanup',()=>{
 assert.match(editor,/worldgen-geography\.js\?v=2\.1\.1/);
 assert.match(editor,/app\.js\?v=[^"]*&amp;geography=2\.1\.1/);
 assert.match(editor,/ui-organizer\.js\?v=20261119-shadow-shortcut-v1/);
 assert.equal(require(path.join(root,'worldgen-geography.js')).VERSION,'geography-v2.1.1');
});
test('restore entry remains separate and requires explicit positive consent',()=>{
 assert.doesNotMatch(editor,/static-map-import\.html/);
 assert.doesNotMatch(viewer,/static-map-import\.html/);
 for(const name of ['static-map-zip-inspector.js','static-map-zip-importer.js','static-map-import-ui.js'])
  assert.ok(zipPage.includes('src="'+name+'?'),'Import page missing '+name);
 assert.match(zipUI,/confirmed:true/);
 assert.match(importer,/if\(confirmed!==true\)/);
 assert.match(importer,/if\(!source\.complete&&!allowPartial\)/);
});
test('imported manifest/scene prefix matches read-only game storage schema',()=>{
 assert.match(importer,/DB='vedras-frozen-world-v1',STORE='tiles'/);
 assert.match(runtime,/DB='vedras-frozen-world-v1',STORE='tiles'/);
 assert.match(importer,/schema:SCHEMA,sceneKey:scene/);
 assert.match(runtime,/data\.schema!==SCHEMA\|\|data\.sceneKey!==scene/);
 assert.match(importer,/key:prefix\(scene\)\+'manifest'/);
 assert.match(runtime,/storage\.get\(scene\+'\|manifest'\)/);
 assert.match(importer,/key:prefix\(scene\)\+source\.level\+'\|'\+item\.id/);
 assert.match(runtime,/function makeKey\(scene,level,tileId\)/);
 assert.match(zipUI,/link\.href=report\.viewerPath/);
 assert.match(importer,/viewerPath:'frozen-map-game\.html\?scene='/);
});
test('browser data and existing scenes remain protected by safe importer',()=>{
 assert.match(importer,/os\.add\(\{\.\.\.record,importToken:token\}\)/);
 assert.match(importer,/os\.add\(manifest\)/);
 assert.match(importer,/os\.delete\(pendingKey\(scene\)\)/);
 assert.match(importer,/cursor\.value\?\.importToken===token/);
 assert.match(importer,/if\(!sceneValid\(next\)\|\|next===source\.scene\)/);
 assert.doesNotMatch(importer,/deleteDatabase\(|\.clear\(/);
 assert.match(inspector,/async function checkPng\(blob,name\)/);
 assert.match(inspector,/PNG-Chunk-Prüfsumme ungültig/);
 assert.match(game,/readOnly:true/);
});
test('legacy experiments remain opt-in; measured safety atlas stays reversible',()=>{
 for(const param of ['leadPrefetch','lodRecency','visibleBorrow','parallelDecode'])
  assert.ok(game.includes("params.get('"+param+"')==='1'"),param);
 assert.match(game,/params\.get\('fallbackAtlas'\)!=='0'/);
 assert.match(runtime,/directionalPrefetch=false,lodRecency=false,visibleBorrow=false/);
 assert.match(runtime,/parallelLayerDecode=false,fallbackAtlas=false/);
 assert.match(viewer,/id="optFallbackAtlas"/);
});

test('portable ZIP preserves exact ground core policy and rejects unrecognized modes',()=>{
 const exporter=get('frozen-map-package.js');
 assert.match(exporter,/groundSeamPolicy:authored\?\.groundSeamPolicy==='exclusive'/);
 assert.match(inspector,/m\.groundSeamPolicy==='exclusive'/);
 assert.match(importer,/groundSeamPolicy:source\.groundSeamPolicy==='exclusive'/);
 assert.match(runtime,/groundSeamPolicy:groundSeamPolicy==='exclusive'/);
 assert.match(game,/manifest\.groundSeamPolicy==='exclusive'/);
 // A legacy archive without the field must still load with the old
 // backwards-compatible inset (not silently claim a modern clean core).
 assert.match(importer,/groundSeamPolicy:source\.groundSeamPolicy==='exclusive'\?'exclusive':null/);
});

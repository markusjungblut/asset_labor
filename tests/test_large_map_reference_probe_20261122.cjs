'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
test('opt-in true original-renderer PNG probe is wired before app.js',()=>{
 const moduleIndex=html.indexOf('src="large-map-bake-runner.js'),
  appIndex=html.indexOf('src="app.js');
 assert(moduleIndex>=0&&appIndex>moduleIndex);
 for(const id of ['referenceTileBake','referenceTileId','referenceTileBakeStatus'])
  assert(html.includes('id="'+id+'"'));
 assert.match(app,/async function bakeReferenceNearTile\(tileId\)/);
 assert.match(app,/bakeWorldTile\(tile,'near',\{forceSource:true\}\)/);
 assert.match(app,/checkPacket\(raw,'native-near'\)/);
 assert.match(app,/window\.VedrasFrozenMapPackage\.zipEntries/);
 assert.match(app,/reference\/ground\.png/);
 assert.match(app,/reference\/scenery\.png/);
 assert.match(app,/Referenzbilder|Referenz-Rendern|kein echter 4x/);
});
test('normal renderer code path retains its previous default and 4x tour',()=>{
 assert.match(app,/async function bakeWorldTile\(t,level,\{signal,forceSource=false\}=\{\}\)/);
 assert.match(app,/reuseSnapshot=!forceSource&&!offline4x&&snapshotReady/);
 assert.match(app,/const offline4x=frozenTour\?\.quality==='4'&&level==='near'/);
 assert.match(app,/if\(frozenTour\|\|frozenMapMode\|\|state\.view!=='map'/);
});

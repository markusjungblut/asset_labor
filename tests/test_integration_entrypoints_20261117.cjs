'use strict';
// Lightweight, offline entrypoint contract checks: no browser, no atlas,
// no mutation of persistent IndexedDB, no expensive image builds.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const editor=read('index.html');
const viewer=read('frozen-map-game.html');
const playback=read('frozen-map-game.js');
const runtime=read('frozen-map-runtime.js');

function attributes(html,tag){
 const out=[];
 const tags=html.match(new RegExp('<'+tag+'\\b[^>]*>','gi'))||[];
 for(const text of tags){
  if(tag==='link'&&!/\brel\s*=\s*["']stylesheet["']/i.test(text))
   continue;
  const match=text.match(/\b(?:src|href)\s*=\s*(["'])([^"']+)\1/i);
  if(match)out.push(match[2]);
 }
 return out;
}
function ids(html){
 return [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(m=>m[1]);
}
function hasId(html,id){return ids(html).includes(id);}

test('Editor and standalone game reference only existing local JS/CSS',()=>{
 const refs=[
  ...attributes(editor,'script'),
  ...attributes(viewer,'script'),
  ...attributes(editor,'link'),
  ...attributes(viewer,'link')
 ];
 assert.ok(refs.length>=60,'Core dependency list unexpectedly shortened');
 for(const ref of refs){
  const url=new URL(ref.replaceAll('&amp;','&'),'http://localhost/');
  assert.equal(url.origin,'http://localhost','No remote script/style dependencies: '+ref);
  const rel=decodeURIComponent(url.pathname).replace(/^\/+/,'');
  const resolved=path.resolve(root,rel);
  assert.ok(resolved.startsWith(root+path.sep),'Dependency must stay in repository: '+ref);
  assert.ok(fs.existsSync(resolved),'Missing entrypoint dependency: '+ref);
  assert.ok(fs.statSync(resolved).isFile(),'Dependency is not a file: '+ref);
 }
});

test('Critical editor-to-game controls are unique and still accessible',()=>{
 for(const page of [editor,viewer]){
  const entries=ids(page);
  assert.equal(new Set(entries).size,entries.length,'Duplicate HTML ID');
 }
 for(const id of [
  'frozenMapPanel','frozenCapture','frozenCaptureAll','frozenCancel',
  'frozenPlay','frozenStandalone','frozenExport','frozenStatus'
 ])assert.ok(hasId(editor,id),'Missing editor map workflow control: '+id);
 for(const id of [
  'game','fogOverlay','zoomIn','zoomOut','resetView',
  'message','metrics','atlasBenchmark','performanceOptions'
 ])assert.ok(hasId(viewer,id),'Missing viewer control: '+id);
 assert.match(viewer,/<a\b[^>]*href=["']index\.html["']/,
  'Standalone viewer needs a route back to the editor');
});

test('Standalone viewer does not load live editor/terrain authoring modules',()=>{
 const scripts=attributes(viewer,'script')
  .map(ref=>new URL(ref,'http://localhost/').pathname.split('/').pop());
 for(const forbidden of [
  'app.js','terrain-worker-client.js','terrain-worker.js',
  'world-tile-streamer.js','frozen-map-package.js'
 ])assert.ok(!scripts.includes(forbidden),'Live authoring in game: '+forbidden);
 for(const required of [
  'frozen-map-game.js','frozen-map-runtime.js',
  'frozen-map-derived-1x.js','frozen-map-derived-2x.js',
  'frozen-map-fog-viewport.js','frozen-map-view-policy.js'
 ])assert.ok(scripts.includes(required),'Missing read-only game module: '+required);
 assert.match(playback,/window\.VedrasFrozenMap\.create\(/);
 assert.match(playback,/window\.VedrasFrozenDerived1x\.createStore\(/);
 assert.match(playback,/window\.VedrasFrozenDerived2x\.createStore\(/);
 assert.match(playback,/readOnly:true/);
 assert.match(playback,/Ungültige Kartenkennung/);
});

test('Optional safety cache cannot be half-integrated or enabled by default',()=>{
 const gameHas=playback.includes("params.get('fallbackAtlas')");
 const runtimeHas=runtime.includes('fallbackAtlasEnabled');
 assert.equal(gameHas,runtimeHas,
  'Viewer flag and RAM safety net must be ported together');
 if(gameHas){
  assert.match(playback,/params\.get\('fallbackAtlas'\)\s*===\s*'1'/,
   'Safety cache must require explicit opt-in before release approval');
  assert.match(playback,/fallbackAtlas\s*,\s*streamingWorldCache/,
   'Viewer must pass the safety-cache option to runtime');
 }
});

test('Playback status distinguishes saved tiles from resident image copies',()=>{
 assert.match(playback,/stats\.saved\+' gespeicherte Kacheln/);
 assert.match(playback,/stats\.decoded\+' Bildpakete im RAM/);
 assert.match(playback,/stats\.decoded1x\+'\/'\+stats\.decoded2x/);
 assert.doesNotMatch(playback,/gespeicherte Tiles im Bildspeicher/,
  'Two LOD copies must not be presented as separate stored map tiles');
});
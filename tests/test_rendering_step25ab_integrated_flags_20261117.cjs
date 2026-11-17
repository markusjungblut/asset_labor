'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const game=fs.readFileSync(path.join(root,'frozen-map-game.js'),'utf8');
const runtime=fs.readFileSync(path.join(root,'frozen-map-runtime.js'),'utf8');
const html=fs.readFileSync(path.join(root,'frozen-map-game.html'),'utf8');
test('all four old experiments and fallback are off unless explicitly enabled',()=>{
 for(const flag of ['leadPrefetch','lodRecency','visibleBorrow','parallelDecode','fallbackAtlas'])
  assert.ok(game.includes("params.get('"+flag+"')==='1'"),flag);
 assert.match(runtime,/directionalPrefetch=false,lodRecency=false,visibleBorrow=false/);
 assert.match(runtime,/parallelLayerDecode=false,fallbackAtlas=false/);
});
test('new optional safety-cache toggle passes only its URL flag',()=>{
 assert.match(html,/id="optFallbackAtlas"/);
 assert.match(game,/\['optFallbackAtlas','fallbackAtlas',fallbackAtlas\]/);
 assert.match(game,/visibleBorrow,parallelLayerDecode,fallbackAtlas,streamingWorldCache/);
 assert.match(html,/frozen-map-runtime\.js\?v=20261117-safe-1x-integration/);
 assert.match(html,/frozen-map-game\.js\?v=20261117-safe-1x-integration/);
});
test('status distinguishes stored tiles and decoded resident bitmaps',()=>{
 assert.match(game,/stats\.saved\+' gespeicherte Kacheln/);
 assert.match(game,/stats\.decoded\+' Bildpakete im RAM/);
 assert.doesNotMatch(game,/gespeicherte Tiles im Bildspeicher/);
});
test('viewer remains read-only with unchanged RAM cap',()=>{
 assert.match(game,/readOnly:true/);
 assert.match(runtime,/maxDecodedPixels=95000000/);
 assert.match(runtime,/FALLBACK_SHARE=\.65/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 assert.doesNotThrow(()=>new Function(runtime));
 assert.doesNotThrow(()=>new Function(game));
});
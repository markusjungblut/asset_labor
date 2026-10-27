'use strict';
/* node --test tests/test_cloud_loading_performance_v0225_20261027.cjs */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');

test('dense scenes cap only interactive preview DPR, never final rendering',()=>{
 const s=read('app.js'),start=s.indexOf('function deviceRatio(){'),
  end=s.indexOf('\nfunction resize(){',start);
 assert.ok(start>=0&&end>start);
 const state={quality:'4',objects:true,natureInstances:Array(3746)};
 const env={state,window:{devicePixelRatio:2},W:1440,H:800,finalRendering:false};
 const ratio=vm.runInNewContext(s.slice(start,end)+';deviceRatio();',env);
 assert.equal(ratio,1.5);
 env.finalRendering=true;
 assert.ok(vm.runInNewContext(s.slice(start,end)+';deviceRatio();',env)>1.5,
  'full-quality final export must remain uncapped');
 state.natureInstances=[];
 assert.ok(vm.runInNewContext(s.slice(start,end)+';deviceRatio();',env)>=1.5);
});
test('loaded nature images are batched, not invalidated on each arrival',()=>{
 const src=read('app.js'),start=src.indexOf('onReady:a=>{'),
  end=src.indexOf('\n }\n});',start);
 assert.ok(start>0&&end>start);
 const callback=src.slice(start,end);
 assert.match(callback,/spriteAssetBatchDirty=true/);
 assert.match(callback,/clearTimeout\(assetReadyTimer\)/);
 assert.match(callback,/const delay=busy\?900:120/);
 assert.match(callback,/if\(spriteAssetBatchDirty\)\{/);
 assert.doesNotMatch(callback,/category\)\)invalidateSpriteLayout\(\)/);
});
test('missing authored sprites trigger image decode rather than being skipped',()=>{
 const src=read('app.js'),start=src.indexOf('function tileArtworkReady(t){'),
  end=src.indexOf('function seedReadyWorldTiles(){',start);
 assert.ok(start>0&&end>start);
 const logic=src.slice(start,end);
 assert.match(logic,/state\.natureInstances\|\|\[\]/);
 assert.match(logic,/state\.mountainInstances\|\|\[\]/);
 assert.match(logic,/state\.hexObject\|\|\{\}/);
 assert.match(logic,/imagePool\.ensure\(asset,11\)/);
 assert.doesNotMatch(logic,/const expected=genericObjects/);
});
test('world tile caches survive unchanged editor frames',()=>{
 const src=read('app.js');
 assert.match(src,/if\(key!==lastTileSnapshotSignature\)\{/);
 assert.match(src,/lastTileSnapshotSignature=key;\s*worldTiles\.invalidate\(\);\s*seedReadyWorldTiles\(\);/);
 assert.match(src,/lastTileSnapshotSignature=null;/);
});
test('performance display reports why fog is still blocking image reveal',()=>{
 const src=read('app.js');
 assert.match(src,/window\.__vedrasCloudReveal=\{readyHexes:readyCount,waitingHexes:waitingCount,/);
 assert.match(src,/Hex bereit /);
 assert.match(src,/Bilder /);
 assert.match(src,/Terrain /);
});
test('release and cache-busting metadata match v0.22.5',()=>{
 assert.match(read('index.html'),/Asset-Labor v0\.22\.5/);
 assert.match(read('index.html'),/app\.js\?v=0\.55\.5/);
 assert.match(read('server.py'),/VERSION = '0\.22\.5'/);
});

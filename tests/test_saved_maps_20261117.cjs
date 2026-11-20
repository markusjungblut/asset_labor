'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const context={window:{},document:{getElementById:()=>null},
 location:{origin:'http://127.0.0.1:8780'},URLSearchParams};
vm.runInNewContext(fs.readFileSync(path.join(root,'saved-maps.js'),'utf8'),context);
const lib=context.window.VedrasSavedMaps;
const A='v1-0374527a',B='v1-abcdef12',C='v1-badc0ffe',D='v1-11111111';
function fixture(){
 const records={
  [A+'|manifest']:{key:A+'|manifest',schema:1,sceneKey:A,levels:['near'],
   cells:[{q:0,r:0}],expectedTiles:2,savedAt:'2026-11-15T10:00:00Z'},
  [B+'|manifest']:{key:B+'|manifest',schema:1,sceneKey:B,levels:['near'],
   cells:[{q:1,r:1}],expectedTiles:3,complete:false,importedFromScene:A,
   savedAt:'2026-11-16T10:00:00Z'},
  [C+'|manifest']:{key:C+'|manifest',schema:5,sceneKey:C,levels:['near'],cells:[]}
 };
 const keys=[...Object.keys(records),A+'|near|0,0',A+'|near|1,0',
  B+'|near|0,0',C+'|near|0,0',D+'|near|1,1',D+'|import-pending',
  'v1-12345678|near|../../trick','invalid|manifest',
  'v1-22222222|import-pending','v1-22222222|manifest',
  'v1-22222222|near|0,0'];
 const gets=[],writes=[];
 return {keys,gets,writes,storage:{async keys(){return keys;},
  async get(k){gets.push(k);return records[k]||null;},
  async put(x){writes.push(x);throw Error('No writes permitted');}}};
}
test('inspect only strict manifest keys and valid raster identifiers',()=>{
 const {keys}=fixture(),m=lib.inspectKeys(keys);
 assert.deepEqual(Array.from(m.map(x=>x.scene)),[A,B,C]);
 assert.equal(m[0].counts.near,2);
 assert.equal(m[1].counts.near,1);
 assert.equal(m[2].counts.near,1);
});
test('read-only listing never retrieves PNG records or pending imports',async()=>{
 const {storage,gets,writes}=fixture();const rows=await lib.list({storage});
 assert.equal(rows.length,3);
 assert.ok(gets.every(k=>k.endsWith('|manifest')));
 assert.deepEqual(gets.sort(),[A,B,C].map(s=>s+'|manifest').sort());
 assert.equal(writes.length,0);
 assert.equal(rows[0].scene,B);
 assert.equal(rows[0].partial,true);
 assert.equal(rows[0].importedFromScene,A);
 assert.equal(rows[0].counts.near,1);
 assert.equal(rows[1].scene,A);
 assert.equal(rows[1].expectedTiles,2);
 assert.equal(rows[2].valid,false);
 assert.equal(rows[2].levels.length,0);
});
test('opening only strict scene IDs and known, populated LODs',async()=>{
 const rows=await lib.list({storage:fixture().storage});
 assert.deepEqual(Array.from(rows[1].levels),['near']);
 assert.equal(lib.viewerPath(A,'near'),
  'frozen-map-game.html?scene=v1-0374527a&lod=near');
 for(const [scene,lod] of [['../../etc','near'],[A,'custom'],['v1-DEADBEEF','near']])
  assert.throws(()=>lib.viewerPath(scene,lod));
});
test('page is separate and does not change IndexedDB records',()=>{
 const html=fs.readFileSync(path.join(root,'saved-maps.html'),'utf8'),
  script=fs.readFileSync(path.join(root,'saved-maps.js'),'utf8');
 assert.match(html,/saved-maps\.js\?v=/);
 assert.match(html,/id="findMaps"/);
 assert.match(script,/indexedDB\.open\(DB\)/);
 assert.match(script,/req\.onupgradeneeded=\(\)=>req\.transaction\.abort\(\)/);
 assert.match(script,/\.getAllKeys\(/);
 assert.match(script,/db\.transaction\(STORE,'readonly'\)/);
 assert.doesNotMatch(script,/deleteDatabase\(|\.delete\(|\.clear\(|'readwrite'|\.put\(/);
});

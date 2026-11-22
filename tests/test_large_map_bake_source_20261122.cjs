'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const G=require('../worldgen-geography.js');
const MIX=require('../geography-lab-presets.js');
const P=require('../large-map-bake-plan.js');
const Source=require('../large-map-bake-source.js');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../chunks.js'),'utf8'),sandbox);
const C=sandbox.window.VedrasChunks;
const world=(width=95,height=75,seed='vedras-welt-01',q=0,r=0)=>
 G.generateWorld(seed,{width,height,originQ:q,originR:r,
  config:MIX.configFor(G)});
test('indexed source windows match every renderer neighbors() list on a 7125-hex world',()=>{
 const w=world(),p=P.plan(w),adapter=Source.create(w,p,{planner:P});
 assert.equal(p.tileCount,1678);
 let total=0;
 for(const tile of p.tiles){
  const input=adapter.contextFor(tile.id);
  const actual=input.cells.map(c=>[c.q,c.r]),
   reference=C.neighbors(tile,w.cells,470).map(c=>[c.q,c.r]);
  assert.deepEqual(actual,reference,'window for '+tile.id);
  assert.equal(input.sourceCount,actual.length);
  assert.equal(input.tile.id,tile.id);
  assert.equal(input.sourceHalo,470);
  for(const c of input.ownerCells){
   const pos=C.worldPos(c);
   assert(pos.x>=tile.x&&pos.x<tile.x+512);
   assert(pos.y>=tile.y&&pos.y<tile.y+512);
  }
  total+=input.sourceCount;
 }
 assert(total/adapter.tileCount<100,'bounded local source instead of all world cells');
});
test('routes are inherited uncut and the context is detached from source edits',()=>{
 const w=world(30,28,'route-test',-18,21),p=P.plan(w),
  adapter=Source.create(w,p,{planner:P});
 const found=p.tiles.map(t=>adapter.contextFor(t.id))
  .find(c=>c.riverPaths.length>0);
 assert(found,'expected at least one river tile');
 assert(found.riverPaths.every(r=>w.riverPaths.some(x=>JSON.stringify(x)===JSON.stringify(r))));
 if(found.cells.length){
  const c=found.cells[0],original=w.cells.find(x=>x.q===c.q&&x.r===c.r);
  const before=original.terrainId;
  c.terrainId='tampered';
  assert.equal(original.terrainId,before);
 }
 assert.throws(()=>adapter.contextFor('999999,999999'),/nicht zum bestätigten/);
});
test('foreign geography or changed tile list cannot sneak through planning adapter',()=>{
 const w=world(12,11,'foreign-one'),p=P.plan(w),
  newer=world(12,11,'foreign-two');
 assert.throws(()=>Source.create(newer,p,{planner:P}),/passt nicht/);
 const injected={...p,tiles:[...p.tiles].reverse()};
 assert.throws(()=>Source.create(w,injected,{planner:P}),/passt nicht/);
 const duplicate={...p,tiles:[...p.tiles.slice(0,-1),p.tiles[0]]};
 assert.throws(()=>Source.create(w,duplicate,{planner:P}));
});
test('near maximum-size world keeps source queries bounded with absolute negative coordinates',()=>{
 const width=240,height=240,cells=[];
 for(let r=0;r<height;r++)for(let q=0;q<width;q++)
  cells.push({q:q-120,r:r-120,terrainId:'grassland',
   reliefClass:'plain',features:[]});
 const w={version:G.VERSION,seed:'synthetic-source',width,height,
  originQ:-120,originR:-120,config:G.defaultConfig(),
  cells,riverPaths:[]},p=P.plan(w);
 const ctx=Source.create(w,p,{planner:P});
 for(const id of [p.tiles[0].id,p.tiles[Math.floor(p.tileCount/2)].id,p.tiles.at(-1).id]){
  const section=ctx.contextFor(id);
  assert(section.sourceCount>0);
  assert(section.sourceCount<100);
 }
});

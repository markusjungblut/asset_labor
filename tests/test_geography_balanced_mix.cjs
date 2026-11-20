/* Geography diversity preset regression – run: node tests/test_geography_balanced_mix.cjs */
'use strict';
const assert=require('node:assert/strict');
const G=require('../worldgen-geography.js');
const Mix=require('../geography-lab-presets.js');
assert.equal(G.VERSION,'geography-v2.1.2');
const c=Mix.configFor(G),p=Mix.PRESET;
assert.equal(G.normalizeConfig(c)['geology.aridPatchMix'],1);
const options={width:p.width,height:p.height,originQ:p.originQ,originR:p.originR,config:c};
const world=G.generateWorld(p.seed,options);
const same=G.generateWorld(p.seed,options);
assert.deepEqual(world,same,'calibrated preset must be deterministic');
const report=Mix.inspect(world,G);
assert.equal(report.terrainTotal,26);
assert.deepEqual(report.missing,[],'all normal terrains must spawn in calibrated preview');
assert.equal(report.allGoalsMet,true,'mixed climate and terrain targets must pass');
assert(report.biomes.grassland>report.biomes.cold);
assert(world.stats.terrains.grassland>report.biomes.cold);
assert(report.wetDryGap<=5,'wet/dry families must remain close');
for(const id of ['desert','wasteland','rocky_badlands','badlands','clay_desert',
 'sandy_badlands','snowfields','icy_ocean'])
 assert((world.stats.terrains[id]||0)>=25,'too rare in calibrated preview: '+id);
const baseline=G.generateWorld(p.seed,{width:p.width,height:p.height});
for(const id of ['desert','wasteland','rocky_badlands','badlands','clay_desert',
 'sandy_badlands','snowfields','icy_ocean'])
 assert((world.stats.terrains[id]||0)>(baseline.stats.terrains[id]||0),
  'mix should increase '+id+' relative to stock defaults');
for(const id of ['ocean','savanna','grassland'])
 assert((world.stats.terrains[id]||0)<(baseline.stats.terrains[id]||0),
  'mix should reduce '+id+' relative to stock defaults');
assert(world.stats.terrains.moor+world.stats.terrains.marshland<
 baseline.stats.terrains.moor+baseline.stats.terrains.marshland);
const fewerSnow=G.generateWorld(p.seed,{...options,
 config:{...c,'biomes.snowHumidity':0.60}});
assert(world.stats.terrains.snowfields>fewerSnow.stats.terrains.snowfields);
assert(world.stats.terrains.frozen_tundra<fewerSnow.stats.terrains.frozen_tundra);
const fewerSwamps=G.generateWorld(p.seed,{...options,
 config:{...c,'geology.swampWarmBoundary':0.64}});
assert(world.stats.terrains.moor+world.stats.terrains.marshland<
 fewerSwamps.stats.terrains.moor+fewerSwamps.stats.terrains.marshland);
const cropped=G.generateWorld(p.seed,{width:40,height:35,config:c});
for(const cell of cropped.cells)
 assert.deepEqual(cell,G.getWorldCell(world,cell.q,cell.r),
  'geology patches cannot depend on preview bounds');
assert.equal(G.TERRAIN_IDS.length,26);
assert(!G.TERRAIN_IDS.includes('forest_floor'));
console.log('PASS geography v2.1.2 balanced mix: 26 terrains; arid variety; snow and ice; '+
 'grass/cold & wet/dry balance; stable crop.');

'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const script=fs.readFileSync(path.join(root,'frozen-map-game-load.js'),'utf8');
test('100 dynamic game tokens animate in a separate bounded canvas, never baking terrain',()=>{
 const tasks=[],cancelled=[],ops=[],metrics=[];
 const ctx={
  setTransform(...a){ops.push(['transform',...a]);},
  clearRect(...a){ops.push(['clear',...a]);},
  beginPath(){},arc(){ops.push(['circle']);},fill(){},
  fillRect(){ops.push(['bar']);},stroke(){}
 };
 const canvas={width:0,height:0,getContext:()=>ctx},
  viewCanvas={clientWidth:560,clientHeight:360};
 const env={window:{},document:{hidden:false},performance:{now:()=>3},
  requestAnimationFrame:fn=>{tasks.push(fn);return tasks.length;},
  cancelAnimationFrame:id=>cancelled.push(id)};
 vm.runInNewContext(script,env);
 const api=env.window.VedrasGameplayLoad.create({canvas,viewCanvas,
  getPose:()=>({zoom:.8,panX:0,panY:0,dpr:4,projectY:.85}),
  unitCount:100,onMetrics:z=>metrics.push(z)});
 api.start();assert.equal(tasks.length,1);
 tasks.shift()(1000);
 const report=api.report();
 assert.equal(report.unitCount,100);
 assert(report.visible>0&&report.visible<=100);
 assert.equal(canvas.width,700,'dynamic layer DPR capped at 1.25 despite static 4x');
 assert.equal(canvas.height,450);
 assert(ops.some(x=>x[0]==='circle'),'draws visible battle units');
 assert(ops.some(x=>x[0]==='bar'),'draws HP HUD on unit sprites');
 assert(metrics.length===1,'bounded HUD callback fires once, not per sprite');
 assert.equal(script.includes('bakeWorldTile('),false);
 assert.equal(script.includes('indexedDB'),false);
 assert.equal(script.includes('VedrasFrozenMap.capture'),false);
 api.stop();assert(cancelled.length>0,'independent RAF can stop on pagehide');
});
test('game overlay is entirely opt-in and does not intercept mouse or touch input',()=>{
 const game=fs.readFileSync(path.join(root,'frozen-map-game.js'),'utf8'),
  html=fs.readFileSync(path.join(root,'frozen-map-game.html'),'utf8');
 assert(game.includes("params.get('gameLoad')==='1'"));
 assert(game.includes("['optGameLoad','gameLoad',loadTestRequested]"));
 assert(game.includes('getPose:()=>player.getPose()'));
 assert(game.includes("window.addEventListener('pagehide',()=>gameLoadController?.stop())"));
 assert(html.includes('id="optGameLoad"'));
 assert(html.includes('id="gameLoadOverlay"'));
 assert(html.includes('id="gameLoadHud"'));
 assert(html.includes('#gameLoadOverlay{position:absolute;inset:0;pointer-events:none'));
 assert(html.indexOf('frozen-map-game-load.js?v=')<html.indexOf('frozen-map-game.js?v='));
});

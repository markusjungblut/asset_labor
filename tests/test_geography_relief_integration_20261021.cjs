/* Geography-to-relief pipeline acceptance tests (no assets changed).
 * Run: node tests/test_geography_relief_integration_20261021.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const get=filename=>fs.readFileSync(path.join(root,filename),'utf8');
const win={};new Function('window',get('relief.js'))(win);
const R=win.VedrasRelief;
assert.equal(R.defaults().mode,'legacy','demo scenes stay backwards compatible');
const hills=[
 {q:0,r:0,worldQ:120,worldR:-20,profile:'rounded',strength:.75},
 {q:1,r:0,worldQ:121,worldR:-20,profile:'steep',strength:.62},
 {q:0,r:1,worldQ:120,worldR:-19,profile:'ridge',strength:.82},
 {q:1,r:1,worldQ:121,worldR:-19,profile:'chain',strength:.70},
 {q:2,r:1,worldQ:122,worldR:-19,profile:'plateau',strength:.55}
];
const cfg={...R.defaults(),enabled:true,mode:'geography',strength:75,geoHills:hills};
const sample=(x,y)=>R.geographyHeight(x,y,cfg);
const RHEX=256/Math.sqrt(3);
const pos=(q,r)=>[256*(q+r/2),1.5*RHEX*r];
for(const cell of hills){
 const [x,y]=pos(cell.q,cell.r);
 assert(sample(x,y)>0,'all geographic hill classes must contribute visible relief');
 assert.equal(sample(x,y),sample(x,y),'absolute world point must remain deterministic');
}
const [x0,y0]=pos(0,0),[x1,y1]=pos(1,0);
assert(sample((x0+x1)/2,(y0+y1)/2)>0,
 'land between adjacent hill hexes must be raised continuously');
for(let x=-200;x<=620;x+=5){
 const d=Math.abs(sample(x,0)-sample(x+.5,0));
 assert(d<1,'heightfield may not jump sharply at hex border or noise-grid boundary: '+d);
}
assert.equal(R.geographyHeight(0,0,{...cfg,geoHills:[]}),0,
 'geography mode must never fall back to old single-hill relief');
assert.equal(R.geographyHeight(0,0,{...cfg,strength:0}),0,
 'relief intensity zero switches off elevations');
const remote={x:6000,y:6000,width:256,height:256,
 canvas:{width:200,height:200},density:1};
assert.equal(R.make(remote,cfg),remote,
 'tiles outside all hill regions must bypass the expensive warp');
const legacy={...R.defaults(),enabled:true,mode:'legacy',strength:75};
assert(R.rawAt(0,0,legacy)>0,
 'old single test hill remains available as an explicit comparison');
const geographyManualMode={...cfg,center:'20,20',profile:'steep'};
assert.equal(sample(0,0),R.geographyHeight(0,0,geographyManualMode),
 'geography mode must ignore legacy center and single-profile controls');
const app=get('app.js'),html=get('index.html');
for(const needle of [
 "profile:c.hillProfile||'rounded'",
 "worldQ:source.q,worldR:source.r",
 "hillStrength:Number.isFinite(source.hillStrength)",
 "mode:'geography',enabled:true",
 "geographyMaterialTiles.get(geoKey)",
 "geographyMaterialTiles.set(geoKey,raster)",
 "geoHills,landMask:coastFade",
 "state.geographyScene={size:state.sceneSize,cells:next}",
 "syncShorelineControls();assignBiomes(true);reloadFromServer()"
])assert(app.includes(needle),'missing geographic height integration: '+needle);
assert(html.includes('id="reliefMode"'),'worldgen/legacy relief source switch missing');
assert(html.includes('relief.js?v=0.35.0'),'new relief script must defeat stale browser cache');
assert(app.includes("addEventListener('change',e=>{state.relief.strength=+e.target.value"),
 'expensive terrain regeneration should happen only on slider commit');
console.log('PASS: multi-hex geographical heightfield, 5 hill profiles, smooth transitions, legacy compatibility, persistence, separate material cache.');

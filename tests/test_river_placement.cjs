/* Regression: users can place rivers even when the default map has ZERO WATER hexes.
 * A real water PNG is installed only by the explicitly named demo button.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const w={};vm.runInNewContext(fs.readFileSync(path.join(root,'river.js'),'utf8'),{window:w},{filename:'river.js'});
const R=w.VedrasRivers;
assert.equal(typeof R.edgeWalk,'function');
const cells=[];for(let q=-3;q<=3;q++)for(let r=-3;r<=3;r++)if(Math.abs(q+r)<=3)cells.push({q,r});
const state={selected:'0,0',riverPaths:[],riverWidth:32,river:false,riverDebug:false,hexTerrain:{},hexObject:{},forest:{jungleHexes:{}}};
const controls=new Map(),listeners=new Map();
function el(id){
 if(!controls.has(id))controls.set(id,{id,textContent:'',value:'',checked:false,classList:{toggle(){}},handlers:{},
  addEventListener(type,cb){this.handlers[type]=cb;},
  click(){assert(this.handlers.click,'missing listener '+id);this.handlers.click();}});
 return controls.get(id);
}
const document={getElementById:el};
const waterAsset={name:'ocean_01.png',path:'assets/terrain/ocean_01.png',category:'terrain',terrainCheck:{ok:true},id:'ocean'};
let assets=[waterAsset],draws=0,persists=0,terrainInvalidations=0;
const core={
 state,assets:()=>assets,cells:()=>cells,catalog:()=>({terrainTypes:[{id:'grassland',materialClass:'ground'},{id:'ocean',materialClass:'water'}]}),
 effectiveBiome:c=>state.hexTerrain[R.key(c)]===waterAsset.path?'ocean':'grassland',
 typeOfAsset:a=>a?.id,isTerrainValid:a=>a?.terrainCheck?.ok,
 persistScene:()=>{persists++;},requestDraw:()=>{draws++;},invalidateTerrain:()=>{terrainInvalidations++;}
};
w.VedrasAssetLabor=core;w.VedrasRivers=R;
w.addEventListener=(name,cb)=>{if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(cb);};
w.dispatchEvent=e=>{for(const cb of listeners.get(e.type)||[])cb(e);};
function Event(type){this.type=type;}
const context={window:w,document,Event};
vm.runInNewContext(fs.readFileSync(path.join(root,'river-ui.js'),'utf8'),context,{filename:'river-ui.js'});
assert(w.VedrasRiverUI,'controls initialized');
assert(el('riverStats').textContent.includes('0 Wasserhexe'));
el('riverAdd').click();
assert.equal(state.riverPaths.length,0,'automatic mode still requires WATER');
assert(el('riverStats').textContent.includes('Kein Wasserhex'));
el('riverQuickStart').click();
assert.equal(state.riverPaths.length,1,'one-click demo adds river');
const route=state.riverPaths[0],mouth=route.hexes.at(-1),mouthKey=mouth.join(',');
assert.equal(state.hexTerrain[mouthKey],waterAsset.path,'real WATER PNG assigned to map border');
assert(R.valid(route,cells,c=>core.effectiveBiome(c)==='ocean'));
assert(route.hexes.length>=3,'default 37 hex scene gets a visible river');
assert(state.river&&el('riverToggle').checked);
assert(draws>0&&persists>0&&terrainInvalidations>0);
assert(R.sections(route,cells,c=>core.effectiveBiome(c)==='ocean')[0].kind==='source');
assert(el('riverStats').textContent.includes('Testfluss erstellt'));
el('riverClear').click();
assert.equal(state.riverPaths.length,0);
assert.equal(state.hexTerrain[mouthKey],waterAsset.path,'clearing a river does not silently remove assigned terrain');
state.selected='0,0';el('riverAdd').click();
assert.equal(state.riverPaths.length,1,'normal automatic placement works after water was provided');
el('riverClear').click();
// Manual placement follows the selected hex events and finishes only in WATER.
state.hexTerrain={};state.hexTerrain['2,0']=waterAsset.path;
state.selected='0,0';el('riverPaint').click();
assert.deepEqual(JSON.parse(JSON.stringify(state.riverDraft)),[[0,0]]);
state.selected='2,0';w.dispatchEvent(new Event('vedras:hex-selected'));
assert.equal(state.riverDraft.length,1,'nonadjacent move is rejected');
assert(el('riverStats').textContent.includes('unmittelbar benachbart'));
state.selected='1,0';w.dispatchEvent(new Event('vedras:hex-selected'));
assert.equal(state.riverDraft.length,2,'adjacent land becomes provisional draft');
assert.equal(state.riverPaths.length,0,'no incomplete river saved');
state.selected='2,0';w.dispatchEvent(new Event('vedras:hex-selected'));
assert.equal(state.riverDraft,null,'draft ends after reaching water');
assert.equal(state.riverPaths.length,1);
assert.equal(R.sections(state.riverPaths[0],cells,c=>core.effectiveBiome(c)==='ocean')[0].corner!==null,true);
el('riverPaint').click();
assert.equal(state.riverDraft,null,'cannot start from water');
assert(el('riverStats').textContent.includes('Landhex'));
el('riverClear').click();
assets=[];state.hexTerrain={};state.selected='0,0';
el('riverQuickStart').click();
assert.equal(state.riverPaths.length,0,'no fake WATER hex with missing texture');
assert(el('riverStats').textContent.includes('Wassertextur'),'clear guidance when no water image is loaded');
assert.equal(Object.keys(state.hexTerrain).length,0);
console.log('PASS: 37-hex no-water scene, one-click real water outlet, automatic river, manual hex-by-hex routing, invalid step/water guards, no phantom water.');

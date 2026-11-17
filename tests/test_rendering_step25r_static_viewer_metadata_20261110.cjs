'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'..','frozen-map-runtime.js'),'utf8');
const SCENE='v1-0374527a';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('25R cached hex unit corners exactly preserve ground and scenery clip polygons',async()=>{
 const paths=[],counts={sin:0,cos:0};
 const math=Object.create(Math);
 math.sin=v=>{counts.sin++;return Math.sin(v);};
 math.cos=v=>{counts.cos++;return Math.cos(v);};
 const ctx={
  setTransform(){},save(){},restore(){},beginPath(){paths.push(['begin']);},
  moveTo(x,y){paths.push(['M',x,y]);},
  lineTo(x,y){paths.push(['L',x,y]);},closePath(){paths.push(['close']);},
  clip(){paths.push(['clip']);},clearRect(){},fillRect(){},fill(){},
  drawImage(){},rect(){},translate(){},scale(){}
 };
 const canvas={width:0,height:0,getContext:()=>ctx,
  getBoundingClientRect:()=>({width:1200,height:900})};
 const key=SCENE+'|near|0,0',png={width:512,height:512,close(){}};
 const storage={async keys(){return [key]},async get(id){
  return {key:id,sceneKey:SCENE,level:'near',
   tile:{id:'0,0',x:0,y:0,size:512},
   layers:[{layer:'ground',pad:0,png},
    {layer:'scenery',pad:0,png}]};
 }};
 const cells=[
  {q:0,r:0,x:-100,y:90,radius:164,visibility:'visible'},
  {q:2,r:-1,x:260,y:-150,radius:173,visibility:'explored'},
  {q:9,r:8,x:0,y:0,radius:190,visibility:'hidden'}];
 const window={};let time=0;
 vm.runInNewContext(src,{window,console,Math:math,
  performance:{now:()=>++time},requestAnimationFrame:()=>{}});
 const player=window.VedrasFrozenMap.create({canvas,storage,
  useLayerCache:false,overview1x:false,decode:async png=>png});
 const pose={zoom:.83,panX:50,panY:-40,dpr:1.33,projectY:.85};
 await player.load(SCENE,'near',pose,cells);
 for(let i=0;i<8&&player.report().decoded<1;i++){
  player.draw();await tick();
 }
 assert.equal(player.report().decoded,1);
 assert.equal(counts.sin,6);
 assert.equal(counts.cos,6);
 for(const p of [pose,{...pose,zoom:1.05,panX:-245,panY:88}]){
  player.setPose(p);paths.length=0;
  const sinBefore=counts.sin,cosBefore=counts.cos;
  player.draw();
  assert.equal(counts.sin,sinBefore,'no new trig during render');
  assert.equal(counts.cos,cosBefore,'no new trig during render');
  const actual=paths.filter(x=>x[0]==='M'||x[0]==='L');
  const expected=[];
  for(const halo of [0,45])for(const c of cells.slice(0,2)){
   const x=600+p.panX+c.x*p.zoom,
    y=450+p.panY+c.y*p.zoom*p.projectY,
    rx=(c.radius+halo)*p.zoom,ry=rx*p.projectY;
   for(let i=0;i<6;i++){
    const theta=-Math.PI/2+i*Math.PI/3;
    expected.push([i===0?'M':'L',x+rx*Math.cos(theta),
     y+ry*Math.sin(theta)]);
   }
  }
  assert.equal(actual.length,expected.length);
  for(let i=0;i<actual.length;i++){
   assert.equal(actual[i][0],expected[i][0]);
   assert.equal(actual[i][1],expected[i][1],'x vertex '+i);
   assert.equal(actual[i][2],expected[i][2],'y vertex '+i);
  }
  assert.equal(paths.filter(x=>x[0]==='clip').length,2);
 }
 // Manifest reload must never retain old visible/explored polygons.
 await player.load(SCENE,'near',pose,cells.map(c=>({...c,visibility:'hidden'})));
 paths.length=0;player.draw();
 assert.equal(paths.filter(x=>x[0]==='M').length,0);
 assert.equal(paths.filter(x=>x[0]==='clip').length,2);
 player.stop();
});
test('25R does not change archived terrain, Fog permission or bake pipeline',()=>{
 assert.match(src,/const HEX_CORNERS=Array\.from/);
 assert.match(src,/tileRecords=\[\],authorizedClipCells=\[\]/);
 assert.match(src,/for\(const \{key,ix,iy\} of indexedCandidates\|\|tileRecords\)/);
 assert.doesNotMatch(src,/deleteDatabase\(|bakeWorldTile\(/);
 assert.doesNotThrow(()=>new Function(src));
});

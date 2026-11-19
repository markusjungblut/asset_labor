'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const window={};
vm.runInNewContext(read('water-texture.js'),{window,Uint8ClampedArray,Math});
const repair=window.VedrasWaterTexture.repairPixels;
function pixels(width,height,fill){
 const p=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4,red=fill(x,y);
  p[i]=red;p[i+1]=Math.floor(red*.85);p[i+2]=Math.floor(red*.4);p[i+3]=255;
 }
 return p;
}
function sample(p,w,x,y=24){
 const i=(y*w+x)*4;return [...p.slice(i,i+3)];
}
test('land repeat edges blend without touching source artwork or center',()=>{
 const w=128,h=128,raw=pixels(w,h,(x,y)=>x<64?35:195);
 const old=new Uint8ClampedArray(raw);
 const fixed=repair(raw,w,h,{centerStripe:false,edgeBand:32});
 assert.deepEqual([...raw],[...old],'original PNG texels remain unchanged');
 assert.deepEqual(sample(fixed,w,64),sample(raw,w,64),
  'land core is not blurred or stripped');
 const a=sample(fixed,w,0),b=sample(fixed,w,w-1);
 const before=Math.abs(sample(raw,w,0)[0]-sample(raw,w,w-1)[0]);
 assert.ok(before>=150);
 assert.ok(Math.abs(a[0]-b[0])<=1,
  'opposite land repeat edges meet at the same RGB');
 assert.ok(Math.abs(sample(fixed,w,15)[0]-sample(raw,w,15)[0])>0,
  'only the repeat-margin undergoes correction');
});
test('water keeps its narrow eight-texel wrap correction',()=>{
 const w=128,h=128,raw=pixels(w,h,x=>x<64?10:225);
 const water=repair(raw,w,h);
 const land=repair(raw,w,h,{centerStripe:false,edgeBand:32});
 assert.ok(Math.abs(sample(water,w,15)[0]-10)<2,
  'water artwork 15px in from the edge remains intact');
 assert.ok(Math.abs(sample(land,w,15)[0]-10)>2,
  'land has a wider gradual transition than water');
});
test('worker, on-screen editor and frozen atlas all use new derived ground sampling',()=>{
 const a=read('autotile.js'),w=read('terrain-worker.js'),
  client=read('terrain-worker-client.js'),app=read('app.js'),
  html=read('index.html');
 assert.match(a,/window\.VedrasWaterTexture\?\.repairPixels\?/);
 assert.match(a,/centerStripe:false,edgeBand:32/);
 assert.match(w,/20261119-ground-wrap-v1/);
 assert.match(client,/20261119-ground-wrap-v1/);
 assert.match(app,/game-map-export-renderer-v7-ground-wrap-v1/);
 assert.match(app,/terrain-static-v5-ground-wrap-v1/);
 assert.match(html,/autotile\.js\?v=20261119-ground-wrap-v1/);
});
test('equalization control has a direct shortcut without mutating the map',()=>{
 const ui=read('ui-organizer.js'),html=read('index.html');
 assert.match(ui,/balanceShortcut\.textContent='Schattenangleich'/);
 assert.match(ui,/balanceShortcut\.dataset\.focus='shadowToneControls'/);
 assert.match(ui,/if\(detail\)detail\.open=true/);
 assert.match(html,/id="shadowToneBalance"/);
});

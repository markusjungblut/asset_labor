'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('strategic view aggregates contiguous terrain into legible region labels',()=>{
 const context={window:{}};vm.runInNewContext(read('strategic-view.js'),context);
 const {regions,draw}=context.window.VedrasStrategic;
 const cells=[];
 for(let q=0;q<12;q++)for(let r=0;r<8;r++)
  cells.push({q,r,terrain:q<6?'grassland':'ocean'});
 const groups=regions(cells,c=>c.terrain);
 assert.equal(groups.length,2);
 assert.equal(groups[0].count,48);
 const labels=[],strokes=[];
 const ctx={
  save(){},restore(){},setTransform(){},clearRect(){},fillRect(){},beginPath(){},
  closePath(){},moveTo(){},lineTo(){},fill(){},stroke(){strokes.push(1);},
  arc(){},roundRect(){},
  measureText:s=>({width:s.length*6.5}),fillText:t=>labels.push(t)
 };
 const stats=draw(ctx,{
  cells,dimensions:{width:1800,height:1100},zoom:.25,
  panX:-150,panY:-100,selected:'0,0',
  typeFor:c=>c.terrain,nameFor:t=>t==='ocean'?'Ozean':'Grasland',
  categoryFor:()=>'',centers:[{q:5,r:4,name:'Stadt A'}],overlay:'both'
 });
 assert.equal(stats.regions,2);
 assert.ok(stats.labels<=3);
 assert.ok(stats.labels>=2);
 assert.ok(strokes.length>=cells.length);
});
test('strategic-only centers overlay suppresses per-hex biome labels',()=>{
 const sandbox={window:{}};vm.runInNewContext(read('strategic-view.js'),sandbox);
 const api=sandbox.window.VedrasStrategic;
 const labels=[],ctx=new Proxy({},{
  get(target,name){
   if(name==='measureText')return x=>({width:x.length*7});
   if(name==='fillText')return x=>labels.push(x);
   if(name==='roundRect')return ()=>{};
   return ()=>{};
  },
  set(target,name,value){target[name]=value;return true;}
 });
 const cells=Array.from({length:18},(_,i)=>({q:i,r:0,type:'grassland'}));
 const stats=api.draw(ctx,{cells,dimensions:{width:1600,height:900},zoom:.25,
  panX:0,panY:0,typeFor:c=>c.type,centers:[{q:1,r:0,name:'Marktstadt'}],
  overlay:'centers'});
 assert.ok(!labels.includes('grassland'));
 assert.equal(stats.centers,1);
});
test('zoom is clamped to 25–200 and switching modes does not decrease detail zoom',()=>{
 const app=read('app.js'),ui=read('index.html');
 assert.match(app,/const ZMIN=\.25,ZMAX=2\.00/);
 assert.match(app,/requested<ZMIN&&state\.mode!=='far'/);
 assert.match(app,/state\.mode==='far'&&zoom>ZMIN/);
 assert.match(app,/if\(state\.mode==='far'\)\{[\s\S]*?VedrasStrategic\.draw/);
 assert.match(ui,/id="zoomSlider" type="range" min="25" max="200"/);
 assert.match(ui,/id="strategyToggle"/);
 assert.match(ui,/id="strategyOverlay"/);
 assert.match(ui,/strategic-view\.js\?v=/);
});

test('atlas maps source-space crop to page-space crop preserving the sprite anchor',async()=>{
 const calls=[],pending=[],images=[];
 class FakeImage{
  naturalWidth=2048;naturalHeight=2048;
  set src(u){this.url=u;images.push(this);pending.push(this);}
 }
 const manifest={schemaVersion:1,tiers:{
  desktop:{pages:[{file:'desktop/page_000.png'}],sprites:{
   'assets/nature/tree.png':{page:0,trim:[20,10,60,80],rect:[100,200,120,160]}
  }}
 }};
 const sandbox={window:{innerWidth:1800,innerHeight:980},navigator:{maxTouchPoints:0},
  Image:FakeImage,fetch:async()=>({ok:true,json:async()=>manifest})};
 vm.runInNewContext(read('sprite-atlas-runtime.js'),sandbox);
 const atlas=sandbox.window.VedrasSpriteAtlas.create({onReady:()=>{}});
 assert.equal(await atlas.open(),true);
 const ctx={drawImage:(...args)=>calls.push(args)};
 const b={sx:21,sy:11,sw:58,sh:78},dest={x:100,y:200,w:116,h:156};
 assert.equal(atlas.draw(ctx,'assets/nature/tree.png',b,dest),false);
 pending.shift().onload();
 assert.equal(atlas.draw(ctx,'assets/nature/tree.png',b,dest),true);
 assert.equal(calls.length,1);
 const [img,sx,sy,sw,sh,dx,dy,dw,dh]=calls[0];
 assert.equal(img.url,'atlases/desktop/page_000.png');
 assert.ok(sx>100&&sy>200);
 assert.equal(dx,100);assert.equal(dy,200);
 assert.equal(dw,116);assert.equal(dh,156);
 assert.equal(atlas.info().pages,1);
});
test('offline atlas is optional, never prevents rendering original sprites',()=>{
 const src=read('app.js'),python=read('scripts/build_sprite_atlases.py'),
  index=read('index.html'),server=read('server.py');
 assert.match(src,/if\(!spriteAtlas\?\.draw\(ctx,obj\.asset\.path,b,/);
 assert.match(src,/ctx\.drawImage\(obj\.asset\.img,b\.sx,b\.sy/);
 assert.match(python,/GUTTER = 2/);
 assert.match(python,/def bbox_rgba/);
 assert.match(python,/def extrude/);
 assert.match(python,/def fingerprint/);
 assert.match(python,/def build\(/);
 assert.match(index,/id="atlasBuild"/);
 assert.match(server,/schedule_atlas_build/);
 assert.match(server,/\/api\/atlas-status/);
 assert.match(server,/\/api\/build-atlases/);
});

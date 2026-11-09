'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const helper=read('frozen-map-world-blit.js'),runtime=read('frozen-map-runtime.js'),
 policy=read('frozen-map-view-policy.js'),game=read('frozen-map-game.js'),
 html=read('frozen-map-game.html');
const makePlan=()=>{
 const w={};vm.runInNewContext(helper,{window:w,Float64Array});
 return w.VedrasFrozenWorldBlit.plan;
};
const view={width:1600,height:920,zoom:.85,panX:0,panY:0,projectY:.85};
test('conservative authorized-hex bounds cover all +45-world-unit polygon vertices',()=>{
 const plan=makePlan(),dpr=1.435;
 const cells=[{q:0,r:0,x:-360,y:-210,radius:140,visibility:'visible'},
  {q:2,r:1,x:420,y:240,radius:170,visibility:'explored'},
  {q:5,r:3,x:900,y:600,radius:150,visibility:'hidden'}];
 const chosen=plan(view,cells,dpr);
 assert.ok(chosen&&chosen.rects.length>=1&&chosen.rects.length<=8);
 assert.ok(chosen.fraction>.03&&chosen.fraction<.77);
 for(const cell of cells.filter(c=>c.visibility!=='hidden'))
  for(let n=0;n<72;n++){
   const t=-Math.PI/2+n*Math.PI/36,r=(cell.radius+45)*view.zoom,
    x=(view.width/2+view.panX+cell.x*view.zoom+r*Math.cos(t))*dpr,
    y=(view.height/2+view.panY+cell.y*view.zoom*view.projectY+
      r*view.projectY*Math.sin(t))*dpr;
   if(x<0||y<0||x>=Math.round(view.width*dpr)||
    y>=Math.round(view.height*dpr))continue;
   assert.ok(chosen.rects.some(b=>x>=b.x&&x<b.x+b.w&&
    y>=b.y&&y<b.y+b.h),
    'authorized Scenery/Ground clip edge left uncovered at '+x+','+y);
  }
 assert.ok(chosen.rects.every(r=>Number.isInteger(r.x)&&
  Number.isInteger(r.y)&&Number.isInteger(r.w)&&Number.isInteger(r.h)));
});
test('full-frame fallback when mask is dense or metadata malformed',()=>{
 const plan=makePlan();
 assert.equal(plan(view,[{x:0,y:0,radius:10000,visibility:'visible'}],1.25),null);
 let inspected=0;
 const many=Array.from({length:15000},()=>({x:0,y:0,radius:10000,
  get visibility(){inspected++;return 'visible';}}));
 assert.equal(plan(view,many,1.25),null);
 assert.ok(inspected<10,'fully covered world must short-circuit 15k authored hexes');
 assert.equal(plan(view,[{x:0,y:0,radius:NaN,visibility:'visible'}],1.25),null);
 assert.equal(plan(view,[{x:0,y:0,radius:-1,visibility:'visible'}],1.25),null);
 assert.equal(plan({...view,zoom:0},[],1.25),null);
 assert.equal(plan(view,[],0),null);
 const noAuth=plan(view,[{x:0,y:0,radius:140,visibility:'hidden'}],1.25);
 assert.ok(noAuth&&noAuth.pixels===0&&noAuth.rects.length===0,
  'without visible/explored hexes the raster painter also paints zero World pixels');
});
test('panning and fractional DPR retain entire authorized clip, never use hidden hexes',()=>{
 const plan=makePlan(),dpr=1.33;
 const cells=[
  {q:-1,r:1,x:-500,y:110,radius:150,visibility:'visible'},
  {q:2,r:0,x:530,y:-180,radius:140,visibility:'explored'},
  {q:4,r:1,x:1400,y:200,radius:200,visibility:'hidden'}];
 for(const panX of [-1200,-950,-450,0,350,1150]){
  const v={...view,panX,panY:175};
  const result=plan(v,cells,dpr);
  if(!result)continue; // dense full blit is always safe.
  for(const c of cells.slice(0,2)){
   const cx=v.width/2+v.panX+c.x*v.zoom,
    cy=v.height/2+v.panY+c.y*v.zoom*v.projectY;
   for(let a=0;a<6;a++){
    const theta=-Math.PI/2+a*Math.PI/3,
     rx=(c.radius+45)*v.zoom;
    const x=(cx+rx*Math.cos(theta))*dpr,
     y=(cy+rx*v.projectY*Math.sin(theta))*dpr;
    if(x<0||y<0||x>=v.width*dpr||y>=v.height*dpr)continue;
    assert.ok(result.rects.some(r=>x>=r.x&&x<r.x+r.w&&
     y>=r.y&&y<r.y+r.h),
     'panned authorized hex must remain entirely copied');
   }
  }
 }
});
async function fixture(sparseWorldBlit){
 const w={},mainOps=[],offOps=[];
 vm.runInNewContext(policy,{window:w});
 vm.runInNewContext(helper,{window:w,Float64Array});
 const ctx=kind=>({setTransform(){},save(){},restore(){},beginPath(){},moveTo(){},
  lineTo(){},closePath(){},clip(){},rect(){},translate(){},scale(){},
  clearRect(){},fillRect(){},
  drawImage(...args){(kind==='main'?mainOps:offOps).push(args);}
 });
 const canvas={width:0,height:0,getContext:()=>ctx('main'),
  getBoundingClientRect:()=>({width:1000,height:600})};
 const document={createElement:()=>({width:0,height:0,getContext:()=>ctx('off')})};
 const key='v1-0374527a|near|0,0';
 const record={key,sceneKey:'v1-0374527a',level:'near',
  tile:{id:'0,0',x:0,y:0,size:512},layers:[
   {layer:'ground',pad:3,png:{width:512,height:512,id:'ground'}},
   {layer:'scenery',pad:128,png:{width:768,height:768,id:'tree'}}]};
 const storage={keys:async()=>[key],get:async()=>record};
 let now=0;vm.runInNewContext(runtime,{window:w,document,console,
  performance:{now:()=>++now},requestAnimationFrame:()=>{}});
 const player=w.VedrasFrozenMap.create({canvas,storage,sparseWorldBlit,
  overview1x:false,decode:async png=>({...png,close(){}})});
 await player.load('v1-0374527a','near',{zoom:.8,panX:0,panY:0,dpr:1.25,projectY:.85},
  [{q:0,r:0,x:0,y:0,radius:145,visibility:'visible'},
   {q:9,r:9,x:4200,y:4200,radius:180,visibility:'hidden'}]);
 for(let i=0;i<5;i++){player.draw();await new Promise(resolve=>setImmediate(resolve));}
 assert.equal(player.report().decoded,1);
 assert.ok(player.report().overviewRasterBuilds>=1);
 return {player,mainOps,offOps};
}
test('actual World renderer uses fewer pixels in sparse authorized viewport, old default unchanged',async()=>{
 const legacy=await fixture(false),trial=await fixture(true);
 const old=legacy.player.report(),now=trial.player.report();
 assert.equal(old.sparseWorldBlit,false);
 assert.equal(now.sparseWorldBlit,true);
 assert.ok(now.sparseWorldBlitFrames>=2);
 assert.ok(now.worldBlitDevicePixels<now.worldBlitFullDevicePixels*.5,
  'opt-in sparse cached world should blit substantially fewer pixels');
 assert.equal(old.worldBlitDevicePixels,old.worldBlitFullDevicePixels);
 const originals=legacy.mainOps.filter(args=>args.length===9);
 assert.ok(originals.length>=2);
 assert.ok(trial.mainOps.length>=1&&
  trial.mainOps.some(args=>args[3]*args[4]<1000*600*1.25*1.25*.75),
  'conservative bands may use ONE smaller 9-argument draw, not necessarily multiple');
 assert.ok(trial.mainOps.every(args=>args.length===9));
 assert.equal(now.failures,0);
 trial.player.setPose({panX:45,panY:25});trial.player.draw();
 assert.equal(trial.player.report().overviewRasterBuilds,now.overviewRasterBuilds);
 assert.equal(trial.player.report().failures,0);
 legacy.player.stop();trial.player.stop();
});
test('browser switch is strict opt-in and final World source never changes',()=>{
 assert.match(game,/params\.get\('worldBands'\)==='1'/);
 assert.match(html,/frozen-map-world-blit\.js\?v=/);
 assert.ok(html.indexOf('frozen-map-world-blit.js')<
  html.indexOf('frozen-map-runtime.js'));
 assert.match(runtime,/target\.drawImage\(m\.canvas,sx\+r\.x,sy\+r\.y,r\.w,r\.h,/);
 assert.match(runtime,/target\.drawImage\(m\.canvas,sx,sy,view\.width\*dpr/);
 assert.doesNotMatch(runtime,/deleteDatabase\(|bakeWorldTile\(/);
 for(const s of [runtime,helper,game,policy])assert.doesNotThrow(()=>new Function(s));
});

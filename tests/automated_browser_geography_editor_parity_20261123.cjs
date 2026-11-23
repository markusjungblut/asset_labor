'use strict';
/* Phase 2.8o – compare ORIGINAL app.js drawSprite() and mountainCoversBase()
 * against an independent foot-only projection for ORIGINAL Nature PNGs.
 * App.js functions are extracted verbatim at test time: no hand-built
 * stand-in may masquerade as the editor reference. No editor launch state,
 * localStorage, production renderer or original PNG is modified.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const ROOT=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const editor=read('app.js');
function segment(start,end){
 const a=editor.indexOf(start);
 if(a<0)throw Error('EDITOR_SOURCE_MISSING: '+start);
 const b=editor.indexOf(end,a+start.length);
 if(b<=a)throw Error('EDITOR_SOURCE_BOUNDARY_MISSING: '+end);
 return editor.slice(a,b);
}
const source=[
 segment('function visibleBounds(img){','// Large neighboring objects rise'),
 segment('function protectsSouthwestLargeSprite(', '// A cast may overlap an elevated tree'),
 segment('function mountainShadowReachesFoot(', '// The owner\'s own cast'),
 segment('function spriteMountainCasts(', '// Reuse one scratch canvas'),
 segment('let spriteShadeCanvas=null;','function drawNatureShadow('),
 segment('function mountainCoversBase(', '// Build once per scene edit')
].join('\n');
assert(source.includes('function drawSprite(obj)'));
assert(source.includes('function mountainCoversBase(plant,mountain)'));
assert(source.includes("g.globalCompositeOperation='source-atop'"));
assert(source.includes('const height=width*b.sh/b.sw'));
const originals=['assets/nature/birke1.png','assets/nature/berg_01.png'];
const files=new Set([...originals,'polish.js','shadow-tone.js',
 'shadow-system.js','large-map-bake-editor-reference-sprite.js']);
(async()=>{
 const server=http.createServer((req,res)=>{
  const name=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\//,'');
  if(name==='audit'){
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
   res.end('<!doctype html><title>Live editor source sprite projection audit</title>');
   return;
  }
  if(!files.has(name)){res.writeHead(404);res.end('not found');return;}
  res.writeHead(200,{'Content-Type':name.endsWith('.png')?
   'image/png':'text/javascript','Cache-Control':'no-store'});
  fs.createReadStream(path.join(ROOT,name)).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser=null;
 try{
  const {firefox}=require('playwright');
  browser=await firefox.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1400,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(String(error)));
  const origin='http://127.0.0.1:'+server.address().port;
  await page.goto(origin+'/audit',{waitUntil:'load'});
  for(const script of ['polish.js','shadow-tone.js','shadow-system.js',
   'large-map-bake-editor-reference-sprite.js'])
   await page.addScriptTag({url:origin+'/'+script});
  const outcome=await page.evaluate(async({source,originals})=>{
   const im=[];
   for(const file of originals){
    const img=new Image();img.src='/'+file;await img.decode();im.push(img);
   }
   const [treeImg,mountainImg]=im;
   const scale=2.5,projectY=.85;
   const size={width:1920,height:1632};
   const newCanvas=()=>{const c=document.createElement('canvas');
    c.width=size.width;c.height=size.height;return c;};
   const factory=()=>document.createElement('canvas');
   const state={zoom:scale,dpr:2,visualPolish:{nature:.4},objects:[]};
   const toScreen=(x,y)=>({x:x*scale,y:y*scale*projectY});
   const makeEditor=new Function('ctx','state','toScreen',
    'mountainCastsForFrame','finalRendering','spriteAtlas',
    'mountainAlphaCache','natureBounds','clamp',
    '"use strict";\n'+source+'\nreturn {visibleBounds,drawSprite,'+
    'mountainCoversBase,mountainShadowReachesFoot,spriteMountainCasts};');
   const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
   const mkNative=(ctx,casts=[])=>makeEditor(ctx,state,toScreen,casts,true,
    null,new WeakMap(),new WeakMap(),clamp);
   const b=mkNative(newCanvas()).visibleBounds(treeImg);
   const mountainBounds=mkNative(newCanvas()).visibleBounds(mountainImg);
   const meta={kind:'tree',anchor:{x:.5,y:.96},family:'deciduous'};
   const g={y:600,width:220,b,
    height:220*b.sh/b.sw,ax:.5,ay:.96};
   g.left=390-g.width*g.ax;g.top=g.y-g.height*g.ay;
   const instance={q:1,r:0,assetPath:originals[0]};
   const object={item:{type:'tree',p:{x:390,y:600},meta,inst:instance},
    img:treeImg,g};
   const editorObj={type:'nature',x:390,y:600,w:220,
    asset:{img:treeImg,path:originals[0]},natureMeta:meta,cell:'1,0'};
   function diff(a,b){
    const ctxA=a.getContext('2d',{willReadFrequently:true});
    const ctxB=b.getContext('2d',{willReadFrequently:true});
    const A=ctxA.getImageData(0,0,a.width,a.height).data;
    const B=ctxB.getImageData(0,0,b.width,b.height).data;
    let mismatched=0,painted=0,maxDelta=0;
    for(let i=0;i<A.length;i+=4){
     if(A[i+3]>0||B[i+3]>0)painted++;
     if(A[i]!==B[i]||A[i+1]!==B[i+1]||
      A[i+2]!==B[i+2]||A[i+3]!==B[i+3]){
      mismatched++;
      maxDelta=Math.max(maxDelta,
       Math.abs(A[i]-B[i]),Math.abs(A[i+1]-B[i+1]),
       Math.abs(A[i+2]-B[i+2]),Math.abs(A[i+3]-B[i+3]));
     }
    }
    return {mismatched,painted,maxDelta};
   }
   const nativeCanvas=newCanvas(),auditorCanvas=newCanvas();
   mkNative(nativeCanvas.getContext('2d')).drawSprite(editorObj);
   const ordinary=window.VedrasEditorReferenceSprite.paint({
    object,ctx:auditorCanvas.getContext('2d'),canvasFactory:factory,
    scale,projectY,naturePolish:.4,dpr:2
   });
   const bare=diff(nativeCanvas,auditorCanvas);
   // Reproduce previous preview's vertical-body 0.85 scaling ONLY as a
   // negative A/B control. Its dimensions should differ visibly.
   const legacyCanvas=newCanvas(),lc=legacyCanvas.getContext('2d');
   lc.save();lc.setTransform(scale,0,0,scale*projectY,0,0);
   lc.translate(object.item.p.x,object.g.y);
   lc.transform(1,0,.012,.965,0,0);
   lc.translate(-object.item.p.x,-object.g.y);
   lc.filter=window.VedrasPolish.natureFilter(meta,.4);
   lc.drawImage(treeImg,b.sx,b.sy,b.sw,b.sh,
    g.left,g.top,g.width,g.height);
   lc.restore();
   const legacy=diff(nativeCanvas,legacyCanvas);
   // Real native editor mountain raster: no synthetic painted ellipse.
   const sh=window.VedrasShadows,settings=sh.settings(),strength=1.1,
    footprint=toScreen(editorObj.x,editorObj.y);
   const mask=document.createElement('canvas');
   mask.width=mask.height=900;
   const localFoot={x:350,y:350};
   const stats=sh.paintMountain(mask.getContext('2d',{willReadFrequently:true}),
    localFoot,240,settings,strength);
   const cast={owner:{type:'mountain',cell:'2,0'},
    canvas:mask,x:footprint.x-localFoot.x,
    y:footprint.y-localFoot.y,width:mask.width,height:mask.height,
    shape:sh.mountainShape(footprint,240,settings),
    modelWidth:240,strength,peakAlpha:stats.maxAlpha};
   const shadeNative=newCanvas(),shadeAudit=newCanvas();
   const actual=mkNative(shadeNative.getContext('2d'),[cast]);
   const matched=actual.spriteMountainCasts(editorObj,
    footprint.x-g.width*scale*g.ax,
    footprint.y-g.height*scale*g.ay,g.width*scale,g.height*scale);
   if(matched.length!==1)
    throw Error('REAL_EDITOR_FOOTPOINT_REJECTED_CAST '+JSON.stringify({
     alpha:sh.mountainAlphaAt(footprint.x,footprint.y,cast.shape,240,strength),
     peak:stats.maxAlpha}));
   actual.drawSprite(editorObj);
   const shaded=window.VedrasEditorReferenceSprite.paint({
    object,ctx:shadeAudit.getContext('2d'),canvasFactory:factory,
    casts:[cast],scale,projectY,naturePolish:.4,dpr:2
   });
   const shadedDiff=diff(shadeNative,shadeAudit);
   const shadowChanged=diff(nativeCanvas,shadeNative);
   // EXACT source mountainCoversBase() vs read-only authored auditing
   // function on the same mountain PNG and many neighboring tree roots.
   const mountainMeta={kind:'mountain',anchor:{x:.5,y:.67}};
   const mg={y:620,width:320,b:mountainBounds,
    height:320*mountainBounds.sh/mountainBounds.sw,
    ax:.5,ay:.67};
   const mountain={item:{type:'mountain',p:{x:400,y:620},
    meta:mountainMeta,inst:{q:2,r:0,assetPath:originals[1]}},
    img:mountainImg,g:mg};
   const editorMountain={type:'mountain',x:400,y:620,w:320,
    asset:{img:mountainImg},natureMeta:mountainMeta};
   const nativeOcclusion=mkNative(newCanvas().getContext('2d'));
   let agreements=0,occluded=0,visible=0;
   for(let dx=-200;dx<=200;dx+=20)
    for(let dy=-260;dy<=160;dy+=20){
     const x=400+dx,y=620+dy;
     const plant={type:'nature',x,y};
     const src=nativeOcclusion.mountainCoversBase(plant,editorMountain);
     const check=window.VedrasEditorReferenceSprite.occludes({
      plant:{item:{type:'tree',p:{x,y}},g:{y}},
      mountain,canvasFactory:factory,scale,projectY
     });
     if(src!==check)throw Error('EDITOR_OCCLUSION_DIFFERENCE at '+dx+','+dy);
     agreements++;
     if(src)occluded++;else visible++;
    }
   return {bare,legacy,shadedDiff,shadowChanged,
    foot:footprint,projection:ordinary.projection,
    verticalBodyDifference:ordinary.legacyBodyDifference,
    matchedNativeCast:matched.length,nativeCastPositive:stats.positiveCount,
    occlusion:{agreements,occluded,visible},
    realEditorSource:true,readyForViewer:shaded.readyForViewer,
    complete:shaded.complete};
  },{source,originals});
  console.log('EDITOR_SPRITE_PARITY_DIAGNOSTIC',JSON.stringify(outcome));
  assert.deepEqual(errors,[]);
  assert.equal(outcome.realEditorSource,true);
  assert.equal(outcome.projection,'editor-foot-only-projectY');
  assert(outcome.verticalBodyDifference>20,'must expose projected PNG-body error');
  assert(outcome.bare.painted>1000);
  assert.equal(outcome.bare.mismatched,0,
   'unshaded ORIGINAL PNG differs from the exact editor drawSprite');
  assert(outcome.legacy.mismatched>100,
   'legacy 0.85 sprite-body scaling must not pass editor parity');
  assert.equal(outcome.matchedNativeCast,1);
  assert(outcome.nativeCastPositive>100);
  assert.equal(outcome.shadedDiff.mismatched,0,
   'source-atop ORIGINAL PNG differs from the exact editor drawSprite');
  assert(outcome.shadowChanged.mismatched>100);
  assert(outcome.occlusion.agreements>100);
  assert(outcome.occlusion.occluded>0);
  assert(outcome.occlusion.visible>0);
  assert.equal(outcome.readyForViewer,false);
  assert.equal(outcome.complete,false);
  console.log('PASS original editor app.js drawSprite + mountainCoversBase real-PNG reference parity');
 }finally{
  try{await browser?.close();}finally{
   server.closeAllConnections();
   await new Promise(resolve=>server.close(resolve));
  }
 }
})().catch(error=>{console.error(error);process.exitCode=1;});

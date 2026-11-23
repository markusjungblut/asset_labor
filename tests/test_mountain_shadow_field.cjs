/* Directional mountain field v0.11.2: prove visible mass, side clipping,
 * calibrated PNG left foot and 50/30 percent additional vegetation shrink. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),w={};
for(const file of ['shadow-system.js','nature-balance.js','forest.js'])
 vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),{window:w},{filename:file});
const S=w.VedrasShadows,B=w.VedrasNatureBalance,F=w.VedrasForest;
const a={x:.5,y:.67},data=new Uint8ClampedArray(64*64*4);
for(let y=34;y<=54;y++)for(let x=12;x<=50;x++)data[(y*64+x)*4+3]=255;
const foot=S.alphaFoot(data,64,64,a);
assert(foot.x<-.2&&foot.x>-.45,'alpha left-foot contour must move root LEFT of image center');
assert(Math.abs(foot.y)<.15,'foot in authored contact band');
const cfg=S.settings({opacity:.46,length:.7,angle:150,rootWidth:.29,
 midWidth:.22,tipWidth:.11,softness:12,originX:-.08,originY:.02,
 contactWidth:.17,contactLength:.32});
const p={x:350,y:165},width=240,height=275;
const origin=S.mountainOrigin(p,width,height,a,cfg,foot);
assert(origin.x<p.x-width*.25,'actual cast starts at left foot, not under PNG center');
const shape=S.mountainShape(origin,width,cfg);
assert(shape.dir.x<0&&shape.dir.y>0,'casts left and down');
assert(shape.p2.x<origin.x&&shape.p2.y>origin.y,'cast end projects outward');
const main=S.mountainAlphaAt(shape.p1.x,shape.p1.y,shape,width,.7);
assert(main>.08&&main<.49,'shadow has a soft but substantial BODY rather than a stripe');
const cross=shape.normal,r=shape.radius[1]*.7;
assert(S.mountainAlphaAt(shape.p1.x+cross.x*r,shape.p1.y+cross.y*r,shape,width,.7)>.02,
 'body remains broad on both sides of its diagonal axis');
const widened=S.mountainShape(origin,width,{...cfg,rootWidth:.6,midWidth:.42});
assert(S.mountainAlphaAt(origin.x+width*.09,origin.y,widened,width,.7)===0,
 'widening cannot extend farther RIGHT of the left-foot root');
assert(S.mountainAlphaAt(shape.p1.x,shape.p1.y,shape,width,0)===0,'global zero turns off casts');
const moved=S.mountainOrigin(p,width,height,a,{...cfg,originX:cfg.originX-.12},foot);
assert(Math.abs(moved.x-origin.x+width*.12)<1e-6,'editor X is an additive offset after foot detection');
const painted=[];
const ctx={canvas:{width:750,height:500},
 createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),
 putImageData:(img,x,y)=>painted.push({img,x,y})};
const result=S.paintMountain(ctx,origin,width,cfg,.7);
assert(result&&result.maxAlpha>25&&result.maxAlpha<125&&result.positiveCount>200,
 'render actual broad bounded alpha mask');
assert(painted.length===1&&painted[0].img.data.some((v,i)=>i%4===3&&v>0),
 'mask written to canvas with real visible pixels');
assert.equal(S.paintMountain(ctx,origin,width,{...cfg,opacity:0},.7),null);
assert(Math.abs(S.settings({reach:1.4}).length-1.12)<1e-9,'legacy length migration');
assert(Math.abs(S.settings({spread:2}).rootWidth-.26*2/1.28)<1e-8,'legacy spread migration');
assert.equal(S.settings({opacity:3}).opacity,.75,'opacity bounded');
assert.equal(B.placementScale({kind:'tree'}),.6);
assert.equal(B.placementScale({kind:'shrub'}),.84);
assert.equal(B.placementScale({kind:'mountain'}),1);
const unchangedWood=[
 {kind:'tree',family:'dead_trees',scale:.5},
 {kind:'tree',family:'snow_dead_trees',scale:.5},
 {kind:'cluster',family:'fallen_logs',scale:.7},
 {kind:'cluster',family:'snow_fallen_logs',scale:.7},
 {kind:'special',family:'deadwood',scale:.7}
];
for(const entry of unchangedWood)
 assert.equal(B.placementScale(entry),entry.scale,'deadwood must retain previous display size: '+entry.family);
assert(Math.abs(B.sizeFactor({kind:'tree',family:'dead_trees',sizeClass:'medium'})-.58*.5)<1e-10);
assert(Math.abs(B.sizeFactor({kind:'tree',family:'snow_dead_trees'})-.58*.5)<1e-10);
assert(Math.abs(B.sizeFactor({kind:'special',family:'deadwood'})-.72*.7)<1e-10);
assert.equal(B.placementScale({kind:'ground_cover'}),.84);
assert.equal(B.placementScale({kind:'rock'}),.84);
// Living trees gained a deliberate 10% class size adjustment after the
// v0.11.2 baseline. This is a placement contract, not shadow darkness.
assert(Math.abs(B.sizeFactor({kind:'tree',sizeClass:'medium'})-.72*.6*1.10)<1e-10);
assert(Math.abs(B.sizeFactor({kind:'shrub',sizeClass:'medium'})-.73*.84)<1e-10);
assert(Math.abs(B.sizeFactor({kind:'cluster',family:'fallen_logs'})-.71*.7)<1e-10);
// Earlier 5/8/4/7 expectations were written before configurable forest
// modes. Check both current classic quotas and the modern dense/canopy modes.
assert.equal(F.treeTarget({suitability:1,forestClass:'dense_forest',
 forestMode:'classic',density:0}),5);
assert.equal(F.maxObjects({suitability:1,forestClass:'dense_forest',
 forestMode:'classic'}),11);
assert.equal(F.treeTarget({suitability:1,forestClass:'light_forest',
 forestMode:'classic',density:.5}),4);
assert.equal(F.maxObjects({suitability:1,forestClass:'light_forest',
 forestMode:'classic'}),7);
assert.equal(F.treeTarget({suitability:1,forestClass:'dense_forest',
 forestMode:'dense'}),10);
assert.equal(F.maxObjects({suitability:1,forestClass:'dense_forest',
 forestMode:'dense'}),27);
assert.equal(F.maxObjects({suitability:1,forestClass:'dense_forest',
 forestMode:'canopy'}),36);
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const editor=fs.readFileSync(path.join(root,'nature-ui.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const field of ['mountainAngle','mountainLength','mountainRootWidth','mountainMidWidth',
 'mountainTipWidth','mountainContactWidth','mountainContactLength'])
 assert(html.includes('id="'+field+'"'),'editor control '+field);
assert(app.includes('Sh.paintMountain(g,{x:-left,y:-top},w,cfg,global)')&&app.includes('shadows.alphaFoot('));
assert(app.includes('mountainOriginForObject(o,sh)'),'dragging uses actual alpha origin');
assert(editor.includes('placementScale(meta)')&&editor.includes('encodeInstanceShadow(sh)'),
 'new sprite spacing and saved shape are integrated');
// The live 2.5D renderer must not darken a foreground canopy merely because
// its rectangular projection intersects a ground cast behind its trunk.
const start=app.indexOf('function protectsSouthwestLargeSprite(');
const end=app.indexOf('// Reuse one scratch canvas',start);
assert(start>=0&&end>start,'test actual mountain/sprite occlusion code');
const shadowGate=vm.runInNewContext(
 '(casts)=>{const mountainCastsForFrame=casts;'+app.slice(start,end)+
 ';return {spriteMountainCasts,mountainShadowReachesFoot};}',
 {window:{VedrasShadows:S},toScreen:(x,y)=>({x,y})});
const caster={type:'mountain',cell:'5,5'};
const mountainCast={owner:caster,canvas:{},shape,modelWidth:width,
 strength:.7,peakAlpha:Math.round(main*255),
 x:shape.p2.x-160,y:origin.y-160,width:550,height:450};
const gate=shadowGate([mountainCast]);
const area=[mountainCast.x,mountainCast.y,mountainCast.width,mountainCast.height];
const inCast={type:'nature',cell:'1,1',x:shape.p1.x,y:shape.p1.y};
const sunlit={type:'nature',cell:'2,2',x:origin.x+width*.19,y:shape.p1.y};
const list=(o)=>gate.spriteMountainCasts(o,...area);
assert(S.mountainAlphaAt(sunlit.x,sunlit.y,shape,width,.7)===0,
 'sample sunlit foot genuinely outside the cast');
assert.equal(list(inCast).length,1,'tree rooted inside mountain shadow is shaded');
assert.equal(list(sunlit).length,0,'sunlit foreground tree must never have a shadowed crown');
assert.equal(list(caster).length,0,'mountain cannot receive its own cast');
assert.equal(list({...inCast,type:'building',cell:'4,6'}).length,0,
 'SW building height exception is preserved');
assert(app.includes('shape:window.VedrasShadows.mountainShape(origin,width,cfg)'),
 'ground and sprite shading must share the same mountain model');
assert(!app.slice(start,end).includes('getImageData('),
 'per-object shadow test must never read back Canvas2D pixels');
console.log('PASS: directional mountain field, alpha foot, scale bump with deadwood exclusions and original density quotas.');

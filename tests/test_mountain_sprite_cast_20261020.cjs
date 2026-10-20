/* Regression: projected mountain shadows must shade every intersecting
 * visible sprite (trees, bushes, buildings, units, OTHER mountain sprites).
 * No shadow-colored box may cover transparent PNG margins or foreign sprites.
 * Run: node tests/test_mountain_sprite_cast_20261020.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ui=fs.readFileSync(path.join(root,'ui-organizer.js'),'utf8');
for(const token of [
 'mountainCastsForFrame.push(cast)',
 "g.globalCompositeOperation='source-atop'",
 'function spriteMountainCasts(obj,left,top,width,height)',
 'g.drawImage(cast.canvas,cast.x-left,cast.y-top,cast.width,cast.height)',
 'ctx.drawImage(spriteShadeCanvas,0,0,sw,sh,left,top,width,height)'])
 assert(app.includes(token),'Sprite mountain shade missing: '+token);
assert(app.indexOf('drawMountainShadows(objs);')<app.indexOf('drawSprite(o);'),
 'ground shadows generated before actual sprite pass');
const begin=app.indexOf('function protectsSouthwestLargeSprite(receiver,caster){');
const end=app.indexOf('function drawNatureShadow(sh,obj,p){',begin);
assert(begin>=0&&end>begin,'sprite shader extractable');
const drawCalls=[],shadeCalls=[];
function context(target){return {
 setTransform(){},clearRect(){},save(){},restore(){},translate(){},transform(){},
 drawImage(...args){target.push({args,mode:this.globalCompositeOperation,filter:this.filter});}
};}
const ctx=context(drawCalls),scratch=context(shadeCalls);
const fakeCanvas={width:0,height:0,getContext(){return scratch;}};
const doc={createElement(type){assert.equal(type,'canvas');return fakeCanvas;}};
const sandbox={
 document:doc,ctx,
 window:{VedrasPolish:{natureFilter:()=> 'none'}},
 state:{zoom:1,dpr:1,visualPolish:{nature:{}}},
 visibleBounds:img=>({sx:0,sy:0,sw:img.naturalWidth,sh:img.naturalHeight}),
 toScreen:(x,y)=>({x,y}),clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),
 Math
};
const shader=vm.runInNewContext(
 'let mountainCastsForFrame=[];'+app.slice(begin,end)+
 '\n({setCasts(x){mountainCastsForFrame=x;},drawSprite,spriteMountainCasts})',
 sandbox
);
const sprite={x:50,y:50,w:40,asset:{img:{naturalWidth:40,naturalHeight:40}},
 type:'nature'};
const mountain={id:1};
const shadow={owner:mountain,canvas:{},x:20,y:20,width:40,height:40};
shader.setCasts([shadow]);
shader.drawSprite(sprite);
assert(shadeCalls.some(x=>x.mode==='source-atop'),'cast over sprite alpha');
assert.equal(drawCalls.length,1,'final shaded sprite rendered as one depth-sorted sprite');
assert.equal(shadeCalls.length,2,'base sprite + shadow in scratch');
assert.equal(shadeCalls[1].args[0],shadow.canvas,'same cached mountain mask');
drawCalls.length=0;shadeCalls.length=0;
shader.setCasts([{...shadow,x:1000,y:1000}]);
shader.drawSprite(sprite);
assert.equal(shadeCalls.length,0,'far-away shadow must not allocate per-sprite composition');
assert.equal(drawCalls.length,1,'unshaded sprite fast path preserved');
assert.equal(shader.spriteMountainCasts(mountain,20,20,40,40).length,0,
 'mountain does not receive its own cast');
// A tall mountain or building in the immediately SOUTHWEST neighboring
// axial hex (q-1,r+1) should remain lit. The terrain and small plants
// should still receive their normal shadow.
const highMountain={type:'mountain',cell:'0,0'};
const toSouthwest=type=>({...sprite,type,cell:'-1,1'});
const highShadow={...shadow,owner:highMountain};
shader.setCasts([highShadow]);
assert.equal(shader.spriteMountainCasts(toSouthwest('mountain'),20,20,40,40).length,0,
 'immediately southwest mountain remains unshaded by its neighbor');
assert.equal(shader.spriteMountainCasts(toSouthwest('building'),20,20,40,40).length,0,
 'immediately southwest building remains unshaded by its neighbor');
assert.equal(shader.spriteMountainCasts(toSouthwest('nature'),20,20,40,40).length,1,
 'small vegetation stays shaded on southwest hex');
assert.equal(shader.spriteMountainCasts(toSouthwest('unit'),20,20,40,40).length,1,
 'units keep ordinary ground-level shade');
for(const cell of ['-2,2','-1,0','0,1','1,0']){
 assert.equal(shader.spriteMountainCasts({...sprite,type:'mountain',cell},20,20,40,40).length,1,
  'non-southwest-neighbor mountain remains shadeable: '+cell);
 assert.equal(shader.spriteMountainCasts({...sprite,type:'building',cell},20,20,40,40).length,1,
  'non-southwest-neighbor building remains shadeable: '+cell);
}
shader.setCasts([highShadow,{...shadow,owner:{type:'mountain',cell:'3,-1'}}]);
assert.equal(shader.spriteMountainCasts(toSouthwest('mountain'),20,20,40,40).length,1,
 'exclusion is per caster, not an all-mountain shadow exemption');
assert.equal(shader.spriteMountainCasts(toSouthwest('building'),20,20,40,40).length,1,
 'different distant caster still shades the southwest building');
drawCalls.length=0;shadeCalls.length=0;
shader.setCasts([highShadow]);
shader.drawSprite(toSouthwest('building'));
assert.equal(shadeCalls.length,0,'protected building takes the unshaded fast path');
assert.equal(drawCalls.length,1,'protected building still renders');
drawCalls.length=0;shadeCalls.length=0;
shader.drawSprite(toSouthwest('mountain'));
assert.equal(shadeCalls.length,0,'protected neighboring peak takes the unshaded path');
assert.equal(drawCalls.length,1,'protected mountain is still rendered');
assert(html.includes('id="geographyImport"')&&html.includes('id="geographyImportFile"'),
 'file import is reachable from the map');
assert(ui.includes('shortcutGeographyImport'),
 'geography importer is also reachable in inspector');
assert(app.includes('G.generateWorld(raw.seed')&&app.includes('importGeographyWorld(generated)'),
 'import must regenerate from saved preset / world JSON');
console.log('PASS mountain casts shade sprite alpha, fast path, exclusions and direct geography JSON entry.');

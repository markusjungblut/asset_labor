/* Mountain shadow single-authority regression.
 * Run: node tests/test_mountain_shadow_priority_20261021.cjs
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const app=read('app.js'),editor=read('sprite-shadow-editor.js'),
 html=read('index.html');
const begin=app.indexOf('function mountainShadowSettings(o){'),
 end=app.indexOf('function sceneShadowStrength(){',begin);
assert(begin>=0&&end>begin,'native mountain settings function found');
const configSource=app.slice(begin,end);
const shadowWin={};
new Function('window',read('shadow-system.js'))(shadowWin);
const state={
 mountainShadowDefaults:{angle:138,opacity:.29,length:.72,softness:21,
  originX:-.13,originY:.04,rootWidth:.31},
 shadowAssetPresets:{'assets/nature/berg_14.png':{
  angle:170,opacity:.56,length:1.11,softness:14}},
 shadowGlobal:1.17
};
let genericProfileCalls=0;
shadowWin.VedrasSpriteShadows={profile:()=>{genericProfileCalls++;return{
 angle:105,opacity:0,length:2.6,softness:0,originX:.8,enabled:false};}};
const mountainSettings=new Function('state','window',configSource+
 '\nreturn mountainShadowSettings;')(state,shadowWin);
const asset={path:'assets/nature/berg_14.png'};
const a=mountainSettings({asset});
assert.equal(a.angle,170,'mountain asset wins over mountain default');
assert.equal(a.opacity,.56,'mountain opacity authored in Berg section');
assert.equal(a.length,1.11,'asset-specific mountain length');
assert.equal(a.softness,14);
assert.equal(a.originX,-.13,'unmodified settings inherit mountain default');
const instance={shadowAngle:190,shadowOpacity:.64,
 shadowLength:1.25,shadowOriginX:-.23};
const b=mountainSettings({asset,mountainInstance:instance});
assert.equal(b.angle,190,'placed mountain settings have highest priority');
assert.equal(b.opacity,.64);
assert.equal(b.length,1.25);
assert.equal(b.originX,-.23);
const global=shadowWin.VedrasShadows.globalStrength(state.shadowGlobal);
assert.equal(global,1.17,'common 0-200% scene slider remains shared');
assert.equal(genericProfileCalls,0,
 'generic shadow profiles must never be queried for mountains');
assert(!configSource.includes('VedrasSpriteShadows'),
 'native mountain settings must not read generic shadow engine');
assert(app.includes('const cfg=mountainShadowSettings(o);'),
 'map mountain renderer continues using native settings');
assert(app.includes('shadowLocalMask(width,cfg,strength)'),
 'one mountain cast remains controlled by the global master strength');
assert(app.includes("if(p.x<-450||p.x>W+450||p.y<-450||p.y>H+450||o.type==='mountain')continue;"),
 'generic nature/building cast pass must skip native mountain objects');
const w={addEventListener(){}};
new Function('window',editor)(w);
const engine=w.VedrasSpriteShadows;
let calls=0;
const ctx=new Proxy({},{get:(_,k)=>()=>{calls++}});
const silhouette={canvas:{},aspect:1};
for(const o of [{type:'mountain',asset},
 {type:'nature',natureMeta:{kind:'mountain'},asset}]){
 engine.draw(ctx,o,{x:10,y:10},110,silhouette);
 assert.equal(calls,0,'generic cast forbidden on all mountain objects');
}
assert(editor.includes('mountainSettingsForAsset?.(a)'),
 'preview shows actual mountain section config, not obsolete generic values');
assert(editor.includes("$('ssSpriteDetails').hidden=mountain"),
 'generic individual controls hidden when mountain selected');
assert(editor.includes("!a||isMountainAsset(a)"),
 'editing controls cannot write generic override for mountains');
assert(html.includes('id="ssOpenMountain"')&&html.includes('id="ssMountainNotice"'),
 'editor links to authoritative mountain controls');
assert(html.includes('Maßgebliche Bergschatten-Einstellungen'),
 'mountain section explicitly marked as authoritative');
console.log('PASS mountain shadows: one native renderer, defaults < per-sprite < instance, global strength intact, generic cast forbidden.');

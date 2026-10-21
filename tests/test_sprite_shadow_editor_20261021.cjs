/* Shared Sprite Shadow Editor acceptance contract.
 * Run: node tests/test_sprite_shadow_editor_20261021.cjs
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const win={addEventListener:(name,callback)=>{if(name==='DOMContentLoaded')win.initializer=callback;}};
new Function('window',read('sprite-shadow-editor.js'))(win);
const E=win.VedrasSpriteShadows;
const initial=JSON.parse(read('assets/shadows/sprite_shadow_profiles.json'));
assert.deepEqual(E.set(initial),initial);
assert.equal(E.profile('assets/nature/Oak.png').angle,160);
assert(E.profile('assets/nature/Oak.png').angle>90&&E.profile('assets/nature/Oak.png').angle<270);
const modified=E.get();
modified.profiles['assets/nature/Baumstumpf_16.png']={
 length:1.9,offsetX:-.31,opacity:.56,enabled:true};
E.set(modified);
assert.equal(E.profile('assets/nature/Baumstumpf_16.png').length,1.9);
assert.equal(E.profile('assets/nature/Dummy.png').length,initial.global.length);
assert.throws(()=>E.valid({...initial,profiles:{'../secret':{angle:160}}}));
assert.throws(()=>E.valid({...initial,profiles:{'assets/nature/Oak.png':{opacity:3}}}));
assert.throws(()=>E.valid({...initial,profiles:{'assets/nature/Oak.png':{enabled:'yes'}}}));
const state={fillStyle:null,globalAlpha:1},steps=[];
const g={
 save(){steps.push(['save'])},restore(){steps.push(['restore'])},
 beginPath(){steps.push(['begin'])},fill(){steps.push(['fill'])},
 ellipse(...a){steps.push(['ellipse',...a])},
 translate(...a){steps.push(['translate',...a])},
 transform(...a){steps.push(['transform',...a])},
 rect(...a){steps.push(['rect',...a])},clip(){steps.push(['clip'])},
 drawImage(...a){steps.push(['image',...a])}
};
E.set(initial);
const source={canvas:{id:'colored-alpha-mask'},aspect:2};
for(const [kind,family] of [['tree','deciduous_trees'],['cluster','fallen_logs'],
 ['rock','stones'],['shrub','snow_bushes'],['unit',null]]){
 steps.length=0;
 E.draw(g,{asset:{path:'assets/nature/Test.png'},natureMeta:{kind,family}},
  {x:100,y:100},80,source,{x:.5,y:.96},.68);
 const matrix=steps.find(x=>x[0]==='transform');
 assert(matrix&&matrix[3]>0&&matrix[4]<0,'shadows project left: '+family);
 assert(steps.some(x=>x[0]==='image'),'real alpha silhouette cast: '+family);
 assert(steps.some(x=>x[0]==='ellipse'),'contact with terrain: '+family);
}
E.set({...initial,profiles:{'assets/nature/Test.png':{enabled:false}}});
steps.length=0;
E.draw(g,{asset:{path:'assets/nature/Test.png'}},{x:0,y:0},100,source,{x:.5,y:.96},1);
assert.equal(steps.length,0,'disabled sprites must receive zero ground shadow');
const html=read('index.html'),app=read('app.js'),server=read('server.py');
const first=html.indexOf('sprite-shadow-editor.js?v=');
assert(first>0&&first<html.indexOf('app.js?v='),'shadow engine before main app');
for(const id of ['spriteShadowLab','ssPreview','ssPrevious','ssNext','ssSearch','ssCategory',
 'ssResetOne','ssResetAll','ssSave','ssExport','ssImport','ssEnabled',
 'ssGlobal_angle','ssGlobal_strength','ssSprite_offsetX','ssSprite_offsetY']){
 assert(html.includes('id="'+id+'"'),'missing functional shadow editor control: '+id);
}
assert(app.includes('window.VedrasSpriteShadows.draw(ctx,o'),
 'shared shader must serve buildings and units');
assert(app.includes('shared.draw(ctx,obj,p'),
 'shared shader must serve Nature and fallen logs');
const start=app.indexOf('function mountainShadowSettings(o){');
const end=app.indexOf('function sceneShadowStrength(){',start);
const mountainConfig=app.slice(start,end);
assert(start>=0&&end>start&&!mountainConfig.includes('VedrasSpriteShadows'),
 'mountain form and angle come from the dedicated Berg controls, not generic sprite profiles');
assert(app.includes('shadowLocalMask(width,cfg,strength)'),
 'mountain casts still obey one shared 0–200% master intensity');
assert(server.includes('def validate_sprite_shadows(')&&
 server.includes("'/api/sprite-shadows'"),
 'secure persistent JSON endpoint missing');
assert(win.initializer,'shadow editor must initialize after full app is available');
console.log('PASS: unified left-casting silhouettes, strength, categories, overrides, previews, editing controls, secure profile persistence.');

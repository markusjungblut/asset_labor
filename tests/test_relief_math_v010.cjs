const assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm');
const sandbox={window:{},Math,Float32Array,console};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(__dirname+'/../relief.js','utf8'),sandbox);
const R=sandbox.window.VedrasRelief;
const c={...R.defaults(),enabled:true,strength:65,seed:915,profile:'chain',center:'0,0'};
const pos=(q,r)=>({x:256*(q+r/2),y:1.5*(256/Math.sqrt(3))*r});
for(const profile of ['rounded','steep','chain','plateau','ridge']){
 c.profile=profile;
 for(let q=-2;q<=2;q++)for(let r=-2;r<=2;r++){
  const {x,y}=pos(q,r);
  const a=R.at(x+128-.01,y,c),b=R.at(x+128+.01,y,c);
  assert(Math.abs(a-b)<0.1,`${profile}: discontinuity at inter-hex midpoint (${q},${r}) ${a} vs ${b}`);
  assert.equal(R.at(x,y,c),R.at(x,y,{...c}),`${profile}: not deterministic`);
  assert(R.at(x,y,c)>=0,`${profile}: negative height`);
 }
}
assert.equal(R.at(0,0,{...c,enabled:false}),0);
assert.notEqual(R.at(0,0,{...c,profile:'ridge'}),R.at(0,0,{...c,profile:'steep'}));
console.log('PASS: 5 continuous world-space profiles, deterministic seed, zero when disabled');
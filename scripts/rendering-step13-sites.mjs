/**
 * Derive repeatable camera anchors from the actually exported 397-hex scene,
 * not hard-coded approximate maps. Every site contains a grounded axial hex.
 */
const neighbors=[[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]];
const water=type=>typeof type==='string'&&/(?:ocean|water|sea)/i.test(type);
const coords=key=>key.split(',').map(Number);
function hexDistance(a,b){
  return Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r));
}
export function cameraSites(scene){
  const terrain=scene?.terrainTypeByHex||{},forest=scene?.forestByHex||{};
  const entries=Object.entries(terrain).map(([key,type])=>{
    const [q,r]=coords(key);
    const wet=neighbors.filter(([dq,dr])=>water(terrain[`${q+dq},${r+dr}`])).length;
    const f=forest[key]||{};
    return {q,r,key,type,wet,forestClass:f.forestClass||'none',
      density:Number(f.density)||0};
  });
  const used=[],result=[];
  function choose(label,candidates,score){
    const sorted=candidates.sort((a,b)=>score(b)-score(a)||
      a.q-b.q||a.r-b.r);
    const best=sorted.find(c=>used.every(other=>hexDistance(c,other)>=3))||sorted[0];
    if(!best)throw Error('Missing required reference biome: '+label);
    used.push(best);
    result.push({label,q:best.q,r:best.r,terrain:best.type,
      forestClass:best.forestClass,waterNeighbors:best.wet});
  }
  choose('center',entries.filter(c=>c.q===0&&c.r===0),()=>0);
  choose('dense-forest',entries.filter(c=>c.forestClass==='dense_forest'&&!water(c.type)),
    c=>c.density*10-hexDistance(c,{q:0,r:0})*.24);
  choose('coast',entries.filter(c=>!water(c.type)&&c.wet>0),
    c=>c.wet*10-hexDistance(c,{q:0,r:0})*.15);
  const peaks=(scene.mountainInstances||[]).map(m=>
    entries.find(c=>c.q===m.q&&c.r===m.r)).filter(Boolean);
  choose('mountains',peaks,c=>-hexDistance(c,{q:0,r:0}));
  choose('moor',entries.filter(c=>c.type==='moor'),c=>c.density*4-hexDistance(c,{q:0,r:0})*.15);
  choose('open-water',entries.filter(c=>water(c.type)&&c.wet>=3),
    c=>c.wet*2-hexDistance(c,{q:0,r:0})*.22);
  return result;
}

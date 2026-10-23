/* Vedras Reiche v0.15.4: camera-independent scene object layout + grid.
 * Spatial buckets are rebuilt only after a scene edit. The grid indexes an
 * object's full conservative viewport footprint, not just its anchor.
 * Culling after lookup remains authoritative; arrays preserve original order.
 */
'use strict';
window.VedrasObjectLayoutCache=(()=>{
 function create({cellSize=512,maxObjectBuckets=256}={}){
  let revision=0,builtRevision=-1,objects=[],builds=0,hits=0,lastBuildMs=0;
  let grid=new Map(),overflow=[],indexed=0;
  const size=Math.max(64,Math.floor(cellSize)||512);
  const coord=v=>Math.floor(v/size);
  const key=(x,y)=>x+','+y;
  function invalidate(){revision++;}
  function query(view,build,isVisible,marginFor=()=>0){
   let rebuilt=false,buildMs=0;
   if(builtRevision!==revision){
    const start=typeof performance!=='undefined'?performance.now():Date.now();
    const next=build();
    if(!Array.isArray(next))throw Error('Object layout build must return an array');
    const fresh=new Map(),large=[];
    let count=0;
    for(let i=0;i<next.length;i++){
     const o=next[i],r=Math.max(0,Number(marginFor(o))||0);
     const y=Number.isFinite(o.groundY)?o.groundY:o.y;
     if(!Number.isFinite(o.x)||!Number.isFinite(y)){large.push(i);continue;}
     const x0=coord(o.x-r),x1=coord(o.x+r),y0=coord(y-r),y1=coord(y+r);
     const n=(x1-x0+1)*(y1-y0+1);
     if(!Number.isFinite(n)||n>maxObjectBuckets){large.push(i);continue;}
     for(let gy=y0;gy<=y1;gy++)for(let gx=x0;gx<=x1;gx++){
      const id=key(gx,gy);
      if(!fresh.has(id))fresh.set(id,[]);
      fresh.get(id).push(i);count++;
     }
    }
    objects=next;grid=fresh;overflow=large;indexed=count;
    lastBuildMs=buildMs=(typeof performance!=='undefined'?performance.now():Date.now())-start;
    builtRevision=revision;builds++;rebuilt=true;
   }else hits++;
   let candidates=[],visited=0;
   const valid=view&&[view.x,view.y,view.width,view.height].every(Number.isFinite)&&
    view.width>=0&&view.height>=0;
   if(valid){
    const x0=coord(view.x),x1=coord(view.x+view.width);
    const y0=coord(view.y),y1=coord(view.y+view.height);
    // A pathological view must not loop over unbounded grid coordinates.
    if((x1-x0+1)*(y1-y0+1)<100000){
     const ids=new Set(overflow);
     for(let gy=y0;gy<=y1;gy++)for(let gx=x0;gx<=x1;gx++){
      visited++;
      for(const i of grid.get(key(gx,gy))||[])ids.add(i);
     }
     candidates=[...ids].sort((a,b)=>a-b);
    }else candidates=objects.map((_,i)=>i);
   }else candidates=objects.map((_,i)=>i);
   const visible=candidates.map(i=>objects[i]).filter(o=>isVisible(o,view));
   return {objects:visible,rebuilt,buildMs,total:objects.length,builds,hits,
    candidates:candidates.length,buckets:visited,indexed,overflow:overflow.length};
  }
  function stats(){return {revision,builtRevision,builds,hits,total:objects.length,
   lastBuildMs,buckets:grid.size,indexed,overflow:overflow.length};}
  return {query,invalidate,stats};
 }
 return {create};
})();

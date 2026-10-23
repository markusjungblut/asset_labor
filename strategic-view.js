/* Vedras Reiche – strategic LOD. Never builds detailed terrain textures.
 * Uses the SAME hex cells and centers but draws fixed-size labels per region
 * instead of one unreadable label for every tiny terrain hex. */
'use strict';
window.VedrasStrategic=(()=>{
 const DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
 const colors={
  ocean:'#356f91',water:'#428eab',wetlands:'#618979',
  woods:'#4f8060',grass:'#94ac71',hills:'#a49b77',
  dry:'#bba478',desert:'#c6b387',cold:'#899b9c',mountain:'#999d9a'
 };
 function category(type,categoryId){
  const t=String(type||'').toLowerCase(),c=String(categoryId||'').toLowerCase();
  if(/ocean|deep_water/.test(t))return 'ocean';
  if(/coast|river|water|lake|sea/.test(t)||/water/.test(c))return 'water';
  if(/swamp|bog|marsh|wetland|moor/.test(t))return 'wetlands';
  if(/mountain|alpine|snowy|peak/.test(t))return 'mountain';
  if(/tundra|ice|snow|frozen|cold/.test(t)||/cold/.test(c))return 'cold';
  if(/desert|dune|sand/.test(t))return 'desert';
  if(/arid|dry|badland|savanna/.test(t)||/arid/.test(c))return 'dry';
  if(/jungle|forest|woods/.test(t))return 'woods';
  if(/hill|highland/.test(t))return 'hills';
  return 'grass';
 }
 const id=c=>c.q+','+c.r;
 function regions(cells,typeFor){
  const byKey=new Map(cells.map(c=>[id(c),c])),seen=new Set(),out=[];
  for(const first of cells){
   if(seen.has(id(first)))continue;
   const type=typeFor(first),members=[],stack=[first];seen.add(id(first));
   while(stack.length){
    const c=stack.pop();members.push(c);
    for(const [dq,dr] of DIRS){
     const n=byKey.get((c.q+dq)+','+(c.r+dr));
     if(n&&!seen.has(id(n))&&typeFor(n)===type){
      seen.add(id(n));stack.push(n);
     }
    }
   }
   let q=0,r=0;for(const c of members){q+=c.q;r+=c.r;}
   out.push({type,cells:members,count:members.length,q:q/members.length,r:r/members.length});
  }
  return out.sort((a,b)=>b.count-a.count||a.type.localeCompare(b.type));
 }
 function draw(ctx,{cells,dimensions,zoom,panX,panY,dpr=1,projectY=.85,
   hexWidth=256,typeFor=()=>'',nameFor=t=>t,categoryFor=()=>'',centers=[],
   selected='0,0',overlay='biomes'}){
  const {width:W,height:H}=dimensions,rad=hexWidth/Math.sqrt(3);
  const axial=(q,r)=>({x:hexWidth*(q+r/2),y:1.5*rad*r});
  const screen=(q,r)=>{const p=axial(q,r);return {
   x:W/2+panX+p.x*zoom,y:H/2+panY+p.y*zoom*projectY};};
  const drawHex=(c)=>{
   const p=screen(c.q,c.r);
   ctx.beginPath();
   for(let k=0;k<6;k++){
    const ang=-Math.PI/2+k*Math.PI/3;
    const x=p.x+rad*Math.cos(ang)*zoom,y=p.y+rad*Math.sin(ang)*zoom*projectY;
    if(!k)ctx.moveTo(x,y);else ctx.lineTo(x,y);
   }ctx.closePath();
  };
  ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#28383a';ctx.fillRect(0,0,W,H);
  for(const c of cells){
   const t=typeFor(c),kind=category(t,categoryFor(t));
   drawHex(c);ctx.fillStyle=colors[kind];ctx.fill();
   ctx.strokeStyle='rgba(17,43,42,.26)';ctx.lineWidth=.75;ctx.stroke();
  }
  const used=[],labels=[];
  function place(name,x,y,priority,kind){
   if(!name||x<-80||y<-20||x>W+80||y>H+20)return;
   ctx.font='600 12px system-ui';
   const text=String(name).length>23?String(name).slice(0,21)+'…':String(name);
   const w=Math.max(48,ctx.measureText(text).width+18),h=25;
   const box={x:x-w/2,y:y-h/2,w,h};
   if(used.some(p=>Math.abs(p.x-box.x)<(p.w+box.w)/2+12&&
    Math.abs(p.y-box.y)<(p.h+box.h)/2+10))return;
   used.push(box);labels.push({text,x,y,box,priority,kind});
  }
  if(overlay!=='centers'){
   // One centered label per LARGER contiguous biome region, never per hex.
   // No label is smaller than 12px, regardless of map zoom.
   const groups=regions(cells,typeFor).filter(g=>g.count>=2);
   let accepted=0;
   for(const g of groups){
    if(accepted>=12)break;
    const p=screen(g.q,g.r);
    const count=labels.length;
    place(nameFor(g.type),p.x,p.y,g.count,'biome');
    if(labels.length>count)accepted++;
   }
  }
  for(const center of centers){
   const pos=screen(center.q,center.r);
   ctx.beginPath();ctx.arc(pos.x,pos.y,7,0,Math.PI*2);
   ctx.fillStyle='#f7d999';ctx.fill();ctx.strokeStyle='#415045';ctx.lineWidth=2;ctx.stroke();
   if(overlay!=='biomes')place(center.name||'Zentrum',pos.x,pos.y-25,100,'center');
  }
  for(const l of labels){
   const {box}=l;ctx.fillStyle=l.kind==='center'?'rgba(46,54,41,.93)':'rgba(20,49,47,.91)';
   ctx.beginPath();ctx.roundRect?.(box.x,box.y,box.w,box.h,6);
   if(ctx.roundRect)ctx.fill();else ctx.fillRect(box.x,box.y,box.w,box.h);
   ctx.fillStyle='#f5f8ea';ctx.font='600 12px system-ui';
   ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(l.text,l.x,l.y);
  }
  const [sq,sr]=String(selected).split(',').map(Number);
  if(Number.isFinite(sq)&&Number.isFinite(sr)&&cells.some(c=>c.q===sq&&c.r===sr)){
   drawHex({q:sq,r:sr});ctx.strokeStyle='#ffe9a7';ctx.lineWidth=2.5;ctx.stroke();
  }
  ctx.restore();
  return {regions:regions(cells,typeFor).length,labels:labels.length,centers:centers.length};
 }
 return {category,regions,draw};
})();
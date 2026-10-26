/* Vedras Reiche v0.21.1 – world-anchored atmospheric Fog of War.
 * Visual effects only. An authoritative server MUST redact unknown tile
 * imagery and hidden entities before delivering any content to clients.
 */
'use strict';
window.VedrasFogAtmosphere=(()=>{
 const finite=Number.isFinite;
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const defaults=Object.freeze({overlap:45,softness:70});
 function prepare(cells){
  const valid=Array.isArray(cells)?cells.filter(c=>finite(c?.x)&&
   finite(c?.y)&&finite(c?.radius)&&c.radius>0)
   .map(c=>({...c,visibility:c.visibility||'unknown'})):[];
  // Index known cells once when discovery changes, not on each camera frame.
  const maxR=valid.reduce((n,c)=>Math.max(n,c.radius),0);
  const step=Math.max(1,maxR*2.5),bucket=(x,y)=>
   Math.floor(x/step)+','+Math.floor(y/step),known=new Map();
  for(const c of valid)if(c.visibility!=='unknown'){
   const k=bucket(c.x,c.y);
   if(!known.has(k))known.set(k,[]);
   known.get(k).push(c);
  }
  for(const c of valid){
   c.frontier=false;
   if(c.visibility!=='unknown')continue;
   const cx=Math.floor(c.x/step),cy=Math.floor(c.y/step);
   outer:for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)
    for(const k of known.get((cx+dx)+','+(cy+dy))||[]){
     const range=(c.radius+k.radius)*1.20;
     if((c.x-k.x)**2+(c.y-k.y)**2<=range*range){
      c.frontier=true;break outer;
     }
    }
  }
  return valid;
 }
 function point(c,view){
  const proj=view.projectY||1,z=view.zoom;
  return {x:view.width/2+view.panX+c.x*z,
   y:view.height/2+view.panY+c.y*z*proj,
   rx:c.radius*z,ry:c.radius*z*proj,proj};
 }
 function hexPath(g,c,view,extra=0){
  const p=point(c,view),rx=p.rx+extra*view.zoom,
   ry=p.ry+extra*view.zoom*p.proj;
  for(let i=0;i<6;i++){
   const angle=-Math.PI/2+i*Math.PI/3;
   const x=p.x+Math.cos(angle)*rx,y=p.y+Math.sin(angle)*ry;
   if(!i)g.moveTo(x,y);else g.lineTo(x,y);
  }
  g.closePath();
 }
 function draw(g,c,view,{ready=true,overlap=45,softness=70}={}){
  const kind=c.visibility||'unknown';
  if(kind==='visible'&&ready)return false;
  if(kind==='unknown'&&!c.frontier)return false;
  const p=point(c,view);
  const overshoot=(clamp(overlap,0,120)+clamp(softness,12,180))*view.zoom;
  if(p.x+p.rx+overshoot<0||p.x-p.rx-overshoot>view.width||
   p.y+p.ry+overshoot*p.proj<0||
   p.y-p.ry-overshoot*p.proj>view.height)return false;
  if(kind==='explored'){
   g.save();g.beginPath();hexPath(g,c,view);g.clip();
   g.fillStyle='rgba(59,66,70,.66)';
   g.fillRect(p.x-p.rx,p.y-p.ry,2*p.rx,2*p.ry);
   g.restore();return true;
  }
  g.save();
  if(typeof g.createRadialGradient==='function'){
   // Center stays completely opaque; clouds feather INSIDE the last known
   // hex instead of stopping at the unknown hex's geometric boundary.
   g.translate(p.x,p.y);g.scale(1,p.proj);
   const inner=p.rx,outer=inner+
    (clamp(overlap,0,120)+clamp(softness,12,180)*.5)*view.zoom;
   const grad=g.createRadialGradient(0,0,0,0,0,outer);
   grad.addColorStop(0,'rgba(186,198,202,1)');
   grad.addColorStop(Math.min(.84,inner*.70/outer),'rgba(186,198,202,1)');
   grad.addColorStop(Math.min(.98,inner*.96/outer),'rgba(191,204,207,.96)');
   grad.addColorStop(1,'rgba(195,208,211,0)');
   g.fillStyle=grad;g.fillRect(-outer,-outer,outer*2,outer*2);
   // Two lighter cloud banks are anchored in world space; no per-frame noise,
   // readback, fullscreen textures or extra compositor surface.
   if(typeof g.ellipse==='function'){
    const seed=Math.abs(Math.sin(c.x*12.9898+c.y*78.233)*43758.5453)%1;
    g.globalAlpha=.16;g.fillStyle='#edf4f4';g.beginPath();
    g.ellipse((seed-.5)*inner*.30,-inner*.10,inner*.57,inner*.22,
     seed*.65-.3,0,Math.PI*2);g.fill();
    g.globalAlpha=.12;g.beginPath();
    g.ellipse((.5-seed)*inner*.38,inner*.28,inner*.40,inner*.17,
     -.19,0,Math.PI*2);g.fill();
   }
  }else{
   // Safe fallback: opaque clouds conceal everything when gradients are absent.
   g.globalAlpha=1;g.fillStyle='#bac7cb';
   g.fillRect(p.x-p.rx-overshoot,p.y-p.ry-overshoot*p.proj,
    2*(p.rx+overshoot),2*(p.ry+overshoot*p.proj));
  }
  g.restore();return true;
 }
 return {prepare,hexPath,draw,defaults};
})();

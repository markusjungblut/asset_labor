/* Opt-in future-game load probe: 100 moving units + selection/HUD markers.
 * The original 4x PNG atlas and static terrain never change or redraw here.
 * This is intentionally representative of draw scheduling, not final artwork.
 */
'use strict';
window.VedrasGameplayLoad=(()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function create({canvas,viewCanvas,getPose,onMetrics=()=>{},unitCount=100}={}){
  if(!canvas?.getContext||!viewCanvas||typeof getPose!=='function')
   throw Error('Spieltest benötigt eigenständiges Overlay und Kamerapose');
  const ctx=canvas.getContext('2d',{alpha:true}),count=clamp(Math.trunc(unitCount)||100,1,300);
  const cols=Math.ceil(Math.sqrt(count));
  const units=Array.from({length:count},(_,i)=>({
   x:((i%cols)-(cols-1)/2)*98,
   y:(Math.floor(i/cols)-(Math.ceil(count/cols)-1)/2)*84,
   faction:i%3,
   hp:.35+(i%13)/20
  }));
  let running=false,raf=null,lastFrame=0,lastStatus=0,
   visible=0,frames=0,drawMs=0,intervals=[],paints=[],lastStats=null;
  const percentile=x=>{
   if(!x.length)return 0;
   const sorted=[...x].sort((a,b)=>a-b);
   return sorted[Math.ceil(.95*sorted.length)-1];
  };
  const report=()=>({...lastStats,frames,unitCount:count,visible,
   p95DrawMs:percentile(paints),p95FrameGapMs:percentile(intervals)});
  function draw(now){
   if(!running)return;
   const pose=getPose();
   if(pose&&!document.hidden){
    const begin=performance.now();
    const w=Math.max(1,Math.floor(viewCanvas.clientWidth)),
     h=Math.max(1,Math.floor(viewCanvas.clientHeight));
    // Bound overlay to a modest backing irrespective of a 4x source atlas.
    const dpr=clamp(pose.dpr||1,1,1.25),
     dw=Math.round(w*dpr),dh=Math.round(h*dpr);
    if(canvas.width!==dw||canvas.height!==dh){
     canvas.width=dw;canvas.height=dh;
    }
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const zoom=pose.zoom||1,projectY=pose.projectY||.85;
    visible=0;
    for(let i=0;i<units.length;i++){
     const u=units[i],phase=now*.0007+i*2.39;
     const px=w/2+(pose.panX||0)+(u.x+Math.sin(phase)*12)*zoom,
      py=h/2+(pose.panY||0)+(u.y+Math.cos(phase*.8)*9)*zoom*projectY;
     if(px< -28||py< -28||px>w+28||py>h+28)continue;
     visible++;
     const radius=clamp(7*zoom,4,12);
     // Basic combat token, faction, moving shadow and health bar.
     ctx.fillStyle='rgba(5,22,20,.35)';
     ctx.beginPath();ctx.arc(px+2,py+4,radius+2,0,Math.PI*2);ctx.fill();
     ctx.fillStyle=['#5fa8f2','#dba366','#a4d27c'][u.faction];
     ctx.beginPath();ctx.arc(px,py,radius,0,Math.PI*2);ctx.fill();
     ctx.fillStyle='#14302b';
     ctx.fillRect(px-radius,py-radius-8,radius*2,3);
     ctx.fillStyle=u.hp>.5?'#a6e27f':'#d9936a';
     ctx.fillRect(px-radius,py-radius-8,radius*2*u.hp,3);
     if(i===0){
      ctx.strokeStyle='#f9e2a4';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(px,py,radius+5,0,Math.PI*2);ctx.stroke();
     }
    }
    drawMs=performance.now()-begin;
    paints.push(drawMs);if(paints.length>120)paints.shift();
    if(lastFrame&&now-lastFrame<350){
     intervals.push(now-lastFrame);
     if(intervals.length>120)intervals.shift();
    }
    lastFrame=now;frames++;
    if(now-lastStatus>=700){
     lastStatus=now;lastStats=report();
     onMetrics(lastStats);
    }
   }
   raf=requestAnimationFrame(draw);
  }
  return {
   start(){if(running)return;running=true;raf=requestAnimationFrame(draw);},
   stop(){running=false;if(raf!=null)cancelAnimationFrame(raf);raf=null;ctx.clearRect(0,0,canvas.width,canvas.height);},
   report
  };
 }
 return {create};
})();

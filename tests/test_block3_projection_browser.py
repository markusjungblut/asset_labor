"""Chromium pixel-level regression: real shadow-system module must project DOWN-LEFT."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
module=(ROOT/'shadow-system.js').read_text()
HTML='<canvas id="canvas" width="820" height="470"></canvas><script>'+module+'</script>'
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',
                            args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page()
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(HTML,wait_until='domcontentloaded')
 results=page.evaluate("""()=>{
  const canvas=document.querySelector('#canvas'),ctx=canvas.getContext('2d');
  const source=document.createElement('canvas');source.width=320;source.height=420;
  const g=source.getContext('2d');
  g.fillStyle='#10202b';g.beginPath();g.moveTo(160,12);g.lineTo(260,290);g.lineTo(80,290);g.closePath();g.fill();
  const S=window.VedrasShadows,p={x:530,y:190},w=330,h=410,anchor={x:.5,y:.67};
  S.cast(ctx,{canvas:source},p,w,h,anchor,1.55,'mountain',.75,5);
  const data=ctx.getImageData(0,0,820,470).data;
  const region=(xmin,xmax,ymin,ymax)=>{
   let alpha=0,nonzero=0;
   for(let y=ymin;y<ymax;y++)for(let x=xmin;x<xmax;x++){
    const a=data[(y*820+x)*4+3];alpha+=a;if(a>15)nonzero++;
   }
   return {alpha,nonzero};
  };
  const parts={
   lowerLeft:region(210,505,200,280),
   upperLeft:region(210,505,95,175),
   lowerRight:region(565,810,200,280)
  };
  ctx.clearRect(0,0,820,470);
  S.cast(ctx,{canvas:source},p,w,h,anchor,1.55,'mountain',0,5);
  const fresh=ctx.getImageData(210,200,295,80).data;
  parts.mutedAlpha=fresh.filter((_,i)=>i%4===3).reduce((a,b)=>a+b,0);
  S.contact(ctx,p,w,'mountain',1);
  const contactData=ctx.getImageData(0,0,820,470).data;
  parts.contactAlpha=contactData[(Math.round(p.y)*820+Math.round(p.x))*4+3];
  return parts;
 }""")
 assert not errors,errors
 low=results['lowerLeft']['alpha']
 assert results['lowerLeft']['nonzero']>1000,results
 assert low>max(100,results['upperLeft']['alpha']*3),results
 assert low>max(100,results['lowerRight']['alpha']*3),results
 assert results['mutedAlpha']==0,results
 assert results['contactAlpha']>0,results
 print('PASS Chromium: visible mountain cast lower-left, no upward shadow, 0-opacity suppression and planted foot contact')
 browser.close()

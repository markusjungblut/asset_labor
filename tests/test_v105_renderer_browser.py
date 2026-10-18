from pathlib import Path
from PIL import Image
from io import BytesIO
import base64
from playwright.sync_api import sync_playwright
B=Path(__file__).resolve().parents[1]
scripts='\n'.join((B/n).read_text() for n in ['catalog.js','autotile.js','relief.js','shoreline.js'])
thumb=[]
for side in range(1,7):
 im=Image.open(B/f'assets/shorelines/shore_v105_edge_{side:02d}.png').resize((384,384),Image.Resampling.LANCZOS)
 bio=BytesIO();im.save(bio,format='PNG',optimize=True)
 thumb.append('data:image/png;base64,'+base64.b64encode(bio.getvalue()).decode())
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=browser.new_page(viewport={'width':1240,'height':940})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content('<html><body style="margin:0;background:#132a38;"><canvas id="test" width="1240" height="940"></canvas><script>'+scripts+'</script></body></html>',timeout=30000)
 result=page.evaluate('''async ({data})=>{
    const c=VedrasCatalog.starter();let coast=VedrasCatalog.terrainType(c,'coast');
    coast.materialClass='shoreline';coast.transitionProfileId='shoreline_required';
    if(!VedrasCatalog.migrateWaterTypes(c)||coast.materialClass!=='water'||VedrasCatalog.profile(c,'coast','ocean').mode!=='soft_water')throw Error('Coastal classification');
    const cell={q:0,r:0,wet:false};const cells=[cell,...VedrasShoreline.DIRS.map(([q,r])=>({q,r,wet:true}))];
    const segs=VedrasShoreline.segments(cells,c=>c.wet);
    if(segs.length!==6)throw Error('Six edges');
    for(let i=0;i<6;i++){const e=segs[i],m={x:(e.center.x+e.waterCenter.x)/2,y:(e.center.y+e.waterCenter.y)/2};if(i!==e.side||Math.hypot(e.mid.x-m.x,e.mid.y-m.y)>1e-5)throw Error('Alignment '+i);}
    const images=await Promise.all(data.map(url=>new Promise((resolve,reject)=>{let img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url;})));
    const temp=VedrasShoreline.build(cells,c=>c.wet,images,{mode:'temp',width:34,outer:10,resolution:1});
    const art=VedrasShoreline.build(cells,c=>c.wet,images,{mode:'art',resolution:1});
    if(art.missing!==0)throw Error('PNG overlays failed');
    const context=document.getElementById('test').getContext('2d');context.fillStyle='#18405b';context.fillRect(0,0,1240,940);
    context.save();context.translate(620,460);context.scale(1.3,1.3);
    for(const tile of cells){const vs=VedrasShoreline.vertices(tile),p=new Path2D();p.moveTo(vs[0].x,vs[0].y);for(const v of vs.slice(1))p.lineTo(v.x,v.y);p.closePath();context.fillStyle=tile.wet?'#124c79':'#748854';context.fill(p);}
    context.drawImage(art.canvas,art.x,art.y,art.width,art.height);
    context.restore();
    const rgba=art.canvas.getContext('2d').getImageData(0,0,art.canvas.width,art.canvas.height).data;
    const point=(x,y)=>{const ix=Math.floor((x-art.x)*art.canvas.width/art.width),iy=Math.floor((y-art.y)*art.canvas.height/art.height);return rgba[(iy*art.canvas.width+ix)*4+3];};
    if(point(0,0)>5)throw Error('Center not transparent');
    for(const s of segs){if(point(s.mid.x,s.mid.y)<20)throw Error('Missing edge alpha for side '+s.side);}
    const mk=(rgb,id)=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');g.fillStyle=rgb;g.fillRect(0,0,128,128);cv.naturalWidth=128;cv.naturalHeight=128;return {path:id,img:cv};};
    const mats={coast:mk('#38b3c8','coast'),ocean:mk('#17448c','ocean'),grassland:mk('#719450','grassland')};
    const samples=[{q:0,r:0,t:'ocean'},{q:1,r:0,t:'coast'},{q:0,r:1,t:'grassland'}, {q:0,r:-1,t:'ocean'},{q:1,r:-1,t:'coast'},{q:-1,r:0,t:'ocean'},{q:-1,r:1,t:'coast'}];
    const mix=VedrasAutotile.build(samples,t=>mats[t.t],t=>t.t,{band:42,blend:true,blendVariants:true,irregularity:0,materialClassOf:id=>VedrasCatalog.terrainType(c,id).materialClass,transitionMode:(a,b)=>VedrasCatalog.profile(c,a,b).mode,resolution:1});
    if(!mix?.canvas)throw Error('Water raster empty');
    const contextSea=mix.canvas.getContext('2d');const px=(x,y)=>{const ix=Math.floor((x-mix.x)*mix.density),iy=Math.floor((y-mix.y)*mix.density);return [...contextSea.getImageData(ix,iy,1,1).data];};
    const left=px(45,0),mid=px(128,0),right=px(210,0);
    if(!((left[1]<mid[1])&&(mid[1]<right[1])))throw Error('Water blending not monotone: '+JSON.stringify({left,mid,right}));
    return {edges:segs.length,missing:art.missing,centerAlpha:point(0,0),midAlpha:segs.map(s=>point(s.mid.x,s.mid.y)),rasterSize:[art.canvas.width,art.canvas.height],blend:[left,mid,right]};
}''',{'data':thumb})
 print(result)
 page.screenshot(path=str(B/'previews/v105_coast_renderer_test.png'))
 assert not errors,errors
 browser.close()
 print('PASS: browser renderer six sides, corner union, art alpha, water mixing')
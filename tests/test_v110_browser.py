"""Offline regression: accessible drawers, 37 hex, nature planner and auto sizing."""
from pathlib import Path
from io import BytesIO
import base64, json
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
B=Path(__file__).resolve().parents[1]
html=(B/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="style.css?v=0.11.0">','<style>'+(B/'style.css').read_text()+'</style>')
for f in ['catalog','terrain-source-rules','autotile','nature_catalog','sprite-planner','existing-asset-rules','relief','shoreline','mountain','app','nature-ui','ui-organizer']:
    html=html.replace(f'<script src="{f}.js?v=0.11.0"></script>','<script>'+(B/(f+'.js')).read_text()+'</script>')
def png(im):
    b=BytesIO();im.save(b,format='PNG');return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
land=Image.new('RGB',(80,80),(95,147,77))
tree=Image.new('RGBA',(96,160),(0,0,0,0));d=ImageDraw.Draw(tree);d.polygon([(49,4),(85,103),(60,142),(24,137),(10,91)],fill=(37,117,55,255))
shrub=Image.new('RGBA',(90,90),(0,0,0,0));ImageDraw.Draw(shrub).ellipse((6,6,83,84),fill=(62,110,49,255))
assets=[dict(path='assets/'+path,relPath=path,name=path.split('/')[-1],category=cat,meta={},bytes=150,mtime=1,url=png(img)) for path,cat,img in [('terrain/test_grass.png','terrain',land),('nature/birch_01.png','nature',tree),('nature/thyme_01.png','nature',shrub)]]
mock='''<script>
const TEST_ASSETS=ASSETS;
window.fetch=async(path,opts={})=>{
const T=VedrasCatalog.starter();T.assets['terrain/test_grass.png']={terrainTypeId:'grassland',variantFamilyId:'grassland_base'};
const N={schemaVersion:1,revision:0,presets:{},entries:{}};
let o={};if(path==='/api/assets')o={assets:TEST_ASSETS,version:'0.11.0'};
else if(path==='/api/terrain-catalog')o=T;
else if(path==='/api/nature-catalog')o=N;
else if(path==='/api/nature-catalog-backup')return new Response('{}',{status:404});
else if(path==='/api/nature-catalog'&&opts.method==='POST')o={ok:true};
else return new Response('{}',{status:404});
return new Response(JSON.stringify(o),{status:200});};
</script>'''.replace('=ASSETS;','='+json.dumps(assets)+';')
html=html.replace('<script>',mock+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=b.new_page(viewport={'width':1520,'height':900},accept_downloads=True)
 page.on('dialog',lambda d:d.accept())
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded',timeout=30000)

 try: page.wait_for_function('window.VedrasAssetLabor && window.VedrasNature && window.VedrasSpritePlanner',timeout=5000)
 except Exception as e:
  print('INIT ERR',errors,'scriptCount=',page.evaluate('document.scripts.length'),'loaded=',page.evaluate('Object.keys(window).filter(x=>x.startsWith(\"Vedras\"))'));raise
 page.wait_for_function('VedrasAssetLabor.assets().length===3 && VedrasNature.entryFor(VedrasAssetLabor.assets().find(a=>a.name==="birch_01.png"))',timeout=45000)
 s=page.evaluate('''()=>({cells:VedrasAssetLabor.cells().length,section:!!document.getElementById('drawer_natureLabTools'),planner:VedrasSpritePlanner.entries.length,imported:Object.keys(VedrasNature.catalog().entries).length})''')
 assert s['cells']==37,s
 assert s['section'] and s['planner']>=40 and s['imported']==2,s
 birch=page.evaluate('''()=>{const a=VedrasAssetLabor.assets().find(x=>x.name==='birch_01.png');const m=VedrasNature.entryFor(a);return {size:m.sizeClass,sizeMode:m.sizeMode,kind:m.kind,allowed:m.allowedTerrainCategories,height:m.targetHeight}}''')
 thyme=page.evaluate('''()=>{const a=VedrasAssetLabor.assets().find(x=>x.name==='thyme_01.png');const m=VedrasNature.entryFor(a);return {size:m.sizeClass,sizeMode:m.sizeMode,kind:m.kind,height:m.targetHeight}}''')
 assert birch['kind']=='tree' and birch['height']>thyme['height']*5 and thyme['kind']=='ground_cover',(birch,thyme)
 assert 'grass_pasture' in birch['allowed'],birch
 assert page.locator('#nSizeMode').count()==1
 assert page.locator('.lab-accordion').count()>=6
 page.locator('#quick37').click()
 assert page.evaluate('VedrasAssetLabor.cells().length')==37
 page.evaluate("()=>{let x=document.getElementById('sceneSize');x.value='19';x.dispatchEvent(new Event('change',{bubbles:true}));}")
 page.wait_for_timeout(150)
 assert page.evaluate('VedrasAssetLabor.cells().length')==19
 page.evaluate("()=>{let x=document.getElementById('sceneSize');x.value='37';x.dispatchEvent(new Event('change',{bubbles:true}));}")
 page.wait_for_timeout(200)
 assert page.evaluate('VedrasAssetLabor.cells().length')==37
 page.evaluate("()=>{for(const d of document.querySelectorAll('.asset-group'))if(d.textContent.includes('birch_01.png'))d.open=true;}")
 page.locator('button.asset-card').filter(has_text='birch_01.png').click()
 assert page.locator('#nSizeMode').input_value()=='class'
 assert page.locator('#nSizeInfo').inner_text().startswith('Automatische Zielhöhe')
 page.locator('#shortcutMountain').click()
 assert page.locator('#drawer_mountainTools').get_attribute('open') is not None
 (B/'previews').mkdir(exist_ok=True)
 page.screenshot(path=str(B/'previews/v110_workspace_browser.png'),full_page=False)
 print('PASS',{'test':s,'birch':birch,'thyme':thyme,'errors':errors})
 assert not errors, errors
 b.close()
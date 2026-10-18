"""Embedded Chromium check because headless navigation to local 127.0.0.1 is admin blocked."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, base64, mimetypes
BASE=Path(__file__).resolve().parents[1]
rel=['terrain/plains_01.png','terrain/plains_02.png','terrain/forest_01.png','terrain/dry_01.png','terrain/hills_01.png',
     'nature/pine_01.svg','nature/pine_02.svg','nature/rock_01.svg','nature/rock_02.svg','nature/hill_01.svg','nature/ore_iron.svg',
     'buildings/mine_lvl01__main.png','units/expedition.svg','shadows/generic_small_round.png']
assets=[]
for path in rel:
 f=BASE/'assets'/path
 if not f.exists(): continue
 mime=mimetypes.guess_type(str(f))[0] or 'image/png'
 assets.append({'path':'assets/'+path,'relPath':path,'name':f.name,'category':path.split('/')[0],'meta':{},'mtime':1,
                'url':'data:'+mime+';base64,'+base64.b64encode(f.read_bytes()).decode()})
terrain=json.loads((BASE/'assets/terrain/terrain_catalog.json').read_text())
html=(BASE/'index.html').read_text().replace('<link rel="stylesheet" href="style.css?v=0.10.1">','<style>'+(BASE/'style.css').read_text()+'</style>')
for s in ['catalog','autotile','nature_catalog','relief','app','nature-ui']:
 html=html.replace(f'<script src="{s}.js?v=0.10.1"></script>',f'<script>{(BASE/(s+".js")).read_text()}</script>')
# real rendered scripts, mocked backend/API and data URL fixtures; no server or external access
mock='''<script>
window.__assets=__ASSETS_DATA__;window.__terrain=__TERRAIN_DATA__;window.__nature={schemaVersion:1,revision:0,entries:{},presets:{}};
window.fetch=async(path,opts={})=>{let obj={},method=opts.method||'GET';
if(path==='/api/assets')obj={assets:window.__assets,version:'0.10.1'};
else if(path==='/api/version')obj={version:'0.10.1',port:8771};
else if(path==='/api/terrain-catalog'){if(method==='POST')window.__terrain=JSON.parse(opts.body);obj=window.__terrain;}
else if(path==='/api/nature-catalog'){if(method==='POST')window.__nature=JSON.parse(opts.body);obj=window.__nature;}
else return new Response('{}',{status:404});
return new Response(JSON.stringify(obj),{status:200});};
</script>'''.replace('__ASSETS_DATA__',json.dumps(assets)).replace('__TERRAIN_DATA__',json.dumps(terrain))
pos=html.index('<script>')
html=html[:pos]+mock+html[pos:]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=browser.new_page(viewport={'width':1600,'height':1000},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('about:blank');page.set_content(html,wait_until='domcontentloaded',timeout=30000)
 page.wait_for_timeout(1200)
 print('before tests',page.locator('#serverStatus').inner_text(), 'errors',errors)
 page.locator('#reliefGrassTest').click();page.wait_for_timeout(2000)
 print('grass',page.locator('#reliefStats').inner_text(), 'scene',page.evaluate('VedrasAssetLabor.state.sceneSize'), 'cellcount',page.evaluate('VedrasAssetLabor.cells().length'),'errors',errors)
 page.locator('#canvasOuter').screenshot(path='/mnt/data/relief_test_grass.png')
 assert page.evaluate('window.__vedrasReliefRaster.canvas.height')>page.evaluate('window.__vedrasTerrainRaster.canvas.height')
 assert page.evaluate('VedrasAssetLabor.relief.height(0,0)')>0
 page.locator('#reliefBiomesTest').click();page.wait_for_timeout(1900)
 print('biomes',page.locator('#reliefStats').inner_text(), 'errors',errors)
 page.locator('#canvasOuter').screenshot(path='/mnt/data/relief_test_biomes.png')
 page.locator('#reliefFlatCompare').click();page.wait_for_timeout(450)
 assert not page.locator('#reliefOn').is_checked()
 page.locator('#reliefFlatCompare').click();page.wait_for_timeout(600)
 assert page.locator('#reliefOn').is_checked()
 page.locator('#reliefProfile').select_option('chain');page.wait_for_timeout(600)
 page.locator('#canvasOuter').screenshot(path='/mnt/data/relief_test_chain.png')
 print('end config',page.evaluate('VedrasAssetLabor.state.relief'))
 print('errors',errors)
 browser.close()
 assert not errors,errors
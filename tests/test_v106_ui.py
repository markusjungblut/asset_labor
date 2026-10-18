"""Offline UI/scene-persistence smoke test for v0.10.6 (no user assets)."""
from pathlib import Path
from io import BytesIO
import base64,json
from PIL import Image
from playwright.sync_api import sync_playwright
B=Path(__file__).resolve().parents[1]
html=(B/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="style.css?v=0.10.6">','<style>'+(B/'style.css').read_text()+'</style>')
for f in ['catalog','autotile','nature_catalog','relief','shoreline','app','nature-ui']:
    html=html.replace(f'<script src="{f}.js?v=0.10.6"></script>', '<script>'+(B/(f+'.js')).read_text()+'</script>')
image=Image.new('RGB',(512,512),(21,55,99))
bio=BytesIO();image.save(bio,format='PNG')
rel='terrain/test_ocean.png'
assets=[{'path':'assets/'+rel,'relPath':rel,'name':'test_ocean.png','category':'terrain','meta':{},'bytes':len(bio.getvalue()),'mtime':42,'url':'data:image/png;base64,'+base64.b64encode(bio.getvalue()).decode()}]
reg={'schemaVersion':2,'categories':[{'id':'water_coast','name':'Wasser und Küste','sortOrder':1}], 'terrainTypes':[{'id':'ocean','name':'Ozean','categoryId':'water_coast','materialClass':'water','transitionProfileId':'soft_water'}],'transitionProfiles':[{'id':'soft_water','mode':'soft_water','defaultBand':42}], 'assets':{rel:{'terrainTypeId':'ocean','variantFamilyId':'ocean_base'}}}
mock='''<script>
const TEST_ASSETS = ASSETS;
const TEST_CATALOG = CATALOG;
window.fetch=async(path,opts={})=>{let obj={};
if(path==='/api/assets')obj={assets:TEST_ASSETS,version:'0.10.6'};
else if(path==='/api/version')obj={version:'0.10.6',port:8776};
else if(path==='/api/terrain-catalog')obj=TEST_CATALOG;
else if(path==='/api/nature-catalog')obj={schemaVersion:1,revision:0,presets:{},entries:{}};
else if(path==='/api/nature-catalog-backup')obj={schemaVersion:1,revision:0,presets:{},entries:{}};
else return new Response('{}',{status:404});
return new Response(JSON.stringify(obj),{status:200});};
</script>'''.replace('= ASSETS;','= '+json.dumps(assets)+';').replace('= CATALOG;','= '+json.dumps(reg)+';')
html=html.replace('<script>',mock+'<script>',1)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
    page=browser.new_page(viewport={'width':1400,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded',timeout=30000)
    page.wait_for_function("window.VedrasAssetLabor && document.querySelector('#serverStatus').textContent.includes('1/1')",timeout=30000)
    assert 'v0.10.6' in page.locator('header').inner_text()
    assert page.locator('#waterSamplingMode').input_value()=='hex'
    page.locator('#waterSamplingMode').select_option('repeat')
    assert page.evaluate('VedrasAssetLabor.state.waterSampling')=='repeat'
    page.locator('#waterSamplingMode').select_option('hex')
    assert page.evaluate('VedrasAssetLabor.state.waterSampling')=='hex'
    with page.expect_download(timeout=10000) as event:
        page.locator('#saveScene').click()
    scene=json.loads(event.value.path().read_text())
    assert scene['autotiling']['waterSampling']=='hex'
    page.locator('#waterSamplingMode').select_option('repeat')
    page.locator('#sceneImport').set_input_files({'name':'restored_scene.json','mimeType':'application/json','buffer':json.dumps(scene).encode()})
    page.wait_for_function("VedrasAssetLabor.state.waterSampling==='hex'",timeout=10000)
    assert page.locator('#shorelinePanel').count() == 1
    assert page.locator('#natureInspector').count() == 1
    assert not errors,errors
    page.screenshot(path=str(B/'previews/v106_ui_smoke.png'))
    print('PASS v0.10.6 UI: no JS exceptions, mode toggles and survives scene export/import, shoreline and nature inspector intact')
    browser.close()
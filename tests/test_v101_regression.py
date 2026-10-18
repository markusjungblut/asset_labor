"""Embedded Chromium regression of dynamic territory selection and Nature state."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,base64,mimetypes
BASE=Path(__file__).resolve().parents[1]
reg=json.loads((BASE/'assets/terrain/terrain_catalog.json').read_text())
fixture=[x for x in reg['assets'] if x in ['terrain/plains_01.png','terrain/plains_02.png','terrain/dry_01.png','terrain/frozen_tundra_base_01.png','terrain/tundra_base_01.png','terrain/tundra_base_02.png']]
fixture+=['nature/pine_01.svg','buildings/mine_lvl01__main.png','shadows/generic_small_round.png']
assets=[]
for f in fixture:
 b=(BASE/'assets'/f).read_bytes();assets.append(dict(path='assets/'+f,relPath=f,name=Path(f).name,category=f.split('/')[0],meta={},url='data:'+(mimetypes.guess_type(f)[0] or 'image/png')+';base64,'+base64.b64encode(b).decode(),mtime=42,bytes=len(b)))
nature={'schemaVersion':1,'revision':7,'presets':{'cold_plants':{'name':'Kalte Pflanzen','categoryIds':['cold_regions'],'typeIds':[],'excludeIds':[]}},'entries':{'nature/pine_01.svg':{'id':'pine_alpine_01','description':'Alte gespeicherte Tanne','sourceReference':'alt.png','family':'conifers','kind':'tree','sizeClass':'medium','logicalWidth':72,'scaleMin':.8,'scaleMax':1.2,'anchor':{'x':.5,'y':.96},'shadow':{'mode':'generic_small_round','path':'','offsetX':-.2,'offsetY':0,'widthScale':.7,'depthScale':.15},'terrainPresetId':'cold_plants','allowedTerrainCategories':[],'allowedTerrainTypes':[],'excludedTerrainTypes':[],'placement':{'weight':1,'density':.3,'minSpacing':20,'canCluster':True,'edgeMargin':10},'artStatus':'approved','tags':[]}}}
html=(BASE/'index.html').read_text().replace('<link rel="stylesheet" href="style.css?v=0.10.2">','<style>'+(BASE/'style.css').read_text()+'</style>')
for f in ['catalog','autotile','nature_catalog','relief','app','nature-ui']:
 html=html.replace(f'<script src="{f}.js?v=0.10.2"></script>',f'<script>{(BASE/(f+".js")).read_text()}</script>')
mock='''<script>
window.__assets=ASSETS_DATA;window.__terrain=TERRAIN_DATA;window.__nature=NATURE_DATA;
window.fetch=async(path,opts={})=>{let obj={},method=opts.method||'GET';
if(path==='/api/assets')obj={assets:window.__assets,version:'0.10.2'};
else if(path==='/api/version')obj={version:'0.10.2',port:8773};
else if(path==='/api/terrain-catalog'){if(method==='POST')window.__terrain=JSON.parse(opts.body);obj=window.__terrain;}
else if(path==='/api/nature-catalog'){if(method==='POST')window.__nature=JSON.parse(opts.body);obj=window.__nature;}
else if(path==='/api/nature-catalog-backup')obj=window.__nature;
else return new Response('{}',{status:404});
return new Response(JSON.stringify(obj),{status:200});};
</script>'''.replace('ASSETS_DATA',json.dumps(assets)).replace('TERRAIN_DATA',json.dumps(reg)).replace('NATURE_DATA',json.dumps(nature))
html=html.replace('<script>',mock+'<script>',1)
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=browser.new_page(viewport={'width':1680,'height':1080},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('about:blank');page.set_content(html,wait_until='domcontentloaded',timeout=30000);page.wait_for_timeout(1300)
 print('startup',page.locator('#serverStatus').inner_text(),'catalog',page.locator('#nCatalogState').inner_text(),'errors',errors)
 assert '1 Sprites' in page.locator('#nCatalogState').inner_text(), 'Nature data lost due to load race'
 page.locator('#assetList button.asset-card').filter(has=page.locator('text=pine_01.svg')).first.click()
 assert page.locator('#natureInspector').is_visible(), 'Sprite editor missing'
 assert page.locator('#nId').input_value()=='pine_alpine_01'
 assert page.locator('#nPresetSelect').input_value()=='cold_plants'
 page.locator('#nWidth').fill('76');page.locator('#nSave').click();page.wait_for_timeout(1300)
 assert page.evaluate("window.__nature.entries['nature/pine_01.svg'].logicalWidth")==76
 page.locator('#reloadBtn').click();page.wait_for_timeout(1000)
 assert page.locator('#nWidth').input_value()=='76'
 print('nature save & reload PASS')
 # Regenerate category scene with two cold biome types from named catalog instead of hardcoded filenames
 page.locator('#terrainTestMode').select_option('category')
 page.locator('#testCategoryA').select_option('cold_regions')
 page.locator('#applyTerrainTest').click();page.wait_for_timeout(1900)
 groups=page.evaluate('Object.keys(VedrasAssetLabor.state.hexTerrain).length')
 types=page.evaluate('''(()=>{let c=VedrasAssetLabor.catalog(),paths=VedrasAssetLabor.state.hexTerrain;return [...new Set(Object.values(paths).map(p=>c.assets[p.replace(/^assets\\//,'')]?.terrainTypeId))]})()''')
 print('region scene',groups,types,'errors',errors)
 assert groups==19 and set(types)=={'tundra','frozen_tundra'},types
 # Three-biome comparison uses three selected source types
 page.locator('#terrainTestMode').select_option('triple')
 page.locator('#testTypeA').select_option('grassland')
 page.locator('#testTypeB').select_option('tundra')
 page.locator('#testTypeC').select_option('frozen_tundra')
 page.locator('#applyTerrainTest').click();page.wait_for_timeout(900)
 types=page.evaluate('''(()=>{let c=VedrasAssetLabor.catalog(),paths=VedrasAssetLabor.state.hexTerrain;return [...new Set(Object.values(paths).map(p=>c.assets[p.replace(/^assets\\//,'')]?.terrainTypeId))]})()''')
 assert set(types)=={'grassland','tundra','frozen_tundra'},types
 # Seed must alter plateau outline at several probe points
 vals=page.evaluate('''(()=>{const R=VedrasRelief;const r={...R.defaults(),enabled:true,profile:'plateau',strength:95};return [17,12878,38391].map(seed=>[[-110,-90],[120,-60],[185,40],[50,135]].map(([x,y])=>Math.round(R.at(x,y,{...r,seed})*1000)/1000));})()''')
 assert len({tuple(v) for v in vals})==3,vals
 print('plateau seed output:',vals)
 page.locator('#reliefBuildingTest').click();page.wait_for_timeout(900)
 pads=page.evaluate('VedrasAssetLabor.state.relief.padBuildings')
 slopes=page.evaluate('''(()=>{const R=VedrasRelief;const r=VedrasAssetLabor.state.relief;const x=0,y=52;const raw=R.rawAt(x+40,y,r)-R.rawAt(x-40,y,r);return [raw,R.at(x,y,{...r,pads:[{x,y,radius:55,transition:45,height:R.rawAt(x,y,r)}]})]})()''')
 assert pads and page.locator('#reliefPadBuildings').is_checked()
 page.screenshot(path='/mnt/data/vedras_v0101_test.png',full_page=False)
 print('building test',pads,'hills',slopes,'errors',errors)
 browser.close()
 assert not errors,errors
 print('PASS: Nature edit, reload, region category, three biomes, seed variance, build-pad demo')
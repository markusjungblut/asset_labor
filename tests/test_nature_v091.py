from pathlib import Path
from playwright.sync_api import sync_playwright
import json, base64, mimetypes
BASE=Path(__file__).resolve().parents[1]
# No full-size terrain images: exercise the exact production JS and HTML with miniature data assets.
resources=['nature/pine_01.svg','nature/pine_02.svg','nature/rock_01.svg','shadows/generic_small_round.png','terrain/plains_01.png','buildings/mine_lvl01__main.png']
assets=[]
for rel in resources:
 f=BASE/'assets'/rel
 mime=mimetypes.guess_type(str(f))[0] or 'image/png'
 assets.append(dict(path='assets/'+rel,relPath=rel,name=f.name,category=rel.split('/')[0],meta={},mtime=1,url='data:'+mime+';base64,'+base64.b64encode(f.read_bytes()).decode()))
terrain=json.loads((BASE/'assets/terrain/terrain_catalog.json').read_text())
html=(BASE/'index.html').read_text().replace('<link rel="stylesheet" href="style.css?v=0.9.1">','<style>'+(BASE/'style.css').read_text()+'</style>')
for script in ['catalog','autotile','nature_catalog','app','nature-ui']:
 html=html.replace(f'<script src="{script}.js?v=0.9.1"></script>',f'<script>{(BASE/(script+".js")).read_text()}</script>')
mock='''<script>
 window.__assets=ASSETS;window.__terrain=TC;window.__nature={schemaVersion:1,revision:0,entries:{},presets:{}};
 window.fetch=async (path,opts={})=>{
 let obj={},m=opts.method||'GET';
 if(path==='/api/assets')obj={assets:window.__assets,version:'0.9.1'};
 else if(path==='/api/version')obj={version:'0.9.1',port:8770};
 else if(path==='/api/terrain-catalog'){if(m==='POST')window.__terrain=JSON.parse(opts.body);obj=window.__terrain;}
 else if(path==='/api/nature-catalog'){if(m==='POST')window.__nature=JSON.parse(opts.body);obj=window.__nature;}
 else return new Response('{}',{status:404});
 return new Response(JSON.stringify(obj),{status:200});
 };
</script>'''.replace('TC',json.dumps(terrain)).replace('ASSETS',json.dumps(assets))
pos=html.index('<script>/* Vedras terrain registry')
html=html[:pos]+mock+html[pos:]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=browser.new_page(viewport={'width':1350,'height':780},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('about:blank');page.set_content(html,wait_until='domcontentloaded',timeout=30000)
 page.wait_for_timeout(500)
 print('initial',page.locator('#serverStatus').inner_text()[:80], 'JS errors',errors)
 assert not errors,errors
 assert page.locator('#nCategoryPick input').count()==len(terrain['categories'])
 # Attach first sprite to category; check auto-updating new terrain type after registry change.
 page.locator('#assetSearch').fill('pine_01')
 page.locator('.asset-card').first.click()
 page.locator('#nId').fill('pine_01_new');page.locator('#nFamily').fill('temperate_bushes')
 page.locator('#nCategoryPick input[value="grass_pasture"]').check()
 page.locator('#nBiomes select[data-type="tundra"]').select_option('exclude')
 page.locator('#nSave').click();page.wait_for_timeout(550)
 assert page.evaluate('window.__nature.entries["nature/pine_01.svg"].allowedTerrainCategories.includes("grass_pasture")')
 # create named linked category preset, only uses valid category keys.
 page.locator('#nPresetName').fill('Grüne Standardbüsche')
 page.locator('#nPresetCreate').click();page.wait_for_timeout(600)
 catalog=page.evaluate('window.__nature');print('presets',catalog['presets'])
 assert 'grune_standardbusche' in catalog['presets']
 assert catalog['entries']['nature/pine_01.svg']['terrainPresetId']=='grune_standardbusche'
 page.evaluate('window.VedrasAssetLabor.catalog().terrainTypes.push({id:"fresh_pasture_test",name:"Neue Weide",categoryId:"grass_pasture",materialClass:"ground",transitionProfileId:"organic_ground"}); window.dispatchEvent(new Event("vedras:terrain-catalog-changed"));')
 allowed=page.evaluate('window.VedrasNature.resolveForMeta(window.VedrasNature.catalog().entries["nature/pine_01.svg"]).has("fresh_pasture_test")')
 assert allowed, 'New terrain type in checked category must auto-include'
 # another sprite can select preset without rechecking fields
 page.locator('#assetSearch').fill('pine_02');page.locator('.asset-card').first.click()
 page.locator('#nId').fill('pine_02_new');page.locator('#nFamily').fill('temperate_bushes')
 page.locator('#nPresetSelect').select_option('grune_standardbusche')
 page.locator('#nShadowX').fill('-0.3');page.locator('#nShadowY').fill('-0.02')
 page.locator('#nShadowWidth').fill('0.6');page.locator('#nShadowDepth').fill('0.14')
 page.locator('#nSave').click();page.wait_for_timeout(650)
 one=page.evaluate('window.__nature.entries["nature/pine_02.svg"]')
 assert one['shadow']['offsetX']==-.3 and one['terrainPresetId']=='grune_standardbusche'
 page.evaluate('window.VedrasNature.reload()');page.wait_for_timeout(300)
 assert page.locator('#nShadowX').input_value()=='-0.3'
 print('UI preset+shadow persistence + new terrain category update: PASS')
 assert not errors,errors
 browser.close()
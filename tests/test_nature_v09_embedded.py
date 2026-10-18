from pathlib import Path
from playwright.sync_api import sync_playwright
import json, base64, mimetypes
BASE=Path(__file__).resolve().parents[1]
chosen=['nature/pine_01.svg','nature/pine_02.svg','nature/rock_01.svg','nature/rock_02.svg','nature/hill_01.svg','terrain/plains_01.png','terrain/plains_handpainted_01.png','terrain/forest_01.png','terrain/dry_01.png','terrain/hills_01.png','terrain/mountain_01.png','buildings/mine_lvl01__main.png','units/expedition.svg',
'shadows/generic_small_round.png','shadows/generic_small_wide.png','shadows/generic_medium_round.png','shadows/generic_medium_wide.png']
assets=[]
for rel in chosen:
 f=BASE/'assets'/rel
 assert f.is_file(),f
 meta=f.with_suffix('.json')
 if '__main' in f.stem:meta=f.with_name(f.stem.replace('__main','')+'.json')
 url='data:'+(mimetypes.guess_type(str(f))[0] or 'image/png')+';base64,'+base64.b64encode(f.read_bytes()).decode('ascii')
 assets.append(dict(path='assets/'+rel,relPath=rel,name=f.name,category=rel.split('/')[0],meta=json.loads(meta.read_text('utf-8')) if meta.exists() else {},mtime=1,url=url))
# Simulate future PNG+JSON sidecar automatically discovered during "Neu einlesen".
sidecar={
 'id':'rock_sidecar_test_01','description':'Sidecar Import', 'sourceReference':'example.png',
 'family':'rocks','kind':'rock','sizeClass':'small','logicalWidth':42,'scaleMin':.9,'scaleMax':1.1,
 'anchor':{'x':.5,'y':.95},'shadow':{'mode':'generic_small_wide','path':''},
 'allowedTerrainTypes':['grassland'],'placement':{'weight':1,'density':.4,'minSpacing':20,'canCluster':False,'edgeMargin':10},
 'artStatus':'test','tags':[]}
for a in assets:
 if a['relPath']=='nature/rock_01.svg':a['meta']={'assetType':'nature_sprite','relPath':a['relPath'],'data':sidecar}
html=(BASE/'index.html').read_text('utf-8')
html=html.replace('<link rel="stylesheet" href="style.css?v=0.9.0">','<style>'+(BASE/'style.css').read_text('utf-8')+'</style>')
script='''<script>
window.__apiAssets=ASSETS;
window.__terrain=TC;
window.__nature={schemaVersion:1,revision:0,entries:{}};
window.fetch=async (path,opt={})=>{
  let result={};const method=opt.method||'GET';
  if(path==='/api/assets')result={assets:window.__apiAssets,version:'0.9.0'};
  else if(path==='/api/terrain-catalog'){
    if(method==='POST')window.__terrain=JSON.parse(opt.body);
    result=window.__terrain;
  }else if(path==='/api/nature-catalog'){
    if(method==='POST')window.__nature=JSON.parse(opt.body);
    result=window.__nature;
  }else return new Response('{}',{status:404});
  return new Response(JSON.stringify(result),{status:200,headers:{'Content-Type':'application/json'}});
};
</script>'''.replace('TC',json.dumps(json.loads((BASE/'assets/terrain/terrain_catalog.json').read_text('utf-8')))).replace('ASSETS',json.dumps(assets))
for name in ('catalog','autotile','nature_catalog','app','nature-ui'):
 html=html.replace(f'<script src="{name}.js?v=0.9.0"></script>','<script>'+(BASE/f'{name}.js').read_text('utf-8')+'</script>')
html=html.replace('<script>/* Vedras terrain registry',script+'<script>/* Vedras terrain registry')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1500,'height':950})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('about:blank');page.set_content(html,wait_until='load',timeout=45000);page.wait_for_timeout(1400)
 print('status',page.locator('#serverStatus').inner_text(),page.locator('#nCatalogState').inner_text())
 print('errors',errors)
 assert not errors,errors
 assert page.evaluate('window.__nature.entries["nature/rock_01.svg"].id')=='rock_sidecar_test_01'
 page.locator('#assetSearch').fill('pine_01')
 page.locator('.asset-card').first.click()
 assert not page.locator('#natureInspector').evaluate('(e)=>e.classList.contains("hidden")')
 page.locator('#nId').fill('pine_test_01');page.locator('#nFamily').fill('conifers')
 page.locator('#nSource').fill('User reference sheet 01');page.locator('#nDescription').fill('Ein Nadelbaum')
 page.locator('#nKind').select_option('tree')
 page.locator('#nBiomes input[value="grassland"]').check()
 page.locator('#nDensity').fill('0.88')
 page.locator('#nSave').click();page.wait_for_timeout(850)
 print('message',page.locator('#nMessage').inner_text())
 assert page.evaluate('window.__nature.entries["nature/pine_01.svg"].id')=='pine_test_01'
 page.locator('#reloadBtn').click();page.wait_for_timeout(900)
 assert page.locator('#nId').input_value()=='pine_test_01'
 page.locator('#nAddToHex').click();page.wait_for_timeout(150)
 print('instances',page.evaluate('window.VedrasAssetLabor.state.natureInstances'))
 assert page.evaluate('window.VedrasAssetLabor.state.natureInstances.length')==1
 page.locator('#nAddToHex').click();page.wait_for_timeout(150)
 assert page.evaluate('window.VedrasAssetLabor.state.natureInstances.length')==2
 offsets=page.evaluate('window.VedrasAssetLabor.state.natureInstances.map(n=>[n.dx,n.dy])')
 assert offsets[0]!=offsets[1], offsets
 page.locator('#nClearHex').click();page.wait_for_timeout(100)
 assert page.evaluate('window.VedrasAssetLabor.state.natureInstances.length')==0
 page.locator('#sceneSize').select_option('19')
 page.locator('#nPopulate').click();page.wait_for_timeout(1000)
 print('generated',page.evaluate('window.VedrasAssetLabor.state.natureInstances.length'))
 assert not errors,errors
 page.locator('#nId').scroll_into_view_if_needed()
 page.screenshot(path=str(BASE/'previews/v09_nature_lab.png'),full_page=True)
 print('PASS browser nature editor and placements')
 browser.close()
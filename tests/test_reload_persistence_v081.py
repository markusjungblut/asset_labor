"""Regression: re-reading file list never resets catalog assignments, even before autosave."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
import base64, io, json

BASE=Path(__file__).resolve().parents[1]
catalog=json.loads((BASE/'assets/terrain/terrain_catalog.json').read_text('utf-8'))

def png_data(rgb):
    stream=io.BytesIO();Image.new('RGB',(72,72),rgb).save(stream,'PNG')
    return 'data:image/png;base64,'+base64.b64encode(stream.getvalue()).decode('ascii')
assets=[]
for name,rgb,typeid in [('forest_01.png',(36,100,55),'forest_floor'),('tundra_base_01.png',(136,156,96),'tundra'),('plains_handpainted_01.png',(107,158,72),'grassland')]:
    rel='terrain/'+name
    assets.append({'path':'assets/'+rel,'relPath':rel,'name':name,'category':'terrain','mtime':1,'meta':{'assetType':'terrain_base','terrainTypeId':typeid,'textureWorldSize':256},'url':png_data(rgb)})
html=(BASE/'index.html').read_text('utf-8')
html=html.replace('<link rel="stylesheet" href="style.css?v=0.8.1">','<style>'+(BASE/'style.css').read_text('utf-8')+'</style>')
for name in ('catalog','autotile','app'):
    html=html.replace(f'<script src="{name}.js?v=0.8.1"></script>','<script>'+(BASE/f'{name}.js').read_text('utf-8')+'</script>')
mock='''<script>
window.__as = __ASSETS__;
window.__server = __CATALOG__;
window.__postCount=0;window.__failPosts=false;
window.fetch=async (path, options={}) => {
  if(path==='/api/assets')return new Response(JSON.stringify({assets:window.__as,version:'0.8.1'}),{status:200});
  if(path==='/api/terrain-catalog' && (options.method||'GET')==='GET')return new Response(JSON.stringify(window.__server),{status:200});
  if(path==='/api/terrain-catalog' && options.method==='POST'){
    window.__postCount++;
    // Allow UI mutations or refresh to overlap a pending POST.
    await new Promise(done=>setTimeout(done,130));
    if(window.__failPosts)return new Response(JSON.stringify({error:'simulated failure'}),{status:500});
    window.__server=JSON.parse(options.body);
    return new Response(JSON.stringify({saved:true}),{status:200});
  }
  return new Response('{}',{status:404});
};
</script>'''.replace('__ASSETS__',json.dumps(assets)).replace('__CATALOG__',json.dumps(catalog))
html=html.replace('<script src=', mock+'\n<script src=', 1) if '<script src=' in html else html.replace('<script>/* Vedras',mock+'\n<script>/* Vedras',1)
# Above replacement runs after inline scripts; insert before the first actual inline script in HTML.
if mock not in html:
    html=html.replace('<script>',mock+'\n<script>',1)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1400,'height':860})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('about:blank')
    page.set_content(html,wait_until='load',timeout=45000)
    page.wait_for_function('window.VedrasAssetLabor && window.VedrasAssetLabor.assets().length===3')
    assert not errors,errors
    # Change an already assigned graphic, then immediately click "Neu einlesen".
    forest=page.evaluate('''() => window.VedrasAssetLabor.assets().find(x=>x.name==='forest_01.png').path''')
    page.evaluate('''(path)=>{
      const a=window.VedrasAssetLabor.assets().find(x=>x.path===path);
      window.VedrasAssetLabor.state.asset=path;
      document.querySelector('#catalogImportInput').value='';
      document.getElementById('assetTerrainType').value='tundra';
      document.getElementById('assetTerrainType').dispatchEvent(new Event('change',{bubbles:true}));
    }''',forest)
    page.locator('#reloadBtn').click()
    page.wait_for_function('window.__server.assets["terrain/forest_01.png"].terrainTypeId==="tundra"',timeout=10000)
    page.wait_for_timeout(300)
    assert page.evaluate('''() => window.VedrasAssetLabor.catalog().assets['terrain/forest_01.png'].terrainTypeId''')=='tundra'
    assert page.evaluate('''() => window.__server.assets['terrain/forest_01.png'].terrainTypeId''')=='tundra'
    page.locator('#reloadBtn').click();page.wait_for_timeout(300)
    assert page.evaluate('''() => window.VedrasAssetLabor.catalog().assets['terrain/forest_01.png'].terrainTypeId''')=='tundra'
    # Create a category, refresh before the debounce, keep both new and original catalog associations.
    page.locator('.catalog-panel details').first.evaluate('(el)=>el.open=true')
    page.locator('#newCategoryName').fill('Lava')
    page.locator('#newCategoryId').fill('lava_regions')
    page.locator('#newCategoryBtn').click()
    page.locator('#reloadBtn').click()
    page.wait_for_function('window.__server.categories.some(x=>x.id==="lava_regions")')
    assert page.evaluate('''() => window.VedrasAssetLabor.catalog().categories.some(x=>x.id==='lava_regions')''')
    assert page.evaluate('''() => window.VedrasAssetLabor.catalog().assets['terrain/forest_01.png'].terrainTypeId''')=='tundra'
    # Simulated failed server save MUST NOT remove the local change on refresh.
    page.evaluate('window.__failPosts=true')
    
    page.evaluate('''() => {window.VedrasAssetLabor.state.asset='assets/terrain/tundra_base_01.png';document.getElementById('assetTerrainType').value='snowfields';document.getElementById('assetTerrainType').dispatchEvent(new Event('change',{bubbles:true}));}''')
    page.locator('#reloadBtn').click();page.wait_for_timeout(400)
    assert page.evaluate('''() => window.VedrasAssetLabor.catalog().assets['terrain/tundra_base_01.png'].terrainTypeId''')=='snowfields'
    assert page.evaluate('''() => window.__server.assets['terrain/tundra_base_01.png'].terrainTypeId''')=='tundra'
    # Recover with explicit save and verify next refresh.
    page.evaluate('window.__failPosts=false')
    page.locator('#catalogSave').click()
    page.wait_for_function('window.__server.assets["terrain/tundra_base_01.png"].terrainTypeId==="snowfields"')
    page.locator('#reloadBtn').click();page.wait_for_timeout(200)
    assert page.evaluate('''() => window.VedrasAssetLabor.catalog().assets['terrain/tundra_base_01.png'].terrainTypeId''')=='snowfields'
    assert not errors,errors
    print('PASS v0.8.1 reload: immediate refresh, autosave, second refresh, category, failed save, recovery')
    browser.close()
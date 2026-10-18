"""Render the local asset lab in sandboxed Playwright without navigating to blocked URLs.
All image files become in-memory data URLs, HTML/CSS/JS are inlined into about:blank.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,json,mimetypes,re
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text();css=(BASE/'style.css').read_text();js=(BASE/'app.js').read_text();auto=(BASE/'autotile.js').read_text()
urls={}
for p in (BASE/'assets').rglob('*'):
 if p.suffix.lower() not in ['.png','.jpg','.webp','.svg','.jpeg','.avif','.gif']:continue
 rel='assets/'+p.relative_to(BASE/'assets').as_posix();mime=mimetypes.guess_type(str(p))[0] or 'application/octet-stream'
 urls[rel]='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode('ascii')
js=js.replace('const fallbackAssets=[','const URLS='+json.dumps(urls)+';\nconst fallbackAssets=[')
js=js.replace('meta:{},bytes:0,mtime:0}));',"meta:{},bytes:0,mtime:0,url:URLS['assets/'+x]}));")
assert 'url:URLS' in js
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('<script src="autotile.js"></script><script src="app.js"></script>','<script>'+auto+'</script><script>'+js+'</script>')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for viewport,name in [({'width':1580,'height':920},'preview_desktop.png'),({'width':390,'height':844},'preview_mobile.png')]:
  page=b.new_page(viewport=viewport,device_scale_factor=2);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('about:blank');page.set_content(html,wait_until='load');page.wait_for_timeout(1400)
  print(name,'status',page.locator('#serverStatus').inner_text(), 'cards',page.locator('.asset-card').count(),'errors',errors)
  print('canvas',page.evaluate("()=>({width:document.querySelector('#mapCanvas').width,height:document.querySelector('#mapCanvas').height,dpr:window.VedrasAssetLabor.state.dpr})"))
  page.screenshot(path=str(BASE/name),full_page=True)
  assert not errors,errors
  assert page.locator('.asset-card').count()>=13
  if name=='preview_desktop.png':
   # switching an asset, comparing, zooming, choosing a scene size
   page.locator('.asset-card').filter(has_text='forest_01').click();page.locator('#placeHex').click();page.locator('#setA').click();
   page.locator('.asset-card').filter(has_text='plains_01').click();page.locator('#setB').click()
   print('compare',page.locator('#comparePane').is_visible(),page.locator('#compareALabel').inner_text(),page.locator('#compareBLabel').inner_text());page.screenshot(path=str(BASE/'preview_compare.png'),full_page=True)
   page.locator('#viewMap').click();page.locator('#zoomSlider').fill('190');page.locator('#gridToggle').check();page.locator('#sceneSize').select_option('19');page.wait_for_timeout(250)
   print('zoom',page.locator('#zoomText').inner_text(),'scene',page.evaluate('()=>window.VedrasAssetLabor.state.sceneSize'),'errors',errors)
   page.screenshot(path=str(BASE/'preview_zoom.png'),full_page=True)
   assert page.evaluate('()=>window.VedrasAssetLabor.state.sceneSize')==19
  page.close()
 b.close()
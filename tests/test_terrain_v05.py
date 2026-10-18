"""Terrain-regression checks in sandboxed Playwright without navigating to local URLs.
Inject assets as in-memory data URIs; the actual local launcher is otherwise unchanged.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,json,mimetypes
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text();css=(BASE/'style.css').read_text();js=(BASE/'app.js').read_text();auto=(BASE/'autotile.js').read_text()
urls={}
for f in (BASE/'assets').rglob('*'):
 if f.suffix.lower() not in ['.png','.jpg','.jpeg','.webp','.svg','.avif','.gif']:continue
 rel='assets/'+f.relative_to(BASE/'assets').as_posix();mime=mimetypes.guess_type(str(f))[0] or 'application/octet-stream'
 urls[rel]='data:'+mime+';base64,'+base64.b64encode(f.read_bytes()).decode()
js=js.replace('const fallbackAssets=[','const URLS='+json.dumps(urls)+';\nconst fallbackAssets=[')
js=js.replace('meta:{},bytes:0,mtime:0}));',"meta:{},bytes:0,mtime:0,url:URLS['assets/'+x]}));")
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('<script src="autotile.js"></script><script src="app.js"></script>','<script>'+auto+'</script><script>'+js+'</script>')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1600,'height':950},device_scale_factor=2)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('about:blank');page.set_content(html,wait_until='load');page.wait_for_timeout(1600)
 print('Status',page.locator('#serverStatus').inner_text(),'cards',page.locator('.asset-card').count())
 assert page.locator('.asset-card').count()>=19
 results=page.evaluate('''() => {
   const v=window.VedrasAssetLabor;
   const all=v.assets();const good=all.find(a=>a.name==='desert_rocky_base_01.png');
   const bad=all.find(a=>a.name==='concept_hexblock_NOT_TERRAIN.png');
   return {good:good.terrainCheck,badSample:v.inspectTerrain({category:'terrain',meta:{},img:bad.img}),zoom:v.state.zoom};
 }''')
 print('Analysis:',results)
 assert results['good']['ok'] and not results['badSample']['ok']
 page.locator('.asset-card').filter(has_text='desert_rocky_base_01.png').click()
 assert 'geeignetes Bildformat' in page.locator('#terrainValidation').inner_text()
 page.locator('#repeatTest').click();page.wait_for_timeout(500)
 repeat=page.evaluate('''() => ({count:window.VedrasAssetLabor.state.sceneSize,
    assigned:Object.keys(window.VedrasAssetLabor.state.hexTerrain).length,
    objects:window.VedrasAssetLabor.state.objects,river:window.VedrasAssetLabor.state.river})''')
 print('Repeat:',repeat);assert repeat['count']==19 and repeat['assigned']==19 and not repeat['objects'] and not repeat['river']
 page.screenshot(path=str(BASE/'preview_terrain_repeat.png'),full_page=True)
 before=page.evaluate('''() => window.VedrasAssetLabor.toScreen(256,0).x - window.VedrasAssetLabor.toScreen(0,0).x''')
 page.locator('#materialScale').fill('512');page.wait_for_timeout(180)
 after=page.evaluate('''() => window.VedrasAssetLabor.toScreen(256,0).x - window.VedrasAssetLabor.toScreen(0,0).x''')
 assert abs(before-after)<.01
 page.locator('#seamCheckToggle').check();page.locator('#gridToggle').check();page.wait_for_timeout(120)
 gap=page.evaluate('''() => {
 const v=window.VedrasAssetLabor;
 const c=document.querySelector('#mapCanvas');const ctx=c.getContext('2d');
 const midpoint=v.toScreen(128,0),r=v.state.dpr,p=ctx.getImageData(Math.round(midpoint.x*r),Math.round(midpoint.y*r),1,1).data;
 return {rgba:[...p],x:midpoint.x,y:midpoint.y};
 }''')
 print('Seam sample:',gap)
 assert not (gap['rgba'][0]>220 and gap['rgba'][1]<90 and gap['rgba'][2]>180),'Magenta visible at interior shared hex seam'
 page.screenshot(path=str(BASE/'preview_terrain_geometry.png'),full_page=True)
 # Multiple independent material variants can be distributed deterministically with exact shared hex geometry.
 page.locator('#gridToggle').uncheck();page.locator('#seamCheckToggle').uncheck()
 page.locator('#variationTest').click();page.wait_for_timeout(180)
 variants=page.evaluate('''() => [...new Set(Object.values(window.VedrasAssetLabor.state.hexTerrain))].length''')
 print('Variation count:',variants);assert variants>=3
 page.screenshot(path=str(BASE/'preview_terrain_variants.png'),full_page=True)
 page.locator('.asset-card').filter(has_text='concept_hexblock_NOT_TERRAIN.png').click()
 assert page.locator('#placeHex').is_disabled()
 page.screenshot(path=str(BASE/'preview_asset_warning.png'),full_page=True)
 assert not errors,errors
 print('PASS:', 'no runtime errors; world hex centers unaffected by material scale; unsuitable assets flagged; no gap at center seam')
 b.close()
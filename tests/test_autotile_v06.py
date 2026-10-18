"""Independent Playwright validation with inlined assets and scripts, no local-web navigation.
Validates edge-neighbor symmetry, triple junction detection, and slider/zoom/preview behavior.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,json,mimetypes
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text();css=(BASE/'style.css').read_text()
js=(BASE/'app.js').read_text();auto=(BASE/'autotile.js').read_text()
urls={};meta={}
for p in (BASE/'assets').rglob('*'):
 if p.suffix.lower() not in ('.png','.jpg','.webp','.svg','.jpeg','.avif','.gif'):continue
 rel=p.relative_to(BASE/'assets').as_posix();mime=mimetypes.guess_type(str(p))[0] or 'application/octet-stream'
 urls['assets/'+rel]='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode('ascii')
 side=p.with_suffix('.json')
 if p.stem.endswith('__main'):side=p.with_name(p.stem.replace('__main','')+'.json')
 if side.exists():
  try:meta[rel]=json.loads(side.read_text('utf-8'))
  except ValueError:pass
js=js.replace('const fallbackAssets=[','const URLS='+json.dumps(urls)+';\nconst META='+json.dumps(meta)+';\nconst fallbackAssets=[')
js=js.replace('meta:{},bytes:0,mtime:0}));',"meta:META[x]||{},bytes:0,mtime:0,url:URLS['assets/'+x]}));")
assert 'url:URLS' in js
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('<script src="autotile.js"></script><script src="app.js"></script>', '<script>'+auto+'</script><script>'+js+'</script>')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1580,'height':930},device_scale_factor=1.5)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('about:blank');page.set_content(html,wait_until='load');page.wait_for_timeout(900)
 print('LOADED',page.locator('#serverStatus').inner_text())
 page.locator('#transitionTest').click();page.wait_for_timeout(1700)
 graph=page.evaluate('''() => {
 const graph=window.VedrasAssetLabor.autotile();
 return {edges:graph.seams.length,directed:graph.directed.length,corners:graph.corners.length,
     pairs:graph.seams.map(s=>s.edgeId), biomePairs:graph.seams.map(s=>[s.c.q,s.c.r,s.n.q,s.n.r])}; }''')
 print('TRANSITIONS',graph['edges'],graph['directed'],graph['corners'],'ERRORS',errors)
 assert graph['edges']>0 and graph['directed']==graph['edges']*2
 assert len(graph['pairs'])==len(set(graph['pairs']))
 assert page.locator('#edgeBlendToggle').is_checked()
 page.screenshot(path=str(BASE/'preview_autotile_grass_dry.png'),full_page=True)
 # Transition must not recolor the interior of a cell. Compare real rendered pixels.
 sample_js="""() => {
  const v=window.VedrasAssetLabor,p=v.toScreen(-256,0),c=document.querySelector('#mapCanvas');
  const x=Math.round(p.x*v.state.dpr),y=Math.round(p.y*v.state.dpr);
  return [...c.getContext('2d').getImageData(x,y,1,1).data];
 }"""
 color_on=page.evaluate(sample_js)
 page.locator('#edgeBlendToggle').uncheck();page.wait_for_timeout(180)
 color_off=page.evaluate(sample_js)
 print('INTERIOR-CHECK',color_on,color_off)
 assert color_on==color_off, (color_on,color_off)
 page.locator('#edgeBlendToggle').check();page.wait_for_timeout(240)
 page.locator('#edgeDebugToggle').check();page.locator('#edgeWidth').fill('12');page.wait_for_timeout(750)
 assert page.locator('#edgeWidthText').inner_text()=='12'
 page.screenshot(path=str(BASE/'preview_autotile_debug.png'),full_page=True)
 page.locator('#cornerTest').click();page.wait_for_timeout(1050)
 tri=page.evaluate('''() => window.VedrasAssetLabor.autotile().corners.length''')
 print('TRIPLE',tri,'ERRORS',errors)
 assert tri>=1
 page.screenshot(path=str(BASE/'preview_autotile_three_biomes.png'),full_page=True)
 page.locator('#gridToggle').check();page.locator('#zoomSlider').fill('152');page.wait_for_timeout(700)
 assert page.locator('#zoomText').inner_text()=='152 %'
 assert not errors,errors
 page.screenshot(path=str(BASE/'preview_autotile_zoom.png'),full_page=True)
 # Explicitly verify optional same-biome texture-variant blending.
 page.locator('.asset-card').filter(has_text='desert_rocky_base_01.png').click()
 page.locator('#variationTest').click();page.wait_for_timeout(800)
 vargraph=page.evaluate("() => ({seams:window.VedrasAssetLabor.autotile().seams.map(s=>({kind:s.kind}))})")
 print('VARIANT-BLEND',len(vargraph['seams']))
 assert page.locator('#blendVariantsToggle').is_checked()
 assert any(s['kind']=='variant' for s in vargraph['seams'])
 page.screenshot(path=str(BASE/'preview_autotile_variants.png'),full_page=True)
 mobile=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
 mobile.on('pageerror',lambda e:errors.append(str(e)))
 mobile.goto('about:blank');mobile.set_content(html,wait_until='load');mobile.wait_for_timeout(800)
 mobile.locator('#transitionTest').click();mobile.wait_for_timeout(1300)
 mobile.screenshot(path=str(BASE/'preview_autotile_mobile.png'),full_page=True)
 assert not errors,errors
 print('PASS',len(urls),'assets')
 b.close()
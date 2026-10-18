"""Autotiling v0.7: mixed-material seams, triple junctions, debug and 240%-zoom.
Runs headlessly without a network server. Existing tests remain separately runnable.
"""
from pathlib import Path
import base64, json, mimetypes
from playwright.sync_api import sync_playwright

BASE = Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text('utf-8')
css=(BASE/'style.css').read_text('utf-8')
js=(BASE/'app.js').read_text('utf-8')
auto=(BASE/'autotile.js').read_text('utf-8')
urls,meta={},{}
for f in (BASE/'assets').rglob('*'):
    if f.suffix.lower() not in ('.png','.jpg','.jpeg','.webp','.svg','.avif','.gif'):
        continue
    rel=f.relative_to(BASE/'assets').as_posix()
    mime=mimetypes.guess_type(str(f))[0] or 'application/octet-stream'
    urls['assets/'+rel]='data:'+mime+';base64,'+base64.b64encode(f.read_bytes()).decode()
    side=f.with_suffix('.json')
    if f.stem.endswith('__main'):
        side=f.with_name(f.stem.replace('__main','')+'.json')
    if side.exists():
        meta[rel]=json.loads(side.read_text('utf-8'))
js=js.replace('const fallbackAssets=[', 'const URLS='+json.dumps(urls)+';\nconst META='+json.dumps(meta)+';\nconst fallbackAssets=[')
js=js.replace('meta:{},bytes:0,mtime:0}));',"meta:META[x]||{},bytes:0,mtime:0,url:URLS['assets/'+x]}));")
assert 'url:URLS' in js
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('<script src="autotile.js"></script><script src="app.js"></script>', '<script>'+auto+'</script><script>'+js+'</script>')

with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=b.new_page(viewport={'width':1580,'height':950},device_scale_factor=1.5)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('about:blank')
    page.set_content(html,wait_until='load')
    page.wait_for_timeout(400)
    assert page.locator('#serverStatus').inner_text().startswith('21/21')

    # All faces use the same world-space material. The shared edges cannot
    # introduce a second antialias pass, because the terrain is one bitmap.
    page.locator('#flatTest').click()
    page.wait_for_timeout(400)
    sample=page.evaluate('''() => {
      const s=window.VedrasAssetLabor.state, graph=window.VedrasAssetLabor.autotile();
      return {cells:s.sceneSize, seams:graph.seams.length, grid:s.grid,
         blend:s.edgeBlend,variants:s.blendVariants,zoom:s.zoom,
         raster:window.__vedrasTerrainRaster && {density:window.__vedrasTerrainRaster.density,
           width:window.__vedrasTerrainRaster.canvas.width,
           height:window.__vedrasTerrainRaster.canvas.height}};
    }''')
    print('SAME MATERIAL',sample)
    assert sample['cells']==19 and sample['seams']==0 and sample['blend'] and sample['variants']
    page.screenshot(path=str(BASE/'preview_v07_seamless_grass.png'),full_page=True)
    page.locator('#transitionTest').click()
    page.wait_for_timeout(250)
    assert page.evaluate('window.VedrasAssetLabor.autotile().seams.length')>0
    print('RASTER STATS',page.locator('#autotileStats').inner_text())
    page.screenshot(path=str(BASE/'preview_v07_biome_transition.png'),full_page=True)
    page.locator('#edgeIrregularity').fill('11')
    assert page.locator('#irregularityText').inner_text()=='11'
    page.locator('#transitionDebugMode').select_option('weights')
    page.locator('#edgeDebugToggle').check()
    page.wait_for_timeout(300)
    page.screenshot(path=str(BASE/'preview_v07_debug_masks.png'),full_page=True)
    page.locator('#cornerTest').click()
    page.wait_for_timeout(250)
    assert page.evaluate('window.VedrasAssetLabor.autotile().corners.length')>0
    page.locator('#cornerBlendToggle').uncheck()
    page.wait_for_timeout(150)
    page.locator('#cornerBlendToggle').check()
    page.wait_for_timeout(200)
    page.screenshot(path=str(BASE/'preview_v07_three_biomes.png'),full_page=True)
    page.locator('#edgeDebugToggle').uncheck()
    page.locator('#zoomSeamTest').click()
    page.wait_for_timeout(250)
    assert page.locator('#zoomText').inner_text()=='240 %'
    page.screenshot(path=str(BASE/'preview_v07_zoom_240.png'),full_page=True)

    # Artificial homogeneous textures: a shared edge must be 50/50 in one
    # raster pixel field, and a triple junction must mix all three equally.
    proof=page.evaluate('''async () => {
      const c=document.createElement('canvas');c.width=c.height=32;
      const colors=['#ff0000','#00ff00','#0000ff'];
      const refs=[];
      for (let i=0;i<3;i++){
         const g=c.getContext('2d');g.fillStyle=colors[i];g.fillRect(0,0,32,32);
         const img=new Image();img.src=c.toDataURL();await img.decode();
         refs.push({path:'test_'+i,img,meta:{textureWorldSize:256}});
      }
      const cells=[{q:0,r:0,biome:'a'}, {q:1,r:0,biome:'b'}, {q:1,r:-1,biome:'c'}];
      const raster=window.VedrasAutotile.build(cells,v=>refs[cells.indexOf(v)],v=>v.biome,
            {band:28,blendVariants:true,irregularity:0,resolution:3,cornerBlend:true});
      const g=raster.canvas.getContext('2d');
      function sample(x,y){const X=Math.round((x-raster.x)*raster.density),Y=Math.round((y-raster.y)*raster.density);
          return [...g.getImageData(X,Y,1,1).data];}
      return {edge:sample(128,0),triple:sample(128,-128/Math.sqrt(3)),interior:sample(0,0),
              width:raster.canvas.width,height:raster.canvas.height};
    }''')
    print('ANALYTIC CONTINUITY',proof)
    edge=proof['edge'];triple=proof['triple'];interior=proof['interior']
    assert abs(edge[0]-128)<15 and abs(edge[1]-128)<15 and edge[2]<18,edge
    assert all(abs(x-85)<20 for x in triple[:3]),triple
    assert interior[0]>245 and interior[1]<10 and interior[2]<10,interior
    assert edge[3]==255 and triple[3]==255
    assert not errors,errors
    print('PASS v0.7',len(urls),'loaded texture assets')
    b.close()
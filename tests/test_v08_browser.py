from pathlib import Path
from playwright.sync_api import sync_playwright
import json,base64,mimetypes
BASE=Path(__file__).resolve().parents[1]
assets=[]
for f in (BASE/'assets').rglob('*'):
 if f.suffix.lower() not in ['.png','.svg','.webp','.jpg','.jpeg']:continue
 rel=f.relative_to(BASE/'assets').as_posix()
 meta=f.with_suffix('.json')
 if '__main' in f.stem:meta=f.with_name(f.stem.replace('__main','')+'.json')
 content='data:'+(mimetypes.guess_type(str(f))[0] or 'image/png')+';base64,'+base64.b64encode(f.read_bytes()).decode('ascii')
 assets.append(dict(path='assets/'+rel,relPath=rel,name=f.name,category=rel.split('/')[0],meta=json.loads(meta.read_text('utf-8')) if meta.exists() else {},mtime=1,url=content))
catalog=json.loads((BASE/'assets/terrain/terrain_catalog.json').read_text('utf-8'))
html=(BASE/'index.html').read_text('utf-8')
html=html.replace('<link rel="stylesheet" href="style.css?v=0.8.1">','<style>'+(BASE/'style.css').read_text('utf-8')+'</style>')
inline='''<script>window.fetch=async (path,options={})=>{
 let value;
 if(path==='/api/assets')value=TEST_ASSETS;
 else if(path==='/api/terrain-catalog' && (options.method||'GET')==='GET')value=TEST_CATALOG;
 else if(path==='/api/terrain-catalog' && options.method==='POST'){TEST_CATALOG=JSON.parse(options.body);value={saved:true};}
 else return new Response('{}',{status:404});
 return new Response(JSON.stringify(value),{status:200,headers:{'Content-Type':'application/json'}});
};</script>'''.replace('TEST_ASSETS','window.__as').replace('TEST_CATALOG','window.__cat')
setup='<script>window.__as='+json.dumps({'assets':assets,'version':'0.8.1'})+';window.__cat='+json.dumps(catalog)+';</script>'
for name in ('catalog','autotile','app'):
 html=html.replace(f'<script src="{name}.js?v=0.8.1"></script>','<script>'+(BASE/f'{name}.js').read_text('utf-8')+'</script>')
html=html.replace('<script>/* Vedras terrain registry', setup+inline+'<script>/* Vedras terrain registry')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1600,'height':960},device_scale_factor=1.5)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('about:blank');page.set_content(html,wait_until='load',timeout=45000);page.wait_for_timeout(1100)
 print('status',page.locator('#serverStatus').inner_text());print('categories',page.locator('#catalogStatus').inner_text())
 print('errors',errors)
 page.screenshot(path=str(BASE/'previews/v08_first.png'))
 assert not errors,errors
 assert '7 Kategorien' in page.locator('#catalogStatus').inner_text()
 page.locator('.catalog-panel details').first.evaluate('(el)=>el.open=true')
 page.locator('#newCategoryName').fill('Vulkanische Regionen');page.locator('#newCategoryId').fill('volcanic_regions');page.locator('#newCategoryBtn').click()
 assert '8 Kategorien' in page.locator('#catalogStatus').inner_text()
 page.locator('.catalog-panel details').nth(1).evaluate('(el)=>el.open=true')
 page.locator('#newTypeCategory').select_option('volcanic_regions');page.locator('#newTypeName').fill('Lavafeld');page.locator('#newTypeId').fill('lava_field');page.locator('#newTypeBtn').click()
 assert '24 Arten' in page.locator('#catalogStatus').inner_text()
 page.locator('#catalogSave').click();page.wait_for_timeout(200)
 assert page.evaluate('window.__cat.terrainTypes.some(x=>x.id==="lava_field")')
 # assets assign - one of the current grass materials is known grassland
 grass=page.evaluate("window.VedrasAssetLabor.assets().find(x=>x.name==='plains_handpainted_01.png').path")
 assert page.evaluate('(path)=>{const a=window.VedrasAssetLabor.assets().find(x=>x.path===path);return window.VedrasAssetLabor.typeOfAsset(a)}',grass)=='grassland'
 # If tundra texture is missing metadata, don't auto-detect by name
 page.evaluate("window.VedrasCatalog.assign(window.VedrasAssetLabor.catalog(),window.VedrasAssetLabor.assets().find(x=>x.name==='forest_01.png'),'tundra')")
 assert page.evaluate("window.VedrasAssetLabor.typeOfAsset(window.VedrasAssetLabor.assets().find(x=>x.name==='forest_01.png'))")=='tundra'
 # Same-terrain family has four Tundra variants, distinct from frozen tundra/grassland.
 checks=page.evaluate('''() => {
  const C=window.VedrasAssetLabor.catalog(),as=window.VedrasAssetLabor.assets();
  const tundra=as.filter(a=>window.VedrasAssetLabor.typeOfAsset(a)==='tundra');
  const frozen=as.filter(a=>window.VedrasAssetLabor.typeOfAsset(a)==='frozen_tundra');
  return {tundra:tundra.length,frozen:frozen.length,
   cross:window.VedrasCatalog.profile(C,'tundra','grassland').mode,
   same:window.VedrasCatalog.profile(C,'tundra','tundra').mode,
   water:window.VedrasCatalog.profile(C,'coast','grassland').mode};
}''')
 print('types',checks)
 assert checks=={'tundra':5,'frozen':4,'cross':'soft_ground','same':'variant','water':'shoreline_required'}
 tundrapath=page.evaluate("window.VedrasAssetLabor.assets().find(x=>x.name==='tundra_base_01.png').path")
 page.evaluate('''(p)=>window.VedrasAssetLabor.state.asset=p''',tundrapath)
 page.locator('#variationTest').click();page.wait_for_timeout(650)
 kinds=page.evaluate("window.VedrasAssetLabor.autotile().seams.map(x=>x.kind)")
 assert kinds and all(k=='variant' for k in kinds),kinds
 page.screenshot(path=str(BASE/'previews/v08_tundra_variants.png'))
 # two biomes vs different variants
 page.locator('#transitionTest').click();page.wait_for_timeout(700)
 graph=page.evaluate('''() => {const g=window.VedrasAssetLabor.autotile();return {seams:g.seams.length,kind:g.seams.map(e=>e.kind),raster:!!window.__vedrasTerrainRaster}}''')
 print('transition',graph)
 assert graph['raster'] and graph['seams']>0
 page.locator('#cornerTest').click();page.wait_for_timeout(500)
 page.screenshot(path=str(BASE/'previews/v08_corner.png'))
 # Shared geometric raster probe: known constant colors, two-way and three-way seam.
 numeric=page.evaluate('''async () => {
  const color=['#ff0000','#00ff00','#0000ff'],materials=[];
  for(let i=0;i<3;i++){const cv=document.createElement('canvas');cv.width=cv.height=32;
   const c=cv.getContext('2d');c.fillStyle=color[i];c.fillRect(0,0,32,32);
   const img=new Image();img.src=cv.toDataURL();await img.decode();
   materials.push({path:'probe'+i,img,meta:{textureWorldSize:256}});}
  const cells=[{q:0,r:0,type:'grassland'},{q:1,r:0,type:'tundra'},{q:1,r:-1,type:'dry_ground'}];
  const raster=window.VedrasAutotile.build(cells,c=>materials[cells.indexOf(c)],c=>c.type,
    {band:28,irregularity:0,blendVariants:false,blend:true,resolution:2,cornerBlend:true,transitionMode:()=> 'soft_ground'});
  const g=raster.canvas.getContext('2d');
  function colorAt(x,y){return [...g.getImageData(Math.floor((x-raster.x)*raster.density),Math.floor((y-raster.y)*raster.density),1,1).data];}
  return {edge:colorAt(128,45),triple:colorAt(128,-256/(2*Math.sqrt(3))),core:colorAt(0,0)};
}''')
 print('numeric',numeric)
 assert abs(numeric['edge'][0]-numeric['edge'][1])<=6,numeric
 assert abs(numeric['triple'][0]-numeric['triple'][1])<=6 and abs(numeric['triple'][1]-numeric['triple'][2])<=6,numeric
 assert numeric['core'][0]>=250 and numeric['core'][1]<=5,numeric
 print('errors after',errors)
 assert not errors,errors
 print('PASS browser v0.8')
 b.close()
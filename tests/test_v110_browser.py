"""Offline regression: accessible drawers, 37 hex, nature planner and auto sizing."""
from pathlib import Path
from io import BytesIO
import base64, json
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
B=Path(__file__).resolve().parents[1]
html=(B/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="style.css?v=0.12.0">','<style>'+(B/'style.css').read_text()+'</style>')
for f in ['catalog','terrain-source-rules','autotile','nature_catalog','sprite-planner','existing-asset-rules','forest','relief','shoreline','river','mountain','app','nature-ui','ui-organizer','forest-ui','river-ui']:
    html=html.replace(f'<script src="{f}.js?v=0.11.0"></script>','<script>'+(B/(f+'.js')).read_text()+'</script>')
    html=html.replace(f'<script src="{f}.js?v=0.12.0"></script>','<script>'+(B/(f+'.js')).read_text()+'</script>')
    html=html.replace(f'<script src="{f}.js?v=0.12.1"></script>','<script>'+(B/(f+'.js')).read_text()+'</script>')
    html=html.replace(f'<script src="{f}.js?v=0.14.0"></script>','<script>'+(B/(f+'.js')).read_text()+'</script>')
    html=html.replace(f'<script src="{f}.js?v=0.14.1"></script>','<script>'+(B/(f+'.js')).read_text()+'</script>')
    html=html.replace(f'<script src="{f}.js?v=0.15.0"></script>','<script>'+(B/(f+'.js')).read_text()+'</script>')
def png(im):
    b=BytesIO();im.save(b,format='PNG');return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
land=Image.new('RGB',(80,80),(95,147,77))
water=Image.new('RGB',(80,80),(45,115,155))
tree=Image.new('RGBA',(96,160),(0,0,0,0));d=ImageDraw.Draw(tree);d.polygon([(49,4),(85,103),(60,142),(24,137),(10,91)],fill=(37,117,55,255))
shrub=Image.new('RGBA',(90,90),(0,0,0,0));ImageDraw.Draw(shrub).ellipse((6,6,83,84),fill=(62,110,49,255))
assets=[dict(path='assets/'+path,relPath=path,name=path.split('/')[-1],category=cat,meta={},bytes=150,mtime=1,url=png(img)) for path,cat,img in [('terrain/test_grass.png','terrain',land),('terrain/test_water.png','terrain',water),('nature/birke1.png','nature',tree),('nature/thymian_01.png','nature',shrub)]]
mock='''<script>
const TEST_ASSETS=ASSETS;
window.fetch=async(path,opts={})=>{
const T=VedrasCatalog.starter();T.assets['terrain/test_grass.png']={terrainTypeId:'grassland',variantFamilyId:'grassland_base'};T.assets['terrain/test_water.png']={terrainTypeId:'ocean',variantFamilyId:'ocean_base'};
const N={schemaVersion:1,revision:0,presets:{},entries:{}};
let o={};if(path==='/api/assets')o={assets:TEST_ASSETS,version:'0.11.0'};
else if(path==='/api/terrain-catalog')o=T;
else if(path==='/api/nature-catalog')o=N;
else if(path==='/api/nature-catalog-backup')return new Response('{}',{status:404});
else if(path==='/api/nature-catalog'&&opts.method==='POST')o={ok:true};
else return new Response('{}',{status:404});
return new Response(JSON.stringify(o),{status:200});};
</script>'''.replace('=ASSETS;','='+json.dumps(assets)+';')
html=html.replace('<script>',mock+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=b.new_page(viewport={'width':1520,'height':900},accept_downloads=True)
 page.on('dialog',lambda d:d.accept())
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded',timeout=30000)

 try: page.wait_for_function('window.VedrasAssetLabor && window.VedrasNature && window.VedrasSpritePlanner',timeout=5000)
 except Exception as e:
  print('INIT ERR',errors,'scriptCount=',page.evaluate('document.scripts.length'),'loaded=',page.evaluate('Object.keys(window).filter(x=>x.startsWith(\"Vedras\"))'));raise
 page.wait_for_function('VedrasAssetLabor.assets().length===4 && VedrasNature.entryFor(VedrasAssetLabor.assets().find(a=>a.name==="birke1.png"))',timeout=45000)
 s=page.evaluate('''()=>({cells:VedrasAssetLabor.cells().length,section:!!document.getElementById('drawer_natureLabTools'),planner:VedrasSpritePlanner.entries.length,imported:Object.keys(VedrasNature.catalog().entries).length})''')
 assert s['cells']==37,s
 assert s['section'] and s['planner']==11 and s['imported']==2,s
 birch=page.evaluate('''()=>{const a=VedrasAssetLabor.assets().find(x=>x.name==='birke1.png');const m=VedrasNature.entryFor(a);return {size:m.sizeClass,sizeMode:m.sizeMode,kind:m.kind,allowed:m.allowedTerrainCategories,height:m.targetHeight}}''')
 thyme=page.evaluate('''()=>{const a=VedrasAssetLabor.assets().find(x=>x.name==='thymian_01.png');const m=VedrasNature.entryFor(a);return {size:m.sizeClass,sizeMode:m.sizeMode,kind:m.kind,height:m.targetHeight}}''')
 assert birch['kind']=='tree' and birch['height']>thyme['height']*5 and thyme['kind']=='ground_cover',(birch,thyme)
 assert 'grass_pasture' in birch['allowed'],birch
 # A real candidate tagged 'needs_art_review' must be usable in the TEST scene,
 # without mutating its production artStatus (previously caused 0 instances).
 page.evaluate("""() => {
   for(const entry of Object.values(VedrasNature.catalog().entries)){
     entry.tags.push('needs_art_review');
     entry.placement.density=1;
     entry.placement.minSpacing=8;
   }
   document.getElementById('nPopulate').click();
 }""")
 distribution=page.evaluate("""() => ({
   count:VedrasAssetLabor.state.natureInstances.length,
   statuses:Object.values(VedrasNature.catalog().entries).map(x=>x.artStatus)
 })""")
 assert distribution['count']>0,distribution
 count_in_forest=page.evaluate('''() => {
   const forest=new Set(VedrasAssetLabor.cells().filter(c=>c.biome==='forest').map(c=>c.q+','+c.r));
   return VedrasAssetLabor.state.natureInstances.filter(n=>forest.has(n.q+','+n.r)).length;
 }''')
 assert count_in_forest>0, {'forestInstanceCount':count_in_forest}
 assert all(x=='candidate' for x in distribution['statuses']),distribution
 assert page.locator('#forestTools').count()==1
 assert page.locator('#riverPanel').count()==1
 assert page.locator('#riverAdd').count()==1
 assert page.locator('#riverQuickStart').count()==1
 assert page.locator('#riverPaint').count()==1
 assert page.locator('#riverClear').count()==1
 # With no WATER hex, adding a river must fail rather than invent a land mouth.
 page.evaluate("document.getElementById('riverAdd').click()")
 assert page.evaluate("VedrasAssetLabor.state.riverPaths.length")==0
 assert 'Kein erreichbares Wasserhex' in page.locator('#riverStats').inner_text()
 # The one-click test works on a virgin map: it must assign a real
 # water PNG at the edge, not silently fail or create a pretend river.
 demo=page.evaluate("""() => {
  const core=VedrasAssetLabor;
  core.state.selected='0,0';
  document.getElementById('riverQuickStart').click();
  const route=core.riverRoutes()[0];
  const last=route?.hexes.at(-1).join(',');
  const result={
   count:core.state.riverPaths.length,
   mouth:last,
   file:core.state.hexTerrain[last],
   sourceCorner:VedrasRivers.sections(route,core.cells(),
    c=>core.effectiveBiome(c)==='ocean')[0]?.corner
  };
  core.state.riverPaths=[];
  delete core.state.hexTerrain[last];
  core.invalidateTerrain();
  core.persistScene();
  return result;
 }""")
 assert demo['count']==1 and demo['file']=='assets/terrain/test_water.png',demo
 assert demo['sourceCorner'] is not None,demo
 # Manual drawing: source -> adjacent land -> actual ocean.
 route=page.evaluate("""() => {
  const core=VedrasAssetLabor;
  core.state.hexTerrain['2,0']='assets/terrain/test_water.png';
  core.state.selected='0,0';
  document.getElementById('riverPaint').click();
  core.state.selected='1,0';window.dispatchEvent(new Event('vedras:hex-selected'));
  const preview=core.state.riverDraft.length;
  core.state.selected='2,0';window.dispatchEvent(new Event('vedras:hex-selected'));
  const route=core.riverRoutes()[0];
  const result={count:core.state.riverPaths.length,route:route?.hexes,preview,draft:core.state.riverDraft};
  core.state.riverPaths=[];
  delete core.state.hexTerrain['2,0'];
  core.invalidateTerrain();core.persistScene();
  return result;
 }""")
 assert route['count']==1 and route['route']==[[0,0],[1,0],[2,0]] and route['preview']==2 and route['draft'] is None,route
 before=page.evaluate("""() => ({
  forest:VedrasAssetLabor.forestCells(),
  terrain:VedrasAssetLabor.cells().map(c=>VedrasAssetLabor.effectiveBiome(c))
 })""")
 assert len(before['forest'])==37
 assert any(c['forestClass']=='dense_forest' for c in before['forest'])
 assert any(c['forestClass']=='none' and c['edgeInfluence']>0 for c in before['forest'])
 # Forest is a per-cell overlay: assigning woodland does not modify a terrain image.
 unchanged_terrain=before['terrain'][0]
 page.evaluate("""() => {
  VedrasAssetLabor.state.selected='0,0';
  document.getElementById('forestHexDense').click();
 }""")
 forced=page.evaluate("""() => ({
  cls:VedrasAssetLabor.forestCells().find(c=>c.key==='0,0').forestClass,
  changed:VedrasAssetLabor.state.forest.overrides['0,0'],
  count:VedrasAssetLabor.state.natureInstances.length
 })""")
 assert forced['cls']=='dense_forest' and forced['changed']=='dense_forest'
 assert forced['count']>0
 page.evaluate("document.getElementById('forestMakeJungle').click()")
 jungle=page.evaluate("""() => ({
  num:VedrasAssetLabor.forestCells().filter(c=>c.jungle).length,
  target:VedrasAssetLabor.effectiveBiome(VedrasAssetLabor.cells().find(c=>c.q===0&&c.r===0)),
  forest:VedrasAssetLabor.forestCells().find(c=>c.key==='0,0').forestClass
 })""")
 assert jungle['num']>=1 and jungle['num']<=7,jungle
 assert jungle['target']=='jungle' and jungle['forest']=='dense_forest',jungle
 page.evaluate("document.getElementById('forestClearJungle').click()")
 assert page.evaluate("VedrasAssetLabor.forestCells().filter(c=>c.jungle).length")==0

 assert page.locator('#nSizeMode').count()==1
 assert page.locator('.lab-accordion').count()>=6
 page.locator('#quick37').click()
 assert page.evaluate('VedrasAssetLabor.cells().length')==37
 page.evaluate("()=>{let x=document.getElementById('sceneSize');x.value='19';x.dispatchEvent(new Event('change',{bubbles:true}));}")
 page.wait_for_timeout(150)
 assert page.evaluate('VedrasAssetLabor.cells().length')==19
 page.evaluate("()=>{let x=document.getElementById('sceneSize');x.value='37';x.dispatchEvent(new Event('change',{bubbles:true}));}")
 page.wait_for_timeout(200)
 assert page.evaluate('VedrasAssetLabor.cells().length')==37
 page.evaluate("()=>{for(const d of document.querySelectorAll('.asset-group'))if(d.textContent.includes('birke1.png'))d.open=true;}")
 page.locator('button.asset-card').filter(has_text='birke1.png').click()
 assert page.locator('#nSizeMode').input_value()=='class'
 assert page.locator('#nSizeInfo').inner_text().startswith('Automatische Zielhöhe')
 page.locator('#shortcutMountain').click()
 assert page.locator('#drawer_mountainTools').get_attribute('open') is not None
 (B/'previews').mkdir(exist_ok=True)
 page.screenshot(path=str(B/'previews/v110_workspace_browser.png'),full_page=False)
 print('PASS',{'test':s,'birch':birch,'thyme':thyme,'errors':errors})
 assert not errors, errors
 b.close()
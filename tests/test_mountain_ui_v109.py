"""Offline Chromium regression: chains, mountain anchor .67, neighbor trees and water."""
from pathlib import Path
from io import BytesIO
import base64, json
from PIL import Image,ImageDraw
from playwright.sync_api import sync_playwright
B=Path(__file__).resolve().parents[1]
# Inline the current production modules and styles instead of depending
# on outdated versioned filenames. This also works without an HTTP server.
import re
html=(B/'index.html').read_text()
html=re.sub(r'<link rel="stylesheet" href="style\.css\?v=[^"]+">',lambda m:'<style>'+(B/'style.css').read_text()+'</style>',html)
for f in ['catalog','terrain-source-rules','autotile','nature_catalog','flora-plan','terrain-plan','sprite-planner',
          'existing-asset-rules','forest','nature-balance','relief','shoreline','river','mountain',
          'shadow-system','app','nature-ui','ui-organizer','forest-ui','river-ui','flora-workspace']:
    script=re.compile(r'<script src="'+re.escape(f)+r'\.js\?v=[^"]+"></script>')
    html=script.sub(lambda m:'<script>'+(B/(f+'.js')).read_text()+'</script>',html)
def png(im):
    b=BytesIO();im.save(b,format='PNG');return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
mount=Image.new('RGBA',(160,160),(0,0,0,0));d=ImageDraw.Draw(mount)
d.polygon([(80,4),(152,154),(8,154)],fill=(95,130,153,255));d.polygon([(80,4),(113,85),(57,90),(38,105)],fill=(228,239,248,255))
shrub=Image.new('RGBA',(80,80),(0,0,0,0));ImageDraw.Draw(shrub).ellipse((5,8,74,70),fill=(50,123,58,255))
land=Image.new('RGB',(96,96),(108,147,82));sea=Image.new('RGB',(96,96),(23,79,137))
files=[('nature/mountain_snow_test.png','nature',png(mount)),('nature/bush.png','nature',png(shrub)),('terrain/test_grass.png','terrain',png(land)),('terrain/test_ocean.png','terrain',png(sea))]
assets=[dict(path='assets/'+p,relPath=p,name=p.split('/')[-1],category=cat,meta={},bytes=120,mtime=1,url=url) for p,cat,url in files]
mock='''<script>
const TEST_ASSETS=ASSETS;
window.fetch=async(path,opts={})=>{
const C=VedrasCatalog.starter();C.assets['terrain/test_grass.png']={terrainTypeId:'grassland',variantFamilyId:'grassland_base'};
C.assets['terrain/test_ocean.png']={terrainTypeId:'ocean',variantFamilyId:'ocean_base'};
const M=VedrasNatureCatalog.template();Object.assign(M,{id:'mountain_snow_test',description:'Test mountain',sourceReference:'Generated test',family:'snowy_mountains',kind:'mountain',sizeClass:'giant',logicalWidth:360,scaleMin:1,scaleMax:1,anchor:{x:.5,y:.67},shadow:{mode:'none',path:'',offsetX:-.24,offsetY:0,widthScale:.7,depthScale:.18},allowedTerrainCategories:['grass_pasture'],mountain:{radius:1,coreRadius:0,shadowOpacity:.25,flatten:true}});
const B=VedrasNatureCatalog.template();Object.assign(B,{id:'bush_test',description:'Bush',sourceReference:'test',family:'bushes',kind:'shrub',sizeClass:'small',allowedTerrainCategories:['grass_pasture']});
const N={schemaVersion:1,revision:0,presets:{},entries:{'nature/mountain_snow_test.png':M,'nature/bush.png':B}};
let obj={};if(path==='/api/assets')obj={assets:TEST_ASSETS,version:'0.11.0'};
else if(path==='/api/terrain-catalog')obj=C;
else if(path==='/api/nature-catalog')obj=N;
else return new Response('{}',{status:404});
return new Response(JSON.stringify(obj),{status:200});};
</script>'''.replace('=ASSETS;','='+json.dumps(assets)+';')
html=html.replace('<script>',mock+'<script>',1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 p=b.new_page(viewport={'width':1480,'height':900},accept_downloads=True)
 errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.on('dialog',lambda d:d.accept())
 p.set_content(html,wait_until='domcontentloaded',timeout=30000)
 p.wait_for_function('window.VedrasAssetLabor && window.VedrasNature && document.querySelector("#serverStatus").textContent.includes("4/4")',timeout=60000)
 p.wait_for_function('VedrasNature.entryFor(VedrasAssetLabor.assets().find(x=>x.category==="nature"))?.kind==="mountain"',timeout=15000)
 p.evaluate('''()=>{const c=VedrasAssetLabor;c.state.sceneSize=19;c.assignBiomes();
  for(const t of c.cells())c.state.hexTerrain[t.q+','+t.r]='assets/terrain/test_grass.png';
  c.state.showLegacyNature=false;c.state.river=false;c.state.objects=true;c.state.selected='0,0';
  c.invalidateTerrain();c.requestDraw();}''')
 p.locator('button.asset-card').filter(has_text='mountain_snow_test.png').click()
 assert "VERSION KONFLIKT" not in p.locator("#serverStatus").inner_text()
 assert p.locator('#nKind').input_value()=='mountain'
 assert p.locator('#nAnchorY').input_value()=='0.67'
 assert p.locator('#nMountainCoreRadius').input_value()=='0'
 p.locator('#mountainPlace').click()
 p.wait_for_function('VedrasAssetLabor.state.mountainInstances.length===1',timeout=15000)
 assert len(p.evaluate('Array.from(VedrasAssetLabor.mountains.reservedMountainHexes())'))==1
 assert p.locator('#mountainCastOpacity').count()==1
 p.evaluate("window.dispatchEvent(new Event('vedras:hex-selected'))")
 assert abs(float(p.locator('#mountainCastOpacity').input_value())-.58)<.001
 p.evaluate("()=>{const x=document.getElementById('mountainCastOpacity');x.value='.7';x.dispatchEvent(new Event('input',{bubbles:true}));}")
 assert abs(p.evaluate('VedrasAssetLabor.state.mountainInstances[0].shadowOpacity')-.7)<.001
 p.evaluate("()=>{const x=document.getElementById('mountainCastReach');x.value='2';x.dispatchEvent(new Event('input',{bubbles:true}));}")
 assert p.evaluate('VedrasAssetLabor.state.mountainInstances[0].shadowReach')==2
 p.wait_for_timeout(700)
 stats=p.evaluate('window.__vedrasMountainShadowStats')
 assert stats and stats['maxAlpha']>20 and stats['positiveCount']>1000, stats
 # Direct visual response: zero opacity must suppress the cast pass; restoring creates it.
 p.evaluate("()=>{VedrasAssetLabor.state.mountainInstances[0].shadowOpacity=0;VedrasAssetLabor.requestDraw()}")
 p.wait_for_timeout(300)
 muted=p.evaluate('window.__vedrasMountainShadowStats')
 assert muted['maxAlpha']==0 and muted['positiveCount']==0, muted
 p.evaluate("()=>{VedrasAssetLabor.state.mountainInstances[0].shadowOpacity=.7;VedrasAssetLabor.requestDraw()}")
 p.wait_for_timeout(300)
 restored=p.evaluate('window.__vedrasMountainShadowStats')
 assert restored['maxAlpha']>50 and restored['positiveCount']>1000, restored
 # Verify clean drawSprite is not using global filter/lighting on the pre-lit mountain.
 assert p.evaluate('getComputedStyle(document.querySelector("#mapCanvas")).filter')=='none'
 p.locator('#mountainShadowDebug').check()
 p.wait_for_timeout(200)
 p.locator('#mountainShadowDebug').uncheck()
 p.locator('button.asset-card').filter(has_text='bush.png').click()
 p.evaluate('VedrasAssetLabor.state.selected="0,1"')
 p.locator('#nAddToHex').click()
 assert p.evaluate('VedrasAssetLabor.state.natureInstances.some(x=>x.q===0&&x.r===1)'), 'neighbor bush placement failed'
 p.evaluate('VedrasAssetLabor.state.selected="0,0"')
 p.locator('#nAddToHex').click()
 assert not p.evaluate('VedrasAssetLabor.state.natureInstances.some(x=>x.q===0&&x.r===0)'), 'mountain core not protected'
 p.locator('button.asset-card').filter(has_text='mountain_snow_test.png').click()
 p.locator('#mountainMode').select_option('chain')
 p.locator('#mountainChainId').fill('alpen_01')
 p.evaluate('VedrasAssetLabor.state.selected="0,0"')
 p.locator('#mountainJoinChain').click()
 p.evaluate('VedrasAssetLabor.state.selected="1,0"')
 p.locator('#mountainPlace').click()
 assert p.evaluate('VedrasAssetLabor.state.mountainInstances.length')==2, 'second adjacent mountain blocked'
 assert len(p.evaluate('Array.from(VedrasAssetLabor.mountains.reservedMountainHexes())'))==2
 p.locator('#mountainPlace').click()
 assert p.evaluate('VedrasAssetLabor.state.mountainInstances.length')==2
 p.locator('#mountainDebug').check()
 p.evaluate('''()=>{VedrasAssetLabor.state.relief.enabled=true;VedrasAssetLabor.state.relief.strength=70;VedrasAssetLabor.invalidateTerrain();VedrasAssetLabor.requestDraw();}''')
 p.wait_for_timeout(2500)
 assert not errors,errors
 (B/'previews').mkdir(exist_ok=True)
 p.screenshot(path=str(B/'previews/v109_cast_shadow_browser.png'),full_page=False)
 # test with 4 nodes independent from nature bush. Test resets placements after confirm.
 p.locator('#mountainChainTest').click()
 p.wait_for_function('VedrasAssetLabor.state.mountainInstances.length===4',timeout=12000)
 assert len(p.evaluate('Array.from(VedrasAssetLabor.mountains.reservedMountainHexes())'))==4
 # water on adjacent influence: mountain may still be positioned on center land
 p.evaluate('''()=>{VedrasAssetLabor.state.mountainInstances=[];VedrasAssetLabor.state.natureInstances=[];
 VedrasAssetLabor.state.hexTerrain['1,0']='assets/terrain/test_ocean.png';VedrasAssetLabor.state.selected='0,0';VedrasAssetLabor.invalidateTerrain();}''')
 p.locator('#mountainPlace').click()
 assert p.evaluate('VedrasAssetLabor.state.mountainInstances.length')==1,'water on neighboring hex should not block mountain'
 assert p.evaluate('VedrasAssetLabor.relief.height(256,0)')==0
 p.evaluate('VedrasAssetLabor.state.mountainInstances=[];VedrasAssetLabor.state.selected="1,0"')
 p.locator('#mountainPlace').click()
 assert p.evaluate('VedrasAssetLabor.state.mountainInstances.length')==0,'water under core must block'
 p.locator('#nAnchorY').fill('0.97')
 p.locator('#nMountainAnchor067').click()
 assert p.locator('#nAnchorY').input_value()=='0.67'
 assert not errors, errors
 print('PASS v0.10.9 Chromium: center-only blocking, adjacent shrub, adjacent chain mountains, 4 mountain demo, .67 anchor, water, relief, zero pageerrors')
 b.close()
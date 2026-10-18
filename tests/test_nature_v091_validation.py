from pathlib import Path
import sys,copy,json
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from server import validate_nature_catalog
p=Path(__file__).resolve().parents[1]
t=json.loads((p/'assets/terrain/terrain_catalog.json').read_text())
cat_id='grass_pasture'
assert cat_id in [c['id'] for c in t['categories']]
entry={'id':'bush_test_01','description':'test','sourceReference':'source','family':'temperate_bushes','kind':'shrub','sizeClass':'small','logicalWidth':52,'scaleMin':.85,'scaleMax':1.15,'anchor':{'x':.5,'y':.96},'shadow':{'mode':'generic_small_round','path':'','offsetX':-.25,'offsetY':0,'widthScale':.7,'depthScale':.18},'terrainPresetId':'temperate','allowedTerrainCategories':[],'allowedTerrainTypes':[],'excludedTerrainTypes':['tundra'],'placement':{'weight':1,'density':.2,'minSpacing':20,'canCluster':True,'edgeMargin':12},'artStatus':'test','tags':[]}
cat={'schemaVersion':1,'entries':{'nature/test_shrub_01.png':entry},'presets':{'temperate':{'name':'Gemäßigte Zonen','categoryIds':[cat_id],'typeIds':[],'excludeIds':[]}}}
validate_nature_catalog(cat)
# Retain unmodified legacy v0.9 catalog compatibility: no presets and only old fields.
legacy=copy.deepcopy(cat);legacy.pop('presets');legacy['entries']['nature/test_shrub_01.png'].pop('terrainPresetId');legacy['entries']['nature/test_shrub_01.png'].pop('allowedTerrainCategories');legacy['entries']['nature/test_shrub_01.png'].pop('excludedTerrainTypes');legacy['entries']['nature/test_shrub_01.png']['allowedTerrainTypes']=['grassland'];validate_nature_catalog(legacy)
for update in [lambda c:c['entries']['nature/test_shrub_01.png'].update(allowedTerrainCategories=['bad_category']),
               lambda c:c['presets']['temperate'].update(categoryIds=['bad_category']),
               lambda c:c['entries']['nature/test_shrub_01.png']['shadow'].update(offsetX=-3),
               lambda c:c['entries']['nature/test_shrub_01.png'].update(terrainPresetId='unknown')]:
 test=copy.deepcopy(cat);update(test)
 try:validate_nature_catalog(test)
 except ValueError:pass
 else:raise AssertionError('Rejected invalid input was accepted')
print('PASS v0.9.1 schema, presets, dynamic terrain categories, legacy compatibility, shadow validation')
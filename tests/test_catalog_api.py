"""Check schema validation and local-only atomic catalog save without altering original data."""
from pathlib import Path
from http.server import ThreadingHTTPServer
from urllib import request,error
import json,sys,threading
BASE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(BASE))
from server import Handler
saved=(BASE/'assets/terrain/terrain_catalog.json').read_bytes()
srv=ThreadingHTTPServer(('127.0.0.1',0),Handler)
thread=threading.Thread(target=srv.serve_forever,daemon=True);thread.start()
root=f'http://127.0.0.1:{srv.server_port}'
def post(value):
 data=json.dumps(value).encode('utf-8');req=request.Request(root+'/api/terrain-catalog',data=data,headers={'Content-Type':'application/json'},method='POST')
 try:
  with request.urlopen(req) as r:return r.status,json.load(r)
 except error.HTTPError as e:return e.code,json.load(e)
try:
 with request.urlopen(root+'/api/terrain-catalog') as r:original=json.load(r)
 assert len(original['categories'])>=6 and len(original['terrainTypes'])>=19
 copy=json.loads(json.dumps(original));copy['categories'].append({'id':'volcanic_regions','name':'Vulkanisch','sortOrder':900});copy['terrainTypes'].append({'id':'lava_field','name':'Lavafeld','categoryId':'volcanic_regions','materialClass':'ground','transitionProfileId':'organic_ground'})
 status,res=post(copy);assert status==200,(status,res)
 with request.urlopen(root+'/api/terrain-catalog') as r:restored=json.load(r)
 assert any(x['id']=='lava_field' for x in restored['terrainTypes'])
 status,res=post({**copy,'assets':{'terrain/../../escape.png':{'terrainTypeId':'lava_field'}}});assert status==400,(status,res)
 status,res=post({**copy,'terrainTypes':copy['terrainTypes']+[copy['terrainTypes'][0]]});assert status==400,(status,res)
 assert (BASE/'assets/terrain/terrain_catalog.json').exists()
 print('PASS catalog API: read, atomic save, rejection of path traversal/duplicate IDs')
finally:
 (BASE/'assets/terrain/terrain_catalog.json').write_bytes(saved)
 srv.shutdown();srv.server_close()
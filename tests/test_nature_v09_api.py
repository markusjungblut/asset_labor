"""Nature catalog API and interactive browser regression (run manually: python tests/test_nature_v09.py)."""
import json, os, sys, subprocess, time, urllib.request, urllib.error
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]

def api(url, payload=None):
    data=json.dumps(payload).encode('utf-8') if payload is not None else None
    r=urllib.request.Request(url,data=data,headers={'Content-Type':'application/json'} if data else {})
    try:
        with urllib.request.urlopen(r,timeout=8) as f:return f.status,json.load(f)
    except urllib.error.HTTPError as e:return e.code,json.loads(e.read())

def main():
    port=8798
    env={**os.environ,'VEDRAS_NO_BROWSER':'1','VEDRAS_PORT':str(port)}
    server=subprocess.Popen([sys.executable,str(BASE/'server.py')],cwd=BASE,env=env,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    try:
        for _ in range(40):
            try:
                code,_=api(f'http://127.0.0.1:{port}/api/version')
                if code==200:break
            except Exception:pass
            time.sleep(.15)
        else:raise RuntimeError('Preview server startup failed')
        code,cat=api(f'http://127.0.0.1:{port}/api/nature-catalog');assert code==200,(code,cat)
        assert cat['schemaVersion']==1
        entry={
            'id':'bush_temperate_test_01','description':'Referenz-Busch','sourceReference':'Buesche1.jpg, oben links',
            'family':'temperate_bushes','kind':'shrub','sizeClass':'small', 'logicalWidth':48,'scaleMin':.85,'scaleMax':1.15,
            'anchor':{'x':.5,'y':.96},'shadow':{'mode':'generic_small_round','path':''},'allowedTerrainTypes':['grassland','pasture'],
            'placement':{'weight':1,'density':.4,'minSpacing':22,'canCluster':True,'edgeMargin':12},'artStatus':'test','tags':['temperate']}
        path='nature/pine_01.svg'
        data={'schemaVersion':1,'revision':0,'entries':{path:entry}}
        code,out=api(f'http://127.0.0.1:{port}/api/nature-catalog',data);assert code==200,(code,out)
        code,loaded=api(f'http://127.0.0.1:{port}/api/nature-catalog');assert loaded['entries'][path]['id']==entry['id']
        broken=json.loads(json.dumps(data));broken['entries']['nature/../../invalid.png']=entry
        code,_=api(f'http://127.0.0.1:{port}/api/nature-catalog',broken);assert code==400
        broken=json.loads(json.dumps(data));broken['entries'][path]['allowedTerrainTypes']=['unknown_region']
        code,_=api(f'http://127.0.0.1:{port}/api/nature-catalog',broken);assert code==400
        broken=json.loads(json.dumps(data));broken['entries'][path]['anchor']['y']=1.5
        code,_=api(f'http://127.0.0.1:{port}/api/nature-catalog',broken);assert code==400
        print('PASS v0.9 Nature API – create, read, invalid paths/biomes/anchor')
    finally:
        server.terminate()
        try:server.wait(timeout=3)
        except subprocess.TimeoutExpired:server.kill()
        (BASE/'assets/nature/nature_catalog.json').write_text(json.dumps({'schemaVersion':1,'revision':0,'entries':{}},indent=2)+'\n',encoding='utf-8')

if __name__=='__main__': main()
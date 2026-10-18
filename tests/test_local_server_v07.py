"""HTTP smoke test of the real local server (browser localhost navigation is sandbox-blocked here)."""
import os, subprocess, time, urllib.request, json
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
env=os.environ.copy();env['VEDRAS_PORT']='8879'
server=subprocess.Popen(['python','server.py'],cwd=BASE,env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
    for _ in range(45):
        try:
            with urllib.request.urlopen('http://127.0.0.1:8879/api/assets',timeout=1) as r: data=json.load(r)
            break
        except Exception:time.sleep(.2)
    else:raise RuntimeError('Asset-Labor server failed to start')
    assert data['count']>=21
    paths={item['path'] for item in data['assets']}
    assert 'assets/terrain/plains_handpainted_01.png' in paths
    for path in ('/','/index.html','/app.js','/autotile.js','/assets/terrain/plains_handpainted_01.png'):
        with urllib.request.urlopen('http://127.0.0.1:8879'+path,timeout=4) as r:
            assert r.status==200 and len(r.read(100))>0
    print('HTTP SERVER API AND FILES: PASS',data['count'],'assets')
finally:
    server.terminate()
    try:server.wait(timeout=3)
    except subprocess.TimeoutExpired:server.kill()
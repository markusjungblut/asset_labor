"""Vedras Asset-Labor local preview server.

Uses a version-specific starting port and chooses the next free local port
when an older preview is still running. Standard library only.
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse
import json
import os
from static_terrain_store import store as store_tile, load as load_tile, index as tile_index, MAX_REQUEST as MAX_TERRAIN_POST
import shutil
import re
import webbrowser
import threading
import time
from datetime import datetime

VERSION = '0.19.0'
BASE = Path(__file__).resolve().parent
ASSETS = BASE / 'assets'
STATIC_TERRAIN = BASE / 'precomputed' / 'terrain'
EXT = {'.png', '.webp', '.jpg', '.jpeg', '.svg', '.gif', '.avif'}
HOST = '127.0.0.1'
DEFAULT_PORT = 8780
PORT = int(os.environ.get('VEDRAS_PORT', DEFAULT_PORT))
ATLAS_LOCK = threading.Lock()
ATLAS_STATUS = {'state': 'idle', 'error': '', 'sprites': 0, 'pages': 0}

def schedule_atlas_build():
    """Explicit offline job; NEVER compete with terrain rendering on startup."""
    with ATLAS_LOCK:
        if ATLAS_STATUS['state'] == 'building':
            return False
        ATLAS_STATUS.update(state='building', error='')
    def task():
        try:
            from scripts.build_sprite_atlases import build
            manifest = build(ASSETS, BASE / 'atlases')
            desktop = manifest['tiers']['desktop']
            with ATLAS_LOCK:
                ATLAS_STATUS.update(state='ready', sprites=len(desktop['sprites']),
                                    pages=len(desktop['pages']), error='')
        except ImportError:
            with ATLAS_LOCK:
                ATLAS_STATUS.update(state='error', error='Pillow fehlt: python -m pip install Pillow')
        except Exception as exc:
            with ATLAS_LOCK:
                ATLAS_STATUS.update(state='error', error=str(exc)[:200])
    threading.Thread(target=task, name='offline-sprite-atlas', daemon=True).start()
    return True



def validate_catalog(c):
    if not isinstance(c, dict) or c.get('schemaVersion') != 2:
        raise ValueError('Ungültige Katalog-Version')
    for key in ('categories', 'terrainTypes', 'transitionProfiles'):
        if not isinstance(c.get(key), list) or len(c[key]) > 300:
            raise ValueError('Ungültige Einträge: ' + key)
        ids = [v.get('id') for v in c[key] if isinstance(v, dict)]
        if len(ids) != len(c[key]) or len(set(ids)) != len(ids) or any(not isinstance(i, str) or not re.fullmatch(r'[a-z][a-z0-9_]{0,59}', i) for i in ids):
            raise ValueError('Ungültige oder doppelte IDs in ' + key)
    catids = {x['id'] for x in c['categories']}
    profileids = {x['id'] for x in c['transitionProfiles']}
    types = {x['id'] for x in c['terrainTypes']}
    for t in c['terrainTypes']:
        if t.get('categoryId') not in catids or t.get('transitionProfileId') not in profileids:
            raise ValueError('Unbekannte Kategorie/Profil in Geländeart')
        if t.get('materialClass') not in ('ground', 'water', 'shoreline'):
            raise ValueError('Ungültige Materialklasse')
    if not isinstance(c.get('assets'), dict) or len(c['assets']) > 10000:
        raise ValueError('Ungültige Asset-Zuweisungen')
    for path, item in c['assets'].items():
        if not isinstance(path, str) or not path.startswith('terrain/') or '..' in path or '\\' in path or not re.fullmatch(r'[A-Za-z0-9_./-]+',path):
            raise ValueError('Unzulässiger Asset-Pfad')
        if not isinstance(item, dict) or item.get('terrainTypeId') not in types:
            raise ValueError('Unbekannte Geländeart für Asset')



def validate_nature_catalog(c):
    if not isinstance(c, dict) or c.get('schemaVersion') != 1 or not isinstance(c.get('entries'), dict) or len(c['entries']) > 10000:
        raise ValueError('Ungültiger Nature-Katalog v1')
    if not isinstance(c.get('revision', 0), int) or c.get('revision', 0) < 0:
        raise ValueError('Ungültige Revision')
    kinds = {'ground_cover', 'shrub', 'cluster', 'tree', 'rock', 'special', 'mountain'}
    sizes = {'tiny', 'small', 'medium', 'large', 'giant'}
    shadows = {'none', 'generic_small_round', 'generic_small_wide', 'generic_medium_round', 'generic_medium_wide', 'custom'}
    terrains = set()
    try:
        tc = json.loads((ASSETS / 'terrain' / 'terrain_catalog.json').read_text('utf-8'))
        terrains = {t['id'] for t in tc['terrainTypes']}
    except (ValueError, OSError, KeyError):
        pass
    # Initialer Nature-Import darf vor der ersten Terrain-Katalogspeicherung stattfinden.
    # Nur die sieben stabilen Startkategorien sind ohne eigenen Terrain-Katalog zulässig.
    categories = {'water_coast', 'cold_regions', 'grass_pasture', 'warm_regions', 'wetlands', 'arid_regions', 'demo_regions'}
    try:
        categories = {c['id'] for c in tc['categories']}
    except (KeyError, TypeError, NameError):
        pass
    presets = c.get('presets', {})
    if not isinstance(presets, dict) or len(presets) > 500:
        raise ValueError('Ungültige Preset-Sammlung')
    def valid_rules(item):
        for field,valid in [('allowedTerrainCategories',categories),('allowedTerrainTypes',terrains),('excludedTerrainTypes',terrains)]:
            values = item.get(field, [])
            if not isinstance(values,list) or len(values)>250 or len(values)!=len(set(map(str,values))) or any(not isinstance(x,str) or x not in valid for x in values):
                raise ValueError('Geländeregel ungültig: '+field)
    for key,preset in presets.items():
        if not isinstance(key,str) or not re.fullmatch(r'[a-z][a-z0-9_]{0,63}',key) or not isinstance(preset,dict) or not isinstance(preset.get('name'),str) or not preset['name'].strip() or len(preset['name'])>90:
            raise ValueError('Preset ungültig')
        if any(k in preset for k in ('categoryIds','typeIds','excludeIds')):
            for k,target in [('categoryIds',categories),('typeIds',terrains),('excludeIds',terrains)]:
                vals=preset.get(k,[])
                if not isinstance(vals,list) or len(vals)>250 or len(vals)!=len(set(map(str,vals))) or any(not isinstance(x,str) or x not in target for x in vals):
                    raise ValueError('Preset Geländeregel ungültig: '+k)
        else: valid_rules(preset)
    ids = set()
    def num(v, low, high):
        return isinstance(v, (int, float)) and not isinstance(v, bool) and low <= v <= high
    for rel, item in c['entries'].items():
        if not isinstance(rel, str) or '..' in rel or '\\' in rel or not re.fullmatch(r'nature/[\w./-]+\.(?:png|webp|jpg|jpeg|svg|gif|avif)', rel, re.I):
            raise ValueError('Unzulässiger Nature-Pfad')
        if not isinstance(item, dict): raise ValueError('Ungültige Nature-Metadaten')
        ident = item.get('id')
        if not isinstance(ident, str) or not re.fullmatch(r'[a-z][a-z0-9_]{0,63}', ident) or ident in ids:
            raise ValueError('Doppelte oder ungültige Sprite-ID')
        ids.add(ident)
        if item.get('kind') not in kinds or item.get('sizeClass') not in sizes or not isinstance(item.get('family'), str) or not re.fullmatch(r'[a-z][a-z0-9_]{0,63}', item['family']):
            raise ValueError('Nature-Klasse oder -Familie ungültig')
        if any(not isinstance(item.get(field), str) or len(item[field]) > length for field, length in [('description', 600), ('sourceReference', 300)]):
            raise ValueError('Nature-Textfeld ungültig')
        if not num(item.get('logicalWidth'), 4, 400) or not num(item.get('scaleMin'), .2, 3) or not num(item.get('scaleMax'), .2, 3) or item['scaleMin'] > item['scaleMax']:
            raise ValueError('Sprite-Skalierung ungültig')
        anchor = item.get('anchor', {})
        if not isinstance(anchor, dict) or not num(anchor.get('x'), 0, 1) or not num(anchor.get('y'), 0, 1):
            raise ValueError('Sprite-Anker ungültig')
        shadow = item.get('shadow', {})
        if not isinstance(shadow, dict) or shadow.get('mode') not in shadows or not isinstance(shadow.get('path'), str) or '..' in shadow['path'] or len(shadow['path']) > 240:
            raise ValueError('Sprite-Schatten ungültig')
        if shadow['mode'] == 'custom' and not re.fullmatch(r'shadows/[A-Za-z0-9_./-]+\.(?:png|webp|svg)', shadow['path'], re.I):
            raise ValueError('Eigener Schatten fehlt')
        for f,low,high in [('offsetX',-1,1),('offsetY',-.6,.6),('widthScale',.1,2),('depthScale',.03,1)]:
            if f in shadow and not num(shadow[f],low,high):
                raise ValueError('Schattenversatz oder -größe ungültig')
        if item.get('kind') == 'mountain':
            m = item.get('mountain', {})
            if m.get('radius') not in (1, 2) or m.get('coreRadius', 0) not in (0, 1) or not num(m.get('shadowOpacity'), 0, .65) or not isinstance(m.get('flatten'), bool):
                raise ValueError('Berg-Footprint oder Schatten ungültig')
        preset_id=item.get('terrainPresetId','')
        if not isinstance(preset_id,str) or (preset_id and preset_id not in presets):
            raise ValueError('Gelände-Preset für Sprite fehlt')
        valid_rules(item)
        allowed = item.get('allowedTerrainTypes')
        if not isinstance(allowed, list) or len(allowed) > 200 or len(set(str(v) for v in allowed)) != len(allowed) or any(not isinstance(v, str) or v not in terrains for v in allowed):
            raise ValueError('Geländezuordnung ungültig')
        placement = item.get('placement', {})
        if not isinstance(placement, dict) or not all([num(placement.get('weight'), 0, 100), num(placement.get('density'), 0, 1), num(placement.get('minSpacing'), 0, 256), isinstance(placement.get('canCluster'), bool), num(placement.get('edgeMargin'), 0, 80)]):
            raise ValueError('Sprite-Platzierungsregeln ungültig')
        if item.get('artStatus') not in {'candidate', 'test', 'approved', 'deprecated'} or not isinstance(item.get('tags'), list) or len(item['tags']) > 30 or any(not isinstance(x, str) or len(x) > 50 for x in item['tags']):
            raise ValueError('Status oder Tags ungültig')

# Versioned, independent shadow profile catalog. Do not touch Nature sprites,
# shadow PNGs, user-edited Nature rules or image sidecars.
def validate_sprite_shadows(data):
    if not isinstance(data, dict) or data.get('schemaVersion') != 1:
        raise ValueError('Ungültige Schattenprofil-Version')
    global_values = data.get('global')
    profiles = data.get('profiles')
    if not isinstance(global_values, dict) or not isinstance(profiles, dict) or len(profiles) > 10000:
        raise ValueError('Ungültiges Schattenprofil-Format')
    limits = {
        'angle': (105, 215), 'opacity': (0, .75),
        'length': (.15, 2.6), 'width': (.2, 1.8),
        'softness': (0, 30), 'offsetX': (-.8, .8),
        'offsetY': (-.5, .5), 'contact': (0, .7),
        'strength': (0, 2)
    }
    if set(global_values) != set(limits):
        raise ValueError('Unvollständige oder unbekannte globale Schattenparameter')
    def check(values, allow_strength=False):
        if not isinstance(values, dict):
            raise ValueError('Ungültiges Sprite-Schattenprofil')
        for key, value in values.items():
            if key == 'enabled' and not allow_strength:
                if not isinstance(value, bool):
                    raise ValueError('Ungültiger Schatten-Schalter')
                continue

            if key == 'manual' and not allow_strength:
                if not isinstance(value, dict) or value.get('mode') != 'polygons':
                    raise ValueError('Ungültige Schattenzeichnung')
                polygons = value.get('polygons')
                if not isinstance(polygons, list) or len(polygons) > 12:
                    raise ValueError('Zu viele Schattenkonturen')
                for polygon in polygons:
                    if not isinstance(polygon, list) or not 3 <= len(polygon) <= 180:
                        raise ValueError('Ungültige Schattenkontur')
                    for point in polygon:
                        if not isinstance(point, list) or len(point) != 2 or any(
                            isinstance(x, bool) or not isinstance(x, (int, float)) or
                            not -3 <= x <= 3 for x in point
                        ):
                            raise ValueError('Ungültiger Schattenpunkt')
                continue
            if key not in limits or key == 'strength' and not allow_strength:
                raise ValueError('Unbekannter Schattenwert: ' + key)
            lo, hi = limits[key]
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not lo <= value <= hi:
                raise ValueError('Schattenwert außerhalb des Bereichs: ' + key)
    check(global_values, True)
    for asset_path, profile in profiles.items():
        if not isinstance(asset_path, str) or len(asset_path) > 300 or '..' in asset_path or '\\' in asset_path or not re.fullmatch(
            r'assets/(?:nature|buildings|units)/[A-Za-z0-9_./-]+\.(?:png|webp|jpg|jpeg|svg|gif|avif)', asset_path, re.I
        ):
            raise ValueError('Ungültiger Profil-Spritepfad')
        check(profile)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE), **kwargs)

    def _send_json(self, payload):
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _failure(self, code, reason):
        payload = json.dumps({'error': reason}, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_POST(self):
        endpoint = urlparse(self.path).path
        if self.headers.get('Origin') not in (None, f'http://{HOST}:{self.server.server_port}'):
            self._failure(403, 'Fremde Browser-Herkunft nicht erlaubt')
            return
        if endpoint == '/api/build-atlases':
            self._send_json({'started': schedule_atlas_build(), **ATLAS_STATUS})
            return
        if endpoint == '/api/static-terrain':
            try:
                length = int(self.headers.get('Content-Length', '0'))
                if not 1 <= length <= MAX_TERRAIN_POST:
                    self._failure(413, 'Terrain-Chunk zu groß')
                    return
                data = json.loads(self.rfile.read(length).decode('utf-8'))
                result = store_tile(STATIC_TERRAIN, data)
                self._send_json({'stored': True, 'key': result['key']})
            except (ValueError, UnicodeDecodeError, TypeError) as exc:
                self._failure(400, str(exc))
            except OSError as exc:
                self._failure(500, 'Terrain-Cache nicht schreibbar: ' + str(exc))
            return
        if endpoint not in ('/api/terrain-catalog', '/api/nature-catalog', '/api/sprite-shadows'):
            self._failure(404, 'Unbekannte API')
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if length < 1 or length > 500_000:
                self._failure(413, 'Ungültige Kataloggröße')
                return
            catalog = json.loads(self.rfile.read(length).decode('utf-8'))
            if endpoint == '/api/nature-catalog':
                validate_nature_catalog(catalog)
                dest = ASSETS / 'nature' / 'nature_catalog.json'
            elif endpoint == '/api/sprite-shadows':
                validate_sprite_shadows(catalog)
                dest = ASSETS / 'shadows' / 'sprite_shadow_profiles.json'
            else:
                validate_catalog(catalog)
                dest = ASSETS / 'terrain' / 'terrain_catalog.json'
            tmp = dest.with_name(dest.name + '.tmp')
            tmp.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
            # Keep the previous persisted catalog recoverable on disk.
            if dest.exists():
                shutil.copy2(dest, dest.with_name(dest.name + '.bak'))
            os.replace(tmp, dest)
            self._send_json({'saved': True, 'entries': len(catalog.get('entries', {})), 'terrainTypes': len(catalog.get('terrainTypes', []))})
        except (ValueError, TypeError, KeyError, UnicodeDecodeError) as err:
            self._failure(400, str(err))
        except OSError as err:
            self._failure(500, 'Speichern fehlgeschlagen: '+str(err))

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == '/api/static-terrain-index':
            self._send_json(tile_index(STATIC_TERRAIN))
            return
        if parsed.path.startswith('/api/static-terrain/'):
            # Python 3.8 compatibility: str.removeprefix was added in 3.9.
            # The preceding startswith check guarantees this is a safe slice.
            prefix = '/api/static-terrain/'
            key = parsed.path[len(prefix):]
            tile = load_tile(STATIC_TERRAIN, key)
            if tile is None:
                self._failure(404, 'Kein vorgerenderter Gelände-Chunk')
            else:
                self._send_json(tile)
            return
        if parsed.path == '/api/atlas-status':
            with ATLAS_LOCK:
                info = ATLAS_STATUS.copy()
            self._send_json(info)
            return
        if parsed.path == '/api/version':
            self._send_json({
                'version': VERSION,
                'port': self.server.server_port,
                'folder': BASE.name,
                'serverRoot': str(BASE),
            })
            return
        if parsed.path in ('/api/sprite-shadows','/api/sprite-shadows-backup'):
            filename = 'sprite_shadow_profiles.json' + ('.bak' if parsed.path.endswith('-backup') else '')
            try:
                shadow_path = ASSETS / 'shadows' / filename
                if not shadow_path.exists() and not parsed.path.endswith('-backup'):
                    for alias in ('shadow.json', 'shadows.json', 'schatten.json'):
                        candidate = ASSETS / 'shadows' / alias
                        if candidate.exists():
                            shadow_path = candidate
                            break
                data = json.loads(shadow_path.read_text('utf-8'))
                validate_sprite_shadows(data)
                self._send_json(data)
            except (OSError, ValueError):
                self._failure(404, 'Schattenprofil-Datei oder Sicherung fehlt')
            return
        if parsed.path == '/api/nature-catalog-backup':
            try:
                self._send_json(json.loads((ASSETS / 'nature' / 'nature_catalog.json.bak').read_text('utf-8')))
            except (OSError, ValueError):
                self._failure(404, 'Keine gültige Nature-Katalog-Sicherung verfügbar')
            return
        if parsed.path == '/api/nature-catalog':
            try:
                self._send_json(json.loads((ASSETS / 'nature' / 'nature_catalog.json').read_text('utf-8')))
            except FileNotFoundError:
                self._send_json({'schemaVersion': 1, 'revision': 0, 'entries': {}})
            except (OSError, ValueError):
                self._failure(500, 'Nature-Katalog fehlerhaft')
            return
        if parsed.path == '/api/terrain-catalog':
            dest = ASSETS / 'terrain' / 'terrain_catalog.json'
            try:
                self._send_json(json.loads(dest.read_text('utf-8')))
            except (OSError, ValueError):
                self._failure(404, 'Kein Gelände-Katalog verfügbar')
            return
        if parsed.path == '/api/assets':
            result = []
            for p in sorted(ASSETS.rglob('*')):
                if not p.is_file() or p.suffix.lower() not in EXT:
                    continue
                rel = p.relative_to(ASSETS).as_posix()
                meta_path = p.with_name(p.stem.replace('__main', '') + '.json') if '__main' in p.stem else p.with_suffix('.json')
                try:
                    metadata = json.loads(meta_path.read_text('utf-8')) if meta_path.exists() else {}
                except (ValueError, OSError):
                    metadata = {'metadataError': True}
                stat = p.stat()
                result.append({
                    'path': 'assets/' + rel,
                    'relPath': rel,
                    'name': p.name,
                    'category': rel.split('/')[0],
                    'bytes': stat.st_size,
                    'mtime': stat.st_mtime_ns,
                    # Birthdate if genuinely supported, never Linux st_ctime.
                    'createdNs': int(stat.st_birthtime * 1_000_000_000)
                        if getattr(stat, 'st_birthtime', None) else None,
                    'meta': metadata,
                })
            self._send_json({'assets': result, 'count': len(result), 'version': VERSION})
            return
        return super().do_GET()

    def end_headers(self):
        # Do not keep cached app.js/index.html from an older viewer installation.
        self.send_header('Cache-Control', 'no-store, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()


def choose_server():
    if PORT == 0:  # Useful for tests and optional automatic port selection.
        return ThreadingHTTPServer((HOST, 0), Handler)
    for port in range(PORT, min(PORT + 30, 65536)):
        try:
            return ThreadingHTTPServer((HOST, port), Handler)
        except OSError as exc:
            # Socket is in use by an older version; never connect to that server.
            if getattr(exc, 'errno', None) in (48, 98, 10048):
                print(f'Port {port} belegt, versuche {port + 1} ...', flush=True)
                continue
            raise
    raise RuntimeError(f'Kein freier lokaler Port in {PORT}–{PORT + 29} gefunden.')


if __name__ == '__main__':
    server = choose_server()
    port = server.server_port
    url = f'http://{HOST}:{port}/?v={VERSION.replace(".", "-")}'
    print(f'VEDRAS ASSET-LABOR v{VERSION}', flush=True)
    print(f'Projektordner: {BASE}', flush=True)
    print(f'Aktuelle URL: {url}', flush=True)
    print('Neue Grafiken in assets/ ablegen, dann im Browser „Neu einlesen“ klicken.', flush=True)
    print('Zum Beenden Strg+C. Nur die im Konsolenfenster angezeigte URL verwenden.', flush=True)
    if os.environ.get('VEDRAS_NO_BROWSER') != '1':
        threading.Thread(target=lambda: (time.sleep(0.5), webbrowser.open(url)), daemon=True).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
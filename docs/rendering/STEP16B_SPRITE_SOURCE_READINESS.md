# Schritt 16B – Sprite-Readiness-Gate für World-Tile-Source-Bakes

## ZIP 9: Windows-Hardwarebefund vom 30.10.2026

Referenzszene unverändert: 397 Hexfelder, 2.631 Nature, SHA-256
`1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f`.
Keine JavaScript-Fehler oder Warnungen. 4×, 90 Frames, fünf 4×-Screenshots.

| Kennzahl | ZIP 8 | ZIP 9 |
|---|---:|---:|
| Pan rAF-p95 (diagnostisch) | 16,86 ms | 16,80 ms |
| Pan Tile-Bakes | 2 | 1 |
| Pan End-Coverage | 100 % | 24,4 % |
| Zoom rAF-p95 (diagnostisch) | 327,76 ms | 33,36 ms |
| Zoom Tile-Bakes | 6 | 3 |
| Zoom End-Coverage | 25 % | 100 % |

**Beide Phasen nicht warm-valide**: Pan startet nach ~16,8 s
Vorbereitung mit 0 World-Tiles, 0 % Coverage, vier fehlenden
sichtbaren Kacheln und 16 unvorbereiteten Terrain-Cores.
Zoom startet READY, aber nicht quiet; während der Gesten
werden weitere Kacheln erzeugt. Pan-Zustand endet mit nur
einer exakten sichtbaren Kachel (24,4 % Coverage).
Zoom-End-Coverage ist 100 %, aber bei der späteren
4×-Sichtprüfung `03-zoom-settled` erneut nur 25 %.

Während Pan und Zoom **0 Ground-Asset-Events und 0
Tile-Invalidierungen**; Ufer-Seitenstempel verhindern die
früheren globalen Kamera-Resets in diesem Lauf.
Bei der Vorbereitung bleiben 93 `image-ready-ground`-Events,
264 `image-ready-scenery`-Events, ein globaler
`ground.asset-dependency`-Batch (drei Quellen) und
zwei globale `image-ready-ground`-Invalidierungen.
Der 4×-Bildpool liegt vor Pan ~54,0 MiB über 576 MiB Budget;
während Pan 22 Evictions, während Zoom weitere 23.

## Bisher unberücksichtigte Quell-Voraussetzung

Während Vorbereitung sind **24** `tile.bake`-Versuche
mit `terrain-or-assets-not-ready:sprite-source-not-ready`
verworfen worden. Der Source-Start-Gate aus #77/#81
prüfte zuvor nur Terrain und vorbereitete Küstenraster;
`bakeWorldTile` setzt jedoch zusätzlich voraus, dass
alle authored Nature-/Mountain-/Objekt-Sprites innerhalb
des Kachel-Overhangs fertig dekodiert wurden.

**Minimaler Patch:** Die vorhandene Funktion
`tileArtworkStatus(tile,null,true)` wird als
`canStartSource`-Predicate wiederverwendet. Sie
prüft in fester Reihenfolge Terrain, Shoreline und
alle authored Sprite-Pfade. Fehlende Sprite-Bilder
werden über den bestehenden `imagePool.ensure(asset,11)`
priorisiert. Ein nicht bereiter Tile erhält keine
Source-Queue, keinen fehlgeschlagenen Bake und
verbraucht keinen Retry-Slot. Der nächste
`worldTiles.request` nach Bild-/Chunk-Ready kann
den Bake wie bisher starten.

Keine Änderungen an Terrain-/Shoreline-Stempeln,
Wassertexturen, LOD, Fog, Final-PNG-Export,
Bildspeicherbudgets oder Compositor.

## Grenzen und Abnahme

**50/50 Tests im isolierten V8-Lauf bestanden**:
25 Ground-Dependencies, 9 Uferseiten, 5 Terrain-
Start-Gate, 5 Kamera-Asset-Retention und 6 neue
Sprite-Gate-Tests. Die native Windows-Node- und
Chrome-Messung des Patches steht aus.

Die 4×-Prüfbilder bleiben nicht vollständig READY:
nach Zoom nur 25 % und Ozeanaufnahme ebenfalls
nicht readiness-konform. Dünne vertikale Wasserlinien
sind weiterhin sichtbar, ihre genaue Herkunft ist
noch **nicht nachgewiesen**. Pixel-/Fog-Abnahme
Schritt 16C steht aus. Die neuen Gate-Tests
belegen nur den fehlenden Sprite-Start; sie belegen
**noch keine stabilen 4×-Framezeiten** und keine
vollständige Behebung der initialen Terrain-Wartezeiten.

## Gezielter Windows-Nachtest

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status
git fetch origin
git switch fix/step16b-gate-sprite-readiness-before-source-20261030
git pull --ff-only origin fix/step16b-gate-sprite-readiness-before-source-20261030
node --test tests/test_rendering_step16b_ground_asset_dependencies_20261030.cjs tests/test_rendering_step16b_shoreline_side_20261030.cjs tests/test_rendering_step16b_sprite_source_gate_20261030.cjs tests/test_rendering_step16b_terrain_start_gate_20261030.cjs tests/test_rendering_step16b_asset_camera_20261030.cjs
.\START_STEP16A_WINDOWS.cmd --qualities 4 --frames 90 --settle-ms 30000 --visual
```

Wichtig: Mit dem längeren `settle-ms`-Fenster
prüfen, ob die initialen ImagePool-/Terrain-Worker-
Arbeiten fertig werden. Nur die vollständigen
Readiness- und Quiet-Gates machen reale
Warm-Benchmarks belastbar. Das 30s-Fenster
belegt für sich noch keinen Leistungsgewinn.

Draft; kein Merge. Schritt 16C/17 weiterhin gesperrt.

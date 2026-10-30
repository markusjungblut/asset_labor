# Schritt 16B – stabile Bildinhaltsrevisionen und gezielte Ground-Wiederverwendung

## Windows-Ausgangsbefund

Basis ist `step16a-audit(20261030-191007).zip` mit 397 Hexfeldern, 2.631
Naturinstanzen, Qualität 4 und Branch #84. Die vorbereitete Szene ist
initial READY, der reale Zoom bleibt trotzdem ungültig: 31
`image-ready-ground`-Events, zweimal 103 selektiv betroffene World-Tiles,
10 Tile-Bakes, 17 Cache-Misses, ein sichtbares Stale-Tile und ein
Pending-Auftrag. Der Bildpool steigt von 141 auf 169 Evictions, während
seine Gesamtbelegung zeitweise 576 MiB überschreitet.
Die 12 `terrain-not-painted`-Editor-Cores der Pan-Diagnose sind nicht
automatisch 12 unbemalte tatsächlich angeforderte World-Tiles.

Ursache im Code:
- `asset-image-pool.js` erhöhte `imageRevision` bei **jedem**
  erfolgreichen Decoding, auch beim erneuten Einlesen derselben PNG-Datei
  mit identischer Ausgabeauflösung nach einer LRU-Eviction.
- `app.js` deutete jede solche Rückkehr als geändertes Material,
  invalidierte `frameMemo`, löschte alle Ground-Reuse-Bilder und meldete
  eine neue Tile-Quelle.
- `groundTileContentKey()` enthielt außerdem die globale
  `frameMemo.stats().revision`, sodass auch ansonsten unveränderte
  Bodenraster keinen stabilen Wiederverwendungsschlüssel behielten.

Dies erklärt einen möglichen Teil der gemessenen Arbeit; welchen Anteil
tatsächlich identische Redecodes verursachten, kann erst die neue
aufgeschlüsselte Windows-Aufzeichnung feststellen.

## Begrenzter Fix

1. Die semantische `imageRevision` ändert sich bei einer erstmals
   verfügbaren Datei, einem geänderten versionierten URL/mtime-Identifikator
   oder einer geänderten Bildausgabeauflösung. Eine Byte-/Pixelprüfung
   erfolgt nicht; ein In-place-Austausch ohne geänderten URL/mtime
   ist daher **nicht** abgedeckt und muss über die bestehende
   Bibliotheks-/Versionsaktualisierung erfolgen.
2. Eine erneute Dekodierung mit identischem Bildschlüssel meldet
   `repeat-decode`, erhält die Revision und weckt bei Bedarf die
   Paint-/Source-Gates, ohne WorldTiles, Scenery oder Terrain zu invalidieren.
   Ein Upgrade von 512 auf 1024 Pixel und eine echte Quellenänderung behalten
   ihre bisherigen Invalidierungspfade.
3. `groundTileReuse` kann betroffene Tile-IDs in sämtlichen LODs
   gezielt löschen. Nur bei nicht lokalisierbarer Ground-Abhängigkeit
   wird der gesamte Cache geleert. Die globale `frameMemo`-Revision
   wird aus dem Ground-Reuse-Key entfernt; Ground-Rendering-Einstellungen,
   Terrain-Core-Version, Coast-, Road- und River-Versionen bleiben enthalten.
   Andere `frameMemo`-Invalidierungen und die autoritativen WorldTile-
   Source-Checks werden nicht verändert.
4. Die optionale Step-15-Trace protokolliert `asset.pool-ready` mit
   `first-decode`, `repeat-decode`, `quality-upgrade` oder
   `source-change` sowie Pfad, Revisionswechsel, Abmessungen,
   geschützte Stellung, Bild-/Poolbytes und `asset.pool-evict` mit
   Dateipfad. Das Audit zählt diese Vorgänge getrennt von tatsächlichen
   `image-ready-ground`-Invalidierungen.
5. Readiness-Diagnosen unterscheiden nicht bereite angefragte WorldTile-
   Cores und unbemalte Editor-Overscan-Cores. Die Regeln für READY,
   Quiet-Gate, Stale-, Preview- und Pending-Tiles sind unverändert.

## Regressionen

Neue Datei:
`tests/test_rendering_step16b_image_content_lifecycle_20261030.cjs`

Sie prüft erstmalige Dekodierung, identische Dekodierung nach Eviction,
versionierte Quelländerung, Qualitäts-Upgrade, geschützte Assets,
selektive Ground-Reuse-Invalidierung über LODs, globalen Fallback,
App-Callback-Abzweigung und unveränderte Warm-Gates.

Die Regressionen müssen vor der Windows-Abnahme noch **nativ ausgeführt**
werden; die aktuelle Ausführungsumgebung hat keinen Zugriff auf den
Windows-Chromium-/397-Hex-Referenzserver. Die Implementierung ist
deshalb **noch nicht als FPS- oder Visual-Fix abgenommen**.

## Windows-Regressionslauf nach PR #85 (2026-10-30)

Der Benutzer führte unter Windows/PowerShell 7.6.9 vier native Node-Testdateien
parallel aus: **58 Tests, 50 bestanden, 8 fehlgeschlagen**. Dabei bestanden
**alle 11 neu angelegten Tests für die Bildlebenszyklen**. Die Fehler liegen in
zwei vorhandenen Testdateien:

- 2 × `test_rendering_step16b_retained_stale_ground_20261030.cjs`:
  `world-tile-streamer.js::invalidateTiles` akzeptierte Host-`Set`-Werte nicht,
  weil `tileIds instanceof Set` bei `Set`-Objekten aus einer anderen
  JavaScript-Realm (Node `vm`) false ergibt. Der Renderer normalisiert nun
  ausschließlich nichtskalare Iterable und validiert jede ID weiterhin.
  Die Autorisierungs-/Fog- und Stale-Readiness-Verträge sind unverändert.
- 6 × `test_rendering_step16b_stable_road_river_revisions_20261030.cjs`:
  Der Test-Harness verwendete acht `setImmediate`-Zyklen als Ersatz für
  die produktive `setTimeout(0)`-Foreground-Planung. Auf Windows/Node
  werden damit nicht zwingend Timercallbacks ausgeführt. Die Tests warten
  jetzt explizit und zeitbegrenzt auf tatsächlich bereite `readyTiles`
  und geben bei Timeout Chunk-Diagnostics aus. **Keine Änderung am
  produktiven Chunk-Scheduler.**

Acht entsprechende Zustands-/Laufzeitprüfungen mit den echten Produktionsmodulen
wurden in einer isolierten JS-Ausführungsumgebung durchgeführt und bestanden.
Der erneute **native** Windows-Testlauf des aktualisierten PR-Branches steht
noch aus, ebenso die visuelle und Warm-Performance-Abnahme.

## Reproduzierbarer Windows-Nachtest

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status
git fetch origin
git switch fix/step16b-stable-image-content-reuse-20261030
git pull --ff-only origin fix/step16b-stable-image-content-reuse-20261030
node --test tests/test_rendering_step16b_image_content_lifecycle_20261030.cjs tests/test_rendering_step16b_stable_road_river_revisions_20261030.cjs tests/test_rendering_step16b_retained_stale_ground_20261030.cjs tests/test_rendering_step16b_ground_asset_dependencies_20261030.cjs tests/test_rendering_step16b_shoreline_side_20261030.cjs tests/test_rendering_step16b_sprite_source_gate_20261030.cjs tests/test_rendering_step16b_terrain_start_gate_20261030.cjs tests/test_rendering_step16b_asset_camera_20261030.cjs
.\START_STEP16A_WINDOWS.cmd --qualities 4 --frames 90 --settle-ms 30000 --visual
```

Abgleich auf identischer gespeicherter Szene und unveränderter Hardware:
- `poolReadyKinds`, Evictions und Ground-Asset-Events pro Phase.
- Bildpfadlisten und Änderungstypen (Reload vs. tatsächliches Upgrade).
- `groundReuse.hits/misses/invalidated` versus vorigem Audit;
  Tile-Bakes, Cache-Misses, Stale-Tiles und Pending am Testende.
- Pan-/Zoom-Warm-Gates, rAF-p95, Arbeit der Hauptthread-Tasks und
  decoded/protected MiB; keine Erfolgsbehauptung bei `valid:false`.
- Qualität-4-Küste mit vertikalen Wasserlinien und Fog-Bilder manuell
  prüfen, keine Asset-Änderungen durch diesen Patch.

**Draft, kein Merge. Schritt 16C/17 bleibt gesperrt.**

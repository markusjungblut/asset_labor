# Schritt 16B – vorbereitete Terrain-Quelle vor World-Tile-Bake prüfen

## Hardwarediagnose aus `step16a-audit(4).zip`

Referenz: 397 Hexfelder, 2631 Vegetationsobjekte, identische Szenen-SHA-256
`1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f`.
Die aktive 4×-WorldTile-Kamera blieb während beider Kamera-Phasen nun erhalten
(`camera.mode-retained` einmal pro Phase, `active:true` am Ende).

| Kennzahl | Pan | Zoom |
|---|---:|---:|
| Reale rAF-Intervalle | 89 | 89 |
| rAF-p95 (nur Diagnose) | 60,06 ms | 126,76 ms |
| WorldTile Bake-Versuche | 34 | 11 |
| Terrain-core-not-ready-Bake-Versuche | 29 | 0 |
| Bild-Asset-Invalidierungen | 34 | 27 |
| Tile-Cache-Misses | 37 | 11 |
| WorldTile-Invalidierungen | 2 | 5 |
| Abschluss-Coverage | 50 % | 100 % |
| Abnahme als echte Warm-Phase | Nein | Nein |

Im Pan-Lauf geht **eine** globale `image-ready-ground`-Invalidierung
mit 15 zuvor vorhandenen Weltkacheln einher. Dadurch entstehen mindestens
16 weitere Cache-Misses; die meisten Nachfüllversuche stoßen auf
noch nicht fertige Terrain-Kerne. 4× überschreitet den 576-MiB-
Bildpool-Zielwert im Pan-Endzustand um etwa 57,8 MiB.

In der Vorbereitung wurden 132 WorldTile-Bake-Versuche protokolliert,
davon 95 wegen `terrain-core-not-ready`, weitere 24 wegen
`sprite-source-not-ready`. Das ist belegte Vorbereitungs-
Arbeit; die Kosten liegen nicht ausschließlich im fertigen Tile-Compositor.

## Genau eine kontrollierte Änderung

`world-tile-streamer.js` erhält den optionalen `canStartSource`-Hook.
Nur der lokale Editor in `app.js` setzt ihn auf die Prüfung
`!!currentTerrainCore(tile)`. Bereits fertige World-Tiles und andere
Aufrufer bleiben unverändert. Solange der Terrain-Kern nicht existiert:

- Das Tile bleibt im sichtbaren Bedarf (`visibleTiles`) und damit
  durch die reguläre Wolken-/Fog-Geometrie verborgen.
- Es wird **kein** Source-Callback/Bake gestartet, kein Retry-Budget
  ausgegeben und kein Single-Source-Slot blockiert.
- Nach Worker-Fertigstellung ruft der bestehende Chunk-Redraw-Callback
  `requestDraw()` auf; beim nächsten `worldTiles.request()` wird
  die freigegebene Kachel normal queued/gebaked.
- Optionales, pro Tile/Revision gedrosseltes
  `tile.source-deferred`-Trace-Event macht die Verzögerung sichtbar.
  Bei globaler/selektiver Invalidierung wird der Tracezustand geleert.

Die Prüfung selbst ändert weder die Akzeptanzregeln, die Ground-
Revisionen, Asset-Zuordnungen, die Bildpool-Limits noch die
Fog-Autorisierung oder die präzise Exportdarstellung.

## Tests und Validierung

Vier Regressionstests mit dem echten `world-tile-streamer.js` im
isolierten V8 geprüft: 30 unvorbereitete Anfragen bleiben ohne Bake,
anschließend wird eine vom Worker bereitgestellte Kachel korrekt erzeugt,
Host ohne Hook verhält sich wie bisher und Editor-Origin ist explizit.
**4/4 bestanden**. Native Windows-Node-/GPU-/Browsermessung steht aus.

Der Patch behauptet **nicht**, die 4×-Coverage zu reparieren: Die
globale `image-ready-ground`-Invalidierung der bereits fertigen
Kacheln ist eine unabhängige Ursache. Diese erst nach Analyse
tatsächlicher Bildabhängigkeiten gezielt verbessern, keinesfalls
unfertige Bodengrafiken als fertig ausgeben.

## Windows-Nachtest

```powershell
node --test tests/test_rendering_step16b_terrain_start_gate_20261030.cjs
node --test tests/test_rendering_step16b_asset_camera_20261030.cjs
.\START_STEP16A_WINDOWS.cmd --qualities 4 --frames 90 --settle-ms 12000
```

Abnahmeindikatoren: weniger `terrain-core-not-ready`-Bakes,
stattdessen `tile.source-deferred` für erwartete noch nicht
fertige Terrain-Arbeit; keine neuen Terminal-Retries, keine
Abnahme der echten Coverage/Readiness, keine Renderfehler.
**Schritt 16C und Schritt 17 bleiben gesperrt.**

## Nachtest am 30.10.2026: `step16a-audit(5).zip`

Gleiche Referenzszene, 0 JavaScript-Testfehler, eine 4×-Qualitätsphase.
ZIP4 → ZIP5:

| Indikator | Vorher | Jetzt |
|---|---:|---:|
| Preparation `tile.bake` | 132 | 36 |
| Preparation `terrain-core-not-ready` | 95 | 2 |
| Preparation `sprite-source-not-ready` | 24 | 27 |
| Preparation `tile.source-deferred` | 0 | 33 |
| Pan `tile.bake` | 34 | 25 |
| Pan `terrain-core-not-ready` | 29 | 11 |
| Pan `tile.source-deferred` | 0 | 18 |
| Pan rAF-p95 | 60,06 ms | 123,42 ms |
| Zoom `tile.bake` | 11 | 13 |
| Zoom rAF-p95 | 126,76 ms | 126,46 ms |

**Interpretation:** Das Gate verhindert in der Vorbereitung
~98 % (95→2) und während des Schwenkens ~62 % (29→11)
der vorher protokollierten aussichtslosen Terrain-Bakes.
Die Vorbereitung ist aber weiterhin nicht READY (2 ausstehende
Tile-Aufträge, 25 % Coverage bei End-Snapshot). Die reale
Pan-Phase endet mit 100 % sichtbarer Coverage, aber nur
11 im Cache verbliebenen Tiles und 2 weiteren Pending-Aufträgen.
Die Warm-Kamera-Phasen sind beide weiterhin **ungültig**:
Pan 25 Bakes, eine globale `image-ready-ground`-Invalidierung
mit 15 zuvor vorhandenen Tiles, plus lokaler Scenery-Refresh;
Zoom 13 Bakes, 6 geänderte Ground-Revisions und ein Scenery-Refresh.

4×-Bildpool: Ende Pan 51,5 MiB über 576-MiB-Budget;
Pan 23 weitere Sprite-Image-Evictions, Zoom 50.
CPU-Tasksekunden: Pan 5,43→4,41, Zoom 5,00→4,67
(nicht als unabhängiger FPS-Beleg interpretieren).

**Weitere enge Korrektur im selben Draft #77:**
Beim tatsächlichen `pump()`-Dequeuing wird `canStartSource`
noch einmal geprüft. So kann ein ehemals bereiter Terrain-Kern
nicht unbeachtet verloren gehen, während ein anderes Tile
den einzelnen Source-Slot belegt. Eine zusätzliche gezielte
Regression für `ready → Warteschlange → Terrain unready →
Terrain ready → Bake` besteht (5/5 isolierte V8-Tests).

**Diagnose statt riskanter Änderung der Ground-Invalidierung:**
Der Reporter speichert jetzt die exakten Bilddateipfade und
Kategorien der `image-ready-ground`-Ereignisse aus der
bereits vorhandenen Trace. Erst danach bestimmen, ob eine
selektive globale Invalidierungsersetzung korrekt ist.
Es werden keine Bildpool-Budgets oder Grafikauflösungen geändert.
Schritt 16C/17 weiter gesperrt.

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

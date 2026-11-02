# Schritt 25A – Echtes Leistungsprofil des bereits vorberechneten 2×-Spielkarten-Viewers

**Status: Implementiert als optionales Profiling im Draft-Branch; native Firefox-Abnahme und tatsächliche 120-WorldTile-Messwerte stehen aus.** Datum: 02.11.2026. Baut unmittelbar auf Schritt 24 auf. Keine Source-/Renderer-Umschreibung und **kein** Karten-Rebake.

## Kontext und Architekturentscheidung

Der Nutzer möchte kein getrennt neu implementiertes Browsergame. Das Asset-Labor bleibt die einzige Kartenautoren-/Terrainquelle. Sein Offline-WorldTile-Atlas sowie der bestehende 2×-Derived-Cache bilden die Basis des fertigen Spiels.

**Wichtiger Unterschied:** Die bisherige Testkarte wird **nicht** aus dem einmal exportierten 600-MB-ZIP geöffnet. `frozen-map-game.html?scene=v1-0374527a&lod=near` liest `manifest` und WorldTile-PNGs aus dem persistenten Browser-IndexedDB-Store (`vedras-frozen-world-v1`), bevorzugt die bereits einmal abgeleiteten 2×-PNG-Layer in `vedras-frozen-derived-2x-v1`. Diese Blobs werden dennoch beim Bedarf wieder per I/O gelesen, in `ImageBitmap` dekodiert und auf Canvas gezeichnet. Ein vorhandenes Blob bedeutet **keine** permanent warme GPU-Textur.

Die geplante Server-/Client-Architektur ist nun in [Issue #103](https://github.com/markusjungblut/asset_labor/issues/103) vermerkt: *statisches vorgerendertes Terrain und Scenery als versionierter, regionenbezogener CDN/HTTP-Tile-Dienst; Manifest plus Startregion als kleines initiales Paket, nächster Ring im Hintergrund, lokaler persistenter Tile-Cache und begrenzter dekodierter RAM-/GPU-Cache; Fog/Autorisierung und dynamischer Spielzustand getrennt.* Für das jetzige Profiling **keine CDN-/Backend-Migration**. ZIP-Reimport ist Backup/Portabilität und allein keine FPS-Optimierung.

## Änderungen in 25A

- `frozen-map-profiler.js`: Opt-in, standardmäßig **inaktiv**, stateless gegenüber IndexedDB, Blob und Spielzustand. Er speichert maximal **2.400 Frame-Samples** und **750 Tile-Reads** als lokale, begrenzte Ringpuffer. Keine Server-Telemetrie und kein Schreiben in den Atlas.
- `?perf=1`: aktiviert das Profil im bestehenden Spiel-Viewer. Sichtbarer Button **„Performance-JSON“** lädt den lokalen Bericht herunter.
- `window.__vedrasFrozenGameTest.profileReport()` gibt denselben Bericht als Objekt zurück; `profileReset()` beginnt eine neue Messung, ohne Kartenbilder/IndexedDB zu löschen oder Kacheln neu zu backen.
- Zeitmessungen im tatsächlichen `VedrasFrozenMap`-Playback:
  - **Frame-Synchronzeit** von Draw-Eintritt bis nach Status-Callback.
  - Abschnittszeiten `selectMs` (Tile-Scan, Cache-Lookups, Prefetch-Anforderung), `worldMs` (Tile-/Raster-Komposition inklusive Cache-Aufbau), `groundMs`, `sceneryMs`, `maskMs` (sichtbare Hex-Clipping-Pfade), `cloudMs` (Backdrop), `fogMs` (Unready/Dissolve/Frontier), `statusMs` (diagnostische Anzeige).
  - **Asynchron:** `storageMs` je tatsächlich geladenem WorldTile (inklusive möglicher einmaliger 4×→2×-Ableitung), danach `decodeMs` für alle Layer und `totalMs`. Summe der Quell-Blobbytes und geschätzten dekodierten Pixel.
  - Canvas-Pixel, DPR, Zoom, Anzahl sichtbarer/dekodierter/in Arbeit befindlicher WorldTiles, Rastercache-Hits/-Builds pro Frame und Evictions im Endzustand.
  - Die tatsächlichen `pan`-/`zoom`-Pointer-/Wheel-Ereignisse markiert der Viewer. Berichte erfassen **Handler→Ende der nächsten Canvas-Zeichnung** sowie aufeinanderfolgende Frame-Intervalle während der Interaktion. Lange Ruhephasen zwischen zwei Events werden **nicht** irrtümlich als „2 Sekunden pro Frame“ gerechnet.
  - Zusammenfassungen p50/p95/p99, Grenzwertüberschreitungen >33,3 / >50 / >100 ms, separat für Pan und Zoom. Erster vollständig abgedeckter sichtbarer Viewport. Manifest-Read-/Scene-Registrierung.
- `&render=direct`: bereits vorhandener Referenzmodus aus Schritt 24. **Identischer PNG-Atlas, dieselben Hex-/Sprite-Regeln**, aber ohne zusätzliche World-/Cloud-Canvas-Caches. Dadurch kann Profiling die Kosten des Caches isoliert beurteilen.

### Interpretation / Messgrenzen

- `drawMs` und die Pass-Zeiten erfassen die **CPU-seitig sichtbare synchrone Dauer von Canvas2D-/JS-Aufrufen**. Sie umfassen keine garantiert synchronisierten GPU-Upload- oder Display-Present-Zeiten. `inputToDrawEndMs` ist **nicht** die echte Hardware-Input-to-Photon-Latenz.
- `frameGapMs` ist der Abstand zweier tatsächlich gezeichneter, aufeinanderfolgender aktiver Frames; keine allgemeine Monitor-FPS-Messung während idle. Kein Anspruch auf V-Sync-feste Zeitmessung. Frame- und Input-Statistiken nicht mit `1000 / einzelne DrawMs` zu vermeintlichen FPS umdeuten.
- `storageMs` einer noch nicht abgeleiteten 2×-Kachel kann **4×-Read, Downsampling, PNG-Encoding und IndexedDB-Write** enthalten. `record.derivedFormat` kennzeichnet das Ergebnis als 2×, nicht zwingend einen schon vorher vorhandenen Cachehit. Den Unterschied durch `derived2x.hits/converted` im Snapshot feststellen.
- `worldMs` beinhaltet bei Cache-Miss/Neuaufbau bereits `groundMs/sceneryMs/maskMs`. **Die Unterabschnitte nicht doppelt zu einem Gesamtwert aufsummieren.**
- Profiling hat kleinen zusätzlichen Overhead: Für endgültige FPS-Bestätigung den uninstrumentierten Viewer zusätzlich laufen lassen. Die Profiler-Stichprobe begrenzt ihre RAM-Wirkung.

## Reproduzierbarer lokaler Firefox-Test

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch feat/step25a-frozen-viewer-profiler-20261102
git pull --ff-only origin feat/step25a-frozen-viewer-profiler-20261102
node --test tests/test_rendering_step24_live_camera_depth_20261102.cjs
node --test tests/test_rendering_step25a_profiler_20261102.cjs
```

Den bestehenden Server auf `127.0.0.1:8780` starten. **Gleiches Firefox-Profil und dieselbe Origin** wie dein bereits gespeicherter 2×-Atlas; *keine Site-Daten löschen*.

1. **Cold Page / bereits persistierter 2×-Atlas:** `http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near&perf=1`. Ohne Bewegung warten, bis der anfängliche Bildbereich vollständig ist. Button `Performance-JSON` herunterladen; als `start-cached.json` aufbewahren. Durch den kalten Browser-RAM entstehen trotz vorhandenen 2×-Blobs Read-/Decodekosten.
2. **Warm Pan:** Ohne Browser-Neuladen in der Konsole `window.__vedrasFrozenGameTest.profileReset()`; mindestens 15 Sekunden **gleichmäßig horizontal, vertikal und diagonal** über bereits vollständig angezeigte Regionen ziehen. Bericht als `warm-pan-cached.json` speichern.
3. **Zoom:** `profileReset()`, dann mehrere Male aus 100 % auf 25–35 % und zurück zu 100 % per Wheel zoomen; als `zoom-cached.json` exportieren. Typische `zoom`-DPR-Werte sind im Frame enthalten.
4. **Unbekannte Client-Region:** `profileReset()`, in noch nicht RAM-dekodierte Regionen schwenken; als `cold-region-cached.json` exportieren, damit `storageMs`/`decodeMs` abgebildet werden.
5. **A/B Reference:** selben Weltbereich, Fenstergröße, DPR und gleiche Handbewegungen unter `http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near&render=direct&perf=1` wiederholen. **Direktmodus kann bewusst langsamer sein.** Vergleich mit cached zeigt den Nutzen bzw. die Kosten von World-/Cloud-Rastern.
6. Bei Zweifel visuell identische Landschaft im normalen und direkten Modus prüfen: dieselbe Sprite-/Schatten-/Fog-Reihenfolge. Verbleibende sichtbare falsche Sprite-Überlagerung ist ein Blocker aus Schritt 24 und darf nicht als FPS-Optimierung „versteckt“ werden.

### Prioritätsmatrix für Schritt 25B

| Gemessener dominanter Bereich | Nächster sinnvoller Architektur-Fix |
| --- | --- |
| `worldMs` hoch, `worldCacheBuilds` ständig steigend | Größere Welt-Canvas-Builds durch unabhängige, lokal verschiebbare Teilraster/Regionen ersetzen |
| `sceneryMs`/Ground hoch auch in warmen Frames | Layer-Compositing vereinfachen bzw. optional WebGL2-Texture-Quad-Renderer gegen Canvas2D testen |
| `maskMs`/ `fogMs` hoch | Authored Hex-Geometrie/Vektormasken wiederverwenden und dynamische Wolken vom statischen Bildpfad trennen |
| `storageMs` hoch, `derived2x.hits` niedrig und `converted` steigend | persistierte 2×-Tiles vollständig vorbereiten/gezielt initial bereitstellen; kein erneuter 4×-Bake |
| `decodeMs` hoch oder Re-Decodes/Evictions häufig | RAM-ImageBitmap-LRU und Zoom-abhängiges LOD-/MIP-Streaming korrigieren; Blob-Größe ≠ GPU-Pixelbudget |
| `selectMs` hoch mit großen Tile-Indizes | Spatial Index/Chunk Bounds und priorisierte Tile-Queue statt alle verfügbaren Kacheln pro Frame prüfen |
| `inputToDrawEndMs` hoch bei kleinen synchronen Renderphasen | rAF-/Task-Queue-Blocker, asynchrone Bildkonvertierung und Main-Thread-Langtasks separat untersuchen |

**Performance-Gates:** Zuerst beweisbarer warmer Pan **p95 ≤33,3 ms bei 30 FPS**, mittelfristig **p95 ≤16,7 ms bei 60 FPS**, keine zu früh freigegebenen Hexfelder, keine unscharfen Zwischenbilder, keine neuen Nähte oder Sprite-Überlagerungen. Erst dann schrittweise zum Server-Tile-Adapter und ZIP-Recovery vorgehen. Die 15.000-Hex-Welt bleibt langfristige Skalierungsprüfung, nicht Bestandteil dieses Mess-PR.

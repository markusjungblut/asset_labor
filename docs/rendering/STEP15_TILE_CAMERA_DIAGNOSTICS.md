# Schritt 15 – Kachel-Revisionen, Kamera und Fog diagnostizieren

**Stand:** 29.10.2026. **Implementiert und isoliert geprüft; Windows-/GPU-Abnahme offen.**  
**Verbindlicher Plan:** [RENDERING_ROADMAP_AFTER_STEP14.md](RENDERING_ROADMAP_AFTER_STEP14.md).  
**Vorher-Basis:** Schritt-14-Atlas-A/B-Messung auf 397 Hexen und 2631 Nature.

## Windows-Test

Im Projektverzeichnis nach `git pull --ff-only origin main`:

```powershell
.\START_STEP15_WINDOWS.cmd
```

Für eine verkürzte oder fokussierte Diagnose:

```powershell
.\START_STEP15_WINDOWS.cmd --qualities 4 --duration 1500 --warmup 1000
```

Das Skript startet einen isolierten lokalen Python-Server und einen frischen
Chromium-Prozess, importiert die **unveränderte Referenzszene** und speichert:

`artifacts\rendering-step15-diagnostics\step15-diagnostics.zip`

Darin befinden sich `result.json`, `README.md` und Bilder unter `images/`.
Der vorherige Schritt-13- und Schritt-14-Output wird **nicht** gelöscht.

## Was tatsächlich instrumentiert wird

- `world-tile-streamer.js`: `epoch`, vollständige bzw. selektive
  Invalidierungen mit explizitem Aufrufgrund, `tile.id@lod`-Cache-Misses
  (keine aktuelle Kachel / ältere LOD vorhanden / Preview-Upgrade),
  LOD-Wechsel, `source-start` / `source-end` inklusive Weltkoordinaten,
  Laufzeit, Fehler-/Retry-Zustand, Preview/Revision und LRU-Evictions.
- `app.js`: jeder tatsächlich aufgerufene `drawGround()`-/`drawRoads()`-
  Durchlauf mit Dauer und Kontext (`editor` versus
  `world-tile-fallback`, Tile-ID, LOD, DPR/Zoom), `bakeWorldTile`-Ausgang
  (`snapshot-hit`, `insufficient-snapshot-density`,
  `ground-snapshot-out-of-bounds`, `scenery-snapshot-out-of-bounds`,
  `terrain-or-assets-not-ready`, `fallback-*`) und Dauer.
- Gründe für FrameMemo-/Scenery-Invalidierungen, Bildnachladung,
  editorseitige Snapshot-Signaturänderungen und Kamerazooms. Die
  bestehende Kachelcache-Politik wird **nicht** verändert.
- Für jede der sechs bekannten Referenzpositionen gibt
  `cameraDiagnostics()` sowohl die gewünschte axiale Position als auch die
  aus der aktuellen Kameratransformation berechnete Position zurück.
  Zusätzlich werden `terrainTypeByHex` aus der importierten JSON,
  `worldCells[].terrainTypeId`, effektiver `typeOfCell()`-Typ und die
  Fog-Vorschauquelle `state.selected` gegenübergestellt.
- Fog ON/OFF wird bei identischer Kamera auf dem Kartenmittelpunkt
  fotografiert. Biome/Fog werden **nicht** stillschweigend korrigiert.

**Wichtig:** Die Exportdatei enthält `terrainTypeByHex`; beim bisherigen
Szenenimport legt `assignBiomes()` zunächst eine Demo-Geografie an und lädt
anschließend `baseBiomeByHex`. Das kann die gemeldete Meerabweichung
erklären, **ist durch Screenshot-Vergleich und `cameraDiagnostics` aber erst
zu bestätigen**. Dieses Diagnose-PR ändert die Import-/Biome-Semantik nicht.

## Kosten und Messgrenzen

Das neue `render-step15-trace.js` ist standardmäßig **deaktiviert**.
Der Browser-Test aktiviert es nur für die isolierte Messphase. Pro
Messfenster werden höchstens **1800 jüngste Ereignisse** gespeichert;
`dropped` gibt verlorene frühe Ereignisse an, während aggregierte
Ereigniszähler vollständig bleiben. Normalbetrieb hat keine
Trace-Konsole-/Datei-Ausgabe.

Die Messung speichert die tatsächlichen Kachel-Auftragsgründe, Tile-IDs,
Weltkoordinaten, Level, Revision und Kachelerstellungszeiten. Einige
Zeiten sind Wandzeiten mit eingebetteten Unterprozessen; sie dürfen
nicht addiert werden. Für die bereits instrumentierte Chrome-Main-Thread-
Taskzeit, rAF-p95 und Cache-/Speicherstatistik werden die vorhandenen
Schritt-13-/14-Helfer verwendet. Ein ungeprüfter Ladezustand wird
als `DIAGNOSTIC`, nicht `READY`, protokolliert.

**Dauerbelastung:** Bei 4× kann das vorhandene Terrain-Backen
weiterhin minutenlange Aussetzer verursachen. Schritt 15 soll das
*belegen und lokalisieren*, nicht bereits beheben.

## Abnahmebedingungen und nächste Phase

- Für Warm-4× liegen konkrete `tile.id@lod`-Folgen,
  Cache-Miss-Gründe, Snapshot-Fallbacks und
  `drawGround`-/`drawRoads`-Aufrufe pro Tile in `result.json` vor.
- Kamera-Zielkoordinaten und tatsächlich angezeigter Szenentyp für
  Meer `(-4,5)` und die übrigen Referenzbiome sind geprüft;
  Fog-Quelle und Differenz ON/OFF sind nachvollziehbar.
- Reproduzierbarer Engpass mit Vorherzahlen und klarer falsifizierbarer
  Hypothese für **Schritt 16** dokumentiert. Nicht auf Verdacht optimieren.
- Bestehende Canvas-/WebGL2-Pfade, Speicherbudgets, LOD-Hysterese,
  Export und Berechtigungsmasken nicht verändern.
- Nach Windows-Abnahme `STATUS.md` mit Messwerten und
  nächster tatsächlich offener Phase aktualisieren.

## Entwicklungstests

```powershell
node --test tests/test_rendering_step15_diagnostics_20261029.cjs
```

Sieben deterministische Tests decken ab: Opt-in-Ringpuffer,
same-scene-pan, same-LOD-zoom, selektives Terrain-Edit, globale
Invalidierung mit Ursache, Source-vs-Camera-Biomdiagnose und
Windows-/Packer-Verknüpfung. Diese sind im V8-Mock durchgelaufen.
Native Node-Tests und der echte Windows-Chromium-/GPU-Lauf stehen
noch aus. **Schritt 15 ist daher noch nicht vollständig abgenommen.**

# Schritt 14 – kontrollierter Atlas-AN/AUS-Test und Zoom-Profiling

> **Folgearbeiten:** [Rendering-Fahrplan Schritte 15–20](RENDERING_ROADMAP_AFTER_STEP14.md). Reihenfolge: Tile-Ursachen → Terrain-Reuse → interaktiver Kachelpfad → LOD/Fog → isolierter GPU-Vergleich.

**Zweck:** Erst messen, dann die Architekturentscheidung treffen. Diese Änderung
optimiert nicht die Renderqualität und aktiviert keinen neuen GPU-Renderer.

## Start unter Windows

Nach `git pull --ff-only origin main` aus dem Projektordner:

```powershell
.\START_ATLAS_AB_WINDOWS.cmd
```

Standard: exakt dieselbe gespeicherte 397-Hex-Szene mit 2631 Nature-Instanzen,
Atlas **AN** und anschließend **AUS** (umkehrbar per `--order off,on`), jeweils eine **frische Chromium-Instanz**
mit eigenem User-Data-Ordner. Fenstergröße 1280×820, Browser-DPR=1, Zentrum
Hex (0,0), Start-Zoom=0,70. Profile `auto` und `4`, Fog aus, dieselben
24-Punkt-Pan- und 22-Punkt-Zoom-Gesten (je 1800 ms nominell), 1200 ms Warmup.
Alle Messungen sind **Browser-GPU/CPU-Tests auf dem lokalen Rechner**, nicht CI.

Optional:

```powershell
.\START_ATLAS_AB_WINDOWS.cmd --qualities auto,4 --duration 2400 --warmup 1800
.\START_ATLAS_AB_WINDOWS.cmd --order off,on
```

Den zweiten Lauf mit umgekehrter Reihenfolge durchführen: Auch getrennte
Browserprofile teilen sich Betriebssystem-Dateicaches und GPU-Treiberzustand.
Sinnvoll sind mindestens drei Durchläufe pro Reihenfolge. Ein Test wird
**nicht** automatisch als Performanceverbesserung ausgelegt.

Ergebnis:

`artifacts\rendering-step14-ab\step14-atlas-ab.zip`

Enthält `result.json`, `README.md`, einzelne `on/result.json`,
`off/result.json` und je Variante die Kartenbilder.
Die bisherige Schritt-13-ZIP und deren Screenshots werden **nicht** angefasst.

## Messaufbau

Beide Varianten schalten **vor** dem Szenenimport den identischen Atlas-Code
explizit auf `on` beziehungsweise `off`. Damit wird der frühere automatische
Bypass für Karten mit mehr als 500 Pflanzen in der AN-Variante deaktiviert.
AUS nutzt immer den bestehenden `asset.img`-ImagePool. Renderqualitäten,
Kameraposition, Vegetationspositionen, Szenendatei, Chrome-Flags und Gesten
bleiben unverändert. AN verlangt ein gültiges Atlas-Manifest, andernfalls wird
der direkte Vergleich als ungültig eingestuft.

Pro Qualitätsstufe und Variante werden gemessen:

1. **Warm-Pan** über bereits geladene Kacheln;
2. **Warm-Zoom** entlang desselben wiederholbaren Zoomverlaufs;
3. **Cold-Zoom**: einmal vor der identischen Zoomgeste den Terrain-/Chunk-Cache
   bewusst invalidieren. Dadurch kann der kostspielige Neubau im Profil
   sichtbar werden. Diese Kennzahlen nie mit Warm-Zoom vermischen.

Jede Geste hat eine vorherige Ladeprüfung; alle Ladeprüfungen dauern höchstens
neun Sekunden. Nicht vollständig geladene Phasen bleiben im JSON als
`validStart=false` / `readyAfter=false` erkennbar und werden **nicht**
als gültiger Direktvergleich bezeichnet.

## Metriken, Bedeutung und Grenzen

| Gruppe | Werte | Aussage |
|---|---|---|
| Framezeit | rAF-p50/p95, lange Frames | Sichtbare Bewegung, nicht Renderfunktionsdauer |
| CPU-Main-Thread | CDP Performance.TaskDuration, TaskDuration/Wandzeit | Last-Proxy des **Hauptthreads**, nicht alle CPU-Kerne und nicht die GPU |
| Terrain | terrain.editorDrawMs, tile.groundRoadsMs, terrainBuilds | Zeichnen/Neuaufbau plus Anzahl abgeschlossener Terrain-Chunks |
| Vegetation | sprites.layoutMs, sprites.drawMs, sprites.drawnCount | Layout und tatsächlicher Sprite-Pass |
| Schatten | shadows.drawMs | Schattenpass einschließlich Mountain- und Nature-Grounding |
| Kachel-Erzeugung | tile.bakeWallMs, tile.sceneryMs, tile.compositeMs | Gesamtdauer des asynchronen Bake-Vorgangs und Teilphasen; „Wall“ kann auf Wartung entfallen |
| Bildquellen | images.loadWallMs, images.resampleMs | Laden einschließlich Netzwerk/Wartezeit/Decode versus Canvas-Vorschau-Resampling |
| Cache / Netzwerk | imagePool.ready/evicted, atlas.pageLoads/pageEvictions, ResourceTiming image/atlas | Zahl der Anforderungen, Neuaufbauten und Verdrängungen |
| Speicher | JSHeapUsedSize, ImagePool RGBA-Bytes, GPU-Textur-Schätzung | Keine Aussage über vollständigen physischen RAM/VRAM |

Die Bilddekodierzeit ist in Web APIs bei normalem `Image.onload` nicht sauber
von Netzwerk/Cache/Wartezeit trennbar. `images.loadWallMs` ist daher eine
**obere, gemischte Wartezeit**, keine präzise reine Decode-CPU-Zeit.
`images.resampleMs` ist dagegen ein synchroner Canvas-CPU-Zeitwert.
Terrain-Worker können außerhalb des Chrome-Main-Threads arbeiten; dafür liefern
die bestehenden Chunk-Statistiken Zähler, aber keine vollumfängliche CPU-Zeit.
Ebenso sind `tile.bakeWallMs`, `tile.sceneryMs`, `shadows.drawMs`
und `sprites.drawMs` **verschachtelt**: nicht miteinander addieren.

`PerformanceResourceTiming.transferSize` berücksichtigt Browsercache
und kann bei lokalem Server Null oder unvollständig sein. Die Anzahl der
ResourceTiming-Einträge ist kein Ersatz für tatsächlichen Netzwerkdurchsatz.
Statt Gesamt-RAM/VRAM zu behaupten, werden zugängliche Einzel-Schätzungen
protokolliert.

## Faire Auswertung

Ein Paar gilt nur als unmittelbar vergleichbar, wenn der Szenenimport
vollständig ist, der Atlas in AN aktiv ist, tatsächlich mindestens ein
Atlas-Aufruf gemessen wurde, AUS keinen Atlas-Aufruf ausgeführt hat,
und die jeweiligen Start- und Endkacheln vollständig waren. Andernfalls
bleibt das Ergebnis diagnostisch. Nach drei Wiederholungen je Reihenfolge
p50/p95, CPU-Main-Thread-Zeit, Bildladen und Bildqualität vergleichen.
Bei einem echten Vor-/Nachteil den Wirkmechanismus in den Zeitkategorien
nachvollziehen und **erst dann** entscheiden, ob Atlas, Canvas oder GPU
angepasst werden sollten.

Die Tests ersetzen keinen Profiling-Trace für eine exakte Zuschreibung
von Browser-Decoder- und GPU-Treiberzeit. Falls die Decode-Zeit als alleiniger
Engpass erscheint, anschließend gezielte Chrome-Performance-Traces verwenden.

**Wichtiger Qualitätskonfundierer:** Atlas-Seiten können native Bildpixel enthalten, während die AUS-Variante je nach Qualitätsprofil verkleinerte ImagePool-Vorschauen verwendet. Das gewählte Renderqualitätsprofil und der physische DPR sind in beiden Armen identisch, die *Quellauflösung einzelner Sprites* aber nicht zwingend. Deshalb Screenshots auf Schärfe und Silhouetten prüfen und den Benchmark zunächst als Vergleich der tatsächlich implementierten Renderpfade, nicht als isolierte Untersuchung einer einzigen GPU-Operation interpretieren.

# Vedras Schritt 14 – Atlas AN/AUS und Zoom-Ursachenanalyse

Messung: zwei **separate, frische Chromium-Prozesse und User-Data-Verzeichnisse**;
identische 397-Hex-Szene, gleiche Fenstergröße, DPR, Kamera (Hex 0,0 / Zoom 0,70),
Qualitätsprofile und deterministische Pan-/Zoom-Gesten. Cold-Zoom invalidiert vor der Geste
in beiden Varianten einmal gezielt die Terrain-/Kachel-Caches.
Atlas AN erzwingt Atlas-Versuche auch bei >500 Vegetationsinstanzen.
Atlas AUS unterbindet Atlas-Zeichnungen, nutzt denselben Asset-Pool.
Achtung: Atlas AN kann Original-Pixel verwenden, AUS eine reduzierte PNG-Vorschau.
DPR und Qualitätsprofil sind gleich, die Quellschärfe kann variieren: Bilder prüfen.
Versuchsanordnung: Reihenfolge im result.json. Bei Wiederholung --order off,on
verwenden, um Prozess-/OS-Caching-Reihenfolgeeffekte sichtbar zu machen.
Alle Ergebnisse sind vorläufig; die Reihenfolge AN → AUS ist fest. Mehrfach wiederholen.

**Interpretation:** CDP TaskDuration ist die kumulierte Browser-Main-Thread-Taskzeit
(Proxy für Auslastung eines Browserthreads), **keine systemweite CPU-%**.
Bildladezeiten enthalten Fetch/Warten/Dekodieren; nur images.resampleMs misst CPU-Canvas
Vorschauneuskalierung. Die Renderzeitkategorien können ineinander verschachtelt sein
(z. B. tile.bakeWallMs enthält tile.sceneryMs und Schatten) – **nicht addieren**.
Speicher in Byte: JSHeapUsedSize von CDP, geschätzter ImagePool-RGBA-Bytes;
keine Garantie für tatsächlichen RAM/VRAM. HTTP-Zähler sind Resource-Timing-Einträge,
keine verlässliche Zahl physischer Übertragungen bei Browsercaching.

## Vergleich

| Profil | Geste | gültig | AN p95 ms | AUS p95 ms | AN Main-Thread % | AUS Main-Thread % | AN Bild-Ressourcen | AUS Bild-Ressourcen |
|---|---|---|---:|---:|---:|---:|---:|---:|
| auto | pan | NEIN | 56.76 | 66.7 | 53.1 | 53.8 | 47 | 4 |
| auto | zoom | ja | 750.66 | 737.28 | 28 | 18.5 | 43 | 0 |
| auto | cold-zoom | ja | 743.94 | 757.18 | 39.8 | 45.7 | 40 | 46 |
| 4 | pan | NEIN | 3736.2 | 3657.17 | 92.4 | 88.1 | 451 | 83 |
| 4 | zoom | NEIN | 317.1 | – | 17.2 | 1 | 10 | 2 |
| 4 | cold-zoom | NEIN | – | 3690.4 | 0.5 | 90 | 0 | 29 |

## Atlas-Nutzung in den Messphasen

| Profil | Szenario | AN-Versuche | AN-Treffer | AN-Fallbacks | AUS-Bypass-Zeichnungen |
|---|---|---:|---:|---:|---:|
| auto | pan | 520 | 4 | 516 | 520 |
| auto | zoom | 4794 | 24 | 4770 | 4794 |
| auto | cold-zoom | 5492 | 168 | 5324 | 5574 |
| 4 | pan | 25224 | 265 | 24959 | 28240 |
| 4 | zoom | 1320 | 2 | 1318 | 0 |
| 4 | cold-zoom | 0 | 0 | 0 | 5105 |

## Zoom: CPU-Ursachen im direkten Vergleich

| Profil | Szenario | Modus | World-Tile-Wall ms | Tile-Grund/Straßen ms | Vegetation/Sprites ms | Schatten ms | Image-Resample ms | Bildlade-Wall ms |
|---|---|---|---:|---:|---:|---:|---:|---:|
| auto | zoom | AN | 0 | 0 | 227.2 | 136.4 | 0 | 0 |
| auto | cold-zoom | AN | 955 | 424.9 | 325.1 | 160.2 | 0 | 0 |
| 4 | zoom | AN | 10.2 | 0 | 57.9 | 116.1 | 0.4 | 315.7 |
| 4 | cold-zoom | AN | 0 | 0 | 0 | 0 | 0 | 0 |
| auto | zoom | AUS | 0 | 0 | 184.4 | 141 | 0 | 0 |
| auto | cold-zoom | AUS | 1425.4 | 674.3 | 151.8 | 182 | 0 | 0 |
| 4 | zoom | AUS | 0 | 0 | 0 | 0 | 0.3 | 3516.5 |
| 4 | cold-zoom | AUS | 3726.5 | 67.4 | 105.3 | 7224.4 | 1.4 | 8036.4 |

## Startbilder und Readiness
- on/auto/pan: DIAGNOSTIC, Wartezeit 9720ms, tile-queue-pending:6, coverage:0.24945054945054945, missing:3
- on/auto/pan: READY, Wartezeit 1546ms, 
- on/auto/zoom: READY, Wartezeit 1522ms, 
- on/auto/zoom: READY, Wartezeit 1525ms, 
- on/auto/cold-zoom: READY, Wartezeit 1532ms, 
- on/auto/cold-zoom: READY, Wartezeit 3955ms, 
- on/4/pan: DIAGNOSTIC, Wartezeit 13177ms, world-tile-compositor-not-active, no-visible-world-tiles, coverage:0.75, missing:1
- on/4/pan: DIAGNOSTIC, Wartezeit 9336ms, world-tile-compositor-not-active, no-visible-world-tiles
- on/4/zoom: READY, Wartezeit 7897ms, 
- on/4/zoom: DIAGNOSTIC, Wartezeit 9032ms, tile-queue-pending:11
- on/4/cold-zoom: DIAGNOSTIC, Wartezeit 10505ms, tile-queue-pending:9
- on/4/cold-zoom: DIAGNOSTIC, Wartezeit 9172ms, no-visible-world-tiles, coverage:0, no-exact-world-tiles, missing:4
- off/auto/pan: DIAGNOSTIC, Wartezeit 11058ms, world-tile-compositor-not-active, no-visible-world-tiles
- off/auto/pan: READY, Wartezeit 1535ms, 
- off/auto/zoom: READY, Wartezeit 1522ms, 
- off/auto/zoom: READY, Wartezeit 1528ms, 
- off/auto/cold-zoom: READY, Wartezeit 1541ms, 
- off/auto/cold-zoom: READY, Wartezeit 3824ms, 
- off/4/pan: DIAGNOSTIC, Wartezeit 12582ms, world-tile-compositor-not-active, no-visible-world-tiles, coverage:0.5, missing:2
- off/4/pan: DIAGNOSTIC, Wartezeit 12101ms, world-tile-compositor-not-active, no-visible-world-tiles
- off/4/zoom: DIAGNOSTIC, Wartezeit 11018ms, world-tile-compositor-not-active, no-visible-world-tiles
- off/4/zoom: DIAGNOSTIC, Wartezeit 9697ms, world-tile-compositor-not-active
- off/4/cold-zoom: DIAGNOSTIC, Wartezeit 10645ms, tile-queue-pending:11
- off/4/cold-zoom: DIAGNOSTIC, Wartezeit 10334ms, tile-queue-pending:12

## Begrenzungen und Prüfpflicht
- In Atlas AN muss die Atlas-Manifest-Datei vorhanden und aktiv sein.
- Mindestens ein tatsächlicher Atlas-Treffer ist nötig; reine Versuche mit PNG-Fallback genügen nicht.
- Hat eine Variante keinen Atlas-Versuch oder fehlen sichtbare Kacheln, ist der direkte Vergleich ungültig.
- A/B-Tests mindestens dreimal wiederholen und bei verändertem Qualitätsprofil separat bewerten.
- Statische Vorberechnung und WebGL-Uploads können auf anderen Threads laufen; die Main-Thread-Taskzeit misst diese nicht.
- Screenshots visuell auf dieselben Biome und fehlende Pflanzen prüfen.

Details: `result.json`, Kartenbilder in `on/` und `off/`.

# Schritt 25W – Native Firefox-IndexedDB-/Bitmap-Zeitaufteilung

**Datum:** 11. November 2026  
**Ziel:** Speichern/Laden bereits vorberechneter Karten-PNGs statt Baken oder Neu-Erzeugen untersuchen.  
**Branch:** `perf/step25w-real-indexeddb-profile-20261111`  
**Draft #133**, im Stapel hinter #132 → #131 → #130 → #129 → #128; die gesonderte #127 wird nicht verwendet.

## Versuch

`tests/automated_browser_real_idb_profile.cjs` erzeugt eine **eigene, isolierte IndexedDB** im temporären Firefox-/Playwright-Browserkontext. Auf einem temporären HTTP-Origin werden **99 vorab generierte PNG-Kachelpakete** gespeichert, je mit einem **512×512 Ground**- und einem **768×768 Scenery**-Blob. Jede anschließende `storage.get`-Antwort stammt aus echten `IDBObjectStore.get`-Reads und einer abgeschlossenen `IDBTransaction`. Die Bilder werden mit realem `createImageBitmap` geladen und im unveränderten Viewer auf den Canvas gezeichnet. Die ursprüngliche lokale IndexedDB wird **nie** geöffnet oder verändert.

Vier ABBA-Kamerarouten (`visibleBorrow=0/1/1/0`) nutzen dieselben Pan-Positionen `0,-550,-1100,-1650,-1100,-550,0`, dieselbe 99-Tile-Szene und unveränderte Bounding-/Fog-Geometrie. Das bestehende Profiling erfasst `storageMs`, `decodeMs`, `totalMs`, tatsächliche sichtbare Tile-Bereitschaft pro Kamerastopp, individuelle Bitmap-Layer-Dekodierung, Evictions und aktives Borrowing. **Keine** künstlichen Leseverzögerungen.

## Reale Firefox-Ergebnisse

Erfolgreicher CI-Lauf: [GitHub Actions #43077106705](https://github.com/markusjungblut/asset_labor/actions/runs/43077106705) auf Commit [`84d70f1`](https://github.com/markusjungblut/asset_labor/commit/84d70f18bca549fd65e2be4277718d482e6f062a).

| Lauf | Borrow | Tile-Reads | Median IndexedDB `storageMs` | Median `decodeMs` | Median bis Sichtbarkeit je Kamerastopp | Tatsächliche Borrow-Starts |
|---|---|---:|---:|---:|---:|---:|
| A1 | aus | 15 | 7 ms | 23 ms | 49 ms | 0 |
| B1 | an | 15 | 8 ms | 25 ms | 48 ms | 1 |
| B2 | an | 15 | 8 ms | 27 ms | 46 ms | 1 |
| A2 | aus | 15 | 9 ms | 24 ms | 48 ms | 0 |

**Gesamt:** 60 tatsächliche IndexedDB-Reads, davon jeweils 12 sichtbare fertig dekodierte Tiles pro Kamerafahrt. Durchschnitt der vier Storage-p50: **8 ms**; Durchschnitt der vier Decode-p50: **24,75 ms**. Bitmap-Dekodierung hat in dieser Testumgebung die deutlich längere Laufzeit. Diese Mediane sind **nicht** die Summe der End-to-End-Latenzen: mehrere Reads und Decodes können überlappen.

**Borrowing unter echtem IDB:** Die Zahl des zusätzlichen sichtbaren Starts war in beiden aktivierten Durchläufen 1. Die Median-Zeit pro Kamera-Stopp (`readyMs`) bleibt jedoch praktisch gleich. Daraus darf **keine** allgemeine Beschleunigung von `visibleBorrow=1` für schnelle reale Datenbankzugriffe abgeleitet werden. Beim vorherigen 95-ms-Storage-Mock (Step25V) war die dritte neue Bitmap 103 ms früher auf Canvas; dieser Effekt ist **latency-sensitive**.

Alle vier Durchläufe erzeugten den identischen Endpixelhash `56fceb94`. Keine PNG-/IDB-Fehler, kein Überschreiten des Pixel-RAM-Budgets, und alle sichtbaren Tiles wurden vollständig gezeichnet.

## Testsicherheit / Grenzen

CI #43077106705 bestand **90/90 Node-Tests**, die bisherige vollständige echte Firefox-120-Tile-Regression, den sechsfachen 95-ms-Mock-A/B-Test aus 25V und den zusätzlichen vierfachen **echten** IndexedDB-Test. Ergebnisdatei `test-artifacts/firefox-real-idb-profile.json` enthält die Einzelzeiten und Kamera-Messpunkte.

Der erste Ausführungsversuch [CI #43076472787](https://github.com/markusjungblut/asset_labor/actions/runs/43076472787) scheiterte ausschließlich an einer fehlenden lokalen `median`-Hilfsfunktion im Browser-Eval-Kontext. Der Viewer blieb unverändert; die Messmethode wurde korrigiert. Das Dokument ist `[skip ci]`, sodass kein zusätzlicher Browserlauf erforderlich ist.

Der CPU-/Firefox-Laborbefund ist **kein** nativer Windows-GPU-/FPS-Nachweis auf der privaten 397-Hex-Originalkarte. Die Test-PNGs sind synthetische Muster, ihre Dateigrößen und Decode-Kosten repräsentieren nicht zwingend die des echten Atlas. Die nächste gezielte A/B-Frage lautet: Können die beiden **unabhängigen** Ground-/Scenery-Bitmaps einer Tile parallel dekodiert werden, ohne die RAM-Grenzen, Fehlerfreigabe, Layer-Reihenfolge oder Pixelparität zu verletzen?

## Integrationsentscheidung

Schritt 25W ist **rein diagnostisch** und ändert weder Rendering noch Fog-/Archivdaten. #133 bleibt Draft auf #132 gestapelt; `main`, uncommittete Windows-Dateien und der Originalatlas sind unverändert. Keine Zusammenführung ohne echten End-to-End-Befund.

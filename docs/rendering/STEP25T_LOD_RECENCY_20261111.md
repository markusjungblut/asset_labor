# Schritt 25T – LOD-sensible Cache-Verdrängung nach letzter Sichtbarkeit

**Datum:** 11. November 2026  
**Branch:** `perf/step25t-lod-recency-eviction-20261111`  
**Abhängigkeit:** Experimenteller Draft #130 auf Draft #129 (Richtungs-Prefetch) auf Draft #128 (statische Metadaten). Die separate World-Band-Index-Studie #127 wird nicht übernommen.

## Ausgangslage

Der Viewer einer fertig vorberechneten Karte verwendet ausschließlich bereits exportierte
PNG-Tile-Pakete, deren abgeleitete 1×-/2×-Varianten und ein begrenztes
RAM-Budget für dekodierte Bitmaps. Gelände, Bäume und Straßen werden
bei Kamerabewegung **nicht** neu erzeugt.

Bei `decodedPixels > maxDecodedPixels` bevorzugte die bisherige
Verdrängung:

1. Noch nie sichtbar genutzte spekulative Bitmaps,
2. ausnahmslos `entry.variant !== activeVariant`,
3. danach die ältesten Einträge des Map-LRU.

Schritt 2 kann bei einem Zoom-LOD-Wechsel gerade eben gezeichnete
2×-Bitmaps evicten, obwohl ein älteres **nicht sichtbares**
1×-Bitmap ebenfalls verdrängt werden könnte. Beim unmittelbar
folgenden Zurückzoomen muss das entfernte 2×-Bild dann neu aus
IndexedDB gelesen und dekodiert werden.

## Änderung

- Das jeweilige dekodierte Bildpaket merkt sich `lastVisibleFrame`,
  aktualisiert ausschließlich durch eine echte sichtbare Nutzung
  (einschließlich der bereits bestehenden Fallback-Zoomdichte).
  Spekulatives Prüfen markiert ein Bild **nicht** als sichtbar.
- **Bestehende Sicherheitsreihenfolge bleibt:** Aktuell sichtbar
  verwendete Schlüssel sind wie bisher geschützt; spekulativ
  geladene und noch nie sichtbar verwendete Bitmaps werden
  zuerst entfernt.
- Bei allen übrigen **evictable** Kandidaten bestimmt
  `lastVisibleFrame` die Opferreihenfolge: Wer am längsten
  nicht mehr sichtbar war, wird zuerst verdrängt. Das
  *inaktiv*-LOD-Merkmal erzwingt keine vorzeitige Verdrängung mehr.
- Unverändert: Speicherlimit `maxDecodedPixels`, Tile- und
  Szenenschlüssel, sichtbare Renderanforderungen, 1×/2×-Hysterese,
  Fog-Schutz, Ground-/Scenery-Bildquelle und Bilderqualität.
  Keine neue Schreiboperation auf Atlas/IndexedDB.
- **A/B-Rückfall:** `?lodRecency=0` behält die historische
  Reihenfolge, `?lodRecency=1` nutzt die neueste
  Verdrängungsregel. `report().lodRecencyEvictions` zählt
  Entscheidungen, bei denen trotz vorhandener inaktiver
  Kandidaten stattdessen ein älterer Kandidat der aktuell
  verwendeten Zoomdichte verdrängt wurde.

## Deterministische Node-V8-A/B-Nachweise

Die Regression `tests/test_rendering_step25t_lod_recency_20261111.cjs`
nutzt **99 unveränderliche Tiles** in einem 11×9-Raster,
zwei Bitmap-Layer je Tile (Ground + Scenery), Varianten 512×512
(2×) und 256×256 (1×), einen 640×420-CSS-Viewport,
`zoom=.85`/ `.50`, identische Ladeantworten und
**10 Zeichnungen je Kamerazustand**. Der Renderer
zeichnet per Canvas-Stub, führt echte LRU-Lese-,
Bitmap-Lifecycle- und RAM-Budget-Entscheidungen aus
und kann nur synthetische CPU-/Speichereffekte belegen.

Die isolierte Voranalyse der identischen Kameraabfolgen ergab:

| Szenario | RAM-Limit | Verdrängung alt: Re-Decodes / Evictions | Neu: Re-Decodes / Evictions |
|---|---:|---:|---:|
| Sechs 1×-/2×-Zoomwechsel | 5.000.000 Pixel | 29 / 39 | **3 / 6** |
| Pan + wechselnde 1×-/2×-Zooms | 5.000.000 Pixel | 36 / 52 | **19 / 34** |
| Nur Kamerarückfahrten ohne Zoom | 5.000.000 Pixel | 3 / 8 | 3 / 8 |
| Sechs Zoomwechsel bei vollständig warmem Cache | 9.500.000 Pixel | 0 / 0 | 0 / 0 |
| **Negativer Grenzfall:** Pan+Zoom mit sehr engem Budget | 3.000.000 Pixel | 51 / 78 | **52 / 76** |

**Wichtig:** Der Vorteil hängt von Cache-Dichte, Bewegungsabfolge
und verfügbarem RAM ab. Der bewusst getestete 3-Mio.-Pixel-Grenzfall
belegt, dass die neue Reihenfolge **nicht in jedem Szenario** weniger
Dekodierungen verursacht: Dort steht einem zusätzlichen Re-Decode
eine Verringerung der Evictions gegenüber. Es handelt sich
daher um eine **reversible Cache-Strategie**, nicht um einen
generellen oder garantierten FPS-Gewinn.

## CI-Abnahme

[GitHub Actions #42938985922](https://github.com/markusjungblut/asset_labor/actions/runs/42938985922)
auf Code-Commit
[`095405a`](https://github.com/markusjungblut/asset_labor/commit/095405a2fbad4cd3eb405a75df2091f0f3e39036):
**86/86 Node-Tests, 0 Fehler, und die vollständige echte
Headless-Firefox-Regression erfolgreich**. Die CI enthält
alle bisherigen Pan/Zoom-, Fog-, Speicher-/Cache- und
1×-/2×-LOD-Regressionen sowie den neuen
A/B-/Grenzfall-Nachweis.

**Noch keine native Windows-FPS-Abnahme.**
Die private 397-Hex-Originalkarte mit ihren Bilddateien,
ihrem tatsächlichen RAM-Druck und ihren Fog-Berechtigungen
wurde ohne Zugriff auf den lokalen Windows-PC nicht
neu vermessen. Aus den synthetischen Re-Decode-/Eviction-Zahlen
wird keine Frame-p95- oder Qualitätsverbesserung abgeleitet.

## Integrationsregel

Draft #130 bleibt bis zur späteren Abnahme auf #129 gestapelt;
#129 baut auf #128 auf. #127 bleibt ein unabhängig ungemergtes
Experiment. Kein automatischer Merge und kein direkter
Schreibzugriff auf `main`, die Originalkarte oder mögliche
uncommittete Windows-Dateien.

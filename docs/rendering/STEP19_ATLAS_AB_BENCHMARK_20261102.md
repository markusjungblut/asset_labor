# Step 19 – A/B-Benchmark vorhandener Vedras-Spielkartenbilder

Stand: 02.11.2026 · **Implementiert als isolierter Prototyp, reale Messung auf Windows/Firefox ausstehend** · Bezug: [Issue #103](https://github.com/markusjungblut/asset_labor/issues/103).

## Zweck und verbindliche Nicht-Ziele

Wir testen die bestehende **4×-Frozen-Map `v1-0374527a`, LOD `near`**. Das bereits exportierte ZIP von ungefähr 600 MB und sämtliche vorbereiteten PNGs bleiben **unverändert**. Es gibt **keinen neuen `bakeWorldTile()`-Aufruf**, keine Terrain-/Objekt-Worker, keine neue Spielwelt.

Der Browser öffnet `frozen-map-benchmark.html?scene=v1-0374527a` unter **derselben Origin** wie das bisherige Asset-Labor (Beispiel: `http://127.0.0.1:8780/`). Es wird die unveränderte DB `vedras-frozen-world-v1`, Object Store `tiles`, über die bestehende **read-only-API** `loadManifest/get/keys` geöffnet. Alle transformierten Vergleichsdateien werden ausschließlich in `VedrasFrozenMap.memoryStore()` gehalten. Keine `put()`-Operation auf dem Quell-Store, keine Archive überschrieben und keine Speicherbereinigung. Ein vollständiger ZIP-Import ist ein **anderes** P0-Arbeitspaket.

## Start

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch feat/step19-asset-atlas-ab-benchmark-20261102
git pull --ff-only origin feat/step19-asset-atlas-ab-benchmark-20261102
node --test tests/test_rendering_step19_atlas_ab_benchmark_20261102.cjs
```

Den lokalen bestehenden Server auf Port **8780** starten. Mit **demselben Firefox-Profil, derselben Adresse und demselben Port** öffnen:

`http://127.0.0.1:8780/frozen-map-benchmark.html?scene=v1-0374527a`

Alternativ im eigenständigen Spielkarten-Viewer „Bildatlas vergleichen“ öffnen. Wenn „Keine vorbereitete Spielkarten-Geometrie“ erscheint, prüfen, ob die Karte noch unter dieser Origin im ursprünglichen Viewer lesbar ist. **Keine Löschung von Website-Daten oder IndexedDB** zur Fehlerbehebung.

Einmal „Benchmark mit fünf Varianten starten“ anklicken, den Tab im Vordergrund lassen und nach Abschluss „Messreport als JSON herunterladen“. Das erzeugte Report-JSON enthält auch die zehn ausgewählten Tile-IDs, Original- und Transform-Metadaten, SHA-256, Größen, Ladezeiten, Messungen pro Zoomstufe und A/B-Screenshot-Abweichungen. Die Screenshot-Galerie kann geöffnet und visuell bewertet werden.

**Nicht:** Das komplette ZIP erneut importieren, 600 MB an ChatGPT hochladen, die Spielwelt erneut vorberechnen oder die Originale konvertieren.

## Stichprobe und kontrollierte Bedingungen

Der Benchmark wählt deterministisch **fünf disjunkte Paare direkt benachbarter gespeicherter 512er WorldTiles** (max. zehn) aus der bestehenden Near-Tileliste. Dabei wird räumliche Verteilung bevorzugt. Er erfindet keine Kachel-IDs und liest auch keine anderen, unbekannten Dateien. Im **ersten Lauf** müssen die fünf Paare visuell kategorisiert werden: Wald, Küste, Ebene, Berg, Infrastruktur. **Aus den bisherigen Export-Metadaten lässt sich das enthaltene Biom je WorldTile nicht zuverlässig ablesen**. Bei fehlender Abdeckung wird die Stichprobe in einem späteren PR mit tatsächlichen, im Report identifizierten IDs ergänzt.

Nur die gewählten Tiles liegen im Benchmark-Memory-Store; die Bildfläche außerhalb dieser Stichprobe ist absichtlich **nicht vollständig geladen** und deshalb **kein Maßstab für die Bildabdeckung des 120-Tile-Spiels**.

Alle Varianten nutzen dieselben Tile-Paare, `manifest.cells`, `near`, dieselben 512er Positionen, projizierte Y-Achse 0,85, dieselben Kamerawege, **Canvas-DPR 2** und die Zoomstufen **28 %, 65 %, 100 %, 150 %**. Die Kontrolldaten werden aus identischen, temporären In-Memory-Stores dekodiert; so wird nicht eine Quelle aus IndexedDB mit einer anderen aus RAM unfair verglichen. Die tatsächliche ursprüngliche IndexedDB-Lesezeit wird getrennt beim Import protokolliert. Noch **keine garantierte echte Cold-Disk-I/O-Messung** je Ableitung.

## Varianten

| Gruppe | Vorgehen | Geometrischer Schutz |
|---|---|---|
| A | Originale PNG-Blob-Referenzen unverändert | `crop`, `pad` und Quelldimensionen unverändert |
| B | Scenery/Structures: zusätzliche transparente Ränder abschneiden, falls mindestens 2 % Pixelersparnis und 4.096 Pixel; 2 px transparenter Puffer | `crop.x/y` um abgeschnittene **Bildpixel** erhöhen, ursprüngliche `fullWidth/Height` erhalten; Ground/Gutter nicht beschneiden |
| C | PNG auf 50 % Breite und Höhe skalieren, hochwertige Interpolation | `crop.x/y/fullWidth/fullHeight` mit tatsächlichem X-/Y-Skalierungsfaktor umrechnen; `pad` in Weltkoordinaten erhalten |
| D | PNG auf 25 % Breite und Höhe skalieren | Wie C; nur Kartenübersicht als mögliche Zielverwendung |
| E | PNG in WebP (Browser Canvas `image/webp`, Qualität `0.92`) umkodieren | Unveränderte Pixeldimensionen und Metadaten; **nicht als verlustfrei deklarieren** |

Die Canvas-API in Firefox garantiert für `toBlob('image/webp')` keinen echten **lossless**-Encoding-Modus. Daher ist WebP-lossless hier **nicht implementiert**. Ein späterer lokaler `cwebp -lossless`-Lauf kann die Gruppe E1 ergänzen; dieser Benchmark verwendet E als E2 (hochwertiges WebP). Wenn der Browser WebP-Encoding nicht unterstützt, markiert der Report diese Gruppe als übersprungen.

### Schatten-, Transparenz- und Kachelgeometrie

- Auf dem Frozen-Atlas sind Gelände, Vegetation, Gebäude und ihre **bereits gerenderten Schatten in Layer-Pixeln eingebettet**. Die ursprünglichen Sprite-Positionen, Schatten-Parameter und Autorendaten werden **nicht** bearbeitet.
- Scenery-Layer können **bereits** `crop:{x,y,fullWidth,fullHeight}` aus `packWorldTileScenery()` enthalten. Ein zweiter Beschnitt ist nur korrekt, wenn `crop` den neuen Teilbereich relativ zur **alten Full-Canvas-Logik** beschreibt. Das erledigt `cropLayerMetadata()`.
- Für Downsampling wird `crop` mit dem **effektiven**, aus tatsächlichen gerundeten Pixelmaßen berechneten Faktor multipliziert. So bleibt das Bildschirmrechteck identisch; die Quellschärfe ändert sich.
- Die **512er WorldTile-Koordinaten**, `pad` und Ground-Gutter bleiben unverändert. Wir schneiden Bodenmaterial nicht ab, damit keine neuen Kachelnähte entstehen.
- Ein automatischer visueller Vergleich des ersten Paars bei 100 % Zoom liefert `changedPct` und RGB(A)-RMS auf einer konstanten 2×-Ausgabe; dazu erscheinen vollständige Vergleichsbilder. Die Qualitätsbewertung von Schatten, Wald, Küste und LOD muss **von einer Person** geprüft werden. Ein numerischer Qualitätswert allein entscheidet nicht.
- Für B sollte die kompositorische Ausgabe mit A praktisch identisch sein; jede neue sichtbare Naht oder abgeschnittene Kontur ist ein **Abbruchgrund**.

## Messfelder

- Quelle: Dateigröße/Layertyp/Pad/Crop, tatsächliche IndexedDB-Lesedauer pro Paket, SHA-256 aller Stichproben-Original-Layer.
- Transformation: ursprüngliche und resultierende Bytes, Pixelzahl und Pixel-RAM-Schätzung (`Σ(width×height×4)`), Eingangs-PNG-Decoding und Ausgabe-Encoding getrennt, Vorbereitungszeit pro Gruppe.
- Anzeige: `readyMs` und `initialMs` bis zur Dekodierung der im Stichproben-Viewport sichtbaren Tiles, `paintP50/p95` der tatsächlichen `FrozenMap.draw()`-Komposition, beobachteter `requestAnimationFrame`-Gap-p95 und Bilderzahl pro Zoomstufe; PNG-Nachladungen/Fehler.
- Qualität: identische Pixelansicht des ersten Paars, automatischer Differenzwert, manuelle Prüfung aller fünf Paare (Grenzen, Alpha-Halos, Schatten und Bildschärfe).
- **Externe Störgrößen**: Daten ausschließlich aus Teilmenge (10 Tiles); Browser-/GPU-Caches variieren, Bench-Tab muss sichtbar bleiben; zehn Stichproben erlauben **noch keine FPS-Garantie für alle 120 Tiles**.

## Abnahme/Entscheidung

1. **Originalschutz:** Originalquelle wird nur gelesen; alle Stichproben-SHA-256 vor/nach gleich (`sourceUnchanged:true`).
2. **Geometrie:** Keine versetzten Objekte, abgeschnittene Schatten, Alpha-Säume oder neue Chunk-Seams bei A/B; C/D/E werden visuell bei identischen Kameraposen geprüft.
3. **Optimierung:** Bei C sind rechnerisch ca. 25 %, bei D ca. 6,25 % der ursprünglichen Pixelmenge zu erwarten. Tatsächliche PNG-Bytes, Upload/Decode, RAM und Bildzeiten sind **separat** zu messen.
4. **Geschwindigkeit:** Für den späteren Spiel-Viewer warmes Pan/Zoom als Ziel `p95 < 16,7 ms` (60 FPS), Zwischenziel `p95 < 33,3 ms`. Dieser Stichprobenbenchmark **belegt den Zielzustand nicht automatisch**.
5. **WebP:** Nur verwenden, wenn Byte-Senkung auch reale Lade-/Renderingvorteile bringt und keine sichtbaren Alpha- oder Schattenartefakte entstehen.
6. **Priorisierung:** Wenn ein Render-Slowdown hauptsächlich durch Canvas-DPR oder kompositorische Arbeit ausgelöst wird und auch kleinere Bilddateien kaum `paintP95` reduzieren, als nächsten Schritt **Canvas-/Compositor-Architektur** optimieren statt Original-Sprites anzufassen.
7. Keine Übernahme in den produktiven Viewer und kein Löschen von Original-Dateien, bevor Messreport **und** visuelle Prüfung vorliegen.

## Sicherheit und Status

Dieser Branch enthält **keine vollständige ZIP-Rückimportfunktion** (separat Issue #103 P0). Aus dem Test werden keine 600 MB auf GitHub hochgeladen. PR bleibt Draft, bis native Tests und reproduzierbare Firefox-Daten ausgewertet sind.

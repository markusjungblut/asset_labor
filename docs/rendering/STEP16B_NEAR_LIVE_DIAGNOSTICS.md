# Schritt 16B – echtes Firefox-Live-Panning bei 122 % / Qualität 4×

## Nutzerbefund (01.11.2026)

Nach dem Refresh-Fix aus #94 meldet der Benutzer weiterhin
**unverändert schlechte Browserperformance** und durchgehend
`terrain-not-painted` in der vorherigen Tabelle
`tileDiagnostics().artwork`.

## Präzisierung: `terrain-not-painted` ist kein Beweis für einen blockierten Direct-Bake

Der Diagnoseaufruf nutzte `tileArtworkStatus(t,details)` und
prüfte damit die **Snapshot-Seed-Bedingung**:
`paintedTerrainCore(t)`. Dieser Status kann korrekt false bleiben,
solange der Fast-Tile-Modus den normalen Editor-`draw()` überspringt.

Die echte WorldTile-Source arbeitet anders:
`canStartSource:tile=>tileArtworkStatus(tile,null,true)` und
`bakeWorldTile()` verwenden im Fallback `currentTerrainCore(t)`,
also **vorbereitete** statt vorher auf den Editor-Canvas
gezeichnete Chunks. Ein gemeldetes `terrain-not-painted`
bei der alten Diagnose allein erklärt darum nicht, ob der
**direkte Renderer** laden kann.

Neues read-only Diagnosepaar pro sichtbarem Tile:

- `ready` / `reason`: darf die Quelle als fertiger
  Bildschirm-/Staging-Snapshot veröffentlicht werden?
- `bakeReady` / `bakeReason`: darf der Live-Renderer
  die vorbereitete Quelle **direkt offscreen** backen?
- `bakeTerrainVersion`, `bakeWaitingAssets`: Quellrevision
  und noch nicht dekodierte Assets, ohne zusätzliche
  Bildanforderungen auszulösen.

Ein Tile mit `reason='terrain-not-painted'` und
`bakeReady=true` ist **kein** fehlender Terrain-Core.

## Zweiter belegter Engpass: unoptimiertes Near-LOD

Das reale Screenshot zeigt 122 % Zoom. Das oberhalb der
Near-LOD-Schwelle, sodass pro 512-Welteinheiten-Tile
bei `near` bisher rechnerisch gespeichert wurde:

| Layer | Pixeldichte | Größe | Pixel |
|---|---:|---:|---:|
| Ground | 2,5 | 1295×1101 | 1.425.795 |
| Scenery inklusive 128-Weltüberhang | 1,9 | 1459×1240 | 1.809.160 |
| **Gesamt** | | | **3.234.955** |

**Acht** vollständige, unbeschnittene Near-Tiles belegen
**25.879.640** von 26.000.000 Rasterpixeln. Weitere LOD-Varianten,
ältere Tiles oder zusätzliche sichtbare Tiles erzeugen folglich
deutlichen Speicherverdrängungsdruck. Die frühere
verlustfreie Alpha-Beschneidung aus #89 war nur für `mid`
aktiv und hat genau diesen Fall nicht verbessert.

Die Änderung aktiviert die **identische, bereits für Mid
erprobte Scenery-Randkompression auch für Near**:
- Keine Veränderung von Boden- oder Scenery-Auflösung.
- Alle Alpha>0-Pixel erhalten, zwei transparente Schutzpixel,
  ursprünglicher 128-Weltüberhang und exakte World-Space-Abbildung.
- Nur fertig gerenderte Scenery; nie Preview, Terrain oder Fog.
- Wenn keine transparenten Ränder vorhanden sind, bleibt
  das ursprüngliche Raster erhalten.
- Kein erhöhtes Budget, keine gelockerten Readiness-Gates.

**Die konkrete Speicherersparnis hängt vom Inhalt der Near-Tiles
ab und ist im normalen Firefox-Browser noch NICHT gemessen.**
Diese Änderung reduziert nicht direkt die Kosten des einmaligen
Terrain- und Scenery-Bakes. Sie adressiert zuerst den
zu knappen Near-LOD-Cache, nicht sämtliche Cold-Ladezeiten.

## Validation

Im isolierten JS-Test wurden **14/14** relevante
Testfunktionen bestanden: die zehn Alpha-/Geometrie-Tests
der Scenery-Kompression (mit angepasstem Near-Fall)
sowie vier zusätzliche Tests über die differenzierte
Prepared-vs-Painted-Readiness und das Near-Rasterbudget.

`START_STEP16B_TESTS_WINDOWS.cmd` erwartet jetzt
**105 Tests in zehn Dateien**. Der bisherige Windows-Erfolg
94/94 gilt nur für den **älteren** Commit. Die neuen 105
sowie der normale Firefox-Livetest sind **noch offen**.

### Windows-Nachtest

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status --short
git fetch origin
git switch fix/step16b-near-cold-tile-memory-and-readiness-20261101
git pull --ff-only origin fix/step16b-near-cold-tile-memory-and-readiness-20261101
.\START_STEP16B_TESTS_WINDOWS.cmd
```

Danach lokalen Server auf dieser Arbeitskopie **neu starten**
und in Firefox `Strg+Umschalt+R`; Checkbox-Text
`Echter Tile-Renderer · 16B-Near-Live-Test` verifizieren.
Karte ohne jede Audit-Vorwärmung bei 4× und 122 % Zoomeinstellung
öffnen, 5–10 Sekunden ruhig betrachten, anschließend frei pannen.
Die Ausgabe der Konsole:

```js
const v=window.VedrasAssetLabor;
console.table(v.tileDiagnostics({limit:30}).artwork.map(x=>({
 tile:x.id,snapshot:x.reason,
 bakeReady:x.bakeReady,bakeReason:x.bakeReason,
 waiting:x.bakeWaitingAssets?.join(',')
})));
console.log('world',v.worldTileStats());
console.log('images',v.assetMemory());
console.log('camera',v.cameraStats());
```

Echte nächste Korrekturen erst anhand der **`bakeReason`**
und WorldTile-`retryExhausted`, `pending`,
`evicted`, `pixels`, `LOD`, ImagePool-`queued`,
`active` und `evicted` ableiten. Ein erfolgreicher
Near-Memory-Fix belegt **noch keine** flüssige freie
Cold-Kamera. Produkt-Issue [#92](https://github.com/markusjungblut/asset_labor/issues/92)
bleibt offen; Ozean-Pixelnaht #90 nachrangig.

**Alle PRs Draft, nichts mergen; Schritt 16B
Produktabnahme und 16C/17 weiterhin offen.**

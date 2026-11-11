# Schritt 25U – Sichtbare Tile-Reads vor blockiertem Hintergrund-Prefetch

**Datum:** 11. November 2026  
**Draft:** #131, gestapelt auf #130 (LOD-Re-Decodes) → #129 (gerichtetes Prefetch) → #128 (statische Viewer-Metadaten). PR #127 bleibt ein unabhängiges Experiment.

## Reproduzierter Engpass

Der Viewer einer bereits fertig vorberechneten Karte liest PNG-Tile-Pakete aus IndexedDB und dekodiert sie. Die ursprüngliche Regel begrenzt die gleichzeitig laufenden Tile-Anforderungen auf **drei** (`MAX_INFLIGHT=3`), darunter höchstens **ein** spekulativer Hintergrund-Prefetch (`MAX_SPECULATIVE=1`). Wenn ein zuvor sinnvoller Prefetch noch in IndexedDB wartet, aber die Kamera plötzlich weit schwenkt, stehen für nun sichtbare Kacheln effektiv nur **zwei** dieser drei Slots zur Verfügung. Weitere neue sichtbare Kacheln müssen bis zur Freigabe warten.

**Es handelt sich um Lade-Latenz eines fertigen Atlas, nicht um Terrain-Generierung.**

## Neue, reversibel begrenzte Zulassung

Mit `?visibleBorrow=1` (Default im experimentellen Draft) darf die bestehende `read(key,variant,'visible')`-Anforderung **genau einmal** einen vierten temporären Slot benutzen, wenn **alle** folgenden Bedingungen zutreffen:

- `prefetchGuard=true`; die alte Hintergrundbegrenzung und ihre RAM-Reserve sind aktiv;
- genau drei Anforderungen sind noch offen, und wenigstens eine davon ist in `loadingPurpose` weiterhin als `prefetch` markiert;
- die neue Anforderung ist tatsächlich **sichtbar**, kein weiterer Prefetch.

Die absolute gleichzeitige Grenze ist dadurch **vier** statt drei Requests, typischerweise drei sichtbare und ein spekulativer zum Zeitpunkt der Vergabe. Eine bereits laufende Prefetch-Anforderung kann später selbst sichtbar werden und als `visible` umklassifiziert werden; die absolute Grenze von vier bleibt dennoch erhalten.

Bei vier offenen Requests wird **kein fünfter** zugelassen. Sind ausschließlich sichtbare Anforderungen offen, gibt es **keine** Erweiterung des bisherigen Limits von drei. Die vorhandenen Request-Promises werden nicht abgebrochen oder künstlich als fertig gezählt.

**Opt-out:** `?visibleBorrow=0` aktiviert die bisherige harte Dreiergrenze. Bei `prefetchGuard=0` ist das zusätzliche Borrowing ebenfalls deaktiviert. Runtime- und Profilerdiagnose: `visibleBorrowStarts` (tatsächlich sofort zusätzlich gestartete sichtbare Reads), `peakInFlight` (höchste beobachtete Gleichzeitigkeit).

Nicht verändert werden: Tile-/Archivschlüssel, Original-/abgeleitete PNGs, Bitmap-Lifecycle, `maxDecodedPixels` und Eviction-Regeln, Zoom-LOD-Hysterese, Fog/Autorisierung, Kamerageometrie oder die maximale spekulative Vorladung. **Kein** IndexedDB-Schreiben und **kein** Terrain-Re-Bake.

## Deterministischer A/B-Nachweis

`tests/test_rendering_step25u_visible_borrow_20261111.cjs` benutzt **135 synthetische, bereits vorhandene Tile-Pakete** in einem 15×9-Raster, zwei Bildlayer pro Tile, einen 400×240 CSS-Pixel-Viewport, identische Kamera-/Szenenmetadaten und per Deferred Promise steuerbare `storage.get`-Antworten.

1. Vier ursprünglich sichtbare Kacheln werden vollständig dekodiert.
2. Ein **offscreen Prefetch bleibt absichtlich blockiert**; dies simuliert langsames IndexedDB/Decode-I/O.
3. Ein großer Kameraschwenk (`panX=-3200`) bringt vier neue Tile-Footprints in den sichtbaren Bereich.

| Messung unmittelbar nach Kameraschwenk | Alt, `visibleBorrow=0` | Neu, `visibleBorrow=1` |
|---|---:|---:|
| Neue sofort gestartete sichtbare Tile-Reads | **2** | **3** |
| Höchste gleichzeitige Requests | 3 | 4 |
| Temporär weiterhin blockierter Prefetch | 1 | 1 |
| Tatsächlich zusätzliche sichtbare Starts durch Borrow | 0 | 1 |

Weitere Regressionen beweisen: Kein fünfter Request, kein Borrowing bei ausschließlich sichtbaren Inflight-Anforderungen, unveränderte normalen Lese-/Fog-/Speicherregeln und den funktionsfähigen Opt-out. Dies ist ein **Determinismus-/Startlatenz-Nachweis**, keine in Millisekunden gemessene End-to-End-Verbesserung.

## Automatisierte Abnahme

[GitHub Actions #43003425244](https://github.com/markusjungblut/asset_labor/actions/runs/43003425244): **90/90 Node-Tests, 0 Fehler, vollständige Headless-Firefox-Regression erfolgreich**, einschließlich 120-WorldTile-Pan/Zoom, 1×/2× und Fog. Getesteter Code-Commit: `c39b9a159fc739227608f0b7a5327f750cc8eec6`.

Beim ersten CI-Lauf #43003284362 waren 89/90 Tests erfolgreich; der eine Fehlschlag betraf **ausschließlich eine veraltete HTML-Cache-Buster-Assertion des vorherigen Schrittes 25T**. Die Assertion wurde auf die aktuelle Modulversion korrigiert; es gab keinen Fehler in der neuen Read-Slot-Logik. Zur Kontingentschonung erhält dieser Dokumentationsnachtrag `[skip ci]`, ohne weitere Testwiederholung.

**Grenzen:** Ein vierter paralleler IndexedDB-Lesevorgang kann je nach Browser und Hardware auch Konkurrenz um I/O-/Decoder-Ressourcen erzeugen. Die synthetische Regression belegt nur eine zusätzliche sofort gestartete **sichtbare** Anforderung, keinen global geringeren Traffic, keine höheren FPS und keine endgültige Pixel-/Fog-/Windows-Abnahme der privaten Originalkarte.

## Integration

#131 bleibt Draft **auf #130**; #130 auf #129, #129 auf #128. Keine Änderungen an `main`, privater Originalkarte oder uncommitteten Dateien auf dem momentan nicht erreichbaren Windows-PC. **Kein Merge allein aufgrund des synthetischen Ergebnisses.**

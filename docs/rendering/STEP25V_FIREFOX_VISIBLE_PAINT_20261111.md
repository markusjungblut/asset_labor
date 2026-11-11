# Schritt 25V – Sichtbare Tile-Latenz im echten Firefox nachweisen

**Stand:** 11. November 2026  
**Draft:** PR #132 auf PR #131 (Step 25U), darauf #130 → #129 → #128.  
**Private Windows-Karte:** nicht verwendet oder verändert. Original-Atlas-PNGs / `main` bleiben unverändert.

## Fragestellung

Im Schritt 25U kann eine dringende **sichtbare** Tile-Leseanforderung einen vierten
temporären Platz nutzen, wenn unter den drei regulären laufenden
Lesevorgängen bereits ein Hintergrund-Prefetch blockiert.
Der frühere Node-Test hatte nur nachgewiesen, dass unmittelbar nach
einer Kamerabewegung **drei statt zwei sichtbare Reads starten**.
Ungeklärt war, ob die Bitmap anschließend auf einem echten
Browser-Canvas **früher gezeichnet** wird.

## Aufbau

`tests/automated_browser_visible_borrow.cjs` startet einen isolierten,
echten Firefox mit einer **135-Tile-Szene**, vollständig synthetischen
PNG-Blobs sowie tatsächlichem `createImageBitmap` und
`CanvasRenderingContext2D.drawImage`. Die Szene enthält authored
visible-Hexgeometrie am Startpunkt und am Ziel, keine fremden
Benutzerdateien und keine IndexedDB-Daten aus dem normalen Browserprofil.

Die Testlogik kontrolliert ausschließlich die Antwortzeit einer
Mock-`storage.get`-Funktion:

1. Vier sichtbare Pakete werden vorab vollständig geladen und gezeichnet.
2. Genau **ein** `prefetch` bleibt absichtlich mit einer offenen Promise hängen.
3. Die Kamera schwenkt auf `panX=-3200`, sodass mehrere neue
   Tile-Footprints sichtbar werden.
4. Jede **neu** gestartete `storage.get`-Anfrage benötigt künstlich **95 ms**;
   das gilt **identisch** für beide Viewer-Modi.
5. Die Testuhr läuft ab Kameraschwenk bis die **dritte neue
   Tile-Bitmap auf dem sichtbaren Canvas via `drawImage` eingereicht** wurde.
6. Anschließend wird der zuvor blockierte Prefetch freigegeben;
   alle vier neuen sichtbaren Pakete werden gezeichnet und
   der endgültige Canvas-Pixelhash verglichen.
7. Sechs Läufe, alternierend 0/1/1/0/0/1, um Start-
   und Cache-Reihenfolgeeffekte zu minimieren.

Es werden echte Browser-Bitmaps und die unveränderten Renderer-
Zeichenfunktionen benutzt. Der Speicherdienst und seine künstliche
95-ms-Latenz sind simuliert; das ist **kein realer IndexedDB-I/O-Benchmark**.

## Gemessene Werte

[GitHub Actions #43017087760](https://github.com/markusjungblut/asset_labor/actions/runs/43017087760),
getesteter Code-Commit
[`acd4fbe`](https://github.com/markusjungblut/asset_labor/commit/acd4fbe7c7a8dd41bfaf4f772ea8e0569e0558b4).

| Kennzahl | Bisher: `visibleBorrow=0` | Neu: `visibleBorrow=1` |
|---|---:|---:|
| **Zeit bis zum dritten neuen sichtbaren `drawImage`**, Einzelwerte | 202, 209, 211 ms | 105, 106, 107 ms |
| **Median** | **209 ms** | **106 ms** |
| Medianvorteil | – | **103 ms (rund 49 % früher)** |
| Sofort gestartete neue sichtbare Reads | 2 | 3 |
| Spitzenwert gleichzeitig laufender Requests | 3 | 4 |
| Tatsächlich ausgelöste Borrows | 0 | 1 |
| Endgültiger Canvas-Pixelhash | `d712f536` | `d712f536` |
| JavaScript- / Bitmap-Fehler | 0 | 0 |

Alle **sechs vollständigen Pixelausgaben** ergaben denselben
32-Bit-FNV-1a-Hash der Canvas-ImageData-Bytes (kein Ersatz für
native Screenshot-Diff-Tests). Die 95-ms-Verzögerung verursacht den
größten Teil des deterministischen Unterschieds: Ohne Borrow
beginnt die dritte benötigte Leseanforderung erst nachdem einer
der zwei sichtbaren Reads fertig wird. Mit Borrow können alle drei
sofort parallel laufen.

**Interpretation:** Die Browser-A/B-Messung bestätigt eine echte
Verringerung der Zeit **bis zur Pixelübergabe an Canvas** in der
kontrollierten 95-ms-Storage-Latenzsituation. Der Browser hat
nicht bewiesen, dass GPU-Präsentation, FPS/p95-Framelücken oder
alle Karten-/Systemkonfigurationen schneller sind. Auf langsamer
Hardware kann ein vierter gleichzeitiger Decode-/I/O-Auftrag auch
Ressourcenkonkurrenz auslösen. `?visibleBorrow=0` bleibt
deshalb ein notwendiger Rückfallpfad.

## Automatische Abnahme

GitHub Actions **#43017087760** ist grün:

- **90/90 Node-Tests** erfolgreich;
- komplette bestehende echte Firefox-Regression der 120-Tile-Karte
  mit Pan, Fog und 1×-/2×-LOD erfolgreich;
- neuer Firefox-Browser-A/B-Test mit sechs alternierenden
  Latenzmessungen erfolgreich;
- neues Artefakt `firefox-visible-borrow-summary.json` mit allen
  Messungen, einzelnen Tile-Schlüsseln, offenen Reads und Pixel-Hashes
  wurde im normalen `test-artifacts`-Paket abgelegt.

Ein erster Versuch **#43016471704** scheiterte an der
Testabschlussbedingung `final.pending===0`: Noch laufendes,
zulässiges **Offscreen-Prefetch** wurde irrtümlich wie ein
fehlendes sichtbares Bild behandelt. Nach der Korrektur wurde
nur noch die tatsächlich gemessene sichtbare Rasterbereitschaft
geprüft. Das ist eine **Testkorrektur**, keine Änderung des
Viewers oder eine Herabsetzung der geforderten Pixelparität.

## Projektentscheidung

Die zusätzliche sichtbare Request-Parallelität aus #131 besitzt
jetzt **einen kontrollierten echten Browser-Latenznachweis**.
Die Produktionsfreigabe bleibt aus, bis die originale Karte
auf dem Windows-PC bezüglich Gesamtlatenz, RAM, Fog-Bildparität
und Frame-p95 gegen `visibleBorrow=0` geprüft werden kann.

PR #132 ist test-/CI-only und bleibt Draft auf #131,
der auf #130 → #129 → #128 aufbaut. Das separate
25Q-Indexexperiment #127 wird nicht mitgestapelt.
Keine neuen JPEGs/PNGs, keine Terrain-Bakes und keine
Änderungen an `main` oder lokalen, eventuell noch
uncommitteten Windows-Dateien.

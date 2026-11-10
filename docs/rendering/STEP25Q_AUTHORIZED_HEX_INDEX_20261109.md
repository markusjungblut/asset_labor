# Schritt 25Q – Räumlicher Vorfilter für autorisierte World-Blit-Hexe

Stand: 09.11.2026 · **Draft-PR #127, Node-/Firefox-CI erfolgreich; lokale Windows-Abnahme offen**.

## Ausgangslage

Nach 25P ist die Tile-Schlüssel-Auswahl bei großen Karten indexiert,
aber die 25O-World-Band-Planung iteriert bei jedem Renderaufruf weiterhin
über sämtliche `cells` aus dem schreibgeschützten Kartenmanifest.
Der 25P-Firefox-A/B zeigt im kombinierten Default eine uneinheitliche
p95-Frame-Kadenz. Die Ursache ist damit **nicht** belegt.

## Isolierter Versuch

- Bei mindestens **400 Hexzellen** wird bei `load()` einmalig eine
  nach `cell.x` sortierte Indexliste autorisierter `visible`-/
  `explored`-Hexe gebildet. Die Metadaten werden nicht persistiert.
- Ein konservatives Sichtfenster berücksichtigt den **größten**
  geometrischen Hex-Radius, Scenery-Halo **+45 Welteinheiten** und
  **6 Gerätepixel** Reserve. X-Binärsuche und Y-Filter bestimmen
  Kandidaten; `plan()` berechnet weiterhin die **unveränderten**
  echten devicepixelgenauen World-Blit-Rechtecke.
- Bei invaliden Metadaten, ungültiger Kamerageometrie, unter 400 Zellen
  oder ausgeschaltetem Modus bleibt die vollständige Legacy-Schleife.
- Default für den großen Kartenviewer: Index **an**, separat
  abschaltbar über `&bandIndex=0` und die sichtbare Checkbox.
  `worldBands=0` schaltet die gesamte 25O-Bandplanung ab.
- Statistik: `worldBandIndexEntries`, `worldBandIndexQueries`,
  `worldBandIndexCandidateCells`, `worldBandLegacyCandidateCells`.
  Dies zählt dem Planer übergebene Kandidaten, nicht gemessene CPU-Zeit.

**Nicht verändert:** 25O-Planer, Blit-`drawImage`-Geometrie,
Fog-Berechtigungen, Cloud-/850-ms-Fade, World-/Scenery-Masken,
1×-/2×-LOD, Canvas-RAM-/DPR-/Pixelbudgets, Tile-Read-/Decode-Reihenfolge,
Original-/Derivat-Atlasbilder und IndexedDB.

## Prüfplan und Freigabegate

1. Node: 15.000 gemischte Hexe, verschiedene Radien, DPR/Zoom/Pan,
   Vergleich der gesamten 25O-Gerätepixel-Rechtecklisten mit dem
   alten Vollscan. Zusätzlich große Edge-Radien, kleine Karten,
   invalide Metadaten, Load/Stop-Lifecycle und Index-Opt-out.
2. Headless-Firefox: vorhandene 120-Tile-Bild- und Fog-Abnahme;
   separat 15.000 synthetische Hex-Metadaten direkt im Browser,
   identische 25O-Rechteckpläne mit/ohne Index; alle sichtbaren
   Checkboxen und URL-Navigationen.
3. Erst nach grüner CI ist die **Korrektheit des synthetischen
   Vergleichergebnisses** akzeptiert. Eine echte Beschleunigung,
   p95-Wirkung und 60-FPS-Garantie erfordern anschließend
   gepaarte Messungen auf der privaten Windows-Karte.
   Bei relevant schlechterer Browser-Gesamtzeit: kein Merge.

Kein Browser-Performance-Ergebnis und keine vollständige Pixelidentität
der privaten Karte sind mit diesem Implementierungscommit behauptet.

## Abnahmebericht: GitHub Actions (09.11.2026)

- Commit: [`c45ecc5`](https://github.com/markusjungblut/asset_labor/commit/c45ecc5e4aab87f2bff48ab36d34b7fe4a05ccf0).
- Vollständige CI: [Actions-Lauf #42676610398](https://github.com/markusjungblut/asset_labor/actions/runs/42676610398) **erfolgreich**.
- **75/75 Node-Tests bestanden, 0 fehlgeschlagen**. Darin enthalten sind fünf neue 25Q-Prüfungen.
- Echter Headless-Firefox-Test (120 synthetische World-Tiles) vollständig erfolgreich. Der zusätzliche 15.000-Hex-Browsertest hat für sieben gleiche Kameraposen **identische 25O-Gerätepixel-Blit-Rechtecke** geprüft und den Kandidatenscan auf **weniger als 10 %** des alten Vollscans reduziert (CI-Akzeptanzgate). Die sichtbaren Schalter inklusive `bandIndex=0` wurden mit echten URL-Neuladungen getestet.
- Browserartefakt: [`frozen-map-firefox-85`](https://github.com/markusjungblut/asset_labor/actions/runs/42676610398/artifacts/13700033581) mit Profil- und Screenshot-Dateien; Aufbewahrung der CI-Artefakte ist zeitlich begrenzt.
- **Abnahmegrenze:** Die synthetischen Korrektheits- und Auswahltests beweisen keine reale p95-/GPU-/60-FPS-Beschleunigung der privaten Windows-Karte. Im Schritt-25Q-Test wurden keine belastbaren gepaarten World-Blit-Zeiten für 15.000 echte Hexes auf der Zielhardware erhoben. **Draft bleibt offen**, bis ein gültiger Benchmark und die Risikoabwägung vorliegen. `main` bleibt unverändert.

## Gepaarte echte Firefox-Planungsmessung (10.11.2026)

[GitHub Actions #42787622728](https://github.com/markusjungblut/asset_labor/actions/runs/42787622728)
auf Commit [`acfe1ce`](https://github.com/markusjungblut/asset_labor/commit/acfe1ce4667d741aa2fc59d94963291d94d5af01):
**75/75 Node-Tests und vollständige Headless-Firefox-Regression grün**.

Die zusätzliche Messung führt pro Szenario **17 abwechselnd
gereihte A/B-Batches** aus je **20 Wiederholungen** durch,
nach 12 Warm-up-Paaren. Gemessen wird ausschließlich
`api.plan(view,cells,dpr)` gegen
`api.plan(view,index.query(view,dpr),dpr)` im
Firefox-JavaScript-Kontext (kein World-Canvas/GPU-Present).
Zeitangaben: **Millisekunden pro Planungsaufruf**, nicht
Gesamt-Framezeit.

| Szenario | Alter Vollscan p50 / p95 | Räumlicher Index p50 / p95 |
| --- | ---: | ---: |
| 15.000 räumlich verteilte Hexfelder, sieben Kameraposen | 0,3571 / 0,4786 ms | **0,0071 / 0,0071 ms** |
| Künstlicher Extremfall: 15.000 deckungsgleich überlappende Riesen-Hexe, zwei Posen | Unter Messauflösung / unter Messauflösung | 0,1250 / 0,1750 ms |

Verteilte Karte: **105.000 → 178** dem World-Band-Planer
bereitgestellte Hex-Kandidaten über sieben Posen (−99,83 %),
identische Device-Pixel-Rechtecke.
Der extreme Überlappungsfall ist **keine repräsentative
Spielgeografie**: Der alte Planer kann dort sofort auf Vollblit
abbrechen, während der neue räumliche Index weiterhin
zahlreiche nahe Einträge filtert. Der Mehraufwand ist real,
aber auf diesem Headless-Firefox-Runner absolut klein.
Die Anzeige `0` für den Legacy-p50 ist eine
**Messauflösungsgrenze**, kein physikalisch kostenloser Aufruf.
Daraus lässt sich keine verlässliche relative Verlangsamung
berechnen.

**Bewertung:** Der Index reduziert den JS-Aufwand der 25O-Planung
auf einer großen, normal räumlich verteilten Testkarte.
Eine relevante Verbesserung des **gesamten Draw-/FrameGap-p95**
ist damit **nicht** nachgewiesen: Der zuvor gemessene
synchronisierte World-Canvas-Blit bleibt wesentlich teurer.
Keine allgemeine 60-FPS-Behauptung, keine Änderung des
Originalatlas. **PR #127 bleibt Draft**, bis echte Windows-
Karten-/GPU-/Bildqualitätsmessungen den Produktivnutzen
bestätigen. Zusätzliche Rendererexperimente ohne diesen
Befund werden nicht vorgezogen.

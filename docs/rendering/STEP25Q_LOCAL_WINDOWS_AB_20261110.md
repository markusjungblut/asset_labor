# Schritt 25Q – Lokale Windows-A/B-Abnahme mit echter Originalkarte

Stand: 10.11.2026. Ergänzung zu [STEP25Q_AUTHORIZED_HEX_INDEX_20261109.md](STEP25Q_AUTHORIZED_HEX_INDEX_20261109.md).
**Nur PR #127; nicht nach `main` gemergt.** Keine öffentliche Verteilung der Originalkarten.

## Zweck und Sicherheitsgrenze

Headless-Firefox beweist die Planergeometrie und den isolierten
JS-Laufzeitgewinn. Offen sind die echten Draw-/FrameGap-p95
mit privater Originalkarte, GPU, Fog und 1x/2x-LOD auf Windows.
Dieser Schritt fügt **nur ein Diagnosewerkzeug** hinzu:
Die aktive Karte bleibt ein unabhängiger Read-only-Viewer.
`?perf=1` aktiviert die Messfahrt; ohne diese Option
wird weder ein zusätzliches Benchmark-Frame ausgelöst noch
ein Profiler gestartet. Original-PNGs, Fog-Berechtigungen
und das World-Raster-Verfahren bleiben unverändert.

## Reproduzierbares Messverfahren

1. Zuerst den bestehenden lokalen Viewer aus dem **25Q-PR-Branch**
   sicher öffnen. Bei uncommitteten lokalen Änderungen **nicht**
   blind Branch wechseln oder `git reset --hard` ausführen.
   Eine separate Worktree oder die spätere Abgleichung der
   lokalen Änderungen ist nötig, bevor die Originalkarte getestet wird.
2. Kartenseite im **gleichen Browser, gleichen Fenster und LOD**
   mit `&perf=1&bandIndex=0` öffnen. Für die dokumentierte
   **397-Hex-Windows-Szene** auf **beiden** Messseiten zusätzlich
   `&bandIndexMin=256` setzen; damit wird **nur im Diagnosemodus**
   die Schwelle auf 256 gesenkt. Ohne `perf=1` bleibt sie 400.
   Alle anderen Optimierungen und die Browserzoomstufe unverändert lassen.
   Die Szene muss fertig vorbereitet und vollständig verfügbar sein.
3. **Messfahrt A/B** drücken. Das Werkzeug führt 96 identische
   Pan-Punkte **ohne Profilierung der Aufwärmphase** aus, wartet
   auf maximal 320 Animationframes und mindestens 1,1 s
   Ruhezeit für den 850-ms-Fog-Fade und misst
   dann 96 Pan-Punkte im selben Pfad. Die App exportiert automatisch
   `vedras_step25q_legacy_*.json`. Tab sichtbar lassen.
4. Unter **Optimierungen** nur **Hex-Index für World-Blit**
   einschalten (URL: `bandIndex=1`; `bandIndexMin=256`
   für kleine Diagnosekarten beibehalten). Nach Reload wieder
   **Messfahrt A/B** starten und `vedras_step25q_indexed_*.json`
   speichern. Die Messfahrt verwendet dieselbe Startkamera,
   relative Bildschirmamplitude, Zoom und DPR.
5. Die beiden JSONs im selben PC vergleichen:
   `node tests/compare_rendering_step25q_profiles.cjs legacy.json indexed.json`.
   Der Prüfer kontrolliert Szene, LOD, Kamerapfad, Basispose,
   CSS-/Backing-Viewport, alle anderen Renderer-Flags,
   ruhige Aufwärmphase, Mindestanzahl echter Pan-Frames/
   zusammenhängender Frame-Gaps, aktive Indexoption und
   Renderfehler. Er zeigt p50/p95 für `drawMs`,
   `frameGapMs`, `worldPrepareMs` und `worldBlitMs`
   sowie absolute und prozentuale Unterschiede.
6. Mindestens **drei Messpaare** mit gewechselter
   A/B-Reihenfolge erheben (z. B. OFF-ON, ON-OFF, OFF-ON).
   Ein einzelnes Paar und Headless-Läufe reichen
   **nicht** für einen Merge-Entscheid. Bei
   `valid:false` Ursache beseitigen und neu messen.
   Zusätzlich Originalkarten-Pixel/Fog bei denselben Posen
   visuell prüfen; Farbsamples eines synthetischen CI-Atlas
   ersetzen diese Abnahme nicht.

## Interpretation

- Besonders wichtig: `frameGapMs.p95`, `drawMs.p95`,
  `worldPrepareMs.p95`, `worldBlitMs.p95` und langsame
  Frames. Die Performance ist nicht allein aus Kandidatenzahl
  oder `worldPrepareMs` abzuleiten.
- `frameGapMs` enthält nur **zusammenhängende aktive**
  Frames; `drawMs` ist CPU-/Canvas-Wallclock, nicht
  GPU-Present/Display-Latenz.
- Wenn das dicht überlappende Gebiet die Legacy-
  Vollblitfrüherkennung begünstigt, kann der Index
  langsamer sein; diese Geografie ebenfalls überprüfen.
- Die Seite exportiert **keine PNGs** und sendet keine
  Performance-JSONs an GitHub. Die Daten liegen zunächst
  nur auf dem Windows-PC. JSON enthält Szene, Browser,
  Viewer-Metadaten und lokale Profilerstatistik;
  bewusst prüfen, bevor die Dateien geteilt werden.
- Der CLI-Prüfer gibt **nie eine automatische Merge-Freigabe**.
  Erst nach mehreren vergleichbaren Messpaaren, realer
  Bild-/Fog-Prüfung und Ausschluss relevanter
  p95-Regressions ist der Draft-Status zu überdenken.

## Automatische CI-Grenze

Die vorhandenen 75 Node-Tests und Headless-Firefox-Regressionen
werden um die CLI-Validierung und einen echten
Firefox-Smoke-Test des UI-basierten Messprotokolls ergänzt.
Die CI-Fixture umfasst **399** Hexmetadaten und bleibt unter
  dem **unveränderten Produktiv-Schwellenwert 400**. Mit
  `?perf=1&bandIndexMin=256` kann der CI-Browser beide Pfade
  real aktivieren und die zwei JSONs mit dem CLI-Prüfer vergleichen.
  Ein zweiter synthetischer Test prüft **397** Hexmetadaten
  auf identische World-Blit-Rechtecke und gepaarte Planungszeiten.
  Dies ist **keine** Originalatlas-/GPU-Performanceabnahme.

## Abnahmestand GitHub Actions vom 10.11.2026

- Der initiale UI-/CLI-Commit [`f974c11`](https://github.com/markusjungblut/asset_labor/commit/f974c11647457385732afa25f48e42b359d9ca1b)
  benötigte eine Korrektur der Sparse-Checkout-Liste:
  `tests/compare_rendering_step25q_profiles.cjs` muss
  auch in CI eingecheckt werden ([`bf83d0e`](https://github.com/markusjungblut/asset_labor/commit/bf83d0eb03c878a310c5c64e5e8089584f587b6d)).
  Der erste Lauf war nur deshalb rot; die bereits
  vorhandenen 75 Tests hatten bestanden.
- Nach der Korrektur bestand
  [Actions #42861429378](https://github.com/markusjungblut/asset_labor/actions/runs/42861429378):
  **79/79 Node-Tests**, vollständige Headless-Firefox-Regression
  einschließlich realer Browser-Messfahrt und sichtbarem Schalter.
- Abschließende Robustheit gegen 120/144-Hz-Bildschirme:
  Ruhephase fordert jetzt mindestens **60 ununterbrochene
  Animationsframes ohne ausstehende Reads UND 1,1 s Wandzeit**.
  Das verhindert, dass der 850-ms-Fog-Fade bei schnellen
  Displays in den Messblock ragt. Bei nicht erreichtem
  Zustand vermerkt das JSON `settled:false` und der
  lokale CLI-Prüfer verweigert die Freigabe.
- Letzter Code-Commit [`46cb60c`](https://github.com/markusjungblut/asset_labor/commit/46cb60c595d9b56a964259ad3921af71a6fcd937)
  erfolgreich in [Actions #42862413239](https://github.com/markusjungblut/asset_labor/actions/runs/42862413239)
  abgenommen: erneut **79/79 Node-Tests und Headless-Firefox erfolgreich**.
  Die ursprünglichen World-Blit-Planungsvergleiche und
  reversiblen Schalter bleiben Teil der Regression.
- **Draft-PR #127 bleibt offen.** Diese automatischen Tests
  validieren den Messmechanismus, ersetzen aber keine
  echten Windows-/600-MB-Atlas-/Fog-/GPU-Messdaten.

## 397-Hex-Diagnose und unveränderter Standard

Die Repository-Historie dokumentiert eine **397-Hex-Testszene**
(`docs/rendering/STATUS.md`). Das sind historische **Editor-**
Messungen; die exakte Zahl der `manifest.cells` im eigenständigen
Spielviewer muss beim späteren Windows-Test separat geprüft werden.

Die normale 25Q-Optimierung benötigt **mindestens 400**
Manifest-Hexe. Bei 397 bleibt `bandIndex=1` ohne zusätzlichen
Diagnoseparameter wirkungslos. Auf dem PR-Branch aktiviert
`?perf=1&bandIndexMin=256&bandIndex=1` den Index bereits ab
256 Zellen; `bandIndex=0` bleibt für den Vollscan. Die
gleichen Parameter `perf=1&bandIndexMin=256` müssen in
beiden A/B-URLs stehen; der Offline-Prüfer vergleicht diesen
Mindestwert und verwirft inkonsistente Paare. Der Index
nimmt nur `visible`/`explored`-Hexe auf, sodass
`worldBandIndexEntries` kleiner als `manifest.cells.length`
sein darf.

Ohne `perf=1` ignoriert die Spielseite `bandIndexMin`:
Die **400er-Produktivgrenze bleibt bestehen**. Eine dauerhafte
Senkung auf 256 setzt mehrere reale gepaarte Frame-/Fog-
Messungen voraus; die reine JS-Mikrobenchmark-Ersparnis ist
dafür nicht ausreichend. Der Index verändert keine
Karten- oder Fog-Berechtigungen, keine Atlasbilder und
keinen IndexedDB-Datensatz.

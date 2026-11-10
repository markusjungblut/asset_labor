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
   mit `&perf=1&bandIndex=0` öffnen. Alle anderen
   Optimierungen und die Browserzoomstufe unverändert lassen.
   Die Szene muss fertig vorbereitet und vollständig verfügbar sein.
3. **Messfahrt A/B** drücken. Das Werkzeug führt 96 identische
   Pan-Punkte **ohne Profilierung der Aufwärmphase** aus, wartet
   auf maximal 320 Animationframes und mindestens 1,1 s
   Ruhezeit für den 850-ms-Fog-Fade und misst
   dann 96 Pan-Punkte im selben Pfad. Die App exportiert automatisch
   `vedras_step25q_legacy_*.json`. Tab sichtbar lassen.
4. Unter **Optimierungen** nur **Hex-Index für World-Blit**
   einschalten (URL: `bandIndex=1`). Nach Reload wieder
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
Die CI-Fixture umfasst **399** Hexmetadaten und kann daher
den produktiven Index-Schwellenwert von **400** nicht aktivieren;
der CLI-Prüfer weist einen solchen `bandIndex=1`-Vergleich
auf der lokalen Karte ausdrücklich als `invalid` zurück.
Dies ist ein **Protokolltest**, keine reale Windows-Performance.

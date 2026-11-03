# Schritt 25H – Viewport-Culling für dynamische Fog-/Frontier-Komposition

Stand: 03.11.2026. Separater Draft auf `main`, nach gemergtem Schritt 25G (#117).

## Messgrundlage und Hypothese

Das echte Windows-Firefox-Profil `vedras_profile_v1-0374527a_cached(5).json`
meldete `fogMs p95 ≈70 ms` bei 596 Frames, neben separaten Welt- und
Wolkenkosten. Diese Perzentile sind **keine** addierbaren Anteile desselben Frames
und wurden vor 25F/25G gemessen. Die automatische CI-Karte mit 120 synthetischen
WorldTiles / 399 Fog-Hexfeldern liefert reproduzierbare A/B-Kontrollen, bildet
aber weder den privaten 600-MB-Atlas noch Windows-GPU-Latenzen identisch ab.

Im Standalone-Player wurde bisher bei jedem `draw()` die vollständige
`cells`-Liste an `clouds.drawUnready` übergeben und die vollständige
`frontierEdges()`-Liste an `clouds.drawTransitions`. Selbst weit außerhalb
des Viewports werden so teure Bereitschaftsprüfungen und Frontier-Target-Listen
vorbereitet. Offscreen-Prüfung erfolgt teils erst **nach** diesen Schritten.

## Umsetzung und Sicherheitsinvarianten

- `frozen-map-fog-viewport.js` ist ein reiner, read-only Filter:
  `visibleCells(cells, view)` prüft die Vereinigungsmenge aus dem tatsächlichen
  authored `hexPath`-Umriss und dem separat auf axialen Weltkoordinaten
  verankerten Cloud-Sprite-Rechteck. Maßgeblich ist der größere geometrische
  Überhang inklusive vorhandener 38 World Units Cloud-Feather.
- `visibleEdges(edges, view)` prüft das **unbekannte Nachbarhex**, das
  tatsächlich als opaque Core und Hard-/Soft-Wolke gezeichnet wird, nicht
  bloß das bekannte Ursprungshex. Die Feather-Fläche darf ins Sichtfenster
  hineinragen, selbst wenn der Kern noch außerhalb liegt.
- Unbekannte/geometrisch fehlerhafte Metadaten werden sicherheitshalber
  **nicht** weggeschnitten. Bei fehlendem Viewport-Helfer bleibt der volle
  vorherige Renderingpfad erhalten.
- Dieselbe Kandidatenauswahl wird auch beim vergrößerten, vorberechneten
  Zoom-Out-Snapshot angewendet; keine rechteckige/unerlaubte Offenlegung.
- `&fogCull=0` stellt die vorherige volle Kandidatenliste als A/B-Kontrolle
  her. Cloud-Assets, 850-ms-Fog-Dissolve, Cloud-/Welt-Layer-DPR, 8,5-/16,5-MP-
  Rasterlimits, Hex-Sichtrechte, Quell-PNGs, IndexedDB-IDs und bestehende
  1×-/2×-Derivate werden nicht verändert. Keine neue Terrain-Berechnung.

## Zusätzliche Diagnostik

Runtime: `fogViewportCull`, `fogUnreadyCandidates`,
`fogUnreadySubmitted`, `fogFrontierCandidates`,
`fogFrontierSubmitted`. `perf=1` erfasst separat
`fogCullMs`, `fogUnreadyMs`, `fogTransitionsMs` neben
`fogMs`. Der Filteraufwand bleibt in der Gesamt-Fog-Messung enthalten,
sodass keine künstliche Zeitverbesserung durch Messgrenzenverschiebung
entsteht.

## Automatische Abnahme

- Neue Native-Regression `tests/test_rendering_step25h_fog_viewport_20261103.cjs`:
  authored Hex- und q/r-Sprite-Überhang, Schnittpunkt an 38-World-Unit-
  Feather-Grenzen, Pan-Neuberechnung, malformed Fail-open, plus echter
  Runtime-A/B-Pfad mit 901 Fog-Hexfeldern und dem unveränderten Legacy-Modus.
- Bestehende Step-23-/25F-/25G-Fog-Assertionen prüfen weiterhin, dass der
  autorisierte Fog-Unready- und Frontier-Painter **nicht entfernt**, sondern
  mit einer auf den Viewport beschränkten Kandidatenliste aufgerufen wird.
- Automatische Headless-Firefox-Tests umfassen zusätzlich
  `&fogCull=0`, exakt dieselbe synthetische Karte und Kamerafahrt.
  Archiviert werden die neuen Fog-Subphasen, Kandidatenzahlen, Draw-/FrameGap-
  p95, JSON und reale PNG-Screenshots; ein großzügiges Performance-
  Regression-Gate verhindert offensichtliche Verschlechterungen.
- CI ist erst nach **tatsächlich erfolgreich durchgelaufener** Node-
  und Firefox-Aktion als grün zu bezeichnen. Die Änderung bleibt bis zur
  gemessenen funktionalen Abnahme Draft und wird nicht automatisch gemergt.

## Grenzen und nächste Entscheidung

Viewport-Culling ist vor allem für große Welt-/Fog-Mengen sinnvoll. Ob
`drawTransitions`-Stempel oder `drawUnready`-Compositing der tatsächlich
dominierende `fogMs`-Anteil ist, zeigen erst die neuen Firefox-Teilphasen.
Nur anschließend einen separaten 25I-Schritt (etwa an Weltposition gebundene,
budgetierte Frontier-Raster oder selektive Fade-Zellaktualisierung) begründen.
Keine pauschale Cachebudget-Erhöhung, kein neuer Full-Bake, keine manuellen
Nutzer-Pan-Tests und kein 60-FPS-Versprechen ohne Hardwaremessung.

Siehe Issue #103, PR #117 / 25G und `docs/rendering/STEP25G_ADAPTIVE_CLOUD_RASTER_PAD_20261103.md`.

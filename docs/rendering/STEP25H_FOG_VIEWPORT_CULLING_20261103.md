# Schritt 25H – Viewport-Culling für dynamische Fog-/Frontier-Komposition

Stand: 07.11.2026. Schritt 25H mit [PR #118](https://github.com/markusjungblut/asset_labor/pull/118) nach `main` integriert (Merge `28dee799dcbfab0660ecc24744c36d7a2b60585c`), auf Grundlage der grünen automatisierten Firefox-Abnahme #41701703189.

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
  und Firefox-Aktion als grün zu bezeichnen. Die Änderung blieb bis zur
  gemessenen funktionalen Abnahme Draft; die CI-Abnahme ist inzwischen erfolgreich und der PR gemergt.

## Abschlussmessung der automatisierten CI (03.11.2026, geprüft 07.11.)

**[GitHub Actions #41701703189](https://github.com/markusjungblut/asset_labor/actions/runs/41701703189): GRÜN** für den exakten Renderer-Head `98f462d009f39e2373fad6cd60a8b349a970a237`.
46/46 Node-Tests erfolgreich; der echte Headless-Firefox-Test mit **sechs**
Varianten und den separaten 120-WorldTile-/399-Hex-/4-Cloud-PNG-CI-Fixtures
ist ebenfalls vollständig durchgelaufen. Der erste Run wurde nach dem
zusätzlichen Offscreen-Fade-Lebenszyklusfix ersetzt und automatisch abgebrochen;
**nur der zweite erfolgreiche Run gilt als Abnahme**.

Artefakt `frozen-map-firefox-33` (ID `13262794612`), inklusive
`firefox-summary.json`, sechs Warm-Pan-Berichten, sechs Cold-Berichten
und Screenshots; Zusammenfassung `passed:true`, `errors:[]`.

| Gleiche synthetische Firefox-Szene | `fogCull=0` | Standard 25H |
| --- | ---: | ---: |
| Fog-Hexkandidaten im letzten Frame | 399 | **135** |
| Frontier-Kandidaten | 126 | **12** |
| `fogMs` Warm-Pan p95 | 9 ms | **8 ms** |
| `fogUnreadyMs` Warm-Pan p95 | 7 ms | **5 ms** |
| `fogTransitionsMs` Warm-Pan p95 | 3 ms | **3 ms** |
| `drawMs` Warm-Pan p95 | 32 ms | **30 ms** |
| `frameGapMs` Warm-Pan p95 | 42 ms | **35 ms** |
| `fogCullMs` p95 | 0 ms | **0 ms** (Auflösung auf ganze ms) |
| Aktive Messframes | 30 | 30 |
| Fehler / Repeat-Decodes | 0 / 0 | **0 / 0** |

Die p95-Messwerte basieren auf 30 aktiven Frames je Modus, sind daher
**nicht** mit hoher statistischer Sicherheit auf andere GPUs/Viewportgrößen
übertragbar. Beispielsweise hatte `guarded` Cold `firstFullyVisibleMs=3396`
gegenüber `noFogCull=3623`; dies ist keine isolierte Kausalitätsmessung des
Fog-Pfades, da Start-/Decode-/Cachingzeiten variieren.

Screenshot-Gegenprüfung `firefox-guarded.png` vs.
`firefox-noFogCull.png`: dieselbe Geometrie, Terrain-/Baumstruktur und
Wolken-Frontier ohne offensichtliche neue Löcher im verkleinerten Vergleich.
Die PNGs sind **nicht pixelidentisch** (ca. 4,1% Pixel mit mindestens einem
RGB-Kanalunterschied >2), unter anderem im dynamischen unteren Wolkenbereich.
Das ist **keine** streng deterministische Gleichheitsabnahme; für eine
pixelgenaue Invariante müsste man die Kamera- und Fade-Zeitpunkte
synchronisieren. Weder unveränderte Darstellung auf jeder Windows-GPU
noch die 60-FPS-Zielgröße werden daraus behauptet.

**Entscheidung:** Der begrenzte, read-only 25H-Renderpfad hat einen
reproduzierbaren positiven A/B-Effekt und keine funktionalen CI-Regressionen.
Die 25H-Implementierung kann in `main` integriert werden, wenn das
Merge-Target keine gegenteiligen Renderänderungen enthält.
Die nächste Optimierung muss sich erneut anhand eines neuen,
automatisch messbaren Engpasses begründen.

## Grenzen und nächste Entscheidung

Viewport-Culling ist vor allem für große Welt-/Fog-Mengen sinnvoll. Ob
`drawTransitions`-Stempel oder `drawUnready`-Compositing der tatsächlich
dominierende `fogMs`-Anteil ist, zeigen erst die neuen Firefox-Teilphasen.
Nur anschließend einen separaten 25I-Schritt (etwa an Weltposition gebundene,
budgetierte Frontier-Raster oder selektive Fade-Zellaktualisierung) begründen.
Keine pauschale Cachebudget-Erhöhung, kein neuer Full-Bake, keine manuellen
Nutzer-Pan-Tests und kein 60-FPS-Versprechen ohne Hardwaremessung.

Siehe Issue #103, PR #117 / 25G und `docs/rendering/STEP25G_ADAPTIVE_CLOUD_RASTER_PAD_20261103.md`.

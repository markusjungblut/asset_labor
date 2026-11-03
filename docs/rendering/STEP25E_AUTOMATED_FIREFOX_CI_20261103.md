# Schritt 25E – Kein manuelles Kartenpanning mehr: automatische Firefox-Tests

Stand: 03.11.2026 · baut auf [PR #113 – Schritt 25D](https://github.com/markusjungblut/asset_labor/pull/113) auf.

## Neuer Nutzerbefund: `vedras_profile_v1-0374527a_cached(5).json`

Die aktuelle echte Firefox-159-Aufzeichnung stammt aus der eingefrorenen Karte `v1-0374527a`, 2859×1382 CSS-Pixeln, 4067×1966 Canvas-Pixeln. **596 Frames**, davon 164 aktive; 143 Pan-/25 Zoom-Events. Am Anfang startet die Karte bei **33 % Zoom**, 112 sichtbaren WorldTile-Paketen und 1×-LOD.

- `drawMs p50=136ms / p95=180ms`, `frameGapMs p50=144ms / p95=180ms`, Eingabe-bis-Zeichnungsende `p95=184ms`.
- Mit **Weltzeichnung p95=98ms, Wolken p95=91ms und Fog p95=70ms** ist der vorherige direkte Zeichenengpass wieder aktiv. `worldCacheFallbackFrames=525/596` und `cloudCacheFallbackFrames=378/596` zeigen, dass die gepufferten Kompositionsraster häufig fehlen. Die 25C-Raster-Caches sind also nicht ausreichend stabil über alle Zoom-/Ladezustände.
- `firstFullyVisibleMs=23605 ms` (23,605 Sekunden) gegenüber `1.361ms` in Profil 4. **Nicht direkt vergleichbar:** Profil 5 zeigt beim Start 112 benötigte Kacheln bei Zoom .33, Profil 4 eine andere Kamerakonfiguration und andere Bewegungen.
- **252 erfolgreiche PNG-Decodes**, davon **153×2× / 99×1×**, 65 wiederholte Decodes, 195 temporäre Bitmap-Evictions, nur 1 spekulativer Read. Das Priorisieren aus 25D greift; es löst aber die hohen Renderzeiten und die weiterhin teure Browser-Decodierung nicht allein.
- Dekodierung `p50=581ms / p95=1083ms`; IndexedDB-`storageMs p50=286ms / p95=453ms`. Damit ist diese Messung deutlich belasteter als Profil 4. Auffällig ist, dass **die Datei bereits vom Reader an `createImageBitmap` übergeben wird**, obwohl die Decode-Zeit wegen konkurrierender Browserarbeit hoch ist. Kausalität (GPU, GC, I/O, Scheduling) ohne Firefox-Performance-Trace nicht abschließend belegbar.
- RAM am Ende 94,727,837/95,000,000 Pixel (~361MiB RGBA), 57 aktive 2×-Bitmaps, 0×1×-Bitmaps. 65 wiederholte Decodes sind **sichtbar veranlasst**; das Spekulations-LRU-Problem aus 25D ist also zwar entschärft, aber es existiert weiterhin Zoomwechsel-/Working-Set-Druck.

**Konsequenz:** Änderungen an Ladepriorität und Komposition dürfen nicht mehr auf manuell ausgeführte Testkartenläufe angewiesen sein. Die neue Pipeline testet automatisch sowohl Browser-Korrektheit als auch Regressionen der Draw-/Decode-Kennzahlen.

## Automatisierte Implementierung

**Workflow:** `.github/workflows/frozen-map-ci.yml`

- Bei jedem Pull Request auf `main`/die benannten `feat/*`-/`fix/*`-/`test/*`-Branches und bei relevanten Pushes auf `main` laufen die Node-Render-/Lade-Tests sowie der echte Firefox-Browsertest **automatisch**. Unbedeutende Dokumentationsänderungen triggern keinen großen Testlauf. Gleichzeitige veraltete Läufe werden abgebrochen.
- **Sparse Checkout** lädt nur `frozen-map-*.js`, `cloud-artwork.js`, das reine Game-HTML und notwendige `tests/`-Dateien – keine großen 4×-PNG-Karten, kein Asset-Labor und keine gespeicherten Benutzerdateien. Minimal notwendige GitHub-Rechte: `contents: read`; zeitlich auf 12 Minuten begrenzt.
- Node 22: `node --test tests/test_rendering_step2[1-5]*.cjs` für die eigenständigen Karten-Regressionen ab Schritt 21, danach **Playwright Firefox** mit fixer Version **1.57.0**. Keine Änderung der Spielabhängigkeiten oder des Benutzer-PCs.
- `tests/automated_browser_frozen_map.cjs`: Kleiner lokaler HTTP-Server; im isolierten CI-Firefox werden **120 fertig vorgerenderte Kacheln** (2×-Terrain + transparentes Scenery), **120 vorab persistierte 1×-Varianten**, 399 Hex-Zustände und vier Cloud-Grafiken in frische IndexedDBs geschrieben. Es gibt **keine** Terrain-Generierung im Spielviewer. Der Test öffnet die echte `frozen-map-game.html` und prüft `saved=120`, sichtbare Bildpakete, Cloud-Basen, fehlende JS-/HTTP-Fehler und Fog-/Renderer-Initialisierung.
- Automatisierte **Pan-Bewegung hin/zurück** mit echten Playwright-Maus-/Pointer-Events, danach ein zweiter Durchlauf mit `prefetchGuard=0` als Referenz derselben isolierten Browserinstanz. Erzeugt per Lauf echte `perf=1`-JSON-Berichte, Screenshots und eine maschinenlesbare Vergleichszusammenfassung.
- Danach automatisierter Zoom per UI auf **1×-LOD und zurück nach 2×**. Prüft, dass die LOD-Umschaltung, Quellarchiv-Nur-Lesen und fehlende Bildladefehler erhalten bleiben.
- Automatische Artefakte (5 Tage) und Messzusammenfassung in GitHub Actions, **auch bei fehlgeschlagenen Tests**. Regressionen bei wiederholten Decodes und katastrophalen Draw-Zeiten führen zu einem fehlgeschlagenen Check. Absoluter 30–60-FPS-Nachweis erfolgt damit **nicht**, da CI-Hardware und GPU nicht dem Nutzerrechner entsprechen.

## Was ist abgedeckt – und was nicht?

**Automatisch, ohne Benutzerinteraktion:** Unit-/Regressions-Tests, synthetische PNG- und Bitmap-Dekodierung in Firefox, persistent vorbereitete WorldTiles, IndexDB, Fog/Cloud, echte Canvas-Ausgabe, Panning, Zoom-LOD, Direkt-/Prefetch-Zähler, Export von echten Browser-Profilen und Screenshots. Fehler sind im PR sichtbar.

**Nicht vollständig reproduzierbar auf GitHub:** Die **konkrete 600MB-Browser-IndexedDB** und GPU-/Treiber-Zeiten auf dem Windows-PC des Nutzers. Die Pipeline darf diese Daten nicht aus einem privaten Browser „erraten“. Für identische Produktionsdaten braucht es einen kleinen **nichtdestruktiven, anonymisierten Test-WorldTile-Export** bzw. das geplante serverseitige `manifest + tile-package`-Format. Bis dahin werden Test-WorldTiles in der CI selbst erzeugt; die Tests können Programmregressionen entdecken, aber keine hardwareidentischen 60 FPS auf dem konkreten PC garantieren.

**Zeit-/Speicherschutz:** Workflow nur für Render-Code/Tests und relevanten PR, 12-Minuten-Timeout und Abbruch überholter Läufe, Playwright-Firefox-Paketcache und 5-Tage-Artefakthaltung. GitHub Actions-Verbrauch prüfen; bei sehr knappen Free-Minuten kann anschließend ein self-hosted Runner sinnvoll sein – **nicht** ungefragt am Nutzer-PC installieren.

**Status:** GitHub Actions Job-Ergebnis muss nach PR-Erstellung tatsächlich geprüft werden; bis dahin nicht als CI-grün oder vollständig abgenommen markieren.

## Anschließender Performance-Arbeitsplan

1. Sobald der neue CI-Lauf grün ist, die **23,6 Sekunden Anfangs-Aufladung und die 525/596 Welt-Cache-Fallbacks** mit einer größeren initialen 33%-Ansicht automatisch reproduzieren. Vorherigen 25C-Vorteil durch einen warmen, gepufferten, LOD-stabilen Raster sichern.
2. Profiling der Zeit zwischen `getVariant`, `createImageBitmap`, Canvas-Draw und Compositor; Re-Decode durch LOD-/Budget-Wechsel begrenzen. 1× und 2× in getrennten Bitmaps weiter persistieren.
3. Mehrstufiges serverfähiges Tile-Paket-Format und Reimport-Test fixturefähig integrieren. Dabei den Originalexport unverändert lassen und Fog-Sicherheit durch serverseitige Autorisierung lösen.

Keine weiteren manuellen Pan-/Zoom-Exporte vom Nutzer voraussetzen.

## GitHub-Actions-Validierung der neuen Pipeline

Der **erste echte CI-Lauf** auf Draft-PR #114 konnte über den GitHub-Connector kontrolliert werden. Das Node-Gate meldete 31 grüne / 90 rote Tests, weil der zunächst zu breite Glob auch historische Asset-Labor-Tests ab Step 13 aufrief, deren `app.js`, `scripts/` und Asset-Pools im bewusst schlanken Checkout nicht vorhanden sind. Außerdem enthielten zwei alte Strukturtests unzulässige doppelt geescapte HTML-RegEx und einer rechnete noch mit einer längst abgeschalteten Zoom-Screenshot-Vorschau.

**Korrekturen:** Seit Commit `0f239e4` testet CI ausdrücklich Step 21–25 und damit nur den isolierten Frozen-Map-Viewer. Die alten Tests wurden auf das reale aktuelle Verfahren aktualisiert: 850-ms-Fog-Dissolve, Live-Zoom ohne Screenshot-Preview, aktuelle Variantenwahl und korrekte URL-RegEx. Die Tests wurden nicht stumm deaktiviert. Der Firefox-Lauf wurde vom ersten Node-Fehlschlag korrekt nicht gestartet. In der zweiten Iteration bestanden sämtliche eigenständigen Node-Regressionstests, aber die Firefox-Installation scheiterte, weil `ubuntu-latest` auf GitHub inzwischen Ubuntu 26.04 liefert und Playwright 1.57.0 dort keine Firefox-Builds anbietet. Der CI-Runner wurde deshalb ausdrücklich auf **`ubuntu-24.04`** fixiert.

**Automatische Abnahme bestätigt:** [GitHub-Actions-Lauf #41680811933](https://github.com/markusjungblut/asset_labor/actions/runs/41680811933) – **Node-Suite GRÜN, echtes Firefox-Browser-E2E GRÜN, Artefakt-Upload GRÜN, Job erfolgreich abgeschlossen.** Paket `frozen-map-firefox-6` (GitHub-Artifact-ID `13252028466`, ca. 2,7 MB komprimiert) enthält die von Firefox erzeugten PNG-Screenshots, zwei Performance-JSON-Dateien für das Guard-/Legacy-Panning und die zusammengefassten Messwerte. Die CI erfordert keine Benutzeraktion und löst bei relevanten PRs automatisch aus. Weiterhin kein Hardware-/Original-600-MB-FPS-Nachweis.

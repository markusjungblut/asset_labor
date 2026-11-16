# Vedras – Integrationsphase: stabile Funktionen zu einem durchgängigen Ablauf verbinden

**Stand:** 17.11.2026 · **Basis:** aktueller Remote-Branch `main` · **Arbeitszweig:** `integration/vedras-polish-smoke-20261117`

**Ziel:** Vorhandene und bereits funktionierende Teile von Asset-Labor, Welt-/Grafikgenerierung, gespeicherter Spielkarte und UI in einer konsistenten, testbaren Bedienkette zusammenführen. **Keine neue Renderoptimierungsserie.** Dieser Zweig darf kein Hauptverzeichnis, keine Originaldateien, keine IndexedDB-Karte und keinen privaten ZIP-Atlas überschreiben; PR bleibt Draft bis zur ausdrücklichen Freigabe.

## 1. Aktueller Code-/PR-Stand (verifiziert)

- `main` hat den eigenständigen Frozen-Game-Viewer, den Editor sowie die Bild-/Weltmodule. Im Editor sind die Steuerungen `frozenCapture`, `frozenCaptureAll`, `frozenCancel`, `frozenPlay`, `frozenStandalone` und `frozenExport` vorhanden. Der eigenständige Viewer bietet getrennte Kamera-/Fog-/Profilierungssteuerung und einen Rückweg zum Editor.
- Die beiden HTML-Einstiegsseiten verweisen derzeit zusammen auf **64 lokale JavaScript-Dateien** (Editor 55, Viewer 9) und **eine lokale CSS-Datei**. Die Dateien sind im aktuellen Remote-`main` vorhanden. Die 419 Editor-IDs und 16 Viewer-IDs sind jeweils eindeutig.
- **UI-Aufräumen:** [Draft #138](https://github.com/markusjungblut/asset_labor/pull/138) auf `ui/asset-lab-controls-cleanup-20261112`, unabhängig vom Renderer; bisheriger isolierter Firefox-UI-Smoke grün, visuelle Windows-Abnahme ausstehend. GitHub meldet momentan `mergeable=false` gegenüber `main` – vor einer Integration die vier neuen `main`-Commits und mögliche Konflikte gezielt prüfen; nicht automatisch rebasen.
- **Renderer-Basis:** [Draft #136](https://github.com/markusjungblut/asset_labor/pull/136) und die abhängigen 25R–25Z-Zweige. `perf/step25z-real-ram-eviction-20261112` ist gegenüber `main` **divergiert** (29 Commits voraus, 4 hinter `main`); der gesamte Stack ist **nicht** blind zu übernehmen.
- **Sichtbarer 1×-Sicherheitscache:** [Draft #140](https://github.com/markusjungblut/asset_labor/pull/140) basiert auf 25Z, bleibt hinter `fallbackAtlas=1` deaktiviert. Zwei reale Standard/Reverse-13er-Tests auf derselben gespeicherten 120-Tile-Originalkarte: **keine beobachteten fehlenden Kacheln** im komplett vorgewärmten 1×-Test; eine bemerkenswerte Reduktion von 2×-Evictions/Redecodes. **Noch keine** generelle Freigabe für Kaltstart, größere Karten, Bildqualität und Fog.
- **Andere vier optionale Schalter:** `leadPrefetch`, `lodRecency`, `visibleBorrow`, `parallelDecode` derzeit **nicht freigeben**. Der Standard-/Reverse-9er-Gegencheck konnte den zunächst positiven `parallelDecode`-rAF-Gewinn nicht stabil reproduzieren. Die Schalter sind nicht als grundsätzlich defekt einzustufen.
- **Messwerkzeuge:** [Draft #139](https://github.com/markusjungblut/asset_labor/pull/139) ist von der Runtime getrennt und dient nur Diagnose/Abnahme. Kein Grund, alle Benchmarkwerkzeuge in die normale Spieleroberfläche zu übernehmen.
- **Offene Produktgrenzen:** Vollständiger Atlas-ZIP-Reimport/Neustart über [Issue #103](https://github.com/markusjungblut/asset_labor/issues/103), ggf. Kachelnahtprobleme über [#90](https://github.com/markusjungblut/asset_labor/issues/90), später große Karten/15.000 Hexe. Diese Punkte bleiben ausdrücklich getrennt von einem erfolgreichen 1×-RAM-Test.

## 2. Erste konkret erledigte Integrationsarbeiten in diesem Branch

1. Die Statusleiste des eigenständigen Viewers unterscheidet jetzt **gespeicherte Kacheln** von **dekodierten 1×-/2×-Bildpaketen im RAM**. Bisher stand dort irreführend `decoded / saved gespeicherte Tiles`; mit gleichzeitig residenten Varianten kann `decoded > saved` sein, obwohl keine zusätzlichen Kacheln gespeichert wurden. Reine Beschriftungsänderung, keine Änderung an Kamera, Bildspeicher oder Persistenz.
2. `tests/test_integration_entrypoints_20261117.cjs` fügt einen **schnellen Node-Smoke-Test ohne Browser, private Karte oder neue Bake-Vorgänge** hinzu. Er sichert lokale Script-/CSS-Referenzen beider Einstiegspunkte, eindeutige IDs, den Editor-zu-Viewer-Bedienpfad, die getrennte read-only-Spielkarte, die Vollständigkeit der optionalen Cache-Integration und die Statusbeschriftung. Der Test ist absichtlich **nicht** an einen teuren GitHub-Actions-Workflow gekoppelt.

Lokaler Schnellcheck in einem **sauberen, separaten Worktree** dieses Branches:

~~~powershell
node --test tests/test_integration_entrypoints_20261117.cjs
~~~

Der Check ist ein **statischer Vertragstest** und ersetzt weder Firefox-/Windows-Darstellung noch funktionale Tests des ZIP-/Fog-/Spielzustands.

## 3. Produktnahe Integrationsreihenfolge

| Etappe | Was zusammenpasst | Abnahmebedingung |
|---|---|---|
| A – Bestand sichern | Bestehende Windows-Arbeit, untracked Dateien und Firefox-Origin `127.0.0.1:8780` | Lokal nur Status/Hashes lesen; keine Stash-/Reset-/Clean-/Bake-Befehle. Original-ZIP/Manifest vor Änderungen getrennt sichern. |
| B – Bedienung | Editor-Menüs, Welt-/Natur-/Geografie-Werkzeuge, Katalog, Presets sowie UI-Aufräumen #138 | Keine verlorenen DOM-IDs, Änderungen an Defaults, versehentliche `Natur verteilen`-Aktionen oder unverfügbare Import-/Exportsteuerung. |
| C – Zustandsvertrag | Editorwelt → autorisierte fertige 4×-Kacheln → gespeicherter Atlas/abgeleitete 2×/1× → eigenständiger Viewer | Dieselbe `scene`-Kennung, gleiche Origin, fertiger Manifest-/Layerstatus. Kein ungefragtes Überschreiben/Backen und kein unautorisiertes Fog-Leak. |
| D – Rendering | Nur nach Bestehen C: funktionierenden 1×-Sicherheitscache gezielt auf aktuellen Integrationsstand übertragen | Fallback-Korrektheit, Warmup/Kaltstart, volle 1×-Abdeckung bzw. begrenzte Teilabdeckung, Pixelbudget, kein schwarzer Bereich, 2×-Schärfenachzug. Andere vier Flags aus. |
| E – Durchgängiger Ablauf | Editor öffnen → Welt/Assets auswählen → Karte vollständig vorbereiten → Standalone öffnen → Schwenk/Zoom/Fog → ZIP-Export → neuer Browserstart | Vier visuelle Vergleichsstellen (Küste, Waldrand, Tile-Naht/Überhang, Fog-Grenze), keine Datenverluste, keine hängenbleibenden sichtbaren Requests, Navigation verständlich. ZIP-Reimport separat als offene Gate-Aufgabe. |
| F – Freigabe | Änderungen aus unabhängigen Draft-PRs im neuen, isolierten Release-Kandidaten zusammensetzen | Gezielt ausgewählte Node-/Firefox-Smokes, ein produktionsnaher Windows-Durchlauf, kontrolliertes Memory-/Fog-Gate, ausdrückliche Freigabe vor Merge. |

## 4. Praktische Stop-Regeln

- **Kein Merge** des kompletten 25R–25Z-Stapels nur wegen eines erfolgreichen Fallback-Benchmarks. Beim Port nur benötigte Runtime-Helfer und 1×-Sicherheitslogik wählen, übrige Flags deaktivieren und einzeln erneut regressionsprüfen.
- **Keine Scheinvalidität:** Grüne statische/Headless-Tests sind kein Nachweis für Bildschärfe, 15.000-Hex-Skalierung, Browserneustart, private ZIP-Reimporte oder GPU-Present-FPS.
- **Keine CI-Kontingentverschwendung:** Neue reine Dokumentations-/Statusänderungen und Node-Smokes gezielt lokal oder im gesonderten Worktree prüfen; den großen Firefox-Workflow erst bei einer echten Integrationsänderung beziehungsweise Abnahmestufe ausführen.
- **Kein Zugriff auf private Originalkarten in öffentlichen CI-Artefakten.** Öffentlich nur aggregierte Messwerte, Testskripte und zulässige synthetische Fixtures.
- Bei einer Regression zuerst den isolierten Integrationsbranch zurückstellen, niemals Originaldaten oder die lokale Arbeitskopie zurücksetzen.

## 5. Nächster konkreter Gate

**Zuerst die Windows-/Browser-Sichtprüfung des vorhandenen 1×-Sicherheitscaches inklusive Fog, Nachschärfen und Start ohne vorgewärmten RAM abschließen.** Parallel das UI-Aufräumen #138 separat integrierbar machen, ohne die stabilen Editor-Defaults zu verlieren. Erst danach dürfen UI, Renderer und Export in einen gemeinsamen Release-Kandidaten aufgenommen werden.

**Status:** Integrierbarer Smoke-Test und Statusbeschriftung implementiert; noch **kein** vollständiger Systemmerge oder Windows-End-to-End-GO.

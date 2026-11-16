# Schritt 25AA – begrenzter 1×-Sicherheitscache (Experiment, 16.11.2026)

## Problem und Ziel

Im gespeicherten Near-Atlas verursachen schnelle Kamera-Richtungswechsel wiederholt sichtbare Kachelluecken, obwohl synchrones Canvas-Zeichnen schnell bleibt. In zwei 9er-Lifecycle-Messungen waren 566/656 aktive Pressure-Frames (86,3%) unvollstaendig; 1.316/1.329 neue Fehl-Episoden traten bei drei bereits belegten Standard-Ladeslots auf. 676 dekodierte Cache-Eintraege wurden verdraengt, 286 mussten erneut dekodiert werden. **Ein vergroesserter Cache oder mehr gleichzeitige PNG-Decodes ist keine gesicherte Antwort.**

Ziel dieses Experiments ist, **sichtbar fehlende Kartenflaechen durch einen bereits residenten 1×-Fallback zu ersetzen**, statt alle 2×-Texturen gleichzeitig dekodiert halten zu wollen. Der 1×-Fallback enthaelt ausschliesslich bereits autorisierte, persistierte Frozen-Map-Bildinhalte, keine neuen unautorisierten Daten oder Terrain-Bakes.

## Implementierung (hinter `fallbackAtlas=1`)

- Die normale Renderlogik und die bereits vorhandenen persistierten 1×-Ableitungen bleiben erhalten. Im Bitmap-RAM-Cache werden nach und nach nur bereits vorhandene 1×-PNG-Pakete **dekodiert**, bis die Karte abgedeckt ist oder 1×-Eintraege etwa 65% der konfigurierten Bitmap-Pixelobergrenze beanspruchen. Die **bestehenden 95 Millionen dekodierten Pixel** gelten weiterhin fuer alle gemeinsam.
- Der Warmup startet nur bei ruhigem, vollstaendig mit der angeforderten Variante abgedecktem Viewport, **nach** sichtbaren Kachelanforderungen und **vor** normalem Prefetch. Es wird hoechstens ein fallback-Warmup gleichzeitig gestartet, und mindestens ein regulärer In-flight-Ladeplatz bleibt frei. Vorhandene Kacheln werden nicht erneut geladen.
- Bei RAM-Druck werden ungeschuetzte **2×-Qualitaetskopien vor 1×-Sicherheitskopien** verdraengt, nachdem unbenutzter normaler Prefetch entfernt wurde. Bereits sichtbare Kacheln bleiben wie zuvor gepinnt. Die normalen LOD- und Sichtbarkeitsregeln gelten unveraendert.
- Fehlt ein gewuenschtes 2×-Bild, wird ein bereits dekodiertes 1×-Bild desselben Tiles an denselben Weltkoordinaten als sofortiger Fallback gezeichnet, waehrend die 2×-Variante weiterhin angefordert werden kann. Die vorhandene Fog-Bereitschaft prueft beide Varianten und gibt **keine anderen** Tile-Geometrien frei.
- Ruecklaeufige 2×-Anfragen, deren Kachel beim Abschluss des Storage-Reads nicht mehr sichtbar/angefordert ist, duerfen **vor** der aufwaendigen 2×-Dekodierung enden. Wird die Kamera erst waehrend der Dekodierung fortbewegt, wird das spaeter fertige unnoetige Bild geschlossen, ohne es in den Bitmap-Cache aufzunehmen. Sichtbare und bewusst vorausgeladene Kacheln behalten Vorrang.
- Alle Vorgänge sind nur RAM-/Bitmap-Effekte. Der Frozen-Atlas, die abgeleiteten PNGs in IndexedDB und Fog-Berechtigungen werden nicht geloescht oder modifiziert. Standard ohne Parameter: `fallbackAtlas=false`.

## Beobachtbarkeit und Grenzen

`player.report()` enthält `fallbackAtlasEnabled`, `fallbackWarmTarget`, `fallbackWarmResident`, `fallbackWarmFinished`, `fallbackWarmCapped`, `fallbackResidentPixels`, `fallbackWarmStarts`, `fallbackHits`, `fallbackStaleStorageSkips`, `fallbackStaleDecodeDrops`. Das Warmup wird vor einem A/B-Messintervall abgewartet und seine Dauer separat protokolliert. Der Cache ist ein **Warmzustands-Experiment**; diese Zusatzlatenz darf nicht verschwiegen oder als Kaltstartleistung gewertet werden.

Ungeprueft bleiben: realer Firefox-RAM-/VRAM-Druck, Bildqualitaet waehrend laufendem 2×-Nachladen, Warmup-Dauer bei groesseren Karten und veraenderte CPU-/rAF-Kosten. Im unguenstigen Fall ist die 65%-1×-Quote nur ein Teilatlas und das experimentelle System kann weiterhin Kachelluecken zeigen. Auch bei Erfolg bleibt die 2×-Dekodierarbeit als Qualitaetsupgrade bestehen; **Evictions koennen weiterhin auftreten**, ohne zwingend sichtbare Luecken zu erzeugen.

## Reproduzierbarer Vergleich

Werkzeugzweig `test/windows-original-map-renderer-20261113` (Draft PR #139) starten:
```powershell
cd "C:\Users\marku\Desktop\asset_labor_renderer_tools"
git status --short
git fetch --no-tags origin
git switch --detach origin/test/windows-original-map-renderer-20261113
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action All -FallbackExperiment -RepoPath "C:\Users\marku\Desktop\asset_labor"
```
Das PowerShell-Skript erstellt/synchronisiert nur ein **drittes, eigenstaendiges und sauberes** Worktree im gleichen Elternverzeichnis: `asset_labor_renderer_fallback_experiment_20261116`. Ein vorhandenes Worktree mit lokalen Aenderungen wird nicht ueberschrieben. Baseline und bisheriger Kandidat bleiben dieselben wie zuvor. Es fuehrt den Node-Selbsttest der neuen Cache-Implementierung aus und startet erst danach den Read-only-Server.

Im selben Firefox-Profil mit gespeicherter Karte `http://127.0.0.1:8780/renderer-original-map.html` den Button **„1×-Sicherheitscache A/B (13 Läufe)“** mit Standard- oder Reverse-Reihenfolge verwenden. Report-Datei `vedras_windows_complete_fallback_*.json`.

A: bisheriger Kandidat ohne Fallback. B: separater experimenteller Renderer mit `fallbackAtlas=1`; 4×A/4×B als gegenlaeufige ABBA/BAAB-Bloecke, 3 unveraenderte Regionskontrollen, 2 main-Baselines. Fuer B wird jeweils vor dem Test die 1×-Deckung aufgewärmt, oder der RAM-Anteil erreicht sein vorgesehenes Limit. Die wesentlichen primaeren Zielgroessen sind **Anteil beobachteter Frames mit fehlenden Tiles** und **Missing-Dauer**, Nebenbedingungen p95-rAF, p95-Draw, RAM-Budget und Warmup-Zeit. Die automatische Auswertung ist **keine Freigabe**.

## Status

Stand 16.11.2026: Experimentquelle und drei gezielte Node-Regressionsfaelle committed; syntaktische Pruefung und dieselben Cache-/Warmup-/Stale-Skip-Pfade mit einem isolierten JavaScript-Testmodell erfolgreich. **Kein echter Windows-/Firefox-A/B-Durchlauf, keine Merge- oder Performance-Freigabe.**

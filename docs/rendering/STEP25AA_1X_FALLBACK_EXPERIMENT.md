## 17.11.2026 – Ergebnis des kleinen 9er-ParallelDecode-Abschlusstests

Quelle: `vedras_windows_complete_final_1794872435171.json` (Firefox 160, Windows 10, Scene `v1-0374527a`, Standardfolge, 16.11.2026 23:39–23:40 UTC). **Alle neun Läufe gültig**, keine Fehler oder Warnungen. Drei A- und drei B-Pressure-Läufe sowie drei Regionskontrollen auf dem gleichen Experimentrenderer mit aktivem, vollständig vorbereitetem **120/120 1×-Atlas** (43.217.940 Pixel); nur die zusätzliche Option `parallelDecode` wurde in B aktiviert. Alle anderen drei älteren Versuche blieben aus.

| Gemessene Druckfahrten (je 3) | A: 1× allein | B: 1× + parallel |
| --- | ---: | ---: |
| rAF-p95 pro Lauf | 66 / 66 / 73 ms | 47 / 53 / 57 ms |
| rAF-p95 Median | 66 ms | **53 ms (−19,7%)** |
| rAF-p99 Median | 98 ms | **74 ms** |
| Draw-p95 Median | 5 ms | 5 ms |
| Missing-Frames in aktiven Drawframes | 0/191 | 0/201 |
| Tatsächliche Parallel-Tile-Decodes | 0 | **257** |
| Evictions Median | 28 | 26 |
| Decode-Repeats Median | 5 | 5 |
| Durchschnittliche Bewegungsdauer | 2.559 ms | 2.275 ms |
| Aktive Drawframes pro Lauf | 62 / 65 / 64 | 67 / 65 / 69 |

B bleibt lückenlos in den beobachteten Drawframes, zeichnet sogar **mehr** davon auf, erzeugt keine lange `worldBlitMs>=100ms`-Operation und überschreitet das feste 95M-Pixelbudget in den aufgezeichneten Frames nicht (Maximum insgesamt 94.991.661 Pixel). Warmup A 1.384/1.480/1.387 ms, B 1.561/1.386/1.387 ms, jeweils 0 neu abgeleitete 1×-Cache-Einträge.

**Interpretationsgrenzen:** Kontroll-p95-rAF verbessert sich im Laufe derselben Sitzung **34 → 29 → 27 ms**. Das B-Feature wurde in jedem Block nach A getestet (A-B-B / A-A-B), sodass Sitzungstrend/Cache-/Systemdrift einen Teil des beobachteten Vorteils erklären könnten. Der Report bewertet die Sache daher korrekt als **„MOEGLICHER KLEINER GEWINN: WEITERE PRUEFUNG NOETIG“**. Kein allgemeingültiger FPS-/GPU-Nachweis und keine automatische Freigabe.

**Empfehlung:** Der 1×-Sicherheitscache bleibt vorrangig. Ein **einmaliger Reverse-9er-Test** in einer getrennten Firefox-Sitzung (B-A-A / B-B-A) ist der kleinste sinnvolle Gegencheck. Bis zu einem konsistenten Ergebnis `parallelDecode` weiterhin opt-in/AUS per Default, beide PRs Draft, kein Merge.

---

## Zwei echte Firefox-A/B-Sitzungen: Erfolg mit vorgewärmtem Sicherheitscache (16.11.2026)

Datenquellen: `vedras_windows_complete_fallback_1794866617591.json` (standard) und `vedras_windows_complete_fallback_1794866724882.json` (reverse), Windows 10, Firefox 160, Originalscene `v1-0374527a`, 120 Tiles. Beide Berichte vollstaendig (je 13/13 erfolgreich und gueltig), 0 Fehler, 0 Warnungen, kein Quality-Stop. Acht A-Pressure-Fahrten (bestehender Kandidat) und acht B-Pressure-Fahrten (separater `fallbackAtlas=1`-Renderer) in echten gegenläufigen ABBA/BAAB-Reihenfolgen.

**Beobachteter Effekt:** A hatte **551/656 aktive Frames (84,0%)** mit fehlenden Kacheln und **17.171ms** aufsummierte Missing-Duration; B hatte **0/507 Frames (0%)** mit fehlenden sichtbaren Kacheln, Missing-Duration **0ms**. Auch Cache-Churn fiel stark: Evictions **710→96 (−86,5%)**, Decode-Repeats **295→14 (−95,3%)**, Visible Read Starts **932→650**. `fallbackHits` summiert **4.782 wiederholte Nutzungen**, nicht 4.782 unterschiedliche Kacheln; verworfene alte 2×-Decode-Ergebnisse **289**, Storage-Pre-Skip **0**.

B hatte jeweils **120/120** 1×-Fallbacks resident, Pixelanzahl **43.217.940** (ca. 165 MiB bei 4 Bytes/Pixel). Kein 1×-Warmup-Cap erreicht. Das bestehende **95M-Pixelbudget** wurde nicht erhöht und war im aufgezeichneten Drucktest eingehalten. Warmup: Median **1.435,5ms**, Minimum **1.300ms**, Maximum **6.352ms**, Mittelwert **2.152ms**. Derived-1×-Konvertierungen **0**. A hatte vor der Fahrt im Median ca. 21,4M Pixel im RAM, B 43,2M Pixel vorgewärmte Sicherheitstexturen: dieser Test misst bewusst **warm vs. warm+zusätzlichen 1×-Vorrat**, keinen gleichen initialen RAM-Zustand oder Kaltstart.

Nebenbedingungen: Mittel der Pressure-Lauf-p95-rAF-Ticks **A 65,9ms, B 63,6ms**, keine stabile signifikante Framezeitverbesserung nachgewiesen. Mittel p95-Draw **A 4,25ms, B 4,75ms**. Einer der ersten B-Frames zeigte **35ms drawMs**, die jeweiligen p95-Werte blieben niedrig. Alle Druck-Welt-Blits unter 100ms. Kandidaten-Regionskontrollen rAF-p95 **34/35/34ms** (standard), **34/44/38ms** (reverse). Main-Baselines rAF-p95 **36→37ms** und **33→32ms**.

**Wichtiger methodischer Unterschied:** Die gleiche Kameraroute hatte je Pressure-Lauf 82 rAF-Ticks, aber A protokollierte 82 **aktiv gezeichnete** Frames je Lauf, B nur 62–66; B-Null-Missing ist deshalb ein sehr starkes Ergebnis für die **aufgezeichneten Zeichnungsframes**, nicht der Beweis, dass jeder einzelne Kamera-Tick auf der Hardware korrekt präsentiert wurde. Die 1×-Bildqualität bei hohem Zoom, die Stabilität unter normaler kontinuierlicher Spielnutzung und die initiale inkrementelle Hintergrund-Vorbereitung müssen vor produktiver Aktivierung visuell bzw. in einem geeigneten Live-Szenario kontrolliert werden. Mehrere Tausend Tile-Hits sind kein Ersatz für diese Darstellungskontrolle.

**Entscheidung:** Das 1×-Fallback-Design erreicht auf der 120-Tile-Originalkarte unter schneller, vorgewärmter Richtungswechsel-Belastung sein primaeres Ziel: **keine gemessenen sichtbaren Kachellücken bei stark weniger Evictions/Redecodes**. Experiment als vielversprechende Lösung beibehalten; Feature bleibt bis zur visuellen/Start-/Fog-Korrektheitspruefung opt-in. Beide PRs weiterhin **Draft**, kein Merge/Performance-GO.

---

# Schritt 25AA – begrenzter 1×-Sicherheitscache (Experiment, 16.11.2026)

## Problem und Ziel

Im gespeicherten Near-Atlas verursachen schnelle Kamera-Richtungswechsel wiederholt sichtbare Kachelluecken, obwohl synchrones Canvas-Zeichnen schnell bleibt. In zwei 9er-Lifecycle-Messungen waren 566/656 aktive Pressure-Frames (86,3%) unvollstaendig; 1.316/1.329 neue Fehl-Episoden traten bei drei bereits belegten Standard-Ladeslots auf. 676 dekodierte Cache-Eintraege wurden verdraengt, 286 mussten erneut dekodiert werden. **Ein vergroesserter Cache oder mehr gleichzeitige PNG-Decodes ist keine gesicherte Antwort.**

Ziel dieses Experiments ist, **sichtbar fehlende Kartenflaechen durch einen bereits residenten 1×-Fallback zu ersetzen**, statt alle 2×-Texturen gleichzeitig dekodiert halten zu wollen. Der 1×-Fallback enthaelt ausschliesslich bereits autorisierte, persistierte Frozen-Map-Bildinhalte, keine neuen unautorisierten Daten oder Terrain-Bakes.

## Implementierung (hinter `fallbackAtlas=1`)

- Die normale Renderlogik und die bereits vorhandenen persistierten 1×-Ableitungen bleiben erhalten. Im Bitmap-RAM-Cache werden nach und nach 1×-PNG-Pakete dekodiert (die vorhandene Derived-1×-Implementierung kann fehlende Ableitungen zuvor aus 2×-Daten erzeugen und in ihrer **separaten Cache-Datenbank** ablegen), bis die Karte abgedeckt ist oder 1×-Eintraege etwa 65% der konfigurierten Bitmap-Pixelobergrenze beanspruchen. Die **bestehenden 95 Millionen dekodierten Pixel** gelten weiterhin fuer alle gemeinsam.
- Der Warmup startet nur bei ruhigem, vollstaendig mit der angeforderten Variante abgedecktem Viewport, **nach** sichtbaren Kachelanforderungen und **vor** normalem Prefetch. Es wird hoechstens ein fallback-Warmup gleichzeitig gestartet, und mindestens ein regulärer In-flight-Ladeplatz bleibt frei. Vorhandene Kacheln werden nicht erneut geladen.
- Bei RAM-Druck werden ungeschuetzte **2×-Qualitaetskopien vor 1×-Sicherheitskopien** verdraengt, nachdem unbenutzter normaler Prefetch entfernt wurde. Bereits sichtbare Kacheln bleiben wie zuvor gepinnt. Die normalen LOD- und Sichtbarkeitsregeln gelten unveraendert.
- Fehlt ein gewuenschtes 2×-Bild, wird ein bereits dekodiertes 1×-Bild desselben Tiles an denselben Weltkoordinaten als sofortiger Fallback gezeichnet, waehrend die 2×-Variante weiterhin angefordert werden kann. Die vorhandene Fog-Bereitschaft prueft beide Varianten und gibt **keine anderen** Tile-Geometrien frei.
- Ruecklaeufige 2×-Anfragen, deren Kachel beim Abschluss des Storage-Reads nicht mehr sichtbar/angefordert ist, duerfen **vor** der aufwaendigen 2×-Dekodierung enden. Wird die Kamera erst waehrend der Dekodierung fortbewegt, wird das spaeter fertige unnoetige Bild geschlossen, ohne es in den Bitmap-Cache aufzunehmen. Sichtbare und bewusst vorausgeladene Kacheln behalten Vorrang.
- Die Bitmap-Residency und die Cache-Verdrängungen wirken nur im RAM. Die gespeicherten **Originalkacheln** und die Fog-Berechtigungen werden weder geloescht noch modifiziert. Die vorhandene Derived-1×-Schicht darf bei bislang fehlenden, aber erlaubten 1×-Ableitungen **neue Einträge in ihrem separaten IndexedDB-Cache erzeugen**; bestehende abgeleitete Kacheln werden nicht geloescht. Solche Konvertierungen und ihre Vorbereitungsdauer sind im Warmup-Bericht gesondert auszuweisen. Standard ohne Parameter: `fallbackAtlas=false`.

## Beobachtbarkeit und Grenzen

`player.report()` enthält `fallbackAtlasEnabled`, `fallbackWarmTarget`, `fallbackWarmResident`, `fallbackWarmFinished`, `fallbackWarmCapped`, `fallbackResidentPixels`, `fallbackWarmStarts`, `fallbackHits`, `fallbackStaleStorageSkips`, `fallbackStaleDecodeDrops`. Das Warmup wird vor einem A/B-Messintervall abgewartet; Dauer **und Anzahl währenddessen angelegter 1×-Derived-Einträge** werden separat protokolliert. Der Cache ist ein **Warmzustands-Experiment**; diese Zusatzlatenz darf nicht verschwiegen oder als Kaltstartleistung gewertet werden.

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

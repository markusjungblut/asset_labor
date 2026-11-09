# Schritt 25O – Autorisierungsgetriebene World-Blit-Streifen (experimentelles A/B)

Stand: 09.11.2026 · **PR #125 als ausschließlich opt-in aktivierbarer World-Blit-Modus in `main` integriert** (Merge `1765f24fdf5b3d4eeb71ee1c29b11241ad37780a`). Der bisherige Vollbild-Blit bleibt Produktivstandard.

## Ausgangspunkt

Der letzte [Schritt 25N](https://github.com/markusjungblut/asset_labor/pull/124)
wurde nach einem vollständig grünen Firefox-Test ohne Merge geschlossen:
`alpha:false` auf dem Display-Canvas änderte den synchronen
World-Blit nicht (p95 20→20ms) und den Frame-Abstand geringfügig
zum Schlechteren (53→55ms). Die früheren 25J-/25L-Copy-/DOM-Varianten
sind ebenfalls nicht für die Produktivnutzung geeignet.

Im jetzigen Stand werden aus dem vollständigen bereits maskierten
World-Raster pro Pan-Frame nochmals **sämtliche sichtbaren
Viewport-Gerätepixel** auf den Display-Canvas kopiert. Aber
`paintWorld` malt innerhalb seines Puffers **ausschließlich**
in sichtbaren/erkundeten Hexagonen: Ground wird durch
`clipCells(0)`, Scenery und ihre Überhänge durch
`clipCells(45)` begrenzt. Daneben ist die World-Schicht
transparent und darunter liegt der undurchsichtige Cloud-Backdrop.

**Hypothese:** An einem Rand der erkundeten Karte müssen
transparent leer bleibende World-Pixel nicht nochmals per
`drawImage` übertragen werden. Bei vollständig gefülltem
Viewport kann eine Streifenaufteilung teurer sein und muss
automatisch auf den bisherigen Blit zurückfallen.

## Streng opt-in `&worldBands=1`

- `frozen-map-world-blit.js` ermittelt pro Frame konservative
  Bounding-Intervalle aller **sichtbaren und erkundeten**
  Hexagone in gerätepixelgenauen, ca. 224 CSS-px hohen
  Horizontalstreifen. Verdeckte/unbekannte Hexe zählen
  **nicht** zum erlaubten World-Pixel-Footprint.
- Jede Hex-Box umfasst den tatsächlichen `+45`-World-Halo
  der Scenery-Clips sowie drei zusätzliche Gerätepixel für
  Antialiasing, Raster-Snapping und Sampling. Invalides
  Hex-Metadata führt **zum bisherigen vollständigen Blit**,
  niemals zum stillen Abschneiden.
- Bei maximal acht Streifen und mindestens 23% theoretisch
  eingesparten Bildpixeln wird **dieselbe bereits vorhandene
  World-Rasterquelle**, dasselbe 9-Argument-`drawImage` und
  dasselbe DPR verwendet, mit entsprechend eingeschränkten
  Quell- und Zielrechtecken. Andernfalls erfolgt exakt die
  bisherige eine Vollbildkopie.
- Die World-Renderpipeline davor bleibt vollkommen unverändert:
  alle ursprünglichen WorldTiles/Layer, Ground-/Scenery-Tiefen,
  Shadow-Padding, LOD, 25F-Dirty-Patches, 25I-Revision-Guards,
  25M-Budgetlimits, physikalische Display-Pixel und autorisierte
  Fog-Geometrie bleiben wie bisher.
- Kein neuer großer Canvas-/Bitmap-Cache, keine Änderung an
  Atlas-/IndexedDB-Daten oder World-Bake-Workern. Zusätzliche
  CPU-Kosten entstehen durch die Hex-Bounding-Planung;
  insbesondere bei dichter Welt kann der Versuch schlechter
  sein und wird deshalb **nicht voreilig als Default aktiviert**.

## Automatische Abnahme

- **Node:** Deterministische Geometrie-Tests für die konservative
  `+45`-Hexbegrenzung (verschobene Ansicht, fractional DPR,
  sichtbare/erkundete/verborgene Hexfelder), Qualität des
  unveränderten Vollblit-Fallbacks und tatsächliche reduzierbare
  Blit-Gerätepixel im Runtime-Fixture.
- **Headless-Firefox:** Neunter bisheriger Modus plus neuer
  `sparseWorld` (`worldBands=1`) mit Cold-/Pan-JSON,
  bereits vorhandenen synthetischen 120 WorldTiles/399 Hexes,
  vier Cloudtexturen und zwei Kamerafahrten:
  gewöhnlicher Warm-Pan im weitgehend gedeckten Zentrum
  (dort ist der Vollblit-Fallback wichtig), anschließend
  **gepaart** 24 aktive Pan-Frames in einem teilgedeckten
  Kartenrandbereich. Dort müssen mindestens 25% der
  tatsächlich von World-`drawImage` betroffenen Gerätepixel
  entfallen.
- Zusätzliche Telemetrie: `sparseWorldBlitFrames`,
  `sparseWorldBlitFallbacks`, `worldBlitDevicePixels`,
  `worldBlitFullDevicePixels`, `worldBlitLastRectCount`
  und `worldBlitLastFraction`.
- **Sicherheits-Gate:** Nach den Timed-Frames werden beide
  Browser-Seiten bei **derselben Kameraposition** und nach
  abgelaufenem Fog-Dissolve aus dem echten Display-Canvas
  ausgelesen. 140×80 tatsächliche RGBA-Proben müssen
  **ohne** Kanalunterschied >2 übereinstimmen.
  Das ist ein starker Stichprobentest, aber noch kein
  Pixelbeweis aller Karten-/GPU-Situationen.
- Entscheidung anhand des **gesamten** Render- und
  FrameGap-p95 plus Durchschnitt und der tatsächlich
  reduzierten Blit-Pixel. Das reine Einsparen von
  gerenderten Pixeln ist **kein** GPU-Present-Nachweis.

Kein 60-FPS-Versprechen für die unverfügbare private
Windows-/600MB-Karte; keine manuellen Benutzertests und
keine Änderung von Fog-Rechten, Quell-/1×-/2×-PNG,
Welt-Rasterlimiten oder Dekodier-Budgets.

## Erste vollständige Node-/Firefox-Abnahme (09.11.2026)

[GitHub Actions #42633168853](https://github.com/markusjungblut/asset_labor/actions/runs/42633168853):
**66/66 Node-Tests**, echte Firefox-Testserie mit zehn A/B-Varianten
plus LOD-Probe bestanden (`passed:true`, `errors:[]`).
Code-Head `1f7678ead47ab7c7839efc29a67d1da5571f2ad2`.
Automatisches Artefakt `frozen-map-firefox-67` (ID `13680823717`)
mit JSON, Screenshots und dem gepaarten Rand-Kameratest.

### Normale 30-Pan-Frames in der weitgehend gefüllten Kartenmitte

| Firefox p95 | Bestehender Renderer | `worldBands=1` |
| --- | ---: | ---: |
| `worldBlitMs` | 21 ms | 20 ms |
| `worldMs` | 25 ms | 24 ms |
| `drawMs` | 38 ms | 37 ms |
| `frameGapMs` | 45 ms | 42 ms |
| Mittlere Pan-`drawMs` | 41,20 ms | 40,30 ms |

In dieser dichten Kamerastellung meldet `worldBlitLastFraction=1` und
`worldBlitLastRectCount=1`: die vollständige ursprüngliche
`drawImage`-Kopie bleibt aktiv, nicht eine künstlich aufgesplittete
Vollbilddarstellung. Kleine Zeitdifferenzen können Runner-Rauschen sein.

### Gepaarte 24-Pan-Frames am Kartenrand

| Derselbe Firefox-CI-Runner | Standard | `worldBands=1` |
| --- | ---: | ---: |
| Tatsächlich kopierte World-Device-Pixel | 181 272 576 | **85 321 880** |
| Einsparung | 0 % | **52,93 %** |
| World-`drawImage`-Phase p95 | 17 ms | **9 ms** |
| `worldMs` p95 | 17 ms | **9 ms** |
| `drawMs` p95 | 80 ms | **74 ms** |
| `frameGapMs` p95 | 88 ms | **84 ms** |
| Mittlere Pan-`drawMs` | 77,38 ms | **69,71 ms** |
| Tatsächlich genutzte Streifen beim letzten Frame | 1 (Vollbild) | 1 (reduzierter Bereich) |
| Wiederholungsdecodes / Evictions | 0 / 0 | 0 / 0 |

Die breite World-Fläche des synthetischen Kartenrands wurde auf
durchschnittlich ~47,1 % der Gerätepixel reduziert. Der ebenfalls
synchrone Cloud-/Fog-Renderpfad blieb unverändert und erklärt, weshalb
die gesamte Draw-Zeit nicht um denselben Faktor fällt wie der World-Blit.
**Keine Behauptung von 60 FPS**.

**Autorisiertes Bild:** Beim gleichen Pan-Endpunkt, nach fertigem
850-ms-Fog-Dissolve, hatten **alle 11.200 echten RGBA-Pixelproben
(44.800 Kanäle) exakt identische Werte**, maximale Kanalabweichung 0.
Der Test verifiziert keine pixelgenaue Identität sämtlicher
Bildschirm-Pixel auf anderen Browser-/GPU-Systemen, ist aber ein
starkes automatisches Negativ-Gate gegen Maskenfehler.

Für einen späteren 15.000-Hex-Spielplan wurde außerdem ein
**mathematisch konservativer Frühabbruch** ergänzt: Sobald
bereits vollständig gedeckte Streifen für sich allein mehr als
77 % der Pixel belegen, kann kein späteres Hex die erforderliche
23%-Ersparnis wiederherstellen. In diesem Fall wird der
ursprüngliche Vollbild-Blit verwendet, ohne alle restlichen
Hex-Zellen durchzulaufen. Eine neue Node-Regression überprüft
den Abbruch bei 15.000 dichten Hex-Metadaten.

**Entscheidung:** Die erste Testserie zeigt einen echten, begrenzten
Benefit am Kartenrand ohne beobachtete Qualitäts-/Fog-Regression.
Nach dem durch die letzte Code-/Dokumentationsänderung
ausgelösten zweiten Firefox-A/B kann die Funktion als **opt-in**
in `main` integriert werden. Der Standard bleibt unverändert,
weil eine sparse Kartenrand-Messung noch nicht die
hardwareübergreifende 60-FPS-Anforderung belegt und die
zusätzlichen Hex-/Streifenberechnungen bei anderen
Szenen/GPUs nachteilig sein können.

## Zweite Firefox-Abnahme und Kontrolle der Cloud-Strategie

Die zweite vollständig grüne CI
[#42634049673](https://github.com/markusjungblut/asset_labor/actions/runs/42634049673)
([Artefakt](https://github.com/markusjungblut/asset_labor/actions/runs/42634049673))
bestand ebenfalls **66/66 Node-Tests** und Firefox ohne Fehler.
Die 15.000-Hex-Node-Probe des konservativen Frühabbruchs bestand.

**Gepaarter Kartenrand:** Erneut exakt
181 272 576→85 321 880 World-Pixel (−52,93 %),
`worldBlitMs` p95 12→7ms,
`drawMs` p95 59→30ms,
`frameGapMs` p95 72→42ms; 11.200 RGBA-Proben mit
**0 abweichenden Kanälen**.

**Achtung: Normal-Pan nicht konsistent besser.** Im gleichen
zweiten CI-Lauf lag die Mitte bei Draw-p95 **34→54ms**,
FrameGap-p95 **43→56ms**. Die World-Blit-Zeit war zwar
15→14ms, aber der **automatisch gewählte Cloud-Pfad**
benötigte im Standard im Mittel 2,8ms und in der
Streifenvariante **16,2ms** (`cloudMs`-p95 3→21ms).
Daher darf die Verschlechterung **nicht isoliert dem
Streifen-Code zugeschrieben** oder die gesamte
Rand-Beschleunigung ausschließlich als World-Gewinn behauptet werden.

Als zusätzliche Kontrolle führt die nächste automatische
Firefox-CI den Kartenrand nun in zwei weiteren Modi aus:
`fixedCloudBase` und `fixedCloudSparse`. Beide erzwingen
`cloudAuto=0` und damit dieselbe vorher ausgewählte
Cache-Kompositionsstrategie. Die gemessenen Cloud-Phasen
werden zusammen mit World-Blit-/Draw-/FrameGap-p95
explizit archiviert. Bei nicht eindeutigem Vorteil bleibt
der Code ausschließlich **opt-in** oder wird verworfen.
Eine generelle Aktivierung auf dem privaten Windows-Atlas
ist nicht vorgesehen.

## Finale CI und entscheidender Cloud-kontrollierter Vergleich (09.11.2026)

Der unveränderte Runtime-Code nach der dichten 15k-Hex-Frühabbruch-
Optimierung bestand [GitHub Actions #42634783368](https://github.com/markusjungblut/asset_labor/actions/runs/42634783368):
**66/66 Node-Tests**, alle zwölf Firefox-A/B-Modi sowie die
LOD-Probe erfolgreich, `passed:true`, `errors:[]`.
Geprüfter Head `fa6cdfbf971adc7c37e014fba73675a6f39023c5`,
Artefakt `frozen-map-firefox-72` (ID `13681279614`).

Die **entscheidende Kontrollmessung** fixierte für beide Varianten
`cloudAuto=0` und damit dieselbe erzwungene Cloud-Cache-
Strategie, während jeweils 24 aktive Frames **denselben sparsamen
Kartenrand** entlang geschwenkt wurden:

| Kontrolliertes Warm-Pan p95 | Vollständiger World-Blit | `worldBands=1` |
| --- | ---: | ---: |
| `worldBlitMs` | 13 ms | **7 ms** |
| `worldMs` | 13 ms | **7 ms** |
| `cloudMs` | **16 ms** | 17 ms |
| `fogMs` | 7 ms | **6 ms** |
| Gesamtes `drawMs` | 35 ms | **30 ms** |
| `frameGapMs` | 50 ms | **41 ms** |
| Mittleres Pan-`drawMs` | 32,54 ms | **27,67 ms** |
| Kopierte World-Pixel | 181 272 576 | **85 321 880** |
| Repeat-Decodes / Evictions | 0 / 0 | 0 / 0 |

Der ebenfalls getestete gewöhnliche Cloud-Auto-Betrieb
zeigte am Rand `worldBlitMs` p95 12→7ms,
`drawMs` 59→52ms und `frameGapMs` 73→68ms.
In der normalen dichten Mitte lagen
`drawMs` 33→32ms, `frameGapMs` 42→42ms und
`worldBlitLastFraction=1`: normaler Vollblit ohne
Streifenmehrfachkopie. Die feste Cloud-Paarung isoliert damit
den tatsächlichen World-Blit-Vorteil sauberer als
unsynchronisierte Autoschalter-Abgleiche.

Die separate identische-Kamera-/abgeschlossene-Fog-Probe
hatte erneut **11.200 RGBA-Pixel ohne eine Kanalabweichung**.
Das ist eine starke qualitative CI-Gegenprobe, aber
kein Beweis für absolut pixelgenaue Komposition auf der
unverfügbaren Original-Windows-GPU.

**Entscheidung:** Schritt 25O wird als
**ausschließlich opt-in aktivierbarer** read-only
Diagnose-/Performance-Modus `&worldBands=1`
akzeptiert. Der Standard bleibt der sichere durchgehende
9-Argument-Viewport-Blit. Grund: messbarer Nutzen nur
bei lückenhafter autorisierter Karte; 15.000-Hex-Sparse-
Karten und die private Windows-GPU sind nicht unter
realer Last geprüft. Keine 60-FPS-Behauptung.

## Main-CI nach dem Merge

Der Merge von [PR #125](https://github.com/markusjungblut/asset_labor/pull/125)
in `main` löste [GitHub Actions #42635973889](https://github.com/markusjungblut/asset_labor/actions/runs/42635973889) aus.
**Alle Node- und realen Firefox-Schritte bestanden auch nach dem Merge.**
Die letzten rein dokumentarischen Änderungen verändern keine World-,
Fog- oder Cache-Zeichenfunktionen. Der Browser-Default bleibt
`worldBands=0` und der in 25O getestete, autorisierte, konservative
Streifenpfad ist ausschließlich per `&worldBands=1` einschaltbar.

Für zukünftige Arbeit bleibt **die dichte normale Kartenmitte**
der Engpass: dort müssen alle World-Gerätepixel kopiert werden,
sofern nicht eine qualitativ sichere, an das tatsächliche
Rendering gebundene andere Strategie nachgewiesen wird.
Keine 60-FPS-Abnahme auf dem privaten Windows-/600-MB-Atlas.

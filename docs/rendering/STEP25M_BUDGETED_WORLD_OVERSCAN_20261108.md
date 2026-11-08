# Schritt 25M – Mehr Pan-Overscan innerhalb des bestehenden World-Rasterlimits

Stand: 08.11.2026 · Experimenteller Draft. **Die Produktivvoreinstellung bleibt unverändert.**

## Messgrundlage und Hypothese

Schritt 25L ([geschlossener PR #122](https://github.com/markusjungblut/asset_labor/pull/122))
hat gezeigt, dass eine CSS-/DOM-World-Komposition zwar den
synchronen `drawImage`-Aufruf eliminieren kann, aber im selben
synthetischen Firefox-Pan die p95-Frame-Abstände verschlechterte
(51→78ms). Deshalb wurde sie **nicht gemergt**.

Das aus Step-25L-Artefakt `frozen-map-firefox-57`
([CI #42530302764](https://github.com/markusjungblut/asset_labor/actions/runs/42530302764))
extrahierte Frame-Profil zeigt aber einen unabhängigeren Engpass:
**Während einer 360px-hin-und-zurück-Kamerafahrt werden zweimal
vollständige World-Raster neu erzeugt**, wenn der 272px große
symmetrische Cache-Rand verlassen wird.
Die zwei `worldPrepareMs`-Frames kosteten im unveränderten Renderer
133/135ms. Ein größerer **innerhalb desselben** Bildspeicherlimits
liegender Rand kann diese Rebuild-Spitzen im Warm-Pan vermeiden.
Die im Profil gemessenen p95-Werte dürfen nicht addiert werden.

## Streng opt-in: `&worldPad=1`

- Der bereits vorhandene `viewportPolicy.cameraCacheMargin(zoom)`
  bleibt die Untergrenze und beim Standard **unverändert**.
  Erst `&worldPad=1` sucht eine zusätzliche Pan-Reserve,
  höchstens `ceil(1.8 × alte Randbreite)`.
- Der Grenzwert wird aus Viewportbreite/-höhe, **unverändertem
  Welt-DPR**, dem vorhandenen 16,5-Megapixel-`worldRasterLimit`
  und maximal 8192 Gerätepixeln pro Kante mathematisch bestimmt.
  `Math.ceil`-Rundungen prüft ein expliziter ganzzahliger Pixeltest;
  bei knappem Raum wird der Rand heruntergezählt. Wenn schon
  der ursprüngliche Rand nicht in das Budget passt, bleibt die
  alte Fallback-Entscheidung **exakt** erhalten.
- Die Wahl wird sowohl zur Panning-Prefetch-/Viewport-Selektion
  als auch in `paintOverview` verwendet: **gleiche Pan-Reserve**
  für Tile-Priorisierung, Cache-Anker und tatsächlichen Raster.
  Der bekannte 25F-Dirty-Patch und die 25I-Revision-Invaliderung
  bleiben erhalten. Kein neues Raster außerhalb des vorhandenen Caps.
- Beispiel bei 2859px × 1382px CSS und etwa 1,433 DPR:
  272px alter Rand benötigt grob 12,8 Mio. World-Cache-Pixel,
  innerhalb von 16,5 Mio. zulässig sind bis ungefähr 434px.
  Der neue Versuch **belegt gegebenenfalls mehr Raster-RAM** als
  der bisherige Standard (hier bis etwa 14,8 MiB zusätzlich),
  obwohl das *harte Maximum* unverändert ist. Die höhere
  Pixellast beim Neuaufbau muss dem Einsparen von zwei
  neuen Vollrastern gegenübergestellt werden.
- Kein Wechsel auf 1×-LOD, keine Qualitätsreduktion, keine
  zusätzlichen Cloud-Raster, keine Erhöhung der dekodierten
  Bitmap-RAM-Grenzen, keine Öffnung von unbekanntem Terrain.

## Abnahme und Entscheidung

- Node-Regression `tests/test_rendering_step25m_budgeted_world_pad_20261108.cjs`:
  tatsächlicher Raster bleibt bei jedem Viewport unter dem
  vorhandenen 16,5-MP-/8192er-Limit; die symmetrische Reserve
  verhindert das zweimalige Rebuild bei ±350px, während
  `worldPad=0` den alten Vergleich beibehält.
  Bei zu großem Viewport weiterhin unveränderter Direct-Fallback.
- GitHub Actions misst `guarded` vs. `budgetedPad` auf derselben
  synthetischen 120-WorldTile-/399-Fog-Hex-Szene mit
  tatsächlichem Headless-Firefox, einschließlich der 30
  Pan-Frames, Cold-Startup, `worldMs`/`worldPrepareMs`/
  `worldBlitMs`, `drawMs`/`frameGapMs`, Full-World-Rebuilds,
  Decode-Wiederholungen und Screenshots.
- Diagnostik: `adaptiveWorldPad`, `worldEffectivePad`,
  `worldPadBoostFrames`, `worldPadClampFrames`.
- **Nur bei tatsächlicher funktionaler und zeitlicher
  Firefox-Verbesserung** über die Weiterverwendung entscheiden.
  Selbst bei Erfolg keine automatische Aktivierung auf
  bisher ungetesteter Windows-GPU ohne spätere Reproduktionsdaten.

Die private ~600-MB-Karte, alle Original-/1×-/2×-IndexedDB-
Pakete, Fog-Authentifizierung, Welt-Zoom- und Cloud-DPR,
Rasterpixel-Hardlimits und Autoren-Bake-Worker bleiben unverändert.
Nutzer muss **keine manuellen Pan- oder Profiltests** durchführen.
Keine Zusage von 60 FPS.

## Erste echte Firefox-Abnahme und A/B-Messung (08.11.2026)

[GitHub Actions #42531211737](https://github.com/markusjungblut/asset_labor/actions/runs/42531211737),
getesteter Code-Head `c9e5a08d2f77c397792a2d43e3c70d71c9bbb40f`:
**61/61 Node-Tests**, Headless-Firefox über alle neun Modi **grün**,
`passed:true`, `errors:[]`.
Das Artefakt `frozen-map-firefox-59` (ID `13637363272`) enthält
die zehn früheren/aktuellen Kategorien inklusive der neun A/B-Modi,
die synthetischen Weltbilder, JSON-Warm-/Cold-Profile und Screenshots.
Die Messung bildet **nicht** das private Windows-/600-MB-Original ab.

| Je 30 aktive Warm-Pan-Frames | alter Rand | `worldPad=1` |
| --- | ---: | ---: |
| Gewählter symmetrischer Cache-Rand | 272 px | **434 px** |
| World-Raster-Neuaufbauten *nach* Kaltprofil | **2** | **0** |
| `worldPrepareMs` p95 | 10 ms | **5 ms** |
| `worldBlitMs` p95 | 16 ms | 16 ms |
| `worldMs` p95 | 22 ms | **19 ms** |
| `drawMs` p95 | 33 ms | **30 ms** |
| `frameGapMs` p95 | 41 ms | **36 ms** |
| Mittleres `drawMs` | 33,47 ms | **26,00 ms** |
| Wiederholungsdecodes / Evictions | 0 / 0 | 0 / 0 |
| Tatsächlich belegter World-Canvas | **49 MiB** | **63 MiB** |
| Dekodierte Tile-RAM-Pixel | 41 746 432 | 41 746 432 |
| Präventive PNG-Reads | 7 | 7 |
| Cold `firstFullyVisibleMs` | 3480 ms | 3181 ms |

Das ist eine reproduzierbar automatisierte **einzelne** A/B-
Firefox-Testserie. 14 MiB zusätzliche World-Raster-Belegung sind ein
echter Memory-Aufpreis, obwohl das bestehende 16,5-MP-Limit nicht
erhöht wird. Kein erhöhter Bitmap-Decoding-RAM-Footprint oder erneutes
PNG-Decode in diesem synthetischen Lauf. Die Cold-Start-Differenz
kann durch Runner-/Cache-Varianz bedingt sein.

Das Ausbleiben beider Vollrasters ist eine **strukturelle** Verbesserung;
die um 5ms bessere `frameGapMs`-p95 ist bei nur 30 aktiven Frames
noch kein hardwareübergreifender Beleg. Der World-Viewport-Blit
selbst bleibt mit ~16ms p95 weiterhin der verbleibende
synchrone Hauptfaktor.

PNG-Gegenprobe `firefox-guarded.png` vs. `firefox-budgetedPad.png`:
Welt-/Baum-/Maskengeometrie im verkleinerten Sichtvergleich gleich.
Nicht streng pixelidentisch: 8,31% aller Pixel mit RGB-Abweichung >2,
6,70% in der oberen Bildhälfte (mittlere maximale Kanalabweichung
dort nur ~0,59), 9,92% in der unteren, zeitabhängigen Fog-Hälfte.
Weder ungeprüftes Leakage noch deterministische Pixelgleichheit
werden daraus behauptet; bei identischer Kameraposition und
Fade-Zeit wäre ein schärferer visueller Gate möglich.

**Entscheidung vor einer finalen Integration:** Die erste CI-Serie
stützt die optionale Lösung. Eine weitere erfolgreiche CI nach dem
Dokumentationscommit soll die Abnahme bestätigen. Angesichts
des ~14-MiB-RAM-Aufpreises und ohne echte Windows-Atlas-Hardware-
Messung bleibt der **Standardrand unverändert**.
`&worldPad=1` ist die vorsichtige opt-in-Variante.

## Zweiter unabhängiger Firefox-Lauf (08.11.2026)

Der Dokumentations-Commit löste die automatische Abnahme erneut aus:
[GitHub Actions #42531656118](https://github.com/markusjungblut/asset_labor/actions/runs/42531656118),
Code funktional unverändert, alle Node-/Firefox-Schritte **grün**,
`passed:true`, `errors:[]`; Archiv
`frozen-map-firefox-60` (ID `13637935942`).

| Je 30 Warm-Pan-Frames, zweiter CI-Runner | `worldPad=0` | `worldPad=1` |
| --- | ---: | ---: |
| Kamera-Overscan | 272 px | **434 px** |
| Vollständige World-Rebuilds beim Pan | **2** | **0** |
| `worldPrepareMs` p95 | **12 ms** | 15 ms |
| `worldBlitMs` p95 | 25 ms | 25 ms |
| `worldMs` p95 | **31 ms** | 33 ms |
| `drawMs` p95 | 49 ms | **47 ms** |
| `frameGapMs` p95 | **59 ms** | 62 ms |
| Durchschnittliches `drawMs` | 48,37 ms | **38,03 ms** |
| Repeat-Decodes / Evictions | 0 / 0 | 0 / 0 |

Damit ist die **strukturelle Rebuild-Vermeidung in zwei unabhängigen
Firefox-Läufen bestätigt**. Die durchschnittliche Zeichenzeit sinkt
in beiden Vergleichen (33,47→26,00ms bzw. 48,37→38,03ms),
die `frameGapMs`-p95 ist aber **nicht konsistent besser**
(41→36ms, anschließend 59→62ms). Selbst ein positiver
Durchschnitt ist keine 60-FPS-Abnahme. Speicherkosten von
~14 MiB mehr World-Raster bleiben bestehen.

**Entscheidung:** Die geprüfte Implementierung kann als
**streng opt-in** `&worldPad=1` nach `main` integriert werden,
um den etablierten Standardpfad für die private Windows-Karte
nicht zu ändern. Keine voreilige standardmäßige Aktivierung.
Der nächste Performance-Schritt muss die verbliebenen
~16–25ms Canvas-Kopierzeit, sowie verbleibende Streaming-/
Cache-Rebuild-Spitzen, mit besseren hardwaregleichen A/B-Profilen
untersuchen. Der DOM-Compositor-Versuch aus 25L ist hierfür
**keine** Lösung und bleibt verworfen.

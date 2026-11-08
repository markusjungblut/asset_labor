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

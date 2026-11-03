# Schritt 16B – 4×-Tile-Invalidierungen zugeordnet, keine Vermutungsoptimierung

## Befund und fehlende Beweisdaten

Die Step16A-Windows-Messung vom 30.10.2026 derselben 397-Hex-Szene
zeigt bei 4×-Pan rAF-p95 133,40 ms und 27 akzeptierte Weltkachel-Bakes,
13 Terrain-Builds sowie 13 `tile.ground-revision-changed`-Ereignisse.
4×-Zoom blieb mit nur fünf Frameintervallen und rAF-p95 3803,04 ms
diagnostisch/ungültig. Die bisherige Eventquelle meldete lediglich
den Invalidierungsgrund `terrain-core-revision-changed`, aber
**nicht die Änderungskomponente**: Terrain-Kern, Küste, Straße oder Fluss.
Aus der Eventzahl allein darf nicht auf fehlerhafte Terrain-LOD
oder redundantes Chunks-Primen geschlossen werden.

## Änderung

- `world-tile-streamer.js` protokolliert bei aktivierter Step15-Trace
  für jede tatsächlich invalidierte World-Tile-ID und das aktuelle LOD
  einen `tile.ground-revision-detail`-Eintrag. Er enthält geänderte
  Quelle(n) sowie alte/neue Quellversionswerte je Terrain, Shore, Road, River.
- Die Quelle ist die bereits in `reconcileGroundRevisions` vorgenommene
  maßgebliche Versionsprüfung; die Logik für Tile-Akzeptanz und
  Invalidierung bleibt **bytegleich in ihrer Entscheidung**.
- `scripts/rendering-step16a-audit.mjs` nimmt bis zu 60 Versionsdetails
  und eine begrenzte Auswahl von Tile-Ereignissen in `result.json` auf;
  `README.md` listet die Versionswechsel nach Phasen.
- Vier neue V8-Regressionstests verifizieren Terrain-/Shore-
  Einzelkomponenten, Road-only, identische Revision und abgeschaltete
  Tracing-Hooks. Die tatsächliche Tile-Streamer-Funktion wurde dabei ausgeführt.
- Optionales `--visual` aus dem vorgelagerten PR #73 erstellt
  Karten-Screenshots vor/während/nach Zoom, Ozean/Küste und Fog;
  `step16a-audit.zip` enthält die fünf PNGs.

## Einziger erforderlicher Diagnoselauf

Auf dem gestapelten Branch, nach den Node-Tests, die der Benutzer ohnehin
bereits ausführt:

```powershell
.\START_STEP16A_WINDOWS.cmd --qualities 4,auto --frames 90 --settle-ms 12000 --visual
```

Das ist ein einziger Durchlauf für die noch fehlenden 4×-Ursachen und
die optische Gegenkontrolle des erfolgreichen Auto-Zoom-Fixes.
Für jede echte 4×-Tile-Revalidierung erwarten wir nun eine konkrete
`changed`-Liste (terrain,shore,road,river) und die Tile-ID.
Darauf aufbauend erst einen minimalen, faktenbasierten 16B-Fix planen.
Das Tool bewertet keine unvollständigen Frames als valide Warm-Messung.

**Keine** Änderung der Produktions-Qualität, des Bioms, der Grafik-
Fidelity, der Ground-/Sprite-Speicherlimits oder des WorldTile-Caches.
Schritt 16C bleibt offen, Schritt 17 ist gesperrt.
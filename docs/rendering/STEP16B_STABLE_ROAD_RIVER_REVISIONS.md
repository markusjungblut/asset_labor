# Schritt 16B – stabile Straßen-/Fluss-Quellrevisionen

## Ausgangslage: 4×-Windows-Audit vom 30.10.2026, 17:50:43

Unveränderte 397-Hex-Szene mit 2.631 Nature-Instanzen. Auf Draft #83
verhindert die vorläufige Darstellung veralteter vollständiger Kacheln
einen weiteren 0%-Abdeckungsverlust. Während Pan wurden jedoch
**4**, während Zoom **6** World-Tile-Ground-Revisionswechsel
mit ausschließlich **Straßen-/Flussquellen** protokolliert.
Der Terrain-Kern und das Ufer blieben in allen zehn Fällen unverändert.

Beispiele aus dem tatsächlichen ZIP:

- Pan Tile `0,-2`: Straße `53 → 91`, Fluss `38 → 76`, Terrain `21 → 21`
- Pan Tile `-2,1`: Straße `62 → 97`, Fluss `47 → 82`, Terrain `25 → 25`
- Zoom Tile `-1,0`: Straße `50 → 127`, Fluss `35 → 112`, Terrain `31 → 31`
- Zoom Tile `-1,1`: Straße `96 → 125`, Fluss `81 → 110`, Terrain `38 → 38`

Die laufenden `chunks.js::rasterVersion`-Werte werden beim **Neubau**
eines Chunks erhöht – auch bei vollständig identischem Quell-Stempel.
`app.js::groundSourceRevision` verwendete diese laufende Nummer
für Road-/River-Quellen bisher als semantische Revision. Cache-Evictions
und identische Rekonstruktionen konnten dadurch fälschlich
World-Tile-Revisionen auslösen. Außerdem wurden vier vorübergehende
`pending`-Versionen bei Pan und sechs bei Zoom korrekt zurückgestellt;
dieses Verhalten bleibt erhalten.

## Eng begrenzte Korrektur

1. `VedrasChunks` stellt neben `version` (weiterhin der laufende
   Build-/Paint-Zähler) bei ausdrücklicher `sourceKeys:true`-Abfrage
   eine **stabile `sourceRevision`** bereit.
   Sie wird über 128-Bit-Fingerprints aus globaler
   `configure(signature)` und exakt dem für das Tile verwendeten
   `stampTile` gebildet. Die Darstellung ist fest begrenzt,
   einschließlich Quelllängenprüfung; eine theoretische
   Fingerprint-Kollision kann nicht vollständig ausgeschlossen werden.
2. `app.js::groundSourceRevision` benutzt diese neue Inhaltsrevision
   ausschließlich für **Straßen und Flussufer**. Terrain- und Ufer-
   Readiness-/Paint-Versionen bleiben unverändert.
3. Der direkte World-Tile-Source-Pfad und die schnelle Kamera-Reconciliation
   verwenden dieselben Quelltokens. Nicht vorbereitete Straßen-/Fluss-
   Chunks heißen weiterhin `pending`.
4. Ändern sich Straßenkanten, Brücken-relevante Layouts, Relief,
   Flussrouten, Bild-/Render-Einstellungen oder LOD-Dichte,
   ändert sich die entsprechende globale oder lokale Quellsignatur
   und somit auch die Inhaltsrevision. Es erfolgt ein echter
   World-Tile-Ersatz.
5. `tile.ground-revision-deferred`, die veraltete Übergangsdarstellung
   aus #83 sowie sämtliche Fog-/Source-Start- und Export-Prüfungen
   bleiben unverändert.

## Testnachweis

**72/72 gezielte Regressionstests im isolierten V8-Lauf bestanden:**
63 vorherige Material-, Ufer-, Sprite-/Terrain-Readiness-,
Retain-Stale- und Kamera-Fälle sowie 9 zusätzliche Tests
gegen die echte `chunks.js`-Chunkverwaltung und
`world-tile-streamer.js`-Reconciliation:

- Cache-Neubau mit gleicher Quelle: Build-Version ändert sich,
  `sourceRevision` bleibt gleich
- Edit einer Straßenkante: lokale Quellrevision ändert sich
- geänderte Relief-/Dichtekonfiguration: globale Quellrevision ändert sich
- Flussbankbreite geändert: neue Inhaltsrevision
- Vermeidung mehrdeutiger Stringkonkatenation
- identische Tokens im direkten und im Fast-Camera-Pfad
- World-Tile-Reconciliation ignoriert identische Quellrevision,
  invalidiert aber echte Änderung
- `pending` bleibt verschieden vom ersten fertigen Token
- Unbenutzte Terrain-/Ufer-Chunk-Quellen erzeugen **keinen** Fingerprint;
  er wird nur bei `readyTiles(..., {sourceKeys:true})` berechnet

**Noch keine native Windows-Node-/Chromium-Abnahme dieses Patches.**
Die bisherigen rAF-p95-Werte sind nicht warm-valide und beweisen
keinen tatsächlichen Performancegewinn. Auch vertikale Wasserlinien
bleiben ein eigenständiger visueller Blocker für Schritt 16C.

## Windows-Nachtest

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status
git fetch origin
git switch fix/step16b-stable-road-river-source-revisions-20261030
git pull --ff-only origin fix/step16b-stable-road-river-source-revisions-20261030
node --test tests/test_rendering_step16b_stable_road_river_revisions_20261030.cjs tests/test_rendering_step16b_retained_stale_ground_20261030.cjs tests/test_rendering_step16b_ground_asset_dependencies_20261030.cjs tests/test_rendering_step16b_shoreline_side_20261030.cjs tests/test_rendering_step16b_sprite_source_gate_20261030.cjs tests/test_rendering_step16b_terrain_start_gate_20261030.cjs tests/test_rendering_step16b_asset_camera_20261030.cjs
.\START_STEP16A_WINDOWS.cmd --qualities 4 --frames 90 --settle-ms 30000 --visual
```

Im Trace insbesondere `tile.ground-revision-detail`,
`tile.ground-revision-changed`, `tile.ground-revision-deferred`,
Tile-Bakes, `stale`-Anteile, Cache-Misses und native Warm-Gates
mit dem vorherigen Audit vergleichen. Eine tatsächlich veränderte
Road-/River-Quelle muss weiterhin eine neue Revision auslösen.
**Nicht mergen; Schritt 16C und 17 weiterhin gesperrt.**

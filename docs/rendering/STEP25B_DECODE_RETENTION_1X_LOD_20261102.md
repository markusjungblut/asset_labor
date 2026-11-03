# Schritt 25B – Dekodier-Churn eindämmen und persistentes 1×-Übersichts-LOD

Stand: 02.11.2026 · basiert auf Schritt 25A und dem unveränderten 2×-Renderpfad aus Schritt 24. **Draft, reale Firefox-Abnahme ausstehend.**

## Datenbasierter Auslöser

Aus dem echten Firefox-159-Bericht `vedras_profile_v1-0374527a_cached(1).json`: **755 aufgezeichnete Frames, 450 Pan-Events, 585 erfolgreiche Tile-Reads/Decodes** während eines einzigen Profilabschnitts bei lediglich 120 WorldTiles der Karte. `decodeMs` p50 **56 ms** / p95 **85 ms** je Tile, gegenüber `storageMs` p50 **5 ms**. Kumulativ `loads=958`, `evictions=908`. Synchronous `drawMs` p95 **7 ms**, aber aktive `frameGapMs` p95 **266 ms** – das Zeichnen ist normalerweise nicht die Hauptlast; starkes Herauszoomen führt zu längeren Intervallen. Das belegt wiederholtes Dekodieren, aber keine absolute Kausalität für alle Framepausen (GPU/GC/Browser-Scheduling bleibt möglich).

## Umsetzung

### 1. ImageBitmap-Warmhaltung – kein 30M-Pixel-Decode-Thrashing mehr

`frozen-map-runtime.js` verwendet statt der alten **30 Mio.** eine standardmäßige **95-Mio.-Pixel-Budgetobergrenze** für dekodierte, gerade nicht benötigte Weltbilder. Das ist ein RAM-Arbeitsbudget von circa 362 MiB RGBA; zusätzlicher Canvas-Raster-/GPU-Speicher und Browser-Overhead sind **nicht enthalten**. Aus dem Cache werden zuerst Bilder einer inaktiven Auflösungsstufe entfernt, danach die am längsten unbenutzten nicht sichtbaren Kacheln.

**Sicherheit:** Sichtbare oder als Übergangsfallback tatsächlich verwendete Bilder bleiben geschützt, selbst wenn sie den Zielwert überschreiten. Diese Ausnahme ist wichtig, weil abrupte Verdrängung sichtbarer Tiles Cloud-Pop-ins und Endlosdekodierung erzeugt. Vorschaubilder und Quellen werden niemals verändert; beim Verdrängen wird nur das temporäre `ImageBitmap` freigegeben. Die implementierte `maxDecodedPixels`-Option ermöglicht Vergleich mit 30M/60M/95M in isolierten Regressionen, nicht willkürliches Löschen von IndexedDB. Bei sehr vielen gleichzeitig sichtbaren Bildern ist die 95-M-Grenze **kein harter Gesamt-RAM-Grenzwert**, sondern ein Warmhaltebudget mit Sichtschutz.

### 2. Separate 1×-PNG-Cache-Ebene

Neue Datei `frozen-map-derived-1x.js`; DB `vedras-frozen-derived-1x-v1`, separat von:
- Original `vedras-frozen-world-v1`,
- bereits gefülltem 2×-Cache `vedras-frozen-derived-2x-v1`,
- historischen 4×-Quellen und dem 600-MB-ZIP.

Ein 1×-Bild wird **nur aus dem bereits vorhandenen 2×-PNG** (oder bei nativen 2×-Atlanten aus dem bestehenden nativen PNG) einmalig erzeugt, mit dem bestehenden `scaledCrop`-Verfahren. Dabei bleiben **Tile-Positionen, Pad, Layer-Reihenfolge, Revision, Hex-/Fog-Geometrie und Scenery-/Schatten-Compositing** erhalten. Für jedes Bildviertel rund ein Viertel der RGBA-Pixel; beim ersten Besuch ist die einmalige 1×-Konvertierung jedoch zusätzliche Arbeit. Wiederkehrende Aufrufe lesen nur die gespeicherte 1×-Ableitung.

Die neue Speicherung benutzt das unveränderte `storage.get(key)`-/`getVariant(key,'1x')`-Interface. Ein separater Datensatz wird nur in der **neuen** 1×-DB geschrieben. Bei Quotenfehlern gilt eine beschränkte, nichtdestruktive RAM-Ausweichhaltung. Nie Original-/2×-Daten löschen oder ändern.

### 3. Adaptiver Wechsel mit Hysterese und kontinuierlicher Sichtbarkeit

- Aktive 2×-Nahdarstellung **bleibt Standard**.
- Bei **Zoom ≤60 %** wird optional die 1×-Stufe verwendet.
- Bei erneutem **Zoom ≥72 %** kehrt die 2×-Stufe zurück.
- Zwischen 60 und 72 % wird die zuvor gewählte Variante beibehalten, um Hin-/Herflackern zu vermeiden.
- Die Runtime hält **getrennte RAM-Identitäten** je Auflösung und Weltkachel. Während `getVariant`/Bilddekodierung noch läuft, bleibt die **bereits dekodierte andere Variante** als sichtbares Fallback bestehen. Deshalb keine zusätzlichen Wolken, leeren Tile-Pixel oder plötzlichen Sprites während des Umschaltens. Auf dem nächsten warmen Besuch steht die richtige Auflösung bereits bereit.
- Der Panorama-Cache nimmt **maximal eine Variante pro Weltkachel** in sein zusammengesetztes Raster; keine doppelt übereinander liegenden Sprites/Schatten. Welt-Y-/X-Layer-Sortierung aus Schritt 24 bleibt unverändert.

### 4. Diagnose und kontrollierter Rückweg

Normale Aktivierung (1×-Übersichts-LOD **aktiv**):
`http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near&perf=1`

Exakte A/B-Kontrollgruppe mit neuem 95M-Warmhaltebudget, aber **ohne 1×**:
`http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near&perf=1&overview1x=0`

Alte Cachegröße im Test isoliert über `VedrasFrozenMap.create({maxDecodedPixels:30000000,...})` möglich; aktueller Viewer nutzt 95M. Für vollständigen fairen Vergleich mit 25A sind **sowohl 1×-LOD als auch die Cachebudget-Änderung getrennt zu betrachten**.

`window.__vedrasFrozenGameTest.stats()` zeigt nun `activeVariant`, `decoded1x`, `decoded2x`, `decodedPixels`, `lodSwitches`, `variantFallbackFrames`, `evictions`. `derived1x()` gibt die neue Cache-Statistik; `derived2x()` die vorhandene. Im `&perf=1`-Report werden `tileReads` nach `derived1x` und `derived2x` getrennt, Frames enthalten `activeVariant`, `decodedPixels` und `evictions`.

## Lokale Ausführung und Abnahme

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch feat/step25b-decode-retention-overview1x-20261102
git pull --ff-only origin feat/step25b-decode-retention-overview1x-20261102
node --test tests/test_rendering_step24_live_camera_depth_20261102.cjs
node --test tests/test_rendering_step25a_profiler_20261102.cjs
node --test tests/test_rendering_step25b_lod_retention_20261102.cjs
```

**Browser:** das unveränderte Firefox-Profil und `127.0.0.1:8780`. Erst die **gleiche vollständig gebackene** Szene `v1-0374527a` testen. Keine Browserdaten löschen, keinen Bake/ZIP-Export starten.

1. Erstes Herauszoomen ≤60 %: Einmalige 1×-Umwandlungen können spürbar sein; `derived1x().converted` steigt. Bereits sichtbare 2×-Tiles müssen weiterhin sichtbar bleiben, während ihre 1×-Ableitung lädt.
2. Wieder hinein ≥72 %: 2× scharf, identische Sprite-/Schatten-Reihenfolge und Fog; keine neuen Ladewolken bei vorbereiteten Tiles.
3. **Warmes 2. Herauszoomen**: `derived1x().hits` steigt, `converted` bleibt stabil. Durchgehender Pan über dieselbe Region sollte deutlich weniger `tileReads` und `evictions` verursachen.
4. Cached A/B mit `&overview1x=0`: In derselben Bildschirmgröße und mit ähnlicher Kamerabewegung bei 94 % / 70 % / 48 % testen. Für jeden Fall nach Warmup `profileReset()`, 15–20 s pannen, **Performance-JSON** exportieren. Wichtige Felder: `phasesMs.frameGapMs`, `tiles.counts.derived1x`, `runtime.decodedPixels`, `runtime.evictions`, `slowFrames.gapOver100ms`.
5. Qualität und Sicherheit: Die 1×-Übersicht darf etwas weniger detailliert aussehen; 2×-Nahmodus muss unverändert scharf sein. Kachelränder, überlappende Baumkronen, Schatten, Hexmasken und Auflösung der Lade-Wolken dürfen **nicht** verrutschen oder unerlaubte Gebiete zeigen.

## Isolierte Prüfergebnisse / Grenzen

V8-Tests auf Simulatorgrundlage: 9 vollständig gespeicherte 2×-Mock-WorldTiles. 2× bei 90 %, Umschaltung bei 50 %, **12 World-/Layer-Bildoperationen in der ersten Fallback-Zeichnung** ohne Leerstelle, 9 zusätzliche 1×-Decode-Pakete, Rückkehr auf 2× bei 81 %; keine Quellschreiboperation. JavaScript-Syntax für neue und geänderte Runtime-/Game-/1×-Module erfolgreich. Separate Node-Regression ist im Repo; native Node-Ausführung und **echte Firefox-Abnahme mit 120 Tiles** stehen aus.

**Kein Performanceversprechen:** 585 erneute Decodes sind eindeutig, aber es ist noch nicht bewiesen, dass allein der neue LRU/LOD die gemessenen 266-ms-p95-Framepausen beseitigt. Wenn die warmen 48%-Pans weiterhin >33 ms dauern, ist der nächste Schritt gezieltes Firefox-Main-Thread-/ImageBitmap-/GPU-Compositor-Profiling – nicht eine unscharfe Vorschau.

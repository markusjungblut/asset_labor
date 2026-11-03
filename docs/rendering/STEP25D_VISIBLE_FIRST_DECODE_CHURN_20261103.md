# Schritt 25D — Sichtbare Tiles priorisieren, Bilddekodier-Churn verhindern

Datum: 03.11.2026 · basiert auf [Schritt 25C / PR #112](https://github.com/markusjungblut/asset_labor/pull/112). **Draft; tatsächliche Firefox-Abnahme steht aus.**

## Gemessene Ausgangslage

Aus `vedras_profile_v1-0374527a_cached(4).json`: 934 Frames, 646 Bildpakete (406×2×, 240×1×), 493 Evictions, `drawMs p95=6ms`, `frameGapMs p95=243ms`, Decode `p50=39ms / p95=94ms`. 120 gespeicherte WorldTiles; alle 1×-Ableitungen bereits persistent, keine Terrain-Bakes. Bildladen und lange Frame-Lücken korrelieren, aber die Ursache kann auch durch GPU-Upload, GC oder Browser-Scheduling verstärkt werden. Speziell beim 2×-Panning ist wiederholtes Dekodieren bisher stark sichtbar.

**Code-Befund:** Der bisherige Viewer prüft in jedem `draw()` die komplette Vorschauliste mit `read(t.key,variant)`. Obwohl der 95M-Pixel-LRU fast voll ist, fängt `read()` bis zu drei parallele spekulative Bilddecodes an. `keepWithinBudget()` entfernt daraufhin andere kürzlich benutzte dekodierte Bilder, manchmal auch dieselben gerade vorgeladenen Kacheln. Noch schlimmer: Offscreen-Cachetreffer wurden bei jedem `read()` in der Map als *jüngst benutzt* nach hinten verschoben. Damit wurden **ungesehene Hintergrundkacheln künstlich heißer als echte Spielansicht**. Bei Kamerarichtungswechseln konnte das massiv Re-Decoding verursachen.

## Umsetzung

### Priorisierte Bitmap-Ladeplätze

`frozen-map-runtime.js` hat weiterhin insgesamt höchstens **3** gleichzeitige Tile-Reads/Decodes. Die neue Default-Regel `prefetchGuard=true` erlaubt davon **maximal einen** als rein spekulatives Vorladen. Sichtbare Tiles erhalten zuerst bis zu drei Plätze; während mindestens eine gewünschte sichtbare Auflösungsvariante fehlt, startet **kein** neues Offscreen-Prefetch.

Eine laufende spekulative Anfrage kann bei Kameraschwenk zur **sichtbaren** Anfrage werden: Sie wird ohne erneutes Lesen/Decodieren weiterverwendet und ihr Zweck in der Tracking-Map aktualisiert. Ein schon gestarteter Decode wird nicht riskant abgebrochen und Fog-Geometrie oder Sprite-Ordnung werden nicht verändert.

### Speicherbudget mit Vorhalte-Reserve

Spekulative Bilddecodes starten nur bei ausreichend freiem dekodiertem RAM. Die benötigte Reserve beträgt mindestens **12 % des vorhandenen `maxDecodedPixels`-Budgets** und mindestens das Doppelte der bislang gemessenen Bitmap-Pixel eines Tiles der jeweiligen 1×-/2×-Variante (vor der ersten Messung wird mit 2M Pixeln pro Tile geschätzt). Die Reserve ist konservativ und wird **nicht** als zusätzliche RAM-Allokation reserviert. Beim kalten ersten Start kann deshalb weniger Offscreen-Prefetch stattfinden; der sichtbare Bereich hat Vorrang.

Die bestehende 95M-Pixel-Zielgrenze (~362 MiB dekodierte RGBA-Daten **ohne** GPU, Canvas-Raster usw.) bleibt unverändert, einschließlich Sichtschutz bei unvermeidbarer Überschreitung.

### Korrekte LRU-Präzedenz

1. Bei Verdrängung zunächst **nie gezeichnete** spekulative Kacheln wählen.
2. Danach inaktive LOD-Varianten, sofern nicht sichtbar/als Fallback benötigt.
3. Erst danach andere ältere, nicht sichtbare Bildobjekte.
4. **Cache-Hits für Offscreen-Prefetch verändern die LRU-Reihenfolge nicht.** Nur sichtbare Nutzeransichten machen eine Kachel wieder „heiß“. Die ältere LRU-Strategie lässt sich über `prefetchGuard=0` zum Vergleich vollständig zurückschalten.

Die bereits vorbereiteten 2×- und 1×-PNG-Blobs in getrennten IndexedDBs bleiben unverändert; Evictions schließen ausschließlich temporäre `ImageBitmap`-Objekte.

### Diagnostik und A/B

Der Viewer hat den optionalen Query-Parameter `&prefetchGuard=0` zum Vergleich mit der bisherigen 25C-Ladestrategie. Standard ist **`prefetchGuard=1`**.

Neue Runtime-Statistiken: `visibleReadStarts`, `prefetchReadStarts`, `decodeRepeats`, `visibleDecodeRepeats`, `prefetchDecodeRepeats`, `prefetchSkippedVisible`, `prefetchSkippedBudget`, `prefetchSkippedSlots`, `evictedSpeculative`, `visibleWaitingOnPrefetch`, `activePrefetch`. Bei Statuswerten mit `Skipped` handelt es sich um **bei einem Draw erneut geprüfte Möglichkeiten**, nicht um unterschiedliche Tile-IDs. Re-Decode-Zählungen erfolgen nach **logischem Tile-Key + Variante**, über eine begrenzte 2048er-Metadatenhistorie; die Bildbytes selbst werden dadurch nicht vervielfältigt.

Mit `&perf=1` enthält der JSON-Bericht für jede echte Tile-Dekodierung `tileId`, `variant`, `purpose` (`visible` oder `prefetch`), `redecoded`, `decodedCount`. Die Profil-Auswertung fasst `byPurpose` und die zwölf am häufigsten dekodierten Tile-/LOD-Kombinationen als `tiles.topRepeated` zusammen. Der Bericht bleibt im Browser lokal bis zum vom Nutzer ausgelösten Download.

**Achtung:** `profileReset()` löscht lediglich die Profil-Samples, nicht die laufende Bilder-/Re-Decode-Historie der aktiven Spielkarte; differenzierte Werte aus dem JSON-Frameverlauf oder die neuen `tileReads` für einen bestimmten A/B-Zeitraum verwenden.

## Kontrolliertes Simulations-Ergebnis

Mit derselben V8-Spielruntime, 81 Mock-WorldTiles (9×9), 400×240 Canvas, 2×-Bitmap-Layern (512×512) und absichtlich knappem Decoderbudget **4,5M Pixel** wurden mehrere Fahrten über dieselben Regionen wiederholt:

| Wert | Alter Prefetch (`prefetchGuard=0`) | Sichtpriorität (`prefetchGuard=1`) |
| --- | ---: | ---: |
| Erfolgreiche Tile-Decodes | 198 | 15 |
| Evictions | 190 | 7 |
| Re-Decodes | 176 | 2 |
| Dekodierungen durch Spekulation gestartet | 187 | 3 |
| Fehlgeschlagene Tiles | 0 | 0 |

**Dieser Zahlenvergleich ist eine absichtlich künstlich knappe Cache-Simulation, kein Firefox-FPS-Ergebnis.** Er dient als Regression gegen die neu gefundene Decode-/Eviction-Endlosschleife. Mit 12M Testbudget konnte der neue Viewer bei warmem Sichtbereich weiterhin einzelne benachbarte Tiles vorladen, statt alle Hintergrundarbeit grundsätzlich abzuschalten. Bei realen 95M müssen Speicherwirkung und Interaktions-FPS separat geprüft werden.

## Tests in Firefox / Windows

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch feat/step25d-visible-priority-decode-churn-20261103
git pull --ff-only origin feat/step25d-visible-priority-decode-churn-20261103

node --test tests/test_rendering_step25b_lod_retention_20261102.cjs
node --test tests/test_rendering_step25c_wide_raster_20261102.cjs
node --test tests/test_rendering_step25d_visible_priority_20261103.cjs
```

Im selben Firefox-Profil wie bisher und auf exakt derselben `127.0.0.1:8780`-Origin öffnen:

- **Neue Default-Policy:** `http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near&perf=1`
- **Alte 25C-Policy:** `http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near&perf=1&prefetchGuard=0`

**Gleiches Browserfenster, gleiche Startzoomstufe und vergleichbare Fahrstrecken; zuerst beide Varianten vollständig warm laden.** Für jeden Vergleich `profileReset()`, 15–20 Sekunden bei 70–95 % pannen (besonders denselben Weg hin und zurück), dann die Performance-JSON-Datei speichern. Zusätzlich 48 % als separate Messung. Betrachtet werden `tiles.counts.repeated`, `tileReads.purpose`, `decodeRepeats`, `evictions`, `frameGapMs p95`, `inputToDrawEndMs`, `pendingTiles` und `visibleReadyTiles`.

Kritische visuelle Prüfung: Sichtbare 2×-Landschaft **unverändert scharf**, 1×-LOD beim Herauszoomen, 850-ms-Fog-Dissolve, Hex-Kanten, überhängende Baumkronen und Schatten bleiben exakt erhalten. Vorhandene ZIPs, die 4×-Originale und die 2×-/1×-Bilddaten **nicht löschen, neu backen oder überschreiben**. In der späteren Servervariante dürfen nur autorisierte Kachelpakete an Clients ausgeliefert werden.

## Grenzen / Fortsetzung

Die Mock-Laufzeit wurde mit den neuen Countern und der alten Kontrollgruppe tatsächlich als V8-Code ausgeführt; alle geänderten JavaScript-Module sind syntaktisch gültig. Der separate Node-Test wurde im Repo angelegt; **native Windows-Node-Ausführung und reale Firefox-Performance-Reports stehen noch aus**, weshalb der PR Draft bleibt. Wenn sich trotz deutlich weniger Decode-/Eviction-Vorgängen die echten `frameGapMs p95`-Werte nicht verbessern, als nächstes **Firefox Performance Profiler** (ImageBitmap, Main-Thread-Longtasks, GC, GPU-/Compositor-Uploads) einsetzen; keine weiteren spekulativen Canvas-Umbauten.

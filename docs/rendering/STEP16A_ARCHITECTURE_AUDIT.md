# Schritt 16A – Architektur-Audit statt weiterer Performance-Hotfixes

**Status: Implementiert als Diagnosewerkzeug; reale Windows-/GPU-Evidenz aus dem neuen Audit steht aus.**
Schritt 16, PR #70 und PR #71 bleiben ungemergt bzw. unbestätigt, bis die Tests und Bildabnahme bestanden sind. Schritt 17 wird nicht begonnen.

## Fragestellung und unveränderte Kontrollen

**A: Produktions-Compositor allein.** Die neue Seite `step16a-control.html` lädt ausschließlich
`world-tile-streamer.js`, keinen Editor und keinen Asset-Loader. Sie erstellt ein unabhängiges
WorldTiles-Objekt, speichert **16 vollständige Ground-/Scenery-Tiles vor der Messung** und misst
Schwenken und Zoomen über je 90 rAF-Frames ohne `source`-Callback. Alle Paketdaten stehen im Cache.
Die Testbilder sind synthetisch: Sie prüfen die Kosten des bestehenden Canvas-2D-Compositors und
repräsentieren **nicht** die Bildaufbereitung der tatsächlichen Szene. Der Test ist ungültig, sobald
Tiles fehlen, ein Tile erneut gebaut/evicted wird oder die sichtbare Fläche nicht vollständig bedeckt wird.

**B: Reale 397-Hex-Szene.** Unveränderte Referenzdatei mit 2.631 Nature-Instanzen über den echten
CDP-/Browserpfad importieren. Für 4× und Auto jeweils Vorbereitungsphase, danach Warm-Pan und Warm-Zoom.
Das neue Messwerkzeug benutzt die bestehenden `worldTileStats`, `qualityStats`, `Step15Trace` und
`Performance.getMetrics`, verändert aber keine Renderinglogik. Vor jeder Warm-Messung verlangt es
Readiness plus zusätzliche stabile 1,2 Sekunden ohne neue fertige/verworfene Bilder oder Bakes.
Während des Kameratests dürfen keine Asset-Events, Bakes, Cache-Misses oder Invalidierungen auftreten.
Fehlt dieser Nachweis, sind rAF-Zahlen **Diagnosewerte und kein FPS- oder Speedup-Nachweis**.

**C: Revisions- und Speicheranalyse.** Der Bericht enthält Gründe von
`tile.invalidate`, `asset.invalidate`, `tile.bake` und `tile.cache-miss`, und vergleicht
decoded/geschützte Bildbytes mit dem konfigurierten Budget. Bei verworfenen Trace-Events
wird Ursache-Attribution als unvollständig gekennzeichnet; der Reporter extrapoliert nicht.

## Einmaliger Windows-Lauf

Im Projektordner und auf dem gezielt bereitgestellten Audit-Branch:

```powershell
node --test tests/test_rendering_step16a_audit_20261029.cjs
node --test tests/test_rendering_step16_readiness_20261029.cjs
node --test tests/test_rendering_step16_ground_reuse_20261029.cjs
.\START_STEP16A_WINDOWS.cmd --qualities 4,auto --frames 90 --settle-ms 12000
```

Ausgabe: `artifacts/rendering-step16a-audit/step16a-audit.zip` (README und JSON).
Das Skript eröffnet einen eigenen lokalen Server und Chrome-Prozess, löscht lediglich das dedizierte
Step16A-Ausgabeverzeichnis und beendet die eigenen Prozesse. Keine GitHub-Actions-Minuten erforderlich.
Ein nicht abgeschlossener Auditlauf wird im JSON als unvollständig dokumentiert.

## Interpretationsgates für Schritt 16B

| Isolierter Compositor | Reale Warm-Messung | Schlussfolgerung |
|---|---|---|
| Schnell / gültig | Nicht warm / ungültig | Keine Backendentscheidung; zuerst Scene-Readiness, Bild-Lebensdauer und Revisionsursachen untersuchen |
| Schnell / gültig | Warm, aber langsamer | Vorbereitetes Tile-/Scenery-Komposit und zusätzlicher CPU-/GPU-Aufwand ursächlich zuordnen; danach gezielt vereinfachen |
| Langsam / gültig | Beliebig | Tile-Komposition, Pixelkopien und tatsächliche Ausgabefläche profilieren; erst dann Canvas-/GPU-Vergleich vorziehen |
| Ungültig | Beliebig | Kontrollmessung reparieren; keine Schlussfolgerung über Architektur zulässig |

Ein Mix aus Cold-/Warm-Phasen darf **nicht** als Performanceverbesserung ausgegeben werden.
Für 16B ist eine Entscheidung auf Basis der tatsächlichen abgenommenen 16A-JSON verpflichtend.
Unabhängige Grafik-/Asset-Gates bleiben bestehen. Der vorangegangene vierte Windows-Benchmark
hat 2/8 Readiness, aber keine JavaScript-Exceptions, einen korrigierten `ocean`-Zelltyp
und im Auto-Modus einen geschützten Bildbestand oberhalb des Poolbudgets gezeigt.

## 16B – nach eindeutiger 16A-Ursache

**Kein pauschaler Komplettumbau.** Maximal eine isolierte Engpassklasse pro Patch:
- Bei Decode-/Schutzlast: Lebensdauer tatsächlich sichtbarer Assets, Bildauflösung/LOD und
  Speicherschutz ermitteln; nicht einfach den Pool größer machen oder `prune` aggressiv erhöhen.
- Bei Revisionsstürmen: Content-Revisions-Keys von Kamerapose und unbeteiligter Scenery trennen;
  explizite Scene-/DPR-Änderungen weiterhin vollständig invalidieren.
- Bei reiner Komposition: Render-Call-Zählung, übertragene RGBA-Pixel, Tile-Anzahl, GPU-/Canvas-Pfad
  auf identischen, vorgerenderten Tile-Daten messen.

Jeder 16B-Patch braucht Vorher/Nachher auf derselben Szene, keine Bake-Fehler, vollständige
Readiness und unveränderte Wasser-/Küsten-/Schatten-/Fog-Bilder.

## 16C – endgültige Abnahme

Nur nach bewiesener 16B-Wirkung: mindestens **drei** Windows-Benchmarkwiederholungen pro
vergleichbarem Qualitätsprofil, Cold und Warm separat, 8/8 Readiness-Gates,
p95 und Mainthreadzeit, Ground-Fallbacks, tatsächliche Cache-Hits, Bild-/GPU-Speicher
sowie Ocean-/Fog-/Küsten-Screenshots. Ohne diese Daten bleibt Schritt 16 offen.

## 30.10.2026 – Reparatur des realen 16A-Laufs

Der erste Windows-Lauf zeigte: native 16A-Tests 8/8 und Readiness-Tests 6/6,
aber ein alter Step16-Ground-Reuse-Regex-Test 13/14; vier reale Warm-Tests
wurden als SKIPPED protokolliert. Die synthetischen Kontrollläufe waren
gültig (Pan p95 0,86 ms; Zoom p95 0,66 ms).

**Nachgewiesener Testfehler:** WorldTiles liefert `progress.exact` als
Anzahl exakt dargestellter Kacheln, nicht als Bruchteil. Das 16A-Gate
verlangte fälschlich `exact===1` und lehnte dadurch eine vollständig
bereite Ansicht mit beispielsweise 16 exakten Tiles ab. Korrigiert auf
`exact>=1`, ergänzt um `fallback===0`, keine fehlenden/vorläufigen
Tiles, keine Retry-Endzustände und volle Coverage.

**Weiterer reiner Testfehler:** Der Ground-Reuse-Test suchte nach
`const semanticKey=JSON.stringify`, obwohl die zuvor korrekt extrahierte
Hilfsfunktion `tileSemanticSignature()` verwendet wird. Die Regression
prüft nun Funktion, Aufruf und vorbereiteten Revisionszustand.

**Fehlermodus verbessert:** Kann der echte Renderer tatsächlich nicht
stabil READY werden, zeichnet 16A jetzt trotzdem einen als
`cold-diagnostic` gekennzeichneten Pan-/Zoom-Probelauf mit rAF- und
CPU-Messwerten, Tile-/Asset-Ereignissen, konkreten Source-Reasons,
ausstehenden Assets und den ersten betroffenen Tile-IDs auf.
Diese Diagnose ist explizit KEIN gültiger Warm-Performancebeleg.
Ergebnis-JSON und README benennen die Blockierungsgründe.

Die neuen/revidierten neun Audit-Tests bestanden im isolierten V8-Lauf.
Die Windows-Native-Node-Suite und Chromium-Neumessung stehen nach diesem
Commit erneut aus. Im lokalen bereits ausgecheckten Branch nach `git fetch`
unbedingt `git pull --ff-only origin audit/step16a-render-pipeline-20261029`
ausführen; `git switch` allein aktualisiert eine bestehende Branch-Kopie nicht.

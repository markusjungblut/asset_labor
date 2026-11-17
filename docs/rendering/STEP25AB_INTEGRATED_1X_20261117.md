# Schritt 25AB – isolierter Integrationsport des 1×-Sicherheitscaches

**Stand: 17.11.2026; Draft, kein Produktiv-GO.** Unabhängiger Branch auf aktuellem `main`, abgeleitet aus dem auf Windows getesteten [Experiment #140](https://github.com/markusjungblut/asset_labor/pull/140) und dessen 25R–25Z-Runtime. Die vorhandenen optionalen Mechanismen bleiben im Quelltext, sind aber **standardmäßig AUS**; dies ist ein bewusst integrierter Runtime-Port, kein Merge des alten PR-Stapels.

**Schalter:** `?fallbackAtlas=1` oder die neue Checkbox unter „Optimierungen“ aktiviert die Hintergrund-1×-Abdeckung; im Normalmodus bleibt sie AUS. `leadPrefetch`, `lodRecency`, `visibleBorrow` und `parallelDecode` sind ebenfalls AUS und benötigen jeweils `=1` zur experimentellen Aktivierung. Die gemeinsamen **95 Millionen dekodierten Pixel** werden nicht erhöht. 1× belegt unter Leerlaufbedingungen höchstens ca. 65% des Zielbudgets, ohne aktuell sichtbare Bilder zu verdrängen. Original-4×-Atlas und gespeicherte Fog-Rechte werden nicht überschrieben; fehlende *Derived-1×*-PNG-Datensätze können durch den vorhandenen Cache erzeugt werden.

**Grund für Port:** Zwei 13er-Originalkarten-A/B-Serien mit 120/120 vorgewärmten Fallbacks zeigten **0 sichtbare Missing-Drawframes** (ohne Fallback 551/656), Evictions 710→96 und Re-Decodes 295→14. Die späteren zwei 9er-Vergleiche bestätigten **keine stabile** zusätzliche Beschleunigung durch `parallelDecode`.

**Tests im Port:** 25R, 25S, 25T, 25U, 25X, 25AA und neuer 25AB-Sicherheitstest. Die 25T/25U-Quellprüfungen berücksichtigen neue OFF-Defaults, ihre funktionalen A/B-Fixtures bleiben intakt. Der reguläre synthetische Frozen-Map-Browsertest muss ebenfalls bestehen.

**Offene harte Gates vor Aktivierung oder Merge:** Originalkarte auf Windows/Firefox bei Kalt-RAM und warmen/teilweisen Derived-1×-Caches prüfen; 2×-Nachschärfen, Fog-/Küsten-/Waldränder, Tile-Naht und fünfminütige Schwenk-/Zoomstabilität prüfen; große Karten und beschränkten Teilcache separat testen. Eine synthetische grüne CI reicht allein nicht. Lokaler Windows-Arbeitsbaum, Browser-Origin und Originalatlas bleiben unverändert. Die Editor-UI liegt separat in [Draft #141](https://github.com/markusjungblut/asset_labor/pull/141); gemeinsamer Release erst nach getrennten Freigaben.

## Isolierter Windows-Sichttest ohne Eingriff in den Hauptarbeitsbaum

Den bisherigen Server auf Port 8780 zunächst mit `Strg+C` beenden. **Gleiches Firefox-Profil und exakt die Origin `http://127.0.0.1:8780` beibehalten**; dort ist die private fertige Karte gespeichert. Im bereits vorhandenen sauberen Werkzeug-Worktree, **nicht** im uncommitteten Originalordner:

```powershell
cd "C:\Users\marku\Desktop\asset_labor_renderer_tools"
git status --short
git fetch --no-tags origin
git worktree add --detach "C:\Users\marku\Desktop\asset_labor_1x_integration" origin/integration/step25aa-safe-fallback-port-20261117
cd "C:\Users\marku\Desktop\asset_labor_1x_integration"
python -m http.server 8780 --bind 127.0.0.1
```

Wenn der neue Worktree-Pfad bereits existiert, **kein** `git clean/reset` ausführen; zuerst den Zustand untersuchen. Der Server ist rein statisch; die Viewer-Derived-Stores können weiterhin neue **abgeleitete** Varianten unter derselben Browser-Origin erzeugen. Das ursprüngliche Frozen-Atlas-Archiv wird nicht neu gebacken.

Viewer für die autorisierte, vorhandene Testkarte: `http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near&perf=1`. Zuerst ohne 1×-Fallback die vorhandene Welt und Rechtegrenzen prüfen, dann unter **Optimierungen** die Checkbox **Experimenteller 1×-Sicherheitscache** setzen. Nach dem Reload muss nur `fallbackAtlas=1` hinzukommen. Die anderen vier Flags bleiben unverändert AUS. Prüfen: erste sichtbare Karte, späterer vollständiger 1×-Warmzustand, Übergänge von 1× zu 2×, Küsten-/Wald-/Fog-Nähte, ruckelfreies Zoomen, 5-Minuten-Pan und anschließende Ruhestandssituation. Die optionalen Diagnoseaufrufe `window.__vedrasFrozenGameTest.stats()` und `profileReport()` sind read-only; **keine** privaten ZIPs oder Screenshots auf öffentliche PRs hochladen.

Der Editor-UI-Abgleich aus PR #141 bleibt ein **separater** Teststand. Der gemeinsam zusammengesetzte End-to-End-Release-Kandidat entsteht erst nach Abnahme beider Teile.

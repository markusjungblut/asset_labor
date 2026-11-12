# Frozen-Viewer – Konsolidierter Integrations- und Windows-Abnahmeplan

**Stand:** 12.11.2026 · **Status:** Plan erstellt, **Produktion/Originalkarte NICHT abgenommen**  
**Repository:** `markusjungblut/asset_labor` · **Basiskommit `main` (bei Erstellung):** `806ea473822a2bf4c9b3be45f13eebbc0b939c4b`  
**Kandidaten-Branch:** `perf/step25z-real-ram-eviction-20261112` (Draft #136, auf #135 → #134 → #133 → #132 → #131 → #130 → #129 → #128)  
**Unabhängig, nicht Teil der Integration:** Draft #127 (Hex-/Band-Index).  
**Grundsätzliche Vorgabe:** Keine automatischen Merges, Rebase-Operationen, Force-Pushes, Änderungen an `main`, am privaten IndexedDB-/ZIP-Atlas oder an uncommitteten lokalen Windows-Dateien.

## 1. Was wir tatsächlich wissen

Alle Kennzahlen in der Tabelle beziehen sich auf **fertig vorberechnete, synthetische Kacheln**, die im Headless Firefox aus echten PNG-Blobs und zum Teil aus echtem IndexedDB geladen wurden. Es sind **keine** Windows-GPU-/FPS-Messungen der Originalkarte `v1-0374527a`.

| PR / Schritt | Änderung / Evidenz | Vorläufiges Integrationsurteil |
|---|---|---|
| [#128 – 25R](https://github.com/markusjungblut/asset_labor/pull/128) | Immutable Tile-Metadaten und Hex-Trigonometrie einmalig vorberechnen; Node-/Firefox-Regressionsnachweis, kein Frame-p95-Beweis | **Kandidat A:** kleines risikoarmes CPU-Cleanup; visuelle Parität/Framezeit noch messen |
| [#129 – 25S](https://github.com/markusjungblut/asset_labor/pull/129) | Richtungsabhängiges Prefetch: in einem 55-Tile-Kontrollfall 1 sichtbarer Read und 1 Eviction weniger; vollständig warmer Fall ohne Vorteil | **Kandidat B, bedingt:** `leadPrefetch=1/0` auf Originalkarte vergleichen; bei Nachteilen abschalten |
| [#130 – 25T](https://github.com/markusjungblut/asset_labor/pull/130) | LOD-Rezency unter echtem Firefox-IDB-RAM-Druck (25Z): 94→83 Evictions, 42→32 Re-Decodes, 114→104 sichtbare Reads, 81,5→67 ms mittlere Laufmediane (2× je Variante) | **Stärkster Kandidat C:** `lodRecency=1/0` zuerst produktnah prüfen |
| [#131 – 25U](https://github.com/markusjungblut/asset_labor/pull/131) | Dringende sichtbare Reads können einen belegten Prefetch-Slot überholen. Mit **künstlichen 95 ms Storage** 209→106 ms bis zur dritten neuen Canvas-Bitmap; bei echter schneller IDB aus 25W **kein klarer End-to-End-Vorteil** | **Kandidat D, bedingt:** `visibleBorrow=1/0`; eventuell auf realem Gerät **aus** lassen |
| [#132 / #133](https://github.com/markusjungblut/asset_labor/pull/132) / [#133](https://github.com/markusjungblut/asset_labor/pull/133) | Firefox-First-Paint- und reale-IDB-Profiler; reine Mess-/CI-Ergänzungen | **Testinfrastruktur** erhalten; kein behaupteter Produktionsgewinn |
| [#134 – 25X](https://github.com/markusjungblut/asset_labor/pull/134) | Parallele Ground-/Scenery-Dekodierung samt `Promise.allSettled`-Fehlerfreigabe; unter RAM-Druck 66 ms sequentiell vs. 69 ms parallel (mittlere Laufmediane) | **Nicht aktivieren:** `parallelDecode=0` bleibt Standard, Opt-in nur für explizite A/B |
| [#135 / #136](https://github.com/markusjungblut/asset_labor/pull/135) / [#136](https://github.com/markusjungblut/asset_labor/pull/136) | 3 PNG-Lastklassen und echter 1×-/2×-RAM-/Eviction-Stresstest. [25Z-CI](https://github.com/markusjungblut/asset_labor/actions/runs/43215677362): **95/95 Node** und sämtliche Firefox-Stufen grün | **Testinfrastruktur**, keine Änderung der Produktions-FPS |

**Wichtige Trennung:** #127 bleibt draußen; es gibt keine belegte Originalkarten-Beschleunigung durch den experimentellen Hex-Band-Index. Der teilweise offene Originalatlas-/ZIP-Reimport bleibt in [Roadmap-Issue #103](https://github.com/markusjungblut/asset_labor/issues/103) und ist **nicht durch diese Cache-Abnahme erledigt**. Vorhandene Bildnaht-Probleme, falls noch reproduzierbar, gehören gesondert zu [Issue #90](https://github.com/markusjungblut/asset_labor/issues/90).

## 2. Bis zur Verfügbarkeit des Windows-PCs: bewusst keine neue Performance-Mechanik

- **Freeze:** Keine neuen Cache-/Prefetch-/Decoder-Flags und keine weitere CI-Benchmark-Serie ohne eine konkrete, neue Hypothese.
- Bestehende Draft-Branches, PR-Diffs, Tests und JSON-Messungen unverändert erhalten. Das aktuelle synthetische Green-Gate ist **CI #43215677362**, Commit `793a8e558a95de8896f3f2156e52650aa12f7292`; die spätere Dokumentation ist `[skip ci]`.
- Tests/Renderer und Kartenquelle weiterhin getrennt halten: Original 4×-PNG-/ZIP-/Manifestpakete sind Autorendaten; die **abgeleiteten** 1×-/2×-IndexedDB-Caches können beim ersten Bedarf **lazy** erstellt und geschrieben werden. Ein kalter Derived-Cache ist deshalb **kein** neutraler Warm-Pan-Benchmark.
- GitHub Actions nur bei neuer wirksamer Codeänderung oder nach finaler Integrationsvorbereitung ausführen; **Dokumentations-PR-Updates ohne CI**, kein manuelles Re-Run einer grünen Suite. Bestehender Workflow: Sparse Checkout, Ubuntu 24.04, Playwright Firefox 1.57.0, 12-Minuten-Joblimit und 5-Tage-Artefakte.

## 3. Windows-PC zuerst sichern, nicht synchronisieren/mergen

1. Im **bestehenden** lokalen Arbeitsverzeichnis nur **lesen**: `git status --short`, `git branch --show-current`, `git log -1 --oneline`. Ergebnisse notieren. **Nicht** `git reset --hard`, `git clean -fd`, `git pull --rebase`, `git stash` oder automatisch committen.
2. Falls uncommittete Arbeit vorhanden ist, zuerst separat sichern und den tatsächlichen Inhalt kurz mit dem Remote vergleichen. Ein `git diff`-Patch erfasst **keine untracked Dateien**; solche Dateien gesondert kopieren. Kein Commit-/Merge-Versuch, bevor der Nutzer diesen Abgleich freigibt.
3. Im lokalen Repo ist **`git fetch --no-tags origin`** zulässig, weil es den Arbeitsbaum nicht ändert. Für Originalkarten-Tests einen *separaten Worktree* statt lokaler Branchumschaltung verwenden:

   ```powershell
   # Im vorhandenen Repository, nachdem der Arbeitsstand dokumentiert wurde:
   git fetch --no-tags origin
   git worktree add --detach ..\asset_labor_perf_review origin/perf/step25z-real-ram-eviction-20261112
   ```

   Dabei wird **nicht** der bestehende lokale Branch gewechselt, der vorhandene Arbeitsbaum überschrieben oder `main` verändert. Der neue Worktree ist lediglich eine isolierte Codekopie.
4. **Browserdaten schützen:** ZIP/Manifest und den vorhandenen Firefox-Browser-IndexedDB-Origin **nicht** löschen, zurücksetzen, exportieren/überschreiben oder neu baken. Vorher ein separates, unverändertes ZIP-Backup und dessen `Get-FileHash -Algorithm SHA256` aufzeichnen. Der Viewer erwartet für den bisherigen Atlas die **exakt gleiche Origin** `http://127.0.0.1:8780` und das **gleiche Firefox-Profil**. Bei Worktreewechsel den bisherigen lokalen Server sauber beenden und **nur einen** Testserver auf demselben Origin/Port starten; niemals zwei Server parallel über Port 8780. Keine Profilbereinigung oder Private-Browsing-Session.
5. Vor jedem Performancevergleich verifizieren, dass `manifest.scene`/Karten-ID und `level=near` die **tatsächlich vorhandene** Originalkarte betreffen. Die bekannte Kennung `v1-0374527a` ist eine **Referenz aus Issue #103**, keine Annahme, dass Daten auf einem neuen Browserprofil automatisch verfügbar wären.

## 4. Originalkarten-Testmatrix (ohne Bake)

**Basis-URL**, exakt mit dem lokal gespeicherten Atlas und gleicher Origin:

```text
http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near&perf=1
```

**A/B-URLs** werden *nur* um jeweils **einen** Parameter geändert; keine gleichzeitige Mehrfachumschaltung:

| Hypothese | Kontrollmodus | Kandidat | Primärmetrik |
|---|---|---|---|
| LOD-Cache nach Sichtbarkeit | `&lodRecency=0` | `&lodRecency=1` | Re-Decodes, Evictions, p95 aktive Kamera-Frame-Gaps, Zoom-Ready-Zeit |
| Richtungs-Prefetch | `&leadPrefetch=0` | `&leadPrefetch=1` | Sichtbare Read-Starts, fehlende Tiles, Prefetch-Last, p95 beim Pan |
| Sichtbare Reads vor blockiertem Prefetch | `&visibleBorrow=0` | `&visibleBorrow=1` | Vollständige sichtbare Bereitschaft, Read-/Decode-Timing, p95; Peak `pending` |
| Ground/Scenery parallel | `&parallelDecode=0` | `&parallelDecode=1` | End-to-End-Bereitschaft, Decode-Konkurrenz, p95; nur explorativ |
| Basis des Release-Kandidaten | `main` / bisheriger lokaler geprüfter Stand | isolierter Kandidaten-Worktree | gesamte Testmatrix, *gleiche* Szene und Browsereinstellungen |

**Feste Fahrten je Konfiguration**, bei gleichem Firefox-Profil, Browserfenster, OS-Skalierung, Zoom, DPR, Sichtzustand und ohne andere GPU-/CPU-intensive Anwendungen:

1. **Kalt im RAM, persistent in IDB:** Viewer frisch öffnen, Aussehen/Manifest/Layerqualität prüfen, die Zeit bis die **sichtbaren** Tiles fertig sind erfassen. **Nicht** das Browser-Storage löschen. Getrennt notieren, ob bei diesem ersten Aufruf Derived-1×-/2×-Varianten neu erzeugt wurden.
2. **Warm Pan:** alle für die Route nötigen Kacheln einmal laden; Profilzähler via `window.__vedrasFrozenGameTest.profileReset()` zurücksetzen. Dieselben bereits besuchten horizontalen, diagonalen und rückwärtigen Kamerafahrten 15–20 Sekunden lang wiederholen.
3. **Kaltregion und Rückfahrt:** in noch nicht RAM-dekodierte, aber bereits vorberechnete Kartengebiete schwenken, anschließend identisch zurück; auf sichtbare Fehlstellen und erneute Dekodierungen achten.
4. **LOD-Wechsel:** sechsmal nahe an `zoom=.50` und `.85` wechseln, jeweils bis zum vollständig gerenderten Ground+Scenery warten; Fog, Alpha-Überhänge, Schatten und Texturqualität an den gleichen Kontrollpunkten prüfen.
5. **Fog-/Nahtkontrolle:** identische Screenshots an vier definierten Kontrollstellen (Wald-Schatten, Küste/Wassernaht, Kachelgrenze/Scenery-Überhang, sichtbarer/unbekannter Fog-Rand), vor/während/nach Pan und Zoom. Keine unautorisierten Hex-Kerne, keine schwarzen/weißen Löcher, Cloud-Pulsieren, Layer-Swaps oder neue Subpixel-Nähte.
6. **Stabilität:** mindestens fünf Minuten Kamera-/Zoom-Fahrt und anschließend Ruhephase, danach prüfen: keine dauerhaft unerledigten **sichtbaren** Tile-Reads, keine wachsenden Fehlerzähler, keine unbegrenzte Decoder-RAM-Zunahme. Hintergrund-Prefetch darf auch nach sichtbarer Vollbereitschaft weiterlaufen und ist **nicht** automatisch ein Fehler.

**Durchführung:** Für die einzelnen Feature-A/B-Vergleiche jeweils mindestens **drei ABBA-Paare/Blöcke bei identischem Ablauf** protokollieren oder bei wenig Zeit zunächst zwei ABBA-Blöcke als Vorabprüfung; keine aus Einzelwerten errechnete universelle Beschleunigung behaupten. Je Block zwischen Modus A/B nur den genannten Schalter wechseln. Berichte direkt per Button **„Performance-JSON“** exportieren; der Default-Dateiname wird wiederverwendet, daher sofort eindeutig umbenennen (siehe [Messvorlage](FROZEN_VIEWER_WINDOWS_RESULTS_TEMPLATE_20261112.md)).

Diagnose-API (mit `&perf=1`):

```javascript
window.__vedrasFrozenGameTest.profileStatus()
window.__vedrasFrozenGameTest.profileReset()
window.__vedrasFrozenGameTest.profileReport()
window.__vedrasFrozenGameTest.stats()
```

Das Profil enthält `frameGapMs`, `inputToDrawEndMs`, `drawMs`, `storageMs`, `decodeMs`, `visibleReadStarts`, `prefetchReadStarts`, `decodeRepeats`, `evictions`, `decodedPixels`, `pending` und abgeleitete Cache-Statistiken. Änderungen **als Zählerdifferenzen** zwischen vor/nach Kameraaktion erfassen. `sampleLimit.droppedFrames`/`droppedTiles` prüfen: Bei Pufferüberlauf längere Fahrten in getrennte Messintervalle aufteilen.

**Wichtig zur Interpretation:** `frameGapMs` ist der Abstand gezeichneter **aktiver** Frames, **nicht** Display-/GPU-present-FPS; `drawMs` misst synchrones JS-/Canvas-Verhalten, **nicht** garantiert die Grafikpräsentation; `inputToDrawEndMs` endet beim Canvas-Aufruf, nicht beim sichtbaren Monitor-Pixel. Für eine echte GPU-/Framep95-Bewertung zusätzlich einen Firefox-Performance-Trace auf dem **Windows-Gerät** aufzeichnen. `worldMs` enthält teils Unterphasen, daher keine Doppeladdition. Für Warm-Tests darf `derived1x/2x.converted` nicht durch laufende neue Ableitungen verfälscht werden.

## 5. Gates und Entscheidungen

**Gate 0 – Daten und lokale Arbeit:** Original-ZIP/Manifest identifizierbar, unverändert; gleicher Firefox-Origin vorhanden; lokaler Worktree/Untracked-Dateien dokumentiert und sicher; kein automatisches Stash/Reset/Bake.

**Gate 1 – Funktionale Parität (harte Blocker):** Keine JS-/PNG-/Storage-Fehler, keine Verletzung der Fog-Autorisierung, kein neues Cloud-Pulsieren, keine Land-/Wassernähte, keine Scenery-/Alpha-/Schattenfehler, keine unerklärten Tile-Löcher. 1×-/2×-Swap nur mit vollständig dekodierten Bildpaketen. Bei einem Blocker: **nicht mergen**, unabhängig von Performancezahlen.

**Gate 2 – Speicher / Liveness (harte Blocker):** Sichtbar benötigte Tiles müssen vollständig werden; keine permanent hängenden sichtbaren Reads, kein systematisch wachsender RAM/GC-Zyklus und keine fortwährenden Re-Decodes im vollständig warmen Stand. `maxDecodedPixels` ist ein Cache-Zielbudget; aktuell sichtbare geschützte Pakete können die Einhaltung im Extremfall verhindern. **Jede dauerhafte Überschreitung wird separat dokumentiert und vor Freigabe geklärt**, nicht durch eine unbemerkte Erhöhung kaschiert.

**Gate 3 – Performance (vorab festgelegte Entscheidungsregeln):**
- *Minimumziel aus Step25A:* warmer Pan `frameGapMs` p95 **≤ 33,3 ms** (Zielgröße für ca. 30 FPS, **kein** direkter FPS-Beweis); **16,7 ms** als längerfristiges 60-FPS-Ziel. GPU-Trace separat prüfen.
- Für jede Änderung: Differenz der **p50/p95 aktiven Frame-Gaps**, sichtbare Ladebereitschaft, `decodeRepeats`, `evictions`, Peaks sowie Bildqualität in denselben ABBA-Routen protokollieren. **Zwei konsistent negative ABBA-Blöcke** (oder reproduzierbarer >10-%-p95-Rückschritt in Warm-Pan) sind ein **Stop-/Rollback-Signal**, kein stiller Kompromiss zugunsten anderer Werte. Die 10 % sind ein **Abnahmerichtwert**, kein statistischer Signifikanznachweis.
- #130/`lodRecency` priorisieren. #129/`leadPrefetch` und #131/`visibleBorrow` nur behalten, wenn **Originalkartenwerte** ihren Nutzen ohne p95-/Fog-Rückschritt bestätigen. Bei unklaren Daten bleiben beide über URL-Flag rückstellbar. #134/`parallelDecode` **aus**, solange kein konsistenter End-to-End-Gewinn unter gleicher realer Karte bestätigt ist. #127 weiterhin **nicht integrieren**.

**Gate 4 – Integrationsfreigabe:** Zuerst muss die bestehende lokale/Remote-Abweichung geklärt sein, **dann** ein von `main` isolierter Kandidatenbranch auf dem vereinbarten Ziel-Commit geprüft werden. Erst mit ausdrücklicher Freigabe PRs in Abhängigkeitsreihenfolge reviewen: **#128 → #129 → #130 → #131**, während **#132/#133/#135/#136** Test-/Dokumentationsinfrastruktur bleiben. **#134** nur als optionaler, explizit deaktivierter Versuch oder nach positivem Windows-Nachweis. Wenn ein Vorläufer verworfen wird, nachfolgende Änderungen **gezielt portieren und erneut testen**; nicht blind den ganzen Draft-Stapel mergen. Tests der final zusammengesetzten Variante genau einmal vollständig laufen lassen, wenn reale Produktionsänderungen vorbereitet sind.

**Gate 5 – Produkt-Reife außerhalb dieses Plans:** Der ZIP-Reimport und das reproduzierbare Öffnen der Karte nach Browserneustart aus [#103](https://github.com/markusjungblut/asset_labor/issues/103), die Multiplayer-Fog-Berechtigungen und die spätere 15.000-Hex-Skalierung bleiben **separat offene Aufgaben**. Eine grüne Cache-Abnahme erledigt sie nicht.

## 6. Abschlussbericht

Ergebnis ausschließlich mit ausgefüllter [Windows-Messvorlage](FROZEN_VIEWER_WINDOWS_RESULTS_TEMPLATE_20261112.md), zugehörigen `vedras_profile_*.json`-Dateien, Browser-Traces, vier Pixel-/Fog-Vergleichspaaren und den Git-SHAs bewerten. **Privaten Atlas, ZIP oder Screenshots nicht ungefragt in öffentliche PRs oder CI-Artefakte hochladen.** Für öffentliche Statusmeldungen genügen anonymisierte Timing-/Zähleraggregate und ein klares **GO / CONDITIONAL / NO-GO** je Feature.

**Bis dahin:** Stand **synthetisch validiert, Windows-Originalkarte offen**, kein automatischer Merge und keine weiteren spekulativen Renderer-Änderungen.

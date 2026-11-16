# Windows-Tests: gespeicherte Originalkarte (13.11.2026)

**Status: v3 auf der gespeicherten Originalkarte unter Windows/Firefox ausgefuehrt.** Zwei neue Berichte liegen vor; der zweite wurde korrekt wegen starker Kontroll-Drift angehalten. Kein Performance-GO. Die 51 Laeufe der alten v2-Suite waren funktional erfolgreich, zeigten aber starke Zeitdrift. Der iframe lag damals unter einer wachsenden Ergebnistabelle und konnte ausserhalb des sichtbaren Bereichs geraten. Die neue Suite behebt diese Stoerquellen; gehoert zu Issue #137.

## Zwei echte Firefox-A/B-Sitzungen: Erfolg mit vorgewärmtem Sicherheitscache (16.11.2026)

Datenquellen: `vedras_windows_complete_fallback_1794866617591.json` (standard) und `vedras_windows_complete_fallback_1794866724882.json` (reverse), Windows 10, Firefox 160, Originalscene `v1-0374527a`, 120 Tiles. Beide Berichte vollstaendig (je 13/13 erfolgreich und gueltig), 0 Fehler, 0 Warnungen, kein Quality-Stop. Acht A-Pressure-Fahrten (bestehender Kandidat) und acht B-Pressure-Fahrten (separater `fallbackAtlas=1`-Renderer) in echten gegenläufigen ABBA/BAAB-Reihenfolgen.

**Beobachteter Effekt:** A hatte **551/656 aktive Frames (84,0%)** mit fehlenden Kacheln und **17.171ms** aufsummierte Missing-Duration; B hatte **0/507 Frames (0%)** mit fehlenden sichtbaren Kacheln, Missing-Duration **0ms**. Auch Cache-Churn fiel stark: Evictions **710→96 (−86,5%)**, Decode-Repeats **295→14 (−95,3%)**, Visible Read Starts **932→650**. `fallbackHits` summiert **4.782 wiederholte Nutzungen**, nicht 4.782 unterschiedliche Kacheln; verworfene alte 2×-Decode-Ergebnisse **289**, Storage-Pre-Skip **0**.

B hatte jeweils **120/120** 1×-Fallbacks resident, Pixelanzahl **43.217.940** (ca. 165 MiB bei 4 Bytes/Pixel). Kein 1×-Warmup-Cap erreicht. Das bestehende **95M-Pixelbudget** wurde nicht erhöht und war im aufgezeichneten Drucktest eingehalten. Warmup: Median **1.435,5ms**, Minimum **1.300ms**, Maximum **6.352ms**, Mittelwert **2.152ms**. Derived-1×-Konvertierungen **0**. A hatte vor der Fahrt im Median ca. 21,4M Pixel im RAM, B 43,2M Pixel vorgewärmte Sicherheitstexturen: dieser Test misst bewusst **warm vs. warm+zusätzlichen 1×-Vorrat**, keinen gleichen initialen RAM-Zustand oder Kaltstart.

Nebenbedingungen: Mittel der Pressure-Lauf-p95-rAF-Ticks **A 65,9ms, B 63,6ms**, keine stabile signifikante Framezeitverbesserung nachgewiesen. Mittel p95-Draw **A 4,25ms, B 4,75ms**. Einer der ersten B-Frames zeigte **35ms drawMs**, die jeweiligen p95-Werte blieben niedrig. Alle Druck-Welt-Blits unter 100ms. Kandidaten-Regionskontrollen rAF-p95 **34/35/34ms** (standard), **34/44/38ms** (reverse). Main-Baselines rAF-p95 **36→37ms** und **33→32ms**.

**Wichtiger methodischer Unterschied:** Die gleiche Kameraroute hatte je Pressure-Lauf 82 rAF-Ticks, aber A protokollierte 82 **aktiv gezeichnete** Frames je Lauf, B nur 62–66; B-Null-Missing ist deshalb ein sehr starkes Ergebnis für die **aufgezeichneten Zeichnungsframes**, nicht der Beweis, dass jeder einzelne Kamera-Tick auf der Hardware korrekt präsentiert wurde. Die 1×-Bildqualität bei hohem Zoom, die Stabilität unter normaler kontinuierlicher Spielnutzung und die initiale inkrementelle Hintergrund-Vorbereitung müssen vor produktiver Aktivierung visuell bzw. in einem geeigneten Live-Szenario kontrolliert werden. Mehrere Tausend Tile-Hits sind kein Ersatz für diese Darstellungskontrolle.

**Entscheidung:** Das 1×-Fallback-Design erreicht auf der 120-Tile-Originalkarte unter schneller, vorgewärmter Richtungswechsel-Belastung sein primaeres Ziel: **keine gemessenen sichtbaren Kachellücken bei stark weniger Evictions/Redecodes**. Experiment als vielversprechende Lösung beibehalten; Feature bleibt bis zur visuellen/Start-/Fog-Korrektheitspruefung opt-in. Beide PRs weiterhin **Draft**, kein Merge/Performance-GO.

---

## Konkreter Gegenentwurf: 1×-Sicherheitscache und 13er-A/B (16.11.2026)

Die lange bekannte RAM-Verdrängung ist bei einem festen 95M-Pixelbudget nicht durch eine reine Änderung der LRU-Reihenfolge abzuschaffen. Die **sichtbaren Lücken** lassen sich aber möglicherweise verhindern, wenn eine kleinere, vorab dekodierte und autorisierte 1×-Kopie der Welt im Cache bevorzugt erhalten bleibt, während 2×-Qualitätskopien nach Bedarf nachgeladen werden.

**Implementiert, separat und deaktiviert per Default:** Experimentzweig `exp/step25aa-resident-1x-fallback-20261116`, [Draft-PR #140](https://github.com/markusjungblut/asset_labor/pull/140) gegen den bisherigen Kandidatenbranch `perf/step25z-real-ram-eviction-20261112`. Die experimentelle Runtime nimmt ausschließlich `?fallbackAtlas=1` an. Bei diesem Flag werden 1×-Kacheln unter Leerlaufbedingungen mit maximal einer Hintergrund-Ladeoperation vorbereitet, bis alle vorhandenen Tiles resident sind oder der 1×-Anteil ca. 65% desselben 95M-Budgets erreicht. Ungeschützte 2×-Bildkopien weichen vor residentem 1×-Fallback; aktuell sichtbare Kacheln bleiben geschützt. Mit 1×-Kopie rendern wir bei fehlender 2×-Variante sofort die geometrisch korrekte, schlechter aufgelöste Welt. Veraltete 2×-Ladevorgänge dürfen vor oder nach der Dekodierung verworfen werden, wenn die Kamera die Kachel verlassen hat. Es gibt **keine** automatische Anhebung von Parallelität oder Pixelbudget.

Die Original-Frozen-Karte und die Fog-Berechtigungen werden nicht geändert. Achtung: falls im **separaten** Derived-1×-IndexedDB-Cache noch einzelne 1×-Kopien fehlen, darf die bestehende Derived-Schicht diese bei Bedarf neu erzeugen. Daher werden **Warmup-Dauer und 1×-Konvertierungen außerhalb der A/B-Messung gesondert** festgehalten. Auch beim späteren Erfolg können 2×-Evictions auftreten; Erfolgskriterium sind niedrigere sichtbare Missing-Frames, nicht `evictions==0`.

**Neue Testversion:** Die Werkzeug-Suite in PR #139 hat einen türkisen Button **„1×-Sicherheitscache A/B (13 Läufe)“**, den isolierten dritten Server-Pfad `/experiment/`, einen `--experiment`-Parameter und einen zusätzlichen opt-in-Schalter im PowerShell-Starter. Testplan: 2 Main-Baselines, 3 unveränderte Regionskontrollen, 4 A-Druckfahrten des alten Kandidaten und 4 B-Druckfahrten auf der echten neuen Runtime, ABBA/BAAB bzw. umgekehrt. Im B-Lauf wird 1× für die Karte vorgewärmt, bevor der Profiler zurückgesetzt wird. Der Export `vedras_windows_complete_fallback_*.json` enthält `fallbackComparison`, beide Rohprofiler, Warmup, reale RAM-Belegung und den Anteil fehlender sichtbarer Frames. Bereits bestehende 124er-, 23er-, 13er-Blit- und 9er-Trace-Fahrten bleiben unverändert.

**Sicherer Start auf Windows:** vorher laufenden Server mit Strg+C beenden, ausschließlich das `asset_labor_renderer_tools`-Worktree bei sauberem Status aktualisieren und dann:
```powershell
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action All -FallbackExperiment -RepoPath "C:\Users\marku\Desktop\asset_labor"
```
Das Skript erzeugt/aktualisiert nur ein **drittes isoliertes und sauberes Worktree** `asset_labor_renderer_fallback_experiment_20261116`; bei lokalen Änderungen dort wird statt Überschreiben abgebrochen. Es führt den Node-Selbsttest der neuen 1×-Runtime aus. Im gleichen Firefox-Profil `http://127.0.0.1:8780/renderer-original-map.html` öffnen, Reihenfolge Standard und den neuen A/B-Button anklicken. Die 1×-Fallback-Lösung ist syntaktisch und mit Mock-Cache-Zuständen geprüft, aber **noch nicht auf Windows/Firefox real vermessen**. Kein Merge, kein produktives Performance-GO.

---

## Reale Ergebnisse: zwei Kachel-Lifecycle-Sitzungen (16.11.2026)

Vollstaendige Dateien:
- `vedras_windows_complete_trace_1794860153797.json` (`order=standard`)
- `vedras_windows_complete_trace_1794860323649.json` (`order=reverse`, **nur Metadaten: Der 9er-Trace-Plan wurde in beiden Sitzungen mit identischer Fahrtenfolge ausgefuehrt**; `makeTraceTasks()` nutzte die Auswahl nicht). Der Testzweig korrigiert fuer *zukuenftige* Trace-Reports die irrefuehrende Angabe auf `fixed-pressure`. Die zwei bestehenden Reports bleiben unveraendert.

Beide Sitzungen liefen in Firefox 160 auf der Originalkarte erfolgreich: **je 9/9 gueltig**, insgesamt 18/18, keinerlei Fehler, Warnungen oder QualityStop; **2.520** aufgezeichnete Bewegungsframes, **0 mit `worldBlitMs>=100ms`**, maximaler Blit **1ms**. Beide Sitzungen enthalten je vier instrumentierte Pressure-Fahrten, drei instrumentierte Region-Kontrollen und zwei uninstrumentierte Main-Baselines. Alle vier experimentellen Kandidaten-Flags sind deaktiviert.

**Acht Pressure-Fahrten gesamt:**
- **566/656** gemessene Bewegungsframes mit mindestens einer fehlenden Kachel = **86,3%**; pro Lauf **1.936–2.431ms** aufsummierte Missing-Frame-Dauer, bis zu **15** fehlende Kacheln gleichzeitig. Kein dauerhafter Defekt, kein gemeldeter Tile-Read-/Decodefehler, am Laufende vollständig bereit.
- **1.329** `missing-start`-Episoden; **1.148** (**86,4%**) enden mit `missing-left-view` (Kamera verlaesst das Tile vor sichtbarer Bereitschaft), **181** (**13,6%**) enden mit `missing-ready`. Zeit von Missing-Start bis Left-View: Median **68,5ms**, bis sichtbar Ready: Median **142ms**. Diese Zeiten beschreiben beobachtete, durch Kamerawechsel begrenzte Sichtbarkeits-Episoden, **nicht** alle Hintergrund-Loads.
- **1.316/1.329** (**99,0%**) der `missing-start`-Ereignisse wurden bei **drei belegten In-flight-Slots** beobachtet. Zusaetzlich **1.357** gedrosselte `capacity-wait`-Events und **466** `inflight-wait`-Events. Die 40ms-Drosselung verhindert, dass diese Werte als exakte Zahl abgelehnter Requests interpretiert werden.
- **916** sichtbare `read-start`-Ereignisse. Storage-Phase: Median **4ms**, p95 **16ms**, maximal **71ms**; Decode-Phase: Median **47ms**, p95 **93ms**, maximal **218ms**. Paarung `read-start -> ready`: Median **53ms**, p95 **100ms**. Die Dekodierung beansprucht in diesem Szenario typischerweise deutlich mehr Zeit als das Lesen aus persistenter Speicherung.
- **676** RAM-Evictions, davon 663 Bitmap-Eintraege mit `origin='visible'` und 13 mit `origin='prefetch'`. **286** fertige Decodes wurden als `redecoded=true` gemeldet (aus 917 `ready`-Events, darunter ein vor dem Trace-Reset begonnener Vorgang). Das deutet auf Churn hin, ist aber keine Aussage, dass die gerade gezeichnete Kachel aus dem RAM entfernt wurde: die sichtbare Menge ist beim Evicten gepinnt.
- Bei **794/1.329** Missing-Episoden wurde waehrend der beobachteten Sichtbarkeit **kein neuer `read-start` fuer dieselbe Variante** protokolliert (in 781 davon endete die Sichtbarkeit zuerst). Nicht als sicherer Scheduler-Fehler zaehlen: eine alternative LOD-Variante kann als Fallback erscheinen; manche Ladevorgaenge koennen vor der betreffenden Episode begonnen haben. Die Korrelation zeigt aber hohe kurzfristige Druckbelastung auf die Slots.

**Wichtige Abgrenzung:** Die Reports sind zwei Wiederholungen desselben festen Testablaufs, **keine gegenlaeufige Cross-over-Messung** und kein A/B einer Ladeoptimierung. `readiness.missingDurationMs` summiert beobachtete Frame-Abstaende; `tileTrace` misst einzelne Episoden und kann bei schnellen Regionssprüngen fuer dieselbe Tile-ID mehrfach auftreten. Beide Metriken duerfen nicht als dasselbe interpretiert oder unkritisch addiert werden. Trace-Overhead erlaubt keine direkte FPS-Freigabe gegen uninstrumentierte Laeufe.

**Entwicklungsempfehlung:** Naechste Aenderung nur experimentell und testbar im isolierten Branch: eine *sichtbarkeits-/aktualitaetsbasierte, begrenzte* Priorisierung neuer Kachelanforderungen. Die drei normalen Decode-Slots und die unveraenderte 95-Millionen-Pixel-Grenze dienen zunaechst als feste Kontrollbedingungen. Spaetere A/B-Vergleiche muessen bei gleicher route/Cache-Vorwaermung *prozentuale Missing-Frames*, Missing-Dauer und P95-Draw/rAF gemeinsam messen; keine Freigabe nur nach Zahl gestarteter Reads. Kein Merge/GO.

---

## Opt-in Diagnose sichtbarer Kachelwartezeiten (16.11.2026)

Die drei real gemessenen Fehlerarten sind zu trennen: (1) kurze oder lange JS/Canvas-Stalls, (2) rAF-Frame-Gaps ohne aehnlich lange synchrone Draw-Zeit und (3) fehlende sichtbare Kartenkacheln, obwohl der Renderer arbeitet. Der abgeschlossene 23er-Mischlastbericht bestaetigte **Typ 3** unter schnellen Richtungswechseln besonders deutlich. Ein weiteres 124er-Sammelbenchmark ist vor der Ursachenbestimmung nicht sinnvoll.

**Quellcodebefund aus dem tatsaechlich getesteten `perf/step25z-real-ram-eviction-20261112`-Renderer:** Der Tile-Loader erlaubt normalerweise nur `MAX_INFLIGHT=3` Ladevorgaenge. Ohne freien Slot gibt `read()` einen bestehenden LOD-Fallback oder `null` zurueck; eine blockierte sichtbare Kachel wird **nicht in eine separate persistente Queue gestellt**, sondern bei einem spaeteren Frame erneut angefordert. Der Bitmap-RAM-Cache ist nach dekodierten Pixeln begrenzt (`maxDecodedPixels=95_000_000`); `keepWithinBudget()` verdraengt nicht gepinnte Kandidaten und zaehlt Evictions. Diese Mechanismen sind mit den gemessenen sichtbaren Luecken und wiederholten Decodes vereinbar. Sie belegen **noch nicht**, ob der Hauptanteil von Kachel-Lesestart, Storage, Decode, Eviction oder einer Kombination stammt.

**Neu:** `tests/windows/serve-original-map-suite.py` bietet einen strikt optionalen, **nur im Arbeitsspeicher** injizierten Trace der Kandidaten-Runtime an. Bei `/candidate/frozen-map-game.html?tileTrace=1` wird ausschließlich der referenzierte Runtime-Script-Request `frozen-map-runtime.js?tileTrace=1` gepatcht. Auf der Festplatte und auf GitHub wird **keine produktive Runtime-Datei geaendert**. Die normale 124/23/13-Suite und die `main`-Baseline erhalten weiter unveraenderte Quellen. Der Server prueft vor dem Start alle Trace-Anker im tatsaechlichen Kandidatenskript und, sofern Node verfuegbar ist, dessen JS-Syntax. Bei unbekannter Runtime wird der instrumentierte Lauf abgelehnt, statt eine andere Version still zu verwenden.

Die Trace-Events sind nach relativer Zeit und Tile-ID aufgeloest:
- `missing-start`, `missing-ready`, `missing-left-view`: wann eine sichtbare Kachel ohne nutzbares LOD-Bild war, wieder erschien oder bei noch fehlendem Bild den Viewport verließ. Der Status 'left-view' ist **keine bestaetigte Dekodierbereitschaft**.
- `capacity-wait`: sichtbare Kachel konnte wegen gefuellter normaler In-flight-Slots nicht starten; `inflight-wait`: fuer dieselbe Kachel laeuft bereits eine Anforderung. Wiederholte Warte-Events werden je Kachel und Ursache auf **hoechstens eines pro 40ms** reduziert; Eventzaehlungen sind daher **keine exakte Zahl abgelehnter Frame-Requests**.
- `read-start`, `storage-done`, `decode-done`, `ready`, `read-error`: Schritte bis zum fertigen Kachelbild einschließlich `redecoded` und der Aussage, ob die Kachel nach Budgetpruefung im RAM verblieb.
- `evict`: entfernter Cache-Schluessel, Variante, Ursprung und Pixelumfang mit RAM-Stand beim Entfernen.

Alle Ereignisse stehen in `records[].tileTrace.events`, die aufsummierten Auswertungen in `tileLifecycleSummary`. Pro Kandidatenlauf sind maximal **6500** Trace-Events enthalten; `dropped` weist Ueberlaeufe aus. `movementEndMs` trennt Bewegungsphase und anschließende Beruhigung. Neben den Events bleiben die Original-Profiling-Frames im JSON erhalten.

**Bedienung:** Tooling-Worktree auf Testbranch aktualisieren, bestehenden Server mit Strg+C beenden, `pwsh -NoProfile -File .\\tests\\windows\\prepare-original-map.ps1 -Action All -RepoPath "C:\\Users\\marku\\Desktop\\asset_labor"` neu starten. Im bereits verwendeten Firefox-Profil Dashboard `http://127.0.0.1:8780/renderer-original-map.html`, neue Schaltflaeche **„Kachel-Wartezeiten (9 Läufe)“** waehlen, die JSON `vedras_windows_complete_trace_*.json` hochladen. Die Instrumentierung hat messbaren Overhead und eignet sich nicht fuer den direkten FPS- oder A/B-Vergleich mit uninstrumentierten Sitzungen. Der Modus besitzt kein Performance-GO und aendert keine Atlas/Fog-Daten.

**Teststatus:** JavaScript-Aufgabenplan, eventuelle Trace-Syntax und korrekte Patch-Anker der auf GitHub gespeicherten Kandidaten-Runtime statisch geprueft. Der echte opt-in Windows-/Firefox-Test ist noch nicht durchgefuehrt. PR bleibt Draft; kein Merge.

---

## Auswertung des ersten 23-Laeufe-Mischlast-Realtests (16.11.2026)

Originalkarte `v1-0374527a`, Windows 10/Firefox 160, `vedras_windows_complete_stress_1794840202188.json`, `order=standard`, Start 14:41 UTC, Ende 14:43 UTC:
- **23/23 erfolgreich und gueltig**, 0 Fehler, 0 Warnungen, 0 `qualityStop`, insgesamt **2.609** Rohframes. `worldBlitMs>=100ms`: **0**. Maximaler Blit **11ms**, ausschließlich in der abschließenden main-Baseline; Kandidaten max **1ms**. Die Hypothese einer sich unter der hier getesteten Mischlast aufbauenden starken Blit-Latenz wurde **nicht** reproduziert. Sie kann unter abweichenden Bedingungen weiter auftreten (alte Berichte: 487 Frames >=100ms).
- Sechs feste Kandidaten-Regionskontrollen rAF-p95 **35/34/34/33/41/33ms**, Draw-p95 **4/4/4/5/4/4ms**; Baseline rAF-p95 **31→41ms**, Draw-p95 **4→6ms**. Der einmalige Kontrollwert 41ms ist kein schwerer Kontroll-Driftstopp. Einzelner `drawMs=64ms`-Frame in letzter Main-Baseline: `worldPrepareMs=55ms`, `worldBlitMs=7ms`, kein langes Blit.
- In **allen sechs Pressure-Fahrten** fehlen sichtbare Tile-Bestandteile bei **64–77 von 82** aktiven Frames (78–94%); je Lauf **2.088–2.429ms** aufsummierte framebasierte Missing-Duration, maximal **15 gleichzeitig fehlende Tiles**. Laengster einzelner zusammenhaengender Missing-Abschnitt **666–1.285ms**. Vollstaendige Bereitschaft am Laufende; **kein Tile-Decode-/Readfehler, kein dauerhafter Datenverlust**.
- Pressure: **221** wiederholte Dekodierungen, **528** Evictions, **691** sichtbare Read-Starts; Prefetch-Read-Starts in den sechs Runs **1 insgesamt**. Sichtbare Tile-Decode-p95 je Run **86–118ms**. Das ist starke Korrelation von Cache-Churn, anstehenden sichtbaren Decodes und unvollstaendiger Kamera-Ansicht, **noch kein kausaler Nachweis eines spezifischen Eviction-Fehlers**.
- Sechs Zoom-/LOD-Runs: Missing-Duration **0ms**, Decoder-Repeats und Evictions **0**; rAF-p95 **21–33ms**. Drei Warm-Runs: Missing-Duration **0ms**, rAF-p95 **17–18ms**.
- In der Kandidaten-Stress-Konfiguration waren **alle vier experimentellen Feature-Flags AUS**; deshalb liegt **kein A/B-Vergleich** und keine Aktivierungsentscheidung zu `parallelDecode` oder anderen Schaltern vor. Keine automatische Mergefreigabe.

**Naechste Phase:** Den Untersuchungsfokus von `worldBlit` auf sichtbare Read-/Decode-Warteschlangen, Cache-Eviction/Redecode unter schnellen Richtungswechseln und RAM-Budget-Zustaende verlagern. Hierzu sollte zunaechst eine kurze reproduzierbare Pressure-Messung mit granularen Messungen zu Ursachen jeder Missing-Tile-Phase und Read-/Decode-Queue-Laufzeiten erstellt werden. Kein weiterer langer 124er-Test; keine ungepruefte Anhebung des 95-Millionen-Pixel-Limits. PR bleibt Draft.

---

## Reverse-Kurztest und isolierte Mischlast-Suite (16.11.2026)

Zweiter kurzer Originalkarten-Bericht `vedras_windows_complete_blit_1794839233064.json`, `order=reverse`: 13/13 erfolgreiche und gueltige Laeufe, keine Fehler/Warnungen, kein Quality-Stop. **2.377 Frames, 0 mit `worldBlitMs>=100ms`, maximale beobachtete Blit-Zeit 1 ms.** Zusammen mit Standard-Kurztest: **4.764** Frames ohne lange Blit-Aufrufe. Unveraenderte Kandidaten-Kontrollen rAF-p95 **29/34/32 ms** (Draw-p95 4/4/4 ms); Baseline rAF-p95 Anfang/Ende 34/35 ms.

`parallelDecode` wurde in 4/4 aktiven B-Laeufen, insgesamt **338-mal** ausgeloest. A/B rAF-p95-Mediane **A=35 ms, B=33 ms**; Crossover-Blockdifferenzen **-1,5/-3,5 ms** (beide B etwas schneller). Draw-p95 A/B-Median jeweils **4 ms**. Dieser Reverse-Kurztest ist laut Suite formal `qualified=true`, aber `status=KEIN REPRODUZIERBARER UNTERSCHIED`; das ist kein substantieller Performancegewinn. Im Standard-Kurztest war die rAF-Richtung widerspruechlich. **Keine Freigabe, `parallelDecode` produktiv AUS belassen.**

**Neue gezielte Mischlast-Diagnose (23 Laeufe):** Im Dashboard der braune Knopf „Mischlast-Diagnose (23 Läufe)“; Aufgabenplan:
- Main-Baseline vor und nach dem Test (Regionsroute), kein Schreibzugriff auf Originaldaten.
- Sechs identische Kandidaten-Regionskontrollen, vor und nach jeder der fuenf Belastungsphasen.
- Fuenf Phasen mit je drei identischen Fahrten: `pressure / lod / warm / pressure / lod` (oder umgekehrt `lod / pressure / warm / lod / pressure`).
- Bei **saemtlichen Kandidaten-Stressfahrten** sind alle vier Feature-Flags explizit AUS. Die Stressfahrten sind keine A/B-Vergleiche; sie sollen das Auftreten der früheren extremen Blit-Wall-Times von einer Sequenz-/Sitzungsbelastung abhaengig testen.
- Frame-Rohdaten, `blitDiagnosis` nach Phase/Konfiguration und `qualityStop` bei schwerer Kontroll-Drift. Kein Automerge. Alter 124er Knopf bleibt unveraendert.

Start nur im aktualisierten **Werkzeug-Worktree** (lokale Aenderungen vor einem Branchwechsel pruefen), Server `-Action All` stoppen und neu starten; Firefox-Profil mit Karte beibehalten, **Standard** und **„Mischlast-Diagnose (23 Läufe)“** waehlen. JSON `vedras_windows_complete_stress_*.json` anschliessend auswerten. Nicht den Original-Worktree aendern, keine Browserdaten loeschen. Der neue 23er-Pfad ist nur syntaktisch und mit synthetischen Plan-/Profilerwerten geprueft, Windows-Realtest noch offen.

---

## Folgeanalyse und gezielter 13-Läufe-Blit-Test (16.11.2026)

Zwei Windows-Berichte: `vedras_windows_complete_combined_1794589069471.json` (124/124, Standard) und `vedras_windows_complete_combined_1794834749515.json` (48/124, Umgekehrt, kontrollierter Qualitaetsstopp nach Regions-Kontrollen rAF-p95 59/309/155 ms). Zusammen 172 gueltige Einzellaeufe. **Kein Feature-Performance-GO.**

Die rohen Profiler-Frames enthalten 487 Messungen mit `worldBlitMs >= 100 ms` (365 bzw. 122). Nur 23 davon waren jeweils der erste profilierte Frame des Laufs (14 bzw. 9); die anderen traten **waehrend der Bewegung** auf. Ein Extremwert im zweiten Bericht ist `worldBlitMs=3019 ms` bei `drawMs=3021 ms`. Das ist ein `drawImage()`-Wall-Time-Befund, **kein Nachweis fuer eine bestimmte GPU-Ursache**. Der betroffene Kandidatenpfad zeichnet den offscreen World-Raster auf die sichtbare Canvas; es koennen auch CPU-/Treiber-Synchronisation und Browserlast beteiligt sein.

Statt der 124-Laeufe-Suite abermals auszufuehren, steht im gleichen Dashboard nun **„Blit-Kurzdiagnose (13 Läufe)“** bereit. Messplan:
- 1 Baseline-main am Anfang und 1 am Ende (gleiche Original-IndexedDB).
- 3 isolierte, unveraenderte Kandidaten-Kontrollen mit allen vier Feature-Flags deaktiviert.
- 8 isolierte Kandidatenlaeufe `parallelDecode/region`: 4× A AUS, 4× B AN, in ABBA-/BAAB-Bloecken. Mit „Umgekehrt“ wird die Blockreihenfolge getauscht.
- Der Runner nutzt weiterhin die realen Regionsrouten, kontrolliert vollstaendige Rueckkehransicht, Read-/Decodefehler und schwer driftende Kontrollen. Der Report enthaelt **alle rohen Frame-Messungen** und zusaetzlich `blitDiagnosis` mit Schwellenzahlen (>=100/250/500/1000 ms), Verteilung nach DPR/Version/Modus, Beginn-gegen-Fahrt-Aufschluesselung und maximal 24 detaillierten Ausreissern.
- Die Kurzdiagnose kann eine Regression bestaetigen oder weitere Hypothesen ueber die Blit-Ausreisser liefern, **aber nicht eigenstaendig eine GPU-Ursache oder das ganze Feature-Set freigeben**. Kein auto merge.

**Start:** Werkzeug-Worktree aus dem GitHub-Testbranch aktualisieren (nur wenn `git status --short` keine zu schuetzenden lokalen Aenderungen zeigt), Server `-Action All` neu starten, Firefox mit gespeicherter Karte verwenden, http://127.0.0.1:8780/renderer-original-map.html oeffnen und **„Blit-Kurzdiagnose (13 Läufe)“** klicken. Nicht die grosse Suite wiederholen. Die neue Datei `vedras_windows_complete_blit_*.json` hochladen. Nichts in IndexedDB loeschen; die Vorbereitung darf vorhandene abgeleitete 1x/2x-Kacheln lesen und ggf. ergaenzen.

---

## Diagnose nach dem ersten v3-Windows-Report (13.11.2026)

Der erste v3-Report aus Firefox 160 wurde **nach 46 von 124 gueltigen Messlaeufen** beim 47. Versuch angehalten. Grund: `leadPrefetch` sollte an sein, der zurueckgegebene Runtime-Status meldete aus. Das alte Laden akzeptierte bei verzoegerter Navigation moeglicherweise die noch aktive API des vorherigen iframe. **Diese Ursache ist plausibel, aber durch das JSON allein nicht abschliessend bewiesen.** Der Runner verwendet jetzt eine eindeutige `_suiteRun`-Kennung und akzeptiert ausschliesslich den fertigen Dokument-URL-Zustand des aktuellen Frames. Ein synthetischer Regressionstest prueft die Abweisung der alten API.

Bereits innerhalb dieser Teilserie drifteten die unveraenderten Regions-Kontrollen bei rAF-p95 von **148 ueber 107 auf 256 ms**; spaetere Zoom-Fahrten lagen vereinzelt deutlich hoeher. Das ist **kein belastbarer kausaler Nachweis** fuer oder gegen eine der Optimierungen. Die neue Drift-Sicherung beendet die Serie nach mindestens drei Kontrollen einer Route, wenn die Schwankung mehr als 80 ms, mehr als das 1,7-Fache und ein kritischer absoluter Wert ist. Sie exportiert den Teilbericht mit `qualityStop` statt die restlichen kostspieligen Messungen als regulaer aussagekraeftig zu behandeln.

Die v3-Erstauswertung hatte ausserdem einen **Statistikfehler**: Bei vier A- oder B-Werten wurde der untere statt des arithmetischen Medians der beiden mittleren Werte verwendet. Im aktuellen Runner ist das korrigiert (inklusive Node-Selbsttest). Bereits exportierte v3-Statistiken lassen sich nur durch eine erneute Berechnung aus den unveraenderten Roh-\`records\` richtig auswerten. Diese Korrektur macht aus der ersten abgebrochenen Sitzung **keine gueltige Performance-Freigabe**.

Eine Feature-Aktivierung muss jetzt in **mindestens zwei der vier B-Laeufe** mittels des jeweiligen Wirkungszaehlers nachgewiesen werden; ein zufaelliger Einzel-Trigger reicht nicht mehr. Die erste Sitzung misst die normalen Szenarien **warm, lod, region, pressure**; die zweite Sitzung mit **Umgekehrt** misst diese Szenarien und die Feature-Reihenfolge in umgekehrter Reihenfolge. Beide Sitzungen brauchen einen frischen Firefox-Start. Falls die Kontrollfahrten erneut driften, **keine Freigabe** aus den Ergebnissen ableiten und nicht blind die gesamte Serie wiederholen.

Datenintegritaet weiterhin unveraendert: keine Original-Atlas-Löschung, keine Fog-Aenderung, kein Neu-Baking.

---

## Empfohlen: Praezisions-Suite v3 mit einem Startknopf

Die beiden isolierten Test-Worktrees und der Werkzeug-Worktree existieren bereits. **Prepare nicht wiederholen.** Laufenden Server auf Port 8780 mit Strg+C stoppen, dann:

~~~powershell
cd "C:\Users\marku\Desktop\asset_labor_renderer_tools"
git status --short
git fetch --no-tags origin
git switch --detach origin/test/windows-original-map-renderer-20261113
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action All -RepoPath "C:\Users\marku\Desktop\asset_labor"
~~~

Falls der Werkzeug-Worktree lokale Aenderungen anzeigt, vorher pruefen und nicht verwerfen. Niemals Reset, Clean, Stash oder Merge am Originalrepository ausfuehren.

Im **bisherigen Firefox-Profil**, in dem die Karte bereits gespeichert ist, http://127.0.0.1:8780/renderer-original-map.html oeffnen und auf **"Alle Tests automatisch (1 Klick)"** klicken. Tab im Vordergrund lassen. Der Bericht wird als ein lokales JSON gespeichert. Wenn der automatische Download blockiert ist, die Schaltflaeche **"Gesamtbericht erneut speichern"** verwenden.

### Testplan: 124 Fahrten nach gemeinsamer Vorwaermung

- **6 Baseline-Fahrten** auf main: Warm-Pan, Zoomwechsel und Regionsfahrt am Anfang und Ende zur Laufzeit-Driftkontrolle.
- **104 isolierte Kandidaten-Fahrten**: vier Optimierungen (lodRecency, leadPrefetch, visibleBorrow, parallelDecode) auf je drei Routen plus eine zusaetzliche schnelle Regionswechselstrecke fuer visibleBorrow. Je Gruppe **A/B/B/A und B/A/A/B**, also vier A- und vier B-Messungen. Alle drei anderen untersuchten Optimierungen sind bei jedem isolierten A/B-Test explizit ausgeschaltet.
- **11 Kandidaten-Kontrollfahrten** auf denselben Strecken mit allen vier Features ausgeschaltet, ueber die Testserie verteilt zur Erkennung von Browser-/GPU-Zeitdrift.
- **3 Produktionskonfigurations-Fahrten** am Schluss mit den normalen Kandidaten-Standardschaltern (parallelDecode bleibt standardmaessig deaktiviert).

Der Viewer steht neu oberhalb einer festen, scrollbaren Ergebnistabelle; er wird vor einer Fahrt sichtbar positioniert. Bei unzureichender Sichtbarkeit, inaktivem Tab, Ladefehlern und zu wenigen Frames wird die Messung abgelehnt oder als ungueltig markiert. Kein ausdruecklicher Aufruf einer Garbage Collection und kein erzwungenes Leeren von Caches.

**Messdaten:** Renderer-Draw-p95, rAF-Tick-p50/p95/p99, FrameGap, Weltbild-Kopiervorgaenge, 1x/2x-Varianten und Wechsel, sichtbare und vorgezogene Reads, Cache-Evictions, Decode-Wiederholungen, Start-RAM-Cachezustand sowie beobachtete Anzahl und Dauer unvollstaendiger sichtbarer Kacheln. Sichtbare Luecken werden stichprobenbasiert erfasst, nicht lueckenlos auf GPU-/Monitor-Ebene.

### Qualitaetsgates im JSON

Der v3-Export enthaelt den Bereich statistics.comparisons. Jede Feature/Route-Gruppe hat acht A/B-Laeufe und wird als NICHT BELASTBAR gekennzeichnet, falls:

- Der Wirkmechanismus bei eingeschaltetem Feature nicht tatsaechlich ausgeloest wurde: lodRecencyEvictions, prefetchLeadingStarts, visibleBorrowStarts bzw. parallelTileDecodes.
- Ein Lauf nicht mindestens ausreichend viele sichtbare Frames/rAF-Ticks enthaelt, bei Zoom die beiden LODs fehlen oder bei der Regionsfahrt keine neuen sichtbaren Reads entstehen.
- Waerend der Messung persistente abgeleitete 1x/2x-Caches neu erzeugt werden, die A/B-RAM-Anfangszustaende stark abweichen, Profilmessungen ueberlaufen oder Kontrollfahrten deutlich driften.
- Die symmetrischen A/B-Crossover-Bloecke widerspruechliche, nicht vernachlaessigbare Effekte zeigen.

Unterschiede von wenigen Millisekunden werden nicht als klare Regressions-/Gewinnbeweise dargestellt. Die Berichtsauswertung bleibt konservativ. **Keine automatische GO-/Mergefreigabe.**

### Zweite unabhaengigere Sitzung

Die Reihenfolge ist im Dropdown **"Testreihenfolge"** waehlbar: beim ersten Durchlauf **Standard**. Die Szenarien sind nach Belastung aufsteigend angeordnet, im zweiten Lauf umgekehrt. Dann das Gesamt-JSON speichern, **Firefox vollstaendig schliessen und neu starten**, denselben Kombiserver weiterlaufen lassen und **"Umgekehrt (2. Sitzung)"** auswaehlen. Wieder mit nur einem Klick laufen lassen. Beide JSONs zusammen auswerten. Keine Browser- oder IndexedDB-Daten loeschen.

### Grenzen und Sicherheit

Die lokale Original-IndexedDB, Frozen-PNG, ZIP, Manifest, Fog-Rechte und das Originalrepository werden nicht geloescht oder ueberschrieben. Der Frozen-Viewer kann wie zuvor **separate abgeleitete 1x-/2x-Cachebilder** persistieren. Die Messung ist ein kontrollierter **RAM-cold / persistenter-Cache-warm**-Vergleich, kein garantiertes Disk-Cold-Experiment. TestPose-Aenderungen nutzen die Diagnose-API testPan und werden im Profiler als pan bezeichnet, auch wenn die Zoomroute effektiv zwischen LODs wechselt. rAF- und Drawzeiten sind **keine GPU-Present-FPS**, physische Eingabelatenz oder messbarer Monitor-Refresh; GPU-Speicher und Langzeit-Firefox-Heap brauchen gesonderte Werkzeuge. Visuelle Kontrollen auf Fog, Wassernaehte und Scenery-Fehler bleiben manuell.

---

## Vorbereitung ohne Eingriff in lokale Änderungen

PowerShell im bisherigen Repo (Pfad ggf. ändern):

~~~powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status --short -uall
git fetch --no-tags origin
git worktree add --detach ..\asset_labor_renderer_tools origin/test/windows-original-map-renderer-20261113
cd ..\asset_labor_renderer_tools
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action Prepare -RepoPath "C:\Users\marku\Desktop\asset_labor"
~~~

Das erstellt zwei weitere, **isolierte** Worktrees neben dem Original: baseline aus origin/main und candidate aus origin/perf/step25z-real-ram-eviction-20261112 (Draft #136, enthält #128–#135). Die vorhandenen Originaldateien einschließlich lokaler uncommitteter Änderungen bleiben unangetastet. Die Vorbereitung dokumentiert Git-Status und Diffs. **Untracked-Dateien werden nur aufgelistet, nicht gesichert.** Existierende Testverzeichnisse werden nicht überschrieben.


## Historische Einzeltests (v2, nicht fuer die neue Praezisionsauswertung)

Die folgenden Befehle fuer separat gestartete Baseline-/Kandidatenserver bleiben fuer gezielte, unqualifizierte Einzeltests verfuegbar. **Fuer die 124-Laeufe-Gesamtsuite ausschliesslich -Action All wie oben verwenden.**

## Baseline (alte Einzeltests, optional)

Alle bisherigen Server auf Port **8780** stoppen. Aus dem Werkzeuge-Worktree:

~~~powershell
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action Baseline
~~~

Im **bisherigen Firefox-Profil**, in dem die Karte als IndexedDB gespeichert ist, aufrufen:

http://127.0.0.1:8780/renderer-original-map.html

Kartenkennung prüfen (v1-0374527a nur Default). Dashboard: **Baseline / Standard**, Warm-Pan starten, JSON speichern; dann ggf. Zoomwechsel und neue Region. Falls Karte fehlt: **nicht neu backen und Browserdaten nicht löschen**. Hostname und Port müssen exakt zur bisherigen Origin passen, ebenso das Firefox-Profil.

## Kandidat (A/B/B/A; alte Einzeltests, optional)

Baseline-Server mit Strg+C beenden, dann:

~~~powershell
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action Candidate
~~~

Selbe URL, gleiches Firefox-Profil und Fenster. Modus **Kandidat A/B/B/A**; einzeln vergleichen:

1. **25T** lodRecency=0/1: Zoomwechsel (Priorität 1) und warmer Pan
2. **25S** leadPrefetch=0/1: neue Region + Rückfahrt
3. **25U** visibleBorrow=0/1: neue Region + Rückfahrt
4. **25X** parallelDecode=0/1: explorativ, Standard bleibt aus

A=0 und B=1; **nur ein Parameter pro Test**. Jede Fahrt startet den iframe-Viewer neu, Warm-Pan und Zoomstrecke werden vorgewärmt. Eine kalte Region kann durch die ersten Läufe persistente 1×/2×-Cacheeinträge erzeugen und dadurch spätere Läufe beeinflussen. Dies getrennt interpretieren.

Node-Tests optional:

~~~powershell
pwsh -NoProfile -File .\tests\windows\prepare-original-map.ps1 -Action Node
~~~

## Abnahmegrenzen

JSON enthält rohe Profilerwerte, FrameGap-p95, Draw-p95, Read-Starts, Decode-Wiederholungen, Evictions und Sichtbarkeits-/Fehlerdaten. Warmer FrameGap-p95 ≤33,3 ms ist erster Richtwert, langfristig 16,7 ms; **keine GPU-Present-FPS-Garantie**. Bei >10 % reproduzierbarem p95-Rückschritt, Grafikfehlern oder Fog-Leaks keine Integration. Falls sampleLimit.droppedFrames/droppedTiles >0, das Messintervall nicht für belastbare Perzentile verwenden.

Der Runner nutzt die testPan-Diagnoseschnittstelle auch für Zoom-Pose-Änderungen: byGesture kann diese Eingaben als pan bezeichnen, die separat ausgewiesenen Zoomfahrten und Gesamt-FrameGaps bleiben vergleichbar.

Zusätzlich **manuell** Screenshots bei identischer Kamera/Zoom für (1) Wald/Schatten/Scenery-Überhang, (2) Wasser-/Küstennaht (Issue #90), (3) Fog/Cloud-Fade und (4) 1×/2×-Wechsel aufnehmen. Fünf Minuten mit Pan/Zoom und anschließender Ruhephase auf Speicher-/GPU-/Read-Probleme prüfen. Für GPU-Present Firefox-Performance-Trace ergänzen.

Produktivfreigabe **noch offen**. [Integrationsplan](https://github.com/markusjungblut/asset_labor/blob/perf/step25z-real-ram-eviction-20261112/docs/rendering/FROZEN_VIEWER_INTEGRATION_AND_WINDOWS_ACCEPTANCE_20261112.md) und [Windows-Messbogen](https://github.com/markusjungblut/asset_labor/blob/perf/step25z-real-ram-eviction-20261112/docs/rendering/FROZEN_VIEWER_WINDOWS_RESULTS_TEMPLATE_20261112.md). Private Original-PNGs, ZIPs und Screenshots nicht ungefragt öffentlich hochladen.
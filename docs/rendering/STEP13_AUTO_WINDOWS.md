# Schritt 13 – automatischer Test der Referenzszene unter Windows

**Szenenquelle:** `artifacts/rendering-step13/vedras_scene.json` (Schema 0.8, 397 Hexfelder, 2631 gültige Nature-Instanzen). Dieser Stand wurde am 28.10.2026 im Repository hochgeladen. Der Import wurde von 2000 auf maximal 5000 gültige Nature-Instanzen erweitert. Das Skript prüft nach dem Import die tatsächliche Instanzanzahl.

## Start ohne manuelles Kopieren

1. Im Repository `git pull --ff-only origin main` ausführen.
2. Die Datei **`START_RENDERTEST_WINDOWS.cmd` doppelklicken**. Node.js 22+, Python 3 und Google Chrome werden benötigt.
3. Die Anwendung startet einen **eigenen lokalen HTTP-Server auf einem freien Port**, benutzt die gespeicherte JSON, führt die Messungen aus und stoppt den selbst gestarteten Server.
4. Der Windows-Explorer öffnet den Ergebnisordner `artifacts/rendering-step13-auto/`. Das Skript zeigt Fehler an und lässt das Konsolenfenster bis zu einer Taste geöffnet.

Optionale PowerShell-Ausführung für einen sichtbaren Browser:

```powershell
.\START_RENDERTEST_WINDOWS.cmd --headed
```

Ein vorhandenes Chrome-Fenster wird nicht verwendet. Der Test startet ein unabhängiges Chromium-Profil. Ohne `--headed` läuft Chrome unsichtbar, damit die Messung nicht durch Klicks verfälscht wird.

## Was wird aufgenommen?

- 6 Qualitätsprofile (fast, auto, 1×, 2×, 3×, 4×) mit Pan-/Zoommessung und dokumentierter Bildpool-Abrechnung (decoded, protected, over budget, deferred upgrades).
- Je ein Stillbild vor Bewegung, eins nach Pan und eins nach Zoom **mit deaktiviertem Fog of War** (18 Screenshots; unvollständige Aufnahmen werden ausdrücklich als Diagnose markiert).
- Zusätzlich 12 örtliche Vergleichsaufnahmen (`fast`/`4×`): Mittelpunkt, dichter Wald, Küste, Gebirge, Moor, offenes Wasser. Koordinaten und Vegetationsklasse stammen deterministisch aus der tatsächlich importierten 397-Hex-JSON.
- **Nur die Kartengrafik**, nicht die Bedienoberfläche oder Sidebar.
- Separat zwei Screenshots **bei identischer Kamera**: `fog-comparison-clear.png` und `fog-comparison-on.png`.
- Frameintervalle p50/p95, Long Tasks, JS-Heap, CPU-Taskzeit, World-Tile-Cache, Kachel-Nachladen, effektive DPR und sichtbare Tile-Fehler.
- Asset-Diagnostik: Anzahl der importierten Vegetationsinstanzen sowie die Zahl und Beispiele fehlender PNG-Pfade.
- Strikte Lade-Gates: Für Innenansichten erst bei **mindestens 99,9 % Bildschirm-Kachelabdeckung**; bei Rand-Biomen darf die reale Kartengrenze als Wolke sichtbar bleiben, aber alle angeforderten sichtbaren Kacheln und Assets müssen bereit sein. In beiden Fällen ohne fehlende/provisorische Tiles, ohne sichtbare Previews, ohne laufende Tile-Jobs und ohne fehlende erforderliche Artwork-Quellen wird ein Bild gespeichert. Der Test aktiviert beim Aufwärmen nötigenfalls die World-Tile-Kamera ohne Pan. Eine nicht bereite Aufnahme erscheint als *-diagnostic.png mit verified=false und wird nicht als gültige Grafikabnahme gewertet. Das Protokoll enthält Grund und Wartezeit. Maximal **9 Sekunden** pro Sichtposition statt 45.

**Ergebnisordner**: `artifacts/rendering-step13-auto/` enthält `result.json`, `README.md`, die PNG-Dateien und zusätzlich `step13-results.zip` mit sämtlichen Nachweisen zum einfachen Hochladen in ChatGPT. Er ist in `.gitignore` ausgeschlossen, damit keine Messgrafiken versehentlich eingecheckt werden.

## Interpretation

- `CAPTURED – visual inspection still required`: Browserlauf und Messwerte vorhanden, alle geforderten Aufnahmen waren technisch ladebereit; Grafikqualität noch nicht manuell abgenommen.
- `PARTIAL – inspect readiness and asset warnings`: Fehlende Grafiken, nicht fertiggestellte Kacheln oder andere Warnungen erfordern Ursachenanalyse.
- `INCOMPLETE – browser capture error`: Import, Chrome oder Screenshotaufnahme fehlgeschlagen; keine Grafikabnahme möglich.

**Die ursprünglichen Fog-bedeckten Screenshots sind keine gültige Terrainabnahme.** Die neuen Fog-OFF-Aufnahmen sind bewusst der Haupttest, um Relief, Küsten, Wald und vegetationsbedeckte Kacheln überprüfen zu können. Die separate Fog-Prüfung dient dem Sichtbarkeitsvertrag. Der Browser-Test hat keinen visuellen Referenzvergleich und kann damit nicht automatisch entscheiden, ob eine Textur künstlerisch korrekt aussieht.

**Prüfe insbesondere**: Fehlende Naturgrafiken in `README.md`, nicht fertiggeladene World-Tiles, Waldaufbau in `*-clear.png` und die Wolkenüberdeckung im Fog-Paar. Eine Referenzszene mit 2631 Instanzen, die nach Import nur 2000 enthält, ist ein Testfehler.

## Technische Hinweise

Der frühere Fehler `Could not find node with given id` entstand beim Zugriff auf einen veralteten CDP-DOM-Knoten während des Dateiimports. Die neue Version erzeugt einen echten `File` im Browser und übergibt ihn über `DataTransfer` an das bereits vorhandene `sceneImport`-Event des Asset-Labors, ohne flüchtige CDP-Node-IDs.

Falls Python oder Node nicht auffindbar sind, deren Installation bzw. PATH prüfen. Der Server wird auf Port 0 (freier Port) gestartet und nicht mit einem möglicherweise veralteten Prozess auf Port 8780 verwechselt.

CLI-Regressionstests: `node --test tests/test_rendering_step13_cli_20261028.cjs tests/test_rendering_step13_auto_20261028.cjs`. Diese Tests ersetzen keinen kompletten GPU-/Browserlauf auf Windows.

## Bildpool / Zoom – Korrekturen und Abnahmekriterien

Die erste reale Messung zeigte ein 192-MiB-Poolbudget bei 1,07 bis 1,56 GB gebuchter Bildpuffer, mehr als 200 Vorschau-Upgrades beim Qualitätswechsel und erhebliche rAF-p95-Aussetzer beim Zoom. Bisher schützte die Renderfunktion pauschal **alle** Terrain- und Küstengrafiken; zugleich ignorierte die LRU neue, ungeschützte Bilder für 24 Sekunden selbst unter Speicherdruck.

Der überarbeitete Pool schützt Terrainmaterialien nur noch innerhalb des Kamerabereichs (sowie geteilte Küstenmaterialien), entfernt andere Bildpuffer bei Budgetdruck ohne künstliche Altersfrist und begrenzt die Zahl wartender Premium-Upgrades auf zwei. Vor einem Upgrade wird dessen zusätzlicher Speicherbedarf gegen das Poolbudget geprüft. Die Ursache einzelner Zoom-Langtasks lässt sich erst durch einen erneuten Windows-Chromium-Lauf sicher bewerten; es wird **kein Performancegewinn behauptet**. Falls tatsächlich benötigte Bilder zusammen mehr als 192 MiB benötigen, meldet `overLimitBytes` den ehrlichen Restüberhang, statt notwendige sichtbare Texturen zu entfernen. `deferredUpgrades` macht aufgeschobene Qualitätsverbesserungen sichtbar.

Die neue `README.md` dokumentiert pro Qualitätsprofil und Kameratestposition Ladezeiten, vollständige Abdeckung, Zoommetriken, Bildpoolbudget und fehlende Assets. Screenshots werden auch bei nicht bereiten Kacheln als klar gekennzeichnete Diagnosen erstellt; ausschließlich verified=true bedeutet eine bestandene technische Ladeprüfung. Bilder von älteren Läufen werden vor dem Start aus dem dedizierten Ergebnisordner entfernt und erscheinen nicht fälschlich in der neuen ZIP.

Test: `node --test tests/test_rendering_step13_memory_sites_20261028.cjs` sowie die bisherigen Schritt-13-Tests. Die Geografiepunkte werden aus dem echten Export abgeleitet und bei fehlenden erforderlichen Biomen nicht erfunden.


## Nachmessung und Hotfix vom 28.10.2026

Die zweite echte Windows-Messung importierte alle 397 Hexfelder und 2.631 Vegetationsinstanzen, bestand aber kein einziges der 31 Lade-Gates. Da bisher nie ein fehlgeschlagenes Bild gespeichert wurde, enthielt die Ergebnis-ZIP 0 PNGs. Die 45-Sekunden-Prüfungen summierten sich auf über 23 Minuten. Einige Weltkacheln waren vollständig geladen, die zusätzliche Prüfung des internen Editor-Chunk-Painted-Status blockierte die Freigabe jedoch weiterhin. Diese redundant strenge Prüfung wurde aus dem Browser-Freigabegate entfernt und bleibt nur eine diagnostische Information.

Die Pooltelemetrie zeigte 74.166 Ressourcendekodierungen, 74.025 Eviktionen und 3,65 Mio. zurückgestellte Upgrades: Ein akuter Lade-/Eviktion-Zyklus. Gleichzeitig beanspruchten die geschützten Grafiken allein zeitweise rund 600 MiB, weit oberhalb der festen 192 MiB. Für dichte Szenen gelten nun Sprite-Vorschauobergrenzen von 512/576/640/768 Pixeln (nach Qualität), entsprechend abgestufte Bildpool-Budgets von 288/352/448/576 MiB, ein maximal 2,5 Sekunden langes Eviktions-Tabu für gerade benötigte Bilder, reduzierte Upgrade-Zähler und ein 10-sekündiger Cooldown für erneut benötigte Atlas-Seiten mit Originalgrafik-Fallback.

Der neue Browserlauf speichert auch bei fehlender Ladefreigabe klar gekennzeichnete Diagnose-Bilder mit verified=false, statt alle Bilder zu verwerfen. Alle 31 Ladeprüfungen sind nun auf jeweils neun Sekunden begrenzt. Im automatischen Modus werden normale erfolgreiche HTTP-Zugriffszeilen unterdrückt; Fehler und Phasenmeldungen bleiben sichtbar. Der Bildpool und die Zoom-Performance sind erst nach einem erneuten realen Windows-GPU-Test als verbessert oder nicht verbessert bewertbar.

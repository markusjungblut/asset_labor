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

- 6 Qualitätsprofile (fast, auto, 1×, 2×, 3×, 4×).
- Je ein Stillbild vor Bewegung, eins nach Pan und eins nach Zoom **mit deaktiviertem Fog of War** (18 Screenshots).
- **Nur die Kartengrafik**, nicht die Bedienoberfläche oder Sidebar.
- Separat zwei Screenshots **bei identischer Kamera**: `fog-comparison-clear.png` und `fog-comparison-on.png`.
- Frameintervalle p50/p95, Long Tasks, JS-Heap, CPU-Taskzeit, World-Tile-Cache, Kachel-Nachladen, effektive DPR und sichtbare Tile-Fehler.
- Asset-Diagnostik: Anzahl der importierten Vegetationsinstanzen sowie die Zahl und Beispiele fehlender PNG-Pfade.
- Nachlade-Gates: Der Test wartet auf fertige Kacheln und meldet im Bericht, falls sie bis zum Timeout nicht fertig werden.

**Ergebnisordner**: `artifacts/rendering-step13-auto/` enthält `result.json`, `README.md`, die PNG-Dateien und zusätzlich `step13-results.zip` mit sämtlichen Nachweisen zum einfachen Hochladen in ChatGPT. Er ist in `.gitignore` ausgeschlossen, damit keine Messgrafiken versehentlich eingecheckt werden.

## Interpretation

- `CAPTURED – visual inspection still required`: Browserlauf und Messwerte vorhanden, Grafikqualität noch nicht manuell abgenommen.
- `PARTIAL – inspect readiness and asset warnings`: Fehlende Grafiken, nicht fertiggestellte Kacheln oder andere Warnungen erfordern Ursachenanalyse.
- `INCOMPLETE – browser capture error`: Import, Chrome oder Screenshotaufnahme fehlgeschlagen; keine Grafikabnahme möglich.

**Die ursprünglichen Fog-bedeckten Screenshots sind keine gültige Terrainabnahme.** Die neuen Fog-OFF-Aufnahmen sind bewusst der Haupttest, um Relief, Küsten, Wald und vegetationsbedeckte Kacheln überprüfen zu können. Die separate Fog-Prüfung dient dem Sichtbarkeitsvertrag. Der Browser-Test hat keinen visuellen Referenzvergleich und kann damit nicht automatisch entscheiden, ob eine Textur künstlerisch korrekt aussieht.

**Prüfe insbesondere**: Fehlende Naturgrafiken in `README.md`, nicht fertiggeladene World-Tiles, Waldaufbau in `*-clear.png` und die Wolkenüberdeckung im Fog-Paar. Eine Referenzszene mit 2631 Instanzen, die nach Import nur 2000 enthält, ist ein Testfehler.

## Technische Hinweise

Der frühere Fehler `Could not find node with given id` entstand beim Zugriff auf einen veralteten CDP-DOM-Knoten während des Dateiimports. Die neue Version erzeugt einen echten `File` im Browser und übergibt ihn über `DataTransfer` an das bereits vorhandene `sceneImport`-Event des Asset-Labors, ohne flüchtige CDP-Node-IDs.

Falls Python oder Node nicht auffindbar sind, deren Installation bzw. PATH prüfen. Der Server wird auf Port 0 (freier Port) gestartet und nicht mit einem möglicherweise veralteten Prozess auf Port 8780 verwechselt.

CLI-Regressionstests: `node --test tests/test_rendering_step13_cli_20261028.cjs tests/test_rendering_step13_auto_20261028.cjs`. Diese Tests ersetzen keinen kompletten GPU-/Browserlauf auf Windows.

# Asset-Labor – Standardwerte und Oberfläche konsolidieren (12.11.2026)

**Status:** Draft [PR #138](https://github.com/markusjungblut/asset_labor/pull/138), basierend auf `main`-SHA `806ea473822a2bf4c9b3be45f13eebbc0b939c4b`; keine Änderung der gezeichneten Karte und **kein Merge**. Die Änderungen betreffen **`index.html`**, **`style.css`** und **`ui-organizer.js`**. **Nicht** den unabhängigen Standalone-Viewer oder die in Drafts #128–#136 entwickelten Performancefunktionen.

## 1. Tatsächliche Startwerte – sichtbar einheitlich

Die Original-State-Vorgaben stehen in `app.js`, die Oberfläche in `index.html`. Die Bereinigung verändert **weder `state` noch `restoreScene()` oder `savedFields`**. Bestehende benutzerspezifische Szeneneinstellungen aus `localStorage` bleiben daher maßgeblich und werden weiterhin bei der Initialisierung in die Bedienelemente synchronisiert.

| Einstellung | Tatsächlicher Startzustand | Sichtbarer Zustand / Aktion |
|---|---|---|
| Editor-Vorschauqualität | `quality:'2'` | **2×** ausgewählt, bestehende 1×/3×/Auto-/Fast-Optionen bleiben |
| Natur/Gebäude zeigen | `objects:true` | Checkbox **aktiv** (zuvor initial widersprüchlich nicht angehakt) |
| Flüsse / Geländeübergänge | `river:true`, `edgeBlend:true` | **aktiv** |
| Hex-Raster und Fog-Demo | `grid:false`; Fog-Demo nicht aktiv | **aus** |
| Chunk-Renderer, schnelle Kamera, Streaming, adaptives LOD, Worker | `chunkRendering:true`, `fastCamera:true`, `worldStreaming:true`, `adaptiveLod:true`, `workerTerrain:true` | **aktiv**, technische Änderung nur im Diagnosebereich |
| GPU-Terrain | `gpuTerrain:false` | **aus** (zuvor im HTML fälschlich zunächst angehakt); bei gespeicherten alten Szenen bleibt das bestehende `gpuTerrainUserEnabled`-Gate wirksam |
| GPU-Sprites | `gpuSprites:false` | **aus**, experimenteller Schalter nur unter WebGL2-Vergleiche |

**Keine erzwungene Normalisierung** von gespeicherten Szenen oder Individuallösungen. Absichtlich ausgeschaltete Funktionen werden nicht durch das UI beim Öffnen aktiviert. Die alte `4×`-Auswahl war bereits **disabled**; nur diese nicht nutzbare Dropdown-Option wurde entfernt. Der 4×-Quellatlas, Offline-Vorbereitungspfad und hochwertige PNG-Exporte bleiben unverändert.

## 2. Neue Arbeitsstruktur

Die rechtsseitige Arbeitsfläche ist nun in vier stabile, benannte Gruppen gegliedert. **Keiner** der produktiven DOM-Knoten wird kopiert oder neu mit IDs erzeugt; er wird lediglich verschoben, sodass bestehende Listener/Import- und Speicherroutinen erhalten bleiben.

| Gruppe | Inhalt |
|---|---|
| **01 Gelände & Wasser** | Gelände-Testkarte, Hügel/Relief, Ufer/Küsten, Flüsse, Straßen |
| **02 Natur, Berge & Schatten** | Nature-Katalog/Verteilung, Bergwerkzeuge, Sprite-Schatteneditor, Grafik-Finish |
| **03 Ansicht & Darstellung** | Normaler Karten-/Objekt-Anzeigebereich, Geländeübergänge; ältere Wasser-Wiederholung und technische Diagnose unter einem gesonderten `details` |
| **04 Testkarte & Ausgabe** | Kartengröße und Fog-Demo; Renderer-Standardprofil und WebGL2-Vergleiche aufklappbar; Terrain-Vorbereitung, gespeicherter Spielkartenatlas, Szenen- und PNG-Export |

**Navigation:** Sechs immer erreichbare Sprungmarken – Gelände, Natur, Berge, Schatten, Ansicht, Test & Export. Ein Klick auf **Natur** öffnet lediglich das Panel und verändert den Karteninhalt **nicht**; eine Verteilung wird weiterhin ausschließlich durch die ausdrücklich beschriftete Aktion **Natur verteilen** (`nPopulate`) ausgelöst.

**Top-Leiste:** Das Menü **Werkzeuge** enthält die bisherigen Geografie-/Import-/Natur-/Berg-Aktionen. Ansicht, Zoom und Strategieansicht bleiben unmittelbar zugänglich. Das redundante **37 Hexe**-Schnellkommando entfällt, weil der Testumfang bereits auf **37** voreingestellt und jederzeit im Bereich **Testkarte & Ausgabe** auswählbar ist.

**Alte Funktionen:** Die ältere Wassertextur-Wiederholung und die WebGL2-A/B-Modi wurden **nicht** aus JavaScript, Szenedateien oder Importvertrag gelöscht. Sie liegen nun in klar als Diagnose/experimentell bezeichneten Aufklappbereichen. Eine vollständige Entfernung dieser Pfade wäre eine **separate** Engine-/Kompatibilitätsänderung und ist ohne Windows-Originalkartenabnahme nicht gerechtfertigt.

## 3. Verifikation

[GitHub Actions UI-Lauf #43232272606](https://github.com/markusjungblut/asset_labor/actions/runs/43232272606) **erfolgreich** auf Code-Commit `f83d2fb11861b8f38b0126b392b65bfc27a8d94e`:

- **4/4 Node-Tests:** Keine duplizierten HTML-IDs, alle statisch vom `app.js` referenzierten IDs vorhanden, Standard-Anzeige konsistent, ausschließlich der redundante `quick37`-ID entfernt, UI-Organizer kompiliert.
- **Echter Firefox-DOM-Smoke:** Alle **420 alten verbleibenden IDs** erhalten; vier korrekt sortierte Inspector-Gruppen; sechs funktionierende Navigationslinks; exakt ein Drawer je Tool; technische GPU-/Legacy-Schalter in aufklappbaren Diagnosebereichen; Qualität `2×`, Testumfang `37`; keine implizite Naturverteilung durch eine Navigationsaktion; expliziter Verteil-Button weiterhin funktionsfähig.
- **Getrennte sparsame UI-CI** mit kleinem Sparse-Checkout, einem Headless-Firefox und UI-only-Screenshot; keine privaten Karten-Daten und **keine erneute Frozen-Map-/Sprite-Atlas-CI**.

**Grenze des Tests:** Für die UI-DOM-Prüfung wurden die großen Editor-/Server-/Bildmodule absichtlich **nicht** gestartet. Das belegt strukturierte Bedienbarkeit und unveränderte ID-Verbindungen, aber noch **keine** visuelle End-to-End-Abnahme des echten Editors mit Karten-/Sprite-Inhalten. Der fertige lokale Windows-Editor sollte vor dem Merge mit einer Karte geladen und die Buttons einmal durchgeklickt werden.

## 4. Abnahme und Integration

1. Am wieder verfügbaren PC vorhandene uncommittete Änderungen zuerst **sichern/prüfen**; kein `git reset --hard`, Force-Push oder automatisches Stash/Merge.
2. Die UI-Änderung aus [#138](https://github.com/markusjungblut/asset_labor/pull/138) **isoliert**, ohne die Freeze-Viewer-Performance-Drafts zu übernehmen, im Browser öffnen.
3. Testen: Topbar-Menü; Toolbar-Zoom/Strategieansicht; sechs Inspector-Sprünge; Terrain-/Nature-/Berg-/Schatten-Buttons; normale Darstellung; alter Wasser-Diagnosemodus; GPU-Opt-out; Szenenimport und -export; aufbewahrte lokale Presets; beliebige Karten-/Fog-Sichtkontrolle.
4. **Nur nach Freigabe** und ohne Konflikt mit lokalem Arbeitsstand mergen. Bis dahin Draft, `main` unverändert und alle vorhandenen Karten-/PNG-/JSON-Dateien unbeeinträchtigt.

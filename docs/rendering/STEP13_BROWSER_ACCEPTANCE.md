# Schritt 13 – echte Browser-/Performance-Abnahme

**Stand:** 28.10.2026. Grundlage: `main` nach `055f5c8` (Schritt 12).

## Ziel und Status

Die Render-Pipeline der Schritte 1–12 besitzt simulierte Regressionen, aber noch keinen nachgewiesenen Vergleich unter einer echten gespeicherten großen Editor-Szene. Das lokale, **opt-in** Messskript `scripts/rendering-step13-browser.mjs` führt echte Chrome-DevTools-Protokoll-Messungen und Screenshot-Captures aus. Es verändert weder Editorlogik noch Assets, Reliefparameter, Schattenwerte oder Fog-Berechtigungen. Es legt keine automatisch gestartete GitHub Action an und verbraucht keine CI-Minuten.

**Wichtig:** Das Vorhandensein eines Messskripts ist noch keine Abnahme. Ohne reale 397-Hex-Szene, vollständige PNG-Bibliothek und die visuelle Kontrolle bleibt Schritt 13 **teilweise / offen**. Headless-Browsermessungen sind nicht automatisch mit einer normalen GPU-Desktop-Sitzung gleichzusetzen.

## Vorbereitung und Ausführung

1. Das Asset-Labor aus `main` lokal starten: `python server.py`. Die angezeigte lokale Adresse notieren (Standard `http://127.0.0.1:8780/`; falls der Port belegt ist, wählt der Server einen anderen).
2. Die bisherige gespeicherte große Szene über **Szene als JSON exportieren** sichern. Es soll die **397-Hex-Szene mit dichtem Wald, Bergen, Relief, Küsten, Straßen und Naturbildern** sein. Die Skriptausführung importiert eine *Kopie* in ein frisches temporäres Browserprofil. Eine Testkarte ohne Originalgrafiken beweist die Zielperformance nicht.
3. Node.js **22 oder neuer** und Google Chrome oder Chromium installieren. Chrome muss im Zielbetrieb tatsächlich auf den lokalen Server zugreifen können. Keine npm-Pakete nötig.
4. Im Repository ausführen (beispielhaft, Pfade anpassen):

```bash
node --test tests/test_rendering_step13_cli_20261028.cjs
node --test tests/*.cjs
node scripts/rendering-step13-browser.mjs --url http://127.0.0.1:8780/ --scene "C:/Pfad/zu/397-hex-szene.json" --out artifacts/rendering-step13
```

Unter Windows ggf. `--chrome "C:/Program Files/Google/Chrome/Application/chrome.exe"` angeben. Für die sichtbare Browserprüfung `--headed` hinzufügen. `--qualities fast,auto,1,2,3,4`, `--duration 3600` und `--warmup 3000` steuern die Messung (Millisekunden).

Der Runner prüft nur localhost-URLs und startet einen eigenen kurzlebigen Chromium-Prozess mit separatem Profil. Der bestehende Browser-/Editorstatus bleibt dadurch erhalten. Die Ergebnisse werden nicht an einen Server übertragen.

## Automatische Aufzeichnung

Für jede Renderqualität werden Fog-Preview und der schnelle Tile-Modus eingeschaltet, anschließend Schwenken und Zoom über den aktuellen Bildausschnitt simuliert. Pro Kombination entstehen ein PNG und Messdaten. Das Skript speichert:

- `result.json`: Zustand der Szene (Hex-/Nature-Anzahl), Kameracounter, World-Tile- und LOD-Werte, effektive DPR, ausstehende und fehlgeschlagene Tiles, Preview-Zahl, Chrome-Heap und Main-Thread-Task-Zeit sowie JavaScript-Ausnahmen.
- `README.md`: Übersicht der rAF-Bildschirm-Frameintervalle (p50/p95), lange Main-Thread-Aufgaben, Tile-Bakes und noch offene visuelle Prüfpunkte.
- `fast-pan-fog.png`, `fast-zoom-fog.png` usw. bis `4-pan-fog.png` und `4-zoom-fog.png` als Screenshot-Beleg.

**Interpretation:** rAF-p50/p95 messen Bildschirm-Frameintervalle während eines Gestenlaufs, nicht direkt die Ausführungszeit von `draw()` oder `fastRender()`. Für belastbare Optimierungsvergleiche denselben Szenenstand, Zoom, Browser, Viewport, GPU, Build und möglichst denselben Cache-Wärmezustand verwenden. Vorherige Einzelmessungen (449,6 ms/Frame bzw. 2.163 ms/Frame aus anderen Ständen) sind kein direkt vergleichbarer Referenzwert.

## Verbindliche zusätzliche visuelle Abnahme

1. 397-Hex-Szene vollständig laden und die gleichen Hexübergänge in 1×, 2×, 3× und 4× unter Fog vergleichen. Baumkronen, Einheiten und Bergschatten dürfen nicht in unbekannte Wolken-Hexkerne durchscheinen.
2. Während Pan/Zoom darf die Wolkenbeleuchtung nicht rotieren. Die Wolken müssen in Weltkoordinaten bleiben, statt an der Anzeige zu kleben. Bei absichtlich verzögerter Cloud-Asset-Auslieferung weiterhin deckende Ersatzmaske prüfen.
3. Küsten prüfen: alle sechs Ufer-PNG-Varianten, schmale Land-/Wasserübergänge, Flussmündungen, sichtbare Tile-Grenzen. Keine prozeduralen Platzhalter oder scharfen Rechtecklöcher.
4. Dichten Wald und Berge prüfen: korrekte globale Sprite-Tiefenreihenfolge, zusammenhängende Schatten, keine schwarzen Sprite-Nähte. Die bekannte Relief-Zweiteilung ist **keine** neu zu reparierende Sprite-Naht; Relief unverändert lassen.
5. Innerhalb identischer Zoom-/LOD-Stufe mehrmals schwenken: bereits vorbereitete World-Tiles dürfen nicht fortlaufend neu gebacken werden. `pending`, `retryExhausted`, `visiblePreviews` und `tileDiagnostics()` auf feststeckende Nachlader kontrollieren.
6. 4×-Profil gegen `qualityStats()` prüfen: effektive DPR, 4096 physische Pixel je Achse, 14-MP-Viewportbudget bzw. 8 MP bei über 500 Nature-Instanzen. Eventuelle budgetbedingte DPR-Reduktion korrekt als solche dokumentieren. Canvas-Pixelzahl ist nicht mit Quelltexturauflösung gleichzusetzen.
7. Nach mehrfachen Wiederholungen auf nicht erklärtes Wachstum von JS-Heap, GPU-Ressourcen und Bildcache achten. Ein einmalig größerer Cache nach erstmaligem Bildladen ist noch kein Leak. Test auch mit deaktiviertem Worker/GPU zum Isolieren wiederholen, aber Ergebnisse getrennt ausweisen.
8. Normale Editoransicht und Final-PNG-Export separat kontrollieren. Keine Einstellung für Fog, Relief, Schatten oder Assets wird allein wegen einer Performance-Messung verändert.

**Abnahmekriterium:** Keine kritischen sichtbaren Lücken oder Fog-Lecks, keine dauerhaft blockierten sichtbaren Tiles, die Qualitätseinstellungen wirken entsprechend dem Budget, und realistische p50/p95-/Speicherwerte liegen für **denselben** gespeicherten Szenenstand vor. Ein generelles FPS-Mindestziel wird nicht nachträglich als bereits erreicht behauptet; über Grenzwerte erst nach Vergleichsmessungen entscheiden.

## Umgebungshinweis

In der isolierten Assistenzumgebung kann das öffentliche Repository nicht auf die lokalen Originalassets oder den gespeicherten 397-Hex-Szenenstand zugreifen. Zusätzlich blockiert das dortige Chromium das Öffnen eines localhost-Testservers. Daher wurden dort nur `node --check`, CLI-Unit-Tests und eine Diagnose des CDP-Browserstarts durchgeführt; **kein** echter Asset-Labor-End-to-End-Lauf und keine visuellen Leistungszahlen erzeugt.
# PC-Abnahme: vollständiges Asset-Labor und gespeicherte Originalkarte

**Datum:** 17.11.2026 · Nach dem Merge von Integrations-PR #147 auf `main`.

## Was du zuerst öffnen sollst

Verwende die im vollständigen Projektordner liegende Datei **`START_WINDOWS.bat`** (nicht `START_RENDERTEST_WINDOWS.cmd`, `START_STEP16B_TESTS_WINDOWS.cmd` oder Testseiten). Sie öffnet die **normale Oberfläche**:

**`http://127.0.0.1:8780/index.html`**

Das muss die Grafikbibliothek links, das Kartenfeld in der Mitte und die Werkzeug-/Inspektorbereiche rechts zeigen. Falls nur Tests erscheinen, URL und im Startfenster ausgegebenen Projektordner prüfen. **Den lokalen Projektordner nicht mit `git reset --hard` oder `git clean` überschreiben.**

Wenn das Startfenster meldet, Port 8780 sei belegt, ist vermutlich bereits ein älterer Server aktiv. Den älteren Server kontrolliert beenden und dann den Starter erneut verwenden. **Nicht auf Port 8781 wechseln:** dort ist die gespeicherte Firefox-Karte nicht unter derselben IndexedDB-Origin verfügbar. Bestehendes Firefox-Profil verwenden, keinen Cache/IndexedDB löschen.

## GitHub-Änderungen sicher auf den PC bringen

Zuerst im bisherigen lokalen Projektordner ein Terminal öffnen und **nur lesende Befehle** ausführen:

```powershell
git status --short
git branch --show-current
git remote -v
```

Das Ergebnis vor jedem `git pull`, `checkout`, `reset`, `clean` oder `stash` kontrollieren. Falls uncommittete Änderungen oder Assets vorliegen, **nichts automatisch bereinigen**. Eine separat aus `main` ausgecheckte Arbeitskopie ist möglich, kann aber lokale **nicht versionierte Grafiken/Precomputed-Daten** aus dem Hauptordner vermissen. Deshalb den ursprünglichen Ordner für den ersten Datenbestand nicht löschen oder unkontrolliert ersetzen.

## Funktionsprüfung (manuell)

- [ ] **Hauptanwendung:** `index.html` zeigt Grafikbibliothek, Karte und gruppierte Werkzeuge – nicht die Testoberfläche.
- [ ] **Geografie 2.1.1:** Geografie-Labor öffnen und unveränderte Seed-/Parameterwelt nachvollziehen. Keine gespeicherte Hauptkarte unabsichtlich neu generieren.
- [ ] **Editor:** eine kleine neue Szene verwenden; Terrain-/Wasser-/Nature-Optionen, Werkzeugwechsel, vorhandene Icon-/Bildpfade und Export kontrollieren.
- [ ] **Originalkarte nur lesen:** im *bisherigen* Firefox-Profil `http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near&perf=1`. Sichtbare Karte mit 120 Kacheln prüfen; **keinen Re-Bake durchführen**.
- [ ] **Renderer:** 1×-Sicherheitscache zuerst **AUS**, dann separat aktivieren und wieder deaktivieren; 2×-Nachschärfen, lange Kamerafahrten, Kachel-/Küsten-/Waldnähte, Fog-Grenzen und RAM betrachten.
- [ ] **ZIP-Import nur in einem frischen Testprofil:** `static-map-import.html` zuerst mit einem **kleinen selbst erstellten Test-ZIP**; die neue Kartenkennung und Wiederöffnung nach vollständigem Firefox-Neustart prüfen. Unterbrechungs-Bereinigung ausschließlich mit synthetischen, abgebrochenen Test-Imports. **Nicht das 600-MB-Original-ZIP als Ersttest verwenden.**

Die komplette Originalkarte und der uncommittete lokale Arbeitsstand werden **nicht** über diesen automatisierten CI-Test simuliert. Diese manuelle Abnahme ist weiterhin gesondert notwendig.

## Meldungen, die bei einem Problem helfen

Nenne den **im Startfenster angezeigten Projektordner und Port**, die verwendete URL und welche Komponente nicht funktioniert (Bibliothek, Welt, Geografie, ZIP, Fog oder Scroll-/Zoomverhalten). Bei Renderproblemen reichen anonymisierte Zahlen aus `window.__vedrasFrozenGameTest.stats()`; keine privaten ZIPs, Originalgrafiken oder unfreigegebenen Screenshots in CI-Artefakte kopieren.

# Schritt 16B – fehlender nativer Node-Regressionsnachweis (01.11.2026)

## Gesicherter Stand

Die **drei separaten Windows-Qualität-4-Audits**
`step16a-audit(20261031-132531).zip`,
`step16a-audit(20261031-140757).zip` und
`step16a-audit(20261031-150008).zip` verwenden
dieselbe Szene (SHA-256
`1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f`,
397 Hexfelder, 2.631 Nature-Instanzen).

- Alle drei: **Warm-Pan und Warm-Zoom gültig**,
  rAF-p95 jeweils **16,8 ms**, 0 Ground-/Tile-Bakes,
  0 Bilddecodes/Evictions, 0 Revisionsänderungen und Cache-Misses
  **während** der Geste.
- Immer 16/16 exakte World-Tiles, 15.888.470 von 26.000.000
  Rasterpixeln, keine Budgetüberschreitung; 8.205.120 Ground-
  und 7.683.350 Scenery-Pixel.
- Erstaufbau weiterhin deutlich teurer; dessen Dekodierungen,
  Evictions und Bakes nicht mit Warm-Ergebnissen vermischen.
- Die drei ZIPs enthielten **keinen** nativen `node --test`-Bericht.
  Deshalb kann die gesamte Schritt-16B-Abnahme noch nicht
  als bestanden gelten.
- Ein real sichtbarer schmaler **Ozean-Ground-Kachelübergang**
  ist separat als [Issue #90](https://github.com/markusjungblut/asset_labor/issues/90)
  mit Pixelwerten und Reproduktion beschrieben. Es gibt
  **noch keinen nachgewiesenen, getesteten Renderer-Fix**.

## Neuer einmaliger Windows-Testlauf

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git status --short
git fetch origin
git switch test/step16b-native-acceptance-evidence-20261101
git pull --ff-only origin test/step16b-native-acceptance-evidence-20261101
.\START_STEP16B_TESTS_WINDOWS.cmd
```

Der Launcher führt **ausschließlich die acht explizit festgelegten
Schritt-16B-Regressionstestdateien** mit `node --test
--test-reporter=tap` aus; zum aktuellen Branch gehören
**exakt 94 Testfälle**. Ein PASS wird ausschließlich vergeben bei
Exitcode 0, 94 durchgeführten/94 bestandenen, **0 fehlgeschlagenen,
0 übersprungenen, 0 abgebrochenen** Fällen.

Als sichere Ausgaben erzeugt er *jedes Mal einen neuen* Ordner
unter `artifacts/rendering-step16b-native-<ISO-Datum>-pid<PID>`:

- `node-tests.tap`: vollständiges natives Konsolenprotokoll,
  bis 4 Mio. Zeichen begrenzt; bei Überschreitung entsteht
  **keine falsche PASS-Meldung**, weil die TAP-Zählsummen fehlen.
- `result.json`: Node-Version, Windows-Plattform, Git-SHA
  und -Branch, Status eines bereits modifizierten Arbeitsverzeichnisses,
  die exakten Dateinamen und TAP-Zähler, Exitcode und PASS/FAIL.
- `README.md`: Kurzbericht.
- Unter Windows zusätzlich eine `...zip` per PowerShell.
  Falls ZIP-Erstellung scheitert, bleibt der vollständige
  Ergebnisordner erhalten und der Fehler wird ausgegeben.

**Keine** Git-/Repo-Resetbefehle, kein `git clean`,
keine Änderung der bestehenden Audit- oder Renderingdateien,
kein CI-/GitHub-Actions-Budgetverbrauch, keine zweite
Warm-Messung und keine Unterdrückung fehlgeschlagener Tests.
Wurden lokale Dateien geändert, **zuerst `git status --short`
lesen und nicht blind Branches wechseln**.

### Abnahme danach

- ZIP mit nativem Node-Protokoll prüfen; Abweichungen gezielt
  am gemessenen Testfall und produktiven Pfad beheben.
- Separaten Ocean-Ground-Grenzfehler aus Issue #90
  mit Source-Alpha-/Device-Kantenprobe nachvollziehen und
  durch deterministische Screenshot-/Canvas-Testfälle beheben.
- Die 3/3 bereits gültigen Warm-Messungen bleiben Referenz.
  Reale Bild-, Fog- und Cold-Performanceabnahme erst bei
  bestätigtem Ergebnis freigeben; PRs bleiben bis dahin Draft.

**16B: Warm-Performance erfüllt, übrige Abnahme offen.
Nicht mergen; 16C/17 weiter gesperrt.**

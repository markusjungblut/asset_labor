# Vedras Reiche – Asset-Labor v0.13.0 (zusammengeführt)

## Wälder und Dschungel (v0.12.0)

Das Asset-Labor besitzt nun eine zusätzliche **Waldschicht** unabhängig von Terraintexturen und Biomen: `light_forest`, `dense_forest` sowie einen **ein Hex breiten Waldrand-Auslauf**, durch den auch benachbarte Hexe mehr Bäume erhalten. Das eigenständige Jungle-Biom `jungle` lässt sich auf Landhexen als Dschungelgebiet markieren; vorhandener Waldboden dient bis zu einem echten Jungle-Terrain ausschließlich als visuelle Fallbacktextur. Seed-basierte Waldgruppen, Biomverträglichkeit, individuelle Nature-Größen und -Abstände werden berücksichtigt. Testkarte: **Natur auf Karte verteilen → Wälder & Dschungel**. Die Waldklassen werden in der Szene gespeichert und pro Hex als `forestByHex` exportiert. Für technische Details und noch offene Hauptspiel-Integration siehe [Wald- und Dschungelsystem](docs/FOREST_SYSTEM.md).

**Kapokbäume:** Alle acht `tree_12.png` bis `tree_19.png` sind normale, im Dschungel automatisch und manuell platzierbare Kapokbäume. Die frühere Journal-/API-Klassifizierung beruhte auf einem Missverständnis und wurde vollständig aufgehoben.


**Aktueller Stand:** v0.11.0 mit 37-Hex-Testkarte, 17 tatsächlich offenen Spritearten (ursprünglich 45 Planposten) und geprüftem Bestandsmanifest: 25 Geländequellfamilien (104 PNGs), 148 Nature-PNGs einschließlich acht gewöhnlicher Kapokbäume. Eindeutige Dateinamen liefern Metadatenvorschläge, bestehende Katalogwerte werden nicht überschrieben. Neue Vorschläge bleiben bis zur Bildabnahme Kandidaten.

**[Quellcode auf GitHub](https://github.com/markusjungblut/asset_labor)** · **[Verbindliche Grafikentscheidungen](https://github.com/markusjungblut/browsergame/blob/main/docs/graphics/Design.md)** · **[Release-Hinweise](README_V0110_UPDATE.md)**

Die historischen Versionsnotizen folgen unten. Für den aktuellen Stand gelten die v0.11.0-Regeln.

---

> **Aktuell v0.10.9:** Gerichtete Bergschlagschatten, live gespeicherte Instanzregler und Kettenabstände. Siehe [README_V0109_UPDATE.md](README_V0109_UPDATE.md) und [DESIGN_V0109_ADDENDUM.md](DESIGN_V0109_ADDENDUM.md).

> **v0.10.9 – Bergketten, Kernzone statt gesperrtem Hexring und Berganker Y=0,67:** Siehe `README_V0108_UPDATE.md`.

> **v0.10.7 – Bergplatzierung mit reservierten Hexringen:** Siehe `README_V0107_UPDATE.md`.

> **Asset-Labor v0.10.6:** Wasserbilder werden ohne innere Bildwiederholung einmal pro Hex dargestellt. Keine 22-%-Randmischung mehr. Die unveränderten v0.10.5-Uferoverlays, Nature-Sprites und das Landrelief bleiben bestehen. Siehe `README_V0106_UPDATE.md`.

**Aktueller Stand v0.10.5:** Küstenwasser-Migration, Wasser-Mixing, 6 Seiten der Ufer-Overlays; siehe [README_V0105_UPDATE.md](README_V0105_UPDATE.md) und [DESIGN_V0105_ADDENDUM.md](DESIGN_V0105_ADDENDUM.md).

> Stand: v0.10.4 – Wasser-Wasser-Mixing + Shoreline-Overlay-System. Details in `README_V0104_UPDATE.md`.

> **Neuer eigenständiger Renderer-Bugfix v0.10.3:** [README_V0103_UPDATE.md](README_V0103_UPDATE.md) – nahtlos wiederholbare Wassertexturen, A/B-Diagnose, keine Änderung an PNG-Dateien oder Landrelief.

> **Neue Version v0.10.2:** Siehe [README_V0102_UPDATE.md](README_V0102_UPDATE.md) für flaches Wasser, Wasser-zu-Wasser-Übergänge, Wasserklassifizierung und Tests.

> **Neue Version v0.10.1:** Siehe [README_V0101_UPDATE.md](README_V0101_UPDATE.md) für Installation, automatische Regionstests, den Nature-Katalog-Regressionsschutz und das Gebäude-Relief.

# Vedras Reiche – Asset-Labor v0.10.3

**Lokal startbarer Grafikviewer für eine modulare 2,5D-Pointy-Hex-Weltkarte.** Diese Version ist ein **technischer Teststand**, kein produktiver Kartenrenderer. Die zentrale Neuerung ist ein expliziter Geländekatalog mit geänderter Auto-Tiling-Materialmischung.

## Neuer Teststand v0.10.1 – Sanfte Hügel ohne Biomextra-Texturen

Das Asset-Labor hat unter **Hügel & Relief** fünf geometrisch definierte, deterministische 2,5D-Hügelprofile, einen Höhenregler, rechtsseitigen Lichteinfall, automatische Kontinuität über Hexgrenzen, einen A/B-Flachland-/Relief-Vergleich und zwei 19-Hex-Beispielkarten. Jedes Profil wird auf den bereits zusammengesetzten Bodenraster angewandt; Bäume, Felsen und Teststraßen folgen derselben Höhe. Terrainmaterial und Relief sind zwei unabhängige Schichten; vorhandene Biome, Sprite-Presets und Kataloge bleiben erhalten.

**Für bestehende Installationen:** Nur das `v0.10.1_Update.zip` über die vorhandenen Programmdateien entpacken, vorher `assets/` sichern. Der neue Startport ist **8771**, sofern frei. Siehe [README_V010_UPDATE.md](README_V010_UPDATE.md). Die geänderte Demo ist **noch keine vollwertige 3D-Engine**; Relief wird per CPU-gestütztem Höhenraster auf der Terrain-Mischung simuliert. Beim exakten Hochrelief sowie auf großen Karten stehen Sicht- und Performancetests noch aus.

## Neuer Teststand v0.9.1 – Freigaben nach Kategorie, Presets und Schattenkontakt

- **Ganzes Biomset freigeben:** Im Nature-Inspektor unter „Gesamte Terrain-Kategorien“ beispielsweise „Kalte Regionen“, „Gras- und Weideland“ oder „Feuchtgebiete“ anhaken. Eine neue Geländeart in einer bereits ausgewählten Kategorie wird automatisch beim nächsten Laden/Rendern einbezogen. Die Abhängigkeit wird durch stabile `categoryId` statt durch einen kopierten Satz alter Terrain-IDs gespeichert.
- **Einzelarten-Ausnahmen:** Bei jedem Terrain separat „Automatisch“ (Kategorie/Preset entscheidet), „Zusätzlich“ oder „Ausschließen“ wählen. Die Ausnahme schlägt eine Kategorienfreigabe.
- **Benannte Setups:** Aktuelle Kategorien/Freigaben als Preset speichern und bei anderen Sprites über die Auswahlliste verknüpfen. Ein Preset bleibt verknüpft: Änderungen am Preset gelten für alle verknüpften Sprites. Beim Löschen eines Presets werden die bisherigen Regeln in die Sprites übernommen; ein ungespeichertes, beschädigtes Preset darf keine Zuordnungen löschen.
- **Schattenkorrektur:** Nature-PNGs werden anhand der sichtbaren Alpha-Silhouette gezeichnet; großer transparenter Rand wird bei Darstellung und Bodenanker nicht mehr als Bildinhalt gerechnet. Generische Schatten liegen nahe beim Bodenkontakt, kurz und leicht nach links (Licht von rechts). X-/Y-Versatz, Breite und Schattentiefe sind im Nature-Inspektor editierbar. Die Debug-Option „Bodenanker und Schattenkontakt markieren“ hilft bei der optischen Feinabstimmung. Große Bäume und Gebäude benötigen weiterhin eigene Schattenbilder.
- **Verlustfreie Migration:** Die alte `assets/nature/nature_catalog.json` bleibt lesbar (v1-Schema); neue Felder sind optional. Die Server-API validiert Kategorien, Presets und Schattenparameter; beim Speichern entsteht weiter eine `.bak`-Kopie. Keine neuen Nature-Sprites ohne Sidecar automatisch als freigegeben markieren.

**Installationshinweis:** Für vorhandene Nutzerbestände das **v0.9.1_Update** in denselben Labor-Ordner entpacken (vorher `assets/` sichern), nur geänderte Programmdateien überschreiben. Das Update enthält keinerlei Terrain-Bilder, Terrain-/Nature-Kataloge oder andere Nutzerdaten. Die zentrale Grafikdokumentation ist im Repository unter `docs/graphics/Design.md` auf v2.4 und wird durch das ZIP nicht auf einen alten lokalen Dokumentstand zurückgesetzt. Das vollständige v0.9.1-ZIP ist ein **separates Beispielprojekt** und ersetzt nicht die eigenen Dateien.

**Offen:** Echte Sichtabnahme des gemalten Schattens auf allen neu hochgeladenen Busch- und Baumgrafiken; vollständige 30×30-Weltgeneration und großer Performance-Test. Die generischen PNGs sind anpassbare Testschatten, keine finalen individuellen Baumschatten.

## Start

1. ZIP vollständig entpacken (keine Dateien direkt aus dem ZIP starten).
2. Unter Windows `START_WINDOWS.bat` doppelklicken. Benötigt Python 3, **keine Drittbibliotheken** für den Betrieb.
3. Die im Konsolenfenster angezeigte Firefox-/Browser-URL öffnen. Startport ist **8774**; bei Belegung weicht der Starter auf den nächsten freien Port aus. Browser-Tabs vom alten Labor (`8765`, `8767`) nicht wiederverwenden.
4. Im Kopf muss **Asset-Labor v0.10.3** erscheinen. Das Terminalfenster geöffnet lassen.
5. Neue Bilder nach `assets/terrain/`, `assets/nature/`, `assets/buildings/` etc. kopieren und auf **Neu einlesen** klicken.

`http://127.0.0.1:<angezeigter-port>/api/version` liefert die Server- und Ordneridentität.

Ohne Python lässt sich `index.html` auch direkt öffnen; über **Ordner importieren** können Dateien eingelesen werden. Änderungen am Katalog können in dieser Betriebsart exportiert werden. Ein Browser darf importierte Ordner **nicht automatisch wieder beschreiben**.

## Fix v0.8.1 – „Neu einlesen“ behält Zuordnungen

In v0.8.0 wurde beim erneuten Laden der Assetliste der Katalog vom Server unabhängig vom aktuellen Bearbeitungsstand ersetzt; nicht zuvor ausdrücklich gespeicherte Grafikzuordnungen konnten dadurch unter „Nicht zugeordnet“ zurückfallen. v0.8.1 behebt diesen Fehler:

- **Neu einlesen** lädt neue Dateien, ohne die aktuellen Bearbeitungen zu verwerfen. Ausstehende Änderungen werden zuerst gespeichert; bei einem Speicherfehler bleiben die lokalen Zuordnungen bestehen und es erscheint eine Meldung.
- Der lokale Server **speichert Änderungen automatisch** (mit kurzer Verzögerung), seriell nach Änderungsstand. Das manuelle Speichern bleibt möglich.
- Beim Speichern des Katalogs wird die vorherige Datei als `assets/terrain/terrain_catalog.json.bak` gesichert. Bereits zuvor durch v0.8.0 verlorene, nie gespeicherte Zuordnungen können dadurch allerdings nicht rückwirkend rekonstruiert werden.
- **Wichtig beim Update:** Für eine vorhandene v0.8-Installation das kleine **Hotfix-Update-ZIP** in genau den alten Asset-Labor-Ordner entpacken und die gleichnamigen Programmdateien ersetzen. **Nicht `assets/terrain/terrain_catalog.json` überschreiben oder den Ordner `assets/` durch den aus einem frischen Vollpaket ersetzen.** Dadurch bleiben alle bereits hinzugefügten Bilder, Kategorien und Zuordnungen erhalten. Vorher die vorhandene `terrain_catalog.json` zur Sicherheit kopieren.
- Alte Serverfenster schließen und `START_WINDOWS.bat` neu starten. Im Kopfbereich muss **v0.8.1** stehen. Zum endgültigen Auslagern oder vor einem Ordnerwechsel immer zusätzlich **Katalog exportieren**.

### Fehlerprüfung

1. Eine vorhandene Grafik auswählen und einer anderen Geländeart zuordnen.
2. Sofort „Neu einlesen“ drücken, ohne zuvor manuell „Katalog speichern“ zu benutzen.
3. Die Zuordnung muss bleiben und nach einem Browser-Neustart weiterhin geladen werden. Der neue Bildbestand muss ebenso eingelesen werden.
4. Im Servermodus zeigt der Katalogstatus nach erfolgreichem Speichern keine offenen Änderungen mehr an.
5. Ohne lokalen Server muss der Katalog als JSON exportiert werden; ein reiner Ordnerimport hat keine Schreibberechtigung.

## Neuer Geländekatalog

Die Grafikbibliothek gruppiert Terrainassets jetzt in der Hierarchie **Kategorie → Geländeart → Varianten**. Es gibt die sechs vereinbarten Kategorien mit 19 Geländearten:

- **Wasser und Küste:** Ozean, Küstengewässer, Küste
- **Kalte Regionen:** Gefrorene Tundra, Tundra, Schneefelder
- **Gras- und Weideland:** Grasland, Weideland, karges Weideland
- **Warme Regionen:** Savanne, Dschungel
- **Feuchtgebiete:** Moor, Marschland, Sumpf
- **Trockene Regionen:** Steinwüste, Sandwüste, Lehmwüste, Badlands, Ödland

Eine **siebte, ausdrücklich als Testbestand gekennzeichnete Kategorie** „Weitere Testgelände“ verwaltet zusätzlich die vier älteren Demo-Texturen Waldboden, Hügelboden, Gebirgsboden und trockener Boden. Sie sind keine stillschweigenden Varianten von Grasland, sondern eigene Testarten. Daraus ergeben sich derzeit **7 Kategorien und 23 Geländearten**.

Über **Neue Kategorie anlegen**, **Neue Geländeart anlegen** und die beiden Bearbeiten-Bereiche kannst du Kategorien und Geländearten anlegen, umbenennen, verschieben oder archivieren. Die IDs bleiben dabei stabil.

### Neue Grafik richtig einsortieren

1. Eine vollflächige, rechteckige Bodenmaterialgrafik in `assets/terrain/` kopieren und **Neu einlesen**.
2. Sie steht ohne gültige Zuordnung unter **Nicht zugeordnet**. Die Dateibenennung alleine ist **keine** automatische Biomerkennung.
3. Grafik auswählen, rechts unter **Geländeart der Grafik** die korrekte Art auswählen (z. B. Tundra).
4. **Automatische Speicherung:** Im lokalen Servermodus wird jede neue Geländearten-Zuordnung und Kategorie-/Typänderung nach kurzer Verzögerung automatisch nach `assets/terrain/terrain_catalog.json` geschrieben. **Katalog speichern** ist zusätzlich als sofortige manuelle Sicherung vorhanden. Im reinen HTML-/Ordnerimport-Modus muss der JSON-Export weiterhin heruntergeladen und eigenständig in den richtigen Ordner kopiert werden.
5. **Auf ausgewähltes Hex setzen** oder eine gesamte Test-Biomgruppe mit derselben Grafik belegen.

Der Katalog lässt sich auch **exportieren, importieren und neu einlesen**. Die von dir erstellten IDs sind beständig; veränderte Anzeigenamen verursachen keine Identitätswechsel. Eine Szene kann exportiert und wieder importiert werden. Alte Szenen aus v0.6/v0.7 werden mit ihren explizit zuordenbaren Grafiken gelesen; unbekannte Grafiken/Typen werden **nicht** willkürlich auf Grasland gemappt, sondern übersprungen und gemeldet.

**Mitgeliefert:** Vier Tundra- und vier Gefrorene-Tundra-Grafiken aus dem bisherigen Entwurfsprozess, ausdrücklich als **KI-Kandidaten** und **nicht als bewiesen nahtlos wiederholbar** deklariert.

## Auto-Tiling v0.8

- **Getrennte Schalter:** „Geländeartenübergänge“ für verschiedene Arten und „Nur Varianten derselben Geländeart mischen“ für Varianten **derselben** Art.
- **Ein gemeinsames Weltkoordinatenfeld:** Ein Materialpunkt wird nur einmal berechnet, nicht mit getrennten Hexclip-/Alpha-Layern überlagert.
- **Gemeinsame Verformung:** Die organische Kantenunregelmäßigkeit basiert auf einer identischen Weltposition für alle angrenzenden Materialien. Sie erhält die Symmetrie entlang derselben Grenze.
- **Normierte Eckmischung:** Bis zu drei benachbarte Materialproben teilen sich die Gewichte. Es entstehen keine zusätzlichen unabhängigen Eck-Overlays.
- **Kernzonenschutz:** Außerhalb des Übergangsbandes bleibt das eigene Material unverändert; weiter ins Innere reichende keilförmige Ausläufer werden vermieden.
- **Bilineare periodische Abtastung** statt ausschließlich ganzzahliger Quellpixelabtastung; periodische Nahtprobleme der ursprünglichen PNG können aber weiterhin sichtbar sein.
- **Sonderfall Küste/Wasser:** Bei diesen Geländearten ist ein eigenes Ufer-/Gewässerprofil vorgesehen. Solche Kanten werden derzeit **nicht** wie normale Erdmaterialien ineinandergeblendet. Das vollständige Shoreline-System ist noch nicht implementiert.

Rechts im Viewer findest du Kantenbreite, organische Unregelmäßigkeit, Dreifachkontakt-Test, Nahtkontrolle, hohe Zoomstufen und Diagnosemodi. Im Bereich **Ausgewähltes Hex** wird jetzt ausdrücklich erklärt, ob der jeweilige Nachbar ein Variantenwechsel, eine Geländeartengrenze oder eine ungeklärte Uferregel ist.

### Gebäude und Nature-Sprites

Die Objekt-Grafiken bleiben getrennte Sprites; der Terrainblender verändert sie nicht. Die derzeitige Testmine enthält noch eine unpassende Bodenzone und ist **kein finales Produktionsasset**. Künftige Gebäude-Grafiken werden ohne biomeigene Gras-/Schnee-/Sandfläche erzeugt und bekommen gemäß Designstandard einen separaten, individuell gemalten Bodenschatten. Das Testmaß Level-1-Mine beträgt 160 logische Einheiten, Gebäudebreite maximal 192 bei Hexbreite 256.

## Entwicklertests

Im Projektordner (nur für die Tests benötigst du Playwright / pytest und einen installierten Chromium-Browser):

```bash
python tests/test_v08_browser.py
python tests/test_catalog_api.py
```

Der erste Test verwendet eingebettete Grafikdateien, da direkte Browsernavigation auf localhost in manchen Ausführungsumgebungen administrativ blockiert sein kann. Der zweite Test startet den Python-Server selbst und prüft Katalog-API, persistentes Schreiben und ungültige Payloads.

Numerische Kriterien der Materialmischung mit künstlichen Farbflächen: an der Zweiergrenze ungefähr (127,128,0), an der symmetrischen Dreifachgrenze (85,85,85), im Feldzentrum 100 % eigene Farbe. Diese Tests sind keine visuelle Freigabe aller generierten Materialbilder.

## Grenzen und Folgearbeiten

- Die Texturen sind **nicht alle nahtlos wiederholbar**. Die v0.8-Rechnung löst die geometrische Mischnaht, nicht jeden sichtbaren Wiederholungsbruch einer KI-Quelltextur.
- Bilder mit fester Seitenwand/Hexblock, schwarzem Hintergrund oder großen bereits hineingemalten Steinen sind keine freigegebenen Terrain-Bases.
- Das Terrain wird im Viewer auf der CPU als zusammenhängender Canvas2D-Bildpuffer erzeugt und gecacht. **Performance mit 200+ sichtbaren Hexen** und auf schwächeren Firefox-/Mobilgeräten bleibt ein separates Gate; für eine große Spielwelt sind Chunks und/oder GPU-Rendering nötig.
- Gezielte Übergangsprofile für Küste/Ufer, Höhenstufen und Wasser sowie ausführliche A/B-Materialtests müssen noch ausgebaut werden.
- Die Asset-Labor-Tests sind **kein Gameplay- oder produktives Weltkarten-Abnahmeprotokoll**.

Die zentralen Grafikvorgaben liegen in `Design.md`, die Meilensteinplanung in `AUTOTILING_PLAN.md`. Die **maßgeblichen Projektversionen** werden im GitHub-Repository unter `docs/graphics/` gepflegt.

---

## Neues in v0.9.0 – Nature-Sprite-Verwaltung

Das Labor ergänzt einen **separaten Nature-Katalog** unter `assets/nature/nature_catalog.json` mit automatischer Speicherung, Import und JSON-Export. Über den rechten Nature-Sprite-Inspektor lassen sich für jeden freigestellten Busch, Baum, Felsen, Kaktus oder sonstigen Gegenstand IDs, Herkunft, Familie, Größe, Schatten, Bodenanker, geeignete Geländearten und Platzierungsregeln bearbeiten.

**Startport: 8769**; die Version wird in Kopfzeile und `/api/version` angezeigt. Für bestehende Installationen bitte **das kleine v0.9-Update-Paket benutzen**, das Terrain-Katalog und eigene Grafiken nicht überschreibt. Siehe `README_V09_UPDATE.md`.

**Ablauf für neue Sprites:** PNG in `assets/nature/` plus gleichnamige JSON-Sidecar aus `NATURE_SPRITE_CONTRACT.md` ablegen → „Neu einlesen“ → rechts prüfen → „Nature-Sprites auf Testkarte verteilen“. Mehrere Instanzen können unterschiedlich auf einem Hex stehen. Die Verteilung ist reproduzierbar, nicht beim Neuladen neu ausgewürfelt. Die bisherigen Platzhalter bleiben Testgrafiken; es wurden keine der Nutzer-Vorlagen automatisch zu fertigen Einzel-PNGs erklärt.

Der bisherige Terrainrenderer bleibt erhalten. Eine große, vollwertige Weltgeneration mit 30×30 Feldern und optimiertem Chunk-/GPU-Rendering ist **noch nicht implementiert**; v0.9 dient bewusst als erster geprüfter Nature-Sprite-Produktionsvertrag.

Testaufrufe: `python tests/test_nature_v09_api.py` (Server) und `python tests/test_nature_v09_embedded.py` (Browser via Playwright/Chromium). Die älteren v0.8-Browser-Testskripte werden historisch mitgeliefert und sind nicht auf alle neuen v0.9-IDs aktualisiert.

**Dokumentationsstand:** Die mitgelieferte `Design.md` ist ausdrücklich ein älterer Offline-Schnappschuss. Der aktuelle verbindliche Stand ist [aktueller Design.md](https://github.com/markusjungblut/browsergame/blob/main/docs/graphics/Design.md) plus [Nature-Sprite-Vertrag](https://github.com/markusjungblut/browsergame/blob/main/docs/graphics/NATURE_SPRITES.md) im Repository. Die eigenständig nutzbare detaillierte Nature-Anleitung liegt hier lokal als `NATURE_SPRITE_CONTRACT.md`.


## Quellcode und geplanter Sprite-Katalog (v0.11.0)

Der kanonische **Asset-Labor-Quellstand** liegt im separaten Repository [markusjungblut/asset_labor](https://github.com/markusjungblut/asset_labor). Dort liegen Programmcode, Tests und `plans/sprite_catalog_plan.json` (17 offene Vorhaben, 28 abgeglichene ältere Planposten). Designentscheidungen aus dem Gesamtspiel werden weiterhin in `browsergame/docs/graphics/Design.md` abgestimmt.

**Git-Stand nach Nutzer-Commit vom 18.10.2026:** In `assets/` sind inzwischen 148 Nature-PNGs, 104 Terrain-PNGs, 4 Schatten-PNGs und 6 Ufer-PNGs versioniert. Ebenso sind `assets/nature/nature_catalog.json` und `assets/terrain/terrain_catalog.json` jetzt eingecheckt. Die Nutzerin/der Nutzer hat die vorher ergänzten PNG-/Katalog-Ignore-Regeln ausdrücklich entfernt. Neue Bilder werden dadurch bei `git status` angezeigt, gelangen aber **erst nach `git add`, `git commit` und `git push`** nach GitHub; ein Dateikopiervorgang allein reicht nicht. `.bak` und temporäre Dateien bleiben ignoriert. Katalogspeicherung im lokalen Servermodus erzeugt vor dem Überschreiben ein Backup; individuelle vorhandene Zuordnungen werden beim automatischen Vorschlag nicht ersetzt.

**Dateinamen-Audit:** `plans/terrain_asset_plan.json` ordnet die 25 vereinbarten Terrainfamilien ihren 104 tatsächlich vorhandenen PNGs zu. `stormy_ocean_01.png` bis `stormy_ocean_08.png` sind nach Nutzerumbenennung einheitlich benannt. Das frühere `mountain_01.png` ist im aktuellen Repository nicht mehr enthalten. `cosatal_water_*` bleibt aus Bestandsschutz unter seinem bisherigen Dateinamen, ist aber als `coastal_water` klassifiziert. Waldboden (`wald_*`) ist ein Sondermaterial, kein automatisch eigener Weltbiomtyp. Neue `marula*`- oder `wacholder*`-Bilder gehören in `assets/nature/`, nicht in `assets/terrain/`.

**Kapokbäume (Korrektur):** `tree_12.png` bis `tree_19.png` sind acht normale Dschungelbäume mit den IDs `kapok_tree_12` bis `kapok_tree_19`, `kind=tree`, `family=jungle_trees`, Größenklasse `giant` und der Geländeart `jungle`. Sie werden wie andere Nature-Bäume manuell oder automatisch platziert. Es gibt keine separate Kapok-API und keine Journal-Sonderbehandlung. Die ursprünglichen PNG-Dateinamen bleiben erhalten. Alle vorhandenen Nature-Grafiken dürfen auf der Testkarte auch im Status `candidate` verwendet werden, wenn die Biomfreigaben passen.

### Neue PNGs & Verteilung (Oktober 2026)

Neue Bilder in `assets/nature/` kopieren und im laufenden lokalen Asset-Labor **Neu einlesen**. Die Server-Assetliste erkennt PNGs ohne weiteren Code, aber die automatische Metadatenklassifizierung funktioniert nur für **bekannte, exakt geprüfte Namensfamilien**: beispielsweise `wacholder4.png`, `wacholder_04.png`, `marula_01.png`, `marulabaum1.png` und `marula-baum_01.png`. Ein unbekannter Dateiname erscheint weiterhin in der Bibliothek; seine Klasse und Biome müssen manuell im Nature-Inspektor festgelegt und gespeichert werden. Bestehende individuelle Metadaten werden nicht überschrieben.

Der Button **Nature-Sprites auf Testkarte verteilen** (ebenso die Schnellaktion **Natur verteilen**) verwendet auch `candidate` und `test`; dies gilt ausschließlich zum Testen, nicht als Produktionsfreigabe. Es zählen ausschließlich passende Geländearten und die jeweilige Dichte-/Abstandslogik. Bei 0 Instanzen zeigt die Oberfläche nun einen Grund an, statt stillschweigend 0 zu melden. Kapokbäume `tree_12`–`tree_19` sind normale Dschungelbäume und dürfen platziert werden.

**Palmen:** `palme_01` bis `_05` gehören zur Familie `palms`, Größenklasse `medium` (126 Welt-Höheneinheiten); `_06` bis `_11` sind `large` (174). Alle bleiben auf Landbiome (`warm_regions`, `wetlands`) begrenzt, nicht auf offenes Küsten-/Ozeanwasser. Dies sind relative Bildschirmgrößen, keine realen Meter. Die botanische Unterart bleibt ungeklärt.

## Vegetationskatalog & bereinigte Aufgabenliste (18. Oktober 2026)

Der **Sprite-Planungskatalog ist keine Liste sämtlicher Grafikarten**. Die alte Sammlung von 45 Arten enthielt bereits produzierte Naturgrafiken unter abweichenden englischen Soll-Dateinamen. Daraus entstand die missverständliche Anzeige `0 von 45 Bilddateien`. Der bereinigte Plan hat **17 noch offene Arten**. Weitere 28 ältere Einträge stehen unter `resolved`: **21** werden durch vorhandene Varianten abgedeckt beziehungsweise nicht eigens benötigt; **7** Kleinstobjekte werden nicht als einzelne Nature-Sprites produziert, sondern gegebenenfalls in Terrain-Bodenmaterial integriert. Im Viewer steht deshalb die Zahl *noch offener Vorhaben*, nicht die irreführende 45er-Quote. Vorhandene Bilder verbleiben im realen Nature-Katalog; es wurden weder Platzhalterbilder noch leere Sidecars angelegt.

**Büsche:** `bush_01`–`04` mittel; `05`–`06` klein; `07`–`10` groß; `11`–`14` mittel; `15` klein; `16` mittel; `17`–`19` groß; `20`–`29` trockene Büsche (Größe derzeit grob als 20–24 mittel und 25–29 klein angesetzt); `30`–`33` mittel; `34`–`41` echte Buschgruppen (`kind=cluster`). Die zehn Trockenbüsche bekommen die Familie `dry_bushes`, die anderen stehen unter `temperate_bushes`. Die Gruppengrößen und Trockenbusch-Feinabstufungen bleiben später optisch justierbar.

**Beschneite Nadelhölzer:** `tanne_schnee_01`–`05` heißen im Katalog *Verschneite Kiefer*, `tanne_schnee_06`–`10` *Verschneite Tanne*. Diese Einteilung ist vom Nutzer frei gewählt, keine botanische Bestimmung. Die ursprünglichen Dateinamen und Sprite-IDs bleiben aus Kompatibilität erhalten. Die elf unbeschneiten `tanne_01`–`11` bleiben vorläufig Tannen und können später als Kiefern neu zugeordnet werden.

**Kapokbäume:** Die acht Bilder `tree_12`–`19` gehören zur Familie `jungle_trees` und erscheinen als normale Bäume auf Dschungel-Hexen. Ihre IDs wurden in `kapok_tree_12`–`kapok_tree_19` geändert; der frühere Journal-/API-Sonderstatus wurde entfernt.

**Als noch offen gelten unter anderem:** Schilf, Farn, Kakteen, Mangroven und deren Gruppen, Weide, Erle, markantes Totholz, größere Felsen und Eisblöcke. Klee, Moospolster, Alpengras sowie mehrere weitere Kleinstobjekte werden nicht mehr als Einzel-PNGs geplant. Für bereits hergestellte Varianten wie Thymian, Wacholder, Buschgruppe, Akazie, Palmen und Tannen gibt es keine unnötigen Doppelaufträge. Neue Dateinamen lassen sich gegebenenfalls auch über im Plan aufgeführte deutsche Aliasse zuordnen.

## Branch-Zusammenführung: FloraV2 als zusätzliche Referenz

Der frühere Branch `codex/flora-v2-asset-registry` wurde in `main` integriert. Seine 37 Pflanzenfamilien-Verzeichnisse und die FloraV2-Referenz mit 104 Kategorien sind im **FloraV2 – Pflanzenreferenz**-Panel durchsuchbar. Das ist **kein neuer Produktionsauftrag** und überschreibt weder den bestehenden Nature-Katalog (148 real vorhandene PNGs) noch die 17 tatsächlich offenen Spritearten. Die ursprüngliche FloraV2-Baumverteilung wurde **nicht** übernommen: Sie würde die neuere Wald-/Dschungel-Engine einschließlich der gewöhnlichen Kapokbäume ersetzen. Ihre Daten und die historischen Waldprofile stehen als Referenz zur Verfügung. Terrain-Seed-Werte sind informativ und überschreiben nicht die realen Geländezuweisungen.

Die 37 Ordner enthalten ausschließlich textliche `_ASSET_PLAN.md`-Referenzen, **keine PNG-Platzhalter**. Für die tatsächliche Erstellung neuer Sprites gilt allein die aktuelle Produktionsliste `plans/sprite_catalog_plan.json`.

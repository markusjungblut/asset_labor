# Grafik- und Metadatenworkflow (Asset-Labor v0.11.0)

1. Der bereinigte `plans/sprite_catalog_plan.json` enthält 17 offene Spritearten und 28 als `resolved` dokumentierte frühere Planposten. Die ehemalige Liste von 45 war keine Ist-Inventur: abweichende englische Dateinamen führten zu falscher Anzeige „0 von 45“. Fehlende Bilder existieren nicht als Platzhalterdateien.
2. Die vorhandenen 148 Nature-PNGs werden über `existing-asset-rules.js` eingeordnet. Die konkret vom Nutzer genannten Buschgrößen/-gruppen, zehn Schneenadelhölzer und acht Kapok-Journalbäume sind übernommen; sonstige Artzuordnungen bleiben Vorschläge. Bereits editierte Metadaten außerhalb dieser Gruppen wurden nicht pauschal überschrieben.
3. Die acht `tree_12.png` bis `tree_19.png` sind **Kapokbäume**. Ihre stabilen `journal_tree_*`-IDs und ihre bisherige nicht-spawnbare Journal-API-Rolle bleiben erhalten; die API liefert `species=kapok` und `family=jungle_trees`.
4. Das Terrain-Bestandsmanifest `plans/terrain_asset_plan.json` führt exakt 25 vom Nutzer benannte Quellfamilien mit 104 realen PNG-Dateien. Das früher vorhandene `mountain_01.png` ist im aktuellen Git-Bestand nicht mehr vorhanden. Bestehende technische Test-/Legacy-Typen werden aus Kompatibilitätsgründen nicht gelöscht.
5. Beim Einlesen werden Nature-/Terrain-Vorschläge **nur für Dateien ohne bestehenden Katalogeintrag** gemacht. Dateien mit ungültiger Geometrie erhalten keine Terrain-Zuweisung. Bearbeitete Benutzerkataloge dürfen niemals stillschweigend ersetzt werden.
6. Nature-Bestandsbilder sind bis zur manuellen Prüfung `candidate` und mit `needs_art_review` markiert. Diese dürfen ausschließlich auf der **Testkarte** automatisch verteilt werden, auch ohne `approved`. Die Produktionsfreigabe bleibt unverändert. Manuelle Testplatzierung ist weiterhin möglich; Journal-Spezialbäume bleiben vollständig gesperrt.
7. Waldboden ist ein Sonderfall: als Walduntergrund/Overlay innerhalb eines Basisbioms oder optional als Dschungel-Optik, nicht pauschal ein eigenständiges Biom. Es gibt **keine** automatische Umbenennung oder Festlegung zu Dschungel.
8. Änderungen an Benutzerkatalogen vor einem lokalen Update sichern. Automatische Speicherung erstellt `.bak`-Dateien. Die beiden realen Kataloge sind seit dem Nutzer-Commit vom 18.10.2026 bereits versioniert; neue Bilder erscheinen nach dem Entfernen der PNG-Ignore-Regeln im Git-Status und müssen explizit hinzugefügt/committed/gepusht werden.
9. Tests: `node tests/test_asset_inventory.cjs` prüft die 25 Terrainfamilien, 104 Zuordnungen, alle 148 Nature-Profile, Sonderbäume, Unicode-Namen und Bestandsschutz. Der synthetische Browsertest `python tests/test_v110_browser.py` benötigt Chromium/Playwright und Pillow.

**Bekannte offene QA-Punkte:** Bildabnahme der inzwischen grob eingeteilten 41 Büsche (insbesondere genaue Abstufung von Busch 20–29), finale Sichtprüfung der Palmen, Nadelbaum- und Schneevarianten sowie Schatten; der inzwischen einheitlich umbenannten `stormy_ocean_01` bis `_08`-Varianten; finale Silhouetten-, Größen- und Performance-Tests mit den echten PNGs. Bestehende Bilder und Referenzen werden nicht auf Verdacht umbenannt.

## Importbeispiele

- `assets/nature/marula_01.png`, `marulabaum1.png` oder `marula-baum_01.png`: bekannte Familie `savanna_trees`, Vorschlagsstatus `candidate`.
- `assets/nature/wacholder4.png` oder `wacholder_04.png`: bekannte Familie `conifers`, Objektklasse `shrub`.
- Ein unbekannter Name wie `dschungelbaum_a.png` erscheint nach **Neu einlesen** zwar in der Bibliothek, benötigt aber ausdrücklich Metadaten im Inspektor (oder eine neue Namensregel). Keine automatische Artbestimmung aus Bildpixeln.
- `palme_01`–`palme_05`: mittelgroß; `palme_06`–`palme_11`: groß. Gemeinsame bestehende Familie `palms` und explizite Größengruppen-Tags.
- Im Terminal nach neuen Dateien `git status`, `git add assets/nature/...`, `git commit`, `git push` ausführen. Git erkennt neue Bilder nicht automatisch auf dem Remote-Server. Wenn Änderungen an den Katalogen uncommitted sind, vor einem `git pull` zunächst sichern oder committen.

## Abgleich 45 → 17 (18.10.2026)

Unter `plans/sprite_catalog_plan.json` enthält `items` ausschließlich noch nicht umgesetzte Produktionsvorhaben; `resolved` hält die früheren 28 Posten einschließlich der ausdrücklich gestrichenen Bodendetails nachvollziehbar fest. Die Grafikbibliothek ist die Übersicht *vorhandener* PNGs; der Sprite-Planungskatalog zeigt *fehlende* PNG-Arten. Deutsche Alternativdateinamen werden als `aliases` akzeptiert. Im Viewer zählt der Plan die fehlenden und bereits gefundenen Dateien innerhalb dieser offenen Liste, statt anhand englischer Bildnamen den ganzen Bestand als fehlend auszuweisen.

## Wald- und Dschungelschicht (v0.12.0)

Waldklassen (`light_forest`, `dense_forest`) und ein ein Hex breiter Waldrand-Einfluss werden getrennt vom Terrain gespeichert. Der eigene Biomtyp `jungle` benötigt keine neue PNG; in der Testkarte kann vorhandener Waldboden vorläufig als **visuelles** Material dienen. Im Nature-Bereich unter **Wälder & Dschungel** Waldanteil, Waldrandstärke, manuelle Hexregeln und Dschungelgebiete einstellen und anschließend die Natur verteilen. Szenenexport und -import erhalten `forest` samt Seed, Overrides und Dschungelhexen; zusätzlich wird `forestByHex` mit den fertigen Ergebnissen exportiert. Siehe [FOREST_SYSTEM.md](FOREST_SYSTEM.md).

**Tests:** `node tests/test_forest.cjs`, `node tests/test_forest_integration.cjs` und `python tests/test_v110_browser.py`. Die Hauptspiel-Generierung liegt außerhalb dieses Repositories und wird nicht stillschweigend geändert.

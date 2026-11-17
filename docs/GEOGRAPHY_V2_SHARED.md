# Gemeinsame Weltgenerierung v2.1.1 – Festlegungen und Grenzen (17.11.2026)

**Neuer Asset-Labor-Teststand `geography-v2.1.1`**: Die Anpassung wird ausschließlich für neu berechnete Geografien verwendet. Vorhandene Welt-Snapshots bleiben unverändert. Der alte produktive Generator im Spiel (`domain/worldgen`) wird nicht umgestellt. Hinweis: Die früher dokumentierte kanonische Datei `browsergame/public/worldgen-geography.js` ist im aktuellen `browsergame`-Repository nicht mehr vorhanden; diese Änderung liegt daher zunächst nur im `asset_labor`-Repository vor.

## Korrektur v2.1.1: Kälte, Sandwüste und Auswertung

- **Gefrorene Tundra:** Der bisherige feste Grenzwert `temperature < 0.14` lag bei der Standardkonfiguration (`0.57 ± 0.43`) außerhalb des erreichbaren Bereichs. Die Grenze liegt nun bei `biomes.coldBoundary - 0.04` und erzeugt regulär `frozen_tundra` (bei erhöhter Feuchtigkeit weiterhin `snowfields`).
- **Sandwüste:** Der reguläre Katalogtyp `sandy_desert` fehlte in der gewichteten ariden Auswahl. Er erhält `geology.aridSandyDesert` (Standard: 14) als einstellbares Gewicht neben den übrigen Wüstentypen. Weder Testterrain noch Wald-Overlay werden in die normale Grundterrain-Auswahl aufgenommen.
- **Live-Statistik:** Im Geografie-Labor werden alle regulären Grundterrain-IDs und alle sechs Biomfamilien mit ihrer aktuellen Hexzahl gezeigt, einschließlich Nullwerten. Eine Mehrfachanalyse über 2–40 andere Seeds bei gleicher Konfiguration berechnet Durchschnitt pro Welt, mittleren Flächenanteil und Anzahl der Welten mit Vorkommen. Gezählt wird ausschließlich über die `stats`-Objekte, nicht über im Arbeitsspeicher aufbewahrte Karten; die Auswertung wird für die aktuellen Parameter lokal zwischengespeichert und kann als JSON exportiert werden. Ändern sich Seed, Größe, Ursprung oder Parameter, wird die alte Auswertung nicht als aktuell ausgegeben.
- **Versionierung:** Das Generator-Seed enthält die Version; daher heißen veränderte neue Welten `geography-v2.1.1`. Alte v2.0-/v2.1.0-Presets können nach ausdrücklicher Bestätigung für neue Generierungen übernommen werden; bestehende Welt-JSONs werden nicht unbemerkt überschrieben.

## Korrigierte Regeln

## Korrigierte Regeln

- **Kein Karten-Norden als Klimavorgabe:** Der Regler `climate.latitudeCooling` wurde entfernt. Temperatur entsteht aus ortsfesten Klimafeldern, ohne Bezug zu oberen/unteren Vorschaugrenzen.
- **Erweiterbarkeit in alle Richtungen:** Alle Land-/Wasser-, Relief-, Temperatur-, Biom-, Wald-, Ressourcentier- und Flussdaten folgen absoluten Hexkoordinaten `(q,r)`, Seed, Konfiguration und Generatorversion. Ein geänderter Vorschaubereich (`width`, `height`, `originQ`, `originR`) beeinflusst die gleichen bereits existierenden Hexe nicht. Die globale Wasser-/Berg-/Hügelverteilung verwendet eine fixe statistische Stichprobe über Weltkoordinaten statt einer Rangliste der aktuellen Karte.
- **Land/Wasser-Ziel:** Standardmäßig etwa 75 % Land und 25 % Wasser **im statistischen Mittel**. Einzelne zusammenhängende Ausschnitte dürfen abweichen. Der Standardmaßstab der Wasserkörper wurde auf 18 gesetzt und mit einem weiteren mittleren Noise-Feld kombiniert, um extreme lokale Abweichungen zu verringern.
- **Binnengewässer korrigiert:** `water.lakeInfluence` kann nun nur Wasser hinzufügen, nicht bestehendes Wasser entfernen; die globale Wasserquote wird beim Ändern der Seenstärke nicht wieder auf den alten Anteil zurückgenormt.
- **Küstenwasser:** Jedes Wasserhex mit wenigstens einem Landnachbarn ist `coastal_water` – auch dann, wenn dieser Nachbar außerhalb des aktuell sichtbaren Ausschnitts liegt. `ocean`, `icy_ocean` und `stormy_ocean` berühren nie unmittelbar Land.
- **Stürmischer Ozean ist ein DAUERHAFTER Terrain-Typ.** Es wurde weder dynamisches Wetter hinzugefügt noch vorgeschlagen, die bereits festgelegten Wassertexturen umzubenennen.
- **Relief:** Ausschließlich `flat`, `hills`, `mountain`; die unveränderlichen Berge können als Gebirgsregionen auftreten. `highland` ist ein Texturuntertyp im kalten, markant reliefierten Gebiet, keine vierte Reliefklasse.
- **Flüsse sind auf HEXKANTEN, nicht in Hexmitten.** Die `riverPaths` sind ausschließlich ein axialer Nachbarschaftsgraph, der bestehende Renderer `river.js` erzeugt die Wassergeometrie entlang gemeinsamer Hexseiten/-ecken. Die neue Übersichtskarte zeichnet ebenfalls entlang dieser Kanten, auch bei Flussläufen über Vorschaugrenzen hinaus (`riverPreviewPaths`). Die Engine setzt `riverGeometry: "hex-edges"`. Noch keine vollständige physikalische Wassereinzugsgebietsberechnung.
- **Waldstatistik auf der Karte:** Ein permanenter Zähler zeigt **tatsächliche bewaldete Landhex-Prozent** und Prozent geeigneter Landhexe, unabhängig von der Position des Waldreglers. Die Ansicht `Wälder` färbt jede lichte/dichte Waldfläche. Die Bewaldung bleibt Overlay und ändert nicht das Grundbiom.
- **Ein gemeinsamer Tierregler:** `features.animalsPer1000` steuert alle Tierhexe zusammen. `features.horseShare` wurde entfernt; Tierarten (vorläufig Pferde/Schweine) werden anhand des Habitats verteilt. Zukünftige Tierarten sind vorgesehen.
- **Weitere Regler:** Die Geografie-Oberfläche generiert weiterhin ihre Regler aus dem Schema der Engine; derzeit 59. Regionale Biomgrößen ~30–90 Hex bleiben erste Testziele. Geologische Terrain-Untertypen bleiben konfigurierbar.

## Welt vorab erzeugen, spätere Erweiterung

Der Start-Spielbereich muss vor einer Freigabe fertig generiert sein. `browsergame` kann einen versionierten geografischen **Datei-Snapshot** vorab erstellen:

```bash
npm run worldgen:v2:build -- --seed vedras --width 120 --height 100 --origin-q 0 --origin-r 0 --out output/welt-v21.json
```

Der Export enthält explizite Weltkoordinaten, den Generatorstand und einen SHA-256-Prüfwert. Bereits festgeschriebene Bereiche bleiben auch nach Versionsupdates unverändert. **Später noch nicht generierte Gebiete sollen ausdrücklich mit neuen, festgelegten Generatorversionen erzeugt werden dürfen**, um zusätzliche Objekte und Terrains zu ermöglichen. Eine persistente sektorbasierte Datenbank-/Versionsverwaltung und die tatsächliche Startfreigabe im Gameplay sind allerdings **noch nicht implementiert**; die Datei ist ein Vorbereitungsartefakt, keine laufende Spielwelt.

## V2.0-Speicherdateien und Vorschau

Im Geografie-Labor gibt es Regler für absolute Weltursprünge `originQ` und `originR`. Parametereinstellungen werden versioniert exportiert; Dateien aus `geography-v2.0.0` werden nur nach ausdrücklicher Zustimmung in eine **neu generierte v2.1-Landschaft** übertragen, nicht stillschweigend migriert. Das Asset-Labor akzeptiert über **Geografie-JSON importieren** auch vollständige Welt-JSONs und erstellt nach Bestätigung einen Testausschnitt mit den bestehenden Terrain-PNGs. Bei kleinen 7–397-Hex-Testszenen lassen sich nur vollständig enthaltene Routen im existierenden Edge-Renderer übernehmen; der größere Geografie-Labor-Ausschnitt zeichnet auch von außerhalb einlaufende Kantenrouten.

## Qualitätssicherung und Grenzen

`node tests/test_geography_v2.cjs` läuft in beiden Repositories und prüft Seed-Reproduzierbarkeit, invariant bleibende Hexdaten bei 40×40 → 70×70 und Ursprungverschiebung, Küstenregel, fortlaufende Flussnachbarschaft, Wasser-/Seen-Monotonie, Waldanzeige und an Biome angepasste Tierhexarten.

Noch ausstehend sind eine lokale grafische Browserabnahme mit Original-PNGs, hydrologische Wassereinzugsgebiete, langfristige Versiegelung von Produktionssektoren, Gameplay-Synchronisierung, Speicheroptimierung für sehr große Welten und ein Balance-Test mit vielen Seeds. Alle Original-PNGs und Katalogdateien bleiben unverändert.

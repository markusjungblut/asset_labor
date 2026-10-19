# Wald- und Dschungelsystem v0.12.0

## Verbindliche Trennung: Untergrund, Biom und Bewaldung

**Dschungel** ist ein eigenständiges logisches Biom `jungle` in der Terrainkategorie `warm_regions`. Es ist kein Ersatzname für die Textur `wald_01.png`. Bis eine eigene Jungle-Bodengrafik vorhanden ist, darf das Asset-Labor auf bereits vorhandenen Waldboden `forest_floor` als **rein visuelle Textur** zurückfallen. Das logische Biom bleibt dabei `jungle`.

**Lichter Wald** (`light_forest`) und **dichter Wald** (`dense_forest`) sind zusätzliche Vegetationsklassen. Sie können auf mehreren Grundbiomen liegen: Gras-/Weideland, feuchtes Gelände, warme und kalte Landregionen, teilweise trockene Landregionen. Ein Wald-Hex verändert nicht automatisch seine Terrainart oder seine gespeicherte Terrain-PNG. Offene Wasserflächen und explizite Ufermaterialien sind ausgeschlossen.

**Waldrand** ist kein eigenes Grundbiom: Ein Hex neben dichtem Wald erhält einen zusätzlichen, gedämpften `edgeInfluence`, auch wenn seine eigene `forestClass` `none` bleibt. Der Übergang reicht genau einen Hexring weit und überschreibt keine manuell freigehaltenen Hexfelder.

## Technische Module

- `forest.js`: reine, deterministische Berechnung von zusammenhängenden Waldgebieten, Biomverträglichkeit, `forestClass`, `baseDensity`, `edgeInfluence`, `density`, Jungle-Flags und einer Baumquote. Keine DOM-Abhängigkeit und keine Bildproduktion.
- `app.js`: Bewaldung als eigener Zustand `state.forest`, Visualisierung über den Debug-Schalter, getrennte Textur- und Biomauflösung, persistente Einstellungen, Szenenimport und -export.
- `forest-ui.js`: Waldanteil, Rand-Auslauf, manuelle Waldklassen, automatische Rücksetzung sowie Dschungel-Testgebiete.
- `nature-ui.js`: Sprite-Auswahl nach bestehenden Gelände-/Biomeignungen aus dem Nature-Katalog. Wald-Hexe setzen zuerst mehr Bäume, lichte Waldhex weniger; danach passende Sträucher und Bodenobjekte. Nachbarhexe mit Waldrand-Einfluss erhalten zusätzliche einzelne Bäume. Schatten und Anker der bestehenden Sprites bleiben erhalten.

Ein fixer Seed sorgt dafür, dass Waldkerne, Randwirkung und Sprite-Positionen reproduzierbar sind. Die Waldregeln funktionieren ohne Sonderbilder; die Größe einer Waldfläche hängt von `coverage` und der Klimaeignung ab. Manuelle Hexmarkierungen (`none`, `light_forest`, `dense_forest`) haben Vorrang vor zufälligen Waldkernen. Die Testfunktion für Dschungel markiert das ausgewählte Land-Hex und bis zu sechs direkte Landnachbarn.

## Bedienung im Asset-Labor

1. Testkarte öffnen, unter **Natur auf Karte verteilen → Wälder & Dschungel** den Waldgenerator aktivieren.
2. **Waldanteil** und **Waldrand-Auslauf** einstellen. Die optionale farbige Debug-Anzeige zeigt Waldklassen und Dschungelbiome ohne zusätzliche PNGs.
3. **Wald und Natur auf Testkarte neu verteilen** erzeugt die bewaldete Szene. Die reguläre Schaltfläche **Natur verteilen** verwendet dieselben Waldregeln.
4. Ein Hex wählen und mit **Lichter Wald**, **Dichter Wald**, **Freifläche** oder **Wieder automatisch** seinen Waldstatus festlegen. Bei manueller Freifläche entfallen Waldbaum-Spawn und Waldrand-Einfluss; Sträucher bleiben unabhängig davon grundsätzlich möglich.
5. **Dschungelgebiet (bis 7 Hexe) erzeugen** wechselt das logische Biom für die ausgewählten Land-Hexe und triggert die Natur-Neuverteilung. **Dschungelmarkierungen entfernen** stellt den vorherigen Geländetyp wieder her.

**Hinweis zum Labor:** Die Neubepflanzung durch den Nature-Verteilungsbutton ersetzt, wie schon zuvor, die aktuell vorhandenen automatisch/manuell platzierten Nature-Instanzen der Testszene. Individuelle Grafik-Metadaten werden nicht geändert. Die Einstellung `candidate` bleibt eine Produktionsprüfung, schließt aber eine Testverteilung nicht aus.

## Datenformat und Kompatibilität

`state.forest` (auch in `vedras_scene.json`):

```json
{
  "enabled": true,
  "seed": 12345,
  "coverage": 0.38,
  "edgeStrength": 0.72,
  "debug": false,
  "overrides": {"0,0": "dense_forest", "1,0": "none"},
  "jungleHexes": {"-1,1": true}
}
```

`forestByHex` im Szenenexport enthält die berechnete `biome`, `forestClass`, `density`, `edgeInfluence` und `jungle`-Kennzeichnung pro Hex. Alte Szenen ohne diese Daten bleiben kompatibel und verwenden Standardwerte für `state.forest`. Die früheren `terrainByHex`- und `terrainByBiome`-Zuordnungen werden nicht geändert.

## Bestehende Vegetation

- Laubbäume und Nadelhölzer erscheinen nur auf kompatiblen Terrainarten, z. B. `grassland` oder `snowfields`.
- Auf `jungle` nutzt die Engine derzeit passende warme Nature-Sprites wie die vorhandenen Palmen. Savannenbäume werden nicht automatisch in geschlossene Dschungel gepflanzt.
- Die acht `tree_12.png` bis `tree_19.png` sind **reguläre Kapokbäume** (`kind=tree`, `family=jungle_trees`, IDs `kapok_tree_12` bis `kapok_tree_19`). Sie dürfen im Dschungel manuell und automatisch platziert werden; die irrtümlich eingeführte Journal-API und deren Sperren sind entfernt.
- Nicht zugeordnete Arten werden nicht zufällig als Wald- oder Dschungelbaum eingesetzt.

## Tests und Grenzen

`node tests/test_forest.cjs`: deterministische Waldkerne, `light_forest`/`dense_forest`, einen Ring Waldrand, manuelle Overrides, Jungle und Wassersperren.

`node tests/test_forest_integration.cjs`: reale Nature-Familien und Biomverträglichkeit, Baumquote, echte Kapokbäume und Export/UI-Verknüpfung.

`python tests/test_v110_browser.py`: Browser-Test für die 37-Hex-Szene, Wald-Eingriffe und Dschungelerzeugung (benötigt Playwright, Chromium und Pillow).

**Nicht Bestandteil dieser Änderung:** Die tatsächliche Spielwelt-Generierung des separaten Hauptspiel-Repositories und großflächige Weltkarten-Performance. `forest.js` und das exportierte `forestByHex` liefern die Basis dafür. Die visuelle Feinabstimmung der Höhen, Baumschatten und Biomenge bleibt erforderlich.

## Neue Nature-Arten, 19.10.2026

Vier Weiden und vier Erlen werden als Ufer- bzw. Feuchtgebietsbäume (`riparian_trees`) geführt. Tundra-Zwergsträucher (`cold_bushes`) wachsen nur auf Tundra-, gefrorenen Tundra- oder Hochland-Terrain. Schilf (`reeds`) gehört zu Feuchtgebieten und nicht auf Ozeanflächen; Sukkulenten (`succulents`) zu ariden Biomen und Savannen. Baumstümpfe (`deadwood`) sind vereinzelte Waldbodenobjekte und werden nicht als lebende Bäume gezählt. Marula zählt zu Savannenbäumen; drei zusätzliche Wacholder sind Nadelgehölze. Alle sind normale `candidate`-Sprites. Normale Kapokbäume und der eigenständige Dschungel bleiben unverändert.


## Block 1 – verbindliche Grundbiom-/Wald-Architektur (19.10.2026)

* **Grundbiom (`baseBiomeOf`)**: wird aus einem ausdrücklich zugewiesenen Terrain-Typ, andernfalls aus dem ursprünglichen Kartenbiom abgeleitet. `forest_floor` ist ausschließlich Bodengrafik. Die Demo-Vorlage `forest_floor` erhält als neutrales Ursprungsbiom `grassland`; vorhandene Moor-/Hochlandtypen gehen nicht verloren.
* **Wald-Overlay (`forestCells`)**: `light_forest`, `dense_forest` und Waldrand überlagern unabhängig den Grundtyp. Damit ist z. B. **Moor + dichter Wald** erlaubt, aber kein Dschungel auf Moor. Waldgenerierung bleibt deterministisch und wird nach Eingaben zwischengespeichert.
* **Bodendarstellung (`drawForestFloor`)**: eine `wald_*.png` wird mit einer radial auslaufenden Alphamaske unter der Vegetation, aber über dem ursprünglichen Terrain gezeichnet. Die Stärke ist im Feuchtgebiet niedriger; Schneefelder und gefrorene Tundra erhalten keinen grünen Waldboden. Auch eine manuell zugewiesene Waldboden-PNG ersetzt nicht die Basistextur.
* **Dschungel**: darf nur über `savanna` oder bereits als `jungle` ausgewiesenen warmen Boden gelegt werden. Alte Dschungelmarker auf Moor/Wasser bleiben wirkungslos, statt einen neuen Klimatyp zu erfinden.
* **Habitatentscheidung (`VedrasNatureCatalog.canPlace`)**: prüft mit derselben Funktion in Generierung, manueller Platzierung, Darstellung und Cleanup den echten Untergrund, ein mögliches Dschungelbiom, die Waldklasse, den Nature-Katalog sowie erforderliche Nachbarn. **Palmen nur in Savanne/Dschungel**, unabhängig vom Wald-Overlay; Kakteen/Sukkulenten/trockene Büsche nicht in geschlossenen Wäldern; Mangroven mit Landanker und passenden Feucht-/Uferbedingungen.
* **Szenenhaltung**: `baseBiomeByHex` wird exportiert/importiert, ohne ältere Szenen zu brechen. Ungültige Nature-Instanzen und ältere direkte Nature-Hexzuweisungen werden bei Katalog-, Terrain-, Fluss- und Waldänderungen bereinigt. Noch fehlende Assets werden nicht blind gelöscht. Manuell hinzugefügte gültige Sprites tragen `source:'manual'` und werden bei Waldneuverteilung erhalten. Ein vollständiger Szenenreset entfernt vorhandene Nature-Instanzen.
* **Terrainkatalog**: `forest_floor` liegt unter **Wald- und Vegetationsboden**, nicht mehr unter **Weitere Testgelände**. Keine neuen Pflanzen-Sprites sind dadurch erforderlich.

Tests: `node tests/test_block1_forest_habitats.cjs` sowie die bestehenden Wald-, Inventar-, Flora- und Fluss-Habitat-Regressionen.

**Grenzen**: Dies ist das Asset-Labor, noch nicht der Gelände-/Waldgenerator im separaten Hauptspiel. Eine echte kombinierte Klima-/Temperatur-/Brackwasserkarte für Mangroven existiert nicht. Browserseitige visuelle Kontrolle des weichen Waldbodens bei aktiviertem Relief bleibt sinnvoll.


## Block 2 – Nature-Balancing und Bauflächen (19.10.2026)

Die 258 PNGs sowie ihre einzeln editierbaren Kataloggrößen bleiben unverändert.
`nature-balance.js` reduziert die **sichtbare** Größe von generierten, manuell platzierten
und in älteren Szenen gespeicherten Nature-Instanzen zentral. Dadurch wird beim
Ändern eines Katalogmaßes weiterhin die tatsächliche individuelle Größe verändert.

| Grafiktyp | Laufzeitmaßstab gegenüber bisher | Ziel |
|---|---:|---|
| große lebende Bäume | 79 % | weniger dominant, Raum für Bauten |
| mittelgroße lebende Bäume | 81 % | ähnliche Proportionen |
| riesige Bäume/Kapok | 73 % | große Silhouette, aber platzsparender |
| tote Bäume und verschneite tote Bäume | **58 %** | keine unbeabsichtigten Landmarken |
| liegende Baumstämme, auch verschneit | 71 % | niedrigere bodennahe Hindernisse |
| mittelgroße Büsche | 81 % | Boden und Bauplätze sichtbar |
| Baumstümpfe | 72 % | zurückhaltende Dekoration |
| andere Buschgruppen | 82 % | lockere Untervegetation |

Die Quoten der **lebenden** Waldkronen wurden angepasst: `dense_forest` 5→3,
`light_forest` 3→2 und der Waldrand zu meist 0–1 lebenden Bäumen.
Zudem sinkt die Gesamtzahl möglicher Nature-Objekte pro Hex (dicht 9→5, licht 7→4).
**Tote Bäume zählen nicht zur lebenden Baumquote.** Sie und liegende Stämme
werden als sehr seltene Hintergrundobjekte verteilt und zusätzlich pro Karte
gedeckelt: maximal `floor(Landhexe / 16)` automatisch generierte tote
Bäume beziehungsweise `floor(Landhexe / 15)` liegende Stämme, mindestens
jeweils 1, alle Schneevarianten mitgerechnet. Manuelle Sonderplatzierungen
sind davon ausgenommen.

Mit konstantem Seed bleiben ungefähr **18 %** der verfügbaren Landhexe
als benachbarte, zusammenhängende **Freiflächen/Baubereiche** ohne automatisch
generierte Nature-Sprites. Wasser, vorhandene Objekte und Berge zählen dafür
nicht als Baufläche. Gebäude sperren darüber hinaus das eigene Hex sowie
eine artabhängige Bodenzone (Bäume ca. 126, liegende Stämme ca. 118,
kleine Objekte ca. 96 logische Welteinheiten). Altinstanzen werden dagegen
validiert; explizit manuell hinzugefügte Nature-Sprites dürfen bewusst auch
auf einer sonst freigehaltenen Lichtung stehen.

Die Lichtungsreservierung ist **keine spätere Gebäudeplatzierungs-API**.
Die Gebäude- und Bauvorschriften des Hauptspiels werden erst bei dessen
Integration verbindlich. Bestehende Fluss- und Klimaregeln bleiben erhalten.

Regression: `node tests/test_block2_nature_balance.cjs` zusätzlich zu den
Wald-, Habitat- und Inventar-Tests.

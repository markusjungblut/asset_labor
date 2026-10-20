# Geografie-Engine v2 – gemeinsamer Vorab-Weltgenerator (20.10.2026)

## Status, Schnittstelle, Invarianten

**Zwei Repositories, eine identische Berechnung:** Kanonische Datei `browsergame/public/worldgen-geography.js`, Byte-identischer Spiegel `asset_labor/worldgen-geography.js`. Beide benutzen `VedrasGeography.VERSION = geography-v2.0.0` und `generateWorld(seed,{width,height,config})`. Kein Aufruf verwendet Assets, Datenbanken oder `Math.random`. Der vollständige Hexbereich wird **vor Freigabe einer Welt** generiert, statt die Welt erst beim Login des ersten Spielers festzulegen.

**Achtung:** Der bisherige M01/M10-Spielweltgenerator (`domain/worldgen`) und bestehende lebende Spielwelten bleiben unverändert. Die neue Engine ist ein **versionierter Kandidat für spätere Weltinitialisierung**, keine heimliche Änderung der heutigen Gameplay-Welt. Die eigentliche Datenbank-/Gameplay-Snapshot-Einbindung, Startspielerfreigabe und vollständige Renderer-Übernahme erfordern eine ausdrückliche Folgeabnahme.

### Weltbau-Pipeline

1. Kontinuierliche großräumige Wasserfelder plus Küstendetail und Binnengewässer-Einfluss bilden; Land-/Wasser-Anteil auf die endliche Zielkarte quantilbasiert einstellen.
2. Jedes Wasserhex, das mindestens eines der sechs **tatsächlich erzeugten** Landhexe berührt, ist `coastal_water`. Nur anderes Wasser darf `ocean`, `icy_ocean` oder `stormy_ocean` sein. Keine Ozean-Land-Kontakte. Ausnahmen später ausschließlich über eine explizite, versionierte Regel.
3. Klima aus räumlich korrelierten Temperatur-/Feuchtefeldern, Abkühlung zu Kartenrändern und Feuchteeinfluss von Wasser generieren.
4. Unregelmäßige, seedbasierte Voronoi-Biomkerne mit standardmäßig ca. 60 Hexfeldern; Zielparameter 30–90 zunächst testen. Identische benachbarte Kerne dürfen zu größeren Regionen verschmelzen. Das ist eine Zielgröße, **keine harte Maximalgröße zusammenhängender gleichfarbiger Flächen**.
5. Innerhalb passender Biomfamilien konkrete Terrain-IDs nach geologisch korreliertem Bodenfeld auswählen. Die Gewichte der acht trockenen Wüstenuntertypen sind individuell einstellbar; Halbwüste ist eine Übergangsform. Kein zufälliger Fremdboden mitten in anderer Klimazone.
6. Drei logische Reliefklassen `flat`, `hills`, `mountain`. Hügel speichern optional `hillProfile` und `hillStrength`; Berge sind logische, nicht passierbare Naturflächen (ein visueller Sprite-Überhang blockiert **keine** Nachbarhexe). Keine Klasse `mountain_peak`.
7. Zusammenhängende Waldgruppen als Overlay über dem Terrain und getrennte `light_forest`/`dense_forest`-Eigenschaften. Dschungel bleibt logisches Biom `jungle`; das Asset-Labor verwendet wie bisher `wald_*.png` als visuellen `forest_floor`-Fallback.
8. Nach Wassererzeugung gerichtete Flussrouten aus geeigneten Landquellen bis zu echten Wasserhexen; jede Verbindung folgt zwei benachbarten Hexfeldern. Noch **keine** vollwertige physikalische Abflusssimulation oder zusammengeführte Einzugsgebietsberechnung.
9. Deterministische, habitatgeprüfte Testplätze für Eisen, Pferde, Schweine, Ruinen, Wracks, Oasen und Obelisken. Diese geografischen Vorkommen **sind noch keine implementierten Gameplayfunktionen**; Gameplayzustand (Abbau, Nutzung, Erkundung) bleibt separat.

### Vorhandene Terrain-IDs

Geografisch generierbare Landmaterialien (grafische `forest_floor`-Alternative für Dschungel gesondert):
`frozen_tundra`, `tundra`, `snowfields`, `highland`, `grassland`, `pasture`,
`sparse_pasture`, `savanna`, `jungle`, `moor`, `marshland`, `swamp`,
`semi_desert`, `rocky_desert`, `sandy_rocky_desert`, `desert`, `clay_desert`,
`badlands`, `sandy_badlands`, `rocky_badlands`, `wasteland`.

Wassermaterialien:
`coastal_water`, `ocean`, `icy_ocean`, `stormy_ocean`.

Alte `coast`-Wasser-Aliasbezeichnungen und `sandy_desert` ohne katalogisierte PNGs werden nicht neu ausgegeben. `forest_floor`, `hilly_ground` und `mountain_ground` sind keine ökologischen Grundbiome.

### Editieren, Prüfen, Exportieren

- **Asset-Labor:** Schaltfläche **Geografie-Labor** in der Haupttoolbar öffnet `geography-lab.html` in einem zweiten Tab. Automatisch aus der Parameterdefinition erzeugte, gruppierte Regler ermöglichen Änderungen sämtlicher **registrierter** Worldgen-Einstellungen, ohne UI-Code für jedes neue Feld. Mehrere Kartenansichten, Weltseed, Größe, Einzelhex-Inspector, Statistik, Parameter-JSON-Import/-Export und Welt-JSON-Export sind vorhanden.
- **Vorhandene Terrain-PNGs prüfen:** Auf **Kartenausschnitt an geöffnetes Asset-Labor senden** klicken, im Asset-Labor die Überschreibung der reinen Testszene bestätigen. Die geografischen Terrain-IDs wählen vorhandene Materialgrafiken. Die Bibliothek, Terrain-/Nature-Katalogdateien und Original-PNGs bleiben unverändert. Die Szene stellt nur einen Ausschnitt (7–397 Hexe) dar; automatische Bergsprite-/Fundortsprite-Platzierung und die exakte Darstellung jedes berechneten Hügelprofils sind separate ausstehende Rendererarbeiten.
- **Browsergame:** `/dev/worldgen` verlinkt das eigenständige `/geography-lab.html`. Noch keine automatische Gameplay-Umstellung.
- **Vorab-Snapshot erzeugen:** Im Spiel-Repository:
  `npm run worldgen:v2:build -- --config vedras-worldgen-parameter.json --out output/vedras-welt-v2.json`.
  Alternativ `--seed`, `--width`, `--height`; bestehende Zieldateien werden ohne explizites `--force` nicht überschrieben. JSON enthält vollständige Geografie, Flussrouten, Generatorversion und SHA-256-Prüfsumme. Dies erzeugt eine **Datei**, keine Datenbankeinträge, und schaltet keine Spieler frei.
- **Erweiterbarkeit:** `registerParameter({id:'extension.<bereich>.<wert>',group,label,defaultValue,min,max,step,help})` meldet neue Regler an, ohne die Bedienelemente manuell anzulegen; `registerFeature({id:'extension.<name>',place({hex,config,seed,random})})` fügt eine zukünftige geografische Featureklasse hinzu. Module müssen **vor** `geography-lab.js` geladen werden. Jede Änderung mit Auswirkungen auf veröffentlichte Welten benötigt eine neue Generatorversion.
- Änderungen an den genannten Parameterwerten ändern nur die **nächste ausdrücklich generierte** Welt. Der laufende Spielbetrieb darf durch Regleränderungen nicht nachträglich geografisch verändert werden.

### Test und Qualitätsgrenzen

In **beiden** Repositories: `node tests/test_geography_v2.cjs`.
Schutz gegen nichtdeterministische Seedresultate, Küsten-Ozean-Kontakte, unbeabsichtigte Wasserquoten, ungültige Reliefklassen, nicht verbundene Flussrouten, ungeeignete Test-Fundorte und fehlende Erweiterungsregistrierung. Der Shared-Engine-Quelltext muss zwischen beiden Repositories **Byte für Byte übereinstimmen**.

**Vor Spielwelt-Freigabe offen:** globale Hydrologie mit echten Einzugsgebieten, semantisch durchgängige Bergketten und ihre Objektgrafik, Ressourcen-/Tiersystem, geeignete PvP-Starts, Datenbankimport, Spawn-Gate, Mehrseed-Statistik, automatische Prüfung zusammenhängender Landflächen und visuelle Abnahme mit Originalgrafiken auf großen Karten. Ergebnisse aus dem Asset-Labor sind **keine** automatische produktive Worldgen-Freigabe.

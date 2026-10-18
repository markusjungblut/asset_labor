# Vedras Reiche – Nature-Sprite-Vertrag (Asset-Labor v0.9.1)

**Stand: 13. Oktober 2026.** Verbindlicher technischer Testvertrag für Nature-Sprites. Der Weltgenerator mit 30 × 30 Hexen ist ein **Folgeschritt**, nicht Bestandteil von v0.9.0.

## Grundsatz

Jeder Busch, Baum, Stein, Stumpf, Kaktus oder sonstige Gegenstand ist **ein einzelnes freigestelltes Sprite**. Es enthält keine gemalten Hexseiten, keine Gras-/Sand-/Schnee-Bodenplatte und keine fest eingebauten Straßen oder Flüsse. Licht von rechts, unveränderlicher Kamerawinkel, unverzerrte Grafik. Terrain-Grundmaterial, Nature-Sprite und dessen Schatten sind unabhängig austauschbar.

Die Referenzgrafik (z. B. `Büsche1.jpg`) darf mehrere Objekte enthalten. Sie dient nur als Vorlage. Das Asset-Labor lädt **einzeln exportierte Bilder**; ein Übersichtsbogen ist nicht automatisch ein freigestelltes Einzelasset. Referenzname und ggf. Bildposition werden in `sourceReference` dokumentiert.

## Import neuer Produktionsassets

Für jedes künftige Sprite-Paket:

1. Transparentes PNG oder WebP unter `assets/nature/<dateiname>.png` ablegen.
2. Eine gleichnamige `<dateiname>.json`-Datei mit vollständigem Metadatenobjekt ablegen. Das Asset-Labor akzeptiert entweder das reine Objekt oder das mit **„Sidecar-JSON exportieren“** erzeugte Paketformat `{ "assetType": "nature_sprite", "relPath": "nature/dateiname.png", "data": {...} }`.
3. In `assets/terrain/terrain_catalog.json` muss die Geländeart bereits vorhanden sein (ggf. zuerst im Terrain-Katalog erstellen). `allowedTerrainTypes` verwendet **Geländearten-IDs**, nie die grobe Gelände-Kategorie.
4. Im lokalen Labor **„Neu einlesen“** drücken: neue, valide Sidecars werden übernommen, **bereits manuell bearbeitete Daten werden nicht überschrieben**. Fehlende/ungültige Metadaten bleiben editierbar, aber werden nicht still zum Grasland-Sprite gemacht.
5. Freistellung, Silhouette, Größe und Schatten auf 7/19 Hexen begutachten, Varianten innerhalb derselben Familie vergleichen. Status `approved` erst nach manueller Qualitätskontrolle setzen.

Alternativ: Bild ohne Sidecar importieren und die Felder im rechten **Nature-Sprite-Inspektor** ausfüllen, danach „Sprite-Metadaten speichern“ klicken. Im Python-Servermodus werden Änderungen automatisch unter `assets/nature/nature_catalog.json` persistent gespeichert; die vorherige Datei bleibt als `.bak` verfügbar. Bei geöffnetem HTML ohne Server: **Nature-Katalog exportieren** und von Hand sichern. Terrain-Katalog und Nature-Katalog sind eigenständig.

## Datenmodell (verbindliche Felder)

```json
{
  "id": "bush_temperate_soft_01",
  "description": "Locker gewachsener, kleiner, hellgrüner Busch",
  "sourceReference": "Büsche1.jpg – untere Reihe, links",
  "family": "temperate_bushes",
  "kind": "shrub",
  "sizeClass": "small",
  "logicalWidth": 50,
  "scaleMin": 0.85,
  "scaleMax": 1.15,
  "anchor": { "x": 0.50, "y": 0.96 },
  "shadow": { "mode": "generic_small_round", "path": "" },
  "allowedTerrainTypes": ["grassland", "pasture", "sparse_pasture"],
  "placement": {
    "weight": 1,
    "density": 0.25,
    "minSpacing": 30,
    "canCluster": true,
    "edgeMargin": 10
  },
  "artStatus": "candidate",
  "tags": ["temperate", "green"]
}
```

**Klassen:** `ground_cover`, `shrub`, `cluster`, `tree`, `rock`, `special`. **Familien:** frei neu anlegbare Slugs; z. B. `temperate_bushes`, `cold_shrubs`, `savanna_trees`, `mangroves`, `desert_cacti`, `rocks`. **Größen:** `tiny`, `small`, `medium`, `large`, `giant`.

**Varianten-ID:** stabil und innerhalb aller Nature-Sprites eindeutig. **Breite:** logische Welteinheiten für das Sprite, **nicht** eine neue Hexbreite. `scaleMin`/`scaleMax` sind nur kleine **Instanzabweichungen**. `anchor` ist das **Bildkoordinatenverhältnis** des Bodenkontakts (0..1). Anker und Instanzposition sind ausdrücklich **verschiedene Größen**.

**Shadows:** `none`, `generic_small_round`, `generic_small_wide`, `generic_medium_round`, `generic_medium_wide`, `custom`. Die ersten vier sind **transparente Testschatten** aus `assets/shadows/`, nicht automatisch berechnete Kreise. `custom` referenziert ein separat gemaltes, transparentes Bild unter `assets/shadows/`. Für finale Bäume, Palmen, Mangroven, größere markante Felsen und Gebäude ist **eigener angepasster Schatten** das Produktionsziel; generische Schatten dienen der Testplatzierung kleinerer Objekte. Schatten müssen zur festen rechten Beleuchtung passen (kurzer leichter Wurf zur linken Seite). **Kein Schatten im Hauptsprite auf eine Biom-Bodenplatte einbrennen.**

**Platzierung:** `allowedTerrainTypes=[]` bedeutet **keine automatische Spawn-Freigabe**, aber manuelle Testplatzierung möglich. `density` ist die ungefähre pro-Hex-Testwahrscheinlichkeit je geeigneter Variante (0..1), `weight` ein zusätzlicher Auswahlfaktor. `edgeMargin` hält den **Bodenanker** vom Hexrand fern, nicht zwingend die Baumkrone. `minSpacing` prüft einfache Ankerabstände über benachbarte Hexe hinweg. `canCluster` erlaubt höhere lokale Dichte. Es gibt noch **keine** perfekte Kronen-/Silhouetten-Kollision; die späteren Produktionsregeln für Gebäude-, Straßensperrflächen und Biome werden weiter verfeinert.

## Szenen, Positionierung und Wiederverwendung

Jede Instanz speichert `assetId`, `assetPath`, axial `q,r`, Welt-Offsets `dx,dy` (in logischen Einheiten), `scale`. Bei gleicher Kombination aus **Seed, Hexkoordinaten und Asset** sind die Offsets wiederholbar. Unterschiedliche Instanzen haben unterschiedliche Positionen. Die Render-Tiefensortierung verwendet den Welt-Standpunkt; Kronen dürfen über Nachbarfelder ragen. Fernansicht blendet kleine Nature-Sprites aus.

Der v0.9-Viewer kann mehrere Nature-Instanzen je Hex platzieren und die gesamte 7-/19-Hex-Testszene deterministisch mit katalogisierten Assets füllen. Die Demo-Platzhalter können einzeln ausgeschaltet werden. Eine Weltkarte mit 900 Feldern, regionalem Klimamodell und großkartenfähigem GPU-/Chunk-Renderer ist **noch nicht umgesetzt**.

## Produktionsfreigabe

Erforderlich sind: korrekte Transparenz, unverzerrte Perspektive, Licht von rechts, reproduzierbare Größe und Anker, passender separater Schatten, keine fremde Bodentextur, reale Biomeinordnung, visuelle Prüfung von Kollisions-/Überlappungsfällen und Schärfe bei 160–240 % Kamerazoom. Der Viewer erzwingt einen validen **Datenvertrag**, kann die künstlerische Qualität oder transparentes PNG nicht vollständig automatisch garantieren.


---

## Ergänzung v0.9.1 – Referenztreue, erweiterbare Biome, Presets und Bodenschatten

**Produktionsgrundsatz (verbindlich):** Eine Referenzgrafik mit 5 Büschen beschreibt **fünf unterscheidbare Ausgangsobjekte**. Für jeden sichtbaren Einzelbusch soll ein eigenes Produktionssprite mit erhaltener Individualsilhouette und eindeutigem `sourceReference`-Index entstehen. Keine Verschmelzung verschiedener Vorlagebüsche zu einem Durchschnittsmodell. Neue Varianten müssen die jeweilige Vorlage gezielt variieren, nicht die Familie mitteln. Vor dem Batch die erkannten Objekte zählen und indizieren; das fertige Paket muss die Auswahl nachvollziehbar machen. Die generierten ersten vier Büsche waren **Stiltests**, keine 1:1-Erfassung der über 20 Einzelbüsche.

**v1-Katalog ab v0.9.1 erweitert, rückwärtskompatibel:**

```json
{
  "schemaVersion": 1,
  "presets": {
    "temperate_shrubs": {
      "name": "Gemäßigte Büsche",
      "categoryIds": ["grass_pasture"],
      "typeIds": ["tundra"],
      "excludeIds": ["snowfields"]
    }
  },
  "entries": {
    "nature/bush_temperate_01.png": {
      "id": "bush_temperate_01",
      "terrainPresetId": "temperate_shrubs",
      "allowedTerrainCategories": [],
      "allowedTerrainTypes": [],
      "excludedTerrainTypes": [],
      "shadow": {
        "mode": "generic_small_round",
        "path": "",
        "offsetX": -0.24,
        "offsetY": 0,
        "widthScale": 0.70,
        "depthScale": 0.18
      }
    }
  }
}
```

Dieses Beispiel zeigt **nur die neuen Felder**; ein vollständiger Entry braucht weiterhin alle vorherigen Pflichtfelder. Presets sind in der Datei benannt und über stabile IDs verlinkt. Ohne Preset bleiben `allowedTerrainTypes` explizite Einzelfreigaben wie in v0.9.0. Kategorienreferenzen gelten **dynamisch für sämtliche aktuellen und künftig neu hinzugefügten Arten**, sofern deren `categoryId` unverändert bleibt. Per-Asset-Ausnahmen `excludedTerrainTypes` haben Vorrang vor Preset/Kategorien. Bereits gespeicherte Angaben werden beim Neueinlesen nicht zurückgesetzt.

**Schattenparameter:** `offsetX` und `offsetY` sind Bruchteile der gerenderten Spritebreite relativ zum sichtbaren Bodenkontaktpunkt (negativ X = nach links); `widthScale` und `depthScale` definieren die gerenderte Breite/Höhe der am Boden flach liegenden Schattenebene relativ zur Spritebreite. Die PNG wird anhand ihrer **sichtbaren Alpha-Grenzen** zugeschnitten; der Objekt-Bodenanker bezieht sich im Renderer auf die zugeschnittene sichtbare Silhouette. Die Transparenz muss echt sein, nicht schwarz ausgemalt. Bei sehr großen und silhouettenprägenden Nature-Sprites individuelle Schatten verwenden. Das Anzeige-Overlay für Kontaktpunkte ist rein diagnostisch.
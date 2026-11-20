# Geography-Lab: Vielfalt-Mix (geography-v2.1.2)

## Zweck
Die beim Öffnen des Geografie-Labors aktive Vorschau **Vielfalt-Mix** bietet etwas mehr Grasland als kalte Regionen, annähernd gleich viele feuchte und trockene Landregionen und eine größere Vielfalt der regulären Terrain-Untertypen. Die Schaltfläche **„Vielfalt-Mix erneut laden“** stellt die getesteten Parameter einschließlich Seed und Kartengröße wieder her. **Standardwerte** setzt stattdessen die ursprünglichen Engine-Standardwerte zurück.

Es werden **keine Terrain-Typen künstlich einzeln auf Hexfelder gesetzt**. Die Klima-, Wasser- und Bodenregeln bleiben global-koordinatenbasiert, deterministisch und auch bei Karten-Erweiterung stabil. Die neuen Regler sind optional und haben dieselben Standardergebnisse wie v2.1.1; die v2.1.1-Rauschbasis bleibt bewusst erhalten. Die neue Version ist `geography-v2.1.2`. Bestehende Spielstände/gespeicherte Welt-Snapshots werden nicht geändert. Das alte `browsergame`-Gameplay wird nicht umgestellt.

## Neuerzeugung und regionale Verteilung
Die Vorgabe nutzt 95 × 75 Hexfelder, Seed `vedras-welt-01` auf Basis der exportierten Konfiguration (Temperatur 0,55; Biom-Zielgröße 50). Biomfamilien auf Land (4870 Landhexe):

| Biomfamilie | Hexfelder | Anteil an Land |
| --- | ---: | ---: |
| Grasland | 1244 | 25,5 % |
| Kalte Regionen | 1094 | 22,5 % |
| Trockengebiete | 960 | 19,7 % |
| Feuchtgebiete | 793 | 16,3 % |
| Savanne | 576 | 11,8 % |
| Dschungel | 203 | 4,2 % |

Auf dieser Karte erscheinen **26 von 26** regulären Terrain-Typen. Ausgewählte Untertypen nach der Anpassung (Anzahl Hexfelder):

| Terrain | Vielfalt-Mix |
| --- | ---: |
| Hochland (`highland`) | **244** |
| Wüstenboden (`desert`) | 83 |
| Ödland (`wasteland`) | 96 |
| Steinige Badlands (`rocky_badlands`) | 83 |
| Badlands (`badlands`) | 58 |
| Lehmwüste (`clay_desert`) | 91 |
| Sandige Badlands (`sandy_badlands`) | 98 |
| Schneefelder (`snowfields`) | 361 |
| Eisiger Ozean (`icy_ocean`) | 322 |
| Normaler Ozean (`ocean`) | 829 |
| Savanne (`savanna`) | 500 |
| Grasland-Terrain (`grassland`) | 1008 |
| Gefrorene Tundra (`frozen_tundra`) | 306 |
| Moor (`moor`) | 164 |
| Marschland (`marshland`) | 172 |

### Technische Stellschrauben
- `geology.aridPatchMix` (neu, standardmäßig 0, Vielfalt-Mix: 1): nutzt bei 1 eine kleine, deterministische geologische Voronoi-Region mit einem gleichmäßig verteilten Stichprobenwert. So können alle positiven Gewichte unabhängig von der zentral konzentrierten Bodenrausch-Verteilung auftreten. Voronoi-Teilregionen statt erzwungener Einzelhexe.
- `biomes.snowHumidity` (neu, Standard 0,60, Mix 0,40): bei genügend kaltem Klima häufiger Schneefelder auf Kosten der gefrorenen Tundra.
- `geology.swampWarmBoundary` (neu, Standard 0,64, Mix 0,50): mehr Sumpf statt Moor und Marschland.
- Gezielte aride Gewichtung: `geology.aridRockyBadlands=16`, `geology.aridDesert=20`, `geology.aridSandyBadlands=20`; `biomes.semiDesertMargin=0.015`.
- Anteil Wasser `water.fraction=0.22` (vorher 0,23) und `water.iceTemperature=0.28`. So werden die Ozean-Untertypen insgesamt um 102 Hexe reduziert.
- **Hochland statt Wasser/Grasland:** `biomes.coldBoundary=0.34` und der zusätzliche Regler `geology.highlandColdMargin=0.15` (Standard: 0) erlauben Hochland in kalten, reliefreichen Teilregionen, bevor Tundra-/Schneefeldvarianten greifen. `geology.highlandSoil=0.62` bleibt unverändert. Mit Margin 0 verhält sich die Engine bezüglich Hochland wie bisher.
- Aus der hochgeladenen Ausgangskonfiguration (`climate.temperature=0.55`, `biomes.targetHexes=50`) werden im selben Seed **244 statt 40 Hochland-Hexe**; Wasser sinkt von 2.357 auf 2.255 und Grundterrain-Grasland von 1.047 auf 1.008. Alle vier Ozean-Untertypen nehmen einzeln ab.

## Qualitätskontrolle
Unter **Terrain-Mix · Vielfalt** zeigt der Live-Bericht nach jeder Neugenerierung die Anzahl der tatsächlich vertretenen Terrain-Typen, die Hochland-Zahl mit Mindestziel 200, die Grasland/Kälte-Verhältnisse, Feucht-/Trockenanteile und gegebenenfalls fehlende Typen. Unter **Biom- und Terrainverteilung** stehen weiterhin alle 26 regulären Terrains einschließlich Nullwerten; Mehrfachanalyse und JSON-Export funktionieren unabhängig vom Preset.

Für **andere Seeds, Kartengrößen und Parameter** ist ein vollständiges Vorkommen aller 26 Typen **nicht garantiert**: Kleine/geografisch ungeeignete Ausschnitte dürfen bestimmte Landschaften naturgemäß nicht enthalten. Die vollständige 26/26-Abdeckung und das Hochland-Mindestziel gelten für die kalibrierte Voreinstellung. Andere Seeds oder Ausschnitte können auch weniger als 200 Hochland-Hexe enthalten.

Tests: `node tests/test_geography_v2.cjs` und `node tests/test_geography_balanced_mix.cjs`.

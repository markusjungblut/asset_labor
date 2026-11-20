# Geography-Lab: Vielfalt-Mix (geography-v2.1.2)

## Zweck
Die beim Öffnen des Geografie-Labors aktive Vorschau **Vielfalt-Mix** bietet etwas mehr Grasland als kalte Regionen, annähernd gleich viele feuchte und trockene Landregionen und eine größere Vielfalt der regulären Terrain-Untertypen. Die Schaltfläche **„Vielfalt-Mix erneut laden“** stellt die getesteten Parameter einschließlich Seed und Kartengröße wieder her. **Standardwerte** setzt stattdessen die ursprünglichen Engine-Standardwerte zurück.

Es werden **keine Terrain-Typen künstlich einzeln auf Hexfelder gesetzt**. Die Klima-, Wasser- und Bodenregeln bleiben global-koordinatenbasiert, deterministisch und auch bei Karten-Erweiterung stabil. Die neuen Regler sind optional und haben dieselben Standardergebnisse wie v2.1.1; die v2.1.1-Rauschbasis bleibt bewusst erhalten. Die neue Version ist `geography-v2.1.2`. Bestehende Spielstände/gespeicherte Welt-Snapshots werden nicht geändert. Das alte `browsergame`-Gameplay wird nicht umgestellt.

## Neuerzeugung und regionale Verteilung
Die Vorgabe nutzt 95 × 75 Hexfelder, Seed `vedras-welt-01`. Biomfamilien auf Land (4768 Landhexe):

| Biomfamilie | Hexfelder | Anteil an Land |
| --- | ---: | ---: |
| Grasland | 1166 | 24,5 % |
| Kalte Regionen | 903 | 18,9 % |
| Trockengebiete | 1044 | 21,9 % |
| Feuchtgebiete | 877 | 18,4 % |
| Savanne | 562 | 11,8 % |
| Dschungel | 216 | 4,5 % |

Auf dieser Karte erscheinen **26 von 26** regulären Terrain-Typen. Ausgewählte Untertypen nach der Anpassung (Anzahl Hexfelder):

| Terrain | Vielfalt-Mix |
| --- | ---: |
| Wüstenboden (`desert`) | 97 |
| Ödland (`wasteland`) | 95 |
| Steinige Badlands (`rocky_badlands`) | 82 |
| Badlands (`badlands`) | 56 |
| Lehmwüste (`clay_desert`) | 69 |
| Sandige Badlands (`sandy_badlands`) | 109 |
| Schneefelder (`snowfields`) | 430 |
| Eisiger Ozean (`icy_ocean`) | 358 |
| Normaler Ozean (`ocean`) | 853 |
| Savanne (`savanna`) | 481 |
| Grasland-Terrain (`grassland`) | 909 |
| Gefrorene Tundra (`frozen_tundra`) | 319 |
| Moor (`moor`) | 255 |
| Marschland (`marshland`) | 162 |

### Technische Stellschrauben
- `geology.aridPatchMix` (neu, standardmäßig 0, Vielfalt-Mix: 1): nutzt bei 1 eine kleine, deterministische geologische Voronoi-Region mit einem gleichmäßig verteilten Stichprobenwert. So können alle positiven Gewichte unabhängig von der zentral konzentrierten Bodenrausch-Verteilung auftreten. Voronoi-Teilregionen statt erzwungener Einzelhexe.
- `biomes.snowHumidity` (neu, Standard 0,60, Mix 0,40): bei genügend kaltem Klima häufiger Schneefelder auf Kosten der gefrorenen Tundra.
- `geology.swampWarmBoundary` (neu, Standard 0,64, Mix 0,50): mehr Sumpf statt Moor und Marschland.
- Gezielte aride Gewichtung: `geology.aridRockyBadlands=16`, `geology.aridDesert=20`, `geology.aridSandyBadlands=20`; `biomes.semiDesertMargin=0.015`.
- Anteil Wasser `water.fraction=0.23` und `water.iceTemperature=0.28`. Temperatur- und Feuchteschwellen der Biomfamilien sind separat angepasst.

## Qualitätskontrolle
Unter **Terrain-Mix · Vielfalt** zeigt der Live-Bericht nach jeder Neugenerierung die Anzahl der tatsächlich vertretenen Terrain-Typen, die Grasland/Kälte-Verhältnisse, Feucht-/Trockenanteile und gegebenenfalls fehlende Typen. Unter **Biom- und Terrainverteilung** stehen weiterhin alle 26 regulären Terrains einschließlich Nullwerten; Mehrfachanalyse und JSON-Export funktionieren unabhängig vom Preset.

Für **andere Seeds, Kartengrößen und Parameter** ist ein vollständiges Vorkommen aller 26 Typen **nicht garantiert**: Kleine/geografisch ungeeignete Ausschnitte dürfen bestimmte Landschaften naturgemäß nicht enthalten. Die vollständige 26/26-Abdeckung gilt für die kalibrierte Voreinstellung.

Tests: `node tests/test_geography_v2.cjs` und `node tests/test_geography_balanced_mix.cjs`.

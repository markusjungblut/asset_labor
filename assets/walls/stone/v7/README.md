# Steinmauern v7 – neue Originalmalerei auf Palisaden-v5-Hexgeometrie

Diese Version verwirft sämtliche bisherigen Steinmauerbilder und den v6-Generator.
Es werden ausschließlich die kanonische Hexprojektion, sechs Richtungen, Fußanker
und Anschlussprinzipien der unveränderten **Palisaden v5** übernommen.

- Sechs eigene freigestellte RGBA-PNGs: `edge_dir0..5.png` (3 Pixel/Welteinheit).
- Zwei separate gemalte Anschlussgrafiken: `corner_post.png`, `end_post.png`.
- Originales, neu gemaltes Ausgangsbild: `source_atlas.png`.
- Reproduzierbare Aufbereitung: `scripts/build_stone_walls_from_painted_atlas_v7.py`
  (benötigt Pillow, numpy, opencv-python-headless).
- Geometriepreview: `geometry_preview.png`. Sie ist ein ergänzender Vergleich
  und **kein Ersatz** für die Aufnahme im echten Karteneditor.
- Die Mauergrafiken verwenden die festgelegten Hexvertex-Fußpunkte und Canvas-2.5D-Projektion.
  Die alten v6-Bilder und ihre Motive werden weder geladen noch als Materialquelle benutzt.
- Der Renderer verwendet die neuen Grafiken ohne Drehung oder Streckung pro Richtung;
  Palisaden-Kunst, -Metadaten und -Ladepfade bleiben unverändert.

## Abnahmekriterien
Das System muss im tatsächlichen Editor mit allen sechs Richtungen, offenen Ketten,
Eck- und Endpfeilern und verschiedenen Zoomstufen geprüft werden. Neben Browser-
und PNG-Tests ist die ästhetische Qualität **manuell** zu bewerten; CI kann
gute Bildgestaltung nicht garantieren. PR #182 darf nicht ohne Zustimmung gemergt werden.

## Korrektur: präzise Ost-/Westwände und gerichtete Schatten

Die beiden vertikalen Wand-PNGs verwenden denselben x-Bereich [9, 31],
starten bei y=30 (an die sichtbare Höhe der schrägen Gemälde angepasst)
und enden am projizierten unteren Hexvertex y=207,6314. Damit ragt
kein Wandfuß mehr unter einem Anschluss hervor. Die Mauer-Schatten erhalten
weiterhin dieselbe globale Lichtrichtung wie alle übrigen Sprites,
aber eine reduzierte Reichweite, um übergroße flache Schattenflächen
zu vermeiden. Die Palisaden v5 und ihre Schattenwerte sind unverändert.

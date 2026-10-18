# Asset-Labor v0.12 – FloraV2-Integration und Asset-Ordner

Stand: 18. Oktober 2026, Datenbasis Commit `2933ec5d0b202636e85b31251d82eb10216d03b4`.

## Grundsätze

- Kein Ersetzen, Verschieben oder Umbenennen vorhandener Grafiken. Alle 148 Nature-PNGs werden anhand von Aliasnamen katalogisiert, darunter Umlaute und unterschiedliche Nummerierungsformate.
- Neue echte PNGs in `assets/nature/{trees|shrubs|ground}/<family>/<canonical_name>.png` ablegen. Textpläne in allen 37 vorbereiteten Familienordnern zeigen Soll-Dateinamen, vorhandene Bilder, Größen und Biome.
- **Keine PNG-Platzhalter**. Noch nicht erstellte Arten sind in JSON und als Text verfügbar, erscheinen aber nicht als Sprite in der Karte.
- 104 geplante Pflanzen-/Naturkategorien im Flora-Registry-Manifest; 25 aktive Terrain-Typen, 104 vorhandene Terrain-PNGs eindeutig gemappt.
- Die bisherigen 45 Planungsposten bleiben dort bestehen, soweit nicht von FloraV2 ersetzt; Nicht-Flora-Objekte werden zusätzlich unterstützt.
- `tanne_01–11` und `tanne_schnee_01–10` erhalten vorläufige Rollen für Tanne/Fichte/Kiefer/Pinie bzw. Winterformen. Die PNGs werden nicht dupliziert. Die exakte botanische Bestimmung erfordert Bildprüfung.
- `tree_12–19` bleibt als unklassifizierter tropischer Baum mit ausschließlich `forest_floor` freigegeben. Die 41 `bush_*` bleiben gemäßigte Sträucher.
- Neue Kandidaten werden in die vorhandene Nature-Katalogstruktur geschrieben, falls sie noch **keine** eigenen Metadaten haben. Die alte `nature_catalog.json` wird nicht überschrieben. Vor jeder automatischen Speicherung legt der Server eine `.bak`-Sicherung an.

## Rendering / Regeln

Werte sind World Units (WE): Thymian 10, Birke 126, Eiche 174, Affenbrotbaum und Dschungelbäume 225. Die sichtbare, nach Alpha zugeschnittene **Höhe** ist verbindlich, nicht die PNG-Quellpixel. Jede Variante erhält ein eigenes `id`, gemeinsamen `speciesId`-Plannamen und eine zum Standort passende Freigabe. Die PNGs verwenden den bestehenden Bodenanker und die vorhandenen generischen Bodenschatten; individuelle Gebäudeschatten bleiben separat.

Die neue Verteillogik behandelt Pflanzenarten als Gruppen und zieht erst danach eine visuelle Variante. Die Prozentbereiche in `densityProfiles` sind die Wahrscheinlichkeit, dass ein passendes Hex mindestens einen Baum/Strauch/eine Kleinpflanze erhält; sie sind **keine** unabhängigen Wahrscheinlichkeiten für jede PNG. Genutzte Zufallszahlen sind vom Seed und den Hexkoordinaten abhängig.

Waldboden ist `surface=forest_floor` und kann `baseBiome` behalten. Ein Waldtyp bestimmt seine Vegetation; Waldfläche entsteht zusammenhängend, nicht durch die bloße Existenz eines Einzelbaums. Im Asset-Labor-Test gibt es pro Waldhex die Dichtestufen Waldrand (1–3 Bäume), Waldkern (2–5), geschlossener Wald (3–6), soweit die Mindestabstände Platz lassen. Eine vollständige prozedurale Waldregionengenerierung in der Spielwelt selbst ist **nicht** Bestandteil dieses isolierten Laborupdates.

## Bekannte Grenzen und QA

Nicht alle Bestandsnamen verraten die botanische Silhouette. Proxy-/Dschungelzuordnungen bleiben deshalb als solche markiert. Die 25 Geländezuweisungen basieren auf konsistenten Dateipräfixen, inklusive des Schreibfehlers `cosatal_water`; Dateien wurden nicht umbenannt. UI-, Integrations- und Performancetests sind nach dem ersten lokalen Start durchzuführen, bevor die PR in die Hauptlinie übernommen wird. Die bisherige 37-Hex-Karten- und Schattenlogik wird nicht gelöscht.

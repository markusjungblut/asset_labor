# FloraV2 – Zusammenführung in main

Die FloraV2-Referenz mit 104 Artgruppen und 37 textlichen Familienordnern wurde aus `codex/flora-v2-asset-registry` in `main` integriert. Die Zuordnung der 148 existierenden PNGs wurde gegen den aktuellen Nature-Katalog abgeglichen. Kapokbäume sind normale Dschungelbäume; vorhandene Tannen, Schneekiefern, Schneetannen und Buschgruppen behalten ihre Nutzerklassifizierung.

Im Asset-Labor ist die breite Pflanzenreferenz getrennt von der verbindlichen **17-Positionen-Produktionsliste** durchsuchbar. Sie dient als Arten- und Aliasnachschlagewerk; sie erzeugt keine Platzhalterbilder, schreibt keine Nature-Metadaten und fängt den Nature-Verteilungsbutton nicht ab.

Die frühere FloraV2-Verteilung und der Waldboden-Test, die den neuen `forest.js`-Generator und das eigenständige Dschungelbiom widersprachen, werden nicht aktiviert. Die bestehenden Waldfunktionen auf `main` bleiben maßgeblich. `plans/terrain_catalog_seed.json` behält die historischen Dichteprofile als Referenz, verwendet für Typen und PNG-Zuordnungen jedoch den realen aktuellen Terrain-Katalog.

Tests: `node tests/test_flora_v2.cjs`, die bestehenden Nature-/Forest-Tests und der vollständige Browsertest.

# Bergschatten 2.0 · Asset-Labor v0.11.2 (19.10.2026)

## Was korrigiert wurde

Die bisherige Schattenberechnung transformierte die Alpha-Silhouette des Berg-PNG in eine flache Scherung. Der größte Teil lag unter dem Berg; links sichtbar blieb meist nur ein dünner Streifen. Der Spread-Regler verbreiterte außerdem ungewollt nach rechts und der Fußkontakt bildete eine horizontale Basis.

**Bergschatten nutzen jetzt ein eigenständiges gerichtet-prozedurales Bodenfeld.** Sie verwenden weiterhin die echte PNG-Alpha-Verteilung, allerdings ausschließlich, um den linken sichtbaren Fußbereich in der Nähe des von der Grafik definierten `anchor.y` zu ermitteln. Ein breit definierter Hauptkörper, eine weich verjüngende Spitze und eine diagonal entlang der Schattendirection ausgerichtete Kontaktkapsel bilden den Schatten. Keine gescherte PNG-Maske mehr für Berge.

- Ausgangspunkt: linke Alpha-Kontur im authored-foot-Band; Fallback bei unlesbarer Alpha `x=-.27` relativ zum sichtbaren PNG
- Projektion: Richtung 150° (links-unten), Länge 0,72 × sichtbare Spritebreite
- Breite: Basis 0,26 ×, Mitte 0,21 × und Spitze 0,105 × Spritebreite
- Kontaktbereich: 0,16 × Breite und 0,33 × Länge, diagonal entlang der Richtung
- Weichheit 17; relative Intensität 0,44; gemeinsame Schattengesamtstärke 68 %
- rechte Clipgrenze fest am Schattenursprung: `origin.x + width * .045`; breiterer Schatten darf nicht nach rechts auslaufen
- kombinierte Deckung von Wurf- und Kontaktschatten wird über MAX, nicht additive Verdunkelung, gebildet; Bergketten bilden ebenfalls eine MAX-Union
- max. Alpha der prozeduralen Schattenfläche 0,49 vor Überlagerung; Schattenton RGB 32/49/49

## Schatteneditor

Im Bereich **Große Berge → Gemeinsames Schattensystem** sind nun einstellbar: globale Stärke, relative Intensität, Weichheit, Ursprung X/Y, Winkel, Länge, Basis-/Mittel-/Spitzenbreite sowie Kontaktbreite/-länge. Das Reglerprofil ist pro Berginstanz, pro ausgewähltem Berg-Asset und für künftige Berge speicherbar. Das goldene Debug-Handle zieht den *tatsächlichen* alpha-kalibrierten Ursprung (relativ zum Fuß, ohne das Sprite selbst zu bewegen). Die Debug-Visualisierung zeigt Basisquerachse, Schattenachse und alle drei Breitenradien.

Alte Szenen mit `shadowReach`, `shadowSpread`, `shadowContact` oder alten Asset-Profilen bleiben lesbar. Fehlt ein neuer Wert, wird er aus der jeweiligen älteren Einstellung abgeleitet; bestehende per-Berg-Opacity, Softness und Origin-Offsets bleiben erhalten. Der globale Regler wirkt weiterhin auf Berge, Bäume, Büsche und Gebäude. Gebäude/Nature behalten zunächst ihr generisches Schattenmodell.

## Vegetationsmaßstab und Belegung

**Alle Bäume einschließlich stehender Totholzbäume** werden relativ zur v0.11.1-Rendergröße nochmals mit `0.5` multipliziert. **Übrige Nature-Vegetation** – Büsche, Farne, Kräuter, Baumstämme, Stümpfe, Schilf und Bodenpflanzen – erhält den zusätzlichen Faktor `0.7`. Berge werden nicht skaliert. Dies ändert ausschließlich die Ausgabegröße: die **258 Original-PNGs** und ihre Katalogmetadaten bleiben unverändert.

Damit erhöhte Quoten nicht nur nominell gelten, wird der physische Pflanzabstand anhand des geometrischen Mittels beider neuen Darstellungsfaktoren skaliert. Dichte Wälder erlauben bis zu fünf lebende Bäume und acht Nature-Objekte pro Hex, lichte Wälder bis zu vier Bäume und sieben Nature-Objekte. Normale Hexe erhalten einen zusätzlichen freien Objektslot. Nicht-Baum-Dekorationen werden geringfügig häufiger gezogen. Bauflächen, Habitatbedingungen, Berge, Flusskorridore und dedizierte Freiflächen behalten ihre Sperrregeln. Neue Dichte wird bei der nächsten automatischen Nature-Verteilung wirksam; bereits gespeicherte Spriteinstanzen werden beim Rendern sofort kleiner.

## Tests und Grenze

`tests/test_mountain_shadow_field.cjs` prüft mathematisch die tatsächliche breite Fläche, einseitige Ausdehnung, Alpha-Fußpunkte, Offsets, 0%-Stärke, Render-Masken und Legacy-Migration. Ältere Tests für Schatten, Nature, Flüsse und Küsten wurden als Regressionen aktualisiert. Eine visuelle Endabnahme mit den Originalgrafiken über mehrere Zoomfaktoren und echten Bergketten muss im lokalen Browser erfolgen.

**Wald-Bodentexturen, Wald-Regionenmasken und deren Übergangsrenderer bleiben unverändert.**
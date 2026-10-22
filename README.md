## v0.12.8 – Chunk-Kreuze und Übergang Küste → Flussmündung (22.10.2026)

**Nahtfreies Chunk-Compositing:** Der alte `VedrasChunks.draw`-Pass ließ jedes überlagernde Chunk-Canvas um zwei Welt-Einheiten über die eigene 512er-Grenze hinaus zeichnen. Gerade bei transparenten Küsten-/Böschungslayern führte das am Treffpunkt von vier Kacheln zu sichtbaren dunklen oder hellen **Kreuzen**. Die neue Funktion `clipCore` berechnet aus der tatsächlichen Canvas-Transformation identische, gerundete **Backing-Store-Pixelkanten** für jedes angrenzende Chunk. Jedes Zielpixel wird exakt einem Chunk zugeordnet, ohne Lücken und ohne doppelte Alphakomposition. Die Quelltexturen behalten weiterhin ihren Raster-Halo. Der Renderer stellt nach dem Clipping dieselbe World-Space-Transformation wieder her und verschiebt oder streckt die Originalgrafiken **nicht**. Ein sicherer World-Space-Fallback besteht für reine Test-Contexts ohne `getTransform`.

**Küstenmündung ohne Streifen:** `shoreline.js` richtet nun Küsten-Chunk-Samples mit einem gemeinsamen, weltverankerten Pixelraster aus, auch wenn der Editor mit 0,8× oder anderen fraktionalen Stufen rendert. Die Mündungsmaske nutzt die tatsächliche Wasser-Normale der sechseckigen Land↔Wasser-Kante; der Strand wird entlang des Flusskanals geöffnet und sowohl land- als auch seewärts weich ausgeblendet. Seitlich schließen die normalen Küstenüberlagerungen glatt an die schon vorhandene Flussböschung an. Keine ganzen Küstenkanten entfallen und das Wasser bleibt verbunden.

**Kompatibilität:** Der hochwertige Wasserlook, Materialassets, River-Topologie in sechs Richtungen, Küsten-Grafik-Assets, Seed-Determinismus und Nature-/Sprite-Überhänge bleiben unverändert. `index.html` erhöht die Asset-Labor-Anzeige auf **v0.12.8** und aktualisiert die Browser-Cache-Versionen für `chunks.js`/`shoreline.js`.

**Prüfung:** `tests/test_chunk_stitch_coastal_portal_20261022.cjs` überprüft die gemeinsame gerundete Pixelgrenze an Vierfach-Kreuzungen bei mehreren Zoom-/Pan-/DPR-Werten, den Fallback und die übereinstimmende RGBA-Mündungsmaske in zwei überlappenden 0,8×-Küstenchunks. Die frühere Performance-/Fluss-/Wassernaht-Testreihe bleibt erhalten. Eine visuelle Browser-Abnahme auf dem lokalen Asset-Labor-Server mit Originalgrafiken und ein FPS-Profil stehen vor dem Merge weiterhin aus.

---

## v0.12.7 – Flussmündungen, Wassernaht und äußere Scrollbar (22.10.2026)

**Saubere Flussmündungen:** Zwei getrennte Uferanteile wurden bislang ins Wasser über den Küstenübergang hinweg gezeichnet: die neue facettierte Böschung aus `river-banks.js` und der ältere dunkle Wasserrand aus `river.js`. Beide Randmasken enden jetzt auf der **Landseite** der hexkantengenauen Mündung und laufen innerhalb der letzten ca. 20 Welt-Einheiten sanft aus. Der eigentliche Fluss-Wasserkanal und die Mündungsöffnung bleiben durchlässig; Wasser und Küstengeometrie, Brücken, Flusskollision und Vegetationsüberhang bleiben erhalten. Dies funktioniert über Richtungsvektoren in **allen sechs** Hexrichtungen.

**Senkrechte Wassernaht:** Mit reduzierter Vorschauauflösung nutzten benachbarte Material-Chunks bisher unterschiedliche Pixelphasen – auch bei identischem Material. `autotile.js` verankert seine Rasterursprünge jetzt an einem gemeinsamen Weltpixelgitter. Ergänzend fügt `water-texture.js` eine wiederverwendbare Weltkoordinaten-Texturfüllung für `river.js` hinzu und gleicht ausschließlich die wenigen Randpixel von Repeat-Texturen aneinander an. Ein isolierter, durchgehender vertikaler Strich in der **Mitte einer Wasser-Quellgrafik** kann zusätzlich anhand eines strengen, zeilenübergreifenden Kriteriums geglättet werden. Wasserbilder selbst werden **nicht verändert**; gelegentliche, echte Wellendetails sollen dabei erhalten bleiben. Die Wasserfüllung wird aus der ursprünglichen Textur erzeugt, nicht durch eine einfarbige Ersatzfläche ersetzt. Das neue Modul wird ebenso im vorhandenen Offscreen-Worker geladen.

**Nur interne Panels scrollbar:** Auf Desktop (`min-width:801px`) verhindert `style.css` das Scrollen von `html/body`, begrenzt die App auf die tatsächliche Viewporthöhe und hält die mittlere Karte stationär. Linke Grafikbibliothek und rechte Inspector-Steuerleiste behalten unabhängig ihre vertikalen Scrollbereiche. Die responsive mobile Dokumentnavigation bleibt erhalten.

**Tests:** `tests/test_river_mouth_water_seams_scroll_20261022.cjs` enthält sechs neue Prüfungen: Mündung in allen Richtungen, Erkennung und selektive Beseitigung einer künstlichen Mittennaht, randgleiche Wassertexturen, texturtreue wiederholte Compositing-Operationen, Chunk-Rastergleichheit bei 0,6× sowie äußere/interne Scrollregeln. Die älteren Böschungs- und Performance-Regressionsprüfungen bleiben bestehen. **Grenze:** Ohne laufenden Asset-Labor-Browser mit den konkreten 463 lokalen PNGs kann nicht bestätigt werden, dass der Screenshot-Artefakt ausschließlich diese beiden Ursachen hatte; eine visuelle Überprüfung bei 37 und 397 Hexfeldern sollte vor dem Merge erfolgen.

---

## v0.12.6 – Korrektur: Originalwasser + plastisch modellierte Böschungsufer (22.10.2026)

**Wasser wieder unverändert:** PR #18 hatte die bis dahin hochwertige Flussoberfläche unbeabsichtigt durch eine eigene, optisch flachere Wasserfüllung ersetzt. Dieser Fehler ist korrigiert: `app.js` zeichnet die Flüsse wieder über die **unveränderte** Funktion `VedrasRivers.render` aus `river.js`, mit derselben Original-Wassertextur des Mündungshexes, derselben Rand-/Quell-/Mündungsmaske und demselben Flussverlauf wie vor der Uferänderung. Der neue Renderer zeichnet **keine Wasserpixel** mehr; er liefert ausschließlich eine transparente Böschungs-Ebene **unter** der alten Wasseroberfläche.

**Stilisierte Uferböschungen:** Deutlich erkennbare 2,5D-Ufer aus dunkler feuchter Fußkante, schräg modellierter Erd-/Felswand mit prozeduralen steinigen Facetten und einem beleuchteten Rand, der durch abnehmende Deckkraft in den bestehenden Terrain-Untergrund übergeht. Böschungsschatten variieren mit lokalen Flusstangenten/-normalen und einer festen Lichtrichtung, nicht mit sechs separat aufgekleben Ufersprites. Terrainabhängige Materialprofile (Fels/Gebirge/Hügel, Wald, Moor/Feuchtland, Gras-/Erdland, Wüste/Steppe, Schnee/Tundra) mischen sich entlang der Hexkanten; der Auslauf ist nicht auf Grasland beschränkt.

**Topologie und vorhandene Naturregeln bewahrt:** Das bestehende Hexkanten-Flussnetz, alle sechs Richtungen, Quelle, Mündung, Kurven, Zusammenflüsse, Fluss-/Baum-Kollisionsabstände und überhängende Pflanzen-Sprites bleiben unverändert. Die gemeinsamen Böschungsmasken verhindern doppelt dunkel überzeichnete Ufer an Zusammenflüssen. Ufer werden wie zuvor in sichtbaren weltverankerten Chunks mit Halo und LRU-Cache gerendert. „Natürliche Flussufer einbetten“ lässt sich abschalten: dann bleibt **ausschließlich das alte Wasser** erhalten. „Uferplastizität“ skaliert nur die Böschung, nicht die Wasserfarbe.

**Regressionen:** 16/16 gezielte JavaScript-Tests im isolierten Test-Harness bestanden (10 Fluss-/Bank-Tests einschließlich wiederhergestelltem Wasserpfad, facettierter Uferprofilierung, Core-Ausnahme, Biome, sechs Richtungen, Zusammenflüssen, Chunk-Nähten; 6 Preview-Performance-Tests). Syntax der betroffenen Skripte erfolgreich geprüft. **Eine visuelle Browser-Abnahme mit echten Terrain- und Wasser-PNGs sowie FPS-Messungen steht noch aus.** Die Änderung liegt im bestehenden PR #18, der weiterhin auf PR #17 aufbaut; weder Original-Assets noch Kataloge oder bestehende Nature-Verteilungslogik wurden geändert.

---

## v0.12.5 – Immersive Flussufer und zusammenhängende Flussnetze (22.10.2026)

**Priorität 2 umgesetzt – visuelle Einbettung statt separater Fluss-Sprites:** `river-banks.js` führt die bisherigen hexkantengenauen, geglätteten Flusskurse zu einer gemeinsamen geometrischen **MIN-Distanzfeld-Vereinigung** zusammen. Ufer werden ausschließlich an der äußeren Flussgrenze schattiert: an Ecken, Richtungswechseln und Zusammenflüssen entstehen keine additiv dunklen doppelten Uferstreifen. Alle sechs Hexrichtungen nutzen lokale Tangente und Normale und eine einheitliche weltkoordinatenbasierte Rasterung.

**Landschaftliche Materialien:** Am Fluss liegt eine schmale, leicht gewellte Erd-/Sedimentzone mit dunklerer feuchter Innenkante, subtiler äußerer heller Böschung und sonnenrichtungsabhängiger Plastik. Statt sechs richtungsabhängigen Rand-PNGs entstehen Fels-/Geröllflecken (Hügel, Gebirge, Hochland), feuchte dunkle Ufer mit kleinen organischen Vegetationsflecken (Moor, Sümpfe, Mangroven, Feuchtland), weiche Erdufer (Grasland), bewachsene dunklere Böden (Wald), sandige trockene Böschungen (Wüste/Savanne) sowie blass-kühle Zonen in Schnee/Tundra. Materialien werden über Weltkoordinaten und Nachbarhexe weich gemischt, nicht hart an Hexseiten umgeschaltet. **Niedrige Uferkante, kein Canyon**; Originalterrain, Relief, Nature-Grafiken und Fluss-Spiellogik bleiben unverändert.

**Performance/Nahtschutz:** Das gesamte Flussnetz wird in sichtbaren 512-Welteinheiten-Chunks mit Halo und begrenztem LRU gerendert (30 Chunks, max. 12 Mio. Rasterpixel plus vorübergehend geschützte sichtbare Chunks). Volle Szenendaten/Geometrie werden nur bei signaturrelevanten Änderungen neu vorbereitet. Pixelursprünge werden auch bei einer Editorauflösung von 0,6× weltweit auf dieselbe Pixelmatrix ausgerichtet; damit bleiben Material, Schattensprung und kleine Geröllformen an Chunk-Übergängen kontinuierlich. Final-PNG-Export wartet auch auf den neuen Ufer-Layer, nicht aber auf legitimerweise leere Fluss-Chunks.

**Bedienung:** Im Abschnitt **Flüsse** ist **„Natürliche Flussufer in die Landschaft einbetten“** standardmäßig an. **Uferplastizität** 0–100 %, Standard 80 %. Schalter und Regler werden im lokalen Szenenzustand sowie im `vedras_scene.json` gespeichert und aus älteren Szenen rückwärtskompatibel mit Defaultwerten ergänzt. Keine Änderungen an Original-PNGs oder Katalogen.

**Prüfung:** `tests/test_immersive_river_banks_20261022.cjs` prüft sieben Aspekte (sechs Richtungen, fünf Materialklassen plus Frost, Uferprofil, doppelte Flussrouten, Chunk-Randüberlappung, 0,6× Pixelankergitter und UI/Import/Export). Sieben von sieben Tests erfolgreich im isolierten JavaScript-Harness; sechs frühere Performance-Regressionstests weiterhin bestanden. Syntax der betroffenen JS-Dateien geprüft. **Noch offen:** echte Browser-E2E-Abnahme mit Quell-PNGs und konkreten FPS-/Framezeiten bei vielen Flüssen, eine optische Gegenüberstellung der Biomübergänge sowie sichtbare Flussmündungen bei unterschiedlichen Wassertexturen.

---

## v0.12.4 – Reaktionsschnelles Asset-Labor / schneller Editor, hochwertiger Export (21.10.2026)

**Schnelle Standardvorschau:** Die neue Qualität **Schnell** ist standardmäßig ausgewählt (ca. 0,8× Canvas-Pixelratio, bis 1,3 Mio. Framebuffer-Pixel, Materialraster mit 0,6× Zielauflösung). **Ausgewogen** liegt dazwischen; die manuellen Stufen 1× bis 4× stehen weiter bereit. Chunk-Rendering ist für neue kleine und große Testkarten standardmäßig aktiv. Die vorhandenen 512-Welteinheiten-Chunks mit Randüberhang werden nur im Kamerasichtfeld aufgebaut; unsichtbare Chunks bleiben im begrenzten LRU statt bei jedem Kameraschwenk neu zu entstehen.

**Änderungen während des Bearbeitens:** Teure Regler (Terrainmuster, Materialskalierung, Blendbreite, Kantenunregelmäßigkeit, Küstenbreite/-auslauf) warten nach der letzten Eingabe **170 ms**, bevor Szenen-JSON gespeichert und die teure Ebene neu aufgebaut wird. Reliefänderungen behalten das Basismaterial; einzelne Terrain-/Flussmündungs-Hexänderungen verwenden lokale Tile-Fingerabdrücke und bauen nur betroffene Material-Chunks neu. Alte Worker-Ergebnisse mit veraltetem Tile-Fingerabdruck werden verworfen. Wald-Bodenraster werden nicht bei jedem Zoom mit einer anderen Rasterauflösung erzeugt. Ein nach Geländeart indexierter Texturkatalog ersetzt wiederholte Scans der gesamten Assetbibliothek pro Hex und Frame. Flüsse und Waldflächen haben weiterhin getrennte Cache-Signaturen.

**Speicherkontrolle:** Terrain-Chunk-Limit 56 Tiles / 24 Mio. Rasterpixel (vorher 120 / 60 Mio.), Küsten 20 / 8,5 Mio., Straßen 36 / 12 Mio., separate Geografie-Rohmaterialvarianten maximal 20. Die tatsächlich sichtbaren, vorübergehend geschützten Chunks können je nach Sichtfeld vor der Verdrängung priorisiert werden. Geografie-Relief kann nun, wenn verfügbar, im Web Worker/OffscreenCanvas gerendert werden; die vorherige Hauptthread-Material-Reuse-Variante bleibt als Fallback vorhanden.

**Separater Final-Export:** **„Aktuelle Ansicht als hochwertiges PNG exportieren (2×)“** zeichnet die aktuell sichtbare Karte bei erhöhter Qualität neu, wartet auf fertige sichtbare Chunks und exportiert ein PNG. Das ist **ein Export der aktuellen Kameraperspektive, kein Komplettwelt-Export**. Danach wechselt der Editor automatisch zurück zur schnellen Vorschau. **Szene als JSON exportieren** bleibt unverändert. Alle separaten RGBA-Nature-/Terrain-PNGs, Kataloge, Geografie-Seeds und Weltgen-Verträge bleiben unangetastet; der neue PNG-Export erzeugt kein Spritesheet.

**Prüfung:** `tests/test_asset_labor_preview_perf_20261021.cjs` enthält sechs Regressionen für UI-Vertrag, 170-ms-Debounce, unabhängige Wald-/Geländeebenen, Export, sichtbare Chunk-Auswahl und selektives Rebuild. Alle sechs liefen in einer isolierten JavaScript-Testumgebung erfolgreich; Syntax von `app.js`, `chunks.js` und `river-ui.js` geprüft. **Nicht behauptet:** Es gibt noch keine belastbaren Chrome-/Firefox-Vorher-Nachher-Messungen mit den vollständigen Original-Assets. Dazu in der Karte das eingebaute Renderprofil (`window.__vedrasRenderProfile` / „Renderprofil“) auf gleichen Szenen mit 37 und 397 Hexfeldern vergleichen. Manuelle Sichtkontrolle des neuen PNG-Exports bei Biomen, Wald, Fluss, Relief und hohen Zoomstufen bleibt erforderlich.

---

## v0.12.3 – Bergschatten haben Vorrang vor generischen Sprite-Schatten (21.10.2026)

Bergsprites benutzen ausschließlich den spezialisierten Bergschatten-Renderer. Der allgemeine Sprite-Schatten-Editor zeichnet bei Bergobjekten keine zusätzliche Silhouette/Kontaktellipse und überschreibt nicht mehr die Werte von mountainShadowSettings(). **Priorität:** Berg-Standardwerte → optionales Berggrafik-Preset → einzelne platzierte Berginstanz. Die gemeinsame globale Schattenstärke von 0–200 % bleibt erhalten und wirkt einmal auf die Bergprojektion.

Bei Auswahl eines Bergsprites im Schatten-Editor werden generische individuelle Regler verborgen. Die Schaltfläche **„Bergschatten einstellen“** öffnet die maßgebliche Sektion **Große Berge → Form und Ursprung**, selbst wenn sie zugeklappt ist. Die Bergvorschau verwendet dieselbe Bergkonfiguration wie die Karte. Vorherige generische Bergprofile im separaten Schatten-JSON bleiben erhalten, werden aber bei Bergobjekten ignoriert (kein destruktiver Katalogeingriff). Original-PNGs, Nature-Kataloge und Instanzwerte werden nicht verändert.

Regressionen: tests/test_mountain_shadow_priority_20261021.cjs, tests/test_sprite_shadow_editor_20261021.cjs und tests/test_mountain_sprite_cast_20261020.cjs bestanden in isolierter JavaScript-Ausführung. Visuelle Kontrolle im Browser mit mehreren benachbarten Bergen ist weiterhin empfohlen.

## v0.12.2 – Neue Waldgeneration mit Kronenziel und Lichtungen (21.10.2026)

**Bedienung:** Im Asset-Labor **Wälder & Dschungel – Vegetationsschicht** öffnen. **Waldgeneration zum A/B-Vergleich** bietet drei Stufen: **Bisherig** (unveränderte historische Grundquote), **Dichter** (mehr Bäume/Gruppen) und **Geschlossener Wald** (Standard; sehr dichte Waldkerne mit überlappenden Baumkronen und kleinen zusammenhängenden Lichtungen). **Kronenbedeckung – Zielwert** regelt die angestrebte Dichte im geschlossenen Bestand (Standard 82 %; Näherung aus gerenderter Baumkronenbreite, **keine pixelgenaue Deckungsmessung**). **Lichtungsanteil** regelt kleine, deterministische Gladen im geschlossenen Bestand (Standard 10 %; statistischer Zielwert, nicht je Hex erzwungen). Nach jeder Auswahl wird **Natur verteilen** für die Testszene erneut berechnet. Waldränder und lichte Wälder bleiben abgestuft offener als Waldkerne.

**Geografie bleibt maßgeblich:** `forestClass` und numerische `forestDensity` aus dem Geografie-Labor werden übernommen; der separate Waldanteil-Regler beeinflusst vor allem die Demo-/Zufallswälder. Die Herkunft geographischer Klassen wird nun gespeichert, damit automatisch generierte Lichtungen in ihnen möglich sind, während bewusst manuell auf „dicht“ gesetzte Waldhexe keine ungefragten Lichtungen erhalten. Die Waldbodenmaske bleibt ein zusammenhängender Flächenverbund mit weich ausgeblendeten, organischen Lichtungen statt radialer Hexränder.

**Schutz & Performance:** Bäume dürfen mit ihren **Kronen überlappen**, aber Stammabstände zu anderen Objekttypen werden nicht entsprechend verkleinert. Wege, Flusskanten, Bauplätze, Berge und bereits manuell platzierte Sprites bleiben geschützt. Automatische Bau-/Freiflächenreservierungen bevorzugen offene Regionen vor dichten Waldkernen. Platzierungen nutzen einen lokalen Hex-Nachbarschaftsindex statt die vollständige Szene bei jedem Versuch zu durchsuchen. Vorhandene Nature-PNGs und alle Nutzerkataloge bleiben unangetastet.

**Tests:** `node tests/test_forest_canopy_generation_20261021.cjs` und `node tests/test_p3_visual_quality_20261020.cjs` bestanden in isolierter JS-Testausführung. Die reale Dichte, Objektüberlappung, Browserleistung und Blickwirkung bei 37/397 Hexen müssen noch mit den tatsächlichen hochgeladenen Naturgrafiken visuell geprüft werden. Der neue Modus betrifft die **grafische Testszene**, nicht ungefragt die Weltgenerator-Verträge des Spiels.

## v0.12.1: Geografie-Relief und getrennte Terrain-Cache-Stufen (21.10.2026)

Der **Reliefmodus „Geografie-Labor“** verformt Land jetzt aufgrund der **tatsächlich importierten Hügelhexe** (nicht mehr anhand einer einzigen ausgewählten Kuppe). Pro Hügelfeld werden die Felder `reliefClass=hills`, `hillProfile` (rounded/steep/chain/plateau/ridge), `hillStrength` sowie die ursprünglichen Weltkoordinaten berücksichtigt. Mehrere benachbarte Hügel ergeben eine hexübergreifend stetige Höhenfläche; Wasser und Küsten laufen gegen Meereshöhe 0 aus. Ein `mountain`-Hex wird weiterhin von den separaten Bergsprites dargestellt und erzeugt nicht automatisch einen zusätzlichen unsichtbaren Gipfel.

Das Geografie-Labor unter **Geografie-JSON importieren → Testszene bestätigen** setzt `Relief aktivieren` und `Reliefquelle = Geografie-Labor` automatisch. Danach kannst du unter **Hügel & Relief** die globale Stärke und die Beleuchtung verändern. `Altes Relief-Labor` bleibt für manuelle Einzelhügel-/A/B-Tests verfügbar; die alten Testknöpfe wechseln ausdrücklich zurück. Die Geografie-Testszene mitsamt Profilen wird nun in der lokalen Szene wiederhergestellt, sofern die Szenengröße unverändert ist.

**Rechenaufwand:** Die Reliefberechnung ist weiterhin eine 2,5D-Pixelprojektion; geänderte Höhen erfordern somit eine **neue Reliefprojektion betroffener Pixel**. Die ursprünglichen Terrain-PNGs und das gemischte Autotile-Basismaterial werden dabei aber nicht erneut zusammengestellt: Im klassischen Renderer gilt der bestehende Material-Raster-Cache, im Chunkmodus werden bis zu 36 unveränderte Rohmaterial-Chunks getrennt von den Reliefvarianten aufbewahrt. Alte Chunks bleiben beim Reglerwechsel sichtbar, bis die neue Variante bereitsteht. Der Reliefstärke-Regler aktualisiert die aufwendige Geometrie **erst beim Loslassen**. In der Geografie-Reliefansicht erfolgt der neue Chunk-Reliefpfad vorläufig im Hauptthread, damit das Rohmaterial wiederverwendet werden kann; die frühere Worker-Version kann diese Material-Reuse-Stufe noch nicht. Sehr große Reliefansichten benötigen daher einen realen Browser-/Performancecheck.

**Noch bewusst unverändert:** Alle Original-PNGs, Terrain- und Nature-Katalogdaten, geografische Höhenklassen `flat/hills/mountain`, unpassierbare Berghexe, die Flusswege entlang von Hexkanten, die Waldgeneration und die produktive Spiel-Weltgenerierung. Geografisches Relief wird nur im Asset-Labor aus dem Worldgen-Datensatz visualisiert; die Integration dieses 2,5D-Renderers in die produktive Gameplay-Karte ist ein eigener Schritt.

Regression: `node tests/test_geography_relief_integration_20261021.cjs` (fünf Profile, Stetigkeit über Hexgrenzen, fehlende Hügel, Legacy-Fallback, Preset-Import, Materialcache und Speicher-Vertrag). Die echte optische Browserabnahme mit Originalgrafiken steht noch aus.

**Gemeinsamer Sprite-Schatten-Editor (21.10.2026):** Über den neuen Schnellzugriff **Schatten** öffnet sich ein eigenständiger visueller Inspector mit durchklickbarer Live-Vorschau aller geladenen Nature-, Berg-, Gebäude- und Einheiten-Sprites. Globale Richtung (Standard: links), Stärke (0–200 %), Schattenlänge, Breite, Ursprung, Weichheit, Deckkraft und Bodenkontakt wirken einheitlich; individuelle Abweichungen können pro Sprite überschrieben oder zurückgesetzt werden. Alte kreisförmige Kontakte, falsch gerichtete PNG-Schatten und die bisherige separate Fallen-Log-Konstruktion werden in der Kartenanzeige durch eine gemeinsame echte Alpha-Silhouettenprojektion ersetzt. Berge behalten ihre eigene großformatige Bodenmaske, folgen aber den Editor-Profilen. Profile liegen **separat** unter `assets/shadows/sprite_shadow_profiles.json` und werden über den lokalen Server gespeichert, validiert und vorher unter `.bak` gesichert; Import/Export ist möglich. Die bisherigen Nature-/Terrain-Kataloge, Quell-PNGs und gespeicherten alten Schattenzuordnungen werden **nicht gelöscht**. Alte manuell zugewiesene Shadow-PNGs werden nur bei aktiviertem neuen Renderer nicht zusätzlich gezeichnet, um Doppel- und Gegenrichtungsschatten zu vermeiden. Tests: `node tests/test_sprite_shadow_editor_20261021.cjs`. Für den visuellen Feinschliff ist eine Browserabnahme mit Originalgrafiken erforderlich.

**Neue Nature-Serien / Habitatregeln (21.10.2026):** `Baumstumpf_16–20` werden **nicht** auf kalten Terrains platziert (ihre bisherigen gemäßigten, feuchten und warmen Böden bleiben möglich; `Baumstumpf_16` im bestehenden Katalog korrigiert). `berg_14–16` sind **nur für `snowfields`**, `berg_17–21` nur für gemäßigtes Gras-/Weideland und Feuchtgebiete vorgesehen, nicht für kalte, warme oder trockene Landschaften. `boulder_31–35` gehören zu den vier kalten Terrains (`snowfields`, `frozen_tundra`, `tundra`, `highland`), `boulder_36–44` ausschließlich zu den warmen und trockenen Terrains (Savanne, Dschungel und Wüsten/Badlands; **nicht** Grasland). `Eisblock_01–05` beziehungsweise `ice_block_01–05` sind nur in `snowfields`, `frozen_tundra` und `tundra` zulässig (**nicht** `highland`). Die Regeln gelten bei manueller Verteilung und beim Natur-/Berg-Generator, auch gegen veraltete Katalogfreigaben. Noch nicht im Repository katalogisierte Varianten werden anhand der Dateinamen beim lokalen Asset-Import zugeordnet. Unveränderte und gelöschte Dateien werden nicht wiederhergestellt. Test: `node tests/test_nature_habitats_20261021.cjs`.

**Fallen-Log-Schatten (21.10.2026):** `fallen_logs` und `snow_fallen_logs` erhalten jetzt einen flachen, über die Stammlänge verlaufenden Schatten mit Auslauf nach links. Die Form kombiniert eine weichgezeichnete längliche Bodenauflage mit der tatsächlichen Alpha-Silhouette des Stamms. Der bisherige runde Kontaktfleck und zusätzliche generische Shadow-Sprites werden für liegende Stämme nicht mehr gerendert. Schnee-Stämme bleiben etwas heller; der globale Schattenregler gilt weiter. Keine PNG- oder Katalogänderungen. Regression: `node tests/test_fallen_log_shadows_20261021.cjs`.

**Kalte Nature-Habitate (20.10.2026):** `boulder_21.png` bis `boulder_30.png` und neue Dateien `snowy_bush.png`, `snowy_bush_01.png` usw. gehören **ausschließlich** zu `snowfields`, `frozen_tundra`, `tundra` und `highland`. Die bestehende Nature-Habitatprüfung gilt für manuellen Besatz, `Natur verteilen` und den Aufräum-/Renderpfad; alte, versehentlich breite Katalogfreigaben können die Regel nicht umgehen. Bereits katalogisierte Boulder 21–25 sind entsprechend angepasst; 26–30 und snowy_bush werden beim künftigen Import korrekt erkannt. Boulder 01–20 behalten ihre bisherigen Regeln. Keine Quell-PNGs verändert.

**Bergschatten – große Nachbarobjekte (20.10.2026):** Ein Berg beschattet Berg- oder Gebäudesprites im unmittelbar links darunterliegenden Nachbarhex (axial `q−1, r+1`) nicht mehr. Kleinere Natur-Sprites und der Bodenschatten bleiben wie bisher betroffen. Schatten anderer, weiter entfernter Berge werden weiterhin berücksichtigt; dies ist eine gezielte Objekt-Ausnahme, keine Abschaltung der Bergschatten. Die unveränderten PNGs und der 0–200-%-Schattenregler bleiben erhalten.

**Priorität 3 – visueller Qualitätsausbau (20.10.2026):** Ohne PNG-Änderung werden Objekt-Sprites beim Anzeigen dezent perspektivisch angepasst (Y 96,5 %, Scherung 1,2 %) und lebende Bäume gegenüber der bestehenden Größenbalance um 10 % vergrößert. Dichte Wälder werden sichtbar voller als lichte und übernehmen neben der Klasse auch `forestDensity` aus der Geografie-Vorschau. `boulder_NN.png` wird für alle vorhandenen und später importierten Varianten klassifiziert, mit 25 % der bisherigen Klassengröße dargestellt und nicht in Schneefeldern/gefrorener Tundra verteilt. „Natur verteilen“ berücksichtigt außerdem geografische Berghexe; Chunk-Grenzen erhalten eine kleine rasterbasierte Überzeichnung gegen Haarlinien. [Details und Qualitätsgrenzen](docs/PRIORITY3_VISUAL_QUALITY_20261020.md).

**Geografie v2.1 (Weltgenerator/Asset-Labor):** Das **Geografie-Labor** erstellt aus absoluten Hex-Weltkoordinaten eine vorab überprüfbare Landschaft. 59 gruppierte Regler steuern Klima, Wasser, Biomgrößen, alle vorhandenen Terrain-Untertypen, Relief, Wald, Flüsse und Tier-/Fundorthexe. **Stürmischer Ozean ist ein festes Terrain, Flüsse liegen auf Hexkanten**; die Karte zeigt den realen Waldanteil in Prozent. Keine künstliche Nord-/Süd-Abkühlung, keine Umklassifizierung bereits erzeugter Hexe bei einer Weltvergrößerung. Alte v2.0-Presets werden nur mit Zustimmung migriert; bestehende Spielwelten bleiben unangetastet. [Details und Einschränkungen](docs/GEOGRAPHY_V2_SHARED.md).

**v0.11.9 · Zoom-Stabilität, Wegkreuzungen & Schatten bis 200 % (20.10.2026):** Terrain und Straßen behalten beim schnellen LOD-Wechsel die vorherige, bereits fertige Auflösung sichtbar, bis neue Chunks eintreffen; beim Zurückzoomen wird eine alte Qualität sofort aus dem Cache reaktiviert. LOD-Hysterese bei 48/76 %, strategische Namen erst unter 17 % (zurück zur Grafik ab 23 %), Zoom bis 12 %. Straßenarme werden als **eine gemeinsame Maske** eingefärbt – ohne additiv dunkle Knicke. Globaler Schattenfaktor **0–200 %**, sichtbar und synchron unter Ansicht und Bergoptionen; über 100 % wirken Bergschatten deutlich dunkler. Wald-Bodentexturen und Originalgrafiken bleiben unverändert. [Implementierung und Tests](docs/ZOOM_LOD_SHADOW_ROAD_0119.md).

**v0.11.8 · Web Worker + OffscreenCanvas (20.10.2026):** Terrain- und Relief-Chunks werden auf unterstützten Browsern in einem Hintergrundthread mit `OffscreenCanvas` berechnet und als fertige `ImageBitmap` zurückgegeben. Terrain-Quelltexturen werden einmal übertragen, bisherige Weltkoordinaten-Auto-Tiling-Logik und Wassertrennung bleiben erhalten. Asynchrone Chunk-Warteschlange mit Szenenversionsschutz, Bitmap-Freigabe und Hauptthread-Fallback; neuer Worker-A/B-Schalter und Diagnose im Testszene-Panel. **Wald-Bodentexturen unverändert.** [Details und Tests](docs/WORKER_OFFSCREEN_0118.md).

**v0.11.7 · Große Karten & Chunk-Rendering (20.10.2026):** Der Generator unterstützt jetzt **91, 169, 271 und 397 Hexfelder** zusätzlich zu den bisherigen Karten. Ab 91 Hexen arbeiten Terrain/Relief, Küsten und Straßen automatisch mit weltverankerten **512er-Chunks** inklusive Randüberhang, Sichtbarkeitsprüfung, progressivem Idle-Bau und begrenzten LRU-Caches; ferne Zoomstufen sparen Rasterauflösung. Neue Kamerasichtbarkeitsprüfung für Nature und Brücken/Flüsse, sichtbare Chunk-Statusanzeige und A/B-Schalter für kleine Karten. Die zusammenhängende Wald-Bodenmaske bleibt zur Vermeidung von Nähten unverändert. [Technik, Grenzen & Game-Architektur](docs/CHUNK_RENDERING_0117.md).

**v0.11.6 · Eingetretene Wege, Bergstraßensperre und Performance (20.10.2026):** Trampelpfade sind jetzt unregelmäßig abgenutzt, mit sanften Vertiefungen und teils durchscheinender Erdoberfläche. Befestigte Erdwege haben Fahrspuren, Pflasterstraßen Fugen. Keine Straßen auf `mountain_ground` oder in der direkten Einflussfläche platzierter Bergmassive. Sechs markantere Holzbrücken mit echten einzelnen Dielen. Die größten Redraw-Risiken (Bergschatten, Relief, Auto-Tiling, Pflanzensortierung und Fluss-/Straßenkollisionen) nutzen begrenzte Caches; der Generator zeigt Render-Zeitmessungen an. Wald-Bodentexturen und Originalgrafiken unverändert. [Umsetzung und spätere Spielarchitektur](docs/ORGANIC_ROADS_PERFORMANCE_0116.md).

**v0.11.5 · Sandige Wege und Holzbrücken (19.10.2026):** Wege werden nun **über** Flüssen gezeichnet, echte Flussquerungen erhalten eines von **sechs transparenten, richtungsgetreuen Brücken-SVGs**. Trampelpfade sind heller, schmaler, sandiger und mit sanfter Erdtextur versehen; Ausbauten behalten dieselbe Geometrie. Beim Bau einer Wegkante werden Pflanzen und Objektanker im Straßenkorridor entfernt, ohne überhängende Kronen abzuschneiden; neue Nature-Verteilung spart den Weg aus. Wald-Bodentexturen und vorhandene Terrain-/Naturgrafiken bleiben unverändert. [Details](docs/ROAD_BRIDGES_0115.md).

**v0.11.4 · Wege & Straßen · Hexmitten-Kreuzungen (19.10.2026):** Wegverbindungen sind jetzt echte editierbare Kanten zwischen benachbarten Hexmitten (0–6 Abzweige pro Hex). Ein neuer prozeduraler **bräunlicher Trampelpfad** mit körniger Textur zeichnet Kreuzungen nahtlos; die Upgrades *befestigter Erdweg* und *Steinstraße* verwenden dieselbe Topologie. Wege lassen sich im neuen Panel platzieren, upgraden, entfernen, ein-/ausblenden und mit Szenen sichern. Keine Änderungen an Wald-Bodentexturen. [Road-Dokumentation](docs/HEX_ROADS_0114.md).

**v0.11.3 · Nature-Sprites +20 % (19.10.2026):** Alle regulären Nature-Sprites werden gegenüber v0.11.2 um 20 % größer dargestellt. **Ausnahmen unverändert:** stehendes Totholz (auch Schneevarianten), liegende Äste/Stämme (auch Schneevarianten) und Baumstümpfe/Totholz-Objekte (`deadwood`). Berge bleiben wie zuvor von der Nature-Skalierung ausgenommen. Die Abstandsberechnung für neue automatische Platzierungen nutzt dieselben Faktoren. Auch die alten Demo-Nature-Sprites wurden angepasst; Wald-Bodentexturen und ursprüngliche PNGs bleiben unverändert.

**v0.11.2 · Bergschatten 2.0 + Nature-Dichte (19.10.2026):** Der links am PNG-Fuß beginnende Schatten ist jetzt eine kurze, breite, gerichtete Bodenfläche mit diagonalem Kontakt, einem festen rechten Ausbreitungslimit und Reglern für Winkel, Länge und Querschnitt. Bäume relativ zum letzten Rendererstand **weitere 50 % kleiner**, restliche Vegetation **weitere 30 % kleiner**, pro Waldhex moderat höhere Quote und entsprechend verringerte Pflanzabstände. Waldbodentexturen/-masken **unverändert**. [Umsetzung und Bedienung](docs/MOUNTAIN_SHADOW_FIELD_0112.md).

**v0.11.1 · Schatten-/Fluss-/Natur-Feinabstimmung (19.10.2026):** Gemeinsame Schattenstärke für Berge, Bäume und Gebäude; pro Berginstanz und Grafik anpassbare Schattensilhouette (inklusive verschiebbarem Schattenursprung), breiter und kürzer. Abgerundete Flussbögen entlang der Hexkanten mit schmalem Ufersaum; kleinere Nature-Sprites und dichtere natürliche Pflanzgruppen. **Waldbodentexturen und ihre Masken bleiben unverändert.** [Bedienung und Testhinweise](docs/SHADOW_RIVER_NATURE_REFINEMENT.md).

**Waldboden-Nahtfix (19.10.2026):** Waldboden wird jetzt nicht mehr pro Hex mit eigener Fade-Grafik aufgestempelt, sondern einmal je zusammenhängender Waldregion als weltverankerte Textur mit gemeinsamer Alpha-Maske gerendert. Nur die Außenkante der Waldregion blendet weich aus. Details: `docs/FOREST_SYSTEM.md`, Test: `tests/test_forest_floor_regions.cjs`.

**Block 4 · Grafik-Finish (19.10.2026):** Flüsse nutzen eine einzige,
weich auslaufende **Distanzfeldmaske** statt sichtbarer Halbkreise an
Hexkanten; ihre Mündungen liegen auf dem gemeinsamen Küsten-Seitenmittelpunkt.
Der Strand bleibt an allen Küstenseiten vollständig erhalten und wird
nur in einer schmalen, verlaufenden Flussöffnung zurückgenommen.
Die neuen Regler **Nature-Farbangleichung**, **Terrainmuster beruhigen**
und **Natürliche Pflanzengruppen** wirken ausschließlich im Renderer
beziehungsweise bei der nächsten automatischen Vegetationsverteilung.
Echte PNGs und Habitatregeln werden nicht verändert. Dokumentation:
`docs/VISUAL_POLISH.md`; Tests:
`tests/test_block4_visual_polish.cjs` und
`tests/test_block4_coast_aperture.cjs`.

**Block 3 · Schatten und 2,5D (19.10.2026):** Bergschatten
werden nun aus der echten PNG-Silhouette **nach links unten** auf
den Boden projiziert – zuvor fielen sie weitgehend nach links *oben*
und verschwanden unter dem Berg. Ein kräftigerer Fußkontakt und
zwei sanfte Wurfschattenschichten machen die Silhouette sichtbar.
Bäume, Büsche, Gebäude und Einheiten erhalten konsistente
Bodenkontaktschatten; Nature-Sprites können zusätzlich
silhouettenbasierte Schatten und ihre bestehenden Schatten-PNGs nutzen.
Schatten werden vor den Sprites gezeichnet, Objekte nach
reliefkorrigiertem Fußpunkt gestaffelt. Der Berg-Schatten-Debug zeigt
goldene Linien vom Fuß zum Wurfschatten. Einzelheiten in
`docs/SHADOW_SYSTEM.md`; Regression
`tests/test_block3_shadows.cjs`.

**Block 2 Natur-Balancing (19.10.2026):** Naturgrößen werden jetzt im
Kartenrenderer artabhängig verkleinert, tote Bäume und Stämme seltener
verteilt, lebende Baumquoten reduziert und 18 % geeigneter Landhexe in
benachbarten Bau-/Freiflächen von automatischer Vegetation freigehalten.
Gebäude erhalten auch auf Nachbarhexen eine gesperrte Fundamentzone.
Die Werte liegen in `nature-balance.js`, ohne die 258 PNGs und
Katalogmaße zu verändern; Tests in `tests/test_block2_nature_balance.cjs`.

## Nature-Bestand und Schneevarianten · 19. Oktober 2026

**258 reale Nature-PNGs katalogisiert und im Inventar sowie in FloraV2 abgeglichen.**
Die jüngsten Uploads ergänzen 77 Nature-Grafiken (5 Dschungelbüsche, 10 Kakteen, 15 tote Bäume,
24 gefallene Stämme, 10 Farne, 5 Mangroven und 8 Baumstümpfe). Die 4 zusätzlichen
`frozen_tundra_base_01–04.png` sind Gelände-Texturen, keine Flora.

**Verbindliche Schneevarianten:** `dead_tree_11–15` (5), `fallen_log_11–20` (10)
und `tanne_schnee_01–10` (10). Diese 25 PNGs sind nur für
`snowfields`, `frozen_tundra`, `tundra`, `highland` zugelassen;
**Schneetannen/-kiefern auf gewöhnlicher Tundra sind bei der Zufallsplatzierung selten
(2-%-Prüfung je Kandidat)**. Manuelle Platzierungen in passenden Kältebiomen bleiben erlaubt.
`fallen_log_21–24` sowie `Baumstumpf_09–16` werden **nicht** als verschneit angesehen.
Andere Pflanzen können auf Tundra vorkommen, sind aber nicht automatisch Schneevarianten.

**Pflanzenplanung abgeschlossen:** keine offenen neuen Floraarten, keine Mangrovengruppen.
Nur künftige optionale *Schneeversionen* werden bei Bedarf ergänzt. Die verbleibenden
Planungsaufträge Findling, Felsgruppe, Eisblock, Schneeberg gehören zu Steinen/Eis/Geologie;
Tiere sind ein unabhängiger späterer Bereich.

**Habitat-Schutz:** Mangrovenwurzeln stehen ausschließlich auf Land in geeigneten warmen
Feuchtgebieten, ihre Kronen dürfen angrenzendes Wasser überragen. Flusskorridore blockieren
auch breite liegende Baumstämme. Alte Fehlplatzierungen werden anhand von Habitat und
Flussmasken überprüft. Nur katalogisierte Grafiken werden zuverlässig automatisch verteilt;
optische Einzelfreigaben der 77 Uploads stehen weiterhin aus.

---
**Grafik-/Habitat-Korrektur v0.16 (19.10.2026):** Der Flusskörper wird nicht mehr mit Canvas-Strichen gemalt, sondern als gefüllte, entlang realer Hexkanten orientierte Wasser-Segmentmaske mit weichem Alpharand und ohne Sandkante gerendert. Fluss-Sperrflächen verhindern Nature-Platzierungen im Wasserkanal, auch bei manuellen Aktionen; bisherige, überprüfbar unzulässige Instanzen werden beim Laden des Nature-Katalogs, bei relevanten Änderungen sowie per **„Fehlplatzierungen prüfen und bereinigen“** entfernt. Mangroven bleiben auf feuchte, warme Uferlandhexe beschränkt und dürfen visuell in angrenzendes Wasser hineinragen. Palmen stehen ausschließlich in Dschungel/Savanne. Der aktuelle Bestandskatalog enthält unverändert **181 PNGs** aus **17 Familien**; die Habitatfreigaben wurden familienweise geprüft. Die neu erstellten zusätzlichen Pflanzen sind noch **nicht im Repository eingelesen**; der offene Sprite-Produktionsplan enthält nur noch vier geologische Aufgaben (Findling, Felsgruppe, Eisblock, Schneeberg). Zur Detailprüfung: [Habitat- und Fluss-Audit](docs/NATURE_HABITAT_AUDIT.md). Ein echter Bild-/Browser-QA-Lauf bleibt nötig.

**Fluss- und Palmenkorrektur v0.15:** Flüsse verlaufen entlang der Hexkanten und Hex-Ecken, wie die Küsten-Overlays. Die Küsten-PNGs bleiben unverändert; sie definieren die Ausrichtung, nicht das Flussmaterial. Für den Fluss wird Wasser ohne Strand mit transparenter Kante verwendet. Die elf Palmen sind nur für warme Landbiome zugelassen, nicht mehr für Moor, Marschland oder Sumpf. Vorher erzeugte, manuell platzierte Instanzen werden nicht ungefragt gelöscht; eine neue Naturverteilung entfernt alte Zufallsplatzierungen.

## Flusssystem (v0.14.0)

Die frühere fest eingezeichnete Flussdemo mit Sand-/Uferstreifen wurde durch ein richtungsabhängiges, an die sechs Hexseiten angebundenes **Wasser-Overlay** ersetzt. Ein normales Flusssegment folgt den Hexkanten und verbindet sich an deren gemeinsamen Eckpunkten – niemals über die Hexmitte. Eine Quelle verwendet **dieselbe Flussdarstellung**, nur das nicht verbundene Ende liegt an einer Hexecke und erhält einen runden Wasserabschluss. An der Mündung läuft der Fluss in ein echtes Wasserhex aus und überblendet dort, ohne dass die Ufer-/Strandgrafik der Küstenlogik diese Einmündung überzeichnet. Das Wasser wird aus dem tatsächlichen Mündungs-Wasserbild bezogen; am Rand wird lediglich die Transparenz ausgeblendet, sodass Grasland, Tundra, Savanne, Gebirge oder Dschungel darunter erhalten bleiben.

Im Bereich **Flüsse – richtungsabhängige Hexsegmente** kannst du mit **Testfluss mit Wasserhex erzeugen** sofort einen Fluss samt echtem Wasser-Mündungshex testen oder einen Verlauf Hex für Hex zeichnen. Außerdem kannst du ein Landhex als Quelle auswählen und die kürzeste erreichbare Route bis zum nächsten Wasserhex erzeugen, Flussbreite einstellen, Flüsse löschen und Anschlüsse im Debugmodus prüfen. Existiert kein Wasserhex, kann kein gültiger Fluss erzeugt werden. Routen werden gespeichert und im Szenenexport mitgeführt. Näheres unter [Flusssystem](docs/RIVER_SYSTEM.md).

## Nature-Import: 33 neue Grafiken (19.10.2026)

Die 33 neu gepushten PNGs sind als reale Nature-Assets eingetragen: 8 Baumstümpfe (`deadwood`), 4 Erlen und 4 Weiden (`riparian_trees`), 3 Marulabäume (`savanna_trees`), 4 Tundra-Zwergsträucher (`cold_bushes`), 4 Schilfgruppen (`reeds`), 3 Sukkulenten (`succulents`) und 3 weitere Wacholder (`conifers`). Der **Nature-Katalog hat 181 Einträge**; die bereits bestehenden 148 Metadaten wurden nicht überschrieben. Die beiden versehentlich doppelt gepunkteten PNGs sind bei identischem Bildinhalt von `Marula2..png` und `Tundra_Zwergstrauch4..png` auf `Marula2.png` bzw. `Tundra_Zwergstrauch4.png` korrigiert.

Der **Sprite-Planungskatalog enthielt damals 11 offene Vorhaben und 34 abgeglichene Altposten**; der neuere v0.16-Stand mit vier offenen Geologie-Arten steht oben. Schilf, Weide, Erle, Baumstumpf, Tundra-Zwergstrauch und Sukkulente gelten als vorhanden. Die FloraV2-Referenz umfasst **106 Gruppen mit 181 echten PNG-Aliassen**. Einträge bleiben `candidate` bis zur optischen Prüfung. Normale Kapokbäume sowie Wald- und Dschungelgenerierung sind unverändert.

---

# Vedras Reiche – Asset-Labor v0.13.0 (zusammengeführt)

## Wälder und Dschungel (v0.12.0)

Das Asset-Labor besitzt nun eine zusätzliche **Waldschicht** unabhängig von Terraintexturen und Biomen: `light_forest`, `dense_forest` sowie einen **ein Hex breiten Waldrand-Auslauf**, durch den auch benachbarte Hexe mehr Bäume erhalten. Das eigenständige Jungle-Biom `jungle` lässt sich auf Landhexen als Dschungelgebiet markieren; vorhandener Waldboden dient bis zu einem echten Jungle-Terrain ausschließlich als visuelle Fallbacktextur. Seed-basierte Waldgruppen, Biomverträglichkeit, individuelle Nature-Größen und -Abstände werden berücksichtigt. Testkarte: **Natur auf Karte verteilen → Wälder & Dschungel**. Die Waldklassen werden in der Szene gespeichert und pro Hex als `forestByHex` exportiert. Für technische Details und noch offene Hauptspiel-Integration siehe [Wald- und Dschungelsystem](docs/FOREST_SYSTEM.md).

**Kapokbäume:** Alle acht `tree_12.png` bis `tree_19.png` sind normale, im Dschungel automatisch und manuell platzierbare Kapokbäume. Die frühere Journal-/API-Klassifizierung beruhte auf einem Missverständnis und wurde vollständig aufgehoben.


**Aktueller Stand:** v0.11.0 mit 37-Hex-Testkarte, 17 tatsächlich offenen Spritearten (ursprünglich 45 Planposten) und geprüftem Bestandsmanifest: 25 Geländequellfamilien (104 PNGs), 148 Nature-PNGs einschließlich acht gewöhnlicher Kapokbäume. Eindeutige Dateinamen liefern Metadatenvorschläge, bestehende Katalogwerte werden nicht überschrieben. Neue Vorschläge bleiben bis zur Bildabnahme Kandidaten.

**[Quellcode auf GitHub](https://github.com/markusjungblut/asset_labor)** · **[Verbindliche Grafikentscheidungen](https://github.com/markusjungblut/browsergame/blob/main/docs/graphics/Design.md)** · **[Release-Hinweise](README_V0110_UPDATE.md)**

Die historischen Versionsnotizen folgen unten. Für den aktuellen Stand gelten die v0.11.0-Regeln.

---

> **Aktuell v0.10.9:** Gerichtete Bergschlagschatten, live gespeicherte Instanzregler und Kettenabstände. Siehe [README_V0109_UPDATE.md](README_V0109_UPDATE.md) und [DESIGN_V0109_ADDENDUM.md](DESIGN_V0109_ADDENDUM.md).

> **v0.10.9 – Bergketten, Kernzone statt gesperrtem Hexring und Berganker Y=0,67:** Siehe `README_V0108_UPDATE.md`.

> **v0.10.7 – Bergplatzierung mit reservierten Hexringen:** Siehe `README_V0107_UPDATE.md`.

> **Asset-Labor v0.10.6:** Wasserbilder werden ohne innere Bildwiederholung einmal pro Hex dargestellt. Keine 22-%-Randmischung mehr. Die unveränderten v0.10.5-Uferoverlays, Nature-Sprites und das Landrelief bleiben bestehen. Siehe `README_V0106_UPDATE.md`.

**Aktueller Stand v0.10.5:** Küstenwasser-Migration, Wasser-Mixing, 6 Seiten der Ufer-Overlays; siehe [README_V0105_UPDATE.md](README_V0105_UPDATE.md) und [DESIGN_V0105_ADDENDUM.md](DESIGN_V0105_ADDENDUM.md).

> Stand: v0.10.4 – Wasser-Wasser-Mixing + Shoreline-Overlay-System. Details in `README_V0104_UPDATE.md`.

> **Neuer eigenständiger Renderer-Bugfix v0.10.3:** [README_V0103_UPDATE.md](README_V0103_UPDATE.md) – nahtlos wiederholbare Wassertexturen, A/B-Diagnose, keine Änderung an PNG-Dateien oder Landrelief.

> **Neue Version v0.10.2:** Siehe [README_V0102_UPDATE.md](README_V0102_UPDATE.md) für flaches Wasser, Wasser-zu-Wasser-Übergänge, Wasserklassifizierung und Tests.

> **Neue Version v0.10.1:** Siehe [README_V0101_UPDATE.md](README_V0101_UPDATE.md) für Installation, automatische Regionstests, den Nature-Katalog-Regressionsschutz und das Gebäude-Relief.

# Vedras Reiche – Asset-Labor v0.10.3

**Lokal startbarer Grafikviewer für eine modulare 2,5D-Pointy-Hex-Weltkarte.** Diese Version ist ein **technischer Teststand**, kein produktiver Kartenrenderer. Die zentrale Neuerung ist ein expliziter Geländekatalog mit geänderter Auto-Tiling-Materialmischung.

## Neuer Teststand v0.10.1 – Sanfte Hügel ohne Biomextra-Texturen

Das Asset-Labor hat unter **Hügel & Relief** fünf geometrisch definierte, deterministische 2,5D-Hügelprofile, einen Höhenregler, rechtsseitigen Lichteinfall, automatische Kontinuität über Hexgrenzen, einen A/B-Flachland-/Relief-Vergleich und zwei 19-Hex-Beispielkarten. Jedes Profil wird auf den bereits zusammengesetzten Bodenraster angewandt; Bäume, Felsen und Teststraßen folgen derselben Höhe. Terrainmaterial und Relief sind zwei unabhängige Schichten; vorhandene Biome, Sprite-Presets und Kataloge bleiben erhalten.

**Für bestehende Installationen:** Nur das `v0.10.1_Update.zip` über die vorhandenen Programmdateien entpacken, vorher `assets/` sichern. Der neue Startport ist **8771**, sofern frei. Siehe [README_V010_UPDATE.md](README_V010_UPDATE.md). Die geänderte Demo ist **noch keine vollwertige 3D-Engine**; Relief wird per CPU-gestütztem Höhenraster auf der Terrain-Mischung simuliert. Beim exakten Hochrelief sowie auf großen Karten stehen Sicht- und Performancetests noch aus.

## Neuer Teststand v0.9.1 – Freigaben nach Kategorie, Presets und Schattenkontakt

- **Ganzes Biomset freigeben:** Im Nature-Inspektor unter „Gesamte Terrain-Kategorien“ beispielsweise „Kalte Regionen“, „Gras- und Weideland“ oder „Feuchtgebiete“ anhaken. Eine neue Geländeart in einer bereits ausgewählten Kategorie wird automatisch beim nächsten Laden/Rendern einbezogen. Die Abhängigkeit wird durch stabile `categoryId` statt durch einen kopierten Satz alter Terrain-IDs gespeichert.
- **Einzelarten-Ausnahmen:** Bei jedem Terrain separat „Automatisch“ (Kategorie/Preset entscheidet), „Zusätzlich“ oder „Ausschließen“ wählen. Die Ausnahme schlägt eine Kategorienfreigabe.
- **Benannte Setups:** Aktuelle Kategorien/Freigaben als Preset speichern und bei anderen Sprites über die Auswahlliste verknüpfen. Ein Preset bleibt verknüpft: Änderungen am Preset gelten für alle verknüpften Sprites. Beim Löschen eines Presets werden die bisherigen Regeln in die Sprites übernommen; ein ungespeichertes, beschädigtes Preset darf keine Zuordnungen löschen.
- **Schattenkorrektur:** Nature-PNGs werden anhand der sichtbaren Alpha-Silhouette gezeichnet; großer transparenter Rand wird bei Darstellung und Bodenanker nicht mehr als Bildinhalt gerechnet. Generische Schatten liegen nahe beim Bodenkontakt, kurz und leicht nach links (Licht von rechts). X-/Y-Versatz, Breite und Schattentiefe sind im Nature-Inspektor editierbar. Die Debug-Option „Bodenanker und Schattenkontakt markieren“ hilft bei der optischen Feinabstimmung. Große Bäume und Gebäude benötigen weiterhin eigene Schattenbilder.
- **Verlustfreie Migration:** Die alte `assets/nature/nature_catalog.json` bleibt lesbar (v1-Schema); neue Felder sind optional. Die Server-API validiert Kategorien, Presets und Schattenparameter; beim Speichern entsteht weiter eine `.bak`-Kopie. Keine neuen Nature-Sprites ohne Sidecar automatisch als freigegeben markieren.

**Installationshinweis:** Für vorhandene Nutzerbestände das **v0.9.1_Update** in denselben Labor-Ordner entpacken (vorher `assets/` sichern), nur geänderte Programmdateien überschreiben. Das Update enthält keinerlei Terrain-Bilder, Terrain-/Nature-Kataloge oder andere Nutzerdaten. Die zentrale Grafikdokumentation ist im Repository unter `docs/graphics/Design.md` auf v2.4 und wird durch das ZIP nicht auf einen alten lokalen Dokumentstand zurückgesetzt. Das vollständige v0.9.1-ZIP ist ein **separates Beispielprojekt** und ersetzt nicht die eigenen Dateien.

**Offen:** Echte Sichtabnahme des gemalten Schattens auf allen neu hochgeladenen Busch- und Baumgrafiken; vollständige 30×30-Weltgeneration und großer Performance-Test. Die generischen PNGs sind anpassbare Testschatten, keine finalen individuellen Baumschatten.

## Start

1. ZIP vollständig entpacken (keine Dateien direkt aus dem ZIP starten).
2. Unter Windows `START_WINDOWS.bat` doppelklicken. Benötigt Python 3, **keine Drittbibliotheken** für den Betrieb.
3. Die im Konsolenfenster angezeigte Firefox-/Browser-URL öffnen. Startport ist **8774**; bei Belegung weicht der Starter auf den nächsten freien Port aus. Browser-Tabs vom alten Labor (`8765`, `8767`) nicht wiederverwenden.
4. Im Kopf muss **Asset-Labor v0.10.3** erscheinen. Das Terminalfenster geöffnet lassen.
5. Neue Bilder nach `assets/terrain/`, `assets/nature/`, `assets/buildings/` etc. kopieren und auf **Neu einlesen** klicken.

`http://127.0.0.1:<angezeigter-port>/api/version` liefert die Server- und Ordneridentität.

Ohne Python lässt sich `index.html` auch direkt öffnen; über **Ordner importieren** können Dateien eingelesen werden. Änderungen am Katalog können in dieser Betriebsart exportiert werden. Ein Browser darf importierte Ordner **nicht automatisch wieder beschreiben**.

## Fix v0.8.1 – „Neu einlesen“ behält Zuordnungen

In v0.8.0 wurde beim erneuten Laden der Assetliste der Katalog vom Server unabhängig vom aktuellen Bearbeitungsstand ersetzt; nicht zuvor ausdrücklich gespeicherte Grafikzuordnungen konnten dadurch unter „Nicht zugeordnet“ zurückfallen. v0.8.1 behebt diesen Fehler:

- **Neu einlesen** lädt neue Dateien, ohne die aktuellen Bearbeitungen zu verwerfen. Ausstehende Änderungen werden zuerst gespeichert; bei einem Speicherfehler bleiben die lokalen Zuordnungen bestehen und es erscheint eine Meldung.
- Der lokale Server **speichert Änderungen automatisch** (mit kurzer Verzögerung), seriell nach Änderungsstand. Das manuelle Speichern bleibt möglich.
- Beim Speichern des Katalogs wird die vorherige Datei als `assets/terrain/terrain_catalog.json.bak` gesichert. Bereits zuvor durch v0.8.0 verlorene, nie gespeicherte Zuordnungen können dadurch allerdings nicht rückwirkend rekonstruiert werden.
- **Wichtig beim Update:** Für eine vorhandene v0.8-Installation das kleine **Hotfix-Update-ZIP** in genau den alten Asset-Labor-Ordner entpacken und die gleichnamigen Programmdateien ersetzen. **Nicht `assets/terrain/terrain_catalog.json` überschreiben oder den Ordner `assets/` durch den aus einem frischen Vollpaket ersetzen.** Dadurch bleiben alle bereits hinzugefügten Bilder, Kategorien und Zuordnungen erhalten. Vorher die vorhandene `terrain_catalog.json` zur Sicherheit kopieren.
- Alte Serverfenster schließen und `START_WINDOWS.bat` neu starten. Im Kopfbereich muss **v0.8.1** stehen. Zum endgültigen Auslagern oder vor einem Ordnerwechsel immer zusätzlich **Katalog exportieren**.

### Fehlerprüfung

1. Eine vorhandene Grafik auswählen und einer anderen Geländeart zuordnen.
2. Sofort „Neu einlesen“ drücken, ohne zuvor manuell „Katalog speichern“ zu benutzen.
3. Die Zuordnung muss bleiben und nach einem Browser-Neustart weiterhin geladen werden. Der neue Bildbestand muss ebenso eingelesen werden.
4. Im Servermodus zeigt der Katalogstatus nach erfolgreichem Speichern keine offenen Änderungen mehr an.
5. Ohne lokalen Server muss der Katalog als JSON exportiert werden; ein reiner Ordnerimport hat keine Schreibberechtigung.

## Neuer Geländekatalog

Die Grafikbibliothek gruppiert Terrainassets jetzt in der Hierarchie **Kategorie → Geländeart → Varianten**. Es gibt die sechs vereinbarten Kategorien mit 19 Geländearten:

- **Wasser und Küste:** Ozean, Küstengewässer, Küste
- **Kalte Regionen:** Gefrorene Tundra, Tundra, Schneefelder
- **Gras- und Weideland:** Grasland, Weideland, karges Weideland
- **Warme Regionen:** Savanne, Dschungel
- **Feuchtgebiete:** Moor, Marschland, Sumpf
- **Trockene Regionen:** Steinwüste, Sandwüste, Lehmwüste, Badlands, Ödland

Eine **siebte, ausdrücklich als Testbestand gekennzeichnete Kategorie** „Weitere Testgelände“ verwaltet zusätzlich die vier älteren Demo-Texturen Waldboden, Hügelboden, Gebirgsboden und trockener Boden. Sie sind keine stillschweigenden Varianten von Grasland, sondern eigene Testarten. Daraus ergeben sich derzeit **7 Kategorien und 23 Geländearten**.

Über **Neue Kategorie anlegen**, **Neue Geländeart anlegen** und die beiden Bearbeiten-Bereiche kannst du Kategorien und Geländearten anlegen, umbenennen, verschieben oder archivieren. Die IDs bleiben dabei stabil.

### Neue Grafik richtig einsortieren

1. Eine vollflächige, rechteckige Bodenmaterialgrafik in `assets/terrain/` kopieren und **Neu einlesen**.
2. Sie steht ohne gültige Zuordnung unter **Nicht zugeordnet**. Die Dateibenennung alleine ist **keine** automatische Biomerkennung.
3. Grafik auswählen, rechts unter **Geländeart der Grafik** die korrekte Art auswählen (z. B. Tundra).
4. **Automatische Speicherung:** Im lokalen Servermodus wird jede neue Geländearten-Zuordnung und Kategorie-/Typänderung nach kurzer Verzögerung automatisch nach `assets/terrain/terrain_catalog.json` geschrieben. **Katalog speichern** ist zusätzlich als sofortige manuelle Sicherung vorhanden. Im reinen HTML-/Ordnerimport-Modus muss der JSON-Export weiterhin heruntergeladen und eigenständig in den richtigen Ordner kopiert werden.
5. **Auf ausgewähltes Hex setzen** oder eine gesamte Test-Biomgruppe mit derselben Grafik belegen.

Der Katalog lässt sich auch **exportieren, importieren und neu einlesen**. Die von dir erstellten IDs sind beständig; veränderte Anzeigenamen verursachen keine Identitätswechsel. Eine Szene kann exportiert und wieder importiert werden. Alte Szenen aus v0.6/v0.7 werden mit ihren explizit zuordenbaren Grafiken gelesen; unbekannte Grafiken/Typen werden **nicht** willkürlich auf Grasland gemappt, sondern übersprungen und gemeldet.

**Mitgeliefert:** Vier Tundra- und vier Gefrorene-Tundra-Grafiken aus dem bisherigen Entwurfsprozess, ausdrücklich als **KI-Kandidaten** und **nicht als bewiesen nahtlos wiederholbar** deklariert.

## Auto-Tiling v0.8

- **Getrennte Schalter:** „Geländeartenübergänge“ für verschiedene Arten und „Nur Varianten derselben Geländeart mischen“ für Varianten **derselben** Art.
- **Ein gemeinsames Weltkoordinatenfeld:** Ein Materialpunkt wird nur einmal berechnet, nicht mit getrennten Hexclip-/Alpha-Layern überlagert.
- **Gemeinsame Verformung:** Die organische Kantenunregelmäßigkeit basiert auf einer identischen Weltposition für alle angrenzenden Materialien. Sie erhält die Symmetrie entlang derselben Grenze.
- **Normierte Eckmischung:** Bis zu drei benachbarte Materialproben teilen sich die Gewichte. Es entstehen keine zusätzlichen unabhängigen Eck-Overlays.
- **Kernzonenschutz:** Außerhalb des Übergangsbandes bleibt das eigene Material unverändert; weiter ins Innere reichende keilförmige Ausläufer werden vermieden.
- **Bilineare periodische Abtastung** statt ausschließlich ganzzahliger Quellpixelabtastung; periodische Nahtprobleme der ursprünglichen PNG können aber weiterhin sichtbar sein.
- **Sonderfall Küste/Wasser:** Bei diesen Geländearten ist ein eigenes Ufer-/Gewässerprofil vorgesehen. Solche Kanten werden derzeit **nicht** wie normale Erdmaterialien ineinandergeblendet. Das vollständige Shoreline-System ist noch nicht implementiert.

Rechts im Viewer findest du Kantenbreite, organische Unregelmäßigkeit, Dreifachkontakt-Test, Nahtkontrolle, hohe Zoomstufen und Diagnosemodi. Im Bereich **Ausgewähltes Hex** wird jetzt ausdrücklich erklärt, ob der jeweilige Nachbar ein Variantenwechsel, eine Geländeartengrenze oder eine ungeklärte Uferregel ist.

### Gebäude und Nature-Sprites

Die Objekt-Grafiken bleiben getrennte Sprites; der Terrainblender verändert sie nicht. Die derzeitige Testmine enthält noch eine unpassende Bodenzone und ist **kein finales Produktionsasset**. Künftige Gebäude-Grafiken werden ohne biomeigene Gras-/Schnee-/Sandfläche erzeugt und bekommen gemäß Designstandard einen separaten, individuell gemalten Bodenschatten. Das Testmaß Level-1-Mine beträgt 160 logische Einheiten, Gebäudebreite maximal 192 bei Hexbreite 256.

## Entwicklertests

Im Projektordner (nur für die Tests benötigst du Playwright / pytest und einen installierten Chromium-Browser):

```bash
python tests/test_v08_browser.py
python tests/test_catalog_api.py
```

Der erste Test verwendet eingebettete Grafikdateien, da direkte Browsernavigation auf localhost in manchen Ausführungsumgebungen administrativ blockiert sein kann. Der zweite Test startet den Python-Server selbst und prüft Katalog-API, persistentes Schreiben und ungültige Payloads.

Numerische Kriterien der Materialmischung mit künstlichen Farbflächen: an der Zweiergrenze ungefähr (127,128,0), an der symmetrischen Dreifachgrenze (85,85,85), im Feldzentrum 100 % eigene Farbe. Diese Tests sind keine visuelle Freigabe aller generierten Materialbilder.

## Grenzen und Folgearbeiten

- Die Texturen sind **nicht alle nahtlos wiederholbar**. Die v0.8-Rechnung löst die geometrische Mischnaht, nicht jeden sichtbaren Wiederholungsbruch einer KI-Quelltextur.
- Bilder mit fester Seitenwand/Hexblock, schwarzem Hintergrund oder großen bereits hineingemalten Steinen sind keine freigegebenen Terrain-Bases.
- Das Terrain wird im Viewer auf der CPU als zusammenhängender Canvas2D-Bildpuffer erzeugt und gecacht. **Performance mit 200+ sichtbaren Hexen** und auf schwächeren Firefox-/Mobilgeräten bleibt ein separates Gate; für eine große Spielwelt sind Chunks und/oder GPU-Rendering nötig.
- Gezielte Übergangsprofile für Küste/Ufer, Höhenstufen und Wasser sowie ausführliche A/B-Materialtests müssen noch ausgebaut werden.
- Die Asset-Labor-Tests sind **kein Gameplay- oder produktives Weltkarten-Abnahmeprotokoll**.

Die zentralen Grafikvorgaben liegen in `Design.md`, die Meilensteinplanung in `AUTOTILING_PLAN.md`. Die **maßgeblichen Projektversionen** werden im GitHub-Repository unter `docs/graphics/` gepflegt.

---

## Neues in v0.9.0 – Nature-Sprite-Verwaltung

Das Labor ergänzt einen **separaten Nature-Katalog** unter `assets/nature/nature_catalog.json` mit automatischer Speicherung, Import und JSON-Export. Über den rechten Nature-Sprite-Inspektor lassen sich für jeden freigestellten Busch, Baum, Felsen, Kaktus oder sonstigen Gegenstand IDs, Herkunft, Familie, Größe, Schatten, Bodenanker, geeignete Geländearten und Platzierungsregeln bearbeiten.

**Startport: 8769**; die Version wird in Kopfzeile und `/api/version` angezeigt. Für bestehende Installationen bitte **das kleine v0.9-Update-Paket benutzen**, das Terrain-Katalog und eigene Grafiken nicht überschreibt. Siehe `README_V09_UPDATE.md`.

**Ablauf für neue Sprites:** PNG in `assets/nature/` plus gleichnamige JSON-Sidecar aus `NATURE_SPRITE_CONTRACT.md` ablegen → „Neu einlesen“ → rechts prüfen → „Nature-Sprites auf Testkarte verteilen“. Mehrere Instanzen können unterschiedlich auf einem Hex stehen. Die Verteilung ist reproduzierbar, nicht beim Neuladen neu ausgewürfelt. Die bisherigen Platzhalter bleiben Testgrafiken; es wurden keine der Nutzer-Vorlagen automatisch zu fertigen Einzel-PNGs erklärt.

Der bisherige Terrainrenderer bleibt erhalten. Eine große, vollwertige Weltgeneration mit 30×30 Feldern und optimiertem Chunk-/GPU-Rendering ist **noch nicht implementiert**; v0.9 dient bewusst als erster geprüfter Nature-Sprite-Produktionsvertrag.

Testaufrufe: `python tests/test_nature_v09_api.py` (Server) und `python tests/test_nature_v09_embedded.py` (Browser via Playwright/Chromium). Die älteren v0.8-Browser-Testskripte werden historisch mitgeliefert und sind nicht auf alle neuen v0.9-IDs aktualisiert.

**Dokumentationsstand:** Die mitgelieferte `Design.md` ist ausdrücklich ein älterer Offline-Schnappschuss. Der aktuelle verbindliche Stand ist [aktueller Design.md](https://github.com/markusjungblut/browsergame/blob/main/docs/graphics/Design.md) plus [Nature-Sprite-Vertrag](https://github.com/markusjungblut/browsergame/blob/main/docs/graphics/NATURE_SPRITES.md) im Repository. Die eigenständig nutzbare detaillierte Nature-Anleitung liegt hier lokal als `NATURE_SPRITE_CONTRACT.md`.


## Quellcode und geplanter Sprite-Katalog (v0.11.0)

Der kanonische **Asset-Labor-Quellstand** liegt im separaten Repository [markusjungblut/asset_labor](https://github.com/markusjungblut/asset_labor). Dort liegen Programmcode, Tests und `plans/sprite_catalog_plan.json` (17 offene Vorhaben, 28 abgeglichene ältere Planposten). Designentscheidungen aus dem Gesamtspiel werden weiterhin in `browsergame/docs/graphics/Design.md` abgestimmt.

**Git-Stand nach Nutzer-Commit vom 18.10.2026:** In `assets/` sind inzwischen 148 Nature-PNGs, 104 Terrain-PNGs, 4 Schatten-PNGs und 6 Ufer-PNGs versioniert. Ebenso sind `assets/nature/nature_catalog.json` und `assets/terrain/terrain_catalog.json` jetzt eingecheckt. Die Nutzerin/der Nutzer hat die vorher ergänzten PNG-/Katalog-Ignore-Regeln ausdrücklich entfernt. Neue Bilder werden dadurch bei `git status` angezeigt, gelangen aber **erst nach `git add`, `git commit` und `git push`** nach GitHub; ein Dateikopiervorgang allein reicht nicht. `.bak` und temporäre Dateien bleiben ignoriert. Katalogspeicherung im lokalen Servermodus erzeugt vor dem Überschreiben ein Backup; individuelle vorhandene Zuordnungen werden beim automatischen Vorschlag nicht ersetzt.

**Dateinamen-Audit:** `plans/terrain_asset_plan.json` ordnet die 25 vereinbarten Terrainfamilien ihren 104 tatsächlich vorhandenen PNGs zu. `stormy_ocean_01.png` bis `stormy_ocean_08.png` sind nach Nutzerumbenennung einheitlich benannt. Das frühere `mountain_01.png` ist im aktuellen Repository nicht mehr enthalten. `cosatal_water_*` bleibt aus Bestandsschutz unter seinem bisherigen Dateinamen, ist aber als `coastal_water` klassifiziert. Waldboden (`wald_*`) ist ein Sondermaterial, kein automatisch eigener Weltbiomtyp. Neue `marula*`- oder `wacholder*`-Bilder gehören in `assets/nature/`, nicht in `assets/terrain/`.

**Kapokbäume (Korrektur):** `tree_12.png` bis `tree_19.png` sind acht normale Dschungelbäume mit den IDs `kapok_tree_12` bis `kapok_tree_19`, `kind=tree`, `family=jungle_trees`, Größenklasse `giant` und der Geländeart `jungle`. Sie werden wie andere Nature-Bäume manuell oder automatisch platziert. Es gibt keine separate Kapok-API und keine Journal-Sonderbehandlung. Die ursprünglichen PNG-Dateinamen bleiben erhalten. Alle vorhandenen Nature-Grafiken dürfen auf der Testkarte auch im Status `candidate` verwendet werden, wenn die Biomfreigaben passen.

### Neue PNGs & Verteilung (Oktober 2026)

Neue Bilder in `assets/nature/` kopieren und im laufenden lokalen Asset-Labor **Neu einlesen**. Die Server-Assetliste erkennt PNGs ohne weiteren Code, aber die automatische Metadatenklassifizierung funktioniert nur für **bekannte, exakt geprüfte Namensfamilien**: beispielsweise `wacholder4.png`, `wacholder_04.png`, `marula_01.png`, `marulabaum1.png` und `marula-baum_01.png`. Ein unbekannter Dateiname erscheint weiterhin in der Bibliothek; seine Klasse und Biome müssen manuell im Nature-Inspektor festgelegt und gespeichert werden. Bestehende individuelle Metadaten werden nicht überschrieben.

Der Button **Nature-Sprites auf Testkarte verteilen** (ebenso die Schnellaktion **Natur verteilen**) verwendet auch `candidate` und `test`; dies gilt ausschließlich zum Testen, nicht als Produktionsfreigabe. Es zählen ausschließlich passende Geländearten und die jeweilige Dichte-/Abstandslogik. Bei 0 Instanzen zeigt die Oberfläche nun einen Grund an, statt stillschweigend 0 zu melden. Kapokbäume `tree_12`–`tree_19` sind normale Dschungelbäume und dürfen platziert werden.

**Palmen:** `palme_01` bis `_05` gehören zur Familie `palms`, Größenklasse `medium` (126 Welt-Höheneinheiten); `_06` bis `_11` sind `large` (174). Alle bleiben auf Landbiome (`warm_regions`, `wetlands`) begrenzt, nicht auf offenes Küsten-/Ozeanwasser. Dies sind relative Bildschirmgrößen, keine realen Meter. Die botanische Unterart bleibt ungeklärt.

## Vegetationskatalog & bereinigte Aufgabenliste (18. Oktober 2026)

Der **Sprite-Planungskatalog ist keine Liste sämtlicher Grafikarten**. Die alte Sammlung von 45 Arten enthielt bereits produzierte Naturgrafiken unter abweichenden englischen Soll-Dateinamen. Daraus entstand die missverständliche Anzeige `0 von 45 Bilddateien`. Der bereinigte Plan hat **17 noch offene Arten**. Weitere 28 ältere Einträge stehen unter `resolved`: **21** werden durch vorhandene Varianten abgedeckt beziehungsweise nicht eigens benötigt; **7** Kleinstobjekte werden nicht als einzelne Nature-Sprites produziert, sondern gegebenenfalls in Terrain-Bodenmaterial integriert. Im Viewer steht deshalb die Zahl *noch offener Vorhaben*, nicht die irreführende 45er-Quote. Vorhandene Bilder verbleiben im realen Nature-Katalog; es wurden weder Platzhalterbilder noch leere Sidecars angelegt.

**Büsche:** `bush_01`–`04` mittel; `05`–`06` klein; `07`–`10` groß; `11`–`14` mittel; `15` klein; `16` mittel; `17`–`19` groß; `20`–`29` trockene Büsche (Größe derzeit grob als 20–24 mittel und 25–29 klein angesetzt); `30`–`33` mittel; `34`–`41` echte Buschgruppen (`kind=cluster`). Die zehn Trockenbüsche bekommen die Familie `dry_bushes`, die anderen stehen unter `temperate_bushes`. Die Gruppengrößen und Trockenbusch-Feinabstufungen bleiben später optisch justierbar.

**Beschneite Nadelhölzer:** `tanne_schnee_01`–`05` heißen im Katalog *Verschneite Kiefer*, `tanne_schnee_06`–`10` *Verschneite Tanne*. Diese Einteilung ist vom Nutzer frei gewählt, keine botanische Bestimmung. Die ursprünglichen Dateinamen und Sprite-IDs bleiben aus Kompatibilität erhalten. Die elf unbeschneiten `tanne_01`–`11` bleiben vorläufig Tannen und können später als Kiefern neu zugeordnet werden.

**Kapokbäume:** Die acht Bilder `tree_12`–`19` gehören zur Familie `jungle_trees` und erscheinen als normale Bäume auf Dschungel-Hexen. Ihre IDs wurden in `kapok_tree_12`–`kapok_tree_19` geändert; der frühere Journal-/API-Sonderstatus wurde entfernt.

**Als noch offen gelten unter anderem:** Schilf, Farn, Kakteen, Mangroven und deren Gruppen, Weide, Erle, markantes Totholz, größere Felsen und Eisblöcke. Klee, Moospolster, Alpengras sowie mehrere weitere Kleinstobjekte werden nicht mehr als Einzel-PNGs geplant. Für bereits hergestellte Varianten wie Thymian, Wacholder, Buschgruppe, Akazie, Palmen und Tannen gibt es keine unnötigen Doppelaufträge. Neue Dateinamen lassen sich gegebenenfalls auch über im Plan aufgeführte deutsche Aliasse zuordnen.

## Branch-Zusammenführung: FloraV2 als zusätzliche Referenz

Der frühere Branch `codex/flora-v2-asset-registry` wurde in `main` integriert. Seine 37 Pflanzenfamilien-Verzeichnisse und die FloraV2-Referenz mit 104 Kategorien sind im **FloraV2 – Pflanzenreferenz**-Panel durchsuchbar. Das ist **kein neuer Produktionsauftrag** und überschreibt weder den bestehenden Nature-Katalog (148 real vorhandene PNGs) noch die 17 tatsächlich offenen Spritearten. Die ursprüngliche FloraV2-Baumverteilung wurde **nicht** übernommen: Sie würde die neuere Wald-/Dschungel-Engine einschließlich der gewöhnlichen Kapokbäume ersetzen. Ihre Daten und die historischen Waldprofile stehen als Referenz zur Verfügung. Terrain-Seed-Werte sind informativ und überschreiben nicht die realen Geländezuweisungen.

Die 37 Ordner enthalten ausschließlich textliche `_ASSET_PLAN.md`-Referenzen, **keine PNG-Platzhalter**. Für die tatsächliche Erstellung neuer Sprites gilt allein die aktuelle Produktionsliste `plans/sprite_catalog_plan.json`.

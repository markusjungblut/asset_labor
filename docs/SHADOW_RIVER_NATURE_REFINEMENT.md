# Asset-Labor · Schatten-, Fluss- und Natur-Feinabstimmung (19.10.2026)

## Ziel

Die Landschaft orientiert sich an der Konzeptgrafik: große Objekte erzeugen
breite, **kurze und weiche** Schatten direkt links ihres Fußes, Flüsse
winden sich entlang der Hexkanten, Bäume werden kleiner und häufiger.
**Waldboden-Texturen, ihre Masken und ihr Übergangsrenderer bleiben unangetastet.**

## 1. Gemeinsame Schattenstärke

Unter **Natur auf Karte verteilen → Große Berge → Gemeinsames
Schattensystem** steuert „Globale Schattenstärke“ (0–100 %) die
Opazität von Berg-, Baum-/Busch-, Gebäude- und Einheitenbodenschatten.
0 % unterdrückt alle generierten Schatten und dämpft zusätzliche
zugeordnete PNG-Schatten. Die Schattentönung ist neutral dunkelgrün/grau
statt tiefschwarz. Berge besitzen weiterhin eigene, relative Opazität.

## 2. Bergschatten kalibrieren

Auf das Hex mit dem **Berganker** klicken; Regler verändern dann diese
Berginstanz (Szenenpersistenz). Ohne ausgewählten Berg konfigurieren
die Regler die Vorgaben für neue Berge. Wählst du links eine Berg-
oder Gebäudegrafik, kannst du deren Einstellungen per **„Für ausgewählte
Berg-/Gebäudegrafik speichern“** als Assetprofil übernehmen.

* **Relative Intensität**: schwächt oder verstärkt den einzelnen Berg.
* **Reichweite**: Länge des Schattenwurfs nach links.
* **Weichheit**: Blur/Penumbra, kein scharfer Schatten-Speer.
* **Schattenursprung X/Y**: unabhängige Verschiebung der
  *Schattensilhouette* gegenüber dem tatsächlichen Sprite-Anker.
  Negatives X rückt den sichtbaren Schatten weiter links an den Bergfuß.
* **Flächenbreite**: horizontale Ausdehnung des schräg projizierten Bildes.
* **Breite des Kontaktschattens**: zusätzliche breite, weiche Bodenhaftung.

Die Werte werden in der lokalen Szene gespeichert und im Szenen-JSON
exportiert/importiert. „Auf alle Berge und neue Berge anwenden“ überträgt
die aktuelle Form auf alle Berginstanzen. „Individuelle Korrektur
zurücksetzen“ entfernt die Instanzwerte.

**Interaktiver Ursprung:** „Schattenursprung anzeigen · goldenen Punkt
ziehen“ aktivieren, einen Berg auswählen, den goldenen Punkt am
Schattenursprung anklicken und verschieben. Das verändert nur den
Schatten, nicht die spielmechanische Bergposition. Loslassen speichert
die verschobenen X/Y-Werte. Der vorhandene Modus „Nur Schlagschatten …
(Debug)“ zeigt zusätzlich alle Bergschatten ohne Objektgrafiken.

Die Schatten verwenden weiterhin die alpha-cropped PNG-Silhouette.
Sie sind eine künstlerische 2,5D-Näherung; es wird kein physikalisch
korrekter 3D-Lichtwurf behauptet.

## 3. Fluss

Die reale Hex-Kantenkette bleibt die Topologie. Die Wasserlinie
interpoliert ihre einzelnen Richtungswechsel mit kurzen und begrenzten
Kurvenfillets (quadratische Bézier-Interpolation), sodass die typischen
60°/120°-Zickzackstellen weicher aussehen. Quelle bleibt an der
echten Hexecke, die Mündung exakt am gemeinsamen Küsten-Seitenmittelpunkt.
Eine einzige Maske bestimmt sowohl Wasserrand als auch Nature-Sperrzone.
Ein schmaler gedämpfter, halbtransparenter Ufersaum ergänzt die
bestehende Küstenmündung, ersetzt aber keine Küstengrafik.

Anfängliche Flussbreite: 40 Welteinheiten (bisher 32). Bestehende
gespeicherte Szenen behalten ihre individuellen Breiten.

## 4. Vegetation

Nature-Sprites werden im Renderer (nicht in PNGs, Sidecars oder
Katalog-Metadaten) um einen weiteren moderaten Faktor verkleinert.
In dichten Wäldern passen nun bis zu vier lebende Bäume und insgesamt
sieben Pflanzenobjekte pro Hex, in lichten Wäldern bis zu drei Bäume
und sechs Objekte. Automatisch freigehaltene Bauhexe, Habitatfilter,
Min-Abstände, Bergstandflächen und Fluss-Sperrflächen bleiben aktiv.
Neue Dichte gilt bei der nächsten automatischen „Natur verteilen“-Aktion.

## Prüfung

Überprüfte Tests: `tests/test_rivers.cjs`,
`tests/test_block3_shadows.cjs`,
`tests/test_block4_visual_polish.cjs`,
`tests/test_block2_nature_balance.cjs` und
`tests/test_visual_refinement.cjs`. Ein echter grafischer Browsertest
mit allen eigenen PNGs und mehreren Zoomstufen ist weiter für die
abschließende Designfreigabe erforderlich. Insbesondere Schattengröße
und Kontaktanker können für jede komplexe Berggrafik per Assetprofil
nachkalibriert werden. Kein Wald-Boden-Code wurde verändert.

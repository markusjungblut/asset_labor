# Schritt 22 – Tatsächliche Wolkentransparenz und interaktives Zoom ohne Frame-Neuaufbau

Stand: 02.11.2026. Grundlage: PR #106 / Schritt 21, auf dem 2×-Standard aus #105. Dieser Schritt **verändert keinen** 2×- oder 4×-Atlas, keine IndexedDB-Karte, keine PNGs und keine Sichtberechtigungen.

## Beobachtung im echten Firefox

Beim Bewegen blieben sichtbare Wolken inzwischen außerhalb des Haupt-Sichtfelds; die Auflösung sah aber weiterhin wie ein plötzlicher Wechsel von Weiß auf grüne Wiese aus. Bei großem Herauszoomen erschienen zeitweise erneut viele Lade-Wolken. Das Zoomen selbst war trotz Schritt 21 noch verzögert.

## Root Cause – Wolkenbild verblieb bei 100 % Deckkraft

`frozen-map-runtime.js` berechnete korrekt ein Alpha von 1 nach 0 über zuvor 560 ms. In `cloud-artwork.js/drawUnready()` erhielt aber **nur das Hex-Hintergrundpolygon** `globalAlpha=alpha`. Danach wurde der Context zurückgesetzt (`g.restore()`), die **eigentlichen Cloud-PNGs `hard` und `soft` zeichneten wieder deckend mit Alpha 1**. Die Wolken verschwanden daher erst dann vollständig, wenn das neue Alpha auf 0 sank. Ein Alpha-Test der Callback-Funktion hatte dieses tatsächliche Kompositing nicht erfasst.

### Korrektur

- Jede der vier vorhandenen Wolkenvarianten wird beim einmaligen Dekodieren in ein **einzelnes 384×384-Canvasbild** vorzusammengesetzt: vollständig deckende Hex-Kernmaske im bisherigen Hintergrundfarbton sowie vorhandene harte und weich auslaufende Wolkengrafiken. Das Original-Artwork wird nicht verändert.
- `drawUnready()` zeichnet für ein noch nicht fertiges oder gerade vollständig fertig gewordenes Hex **nur das vorbereitete Gesamtbild mit genau einem `globalAlpha`**. Bei Alpha .5 sind jetzt Hintergrund UND Wolkenkörper wirklich halbdurchsichtig. Bei Alpha 0 wird überhaupt nichts gezeichnet.
- Der Transparenzübergang beträgt **850 ms mit Smoothstep**, startet weiterhin nur, wenn die Ladewolken auf dem Bildschirm tatsächlich sichtbar waren, und betrifft ausschließlich bereits freigegebene Hexfelder, deren Bildlagen vollständig dekodiert sind.
- Die harten Sicherheits-/Autorisierungs-Wolken des unbekannten Terrains, die `drawTransitions()` erzeugt, bleiben vollständig deckend. Eine Multiplayer-Karte darf unbekannte Pixel nicht über Transparenz enthüllen.
- Solange die Überblendung läuft, kann der Renderer bei geeigneter Viewportgröße die **statische Boden-/Scenery-Komposition auch im normalen 2×-Zoom als Canvas zwischenspeichern**, sodass nicht für jedes Wolken-Alpha-Bild alle Bäume und Schatten neu gezeichnet werden müssen. Maximal 8,5 MP Ausgabe-Raster; sonst sicherer Fallback.

## Zoom-Pfad: rasches Bildschirmfeedback bei Mausradbewegungen

**Ausgangsproblem:** Unterschiedliche Zoomwerte invalidieren den gepufferten Panorama-Hintergrund; jedes Wheel-Event löste erneut Boden-, Scenery- und Wolkenkomposition aus.

**Neu:** `beginZoomPreview()` kopiert **einmal** das auf dem aktuellen Bildschrim bereits autorisierte fertige Kartenbild in ein temporäres Canvas (begrenzt auf 4 Mio Pixel). Während des Zoom-Gestures wird nur dieses Bild mit derselben Kameramatrix skaliert und verschoben. Der Renderer lädt weiterhin die benötigten sichtbaren und einen Hexring vorausliegenden 2×-WorldTiles in der bestehenden asynchronen Warteschlange, jedoch **zeichnet er die teuren Terrain-/Wolkenlayer nicht bei jedem Zoomschritt**.

Nach 145 ms ohne weiteres Zoom-Ereignis wird die Vorschau beendet. Der Viewer kann dafür bis maximal **950 ms ab Beginn des Gestures** warten, falls sichtbare Kacheln noch nachladen. Er zeichnet anschließend sofort die korrekte volle Ansicht, inklusive Hexmaske und unveränderter Sichtrechte. Die physische Canvas-DPR (bei Overview 1,25×, sonst 2×) wird **nur einmal nach dem Zoomgestus** angepasst. Während des schnellen Zoomens erfolgt **keine Terrain-Neuberechnung**. Bei sehr großem oder schnellem Zoom kann der temporäre Zwischenstand unschärfer sein oder am neuen Rand das neutrale Wolken-Grundmaterial zeigen; das final neu zusammengesetzte Bild ist pixelgenau unverändert und scharf.

Nur wenn eine zuvor nicht in der sichtbaren Kartenregion enthaltene WorldTile beim abschließenden Neuzeichnen wirklich noch nicht dekodiert ist, darf eine Ladewolke erscheinen. Sie wird anschließend bei Bereitschaft über echte Transparenz aufgelöst.

## Visuelle Abnahmetests mit echtem v1-0374527a

1. Bei normalem Zoom (70–100 %) an eine noch nicht im RAM geladene Region schwenken. Beim Laden muss **die grüne Wiese durch die Wolke sichtbar werden**, kontinuierlich von ca. 100 % bis 0 %, ohne „zack und weg“ am Ende.
2. Sobald eine Region geladen ist: Kamera vor/zurück, keinerlei neue Ladewolken auf denselben Hexfeldern.
3. Von 100 % auf 25–35 % rasch per Mausrad herauszoomen und wieder hinein. Während des Wheel-Gestures sofortiges Kamerafeedback; nach kurzem Stillstand scharfe Panoramaansicht; keine permanenten halben Wolken im bereits aufgewärmten Bereich.
4. Authored Map-Rand/Cloud-Frontier bleibt auch während der Vorschau verschleiert. Keine fremden Hexfelder oder Objekte freigeben.
5. Statuszeile zeigt `Zoomvorschau aktiv`, `Zoomvorschau-Bilder` und `Übersicht-Canvas`-Cachetreffer; `window.__vedrasFrozenGameTest.stats()` gibt `zoomPreviewFrames/zoomPreviewActive/paintMs/pending` zurück.
6. Schattierung, Baumkronen und Nahtstellen in 2× bleiben sichtbar unverändert.

## Ausführung

```powershell
cd "C:\Users\marku\Desktop\asset_labor"
git fetch origin
git switch feat/step22-true-cloud-dissolve-smooth-zoom-20261102
git pull --ff-only origin feat/step22-true-cloud-dissolve-smooth-zoom-20261102
node --test tests/test_rendering_step22_true_dissolve_zoom_20261102.cjs
```

Mit demselben Firefox-Profil und derselben Origin `127.0.0.1:8780` die archivierte Spielkarte öffnen:

`http://127.0.0.1:8780/frozen-map-game.html?scene=v1-0374527a&lod=near`

Keine Website-Daten löschen. Kein Karten-Rebake. Für die Bildumstellung wurde in Schritt 20 ein separater Cache `vedras-frozen-derived-2x-v1` verwendet; er bleibt bestehen.

## Technischer Teststatus

JavaScript-Syntax aller geänderten Dateien geprüft. Isolierter tatsächlicher Canvas-Aufruf (mit simulierter Wolkengrafik) liefert bei `opacity=0.5` **genau einen `drawImage` mit `globalAlpha=0.5`**, bei `opacity=0` keinen; im Zoom-Mock vier Zwischenframes aus der kopierten Grafik und keinen Terrain-Layer-Repaint. **Native Node-Testausführung und Browser-End-to-End mit echter 120-Tile-Karte stehen noch aus**; PR bleibt Draft.

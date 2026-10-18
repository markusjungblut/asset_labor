# Vedras Reiche – Auto-Tiling: Architektur, Testbefunde und nächste Schritte

> **Dokumentationshinweis (Asset-Labor v0.8.0):** Diese Datei ist ein mitgelieferter Offline-Schnappschuss des älteren Grafikstandards. Die **maßgebliche, aktualisierte Version** liegt im Repository unter `docs/graphics/AUTOTILING_PLAN.md`. Der lokale Implementierungsstand ist in [`IMPLEMENTATION_NOTES.md`](IMPLEMENTATION_NOTES.md) dokumentiert. Ältere Aussagen zu v0.7 und zum unfertigen v0.8-Zielstand sind dadurch als Historie zu lesen.


**Stand:** 12. Oktober 2026 · **Asset-Labor v0.7 – zusammenhängende Raster-Mischung implementiert**. Entwicklungsprototyp, keine Produktionsfreigabe für große Welten.

## 1. Verbindlicher Zweck

Die Karte soll wie eine zusammenhängende Landschaft wirken, nicht wie einzelne Kacheln. Das logisch unveränderliche Raster bleibt **Pointy-Top-Hex**, Testbreite `256` logische Einheiten, aktuelle Bodenprojektion `PROJECT_Y=0.85` (noch nicht als endgültiger Kamerawinkel freigegeben). Das Hexraster ist standardmäßig verborgen.

`terrain_base` enthält **nur Bodenmaterial**, niemals Seitenwände, gemalte Hexumrisse, große Felsen/Bäume, Schatten oder sonstige trennbare Objekte. Erkennbare Naturgegenstände liegen als getrennte `nature`-Sprites über dem Boden. Straßen und Flüsse besitzen unabhängige, hexkantenbezogene Geometrie.

## 2. Rasterdaten und Nachbarschaft

Persistiert werden Hexkoordinaten `(q,r)`, `terrainType`, optional `terrainVariant`/Assetoverride und deterministischer Seed. Die Nachbarn, Kanten, Eckkontakte, Mischmasken und Rasterpuffer sind abgeleitete Daten und gehören **nicht** in den Spielzustand.

| Seite (umlaufend ab oben rechts) | Axialdelta |
|---|---|
| 0 | `(1,-1)` |
| 1 | `(1,0)` |
| 2 | `(0,1)` |
| 3 | `(-1,1)` |
| 4 | `(-1,0)` |
| 5 | `(0,-1)` |

Die Grenz-ID wird aus den lexikografisch sortierten Zellkoordinaten gebildet; damit ist sie unabhängig von der Betrachtungsrichtung. Dreifachkontakte werden einmalig aus drei gemeinsamen Zellzentren bestimmt.

## 3. Warum v0.6 noch sichtbare Nähte hatte

Die Grundflächen wurden **separat pro Hex geclippt**; die beidseitigen 50:50-Kantenoverlays wurden anschließend unabhängig darübergelegt. An exakt gemeinsam benutzten Bildrändern trafen Antialiasing-, Alpha- und Überdeckungsoperationen aufeinander. So konnte eine sichtbare Naht entstehen, selbst wenn die Übergangsfarbe für sich plausibel aussah.

## 4. Implementierung v0.7: gemeinsames Materialfeld

1. **Weltkoordinaten:** Pro Feld wird eine gültige Terraintextur und deren `textureWorldSize` ermittelt. Für dieselbe Quelle werden **dieselben weltverankerten UV-Koordinaten** verwendet; die Textur wird nicht pro Hex neu begonnen oder gedreht.
2. **Gemeinsame Rasterisierung:** `autotile.js` erzeugt für den kleinen Testausschnitt genau **einen** transparenten Bodenkartenpuffer. Das Ausblenden der Bereiche außerhalb der 7/19 Felder erfolgt über eine **einmalige Gesamtflächenmaske**, nicht pro Hex.
3. **Materielle Mischgewichte:** Die Abstände zu den betroffenen Zellzentren bestimmen die Gewichtung. Mit einem geglätteten, endlich auslaufenden Einfluss werden bei gemeinsamem Rand die beiden Materialien zu 50:50 gemischt; im Innern dominiert ausschließlich das eigene Material. Alle Gewichte werden zu **1 normiert** – es gibt keine übereinander multiplizierten Einzel-Alpha-Overlays.
4. **Dreifachpunkte:** Wenn drei Materialien am Vertex zusammentreffen, gehen alle drei in **dieselbe** normalisierte Summe ein (im symmetrischen Prüffall jeweils etwa 1/3). Keine zusätzlichen, einander überlagernden Eck-Patches notwendig. Eine zuschaltbare Dreiweg-Option ermöglicht direkten A/B-Vergleich.
5. **Organische Grenzform:** Ein deterministisches, weltverankertes Niederfrequenzfeld kann die Grenzlage um wenige logische Einheiten variieren (`Organische Kante`: 0–12). Die Verschiebung wird für beide Beteiligten identisch aus ihren Zell-IDs und denselben Weltkoordinaten berechnet. Die Grenzlage ist **nicht** pro Sprite zufällig.
6. **Unabhängige Anzeige:** Das vollständige Bodenbild wird gecacht. Kameraverschiebung und Kamerazoom verändern **nur** den Rendertransform, nicht die Weltkoordinaten oder die gespeicherten Terrainparameter. Wenn Material, Testgeometrie, Übergangsbreite oder ein Mischparameter verändert wird, wird der Terrainpuffer neu aufgebaut.
7. **Debugging:** Kanten (orange), Materialvarianten (blau) und Dreifachkontakte (gelb) sind separat analysierbar. „Übergangsband“ zeichnet ein cyanfarbenes Diagnoseband über die aktive Materialmischung; es ist **keine** reale Alphamaske und wird nicht Teil des finalen Bodens.

Der `blendVariants`-Modus ist in v0.7 für Testansichten **standardmäßig aktiviert**, damit unterschiedliche Varianten desselben Bioms ebenfalls keine harten Kachelgrenzen hinterlassen. Das Deaktivieren ist nur für Vergleichs-/Fehlersuche sinnvoll. Ganz identische Materialien haben auch ohne den Variantenmodus keine künstliche Hexnaht.

## 5. Parameter und Assetvertrag

| Parameter | Testwert | Status |
|---|---:|---|
| Hexbreite | 256 logische Einheiten | geometrischer Teststandard |
| Bodenverkürzung | 0,85 | vorläufig |
| Übergangsbreite | 28, einstellbar 8–48 | experimentell |
| Organische Unregelmäßigkeit | 5, einstellbar 0–12 | experimentell |
| Kamerazoom | 30–240 % | implementiert |
| Normale/Fern-Darstellung | zwei Modi | implementiert |
| Terrain-Asset | opake vollflächige Textur (PNG/WebP usw.) | verpflichtendes Format |
| Gebäude-Maximalbreite | 192 von 256, 32 links/rechts frei | verbindliche Art Direction |

Beispiel-Metadaten eines Terrainmaterials:

```json
{
  "assetType": "terrain_base",
  "biome": "plains",
  "textureWorldSize": 512,
  "artStatus": "Kandidat – visuelle Prüfung erforderlich"
}
```

Mehrere Texturen einer Familie können ohne Quellcodeänderungen nach `assets/terrain/` gelegt und im Viewer per **„Neu einlesen“** importiert werden. Die Formatprüfung erkennt transparente Hexblock-Konzeptbilder, nicht jedoch semantisch jedes unerwünschte Objekt in einer ansonsten opaken Illustration.

## 6. Abnahmefälle und Befund

| Testfall | Erwartung | Stand |
|---|---|---|
| 19 Hexe, alle Gras, Raster aus | keine pro-Hex-Naht | bestanden im Browser |
| 19 Hexe, Gras↔Trockenboden | Materialmischung nur im Übergangsband | bestanden im Browser |
| Zwei homogene Farben auf gemeinsamer Kante | je 50 % ohne transparente Lücke | numerisch geprüft (127/128/0/255) |
| Drei homogene Farben am gemeinsamen Vertex | je ca. 1/3 ohne Lücke | numerisch geprüft (85/85/85/255) |
| Feldmitte mit Blending an/aus | unverändert | bestehender Regressionstest bestanden |
| Varianten derselben Familie | optionale weiche Mischung | Browser-Regression bestanden |
| 240 % Zoom | keine geometrische Hexnaht | Sichtkontrolle im Viewer, kein Pixel-Schärfe-Freigabenachweis |
| Größe/Position/A/B/Vorschaubilder | bisherige Funktionen erhalten | Browser-Regression bestanden |

**Browser-Befund:** Die bisherigen Terrain- und Auto-Tiling-Tests sowie `tests/test_autotile_v07.py` bestehen. An einer repräsentativen 19-Hex-Gras-/Trockenboden-Szene dauerte der einmalige CPU-Rasteraufbau im Headless-Browser rund **1 s**; dieser Wert ist eine **Einzelmessung**, kein garantierter Performancewert. Kamera-/Zoombewegungen verwenden denselben Cache.

## 7. Bekannte Grenzen und nächste Meilensteine

- **M2 – echte Terrainqualität:** Quelltexturen müssen auf **nahtlose periodische Wiederholung** geprüft beziehungsweise materialschonend umgebaut werden. Der neue Renderer eliminiert die **Hexnähte**, kann aber eine in der PNG bereits vorhandene harte wiederholte Texturgrenze nicht unsichtbar machen. Optional zusätzliche, handgemalte Übergangsmasken entwickeln, wenn der prozedurale Übergang künstlerisch nicht genügt.
- **M3 – Produktionsperformance:** Der v0.7-CPU-Rasterpuffer ist für 7/19 Testfelder begrenzt (Rasterbudget; Materialpuffer separat). Für 200+ sichtbare Hexe brauchen wir räumliche Chunks, Dirty-Region-Invalidierung sowie nach Messung eine GPU-/Shader-/Atlas-Lösung; Pixelpuffer nicht für beliebige riesige Maps aufblasen. Zusätzlich Test auf Firefox, HiDPI-Mobilgeräten und integrierten GPUs.
- **M4 – Randinfrastruktur:** Kantenbezogene Flüsse/Ufer und davon unabhängige Straßen erhalten Anschluss- und Knotenregeln. Noch **kein** produktionsreifes Wasser-/Straßen-Autotiling.
- **M5 – Naturdekoration:** Nach der reinen Materialvalidierung eigene Felsen, Baumgruppen, Gras-/Gerölldecals mit Bodenankern, kontrollierter Überlappung und passenden Schatten ergänzen.
- **M6 – Auswahlhex:** Ein optisch angehobenes Hex braucht später eine eigene Seitenwand-/Lift-Ebene, getrennt von `terrain_base` und deren Übergängen.

**Abgrenzung:** Die Landschaftsgestaltung und Pixelabnahme sind noch nicht vollständig. Es gibt weder einen produktiven Weltkarten-Shader noch eine Freigabe für tausende Hexfelder. Diese Entwicklungsfassung ist ein überprüfbarer Ausgangspunkt für die nächsten Grafikassets und Rendering-Schritte.
# Block 3 – Schatten, Tiefenstaffelung und 2,5D

Stand: 19.10.2026. Autoritativ: `shadow-system.js` (Projektionsgeometrie)
und `app.js` (Canvas-Kompositing).

## Ursache des früheren Bergschattenfehlers

In v0.11.0 stand im Berg-Canvas die Matrix
`g.transform(.86,0,.63*reach,.20,0,0)`. Die Bergpixel oberhalb des
Sprite-Fußpunkts besitzen eine **negative lokale Y-Koordinate**. Die
positive `d=.20` verschob diese Pixel nicht nur nach links, sondern
**auch nach oben**. Schatten lagen deshalb größtenteils unter dem Berg,
statt als geworfene Silhouette auf dem Boden links unten sichtbar zu
sein. Der Debug-Modus ohne Bergsprite machte Teile des Schattens sichtbar.

## Neues Modell

Die Lichtquelle steht konsistent **rechts oben**. Für einen Bildpunkt
oberhalb des Ankers ist `y<0`; die gemeinsame Projektionsmatrix aus
`VedrasShadows.projection` verwendet `c>0` und `d<0`:

- Berg: `[a=.40,b=.055,c=.79·reichweite,d=-.20]`
- Baum/Busch: `[a=.46,b=.045,c=.58·reichweite,d=-.165]`

Somit liegt eine projizierte Bergspitze deutlich **links und unterhalb**
des Fußpunkts. Der eigentliche Bodenanker bleibt fest. Pixel unterhalb
des Ankers werden abgeschnitten. Der Bergschatten besteht aus einem
präziseren Kern, weicher weitergezogener Penumbra und breitem,
dunklerem Bodenkontakt. Die originalen PNG-Alpha-Silhouetten werden
verwendet; keine beliebigen Vollflächen als Bergsilhouette. Bei
überlappenden Bergen wird die stärkste Deckung pro Pixel verwendet,
nicht die Summe.

Die Schattenintensität einer bereits platzierten Berginstanz bleibt
über den vorhandenen Regler einstellbar (einschließlich **0 = aus**).
Standard für neue Berge: `opacity=.58, reach=1.55, softness=11`.
Ältere gespeicherte per-Berg-Werte werden nicht überschrieben; ihre
sichtbare Projektion und das Kontaktprofil sind aber korrigiert.

Auch normale Nature-Sprites erhalten Kontakt- und weiche
silhouettenbasierte Wurfschatten. Vorhandene eigene Schatten-PNGs
bleiben als zusätzliche Texturen nutzbar; fehlende Schatten-PNGs
führen nicht zu fehlendem Bodenkontakt. Gebäude und Einheiten erhalten
einen dezenten Kontaktschatten, ohne ihre Artgrafiken anzupassen.

**Renderreihenfolge**:
1. Gelände, Küsten, Flüsse
2. Alle Berg-, Natur- und Gebäude-Bodenschatten
3. Echte Sprites nach der **reliefkorrigierten Bildschirm-Y-Position
   ihres Bodenankers**; verdeckte Nachbarobjekte bleiben unter Bergen

Im bestehenden Modus `Nur Schlagschatten anzeigen (Debug)`
markieren goldene Linien für jeden Berg Bodenanker und projizierte
Schattenrichtung. Die Linien sind außerhalb dieses Debugmodus unsichtbar.

## Prüfung und Einschränkungen

`node tests/test_block3_shadows.cjs` prüft die richtige
Richtung, die Verankerung, die Reglerwirkung, Kontakt-Fades und
die Trennung von Schatten- und Sprite-Pass. Alte Berggeometrie-,
Wald- und Nature-Regressionen müssen weiter bestehen.

Die Schatten sind eine **stilistisch konsistente
2,5D-Näherung**, keine echte Höhenfeld-Globalillumination oder ein
3D-Renderer. Eine finale Browser-Abnahme anhand realer Berg- und
Baum-PNGs bei mehreren Zoomfaktoren und aktiven Reliefwerten ist
separat erforderlich. Farben/Helligkeiten einzelner Grafiken werden
hier nicht global verändert; dies bleibt Asset-Polishing.

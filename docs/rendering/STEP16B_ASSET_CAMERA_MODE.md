# Schritt 16B – Tile-Kamera bei späten Asset-Decodes erhalten

## Referenz und Regression

Windows-Audit `step16a-audit(3).zip`, 30.10.2026, nur Qualität 4×.
Unveränderte 397-Hex-/2631-Nature-Szene, SHA-256
`1eddd0048e3a7ceeb4dc05086326ed8ff71e0d82b86f3f005da4b7ffc1ba810f`.

| Messgröße | Vorher (ZIP2) | Neues ZIP3 |
|---|---:|---:|
| 4×-Vorbereitung: Tile-Bake-Versuche | 155 | 151 |
| 4×-Pan: rAF-Intervalle | 89 | 0 |
| 4×-Pan: Coverage | 100 % | 75 % |
| 4×-Zoom: rAF-p95 | 16,8 ms | 1651,35 ms (51 Frames, kein Warm-Gate) |
| 4×-Zoom: Tile-Bakes | 1 | 22 |
| 4×-Zoom: Coverage am Ende | 100 % | 25 % |
| 4×-Zoom: Asset-Invalidierungs-Events | – | 30 |

Die vorübergehenden Road/River-Revisionen aus Draft #75 kamen im
neuen Zoom-Lauf **nicht** vor (`tile.ground-revision-deferred`: 0;
`tile.ground-revision-detail`: 0). Der Lauf validiert dessen
tatsächlichen Performancegewinn somit **nicht**. In der
Vorbereitung verbleiben 101 `terrain-core-not-ready`- und
43 `sprite-source-not-ready`-Tile-Bake-Versuche.

## Konkret identifizierter Moduswechsel

Im `imagePool.onReady`-Debounce werden nach späten
Sprite-Dekodes betroffene Scenery-Tiles invalidiert.
`invalidateSpriteLayout()` setzte bisher *immer*
`tileModeActive=false` und `visibleFogTiles=null`.
Beim nächsten `requestDraw()` wird damit der teure
normale Editor-Zeichenpfad statt `fastRender()` gewählt.
Der aktuelle Trace zeigt 30 Asset-Invalidierungs-Events
während des Zooms, anschließendes `active:false`,
teilweise verlorene Weltkacheln und langes Bildintervall.
Die kausale Attribution ist konsistent mit dem Quellcode;
der Windows-Nachweis nach Fix fehlt noch.

## Minimaler Fix

- Nur der **spät aufgelöste Asset-Batch-Callback** ruft
  `invalidateSpriteLayout(...,{preserveCamera:true})`.
- War die Tile-Kamera bereits aktiv und ist der schnelle
  Pfad weiter zulässig, bleibt sie aktiv. `tileFog()`
  baut die Sichtbarkeitsautorisierung vor der nächsten
  Tile-Anforderung vollständig neu auf.
- Selektive und globale Cache-Invalidierungen **bleiben
  unverändert**. Das erhaltene Canvas wird nicht als
  automatisch korrekt erklärt; betroffene Tiles werden
  wie zuvor neu zusammengestellt.
- Bearbeitungen, Moduswechsel, deaktivierte schnelle Kamera
  und explizite Karteneingriffe behalten das bisherige
  `tileModeActive=false`-Verhalten.
- Der Step15-Trace gibt `camera.mode-retained` oder
  `camera.mode-reset` für diese Funktion aus.

## Tests

Fünf gezielte Regressionen rufen die tatsächliche aus
`app.js` extrahierte Funktion in isoliertem V8 auf:
selektiver Bildabschluss, globaler Bildabschluss,
manueller Editoraufruf, nicht zugelassener Fast-Pfad
und Beschränkung auf den Asset-Callback. **5/5 bestanden**.
Kein Node-/Windows-/GPU-Nachweis dieses Patches.

## Weiterer Gate

**Noch keine Freigabe von #75, #76 oder Schritt 16C.**
Erst 4×-Hardwarewiederholung mit gleichem Szene-Hash.
Ziel: `camera.mode-retained` während nachladender Bilder,
`active:true` in den Kameraphasen, eine mindestens
vergleichbare Tile-Abdeckung, weniger ungewollte
rAF-Ausreißer und keine neuen Fog-/Terrain-Artefakte.

Die ungeklärten 4×-Kaltstart- und Decoded-Memory-
Engpässe bleiben unabhängig offen. Schritt 17 ist gesperrt.

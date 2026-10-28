# Rendering Step 13 – Browser-Abnahme

**Datum:** 2026-10-28T12:24:51.341Z
**Status:** INCOMPLETE – browser capture error
**Browser:** C:\Program Files\Google\Chrome\Application\chrome.exe (headed)
**Szenario:** Importierte Szene
**Hexe / Nature:** ? / ?

| Profil | Geste | rAF-p50 ms | rAF-p95 ms | >50 ms | Longtasks | Tile-Bakes | effektive DPR |
|---|---|---:|---:|---:|---:|---:|---:|

rAF-p50/p95 sind **Bildschirm-Frameintervalle während der Geste**, keine direkt instrumentierten `draw()`-Laufzeiten oder garantierten FPS-Werte. CDP-CPU-Taskzeit/Heap und Cachewerte stehen in `result.json`.

## Noch visuell und auf Zielhardware abzunehmen

- [ ] Fog-Kern vollständig opak, auch bei leeren/verspäteten Assets
- [ ] Wolkenweltposition und Beleuchtung bleiben bei Pan/Zoom stabil
- [ ] Waldtiefe, Bergschatten, Küsten, Relief und Sprite-Nähte ohne sichtbare Regression
- [ ] Keine dauerhaft unter Wolken blockierten sichtbaren Tiles
- [ ] 4×-Bildschärfe und wirksame DPR innerhalb 8/14-MP- und 4096-Pixel-Budgets
- [ ] Vergleich über denselben gespeicherten 397-Hex-Stand, Viewport, Zoom und Browser/GPU
- [ ] Wiederholung des Laufes zur Kontrolle von Heap-/Cache-Wachstum

**Keine automatische visuelle Freigabe.** Renderer-Fog ist nur Editor-Preview, kein Ersatz für Multiplayer-Berechtigungen.

## Browser-Ausnahmen

- Error: Could not find node with given id
    at WebSocket.<anonymous> (file:///C:/Users/marku/Desktop/asset_labor/scripts/rendering-step13-browser.mjs:86:36)
    at [nodejs.internal.kHybridDispatch] (node:internal/event_target:856:20)
    at WebSocket.dispatchEvent (node:internal/event_target:789:26)
    at fireEvent (node:internal/deps/undici/undici:14403:14)
    at #onMessage (node:internal/deps/undici/undici:15726:9)
    at Object.onMessage (node:internal/deps/undici/undici:15433:76)
    at websocketMessageReceived (node:internal/deps/undici/undici:14407:15)
    at node:internal/deps/undici/undici:15135:21
    at node:internal/deps/undici/undici:14915:11
    at afterWrite (node:internal/streams/writable:708:5)

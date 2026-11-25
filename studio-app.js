/* Vedras Asset-Labor WebGL2 Studio (Decision 0123 P4)
 * Powered by the exact shared TypeScript/WebGL2 `vedras-map-engine.bundle.js` from browsergame.
 */
(function () {
  "use strict";

  const lib = window.VedrasMapEngineLib;
  if (!lib) {
    console.error("vedras-map-engine.bundle.js nicht geladen.");
    return;
  }

  const {
    VedrasMapEngine,
    createGeographyV2ChunkProvider,
    createSandboxScenario,
    computeScenarioFog,
    DEFAULT_FOREST_CONFIG,
    DEFAULT_RELIEF_CONFIG,
    DEFAULT_VISUAL_CONFIG,
    hexMath,
  } = lib;

  const TOOL_META = {
    inspect: {
      label: "Inspizieren",
      help: "Klicke ein Hex zum Inspizieren. Ziehen = Karte verschieben, Mausrad = Zoom.",
    },
    terrain: {
      label: "Terrain malen",
      help: "Klicke Hexe, um die gewählte Geländeart direkt live auf der WebGL2-Karte zu malen.",
    },
    relief: {
      label: "Relief & Wald",
      help: "Relief (Flach/Hügel/Berg) und Wald sind getrennt wählbar — Hügel spawnen keinen ungewollten Wald.",
    },
    road: {
      label: "Straße bauen",
      help: "Klicke erst ein Start-Hex, dann direkt angrenzende Nachbar-Hexe für Pfad/Weg/Straße.",
    },
    wall: {
      label: "Mauer / Tor",
      help: "Klicke nahe einer Hexkante, um Steinmauer v7, Steintor, Palisade oder Palisadentor zu setzen/entfernen.",
    },
    river: {
      label: "Fluss-Kante",
      help: "Klicke nahe einer Hexkante, um ein Fluss-Segment ein- oder auszuschalten.",
    },
    sprite: {
      label: "Sprite testen",
      help: "Klicke auf die Karte, um den rechts gewählten Natur-Sprite mit Live-Anker & Schatten zu platzieren.",
    },
    erase: {
      label: "Radieren",
      help: "Klicke ein Hex oder eine Kante, um Test-Sprites, Mauern, Flüsse oder Straßen dort zu entfernen.",
    },
  };

  const state = {
    engine: null,
    seed: "vedras-welt-01",
    geographyConfig: undefined,
    activeTool: "inspect",
    activeTerrainId: "grassland",
    paintRelief: "hills",
    paintHillProfile: "rounded",
    paintForestMode: "keep",
    paintRoadTier: "packed",
    paintWallKind: "stone",
    paintWallIsGate: false,
    roadStartHex: null,
    activeScenarioId: "free",
    activeScenarioPreset: null,
    fogEnabled: false,
    showGrid: false,
    shadowOpacity: 0.54,
    forestConfig: {
      ...(DEFAULT_FOREST_CONFIG || {
        mode: "canopy",
        canopyCover: 0.82,
        canopyVariation: 0.15,
        gladeRate: 0.1,
        edgeStrength: 0.72,
        openTreeChance: 0.18,
      }),
    },
    reliefConfig: {
      ...(DEFAULT_RELIEF_CONFIG || {
        enabled: true,
        strength: 78,
        lighting: true,
        style: "sculpted",
      }),
    },
    visualConfig: {
      ...(DEFAULT_VISUAL_CONFIG || {
        naturePolish: 0.4,
        spriteSaturation: 1.0,
        spriteBrightness: 1.0,
        spriteContrast: 1.0,
        edgeBand: 28,
        waterSampling: "hex",
        mountainShadowOnSprites: true,
        windAnimation: true,
      }),
    },

    /** Map<hexKey, Partial<MapHexCell>> for live terrain/relief/forest painting */
    hexOverrides: new Map(),

    /** Dynamic scene mutated by tools or scenarios */
    scene: {
      rivers: [],
      roads: [],
      walls: [],
      territory: [],
      buildings: [],
      units: [],
      sites: [],
      customSprites: [],
      selectedHex: null,
    },

    /** Server catalogs */
    terrainCatalog: null,
    natureCatalog: null,
    shadowProfiles: null,
    exportStatus: null,

    /** Right panel sprite inspector */
    spriteFilterKind: "all",
    spriteSearchText: "",
    selectedSpriteRelPath: null,
    selectedSpriteImg: null,
    draggingAnchor: false,
  };

  const $ = (id) => document.getElementById(id);
  const el = {
    glCanvas: $("glCanvas"),
    overlayCanvas: $("overlayCanvas"),
    bootOverlay: $("bootOverlay"),
    bootTitle: $("bootTitle"),
    bootMessage: $("bootMessage"),
    bootBar: $("bootBar"),
    bootBuildBtn: $("bootBuildBtn"),
    seedInput: $("seedInput"),
    applySeedBtn: $("applySeedBtn"),
    geoConfigFile: $("geoConfigFile"),
    geoPresetBadge: $("geoPresetBadge"),
    zoomDetailBtn: $("zoomDetailBtn"),
    zoomStrategicBtn: $("zoomStrategicBtn"),
    toggleGridBtn: $("toggleGridBtn"),
    toggleFogBtn: $("toggleFogBtn"),
    shadowRange: $("shadowRange"),
    shadowVal: $("shadowVal"),
    exportAssetsBtn: $("exportAssetsBtn"),
    activeToolHint: $("activeToolHint"),
    toolHelp: $("toolHelp"),
    toolGrid: $("toolGrid"),
    terrainToolBox: $("terrainToolBox"),
    terrainSearch: $("terrainSearch"),
    terrainList: $("terrainList"),
    terrainCountBadge: $("terrainCountBadge"),
    reliefToolBox: $("reliefToolBox"),
    hillProfileRow: $("hillProfileRow"),
    roadToolBox: $("roadToolBox"),
    wallToolBox: $("wallToolBox"),
    opticsTabs: $("opticsTabs"),
    opticsTabRelief: $("opticsTabRelief"),
    opticsTabForest: $("opticsTabForest"),
    opticsTabColors: $("opticsTabColors"),
    opticsTabSurface: $("opticsTabSurface"),
    reliefEnabledCheck: $("reliefEnabledCheck"),
    reliefLightingCheck: $("reliefLightingCheck"),
    reliefStyleRow: $("reliefStyleRow"),
    reliefStrengthRange: $("reliefStrengthRange"),
    reliefStrengthVal: $("reliefStrengthVal"),
    regionJumpGrid: $("regionJumpGrid"),
    forestModeRow: $("forestModeRow"),
    canopyCoverRange: $("canopyCoverRange"),
    canopyCoverVal: $("canopyCoverVal"),
    canopyVarRange: $("canopyVarRange"),
    canopyVarVal: $("canopyVarVal"),
    gladeRateRange: $("gladeRateRange"),
    gladeRateVal: $("gladeRateVal"),
    edgeStrengthRange: $("edgeStrengthRange"),
    edgeStrengthVal: $("edgeStrengthVal"),
    openTreeRange: $("openTreeRange"),
    openTreeVal: $("openTreeVal"),
    naturePolishRange: $("naturePolishRange"),
    naturePolishVal: $("naturePolishVal"),
    spriteSatRange: $("spriteSatRange"),
    spriteSatVal: $("spriteSatVal"),
    spriteBrightRange: $("spriteBrightRange"),
    spriteBrightVal: $("spriteBrightVal"),
    spriteContrastRange: $("spriteContrastRange"),
    spriteContrastVal: $("spriteContrastVal"),
    resetOpticsBtn: $("resetOpticsBtn"),
    mtnShadowSpritesCheck: $("mtnShadowSpritesCheck"),
    windAnimationCheck: $("windAnimationCheck"),
    edgeBandRange: $("edgeBandRange"),
    edgeBandVal: $("edgeBandVal"),
    waterSamplingRow: $("waterSamplingRow"),
    scenarioList: $("scenarioList"),
    clearEditsBtn: $("clearEditsBtn"),
    centerOriginBtn: $("centerOriginBtn"),
    hexCoordsBadge: $("hexCoordsBadge"),
    inspTerrain: $("inspTerrain"),
    inspRelief: $("inspRelief"),
    inspForest: $("inspForest"),
    inspFog: $("inspFog"),
    inspEdited: $("inspEdited"),
    hudFps: $("hudFps"),
    hudFrame: $("hudFrame"),
    hudDraws: $("hudDraws"),
    hudHexes: $("hudHexes"),
    hudSprites: $("hudSprites"),
    hudZoom: $("hudZoom"),
    hudPack: $("hudPack"),
    toast: $("toast"),
    spriteCountBadge: $("spriteCountBadge"),
    spriteSearch: $("spriteSearch"),
    kindFilters: $("kindFilters"),
    spriteList: $("spriteList"),
    selectedSpriteTitle: $("selectedSpriteTitle"),
    selectedShadowBadge: $("selectedShadowBadge"),
    anchorCanvas: $("anchorCanvas"),
    anchorXRange: $("anchorXRange"),
    anchorYRange: $("anchorYRange"),
    anchorXVal: $("anchorXVal"),
    anchorYVal: $("anchorYVal"),
    widthRange: $("widthRange"),
    widthVal: $("widthVal"),
    artStatusSelect: $("artStatusSelect"),
    placeSpriteCenterBtn: $("placeSpriteCenterBtn"),
    saveNatureCatalogBtn: $("saveNatureCatalogBtn"),
  };

  let toastTimer = null;
  function showToast(msg, isError) {
    el.toast.textContent = msg;
    el.toast.classList.toggle("error", Boolean(isError));
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.hidden = true;
    }, 4500);
  }

  function makeFogPolicy() {
    if (!state.fogEnabled) return () => 2;
    if (state.activeScenarioPreset) {
      return (q, r) => computeScenarioFog(state.activeScenarioPreset, q, r, "realistic-fow");
    }
    const center = state.scene.selectedHex || { q: 0, r: 0 };
    return (q, r) => {
      const d = hexMath.hexDistance(q, r, center.q, center.r);
      if (d <= 5) return 2;
      if (d <= 9) return 1;
      return 0;
    };
  }

  function buildProvider() {
    return createGeographyV2ChunkProvider({
      seed: state.seed,
      halfExtent: 160,
      geographyConfig: state.geographyConfig,
      overrides: state.hexOverrides,
      fogPolicy: makeFogPolicy(),
    });
  }

  function pushScene() {
    if (!state.engine) return;
    state.engine.setDynamicScene({
      rivers: state.scene.rivers,
      roads: state.scene.roads,
      walls: state.scene.walls,
      territory: state.scene.territory,
      buildings: state.scene.buildings,
      units: state.scene.units,
      sites: state.scene.sites,
      customSprites: state.scene.customSprites,
      selectedHex: state.scene.selectedHex,
    });
  }

  function updateHexInspector(hex) {
    if (!hex || !state.engine) return;
    el.hexCoordsBadge.textContent = `${hex.q}, ${hex.r}`;
    const cell = state.engine.lookupHex(hex.q, hex.r);
    if (!cell) {
      el.inspTerrain.textContent = "Lädt …";
      return;
    }
    el.inspTerrain.textContent = cell.terrainId;
    el.inspRelief.textContent =
      cell.reliefClass === "hills"
        ? `hills (${cell.hillProfile || "rounded"} · ${Math.round((cell.hillStrength || 0.7) * 100)}%)`
        : cell.reliefClass;
    const fPct = Math.round((cell.forestDensity || 0) * 100);
    el.inspForest.textContent =
      cell.forestClass && cell.forestClass !== "none"
        ? `${cell.forestClass === "dense_forest" ? "Dicht" : "Licht"} · ${fPct}%`
        : `${fPct}%`;
    el.inspFog.textContent =
      cell.fogState === 2 ? "Sichtbar" : cell.fogState === 1 ? "Erkundet" : "Unbekannt";
    el.inspEdited.textContent = `${state.hexOverrides.size} Hexe · ${state.scene.customSprites.length} Sprites`;
  }

  function setTool(tool) {
    state.activeTool = tool;
    state.roadStartHex = null;
    const meta = TOOL_META[tool] || TOOL_META.inspect;
    el.activeToolHint.textContent = meta.label;
    el.toolHelp.textContent = meta.help;
    for (const btn of el.toolGrid.querySelectorAll(".tool-btn")) {
      btn.classList.toggle("active", btn.dataset.tool === tool);
    }
    el.terrainToolBox.hidden = tool !== "terrain";
    el.reliefToolBox.hidden = tool !== "relief";
    el.roadToolBox.hidden = tool !== "road";
    el.wallToolBox.hidden = tool !== "wall";
  }

  function handleWorldClick(pt) {
    const { wx, wy, hex } = pt;
    state.scene.selectedHex = hex;
    updateHexInspector(hex);

    const tool = state.activeTool;
    if (tool === "inspect") {
      pushScene();
      return;
    }

    if (tool === "terrain") {
      const k = hexMath.hexKey(hex.q, hex.r);
      const prev = state.hexOverrides.get(k) || {};
      state.hexOverrides.set(k, { ...prev, terrainId: state.activeTerrainId });
      state.engine.invalidateChunkAt(hex.q, hex.r);
      updateHexInspector(hex);
      pushScene();
      return;
    }

    if (tool === "relief") {
      const k = hexMath.hexKey(hex.q, hex.r);
      const prev = state.hexOverrides.get(k) || {};
      const next = { ...prev };
      if (state.paintRelief !== "keep") {
        next.reliefClass = state.paintRelief;
        if (state.paintRelief === "hills") {
          next.hillProfile = state.paintHillProfile;
          next.hillStrength = 0.92;
        } else {
          next.hillProfile = null;
          next.hillStrength = 0;
        }
        if (state.paintRelief === "mountain") {
          next.forestDensity = 0;
          next.forestClass = "none";
        }
      }
      if (state.paintForestMode !== "keep" && next.reliefClass !== "mountain") {
        next.forestClass = state.paintForestMode;
        next.forestDensity =
          state.paintForestMode === "dense_forest"
            ? 0.85
            : state.paintForestMode === "light_forest"
              ? 0.45
              : 0;
      }
      state.hexOverrides.set(k, next);
      state.engine.invalidateChunkAt(hex.q, hex.r);
      updateHexInspector(hex);
      pushScene();
      return;
    }

    if (tool === "road") {
      if (!state.roadStartHex) {
        state.roadStartHex = hex;
        showToast(`Straßen-Start (${hex.q}, ${hex.r}) — jetzt angrenzendes Hex klicken.`);
        pushScene();
        return;
      }
      const dist = hexMath.hexDistance(state.roadStartHex.q, state.roadStartHex.r, hex.q, hex.r);
      if (dist !== 1) {
        state.roadStartHex = hex;
        showToast(`Neuer Straßen-Start (${hex.q}, ${hex.r}) — Nachbar-Hex anklicken.`);
        pushScene();
        return;
      }
      const pair = hexMath.canonicalEdgePair(
        state.roadStartHex.q,
        state.roadStartHex.r,
        hex.q,
        hex.r,
      );
      const idx = state.scene.roads.findIndex(
        (r) => hexMath.canonicalEdgePair(r.q1, r.r1, r.q2, r.r2).key === pair.key,
      );
      if (idx >= 0) {
        state.scene.roads[idx] = {
          q1: pair.q1,
          r1: pair.r1,
          q2: pair.q2,
          r2: pair.r2,
          tier: state.paintRoadTier,
        };
      } else {
        state.scene.roads.push({
          q1: pair.q1,
          r1: pair.r1,
          q2: pair.q2,
          r2: pair.r2,
          tier: state.paintRoadTier,
        });
      }
      state.roadStartHex = hex;
      pushScene();
      return;
    }

    if (tool === "wall") {
      const edge = hexMath.pickNearestHexEdge(wx, wy);
      const pair = hexMath.canonicalEdgePair(edge.q1, edge.r1, edge.q2, edge.r2);
      const idx = state.scene.walls.findIndex(
        (w) => hexMath.canonicalEdgePair(w.q1, w.r1, w.q2, w.r2).key === pair.key,
      );
      if (
        idx >= 0 &&
        state.scene.walls[idx].kind === state.paintWallKind &&
        Boolean(state.scene.walls[idx].isGate) === state.paintWallIsGate
      ) {
        state.scene.walls.splice(idx, 1);
      } else {
        const wallObj = {
          q1: pair.q1,
          r1: pair.r1,
          q2: pair.q2,
          r2: pair.r2,
          kind: state.paintWallKind,
          isGate: state.paintWallIsGate,
        };
        if (idx >= 0) state.scene.walls[idx] = wallObj;
        else state.scene.walls.push(wallObj);
      }
      pushScene();
      return;
    }

    if (tool === "river") {
      const edge = hexMath.pickNearestHexEdge(wx, wy);
      const pair = hexMath.canonicalEdgePair(edge.q1, edge.r1, edge.q2, edge.r2);
      const idx = state.scene.rivers.findIndex((rv) => {
        const d = hexMath.HEX_NEIGHBOR_DIRS[rv.dir];
        if (!d) return false;
        return hexMath.canonicalEdgePair(rv.q, rv.r, rv.q + d[0], rv.r + d[1]).key === pair.key;
      });
      if (idx >= 0) {
        state.scene.rivers.splice(idx, 1);
      } else {
        state.scene.rivers.push({ q: pair.q1, r: pair.r1, dir: edge.dir });
      }
      pushScene();
      return;
    }

    if (tool === "sprite") {
      placeSelectedSpriteAt(hex, wx, wy);
      return;
    }

    if (tool === "erase") {
      const edge = hexMath.pickNearestHexEdge(wx, wy);
      const pair = hexMath.canonicalEdgePair(edge.q1, edge.r1, edge.q2, edge.r2);
      let removed = false;
      const beforeSprites = state.scene.customSprites.length;
      state.scene.customSprites = state.scene.customSprites.filter(
        (s) => s.q !== hex.q || s.r !== hex.r,
      );
      if (state.scene.customSprites.length !== beforeSprites) removed = true;

      const wIdx = state.scene.walls.findIndex(
        (w) => hexMath.canonicalEdgePair(w.q1, w.r1, w.q2, w.r2).key === pair.key,
      );
      if (wIdx >= 0) {
        state.scene.walls.splice(wIdx, 1);
        removed = true;
      }
      const rIdx = state.scene.roads.findIndex(
        (r) => hexMath.canonicalEdgePair(r.q1, r.r1, r.q2, r.r2).key === pair.key,
      );
      if (rIdx >= 0) {
        state.scene.roads.splice(rIdx, 1);
        removed = true;
      }
      const rvIdx = state.scene.rivers.findIndex((rv) => {
        const d = hexMath.HEX_NEIGHBOR_DIRS[rv.dir];
        return (
          d &&
          hexMath.canonicalEdgePair(rv.q, rv.r, rv.q + d[0], rv.r + d[1]).key === pair.key
        );
      });
      if (rvIdx >= 0) {
        state.scene.rivers.splice(rvIdx, 1);
        removed = true;
      }
      const hk = hexMath.hexKey(hex.q, hex.r);
      if (!removed && state.hexOverrides.has(hk)) {
        state.hexOverrides.delete(hk);
        state.engine.invalidateChunkAt(hex.q, hex.r);
        removed = true;
      }
      if (removed) {
        updateHexInspector(hex);
        pushScene();
      }
    }
  }

  function placeSelectedSpriteAt(hex, wx, wy) {
    const rel = state.selectedSpriteRelPath;
    if (!rel || !state.natureCatalog?.entries?.[rel]) {
      showToast("Bitte zuerst rechts einen Natur-Sprite auswählen.", true);
      return;
    }
    const meta = state.natureCatalog.entries[rel];
    const center = hexMath.axialToWorld(hex.q, hex.r);
    const offsetX = wx !== undefined ? wx - center.x : 0;
    const offsetY = wy !== undefined ? wy - center.y : 0;
    const manifestKey = rel.startsWith("assets/") ? rel : `assets/${rel}`;
    state.scene.customSprites.push({
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      spriteKey: manifestKey,
      q: hex.q,
      r: hex.r,
      offsetX,
      offsetY,
      scale: 1,
      anchorOverride: [meta.anchor.x, meta.anchor.y],
      worldWidthOverride: meta.logicalWidth,
    });
    updateHexInspector(hex);
    pushScene();
    showToast(`Test-Sprite „${meta.id}“ bei (${hex.q}, ${hex.r}) platziert.`);
  }

  function applyScenario(id) {
    state.activeScenarioId = id;
    for (const btn of el.scenarioList.querySelectorAll(".scenario-btn")) {
      btn.classList.toggle("active", btn.dataset.scenario === id);
    }
    if (id === "free") {
      state.activeScenarioPreset = null;
      state.scene = {
        rivers: [],
        roads: [],
        walls: [],
        territory: [],
        buildings: [],
        units: [],
        sites: [],
        customSprites: state.scene.customSprites,
        selectedHex: null,
      };
      if (state.engine) {
        state.engine.reapplyFog(makeFogPolicy());
        state.engine.centerOnHex(0, 0, 0.72);
      }
      pushScene();
      return;
    }
    const preset = createSandboxScenario(id, state.seed, state.geographyConfig);
    state.activeScenarioPreset = preset;
    state.scene = {
      rivers: [...(preset.scene.rivers || [])],
      roads: [...(preset.scene.roads || [])],
      walls: [...(preset.scene.walls || [])],
      territory: [...(preset.scene.territory || [])],
      buildings: [...(preset.scene.buildings || [])],
      units: [...(preset.scene.units || [])],
      sites: [...(preset.scene.sites || [])],
      customSprites: state.scene.customSprites,
      selectedHex: null,
    };
    if (state.engine) {
      state.engine.reapplyFog(makeFogPolicy());
      state.engine.centerOnHex(preset.cameraCenter.q, preset.cameraCenter.r, preset.cameraZoom);
    }
    pushScene();
    showToast(`Szenario „${preset.title}“ geladen.`);
  }

  /* ---------------- Terrain Brush List ---------------- */
  function renderTerrainList() {
    const manifest = state.engine?.getManifest();
    const types = state.terrainCatalog?.terrainTypes || [];
    const q = el.terrainSearch.value.trim().toLowerCase();
    el.terrainList.innerHTML = "";
    let count = 0;

    for (const t of types) {
      const text = `${t.id} ${t.name || ""} ${t.categoryId || ""}`.toLowerCase();
      if (q && !text.includes(q)) continue;
      count++;
      const avg = manifest?.terrain?.byType?.[t.id]?.avgColor || [90, 122, 82];
      const isUnit = avg[0] <= 1 && avg[1] <= 1 && avg[2] <= 1;
      const r = Math.round(isUnit ? avg[0] * 255 : avg[0]);
      const g = Math.round(isUnit ? avg[1] * 255 : avg[1]);
      const b = Math.round(isUnit ? avg[2] * 255 : avg[2]);
      const rgb = `rgb(${r}, ${g}, ${b})`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "terrain-item" + (t.id === state.activeTerrainId ? " active" : "");
      btn.innerHTML = `<span class="swatch" style="background:${rgb}"></span><span>${t.name || t.id}</span><small>${t.id}</small>`;
      btn.addEventListener("click", () => {
        state.activeTerrainId = t.id;
        renderTerrainList();
      });
      el.terrainList.appendChild(btn);
    }
    el.terrainCountBadge.textContent = String(count);
  }

  /* ---------------- Nature Sprite & Anchor Inspector ---------------- */
  function getShadowModeFor(relPath, meta) {
    if (meta.kind === "mountain") return "Berg-Feld";
    const manifestKey = relPath.startsWith("assets/") ? relPath : `assets/${relPath}`;
    const profile = state.shadowProfiles?.profiles?.[manifestKey];
    if (profile?.manual?.polygons?.length) return "Manuell";
    const manifestShadow = state.engine?.getManifest()?.shadows?.sprites?.[manifestKey];
    if (manifestShadow?.mode === "manual_polygon") return "Manuell";
    if (manifestShadow?.mode === "mountain_field") return "Berg-Feld";
    if (manifestShadow?.mode === "auto_cast") return "Auto-Cast";
    return "Keiner";
  }

  function renderSpriteList() {
    const entries = state.natureCatalog?.entries || {};
    const q = state.spriteSearchText.trim().toLowerCase();
    const kind = state.spriteFilterKind;

    const items = Object.entries(entries)
      .filter(([rel, meta]) => {
        if (kind !== "all" && meta.kind !== kind) return false;
        if (q) {
          const hay = `${rel} ${meta.id || ""} ${meta.family || ""} ${meta.kind || ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => String(a[1].id || a[0]).localeCompare(String(b[1].id || b[0])));

    el.spriteCountBadge.textContent = String(items.length);
    el.spriteList.innerHTML = "";

    const frag = document.createDocumentFragment();
    for (const [rel, meta] of items) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sprite-row" + (rel === state.selectedSpriteRelPath ? " active" : "");
      const shadowTag = getShadowModeFor(rel, meta);
      btn.innerHTML = `<span>${meta.id || rel}</span><span class="meta">${meta.kind} · ${Math.round(meta.logicalWidth)}px · ${shadowTag}</span>`;
      btn.addEventListener("click", () => selectSprite(rel));
      frag.appendChild(btn);
    }
    el.spriteList.appendChild(frag);

    if (!state.selectedSpriteRelPath && items.length > 0) {
      selectSprite(items[0][0]);
    }
  }

  function selectSprite(relPath) {
    state.selectedSpriteRelPath = relPath;
    const meta = state.natureCatalog?.entries?.[relPath];
    if (!meta) return;

    for (const row of el.spriteList.querySelectorAll(".sprite-row")) {
      row.classList.toggle("active", row.firstChild?.textContent === (meta.id || relPath));
    }

    el.selectedSpriteTitle.textContent = meta.id || relPath;
    el.selectedShadowBadge.textContent = getShadowModeFor(relPath, meta);

    el.anchorXRange.value = String(meta.anchor.x);
    el.anchorYRange.value = String(meta.anchor.y);
    el.anchorXVal.textContent = Number(meta.anchor.x).toFixed(3);
    el.anchorYVal.textContent = Number(meta.anchor.y).toFixed(3);
    el.widthRange.value = String(Math.round(meta.logicalWidth));
    el.widthVal.textContent = `${Math.round(meta.logicalWidth)} px`;
    el.artStatusSelect.value = meta.artStatus || "approved";

    const img = new Image();
    img.onload = () => {
      if (state.selectedSpriteRelPath !== relPath) return;
      state.selectedSpriteImg = img;
      drawAnchorPreview();
    };
    img.src = `assets/${relPath}`;
    drawAnchorPreview();
  }

  let previewRect = { x: 20, y: 12, w: 236, h: 176 };

  function drawAnchorPreview() {
    const canvas = el.anchorCanvas;
    const ctx = canvas.getContext("2d");
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    // Subtle checkerboard so transparency & edges are unmistakable.
    const cell = 12;
    for (let y = 0; y < ch; y += cell) {
      for (let x = 0; x < cw; x += cell) {
        ctx.fillStyle = ((x / cell + y / cell) & 1) === 0 ? "#13202c" : "#182735";
        ctx.fillRect(x, y, cell, cell);
      }
    }

    const rel = state.selectedSpriteRelPath;
    const meta = rel ? state.natureCatalog?.entries?.[rel] : null;
    const img = state.selectedSpriteImg;
    if (!meta || !img || !img.naturalWidth) return;

    const pad = 16;
    const scale = Math.min((cw - pad * 2) / img.naturalWidth, (ch - pad * 2) / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (cw - dw) * 0.5;
    const dy = (ch - dh) * 0.5;
    previewRect = { x: dx, y: dy, w: dw, h: dh };

    // Optional manual shadow polygon visualization (in normalized sprite-width coords around anchor).
    const axPx = dx + meta.anchor.x * dw;
    const ayPx = dy + meta.anchor.y * dh;
    const profile = state.shadowProfiles?.profiles?.["assets/" + rel];
    if (profile?.manual?.polygons?.length) {
      ctx.save();
      ctx.fillStyle = "rgba(10, 14, 20, 0.45)";
      ctx.strokeStyle = "rgba(212, 175, 87, 0.55)";
      ctx.lineWidth = 1;
      for (const poly of profile.manual.polygons) {
        if (poly.length < 3) continue;
        ctx.beginPath();
        poly.forEach((pt, idx) => {
          const px = axPx + pt[0] * dw;
          const py = ayPx + pt[1] * dw;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.drawImage(img, dx, dy, dw, dh);

    // Crisp ground-line + red anchor crosshair
    ctx.strokeStyle = "rgba(255, 92, 92, 0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, ayPx);
    ctx.lineTo(cw, ayPx);
    ctx.moveTo(axPx, 0);
    ctx.lineTo(axPx, ch);
    ctx.stroke();

    ctx.fillStyle = "#ff4d4f";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(axPx, ayPx, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function syncSelectedSpriteLiveToMap() {
    const rel = state.selectedSpriteRelPath;
    const meta = rel ? state.natureCatalog?.entries?.[rel] : null;
    if (!meta) return;
    const manifestKey = rel.startsWith("assets/") ? rel : `assets/${rel}`;
    let touched = false;
    for (const item of state.scene.customSprites) {
      if (item.spriteKey === manifestKey) {
        item.anchorOverride = [meta.anchor.x, meta.anchor.y];
        item.worldWidthOverride = meta.logicalWidth;
        touched = true;
      }
    }
    if (touched) pushScene();
  }

  function applyAnchorFromPointer(ev) {
    const rel = state.selectedSpriteRelPath;
    const meta = rel ? state.natureCatalog?.entries?.[rel] : null;
    if (!meta) return;
    const rect = el.anchorCanvas.getBoundingClientRect();
    const px = ((ev.clientX - rect.left) / rect.width) * el.anchorCanvas.width;
    const py = ((ev.clientY - rect.top) / rect.height) * el.anchorCanvas.height;
    const ax = Math.max(0, Math.min(1, (px - previewRect.x) / Math.max(1, previewRect.w)));
    const ay = Math.max(0, Math.min(1, (py - previewRect.y) / Math.max(1, previewRect.h)));
    meta.anchor.x = Number(ax.toFixed(3));
    meta.anchor.y = Number(ay.toFixed(3));
    el.anchorXRange.value = String(meta.anchor.x);
    el.anchorYRange.value = String(meta.anchor.y);
    el.anchorXVal.textContent = meta.anchor.x.toFixed(3);
    el.anchorYVal.textContent = meta.anchor.y.toFixed(3);
    drawAnchorPreview();
    syncSelectedSpriteLiveToMap();
  }

  /* ---------------- 1-Click WebP Export & Live Reload ---------------- */
  async function runWebpExport() {
    el.exportAssetsBtn.disabled = true;
    el.bootBuildBtn.disabled = true;
    el.exportAssetsBtn.textContent = "⏳ Baue WebP-Atlanten …";
    showToast("WebP-Export & Schatten-Bake gestartet (läuft im Hintergrund) …");

    try {
      const startRes = await fetch("/api/export-game-assets", { method: "POST" });
      if (!startRes.ok) {
        const err = await startRes.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${startRes.status}`);
      }
      while (true) {
        await new Promise((r) => setTimeout(r, 1200));
        const stRes = await fetch("/api/export-game-assets/status");
        const st = await stRes.json();
        state.exportStatus = st;
        if (st.state === "building") {
          el.bootMessage.textContent = "Exportiere Terrain, 377 Natur-Sprites, 376 Schatten & Mauern/Tore in WebP …";
          continue;
        }
        if (st.state === "error") {
          throw new Error(st.error || "WebP-Export fehlgeschlagen");
        }
        if (st.state === "ready") {
          updatePackHud(st);
          if (state.engine) {
            await state.engine.reloadAssets("/dist/game-assets");
            renderTerrainList();
            renderSpriteList();
          } else {
            await bootEngine();
          }
          const syncNote = st.syncedTo ? ` & nach browsergame synchronisiert` : "";
          showToast(
            `Export fertig (${st.elapsedSeconds}s): ${st.exportedMb} MB WebP (Hash ${st.contentHash})${syncNote}!`,
          );
          break;
        }
        break;
      }
    } catch (err) {
      showToast(`Export-Fehler: ${err.message}`, true);
    } finally {
      el.exportAssetsBtn.disabled = false;
      el.bootBuildBtn.disabled = false;
      el.exportAssetsBtn.textContent = "⚡ WebP-Atlanten bauen & syncen";
    }
  }

  function updatePackHud(st) {
    if (!st || st.state !== "ready") return;
    el.hudPack.textContent = `WebP ${st.exportedMb} MB · #${st.contentHash} · ${st.infraSprites} Infra`;
  }

  /* ---------------- Save Nature Catalog ---------------- */
  async function saveNatureCatalog() {
    if (!state.natureCatalog) return;
    el.saveNatureCatalogBtn.disabled = true;
    try {
      state.natureCatalog.revision = (state.natureCatalog.revision || 0) + 1;
      const res = await fetch("/api/nature-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.natureCatalog),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
      showToast(`nature_catalog.json gespeichert (${payload.entries} Sprites, .bak gesichert).`);
    } catch (err) {
      showToast(`Speichern fehlgeschlagen: ${err.message}`, true);
    } finally {
      el.saveNatureCatalogBtn.disabled = false;
    }
  }

  /* ---------------- Engine Bootstrap ---------------- */
  async function bootEngine() {
    el.bootOverlay.hidden = false;
    el.bootBuildBtn.hidden = true;
    el.bootTitle.textContent = "WebGL2-Engine wird initialisiert …";
    el.bootBar.style.width = "10%";

    const engine = new VedrasMapEngine(el.glCanvas, buildProvider(), {
      assetsBaseUrl: "/dist/game-assets",
      worldSeed: state.seed,
      initialCenter: { q: 0, r: 0 },
      initialZoom: 0.72,
      showHexGrid: state.showGrid,
      shadowOpacity: state.shadowOpacity,
      forestConfig: state.forestConfig,
      reliefConfig: state.reliefConfig,
      visualConfig: state.visualConfig,
      onLoadProgress: (loaded, total, label) => {
        const pct = Math.max(8, Math.round((loaded / Math.max(1, total)) * 100));
        el.bootBar.style.width = `${pct}%`;
        el.bootMessage.textContent = `${label} (${loaded}/${total})`;
      },
      onMetrics: (m) => {
        el.hudFps.textContent = String(m.fps);
        el.hudFrame.textContent = m.frameMs.toFixed(1);
        el.hudDraws.textContent = String(m.drawCalls);
        el.hudHexes.textContent = String(m.visibleHexes);
        el.hudSprites.textContent = String(m.renderedSprites);
        el.hudZoom.textContent = m.zoom.toFixed(2);
        el.zoomDetailBtn.classList.toggle("active", m.mode === "detail");
        el.zoomStrategicBtn.classList.toggle("active", m.mode === "strategic");
      },
      onHexHover: (hex) => {
        if (hex) updateHexInspector(hex);
      },
      onWorldClick: handleWorldClick,
    });
    engine.attachOverlayCanvas(el.overlayCanvas);
    state.engine = engine;
    window.__VEDRAS_STUDIO__ = { state, engine };

    await engine.init();
    el.bootOverlay.hidden = true;
    renderTerrainList();
    renderSpriteList();
    if (state.selectedSpriteRelPath) {
      selectSprite(state.selectedSpriteRelPath);
    }
    pushScene();
  }

  function syncOpticsUi() {
    el.reliefEnabledCheck.checked = Boolean(state.reliefConfig.enabled);
    el.reliefLightingCheck.checked = Boolean(state.reliefConfig.lighting);
    const activeStyle = state.reliefConfig.style || "sculpted";
    if (el.reliefStyleRow) {
      for (const c of el.reliefStyleRow.querySelectorAll("[data-relief-style]")) {
        c.classList.toggle("active", c.dataset.reliefStyle === activeStyle);
      }
    }
    el.reliefStrengthRange.value = String(Math.round(state.reliefConfig.strength));
    el.reliefStrengthVal.textContent = `${Math.round(state.reliefConfig.strength)}%`;

    for (const c of el.forestModeRow.querySelectorAll("[data-forest-mode]")) {
      c.classList.toggle("active", c.dataset.forestMode === state.forestConfig.mode);
    }
    const coverPct = Math.round(state.forestConfig.canopyCover * 100);
    el.canopyCoverRange.value = String(coverPct);
    el.canopyCoverVal.textContent = `${coverPct}%`;
    const varPct = Math.round(state.forestConfig.canopyVariation * 100);
    el.canopyVarRange.value = String(varPct);
    el.canopyVarVal.textContent = `±${varPct} pp`;
    const gladePct = Math.round(state.forestConfig.gladeRate * 100);
    el.gladeRateRange.value = String(gladePct);
    el.gladeRateVal.textContent = `${gladePct}%`;
    const edgePct = Math.round(state.forestConfig.edgeStrength * 100);
    el.edgeStrengthRange.value = String(edgePct);
    el.edgeStrengthVal.textContent = `${edgePct}%`;
    const openPct = Math.round(state.forestConfig.openTreeChance * 100);
    el.openTreeRange.value = String(openPct);
    el.openTreeVal.textContent = `${openPct}%`;

    const polPct = Math.round(state.visualConfig.naturePolish * 100);
    el.naturePolishRange.value = String(polPct);
    el.naturePolishVal.textContent = `${polPct}%`;
    const satPct = Math.round(state.visualConfig.spriteSaturation * 100);
    el.spriteSatRange.value = String(satPct);
    el.spriteSatVal.textContent = `${satPct}%`;
    const brtPct = Math.round(state.visualConfig.spriteBrightness * 100);
    el.spriteBrightRange.value = String(brtPct);
    el.spriteBrightVal.textContent = `${brtPct}%`;
    const conPct = Math.round(state.visualConfig.spriteContrast * 100);
    el.spriteContrastRange.value = String(conPct);
    el.spriteContrastVal.textContent = `${conPct}%`;

    el.mtnShadowSpritesCheck.checked = Boolean(state.visualConfig.mountainShadowOnSprites);
    if (el.windAnimationCheck) {
      el.windAnimationCheck.checked = state.visualConfig.windAnimation !== false;
    }
    el.edgeBandRange.value = String(Math.round(state.visualConfig.edgeBand));
    el.edgeBandVal.textContent = `${Math.round(state.visualConfig.edgeBand)} px`;
    for (const c of el.waterSamplingRow.querySelectorAll("[data-water-sampling]")) {
      c.classList.toggle("active", c.dataset.waterSampling === state.visualConfig.waterSampling);
    }
  }

  /* ---------------- Wire UI Events ---------------- */
  function bindEvents() {
    el.toolGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".tool-btn");
      if (btn?.dataset.tool) setTool(btn.dataset.tool);
    });

    el.terrainSearch.addEventListener("input", renderTerrainList);

    el.reliefToolBox.addEventListener("click", (e) => {
      const reliefChip = e.target.closest("[data-relief]");
      if (reliefChip) {
        state.paintRelief = reliefChip.dataset.relief;
        for (const c of el.reliefToolBox.querySelectorAll("[data-relief]")) {
          c.classList.toggle("active", c === reliefChip);
        }
        el.hillProfileRow.hidden = state.paintRelief !== "hills";
        return;
      }
      const profileChip = e.target.closest("[data-hill-profile]");
      if (profileChip) {
        state.paintHillProfile = profileChip.dataset.hillProfile;
        for (const c of el.reliefToolBox.querySelectorAll("[data-hill-profile]")) {
          c.classList.toggle("active", c === profileChip);
        }
        return;
      }
      const forestChip = e.target.closest("[data-forest-paint]");
      if (forestChip) {
        state.paintForestMode = forestChip.dataset.forestPaint;
        for (const c of el.reliefToolBox.querySelectorAll("[data-forest-paint]")) {
          c.classList.toggle("active", c === forestChip);
        }
      }
    });

    // Welt & Optik Tabs
    el.opticsTabs.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-optics-tab]");
      if (!tab) return;
      const target = tab.dataset.opticsTab;
      for (const c of el.opticsTabs.querySelectorAll("[data-optics-tab]")) {
        c.classList.toggle("active", c === tab);
      }
      el.opticsTabRelief.hidden = target !== "relief";
      el.opticsTabForest.hidden = target !== "forest";
      el.opticsTabColors.hidden = target !== "colors";
      el.opticsTabSurface.hidden = target !== "surface";
    });

    // Relief live controls
    el.reliefEnabledCheck.addEventListener("change", () => {
      state.reliefConfig.enabled = el.reliefEnabledCheck.checked;
      state.engine?.setReliefConfig({ enabled: state.reliefConfig.enabled });
    });
    el.reliefLightingCheck.addEventListener("change", () => {
      state.reliefConfig.lighting = el.reliefLightingCheck.checked;
      state.engine?.setReliefConfig({ lighting: state.reliefConfig.lighting });
    });
    el.reliefStyleRow?.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-relief-style]");
      if (!chip) return;
      state.reliefConfig.style = chip.dataset.reliefStyle;
      for (const c of el.reliefStyleRow.querySelectorAll("[data-relief-style]")) {
        c.classList.toggle("active", c === chip);
      }
      state.engine?.setReliefConfig({ style: state.reliefConfig.style });
    });
    el.reliefStrengthRange.addEventListener("input", () => {
      const v = Number(el.reliefStrengthRange.value);
      state.reliefConfig.strength = v;
      el.reliefStrengthVal.textContent = `${v}%`;
      state.engine?.setReliefConfig({ strength: v });
    });
    el.regionJumpGrid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-jump]");
      if (!btn || !state.engine) return;
      const [q, r, z] = btn.dataset.jump.split(",").map(Number);
      state.engine.centerOnHex(q, r, z || 0.72);
    });

    // Forest / Canopy / Glades / Open-Trees live controls
    el.forestModeRow.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-forest-mode]");
      if (!chip) return;
      state.forestConfig.mode = chip.dataset.forestMode;
      for (const c of el.forestModeRow.querySelectorAll("[data-forest-mode]")) {
        c.classList.toggle("active", c === chip);
      }
      state.engine?.setForestConfig({ mode: state.forestConfig.mode });
    });
    el.canopyCoverRange.addEventListener("input", () => {
      const pct = Number(el.canopyCoverRange.value);
      state.forestConfig.canopyCover = pct / 100;
      el.canopyCoverVal.textContent = `${pct}%`;
      state.engine?.setForestConfig({ canopyCover: state.forestConfig.canopyCover });
    });
    el.canopyVarRange.addEventListener("input", () => {
      const pct = Number(el.canopyVarRange.value);
      state.forestConfig.canopyVariation = pct / 100;
      el.canopyVarVal.textContent = `±${pct} pp`;
      state.engine?.setForestConfig({ canopyVariation: state.forestConfig.canopyVariation });
    });
    el.gladeRateRange.addEventListener("input", () => {
      const pct = Number(el.gladeRateRange.value);
      state.forestConfig.gladeRate = pct / 100;
      el.gladeRateVal.textContent = `${pct}%`;
      state.engine?.setForestConfig({ gladeRate: state.forestConfig.gladeRate });
    });
    el.edgeStrengthRange.addEventListener("input", () => {
      const pct = Number(el.edgeStrengthRange.value);
      state.forestConfig.edgeStrength = pct / 100;
      el.edgeStrengthVal.textContent = `${pct}%`;
      state.engine?.setForestConfig({ edgeStrength: state.forestConfig.edgeStrength });
    });
    el.openTreeRange.addEventListener("input", () => {
      const pct = Number(el.openTreeRange.value);
      state.forestConfig.openTreeChance = pct / 100;
      el.openTreeVal.textContent = `${pct}%`;
      state.engine?.setForestConfig({ openTreeChance: state.forestConfig.openTreeChance });
    });

    // Sprite color & polish live controls (0 ms GPU uniforms)
    el.naturePolishRange.addEventListener("input", () => {
      const pct = Number(el.naturePolishRange.value);
      state.visualConfig.naturePolish = pct / 100;
      el.naturePolishVal.textContent = `${pct}%`;
      state.engine?.setVisualConfig({ naturePolish: state.visualConfig.naturePolish });
    });
    el.spriteSatRange.addEventListener("input", () => {
      const pct = Number(el.spriteSatRange.value);
      state.visualConfig.spriteSaturation = pct / 100;
      el.spriteSatVal.textContent = `${pct}%`;
      state.engine?.setVisualConfig({ spriteSaturation: state.visualConfig.spriteSaturation });
    });
    el.spriteBrightRange.addEventListener("input", () => {
      const pct = Number(el.spriteBrightRange.value);
      state.visualConfig.spriteBrightness = pct / 100;
      el.spriteBrightVal.textContent = `${pct}%`;
      state.engine?.setVisualConfig({ spriteBrightness: state.visualConfig.spriteBrightness });
    });
    el.spriteContrastRange.addEventListener("input", () => {
      const pct = Number(el.spriteContrastRange.value);
      state.visualConfig.spriteContrast = pct / 100;
      el.spriteContrastVal.textContent = `${pct}%`;
      state.engine?.setVisualConfig({ spriteContrast: state.visualConfig.spriteContrast });
    });
    el.resetOpticsBtn.addEventListener("click", () => {
      state.forestConfig = { ...(DEFAULT_FOREST_CONFIG || state.forestConfig) };
      state.reliefConfig = { ...(DEFAULT_RELIEF_CONFIG || state.reliefConfig) };
      state.visualConfig = { ...(DEFAULT_VISUAL_CONFIG || state.visualConfig) };
      syncOpticsUi();
      state.engine?.setForestConfig(state.forestConfig);
      state.engine?.setReliefConfig(state.reliefConfig);
      state.engine?.setVisualConfig(state.visualConfig);
      showToast("Welt-, Wald- & Sprite-Optik auf Standard zurückgesetzt.");
    });

    // Mountain Shadows, Wind/Water & Auto-Tiling controls (0 ms GPU uniforms)
    el.mtnShadowSpritesCheck.addEventListener("change", () => {
      state.visualConfig.mountainShadowOnSprites = el.mtnShadowSpritesCheck.checked;
      state.engine?.setVisualConfig({
        mountainShadowOnSprites: state.visualConfig.mountainShadowOnSprites,
      });
    });
    el.windAnimationCheck?.addEventListener("change", () => {
      state.visualConfig.windAnimation = el.windAnimationCheck.checked;
      state.engine?.setVisualConfig({
        windAnimation: state.visualConfig.windAnimation,
      });
    });
    el.edgeBandRange.addEventListener("input", () => {
      const px = Number(el.edgeBandRange.value);
      state.visualConfig.edgeBand = px;
      el.edgeBandVal.textContent = `${px} px`;
      state.engine?.setVisualConfig({ edgeBand: px });
    });
    el.waterSamplingRow.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-water-sampling]");
      if (!chip) return;
      state.visualConfig.waterSampling = chip.dataset.waterSampling;
      for (const c of el.waterSamplingRow.querySelectorAll("[data-water-sampling]")) {
        c.classList.toggle("active", c === chip);
      }
      state.engine?.setVisualConfig({ waterSampling: state.visualConfig.waterSampling });
    });

    el.roadToolBox.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-road]");
      if (!chip) return;
      state.paintRoadTier = chip.dataset.road;
      for (const c of el.roadToolBox.querySelectorAll("[data-road]")) {
        c.classList.toggle("active", c === chip);
      }
    });

    el.wallToolBox.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-wall]");
      if (!chip) return;
      const [kind, mode] = chip.dataset.wall.split(":");
      state.paintWallKind = kind;
      state.paintWallIsGate = mode === "gate";
      for (const c of el.wallToolBox.querySelectorAll("[data-wall]")) {
        c.classList.toggle("active", c === chip);
      }
    });

    el.scenarioList.addEventListener("click", (e) => {
      const btn = e.target.closest(".scenario-btn");
      if (btn?.dataset.scenario) applyScenario(btn.dataset.scenario);
    });

    el.clearEditsBtn.addEventListener("click", () => {
      state.hexOverrides.clear();
      state.scene.customSprites = [];
      if (state.activeScenarioId === "free") {
        state.scene.walls = [];
        state.scene.roads = [];
        state.scene.rivers = [];
      }
      if (state.engine) {
        state.engine.setWorldProvider(buildProvider(), state.seed);
      }
      pushScene();
      showToast("Alle Mal-Änderungen & Test-Sprites zurückgesetzt.");
    });

    el.centerOriginBtn.addEventListener("click", () => {
      state.engine?.centerOnHex(0, 0, 0.72);
    });

    el.applySeedBtn.addEventListener("click", () => {
      const nextSeed = el.seedInput.value.trim() || "vedras-welt-01";
      state.seed = nextSeed;
      state.hexOverrides.clear();
      if (state.engine) {
        state.engine.setWorldProvider(buildProvider(), state.seed);
      }
      if (state.activeScenarioId !== "free") {
        applyScenario(state.activeScenarioId);
      }
      showToast(`Welt-Seed „${state.seed}“ aktiv.`);
    });

    el.geoConfigFile.addEventListener("change", async () => {
      const file = el.geoConfigFile.files?.[0];
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        const cfg = parsed.config || parsed.parameters || (!Array.isArray(parsed.cells) ? parsed : undefined);
        if (cfg && typeof cfg === "object") {
          state.geographyConfig = cfg;
        }
        if (typeof parsed.seed === "string" && parsed.seed.trim()) {
          state.seed = parsed.seed.trim();
          el.seedInput.value = state.seed;
        }
        state.hexOverrides.clear();

        // If full exported world JSON includes explicit cells[], preserve EVERY cell's terrain, hills & forest 1:1!
        let importedCells = 0;
        if (Array.isArray(parsed.cells) && parsed.cells.length > 0) {
          for (const c of parsed.cells) {
            if (!Number.isSafeInteger(c?.q) || !Number.isSafeInteger(c?.r)) continue;
            const k = hexMath.hexKey(c.q, c.r);
            state.hexOverrides.set(k, {
              terrainId: c.terrainId || c.terrainTypeId || "grassland",
              reliefClass: c.reliefClass || "flat",
              hillProfile: c.hillProfile ?? null,
              hillStrength: Number.isFinite(Number(c.hillStrength)) ? Number(c.hillStrength) : undefined,
              forestClass: c.forestClass,
              forestDensity: Number.isFinite(Number(c.forestDensity)) ? Number(c.forestDensity) : 0,
            });
            importedCells++;
          }
        }

        // Convert exported Geography-Lab riverPaths (hex chains) into crisp hex-edge MapRiverEdge[]
        const rawRivers = parsed.riverPreviewPaths || parsed.riverPaths;
        if (Array.isArray(rawRivers) && rawRivers.length > 0) {
          const edgeMap = new Map();
          for (const route of rawRivers) {
            if (!Array.isArray(route) || route.length < 2) continue;
            for (let i = 0; i < route.length - 1; i++) {
              const a = Array.isArray(route[i]) ? { q: route[i][0], r: route[i][1] } : route[i];
              const b = Array.isArray(route[i + 1]) ? { q: route[i + 1][0], r: route[i + 1][1] } : route[i + 1];
              if (!a || !b) continue;
              const dir = hexMath.neighborDirection(a.q, a.r, b.q, b.r);
              if (dir < 0) continue;
              const sideDir = (dir + 1) % 6;
              const d = hexMath.HEX_NEIGHBOR_DIRS[sideDir];
              const pair = hexMath.canonicalEdgePair(a.q, a.r, a.q + d[0], a.r + d[1]);
              if (!edgeMap.has(pair.key)) {
                edgeMap.set(pair.key, { q: a.q, r: a.r, dir: sideDir });
              }
            }
          }
          state.scene.rivers = Array.from(edgeMap.values());
        }

        state.engine?.setWorldProvider(buildProvider(), state.seed);

        // If Geography-Lab JSON includes a region box, center camera on that exact area!
        const originQ = Number(parsed.originQ);
        const originR = Number(parsed.originR);
        const w = Number(parsed.width);
        const h = Number(parsed.height);
        if (Number.isFinite(originQ) && Number.isFinite(originR) && Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
          const centerQ = Math.round(originQ + w * 0.5);
          const centerR = Math.round(originR + h * 0.5);
          state.engine?.centerOnHex(centerQ, centerR, 0.72);
        }

        if (el.geoPresetBadge) {
          const label = file.name.replace(/\.json$/i, "").slice(0, 22);
          el.geoPresetBadge.textContent = `JSON: ${label}`;
          el.geoPresetBadge.title = `Geladene Geografie-Labor-JSON: ${file.name}`;
        }
        pushScene();
        const details = [];
        if (cfg) details.push(`${Object.keys(cfg).length} Parameter`);
        if (importedCells) details.push(`${importedCells} Hexe (inkl. Hügel & Wald)`);
        if (state.scene.rivers.length) details.push(`${state.scene.rivers.length} Flusskanten`);
        showToast(`Geografie-Labor-JSON geladen (${details.join(", ")}).`);
      } catch (err) {
        showToast(`Geografie-JSON ungültig: ${err.message}`, true);
      } finally {
        el.geoConfigFile.value = "";
      }
    });

    el.zoomDetailBtn.addEventListener("click", () => state.engine?.setZoom(0.75));
    el.zoomStrategicBtn.addEventListener("click", () => state.engine?.setZoom(0.16));

    el.toggleGridBtn.addEventListener("click", () => {
      state.showGrid = !state.showGrid;
      el.toggleGridBtn.classList.toggle("active", state.showGrid);
      state.engine?.setShowHexGrid(state.showGrid);
    });

    el.toggleFogBtn.addEventListener("click", () => {
      state.fogEnabled = !state.fogEnabled;
      el.toggleFogBtn.classList.toggle("active", state.fogEnabled);
      el.toggleFogBtn.textContent = state.fogEnabled ? "FoW: An" : "FoW: Aus";
      state.engine?.reapplyFog(makeFogPolicy());
    });

    el.shadowRange.addEventListener("input", () => {
      const pct = Number(el.shadowRange.value);
      state.shadowOpacity = pct / 100;
      el.shadowVal.textContent = `${pct}%`;
      state.engine?.setShadowOpacity(state.shadowOpacity);
    });

    el.exportAssetsBtn.addEventListener("click", runWebpExport);
    el.bootBuildBtn.addEventListener("click", runWebpExport);

    // Right panel sprite filter & anchor tuning
    el.spriteSearch.addEventListener("input", () => {
      state.spriteSearchText = el.spriteSearch.value;
      renderSpriteList();
    });

    el.kindFilters.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-kind]");
      if (!chip) return;
      state.spriteFilterKind = chip.dataset.kind;
      for (const c of el.kindFilters.querySelectorAll("[data-kind]")) {
        c.classList.toggle("active", c === chip);
      }
      renderSpriteList();
    });

    el.anchorXRange.addEventListener("input", () => {
      const meta = state.natureCatalog?.entries?.[state.selectedSpriteRelPath];
      if (!meta) return;
      meta.anchor.x = Number(el.anchorXRange.value);
      el.anchorXVal.textContent = meta.anchor.x.toFixed(3);
      drawAnchorPreview();
      syncSelectedSpriteLiveToMap();
    });

    el.anchorYRange.addEventListener("input", () => {
      const meta = state.natureCatalog?.entries?.[state.selectedSpriteRelPath];
      if (!meta) return;
      meta.anchor.y = Number(el.anchorYRange.value);
      el.anchorYVal.textContent = meta.anchor.y.toFixed(3);
      drawAnchorPreview();
      syncSelectedSpriteLiveToMap();
    });

    el.widthRange.addEventListener("input", () => {
      const meta = state.natureCatalog?.entries?.[state.selectedSpriteRelPath];
      if (!meta) return;
      meta.logicalWidth = Number(el.widthRange.value);
      el.widthVal.textContent = `${Math.round(meta.logicalWidth)} px`;
      syncSelectedSpriteLiveToMap();
    });

    el.artStatusSelect.addEventListener("change", () => {
      const meta = state.natureCatalog?.entries?.[state.selectedSpriteRelPath];
      if (!meta) return;
      meta.artStatus = el.artStatusSelect.value;
    });

    el.anchorCanvas.addEventListener("pointerdown", (ev) => {
      state.draggingAnchor = true;
      el.anchorCanvas.setPointerCapture(ev.pointerId);
      applyAnchorFromPointer(ev);
    });
    el.anchorCanvas.addEventListener("pointermove", (ev) => {
      if (state.draggingAnchor) applyAnchorFromPointer(ev);
    });
    el.anchorCanvas.addEventListener("pointerup", () => {
      state.draggingAnchor = false;
    });

    el.placeSpriteCenterBtn.addEventListener("click", () => {
      const target = state.scene.selectedHex || { q: 0, r: 0 };
      placeSelectedSpriteAt(target);
      setTool("sprite");
    });

    el.saveNatureCatalogBtn.addEventListener("click", saveNatureCatalog);
    syncOpticsUi();
  }

  async function init() {
    bindEvents();
    try {
      const [statusRes, terrainRes, natureRes, shadowRes] = await Promise.all([
        fetch("/api/export-game-assets/status"),
        fetch("/api/terrain-catalog"),
        fetch("/api/nature-catalog"),
        fetch("/api/sprite-shadows"),
      ]);
      if (statusRes.ok) state.exportStatus = await statusRes.json();
      if (terrainRes.ok) state.terrainCatalog = await terrainRes.json();
      if (natureRes.ok) state.natureCatalog = await natureRes.json();
      if (shadowRes.ok) state.shadowProfiles = await shadowRes.json();

      renderSpriteList();

      if (!state.exportStatus || state.exportStatus.state === "missing") {
        el.bootOverlay.hidden = false;
        el.bootTitle.textContent = "WebP-Atlanten noch nicht gebaut";
        el.bootMessage.textContent =
          "Auf diesem Rechner existieren noch keine exportierten WebP-Atlanten unter dist/game-assets/. Einmalig bauen (~40 s), danach startet das Studio in < 1 Sekunde mit 60 FPS.";
        el.bootBar.style.width = "0%";
        el.bootBuildBtn.hidden = false;
        return;
      }

      updatePackHud(state.exportStatus);
      await bootEngine();
    } catch (err) {
      el.bootOverlay.hidden = false;
      el.bootTitle.textContent = "Startfehler";
      el.bootMessage.textContent = String(err?.message || err);
      el.bootBuildBtn.hidden = false;
    }
  }

  init();
})();

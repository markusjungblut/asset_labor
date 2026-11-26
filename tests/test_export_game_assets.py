"""Unit and contract tests for scripts/export_game_assets.py (Decision 0123 P1)."""
from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import export_game_assets as exporter  # noqa: E402


def _make_tree_png(path: Path, size: int = 200) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    # Centered crown + trunk with generous transparent padding around it.
    draw.ellipse([50, 30, 150, 130], fill=(45, 110, 40, 255))
    draw.rectangle([90, 120, 110, 170], fill=(95, 65, 35, 255))
    im.save(path, format="PNG")


def _make_mountain_png(path: Path, size: int = 240) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    draw.polygon([(120, 30), (210, 195), (30, 195)], fill=(120, 120, 125, 255))
    im.save(path, format="PNG")


def _make_terrain_png(path: Path, color: tuple[int, int, int]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    im = Image.new("RGB", (128, 128), color)
    im.save(path, format="PNG")


class ExportGameAssetsTest(unittest.TestCase):
    def test_synthetic_export_determinism_anchors_shadows_and_walls(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            assets = base / "assets"
            extra_walls = base / "extra_walls"

            _make_terrain_png(assets / "terrain" / "grassland_01.png", (120, 165, 50))
            _make_terrain_png(assets / "terrain" / "grassland_02.png", (124, 168, 52))
            _make_terrain_png(assets / "terrain" / "ocean_01.png", (10, 60, 120))
            _make_terrain_png(assets / "terrain" / "cosatal_water_01.png", (30, 110, 150))
            (assets / "terrain" / "terrain_catalog.json").write_text(
                json.dumps(
                    {
                        "schemaVersion": 2,
                        "categories": [],
                        "transitionProfiles": [],
                        "terrainTypes": [
                            {"id": "grassland", "categoryId": "grass_pasture", "materialClass": "ground"},
                            {"id": "ocean", "categoryId": "water_coast", "materialClass": "water"},
                            {"id": "coastal_water", "categoryId": "water_coast", "materialClass": "water"},
                        ],
                        "assets": {
                            "terrain/grassland_01.png": {"terrainTypeId": "grassland"},
                            "terrain/grassland_02.png": {"terrainTypeId": "grassland"},
                            "terrain/ocean_01.png": {"terrainTypeId": "ocean"},
                            "terrain/cosatal_water_01.png": {"terrainTypeId": "coastal_water"},
                        },
                    }
                ),
                encoding="utf-8",
            )

            _make_tree_png(assets / "nature" / "oak_01.png")
            _make_tree_png(assets / "nature" / "rock_01.png")
            _make_mountain_png(assets / "nature" / "berg_01.png")
            (assets / "nature" / "nature_catalog.json").write_text(
                json.dumps(
                    {
                        "schemaVersion": 1,
                        "entries": {
                            "nature/oak_01.png": {
                                "id": "oak_01",
                                "kind": "tree",
                                "family": "temperate_trees",
                                "sizeClass": "medium",
                                "sizeMode": "class",
                                "logicalWidth": 100,
                                "anchor": {"x": 0.5, "y": 0.96},
                                "shadow": {"mode": "generic_medium_round"},
                            },
                            "nature/rock_01.png": {
                                "id": "rock_01",
                                "kind": "rock",
                                "family": "rocks",
                                "sizeClass": "medium",
                                "sizeMode": "manual",
                                "logicalWidth": 70,
                                "anchor": {"x": 0.5, "y": 0.92},
                                "shadow": {"mode": "generic_small_round"},
                            },
                            "nature/berg_01.png": {
                                "id": "berg_01",
                                "kind": "mountain",
                                "family": "mountains",
                                "sizeClass": "giant",
                                "sizeMode": "manual",
                                "logicalWidth": 360,
                                "anchor": {"x": 0.5, "y": 0.67},
                                "mountain": {"shadowOpacity": 0.35},
                            },
                        },
                    }
                ),
                encoding="utf-8",
            )

            (assets / "shadows").mkdir(parents=True, exist_ok=True)
            (assets / "shadows" / "sprite_shadow_profiles.json").write_text(
                json.dumps(
                    {
                        "schemaVersion": 1,
                        "global": {
                            "angle": 142,
                            "opacity": 0.69,
                            "length": 0.72,
                            "width": 0.91,
                            "softness": 4.5,
                            "offsetX": -0.12,
                            "offsetY": -0.03,
                            "contact": 0.7,
                            "strength": 2,
                        },
                        "profiles": {
                            "assets/nature/rock_01.png": {
                                "contact": 0.8,
                                "manual": {
                                    "mode": "polygons",
                                    "polygons": [[[-0.6, -0.1], [-0.1, -0.15], [0.1, 0.1], [-0.5, 0.12]]],
                                },
                            }
                        },
                    }
                ),
                encoding="utf-8",
            )

            # Wall & extra PR #182 stone wall + cloud fixtures
            _make_tree_png(assets / "walls" / "palisade" / "edge_dir0.png", 128)
            _make_tree_png(extra_walls / "stone" / "v7" / "edge_dir0.png", 128)
            _make_tree_png(extra_walls / "stone" / "v7" / "source_atlas.png", 256)  # must be skipped!
            _make_tree_png(assets / "clouds" / "cloud_base_01.png", 128)

            out1 = base / "out1"
            out2 = base / "out2"
            m1 = exporter.export_all(
                assets_dir=assets,
                out_dir=out1,
                terrain_size=64,
                max_terrain_variants=2,
                page_size=512,
                extra_walls_dir=extra_walls,
            )
            m2 = exporter.export_all(
                assets_dir=assets,
                out_dir=out2,
                terrain_size=64,
                max_terrain_variants=2,
                page_size=512,
                extra_walls_dir=extra_walls,
            )

            # Deterministic SHA-256 content hash across identical runs
            self.assertEqual(m1["contentHash"], m2["contentHash"])
            self.assertEqual(m1["schema"], exporter.SCHEMA)

            # Terrain layers + geography-v2.1.2 aliases
            self.assertEqual(m1["terrain"]["layerCount"], 4)
            self.assertIn("coastal_waters", m1["terrain"]["byType"])
            self.assertEqual(m1["terrain"]["byType"]["coastal_waters"]["aliasOf"], "coastal_water")

            # Nature sprites trimmed accurately & anchors preserved
            oak = m1["nature"]["sprites"]["assets/nature/oak_01.png"]
            self.assertLess(oak["trim"][2], 200)
            self.assertLess(oak["trim"][3], 200)
            self.assertEqual(oak["anchor"], [0.5, 0.96])

            # All three shadow modes baked offline cleanly!
            self.assertEqual(
                m1["shadows"]["counts"],
                {"manual_polygon": 1, "mountain_field": 1, "auto_cast": 1, "none": 0},
            )
            for key in ("assets/nature/oak_01.png", "assets/nature/rock_01.png", "assets/nature/berg_01.png"):
                sh = m1["shadows"]["sprites"][key]
                b = sh["boundsInSpriteWidth"]
                self.assertLess(b[0], b[2])
                self.assertLess(b[1], b[3])

            # Pre-baked swept ground shadows for stone & palisade walls/gates & posts (14 entries)
            for mat in ("stone", "palisade"):
                for side in range(6):
                    wsh = m1["shadows"]["sprites"][f"wall_shadow:{mat}:dir{side}"]
                    self.assertEqual(wsh["mode"], "wall_swept")
                    wb = wsh["boundsInSpriteWidth"]
                    self.assertLess(wb[0], wb[2])
                    self.assertLess(wb[1], wb[3])
                psh = m1["shadows"]["sprites"][f"wall_shadow:{mat}:post"]
                self.assertEqual(psh["mode"], "wall_swept")

            # Walls picked up both palisade & extra stone v7, skipping source_atlas
            infra_sprites = m1["infrastructure"]["sprites"]
            self.assertIn("walls/palisade/edge_dir0", infra_sprites)
            self.assertIn("walls/stone/v7/edge_dir0", infra_sprites)
            self.assertNotIn("walls/stone/v7/source_atlas", infra_sprites)
            self.assertEqual(m1["clouds"]["count"], 1)

    def test_repair_seamless_terrain_removes_water_center_stripe_and_edge_seams(self) -> None:
        # Synthetic water image with dark vertical center seam + contrasting left/right edges
        im = Image.new("RGB", (64, 64), (40, 120, 160))
        px = im.load()
        for y in range(64):
            px[32, y] = (5, 20, 30)  # harsh vertical center split stripe
            for x in range(8):
                px[x, y] = (20, 80, 120)
                px[63 - x, y] = (100, 180, 210)
        repaired = exporter.repair_seamless_terrain(im, center_stripe=True, edge_band=8)
        rp = repaired.load()
        # Center stripe smoothed back toward surrounding water tone
        self.assertGreater(rp[32, 32][1], 95)
        # Left & right opposite edges now meet seamlessly
        self.assertLessEqual(abs(rp[0, 32][0] - rp[63, 32][0]), 2)
        self.assertLessEqual(abs(rp[0, 32][2] - rp[63, 32][2]), 2)

    def test_real_catalogs_have_no_missing_assets(self) -> None:
        assets = ROOT / "assets"
        tc = json.loads((assets / "terrain" / "terrain_catalog.json").read_text(encoding="utf-8"))
        nc = json.loads((assets / "nature" / "nature_catalog.json").read_text(encoding="utf-8"))
        missing_t = [rel for rel in tc["assets"] if not (assets / rel).is_file()]
        missing_n = [rel for rel in nc["entries"] if not (assets / rel).is_file()]
        self.assertEqual(missing_t, [])
        self.assertEqual(missing_n, [])

    def test_pass6_no_missing_nature_shadows_and_harmonized_peaks(self) -> None:
        assets = ROOT / "assets"
        nc = json.loads((assets / "nature" / "nature_catalog.json").read_text(encoding="utf-8"))
        sp = json.loads((assets / "shadows" / "sprite_shadow_profiles.json").read_text(encoding="utf-8"))
        profiles = sp.get("profiles") or {}
        dp08 = nc["entries"].get("nature/dry_patch_08.png", {})
        self.assertNotEqual((dp08.get("shadow") or {}).get("mode", "none"), "none")
        # Every non-decal nature sprite must have EITHER a non-'none' catalog shadow mode OR an explicit shadow profile
        missing_shadow_cfg = [
            rel
            for rel, meta in nc["entries"].items()
            if meta.get("kind") not in ("mountain", "ground_decal")
            and "micro_decal" not in (meta.get("tags") or [])
            and (meta.get("shadow") or {}).get("mode") == "none"
            and f"assets/{rel}" not in profiles
            and rel not in profiles
        ]
        self.assertEqual(missing_shadow_cfg, [])

        # Harmonizer clamps extreme auto_cast outlier length/angle/softness and normalizes peak to 252
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "outlier_tree.png"
            _make_tree_png(p)
            src = Image.open(p).convert("RGBA")
            res = exporter.bake_sprite_shadow(
                trimmed=src,
                meta={"kind": "tree", "anchor": {"x": 0.5, "y": 0.96}, "shadow": {"mode": "generic_large_round"}},
                profile={"angle": 115.0, "length": 2.4, "softness": 0.5, "width": 0.9},
                global_cfg={"angle": 142.0, "length": 0.72, "softness": 4.5, "width": 0.91},
                world_w=120.0,
            )
            self.assertIsNotNone(res)
            sh_img, bounds, mode = res
            self.assertEqual(mode, "auto_cast")
            # Clamped length keeps left shadow extent well within reasonable range (not 2.4x!)
            self.assertGreater(bounds[0], -1.65)
            # Peak alpha normalized cleanly around 252
            _, peak = sh_img.getchannel("A").getextrema()
            self.assertGreaterEqual(peak, 248)

            # Pass 7: Mountain shadows must project visibly PAST the western base (x < -0.72), never hide underneath!
            mp = Path(tmp) / "peak.png"
            _make_mountain_png(mp)
            m_res = exporter.bake_mountain_shadow(
                trimmed=Image.open(mp).convert("RGBA"),
                meta={"kind": "mountain", "anchor": {"x": 0.5, "y": 0.67}},
            )
            self.assertIsNotNone(m_res)
            m_img, m_bounds, m_mode = m_res
            self.assertEqual(m_mode, "mountain_field")
            self.assertLess(m_bounds[0], -0.72)
            _, m_peak = m_img.getchannel("A").getextrema()
            self.assertGreaterEqual(m_peak, 248)

    def test_pass8_ground_decals_nw_gate_and_painted_bridges(self) -> None:
        assets = ROOT / "assets"
        nc = json.loads((assets / "nature" / "nature_catalog.json").read_text(encoding="utf-8"))
        # Pass 9: 17 clean irregular zero-halo ground micro-decals (no black snow pebbles!)
        decals = [
            rel
            for rel, meta in nc["entries"].items()
            if meta.get("kind") == "ground_decal" and (assets / rel).is_file()
        ]
        self.assertGreaterEqual(len(decals), 17)
        self.assertNotIn("nature/decal_snow_drift_pebbles.png", nc["entries"])
        for rel in decals:
            entry = nc["entries"][rel]
            self.assertEqual((entry.get("shadow") or {}).get("mode"), "none")
            excluded = entry.get("excludedTerrainTypes") or []
            self.assertIn("snowfields", excluded)
            self.assertIn("frozen_tundra", excluded)

        # Native NW stone gate_dir5 exists & matches exact 468x501 edge_dir5 geometry
        gate5_path = assets / "walls" / "stone" / "gates" / "v1" / "gate_dir5.png"
        edge5_path = assets / "walls" / "stone" / "v7" / "edge_dir5.png"
        self.assertTrue(gate5_path.is_file())
        with Image.open(gate5_path) as g5, Image.open(edge5_path) as e5:
            self.assertEqual(g5.size, e5.size)

        # All 12 painted stone & timber river bridges exist across all 6 hex crossing directions
        for mat in ("stone", "timber"):
            for d in range(6):
                bp = assets / "bridges" / mat / f"bridge_dir_{d:02d}.png"
                self.assertTrue(bp.is_file(), f"Missing painted bridge {bp}")

    def test_pass10_painted_buildings_and_arctic_snow_mountains(self) -> None:
        assets = ROOT / "assets"
        nc = json.loads((assets / "nature" / "nature_catalog.json").read_text(encoding="utf-8"))

        # 1. All 5 P0 Settlement Centers + 5 Core Tier-1 Buildings exist with clean alpha transparency
        expected_buildings = [
            "buildings/centers/outpost.png",
            "buildings/centers/settlement.png",
            "buildings/centers/city.png",
            "buildings/centers/metropolis.png",
            "buildings/centers/capital_t1.png",
            "buildings/tier1/farm.png",
            "buildings/tier1/lumber_camp.png",
            "buildings/tier1/quarry.png",
            "buildings/tier1/fortress.png",
            "buildings/tier1/watchtower.png",
        ]
        for rel in expected_buildings:
            p = assets / rel
            self.assertTrue(p.is_file(), f"Missing painted building {p}")
            with Image.open(p) as im:
                self.assertEqual(im.mode, "RGBA")
                # Corners must be transparent (no opaque rectangle backdrop)
                self.assertEqual(im.getpixel((0, 0))[3], 0, f"Opaque top-left corner in {rel}")

        # 2. Building shadow baker produces valid directional 142-deg shadows for all 10 buildings
        bldg_items = exporter.bake_building_shadows(assets, {"angle": 142.0, "softness": 4.5})
        bldg_shadows = {item.key: item for item in bldg_items}
        self.assertGreaterEqual(len(bldg_shadows), 10)
        for rel in expected_buildings:
            key = f"building_shadow:{rel[:-4]}"
            self.assertIn(key, bldg_shadows)
            item = bldg_shadows[key]
            self.assertEqual(item.metadata.get("mode"), "building_cast")
            bounds = item.metadata.get("boundsInSpriteWidth")
            self.assertLess(bounds[0], bounds[2])
            self.assertLess(bounds[1], bounds[3])
            _, peak = item.image.getchannel("A").getextrema()
            self.assertGreaterEqual(peak, 240)

        # 3. All 3 Arctic Snow Mountains exist, allow snowfields/frozen_tundra, and green-slope / desert mountains exclude snowfields
        snow_capable_mountains = {
            "nature/snow_mountain_01.png",
            "nature/snow_mountain_02.png",
            "nature/snow_mountain_03.png",
            "nature/berg_01.png",
            "nature/berg_02.png",
            "nature/berg_03.png",
            "nature/berg_04.png",
            "nature/berg_14.png",
            "nature/berg_15.png",
            "nature/berg_16.png",
        }
        for i in (1, 2, 3):
            rel = f"nature/snow_mountain_0{i}.png"
            self.assertTrue((assets / rel).is_file(), f"Missing {rel}")
            entry = nc["entries"].get(rel)
            self.assertIsNotNone(entry, f"Missing catalog entry for {rel}")
            self.assertEqual(entry.get("kind"), "mountain")
            self.assertIn("snowfields", entry.get("allowedTerrainTypes") or [])
            self.assertIn("frozen_tundra", entry.get("allowedTerrainTypes") or [])
        for rel, entry in nc["entries"].items():
            if entry.get("kind") == "mountain" and rel not in snow_capable_mountains:
                self.assertIn(
                    "snowfields",
                    entry.get("excludedTerrainTypes") or [],
                    f"Non-arctic mountain {rel} must exclude pure snowfields",
                )

    def test_pass11_desert_mountains_biome_tiers_and_smaller_round_cacti(self) -> None:
        assets = ROOT / "assets"
        nc = json.loads((assets / "nature" / "nature_catalog.json").read_text(encoding="utf-8"))
        entries = nc["entries"]

        # 1. All 3 painted sandstone desert mountains exist, are RGBA with transparent corners, and target arid biomes only
        for i in (1, 2, 3):
            rel = f"nature/desert_mountain_0{i}.png"
            p = assets / rel
            self.assertTrue(p.is_file(), f"Missing {rel}")
            with Image.open(p) as im:
                self.assertEqual(im.mode, "RGBA")
                self.assertEqual(im.getpixel((0, 0))[3], 0, f"Opaque top-left corner in {rel}")
            entry = entries.get(rel)
            self.assertIsNotNone(entry)
            self.assertEqual(entry.get("kind"), "mountain")
            allowed = set(entry.get("allowedTerrainTypes") or [])
            self.assertIn("desert", allowed)
            self.assertIn("badlands", allowed)
            self.assertNotIn("snowfields", allowed)
            self.assertNotIn("grassland", allowed)

        # 2. Snow mountains must NEVER list desert or badlands as allowed terrain
        for snow_rel in ("nature/snow_mountain_01.png", "nature/snow_mountain_02.png", "nature/snow_mountain_03.png", "nature/berg_14.png", "nature/berg_01.png"):
            allowed = set(entries[snow_rel].get("allowedTerrainTypes") or [])
            self.assertIn("highland", allowed)
            self.assertNotIn("desert", allowed)
            self.assertNotIn("sandy_desert", allowed)
            self.assertNotIn("badlands", allowed)

        # 3. Round barrel cacti (cactus_01 & cactus_02) are exactly 50% smaller (logicalWidth=26 vs 52 for tall cacti)
        self.assertEqual(entries["nature/cactus_01.png"]["logicalWidth"], 26)
        self.assertEqual(entries["nature/cactus_02.png"]["logicalWidth"], 26)
        self.assertEqual(entries["nature/cactus_04.png"]["logicalWidth"], 52)

    def test_c_matrix_polish_and_atomic_staging_on_failure(self) -> None:
        # C-accelerated polish_terrain_rgb must match exact Rec.709 formula within +/-1 LSB
        im = Image.new("RGB", (8, 8), (180, 120, 60))
        polished = exporter.polish_terrain_rgb(im, "ground", "grassland", amount=0.35)
        r, g, b = polished.getpixel((0, 0))
        y = 0.2126 * 180 + 0.7152 * 120 + 0.0722 * 60
        s, c = 1.0 - 0.14 * 0.35, 1.0 - 0.12 * 0.35
        self.assertLessEqual(abs(r - round((y + (180 - y) * s - 128.0) * c + 128.0)), 1)
        self.assertLessEqual(abs(g - round((y + (120 - y) * s - 128.0) * c + 128.0)), 1)
        self.assertLessEqual(abs(b - round((y + (60 - y) * s - 128.0) * c + 128.0)), 1)
        # Snowfields stay untouched
        snow = exporter.polish_terrain_rgb(im, "ground", "snowfields", amount=0.35)
        self.assertEqual(snow.getpixel((0, 0)), (180, 120, 60))

        # Failed export must NOT destroy an existing valid out_dir (atomic staging guarantee!)
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            out_dir = base / "dist" / "game-assets"
            out_dir.mkdir(parents=True)
            sentinel = out_dir / "manifest.json"
            sentinel.write_text('{"sentinel": true}\n', encoding="utf-8")
            with self.assertRaises(Exception):
                exporter.export_all(assets_dir=base / "missing_assets", out_dir=out_dir)
            self.assertTrue(sentinel.is_file())
            self.assertIn("sentinel", sentinel.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()

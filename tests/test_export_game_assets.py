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


if __name__ == "__main__":
    unittest.main()

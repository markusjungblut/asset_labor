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


if __name__ == "__main__":
    unittest.main()

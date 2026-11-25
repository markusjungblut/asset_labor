"""Unit tests for scripts/ingest_new_pngs.py (batch PNG intake, audit, defringe & contact sheet)."""
from __future__ import annotations

import json
from pathlib import Path
import sys
import tempfile
import unittest

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import ingest_new_pngs  # noqa: E402


def _make_clean_sprite(path: Path, size: tuple[int, int] = (128, 128)) -> None:
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse([28, 22, 100, 108], fill=(64, 132, 58, 255))
    img.save(path, format="PNG")


def _make_opaque_bg_sprite(path: Path) -> None:
    img = Image.new("RGBA", (128, 128), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.ellipse([28, 22, 100, 108], fill=(120, 90, 60, 255))
    img.save(path, format="PNG")


def _make_white_fringe_sprite(path: Path) -> None:
    img = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse([26, 20, 102, 110], fill=(245, 245, 245, 110))
    draw.ellipse([32, 26, 96, 104], fill=(55, 110, 48, 255))
    img.save(path, format="PNG")


class IngestNewPngsTest(unittest.TestCase):
    def test_slugify_filename_normalizes_german_and_spaces(self):
        self.assertEqual(ingest_new_pngs.slugify_filename("Schnee Gipfel 01 (groß)"), "schnee_gipfel_01_gross")
        self.assertEqual(ingest_new_pngs.slugify_filename("Wildblüten-Teppich"), "wildblueten_teppich")

    def test_audit_detects_clean_opaque_and_white_fringe_sprites(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            clean_p = root / "clean_bush.png"
            opaque_p = root / "bad_white_bg.png"
            fringe_p = root / "fringe_bush.png"
            _make_clean_sprite(clean_p)
            _make_opaque_bg_sprite(opaque_p)
            _make_white_fringe_sprite(fringe_p)

            res_clean = ingest_new_pngs.audit_png(clean_p)
            self.assertEqual(res_clean.status, "PASS")
            self.assertAlmostEqual(res_clean.estimated_anchor_x, 0.5, delta=0.05)

            res_opaque = ingest_new_pngs.audit_png(opaque_p)
            self.assertEqual(res_opaque.status, "FAIL")
            self.assertTrue(any(i.code == "opaque_background" for i in res_opaque.issues))

            res_fringe = ingest_new_pngs.audit_png(fringe_p)
            self.assertEqual(res_fringe.status, "WARN")
            self.assertTrue(any(i.code == "white_fringe" for i in res_fringe.issues))

            # Verify defringe removes bright halo RGB while preserving alpha
            with Image.open(fringe_p) as raw:
                cleaned = ingest_new_pngs.defringe_rgba(raw)
                cleaned_p = root / "cleaned.png"
                cleaned.save(cleaned_p)
            res_after = ingest_new_pngs.audit_png(cleaned_p)
            self.assertEqual(res_after.status, "PASS")

    def test_batch_ingest_registers_decal_rejects_bad_and_renders_contact_sheet(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            inbox = root / "inbox"
            inbox.mkdir()
            (root / "assets" / "nature").mkdir(parents=True)
            catalog_path = root / "assets" / "nature" / "nature_catalog.json"
            catalog_path.write_text(
                json.dumps({"schemaVersion": 1, "revision": 5, "entries": {}}, indent=2),
                encoding="utf-8",
            )

            _make_clean_sprite(inbox / "Wildblumen 01.png")
            _make_opaque_bg_sprite(inbox / "Unfreigestellt.png")
            sheet_path = root / "dist" / "sheet.png"

            summary = ingest_new_pngs.ingest_batch(
                inputs=[inbox],
                repo_root=root,
                kind="ground_decal",
                biomes=["grassland", "pasture"],
                contact_sheet=sheet_path,
            )

            self.assertEqual(summary["total_scanned"], 2)
            self.assertEqual(summary["ingested"], 1)
            self.assertEqual(summary["failed"], 1)
            self.assertTrue((root / "assets" / "nature" / "wildblumen_01.png").is_file())
            self.assertFalse((root / "assets" / "nature" / "unfreigestellt.png").exists())
            self.assertTrue(sheet_path.is_file())

            cat = json.loads(catalog_path.read_text(encoding="utf-8"))
            self.assertEqual(cat["revision"], 6)
            entry = cat["entries"]["nature/wildblumen_01.png"]
            self.assertEqual(entry["kind"], "ground_decal")
            self.assertIn("micro_decal", entry["tags"])
            self.assertEqual(entry["shadow"]["mode"], "none")
            self.assertEqual(entry["allowedTerrainTypes"], ["grassland", "pasture"])


if __name__ == "__main__":
    unittest.main()

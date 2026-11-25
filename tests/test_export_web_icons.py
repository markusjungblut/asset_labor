"""Unit tests for scripts/export_web_icons.py."""
from __future__ import annotations

import json
from pathlib import Path
import sys
import tempfile
import unittest

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import export_web_icons  # noqa: E402


class ExportWebIconsTest(unittest.TestCase):
    def test_slugify_matches_m26_catalog_rules(self):
        self.assertEqual(export_web_icons.slugify_key("Alter Schlüssel"), "alter_schluessel")
        self.assertEqual(export_web_icons.slugify_key("Kürbis & Öl"), "kuerbis_oel")
        self.assertEqual(export_web_icons.slugify_key("Äpfel (groß)"), "aepfel_gross")
        self.assertEqual(export_web_icons.slugify_key("  Goldwaschpfanne  "), "goldwaschpfanne")

    def test_export_m26_ui_treasure_map_and_sync(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            icons_dir = root / "assets" / "icons" / "Test"
            ui_src_dir = root / "assets" / "icons" / "UI Icons"
            doc_src_dir = root / "assets" / "icons" / "Dokumente & Karten"
            icons_dir.mkdir(parents=True)
            ui_src_dir.mkdir(parents=True)
            doc_src_dir.mkdir(parents=True)
            m26_docs = root / "m26_docs"
            m26_docs.mkdir()
            out_dir = root / "dist" / "icons-webp"
            sync_dir = root / "public" / "icons"

            Image.new("RGBA", (256, 256), (180, 120, 40, 255)).save(
                icons_dir / "Alter_Schlüssel.png"
            )
            Image.new("RGBA", (256, 256), (40, 120, 180, 255)).save(
                icons_dir / "Unused_Relic.png"
            )
            Image.new("RGBA", (256, 256), (110, 75, 45, 255)).save(
                ui_src_dir / "Holzscheite.png"
            )
            Image.new("RGBA", (1024, 768), (210, 190, 140, 255)).save(
                doc_src_dir / "Schatzkarte.png"
            )

            (m26_docs / "M26_SETS_KONSOLIDIERT_40.csv").write_text(
                '"Set-ID";"Iconname"\n"KS01";"Alter Schlüssel"\n',
                encoding="utf-8-sig",
            )
            (m26_docs / "M26_PREISARBEITSKATALOG.csv").write_text(
                '"Iconname";"Kategorie";"GitHub-Pfad"\n'
                '"Alter Schlüssel";"Test";"assets/icons/Test/Alter_Schlüssel.png"\n',
                encoding="utf-8-sig",
            )

            summary = export_web_icons.export_icons(
                repo_root=root,
                m26_docs=m26_docs,
                out_dir=out_dir,
                size=128,
                quality=85,
                sync_to=sync_dir,
            )
            self.assertEqual(summary["exported_count"], 1)
            self.assertEqual(summary["ui_exported_count"], 1)
            self.assertTrue(summary["has_treasure_map"])
            self.assertEqual(summary["missing_count"], 0)
            self.assertEqual(summary["unused_source_png_count"], 1)

            webp_path = out_dir / "128" / "alter_schluessel.webp"
            ui_path = out_dir / "ui" / "wood.webp"
            tm_path = out_dir / "ui" / "treasure_map.webp"
            self.assertTrue(webp_path.is_file())
            self.assertTrue(ui_path.is_file())
            self.assertTrue(tm_path.is_file())

            # Verify --sync-to mirrored WebPs + manifest cleanly (without unused_icons.json)
            self.assertTrue((sync_dir / "128" / "alter_schluessel.webp").is_file())
            self.assertTrue((sync_dir / "ui" / "wood.webp").is_file())
            self.assertTrue((sync_dir / "ui" / "treasure_map.webp").is_file())
            self.assertTrue((sync_dir / "manifest.json").is_file())
            self.assertFalse((sync_dir / "unused_icons.json").exists())

            with Image.open(webp_path) as out_img:
                self.assertEqual(out_img.size, (128, 128))
                self.assertEqual(out_img.format, "WEBP")
            with Image.open(tm_path) as tm_img:
                self.assertEqual(tm_img.size, (768, 576))
                self.assertEqual(tm_img.format, "WEBP")

            unused = json.loads((out_dir / "unused_icons.json").read_text(encoding="utf-8"))
            self.assertEqual(unused["paths"], ["assets/icons/Test/Unused_Relic.png"])


if __name__ == "__main__":
    unittest.main()

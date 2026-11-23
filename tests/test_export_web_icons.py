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

    def test_export_and_unused_detection_on_fixture(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            icons_dir = root / "assets" / "icons" / "Test"
            icons_dir.mkdir(parents=True)
            m26_docs = root / "m26_docs"
            m26_docs.mkdir()
            out_dir = root / "dist" / "icons-webp"

            Image.new("RGBA", (256, 256), (180, 120, 40, 255)).save(
                icons_dir / "Alter_Schlüssel.png"
            )
            Image.new("RGBA", (256, 256), (40, 120, 180, 255)).save(
                icons_dir / "Unused_Relic.png"
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
            )
            self.assertEqual(summary["exported_count"], 1)
            self.assertEqual(summary["missing_count"], 0)
            self.assertEqual(summary["unused_source_png_count"], 1)

            webp_path = out_dir / "128" / "alter_schluessel.webp"
            self.assertTrue(webp_path.is_file())
            with Image.open(webp_path) as out_img:
                self.assertEqual(out_img.size, (128, 128))
                self.assertEqual(out_img.format, "WEBP")

            unused = json.loads((out_dir / "unused_icons.json").read_text(encoding="utf-8"))
            self.assertEqual(unused["paths"], ["assets/icons/Test/Unused_Relic.png"])


if __name__ == "__main__":
    unittest.main()

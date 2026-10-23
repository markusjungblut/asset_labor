"""On-disk cached-terrain contract; no source asset write access needed."""
from __future__ import annotations
import base64
import io
import json
import tempfile
import unittest
from pathlib import Path

from PIL import Image
from static_terrain_store import SCHEMA, index, load, store


class StaticTerrainStoreTests(unittest.TestCase):
    def layer(self):
        image = Image.new("RGBA", (8, 6), (30, 80, 90, 175))
        output = io.BytesIO()
        image.save(output, format="PNG")
        return {
            "x": -123, "y": 14, "width": 16, "height": 12,
            "density": .5,
            "png": base64.b64encode(output.getvalue()).decode("ascii"),
        }

    def test_persist_and_reload_exact_chunk(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            key = "a" * 64
            doc = store(root, {"schemaVersion": SCHEMA, "key": key,
                               "land": self.layer(), "water": self.layer()})
            self.assertEqual(doc["key"], key)
            self.assertTrue((root / key[:2] / (key + ".land.png")).is_file())
            self.assertTrue((root / key[:2] / (key + ".water.png")).is_file())
            self.assertEqual(load(root, key), doc)
            self.assertEqual(index(root)["keys"], [key])
            self.assertEqual(index(root)["schemaVersion"], SCHEMA)

    def test_bad_keys_and_payloads_never_escape_cache_directory(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for key in ("../bad", "g" * 64, "0" * 65, "", 9):
                with self.assertRaises(ValueError):
                    store(root, {"schemaVersion": SCHEMA, "key": key,
                                 "land": self.layer()})
                self.assertIsNone(load(root, key))
            data = self.layer()
            data["png"] = "../../garbage"
            with self.assertRaises(ValueError):
                store(root, {"schemaVersion": SCHEMA, "key": "f" * 64,
                             "land": data})
            self.assertEqual(index(root)["keys"], [])


if __name__ == "__main__":
    unittest.main()

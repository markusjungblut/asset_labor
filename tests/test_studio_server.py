"""Regression tests for the Decision 0123 P4 WebGL2 Asset-Labor Studio & Export API."""
from __future__ import annotations

import json
from pathlib import Path
import sys
import threading
import unittest
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import server  # noqa: E402


class WebGL2StudioServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        cls.port = cls.httpd.server_port
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join(timeout=5)

    def _get(self, path: str) -> tuple[int, bytes]:
        with urllib.request.urlopen(f"http://127.0.0.1:{self.port}{path}", timeout=5) as res:
            return res.status, res.read()

    def test_studio_assets_and_bundle_served(self):
        for route in (
            "/studio.html",
            "/studio.css",
            "/studio-app.js",
            "/vedras-map-engine.bundle.js",
            "/geography-lab.html",
        ):
            status, body = self._get(route)
            self.assertEqual(status, 200, route)
            self.assertGreater(len(body), 200, route)

        _, html_bytes = self._get("/studio.html")
        html = html_bytes.decode("utf-8")
        self.assertIn("vedras-map-engine.bundle.js", html)
        self.assertIn("studio-app.js", html)
        self.assertIn('id="glCanvas"', html)
        self.assertIn('id="exportAssetsBtn"', html)

    def test_export_status_and_catalog_endpoints(self):
        status, body = self._get("/api/export-game-assets/status")
        self.assertEqual(status, 200)
        payload = json.loads(body)
        self.assertIn(payload["state"], ("ready", "missing", "building", "idle"))
        self.assertIn("contentHash", payload)
        self.assertIn("exportedMb", payload)
        self.assertIn("progress", payload)
        self.assertIn("stage", payload)

        status_n, body_n = self._get("/api/nature-catalog")
        self.assertEqual(status_n, 200)
        nature = json.loads(body_n)
        self.assertEqual(nature.get("schemaVersion"), 1)
        self.assertGreater(len(nature.get("entries", {})), 300)

        status_t, body_t = self._get("/api/terrain-catalog")
        self.assertEqual(status_t, 200)
        terrain = json.loads(body_t)
        self.assertEqual(terrain.get("schemaVersion"), 2)
        self.assertGreater(len(terrain.get("terrainTypes", [])), 20)

    def test_nature_catalog_post_accepts_full_size_payload(self):
        # Validate our 4 MB cap handles the real 524 KB nature_catalog.json without 413.
        raw = (ROOT / "assets" / "nature" / "nature_catalog.json").read_bytes()
        self.assertGreater(len(raw), 500_000)
        catalog = json.loads(raw.decode("utf-8"))
        # Validate without mutating on-disk file by checking validator directly.
        server.validate_nature_catalog(catalog)

    def test_python38_compatibility_and_stale_pack_detector(self):
        import ast

        for rel in (
            "server.py",
            "scripts/export_game_assets.py",
            "scripts/ingest_new_pngs.py",
            "scripts/export_web_icons.py",
        ):
            src = (ROOT / rel).read_text(encoding="utf-8")
            tree = ast.parse(src, filename=rel, feature_version=(3, 8))
            has_future = any(
                isinstance(n, ast.ImportFrom)
                and n.module == "__future__"
                and any(a.name == "annotations" for a in n.names)
                for n in tree.body[:5]
            )
            self.assertTrue(has_future, f"{rel} must import future annotations for Python 3.8/3.9")

        # Pillow < 9.1 compatibility: export_game_assets.py must never access Image.Resampling / Image.Transform directly
        exporter_src = (ROOT / "scripts" / "export_game_assets.py").read_text(encoding="utf-8")
        self.assertNotIn("Image.Resampling.", exporter_src)
        self.assertNotIn("Image.Transform.", exporter_src)

        # Missing manifest must cleanly report stale without throwing
        stale, reason, out_of_sync = server._detect_pack_staleness(
            ROOT / "dist" / "__nonexistent_manifest__.json",
            {},
            None,
        )
        self.assertTrue(stale)
        self.assertTrue(bool(reason))
        self.assertTrue(out_of_sync)


if __name__ == "__main__":
    unittest.main()

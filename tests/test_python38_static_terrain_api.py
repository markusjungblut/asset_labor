"""Regression checks for terrain-cache GET endpoints on Python 3.8 and newer.

Uses only the standard library; source PNGs and actual cached terrain are never
modified. A temporary cache directory isolates the HTTP integration tests.
"""
import json
import sys
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest import mock
from urllib.error import HTTPError
from urllib.request import urlopen

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import server


class QuietHandler(server.Handler):
    def log_message(self, *args):
        pass


class TerrainCachePython38Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tempdir = tempfile.TemporaryDirectory()
        cls.patcher = mock.patch.object(server, "STATIC_TERRAIN", Path(cls.tempdir.name))
        cls.patcher.start()
        cls.httpd = server.ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = "http://127.0.0.1:{}/api/static-terrain".format(cls.httpd.server_port)

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join(timeout=5)
        cls.patcher.stop()
        cls.tempdir.cleanup()

    def read_json(self, suffix):
        try:
            with urlopen(self.base + suffix, timeout=8) as response:
                return response.status, json.load(response)
        except HTTPError as response:
            return response.code, json.load(response)

    def test_missing_cache_key_returns_http_404_not_uncaught_attribute_error(self):
        status, data = self.read_json("/" + "f" * 64)
        self.assertEqual(status, 404)
        self.assertIn("error", data)

    def test_invalid_cache_key_returns_http_404(self):
        status, data = self.read_json("/invalid-key")
        self.assertEqual(status, 404)
        self.assertIn("error", data)

    def test_stored_cache_metadata_can_be_loaded(self):
        key = "a" * 64
        root = Path(self.tempdir.name) / key[:2]
        root.mkdir(exist_ok=True)
        doc = {"schemaVersion": 2, "key": key,
               "land": {"x": 0, "y": 0, "width": 64, "height": 64,
                        "density": 1, "file": "precomputed/terrain/aa/" + key + ".land.png"},
               "water": None}
        (root / (key + ".json")).write_text(json.dumps(doc), encoding="utf-8")
        status, result = self.read_json("/" + key)
        self.assertEqual(status, 200)
        self.assertEqual(result, doc)
        index_status, index = self.read_json("-index")
        self.assertEqual(index_status, 200)
        self.assertIn(key, index["keys"])

    def test_repeated_parallel_terrain_misses_do_not_crash_handler(self):
        # Simulates the editor querying many different uncached chunks.
        paths = ["/" + "{:064x}".format(i + 1000) for i in range(24)]
        with ThreadPoolExecutor(max_workers=4) as executor:
            responses = list(executor.map(self.read_json, paths))
        self.assertTrue(all(status == 404 for status, _ in responses))

    def test_no_python39_only_string_method_in_server(self):
        src = (Path(__file__).resolve().parents[1] / "server.py").read_text("utf-8")
        self.assertNotIn(".removeprefix(", src)
        self.assertNotIn(".removesuffix(", src)


if __name__ == "__main__":
    unittest.main()

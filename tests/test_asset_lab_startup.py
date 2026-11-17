"""Server-Start-Sicherheitsvertrag (CI, ohne Originalgrafiken/Browserdaten)."""
from __future__ import annotations
import json
import os
from pathlib import Path
import socket
import sys
import threading
import urllib.request
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import server  # noqa: E402


class AssetLabStartupTest(unittest.TestCase):
    def test_full_editor_root_and_version_api(self):
        self.assertTrue((ROOT / "index.html").is_file())
        self.assertTrue((ROOT / "server.py").is_file())
        httpd = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            port = httpd.server_port
            for route in ("/", "/index.html"):
                with urllib.request.urlopen(
                    f"http://127.0.0.1:{port}{route}", timeout=5
                ) as response:
                    html = response.read().decode("utf-8")
                    self.assertEqual(response.status, 200)
                    self.assertIn("Asset-Labor", html)
                    self.assertIn('id="serverStatus"', html)
                    self.assertIn("app.js", html)
            with urllib.request.urlopen(
                f"http://127.0.0.1:{port}/api/version", timeout=5
            ) as response:
                version = json.loads(response.read())
            self.assertEqual(version["port"], port)
            self.assertEqual(version["version"], server.VERSION)
        finally:
            httpd.shutdown()
            httpd.server_close()
            thread.join(timeout=5)

    def test_strict_port_rejects_occupied_without_fallback(self):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as occupied:
            occupied.bind(("127.0.0.1", 0))
            occupied.listen(1)
            original_port, original_strict = server.PORT, server.STRICT_PORT
            try:
                server.PORT = occupied.getsockname()[1]
                server.STRICT_PORT = True
                with self.assertRaisesRegex(RuntimeError, "Port .*ist belegt"):
                    server.choose_server()
            finally:
                server.PORT = original_port
                server.STRICT_PORT = original_strict

    def test_dynamic_port_still_allowed_for_isolated_ci(self):
        old_port, old_strict = server.PORT, server.STRICT_PORT
        try:
            server.PORT = 0
            server.STRICT_PORT = True
            instance = server.choose_server()
            self.assertGreater(instance.server_port, 0)
            instance.server_close()
        finally:
            server.PORT = old_port
            server.STRICT_PORT = old_strict

    def test_windows_launcher_is_regular_editor_not_test_runner(self):
        launcher = (ROOT / "START_WINDOWS.bat").read_text(encoding="utf-8")
        self.assertIn('set "VEDRAS_STRICT_PORT=1"', launcher)
        self.assertIn('set "VEDRAS_PORT=8780"', launcher)
        self.assertIn("index.html", launcher)
        self.assertIn('if not exist "assets', launcher)
        self.assertNotIn("node ", launcher)
        self.assertNotIn("rendering-step13-auto.mjs", launcher)


if __name__ == "__main__":
    unittest.main()

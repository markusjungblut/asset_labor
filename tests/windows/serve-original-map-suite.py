"""Read-only two-version localhost server for the original Firefox map acceptance.

Both viewer implementations share the SAME origin 127.0.0.1:8780 so they
can access the user's existing IndexedDB map and derived caches. The
server exposes static files only; no editor or asset mutation endpoints.
"""
from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


class ReadOnlySuiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, baseline, candidate, suite, **kwargs):
        self._roots = {
            "baseline": Path(baseline).resolve(),
            "candidate": Path(candidate).resolve(),
            "suite": Path(suite).resolve(),
        }
        super().__init__(*args, directory=str(self._roots["suite"]), **kwargs)

    def translate_path(self, path):
        request_path = urlsplit(path).path
        if request_path.startswith("/baseline/"):
            self.directory = str(self._roots["baseline"])
            request_path = "/" + request_path[len("/baseline/"):]
        elif request_path.startswith("/candidate/"):
            self.directory = str(self._roots["candidate"])
            request_path = "/" + request_path[len("/candidate/"):]
        elif request_path in (
            "/renderer-original-map.html",
            "/renderer-original-map-suite.js",
        ):
            self.directory = str(self._roots["suite"])
        else:
            self.directory = str(self._roots["suite"])
            request_path = "/__route_not_found__"
        return super().translate_path(request_path)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/":
            self.send_response(302)
            self.send_header("Location", "/renderer-original-map.html")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        if path == "/__vedras_suite_mode":
            data = b"combined-v1"
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def do_POST(self):
        self.send_error(405, "Read-only acceptance server")

    def do_PUT(self):
        self.send_error(405, "Read-only acceptance server")

    def do_DELETE(self):
        self.send_error(405, "Read-only acceptance server")


def main():
    parser = ArgumentParser()
    parser.add_argument("--baseline", required=True)
    parser.add_argument("--candidate", required=True)
    parser.add_argument("--suite", required=True)
    parser.add_argument("--port", type=int, default=8780)
    args = parser.parse_args()
    for dirname in (args.baseline, args.candidate, args.suite):
        if not Path(dirname).is_dir():
            parser.error("Test directory missing: " + dirname)
    for folder in (args.baseline, args.candidate):
        if not (Path(folder) / "frozen-map-game.html").is_file():
            parser.error("Frozen viewer missing: " + folder)
    for filename in ("renderer-original-map.html", "renderer-original-map-suite.js"):
        if not (Path(args.suite) / filename).is_file():
            parser.error("Runner missing: " + filename)
    handler = partial(
        ReadOnlySuiteHandler,
        baseline=args.baseline,
        candidate=args.candidate,
        suite=args.suite,
    )
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        print("Readonly complete Firefox suite: http://127.0.0.1:%d/renderer-original-map.html" % args.port, flush=True)
        print("One click runs main baseline (3) and candidate ABBA (48) using one IndexedDB origin.", flush=True)
        print("Stop with Ctrl+C. No atlas writes or repository changes.", flush=True)
        server.serve_forever()


if __name__ == "__main__":
    main()

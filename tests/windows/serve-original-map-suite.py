"""Read-only two-version localhost server for the original Firefox map acceptance.

Both viewer implementations share the SAME origin 127.0.0.1:8780 so they
can access the user's existing IndexedDB map and derived caches. The
server exposes static files only; no editor or asset mutation endpoints.
"""
from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from shutil import which
from subprocess import run
from urllib.parse import urlsplit, parse_qs


# Diagnostic-only in-memory source instrumentation. Static files on disk
# and the production branch remain unchanged. Reject runtime drift.
_TILE_TRACE_BOOT = r"""
window.__vedrasTileTrace=(function(){
 const LIMIT=6500;
 let origin=performance.now(),events=[],dropped=0,counts=Object.create(null),
  blocked=new Map(),missing=new Map(),peakMissing=0;
 const elapsed=()=>performance.now()-origin;
 function emit(kind,details){
  counts[kind]=(counts[kind]||0)+1;
  if(events.length<LIMIT)
   events.push(Object.assign({tMs:Math.round(elapsed()),kind},details||{}));
  else dropped++;
 }
 function block(kind,id,details){
  const key=kind+'|'+id,at=elapsed(),prev=blocked.get(key);
  if(prev==null||at-prev>=40){
   blocked.set(key,at);emit(kind,Object.assign({id},details||{}));
  }
 }
 function observe(visible,unready,decodedPixels,inFlight,frame){
  const all=new Set(visible),absent=new Set(unready);
  peakMissing=Math.max(peakMissing,absent.size);
  for(const id of absent)if(!missing.has(id)){
   missing.set(id,elapsed());
   emit('missing-start',{id,frame,decodedPixels,inFlight});
  }
  for(const [id,since] of missing)if(!absent.has(id)){
   emit(all.has(id)?'missing-ready':'missing-left-view',
    {id,frame,waitMs:Math.round(elapsed()-since)});
   missing.delete(id);
  }
 }
 function reset(){
  origin=performance.now();events=[];dropped=0;counts=Object.create(null);
  blocked.clear();missing.clear();peakMissing=0;
 }
 function report(){return {
  schema:'vedras-tile-lifecycle-v1',durationMs:Math.round(elapsed()),
  eventLimit:LIMIT,dropped,counts:{...counts},peakMissing,
  outstandingMissing:[...missing.keys()].slice(0,40),events:events.slice()
 };}
 return {emit,block,observe,reset,report};
})();
"""
_TILE_TRACE_PATCHES = [
    ("  const decoded=new Map(),loading=new Set();", "  const decoded=new Map(),loading=new Set();\n  const tileTrace=window.__vedrasTileTrace||null;"),
    ("    decoded.delete(victim);decodedRevision++;", "    if(tileTrace)tileTrace.emit('evict',{id:victim,origin:entry.origin,\n     variant:entry.variant,pixels:entry.pixels,decodedPixels});\n    decoded.delete(victim);decodedRevision++;"),
    ("   if(loading.has(id)){", "   if(loading.has(id)){\n    if(tileTrace&&!speculative&&!fallback)tileTrace.block('inflight-wait',id,\n     {inFlight:loading.size,decodedPixels});"),
    ("   if(loading.size>=MAX_INFLIGHT&&!borrowing){", "   if(loading.size>=MAX_INFLIGHT&&!borrowing){\n    if(tileTrace&&!speculative&&!fallback)tileTrace.block('capacity-wait',id,\n     {inFlight:loading.size,decodedPixels});"),
    ("   loading.add(id);\n   peakInFlight", "   loading.add(id);\n   if(tileTrace)tileTrace.emit('read-start',\n    {id,purpose,inFlight:loading.size,decodedPixels});\n   peakInFlight"),
    ("    readFinished=profiler?clock():0;\n    if(!record", "    readFinished=profiler?clock():0;\n    if(tileTrace)tileTrace.emit('storage-done',\n     {id,durationMs:Math.round(readFinished-readStarted)});\n    if(!record"),
    ("    if(profiler)decodeDuration=clock()-decodeStarted;\n    if(!active", "    if(profiler)decodeDuration=clock()-decodeStarted;\n    if(tileTrace)tileTrace.emit('decode-done',\n     {id,durationMs:Math.round(decodeDuration)});\n    if(!active"),
    ("    decodedPixels+=pixels;loads++;\n    keepWithinBudget();", "    decodedPixels+=pixels;loads++;\n    keepWithinBudget();\n    if(tileTrace)tileTrace.emit('ready',\n     {id,purpose:actualPurpose,redecoded:count>0,\n      resident:decoded.has(id),pixels,decodedPixels});"),
    ("   }).catch(()=>{\n    if(run===generation)failures++;", "   }).catch(()=>{\n    if(tileTrace)tileTrace.emit('read-error',{id});\n    if(run===generation)failures++;"),
    ("   const tiles=[];\n   for(const t of visible){", "   const tiles=[];\n   const traceVisible=tileTrace?[]:null,traceUnready=tileTrace?[]:null;\n   for(const t of visible){"),
    ("    else misses++;\n   }\n   // Demand", "    else misses++;\n    if(tileTrace){\n     const key=cacheKey(t.key,variant);\n     traceVisible.push(key);\n     if(!entry)traceUnready.push(key);\n    }\n   }\n   if(tileTrace)tileTrace.observe(traceVisible,traceUnready,\n    decodedPixels,loading.size,frame);\n   // Demand"),
]

def _tile_trace_runtime(source):
    anchor = chr(10).join(["'use strict';", "window.VedrasFrozenMap=(()=>{"])
    if source.count(anchor) != 1:
        raise ValueError("Unknown candidate runtime entrypoint")
    source = source.replace(anchor, "'use strict';" + chr(10) +
                            _TILE_TRACE_BOOT + chr(10) +
                            "window.VedrasFrozenMap=(()=>{", 1)
    for old, new in _TILE_TRACE_PATCHES:
        if source.count(old) != 1:
            raise ValueError("Candidate trace anchor missing or duplicated: " + old[:70])
        source = source.replace(old, new, 1)
    return source


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

    def _send_diagnostic_text(self, body, content_type):
        data = body.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        parsed = urlsplit(self.path)
        path = parsed.path
        if (path in ("/candidate/frozen-map-game.html",
                     "/candidate/frozen-map-runtime.js") and
                parse_qs(parsed.query).get("tileTrace") == ["1"]):
            root = self._roots["candidate"]
            try:
                if path.endswith(".html"):
                    page = (root / "frozen-map-game.html").read_text(encoding="utf-8")
                    marker = "frozen-map-runtime.js?v="
                    if page.count(marker) != 1:
                        raise ValueError("Candidate viewer runtime script missing")
                    page = page.replace(marker,
                                        "frozen-map-runtime.js?tileTrace=1&amp;v=", 1)
                    self._send_diagnostic_text(page, "text/html; charset=utf-8")
                else:
                    runtime = (root / "frozen-map-runtime.js").read_text(encoding="utf-8")
                    self._send_diagnostic_text(_tile_trace_runtime(runtime),
                                               "application/javascript; charset=utf-8")
            except (OSError, ValueError) as exc:
                self.send_error(503, "Tile lifecycle trace unavailable: " + str(exc))
            return
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
    # Validate exact diagnostic anchors before binding a port, never silently
    # serve a differently patched candidate or change source files on disk.
    viewer_source = (Path(args.candidate) / "frozen-map-game.html").read_text(encoding="utf-8")
    if viewer_source.count("frozen-map-runtime.js?v=") != 1:
        parser.error("Candidate viewer runtime tag changed; tile trace disabled")
    try:
        traced_runtime = _tile_trace_runtime(
            (Path(args.candidate) / "frozen-map-runtime.js").read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        parser.error("Candidate lifecycle trace preflight failed: " + str(exc))
    node = which("node")
    if node:
        checked = run([node, "--check", "-"], input=traced_runtime,
                      text=True, capture_output=True, timeout=15, check=False)
        if checked.returncode:
            parser.error("Instrumented JS failed syntax check: " + checked.stderr[:1500])
    else:
        print("Warning: node missing; transformed runtime not JS syntax-checked", flush=True)
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

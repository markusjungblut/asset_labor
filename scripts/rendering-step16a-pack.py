#!/usr/bin/env python3
"""Package Step16A JSON/README only; never mix older step15 data."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import sys
root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("artifacts/rendering-step16a-audit")
root = root.resolve()
destination = root / "step16a-audit.zip"
if not (root / "result.json").exists():
    raise SystemExit("Step16A result.json missing; no ZIP created")
with ZipFile(destination, "w", ZIP_DEFLATED, compresslevel=6) as archive:
    for name in ("result.json", "README.md"):
        file = root / name
        if file.is_file():
            archive.write(file, arcname=name)
    for file in sorted((root / "images").glob("*.png")):
        if file.is_file():
            archive.write(file, arcname="images/" + file.name)
print("Step16A archive:", destination)

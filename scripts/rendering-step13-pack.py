"""Package local Step-13 diagnostic evidence for sharing without external deps."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import sys

if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/rendering-step13-pack.py ARTIFACTS_DIR")
    directory = Path(sys.argv[1]).resolve()
    if not directory.is_dir():
        raise SystemExit(f"Directory not found: {directory}")
    archive = directory / "step13-results.zip"
    evidence = sorted(p for p in directory.iterdir()
                      if p.is_file() and p.suffix.lower() in {".png", ".json", ".md"})
    if not evidence:
        raise SystemExit("No report, JSON or screenshots generated")
    with ZipFile(archive, "w", compression=ZIP_DEFLATED, compresslevel=6) as bundle:
        for path in evidence:
            bundle.write(path, path.name)
    print(f"ZIP available: {archive} ({len(evidence)} files)")

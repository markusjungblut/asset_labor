"""Package Step-15 Atlas A/B evidence including per-mode images and JSON."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import sys

if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/rendering-step15-pack.py ARTIFACTS_DIR")
    directory = Path(sys.argv[1]).resolve()
    if not directory.is_dir():
        raise SystemExit(f"Directory not found: {directory}")
    output = directory / "step15-diagnostics.zip"
    evidence = sorted(p for p in directory.rglob("*") if p.is_file() and
                      p.suffix.lower() in {".png", ".json", ".md"})
    if not evidence:
        raise SystemExit("No evidence generated")
    with ZipFile(output, "w", compression=ZIP_DEFLATED, compresslevel=6) as bundle:
        for path in evidence:
            bundle.write(path, path.relative_to(directory))
    print(f"ZIP available: {output} ({len(evidence)} files)")

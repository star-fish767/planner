#!/usr/bin/env python3
"""Create a distributable zip in ./dist."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)
ZIP_PATH = DIST / "planner-studio-pro.zip"

files = [
    "index.html",
    "styles.css",
    "app.js",
    "launcher.py",
    "launch.sh",
    "launch.bat",
    "README.md",
]

with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as zf:
    for rel in files:
        zf.write(ROOT / rel, rel)

print(f"Created: {ZIP_PATH}")

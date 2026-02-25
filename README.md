# Planner Studio Pro (Local App)

## What you need
- Python 3.9+ installed.
- Any modern browser (Chrome, Firefox, Edge, Safari).

## Run locally (launcher)

### Windows
1. Put all files in one folder.
2. Double-click `launch.bat`.

### macOS / Linux
1. Open terminal in this folder.
2. Run:
   ```bash
   chmod +x launch.sh
   ./launch.sh
   ```

### Manual fallback
If launcher scripts fail, run:
```bash
python3 launcher.py
```
Then open the printed URL.

## Make a zip to copy to another computer
Run:
```bash
python3 package_app.py
```
This creates:
- `dist/planner-studio-pro.zip`

> Note: The zip is generated locally and intentionally not committed to git (keeps PRs text-only).

Copy that zip to your computer, unzip, then run launcher (`launch.bat` or `launch.sh`).

## Stop the app
In the terminal running the launcher, press `Ctrl+C`.

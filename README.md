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


## If GitHub Pull Request did not work

If your PR creation failed, use this exact fallback sequence from your local clone:

```bash
git status
git remote -v
# if needed, set your GitHub repo URL:
# git remote set-url origin https://github.com/<your-user>/planner.git

git push -u origin <your-branch-name>
```

Then open your branch in GitHub and click **Compare & pull request**.

### Common causes
- **Binary file restrictions in PR checks**: this repo ignores generated zips (`dist/*.zip`), so regenerate locally but do not commit the zip.
- **Wrong remote URL**: verify with `git remote -v`.
- **Not authenticated**: re-auth in GitHub CLI or your git credential manager.

### Optional: generate zip locally for download/copy
```bash
python3 package_app.py
```
This writes `dist/planner-studio-pro.zip` locally.

# Vault-Tec Soundboard

A Fallout / Pip-Boy themed soundboard. Pure static site — no backend, no build step.
It hosts on GitHub Pages and auto-lists every audio file in the `sounds/` folder.

## How it works
- `index.html` — the whole app (HTML/CSS/JS in one file).
- `sounds/` — drop audio files here. The page lists them automatically via the
  GitHub public contents API, with `sounds/manifest.json` as an offline fallback.
- Tile labels come from filenames: `war_never_changes.mp3` → **WAR NEVER CHANGES**.

## Add a sound
1. Add an `.mp3` (or `.wav` / `.ogg` / `.m4a`) to the `sounds/` folder.
2. Commit and push (or use GitHub's **Add file → Upload files**).
3. Wait ~30–60s for Pages to rebuild, reload the page.

## Remove a sound
Delete the file from `sounds/` and push.

## Enable GitHub Pages (one time)
Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main` / root → Save.
Site goes live at `https://freeedie666.github.io/`.

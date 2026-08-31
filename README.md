# VIZAG — RISE OF THE COAST

## Phase 8 — Story & Mission Expansion

A fictionalized, browser-based open-world adventure inspired by Visakhapatnam.

### Phase 8 additions
- 20 sequential main-story missions.
- 30 side missions.
- Mission journal with main/side tabs.
- Side mission start buttons.
- Checkpoint markers.
- Reach / vehicle / time / weather / wanted / crime / economy / property objectives.
- Rewards and persistent mission completion.
- Key story dialogue/cutscene overlay.
- Save/load mission progress.

### Run locally
Serve this directory over HTTP because ES modules and JSON data are fetched at runtime.

```bash
python3 -m http.server 5173
```

Open `http://127.0.0.1:5173/`.

### GitHub Pages
Push the folder contents to a repository and enable GitHub Pages. No backend is required.

Real-world place names are used only as inspiration/reference points; the game world and buildings are fictionalized/procedural.

## Phase 9
Advanced graphics/performance optimization has been added: adaptive resolution, distance culling, shadow-distance management, quality profiles, and FPS telemetry. See `PHASE-9.md`.

## Phase 10
Final release hardening for PC and Android/mobile web: PWA manifest, install prompt, service worker, persistent settings, versioned saves, fullscreen, startup error recovery, and GitHub Pages deployment readiness. See `PHASE-10.md`.

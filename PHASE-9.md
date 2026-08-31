# PHASE 9 — Advanced Graphics + Performance

Phase 9 is the optimization pass built on Phase 8.

## Included
- Adaptive render resolution based on recent FPS.
- Automatic Low / Medium / High / Ultra rendering profiles.
- Device-pixel-ratio caps to avoid excessive mobile GPU load.
- Distance culling for streamed world meshes.
- Distance-based shadow disabling for far objects.
- Three.js frustum culling explicitly enabled on meshes.
- Quality-aware scene fog/draw distance.
- Live FPS + render-scale telemetry in the HUD.
- Updated service-worker cache version.
- Existing world streaming remains active and compatible with Phase 9 culling.

## Controls
Open Settings and change Graphics Quality. The renderer will adapt resolution automatically during play.

## Performance behavior
The game starts at the selected quality profile, then gently lowers render scale when FPS falls below the target and restores scale when headroom is available. This is intentionally conservative to avoid visible quality oscillation.

## GitHub Pages
The project remains static and uses only relative local assets plus the existing Three.js import map CDN dependency.

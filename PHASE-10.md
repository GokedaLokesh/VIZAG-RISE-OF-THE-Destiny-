# Phase 10 — Final PC + Android/Mobile Web Release

## Release hardening
- PWA manifest and install prompt.
- Service worker with versioned cache and safe stale fallback for same-origin assets.
- Fatal startup error overlay with reload action.
- Persistent graphics/control settings.
- Versioned save format with timestamps.
- Fullscreen control.
- Mobile safe-area/overscroll hardening.
- GitHub Pages-compatible relative paths and no backend requirement.

## Controls
PC: WASD, Shift, Space, E, M, Esc, mouse.
Mobile: joystick, touch camera, action buttons.

## Deployment
Serve over HTTP/HTTPS. GitHub Pages can host the project as a static site. Three.js remains loaded from jsDelivr, so first launch requires network access unless Three.js is vendored locally in a future offline build.

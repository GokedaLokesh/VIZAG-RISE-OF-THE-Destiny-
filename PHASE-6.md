# Phase 6 — Economy, Shops, Garages & Properties

Phase 6 turns the expanded Phase 5 city into an interactive economy layer while keeping the project static-host and GitHub Pages friendly.

## Added
- Interactive shops, restaurants and clothing store.
- Food, drinks, meals, juice, clothing and first-aid inventory items.
- Inventory screen with item use and health/stamina effects.
- Vehicle garages with repair, fuel, engine and handling upgrades.
- Fuel stations.
- Three purchasable properties: coastal apartment, hill house and downtown safehouse.
- Business markers that stream visually around the player.
- Business interaction hint and E/touch interaction support.
- Economy state persistence using localStorage and the existing save system.
- Phase 6 business data manifest.

## Gameplay loop
SHOP/RESTAURANT/CLOTHES → enter interaction → browse → buy → inventory → use.
GARAGE → bring vehicle → repair/fuel/upgrade.
PROPERTY → interact → purchase → persistent ownership.

## Performance
Business markers are lightweight Three.js primitives and are hidden beyond a short visibility radius. No external backend is required.

## GitHub Pages
Deploy the repository root as before. Because this is an ES-module project, use a local HTTP server during development rather than opening index.html directly.

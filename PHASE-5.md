# Phase 5 — Real Vizag-Inspired World + Advanced Open-World Foundation

Phase 5 expands the Phase 4 prototype into a larger fictionalized/procedural Vizag-inspired world.

## Included

- 12 streamed world zones: RK Beach, Beach Road, Kailasagiri, MVP Colony, Maddilapalem, Siripuram, Dwaraka Nagar, NAD Junction, Gajuwaka, Rushikonda, Simhachalam and Port/Yarada.
- Zone-based visibility streaming. Nearby zones stay active; distant zones are hidden to reduce draw/update work.
- Zone-specific procedural architecture: residential, commercial, industrial, coastal, junction and hill districts.
- Fictional landmark hubs for beach promenade, market, Kailasagiri viewpoint, NAD transport hub and Gajuwaka industrial hub.
- Expanded road corridors and traffic lanes spanning the larger map.
- Updated map locations for Phase 5.
- Wider player and traffic bounds.
- Automatic graphics-quality detection plus Low/Medium/High renderer profiles.
- Corrected NPC data loading so Phase 4 NPC definitions are used.
- Mobile-friendly lower pixel ratio/shadow behavior on smaller devices.

## World-streaming model

`WorldStreaming.js` selects the nearest district to the player and evaluates every zone against a streaming radius. A zone has two practical levels:

- **High-detail range:** active nearby zone content.
- **Loaded range:** surrounding zone content remains available for seamless travel.
- **Far range:** zone group is hidden.

This is intentionally a lightweight browser implementation. It is a foundation for later GLB asset streaming, true chunk unloading, LOD meshes and texture streaming.

## Geography / licensing

The project does not ship Google Maps/Street View imagery or copied real buildings. The world geometry is original procedural game geometry using real place names as reference points. If external geographic datasets are added later, use appropriately licensed data and include the required attribution/license notices.

## GitHub Pages

The project remains static-host friendly. Deploy the repository root through GitHub Pages. A local static server is recommended for development because ES modules and `fetch()` need HTTP in many browsers.

# Geographic source

`natural-earth-110m.geojson` is Natural Earth's 1:110m Admin-0 country geometry,
downloaded 2026-09-11 from the project's
[official repository](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson).
Natural Earth data is [public domain](https://www.naturalearthdata.com/about/).
Boundaries follow the source's de facto convention; showing them is not an
endorsement of territorial claims. Country names, population reference years,
and label coordinates come from that file. Population estimates in this edition
are predominantly 2019, not a forecast for the game's fictional 2029–2036 years.

Run `node scripts/compile-world.cjs` to regenerate `js/world-geometry.js`.
It includes a SHA-256 of the exact source. Geometry and country markers use the
same equirectangular projection (85°N to 65°S); Antarctica is omitted. All game
assets are bundled for offline use. Military/economy/relationship scores are
fictional game balance values, not real-world rankings.

# Contributing

Thanks for helping make this map more accurate! The most valuable contributions are:

- **Accurate GPS pins** for projects currently marked approximate.
- **New launches** from Tier-1/1.5/2 developers.
- **Station / alignment corrections** for metro, K-RIDE, or the ring roads.
- **Price / possession updates** as projects progress.

## How to contribute

1. **Fork** this repository and create a branch (`fix/sobha-oakshire-gps`, `add/godrej-park-world`, …).
2. Metro/K-RIDE/road data lives in `data.js`, map behaviour in `app.js`, and markup in `index.html`. Property research inputs live in `audit/`; rebuild properties with `python scripts/build-property-audit.py` rather than editing generated `PROPS` rows alone.
3. Open a **pull request** describing the change and citing a source (developer page, RERA, Google Maps pin, DPR, news article).
4. A maintainer reviews and merges. Direct pushes to `main` are disabled.

## Data conventions

Each project is one object in the `PROPS` array:

```js
{
  name: 'Project Name',
  dev: 'Developer',                 // e.g. 'Sobha'
  type: 'villa',                    // 'villa' | 'apartment' | 'plot' | 'unknown'
  corr: 'North',                    // 'East' | 'North' | 'South' | 'Central' | 'West'
  area: 'Locality / landmark',
  lat: 13.0800, lng: 77.6600,       // decimal degrees
  min: 1.6, max: 4.0,               // price range in ₹ Crore
  status: 'uc',                     // 'uc' | 'ready' | 'mixed' | 'unknown'
  poss: 'Dec 2028',                 // possession/handover (RERA/builder target)
  config: '2/3/4 BHK apts',
  upcoming: true,                   // true => gold ★ ring (enter pre-completion)
  geo: 'approx'                     // 'approx' (locality-level) | 'verified' (real GPS)
}
```

### Accuracy rules

- Only set `geo: 'verified'` if you have a **real map pin** for the project entrance/site — not a guess.
- Keep prices in **₹ Crore** as a `min`/`max` range.
- Prefer official/RERA sources for `poss` dates; remember these commonly slip.
- Don't add marketing copy — keep entries factual.
- Unknown prices use `null`; unknown completion dates stay unknown. A passed target date is not evidence of completion. Keep phase-specific readiness separate.
- Include sources for identity, coordinates, stage and dates. A catalogue review date is not a quote date. Exact-name geocodes and project footprints are not verified gates.
- Put unresolved identities, conflicting/approximate locations and secondary-only leads in `audit/properties.json`; do not give them invented pins. See [audit methodology](audit/README.md).

## Transit / road data

Metro lines live in `METRO`, suburban rail in `KRIDE`, roads in `ROADS`, and PRR interchanges in `PRR_IC`. Each is a list of `[label, lat, lng]` station points or `[lat, lng]` path points. Cite a DPR or official source for alignment changes.

## Validation

After editing, open `index.html` in a browser and confirm it loads with no console errors and your marker appears where expected. Please attach a screenshot to your PR when it's a visual change.

Run `node tests/property-audit.test.cjs` and JavaScript syntax checks. Serve the folder over HTTP to use the catalogue page; its JSON fetches do not work through `file://` in every browser. The optional Playwright smoke test covers the catalogue and map interactions.

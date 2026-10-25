# Property catalogue review — 25 October 2026

The earlier review was a discovery pass, **not a completed individual-property audit**. This resumed pass rechecked public sources for all 63 builders in PR #3 and recovered names missed by initial-card pagination, dynamic pages and completed-project lists. It establishes omissions in the original map; it does **not** establish an exhaustive historical portfolio for any builder.

## Results

- 974 catalogue records: projects, phases, parent townships, unresolved leads and two excluded commercial names. This is not a count of distinct gated societies.
- 486 mapped records: 229 retained/corrected original records and 257 additional records with source-backed identity and project-level coordinates.
- 488 catalogue records remain outside the map. Coordinates are missing, approximate, conflicting, or insufficiently supported; some identities require primary-source confirmation.
- 56 of the 63 builders have additional candidate records beyond the original list. Counts include phases and older resale communities, not just current developer offerings.
- 90 source-check entries, including failures, limited/dynamic shells and supplemental page-data recovery. A successful HTTP response is not proof of catalogue completeness.

The original 276 map records are preserved in `legacy-properties.json`. `legacy-disposition.json` accounts for every original row. Compound names are split in the catalogue; their combined prices and pins are not transferred to unrelated parcels. The pre-existing K-RIDE alignment commit is preserved.

## What changed in the resumed research

The official Sumadhura page embeds 32 items while initially displaying only a few cards. The full embedded list was read and filtered by **Bengaluru** and **residential/plotted** product. Candeur's embedded city/type catalogue and Alpine's recent/completed arrays were also recovered. Hyderabad projects, logistics and offices were excluded from new residential admissions.

Additional names include Sumadhura Eden Garden and Silver Ripples, Candeur Rise and Sunshine, older Habitat communities, Tata New Haven and Promont, older SMR communities, Durga Waves/Coral/Rainbow/Saffron Square, and Keya's named upcoming projects. Detailed identity decisions are in `review-decisions.json`; older discovered candidates remain explicitly qualified in `properties.json`.

`builders.json` gives a result for every original builder, source URLs, original/catalogue/mapped counts, and specific limitations. Prestige, Godrej and several older builders still have partial historical coverage. Total Environment's official sites were blocked/dynamically empty; its public homes API returned 401, and no authentication was attempted. Secondary directories supplement discovery but do not certify identity, legal status or availability. Source failures are retained in `sources.json`.

## Admission and evidence rules

1. Preserve the discovered name and its source, even if it cannot be pinned. Do not invent a locality-centre coordinate to fill a blank.
2. New map records require a developer-catalogue identity and a separate usable project point. Exact-name OSM matches are **candidate project features**, not independently verified entrances or parcels. Approximate and conflicting pins are withheld.
3. Named inherited pins can remain with their inherited provenance displayed. Retention is not fresh verification. The original price, configuration, possession and ready/UC labels remain unverified except where an explicit correction is documented.
4. Unknown product, price, stage and possession stay unknown. New names do not default to under construction, a 2030 possession date, an apartment, or a 3 BHK configuration.
5. Commercial Adatto/Fait Pour, builder placeholders and unresolved marketing names remain outside the residential map. Plots and villas remain distinguishable from apartments. Phases may share a campus; duplicate aliases and parent/phase relationships still require further review.
6. Reported completion on a developer page is not a tower-specific OC or proof of current resale stock. Sold out is a sales state, not proof of completion. 2G Tula and Tata New Haven have mixed tower/phase stages.

Map records carry coordinate provenance, field-level review notes, field sources and review date. The review date is not a price-quote date. No fresh prices, 3 BHK availability claims or possession estimates were invented.

## Metro screening

Every usable, non-excluded catalogue point is compared with the nearest station on **each of all eight lines**, in both directions. `line_distances` stores kilometres using a Haversine calculation against `metro-snapshot.json`. Selecting a line and distance on `research.html` filters by these distances, not by builder reputation.

| Line | Catalogue records within 3 km aerial of a station |
|---|---:|
| Purple | 152 |
| Blue | 163 |
| Green | 80 |
| Pink | 66 |
| Yellow | 47 |
| Orange | 56 |
| Grey | 9 |
| Red | 125 |

There are 406 unique catalogue records in at least one of these bands; a record can appear against multiple lines. These counts include inherited and secondary candidate points, including some not admitted to the map. They are **screening counts**, not verified walkable societies or available homes. Buildings absent from the underlying builder catalogues are not covered merely because they lie along a line.

Popups separately show nearest operating, under-construction, Union-approved Phase 3 and other proposed stations. A closer proposal cannot hide an under-construction option. Station points and straight line segments are schematic. Actual gate-to-station entrances, railway/highway crossings, pavement, service frequency and transfers are unmeasured.

Approval sources: [Union Phase 3 approval](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2046081), [Blue ORR target reported 23 October 2026](https://indianexpress.com/article/cities/bangalore/bengaluru-metro-blue-line-trials-kr-puram-silk-board-10933185/). Phase 3A Union approval was not established. Unsupported “realistic” forecasts and delay percentages have been removed from the edited main context; neither construction nor approval guarantees an opening date. Older road/K-RIDE labels are inherited context, not newly audited forecasts.

## Open work

This is a public-catalogue coverage audit with an explicit unresolved queue. It is not a citywide census, a complete RERA/SPV crosswalk, or due diligence for every property. Remaining work includes historical/promoter-entity reconciliation, remaining source failures, alias/phase deduplication, exact parcel/gate verification, current 3 BHK stock and all-in quotes, tower OC/RERA documents, township scale and last-mile surroundings. User/forum reports need independent corroboration before becoming factual assertions.

## Rebuild and validation

Run from the repository root:

```sh
python scripts/build-property-audit.py
node tests/property-audit.test.cjs
node --check data.js
node --check app.js
node --check research.js
python -m http.server 8765
```

The build is offline and uses checked-in inputs. It deterministically regenerates the mapped `PROPS` array, per-line distances, builder counts, original-row dispositions and summary. Tests cover unknown dates/prices, overdue targets, mixed phases, null-last sorting, all four transit stages, provenance, exclusions, duplicates and coverage consistency.

An optional Playwright smoke test is in `tests/browser-smoke.cjs` (requires Playwright and Chromium, with the HTTP server on port 8765). Browser execution is subject to the environment; do not claim it passed without a successful run.

Validation for this prepared change: data/rule tests, syntax checks, whitespace checks and deterministic rebuild passed. `tests/dom-smoke.cjs` passed with JSDOM 30.1.3, Leaflet 1.9.4 and leaflet.markercluster 1.5.3: catalogue loading, builder/line/distance/search filters, withheld links, map initialization/deep-link, four-stage popup rendering, reset and unknown-status filtering. It uses real map libraries but does **not** verify layout, tiles, animation, walking routes or screenshots. Chromium installation failed because downloaded archives were empty/truncated, so the Playwright visual/browser smoke test was **not run successfully**.

For the optional DOM test, install `jsdom@30.1.3`, `leaflet@1.9.4` and `leaflet.markercluster@1.5.3` as development/test dependencies, then run `node tests/dom-smoke.cjs`. An external dependency directory can be selected with `AUDIT_TEST_MODULES`. The script starts its own local HTTP fixture and checks DOM behaviour; a browser is still needed for visual QA.

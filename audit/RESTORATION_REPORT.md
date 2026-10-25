# Complete PR #3 listing-removal audit

Compared the PR base `5dc75f0` (155 listings), the pre-expansion head `4ac2583` (276 listings), the published expanded map `1ad4d7e` (486 markers), and the corrected generated map. The two input lists contain 278 distinct builder/name pairs.

**All 278 original identities are accounted for.** All 276 pre-expansion listing names are represented again on the map, including saved aliases and one identical duplicate phase row. Of the 46 names absent from the published expansion, 44 markers are restored and two confirmed wrong-city entries remain excluded from the Bengaluru map.

Uncertain inherited points are restored with a dashed amber marker and review warning. Their original coordinates are retained for continuity, and metro-distance claims are withheld. Existing approximate points are distinct from newly sourced project points. No claim of a verified parcel, available home or safe walk is created by restoration.

## Every listing missing from the published expansion

| Builder | Earlier listing name | Resolution | Current map name |
|---|---|---|---|
| Prestige | Prestige Rosewood (Raintree Ph3) | Restored with explicit review warning | Prestige Rosewood (Raintree Ph3) |
| Puravankara | Purva Eminora | Restored with explicit review warning | Purva Eminora |
| Puravankara | Purva Aurum | Restored with explicit review warning | Purva Aurum |
| Sattva | Sattva City / Park Cubix | Restored with explicit review warning | Sattva City / Park Cubix |
| Total Environment | TE Pursuit of a Radical Rhapsody | Retained / restored, including aliases | Pursuit of a Radical Rhapsody |
| Total Environment | TE Windmills of Your Mind | Retained / restored, including aliases | Windmills of Your Mind |
| Total Environment | TE In That Quiet Earth | Retained / restored, including aliases | In That Quiet Earth |
| Total Environment | TE After The Rain | Retained / restored, including aliases | After The Rain |
| Total Environment | TE Down by the Water | Retained / restored, including aliases | Down by the Water |
| Total Environment | TE Tangled Up in Green | Retained / restored, including aliases | Tangled Up in Green |
| Total Environment | TE Magic Faraway Tree | Retained / restored, including aliases | Magic Faraway Tree |
| Assetz | Assetz 63 East / Leaves & Lives | Restored with explicit review warning | Assetz 63 East / Leaves & Lives |
| Bhartiya | Bhartiya City (Nikoo Homes) | Restored with explicit review warning | Bhartiya City (Nikoo Homes) |
| Karle | Karle Town Centre (Zenith) | Retained / restored, including aliases | Karle Zenith Residences |
| Phoenix | Phoenix One Bangalore West / Kessaku | Restored with explicit review warning | Phoenix One Bangalore West / Kessaku |
| L and T Realty | L&T Jakkur (Chokkanahalli Lake) | Restored with explicit review warning | L&T Jakkur (Chokkanahalli Lake) |
| Lodha | Lodha Fiorenza | Excluded wrong-city, retained in catalogue | Excluded; retained in catalogue |
| Tata Housing | Tata Carnatica (Varnam/Carnasa) | Restored with explicit review warning | Tata Carnatica (Varnam/Carnasa) |
| Adarsh | Adarsh Palm Retreat / Lakefront | Restored with explicit review warning | Adarsh Palm Retreat / Lakefront |
| Sumadhura | Sumadhura The Olympus | Excluded wrong-city, retained in catalogue | Excluded; retained in catalogue |
| Mana | Mana Dale / Capitol | Restored with explicit review warning | Mana Dale / Capitol |
| Goyal | Goyal Orchid | Restored with explicit review warning | Goyal Orchid |
| NCC Urban | NCC Urban (Aster Park) | Retained / restored, including aliases | NCC Aster Park |
| Arvind | Arvind Sylva / Orchards | Restored with explicit review warning | Arvind Sylva / Orchards |
| Reliaable | Reliaable Developers | Restored with explicit review warning | Reliaable Developers |
| Sizzle | Sizzle Properties | Restored with explicit review warning | Sizzle Properties |
| Embassy | Embassy Knowledge Park | Restored with explicit review warning | Embassy Knowledge Park |
| Lodha | Lodha Fiorana (Sadahalli) | Restored with explicit review warning | Lodha Fiorana (Sadahalli) |
| Alpine | Alpine Viva | Restored with explicit review warning | Alpine Viva |
| Bhartiya | Nikoo Homes 7 - Garden Estate | Restored with explicit review warning | Nikoo Homes 7 - Garden Estate |
| Bhartiya | Nikoo Homes 8 - Garden Enclave | Restored with explicit review warning | Nikoo Homes 8 - Garden Enclave |
| Bhartiya | Nikoo Homes 9 Alpine - Bhartiya Garden Hill | Restored with explicit review warning | Nikoo Homes 9 Alpine - Bhartiya Garden Hill |
| Bren | Bren Aspera | Restored with explicit review warning | Bren Aspera |
| Casagrand | Casagrand Lorenza | Restored with explicit review warning | Casagrand Lorenza |
| DNR | DNR Atmosphere | Restored with explicit review warning | DNR Atmosphere |
| Keya | Keya Around the Life | Restored with explicit review warning | Keya Around the Life |
| NCC Urban | NCC Ivory Heights | Retained / restored, including aliases | NCC Urban Ivory Heights |
| Prestige | Prestige Grove Hills | Restored with explicit review warning | Prestige Grove Hills |
| Prestige | Prestige Highland Hideaway | Restored with explicit review warning | Prestige Highland Hideaway |
| Prestige | Prestige Oakville | Restored with explicit review warning | Prestige Oakville |
| Pride | Pride Euphora | Restored with explicit review warning | Pride Euphora |
| Sumadhura | Sumadhura Solea | Restored with explicit review warning | Sumadhura Solea |
| Trifecta | Trifecta Bueno | Restored with explicit review warning | Trifecta Bueno |
| Trifecta | Trifecta Veranza | Restored with explicit review warning | Trifecta Veranza |
| Trifecta | Trifecta Verde en Resplandor | Restored with explicit review warning | Trifecta Verde en Resplandor |
| Trifecta | Trifecta Verdure | Restored with explicit review warning | Trifecta Verdure |

## Earlier field and point changes

The earlier PR commits changed fields on 31 names shared by the base and pre-expansion snapshots. These changes are separately recorded; they were not mistaken for removals. The full before/after values are in `changes_before_expansion` in [removal-audit.json](removal-audit.json).

| Earlier listing | Fields changed before the expansion |
|---|---|
| Prestige Park Grove (Residences) | lat, lng, geo |
| Prestige Lakeside Habitat | lat, lng, geo |
| Prestige Raintree Park | lat, lng, geo |
| Prestige Rosewood (Raintree Ph3) | lat, lng, geo |
| Prestige Golfshire | lat, lng, geo |
| Sobha Neopolis | lat, lng, geo |
| Sobha Dream Acres | lat, lng, geo |
| Sobha City (Athena) | lat, lng, geo |
| Brigade Cornerstone Utopia | lat, lng, geo |
| Brigade Sanctuary | lat, lng, geo |
| Brigade Orchards | lat, lng, geo |
| Brigade Valencia | lat, lng, geo |
| Godrej Woodscapes | lat, lng, geo |
| Purva Atmosphere | lat, lng, geo |
| Purva Eminora | lat, lng |
| Provident Sunworth | lat, lng, geo |
| Bhartiya City (Nikoo Homes) | lat, lng, geo |
| Birla Trimaya | lat, lng, geo |
| Birla Ojasvi | lat, lng, geo |
| Birla Evara | lat, lng, geo |
| Century Wintersun | lat, lng, area, geo |
| Adarsh Palm Retreat / Lakefront | lat, lng, geo |
| Adarsh Welkin Park | lat, lng, geo |
| Adarsh Savana | lat, lng, area, geo |
| Nambiar Bellezea | lat, lng, geo |
| Habitat Iluminar | area |
| Rohan Ekanta | area |
| Concorde Napa Valley | lat, lng, geo |
| Mana Dale / Capitol | lat, lng, geo |
| Goyal Orchid | lat, lng, geo |
| NCC Urban (Aster Park) | area |

## Confirmed wrong-city exceptions

- **Sumadhura The Olympus**: [developer identifies Hyderabad](https://sumadhuragroup.com/residential/hyderabad/the-olympus). Its earlier Bengaluru point was incorrect.
- **Lodha Fiorenza**: [developer identifies Goregaon, Mumbai](https://www.lodhagroup.com/projects/residential-property-in-goregaon/lodha-fiorenza/location). The separate inherited Sadahalli name, Lodha Fiorana, is restored as an unresolved legacy listing; no equivalence is assumed.

Both wrong-city names are searchable in the catalogue with an exclusion reason and source.

## Complete accounting and reproducibility

- [All 278 original identities and outcomes](removal-audit.json)
- [All 276 pre-expansion rows](legacy-properties.json) and [their current dispositions](legacy-disposition.json)
- [Original PR base: 155 rows](pr-base-properties.json)
- [Published pre-restoration map snapshot](pre-restoration-map.json)
- [Current counts](summary.json)

Rebuild with `python scripts/build-property-audit.py`. Regression tests require every pre-expansion name to resolve to a current map record, and every original-base identity to be mapped or have a sourced wrong-city exclusion. Searches accept the original aliases.

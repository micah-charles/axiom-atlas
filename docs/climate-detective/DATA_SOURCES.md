# Climate Detective data sources

## Source strategy

The vertical slice uses downloaded, version-stamped static inputs so the hosted game does not depend on a live API call. The ingestion script preserves the source URLs and retrieval timestamp in the generated dataset. A build-time source refresh is explicit and reproducible.

## Selected sources

| Provider | Dataset | Access | Licence / use | Resolution and coverage | Variables used |
| --- | --- | --- | --- | --- | --- |
| NASA POWER / NASA GMAO | POWER Daily API | `https://power.larc.nasa.gov/api/temporal/daily/point` | Public API; retain NASA POWER attribution | 0.5° × 0.625° meteorological native grid; daily UTC/LST data from 1981 to near real time | `T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`, `PS`, `WS10M`, `WD10M` |
| NASA POWER / NASA GMAO | POWER Monthly API | `https://power.larc.nasa.gov/api/temporal/monthly/point` | Public API; retain NASA POWER attribution | Same meteorological source; monthly and annual summaries from 1981 onward | monthly candidate-year comparison and annual context |
| NASA POWER / NASA GMAO | POWER Climatology API | `https://power.larc.nasa.gov/api/temporal/climatology/point` | Public API; retain NASA POWER attribution | Pre-computed 20-year meteorological climatology, January 2001–December 2020 | monthly normals used for anomaly display |
| NOAA NCEI | Daily Optimum Interpolation Sea Surface Temperature v2.1 | NOAA ERDDAP `SST_OI_DAILY_1981_PRESENT_ML` | NOAA public data; cite DOI / product page | 0.25° global daily SST, 1981–present | North Atlantic SST at a published grid point |
| Natural Earth | 1:110m cultural/admin country boundaries | `https://github.com/nvkelso/natural-earth-vector` | Public domain | global simplified boundaries | map geometry only |

## Why not use live ERA5 in the first build?

ERA5 is the preferred future regional atmospheric source because it supplies pressure, wind, temperature, precipitation, radiation and SST in a consistent reanalysis. The CDS download path requires account-backed access in this environment, so the first slice uses NASA POWER plus NOAA OISST with explicit source labels. ERA5 remains an upgrade path for a later version, not a reason to block the playable slice.

## Mission 01 pressure field

Mission 01 uses the NASA POWER Daily Regional endpoint for `PS` (surface
pressure) over eight adjacent tiles covering 20°W–12°E and 45°N–64°N for
2018-01-14 through 2018-01-16. Each tile stays within the API's 10-degree
bounding-box limit. The generated field contains 2,028 points per date at the
native 0.5° latitude × 0.625° longitude grid and records the local surface
elevation returned with the feature geometry.

`PS` is pressure at the local surface, not reduced sea-level pressure. Terrain
can therefore produce low values over high ground. The game labels the layer
`SURFACE PRESSURE · NASA POWER PS`, filters the derived centre search to the
low-elevation investigation sector, and does not present the contours as a
synoptic sea-level-pressure chart. Contour segments and the L/H markers are
deterministic derivatives of the stored field; they are not hand-authored
decorations.

The field ingestion records the official [NASA POWER Daily API documentation](https://power.larc.nasa.gov/docs/services/api/temporal/daily/)
alongside the source endpoint and retrieval timestamp.

## Historical year selection

Candidate years are compared from the same NASA POWER location and normal baseline. The comparison rewards a strong, interpretable temperature transition, a pressure/wind/rain event suitable for prediction, and a warm anomaly that can be taught without attributing one weather event to climate change. The Met Office's official 2018 summary documents the cold spell, warm summer and Atlantic events that make 2018 a strong candidate; the generated report is the quantitative gate.

## Attribution shown in-game

The source drawer will state:

- “NASA POWER daily meteorology — derived from MERRA-2 / POWER; values are gridded analysis, not a local station forecast.”
- “NOAA OISST v2.1 — daily 0.25° sea-surface-temperature analysis.”
- “Natural Earth 1:110m — map boundaries, public domain.”

The game will not present derived teaching quantities as observed measurements.

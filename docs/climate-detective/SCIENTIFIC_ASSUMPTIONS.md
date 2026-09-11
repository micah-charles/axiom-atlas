# Climate Detective scientific assumptions

## Evidence categories

- **Observed / analysis data:** downloaded NASA POWER meteorological values and NOAA OISST values. The UI labels NASA POWER as gridded analysis/reanalysis-derived data rather than a local station observation.
- **Climatology:** NASA POWER's documented pre-computed 20-year climatology, January 2001–December 2020. This is not silently described as the Met Office 1991–2020 normal.
- **Derived values:** anomalies, rolling changes, wind compass labels, event detection scores, day length and solar-angle calculations.
- **Teaching model:** simplified air-mass arrows and seasonal geometry. These are explanatory overlays and never presented as measured atmospheric streamlines.

Mission 01's pressure contours are derived from NASA POWER `PS`, which is
surface pressure from a gridded MERRA-2 analysis. They are intentionally
labelled as surface-pressure contours rather than sea-level isobars. The
low/high markers are deterministic extrema over the bounded, low-elevation
North Atlantic / British Isles search area. This preserves the evidence
relationship without implying that a local surface-pressure field is an
operational synoptic chart.

## Units and conventions

- temperature: °C;
- precipitation: mm/day;
- surface pressure: kPa from POWER, displayed as hPa only after an explicit ×10 conversion;
- wind speed: m/s;
- wind direction: degrees clockwise from true north, interpreted as the direction the wind comes from;
- SST: °C from NOAA OISST;
- dates: API requests use UTC; the daily POWER endpoint is requested with `time-standard=UTC` so the date key is not silently shifted by browser locale.

## Anomalies

`anomaly = actual daily temperature − monthly climatology temperature`.

The anomaly is a teaching comparison, not a claim about anthropogenic climate change. One weather event is not automatically attributed to climate change.

## Event detection

Events use deterministic thresholds against downloaded values:

- cold snap: multi-day temperature fall plus easterly/northerly wind evidence;
- depression: pressure fall plus precipitation and wind evidence;
- warm anomaly: actual temperature above the monthly normal by a defined threshold.

If a candidate year does not contain a clean event meeting the thresholds, the pipeline must report that rather than invent one.

## Missing values

NASA POWER fill value `-999` is rejected during ingestion. Scientifically important gaps are not interpolated silently. A candidate fails validation if a mission window lacks required inputs.

## Spatial simplification

The game samples a small number of fixed points from the source grid. It is not a high-resolution forecast and should not be used for operational decisions. Country boundaries come from Natural Earth, not generated artwork.

## Seasonal geometry

Solar angle, approximate daylight and axial-tilt explanations are deterministic teaching calculations from latitude and calendar date. They are shown as modelled context, not as satellite measurements.

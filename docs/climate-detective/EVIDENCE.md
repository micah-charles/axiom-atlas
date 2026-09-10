# Climate Detective evidence ledger

## Automated evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Climate data generation | pass | `app/games/climate-detective/data/year-2018.json` and `candidate-year-report.json` |
| Candidate-year comparison | pass | `docs/climate-detective/CANDIDATE_YEAR_REPORT.md` |
| Core tests | pass | `npm test` — 152 tests passed |
| Lint | pass | `npm run lint` |
| Production build | pass | `npm test` build stage; Vinext build completed |
| Rendered HTML smoke tests | pass | `npm test` — 2 tests passed |

## Data evidence

- NASA POWER daily and climatology inputs are recorded in `DATA_SOURCES.md` and embedded in the generated dataset.
- NOAA NCEI OISST v2.1 supplies three North Atlantic SST event samples.
- Natural Earth 1:110m supplies the geographic boundaries in `data/natural-earth-uk-europe.json`.
- Selected year: 2018, chosen by a transparent event-selection heuristic after comparing 2010, 2013, 2018 and 2022.

## Manual evidence still required

- Sites sandbox desktop pass at a normal desktop viewport.
- Sites sandbox mobile pass around 390 × 844.
- Fresh-player pass through Observe → Investigate → Explain → Predict → Reveal.
- Screenshot paths for the first mission, reveal state and final assessment.

Until those checks are recorded, implemented missions remain `🟦 IMPLEMENTED / NEEDS QA`; they are not marked verified.

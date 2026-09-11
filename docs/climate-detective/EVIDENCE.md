# Climate Detective evidence ledger

## Automated evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Climate data generation | pass | `app/games/climate-detective/data/year-2018.json` and `candidate-year-report.json` |
| Candidate-year comparison | pass | `docs/climate-detective/CANDIDATE_YEAR_REPORT.md` |
| Core tests | pass | `npm test` — 155 tests passed |
| Lint | pass | `npm run lint` |
| Production build | pass | `npm test` build stage; Vinext build completed |
| Rendered HTML smoke tests | pass | `npm test` — 2 tests passed |

## Data evidence

- NASA POWER daily and climatology inputs are recorded in `DATA_SOURCES.md` and embedded in the generated dataset.
- NOAA NCEI OISST v2.1 supplies three North Atlantic SST event samples.
- Natural Earth 1:110m supplies the geographic boundaries in `data/natural-earth-uk-europe.json`.
- Selected year: 2018, chosen by a transparent event-selection heuristic after comparing 2010, 2013, 2018 and 2022.

## Mission 01 recovery evidence

- Local fresh-player browser flow passed at `http://localhost:3001/` on 2026-09-11.
- Guided map sequence passed: Pressure low centre → London wind → London rainfall.
- Deliberate wrong causal link produced `ORDER CHECK`; removing it allowed the five-link chain to be rebuilt.
- Complete chain with a blank note remained locked with visible chain/note/concept reasons.
- Valid field note unlocked forecast; Run +24 hours revealed 16 Jan 2018 and scored 11/14 in the tested pass.
- Browser console errors after the flow: none.
- The same recovery flow passed against the deployed private Site version 110; the reveal showed 16 Jan 2018 and scored 13/14 with an exact next-day forecast.
- The published year then completed Mission 02, Mission 03, and the end-of-year assessment; live browser console errors remained at zero.
- Desktop visual capture: CUA inline capture, 1280×900 viewport, 2026-09-11 (reveal state).
- Mobile visual capture: CUA inline capture, 390×844 viewport, 2026-09-11 (Mission 01 Pressure / Task 1 state).
- Wrong evidence smoke: selecting the H target produces a visible task-specific correction; the H is not pinned.
- Excessive evidence smoke: repeated selection of the L target remains deduplicated at 1/3 notebook clues.
- Hint smoke: the hint is visible and the deterministic scoring test confirms the efficiency reduction.
- Restart/reload smoke: Restart year returns to 1 Jan with empty progress; reload returns safely to the Atlas entry surface.
- Keyboard smoke: Tab reaches the instrument controls and Enter activates a focused map target; the target is exposed as an accessible button.

## Persistent visual evidence

- Capture harness: `scripts/climate-detective/capture-recovery-evidence.cjs`.
- Desktop Pressure layer: `evidence/mission-01-pressure-desktop.png`.
- Desktop Wind layer: `evidence/mission-01-wind-desktop.png`.
- Desktop Rainfall layer: `evidence/mission-01-rainfall-desktop.png`.
- Incomplete Explain state: `evidence/mission-01-explain-incomplete-desktop.png`.
- Locked Forecast: `evidence/mission-01-forecast-locked-desktop.png`.
- Unlocked Forecast: `evidence/mission-01-forecast-unlocked-desktop.png`.
- Prediction: `evidence/mission-01-prediction-desktop.png`.
- Historical Reveal: `evidence/mission-01-reveal-desktop.png`.
- Mobile 390 × 844 Pressure state: `evidence/mission-01-pressure-mobile.png`.
- End-of-year assessment: `evidence/year-end-assessment-desktop.png`.
- Browser console ledger: `evidence/browser-console.json` (`errors: []`).

All Mission 01 recovery evidence requirements are now recorded. M25 can be
marked `✅ VERIFIED`; M23/M24 remain separately tracked until their broader
release gates are completed.

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
| M26.1 rendered pointer/touch regression | pass | `verify-m26-1-pointer.cjs` — 10/10 checks passed |

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

## M26 investigation gameplay and scientific visualisation V2

Status: VERIFIED — Gameplay E2E / Fresh-player gate PASSES

- Deployed fresh-player replay on 2026-09-12 against Site version 114 reproduced the user-visible failure: after Pressure activation, real pointer clicks on the visible L, H, London and a nearby contour left `0/3 clues pinned` with no feedback.
- Deployed DOM inspection found the visible SVG L around `(560,364)` and the transparent fallback low button around `(442,354)` at the same viewport; the fallback did not cover the visible marker. The parent SVG also captured every pointer for panning.
- Previous E2E was a false positive for this failure class because it selected `.climate-map-target.low/.high` by selector and only asserted `errors: []`; it did not click the visible SVG marker with pointer coordinates.
- M26.1 repaired the root cause: interactive SVG descendants stop pan capture, rendered feature groups own their hit areas, and the legacy HTML map-target overlay is removed.

- Local fresh-player V2 browser run passed on 2026-09-12 against `http://localhost:3001/`; browser console ledger reports `errors: []`.
- Task 1 begins with an investigation objective rather than naming the L; the deterministic hint ladder was verified in order: compare values → follow decreasing values → look west → L marker.
- Pressure source check passed: 2,028 points on 15 Jan 2018, NASA POWER `PS`, MERRA-2 analysis, kPa source values displayed as hPa after explicit conversion. The game continues to label this as surface-pressure data, not sea-level pressure.
- Contour check passed: levels are generated from the focused Britain / North Atlantic low-elevation field at a 4 hPa interval; labels are derived from actual marching-squares segments. The tested level sequence is 96.4–101.6 kPa in 0.4 kPa steps.
- Duplicate-marker check passed: the rendered SVG contains exactly one L and one H centre; the legacy HTML target overlay is absent, so there is one rendered target per feature.
- Post-selection check passed: the selected L emits explicit `Pressure decreases toward 963 hPa` feedback and highlights the nearby derived contours only after the correct discovery.
- Map recovery check passed: a wrong H remains unpinned; wrong Aberdeen selections in Wind and Rainfall show task-specific recovery messages before London pins the correct clues.
- Rendered-pointer regression passed locally 10/10: L circle, L text, 963 hPa label, marker edge, H, London, contour, keyboard, mobile pointer and mobile touch.
- No-hint Mission 01 path passed: 11/14, complete causal chain, field note, forecast, +24-hour historical reveal. The full local year reached 3/3 cases and the end-of-year weather report with 31 points.
- Reveal-state check passed after clearing the selected pressure centre before changing dates: the 16 Jan 2018 actual field shows its own contours and H/L markers without stale selected contours from 15 Jan.
- Desktop and mobile visual inspection passed for the fresh objective, Pressure OFF/ON, Hint 4, selected low, clues complete, Wind, Rainfall, Explain incomplete/feedback, Forecast, Prediction, Reveal, and 390 × 844 Pressure tutorial states.
- Final deployed Chrome replay passed against Site version 116: L circle, H, London, contour, visible Wind/Rain targets, wrong-order recovery, field note, forecast and historical reveal; final result was 12/14 with actual 16 Jan 2018 data.
- App source checkpoint `ffdda035fe8aa3c8afde34871f4e1bc3dab42241` was published as private Site version 114; deployment `appgdep_6aa53d31c3308191a9934757577e4fd5` succeeded at `https://the-axiom-atlas.ckstks246335.chatgpt.site`.
- Exact verified commit `b115812063c78d435defd043037df837574683f6` was published as private Site version 112; deployment `succeeded`, production URL remained `https://the-axiom-atlas.ckstks246335.chatgpt.site`, and owner-only custom access remained one allowed user with no groups.
- Final app commit `a2716f522291005deedae24d50faa679d04ee184` was published as private Site version 116; deployment `appgdep_6aa586a993588191bcb11c64978c6a22` succeeded, production URL remained `https://the-axiom-atlas.ckstks246335.chatgpt.site`, and owner-only custom access remained one allowed user with no groups.

## Persistent visual evidence

- Capture harness: `scripts/climate-detective/capture-recovery-evidence.cjs`.
- Rendered-pointer harness: `scripts/climate-detective/verify-m26-1-pointer.cjs`; pointer coordinates are derived from visible SVG geometry and application handlers are never invoked directly.
- Desktop Pressure layer: `evidence/mission-01-pressure-desktop.png`.
- Fresh-player objective: `evidence/mission-01-fresh-player-objective-desktop.png`.
- Pressure OFF: `evidence/mission-01-pressure-off-desktop.png`.
- Pressure ON with tutorial, labels and derived contour legend: `evidence/mission-01-pressure-on-desktop.png`.
- Task 1 Hint 4: `evidence/mission-01-task1-hint4-desktop.png`.
- Selected low-pressure centre and highlighted contours: `evidence/mission-01-pressure-low-selected-desktop.png`.
- All three clues pinned: `evidence/mission-01-clues-complete-desktop.png`.
- Desktop Wind layer: `evidence/mission-01-wind-desktop.png`.
- Desktop Rainfall layer: `evidence/mission-01-rainfall-desktop.png`.
- Incomplete Explain state: `evidence/mission-01-explain-incomplete-desktop.png`.
- Explain order feedback: `evidence/mission-01-explain-feedback-desktop.png`.
- Locked Forecast: `evidence/mission-01-forecast-locked-desktop.png`.
- Unlocked Forecast: `evidence/mission-01-forecast-unlocked-desktop.png`.
- Prediction: `evidence/mission-01-prediction-desktop.png`.
- Historical Reveal: `evidence/mission-01-reveal-desktop.png`.
- Mobile 390 × 844 Pressure state: `evidence/mission-01-pressure-mobile.png`.
- End-of-year assessment: `evidence/year-end-assessment-desktop.png`.
- Browser console ledger: `evidence/browser-console.json` (`errors: []`).

Mission 01 recovery evidence remains recorded. M25 is `✅ VERIFIED`; M26 and
M26.1 are `✅ VERIFIED` after the final deployed replay. The broader M24 release
gate and future mission expansion remain separately tracked and intentionally
frozen.

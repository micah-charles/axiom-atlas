# Climate Detective Progress

Last updated: 2026-09-12
Current milestone: M26 Investigation Gameplay & Scientific Visualisation V2 — IN PROGRESS
Current blocker: None
Next action: publish the exact verified commit to the existing private Site, then run the final deployed M26 smoke check

## Mission status

- M00 Repository discovery ✅
- M01 Data research ✅
- M02 Data pipeline ✅
- M03 Map 🟦
- M04 Time engine 🟦
- M05 Seasonal Earth system 🟦
- M06 Climate layers 🟦
- M07 Core game loop 🟦
- M08 Investigation events 🟦
- M09 Causal chain builder 🟦
- M10 Written answers 🟦
- M11 Forecast mechanic 🟦
- M12 Scoring 🟦
- M13 Investigation efficiency 🟦
- M14 Normal vs actual 🟦
- M15 Weather report 🟦
- M16 Knowledge coverage 🟨
- M17 Microclimate ⬜
- M18 Mystery year ⬜
- M19 Game feel ⬜
- M20 Mobile ⬜
- M21 Scientific QA 🟨
- M22 Gameplay QA ⬜
- M23 Evidence 🟨
- M24 Vertical-slice gate 🟨
- M25 Mission 01 gameplay recovery ✅
- M26 Investigation gameplay & scientific visualisation V2 🟨 (local QA passed; deployment gate pending)

## Current work

The vertical slice lives in `app/games/climate-detective/` and launches as a separate Climate Detective surface from the Atlas map. Existing 15-world registry and advanced-world infrastructure remain unchanged. M25 Mission 01 recovery is verified. M26 is now focused on removing answer-following and teaching pressure-map interpretation through the same three-task structure. Mission 02 expansion remains frozen.

## Completed since last checkpoint

- Inspected package scripts, Vinext/Vite build, React entry point, existing game engines, world registry, tests, CSS and Sites manifest.
- Chosen 2018 after the data-selection report and official Met Office cross-check.
- Researched NASA POWER for daily/monthly meteorological data and NOAA OISST for North Atlantic SST.
- Created the master implementation plan and granular mission checklist.
- Compared 2010, 2013, 2018 and 2022 with the reproducible candidate-year heuristic; 2018 scored highest.
- Generated 365 daily rows for five UK locations, monthly normals/anomalies, three mission event records and three NOAA OISST samples.
- Added the real Natural Earth map, date-indexed clock, evidence instruments, causal chain, deterministic written-answer evaluator, forecast reveal and multi-dimensional scoring.
- Added climate-specific tests and completed lint, build and rendered HTML smoke checks.
- Reproduced and repaired the Mission 01 forecast lock with exact visible reasons.
- Added a NASA POWER regional surface-pressure field, deterministic contours and L/H centres, without decorative isobars.
- Replaced passive Mission 01 evidence browsing with sequential Pressure → Wind → Rainfall map tasks.
- Added strong/supporting notebook evidence, FROM/TO wind convention, causal-chain recovery, hint accounting and field-note validation.
- Completed a fresh-player local browser pass including deliberate wrong-link recovery, blank-note lock, valid-note unlock and historical reveal.
- Completed the same Mission 01 recovery flow against the deployed private Site version 110; console errors were absent and the reveal scored 13/14 with an exact next-day forecast.
- Continued the published 2018 year through Mission 02, Mission 03, and the end-of-year weather report; the final assessment showed 3/3 cases solved and 33 field points.
- Added deterministic coverage for wrong evidence, deduplicated excessive evidence, and hint efficiency scoring.
- Added a reproducible isolated browser capture harness and persistent visual evidence for the recovery states and year-end assessment.
- Fixed the final assessment banner so the end-of-year report is not mislabeled as the previous mission.
- Read the M26 V2 mission and added its granular implementation checklist before code changes.
- Verified that the visible duplicate `L/H` markers come from one SVG centre plus one HTML hit-target overlay; the data engine itself returns one low and one high centre.
- Verified that the stored 15 Jan 2018 pressure field contains 2,028 NASA POWER `PS` points and that the displayed 963 hPa / 1018 hPa values are derived from the field, not authored display values.
- Removed the duplicate visible pressure markers while retaining transparent keyboard/touch hit targets.
- Added field-derived 4 hPa contour levels and representative labels, plus post-discovery contour highlighting and a surface-pressure reading tutorial.
- Replaced answer-following Task 1 copy with a progressive no-hint → Hint 4 ladder.
- Completed fresh-player browser and visual QA: wrong H, four pressure hints, correct L, wrong Wind point, correct London wind, wrong Rainfall point, correct London rainfall, causal-order repair, blank-note lock, forecast and historical reveal.
- Confirmed the no-hint Mission 01 path scores 11/14; the full local year reaches 3/3 cases, the end assessment, and 31 points with zero browser console errors.

## Tests

- `npm test`: 155 tests passed, including Climate Detective data/rules, recovery-lock, and wrong/excessive/hint scoring tests.
- `npm run lint`: passed.
- `npm test` build stage: Vinext build completed; only a non-fatal >500 kB chunk warning remains.
- `npm test` rendered HTML stage: 2 tests passed.

## Evidence

- Official source notes: `docs/climate-detective/DATA_SOURCES.md`
- Scientific decisions: `docs/climate-detective/SCIENTIFIC_ASSUMPTIONS.md`
- Gameplay brief: `docs/climate-detective/GAME_DESIGN.md`
- Candidate-year decision: `docs/climate-detective/CANDIDATE_YEAR_REPORT.md`
- Evidence ledger: `docs/climate-detective/EVIDENCE.md`
- Generated dataset: `app/games/climate-detective/data/year-2018.json`
- Recovery contract and acceptance checklist: `docs/climate-detective/GAMEPLAY_RECOVERY.md`
- Local browser captures: CUA inline desktop 1280×900 reveal and mobile 390×844 Task 1 pressure state, both 2026-09-11.
- Deployed Site: `https://the-axiom-atlas.ckstks246335.chatgpt.site` — version 110, full recovery flow passed 2026-09-11.
- Additional browser smoke: wrong H target feedback, duplicate clue deduplication, hint, Restart, reload, and keyboard map-target activation, 2026-09-11.
- Persistent screenshot set: `docs/climate-detective/evidence/` (10 PNGs plus `browser-console.json`; local capture flow completed with `errors: []`).
- M26 baseline evidence: source/data inspection completed; implementation and V2 playtest remain in progress.
- M26 V2 evidence: `docs/climate-detective/evidence/` now contains fresh objective, pressure OFF/ON, Hint 4, selected-low, Wind, Rainfall, Explain, Forecast, Reveal, mobile and year-end screenshots; `browser-console.json` records `errors: []`.

## Known problems

- The current atmospheric data is NASA POWER/MERRA-2 gridded analysis rather than a station observation or operational forecast; the UI labels this explicitly.
- ERA5 is deferred because the CDS download path requires account-backed access in this environment.
- M26 local gates pass; final deployed Site verification is still outstanding.

## Decisions needed

- None at this checkpoint. A decision gate will be raised only if authoritative data or licensing materially conflict.

## Next three actions

1. Publish the exact verified source commit to the existing private Site.
2. Run the deployed M26 smoke check and compare it with the local evidence.
3. Mark M26 verified only if the deployed evidence and console checks also pass.

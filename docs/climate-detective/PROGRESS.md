# Climate Detective Progress

Last updated: 2026-09-12
Current milestone: M26 Investigation Gameplay & Scientific Visualisation V2 — VERIFIED and published
Current blocker: None
Next action: keep Mission 02 expansion frozen and use the verified M26 slice for game-director review before planning the next milestone

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
- M26 Investigation gameplay & scientific visualisation V2 ✅

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
- Fixed the Reveal transition so the selected pressure centre is cleared before the map advances to 16 Jan 2018; the actual next-day field now displays without stale selected contours from 15 Jan.
- Replayed the complete M26 browser capture after the Reveal fix: 17 persistent PNGs, desktop/mobile states, full-year assessment, and `browser-console.json` with `errors: []`; source checkpoint is `739fe84d06fcf3dc6672f1c0175620e59ebd5989`.
- Published the exact verified commit `b115812063c78d435defd043037df837574683f6` to the existing private Site as version 112; deployment status succeeded and the live URL remained `https://the-axiom-atlas.ckstks246335.chatgpt.site`.

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
- Local browser captures: desktop fresh-player/V2 flow and mobile 390×844 Task 1 pressure state, 2026-09-12.
- Deployed Site: `https://the-axiom-atlas.ckstks246335.chatgpt.site` — version 112, exact commit `b115812063c78d435defd043037df837574683f6`, deployment succeeded 2026-09-12; owner-only custom access preserved.
- Additional browser smoke: wrong H target feedback, duplicate clue deduplication, hint, Restart, reload, and keyboard map-target activation, 2026-09-11.
- Persistent screenshot set: `docs/climate-detective/evidence/` (17 PNGs plus `browser-console.json`; latest local capture completed with `errors: []`).
- M26 V2 evidence: `docs/climate-detective/evidence/` contains fresh objective, Pressure OFF/ON, Hint 4, selected-low, clues-complete, Wind, Rainfall, Explain incomplete/feedback, Forecast locked/unlocked, Prediction, Reveal, mobile and year-end screenshots; `browser-console.json` records `errors: []`.
- App source checkpoint `ffdda035fe8aa3c8afde34871f4e1bc3dab42241` was published as private Site version 114; deployment succeeded at `https://the-axiom-atlas.ckstks246335.chatgpt.site`.

## Known problems

- The current atmospheric data is NASA POWER/MERRA-2 gridded analysis rather than a station observation or operational forecast; the UI labels this explicitly.
- ERA5 is deferred because the CDS download path requires account-backed access in this environment.
- M26 local and deployed gates pass. The broader M24 release gate and curriculum coverage remain separately tracked.

## Decisions needed

- None at this checkpoint. A decision gate will be raised only if authoritative data or licensing materially conflict.

## Next three actions

1. Keep Mission 02 expansion frozen after the M07/M26 stop-and-reassess gate.
2. Use the evidence ledger for game-director/geography QA review.
3. Plan the next milestone only after the core loop remains legible in review.

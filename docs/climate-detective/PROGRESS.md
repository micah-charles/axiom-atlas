# Climate Detective Progress

Last updated: 2026-09-11
Current milestone: M25 Mission 01 gameplay recovery — VERIFIED
Current blocker: None
Next action: keep Mission 02 expansion frozen; reassess the broader M24 release gate before starting new mission work

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

## Current work

The vertical slice lives in `app/games/climate-detective/` and launches as a separate Climate Detective surface from the Atlas map. Existing 15-world registry and advanced-world infrastructure remain unchanged. M25 Mission 01 recovery is verified: the player discovers the first mystery through three map tasks, a field notebook, a repairable causal chain, a required field note, and a forecast/reveal. Mission 02 expansion remains frozen while the broader M24 release gate is reviewed.

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

## Known problems

- The current atmospheric data is NASA POWER/MERRA-2 gridded analysis rather than a station observation or operational forecast; the UI labels this explicitly.
- ERA5 is deferred because the CDS download path requires account-backed access in this environment.

## Decisions needed

- None at this checkpoint. A decision gate will be raised only if authoritative data or licensing materially conflict.

## Next three actions

1. Reassess the broader M24 vertical-slice gate against the deployed Site, if required.
2. Decide whether to begin Mission 02 only after that gate review.
3. Preserve the current data provenance and recovery evidence as the baseline.

# Climate Detective Progress

Last updated: 2026-09-11
Current milestone: M25 Mission 01 gameplay recovery — local + deployed QA passed; persistent screenshot evidence pending
Current blocker: None
Next action: capture persistent screenshot files for the recovered Mission 01 states, then reassess the M25 verification gate

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
- M25 Mission 01 gameplay recovery 🟦

## Current work

The vertical slice lives in `app/games/climate-detective/` and launches as a separate Climate Detective surface from the Atlas map. Existing 15-world registry and advanced-world infrastructure remain unchanged. Expansion is frozen at Mission 01 recovery: the player now discovers the first mystery through three map tasks, a field notebook, a repairable causal chain, a required field note, and a forecast/reveal. Local and deployed fresh-player QA passed; persistent screenshot artifacts remain open.

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
- Completed the same Mission 01 recovery flow against the deployed private Site version 109; console errors were absent and the reveal scored 11/14.

## Tests

- `npm test`: 154 tests passed, including Climate Detective data/rules and recovery-lock tests.
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
- Deployed Site: `https://the-axiom-atlas.ckstks246335.chatgpt.site` — version 109, recovery flow passed 2026-09-11.

## Known problems

- Persistent screenshot files have not yet been produced; local CUA captures are recorded inline in the task evidence.
- The current atmospheric data is NASA POWER/MERRA-2 gridded analysis rather than a station observation or operational forecast; the UI labels this explicitly.
- ERA5 is deferred because the CDS download path requires account-backed access in this environment.

## Decisions needed

- None at this checkpoint. A decision gate will be raised only if authoritative data or licensing materially conflict.

## Next three actions

1. Capture persistent desktop and mobile evidence for the recovered Mission 01 states.
2. Record the screenshot paths in `EVIDENCE.md` and `PROGRESS.md`.
3. Reassess M25 and the vertical-slice gate; keep expansion frozen unless both pass.

# Climate Detective Progress

Last updated: 2026-09-10
Current milestone: M07–M15 implemented; Stop-and-Reassess / Sites QA pending
Current blocker: None
Next action: preview the playable slice in the existing private Sites project and record manual evidence

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

## Current work

The vertical slice lives in `app/games/climate-detective/` and launches as a separate Climate Detective surface from the Atlas map. Existing 15-world registry and advanced-world infrastructure remain unchanged. The player can now investigate three 2018 data-backed events and reach the end-of-year assessment; the remaining gate is fresh-player visual/gameplay QA in Sites.

## Completed since last checkpoint

- Inspected package scripts, Vinext/Vite build, React entry point, existing game engines, world registry, tests, CSS and Sites manifest.
- Chosen 2018 after the data-selection report and official Met Office cross-check.
- Researched NASA POWER for daily/monthly meteorological data and NOAA OISST for North Atlantic SST.
- Created the master implementation plan and granular mission checklist.
- Compared 2010, 2013, 2018 and 2022 with the reproducible candidate-year heuristic; 2018 scored highest.
- Generated 365 daily rows for five UK locations, monthly normals/anomalies, three mission event records and three NOAA OISST samples.
- Added the real Natural Earth map, date-indexed clock, evidence instruments, causal chain, deterministic written-answer evaluator, forecast reveal and multi-dimensional scoring.
- Added climate-specific tests and completed lint, build and rendered HTML smoke checks.

## Tests

- `npm test`: 152 tests passed, including Climate Detective data/rules tests.
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

## Known problems

- M03–M15 are implemented but not manually verified in a fresh player session.
- No desktop/mobile screenshot evidence has been captured yet.
- The current atmospheric data is NASA POWER/MERRA-2 gridded analysis rather than a station observation or operational forecast; the UI labels this explicitly.
- ERA5 is deferred because the CDS download path requires account-backed access in this environment.

## Decisions needed

- None at this checkpoint. A decision gate will be raised only if authoritative data or licensing materially conflict.

## Next three actions

1. Start the local Vinext preview and hand it to the Sites sandbox.
2. Run a fresh-player desktop pass through the first investigation and reveal.
3. Run the mobile pass around 390 × 844, capture evidence, then decide whether the slice is a game or still dashboard-like before expanding.

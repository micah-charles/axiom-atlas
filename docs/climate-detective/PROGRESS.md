# Climate Detective Progress

Last updated: 2026-09-12
Current milestone: M28 Global Atmospheric Circulation Interactive Reference — IN PROGRESS
Current blocker: none; Mission 01 and M27 remain protected baselines
Next action: implement the global-to-local teaching surface, then replay it as a fresh player before expanding scope

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
- M26.1 Critical map interaction recovery ✅
- M27 Causal storytelling map ✅
- M28 Global atmospheric circulation interactive reference 🟨

## Current work

The vertical slice lives in `app/games/climate-detective/` and launches as a separate Climate Detective surface from the Atlas map. Existing 15-world registry and advanced-world infrastructure remain unchanged. M25 Mission 01 recovery, M26.1 visible-pointer recovery and M27 causal storytelling remain verified. Mission 02 expansion remains frozen for the required stop-and-reassess.

M28 is now scoped as a reusable reference opened from Mission 01. It will use
Natural Earth global country geometry with an Equal Earth projection. Its
idealised pressure belts, circulation cells and wind belts will be stored as a
teaching model, separate from the NASA POWER/MERRA-2 historical weather data.
The first implementation must preserve Mission 01 state while open and return
to the same causal map evidence.

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
- Reopened M26 after a real-user deployed replay showed `0/3 clues pinned` remained unchanged after clicking the visible L, H, London and nearby contour.
- Confirmed on deployed version 114 that the visible SVG pressure centre receives the browser hit, while the invisible HTML target is positioned at a different coordinate because the SVG uses default `preserveAspectRatio` letterboxing; the parent SVG also captures every pointer on `pointerdown` for panning.
- Recorded M26.1 as the active blocker; no Mission 02 expansion is being started.
- Added an interactive-descendant guard so the SVG pan surface cannot capture pointer input that begins on a map feature.
- Replaced the mismatched fallback hit geometry with rendered SVG hit areas: the visible pressure group has a 120×60 viewBox target, and Wind/Rain signals have full feature hit areas with keyboard activation.
- Moved the pressure tutorial away from the low centre, added the visible map interaction instruction, and added wrong H, London and contour teaching feedback.
- Removed the legacy HTML map-target overlays entirely, so the accessibility tree and pointer path contain one rendered target per feature.
- Added `verify-m26-1-pointer.cjs`: visible circle, L text, 963 hPa label, edge, H, London, contour, keyboard, mobile pointer and mobile touch checks all pass.
- Replayed the complete local flow through Task 1 → Task 2 → Task 3 → Explain → Forecast → Reveal and the full 2018 year; the end assessment reached 3/3 cases and 31 points with zero browser console errors.
- Published exact app source commit `a2716f522291005deedae24d50faa679d04ee184` as private Site version 116; deployment `appgdep_6aa586a993588191bcb11c64978c6a22` succeeded.
- Replayed version 116 in the deployed Chrome tab with real pointer coordinates: L circle, H, London, contour, Wind, Rain, wrong-order recovery, forecast and reveal all produced visible results.
- Started M27 after a local Explain audit: the former animated event pulse was an unexplained circle and has been removed; legitimate observation locations remain labelled in the map legend.
- Added one-per-attempt semantic causal shuffling, deterministic prefix progression, targeted wrong-order feedback, formative field-note feedback and a visible Forecast bridge.
- Added progressive story visuals: data-derived low and contours, daily pressure trend/low-centre trail, measured wind FROM/TO vectors, labelled Atlantic air-mass interpretation, and a clearly marked SVG/CSS teaching-model rainfall inset.
- Added Story So Far, completed-link focus, Replay, Previous and Next controls; added reduced-motion protection for automatic replay and anchored the Explain story dates to 14–16 Jan 2018 during Reveal.
- Local M27 Explain → Forecast → Reveal visual pass completed; deployed version 117 replay also passed with the same causal visuals beside the actual historical Reveal.
- Read and accepted the M28 scope: interactive global atmospheric circulation,
  progressive Guided/Explore modes, Coriolis demos, wind FROM convention,
  Britain context, and a real 15 Jan 2018 bridge; the supplied mock-up remains
  a design reference only.
- Confirmed the current checkout has no global geometry asset. Extended the
  existing Natural Earth preparation script to emit the complete 1:110m
  admin-0 world geometry alongside the regional Mission 01 subset.
- Selected Equal Earth for the teaching map to avoid Web Mercator’s misleading
  polar distortion; the projection decision and source provenance remain
  documented in the M28 plan and data-source notes.
- Published exact M27 commit `85cd9b311d5e75ce611fee884cbfa117b4c006a4` as private Site version 117; deployment `appgdep_6aa59b292c4c81919ae47dfffc921374` succeeded and owner-only access remained unchanged.
- Started M27 after a local Explain audit: the former animated event pulse was an unexplained circle and has been removed; legitimate observation locations remain labelled in the map legend.
- Added one-per-attempt semantic causal shuffling, deterministic prefix progression, targeted wrong-order feedback, formative field-note feedback and a visible Forecast bridge.
- Added progressive story visuals: data-derived low and contours, daily pressure trend/low-centre trail, measured wind FROM/TO vectors, labelled Atlantic air-mass interpretation, and a clearly marked SVG/CSS teaching-model rainfall inset.
- Added Story So Far, completed-link focus, Replay, Previous and Next controls; added reduced-motion protection for automatic replay and anchored the Explain story dates to 14–16 Jan 2018 during Reveal.
- Local M27 Explain → Forecast → Reveal visual pass completed; deployed M27 replay and persistent evidence remain pending.

## Tests

- `npm test`: 156 tests passed, including Climate Detective data/rules, causal-story shuffle/prefix feedback, recovery-lock, and wrong/excessive/hint scoring tests.
- `npm run lint`: passed.
- `npm test` build stage: Vinext build completed; only a non-fatal >500 kB chunk warning remains.
- `npm test` rendered HTML stage: 2 tests passed.
- `node scripts/climate-detective/verify-m26-1-pointer.cjs`: 10/10 rendered-pointer, keyboard and touch checks passed locally.
- `node scripts/climate-detective/capture-recovery-evidence.cjs`: complete local Mission 01 + full-year flow passed; `browser-console.json` reports `errors: []`.
- `node scripts/climate-detective/verify-m27-story.cjs`: desktop causal-story, wrong-order repair, focus/replay, field note, Forecast → Reveal, 390 × 844 reduced-motion flow passed; 10 screenshots captured; `browser-console-m27.json` reports `errors: []`.
- Deployed Chrome replay: version 116 reached Reveal with `16 Jan 2018`, actual `4.0°C / 985 hPa / 0.4 mm`, and `12/14`.
- M28 pre-implementation baseline: working tree was clean before scope work;
  M27 source remains unchanged apart from documentation/data-preparation
  additions; full M28 UI and deployed QA are still pending.

## Evidence

- Official source notes: `docs/climate-detective/DATA_SOURCES.md`
- Scientific decisions: `docs/climate-detective/SCIENTIFIC_ASSUMPTIONS.md`
- Gameplay brief: `docs/climate-detective/GAME_DESIGN.md`
- Candidate-year decision: `docs/climate-detective/CANDIDATE_YEAR_REPORT.md`
- Evidence ledger: `docs/climate-detective/EVIDENCE.md`
- Generated dataset: `app/games/climate-detective/data/year-2018.json`
- Recovery contract and acceptance checklist: `docs/climate-detective/GAMEPLAY_RECOVERY.md`
- Local browser captures: desktop fresh-player/V2 flow and mobile 390×844 Task 1 pressure state, 2026-09-12.
- Deployed Site: `https://the-axiom-atlas.ckstks246335.chatgpt.site` — version 116, exact app commit `a2716f522291005deedae24d50faa679d04ee184`, deployment `appgdep_6aa586a993588191bcb11c64978c6a22` succeeded 2026-09-12; owner-only custom access preserved.
- Additional browser smoke: wrong H target feedback, duplicate clue deduplication, hint, Restart, reload, and keyboard map-target activation, 2026-09-11.
- Persistent screenshot set: `docs/climate-detective/evidence/` (17 PNGs plus `browser-console.json`; latest local capture completed with `errors: []`).
- M26 V2 evidence: `docs/climate-detective/evidence/` contains fresh objective, Pressure OFF/ON, Hint 4, selected-low, clues-complete, Wind, Rainfall, Explain incomplete/feedback, Forecast locked/unlocked, Prediction, Reveal, mobile and year-end screenshots; `browser-console.json` records `errors: []`.
- M26.1 pointer evidence: `verify-m26-1-pointer.cjs` records 10/10 local checks; deployed replay recorded visible-coordinate results for L circle, L text, 963 hPa label, marker edge, H, London, contour, Wind, Rain, keyboard, Task 1–3 and Reveal.
- App source checkpoint `ffdda035fe8aa3c8afde34871f4e1bc3dab42241` was published as private Site version 114; deployment succeeded at `https://the-axiom-atlas.ckstks246335.chatgpt.site`.

## Known problems

- The current atmospheric data is NASA POWER/MERRA-2 gridded analysis rather than a station observation or operational forecast; the UI labels this explicitly.
- ERA5 is deferred because the CDS download path requires account-backed access in this environment.
- The M26.1 interaction blocker is resolved and the deployed Gameplay E2E / Fresh-player gate is verified. The earlier `errors: []` result remains documented as a false positive because it proved console silence, not visible pointer success.
- The broader M24 release gate, curriculum coverage and future mission expansion remain separately tracked and frozen.
- M27 verified gate: a fresh deployed player saw each causal reveal, recovered from wrong order, used focus/replay, completed the field note and reached the historical Reveal with the same story visuals.
- M28 is not yet verified. The world geometry file and interactive reference
  are newly scoped; no production feature should claim global circulation until
  its historical/model distinction and deployed replay are evidenced.

## Decisions needed

- None at this checkpoint. A decision gate will be raised only if authoritative data or licensing materially conflict.

## Next three actions

1. Add the separate teaching-model data module and Equal Earth world map.
2. Implement Guided/Explore circulation stages with explicit model/data labels.
3. Run local and deployed M28 E2E/mobile/accessibility checks before marking any item VERIFIED.
